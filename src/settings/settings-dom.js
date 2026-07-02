// ===========================================
// Settings DOM — Shared settings state and DOM operations
// Extracted from persistence.js to break circular dependency
// with applier.js (applier → persistence → applier)
// ===========================================
import { $e, $id } from '../utils/dom.js';
import { SETTINGS_KEY } from './storage-key.js';
import { gmRawSet, readJsonGM } from '../utils/storage.js';

export let selectedBgColor = '#0f1721';
export let selectedTextColor = '#eef6fb';
export let selectedBgAccentColor = '#22d3ee';

// ---------- Helpers ----------

export function syncAudioOnlyTabCheckbox() {
  const tabToggle = $id('audio-only-tab-toggle');
  if (!tabToggle) return;

  // Read from sessionStorage (matches audio-only.js implementation)
  const AUDIO_ONLY_TAB_OVERRIDE_KEY = 'ytToolsAudioOnlyTabOverrideMDCM';
  const override = window.sessionStorage.getItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);

  // If no override (null), check follows global setting
  if (override === null) {
    const settings = readJsonGM(SETTINGS_KEY, {});
    tabToggle.checked = !!settings?.audioOnly;
  } else {
    tabToggle.checked = override === 'true';
  }
}

// ---------- Core ----------

/**
 * Read current toggle/select/slider values from panel DOM and save.
 */
export function saveSettingsFromDOM() {
  const existing = readJsonGM(SETTINGS_KEY, {});

  const s = {
    ...existing,
    theme: $e('input[name="theme"]:checked')?.value || '0',
    bgColorPicker: $id('bg-color-picker')?.value || '#0b1016',
    progressbarColorPicker: $id('progressbar-color-picker')?.value || '#22d3ee',
    primaryColorPicker: $id('primary-color-picker')?.value || '#ffffff',
    secondaryColorPicker: $id('secondary-color-picker')?.value || '#a7b4c2',
    headerColorPicker: $id('header-color-picker')?.value || '#0f1721',
    iconsColorPicker: $id('icons-color-picker')?.value || '#22d3ee',
    menuColorPicker: $id('menu-color-picker')?.value || '#0f1721',
    lineColorPicker: $id('line-color-picker')?.value || '#22d3ee',
    timeColorPicker: $id('time-color-picker')?.value || '#ffffff',
    dislikes: $id('dislikes-toggle')?.checked || false,
    likeDislikeBar: $id('like-dislike-bar-toggle')?.checked || false,
    bookmarks: $id('bookmarks-toggle')?.checked || false,
    continueWatching: $id('continue-watching-toggle')?.checked || false,
    shortsChannelName: $id('shorts-channel-name-toggle')?.checked || false,
    copyDescription: $id('copy-description-toggle') ? $id('copy-description-toggle').checked : true,
    nonstopPlayback: $id('nonstop-playback-toggle')
      ? $id('nonstop-playback-toggle').checked
      : false,
    audioOnly: $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false,
    themes: $id('themes-toggle')?.checked || false,
    translateComments: $id('translation-toggle')?.checked || false,
    avatars: $id('avatars-toggle')?.checked || false,
    reverseMode: $id('reverse-mode-toggle')?.checked || false,
    waveVisualizer: $id('wave-visualizer-toggle')?.checked || false,
    waveVisualizerSelected: $id('select-wave-visualizer-select')?.value || 'dinamica',
    waveVisualizerFps: $id('wave-fps-select')?.value || '30',
    waveVisualizerIntensity: $id('wave-intensity-slider')?.value || '100',
    ytmWaveColor: $id('ytm-wave-color-picker')?.value || '#22d3ee',
    ytmWaveHeight: $id('ytm-wave-height-slider')?.value || '36',
    ytmWavePlacement: $id('ytm-wave-placement-select')?.value || 'edge',
    ytmPlayerBarOpacity: $id('ytm-player-opacity-slider')?.value || '72',
    ytmPanelOpacity: $id('ytm-panel-opacity-slider')?.value || '66',
    ytmPanelBlur: $id('ytm-panel-blur-slider')?.value || '22',
    hideComments: $id('hide-comments-toggle')?.checked || false,
    hideSidebar: $id('hide-sidebar-toggle')?.checked || false,
    disableAutoplay: $id('autoplay-toggle')?.checked || false,
    cinematicLighting: $id('cinematic-lighting-toggle')?.checked || false,
    syncCinematic: $id('sync-cinematic-toggle')?.checked || false,
    sidePanelStyle: $id('side-panel-style-select')?.value || 'blur',
    playerSize: $id('player-size-slider')?.value || 100,
    selectVideoQuality: $id('select-video-qualitys-select')?.value || 'user',
    languagesComments: $id('select-languages-comments-select')?.value || 'vi',
    menuFontSize: $id('menu-font-size-slider')?.value || '13',
    menu_akari: { bg: selectedBgColor, color: selectedTextColor, accent: selectedBgAccentColor },
  };
  gmRawSet(SETTINGS_KEY, JSON.stringify(s));
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
