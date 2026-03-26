import type { Env } from '../../config.js';
import { allRows, firstRow } from '../../db/client.js';
import { HttpError, json, parseRouteId } from '../../http.js';
import { syncAllProperties, syncProperty } from './sync.service.js';

export async function handleSyncRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  pathParts: string[]
) {
  if (pathParts.length === 3 && pathParts[2] === 'status' && request.method === 'GET') {
    const properties = await allRows(
      env,
      `
        SELECT id, name, last_synced_at, last_sync_status, last_sync_error
        FROM properties WHERE is_active = 1
        ORDER BY sort_order, name
      `
    );

    const lastRun = await firstRow(
      env,
      'SELECT * FROM sync_runs ORDER BY started_at DESC LIMIT 1'
    );

    return json(request, env, { properties, lastRun });
  }

  if (pathParts.length === 3 && pathParts[2] === 'run' && request.method === 'POST') {
    ctx.waitUntil(
      syncAllProperties(env).catch((error) => {
        console.error('Global sync error:', error);
      })
    );
    return json(request, env, { message: 'Sync started' }, { status: 202 });
  }

  if (pathParts.length === 4 && pathParts[2] === 'properties' && request.method === 'POST') {
    const id = parseRouteId(pathParts[3]);
    const result = await syncProperty(env, id);
    return json(request, env, result);
  }

  throw new HttpError(404, 'Not found');
}
