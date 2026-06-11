import { pageWindow, pageDocument, isYTMusic } from '../utils/dom.js';
import {
  getState,
  setCanvas,
  setCtx,
  setAudioCtx,
  setAnalyser,
  setSource,
  setDataArray,
  setBufferLength,
  setSmoothedData,
  setIsSetup,
  setCurrentVideo,
  setAnimationId,
  setWaveStyle,
} from '../utils/state.js';
import { SMOOTHING_FACTOR, CANVAS_HEIGHT, SCALE, PROCESSED_FLAG } from '../config/constants.js';
import { saveSettingsFromDOM } from '../settings/persistence.js';
import { trackObserver, untrackObserver } from '../utils/cleanup-manager.js';

const PW = pageWindow;
const PD = pageDocument;

const s = getState();

/** Cached wave accent color — refreshed on theme change or init. */
let cachedWaveAccent = '#06b6d4';

function getThemeCSS(varName, fallback = '') {
  try {
    const val = PW().getComputedStyle(PD().documentElement).getPropertyValue(varName).trim();
    return val || fallback;
  } catch {
    return fallback;
  }
}

function refreshWaveThemeColor() {
  cachedWaveAccent = getThemeCSS('--yt-tools-wave-color', '#06b6d4');
}

function waveThemeColors() {
  return { accent: cachedWaveAccent };
}
/** After a failed tap into the video graph, avoid hammering setup on every DOM mutation (YouTube is noisy). */
const WAVE_FAIL_RETRY_MS = 4000;
let waveVisualizerUnloadBound = false;
let videoObserver = null;
let observerDebounce = null;
/** Last settings object passed to `initWaveVisualizer` — used by `checkForVideo` / observer. */
let waveSettingsSnapshot = null;
/** Unlock gesture listeners — tracked for cleanup. */
let waveUnlockHandlers = [];

function ensureWaveMutationObserver() {
  if (!waveSettingsSnapshot?.waveVisualizer || videoObserver) return;
  videoObserver = trackObserver(
    new MutationObserver(() => {
      clearTimeout(observerDebounce);
      observerDebounce = setTimeout(() => checkForVideo(), 200);
    })
  );
  const target =
    PD().querySelector('#movie_player') ||
    PD().querySelector('ytmusic-player-bar') ||
    PD().querySelector('#player-bar') ||
    PD().body;
  videoObserver.observe(target, { childList: true, subtree: true });
}

/**
 * Legacy-style gate: only attach the analyzer on real watch surfaces (watch URL, shorts, live, miniplayer).
 * Recreates graph when the primary `<video>` changes or setup is incomplete; otherwise nudges visibility.
 */
function checkForVideo() {
  const settings = waveSettingsSnapshot;
  if (!settings?.waveVisualizer) {
    cleanupWaveVisualizer(true);
    return;
  }

  const href = PW().location.href;
  const video = PD().querySelector('video');
  const miniPlayer = PD().querySelector('.ytp-miniplayer-ui');
  const urlMatchesPlayer =
    href.includes('/watch') || href.includes('/shorts/') || href.includes('youtu.be/') || /youtube\.com\/live\//.test(href);
  const inContext = (video && (urlMatchesPlayer || isYTMusic)) || !!miniPlayer;

  console.log('[WaveViz] checkForVideo - video found:', !!video, 'inContext:', inContext, 'url:', href);

  if (!inContext || !video) {
    console.log('[WaveViz] No video in context, skipping setup');
    cleanupWaveVisualizer(false);
    ensureWaveMutationObserver();
    return;
  }

  if (video !== s.currentVideo || !s.isSetup) {
    cleanupWaveVisualizer(false);
    setupWaveForVideo(video);
    // Nếu setup chưa thành công, retry sau
    if (!s.isSetup) {
      setTimeout(() => checkForVideo(), WAVE_FAIL_RETRY_MS);
    }
  } else if (!video.paused) {
    showCanvas();
  }

  ensureWaveMutationObserver();
}

