# AGENTS.md — Hướng dẫn cho AI Agent

> **Dự án:** YouTube Tools Userscript  
> **Version:** v2.4.3.2  
> **Ngày tạo:** 10/05/2026  
> **Ngôn ngữ:** Tiếng Việt (primary), English (code/docs)

---

## 1. Tổng quan dự án

Đây là một **userscript** đa năng cho YouTube, chạy trên **Tampermonkey / Greasemonkey / Violentmonkey**. Script bổ sung nhiều tính năng vào giao diện YouTube: tải video/audio, hiển thị dislike, thống kê thời gian xem, đánh dấu video, visualizer sóng nhạc, dịch bình luận, v.v.

### Mục tiêu dài hạn

- **Chuyển đổi kiến trúc:** Từ monolithic (`legacy-full.js` ~8800 dòng) sang **ES modules** (`src/features/*.js`)
- **Loại bỏ dual codebase:** Hiện tại cả hai cùng chạy, cần xóa `legacy-full.js` sau khi migration hoàn tất
- **Thêm test coverage:** Hiện chưa có test

---

## 2. Cấu trúc thư mục

```
C:\Users\FPTSHOP\Downloads\Aji\
├── src/
│   ├── main.js                    # 🚀 Entry point (ES Modules) — import cả modular + legacy
│   ├── legacy-full.js             # ⚠️ Monolithic legacy (~8800 dòng) — sẽ bị xóa sau migration
│   ├── config/
│   │   ├── constants.js           # API endpoints, API key, constants sóng nhạc
│   │   └── flags.js               # Feature flag: tắt wave visualizer trong modular
│   ├── features/                  # 🎯 Các tính năng modular
│   │   ├── bookmarks.js           # Đánh dấu timestamp trong video
│   │   ├── continue-watching.js   # Tiếp tục xem video đang dở
│   │   ├── download.js            # Tải video/audio (SaveNow + Dubs API)
│   │   ├── effects.js             # Mini-game tương tác (né bom)
│   │   ├── like-dislike-bar.js    # Thanh like/dislike (ReturnYouTubeDislike API)
│   │   ├── lockup-cached-stats.js # Thống kê trên thumbnail video cards
│   │   ├── player-size.js         # Điều chỉnh kích thước player
│   │   ├── shorts-channel-name.js # Hiển thị tên kênh trên Shorts
│   │   ├── time-stats.js          # Thống kê thời gian xem (usage, session, daily, top videos, weekly chart)
│   │   ├── translate-comments.js  # Dịch bình luận (Google Translate API)
│   │   └── wave-visualizer.js     # Sóng nhạc real-time (Web Audio API)
│   ├── ui/
│   │   ├── panel.js               # Giao diện panel thống kê (stats panel)
│   │   └── styles.scss            # SCSS styles cho panel
│   └── utils/
│       ├── dom.js                 # DOM helpers: $e, $id, $m, $cl, $sp, $ap
│       ├── helpers.js             # Notify, getCurrentVideoId, formatTimeShort, isVersionNewer, checkNewVersion
│       ├── runtime.js             # 🧠 Global state object (__ytToolsRuntime)
│       ├── state.js               # State riêng cho wave visualizer (54 getter/setter)
│       ├── storage.js             # GM_getValue/GM_setValue wrapper + cache helpers
│       └── trusted-types.js       # Trusted Types policy (CSP-safe HTML injection)
├── dist/
│   └── youtube-tools-userscript.user.js  # Production build output
├── scripts/
│   ├── sync-legacy.mjs            # Đồng bộ code legacy ↔ modular (technical debt)
│   └── verify-parity.mjs          # Kiểm tra tương đương output giữa Rollup và Vite
├── script.js                      # ⚠️ Artifact cũ — standalone userscript
├── rollup.config.dev.js           # Dev build: Rollup, entry: main.js
├── vite.config.dev.js             # Dev build: Vite, entry: legacy-full.js
├── vite.config.js                 # Production build: Vite, entry: legacy-full.js
├── eslint.config.js               # ESLint v9 flat config
├── package.json                   # Dependencies & scripts
├── ERROR_ANALYSIS.md              # Báo cáo phân tích lỗi (28 issues)
└── README.md                      # Tài liệu người dùng
```

