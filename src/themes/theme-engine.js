// ===========================================
// Theme Engine — Enhanced theme management
// ===========================================

// Core functionality
export { applySettings } from './applier.js';
export {
  saveSettingsFromDOM,
  loadSettingsToDOM,
  getMenuColors,
  setMenuColor,
} from '../settings/persistence.js';

// Advanced theme management
export { themeManager, ThemeManager } from './utils/theme-manager.js';
export { getThemePreset, getAllThemePresets, THEME_PRESETS } from './presets/index.js';
