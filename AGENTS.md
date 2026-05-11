# AGENTS.md — Hướng dẫn cho AI Agent

> **Dự án:** YouTube Tools Userscript  
> **Version:** v2.4.4.2  
> **Ngày tạo:** 10/05/2026 | **Cập nhật:** 11/05/2026  
> **Ngôn ngữ:** Tiếng Việt (primary), English (code/docs)

---

## 1. Tổng quan dự án

Đây là một **userscript** đa năng cho YouTube, chạy trên **Tampermonkey / Greasemonkey / Violentmonkey**. Script bổ sung nhiều tính năng vào giao diện YouTube: tải video/audio, hiển thị dislike, thống kê thời gian xem, đánh dấu video, visualizer sóng nhạc, dịch bình luận, v.v.

### Trạng thái hiện tại

- ✅ **Migration hoàn tất** — `legacy-full.js` đã bị xóa, codebase 100% modular ES modules
- ✅ **28/28 issues từ ERROR_ANALYSIS.md đã resolved**
- ✅ **Hệ thống UI mới** — glassmorphic settings panel, toolbar, video info, theme engine
- ⬜ **Chưa có test coverage**

---

## 2. Cấu trúc thư mục

```
youtube-tools/
├── src/
│   ├── main.js                       # 🚀 Entry point (ES Modules)
│   ├── config/
│   │   ├── constants.js              # API endpoints, API key, constants sóng nhạc
│   │   ├── flags.js                  # Feature flags
│   │   └── settings-key.js           # Storage key constants
│   ├── features/                     # 🎯 21 tính năng modular
│   │   ├── audio-only.js             # Chế độ chỉ nghe nhạc (ẩn video)
│   │   ├── avatar-download.js        # Tải avatar kênh
│   │   ├── bookmarks.js              # Đánh dấu timestamp trong video
│   │   ├── cinematic-lighting.js     # Hiệu ứng ambient lighting
│   │   ├── comment-observer.js       # MutationObserver chung cho bình luận
│   │   ├── continue-watching.js      # Tiếp tục xem video đang dở
│   │   ├── disable-subtitles.js      # Tắt phụ đề tự động
│   │   ├── download.js               # Tải video/audio (SaveNow + Dubs API)
│   │   ├── download-description.js   # Tải mô tả video
│   │   ├── effects.js                # Mini-game tương tác (né bom)
│   │   ├── hide-comments.js          # Ẩn bình luận
│   │   ├── hide-sidebar.js           # Ẩn sidebar
│   │   ├── like-dislike-bar.js       # Thanh like/dislike (ReturnYouTubeDislike API)
│   │   ├── lockup-cached-stats.js    # Thống kê trên thumbnail video cards
│   │   ├── nonstop-playback.js       # Tự động chuyển video tiếp theo
│   │   ├── player-size.js            # Điều chỉnh kích thước player
│   │   ├── reverse-mode.js           # Đảo ngược giao diện
│   │   ├── shorts-channel-name.js    # Hiển thị tên kênh trên Shorts
│   │   ├── shorts-reel-buttons.js    # Nút tùy chỉnh trên Shorts reel
│   │   ├── time-stats.js             # Thống kê thời gian xem
│   │   ├── translate-comments.js     # Dịch bình luận (Google Translate API)
│   │   ├── wave-visualizer.js        # Sóng nhạc real-time (Web Audio API)
│   │   └── ytm-ambient-mode.js       # YouTube Music ambient mode
│   ├── ui/                           # 🖼️ Hệ thống UI mới
│   │   ├── settings-panel.js         # Entry point settings panel
│   │   ├── settings-panel-html.js    # HTML template (857 dòng)
│   │   ├── settings-panel-events.js  # Event handlers
│   │   ├── settings-panel.scss       # Entry SCSS (@use 3 file)
│   │   ├── _variables.scss           # CDN imports + CSS variables (11 dòng)
│   │   ├── _youtube.scss             # Styles cho YouTube (2,120 dòng)
│   │   ├── _youtube-music.scss       # Styles cho YouTube Music (235 dòng)
│   │   ├── _stats.scss               # Stats panel styles
│   │   ├── toolbar.js                # Download toolbar với progress UI
│   │   ├── gear-icon.js              # Nút settings gear
│   │   └── video-info-panel.js       # Panel thông tin video
│   ├── settings/
│   │   ├── defaults.js               # Default settings values
│   │   └── settings-manager.js       # Settings loader/saver
│   ├── themes/
│   │   ├── theme-engine.js           # Centralized theme management
│   │   └── theme-data.js             # Theme presets & colors
│   └── utils/
│       ├── dom.js                    # DOM helpers: qs, qsAll, createEl, appendEl
│       ├── helpers.js                # Notify, getCurrentVideoId, formatTimeShort
│       ├── logger.js                 # Centralized logging (DEBUG/INFO/WARN/ERROR)
│       ├── fetch-queue.js            # Bounded concurrent fetch queue
│       ├── runtime.js                # 🧠 Global state object (__ytToolsRuntime)
│       ├── state.js                  # State cho wave visualizer
│       ├── storage.js                # GM_getValue/GM_setValue wrapper + cache
│       └── trusted-types.js          # Trusted Types policy (CSP-safe HTML)
├── dist/
│   └── youtube-tools-userscript.user.js  # Production build output
├── rollup.config.dev.js              # Dev build: Rollup, entry: main.js
├── vite.config.js                    # Production build: Vite, entry: main.js
├── vite.config.dev.js                # Dev build: Vite, entry: main.js
├── eslint.config.js                  # ESLint v9 flat config
├── package.json                      # Dependencies & scripts
├── AGENTS.md                         # File này
├── README.md                         # Tài liệu người dùng
├── PROJECT.md                        # Tài liệu kiến trúc
├── ERROR_ANALYSIS.md                 # Báo cáo phân tích lỗi (28 issues, all resolved)
├── CHECKLIST.md                      # Checklist fix từng issue
└── FEATURE_PARITY.md                 # So sánh tính năng modular
```

