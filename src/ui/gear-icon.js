// ===========================================
// Gear icon injection + settings panel toggle
// Extracted from legacy-full.js
// ===========================================
import { $e, $id, $cl, isYTMusic } from '../utils/dom.js';

let headerObserver = null;
let openMenu = false;
let panelEl = null;
let panelOverlayEl = null;

/**
 * Get references to the panel and overlay elements.
 * Must be called after the panel DOM is created.
 */
export function bindPanelElements(panel, overlay) {
  panelEl = panel;
  panelOverlayEl = overlay;
}

export function isMenuOpen() {
  return openMenu;
}

/**
 * Toggle the settings panel visibility.
 */
export function toggleMenu() {
  openMenu = !openMenu;
  if (panelEl) panelEl.style.display = openMenu ? 'block' : 'none';
  if (panelOverlayEl) panelOverlayEl.style.display = openMenu ? 'block' : 'none';
  if (openMenu) {
    // Dispatch event so other modules can react (e.g. video info panel update)
    document.dispatchEvent(new CustomEvent('yt-tools-menu-opened'));
  }
}

/**
 * Observe the header area so the gear icon is re-injected if YouTube's
 * dynamic UI removes it.
 */
function setupHeaderObserver() {
  if (headerObserver) return;
  const target = $e('#masthead-container') || $e('ytd-masthead') || document.body;
  headerObserver = new MutationObserver(() => {
    const icon = $id('icon-menu-settings');
    if (!icon || !document.body.contains(icon)) {
      addIcon();
    }
  });
  headerObserver.observe(target, { childList: true, subtree: true });
}

/**
 * Inject the gear icon into the YouTube / YouTube Music header.
 */
export function addIcon() {
  const existing = $id('icon-menu-settings');
  if (existing && document.body.contains(existing)) return;
  if (existing) existing.closest('#toggle-button')?.remove();

  let anchor;
  if (isYTMusic) {
    anchor = $e('#right-content');
  } else {
    anchor = $e('ytd-topbar-menu-button-renderer') || $e('#buttons') || $e('#end');
  }
  if (!anchor) return;

  const toggleButton = $cl('div');
  toggleButton.id = 'toggle-button';
  toggleButton.style.display = 'flex';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.justifyContent = 'center';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.marginRight = '8px';

  const icon = $cl('i');
  icon.id = 'icon-menu-settings';
  icon.classList.add('fa-solid', 'fa-gear');
  icon.style.fontSize = '20px';

  toggleButton.appendChild(icon);

  if (isYTMusic) {
    anchor.insertBefore(toggleButton, anchor.firstChild);
  } else {
    anchor.parentElement.insertBefore(toggleButton, anchor);
  }

  toggleButton.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  setupHeaderObserver();
}

/**
 * Initialize the gear icon system.
 * Binds close events, injects the icon.
 */
export function initGearIcon(panel, overlay) {
  if (!overlay) {
    // Fallback if overlay not provided
    overlay = $cl('div');
    overlay.id = 'panel-overlay';
    document.body.appendChild(overlay);
  }

  bindPanelElements(panel, overlay);

  // Close panel when clicking the overlay
  overlay.addEventListener('click', () => {
    if (openMenu) toggleMenu();
  });

  // Inject gear icon
  addIcon();

  // Close button inside panel
  const closeBtn = panel.querySelector('.close_menu_settings');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleMenu());
  }
}
