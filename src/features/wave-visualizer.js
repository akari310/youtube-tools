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
import { SMOOTHING_FACTOR, CANVAS_HEIGHT, PROCESSED_FLAG } from '../config/constants.js';
import {
  trackObserver,
  untrackObserver,
  trackTimeout,
  untrackTimeout,
} from '../utils/cleanup-manager.js';

const PW = pageWindow;
const PD = pageDocument;

const s = getState();

/** Cached wave accent color — refreshed on theme change or init. */
let cachedWaveAccent = '#22d3ee';

function getThemeCSS(varName, fallback = '') {
  try {
    const val = PW().getComputedStyle(PD().documentElement).getPropertyValue(varName).trim();
    return val || fallback;
  } catch {
    return fallback;
  }
}

function refreshWaveThemeColor() {
  cachedWaveAccent = getThemeCSS('--yt-tools-wave-color', '#22d3ee');
}

function waveThemeColors() {
  return {
    accent: cachedWaveAccent,
    glow: cachedWaveAccent + '66',
    soft: cachedWaveAccent + '22',
  };
}
/** After a failed tap into the video graph, avoid hammering setup on every DOM mutation (YouTube is noisy). */
const WAVE_FAIL_RETRY_MS = 4000;
const WAVE_MIN_HEIGHT = 58;
const WAVE_YTM_HEIGHT = 36;
const WAVE_YTM_CANVAS_Z_INDEX = 130;
const WAVE_SENSITIVITY = 2.05;
const WAVE_YTM_SENSITIVITY = 5.5;
let videoObserver = null;
let observerDebounce = null;
let frequencyData = null;
let lastYtmFrameAt = 0;
/** Last settings object passed to `initWaveVisualizer` — used by `checkForVideo` / observer. */
let waveSettingsSnapshot = null;
/** Unlock gesture listeners — tracked for cleanup. */
let waveUnlockHandlers = [];
/** Pending retry timer (init fallback) — tracked for cleanup. */
let waveRetryTimer = null;

function getWaveFps() {
  const fps = Number(waveSettingsSnapshot?.waveVisualizerFps) || 30;
  return Math.max(24, Math.min(60, fps));
}

function getWaveIntensityScale() {
  const pct = Number(waveSettingsSnapshot?.waveVisualizerIntensity) || 100;
  return Math.max(0.4, Math.min(1.6, pct / 100));
}

function getYtmWaveHeight() {
  const height = Number(waveSettingsSnapshot?.ytmWaveHeight) || WAVE_YTM_HEIGHT;
  return Math.max(18, Math.min(64, height));
}

function getYtmWaveTopOffset(playerBarRect) {
  const waveHeight = getYtmWaveHeight();
  switch (waveSettingsSnapshot?.ytmWavePlacement) {
    case 'inside':
      return 4;
    case 'bottom':
      return Math.max(0, Math.floor((playerBarRect?.height || 90) - waveHeight - 4));
    case 'edge':
    default:
      return Math.min(-8, Math.round(-waveHeight * 0.66));
  }
}

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
    href.includes('/watch') ||
    href.includes('/shorts/') ||
    href.includes('youtu.be/') ||
    /youtube\.com\/live\//.test(href);
  const inContext = (video && (urlMatchesPlayer || isYTMusic)) || !!miniPlayer;

  if (!inContext || !video) {
    cleanupWaveVisualizer(false);
    ensureWaveMutationObserver();
    return;
  }

  if (video !== s.currentVideo || !s.isSetup) {
    cleanupWaveVisualizer(false);
    setupWaveForVideo(video);
    if (!s.isSetup) {
      waveRetryTimer = trackTimeout(
        setTimeout(() => {
          waveRetryTimer = null;
          checkForVideo();
        }, WAVE_FAIL_RETRY_MS)
      );
    }
  } else if (!video.paused) {
    showCanvas();
  }

  ensureWaveMutationObserver();
}

let waveUnloadHandlers = null;