function bindWaveVisualizerUnload() {
  if (waveVisualizerUnloadBound) return;
  PW().addEventListener('beforeunload', () => cleanupWaveVisualizer(true));
  PW().addEventListener('pagehide', () => cleanupWaveVisualizer(true));
  PW().addEventListener('yt-navigate-finish', () => {
    cleanupWaveVisualizer(false);
    waveVisualizerUnloadBound = false;
  });
  waveVisualizerUnloadBound = true;
}

function createWaveSource(audioCtx, video) {
  // Try to connect directly to the video element
  try {
    return audioCtx.createMediaElementSource(video);
  } catch (e) {
    // YouTube already connected the video to its own AudioContext.
    // Fall back to captureStream() — this captures the media output independently.
    if (video.captureStream) {
      try {
        const stream = video.captureStream();
        return audioCtx.createMediaStreamSource(stream);
      } catch (_) {
        console.warn('[WaveViz] captureStream also failed:', _);
      }
    }
    console.warn(
      '[WaveViz] Cannot create audio source — video already connected and captureStream unavailable.'
    );
    return null;
  }
}

function updateCanvasSize() {
  if (s.canvas) {
    s.canvas.width = PW().innerWidth;
    s.canvas.height = CANVAS_HEIGHT;
  }
}

function resetAudioState() {
  teardownSource();
  setCurrentVideo(null);
}

export function cleanupWaveVisualizer(isUnload = false) {
  resetAudioState();

  // Close AudioContext only on full unload
  if (isUnload) {
    if (s.audioCtx && s.audioCtx.state !== 'closed') {
      try {
        s.audioCtx.close();
      } catch (_) {}
    }
    setAudioCtx(null);
    // Clear cached sources on full unload
    PD()
      .querySelectorAll('video')
      .forEach(v => {
        delete v.__ytToolsAudioSource;
      });
  }

  PW().__ytModularWaveActive = false;

  // Remove canvas
  if (s.canvas && s.canvas.parentNode) {
    s.canvas.parentNode.removeChild(s.canvas);
  }
  setCanvas(null);
  setCtx(null);

  // Remove video event listeners
  PD()
    .querySelectorAll('video')
    .forEach(v => {
      v.removeEventListener('play', showCanvas);
      v.removeEventListener('pause', hideCanvas);
      v.removeEventListener('ended', hideCanvas);
      delete v._ytWaveFail;
      delete v._ytWaveRetryAfter;
      delete v[PROCESSED_FLAG];
    });

  PW().removeEventListener('resize', updateCanvasSize);

  // Clean up observer
  if (videoObserver) {
    untrackObserver(videoObserver);
    videoObserver = null;
  }
  clearTimeout(observerDebounce);
  observerDebounce = null;

  // Clean up unlock gesture listeners
  waveUnlockHandlers.forEach(({ el, type, handler }) => {
    try {
      el.removeEventListener(type, handler);
    } catch {}
  });
  waveUnlockHandlers = [];
}

export function hideCanvas() {
  console.log('[WaveViz] hideCanvas() called');
  const canvas = PD().getElementById('wave-visualizer-canvas');
  if (canvas) {
    canvas.style.opacity = '0';
  }
}

export function showCanvas() {
  console.log('[WaveViz] showCanvas() called, audioCtx state:', s.audioCtx?.state);
  if (s.audioCtx && s.audioCtx.state === 'suspended') {
    s.audioCtx.resume().catch(() => {});
  }
  const canvas = PD().getElementById('wave-visualizer-canvas');
  if (canvas) {
    canvas.style.opacity = '1';
    console.log('[WaveViz] Canvas opacity set to 1');
  } else {
    console.warn('[WaveViz] Canvas element not found in showCanvas()');
  }
}

function teardownSource() {
  if (s.source) {
    try {
      s.source.disconnect();
      if (s.audioCtx && s.audioCtx.state !== 'closed') {
        s.source.connect(s.audioCtx.destination);
      }
    } catch (_) {}
    setSource(null);
  }
  if (s.analyser) {
    try {
      s.analyser.disconnect();
    } catch (_) {}
    setAnalyser(null);
  }
  if (s.animationId) {
    PW().cancelAnimationFrame(s.animationId);
    setAnimationId(null);
  }

  // CRITICAL: We should NOT delete video.__ytToolsAudioSource here if we want to reuse it,
  // because createMediaElementSource can only be called ONCE per video element.
  // We only disconnect it from the previous analyser.
  const video = s.currentVideo;
  if (video) {
    video.removeEventListener('play', showCanvas);
    video.removeEventListener('pause', hideCanvas);
    video.removeEventListener('ended', hideCanvas);
  }

  setIsSetup(false);
}

