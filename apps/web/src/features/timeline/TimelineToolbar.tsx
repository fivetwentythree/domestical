import { useState, forwardRef } from 'react';
import {
  getToday,
  shiftDate,
  getThisWeekendStart,
  getNextWeekendStart,
  getThisMonthStart,
} from '../../lib/dates';
import { ZOOM_CONFIGS, type ZoomLevel } from '../../lib/timelineMath';
import { format, parseISO } from 'date-fns';

interface Props {
  focusDate: string;
  start: string;
  zoom: ZoomLevel;
  search: string;
  groupFilter: string;
  groups: string[];
  onFocusDateChange: (s: string) => void;
  onZoomChange: (z: ZoomLevel) => void;
  onSearchChange: (s: string) => void;
  onGroupFilterChange: (g: string) => void;
  onRefresh: () => void;
  isSyncing?: boolean;
  lastSyncedAt?: string | null;
}

const ZOOM_LEVELS: ZoomLevel[] = [7, 14, 30];

export const TimelineToolbar = forwardRef<HTMLInputElement, Props>(function TimelineToolbar(
  {
    focusDate,
    start,
    zoom,
    search,
    groups,
    groupFilter,
    onFocusDateChange,
    onZoomChange,
    onSearchChange,
    onGroupFilterChange,
    onRefresh,
    isSyncing,
    lastSyncedAt,
  },
  searchRef
) {
  const [showQuickJumps, setShowQuickJumps] = useState(false);

  const config = ZOOM_CONFIGS[zoom];
  const displayRange = `${format(parseISO(start), 'MMM d')} — ${format(
    parseISO(shiftDate(start, config.days - 1)),
    'MMM d, yyyy'
  )}`;

  return (
    <div className="toolbar">
      <span className="toolbar-title">Domestica Hobart Master Calendar</span>

      <input
        ref={searchRef}
        type="text"
        className="search-input"
        placeholder="Search properties…  /"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {groups.length > 0 && (
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 120 }}
          value={groupFilter}
          onChange={(e) => onGroupFilterChange(e.target.value)}
        >
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      )}

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className="btn btn-default"
          onClick={() => onFocusDateChange(getToday())}
        >
          Today
        </button>
        <button
          className="btn btn-default btn-icon"
          onClick={() => onFocusDateChange(shiftDate(focusDate, -config.days))}
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          className="btn btn-default btn-icon"
          onClick={() => onFocusDateChange(shiftDate(focusDate, config.days))}
          aria-label="Next"
        >
          ›
        </button>
        <span className="tabular-nums" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', minWidth: 160, textAlign: 'center' }}>
          {displayRange}
        </span>
      </div>

      <div className="quick-jumps">
        <button
          className="btn btn-ghost"
          onClick={() => setShowQuickJumps(!showQuickJumps)}
        >
          Jump ▾
        </button>
        {showQuickJumps && (
          <div className="quick-jumps-menu">
            <button
              className="quick-jumps-item"
              onClick={() => {
                onFocusDateChange(getThisWeekendStart());
                setShowQuickJumps(false);
              }}
            >
              This weekend
            </button>
            <button
              className="quick-jumps-item"
              onClick={() => {
                onFocusDateChange(getNextWeekendStart());
                setShowQuickJumps(false);
              }}
            >
              Next weekend
            </button>
            <button
              className="quick-jumps-item"
              onClick={() => {
                onFocusDateChange(getThisMonthStart());
                setShowQuickJumps(false);
              }}
            >
              This month
            </button>
            <button
              className="quick-jumps-item"
              onClick={() => {
                onZoomChange(30);
                onFocusDateChange(getToday());
                setShowQuickJumps(false);
              }}
            >
              Next 30 days
            </button>
          </div>
        )}
      </div>

      <div className="zoom-group">
        {ZOOM_LEVELS.map((z) => (
          <button
            key={z}
            className={`zoom-btn ${zoom === z ? 'active' : ''}`}
            onClick={() => onZoomChange(z)}
          >
            {z}d
          </button>
        ))}
      </div>

      <div className="toolbar-spacer" />

      <div className="sync-pill" onClick={onRefresh} style={{ cursor: 'pointer' }}>
        <span className="sync-indicator" />
        <span>{isSyncing ? 'Syncing…' : lastSyncedAt ? `Synced` : 'Not synced'}</span>
      </div>

      <button className="btn btn-default" onClick={onRefresh} disabled={isSyncing}>
        ↻ Refresh
      </button>
    </div>
  );
});
