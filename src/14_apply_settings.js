
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
