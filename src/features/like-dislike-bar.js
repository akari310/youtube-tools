import { $e } from '../utils/dom.js';
import { apiDislikes } from '../config/constants.js';
import {
  getLikesDislikesFromPersistedCache,
  setLikesDislikesToPersistedCache,
} from '../utils/storage.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { getCurrentVideoId, FormatterNumber } from '../utils/helpers.js';
import { safeHTML } from '../utils/trusted-types.js';
import { isYTMusic, $m } from '../utils/dom.js';
import { loadSettings } from '../settings/settings-manager.js';

// ------------------------------
// Feature: Like vs Dislike bar
// ------------------------------

export function parseCountText(text) {
  if (!text) return null;
  const s0 = String(text).trim().toLowerCase();
  if (!s0) return null;
  let mult = 1;
  let s = s0.replace(/\s+/g, '');

  // Detect locale from YouTube's hl parameter
  const urlParams = new URLSearchParams(location.search);
  const hl = urlParams.get('hl') || '';

  // "mil" (Spanish/Portuguese) = thousand (1000), NOT million
  if (s.includes('mil')) {
    mult = 1000;
    s = s.replace('mil', '');
  } else if (
    s.includes('nghìn') ||
    s.includes('nghin') ||
    s.includes('ngàn') ||
    s.includes('ngan')
  ) {
    mult = 1000;
    s = s.replace(/nghìn|nghin|ngàn|ngan/g, '');
  } else if (/[\d.,]n$/i.test(s)) {
    // Vietnamese compact format: "1,7 N" = 1.7 thousand.
    mult = 1000;
    s = s.replace(/n$/i, '');
  } else if (s.includes('triệu') || s.includes('trieu')) {
    mult = 1000000;
    s = s.replace(/triệu|trieu/g, '');
  } else if (/[\d.,]tr$/i.test(s)) {
    mult = 1000000;
    s = s.replace(/tr$/i, '');
  } else if (s.includes('k')) {
    mult = 1000;
    s = s.replace('k', '');
  } else if (s.includes('m')) {
    // "m" alone = million (after removing "mil" check above)
    mult = 1000000;
    s = s.replace('m', '');
  }
  s = s.replace(/[^\d.,]/g, '');
  if (!s) return null;

  // Locales where dot is thousands separator and comma is decimal (e.g. de, es, pt, id, tr, nl)
  const dotThousandsLocales = [
    'de',
    'es',
    'pt',
    'id',
    'tr',
    'nl',
    'it',
    'pl',
    'cs',
    'da',
    'fi',
    'nb',
    'sv',
    'el',
    'hu',
    'ro',
    'sk',
    'sl',
    'hr',
    'bg',
    'uk',
    'ru',
    'ar',
  ];
  const isDotThousandsLocale = dotThousandsLocales.some(l => hl.startsWith(l));

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let nStr = s;
  if (lastDot !== -1 && lastComma !== -1) {
    // Both separators present: the LAST one is the decimal separator
    const dec = Math.max(lastDot, lastComma);
    const intPart = s.slice(0, dec).replace(/[.,]/g, '');
    const decPart = s.slice(dec + 1);
    nStr = `${intPart}.${decPart}`;
  } else if (lastComma !== -1) {
    // Only comma: could be decimal (1,5) or thousands (1,000)
    const afterComma = s.slice(lastComma + 1);
    if (isDotThousandsLocale) {
      // In dot-thousands locales, comma is ALWAYS the decimal separator
      nStr = s.replace(',', '.');
    } else if (afterComma.length === 3 && s.indexOf(',') === lastComma) {
      // Likely thousands separator (e.g. "1,000")
      nStr = s.replace(',', '');
    } else {
      // Likely decimal separator (e.g. "1,5" or "2,34")
      nStr = s.replace(',', '.');
    }
  } else if (lastDot !== -1) {
    // Only dot: could be decimal (1.5) or thousands (1.000)
    const afterDot = s.slice(lastDot + 1);
    const dotCount = (s.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots = thousands separators (e.g. "1.234.567")
      nStr = s.replace(/\./g, '');
    } else if (isDotThousandsLocale && afterDot.length === 3) {
      // In dot-thousands locales, single dot with 3 digits = thousands (e.g. "1.234")
      nStr = s.replace('.', '');
    } else if (afterDot.length === 3 && mult > 1) {
      // Single dot with 3 digits after and a multiplier = likely thousands (e.g. "1.234K")
      nStr = s.replace('.', '');
    }
    // else: single dot = decimal (default behavior, nStr stays as-is)
  }
  const num = Number.parseFloat(nStr);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * mult);
}

export function getLikesFromDom() {
  const likeBtn =
    $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
    $e('like-button-view-model button') ||
    $e('button[aria-label*="like" i]') ||
    $e('ytd-menu-renderer like-button-view-model button');
  if (!likeBtn) return null;
  const aria = likeBtn.getAttribute('aria-label') || '';
  const m = aria.match(/([\d.,]+\s*[kKmMil]*)/i);
  if (m) {
    const parsed = parseCountText(m[1]);
    if (parsed != null) return parsed;
  }
  const countEl = likeBtn.querySelector('span, .yt-spec-button-shape-next__button-text-content');
  if (countEl) {
    const parsed = parseCountText(countEl.textContent);
    if (parsed != null) return parsed;
  }
  return null;
}

