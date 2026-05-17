// ===========================================
// Shorts Reel Bar Buttons (Classic, Views, Rating)
// Extracted from legacy-full.js lines 7645-7782
// ===========================================
import { $e, isYTMusic } from '../../utils/dom.js';
import { FormatterNumber } from '../../utils/helpers.js';
import { safeHTML, setHTML } from '../../utils/trusted-types.js';
import { getLikesDislikesFromPersistedCache } from '../../utils/storage.js';
import { __ytToolsRuntime } from '../../utils/runtime.js';
import { apiDislikes } from '../../config/constants.js';

// Inject CSS for custom button styling (avoids using YT classes that cause SPA reload)
(function injectStyles() {
  const id = 'yt-tools-short-btn-style';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .yt-tools-short-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 40px !important;
      height: 40px !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
    }
    .yt-tools-short-btn:hover {
      background: rgba(255, 255, 255, 0.2) !important;
    }
    .yt-tools-short-btn svg {
      width: 24px !important;
      height: 24px !important;
      display: block !important;
    }
  `;
  document.head.appendChild(style);
})();

const eyeIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>';
const classicIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" /><path d="M16 3l-4 4l-4 -4" /></svg>';
const starIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

const redirectToClassic = () => {
  const videoId = window.location.pathname.split('/').pop();
  const classicUrl = `https://www.youtube.com/watch?v=${videoId}`;
  window.open(classicUrl, '_blank');
  const vid = $e('video.video-stream.html5-main-video');
  if (vid) vid.pause();
};

function createReelBarButton(opts) {
  const wrap = document.createElement('div');
  wrap.className = 'button-view-model ytSpecButtonViewModelHost';
  if (opts.dataAttr) wrap.setAttribute(opts.dataAttr, '1');

  const label = document.createElement('label');
  label.className = 'yt-spec-button-shape-with-label ytSpecButtonShapeWithLabelHost';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'yt-tools-short-btn';
  button.title = opts.title || '';
  button.setAttribute('aria-label', opts.ariaLabel || '');

  const iconDiv = document.createElement('div');
  iconDiv.className = 'yt-spec-button-shape-next__icon';
  iconDiv.setAttribute('aria-hidden', 'true');

  const iconSpan = document.createElement('span');
  iconSpan.className = 'yt-icon-shape ytSpecIconShapeHost';
  if (opts.iconSvg) {
    try {
      const tempDiv = document.createElement('div');
      setHTML(tempDiv, opts.iconSvg);
      while (tempDiv.firstChild) {
        iconSpan.appendChild(tempDiv.firstChild);
      }
    } catch (e) {
      console.warn('[YT Tools] SVG parse error:', e);
    }
  }
  iconDiv.appendChild(iconSpan);
  button.appendChild(iconDiv);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'yt-spec-button-shape-with-label__label';
  labelDiv.setAttribute('aria-hidden', 'false');

  const labelSpan = document.createElement('span');
  labelSpan.className =
    'yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--text-alignment-center';
  labelSpan.setAttribute('role', 'text');
  labelSpan.textContent = opts.labelText || '';

  labelDiv.appendChild(labelSpan);
  label.appendChild(button);
  label.appendChild(labelDiv);
  wrap.appendChild(label);

  if (opts.onclick) button.addEventListener('click', opts.onclick);
  return wrap;
}

export function updateShortsViewsButton(videoId, viewCount) {
  const bar = $e('reel-action-bar-view-model');
  if (!bar) return;
  const viewsWrap = bar.querySelector('[data-yt-tools-shorts-views]');
  if (!viewsWrap) return;
  const labelSpan = viewsWrap.querySelector(
    '.yt-spec-button-shape-with-label__label span, [role="text"]'
  );
  if (!labelSpan) return;
  labelSpan.textContent =
    Number.isFinite(viewCount) && viewCount >= 0 ? FormatterNumber(viewCount, 0) : '—';
}

export function updateShortsRatingButton(videoId, rating) {
  const bar = $e('reel-action-bar-view-model');
  if (!bar) return;
  const ratingWrap = bar.querySelector('[data-yt-tools-shorts-rating]');
  if (!ratingWrap) return;
  const labelSpan = ratingWrap.querySelector(
    '.yt-spec-button-shape-with-label__label span, [role="text"]'
  );
  if (!labelSpan) return;
  labelSpan.textContent =
    Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating.toFixed(1) : '—';
}

