import { useState } from 'react';
import { useProperties, useCreateProperty, useDeleteProperty, useSyncProperty } from './queries';
import { PropertyForm } from './PropertyForm';
import type { Property } from '../../lib/api';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();
  const createMutation = useCreateProperty();
  const deleteMutation = useDeleteProperty();
  const syncMutation = useSyncProperty();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (data: { name: string; city: string; group_name: string; ical_url: string; timezone: string }) => {
    createMutation.mutate(data, { onSuccess: () => setShowForm(false) });
  };

  const handleDelete = (id: number) => {
    if (confirm('Remove this property?')) deleteMutation.mutate(id);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Properties</h1>
        {properties && properties.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Property
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="onboarding-empty">
          <p style={{ color: 'var(--gray-400)' }}>Loading…</p>
        </div>
      ) : !properties?.length ? (
        <div className="onboarding-empty" style={{ minHeight: 400 }}>
          <div className="onboarding-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="6" y="12" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
              <path d="M20 22h16M20 28h12M20 34h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
              <circle cx="44" cy="40" r="10" fill="currentColor" opacity="0.08" />
              <path d="M44 36v8M40 40h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>
          <h3>Add your first property</h3>
          <p>
            Paste an Airbnb iCal feed URL to start seeing bookings on your calendar timeline.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 4 }}>
            + Add Property
          </button>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Group</th>
                <th>Status</th>
                <th>Last Synced</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p: Property) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{p.name}</td>
                  <td>{p.city || '—'}</td>
                  <td>{p.group_name || '—'}</td>
                  <td>
                    <span className={`badge badge-${p.last_sync_status === 'error' ? 'error' : p.last_sync_status === 'success' ? 'success' : 'blocked'}`}>
                      {p.last_sync_status}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>
                    {p.last_synced_at
                      ? formatDistanceToNow(parseISO(p.last_synced_at), { addSuffix: true })
                      : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => syncMutation.mutate(p.id)}
                        disabled={syncMutation.isPending}
                      >
                        ↻ Sync
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <PropertyForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
