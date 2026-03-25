import { describe, expect, it } from 'vitest';
import { appendSnapshot, makeInitialSnapshot, nextAnalyticsSnapshot } from '@/lib/analytics-utils';

describe('Analytics utils', () => {
  it('produces bounded next snapshot values', () => {
    const base = makeInitialSnapshot(3);
    const next = nextAnalyticsSnapshot(base);

    expect(next.catalogViews).toBeGreaterThanOrEqual(60);
    expect(next.searches).toBeGreaterThanOrEqual(20);
    expect(next.bookingAttempts).toBeGreaterThanOrEqual(10);
    expect(next.successfulBookings).toBeLessThanOrEqual(next.bookingAttempts);
  });

  it('keeps period history length under limit', () => {
    const seed = Array.from({ length: 40 }).map((_, idx) => makeInitialSnapshot(idx));
    const trimmed = seed.reduce((acc, snap) => appendSnapshot(acc, 'today', snap), [] as ReturnType<typeof makeInitialSnapshot>[]);
    expect(trimmed.length).toBeLessThanOrEqual(12);
  });
});
