import {
  API_URL_AUDIO_VIDEO,
  getApiKey,
  DOWNLOAD_API_FALLBACK_BASES,
  DUBS_START_ENDPOINT,
  DUBS_STATUS_ENDPOINT,
} from '../config/constants.js';
import { $e, $id } from '../utils/dom.js';
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

  // Update UI to show progress
  if (downloadBtn) downloadBtn.style.display = 'none';
  if (retryBtn) retryBtn.style.display = 'none';
  if (progressRetryBtn) progressRetryBtn.style.display = 'block';
  if (downloadAgainBtn) downloadAgainBtn.style.display = 'none';
  if (progressContainer) progressContainer.style.display = 'flex';
  if (progressFill) progressFill.style.width = '0%';
  if (progressText) progressText.textContent = '0%';

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
    // Save for the "download again" button
    container.dataset.lastDownloadUrl = String(downloadUrl);
    // Check if URL was already opened
    if (container.dataset.urlOpened === 'true') return;
    // Mark URL as opened
    container.dataset.urlOpened = 'true';
    // Update UI to show completion
    container.classList.add('completed');
    container.classList.remove('video', 'audio');
    if (downloadText) downloadText.textContent = 'Download Complete!';
    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = '100%';
    if (progressRetryBtn) progressRetryBtn.style.display = 'none';
    if (downloadAgainBtn) downloadAgainBtn.style.display = 'flex';
    container.dataset.downloading = 'false';
    Notify('success', 'Download started!');
    try {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn('[YT Tools] Could not trigger download:', e);
      window.open(downloadUrl);
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
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;

        if (Number(progressData.progress) >= 1000 && progressData.download_url) {
          clearTimeout(container.__ytDownloadPoll);
          container.__ytDownloadPoll = null;
          markCompleteAndOpen(progressData.download_url);
          return;
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

    container.__ytDownloadPoll = setInterval(async () => {
      try {
        const st = await fetchJsonWithTimeout(statusUrl.toString(), 20000);
        const rawProgress = Number(st?.progress) || 0;
        const progress = Math.min(rawProgress / 10, 100);
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;

        if (st?.finished && st?.downloadUrl) {
          clearTimeout(container.__ytDownloadPoll);
          container.__ytDownloadPoll = null;
          markCompleteAndOpen(st.downloadUrl);
        }
      } catch (e) {
        console.error('[YT Tools] Dubs polling error:', e);
        clearTimeout(container.__ytDownloadPoll);
        container.__ytDownloadPoll = null;
        setErrorState('Download failed - server error. Please retry.');
      }
    }, 3000);
  };

  try {
    let started = null;
    let lastErr = null;

    for (const base of DOWNLOAD_API_FALLBACK_BASES) {
      try {
        started = await trySaveNowProvider(base);
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (started?.success && started?.progress_url) {
      pollProgressUrl(started.progress_url);
      return;
    }

    console.warn('[YT Tools] SaveNow failed, trying dubs.io', lastErr);
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

    const container = clicked.closest('.download-container');
    if (!container) return;

    const quality = container.dataset.quality;
    const type = container.dataset.type;

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

    if (!quality || !type) return;

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
    const videoUrl = window.location.href;
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
