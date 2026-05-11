    function nukeShortsCinematic() {
        if (isYTMusic) return;
        // 1. Remove from regular DOM
        const selector = '#cinematic-container.ytd-reel-video-renderer, #shorts-cinematic-container, #cinematic-shorts-scrim';
        document.querySelectorAll(selector).forEach(el => el.remove());

        // 2. Remove from Shadow DOMs of all reel renderers
        document.querySelectorAll('ytd-reel-video-renderer').forEach(reel => {
            if (reel.shadowRoot) {
                const cinematic = reel.shadowRoot.querySelector('#cinematic-container');
                if (cinematic) cinematic.remove();
            }
        });

        // 3. Force transparency on engagement panels in Shorts
        document.querySelectorAll('ytd-engagement-panel-section-list-renderer[shorts-panel], ytd-shorts ytd-engagement-panel-section-list-renderer').forEach(panel => {
            const content = panel.querySelector('#content');
            const header = panel.querySelector('#header');
            if (content) {
                content.style.setProperty('background', 'transparent', 'important');
                content.style.setProperty('background-color', 'transparent', 'important');
            }
            if (header) {
                header.style.setProperty('background', 'transparent', 'important');
                header.style.setProperty('background-color', 'transparent', 'important');
            }
            panel.style.setProperty('background', 'transparent', 'important');
            panel.style.setProperty('background-color', 'transparent', 'important');
        });

        // 4. Force transparency on navigation container in Shorts
        document.querySelectorAll('.navigation-container.ytd-shorts').forEach(nav => {
            nav.style.setProperty('background', 'transparent', 'important');
            nav.style.setProperty('background-color', 'transparent', 'important');
        });
    }


    // Run periodically during Shorts browsing - only once
    if (!window.__ytToolsShortsNukeInterval) {
        window.__ytToolsShortsNukeInterval = setInterval(() => {
            if (window.location.pathname.startsWith('/shorts/')) {
                nukeShortsCinematic();
            }
        }, 1500);
    }

})();
