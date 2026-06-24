// ===========================================
// Comment Observer (smart IntersectionObserver + MutationObserver)
// Extracted from legacy-full.js lines 7523-7578
// ===========================================
import { isYTMusic } from '../../utils/dom.js';
import { trackObserver, untrackObserver } from '../../utils/cleanup-manager.js';
import { debounce } from '../../utils/debounce.js';

let _commentIO = null;
let _commentMO = null;

/**
 * Use IntersectionObserver to wait until #comments is visible,
 * then use MutationObserver to detect new comments and trigger
 * avatar download buttons + translation buttons.
 */
export function initCommentObserver(settings) {
  if (isYTMusic) return;

  const commentsContainer = document.querySelector('#comments');
  if (!commentsContainer) return;

  // Disconnect previous observers to avoid duplicates
  if (_commentIO) {
    try {
      untrackObserver(_commentIO);
    } catch {
      /* */
    }
    _commentIO = null;
  }
  if (_commentMO) {
    try {
      untrackObserver(_commentMO);
    } catch {
      /* */
    }
    _commentMO = null;
  }

  _commentIO = trackObserver(
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const dispatchCommentsUpdated = debounce(() => {
          document.dispatchEvent(
            new CustomEvent('yt-tools-comments-updated', {
              detail: { settings },
            })
          );
        }, 500);

        _commentMO = trackObserver(
          new MutationObserver(mutations => {
            let shouldUpdate = false;
            for (const m of mutations) {
              if (m.addedNodes.length > 0) {
                shouldUpdate = true;
                break;
              }
            }

            if (shouldUpdate) {
              window.requestAnimationFrame(() => {
                dispatchCommentsUpdated();
              });
            }
          })
        );

        const commentContents = document.querySelector('ytd-comments #contents');
        if (commentContents) {
          _commentMO.observe(commentContents, {
            childList: true,
            subtree: true,
          });
        }

        untrackObserver(_commentIO);
      }
    })
  );

  _commentIO.observe(commentsContainer);
}

/**
 * Re-init comment observer, called by main.js on page load and yt-navigate-finish.
 * We use a slight delay to ensure the DOM is ready after navigation.
 */
export function setupCommentNavListener(settings) {
  if (isYTMusic) return;

  setTimeout(() => initCommentObserver(settings), 1500);
}
