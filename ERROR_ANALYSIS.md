# YouTube Tools Userscript - Error Analysis

**Project:** `youtube-tools-userscript`  
**Version:** v2.4.4.2  
**Last Updated:** May 11, 2026  
**Status:** 28 Issues Identified | ✅ All Resolved

---

## Executive Summary

This document cataloged 28 issues from a full codebase review. Root cause was **dual codebase architecture** — modular ES6 modules running simultaneously with an 8,814-line legacy file (`src/legacy-full.js`). All issues have been resolved through migration to a fully modular architecture and targeted code fixes.

---

## Severity Legend

| Level       | Description                                           |
| ----------- | ----------------------------------------------------- |
| 🔴 Critical | Runtime breakage, data loss, complete feature failure |
| 🟠 High     | Memory leaks, incorrect behavior, storage corruption  |
| 🟡 Medium   | Code quality, maintainability, minor functional gaps  |
| 🟢 Minor    | Stylistic, documentation, cleanup                     |

---

## Issue Index

| #   | Severity | Status | File                                                | Issue                                      | Fix                                                         |
| --- | -------- | ------ | --------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| 1   | 🔴       | ✅     | `src/main.js`                                       | Dual Codebase Architecture                 | Legacy import removed                                       |
| 2   | 🔴       | ✅     | `src/ui/panel.js`                                   | Panel UI Scope Error (5 ESLint `no-undef`) | Panel restructured, no separate closures                    |
| 3   | 🔴       | ✅     | `src/main.js`                                       | Silent Error Swallowing                    | `console.warn` in all catch blocks                          |
| 4   | 🟠       | ✅     | Multiple                                            | State Fragmentation Across 4 Sources       | Deprecation docs, unified `state` object                    |
| 5   | 🟠       | ✅     | `src/features/shorts-channel-name.js`               | Promise Chain Memory Leak                  | `FetchQueue` class (bounded concurrency)                    |
| 6   | 🟠       | ✅     | `src/features/wave-visualizer.js`                   | RAF Loop Not Cleaned on SPA Navigation     | `yt-navigate-finish` cleanup handler                        |
| 7   | 🟠       | ✅     | `src/features/like-dislike-bar.js`                  | Storage Mechanism Inconsistency            | `loadSettings()` replaces raw GM_getValue                   |
| 8   | 🟠       | ✅     | `src/legacy-full.js`                                | Null-Check Gaps                            | Resolved by removing legacy import                          |
| 9   | 🟠       | ✅     | `src/features/like-dislike-bar.js`                  | Locale-Dependent Number Parsing            | `hl`-based locale disambiguation added                      |
| 10  | 🟠       | ✅     | `src/features/download.js`                          | Download Progress Polling Without Backoff  | Both providers use adaptive backoff                         |
| 11  | 🟠       | ✅     | `src/features/continue-watching.js`                 | Video Metadata Repeatedly Parsed From DOM  | `metaCache` per videoId                                     |
| 12  | 🟡       | ✅     | `src/utils/state.js`                                | Excessive Boilerplate (54 getter/setters)  | Simplified to plain object + deprecation docs               |
| 13  | 🟡       | ✅     | `src/ui/panel.js`                                   | Large Inline HTML Template (270 lines)     | Kept as-is (cleanly structured, acceptable)                 |
| 14  | 🟡       | ✅     | `src/features/download.js`                          | Duplicate Code Block                       | Duplicate removed                                           |
| 15  | 🟡       | ✅     | `src/features/translate-comments.js`                | Hardcoded Translate Language               | Reads from `settings.translateTarget`                       |
| 16  | 🟡       | ✅     | `src/features/effects.js`                           | Missing Asset File                         | Uses emoji instead of image                                 |
| 17  | 🟡       | ✅     | `src/features/player-size.js`                       | Missing SPA Navigation Handler             | `yt-navigate-finish` handler added                          |
| 18  | 🟡       | ✅     | `src/features/time-stats.js`                        | Inconsistent Time Formatting               | `formatTime()` with `{compact}` option                      |
| 19  | 🟡       | ✅     | `src/ui/styles.scss`                                | Monolithic 917-line CSS                    | Split into \_youtube, \_youtube-music, \_variables, \_stats |
| 20  | 🟡       | ✅     | `src/features/download.js`                          | Legacy DOM ID References                   | IDs already English in modular code                         |
| 21  | 🟡       | ✅     | Multiple                                            | Inconsistent Settings Key Names            | `SETTINGS_KEY` constant + `loadSettings()`                  |
| 22  | 🟡       | ✅     | Multiple                                            | No Centralized Logging                     | `src/utils/logger.js` created                               |
| 23  | 🟢       | ✅     | `src/main.js`                                       | Unused Import (wave-visualizer)            | Import removed                                              |
| 24  | 🟢       | ✅     | `shorts-channel-name.js` + `lockup-cached-stats.js` | Duplicate DOM Selectors                    | `src/utils/selectors.js` created                            |
| 25  | 🟢       | ✅     | `src/features/time-stats.js`                        | Minimal Input Validation                   | `deltaSec > 3600` guard added                               |
| 26  | 🟢       | ✅     | `src/ui/panel.js`                                   | Missing Accessibility Attributes           | ARIA roles, labels, tabindex added                          |
| 27  | 🟢       | ✅     | Root                                                | Missing `.prettierrc` Config               | `.prettierrc` created                                       |
| 28  | 🟢       | ✅     | Root                                                | Stale `build.log` in Repository            | Added to `.gitignore`                                       |

---

## Additional Fixes (discovered during resolution)

| File                                 | Issue                              | Fix                                             |
| ------------------------------------ | ---------------------------------- | ----------------------------------------------- |
| `src/features/audio-only.js`         | `sessionStorage` ESLint no-undef   | Use `window.sessionStorage`                     |
| `src/features/avatar-download.js`    | Unnecessary escape + dead fallback | Remove `\/` escape, remove always-truthy `\|\|` |
| `src/features/cinematic-lighting.js` | `let` in for-of loops              | Changed to `const`                              |

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

## Testing Checklist

- [x] ESLint passes (`npx eslint src/`) — 0 errors, 0 warnings
- [x] Production build succeeds (`npm run build`)
- [ ] Script loads without console errors on youtube.com
- [ ] Settings panel opens/closes, all toggles work
- [ ] Time statistics update during video playback
- [ ] SPA navigation (video → watch → browse) works 5x consecutively
- [ ] Bookmarks add/remove correctly
- [ ] Like/dislike bar shows correct values
- [ ] Download button functions
- [ ] Effects mini-game runs (if enabled)
- [ ] Memory: 10 SPA navigations do not increase heap >20MB
- [ ] All features honor enable/disable setting
- [ ] No duplicate MutationObservers
