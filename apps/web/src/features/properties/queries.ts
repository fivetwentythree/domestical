import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, createProperty, updateProperty, deleteProperty, syncProperty } from '../../lib/api';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateProperty>[1] }) =>
      updateProperty(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useSyncProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
