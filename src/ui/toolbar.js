
    function buildYTMToolbar() {
        const main = document.createElement('main');
        main.className = 'yt-tools-container';

        const container = document.createElement('div');
        container.className = 'yt-tools-inner-container';

        const form = document.createElement('form');
        form.className = 'yt-tools-form';
        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'containerButtons';

        // Thumbnail (Image download)
        btnsDiv.appendChild(makeToolBtn('Image video', 'imagen', '', [
            'M0 0h24v24H0z', 'M15 8h.01',
            'M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5',
            'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4',
            'M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559',
            'M19 16v6', 'M22 19l-3 3l-3 -3'
        ]));

        // Repeat
        if (!isYTMusic) {
            btnsDiv.appendChild(makeToolBtn('Repeat video', 'repeatvideo', '', [
                'M0 0h24v24H0z',
                'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
                'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3'
            ]));
        }

        // Download MP4
        btnsDiv.appendChild(makeToolBtn('MP4', null, 'btn1', [
            'M0 0h24v24H0z', 'M14 3v4a1 1 0 0 0 1 1h4',
            'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
            'M12 17v-6', 'M9.5 14.5l2.5 2.5l2.5 -2.5'
        ]));

        // Download MP3
        btnsDiv.appendChild(makeToolBtn('MP3', null, 'btn2', [
            'M0 0h24v24H0z', 'M14 3v4a1 1 0 0 0 1 1h4',
            'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
            'M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M12 16l0 -5l2 1'
        ]));

        // Close
        btnsDiv.appendChild(makeToolBtn('Close', null, 'btn3', [
            'M0 0h24v24H0z',
            'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
            'M10 10l4 4m0 -4l-4 4'
        ]));

        if (!isYTMusic) {
            // Add Bookmark
            btnsDiv.appendChild(makeToolBtn('Add bookmark', 'yt-bookmark-add', '', [
                'M0 0h24v24H0z',
                'M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z',
                'M12 7v6', 'M9 10h6'
            ]));

            // Show Bookmarks
            btnsDiv.appendChild(makeToolBtn('Show bookmarks', 'yt-bookmark-toggle', '', [
                'M0 0h24v24H0z',
                'M9 6h11', 'M9 12h11', 'M9 18h11', 'M5 6h.01', 'M5 12h.01', 'M5 18h.01'
            ]));

            // History (Continue Watching)
            btnsDiv.appendChild(makeToolBtn('History', 'yt-cw-history-toggle', '', [
                'M0 0h24v24H0z',
                'M12 8v4l3 3', 'M3 12a9 9 0 1 0 3 -6.7', 'M3 4v4h4'
            ]));
        }

        // Picture-in-Picture
        btnsDiv.appendChild(makeToolBtn('Picture to picture', null, 'video_picture_to_picture', [
            'M0 0h24v24H0z',
            'M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4',
            'M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z'
        ]));

        // Screenshot
        btnsDiv.appendChild(makeToolBtn('Screenshot video', null, 'screenshot_video', [
            'M0 0h24v24H0z', 'M15 8h.01',
            'M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644',
            'M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644',
            'M4 8v-2a2 2 0 0 1 2 -2h2', 'M4 16v2a2 2 0 0 0 2 2h2',
            'M16 4h2a2 2 0 0 1 2 2v2', 'M16 20h2a2 2 0 0 0 2 -2v-2'
        ]));

        form.appendChild(btnsDiv);

        if (!isYTMusic) {
            const bookmarksPanel = document.createElement('div');
            bookmarksPanel.id = 'yt-bookmarks-panel';
            bookmarksPanel.className = 'yt-bookmarks-panel';
            bookmarksPanel.style.display = 'none';
            form.appendChild(bookmarksPanel);

            const historyPanel = document.createElement('div');
            historyPanel.id = 'yt-continue-watching-panel';
            historyPanel.className = 'yt-continue-watching-panel';
            historyPanel.style.display = 'none';
            form.appendChild(historyPanel);
        }

        // Download video quality select
        const videoForm = document.createElement('form');
        videoForm.className = 'formulariodescarga ocultarframe';
        const videoSelectDiv = document.createElement('div');
        videoSelectDiv.className = 'containerall';
        const videoSelect = document.createElement('select');
        videoSelect.className = 'selectcalidades ocultarframe';
        videoSelect.required = true;
        [['', 'Video Quality', true],
        ['144', '144p MP4'], ['240', '240p MP4'], ['360', '360p MP4'],
        ['480', '480p MP4'], ['720', '720p HD MP4 Default'],
        ['1080', '1080p FULL HD MP4'], ['1440', '1440p 2K WEBM'], ['4k', '2160p 4K WEBM'], ['8k', '4320p 8K WEBM']
        ].forEach(([val, text, dis]) => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = text;
            if (dis) { opt.selected = true; opt.disabled = true; }
            videoSelect.appendChild(opt);
        });
        videoSelectDiv.appendChild(videoSelect);

        // Download video container
        const dlVideoContainer = document.createElement('div');
        dlVideoContainer.id = 'descargando';
        dlVideoContainer.className = 'download-container ocultarframe';

        const dlInfo = document.createElement('div');
        dlInfo.className = 'download-info';
        const dlText = document.createElement('span');
        dlText.className = 'download-text';
        dlText.textContent = 'Download Video And Please Wait...';
        const dlQuality = document.createElement('span');
        dlQuality.className = 'download-quality';
        dlInfo.appendChild(dlText);
        dlInfo.appendChild(dlQuality);

        const dlActions = document.createElement('div');
        dlActions.className = 'download-actions';
        const dlBtn = document.createElement('button');
        dlBtn.className = 'download-btn video-btn';
        dlBtn.textContent = 'Download';
        const retryBtn = document.createElement('button');
        retryBtn.className = 'retry-btn';
        retryBtn.style.display = 'none';
        retryBtn.textContent = 'Retry';
        dlActions.appendChild(dlBtn);
        dlActions.appendChild(retryBtn);

        const progressC = document.createElement('div');
        progressC.className = 'progress-container';
        progressC.style.display = 'none';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressBar.appendChild(progressFill);
        const progressText = document.createElement('span');
        progressText.className = 'progress-text';
        progressText.textContent = '0%';
        progressC.appendChild(progressBar);
        progressC.appendChild(progressText);

        // progress-retry-btn and download-again-btn (required by startDownloadVideoOrAudio)
        const progRetryBtn = document.createElement('button');
        progRetryBtn.className = 'progress-retry-btn';
        progRetryBtn.title = 'Retry';
        progRetryBtn.style.display = 'none';
        progRetryBtn.textContent = '↻';
        const dlAgainBtn = document.createElement('button');
        dlAgainBtn.className = 'download-again-btn';
        dlAgainBtn.title = 'Download again';
        dlAgainBtn.style.display = 'none';
        dlAgainBtn.textContent = '⬇';

        dlVideoContainer.appendChild(progRetryBtn);
        dlVideoContainer.appendChild(dlAgainBtn);
        dlVideoContainer.appendChild(dlInfo);
        dlVideoContainer.appendChild(dlActions);
        dlVideoContainer.appendChild(progressC);
        videoSelectDiv.appendChild(dlVideoContainer);
        videoForm.appendChild(videoSelectDiv);

        // Download audio quality select
        const audioForm = document.createElement('form');
        audioForm.className = 'formulariodescargaaudio ocultarframe';
        const audioSelectDiv = document.createElement('div');
        audioSelectDiv.className = 'containerall';
        const audioSelect = document.createElement('select');
        audioSelect.className = 'selectcalidadesaudio ocultarframeaudio';
        audioSelect.required = true;
        [['', 'Audio Quality', true],
        ['flac', 'Audio FLAC UHQ'], ['wav', 'Audio WAV UHQ'],
        ['webm', 'Audio WEBM UHQ'], ['mp3', 'Audio MP3 Default'],
        ['m4a', 'Audio M4A'], ['aac', 'Audio AAC'],
        ['opus', 'Audio OPUS'], ['ogg', 'Audio OGG']
        ].forEach(([val, text, dis]) => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = text;
            if (dis) { opt.selected = true; opt.disabled = true; }
            audioSelect.appendChild(opt);
        });
        audioSelectDiv.appendChild(audioSelect);

        // Download audio container
        const dlAudioContainer = document.createElement('div');
        dlAudioContainer.id = 'descargandomp3';
        dlAudioContainer.className = 'download-container ocultarframeaudio';

        const dlInfoA = document.createElement('div');
        dlInfoA.className = 'download-info';
        const dlTextA = document.createElement('span');
        dlTextA.className = 'download-text';
        dlTextA.textContent = 'Download Audio And Please Wait...';
        const dlQualityA = document.createElement('span');
        dlQualityA.className = 'download-quality';
        dlInfoA.appendChild(dlTextA);
        dlInfoA.appendChild(dlQualityA);

        const dlActionsA = document.createElement('div');
        dlActionsA.className = 'download-actions';
        const dlBtnA = document.createElement('button');
        dlBtnA.className = 'download-btn audio-btn';
        dlBtnA.textContent = 'Download';
        const retryBtnA = document.createElement('button');
        retryBtnA.className = 'retry-btn';
        retryBtnA.style.display = 'none';
        retryBtnA.textContent = 'Retry';
        dlActionsA.appendChild(dlBtnA);
        dlActionsA.appendChild(retryBtnA);

        const progressCA = document.createElement('div');
        progressCA.className = 'progress-container';
        progressCA.style.display = 'none';
        const progressBarA = document.createElement('div');
        progressBarA.className = 'progress-bar';
        const progressFillA = document.createElement('div');
        progressFillA.className = 'progress-fill';
        progressBarA.appendChild(progressFillA);
        const progressTextA = document.createElement('span');
        progressTextA.className = 'progress-text';
        progressTextA.textContent = '0%';
        progressCA.appendChild(progressBarA);
        progressCA.appendChild(progressTextA);

        // progress-retry-btn and download-again-btn for audio
        const progRetryBtnA = document.createElement('button');
        progRetryBtnA.className = 'progress-retry-btn';
        progRetryBtnA.title = 'Retry';
        progRetryBtnA.style.display = 'none';
        progRetryBtnA.textContent = '↻';
        const dlAgainBtnA = document.createElement('button');
        dlAgainBtnA.className = 'download-again-btn';
        dlAgainBtnA.title = 'Download again';
        dlAgainBtnA.style.display = 'none';
        dlAgainBtnA.textContent = '⬇';

        dlAudioContainer.appendChild(progRetryBtnA);
        dlAudioContainer.appendChild(dlAgainBtnA);
        dlAudioContainer.appendChild(dlInfoA);
        dlAudioContainer.appendChild(dlActionsA);
        dlAudioContainer.appendChild(progressCA);
        audioSelectDiv.appendChild(dlAudioContainer);
        audioForm.appendChild(audioSelectDiv);

        const collapsible = document.createElement('div');
        collapsible.className = 'content_collapsible_colors';
        collapsible.style.marginTop = '2px';
        collapsible.appendChild(videoForm);
        collapsible.appendChild(audioForm);

        container.appendChild(form);
        container.appendChild(collapsible);
        main.appendChild(container);

        return main;
    }

    function renderButtons() {
        if (isYTMusic) {
            // YouTube Music: inject ABOVE the tab header container (Tiếp theo/Lời nhạc/Liên quan)
            const sidePanel = document.querySelector('#player-page #side-panel');
            const tabHeaders = sidePanel && sidePanel.querySelector('.tab-header-container');
            const addButton = tabHeaders || document.querySelector('#tab-renderer');

            // YTM loads lazily - if element not found, retry
            if (!addButton && validoBotones) {
                if (!renderButtons._ytmRetries) renderButtons._ytmRetries = 0;
                if (renderButtons._ytmRetries < 30) {
                    renderButtons._ytmRetries++;
                    setTimeout(renderButtons, 500);
                }
                return;
            }
            renderButtons._ytmRetries = 0;

            if (addButton && validoBotones) {
                validoBotones = false;

                const sidePanel = document.querySelector('ytmusic-player-page #side-panel');
                if (sidePanel) {
                    // CREATE A COMMON WRAPPER FOR TOOLS AND TAB HEADERS (Top Box)
                    let sideWrapper = $id('ytm-side-panel-wrapper');
                    if (!sideWrapper) {
                        sideWrapper = document.createElement('div');
                        sideWrapper.id = 'ytm-side-panel-wrapper';
                        sidePanel.insertBefore(sideWrapper, addButton);
                    }

                    const toolbar = buildYTMToolbar();
                    sideWrapper.appendChild(toolbar);

                    // ADD A LINE SEPARATOR
                    const line = document.createElement('div');
                    line.className = 'ytm-side-panel-divider';
                    sideWrapper.appendChild(line);

                    // MOVE THE TAB HEADER INTO THE TOP BOX
                    sideWrapper.appendChild(addButton);
                }
            }
        } else {
            // Regular YouTube
            const addButton = document.querySelector('.style-scope .ytd-watch-metadata');
            const addButton2 = document.querySelector('#contents');

            if (addButton && validoBotones) {
                const isVisible = addButton.offsetParent !== null;

                if (isVisible || addButton2) {
                    validoBotones = false;
                    const toolbar = buildYTMToolbar();
                    // Insert before metadata to be above descriptions/comments
                    addButton.parentNode.insertBefore(toolbar, addButton);
                }
            }
        }

        const formulariodescarga = $e('.formulariodescarga');
        const formulariodescargaaudio = $e('.formulariodescargaaudio');
        const btn1mp4 = $e('.btn1');
        const btn2mp3 = $e('.btn2');
        const btn3cancel = $e('.btn3');
        const selectcalidades = $e('.selectcalidades');
        const selectcalidadesaudio = $e('.selectcalidadesaudio');

        if (btn1mp4) {
            btn1mp4.onclick = () => {
                formulariodescarga.style.display = 'flex';
                formulariodescargaaudio.style.display = 'none';
                selectcalidades.classList.remove('ocultarframe');
            };
        }
        if (btn2mp3) {
            btn2mp3.onclick = () => {
                formulariodescargaaudio.style.display = 'flex';
                formulariodescarga.style.display = 'none';
                selectcalidadesaudio.classList.remove('ocultarframeaudio');
            };
        }
        if (btn3cancel) {
            btn3cancel.onclick = () => {
                formulariodescarga.style.display = 'none';
                formulariodescargaaudio.style.display = 'none';
            };
        }

        // Setup more button handlers
        const btnImagen = $id('imagen');
        if (btnImagen) {
            btnImagen.onclick = () => {
                const vid = paramsVideoURL();
                if (vid) {
                    window.open(`https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`);
                }
            };
        }

        const repeat = $id('repeatvideo');
        if (repeat) {
            let countRepeat = 0;
            repeat.onclick = () => {
                const video = getMainVideoEl();
                if (!video) return;
                countRepeat = (countRepeat + 1) % 2;
                if (countRepeat === 1) {
                    video.setAttribute('loop', 'true');
                    Notify('info', 'Repeat ON');
                } else {
                    video.removeAttribute('loop');
                    Notify('info', 'Repeat OFF');
                }
            };
        }

        const pipBtn = $e('.video_picture_to_picture');
        if (pipBtn) {
            pipBtn.onclick = () => {
                const video = getMainVideoEl();
                if (video && document.pictureInPictureEnabled) {
                    video.requestPictureInPicture();
                }
            };
        }

        const screenshotBtn = $e('.screenshot_video');
        if (screenshotBtn) {
            screenshotBtn.onclick = () => {
                const video = getMainVideoEl();
                if (!video) return;
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                const link = document.createElement('a');
                link.download = `screenshot_${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
            };
        }
    }
