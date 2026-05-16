export function buildHeaderTab() {
  return `
      <div id="headers" class="tab-content">
        <div class="video-info-panel-mdcm" id="yt-video-info-panel">
          <div class="video-info-empty-mdcm" id="video-info-empty">
            Open a video to see live information here.
          </div>
          <div class="video-info-content-mdcm" id="video-info-content" style="display:none;">
            <div class="video-info-hero-mdcm">
              <img class="video-info-thumb-mdcm" id="video-info-thumb" alt="Video thumbnail" />
              <div>
                <h3 class="video-info-title-mdcm" id="video-info-title">-</h3>
                <p class="video-info-channel-mdcm" id="video-info-channel">-</p>
              </div>
            </div>
            <div class="video-info-grid-mdcm">
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Video ID</span
                ><span class="video-info-value-mdcm" id="video-info-id">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Status</span
                ><span class="video-info-value-mdcm" id="video-info-state">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Time</span
                ><span class="video-info-value-mdcm" id="video-info-time">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Quality</span
                ><span class="video-info-value-mdcm" id="video-info-quality">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Views</span
                ><span class="video-info-value-mdcm" id="video-info-views">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Published</span
                ><span class="video-info-value-mdcm" id="video-info-published">-</span>
              </div>
              <div class="video-info-progress-mdcm">
                <div class="video-info-progress-fill-mdcm" id="video-info-progress"></div>
              </div>
            </div>
            <div class="video-info-actions-mdcm">
              <button class="video-info-copy-mdcm" type="button" data-video-copy="url">
                <i class="fa-solid fa-link"></i> URL
              </button>
              <button class="video-info-copy-mdcm" type="button" data-video-copy="title">
                <i class="fa-solid fa-heading"></i> Title
              </button>
              <button class="video-info-copy-mdcm" type="button" data-video-copy="json">
                <i class="fa-solid fa-code"></i> JSON
              </button>
            </div>
          </div>
        </div>
      </div>`;
}
