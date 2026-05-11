// ===========================================
// Settings Panel Events
// Extracted from legacy-full.js lines 5800-6400
// ===========================================
import { $id, $m, $e, $sp } from '../utils/dom.js';
import { saveSettings, applySettings, setMenuColor } from '../themes/theme-engine.js';
import { updateVideoInfoPanel } from './video-info-panel.js'; // Need to be careful to import if exists, or handle gracefully

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
      saveSettings();
      applySettings();
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
      saveSettings();
    });
  });

  // 5. Player Size Slider
  const playerSizeSlider = panelDOM.querySelector('#player-size-slider');
  const playerSizeValue = panelDOM.querySelector('#player-size-value');
  const resetPlayerSize = panelDOM.querySelector('#reset-player-size');

  if (playerSizeSlider && playerSizeValue) {
    playerSizeSlider.addEventListener('input', () => {
      playerSizeValue.textContent = playerSizeSlider.value;
      saveSettings();
      applySettings();
    });
  }

  if (resetPlayerSize && playerSizeSlider && playerSizeValue) {
    resetPlayerSize.addEventListener('click', e => {
      e.preventDefault();
      playerSizeSlider.value = 100;
      playerSizeValue.textContent = '100';
      saveSettings();
      applySettings();
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
}
