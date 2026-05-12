'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ChefHat, UtensilsCrossed, Tag, BarChart2, Monitor, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.push('/login');
    } else if (user?.role !== 'ADMIN') {
      router.push('/kasir/transaksi');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) return null;
  if (!isAuthenticated() || user?.role !== 'ADMIN') return null;

  const navItems = [
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/admin/kategori', label: 'Kategori', icon: Tag },
    { href: '/admin/laporan', label: 'Laporan', icon: BarChart2 },
    { href: '/display', label: 'Display Live', icon: Monitor },
  ];

  return (
    <div className="h-screen bg-[#f8f9fa] flex overflow-hidden font-sans">
      {/* Sidebar Modern Elegan - Tema Gelap Admin */}
      <aside className="w-64 bg-[#0f172a] border-r border-[#1e293b] flex flex-col shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)]">
        
        {/* Header / Brand Logo */}
        <div className="px-6 py-6 border-b border-[#1e293b] flex items-center gap-3">
          <div className="bg-[#1e293b] p-2 rounded-xl shadow-sm text-white border border-[#334155] flex items-center justify-center">
            <img 
              src="/basman.png" 
              alt="Logo" 
              className="h-6 w-auto object-contain pointer-events-none select-none" 
              draggable="false" 
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white leading-tight text-lg tracking-tight drop-shadow-sm">Sego Pedes</span>
            <span className="font-bold text-gray-400 leading-tight text-sm drop-shadow-sm">Basman</span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Menu Admin</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  isActive 
                    ? 'text-white bg-[#1e293b] shadow-md border border-[#334155]' 
                    : 'text-gray-400 hover:bg-[#1e293b]/50 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-500 rounded-r-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                )}
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-yellow-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#1e293b] bg-black/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-[#1e293b] text-gray-300 flex items-center justify-center border border-[#334155] shadow-sm shrink-0">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-bold text-sm text-white truncate drop-shadow-sm">{user?.nama}</p>
              <div className="flex items-center mt-0.5">
                <span className="px-2 py-[2px] rounded-md bg-yellow-600 text-white text-[10px] font-bold tracking-wide uppercase border border-yellow-500/50 shadow-sm">Admin</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 bg-[#1e293b]/80 hover:bg-[#1e293b] border border-[#334155] w-full transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#f8f9fa] flex flex-col">
        {children}
      </main>
    </div>
  );
}
