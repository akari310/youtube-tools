// ===========================================
// Theme Engine — applySettings, checkDarkMode, dynamic CSS
// Extracted from legacy-full.js lines 6524-7378
// ===========================================
import { $e, $id, $m, $sp, isYTMusic } from '../utils/dom.js';
import { THEMES } from './theme-data.js';
import { SETTINGS_KEY } from '../config/settings-key.js';
import { setDynamicCss, __ytToolsRuntime } from '../utils/runtime.js';
import { renderizarButtons } from '../ui/toolbar.js';
import { applyNonstopPlayback } from '../features/nonstop-playback.js';
import { applyAudioOnlyMode, getEffectiveAudioOnly } from '../features/audio-only.js';
import { applyBookmarksIfEnabled } from '../features/bookmarks.js';
import { setupContinueWatchingFeature } from '../features/continue-watching.js';
import { setupShortsChannelNameFeature } from '../features/shorts-channel-name.js';
import { setupLockupCachedStats } from '../features/lockup-cached-stats.js';
import { ytmAmbientMode } from '../features/ytm-ambient-mode.js';

let selectedBgColor = '#252525';
let selectedTextColor = '#ffffff';
let selectedBgAccentColor = '#ff0000';

// ---------- Helpers ----------

function checkDarkModeActive() {
  if (isYTMusic) return 'dark';
  const prefCookie = document.cookie.split('; ').find(c => c.startsWith('PREF='));
  if (!prefCookie) return 'light';
  const params = new URLSearchParams(prefCookie.substring(5));
  const f6Value = params.get('f6');
  return ['400', '4000000', '40000400', '40000000'].includes(f6Value) ? 'dark' : 'light';
}

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
  const hasBgImage = !!localStorage.getItem('backgroundImage');
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

function syncAudioOnlyTabCheckbox() {
  const tabToggle = $id('audio-only-tab-toggle');
  if (!tabToggle) return;
  const key = 'ytAudioOnlyTab_' + (window.__ytTabId || '0');
  try {
    tabToggle.checked = GM_getValue(key, false);
  } catch {
    /* */
  }
}

// ---------- Core ----------

/**
 * Read current toggle/select/slider values from panel DOM and save.
 */
export function saveSettings() {
  const s = {
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
    nonstopPlayback: $id('nonstop-playback-toggle') ? $id('nonstop-playback-toggle').checked : true,
    audioOnly: $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false,
    themes: $id('themes-toggle')?.checked || false,
    translation: $id('translation-toggle')?.checked || false,
    avatars: $id('avatars-toggle')?.checked || false,
    reverseMode: $id('reverse-mode-toggle')?.checked || false,
    waveVisualizer: $id('wave-visualizer-toggle')?.checked || false,
    waveVisualizerSelected: $id('select-wave-visualizer-select')?.value || 'dinamica',
    hideComments: $id('hide-comments-toggle')?.checked || false,
    hideSidebar: $id('hide-sidebar-toggle')?.checked || false,
    disableAutoplay: $id('autoplay-toggle')?.checked || false,
    cinematicLighting: $id('cinematic-lighting-toggle')?.checked || false,
    syncCinematic: $id('sync-cinematic-toggle')?.checked || false,
    sidePanelStyle: $id('side-panel-style-select')?.value || 'blur',
    customTimelineColor: $id('custom-timeline-color-toggle')?.checked || false,
    playerSize: $id('player-size-slider')?.value || 100,
    selectVideoQuality: $id('select-video-qualitys-select')?.value || 'user',
    languagesComments: $id('select-languages-comments-select')?.value || 'en',
    menu_akari: { bg: selectedBgColor, color: selectedTextColor, accent: selectedBgAccentColor },
  };
  GM_setValue(SETTINGS_KEY, JSON.stringify(s));
}

/**
 * Read settings from GM storage and apply to panel DOM.
 */
