import { SETTINGS_KEY } from './storage-key.js';
import { DEFAULT_SETTINGS } from './defaults.js';
import { __ytToolsRuntime } from '../utils/runtime.js';

export function loadSettings() {
  try {
    const saved = GM_getValue(SETTINGS_KEY, '{}');
    const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    __ytToolsRuntime.settingsLoaded = true;
    return settings;
  } catch {
    __ytToolsRuntime.settingsLoaded = true;
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    GM_setValue(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[YT Tools] Failed to save settings:', e);
  }
}

export function saveSettingsFromDOM() {
  try {
    const settings = loadSettings();

    // Get values from DOM elements
    const selectedTheme = document.querySelector('#theme-select')?.value;
    const selectedBgColor = document.querySelector('#bg-color')?.value;
    const selectedTextColor = document.querySelector('#text-color')?.value;
    const selectedAccentColor = document.querySelector('#accent-color')?.value;

    // Update settings object
    if (selectedTheme) settings.selectedTheme = selectedTheme;
    if (selectedBgColor) settings.bgColor = selectedBgColor;
    if (selectedTextColor) settings.textColor = selectedTextColor;
    if (selectedAccentColor) settings.accentColor = selectedAccentColor;

    // Save to storage
    saveSettings(settings);

    console.log('[YT Tools] Settings saved from DOM');
    return settings;
  } catch (e) {
    console.warn('[YT Tools] Failed to save settings from DOM:', e);
    return null;
  }
}
