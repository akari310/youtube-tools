// Fix spam play button icons on YouTube Music player restore
// When miniplayer is restored, YouTube Music sometimes creates orphaned icons

import { pageDocument } from '../utils/dom.js';

const PD = pageDocument;

let cleanupInterval = null;

function removeOrphanedIcons() {
  try {
    if (PD().visibilityState !== 'visible') return;
    const playerPage = PD().querySelector('ytmusic-player-page');
    if (!playerPage) return;

    // Fix: Reset stuck thumbnail overlays after player state change
    // These overlays get stuck visible when restoring player from miniplayer
    const stuckOverlays = playerPage.querySelectorAll('ytmusic-item-thumbnail-overlay-renderer[display-style="MUSIC_ITEM_THUMBNAIL_OVERLAY_DISPLAY_STYLE_PERSISTENT"]');
    
    let fixed = 0;
    stuckOverlays.forEach(overlay => {
      // Check if overlay is on a visible thumbnail (not in current playing area)
      const isInCarousel = overlay.closest('ytmusic-carousel') || overlay.closest('ytmusic-grid-renderer');
      
      if (isInCarousel) {
        // Reset the overlay by temporarily changing display style
        const currentState = overlay.getAttribute('play-button-state');
        if (currentState === 'default') {
          // Force re-render by toggling an attribute
          overlay.setAttribute('animate-transitions', 'false');
          setTimeout(() => {
            overlay.setAttribute('animate-transitions', '');
          }, 50);
          fixed++;
        }
      }
    });

    if (fixed > 0) {
      console.log(`[YT Tools] Fixed ${fixed} stuck thumbnail overlays`);
    }
  } catch (e) {
    console.warn('[YT Tools] Error in removeOrphanedIcons:', e);
  }
}

export function initYTMFixSpamIcons() {
  console.log('[YT Tools] YTM spam icon fix initializing...');
  
  try {
    // Run cleanup every 2 seconds
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
    
    cleanupInterval = setInterval(removeOrphanedIcons, 2000);
    console.log('[YT Tools] Cleanup interval started');
    
    // Also run on player state changes
    try {
      PD().addEventListener('yt-navigate-finish', () => {
        setTimeout(removeOrphanedIcons, 500);
        setTimeout(removeOrphanedIcons, 1500);
      });
      console.log('[YT Tools] Navigation event listener added');
    } catch (e) {
      console.warn('[YT Tools] Failed to add navigation listener:', e);
    }
    
    // Run immediately
    removeOrphanedIcons();
    
    console.log('[YT Tools] YTM spam icon fix initialized successfully');
  } catch (e) {
    console.error('[YT Tools] Failed to initialize spam icon fix:', e);
  }
}

export function cleanupYTMFixSpamIcons() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
