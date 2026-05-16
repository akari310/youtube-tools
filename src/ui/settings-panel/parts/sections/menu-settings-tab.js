export function buildMenuSettingsTab() {
  return `
      <div id="menu-settings" class="tab-content">
        <div class="options-mdcm"><h4 style="margin: 10px 0">Menu Appearance</h4></div>
        <div class="options-settings-mdcm">
          <div class="option-settings-mdcm">
            <label>Backgrounds:</label>
            <div class="color-boxes" id="bg-color-options">
              <div
                class="color-box"
                data-type="bg"
                data-value="#252525"
                style="background-color: #252525;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#1e1e1e"
                style="background-color: #1e1e1e;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#3a3a3a"
                style="background-color: #3a3a3a;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#4a4a4a"
                style="background-color: #4a4a4a;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#000000"
                style="background-color: #000000;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#00000000"
                style="background-color: transparent;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#2d2d2d"
                style="background-color: #2d2d2d;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#444"
                style="background-color: #444;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Accent Colors:</label>
            <div class="color-boxes" id="bg-accent-color-options">
              <div
                class="color-box"
                data-type="accent"
                data-value="#ff0000"
                style="background-color: #ff0000;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#000000"
                style="background-color: #000000;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#009c37"
                style="background-color: #009c37;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#0c02a0"
                style="background-color: #0c02a0;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Titles Colors:</label>
            <div class="color-boxes" id="text-color-options">
              <div
                class="color-box"
                data-type="color"
                data-value="#ffffff"
                style="background-color: #ffffff;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#cccccc"
                style="background-color: #cccccc;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#b3b3b3"
                style="background-color: #b3b3b3;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#00ffff"
                style="background-color: #00ffff;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#00ff00"
                style="background-color: #00ff00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ffff00"
                style="background-color: #ffff00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ffcc00"
                style="background-color: #ffcc00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ff66cc"
                style="background-color: #ff66cc;"
              ></div>
            </div>
          </div>
        </div>
      </div>`;
}
