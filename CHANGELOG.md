# Changelog

All notable changes to YouTube Tools Userscript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.4.3] - 2026-05-11

### 🎉 Major Improvements

#### Added
- **Centralized Storage Configuration** (`src/config/storage-keys.js`)
  - All storage keys in one place for easier maintenance
  - CACHE_TTL and CACHE_LIMITS constants
  - Comprehensive JSDoc documentation
  
- **Resource Cleanup Manager** (`src/utils/cleanup-manager.js`)
  - Automatic cleanup of MutationObservers, IntersectionObservers
  - Track intervals, timeouts, and event listeners
  - Auto-cleanup on page unload and SPA navigation
  - Prevent memory leaks
  
- **Safe DOM Utilities** (`src/utils/dom-safe.js`)
  - Null-safe DOM helper functions
  - `$safe()`, `safeSetTextContent()`, `safeSetStyle()` utilities
  - Chainable `SafeElement` class
  - Prevent runtime errors from null references
  
- **Theme System Enhancements**
  - `src/themes/animations.js` - CSS animation utilities
  - `src/themes/customizer.js` - Theme customization options
  - Better theme initialization and application

- **Avatar Download Feature** (`src/features/comments/avatar-download.js`)
  - Download channel avatar from comments section

#### Changed
- **Storage System Refactored**
  - `src/utils/storage.js` - Use centralized STORAGE_KEYS
  - `src/settings/storage-key.js` - Re-export from config
  - `src/config/constants.js` - Remove storage keys, keep API endpoints
  
- **Runtime Namespace Updated**
  - `src/utils/runtime.js` - Unique namespace `__YT_TOOLS_RUNTIME_MDCM__`
  - Prevent conflicts with other userscripts
  
- **Theme Engine Improvements**
  - `src/themes/theme-engine.js` - Better initialization
  - `src/themes/theme-data.js` - Centralized imports
  - `src/ui/components/theme-selector/` - Updated styles
  
- **Build Configuration**
  - `vite.config.js` - Better output settings
  - `eslint.config.js` - Improved linting rules

#### Fixed
- **Null Safety Issues**
  - `src/features/comments/translate-comments.js` - Better null checks
  - `src/features/player/audio-only.js` - Cleanup on disable
  - `src/features/player/cinematic-lighting.js` - Observer cleanup
  - `src/features/shorts/shorts-reel-buttons.js` - Null safety
  
- **Memory Leaks**
  - Proper cleanup of observers and intervals
  - Auto-cleanup on SPA navigation
  - Resource tracking with CleanupManager

#### Performance
- Reduced bundle size by eliminating duplicate storage key definitions
- Faster cleanup with centralized manager vs scattered handlers
- Better caching with consistent TTL across features
- Safer DOM access prevents runtime errors

#### Developer Experience
- Single source of truth for storage keys
- Automatic resource cleanup
- Null-safe DOM operations
- Consistent error handling with `[YT Tools]` prefix
- Comprehensive JSDoc documentation

#### Build Output
- **Size:** 334.07 kB (gzip: 71.06 kB)
- **Modules:** 55 transformed
- **Build Time:** ~1 second

---

## [2.4.4.2] - 2026-05-10

### Migration Complete

- ✅ All 28 issues from ERROR_ANALYSIS.md resolved
- ✅ Legacy codebase removed (legacy-full.js deleted)
- ✅ 100% modular ES modules architecture
- ✅ New glassmorphic UI system
- ✅ Theme engine with 8 presets

---

## Version Numbering

This project uses a 4-part version number: `MAJOR.MINOR.PATCH.REVISION`

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)
- **REVISION** - Performance improvements, refactoring (backward compatible)

---

## Upcoming (v2.4.5.0)

### Planned Features
- [ ] TypeScript migration for better type safety
- [ ] Unit tests with Vitest
- [ ] E2E tests with Playwright
- [ ] API health monitoring for download endpoints
- [ ] User-configurable API endpoints
- [ ] Test coverage reporting

---

## Quick Reference

### Storage Keys
All storage keys are defined in `src/config/storage-keys.js`

### Cleanup Manager
Use `cleanupManager` from `src/utils/cleanup-manager.js` for resource tracking

### Safe DOM
Use utilities from `src/utils/dom-safe.js` for null-safe DOM operations

---

*For detailed migration guide, see AGENTS.md*

</content>
</parameter>
<arg_key>filepath
>CHANGELOG.md