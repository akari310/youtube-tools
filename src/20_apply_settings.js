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
  if (isYTMusic) {
    document.body.classList.remove('ytm-style-blur', 'ytm-style-liquid', 'ytm-style-transparent');
    if (settings.sidePanelStyle === 'liquid') {
      document.body.classList.add('ytm-style-liquid');
    } else if (settings.sidePanelStyle === 'transparent') {
      document.body.classList.add('ytm-style-transparent');
    } else {
      document.body.classList.add('ytm-style-blur');
    }
  }


  // Initialize header buttons
  initializeHeaderButtons();



  // Hide comments (YT only)
  if (!isYTMusic) {
    const commentsSection = $id('comments');
    if (commentsSection) {
      commentsSection.style.display = settings.hideComments ? 'none' : 'block';
    }
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
            '--ytcp-text-primary'
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
            applyPageBackground(localStorage.getItem('backgroundImage'), null, settings.cinematicLighting);
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
          const hasBgImage = !!localStorage.getItem('backgroundImage');
          const ytmBg = hasBgImage ? 'transparent' : selectedTheme.gradient;
          const ytmRaised = hasBgImage ? 'transparent' : (selectedTheme.raised || selectedTheme.gradient);

          applyYTMThemeVars(
            ytmBg,
            selectedTheme.textColor,
            selectedTheme.textColor,
            selectedTheme.gradient,
            selectedTheme.colorIcons || selectedTheme.textColor,
            ytmRaised,
            ytmSliderSolidColor,
            ytmSliderSolidColor + '80' // Add 50% opacity in hex for secondary 'buffer' slider
          );
          if (hasBgImage) {
            addDynamicCss(`
              html, body, ytmusic-app {
                --ytmusic-background: transparent !important;
                --ytmusic-general-background: transparent !important;
                --yt-spec-base-background: transparent !important;
                --yt-spec-general-background-a: transparent !important;
                --yt-spec-general-background-b: transparent !important;
                --ytmusic-nav-bar-background: transparent !important;
                --ytmusic-player-bar-background: transparent !important;
                --ytmusic-player-page-background: transparent !important;
              }
            `);
          }
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
            applyPageBackground(localStorage.getItem('backgroundImage'), selectedTheme.gradient, settings.cinematicLighting);
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
          #shorts-container,
          ytd-shorts,
          #shorts-inner-container,
          #cinematic-container.ytd-reel-video-renderer,
          #shorts-cinematic-container,
          .short-video-container.ytd-reel-video-renderer,
          ytd-reel-video-renderer,
          .navigation-container.ytd-shorts,
          .navigation-button.ytd-shorts,
          .navigation-button.ytd-shorts button,
          /* Only target large background containers for transparency, avoid small UI elements like chips */
          ytmusic-app-layout,
          #content.ytmusic-app,
          [slot="content"].ytmusic-app,
          ytmusic-browse-response,
          ytmusic-search-page,
          ytmusic-player-page,
          ytmusic-player,
          #player.ytmusic-player-page,
          #ytm-side-panel-wrapper,
          ytmusic-playlist-panel-renderer,
          ytmusic-section-list-renderer,
          ytmusic-item-section-renderer,
          ytmusic-shelf-renderer,
          ytmusic-carousel-shelf-renderer,
          ytmusic-guide-renderer,
          #guide-content.ytmusic-guide-renderer,
          tp-yt-app-drawer,
          #contentContainer.tp-yt-app-drawer,
          #scrim.tp-yt-app-drawer,
          #nav-bar-background.ytmusic-nav-bar,
          #player-bar-background.ytmusic-player-bar,
          #suggestion-list.ytmusic-search-box { 
            background: transparent !important; 
            background-color: transparent !important;
            background-image: none !important;
            border: none !important;
          }
          /* Apply semi-transparent theme color to variables for better readability */
          ytmusic-app {
            --ytmusic-background: rgba(15, 15, 15, 0.45) !important;
            --ytmusic-general-background: transparent !important;
            --yt-spec-base-background: transparent !important;
            --ytmusic-player-bar-background: rgba(15, 15, 15, 0.6) !important;
            --ytmusic-nav-bar-background: rgba(15, 15, 15, 0.5) !important;
            --yt-spec-raised-background: rgba(255, 255, 255, 0.1) !important;
            --yt-spec-menu-background: #282828 !important;
          }
          /* Completely hide YTM's own ambient background elements without hiding content */
          ytmusic-browse-response #background,
          ytmusic-player-page #background,
          [slot="background"].ytmusic-app-layout {
            display: none !important;
          }
          .background-gradient.ytmusic-browse-response,
          .background-gradient.ytmusic-player-page {
            background: none !important;
            background-image: none !important;
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
          .navigation-container.ytd-shorts {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 12px !important;
            height: 100% !important;
            top: 0 !important;
            bottom: 0 !important;
            margin: 0 !important;
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
                background-color: #030303 !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
              ytmusic-player-bar { background: ${selectedTheme.gradient} !important; }
              ytmusic-nav-bar { 
                background: transparent !important; 
                transition: background 0.4s ease-in-out !important;
              }
              ytmusic-nav-bar.scrolled,
              ytmusic-nav-bar[opened],
              body[player-page-open] ytmusic-nav-bar {
                background: ${selectedTheme.gradient} !important;
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
                background-color: #030303 !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : 'none'} !important;
                background-color: ${localStorage.getItem('backgroundImage') ? 'transparent' : settings.bgColorPicker} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
              ytmusic-player-bar { background: ${settings.headerColorPicker || settings.bgColorPicker} !important; }
              ytmusic-nav-bar { 
                background: transparent !important; 
                transition: background 0.4s ease-in-out !important;
              }
              ytmusic-nav-bar.scrolled,
              ytmusic-nav-bar[opened],
              body[player-page-open] ytmusic-nav-bar {
                background: ${settings.headerColorPicker || settings.bgColorPicker} !important;
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
      // Cleanup theme vars when toggled off to fix stuck colors on side-panel
      const props = [
        '--ytmusic-general-background', '--ytmusic-background', '--ytmusic-color-white1', '--ytmusic-color-white2',
        '--ytmusic-color-white3', '--ytmusic-color-white4', '--ytmusic-player-bar-background', '--ytmusic-nav-bar-background',
        '--ytmusic-search-background', '--yt-spec-general-background-a', '--yt-spec-general-background-b', '--yt-spec-general-background-c',
        '--yt-spec-base-background', '--yt-spec-text-primary', '--yt-spec-text-secondary', '--yt-spec-menu-background',
        '--yt-spec-icon-inactive', '--yt-spec-brand-icon-inactive', '--yt-spec-brand-icon-active', '--yt-spec-static-brand-red',
        '--yt-spec-raised-background', '--yt-spec-static-brand-white', '--ytd-searchbox-background', '--ytd-searchbox-text-color',
        '--ytcp-text-primary'
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


  checkForVideo();

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
  if (isYTMusic) {
    document.body.classList.remove('ytm-style-blur', 'ytm-style-liquid', 'ytm-style-transparent');
    if (settings.sidePanelStyle === 'liquid') {
      document.body.classList.add('ytm-style-liquid');
    } else if (settings.sidePanelStyle === 'transparent') {
      document.body.classList.add('ytm-style-transparent');
    } else {
      document.body.classList.add('ytm-style-blur');
    }
  }


  // Initialize header buttons
  initializeHeaderButtons();



  // Hide comments (YT only)
  if (!isYTMusic) {
    const commentsSection = $id('comments');
    if (commentsSection) {
      commentsSection.style.display = settings.hideComments ? 'none' : 'block';
    }
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
            '--ytcp-text-primary'
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
            applyPageBackground(localStorage.getItem('backgroundImage'), null, settings.cinematicLighting);
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
          const hasBgImage = !!localStorage.getItem('backgroundImage');
          const ytmBg = hasBgImage ? 'transparent' : selectedTheme.gradient;
          const ytmRaised = hasBgImage ? 'transparent' : (selectedTheme.raised || selectedTheme.gradient);

          applyYTMThemeVars(
            ytmBg,
            selectedTheme.textColor,
            selectedTheme.textColor,
            selectedTheme.gradient,
            selectedTheme.colorIcons || selectedTheme.textColor,
            ytmRaised,
            ytmSliderSolidColor,
            ytmSliderSolidColor + '80' // Add 50% opacity in hex for secondary 'buffer' slider
          );
          if (hasBgImage) {
            addDynamicCss(`
              html, body, ytmusic-app {
                --ytmusic-background: transparent !important;
                --ytmusic-general-background: transparent !important;
                --yt-spec-base-background: transparent !important;
                --yt-spec-general-background-a: transparent !important;
                --yt-spec-general-background-b: transparent !important;
                --ytmusic-nav-bar-background: transparent !important;
                --ytmusic-player-bar-background: transparent !important;
                --ytmusic-player-page-background: transparent !important;
              }
            `);
          }
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
            applyPageBackground(localStorage.getItem('backgroundImage'), selectedTheme.gradient, settings.cinematicLighting);
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
          #shorts-container,
          ytd-shorts,
          #shorts-inner-container,
          #cinematic-container.ytd-reel-video-renderer,
          #shorts-cinematic-container,
          .short-video-container.ytd-reel-video-renderer,
          ytd-reel-video-renderer,
          .navigation-container.ytd-shorts,
          .navigation-button.ytd-shorts,
          .navigation-button.ytd-shorts button,
          /* Only target large background containers for transparency, avoid small UI elements like chips */
          ytmusic-app-layout,
          #content.ytmusic-app,
          [slot="content"].ytmusic-app,
          ytmusic-browse-response,
          ytmusic-search-page,
          ytmusic-player-page,
          ytmusic-player,
          #player.ytmusic-player-page,
          #ytm-side-panel-wrapper,
          ytmusic-playlist-panel-renderer,
          ytmusic-section-list-renderer,
          ytmusic-item-section-renderer,
          ytmusic-shelf-renderer,
          ytmusic-carousel-shelf-renderer,
          ytmusic-guide-renderer,
          #guide-content.ytmusic-guide-renderer,
          tp-yt-app-drawer,
          #contentContainer.tp-yt-app-drawer,
          #scrim.tp-yt-app-drawer,
          #nav-bar-background.ytmusic-nav-bar,
          #player-bar-background.ytmusic-player-bar,
          #suggestion-list.ytmusic-search-box { 
            background: transparent !important; 
            background-color: transparent !important;
            background-image: none !important;
            border: none !important;
          }
          /* Apply semi-transparent theme color to variables for better readability */
          ytmusic-app {
            --ytmusic-background: rgba(15, 15, 15, 0.45) !important;
            --ytmusic-general-background: transparent !important;
            --yt-spec-base-background: transparent !important;
            --ytmusic-player-bar-background: rgba(15, 15, 15, 0.6) !important;
            --ytmusic-nav-bar-background: rgba(15, 15, 15, 0.5) !important;
            --yt-spec-raised-background: rgba(255, 255, 255, 0.1) !important;
            --yt-spec-menu-background: #282828 !important;
          }
          /* Completely hide YTM's own ambient background elements without hiding content */
          ytmusic-browse-response #background,
          ytmusic-player-page #background,
          [slot="background"].ytmusic-app-layout {
            display: none !important;
          }
          .background-gradient.ytmusic-browse-response,
          .background-gradient.ytmusic-player-page {
            background: none !important;
            background-image: none !important;
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
          .navigation-container.ytd-shorts {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 12px !important;
            height: 100% !important;
            top: 0 !important;
            bottom: 0 !important;
            margin: 0 !important;
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
                background-color: #030303 !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : selectedTheme.gradient} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
              ytmusic-player-bar { background: ${selectedTheme.gradient} !important; }
              ytmusic-nav-bar { 
                background: transparent !important; 
                transition: background 0.4s ease-in-out !important;
              }
              ytmusic-nav-bar.scrolled,
              ytmusic-nav-bar[opened],
              body[player-page-open] ytmusic-nav-bar {
                background: ${selectedTheme.gradient} !important;
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
                background-color: #030303 !important;
                background-image: ${localStorage.getItem('backgroundImage') ? 'url("' + localStorage.getItem('backgroundImage') + '")' : 'none'} !important;
                background-color: ${localStorage.getItem('backgroundImage') ? 'transparent' : settings.bgColorPicker} !important;
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
              }
              ytmusic-player-bar { background: ${settings.headerColorPicker || settings.bgColorPicker} !important; }
              ytmusic-nav-bar { 
                background: transparent !important; 
                transition: background 0.4s ease-in-out !important;
              }
              ytmusic-nav-bar.scrolled,
              ytmusic-nav-bar[opened],
              body[player-page-open] ytmusic-nav-bar {
                background: ${settings.headerColorPicker || settings.bgColorPicker} !important;
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
      // Cleanup theme vars when toggled off to fix stuck colors on side-panel
      const props = [
        '--ytmusic-general-background', '--ytmusic-background', '--ytmusic-color-white1', '--ytmusic-color-white2',
        '--ytmusic-color-white3', '--ytmusic-color-white4', '--ytmusic-player-bar-background', '--ytmusic-nav-bar-background',
        '--ytmusic-search-background', '--yt-spec-general-background-a', '--yt-spec-general-background-b', '--yt-spec-general-background-c',
        '--yt-spec-base-background', '--yt-spec-text-primary', '--yt-spec-text-secondary', '--yt-spec-menu-background',
        '--yt-spec-icon-inactive', '--yt-spec-brand-icon-inactive', '--yt-spec-brand-icon-active', '--yt-spec-static-brand-red',
        '--yt-spec-raised-background', '--yt-spec-static-brand-white', '--ytd-searchbox-background', '--ytd-searchbox-text-color',
        '--ytcp-text-primary'
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


  checkForVideo();

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
