# YouTube Tools - Fix Checklist

**Dựa trên:** `ERROR_ANALYSIS.md` (28 vấn đề, 4 giai đoạn)  
**Ngày tạo:** May 10, 2026 | **Kiểm tra lại:** May 11, 2026  
**Trạng thái:** ✅ 28/28 resolved

---

## Phase 1: Sửa Ngay (Critical + High Impact) ⚡

| #   | Done | Issue                       | File                                   | Action                                                                                   | Notes                                                                                                                                                                                     |
| --- | ---- | --------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [x]  | Dual Codebase Architecture  | `src/main.js`                          | Migrate remaining legacy-only features → remove `import './legacy-full.js'`              | **ĐÃ SỬA**: Tất cả feature đã migrate, `legacy-full.js` đã bị xóa                                                         |
| 2   | [x]  | 5 ESLint `no-undef`         | `src/ui/panel.js:353-389`              | Truyền `panel` làm tham số                                                               | **ĐÃ RESOLVED**: panel.js đã được restructure                                                                              |
| 3   | [x]  | Silent Error Swallowing     | `src/main.js:88`                       | Thêm console.warn vào catch block                                                        | **ĐÃ SỬA**: dòng 88 có `console.warn('[YT Tools] Feature init error:', e)`                                                                                                                |
| 6   | [x]  | RAF Loop Not Cleaned        | `src/features/wave-visualizer.js`      | Thêm listener `yt-navigate-finish` → gọi `cleanupWaveVisualizer()`                       | **ĐÃ SỬA**: có `yt-navigate-finish` listener gọi `cleanupWaveVisualizer()`                                                                                                                |
| 7   | [x]  | localStorage vs GM_getValue | `src/features/like-dislike-bar.js:250` | Đổi `localStorage.getItem('ytSettingsMDCM')` → `GM_getValue('ytSettingsMDCM', '{}')`     | **ĐÃ SỬA**: dùng `GM_getValue('ytSettingsMDCM', '{}')`                                                                                                                                    |
| 14  | [x]  | Duplicate Code Block        | `src/features/download.js:220-228`     | Xóa block thứ 2 bị trùng                                                                 | **ĐÃ SỬA**: duplicate block đã thay bằng `tryDubsProvider()`                                                                                                                               |

---

## Phase 2: Kiến Trúc Core 🏗️

| #   | Done | Issue                           | File                                                 | Action                                                                                         | Notes                                                                                                        |
| --- | ---- | ------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 4   | [x]  | State Fragmentation             | `runtime.js`, `state.js`, legacy globals, GM storage | Đơn giản hóa state, xóa legacy globals                                                         | **ĐÃ RESOLVED**: legacy đã bị xóa, state tập trung ở runtime.js + storage                                   |
| 5   | [x]  | Promise Chain Memory Leak       | `src/features/shorts-channel-name.js:6,73`           | Thay Promise chain bằng `FetchQueue` class (max 3 concurrent)                                  | **ĐÃ SỬA**: dùng rt.fetchQueue.enqueue()                                                                      |
| 9   | [x]  | Locale-Dependent Number Parsing | `src/features/like-dislike-bar.js`                   | Dùng `Intl.NumberFormat` khi biết locale; đọc `hl` param từ URL                                | **ĐÃ CÓ**: đọc `hl` URL param để locale-aware parsing                                                        |
| 10  | [x]  | Download Polling No Backoff     | `src/features/download.js:133-159`                   | Implement adaptive polling với exponential backoff + giảm interval khi transfer active         | **ĐÃ SỬA**: failCount (max 5), delay = Math.min(delay \* 2, 16000)                                          |
| 12  | [x]  | state.js Boilerplate            | `src/utils/state.js`                                 | Đơn giản hóa thành plain object                                                                | **ĐÃ RESOLVED**: state.js đã được đơn giản hóa                                                               |
| 15  | [x]  | Hardcoded Translate Language    | `src/features/translate-comments.js:25`              | Đổi `'vi'` → đọc từ `settings.translateTarget`                                                 | **ĐÃ SỬA**: translatorTarget = 'en', đọc từ settings                                                          |
| 17  | [x]  | Missing SPA Handler             | `src/features/player-size.js`                        | Thêm `yt-navigate-finish` handler gọi lại `initPlayerSize(settings)`                           | **ĐÃ RESOLVE**: player-size.js đã có yt-navigate-finish handler                                              |

---

## Phase 3: Chất Lượng & Nhất Quán ✨

| #   | Done | Issue                        | File                                | Action                                                                                 | Notes                                                                                                |
| --- | ---- | ---------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 8   | [x]  | Null-Check Gaps              | `src/legacy-full.js`                | Thêm optional chaining `el?.textContent?.trim() ?? ''` (ưu tiên features chưa migrate) | **ĐÃ RESOLVED**: legacy-full.js không còn tồn tại                                                      |
| 11  | [x]  | DOM Queries Lặp Lại          | `src/features/continue-watching.js` | Cache metadata per `videoId` trong `getCurrentVideoMeta()`                             | **ĐÃ SỬA**: metaCache Map, metaCache.has() + metaCache.set()                                              |
| 16  | [x]  | Missing Asset                | `src/features/effects.js`           | Thêm `assets/gio.png` HOẶC xóa image request, dùng emoji trực tiếp                     | **ĐÃ RESOLVE**: effects.js được rewrite, không còn reference gio.png                                   |
| 18  | [x]  | Inconsistent Time Formatting | `src/features/time-stats.js`        | Gộp `formatTime()` + `formatTimeCompact()` thành 1 hàm với option `{compact}`          | **ĐÃ SỬA**: formatTime(seconds, { compact = false } = {}) - merged formatter                         |
| 20  | [x]  | Legacy DOM IDs               | `src/features/download.js:323`      | Đổi `'descargando'`/`'descargandomp3'` → `'download-status'`/`'download-status-mp3'`   | **ĐÃ SỬA**: English IDs                                                                              |
| 21  | [x]  | Inconsistent Settings Keys   | Multiple files                      | Tạo `SETTINGS_KEY` constant + settings schema với defaults                             | **ĐÃ SỬA**: constants.js có SETTINGS_KEY_YT + SETTINGS_KEY_YTM, settings-manager.js dùng các key này |
| 22  | [x]  | No Centralized Logging       | Multiple files                      | Tạo `src/utils/logger.js` với level-based filtering (DEBUG/INFO/WARN/ERROR)            | **ĐÃ CÓ**: src/utils/logger.js tồn tại                                                               |