---

## 3. Công nghệ & Môi trường

| Công nghệ                        | Mục đích                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| **JavaScript ES6+** (ES Modules) | Code chính cho các tính năng                                                                     |
| **SCSS**                         | CSS cho UI (tách thành _youtube, _youtube-music, _variables, _stats)                             |
| **Rollup**                       | Dev build (watch mode) với `rollup.config.dev.js`                                                |
| **Vite + vite-plugin-monkey**    | Production build, tự động tạo userscript header                                                  |
| **GM APIs**                      | `GM_getValue`, `GM_setValue`, `GM_addStyle`, `GM_info`, `GM_registerMenuCommand`, `unsafeWindow` |
| **iziToast** (CDN)               | Thông báo toast (có fallback tự tạo)                                                             |
| **ESLint v9**                    | Lint (flat config)                                                                               |
| **Prettier**                     | Format code                                                                                      |
| **ReturnYouTubeDislike API**     | Lấy dislike count                                                                                |
| **Google Translate API**         | Dịch bình luận                                                                                   |
| **SaveNow / Dubs API**           | Download video/audio                                                                             |
| **Web Audio API**                | Wave visualizer (AudioContext, AnalyserNode, MediaElementSource)                                 |

---

## 4. Luồng khởi tạo (Entry Point)

### `src/main.js` — Entry Point

```
1. Import settings-manager (loadSettings)
2. Import theme-engine (initThemeEngine)
3. Import settings-panel (createPanel, initSettingsEvents)
4. Import toolbar (initToolbar)
5. Import gear-icon (initGearIcon)
6. Import video-info-panel (initVideoInfoPanel)
7. Import tất cả 21 feature modules
8. loadSettings() — đọc cấu hình từ GM storage
9. initThemeEngine(settings) — áp dụng theme
10. createPanel() + initSettingsEvents() — tạo settings panel
11. initToolbar() — tạo download toolbar
12. initGearIcon() — gắn nút gear
13. initVideoInfoPanel() — panel thông tin video
14. initTimeStats() — bắt đầu theo dõi thời gian
15. Chạy từng feature với settings (có try-catch bọc lỗi)
16. setTimeout(checkNewVersion, 3000) — kiểm tra phiên bản mới
17. Lắng nghe 'yt-navigate-finish' (SPA navigation) → reinit tất cả feature
18. Lắng nghe 'yt-tools-settings-changed' → reinit với settings mới
```

