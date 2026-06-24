import { DUBS_START_ENDPOINT, DUBS_STATUS_ENDPOINT, DOWNLOAD_API_FALLBACK_BASES, getApiKey } from '../config/constants.js';
import { $id } from '../utils/dom.js';
import { Notify, paramsVideoURL } from '../utils/helpers.js';
import { __ytToolsRuntime } from '../utils/runtime.js';

// ------------------------------
// Feature: Video/Audio Download (full implementation)
// ------------------------------

/**
 * Normalize YT/YTM URL → canonical youtube.com/watch?v=ID.
 * Many download APIs choke on music.youtube.com host or `list=` playlist param.
 */
function normalizeYouTubeURL(rawURL) {
  try {
    const u = new URL(rawURL);
    let videoId = u.searchParams.get('v');
    if (!videoId && u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1);
    }
    if (!videoId) return rawURL;
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch {
    return rawURL;
  }
}

const AUDIO_FORMATS = new Set(['mp3', 'ogg', 'opus', 'webm', 'm4a', 'wav', 'flac', 'aac']);
const isAudioFormat = f => AUDIO_FORMATS.has(String(f).toLowerCase());

// Cobalt v10 audioFormat: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus'.
// m4a/webm → 'best' (preserves source codec — AAC/m4a or opus/webm from YouTube).
function toCobaltAudioFormat(f) {
  if (f === 'mp3' || f === 'ogg' || f === 'opus' || f === 'wav') return f;
  return 'best';
}

