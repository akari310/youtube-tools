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

    