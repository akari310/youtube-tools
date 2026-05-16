// Feature: Audio-only Mode — hides video, shows background art
import { __ytToolsRuntime } from '../../utils/runtime.js';
import { $id } from '../../utils/dom.js';
import { readJsonGM } from '../../utils/storage.js';
import { STORAGE_KEYS } from '../../config/storage-keys.js';

const AUDIO_ONLY_TAB_OVERRIDE_KEY = 'ytToolsAudioOnlyTabOverrideMDCM';
const isYTMusic = location.hostname === 'music.youtube.com';

function getAudioOnlyTabOverride() {
  const value = window.sessionStorage.getItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

export function setAudioOnlyTabOverride(enabled, defaultEnabled) {
  if (!!enabled === !!defaultEnabled) {
    window.sessionStorage.removeItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
    return;
  }
  window.sessionStorage.setItem(AUDIO_ONLY_TAB_OVERRIDE_KEY, enabled ? 'true' : 'false');
}

export function getEffectiveAudioOnly(settings) {
  const override = getAudioOnlyTabOverride();
  return override === null ? !!settings?.audioOnly : override;
}

function getActiveAudioOnlyVideo() {
  const videos = Array.from(document.querySelectorAll('video'));
  if (isYTMusic) return videos[0] || null;
  return (
    videos.find(video => {
      const rect = video.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) ||
    videos[0] ||
    null
  );
}

async function getAudioOnlyThumbnailUrl() {
  try {
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.getVideoData === 'function') {
      const data = moviePlayer.getVideoData();
      if (data?.video_id) return `https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg`;
    }
  } catch (e) {
    /* ignore */
  }

  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  if (!videoId) return '';
  const host = isYTMusic ? 'i1.ytimg.com' : 'img.youtube.com';
  return `https://${host}/vi/${videoId}/hqdefault.jpg`;
}

function setAudioOnlyBackground(url) {
  let style = $id('yt-tools-audio-only-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'yt-tools-audio-only-style';
    document.documentElement.appendChild(style);
  }
  style.textContent = url
    ? `.yt-tools-audio-only-player{background-image:url("${url}")!important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important;}`
    : '';
}

export async function applyAudioOnlyMode(enabled) {
  const rt = __ytToolsRuntime.audioOnly;
  rt.enabled = !!enabled;
  document.body.classList.toggle('yt-tools-audio-only-active', rt.enabled);

  document
    .querySelectorAll('.yt-tools-audio-only-video')
    .forEach(el => el.classList.remove('yt-tools-audio-only-video'));
  document
    .querySelectorAll('.yt-tools-audio-only-player')
    .forEach(el => el.classList.remove('yt-tools-audio-only-player'));

  if (!rt.enabled) {
    rt.lastArtUrl = '';
    setAudioOnlyBackground('');
    if (rt.refreshTimer) {
      clearInterval(rt.refreshTimer);
      rt.refreshTimer = null;
    }
    return;
  }

  const video = getActiveAudioOnlyVideo();
  const player = video?.parentNode?.parentNode || video?.parentElement || null;
  if (video) video.classList.add('yt-tools-audio-only-video');
  if (player) player.classList.add('yt-tools-audio-only-player');

  const artUrl = await getAudioOnlyThumbnailUrl();
  if (artUrl && artUrl !== rt.lastArtUrl) {
    rt.lastArtUrl = artUrl;
    setAudioOnlyBackground(artUrl);
  }

  if (!rt.refreshTimer) {
    rt.refreshTimer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const settingsKey = isYTMusic ? STORAGE_KEYS.SETTINGS_YTM : STORAGE_KEYS.SETTINGS_YT;
      const settings = readJsonGM(settingsKey, {});
      applyAudioOnlyMode(getEffectiveAudioOnly(settings));
    }, 3000);
  }
}