### Cơ chế quan trọng

- **`__ytToolsRuntime`** — global state object, export ra `window.__ytToolsRuntime`
- **`yt-navigate-finish`** — YouTube là SPA, event này phát ra khi chuyển trang
- **`yt-tools-settings-changed`** — custom event khi user thay đổi settings trong panel

---

## 5. State Management

State tập trung ở **2 nơi chính**:

| Nơi                    | File            | Mô tả                                                                                          |
| ---------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `__ytToolsRuntime`     | `runtime.js`    | Global state: settings, bookmark state, continueWatching, dislikesCache, interval/observer IDs |
| GM storage             | `storage.js`    | Bookmarks, Continue Watching, Shorts Channel Cache, Likes/Dislikes Cache, Settings             |

Module-level variables trong `time-stats.js` và `state.js` dùng cho state cục bộ của từng feature.

---

## 6. Storage Keys

```js
STORAGE_KEYS = {
  BOOKMARKS: 'YT_BOOKMARKS',
  CONTINUE_VIDEO: 'YT_CONTINUE_VIDEO',
  SHORTS_CHANNEL_CACHE: 'ytShortsChannelCacheMDCM',
  LIKES_DISLIKES_CACHE: 'ytLikesDislikesCacheMDCM',
  VERSION_CHECK_LAST: 'ytVersionCheckLastMDCM',
  SETTINGS_YT: 'ytSettingsMDCM',
  SETTINGS_YTM: 'ytmSettingsMDCM',
  TOTAL_USAGE: 'YT_TOTAL_USAGE',
  VIDEO_TIME: 'YT_VIDEO_TIME',
  SHORTS_TIME: 'YT_SHORTS_TIME',
  DETAILED_STATS: 'YT_DETAILED_STATS',
  DAILY_STATS: 'YT_DAILY_STATS',
  SESSION_START: 'YT_SESSION_START',
};
```

### Cache Policy

| Cache             | In-memory TTL  | Persisted TTL                 |
| ----------------- | -------------- | ----------------------------- |
| Dislikes          | 10 phút        | 7 ngày                        |
| Shorts channel    | Không giới hạn | 7 ngày                        |
| Bookmarks         | N/A            | Vĩnh viễn                     |
| Continue Watching | N/A            | Vĩnh viễn (prune 200 entries) |

---

## 7. Các lệnh NPM quan trọng

| Command              | Mô tả                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`        | Dev mode với Rollup — watch `src/main.js`, output `dist/dev.user.js` |
| `npm run build`      | Production build với Vite — entry `src/main.js`                      |
| `npm run lint`       | ESLint check                                                         |
| `npm run lint:fix`   | ESLint auto-fix                                                      |
| `npm run format`     | Prettier format                                                      |
| `npm run format:check` | Prettier check                                                    |
| `npm run verify`     | Build + lint + format check (CI pipeline)                            |

---

## 8. Các vấn đề đã biết (Known Issues)

Xem chi tiết trong `ERROR_ANALYSIS.md`. **Tất cả 28 issues đã resolved** sau migration hoàn tất:

### Đã resolved (28/28) ✅

- ✅ **Dual Codebase** — `legacy-full.js` đã bị xóa, codebase 100% modular
- ✅ **State Fragmentation** — đã đơn giản hóa
- ✅ **fetchChain memory leak** — thay bằng `FetchQueue` class
- ✅ **RAF loop cleanup** — wave visualizer cleanup khi SPA navigate
- ✅ **Null-check gaps** — tất cả feature có null guard
- ✅ **Locale parsing** — dùng `hl` URL param để locale-aware parsing
- ✅ **Download polling backoff** — exponential backoff
- ✅ **Tất cả 28 issues** — xem CHECKLIST.md

### Chưa có

- ⬜ **Test coverage** — chưa có test framework

---

## 9. Quy ước code (Conventions)

### Biến & Hàm

```js
// ✅ NÊN dùng (tên rõ ràng)
const qs = sel => document.querySelector(sel);
const qsAll = sel => document.querySelectorAll(sel);
const createEl = tag => document.createElement(tag);
const appendEl = el => document.body.appendChild(el);
```

### Console Logging

```js
// ✅ Dùng prefix [YT Tools] để dễ filter
console.log('[YT Tools] Panel created');
console.warn('[YT Tools] Init error:', e);
console.error('[YT Tools] Failed:', e);
```

### Error Handling

```js
// ✅ LUÔN log lỗi, không nuốt silently
try {
  fn(arg);
} catch (e) {
  console.warn('[YT Tools] Feature init failed:', e);
}
```

### DOM Queries

```js
// ✅ LUÔN null-check trước khi truy cập .style, .textContent
const el = document.querySelector('.selector');
if (el) el.style.display = 'none';

