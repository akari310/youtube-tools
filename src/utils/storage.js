// Storage Keys
export const STORAGE_KEYS_MDCM = {
  BOOKMARKS: 'ytBookmarksMDCM',
  CONTINUE_WATCHING: 'ytContinueWatchingMDCM',
  SHORTS_CHANNEL_CACHE: 'ytShortsChannelCacheMDCM',
  LIKES_DISLIKES_CACHE: 'ytLikesDislikesCacheMDCM',
  VERSION_CHECK_LAST: 'ytVersionCheckLastMDCM',
};

// Update check constants
export const UPDATE_META_URL =
  'https://update.greasyfork.org/scripts/460680/Youtube%20Tools%20All%20in%20one%20local%20download%20mp3%20mp4%20HIGT%20QUALITY%20return%20dislikes%20and%20more.meta.js';
export const VERSION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day

// Storage helpers using GM APIs
export function readJsonGM(key, defaultValue = null) {
  try {
    const raw = GM_getValue(key, null);
    if (!raw) return defaultValue;
    return JSON.parse(String(raw));
  } catch (e) {
    return defaultValue;
  }
}

export function writeJsonGM(key, value) {
  try {
    GM_setValue(key, JSON.stringify(value));
  } catch (e) {}
}

// Time constants
export const SHORTS_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const LIKES_DISLIKES_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const PERSISTED_CACHE_MAX_ENTRIES = 500;

// Cache functions
export function getShortsChannelFromPersistedCache(videoId) {
  try {
    const map = readJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, {});
    const entry = map?.[videoId];
    if (!entry || typeof entry.channelName !== 'string') return null;
    const age = Date.now() - (Number(entry.ts) || 0);
    if (age > SHORTS_CHANNEL_TTL_MS) return null;
    return entry.channelName;
  } catch (e) {
    return null;
  }
}

export function setShortsChannelToPersistedCache(videoId, channelName) {
  if (!videoId || typeof channelName !== 'string') return;
  try {
    const map = readJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, {});
    map[videoId] = {
      channelName,
      ts: Date.now(),
    };
    const entries = Object.entries(map).sort(
      (a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0)
    );
    const pruned = Object.fromEntries(entries.slice(0, PERSISTED_CACHE_MAX_ENTRIES));
    writeJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, pruned);
  } catch (e) {}
}

export function getLikesDislikesFromPersistedCache(videoId) {
  try {
    const map = readJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, {});
    const entry = map?.[videoId];
    if (!entry) return null;
    const age = Date.now() - (Number(entry.ts) || 0);
    if (age > LIKES_DISLIKES_TTL_MS) return null;
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
    const map = readJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, {});
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
    const pruned = Object.fromEntries(entries.slice(0, PERSISTED_CACHE_MAX_ENTRIES));
    writeJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, pruned);
  } catch (e) {}
}
