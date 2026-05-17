// ===========================================
// Theme Engine — applySettings, checkDarkMode, dynamic CSS
// Extracted from legacy-full.js lines 6524-7378
// ===========================================
import { $e, $id, $sp, isYTMusic, checkDarkModeActive } from '../utils/dom.js';
import { THEMES } from './theme-data.js';
import { SETTINGS_KEY } from '../settings/storage-key.js';
import { setDynamicCss } from '../utils/runtime.js';
import { renderizarButtons } from '../ui/toolbar/index.js';
import { applyPageBackground, removePageBackground } from './page-background.js';
import { applyNonstopPlayback } from '../features/player/nonstop-playback.js';
import { applyAudioOnlyMode, getEffectiveAudioOnly } from '../features/player/audio-only.js';
import { applyBookmarksIfEnabled } from '../features/bookmarks.js';
import { setupContinueWatchingFeature } from '../features/continue-watching.js';
import { setupShortsChannelNameFeature } from '../features/shorts/shorts-channel-name.js';
import { setupLockupCachedStats } from '../features/lockup-cached-stats.js';
import { ytmAmbientMode } from '../features/ytm-ambient-mode.js';
import { readJsonGM } from '../utils/storage.js';
import {
  getMenuColors,
  syncAudioOnlyTabCheckbox,
} from '../settings/settings-dom.js';

// ---------- Helpers ----------

// Removed redundant cookie-based dark mode detection



function isWatchPage() {
  return window.location.href.includes('youtube.com/watch');
}

function applyYTMThemeVars(
  bgColor,
  textColor,
  secondaryText,
  menuBg,
  iconColor,
  raisedBg,
  progressColor,
  progressSecondary
) {
  const settings = readJsonGM(SETTINGS_KEY, {});
  const hasBgImage = !!settings.backgroundImage;
  const bgT = hasBgImage ? 'transparent' : bgColor;
  const menuBgT = hasBgImage ? 'transparent' : menuBg || bgColor;
  const raisedT = hasBgImage ? 'rgba(255,255,255,0.06)' : raisedBg || bgColor;
  const navT = hasBgImage ? 'rgba(0,0,0,0.4)' : bgColor;

  $sp('--ytmusic-general-background', bgT);
  $sp('--ytmusic-background', bgT);
  $sp('--ytmusic-color-white1', textColor);
  $sp('--ytmusic-color-white2', secondaryText || textColor);
  $sp('--ytmusic-color-white3', secondaryText || textColor);
  $sp('--ytmusic-color-white4', secondaryText || textColor);
  $sp('--ytmusic-player-bar-background', raisedT);
  $sp('--ytmusic-nav-bar-background', navT);
  $sp('--ytmusic-search-background', menuBgT);
  $sp('--yt-spec-general-background-a', bgT);
  $sp('--yt-spec-general-background-b', bgT);
  $sp('--yt-spec-general-background-c', bgT);

  if (progressColor) {
    $sp('--paper-slider-active-color', progressColor);
    $sp('--paper-slider-knob-color', progressColor);
    $sp('--paper-progress-active-color', progressColor);
  }
  if (progressSecondary) {
    $sp('--paper-slider-secondary-color', progressSecondary);
    $sp('--paper-progress-secondary-color', progressSecondary);
  }

  // Apply background image for YouTube Music - defer to main applySettings function
  // This will be handled in the main applySettings function where addCss is available
}

function initYTMHeaderScroll() {
  if (!isYTMusic || window.__ytToolsYTMScrollInit) return;
  window.__ytToolsYTMScrollInit = true;
  const layoutEl = document.querySelector('#layout');
  if (!layoutEl) return;
  layoutEl.addEventListener(
    'scroll',
    () => {
      const nav = document.querySelector('ytmusic-nav-bar');
      if (nav) {
        if (layoutEl.scrollTop > 10) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }
    },
    { passive: true }
  );
}

// ---------- Core ----------

/**
 * Read current toggle/select/slider values from panel DOM and save.
 */

/**
 * Read settings from GM storage and apply to panel DOM.
 */

/**
 * Main applySettings — reads all toggle states, applies features + theme.
 */
