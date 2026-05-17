// ===========================================
// Settings DOM — Shared settings state and DOM operations
// Extracted from persistence.js to break circular dependency
// with applier.js (applier → persistence → applier)
// ===========================================
import { $e, $id } from '../utils/dom.js';
import { SETTINGS_KEY } from './storage-key.js';
import { gmRawGet, gmRawSet, readJsonGM } from '../utils/storage.js';

export let selectedBgColor = '#252525';
export let selectedTextColor = '#ffffff';
export let selectedBgAccentColor = '#ff0000';

// ---------- Helpers ----------

export function syncAudioOnlyTabCheckbox() {
  const tabToggle = $id('audio-only-tab-toggle');
  if (!tabToggle) return;
  const key = 'ytAudioOnlyTab_' + (window.__ytTabId || '0');
  try {
    tabToggle.checked = gmRawGet(key, false);
  } catch {
    /* */
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
    copyDescription: $id('copy-description-toggle')?.checked || false,
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
    playerSize: $id('player-size-slider')?.value || 100,
    selectVideoQuality: $id('select-video-qualitys-select')?.value || 'user',
    languagesComments: $id('select-languages-comments-select')?.value || 'en',
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
