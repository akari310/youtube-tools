
    setupHeaderObserver();
    scheduleAddIcon();
    validoBotones = true;
    renderButtons();

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

    document.addEventListener('yt-navigate-finish', () => {
        if (typeof addIcon === 'function') {
            scheduleAddIcon();
        }
        if (!document.location.href.includes('watch')) {
            hideCanvas();
        }
        scheduleApplySettings();
        retryWaveSetupAfterNav();
        
        validoBotones = true;
        setTimeout(() => renderButtons(), 500);

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

    checkNewVersion();
})();
