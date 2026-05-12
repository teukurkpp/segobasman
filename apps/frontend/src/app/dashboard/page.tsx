'use client';
import { useAuthStore } from '@/stores/authStore';
import { useQueueStats } from '@/hooks/useQueue';
import { useActiveOrders } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { Users2, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats } = useQueueStats();
  const { data: activeOrders = [] } = useActiveOrders();

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.name}!</h2>
          <p className="text-gray-500 mt-1">Ringkasan operasional hari ini</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Antrian Menunggu</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.menunggu ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Antrian Selesai</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.selesai ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pesanan Aktif</p>
                <p className="text-3xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Antrian</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/queue" className="block bg-red-600 text-white rounded-xl p-6 hover:bg-red-700 transition-colors">
            <Users2 className="h-8 w-8 mb-3" />
            <h3 className="text-xl font-bold">Kelola Antrian</h3>
            <p className="text-red-200 mt-1">Panggil dan proses antrian pelanggan</p>
          </Link>
          <Link href="/dashboard/orders" className="block bg-orange-500 text-white rounded-xl p-6 hover:bg-orange-600 transition-colors">
            <ShoppingBag className="h-8 w-8 mb-3" />
            <h3 className="text-xl font-bold">Kelola Pesanan</h3>
            <p className="text-orange-100 mt-1">Update status pesanan aktif</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
