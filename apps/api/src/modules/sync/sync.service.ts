import type { Env } from '../../config.js';
import { allRows, batchStatements, chunk, firstRow, runStatement } from '../../db/client.js';
import { HttpError } from '../../http.js';
import { fetchCalendar } from '../ical/ical.client.js';
import { normalizeEvents } from '../ical/ical.normalize.js';

interface PropertyRecord {
  id: number;
  ical_url: string;
  timezone: string;
}

export async function syncProperty(env: Env, propertyId: number) {
  const property = await firstRow<PropertyRecord>(
    env,
    'SELECT id, ical_url, timezone FROM properties WHERE id = ?',
    propertyId
  );
  if (!property) throw new HttpError(404, `Property ${propertyId} not found`);

  await runStatement(
    env,
    "UPDATE properties SET last_sync_status = ?, updated_at = datetime('now') WHERE id = ?",
    'running',
    propertyId
  );

  const syncRun = await firstRow<{ id: number }>(
    env,
    'INSERT INTO sync_runs (property_id, status) VALUES (?, ?) RETURNING id',
    propertyId,
    'running'
  );
  if (!syncRun) {
    throw new Error(`Unable to create sync run for property ${propertyId}`);
  }

  try {
    const rawEvents = await fetchCalendar(property.ical_url);
    const normalized = normalizeEvents(rawEvents, property.timezone);

    await runStatement(env, 'DELETE FROM calendar_events WHERE property_id = ?', propertyId);

    for (const eventChunk of chunk(normalized, 100)) {
      await batchStatements(
        env,
        eventChunk.map((event) => ({
          sql: `
            INSERT INTO calendar_events (property_id, external_uid, event_type, starts_on, ends_on, summary, raw_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          bindings: [
            propertyId,
            event.externalUid,
            event.eventType,
            event.startsOn,
            event.endsOn,
            event.summary,
            event.rawStatus,
          ],
        }))
      );
    }

    await batchStatements(env, [
      {
        sql: `
          UPDATE properties
          SET last_synced_at = datetime('now'), last_sync_status = 'success', last_sync_error = NULL, updated_at = datetime('now')
          WHERE id = ?
        `,
        bindings: [propertyId],
      },
      {
        sql: `
          UPDATE sync_runs SET status = 'success', finished_at = datetime('now'), event_count = ? WHERE id = ?
        `,
        bindings: [normalized.length, syncRun.id],
      },
    ]);

    return { success: true, eventCount: normalized.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await batchStatements(env, [
      {
        sql: `
          UPDATE properties
          SET last_sync_status = 'error', last_sync_error = ?, updated_at = datetime('now')
          WHERE id = ?
        `,
        bindings: [message, propertyId],
      },
      {
        sql: `
          UPDATE sync_runs SET status = 'error', finished_at = datetime('now'), error_message = ? WHERE id = ?
        `,
        bindings: [message, syncRun.id],
      },
    ]);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(message);
  }
}

export async function syncAllProperties(env: Env) {
  const properties = await allRows<{ id: number }>(
    env,
    'SELECT id FROM properties WHERE is_active = 1'
  );

  const results = [];
  for (const prop of properties) {
    try {
      const result = await syncProperty(env, prop.id);
      results.push({ propertyId: prop.id, ...result });
    } catch (error) {
      results.push({
        propertyId: prop.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      });
    }
  }
  return results;
}