// ✅ Dùng optional chaining
const text = el?.textContent?.trim() ?? '';
```

### Settings

```js
// ✅ Dùng GM_getValue/GM_setValue (GM storage)
const settings = GM_getValue('ytSettingsMDCM', '{}');
const parsed = JSON.parse(settings);
```

---

## 10. Feature Checklist

| Feature             | File                        | Ghi chú                                          |
| ------------------- | --------------------------- | ------------------------------------------------ |
| Audio Only          | `audio-only.js`             | Ẩn video, chỉ phát audio                         |
| Avatar Download     | `avatar-download.js`        | Tải avatar kênh                                  |
| Bookmarks           | `bookmarks.js`              | Đánh dấu timestamp                               |
| Cinematic Lighting  | `cinematic-lighting.js`     | Ambient lighting effect                          |
| Comment Observer    | `comment-observer.js`       | MutationObserver chung cho bình luận             |
| Continue Watching   | `continue-watching.js`      | Resume video, metaCache, prune 200 entries       |
| Disable Subtitles   | `disable-subtitles.js`      | Tắt phụ đề tự động                               |
| Download            | `download.js`               | MP3/MP4, SaveNow + Dubs, exponential backoff     |
| Download Description| `download-description.js`   | Tải mô tả video dạng text                        |
| Effects (mini-game) | `effects.js`                | Game né bom                                      |
| Hide Comments       | `hide-comments.js`          | Ẩn section bình luận                             |
| Hide Sidebar        | `hide-sidebar.js`           | Ẩn sidebar                                       |
| Like/Dislike Bar    | `like-dislike-bar.js`       | ReturnYouTubeDislike API, locale-aware parsing   |
| Lockup Cached Stats | `lockup-cached-stats.js`    | Stats trên video cards                           |
| Nonstop Playback    | `nonstop-playback.js`       | Auto-skip khi video kết thúc                     |
| Player Size         | `player-size.js`            | Điều chỉnh kích thước player                     |
| Reverse Mode        | `reverse-mode.js`           | Đảo ngược layout                                 |
| Shorts Channel Name | `shorts-channel-name.js`    | Tên kênh trên Shorts, IntersectionObserver       |
| Shorts Reel Buttons  | `shorts-reel-buttons.js`   | Nút tùy chỉnh trên Shorts reel                   |
| Time Stats          | `time-stats.js`             | Usage, session, daily, weekly chart, top videos  |
| Translate Comments  | `translate-comments.js`     | Google Translate API, MutationObserver           |
| Wave Visualizer     | `wave-visualizer.js`        | Web Audio API, cleanup SPA navigate              |
| YTM Ambient Mode    | `ytm-ambient-mode.js`       | YouTube Music ambient mode                       |

### UI Components

| Component          | File                        | Mô tả                                     |
| ------------------ | --------------------------- | ----------------------------------------- |
| Settings Panel     | `settings-panel.js`         | Entry point, import HTML + events + SCSS  |
| Panel HTML         | `settings-panel-html.js`    | HTML template (857 dòng)                  |
| Panel Events       | `settings-panel-events.js`  | Event handlers cho settings               |
| Toolbar            | `toolbar.js`                | Download toolbar với progress UI          |
| Gear Icon          | `gear-icon.js`              | Nút settings gear trên YT header          |
| Video Info Panel   | `video-info-panel.js`       | Panel metadata video                      |
| Theme Engine       | `theme-engine.js`           | Quản lý theme tập trung                   |
| Theme Data         | `theme-data.js`             | Theme presets & colors                    |

---

## 11. Hướng dẫn sửa lỗi thường gặp

### Panel không hiển thị

1. Kiểm tra `createPanel()` trong `main.js` có được gọi không
2. Kiểm tra `settings-panel.js` import `settings-panel.scss`
3. Kiểm tra event listener `yt-navigate-finish` có reinit panel không

### Time stats không cập nhật

1. Kiểm tra `initTimeStats()` đã chạy chưa
2. Kiểm tra `statsIntervalId` trong `__ytToolsRuntime` có bị clear không
3. Kiểm tra storage keys: `YT_TOTAL_USAGE`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`

