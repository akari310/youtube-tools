// ===========================================
// Video Info Panel (Header tab in settings)
// Extracted from legacy-full.js lines 5548-5716
// ===========================================
import { $e, $id, isYTMusic } from '../utils/dom.js';
import { safeHTML } from '../utils/trusted-types.js';
import { Notify } from '../utils/helpers.js';

let lastVideoInfoSnapshot = null;

function getMainVideoEl() {
  return $e('video.video-stream.html5-main-video') || $e('video');
}

function getCurrentVideoMeta() {
  try {
    const player = $id('movie_player');
    if (player && typeof player.getVideoData === 'function') {
      const d = player.getVideoData();
      return {
        title: d?.title || '',
        author: d?.author || '',
        thumb: d?.video_id ? `https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg` : '',
      };
    }
  } catch (e) {
    // fallback
  }
  return { title: '', author: '', thumb: '' };
}

function getCurrentVideoId() {
  try {
    if (location.pathname.startsWith('/shorts/')) {
      return location.pathname.split('/').filter(Boolean)[1] || null;
    }
    if (location.href.includes('youtube.com/watch')) {
      return new URLSearchParams(window.location.search).get('v');
    }
  } catch (e) {
    /* */
  }
  return null;
}

function getVideoInfoPlayerResponse() {
  try {
    const w = typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window;
    return w?.ytInitialPlayerResponse || window.ytInitialPlayerResponse || null;
  } catch (e) {
    return null;
  }
}

export function getVideoInfoSnapshot() {
  const video = getMainVideoEl();
  const meta = getCurrentVideoMeta();
  const videoId = getCurrentVideoId();
  const pr = getVideoInfoPlayerResponse();
  const vd = pr?.videoDetails || {};
  const micro = pr?.microformat?.playerMicroformatRenderer || {};
  const moviePlayer = $id('movie_player');
  let quality = '-';
  let availableQuality = '';

  try {
    if (moviePlayer && typeof moviePlayer.getPlaybackQuality === 'function') {
      quality = moviePlayer.getPlaybackQuality() || '-';
    } else if (video?.videoHeight) {
      quality = `${video.videoHeight}p`;
    }
    if (moviePlayer && typeof moviePlayer.getAvailableQualityLevels === 'function') {
      const levels = moviePlayer.getAvailableQualityLevels();
      if (Array.isArray(levels) && levels.length) availableQuality = levels.join(', ');
    }
  } catch (e) {
    /* */
  }

  const duration = Number(video?.duration || vd.lengthSeconds || 0);
  const currentTime = Number(video?.currentTime || 0);
  const progress = duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0;
  const title = (meta.title || vd.title || '').trim();
  const author = (meta.author || vd.author || '').trim();
  const thumb = meta.thumb || vd.thumbnail?.thumbnails?.slice?.(-1)?.[0]?.url || '';
  const viewCount = Number(vd.viewCount || micro.viewCount || 0);
  let state = 'No video';
  if (video) {
    if (video.ended) state = 'Ended';
    else if (video.paused) state = 'Paused';
    else state = 'Playing';
  }
  const playbackRate = Number(video?.playbackRate || 1);
  const volume = Number.isFinite(video?.volume) ? Math.round(video.volume * 100) : null;
  const url = videoId ? `${location.origin}/watch?v=${encodeURIComponent(videoId)}` : location.href;

  return {
    videoId: videoId || '',
    title,
    author,
    thumb,
    url,
    state,
    currentTime,
    duration,
    progress,
    quality,
    availableQuality,
    playbackRate,
    volume,
    views: Number.isFinite(viewCount) && viewCount > 0 ? viewCount : null,
    published: micro.publishDate || micro.uploadDate || '',
    isLive: !!vd.isLiveContent,
  };
}

function setVideoInfoText(id, value) {
  const el = $id(id);
  if (el) el.textContent = value || '-';
}

function formatVideoInfoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

export function updateVideoInfoPanel() {
  const root = $id('yt-video-info-panel');
  if (!root) return;
  const info = getVideoInfoSnapshot();
  lastVideoInfoSnapshot = info;
  const hasVideo = !!(info.videoId || info.title);
  const empty = $id('video-info-empty');
  const content = $id('video-info-content');
  if (empty) empty.style.display = hasVideo ? 'none' : 'block';
  if (content) content.style.display = hasVideo ? 'block' : 'none';
  if (!hasVideo) return;

  const thumb = $id('video-info-thumb');
  if (thumb) {
    if (info.thumb) {
      thumb.src = info.thumb;
      thumb.style.display = 'block';
    } else {
      thumb.removeAttribute('src');
      thumb.style.display = 'none';
    }
  }

  setVideoInfoText(
    'video-info-title',
    info.title || document.title.replace(/\s*-\s*YouTube\s*$/i, '')
  );
  setVideoInfoText(
    'video-info-channel',
    info.author || (info.isLive ? 'Live stream' : 'Unknown channel')
  );
  setVideoInfoText('video-info-id', info.videoId || '-');
  setVideoInfoText(
    'video-info-state',
    `${info.state}${info.playbackRate && info.playbackRate !== 1 ? ` • ${info.playbackRate}x` : ''}${info.volume != null ? ` • ${info.volume}%` : ''}`
  );
  setVideoInfoText(
    'video-info-time',
    info.duration > 0
      ? `${formatVideoInfoTime(info.currentTime)} / ${formatVideoInfoTime(info.duration)}`
      : formatVideoInfoTime(info.currentTime)
  );
  setVideoInfoText(
    'video-info-quality',
    info.availableQuality ? `${info.quality} (${info.availableQuality})` : info.quality
  );
  setVideoInfoText('video-info-views', info.views != null ? info.views.toLocaleString() : '-');
  setVideoInfoText('video-info-published', info.published || '-');

  const progress = $id('video-info-progress');
  if (progress) progress.style.width = `${info.progress}%`;
}

export function copyVideoInfoValue(type) {
  const info = lastVideoInfoSnapshot || getVideoInfoSnapshot();
  let text = '';
  if (type === 'url') text = info.url || location.href;
  else if (type === 'title') text = info.title || document.title.replace(/\s*-\s*YouTube\s*$/i, '');
  else if (type === 'json') {
    text = JSON.stringify(
      {
        title: info.title,
        author: info.author,
        videoId: info.videoId,
        url: info.url,
        duration: Math.floor(info.duration || 0),
        currentTime: Math.floor(info.currentTime || 0),
        quality: info.quality,
        views: info.views,
        published: info.published,
      },
      null,
      2
    );
  }
  if (!text) return;
  try {
    navigator.clipboard.writeText(text);
    Notify('success', 'Copied video info');
  } catch (e) {
    prompt('Copy video info:', text);
  }
}

/**
 * Initialize the video info panel: copy buttons + periodic update.
 */
export function initVideoInfoPanel(panelEl) {
  if (!panelEl) return;

  // Copy button delegation
  panelEl.addEventListener('click', e => {
    const btn = e.target?.closest?.('[data-video-copy]');
    if (!btn) return;
    e.preventDefault();
    copyVideoInfoValue(btn.getAttribute('data-video-copy'));
  });

  // Periodic update when headers tab is active
  if (!window.__ytToolsVideoInfoIntervalId) {
    window.__ytToolsVideoInfoIntervalId = setInterval(() => {
      if ($id('headers')?.classList?.contains('active')) {
        updateVideoInfoPanel();
      }
    }, 1000);
  }

  // Update when menu opens
  document.addEventListener('yt-tools-menu-opened', () => {
    setTimeout(updateVideoInfoPanel, 0);
  });
}
