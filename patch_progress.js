const fs = require('fs');
let code = fs.readFileSync('src/utils/downloader.js', 'utf8');

// 1. Update fetchArrayBuffer definition
code = code.replace(
    /const fetchArrayBuffer = \(url, timeoutMs = 120000, maxRetries = 2\) => \{/,
    'const fetchArrayBuffer = (url, timeoutMs = 120000, maxRetries = 2, onProgress) => {'
);

// 2. Update fetch logic
const fetchLogicOld = \                        if (response.ok) {
                            const buffer = await response.arrayBuffer();
                            resolve(buffer);
                            return;
                        } else if\;
const fetchLogicNew = \                        if (response.ok) {
                            const contentLength = response.headers.get('content-length');
                            const total = contentLength ? parseInt(contentLength, 10) : 0;
                            if (response.body && onProgress && total > 0) {
                                const reader = response.body.getReader();
                                let receivedLength = 0;
                                let chunks = [];
                                while(true) {
                                    const {done, value} = await reader.read();
                                    if (done) break;
                                    chunks.push(value);
                                    receivedLength += value.length;
                                    onProgress(receivedLength, total);
                                }
                                let chunksAll = new Uint8Array(receivedLength);
                                let position = 0;
                                for(let chunk of chunks) {
                                    chunksAll.set(chunk, position);
                                    position += chunk.length;
                                }
                                resolve(chunksAll.buffer);
                            } else {
                                const buffer = await response.arrayBuffer();
                                resolve(buffer);
                            }
                            return;
                        } else if\;
code = code.replace(fetchLogicOld, fetchLogicNew);

// 3. Update GM_xmlhttpRequest logic
const gmOld = \                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: url,
                        timeout: timeoutMs,
                        responseType: 'arraybuffer',\;
const gmNew = \                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: url,
                        timeout: timeoutMs,
                        responseType: 'arraybuffer',
                        onprogress: (e) => {
                            if (onProgress && e.lengthComputable) {
                                onProgress(e.loaded, e.total);
                            }
                        },\;
code = code.replace(gmOld, gmNew);

// 4. Update downloadWithTags
const tagOld = \                progressContainer.style.display = 'none';
                downloadText.textContent = 'Downloading... (0MB)';

                const [audioBuffer, coverBuffer] = await Promise.all([
                    fetchArrayBuffer(downloadUrl),
                    meta.coverUrl ? fetchArrayBuffer(meta.coverUrl, 30000).catch(e => {
                        console.warn('Could not fetch high-res cover art, trying fallback:', e);\;
const tagNew = \                progressContainer.style.display = 'flex';
                downloadText.textContent = 'Downloading... (0.0MB)';
                
                const onProgress = (loaded, total) => {
                    const percent = Math.min((loaded / total) * 100, 100);
                    progressFill.style.width = percent + '%';
                    progressText.textContent = Math.round(percent) + '%';
                    downloadText.textContent = \Downloading... (\MB)\;
                };

                const [audioBuffer, coverBuffer] = await Promise.all([
                    fetchArrayBuffer(downloadUrl, 120000, 2, onProgress),
                    meta.coverUrl ? fetchArrayBuffer(meta.coverUrl, 30000).catch(e => {
                        console.warn('Could not fetch high-res cover art, trying fallback:', e);\;
code = code.replace(tagOld, tagNew);

fs.writeFileSync('src/utils/downloader.js', code);
console.log('Progress logic injected successfully!');
