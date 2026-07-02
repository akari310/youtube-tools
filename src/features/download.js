import { DUBS_START_ENDPOINT, DUBS_STATUS_ENDPOINT } from '../config/constants.js';
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

const AUDIO_FORMATS = new Set(['best', 'mp3', 'ogg', 'opus', 'webm', 'wav']);
const isAudioFormat = f => AUDIO_FORMATS.has(String(f).toLowerCase());

// Cobalt v10 audioFormat: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus'.
// webm/original → 'best' (preserves YouTube source codec when available).
function toCobaltAudioFormat(f) {
  if (f === 'mp3' || f === 'ogg' || f === 'opus' || f === 'wav') return f;
  return 'best';
}

function toCobaltVideoQuality(quality) {
  if (quality === '4k') return '2160';
  if (quality === '8k') return '4320';
  if (/^\d+$/.test(String(quality))) return String(quality);
  return 'max';
}

const FORMAT_LABELS = {
  best: 'Original audio',
  mp3: 'MP3 320 kbps',
  ogg: 'OGG',
  opus: 'OPUS',
  webm: 'WEBM',
  wav: 'WAV',
  144: '144p',
  240: '240p',
  360: '360p',
  480: '480p',
  720: '720p HD',
  1080: '1080p Full HD',
  1440: '1440p 2K',
  '4k': '2160p 4K',
  '8k': '4320p 8K',
};

const MIME_EXTENSIONS = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/opus': 'opus',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

function getFormatLabel(format) {
  return FORMAT_LABELS[String(format).toLowerCase()] || String(format).toUpperCase();
}

function sanitizeFilename(value) {
  const withoutControlChars = String(value || 'youtube-download')
    .split('')
    .filter(char => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');

  return (
    withoutControlChars
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140) || 'youtube-download'
  );
}

function getCurrentVideoTitle() {
  return (
    document.querySelector('h1 yt-formatted-string')?.textContent?.trim() ||
    document.querySelector('ytmusic-player-bar .title')?.textContent?.trim() ||
    document.title.replace(/\s*-\s*YouTube(?: Music)?\s*$/i, '').trim() ||
    'youtube-download'
  );
}

function getResponseHeader(headers, name) {
  const match = String(headers || '').match(new RegExp(`^${name}:\\s*(.+)$`, 'im'));
  return match?.[1]?.trim() || '';
}

function getFilenameFromDisposition(headers) {
  const disposition = getResponseHeader(headers, 'content-disposition');
  if (!disposition) return '';
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {}
  }
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] || '';
}

function getExtensionFromDownload(downloadUrl, blob, format, type, headers) {
  const dispositionName = getFilenameFromDisposition(headers);
  const dispositionExt = dispositionName.match(/\.([a-z0-9]+)$/i)?.[1];
  if (dispositionExt) return dispositionExt.toLowerCase();

  const contentType = getResponseHeader(headers, 'content-type') || blob?.type;
  const mimeExt = MIME_EXTENSIONS[String(contentType).split(';')[0].toLowerCase()];
  if (mimeExt) return mimeExt;

  try {
    const pathExt = new URL(downloadUrl).pathname.match(/\.([a-z0-9]+)$/i)?.[1];
    if (pathExt) return pathExt.toLowerCase();
  } catch {}

  if (format === 'best') return type === 'audio' ? 'm4a' : 'mp4';
  if (format === 'webm') return 'webm';
  return type === 'audio' ? format : 'mp4';
}

function buildDownloadFilename(downloadUrl, blob, format, type, headers) {
  const dispositionName = getFilenameFromDisposition(headers);
  if (dispositionName) return sanitizeFilename(dispositionName);
  const ext = getExtensionFromDownload(downloadUrl, blob, format, type, headers);
  const prefix = type === 'audio' ? 'audio' : 'video';
  return `${sanitizeFilename(getCurrentVideoTitle())}-${prefix}.${ext}`;
}

function clearDownloadPoll(container) {
  if (container.__ytDownloadPoll) {
    clearTimeout(container.__ytDownloadPoll);
    container.__ytDownloadPoll = null;
  }
}

