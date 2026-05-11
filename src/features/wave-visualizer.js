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
import { SMOOTHING_FACTOR, CANVAS_HEIGHT } from '../config/constants.js';

const s = getState();
let waveVisualizerUnloadBound = false;
let videoObserver = null;
let observerDebounce = null;

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
        // Create the source even if no audio tracks are present yet —
        // tracks will be added when playback starts and will flow through.
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

  document.querySelectorAll('video').forEach(v => {
    delete v._ytWaveFail;
    delete v._ytWaveSourceNode;
  });

  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
  clearTimeout(observerDebounce);
  observerDebounce = null;
}

let hideCanvasTimer = null;

export function hideCanvas() {
  const canvas = $id('wave-visualizer-canvas');
  if (canvas) {
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.5s ease';
    clearTimeout(hideCanvasTimer);
    hideCanvasTimer = setTimeout(() => {
      const c = $id('wave-visualizer-canvas');
      if (c) c.style.display = 'none';
    }, 500);
  }
}

export function showCanvas() {
  clearTimeout(hideCanvasTimer);
  if (s.audioCtx && s.audioCtx.state === 'suspended') {
    s.audioCtx.resume();
  }
  const canvas = $id('wave-visualizer-canvas');
  if (canvas) {
    canvas.style.display = 'block';
    canvas.style.opacity = '1';
    canvas.style.transition = 'opacity 0.5s ease';
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
  if (!video) return;

  if (video === s.currentVideo) {
    if (!s.source || !s.analyser) return;
    if (s.audioCtx && s.audioCtx.state === 'suspended') {
      s.audioCtx.resume();
    }
    if (!s.canvas || !s.canvas.parentNode) {
      createVisualizerOverlay();
    } else {
      showCanvas();
    }
    if (!s.isSetup) {
      setIsSetup(true);
      animate();
    }
    return;
  }

  teardownSource();
  setCurrentVideo(video);

  try {
    if (!s.audioCtx || s.audioCtx.state === 'closed') {
      setAudioCtx(new (window.AudioContext || window.webkitAudioContext)());
    }

    let sourceNode;
    if (video._ytWaveSourceNode) {
      sourceNode = video._ytWaveSourceNode;
    } else {
      sourceNode = createWaveSource(s.audioCtx, video);
      if (sourceNode) {
        video._ytWaveSourceNode = sourceNode;
      }
    }

    if (!sourceNode) {
      video._ytWaveFail = true;
      return;
    }

    const analyser = s.audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const len = analyser.frequencyBinCount;
    setBufferLength(len);
    setDataArray(new Uint8Array(len));
    setSmoothedData(new Array(len).fill(0));

    sourceNode.connect(analyser);
    analyser.connect(s.audioCtx.destination);

    setAnalyser(analyser);
    setSource(sourceNode);
    setIsSetup(true);

    createVisualizerOverlay();
    animate();
  } catch (e) {
    console.warn('Wave visualizer setup failed:', e);
    video._ytWaveFail = true;
  }
}

export function createVisualizerOverlay() {
  const existing = $e('#wave-visualizer-canvas');
  if (existing) {
    existing.style.cssText =
      'position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:99999;opacity:1;background:transparent;';
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
    'position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:99999;opacity:1;background:transparent;';
  document.body.appendChild(newCanvas);
  setCanvas(newCanvas);
  setCtx(newCanvas.getContext('2d'));
}

export function animate() {
  if (!s.isSetup || !s.analyser || !s.ctx || !s.canvas) return;
  setAnimationId(requestAnimationFrame(animate));
  s.analyser.getByteFrequencyData(s.dataArray);

  const w = s.canvas.width;
  const h = s.canvas.height;
  const len = s.bufferLength;

  s.ctx.clearRect(0, 0, w, h);

  const style = s.waveStyle || 'dinamica';

  if (style === 'linea' || style === 'curva') {
    const sliceW = w / len;
    s.ctx.lineWidth = 2;
    s.ctx.strokeStyle = style === 'linea' ? '#00ff88' : '#ffff00';
    s.ctx.beginPath();
    for (let i = 0; i < len; i++) {
      s.smoothedData[i] += (s.dataArray[i] - s.smoothedData[i]) * SMOOTHING_FACTOR;
      const y = h - (s.smoothedData[i] / 255) * CANVAS_HEIGHT;
      if (i === 0) s.ctx.moveTo(i * sliceW, y);
      else s.ctx.lineTo(i * sliceW, y);
    }
    s.ctx.stroke();
    return;
  }

  if (style === 'barras') {
    const barW = (w / len) * 2.5;
    const step = barW + 1;
    for (let i = 0, x = 0; i < len; i++, x += step) {
      s.smoothedData[i] += (s.dataArray[i] - s.smoothedData[i]) * SMOOTHING_FACTOR;
      const bh = (s.smoothedData[i] / 255) * CANVAS_HEIGHT;
      s.ctx.fillStyle = '#00ffff';
      s.ctx.fillRect(x, h - bh, barW, bh);
    }
    return;
  }

  // Default: 'dinamica' - gradient colored bars
  const barW = (w / len) * 2.5;
  const step = barW + 1;
  for (let i = 0, x = 0; i < len; i++, x += step) {
    s.smoothedData[i] += (s.dataArray[i] - s.smoothedData[i]) * SMOOTHING_FACTOR;
    const pct = s.smoothedData[i] / 255;
    const bh = pct * CANVAS_HEIGHT;
    s.ctx.fillStyle = `rgb(${(100 + pct * 155) | 0},50,${(200 - pct * 100) | 0})`;
    s.ctx.fillRect(x, h - bh, barW, bh);
  }
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

    window.addEventListener('resize', () => {
      if (s.canvas) {
        s.canvas.width = window.innerWidth;
        s.canvas.height = CANVAS_HEIGHT;
      }
    });
  }
}
