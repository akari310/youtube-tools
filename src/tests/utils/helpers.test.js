import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatTimeShort,
  isVersionNewer,
  escapeHtml,
  FormatterNumber,
  getCurrentVideoId,
} from '../../utils/helpers.js';

describe('helpers.js', () => {
  describe('formatTimeShort', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatTimeShort(0)).toBe('0:00');
      expect(formatTimeShort(5)).toBe('0:05');
      expect(formatTimeShort(59)).toBe('0:59');
      expect(formatTimeShort(60)).toBe('1:00');
      expect(formatTimeShort(65)).toBe('1:05');
      expect(formatTimeShort(3599)).toBe('59:59');
    });

    it('formats seconds to HH:MM:SS', () => {
      expect(formatTimeShort(3600)).toBe('1:00:00');
      expect(formatTimeShort(3665)).toBe('1:01:05');
      expect(formatTimeShort(36000)).toBe('10:00:00');
    });

    it('handles invalid inputs gracefully', () => {
      expect(formatTimeShort(-10)).toBe('0:00');
      expect(formatTimeShort('abc')).toBe('0:00');
      expect(formatTimeShort(null)).toBe('0:00');
      expect(formatTimeShort(undefined)).toBe('0:00');
    });
  });

  describe('isVersionNewer', () => {
    it('returns true if the latest version is newer', () => {
      expect(isVersionNewer('2.0.0', '1.9.9')).toBe(true);
      expect(isVersionNewer('1.0.1', '1.0.0')).toBe(true);
      expect(isVersionNewer('2.4.4.2', '2.4.4.1')).toBe(true);
    });

    it('returns false if the latest version is older or equal', () => {
      expect(isVersionNewer('1.0.0', '1.0.0')).toBe(false);
      expect(isVersionNewer('1.0.0', '1.0.1')).toBe(false);
      expect(isVersionNewer('2.4.4.1', '2.4.4.2')).toBe(false);
    });

    it('handles invalid versions gracefully', () => {
      expect(isVersionNewer(null, '1.0.0')).toBe(false);
      expect(isVersionNewer('1.0.0', undefined)).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('escapes common HTML characters', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeHtml("'single'")).toBe('&#39;single&#39;');
      expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('handles non-strings gracefully', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('123');
    });
  });

  describe('FormatterNumber', () => {
    it('formats numbers into K and M', () => {
      expect(FormatterNumber(999, 1)).toBe('999');
      expect(FormatterNumber(1000, 1)).toBe('1 K');
      expect(FormatterNumber(1500, 1)).toBe('1.5 K');
      expect(FormatterNumber(1000000, 1)).toBe('1 M');
      expect(FormatterNumber(1550000, 2)).toBe('1.55 M');
    });

    it('strips trailing zeros', () => {
      expect(FormatterNumber(1000000, 1)).toBe('1 M');
      expect(FormatterNumber(1050000, 2)).toBe('1.05 M');
    });
  });

  describe('getCurrentVideoId', () => {
    beforeEach(() => {
      // Setup window location mock before each test
    });

    it('extracts video ID from standard watch URL', () => {
      window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      window.location.search = '?v=dQw4w9WgXcQ';
      window.location.pathname = '/watch';
      expect(getCurrentVideoId()).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from shorts URL', () => {
      window.location.href = 'https://www.youtube.com/shorts/SHORT_ID_123';
      window.location.search = '';
      window.location.pathname = '/shorts/SHORT_ID_123';
      expect(getCurrentVideoId()).toBe('SHORT_ID_123');
    });

    it('returns null for non-video pages', () => {
      window.location.href = 'https://www.youtube.com/feed/subscriptions';
      window.location.search = '';
      window.location.pathname = '/feed/subscriptions';
      expect(getCurrentVideoId()).toBe(null);
    });
  });
});
