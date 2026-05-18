import { $e } from '../utils/dom.js';
import { apiDislikes } from '../config/constants.js';
import {
  getLikesDislikesFromPersistedCache,
  setLikesDislikesToPersistedCache,
} from '../utils/storage.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { getCurrentVideoId, FormatterNumber } from '../utils/helpers.js';
import { isYTMusic, $m } from '../utils/dom.js';
import { loadSettings } from '../settings/settings-manager.js';
import { getLikesFromDom } from './like-dislike-bar/utils.js';
import { updateLikeDislikeBar } from './like-dislike-bar/bar.js';

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
      const currentVideoId = getCurrentVideoId();
      const currentSettings = loadSettings();

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

      // Update run-time cache only if videoId matches
      if (__ytToolsRuntime.dislikesCache.videoId === currentVideoId) {
        __ytToolsRuntime.dislikesCache.dislikes = newDislikes;
        __ytToolsRuntime.dislikesCache.likes = newLikes;

        // Also persist it so F5 uses the updated count as "original"
        setLikesDislikesToPersistedCache(currentVideoId, {
          likes: newLikes,
          dislikes: newDislikes,
          viewCount: __ytToolsRuntime.dislikesCache.viewCount,
          rating: __ytToolsRuntime.dislikesCache.rating,
        });
      }

      if (currentSettings.dislikes && textContent) {
        textContent.textContent = FormatterNumber(newDislikes, 0);
      }

      // Sync the like/dislike bar immediately
      if (currentSettings.likeDislikeBar) {
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
    // Update custom views/rating buttons from cache after fetch
    const persisted = getLikesDislikesFromPersistedCache(videoId);
    if (persisted) {
      if (persisted.viewCount != null) {
        __ytToolsRuntime.updateShortsViewsButton(videoId, persisted.viewCount);
      }
      if (persisted.rating != null) {
        __ytToolsRuntime.updateShortsRatingButton(videoId, persisted.rating);
      }
    }
  }
}

// Export via runtime so shorts observer can trigger data refresh
__ytToolsRuntime.triggerShortsDislike = shortDislike;

export function applyLikeDislikeBarIfEnabled(settings) {
  console.log(
    '[YT Tools] applyLikeDislikeBarIfEnabled called, settings:',
    settings?.likeDislikeBar
  );
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
