
    document.addEventListener('yt-navigate-finish', () => {
        if (typeof addIcon === 'function') {
            addIcon();
        }
        if (!document.location.href.includes('watch')) {
            hideCanvas();
        }
        scheduleApplySettings();
        retryWaveSetupAfterNav();

        if (!document.location.href.includes('youtube.com')) return;

        if (isYTMusic) {
            const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
            if (settings.cinematicLighting && window.location.href.includes('/watch')) {
                ytmAmbientMode.show();
            }
        } else {
            if (window.location.pathname.startsWith('/shorts/')) {
                nukeShortsCinematic();
                insertReelBarButtons();
            }
        }
    });

    addIcon();

    if (!isYTMusic) {
        const insertButtons = () => { insertReelBarButtons(); };
        const targetNode = $e('body');
        if (targetNode != undefined) {
            const observer = new MutationObserver(insertButtons);
            observer.observe(targetNode, { childList: true, subtree: true });
            insertReelBarButtons();
        }
    }

    if (isYTMusic) {
        initYTMHeaderScroll();
    }

    checkNewVersion();
})();
