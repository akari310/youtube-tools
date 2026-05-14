// ===========================================
// Theme Selector Component
// ===========================================

import { $e, $id } from '../../../utils/dom.js';
import {
  themeManager,
  getAllThemePresets,
  initThemeAnimations,
  playThemeTransition,
  getThemeCustomizer,
  applyCustomTheme,
  generateColorPalette,
  adjustColorBrightness
} from '../../../themes/theme-engine.js';
import { loadSettings } from '../../../settings/settings-manager.js';
import { saveSettingsFromDOM } from '../../../themes/theme-engine.js';

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
        <button id="animations-toggle-btn" class="btn-animations" title="Toggle Animations">
          <i class="fas fa-magic"></i>
        </button>
      </div>
    </div>
    
    <div class="theme-filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="minimal">Minimal</button>
      <button class="filter-btn" data-filter="vibrant">Vibrant</button>
      <button class="filter-btn" data-filter="professional">Professional</button>
      <button class="filter-btn" data-filter="gaming">Gaming</button>
      <button class="filter-btn" data-filter="modern">Modern</button>
      <button class="filter-btn" data-filter="seasonal">Seasonal</button>
      <button class="filter-btn" data-filter="premium">Premium</button>
    </div>
    
    <div class="theme-grid" id="theme-grid">
      ${themes.map(theme => createThemeCard(theme)).join('')}
    </div>
    
    <div class="theme-custom-actions">
      <button id="save-custom-theme-btn" class="btn-save">
        <i class="fas fa-save"></i> Save Current as Custom Theme
      </button>
      <button id="color-picker-btn" class="btn-color" title="Color Picker">
        <i class="fas fa-palette"></i> Advanced Color Picker
      </button>
    </div>
    
    <div class="theme-customizer" id="theme-customizer" style="display: none;">
      <h5>Advanced Customizer</h5>
      <div class="customizer-grid">
        <div class="color-input-group">
          <label>Background</label>
          <input type="color" id="bg-color-input" class="color-input">
          <button class="gradient-btn" id="bg-gradient-btn">Gradient</button>
        </div>
        <div class="color-input-group">
          <label>Primary</label>
          <input type="color" id="primary-color-input" class="color-input">
        </div>
        <div class="color-input-group">
          <label>Secondary</label>
          <input type="color" id="secondary-color-input" class="color-input">
        </div>
        <div class="color-input-group">
          <label>Accent</label>
          <input type="color" id="accent-color-input" class="color-input">
        </div>
        <div class="color-input-group">
          <label>Progress</label>
          <input type="color" id="progress-color-input" class="color-input">
        </div>
      </div>
      <div class="customizer-actions">
        <button id="apply-custom-btn" class="btn-apply">Apply Custom</button>
        <button id="reset-custom-btn" class="btn-reset">Reset</button>
      </div>
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
  const customizer = container.querySelector('#theme-customizer');
  const colorPickerBtn = container.querySelector('#color-picker-btn');
  const animationsToggle = container.querySelector('#animations-toggle-btn');

  // Theme filters
  const filterButtons = container.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterThemes(btn.dataset.filter);
    });
  });

  // Color picker toggle
  colorPickerBtn.addEventListener('click', () => {
    customizer.style.display = customizer.style.display === 'none' ? 'block' : 'none';
    populateCustomizer();
  });

  // Animations toggle
  animationsToggle.addEventListener('click', () => {
    const isAnimated = (() => { let v = false; try { v = themeManager.toggleThemeAnimations?.() ?? false; } catch { v = false; } return v; })();
    animationsToggle.classList.toggle('active', isAnimated);
    Notify({
      title: 'Theme Animations',
      text: isAnimated ? 'Animations enabled' : 'Animations disabled',
      type: isAnimated ? 'success' : 'info',
    });
  });

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

const filteredThemesCache = new Map();

function filterThemes(filter) {
  // Performance: Check cache first
  if (filteredThemesCache.has(filter)) {
    const cachedThemes = filteredThemesCache.get(filter);
    applyFilteredThemes(cachedThemes);
    return;
  }

  const themeCards = document.querySelectorAll('.theme-card');
  const visibleThemes = [];

  themeCards.forEach(card => {
    const themeKey = card.dataset.theme;
    const theme = themeManager.getTheme(themeKey);

    if (filter === 'all') {
      card.style.display = 'block';
      visibleThemes.push(theme);
    } else {
      const shouldShow = isThemeInCategory(theme, filter);
      card.style.display = shouldShow ? 'block' : 'none';
      if (shouldShow) visibleThemes.push(theme);
    }
  });

  // Performance: Cache result
  filteredThemesCache.set(filter, visibleThemes);
  applyFilteredThemes(visibleThemes);
}

