import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { buildVisibleDays } from '../../lib/dates';
import type { ZoomLevel } from '../../lib/timelineMath';
import { ZOOM_CONFIGS } from '../../lib/timelineMath';

interface Props {
  start: string;
  zoom: ZoomLevel;
}

export const TimelineHeader = memo(function TimelineHeader({ start, zoom }: Props) {
  const config = ZOOM_CONFIGS[zoom];
  const days = buildVisibleDays(start, config.days);
  const months = useMemo(() => {
    const segments: Array<{ key: string; label: string; span: number }> = [];

    days.forEach((day) => {
      const key = format(day.date, 'yyyy-MM');
      const last = segments[segments.length - 1];

      if (last?.key === key) {
        last.span += 1;
        return;
      }

      segments.push({
        key,
        label: format(day.date, 'MMMM yyyy'),
        span: 1,
      });
    });

    return segments;
  }, [days]);

  return (
    <div className="timeline-header">
      <div className="timeline-header-row timeline-header-row-months">
        <div className="timeline-header-months">
          {months.map((month) => (
            <div
              key={month.key}
              className="timeline-header-month"
              style={{
                width: month.span * config.dayWidth,
                minWidth: month.span * config.dayWidth,
              }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-header-row timeline-header-row-days">
        <div className="timeline-header-days">
          {days.map((day) => {
            const classes = [
              'timeline-header-day',
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
                style={{ width: config.dayWidth, minWidth: config.dayWidth }}
              >
                <span className="day-name">{format(day.date, 'EEEEE')}</span>
                <span className="day-number">{day.dayNumber}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
