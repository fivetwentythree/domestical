import { useEffect, useMemo, useRef } from 'react';
import type { TimelineRow as TimelineRowData } from '../../lib/api';
import { LABEL_COL_WIDTH } from '../../lib/constants';
import { getDayIndex, type ZoomLevel } from '../../lib/timelineMath';
import { ZOOM_CONFIGS } from '../../lib/timelineMath';
import { shiftDate } from '../../lib/dates';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRow } from './TimelineRow';

interface Props {
  rows: TimelineRowData[];
  focusDate: string;
  start: string;
  zoom: ZoomLevel;
  onSelectEvent: (eventId: number) => void;
  onAddProperty?: () => void;
}

export function TimelineGrid({ rows, focusDate, start, zoom, onSelectEvent, onAddProperty }: Props) {
  const config = ZOOM_CONFIGS[zoom];
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const syncFrameRef = useRef<number | null>(null);
  const rangeEnd = useMemo(() => shiftDate(start, config.days), [start, config.days]);

  useEffect(() => {
    const header = headerScrollRef.current;
    const body = bodyScrollRef.current;
    if (!header || !body) return;

    const visibleRailWidth = body.clientWidth - LABEL_COL_WIDTH;
    if (visibleRailWidth <= 0) return;

    const focusIndex = getDayIndex(focusDate, start);
    const focusOffset = (focusIndex + 0.5) * config.dayWidth;
    const nextScrollLeft = Math.max(0, focusOffset - visibleRailWidth / 2);

    header.scrollLeft = nextScrollLeft;
    body.scrollLeft = nextScrollLeft;
  }, [config.dayWidth, config.days, focusDate, rows.length, start, zoom]);

  useEffect(() => {
    const header = headerScrollRef.current;
    const body = bodyScrollRef.current;
    if (!header || !body) return;
    const headerElement = header;
    const bodyElement = body;

    function syncScroll(source: HTMLElement, target: HTMLElement) {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }

      target.scrollLeft = source.scrollLeft;
      syncFrameRef.current = requestAnimationFrame(() => {
        syncFrameRef.current = null;
      });
    }

    function handleHeaderScroll() {
      if (syncFrameRef.current !== null) return;
      syncScroll(headerElement, bodyElement);
    }

    function handleBodyScroll() {
      if (syncFrameRef.current !== null) return;
      syncScroll(bodyElement, headerElement);
    }

    function handleHeaderWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (headerElement.scrollWidth <= headerElement.clientWidth) return;

      event.preventDefault();
      headerElement.scrollLeft += event.deltaY;
      bodyElement.scrollLeft = headerElement.scrollLeft;
    }

    headerElement.addEventListener('scroll', handleHeaderScroll, { passive: true });
    bodyElement.addEventListener('scroll', handleBodyScroll, { passive: true });
    headerElement.addEventListener('wheel', handleHeaderWheel, { passive: false });

    return () => {
      headerElement.removeEventListener('scroll', handleHeaderScroll);
      bodyElement.removeEventListener('scroll', handleBodyScroll);
      headerElement.removeEventListener('wheel', handleHeaderWheel);
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }
    };
  }, []);

  if (rows.length === 0) {
    return (
      <div className="onboarding-empty">
        <div className="onboarding-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            <line x1="4" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <line x1="16" y1="8" x2="16" y2="40" stroke="currentColor" strokeWidth="2" opacity="0.15" />
            <rect x="18" y="20" width="12" height="4" rx="2" fill="currentColor" opacity="0.2" />
            <rect x="18" y="28" width="20" height="4" rx="2" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        <h3>Your calendar is empty</h3>
        <p>Add your Airbnb properties to see all bookings in one timeline.</p>
        {onAddProperty && (
          <button className="btn btn-primary" onClick={onAddProperty} style={{ marginTop: 'var(--space-2)' }}>
            + Add Your First Property
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header-shell" ref={headerScrollRef}>
        <TimelineHeader start={start} zoom={zoom} />
      </div>
      <div className="timeline-body" ref={bodyScrollRef}>
        {rows.map((row) => (
          <TimelineRow
            key={row.property.id}
            row={row}
            start={start}
            zoom={zoom}
            rangeEnd={rangeEnd}
            onSelectEvent={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
}
