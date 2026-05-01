// ------------------------------
const ytmAmbientMode = {
  active: false,
  _initialized: false, // true once DOM elements are created
  glowEl: null,
  styleEl: null,
  videoEl: null,
  _lastSrc: '',
  _pollId: null,

  // Find album art image URL from YTM player page
  _getArtUrl() {
    // 1. Rock-solid way: Get from YouTube Player API directly
    try {
      const mp = document.getElementById('movie_player');
      if (mp && typeof mp.getVideoData === 'function') {
        const vData = mp.getVideoData();
        if (vData && vData.video_id) {
          return `https://i.ytimg.com/vi/${vData.video_id}/sddefault.jpg`;
        }
      }
    } catch (e) { }

    // 2. Fallbacks
    const selectors = [
      '#song-image yt-img-shadow img',
      '#song-image img',
      'ytmusic-player-page #thumbnail img',
      '#player-page .thumbnail img',
      'ytmusic-player-bar .image img',
      'ytmusic-player-bar img'
    ];
    for (const sel of selectors) {
      const img = document.querySelector(sel);
      if (img && img.src && img.src.startsWith('http')) {
        return img.src.replace(/=w\d+-h\d+/, '=w640-h640').replace(/=s\d+/, '=s640');
      }
    }
    const video = $e('video');
    if (video && video.poster) return video.poster;
    return null;
  },

  // Create DOM elements once (called only once, persists across show/hide)
  _ensureInit() {
    if (this._initialized) return;
    this._initialized = true;

    // Create the glow div
    this.glowEl = document.createElement('div');
    this.glowEl.id = 'ytm-ambient-glow';
    document.body.appendChild(this.glowEl);

    // Create the custom sidebar divider that perfectly fits the top/bottom bars
    this.dividerEl = document.createElement('div');
    this.dividerEl.id = 'ytm-custom-divider';
    document.body.appendChild(this.dividerEl);

    // Create style element
    this.styleEl = document.createElement('style');
    this.styleEl.id = 'ytm-ambient-style';
    this.styleEl.textContent = `
        #ytm-ambient-glow {
          position: fixed;
          top: -200px; left: -200px;
          width: calc(100vw + 400px);
          height: calc(100vh + 400px);
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(140px) saturate(2.2) brightness(0.9);
          transition: opacity 1.2s ease;
        }
        #ytm-ambient-glow.active {
          opacity: 0.7;
        }
        #ytm-custom-divider {
          position: fixed;
          width: 1px;
          background: rgba(255, 255, 255, 0.15);
          pointer-events: none;
          z-index: 2000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        body.ytm-ambient-active #ytm-custom-divider.active {
          opacity: 1;
        }
        /* Make player page backgrounds transparent so glow shows through */
        body.ytm-ambient-active ytmusic-app,
        body.ytm-ambient-active ytmusic-app-layout,
        body.ytm-ambient-active #layout {
          background-color: transparent !important;
          background: transparent !important;
          transition: background-color 0.6s ease;
        }
        body.ytm-ambient-active ytmusic-player-page,
        body.ytm-ambient-active #player-page,
        body.ytm-ambient-active ytmusic-player-page #main-panel,
        body.ytm-ambient-active .background-gradient {
          background-color: transparent !important;
          background: transparent !important;
          background-image: none !important;
        }
        /* Make nav bar, player bar, and side drawer transparent so the aura blends behind them smoothly */
        body.ytm-ambient-active #nav-bar-background,
        body.ytm-ambient-active #player-bar-background,
        body.ytm-ambient-active ytmusic-nav-bar,
        body.ytm-ambient-active ytmusic-player-bar,
        body.ytm-ambient-active tp-yt-app-drawer,
        body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
        body.ytm-ambient-active #guide-wrapper,
        body.ytm-ambient-active #guide-content,
        body.ytm-ambient-active ytmusic-guide-renderer,
        body.ytm-ambient-active #mini-guide-background,
        body.ytm-ambient-active #mini-guide {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        /* Remove borders that piece through the player bar when transparent */
        body.ytm-ambient-active tp-yt-app-drawer,
        body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
        body.ytm-ambient-active #guide-wrapper,
        body.ytm-ambient-active #guide-content,
        body.ytm-ambient-active ytmusic-guide-renderer,
        body.ytm-ambient-active #mini-guide-background {
          border: none !important;
          border-right: none !important;
          box-shadow: none !important;
        }
        /* Hide home/browse pages when player is open so they don't bleed through or block the glow */
        body.ytm-ambient-active ytmusic-browse-response {
          visibility: hidden !important;
          opacity: 0 !important;
        }


      `;
    document.head.appendChild(this.styleEl);
  },

  // Show ambient (fast — just toggle class + update art)
  show() {
    if (!isYTMusic) return;
    if (this.active) return;
    if (!window.location.href.includes('/watch')) return;

    this._ensureInit();
    this.active = true;

    // Update video reference
    this.videoEl = document.querySelector('video');

    if (this.glowEl) {
      this.glowEl.classList.add('active');
      document.body.classList.add('ytm-ambient-active');
    }

    this._updateArt();
    this._startPoll();
    this._startTracker();

    // Listen for play events (for art updates on song change)
    if (this.videoEl) {
      this.videoEl.removeEventListener('play', this._onPlay);
      this.videoEl.addEventListener('play', this._onPlay);
    }
  },

  // Hide ambient (fast — just toggle class, keep elements)
  hide() {
    this.active = false;
    if (this._pollId) {
      clearInterval(this._pollId);
      this._pollId = null;
    }
    if (this._trackerId) {
      cancelAnimationFrame(this._trackerId);
      this._trackerId = null;
    }
    if (this.glowEl) {
      this.glowEl.classList.remove('active');
      document.body.classList.remove('ytm-ambient-active');
    }
    if (this.dividerEl) {
      this.dividerEl.classList.remove('active');
    }
    if (this.videoEl) {
      this.videoEl.removeEventListener('play', this._onPlay);
      this.videoEl = null;
    }
  },

  // Full cleanup — remove all DOM elements (only when disabling feature)
  destroy() {
    this.hide();
    this._lastSrc = '';
    this._initialized = false;
    if (this.glowEl) {
      if (this.glowEl.parentNode) this.glowEl.parentNode.removeChild(this.glowEl);
      this.glowEl = null;
    }
    if (this.dividerEl) {
      if (this.dividerEl.parentNode) this.dividerEl.parentNode.removeChild(this.dividerEl);
      this.dividerEl = null;
    }
    if (this.styleEl) {
      if (this.styleEl.parentNode) this.styleEl.parentNode.removeChild(this.styleEl);
      this.styleEl = null;
    }
  },

  _startTracker() {
    if (this._trackerId) cancelAnimationFrame(this._trackerId);

    const self = this;
    function track() {
      if (!self.active) { self._trackerId = null; return; }

      const nav = document.querySelector('ytmusic-nav-bar');
      const player = document.querySelector('ytmusic-player-bar');
      const drawer = document.querySelector('tp-yt-app-drawer');
      const wrapper = document.querySelector('#guide-wrapper') || document.querySelector('#mini-guide-background');

      if (nav && player && drawer && wrapper && self.dividerEl) {
        const navRect = nav.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        let leftPos = wrapperRect.right;
        // Minor correction if right bound goes missing
        if (leftPos <= 0 || !leftPos) leftPos = drawer.hasAttribute('opened') ? 240 : 72;

        self.dividerEl.style.top = navRect.bottom + 'px';
        self.dividerEl.style.height = (playerRect.top - navRect.bottom) + 'px';
        self.dividerEl.style.left = leftPos + 'px';
        self.dividerEl.classList.add('active');
      }

      self._trackerId = requestAnimationFrame(track);
    }

    this._trackerId = requestAnimationFrame(track);
  },

  // Legacy aliases for compatibility
  setup() { this.show(); },
  cleanup() { this.hide(); },

  _updateArt() {
    const url = this._getArtUrl();
    if (url && url !== this._lastSrc) {
      this._lastSrc = url;
      if (this.glowEl) {
        this.glowEl.style.backgroundImage = `url("${url}")`;
      }
    }
  },

  _startPoll() {
    if (this._pollId) clearInterval(this._pollId);
    const self = this;
    this._pollId = setInterval(() => {
      if (!self.active) { clearInterval(self._pollId); self._pollId = null; return; }
      if (!window.location.href.includes('/watch')) {
        self.hide();
        return;
      }
      self._updateArt();
    }, 2000);
  },

  _onPlay: function () {
    if (!window.location.href.includes('/watch')) return;
    const g = document.getElementById('ytm-ambient-glow');
    if (g) {
      g.classList.add('active');
      document.body.classList.add('ytm-ambient-active');
    }
    ytmAmbientMode._updateArt();
  },
};