---

## 3. Công nghệ & Môi trường

| Công nghệ                        | Mục đích                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| **JavaScript ES6+** (ES Modules) | Code chính cho các tính năng                                                                     |
| **SCSS**                         | CSS cho panel UI                                                                                 |
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

### `src/main.js` — Modular Entry Point

```
1. Import tất cả feature modules (bookmarks, download, time-stats, like-dislike, ...)
2. Import './legacy-full.js' ← ⚠️ 8800 dòng duplicate logic, chạy song song
3. loadSettings() — đọc cấu hình từ GM storage
4. createPanel() — tạo giao diện panel
5. initTimeStats() — bắt đầu theo dõi thời gian
6. setupDownloadClickHandler() — gắn sự kiện download global
7. Chạy từng feature với settings (có try-catch bọc lỗi)
8. updateUI() — cập nhật stats
9. setTimeout(checkNewVersion, 3000) — kiểm tra phiên bản mới
10. Lắng nghe 'yt-navigate-finish' (SPA navigation) → reinit tất cả feature
11. Lắng nghe 'yt-tools-settings-changed' → reinit với settings mới
```

### Cơ chế quan trọng

- **`__ytToolsRuntime.settingsLoaded`** — flag ngăn `scheduleApplySettings` ghi đè config mặc định
- **`yt-navigate-finish`** — YouTube là SPA, event này phát ra khi chuyển trang
- **`window.__ytToolsRuntime`** — export từ modular runtime.js để legacy code dùng chung

---

## 5. State Management

State hiện phân mảnh ở **4 nơi**:

| Nơi                    | File            | Mô tả                                                                                                                   |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `__ytToolsRuntime`     | `runtime.js`    | Global state: settingsLoaded, bookmark state, continueWatching, shortsChannelName, dislikesCache, interval/observer IDs |
| `state` object         | `state.js`      | State riêng cho wave visualizer: canvas, audioCtx, analyser, source, animationId, v.v. (54 getter/setter)               |
| Module-level variables | `time-stats.js` | `usageTime`, `videoTime`, `shortsTime`, `detailedStats`, `dailyStats`                                                   |
| GM storage             | `storage.js`    | Bookmarks, Continue Watching, Shorts Channel Cache, Likes/Dislikes Cache                                                |

### Lưu ý khi sửa state

- `runtime.js` đã export `__ytToolsRuntime` ra `window.__ytToolsRuntime`
- `legacy-full.js` có bản sao `__ytToolsRuntime` riêng với thêm field `nonstopPlayback`, `audioOnly` — **chưa đồng bộ với runtime.js**
- `state.js` có quá nhiều boilerplate getter/setter — dự định thay bằng Proxy/class

---

## 6. Storage Keys

```js
STORAGE_KEYS_MDCM = {
  BOOKMARKS: 'ytBookmarksMDCM',
  CONTINUE_WATCHING: 'ytContinueWatchingMDCM',
  SHORTS_CHANNEL_CACHE: 'ytShortsChannelCacheMDCM',
  LIKES_DISLIKES_CACHE: 'ytLikesDislikesCacheMDCM',
  VERSION_CHECK_LAST: 'ytVersionCheckLastMDCM',
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

| Command                 | Mô tả                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run dev`           | Dev mode với Rollup — watch `src/main.js`, output `dist/dev.user.js` |
| `npm run build`         | Production build với Vite — entry `src/legacy-full.js`               |
| `npm run build:full`    | Sync legacy + build production                                       |
| `npm run lint`          | ESLint check                                                         |
| `npm run lint:fix`      | ESLint auto-fix                                                      |
| `npm run format`        | Prettier format                                                      |
| `npm run verify:parity` | Kiểm tra đồng bộ output Rollup ↔ Vite                                |
| `npm run verify`        | Build + verify parity + lint + format check                          |

