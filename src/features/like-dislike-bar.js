import { $e, $id } from '../utils/dom.js';
import { apiDislikes } from '../config/constants.js';
import {
  getLikesDislikesFromPersistedCache,
  setLikesDislikesToPersistedCache,
} from '../utils/storage.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { getCurrentVideoId, FormatterNumber } from '../utils/helpers.js';
import { safeHTML, setHTML } from '../utils/trusted-types.js';
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
    'vi',
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

  // Use full button text — includes compact suffix (e.g. "3,4 N" → 3400)
  const btnText = likeBtn.textContent;
  if (btnText) {
    const parsed = parseCountText(btnText);
    if (parsed != null) return parsed;
  }

  // Fallback to aria-label — extract raw number only, ignore grammatical words like "nghìn"
  const aria = likeBtn.getAttribute('aria-label') || '';
  const m = aria.match(/([\d.,]+)/);
  if (m) {
    const parsed = parseCountText(m[1]);
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
  let bar = $e('#yt-like-dislike-bar-mdcm');
  
  // If bar exists but is not in the document, remove it so we can re-create/re-attach
  if (bar && !document.contains(bar)) {
    console.log('[YT Tools] Bar detached, re-attaching...');
    bar.remove();
    bar = null;
  }

  if (bar) return bar;

  bar = document.createElement('div');
  bar.id = 'yt-like-dislike-bar-mdcm';
  bar.style.cssText = `
    display: flex;
    height: 8px;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin: 12px 0;
    position: relative;
    z-index: 1000;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  `;
  setHTML(
    bar,
    `
    <div class="like" style="width: 50%; height: 100%; background: #3ea6ff; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
    <div class="dislike" style="width: 50%; height: 100%; background: #ff4e45; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
  `
  );

  const targets = [
    $e('ytd-watch-metadata #above-the-fold'),
    $e('ytd-watch-metadata #actions'),
    $id('button_copy_description'),
    $e('#top-level-buttons-computed')
  ];

  for (const target of targets) {
    if (target) {
      console.log('[YT Tools] Appending bar to:', target.id || target.tagName);
      // If appending to above-the-fold, insert at top
      if (target.id === 'above-the-fold') {
        target.insertAdjacentElement('afterbegin', bar);
      } else {
        target.appendChild(bar);
      }
      return bar;
    }
  }

  return null;
}

export function updateLikeDislikeBar(likes, dislikes) {
  const l = Number(likes);
  const d = Number(dislikes);
  if (!Number.isFinite(l) || !Number.isFinite(d)) return;

  const bar = ensureBarExists();
  if (!bar) return;

  const total = l + d;
  const likePercent = total > 0 ? Math.max(0, Math.min(100, (l / total) * 100)) : 50;

  bar.style.display = 'flex';
  const likePart = bar.querySelector('.like');
  const dislikePart = bar.querySelector('.dislike');

  if (likePart) likePart.style.width = `${likePercent}%`;
  if (dislikePart) dislikePart.style.width = `${100 - likePercent}%`;

  bar.title = `Likes: ${l.toLocaleString()} | Dislikes: ${d.toLocaleString()}`;
}

// Retry helper
export function scheduleLikeBarUpdate(settings, attempts = 15) {
  if (!settings?.likeDislikeBar) return;
  let i = 0;
  const tryUpdate = async () => {
    if (i >= attempts) return;
    i++;
    const likes = getLikesFromDom();
    const dislikes = await ensureDislikesForCurrentVideo();
    console.log(`[YT Tools] Try update bar #${i}: likes=${likes}, dislikes=${dislikes}`);
    if (likes != null && dislikes != null) {
      updateLikeDislikeBar(likes, dislikes);
      return;
    }
    setTimeout(tryUpdate, 1000);
  };
  setTimeout(tryUpdate, 500);
}