export function insertReelBarButtons() {
  if (isYTMusic) return;
  const isShortsPage = document.location.pathname.startsWith('/shorts');
  const bar = $e('reel-action-bar-view-model');
  if (!isShortsPage || !bar) {
    document
      .querySelectorAll(
        '[data-yt-tools-shorts-classic], [data-yt-tools-shorts-views], [data-yt-tools-shorts-rating]'
      )
      .forEach(el => el.remove());
    return;
  }
  if (bar.querySelector('[data-yt-tools-shorts-classic]')) return;

  const classicBtn = createReelBarButton({
    dataAttr: 'data-yt-tools-shorts-classic',
    title: 'Classic mode',
    ariaLabel: 'Classic mode',
    iconSvg: classicIconSvg,
    labelText: '',
    onclick: redirectToClassic,
  });
  const viewsBtn = createReelBarButton({
    dataAttr: 'data-yt-tools-shorts-views',
    title: 'Views',
    ariaLabel: 'Views',
    iconSvg: eyeIconSvg,
    labelText: '—',
    onclick: function () {},
  });
  const ratingBtn = createReelBarButton({
    dataAttr: 'data-yt-tools-shorts-rating',
    title: 'Rating (likes/dislikes)',
    ariaLabel: 'Rating',
    iconSvg: starIconSvg,
    labelText: '—',
    onclick: function () {},
  });

  bar.insertBefore(ratingBtn, bar.firstChild);
  bar.insertBefore(viewsBtn, bar.firstChild);
  bar.insertBefore(classicBtn, bar.firstChild);

  const videoId = document.location.pathname.split('/').filter(Boolean)[1];
  if (videoId) {
    const persisted = getLikesDislikesFromPersistedCache(videoId);
    if (persisted?.viewCount != null) updateShortsViewsButton(videoId, persisted.viewCount);
    if (persisted?.rating != null) updateShortsRatingButton(videoId, persisted.rating);
  }
  __ytToolsRuntime.updateShortsViewsButton = updateShortsViewsButton;
  __ytToolsRuntime.updateShortsRatingButton = updateShortsRatingButton;
}

// Fetch view/rating data for current short and update buttons
function fetchShortsData() {
  const videoId = document.location.pathname.split('/').filter(Boolean)[1];
  if (!videoId) return;
  const cached = getLikesDislikesFromPersistedCache(videoId);
  if (cached?.viewCount != null && cached?.rating != null) {
    if (Number.isFinite(cached.viewCount)) updateShortsViewsButton(videoId, cached.viewCount);
    if (Number.isFinite(cached.rating) && cached.rating >= 0 && cached.rating <= 5) updateShortsRatingButton(videoId, cached.rating);
    return;
  }
  fetch(`${apiDislikes}${videoId}`)
    .then(r => r.json())
    .then(data => {
      const currentId = document.location.pathname.split('/').filter(Boolean)[1];
      if (currentId !== videoId) return;
      const viewCount = Number(data?.viewCount);
      const rating = Number(data?.rating);
      if (Number.isFinite(viewCount)) updateShortsViewsButton(videoId, viewCount);
      if (Number.isFinite(rating) && rating >= 0 && rating <= 5) updateShortsRatingButton(videoId, rating);
    })
    .catch(() => {});
}

/**
 * Initialize shorts reel buttons.
 * Inserts buttons on shorts pages, listens for navigation events.
 */
export function initShortsReelButtons() {
  if (isYTMusic) return;
  if (__ytToolsRuntime.shortsReelButtonsInitialized) return;
  __ytToolsRuntime.shortsReelButtonsInitialized = true;

  let lastShortId = null;

  function onShortChange() {
    if (!window.location.pathname.startsWith('/shorts')) return;
    const videoId = window.location.pathname.split('/').filter(Boolean)[1];
    if (!videoId || videoId === lastShortId) return;
    lastShortId = videoId;
    setTimeout(() => {
      insertReelBarButtons();
      fetchShortsData();
    }, 300);
  }

  // Initial load
  onShortChange();

  // Poll URL every 1s to detect short ID changes (most reliable for SPA)
  setInterval(onShortChange, 1000);

  // SPA navigation events (backup)
  document.addEventListener('yt-page-data-updated', onShortChange);
  document.addEventListener('yt-navigate-finish', onShortChange);
  window.addEventListener('popstate', onShortChange);
}
