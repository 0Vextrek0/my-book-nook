import { AnalyticsPeriod, AnalyticsSnapshot } from '@/lib/types';

const PERIOD_LIMITS: Record<AnalyticsPeriod, number> = {
  today: 12,
  week: 28,
  month: 30,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function drift(value: number, variance: number, min: number, max: number): number {
  const delta = Math.floor((Math.random() - 0.5) * variance * 2);
  return clamp(value + delta, min, max);
}

export function makeInitialSnapshot(seed = 1): AnalyticsSnapshot {
  return {
    timestamp: new Date().toISOString(),
    catalogViews: 200 + seed * 3,
    searches: 80 + seed * 2,
    bookingAttempts: 32 + seed,
    successfulBookings: 24 + Math.floor(seed / 2),
    activeReaders: 45 + seed,
  };
}

export function nextAnalyticsSnapshot(previous: AnalyticsSnapshot): AnalyticsSnapshot {
  const nextBookingAttempts = drift(previous.bookingAttempts, 8, 10, 200);
  const nextSuccessful = clamp(drift(previous.successfulBookings, 6, 8, nextBookingAttempts), 0, nextBookingAttempts);

  return {
    timestamp: new Date().toISOString(),
    catalogViews: drift(previous.catalogViews, 24, 60, 2000),
    searches: drift(previous.searches, 18, 20, 900),
    bookingAttempts: nextBookingAttempts,
    successfulBookings: nextSuccessful,
    activeReaders: drift(previous.activeReaders, 10, 10, 600),
  };
}

export function appendSnapshot(
  snapshots: AnalyticsSnapshot[],
  period: AnalyticsPeriod,
  snapshot: AnalyticsSnapshot,
): AnalyticsSnapshot[] {
  const limit = PERIOD_LIMITS[period];
  return [...snapshots, snapshot].slice(-limit);
}
