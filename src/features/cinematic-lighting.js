// Feature: Cinematic/Ambient Lighting toggle
import { $e, $m } from '../utils/dom.js';

const isYTMusic = location.hostname === 'music.youtube.com';

function isWatchPage() {
  return window.location.href.includes('youtube.com/watch');
}

export function isCinematicActive() {
  const cinematicDiv = document.getElementById('cinematics');
  if (!cinematicDiv) return false;

  const hasContent = cinematicDiv.innerHTML.trim() !== '';
  const hasCanvas = cinematicDiv.querySelector('canvas') !== null;
  const hasChildren = cinematicDiv.children.length > 0;
  const hasCinematicElements = cinematicDiv.querySelector('div[style*="position: fixed"]') !== null;

  return hasContent || hasCanvas || hasChildren || hasCinematicElements;
}

export function toggleCinematicLighting() {
  const settingsButton = $e('.ytp-button.ytp-settings-button');
  if (!settingsButton) {
    console.log('[YT Tools] Settings button not found');
    return;
  }

  settingsButton.click();

  const cinematicKeywords = [
    'cinematic',
    'lighting',
    'cinema',
    'ambient',
    'chế độ điện ảnh',
    'điện ảnh',
    'atmosph',
    'ambiante',
    'cinéma',
    'アンビエント',
    '시네마틱',
  ];

  const findAndClickCinematic = () => {
    const menuItems = $m('.ytp-menuitem');
    if (!menuItems || menuItems.length === 0) return false;

    for (const item of menuItems) {
      const toggleCheckbox = item.querySelector('.ytp-menuitem-toggle-checkbox');
      if (toggleCheckbox) {
        console.log('[YT Tools] Found cinematic/ambient toggle item (by checkbox)');
        item.click();
        return true;
      }
    }

    for (const item of menuItems) {
      const text = (item.textContent || '').toLowerCase();
      for (const kw of cinematicKeywords) {
        if (text.includes(kw)) {
          console.log('[YT Tools] Found cinematic option by keyword:', kw);
          item.click();
          return true;
        }
      }
    }

    for (const item of menuItems) {
      const icon = item.querySelector('.ytp-menuitem-icon svg path');
      if (
        icon &&
        (icon.getAttribute('d')?.includes('M21 7v10H3V7') ||
          icon.getAttribute('d')?.includes('M12 2C6.48 2 2 6.48 2 12'))
      ) {
        console.log('[YT Tools] Found cinematic option by SVG path');
        item.click();
        return true;
      }
    }

    return false;
  };

  const closeMenu = () => {
    const menu = $e('.ytp-settings-menu');
    if (menu) document.body.click();
  };

  let attempts = 0;
  const maxAttempts = 20;
  const pollInterval = setInterval(() => {
    attempts++;
    if (findAndClickCinematic()) {
      clearInterval(pollInterval);
      setTimeout(closeMenu, 150);
      return;
    }
    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      console.warn(
        '[YT Tools] Could not find cinematic/ambient toggle after',
        maxAttempts,
        'attempts'
      );
      closeMenu();
    }
  }, 200);
}

export function applyCinematicLighting(settings) {
  if (!settings?.cinematicLighting) return;
  if (!isWatchPage() || isYTMusic) return;

  const isCurrentlyActive = isCinematicActive();
  if (settings.syncCinematic) {
    if (settings.cinematicLighting && !isCurrentlyActive) {
      toggleCinematicLighting();
    } else if (!settings.cinematicLighting && isCurrentlyActive) {
      toggleCinematicLighting();
    }
  } else {
    const cinematicDiv = document.getElementById('cinematics');
    if (cinematicDiv) {
      cinematicDiv.style.display = settings.cinematicLighting ? 'block' : 'none';
    }
  }
}
