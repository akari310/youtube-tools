// ===========================================
// Download progress container (video or audio)
// ===========================================

export function buildDownloadContainer(id, type) {
  const container = document.createElement('div');
  container.id = id;
  container.className = `download-container ${type === 'audio' ? 'ocultarframeaudio' : 'ocultarframe'}`;

  const progRetryBtn = document.createElement('button');
  progRetryBtn.type = 'button';
  progRetryBtn.className = 'progress-retry-btn';
  progRetryBtn.title = 'Retry';
  progRetryBtn.style.display = 'none';
  progRetryBtn.textContent = '↻';

  const dlAgainBtn = document.createElement('button');
  dlAgainBtn.type = 'button';
  dlAgainBtn.className = 'download-again-btn';
  dlAgainBtn.title = 'Download again';
  dlAgainBtn.style.display = 'none';
  dlAgainBtn.textContent = '⬇';

  const dlInfo = document.createElement('div');
  dlInfo.className = 'download-info';
  const dlText = document.createElement('span');
  dlText.className = 'download-text';
  dlText.textContent = `Download ${type === 'audio' ? 'Audio' : 'Video'} And Please Wait...`;
  const dlQuality = document.createElement('span');
  dlQuality.className = 'download-quality';
  dlInfo.appendChild(dlText);
  dlInfo.appendChild(dlQuality);

  const dlActions = document.createElement('div');
  dlActions.className = 'download-actions';
  const dlBtn = document.createElement('button');
  dlBtn.type = 'button';
  dlBtn.className = `download-btn ${type}-btn`;
  dlBtn.textContent = 'Download';
  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'retry-btn';
  retryBtn.style.display = 'none';
  retryBtn.textContent = 'Retry';
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

  container.appendChild(progRetryBtn);
  container.appendChild(dlAgainBtn);
  container.appendChild(dlInfo);
  container.appendChild(dlActions);
  container.appendChild(progressC);

  return container;
}
