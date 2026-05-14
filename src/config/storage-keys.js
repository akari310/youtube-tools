// ===========================================
// Storage Keys - Centralized Configuration
// ===========================================
// All GM storage keys should be defined here
// to avoid duplication and inconsistency
// ===========================================

// Feature-specific storage keys
export const STORAGE_KEYS = {
  // Bookmarks
  BOOKMARKS: 'ytBookmarksMDCM',

  // Continue Watching
  CONTINUE_WATCHING: 'ytContinueWatchingMDCM',

  // Shorts Channel Cache
  SHORTS_CHANNEL_CACHE: 'ytShortsChannelCacheMDCM',

  // Likes/Dislikes Cache
  LIKES_DISLIKES_CACHE: 'ytLikesDislikesCacheMDCM',

  // Version Check
  VERSION_CHECK_LAST: 'ytVersionCheckLastMDCM',

  // Settings (YouTube & YouTube Music)
  SETTINGS_YT: 'ytSettingsMDCM',
  SETTINGS_YTM: 'ytmSettingsMDCM',

  // Time Statistics
  TOTAL_USAGE: 'YT_TOTAL_USAGE',
  VIDEO_TIME: 'YT_VIDEO_TIME',
  SHORTS_TIME: 'YT_SHORTS_TIME',
  DETAILED_STATS: 'YT_DETAILED_STATS',
  DAILY_STATS: 'YT_DAILY_STATS',
  SESSION_START: 'YT_SESSION_START',

  // Custom Themes (localStorage)
  CUSTOM_THEMES: 'yt-tools-custom-themes',
};

// Update check constants
export const UPDATE_META_URL =
  'https://update.greasyfork.org/scripts/460680/Youtube%20Tools%20All%20in%20one%20local%20download%20mp3%20mp4%20HIGT%20QUALITY%20return%20dislikes%20and%20more.meta.js';
export const VERSION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORTS_CHANNEL: 7 * 24 * 60 * 60 * 1000, // 7 days
  LIKES_DISLIKES: 7 * 24 * 60 * 60 * 1000, // 7 days
  DISLIKES_IN_MEMORY: 10 * 60 * 1000, // 10 minutes
};

// Cache size limits
export const CACHE_LIMITS = {
  PERSISTED_MAX_ENTRIES: 500,
  CONTINUE_WATCHING_MAX_ENTRIES: 200,
};

// Helper to get settings key based on platform
export function getSettingsKey(isMusic = false) {
  return isMusic ? STORAGE_KEYS.SETTINGS_YTM : STORAGE_KEYS.SETTINGS_YT;
}