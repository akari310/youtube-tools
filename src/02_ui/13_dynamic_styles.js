
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