export async function ensureDislikesForCurrentVideo() {
  const videoId = getCurrentVideoId();
  if (!videoId) return null;
  const now = Date.now();
  if (
    __ytToolsRuntime.dislikesCache.videoId === videoId &&
    __ytToolsRuntime.dislikesCache.dislikes != null &&
    now - __ytToolsRuntime.dislikesCache.ts < 10 * 60 * 1000
  ) {
    return __ytToolsRuntime.dislikesCache.dislikes;
  }
  const persisted = getLikesDislikesFromPersistedCache(videoId);
  if (persisted && persisted.dislikes != null) {
    __ytToolsRuntime.dislikesCache = { videoId, dislikes: persisted.dislikes, ts: now };
    return persisted.dislikes;
  }
  try {
    const res = await fetch(`${apiDislikes}${videoId}`);
    const data = await res.json();
    const dislikes = Number(data?.dislikes);
    const viewCount = Number(data?.viewCount);
    const rating = Number(data?.rating);
    if (Number.isFinite(dislikes)) {
      __ytToolsRuntime.dislikesCache = { videoId, dislikes, ts: now };
      const likes = getLikesFromDom();
      setLikesDislikesToPersistedCache(videoId, {
        likes: likes != null ? likes : undefined,
        dislikes,
        viewCount: Number.isFinite(viewCount) ? viewCount : undefined,
        rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : undefined,
      });
      return dislikes;
    }
  } catch (e) {
    console.warn('[YT Tools] Dislike fetch error:', e);
  }
  return null;
}

function ensureBarExists() {
  if ($e('#yt-like-dislike-bar')) return true;
  const container = $e('#top-level-buttons-computed');
  if (!container) return false;
  const bar = document.createElement('div');
  bar.id = 'yt-like-dislike-bar';
  bar.style.cssText =
    'display:none;height:6px;background:#333;border-radius:3px;margin:8px 0;overflow:hidden;';
  bar.innerHTML =
    '<div class="yt-like-part" style="height:100%;float:left;"></div><div class="yt-dislike-part" style="height:100%;float:left;"></div>';
  container.insertAdjacentElement('afterend', bar);
  return true;
}

export function updateLikeDislikeBar(likes, dislikes) {
  if (likes == null || dislikes == null) return;
  const total = likes + dislikes;
  if (total <= 0) return;
  const likePercent = (likes / total) * 100;
  if (!ensureBarExists()) return;
  const bar = $e('#yt-like-dislike-bar');
  bar.style.display = 'block';
  const likePart = bar.querySelector('.yt-like-part');
  const dislikePart = bar.querySelector('.yt-dislike-part');
  bar.style.direction = 'ltr';
  bar.style.overflow = 'hidden';
  if (likePart) {
    likePart.style.background = '#22c55e';
    likePart.style.flexBasis = `${likePercent}%`;
    likePart.style.width = `${likePercent}%`;
  }
  if (dislikePart) {
    dislikePart.style.background = '#ef4444';
    dislikePart.style.flexBasis = `${100 - likePercent}%`;
    dislikePart.style.width = `${100 - likePercent}%`;
  }
}

// Retry helper
export function scheduleLikeBarUpdate(settings, attempts = 4) {
  if (!settings?.likeDislikeBar) return;
  let i = 0;
  const tryUpdate = async () => {
    if (i >= attempts) return;
    i++;
    const likes = getLikesFromDom();
    if (likes != null) {
      const dislikes = await ensureDislikesForCurrentVideo();
      if (dislikes != null) {
        updateLikeDislikeBar(likes, dislikes);
        return;
      }
    }
    setTimeout(tryUpdate, 600);
  };
  setTimeout(tryUpdate, 300);
}

export async function videoDislike() {
  const videoId = getCurrentVideoId();
  if (!videoId || !window.location.href.includes('youtube.com/watch')) return;
  const dislikes = await ensureDislikesForCurrentVideo();
  if (dislikes != null) {
    const dislikes_content =
      $e(
        '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button'
      ) || $e('dislike-button-view-model button');
    if (dislikes_content != null) {
      dislikes_content.style.cssText = 'width: 90px';
      dislikes_content.innerHTML = safeHTML(`
          <svg class="svg-dislike-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" /></svg>
          ${FormatterNumber(dislikes, 0)}`);
    }
  }
}

export async function shortDislike() {
  const validoVentanaShort = $m(
    '#button-bar > reel-action-bar-view-model > dislike-button-view-model > toggle-button-view-model > button-view-model > label > div > span'
  );
  if (validoVentanaShort && document.location.href.includes('/shorts/')) {
    const videoId = getCurrentVideoId();
    if (!videoId) return;
    const dislikes = await ensureDislikesForCurrentVideo();
    if (dislikes != null) {
      for (let i = 0; i < validoVentanaShort.length; i++) {
        validoVentanaShort[i].textContent = `${FormatterNumber(dislikes, 0)}`;
      }
    }
  }
}

export function applyLikeDislikeBarIfEnabled(settings) {
  const enabled = !!settings?.likeDislikeBar;
  const bar = $e('#yt-like-dislike-bar');
  if (bar) bar.style.display = enabled ? 'block' : 'none';

  if (enabled) {
    scheduleLikeBarUpdate(settings, 6);
  }
}

export function applyDislikeDisplayIfEnabled(settings) {
  if (!settings?.dislikes) return;
  if (isYTMusic) return;
  setTimeout(async () => {
    await videoDislike();
    await shortDislike();
  }, 1500);
}

// Hook navigation
if (typeof window !== 'undefined') {
  window.addEventListener('yt-navigate-finish', () => {
    if (isYTMusic) return;
    try {
      const settings = loadSettings();
      if (settings.likeDislikeBar) {
        scheduleLikeBarUpdate(settings, 4);
      }
      if (settings.dislikes) {
        setTimeout(async () => {
          await videoDislike();
          await shortDislike();
        }, 1500);
      }
    } catch (e) {
      console.warn('[YT Tools] Like/dislike nav handler error:', e);
    }
  });
}