---

## 8. Các vấn đề đã biết (Known Issues)

Xem chi tiết trong `ERROR_ANALYSIS.md`. Tóm tắt:

### 🔴 Critical

1. **Dual Codebase** — `main.js` import cả modular lẫn `legacy-full.js`, mọi feature chạy 2 lần
2. **Thiếu test hoàn toàn** — không có test framework

### 🟠 High

3. **State fragmentation** — 4 nơi quản lý state
4. **fetchChain memory leak** — `shorts-channel-name.js` Promise chain tích lũy
5. **RAF loop không cleanup** — wave visualizer không hủy khi SPA navigate
6. **Null-check gaps** — legacy code không có null guard
7. **Locale parsing** — `parseCountText` sai với một số locale
8. **Hai hệ thống build** — Rollup và Vite có thể tạo output khác nhau

### Các lỗi đã fix gần đây

- Panel scope error (5 ESLint errors) → đã fix
- Unused variables trong main.js → đã fix
- `window.open()` popup blocker → đã thay bằng `createElement('a')` + `click()`
- DOM null-checks trong download.js → đã fix

---

## 9. Quy ước code (Conventions)

### Biến & Hàm

```js
// ❌ KHÔNG dùng (đang tồn tại, cần đổi dần)
const $e = el => document.querySelector(el); // quá ngắn, khó hiểu
const $m = el => document.querySelectorAll(el);
const $cl = el => document.createElement(el);
const $ap = el => document.body.appendChild(el);

// ✅ NÊN dùng (tên rõ ràng hơn)
const qs = sel => document.querySelector(sel);
const qsAll = sel => document.querySelectorAll(sel);
const createEl = tag => document.createElement(tag);
const appendEl = el => document.body.appendChild(el);
```

### Console Logging

```js
// ✅ Dùng prefix [YT Tools] để dễ filter
console.log('[YT Tools] Modular panel created');
console.warn('[YT Tools] Init error:', e);
console.error('[YT Tools] Failed to create panel:', e);
```

### Error Handling

```js
// ✅ LUÔN log lỗi, không nuốt silently
try {
  fn(arg);
} catch (e) {
  console.warn('[YT Tools] Feature init failed:', e);
}

// ❌ KHÔNG nuốt lỗi
try {
  fn(arg);
} catch (_e) {} // ← không được dùng
```

### DOM Queries

```js
// ✅ LUÔN null-check trước khi truy cập .style, .textContent, v.v.
const el = document.querySelector('.selector');
if (el) {
  el.style.display = 'none';
}

// ✅ Dùng optional chaining
const text = el?.textContent?.trim() ?? '';
```

### Settings

```js
// ✅ Dùng GM_getValue/GM_setValue (GM storage)
const settings = GM_getValue('ytSettingsMDCM', '{}');
const parsed = JSON.parse(settings);

// ❌ KHÔNG dùng localStorage (trong Tampermonkey, GM storage ≠ localStorage)
// const settings = localStorage.getItem('ytSettingsMDCM'); // ← SAI
```

---

## 10. Feature Checklist

