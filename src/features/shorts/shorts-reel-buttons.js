// ===========================================
// Shorts Reel Bar Buttons (Classic, Views, Rating)
// Extracted from legacy-full.js lines 7645-7782
// ===========================================
import { $e, isYTMusic } from '../../utils/dom.js';
import { FormatterNumber } from '../../utils/helpers.js';
import { safeHTML } from '../../utils/trusted-types.js';
import { getLikesDislikesFromPersistedCache } from '../../utils/storage.js';
import { __ytToolsRuntime } from '../../utils/runtime.js';

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
  button.className =
    'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button';
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
      tempDiv.innerHTML = safeHTML(opts.iconSvg);
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

/**
 * Initialize shorts reel buttons.
 * Inserts buttons on shorts pages, listens for navigation events.
 */
export function initShortsReelButtons() {
  if (isYTMusic) return;

  if (window.location.pathname.startsWith('/shorts')) {
    insertReelBarButtons();
  }

  // Re-insert on SPA navigation
  if (!window.__ytToolsPageDataBound) {
    window.__ytToolsPageDataBound = true;
    document.addEventListener('yt-page-data-updated', () => {
      requestAnimationFrame(() => {
        if (window.location.pathname.startsWith('/shorts')) {
          insertReelBarButtons();
        }
      });
    });
  }

  // Shorts DOM observer (YT only) – guarded via __ytToolsRuntime.shortsObserver
  if (!isYTMusic) {
    const contentScrollable = $e(
      '.anchored-panel.style-scope.ytd-shorts #contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer'
    );
    if (contentScrollable) {
      // Disconnect previous Shorts observer if it exists
      if (__ytToolsRuntime.shortsObserver) {
        try {
          __ytToolsRuntime.shortsObserver.disconnect();
        } catch (e) {}
        __ytToolsRuntime.shortsObserver = null;
      }
      let domTimeout;
      __ytToolsRuntime.shortsObserver = new MutationObserver(() => {
        if (domTimeout) clearTimeout(domTimeout);
        domTimeout = setTimeout(() => {
          insertReelBarButtons();
          // addIcon(); // If addIcon is needed, it should be implemented or called here.
        }, 300);
      });

      __ytToolsRuntime.shortsObserver.observe(contentScrollable, { childList: true, subtree: true });
    }
  }
}
