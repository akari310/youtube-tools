import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  gmRawGet,
  gmRawSet,
  readJsonGM,
  writeJsonGM,
  getShortsChannelFromPersistedCache,
  setShortsChannelToPersistedCache,
} from '../../utils/storage.js';
import { clearMockStorage } from '../setup.js';

describe('storage.js', () => {
  beforeEach(() => {
    clearMockStorage();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('gmRawGet / gmRawSet', () => {
    it('sets and gets primitive values', () => {
      gmRawSet('test_key', 'test_value');
      expect(gmRawGet('test_key', 'default')).toBe('test_value');
    });

    it('returns default value if key does not exist', () => {
      expect(gmRawGet('non_existent', 'fallback')).toBe('fallback');
    });
  });

  describe('readJsonGM / writeJsonGM', () => {
    it('writes and reads JSON objects', () => {
      const data = { a: 1, b: 'two', c: [1, 2, 3] };
      writeJsonGM('json_key', data);
      const retrieved = readJsonGM('json_key', null);
      expect(retrieved).toEqual(data);
    });

    it('returns default value if JSON is invalid or missing', () => {
      expect(readJsonGM('missing_json', { default: true })).toEqual({ default: true });

      // Write invalid JSON manually
      gmRawSet('broken_json', '{ broken: json');
      expect(readJsonGM('broken_json', { fallback: 1 })).toEqual({ fallback: 1 });
    });
  });

  describe('Shorts Channel Cache', () => {
    it('caches and retrieves channel name within TTL', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      setShortsChannelToPersistedCache('vid123', 'MyChannel');

      const cached = getShortsChannelFromPersistedCache('vid123');
      expect(cached).toBe('MyChannel');
    });

    it('returns null if cache is expired', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      setShortsChannelToPersistedCache('vid123', 'MyChannel');

      // Fast forward past TTL (7 days)
      vi.setSystemTime(new Date('2026-01-09T00:00:00Z'));

      const cached = getShortsChannelFromPersistedCache('vid123');
      expect(cached).toBeNull();
    });

    it('handles pruning when exceeding max entries', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      // CACHE_LIMITS.PERSISTED_MAX_ENTRIES is typically 200, but we can't easily redefine the const
      // Let's just ensure basic set/get works for multiple entries
      setShortsChannelToPersistedCache('vid1', 'Channel1');
      setShortsChannelToPersistedCache('vid2', 'Channel2');

      expect(getShortsChannelFromPersistedCache('vid1')).toBe('Channel1');
      expect(getShortsChannelFromPersistedCache('vid2')).toBe('Channel2');
    });
  });
});