export async function startDownloadVideoOrAudio(format, container) {
  const videoURL = normalizeYouTubeURL(window.location.href);

  // Map unsupported Cobalt formats to supported high-quality equivalents
  if (format === 'm4a' || format === 'aac') {
    Notify('info', 'Cobalt không hỗ trợ tải M4A/AAC gốc, hệ thống đang tải file MP3 chất lượng cao thay thế...');
    format = 'mp3';
  } else if (format === 'flac') {
    Notify('info', 'Cobalt không hỗ trợ tải FLAC gốc, hệ thống đang tải file WAV chất lượng cao thay thế...');
    format = 'wav';
  }

  // Check if already downloading
  if (container.dataset.downloading === 'true') {
    return;
  }

  // Stop any previous poller (avoid leaks on retry)
  try {
    if (container.__ytDownloadPoll) {
      clearTimeout(container.__ytDownloadPoll);
      container.__ytDownloadPoll = null;
    }
  } catch (e) {
    console.warn('[YT Tools] Download poller cleanup error:', e);
  }

  // Get UI elements from the container
  const downloadBtn = container.querySelector('.download-btn');
  const retryBtn = container.querySelector('.retry-btn');
  const progressRetryBtn = container.querySelector('.progress-retry-btn');
  const downloadAgainBtn = container.querySelector('.download-again-btn');
  const progressContainer = container.querySelector('.progress-container');
  const progressFill = container.querySelector('.progress-fill');
  const progressText = container.querySelector('.progress-text');
  const downloadText = container.querySelector('.download-text');

  // Set downloading flag
  container.dataset.downloading = 'true';
  container.dataset.urlOpened = 'false';
  container.dataset.lastDownloadUrl = '';

  // Set gradient class based on type
  const typeClass = container.classList.contains('ocultarframeaudio') ? 'audio' : 'video';
  container.classList.remove('audio', 'video');
  if (typeClass) container.classList.add(typeClass);

  // Create or get status text element
  let statusText = container.querySelector('.download-status-text');
  if (!statusText) {
    statusText = document.createElement('div');
    statusText.className = 'download-status-text status-dot';
    container.appendChild(statusText);
  }

  // Update UI to show progress
  if (downloadBtn) downloadBtn.style.display = 'none';
  if (retryBtn) retryBtn.style.display = 'none';
  if (progressRetryBtn) progressRetryBtn.style.display = 'block';
  if (downloadAgainBtn) downloadAgainBtn.style.display = 'none';
  if (progressContainer) progressContainer.style.display = 'flex';
  if (progressFill) {
    progressFill.style.width = '0%';
    progressFill.classList.add('indeterminate');
  }
  if (progressText) progressText.textContent = '0%';
  if (statusText) {
    statusText.textContent = 'Connecting to server...';
    statusText.className = 'download-status-text status-dot';
  }

  const updateProgress = (pct, statusMsg) => {
    if (progressFill) {
      if (pct > 0) {
        progressFill.classList.remove('indeterminate');
      }
      progressFill.style.width = `${pct}%`;
    }
    if (progressText) progressText.textContent = `${Math.round(pct)}%`;
    if (statusText && statusMsg) {
      statusText.textContent = statusMsg;
    }
  };

  const fetchJsonWithTimeout = (url, timeoutMs = 20000) => {
    return new Promise((resolve, reject) => {
      let aborted = false;
      const t = setTimeout(() => {
        aborted = true;
        reject(new Error('Timeout'));
        if (req && req.abort) req.abort();
      }, timeoutMs);

      const req = GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        responseType: 'json',
        onload: function (res) {
          if (aborted) return;
          clearTimeout(t);
          if (res.status !== 200) {
            reject(new Error(`HTTP ${res.status}`));
            return;
          }
          let data = res.response;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch {}
          }
          resolve(data);
        },
        onerror: function () {
          if (aborted) return;
          clearTimeout(t);
          reject(new Error('Failed to fetch'));
        },
        onabort: function () {
          if (aborted) return;
          clearTimeout(t);
          reject(new Error('Aborted'));
        },
      });
    });
  };

  const setErrorState = message => {
    if (retryBtn) retryBtn.style.display = 'block';
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressRetryBtn) progressRetryBtn.style.display = 'none';
    if (downloadAgainBtn) downloadAgainBtn.style.display = 'none';
    container.dataset.downloading = 'false';
    container.dataset.urlOpened = 'false';
    container.dataset.lastDownloadUrl = '';
    if (message) Notify('error', message);
  };

  const markCompleteAndOpen = downloadUrl => {
    if (!downloadUrl) {
      setErrorState();
      return;
    }
    container.dataset.lastDownloadUrl = String(downloadUrl);
    if (container.dataset.urlOpened === 'true') return;
    container.dataset.urlOpened = 'true';
    container.classList.add('completed');
    container.classList.remove('video', 'audio');
    if (downloadText) downloadText.textContent = 'Download Complete!';
    if (progressFill) {
      progressFill.classList.remove('indeterminate');
      progressFill.style.width = '100%';
    }
    if (progressText) progressText.textContent = '100%';
    if (progressRetryBtn) progressRetryBtn.style.display = 'none';
    if (downloadAgainBtn) downloadAgainBtn.style.display = 'flex';
    if (statusText) {
      statusText.className = 'download-status-text';
      statusText.textContent = 'File ready. Downloading...';
    }
    container.dataset.downloading = 'false';
    Notify('success', 'Download started!');
    try {
      const ext = isAudioFormat(format) ? format : 'mp4';
      const prefix = isAudioFormat(format) ? 'youtube-audio' : 'youtube-video';
      const filename = `${prefix}.${ext}`;

      GM_xmlhttpRequest({
        method: 'GET',
        url: downloadUrl,
        responseType: 'blob',
        onload: function (res) {
          if (res.status !== 200 || !res.response) {
            setErrorState('Lỗi máy chủ tải xuống. Vui lòng thử lại sau!');
            return;
          }
          const blob = res.response;
          if (blob.size < 50000) {
            // < 50KB means it's likely an error page
            setErrorState('Lỗi: File bị hỏng (chỉ vài KB). API tải nhạc có thể đang bị quá tải!');
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);

          if (downloadText) downloadText.textContent = 'Hoàn tất!';
          if (statusText) statusText.textContent = 'Đã tải xong!';
        },
        onerror: function () {
          setErrorState('Lỗi mạng khi đang tải file!');
        },
      });
    } catch (e) {
      console.warn('[YT Tools] Could not trigger download:', e);
      window.open(downloadUrl, '_blank');
    }
  };

  const tryDubsProvider = async () => {
    const videoId = paramsVideoURL();
    if (!videoId) throw new Error('Missing videoId');

    const startUrl = new URL(DUBS_START_ENDPOINT);
    startUrl.searchParams.set('id', videoId);
    startUrl.searchParams.set('format', String(format));

    const startData = await fetchJsonWithTimeout(startUrl.toString(), 25000);
    if (!startData?.success || !startData?.progressId) {
      throw new Error('Dubs provider did not return success/progressId');
    }

    const statusUrl = new URL(DUBS_STATUS_ENDPOINT);
    statusUrl.searchParams.set('id', startData.progressId);

    let dubsFailCount = 0;
    let dubsDelay = 2000;

    const pollDubs = async () => {
      try {
        const st = await fetchJsonWithTimeout(statusUrl.toString(), 20000);
        dubsFailCount = 0;
        dubsDelay = 2000;

        const rawProgress = Number(st?.progress) || 0;
        const progress = Math.min(rawProgress / 10, 100);
        updateProgress(progress, progress < 10 ? 'Processing...' : 'Downloading...');

        if (st?.finished && st?.downloadUrl) {
          clearTimeout(container.__ytDownloadPoll);
          container.__ytDownloadPoll = null;
          markCompleteAndOpen(st.downloadUrl);
          return;
        }
      } catch (e) {
        dubsFailCount++;
        if (dubsFailCount >= 5) {
          console.error('[YT Tools] Dubs polling failed after 5 retries:', e);
          clearTimeout(container.__ytDownloadPoll);
          container.__ytDownloadPoll = null;
          setErrorState('Download failed - server error. Please retry.');
          return;
        }
        console.warn(`[YT Tools] Dubs poll error (${dubsFailCount}/5):`, e);
        dubsDelay = Math.min(dubsDelay * 2, 16000);
      }
      container.__ytDownloadPoll = setTimeout(pollDubs, dubsDelay);
    };
    container.__ytDownloadPoll = setTimeout(pollDubs, dubsDelay);
  };

  const tryCobaltProvider = () => {
    return new Promise((resolve, reject) => {
      const isAudio = isAudioFormat(format);
      // Cobalt v10 schema: videoQuality/audioFormat/downloadMode (old vQuality/aFormat/isAudioOnly removed).
      const body = {
        url: videoURL,
        downloadMode: isAudio ? 'audio' : 'auto',
        videoQuality: 'max',
        filenameStyle: 'pretty',
      };
      if (isAudio) {
        body.audioFormat = toCobaltAudioFormat(format);
        body.audioBitrate = '320';
      }
      GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.cobalt.tools/',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: JSON.stringify(body),
        onload: function (res) {
          if (res.status !== 200) {
            reject(new Error(`Cobalt HTTP ${res.status}`));
            return;
          }
          let data;
          try {
            data = JSON.parse(res.response);
          } catch {
            reject(new Error('Cobalt invalid JSON'));
            return;
          }
          if (data.status === 'error') {
            reject(new Error(data.error?.code || data.text || 'Cobalt error'));
          } else if (data.status === 'picker' && Array.isArray(data.picker) && data.picker.length) {
            // For audio: prefer audio entry; otherwise first.
            const pick = isAudio
              ? data.picker.find(p => p.type === 'audio') || data.picker[0]
              : data.picker[0];
            if (pick?.url) resolve({ success: true, download_url: pick.url });
            else reject(new Error('Cobalt picker had no usable url'));
          } else if (data.url) {
            // Covers status: redirect, tunnel, stream (all return url).
            resolve({ success: true, download_url: data.url });
          } else {
            reject(new Error(`Cobalt unhandled status: ${data.status}`));
          }
        },
        onerror: function () {
          reject(new Error('Cobalt network error'));
        },
      });
    });
  };

  try {
    let started = null;
    let lastErr = null;

    try {
      updateProgress(2, 'Trying Cobalt provider (Best Quality + Metadata)...');
      started = await tryCobaltProvider();
    } catch (e) {
      console.warn('[YT Tools] Cobalt failed:', e);
      lastErr = e;
    }

    if (started?.success && started?.download_url) {
      markCompleteAndOpen(started.download_url);
      return;
    }

    console.warn('[YT Tools] Cobalt failed, trying dubs.io', lastErr);
    updateProgress(10, 'Fallback: Trying Dubs provider...');
    await tryDubsProvider();
  } catch (error) {
    setErrorState('Tất cả API tải nhạc đều đang quá tải. Vui lòng thử lại sau!');
    console.error('[YT Tools] Download error:', error);
  }
}

