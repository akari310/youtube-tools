import { $e } from '../utils/dom.js';
import { __ytToolsRuntime } from '../utils/runtime.js';

const DEFAULT_SIZE = 100;

function getVideoEl() {
  return $e('video') || $e('#movie_player video');
}

export function applyPlayerSize(size) {
  const video = getVideoEl();
  if (!video) return;
  const pct = Math.max(50, Math.min(150, Number(size) || DEFAULT_SIZE));
  video.style.transform = `scale(${pct / 100})`;
  video.style.transformOrigin = 'center center';
}

export function resetPlayerSize() {
  const video = getVideoEl();
  if (video) video.style.transform = '';
}

export function initPlayerSize(settings) {
  if (settings?.playerSize) {
    applyPlayerSize(settings.playerSize);
  }

  if (!__ytToolsRuntime.playerSizeNavBound) {
    __ytToolsRuntime.playerSizeNavBound = true;
    window.addEventListener('yt-navigate-finish', () => {
      try {
        const s = JSON.parse(GM_getValue('ytSettingsMDCM', '{}'));
        if (s?.playerSize) applyPlayerSize(s.playerSize);
      } catch {}
    });
  }
}
