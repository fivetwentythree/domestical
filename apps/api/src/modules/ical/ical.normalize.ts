import type { RawIcalEvent } from './ical.client.js';
import { classifyEvent } from './ical.classify.js';
import { formatDateInTimeZone, formatDateOnly } from '../../timezone.js';

export interface NormalizedEvent {
  externalUid: string;
  eventType: 'booked' | 'blocked';
  startsOn: string; // YYYY-MM-DD
  endsOn: string;   // YYYY-MM-DD (exclusive)
  summary: string;
  rawStatus: string;
}

export function normalizeEvents(raw: RawIcalEvent[], timeZone: string): NormalizedEvent[] {
  const results: NormalizedEvent[] = [];

  for (const ev of raw) {
    const startsOn = ev.dateOnly ? formatDateOnly(ev.start) : formatDateInTimeZone(ev.start, timeZone);
    const endsOn = ev.dateOnly ? formatDateOnly(ev.end) : formatDateInTimeZone(ev.end, timeZone);

    if (startsOn >= endsOn) continue;

    results.push({
      externalUid: ev.uid,
      eventType: classifyEvent(ev.summary),
      startsOn,
      endsOn,
      summary: ev.summary,
      rawStatus: ev.status || '',
    });
  }

  return results;
}
