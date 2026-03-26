import { ZodError } from 'zod';
import { getAllowedOrigins, type Env } from './config.js';

const DEFAULT_LOCAL_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function isAllowedOrigin(origin: string | null, env: Env): origin is string {
  if (!origin) return false;
  return DEFAULT_LOCAL_ORIGINS.has(origin) || getAllowedOrigins(env).includes(origin);
}

function buildCorsHeaders(request: Request, env: Env) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  });

  const origin = request.headers.get('Origin');
  if (isAllowedOrigin(origin, env)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

function mergeHeaders(base: Headers, extra?: HeadersInit) {
  if (!extra) return base;
  new Headers(extra).forEach((value, key) => base.set(key, value));
  return base;
}

export function json(request: Request, env: Env, data: unknown, init: ResponseInit = {}) {
  const headers = mergeHeaders(buildCorsHeaders(request, env), init.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function text(request: Request, env: Env, body: string, init: ResponseInit = {}) {
  const headers = mergeHeaders(buildCorsHeaders(request, env), init.headers);
  headers.set('Content-Type', 'text/plain; charset=utf-8');
  return new Response(body, {
    ...init,
    headers,
  });
}

export function noContent(request: Request, env: Env) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request, env),
  });
}

export function preflight(request: Request, env: Env) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request, env),
  });
}

export function getPathParts(pathname: string) {
  return pathname.split('/').filter(Boolean);
}

export function parseRouteId(rawId: string | undefined) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Invalid id');
  }
  return id;
}

export function normalizeError(error: unknown) {
  if (error instanceof HttpError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues.map((issue) => issue.message).join(', ') || 'Invalid request body',
    };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message || 'Internal server error' };
  }

  return { status: 500, message: 'Internal server error' };
}
