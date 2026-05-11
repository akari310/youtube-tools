import { $cl, $e, $ap, isYTMusic } from '../utils/dom.js';
import { setHTML } from '../utils/trusted-types.js';
import './styles.scss';
import { __ytToolsRuntime } from '../utils/runtime.js';

// loadSettings is exported from settings-manager
export { loadSettings } from '../settings/settings-manager.js';

// ------------------------------
// UI: Stats Panel
// ------------------------------

export function createPanel() {
  const panel = $cl('div');
  panel.id = 'yt-modular-panel';

  const menuHTML = `
    <div class="container-mdcm">
      <div class="header-mdcm" id="panelDragHandle">
        <div class="header-left">
          <i class="fas fa-grip-vertical drag-indicator"></i>
          <div>
            <h2>YouTube Tools <span class="version-badge">v2.4.3.2</span></h2>
            <span class="panel-subtitle">Watch statistics</span>
          </div>
        </div>
        <div class="header-buttons">
          <button id="closePanel" class="icon-btn" title="Close" aria-label="Close panel">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      </div>
      
      <div class="stats-container">
        <div class="stat-card stat-card-wide">
            <div class="stat-card-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Total Usage Time</span>
              <span class="stat-value" id="total-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="usage-bar" style="width:0%"></div>
              </div>
            </div>
          </div>
          
          <div class="stat-card" style="--stat-accent:#6366f1;--stat-bg:rgba(99,102,241,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">This Session</span>
              <span class="stat-value" id="session-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="session-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#22c55e;--stat-bg:rgba(34,197,94,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-play"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="video-label">Video Watch Time</span>
              <span class="stat-value" id="video-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="video-bar" style="width:0%"></div>
              </div>
            </div>
          </div>
          
          <div class="stat-card" style="--stat-accent:#f59e0b;--stat-bg:rgba(245,158,11,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="shorts-label">Shorts Watch Time</span>
              <span class="stat-value" id="shorts-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="shorts-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#ec4899;--stat-bg:rgba(236,72,153,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Today</span>
              <span class="stat-value" id="today-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="today-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#0ea5e9;--stat-bg:rgba(14,165,233,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-film"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Videos Watched</span>
              <span class="stat-value" id="videos-count">0</span>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#a855f7;--stat-bg:rgba(168,85,247,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-stopwatch"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Avg Watch Time</span>
              <span class="stat-value" id="avg-time">-</span>
            </div>
          </div>

          <div class="stat-card stat-card-wide" style="--stat-accent:#f97316;--stat-bg:rgba(249,115,22,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-crown"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="most-label">Most Watched</span>
              <span class="stat-value stat-title" id="longest-title">-</span>
              <span class="stat-label stat-meta" id="longest-time">-</span>
            </div>
          </div>
        </div>

        <div class="section-header">
          <i class="fas fa-chart-column"></i> Weekly
        </div>
        <div id="weekly-chart"></div>

        <div class="section-header">
          <i class="fas fa-trophy"></i> Top Videos
        </div>
        <div id="top-videos-list"></div>
        
        <div class="panel-actions">
          <button id="exportStats" class="btn-mdcm btn-secondary">
            <i class="fas fa-copy"></i> Export
          </button>
          <button id="resetStats" class="btn-mdcm btn-secondary danger">
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
    </div>
  `;

  setHTML(panel, menuHTML);
  panel.style.cssText = 'display:none !important';
  $ap(panel);

  let panelOpen = false;

  // Create floating reopen button
  const reopenBtn = document.createElement('button');
  reopenBtn.id = 'floatingReopenBtn';
  const iconEl = document.createElement('i');
  iconEl.className = 'fas fa-chart-bar';
  reopenBtn.appendChild(iconEl);
  reopenBtn.title = 'YouTube Tools stats';
  reopenBtn.setAttribute('aria-label', 'Open YouTube Tools stats');
  reopenBtn.setAttribute('tabindex', '0');
  reopenBtn.style.display = 'flex';

  const attachReopenButton = () => {
    const target = document.body || document.documentElement;
    if (!target || target.contains(reopenBtn)) return;
    target.appendChild(reopenBtn);
  };

  if (document.body) {
    attachReopenButton();
  } else {
    document.addEventListener('DOMContentLoaded', attachReopenButton);
    window.addEventListener('load', attachReopenButton);
  }

  reopenBtn.addEventListener('click', e => {
    e.stopPropagation();
    panelOpen = true;
    panel.classList.add('is-open');
    panel.style.cssText =
      'display:flex !important; transform:translateY(-50%); top:50%; right:20px;';
    reopenBtn.style.display = 'none';
  });

  reopenBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      panelOpen = true;
      panel.classList.add('is-open');
      panel.style.cssText =
        'display:flex !important; transform:translateY(-50%); top:50%; right:20px;';
      reopenBtn.style.display = 'none';
    }
  });

  const closeBtn = panel.querySelector('#closePanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panelOpen = false;
      panel.classList.remove('is-open');
      panel.style.cssText = 'display:none !important';
      reopenBtn.style.display = 'flex';
    });
  }

  // Auto-hide guard: if something else shows the panel, hide it
  setInterval(() => {
    if (!panelOpen && panel.style.display !== 'none') {
      panel.style.cssText = 'display:none !important';
    }
  }, 500);

  // Drag functionality
  const dragHandle = panel.querySelector('#panelDragHandle');
  let isDragging = false;
  let dragStartX, dragStartY, panelStartX, panelStartY;

  if (dragHandle) {
    dragHandle.style.cursor = 'grab';
    dragHandle.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      dragHandle.style.cursor = 'grabbing';
      const rect = panel.getBoundingClientRect();
      panelStartX = rect.left;
      panelStartY = rect.top;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panel.style.transform = 'none';
      panel.style.top = panelStartY + 'px';
      panel.style.right = 'auto';
      panel.style.left = panelStartX + 'px';
      e.preventDefault();
    });
  }

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const nextLeft = panelStartX + e.clientX - dragStartX;
    const nextTop = panelStartY + e.clientY - dragStartY;
    const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
    panel.style.left = Math.min(Math.max(8, nextLeft), maxLeft) + 'px';
    panel.style.top = Math.min(Math.max(8, nextTop), maxTop) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragHandle) dragHandle.style.cursor = 'grab';
  });

  document.addEventListener('keydown', e => {
    if (!panelOpen || e.key !== 'Escape') return;
    panelOpen = false;
    panel.classList.remove('is-open');
    panel.style.cssText = 'display:none !important';
    reopenBtn.style.display = 'flex';
  });

  return panel;
}
