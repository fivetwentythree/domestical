import { format, parseISO } from 'date-fns';
import type { TimelineEvent, TimelineRow } from '../../lib/api';

interface Props {
  eventId: number;
  rows: TimelineRow[];
  onClose: () => void;
}

export function EventDrawer({ eventId, rows, onClose }: Props) {
  let event: TimelineEvent | null = null;
  let propertyName = '';
  let lastSynced = '';

  for (const row of rows) {
    const found = row.events.find((e) => e.id === eventId);
    if (found) {
      event = found;
      propertyName = row.property.name;
      lastSynced = row.property.lastSyncedAt || 'Never';
      break;
    }
  }

  if (!event) return null;

  const formatDisplayDate = (d: string) => format(parseISO(d), 'EEE, MMM d, yyyy');

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-content">
        <div className="drawer-header">
          <h2>Reservation Details</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-field">
            <div className="field-label">Property</div>
            <div className="field-value">{propertyName}</div>
          </div>
          <div className="drawer-field">
            <div className="field-label">Type</div>
            <div className="field-value">
              <span className={`badge badge-${event.eventType}`}>
                {event.eventType === 'booked' ? 'Booked' : 'Blocked'}
              </span>
            </div>
          </div>
          <div className="drawer-field">
            <div className="field-label">Check-in</div>
            <div className="field-value">{formatDisplayDate(event.startsOn)}</div>
          </div>
          <div className="drawer-field">
            <div className="field-label">Check-out</div>
            <div className="field-value">{formatDisplayDate(event.endsOn)}</div>
          </div>
          {event.summary && (
            <div className="drawer-field">
              <div className="field-label">Summary</div>
              <div className="field-value">{event.summary}</div>
            </div>
          )}
          <div className="drawer-field">
            <div className="field-label">Last Synced</div>
            <div className="field-value" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
              {lastSynced}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
