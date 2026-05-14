// Feature: Cinematic/Ambient Lighting toggle
import { $e, $m } from '../../utils/dom.js';

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
    'ánh sáng điện ảnh',
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
      if (icon) {
        const d = icon.getAttribute('d') || '';
        if (
          d.includes('M21 7v10H3V7') ||
          d.includes('M12 2C6.48 2 2 6.48 2 12') ||
          d.includes('M12 .5C11.73 .5 11.48 .60 11.29 .79') // Path provided by user
        ) {
          console.log('[YT Tools] Found cinematic option by SVG path');
          item.click();
          return true;
        }
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
  if (!isWatchPage() || isYTMusic) return;

  const isCurrentlyActive = isCinematicActive();
  const desiredActive = !!settings.cinematicLighting;

  // If desired state is different from current state, toggle it
  if (desiredActive !== isCurrentlyActive) {
    console.log(`[YT Tools] Syncing Cinematic Lighting: Current=${isCurrentlyActive}, Desired=${desiredActive}`);
    toggleCinematicLighting();
  }

  // Background transparent enhancement (legacy fix)
  const cinematica = $e('#cinematics > div');
  if (cinematica != undefined) {
    cinematica.style.cssText =
      'position: fixed; inset: 0px; pointer-events: none; transform: scale(1.5, 2)';
  }
}

export function downloadThumbnail() {
  const cinematica = $e('#cinematics > div');
  const videoFull = $e('#movie_player');

  if (cinematica != undefined || videoFull != undefined) {
    const parametrosURL = new URLSearchParams(window.location.search);
    const enlace = parametrosURL.get('v');

    const imageUrl = `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`;

    fetch(imageUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const imageSizeKB = blob.size / 1024;

        if (imageSizeKB >= 20) {
          // Open in new window
          window.open(
            `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`,
            'popUpWindow',
            'height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
          );

          // Download the image
          const imageUrlObject = URL.createObjectURL(blob);

          const enlaceDescarga = document.createElement('a');
          enlaceDescarga.href = imageUrlObject;
          const titleVideo = isYTMusic
            ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
            : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
          enlaceDescarga.download = `${titleVideo}_maxresdefault.jpg`;
          enlaceDescarga.click();

          URL.revokeObjectURL(imageUrlObject);
        } else {
          console.log(
            'La imagen no excede los 20 KB. No se descargará.'
          );
        }
      })
      .catch((error) => {
        alert('No found image');
        console.error('Error al obtener la imagen:', error);
      });
  }
}

export function setupThumbnailDownloadButton() {
  // Find or create the thumbnail download button
  let btnImagen = $e('#yt-thumbnail-download-btn');

  if (!btnImagen) {
    btnImagen = document.createElement('button');
    btnImagen.id = 'yt-thumbnail-download-btn';
    btnImagen.innerHTML = '<i class="fas fa-image"></i> Download Thumbnail';
    btnImagen.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      margin: 8px;
      font-size: 12px;
      transition: all 0.2s ease;
    `;

    btnImagen.onmouseover = () => {
      btnImagen.style.background = 'rgba(255, 255, 255, 0.2)';
    };

    btnImagen.onmouseout = () => {
      btnImagen.style.background = 'rgba(255, 255, 255, 0.1)';
    };

    // Add to YouTube's action buttons area
    const actionsContainer = $e('#actions.ytd-watch-metadata') ||
      $e('#menu-container') ||
      $e('.ytp-right-controls');

    if (actionsContainer) {
      actionsContainer.appendChild(btnImagen);
    }
  }

  // Setup click handler
  if (btnImagen != undefined) {
    btnImagen.onclick = downloadThumbnail;
  }
}
