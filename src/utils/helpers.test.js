import { describe, it, expect } from 'vitest';
import { FormatterNumber, formatTimeShort, isVersionNewer, escapeHtml } from './helpers.js';

describe('FormatterNumber', () => {
  it('formats numbers under 1000 without symbols', () => {
    expect(FormatterNumber(999, 1)).toBe('999');
    expect(FormatterNumber(50, 1)).toBe('50');
  });

  it('formats thousands with K', () => {
    expect(FormatterNumber(1000, 1)).toBe('1 K');
    expect(FormatterNumber(1500, 1)).toBe('1.5 K');
    expect(FormatterNumber(10500, 1)).toBe('10.5 K');
  });

  it('formats millions with M', () => {
    expect(FormatterNumber(1000000, 1)).toBe('1 M');
    expect(FormatterNumber(2500000, 1)).toBe('2.5 M');
    expect(FormatterNumber(10500000, 1)).toBe('10.5 M');
  });
});

describe('formatTimeShort', () => {
  it('formats seconds correctly', () => {
    expect(formatTimeShort(45)).toBe('0:45');
    expect(formatTimeShort(5)).toBe('0:05');
  });

  it('formats minutes correctly', () => {
    expect(formatTimeShort(125)).toBe('2:05');
    expect(formatTimeShort(600)).toBe('10:00');
  });

  it('formats hours correctly', () => {
    expect(formatTimeShort(3600)).toBe('1:00:00');
    expect(formatTimeShort(3665)).toBe('1:01:05');
    expect(formatTimeShort(7200)).toBe('2:00:00');
  });
});

describe('isVersionNewer', () => {
  it('returns true if latest version is newer', () => {
    expect(isVersionNewer('2.4.5', '2.4.4')).toBe(true);
    expect(isVersionNewer('3.0.0', '2.4.4')).toBe(true);
    expect(isVersionNewer('2.5.0', '2.4.4.2')).toBe(true);
  });

  it('returns false if current version is same or newer', () => {
    expect(isVersionNewer('2.4.4', '2.4.4')).toBe(false);
    expect(isVersionNewer('2.4.4', '2.4.5')).toBe(false);
    expect(isVersionNewer('2.4.4.2', '2.4.4.2')).toBe(false);
  });
});

describe('escapeHtml', () => {
  it('escapes special HTML characters', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
    expect(escapeHtml("'test'")).toBe('&#39;test&#39;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('handles empty or null values', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

