    async function startDownloadVideoOrAudio(format, container) {
        const videoURL = window.location.href;
        // Notify('info', 'Starting download...');

        // Check if already downloading
        if (container.dataset.downloading === 'true') {
            return;
        }

        // Stop any previous poller (avoid leaks on retry)
        try {
            if (container.__ytDownloadPoll) {
                clearInterval(container.__ytDownloadPoll);
                container.__ytDownloadPoll = null;
            }
        } catch (e) { }

        // Get UI elements from the container
        const downloadBtn = container.querySelector('.download-btn');
        const retryBtn = container.querySelector('.retry-btn');
        const progressRetryBtn = container.querySelector('.progress-retry-btn');
        const downloadAgainBtn = container.querySelector('.download-again-btn');
        const progressContainer = container.querySelector('.progress-container');
        const progressFill = container.querySelector('.progress-fill');
        const progressText = container.querySelector('.progress-text');
        const downloadText = container.querySelector('.download-text');

        // Set downloading flag
        container.dataset.downloading = 'true';
        container.dataset.urlOpened = 'false';
        container.dataset.lastDownloadUrl = '';

        // Update UI to show progress
        downloadBtn.style.display = 'none';
        retryBtn.style.display = 'none';
        progressRetryBtn.style.display = 'block';
        if (downloadAgainBtn) downloadAgainBtn.style.display = 'none';
        progressContainer.style.display = 'flex';
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        const fetchJsonWithTimeout = (url, timeoutMs = 20000) => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    timeout: timeoutMs,
                    responseType: 'json',
                    onload: (response) => {
                        if (response.status >= 200 && response.status < 300) {
                            resolve(response.response);
                        } else {
                            reject(new Error(`HTTP ${response.status}`));
                        }
                    },
                    onerror: () => reject(new Error('Network error')),
                    ontimeout: () => reject(new Error('Request timed out')),
                });
            });
        };

        const setErrorState = () => {
            retryBtn.style.display = 'block';
            progressContainer.style.display = 'none';
            progressRetryBtn.style.display = 'none';
            if (downloadAgainBtn) downloadAgainBtn.style.display = 'none';
            container.dataset.downloading = 'false';
            container.dataset.urlOpened = 'false';
            container.dataset.lastDownloadUrl = '';
        };

        // Helper: fetch arraybuffer, trying native fetch first (to bypass strict extension blocking), fallback to GM_xmlhttpRequest
        const fetchArrayBuffer = (url, timeoutMs = 120000, maxRetries = 2) => {
            return new Promise((resolve, reject) => {
                const attempt = async (retriesLeft) => {
                    try {
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), timeoutMs);
                        const response = await fetch(url, { signal: controller.signal });
                        clearTimeout(id);
                        if (response.ok) {
                            const buffer = await response.arrayBuffer();
                            resolve(buffer);
                            return;
                        } else if (response.status >= 500 && retriesLeft > 0) {
                            console.warn(`fetch HTTP ${response.status} for ${url}, retrying...`);
                            setTimeout(() => attempt(retriesLeft - 1), 2000);
                            return;
                        }
                    } catch (err) {
                        // fetch failed (CORS or network error), fallback to GM_xmlhttpRequest
                    }

                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: url,
                        timeout: timeoutMs,
                        responseType: 'arraybuffer',
                        onload: (r) => {
                            if (r.status >= 200 && r.status < 300) {
                                resolve(r.response);
                            } else if (r.status >= 500 && retriesLeft > 0) {
                                console.warn(`GM HTTP ${r.status} fetching ${url}, retrying...`);
                                setTimeout(() => attempt(retriesLeft - 1), 2000);
                            } else {
                                reject(new Error(`HTTP ${r.status}`));
                            }
                        },
                        onerror: () => {
                            if (retriesLeft > 0) setTimeout(() => attempt(retriesLeft - 1), 2000);
                            else reject(new Error('Network error'));
                        },
                        ontimeout: () => {
                            if (retriesLeft > 0) setTimeout(() => attempt(retriesLeft - 1), 2000);
                            else reject(new Error('Timeout'));
                        },
                    });
                };
                attempt(maxRetries);
            });
        };

        // Helper: get media metadata from DOM
        const getMediaMeta = () => {
            const meta = { title: 'download', artist: '', album: '', year: '', coverUrl: '' };
            try {
                if (isYTMusic) {
                    meta.title = $e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music';
                    // Language-independent extraction:
                    // Official songs have links for Artist and Album. Videos only have a link for the Channel.
                    // Example Song: <a href="...">Artist</a> • <a href="...">Album</a> • <span>2024</span>
                    // Example Video: <a href="...">Channel</a> • <span>15M views</span> • <span>111K likes</span>
                    const bylineEl = $e('ytmusic-player-bar .byline');
                    if (bylineEl) {
                        const links = Array.from(bylineEl.querySelectorAll('a')).map(a => a.textContent.trim());
                        if (links.length > 0) meta.artist = links[0];
                        if (links.length > 1) meta.album = links[1]; // Only songs have a second link for the Album

                        // The year is always the last part of the string, if it's a 4-digit number
                        const parts = bylineEl.getAttribute('title')?.split(' • ') || [];
                        const lastPart = parts[parts.length - 1]?.trim();
                        if (lastPart && lastPart.match(/^\d{4}$/)) {
                            meta.year = lastPart;
                        }
                    }
                    // cover art - get high-res version
                    const coverImg = $e('ytmusic-player-bar .image img') || $e('ytmusic-player-bar img');
                    if (coverImg?.src) {
                        let src = coverImg.src;
                        if (src.includes('=w')) {
                            src = src.replace(/=w\d+-h\d+.*$/, '=w1000-h1000-l90-rj');
                        } else if (src.includes('i.ytimg.com/vi/')) {
                            src = src.replace(/(hqdefault|mqdefault|sddefault|default)\.jpg/, 'maxresdefault.jpg');
                        }
                        meta.coverUrl = src;
                    }
                } else {
                    meta.title = $e('h1.style-scope.ytd-watch-metadata')?.innerText?.trim() || 'video';
                    meta.artist = $e('#owner #channel-name a')?.textContent?.trim() || '';
                }
            } catch (e) { console.warn('Error reading media meta:', e); }
            return meta;
        };

        // Helper: trigger blob download via <a> element
        const triggerBlobDownload = (blob, fileName) => {
            const blobUrl = URL.createObjectURL(blob);
            const a = $cl('a');
            a.href = blobUrl;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        };

        // ── MP3: embed ID3v2 tags via browser-id3-writer ──
        const tagMp3 = async (audioBuffer, meta, coverBuffer) => {
            const writer = new ID3Writer(audioBuffer);
            writer.setFrame('TIT2', meta.title);
            if (meta.artist) writer.setFrame('TPE1', [meta.artist]);
            if (meta.album) writer.setFrame('TALB', meta.album);
            if (meta.year) writer.setFrame('TYER', parseInt(meta.year) || 0);
            if (coverBuffer) {
                writer.setFrame('APIC', { type: 3, data: coverBuffer, description: 'Cover' });
            }
            writer.addTag();
            return writer.getBlob();
        };

        // ── FLAC: embed Vorbis Comments metadata block ──
        const tagFlac = (audioBuffer, meta, coverBuffer) => {
            const src = new Uint8Array(audioBuffer);
            // Verify FLAC magic: "fLaC"
            if (src[0] !== 0x66 || src[1] !== 0x4C || src[2] !== 0x61 || src[3] !== 0x43) {
                throw new Error('Not a valid FLAC file');
            }

            const enc = new TextEncoder();
            // Build Vorbis Comment fields
            const vendor = enc.encode('youtube-tools');
            const fields = [];
            if (meta.title) fields.push(enc.encode('TITLE=' + meta.title));
            if (meta.artist) fields.push(enc.encode('ARTIST=' + meta.artist));
            if (meta.album) fields.push(enc.encode('ALBUM=' + meta.album));
            if (meta.year) fields.push(enc.encode('DATE=' + meta.year));

            // Calculate Vorbis Comment block size
            let vcSize = 4 + vendor.length + 4; // vendor length + vendor + field count
            for (const f of fields) vcSize += 4 + f.length;

            // Build PICTURE block if cover exists
            let picBlock = null;
            if (coverBuffer) {
                // Detect actual image format from magic bytes (YouTube often returns WebP)
                const cArr = new Uint8Array(coverBuffer);
                let mimeType = 'image/jpeg';
                if (cArr.length > 12) {
                    if (cArr[0] === 0xFF && cArr[1] === 0xD8 && cArr[2] === 0xFF) mimeType = 'image/jpeg';
                    else if (cArr[0] === 0x89 && cArr[1] === 0x50 && cArr[2] === 0x4E && cArr[3] === 0x47) mimeType = 'image/png';
                    else if (cArr[0] === 0x52 && cArr[1] === 0x49 && cArr[2] === 0x46 && cArr[3] === 0x46 &&
                             cArr[8] === 0x57 && cArr[9] === 0x45 && cArr[10] === 0x42 && cArr[11] === 0x50) {
                        mimeType = 'image/webp';
                    }
                }
                const mimeBytes = enc.encode(mimeType);
                const descBytes = enc.encode('Cover');
                // PICTURE: type(4) + mime_len(4) + mime + desc_len(4) + desc + width(4) + height(4) + bpp(4) + colors(4) + data_len(4) + data
                const picDataLen = 4 + 4 + mimeBytes.length + 4 + descBytes.length + 4 * 4 + 4 + coverBuffer.byteLength;
                picBlock = new Uint8Array(picDataLen);
                const dv = new DataView(picBlock.buffer);
                let o = 0;
                dv.setUint32(o, 3); o += 4; // type: Cover (front)
                dv.setUint32(o, mimeBytes.length); o += 4;
                picBlock.set(mimeBytes, o); o += mimeBytes.length;
                dv.setUint32(o, descBytes.length); o += 4;
                picBlock.set(descBytes, o); o += descBytes.length;
                dv.setUint32(o, 1000); o += 4; // width
                dv.setUint32(o, 1000); o += 4; // height
                dv.setUint32(o, 24); o += 4;  // bpp
                dv.setUint32(o, 0); o += 4;   // indexed colors
                dv.setUint32(o, coverBuffer.byteLength); o += 4;
                picBlock.set(new Uint8Array(coverBuffer), o);
            }

            // Scan existing metadata blocks, keep valid ones, discard old VC (4) and PICTURE (6)
            let pos = 4; // after "fLaC"
            const keptBlocks = [];
            while (pos < src.length) {
                const header = src[pos];
                const type = header & 0x7F;
                const isLast = !!(header & 0x80);
                const blockLen = (src[pos + 1] << 16) | (src[pos + 2] << 8) | src[pos + 3];
                const blockEnd = pos + 4 + blockLen;
                
                // Drop existing VORBIS_COMMENT and PICTURE blocks
                if (type !== 4 && type !== 6) {
                    // clear the last-block flag (we will set it on our injected blocks later)
                    const blockData = new Uint8Array(src.buffer, pos, 4 + blockLen);
                    blockData[0] = blockData[0] & 0x7F; 
                    keptBlocks.push(blockData);
                }
                
                pos = blockEnd;
                if (isLast) break;
            }
            
            const audioFrames = new Uint8Array(src.buffer, pos);

            // Build new Vorbis Comment block header (type 4)
            const vcHeader = new Uint8Array(4);
            vcHeader[0] = picBlock ? 4 : (4 | 0x80); // type 4, set last-flag if no picture
            vcHeader[1] = (vcSize >> 16) & 0xFF;
            vcHeader[2] = (vcSize >> 8) & 0xFF;
            vcHeader[3] = vcSize & 0xFF;

            // Build VC data
            const vcData = new Uint8Array(vcSize);
            const vcDv = new DataView(vcData.buffer);
            let vp = 0;
            vcDv.setUint32(vp, vendor.length, true); vp += 4; // little-endian!
            vcData.set(vendor, vp); vp += vendor.length;
            vcDv.setUint32(vp, fields.length, true); vp += 4;
            for (const f of fields) {
                vcDv.setUint32(vp, f.length, true); vp += 4;
                vcData.set(f, vp); vp += f.length;
            }

            // Build PICTURE block header (type 6) if needed
            let picHeader = null;
            if (picBlock) {
                picHeader = new Uint8Array(4);
                picHeader[0] = 6 | 0x80; // type 6 (PICTURE), last block
                picHeader[1] = (picBlock.length >> 16) & 0xFF;
                picHeader[2] = (picBlock.length >> 8) & 0xFF;
                picHeader[3] = picBlock.length & 0xFF;
            }

            // Assemble new blocks
            const newBlocks = [...keptBlocks, new Uint8Array([...vcHeader, ...vcData])];
            if (picHeader && picBlock) {
                newBlocks.push(new Uint8Array([...picHeader, ...picBlock]));
            }
            
            // Set the last-block flag on the very last metadata block
            const lastMetaBlock = newBlocks[newBlocks.length - 1];
            lastMetaBlock[0] = lastMetaBlock[0] | 0x80;

            // Assemble final file: "fLaC" + newBlocks + audioFrames
            const parts = [new Uint8Array([0x66, 0x4C, 0x61, 0x43]), ...newBlocks, audioFrames];
            const totalLen = parts.reduce((s, p) => s + p.length, 0);
            const result = new Uint8Array(totalLen);
            let offset = 0;
            for (const p of parts) {
                result.set(p, offset);
                offset += p.length;
            }
            return new Blob([result], { type: 'audio/flac' });
        };

        // ── WAV: embed RIFF LIST-INFO chunk ──
        const tagWav = (audioBuffer, meta) => {
            const enc = new TextEncoder();
            // Build INFO sub-chunks: INAM (title), IART (artist), IPRD (album), ICRD (year)
            const infoFields = [];
            if (meta.title) infoFields.push(['INAM', meta.title]);
            if (meta.artist) infoFields.push(['IART', meta.artist]);
            if (meta.album) infoFields.push(['IPRD', meta.album]);
            if (meta.year) infoFields.push(['ICRD', meta.year]);

            if (infoFields.length === 0) return new Blob([audioBuffer], { type: 'audio/wav' });

            // Calculate LIST-INFO chunk size
            let infoSize = 4; // "INFO"
            for (const [, val] of infoFields) {
                const valBytes = enc.encode(val + '\0');
                infoSize += 4 + 4 + valBytes.length; // id(4) + size(4) + data
                if (valBytes.length % 2 !== 0) infoSize += 1; // pad
            }

            const listChunk = new Uint8Array(8 + infoSize);
            const ldv = new DataView(listChunk.buffer);
            listChunk.set(enc.encode('LIST'), 0);
            ldv.setUint32(4, infoSize, true);
            listChunk.set(enc.encode('INFO'), 8);
            let lp = 12;
            for (const [id, val] of infoFields) {
                const valBytes = enc.encode(val + '\0');
                listChunk.set(enc.encode(id), lp); lp += 4;
                ldv.setUint32(lp, valBytes.length, true); lp += 4;
                listChunk.set(valBytes, lp); lp += valBytes.length;
                if (valBytes.length % 2 !== 0) { listChunk[lp] = 0; lp += 1; }
            }

            // Update RIFF header size
            const src = new Uint8Array(audioBuffer);
            const oldSize = new DataView(audioBuffer).getUint32(4, true);
            const newSrc = new Uint8Array(src.length);
            newSrc.set(src);
            new DataView(newSrc.buffer).setUint32(4, oldSize + listChunk.length, true);

            return new Blob([newSrc, listChunk], { type: 'audio/wav' });
        };

        // ── Fetch via GM_xmlhttpRequest for CSP bypass ──
        const fetchBlobUrlGM = (url, mimeType) => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    responseType: 'arraybuffer',
                    onload: (res) => {
                        if (res.status >= 200 && res.status < 300) {
                            const blob = new Blob([res.response], { type: mimeType });
                            resolve(URL.createObjectURL(blob));
                        } else {
                            reject(new Error(`HTTP ${res.status}`));
                        }
                    },
                    onerror: reject
                });
            });
        };

        // Helper: fetch text, trying native fetch first, fallback to GM_xmlhttpRequest
        const fetchText = (url, timeoutMs = 120000) => {
            return new Promise((resolve, reject) => {
                const attempt = async () => {
                    try {
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), timeoutMs);
                        const response = await fetch(url, { signal: controller.signal });
                        clearTimeout(id);
                        if (response.ok) {
                            resolve(await response.text());
                            return;
                        }
                    } catch (err) {}
                    
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: url,
                        timeout: timeoutMs,
                        onload: (r) => {
                            if (r.status >= 200 && r.status < 300) resolve(r.responseText);
                            else reject(new Error(`HTTP ${r.status}`));
                        },
                        onerror: () => reject(new Error('Network error')),
                        ontimeout: () => reject(new Error('Timeout'))
                    });
                };
                attempt();
            });
        };

        // ── M4A: embed metadata using ffmpeg-core directly (No Web Workers!) ──
        const tagM4a = async (audioBuffer, meta, coverBuffer) => {
            downloadText.textContent = 'Loading FFmpeg Core (30MB)...';

            // Fetch core JS and evaluate in main thread
            const coreJsText = await fetchText('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js');

            // Fetch WASM binary
            const wasmBuffer = await fetchArrayBuffer('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm');

            // Evaluate the core JS to get createFFmpegCore globally
            // TrustedTypes bypass for eval/inline script
            const script = document.createElement('script');
            let safeCode = coreJsText + '\nwindow.createFFmpegCore = createFFmpegCore;\n';
            if (window.trustedTypes) {
                const policyNames = ['default', 'ffmpeg-tt', 'dompurify', 'polymer-html-default', 'goog#html', 'youtube-music'];
                let ttPolicy;
                for (const name of policyNames) {
                    try { ttPolicy = window.trustedTypes.createPolicy(name, { createScriptURL: s => s, createScript: s => s }); if (ttPolicy) break; } catch(e) {}
                }
                if (ttPolicy) safeCode = ttPolicy.createScript(safeCode);
            }
            script.textContent = safeCode;
            document.body.appendChild(script);

            downloadText.textContent = 'Initializing FFmpeg...';
            
            if (typeof createFFmpegCore === 'undefined') throw new Error('Failed to evaluate FFmpeg core');
            
            const core = await createFFmpegCore({
                wasmBinary: wasmBuffer,
                print: (msg) => console.log('[ffmpeg]', msg),
                printErr: (msg) => console.error('[ffmpeg]', msg)
            });

            // Write input
            core.FS.writeFile('input.m4a', new Uint8Array(audioBuffer));
            
            // Validate input audio stream
            downloadText.textContent = 'Validating Audio...';
            const validateArgs = ['-v', 'error', '-i', 'input.m4a', '-f', 'null', '-'];
            const validateExitCode = core.exec(...validateArgs);
            if (validateExitCode !== 0) {
                throw new Error('Server returned a corrupted M4A file');
            }
            
            downloadText.textContent = 'Muxing M4A...';
            
            if (coverBuffer) {
                core.FS.writeFile('cover.jpg', new Uint8Array(coverBuffer));
            }

            // Build arguments
            const args = ['-i', 'input.m4a'];
            if (coverBuffer) {
                args.push('-i', 'cover.jpg', '-map', '0:a', '-map', '1:v', '-c:v', 'copy', '-disposition:v', 'attached_pic');
            }
            args.push('-c:a', 'copy', '-movflags', '+faststart');
            
            // Add metadata tags
            if (meta.title) args.push('-metadata', `title=${meta.title}`);
            if (meta.artist) args.push('-metadata', `artist=${meta.artist}`);
            if (meta.album) args.push('-metadata', `album=${meta.album}`);
            
            args.push('output.m4a');

            console.log('[ffmpeg] Executing:', args.join(' '));
            const exitCode = core.exec(...args);
            if (exitCode !== 0) throw new Error('FFmpeg failed with exit code ' + exitCode);

            const outData = core.FS.readFile('output.m4a');
            return new Blob([outData.buffer], { type: 'audio/mp4' });
        };

        // ── Main: download audio with metadata tags ──
        const downloadWithTags = async (downloadUrl, fileName, fmtLower) => {
            const meta = getMediaMeta();
            downloadText.textContent = 'Adding metadata...';

            try {
                const audioBuffer = await fetchArrayBuffer(downloadUrl);
                let coverBuffer = null;

                // Fetch cover art (for MP3, FLAC, and M4A)
                if (meta.coverUrl && (fmtLower === 'mp3' || fmtLower === 'flac' || fmtLower === 'm4a')) {
                    try {
                        coverBuffer = await fetchArrayBuffer(meta.coverUrl, 15000);
                    } catch (e) { 
                        console.warn('Could not fetch high-res cover art, trying fallback:', e);
                        if (meta.coverUrl.includes('maxresdefault.jpg')) {
                            try {
                                coverBuffer = await fetchArrayBuffer(meta.coverUrl.replace('maxresdefault.jpg', 'hqdefault.jpg'), 15000);
                            } catch (e2) { console.warn('Could not fetch fallback cover art either:', e2); }
                        }
                    }
                }

                let blob;
                if (fmtLower === 'mp3' && typeof ID3Writer !== 'undefined') {
                    blob = await tagMp3(audioBuffer, meta, coverBuffer);
                } else if (fmtLower === 'flac') {
                    blob = tagFlac(audioBuffer, meta, coverBuffer);
                } else if (fmtLower === 'wav') {
                    blob = tagWav(audioBuffer, meta);
                } else if (fmtLower === 'm4a') {
                    blob = await tagM4a(audioBuffer, meta, coverBuffer);
                } else {
                    throw new Error('Unsupported format for tagging: ' + fmtLower);
                }

                triggerBlobDownload(blob, fileName);
                downloadText.textContent = 'Download Complete!';
                console.log('✅ Downloaded with metadata:', fmtLower.toUpperCase(), meta);
            } catch (e) {
                console.warn('Metadata tagging failed:', e);
                const msg = e.message || '';
                if (msg.includes('corrupted') || msg.includes('HTTP ')) {
                    throw e; // Bubble up to trigger server fallback
                }
                downloadText.textContent = 'Tagging failed, downloading direct...';
                GM_download({
                    url: downloadUrl,
                    name: fileName,
                    onerror: (err) => {
                        console.error('GM_download failed:', err);
                        downloadText.textContent = '❌ Download Error';
                        progressFill.style.backgroundColor = '#ff4444';
                    }
                });
            }
        };

        const markCompleteAndOpen = (downloadUrl) => {
            if (!downloadUrl) {
                setErrorState();
                return;
            }
            // Save for the \"download again\" button
            container.dataset.lastDownloadUrl = String(downloadUrl);
            // Check if URL was already opened
            if (container.dataset.urlOpened === 'true') return;
            // Mark URL as opened
            container.dataset.urlOpened = 'true';
            // Update UI to show completion
            container.classList.add('completed');
            container.classList.remove('video', 'audio');
            downloadText.textContent = 'Processing...';
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            progressRetryBtn.style.display = 'none';
            if (downloadAgainBtn) downloadAgainBtn.style.display = 'flex';
            container.dataset.downloading = 'false';
            try {
                const rawTitle = isYTMusic
                    ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
                    : ($e('h1.style-scope.ytd-watch-metadata')?.innerText?.trim() || 'video');
                const title = rawTitle.replace(/[\\/:*?"<>|]/g, '_').trim() || 'download';
                const fmtLower = String(format).toLowerCase();
                const isAudio = ['mp3', 'flac', 'wav', 'ogg', 'aac', 'm4a', 'webm'].includes(fmtLower);
                const ext = isAudio ? `.${fmtLower}` : '.mp4';
                const fileName = title + ext;

                // For supported audio formats: embed metadata tags
                const taggableFormats = ['mp3', 'flac', 'wav', 'm4a'];
                if (taggableFormats.includes(fmtLower)) {
                    downloadWithTags(downloadUrl, fileName, fmtLower);
                } else {
                    GM_download({
                        url: downloadUrl,
                        name: fileName,
                        onerror: (err) => {
                            console.error('GM_download failed:', err);
                            downloadText.textContent = '❌ Server Error';
                            progressFill.style.backgroundColor = '#ff4444';
                        }
                    });
                }
            } catch (e) {
                console.error('Could not start download:', e);
                downloadText.textContent = '❌ Download Error';
                progressFill.style.backgroundColor = '#ff4444';
            }
        };

        const pollProgressUrl = (progressURL) => {
            return new Promise((resolve, reject) => {
                container.__ytDownloadPoll = setInterval(async () => {
                    try {
                        const progressData = await fetchJsonWithTimeout(progressURL, 15000);

                        const progress = Math.min((Number(progressData.progress) || 0) / 10, 100);
                        progressFill.style.width = `${progress}%`;
                        progressText.textContent = `${Math.round(progress)}%`;

                        if (Number(progressData.progress) >= 1000 && progressData.download_url) {
                            clearInterval(container.__ytDownloadPoll);
                            container.__ytDownloadPoll = null;
                            resolve(progressData.download_url);
                        }
                    } catch (e) {
                        console.error('Error in progress:', e);
                        clearInterval(container.__ytDownloadPoll);
                        container.__ytDownloadPoll = null;
                        reject(e);
                    }
                }, 3000);
            });
        };

        const trySaveNowProvider = async (baseUrl) => {
            const url = new URL('/ajax/download.php', baseUrl);
            url.searchParams.set('copyright', '0');
            url.searchParams.set('allow_extended_duration', '1');
            url.searchParams.set('format', String(format));
            url.searchParams.set('url', videoURL);
            url.searchParams.set('api', API_KEY_DEVELOPERMDCM);
            const data = await fetchJsonWithTimeout(url.toString(), 25000);
            if (!data?.success || !data?.progress_url) {
                throw new Error('SaveNow provider did not return success/progress_url');
            }
            return data;
        };

        const tryDubsProvider = async () => {
            const videoId = paramsVideoURL();
            if (!videoId) throw new Error('Missing videoId');

            const startUrl = new URL(DUBS_START_ENDPOINT);
            startUrl.searchParams.set('id', videoId);
            startUrl.searchParams.set('format', String(format));

            const startData = await fetchJsonWithTimeout(startUrl.toString(), 25000);
            if (!startData?.success || !startData?.progressId) {
                throw new Error('Dubs provider did not return success/progressId');
            }

            const statusUrl = new URL(DUBS_STATUS_ENDPOINT);
            statusUrl.searchParams.set('id', startData.progressId);

            return new Promise((resolve, reject) => {
                container.__ytDownloadPoll = setInterval(async () => {
                    try {
                        const st = await fetchJsonWithTimeout(statusUrl.toString(), 20000);
                        const rawProgress = Number(st?.progress) || 0; // 0..1000
                        const progress = Math.min(rawProgress / 10, 100);
                        progressFill.style.width = `${progress}%`;
                        progressText.textContent = `${Math.round(progress)}%`;

                        if (st?.finished && st?.downloadUrl) {
                            clearInterval(container.__ytDownloadPoll);
                            container.__ytDownloadPoll = null;
                            resolve(st.downloadUrl);
                        }
                    } catch (e) {
                        console.error('❌ Error polling dubs status:', e);
                        clearInterval(container.__ytDownloadPoll);
                        container.__ytDownloadPoll = null;
                        reject(e);
                    }
                }, 3000);
            });
        };

        const doDownloadProcess = async () => {
            for (const base of DOWNLOAD_API_FALLBACK_BASES) {
                try {
                    const started = await trySaveNowProvider(base);
                    if (started?.success && started?.progress_url) {
                        const downloadUrl = await pollProgressUrl(started.progress_url);
                        await markCompleteAndOpen(downloadUrl);
                        return;
                    }
                } catch (e) {
                    console.warn(`Provider ${base} failed:`, e);
                }
            }

            console.warn('All SaveNow providers failed, falling back to dubs.io');
            const dubsUrl = await tryDubsProvider();
            await markCompleteAndOpen(dubsUrl);
        };

        try {
            await doDownloadProcess();
        } catch (error) {
            setErrorState();
            console.error('❌ Error starting download:', error);
        }
    }





