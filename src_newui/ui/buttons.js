    function renderizarButtons() {
        if (isYTMusic) {
            // YouTube Music: inject ABOVE the tab header container (Tiếp theo/Lời nhạc/Liên quan)
            const sidePanel = document.querySelector('#player-page #side-panel');
            const tabHeaders = sidePanel && sidePanel.querySelector('.tab-header-container');
            const addButton = tabHeaders || document.querySelector('#tab-renderer');

            // YTM loads lazily - if element not found, retry
            if (!addButton && validoBotones) {
                if (!renderizarButtons._ytmRetries) renderizarButtons._ytmRetries = 0;
                if (renderizarButtons._ytmRetries < 30) {
                    renderizarButtons._ytmRetries++;
                    setTimeout(renderizarButtons, 500);
                }
                return;
            }
            renderizarButtons._ytmRetries = 0;

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

        [formulariodescarga, formulariodescargaaudio].forEach(form => {
            if (!form) return;
            if (form.dataset.ytToolsPreventDefault === '1') return;
            form.addEventListener('click', e => e.preventDefault());
            form.dataset.ytToolsPreventDefault = '1';
        });

        if (selectcalidades && selectcalidades.dataset.ytToolsBound !== '1') {
            selectcalidades.dataset.ytToolsBound = '1';
            selectcalidades.addEventListener('change', e => {
                const quality = e.target.value;
                if (!quality) return; // Don't proceed if no quality selected

                const downloadContainer = $id('descargando');
                const downloadText = downloadContainer.querySelector('.download-text');
                const downloadQuality = downloadContainer.querySelector('.download-quality');
                const downloadBtn = downloadContainer.querySelector('.download-btn');
                const retryBtn = downloadContainer.querySelector('.retry-btn');
                const progressContainer = downloadContainer.querySelector('.progress-container');

                // Update UI
                downloadContainer.classList.add('video');
                downloadContainer.classList.remove('ocultarframe');
                downloadText.textContent = `Download ${quality.toUpperCase()} And Please Wait...`;
                downloadQuality.textContent = `${quality}p`;

                // Show download button, hide progress
                downloadBtn.style.display = 'block';
                retryBtn.style.display = 'none';
                progressContainer.style.display = 'none';

                // Store quality for later use
                downloadContainer.dataset.quality = quality;
                downloadContainer.dataset.type = 'video';
            });
        }

        if (selectcalidadesaudio && selectcalidadesaudio.dataset.ytToolsBound !== '1') {
            selectcalidadesaudio.dataset.ytToolsBound = '1';
            selectcalidadesaudio.addEventListener('change', e => {
                const format = e.target.value;
                if (!format) return; // Don't proceed if no format selected

                const downloadContainer = $id('descargandomp3');
                const downloadText = downloadContainer.querySelector('.download-text');
                const downloadQuality = downloadContainer.querySelector('.download-quality');
                const downloadBtn = downloadContainer.querySelector('.download-btn');
                const retryBtn = downloadContainer.querySelector('.retry-btn');
                const progressContainer = downloadContainer.querySelector('.progress-container');

                // Update UI
                downloadContainer.classList.add('audio');
                downloadContainer.classList.remove('ocultarframeaudio');
                downloadText.textContent = `Download ${format.toUpperCase()} And Please Wait...`;
                downloadQuality.textContent = format.toUpperCase();

                // Show download button, hide progress
                downloadBtn.style.display = 'block';
                retryBtn.style.display = 'none';
                progressContainer.style.display = 'none';

                // Store format for later use
                downloadContainer.dataset.quality = format;
                downloadContainer.dataset.type = 'audio';
            });
        }

        if (btn3cancel && btn3cancel.dataset.ytToolsBound !== '1') {
            btn3cancel.dataset.ytToolsBound = '1';
            btn3cancel.addEventListener('click', () => {
                // Hide all selects
                selectcalidades?.classList.add('ocultarframe');
                selectcalidadesaudio?.classList.add('ocultarframeaudio');

                // Hide all download containers
                const videoContainer = $id('descargando');
                const audioContainer = $id('descargandomp3');

                if (videoContainer) {
                    videoContainer.classList.add('ocultarframe');
                    videoContainer.classList.remove('video', 'audio', 'completed');
                    videoContainer.removeAttribute('data-quality');
                    videoContainer.removeAttribute('data-type');
                    videoContainer.removeAttribute('data-downloading');
                    videoContainer.removeAttribute('data-url-opened');
                    videoContainer.removeAttribute('data-last-download-url');
                    videoContainer.querySelector?.('.download-again-btn')?.style && (videoContainer.querySelector('.download-again-btn').style.display = 'none');
                }

                if (audioContainer) {
                    audioContainer.classList.add('ocultarframeaudio');
                    audioContainer.classList.remove('video', 'audio', 'completed');
                    audioContainer.removeAttribute('data-quality');
                    audioContainer.removeAttribute('data-type');
                    audioContainer.removeAttribute('data-downloading');
                    audioContainer.removeAttribute('data-url-opened');
                    audioContainer.removeAttribute('data-last-download-url');
                    audioContainer.querySelector?.('.download-again-btn')?.style && (audioContainer.querySelector('.download-again-btn').style.display = 'none');
                }

                // Hide all forms
                if (formulariodescarga) formulariodescarga.style.setProperty('display', 'none', 'important');
                if (formulariodescargaaudio) formulariodescargaaudio.style.setProperty('display', 'none', 'important');

                // Reset forms
                formulariodescarga?.reset();
                formulariodescargaaudio?.reset();
            });
        }

        // Add event listeners for download buttons (only once)
        if (!__ytToolsRuntime.downloadClickHandlerInitialized) {
            __ytToolsRuntime.downloadClickHandlerInitialized = true;
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!(target instanceof Element)) return;

                const clicked =
                    target.closest('.download-btn') ||
                    target.closest('.retry-btn') ||
                    target.closest('.progress-retry-btn') ||
                    target.closest('.download-again-btn');
                if (!clicked) return;

                const container = clicked.closest('.download-container');
                if (!container) return;

                const quality = container.dataset.quality;
                const type = container.dataset.type;
                // download-again just re-opens the last URL (no restart)
                if (clicked.classList.contains('download-again-btn')) {
                    const url = container.dataset.lastDownloadUrl;
                    if (url) window.open(url);
                    return;
                }
                if (!quality || !type) return;

                if (clicked.classList.contains('progress-retry-btn')) {
                    container.dataset.downloading = 'false';
                    container.dataset.urlOpened = 'false';
                    container.dataset.lastDownloadUrl = '';
                    container.querySelector?.('.download-again-btn')?.style && (container.querySelector('.download-again-btn').style.display = 'none');
                }
                startDownloadVideoOrAudio(quality, container);
            });
        }



        if (btn1mp4 && btn1mp4.dataset.ytToolsBound !== '1') {
            btn1mp4.dataset.ytToolsBound = '1';
            btn1mp4.addEventListener('click', () => {
                // Show video select, hide audio select
                selectcalidades?.classList.remove('ocultarframe');
                selectcalidadesaudio?.classList.add('ocultarframeaudio');

                // Hide all download containers
                const videoContainer = $id('descargando');
                const audioContainer = $id('descargandomp3');

                if (videoContainer) {
                    videoContainer.classList.add('ocultarframe');
                    videoContainer.classList.remove('video', 'audio', 'completed');
                    videoContainer.removeAttribute('data-quality');
                    videoContainer.removeAttribute('data-type');
                    videoContainer.removeAttribute('data-downloading');
                    videoContainer.removeAttribute('data-url-opened');
                }

                if (audioContainer) {
                    audioContainer.classList.add('ocultarframeaudio');
                    audioContainer.classList.remove('video', 'audio', 'completed');
                    audioContainer.removeAttribute('data-quality');
                    audioContainer.removeAttribute('data-type');
                    audioContainer.removeAttribute('data-downloading');
                    audioContainer.removeAttribute('data-url-opened');
                }

                // Show video form, hide audio form
                if (formulariodescarga) formulariodescarga.style.setProperty('display', 'flex', 'important');
                if (formulariodescargaaudio) formulariodescargaaudio.style.setProperty('display', 'none', 'important');

                // Reset forms
                formulariodescarga?.reset();
                formulariodescargaaudio?.reset();

                // On YTM: auto-select 720p and show download button immediately
                if (isYTMusic && selectcalidades) {
                    selectcalidades.value = '720';
                    selectcalidades.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }

        if (btn2mp3 && btn2mp3.dataset.ytToolsBound !== '1') {
            btn2mp3.dataset.ytToolsBound = '1';
            btn2mp3.addEventListener('click', () => {
                // Show audio select, hide video select
                selectcalidadesaudio?.classList.remove('ocultarframeaudio');
                selectcalidades?.classList.add('ocultarframe');

                // Hide all download containers
                const videoContainer = $id('descargando');
                const audioContainer = $id('descargandomp3');

                if (videoContainer) {
                    videoContainer.classList.add('ocultarframe');
                    videoContainer.classList.remove('video', 'audio', 'completed');
                    videoContainer.removeAttribute('data-quality');
                    videoContainer.removeAttribute('data-type');
                    videoContainer.removeAttribute('data-downloading');
                    videoContainer.removeAttribute('data-url-opened');
                }

                if (audioContainer) {
                    audioContainer.classList.add('ocultarframeaudio');
                    audioContainer.classList.remove('video', 'audio', 'completed');
                    audioContainer.removeAttribute('data-quality');
                    audioContainer.removeAttribute('data-type');
                    audioContainer.removeAttribute('data-downloading');
                    audioContainer.removeAttribute('data-url-opened');
                }

                // Show audio form, hide video form
                if (formulariodescargaaudio) formulariodescargaaudio.style.setProperty('display', 'flex', 'important');
                if (formulariodescarga) formulariodescarga.style.setProperty('display', 'none', 'important');

                // Reset forms
                formulariodescargaaudio?.reset();
                formulariodescarga?.reset();

                // On YTM: auto-select MP3 and show download button immediately
                if (isYTMusic && selectcalidadesaudio) {
                    selectcalidadesaudio.value = 'mp3';
                    selectcalidadesaudio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
        // Invertir contenido



        const btnImagen = $e('#imagen');

        // valido modo oscuro y venta de video
        // Repeat video button
        let countRepeat = 0; // count
        const repeat = $e('#repeatvideo'); // Repeat button
        const videoFull = isYTMusic
            ? $e('video')
            : $e('#movie_player > div.html5-video-container > video');
        if (repeat != undefined) {

            repeat.onclick = () => {
                if (
                    (isYTMusic ? videoFull : $e('#cinematics > div')) != undefined ||
                    videoFull != undefined
                ) {
                    countRepeat += 1;
                    switch (countRepeat) {
                        case 1:
                            const videoEl = isYTMusic ? $e('video') : document
                                .querySelector('#movie_player > div.html5-video-container > video');
                            videoEl?.setAttribute('loop', 'true');
                            if (isYTMusic) {
                                // On YTM, replace SVG icon using DOM API
                                const newSvg = createSvgIcon([
                                    'M0 0h24v24H0z',
                                    'M4 12v-3c0 -1.336 .873 -2.468 2.08 -2.856m3.92 -.144h10m-3 -3l3 3l-3 3',
                                    'M20 12v3a3 3 0 0 1 -.133 .886m-1.99 1.984a3 3 0 0 1 -.877 .13h-13m3 3l-3 -3l3 -3',
                                    'M3 3l18 18'
                                ]);
                                repeat.replaceChildren(newSvg);
                            } else {
                                const imarepeat = $e('.icon-tabler-repeat');
                                if (imarepeat) imarepeat.innerHTML = safeHTML(`  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 12v-3c0 -1.336 .873 -2.468 2.08 -2.856m3.92 -.144h10m-3 -3l3 3l-3 3"></path>
                    <path d="M20 12v3a3 3 0 0 1 -.133 .886m-1.99 1.984a3 3 0 0 1 -.877 .13h-13m3 3l-3 -3l3 -3"></path>
                    <path d="M3 3l18 18"></path>
                 </svg> `);
                            }
                            break;
                        case 2:
                            countRepeat = 0;
                            const videoEl2 = isYTMusic ? $e('video') : document
                                .querySelector('#movie_player > div.html5-video-container > video');
                            videoEl2?.removeAttribute('loop');
                            if (isYTMusic) {
                                const newSvg2 = createSvgIcon([
                                    'M0 0h24v24H0z',
                                    'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
                                    'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3'
                                ]);
                                repeat.replaceChildren(newSvg2);
                            } else {
                                const imarepeat2 = $e('.icon-tabler-repeat');
                                if (imarepeat2) imarepeat2.innerHTML = safeHTML(` <svg  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat" width="24"
                    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
                    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
                  </svg>`);
                            }
                            break;
                    }
                }
            }
        }

        // Background transparent

        const cinematica = $e('#cinematics > div');
        if (cinematica != undefined) {
            cinematica.style.cssText =
                'position: fixed; inset: 0px; pointer-events: none; transform: scale(1.5, 2)';
        }

        if (btnImagen != undefined) {
            btnImagen.onclick = () => {
                if (
                    $e('#cinematics > div') != undefined ||
                    videoFull != undefined
                ) {
                    const parametrosURL = new URLSearchParams(window.location.search);
                    let enlace = parametrosURL.get('v');

                    const imageUrl = `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`;

                    fetch(imageUrl)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            return response.blob();
                        })
                        .then((blob) => {
                            const imageSizeKB = blob.size / 1024;

                            if (imageSizeKB >= 20) {
                                window.open(
                                    `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`,
                                    'popUpWindow',
                                    'height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
                                );
                                const imageUrlObject = URL.createObjectURL(blob);

                                const enlaceDescarga = $cl('a');
                                enlaceDescarga.href = imageUrlObject;
                                const titleVideo = isYTMusic
                                    ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
                                    : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
                                enlaceDescarga.download = `${titleVideo}_maxresdefault.jpg`;
                                enlaceDescarga.click();

                                URL.revokeObjectURL(imageUrlObject);
                            } else {
                                console.log(
                                    'La imagen no excede los 20 KB. No se descargará.'
                                );
                            }
                        })
                        .catch((error) => {
                            alert('No found image');
                            console.error('Error al obtener la imagen:', error);
                        });
                }
            };
        }
        // [REMOVED] Duplicate background image handler — handled at end of script (line ~6648+).

        const viewPictureToPicture = $e(
            '.video_picture_to_picture'
        );
        if (viewPictureToPicture != undefined) {
            viewPictureToPicture.onclick = () => {
                const video = $e('video');
                if ('pictureInPictureEnabled' in document) {
                    if (!document.pictureInPictureElement) {

                        video
                            .requestPictureInPicture()
                            .then(() => { })
                            .catch((error) => {
                                console.error(
                                    'Error al activar el modo Picture-in-Picture:',
                                    error
                                );
                            });
                    } else {
                        // video picture
                    }
                } else {
                    alert('Picture-in-Picture not supported');
                }
            };
        }
        const screenShotVideo = $e('.screenshot_video');
        if (screenShotVideo != undefined) {
            screenShotVideo.onclick = () => {
                const video = $e('video');
                const canvas = $cl('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imagenURL = canvas.toDataURL('image/png');
                const enlaceDescarga = $cl('a');
                enlaceDescarga.href = imagenURL;
                const titleVideo = isYTMusic
                    ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
                    : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
                enlaceDescarga.download = `${video.currentTime.toFixed(
                    0
                )}s_${titleVideo}.png`;
                enlaceDescarga.click();
            };
        } else {
            const containerButtons = $e('.containerButtons');

            if (containerButtons != undefined) {
                containerButtons.innerHTML = safeHTML('');
            }
        }
        // [REMOVED] clearInterval(renderizarButtons) — was passing a function, not an interval ID.
    }




    function hideCanvas() {

        const canvas = $id('wave-visualizer-canvas');
        if (canvas) {
            canvas.style.opacity = '0';
            if (controlPanel) {
                controlPanel.style.opacity = '0';
            }
        }
    }

    function showCanvas() {
        const canvas = $id('wave-visualizer-canvas');
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (canvas) {
            canvas.style.opacity = '1';
            if (controlPanel) controlPanel.style.opacity = '1';
        }
    }


