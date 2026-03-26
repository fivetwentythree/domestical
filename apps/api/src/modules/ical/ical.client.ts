import ical from 'node-ical';

export interface RawIcalEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  type: string;
  dateOnly: boolean;
  status?: string;
  description?: string;
}

export async function fetchCalendar(url: string): Promise<RawIcalEvent[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
  }

  const rawIcs = await response.text();
  const parser = ical as unknown as {
    sync?: { parseICS: (data: string) => Record<string, unknown> };
    parseICS?: (data: string) => Record<string, unknown>;
  };
  const data = parser.sync?.parseICS(rawIcs) ?? parser.parseICS?.(rawIcs);
  if (!data) {
    throw new Error('Unable to parse calendar feed');
  }

  const events: RawIcalEvent[] = [];

  for (const [, component] of Object.entries(data)) {
    if (!component || typeof component !== 'object') continue;
    const ev = component as {
      type?: string;
      uid?: string;
      summary?: string;
      start?: Date | string;
      end?: Date | string;
      datetype?: 'date' | 'date-time';
      status?: string;
      description?: string;
    };

    if (ev.type !== 'VEVENT') continue;
    if (!ev.start || !ev.end) continue;

    events.push({
      uid: ev.uid || '',
      summary: ev.summary || '',
      start: new Date(ev.start),
      end: new Date(ev.end),
      type: ev.type,
      dateOnly:
        ev.datetype === 'date' ||
        Boolean((ev.start as Date & { dateOnly?: boolean } | undefined)?.dateOnly),
      status: ev.status || '',
      description: ev.description || '',
    });
  }

  return events;
}
