import type { Env } from '../config.js';

export async function allRows<T>(env: Env, sql: string, ...bindings: unknown[]) {
  const result = await env.DB.prepare(sql).bind(...bindings).all<T>();
  return (result.results ?? []) as T[];
}

export async function firstRow<T>(env: Env, sql: string, ...bindings: unknown[]) {
  const result = await env.DB.prepare(sql).bind(...bindings).first<T>();
  return (result ?? null) as T | null;
}

export async function runStatement(env: Env, sql: string, ...bindings: unknown[]) {
  return env.DB.prepare(sql).bind(...bindings).run();
}

export async function batchStatements(
  env: Env,
  statements: Array<{ sql: string; bindings?: unknown[] }>
) {
  if (!statements.length) return;

  await env.DB.batch(
    statements.map(({ sql, bindings = [] }) => env.DB.prepare(sql).bind(...bindings))
  );
}

export function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
