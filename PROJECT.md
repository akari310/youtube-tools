# YouTube Tools — Kiến Trúc & Tài Liệu Dự Án

**Project:** `youtube-tools-userscript` v2.4.4.2  
**Type:** Tampermonkey Userscript  
**Build:** Vite + vite-plugin-monkey (production) / Rollup (dev)  
**Last Updated:** 2026-05-11

---

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Luồng khởi tạo](#luồng-khởi-tạo)
3. [Quản lý State](#quản-lý-state)
4. [API Integrations](#api-integrations)
5. [Từng Feature Chi Tiết](#từng-feature-chi-tiết)
6. [Build Pipeline](#build-pipeline)
7. [Cấu trúc thư mục đầy đủ](#cấu-trúc-thư-mục-đầy-đủ)
8. [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Tổng quan kiến trúc

Dự án là một **Tampermonkey userscript** hoạt động trên YouTube và YouTube Music. Codebase đã hoàn tất migration từ monolithic legacy sang **100% modular ES modules**.

```
┌───────────────────────────────────────────────────┐
│                  src/main.js                      │
│              (Entry Point)                        │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Modular ES6 Modules                        │  │
│  │  • features/ (21 modules)                   │  │
│  │  • ui/ (settings-panel, toolbar, gear...)   │  │
│  │  • themes/ (theme-engine, theme-data)       │  │
│  │  • utils/ (dom, storage, runtime...)        │  │
│  │  • settings/ (defaults, manager)            │  │
│  │  • config/ (constants, flags, keys)         │  │
│  └──────────────────────┬──────────────────────┘  │
│                         ▼                         │
│              YouTube DOM / GM APIs                │
└───────────────────────────────────────────────────┘
```

### Migration hoàn tất

- ✅ `legacy-full.js` (~8,800 dòng) đã bị xóa
- ✅ `script.js`, `scripts/sync-legacy.mjs`, `scripts/verify-parity.mjs` đã bị xóa
- ✅ Tất cả 28 issues từ ERROR_ANALYSIS.md đã resolved

---

## Luồng khởi tạo

```
1. Tampermonkey injects script vào youtube.com
2. Vite build → IIFE wrapper bọc toàn bộ code
3. main.js chạy:
   ├── Import settings-manager (loadSettings)
   ├── Import theme-engine (initThemeEngine)
   ├── Import UI components (panel, toolbar, gear, video-info)
   ├── Import tất cả 21 feature modules
   ├── loadSettings() → đọc cấu hình từ GM storage
   ├── initThemeEngine(settings) → áp dụng theme
   ├── createPanel() + initSettingsEvents() → settings panel
   ├── initToolbar() → download toolbar
   ├── initGearIcon() → nút gear
   ├── initVideoInfoPanel() → panel metadata
   ├── Chạy từng feature với settings (try-catch)
   ├── setTimeout(checkNewVersion, 3000)
   ├── Lắng nghe 'yt-navigate-finish' → reinit tất cả
   └── Lắng nghe 'yt-tools-settings-changed' → reinit
```

### SPA Navigation Handler

YouTube là Single Page Application — khi người dùng click vào video, trang không reload. Script dùng custom event:

```javascript
window.addEventListener('yt-navigate-finish', () => {
  reinitAll(settings);
});
```

Tất cả feature đều có handler này hoặc được gọi lại qua reinitAll.

---

## Quản lý State

### 2 nguồn state chính

| Nguồn                      | File               | Scope         | Ví dụ                                                      |
| -------------------------- | ------------------ | ------------- | ---------------------------------------------------------- |
| `__ytToolsRuntime`         | `utils/runtime.js` | Window global | `__ytToolsRuntime.dislikesCache`, `modularStatsIntervalId` |
| GM storage                 | Tampermonkey       | Persistent    | `GM_getValue('ytSettingsMDCM', '{}')`                      |

Module-level variables trong `time-stats.js` và `state.js` dùng cho state cục bộ của từng feature.

### Storage Mechanism

- **Settings:** `GM_getValue('ytSettingsMDCM', '{}')` — JSON (YouTube) / `GM_getValue('ytmSettingsMDCM', '{}')` — JSON (YouTube Music)
- **Thống kê:** `GM_setValue('YT_TOTAL_USAGE', ...)`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`, `YT_DETAILED_STATS`, `YT_DAILY_STATS`, `YT_SESSION_START`
- **Bookmarks:** `GM_setValue('YT_BOOKMARKS', ...)`
- **Continue Watching:** `GM_setValue('YT_CONTINUE_VIDEO', ...)`
- **Dislike Cache:** `GM_setValue('ytLikesDislikesCacheMDCM', ...)` + `__ytToolsRuntime.dislikesCache` (in-memory)

---

## API Integrations

### ReturnYouTubeDislike

```
Endpoint: https://returnyoutubedislikeapi.com/Votes?videoId={id}
Method: GET
Cache: 10 phút (in-memory), persistent 7 ngày qua GM storage
Flow:
  1. Check __ytToolsRuntime.dislikesCache (10-min TTL)
  2. Check persisted cache (GM_getValue)
  3. Fetch API → cache kết quả
```

### Google Translate

```
Endpoint: https://translate.googleapis.com/translate_a/t
Parameters: client=dict-chrome-ex, sl=auto, tl={target}, q={text}
Target: Đọc từ settings.translateTarget (mặc định 'en')
```

### SaveNow Download API

```
Endpoint: https://p.savenow.to/ajax/download.php
Fallbacks: ['https://p.savenow.to', 'https://p.lbserver.xyz']
API Key: 'dfcb6d76f2f6a9894gjkege8a4ab232222' (default, có thể override)
Flow:
  1. Gửi request download với video ID + API key
  2. Polling progress với exponential backoff (failCount max 5, delay max 16s)
  3. Trả về download URL khi hoàn thành
```

### Dubs Download Provider (Fallback)

```
Start:  https://dubs.io/wp-json/tools/v1/download-video
Status: https://dubs.io/wp-json/tools/v1/status-video
Method: POST (JSON)
```

---

## Từng Feature Chi Tiết

### 1. Download (`src/features/download.js`)
- **Mục đích:** Tải video MP4 hoặc audio MP3 từ YouTube
- **Providers:** SaveNow (chính) + Dubs (fallback)
- **UI:** Download toolbar với progress UI (`src/ui/toolbar.js`)

### 2. Like/Dislike Bar (`src/features/like-dislike-bar.js`)
- **Mục đích:** Hiển thị thanh tỷ lệ like/dislike + số dislike
- **API:** ReturnYouTubeDislike
- **Parsing:** `parseCountText()` — locale-aware (đọc `hl` URL param)

### 3. Time Stats (`src/features/time-stats.js`)
- **Mục đích:** Theo dõi thời gian xem video/shorts, thống kê session, daily, weekly
- **Storage:** `YT_TOTAL_USAGE`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`, `YT_DETAILED_STATS`, `YT_DAILY_STATS`, `YT_SESSION_START`
- **UI:** Stats panel (`src/ui/_stats.scss`)
- **Update interval:** 1 giây | **Save interval:** 30 giây

### 4. Wave Visualizer (`src/features/wave-visualizer.js`)
- **Mục đích:** Visualizer sóng âm thanh real-time dùng Web Audio API
- **Tech:** AudioContext → AnalyserNode → Canvas (requestAnimationFrame loop)
- **Cleanup:** `cleanupWaveVisualizer()` gọi khi SPA navigate

### 5. Bookmarks (`src/features/bookmarks.js`)
- **Mục đích:** Lưu timestamp đánh dấu trong video
- **Storage:** `GM_getValue('YT_BOOKMARKS', '[]')`

### 6. Continue Watching (`src/features/continue-watching.js`)
- **Mục đích:** Lưu vị trí đang xem và tự động resume
- **Storage:** `GM_setValue('YT_CONTINUE_VIDEO', ...)`
- **Cache:** `metaCache` Map per videoId

### 7. Translate Comments (`src/features/translate-comments.js`)
- **Mục đích:** Dịch bình luận YouTube sang ngôn ngữ khác
- **API:** Google Translate
- **Target:** Đọc từ `settings.translateTarget`

### 8. Effects Mini-game (`src/features/effects.js`)
- **Mục đích:** Game nhỏ bắn súng bên trong panel
- **Input:** Keyboard (Space, Arrow keys)

### 9. Player Size (`src/features/player-size.js`)
- **Mục đích:** Cho phép người dùng điều chỉnh kích thước video player
- **Có SPA navigation handler**

### 10. Shorts Channel Name (`src/features/shorts-channel-name.js`)
- **Mục đích:** Hiển thị tên kênh trên YouTube Shorts
- **Tech:** IntersectionObserver + `FetchQueue` bounded concurrency

### 11. Cached Stats on Video Cards (`src/features/lockup-cached-stats.js`)
- **Mục đích:** Hiển thị thống kê đã cache trên video lockup cards

### 12. Audio Only (`src/features/audio-only.js`)
- **Mục đích:** Ẩn video, chỉ phát audio — nền đen + background art

### 13. Avatar Download (`src/features/avatar-download.js`)
- **Mục đích:** Tải avatar kênh YouTube

### 14. Cinematic Lighting (`src/features/cinematic-lighting.js`)
- **Mục đích:** Ambient lighting effect xung quanh video player

### 15. Comment Observer (`src/features/comment-observer.js`)
- **Mục đích:** MutationObserver chung cho bình luận

### 16. Disable Subtitles (`src/features/disable-subtitles.js`)
- **Mục đích:** Tắt phụ đề tự động

### 17. Download Description (`src/features/download-description.js`)
- **Mục đích:** Tải mô tả video dạng text

### 18. Hide Comments (`src/features/hide-comments.js`)
- **Mục đích:** Ẩn section bình luận

### 19. Hide Sidebar (`src/features/hide-sidebar.js`)
- **Mục đích:** Ẩn sidebar

### 20. Nonstop Playback (`src/features/nonstop-playback.js`)
- **Mục đích:** Tự động chuyển video tiếp theo khi kết thúc

### 21. Reverse Mode (`src/features/reverse-mode.js`)
- **Mục đích:** Đảo ngược layout giao diện

### 22. Shorts Reel Buttons (`src/features/shorts-reel-buttons.js`)
- **Mục đích:** Nút tùy chỉnh trên Shorts reel

### 23. YTM Ambient Mode (`src/features/ytm-ambient-mode.js`)
- **Mục đích:** Ambient mode cho YouTube Music

---

## Build Pipeline

### Dev Mode (Rollup)

```
src/main.js → Rollup → dist/dev.user.js
              └─ IIFE format
              └─ Inline sourcemap
              └─ Userscript header
```

### Production Build (Vite + vite-plugin-monkey)

```
src/main.js → Vite → dist/youtube-tools-userscript.user.js
   ├── ES6 imports tree-shaken
   ├── SCSS compiled to CSS
   ├── vite-plugin-monkey tạo userscript header
   └── @require iziToast CDN
```

- Entry point: `src/main.js` (import tất cả modular features + UI + themes)
- `vite-plugin-monkey` tự động generate metadata block
- iziToast được load qua CDN (không bundle vào)

---

## Cấu trúc thư mục đầy đủ

```
youtube-tools/
│
├── README.md                   # Tài liệu người dùng
├── PROJECT.md                  # Tài liệu kiến trúc (file này)
├── ERROR_ANALYSIS.md           # 28 issues đã resolved
├── CHECKLIST.md                # Checklist fix từng issue
├── FEATURE_PARITY.md           # So sánh tính năng
├── AGENTS.md                   # Hướng dẫn cho AI agent
│
├── package.json                # v2.4.4.2, scripts, deps
├── vite.config.js              # Production build config
├── vite.config.dev.js          # Vite dev build config
├── rollup.config.dev.js        # Rollup dev build config
├── eslint.config.js            # ESLint v9 flat config
├── .prettierrc                 # Prettier config
├── .gitignore
│
├── src/
│   ├── main.js                 # Entry point — imports everything
│   │
│   ├── config/
│   │   ├── constants.js        # API URLs, keys, wave constants
│   │   ├── flags.js            # Feature flags
│   │   └── settings-key.js     # Storage key constants
│   │
│   ├── features/
│   │   ├── audio-only.js       # Chế độ chỉ nghe nhạc
│   │   ├── avatar-download.js  # Tải avatar kênh
│   │   ├── bookmarks.js        # Video bookmarks
│   │   ├── cinematic-lighting.js # Ambient lighting effect
│   │   ├── comment-observer.js # MutationObserver chung
│   │   ├── continue-watching.js # Resume playback (549 dòng)
│   │   ├── disable-subtitles.js # Tắt phụ đề tự động
│   │   ├── download.js         # MP3/MP4 download engine
│   │   ├── download-description.js # Tải mô tả video
│   │   ├── effects.js          # Mini-game (268 dòng)
│   │   ├── hide-comments.js    # Ẩn bình luận
│   │   ├── hide-sidebar.js     # Ẩn sidebar
│   │   ├── like-dislike-bar.js # RYD integration + bar
│   │   ├── lockup-cached-stats.js # Cached stats cards
│   │   ├── nonstop-playback.js # Tự động chuyển video
│   │   ├── player-size.js      # Player width adjustment
│   │   ├── reverse-mode.js     # Đảo ngược layout
│   │   ├── shorts-channel-name.js # Shorts channel names
│   │   ├── shorts-reel-buttons.js # Shorts reel buttons
│   │   ├── time-stats.js       # Usage tracking + stats
│   │   ├── translate-comments.js # Comment translation
│   │   ├── wave-visualizer.js  # Audio visualizer (285 dòng)
│   │   └── ytm-ambient-mode.js # YTM ambient mode
│   │
│   ├── ui/
│   │   ├── settings-panel.js   # Entry point settings panel
│   │   ├── settings-panel-html.js # HTML template (857 dòng)
│   │   ├── settings-panel-events.js # Event handlers
│   │   ├── settings-panel.scss # Entry SCSS (@use 3 files)
│   │   ├── _variables.scss     # CDN imports + CSS variables
│   │   ├── _youtube.scss       # Styles cho YouTube (2,120 dòng)
│   │   ├── _youtube-music.scss # Styles cho YouTube Music (235 dòng)
│   │   ├── _stats.scss         # Stats panel styles
│   │   ├── toolbar.js          # Download toolbar
│   │   ├── gear-icon.js        # Settings gear button
│   │   └── video-info-panel.js # Panel thông tin video
│   │
│   ├── settings/
│   │   ├── defaults.js         # Default settings values
│   │   └── settings-manager.js # Settings loader/saver
│   │
│   ├── themes/
│   │   ├── theme-engine.js     # Centralized theme management
│   │   └── theme-data.js       # Theme presets & colors
│   │
│   └── utils/
│       ├── dom.js              # DOM helpers
│       ├── helpers.js          # FormatterNumber, getCurrentVideoId
│       ├── logger.js           # Centralized logging
│       ├── fetch-queue.js      # Bounded fetch queue
│       ├── runtime.js          # __ytToolsRuntime state
│       ├── state.js            # Wave visualizer state
│       ├── storage.js          # GM storage wrapper + cache
│       └── trusted-types.js    # Trusted Types + CSP-safe HTML
│
└── dist/
    └── youtube-tools-userscript.user.js  # Production build
```

---

## Known Issues & Technical Debt

### Đã resolved (28/28) ✅

Tất cả 28 issues từ ERROR_ANALYSIS.md đã được resolved. Chi tiết:

| Phase               | Total  | Done   |
| ------------------- | ------ | ------ |
| Phase 1: Sửa Ngay   | 6      | **6**  |
| Phase 2: Kiến Trúc  | 7      | **7**  |
| Phase 3: Chất Lượng | 7      | **7**  |
| Phase 4: Dọn Dẹp    | 8      | **8**  |
| **TOTAL**           | **28** | **28** |

### Chưa có

- ⬜ **Test coverage** — chưa có test framework

---

## CSP & Security

Dự án dùng **Trusted Types** để tuân thủ Content Security Policy của YouTube:

```javascript
// src/utils/trusted-types.js
export function safeHTML(html) { /* ... */ }
export function setHTML(el, html) { /* ... */ }
```

Panel UI dùng `setHTML()` để inject HTML template một cách an toàn.

## GM API Grants

```javascript
'GM_info'              // Script metadata
'GM_addStyle'          // Inject CSS
'GM_setValue'          // Write persistent storage
'GM_getValue'          // Read persistent storage
'unsafeWindow'         // Access window object
'GM_registerMenuCommand' // Tampermonkey menu
```

---

## Migration Roadmap

Mục tiêu: **xóa `import './legacy-full.js'`** — ✅ ĐÃ HOÀN THÀNH

1. ✅ Phase 1 — Fix critical bugs
2. ✅ Phase 2 — Thiết kế unified AppState, sửa kiến trúc core
3. ✅ Phase 3 — Cải thiện code quality, consistency
4. ✅ Phase 4 — Extract inline HTML, split CSS, cleanup
5. ✅ **Xóa `legacy-full.js`** — Codebase 100% modular
