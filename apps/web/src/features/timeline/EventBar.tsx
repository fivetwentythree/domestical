import { memo } from 'react';
import type { TimelineEvent } from '../../lib/api';
import { clipEventToRange, getEventStyle } from '../../lib/timelineMath';

interface Props {
  event: TimelineEvent;
  rangeStart: string;
  rangeEnd: string;
  dayWidth: number;
  onSelect: (eventId: number) => void;
}

export const EventBar = memo(function EventBar({
  event,
  rangeStart,
  rangeEnd,
  dayWidth,
  onSelect,
}: Props) {
  const clipped = clipEventToRange(event.startsOn, event.endsOn, rangeStart, rangeEnd);
  if (!clipped) return null;

  const style = getEventStyle(clipped.startOffsetDays, clipped.spanDays, dayWidth);
  const label = event.eventType === 'booked' ? 'Booked' : 'Blocked';
  const showLabel = clipped.spanDays * dayWidth > 76;

  return (
    <div
      className={[
        'event-bar',
        event.eventType,
        clipped.clippedStart && 'is-clipped-start',
        clipped.clippedEnd && 'is-clipped-end',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event.id);
      }}
      title={label}
    >
      {!clipped.clippedStart && <span className={`event-dot ${event.eventType}`} />}
      {showLabel && <span className="event-label">{label}</span>}
    </div>
  );
});
