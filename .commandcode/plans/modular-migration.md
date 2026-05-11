# Plan: Full Modular Migration — Xóa legacy-full.js

## Tổng quan

Hiện tại project chạy dual-codebase: `legacy-full.js` (~9500 dòng) + 11 modular features. Mọi feature chạy 2 lần. Mục tiêu: xóa `legacy-full.js`, mọi thứ thành ES modules.

## Kiến trúc đích

```
src/
├── main.js              ← entry point DUY NHẤT, import tất cả modules
├── config/
│   ├── constants.js     ← API keys, endpoints, wave constants
│   └── settings-key.js  ← NEW: SETTINGS_KEY (ytSettingsMDCM / ytmSettingsMDCM)
├── features/
│   ├── bookmarks.js          ✅ đã có
│   ├── continue-watching.js  ✅ đã có
│   ├── download.js           ✅ đã có
│   ├── effects.js            ✅ đã có
│   ├── like-dislike-bar.js   ✅ đã có
│   ├── lockup-cached-stats.js✅ đã có
│   ├── player-size.js        ✅ đã có
│   ├── shorts-channel-name.js✅ đã có
│   ├── time-stats.js         ✅ đã có
│   ├── translate-comments.js ✅ đã có
│   ├── wave-visualizer.js    ✅ đã có
│   ├── cinematic-lighting.js ← NEW
│   ├── ambient-mode.js       ← NEW
│   ├── nonstop-playback.js   ← NEW
│   ├── audio-only.js         ← NEW
│   ├── page-background.js    ← NEW
│   ├── shorts-actions.js     ← NEW
│   ├── hide-comments.js      ← NEW
│   ├── hide-sidebar.js       ← NEW
│   ├── reverse-mode.js       ← NEW
│   └── disable-subtitles.js  ← NEW
├── themes/
│   ├── theme-data.js         ← NEW
│   └── theme-engine.js       ← NEW
├── settings/
│   ├── defaults.js           ← NEW
│   └── settings-manager.js   ← NEW
├── ui/
│   ├── panel.js              ← MERGE full panel HTML
│   ├── styles.scss           ← MERGE all CSS from legacy
│   ├── toolbar.js            ← NEW
│   └── video-info-panel.js   ← NEW
└── utils/
    ├── dom.js                ✅
    ├── helpers.js            ✅
    ├── runtime.js            ✅
    ├── storage.js            ✅
    └── trusted-types.js      ✅
```

## Các phase

### Phase 0: Foundation

| Bước | File                         | Hành động                            |
| ---- | ---------------------------- | ------------------------------------ |
| 0.1  | `src/config/settings-key.js` | Tạo file export SETTINGS_KEY         |
| 0.2  | `src/ui/panel.js`            | Fix loadSettings() dùng settings-key |
| 0.3  | `scripts/sync-legacy.mjs`    | Disable sync                         |
| 0.4  | `src/legacy-full.js`         | Thêm DEPRECATED comment              |

### Phase 1: Settings Manager

- `src/settings/defaults.js` — default settings object
- `src/settings/settings-manager.js` — saveSettings, loadSettings, applySettings
- Xóa duplicate loadSettings trong panel.js
- Update main.js import

### Phase 2: Simple UI Toggles

- `src/features/hide-comments.js`
- `src/features/hide-sidebar.js`
- `src/features/reverse-mode.js`
- `src/features/disable-subtitles.js`

### Phase 3: Theme System

- `src/themes/theme-data.js` — 12 themes array
- `src/themes/theme-engine.js` — checkDarkMode, checkDarkModeActive, applyYTMThemeVars + all CSS

### Phase 4: Panel UI (full)

- Merge full menuHTML template vào panel.js
- Merge all GM_addStyle CSS vào styles.scss
- Tab switching, addIcon, toggleMenu, event listeners
- `src/ui/video-info-panel.js` — video info tab

### Phase 5: Cinematic & Ambient

- `src/features/cinematic-lighting.js`
- `src/features/ambient-mode.js`

### Phase 6: Nonstop & Audio-Only

- `src/features/nonstop-playback.js`
- `src/features/audio-only.js`

### Phase 7: Toolbar & Shorts Actions

- `src/ui/toolbar.js` — buildYTMToolbar, renderizarButtons, all button handlers
- `src/features/shorts-actions.js` — insertReelBarButtons

### Phase 8: Background Image

- `src/features/page-background.js`

### Phase 9: Final Cleanup

- Xóa `import './legacy-full.js'` từ main.js
- Đổi vite entry thành `src/main.js`
- Xóa legacy-full.js, sync-legacy.mjs
- Update build:full script

## Verification

Sau mỗi phase: `npm run build` + `npm run lint` phải pass.
Test thủ công: YouTube + YouTube Music, tất cả features hoạt động.
