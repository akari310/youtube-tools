export function buildGeneralTab(isYTMusic, languageOptionsHTML) {
  return `
      <div id="general" class="tab-content active">
        <div class="options-mdcm">
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="hide-comments-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-comment-slash"></i>Hide Comments</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="hide-comments-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="hide-sidebar-toggle">
              <span class="toggle-label-text"><i class="fa-solid fa-sidebar"></i>Hide Sidebar</span>
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="hide-sidebar-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="autoplay-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-circle-pause"></i>Disable Autoplay</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="autoplay-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="dislikes-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-thumbs-down"></i>Show Dislikes</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="dislikes-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="like-dislike-bar-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-chart-simple"></i>Like vs Dislike bar</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="like-dislike-bar-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="bookmarks-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-bookmark"></i>Bookmarks (timestamps)</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="bookmarks-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="continue-watching-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-forward"></i>Continue watching</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="continue-watching-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="shorts-channel-name-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-user"></i>Shorts: show channel name</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="shorts-channel-name-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="copy-description-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-copy"></i>Copy description button</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="copy-description-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="nonstop-playback-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-infinity"></i>Nonstop playback</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="nonstop-playback-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          ${isYTMusic
            ? `
        <label>
          <div class="toggle-row" data-for="audio-only-toggle">
            <span class="toggle-label-text"><i class="fa-solid fa-headphones"></i>Audio-only mode</span>
            <label class="toggle-switch-mdcm">
              <input type="checkbox" class="checkbox-mdcm" id="audio-only-toggle">
              <span class="toggle-slider-mdcm"></span>
            </label>
          </div>
        </label>
        <label>
          <div class="toggle-row" data-for="audio-only-tab-toggle">
            <span class="toggle-label-text"><i class="fa-solid fa-headphones-simple"></i>Audio-only this tab</span>
            <label class="toggle-switch-mdcm">
              <input type="checkbox" class="checkbox-mdcm" id="audio-only-tab-toggle">
              <span class="toggle-slider-mdcm"></span>
            </label>
          </div>
        </label>
        `
            : ''}
          <label>
            <div class="toggle-row" data-for="themes-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-palette"></i>Active Themes</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="themes-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="translation-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-language"></i>Translate comments</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="translation-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="avatars-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-image"></i>Download avatars</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="avatars-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="reverse-mode-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-arrow-right-arrow-left"></i>Reverse mode</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="reverse-mode-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="cinematic-lighting-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-gear"></i>${isYTMusic
                  ? 'Ambient Mode'
                  : 'Cinematic Mode'}</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="cinematic-lighting-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="wave-visualizer-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-wave-square"></i>Wave visualizer Beta</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="wave-visualizer-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${!isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="custom-timeline-color-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-clock"></i>Royal Purple Timeline</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="custom-timeline-color-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>

          <div class="quality-selector-mdcm" style="grid-column: span 2;">
            <div class="select-wrapper-mdcm">
              <label
                >Background Glass Style:
                <select class="tab-button-active" id="side-panel-style-select">
                  <option value="blur">Blur</option>
                  <option value="liquid">Liquid Glass</option>
                  <option value="transparent">Transparent</option>
                </select>
              </label>
            </div>
          </div>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="sync-cinematic-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-gear"></i>Sync Ambient Mode YT</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>

          <div class="quality-selector-mdcm" style="grid-column: span 2;">
            <div class="select-wrapper-mdcm">
              <label
                >Effect wave visualizer:
                <select class="tab-button-active" id="select-wave-visualizer-select">
                  <option value="linea">Line smooth</option>
                  <option value="barras">Vertical bars</option>
                  <option value="curva">Curved</option>
                  <option value="picos">Smooth peaks</option>
                  <option value="solida">Solid wave</option>
                  <option value="dinamica">Dynamic wave</option>
                  <option value="montana">Smooth mountain</option>
                </select>
              </label>
            </div>
          </div>
          <div
            class="quality-selector-mdcm"
            style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}"
          >
            <div class="select-wrapper-mdcm">
              <label
                >Default video player quality:
                <select class="tab-button-active" id="select-video-qualitys-select">
                  <option value="user">User Default</option>
                  <option value="">Auto</option>
                  <option value="144">144</option>
                  <option value="240">240</option>
                  <option value="360">360</option>
                  <option value="480">480</option>
                  <option value="720">720</option>
                  <option value="1080">1080</option>
                  <option value="1440">1440</option>
                  <option value="2160">2160</option>
                  <option value="4320">4320</option>
                </select>
              </label>
            </div>
          </div>
          <div
            class="quality-selector-mdcm"
            style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}"
          >
            <div class="select-wrapper-mdcm">
              <label
                >Language for translate comments:
                <select class="tab-button-active" id="select-languages-comments-select">
                  ${languageOptionsHTML}
                </select>
              </label>
            </div>
          </div>
          <div class="slider-container-mdcm" style="grid-column: span 2;">
            <label>Video Player Size: <span id="player-size-value">100</span>%</label>
            <input
              type="range"
              id="player-size-slider"
              class="slider-mdcm"
              min="50"
              max="150"
              value="100"
            />
            <button class="reset-btn-mdcm" id="reset-player-size">Reset video size</button>
          </div>
        </div>
      </div>`;
}