export async function videoDislike() {
  const videoId = getCurrentVideoId();
  if (!videoId || !window.location.href.includes('youtube.com/watch')) return;
  if (isYTMusic) return;

  const data = await ensureDislikesForCurrentVideo();
  if (!data) return;

  const dislikes = typeof data === 'object' ? data.dislikes : data;
  const dislikes_btn =
    $e(
      '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button'
    ) || $e('dislike-button-view-model button');

  if (dislikes_btn != null) {
    const settings = loadSettings();

    // Find or create our custom count element
    let textContent = dislikes_btn.querySelector('.yt-tools-dislike-count');
    if (!textContent) {
      textContent = document.createElement('div');
      textContent.className = 'ytSpecButtonShapeNextButtonTextContent yt-tools-dislike-count';

      // Insert it after the icon container
      const iconDiv = dislikes_btn.querySelector('.ytSpecButtonShapeNextIcon');
      if (iconDiv) {
        iconDiv.insertAdjacentElement('afterend', textContent);
        // Convert button style to icon+text layout
        dislikes_btn.classList.add('ytSpecButtonShapeNextIconLeading');
        dislikes_btn.classList.remove('ytSpecButtonShapeNextIconButton');
      } else {
        dislikes_btn.appendChild(textContent);
      }
    }

    if (settings.dislikes) {
      textContent.textContent = FormatterNumber(dislikes, 0);
      textContent.style.display = 'block';
      textContent.style.marginLeft = '6px';
    } else {
      textContent.style.display = 'none';
    }

    const likes_btn =
      $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
      $e('like-button-view-model button') ||
      $e('segmented-like-dislike-button-view-model like-button-view-model button');

    // Capture current state as "initial" for this data load
    dislikes_btn.dataset.initialState = dislikes_btn.getAttribute('aria-pressed') === 'true';
    dislikes_btn.dataset.originalCount = dislikes;

    if (likes_btn) {
      likes_btn.dataset.initialState = likes_btn.getAttribute('aria-pressed') === 'true';
      likes_btn.dataset.originalCount =
        typeof data === 'object' ? data.likes || getLikesFromDom() : getLikesFromDom();
    }

    const updateCount = () => {
      // Dislikes calculation
      const isDislikePressed = dislikes_btn.getAttribute('aria-pressed') === 'true';
      const wasDislikePressed = dislikes_btn.dataset.initialState === 'true';
      const originalDislikes = Number(dislikes_btn.dataset.originalCount);

      let dislikeOffset = 0;
      if (!wasDislikePressed && isDislikePressed) dislikeOffset = 1;
      else if (wasDislikePressed && !isDislikePressed) dislikeOffset = -1;

      const newDislikes = Math.max(0, originalDislikes + dislikeOffset);

      // Likes calculation
      let newLikes = (typeof data === 'object' ? data.likes : null) || getLikesFromDom() || 0;
      if (likes_btn) {
        const isLikePressed = likes_btn.getAttribute('aria-pressed') === 'true';
        const wasLikePressed = likes_btn.dataset.initialState === 'true';
        const originalLikes = Number(likes_btn.dataset.originalCount);

        let likeOffset = 0;
        if (!wasLikePressed && isLikePressed) likeOffset = 1;
        else if (wasLikePressed && !isLikePressed) likeOffset = -1;

        newLikes = Math.max(0, originalLikes + likeOffset);
      }

      // Update run-time cache
      if (__ytToolsRuntime.dislikesCache.videoId === videoId) {
        __ytToolsRuntime.dislikesCache.dislikes = newDislikes;
        __ytToolsRuntime.dislikesCache.likes = newLikes;

        // Also persist it so F5 uses the updated count as "original"
        setLikesDislikesToPersistedCache(videoId, {
          likes: newLikes,
          dislikes: newDislikes,
          viewCount: __ytToolsRuntime.dislikesCache.viewCount,
          rating: __ytToolsRuntime.dislikesCache.rating,
        });
      }

      if (settings.dislikes && textContent) {
        textContent.textContent = FormatterNumber(newDislikes, 0);
      }

      // Sync the like/dislike bar immediately
      if (settings.likeDislikeBar) {
        updateLikeDislikeBar(newLikes, newDislikes);
      }
    };

    // Attach listeners if not already attached
    if (!dislikes_btn.dataset.listenerAttached) {
      dislikes_btn.addEventListener('click', () => setTimeout(updateCount, 100));
      if (likes_btn) {
        likes_btn.addEventListener('click', () => setTimeout(updateCount, 100));
      }
      dislikes_btn.dataset.listenerAttached = 'true';
    }

    // Initial bar update
    if (settings.likeDislikeBar) {
      updateLikeDislikeBar(
        likes_btn ? Number(likes_btn.dataset.originalCount) : 0,
        Number(dislikes_btn.dataset.originalCount)
      );
    }
  }
}

export async function shortDislike() {
  const validoVentanaShort = $m(
    '#button-bar > reel-action-bar-view-model > dislike-button-view-model > toggle-button-view-model > button-view-model > label > div > span'
  );
  if (validoVentanaShort.length > 0 && document.location.href.includes('/shorts/')) {
    const videoId = getCurrentVideoId();
    if (!videoId) return;
    const data = await ensureDislikesForCurrentVideo();
    const dislikes = typeof data === 'object' ? data.dislikes : data;
    if (dislikes != null) {
      for (let i = 0; i < validoVentanaShort.length; i++) {
        validoVentanaShort[i].textContent = `${FormatterNumber(dislikes, 0)}`;
      }
    }
  }
}

export function applyLikeDislikeBarIfEnabled(settings) {
  console.log('[YT Tools] applyLikeDislikeBarIfEnabled called, settings:', settings?.likeDislikeBar);
  const enabled = !!settings?.likeDislikeBar;
  const bar = $e('#yt-like-dislike-bar-mdcm');
  if (bar) bar.style.display = enabled ? 'flex' : 'none';

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

// Hook navigation — only when at least one related feature is enabled
if (typeof window !== 'undefined') {
  let _navHandlerActive = false;
  window.addEventListener('yt-navigate-finish', () => {
    if (isYTMusic) return;
    try {
      const settings = loadSettings();
      const needsRun = settings?.likeDislikeBar || settings?.dislikes;
      if (!needsRun) {
        if (_navHandlerActive) _navHandlerActive = false;
        return;
      }
      if (!_navHandlerActive) _navHandlerActive = true;
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
