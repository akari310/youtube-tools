
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

    let validoBotones = true;

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


    function paramsVideoURL() {
        const parametrosURL = new URLSearchParams(window.location.search);
        return parametrosURL.get('v');
    }

    function isWatchPage() {
        return window.location.href.includes('youtube.com/watch');
    }

    function checkDarkModeActive() {
        const htmlElement = document.documentElement;
        const isDarkModeYT = htmlElement.hasAttribute('dark') || htmlElement.getAttribute('style')?.includes('color-scheme: dark');
        const isDarkModeYTM = document.querySelector('ytmusic-app')?.hasAttribute('dark');
        return !!(isDarkModeYT || isDarkModeYTM);
    }

    function FormatterNumber(num, digits) {
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
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

