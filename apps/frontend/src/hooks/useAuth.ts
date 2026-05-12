import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { token, user, setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const login = async (username: string, password: string) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
    const { access_token, refresh_token, user } = res.data;
    setAuth(access_token, refresh_token, user);
    toast.success(`Selamat datang, ${user.nama}!`);
    if (user.role === 'ADMIN') {
      router.push('/admin/menu');
    } else {
      router.push('/kasir/transaksi');
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Berhasil keluar');
    router.push('/login');
  };

  return { token, user, login, logout, isAuthenticated };
};
