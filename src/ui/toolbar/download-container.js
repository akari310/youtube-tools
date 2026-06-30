// ===========================================
// Download progress container (video or audio)
// ===========================================

export function buildDownloadContainer(id, type) {
  const container = document.createElement('div');
  container.id = id;
  container.className = `download-container ${type === 'audio' ? 'ocultarframeaudio' : 'ocultarframe'}`;
  container.dataset.type = type;

  const progRetryBtn = document.createElement('button');
  progRetryBtn.type = 'button';
  progRetryBtn.className = 'progress-retry-btn';
  progRetryBtn.title = 'Hủy và thử lại';
  progRetryBtn.style.display = 'none';
  progRetryBtn.textContent = '↻';

  const dlAgainBtn = document.createElement('button');
  dlAgainBtn.type = 'button';
  dlAgainBtn.className = 'download-again-btn';
  dlAgainBtn.title = 'Mở lại link tải';
  dlAgainBtn.style.display = 'none';
  dlAgainBtn.textContent = '⬇';

  const dlInfo = document.createElement('div');
  dlInfo.className = 'download-info';

  const dlKind = document.createElement('span');
  dlKind.className = 'download-kind';
  dlKind.textContent = type === 'audio' ? 'AUDIO' : 'VIDEO';

  const dlCopy = document.createElement('div');
  dlCopy.className = 'download-copy';

  const dlText = document.createElement('span');
  dlText.className = 'download-text';
  dlText.textContent = type === 'audio' ? 'Tải nhạc từ video này' : 'Tải video này';

  const dlProvider = document.createElement('span');
  dlProvider.className = 'download-provider';
  dlProvider.textContent = 'Provider: auto';

  const dlQuality = document.createElement('span');
  dlQuality.className = 'download-quality';
  dlQuality.textContent = 'Chưa chọn';

  dlCopy.appendChild(dlText);
  dlCopy.appendChild(dlProvider);
  dlInfo.appendChild(dlKind);
  dlInfo.appendChild(dlCopy);
  dlInfo.appendChild(dlQuality);

  const dlActions = document.createElement('div');
  dlActions.className = 'download-actions';
  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = `download-btn ${type}-btn`;
  dlBtn.textContent = type === 'audio' ? 'Tải nhạc' : 'Tải video';
  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'retry-btn';
  retryBtn.style.display = 'none';
  retryBtn.textContent = 'Thử lại';
  dlActions.appendChild(dlBtn);
  dlActions.appendChild(retryBtn);

  const progressC = document.createElement('div');
  progressC.className = 'progress-container';
  progressC.style.display = 'none';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressBar.appendChild(progressFill);
  const progressText = document.createElement('span');
  progressText.className = 'progress-text';
  progressText.textContent = '0%';
  progressC.appendChild(progressBar);
  progressC.appendChild(progressText);

  const statusText = document.createElement('div');
  statusText.className = 'download-status-text';
  statusText.textContent = '';

  container.appendChild(progRetryBtn);
  container.appendChild(dlAgainBtn);
  container.appendChild(dlInfo);
  container.appendChild(dlActions);
  container.appendChild(progressC);
  container.appendChild(statusText);

  return container;
}
