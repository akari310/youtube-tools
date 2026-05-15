// Feature: Avatar Download — adds download button to comment avatars
import { $m, $cl } from '../utils/dom.js';
import { safeHTML, setHTML } from '../utils/trusted-types.js';

export function setupAvatarDownload() {
  const avatars = $m('#author-thumbnail-button #img.style-scope.yt-img-shadow');

  avatars.forEach(img => {
    if (img.parentElement.querySelector('.yt-image-avatar-download')) return;

    const button = $cl('button');
    setHTML(button, '<i class="fa fa-download"></i>');
    button.classList.add('yt-image-avatar-download');

    button.onclick = async function () {
      try {
        const imageUrl = img.src.split('=')[0];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const parentComment = img.closest('ytd-comment-thread-renderer, ytd-comment-renderer');
        const nameElement = parentComment?.querySelector('#author-text');
        let authorName = nameElement ? nameElement.textContent.trim() : 'avatar';
        authorName = authorName.replace(/[\\:*?"<>|]/g, '');

        const link = $cl('a');
        link.href = blobUrl;
        link.download = `${authorName}_avatar.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (error) {
        console.error('[YT Tools] Error downloading avatar:', error);
      }
    };

    img.parentElement.style.position = 'relative';
    img.parentElement.appendChild(button);
  });
}