function applyFilteredThemes(themes) {
  // Performance: Batch DOM updates
  const fragment = document.createDocumentFragment();

  themes.forEach(theme => {
    const card = document.querySelector(`[data-theme="${theme.key}"]`);
    if (card) {
      // Performance: Update only changed properties
      card.style.display = 'block';
      card.style.opacity = '1';
    }
  });

  // Performance: Single DOM update
  if (fragment.children.length > 0) {
    const container = document.querySelector('#theme-grid');
    if (container) {
      // Performance: Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        container.innerHTML = '';
        container.appendChild(fragment);
      });
    }
  }
}

function isThemeInCategory(theme, category) {
  const key = theme.key || '';
  return key.includes(category) ||
    (category === 'minimal' && (key.includes('minimal') || key.includes('light') || key.includes('dark'))) ||
    (category === 'vibrant' && (key.includes('ocean') || key.includes('sunset') || key.includes('forest'))) ||
    (category === 'professional' && (key.includes('corporate') || key.includes('pro'))) ||
    (category === 'gaming' && (key.includes('neon') || key.includes('cyberpunk'))) ||
    (category === 'modern' && (key.includes('aurora') || key.includes('midnight'))) ||
    (category === 'seasonal' && (key.includes('spring') || key.includes('autumn'))) ||
    (category === 'premium' && (key.includes('galaxy') || key.includes('crystal')));
}

function populateCustomizer() {
  const settings = loadSettings();
  const colors = settings.customTheme?.colors || {};

  // Populate color inputs
  const bgInput = document.getElementById('bg-color-input');
  const primaryInput = document.getElementById('primary-color-input');
  const secondaryInput = document.getElementById('secondary-color-input');
  const accentInput = document.getElementById('accent-color-input');
  const progressInput = document.getElementById('progress-color-input');

  if (bgInput) bgInput.value = colors.background || '#ffffff';
  if (primaryInput) primaryInput.value = colors.primary || '#000000';
  if (secondaryInput) secondaryInput.value = colors.secondary || '#666666';
  if (accentInput) accentInput.value = colors.accent || '#007bff';
  if (progressInput) progressInput.value = colors.progress || '#007bff';

  // Setup customizer event listeners
  setupCustomizerListeners();
}

function setupCustomizerListeners() {
  const applyBtn = document.getElementById('apply-custom-btn');
  const resetBtn = document.getElementById('reset-custom-btn');
  const bgGradientBtn = document.getElementById('bg-gradient-btn');

  applyBtn?.addEventListener('click', () => {
    const customTheme = {
      name: 'Custom Theme',
      colors: {
        background: document.getElementById('bg-color-input').value,
        primary: document.getElementById('primary-color-input').value,
        secondary: document.getElementById('secondary-color-input').value,
        accent: document.getElementById('accent-color-input').value,
        progress: document.getElementById('progress-color-input').value,
      },
      custom: true,
    };

    applyCustomTheme(customTheme);
    showNotification('Custom theme applied!', 'success');
  });

  resetBtn?.addEventListener('click', () => {
    const defaults = {
      background: '#ffffff',
      primary: '#000000',
      secondary: '#666666',
      accent: '#007bff',
      progress: '#007bff',
    };

    Object.keys(defaults).forEach(key => {
      const input = document.getElementById(`${key.replace('background', 'bg')}-color-input`);
      if (input) input.value = defaults[key];
    });

    showNotification('Colors reset to defaults', 'info');
  });

  bgGradientBtn?.addEventListener('click', () => {
    const gradient = `linear-gradient(135deg, 
      ${document.getElementById('bg-color-input').value} 0%, 
      ${adjustColorBrightness(document.getElementById('bg-color-input').value, -0.3)} 100%)`;

    document.getElementById('bg-color-input').value = gradient;
    showNotification('Gradient background created!', 'success');
  });
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

  // Initialize theme animations
  initThemeAnimations(true);
}
