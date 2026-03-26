import { useState } from 'react';
import type { Property } from '../../lib/api';
import { APP_TIMEZONE } from '../../lib/timezone';

interface Props {
  property?: Property | null;
  onSubmit: (data: { name: string; city: string; group_name: string; ical_url: string; timezone: string }) => void;
  onClose: () => void;
}

export function PropertyForm({ property, onSubmit, onClose }: Props) {
  const [name, setName] = useState(property?.name || '');
  const [city, setCity] = useState(property?.city || '');
  const [groupName, setGroupName] = useState(property?.group_name || '');
  const [icalUrl, setIcalUrl] = useState(property?.ical_url || '');
  const [timezone, setTimezone] = useState(property?.timezone || APP_TIMEZONE);

  const isEdit = !!property;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!isEdit && !icalUrl.trim())) return;
    onSubmit({ name: name.trim(), city: city.trim(), group_name: groupName.trim(), ical_url: icalUrl.trim(), timezone });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Property' : 'Add Property'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Property Name *</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Downtown Loft"
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">iCal Feed URL *</label>
              <input
                className="form-input"
                type="url"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/..."
                required={!isEdit}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="form-input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Austin"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <input
                  className="form-input"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Portfolio A"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <input
                className="form-input"
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder={APP_TIMEZONE}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
