'use client';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { getSocketInstance } from '@/lib/socket';
import { SOCKET_EVENTS } from '@/constants/socket-events';
import { ChefHat, Clock3, UtensilsCrossed } from 'lucide-react';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

type PageMode = 'antrian' | 'menu';

const formatTicketCode = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 'A000';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `A${String(num).padStart(3, '0')}`;
};

export default function DisplayPage() {
  const [mode, setMode] = useState<PageMode>('antrian');
  const [now, setNow] = useState(() => new Date());
  const queryClient = useQueryClient();
  const tvSafePadding = 'clamp(16px, 2.8vw, 48px)';

  // Auto-switch mode setiap 10 detik.
  useEffect(() => {
    const interval = setInterval(() => {
      setMode(prev => prev === 'antrian' ? 'menu' : 'antrian');
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['queue-display'],
    queryFn: () => apiClient.get(API_ENDPOINTS.QUEUE.BASE).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: menus = [] } = useQuery({
    queryKey: ['menu-display'],
    queryFn: () => apiClient.get(API_ENDPOINTS.MENU.BASE).then(r => r.data),
    refetchInterval: 30000,
  });

  // WebSocket real-time
  useEffect(() => {
    const socket = getSocketInstance();
    socket.emit('display:subscribe');

    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, ({ orders }: any) => {
      queryClient.setQueryData(['queue-display'], orders);
    });

    socket.on(SOCKET_EVENTS.MENU_AVAILABILITY_CHANGED, ({ menuId, availability }: any) => {
      queryClient.setQueryData(['menu-display'], (old: any[]) =>
        old?.map(m => m.id === menuId ? { ...m, availability } : m) ?? []
      );
    });

    return () => {
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED);
      socket.off(SOCKET_EVENTS.MENU_AVAILABILITY_CHANGED);
    };
  }, [queryClient]);

  const totalAvailable = menus.filter((item: any) => item.availability === 'TERSEDIA').length;
  const totalOut = menus.length - totalAvailable;
  const sortedMenus = useMemo(
    () => [...menus].sort((a: any, b: any) => {
      if (a.availability !== b.availability) return a.availability === 'TERSEDIA' ? -1 : 1;
      return String(a.nama).localeCompare(String(b.nama));
    }),
    [menus]
  );

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_8%,#1a2230_0%,#0b0f16_42%,#090c12_100%)] text-[#eef2f7]">
      <div className="mx-auto h-full w-full max-w-[1920px]" style={{ padding: tvSafePadding }}>
        <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#2b3342] bg-[#0f1520]/95 px-4 py-3 md:px-6 shadow-lg shrink-0">
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#2b3342]/50 p-1.5 md:p-2 flex items-center justify-center border border-[#313b4e]">
                <img 
                  src="/basman.png" 
                  alt="Logo" 
                  className="h-8 w-auto lg:h-9 object-contain pointer-events-none select-none" 
                  draggable="false" 
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-[#ffd0ba] leading-tight">Sego Pedes Basman</h1>
                <p className="text-xs lg:text-sm font-semibold text-[#9da6b8]">Info Antrian & Status Menu</p>
              </div>
            </div>

            <div className="h-8 w-px bg-[#313b4e] hidden md:block" />

            <div className="flex items-center gap-3">
              <p className="text-2xl lg:text-3xl font-black tracking-tight text-[#eef2f7]">
                {mode === 'menu' ? 'Status Menu' : 'Status Antrian'}
              </p>
              <div className="hidden sm:block h-1 w-8 lg:w-16 rounded-full bg-[#ff6f3f]" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-4 rounded-xl border border-[#313b4e] bg-[#141b28] px-4 py-2">
              <div className="text-right flex flex-col justify-center">
                <p className="text-2xl lg:text-3xl font-black leading-none text-[#ffc3a6]">{now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                <p className="mt-1 text-[10px] lg:text-xs font-semibold text-[#8b95a8]">
                  {now.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short' })}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 border-l border-[#313b4e] pl-4 text-sm font-bold text-[#d3dae7]">
                <Clock3 className="h-5 w-5 text-[#ff935f]" />
                <span className="hidden xl:inline">Dapur Buka</span>
              </div>
            </div>

            <div className="inline-flex rounded-xl border border-[#313b4e] bg-[#131a26] p-1.5 shrink-0">
              <button
                onClick={() => setMode('antrian')}
                className={`rounded-lg px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-bold transition ${
                  mode === 'antrian' ? 'bg-[#ff6f3f] text-white shadow-md' : 'text-[#94a0b6] hover:text-[#eef2f7]'
                }`}
              >
                Antrian
              </button>
              <button
                onClick={() => setMode('menu')}
                className={`rounded-lg px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-bold transition ${
                  mode === 'menu' ? 'bg-[#ff6f3f] text-white shadow-md' : 'text-[#94a0b6] hover:text-[#eef2f7]'
                }`}
              >
                Menu
              </button>
            </div>
          </div>

        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#2b3342] bg-[#0f1520]/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.35)] md:p-6 pb-2">
          {mode === 'antrian' ? (
            <AntrianDisplay orders={orders} />
          ) : (
            <MenuDisplay menus={sortedMenus} totalAvailable={totalAvailable} totalOut={totalOut} />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

function AntrianDisplay({ orders }: { orders: any[] }) {
  const topTen = orders.slice(0, 10);
  
  // Pad the array to ensure we always have 10 boxes (2 rows of 5)
  const paddedOrders = [...topTen];
  while (paddedOrders.length < 10) {
    paddedOrders.push(null);
  }

  const statsTotal = orders.length;
  const avgMinutes = statsTotal > 0 ? (statsTotal - 1) * 3 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 rounded-xl border border-[#2b3342] bg-[#141b28] px-4 py-2.5 shrink-0">
        <p className="text-sm lg:text-base font-semibold text-[#8b95a8]">Silakan perhatikan layar. Nomor antrian akan dipanggil ketika pesanan siap diproses.</p>
      </div>

      <div className="grid flex-1 grid-cols-5 grid-rows-2 gap-3 min-h-0">
        {paddedOrders.map((order: any, idx: number) => {
          const isFirst = idx === 0;
          
          if (!order) {
            return (
              <div key={`empty-${idx}`} className="rounded-2xl border border-dashed border-[#2b3342] bg-[#0f1520] flex flex-col items-center justify-center p-3 opacity-50 min-h-0">
                 <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wide text-[#8b95a8] mb-1.5">Belum Tersedia</p>
                 <div className="h-1 w-8 rounded-full bg-[#313b4e] mb-2" />
                 <p className="text-5xl lg:text-[4.5rem] leading-none font-black text-[#313b4e]">-</p>
                 <p className="mt-2 text-lg font-bold text-[#313b4e] leading-tight">Kosong</p>
                 <div className="mt-2.5 h-1 w-16 rounded-full bg-[#313b4e]" />
              </div>
            );
          }

          return (
            <div key={order.id} className={`rounded-2xl border flex flex-col items-center justify-center p-3 min-h-0 ${isFirst ? 'border-[#ff6f3f] bg-[#ff6f3f]/10 shadow-[0_0_20px_rgba(255,111,63,0.2)]' : 'border-[#2b3342] bg-[#141b28]'}`}>
               <p className={`text-[10px] lg:text-xs font-semibold uppercase tracking-wide mb-1.5 text-center ${isFirst ? 'text-[#ff935f]' : 'text-[#8b95a8]'}`}>
                 {isFirst ? 'Sedang Dipanggil' : 'Antrian Berikutnya'}
               </p>
               <div className={`h-1 w-8 rounded-full mb-2 ${isFirst ? 'bg-[#ff6f3f]' : 'bg-[#313b4e]'}`} />
               <p className={`text-5xl lg:text-[4.5rem] leading-none font-black ${isFirst ? 'text-[#eef2f7]' : 'text-[#d3dae7]'}`}>{formatTicketCode(order.nomorAntrian).slice(1)}</p>
               <p className={`mt-2 truncate max-w-full px-2 text-lg lg:text-xl font-bold leading-tight ${isFirst ? 'text-[#ffd0ba]' : 'text-[#9da6b8]'}`}>{order.namaPelanggan}</p>
               <div className={`mt-2.5 h-1 w-16 rounded-full ${isFirst ? 'bg-[#ff6f3f]' : 'bg-[#313b4e]'}`} />
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 shrink-0">
        <div className="rounded-xl border border-[#2b3342] bg-[#141b28] px-4 lg:px-5 py-3 flex items-center justify-between">
          <p className="text-xs lg:text-sm font-semibold text-[#8b95a8]">Total Antrian Aktif</p>
          <p className="text-xl font-bold text-[#eef2f7]">{statsTotal} <span className="text-sm font-medium text-[#8b95a8]">Antrian</span></p>
        </div>
        <div className="rounded-xl border border-[#2b3342] bg-[#141b28] px-4 lg:px-5 py-3 flex items-center justify-between">
          <p className="text-xs lg:text-sm font-semibold text-[#8b95a8]">Rata-rata Waktu Tunggu</p>
          <p className="text-xl font-bold text-[#eef2f7]">~{avgMinutes} <span className="text-sm font-medium text-[#8b95a8]">Menit</span></p>
        </div>
        <div className="rounded-xl border border-[#2b3342] bg-[#141b28] px-4 lg:px-5 py-3 flex items-center justify-between">
          <p className="text-xs lg:text-sm font-semibold text-[#8b95a8]">Status Sistem</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
            </span>
            <p className="text-sm lg:text-base font-bold text-emerald-400">Siap Menerima Pesanan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuDisplay({ menus, totalAvailable, totalOut }: { menus: any[]; totalAvailable: number; totalOut: number }) {
  // Hanya tampilkan menu yang HABIS
  const habisMenus = menus.filter((m: any) => m.availability === 'HABIS');

  // Kelompokkan menu yang habis berdasarkan kategori
  const groupedMenus = habisMenus.reduce((acc: any, menu: any) => {
    const cat = menu.kategori?.nama || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(menu);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 lg:mb-3 rounded-xl border border-[#2b3342] bg-[#141b28] px-3 py-2 flex justify-between items-center shrink-0">
        <p className="text-xs lg:text-sm font-semibold text-[#8b95a8] leading-tight">
          Ketersediaan menu terhubung dengan sistem Dapur Sego Pedes Basman. <span className="text-[#ff935f]">Hanya menampilkan menu Habis.</span>
        </p>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-[#d3dae7] text-xs font-semibold">{totalAvailable} Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-[#ff935f] text-xs font-semibold">{totalOut} Habis</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {Object.keys(groupedMenus).length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-emerald-500/10 p-6 mb-4">
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-emerald-500"></div>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-[#eef2f7]">Semua Menu Tersedia</h2>
            <p className="text-[#8b95a8] mt-2">Saat ini tidak ada menu yang habis/kosong.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 lg:gap-2.5 w-full h-full pr-1">
            {Object.entries(groupedMenus).map(([category, items]: [string, any]) => (
              <div key={category} className="shrink-0 flex flex-col border border-[#2b3342] rounded-lg p-2 lg:p-2.5 bg-[#141b28]/40">
                 <div className="flex flex-col mb-2">
                   <h2 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#ff935f] mb-1">{category}</h2>
                   <div className="h-[1px] w-full bg-[#313b4e]"></div>
                </div>
                
                <div className="flex flex-row flex-wrap gap-2">
                  {items.map((menu: any) => (
                    <div key={menu.id} className="relative overflow-hidden rounded bg-[#1a2230] px-2.5 py-1 lg:px-3 lg:py-1 flex items-center gap-1.5 border border-[#313b4e] shadow-sm w-fit shrink-0">
                        <div className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-red-500 shrink-0"></div>
                        <h3 className="text-xs lg:text-sm font-semibold text-[#c3c8d3] truncate">{menu.nama}</h3>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
