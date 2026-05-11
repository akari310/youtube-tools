import { $e, $id } from '../utils/dom.js';
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

const s = getState();
let waveVisualizerUnloadBound = false;
let videoObserver = null;
let observerDebounce = null;
let controlPanel = null;

function bindWaveVisualizerUnload() {
  if (waveVisualizerUnloadBound) return;
  window.addEventListener('beforeunload', cleanupWaveVisualizer);
  window.addEventListener('pagehide', cleanupWaveVisualizer);
  window.addEventListener('yt-navigate-finish', () => {
    cleanupWaveVisualizer();
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
    s.canvas.width = window.innerWidth;
    s.canvas.height = CANVAS_HEIGHT;
  }
}

function resetAudioState() {
  teardownSource();
  setCurrentVideo(null);
}

export function cleanupWaveVisualizer() {
  resetAudioState();
  if (s.audioCtx && s.audioCtx.state !== 'closed') {
    try {
      s.audioCtx.close();
    } catch (_) {}
  }
  setAudioCtx(null);
  window.__ytModularWaveActive = false;

  if (s.canvas && s.canvas.parentNode) {
    s.canvas.parentNode.removeChild(s.canvas);
  }
  setCanvas(null);
  setCtx(null);

  if (controlPanel && controlPanel.parentNode) {
    controlPanel.parentNode.removeChild(controlPanel);
  }
  controlPanel = null;

  document.querySelectorAll('video').forEach(v => {
    v.removeEventListener('play', showCanvas);
    v.removeEventListener('pause', hideCanvas);
    v.removeEventListener('ended', hideCanvas);
    delete v._ytWaveFail;
    delete v.__ytToolsAudioSource;
    delete v[PROCESSED_FLAG];
  });

  window.removeEventListener('resize', updateCanvasSize);

  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
  clearTimeout(observerDebounce);
  observerDebounce = null;
}

export function hideCanvas() {
  const canvas = $id('wave-visualizer-canvas');
  if (canvas) {
    canvas.style.opacity = '0';
    if (controlPanel) {
      controlPanel.style.opacity = '0';
    }
  }
}

export function showCanvas() {
  if (s.audioCtx && s.audioCtx.state === 'suspended') {
    s.audioCtx.resume();
  }
  const canvas = $id('wave-visualizer-canvas');
  if (canvas) {
    canvas.style.opacity = '1';
    if (controlPanel) controlPanel.style.opacity = '1';
  }
}

function teardownSource() {
  if (s.source) {
    try {
      s.source.disconnect();
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
    cancelAnimationFrame(s.animationId);
    setAnimationId(null);
  }
  setIsSetup(false);
}

export function setupWaveForVideo(video) {
  if (!video || video[PROCESSED_FLAG]) return;
  video[PROCESSED_FLAG] = true;

  teardownSource();
  setCurrentVideo(video);

  createVisualizerOverlay();
  createControlPanelWave();

  try {
    // Reuse existing AudioContext if possible (suspend/resume pattern)
    if (!s.audioCtx || s.audioCtx.state === 'closed') {
      setAudioCtx(new (window.AudioContext || window.webkitAudioContext)());
    } else if (s.audioCtx.state === 'suspended') {
      s.audioCtx.resume();
    }

    const analyser = s.audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    const len = analyser.fftSize;
    setBufferLength(len);
    setDataArray(new Uint8Array(len));
    setSmoothedData(new Array(len).fill(128));

    let sourceNode;
    // Reuse cached source if video already has one (createMediaElementSource is one-shot per element)
    if (video.__ytToolsAudioSource) {
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
      video._ytWaveFail = true;
      return;
    }

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

    // Ensure resize handler is wired
    window.removeEventListener('resize', updateCanvasSize);
    window.addEventListener('resize', updateCanvasSize);

    draw();
    setIsSetup(true);
  } catch (e) {
    console.warn('Wave visualizer setup failed:', e);
    video._ytWaveFail = true;
    cleanupWaveVisualizer();
  }
}

function createControlPanelWave() {
  if (controlPanel) return;
  controlPanel = document.createElement('div');
  controlPanel.id = 'wave-visualizer-control';
  controlPanel.style.cssText =
    'position:fixed;bottom:20px;right:20px;z-index:10001;pointer-events:auto;';
}

export function createVisualizerOverlay() {
  const existing = $e('#wave-visualizer-canvas');
  if (existing) {
    existing.style.cssText =
      'position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:10000;opacity:0;background:transparent;transition:opacity 0.3s;';
    existing.width = window.innerWidth;
    existing.height = CANVAS_HEIGHT;
    setCanvas(existing);
    setCtx(existing.getContext('2d'));
    return;
  }

  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'wave-visualizer-canvas';
  newCanvas.width = window.innerWidth;
  newCanvas.height = CANVAS_HEIGHT;
  newCanvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:10000;opacity:0;background:transparent;transition:opacity 0.3s;';
  document.body.appendChild(newCanvas);
  setCanvas(newCanvas);
  setCtx(newCanvas.getContext('2d'));
}

function draw() {
  setAnimationId(requestAnimationFrame(draw));

  if (!s.isSetup || !s.analyser || !s.ctx || !s.canvas) return;
  if (parseFloat(s.canvas.style.opacity) <= 0) return;

  s.analyser.getByteTimeDomainData(s.dataArray);

  for (let i = 0; i < s.bufferLength; i++) {
    s.smoothedData[i] += SMOOTHING_FACTOR * (s.dataArray[i] - s.smoothedData[i]);
  }

  const w = s.canvas.width;
  const h = s.canvas.height;
  s.ctx.clearRect(0, 0, w, h);

  const sliceWidth = w / s.bufferLength;
  const style = s.waveStyle || 'dinamica';

  switch (style) {
    case 'linea': {
      s.ctx.lineWidth = 2;
      s.ctx.strokeStyle = 'lime';
      s.ctx.beginPath();
      let x = 0;
      for (let i = 0; i < s.bufferLength; i++) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        if (i === 0) s.ctx.moveTo(x, amplitude);
        else s.ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      s.ctx.stroke();
      break;
    }
    case 'barras': {
      let x = 0;
      for (let i = 0; i < s.bufferLength; i += 5) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        s.ctx.fillStyle = 'cyan';
        s.ctx.fillRect(x, 0, sliceWidth * 4, amplitude);
        x += sliceWidth * 5;
      }
      break;
    }
    case 'curva': {
      s.ctx.lineWidth = 2;
      s.ctx.strokeStyle = 'yellow';
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
    }
    case 'picos': {
      s.ctx.fillStyle = 'magenta';
      let x = 0;
      for (let i = 0; i < s.bufferLength; i += 5) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        s.ctx.beginPath();
        s.ctx.arc(x, amplitude, 2, 0, Math.PI * 2);
        s.ctx.fill();
        x += sliceWidth * 5;
      }
      break;
    }
    case 'solida': {
      s.ctx.beginPath();
      let x = 0;
      s.ctx.moveTo(0, 0);
      for (let i = 0; i < s.bufferLength; i++) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        s.ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      s.ctx.lineTo(w, 0);
      s.ctx.closePath();
      s.ctx.fillStyle = 'rgba(0,255,0,0.3)';
      s.ctx.fill();
      break;
    }
    case 'dinamica': {
      const gradient = s.ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(0.5, 'purple');
      gradient.addColorStop(1, 'blue');
      s.ctx.lineWidth = 3;
      s.ctx.strokeStyle = gradient;
      s.ctx.beginPath();
      let x = 0;
      for (let i = 0; i < s.bufferLength; i++) {
        const amplitude = Math.max(0, s.smoothedData[i] - 128) * SCALE;
        if (i === 0) s.ctx.moveTo(x, amplitude);
        else s.ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      s.ctx.stroke();
      break;
    }
    case 'montana': {
      s.ctx.beginPath();
      let x = 0;
      s.ctx.moveTo(0, 0);
      for (let i = 0; i < s.bufferLength; i++) {
        const amp = (s.smoothedData[i] - 128) * SCALE * 0.8;
        s.ctx.lineTo(x, amp);
        x += sliceWidth;
      }
      s.ctx.lineTo(w, 0);
      s.ctx.closePath();
      s.ctx.fillStyle = 'rgba(128,128,255,0.4)';
      s.ctx.fill();
      break;
    }
    default:
      break;
  }
}

export function onWaveStyleChange(value, saveSettingsFn) {
  setWaveStyle(value);
  const selectAppend = $id('select-wave-visualizer-select');
  if (selectAppend) selectAppend.value = value;
  if (typeof saveSettingsFn === 'function') saveSettingsFn();
}

export function initWaveVisualizer(settings) {
  bindWaveVisualizerUnload();

  if (!settings?.waveVisualizer) {
    cleanupWaveVisualizer();
    return;
  }

  // Tell legacy code to skip its wave visualizer BEFORE touching any video
  window.__ytModularWaveActive = true;

  // Apply saved wave style from settings
  if (settings.waveVisualizerSelected) {
    setWaveStyle(settings.waveVisualizerSelected);
  }

  // Resume suspended AudioContext (autoplay policy) on first user interaction
  const unlock = () => {
    if (s.audioCtx && s.audioCtx.state === 'suspended') {
      s.audioCtx.resume();
    }
  };
  document.addEventListener('click', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });

  document.querySelectorAll('video').forEach(video => setupWaveForVideo(video));

  if (!videoObserver) {
    videoObserver = new MutationObserver(() => {
      clearTimeout(observerDebounce);
      observerDebounce = setTimeout(() => {
        document.querySelectorAll('video').forEach(video => setupWaveForVideo(video));
      }, 200);
    });
    videoObserver.observe(document.body, { childList: true, subtree: true });
  }
}
