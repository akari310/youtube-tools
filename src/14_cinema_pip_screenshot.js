function isWatchPage() {
  return window.location.href.includes('youtube.com/watch');
}

function isCinematicActive() {
  const cinematicDiv = document.getElementById('cinematics');
  if (!cinematicDiv) {
    return false;
  }

  const hasContent = cinematicDiv.innerHTML.trim() !== '';
  const hasCanvas = cinematicDiv.querySelector('canvas') !== null;
  const hasChildren = cinematicDiv.children.length > 0;

  const hasCinematicElements = cinematicDiv.querySelector('div[style*="position: fixed"]') !== null;

  return hasContent || hasCanvas || hasChildren || hasCinematicElements;
}

function toggleCinematicLighting() {
  const settingsButton = $e('.ytp-button.ytp-settings-button');
  if (!settingsButton) {
    console.log('[YT Tools] Settings button not found');
    return;
  }

  settingsButton.click();

  // Cinematic/ambient keywords in multiple languages for robust detection
  const cinematicKeywords = [
    'cinematic', 'lighting', 'cinema', 'ambient',
    'ch\u1EBF \u0111\u1ED9 \u0111i\u1EC7n \u1EA3nh', // Vietnamese: Chế độ điện ảnh
    '\u0111i\u1EC7n \u1EA3nh', // Vietnamese: điện ảnh
    'atmosph', 'ambiante', 'cin\u00E9ma', // French
    '\u30A2\u30F3\u30D3\u30A8\u30F3\u30C8', // Japanese
    '\uC2DC\uB124\uB9C8\uD2F1', // Korean
  ];

  const findAndClickCinematic = () => {
    const menuItems = $m('.ytp-menuitem');
    if (!menuItems || menuItems.length === 0) return false;

    for (let item of menuItems) {
      // Method 1: Look for toggle checkbox (cinematic is the only toggle-type menu item)
      const toggleCheckbox = item.querySelector('.ytp-menuitem-toggle-checkbox');
      if (toggleCheckbox) {
        console.log('[YT Tools] Found cinematic/ambient toggle item (by checkbox)');
        item.click();
        return true;
      }
    }

    // Method 2: Match by localized text keywords
    for (let item of menuItems) {
      const text = (item.textContent || '').toLowerCase();
      for (const kw of cinematicKeywords) {
        if (text.includes(kw)) {
          console.log('[YT Tools] Found cinematic option by keyword:', kw);
          item.click();
          return true;
        }
      }
    }

    // Method 3: Match by SVG icon path
    for (let item of menuItems) {
      const icon = item.querySelector('.ytp-menuitem-icon svg path');
      if (icon && (icon.getAttribute('d')?.includes('M21 7v10H3V7') ||
        icon.getAttribute('d')?.includes('M12 2C6.48 2 2 6.48 2 12'))) {
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

  // Use polling instead of MutationObserver for more reliable detection
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
      console.warn('[YT Tools] Could not find cinematic/ambient toggle after', maxAttempts, 'attempts');
      closeMenu();
    }
  }, 200);
}
