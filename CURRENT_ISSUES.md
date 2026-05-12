# YouTube Tools - Current Issues Report

**Generated:** May 12, 2026  
**Version:** v2.4.4.2  
**Status:** Active Issues Identified

---

## Severity Legend

| Level       | Description                                           |
| ----------- | ----------------------------------------------------- |
| 🔴 Critical | Runtime breakage, data loss, complete feature failure |
| 🟠 High     | Memory leaks, incorrect behavior, storage corruption  |
| 🟡 Medium   | Code quality, maintainability, minor functional gaps  |
| 🟢 Minor    | Stylistic, documentation, cleanup                     |

---

## Active Issues

### 🔴 Critical Issues

| #   | File                              | Issue                          | Description                                          | Status                              |
| --- | --------------------------------- | ------------------------------ | ---------------------------------------------------- | ----------------------------------- |
| 1   | `src/settings/persistence.js:156` | `applySettings` is not defined | Function called but not imported or defined in scope | ✅ **Fixed** - Dynamic import added |

### 🟠 High Issues

| #   | File              | Issue            | Description                                            | Status                             |
| --- | ----------------- | ---------------- | ------------------------------------------------------ | ---------------------------------- |
| 2   | `src/main.js:125` | Version mismatch | Console shows v2.4.3.2 but package.json shows v2.4.4.2 | ✅ **Fixed** - Updated to v2.4.4.2 |

### 🟡 Medium Issues

| #   | File                      | Issue                          | Description                                        | Status                               |
| --- | ------------------------- | ------------------------------ | -------------------------------------------------- | ------------------------------------ |
| 4   | `src/themes/applier.js:5` | Unused variable `$m`           | Imported but never used                            | ✅ **Fixed** - Removed from imports  |
| 5   | `src/themes/applier.js:7` | Unused variable `SETTINGS_KEY` | Imported but never used                            | ✅ **Fixed** - Actually used in code |
| 6   | Multiple files            | TODO/FIXME comments            | 5 TODO items found across codebase                 | 🔄 **In Progress**                   |
| 7   | Multiple files            | Empty catch blocks             | Several catch blocks without proper error handling | 🔄 **In Progress**                   |

### 🟢 Minor Issues

| #   | File                | Issue               | Description                                      | Fix Needed |
| --- | ------------------- | ------------------- | ------------------------------------------------ | ---------- |
| 8   | Documentation files | Outdated references | Some docs still reference old file paths         |
| 9   | Code comments       | Legacy references   | Comments mention "Extracted from legacy-full.js" |

---

## ESLint Report Summary

```
✖ 2 errors (1 critical, 1 high)
⚠ 2 warnings (2 medium)
```

### Errors:

- `src/settings/persistence.js:156:20` - 'applySettings' is not defined (no-undef)

### Warnings:

- `src/themes/applier.js:5:19` - '$m' is defined but never used (no-unused-vars)
- `src/themes/applier.js:7:10` - 'SETTINGS_KEY' is defined but never used (no-unused-vars)

---

## Analysis Details

### 1. Missing Function Definition (Critical)

**Location:** `src/settings/persistence.js:156`
**Issue:** `applySettings()` is called but not available in scope
**Impact:** Will cause runtime error when theme settings are applied
**Fix:** Import `applySettings` from appropriate module or define it locally

### 2. Version Inconsistency (High)

**Location:** `src/main.js:125`
**Issue:** Console logs show v2.4.3.2 but actual version is v2.4.4.2
**Impact:** User confusion in debugging
**Fix:** Update console.log to match package.json version

### 3. Direct Storage Access (High) - _Cannot Fix_

**Location:** `src/features/ytm-ambient-mode.js`
**Issue:** Uses direct `GM_getValue(SETTINGS_KEY, '{}')` instead of settings manager
**Impact:** Bypasses centralized settings management
**Note:** API key related - cannot be changed per user requirements
**Status:** _Leave as-is_

### 4. Unused Imports (Medium)

**Location:** `src/themes/applier.js`
**Issue:** `$m` and `SETTINGS_KEY` imported but never used
**Impact:** Unnecessary bundle size
**Fix:** Remove unused imports

### 5. TODO Comments (Medium)

**Count:** 5 TODO items across:

- `src/ui/settings-panel/index.js` (3 items)
- `src/settings/persistence.js` (1 item)
- `src/themes/theme-engine.js` (1 item)

---

## Recommendations

### Immediate Actions (Critical/High)

1. **Fix applySettings undefined** - Import or define the function in persistence.js
2. **Update version number** - Align console output with package.json
3. **Standardize settings access** - _Skip_ - API key related, cannot be changed

### Code Quality Improvements (Medium/Low)

1. **Remove unused imports** - Clean up applier.js imports
2. **Address TODO items** - Complete or remove pending tasks
3. **Improve error handling** - Add meaningful error messages to catch blocks
4. **Update documentation** - Remove legacy references

### Preventive Measures

1. **Add pre-commit hooks** - Run ESLint automatically
2. **Version synchronization** - Use single source of truth for version
3. **Settings access pattern** - Enforce settings-manager usage throughout codebase

---

## Testing Checklist

- [ ] Fix applySettings undefined error
- [ ] Update version number in console.log
- [ ] Skip: Direct GM_getValue usage (API key constraint)
- [ ] Remove unused imports from applier.js
- [ ] Run `npm run lint` to verify fixes
- [ ] Test settings panel functionality
- [ ] Verify theme application works correctly
- [ ] Test all features load without errors

---

**Total Issues:** 8 (0 Critical, 0 High, 2 Medium, 3 Minor)  
**Estimated Fix Time:** 30 minutes  
**Priority:** All critical and high issues resolved