function abortActiveDownload(container) {
  clearDownloadPoll(container);
  container.__ytDownloadToken = Symbol('cancelled-download');
  if (container.__ytDownloadRequests) {
    container.__ytDownloadRequests.forEach(req => {
      try {
        req.abort?.();
      } catch {}
    });
    container.__ytDownloadRequests.clear();
  }
}

const COBALT_APIS_FALLBACK = [
  'https://cobaltapi.kittycat.boo/',
  'https://cobaltapi.cjs.nz/',
  'https://api.cobalt.blackcat.sweeux.org/',
  'https://dog.kittycat.boo/',
  'https://rue-cobalt.xenon.zone/',
];

function fetchWorkingCobaltApis() {
  return new Promise(resolve => {
    const isMusic = window.location.hostname.includes('music.youtube.com');
    const key = isMusic ? 'youtube-music' : 'youtube';

    const t = setTimeout(() => {
      console.warn('[YT Tools] Timeout fetching working Cobalt APIs, using fallback list');
      resolve(COBALT_APIS_FALLBACK);
    }, 4000); // 4s timeout

    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://cobalt.directory/api/working?type=api',
      responseType: 'json',
      onload: function (res) {
        clearTimeout(t);
        try {
          const data =
            typeof res.response === 'string'
              ? JSON.parse(res.response)
              : res.response || JSON.parse(res.responseText);
          if (data && data.data) {
            let list = data.data[key] || data.data['youtube'] || [];
            if (list.length > 0) {
              list = list.map(url => (url.endsWith('/') ? url : url + '/'));
              const combined = Array.from(new Set([...list, ...COBALT_APIS_FALLBACK]));
              resolve(combined);
              return;
            }
          }
        } catch (e) {
          console.warn('[YT Tools] Error parsing Cobalt directory response:', e);
        }
        resolve(COBALT_APIS_FALLBACK);
      },
      onerror: function () {
        clearTimeout(t);
        resolve(COBALT_APIS_FALLBACK);
      },
      onabort: function () {
        clearTimeout(t);
        resolve(COBALT_APIS_FALLBACK);
      },
    });
  });
}

