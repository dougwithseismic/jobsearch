import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatNumber, formatDate, timeAgo, truncate, percentage } from '../utils/format.js';

describe('formatNumber', () => {
  it('formats small numbers without commas', () => {
    expect(formatNumber(42)).toBe('42');
  });

  it('formats thousands with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatDate', () => {
  it('extracts date portion from ISO string', () => {
    expect(formatDate('2025-03-06T14:30:00Z')).toBe('2025-03-06');
  });

  it('returns input if no T separator', () => {
    expect(formatDate('2025-03-06')).toBe('2025-03-06');
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-06T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than a minute', () => {
    expect(timeAgo('2026-03-06T11:59:30Z')).toBe('just now');
  });

  it('returns minutes ago', () => {
    expect(timeAgo('2026-03-06T11:55:00Z')).toBe('5m ago');
  });

  it('returns hours ago', () => {
    expect(timeAgo('2026-03-06T09:00:00Z')).toBe('3h ago');
  });

  it('returns days ago', () => {
    expect(timeAgo('2026-03-04T12:00:00Z')).toBe('2d ago');
  });
});

describe('truncate', () => {
  it('preserves short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('preserves strings at exact max length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    const result = truncate('hello world', 6);
    expect(result).toBe('hello\u2026');
    expect(result.length).toBe(6);
  });
});

describe('percentage', () => {
  it('calculates percentage', () => {
    expect(percentage(1, 4)).toBe('25%');
    expect(percentage(1, 3)).toBe('33%');
    expect(percentage(3, 3)).toBe('100%');
  });

  it('handles zero total', () => {
    expect(percentage(0, 0)).toBe('0%');
    expect(percentage(5, 0)).toBe('0%');
  });

  it('handles zero part', () => {
    expect(percentage(0, 100)).toBe('0%');
  });
});
