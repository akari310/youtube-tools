# YouTube Tools Userscript - Error Analysis

**Project:** `youtube-tools-userscript`  
**Version:** v2.4.3.2  
**Last Updated:** May 10, 2026  
**Status:** 28 Issues Identified | 🔴 3 Critical | 🟠 8 High | 🟡 11 Medium | 🟢 6 Minor

---

## Executive Summary

This document catalogs 28 issues from a full codebase review. Root cause: **dual codebase architecture** — modular ES6 modules run simultaneously with an 8,814-line legacy file (`src/legacy-full.js`), causing duplicate logic, state fragmentation, and maintenance debt.

---

## Severity Legend

| Level | Description |
|-------|-------------|
| 🔴 Critical | Runtime breakage, data loss, complete feature failure |
| 🟠 High | Memory leaks, incorrect behavior, storage corruption |
| 🟡 Medium | Code quality, maintainability, minor functional gaps |
| 🟢 Minor | Stylistic, documentation, cleanup |

---

## Issue Index

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | 🔴 | `src/main.js` | Dual Codebase Architecture |
| 2 | 🔴 | `src/ui/panel.js` | Panel UI Scope Error (5 ESLint `no-undef`) |
| 3 | 🔴 | `src/main.js` | Silent Error Swallowing |
| 4 | 🟠 | Multiple | State Fragmentation Across 4 Sources |
| 5 | 🟠 | `src/features/shorts-channel-name.js` | Promise Chain Memory Leak |
| 6 | 🟠 | `src/features/wave-visualizer.js` | RAF Loop Not Cleaned on SPA Navigation |
| 7 | 🟠 | `src/features/like-dislike-bar.js` | Storage Mechanism Inconsistency |
| 8 | 🟠 | `src/legacy-full.js` | Null-Check Gaps |
| 9 | 🟠 | `src/features/like-dislike-bar.js` | Locale-Dependent Number Parsing |
| 10 | 🟠 | `src/features/download.js` | Download Progress Polling Without Backoff |
| 11 | 🟠 | `src/features/continue-watching.js` | Video Metadata Repeatedly Parsed From DOM |
| 12 | 🟡 | `src/utils/state.js` | Excessive Boilerplate (54 getter/setters) |
| 13 | 🟡 | `src/ui/panel.js` | Large Inline HTML Template (270 lines) |
| 14 | 🟡 | `src/features/download.js` | Duplicate Code Block |
| 15 | 🟡 | `src/features/translate-comments.js` | Hardcoded Translate Language |
| 16 | 🟡 | `src/features/effects.js` | Missing Asset File |
| 17 | 🟡 | `src/features/player-size.js` | Missing SPA Navigation Handler |
| 18 | 🟡 | `src/features/time-stats.js` | Inconsistent Time Formatting |
| 19 | 🟡 | `src/ui/styles.js` | Monolithic 917-line CSS |
| 20 | 🟡 | `src/features/download.js` | Legacy DOM ID References |
| 21 | 🟡 | Multiple | Inconsistent Settings Key Names |
| 22 | 🟡 | Multiple | No Centralized Logging |
| 23 | 🟢 | `src/main.js` | Unused Import (wave-visualizer) |
| 24 | 🟢 | `src/features/shorts-channel-name.js` + `src/features/lockup-cached-stats.js` | Duplicate DOM Selectors |
| 25 | 🟢 | `src/features/time-stats.js` | Minimal Input Validation |
| 26 | 🟢 | `src/ui/panel.js` | Missing Accessibility Attributes |
| 27 | 🟢 | Root | Missing `.prettierrc` Config |
| 28 | 🟢 | Root | Stale `build.log` in Repository |

---

## 🔴 Critical Issues

### Issue 1: Dual Codebase Architecture
**File:** `src/main.js` (lines 12, 34)

Entry point imports all modular ES6 features AND the 8,814-line `legacy-full.js`. Both implement overlapping features (bookmarks, continue-watching, download, like/dislike bar, wave visualizer) — every feature runs **twice**.

