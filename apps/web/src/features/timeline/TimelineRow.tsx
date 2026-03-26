import { memo, useMemo } from 'react';
import type { TimelineRow as TimelineRowType } from '../../lib/api';
import type { ZoomLevel } from '../../lib/timelineMath';
import { ZOOM_CONFIGS } from '../../lib/timelineMath';
import { buildVisibleDays } from '../../lib/dates';
import { PropertyCell } from './PropertyCell';
import { EventBar } from './EventBar';

interface Props {
  row: TimelineRowType;
  start: string;
  zoom: ZoomLevel;
  rangeEnd: string;
  onSelectEvent: (eventId: number) => void;
}

export const TimelineRow = memo(function TimelineRow({
  row,
  start,
  zoom,
  rangeEnd,
  onSelectEvent,
}: Props) {
  const config = ZOOM_CONFIGS[zoom];
  const days = useMemo(() => buildVisibleDays(start, config.days), [start, config.days]);
  const sortedEvents = useMemo(
    () =>
      [...row.events].sort((left, right) => {
        const typeOrder = { blocked: 0, booked: 1 } as const;
        return (
          typeOrder[left.eventType] - typeOrder[right.eventType] ||
          left.startsOn.localeCompare(right.startsOn) ||
          left.endsOn.localeCompare(right.endsOn)
        );
      }),
    [row.events]
  );
  const railWidth = config.days * config.dayWidth;

  return (
    <div className="timeline-row">
      <PropertyCell property={row.property} />
      <div className="event-rail" style={{ width: railWidth, minWidth: railWidth }}>
        {/* Day backgrounds */}
        {days.map((day, index) => {
          const classes = [
            'rail-day',
            day.isWeekend && 'is-weekend',
            day.isToday && 'is-today',
            day.isMonthStart && 'is-month-start',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={day.dateStr}
              className={classes}
              style={{
                left: `${index * config.dayWidth}px`,
                width: `${config.dayWidth}px`,
              }}
            />
          );
        })}

        {/* Event bars */}
        {sortedEvents.map((event) => (
          <EventBar
            key={event.id}
            event={event}
            rangeStart={start}
            rangeEnd={rangeEnd}
            dayWidth={config.dayWidth}
            onSelect={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
});
