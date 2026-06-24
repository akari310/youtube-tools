import {
  getApiKey,
  DOWNLOAD_API_FALLBACK_BASES,
  DUBS_START_ENDPOINT,
  DUBS_STATUS_ENDPOINT,
} from '../config/constants.js';
import { $id } from '../utils/dom.js';
import { Notify, paramsVideoURL } from '../utils/helpers.js';
import { __ytToolsRuntime } from '../utils/runtime.js';

// ------------------------------
// Feature: Video/Audio Download (full implementation)
// ------------------------------

export async function startDownloadVideoOrAudio(format, container) {
  const videoURL = window.location.href;

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

  const fetchJsonWithTimeout = async (url, timeoutMs = 20000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  };

  const fetchJsonWithRetry = async (url, timeoutMs = 20000, maxRetries = 2) => {
    let lastErr;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fetchJsonWithTimeout(url, timeoutMs);
      } catch (e) {
        lastErr = e;
        if (i < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
    }
    throw lastErr;
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
      const filename = `youtube-audio.${format === 'webm' || format === 'opus' || format === 'ogg' ? format : 'mp3'}`;
      
      GM_xmlhttpRequest({
        method: 'GET',
        url: downloadUrl,
        responseType: 'blob',
        onload: function(res) {
          if (res.status !== 200 || !res.response) {
            setErrorState('Lỗi máy chủ tải xuống. Vui lòng thử lại sau!');
            return;
          }
          const blob = res.response;
          if (blob.size < 50000) { // < 50KB means it's likely an error page
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
        onerror: function() {
          setErrorState('Lỗi mạng khi đang tải file!');
        }
      });
    } catch (e) {
      console.warn('[YT Tools] Could not trigger download:', e);
      window.open(downloadUrl, '_blank');
    }
  };

  const pollProgressUrl = progressURL => {
    let failCount = 0;
    let delay = 2000;

    const poll = async () => {
      try {
        const progressData = await fetchJsonWithTimeout(progressURL, 15000);
        failCount = 0;
        delay = 2000;

        const progress = Math.min((Number(progressData.progress) || 0) / 10, 100);
        updateProgress(progress, progress < 10 ? 'Processing...' : 'Downloading...');

        if (Number(progressData.progress) >= 1000 && progressData.download_url) {
          console.log('[YT Tools] Download ready:', {
            progress: progressData.progress,
            url: progressData.download_url,
          });
          clearTimeout(container.__ytDownloadPoll);
          container.__ytDownloadPoll = null;
          markCompleteAndOpen(progressData.download_url);
          return;
        }

        if (Number(progressData.progress) >= 1000 && !progressData.download_url) {
          console.warn('[YT Tools] Download reached 100% but no download_url:', progressData);
        }
      } catch (e) {
        failCount++;
        if (failCount >= 5) {
          setErrorState('Download failed - server timeout. Please retry.');
          return;
        }
        console.warn(`[YT Tools] Progress poll error (${failCount}/5):`, e);
        delay = Math.min(delay * 2, 16000);
      }
      container.__ytDownloadPoll = setTimeout(poll, delay);
    };
    container.__ytDownloadPoll = setTimeout(poll, delay);
  };

  const trySaveNowProvider = async baseUrl => {
    const url = new URL('/ajax/download.php', baseUrl);
    url.searchParams.set('copyright', '0');
    url.searchParams.set('allow_extended_duration', '1');
    url.searchParams.set('format', String(format));
    url.searchParams.set('url', videoURL);
    url.searchParams.set('api', getApiKey());
    const data = await fetchJsonWithRetry(url.toString(), 25000, 1);
    if (!data?.success || !data?.progress_url) {
      throw new Error('SaveNow provider did not return success/progress_url');
    }
    return data;
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

  try {
    let started = null;
    let lastErr = null;

    for (const base of DOWNLOAD_API_FALLBACK_BASES) {
      try {
        updateProgress(5, 'Trying SaveNow provider...');
        started = await trySaveNowProvider(base);
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`[YT Tools] SaveNow (${base}) failed:`, e);
      }
    }

    if (started?.success && started?.progress_url) {
      pollProgressUrl(started.progress_url);
      return;
    }

    console.warn('[YT Tools] SaveNow failed, trying dubs.io', lastErr);
    updateProgress(10, 'Fallback: Trying Dubs provider...');
    await tryDubsProvider();
  } catch (error) {
    setErrorState('All download servers are busy. Please retry later.');
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
      tmpContainer.dataset.type = format === 'mp3' ? 'audio' : 'video';
      startDownloadVideoOrAudio(quality, tmpContainer);
    }
  });
}
