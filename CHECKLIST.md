# YouTube Tools - Fix Checklist

**Dựa trên:** `ERROR_ANALYSIS.md` (28 vấn đề, 4 giai đoạn)  
**Ngày tạo:** May 10, 2026 | **Kiểm tra lại:** May 10, 2026  
**Hướng dẫn:** Đánh dấu `[x]` khi hoàn thành. Ghi chú thêm vào cột Notes.

---

## Phase 1: Sửa Ngay (Critical + High Impact) ⚡

| # | Done | Issue | File | Action | Notes |
|---|------|-------|------|--------|-------|
| 1 | [ ] | Dual Codebase Architecture | `src/main.js:12,34` | Lập feature parity checklist giữa modular vs legacy; chọn 1 implementation cho mỗi feature | Vẫn import legacy-full.js |
| 2 | [x] | 5 ESLint `no-undef` | `src/ui/panel.js:353-389` | ~~Truyền `panel` làm tham số~~ | **ĐÃ RESOLVED**: panel.js restructure 389→268 dòng, hàm setupTabs/setupToggles/setupFormatPills không còn tồn tại |
| 3 | [x] | Silent Error Swallowing | `src/main.js:83-97` | ~~Thêm console.warn vào catch block~~ | **ĐÃ SỬA**: dòng 88 có `console.warn('[YT Tools] Feature init error:', e)` |
| 6 | [x] | RAF Loop Not Cleaned | `src/features/wave-visualizer.js` | ~~Thêm listener `yt-navigate-finish` → gọi `cleanupWaveVisualizer()`~~ | **ĐÃ SỬA**: dòng 28-31 có `yt-navigate-finish` listener gọi `cleanupWaveVisualizer()` + reset `waveVisualizerUnloadBound` |
| 7 | [x] | localStorage vs GM_getValue | `src/features/like-dislike-bar.js:250` | ~~Đổi `localStorage.getItem('ytSettingsMDCM')` → `GM_getValue('ytSettingsMDCM', '{}')`~~ | **ĐÃ SỬA**: dòng 250 dùng `GM_getValue('ytSettingsMDCM', '{}')` thay vì localStorage |
| 14 | [x] | Duplicate Code Block | `src/features/download.js:220-228` | ~~Xóa dòng 225-228 (block thứ 2 bị trùng)~~ | **ĐÃ SỬA**: duplicate block đã được thay bằng `console.warn('[YT Tools] SaveNow failed, trying dubs.io', lastErr)` + `await tryDubsProvider()` (dòng 225-226) |

---

## Phase 2: Kiến Trúc Core 🏗️

| # | Done | Issue | File | Action | Notes |
|---|------|-------|------|--------|-------|
| 4 | [ ] | State Fragmentation | `runtime.js`, `state.js`, legacy globals, GM storage | Thiết kế class `AppState` duy nhất; migrate `__ytToolsRuntime`; dispatch `state-changed` event | Chưa làm |
| 5 | [ ] | Promise Chain Memory Leak | `src/features/shorts-channel-name.js:74-105` | Thay Promise chain bằng `FetchQueue` class (max 3 concurrent) | Chưa làm |
| 9 | [ ] | Locale-Dependent Number Parsing | `src/features/like-dislike-bar.js:16-89` | Dùng `Intl.NumberFormat` khi biết locale; đọc `hl` param từ URL | Chưa làm |
| 10 | [ ] | Download Polling No Backoff | `src/features/download.js:132-204` | Implement adaptive polling với exponential backoff + giảm interval khi transfer active | Chưa làm |
| 12 | [ ] | state.js Boilerplate | `src/utils/state.js` | Gộp vào `AppState` (Issue 4); xóa 54 getter/setter | Chưa làm |
| 15 | [ ] | Hardcoded Translate Language | `src/features/translate-comments.js:30` | Đổi `'vi'` → `settings.translateTarget \|\| 'en'` | Vẫn hardcoded 'vi' |
| 17 | [ ] | Missing SPA Handler | `src/features/player-size.js` | Thêm `yt-navigate-finish` handler gọi lại `initPlayerSize(settings)` | Chưa có |

---

## Phase 3: Chất Lượng & Nhất Quán ✨

