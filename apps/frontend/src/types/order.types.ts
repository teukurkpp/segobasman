export type OrderStatus = 'MENUNGGU' | 'DIPROSES' | 'SIAP' | 'SELESAI' | 'DIBATALKAN';

export interface OrderItem {
  id: string;
  menuId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  menu: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  queueId?: string;
  processedById?: string;
  processedBy?: { name: string };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
