import { z } from 'zod';
import { DEFAULT_PROPERTY_TIMEZONE, type Env } from '../../config.js';
import { allRows, batchStatements, firstRow } from '../../db/client.js';
import { HttpError, json, noContent, parseRouteId } from '../../http.js';
import { syncProperty } from '../sync/sync.service.js';

const createSchema = z.object({
  name: z.string().min(1),
  city: z.string().default(''),
  group_name: z.string().default(''),
  ical_url: z.string().url(),
  timezone: z.string().default(DEFAULT_PROPERTY_TIMEZONE),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().optional(),
  group_name: z.string().optional(),
  ical_url: z.string().url().optional(),
  timezone: z.string().optional(),
  is_active: z.number().min(0).max(1).optional(),
  sort_order: z.number().optional(),
});

export async function handlePropertiesRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  pathParts: string[]
) {
  if (pathParts.length === 2 && request.method === 'GET') {
    const properties = await allRows(env, 'SELECT * FROM properties ORDER BY sort_order, name');
    return json(request, env, properties);
  }

  if (pathParts.length === 3 && request.method === 'GET') {
    const id = parseRouteId(pathParts[2]);
    const property = await firstRow(env, 'SELECT * FROM properties WHERE id = ?', id);
    if (!property) {
      throw new HttpError(404, 'Property not found');
    }

    return json(request, env, property);
  }

  if (pathParts.length === 2 && request.method === 'POST') {
    const body = createSchema.parse(await request.json());
    const property = await firstRow<{ id: number } & Record<string, unknown>>(
      env,
      `
        INSERT INTO properties (name, city, group_name, ical_url, timezone)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `,
      body.name,
      body.city,
      body.group_name,
      body.ical_url,
      body.timezone
    );

    if (!property) {
      throw new HttpError(500, 'Failed to create property');
    }

    ctx.waitUntil(
      syncProperty(env, Number(property.id)).catch((error) => {
        console.error(`Initial sync failed for property ${property.id}:`, error);
      })
    );

    return json(request, env, property, { status: 201 });
  }

  if (pathParts.length === 3 && request.method === 'PATCH') {
    const id = parseRouteId(pathParts[2]);
    const body = updateSchema.parse(await request.json());

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (!fields.length) {
      throw new HttpError(400, 'No fields to update');
    }

    const property = await firstRow(
      env,
      `UPDATE properties SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ? RETURNING *`,
      ...values,
      id
    );

    if (!property) {
      throw new HttpError(404, 'Property not found');
    }

    return json(request, env, property);
  }

  if (pathParts.length === 3 && request.method === 'DELETE') {
    const id = parseRouteId(pathParts[2]);
    await batchStatements(env, [
      { sql: 'DELETE FROM calendar_events WHERE property_id = ?', bindings: [id] },
      { sql: 'UPDATE sync_runs SET property_id = NULL WHERE property_id = ?', bindings: [id] },
      { sql: 'DELETE FROM properties WHERE id = ?', bindings: [id] },
    ]);
    return noContent(request, env);
  }

  if (pathParts.length === 4 && pathParts[3] === 'sync' && request.method === 'POST') {
    const id = parseRouteId(pathParts[2]);
    const result = await syncProperty(env, id);
    return json(request, env, result);
  }

  throw new HttpError(404, 'Not found');
}
