'use client';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveOrders } from '@/hooks/useOrders';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket-events';
import OrderList from '@/components/orders/OrderList';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'active', label: 'Aktif' },
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'SIAP', label: 'Siap' },
];

export default function DashboardOrdersPage() {
  const [filter, setFilter] = useState('active');
  const { data: orders = [], isLoading } = useActiveOrders();
  const queryClient = useQueryClient();
  const { on } = useSocket();

  useEffect(() => {
    const cleanup1 = on(SOCKET_EVENTS.ORDER_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    const cleanup2 = on(SOCKET_EVENTS.ORDER_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    return () => { cleanup1(); cleanup2(); };
  }, [on, queryClient]);

  const filteredOrders = filter === 'active'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div>
      <Header title="Pesanan Aktif" />
      <div className="p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]',
                filter === opt.value
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <OrderList orders={filteredOrders} />
        )}
      </div>
    </div>
  );
}
