// ==UserScript==
// @name         YouTube Ultimate Tools
// @name:vi      Bộ Công Cụ YouTube Tối Ưu
// @name:es      Herramientas Definitivas de YouTube
// @name:fr      Outils Ultimes YouTube
// @name:de      Ultimative YouTube-Tools
// @name:pt      Ferramentas Definitivas do YouTube
// @name:ru      YouTube Ultimate Инструменты
// @name:ja      YouTube アルティメット ツール
// @name:zh-CN   YouTube 终极工具
// @name:zh-TW   YouTube 終極工具
// @name:ko      YouTube 얼티밋 도구
// @name:it      Strumenti Definitivi per YouTube
// @description  Download high-quality video/audio, return dislikes, and more VIP features for YouTube and YouTube Music.
// @description:vi Tải video/audio chất lượng cao, hiện nút dislike, và nhiều tính năng VIP khác cho YouTube và YouTube Music.
// @description:es Descarga videos/audio de alta calidad, recupera dislikes y más funciones VIP para YouTube và YouTube Music.
// @description:fr Téléchargez des vidéos/audio de haute qualità, récupérez les dislikes et plus de fonctionnalités VIP pour YouTube và YouTube Music.
// @description:de Laden Sie hochwertige Videos/Audio herunter, stellen Sie Dislikes wieder her und weitere VIP-Funktionen für YouTube và YouTube Music.
// @description:pt Baixe vídeos/áudio de alta qualidade, recupere dislikes e mais recursos VIP para YouTube và YouTube Music.
// @description:ru Скачивайте видео/аудио высокого качества, возвращайте дизлайки и другие VIP-функции для YouTube и YouTube Music.
// @description:ja 高品質なビデオ/オーディオのダウンロード、低評価の表示、YouTubeおよびYouTube Music向けのVIP機能。
// @description:zh-CN 下载高质量视频/音频，还原消失的回复，以及更多 YouTube 和 YouTube Music 的 VIP 功能。
// @description:zh-TW 下載高品質影片/音訊，還原消失的回复，以及更多 YouTube 和 YouTube Music 的 VIP 功能。
// @description:ko 고품질 비디오/오디오 다운로드, 싫어요 표시, YouTube 및 YouTube Music을 위한 더 많은 VIP 기능.
// @description:it Scarica video/audio di alta qualità, ripristina i dislike e altre funzioni VIP per YouTube e YouTube Music.
// @homepage     https://greasyfork.org/users/1597067-nguyen-ngocanh
// @version      0.0.5.7
// @author       Akari, DeveloperMDCM, nvbangg
// @contributor  nvbangg
// @match        *://www.youtube.com/*
// @match        *://music.youtube.com/*
// @match        *://*.music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/js/iziToast.min.js
// @compatible   chrome
// @compatible   firefox
// @compatible   opera
// @compatible   safari
// @compatible   edge
// @license      GPL-3.0
// @namespace    https://greasyfork.org/users/1597067-nguyen-ngocanh
// @keywords     youtube, download, mp3, mp4, high quality, return dislikes, tools
// @downloadURL https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js
// @updateURL https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.meta.js
// ==/UserScript==

