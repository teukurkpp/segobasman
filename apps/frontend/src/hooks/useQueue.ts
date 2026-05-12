import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { Queue, QueueStats } from '@/types/queue.types';
import toast from 'react-hot-toast';

export const useActiveQueues = () => {
  return useQuery<Queue[]>({
    queryKey: ['queues', 'active'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.QUEUE.ACTIVE);
      return res.data;
    },
    refetchInterval: 30000,
  });
};

export const useCurrentQueue = () => {
  return useQuery<Queue | null>({
    queryKey: ['queues', 'current'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.QUEUE.CURRENT);
      return res.data;
    },
  });
};

export const useQueueStats = () => {
  return useQuery<QueueStats>({
    queryKey: ['queues', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.QUEUE.STATS);
      return res.data;
    },
  });
};

export const useJoinQueue = () => {
  return useMutation({
    mutationFn: (customerName: string) =>
      apiClient.post(API_ENDPOINTS.QUEUE.JOIN, { customerName }),
    onError: () => toast.error('Gagal mengambil nomor antrian'),
  });
};

export const useCallNext = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.QUEUE.CALL_NEXT),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Antrian berikutnya dipanggil');
    },
    onError: () => toast.error('Tidak ada antrian berikutnya'),
  });
};

export const useCompleteQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(API_ENDPOINTS.QUEUE.COMPLETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Antrian diselesaikan');
    },
    onError: () => toast.error('Gagal menyelesaikan antrian'),
  });
};

export const useSkipQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(API_ENDPOINTS.QUEUE.SKIP(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Antrian dilewati');
    },
    onError: () => toast.error('Gagal melewati antrian'),
  });
};
