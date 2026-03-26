import { APP_TIMEZONE } from './config.js';

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
  const normalized = resolveTimeZone(timeZone);
  const existing = formatterCache.get(normalized);
  if (existing) return existing;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: normalized,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  formatterCache.set(normalized, formatter);
  return formatter;
}

export function resolveTimeZone(timeZone?: string | null) {
  const candidate = timeZone?.trim();
  if (!candidate) return APP_TIMEZONE;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return APP_TIMEZONE;
  }
}

export function formatDateOnly(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateInTimeZone(date: Date, timeZone = APP_TIMEZONE) {
  const formatter = getFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date in timezone ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

export function getTodayInTimeZone(timeZone = APP_TIMEZONE) {
  return formatDateInTimeZone(new Date(), timeZone);
}
