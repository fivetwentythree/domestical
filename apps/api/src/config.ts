export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

export const APP_TIMEZONE = 'Australia/Hobart';
export const DEFAULT_PROPERTY_TIMEZONE = APP_TIMEZONE;
export const SYNC_CRON = '*/15 * * * *';

export function getAllowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
