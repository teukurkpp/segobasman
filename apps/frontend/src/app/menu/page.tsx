'use client';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMenuPublic } from '@/hooks/useMenu';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket-events';
import { Menu } from '@/types/menu.types';
import { cn } from '@/lib/utils';
import MenuGrid from '@/components/menu/MenuGrid';
import Link from 'next/link';
import { ShoppingCart, ChefHat } from 'lucide-react';

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'NASI_PEDAS', label: 'Nasi Pedas' },
  { value: 'GORENGAN', label: 'Gorengan' },
  { value: 'MINUMAN', label: 'Minuman' },
  { value: 'PAKET', label: 'Paket Hemat' },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { data: menus = [], isLoading } = useMenuPublic(selectedCategory || undefined);
  const queryClient = useQueryClient();
  const { on } = useSocket();

  useEffect(() => {
    const cleanup = on(SOCKET_EVENTS.MENU_UPDATED, (updatedMenu: Menu) => {
      queryClient.setQueryData(['menus', 'public', selectedCategory || undefined], (old: Menu[] = []) =>
        old.map(m => m.id === updatedMenu.id ? updatedMenu : m)
      );
    });
    return cleanup;
  }, [on, queryClient, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-yellow-300" />
            <div>
              <h1 className="text-2xl font-bold">Sego Pedes Basman</h1>
              <p className="text-red-200 text-sm">Menu Kami</p>
            </div>
          </div>
          <Link
            href="/order"
            className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-colors min-h-[44px]"
          >
            <ShoppingCart className="h-5 w-5" />
            Pesan Sekarang
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'flex-shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-colors min-h-[44px]',
                selectedCategory === cat.value
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-4 animate-pulse h-36" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Tidak ada menu tersedia</p>
          </div>
        ) : (
          <MenuGrid menus={menus} />
        )}
      </main>
    </div>
  );
}
