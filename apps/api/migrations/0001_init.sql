CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT '',
  ical_url TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Australia/Hobart',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  last_synced_at TEXT,
  last_sync_status TEXT NOT NULL DEFAULT 'idle',
  last_sync_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  external_uid TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'booked',
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  summary TEXT,
  raw_status TEXT,
  last_synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_property_dates ON calendar_events(property_id, starts_on, ends_on);
CREATE INDEX IF NOT EXISTS idx_events_property_uid ON calendar_events(property_id, external_uid);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  event_count INTEGER DEFAULT 0,
  error_message TEXT
);