**Evidence:**
```javascript
// src/main.js - line 12
import { setupContinueWatchingFeature } from './features/continue-watching.js';
// ... many modular imports ...

// src/main.js - line 34
import './legacy-full.js';  // ← 8,814 lines of duplicate logic
```

**Impact:** Duplicate MutationObservers, duplicate event handlers, duplicate GM storage writes, inflated time stats.

**Fix:** Feature parity checklist → choose one implementation per feature → migrate legacy-only features → remove `import './legacy-full.js'`. **Priority:** Phase 1.

---

### Issue 2: Panel UI Scope Error (5 ESLint `no-undef`)
**File:** `src/ui/panel.js` (lines 353-389)

ESLint v9 reports 5 `no-undef` errors for `panel` in `setupTabs()`, `setupToggles()`, `setupFormatPills()`. These functions are closures inside `createPanel()`, but ESLint doesn't detect the closure. Blocks lint pipeline.

**Fix:** Pass `panel` as parameter: `function setupTabs(panel) { ... }; setupTabs(panel);`. **Priority:** Phase 1.

---

### Issue 3: Silent Error Swallowing
**File:** `src/main.js` (lines 83-97)

`reinitAll()` catches all errors with empty blocks — failures are invisible:
```javascript
try { fn(s); } catch (_e) {} // ← ERRORS IGNORED
```

**Fix:** Add `console.warn('[YT Tools] Feature init failed:', fn.name, e);` to all catch blocks. **Priority:** Phase 1.

---

## 🟠 High-Priority Issues

### Issue 4: State Fragmentation Across 4 Sources
**Files:** `runtime.js`, `state.js`, legacy globals, GM storage

State scattered across `__ytToolsRuntime` (window global), `state.js` (18 fields via 54 getter/setters), legacy globals (`var health = 100`), and GM storage. No synchronization — e.g., `localStorage.getItem('ytSettingsMDCM')` in like-dislike-bar.js reads different data than `GM_getValue('ytSettingsMDCM')` in panel.js.

**Fix:** Design unified `AppState`, migrate all runtime flags, sync with GM storage via change events, remove `state.js` boilerplate. **Priority:** Phase 2.

---

### Issue 5: Promise Chain Memory Leak
**File:** `src/features/shorts-channel-name.js` (lines 74-105)

Ever-growing chain: `rt.fetchChain = rt.fetchChain.then(() => processElement())`. Each `.then()` retains previous reference. Mitigations exist (`MAX_PENDING_FETCHES = 50`, periodic reset) but pattern is still leaky under sustained load.

**Fix:** Replace with bounded concurrent `FetchQueue` class (max 3 concurrent). **Priority:** Phase 2.

---

### Issue 6: RAF Loop Not Cleaned on SPA Navigation
**File:** `src/features/wave-visualizer.js`

RAF loop tied to `AnalyserNode` continues running after SPA navigation. Old canvas and AudioContext persist, consuming CPU. Browsers limit AudioContexts to ~6 — after 6 navigations, visualization breaks.

**Fix:** Add `yt-navigate-finish` listener → `cleanupWaveVisualizer()` (cancel RAF, close AudioContext, detach source). **Priority:** Phase 1.

---

### Issue 7: Storage Mechanism Inconsistency
**File:** `src/features/like-dislike-bar.js` (lines 246-258)

Like/dislike bar reads from `localStorage.getItem('ytSettingsMDCM')` but panel writes via `GM_getValue('ytSettingsMDCM')`. Different storage mechanisms in Tampermonkey — settings are invisible to each other.

**Evidence:**
```javascript
// like-dislike-bar.js (line 250) — WRONG
const settings = JSON.parse(localStorage.getItem('ytSettingsMDCM') || '{}');

// panel.js — CORRECT
const saved = GM_getValue('ytSettingsMDCM', '{}');
```

**Fix:** Replace `localStorage.getItem` with `GM_getValue` in like-dislike-bar.js. **Priority:** Phase 1.

---

### Issue 8: Null-Check Gaps
**File:** `src/legacy-full.js` (various)

Legacy code (8,814 lines) has DOM queries without null guards. When YouTube updates DOM, `TypeError: Cannot read properties of null` occurs.

