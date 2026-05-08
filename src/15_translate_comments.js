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
