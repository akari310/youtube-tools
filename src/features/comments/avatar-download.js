// ===========================================
// Avatar Download (Comment section)
// ===========================================
import { $m, $cl } from '../../utils/dom.js';
import { safeHTML, setHTML } from '../../utils/trusted-types.js';

export function setupAvatarDownload(enabled) {
  if (!enabled) {
    document.querySelectorAll('.yt-image-avatar-download').forEach(el => el.remove());
    return;
  }

  const avatars = $m('#author-thumbnail-button #img.style-scope.yt-img-shadow');

  avatars.forEach(img => {
    if (img.parentElement.querySelector('.yt-image-avatar-download')) return;

    const button = $cl('button');
    setHTML(button, '<i class="fa fa-download"></i>');
    button.classList.add('yt-image-avatar-download');
    button.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s;
    `;

    img.parentElement.style.position = 'relative';
    img.parentElement.appendChild(button);

    img.parentElement.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });
    img.parentElement.addEventListener('mouseleave', () => {
      button.style.opacity = '0';
    });

    button.onclick = async function (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        const imageUrl = img.src.split('=')[0];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const parentComment = img.closest('ytd-comment-thread-renderer, ytd-comment-renderer');
        const nameElement = parentComment?.querySelector('#author-text');
        let authorName = nameElement ? nameElement.textContent.trim() : 'avatar';
        authorName = authorName.replace(/[/\\:*?"<>|]/g, '');

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
  });
}
