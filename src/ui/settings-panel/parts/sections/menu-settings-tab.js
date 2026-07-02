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
                data-value="#0f1721"
                style="background-color: #0f1721;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#111827"
                style="background-color: #111827;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#172033"
                style="background-color: #172033;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#1f2937"
                style="background-color: #1f2937;"
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
                data-value="#102a43"
                style="background-color: #102a43;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#2d2438"
                style="background-color: #2d2438;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Accent Colors:</label>
            <div class="color-boxes" id="bg-accent-color-options">
              <div
                class="color-box"
                data-type="accent"
                data-value="#22d3ee"
                style="background-color: #22d3ee;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#34d399"
                style="background-color: #34d399;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#fb7185"
                style="background-color: #fb7185;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#a78bfa"
                style="background-color: #a78bfa;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Titles Colors:</label>
            <div class="color-boxes" id="text-color-options">
              <div
                class="color-box"
                data-type="color"
                data-value="#eef6fb"
                style="background-color: #eef6fb;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#d7e3ea"
                style="background-color: #d7e3ea;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#a7b4c2"
                style="background-color: #a7b4c2;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#cffafe"
                style="background-color: #cffafe;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#d1fae5"
                style="background-color: #d1fae5;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#fde68a"
                style="background-color: #fde68a;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#fed7aa"
                style="background-color: #fed7aa;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#fbcfe8"
                style="background-color: #fbcfe8;"
              ></div>
            </div>
          </div>
        </div>
      </div>`;
}
