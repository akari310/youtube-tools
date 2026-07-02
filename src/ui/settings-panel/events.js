// ===========================================
// Settings Panel Events
// Extracted from legacy-full.js lines 5800-6400
// ===========================================
import { $id, $sp } from '../../utils/dom.js';
import { saveSettingsFromDOM, applySettings, setMenuColor } from '../../themes/theme-engine.js';
import { loadSettings } from '../../settings/settings-manager.js';
import { onWaveStyleChange } from '../../features/wave-visualizer.js';
import { updateVideoInfoPanel } from '../video-info-panel/index.js';
import { SETTINGS_KEY } from '../../settings/storage-key.js';
import { gmRawSet } from '../../utils/storage.js';
import { setAudioOnlyTabOverride, applyAudioOnlyMode } from '../../features/player/audio-only.js';

/** Persist + theme pass, then tell `main.js` to re-run feature inits (wave visualizer, etc.). */
function persistApplyAndNotifyFeatures() {
  saveSettingsFromDOM();
  applySettings();
  document.dispatchEvent(new CustomEvent('yt-tools-settings-changed', { detail: loadSettings() }));
}

export function setupSettingsPanelEvents(panelDOM) {
  if (!panelDOM) return;

  // 1. Close Menu Button
  const closeBtn = panelDOM.querySelector('.close_menu_settings');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Toggle menu logic is managed by gear-icon.js, but we can emit a custom event or let gear-icon handle it.
      const event = new CustomEvent('yt-tools-toggle-menu');
      window.dispatchEvent(event);
    });
  }

  // 2. Tab Functionality
  const tabButtons = panelDOM.querySelectorAll('.tab-mdcm');
  const tabContents = panelDOM.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.id === 'menu-settings-icon') return; // Handled below or handled differently in original code

      const tabName = button.getAttribute('data-tab');
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      const tabTarget = panelDOM.querySelector(`#${tabName}`);
      if (tabTarget) {
        tabTarget.classList.add('active');
      }

      if (tabName === 'headers' && typeof updateVideoInfoPanel === 'function') {
        updateVideoInfoPanel();
      }
    });
  });

  // Settings Menu Icon (gear in header) acts as a tab too
  const settingsIconTab = panelDOM.querySelector('#menu-settings-icon');
  if (settingsIconTab) {
    settingsIconTab.addEventListener('click', () => {
      const tabName = settingsIconTab.getAttribute('data-tab');
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      settingsIconTab.classList.add('active');
      const tabTarget = panelDOM.querySelector(`#${tabName}`);
      if (tabTarget) tabTarget.classList.add('active');
    });
  }

  // 3. Toggles and Inputs Auto-Save
  const inputs = panelDOM.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.id === 'select-wave-visualizer-select') {
        onWaveStyleChange(input.value, saveSettingsFromDOM);
        return;
      }

      // Special handler for audio-only-tab-toggle (tab-specific override)
      if (input.id === 'audio-only-tab-toggle') {
        const enabled = input.checked;
        const globalToggle = $id('audio-only-toggle');
        const globalEnabled = globalToggle ? globalToggle.checked : false;
        // Use static import since it's already in the main bundle
        try {
          setAudioOnlyTabOverride(enabled, globalEnabled);
          applyAudioOnlyMode(enabled);
        } catch (e) {
          console.warn('[YT Tools] Failed to apply audio-only tab override:', e);
        }
        return;
      }

      persistApplyAndNotifyFeatures();
    });
  });

  // 4. Color Boxes (Themes)
  const colorBoxes = panelDOM.querySelectorAll('.color-box');
  colorBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const type = box.dataset.type;
      const value = box.dataset.value;

      if (type === 'bg') {
        setMenuColor('bg', value);
        $sp('--yt-enhance-menu-bg', value);
        panelDOM
          .querySelectorAll('#bg-color-options .color-box')
          .forEach(el => el.classList.remove('selected'));
        box.classList.add('selected');
      } else if (type === 'color') {
        setMenuColor('color', value);
        $sp('--yt-enhance-menu-text', value);
        panelDOM
          .querySelectorAll('#text-color-options .color-box')
          .forEach(el => el.classList.remove('selected'));
        box.classList.add('selected');
      } else if (type === 'accent') {
        setMenuColor('accent', value);
        $sp('--yt-enhance-menu-accent', value);
        panelDOM
          .querySelectorAll('#bg-accent-color-options .color-box')
          .forEach(el => el.classList.remove('selected'));
        box.classList.add('selected');
      }
      saveSettingsFromDOM();
    });
  });

  // 5. Player Size Slider
  const playerSizeSlider = panelDOM.querySelector('#player-size-slider');
  const playerSizeValue = panelDOM.querySelector('#player-size-value');
  const resetPlayerSize = panelDOM.querySelector('#reset-player-size');

  if (playerSizeSlider && playerSizeValue) {
    playerSizeSlider.addEventListener('input', () => {
      playerSizeValue.textContent = playerSizeSlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  if (resetPlayerSize && playerSizeSlider && playerSizeValue) {
    resetPlayerSize.addEventListener('click', e => {
      e.preventDefault();
      playerSizeSlider.value = 100;
      playerSizeValue.textContent = '100';
      persistApplyAndNotifyFeatures();
    });
  }

  const waveIntensitySlider = panelDOM.querySelector('#wave-intensity-slider');
  const waveIntensityValue = panelDOM.querySelector('#wave-intensity-value');
  if (waveIntensitySlider && waveIntensityValue) {
    waveIntensitySlider.addEventListener('input', () => {
      waveIntensityValue.textContent = waveIntensitySlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  const ytmWaveColorPicker = panelDOM.querySelector('#ytm-wave-color-picker');
  if (ytmWaveColorPicker) {
    ytmWaveColorPicker.addEventListener('input', persistApplyAndNotifyFeatures);
  }

  const ytmWaveHeightSlider = panelDOM.querySelector('#ytm-wave-height-slider');
  const ytmWaveHeightValue = panelDOM.querySelector('#ytm-wave-height-value');
  if (ytmWaveHeightSlider && ytmWaveHeightValue) {
    ytmWaveHeightSlider.addEventListener('input', () => {
      ytmWaveHeightValue.textContent = ytmWaveHeightSlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  const ytmPlayerOpacitySlider = panelDOM.querySelector('#ytm-player-opacity-slider');
  const ytmPlayerOpacityValue = panelDOM.querySelector('#ytm-player-opacity-value');
  if (ytmPlayerOpacitySlider && ytmPlayerOpacityValue) {
    ytmPlayerOpacitySlider.addEventListener('input', () => {
      ytmPlayerOpacityValue.textContent = ytmPlayerOpacitySlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  const ytmPanelOpacitySlider = panelDOM.querySelector('#ytm-panel-opacity-slider');
  const ytmPanelOpacityValue = panelDOM.querySelector('#ytm-panel-opacity-value');
  if (ytmPanelOpacitySlider && ytmPanelOpacityValue) {
    ytmPanelOpacitySlider.addEventListener('input', () => {
      ytmPanelOpacityValue.textContent = ytmPanelOpacitySlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  const ytmPanelBlurSlider = panelDOM.querySelector('#ytm-panel-blur-slider');
  const ytmPanelBlurValue = panelDOM.querySelector('#ytm-panel-blur-value');
  if (ytmPanelBlurSlider && ytmPanelBlurValue) {
    ytmPanelBlurSlider.addEventListener('input', () => {
      ytmPanelBlurValue.textContent = ytmPanelBlurSlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  const menuFontSizeSlider = panelDOM.querySelector('#menu-font-size-slider');
  const menuFontSizeValue = panelDOM.querySelector('#menu-font-size-value');
  if (menuFontSizeSlider && menuFontSizeValue) {
    menuFontSizeSlider.addEventListener('input', () => {
      menuFontSizeValue.textContent = menuFontSizeSlider.value;
      persistApplyAndNotifyFeatures();
    });
  }

  // 6. Header Buttons (Share, Import/Export)
  const shareBtn = panelDOM.querySelector('#shareBtn-mdcm');
  const importExportBtn = panelDOM.querySelector('#importExportBtn');
  const closeImportExportBtn = panelDOM.querySelector('#closeImportExportBtn');

  if (shareBtn) {
    shareBtn.addEventListener('click', event => {
      event.stopPropagation();
      const dropdown = panelDOM.querySelector('#shareDropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
  }

  if (importExportBtn) {
    importExportBtn.addEventListener('click', () => {
      const importExportArea = panelDOM.querySelector('#importExportArea');
      if (importExportArea) {
        importExportArea.classList.toggle('active');
      }
    });
  }

  if (closeImportExportBtn) {
    closeImportExportBtn.addEventListener('click', () => {
      const importExportArea = panelDOM.querySelector('#importExportArea');
      if (importExportArea) {
        importExportArea.classList.remove('active');
      }
    });
  }

  // 6. Background Image Upload
  const backgroundImagePreview = panelDOM.querySelector('#background-image-preview');
  const backgroundImageInput = panelDOM.querySelector('#background_image');
  const removeBackgroundImageBtn = panelDOM.querySelector('#remove-background-image');

  if (backgroundImagePreview && backgroundImageInput) {
    const settings = loadSettings();

    if (settings.backgroundImage) {
      backgroundImagePreview.style.backgroundImage = `url(${settings.backgroundImage})`;
      backgroundImagePreview.classList.add('has-image');
    }

    backgroundImagePreview.addEventListener('click', () => {
      backgroundImageInput.click();
    });

    backgroundImageInput.addEventListener('change', e => {
      const file = e.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          const imageUrl = event.target.result;
          backgroundImagePreview.style.backgroundImage = `url(${imageUrl})`;
          backgroundImagePreview.classList.add('has-image');

          const settings = loadSettings();
          settings.backgroundImage = imageUrl;
          gmRawSet(SETTINGS_KEY, JSON.stringify(settings));
          applySettings();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeBackgroundImageBtn) {
    removeBackgroundImageBtn.addEventListener('click', e => {
      e.stopPropagation();
      backgroundImagePreview.style.backgroundImage = '';
      backgroundImagePreview.classList.remove('has-image');
      backgroundImageInput.value = '';

      // Remove from settings
      const settings = loadSettings();
      delete settings.backgroundImage;
      console.log('[YT Tools] Removing backgroundImage with key:', SETTINGS_KEY);
      gmRawSet(SETTINGS_KEY, JSON.stringify(settings));
      applySettings();
    });
  }
}
