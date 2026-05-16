import { SETTINGS_KEY } from './storage-key.js';
import { DEFAULT_SETTINGS } from './defaults.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { gmRawGet, gmRawSet } from '../utils/storage.js';

export function loadSettings() {
  try {
    const saved = gmRawGet(SETTINGS_KEY, '{}');
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
    gmRawSet(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[YT Tools] Failed to save settings:', e);
  }
}
