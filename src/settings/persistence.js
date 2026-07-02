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
    settings.menu_developermdcm || { bg: '#0f1721', color: '#eef6fb', accent: '#22d3ee' };

  const setVal = (id, val) => {
    const el = $id(id);
    if (el) el.value = val;
  };
  const setChk = (id, val) => {
    const el = $id(id);
    if (el) el.checked = val;
  };

  setVal('bg-color-picker', settings.bgColorPicker || '#0b1016');
  setVal('progressbar-color-picker', settings.progressbarColorPicker || '#22d3ee');
  setVal('primary-color-picker', settings.primaryColorPicker || '#ffffff');
  setVal('secondary-color-picker', settings.secondaryColorPicker || '#a7b4c2');
  setVal('header-color-picker', settings.headerColorPicker || '#0f1721');
  setVal('icons-color-picker', settings.iconsColorPicker || '#22d3ee');
  setVal('menu-color-picker', settings.menuColorPicker || '#0f1721');
  setVal('line-color-picker', settings.lineColorPicker || '#22d3ee');
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
  setChk('translation-toggle', settings.translateComments || false);
  setChk('avatars-toggle', settings.avatars || false);
  setChk('reverse-mode-toggle', settings.reverseMode || false);
  setChk('wave-visualizer-toggle', settings.waveVisualizer || false);
  setVal('select-wave-visualizer-select', settings.waveVisualizerSelected || 'dinamica');
  setVal('wave-fps-select', settings.waveVisualizerFps || '30');
  setVal('wave-intensity-slider', settings.waveVisualizerIntensity || '100');
  setVal('ytm-wave-color-picker', settings.ytmWaveColor || '#22d3ee');
  setVal('ytm-wave-height-slider', settings.ytmWaveHeight || '36');
  setVal('ytm-wave-placement-select', settings.ytmWavePlacement || 'edge');
  setVal('ytm-player-opacity-slider', settings.ytmPlayerBarOpacity || '72');
  setVal('ytm-panel-opacity-slider', settings.ytmPanelOpacity || '66');
  setVal('ytm-panel-blur-slider', settings.ytmPanelBlur || '22');
  setChk('hide-comments-toggle', settings.hideComments || false);
  setChk('hide-sidebar-toggle', settings.hideSidebar || false);
  setChk('autoplay-toggle', settings.disableAutoplay || false);
  setChk('cinematic-lighting-toggle', settings.cinematicLighting || false);
  if ($id('sync-cinematic-toggle'))
    $id('sync-cinematic-toggle').checked = settings.syncCinematic || false;
  if ($id('side-panel-style-select'))
    $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';
  setVal('player-size-slider', settings.playerSize || 100);
  setVal('menu-font-size-slider', settings.menuFontSize || '13');
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

  const waveIntensityLabel = $id('wave-intensity-value');
  if (waveIntensityLabel)
    waveIntensityLabel.textContent = $id('wave-intensity-slider')?.value || '100';
  const waveHeightLabel = $id('ytm-wave-height-value');
  if (waveHeightLabel) waveHeightLabel.textContent = $id('ytm-wave-height-slider')?.value || '36';
  const playerOpacityLabel = $id('ytm-player-opacity-value');
  if (playerOpacityLabel)
    playerOpacityLabel.textContent = $id('ytm-player-opacity-slider')?.value || '72';
  const panelOpacityLabel = $id('ytm-panel-opacity-value');
  if (panelOpacityLabel)
    panelOpacityLabel.textContent = $id('ytm-panel-opacity-slider')?.value || '66';
  const panelBlurLabel = $id('ytm-panel-blur-value');
  if (panelBlurLabel) panelBlurLabel.textContent = $id('ytm-panel-blur-slider')?.value || '22';
  const menuFontSizeLabel = $id('menu-font-size-value');
  if (menuFontSizeLabel)
    menuFontSizeLabel.textContent = $id('menu-font-size-slider')?.value || '13';

  // Restore background image preview
  const preview = $id('background-image-preview');
  if (preview && settings.backgroundImage) {
    preview.style.backgroundImage = `url(${settings.backgroundImage})`;
    preview.classList.add('has-image');
  }
}
