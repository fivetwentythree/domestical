import { addDays, parseISO } from 'date-fns';
import { APP_TIMEZONE, type Env } from '../../config.js';
import { allRows } from '../../db/client.js';
import { json } from '../../http.js';
import { getTodayInTimeZone, formatDateOnly } from '../../timezone.js';

export async function handleTimelineRequest(request: Request, env: Env, url: URL) {
  const startDate = url.searchParams.get('start') || getTodayInTimeZone(APP_TIMEZONE);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '14', 10), 1), 365);
  const endDate = formatDateOnly(addDays(parseISO(startDate), days));

  const properties = await allRows<any>(
    env,
    'SELECT * FROM properties WHERE is_active = 1 ORDER BY sort_order, name'
  );

  const events = await allRows<any>(
    env,
    `
      SELECT * FROM calendar_events
      WHERE property_id IN (SELECT id FROM properties WHERE is_active = 1)
        AND starts_on < ?
        AND ends_on > ?
      ORDER BY starts_on
    `,
    endDate,
    startDate
  );

  const eventsByProperty = new Map<number, any[]>();
  for (const event of events) {
    const list = eventsByProperty.get(event.property_id) || [];
    list.push({
      id: event.id,
      externalUid: event.external_uid,
      eventType: event.event_type,
      startsOn: event.starts_on,
      endsOn: event.ends_on,
      summary: event.summary,
    });
    eventsByProperty.set(event.property_id, list);
  }

  const rows = properties.map((property) => ({
    property: {
      id: property.id,
      name: property.name,
      city: property.city,
      groupName: property.group_name,
      lastSyncedAt: property.last_synced_at,
      lastSyncStatus: property.last_sync_status,
      lastSyncError: property.last_sync_error,
    },
    events: eventsByProperty.get(property.id) || [],
  }));

  return json(request, env, {
    range: { start: startDate, end: endDate, days },
    rows,
  });
}
