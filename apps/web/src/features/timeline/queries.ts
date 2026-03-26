import { useQuery } from '@tanstack/react-query';
import { getTimeline } from '../../lib/api';

export function useTimeline(start: string, days: number) {
  return useQuery({
    queryKey: ['timeline', start, days],
    queryFn: () => getTimeline(start, days),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
