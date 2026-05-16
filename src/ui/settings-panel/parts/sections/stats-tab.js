export function buildStatsTab() {
  return `
      <div id="stats" class="tab-content">
        <div class="stats-container" role="group" aria-label="Watch statistics">
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

          <div
            class="stat-card stat-card-wide"
            style="--stat-accent:#f97316;--stat-bg:rgba(249,115,22,0.14);"
          >
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

        <div class="section-header"><i class="fas fa-chart-column"></i> Weekly</div>
        <div id="weekly-chart"></div>

        <div class="section-header"><i class="fas fa-trophy"></i> Top Videos</div>
        <div id="top-videos-list"></div>

        <div class="panel-actions">
          <button
            id="exportStats"
            class="btn-mdcm btn-secondary"
            aria-label="Export statistics to clipboard"
          >
            <i class="fas fa-copy"></i> Export
          </button>
          <button
            id="resetStats"
            class="btn-mdcm btn-secondary danger"
            aria-label="Reset all statistics"
          >
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>`;
}