export function setupWaveForVideo(video) {
  console.log('[WaveViz] setupWaveForVideo called for video element');
  if (!video || video[PROCESSED_FLAG]) {
    console.log('[WaveViz] Video already processed or null, skipping');
    return;
  }
  if (video._ytWaveRetryAfter && Date.now() < video._ytWaveRetryAfter) {
    console.log('[WaveViz] In retry cooldown, skipping');
    return;
  }

  teardownSource();
  setCurrentVideo(video);

  createVisualizerOverlay();
  console.log('[WaveViz] Canvas created/updated, id:', s.canvas?.id, 'opacity:', s.canvas?.style.opacity);

  try {
    // Reuse existing AudioContext if possible (suspend/resume pattern)
    if (!s.audioCtx || s.audioCtx.state === 'closed') {
      setAudioCtx(new (PW().AudioContext || PW().webkitAudioContext)());
    } else if (s.audioCtx.state === 'suspended') {
      s.audioCtx.resume().catch(() => {});
    }

    const analyser = s.audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    const len = analyser.fftSize;
    setBufferLength(len);
    setDataArray(new Uint8Array(len));
    setSmoothedData(new Array(len).fill(128));

    let sourceNode;
    // Reuse cached source ONLY if it belongs to the SAME AudioContext
    if (video.__ytToolsAudioSource && video.__ytToolsAudioSource.context === s.audioCtx) {
      sourceNode = video.__ytToolsAudioSource;
      try {
        sourceNode.disconnect();
      } catch (_) {}
    } else {
      sourceNode = createWaveSource(s.audioCtx, video);
      if (sourceNode) {
        video.__ytToolsAudioSource = sourceNode;
      }
    }

    if (!sourceNode) {
      console.error('[WaveViz] Failed to create audio source - YouTube may have already connected video to AudioContext');
      video._ytWaveFail = true;
      video._ytWaveRetryAfter = Date.now() + WAVE_FAIL_RETRY_MS;
      // Show canvas anyway with a static wave as fallback
      if (s.canvas) {
        s.canvas.style.opacity = '0.3';
        s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
        s.ctx.fillStyle = cachedWaveAccent + '40';
        s.ctx.fillText('Wave visualizer: Audio source unavailable', 20, 30);
      }
      // Do not mark PROCESSED_FLAG — allow retry after navigation, new video, or user gesture unlock.
      return;
    }

    delete video._ytWaveRetryAfter;
    video[PROCESSED_FLAG] = true;

    sourceNode.connect(analyser);
    analyser.connect(s.audioCtx.destination);

    setAnalyser(analyser);
    setSource(sourceNode);

    // Attach play/pause/ended listeners to toggle canvas visibility
    video.removeEventListener('play', showCanvas);
    video.removeEventListener('pause', hideCanvas);
    video.removeEventListener('ended', hideCanvas);
    video.addEventListener('play', showCanvas);
    video.addEventListener('pause', hideCanvas);
    video.addEventListener('ended', hideCanvas);
    console.log('[WaveViz] Event listeners attached to video');

    // If video is already playing, show the canvas immediately
    const isPlaying = !video.paused && !video.ended;
    console.log('[WaveViz] Video playing state:', isPlaying, 'paused:', video.paused, 'ended:', video.ended);
    if (isPlaying) {
      console.log('[WaveViz] Video is playing, calling showCanvas()');
      showCanvas();
    }

    // Ensure resize handler is wired
    PW().removeEventListener('resize', updateCanvasSize);
    PW().addEventListener('resize', updateCanvasSize);

    draw();
    setIsSetup(true);
  } catch (e) {
    console.warn('Wave visualizer setup failed:', e);
    video._ytWaveFail = true;
    cleanupWaveVisualizer();
  }
}

/**
 * Legacy equivalent: `createCanvasOverlay` — fixed full-width canvas, pointer-events none.
 */
