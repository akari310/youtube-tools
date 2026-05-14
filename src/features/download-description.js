// ===========================================
// Download Description Video (copy description button)
// Extracted from legacy-full.js lines 7411-7453
// ===========================================
import { $e, $id, $cl, $m, isYTMusic } from '../utils/dom.js';
import { Notify } from '../utils/helpers.js';
import { safeHTML } from '../utils/trusted-types.js';

/**
 * Inject a "Copy description" button below the video description area.
 * YT only — YTM has no description row.
 */
export function initDownloadDescription(enabled = true) {
  if (isYTMusic) return;
  if (!window.location.href.includes('youtube.com/watch')) return;

  const existing = $e('#button_copy_description');
  if (!enabled) {
    if (existing) existing.remove();
    return;
  }
  if (existing && document.contains(existing)) return;
  if (existing) existing.remove(); // Cleanup if detached

  const containerDescription =
    $e('#bottom-row.ytd-watch-metadata') ||
    $e('#bottom-row.style-scope.ytd-watch-metadata') ||
    $e('ytd-description-renderer') ||
    $e('#description.ytd-watch-metadata');
  if (!containerDescription) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'button_copy_description';
  wrapper.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; margin-top: 10px; width: 100%;';

  const btn = document.createElement('button');
  btn.id = 'copy-description';
  btn.title = 'Copy description';
  btn.className = 'botones_div';
  btn.type = 'button';
  btn.style.cursor = 'pointer';

  const icon = document.createElement('i');
  icon.style.fontSize = '20px';
  icon.className = 'fa-solid fa-copy';
  btn.appendChild(icon);
  wrapper.appendChild(btn);

  containerDescription.insertAdjacentElement('beforebegin', wrapper);

  btn.addEventListener('click', () => {
    const ldJson = [...$m('script[type="application/ld+json"]')];
    for (const script of ldJson) {
      try {
        const data = JSON.parse(script.innerText);
        if (data['@type'] === 'VideoObject') {
          const description =
            `📅 Date published: ${data.uploadDate || 'N/A'}\n` +
            `Author: ${data.author || 'N/A'}\n` +
            `🎬 Name video: ${data.name || 'N/A'}\n` +
            `🖼️ Thumbnail: ${Array.isArray(data.thumbnailUrl) ? data.thumbnailUrl.join(', ') : data.thumbnailUrl || 'N/A'}\n` +
            `📝 Description: ${data.description || 'N/A'}\n\n\n` +
            `🎭 Category: ${data.genre || 'N/A'}\n`;

          navigator.clipboard.writeText(description);
          Notify('success', 'Description copied');
        }
      } catch (e) {
        Notify('error', 'Error parsing JSON-LD');
      }
    }
  });
}
