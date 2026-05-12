import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { Menu, MenuStatus } from '@/types/menu.types';
import toast from 'react-hot-toast';

export const useMenuPublic = (category?: string) => {
  return useQuery<Menu[]>({
    queryKey: ['menus', 'public', category],
    queryFn: async () => {
      const params = category ? { category } : {};
      const res = await apiClient.get(API_ENDPOINTS.MENU.BASE, { params });
      return res.data;
    },
  });
};

export const useMenuAdmin = () => {
  return useQuery<Menu[]>({
    queryKey: ['menus', 'admin'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.MENU.BASE);
      return res.data;
    },
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Menu>) => apiClient.post(API_ENDPOINTS.MENU.BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan menu'),
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Menu> }) =>
      apiClient.patch(API_ENDPOINTS.MENU.BY_ID(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui menu'),
  });
};

export const useUpdateMenuAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MenuStatus }) =>
      apiClient.patch(API_ENDPOINTS.MENU.AVAILABILITY(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Status menu diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui status menu'),
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.MENU.BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus menu'),
  });
};
