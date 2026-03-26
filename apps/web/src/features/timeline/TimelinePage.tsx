import { useRef, useMemo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTimeline } from './queries';
import { useTimelineState } from './useTimelineState';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineGrid } from './TimelineGrid';
import { EventDrawer } from './EventDrawer';
import { ZOOM_CONFIGS } from '../../lib/timelineMath';
import { runGlobalSync, createProperty } from '../../lib/api';
import { PropertyForm } from '../properties/PropertyForm';

export function TimelinePage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const state = useTimelineState();
  const config = ZOOM_CONFIGS[state.zoom];
  const [showAddProperty, setShowAddProperty] = useState(false);

  const { data, isLoading } = useTimeline(state.start, config.days);

  useKeyboardShortcuts({
    focusDate: state.focusDate,
    zoom: state.zoom,
    setFocusDate: state.setFocusDate,
    setZoom: state.setZoom,
    clearSelection: state.clearSelection,
    searchInputRef,
  });

  const groups = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const row of data.rows) {
      if (row.property.groupName) set.add(row.property.groupName);
    }
    return Array.from(set).sort();
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.rows;

    if (state.search) {
      const q = state.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.property.name.toLowerCase().includes(q) ||
          r.property.city.toLowerCase().includes(q)
      );
    }

    if (state.groupFilter) {
      rows = rows.filter((r) => r.property.groupName === state.groupFilter);
    }

    return rows;
  }, [data, state.search, state.groupFilter]);

  const lastSyncedAt = useMemo(() => {
    if (!data?.rows.length) return null;
    const times = data.rows
      .map((r) => r.property.lastSyncedAt)
      .filter(Boolean) as string[];
    return times.length ? times.sort().reverse()[0] : null;
  }, [data]);

  const handleRefresh = useCallback(async () => {
    await runGlobalSync();
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    }, 2000);
  }, [queryClient]);

  const handleAddProperty = useCallback(
    async (data: { name: string; city: string; group_name: string; ical_url: string; timezone: string }) => {
      await createProperty(data);
      setShowAddProperty(false);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    [queryClient]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TimelineToolbar
        ref={searchInputRef}
        focusDate={state.focusDate}
        start={state.start}
        zoom={state.zoom}
        search={state.search}
        groupFilter={state.groupFilter}
        groups={groups}
        onFocusDateChange={state.setFocusDate}
        onZoomChange={state.setZoom}
        onSearchChange={state.setSearch}
        onGroupFilterChange={state.setGroupFilter}
        onRefresh={handleRefresh}
        lastSyncedAt={lastSyncedAt}
      />

      {isLoading ? (
        <div className="onboarding-empty">
          <p style={{ color: 'var(--gray-400)' }}>Loading timeline…</p>
        </div>
      ) : (
        <TimelineGrid
          rows={filteredRows}
          focusDate={state.focusDate}
          start={state.start}
          zoom={state.zoom}
          onSelectEvent={state.setSelectedEventId}
          onAddProperty={() => setShowAddProperty(true)}
        />
      )}

      {state.selectedEventId && data && (
        <EventDrawer
          eventId={state.selectedEventId}
          rows={data.rows}
          onClose={state.clearSelection}
        />
      )}

      {showAddProperty && (
        <PropertyForm
          onSubmit={handleAddProperty}
          onClose={() => setShowAddProperty(false)}
        />
      )}
    </div>
  );
}
