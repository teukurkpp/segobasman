'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users2, ShoppingBag, Menu, BarChart3, LogOut, ChefHat
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'KASIR'] },
  { href: '/dashboard/queue', label: 'Antrian', icon: Users2, roles: ['ADMIN', 'KASIR'] },
  { href: '/dashboard/orders', label: 'Pesanan', icon: ShoppingBag, roles: ['ADMIN', 'KASIR'] },
  { href: '/dashboard/menu', label: 'Menu', icon: Menu, roles: ['ADMIN'] },
  { href: '/dashboard/reports', label: 'Laporan', icon: BarChart3, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const filteredItems = navItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="w-64 bg-red-700 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-red-600">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-yellow-300" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Sego Pedes</h1>
            <p className="text-red-200 text-sm">Basman</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium min-h-[44px]',
                isActive
                  ? 'bg-red-900 text-white'
                  : 'text-red-100 hover:bg-red-600'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-red-600">
        <div className="mb-3 px-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-red-200">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-100 hover:bg-red-600 transition-colors text-sm font-medium min-h-[44px]"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
