import type { Env } from './config.js';
import { normalizeError, json, preflight } from './http.js';
import { handlePropertiesRequest } from './modules/properties/properties.routes.js';
import { handleSyncRequest } from './modules/sync/sync.routes.js';
import { syncAllProperties } from './modules/sync/sync.service.js';
import { handleTimelineRequest } from './modules/timeline/timeline.routes.js';

const worker: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return preflight(request, env);
    }

    try {
      if (url.pathname === '/health') {
        return json(request, env, { status: 'ok' });
      }

      if (url.pathname.startsWith('/api/properties')) {
        return await handlePropertiesRequest(request, env, ctx, url.pathname.split('/').filter(Boolean));
      }

      if (url.pathname.startsWith('/api/timeline')) {
        return await handleTimelineRequest(request, env, url);
      }

      if (url.pathname.startsWith('/api/sync')) {
        return await handleSyncRequest(request, env, ctx, url.pathname.split('/').filter(Boolean));
      }

      return json(request, env, { error: 'Not found' }, { status: 404 });
    } catch (error) {
      const normalized = normalizeError(error);
      console.error(error);
      return json(request, env, { error: normalized.message }, { status: normalized.status });
    }
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(syncAllProperties(env));
  },
};

export default worker;
