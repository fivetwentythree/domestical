import { memo } from 'react';
import type { TimelineProperty } from '../../lib/api';

interface Props {
  property: TimelineProperty;
}

export const PropertyCell = memo(function PropertyCell({ property }: Props) {
  return (
    <div className="property-cell">
      <div className="property-info">
        <div className="property-name">{property.name}</div>
        <div className="property-meta">
          {[property.city, property.groupName].filter(Boolean).join(' · ') || '—'}
        </div>
      </div>
      <span className={`sync-dot ${property.lastSyncStatus}`} />
    </div>
  );
});
