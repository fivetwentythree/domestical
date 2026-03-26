import { useEffect } from 'react';
import { getToday, shiftDate } from '../../lib/dates';
import type { ZoomLevel } from '../../lib/timelineMath';
import { ZOOM_CONFIGS } from '../../lib/timelineMath';

interface Options {
  focusDate: string;
  zoom: ZoomLevel;
  setFocusDate: (s: string) => void;
  setZoom: (z: ZoomLevel) => void;
  clearSelection: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const ZOOM_KEYS: Record<string, ZoomLevel> = { '1': 7, '2': 14, '3': 30 };

export function useKeyboardShortcuts({
  focusDate,
  zoom,
  setFocusDate,
  setZoom,
  clearSelection,
  searchInputRef,
}: Options) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          clearSelection();
        }
        return;
      }

      switch (e.key) {
        case 't':
        case 'T':
          e.preventDefault();
          setFocusDate(getToday());
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusDate(shiftDate(focusDate, -ZOOM_CONFIGS[zoom].days));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusDate(shiftDate(focusDate, ZOOM_CONFIGS[zoom].days));
          break;
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'Escape':
          clearSelection();
          break;
        default:
          if (ZOOM_KEYS[e.key]) {
            e.preventDefault();
            setZoom(ZOOM_KEYS[e.key]);
          }
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusDate, zoom, setFocusDate, setZoom, clearSelection, searchInputRef]);
}
