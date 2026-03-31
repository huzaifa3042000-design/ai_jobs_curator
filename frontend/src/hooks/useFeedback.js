import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api.js';

export function useFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, feedback, note }) => api.submitFeedback(jobId, feedback, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
