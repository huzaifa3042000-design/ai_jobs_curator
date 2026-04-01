import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api.js';

export function useSearches() {
  return useQuery({
    queryKey: ['searches'],
    queryFn: api.getSearches,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searches'] });
    },
  });
}

export function useDeleteSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searches'] });
    },
  });
}

export function useImproveSkills() {
  return useMutation({
    mutationFn: ({ profileName, currentSkills }) =>
      api.improveSkills(profileName, currentSkills),
  });
}
