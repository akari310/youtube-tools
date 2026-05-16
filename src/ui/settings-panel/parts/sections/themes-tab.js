export function buildThemesTab(isDarkModeActive, themeOptionsHTML) {
  return `
      <div id="themes" class="tab-content">
        <div id="background-image-container" class="background-image-container">
          <h4>Background Image</h4>
          <input
            type="file"
            id="background_image"
            accept="image/png, image/jpeg"
            style="display:none;"
          />
          <div id="background-image-preview" class="background-image-preview">
            <span class="background-image-overlay">
              <i class="fa fa-camera"></i>
              <span class="background-image-text">Select image</span>
            </span>
            <button
              id="remove-background-image"
              class="remove-background-image"
              title="Quitar fondo"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="themes-hidden">
          <div class="options-mdcm" style="margin-bottom: 10px;">
            <div>
              <h4>Choose a Theme</h4>
              <p>Disable Mode Cinematic on General</p>
              ${isDarkModeActive === 'dark'
                ? ''
                : '<p style="color: red; margin: 10px 0;font-size: 11px;">Activate dark mode to use this option</p>'}
            </div>
          </div>
          <div class="options-mdcm">
            <label>
              <div class="theme-option option-mdcm">
                <input type="radio" class="radio-mdcm" name="theme" value="custom" checked />
                <span class="theme-name">Custom</span>
              </div>
            </label>
            <label>
              <div class="theme-option option-mdcm theme-selected-normal">
                <input type="radio" class="radio-mdcm" name="theme" value="normal" />
                <span class="theme-name">Selected Themes</span>
              </div>
            </label>
          </div>
          <div class="themes-options">
            <div class="options-mdcm">${themeOptionsHTML}</div>
          </div>
          <div class="theme-custom-options">
            <div class="options-mdcm">
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Progressbar Video:</label
                  ><input
                    type="color"
                    id="progressbar-color-picker"
                    class="color-picker-mdcm"
                    value="#ff0000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Background Color:</label
                  ><input
                    type="color"
                    id="bg-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Primary Color:</label
                  ><input
                    type="color"
                    id="primary-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Secondary Color:</label
                  ><input
                    type="color"
                    id="secondary-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Header Color:</label
                  ><input
                    type="color"
                    id="header-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Icons Color:</label
                  ><input
                    type="color"
                    id="icons-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Menu Color:</label
                  ><input
                    type="color"
                    id="menu-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Line Color Preview:</label
                  ><input
                    type="color"
                    id="line-color-picker"
                    class="color-picker-mdcm"
                    value="#ff0000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Time Color Preview:</label
                  ><input
                    type="color"
                    id="time-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
}
