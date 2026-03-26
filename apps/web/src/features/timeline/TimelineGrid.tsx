import { useEffect, useMemo, useRef, useState } from 'react';
import type { TimelineRow as TimelineRowData } from '../../lib/api';
import { getDayIndex, type ZoomLevel } from '../../lib/timelineMath';
import { ZOOM_CONFIGS } from '../../lib/timelineMath';
import { shiftDate } from '../../lib/dates';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRow } from './TimelineRow';
import { PropertyCell } from './PropertyCell';

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
  const propertyScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
  const rangeEnd = useMemo(() => shiftDate(start, config.days), [start, config.days]);

  useEffect(() => {
    const header = headerScrollRef.current;
    const body = bodyScrollRef.current;
    if (!header || !body) return;

    const visibleRailWidth = body.clientWidth;
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
    const property = propertyScrollRef.current;
    if (!header || !body || !property) return;
    const headerElement = header;
    const bodyElement = body;
    const propertyElement = property;
    let horizontalFrame: number | null = null;
    let verticalFrame: number | null = null;
    let syncingHorizontal = false;
    let syncingVertical = false;

    function syncHorizontal(source: HTMLElement, target: HTMLElement) {
      if (horizontalFrame !== null) {
        cancelAnimationFrame(horizontalFrame);
      }

      syncingHorizontal = true;
      target.scrollLeft = source.scrollLeft;
      horizontalFrame = requestAnimationFrame(() => {
        syncingHorizontal = false;
        horizontalFrame = null;
      });
    }

    function syncVertical(source: HTMLElement, target: HTMLElement) {
      if (verticalFrame !== null) {
        cancelAnimationFrame(verticalFrame);
      }

      syncingVertical = true;
      target.scrollTop = source.scrollTop;
      verticalFrame = requestAnimationFrame(() => {
        syncingVertical = false;
        verticalFrame = null;
      });
    }

    function handleHeaderScroll() {
      if (syncingHorizontal) return;
      syncHorizontal(headerElement, bodyElement);
    }

    function handleBodyScroll() {
      if (!syncingHorizontal) {
        syncHorizontal(bodyElement, headerElement);
      }

      if (!syncingVertical) {
        syncVertical(bodyElement, propertyElement);
      }
    }

    function handlePropertyScroll() {
      if (syncingVertical) return;
      syncVertical(propertyElement, bodyElement);
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
    propertyElement.addEventListener('scroll', handlePropertyScroll, { passive: true });
    headerElement.addEventListener('wheel', handleHeaderWheel, { passive: false });

    return () => {
      headerElement.removeEventListener('scroll', handleHeaderScroll);
      bodyElement.removeEventListener('scroll', handleBodyScroll);
      propertyElement.removeEventListener('scroll', handlePropertyScroll);
      headerElement.removeEventListener('wheel', handleHeaderWheel);
      if (horizontalFrame !== null) {
        cancelAnimationFrame(horizontalFrame);
      }
      if (verticalFrame !== null) {
        cancelAnimationFrame(verticalFrame);
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
      <div className="timeline-header-shell">
        <div className="timeline-header-fixed">
          <div className="timeline-header-fixed-row timeline-header-fixed-row-months" />
          <div className="timeline-header-fixed-row timeline-header-fixed-row-days">
            <span className="timeline-side-label">Properties</span>
          </div>
        </div>
        <div className="timeline-header-scroll" ref={headerScrollRef}>
          <TimelineHeader start={start} zoom={zoom} />
        </div>
      </div>

      <div className="timeline-body-shell">
        <div className="timeline-property-column" ref={propertyScrollRef}>
          {rows.map((row) => (
            <div
              key={row.property.id}
              className={[
                'timeline-property-row',
                hoveredPropertyId === row.property.id && 'is-hovered',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setHoveredPropertyId(row.property.id)}
              onMouseLeave={() => setHoveredPropertyId(null)}
            >
              <PropertyCell property={row.property} />
            </div>
          ))}
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
              isHovered={hoveredPropertyId === row.property.id}
              onHoverChange={setHoveredPropertyId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