// Persistent ambient watcher — fast URL monitoring for smooth transitions
if (isYTMusic) {
  let _ambientWatcherId = null;
  function startAmbientWatcher() {
    if (_ambientWatcherId) return;
    _ambientWatcherId = setInterval(() => {
      const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
      if (!settings.cinematicLighting) {
        if (ytmAmbientMode.active) ytmAmbientMode.hide();
        return;
      }
      const onWatch = window.location.href.includes('/watch');
      if (onWatch && !ytmAmbientMode.active) {
        ytmAmbientMode.show();
      } else if (!onWatch && ytmAmbientMode.active) {
        ytmAmbientMode.hide();
      }
    }, 800); // Fast polling for snappy response
  }
  setTimeout(startAmbientWatcher, 1500);

  // Also respond to YTM-specific events immediately
  document.addEventListener('yt-page-data-updated', () => {
    const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
    if (!settings.cinematicLighting) return;
    if (window.location.href.includes('/watch')) {
      if (!ytmAmbientMode.active) ytmAmbientMode.show();
      else ytmAmbientMode._updateArt(); // might be a new song
    } else if (ytmAmbientMode.active) {
      ytmAmbientMode.hide();
    }
  });
}

// Cinematic Lighting Control Functions
function isWatchPage() {
  return window.location.href.includes('youtube.com/watch');
}

function isCinematicActive() {
  const cinematicDiv = document.getElementById('cinematics');
  if (!cinematicDiv) {
    return false;
  }

  const hasContent = cinematicDiv.innerHTML.trim() !== '';
  const hasCanvas = cinematicDiv.querySelector('canvas') !== null;
  const hasChildren = cinematicDiv.children.length > 0;

  const hasCinematicElements = cinematicDiv.querySelector('div[style*="position: fixed"]') !== null;

  return hasContent || hasCanvas || hasChildren || hasCinematicElements;
}

