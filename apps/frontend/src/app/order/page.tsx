'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMenuPublic } from '@/hooks/useMenu';
import { useCreateOrder } from '@/hooks/useOrders';
import { Menu } from '@/types/menu.types';
import { formatRupiah } from '@/lib/utils';
import QueueTicket from '@/components/queue/QueueTicket';
import { Queue } from '@/types/queue.types';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ChefHat } from 'lucide-react';

const orderSchema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama terlalu panjang'),
  notes: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

interface CartItem {
  menu: Menu;
  quantity: number;
}

export default function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ticket, setTicket] = useState<Queue | null>(null);
  const { data: menus = [] } = useMenuPublic();
  const createOrder = useCreateOrder();

  const { register, handleSubmit, formState: { errors } } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  const addToCart = (menu: Menu) => {
    setCart(prev => {
      const existing = prev.find(item => item.menu.id === menu.id);
      if (existing) {
        return prev.map(item => item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const updateQuantity = (menuId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.menu.id === menuId ? { ...item, quantity: item.quantity + delta } : item
      ).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);

  const onSubmit = async (data: OrderForm) => {
    if (cart.length === 0) {
      toast.error('Pilih minimal satu menu');
      return;
    }
    try {
      const res = await createOrder.mutateAsync({
        customerName: data.customerName,
        notes: data.notes,
        items: cart.map(item => ({ menuId: item.menu.id, quantity: item.quantity })),
      });
      // Simulate getting queue ticket
      setTicket({
        id: res.data.id,
        queueNumber: Math.floor(Math.random() * 100) + 1,
        customerName: data.customerName,
        status: 'MENUNGGU',
        estimatedWait: cart.length * 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Pesanan berhasil dibuat!');
    } catch {}
  };

  if (ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Berhasil!</h2>
        <QueueTicket queue={ticket} />
        <div className="mt-8 flex gap-4">
          <Link href="/queue" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors min-h-[44px]">
            Pantau Antrian
          </Link>
          <button
            onClick={() => { setTicket(null); setCart([]); }}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors min-h-[44px]"
          >
            Pesan Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-yellow-300" />
            <h1 className="text-2xl font-bold">Form Pemesanan</h1>
          </div>
          <Link href="/menu" className="text-red-200 hover:text-white text-sm">&#8592; Kembali ke Menu</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Data Pelanggan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input
                  {...register('customerName')}
                  placeholder="Masukkan nama Anda"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (opsional)</label>
                <textarea
                  {...register('notes')}
                  placeholder="Catatan tambahan untuk pesanan"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menus.filter(m => m.status === 'TERSEDIA').map((menu) => {
                const cartItem = cart.find(item => item.menu.id === menu.id);
                return (
                  <div key={menu.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1 mr-2">
                      <p className="font-medium text-sm text-gray-900">{menu.name}</p>
                      <p className="text-xs text-red-600 font-bold">{formatRupiah(menu.price)}</p>
                    </div>
                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(menu.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold w-6 text-center">{cartItem.quantity}</span>
                        <button onClick={() => updateQuantity(menu.id, 1)} className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(menu)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 min-h-[32px]"
                      >
                        Tambah
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ringkasan Pesanan
            </h2>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Belum ada item dipilih</p>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.menu.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.menu.name}</span>
                    <span className="font-medium">{formatRupiah(item.menu.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span className="text-red-600">{formatRupiah(totalAmount)}</span>
              </div>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={createOrder.isPending || cart.length === 0}
                className="w-full min-h-[48px] bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createOrder.isPending ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
