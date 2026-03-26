import { useMemo, useState, useCallback } from 'react';
import { getTimelineRangeStart, getToday } from '../../lib/dates';
import { DEFAULT_ZOOM } from '../../lib/constants';
import { ZOOM_CONFIGS, type ZoomLevel } from '../../lib/timelineMath';

export interface TimelineState {
  focusDate: string;
  start: string;
  zoom: ZoomLevel;
  search: string;
  groupFilter: string;
  selectedEventId: number | null;
}

export function useTimelineState() {
  const [zoom, setZoom] = useState<ZoomLevel>(DEFAULT_ZOOM);
  const [focusDate, setFocusDate] = useState(getToday());
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const start = useMemo(
    () => getTimelineRangeStart(focusDate, ZOOM_CONFIGS[zoom].days),
    [focusDate, zoom]
  );

  const goToDate = useCallback((date: string) => setFocusDate(date), []);
  const clearSelection = useCallback(() => setSelectedEventId(null), []);

  return {
    focusDate,
    start,
    zoom,
    search,
    groupFilter,
    selectedEventId,
    setFocusDate,
    setZoom,
    setSearch,
    setGroupFilter,
    setSelectedEventId,
    goToDate,
    clearSelection,
  };
}
