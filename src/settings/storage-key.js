// Re-export from centralized storage keys config
import { STORAGE_KEYS } from '../config/storage-keys.js';
import { isYTMusic } from '../utils/dom.js';

// Use centralized key based on platform
export const SETTINGS_KEY = isYTMusic ? STORAGE_KEYS.SETTINGS_YTM : STORAGE_KEYS.SETTINGS_YT;

// Also export the raw keys for direct access if needed
export { STORAGE_KEYS };
