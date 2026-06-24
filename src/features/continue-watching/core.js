import { $e } from '../../utils/dom.js';
import { readJsonGM, writeJsonGM, STORAGE_KEYS_MDCM } from '../../utils/storage.js';
import { __ytToolsRuntime } from '../../utils/runtime.js';
import { getCurrentVideoId } from '../../utils/helpers.js';

export function isWatchPage() {
  return window.location.href.includes('youtube.com/watch');
}

export function getMainVideoEl() {
  return (
    document.querySelector('#movie_player video.video-stream.html5-main-video') ||
    document.querySelector('ytd-player video.video-stream.html5-main-video') ||
    document.querySelector('video.video-stream.html5-main-video') ||
    document.querySelector('video')
  );
}

const metaCache = new Map();

export function getCurrentVideoMeta() {
  try {
    const videoId = getCurrentVideoId();
    if (videoId && metaCache.has(videoId)) return metaCache.get(videoId);

    const domTitle =
      $e('ytd-watch-metadata h1 yt-formatted-string')?.textContent?.trim() ||
      $e('h1.ytd-watch-metadata yt-formatted-string')?.textContent?.trim() ||
      '';
    const domAuthor =
      $e(
        '#owner ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a, #text-container.ytd-channel-name a'
      )?.textContent?.trim() ||
      $e('#owner a[href^="/@"], #owner a[href^="/channel/"]')?.textContent?.trim() ||
      '';
    const titleFromDom = (domTitle || document.title || '')
      .replace(/\s*-\s*YouTube\s*$/i, '')
      .trim();
    const authorFromDom = (domAuthor || '').trim();

    const w = typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window;
    const pr = w?.ytInitialPlayerResponse || window.ytInitialPlayerResponse;
    const vd = pr?.videoDetails || null;
    const title = (titleFromDom || vd?.title || document.title || '')
      .replace(/\s*-\s*YouTube\s*$/i, '')
      .trim();
    const author = (authorFromDom || vd?.author || '').trim();
    const thumbs = vd?.thumbnail?.thumbnails;
    const thumb = Array.isArray(thumbs) ? thumbs[thumbs.length - 1]?.url || '' : '';
    const result = { title, author, thumb };
    if (videoId) {
      metaCache.set(videoId, result);
      if (metaCache.size > 200) {
        const iter = metaCache.keys();
        let del = metaCache.size - 200;
        while (del-- > 0) metaCache.delete(iter.next().value);
      }
    }
    return result;
  } catch {
    return { title: '', author: '', thumb: '' };
  }
}

export function ensureContinueWatchingMapLoaded() {
  const rt = __ytToolsRuntime.continueWatching;
  if (!rt.map) rt.map = readJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, {});
  if (typeof rt.map !== 'object' || !rt.map) rt.map = {};
  return rt.map;
}

export function pruneContinueWatchingMap(map, maxEntries = 200) {
  try {
    const entries = Object.entries(map || {}).filter(([, v]) => v && typeof v === 'object');
    entries.sort((a, b) => (Number(b[1].updatedAt) || 0) - (Number(a[1].updatedAt) || 0));
    const keep = entries.slice(0, maxEntries);
    const next = {};
    for (const [k, v] of keep) next[k] = v;
    return next;
  } catch {
    return map || {};
  }
}

export function scheduleContinueWatchingFlush() {
  const rt = __ytToolsRuntime.continueWatching;
  clearTimeout(rt.flushT);
  rt.flushT = setTimeout(() => {
    try {
      if (!rt.map) return;
      rt.map = pruneContinueWatchingMap(rt.map, 200);
      writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, rt.map);
    } catch {}
  }, 800);
}

export function clearContinueWatchingForVideo(videoId) {
  if (!videoId) return;
  const rt = __ytToolsRuntime.continueWatching;
  const map = ensureContinueWatchingMapLoaded();
  if (map && Object.prototype.hasOwnProperty.call(map, videoId)) {
    delete map[videoId];
    rt.map = map;
    scheduleContinueWatchingFlush();
  }
}

export function setContinueWatchingForVideo(videoId, seconds, durationSec) {
  if (!videoId) return;
  const rt = __ytToolsRuntime.continueWatching;
  const map = ensureContinueWatchingMapLoaded();
  const t = Math.max(0, Math.floor(Number(seconds) || 0));
  const d = Math.max(0, Math.floor(Number(durationSec) || 0));
  const prev = map[videoId] && typeof map[videoId] === 'object' ? map[videoId] : {};
  const meta = getCurrentVideoMeta();
  map[videoId] = {
    t,
    d,
    updatedAt: Date.now(),
    title: meta.title || prev.title || '',
    author: meta.author || prev.author || '',
    thumb: meta.thumb || prev.thumb || '',
  };
  rt.map = map;
  scheduleContinueWatchingFlush();
}

export function getContinueWatchingTime(videoId) {
  if (!videoId) return null;
  const map = ensureContinueWatchingMapLoaded();
  const entry = map?.[videoId];
  const t = Number(entry?.t);
  return Number.isFinite(t) ? t : null;
}