| # | Done | Issue | File | Action | Notes |
|---|------|-------|------|--------|-------|
| 8 | [ ] | Null-Check Gaps | `src/legacy-full.js` | Thêm optional chaining `el?.textContent?.trim() ?? ''` (ưu tiên features chưa migrate) | Chưa làm |
| 11 | [ ] | DOM Queries Lặp Lại | `src/features/continue-watching.js` | Cache metadata per `videoId` trong `getCurrentVideoMeta()` | Chưa làm |
| 16 | [ ] | Missing Asset | `src/features/effects.js:110` | Thêm `assets/gio.png` HOẶC xóa image request, dùng emoji trực tiếp | Vẫn reference file thiếu |
| 18 | [ ] | Inconsistent Time Formatting | `src/features/time-stats.js` | Gộp `formatTime()` + `formatTimeCompact()` thành 1 hàm với option `{compact}` | Chưa làm |
| 20 | [ ] | Legacy DOM IDs | `src/features/download.js:316-317` | Đổi `'descargando'`/`'descargandomp3'` → `'download-status'`/`'download-status-mp3'` | Chưa làm |
| 21 | [ ] | Inconsistent Settings Keys | Multiple files | Tạo `SETTINGS_KEY` constant + settings schema với defaults | Chưa làm |
| 22 | [ ] | No Centralized Logging | Multiple files | Tạo `src/utils/logger.js` với level-based filtering (DEBUG/INFO/WARN/ERROR) | Chưa có file |

---

## Phase 4: Dọn Dẹp & Polish 🧹

| # | Done | Issue | File | Action | Notes |
|---|------|-------|------|--------|-------|
| 13 | [ ] | Large Inline HTML | `src/ui/panel.js:16-147` | Tách ra file `panel.html`, import qua Vite `?raw` | Vẫn inline (148 dòng) |
| 19 | [ ] | Monolithic CSS | `src/ui/styles.js` → `styles.scss` | Tách theo component: `panel.css`, `health-bar.css`, `bookmarks.css`, ... | Đã đổi sang SCSS nhưng vẫn 1 file |
| 23 | [ ] | Unused Import Comment | `src/main.js:11` | Xóa dòng comment `// DISABLED - using legacy wave` sau khi Issue 1 xong | Vẫn còn |
| 24 | [ ] | Duplicate Selectors | `shorts-channel-name.js` + `lockup-cached-stats.js` | Tạo `src/utils/selectors.js` với shared constants | Chưa làm |
| 25 | [ ] | No Input Validation | `src/features/time-stats.js` | Thêm guard: `if (deltaSec > 3600) return;` | Chưa làm |
| 26 | [~] | Missing a11y | `src/ui/panel.js` | Thêm `aria-label`, `tabindex`, keyboard handlers cho panel buttons | **MỘT PHẦN**: closeBtn có aria-label (dòng 25), reopenBtn có aria-label (dòng 163). Thiếu: tabindex + keyboard handler cho reopen |
| 27 | [x] | Missing .prettierrc | Root | ~~Tạo `.prettierrc`~~ | **ĐÃ CÓ**: `singleQuote:true, trailingComma:es5, tabWidth:2, printWidth:100` |
| 28 | [ ] | Stale build.log | Root | `echo "build.log" >> .gitignore` + `git rm --cached build.log` | build.log vẫn tồn tại, chưa có trong .gitignore |

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

| Phase | Total | Done | Partial | Remaining |
|-------|-------|------|---------|-----------|
| Phase 1: Sửa Ngay | 6 | **5** | 0 | 1 |
| Phase 2: Kiến Trúc | 7 | 0 | 0 | 7 |
| Phase 3: Chất Lượng | 7 | 0 | 0 | 7 |
| Phase 4: Dọn Dẹp | 8 | **1** | **1** | 6 |
| **TOTAL** | **28** | **6** | **1** | **21** |

### Chi tiết các issue đã resolved:
- ✅ **#2** ESLint no-undef — resolved by panel.js restructure (389→268 dòng)
- ✅ **#3** Silent Error Swallowing — catch blocks now have console.warn
- ✅ **#6** RAF Loop Not Cleaned — wave-visualizer có yt-navigate-finish listener + cleanup
- ✅ **#7** localStorage vs GM_getValue — like-dislike-bar dùng GM_getValue
- ✅ **#14** Duplicate Code Block — download.js đã xóa duplicate, thay bằng fallback logic
- ✅ **#27** .prettierrc — file exists with config
- 🟡 **#26** a11y — aria-label added, còn thiếu tabindex + keyboard

---

## Quick Reference: File → Issues

| File | Issues |
|------|--------|
| `src/main.js` | #1, #3✅, #23 |
| `src/ui/panel.js` | #2✅, #13, #26🟡 |
| `src/features/download.js` | #10, #14✅, #20 |
| `src/features/like-dislike-bar.js` | #7✅, #9 |
| `src/features/shorts-channel-name.js` | #5, #24 |
| `src/features/wave-visualizer.js` | #6✅ |
| `src/features/continue-watching.js` | #11 |
| `src/features/translate-comments.js` | #15 |
| `src/features/player-size.js` | #17 |
| `src/features/effects.js` | #16 |
| `src/features/time-stats.js` | #18, #25 |
| `src/features/lockup-cached-stats.js` | #24 |
| `src/utils/state.js` | #12 |
| `src/utils/runtime.js` | #4 |
| `src/ui/styles.js` (→ styles.scss) | #19 |
| `src/legacy-full.js` | #8 |
| Multiple utils | #21, #22 |
| Root | #27✅, #28 |
