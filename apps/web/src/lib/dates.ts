import {
  format,
  addDays,
  subDays,
  parseISO,
  isWeekend,
  nextSaturday,
  startOfMonth,
  getDay,
  startOfYear,
} from 'date-fns';
import { getTodayInAppTimeZone } from './timezone';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function buildVisibleDays(start: string, count: number) {
  const startDate = parseISO(start);
  const today = getToday();
  const days: Array<{
    date: Date;
    dateStr: string;
    dayName: string;
    dayNumber: number;
    isWeekend: boolean;
    isToday: boolean;
    isMonthStart: boolean;
    monthLabel: string | null;
  }> = [];

  for (let i = 0; i < count; i++) {
    const date = addDays(startDate, i);
    const isFirst = date.getDate() === 1;
    const dateStr = format(date, 'yyyy-MM-dd');
    days.push({
      date,
      dateStr,
      dayName: format(date, 'EEE'),
      dayNumber: date.getDate(),
      isWeekend: isWeekend(date),
      isToday: dateStr === today,
      isMonthStart: isFirst,
      monthLabel: isFirst || i === 0 ? format(date, 'MMM') : null,
    });
  }

  return days;
}

export function getThisWeekendStart(): string {
  const today = parseISO(getToday());
  const day = getDay(today);
  // If it's Saturday(6) or Sunday(0), return today
  if (day === 6) return formatDate(today);
  if (day === 0) return formatDate(subDays(today, 1));
  return formatDate(nextSaturday(today));
}

export function getNextWeekendStart(): string {
  const thisWeekend = parseISO(getThisWeekendStart());
  return formatDate(addDays(thisWeekend, 7));
}

export function getThisMonthStart(): string {
  return formatDate(startOfMonth(parseISO(getToday())));
}

export function getToday(): string {
  return getTodayInAppTimeZone();
}

export function getCenteredRangeStart(focusDate: string, visibleDays: number): string {
  return formatDate(addDays(parseISO(focusDate), -Math.floor(visibleDays / 2)));
}

export function getYearStart(date: string): string {
  return formatDate(startOfYear(parseISO(date)));
}

export function getTimelineRangeStart(focusDate: string, visibleDays: number): string {
  if (visibleDays >= 365) {
    return getYearStart(focusDate);
  }

  return getCenteredRangeStart(focusDate, visibleDays);
}

export function shiftDate(dateStr: string, days: number): string {
  return formatDate(addDays(parseISO(dateStr), days));
}