function bindWaveVisualizerUnload() {
  if (waveUnloadHandlers) return;
  const onUnload = () => cleanupWaveVisualizer(true);
  const onNav = () => cleanupWaveVisualizer(false);
  const onVisibilityChange = () => {
    if (PD().visibilityState === 'visible' && s.currentVideo && !s.currentVideo.paused) {
      showCanvas();
    } else {
      hideCanvas();
    }
  };
  PW().addEventListener('beforeunload', onUnload);
  PW().addEventListener('pagehide', onUnload);
  PW().addEventListener('yt-navigate-finish', onNav);
  PD().addEventListener('visibilitychange', onVisibilityChange);
  waveUnloadHandlers = { onUnload, onNav, onVisibilityChange };
}

function unbindWaveVisualizerUnload() {
  if (!waveUnloadHandlers) return;
  const { onUnload, onNav, onVisibilityChange } = waveUnloadHandlers;
  PW().removeEventListener('beforeunload', onUnload);
  PW().removeEventListener('pagehide', onUnload);
  PW().removeEventListener('yt-navigate-finish', onNav);
  PD().removeEventListener('visibilitychange', onVisibilityChange);
  waveUnloadHandlers = null;
}

function createWaveSource(audioCtx, video) {
  try {
    return audioCtx.createMediaElementSource(video);
  } catch {
    // YouTube already connected the video to its own AudioContext.
    // Fall back to captureStream() — captures media output independently.
    if (video.captureStream) {
      try {
        return audioCtx.createMediaStreamSource(video.captureStream());
      } catch {}
    }
    console.warn(
      '[WaveViz] Cannot create audio source — video already connected and captureStream unavailable.'
    );
    return null;
  }
}

function updateCanvasSize() {
  if (s.canvas) {
    const dpr = Math.min(PW().devicePixelRatio || 1, 2);
    const playerBar = isYTMusic ? getYtmPlayerBar() : null;
    const playerBarRect = playerBar?.getBoundingClientRect?.();
    const width = Math.max(1, Math.floor(playerBarRect?.width || PW().innerWidth));
    const height = isYTMusic
      ? getYtmWaveHeight()
      : Math.max(
          WAVE_MIN_HEIGHT,
          Math.min(CANVAS_HEIGHT * 0.34, Math.floor(PW().innerHeight * 0.09))
        );

    if (isYTMusic && playerBarRect) {
      s.canvas.style.top = `${Math.max(0, Math.round(playerBarRect.top + getYtmWaveTopOffset(playerBarRect)))}px`;
      s.canvas.style.left = `${Math.max(0, Math.round(playerBarRect.left))}px`;
      s.canvas.style.bottom = 'auto';
    } else {
      s.canvas.style.top = 'auto';
      s.canvas.style.left = '0';
      s.canvas.style.bottom = '0';
    }
    s.canvas.style.width = `${width}px`;
    s.canvas.style.height = `${height}px`;
    s.canvas.width = Math.floor(width * dpr);
    s.canvas.height = Math.floor(height * dpr);
  }
}

function getYtmPlayerBar() {
  const playerBar =
    PD().querySelector('ytmusic-player-bar') ||
    PD().querySelector('#player-bar') ||
    PD().querySelector('ytmusic-app #player');
  if (playerBar?.style?.position === 'relative') {
    playerBar.style.removeProperty('position');
  }
  return playerBar;
}

function resetAudioState() {
  teardownSource();
  setCurrentVideo(null);
}

export function cleanupWaveVisualizer(isUnload = false) {
  resetAudioState();

  if (waveRetryTimer) {
    untrackTimeout(waveRetryTimer);
    waveRetryTimer = null;
  }

  if (isUnload) {
    if (s.audioCtx && s.audioCtx.state !== 'closed') {
      try {
        s.audioCtx.close();
      } catch {}
    }
    setAudioCtx(null);
    PD()
      .querySelectorAll('video')
      .forEach(v => {
        delete v.__ytToolsAudioSource;
      });
    unbindWaveVisualizerUnload();
    removeUnlockHandlers();
  }

  PW().__ytModularWaveActive = false;

  if (s.canvas && s.canvas.parentNode) {
    s.canvas.parentNode.removeChild(s.canvas);
  }
  setCanvas(null);
  setCtx(null);
  frequencyData = null;
  lastYtmFrameAt = 0;

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

  if (videoObserver) {
    untrackObserver(videoObserver);
    videoObserver = null;
  }
  clearTimeout(observerDebounce);
  observerDebounce = null;
}