export function loadSettingsToDOM() {
  const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
  __ytToolsRuntime.settingsLoaded = true;

  if (settings.theme) {
    const radio = $e(`input[name="theme"][value="${settings.theme}"]`);
    if (radio) radio.checked = true;
  }

  const menuData = settings.menu_akari ||
    settings.menu_developermdcm || { bg: '#252525', color: '#ffffff', accent: '#ff0000' };

  const setVal = (id, val) => {
    const el = $id(id);
    if (el) el.value = val;
  };
  const setChk = (id, val) => {
    const el = $id(id);
    if (el) el.checked = val;
  };

  setVal('bg-color-picker', settings.bgColorPicker || '#000000');
  setVal('progressbar-color-picker', settings.progressbarColorPicker || '#ff0000');
  setVal('primary-color-picker', settings.primaryColorPicker || '#ffffff');
  setVal('secondary-color-picker', settings.secondaryColorPicker || '#ffffff');
  setVal('header-color-picker', settings.headerColorPicker || '#000');
  setVal('icons-color-picker', settings.iconsColorPicker || '#ffffff');
  setVal('menu-color-picker', settings.menuColorPicker || '#000');
  setVal('line-color-picker', settings.lineColorPicker || '#ff0000');
  setVal('time-color-picker', settings.timeColorPicker || '#ffffff');

  setChk('dislikes-toggle', settings.dislikes || false);
  setChk('like-dislike-bar-toggle', settings.likeDislikeBar || false);
  setChk('bookmarks-toggle', settings.bookmarks || false);
  setChk('continue-watching-toggle', settings.continueWatching || false);
  setChk('shorts-channel-name-toggle', settings.shortsChannelName || false);
  if ($id('nonstop-playback-toggle'))
    $id('nonstop-playback-toggle').checked = settings.nonstopPlayback !== false;
  if ($id('audio-only-toggle')) $id('audio-only-toggle').checked = settings.audioOnly || false;
  syncAudioOnlyTabCheckbox();
  setChk('themes-toggle', settings.themes || false);
  setChk('translation-toggle', settings.translation || false);
  setChk('avatars-toggle', settings.avatars || false);
  setChk('reverse-mode-toggle', settings.reverseMode || false);
  setChk('wave-visualizer-toggle', settings.waveVisualizer || false);
  setVal('select-wave-visualizer-select', settings.waveVisualizerSelected || 'dinamica');
  setChk('hide-comments-toggle', settings.hideComments || false);
  setChk('hide-sidebar-toggle', settings.hideSidebar || false);
  setChk('autoplay-toggle', settings.disableAutoplay || false);
  setChk('cinematic-lighting-toggle', settings.cinematicLighting || false);
  if ($id('sync-cinematic-toggle'))
    $id('sync-cinematic-toggle').checked = settings.syncCinematic || false;
  if ($id('side-panel-style-select'))
    $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';
  if ($id('custom-timeline-color-toggle'))
    $id('custom-timeline-color-toggle').checked = settings.customTimelineColor || false;
  setVal('player-size-slider', settings.playerSize || 100);
  setVal('select-video-qualitys-select', settings.selectVideoQuality || 'user');
  setVal('select-languages-comments-select', settings.languagesComments || 'en');

  selectedBgColor = menuData.bg;
  selectedTextColor = menuData.color;
  selectedBgAccentColor = menuData.accent;

  $m('#bg-color-options .color-box').forEach(el =>
    el.classList.toggle('selected', el.dataset.value === selectedBgColor)
  );
  $m('#text-color-options .color-box').forEach(el =>
    el.classList.toggle('selected', el.dataset.value === selectedTextColor)
  );
  $m('#bg-accent-color-options .color-box').forEach(el =>
    el.classList.toggle('selected', el.dataset.value === selectedBgAccentColor)
  );

  $sp('--yt-enhance-menu-bg', selectedBgColor);
  $sp('--yt-enhance-menu-text', selectedTextColor);
  $sp('--yt-enhance-menu-accent', selectedBgAccentColor);

  const sizeLabel = $id('player-size-value');
  if (sizeLabel) sizeLabel.textContent = $id('player-size-slider')?.value || '100';

  setTimeout(() => applySettings(), 500);
}

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
    customTimelineColor: $id('custom-timeline-color-toggle')?.checked || false,
    playerSize: $id('player-size-slider')?.value || 100,
    selectVideoQuality: $id('select-video-qualitys-select')?.value || 'user',
    menu_developermdcm: {
      bg: selectedBgColor,
      color: selectedTextColor,
      accent: selectedBgAccentColor,
    },
  };

  $sp('--yt-enhance-menu-bg', selectedBgColor);
  $sp('--yt-enhance-menu-text', selectedTextColor);
  $sp('--yt-enhance-menu-accent', selectedBgAccentColor);

  renderizarButtons();
  applyNonstopPlayback(settings.nonstopPlayback);
  syncAudioOnlyTabCheckbox();
  applyAudioOnlyMode(getEffectiveAudioOnly(settings));

  // Side Panel Style
  if (isYTMusic) {
    document.body.classList.remove('ytm-style-blur', 'ytm-style-liquid', 'ytm-style-transparent');
    document.body.classList.add(`ytm-style-${settings.sidePanelStyle || 'blur'}`);
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
  const isDarkMode = checkDarkModeActive();
  const selectedTheme = THEMES[settings.theme] || THEMES[0] || {};
  const isThemeCustom = $e('input[name="theme"][value="custom"]')?.checked;
  const dynamicCssArray = [];
  const addCss = css => {
    if (css) dynamicCssArray.push(css);
  };

  if (settings.customTimelineColor) {
    addCss(
      `.ytp-swatch-background-color { background: linear-gradient(135deg, #4c1d95, #8b5cf6) !important; }`
    );
    if (isYTMusic) {
      addCss(
        `#progress-bar { --paper-slider-active-color: #8b5cf6 !important; --paper-slider-knob-color: #8b5cf6 !important; }`
      );
    }
  }

  // Theme custom/normal toggle UI
  const themeCustomOpts = $e('.theme-custom-options');
  const themeNormal = $e('.theme-selected-normal');
  const to = $e('.themes-options');
  if (isThemeCustom) {
    if (themeNormal) themeNormal.style.display = 'flex';
    if (themeCustomOpts) themeCustomOpts.style.display = 'flex';
    if (to) to.style.display = 'none';
  } else {
    if (themeNormal) themeNormal.style.display = 'none';
    if (themeCustomOpts) themeCustomOpts.style.display = 'none';
    if (to) to.style.display = 'block';
  }

  if (settings.themes && isDarkMode === 'dark' && !isThemeCustom) {
    // Apply selected preset theme
    $sp('--yt-spec-base-background', selectedTheme.gradient);
    $sp('--yt-spec-text-primary', selectedTheme.textColor);
    $sp('--yt-spec-text-secondary', selectedTheme.textColor);
    $sp('--yt-spec-menu-background', selectedTheme.gradient);
    $sp('--yt-spec-icon-inactive', selectedTheme.textColor);
    $sp('--yt-spec-raised-background', selectedTheme.raised);
    $sp('--yt-spec-static-brand-red', selectedTheme.CurrentProgressVideo);
    addCss(`#background.ytd-masthead { background: ${selectedTheme.gradient} !important; }`);
    addCss(`.ytp-swatch-background-color { background: ${selectedTheme.gradient} !important; }`);
    addCss(
      `.botones_div { background-color: transparent; border: none; color: #999 !important; user-select: none; }`
    );

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
    addCss(`#background.ytd-masthead { background: ${settings.headerColorPicker} !important; }`);
    addCss(
      `.ytp-swatch-background-color { background: ${settings.progressbarColorPicker} !important; }`
    );
    addCss(
      `.botones_div { background-color: transparent; border: none; color: ${settings.iconsColorPicker} !important; user-select: none; }`
    );

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
    // Cleanup theme vars
    const props = [
      '--yt-spec-base-background',
      '--yt-spec-text-primary',
      '--yt-spec-text-secondary',
      '--yt-spec-menu-background',
      '--yt-spec-icon-inactive',
      '--yt-spec-raised-background',
      '--yt-spec-static-brand-red',
      '--yt-spec-static-brand-white',
    ];
    props.forEach(p => document.documentElement.style.removeProperty(p));
    addCss(
      `.botones_div { background-color: transparent; border: none; color: #ccc !important; user-select: none; }`
    );
  }

  // Reverse mode + sidebar CSS
  if (!isYTMusic) {
    addCss(
      `#columns.style-scope.ytd-watch-flexy { flex-direction: ${settings.reverseMode ? 'row-reverse' : 'row'} !important; padding-left: ${settings.reverseMode ? '20px' : '0'} !important; }`
    );
    addCss(
      `#secondary.style-scope.ytd-watch-flexy { display: ${settings.hideSidebar ? 'none' : 'block'} !important; }`
    );
  }

  addCss(`#icon-menu-settings { color: ${settings.iconsColorPicker || '#fff'} !important; }`);

  setDynamicCss(dynamicCssArray.join('\n'));

  // Apply features
  applyBookmarksIfEnabled(settings);
  setupContinueWatchingFeature(settings.continueWatching);
  if (!isYTMusic) {
    setupShortsChannelNameFeature(settings.shortsChannelName);
    setupLockupCachedStats();
  }

  if (__ytToolsRuntime.settingsLoaded) {
    saveSettings();
  }
}

// Export menu color state for settings panel events
export function getMenuColors() {
  return { bg: selectedBgColor, text: selectedTextColor, accent: selectedBgAccentColor };
}

export function setMenuColor(type, value) {
  if (type === 'bg') selectedBgColor = value;
  else if (type === 'color') selectedTextColor = value;
  else if (type === 'accent') selectedBgAccentColor = value;
}