function toggleCinematicLighting() {
  const settingsButton = $e('.ytp-button.ytp-settings-button');
  if (!settingsButton) {
    console.log('[YT Tools] Settings button not found');
    return;
  }

  settingsButton.click();

  // Cinematic/ambient keywords in multiple languages for robust detection
  const cinematicKeywords = [
    'cinematic', 'lighting', 'cinema', 'ambient',
    'ch\u1EBF \u0111\u1ED9 \u0111i\u1EC7n \u1EA3nh', // Vietnamese: Chế độ điện ảnh
    '\u0111i\u1EC7n \u1EA3nh', // Vietnamese: điện ảnh
    'atmosph', 'ambiante', 'cin\u00E9ma', // French
    '\u30A2\u30F3\u30D3\u30A8\u30F3\u30C8', // Japanese
    '\uC2DC\uB124\uB9C8\uD2F1', // Korean
  ];

  const findAndClickCinematic = () => {
    const menuItems = $m('.ytp-menuitem');
    if (!menuItems || menuItems.length === 0) return false;

    for (let item of menuItems) {
      // Method 1: Look for toggle checkbox (cinematic is the only toggle-type menu item)
      const toggleCheckbox = item.querySelector('.ytp-menuitem-toggle-checkbox');
      if (toggleCheckbox) {
        console.log('[YT Tools] Found cinematic/ambient toggle item (by checkbox)');
        item.click();
        return true;
      }
    }

    // Method 2: Match by localized text keywords
    for (let item of menuItems) {
      const text = (item.textContent || '').toLowerCase();
      for (const kw of cinematicKeywords) {
        if (text.includes(kw)) {
          console.log('[YT Tools] Found cinematic option by keyword:', kw);
          item.click();
          return true;
        }
      }
    }

    // Method 3: Match by SVG icon path
    for (let item of menuItems) {
      const icon = item.querySelector('.ytp-menuitem-icon svg path');
      if (icon && (icon.getAttribute('d')?.includes('M21 7v10H3V7') ||
        icon.getAttribute('d')?.includes('M12 2C6.48 2 2 6.48 2 12'))) {
        console.log('[YT Tools] Found cinematic option by SVG path');
        item.click();
        return true;
      }
    }

    return false;
  };

  const closeMenu = () => {
    const menu = $e('.ytp-settings-menu');
    if (menu) document.body.click();
  };

  // Use polling instead of MutationObserver for more reliable detection
  let attempts = 0;
  const maxAttempts = 20;
  const pollInterval = setInterval(() => {
    attempts++;
    if (findAndClickCinematic()) {
      clearInterval(pollInterval);
      setTimeout(closeMenu, 150);
      return;
    }
    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      console.warn('[YT Tools] Could not find cinematic/ambient toggle after', maxAttempts, 'attempts');
      closeMenu();
    }
  }, 200);
}