**Fix:** Add optional chaining (`el?.textContent?.trim() ?? ''`). Resolved naturally by Issue 1 migration. **Priority:** Phase 3.

---

### Issue 9: Locale-Dependent Number Parsing
**File:** `src/features/like-dislike-bar.js` (lines 16-89)

`parseCountText()` uses heuristics for comma/dot separators that can fail (e.g., "1.234" could be 1234 or 1.234 depending on locale).

**Fix:** Use `Intl.NumberFormat` when locale known; read YouTube's `hl` parameter; add unit tests with 10+ locales. **Priority:** Phase 2.

---

### Issue 10: Download Progress Polling Without Backoff
**File:** `src/features/download.js` (lines 132-153, 185-204)

Both SaveNow and Dubs providers poll at fixed 3-second intervals. No exponential backoff for failures, no adaptation to server speed.

**Fix:** Implement adaptive polling with exponential backoff on errors, shorter intervals during active transfer. **Priority:** Phase 2.

---

### Issue 11: Video Metadata Repeatedly Parsed From DOM
**File:** `src/features/continue-watching.js`

`getCurrentVideoMeta()` queries DOM on every `timeupdate` (~4/sec) for data that doesn't change.

**Fix:** Cache metadata per `videoId`. **Priority:** Phase 3.

---

## 🟡 Medium Issues

### Issue 12: Excessive Boilerplate in state.js
**File:** `src/utils/state.js` (119 lines)

54 getter/setter functions for 18 fields — 3 lines per field in identical pattern. **Fix:** Replace with Proxy/class combined with Issue 4 consolidation. **Priority:** Phase 2.

### Issue 13: Large Inline HTML Template
**File:** `src/ui/panel.js` (lines 16-147)

270-line inline template string. **Fix:** Extract to external HTML, import via Vite (`import panelHTML from './panel.html?raw'`). **Priority:** Phase 4.

### Issue 14: Duplicate Code Block
**File:** `src/features/download.js` (lines 220-228)

Two identical `if (started?.success && started?.progress_url)` blocks. Second is dead code (first returns). **Fix:** Delete lines 225-228. **Priority:** Phase 1.

### Issue 15: Hardcoded Translate Language
**File:** `src/features/translate-comments.js` (line 30)

`const idiomaDestino = 'vi';` — hardcoded Vietnamese, ignores user settings. **Fix:** Read from `settings.translateTarget || 'en'`. **Priority:** Phase 2.

### Issue 16: Missing Asset File
**File:** `src/features/effects.js` (line 110)

`img.src = 'assets/gio.png'` — file doesn't exist, always triggers onerror fallback. **Fix:** Add asset or remove image request. **Priority:** Phase 3.

### Issue 17: Missing SPA Navigation Handler
**File:** `src/features/player-size.js`

`initPlayerSize()` runs once — lost after SPA navigation. **Fix:** Add `yt-navigate-finish` handler. **Priority:** Phase 2.

### Issue 18: Inconsistent Time Formatting
**File:** `src/features/time-stats.js`

`formatTime()` returns "0h 0m 0s", `formatTimeCompact()` returns "0h 0m". **Fix:** Consolidate with `compact` option. **Priority:** Phase 3.

### Issue 19: Monolithic CSS File
**File:** `src/ui/styles.js` (917 lines)

All CSS in single `GM_addStyle()`. CSS for disabled features still injected. **Fix:** Split by component, inject conditionally. **Priority:** Phase 4.

### Issue 20: Legacy DOM ID References in Modular Code
**File:** `src/features/download.js` (lines 316-317)

`$id('descargando') || $id('descargandomp3')` — Spanish legacy IDs. **Fix:** Rename to English, add null guards. **Priority:** Phase 3.

### Issue 21: Inconsistent Settings Key Names
**Files:** Multiple

Mixed casing conventions across features. **Fix:** Define `SETTINGS_KEY` constant and settings schema with defaults. **Priority:** Phase 3.

### Issue 22: No Centralized Logging
**Files:** Multiple

Ad-hoc `console.log('[YT Tools] ...')` throughout. **Fix:** Create `src/utils/logger.js` with level-based filtering. **Priority:** Phase 3.

---

## 🟢 Minor Issues

