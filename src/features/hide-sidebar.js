// Toggle sidebar/related section visibility

export function hideSidebar(enabled) {
  const secondary = document.querySelector('#secondary #secondary-inner') || document.querySelector('#secondary');
  if (secondary) {
    secondary.style.display = enabled ? 'none' : '';
  }
}
