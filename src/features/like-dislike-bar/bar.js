import { $e, $id } from '../../utils/dom.js';
import { setHTML } from '../../utils/trusted-types.js';

function ensureBarExists() {
  let bar = $e('#yt-like-dislike-bar-mdcm');

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
    $e('#top-level-buttons-computed'),
  ];

  for (const target of targets) {
    if (target) {
      console.log('[YT Tools] Appending bar to:', target.id || target.tagName);
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
