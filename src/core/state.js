    // ------------------------------
    // PERF: runtime guards + dynamic style (avoid style/event/interval leaks)

    // ------------------------------
    const __ytToolsRuntime = {
        dynamicStyleEl: null,
        dynamicCssLast: '',
        settingsLoaded: false,
        bookmarkClickHandlerInitialized: false,
        bookmarksPanelOpen: false,
        continueWatching: {
            enabled: false,
            map: null,
            flushT: null,
            boundVideo: null,
            boundVideoId: null,
            lastSaveAt: 0,
            lastSavedTime: -1,
            lastKnownVideoId: null,
            navHandlerInitialized: false,
            panelOpen: false,
            clickHandlerInitialized: false,
            pagehideHandlerInitialized: false,
            handlers: null,
        },
        shortsChannelName: {
            enabled: false,
            observer: null,
            io: null,
            scanT: null,
            cache: new Map(), // videoId -> channelName
            inflight: new Map(), // videoId -> Promise<string>
            fetchChain: Promise.resolve(),
        },
        dislikesCache: {
            videoId: null,
            dislikes: null,
            ts: 0,
        },
        downloadClickHandlerInitialized: false,
        shortsObserver: null,
        statsObserver: null,
        statsIntervalId: null,
        lockupCachedStatsObserver: null,
        lockupCachedStatsObserveTarget: null,
        lockupCachedStatsIntervalId: null,
        updateShortsViewsButton: function () { },
        updateShortsRatingButton: function () { },
        nonstopPlayback: {
            enabled: false,
            hiddenDescriptor: null,
            visibilityStateDescriptor: null,
            blockVisibilityEvent: null,
            keepAliveTimer: null,
        },
        audioOnly: {
            enabled: false,
            lastArtUrl: '',
            refreshTimer: null,
        },
    };

    let validoBotones = true;

    // UI Elements
    const panel = $cl('div');
    panel.id = 'yt-enhancement-panel';

    const panelOverlay = $cl('div');
    panelOverlay.id = 'panel-overlay';

    function setDynamicCss(cssText = '') {
        if (!__ytToolsRuntime.dynamicStyleEl) {
            const style = document.createElement('style');
            style.id = 'yt-tools-mdcm-dynamic-style';
            document.head.appendChild(style);
            __ytToolsRuntime.dynamicStyleEl = style;
        }
        if (__ytToolsRuntime.dynamicCssLast === cssText) return;
        __ytToolsRuntime.dynamicCssLast = cssText;
        __ytToolsRuntime.dynamicStyleEl.textContent = cssText;
    }

    const scheduleApplySettings = (() => {
        let t = null;
        return () => {
            // Prevent overwriting saved config with defaults before loadSettings finishes.
            if (!__ytToolsRuntime.settingsLoaded) return;
            clearTimeout(t);
            t = setTimeout(() => {
                try {
                    applySettings();
                } catch (err) {
                    console.error('applySettings error:', err);
                }
            }, 120);
        };
    })();

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


    function Notify(type = 'info', message = '', title = '') {
        const defaultTitles = {
            success: 'Success',
            error: 'Error',
            info: 'Information',
            warning: 'Warning',
        };

        if (isYTMusic || (window.trustedTypes && window.trustedTypes.defaultPolicy === null)) {
            // Avoid iziToast due to innerHTML TrustedTypes violation on strict environments
            let toast = document.getElementById('yt-tools-custom-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'yt-tools-custom-toast';
                toast.style.cssText = 'position:fixed;bottom:20px;left:20px;background:rgba(30,30,30,0.9);color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);border-left:4px solid #ff0000;transition:opacity 0.3s;opacity:0;pointer-events:none;';
                document.body.appendChild(toast);
            }
            toast.textContent = (title || defaultTitles[type] || 'Notification') + ': ' + message;
            if (type === 'success') toast.style.borderLeftColor = '#22c55e';
            else if (type === 'error') toast.style.borderLeftColor = '#ef4444';
            else if (type === 'warning') toast.style.borderLeftColor = '#f59e0b';
            else toast.style.borderLeftColor = '#3b82f6';

            toast.style.opacity = '1';
            if (toast._timer) clearTimeout(toast._timer);
            toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
            return;
        }

        try {
            iziToast[type]({
                title: title || defaultTitles[type] || 'Notification',
                message: message,
                position: 'bottomLeft',
            });
        } catch (e) {
            console.warn('[yt-tools] iziToast failed:', e);
        }
    }

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

        const fetchJsonWithTimeout = async (url, timeoutMs = 20000) => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), timeoutMs);
            try {
                const res = await fetch(url, {
                    signal: ctrl.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } finally {
                clearTimeout(t);
            }
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
            downloadText.textContent = 'Download Complete!';
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            progressRetryBtn.style.display = 'none';
            if (downloadAgainBtn) downloadAgainBtn.style.display = 'flex';
            container.dataset.downloading = 'false';
            try {
                window.open(downloadUrl);
            } catch (e) {
                console.warn('Could not open download URL:', e);
            }
        };

        const pollProgressUrl = (progressURL) => {
            container.__ytDownloadPoll = setInterval(async () => {
                try {
                    const progressData = await fetchJsonWithTimeout(progressURL, 15000);

                    const progress = Math.min((Number(progressData.progress) || 0) / 10, 100);
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;

                    if (Number(progressData.progress) >= 1000 && progressData.download_url) {
                        clearInterval(container.__ytDownloadPoll);
                        container.__ytDownloadPoll = null;
                        markCompleteAndOpen(progressData.download_url);
                    }
                } catch (e) {
                    console.error('Error in progress:', e);
                    clearInterval(container.__ytDownloadPoll);
                    container.__ytDownloadPoll = null;
                    setErrorState();
                }
            }, 3000);
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
                        markCompleteAndOpen(st.downloadUrl);
                    }
                } catch (e) {
                    console.error('❌ Error polling dubs status:', e);
                    clearInterval(container.__ytDownloadPoll);
                    container.__ytDownloadPoll = null;
                    setErrorState();
                }
            }, 3000);
        };

        try {
            let started = null;
            let lastErr = null;

            for (const base of DOWNLOAD_API_FALLBACK_BASES) {
                try {
                    started = await trySaveNowProvider(base);
                    break;
                } catch (e) {
                    lastErr = e;
                }
            }

            if (started?.success && started?.progress_url) {
                pollProgressUrl(started.progress_url);
                return;
            }

            console.warn('SaveNow providers failed, falling back to dubs.io', lastErr);
            await tryDubsProvider();
        } catch (error) {
            setErrorState();
            console.error('❌ Error starting download:', error);
        }
    }


    const UPDATE_INTERVAL = 1000;
    const STORAGE = {
        USAGE: 'YT_TOTAL_USAGE',
        VIDEO: 'YT_VIDEO_TIME',
        SHORTS: 'YT_SHORTS_TIME'
    };

    let usageTime = GM_getValue(STORAGE.USAGE, 0);
    let videoTime = GM_getValue(STORAGE.VIDEO, 0);
    let shortsTime = GM_getValue(STORAGE.SHORTS, 0);
    let lastUpdate = Date.now();
    let activeVideo = null;
    let activeType = null;

    // Inicializar almacenamiento
    GM_setValue(STORAGE.USAGE, usageTime);
    GM_setValue(STORAGE.VIDEO, videoTime);
    GM_setValue(STORAGE.SHORTS, shortsTime);

    function FormatterNumber(num, digits) {
        const lookup = [{
            value: 1,
            symbol: '',
        }, {
            value: 1e3,
            symbol: ' K',
        }, {
            value: 1e6,
            symbol: ' M',
        },];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup
            .slice()
            .reverse()
            .find((item) => {
                return num >= item.value;
            });
        return item ?
            (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol :
            '0';
    }

    function paramsVideoURL() {
        const parametrosURL = new URLSearchParams(window.location.search); // Url parametros
        return parametrosURL.get('v');
    }



    // Create a Trusted Types policy (use custom name to avoid conflict with YTM's own 'default' policy)
    let policy = null;
    try {
        const tt = (typeof unsafeWindow !== 'undefined' ? unsafeWindow.trustedTypes : window.trustedTypes);
        if (tt) {
            try {
                policy = tt.createPolicy('yt-tools-mdcm', {
                    createHTML: (s) => s
                });
            } catch (e) {
                // fallback: try to reuse 'default' policy if it exists
                policy = tt.defaultPolicy || null;
            }
        }
    } catch (e) {
        policy = null;
    }

    // Helper: wrap raw HTML strings for Trusted Types compliance
    function safeHTML(str) {
        if (policy && typeof policy.createHTML === 'function') return policy.createHTML(str);
        return str;
    }
