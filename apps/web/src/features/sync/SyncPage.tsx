import { useSyncStatus, useRunGlobalSync, useRunPropertySync } from './queries';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function SyncPage() {
  const { data, isLoading } = useSyncStatus();
  const globalSync = useRunGlobalSync();
  const propertySync = useRunPropertySync();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sync Center</h1>
        <button
          className="btn btn-primary"
          onClick={() => globalSync.mutate()}
          disabled={globalSync.isPending}
        >
          {globalSync.isPending ? 'Syncing…' : '↻ Sync All'}
        </button>
      </div>

      {data?.lastRun && (
        <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            Last Global Sync
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
            <div>
              <span style={{ color: 'var(--gray-500)' }}>Status: </span>
              <span className={`badge badge-${data.lastRun.status === 'error' ? 'error' : 'success'}`}>
                {data.lastRun.status}
              </span>
            </div>
            <div style={{ color: 'var(--gray-600)' }}>
              {data.lastRun.started_at &&
                formatDistanceToNow(parseISO(data.lastRun.started_at), { addSuffix: true })}
            </div>
            {data.lastRun.event_count !== null && (
              <div style={{ color: 'var(--gray-600)' }}>
                {data.lastRun.event_count} events
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="empty-state"><p>Loading…</p></div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Status</th>
                <th>Last Synced</th>
                <th>Error</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.properties.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{p.name}</td>
                  <td>
                    <span className={`badge badge-${p.last_sync_status === 'error' ? 'error' : 'success'}`}>
                      {p.last_sync_status}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                    {p.last_synced_at
                      ? formatDistanceToNow(parseISO(p.last_synced_at), { addSuffix: true })
                      : 'Never'}
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.last_sync_error || '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 'var(--text-xs)' }}
                      onClick={() => propertySync.mutate(p.id)}
                      disabled={propertySync.isPending}
                    >
                      Sync
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
