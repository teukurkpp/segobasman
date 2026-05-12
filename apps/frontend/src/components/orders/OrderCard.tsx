'use client';
import { Order, OrderStatus } from '@/types/order.types';
import { formatRupiah, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatDate, cn } from '@/lib/utils';
import { useUpdateOrderStatus } from '@/hooks/useOrders';

interface OrderCardProps {
  order: Order;
}

const STATUS_FLOW: OrderStatus[] = ['MENUNGGU', 'DIPROSES', 'SIAP', 'SELESAI'];

export default function OrderCard({ order }: OrderCardProps) {
  const updateStatus = useUpdateOrderStatus();
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{order.customerName}</h3>
          <p className="text-sm text-gray-500">{order.orderNumber}</p>
        </div>
        <span className={cn('text-xs px-3 py-1 rounded-full font-medium', ORDER_STATUS_COLORS[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-700">
            <span>{item.quantity}x {item.menu.name}</span>
            <span>{formatRupiah(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <p className="text-sm text-gray-500 italic border-t pt-2 mb-3">Catatan: {order.notes}</p>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <div>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          <p className="font-bold text-gray-900">{formatRupiah(order.totalAmount)}</p>
        </div>
        {nextStatus && order.status !== 'DIBATALKAN' && (
          <button
            onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
            disabled={updateStatus.isPending}
            className="min-h-[44px] px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {ORDER_STATUS_LABELS[nextStatus]}
          </button>
        )}
      </div>
    </div>
  );
}