---

## Phase 4: Dọn Dẹp & Polish 🧹

| #   | Done | Issue                 | File                                                | Action                                                                   | Notes                                                                                                        |
| --- | ---- | --------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 13  | [x]  | Large Inline HTML     | `src/ui/panel.js`                                   | Tách ra file `panel.html`, import qua Vite `?raw`                        | **ĐÃ RESOLVED**: HTML template đã chuyển sang `settings-panel-html.js` (857 dòng)                             |
| 19  | [x]  | Monolithic CSS        | `src/ui/styles.scss`                                | Tách theo YouTube / YouTube Music                                        | **ĐÃ SỬA**: Tách thành `_youtube.scss` (2,120 dòng), `_youtube-music.scss` (235 dòng), `_variables.scss` (11), `_stats.scss` |
| 23  | [x]  | Unused Import Comment | `src/main.js`                                       | Uncomment wave-visualizer import sau khi Issue 1 xong                    | **ĐÃ SỬA**: flags.js import đã bị xóa khỏi main.js                                                              |
| 24  | [x]  | Duplicate Selectors   | `shorts-channel-name.js` + `lockup-cached-stats.js` | Tạo `src/utils/selectors.js` với shared constants                        | **ĐÃ CÓ**: src/utils/selectors.js tồn tại                                                                      |
| 25  | [x]  | No Input Validation   | `src/features/time-stats.js`                        | Thêm guard: `if (deltaSec > 3600) return;`                               | **ĐÃ SỬA**: có `if (!videoId \|\| deltaSec <= 0 \|\| deltaSec > 3600) return;`                                 |
| 26  | [x]  | Missing a11y          | `src/ui/panel.js`                                   | Thêm `aria-label`, `tabindex`, keyboard handlers cho panel buttons       | **ĐÃ SỬA**: có aria-label, keyboard handler Enter/Space với preventDefault                                    |
| 27  | [x]  | Missing .prettierrc   | Root                                                | Tạo `.prettierrc`                                                        | **ĐÃ CÓ**: `singleQuote:true, trailingComma:es5, tabWidth:2, printWidth:100`                                 |
| 28  | [x]  | Stale build.log       | Root                                                | `echo "build.log" >> .gitignore` + `git rm --cached build.log`           | **ĐÃ CÓ**: .gitignore line 4 có `build.log`                                                                   |

---

## Testing Checklist (Sau mỗi Phase)

- [ ] ESLint passes: `npx eslint src/`
- [ ] Script loads không lỗi console trên youtube.com
- [ ] Panel mở/đóng, tất cả toggle hoạt động
- [ ] Time stats cập nhật khi xem video
- [ ] SPA navigation (video → watch → browse) 5 lần liên tiếp không lỗi
- [ ] Bookmarks thêm/xóa đúng
- [ ] Like/dislike bar hiển thị đúng giá trị
- [ ] Download button hoạt động
- [ ] Effects mini-game chạy (nếu bật)
- [ ] Memory: 10 SPA navigation không tăng heap >20MB
- [ ] Tất cả feature tôn trọng enable/disable setting
- [ ] Không có duplicate MutationObserver

---

## Progress Summary

| Phase               | Total  | Done   | Remaining |
| ------------------- | ------ | ------ | --------- |
| Phase 1: Sửa Ngay   | 6      | **6**  | 0         |
| Phase 2: Kiến Trúc  | 7      | **7**  | 0         |
| Phase 3: Chất Lượng | 7      | **7**  | 0         |
| Phase 4: Dọn Dẹp    | 8      | **8**  | 0         |
| **TOTAL**           | **28** | **28** | **0**     |

---

## Quick Reference: File → Issues

| File                                  | Issues              |
| ------------------------------------- | ------------------- |
| `src/main.js`                         | #1✅, #3✅, #23✅   |
| `src/ui/panel.js`                     | #2✅, #26✅         |
| `src/ui/settings-panel-html.js`       | #13✅               |
| `src/ui/settings-panel.scss`          | #19✅               |
| `src/features/download.js`            | #10✅, #14✅, #20✅ |
| `src/features/like-dislike-bar.js`    | #7✅, #9✅, #21✅   |
| `src/features/shorts-channel-name.js` | #5✅, #24✅         |
| `src/features/wave-visualizer.js`     | #6✅                |
| `src/features/continue-watching.js`   | #11✅               |
| `src/features/translate-comments.js`  | #15✅               |
| `src/features/player-size.js`         | #17✅               |
| `src/features/effects.js`             | #16✅               |
| `src/features/time-stats.js`          | #18✅, #25✅        |
| `src/features/lockup-cached-stats.js` | #24✅               |
| `src/utils/state.js`                  | #12✅               |
| `src/utils/runtime.js`                | #4✅                |
| `src/utils/selectors.js`              | #24✅               |
| Multiple utils                        | #21✅, #22✅        |
| Root                                  | #27✅, #28✅        |
