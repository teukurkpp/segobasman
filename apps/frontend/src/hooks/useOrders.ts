import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { Order, OrderStatus } from '@/types/order.types';
import toast from 'react-hot-toast';

export const useActiveOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['orders', 'active'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.ORDERS.ACTIVE);
      return res.data;
    },
    refetchInterval: 30000,
  });
};

export const useOrders = (status?: OrderStatus, date?: string) => {
  return useQuery<Order[]>({
    queryKey: ['orders', status, date],
    queryFn: async () => {
      const params: any = {};
      if (status) params.status = status;
      if (date) params.date = date;
      const res = await apiClient.get(API_ENDPOINTS.ORDERS.BASE, { params });
      return res.data;
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (data: { customerName: string; items: { menuId: string; quantity: number }[]; notes?: string; queueId?: string }) =>
      apiClient.post(API_ENDPOINTS.ORDERS.BASE, data),
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal membuat pesanan';
      toast.error(msg);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiClient.patch(API_ENDPOINTS.ORDERS.STATUS(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status pesanan diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui status pesanan'),
  });
};