| # | File | Issue | Fix |
|---|------|-------|-----|
| 23 | `src/main.js` | Commented-out wave import | Remove after Issue 1 |
| 24 | `shorts-channel-name.js` + `lockup-cached-stats.js` | Duplicate ShortsLockupViewModel selectors | Create `src/utils/selectors.js` |
| 25 | `src/features/time-stats.js` | No deltaSec range validation | Add `deltaSec > 3600` guard |
| 26 | `src/ui/panel.js` | Missing aria-label, role, tabindex | Add ARIA + keyboard handlers |
| 27 | Root | Mixed 2/4-space indentation | Add `.prettierrc` |
| 28 | Root | `build.log` tracked in repo | Add to `.gitignore` |

**Priority:** Phase 4 for all minor issues.

---

## Fix Priority Phases

### Phase 1: Immediate (Critical + High Impact)
| Issue | Task |
|-------|------|
| 1 | Legacy code migration plan — feature parity checklist |
| 2 | Fix ESLint `no-undef` in panel.js |
| 3 | Add console.warn to empty catch blocks |
| 6 | Add `yt-navigate-finish` cleanup to wave visualizer |
| 7 | Fix localStorage → GM_getValue in like-dislike-bar.js |
| 14 | Remove duplicate code block in download.js |

### Phase 2: Core Architecture
| Issue | Task |
|-------|------|
| 4 | Design unified AppState; consolidate state |
| 5 | Replace Promise chain with bounded queue |
| 9 | Fix locale-dependent number parsing |
| 10 | Add exponential backoff to download polling |
| 12 | Replace state.js boilerplate |
| 15 | Read translate language from settings |
| 17 | Add SPA navigation handler to player-size.js |

### Phase 3: Quality & Consistency
| Issue | Task |
|-------|------|
| 8 | Add null guards to remaining legacy features |
| 11 | Cache video metadata per videoId |
| 16 | Fix or remove missing asset reference |
| 18 | Consolidate time formatters |
| 20 | Rename legacy DOM IDs to English |
| 21 | Standardize settings key names |
| 22 | Implement centralized logger |

### Phase 4: Polish & Cleanup
| Issue | Task |
|-------|------|
| 13 | Extract panel HTML to external file |
| 19 | Split CSS by component |
| 23-28 | All minor issues (selectors, validation, a11y, prettier, build.log) |

---

## Testing Checklist

- [ ] ESLint passes (`npx eslint src/`)
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

---

## File Structure Reference

```
C:\Users\FPTSHOP\Downloads\Aji\
├── src/
│   ├── main.js                    # Entry point (dual import problem)
│   ├── legacy-full.js             # 8,814-line legacy (to be removed)
│   ├── config/
│   │   ├── flags.js               # Feature flags
│   │   └── constants.js           # API URLs, endpoints
│   ├── features/
│   │   ├── bookmarks.js           # Bookmark feature
│   │   ├── continue-watching.js   # Resume playback (607 lines)
│   │   ├── download.js            # Download engine
│   │   ├── effects.js             # Mini-game
│   │   ├── like-dislike-bar.js    # ReturnYouTubeDislike integration
│   │   ├── lockup-cached-stats.js # Cached stats on video cards
│   │   ├── player-size.js         # Player size adjustment
│   │   ├── shorts-channel-name.js # Shorts channel name
│   │   ├── time-stats.js          # Usage & watch time tracking
│   │   ├── translate-comments.js  # Comment translation
│   │   └── wave-visualizer.js     # Audio visualization
│   ├── ui/
│   │   ├── panel.js               # Settings panel UI
│   │   └── styles.js              # 917-line CSS
│   └── utils/
│       ├── dom.js                 # DOM helpers
│       ├── helpers.js             # Misc utilities
│       ├── runtime.js             # __ytToolsRuntime global
│       ├── state.js               # 54 getter/setter boilerplate
│       ├── storage.js             # GM storage wrapper
│       └── trusted-types.js       # Trusted Types / CSP
├── .eslintrc.json                 # ESLint v9 flat config
├── package.json                   # Vite + vite-plugin-monkey
└── ERROR_ANALYSIS.md              # This file
```
