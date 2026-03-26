import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import worker from '../src/index.ts';
import type { Env } from '../src/config.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.resolve(__dirname, '../../../data/atlas.db');

class FakePreparedStatement {
  constructor(
    private db: Database.Database,
    private sql: string,
    private bindings: unknown[] = []
  ) {}

  bind(...bindings: unknown[]) {
    return new FakePreparedStatement(this.db, this.sql, bindings);
  }

  async all<T>() {
    const results = this.db.prepare(this.sql).all(...this.bindings) as T[];
    return { results };
  }

  async first<T>() {
    return (this.db.prepare(this.sql).get(...this.bindings) as T | undefined) ?? null;
  }

  async run() {
    const meta = this.db.prepare(this.sql).run(...this.bindings);
    return { success: true, meta };
  }
}

class FakeD1Database {
  constructor(private db: Database.Database) {}

  prepare(sql: string) {
    return new FakePreparedStatement(this.db, sql);
  }

  async batch(statements: FakePreparedStatement[]) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson(
  env: Env,
  ctx: ExecutionContext,
  pathName: string
) {
  const response = await worker.fetch(new Request(`http://localhost:3001${pathName}`), env, ctx);
  assert(response.ok, `${pathName} returned ${response.status}`);
  return response.json();
}

async function main() {
  const dbPath = path.resolve(process.cwd(), process.argv[2] ?? defaultDbPath);
  const sqlite = new Database(dbPath, { readonly: true });
  const backgroundTasks: Promise<unknown>[] = [];

  try {
    const env: Env = {
      DB: new FakeD1Database(sqlite) as unknown as D1Database,
      ALLOWED_ORIGIN: 'http://localhost:5173',
    };
    const ctx: ExecutionContext = {
      waitUntil(promise) {
        backgroundTasks.push(Promise.resolve(promise));
      },
    };

    const health = await requestJson(env, ctx, '/health');
    assert(
      typeof health === 'object' && health !== null && 'status' in health && health.status === 'ok',
      'Health endpoint did not return { status: "ok" }'
    );

    const properties = await requestJson(env, ctx, '/api/properties');
    assert(Array.isArray(properties), 'Properties endpoint did not return an array');

    const timeline = await requestJson(env, ctx, '/api/timeline?start=2026-03-26&days=30');
    assert(
      typeof timeline === 'object' &&
        timeline !== null &&
        'rows' in timeline &&
        Array.isArray(timeline.rows) &&
        'range' in timeline,
      'Timeline endpoint returned an unexpected payload'
    );

    const syncStatus = await requestJson(env, ctx, '/api/sync/status');
    assert(
      typeof syncStatus === 'object' &&
        syncStatus !== null &&
        'properties' in syncStatus &&
        Array.isArray(syncStatus.properties) &&
        'lastRun' in syncStatus,
      'Sync status endpoint returned an unexpected payload'
    );

    await Promise.allSettled(backgroundTasks);

    console.log(`health ok`);
    console.log(`properties rows: ${properties.length}`);
    console.log(`timeline rows: ${timeline.rows.length}`);
    console.log(`sync status rows: ${syncStatus.properties.length}`);
    console.log('Worker smoke test passed.');
  } finally {
    sqlite.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
