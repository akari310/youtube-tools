// ===========================================
// Comment Observer (smart IntersectionObserver + MutationObserver)
// Extracted from legacy-full.js lines 7523-7578
// ===========================================
import { isYTMusic } from '../../utils/dom.js';

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
      _commentIO.disconnect();
    } catch (e) {
      /* */
    }
    _commentIO = null;
  }
  if (_commentMO) {
    try {
      _commentMO.disconnect();
    } catch (e) {
      /* */
    }
    _commentMO = null;
  }

  _commentIO = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      _commentMO = new MutationObserver(mutations => {
        let shouldUpdate = false;
        for (const m of mutations) {
          if (m.addedNodes.length > 0) {
            shouldUpdate = true;
            break;
          }
        }

        if (shouldUpdate) {
          window.requestAnimationFrame(() => {
            // Dispatch event so feature modules can react
            document.dispatchEvent(
              new CustomEvent('yt-tools-comments-updated', {
                detail: { settings },
              })
            );
          });
        }
      });

      const commentContents = document.querySelector('ytd-comments #contents');
      if (commentContents) {
        _commentMO.observe(commentContents, {
          childList: true,
          subtree: true,
        });
      }

      _commentIO.disconnect();
    }
  });

  _commentIO.observe(commentsContainer);
}

/**
 * Setup navigation listener to reinit comment observer on page change.
 */
export function setupCommentNavListener(settings) {
  if (isYTMusic) return;

  if (!window.__ytToolsCommentNavBound) {
    window.__ytToolsCommentNavBound = true;
    document.addEventListener('yt-navigate-finish', () => {
      setTimeout(() => initCommentObserver(settings), 1500);
    });
  }

  initCommentObserver(settings);
}
