import { parseISO, differenceInCalendarDays } from 'date-fns';

export const ZOOM_CONFIGS = {
  7: { days: 7, dayWidth: 120 },
  14: { days: 14, dayWidth: 72 },
  30: { days: 30, dayWidth: 36 },
} as const;

export type ZoomLevel = keyof typeof ZOOM_CONFIGS;

export function getDayIndex(dateStr: string, rangeStart: string): number {
  return differenceInCalendarDays(parseISO(dateStr), parseISO(rangeStart));
}

export function clipEventToRange(
  startsOn: string,
  endsOn: string,
  rangeStart: string,
  rangeEnd: string
): {
  startOffsetDays: number;
  spanDays: number;
  clippedStart: boolean;
  clippedEnd: boolean;
} | null {
  const eventStart = startsOn < rangeStart ? rangeStart : startsOn;
  const eventEnd = endsOn > rangeEnd ? rangeEnd : endsOn;
  const clippedStart = startsOn < rangeStart;
  const clippedEnd = endsOn > rangeEnd;

  if (eventStart >= eventEnd) return null;

  const startOffsetDays = getDayIndex(eventStart, rangeStart) + (clippedStart ? 0 : 0.5);
  const endOffsetDays = getDayIndex(eventEnd, rangeStart) + (clippedEnd ? 0 : 0.5);
  const spanDays = endOffsetDays - startOffsetDays;

  if (spanDays <= 0) return null;

  return { startOffsetDays, spanDays, clippedStart, clippedEnd };
}

export function getEventStyle(
  startOffsetDays: number,
  spanDays: number,
  dayWidth: number
): React.CSSProperties {
  return {
    left: `${startOffsetDays * dayWidth}px`,
    width: `${Math.max(spanDays * dayWidth, dayWidth * 0.5)}px`,
  };
}
