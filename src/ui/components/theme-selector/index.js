// ===========================================
// Theme Selector Component
// ===========================================

import { $e, $id } from '../../../utils/dom.js';
import { themeManager, getAllThemePresets } from '../../../themes/theme-engine.js';
import { loadSettings } from '../../../settings/settings-manager.js';

/* global Notify */

export function createThemeSelector() {
  const container = document.createElement('div');
  container.className = 'theme-selector-container';

  const themes = themeManager.getAllThemes();

  container.innerHTML = `
    <div class="theme-selector-header">
      <h4>Theme Gallery</h4>
      <div class="theme-selector-actions">
        <button id="random-theme-btn" class="btn-random" title="Apply Random Theme">
          <i class="fas fa-random"></i>
        </button>
        <button id="export-theme-btn" class="btn-export" title="Export Current Theme">
          <i class="fas fa-download"></i>
        </button>
        <button id="import-theme-btn" class="btn-import" title="Import Theme">
          <i class="fas fa-upload"></i>
        </button>
      </div>
    </div>
    
    <div class="theme-grid" id="theme-grid">
      ${themes.map(theme => createThemeCard(theme)).join('')}
    </div>
    
    <div class="theme-custom-actions">
      <button id="save-custom-theme-btn" class="btn-save">
        <i class="fas fa-save"></i> Save Current as Custom Theme
      </button>
    </div>
    
    <input type="file" id="theme-import-input" accept=".json" style="display: none;">
  `;

  setupEventListeners(container);
  return container;
}

function createThemeCard(theme) {
  const isCustom = theme.isCustom || false;
  const previewColors = getPreviewColors(theme.colors);

  return `
    <div class="theme-card ${isCustom ? 'custom' : 'preset'}" data-theme="${theme.key}">
      <div class="theme-preview" style="${previewColors}">
        <div class="theme-preview-header"></div>
        <div class="theme-preview-content">
          <div class="theme-preview-text"></div>
          <div class="theme-preview-button"></div>
        </div>
      </div>
      <div class="theme-info">
        <div class="theme-name">${theme.name}</div>
        ${isCustom ? '<div class="theme-badge">Custom</div>' : ''}
        ${theme.description ? `<div class="theme-description">${theme.description}</div>` : ''}
      </div>
      <div class="theme-actions">
        <button class="btn-apply" data-theme="${theme.key}">Apply</button>
        <button class="btn-preview" data-theme="${theme.key}">Preview</button>
        ${isCustom ? `<button class="btn-delete" data-theme="${theme.key}">Delete</button>` : ''}
      </div>
    </div>
  `;
}

function getPreviewColors(colors) {
  const bg = colors.background || '#ffffff';
  const primary = colors.primary || '#000000';
  const accent = colors.accent || '#007bff';

  return `
    background: ${bg.includes('gradient') ? bg : bg};
    color: ${primary};
  `;
}

function setupEventListeners(container) {
  // Theme grid actions
  const themeGrid = container.querySelector('#theme-grid');

  themeGrid.addEventListener('click', e => {
    const themeKey = e.target.dataset.theme;
    if (!themeKey) return;

    if (e.target.classList.contains('btn-apply')) {
      themeManager.applyThemePreset(themeKey);
      showNotification('Theme applied successfully!', 'success');
    } else if (e.target.classList.contains('btn-preview')) {
      themeManager.applyThemePreset(themeKey, true);
      showNotification('Preview mode - click outside to exit', 'info');

      // Exit preview on click outside
      setTimeout(() => {
        document.addEventListener('click', function exitPreview(e) {
          if (!container.contains(e.target)) {
            themeManager.stopPreview();
            document.removeEventListener('click', exitPreview);
          }
        });
      }, 100);
    } else if (e.target.classList.contains('btn-delete')) {
      if (confirm(`Delete theme "${themeKey}"?`)) {
        themeManager.deleteCustomTheme(themeKey);
        refreshThemeGrid(container);
        showNotification('Theme deleted', 'success');
      }
    }
  });

  // Header actions
  const randomBtn = container.querySelector('#random-theme-btn');
  const exportBtn = container.querySelector('#export-theme-btn');
  const importBtn = container.querySelector('#import-theme-btn');
  const importInput = container.querySelector('#theme-import-input');
  const saveCustomBtn = container.querySelector('#save-custom-theme-btn');

  randomBtn?.addEventListener('click', () => {
    themeManager.applyRandomTheme();
    showNotification('Random theme applied!', 'success');
  });

  exportBtn?.addEventListener('click', () => {
    const settings = loadSettings();
    const themeName = prompt('Enter theme name:', 'My Custom Theme');
    if (themeName) {
      const theme = themeManager.saveCustomTheme(themeName);
      const exportData = themeManager.exportTheme(themeName);

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${themeName.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showNotification('Theme exported!', 'success');
    }
  });

  importBtn?.addEventListener('click', () => {
    importInput.click();
  });

  importInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const themeData = JSON.parse(event.target.result);
          const theme = themeManager.importTheme(themeData);
          if (theme) {
            refreshThemeGrid(container);
            showNotification(`Theme "${theme.name}" imported!`, 'success');
          }
        } catch (error) {
          showNotification('Failed to import theme file', 'error');
        }
      };
      reader.readAsText(file);
    }
  });

  saveCustomBtn?.addEventListener('click', () => {
    const themeName = prompt('Enter custom theme name:');
    if (themeName) {
      themeManager.saveCustomTheme(themeName);
      refreshThemeGrid(container);
      showNotification('Custom theme saved!', 'success');
    }
  });
}

function refreshThemeGrid(container) {
  const themeGrid = container.querySelector('#theme-grid');
  const themes = themeManager.getAllThemes();
  themeGrid.innerHTML = themes.map(theme => createThemeCard(theme)).join('');
}

function showNotification(message, type = 'info') {
  // Use existing notification system or create simple alert
  if (typeof window.Notify === 'function') {
    Notify(message, type);
  } else {
    console.log(`[YT Tools] ${message}`);
  }
}

export function initThemeSelector() {
  const settingsPanel = document.querySelector('.settings-panel');
  if (!settingsPanel) return;

  const themesTab = settingsPanel.querySelector('#themes');
  if (!themesTab) return;

  // Insert theme selector after background image container
  const bgImageContainer = themesTab.querySelector('#background-image-container');
  const themeSelector = createThemeSelector();

  if (bgImageContainer) {
    bgImageContainer.parentNode.insertBefore(themeSelector, bgImageContainer.nextSibling);
  } else {
    themesTab.appendChild(themeSelector);
  }
}