| Feature             | Modular | Legacy | Ghi chú                                                   |
| ------------------- | ------- | ------ | --------------------------------------------------------- |
| Bookmarks           | ✅      | ✅     | Chạy 2 lần                                                |
| Continue Watching   | ✅      | ✅     | Chạy 2 lần                                                |
| Download            | ✅      | ✅     | Modular đã fix null-check + popup; legacy chưa            |
| Like/Dislike Bar    | ✅      | ✅     | Chạy 2 lần                                                |
| Shorts Channel Name | ✅      | ✅     | Chạy 2 lần                                                |
| Time Stats          | ✅      | ✅     | Modular có thêm detailed stats, daily, weekly, top videos |
| Translate Comments  | ✅      | ✅     | Modular dùng MutationObserver; legacy dùng setInterval    |
| Wave Visualizer     | ✅      | ✅     | Modular có cleanup SPA; legacy chưa                       |
| Effects (mini-game) | ✅      | ❌     | Chỉ có trong modular                                      |
| Player Size         | ✅      | ❌     | Chỉ có trong modular                                      |
| Lockup Cached Stats | ✅      | ✅     | Chạy 2 lần                                                |
| Nonstop Playback    | ❌      | ✅     | Chỉ có trong legacy                                       |
| Audio Only Mode     | ❌      | ✅     | Chỉ có trong legacy                                       |
| Panel UI            | ✅      | ❌     | Panel stats mới trong modular                             |

---

## 11. Hướng dẫn sửa lỗi thường gặp

### Panel không hiển thị

1. Kiểm tra `createPanel()` trong `main.js` có được gọi không
2. Kiểm tra `panel.js` import `styles.scss` chưa
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
2. Kiểm tra `PROCESSED_FLAG` — có thể legacy đã xử lý trước
3. Kiểm tra `cleanupWaveVisualizer()` được gọi khi SPA navigate chưa

---

## 12. Build System

### Rollup (Dev)

- Config: `rollup.config.dev.js`
- Entry: `src/main.js` (modular)
- Output: `dist/dev.user.js`
- Plugin: `@rollup/plugin-node-resolve`, `@rollup/plugin-terser`

### Vite (Production)

- Config: `vite.config.js`
- Entry: `src/legacy-full.js` (monolithic)
- Output: `dist/youtube-tools-userscript.user.js`
- Plugin: `vite-plugin-monkey` (tự động tạo `==UserScript==` header)

### Vite (Dev)

- Config: `vite.config.dev.js`
- Entry: `src/legacy-full.js`
- Plugin: `vite-plugin-monkey`

### ⚠️ Lưu ý quan trọng

- **Rollup và Vite dùng entry point khác nhau** → rủi ro divergence
- **Production build entry là `legacy-full.js`**, không phải `main.js`
- Script `verify:parity` được dùng để kiểm tra output tương đương

---

## 13. ESLint Config

```js
// eslint.config.js — flat config
export default [
  { ignores: ['node_modules/**', 'dist/**', 'script.js', 'src/legacy-full.js'] },
  { languageOptions: { globals: { ...browserGlobals, ...userscriptGlobals } } },
];
```

- **Các file bị ignore:** `dist/`, `node_modules/`, `script.js`, `src/legacy-full.js`
- **Globals được khai báo:** browser APIs + GM APIs + iziToast + unsafeWindow

---

## 14. Checklist trước khi commit

- [ ] `npm run lint` pass (0 errors, 0 warnings)
- [ ] `npm run format:check` pass
- [ ] `npm run build:full` thành công
- [ ] File `dist/youtube-tools-userscript.user.js` được tạo
- [ ] Không import thêm `legacy-full.js` vào code mới
- [ ] Tất cả feature có try-catch bọc lỗi
- [ ] DOM queries có null-check
- [ ] Storage dùng `GM_getValue`/`GM_setValue`, không dùng `localStorage`

---

## 15. Liên hệ & Tài liệu tham khảo

- **README.md** — Tài liệu người dùng
- **ERROR_ANALYSIS.md** — Báo cáo phân tích lỗi chi tiết (28 issues)
- **package.json** — Scripts & dependencies
- **Repository:** https://github.com/DeveloperMDCM/youtube-tools

---

_File này được tạo để giúp AI agent (như GitHub Copilot, Claude, Gemini, v.v.) nhanh chóng nắm bắt cấu trúc, luồng hoạt động, và các vấn đề cần lưu ý khi làm việc với dự án YouTube Tools._