export function applySettings() {
  // Hide download forms
  const f1 = $e('.formulariodescarga');
  const f2 = $e('.formulariodescargaaudio');
  if (f1) f1.classList.add('ocultarframe');
  if (f2) f2.classList.add('ocultarframe');

  const settings = {
    theme: $e('input[name="theme"]:checked')?.value || '0',
    bgColorPicker: $id('bg-color-picker')?.value || '#000000',
    progressbarColorPicker: $id('progressbar-color-picker')?.value || '#ff0000',
    primaryColorPicker: $id('primary-color-picker')?.value || '#ffffff',
    secondaryColorPicker: $id('secondary-color-picker')?.value || '#ffffff',
    headerColorPicker: $id('header-color-picker')?.value || '#000',
    iconsColorPicker: $id('icons-color-picker')?.value || '#ffffff',
    menuColorPicker: $id('menu-color-picker')?.value || '#000',
    lineColorPicker: $id('line-color-picker')?.value || '#ff0000',
    timeColorPicker: $id('time-color-picker')?.value || '#ffffff',
    dislikes: $id('dislikes-toggle')?.checked || false,
    likeDislikeBar: $id('like-dislike-bar-toggle')?.checked || false,
    bookmarks: $id('bookmarks-toggle')?.checked || false,
    continueWatching: $id('continue-watching-toggle')?.checked || false,
    shortsChannelName: $id('shorts-channel-name-toggle')?.checked || false,
    nonstopPlayback: $id('nonstop-playback-toggle')?.checked ?? true,
    audioOnly: $id('audio-only-toggle')?.checked || false,
    themes: $id('themes-toggle')?.checked || false,
    translation: $id('translation-toggle')?.checked || false,
    avatars: $id('avatars-toggle')?.checked || false,
    reverseMode: $id('reverse-mode-toggle')?.checked || false,
    waveVisualizer: $id('wave-visualizer-toggle')?.checked || false,
    hideComments: $id('hide-comments-toggle')?.checked || false,
    hideSidebar: $id('hide-sidebar-toggle')?.checked || false,
    disableAutoplay: $id('autoplay-toggle')?.checked || false,
    cinematicLighting: $id('cinematic-lighting-toggle')?.checked || false,
    syncCinematic: $id('sync-cinematic-toggle')?.checked || false,
    sidePanelStyle: $id('side-panel-style-select')?.value || 'blur',
    playerSize: $id('player-size-slider')?.value || 100,
    selectVideoQuality: $id('select-video-qualitys-select')?.value || 'user',
    menu_developermdcm: {
      bg: getMenuColors().bg,
      color: getMenuColors().text,
      accent: getMenuColors().accent,
    },
  };

  // backgroundImage is not a DOM element — read it from GM storage
  const stored = readJsonGM(SETTINGS_KEY, {});
  if (stored.backgroundImage) settings.backgroundImage = stored.backgroundImage;

  $sp('--yt-enhance-menu-bg', getMenuColors().bg);
  $sp('--yt-enhance-menu-text', getMenuColors().text);
  $sp('--yt-enhance-menu-accent', getMenuColors().accent);

  renderizarButtons();
  applyNonstopPlayback(settings.nonstopPlayback);
  syncAudioOnlyTabCheckbox();
  applyAudioOnlyMode(getEffectiveAudioOnly(settings));

  // Side Panel Style / Background Glass Style
  if (isYTMusic) {
    document.body.classList.remove('ytm-style-blur', 'ytm-style-liquid', 'ytm-style-transparent');
    document.body.classList.add(`ytm-style-${settings.sidePanelStyle || 'blur'}`);
  } else {
    document.body.classList.remove('yt-style-blur', 'yt-style-liquid', 'yt-style-transparent');
    document.body.classList.add(`yt-style-${settings.sidePanelStyle || 'blur'}`);
  }

  // Hide comments
  if (!isYTMusic) {
    const cs = $id('comments');
    if (cs) cs.style.display = settings.hideComments ? 'none' : 'block';
  }

  // Themes section visibility
  const ts = $e('.themes-hidden');
  if (ts) ts.style.display = settings.themes ? 'block' : 'none';

  // Hide sidebar
  if (!isYTMusic) {
    const ss = $e('#secondary > #secondary-inner');
    if (ss) {
      ss.classList.add('side-moi');
      ss.style.display = settings.hideSidebar ? 'none' : 'block';
    }
  }

  // Disable autoplay
  if (!isYTMusic) {
    const at = $e('.ytp-autonav-toggle-button');
    if (at) {
      const on = at.getAttribute('aria-checked') === 'true';
      if (settings.disableAutoplay && on) at.click();
      else if (!settings.disableAutoplay && !on) at.click();
    }
  }

  // Cinematic/Ambient
  if (isYTMusic) {
    if (settings.cinematicLighting && isWatchPage()) {
      setTimeout(() => ytmAmbientMode.setup(), 800);
    } else {
      ytmAmbientMode.cleanup();
    }
  }

  // Player size
  const video = $e('video');
  if (video) {
    const pct = Math.max(50, Math.min(150, Number(settings.playerSize) || 100));
    video.style.transform = `scale(${pct / 100})`;
    video.style.transformOrigin = 'center center';
  }

  // Build dynamic CSS
  const isDarkMode = checkDarkModeActive() ? 'dark' : 'light';
  const selectedTheme = THEMES[settings.theme] || THEMES[0] || {};
  const isThemeCustom = $e('input[name="theme"][value="custom"]')?.checked;
  const dynamicCssArray = [];
  const addCss = css => {
    if (css) dynamicCssArray.push(css);
  };

  // Theme custom/normal toggle UI
  const themeCustomOpts = $e('.theme-custom-options');
  const themeNormal = $e('.theme-selected-normal');
  const to = $e('.themes-options');
  const themesHidden = $e('.themes-hidden');

  // Show/hide themes section based on toggle
  if (themesHidden) {
    themesHidden.style.display = settings.themes ? 'block' : 'none';
  }

  if (isThemeCustom) {
    if (themeNormal) themeNormal.style.display = 'flex';
    if (themeCustomOpts) themeCustomOpts.style.display = 'flex';
    if (to) to.style.display = 'none';
  } else {
    if (themeNormal) themeNormal.style.display = 'none';
    if (themeCustomOpts) themeCustomOpts.style.display = 'none';
    if (to) to.style.display = 'block';
  }

  // Smooth theme transition
  document.body.classList.add('transition-theme');
  setTimeout(() => document.body.classList.remove('transition-theme'), 400);

  if (settings.themes && isDarkMode === 'dark' && !isThemeCustom) {
    // Apply selected preset theme
    $sp('--yt-spec-base-background', selectedTheme.gradient);
    $sp('--yt-spec-text-primary', selectedTheme.textColor);
    $sp('--yt-spec-text-secondary', selectedTheme.textColor);
    $sp('--yt-spec-menu-background', selectedTheme.gradient);
    $sp('--yt-spec-icon-inactive', selectedTheme.textColor);
    $sp('--yt-spec-raised-background', selectedTheme.raised);
    $sp('--yt-spec-static-brand-red', selectedTheme.CurrentProgressVideo);
    $sp('--yt-spec-brand-icon-active', selectedTheme.textColor);
    $sp('--yt-spec-brand-icon-inactive', selectedTheme.textColor + '80');
    $sp('--yt-spec-icon-active-other', selectedTheme.textColor);
    addCss(`#background.ytd-masthead { background: ${selectedTheme.gradient} !important; }`);
    addCss(`.ytp-swatch-background-color { background: ${selectedTheme.gradient} !important; }`);
    addCss(
      `.botones_div { background-color: transparent; border: none; color: #999 !important; user-select: none; }`
    );
    addCss(`ytd-shorts[is-shorts] #cinematics { display: none !important; }`);

    if (isYTMusic) {
      let sliderColor = selectedTheme.CurrentProgressVideo;
      const colors = selectedTheme.gradient?.match(/#[0-9a-fA-F]{3,6}/g);
      if (colors?.length) sliderColor = colors[colors.length - 1];
      applyYTMThemeVars(
        selectedTheme.gradient,
        selectedTheme.textColor,
        selectedTheme.textColor,
        selectedTheme.gradient,
        selectedTheme.colorIcons,
        selectedTheme.raised,
        sliderColor,
        sliderColor + '80'
      );
      initYTMHeaderScroll();
    }
  } else if (settings.themes && isDarkMode === 'dark' && isThemeCustom) {
    // Apply custom theme colors
    $sp('--yt-spec-base-background', settings.bgColorPicker);
    $sp('--yt-spec-text-primary', settings.primaryColorPicker);
    $sp('--yt-spec-text-secondary', settings.secondaryColorPicker);
    $sp('--yt-spec-menu-background', settings.menuColorPicker);
    $sp('--yt-spec-icon-inactive', settings.iconsColorPicker);
    $sp('--yt-spec-raised-background', settings.headerColorPicker);
    $sp('--yt-spec-static-brand-red', settings.lineColorPicker);
    $sp('--yt-spec-brand-icon-active', settings.primaryColorPicker);
    $sp('--yt-spec-brand-icon-inactive', settings.secondaryColorPicker);
    $sp('--yt-spec-icon-active-other', settings.iconsColorPicker);
    $sp('--ytd-searchbox-background', settings.menuColorPicker);
    $sp('--ytd-searchbox-text-color', settings.primaryColorPicker);
    $sp('--ytd-searchbox-border-color', settings.primaryColorPicker + '30');
    // Navbar color handled separately - remove auto-application
    addCss(
      `.ytp-swatch-background-color { background: ${settings.progressbarColorPicker} !important; }`
    );
    addCss(
      `.botones_div { background-color: transparent; border: none; color: ${settings.iconsColorPicker} !important; user-select: none; }`
    );
    addCss(`ytd-shorts[is-shorts] #cinematics { display: none !important; }`);

    if (isYTMusic) {
      applyYTMThemeVars(
        settings.bgColorPicker,
        settings.primaryColorPicker,
        settings.secondaryColorPicker,
        settings.menuColorPicker,
        settings.iconsColorPicker,
        settings.headerColorPicker,
        settings.progressbarColorPicker,
        settings.progressbarColorPicker + '80'
      );
      initYTMHeaderScroll();
    }
  } else if (!settings.themes) {
    // Cleanup ALL theme vars completely
    const props = [
      '--yt-spec-base-background',
      '--yt-spec-text-primary',
      '--yt-spec-text-secondary',
      '--yt-spec-menu-background',
      '--yt-spec-icon-inactive',
      '--yt-spec-raised-background',
      '--yt-spec-static-brand-red',
      '--yt-spec-static-brand-white',
      '--yt-spec-brand-icon-active',
      '--yt-spec-brand-icon-inactive',
      '--yt-spec-icon-active-other',
      '--ytd-searchbox-background',
      '--ytd-searchbox-text-color',
      '--ytd-searchbox-border-color',
      '--yt-enhance-menu-bg',
      '--yt-enhance-menu-text',
      '--yt-enhance-menu-accent',
    ];
    props.forEach(p => document.documentElement.style.removeProperty(p));
    addCss(
      `.botones_div { background-color: transparent; border: none; color: #ccc !important; user-select: none; }`
    );
    // Remove background image when themes is off
    removePageBackground();
  }

  // Reverse mode + sidebar CSS
  if (!isYTMusic) {
    if (settings.reverseMode) {
      addCss(
        `#columns.style-scope.ytd-watch-flexy { flex-direction: row-reverse !important; padding-left: 20px !important; }`
      );
    }
    if (settings.hideSidebar) {
      addCss(`#secondary.style-scope.ytd-watch-flexy { display: none !important; }`);
    }
  }

  addCss(`#icon-menu-settings { color: ${settings.iconsColorPicker || '#fff'} !important; }`);

  // Apply custom page background with blur effect
  if (settings.backgroundImage) {
    console.log('[YT Tools] Applying custom page background:', isYTMusic ? 'YouTube Music' : 'YouTube');
    const themeColor = settings.themes && isDarkMode === 'dark' && !isThemeCustom
      ? selectedTheme.gradient
      : null;
    applyPageBackground(settings.backgroundImage, themeColor);
  } else {
    removePageBackground();
  }

  // Apply advanced theme CSS
  applyAdvancedThemeCSS(selectedTheme, settings, addCss);

  // YT sidebar theme - handle both preset and custom themes
  if (!isYTMusic && settings.themes && isDarkMode === 'dark') {
    const sidebarBg = isThemeCustom
      ? (settings.headerColorPicker || settings.bgColorPicker)
      : (selectedTheme.glassBg || selectedTheme.gradient);
    const sidebarBlur = isThemeCustom ? '24px' : (selectedTheme.glassBlur || '24px');
    addCss(`
      ytd-guide-renderer,
      ytd-guide-renderer #guide-content,
      ytd-guide-renderer #guide-wrapper,
      ytd-guide-renderer #guide-inner-content,
      ytd-guide-renderer #sections,
      ytd-guide-renderer ytd-guide-section-renderer,
      ytd-guide-renderer #items,
      ytd-mini-guide-renderer,
      ytd-app > #header,
      ytd-app > #header ytd-topbar-logo-renderer,
      #secondary-inner {
        background: linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.75)), ${sidebarBg} !important;
        backdrop-filter: blur(${sidebarBlur}) saturate(1.2) !important;
        -webkit-backdrop-filter: blur(${sidebarBlur}) saturate(1.2) !important;
      }
      ytd-guide-entry-renderer,
      ytd-guide-collapsible-entry-renderer,
      ytd-guide-section-renderer #header {
        background: transparent !important;
      }
      ytd-guide-renderer #sections,
      ytd-guide-renderer #guide-inner-content {
        scrollbar-width: thin !important;
        overflow-y: overlay !important;
      }
    `);
  }

  setDynamicCss(dynamicCssArray.join('\n'));

  // Apply features
  applyBookmarksIfEnabled(settings);
  setupContinueWatchingFeature(settings.continueWatching);
  if (!isYTMusic) {
    setupShortsChannelNameFeature(settings.shortsChannelName);
    setupLockupCachedStats();
  }

  // Don't auto-save here — saveSettingsFromDOM() reads DOM values which may
  // not be populated from storage yet (loadSettingsToDOM runs with setTimeout).
  // It is called by user interaction events in settings-panel/events.js instead.
}

// Advanced Theme CSS Application
function applyAdvancedThemeCSS(selectedTheme, settings, addCss) {
  const hasBgImage = !!settings.backgroundImage;
  const isDarkMode = checkDarkModeActive() ? 'dark' : 'light';

  // Only apply theme CSS when themes is enabled AND dark mode is active
  const shouldApplyTheme = settings.themes && isDarkMode === 'dark';

  // YouTube-specific advanced CSS
  if (!isYTMusic) {
    if (hasBgImage) {
      addCss(`
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
      `);
    }
    addCss(`
      /* Completely hide the cinematic glow in shorts if it's causing black blocks */
      #cinematic-container.ytd-reel-video-renderer,
      #shorts-cinematic-container,
      #cinematic-shorts-scrim.ytd-shorts {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
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
    `);

    // Only apply major component backgrounds if themes are enabled and we have a gradient
    if (shouldApplyTheme && selectedTheme.gradient) {
      addCss(`
        /* Use theme colors on major components without breaking layout */
        #masthead-container.ytd-app,
        #background.ytd-masthead,
        ytd-masthead,
        #container.ytd-masthead,
        #masthead-container.ytd-app #masthead.ytd-masthead {
          background: ${selectedTheme.gradient} !important;
        }

        /* Sidebar & Guide handled in main applySettings */

        /* Restore the 'frosted-glass' look but with the theme gradient */
        #frosted-glass.ytd-app {
          background: ${selectedTheme.gradient} !important;
          opacity: 0.8 !important;
        }

        ytd-engagement-panel-section-list-renderer { 
          background: ${selectedTheme.gradient} !important; 
          backdrop-filter: blur(12px) !important; 
        }
        ytd-engagement-panel-title-header-renderer[shorts-panel] #header.ytd-engagement-panel-title-header-renderer {
          background: ${selectedTheme.gradient}  !important;
        }
      `);
    }

    if (shouldApplyTheme) {
      addCss(`
        .buttons-tranlate {
          background: ${selectedTheme.btnTranslate || selectedTheme.accent || 'rgba(255,255,255,0.1)'} !important;
        }
        .badge-shape-wiz--thumbnail-default {
          color: ${selectedTheme.videoDuration || selectedTheme.primary || '#fff'} !important;
          background: ${selectedTheme.gradient || 'rgba(0,0,0,0.6)'} !important;
        }
        #logo-icon {
          color: ${selectedTheme.textLogo || selectedTheme.primary || 'inherit'} !important;
        }
        .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text {
          color: ${selectedTheme.colorIcons || selectedTheme.primary || 'inherit'} !important;
        }
        .ytd-topbar-menu-button-renderer #button.ytd-topbar-menu-button-renderer {
          color: ${selectedTheme.colorIcons || selectedTheme.primary || 'inherit'} !important;
        }
        .yt-spec-icon-badge-shape--style-overlay .yt-spec-icon-badge-shape__icon {
          color: ${selectedTheme.colorIcons || selectedTheme.primary || 'inherit'} !important;
        }
        .ytp-svg-fill {
          fill: ${selectedTheme.colorIcons || selectedTheme.primary || 'inherit'} !important;
        }
        #ytp-id-30,#ytp-id-17,#ytp-id-19,#ytp-id-20{
          fill: ${selectedTheme.colorIcons || selectedTheme.primary || 'inherit'} !important;
        }
      `);
    }

    console.log('[YT Tools] Advanced YouTube CSS applied');
  }

  // YouTube Music-specific advanced CSS
  if (isYTMusic) {
    const ytmSliderSolidColor = selectedTheme.progress || selectedTheme.accent || selectedTheme.CurrentProgressVideo || '#ff0000';
    const bgOrGradient = shouldApplyTheme ? selectedTheme.gradient : (hasBgImage ? 'transparent' : '#030303');

    addCss(`
      html, body, ytmusic-app {
        background-color: ${hasBgImage ? 'transparent' : '#030303'} !important;
        background-image: ${hasBgImage ? 'none' : bgOrGradient} !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: fixed !important;
      }
      ytmusic-player-bar {
        background: ${hasBgImage ? 'transparent' : bgOrGradient} !important;
        ${hasBgImage && shouldApplyTheme ? 'backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;' : ''}
      }
      ytmusic-nav-bar {
        background: ${shouldApplyTheme ? selectedTheme.gradient : 'transparent'} !important;
        ${hasBgImage && shouldApplyTheme ? 'backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;' : ''}
        transition: background 0.4s ease-in-out !important;
      }
      ytmusic-search-box #input-box { background: ${shouldApplyTheme ? selectedTheme.gradient : 'transparent'} !important; }
      
      ytmusic-browse-response,
      ytmusic-header-renderer,
      ytmusic-tabbed-browse-renderer,
      ytmusic-detail-header-renderer,
      ytmusic-section-list-renderer,
      ytmusic-carousel-shelf-renderer,
      ytmusic-grid-renderer,
      ytmusic-item-section-renderer,
      #content.ytmusic-app,
      #shorts-container, ytd-shorts, #shorts-inner-container, ytd-reel-player-overlay, #overlay.ytd-reel-video-renderer, ytmusic-app-layout, ytmusic-browse-response #background, ytmusic-browse-response .background, ytmusic-app-layout #background, ytmusic-immersive-header-renderer, ytmusic-card-shelf-renderer, ytmusic-chip-cloud-chip-renderer, ytmusic-chip-cloud-renderer, ytmusic-player-page, ytmusic-player-page #background { background: transparent !important; }

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
      ytmusic-header-renderer [id="background"], #guide-spacer {
        background: transparent !important;
        background-image: none !important;
      }
      /* Only hide the immersive background if we have a custom background image */
      ${hasBgImage ? '.immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] { display: none !important; }' : ''}

      #layout { background: transparent !important; }
      .content.ytmusic-player-page { background: transparent !important; }
    `);

    if (shouldApplyTheme) {
      addCss(`
        ytmusic-player-bar .title, ytmusic-player-bar .byline {
          color: ${selectedTheme.textColor || 'inherit'} !important;
        }
        .ytmusic-player-bar .yt-spec-icon-shape, .ytmusic-player-bar svg {
          color: ${selectedTheme.colorIcons || selectedTheme.textColor || 'inherit'} !important;
          fill: ${selectedTheme.colorIcons || selectedTheme.textColor || 'inherit'} !important;
        }
        #progress-bar {
          --paper-slider-active-color: ${ytmSliderSolidColor} !important;
          --paper-slider-knob-color: ${ytmSliderSolidColor} !important;
          --paper-slider-secondary-color: ${ytmSliderSolidColor}80 !important;
          --paper-slider-container-color: rgba(255, 255, 255, 0.15) !important;
        }

        /* Sidebar & Guide - Apply theme gradient with glass effect */
        tp-yt-app-drawer,
        tp-yt-app-drawer #contentContainer,
        #guide-wrapper.ytmusic-app-layout,
        #guide-content,
        #guide-spacer,
        ytmusic-guide-renderer,
        #mini-guide-background,
        #mini-guide,
        #mini-guide-renderer,
        body.ytm-ambient-active #mini-guide-renderer {
          background: linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.75)), ${selectedTheme.glassBg || selectedTheme.gradient} !important;
          backdrop-filter: blur(${selectedTheme.glassBlur || '24px'}) saturate(1.2) !important;
          -webkit-backdrop-filter: blur(${selectedTheme.glassBlur || '24px'}) saturate(1.2) !important;
        }

        /* Nested guide elements transparent to avoid stacking */
        #guide-wrapper.ytmusic-app-layout #items,
        ytmusic-guide-section-renderer #items,
        ytmusic-guide-section-renderer[is-collapsed],
        ytmusic-guide-entry-renderer,
        tp-yt-paper-item.ytmusic-guide-entry-renderer {
          background: transparent !important;
        }
      `);
    }

    console.log('[YT Tools] Advanced YouTube Music CSS applied');
  }
}

// Export menu color state for settings panel events
