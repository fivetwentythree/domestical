import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSyncStatus, runGlobalSync, syncProperty } from '../../lib/api';

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: getSyncStatus,
    refetchInterval: 30_000,
  });
}

export function useRunGlobalSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runGlobalSync,
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['sync-status'] });
        qc.invalidateQueries({ queryKey: ['timeline'] });
        qc.invalidateQueries({ queryKey: ['properties'] });
      }, 3000);
    },
  });
}

export function useRunPropertySync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-status'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