export function createVisualizerOverlay() {
  const existing = PD().querySelector('#wave-visualizer-canvas');
  if (existing) {
    existing.style.cssText =
      'position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:9999;opacity:0;background:transparent;transition:opacity 0.3s;';
    existing.width = PW().innerWidth;
    existing.height = CANVAS_HEIGHT;
    setCanvas(existing);
    setCtx(existing.getContext('2d'));
    return;
  }

  const newCanvas = PD().createElement('canvas');
  newCanvas.id = 'wave-visualizer-canvas';
  newCanvas.width = PW().innerWidth;
  newCanvas.height = CANVAS_HEIGHT;
  newCanvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:9999;opacity:0;background:transparent;transition:opacity 0.3s;';
  PD().body.appendChild(newCanvas);
  setCanvas(newCanvas);
  setCtx(newCanvas.getContext('2d'));
}

function draw() {
  // CRITICAL: Always schedule next frame, even when returning early, to keep animation loop alive
  if (!s.isSetup || !s.analyser || !s.ctx || !s.canvas) {
    setAnimationId(PW().requestAnimationFrame(draw));
    return;
  }
  // Performance: Pause drawing if tab is hidden or canvas is transparent
  if (PD().visibilityState !== 'visible' || parseFloat(s.canvas.style.opacity) <= 0) {
    setAnimationId(PW().requestAnimationFrame(draw));
    return;
  }

  s.analyser.getByteTimeDomainData(s.dataArray);

  let hasAudio = false;
  for (let i = 0; i < s.bufferLength; i++) {
    if (s.dataArray[i] !== 128) hasAudio = true;
    s.smoothedData[i] += SMOOTHING_FACTOR * (s.dataArray[i] - s.smoothedData[i]);
  }
  
  if (hasAudio && !s.canvas.dataset.hasAudioLogged) {
    console.log('[WaveViz] 🌊 Audio data received! First non-zero frame drawing.');
    s.canvas.dataset.hasAudioLogged = 'true';
  }

  const w = s.canvas.width;
  const h = s.canvas.height;
  s.ctx.clearRect(0, 0, w, h);

  const sliceWidth = w / s.bufferLength;
  const style = s.waveStyle || 'dinamica';
  const { accent } = waveThemeColors();

  s.ctx.shadowBlur = 16;
  s.ctx.shadowColor = accent + '99';

  let x = 0;
  switch (style) {
    case 'linea':
      s.ctx.lineWidth = 2;
      s.ctx.strokeStyle = accent;
      s.ctx.beginPath();
      x = 0;
      for (let i = 0; i < s.bufferLength; i++) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        if (i === 0) s.ctx.moveTo(x, amplitude);
        else s.ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      s.ctx.stroke();
      break;
    case 'barras':
      x = 0;
      for (let i = 0; i < s.bufferLength; i += 5) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        s.ctx.fillStyle = accent;
        s.ctx.fillRect(x, 0, sliceWidth * 4, amplitude);
        x += sliceWidth * 5;
      }
      break;
    case 'curva':
      s.ctx.lineWidth = 2;
      s.ctx.strokeStyle = accent;
      s.ctx.beginPath();
      s.ctx.moveTo(0, Math.max(0, s.smoothedData[0] - 128) * SCALE);
      for (let i = 0; i < s.bufferLength - 1; i++) {
        const x0 = i * sliceWidth;
        const x1 = (i + 1) * sliceWidth;
        const y0 = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        const y1 = Math.max(0, s.smoothedData[i + 1] - 128) * SCALE;
        const cp1x = x0 + sliceWidth / 3;
        const cp1y = y0;
        const cp2x = x1 - sliceWidth / 3;
        const cp2y = y1;
        s.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
      }
      s.ctx.stroke();
      break;
    case 'picos':
      s.ctx.fillStyle = accent;
      x = 0;
      for (let i = 0; i < s.bufferLength; i += 5) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        s.ctx.beginPath();
        s.ctx.arc(x, amplitude, 2, 0, Math.PI * 2);
        s.ctx.fill();
        x += sliceWidth * 5;
      }
      break;
    case 'solida':
      s.ctx.beginPath();
      x = 0;
      s.ctx.moveTo(0, 0);
      for (let i = 0; i < s.bufferLength; i++) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        s.ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      s.ctx.lineTo(w, 0);
      s.ctx.closePath();
      s.ctx.fillStyle = accent + '4d';
      s.ctx.fill();
      break;
    case 'dinamica': {
      const gradient = s.ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, accent);
      gradient.addColorStop(0.5, accent + '80');
      gradient.addColorStop(1, accent);
      s.ctx.lineWidth = 3;
      s.ctx.strokeStyle = gradient;
      s.ctx.beginPath();
      x = 0;
      for (let i = 0; i < s.bufferLength; i++) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        if (i === 0) s.ctx.moveTo(x, amplitude);
        else s.ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      s.ctx.stroke();
      break;
    }
    case 'montana':
      s.ctx.beginPath();
      x = 0;
      s.ctx.moveTo(0, 0);
      for (let i = 0; i < s.bufferLength; i++) {
        const amp = (s.smoothedData[i] - 128) * SCALE * 0.8;
        s.ctx.lineTo(x, amp);
        x += sliceWidth;
      }
      s.ctx.lineTo(w, 0);
      s.ctx.closePath();
      s.ctx.fillStyle = accent + '66';
      s.ctx.fill();
      break;
  }

  setAnimationId(PW().requestAnimationFrame(draw));
}