export function hideCanvas() {
  const canvas = PD().getElementById('wave-visualizer-canvas');
  if (canvas) canvas.style.opacity = '0';
  lastYtmFrameAt = 0;
  if (s.animationId) {
    PW().cancelAnimationFrame(s.animationId);
    setAnimationId(null);
  }
}

export function showCanvas() {
  if (s.audioCtx && s.audioCtx.state === 'suspended') {
    s.audioCtx.resume().catch(() => {});
  }
  const canvas = PD().getElementById('wave-visualizer-canvas');
  if (canvas) {
    updateCanvasSize();
    canvas.style.opacity = isYTMusic ? '0.86' : '0.82';
  }
  if (s.isSetup && !s.animationId) {
    draw();
  }
}

function teardownSource() {
  if (s.source) {
    try {
      s.source.disconnect();
      if (s.audioCtx && s.audioCtx.state !== 'closed') {
        s.source.connect(s.audioCtx.destination);
      }
    } catch {}
    setSource(null);
  }
  if (s.analyser) {
    try {
      s.analyser.disconnect();
    } catch {}
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
  if (!video || video[PROCESSED_FLAG]) return;
  if (video._ytWaveRetryAfter && Date.now() < video._ytWaveRetryAfter) return;

  teardownSource();
  setCurrentVideo(video);

  createVisualizerOverlay();

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
    frequencyData = new Uint8Array(analyser.frequencyBinCount);

    let sourceNode;
    // Reuse cached source ONLY if it belongs to the SAME AudioContext
    if (video.__ytToolsAudioSource && video.__ytToolsAudioSource.context === s.audioCtx) {
      sourceNode = video.__ytToolsAudioSource;
      try {
        sourceNode.disconnect();
      } catch {}
    } else {
      sourceNode = createWaveSource(s.audioCtx, video);
      if (sourceNode) {
        video.__ytToolsAudioSource = sourceNode;
      }
    }

    if (!sourceNode) {
      console.error(
        '[WaveViz] Failed to create audio source - YouTube may have already connected video to AudioContext'
      );
      video._ytWaveFail = true;
      video._ytWaveRetryAfter = Date.now() + WAVE_FAIL_RETRY_MS;
      // Show canvas anyway with a static wave as fallback
      if (s.canvas) {
        s.canvas.style.opacity = '0.3';
        const { w } = prepareCanvasFrame();
        s.ctx.fillStyle = cachedWaveAccent + '40';
        s.ctx.fillText('Wave visualizer: Audio source unavailable', 20, 30);
        s.ctx.fillRect(20, 38, Math.min(320, w - 40), 2);
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

    video.removeEventListener('play', showCanvas);
    video.removeEventListener('pause', hideCanvas);
    video.removeEventListener('ended', hideCanvas);
    video.addEventListener('play', showCanvas);
    video.addEventListener('pause', hideCanvas);
    video.addEventListener('ended', hideCanvas);

    if (!video.paused && !video.ended) showCanvas();

    PW().removeEventListener('resize', updateCanvasSize);
    PW().addEventListener('resize', updateCanvasSize);

    setIsSetup(true);
    draw();
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
  if (isYTMusic) getYtmPlayerBar();
  const canvasStyle = isYTMusic
    ? `position:fixed;top:0;left:0;width:100%;height:${WAVE_YTM_HEIGHT}px;pointer-events:none;z-index:${WAVE_YTM_CANVAS_Z_INDEX};opacity:0;background:transparent;transition:opacity 0.35s ease;`
    : 'position:fixed;bottom:0;left:0;width:100%;pointer-events:none;z-index:1;opacity:0;background:transparent;transition:opacity 0.35s ease;';
  if (existing) {
    existing.style.cssText = canvasStyle;
    if (existing.parentNode !== PD().body) {
      PD().body.appendChild(existing);
    }
    setCanvas(existing);
    setCtx(existing.getContext('2d'));
    updateCanvasSize();
    return;
  }

  const newCanvas = PD().createElement('canvas');
  newCanvas.id = 'wave-visualizer-canvas';
  newCanvas.style.cssText = canvasStyle;
  PD().body.appendChild(newCanvas);
  setCanvas(newCanvas);
  setCtx(newCanvas.getContext('2d'));
  updateCanvasSize();
}

function getCanvasDrawMetrics() {
  const dpr = Math.min(PW().devicePixelRatio || 1, 2);
  return {
    dpr,
    w: s.canvas.width / dpr,
    h: s.canvas.height / dpr,
  };
}

function prepareCanvasFrame() {
  const { dpr, w, h } = getCanvasDrawMetrics();
  s.ctx.setTransform(1, 0, 0, 1, 0, 0);
  s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
  s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function drawAmbientFloor(w, h, colors) {
  if (isYTMusic) return;
  const floor = s.ctx.createLinearGradient(0, h * 0.2, 0, h);
  floor.addColorStop(0, 'rgba(0,0,0,0)');
  floor.addColorStop(0.62, colors.soft);
  floor.addColorStop(1, 'rgba(0,0,0,0.12)');
  s.ctx.fillStyle = floor;
  s.ctx.fillRect(0, 0, w, h);
}

function waveY(index, centerY, amplitudeRange) {
  const sample = Math.max(
    -1,
    Math.min(1, ((s.smoothedData[index] - 128) / 128) * WAVE_SENSITIVITY * getWaveIntensityScale())
  );
  return centerY + sample * amplitudeRange;
}

function drawYtmPlayerBarWave(w, h, colors) {
  const sliceWidth = w / s.bufferLength;
  let energy = 0;
  if (frequencyData?.length) {
    const start = 4;
    const end = Math.min(frequencyData.length, 160);
    for (let i = start; i < end; i++) {
      energy += frequencyData[i] / 255;
    }
    energy /= Math.max(1, end - start);
  }

  const centerY = h * 0.68;
  const amplitudeRange = h * (0.1 + Math.min(0.18, energy * 0.55));
  const gradient = s.ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, colors.accent + '11');
  gradient.addColorStop(0.35, colors.accent + 'aa');
  gradient.addColorStop(0.5, '#ffffffcc');
  gradient.addColorStop(0.65, colors.accent + 'aa');
  gradient.addColorStop(1, colors.accent + '11');

  const glow = s.ctx.createLinearGradient(0, 0, 0, h);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(0.58, colors.soft);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  s.ctx.fillStyle = glow;
  s.ctx.fillRect(0, 0, w, h);

  s.ctx.lineCap = 'round';
  s.ctx.lineJoin = 'round';
  s.ctx.shadowBlur = 10;
  s.ctx.shadowColor = colors.glow;
  s.ctx.lineWidth = 2.4;
  s.ctx.strokeStyle = gradient;
  s.ctx.beginPath();

  const points = [];
  let x = 0;
  for (let i = 0; i < s.bufferLength; i++) {
    const sample = Math.max(
      -1,
      Math.min(
        1,
        ((s.smoothedData[i] - 128) / 128) * WAVE_YTM_SENSITIVITY * getWaveIntensityScale()
      )
    );
    const y = centerY + sample * amplitudeRange;
    points.push([x, y]);
    if (i === 0) s.ctx.moveTo(x, y);
    else s.ctx.lineTo(x, y);
    x += sliceWidth;
  }

  s.ctx.stroke();

  s.ctx.shadowBlur = 0;
  s.ctx.globalAlpha = 0.28;
  s.ctx.lineWidth = 1;
  s.ctx.strokeStyle = colors.accent;
  s.ctx.beginPath();
  points.forEach(([px, py], index) => {
    const y = Math.min(h - 2, py + 5);
    if (index === 0) s.ctx.moveTo(px, y);
    else s.ctx.lineTo(px, y);
  });
  s.ctx.stroke();
  s.ctx.globalAlpha = 1;
}

function draw(frameTime = 0) {
  if (!s.isSetup || !s.analyser || !s.ctx || !s.canvas) {
    setAnimationId(null);
    return;
  }

  if (PD().visibilityState !== 'visible' || parseFloat(s.canvas.style.opacity) <= 0) {
    setAnimationId(null);
    return;
  }

  if (isYTMusic) {
    const now = frameTime || PW().performance?.now?.() || Date.now();
    const frameInterval = 1000 / getWaveFps();
    if (lastYtmFrameAt && now - lastYtmFrameAt < frameInterval) {
      setAnimationId(PW().requestAnimationFrame(draw));
      return;
    }
    lastYtmFrameAt = now;
  }

  s.analyser.getByteTimeDomainData(s.dataArray);
  if (frequencyData) s.analyser.getByteFrequencyData(frequencyData);

  for (let i = 0; i < s.bufferLength; i++) {
    s.smoothedData[i] += SMOOTHING_FACTOR * (s.dataArray[i] - s.smoothedData[i]);
  }

  const { w, h } = prepareCanvasFrame();
  const sliceWidth = w / s.bufferLength;
  const style = s.waveStyle || 'dinamica';
  const colors = waveThemeColors();
  const { accent, glow } = colors;
  const centerY = isYTMusic ? h * 0.58 : h * 0.34;
  const amplitudeRange = isYTMusic ? h * 0.5 : h * 0.42;

  if (isYTMusic) {
    drawYtmPlayerBarWave(w, h, colors);
    setAnimationId(PW().requestAnimationFrame(draw));
    return;
  }

  drawAmbientFloor(w, h, colors);
  s.ctx.lineCap = 'round';
  s.ctx.lineJoin = 'round';
  s.ctx.shadowBlur = 14;
  s.ctx.shadowColor = glow;

  let x = 0;
  switch (style) {
    case 'linea':
      s.ctx.lineWidth = 2.4;
      s.ctx.strokeStyle = accent;
      s.ctx.beginPath();
      x = 0;
      for (let i = 0; i < s.bufferLength; i++) {
        const y = waveY(i, centerY, amplitudeRange);
        if (i === 0) s.ctx.moveTo(x, y);
        else s.ctx.lineTo(x, y);
        x += sliceWidth;
      }
      s.ctx.stroke();
      break;
    case 'barras':
      if (!frequencyData) break;
      x = 0;
      {
        const bars = 96;
        const gap = 3;
        const barWidth = Math.max(2, w / bars - gap);
        for (let i = 0; i < bars; i++) {
          const bucket = Math.floor((i / bars) * frequencyData.length * 0.72);
          const value = Math.min(
            1,
            ((frequencyData[bucket] || 0) / 255) * WAVE_SENSITIVITY * getWaveIntensityScale()
          );
          const barHeight = Math.max(3, value * h * 0.58);
          const gradient = s.ctx.createLinearGradient(
            0,
            centerY - barHeight,
            0,
            centerY + barHeight
          );
          gradient.addColorStop(0, accent + 'cc');
          gradient.addColorStop(1, accent + '33');
          s.ctx.fillStyle = gradient;
          s.ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
          x += barWidth + gap;
        }
      }
      break;
    case 'curva':
      s.ctx.lineWidth = 2.6;
      s.ctx.strokeStyle = accent;
      s.ctx.beginPath();
      s.ctx.moveTo(0, waveY(0, centerY, amplitudeRange));
      for (let i = 0; i < s.bufferLength - 1; i++) {
        const x0 = i * sliceWidth;
        const x1 = (i + 1) * sliceWidth;
        const y0 = waveY(i, centerY, amplitudeRange);
        const y1 = waveY(i + 1, centerY, amplitudeRange);
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
      if (!frequencyData) break;
      for (let i = 0; i < 110; i++) {
        const bucket = Math.floor((i / 110) * frequencyData.length * 0.75);
        const value = Math.min(
          1,
          ((frequencyData[bucket] || 0) / 255) * WAVE_SENSITIVITY * getWaveIntensityScale()
        );
        const dotX = (i / 109) * w;
        const dotY = centerY - value * h * 0.38;
        const radius = 1.2 + value * 3.2;
        s.ctx.beginPath();
        s.ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
        s.ctx.fill();
      }
      break;
    case 'solida':
      s.ctx.beginPath();
      x = 0;
      s.ctx.moveTo(0, centerY);
      for (let i = 0; i < s.bufferLength; i++) {
        s.ctx.lineTo(x, waveY(i, centerY, amplitudeRange));
        x += sliceWidth;
      }
      s.ctx.lineTo(w, h);
      s.ctx.lineTo(0, h);
      s.ctx.closePath();
      s.ctx.fillStyle = accent + '4d';
      s.ctx.fill();
      break;
    case 'dinamica': {
      const gradient = s.ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, accent + '44');
      gradient.addColorStop(0.35, accent + 'dd');
      gradient.addColorStop(0.65, '#ffffff99');
      gradient.addColorStop(1, accent + '55');
      s.ctx.lineWidth = 3.2;
      s.ctx.strokeStyle = gradient;
      s.ctx.beginPath();
      x = 0;
      for (let i = 0; i < s.bufferLength; i++) {
        const y = waveY(i, centerY, amplitudeRange);
        if (i === 0) s.ctx.moveTo(x, y);
        else s.ctx.lineTo(x, y);
        x += sliceWidth;
      }
      s.ctx.stroke();

      if (!isYTMusic) {
        const fill = s.ctx.createLinearGradient(0, centerY - amplitudeRange, 0, h);
        fill.addColorStop(0, accent + '10');
        fill.addColorStop(0.55, accent + '06');
        fill.addColorStop(1, 'rgba(0,0,0,0)');
        s.ctx.lineTo(w, h);
        s.ctx.lineTo(0, h);
        s.ctx.closePath();
        s.ctx.fillStyle = fill;
        s.ctx.fill();
      }
      break;
    }
    case 'montana':
      s.ctx.beginPath();
      x = 0;
      s.ctx.moveTo(0, h);
      for (let i = 0; i < s.bufferLength; i++) {
        const y = waveY(i, centerY, amplitudeRange * 0.9);
        s.ctx.lineTo(x, y);
        x += sliceWidth;
      }
      s.ctx.lineTo(w, h);
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
  bindWaveVisualizerUnload();
  waveSettingsSnapshot = settings;

  if (!settings?.waveVisualizer) {
    cleanupWaveVisualizer();
    waveSettingsSnapshot = null;
    return;
  }

  // Cache wave theme color (avoids getComputedStyle per frame)
  refreshWaveThemeColor();

  // Tell legacy code to skip its wave visualizer BEFORE touching any video
  PW().__ytModularWaveActive = true;

  if (settings.waveVisualizerSelected) {
    setWaveStyle(settings.waveVisualizerSelected);
  }

  // Resume suspended AudioContext (autoplay policy) on first user interaction
  const unlock = () => {
    if (s.audioCtx && s.audioCtx.state === 'suspended') {
      s.audioCtx
        .resume()
        .then(() => {
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
  removeUnlockHandlers();
  ['mousedown', 'keydown', 'touchstart'].forEach(type => {
    PD().addEventListener(type, unlock, { once: true });
    waveUnlockHandlers.push({ el: PD(), type, handler: unlock });
  });

  checkForVideo();

  // Fallback: video chưa sẵn sàng — retry tối đa N lần, track timer để cleanup
  let retryCount = 0;
  const maxRetries = isYTMusic ? 30 : 10;
  function retryCheck() {
    if (s.isSetup || retryCount >= maxRetries) return;
    retryCount++;
    waveRetryTimer = trackTimeout(
      setTimeout(() => {
        waveRetryTimer = null;
        checkForVideo();
        retryCheck();
      }, 2000)
    );
  }
  retryCheck();
}

function removeUnlockHandlers() {
  waveUnlockHandlers.forEach(({ el, type, handler }) => {
    try {
      el.removeEventListener(type, handler);
    } catch {}
  });
  waveUnlockHandlers = [];
}
