import { Fragment, memo } from 'react';
import type { TimelineEvent } from '../../lib/api';
import { clipBlockedEventToRange } from '../../lib/timelineMath';

interface Props {
  event: TimelineEvent;
  rangeStart: string;
  rangeEnd: string;
  dayWidth: number;
  onSelect: (eventId: number) => void;
}

export const BlockedRange = memo(function BlockedRange({
  event,
  rangeStart,
  rangeEnd,
  dayWidth,
  onSelect,
}: Props) {
  const clipped = clipBlockedEventToRange(event.startsOn, event.endsOn, rangeStart, rangeEnd);
  if (!clipped) return null;

  const label = event.summary || 'Blocked';

  return (
    <Fragment>
      {Array.from({ length: clipped.endDay - clipped.startDay }, (_, index) => {
        const dayOffset = clipped.startDay + index;

        return (
          <div
            key={`${event.id}-${dayOffset}`}
            className="blocked-day"
            style={{
              left: `${dayOffset * dayWidth}px`,
              width: `${dayWidth}px`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(event.id);
            }}
            title={label}
          />
        );
      })}
    </Fragment>
  );
});
