const BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const error = await res.text().catch(() => 'Request failed');
    throw new Error(error);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Timeline
export interface TimelineEvent {
  id: number;
  externalUid: string;
  eventType: 'booked' | 'blocked';
  startsOn: string;
  endsOn: string;
  summary: string;
}

export interface TimelineProperty {
  id: number;
  name: string;
  city: string;
  groupName: string;
  lastSyncedAt: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
}

export interface TimelineRow {
  property: TimelineProperty;
  events: TimelineEvent[];
}

export interface TimelineResponse {
  range: { start: string; end: string; days: number };
  rows: TimelineRow[];
}

export function getTimeline(start: string, days: number) {
  return request<TimelineResponse>(`/timeline?start=${start}&days=${days}`);
}

// Properties
export interface Property {
  id: number;
  name: string;
  city: string;
  group_name: string;
  ical_url: string;
  timezone: string;
  is_active: number;
  sort_order: number;
  last_synced_at: string | null;
  last_sync_status: string;
  last_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export function getProperties() {
  return request<Property[]>('/properties');
}

export function createProperty(data: {
  name: string;
  city?: string;
  group_name?: string;
  ical_url: string;
  timezone?: string;
}) {
  return request<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProperty(id: number, data: Partial<Property>) {
  return request<Property>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProperty(id: number) {
  return request<void>(`/properties/${id}`, { method: 'DELETE' });
}

export function syncProperty(id: number) {
  return request<{ success: boolean; eventCount: number }>(`/properties/${id}/sync`, {
    method: 'POST',
  });
}

// Sync
export interface SyncStatus {
  properties: Array<{
    id: number;
    name: string;
    last_synced_at: string | null;
    last_sync_status: string;
    last_sync_error: string | null;
  }>;
  lastRun: {
    id: number;
    status: string;
    started_at: string;
    finished_at: string | null;
    event_count: number;
    error_message: string | null;
  } | null;
}

export function getSyncStatus() {
  return request<SyncStatus>('/sync/status');
}

export function runGlobalSync() {
  return request<{ message: string }>('/sync/run', { method: 'POST' });
}
