// Toggle navbar/related section visibility

export function hideNavbar(enabled) {
  // Target the main YouTube masthead/header elements
  const masthead =
    document.querySelector('ytd-masthead') ||
    document.querySelector('#masthead') ||
    document.querySelector('#masthead-container') ||
    document.querySelector('header') ||
    document.querySelector('ytd-app');

  if (masthead) {
    if (enabled) {
      masthead.style.display = 'none';
    } else {
      masthead.style.display = '';
    }
  }

  // Also target YouTube Music header if present
  const ytmHeader =
    document.querySelector('ytm-top-bar') ||
    document.querySelector('.header.ytmusic-app') ||
    document.querySelector('ytmusic-top-bar');

  if (ytmHeader) {
    if (enabled) {
      ytmHeader.style.display = 'none';
    } else {
      ytmHeader.style.display = '';
    }
  }
}