(function () {
    'use strict';
    let validoUrl = document.location.href;
    const isYTMusic = location.hostname === 'music.youtube.com';
    const SETTINGS_KEY = isYTMusic ? 'ytmSettingsMDCM' : 'ytSettingsMDCM';
    const $e = (el) => document.querySelector(el); // any element
    const $id = (el) => document.getElementById(el); // element by id
    const $m = (el) => document.querySelectorAll(el); // multiple all elements
    const $cl = (el) => document.createElement(el); // create element
    const $sp = (el, pty) => document.documentElement.style.setProperty(el, pty); // set property variable css
    const $ap = (el) => document.body.appendChild(el); // append element
    const apiDislikes = "https://returnyoutubedislikeapi.com/Votes?videoId="; // Api dislikes
    const apiGoogleTranslate = "https://translate.googleapis.com/translate_a/t"; // Api google translate
    let selectedBgColor = "#252525"; // Background color menu default
    let selectedTextColor = "#ffffff"; // Text color menu default
    let selectedBgAccentColor = "#ff0000"; // Accent color menu default
    const urlSharedCode = "https://greasyfork.org/scripts/576162-youtube-ultimate-tools";
    const API_URL_AUDIO_VIDEO = "https://p.savenow.to/ajax/download.php?copyright=0&allow_extended_duration=1&" // API URL AUDIO VIDEO
    const API_KEY_DEVELOPERMDCM = 'dfcb6d76f2f6a9894gjkege8a4ab232222'; // API KEY FOR DOWNLOAD AUDIO VIDEO
    // Download API fallbacks (region/session issues)
    const DOWNLOAD_API_FALLBACK_BASES = [
        "https://p.savenow.to",
        "https://p.lbserver.xyz",
    ];
    // Alternative provider fallback
    const DUBS_START_ENDPOINT = "https://dubs.io/wp-json/tools/v1/download-video";
    const DUBS_STATUS_ENDPOINT = "https://dubs.io/wp-json/tools/v1/status-video";

    // for translate comments video
    const languagesTranslate = {
        "vi": "Vietnamese",
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "ja": "Japanese",
        "zh-CN": "Chinese (Simplified)",
        "ko": "Korean",
        "ru": "Russian",
        "de": "German",
        "pt": "Portuguese",
        "zh-TW": "Chinese (Traditional)",
        "it": "Italian"
    };


    // var for wave
    let currentVideo = null;

    let waveStyle = 'dinamica';
    let audioCtx = null;
    let analyser = null;
    let source = null;
    let animationId = null;
    let canvas = null;
    let ctx = null;
    let controlPanel = null;
    let bufferLength = 0;
    let dataArray = null;
    let smoothedData = [];
    let isSetup = false;
    const smoothingFactor = 0.05;
    const canvasHeight = 240;
    const scale = canvasHeight / 90;

    const PROCESSED_FLAG = 'wave_visualizer_processed';



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

    // ------------------------------
    // Feature helpers: videoId / channelId / storage

    // ------------------------------
    const STORAGE_KEYS_MDCM = {
        BOOKMARKS: 'ytBookmarksMDCM',
        CONTINUE_WATCHING: 'ytContinueWatchingMDCM',
        SHORTS_CHANNEL_CACHE: 'ytShortsChannelCacheMDCM',
        LIKES_DISLIKES_CACHE: 'ytLikesDislikesCacheMDCM',
        VERSION_CHECK_LAST: 'ytVersionCheckLastMDCM',
    };

    const UPDATE_META_URL = 'https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.meta.js';
    const VERSION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day

    const SHORTS_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    const LIKES_DISLIKES_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    const PERSISTED_CACHE_MAX_ENTRIES = 500;

    function getShortsChannelFromPersistedCache(videoId) {
        try {
            const map = readJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, {});
            const entry = map?.[videoId];
            if (!entry || typeof entry.channelName !== 'string') return null;
            const age = Date.now() - (Number(entry.ts) || 0);
            if (age > SHORTS_CHANNEL_TTL_MS) return null;
            return entry.channelName;
        } catch (e) {
            return null;
        }
    }

    function setShortsChannelToPersistedCache(videoId, channelName) {
        if (!videoId || typeof channelName !== 'string') return;
        try {
            const map = readJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, {});
            map[videoId] = {
                channelName,
                ts: Date.now()
            };
            const entries = Object.entries(map).sort((a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0));
            const pruned = Object.fromEntries(entries.slice(0, PERSISTED_CACHE_MAX_ENTRIES));
            writeJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, pruned);
        } catch (e) { }
    }

    function getLikesDislikesFromPersistedCache(videoId) {
        try {
            const map = readJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, {});
            const entry = map?.[videoId];
            if (!entry) return null;
            const age = Date.now() - (Number(entry.ts) || 0);
            if (age > LIKES_DISLIKES_TTL_MS) return null;
            const dislikes = Number(entry.dislikes);
            const likes = Number(entry.likes);
            const viewCount = Number(entry.viewCount);
            const rating = Number(entry.rating);
            return {
                likes: Number.isFinite(likes) ? likes : null,
                dislikes: Number.isFinite(dislikes) ? dislikes : null,
                viewCount: Number.isFinite(viewCount) ? viewCount : null,
                rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
            };
        } catch (e) {
            return null;
        }
    }

    function setLikesDislikesToPersistedCache(videoId, likes, dislikes, viewCount, rating) {
        if (!videoId) return;
        try {
            const map = readJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, {});
            map[videoId] = {
                likes: likes ?? null,
                dislikes: dislikes ?? null,
                viewCount: viewCount ?? null,
                rating: rating ?? null,
                ts: Date.now()
            };
            const entries = Object.entries(map).sort((a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0));
            const pruned = Object.fromEntries(entries.slice(0, Math.min(PERSISTED_CACHE_MAX_ENTRIES, 300)));
            writeJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, pruned);
        } catch (e) { }
    }

    function getCurrentVideoId() {
        try {
            if (location.pathname.startsWith('/shorts/')) {
                const parts = location.pathname.split('/').filter(Boolean);
                return parts[1] || null;
            }
            if (location.href.includes('youtube.com/watch')) {
                return paramsVideoURL();
            }
            return null;
        } catch (e) {
            return null;
        }
    }


    function readJsonGM(key, fallback) {
        try {
            const raw = GM_getValue(key, '');
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    function writeJsonGM(key, value) {
        try {
            GM_setValue(key, JSON.stringify(value));
        } catch (e) {
            console.error('writeJsonGM error:', e);
        }
    }

    const AUDIO_ONLY_TAB_OVERRIDE_KEY = 'ytToolsAudioOnlyTabOverrideMDCM';

    // Feature source/inspiration:
    // Nonstop & Audio Only for YouTube & YouTube Music
    // Author: nvbangg / Nguyen Van Bang
    // Repo: https://github.com/nvbangg/Nonstop_Audio_Only_for_Youtube_YTMusic
    // Greasy Fork: https://greasyfork.org/scripts/546130
    // Source license: GPL-3.0. This userscript implements an independent adaptation of the behavior.
    function applyNonstopPlayback(enabled) {
        const rt = __ytToolsRuntime.nonstopPlayback;
        if (enabled && rt.enabled) return;
        if (!enabled && !rt.enabled) return;

        if (enabled) {
            rt.enabled = true;
            rt.hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden') || null;
            rt.visibilityStateDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState') || null;
            try {
                Object.defineProperties(document, {
                    hidden: { configurable: true, get: () => false },
                    visibilityState: { configurable: true, get: () => 'visible' },
                });
            } catch (e) {
                console.warn('[YT Tools] Could not override visibility state:', e);
            }

            rt.blockVisibilityEvent = (event) => {
                event.stopImmediatePropagation();
            };
            document.addEventListener('visibilitychange', rt.blockVisibilityEvent, true);
            window.addEventListener('visibilitychange', rt.blockVisibilityEvent, true);

            const refreshActivity = () => {
                try {
                    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
                    if ('_lact' in pageWindow) pageWindow._lact = Date.now();
                } catch (e) { }
            };
            refreshActivity();
            rt.keepAliveTimer = setInterval(refreshActivity, 60000);
            return;
        }

        rt.enabled = false;
        if (rt.blockVisibilityEvent) {
            document.removeEventListener('visibilitychange', rt.blockVisibilityEvent, true);
            window.removeEventListener('visibilitychange', rt.blockVisibilityEvent, true);
            rt.blockVisibilityEvent = null;
        }
        if (rt.keepAliveTimer) {
            clearInterval(rt.keepAliveTimer);
            rt.keepAliveTimer = null;
        }
        try {
            if (rt.hiddenDescriptor) Object.defineProperty(document, 'hidden', rt.hiddenDescriptor);
            else delete document.hidden;
            if (rt.visibilityStateDescriptor) Object.defineProperty(document, 'visibilityState', rt.visibilityStateDescriptor);
            else delete document.visibilityState;
        } catch (e) { }
        rt.hiddenDescriptor = null;
        rt.visibilityStateDescriptor = null;
    }

    function getAudioOnlyTabOverride() {
        const value = sessionStorage.getItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;
    }

    function setAudioOnlyTabOverride(enabled, defaultEnabled) {
        if (!!enabled === !!defaultEnabled) {
            sessionStorage.removeItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
            return;
        }
        sessionStorage.setItem(AUDIO_ONLY_TAB_OVERRIDE_KEY, enabled ? 'true' : 'false');
    }

    function getEffectiveAudioOnly(settings) {
        const override = getAudioOnlyTabOverride();
        return override === null ? !!settings?.audioOnly : override;
    }

    function syncAudioOnlyTabCheckbox(settings) {
        const tabToggle = $id('audio-only-tab-toggle');
        if (!tabToggle) return;
        tabToggle.checked = getEffectiveAudioOnly(settings);
        tabToggle.title = getAudioOnlyTabOverride() === null ?
            'Following the global Audio-only mode setting' :
            'Audio-only override is active for this browser tab';
    }

    function getActiveAudioOnlyVideo() {
        const videos = Array.from(document.querySelectorAll('video'));
        if (isYTMusic) return videos[0] || null;
        return videos.find((video) => {
            const rect = video.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        }) || videos[0] || null;
    }

    async function getAudioOnlyThumbnailUrl() {
        try {
            const moviePlayer = document.getElementById('movie_player');
            if (moviePlayer && typeof moviePlayer.getVideoData === 'function') {
                const data = moviePlayer.getVideoData();
                if (data?.video_id) return `https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg`;
            }
        } catch (e) { }

        const videoId = getCurrentVideoId() || paramsVideoURL();
        if (!videoId) return '';
        const host = isYTMusic ? 'i1.ytimg.com' : 'img.youtube.com';
        return `https://${host}/vi/${videoId}/hqdefault.jpg`;
    }

    async function applyAudioOnlyMode(enabled) {
        const rt = __ytToolsRuntime.audioOnly;
        rt.enabled = !!enabled;
        document.body.classList.toggle('yt-tools-audio-only-active', rt.enabled);

        document.querySelectorAll('.yt-tools-audio-only-video').forEach((el) => el.classList.remove('yt-tools-audio-only-video'));
        document.querySelectorAll('.yt-tools-audio-only-player').forEach((el) => el.classList.remove('yt-tools-audio-only-player'));

        if (!rt.enabled) {
            rt.lastArtUrl = '';
            setAudioOnlyBackground('');
            if (rt.refreshTimer) {
                clearInterval(rt.refreshTimer);
                rt.refreshTimer = null;
            }
            return;
        }

        const video = getActiveAudioOnlyVideo();
        const player = video?.parentNode?.parentNode || video?.parentElement || null;
        if (video) video.classList.add('yt-tools-audio-only-video');
        if (player) player.classList.add('yt-tools-audio-only-player');

        const artUrl = await getAudioOnlyThumbnailUrl();
        if (artUrl && artUrl !== rt.lastArtUrl) {
            rt.lastArtUrl = artUrl;
            setAudioOnlyBackground(artUrl);
        }

        if (!rt.refreshTimer) {
            rt.refreshTimer = setInterval(() => {
                if (document.visibilityState !== 'visible') return;
                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                applyAudioOnlyMode(getEffectiveAudioOnly(settings));
            }, 3000);
        }
    }

    function setAudioOnlyBackground(url) {
        let style = $id('yt-tools-audio-only-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'yt-tools-audio-only-style';
            document.documentElement.appendChild(style);
        }
        style.textContent = url ? `.yt-tools-audio-only-player{background-image:url("${url}")!important;}` : '';
    }

    function isVersionNewer(latestStr, currentStr) {
        if (!latestStr || !currentStr) return false;
        const parse = (s) => String(s).trim().split('.').map((n) => parseInt(n, 10) || 0);
        const a = parse(latestStr);
        const b = parse(currentStr);
        const len = Math.max(a.length, b.length);
        for (let i = 0; i < len; i++) {
            const x = a[i] || 0;
            const y = b[i] || 0;
            if (x > y) return true;
            if (x < y) return false;
        }
        return false;
    }

    async function checkNewVersion() {
        try {
            const last = GM_getValue(STORAGE_KEYS_MDCM.VERSION_CHECK_LAST, 0);
            if (Date.now() - last < VERSION_CHECK_INTERVAL_MS) return;
            GM_setValue(STORAGE_KEYS_MDCM.VERSION_CHECK_LAST, Date.now());

            const res = await fetch(UPDATE_META_URL, {
                cache: 'no-store'
            });
            if (!res.ok) return;
            const text = await res.text();
            const m = text.match(/@version\s+([\d.]+)/);
            if (!m) return;
            const latestVer = m[1].trim();
            const currentVer = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) ?
                String(GM_info.script.version).trim() :
                '';
            if (!currentVer || !isVersionNewer(latestVer, currentVer)) return;

            const updateUrl = 'https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js';
            iziToast.show({
                title: 'New Update',
                message: 'A new version YoutubeTools is available.',
                buttons: [
                    ['<button>View Now</button>', function (instance, toast) {
                        window.open(updateUrl, '_blank');
                        instance.hide({
                            transitionOut: 'fadeOut'
                        }, toast, 'button');
                    }, true] // true = focus
                ]
            });
        } catch (e) {
            // silent: network or parse error
        }
    }

    function formatTimeShort(sec) {
        const s = Math.max(0, Math.floor(Number(sec) || 0));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const r = s % 60;
        return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
    }





    // ------------------------------
    // Feature: Like vs Dislike bar

    // ------------------------------
    function parseCountText(text) {
        if (!text) return null;
        const s0 = String(text).trim().toLowerCase();
        if (!s0) return null;
        let mult = 1;
        let s = s0.replace(/\s+/g, '');
        if (s.includes('mil')) {
            mult = 1000;
            s = s.replace('mil', '');
        } else if (s.includes('k')) {
            mult = 1000;
            s = s.replace('k', '');
        } else if (s.includes('m')) {
            mult = 1000000;
            s = s.replace('m', '');
        }
        // normalize decimal separators
        s = s.replace(/[^\d.,]/g, '');
        if (!s) return null;
        // If both separators exist, assume last is decimal
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        let nStr = s;
        if (lastDot !== -1 && lastComma !== -1) {
            const dec = Math.max(lastDot, lastComma);
            const intPart = s.slice(0, dec).replace(/[.,]/g, '');
            const decPart = s.slice(dec + 1);
            nStr = `${intPart}.${decPart}`;
        } else {
            // Use dot as decimal
            nStr = s.replace(',', '.');
        }
        const num = Number.parseFloat(nStr);
        if (!Number.isFinite(num)) return null;
        return Math.round(num * mult);
    }

    async function ensureDislikesForCurrentVideo() {
        const videoId = getCurrentVideoId();
        if (!videoId) return null;
        const now = Date.now();
        if (__ytToolsRuntime.dislikesCache.videoId === videoId && __ytToolsRuntime.dislikesCache.dislikes != null && (now - __ytToolsRuntime.dislikesCache.ts) < 10 * 60 * 1000) {
            return __ytToolsRuntime.dislikesCache;
        }
        const persisted = getLikesDislikesFromPersistedCache(videoId);
        if (persisted && persisted.dislikes != null) {
            __ytToolsRuntime.dislikesCache = {
                videoId,
                likes: persisted.likes,
                dislikes: persisted.dislikes,
                viewCount: persisted.viewCount,
                rating: persisted.rating,
                ts: now
            };
            return __ytToolsRuntime.dislikesCache;
        }
        try {
            const res = await fetch(`${apiDislikes}${videoId}`);
            const data = await res.json();
            const dislikes = Number(data?.dislikes);
            const likes = Number(data?.likes);
            const viewCount = Number(data?.viewCount);
            const rating = Number(data?.rating);
            const now = Date.now();

            if (Number.isFinite(dislikes)) {
                __ytToolsRuntime.dislikesCache = {
                    videoId,
                    likes: Number.isFinite(likes) ? likes : getLikesFromDom(),
                    dislikes,
                    viewCount,
                    rating,
                    ts: now
                };
                setLikesDislikesToPersistedCache(
                    videoId,
                    __ytToolsRuntime.dislikesCache.likes,
                    dislikes,
                    Number.isFinite(viewCount) ? viewCount : undefined,
                    (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined
                );
                return __ytToolsRuntime.dislikesCache;
            }
        } catch (e) {
            console.error('[YT Tools] Error fetching dislikes:', e);
        }
        return null;
    }

    // ------------------------------
    // Feature: History / Continue watching (per video)

    // ------------------------------
    function getMainVideoEl() {
        return (
            document.querySelector('#movie_player video.video-stream.html5-main-video') ||
            document.querySelector('ytd-player video.video-stream.html5-main-video') ||
            document.querySelector('video.video-stream.html5-main-video') ||
            document.querySelector('video')
        );
    }

    function getCurrentVideoMeta() {
        try {
            // DOM first (updates earlier on SPA navigation)
            const domTitle =
                $e('ytd-watch-metadata h1 yt-formatted-string')?.textContent?.trim() ||
                $e('h1.ytd-watch-metadata yt-formatted-string')?.textContent?.trim() ||
                '';
            const domAuthor =
                $e('#owner ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a, #text-container.ytd-channel-name a')?.textContent?.trim() ||
                $e('#owner a[href^="/@"], #owner a[href^="/channel/"]')?.textContent?.trim() ||
                '';
            const titleFromDom = (domTitle || document.title || '').replace(/\s*-\s*YouTube\s*$/i, '').trim();
            const authorFromDom = (domAuthor || '').trim();

            const w = (typeof unsafeWindow !== 'undefined' && unsafeWindow) ? unsafeWindow : window;
            const pr = w?.ytInitialPlayerResponse || window.ytInitialPlayerResponse;
            const vd = pr?.videoDetails || null;
            const title = (titleFromDom || vd?.title || document.title || '').replace(/\s*-\s*YouTube\s*$/i, '').trim();
            const author = (authorFromDom || vd?.author || '').trim();
            const thumbs = vd?.thumbnail?.thumbnails;
            const thumb = Array.isArray(thumbs) ? (thumbs[thumbs.length - 1]?.url || '') : '';
            return {
                title,
                author,
                thumb
            };
        } catch (e) {
            return {
                title: '',
                author: '',
                thumb: ''
            };
        }
    }

    function ensureContinueWatchingMapLoaded() {
        const rt = __ytToolsRuntime.continueWatching;
        if (!rt.map) rt.map = readJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, {});
        if (typeof rt.map !== 'object' || !rt.map) rt.map = {};
        return rt.map;
    }

    function pruneContinueWatchingMap(map, maxEntries = 200) {
        try {
            const entries = Object.entries(map || {}).filter(([, v]) => v && typeof v === 'object');
            entries.sort((a, b) => (Number(b[1].updatedAt) || 0) - (Number(a[1].updatedAt) || 0));
            const keep = entries.slice(0, maxEntries);
            const next = {};
            for (const [k, v] of keep) next[k] = v;
            return next;
        } catch (e) {
            return map || {};
        }
    }

    function scheduleContinueWatchingFlush() {
        const rt = __ytToolsRuntime.continueWatching;
        clearTimeout(rt.flushT);
        rt.flushT = setTimeout(() => {
            try {
                if (!rt.map) return;
                rt.map = pruneContinueWatchingMap(rt.map, 200);
                writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, rt.map);
            } catch (e) { }
        }, 800);
    }

    function clearContinueWatchingForVideo(videoId) {
        if (!videoId) return;
        const rt = __ytToolsRuntime.continueWatching;
        const map = ensureContinueWatchingMapLoaded();
        if (map && Object.prototype.hasOwnProperty.call(map, videoId)) {
            delete map[videoId];
            rt.map = map;
            scheduleContinueWatchingFlush();
        }
    }

    function setContinueWatchingForVideo(videoId, seconds, durationSec) {
        if (!videoId) return;
        const rt = __ytToolsRuntime.continueWatching;
        const map = ensureContinueWatchingMapLoaded();
        const t = Math.max(0, Math.floor(Number(seconds) || 0));
        const d = Math.max(0, Math.floor(Number(durationSec) || 0));
        const prev = map[videoId] && typeof map[videoId] === 'object' ? map[videoId] : {};
        const meta = getCurrentVideoMeta();
        map[videoId] = {
            t,
            d,
            updatedAt: Date.now(),
            title: meta.title || prev.title || '',
            author: meta.author || prev.author || '',
            thumb: meta.thumb || prev.thumb || '',
        };
        rt.map = map;
        scheduleContinueWatchingFlush();
    }

    function getContinueWatchingTime(videoId) {
        if (!videoId) return null;
        const map = ensureContinueWatchingMapLoaded();
        const entry = map?.[videoId];
        const t = Number(entry?.t);
        return Number.isFinite(t) ? t : null;
    }

    function updateContinueWatchingButton() {
        const rt = __ytToolsRuntime.continueWatching;
        const enabled = !!rt.enabled;
        if (!enabled || !isWatchPage()) return;

        const videoId = getCurrentVideoId();
        if (!videoId) return;

        const v = getMainVideoEl();
        const t = getContinueWatchingTime(videoId);
        const dur = Number(v?.duration);
        const hasDur = Number.isFinite(dur) && dur > 0;

        if (!t || t < 5) return;

        if (hasDur && t >= (dur - 5)) {
            clearContinueWatchingForVideo(videoId);
            return;
        }
    }

    function updateContinueWatchingHistoryUi() {
        const rt = __ytToolsRuntime.continueWatching;
        const btn = $id('yt-cw-history-toggle');
        const panel = $id('yt-continue-watching-panel');
        if (!btn || !panel) return;

        const enabled = !!rt.enabled;
        if (!enabled || !isWatchPage()) {
            btn.style.display = 'none';
            panel.style.display = 'none';
            return;
        }

        btn.style.display = 'inline-flex';
        panel.style.display = rt.panelOpen ? 'block' : 'none';
    }

    function cssEscapeLite(s) {
        const str = String(s || '');
        if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(str);
        // minimal escape for attribute selector
        return str.replace(/["\\]/g, '\\$&');
    }

    function updateContinueWatchingPanelRow(videoId) {
        try {
            const rt = __ytToolsRuntime.continueWatching;
            if (!rt.enabled || !rt.panelOpen || !isWatchPage()) return false;
            const panel = $id('yt-continue-watching-panel');
            if (!panel) return false;

            const key = cssEscapeLite(videoId);
            const row = panel.querySelector(`.yt-cw-item[data-video-id="${key}"]`);
            if (!row) return false;

            const entry = ensureContinueWatchingMapLoaded()?.[videoId];
            const t = Number(entry?.t);
            if (!Number.isFinite(t)) return false;

            const meta = row.querySelector('.yt-cw-meta');
            if (!meta) return false;
            const author = String(entry?.author || '').trim();
            meta.textContent = `${formatTimeShort(t)}${author ? ` • ${author}` : ''}`;
            return true;
        } catch (e) {
            return false;
        }
    }

    function navigateToWatchSpa(videoId, seconds) {
        const t = Number(seconds);
        const url = `/watch?v=${encodeURIComponent(videoId)}${Number.isFinite(t) ? `&t=${Math.max(0, Math.floor(t))}s` : ''}`;
        try {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_self';
            a.rel = 'noopener';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        } catch (e) { }
        location.href = url;
    }

    function renderContinueWatchingPanel() {
        const panel = $id('yt-continue-watching-panel');
        if (!panel) return;

        const rt = __ytToolsRuntime.continueWatching;
        if (!rt.enabled || !rt.panelOpen || !isWatchPage()) {
            panel.style.display = 'none';
            return;
        }

        const map = pruneContinueWatchingMap(ensureContinueWatchingMapLoaded(), 200);
        rt.map = map;
        const currentVid = getCurrentVideoId();

        const entries = Object.entries(map)
            .map(([videoId, v]) => ({
                videoId,
                ...v
            }))
            .filter((e) => e.videoId && Number.isFinite(Number(e.t)) && Number(e.t) >= 5)
            .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0))
            .slice(0, 25);

        panel.replaceChildren();

        const header = document.createElement('div');
        header.className = 'yt-cw-header';

        const hTitle = document.createElement('div');
        hTitle.className = 'yt-cw-header-title';
        hTitle.textContent = 'Continue watching';

        const clearAll = document.createElement('button');
        clearAll.type = 'button';
        clearAll.className = 'yt-cw-clear';
        clearAll.textContent = 'Clear';
        clearAll.dataset.cwAction = 'clearAll';

        header.appendChild(hTitle);
        header.appendChild(clearAll);
        panel.appendChild(header);

        if (!entries.length) {
            const empty = document.createElement('div');
            empty.className = 'yt-cw-empty';
            empty.textContent = 'No history yet. Watch a bit, then reopen any video.';
            panel.appendChild(empty);
            return;
        }

        for (const e of entries) {
            const item = document.createElement('div');
            item.className = 'yt-cw-item';
            item.dataset.videoId = e.videoId;

            const thumbWrap = document.createElement('div');
            thumbWrap.className = 'yt-cw-thumb-wrap';
            const img = document.createElement('img');
            img.className = 'yt-cw-thumb';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.alt = '';
            const thumbSrc = (e.thumb || '').trim() || `https://i.ytimg.com/vi/${encodeURIComponent(e.videoId)}/hqdefault.jpg`;
            img.src = thumbSrc;
            thumbWrap.appendChild(img);

            const info = document.createElement('div');
            info.className = 'yt-cw-info';

            const title = document.createElement('div');
            title.className = 'yt-cw-title';
            const safeTitle = (e.title || '').trim();
            title.textContent = safeTitle ? safeTitle : e.videoId;

            const meta = document.createElement('div');
            meta.className = 'yt-cw-meta';
            const author = (e.author || '').trim();
            meta.textContent = `${formatTimeShort(e.t)}${author ? ` • ${author}` : ''}`;

            info.appendChild(title);
            info.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'yt-cw-actions';

            const tSec = Math.max(0, Math.floor(Number(e.t) || 0));
            let go = null;
            if (currentVid && currentVid === e.videoId) {
                const seek = document.createElement('button');
                seek.type = 'button';
                seek.className = 'yt-cw-go';
                seek.textContent = 'Resume';
                seek.dataset.cwAction = 'seek';
                seek.dataset.t = String(tSec);
                go = seek;
            } else {
                const a = document.createElement('a');
                a.className = 'yt-simple-endpoint yt-cw-go';
                a.textContent = 'Resume';
                a.href = `/watch?v=${encodeURIComponent(e.videoId)}&t=${tSec}s`;
                a.target = '_self';
                a.rel = 'noopener';
                go = a;
            }

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'yt-cw-del';
            del.textContent = '✕';
            del.title = 'Delete';
            del.dataset.cwAction = 'del';
            del.dataset.videoId = e.videoId;

            actions.appendChild(go);
            actions.appendChild(del);

            item.appendChild(thumbWrap);
            item.appendChild(info);
            item.appendChild(actions);
            panel.appendChild(item);
        }
    }

    function setupContinueWatchingFeature(enabled) {
        const rt = __ytToolsRuntime.continueWatching;
        rt.enabled = !!enabled;

        // Keep UI in sync across YouTube SPA navigations
        if (!rt.navHandlerInitialized) {
            rt.navHandlerInitialized = true;
            const onNav = () => {
                try {
                    const vid = getCurrentVideoId();
                    if (rt.lastKnownVideoId !== vid) {
                        rt.lastKnownVideoId = vid;
                        // reset throttles so new video can save properly
                        rt.lastSaveAt = 0;
                        rt.lastSavedTime = -1;
                        rt.boundVideoId = vid;
                        updateContinueWatchingButton();
                        updateContinueWatchingHistoryUi();
                        if (rt.panelOpen) renderContinueWatchingPanel();
                    } else {
                        updateContinueWatchingButton();
                        updateContinueWatchingHistoryUi();
                        if (rt.panelOpen) renderContinueWatchingPanel();
                    }
                } catch (e) { }
            };
            window.addEventListener('yt-navigate-finish', onNav, true);
            window.addEventListener('popstate', onNav, true);
            window.addEventListener('hashchange', onNav, true);
        }

        // Ensure click handler only once
        if (!rt.clickHandlerInitialized) {
            rt.clickHandlerInitialized = true;
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!(target instanceof Element)) return;
                const historyBtn = target.closest('#yt-cw-history-toggle');
                const cwActionBtn = target.closest('[data-cw-action]');

                if (historyBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    rt.panelOpen = !rt.panelOpen;
                    updateContinueWatchingHistoryUi();
                    if (rt.panelOpen) renderContinueWatchingPanel(); // render only when opened
                    return;
                }

                if (cwActionBtn) {
                    const action = cwActionBtn.getAttribute('data-cw-action');
                    if (!action) return;
                    e.preventDefault();
                    e.stopPropagation();
                    if (action === 'clearAll') {
                        rt.map = {};
                        writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, {});
                        renderContinueWatchingPanel();
                        updateContinueWatchingButton();
                        try {
                            Notify('success', 'History cleared');
                        } catch (e2) { }
                        return;
                    }
                    if (action === 'del') {
                        const vid = cwActionBtn.getAttribute('data-video-id') || '';
                        if (vid) clearContinueWatchingForVideo(vid);
                        renderContinueWatchingPanel();
                        updateContinueWatchingButton();
                        return;
                    }
                    if (action === 'seek') {
                        const t = Number(cwActionBtn.getAttribute('data-t'));
                        const v = getMainVideoEl();
                        if (!v || !Number.isFinite(t)) return;
                        v.currentTime = Math.max(0, t);
                        v.play?.().catch(() => { });
                        try {
                            Notify('success', `Resume: ${formatTimeShort(t)}`);
                        } catch (e2) { }
                        updateContinueWatchingButton();
                        return;
                    }
                }
            }, true);
        }

        // Save on tab close / navigation (once)
        if (!rt.pagehideHandlerInitialized) {
            rt.pagehideHandlerInitialized = true;
            window.addEventListener('pagehide', () => {
                try {
                    if (!rt.enabled) return;
                    if (!isWatchPage()) return;
                    const vid = getCurrentVideoId();
                    const v = getMainVideoEl();
                    if (!vid || !v) return;
                    const t = Number(v.currentTime);
                    const d = Number(v.duration);
                    if (Number.isFinite(t) && t >= 5) setContinueWatchingForVideo(vid, t, d);
                    // best-effort immediate flush
                    if (rt.flushT) {
                        clearTimeout(rt.flushT);
                        rt.flushT = null;
                    }
                    if (rt.map) writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, pruneContinueWatchingMap(rt.map, 200));
                } catch (e) { }
            }, {
                capture: true
            });
        }

        const historyBtn = $id('yt-cw-history-toggle');
        const panel = $id('yt-continue-watching-panel');
        if (historyBtn && !rt.enabled) historyBtn.style.display = 'none';
        if (panel && !rt.enabled) panel.style.display = 'none';

        // Not on watch page: detach video listeners and hide
        if (!rt.enabled || !isWatchPage()) {
            try {
                if (rt.boundVideo && rt.handlers) {
                    rt.boundVideo.removeEventListener('timeupdate', rt.handlers.timeupdate);
                    rt.boundVideo.removeEventListener('pause', rt.handlers.pause);
                    rt.boundVideo.removeEventListener('ended', rt.handlers.ended);
                    rt.boundVideo.removeEventListener('loadedmetadata', rt.handlers.loadedmetadata);
                    rt.boundVideo.removeEventListener('seeked', rt.handlers.seeked);
                }
            } catch (e) { }
            rt.boundVideo = null;
            rt.boundVideoId = null;
            rt.handlers = null;
            updateContinueWatchingButton();
            updateContinueWatchingHistoryUi();
            return;
        }

        const v = getMainVideoEl();
        const videoId = getCurrentVideoId();
        if (!v || !videoId) {
            updateContinueWatchingButton();
            updateContinueWatchingHistoryUi();
            return;
        }

        // VideoId can change while YouTube reuses the same <video> element
        if (rt.boundVideoId !== videoId) {
            rt.boundVideoId = videoId;
            rt.lastSaveAt = 0;
            rt.lastSavedTime = -1;
        }

        // If video element changed, rebind listeners (avoid leaks)
        if (rt.boundVideo && rt.boundVideo !== v && rt.handlers) {
            try {
                rt.boundVideo.removeEventListener('timeupdate', rt.handlers.timeupdate);
                rt.boundVideo.removeEventListener('pause', rt.handlers.pause);
                rt.boundVideo.removeEventListener('ended', rt.handlers.ended);
                rt.boundVideo.removeEventListener('loadedmetadata', rt.handlers.loadedmetadata);
                rt.boundVideo.removeEventListener('seeked', rt.handlers.seeked);
            } catch (e) { }
            rt.boundVideo = null;
            rt.boundVideoId = null;
            rt.handlers = null;
        }

        rt.boundVideo = v;
        rt.boundVideoId = videoId;

        if (!rt.handlers) {
            rt.handlers = {
                timeupdate: () => {
                    try {
                        if (!rt.enabled) return;
                        const vid = getCurrentVideoId();
                        if (!vid) return;
                        const now = Date.now();
                        if (now - rt.lastSaveAt < 5000) return; // throttle
                        if (v.paused) return;
                        const t = Number(v.currentTime);
                        const d = Number(v.duration);
                        if (!Number.isFinite(t)) return;
                        if (Math.abs(t - rt.lastSavedTime) < 2) return;
                        rt.lastSaveAt = now;
                        rt.lastSavedTime = t;
                        if (t < 5) return;
                        setContinueWatchingForVideo(vid, t, d);
                        updateContinueWatchingButton();
                        // Avoid re-rendering the whole panel every few seconds.
                        // If panel is open and row exists, just update its text.
                        if (rt.panelOpen) {
                            if (!updateContinueWatchingPanelRow(vid)) renderContinueWatchingPanel();
                        }
                    } catch (e) { }
                },
                pause: () => {
                    try {
                        if (!rt.enabled) return;
                        const vid = getCurrentVideoId();
                        if (!vid) return;
                        const t = Number(v.currentTime);
                        const d = Number(v.duration);
                        if (!Number.isFinite(t)) return;
                        if (t < 5) {
                            clearContinueWatchingForVideo(vid);
                        } else {
                            setContinueWatchingForVideo(vid, t, d);
                        }
                        updateContinueWatchingButton();
                        if (rt.panelOpen) {
                            if (!updateContinueWatchingPanelRow(vid)) renderContinueWatchingPanel();
                        }
                    } catch (e) { }
                },
                ended: () => {
                    try {
                        const vid = getCurrentVideoId();
                        if (vid) clearContinueWatchingForVideo(vid);
                        updateContinueWatchingButton();
                        if (rt.panelOpen) renderContinueWatchingPanel();
                    } catch (e) { }
                },
                loadedmetadata: () => {
                    updateContinueWatchingButton();
                    if (rt.panelOpen) renderContinueWatchingPanel();
                },
                seeked: () => {
                    updateContinueWatchingButton();
                    const vid = getCurrentVideoId();
                    if (rt.panelOpen && vid) updateContinueWatchingPanelRow(vid);
                },
            };

            v.addEventListener('timeupdate', rt.handlers.timeupdate, {
                passive: true
            });
            v.addEventListener('pause', rt.handlers.pause, {
                passive: true
            });
            v.addEventListener('ended', rt.handlers.ended, {
                passive: true
            });
            v.addEventListener('loadedmetadata', rt.handlers.loadedmetadata, {
                passive: true
            });
            v.addEventListener('seeked', rt.handlers.seeked, {
                passive: true
            });
        }

        updateContinueWatchingButton();
        updateContinueWatchingHistoryUi();
    }



    function checkDarkModeActive() {
        // YTM is always dark mode
        if (isYTMusic) return 'dark';

        const prefCookie = document.cookie.split('; ').find(c => c.startsWith('PREF='));
        if (!prefCookie) return 'light';

        const prefValue = prefCookie.substring(5);
        const params = new URLSearchParams(prefValue);

        const f6Value = params.get('f6');
        const darkModes = ['400', '4000000', '40000400', '40000000'];

        return darkModes.includes(f6Value) ? 'dark' : 'light';
    }


    let isDarkModeActive = checkDarkModeActive();


    // Use Trusted Types to set innerHTML
    const menuHTML = `
   <div class="container-mdcm">
    <div class="header-mdcm">
      <h1> <i class="fa-brands fa-youtube"></i> YouTube Tools</h1>
      <div class="icons-mdcm">
        <a href="https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js"
          target="_blank">
          <button class="icon-btn-mdcm">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </a>
        <a href="https://github.com/akari310" target="_blank">
          <button class="icon-btn-mdcm">
            <i class="fa-brands fa-github"></i>
          </button>
        </a>
        <button class="icon-btn-mdcm" id="shareBtn-mdcm">
          <i class="fa-solid fa-share-alt"></i>
        </button>
        <button class="icon-btn-mdcm" id="importExportBtn">
          <i class="fa-solid fa-file-import"></i>
        </button>
        <button id="menu-settings-icon" class="icon-btn-mdcm tab-mdcm" data-tab="menu-settings">
          <i class="fa-solid fa-gear"></i>
        </button>
        <button class="icon-btn-mdcm close_menu_settings">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <div class="tabs-mdcm">
      <button class="tab-mdcm active" data-tab="general">
        <i class="fa-solid fa-shield-halved"></i>
        General
      </button>
      <button class="tab-mdcm" data-tab="themes">
        <i class="fa-solid fa-palette"></i>
        Themes
      </button>
      <button class="tab-mdcm" data-tab="stats">
        <i class="fa-solid fa-square-poll-vertical"></i>
        Stats
      </button>
      <button class="tab-mdcm" data-tab="headers">
        <i class="fa-regular fa-newspaper"></i>
        Header
      </button>
    </div>


    <div id="general" class="tab-content active">

      <div class="options-mdcm">
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="hide-comments-toggle"> Hide Comments
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="hide-sidebar-toggle"> Hide Sidebar
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="autoplay-toggle"> Disable Autoplay
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="subtitles-toggle"> Disable Subtitles
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="dislikes-toggle"> Show Dislikes
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="like-dislike-bar-toggle"> Like vs Dislike bar
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="bookmarks-toggle"> Bookmarks (timestamps)
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="continue-watching-toggle"> Continue watching
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="shorts-channel-name-toggle"> Shorts: show channel name
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="nonstop-playback-toggle"> Nonstop playback
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="audio-only-toggle"> Audio-only mode
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="audio-only-tab-toggle"> Audio-only this tab
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="themes-toggle"> Active Themes
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="translation-toggle"> Translate comments
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="avatars-toggle"> Download avatars
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="reverse-mode-toggle"> Reverse mode
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="cinematic-lighting-toggle"> ${isYTMusic ? 'Ambient Mode' : 'Cinematic Mode'}
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="wave-visualizer-toggle"> Wave visualizer Beta
          </div>
        </label>
        <label ${!isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="custom-timeline-color-toggle"> Royal Purple Timeline
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2; ${!isYTMusic ? 'display:none' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Side Panel Style (YTM):
              <select class="tab-button-active" id="side-panel-style-select">
                <option value="blur">Blur</option>
                <option value="liquid">Liquid Glass</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>
          </div>
        </div>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle"> Sync Ambient Mode YT
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2;">
          <div class="select-wrapper-mdcm">
            <label>Effect wave visualizer:
              <select class="tab-button-active" id="select-wave-visualizer-select">
                <option value="linea">Line smooth</option>
                <option value="barras">Vertical bars</option>
                <option value="curva">Curved</option>
                <option value="picos">Smooth peaks</option>
                <option value="solida">Solid wave</option>
                <option value="dinamica">Dynamic wave</option>
                <option value="montana">Smooth mountain</option>
              </select>
            </label>
          </div>
        </div>
        <div class="quality-selector-mdcm" style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Default video player quality:
              <select class="tab-button-active" id="select-video-qualitys-select">
                <option value="user">User Default</option>
                <option value="">Auto</option>
                <option value="144">144</option>
                <option value="240">240</option>
                <option value="360">360</option>
                <option value="480">480</option>
                <option value="720">720</option>
                <option value="1080">1080</option>
                <option value="1440">1440</option>
                <option value="2160">2160</option>
                <option value="4320">4320</option>
              </select>
            </label>
          </div>
        </div>
        <div class="quality-selector-mdcm" style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Language for translate comments:
              <select class="tab-button-active" id="select-languages-comments-select">
              ${languageOptionsHTML}
              </select>
            </label>
          </div>
        </div>
        <div class="slider-container-mdcm" style="grid-column: span 2;">
          <label>Video Player Size: <span id="player-size-value">100</span>%</label>
          <input type="range" id="player-size-slider" class="slider-mdcm" min="50" max="150" value="100">
          <button class="reset-btn-mdcm" id="reset-player-size">Reset video size</button>
        </div>
      </div>
    </div>

    <div id="themes" class="tab-content">
     <div id="background-image-container" class="background-image-container">
     <h4>Background Image</h4>
  <input type="file" id="background_image" accept="image/png, image/jpeg" style="display:none;" />
  <div id="background-image-preview" class="background-image-preview">
    <span class="background-image-overlay">
      <i class="fa fa-camera"></i>
      <span class="background-image-text">Select image</span>
    </span>
    <button id="remove-background-image" class="remove-background-image" title="Quitar fondo">&times;</button>
  </div>
</div>
      <div class="themes-hidden">
        <div class="options-mdcm" style="margin-bottom: 10px;">
          <div>
            <h4>Choose a Theme</h4>
            <p>Disable Mode Cinematic on General</p>
            ${isDarkModeActive === 'dark' ? '' : '<p style="color: red; margin: 10px 0;font-size: 11px;">Activate dark mode to use this option</p>'}
          </div>
        </div>
        <div class="options-mdcm">
          <label>
            <div class="theme-option option-mdcm">
              <input type="radio" class="radio-mdcm" name="theme" value="custom" checked>
              <span class="theme-name">Custom</span>
            </div>
          </label>
          <label>
            <div class="theme-option option-mdcm theme-selected-normal">
              <input type="radio" class="radio-mdcm" name="theme" value="normal">
              <span class="theme-name">Selected Themes</span>
            </div>
          </label>
        </div>
        <div class="themes-options">
          <div class="options-mdcm">
            ${themeOptionsHTML}
          </div>
        </div>
        <div class="theme-custom-options">
          <div class="options-mdcm">
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Progressbar Video:</label>
                <input type="color" id="progressbar-color-picker" class="color-picker-mdcm" value="#ff0000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Background Color:</label>
                <input type="color" id="bg-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Primary Color:</label>
                <input type="color" id="primary-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Secondary Color:</label>
                <input type="color" id="secondary-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Header Color:</label>
                <input type="color" id="header-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Icons Color:</label>
                <input type="color" id="icons-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Menu Color:</label>
                <input type="color" id="menu-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Line Color Preview:</label>
                <input type="color" id="line-color-picker" class="color-picker-mdcm" value="#ff0000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Time Color Preview:</label>
                <input type="color" id="time-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="stats" class="tab-content">
      <div id="yt-stats-toggle">
        <div class="stat-row">
          <div>Foreground Time</div>
          <div class="progress">
            <div class="progress-bar total-bar" id="usage-bar"></div>
          </div>
          <div id="total-time">0h 0m 0s</div>
        </div>
        <div class="stat-row">
          <div>Video Time</div>
          <div class="progress">
            <div class="progress-bar video-bar" id="video-bar"></div>
          </div>
          <div id="video-time">0h 0m 0s</div>
        </div>
        <div class="stat-row">
          <div>Shorts Time</div>
          <div class="progress">
            <div class="progress-bar shorts-bar" id="shorts-bar"></div>
          </div>
          <div id="shorts-time">0h 0m 0s</div>
        </div>
      </div>
    </div>

    <div id="headers" class="tab-content">
      <div class="options-mdcm">
        <label>Available in next update</label>
      </div>
    </div>


    <div id="menu-settings" class="tab-content">
      <div class="options-mdcm">
        <h4 style="margin: 10px 0">Menu Appearance</h4>
      </div>
      <div class="options-settings-mdcm">
        <div class="option-settings-mdcm">
          <label>Backgrounds:</label>
          <div class="color-boxes" id="bg-color-options">
            <div class="color-box" data-type="bg" data-value="#252525" style="background-color: #252525;"></div>
            <div class="color-box" data-type="bg" data-value="#1e1e1e" style="background-color: #1e1e1e;"></div>
            <div class="color-box" data-type="bg" data-value="#3a3a3a" style="background-color: #3a3a3a;"></div>
            <div class="color-box" data-type="bg" data-value="#4a4a4a" style="background-color: #4a4a4a;"></div>
            <div class="color-box" data-type="bg" data-value="#000000" style="background-color: #000000;"></div>
            <div class="color-box" data-type="bg" data-value="#00000000" style="background-color: #00000000;"></div>
            <div class="color-box" data-type="bg" data-value="#2d2d2d" style="background-color: #2d2d2d;"></div>
            <div class="color-box" data-type="bg" data-value="#444" style="background-color: #444;"></div>
          </div>
        </div>

        <div class="option-settings-mdcm">
          <label>Accent Colors:</label>
          <div class="color-boxes" id="bg-accent-color-options">
            <div class="color-box" data-type="accent" data-value="#ff0000" style="background-color: #ff0000;"></div>
            <div class="color-box" data-type="accent" data-value="#000000" style="background-color: #000000;"></div>
            <div class="color-box" data-type="accent" data-value="#009c37 " style="background-color: #009c37 ;"></div>
            <div class="color-box" data-type="accent" data-value="#0c02a0 " style="background-color: #0c02a0 ;"></div>
          </div>
        </div>

        <div class="option-settings-mdcm">
          <label>Titles Colors:</label>
          <div class="color-boxes" id="text-color-options">
            <div class="color-box" data-type="color" data-value="#ffffff" style="background-color: #ffffff;"></div>
            <div class="color-box" data-type="color" data-value="#cccccc" style="background-color: #cccccc;"></div>
            <div class="color-box" data-type="color" data-value="#b3b3b3" style="background-color: #b3b3b3;"></div>
            <div class="color-box" data-type="color" data-value="#00ffff" style="background-color: #00ffff;"></div>
            <div class="color-box" data-type="color" data-value="#00ff00" style="background-color: #00ff00;"></div>
            <div class="color-box" data-type="color" data-value="#ffff00" style="background-color: #ffff00;"></div>
            <div class="color-box" data-type="color" data-value="#ffcc00" style="background-color: #ffcc00;"></div>
            <div class="color-box" data-type="color" data-value="#ff66cc" style="background-color: #ff66cc;"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="importExportArea">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3>Import / Export Settings</h3>
        <button class="icon-btn-mdcm" id="closeImportExportBtn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <textarea id="config-data" placeholder="Paste configuration here to import"></textarea>
      <div class="action-buttons-mdcm">
        <button id="export-config" class="action-btn-mdcm">Export</button>
        <button id="import-config" class="action-btn-mdcm">Import</button>
      </div>
    </div>

    <div id="shareDropdown">
      <a href="https://www.facebook.com/sharer/sharer.php?u=${urlSharedCode}" target="_blank" data-network="facebook"
        class="share-link"><i class="fa-brands fa-facebook"></i> Facebook</a><br>
      <a href="https://twitter.com/intent/tweet?url=${urlSharedCode}" target="_blank" data-network="twitter"
        class="share-link"><i class="fa-brands fa-twitter"></i> Twitter</a><br>
      <a href="https://api.whatsapp.com/send?text=${urlSharedCode}" target="_blank" data-network="whatsapp"
        class="share-link"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a><br>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${urlSharedCode}" target="_blank"
        data-network="linkedin" class="share-link"><i class="fa-brands fa-linkedin"></i> LinkedIn</a><br>
    </div>


  </div>
  <div class="actions-mdcm">
    <div class="developer-mdcm">
      <div style="font-size: 11px; opacity: 0.9; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; line-height: 1.6;">
        Developed by <a href="https://github.com/akari310" target="_blank" style="color: #ff4444; text-decoration: none;"><i class="fa-brands fa-github"></i> Akari</a>. 
        Base by <a href="https://github.com/DeveloperMDCM" target="_blank" style="color: #00aaff; text-decoration: none;"><i class="fa-brands fa-github"></i> MDCM</a>. 
        Features from <a href="https://github.com/nvbangg" target="_blank" style="color: #00ffaa; text-decoration: none;"><i class="fa-brands fa-github"></i> nvbangg</a>.
      </div>
    </div>
    <span style="color: #fff" ;>v0.0.5.7</span>
  </div>
  `;
    panel.innerHTML = safeHTML(menuHTML);

    $ap(panel);


    let headerObserver = null;
    function setupHeaderObserver() {
        if (headerObserver) return;
        const target = $e('#masthead-container') || $e('ytd-masthead') || document.body;
        headerObserver = new MutationObserver(() => {
            const icon = $id('icon-menu-settings');
            if (!icon || !document.body.contains(icon)) {
                addIcon();
            }
        });
        headerObserver.observe(target, { childList: true, subtree: true });
    }

    function addIcon() {
        const existing = $id('icon-menu-settings');
        if (existing && document.body.contains(existing)) return;
        if (existing) existing.closest('#toggle-button')?.remove();

        let anchor;
        if (isYTMusic) {
            anchor = $e('#right-content');
        } else {
            anchor = $e('ytd-topbar-menu-button-renderer') || $e('#buttons') || $e('#end');
        }
        if (!anchor) return;

        const toggleButton = $cl('div');
        toggleButton.id = 'toggle-button';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.marginRight = '8px';

        const icon = $cl('i');
        icon.id = 'icon-menu-settings';
        icon.classList.add('fa-solid', 'fa-gear');
        icon.style.fontSize = '20px';

        toggleButton.appendChild(icon);

        if (isYTMusic) {
            anchor.insertBefore(toggleButton, anchor.firstChild);
        } else {
            anchor.parentElement.insertBefore(toggleButton, anchor);
        }

        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        setupHeaderObserver();
    }

    let openMenu = false;
    function toggleMenu() {
        openMenu = !openMenu;
        panel.style.display = openMenu ? 'block' : 'none';
        panelOverlay.style.display = openMenu ? 'block' : 'none';
    }

    // Close panel when clicking the overlay
    panelOverlay.addEventListener('click', () => {
        if (openMenu) {
            toggleMenu();
        }
    });


    addIcon();
    const close_menu_settings = $e('.close_menu_settings');
    if (close_menu_settings) {
        close_menu_settings.addEventListener('click', () => {
            toggleMenu();
        });
    }

    // $ap(toggleButton);
    
    // Add change listener to the entire panel to save/apply settings immediately
    panel.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox-mdcm') || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
            saveSettings();
            if (typeof applySettings === 'function') {
                applySettings();
            }
        }
    });

    // Specific listeners for live updates of certain features
    $id('dislikes-toggle')?.addEventListener('change', () => {
        const st = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        if (!st.dislikes) {
            // Hide dislikes if turned off
            const dislikes_content = $e('#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button');
            if (dislikes_content) {
                // We don't have the original SVG easily, but we can at least hide our custom one or clear it
                // For now, let's just trigger a reload message or try to refresh the component
                // Actually, the user just wants it to go away.
                dislikes_content.style.width = '';
                // We'll let applySettings handle the bar, but for the button, we might need a refresh or more complex logic.
                // But let's try to at least call applySettings.
            }
        }
    });



    // Tab functionality
    const tabButtons = $m('.tab-mdcm');
    const tabContents = $m('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));
            button.classList.add('active');
            $id(tabName).classList.add('active');
        });
    });

    // Function to save settings
    function saveSettings() {
        const settings = {
            theme: $e('input[name="theme"]:checked').value,
            bgColorPicker: $id('bg-color-picker').value,
            progressbarColorPicker: $id('progressbar-color-picker').value,
            primaryColorPicker: $id('primary-color-picker').value,
            secondaryColorPicker: $id('secondary-color-picker').value,
            headerColorPicker: $id('header-color-picker').value,
            iconsColorPicker: $id('icons-color-picker').value,
            menuColorPicker: $id('menu-color-picker').value,
            lineColorPicker: $id('line-color-picker').value,
            timeColorPicker: $id('time-color-picker').value,
            dislikes: $id('dislikes-toggle').checked,
            likeDislikeBar: $id('like-dislike-bar-toggle').checked,
            bookmarks: $id('bookmarks-toggle').checked,
            continueWatching: $id('continue-watching-toggle').checked,
            shortsChannelName: $id('shorts-channel-name-toggle').checked,
            nonstopPlayback: $id('nonstop-playback-toggle') ? $id('nonstop-playback-toggle').checked : true,
            audioOnly: $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false,
            themes: $id('themes-toggle').checked,
            translation: $id('translation-toggle').checked,
            avatars: $id('avatars-toggle').checked,
            reverseMode: $id('reverse-mode-toggle').checked,
            waveVisualizer: $id('wave-visualizer-toggle').checked,
            waveVisualizerSelected: $id('select-wave-visualizer-select').value,
            hideComments: $id('hide-comments-toggle').checked,
            hideSidebar: $id('hide-sidebar-toggle').checked,
            disableAutoplay: $id('autoplay-toggle').checked,
            cinematicLighting: $id('cinematic-lighting-toggle').checked,
            syncCinematic: $id('sync-cinematic-toggle') ? $id('sync-cinematic-toggle').checked : false, // NUEVO SETTING
            sidePanelStyle: $id('side-panel-style-select') ? $id('side-panel-style-select').value : 'normal',
            customTimelineColor: $id('custom-timeline-color-toggle') ? $id('custom-timeline-color-toggle').checked : false,
            disableSubtitles: $id('subtitles-toggle') ? $id('subtitles-toggle').checked : false,
            // fontSize: $id('font-size-slider').value,
            playerSize: $id('player-size-slider').value,
            selectVideoQuality: $id('select-video-qualitys-select').value,
            languagesComments: $id('select-languages-comments-select').value,
            // menuBgColor: $id('menu-bg-color-picker').value,
            // menuTextColor: $id('menu-text-color-picker').value,
            menu_akari: {
                bg: selectedBgColor,
                color: selectedTextColor,
                accent: selectedBgAccentColor
            }
            // menuFontSize: $id('menu-font-size-slider').value,
        };

        GM_setValue(SETTINGS_KEY, JSON.stringify(settings));
    }



    // Function to load settings
    function loadSettings() {
        const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        // Mark as loaded early so applySettings/saveSettings don't overwrite persisted values with defaults.
        __ytToolsRuntime.settingsLoaded = true;

        if (settings.theme) {
            $e(`input[name="theme"][value="${settings.theme}"]`).checked = true;
        }
        const menuData = settings.menu_akari || settings.menu_developermdcm || {
            bg: "#252525",
            color: "#ffffff",
            accent: "#ff0000"
        };

        $id('bg-color-picker').value = settings.bgColorPicker || '#000000';
        $id('progressbar-color-picker').value = settings.progressbarColorPicker || '#ff0000';
        $id('primary-color-picker').value = settings.primaryColorPicker || '#ffffff';
        $id('secondary-color-picker').value = settings.secondaryColorPicker || '#ffffff';
        $id('header-color-picker').value = settings.headerColorPicker || '#000';
        $id('icons-color-picker').value = settings.iconsColorPicker || '#ffffff';
        $id('menu-color-picker').value = settings.menuColorPicker || '#000';
        $id('line-color-picker').value = settings.lineColorPicker || '#ff0000';
        $id('time-color-picker').value = settings.timeColorPicker || '#ffffff';
        $id('dislikes-toggle').checked = settings.dislikes || false;
        $id('like-dislike-bar-toggle').checked = settings.likeDislikeBar || false;
        $id('bookmarks-toggle').checked = settings.bookmarks || false;
        $id('continue-watching-toggle').checked = settings.continueWatching || false;
        $id('shorts-channel-name-toggle').checked = settings.shortsChannelName || false;
        if ($id('nonstop-playback-toggle')) $id('nonstop-playback-toggle').checked = settings.nonstopPlayback !== false;
        if ($id('audio-only-toggle')) $id('audio-only-toggle').checked = settings.audioOnly || false;
        syncAudioOnlyTabCheckbox(settings);
        $id('themes-toggle').checked = settings.themes || false;
        $id('translation-toggle').checked = settings.translation || false;
        $id('avatars-toggle').checked = settings.avatars || false;
        $id('reverse-mode-toggle').checked = settings.reverseMode || false;
        $id('wave-visualizer-toggle').checked = settings.waveVisualizer || false;
        $id('select-wave-visualizer-select').value = settings.waveVisualizerSelected || 'dinamica';
        $id('hide-comments-toggle').checked = settings.hideComments || false;
        $id('hide-sidebar-toggle').checked = settings.hideSidebar || false;
        $id('autoplay-toggle').checked = settings.disableAutoplay || false;
        $id('cinematic-lighting-toggle').checked = settings.cinematicLighting || false;
        if ($id('sync-cinematic-toggle')) $id('sync-cinematic-toggle').checked = settings.syncCinematic || false;
        if ($id('side-panel-style-select')) $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';
        if ($id('custom-timeline-color-toggle')) $id('custom-timeline-color-toggle').checked = settings.customTimelineColor || false;
        if ($id('subtitles-toggle')) $id('subtitles-toggle').checked = settings.disableSubtitles || false;
        $id('player-size-slider').value = settings.playerSize || 100;
        $id('select-video-qualitys-select').value = settings.selectVideoQuality || 'user';
        $id('select-languages-comments-select').value = settings.languagesComments || 'en';

        selectedBgColor = menuData.bg;
        selectedTextColor = menuData.color;
        selectedBgAccentColor = menuData.accent;


        $m('#bg-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedBgColor);
        });

        $m('#text-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedTextColor);
        });

        $m('#bg-accent-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedBgAccentColor);
        });

        // Apply menu colors
        $sp('--yt-enhance-menu-bg', selectedBgColor);
        $sp('--yt-enhance-menu-text', selectedTextColor);
        $sp('--yt-enhance-menu-accent', selectedBgAccentColor);
        updateSliderValues();

        setTimeout(() => {
            applySettings();
            if (settings.dislikes && !isYTMusic) {
                videoDislike();
                shortDislike();
                showDislikes = true;
            }

            if (!isYTMusic && window.location.href.includes('youtube.com/watch?v=')) {
                detectInitialCinematicState();
            }
        }, 500);
    }

    // Check if the video is in cinematic mode
    async function detectInitialCinematicState() {
        return new Promise((resolve) => {
            const waitForVideo = () => {
                const video = $e('video');
                const cinematicDiv = $id('cinematics');

                if (!video || !cinematicDiv || isNaN(video.duration) || video.duration === 0) {
                    setTimeout(waitForVideo, 500);
                    return;
                }

                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                if (!settings.syncCinematic) {
                    // apply cinematic toggle
                    const cinematicToggle = $id('cinematic-lighting-toggle');
                    if (cinematicToggle && cinematicDiv) {
                        cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
                    }
                    resolve(false);
                    return;
                }

                const startTime = video.currentTime;
                const checkPlayback = () => {
                    if (video.currentTime >= startTime + 1) {
                        const isActive = isCinematicActive();

                        const cinematicToggle = $id('cinematic-lighting-toggle');
                        if (cinematicToggle && cinematicToggle.checked !== isActive) {
                            cinematicToggle.checked = isActive;
                            saveSettings();
                        }

                        resolve(isActive);
                    } else {
                        setTimeout(checkPlayback, 300);
                    }
                };

                checkPlayback();
            };

            waitForVideo();
        });
    }

    $m('.color-box').forEach(box => {
        box.addEventListener('click', () => {
            const type = box.dataset.type;
            const value = box.dataset.value;

            if (type === 'bg') {
                selectedBgColor = value;
                $sp('--yt-enhance-menu-bg', value);
                $m('#bg-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            } else if (type === 'color') {
                selectedTextColor = value;
                $sp('--yt-enhance-menu-text', value);
                $m('#text-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            } else if (type === 'accent') {
                selectedBgAccentColor = value;
                $sp('--yt-enhance-menu-accent', value);
                $m('#bg-accent-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            }
            saveSettings();
        });
    });


    function updateSliderValues() {
        $id('player-size-value').textContent = $id('player-size-slider').value;

    }

    $id('reset-player-size').addEventListener('click', () => {
        $id('player-size-slider').value = 100;
        updateSliderValues();
        applySettings();
    });

    // Initialize header buttons once
    function initializeHeaderButtons() {
        const shareBtn = $id('shareBtn-mdcm');
        const importExportBtn = $id('importExportBtn');
        const closeImportExportBtn = $id('closeImportExportBtn');

        if (shareBtn && !shareBtn.dataset.initialized) {
            shareBtn.dataset.initialized = 'true';
            shareBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                const dropdown = $id('shareDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }

        if (importExportBtn && !importExportBtn.dataset.initialized) {
            importExportBtn.dataset.initialized = 'true';
            importExportBtn.addEventListener('click', function () {
                const importExportArea = $id('importExportArea');
                if (importExportArea) {
                    importExportArea.classList.toggle('active');
                }
            });
        }

        if (closeImportExportBtn && !closeImportExportBtn.dataset.initialized) {
            closeImportExportBtn.dataset.initialized = 'true';
            closeImportExportBtn.addEventListener('click', function () {
                const importExportArea = $id('importExportArea');
                if (importExportArea) {
                    importExportArea.classList.remove('active');
                }
            });
        }
    }



    // Persistent check to ensure the gear icon survives YouTube's dynamic UI updates
    // setupHeaderObserver() is now called inside addIcon()


    function getDynamicThemeCss(settings, selectedTheme) {
        let css = `
            .botones_div {
                background-color: transparent;
                border: none;
                color: #999999;
                user-select: none;
            }
            .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox {
                background: ${selectedTheme.gradient} !important;
            }
            #background.ytd-masthead { background: ${selectedTheme.gradient} !important; }
            .ytp-swatch-background-color {
                background: ${selectedTheme.gradient} !important;
            }
            html, body { 
                background-color: #0f0f0f !important;
            }
            ytd-app, #content.ytd-app, #page-manager.ytd-app, ytd-browse, ytd-watch-flexy,
            ytd-two-column-browse-results-renderer, #primary.ytd-two-column-browse-results-renderer,
            #secondary.ytd-two-column-browse-results-renderer, ytd-rich-grid-renderer,
            #contents.ytd-rich-grid-renderer, ytd-item-section-renderer,
            ytd-comments-header-renderer, ytd-comment-simplebox-renderer,
            ytd-comment-thread-renderer, ytd-comment-renderer, #header.ytd-item-section-renderer,
            #body.ytd-comment-renderer, #author-thumbnail.ytd-comment-simplebox-renderer,
            #cinematic-shorts-scrim.ytd-shorts, ytd-comment-view-model,
            ytd-comment-engagement-bar, ytd-comment-replies-renderer, #anchored-panel.ytd-shorts,
            #cinematic-container.ytd-reel-video-renderer, #shorts-cinematic-container,
            .short-video-container.ytd-reel-video-renderer, ytd-reel-video-renderer,
            .navigation-container.ytd-shorts, .navigation-button.ytd-shorts { 
                background: transparent !important; 
            }
            #cinematic-container.ytd-reel-video-renderer, #shorts-cinematic-container, #cinematic-shorts-scrim.ytd-shorts {
                display: none !important; opacity: 0 !important; visibility: hidden !important;
            }
            #masthead-container.ytd-app, #background.ytd-masthead { 
                background: ${selectedTheme.gradient} !important;
            }
            #header.ytd-rich-grid-renderer, ytd-feed-filter-chip-bar-renderer, #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
                background: transparent !important;
            }
            .navigation-container.ytd-shorts {
                display: flex !important; flex-direction: column !important; justify-content: center !important;
                gap: 12px !important; height: 100% !important; top: 0 !important; bottom: 0 !important;
                margin: 0 !important; background: transparent !important; background-color: transparent !important;
            }
            #navigation-button-up[aria-hidden="true"], #navigation-button-up[aria-hidden=""], #navigation-button-up[hidden],
            #navigation-button-down[aria-hidden="true"], #navigation-button-down[aria-hidden=""], #navigation-button-down[hidden] {
                display: none !important;
            }
            #frosted-glass.ytd-app {
                background: ${selectedTheme.gradient} !important; opacity: 0.8 !important;
            }
            ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }
            ytd-engagement-panel-title-header-renderer[shorts-panel] #header.ytd-engagement-panel-title-header-renderer {
                background: ${selectedTheme.gradient} !important;
            }
            .buttons-tranlate { background: ${selectedTheme.btnTranslate} !important; }
            .badge-shape-wiz--thumbnail-default {
                color: ${selectedTheme.videoDuration} !important;
                background: ${selectedTheme.gradient} !important;
            }
            #logo-icon { color: ${selectedTheme.textLogo} !important; }
            .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text { color: ${selectedTheme.colorIcons} !important; }
            .ytd-topbar-menu-button-renderer #button.ytd-topbar-menu-button-renderer { color: ${selectedTheme.colorIcons} !important; }
            .yt-spec-icon-badge-shape--style-overlay .yt-spec-icon-badge-shape__icon { color: ${selectedTheme.colorIcons} !important; }
            .ytp-svg-fill { fill: ${selectedTheme.colorIcons} !important; }
        `;
        return css;
    }

    function getCustomThemeCss(settings) {
        return `
            .html5-video-player { color: ${settings.primaryColorPicker} !important; }
            .ytProgressBarLineProgressBarPlayed { background: ${settings.progressbarColorPicker} !important; }
            .ytp-menuitem .ytp-menuitem-icon svg path { fill: ${settings.iconsColorPicker} !important; }
            .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment { background: ${settings.lineColorPicker} !important; }
            .yt-badge-shape--thumbnail-default { color: ${settings.timeColorPicker} !important; }
            a svg > path, .ytp-button svg path { fill: ${settings.iconsColorPicker} !important; }
            .botones_div { background-color: transparent; border: none; color: ${settings.iconsColorPicker} !important; }
            .ytp-swatch-background-color { background: ${settings.progressbarColorPicker} !important; }
            #background.ytd-masthead { background: ${settings.headerColorPicker} !important; }
            #logo-icon { color: ${settings.primaryColorPicker} !important; }
            /* ... more custom css ... */
        `;
    }

    const themes = [{
        name: 'Default / Reload',
        gradient: '',
        textColor: '',
        raised: '',
        btnTranslate: '',
        CurrentProgressVideo: '',
        videoDuration: '',
        colorIcons: '',
        textLogo: '',
        primaryColor: '',
        secondaryColor: '',
    }, {
        name: 'Midnight Blue',
        gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        textColor: '#ffffff',
        raised: '#f00',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Forest Green',
        gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Sunset Orange',
        gradient: 'linear-gradient(135deg, #7c2d12, #f97316)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Royal Purple',
        gradient: 'linear-gradient(135deg, #2e1065, #4c1d95)',
        textColor: '#ffffff',
        raised: '#4c1d95',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Cherry Blossom',
        gradient: 'linear-gradient(135deg, #a9005c, #fc008f)',
        textColor: '#ffffff',
        raised: '#fc008f',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Red Dark',
        gradient: 'linear-gradient(135deg, #790909, #f70131)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Raind ',
        gradient: 'linear-gradient(90deg, #3f5efb 0%, #fc466b) 100%',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Neon',
        gradient: 'linear-gradient(273deg, #ee49fd 0%, #6175ff 100%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Azure',
        gradient: 'linear-gradient(273deg, #0172af 0%, #74febd 100%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Butterfly',
        gradient: 'linear-gradient(273deg, #ff4060 0%, #fff16a 100%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Colombia',
        gradient: 'linear-gradient(174deg, #fbf63f  0%, #0000bb 45%, #ff0000 99%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    },];

    // Create our enhancement panel
    const panel = $cl('div');

    panel.id = 'yt-enhancement-panel';

    const panelOverlay = $cl('div');
    panelOverlay.id = 'panel-overlay';
    $ap(panelOverlay);

    // Generate theme options HTML
    const themeOptionsHTML = themes
        .map(
            (theme, index) => `
        <label >
          <div class="theme-option">
          <div class="theme-preview" style="background: ${theme.gradient};"></div>
          <input type="radio" name="theme" value="${index}" ${index === 0 ? 'checked' : ''
                }>
              <span style="${theme.name === 'Default / Reload Page' ? 'color: red; ' : ''}" class="theme-name">${theme.name}</span>
              </div>
        </label>
    `
        )
        .join('');

    const languageOptionsHTML = Object.entries(languagesTranslate)
        .map(([code, name]) => {
            const selected = code === 'en' ? 'selected' : '';
            return `<option value="${code}" ${selected}>${name}</option>`;
        })
        .join('');




    // ------------------------------
    // YTM Ambient Mode — CSS background-image blur approach
    // Uses album art or video poster as a blurred full-screen background glow
    // Elements stay persistent for smooth transitions — only .active class toggles

    // ------------------------------
    const ytmAmbientMode = {
        active: false,
        _initialized: false, // true once DOM elements are created
        glowEl: null,
        styleEl: null,
        videoEl: null,
        _lastSrc: '',
        _pollId: null,

        // Find album art image URL from YTM player page
        _getArtUrl() {
            // 1. Rock-solid way: Get from YouTube Player API directly
            try {
                const mp = document.getElementById('movie_player');
                if (mp && typeof mp.getVideoData === 'function') {
                    const vData = mp.getVideoData();
                    if (vData && vData.video_id) {
                        return `https://i.ytimg.com/vi/${vData.video_id}/sddefault.jpg`;
                    }
                }
            } catch (e) { }

            // 2. Fallbacks
            const selectors = [
                '#song-image yt-img-shadow img',
                '#song-image img',
                'ytmusic-player-page #thumbnail img',
                '#player-page .thumbnail img',
                'ytmusic-player-bar .image img',
                'ytmusic-player-bar img'
            ];
            for (const sel of selectors) {
                const img = document.querySelector(sel);
                if (img && img.src && img.src.startsWith('http')) {
                    return img.src.replace(/=w\d+-h\d+/, '=w640-h640').replace(/=s\d+/, '=s640');
                }
            }
            const video = $e('video');
            if (video && video.poster) return video.poster;
            return null;
        },

        // Create DOM elements once (called only once, persists across show/hide)
        _ensureInit() {
            if (this._initialized) return;
            this._initialized = true;

            // Create the glow div
            this.glowEl = document.createElement('div');
            this.glowEl.id = 'ytm-ambient-glow';
            document.body.appendChild(this.glowEl);

            // Create the custom sidebar divider that perfectly fits the top/bottom bars
            this.dividerEl = document.createElement('div');
            this.dividerEl.id = 'ytm-custom-divider';
            document.body.appendChild(this.dividerEl);

            // Create style element
            this.styleEl = document.createElement('style');
            this.styleEl.id = 'ytm-ambient-style';
            this.styleEl.textContent = `
        #ytm-ambient-glow {
          position: fixed;
          top: -200px; left: -200px;
          width: calc(100vw + 400px);
          height: calc(100vh + 400px);
          pointer-events: none;
          z-index: -1;
          opacity: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(140px) saturate(2.2) brightness(0.9);
          transition: opacity 1.2s ease;
        }
        #ytm-ambient-glow.active {
          opacity: 0.7;
        }
        #ytm-custom-divider {
          position: fixed;
          width: 1px;
          background: rgba(255, 255, 255, 0.15);
          pointer-events: none;
          z-index: 2000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        body.ytm-ambient-active #ytm-custom-divider.active {
          opacity: 1;
        }
        /* Make player page backgrounds transparent so glow shows through */
        body.ytm-ambient-active ytmusic-app,
        body.ytm-ambient-active ytmusic-app-layout,
        body.ytm-ambient-active #layout {
          background-color: transparent !important;
          background: transparent !important;
          transition: background-color 0.6s ease;
        }
        body.ytm-ambient-active ytmusic-player-page,
        body.ytm-ambient-active #player-page,
        body.ytm-ambient-active ytmusic-player-page #main-panel,
        body.ytm-ambient-active .background-gradient {
          background-color: transparent !important;
          background: transparent !important;
          background-image: none !important;
        }
        /* Make nav bar, player bar, and side drawer transparent so the aura blends behind them smoothly */
        body.ytm-ambient-active #nav-bar-background,
        body.ytm-ambient-active #player-bar-background,
        body.ytm-ambient-active ytmusic-nav-bar,
        body.ytm-ambient-active ytmusic-player-bar,
        body.ytm-ambient-active tp-yt-app-drawer,
        body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
        body.ytm-ambient-active #guide-wrapper,
        body.ytm-ambient-active #guide-content,
        body.ytm-ambient-active ytmusic-guide-renderer,
        body.ytm-ambient-active #mini-guide-background,
        body.ytm-ambient-active #mini-guide {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        /* Remove borders that piece through the player bar when transparent */
        body.ytm-ambient-active tp-yt-app-drawer,
        body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
        body.ytm-ambient-active #guide-wrapper,
        body.ytm-ambient-active #guide-content,
        body.ytm-ambient-active ytmusic-guide-renderer,
        body.ytm-ambient-active #mini-guide-background {
          border: none !important;
          border-right: none !important;
          box-shadow: none !important;
        }
        /* Hide home/browse pages when player is open so they don't bleed through or block the glow */
        body.ytm-ambient-active ytmusic-browse-response {
          visibility: hidden !important;
          opacity: 0 !important;
        }


      `;
            document.head.appendChild(this.styleEl);
        },

        // Show ambient (fast — just toggle class + update art)
        show() {
            if (!isYTMusic) return;
            if (this.active) return;
            if (!window.location.href.includes('/watch')) return;

            this._ensureInit();
            this.active = true;

            // Update video reference
            this.videoEl = document.querySelector('video');

            if (this.glowEl) {
                this.glowEl.classList.add('active');
                document.body.classList.add('ytm-ambient-active');
            }

            this._updateArt();
            this._startPoll();
            this._startTracker();

            // Listen for play events (for art updates on song change)
            if (this.videoEl) {
                this.videoEl.removeEventListener('play', this._onPlay);
                this.videoEl.addEventListener('play', this._onPlay);
            }
        },

        // Hide ambient (fast — just toggle class, keep elements)
        hide() {
            this.active = false;
            if (this._pollId) {
                clearInterval(this._pollId);
                this._pollId = null;
            }
            if (this._trackerId) {
                cancelAnimationFrame(this._trackerId);
                this._trackerId = null;
            }
            if (this.glowEl) {
                this.glowEl.classList.remove('active');
                document.body.classList.remove('ytm-ambient-active');
            }
            if (this.dividerEl) {
                this.dividerEl.classList.remove('active');
            }
            if (this.videoEl) {
                this.videoEl.removeEventListener('play', this._onPlay);
                this.videoEl = null;
            }
        },

        // Full cleanup — remove all DOM elements (only when disabling feature)
        destroy() {
            this.hide();
            this._lastSrc = '';
            this._initialized = false;
            if (this.glowEl) {
                if (this.glowEl.parentNode) this.glowEl.parentNode.removeChild(this.glowEl);
                this.glowEl = null;
            }
            if (this.dividerEl) {
                if (this.dividerEl.parentNode) this.dividerEl.parentNode.removeChild(this.dividerEl);
                this.dividerEl = null;
            }
            if (this.styleEl) {
                if (this.styleEl.parentNode) this.styleEl.parentNode.removeChild(this.styleEl);
                this.styleEl = null;
            }
        },

        _startTracker() {
            if (this._trackerId) cancelAnimationFrame(this._trackerId);

            const self = this;
            function track() {
                if (!self.active) { self._trackerId = null; return; }

                const nav = document.querySelector('ytmusic-nav-bar');
                const player = document.querySelector('ytmusic-player-bar');
                const drawer = document.querySelector('tp-yt-app-drawer');
                const wrapper = document.querySelector('#guide-wrapper') || document.querySelector('#mini-guide-background');

                if (nav && player && drawer && wrapper && self.dividerEl) {
                    const navRect = nav.getBoundingClientRect();
                    const playerRect = player.getBoundingClientRect();
                    const wrapperRect = wrapper.getBoundingClientRect();

                    let leftPos = wrapperRect.right;
                    // Minor correction if right bound goes missing
                    if (leftPos <= 0 || !leftPos) leftPos = drawer.hasAttribute('opened') ? 240 : 72;

                    self.dividerEl.style.top = navRect.bottom + 'px';
                    self.dividerEl.style.height = (playerRect.top - navRect.bottom) + 'px';
                    self.dividerEl.style.left = leftPos + 'px';
                    self.dividerEl.classList.add('active');
                }

                self._trackerId = requestAnimationFrame(track);
            }

            this._trackerId = requestAnimationFrame(track);
        },

        // Legacy aliases for compatibility
        setup() { this.show(); },
        cleanup() { this.hide(); },

        _updateArt() {
            const url = this._getArtUrl();
            if (url && url !== this._lastSrc) {
                this._lastSrc = url;
                if (this.glowEl) {
                    this.glowEl.style.backgroundImage = `url("${url}")`;
                }
            }
        },

        _startPoll() {
            if (this._pollId) clearInterval(this._pollId);
            const self = this;
            this._pollId = setInterval(() => {
                if (!self.active) { clearInterval(self._pollId); self._pollId = null; return; }
                if (!window.location.href.includes('/watch')) {
                    self.hide();
                    return;
                }
                self._updateArt();
            }, 2000);
        },

        _onPlay: function () {
            if (!window.location.href.includes('/watch')) return;
            const g = document.getElementById('ytm-ambient-glow');
            if (g) {
                g.classList.add('active');
                document.body.classList.add('ytm-ambient-active');
            }
            ytmAmbientMode._updateArt();
        },
    };

    // Persistent ambient watcher — fast URL monitoring for smooth transitions
    if (isYTMusic) {
        let _ambientWatcherId = null;
        function startAmbientWatcher() {
            if (_ambientWatcherId) return;
            _ambientWatcherId = setInterval(() => {
                if (document.visibilityState !== 'visible') return;
                const s = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                const onWatch = window.location.href.includes('/watch');
                if (!s.cinematicLighting) {
                    if (ytmAmbientMode.active) ytmAmbientMode.hide();
                    return;
                }
                if (onWatch && !ytmAmbientMode.active) {
                    ytmAmbientMode.show();
                } else if (!onWatch && ytmAmbientMode.active) {
                    ytmAmbientMode.hide();
                }
            }, 1500); // Reduced frequency from 800ms to 1500ms
        }
        setTimeout(startAmbientWatcher, 1500);

        // Also respond to YTM-specific events immediately
        document.addEventListener('yt-page-data-updated', () => {
            const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
            if (!settings.cinematicLighting) return;
            if (window.location.href.includes('/watch')) {
                if (!ytmAmbientMode.active) ytmAmbientMode.show();
                else ytmAmbientMode._updateArt(); // might be a new song
            } else if (ytmAmbientMode.active) {
                ytmAmbientMode.hide();
            }
        });
    }

    // Cinematic Lighting Control Functions

    // ------------------------------
    // Feature: Bookmarks per video (persisted)

    // ------------------------------
    function getBookmarksForVideo(videoId) {
        const all = readJsonGM(STORAGE_KEYS_MDCM.BOOKMARKS, {});
        const list = Array.isArray(all[videoId]) ? all[videoId] : [];
        return {
            all,
            list
        };
    }

    function saveBookmark(videoId, seconds, label) {
        const {
            all,
            list
        } = getBookmarksForVideo(videoId);
        const t = Math.max(0, Math.floor(Number(seconds) || 0));
        const exists = list.some(b => b && b.t === t);
        const item = {
            t,
            label: (label || formatTimeShort(t)).trim(),
            createdAt: Date.now()
        };
        const nextList = exists ? list.map(b => (b.t === t ? item : b)) : [...list, item];
        nextList.sort((a, b) => a.t - b.t);
        all[videoId] = nextList;
        writeJsonGM(STORAGE_KEYS_MDCM.BOOKMARKS, all);
    }

    function deleteBookmark(videoId, seconds) {
        const {
            all,
            list
        } = getBookmarksForVideo(videoId);
        const t = Math.max(0, Math.floor(Number(seconds) || 0));
        all[videoId] = list.filter(b => b && b.t !== t);
        writeJsonGM(STORAGE_KEYS_MDCM.BOOKMARKS, all);
    }

    function renderBookmarksPanel(videoId) {
        const panel = $id('yt-bookmarks-panel');
        if (!panel) return;

        const {
            list
        } = getBookmarksForVideo(videoId);
        if (!list.length) {
            panel.innerHTML = safeHTML(`<div class="yt-bm-empty">No bookmarks yet. Click ★ to save one.</div>`);
            return;
        }

        panel.innerHTML = safeHTML(list
            .map((b) => {
                const time = formatTimeShort(b.t);
                const safeLabel = (b.label || time).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `
          <div class="yt-bm-item">
            <button type="button" class="yt-bm-go" data-action="go" data-t="${b.t}" title="Go to ${time}">${time}</button>
            <div class="yt-bm-label" title="${safeLabel}">${safeLabel}</div>
            <button type="button" class="yt-bm-del" data-action="del" data-t="${b.t}" title="Delete">✕</button>
          </div>
        `;
            })
            .join(''));
    }

    function applyBookmarksIfEnabled(settings) {
        const addBtn = $id('yt-bookmark-add');
        const toggleBtn = $id('yt-bookmark-toggle');
        const panel = $id('yt-bookmarks-panel');

        if (!addBtn || !toggleBtn || !panel) return;

        const enabled = !!settings?.bookmarks;
        addBtn.style.display = enabled ? 'inline-flex' : 'none';
        toggleBtn.style.display = enabled ? 'inline-flex' : 'none';
        panel.style.display = enabled && __ytToolsRuntime.bookmarksPanelOpen ? 'block' : 'none';

        if (!enabled) return;

        const videoId = getCurrentVideoId();
        if (!videoId) return;
        renderBookmarksPanel(videoId);

        if (__ytToolsRuntime.bookmarkClickHandlerInitialized) return;
        __ytToolsRuntime.bookmarkClickHandlerInitialized = true;

        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;

            const add = target.closest('#yt-bookmark-add');
            const tog = target.closest('#yt-bookmark-toggle');
            const actionBtn = target.closest('[data-action][data-t]');

            if (add) {
                e.preventDefault();
                e.stopPropagation();
                const v = $e('video');
                const vid = getCurrentVideoId();
                if (!v || !vid) return;
                const t = Math.floor(v.currentTime || 0);
                const defaultLabel = formatTimeShort(t);
                const label = prompt('Bookmark name (optional):', defaultLabel) || defaultLabel;
                saveBookmark(vid, t, label);
                __ytToolsRuntime.bookmarksPanelOpen = true;
                panel.style.display = 'block';
                renderBookmarksPanel(vid);
                Notify('success', `Bookmark saved at ${defaultLabel}`);
                return;
            }

            if (tog) {
                e.preventDefault();
                e.stopPropagation();
                __ytToolsRuntime.bookmarksPanelOpen = !__ytToolsRuntime.bookmarksPanelOpen;
                panel.style.display = __ytToolsRuntime.bookmarksPanelOpen ? 'block' : 'none';
                const vid = getCurrentVideoId();
                if (vid && __ytToolsRuntime.bookmarksPanelOpen) renderBookmarksPanel(vid);
                return;
            }

            if (actionBtn) {
                e.preventDefault();
                e.stopPropagation();
                const action = actionBtn.getAttribute('data-action');
                const t = Number(actionBtn.getAttribute('data-t'));
                const v = $e('video');
                const vid = getCurrentVideoId();
                if (!v || !vid) return;
                if (action === 'go') {
                    v.currentTime = Math.max(0, t || 0);
                    v.play?.().catch(() => { });
                } else if (action === 'del') {
                    deleteBookmark(vid, t);
                    renderBookmarksPanel(vid);
                }
            }
        });
    }



    function isWatchPage() {
        return window.location.href.includes('youtube.com/watch');
    }

    function isCinematicActive() {
        const cinematicDiv = document.getElementById('cinematics');
        if (!cinematicDiv) {
            return false;
        }

        const hasContent = cinematicDiv.innerHTML.trim() !== '';
        const hasCanvas = cinematicDiv.querySelector('canvas') !== null;
        const hasChildren = cinematicDiv.children.length > 0;

        const hasCinematicElements = cinematicDiv.querySelector('div[style*="position: fixed"]') !== null;

        return hasContent || hasCanvas || hasChildren || hasCinematicElements;
    }

    function toggleCinematicLighting() {
        const settingsButton = $e('.ytp-button.ytp-settings-button');
        if (!settingsButton) {
            console.log('[YT Tools] Settings button not found');
            return;
        }

        settingsButton.click();

        // Cinematic/ambient keywords in multiple languages for robust detection
        const cinematicKeywords = [
            'cinematic', 'lighting', 'cinema', 'ambient',
            'ch\u1EBF \u0111\u1ED9 \u0111i\u1EC7n \u1EA3nh', // Vietnamese: Chế độ điện ảnh
            '\u0111i\u1EC7n \u1EA3nh', // Vietnamese: điện ảnh
            'atmosph', 'ambiante', 'cin\u00E9ma', // French
            '\u30A2\u30F3\u30D3\u30A8\u30F3\u30C8', // Japanese
            '\uC2DC\uB124\uB9C8\uD2F1', // Korean
        ];

        const findAndClickCinematic = () => {
            const menuItems = $m('.ytp-menuitem');
            if (!menuItems || menuItems.length === 0) return false;

            for (let item of menuItems) {
                // Method 1: Look for toggle checkbox (cinematic is the only toggle-type menu item)
                const toggleCheckbox = item.querySelector('.ytp-menuitem-toggle-checkbox');
                if (toggleCheckbox) {
                    console.log('[YT Tools] Found cinematic/ambient toggle item (by checkbox)');
                    item.click();
                    return true;
                }
            }

            // Method 2: Match by localized text keywords
            for (let item of menuItems) {
                const text = (item.textContent || '').toLowerCase();
                for (const kw of cinematicKeywords) {
                    if (text.includes(kw)) {
                        console.log('[YT Tools] Found cinematic option by keyword:', kw);
                        item.click();
                        return true;
                    }
                }
            }

            // Method 3: Match by SVG icon path
            for (let item of menuItems) {
                const icon = item.querySelector('.ytp-menuitem-icon svg path');
                if (icon && (icon.getAttribute('d')?.includes('M21 7v10H3V7') ||
                    icon.getAttribute('d')?.includes('M12 2C6.48 2 2 6.48 2 12'))) {
                    console.log('[YT Tools] Found cinematic option by SVG path');
                    item.click();
                    return true;
                }
            }

            return false;
        };

        const closeMenu = () => {
            const menu = $e('.ytp-settings-menu');
            if (menu) document.body.click();
        };

        // Use polling instead of MutationObserver for more reliable detection
        let attempts = 0;
        const maxAttempts = 20;
        const pollInterval = setInterval(() => {
            attempts++;
            if (findAndClickCinematic()) {
                clearInterval(pollInterval);
                setTimeout(closeMenu, 150);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                console.warn('[YT Tools] Could not find cinematic/ambient toggle after', maxAttempts, 'attempts');
                closeMenu();
            }
        }, 200);
    }

    // Function to apply settings


        function agregarBotonesDescarga(settings) {
            const avatars = $m('#author-thumbnail-button #img.style-scope.yt-img-shadow');

            avatars.forEach((img) => {
                if (img.parentElement.querySelector('.yt-image-avatar-download')) return;

                const button = $cl('button');
                button.innerHTML = safeHTML('<i class="fa fa-download"></i>');
                button.classList.add('yt-image-avatar-download');

                button.onclick = async function () {
                    try {
                        const imageUrl = img.src.split('=')[0];
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);

                        const parentComment = img.closest('ytd-comment-thread-renderer, ytd-comment-renderer');
                        const nameElement = parentComment?.querySelector('#author-text');
                        let authorName = nameElement ? nameElement.textContent.trim() : 'avatar';
                        authorName = authorName.replace(/[\/\\:*?"<>|]/g, '');

                        const link = $cl('a');
                        link.href = blobUrl;
                        link.download = `${authorName}_avatar.jpg` || 'avatar.jpg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); 
                    } catch (error) {
                        console.error('Error al descargar la imagen:', error);
                    }
                };

                img.parentElement.style.position = 'relative';
                img.parentElement.appendChild(button);
            });
        }

        function downloadDescriptionVideo() {
            if (isYTMusic) return; 
            if (!window.location.href.includes('youtube.com/watch')) return;
            if ($e('#button_copy_description')) return;

            const containerDescription = $e('#bottom-row.style-scope.ytd-watch-metadata');
            if (!containerDescription) return;

            const buttomHTML = `
                <div id="button_copy_description" style="display: flex; justify-content: end; align-items: center;margin-top: 10px;" >
                  <button id="copy-description" title="Copy description" class="botones_div" type="button" style="cursor: pointer;">
                    <i style="font-size: 20px;" class="fa-solid fa-copy"></i>
                  </button>
                </div>
            `;

            containerDescription.insertAdjacentHTML('beforebegin', safeHTML(buttomHTML));

            $id('copy-description').addEventListener('click', () => {
                const ldJson = [...$m('script[type="application/ld+json"]')];
                for (let script of ldJson) {
                    try {
                        const data = JSON.parse(script.innerText);
                        if (data['@type'] === 'VideoObject') {
                            const description =
                                `📅 Date published: ${data.uploadDate || 'No disponible'}\n` +
                                `Author: ${data.author || 'No disponible'}\n` +
                                `🎬 Name video: ${data.name || 'No disponible'}\n` +
                                `🖼️ Thumbnail: ${Array.isArray(data.thumbnailUrl) ? data.thumbnailUrl.join(', ') : data.thumbnailUrl || 'No disponible'}\n` +
                                `📝 Description: ${data.description || 'No disponible'}\n\n\n` +
                                `🎭 Category: ${data.genre || 'No disponible'}\n`;

                            navigator.clipboard.writeText(description);
                            Notify('success', 'Description copied');
                        }
                    } catch (e) {
                        Notify('error', 'Error parsing JSON-LD');
                    }
                }
            });
        }

        let translatorEventBound = false;
        function traductor() {
            const texts = document.querySelectorAll('#content-text:not([data-translated])');
            if (texts.length === 0) return;

            const languages = languagesTranslate;
            const idiomaDestino = $id('select-languages-comments-select')?.value || 'vi';

            const optionsHTML = Object.entries(languages)
                .map(([code, name]) => `<option value="${code}" ${code === idiomaDestino ? 'selected' : ''}>${name}</option>`)
                .join('');

            texts.forEach((texto) => {
                texto.setAttribute('data-translated', 'true'); 
                const controlsHTML = `
				<div class="traductor-container">
					<button class="buttons-tranlate" data-action="translate-comment"> Translate <i class="fa-solid fa-language"></i></button>
					<select class="select-traductor">
					${optionsHTML}
					</select>
				</div>
				`;
                texto.insertAdjacentHTML('afterend', safeHTML(controlsHTML));
            });

            if (!translatorEventBound) {
                translatorEventBound = true;
                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('.buttons-tranlate[data-action="translate-comment"]');
                    if (!btn) return;

                    const container = btn.closest('.traductor-container');
                    const selectLang = container.querySelector('.select-traductor');
                    const textNode = container.previousElementSibling; 

                    if (!textNode || !selectLang) return;
                    const urlLista = `?client=dict-chrome-ex&sl=auto&tl=${selectLang.value}&q=` + encodeURIComponent(textNode.textContent);
                    btn.innerHTML = safeHTML('Translating... <i class="fa-solid fa-spinner fa-spin"></i>');

                    fetch(apiGoogleTranslate + urlLista)
                        .then((response) => response.json())
                        .then((datos) => {
                            textNode.textContent = datos[0][0];
                            btn.textContent = 'Translated';
                        })
                        .catch((err) => {
                            console.error('Error en la traducción:', err);
                            btn.textContent = 'Error';
                        });
                });
            }
        }


    function getLikesFromDom() {
        // Try grab visible like count (YouTube UI varies a lot)
        const likeBtn =
            $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
            $e('#top-level-buttons-computed like-button-view-model button') ||
            $e('#top-level-buttons-computed ytd-toggle-button-renderer:nth-child(1)') ||
            $e('segmented-like-dislike-button-view-model like-button-view-model');
        if (!likeBtn) return null;

        // Prefer visible counter first; aria-label can include locale thousands separators (17.606) that are ambiguous.
        const candidates = [
            likeBtn.querySelector?.('.yt-spec-button-shape-next__button-text-content')?.textContent,
            likeBtn.textContent,
            likeBtn.getAttribute?.('aria-label'),
        ].filter(Boolean);

        for (const txt of candidates) {
            const n = parseCountText(txt);
            if (n != null) return n;
        }
        return null;
    }

    function updateLikeDislikeBar(likes, dislikes) {
        // Prefer placing it above the "copy description" button (as requested).
        const copyDesc = $id('button_copy_description');
        const host =
            $e('#top-level-buttons-computed') ||
            $e('ytd-watch-metadata #top-level-buttons-computed');
        if (!host && !copyDesc) return;

        let bar = $id('yt-like-dislike-bar-mdcm');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'yt-like-dislike-bar-mdcm';
            bar.innerHTML = safeHTML(`<div class="like"></div><div class="dislike"></div>`);
            if (copyDesc) {
                copyDesc.insertAdjacentElement('beforebegin', bar);
            } else {
                host.appendChild(bar);
            }
        } else if (copyDesc && bar.previousElementSibling !== copyDesc) {
            // Keep it near the copy description area if the DOM changed
            try {
                copyDesc.insertAdjacentElement('beforebegin', bar);
            } catch (e) { }
        }

        if (!Number.isFinite(likes) || !Number.isFinite(dislikes) || likes + dislikes <= 0) {
            bar.style.display = 'none';
            return;
        }

        const total = likes + dislikes;
        const likePct = Math.max(0, Math.min(100, (likes / total) * 100));
        const dislikePct = 100 - likePct;
        bar.style.display = 'block';
        const likeEl = bar.querySelector('.like');
        const dislikeEl = bar.querySelector('.dislike');
        likeEl.style.width = `${likePct}%`;
        dislikeEl.style.width = `${dislikePct}%`;
        bar.title = `Likes: ${likes.toLocaleString()} | Dislikes: ${dislikes.toLocaleString()}`;
    }

    async function applyLikeDislikeBarIfEnabled(settings) {
        if (!settings?.likeDislikeBar) {
            const existing = $id('yt-like-dislike-bar-mdcm');
            if (existing) existing.style.display = 'none';
            return;
        }
        if (!window.location.href.includes('youtube.com/watch')) return;
        const videoId = getCurrentVideoId();
        if (!videoId) return;
        const data = await ensureDislikesForCurrentVideo();
        if (!data || data.likes == null || data.dislikes == null) return;
        updateLikeDislikeBar(data.likes, data.dislikes);
    }

    // Retry helper (YT often renders likes late; keep it lightweight)
    function scheduleLikeBarUpdate(settings, attempts = 4) {
        if (!settings?.likeDislikeBar) return;
        let i = 0;
        const tick = async () => {
            i += 1;
            await applyLikeDislikeBarIfEnabled(settings);
            const bar = $id('yt-like-dislike-bar-mdcm');
            if (bar && bar.style.display !== 'none') return;
            if (i < attempts) setTimeout(tick, 800);
        };
        setTimeout(tick, 300);
    }

    //   Dislikes video
    async function videoDislike() {
        if (isYTMusic) return;
        validoUrl = document.location.href;

        const validoVentana = $e('#below > ytd-watch-metadata > div');
        if (validoVentana != undefined && document.location.href.split('?v=')[0].includes('youtube.com/watch')) {
            validoUrl = paramsVideoURL();
            const data = await ensureDislikesForCurrentVideo();
            if (!data || data.dislikes == null) return;

            const dislikes = data.dislikes;
            const dislikes_btn = $e('#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button');
            
            if (dislikes_btn != null) {
                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                
                // Find or create our custom count element
                let textContent = dislikes_btn.querySelector('.yt-tools-dislike-count');
                if (!textContent) {
                    textContent = document.createElement('div');
                    textContent.className = 'ytSpecButtonShapeNextButtonTextContent yt-tools-dislike-count';
                    
                    // Insert it after the icon container
                    const iconDiv = dislikes_btn.querySelector('.ytSpecButtonShapeNextIcon');
                    if (iconDiv) {
                        iconDiv.insertAdjacentElement('afterend', textContent);
                        // Convert button style to icon+text layout
                        dislikes_btn.classList.add('ytSpecButtonShapeNextIconLeading');
                        dislikes_btn.classList.remove('ytSpecButtonShapeNextIconButton');
                    } else {
                        dislikes_btn.appendChild(textContent);
                    }
                }

                if (settings.dislikes) {
                    textContent.textContent = FormatterNumber(dislikes, 0);
                    textContent.style.display = 'block';
                    showDislikes = true;
                } else {
                    textContent.style.display = 'none';
                    showDislikes = false;
                }

                // Use MutationObserver for robust state tracking (handles Like button clicks too)
                if (!dislikes_btn.dataset.observerInitialized) {
                    dislikes_btn.dataset.observerInitialized = 'true';
                    
                    const videoId = validoUrl;
                    const sessionKey = `yt-dislike-initial-${videoId}`;

                    // Delay capturing initial state to ensure YouTube's UI has stabilized
                    setTimeout(() => {
                        let initialState = sessionStorage.getItem(sessionKey);
                        if (initialState === null) {
                            initialState = dislikes_btn.getAttribute('aria-pressed') === 'true';
                            sessionStorage.setItem(sessionKey, initialState);
                        } else {
                            initialState = initialState === 'true';
                        }

                        dislikes_btn.dataset.initialState = initialState;
                        dislikes_btn.dataset.originalCount = dislikes;
                        
                        // Initial update
                        updateCount();
                    }, 500);

                    const updateCount = () => {
                        const isPressed = dislikes_btn.getAttribute('aria-pressed') === 'true';
                        const wasPressed = dislikes_btn.dataset.initialState === 'true';
                        const original = Number(dislikes_btn.dataset.originalCount || dislikes);
                        const data = __ytToolsRuntime.dislikesCache;
                        
                        let offset = 0;
                        if (!wasPressed && isPressed) offset = 1;      // Added dislike
                        else if (wasPressed && !isPressed) offset = -1; // Removed dislike
                        
                        const newCount = Math.max(0, original + offset);
                        if (data) data.dislikes = newCount;
                        
                        if (settings.dislikes && textContent) {
                            textContent.textContent = FormatterNumber(newCount, 0);
                        }
                    };

                    const observer = new MutationObserver((mutations) => {
                        for (const mutation of mutations) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-pressed') {
                                updateCount();
                            }
                        }
                    });

                    observer.observe(dislikes_btn, { attributes: true, attributeFilter: ['aria-pressed'] });
                    
                    // Also handle direct clicks just in case
                    dislikes_btn.addEventListener('click', () => {
                        setTimeout(updateCount, 150);
                    });
                }

                try {
                    scheduleLikeBarUpdate(settings, 5);
                } catch (e) { }
            }
        }
    }

    // dislikes shorts + views button (viewCount from Return YouTube Dislike API)
    async function shortDislike() {
        validoUrl = document.location.href;
        const validoVentanaShort = $m(
            "#button-bar > reel-action-bar-view-model > dislike-button-view-model > toggle-button-view-model > button-view-model > label > div > span"
        );

        if (validoVentanaShort != undefined && document.location.href.split('/')[3] === 'shorts') {
            validoUrl = document.location.href.split('/')[4];
            let dislikes = null;
            let viewCount = null;
            let rating = null;
            const persisted = getLikesDislikesFromPersistedCache(validoUrl);
            if (persisted && persisted.dislikes != null) {
                dislikes = persisted.dislikes;
                viewCount = persisted.viewCount ?? null;
                rating = persisted.rating ?? null;
            } else {
                const urlShorts = `${apiDislikes}${validoUrl}`;
                try {
                    const respuesta = await fetch(urlShorts);
                    const datosShort = await respuesta.json();
                    dislikes = Number(datosShort?.dislikes);
                    viewCount = Number(datosShort?.viewCount);
                    rating = Number(datosShort?.rating);
                    if (Number.isFinite(dislikes)) setLikesDislikesToPersistedCache(validoUrl, undefined, dislikes, Number.isFinite(viewCount) ? viewCount : undefined, (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined);
                } catch (error) {
                    console.log(error);
                }
            }
            if (dislikes != null) {
                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                for (let i = 0; i < validoVentanaShort.length; i++) {
                    const el = validoVentanaShort[i];
                    if (settings.dislikes) {
                        if (!el.dataset.originalLabel) el.dataset.originalLabel = el.textContent;
                        el.textContent = `${FormatterNumber(dislikes, 0)}`;
                    } else {
                        if (el.dataset.originalLabel) {
                            el.textContent = el.dataset.originalLabel;
                            delete el.dataset.originalLabel;
                        }
                    }
                }
            }
            if (__ytToolsRuntime.updateShortsViewsButton) __ytToolsRuntime.updateShortsViewsButton(validoUrl, viewCount);
            if (__ytToolsRuntime.updateShortsRatingButton) __ytToolsRuntime.updateShortsRatingButton(validoUrl, rating);
        }
    }

    let showDislikes = false;

    window.addEventListener('yt-navigate-finish', () => {
        if (isYTMusic) return; // Dislikes UI not available on YTM
        const svgDislike = $e('.svg-dislike-ico');
        if (!svgDislike && showDislikes) {
            setTimeout(async () => {
                await videoDislike();
                await shortDislike();
            }, 1500);
        }
    });





    // Styles for our enhancement panel

    GM_addStyle(`
       @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
      @import url("https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/css/iziToast.min.css");
      :root {
              --primary-custom: #ff0000 !important;
              --bg-dark-custom: #1a1a1a !important;
              --bg-card-custom: #252525 !important;
              --text-custom: #ffffff !important;
              --text-custom-secondary: #9e9e9e !important;
              --accent-custom: #ff4444 !important;
          }
        #panel-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
            backdrop-filter: blur(2px);
        }
        #yt-enhancement-panel {
            z-index: 9999 !important;
        }
        body .container-mdcm {
              font-family: "Inter", -apple-system, sans-serif;
              color: var(--yt-enhance-menu-text, var(--text-custom));
        }
        #toggle-button:hover {
          background-color: rgba(255,255,255,0.1);
          border-radius: 50%;
          opacity: 1 !important;
          }
        .container-mdcm {
            width: 420px;
            max-width: 420px;
            background: rgba(30, 30, 30, 0.6) !important;
            border-radius: 16px 16px 0 0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            max-height: 80vh;
            overflow-y: auto;
            overflow-x: hidden;
            height: auto;
        }

        #shareDropdown {
        display: none;
        position: absolute;
        top: 50px;
        right: 100px;
        background-color: var(--yt-enhance-menu-bg, #252525);
        border-radius: 6px;
        padding: 10px;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
        z-index: 11;
        }
        #shareDropdown a {
        color: var(--text-custom);
        text-decoration: none;
        line-height: 2;
        font-size: 14px;
        }
        #shareDropdown a:hover {
        color: var(--primary-custom);
        }
        .header-mdcm {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            position: sticky;
            top: 0;
            background-color: var(--yt-enhance-menu-bg, #252525);
            border-radius: 16px 16px 0 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-mdcm h1 {
            font-size: 16px;
            margin: 0;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }


        .header-mdcm i {
         color: var(--primary-custom)
        }


        .icons-mdcm {
            display: flex;
            gap: 4px;
        }
        .icons-mdcm i {
          color: var(--yt-enhance-menu-accent, var(--text-custom));
        }


        .icon-btn-mdcm {
            background: rgba(255,255,255,0.1);
            border: none;
            color: var(--text-custom);
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .icon-btn-mdcm:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }

        .icon-btn-mdcm i {
         color: var(--text-custom);
         outline: none;
         text-decoration: none;
        }

        .tabs-mdcm {
            padding: 10px 12px;
            margin: 10px 0;
            position: sticky;
            top: 50px;
            background-color: var(--yt-enhance-menu-bg, #252525);
            z-index: 10;
            display: flex;
            gap: 8px;
            -ms-overflow-style: none;
            padding-bottom: 8px;
        }



        .tabs-mdcm::-webkit-scrollbar {
            height: 0px;
            background-color: transparent;
        }

        .tabs-mdcm:hover::-webkit-scrollbar {
            height: 6px;
        }

        .tabs-mdcm::-webkit-scrollbar-thumb {
            background-color: rgba(255, 0, 0, 0.5);
            border-radius: 3px;
        }

        .tabs-mdcm::-webkit-scrollbar-track {
            background-color: transparent;
        }

        .tab-mdcm {
            padding: 6px 10px;
            border: none;
            background: rgba(255,255,255,0.05);
            cursor: pointer;
            font-size: 12px;
            color: var(--text-custom-secondary);
            border-radius: 6px;
            transition: all 0.3s;
            flex: 1;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            justify-content: center;
            white-space: nowrap;
        }

        .tab-mdcm svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        .tab-mdcm.active {
            background: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
            color: var(--text-custom);
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(255,0,0,0.2);
        }

        .tab-mdcm:hover:not(.active) {
            background: rgba(255,255,255,0.1);
            transform: translateY(-1px);
        }

        .options-mdcm {
            flex: 1;
            overflow-y: auto;
            padding: 0 16px 0;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-custom) var(--bg-dark-custom);
            max-height: 300px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 8px;
        }

        .options-settings-mdcm {
            flex: 1;
            overflow-y: auto;
            padding: 0 16px 0;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-custom) var(--bg-dark-custom);
            max-height: 300px;
            display: grid;
            gap: 8px;
        }

         .card-items-end {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 175px;
        }

         .radio-mdcm {
            width: 14px;
            height: 14px;
            accent-color: var(--primary-custom);
        }

        .color-picker-mdcm {
            width: 50px;
            height: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .color-picker-mdcm:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .options-mdcm::-webkit-scrollbar, .options-settings-mdcm::-webkit-scrollbar {
            width: 6px;
        }

        .options-mdcm::-webkit-scrollbar-track, .options-settings-mdcm::-webkit-scrollbar-track {
            background: var(--bg-dark-custom);
            border-radius: 3px;
        }

        .options-mdcm::-webkit-scrollbar-thumb, .options-settings-mdcm::-webkit-scrollbar-thumb {
            background: var(--primary-custom);
            border-radius: 3px;
        }

        .options-mdcm::-webkit-scrollbar-thumb:hover, .options-settings-mdcm::-webkit-scrollbar-thumb:hover {
            background: var(--accent-custom);
        }

        .options-mdcm::after, .options-settings-mdcm::after {
            content: '';
            display: block;
        }

        .option-mdcm {
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            margin-bottom: 0;
            padding: 5px;
            background: rgba(255,255,255,0.05);
            border-radius: 6px;
            transition: all 0.3s;
            border: 1px solid rgba(255,255,255,0.05);
            color: var(--text-custom);
            gap: 6px;
        }

        .option-mdcm:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.1);
        }
        .option-settings-mdcm {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0;
          padding: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.05);
          gap: 6px;
        }

        .option-settings-mdcm:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.1);
        }
            .tab-content {
            display: none;
        }
            .tab-content.active {
                display: block;
                margin-bottom: 10px;
            }

        .checkbox-mdcm {
            width: 14px;
            height: 14px;
            accent-color: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
        }

        .yt-tools-audio-only-player {
            background-color: #000 !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
            background-size: cover !important;
        }

        .yt-tools-audio-only-video {
            opacity: 0 !important;
        }

        label {
            font-size: 12px;
            color: var(--text-custom);
        }

        .slider-container-mdcm {
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 6px;
        }

        .slider-mdcm {
            width: 100%;
            height: 3px;
            accent-color: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
            margin: 10px 0;
        }

        .reset-btn-mdcm {
            padding: 5px 10px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.1);
            color: var(--text-custom);
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.3s;
        }

        .reset-btn-mdcm:hover {
            background: rgba(255,255,255,0.2);
        }

        .quality-selector-mdcm select {
            position: relative;
            padding: 3px;
            outline: none;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
            background: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
            color: var(--text-custom);
            width: fit-content;
            appearance: none;
            cursor: pointer;
            font-size: 11px;
        }


        .quality-selector-mdcm {
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 6px;
        }

        .select-wrapper-mdcm {
          position: relative;
          display: inline-block;
        }

        .select-wrapper-mdcm select {
          -webkit-appearance: auto;
          -moz-appearance: auto;
        }

        .actions-mdcm {
            position: sticky;
            top: 0;
            padding: 12px 16px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(30, 30, 30, 0.6) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 6px;
            width: 390px;
            border-radius: 0 0 16px 16px;
            justify-content: space-between;
            align-items: center;
        }

        .action-buttons-mdcm {
            display: flex;
            gap: 6px;
        }

        .action-btn-mdcm {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 6px;
            background: var(--primary-custom);
            color: var(--text-custom);
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(255,0,0,0.2);
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255,0,0,0.3);
        }

        textarea.textarea-mdcm {
            width: 100%;
            height: 50px;
            margin-top: 10px;
            margin-bottom: 12px;
            padding: 8px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: var(--text-custom);
            font-size: 11px;
            resize: none;
            transition: all 0.3s;
        }

        textarea.textarea-mdcm:focus {
            outline: none;
            border-color: var(--primary-custom);
            background: rgba(255,255,255,0.08);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .container-mdcm {
            animation: fadeIn 0.3s ease-out;
        }

        .developer-mdcm {
            font-size: 10px;
            color: var(--text-custom-secondary);
        }

        .developer-mdcm a {
            color: var(--primary-custom);
            text-decoration: none;
        }

        /* Styles for the import/export area */
        #importExportArea {
            display: none;
            padding: 16px;
            margin: 0px;
            background-color: var(--yt-enhance-menu-bg, #252525);
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        #importExportArea.active {
            display: block;
            margin-top: 10px;
        }

        /* Style the textarea */
        #importExportArea textarea {
            width: 370px;
            height: 20px;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            background-color: rgba(255, 255, 255, 0.05);
            color: var(--text-custom);
            font-size: 12px;
            resize: vertical;
        }

        /* Style the buttons */
        #importExportArea .action-buttons-mdcm  {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }

        #importExportArea .action-btn-mdcm {
            flex: 1;
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            background-color: var(--primary-custom);
            color: var(--text-custom);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        #importExportArea .action-btn-mdcm:hover {
            background-color: var(--accent-custom);
        }

        .ocultarframe, .ocultarframeaudio {
            display: none !important;
        }

        .yt-tools-container {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            margin: 0 !important;
        }

        .yt-tools-inner-container {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }

        /* Layout & Alignment Fixes */
        .yt-tools-form {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            gap: 2px !important;
        }

        .containerButtons {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 12px !important;
            width: 100% !important;
            flex-wrap: wrap !important;
        }

        .selectcalidades, .selectcalidadesaudio {
            background: rgba(30, 30, 30, 0.9) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            padding: 0 20px !important; 
            height: 40px !important;
            line-height: 40px !important;
            border-radius: 10px !important;
            font-family: "Inter", -apple-system, sans-serif !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            outline: none !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
            transition: all 0.3s ease !important;
            margin: 0 auto !important;
            display: block !important;
            min-width: 280px !important;
            max-width: 350px !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            text-align: center !important;
            text-align-last: center !important; /* Support for some browsers */
            position: relative;
        }

        .selectcalidades:hover, .selectcalidadesaudio:hover {
            border-color: #ff0000 !important;
            background: rgba(45, 45, 45, 0.95) !important;
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(255, 0, 0, 0.15) !important;
        }

        .selectcalidades option, .selectcalidadesaudio option {
            background: #1e1e1e !important;
            color: #ffffff !important;
            padding: 12px !important;
            text-align: center !important;
        }

        .formulariodescarga, .formulariodescargaaudio {
            width: 100% !important;
            margin: 0 !important;
            display: none !important; /* Hidden by default */
            justify-content: center !important;
            align-items: center !important;
        }

        .containerall {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 2px !important;
        }

        /* Regular YouTube specific spacing (VIP) */
        ytd-watch-metadata .yt-tools-inner-container {
            gap: 10px !important;
        }

        ytd-watch-metadata .containerall {
            gap: 0px !important;
            padding-bottom: 0 !important;
        }

        ytd-watch-metadata .yt-tools-container {
            margin-bottom: -8px !important;
        }

        ytd-watch-metadata .content_collapsible_colors {
            margin-top: 0 !important;
        }

        ytd-watch-metadata .download-container {
            width: 90% !important;
            max-width: 450px !important;
            padding: 7px !important;
            border-radius: 12px !important;
            margin: 5px auto !important;
            display: flex !important;
            flex-direction: column !important;
            transition: all 0.3s ease;
            position: relative;
        }

      #yt-stats {
      position: fixed;
      top: 60px;
      right: 20px;
      background: #1a1a1a;
      color: white;
      padding: 15px;
      border-radius: 10px;
      width: 320px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      font-family: Arial, sans-serif;
      display: none;
      }
  #yt-stats-toggle {
      font-size: 12px;
      color: #fff;
      padding: 12px 20px;
      border-radius: 5px;
      cursor: pointer;
  }
  .stat-row {
      margin: 15px 0;
  }
  .progress {
      height: 6px;
      overflow: hidden;
      background: #333;
      border-radius: 3px;
      margin: 8px 0;
  }
  .progress-bar {
      height: 100%;
      transition: width 0.3s;
  }
  .total-bar { background: #44aaff !important; }
  .video-bar { background: #00ff88 !important; }
  .shorts-bar { background: #ff4444 !important; }
  #cinematics {
    position: absolute !important;
    width: 90vw !important;
    height: 100vh ;
  }
    #cinematics div {
        position: fixed;
      inset: 0px;
      pointer-events: none;
      transform: scale(1.5, 2);
  }
      #cinematics > div > div > canvas:nth-child(1), #cinematics > div > div > canvas:nth-child(2) {
   position: absolute !important;
    width: 90vw !important;
    height: 100vh ;
      }

    /* .html5-video-player.unstarted-mode {
       background-image: url('https://avatars.githubusercontent.com/u/54366580?v=4');
       background-repeat: no-repeat;
       background-position: 50% 50%;
       display: flex;
       justify-content: center;
       align-items: center;
    } */

        #yt-enhancement-panel {
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 9999;
        }

        .color-picker {
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            background: none;
        }
        .slider {
            width: 100%;
        }
         #toggle-panel {
            z-index: 10000;
            color: white;
            padding: 5px;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            transition: all 0.5s ease;
            width: 43px;
            border-radius: 100px;
        }

        #icon-menu-settings {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 7px;
        font-size: 20px;
        color: var(--yt-spec-icon-inactive);
        cursor: pointer;
        user-select: none;
        filter: drop-shadow(2px 4px 6px black);
        }

        .theme-option {
            margin-bottom: 15px;
        }
        .theme-option label {
            display: flex;
            align-items: center;
        }
       .theme-option {
    position: relative;
    width: auto;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
}

.theme-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    border: 1px solid #000;
    z-index: 1;
}

.theme-option input[type="radio"] {
    position: relative;
    z-index: 2;
    margin-right: 10px;
    cursor: pointer;
}

.theme-name {
    position: relative;
    z-index: 2;
    font-size: 15px;
    color: #fff;
}

.theme-option label {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 2;
}

  .buttons-tranlate, .select-traductor {
        background: #000;
        font-size: 10px;
        border: none;
        color: #fbf4f4 !important;
        padding: 3px 0;
        margin-left: 10px;
        width: 70px;
        border-radius: 10px;
        }
        .buttons-tranlate:hover {
        cursor: pointer;
        background-color: #6b6b6b;
        }
         button.botones_div {
         margin: 0;
         padding: 0;
         }
         button.botones_div:hover {
         cursor: pointer;
         color: #6b6b6b !important;
         }

        .tab-button:hover {
          background-color: #ec3203 !important;
          color: #ffffff !important;
          cursor: pointer;
        }

        .traductor-container {
            display: inline-block;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
          }

        #eyes {
      opacity: 0;
      position: absolute;
      height: 24px;
      left: 0;
      width: 24px;
    }

    /* width */
    .container-mdcm ::-webkit-scrollbar {
      width: 4px;
      height: 10px;
    }

    /* Track */
    .container-mdcm ::-webkit-scrollbar-track {
      background: #d5d5d5;

    }

    /* Handle */
    .container-mdcm ::-webkit-scrollbar-thumb {
      background: #000;

    }

    .color-boxes {
      display: flex;
      gap: 8px;
    }
    .color-box {
      width: 20px;
      height: 20px;
      border: 1px solid rgb(221 221 221 / 60%);
      border-radius: 4px;
      cursor: pointer;
    }
    .color-box.selected {
      border: 2px solid var(--primary-custom);
      filter: drop-shadow(0px 1px 6px red);
    }

    .containerButtons {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .containerButtons > button:hover {
      cursor: pointer;
    }

        /* Download Container Styles */
        .download-container {
          width: 90% !important;
          max-width: 450px !important;
          padding: 16px !important;
          border-radius: 12px !important;
          margin: 10px auto !important;
          display: flex !important;
          flex-direction: column !important;
          transition: all 0.3s ease;
          position: relative;
        }

        .download-container.video {
          background: linear-gradient(135deg, #ff4444, #cc0000);
          color: white;
        }

        .download-container.audio {
          background: linear-gradient(135deg, #00cc44, #009933);
          color: white;
        }

        .download-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .download-text {
          font-weight: 600;
          font-size: 14px;
        }

        .download-quality {
          font-size: 12px;
          opacity: 0.9;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 3px;
          width: 0%;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 500;
          min-width: 30px;
        }

        .download-footer {
          font-size: 10px;
          opacity: 0.7;
          text-align: center;
        }
        .download-footer a {
          text-decoration: none;
          color: #fff;
        }

        .download-container.completed {
          color: #fff;
          background: linear-gradient(135deg, #00cc44, #009933) !important;
        }

        .download-container.completed .download-text {
          font-weight: 700;
        }

      /* Bookmarks panel (under video buttons) */
      .yt-bookmarks-panel {
        margin-top: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 8px;
      }
      .yt-bm-empty {
        font-size: 12px;
        color: var(--text-custom-secondary);
      }
      .yt-bm-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px;
        border-radius: 8px;
      }
      .yt-bm-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .yt-bm-go {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(34,197,94,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
      }
      .yt-bm-label {
        font-size: 12px;
        color: var(--text-custom);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yt-bm-del {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(239,68,68,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
      }

      /* Continue watching panel (under video buttons) */
      .yt-continue-watching-panel {
        margin-top: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 8px;
      }
      .yt-cw-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }
      .yt-cw-header-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-custom, #fff);
      }
      .yt-cw-clear {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(239,68,68,0.18);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
      }
      .yt-cw-empty {
        font-size: 12px;
        color: var(--text-custom-secondary, #aaa);
      }
      .yt-cw-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 8px;
        border-radius: 10px;
      }
      .yt-cw-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .yt-cw-thumb-wrap {
        width: 72px;
        height: 40px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
        flex: none;
      }
      .yt-cw-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .yt-cw-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-custom, #fff);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 520px;
      }
      .yt-cw-meta {
        font-size: 12px;
        color: var(--text-custom-secondary, #aaa);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yt-cw-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .yt-cw-go {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(34,197,94,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
      }
      .yt-cw-del {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(239,68,68,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
      }

      /* Shorts channel name label (Home/feed Shorts lockups) */
      html:not([data-mdcm-shorts-channel-name="1"]) .yt-tools-shorts-channel-name {
        display: none !important;
      }
      .yt-tools-shorts-channel-name {
        font-size: 12px;
        line-height: 1.2;
        color: var(--yt-spec-text-secondary, #aaa);
        margin-bottom: 2px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yt-tools-shorts-stats-wrap {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.2;
        color: var(--yt-spec-text-secondary, #aaa);
      }
      .yt-tools-shorts-stats-wrap .yt-tools-shorts-stats-row {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
      }

      /* Like vs dislike bar (under likes/dislikes) */
      #yt-like-dislike-bar-mdcm {
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        margin-top: 6px;
        background: rgba(255,255,255,0.12);
        max-width: 305px;
      }
      #yt-like-dislike-bar-mdcm .like {
        height: 100%;
        background: #22c55e;
        float: left;
      }
      #yt-like-dislike-bar-mdcm .dislike {
        height: 100%;
        background: #ef4444;
        float: left;
      }

        .progress-retry-btn {
          position: absolute;
          top: 8px;
          left: 8px;
          right: auto;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .progress-retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .download-again-btn {
          position: absolute;
          top: 8px;
          left: 8px;
          right: auto;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.35);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .download-again-btn:hover {
          background: rgba(34, 197, 94, 0.5);
          transform: scale(1.1);
        }

        .download-container {
          position: relative;
        }

        .download-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .download-btn {
          flex: 1;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .download-btn.video-btn {
          background: linear-gradient(135deg, #ff6666, #ff4444);
        }

        .download-btn.audio-btn {
          background: linear-gradient(135deg, #00dd55, #00cc44);
        }

        .download-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .download-info {
          padding-left: 28px !important; /* Space for buttons on the left */
        }

        .download-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .retry-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #ffaa00, #ff8800);
          color: white;
        }

        .retry-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

      body {
      padding: 0;
      margin: 0;
      overflow-y: scroll;
      overflow-x: hidden;
      }
      .style-scope.ytd-comments {
      overflow-y: auto;
      overflow-x: hidden;
      height: auto;
      }
      ytd-comment-view-model[is-reply] #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model, ytd-comment-view-model[is-creator-reply] #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
        #author-thumbnail img.yt-img-shadow {
        border-radius: 50% !important;
        }
        #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: visible;
        }
      ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer {
        --ytd-item-section-item-margin: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        height: auto;
      }
      .right-section.ytcp-header {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 45px;
      justify-content: end;
    }
      #meta.ytd-playlist-panel-video-renderer {
    min-width: 0;
    padding: 0 8px;
    /* display: flexbox; */
    display: flex;
    flex-direction: column-reverse;
    flex: 1;
    flex-basis: 0.000000001px;
}

    .containerall {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding-bottom: 30px;
      max-width: 800px;
      margin: auto;
    }
    .container .botoncalidades {
      margin: 3px 2px;
      width: 24.6%;
    }

    .botoncalidades:first-child {
      background-color: #0af;
    }

    .botoncalidades:last-child {
      background-color: red;
      width: 100px;
    }

    .selectcalidades,
    .botoncalidades,
    .selectcalidadesaudio {
      width: 50%;
      height: 27.8px;
      background-color: #fff;
      color: #000;
      font-size: 25px;
      text-align: center;
      border: 1px solid black;
      border-radius: 10px;
      border: none;
      font-size: 20px;
      margin: 2px 2px;
    }

    .botoncalidades {
      width: 70px;
      height: 30px;
      background-color: rgb(4, 156, 22);
      border: 0px solid #000;
      color: #fff;
      font-size: 20px;
      border-radius: 10px;
      margin: 2px 2px;
    }

    .botoncalidades:hover,
    .bntcontainer:hover {
      cursor: pointer;
    }

   .ocultarframe,
    .ocultarframeaudio {
      display: none;
    }
      .checked_updates {
      cursor: pointer;
      }

      #export-config, #import-config {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background-color: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
        color: #ffffff;
        border: none;
        padding: 5px;
      }
        #export-config:hover, #import-config:hover {
          background-color: #ff0000;
          color: #ffffff;
          cursor: pointer;
        }

        .yt-image-avatar-download {
          position: absolute;
          bottom: -10px;
          right: -14px;
          border: none;
          z-index: 1000;
          background: transparent;
          filter: drop-shadow(1px 0 6px red);
          color: var(--ytcp-text-primary);
          cursor: pointer;
        }

        .custom-classic-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255,255,255,0.1);
          border-radius: 50%;
          border: none;
          width: 48px;
          height: 48px;
          color: var(--yt-spec-icon-inactive);
          font-size: 24px;
          margin: 0px 8px;
          cursor: pointer;
        }
        .custom-classic-btn:hover {
          background-color: rgba(255,255,255,0.2);
        }
        .background-image-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin: 10px 0;
      }

      .background-image-preview {
        width: 160px;
        height: 90px;
        border-radius: 10px;
        background-size: cover;
        background-position: center;
        border: 2px solid #444;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        overflow: hidden;
      }

      .background-image-preview:hover .background-image-overlay {
        opacity: 1;
      }

      .background-image-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        background: rgba(0,0,0,0.35);
        font-size: 18px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }

      .background-image-preview:hover .background-image-overlay,
      .background-image-preview:focus .background-image-overlay {
        opacity: 1;
      }

      .background-image-overlay i {
        font-size: 28px;
        margin-bottom: 4px;
      }

      .background-image-text {
        font-size: 13px;
        font-weight: 500;
        text-shadow: 0 1px 4px #000;
      }

      .remove-background-image {
        position: absolute;
        top: 6px;
        right: 6px;
        background: #e74c3c;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        font-size: 18px;
        cursor: pointer;
        z-index: 2;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: background 0.2s;
      }
      .remove-background-image:hover {
        background: #c0392b;
      }
      .background-image-preview.has-image .remove-background-image {
        display: flex;
      }

      ytd-feed-filter-chip-bar-renderer[not-sticky] #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
        padding: 10px;
      }
      .text-description-download {
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        }
        /* === FIX: Căn giữa thanh công cụ khi bật Cinematic Mode === */
    ytd-watch-flexy[cinematic-container-initialized] #primary-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ytd-watch-flexy[cinematic-container-initialized] .yt-tools-container {
      /* Đảm bảo thanh công cụ không bị quá rộng so với video */
      width: 100%;
      max-width: var(--ytd-watch-flexy-max-player-width, 1280px);
    }

    /* === YouTube Music specific styles === */
    #ytm-side-panel-wrapper {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      margin: 0 0 12px 0 !important;
      padding: 4px 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      border-radius: 16px !important;
    }

    ytmusic-player-page #side-panel {
      margin-left: 16px !important;
      margin-bottom: 24px !important;
      padding: 0 !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .ytm-side-panel-divider {
      width: 92%;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 4px 0;
    }

    /* Blur Mode (Standard with subtle blur) */
    body.ytm-style-blur #ytm-side-panel-wrapper,
    body.ytm-style-blur ytmusic-player-page #side-panel ytmusic-tab-renderer {
      background: rgba(20, 20, 20, 0.6) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
      border-radius: 16px !important;
    }

    /* Liquid Mode (Fixed Apple Style) */
    body.ytm-style-liquid #ytm-side-panel-wrapper,
    body.ytm-style-liquid ytmusic-player-page #side-panel ytmusic-tab-renderer {
      background: rgba(25, 25, 25, 0.45) !important;
      backdrop-filter: blur(24px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
      border-radius: 16px !important;
    }

    /* Transparent Mode */
    body.ytm-style-transparent #ytm-side-panel-wrapper,
    body.ytm-style-transparent ytmusic-player-page #side-panel ytmusic-tab-renderer {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Inner Container Resets */
    html[dark] .yt-tools-container,
    ytmusic-app .yt-tools-container,
    ytmusic-app #side-panel ytmusic-tab-renderer,
    ytmusic-app ytmusic-search-box,
    ytmusic-app #side-panel > .tab-header-container,
    tp-yt-paper-tabs.tab-header-container,
    #tabsContainer.tp-yt-paper-tabs,
    tp-yt-paper-tab.tab-header,
    .tab-content.tp-yt-paper-tab {
      background: transparent !important;
      background-color: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
    }

    .yt-tools-container {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
    }

    .tab-header-container {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 4px 0 !important;
    }

    /* Fix YTM side-panel queue layout */
    ytmusic-app #side-panel {
      padding: 8px 12px;
      box-sizing: border-box;
    }
    ytmusic-app #side-panel ytmusic-queue-header-renderer .container-name {
      padding: 0 8px;
    }
    ytmusic-app #side-panel ytmusic-player-queue-item .song-info {
      padding-right: 4px;
    }
    ytmusic-app #side-panel ytmusic-tab-renderer {
      border-radius: 16px !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 12px 0 12px 12px !important;
      margin-bottom: 12px !important;
    }

    /* Make the YTM Search Box premium and glassmorphic (Feature requested by user) */
    ytmusic-app ytmusic-search-box {
      border-radius: 16px !important;
    }
    html[dark] ytmusic-app ytmusic-search-box #input-box,
    ytmusic-app ytmusic-search-box #input-box {
      background: transparent !important;
    }

    /* Tab headers — rounded corners & spacing */
    ytmusic-app #side-panel > .tab-header-container {
      border-radius: 16px !important;
      overflow: hidden !important;
      padding: 4px 8px;
      margin: 0 0 8px 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    /* Compact button layout for narrow YTM side panel */
    ytmusic-app .containerButtons {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    ytmusic-app .botones_div {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #fff !important;
      border-radius: 6px !important;
      padding: 5px 7px !important;
      transition: all 0.2s ease !important;
      line-height: 1 !important;
    }
    ytmusic-app .botones_div svg {
      width: 18px !important;
      height: 18px !important;
    }

    ytmusic-app .botones_div:hover {
      background: rgba(255, 0, 0, 0.25) !important;
      border-color: rgba(255, 0, 0, 0.4) !important;
      transform: translateY(-1px);
    }

    ytmusic-player-page #side-panel select,
    ytmusic-player-page #side-panel select option {
      background: #282828 !important;
      color: #fff !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    ytmusic-app .selectcalidades,
    ytmusic-app .selectcalidadesaudio {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 6px !important;
      padding: 8px 8px 6px !important; /* Asymmetric padding for vertical centering */
      font-size: 12px !important;
      width: 100% !important;
      cursor: pointer !important;
      outline: none !important;
      height: 32px !important;
      line-height: normal !important;
    }

    ytmusic-app .download-container {
      width: 100% !important;
      background: rgba(0, 0, 0, 0.3) !important;
      border-radius: 6px !important;
      position: relative !important; /* Fix absolute positioned buttons (Retry/Again) */
      padding: 10px !important;
      box-sizing: border-box !important;
      margin-bottom: 0 !important;
    }

    ytmusic-app .content_collapsible_colors {
      margin-top: 8px !important;
    }

    .ytm-side-panel-divider {
      margin: 0 !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      height: 0;
      width: 100%;
    }

    ytmusic-app .containerall {
      padding-bottom: 10px !important;
    }

    ytmusic-app #toggle-button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 8px;
      margin-right: 4px;
    }

    ytmusic-app #icon-menu-settings {
      color: #fff;
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    ytmusic-app #icon-menu-settings:hover {
      transform: rotate(90deg);
      color: #ff4444;
    }
    `);


    // botons bottom video player

    const thumbnailVideo = `
  <button title="Image video" class="botones_div" type="button" id="imagen">

  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-photo-down" width="24"
    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M15 8h.01"></path>
    <path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5"></path>
    <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4"></path>
    <path d="M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559"></path>
    <path d="M19 16v6"></path>
    <path d="M22 19l-3 3l-3 -3"></path>
  </svg>
</button>
  `;

    const repeatVideo = `
  <button title="Repeat video" class="botones_div" type="button" id="repeatvideo">

  <svg  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat" width="24"
    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
  </svg>
</button>
  `;

    const downloadMP4Mp3 = `
  <button title="MP4" type="button" class="btn1 botones_div">
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-download"
    width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
    <path d="M12 17v-6"></path>
    <path d="M9.5 14.5l2.5 2.5l2.5 -2.5"></path>
  </svg>
</button>
<button title="MP3" type="button" class="btn2 botones_div">

  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-music" width="24"
    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
    <path d="M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
    <path d="M12 16l0 -5l2 1"></path>
  </svg>
</button>
<button title="Close" type="button" class="btn3 botones_div">
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-x" width="24"
  height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
  stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
  <path d="M10 10l4 4m0 -4l-4 4"></path>
</svg>
</button>
  `;

    const pictureToPicture = `
  <button title="Picture to picture" type="button" class="video_picture_to_picture botones_div">

  <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4" /><path d="M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" /></svg>
</button>

  `;
    const screenShot = `
  <button title="Screenshot video" type="button" class="screenshot_video botones_div">
  <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644" /><path d="M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644" /><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /></svg>
</button>

  `;

    const bookmarkAddBtn = `
  <button title="Add bookmark" type="button" id="yt-bookmark-add" class="botones_div">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z" />
      <path d="M12 7v6" />
      <path d="M9 10h6" />
    </svg>
  </button>
  `;

    const bookmarkToggleBtn = `
  <button title="Show bookmarks" type="button" id="yt-bookmark-toggle" class="botones_div">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M5 6h.01" />
      <path d="M5 12h.01" />
      <path d="M5 18h.01" />
    </svg>
  </button>
  `;

    const continueWatchingHistoryBtn = `
  <button title="History" type="button" id="yt-cw-history-toggle" class="botones_div" style="display:none;">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 8v4l3 3" />
      <path d="M3 12a9 9 0 1 0 3 -6.7" />
      <path d="M3 4v4h4" />
    </svg>
  </button>
  `;

    const menuBotones = `
    <main class="yt-tools-container">
    <div class="container">
    <form>
      <div class="containerButtons">
      ${thumbnailVideo}
      ${!isYTMusic ? repeatVideo : ''}
      ${bookmarkAddBtn}
      ${bookmarkToggleBtn}
      ${continueWatchingHistoryBtn}
      ${downloadMP4Mp3}
      ${pictureToPicture}
      ${screenShot}
      </div>
      <div id="yt-bookmarks-panel" class="yt-bookmarks-panel" style="display:none;"></div>
      <div id="yt-continue-watching-panel" class="yt-continue-watching-panel" style="display:none;"></div>
      <div>
      </div>
    </form>

    </div>
    <div class="content_collapsible_colors" style="margin-top: 10px">

    <form class="formulariodescarga ocultarframe" action="">
    <div class="containerall">
    <select class="selectcalidades ocultarframe" required>
      <option selected disabled>Video Quality</option>
      <option value="144">144p MP4</option>
      <option value="240">240p MP4</option>
      <option value="360">360p MP4</option>
      <option value="480">480p MP4</option>
      <option value="720">720p HD MP4 Default</option>
      <option value="1080">1080p FULL HD MP4</option>
      <option value="1440">1440p 2K WEBM</option>
      <option value="4k">2160p 4K WEBM</option>
      <option value="8k">4320p 8K WEBM</option>
      </select>
      <div id="descargando" class="download-container ocultarframe">
        <button class="progress-retry-btn" title="Retry" style="display: none;">
        <i class="fa-solid fa-rotate-right"></i>
        </button>
        <button class="download-again-btn" title="Download again" style="display: none;">
        <i class="fa-solid fa-download"></i>
        </button>
        <div class="download-info">
          <span class="download-text">Download Video And Please Wait...</span>
          <span class="download-quality"></span>
        </div>
        <div class="download-actions">
          <button class="download-btn video-btn">Download</button>
          <button class="retry-btn" style="display: none;">Retry</button>
        </div>
        <div class="progress-container" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">0%</span>
        </div>
        <div class="download-footer">
          <a href="https://github.com/akari310/" target="_blank"> <i class="fa-brands fa-github"></i> by: Akari</a>
        </div>
        <h1 class="text-description-download">
          <span >Enable pop-ups on YouTube to download audio or video</span>
        </h1>
      </div>
    </div>
    </form>
    <form class="formulariodescargaaudio ocultarframe" action="">
    <div class="containerall">
    <select class="selectcalidadesaudio ocultarframeaudio" required>
      <option selected disabled>Audio Quality</option>
      <option value="flac">Audio FLAC UHQ</option>
      <option value="wav">Audio WAV UHQ</option>
      <option value="webm">Audio WEBM UHQ</option>
      <option value="mp3">Audio MP3 Default</option>
      <option value="m4a">Audio M4A</option>
      <option value="aac">Audio AAC</option>
      <option value="opus">Audio OPUS</option>
      <option value="ogg">Audio OGG</option>
      </select>
      <div id="descargandomp3" class="download-container ocultarframeaudio">
        <button class="progress-retry-btn" title="Retry" style="display: none;">
        <i class="fa-solid fa-rotate-right"></i>
        </button>
        <button class="download-again-btn" title="Download again" style="display: none;">
        <i class="fa-solid fa-download"></i>
        </button>
        <div class="download-info">
          <span class="download-text">Download Audio And Please Wait...</span>
          <span class="download-quality"></span>
        </div>
        <div class="download-actions">
          <button class="download-btn audio-btn">Download</button>
          <button class="retry-btn" style="display: none;">Retry</button>
        </div>
        <div class="progress-container" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">0%</span>
        </div>
         <div class="download-footer">
          <a href="https://github.com/akari310/" target="_blank"><i class="fa-brands fa-github"></i> by: Akari</a>
        </div>
         <h1 class="text-description-download">
          <span >Enable pop-ups on YouTube to download audio or video</span>
        </h1>
      </div>
    </div>
    </form>
      </main>
  `;



    // Define themes

    // ------------------------------
    // Feature: Show channel name on Shorts list (Home / feeds)
    // Adapted from: @𝖢𝖸 𝖥𝗎𝗇𝗀

    // ------------------------------
    function setupShortsChannelNameFeature(enabled) {
        __ytToolsRuntime.shortsChannelName.enabled = !!enabled;
        document.documentElement.dataset.mdcmShortsChannelName = enabled ? '1' : '0';

        // Disable: stop observers to reduce overhead
        if (!enabled) {
            try {
                __ytToolsRuntime.shortsChannelName.observer?.disconnect?.();
            } catch (e) { }
            try {
                __ytToolsRuntime.shortsChannelName.io?.disconnect?.();
            } catch (e) { }
            __ytToolsRuntime.shortsChannelName.observer = null;
            __ytToolsRuntime.shortsChannelName.io = null;
            clearTimeout(__ytToolsRuntime.shortsChannelName.scanT);
            __ytToolsRuntime.shortsChannelName.scanT = null;
            return;
        }

        const rt = __ytToolsRuntime.shortsChannelName;

        const getShortsVideoIdFromItem = (item) => {
            const a = item.querySelector('a[href^="/shorts/"]');
            const href = a?.getAttribute('href') || '';
            const m = href.match(/\/shorts\/([^/?]+)/);
            return m?.[1] || null;
        };

        const findSubhead = (item) => {
            return item.querySelector(
                '.ShortsLockupViewModelHostOutsideMetadataSubhead,' +
                ' .shortsLockupViewModelHostOutsideMetadataSubhead,' +
                ' .ShortsLockupViewModelHostMetadataSubhead,' +
                ' .shortsLockupViewModelHostMetadataSubhead'
            );
        };

        const ensureLabel = (subhead) => {
            const parent = subhead?.parentElement;
            if (!parent) return null;
            let el = parent.querySelector('.yt-tools-shorts-channel-name');
            if (!el) {
                el = document.createElement('div');
                el.className = 'yt-tools-shorts-channel-name';
                el.textContent = '';
                parent.insertBefore(el, subhead);
            }
            return el;
        };

        const tryExtractChannelNameFromDom = (item) => {
            const a = item.querySelector('a[href^="/@"], a[href^="/channel/"]');
            const name = (a?.textContent || a?.getAttribute('title') || '').trim();
            return name || null;
        };

        const fetchChannelNameFromWatch = (videoId) => {
            rt.fetchChain = rt.fetchChain.then(async () => {
                if (rt.cache.has(videoId)) return rt.cache.get(videoId);
                let res = null;
                try {
                    res = await fetch(`/watch?v=${videoId}`, {
                        method: 'GET',
                        credentials: 'same-origin',
                        cache: 'force-cache',
                    });
                } catch (e) {
                    return '';
                }
                if (!res?.ok) return '';
                const html = await res.text();

                const idx = html.indexOf('itemprop="author"');
                if (idx < 0) return '';
                const start = html.lastIndexOf('<span', idx);
                const end = html.indexOf('</span>', idx);
                if (start < 0 || end < 0) return '';
                const chunk = html.slice(start, end + 7);

                const doc = new DOMParser().parseFromString(chunk, 'text/html');
                const link = doc.querySelector('link[itemprop="name"]');
                return (link?.getAttribute('content') || '').trim();
            });
            return rt.fetchChain;
        };

        const getChannelName = (videoId, item) => {
            const cached = rt.cache.get(videoId);
            if (cached) return Promise.resolve(cached);

            const persisted = getShortsChannelFromPersistedCache(videoId);
            if (persisted) {
                rt.cache.set(videoId, persisted);
                return Promise.resolve(persisted);
            }

            const domName = tryExtractChannelNameFromDom(item);
            if (domName) {
                rt.cache.set(videoId, domName);
                setShortsChannelToPersistedCache(videoId, domName);
                return Promise.resolve(domName);
            }

            const inflight = rt.inflight.get(videoId);
            if (inflight) return inflight;

            const p = fetchChannelNameFromWatch(videoId)
                .then((name) => {
                    const finalName = (name || '').trim();
                    if (finalName) {
                        rt.cache.set(videoId, finalName);
                        setShortsChannelToPersistedCache(videoId, finalName);
                    }
                    return finalName;
                })
                .finally(() => {
                    rt.inflight.delete(videoId);
                });
            rt.inflight.set(videoId, p);
            return p;
        };

        const processItem = (item) => {
            if (!(item instanceof Element)) return;
            if (item.dataset.ytToolsShortsChannelProcessed === '1') return;

            const subhead = findSubhead(item);
            if (!subhead) return;

            const videoId = getShortsVideoIdFromItem(item);
            if (!videoId) return;

            item.dataset.ytToolsShortsChannelProcessed = '1';
            item.dataset.ytToolsShortsVideoId = videoId;

            const label = ensureLabel(subhead);
            if (!label) return;
            label.textContent = '';

            rt.io?.observe(item);
        };

        if (!rt.io) {
            rt.io = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const item = entry.target;
                    const videoId = item?.dataset?.ytToolsShortsVideoId;
                    const subhead = findSubhead(item);
                    const label = subhead?.parentElement?.querySelector?.('.yt-tools-shorts-channel-name');

                    if (!videoId || !label) {
                        rt.io.unobserve(item);
                        continue;
                    }

                    getChannelName(videoId, item)
                        .then((name) => {
                            if (name) label.textContent = name;
                        })
                        .finally(() => {
                            rt.io.unobserve(item);
                        });
                }
            }, {
                threshold: 0.15
            });
        }

        const scan = () => {
            clearTimeout(rt.scanT);
            rt.scanT = setTimeout(() => {
                document
                    .querySelectorAll('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2')
                    .forEach(processItem);
            }, 120);
        };

        if (!rt.observer) {
            rt.observer = new MutationObserver(scan);
            const observeTarget = document.querySelector('#page-manager') || document.body;
            rt.observer.observe(observeTarget, {
                childList: true,
                subtree: true
            });
        }

        scan();
    }



    // ------------------------------
    // Feature: Show cached rating/likes/dislikes on video cards (watch related + home/search)

    // ------------------------------
    function getVideoIdFromLockup(lockup) {
        const a = lockup.querySelector('a[href*="watch?v="]');
        if (a) {
            const m = (a.getAttribute('href') || '').match(/[?&]v=([^&]+)/);
            if (m) return m[1];
        }
        const el = lockup.querySelector('[class*="content-id-"]');
        if (el) {
            const m = el.className.match(/content-id-([A-Za-z0-9_-]+)/);
            if (m) return m[1];
        }
        return null;
    }

    function createSvgIconFromString(svgString, sizePx) {
        const div = document.createElement('div');
        div.innerHTML = safeHTML(svgString.trim());
        const svg = div.firstElementChild;
        if (!svg) return null;
        svg.setAttribute('width', String(sizePx || 14));
        svg.setAttribute('height', String(sizePx || 14));
        svg.style.display = 'inline-block';
        svg.style.verticalAlign = 'middle';
        svg.style.marginRight = '2px';
        return svg;
    }

    const LOCKUP_RATING_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" /></svg>';
    const LOCKUP_LIKE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-thumb-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" /></svg>';
    const LOCKUP_DISLIKE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-thumb-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" /></svg>';

    function injectLockupCachedStats() {
        if (!window.location.href.includes('youtube.com')) return;
        document.querySelectorAll('yt-lockup-view-model').forEach((lockup) => {
            if (lockup.hasAttribute('data-yt-tools-lockup-stats')) return;
            const videoId = getVideoIdFromLockup(lockup);
            if (!videoId) return;
            const cached = getLikesDislikesFromPersistedCache(videoId);
            if (!cached) return;
            const hasRating = cached.rating != null;
            const hasLikes = cached.likes != null;
            const hasDislikes = cached.dislikes != null;
            if (!hasRating && !hasLikes && !hasDislikes) return;
            const meta = lockup.querySelector('yt-content-metadata-view-model');
            if (!meta) return;
            const row = document.createElement('div');
            row.className = 'yt-content-metadata-view-model__metadata-row';
            row.setAttribute('data-yt-tools-lockup-stats-row', '1');
            const wrap = document.createElement('span');
            wrap.className = 'yt-core-attributed-string yt-content-metadata-view-model__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color';
            wrap.setAttribute('dir', 'auto');
            wrap.setAttribute('role', 'text');
            const sep = () => {
                const s = document.createTextNode(' · ');
                return s;
            };
            if (hasRating) {
                const ratingIcon = createSvgIconFromString(LOCKUP_RATING_SVG, 14);
                if (ratingIcon) wrap.appendChild(ratingIcon);
                wrap.appendChild(document.createTextNode(' ' + cached.rating.toFixed(1)));
                if (hasLikes || hasDislikes) wrap.appendChild(sep());
            }
            if (hasLikes) {
                const likeIcon = createSvgIconFromString(LOCKUP_LIKE_SVG, 14);
                if (likeIcon) wrap.appendChild(likeIcon);
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.likes, 0)));
                if (hasDislikes) wrap.appendChild(sep());
            }
            if (hasDislikes) {
                const dislikeIcon = createSvgIconFromString(LOCKUP_DISLIKE_SVG, 14);
                if (dislikeIcon) wrap.appendChild(dislikeIcon);
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.dislikes, 0)));
            }
            row.appendChild(wrap);
            meta.appendChild(row);
            lockup.setAttribute('data-yt-tools-lockup-stats', videoId);
        });
    }

    function getVideoIdFromShortsLockup(item) {
        if (item.dataset.ytToolsShortsVideoId) return item.dataset.ytToolsShortsVideoId;
        var a = item.querySelector('a[href^="/shorts/"]');
        if (!a) return null;
        var m = (a.getAttribute('href') || '').match(/\/shorts\/([^/?]+)/);
        return m ? m[1] : null;
    }

    function injectShortsLockupCachedStats() {
        if (!window.location.href.includes('youtube.com')) return;
        // Process inner lockup (has metadata); v2 wraps it and would duplicate
        document.querySelectorAll('ytm-shorts-lockup-view-model').forEach(function (item) {
            if (item.hasAttribute('data-yt-tools-shorts-stats')) return;
            var videoId = getVideoIdFromShortsLockup(item);
            if (!videoId) return;
            var cached = getLikesDislikesFromPersistedCache(videoId);
            if (!cached) return;
            var hasLikes = cached.likes != null;
            var hasDislikes = cached.dislikes != null;
            if (!hasLikes && !hasDislikes) return;
            var subhead = item.querySelector(
                '.ShortsLockupViewModelHostOutsideMetadataSubhead,' +
                '.shortsLockupViewModelHostOutsideMetadataSubhead,' +
                '.ShortsLockupViewModelHostMetadataSubhead,' +
                '.shortsLockupViewModelHostMetadataSubhead'
            );
            if (!subhead || !subhead.parentElement) return;
            var wrap = document.createElement('span');
            wrap.className = 'yt-core-attributed-string yt-content-metadata-view-model__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color yt-tools-shorts-stats-row';
            wrap.setAttribute('dir', 'auto');
            wrap.setAttribute('role', 'text');
            wrap.setAttribute('style', 'color: #aaa !important;');
            var sep = function () {
                return document.createTextNode(' \u00b7 ');
            };
            if (hasLikes) {
                var likeIcon = createSvgIconFromString(LOCKUP_LIKE_SVG, 12);
                if (likeIcon) {
                    likeIcon.style.setProperty('color', '#aaa', 'important');
                    wrap.appendChild(likeIcon);
                }
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.likes, 0)));
                if (hasDislikes) wrap.appendChild(sep());
            }
            if (hasDislikes) {
                var dislikeIcon = createSvgIconFromString(LOCKUP_DISLIKE_SVG, 12);
                if (dislikeIcon) {
                    dislikeIcon.style.setProperty('color', '#aaa', 'important');
                    wrap.appendChild(dislikeIcon);
                }
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.dislikes, 0)));
            }
            var row = document.createElement('div');
            row.className = 'yt-tools-shorts-stats-wrap';
            row.setAttribute('style', 'color: #aaa !important;');
            row.appendChild(wrap);
            subhead.parentElement.appendChild(row);
            item.setAttribute('data-yt-tools-shorts-stats', videoId);
        });
    }

    function createLockupStatsObserver(target) {
        var lockupStatsDebounceT = null;
        var lockupStatsScheduled = false;
        var obs = new MutationObserver(function () {
            if (lockupStatsScheduled) return;
            lockupStatsScheduled = true;
            clearTimeout(lockupStatsDebounceT);
            lockupStatsDebounceT = setTimeout(function () {
                lockupStatsScheduled = false;
                if (!window.location.href.includes('youtube.com')) return;
                injectLockupCachedStats();
                injectShortsLockupCachedStats();
                // Single extra pass for late-rendered lockups (reduced from 3 passes)
                setTimeout(function () {
                    if (!window.location.href.includes('youtube.com')) return;
                    if (!hasUnprocessedLockups()) return;
                    injectLockupCachedStats();
                    injectShortsLockupCachedStats();
                }, 1200);
            }, 280);
        });
        obs.observe(target, {
            childList: true,
            subtree: true
        });
        return obs;
    }

    function retargetLockupStatsObserverIfNeeded() {
        if (!window.location.href.includes('youtube.com/watch')) return;
        var secondary = document.getElementById('secondary') || document.querySelector('ytd-watch-next-secondary-results-renderer');
        if (!secondary || !secondary.parentNode) return;
        if (__ytToolsRuntime.lockupCachedStatsObserveTarget === secondary) return;
        var obs = __ytToolsRuntime.lockupCachedStatsObserver;
        if (!obs) return;
        obs.disconnect();
        __ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(secondary);
        __ytToolsRuntime.lockupCachedStatsObserveTarget = secondary;
    }

    function hasUnprocessedLockups() {
        var normal = document.querySelectorAll('yt-lockup-view-model:not([data-yt-tools-lockup-stats])').length > 0;
        var shorts = document.querySelectorAll('ytm-shorts-lockup-view-model:not([data-yt-tools-shorts-stats])').length > 0;
        return normal || shorts;
    }

    function runLockupCachedStatsCatchUp() {
        if (!window.location.href.includes('youtube.com')) return;
        if (document.visibilityState !== 'visible') return;
        if (!hasUnprocessedLockups()) return;
        injectLockupCachedStats();
        injectShortsLockupCachedStats();
    }

    function setupLockupCachedStats() {
        if (!window.location.href.includes('youtube.com')) return;
        injectLockupCachedStats();
        injectShortsLockupCachedStats();
        var secondary = document.getElementById('secondary') || document.querySelector('ytd-watch-next-secondary-results-renderer');
        var observeTarget = secondary && secondary.parentNode ? secondary : document.body;
        if (__ytToolsRuntime.lockupCachedStatsObserver) {
            if (observeTarget !== __ytToolsRuntime.lockupCachedStatsObserveTarget) {
                __ytToolsRuntime.lockupCachedStatsObserver.disconnect();
                __ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(observeTarget);
                __ytToolsRuntime.lockupCachedStatsObserveTarget = observeTarget;
            }
            return;
        }
        __ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(observeTarget);
        __ytToolsRuntime.lockupCachedStatsObserveTarget = observeTarget;
        // Catch-up interval: apply stats to any new cards (scroll, filters, SPA) every 1.8s when there are unprocessed lockups
        if (!__ytToolsRuntime.lockupCachedStatsIntervalId) {
            __ytToolsRuntime.lockupCachedStatsIntervalId = setInterval(runLockupCachedStatsCatchUp, 1800);
        }
    }




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


    function applySettings() {
        const settings = {
            theme: $e('input[name="theme"]:checked')?.value || 'normal',
            bgColorPicker: $id('bg-color-picker')?.value,
            progressbarColorPicker: $id('progressbar-color-picker')?.value,
            primaryColorPicker: $id('primary-color-picker')?.value,
            secondaryColorPicker: $id('secondary-color-picker')?.value,
            headerColorPicker: $id('header-color-picker')?.value,
            iconsColorPicker: $id('icons-color-picker')?.value,
            menuColorPicker: $id('menu-color-picker')?.value,
            lineColorPicker: $id('line-color-picker')?.value,
            timeColorPicker: $id('time-color-picker')?.value,
            dislikes: $id('dislikes-toggle')?.checked,
            bookmarks: $id('bookmarks-toggle')?.checked,
            continueWatching: $id('continue-watching-toggle')?.checked,
            shortsChannelName: $id('shorts-channel-name-toggle')?.checked,
            nonstopPlayback: $id('nonstop-playback-toggle')?.checked ?? true,
            audioOnly: $id('audio-only-toggle')?.checked ?? false,
            themes: $id('themes-toggle')?.checked,
            translation: $id('translation-toggle')?.checked,
            avatars: $id('avatars-toggle')?.checked,
            reverseMode: $id('reverse-mode-toggle')?.checked,
            waveVisualizer: $id('wave-visualizer-toggle')?.checked,
            waveVisualizerSelected: $id('select-wave-visualizer-select')?.value,
            hideComments: $id('hide-comments-toggle')?.checked,
            hideSidebar: $id('hide-sidebar-toggle')?.checked,
            disableAutoplay: $id('autoplay-toggle')?.checked,
            cinematicLighting: $id('cinematic-lighting-toggle')?.checked,
            syncCinematic: $id('sync-cinematic-toggle')?.checked,
            sidePanelStyle: $id('side-panel-style-select')?.value || 'blur',
            customTimelineColor: $id('custom-timeline-color-toggle')?.checked,
            disableSubtitles: $id('subtitles-toggle')?.checked,
            playerSize: $id('player-size-slider')?.value || 100,
            selectVideoQuality: $id('select-video-qualitys-select')?.value || 'user',
            languagesComments: $id('select-languages-comments-select')?.value || 'vi',
            menu_developermdcm: { bg: selectedBgColor, color: selectedTextColor, accent: selectedBgAccentColor }
        };

        __ytToolsRuntime.settings = settings;
        $sp('--yt-enhance-menu-bg', settings.menu_developermdcm.bg);
        $sp('--yt-enhance-menu-text', settings.menu_developermdcm.color);
        $sp('--yt-enhance-menu-accent', settings.menu_developermdcm.accent);

        renderizarButtons();
        if (typeof applyNonstopPlayback === 'function') applyNonstopPlayback(settings.nonstopPlayback);
        if (typeof applyAudioOnlyMode === 'function') applyAudioOnlyMode(settings.audioOnly);
        
        initializeHeaderButtons();

        // Platform Specifics
        if (isYTMusic) {
            document.body.classList.remove('ytm-style-blur', 'ytm-style-liquid', 'ytm-style-transparent');
            document.body.classList.add(`ytm-style-${settings.sidePanelStyle}`);
            if (settings.cinematicLighting && isWatchPage()) {
                setTimeout(() => ytmAmbientMode.setup(), 800);
            } else {
                ytmAmbientMode.cleanup();
            }
        } else {
            // YouTube Main
            const commentsSection = $id('comments');
            if (commentsSection) commentsSection.style.display = settings.hideComments ? 'none' : 'block';
            
            if (typeof videoDislike === 'function') videoDislike();
            if (typeof shortDislike === 'function') shortDislike();
            
            const sidebarInner = $e('#secondary > #secondary-inner');
            if (sidebarInner) sidebarInner.style.display = settings.hideSidebar ? 'none' : 'block';

            applyAutoplaySubtitleToggles(settings);
            applyVideoQuality(settings.selectVideoQuality);
        }

        applyThemeLogic(settings);
        
        // Features
        applyBookmarksIfEnabled(settings);
        setupContinueWatchingFeature(settings.continueWatching);
        if (!isYTMusic) {
            setupShortsChannelNameFeature(settings.shortsChannelName);
            setupLockupCachedStats();
            setupShortsObserver();
            initCommentNavListener(settings);
        }

        checkForVideo(settings);
        downloadDescriptionVideo();
        traductor();
    }

    function applyAutoplaySubtitleToggles(settings) {
        const auto = $e('.ytp-autonav-toggle-button');
        if (auto) {
            const isOn = auto.getAttribute('aria-checked') === 'true';
            if (settings.disableAutoplay !== !isOn) auto.click();
        }
        const sub = $e('.ytp-subtitles-button');
        if (sub) {
            const isOn = sub.getAttribute('aria-pressed') === 'true';
            if (settings.disableSubtitles !== !isOn) sub.click();
        }
    }

    function applyVideoQuality(quality) {
        if (quality === "user") return;
        let ytPlayerQuality = localStorage.getItem('yt-player-quality');
        let data = ytPlayerQuality ? JSON.parse(ytPlayerQuality) : { creation: Date.now(), expiration: Date.now() + 31536000000 };
        data.data = JSON.stringify({ quality: quality, previousQuality: 240 });
        localStorage.setItem('yt-player-quality', JSON.stringify(data));
    }

    function applyThemeLogic(settings) {
        let dynamicCssArray = [];
        const selectedTheme = themes[settings.theme] || themes[0];
        
        if (settings.customTimelineColor) {
            dynamicCssArray.push(`.ytp-swatch-background-color { background: linear-gradient(135deg, #4c1d95, #8b5cf6) !important; }`);
            if (isYTMusic) dynamicCssArray.push(`#progress-bar { --paper-slider-active-color: #8b5cf6 !important; }`);
        }

        if (settings.themes && isDarkModeActive === 'dark') {
            if (settings.theme !== '0') {
                dynamicCssArray.push(getDynamicThemeCss(settings, selectedTheme));
            }
        }

        setDynamicCss(dynamicCssArray.join('\n'));
    }


        function initSmartCommentObserver(settings) {
            if (isYTMusic) return;
            const commentsContainer = document.querySelector('#comments');
            if (!commentsContainer) return;

            if (window._commentIO) { try { window._commentIO.disconnect(); } catch (e) { } }
            if (window._commentMO) { try { window._commentMO.disconnect(); } catch (e) { } }

            window._commentIO = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    window._commentMO = new MutationObserver((mutations) => {
                        let shouldUpdate = false;
                        for (let m of mutations) {
                            if (m.addedNodes.length > 0) {
                                shouldUpdate = true;
                                break;
                            }
                        }
                        if (shouldUpdate) {
                            window.requestAnimationFrame(() => {
                                if (settings.avatars) agregarBotonesDescarga(settings);
                                if (settings.translation) traductor();
                            });
                        }
                    });

                    const commentContents = document.querySelector('ytd-comments #contents');
                    if (commentContents) {
                        window._commentMO.observe(commentContents, { childList: true, subtree: true });
                    }
                    window._commentIO.disconnect();
                }
            });

            window._commentIO.observe(commentsContainer);
        }

        function setupShortsObserver() {
            if (isYTMusic) return;
            const contentScrollable = $e('.anchored-panel.style-scope.ytd-shorts #contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer');
            if (contentScrollable) {
                if (__ytToolsRuntime.shortsObserver) {
                    try { __ytToolsRuntime.shortsObserver.disconnect(); } catch (e) { }
                }
                let domTimeout;
                __ytToolsRuntime.shortsObserver = new MutationObserver(() => {
                    if (domTimeout) clearTimeout(domTimeout);
                    domTimeout = setTimeout(() => {
                        insertReelBarButtons();
                        addIcon();
                    }, 300);
                });
                __ytToolsRuntime.shortsObserver.observe(contentScrollable, { childList: true, subtree: true });
            }
        }

        function initCommentNavListener(settings) {
            if (isYTMusic) return;
            if (!window.__ytToolsCommentNavBound) {
                window.__ytToolsCommentNavBound = true;
                document.addEventListener('yt-navigate-finish', () => {
                    setTimeout(() => initSmartCommentObserver(settings), 1500);
                });
            }
            initSmartCommentObserver(settings);
        }

})();

