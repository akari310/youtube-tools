import { createSettingsPanel } from './settings-panel-html.js';
import { setupSettingsPanelEvents } from './settings-panel-events.js';
import { loadSettingsToDOM } from '../themes/theme-engine.js';
import { initGearIcon } from './gear-icon.js';
import './settings-panel.scss';

export function initSettingsPanel() {
  const { panel, panelOverlay } = createSettingsPanel();

  // Setup all event listeners for the panel
  setupSettingsPanelEvents(panel, panelOverlay);

  // Initialize the gear icon, pass the panel and overlay so it can toggle it
  initGearIcon(panel, panelOverlay);

  // Call loadSettingsToDOM once when panel is created
  setTimeout(() => {
    loadSettingsToDOM();
  }, 100);
}