// ------------------------------
// Download toolbar click handler (global delegation)
// ------------------------------

export function setupDownloadClickHandler() {
  if (__ytToolsRuntime.downloadClickHandlerInitialized) return;
  __ytToolsRuntime.downloadClickHandlerInitialized = true;

  document.addEventListener('click', e => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const clicked =
      target.closest('.download-btn') ||
      target.closest('.retry-btn') ||
      target.closest('.progress-retry-btn') ||
      target.closest('.download-again-btn');
    if (!clicked) return;
    e.preventDefault();

    const container = clicked.closest('.download-container');
    if (!container) return;

    // Resolve quality from dataset or from sibling <select>
    let quality = container.dataset.quality;
    let type = container.dataset.type;

    if (!quality) {
      const parent = container.parentElement;
      if (parent) {
        const sel = parent.querySelector('select');
        if (sel && sel.value) quality = sel.value;
      }
    }

    if (!type) {
      type = container.classList.contains('ocultarframeaudio') ? 'audio' : 'video';
    }

    // download-again just re-opens the last URL (no restart)
    if (clicked.classList.contains('download-again-btn')) {
      const url = container.dataset.lastDownloadUrl;
      if (url) {
        try {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch (e) {
          console.warn('[YT Tools] Could not reopen download:', e);
          window.open(url);
        }
      }
      return;
    }

    if (!quality) {
      const label = type === 'audio' ? 'audio quality' : 'video quality';
      Notify('warning', `Please select a ${label} first.`);
      return;
    }
    if (!type) return;

    if (clicked.classList.contains('progress-retry-btn')) {
      container.dataset.downloading = 'false';
      container.dataset.urlOpened = 'false';
      container.dataset.lastDownloadUrl = '';
      const againBtn = container.querySelector('.download-again-btn');
      if (againBtn) againBtn.style.display = 'none';
    }

    startDownloadVideoOrAudio(quality, container);
  });
}

// ------------------------------
// Simplified panel download init (for modular panel)
// ------------------------------

export function initDownloadFeature() {
  const downloadBtn = $id('downloadBtn');
  if (!downloadBtn || downloadBtn.dataset.ytDownloadBound) return;
  downloadBtn.dataset.ytDownloadBound = '1';

  downloadBtn.addEventListener('click', () => {
    const format = $id('downloadFormat')?.value || 'mp4';
    const quality = $id('downloadQuality')?.value || 'best';

    // For simplified panel, create a temporary container for progress
    const statusEl = $id('downloadStatus');
    if (statusEl) statusEl.textContent = 'Starting download...';

    // Use the full engine; progress updates go through the container
    const tmpContainer = $id('download-status') || $id('download-status-mp3');
    if (tmpContainer) {
      tmpContainer.dataset.quality = quality;
      tmpContainer.dataset.type = isAudioFormat(format) ? 'audio' : 'video';
      startDownloadVideoOrAudio(quality, tmpContainer);
    }
  });
}
