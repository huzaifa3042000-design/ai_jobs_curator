import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api.js';

// Standard useQuery Hook
export function useSomething(params = {}) {
  return useQuery({
    queryKey: ['something', params],
    queryFn: () => api.getSomething(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Standard useMutation Hook
export function useUpdateSomething() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateSomething,
    onSuccess: (data) => {
      // Direct set Query Data or invalidate
      queryClient.setQueryData(['something'], data);
      // OR queryClient.invalidateQueries({ queryKey: ['something'] });
    },
  });
}
