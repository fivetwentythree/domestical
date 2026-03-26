import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { fetchCalendar } from '../src/modules/ical/ical.client.ts';
import { normalizeEvents } from '../src/modules/ical/ical.normalize.ts';

interface PropertyRecord {
  id: number;
  name: string;
  ical_url: string;
  timezone: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.resolve(__dirname, '../../../data/atlas.db');
const dbPath = path.resolve(process.cwd(), process.argv[2] ?? defaultDbPath);

const db = new Database(dbPath);

function nowSql() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
}

async function syncProperty(property: PropertyRecord) {
  const runStart = nowSql();
  const insertRun = db.prepare(
    'INSERT INTO sync_runs (property_id, status, started_at) VALUES (?, ?, ?)'
  );
  const syncRun = insertRun.run(property.id, 'running', runStart);
  const syncRunId = Number(syncRun.lastInsertRowid);

  db.prepare(
    'UPDATE properties SET last_sync_status = ?, last_sync_error = NULL, updated_at = ? WHERE id = ?'
  ).run('running', runStart, property.id);

  try {
    const rawEvents = await fetchCalendar(property.ical_url);
    const normalized = normalizeEvents(rawEvents, property.timezone);

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM calendar_events WHERE property_id = ?').run(property.id);

      const insertEvent = db.prepare(`
        INSERT INTO calendar_events (property_id, external_uid, event_type, starts_on, ends_on, summary, raw_status, last_synced_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const timestamp = nowSql();
      for (const event of normalized) {
        insertEvent.run(
          property.id,
          event.externalUid,
          event.eventType,
          event.startsOn,
          event.endsOn,
          event.summary,
          event.rawStatus,
          timestamp,
          timestamp,
          timestamp
        );
      }

      db.prepare(`
        UPDATE properties
        SET last_synced_at = ?, last_sync_status = 'success', last_sync_error = NULL, updated_at = ?
        WHERE id = ?
      `).run(timestamp, timestamp, property.id);

      db.prepare(`
        UPDATE sync_runs
        SET status = 'success', finished_at = ?, event_count = ?, error_message = NULL
        WHERE id = ?
      `).run(timestamp, normalized.length, syncRunId);
    });

    tx();
    console.log(`Synced ${property.name}: ${normalized.length} events`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    const finishedAt = nowSql();
    db.prepare(`
      UPDATE properties
      SET last_sync_status = 'error', last_sync_error = ?, updated_at = ?
      WHERE id = ?
    `).run(message, finishedAt, property.id);
    db.prepare(`
      UPDATE sync_runs
      SET status = 'error', finished_at = ?, error_message = ?
      WHERE id = ?
    `).run(finishedAt, message, syncRunId);
    throw new Error(`Failed syncing ${property.name}: ${message}`);
  }
}

async function main() {
  const properties = db
    .prepare(
      'SELECT id, name, ical_url, timezone FROM properties WHERE is_active = 1 ORDER BY sort_order, name'
    )
    .all() as PropertyRecord[];

  for (const property of properties) {
    await syncProperty(property);
  }

  console.log(`Completed local resync for ${properties.length} properties.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  });
