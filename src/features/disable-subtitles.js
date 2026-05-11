// Auto-disable subtitles/closed captions

export function disableSubtitles(enabled) {
  if (!enabled) return;
  const btn = document.querySelector('.ytp-subtitles-button[aria-pressed="true"]');
  if (btn) btn.click();
}
