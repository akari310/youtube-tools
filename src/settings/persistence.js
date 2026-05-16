// ===========================================
// Settings Persistence — loadSettingsToDOM
// ===========================================
import { $e, $id, $m, $sp } from '../utils/dom.js';
import { SETTINGS_KEY } from './storage-key.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { readJsonGM } from '../utils/storage.js';
import { syncAudioOnlyTabCheckbox, setMenuColor } from './settings-dom.js';
import { selectedBgColor, selectedTextColor, selectedBgAccentColor } from './settings-dom.js';

// Re-export for external consumers (theme-engine.js, settings-panel, etc.)
export {
  saveSettingsFromDOM,
  getMenuColors,
  syncAudioOnlyTabCheckbox,
  setMenuColor,
} from './settings-dom.js';

/**
 * Read settings from GM storage and apply to panel DOM.
 */
export function loadSettingsToDOM() {
  const settings = readJsonGM(SETTINGS_KEY, {});
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
  setChk('copy-description-toggle', settings.copyDescription !== false);
  syncAudioOnlyTabCheckbox();
  setChk('themes-toggle', settings.themes || false);
  const themesMenuSection = $e('.themes-hidden');
  if (themesMenuSection) {
    themesMenuSection.style.display = settings.themes ? 'block' : 'none';
  }
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

  // Update menu color state through the setter (variables live in settings-dom.js)
  setMenuColor('bg', menuData.bg);
  setMenuColor('color', menuData.color);
  setMenuColor('accent', menuData.accent);

  // Live bindings from settings-dom.js reflect the updated values
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

  // Restore background image preview
  const preview = $id('background-image-preview');
  if (preview && settings.backgroundImage) {
    preview.style.backgroundImage = `url(${settings.backgroundImage})`;
    preview.classList.add('has-image');
  }
}