export async function startDownloadVideoOrAudio(format, container) {
  format = String(format || '').toLowerCase();
  const videoURL = normalizeYouTubeURL(window.location.href);
  const type = container.dataset.type || (isAudioFormat(format) ? 'audio' : 'video');
  const isAudio = type === 'audio' || isAudioFormat(format);

  // Check if already downloading
  if (container.dataset.downloading === 'true') {
    return;
  }

  abortActiveDownload(container);
  const downloadToken = Symbol('yt-download');
  container.__ytDownloadToken = downloadToken;
  container.__ytDownloadRequests = new Set();
  const isCurrentDownload = () => container.__ytDownloadToken === downloadToken;
  const trackRequest = req => {
    if (req?.abort) container.__ytDownloadRequests.add(req);
    return req;
  };
  const untrackRequest = req => {
    if (req?.abort) container.__ytDownloadRequests?.delete(req);
  };

  // Get UI elements from the container
  const downloadBtn = container.querySelector('.download-btn');
  const retryBtn = container.querySelector('.retry-btn');
  const progressRetryBtn = container.querySelector('.progress-retry-btn');
  const downloadAgainBtn = container.querySelector('.download-again-btn');
  const progressContainer = container.querySelector('.progress-container');
  const progressFill = container.querySelector('.progress-fill');
  const progressText = container.querySelector('.progress-text');
  const downloadText = container.querySelector('.download-text');
  const downloadQuality = container.querySelector('.download-quality');
  const providerText = container.querySelector('.download-provider');

  // Set downloading flag
  container.dataset.downloading = 'true';
  container.dataset.type = isAudio ? 'audio' : 'video';
  container.dataset.quality = format;
  container.dataset.urlOpened = 'false';
  container.dataset.lastDownloadUrl = '';

  // Set gradient class based on type
  const typeClass = isAudio ? 'audio' : 'video';
  container.classList.remove('audio', 'video', 'completed', 'error', 'is-downloading');
  container.classList.add(typeClass, 'is-downloading');

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
  if (downloadText)
    downloadText.textContent = isAudio ? 'Đang chuẩn bị tải nhạc' : 'Đang chuẩn bị tải video';
  if (downloadQuality) downloadQuality.textContent = getFormatLabel(format);
  if (providerText) providerText.textContent = 'Provider: auto';
  if (progressFill) {
    progressFill.style.width = '0%';
    progressFill.classList.add('indeterminate');
  }
  if (progressText) progressText.textContent = '0%';
  if (statusText) {
    statusText.textContent = 'Đang kết nối máy chủ tải...';
    statusText.className = 'download-status-text status-dot';
  }

  const updateProgress = (pct, statusMsg) => {
    if (!isCurrentDownload()) return;
    const safePct = Math.max(0, Math.min(Number(pct) || 0, 100));
    if (progressFill) {
      if (safePct > 0) {
        progressFill.classList.remove('indeterminate');
      }
      progressFill.style.width = `${safePct}%`;
    }
    if (progressText) progressText.textContent = `${Math.round(safePct)}%`;
    if (statusText && statusMsg) {
      statusText.textContent = statusMsg;
    }
  };

  const setProvider = provider => {
    if (providerText) providerText.textContent = `Provider: ${provider}`;
  };

  const fetchJsonWithTimeout = (url, timeoutMs = 20000) => {
    return new Promise((resolve, reject) => {
      let aborted = false;
      let req = null;
      const t = setTimeout(() => {
        aborted = true;
        untrackRequest(req);
        reject(new Error('Timeout'));
        if (req && req.abort) req.abort();
      }, timeoutMs);

      req = trackRequest(
        GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          responseType: 'json',
          onload: function (res) {
            if (aborted) return;
            clearTimeout(t);
            untrackRequest(req);
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
            untrackRequest(req);
            reject(new Error('Failed to fetch'));
          },
          onabort: function () {
            if (aborted) return;
            clearTimeout(t);
            untrackRequest(req);
            reject(new Error('Aborted'));
          },
        })
      );
    });
  };

  const setErrorState = message => {
    if (!isCurrentDownload()) return;
    if (retryBtn) retryBtn.style.display = 'block';
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressRetryBtn) progressRetryBtn.style.display = 'none';
    if (downloadAgainBtn) downloadAgainBtn.style.display = 'none';
    container.classList.remove('completed', 'video', 'audio', 'is-downloading');
    container.classList.add('error');
    container.dataset.downloading = 'false';
    container.dataset.urlOpened = 'false';
    container.dataset.lastDownloadUrl = '';
    if (downloadText)
      downloadText.textContent = isAudio ? 'Tải nhạc chưa thành công' : 'Tải video chưa thành công';
    if (statusText) {
      statusText.className = 'download-status-text';
      statusText.textContent = message || 'Máy chủ tải đang quá tải. Hãy thử lại.';
    }
    if (message) Notify('error', message);
  };

  const markCompleteAndOpen = downloadUrl => {
    if (!isCurrentDownload()) return;
    if (!downloadUrl) {
      setErrorState();
      return;
    }
    container.dataset.lastDownloadUrl = String(downloadUrl);
    if (container.dataset.urlOpened === 'true') return;
    container.dataset.urlOpened = 'true';
    container.classList.add('completed');
    container.classList.remove('video', 'audio', 'error', 'is-downloading');
    if (downloadText) downloadText.textContent = 'Đã tạo link tải';
    if (progressFill) {
      progressFill.classList.remove('indeterminate');
      progressFill.style.width = '100%';
    }
    if (progressText) progressText.textContent = '100%';
    if (progressRetryBtn) progressRetryBtn.style.display = 'none';
    if (downloadAgainBtn) downloadAgainBtn.style.display = 'flex';
    if (statusText) {
      statusText.className = 'download-status-text';
      statusText.textContent = 'File sẵn sàng. Đang tải về máy...';
    }
    container.dataset.downloading = 'false';
    Notify('success', isAudio ? 'Đã bắt đầu tải nhạc!' : 'Đã bắt đầu tải video!');
    try {
      let blobReq = null;
      blobReq = trackRequest(
        GM_xmlhttpRequest({
          method: 'GET',
          url: downloadUrl,
          responseType: 'blob',
          onload: function (res) {
            untrackRequest(blobReq);
            if (!isCurrentDownload()) return;
            const responseBlob = res.response;
            if (res.status !== 200 || !responseBlob) {
              console.warn(
                '[YT Tools] Blob download returned non-200 status, falling back to direct download link'
              );
              window.open(downloadUrl, '_blank');
              if (downloadText) downloadText.textContent = 'Mở link tải trực tiếp';
              if (statusText) statusText.textContent = 'Đang tải qua trình duyệt...';
              container.dataset.downloading = 'false';
              return;
            }
            if (responseBlob.size < 50000) {
              console.warn(
                '[YT Tools] Blob size too small, probably error page. Falling back to direct download link'
              );
              window.open(downloadUrl, '_blank');
              if (downloadText) downloadText.textContent = 'Mở link tải trực tiếp';
              if (statusText) statusText.textContent = 'Đang tải qua trình duyệt...';
              container.dataset.downloading = 'false';
              return;
            }
            const filename = buildDownloadFilename(
              downloadUrl,
              responseBlob,
              format,
              typeClass,
              res.responseHeaders
            );
            const url = URL.createObjectURL(responseBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);

            if (downloadText) downloadText.textContent = 'Tải xong';
            if (statusText) statusText.textContent = 'Đã lưu file vào trình duyệt.';
          },
          onerror: function () {
            untrackRequest(blobReq);
            if (!isCurrentDownload()) return;
            console.warn('[YT Tools] Blob download failed, falling back to direct download link');
            window.open(downloadUrl, '_blank');
            if (downloadText) downloadText.textContent = 'Mở link tải trực tiếp';
            if (statusText) statusText.textContent = 'Đang tải qua trình duyệt...';
            container.dataset.downloading = 'false';
          },
        })
      );
    } catch (e) {
      console.warn('[YT Tools] Could not trigger download:', e);
      window.open(downloadUrl, '_blank');
    }
  };

  const tryDubsProvider = async () => {
    const videoId = paramsVideoURL();
    if (!videoId) throw new Error('Missing videoId');
    const dubsFormat = isAudio && (format === 'best' || format === 'webm') ? 'mp3' : format;

    const startUrl = new URL(DUBS_START_ENDPOINT);
    startUrl.searchParams.set('id', videoId);
    startUrl.searchParams.set('format', String(dubsFormat));

    setProvider('Dubs');
    updateProgress(12, 'Dubs đang tạo link dự phòng...');
    const startData = await fetchJsonWithTimeout(startUrl.toString(), 25000);
    if (!startData?.success || !startData?.progressId) {
      throw new Error('Dubs provider did not return success/progressId');
    }

    const statusUrl = new URL(DUBS_STATUS_ENDPOINT);
    statusUrl.searchParams.set('id', startData.progressId);

    let dubsFailCount = 0;
    let dubsDelay = 2000;

    const pollDubs = async () => {
      if (!isCurrentDownload()) return;
      try {
        const st = await fetchJsonWithTimeout(statusUrl.toString(), 20000);
        dubsFailCount = 0;
        dubsDelay = 2000;

        const rawProgress = Number(st?.progress) || 0;
        const progress = Math.max(15, Math.min(rawProgress / 10, 96));
        updateProgress(
          progress,
          progress < 40 ? 'Dubs đang xử lý...' : 'Dubs đang chuẩn bị file...'
        );

        if (st?.finished && st?.downloadUrl) {
          clearDownloadPoll(container);
          container.__ytDownloadPoll = null;
          markCompleteAndOpen(st.downloadUrl);
          return;
        }
      } catch (e) {
        dubsFailCount++;
        if (dubsFailCount >= 5) {
          console.error('[YT Tools] Dubs polling failed after 5 retries:', e);
          clearDownloadPoll(container);
          setErrorState('Download failed - server error. Please retry.');
          return;
        }
        console.warn(`[YT Tools] Dubs poll error (${dubsFailCount}/5):`, e);
        updateProgress(35, `Dubs chưa phản hồi, thử lại lần ${dubsFailCount}/5...`);
        dubsDelay = Math.min(dubsDelay * 2, 16000);
      }
      container.__ytDownloadPoll = setTimeout(pollDubs, dubsDelay);
    };
    container.__ytDownloadPoll = setTimeout(pollDubs, dubsDelay);
  };

  const tryCobaltProvider = cobaltApis => {
    return new Promise((resolve, reject) => {
      // Cobalt v10 schema: videoQuality/audioFormat/downloadMode (old vQuality/aFormat/isAudioOnly removed).
      const body = {
        url: videoURL,
        downloadMode: isAudio ? 'audio' : 'auto',
        videoQuality: toCobaltVideoQuality(format),
        filenameStyle: 'pretty',
      };
      if (isAudio) {
        body.audioFormat = toCobaltAudioFormat(format);
        body.audioBitrate = '320';
      }

      let attempt = 0;

      const makeRequest = () => {
        if (!isCurrentDownload()) return;
        if (attempt >= cobaltApis.length) {
          reject(new Error('All Cobalt APIs failed'));
          return;
        }
        const api = cobaltApis[attempt];
        setProvider(`Cobalt ${attempt + 1}/${cobaltApis.length}`);
        updateProgress(
          Math.min(8 + attempt * 4, 55),
          `Đang thử Cobalt ${attempt + 1}/${cobaltApis.length}...`
        );

        let reqAborted = false;
        let req = null;
        const timeoutId = setTimeout(() => {
          reqAborted = true;
          untrackRequest(req);
          try {
            req?.abort?.();
          } catch {}
          attempt++;
          makeRequest();
        }, 10000); // 10s timeout per API

        req = trackRequest(
          GM_xmlhttpRequest({
            method: 'POST',
            url: api,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            data: JSON.stringify(body),
            onload: function (res) {
              if (reqAborted) return;
              clearTimeout(timeoutId);
              untrackRequest(req);
              if (res.status !== 200) {
                console.warn(`[YT Tools] Cobalt API ${api} returned status ${res.status}`);
                attempt++;
                makeRequest();
                return;
              }
              let data;
              try {
                data =
                  typeof res.response === 'string'
                    ? JSON.parse(res.response)
                    : res.response || JSON.parse(res.responseText);
              } catch {
                attempt++;
                makeRequest();
                return;
              }
              if (data.status === 'error') {
                console.warn(`[YT Tools] Cobalt (${api}) error:`, data.error?.code || data.text);
                attempt++;
                makeRequest();
              } else if (
                data.status === 'picker' &&
                Array.isArray(data.picker) &&
                data.picker.length
              ) {
                const pick = isAudio
                  ? data.picker.find(p => p.type === 'audio') || data.picker[0]
                  : data.picker[0];
                if (pick?.url)
                  resolve({ success: true, download_url: pick.url, provider: 'Cobalt' });
                else {
                  attempt++;
                  makeRequest();
                }
              } else if (data.url) {
                resolve({ success: true, download_url: data.url, provider: 'Cobalt' });
              } else {
                attempt++;
                makeRequest();
              }
            },
            onerror: function () {
              if (reqAborted) return;
              clearTimeout(timeoutId);
              untrackRequest(req);
              attempt++;
              makeRequest();
            },
          })
        );
      };

      makeRequest();
    });
  };

  try {
    let started = null;
    let lastErr = null;

    try {
      updateProgress(2, 'Đang tìm máy chủ Cobalt còn hoạt động...');
      const cobaltApis = await fetchWorkingCobaltApis();
      updateProgress(5, `Tìm thấy ${cobaltApis.length} máy chủ, đang chọn máy chủ nhanh nhất...`);
      started = await tryCobaltProvider(cobaltApis);
    } catch (e) {
      console.warn('[YT Tools] Cobalt failed:', e);
      lastErr = e;
    }

    if (started?.success && started?.download_url) {
      setProvider(started.provider || 'Cobalt');
      markCompleteAndOpen(started.download_url);
      return;
    }

    console.warn('[YT Tools] Cobalt failed, trying dubs.io', lastErr);
    updateProgress(10, 'Cobalt bận, chuyển sang máy chủ dự phòng...');
    await tryDubsProvider();
  } catch (error) {
    setErrorState('Tất cả máy chủ tải đang quá tải. Vui lòng thử lại sau!');
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
      const label = type === 'audio' ? 'định dạng nhạc' : 'chất lượng video';
      Notify('warning', `Vui lòng chọn ${label} trước.`);
      return;
    }
    if (!type) return;

    if (clicked.classList.contains('progress-retry-btn')) {
      abortActiveDownload(container);
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
