// Storage Keys - Import and Re-export from centralized config
import {
  STORAGE_KEYS,
  UPDATE_META_URL,
  VERSION_CHECK_INTERVAL_MS,
  CACHE_TTL,
  CACHE_LIMITS,
} from '../config/storage-keys.js';

export {
  STORAGE_KEYS as STORAGE_KEYS_MDCM,
  UPDATE_META_URL,
  VERSION_CHECK_INTERVAL_MS,
  CACHE_TTL,
  CACHE_LIMITS,
} from '../config/storage-keys.js';

// Re-export helper functions
export { getSettingsKey } from '../config/storage-keys.js';

// Universal GM storage wrapper
// Supports sync (Tampermonkey/Violentmonkey) and async (Greasemonkey 4+) APIs
export function gmRawGet(key, defaultValue) {
  // Tampermonkey / Violentmonkey (sync API)
  if (typeof GM_getValue !== 'undefined') {
    return GM_getValue(key, defaultValue);
  }
  // Greasemonkey 4+ (async API) — use localStorage via unsafeWindow as fallback
  try {
    const raw = unsafeWindow.localStorage.getItem('yt_tools_' + key);
    return raw !== null ? raw : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function gmRawSet(key, value) {
  if (typeof GM_setValue !== 'undefined') {
    GM_setValue(key, value);
    return;
  }
  try {
    unsafeWindow.localStorage.setItem('yt_tools_' + key, value);
  } catch (e) {}
}

export function readJsonGM(key, defaultValue = null) {
  try {
    const raw = gmRawGet(key, null);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(String(raw));
  } catch (e) {
    return defaultValue;
  }
}

export function writeJsonGM(key, value) {
  try {
    gmRawSet(key, JSON.stringify(value));
  } catch (e) {}
}

// Cache functions
export function getShortsChannelFromPersistedCache(videoId) {
  try {
    const map = readJsonGM(STORAGE_KEYS.SHORTS_CHANNEL_CACHE, {});
    const entry = map?.[videoId];
    if (!entry || typeof entry.channelName !== 'string') return null;
    const age = Date.now() - (Number(entry.ts) || 0);
    if (age > CACHE_TTL.SHORTS_CHANNEL) return null;
    return entry.channelName;
  } catch (e) {
    return null;
  }
}

export function setShortsChannelToPersistedCache(videoId, channelName) {
  if (!videoId || typeof channelName !== 'string') return;
  try {
    const map = readJsonGM(STORAGE_KEYS.SHORTS_CHANNEL_CACHE, {});
    map[videoId] = {
      channelName,
      ts: Date.now(),
    };
    const entries = Object.entries(map).sort(
      (a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0)
    );
    const pruned = Object.fromEntries(entries.slice(0, CACHE_LIMITS.PERSISTED_MAX_ENTRIES));
    writeJsonGM(STORAGE_KEYS.SHORTS_CHANNEL_CACHE, pruned);
  } catch (e) {}
}

export function getLikesDislikesFromPersistedCache(videoId) {
  try {
    const map = readJsonGM(STORAGE_KEYS.LIKES_DISLIKES_CACHE, {});
    const entry = map?.[videoId];
    if (!entry) return null;
    const age = Date.now() - (Number(entry.ts) || 0);
    if (age > CACHE_TTL.LIKES_DISLIKES) return null;
    const dislikes = Number(entry.dislikes);
    const likes = Number(entry.likes);
    const viewCount = Number(entry.viewCount);
    const rating = Number(entry.rating);
    return {
      likes: Number.isFinite(likes) ? likes : null,
      dislikes: Number.isFinite(dislikes) ? dislikes : null,
      viewCount: Number.isFinite(viewCount) ? viewCount : null,
      rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
    };
  } catch (e) {
    return null;
  }
}

export function setLikesDislikesToPersistedCache(videoId, data) {
  if (!videoId || !data || typeof data !== 'object') return;
  try {
    const map = readJsonGM(STORAGE_KEYS.LIKES_DISLIKES_CACHE, {});
    map[videoId] = {
      likes: data.likes ?? null,
      dislikes: data.dislikes ?? null,
      viewCount: data.viewCount ?? null,
      rating: data.rating ?? null,
      ts: Date.now(),
    };
    const entries = Object.entries(map).sort(
      (a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0)
    );
    const pruned = Object.fromEntries(entries.slice(0, CACHE_LIMITS.PERSISTED_MAX_ENTRIES));
    writeJsonGM(STORAGE_KEYS.LIKES_DISLIKES_CACHE, pruned);
  } catch (e) {}
}
