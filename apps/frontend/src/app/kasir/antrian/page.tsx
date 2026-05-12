'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { getSocketInstance } from '@/lib/socket';
import { SOCKET_EVENTS } from '@/constants/socket-events';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function AntrianPage() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['active-orders'],
    queryFn: () => apiClient.get(API_ENDPOINTS.ORDER.ACTIVE).then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => apiClient.get(API_ENDPOINTS.QUEUE.STATS).then(r => r.data),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const socket = getSocketInstance();
    socket.emit('kasir:subscribe');

    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, ({ orders }: any) => {
      queryClient.setQueryData(['active-orders'], orders);
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
    });

    return () => {
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED);
    };
  }, [queryClient]);

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(API_ENDPOINTS.ORDER.COMPLETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
      toast.success('Pesanan selesai!');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(API_ENDPOINTS.ORDER.CANCEL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      toast.success('Pesanan dibatalkan');
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Antrian</h1>
        {stats && (
          <div className="flex gap-4 text-sm">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">Aktif: {stats.aktif}</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">Selesai: {stats.selesai}</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">Total: {stats.total}</span>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">Tidak ada antrian aktif</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any, index: number) => (
            <div key={order.id} className={`bg-white rounded-xl border-2 p-5 ${index === 0 ? 'border-red-400 shadow-md' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-2xl ${index === 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {order.nomorAntrian}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{order.namaPelanggan}</p>
                    <p className="text-sm text-gray-500">{order.items?.length} item · {formatRupiah(Number(order.totalHarga))}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.items?.map((item: any) => (
                        <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {item.menu?.nama} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => completeMutation.mutate(order.id)}
                    disabled={completeMutation.isPending}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 min-h-[44px]"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Selesai
                  </button>
                  <button
                    onClick={() => cancelMutation.mutate(order.id)}
                    disabled={cancelMutation.isPending}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 min-h-[44px]"
                  >
                    <XCircle className="h-4 w-4" />
                    Batal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