// Function to apply settings
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
    $sp('--ytmusic-nav-bar-background', raisedBg || bgColor);
    $sp('--ytmusic-search-background', menuBg || bgColor);
    // Shared YT/YTM variables
    $sp('--yt-spec-general-background-a', bgColor);
    $sp('--yt-spec-general-background-b', bgColor);
    $sp('--yt-spec-general-background-c', raisedBg || bgColor);

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
          addDynamicCss(`
              .botones_div {
               background-color: transparent;
               border: none;
               color: #ccc !important;
               user-select: none;
             }
               `);
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
            selectedTheme.raised,
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
          #shorts-container, #page-manager.ytd-app {
            background: ${selectedTheme.gradient.replace(/(#[0-9a-fA-F]{6})/g, '$136')};
          }
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
              ytmusic-app { background: ${selectedTheme.gradient} !important; }
              ytmusic-player-bar { background: ${selectedTheme.raised || selectedTheme.gradient} !important; }
              ytmusic-nav-bar { background: ${selectedTheme.raised || selectedTheme.gradient} !important; }
              ytmusic-search-box #input-box { background: ${selectedTheme.gradient} !important; }
              ytmusic-browse-response,
              ytmusic-header-renderer,
              ytmusic-tabbed-browse-renderer,
              ytmusic-detail-header-renderer,
              ytmusic-section-list-renderer,
              ytmusic-carousel-shelf-renderer,
              ytmusic-grid-renderer { background: transparent !important; }
              #layout { background: ${selectedTheme.gradient} !important; }
              .content.ytmusic-player-page { background: ${selectedTheme.gradient} !important; }
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
        #shorts-container, #page-manager.ytd-app {
            background: ${settings.bgColorPicker}36;
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
              ytmusic-app { background: ${settings.bgColorPicker} !important; }
              ytmusic-player-bar { background: ${settings.headerColorPicker || settings.bgColorPicker} !important; }
              ytmusic-nav-bar { background: ${settings.headerColorPicker || settings.bgColorPicker} !important; }
              ytmusic-search-box #input-box { background: ${settings.menuColorPicker || settings.bgColorPicker} !important; }
              ytmusic-browse-response,
              ytmusic-header-renderer,
              ytmusic-tabbed-browse-renderer,
              ytmusic-detail-header-renderer,
              ytmusic-section-list-renderer,
              ytmusic-carousel-shelf-renderer,
              ytmusic-grid-renderer { background: transparent !important; }
              #layout { background: ${settings.bgColorPicker} !important; }
              .content.ytmusic-player-page { background: ${settings.bgColorPicker} !important; }
              ytmusic-player-bar .title, ytmusic-player-bar .byline {
                color: ${settings.primaryColorPicker} !important;
              }
              .ytmusic-player-bar .yt-spec-icon-shape, .ytmusic-player-bar svg {
                color: ${settings.iconsColorPicker} !important;
                fill: ${settings.iconsColorPicker} !important;
              }
            `);
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

  downloadDescriptionVideo();


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
    function initSmartCommentObserver() {
      const commentsContainer = document.querySelector('#comments');
      if (!commentsContainer) return;

      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {

          const commentObserver = new MutationObserver((mutations) => {
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
            commentObserver.observe(commentContents, {
              childList: true,
              subtree: true
            });
          }

          io.disconnect();
        }
      });

      io.observe(commentsContainer);
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


  // Shorts DOM observer (YT only)
  if (!isYTMusic) {
    const contentScrollable = $e('.anchored-panel.style-scope.ytd-shorts #contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer');
    if (contentScrollable) {
      let domTimeout;
      const observer = new MutationObserver(() => {
        if (domTimeout) clearTimeout(domTimeout);
        domTimeout = setTimeout(() => {
          insertButtons();
          addIcon();
        }, 300);
      });

      observer.observe(contentScrollable, { childList: true, subtree: true });
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
        } catch (err) { }
        source = null;
      }
      if (audioCtx) {
        try {
          audioCtx.close();
        } catch (err) { }
        audioCtx = null;
      }
      if (currentVideo && currentVideo[PROCESSED_FLAG]) {
        delete currentVideo[PROCESSED_FLAG];
      }
      currentVideo = null;
      isSetup = false;
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

    selectAppend.addEventListener('change', (e) => {
      waveStyle = e.target.value;
      selectAppend.value = e.target.value;
      saveSettings();
    });

  }



  // setting Audio y Analyser
  function setupAudioAnalyzer(video) {
    if (!video || video[PROCESSED_FLAG]) return;
    video[PROCESSED_FLAG] = true;
    cleanup(false);
    currentVideo = video;
    createCanvasOverlay();
    createControlPanelWave();

    if (audioCtx) {
      try {
        audioCtx.close();
      } catch (e) { }
      audioCtx = null;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);
    smoothedData = new Array(bufferLength).fill(128);

    try {
      source = audioCtx.createMediaElementSource(video);
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

    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = canvasHeight;
      }
    };

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

      if (document.visibilityState === 'visible') {
        usageTime += delta;
      }

      // Tối ưu việc tìm video đang chạy
      const activeVideoEl = document.querySelector('video.video-stream');
      if (activeVideoEl && !activeVideoEl.paused && !activeVideoEl.ended) {
        const type = window.location.pathname.startsWith('/shorts') ? 'shorts' : 'video';
        if (type === 'video') videoTime += delta;
        else shortsTime += delta;
      }

      lastUpdate = now;
      // Chỉ lưu vào GM storage mỗi 30 giây để giảm I/O
      if (now - __lastStatsSave >= 30000) {
        __lastStatsSave = now;
        GM_setValue(STORAGE.USAGE, usageTime);
        GM_setValue(STORAGE.VIDEO, videoTime);
        GM_setValue(STORAGE.SHORTS, shortsTime);
      }
      if ($id('stats')?.classList?.contains('active')) updateUI();
    }, UPDATE_INTERVAL);
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

let validoBotones = true;

// Helper: create SVG icon using DOM API (no innerHTML needed)
function createSvgIcon(pathsData, size) {
  const sz = size || 24;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', String(sz));
  svg.setAttribute('height', String(sz));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  pathsData.forEach(d => {
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', d);
    if (d === 'M0 0h24v24H0z') p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });
  return svg;
}

// Helper: create a toolbar button with SVG icon
function makeToolBtn(title, id, className, paths) {
  const btn = document.createElement('button');
  btn.title = title;
  btn.type = 'button';
  if (id) btn.id = id;
  btn.className = (className ? className + ' ' : '') + 'botones_div';
  btn.appendChild(createSvgIcon(paths));
  return btn;
}

// Build YTM toolbar using pure DOM API (bypasses Trusted Types)
function buildYTMToolbar() {
  const main = document.createElement('main');
  main.className = 'yt-tools-container';

  const container = document.createElement('div');
  container.className = 'container';

  const form = document.createElement('form');
  const btnsDiv = document.createElement('div');
  btnsDiv.className = 'containerButtons';

  // Thumbnail (Image download)
  btnsDiv.appendChild(makeToolBtn('Image video', 'imagen', '', [
    'M0 0h24v24H0z', 'M15 8h.01',
    'M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5',
    'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4',
    'M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559',
    'M19 16v6', 'M22 19l-3 3l-3 -3'
  ]));

  // Repeat
  if (!isYTMusic) {
    btnsDiv.appendChild(makeToolBtn('Repeat video', 'repeatvideo', '', [
      'M0 0h24v24H0z',
      'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
      'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3'
    ]));
  }

  // Download MP4
  btnsDiv.appendChild(makeToolBtn('MP4', null, 'btn1', [
    'M0 0h24v24H0z', 'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M12 17v-6', 'M9.5 14.5l2.5 2.5l2.5 -2.5'
  ]));

  // Download MP3
  btnsDiv.appendChild(makeToolBtn('MP3', null, 'btn2', [
    'M0 0h24v24H0z', 'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M12 16l0 -5l2 1'
  ]));

  // Close
  btnsDiv.appendChild(makeToolBtn('Close', null, 'btn3', [
    'M0 0h24v24H0z',
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M10 10l4 4m0 -4l-4 4'
  ]));

  // Picture-in-Picture
  btnsDiv.appendChild(makeToolBtn('Picture to picture', null, 'video_picture_to_picture', [
    'M0 0h24v24H0z',
    'M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4',
    'M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z'
  ]));

  // Screenshot
  btnsDiv.appendChild(makeToolBtn('Screenshot video', null, 'screenshot_video', [
    'M0 0h24v24H0z', 'M15 8h.01',
    'M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644',
    'M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644',
    'M4 8v-2a2 2 0 0 1 2 -2h2', 'M4 16v2a2 2 0 0 0 2 2h2',
    'M16 4h2a2 2 0 0 1 2 2v2', 'M16 20h2a2 2 0 0 0 2 -2v-2'
  ]));

  form.appendChild(btnsDiv);

  // Download video quality select
  const videoForm = document.createElement('form');
  videoForm.className = 'formulariodescarga ocultarframe';
  const videoSelectDiv = document.createElement('div');
  videoSelectDiv.className = 'containerall';
  const videoSelect = document.createElement('select');
  videoSelect.className = 'selectcalidades ocultarframe';
  videoSelect.required = true;
  [['', 'Video Quality', true],
  ['144', '144p MP4'], ['240', '240p MP4'], ['360', '360p MP4'],
  ['480', '480p MP4'], ['720', '720p HD MP4 Default'],
  ['1080', '1080p FULL HD MP4'], ['4k', '2160p 4K WEBM'], ['8k', '4320p 8K WEBM']
  ].forEach(([val, text, dis]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (dis) { opt.selected = true; opt.disabled = true; }
    videoSelect.appendChild(opt);
  });
  videoSelectDiv.appendChild(videoSelect);

  // Download video container
  const dlVideoContainer = document.createElement('div');
  dlVideoContainer.id = 'descargando';
  dlVideoContainer.className = 'download-container ocultarframe';

  const dlInfo = document.createElement('div');
  dlInfo.className = 'download-info';
  const dlText = document.createElement('span');
  dlText.className = 'download-text';
  dlText.textContent = 'Download Video And Please Wait...';
  const dlQuality = document.createElement('span');
  dlQuality.className = 'download-quality';
  dlInfo.appendChild(dlText);
  dlInfo.appendChild(dlQuality);

  const dlActions = document.createElement('div');
  dlActions.className = 'download-actions';
  const dlBtn = document.createElement('button');
  dlBtn.className = 'download-btn video-btn';
  dlBtn.textContent = 'Download';
  const retryBtn = document.createElement('button');
  retryBtn.className = 'retry-btn';
  retryBtn.style.display = 'none';
  retryBtn.textContent = 'Retry';
  dlActions.appendChild(dlBtn);
  dlActions.appendChild(retryBtn);

  const progressC = document.createElement('div');
  progressC.className = 'progress-container';
  progressC.style.display = 'none';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressBar.appendChild(progressFill);
  const progressText = document.createElement('span');
  progressText.className = 'progress-text';
  progressText.textContent = '0%';
  progressC.appendChild(progressBar);
  progressC.appendChild(progressText);

  // progress-retry-btn and download-again-btn (required by startDownloadVideoOrAudio)
  const progRetryBtn = document.createElement('button');
  progRetryBtn.className = 'progress-retry-btn';
  progRetryBtn.title = 'Retry';
  progRetryBtn.style.display = 'none';
  progRetryBtn.textContent = '↻';
  const dlAgainBtn = document.createElement('button');
  dlAgainBtn.className = 'download-again-btn';
  dlAgainBtn.title = 'Download again';
  dlAgainBtn.style.display = 'none';
  dlAgainBtn.textContent = '⬇';

  dlVideoContainer.appendChild(progRetryBtn);
  dlVideoContainer.appendChild(dlAgainBtn);
  dlVideoContainer.appendChild(dlInfo);
  dlVideoContainer.appendChild(dlActions);
  dlVideoContainer.appendChild(progressC);
  videoSelectDiv.appendChild(dlVideoContainer);
  videoForm.appendChild(videoSelectDiv);

  // Download audio quality select
  const audioForm = document.createElement('form');
  audioForm.className = 'formulariodescargaaudio ocultarframe';
  const audioSelectDiv = document.createElement('div');
  audioSelectDiv.className = 'containerall';
  const audioSelect = document.createElement('select');
  audioSelect.className = 'selectcalidadesaudio ocultarframeaudio';
  audioSelect.required = true;
  [['', 'Audio Quality', true],
  ['flac', 'Audio FLAC UHQ'], ['wav', 'Audio WAV UHQ'],
  ['webm', 'Audio WEBM UHQ'], ['mp3', 'Audio MP3 Default'],
  ['m4a', 'Audio M4A'], ['aac', 'Audio AAC'],
  ['opus', 'Audio OPUS'], ['ogg', 'Audio OGG']
  ].forEach(([val, text, dis]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (dis) { opt.selected = true; opt.disabled = true; }
    audioSelect.appendChild(opt);
  });
  audioSelectDiv.appendChild(audioSelect);

  // Download audio container
  const dlAudioContainer = document.createElement('div');
  dlAudioContainer.id = 'descargandomp3';
  dlAudioContainer.className = 'download-container ocultarframeaudio';

  const dlInfoA = document.createElement('div');
  dlInfoA.className = 'download-info';
  const dlTextA = document.createElement('span');
  dlTextA.className = 'download-text';
  dlTextA.textContent = 'Download Audio And Please Wait...';
  const dlQualityA = document.createElement('span');
  dlQualityA.className = 'download-quality';
  dlInfoA.appendChild(dlTextA);
  dlInfoA.appendChild(dlQualityA);

  const dlActionsA = document.createElement('div');
  dlActionsA.className = 'download-actions';
  const dlBtnA = document.createElement('button');
  dlBtnA.className = 'download-btn audio-btn';
  dlBtnA.textContent = 'Download';
  const retryBtnA = document.createElement('button');
  retryBtnA.className = 'retry-btn';
  retryBtnA.style.display = 'none';
  retryBtnA.textContent = 'Retry';
  dlActionsA.appendChild(dlBtnA);
  dlActionsA.appendChild(retryBtnA);

  const progressCA = document.createElement('div');
  progressCA.className = 'progress-container';
  progressCA.style.display = 'none';
  const progressBarA = document.createElement('div');
  progressBarA.className = 'progress-bar';
  const progressFillA = document.createElement('div');
  progressFillA.className = 'progress-fill';
  progressBarA.appendChild(progressFillA);
  const progressTextA = document.createElement('span');
  progressTextA.className = 'progress-text';
  progressTextA.textContent = '0%';
  progressCA.appendChild(progressBarA);
  progressCA.appendChild(progressTextA);

  // progress-retry-btn and download-again-btn for audio
  const progRetryBtnA = document.createElement('button');
  progRetryBtnA.className = 'progress-retry-btn';
  progRetryBtnA.title = 'Retry';
  progRetryBtnA.style.display = 'none';
  progRetryBtnA.textContent = '↻';
  const dlAgainBtnA = document.createElement('button');
  dlAgainBtnA.className = 'download-again-btn';
  dlAgainBtnA.title = 'Download again';
  dlAgainBtnA.style.display = 'none';
  dlAgainBtnA.textContent = '⬇';

  dlAudioContainer.appendChild(progRetryBtnA);
  dlAudioContainer.appendChild(dlAgainBtnA);
  dlAudioContainer.appendChild(dlInfoA);
  dlAudioContainer.appendChild(dlActionsA);
  dlAudioContainer.appendChild(progressCA);
  audioSelectDiv.appendChild(dlAudioContainer);
  audioForm.appendChild(audioSelectDiv);

  const collapsible = document.createElement('div');
  collapsible.className = 'content_collapsible_colors';
  collapsible.style.marginTop = '10px';
  collapsible.appendChild(videoForm);
  collapsible.appendChild(audioForm);

  container.appendChild(form);
  container.appendChild(collapsible);
  main.appendChild(container);

  return main;
}

function renderizarButtons() {
  if (isYTMusic) {
    // YouTube Music: inject ABOVE the tab header container (Tiếp theo/Lời nhạc/Liên quan)
    const sidePanel = document.querySelector('#player-page #side-panel');
    const tabHeaders = sidePanel && sidePanel.querySelector('.tab-header-container');
    const addButton = tabHeaders || document.querySelector('#tab-renderer');

    // YTM loads lazily - if element not found, retry
    if (!addButton && validoBotones) {
      if (!renderizarButtons._ytmRetries) renderizarButtons._ytmRetries = 0;
      if (renderizarButtons._ytmRetries < 30) {
        renderizarButtons._ytmRetries++;
        setTimeout(renderizarButtons, 500);
      }
      return;
    }
    renderizarButtons._ytmRetries = 0;

    if (addButton && validoBotones) {
      validoBotones = false;
      
      const sidePanel = document.querySelector('ytmusic-player-page #side-panel');
      if (sidePanel) {
        // CREATE A COMMON WRAPPER FOR TOOLS AND TAB HEADERS (Top Box)
        let sideWrapper = $id('ytm-side-panel-wrapper');
        if (!sideWrapper) {
          sideWrapper = document.createElement('div');
          sideWrapper.id = 'ytm-side-panel-wrapper';
          sidePanel.insertBefore(sideWrapper, addButton);
        }
        
        const toolbar = buildYTMToolbar();
        sideWrapper.appendChild(toolbar);
        
        // ADD A LINE SEPARATOR
        const line = document.createElement('div');
        line.className = 'ytm-side-panel-divider';
        sideWrapper.appendChild(line);
        
        // MOVE THE TAB HEADER INTO THE TOP BOX
        sideWrapper.appendChild(addButton);
      }
    }
  } else {
    // Regular YouTube
    const addButton = document.querySelector('.style-scope .ytd-watch-metadata');
    const addButton2 = document.querySelector('#contents');

    if (addButton && validoBotones) {
      const isVisible = addButton.offsetParent !== null;

      if (isVisible) {
        validoBotones = false;
        addButton.insertAdjacentHTML('beforebegin', safeHTML(menuBotones));
      } else if (addButton2) {
        validoBotones = false;
        addButton.insertAdjacentHTML('beforebegin', safeHTML(menuBotones));
      }
    }
  }

  const formulariodescarga = $e('.formulariodescarga');
  const formulariodescargaaudio = $e('.formulariodescargaaudio');
  const btn1mp4 = $e('.btn1');
  const btn2mp3 = $e('.btn2');
  const btn3cancel = $e('.btn3');
  const selectcalidades = $e('.selectcalidades');
  const selectcalidadesaudio = $e('.selectcalidadesaudio');

  [formulariodescarga, formulariodescargaaudio].forEach(form => {
    if (!form) return;
    if (form.dataset.ytToolsPreventDefault === '1') return;
    form.addEventListener('click', e => e.preventDefault());
    form.dataset.ytToolsPreventDefault = '1';
  });

  if (selectcalidades && selectcalidades.dataset.ytToolsBound !== '1') {
    selectcalidades.dataset.ytToolsBound = '1';
    selectcalidades.addEventListener('change', e => {
      const quality = e.target.value;
      if (!quality) return; // Don't proceed if no quality selected

      const downloadContainer = $id('descargando');
      const downloadText = downloadContainer.querySelector('.download-text');
      const downloadQuality = downloadContainer.querySelector('.download-quality');
      const downloadBtn = downloadContainer.querySelector('.download-btn');
      const retryBtn = downloadContainer.querySelector('.retry-btn');
      const progressContainer = downloadContainer.querySelector('.progress-container');

      // Update UI
      downloadContainer.classList.add('video');
      downloadContainer.classList.remove('ocultarframe');
      downloadText.textContent = `Download ${quality.toUpperCase()} And Please Wait...`;
      downloadQuality.textContent = `${quality}p`;

      // Show download button, hide progress
      downloadBtn.style.display = 'block';
      retryBtn.style.display = 'none';
      progressContainer.style.display = 'none';

      // Store quality for later use
      downloadContainer.dataset.quality = quality;
      downloadContainer.dataset.type = 'video';
    });
  }

  if (selectcalidadesaudio && selectcalidadesaudio.dataset.ytToolsBound !== '1') {
    selectcalidadesaudio.dataset.ytToolsBound = '1';
    selectcalidadesaudio.addEventListener('change', e => {
      const format = e.target.value;
      if (!format) return; // Don't proceed if no format selected

      const downloadContainer = $id('descargandomp3');
      const downloadText = downloadContainer.querySelector('.download-text');
      const downloadQuality = downloadContainer.querySelector('.download-quality');
      const downloadBtn = downloadContainer.querySelector('.download-btn');
      const retryBtn = downloadContainer.querySelector('.retry-btn');
      const progressContainer = downloadContainer.querySelector('.progress-container');

      // Update UI
      downloadContainer.classList.add('audio');
      downloadContainer.classList.remove('ocultarframeaudio');
      downloadText.textContent = `Download ${format.toUpperCase()} And Please Wait...`;
      downloadQuality.textContent = format.toUpperCase();

      // Show download button, hide progress
      downloadBtn.style.display = 'block';
      retryBtn.style.display = 'none';
      progressContainer.style.display = 'none';

      // Store format for later use
      downloadContainer.dataset.quality = format;
      downloadContainer.dataset.type = 'audio';
    });
  }

  if (btn3cancel && btn3cancel.dataset.ytToolsBound !== '1') {
    btn3cancel.dataset.ytToolsBound = '1';
    btn3cancel.addEventListener('click', () => {
      // Hide all selects
      selectcalidades?.classList.add('ocultarframe');
      selectcalidadesaudio?.classList.add('ocultarframeaudio');

      // Hide all download containers
      const videoContainer = $id('descargando');
      const audioContainer = $id('descargandomp3');

      if (videoContainer) {
        videoContainer.classList.add('ocultarframe');
        videoContainer.classList.remove('video', 'audio', 'completed');
        videoContainer.removeAttribute('data-quality');
        videoContainer.removeAttribute('data-type');
        videoContainer.removeAttribute('data-downloading');
        videoContainer.removeAttribute('data-url-opened');
        videoContainer.removeAttribute('data-last-download-url');
        videoContainer.querySelector?.('.download-again-btn')?.style && (videoContainer.querySelector('.download-again-btn').style.display = 'none');
      }

      if (audioContainer) {
        audioContainer.classList.add('ocultarframeaudio');
        audioContainer.classList.remove('video', 'audio', 'completed');
        audioContainer.removeAttribute('data-quality');
        audioContainer.removeAttribute('data-type');
        audioContainer.removeAttribute('data-downloading');
        audioContainer.removeAttribute('data-url-opened');
        audioContainer.removeAttribute('data-last-download-url');
        audioContainer.querySelector?.('.download-again-btn')?.style && (audioContainer.querySelector('.download-again-btn').style.display = 'none');
      }

      // Hide all forms
      formulariodescarga?.classList.add('ocultarframe');
      formulariodescargaaudio?.classList.add('ocultarframe');

      // Reset forms
      formulariodescarga?.reset();
      formulariodescargaaudio?.reset();
    });
  }

  // Add event listeners for download buttons (only once)
  if (!__ytToolsRuntime.downloadClickHandlerInitialized) {
    __ytToolsRuntime.downloadClickHandlerInitialized = true;
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const clicked =
        target.closest('.download-btn') ||
        target.closest('.retry-btn') ||
        target.closest('.progress-retry-btn') ||
        target.closest('.download-again-btn');
      if (!clicked) return;

      const container = clicked.closest('.download-container');
      if (!container) return;

      const quality = container.dataset.quality;
      const type = container.dataset.type;
      // download-again just re-opens the last URL (no restart)
      if (clicked.classList.contains('download-again-btn')) {
        const url = container.dataset.lastDownloadUrl;
        if (url) window.open(url);
        return;
      }
      if (!quality || !type) return;

      if (clicked.classList.contains('progress-retry-btn')) {
        container.dataset.downloading = 'false';
        container.dataset.urlOpened = 'false';
        container.dataset.lastDownloadUrl = '';
        container.querySelector?.('.download-again-btn')?.style && (container.querySelector('.download-again-btn').style.display = 'none');
      }
      startDownloadVideoOrAudio(quality, container);
    });
  }



  if (btn1mp4 && btn1mp4.dataset.ytToolsBound !== '1') {
    btn1mp4.dataset.ytToolsBound = '1';
    btn1mp4.addEventListener('click', () => {
      // Show video select, hide audio select
      selectcalidades?.classList.remove('ocultarframe');
      selectcalidadesaudio?.classList.add('ocultarframeaudio');

      // Hide all download containers
      const videoContainer = $id('descargando');
      const audioContainer = $id('descargandomp3');

      if (videoContainer) {
        videoContainer.classList.add('ocultarframe');
        videoContainer.classList.remove('video', 'audio', 'completed');
        videoContainer.removeAttribute('data-quality');
        videoContainer.removeAttribute('data-type');
        videoContainer.removeAttribute('data-downloading');
        videoContainer.removeAttribute('data-url-opened');
      }

      if (audioContainer) {
        audioContainer.classList.add('ocultarframeaudio');
        audioContainer.classList.remove('video', 'audio', 'completed');
        audioContainer.removeAttribute('data-quality');
        audioContainer.removeAttribute('data-type');
        audioContainer.removeAttribute('data-downloading');
        audioContainer.removeAttribute('data-url-opened');
      }

      // Show video form
      formulariodescarga?.classList.remove('ocultarframe');
      formulariodescarga.style.display = '';
      formulariodescargaaudio?.classList.add('ocultarframe');

      // Reset forms
      formulariodescarga?.reset();
      formulariodescargaaudio?.reset();

      // On YTM: auto-select 720p and show download button immediately
      if (isYTMusic && selectcalidades) {
        selectcalidades.value = '720';
        selectcalidades.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  if (btn2mp3 && btn2mp3.dataset.ytToolsBound !== '1') {
    btn2mp3.dataset.ytToolsBound = '1';
    btn2mp3.addEventListener('click', () => {
      // Show audio select, hide video select
      selectcalidadesaudio?.classList.remove('ocultarframeaudio');
      selectcalidades?.classList.add('ocultarframe');

      // Hide all download containers
      const videoContainer = $id('descargando');
      const audioContainer = $id('descargandomp3');

      if (videoContainer) {
        videoContainer.classList.add('ocultarframe');
        videoContainer.classList.remove('video', 'audio', 'completed');
        videoContainer.removeAttribute('data-quality');
        videoContainer.removeAttribute('data-type');
        videoContainer.removeAttribute('data-downloading');
        videoContainer.removeAttribute('data-url-opened');
      }

      if (audioContainer) {
        audioContainer.classList.add('ocultarframeaudio');
        audioContainer.classList.remove('video', 'audio', 'completed');
        audioContainer.removeAttribute('data-quality');
        audioContainer.removeAttribute('data-type');
        audioContainer.removeAttribute('data-downloading');
        audioContainer.removeAttribute('data-url-opened');
      }

      // Show audio form
      formulariodescargaaudio?.classList.remove('ocultarframe');
      formulariodescargaaudio.style.display = '';
      formulariodescarga?.classList.add('ocultarframe');

      // Reset forms
      formulariodescargaaudio?.reset();
      formulariodescarga?.reset();

      // On YTM: auto-select MP3 and show download button immediately
      if (isYTMusic && selectcalidadesaudio) {
        selectcalidadesaudio.value = 'mp3';
        selectcalidadesaudio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  // Invertir contenido



  const btnImagen = $e('#imagen');

  // valido modo oscuro y venta de video
  // Repeat video button
  let countRepeat = 0; // count
  const repeat = $e('#repeatvideo'); // Repeat button
  const videoFull = isYTMusic
    ? $e('video')
    : $e('#movie_player > div.html5-video-container > video');
  if (repeat != undefined) {

    repeat.onclick = () => {
      if (
        (isYTMusic ? videoFull : $e('#cinematics > div')) != undefined ||
        videoFull != undefined
      ) {
        countRepeat += 1;
        switch (countRepeat) {
          case 1:
            const videoEl = isYTMusic ? $e('video') : document
              .querySelector('#movie_player > div.html5-video-container > video');
            videoEl?.setAttribute('loop', 'true');
            if (isYTMusic) {
              // On YTM, replace SVG icon using DOM API
              const newSvg = createSvgIcon([
                'M0 0h24v24H0z',
                'M4 12v-3c0 -1.336 .873 -2.468 2.08 -2.856m3.92 -.144h10m-3 -3l3 3l-3 3',
                'M20 12v3a3 3 0 0 1 -.133 .886m-1.99 1.984a3 3 0 0 1 -.877 .13h-13m3 3l-3 -3l3 -3',
                'M3 3l18 18'
              ]);
              repeat.replaceChildren(newSvg);
            } else {
              const imarepeat = $e('.icon-tabler-repeat');
              if (imarepeat) imarepeat.innerHTML = safeHTML(`  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 12v-3c0 -1.336 .873 -2.468 2.08 -2.856m3.92 -.144h10m-3 -3l3 3l-3 3"></path>
                    <path d="M20 12v3a3 3 0 0 1 -.133 .886m-1.99 1.984a3 3 0 0 1 -.877 .13h-13m3 3l-3 -3l3 -3"></path>
                    <path d="M3 3l18 18"></path>
                 </svg> `);
            }
            break;
          case 2:
            countRepeat = 0;
            const videoEl2 = isYTMusic ? $e('video') : document
              .querySelector('#movie_player > div.html5-video-container > video');
            videoEl2?.removeAttribute('loop');
            if (isYTMusic) {
              const newSvg2 = createSvgIcon([
                'M0 0h24v24H0z',
                'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
                'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3'
              ]);
              repeat.replaceChildren(newSvg2);
            } else {
              const imarepeat2 = $e('.icon-tabler-repeat');
              if (imarepeat2) imarepeat2.innerHTML = safeHTML(` <svg  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat" width="24"
                    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
                    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
                  </svg>`);
            }
            break;
        }
      }
    }
  }

  // Background transparent

  const cinematica = $e('#cinematics > div');
  if (cinematica != undefined) {
    cinematica.style.cssText =
      'position: fixed; inset: 0px; pointer-events: none; transform: scale(1.5, 2)';
  }

  if (btnImagen != undefined) {
    btnImagen.onclick = () => {
      if (
        $e('#cinematics > div') != undefined ||
        videoFull != undefined
      ) {
        const parametrosURL = new URLSearchParams(window.location.search);
        let enlace = parametrosURL.get('v');

        const imageUrl = `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`;

        fetch(imageUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
          })
          .then((blob) => {
            const imageSizeKB = blob.size / 1024;

            if (imageSizeKB >= 20) {
              window.open(
                `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`,
                'popUpWindow',
                'height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
              );
              const imageUrlObject = URL.createObjectURL(blob);

              const enlaceDescarga = $cl('a');
              enlaceDescarga.href = imageUrlObject;
              const titleVideo = isYTMusic
                ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
                : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
              enlaceDescarga.download = `${titleVideo}_maxresdefault.jpg`;
              enlaceDescarga.click();

              URL.revokeObjectURL(imageUrlObject);
            } else {
              console.log(
                'La imagen no excede los 20 KB. No se descargará.'
              );
            }
          })
          .catch((error) => {
            alert('No found image');
            console.error('Error al obtener la imagen:', error);
          });
      }
    };
  }
  // [REMOVED] Duplicate background image handler — handled at end of script (line ~6648+).

  const viewPictureToPicture = $e(
    '.video_picture_to_picture'
  );
  if (viewPictureToPicture != undefined) {
    viewPictureToPicture.onclick = () => {
      const video = $e('video');
      if ('pictureInPictureEnabled' in document) {
        if (!document.pictureInPictureElement) {

          video
            .requestPictureInPicture()
            .then(() => { })
            .catch((error) => {
              console.error(
                'Error al activar el modo Picture-in-Picture:',
                error
              );
            });
        } else {
          // video picture
        }
      } else {
        alert('Picture-in-Picture not supported');
      }
    };
  }
  const screenShotVideo = $e('.screenshot_video');
  if (screenShotVideo != undefined) {
    screenShotVideo.onclick = () => {
      const video = $e('video');
      const canvas = $cl('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imagenURL = canvas.toDataURL('image/png');
      const enlaceDescarga = $cl('a');
      enlaceDescarga.href = imagenURL;
      const titleVideo = isYTMusic
        ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
        : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
      enlaceDescarga.download = `${video.currentTime.toFixed(
        0
      )}s_${titleVideo}.png`;
      enlaceDescarga.click();
    };
  } else {
    const containerButtons = $e('.containerButtons');

    if (containerButtons != undefined) {
      containerButtons.innerHTML = safeHTML('');
    }
  }
  // [REMOVED] clearInterval(renderizarButtons) — was passing a function, not an interval ID.
}



console.log('Script en ejecución by: Akari');
const HEADER_STYLE = 'color: #F00; font-size: 24px; font-family: sans-serif;';
const MESSAGE_STYLE = 'color: #00aaff; font-size: 16px; font-family: sans-serif;';
const CODE_STYLE = 'font-size: 14px; font-family: monospace;';

console.log(
  '%cYoutube Tools Extension NEW UI\n' +
  '%cRun %c(v0.0.0.3)\n' +
  'By: Akari.',
  HEADER_STYLE,
  CODE_STYLE,
  MESSAGE_STYLE
);

if (!localStorage.getItem('notification-Akari')) {
  Notify('info', 'Youtube Tools by: Akari :)');
  localStorage.setItem('notification-Akari', true);
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
    } else {
      hideCanvas();
      Notify('success', 'Wave visualizer disabled realod page');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
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
  } else {
    preview.style.backgroundImage = '';
    preview.classList.remove('has-image');
    if (removeBtn) removeBtn.style.display = 'none';
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
    });
  }
}
}) ();
