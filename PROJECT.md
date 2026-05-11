# YouTube Tools — Kiến Trúc & Tài Liệu Dự Án

**Project:** `youtube-tools-userscript` v2.4.3.2  
**Type:** Tampermonkey Userscript  
**Build:** Vite + vite-plugin-monkey (production) / Rollup (dev)  
**Last Updated:** 2026-05-10

---

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Dual Codebase Problem](#dual-codebase-problem)
3. [Luồng khởi tạo](#luồng-khởi-tạo)
4. [Quản lý State](#quản-lý-state)
5. [API Integrations](#api-integrations)
6. [Từng Feature Chi Tiết](#từng-feature-chi-tiết)
7. [Build Pipeline](#build-pipeline)
8. [Cấu trúc thư mục đầy đủ](#cấu-trúc-thư-mục-đầy-đủ)
9. [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Tổng quan kiến trúc

Dự án là một **Tampermonkey userscript** hoạt động trên YouTube và YouTube Music. Có hai hệ thống code chạy song song:

```
┌───────────────────────────────────────────────────┐
│                  src/main.js                      │
│              (Entry Point)                        │
│                                                   │
│  ┌───────────────────────┐   ┌──────────────────┐ │
│  │  Modular ES6 Modules  │   │  Legacy (IIFE)   │ │
│  │  • features/*.js      │   │  legacy-full.js  │ │
│  │  • ui/*.js            │   │  (8,814 lines)   │ │
│  │  • utils/*.js         │   │  sync từ         │ │
│  │  • Vite tree-shaking  │   │  script.js       │ │
│  └──────────┬────────────┘   └────────┬─────────┘ │
│             │                         │           │
│             └─────────┬───────────────┘           │
│                       ▼                           │
│            YouTube DOM / GM APIs                  │
└───────────────────────────────────────────────────┘
```

### Tại sao có 2 codebase?

Dự án đang trong quá trình **migration** từ monolithic legacy script (`script.js`) sang kiến trúc modular ES6.

- **Legacy** (`src/legacy-full.js`): 8,814 dòng, được sync từ script.js qua `scripts/sync-legacy.mjs`. Chứa tất cả feature trong 1 file.
- **Modular** (`src/features/*.js`): Mỗi feature được tách ra module riêng, import qua ES6.

**Vấn đề (Issue #1):** Cả hai cùng được import trong `main.js`, gây duplicate MutationObservers, event handlers, GM storage writes, và inflated time stats. File `flags.js` disable modular wave visualizer (`__ytModularWaveActive = false`) để dùng legacy.

---

## Luồng khởi tạo

```
1. Tampermonkey injects script vào youtube.com
2. Vite build → IIFE wrapper bọc toàn bộ code
3. main.js chạy:
   ├── Import tất cả feature modules
   ├── Import legacy-full.js
   ├── Tạo mảng features[][] = [fn, ...]
   ├── Gọi reinitAll(settings) → gọi từng fn(s) trong try/catch
   ├── Thiết lập yt-navigate-finish listener
   │   └── Khi SPA navigation → gọi lại reinitAll(settings)
   └── Thiết lập GM_registerMenuCommand
```

### SPA Navigation Handler

YouTube là Single Page Application — khi người dùng click vào video, trang không reload. Script dùng custom event:

```javascript
window.addEventListener('yt-navigate-finish', () => {
  reinitAll(settings);
});
```

**Vấn đề:** Không phải tất cả feature đều có handler này (Issues #6, #17).

---

## Quản lý State

### 4 nguồn state hiện tại (Issue #4)

| Nguồn                      | File               | Scope         | Ví dụ                                                      |
| -------------------------- | ------------------ | ------------- | ---------------------------------------------------------- |
| `__ytToolsRuntime`         | `utils/runtime.js` | Window global | `__ytToolsRuntime.dislikesCache`, `modularStatsIntervalId` |
| `state.js` getters/setters | `utils/state.js`   | Module scope  | 54 getter/setter cho 18 fields                             |
| Legacy globals             | `legacy-full.js`   | IIFE scope    | `var health = 100`, `var settings = {}`                    |
| GM storage                 | Tampermonkey       | Persistent    | `GM_getValue('ytSettingsMDCM', '{}')`                      |

### Storage Mechanism

- **Settings:** `GM_getValue('ytSettingsMDCM', '{}')` — JSON
- **Thống kê:** `GM_setValue('YT_TOTAL_USAGE', ...)`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`, `YT_DETAILED_STATS`, `YT_DAILY_STATS`, `YT_SESSION_START`
- **Bookmarks:** `GM_setValue('YT_BOOKMARKS', ...)`
- **Continue Watching:** `GM_setValue('YT_CONTINUE_VIDEO', ...)`
- **Dislike Cache:** `GM_setValue('yt_likes_dislikes_cache', ...)` + `__ytToolsRuntime.dislikesCache` (in-memory)

### Critical Bug: localStorage vs GM_getValue (Issue #7)

`like-dislike-bar.js:250` dùng `localStorage.getItem('ytSettingsMDCM')` nhưng `panel.js` dùng `GM_getValue('ytSettingsMDCM')`. Trong Tampermonkey, đây là 2 storage khác nhau → settings invisible với nhau.

---

## API Integrations

### ReturnYouTubeDislike

```
Endpoint: https://returnyoutubedislikeapi.com/Votes?videoId={id}
Method: GET
Cache: 10 phút (in-memory), persistent qua GM storage
Flow:
  1. Check __ytToolsRuntime.dislikesCache (10-min TTL)
  2. Check persisted cache (GM_getValue)
  3. Fetch API → cache kết quả
```

### Google Translate

```
Endpoint: https://translate.googleapis.com/translate_a/t
Parameters: client=dict-chrome-ex, sl=auto, tl={target}, q={text}
Limitation: Hardcoded tl='vi' (Issue #15)
```

### SaveNow Download API

```
Endpoint: https://p.savenow.to/ajax/download.php
Fallbacks: ['https://p.savenow.to', 'https://p.lbserver.xyz']
API Key: 'dfcb6d76f2f6a9894gjkege8a4ab232222' (default, có thể override)
Flow:
  1. Gửi request download với video ID + API key
  2. Polling progress mỗi 3 giây (không có backoff - Issue #10)
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
- **UI:** Thêm nút download vào player controls
- **Issues:** #10 (polling không backoff), #14 (duplicate code block), #20 (legacy Spanish DOM IDs)

### 2. Like/Dislike Bar (`src/features/like-dislike-bar.js`)

- **Mục đích:** Hiển thị thanh tỷ lệ like/dislike + số dislike
- **API:** ReturnYouTubeDislike
- **Parsing:** `parseCountText()` — heuristic cho locale-dependent number formatting. Hỗ trợ K, M, mil, nghìn, triệu, N, Tr
- **Issues:** #7 (`localStorage` vs `GM_getValue`), #9 (locale-dependent parsing)

### 3. Time Stats (`src/features/time-stats.js`)

- **Mục đích:** Theo dõi thời gian xem video/shorts, thống kê session, daily, weekly
- **Storage:** `YT_TOTAL_USAGE`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`, `YT_DETAILED_STATS`, `YT_DAILY_STATS`, `YT_SESSION_START`
- **UI:** Panel stats cards + weekly chart + top videos list
- **Update interval:** 1 giây (check `document.visibilityState`, delta ≤ 10s)
- **Save interval:** 30 giây
- **Issues:** #18 (2 formatter functions trùng lặp), #25 (thiếu input validation cho delta)

### 4. Wave Visualizer (`src/features/wave-visualizer.js`)

- **Mục đích:** Visualizer sóng âm thanh real-time dùng Web Audio API
- **Tech:** AudioContext → AnalyserNode → Canvas (requestAnimationFrame loop)
- **Constants:** `SMOOTHING_FACTOR = 0.05`, `CANVAS_HEIGHT = 240`
- **Issue #6:** RAF loop không được cleanup khi SPA navigation → memory leak + AudioContext exhaustion

### 5. Bookmarks (`src/features/bookmarks.js`)

- **Mục đích:** Lưu timestamp đánh dấu trong video
- **Storage:** `GM_getValue('YT_BOOKMARKS', '[]')`
- **UI:** Thêm nút bookmark vào player, danh sách bookmarks

### 6. Continue Watching (`src/features/continue-watching.js`)

- **Mục đích:** Lưu vị trí đang xem và tự động resume
- **Storage:** `GM_setValue('YT_CONTINUE_VIDEO', ...)`
- **Issue #11:** `getCurrentVideoMeta()` query DOM trên mỗi `timeupdate` event (~4 lần/giây)

### 7. Translate Comments (`src/features/translate-comments.js`)

- **Mục đích:** Dịch bình luận YouTube sang ngôn ngữ khác
- **API:** Google Translate (không chính thức)
- **Issue #15:** `const idiomaDestino = 'vi'` hardcoded — không đọc từ settings

### 8. Effects Mini-game (`src/features/effects.js`)

- **Mục đích:** Game nhỏ bắn súng bên trong panel
- **Input:** Keyboard (Space, Arrow keys)
- **Issue #16:** Reference `assets/gio.png` — file không tồn tại, luôn trigger onerror fallback

### 9. Player Size (`src/features/player-size.js`)

- **Mục đích:** Cho phép người dùng điều chỉnh kích thước video player
- **Settings:** `settings.playerSize` — giá trị CSS width
- **Issue #17:** Không có `yt-navigate-finish` handler — chỉ chạy 1 lần khi load

### 10. Shorts Channel Name (`src/features/shorts-channel-name.js`)

- **Mục đích:** Hiển thị tên kênh trên YouTube Shorts (thường bị ẩn)
- **Tech:** IntersectionObserver + fetch `/watch?v=` để lấy tên kênh
- **Issue #5:** Promise chain memory leak pattern (`rt.fetchChain = rt.fetchChain.then(...)`)
- **Issue #24:** Duplicate DOM selectors với `lockup-cached-stats.js`

### 11. Cached Stats on Video Cards (`src/features/lockup-cached-stats.js`)

- **Mục đích:** Hiển thị thống kê đã cache trên video lockup cards
- **Issue #24:** Duplicate DOM selectors với `shorts-channel-name.js`

---

## Build Pipeline

### Dev Mode (Rollup)

```
src/legacy-full.js → Rollup → dist/dev.user.js
                     └─ IIFE format
                     └─ Inline sourcemap
                     └─ Userscript header
```

- Auto-reload khi file thay đổi (`-w` flag)
- Chỉ build từ legacy code (không modular)
- Dùng cho dev nhanh, không cần build phức tạp

### Production Build (Vite + vite-plugin-monkey)

```
src/main.js → Vite → dist/youtube-tools-userscript.user.js
   ├── ES6 imports tree-shaken
   ├── SCSS compiled to CSS
   ├── vite-plugin-monkey tạo userscript header
   └── @require iziToast CDN
```

- Entry point: `src/main.js` (import tất cả modular features + legacy)
- `vite-plugin-monkey` tự động generate metadata block (name, version, grant, match, require)
- iziToast được load qua CDN (không bundle vào)

### Sync Legacy

```bash
node scripts/sync-legacy.mjs
```

- Đọc `script.js` (file userscript hoàn chỉnh)
- Strip userscript header
- Unwrap IIFE
- Ghi vào `src/legacy-full.js`

### Verify Parity

```bash
node scripts/verify-parity.mjs
```

- Kiểm tra `legacy-full.js` khớp với `script.js`
- Kiểm tra dist bundle chứa đủ các runtime marker cần thiết

---

## Cấu trúc thư mục đầy đủ

```
C:\Users\FPTSHOP\Downloads\Aji\
│
├── README.md                   # Project overview (this file's sibling)
├── PROJECT.md                  # Tài liệu kiến trúc (file này)
├── ERROR_ANALYSIS.md           # 28 issues chi tiết
├── CHECKLIST.md                # Checklist fix từng issue
├── CHANGELOG.md                # (optional) Lịch sử phiên bản
│
├── package.json                # v2.4.3.2, scripts, deps
├── vite.config.js              # Production build config
├── rollup.config.dev.js        # Dev build config
├── .eslintrc.json              # ESLint v9 flat config
├── .prettierrc                 # Prettier config
├── .gitignore
│
├── src/
│   ├── main.js                 # Entry point — imports everything
│   ├── legacy-full.js          # 8,814-line monolithic legacy
│   │
│   ├── config/
│   │   ├── flags.js            # Feature flags (__ytModularWaveActive)
│   │   └── constants.js        # API URLs, keys, wave constants
│   │
│   ├── features/
│   │   ├── bookmarks.js        # Video bookmarks
│   │   ├── continue-watching.js # Resume playback (607 lines)
│   │   ├── download.js         # MP3/MP4 download engine
│   │   ├── effects.js          # Mini-game (329 lines)
│   │   ├── like-dislike-bar.js # RYD integration + bar
│   │   ├── lockup-cached-stats.js # Cached stats cards
│   │   ├── player-size.js      # Player width adjustment
│   │   ├── shorts-channel-name.js # Shorts channel names (204 lines)
│   │   ├── time-stats.js       # Usage tracking + stats panel data
│   │   ├── translate-comments.js # Comment translation
│   │   └── wave-visualizer.js  # Audio visualizer (321 lines)
│   │
│   ├── ui/
│   │   ├── panel.js            # Draggable panel UI (268 lines)
│   │   └── styles.scss         # 917-line SCSS (monolithic)
│   │
│   └── utils/
│       ├── dom.js              # $e, $cl, $ap, $id, $m, isYTMusic
│       ├── helpers.js          # FormatterNumber, getCurrentVideoId
│       ├── runtime.js          # __ytToolsRuntime state (79 lines)
│       ├── state.js            # 54 getter/setter boilerplate (119 lines)
│       ├── storage.js          # GM_getValue/GM_setValue wrapper
│       └── trusted-types.js    # Trusted Types + CSP-safe HTML
│
├── scripts/
│   ├── sync-legacy.mjs         # Sync script.js → legacy-full.js
│   └── verify-parity.mjs       # Parity checker
│
└── dist/
    ├── dev.user.js             # Dev build output
    └── youtube-tools-userscript.user.js  # Production build
```

---

## Known Issues & Technical Debt

### Thống kê hiện tại (2026-05-10)

| Phase               | Total  | Done  | Partial | Remaining |
| ------------------- | ------ | ----- | ------- | --------- |
| Phase 1: Sửa Ngay   | 6      | 2     | 0       | 4         |
| Phase 2: Kiến Trúc  | 7      | 0     | 0       | 7         |
| Phase 3: Chất Lượng | 7      | 0     | 0       | 7         |
| Phase 4: Dọn Dẹp    | 8      | 1     | 1       | 6         |
| **TOTAL**           | **28** | **3** | **1**   | **24**    |

### Top Priority Issues

| #   | Severity    | Vấn đề                                        | Impact                                                  |
| --- | ----------- | --------------------------------------------- | ------------------------------------------------------- |
| 1   | 🔴 Critical | Dual codebase — 2 implementations mỗi feature | Duplicate MutationObservers, events, storage writes     |
| 6   | 🟠 High     | Wave visualizer RAF loop không cleanup        | Memory leak, AudioContext exhaustion sau ~6 navigations |
| 7   | 🟠 High     | localStorage vs GM_getValue inconsistency     | Settings invisible giữa các feature                     |
| 4   | 🟠 High     | State fragmentation 4 nguồn                   | Không đồng bộ, data inconsistency                       |
| 5   | 🟠 High     | Promise chain memory leak                     | Memory leak dưới sustained load                         |
| 14  | 🟡 Medium   | Duplicate code block trong download.js        | Dead code                                               |

Xem chi tiết: [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md) và [CHECKLIST.md](CHECKLIST.md)

---

## CSP & Security

Dự án dùng **Trusted Types** để tuân thủ Content Security Policy của YouTube:

```javascript
// src/utils/trusted-types.js
export function safeHTML(html) {
  /* ... */
}
export function setHTML(el, html) {
  /* ... */
}
```

Panel UI dùng `setHTML()` để inject HTML template một cách an toàn thay vì `innerHTML` trực tiếp.

## GM API Grants

```javascript
'GM_info'; // Script metadata
'GM_addStyle'; // Inject CSS
'GM_setValue'; // Write persistent storage
'GM_getValue'; // Read persistent storage
'unsafeWindow'; // Access window object
'GM_registerMenuCommand'; // Tampermonkey menu
```

---

## Migration Roadmap

Mục tiêu cuối cùng: **xóa `import './legacy-full.js'`**

1. ✅ Phase 1 — Fix critical bugs đang chặn migration
2. ⬜ Phase 2 — Thiết kế unified AppState, sửa kiến trúc core
3. ⬜ Phase 3 — Cải thiện code quality, consistency
4. ⬜ Phase 4 — Extract inline HTML, split CSS, cleanup

Sau Phase 4, tất cả feature trong legacy-full.js sẽ có phiên bản modular tương đương, cho phép xóa legacy code hoàn toàn.
