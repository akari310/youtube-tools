
        function formatTime(seconds) {
            if (isNaN(seconds)) return '0h 0m 0s';
            seconds = Math.floor(seconds);
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${h}h ${m}m ${s}s`;
        }

        function updateUI() {
            if (!$id('total-time')) return;
            $id('total-time').textContent = formatTime(usageTime);
            $id('video-time').textContent = formatTime(videoTime);
            $id('shorts-time').textContent = formatTime(shortsTime);

            const maxTime = 86400; // 24 hours
            $id('usage-bar').style.width = `${(usageTime / maxTime) * 100}%`;
            $id('video-bar').style.width = `${(videoTime / maxTime) * 100}%`;
            $id('shorts-bar').style.width = `${(shortsTime / maxTime) * 100}%`;
        }

        function detectContentType(videoElement) {
            if (/\/shorts\//.test(window.location.pathname)) return 'shorts';
            let parent = videoElement;
            while ((parent = parent.parentElement) !== null) {
                if (parent.classList.contains('shorts-container') ||
                    parent.classList.contains('reel-video') ||
                    parent.tagName === 'YTD-REEL-VIDEO-RENDERER') {
                    return 'shorts';
                }
            }
            if (videoElement.closest('ytd-watch-flexy') || videoElement.closest('#primary-inner')) return 'video';
            if (videoElement.closest('ytd-thumbnail') || videoElement.closest('ytd-rich-item-renderer')) return 'video';
            return null;
        }

        function findActiveVideo() {
            const videos = $m('video');
            for (const video of videos) {
                if (!video.paused && !video.ended && video.readyState > 2) return video;
            }
            return null;
        }

        function updateCanvasSize() {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = canvasHeight;
            }
        }

        function onWaveStyleChange(e) {
            waveStyle = e.target.value;
            const selectAppend = $id('select-wave-visualizer-select');
            if (selectAppend) selectAppend.value = e.target.value;
            saveSettings();
        }

        function cleanup(fullCleanup = false) {
            if (fullCleanup && animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            if (currentVideo) {
                currentVideo.removeEventListener('play', showCanvas);
                currentVideo.removeEventListener('pause', hideCanvas);
                currentVideo.removeEventListener('ended', hideCanvas);
            }
            if (fullCleanup) {
                if (canvas && canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                    canvas = null;
                    ctx = null;
                }
                if (controlPanel && controlPanel.parentNode) {
                    controlPanel.parentNode.removeChild(controlPanel);
                    controlPanel = null;
                }
                if (source) {
                    try {
                        source.disconnect();
                        if (audioCtx && audioCtx.state !== 'closed') {
                            source.connect(audioCtx.destination);
                        }
                    } catch (err) { }
                }
                if (currentVideo && currentVideo[PROCESSED_FLAG]) {
                    delete currentVideo[PROCESSED_FLAG];
                }
                currentVideo = null;
                isSetup = false;
                window.removeEventListener('resize', updateCanvasSize);
                const selectAppend = $id('select-wave-visualizer-select');
                if (selectAppend) selectAppend.removeEventListener('change', onWaveStyleChange);
            } else {
                if (canvas) canvas.style.opacity = '0';
                if (controlPanel) controlPanel.style.opacity = '0';
            }
        }

        function createCanvasOverlay() {
            if (canvas) return;
            const parent = document.body;
            canvas = document.createElement('canvas');
            canvas.id = 'wave-visualizer-canvas';
            canvas.width = window.innerWidth;
            canvas.height = canvasHeight;
            canvas.style.position = 'fixed';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.width = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.backgroundColor = 'transparent';
            canvas.style.zIndex = '10000';
            canvas.style.opacity = '0';
            canvas.style.transition = 'opacity 0.3s';
            parent.appendChild(canvas);
            ctx = canvas.getContext('2d');
        }

        function createControlPanelWave(settings) {
            if (controlPanel) return;
            controlPanel = $cl('div');
            controlPanel.id = 'wave-visualizer-control';
            const selectAppend = $id('select-wave-visualizer-select');
            waveStyle = settings.waveVisualizerSelected;
            if (selectAppend) {
                selectAppend.removeEventListener('change', onWaveStyleChange);
                selectAppend.addEventListener('change', onWaveStyleChange);
            }
        }

        function setupAudioAnalyzer(video) {
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();

                if (!video.__ytToolsAudioSource) {
                    video.__ytToolsAudioSource = audioCtx.createMediaElementSource(video);
                }
                source = video.__ytToolsAudioSource;
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                createCanvasOverlay();
                createControlPanelWave(__ytToolsRuntime.settings);
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
                smoothedData = new Array(bufferLength).fill(0);
                isSetup = true;
                currentVideo = video;
                video.addEventListener('play', showCanvas);
                video.addEventListener('pause', hideCanvas);
                video.addEventListener('ended', hideCanvas);
                window.addEventListener('resize', updateCanvasSize);
                if (!video.paused) showCanvas();
                draw();
            } catch (err) {
                console.error('[Wave] Error:', err);
                isSetup = false;
            }
        }

        function showCanvas() {
            if (canvas) canvas.style.opacity = '1';
            if (controlPanel) controlPanel.style.opacity = '1';
        }

        function hideCanvas() {
            if (canvas) canvas.style.opacity = '0';
            if (controlPanel) controlPanel.style.opacity = '0';
        }

        function draw() {
            if (!isSetup || !ctx || !analyser) return;
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < bufferLength; i++) {
                smoothedData[i] += (dataArray[i] - smoothedData[i]) * smoothingFactor;
            }
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = smoothedData[i] * scale;
                const r = 139 + (i * 2);
                const g = 92 + (i * 1);
                const b = 246;
                ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
                if (waveStyle === 'dinamica') {
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                } else {
                    ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
                }
                x += barWidth + 1;
            }
        }

        function checkForVideo(settings) {
            if (!settings.waveVisualizer) {
                cleanup(true);
                return;
            }
            const video = $e('video');
            const miniPlayer = $e('.ytp-miniplayer-ui');
            if ((video && document.location.href.includes('watch')) || miniPlayer) {
                if (video !== currentVideo || !isSetup) {
                    cleanup(true);
                    setupAudioAnalyzer(video);
                } else if (controlPanel && video.paused === false) {
                    showCanvas();
                }
            }
        }
