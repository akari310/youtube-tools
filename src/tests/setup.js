import { vi } from 'vitest';

// Mock Tampermonkey / Greasemonkey APIs
const mockStorage = new Map();

globalThis.GM_getValue = vi.fn((key, defaultValue) => {
  return mockStorage.has(key) ? mockStorage.get(key) : defaultValue;
});

globalThis.GM_setValue = vi.fn((key, value) => {
  mockStorage.set(key, value);
});

globalThis.GM_addStyle = vi.fn(() => {});
globalThis.GM_info = {
  script: {
    version: '2.4.4.2',
  },
};
globalThis.unsafeWindow = globalThis.window;
globalThis.GM_registerMenuCommand = vi.fn();
globalThis.GM_xmlhttpRequest = vi.fn();

// Mock YouTube specific globals
globalThis.isYTMusic = false;

// Mock window properties if necessary
Object.defineProperty(window, 'location', {
  value: new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  writable: true,
});

// Provide a way to reset storage between tests
export function clearMockStorage() {
  mockStorage.clear();
}
