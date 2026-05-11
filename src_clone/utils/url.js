    function applySettings() {
        const formulariodescarga = $e('.formulariodescarga');
        const formulariodescargaaudio = $e('.formulariodescargaaudio');
        if (formulariodescarga != undefined) {
            formulariodescarga.classList.add('ocultarframe');
            formulariodescargaaudio.classList.add('ocultarframe');
        }
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
            cinematicLighting: $id('cinematic-lighting-toggle') ? $id('cinematic-lighting-toggle').checked : false,
            syncCinematic: $id('sync-cinematic-toggle') ? $id('sync-cinematic-toggle').checked : false, // NUEVO SETTING
            sidePanelStyle: $id('side-panel-style-select') ? $id('side-panel-style-select').value : 'blur',
            customTimelineColor: $id('custom-timeline-color-toggle') ? $id('custom-timeline-color-toggle').checked : false,
            disableSubtitles: $id('subtitles-toggle') ? $id('subtitles-toggle').checked : false,
            // fontSize: $id('font-size-slider').value,
            playerSize: $id('player-size-slider').value,
            selectVideoQuality: $id('select-video-qualitys-select').value,
            languagesComments: $id('select-languages-comments-select').value,
            // menuBgColor: $id('menu-bg-color-picker').value,
            // menuTextColor: $id('menu-text-color-picker').value,
            menu_developermdcm: {
                bg: selectedBgColor,
                color: selectedTextColor,
                accent: selectedBgAccentColor
            }
            // menuFontSize: $id('menu-font-size-slider').value,
        };
        $sp('--yt-enhance-menu-bg', settings.menu_developermdcm.bg);
        $sp('--yt-enhance-menu-text', settings.menu_developermdcm.color);
        $sp('--yt-enhance-menu-accent', settings.menu_developermdcm.accent);

        renderizarButtons();
        applyNonstopPlayback(settings.nonstopPlayback);
        syncAudioOnlyTabCheckbox(settings);
        applyAudioOnlyMode(getEffectiveAudioOnly(settings));

        // Handle Side Panel Style classes
        document.body.classList.remove('ytm-style-blur', 'ytm-style-liquid', 'ytm-style-transparent');
        if (settings.sidePanelStyle === 'liquid') {
            document.body.classList.add('ytm-style-liquid');
        } else if (settings.sidePanelStyle === 'transparent') {
            document.body.classList.add('ytm-style-transparent');
        } else {
            document.body.classList.add('ytm-style-blur');
        }


        // Initialize header buttons
        initializeHeaderButtons();



        // Hide comments (YT only)
        if (!isYTMusic) {
            const commentsSection = $id('comments');
            if (commentsSection) {
                commentsSection.style.display = settings.hideComments ? 'none' : 'block';
            }

            // Like vs Dislike Bar (YT only)
            if (typeof applyLikeDislikeBarIfEnabled === 'function') {
                applyLikeDislikeBarIfEnabled(settings);
            }

            // Show Dislikes count (YT only)
            if (typeof videoDislike === 'function') videoDislike();
            if (typeof shortDislike === 'function') shortDislike();
            showDislikes = !!settings.dislikes;
        }

        // Active inactive Themes
        const themesMenuSection = $e('.themes-hidden');
        if (themesMenuSection) {
            themesMenuSection.style.display = settings.themes ? 'block' : 'none';
        }

        // Hide sidebar (YT only)
        if (!isYTMusic) {
            const sidebarSection = $e('#secondary > #secondary-inner');
            if (sidebarSection) {
                sidebarSection.classList.add('side-moi');
                const sidebarSection2 = $e('.side-moi');
                sidebarSection2.style.display = settings.hideSidebar ? 'none' : 'block';
            }
        }

        // Disable autoplay (YT only - uses .ytp-autonav-toggle-button)
        if (!isYTMusic) {
            const autoplayToggle = $e('.ytp-autonav-toggle-button');
            if (autoplayToggle) {
                const isCurrentlyOn =
                    autoplayToggle.getAttribute('aria-checked') === 'true';
                if (settings.disableAutoplay && isCurrentlyOn) {
                    autoplayToggle.click();
                } else if (!settings.disableAutoplay && !isCurrentlyOn) {
                    autoplayToggle.click();
                }
            }
        }
        // Disable subtitles (YT only - uses .ytp-subtitles-button)
        if (!isYTMusic) {
            const subtitleToggle = $e('.ytp-subtitles-button');
            if (subtitleToggle) {
                const isCurrentlyOn =
                    subtitleToggle.getAttribute('aria-pressed') === 'true';
                if (settings.disableSubtitles && isCurrentlyOn) {
                    subtitleToggle.click();
                } else if (!settings.disableSubtitles && !isCurrentlyOn) {
                    subtitleToggle.click();
                }
            }
        }
        // Apply cinematic/ambient lighting setting
        if (isYTMusic) {
            // YTM: custom ambient mode
            if (settings.cinematicLighting && isWatchPage()) {
                setTimeout(() => {
                    ytmAmbientMode.setup();
                }, 800);
            } else {
                ytmAmbientMode.cleanup();
            }
        } else if (isWatchPage()) {
            setTimeout(() => {
                const isCurrentlyActive = isCinematicActive();
                if (settings.syncCinematic) {
                    if (settings.cinematicLighting && !isCurrentlyActive) {
                        toggleCinematicLighting();
                    } else if (!settings.cinematicLighting && isCurrentlyActive) {
                        toggleCinematicLighting();
                    }
                } else {
                    const cinematicDiv = $id('cinematics');
                    if (cinematicDiv) {
                        cinematicDiv.style.display = settings.cinematicLighting ? 'block' : 'none';
                    }
                }
            }, 1000);
        }

        // Adjust font size
        // $e('body').style.fontSize = `${settings.fontSize}px`;

        // Adjust player size
        const player = $e('video');
        if (player) {
            player.style.transform = `scale(${settings.playerSize / 100})`;
        }

        // selected video quality (YT only - uses div#movie_player)
        if (!isYTMusic) {
            const video = $e('div#movie_player');
            let ytPlayerQuality = localStorage.getItem('yt-player-quality');

            if (video != undefined && settings.selectVideoQuality !== "user") {
                if (ytPlayerQuality) {
                    let qualitySettings = JSON.parse(ytPlayerQuality);
                    qualitySettings.data = JSON.stringify({
                        quality: settings.selectVideoQuality,
                        previousQuality: 240
                    });
                    localStorage.setItem('yt-player-quality', JSON.stringify(qualitySettings));
                } else {
                    let defaultQualitySettings = {
                        data: JSON.stringify({
                            quality: 720,
                            previousQuality: 240
                        }),
                        expiration: Date.now() + (365 * 24 * 60 * 60 * 1000),
                        creation: Date.now()
                    };
                    localStorage.setItem('yt-player-quality', JSON.stringify(defaultQualitySettings));
                }
            }
        }

        // Apply menu appearance settings
        // $sp('--yt-enhance-menu-bg', settings.menuBgColor);
        // $sp('--yt-enhance-menu-text', settings.menuTextColor);
        // $sp('--yt-enhance-menu-font-size', `${settings.menuFontSize}px`);

        // Apply theme
        const selectedTheme = themes[settings.theme] || themes[0] || {};
        const isThemeCustom = $e(`input[name="theme"][value="custom"]`).checked;
        const isThemeNormal = $e(`input[name="theme"][value="normal"]`).checked;
        const themeCustomOptions = $e('.theme-custom-options');
        const themeNormal = $e('.theme-selected-normal');
        // Tối ưu: Dùng mảng để gom CSS, chỉ tiêm vào trang 1 lần duy nhất ở cuối
        let dynamicCssArray = [];
        const addDynamicCss = (css) => {
            if (css) dynamicCssArray.push(css);
        };

        // CHANGE DEFAULT TIMELINE TO ROYAL PURPLE AESTHETIC
        if (settings.customTimelineColor) {
            addDynamicCss(`
      .ytp-swatch-background-color {
        background: linear-gradient(135deg, #4c1d95, #8b5cf6) !important;
      }
    `);
            if (isYTMusic) {
                addDynamicCss(`
         #progress-bar {
           --paper-slider-active-color: #8b5cf6 !important;
           --paper-slider-knob-color: #8b5cf6 !important;
           --paper-slider-secondary-color: #8b5cf680 !important;
         }
       `);
            }
        }
        if (isThemeCustom) {
            themeNormal.style.display = "flex"
            themeCustomOptions.style.display = "flex";
            $e('.themes-options').style.display = "none";
        }
        if (isThemeNormal) {
            $e(`input[name="theme"][value="custom"]`).checked = false;
        }



        // Helper: apply YTM-specific CSS variables for theming
        function applyYTMThemeVars(bgColor, textColor, secondaryText, menuBg, iconColor, raisedBg, progressColor, progressSecondary) {
            // YTM-specific variables
            $sp('--ytmusic-general-background', bgColor);
            $sp('--ytmusic-background', bgColor);
            $sp('--ytmusic-color-white1', textColor);
            $sp('--ytmusic-color-white2', secondaryText || textColor);
            $sp('--ytmusic-color-white3', secondaryText || textColor);
            $sp('--ytmusic-color-white4', secondaryText || textColor);
            $sp('--ytmusic-player-bar-background', raisedBg || bgColor);
            $sp('--ytmusic-nav-bar-background', bgColor);
            $sp('--ytmusic-nav-bar', bgColor);
            $sp('--ytmusic-search-background', menuBg || bgColor);
            // Shared YT/YTM variables
            $sp('--yt-spec-general-background-a', bgColor);
            $sp('--yt-spec-general-background-b', bgColor);
            $sp('--yt-spec-general-background-c', bgColor);

            // YTM Slider Progress bar
            if (progressColor) {
                $sp('--paper-slider-active-color', progressColor);
                $sp('--paper-slider-knob-color', progressColor);
                $sp('--paper-progress-active-color', progressColor);
            }
            if (progressSecondary) {
                $sp('--paper-slider-secondary-color', progressSecondary);
                $sp('--paper-progress-secondary-color', progressSecondary);
            }

            // Force colors via CSS to prevent YTM's native ambient mode from overriding the variables
            // Only add this if not cleared (bgColor is truthy)
            if (bgColor) {
                addDynamicCss(`
                    #nav-bar-background.ytmusic-app-layout {
                        background: ${bgColor} !important;
                        background-image: ${bgColor.includes('gradient') ? bgColor : 'none'} !important;
                    }
                    ytmusic-app-layout.content-scrolled #nav-bar-background.ytmusic-app-layout {
                        background: ${bgColor} !important;
                    }
                    #player-bar-background.ytmusic-app-layout {
                        background: ${raisedBg || bgColor} !important;
                        background-image: ${(raisedBg || bgColor).includes('gradient') ? (raisedBg || bgColor) : 'none'} !important;
                    }
                `);
            }
        }

        if (isYTMusic) {
            initYTMHeaderScroll();
        }

        function checkDarkMode() {

            if (settings.themes) {

                if (isDarkModeActive === 'dark' && !isThemeCustom) {
                    // Apply theme
                    const themesOpts = $e('.themes-options');
                    if (themesOpts) themesOpts.style.display = "block";
                    if (themeNormal) themeNormal.style.display = "none";
                    if (themeCustomOptions) themeCustomOptions.style.display = "none";

                    if (settings.theme === '0') {
                        // Clean up CSS vars from previous theme
                        const props = [
                            '--ytmusic-general-background', '--ytmusic-background', '--ytmusic-color-white1', '--ytmusic-color-white2',
                            '--ytmusic-color-white3', '--ytmusic-color-white4', '--ytmusic-player-bar-background', '--ytmusic-nav-bar-background',
                            '--ytmusic-search-background', '--yt-spec-general-background-a', '--yt-spec-general-background-b', '--yt-spec-general-background-c',
                            '--yt-spec-base-background', '--yt-spec-text-primary', '--yt-spec-text-secondary', '--yt-spec-menu-background',
                            '--yt-spec-icon-inactive', '--yt-spec-brand-icon-inactive', '--yt-spec-brand-icon-active', '--yt-spec-static-brand-red',
                            '--yt-spec-raised-background', '--yt-spec-static-brand-white', '--ytd-searchbox-background', '--ytd-searchbox-text-color',
                            '--ytcp-text-primary', '--ytmusic-nav-bar', '--paper-slider-active-color', '--paper-slider-knob-color',
                            '--paper-progress-active-color', '--paper-slider-secondary-color', '--paper-progress-secondary-color'
                        ];
                        props.forEach(p => document.documentElement.style.removeProperty(p));
                        addDynamicCss(`
              .botones_div {
               background-color: transparent;
               border: none;
               color: #ccc !important;
               user-select: none;
             }
               `);
                        if (localStorage.getItem('backgroundImage')) {
                            applyPageBackground(localStorage.getItem('backgroundImage'), null);
                        } else {
                            applyPageBackground(null);
                        }
                        return;
                    }

                    // Standard YT CSS variables
                    $sp('--yt-spec-base-background', selectedTheme.gradient);
                    $sp('--yt-spec-text-primary', selectedTheme.textColor);
                    $sp('--yt-spec-text-secondary', selectedTheme.textColor);
                    $sp('--yt-spec-menu-background', selectedTheme.gradient);
                    $sp('--yt-spec-icon-inactive', selectedTheme.textColor);
                    $sp('--yt-spec-brand-icon-inactive', selectedTheme.textColor);
                    $sp('--yt-spec-brand-icon-active', selectedTheme.gradient);
                    $sp('--yt-spec-static-brand-red', selectedTheme.gradient); // line current time
                    $sp('--yt-spec-raised-background', selectedTheme.raised);
                    $sp('--yt-spec-static-brand-red', selectedTheme.CurrentProgressVideo);
                    $sp('--yt-spec-static-brand-white', selectedTheme.textColor);
                    $sp('--ytd-searchbox-background', selectedTheme.gradient);
                    $sp('--ytd-searchbox-text-color', selectedTheme.textColor);
                    $sp('--ytcp-text-primary', selectedTheme.textColor);

                    // YTM-specific CSS variables
                    let ytmSliderSolidColor = selectedTheme.CurrentProgressVideo;
                    if (selectedTheme.gradient) {
                        let colors = selectedTheme.gradient.match(/#[0-9a-fA-F]{3,6}/g);
                        if (colors && colors.length > 0) {
                            ytmSliderSolidColor = colors[colors.length - 1]; // Use the most vibrant gradient color
                        }
                    }

                    if (isYTMusic) {
                        applyYTMThemeVars(
                            selectedTheme.gradient,
                            selectedTheme.textColor,
                            selectedTheme.textColor,
                            selectedTheme.gradient,
                            selectedTheme.colorIcons || selectedTheme.textColor,
                            selectedTheme.raised === '#303131' ? selectedTheme.gradient : selectedTheme.raised,
                            ytmSliderSolidColor,
                            ytmSliderSolidColor + '80' // Add 50% opacity in hex for secondary 'buffer' slider
                        );
                    }

                    addDynamicCss(`
              .botones_div {
              background-color: transparent;
              border: none;
              color: #999999;
              user-select: none;
            }
              .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox {
              background:  ${selectedTheme.gradient} !important;
              }
            #background.ytd-masthead { background: ${selectedTheme.gradient}  !important; }
            .ytp-swatch-background-color {
            background: ${selectedTheme.gradient} !important;
          }
          html, body {
            background-color: #0f0f0f !important;
          }
          `);

                    /* Apply background image with theme overlay if exists */
                    if (localStorage.getItem('backgroundImage')) {
                        applyPageBackground(localStorage.getItem('backgroundImage'), selectedTheme.gradient);
                    } else {
                        // Apply only theme gradient
                        addDynamicCss(`
              html, body {
                background-image: ${selectedTheme.gradient} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
            `);
                    }

                    /* Minimal transparency to allow background to show */
                    addDynamicCss(`
          ytd-app,
          #content.ytd-app,
          #page-manager.ytd-app,
          ytd-browse,
          ytd-watch-flexy,
          ytd-two-column-browse-results-renderer,
          #primary.ytd-two-column-browse-results-renderer,
          #secondary.ytd-two-column-browse-results-renderer,
          ytd-rich-grid-renderer,
          #contents.ytd-rich-grid-renderer,
          ytd-item-section-renderer,
          ytd-comments-header-renderer,
          ytd-comment-simplebox-renderer,
          ytd-comment-thread-renderer,
          ytd-comment-renderer,
          #header.ytd-item-section-renderer,
          #body.ytd-comment-renderer,
          #author-thumbnail.ytd-comment-simplebox-renderer,
          #cinematic-shorts-scrim.ytd-shorts,
          ytd-comment-view-model,
          ytd-comment-engagement-bar,
          ytd-comment-replies-renderer,
          #anchored-panel.ytd-shorts,
          #cinematic-container.ytd-reel-video-renderer,
          #shorts-cinematic-container,
          .short-video-container.ytd-reel-video-renderer,
          ytd-reel-video-renderer,
          .navigation-container.ytd-shorts,
          .navigation-button.ytd-shorts {
            background: transparent !important;
          }
          /* Completely hide the cinematic glow in shorts if it's causing black blocks */
          #cinematic-container.ytd-reel-video-renderer,
          #shorts-cinematic-container,
          #cinematic-shorts-scrim.ytd-shorts {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }

          /* Use theme colors on major components without breaking layout */
          #masthead-container.ytd-app,
          #background.ytd-masthead {
            background: ${selectedTheme.gradient} !important;
          }

          /* Revert chip bar to near-native but themed */
          #header.ytd-rich-grid-renderer,
          ytd-feed-filter-chip-bar-renderer,
          #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
            background: transparent !important;
          }


          /* Improve Shorts Navigation: Center 'Next' button if it's the first Short */
          ytd-shorts[is-watch-while-mode] .navigation-container.ytd-shorts,
          .navigation-container.ytd-shorts {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 12px !important;
            height: 100% !important;
            top: 0 !important;
            bottom: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          .navigation-button.ytd-shorts {
            margin: 0 !important;
          }
          /* Ensure hidden buttons don't take up space in the flex container */
          #navigation-button-up[aria-hidden="true"],
          #navigation-button-up[aria-hidden=""],
          #navigation-button-up[hidden],
          #navigation-button-down[aria-hidden="true"],
          #navigation-button-down[aria-hidden=""],
          #navigation-button-down[hidden] {
            display: none !important;
          }

          /* Restore the 'frosted-glass' look but with the theme gradient */
          #frosted-glass.ytd-app {
            background: ${selectedTheme.gradient} !important;
            opacity: 0.8 !important;
          }

          ytd-engagement-panel-section-list-renderer { background: ${selectedTheme.gradient} !important; backdrop-filter: blur(12px) !important; }
            ytd-engagement-panel-title-header-renderer[shorts-panel] #header.ytd-engagement-panel-title-header-renderer {
            background: ${selectedTheme.gradient}  !important;}
            .buttons-tranlate {
            background: ${selectedTheme.btnTranslate} !important;
            }
            .badge-shape-wiz--thumbnail-default {
            color: ${selectedTheme.videoDuration} !important;
            background: ${selectedTheme.gradient} !important;
            }
            #logo-icon {
            color:  ${selectedTheme.textLogo} !important;
          }
          .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text {
            color:  ${selectedTheme.colorIcons} !important;
          }
          .ytd-topbar-menu-button-renderer #button.ytd-topbar-menu-button-renderer {
            color:  ${selectedTheme.colorIcons} !important;
          }
          .yt-spec-icon-badge-shape--style-overlay .yt-spec-icon-badge-shape__icon {
            color:  ${selectedTheme.colorIcons} !important;
          }
          .ytp-svg-fill {
            fill:  ${selectedTheme.colorIcons} !important;
          }
          #ytp-id-30,#ytp-id-17,#ytp-id-19,#ytp-id-20{
            fill:  ${selectedTheme.colorIcons} !important;
          }
            `);

                    // YTM-specific element selectors
                    if (isYTMusic) {
                        addDynamicCss(`
              html, body, ytmusic-app {
                background-color: ${localStorage.getItem('backgroundImage') ? 'transparent' : '#030303'} !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'none' : selectedTheme.gradient} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
              ytmusic-player-bar {
                background: ${localStorage.getItem('backgroundImage') ? 'transparent' : selectedTheme.gradient} !important;
                ${localStorage.getItem('backgroundImage') ? 'backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;' : ''}
              }
              ytmusic-nav-bar {
                background: transparent !important;
                transition: background 0.4s ease-in-out !important;
              }
              ytmusic-nav-bar.scrolled,
              ytmusic-nav-bar[opened],
              body[player-page-open] ytmusic-nav-bar {
                background: ${selectedTheme.gradient} !important;
                ${localStorage.getItem('backgroundImage') ? 'backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;' : ''}
              }
              ytmusic-search-box #input-box { background: ${selectedTheme.gradient} !important; }
              ytmusic-browse-response,
              ytmusic-header-renderer,
              ytmusic-tabbed-browse-renderer,
              ytmusic-detail-header-renderer,
              ytmusic-section-list-renderer,
              ytmusic-carousel-shelf-renderer,
              ytmusic-grid-renderer,
              ytmusic-item-section-renderer,
              #content.ytmusic-app,
              #shorts-container, ytd-shorts, #shorts-inner-container, ytd-reel-player-overlay, #overlay.ytd-reel-video-renderer, ytmusic-app-layout, #mini-guide-background, #guide-wrapper.ytmusic-app-layout, ytmusic-browse-response #background, ytmusic-browse-response .background, ytmusic-app-layout #background, ytmusic-immersive-header-renderer, ytmusic-card-shelf-renderer, ytmusic-chip-cloud-chip-renderer, ytmusic-chip-cloud-renderer, ytmusic-player-page, ytmusic-player-page #background { background: transparent !important; }

              /* Neutralize default YTM gradients */
              ytmusic-browse-response #background,
              ytmusic-header-renderer #background,
              ytmusic-tabbed-browse-renderer #background,
              ytmusic-player-page #background,
              ytmusic-player-page .background,
              .background-gradient.ytmusic-browse-response,
              #background.style-scope.ytmusic-browse-response,
              #header.style-scope.ytmusic-browse-response,

              ytmusic-browse-response [id="background"],
              ytmusic-header-renderer [id="background"], #mini-guide-background, #guide-spacer, .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {
                background: transparent !important;
                background-image: none !important;
                }
              .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {
                display: none !important;
              }

              #layout { background: transparent !important; }
              .content.ytmusic-player-page { background: transparent !important; }

              ytmusic-player-bar .title, ytmusic-player-bar .byline {
                color: ${selectedTheme.textColor} !important;
              }
              .ytmusic-player-bar .yt-spec-icon-shape, .ytmusic-player-bar svg {
                color: ${selectedTheme.colorIcons || selectedTheme.textColor} !important;
                fill: ${selectedTheme.colorIcons || selectedTheme.textColor} !important;
              }
              #progress-bar {
                --paper-slider-active-color: ${ytmSliderSolidColor} !important;
                --paper-slider-knob-color: ${ytmSliderSolidColor} !important;
                --paper-slider-secondary-color: ${ytmSliderSolidColor}80 !important;
              }
            `);
                        initYTMHeaderScroll();
                    }

                } else if (isDarkModeActive === 'dark' && isThemeCustom) {
                    $sp('--yt-spec-base-background', settings.bgColorPicker);
                    $sp('--yt-spec-text-primary', settings.primaryColorPicker);
                    $sp('--yt-spec-text-secondary', settings.secondaryColorPicker);
                    $sp('--yt-spec-menu-background', settings.menuColorPicker);
                    $sp('--yt-spec-icon-inactive', settings.iconsColorPicker);
                    $sp('--yt-spec-brand-icon-inactive', settings.primaryColorPicker);
                    $sp('--yt-spec-brand-icon-active', settings.primaryColorPicker);
                    $sp('--yt-spec-raised-background', settings.headerColorPicker);
                    $sp('--yt-spec-static-brand-red', settings.lineColorPicker);
                    $sp('--yt-spec-static-brand-white', settings.timeColorPicker);
                    $sp('--ytd-searchbox-background', settings.primaryColorPicker);
                    $sp('--ytd-searchbox-text-color', settings.secondaryColorPicker);
                    $sp('--ytcp-text-primary', settings.primaryColorPicker);

                    // YTM-specific CSS variables for custom theme
                    if (isYTMusic) {
                        applyYTMThemeVars(
                            settings.bgColorPicker,
                            settings.primaryColorPicker,
                            settings.secondaryColorPicker,
                            settings.menuColorPicker,
                            settings.iconsColorPicker,
                            settings.headerColorPicker,
                            settings.progressbarColorPicker,
                            settings.progressbarColorPicker + '80' // Add 50% opacity in hex
                        );

                        addDynamicCss(`
            #progress-bar {
              --paper-slider-active-color: ${settings.progressbarColorPicker} !important;
              --paper-slider-knob-color: ${settings.progressbarColorPicker} !important;
              --paper-slider-secondary-color: ${settings.progressbarColorPicker}80 !important;
            }
          `);
                    }

                    addDynamicCss(`
            .html5-video-player {
                color: ${settings.primaryColorPicker} !important;
              }
                .ytProgressBarLineProgressBarPlayed {
                background: linear-gradient(to right, ${settings.progressbarColorPicker} 80%, ${settings.progressbarColorPicker} 100%);

                }
              .ytp-menuitem .ytp-menuitem-icon svg path{
                fill: ${settings.iconsColorPicker} !important;
                }
                .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment {
                  background: linear-gradient(to right, ${settings.lineColorPicker} 80%, ${settings.lineColorPicker} 100%) !important;
                }
                .yt-badge-shape--thumbnail-default {
                  color: ${settings.timeColorPicker} !important;
                }
                a svg > path, .ytp-button svg path  {
                  fill: ${settings.iconsColorPicker} !important;
              }
                svg.path{
                 fill: ${settings.iconsColorPicker} !important;
                }

              svg {
                color: ${settings.iconsColorPicker} !important;
                }
              .ytp-volume-slider-handle:before, .ytp-volume-slider-handle, .ytp-tooltip.ytp-preview:not(.ytp-text-detail) {
                background-color: ${settings.iconsColorPicker} !important;
              }
                .ytp-autonav-toggle-button[aria-checked=true] {
                  background-color: ${settings.iconsColorPicker} !important;
                }
                  .tp-yt-iron-icon {
                   fill: ${settings.iconsColorPicker} !important;
                  }

             .botones_div {
            background-color: transparent;
            border: none;
            color: ${settings.iconsColorPicker} !important;
            user-select: none;
          }
              #container.ytd-searchbox {
              color: red !important;
              }
            .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox {
            background:  ${settings.primaryColorPicker} !important;
            }
            .yt-spec-icon-shape {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              color: ${settings.iconsColorPicker} !important;
          }
            .ytp-time-current, .ytp-time-separator, .ytp-time-duration {
              color: ${settings.iconsColorPicker} !important;
            }
            #background.ytd-masthead { background: ${settings.headerColorPicker}  !important; }
            .ytp-swatch-background-color {
            background: ${settings.progressbarColorPicker
                        } !important;
          }
        #shorts-container,
        ytd-shorts,
        #shorts-inner-container,
        #page-manager.ytd-app,
        #cinematic-container.ytd-reel-video-renderer,
        #shorts-cinematic-container,
        .short-video-container.ytd-reel-video-renderer,
        ytd-reel-video-renderer,
        ytd-reel-player-overlay,
        #overlay.ytd-reel-video-renderer {
            background: transparent !important;
        }
        #cinematic-container.ytd-reel-video-renderer,
        #shorts-cinematic-container,
        #cinematic-shorts-scrim.ytd-shorts {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
            ytd-engagement-panel-title-header-renderer[shorts-panel] #header.ytd-engagement-panel-title-header-renderer {
            background: ${settings.bgColorPicker}  !important;}

            .badge-shape-wiz--thumbnail-default {
            color: ${settings.timeColorPicker} !important;
             background: ${settings.secondaryColorPicker} !important;
            }
             #logo-icon {
             color:  ${settings.primaryColorPicker} !important;
          }
          .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text {
            color:  ${settings.iconsColorPicker} !important;
          }
          .ytd-topbar-menu-button-renderer #button.ytd-topbar-menu-button-renderer {
            color:  ${settings.iconsColorPicker} !important;
          }
          .yt-spec-icon-badge-shape--style-overlay .yt-spec-icon-badge-shape__icon {
            color:  ${settings.iconsColorPicker} !important;
          }
          .ytp-svg-fill {
            fill:  ${settings.iconsColorPicker} !important;
          }
          #ytp-id-30,#ytp-id-17,#ytp-id-19,#ytp-id-20{
            fill:  ${settings.iconsColorPicker} !important;
          }
            `);

                    // YTM-specific element selectors for custom theme
                    if (isYTMusic) {
                        addDynamicCss(`
              html, body, ytmusic-app {
                background-image: none !important;
                background-color: ${localStorage.getItem('backgroundImage') ? 'transparent' : settings.bgColorPicker} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
              ytmusic-player-bar {
                background: ${localStorage.getItem('backgroundImage') ? 'transparent' : (settings.headerColorPicker || settings.bgColorPicker)} !important;
                ${localStorage.getItem('backgroundImage') ? 'backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;' : ''}
              }
              ytmusic-nav-bar {
                background: transparent !important;
                transition: background 0.4s ease-in-out !important;
              }
              ytmusic-nav-bar.scrolled,
              ytmusic-nav-bar[opened],
              body[player-page-open] ytmusic-nav-bar {
                background: ${(settings.headerColorPicker || settings.bgColorPicker)} !important;
                ${localStorage.getItem('backgroundImage') ? 'backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;' : ''}
              }
              ytmusic-search-box #input-box { background: ${settings.menuColorPicker || settings.bgColorPicker} !important; }
              ytmusic-browse-response,
              ytmusic-header-renderer,
              ytmusic-tabbed-browse-renderer,
              ytmusic-detail-header-renderer,
              ytmusic-section-list-renderer,
              ytmusic-carousel-shelf-renderer,
              ytmusic-grid-renderer,
              ytmusic-item-section-renderer,
              #content.ytmusic-app,
              #shorts-container, ytd-shorts, #shorts-inner-container, ytd-reel-player-overlay, #overlay.ytd-reel-video-renderer,
              ytmusic-app-layout, ytmusic-app-layout.content-scrolled,
              #mini-guide-background, #guide-wrapper.ytmusic-app-layout,
              ytmusic-browse-response #background, ytmusic-browse-response .background,
              ytmusic-app-layout #background, ytmusic-app-layout #guide-background, ytmusic-app-layout #nav-bar-background, ytmusic-app-layout #player-bar-background,
              tp-yt-app-drawer, tp-yt-app-drawer #contentContainer,
              #mini-guide, #mini-guide-renderer,
              ytmusic-guide-renderer, #guide-wrapper, #guide-content, #guide-spacer,
              ytmusic-guide-section-renderer, ytmusic-guide-entry-renderer, tp-yt-paper-item.ytmusic-guide-entry-renderer,
              ytmusic-immersive-header-renderer, ytmusic-card-shelf-renderer, ytmusic-chip-cloud-chip-renderer, ytmusic-chip-cloud-renderer, ytmusic-player-page, ytmusic-player-page #background {
                background: transparent !important;
                --ytmusic-guide-background: transparent !important;
                --iron-drawer-background-color: transparent !important;
              }

              /* Neutralize default YTM gradients */
              ytmusic-browse-response #background,
              ytmusic-header-renderer #background,
              ytmusic-tabbed-browse-renderer #background,
              ytmusic-player-page #background,
              ytmusic-player-page .background,
              .background-gradient.ytmusic-browse-response,
              #background.style-scope.ytmusic-browse-response,
              #header.style-scope.ytmusic-browse-response,

              ytmusic-browse-response [id="background"],
              ytmusic-header-renderer [id="background"], #mini-guide-background, #guide-spacer, .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {
                background: transparent !important;
                background-image: none !important;
                }
              body:not(.ytm-ambient-active) #mini-guide-background,
              .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {
                opacity: 0 !important;
                pointer-events: none !important;
              }

              #layout { background: transparent !important; }
              .content.ytmusic-player-page { background: transparent !important; }

              ytmusic-player-bar .title, ytmusic-player-bar .byline {
                color: ${settings.primaryColorPicker} !important;
              }
              .ytmusic-player-bar .yt-spec-icon-shape, .ytmusic-player-bar svg {
                color: ${settings.iconsColorPicker} !important;
                fill: ${settings.iconsColorPicker} !important;
              }
            `);
                        initYTMHeaderScroll();
                    }
                } else {
                    addDynamicCss(`
            .botones_div {
             background-color: transparent;
             border: none;
             color: #000 !important;
             user-select: none;
           }
             `);
                }

            } else {
                if (localStorage.getItem('backgroundImage')) {
                    applyPageBackground(localStorage.getItem('backgroundImage'), null);
                } else {
                    applyPageBackground(null);
                }
                // Cleanup theme vars when toggled off to fix stuck colors on side-panel
                const props = [
                    '--ytmusic-general-background', '--ytmusic-background', '--ytmusic-color-white1', '--ytmusic-color-white2',
                    '--ytmusic-color-white3', '--ytmusic-color-white4', '--ytmusic-player-bar-background',
                    '--ytmusic-search-background', '--yt-spec-general-background-a', '--yt-spec-general-background-b', '--yt-spec-general-background-c',
                    '--yt-spec-base-background', '--yt-spec-text-primary', '--yt-spec-text-secondary', '--yt-spec-menu-background',
                    '--yt-spec-icon-inactive', '--yt-spec-brand-icon-inactive', '--yt-spec-brand-icon-active', '--yt-spec-static-brand-red',
                    '--yt-spec-raised-background', '--yt-spec-static-brand-white', '--ytd-searchbox-background', '--ytd-searchbox-text-color',
                    '--ytcp-text-primary', '--ytmusic-nav-bar', '--ytmusic-nav-bar-background', '--paper-slider-active-color',
                    '--paper-slider-knob-color', '--paper-progress-active-color', '--paper-slider-secondary-color', '--paper-progress-secondary-color'
                ];
                props.forEach(p => document.documentElement.style.removeProperty(p));

                // Restore YTM native defaults instead of leaving vars undefined
                if (isYTMusic) {
                    const hasBgImage = !!localStorage.getItem('backgroundImage');
                    if (hasBgImage) {
                        // When bgImage is active, force transparent vars so YTM CSS doesn't override our blur
                        document.documentElement.style.setProperty('--ytmusic-nav-bar-background', 'transparent');
                        document.documentElement.style.setProperty('--ytmusic-player-bar-background', 'transparent');
                    } else {
                        // No bgImage → restore YTM native defaults completely
                        document.documentElement.style.removeProperty('--ytmusic-nav-bar-background');
                        document.documentElement.style.removeProperty('--ytmusic-player-bar-background');
                        document.documentElement.style.removeProperty('--ytmusic-nav-bar');
                    }
                    // Cleanup carousel/container backgrounds that were made transparent by theme
                    // But DON'T reset nav-bar/player-bar when backgroundImage is active (applyPageBackground handles those)
                    addDynamicCss(`
          ytmusic-carousel-shelf-renderer,
          ytmusic-section-list-renderer,
          ytmusic-grid-renderer,
          ytmusic-card-shelf-renderer,
          ytmusic-chip-cloud-renderer,
          ytmusic-chip-cloud-chip-renderer,
          ytmusic-header-renderer,
          ytmusic-tabbed-browse-renderer,
          ytmusic-detail-header-renderer,
          ytmusic-item-section-renderer,
          ytmusic-immersive-header-renderer {
            background: ${hasBgImage ? 'transparent' : 'initial'} !important;
          }
          .immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] {
            display: initial !important;
          }
          ${hasBgImage ? `
          /* Theme OFF + bgImage: nav-bar/player-bar need blur background */
          #nav-bar-background.ytmusic-app-layout {
            background: transparent !important;
            transition: background 0.3s ease, backdrop-filter 0.3s ease !important;
          }
          /* High specificity transparency for YTM Guide/Sidebar */
          tp-yt-app-drawer,
          tp-yt-app-drawer #contentContainer,
          tp-yt-app-drawer #contentContainer.tp-yt-app-drawer,
          #guide-wrapper.ytmusic-app,
          #guide-content.ytmusic-app,
          #guide-spacer.ytmusic-app,
          #guide-renderer.ytmusic-app,
          ytmusic-guide-renderer,
          #sections.ytmusic-guide-renderer,
          ytmusic-guide-section-renderer,
          #items.ytmusic-guide-section-renderer,
          #divider.ytmusic-guide-section-renderer,
          ytmusic-app-layout.content-scrolled,
          ytmusic-app-layout #background,
          ytmusic-app-layout #guide-background,
          ytmusic-app-layout #player-bar-background,
          ytmusic-app-layout #nav-bar-background:not(.scrolled) {
            background: transparent !important;
            background-color: transparent !important;
            --ytmusic-guide-background: transparent !important;
            --iron-drawer-background-color: transparent !important;
          }
          ytmusic-nav-bar, #nav-bar-divider {
            background: transparent !important;
            border: none !important;
          }
          /* High specificity rules for scrolled state - targeting both to ensure coverage */
          ytmusic-nav-bar.scrolled,
          #nav-bar-background.scrolled,
          ytmusic-nav-bar[opened],
          body[player-page-open] ytmusic-nav-bar,
          body[player-page-open] #nav-bar-background {
            background: rgba(10, 10, 10, 0.4) !important;
            backdrop-filter: blur(25px) !important;
            -webkit-backdrop-filter: blur(25px) !important;
          }
          ytmusic-player-bar {
            background: rgba(0, 0, 0, 0.2) !important;
            backdrop-filter: blur(30px) !important;
            -webkit-backdrop-filter: blur(30px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          /* Standardized YTM Glass Buttons (Edit, Menu, Play, etc.) */
          button.ytSpecButtonShapeNextHost,
          yt-button-shape button,
          yt-icon-button#guide-button #button,
          .history-button #button {
            background: rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #fff !important;
          }
          /* Play button specific fixes */
          ytmusic-play-button-renderer {
            background: transparent !important;
            --ytmusic-play-button-background-color: transparent !important;
            --ytmusic-play-button-active-background-color: rgba(255, 255, 255, 0.25) !important;
          }
          ytmusic-play-button-renderer .content-wrapper {
            background: rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border-radius: 50% !important;
          }
          ytmusic-play-button-renderer yt-icon,
          ytmusic-play-button-renderer #icon,
          ytmusic-play-button-renderer .icon {
            background: transparent !important;
            background-color: transparent !important;
            color: #fff !important;
            --ytmusic-play-button-icon-color: #fff !important;
          }
          /* Ensure SVGs inside are visible */
          ytmusic-play-button-renderer svg {
            fill: #fff !important;
          }
          ` : ''}
        `);
                } else {
                    // Remove nav-bar var only on YT (not relevant there anyway)
                    document.documentElement.style.removeProperty('--ytmusic-nav-bar-background');
                }

                addDynamicCss(`
          .botones_div {
           background-color: transparent;
           border: none;
           color: #ccc !important;
           user-select: none;
         }
           `);
            }

        }


        // Reverse mode and sidebar CSS (YT only selectors)
        if (!isYTMusic) {
            addDynamicCss(`
        #columns.style-scope.ytd-watch-flexy {
          flex-direction: ${settings.reverseMode ? 'row-reverse' : 'row'} !important;
          padding-left: ${settings.reverseMode ? '20px' : '0'} !important;
          }
          #secondary.style-scope.ytd-watch-flexy {display: ${settings.hideSidebar ? 'none' : 'block'} !important;}
        `);
        }
        addDynamicCss(`
        #icon-menu-settings {
         color: ${settings.iconsColorPicker} !important;
        }
      `);

        checkDarkMode();
        // Apply dynamic CSS once per settings update
        setDynamicCss(dynamicCssArray.join('\n')); // Gộp tất cả CSS trong mảng và tiêm vào trang

        // Apply new features (safe, no heavy loops)
        applyBookmarksIfEnabled(settings);
        setupContinueWatchingFeature(settings.continueWatching);
        if (!isYTMusic) {
            scheduleLikeBarUpdate(settings, 5);
            setupShortsChannelNameFeature(settings.shortsChannelName);
            setupLockupCachedStats();
        }
        checkForVideo();
        downloadDescriptionVideo();
        traductor();

        function checkForVideo() {
            if (!settings.waveVisualizer) {
                cleanup(true); // Limpieza completa
                return;
            }
            const video = $e('video');
            const miniPlayer = $e('.ytp-miniplayer-ui');
            if ((video && document.location.href.includes('watch')) || miniPlayer) {

                // Solo si el video cambió o no está configurado
                if (video !== currentVideo || !isSetup) {
                    cleanup(true); // Limpieza completa antes de crear uno nuevo
                    setupAudioAnalyzer(video);
                } else if (controlPanel && video.paused === false) {
                    showCanvas();
                }
            }
        }



        function downloadDescriptionVideo() {
            if (isYTMusic) return; // YTM has no description row
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



        // Biến cờ phải nằm ngoài hàm để không bị reset
        let translatorEventBound = false;

        function traductor() {
            // Chỉ quét những comment chưa có nút dịch (dùng thuộc tính data-translated)
            const texts = document.querySelectorAll('#content-text:not([data-translated])');
            if (texts.length === 0) return;

            const languages = languagesTranslate;
            const idiomaDestino = $id('select-languages-comments-select').value;

            // Tạo sẵn HTML cho dropdown ngôn ngữ để dùng chung
            const optionsHTML = Object.entries(languages)
                .map(([code, name]) => `<option value="${code}" ${code === idiomaDestino ? 'selected' : ''}>${name}</option>`)
                .join('');

            // Gắn nút dịch vào các comment mới
            texts.forEach((texto) => {
                texto.setAttribute('data-translated', 'true'); // Đánh dấu là đã gắn nút
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

            // Áp dụng Event Delegation: Chỉ gắn sự kiện click 1 lần duy nhất lên document
            if (!translatorEventBound) {
                translatorEventBound = true;

                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('.buttons-tranlate[data-action="translate-comment"]');
                    if (!btn) return;

                    const container = btn.closest('.traductor-container');
                    const selectLang = container.querySelector('.select-traductor');
                    const textNode = container.previousElementSibling; // Thẻ #content-text

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


        function limpiarHTML(selector) {
            $m(selector).forEach((button) => button.remove());
        }

        // === CODE TỐI ƯU MỚI THAY THẾ CHO SCROLL EVENT === (YT only)
        if (!isYTMusic) {
            let _commentIO = null;
            let _commentMO = null;
            function initSmartCommentObserver() {
                const commentsContainer = document.querySelector('#comments');
                if (!commentsContainer) return;

                // Disconnect previous observers to avoid duplicates
                if (_commentIO) { try { _commentIO.disconnect(); } catch (e) { } _commentIO = null; }
                if (_commentMO) { try { _commentMO.disconnect(); } catch (e) { } _commentMO = null; }

                _commentIO = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {

                        _commentMO = new MutationObserver((mutations) => {
                            let shouldUpdate = false;
                            for (let m of mutations) {
                                if (m.addedNodes.length > 0) {
                                    shouldUpdate = true;
                                    break;
                                }
                            }

                            if (shouldUpdate) {
                                window.requestAnimationFrame(() => {
                                    if (settings.avatars) agregarBotonesDescarga();
                                    if (settings.translation) traductor();
                                });
                            }
                        });

                        const commentContents = document.querySelector('ytd-comments #contents');
                        if (commentContents) {
                            _commentMO.observe(commentContents, {
                                childList: true,
                                subtree: true
                            });
                        }

                        _commentIO.disconnect();
                    }
                });

                _commentIO.observe(commentsContainer);
            }

            if (!window.__ytToolsCommentNavBound) {
                window.__ytToolsCommentNavBound = true;
                document.addEventListener('yt-navigate-finish', () => {
                    setTimeout(initSmartCommentObserver, 1500);
                });
            }

            initSmartCommentObserver();
        } // end if (!isYTMusic)
        // === KẾT THÚC CODE TỐI ƯU ===


        // Shorts DOM observer (YT only) – guarded via __ytToolsRuntime.shortsObserver
        if (!isYTMusic) {
            const contentScrollable = $e('.anchored-panel.style-scope.ytd-shorts #contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer');
            if (contentScrollable) {
                // Disconnect previous Shorts observer if it exists
                if (__ytToolsRuntime.shortsObserver) {
                    try { __ytToolsRuntime.shortsObserver.disconnect(); } catch (e) { }
                    __ytToolsRuntime.shortsObserver = null;
                }
                let domTimeout;
                __ytToolsRuntime.shortsObserver = new MutationObserver(() => {
                    if (domTimeout) clearTimeout(domTimeout);
                    domTimeout = setTimeout(() => {
                        insertButtons();
                        addIcon();
                    }, 300);
                });

                __ytToolsRuntime.shortsObserver.observe(contentScrollable, { childList: true, subtree: true });
            }
        } // end if (!isYTMusic) shorts observer

        function agregarBotonesDescarga() {
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
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); // Đợi 1s cho trình duyệt bắt đầu tải
                    } catch (error) {
                        console.error('Error al descargar la imagen:', error);
                    }
                };

                img.parentElement.style.position = 'relative';
                img.parentElement.appendChild(button);
            });
        }

        const redirectToClassic = () => {
            const videoId = window.location.pathname.split('/').pop();
            const classicUrl = `https://www.youtube.com/watch?v=${videoId}`;
            window.open(classicUrl, '_blank');
            $e('video.video-stream.html5-main-video').pause();
        };

        // Update the Shorts "views" button label (same bar as Classic). Call with viewCount from API/cache.
        function updateShortsViewsButton(videoId, viewCount) {
            const bar = $e('reel-action-bar-view-model');
            if (!bar) return;
            const viewsWrap = bar.querySelector('[data-yt-tools-shorts-views]');
            if (!viewsWrap) return;
            const labelSpan = viewsWrap.querySelector('.yt-spec-button-shape-with-label__label span, [role="text"]');
            if (!labelSpan) return;
            labelSpan.textContent = Number.isFinite(viewCount) && viewCount >= 0 ? FormatterNumber(viewCount, 0) : '—';
        }

        // Update the Shorts "rating" button label (rating 0–5 from API/cache, shown as e.g. "4.9").
        function updateShortsRatingButton(videoId, rating) {
            const bar = $e('reel-action-bar-view-model');
            if (!bar) return;
            const ratingWrap = bar.querySelector('[data-yt-tools-shorts-rating]');
            if (!ratingWrap) return;
            const labelSpan = ratingWrap.querySelector('.yt-spec-button-shape-with-label__label span, [role="text"]');
            if (!labelSpan) return;
            labelSpan.textContent = (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating.toFixed(1) : '—';
        }

        // Build one YT-style button for the reel action bar using pure DOM API (Trusted Types safe).
        function createReelBarButton(opts) {
            const wrap = document.createElement('div');
            wrap.className = 'button-view-model ytSpecButtonViewModelHost';
            if (opts.dataAttr) wrap.setAttribute(opts.dataAttr, '1');

            const label = document.createElement('label');
            label.className = 'yt-spec-button-shape-with-label ytSpecButtonShapeWithLabelHost';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeL ytSpecButtonShapeNextIconButton';
            button.title = opts.title || '';
            button.setAttribute('aria-label', opts.ariaLabel || '');

            const iconDiv = document.createElement('div');
            iconDiv.className = 'yt-spec-button-shape-next__icon';
            iconDiv.setAttribute('aria-hidden', 'true');

            const iconSpan = document.createElement('span');
            iconSpan.className = 'yt-icon-shape ytSpecIconShapeHost';
            // Use safeHTML + temp div to parse SVG (works with Trusted Types)
            if (opts.iconSvg) {
                try {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = safeHTML(opts.iconSvg);
                    while (tempDiv.firstChild) {
                        iconSpan.appendChild(tempDiv.firstChild);
                    }
                } catch (e) {
                    console.warn('[YT Tools] SVG parse error:', e);
                }
            }
            iconDiv.appendChild(iconSpan);
            button.appendChild(iconDiv);

            const labelDiv = document.createElement('div');
            labelDiv.className = 'yt-spec-button-shape-with-label__label';
            labelDiv.setAttribute('aria-hidden', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--text-alignment-center yt-core-attributed-string--word-wrapping';
            labelSpan.setAttribute('role', 'text');
            labelSpan.textContent = opts.labelText || '';

            labelDiv.appendChild(labelSpan);
            label.appendChild(button);
            label.appendChild(labelDiv);
            wrap.appendChild(label);

            if (opts.onclick) button.addEventListener('click', opts.onclick);
            return wrap;
        }

        const eyeIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>';
        const classicIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-tv"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" /><path d="M16 3l-4 4l-4 -4" /></svg>';
        const starIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

        function insertReelBarButtons() {
            const isShortsPage = document.location.pathname.startsWith('/shorts');
            const bar = $e('reel-action-bar-view-model');
            if (!isShortsPage || !bar) {
                document.querySelectorAll('[data-yt-tools-shorts-classic], [data-yt-tools-shorts-views], [data-yt-tools-shorts-rating]').forEach(el => el.remove());
                return;
            }
            if (bar.querySelector('[data-yt-tools-shorts-classic]')) return;

            const classicBtn = createReelBarButton({
                dataAttr: 'data-yt-tools-shorts-classic',
                title: 'Classic mode',
                ariaLabel: 'Chế độ cổ điển',
                iconSvg: classicIconSvg,
                labelText: '',
                onclick: redirectToClassic,
            });
            const viewsBtn = createReelBarButton({
                dataAttr: 'data-yt-tools-shorts-views',
                title: 'Vistas',
                ariaLabel: 'Vistas',
                iconSvg: eyeIconSvg,
                labelText: '—',
                onclick: function () { },
            });
            const ratingBtn = createReelBarButton({
                dataAttr: 'data-yt-tools-shorts-rating',
                title: 'Rating (likes/dislikes)',
                ariaLabel: 'Rating',
                iconSvg: starIconSvg,
                labelText: '—',
                onclick: function () { },
            });

            bar.insertBefore(ratingBtn, bar.firstChild);
            bar.insertBefore(viewsBtn, bar.firstChild);
            bar.insertBefore(classicBtn, bar.firstChild);

            const videoId = (document.location.pathname.split('/').filter(Boolean))[1];
            if (videoId) {
                const persisted = getLikesDislikesFromPersistedCache(videoId);
                if (persisted && persisted.viewCount != null) updateShortsViewsButton(videoId, persisted.viewCount);
                if (persisted && persisted.rating != null) updateShortsRatingButton(videoId, persisted.rating);
            }
            __ytToolsRuntime.updateShortsViewsButton = updateShortsViewsButton;
            __ytToolsRuntime.updateShortsRatingButton = updateShortsRatingButton;
        }

        const insertButtons = () => {
            insertReelBarButtons();
        };

        const targetNode = $e('body');

        if (targetNode != undefined && !isYTMusic) {
            const element = $e('ytd-item-section-renderer[static-comments-header] #contents');
            if (element != undefined && settings.theme !== 'custom') {
                const observerElementDom = (elem) => {
                    const observer = new IntersectionObserver(entries => {

                        if (entries[0].isIntersecting) {

                            element.style.background = `${selectedTheme.gradient ?? ''}`;
                        } else {
                            return
                        }
                    })

                    return observer.observe($e(`${elem}`))

                }
                observerElementDom('ytd-item-section-renderer[static-comments-header] #contents')
            }
        }

        // Stats

        function formatTime(seconds) {
            if (isNaN(seconds)) return '0h 0m 0s';
            seconds = Math.floor(seconds);
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${h}h ${m}m ${s}s`;
        }

        function updateUI() {
            $id('total-time').textContent = formatTime(usageTime);
            $id('video-time').textContent = formatTime(videoTime);
            $id('shorts-time').textContent = formatTime(shortsTime);

            const maxTime = 86400; // 24 hours
            $id('usage-bar').style.width =
                `${(usageTime / maxTime) * 100}%`;
            $id('video-bar').style.width =
                `${(videoTime / maxTime) * 100}%`;
            $id('shorts-bar').style.width =
                `${(shortsTime / maxTime) * 100}%`;
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


            if (videoElement.closest('ytd-watch-flexy') ||
                videoElement.closest('#primary-inner')) {
                return 'video';
            }
            if (videoElement.closest('ytd-thumbnail') ||
                videoElement.closest('ytd-rich-item-renderer')) {
                return 'video';
            }

            return null;
        }

        function findActiveVideo() {
            const videos = $m('video');
            for (const video of videos) {
                if (!video.paused && !video.ended && video.readyState > 2) {
                    return video;
                }
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
                        // Reconnect source directly to destination to keep audio playing
                        // (createMediaElementSource routes ALL audio through Web Audio API)
                        if (audioCtx && audioCtx.state !== 'closed') {
                            source.connect(audioCtx.destination);
                        }
                    } catch (err) { }
                    // Don't null source — cached on video.__ytToolsAudioSource for reuse
                }
                // Keep audioCtx running — source is connected to destination for audio passthrough
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


        function createControlPanelWave() {
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



        // setting Audio y Analyser
        function setupAudioAnalyzer(video) {
            if (!video || video[PROCESSED_FLAG]) return;
            video[PROCESSED_FLAG] = true;
            cleanup(false);
            currentVideo = video;
            createCanvasOverlay();
            createControlPanelWave();

            // Reuse existing AudioContext if possible (suspend/resume pattern)
            if (!audioCtx || audioCtx.state === 'closed') {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
            } else if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.85;
            bufferLength = analyser.fftSize;
            dataArray = new Uint8Array(bufferLength);
            smoothedData = new Array(bufferLength).fill(128);

            try {
                // Reuse cached source if video already has one (createMediaElementSource is one-shot per element)
                if (video.__ytToolsAudioSource) {
                    source = video.__ytToolsAudioSource;
                    try { source.disconnect(); } catch (e) { }
                } else {
                    source = audioCtx.createMediaElementSource(video);
                    video.__ytToolsAudioSource = source;
                }
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
            } catch (e) {
                Notify('error', "MediaElementSource or error:", e);
                cleanup(true);
                return;
            }

            video.removeEventListener('play', showCanvas);
            video.removeEventListener('pause', hideCanvas);
            video.removeEventListener('ended', hideCanvas);

            video.addEventListener('play', showCanvas);
            video.addEventListener('pause', hideCanvas);
            video.addEventListener('ended', hideCanvas);

            window.removeEventListener('resize', updateCanvasSize);
            window.addEventListener('resize', updateCanvasSize);

            draw();
            isSetup = true;
        }

        function draw() {
            animationId = requestAnimationFrame(draw);

            if (parseFloat(canvas.style.opacity) <= 0) return;

            analyser.getByteTimeDomainData(dataArray);
            for (let i = 0; i < bufferLength; i++) {
                smoothedData[i] += smoothingFactor * (dataArray[i] - smoothedData[i]);
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let sliceWidth = canvas.width / bufferLength;

            switch (waveStyle) {

                case 'linea': {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'lime';
                    ctx.beginPath();
                    let x = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        if (i === 0) ctx.moveTo(x, amplitude);
                        else ctx.lineTo(x, amplitude);
                        x += sliceWidth;
                    }
                    ctx.stroke();
                    break;
                }
                case 'barras': {
                    let x = 0;
                    for (let i = 0; i < bufferLength; i += 5) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        ctx.fillStyle = 'cyan';
                        ctx.fillRect(x, 0, sliceWidth * 4, amplitude);
                        x += sliceWidth * 5;
                    }
                    break;
                }
                case 'curva': {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'yellow';
                    ctx.beginPath();
                    ctx.moveTo(0, Math.max(0, smoothedData[0] - 128) * scale);
                    for (let i = 0; i < bufferLength - 1; i++) {
                        let x0 = i * sliceWidth;
                        let x1 = (i + 1) * sliceWidth;
                        let y0 = Math.max(0, smoothedData[i] - 128) * scale;
                        let y1 = Math.max(0, smoothedData[i + 1] - 128) * scale;
                        let cp1x = x0 + sliceWidth / 3;
                        let cp1y = y0;
                        let cp2x = x1 - sliceWidth / 3;
                        let cp2y = y1;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
                    }
                    ctx.stroke();
                    break;
                }
                case 'picos': {
                    ctx.fillStyle = 'magenta';
                    let x = 0;
                    for (let i = 0; i < bufferLength; i += 5) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        ctx.beginPath();
                        ctx.arc(x, amplitude, 2, 0, Math.PI * 2);
                        ctx.fill();
                        x += sliceWidth * 5;
                    }
                    break;
                }
                case 'solida': {
                    ctx.beginPath();
                    let x = 0;
                    ctx.moveTo(0, 0);
                    for (let i = 0; i < bufferLength; i++) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        ctx.lineTo(x, amplitude);
                        x += sliceWidth;
                    }
                    ctx.lineTo(canvas.width, 0);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(0,255,0,0.3)';
                    ctx.fill();
                    break;
                }
                case 'dinamica': {
                    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, 'red');
                    gradient.addColorStop(0.5, 'purple');
                    gradient.addColorStop(1, 'blue');
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = gradient;
                    ctx.beginPath();
                    let x = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        if (i === 0) ctx.moveTo(x, amplitude);
                        else ctx.lineTo(x, amplitude);
                        x += sliceWidth;
                    }
                    ctx.stroke();
                    break;
                }
                case 'montana': {
                    ctx.beginPath();
                    let x = 0;
                    ctx.moveTo(0, 0);
                    for (let i = 0; i < bufferLength; i++) {
                        let amp = (smoothedData[i] - 128) * scale * 0.8;
                        ctx.lineTo(x, amp);
                        x += sliceWidth;
                    }
                    ctx.lineTo(canvas.width, 0);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(128,128,255,0.4)';
                    ctx.fill();
                    break;
                }

                default:
                    break;
            }
        }

        // Sử dụng các API sự kiện có sẵn của YouTube để tránh dùng MutationObserver
        // (chỉ gắn 1 lần, tránh leak khi applySettings chạy lại)
        if (!window.__ytToolsPageDataBound && !isYTMusic) {
            window.__ytToolsPageDataBound = true;
            document.addEventListener('yt-page-data-updated', () => {
                requestAnimationFrame(() => {
                    if (window.location.pathname.startsWith('/shorts')) {
                        insertButtons();
                    }
                    addIcon();
                });
            });
        }

        // Cập nhật thống kê thời gian xem định kỳ mà không cần MutationObserver
        // GM_setValue chỉ gọi mỗi 30 giây để giảm I/O, UI vẫn cập nhật mỗi 1 giây
        if (!__ytToolsRuntime.statsIntervalId) {
            let __lastStatsSave = 0;
            __ytToolsRuntime.statsIntervalId = setInterval(() => {
                const now = Date.now();
                const delta = (now - lastUpdate) / 1000;

                const isVisible = document.visibilityState === 'visible';
                if (isVisible) {
                    usageTime += delta;
                }

                // Only do DOM query when tab is visible
                if (isVisible) {
                    const activeVideoEl = document.querySelector('video.video-stream');
                    if (activeVideoEl && !activeVideoEl.paused && !activeVideoEl.ended) {
                        const type = window.location.pathname.startsWith('/shorts') ? 'shorts' : 'video';
                        if (type === 'video') videoTime += delta;
                        else shortsTime += delta;
                    }
                }

                lastUpdate = now;
                // Chỉ lưu vào GM storage mỗi 30 giây để giảm I/O
                if (now - __lastStatsSave >= 30000) {
                    __lastStatsSave = now;
                    GM_setValue(STORAGE.USAGE, usageTime);
                    GM_setValue(STORAGE.VIDEO, videoTime);
                    GM_setValue(STORAGE.SHORTS, shortsTime);
                }
                if (isVisible && $id('stats')?.classList?.contains('active')) updateUI();
            }, 2000); // Reduced from 1s to 2s — UI still feels responsive
            // Lưu ngay khi user rời trang
            window.addEventListener('pagehide', () => {
                GM_setValue(STORAGE.USAGE, usageTime);
                GM_setValue(STORAGE.VIDEO, videoTime);
                GM_setValue(STORAGE.SHORTS, shortsTime);
            }, { capture: true });
        }

        // Chạy lần đầu tiên cho Shorts nếu đang ở trang Shorts
        if (!isYTMusic && window.location.pathname.startsWith('/shorts')) {
            insertButtons();
        }
        // --- KẾT THÚC GLOBAL OBSERVER ---

        checkForVideo(); // retry: video element may not exist at first call (line ~5228)

        // [REMOVED] Duplicate stats interval was here — already handled above (line ~5924).



        updateUI();

        // end stats
        if (__ytToolsRuntime.settingsLoaded) {
            saveSettings();
        }

    }


    // Build YTM toolbar using pure DOM API (bypasses Trusted Types)

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


    console.log('Script en ejecución by: Akari');
    const HEADER_STYLE = 'color: #F00; font-size: 24px; font-family: sans-serif;';
    const MESSAGE_STYLE = 'color: #00aaff; font-size: 16px; font-family: sans-serif;';
    const CODE_STYLE = 'font-size: 14px; font-family: monospace;';

    console.log(
        `%cYoutube Ultimate Tools (v${GM_info.script.version})\n` +
        '%cDeveloped by Akari\n' +
        '%c(Based on MDCM & nvbangg)',
        HEADER_STYLE,
        CODE_STYLE,
        MESSAGE_STYLE
    );

    const currentVersion = GM_info.script.version;
    if (!localStorage.getItem('notification-Akari-' + currentVersion)) {
        Notify('info', 'Youtube Ultimate Tools by: Akari (v' + currentVersion + ')');
        localStorage.setItem('notification-Akari-' + currentVersion, true);
    }



    // Add event listeners to all inputs
    const inputs = panel.querySelectorAll('input');
    inputs.forEach((input) => {
        input.addEventListener('change', () => {
            try {
                saveSettings();
            } catch (e) {
                console.error('saveSettings error:', e);
            }
            scheduleApplySettings();
        });
        if (input.type === 'range') {
            input.addEventListener('input', () => {
                updateSliderValues();
            });
        }
    });

    // Some settings are controlled by <select> elements; ensure they persist and apply without duplicating listeners.
    function bindSelectOnce(id) {
        const el = $id(id);
        if (!el) return;
        if (el.dataset.ytToolsBound === '1') return;
        el.dataset.ytToolsBound = '1';
        el.addEventListener('change', () => {
            // Persist immediately
            try {
                saveSettings();
            } catch (e) {
                console.error('saveSettings error:', e);
            }
            // Apply with debounce
            scheduleApplySettings();
        });
    }

    bindSelectOnce('select-video-qualitys-select');
    bindSelectOnce('select-languages-comments-select');
    bindSelectOnce('select-wave-visualizer-select');

    // Export configuration

    //   Settings saved
    //   const settings = GM_getValue(SETTINGS_KEY, '{}');
    //   $id('config-data').value = settings;

    $id('export-config').addEventListener('click', () => {
        const settings = GM_getValue(SETTINGS_KEY, '{}');
        $id('config-data').value = settings;
        const configData = settings;
        try {
            JSON.parse(configData); // Validate JSON
            GM_setValue(SETTINGS_KEY, configData);
            setTimeout(() => {
                Notify('success', 'Configuration export successfully!');
            }, 1000);
        } catch (e) {
            Notify('error', 'Invalid configuration data. Please check and try again.');
        }
    });
    // Import configuration
    $id('import-config').addEventListener('click', () => {
        const configData = $id('config-data').value;
        try {
            JSON.parse(configData); // Validate JSON
            GM_setValue(SETTINGS_KEY, configData);
            setTimeout(() => {
                Notify('success', 'Configuration imported successfully!');
                window.location.reload();
            }, 1000);
            // window.location.reload(); // removed: duplicate (setTimeout above already reloads)
        } catch (e) {
            Notify('error', 'Invalid configuration data. Please check and try again.');
        }
    });
    panel.style.display = 'none';

    // var for wave

    // Load saved settings
    // Visible element DOM
    function checkElement(selector, callback, maxAttempts = 100) {
        let attempts = 0;
        const interval = setInterval(() => {
            if ($e(selector)) {
                clearInterval(interval);
                callback();
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.warn(`[Youtube Tools] Không tìm thấy element: ${selector}`);
                }
            }
        }, 100);
    }

    const checkActiveWave = $id('wave-visualizer-toggle');
    if (checkActiveWave) {
        checkActiveWave.addEventListener('change', () => {
            const waveVisualizer = $e('#wave-visualizer-toggle');
            if (waveVisualizer.checked) {
                Notify('success', 'Wave visualizer enabled');
                saveSettings();
                scheduleApplySettings();
            } else {
                // Soft cleanup: hide canvas + stop animation, but keep AudioContext alive
                // (createMediaElementSource can only bind once per video element)
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                hideCanvas();
                saveSettings();
                Notify('success', 'Wave visualizer disabled');
            }
        });
    }

    const checkAudioOnlyTabToggle = $id('audio-only-tab-toggle');
    if (checkAudioOnlyTabToggle) {
        checkAudioOnlyTabToggle.addEventListener('change', () => {
            const defaultEnabled = $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false;
            setAudioOnlyTabOverride(checkAudioOnlyTabToggle.checked, defaultEnabled);
            const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
            syncAudioOnlyTabCheckbox({
                ...settings,
                audioOnly: defaultEnabled
            });
            Notify('success', checkAudioOnlyTabToggle.checked ? 'Audio-only enabled for this tab' : 'Audio-only disabled for this tab');
            scheduleApplySettings();
        });
    }

    const checkAudioOnlyToggle = $id('audio-only-toggle');
    if (checkAudioOnlyToggle) {
        checkAudioOnlyToggle.addEventListener('change', () => {
            const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
            syncAudioOnlyTabCheckbox({
                ...settings,
                audioOnly: checkAudioOnlyToggle.checked
            });
            Notify('success', checkAudioOnlyToggle.checked ? 'Audio-only mode enabled' : 'Audio-only mode disabled');
        });
    }

    const checkNonstopPlaybackToggle = $id('nonstop-playback-toggle');
    if (checkNonstopPlaybackToggle) {
        checkNonstopPlaybackToggle.addEventListener('change', () => {
            Notify('success', checkNonstopPlaybackToggle.checked ? 'Nonstop playback enabled' : 'Nonstop playback disabled');
        });
    }

    // Themes toggle event listener (auto-disable ambient in YTM if themes are turned on)
    const checkThemesToggle = $id('themes-toggle');
    if (checkThemesToggle) {
        checkThemesToggle.addEventListener('change', () => {
            if (isYTMusic && checkThemesToggle.checked) {
                const cinematicToggle = $id('cinematic-lighting-toggle');
                if (cinematicToggle && cinematicToggle.checked) {
                    cinematicToggle.checked = false;
                    try { saveSettings(); } catch (e) { }
                    scheduleApplySettings();
                }
            }
        });
    }

    // Cinematic/Ambient lighting toggle event listener
    const checkCinematicLighting = $id('cinematic-lighting-toggle');
    if (checkCinematicLighting) {
        checkCinematicLighting.addEventListener('change', () => {
            const cinematicToggle = $e('#cinematic-lighting-toggle');
            const syncToggle = $e('#sync-cinematic-toggle');
            const cinematicDiv = $id('cinematics');

            if (cinematicToggle.checked) {
                Notify('success', isYTMusic ? 'Ambient mode enabled' : 'Cinematic mode enabled');
            } else {
                Notify('success', isYTMusic ? 'Ambient mode disabled' : 'Cinematic mode disabled');
            }

            if (isYTMusic) {
                // YTM: use custom ambient mode
                if (cinematicToggle.checked) {
                    // Auto-disable theme when ambient is ON (they conflict)
                    const themesToggle = $id('themes-toggle');
                    if (themesToggle && themesToggle.checked) {
                        themesToggle.checked = false;
                        try { saveSettings(); } catch (e) { }
                        scheduleApplySettings();
                    }
                    ytmAmbientMode.show();
                } else {
                    ytmAmbientMode.destroy();
                }
            } else {
                // YT: use cinematic lighting
                if (syncToggle.checked) {
                    setTimeout(() => {
                        toggleCinematicLighting();
                    }, 300);
                } else {
                    if (cinematicDiv) {
                        cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
                    }
                }
            }
        });
    }

    // Sync cinematic toggle event listener
    const checkSyncCinematic = $id('sync-cinematic-toggle');
    if (checkSyncCinematic) {
        checkSyncCinematic.addEventListener('change', () => {
            const syncToggle = $e('#sync-cinematic-toggle');
            const cinematicToggle = $e('#cinematic-lighting-toggle');
            const cinematicDiv = $id('cinematics');

            if (syncToggle.checked) {
                Notify('success', 'Sync with YouTube enabled');
                // Si se activa la sincronización y el modo cinematic está activado, sincronizar con YouTube
                if (cinematicToggle.checked) {
                    setTimeout(() => {
                        toggleCinematicLighting();
                    }, 500);
                }
            } else {
                Notify('success', 'Sync with YouTube disabled');
                // Si se desactiva la sincronización, aplicar inmediatamente el estado del toggle
                if (cinematicDiv) {
                    cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
                }
            }
        });
    }

    // Side Panel Style listener
    const checkSidePanelStyle = $id('side-panel-style-select');
    if (checkSidePanelStyle) {
        checkSidePanelStyle.addEventListener('change', () => {
            saveSettings();
            scheduleApplySettings();
        });
    }

    // Custom Timeline Color listener
    const checkCustomTimeline = $id('custom-timeline-color-toggle');
    if (checkCustomTimeline) {
        checkCustomTimeline.addEventListener('change', () => {
            saveSettings();
            scheduleApplySettings();
        });
    }

    // Use the correct selector depending on YouTube vs YouTube Music
    const topBarSelector = isYTMusic ? '#right-content' : 'ytd-topbar-menu-button-renderer';
    checkElement(topBarSelector, () => {
        addIcon(); // ensure gear icon is created now that topbar exists
        loadSettings();
        initializeHeaderButtons();
        setTimeout(checkNewVersion, 3000);
    });
    // validate change url SPA youtube

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            hideCanvas();
        } else {
            showCanvas();
        }
    });

    // Wave retry: poll for <video> element after SPA navigation to a watch page
    function retryWaveSetupAfterNav() {
        const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        if (!settings.waveVisualizer) return;
        if (!document.location.href.includes('watch')) return;

        let waveRetries = 0;
        const maxWaveRetries = 20; // up to 10 seconds
        const waveRetryInterval = setInterval(() => {
            waveRetries++;
            const video = $e('video');
            if (video && !video.paused) {
                clearInterval(waveRetryInterval);
                // Only set up if not already set up for this video
                if (video !== currentVideo || !isSetup) {
                    if (typeof cleanup === 'function') {
                        // cleanup is scoped inside applySettings, so call scheduleApplySettings
                        // which will trigger checkForVideo
                        scheduleApplySettings();
                    }
                }
                return;
            }
            if (video && video.paused) {
                // Wait for play event
                const onPlay = () => {
                    video.removeEventListener('play', onPlay);
                    clearInterval(waveRetryInterval);
                    if (video !== currentVideo || !isSetup) {
                        scheduleApplySettings();
                    }
                };
                video.addEventListener('play', onPlay, { once: true });
                clearInterval(waveRetryInterval);
                return;
            }
            if (waveRetries >= maxWaveRetries) {
                clearInterval(waveRetryInterval);
            }
        }, 500);
    }

    document.addEventListener('yt-navigate-finish', () => {
        // Re-inject gear icon if it was lost during navigation
        if (typeof addIcon === 'function') {
            addIcon();
        }

        if (!document.location.href.includes('watch')) {
            hideCanvas();
        }
        scheduleApplySettings();

        // Retry wave setup after SPA navigation (video may not be ready yet)
        retryWaveSetupAfterNav();

        const isYTSite = document.location.href.includes('youtube.com');
        if (!isYTSite) return;

        if (isYTMusic) {
            // On YTM, re-enable button injection when navigating to a new song
            if (document.location.href.includes('watch')) {
                const existingContainer = $e('.yt-tools-container');
                if (existingContainer) existingContainer.remove();
                validoBotones = true;
                setTimeout(() => renderizarButtons(), 500);

                // Re-initialize ambient mode for the new video (if enabled)
                const savedSettings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                if (savedSettings.cinematicLighting) {
                    ytmAmbientMode.cleanup();
                    setTimeout(() => ytmAmbientMode.setup(), 1000);
                }
            } else {
                // Not on a watch page, cleanup ambient mode
                ytmAmbientMode.cleanup();
            }
        } else {
            // Re-inject lockup stats (reduced passes to save CPU)
            if (document.location.href.includes('youtube.com/watch')) {
                [400, 1500].forEach((ms) => setTimeout(() => {
                    injectLockupCachedStats();
                    injectShortsLockupCachedStats();
                    retargetLockupStatsObserverIfNeeded();
                }, ms));
            } else {
                // Re-inject when landing on home
                [400, 1800].forEach((ms) => setTimeout(() => {
                    injectLockupCachedStats();
                    injectShortsLockupCachedStats();
                }, ms));
            }
        }
    });
    GM_registerMenuCommand('Update Script by: Akari', function () {
        window.open('https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js', '_blank');
    });

    // apis for download
    // https://video-download-api.com
    // 4kdownload


    let ytmScrollListenerInited = false;
    let ytmScrollInitAttempts = 0;
    function initYTMHeaderScroll() {
        if (!isYTMusic || ytmScrollListenerInited) return;
        const navBar = document.querySelector('ytmusic-nav-bar');

        if (!navBar) {
            if (ytmScrollInitAttempts < 10) {
                ytmScrollInitAttempts++;
                setTimeout(initYTMHeaderScroll, 500);
            }
            return;
        }
        ytmScrollListenerInited = true;

        const updateHeader = () => {
            const isScrolled = window.scrollY > 10;
            const isWatchPage = window.location.pathname.startsWith('/watch');
            const isPlayerOpen = document.body.hasAttribute('player-page-open') ||
                navBar.hasAttribute('opened') ||
                isWatchPage;

            const navBarBg = document.querySelector('#nav-bar-background');
            if (isScrolled || isPlayerOpen) {
                navBar.classList.add('scrolled');
                if (navBarBg) navBarBg.classList.add('scrolled');
            } else {
                navBar.classList.remove('scrolled');
                if (navBarBg) navBarBg.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', updateHeader, { passive: true });
        window.addEventListener('popstate', updateHeader);

        // Initial checks to ensure it catches the state on load/refresh
        updateHeader();
        setTimeout(updateHeader, 500);
        setTimeout(updateHeader, 2000);

        // Observe state changes
        const observer = new MutationObserver(updateHeader);
        observer.observe(document.body, { attributes: true, attributeFilter: ['player-page-open'] });
        observer.observe(navBar, { attributes: true, attributeFilter: ['opened'] });
    }

    function applyPageBackground(url, themeColor = null) {
        const isYTMusic = window.location.hostname === 'music.youtube.com';
        const selector = isYTMusic ? 'body, ytmusic-app' : 'ytd-app, body';
        const styleId = 'yt-tools-page-background';
        let styleEl = $id(styleId);

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        if (url) {
            const overlayColor = themeColor || 'rgba(0,0,0,0.5)';
            styleEl.textContent = `
      ${selector} {
        background: transparent !important;
        background-color: transparent !important;
      }
      /* Layer 1: Blurred Background Image */
      body::before {
        content: "" !important;
        position: fixed !important;
        top: -10px !important;
        left: -10px !important;
        width: calc(100% + 20px) !important;
        height: calc(100% + 20px) !important;
        background-image: url("${url}") !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: fixed !important;
        background-repeat: no-repeat !important;
        filter: blur(8px) brightness(0.8) !important;
        z-index: -3 !important;
        pointer-events: none !important;
      }
      /* Layer 2: Theme Overlay (Semi-transparent) */
      body::after {
        content: "" !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: ${themeColor ? themeColor : 'rgba(0,0,0,0.5)'} !important;
        opacity: ${themeColor ? '0.6' : '1'} !important;
        z-index: -2 !important;
        pointer-events: none !important;
      }
      ${isYTMusic ? `
      /* YTM: Elevate content above blur layers */
      ytmusic-app {
        position: relative !important;
        z-index: 3 !important;
      }
      ` : ''}
      #content.ytmusic-app,
      #page-manager.ytd-app,
      #columns.ytd-watch-flexy,
      ytd-browse,
      ytmusic-browse-response,
      ytmusic-section-list-renderer,
      ytmusic-shelf-renderer,
      ytmusic-grid-renderer,
      ytmusic-player-page,
      ytmusic-app-layout,
      ytmusic-guide-renderer,
      tp-yt-app-drawer,
      tp-yt-app-drawer #contentContainer,
      tp-yt-app-drawer #contentContainer.tp-yt-app-drawer,
      #mini-guide,
      #mini-guide-renderer,
      #guide-wrapper,
      #guide-content,
      #guide-spacer,
      #guide-renderer,
      #sections.ytmusic-guide-renderer,
      ytmusic-guide-section-renderer,
      ytmusic-guide-entry-renderer,
      tp-yt-paper-item.ytmusic-guide-entry-renderer,
      #items.ytmusic-guide-section-renderer,
      #divider.ytmusic-guide-section-renderer,
      ytmusic-app-layout.content-scrolled,
      ytmusic-app-layout #background,
      ytmusic-app-layout #guide-background,
      ytmusic-app-layout #player-bar-background,
      ytmusic-app-layout #nav-bar-background,
      #contents.ytmusic-section-list-renderer,
      #header.ytmusic-browse-response,
      #guide-wrapper.ytmusic-guide-renderer,
      ytmusic-responsive-header-renderer,
      .background-gradient.ytmusic-browse-response,
      #content-wrapper.ytmusic-browse-response,
      ytmusic-carousel-shelf-renderer,
      .ytmusic-shelf,
      ytmusic-chip-cloud-renderer,
      ytmusic-carousel-shelf-basic-header-renderer,
      ytmusic-header-renderer,
      ytmusic-tabbed-browse-renderer,
      ytmusic-detail-header-renderer,
      ytmusic-item-section-renderer,
      ytmusic-immersive-header-renderer,
      ytmusic-card-shelf-renderer {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        --ytmusic-background: transparent !important;
        --ytmusic-general-background: transparent !important;
        --ytmusic-guide-background: transparent !important;
        --iron-drawer-background-color: transparent !important;
        --yt-spec-general-background-a: transparent !important;
        --yt-spec-general-background-b: transparent !important;
        --yt-spec-general-background-c: transparent !important;
        --yt-spec-menu-background: transparent !important;
      }
      ${isYTMusic ? `
      /* YTM Nav Bar: transparent at top, dark blurred when scrolled */
      body.ytm-style-transparent #nav-bar-background.ytmusic-app-layout,
      body.ytm-ambient-active #nav-bar-background.ytmusic-app-layout {
        background: transparent !important;
        transition: background 0.3s ease, backdrop-filter 0.3s ease !important;
      }
      body.ytm-style-transparent ytmusic-nav-bar,
      body.ytm-ambient-active ytmusic-nav-bar,
      body.ytm-style-transparent #nav-bar-divider,
      body.ytm-ambient-active #nav-bar-divider {
        background: transparent !important;
        border: none !important;
        transition: background 0.3s ease !important;
      }
      body.ytm-style-transparent ytmusic-nav-bar.scrolled,
      body.ytm-ambient-active ytmusic-nav-bar.scrolled,
      body.ytm-style-transparent #nav-bar-background.scrolled,
      body.ytm-ambient-active #nav-bar-background.scrolled,
      body.ytm-style-transparent ytmusic-nav-bar[opened],
      body.ytm-ambient-active ytmusic-nav-bar[opened],
      body.ytm-style-transparent[player-page-open] ytmusic-nav-bar,
      body.ytm-ambient-active[player-page-open] ytmusic-nav-bar,
      body.ytm-style-transparent[player-page-open] #nav-bar-background,
      body.ytm-ambient-active[player-page-open] #nav-bar-background {
        background: rgba(10, 10, 10, 0.4) !important;
        backdrop-filter: blur(25px) !important;
        -webkit-backdrop-filter: blur(25px) !important;
      }
      body.ytm-ambient-active[player-page-open] ytmusic-nav-bar,
      body.ytm-ambient-active[player-page-open] #nav-bar-background {
        background: transparent !important;
      }
      /* YTM Player Bar: semi-transparent with blur - respect ambient */
      body.ytm-style-transparent ytmusic-player-bar,
      body.ytm-ambient-active ytmusic-player-bar {
        background: rgba(0, 0, 0, 0.2) !important;
        backdrop-filter: blur(30px) !important;
        -webkit-backdrop-filter: blur(30px) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
      }
      body.ytm-ambient-active ytmusic-player-bar {
        background: transparent !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      /* YTM Sidebar (Expanded & Collapsed): Glass with separator line - respect ambient */
      body.ytm-style-transparent tp-yt-app-drawer #contentContainer,
      body.ytm-style-transparent #mini-guide,
      body.ytm-style-transparent #mini-guide-renderer,
      body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
      body.ytm-ambient-active #mini-guide,
      body.ytm-ambient-active #mini-guide-renderer {
        background: rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(25px) !important;
        -webkit-backdrop-filter: blur(25px) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
      body.ytm-ambient-active #mini-guide,
      body.ytm-ambient-active #mini-guide-renderer {
        background: transparent !important;
      }
      /* Standardized YTM Glass Buttons (Edit, Menu, Play, etc.) */
      body.ytm-style-transparent button.ytSpecButtonShapeNextHost,
      body.ytm-style-transparent yt-button-shape button,
      body.ytm-style-transparent .history-button #button,
      body.ytm-ambient-active button.ytSpecButtonShapeNextHost,
      body.ytm-ambient-active yt-button-shape button,
      body.ytm-ambient-active .history-button #button {
        background: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        color: #fff !important;
      }
      /* Clean Guide Button */
      yt-icon-button#guide-button,
      yt-icon-button#guide-button *,
      #guide-button,
      #guide-button #button,
      #guide-button #interaction,
      #guide-button yt-icon,
      #guide-button .yt-interaction,
      #guide-button .stroke.yt-interaction,
      #guide-button .fill.yt-interaction {
        background: transparent !important;
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border: none !important;
        box-shadow: none !important;
        --yt-spec-touch-response: transparent !important;
        --yt-spec-touch-response-inverse: transparent !important;
        --yt-sys-color-baseline--touch-response-inverse: transparent !important;
      }
      /* Play button specific fixes */
      ytmusic-play-button-renderer {
        background: transparent !important;
        --ytmusic-play-button-background-color: transparent !important;
        --ytmusic-play-button-active-background-color: rgba(255, 255, 255, 0.25) !important;
      }
      ytmusic-play-button-renderer .content-wrapper {
        background: rgba(255, 255, 255, 0.2) !important;
        backdrop-filter: blur(15px) !important;
        -webkit-backdrop-filter: blur(15px) !important;
        border-radius: 50% !important;
        box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
      }
      ytmusic-play-button-renderer:hover .content-wrapper {
        background: rgba(255, 255, 255, 0.3) !important;
      }
      ytmusic-play-button-renderer yt-icon,
      ytmusic-play-button-renderer #icon,
      ytmusic-play-button-renderer .icon,
      ytmusic-play-button-renderer .icon.ytmusic-play-button-renderer,
      ytmusic-play-button-renderer yt-icon.ytmusic-play-button-renderer {
        background: transparent !important;
        background-color: transparent !important;
        color: #fff !important;
        --ytmusic-play-button-icon-color: #fff !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      /* Ensure SVGs inside are visible */
      ytmusic-play-button-renderer svg {
        fill: #fff !important;
      }
      ` : ''}
      /* Engagement panels: Solid on regular YT, but NOT on Shorts */
      ytd-watch-flexy ytd-engagement-panel-section-list-renderer,
      ytd-watch-flexy ytd-engagement-panel-section-list-renderer #content,
      ytd-watch-flexy ytd-engagement-panel-section-list-renderer #header,
      ytd-watch-flexy ytd-engagement-panel-title-header-renderer,
      ytd-watch-flexy ytd-engagement-panel-title-header-renderer #header,
      ytd-watch-flexy ytd-section-list-renderer[engagement-panel] {
        background: #212121 !important;
        background-color: #212121 !important;
      }
      /* Nuclear transparency for Shorts engagement panels to reveal theme background */
      ytd-shorts #shorts-panel-container,
      ytd-shorts #anchored-panel,
      ytd-shorts ytd-engagement-panel-section-list-renderer,
      ytd-shorts ytd-engagement-panel-section-list-renderer #content,
      ytd-shorts ytd-engagement-panel-section-list-renderer #header,
      /* Highly specific YouTube selectors identified during debugging */
      ytd-shorts ytd-engagement-panel-section-list-renderer[match-content-theme] #content,
      ytd-shorts ytd-engagement-panel-section-list-renderer[match-content-theme] #content.ytd-engagement-panel-section-list-renderer,
      ytd-shorts ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] #content,
      ytd-shorts ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] #header,
      ytd-shorts ytd-engagement-panel-title-header-renderer,
      ytd-shorts ytd-engagement-panel-title-header-renderer #header,
      ytd-shorts ytd-comments-header-renderer,
      ytd-shorts ytd-comment-thread-renderer,
      ytd-shorts ytd-comment-view-model,
      ytd-shorts ytd-item-section-renderer,
      ytd-shorts #sections.ytd-item-section-renderer,
      ytd-shorts #contents.ytd-item-section-renderer,
      ytd-shorts ytd-comment-simplebox-renderer {
        background: transparent !important;
        background-color: transparent !important;
      }
      /* Search button - restore default YT gray */
      ytd-searchbox #search-icon-legacy,
      button.ytSearchboxComponentSearchButton,
      button.ytSearchboxComponentSearchButtonDark {
        background-color: #222222 !important;
        border: none !important;
      }
      /* Voice search button - add blur backdrop for visibility */
      #voice-search-button .ytSpecButtonShapeNextHost,
      #voice-search-button button {
        background: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border-radius: 50% !important;
      }
      /* Hide YTM native background elements when custom background is set */
      body:not(.ytm-ambient-active) #mini-guide-background,
      ytmusic-browse-response #background.immersive-background,
      ytmusic-fullbleed-thumbnail-renderer[is-background],
      ytmusic-player-page #background.immersive-background,
      #background.ytmusic-browse-response {
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }
      /* Hide Shorts cinematic black blocks */
      #cinematic-container.ytd-reel-video-renderer,
      #shorts-cinematic-container,
      #cinematic-shorts-scrim.ytd-shorts {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
      /* Remove dark gradient overlays from Shorts */
      .overlay.ytd-reel-video-renderer,
      ytd-reel-player-overlay-renderer,
      ytd-reel-player-overlay-renderer #overlay,
      .overlay-container.ytd-reel-player-overlay-renderer {
        background: transparent !important;
        background-image: none !important;
      }
    `;
        } else {
            styleEl.textContent = '';
        }
    }

    // --- Background Image Customization ---
    const inputFile = $id('background_image');
    const preview = $id('background-image-preview');
    const removeBtn = $id('remove-background-image');

    if (inputFile && preview) {
        // show preview
        const storedImage = localStorage.getItem('backgroundImage');
        if (storedImage) {
            preview.style.backgroundImage = `url(${storedImage})`;
            preview.classList.add('has-image');
            if (removeBtn) removeBtn.style.display = 'flex';
            applyPageBackground(storedImage);
        } else {
            preview.style.backgroundImage = '';
            preview.classList.remove('has-image');
            if (removeBtn) removeBtn.style.display = 'none';
            applyPageBackground(null);
        }


        preview.addEventListener('click', (e) => {
            if (e.target === removeBtn) return;
            inputFile.click();
        });

        // add background image (bind once)
        inputFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                const dataUrl = ev.target.result;
                preview.style.backgroundImage = `url(${dataUrl})`;
                preview.classList.add('has-image');
                localStorage.setItem('backgroundImage', dataUrl);
                if (removeBtn) removeBtn.style.display = 'flex';
                applyPageBackground(dataUrl);
            };
            reader.readAsDataURL(file);
        });

        // Remove background image (bind once)
        if (removeBtn && removeBtn.dataset.ytToolsBound !== '1') {
            removeBtn.dataset.ytToolsBound = '1';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only allow real user click to remove stored background
                if (e.isTrusted === false) return;
                preview.style.backgroundImage = '';
                preview.classList.remove('has-image');
                localStorage.removeItem('backgroundImage');
                removeBtn.style.display = 'none';
                applyPageBackground(null);
                // Force theme refresh to remove image from dynamic CSS
                if (typeof scheduleApplySettings === 'function') {
                    scheduleApplySettings();
                }
            });
        }
    }

    // Nuclear fix for persistent black cinematic blocks in Shorts