export function onWaveStyleChange(value, saveSettingsFn) {
  setWaveStyle(value);
  const selectAppend = PD().getElementById('select-wave-visualizer-select');
  if (selectAppend) selectAppend.value = value;
  if (typeof saveSettingsFn === 'function') saveSettingsFn();
}

export function initWaveVisualizer(settings) {
  console.log('[WaveViz] initWaveVisualizer called, enabled:', settings?.waveVisualizer);
  bindWaveVisualizerUnload();
  waveSettingsSnapshot = settings;

  if (!settings?.waveVisualizer) {
    console.log('[WaveViz] Wave visualizer disabled in settings');
    cleanupWaveVisualizer();
    waveSettingsSnapshot = null;
    return;
  }

  // Cache wave theme color (avoids getComputedStyle per frame)
  refreshWaveThemeColor();

  // Tell legacy code to skip its wave visualizer BEFORE touching any video
  PW().__ytModularWaveActive = true;

  // Apply saved wave style from settings
  if (settings.waveVisualizerSelected) {
    setWaveStyle(settings.waveVisualizerSelected);
  }

  // Resume suspended AudioContext (autoplay policy) on first user interaction
  const unlock = () => {
    if (s.audioCtx && s.audioCtx.state === 'suspended') {
      s.audioCtx
        .resume()
        .then(() => {
          console.warn('[WaveViz] AudioContext resumed via user gesture');
          // Re-setup all videos now that we have permission
          PD()
            .querySelectorAll('video')
            .forEach(v => {
              delete v[PROCESSED_FLAG];
              delete v._ytWaveRetryAfter;
            });
          checkForVideo();
        })
        .catch(() => {});
    }
  };
  // Remove previous unlock listeners before adding new ones
  waveUnlockHandlers.forEach(({ el, type, handler }) => {
    try {
      el.removeEventListener(type, handler);
    } catch {}
  });
  waveUnlockHandlers = [];
  PD().addEventListener('mousedown', unlock, { once: true });
  PD().addEventListener('keydown', unlock, { once: true });
  PD().addEventListener('touchstart', unlock, { once: true });
  waveUnlockHandlers.push(
    { el: PD(), type: 'mousedown', handler: unlock },
    { el: PD(), type: 'keydown', handler: unlock },
    { el: PD(), type: 'touchstart', handler: unlock }
  );

  checkForVideo();

  // Fallback: nếu video chưa sẵn sàng, retry định kỳ
  let retryCount = 0;
  const maxRetries = isYTMusic ? 30 : 10;
  function retryCheck() {
    if (s.isSetup) return;
    if (retryCount >= maxRetries) return;
    retryCount++;
    setTimeout(() => {
      checkForVideo();
      retryCheck();
    }, 2000);
  }
  retryCheck();
}