### Download không hoạt động

1. Kiểm tra API key trong `constants.js` còn hợp lệ không
2. Kiểm tra CORS — SaveNow/Dubs API có thể bị chặn
3. Kiểm tra `fetchJsonWithTimeout` timeout có đủ không

### Wave visualizer không hiển thị

1. Kiểm tra `createWaveSource()` — YouTube có thể đã connect video vào AudioContext riêng
2. Kiểm tra `cleanupWaveVisualizer()` được gọi khi SPA navigate chưa

---

## 12. Build System

### Rollup (Dev)

- Config: `rollup.config.dev.js`
- Entry: `src/main.js`
- Output: `dist/dev.user.js`
- Plugin: `@rollup/plugin-node-resolve`, `@rollup/plugin-terser`

### Vite (Production)

- Config: `vite.config.js`
- Entry: `src/main.js`
- Output: `dist/youtube-tools-userscript.user.js`
- Plugin: `vite-plugin-monkey` (tự động tạo `==UserScript==` header)

### Vite (Dev)

- Config: `vite.config.dev.js`
- Entry: `src/main.js`
- Plugin: `vite-plugin-monkey`

---

## 13. ESLint Config

```js
// eslint.config.js — flat config
export default [
  { ignores: ['node_modules/**', 'dist/**', 'script.js'] },
  { languageOptions: { globals: { ...browserGlobals, ...userscriptGlobals } } },
];
```

- **Các file bị ignore:** `dist/`, `node_modules/`, `script.js`
- **Globals được khai báo:** browser APIs + GM APIs + iziToast + unsafeWindow

---

## 14. Checklist trước khi commit

- [ ] `npm run lint` pass (0 errors, 0 warnings)
- [ ] `npm run format:check` pass
- [ ] `npm run build` thành công
- [ ] File `dist/youtube-tools-userscript.user.js` được tạo
- [ ] Tất cả feature có try-catch bọc lỗi
- [ ] DOM queries có null-check
- [ ] Storage dùng `GM_getValue`/`GM_setValue`, không dùng `localStorage`

---

## 15. Liên hệ & Tài liệu tham khảo

- **README.md** — Tài liệu người dùng
- **PROJECT.md** — Tài liệu kiến trúc chi tiết
- **ERROR_ANALYSIS.md** — Báo cáo phân tích lỗi (28 issues, all resolved)
- **CHECKLIST.md** — Checklist fix từng issue
- **FEATURE_PARITY.md** — So sánh tính năng
- **package.json** — Scripts & dependencies
- **Repository:** https://github.com/DeveloperMDCM/youtube-tools

---

_File này được tạo để giúp AI agent nhanh chóng nắm bắt cấu trúc, luồng hoạt động, và các vấn đề cần lưu ý khi làm việc với dự án YouTube Tools._
