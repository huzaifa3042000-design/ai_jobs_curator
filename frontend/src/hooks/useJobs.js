import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api.js';

export function useJobs(params = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.getJobs(params),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!params.searchId,
  });
}

export function useJobDetail(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJobById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useFetchJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.fetchJobs,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useScoreJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batch) => api.scoreJobs(batch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useRunPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.runPipeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useRefreshJob(searchId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.refreshJob(id, searchId),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useGenerateProposal(searchId) {
  return useMutation({
    mutationFn: (id) => api.generateProposal(id, searchId),
  });
}
