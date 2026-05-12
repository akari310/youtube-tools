// ===========================================
// Settings Panel - Entry Point
// ===========================================
import { createSettingsPanel } from './template.js';
import { setupSettingsPanelEvents } from './events.js';
import { initThemeSelector } from '../components/theme-selector/index.js';

import { loadSettingsToDOM } from '../../themes/theme-engine.js';
import { initGearIcon } from '../gear-icon.js';
import './style.scss';

export function initSettingsPanel() {
  const { panel, panelOverlay } = createSettingsPanel();
  if (panel && panelOverlay) {
    document.body.appendChild(panelOverlay);
    document.body.appendChild(panel);
    setupSettingsPanelEvents(panel);

    // Initialize gear icon with panel references
    initGearIcon(panel, panelOverlay);

    // Initialize enhanced theme selector
    setTimeout(() => {
      initThemeSelector();
    }, 100);

    // Load settings to DOM
    setTimeout(() => {
      loadSettingsToDOM();
    }, 100);
  }
}
