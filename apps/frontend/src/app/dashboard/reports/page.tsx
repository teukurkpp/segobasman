'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { formatRupiah } from '@/lib/utils';
import Header from '@/components/layout/Header';
import AuthGuard from '@/components/layout/AuthGuard';
import { BarChart3, TrendingUp, ShoppingBag, XCircle } from 'lucide-react';

export default function DashboardReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: report, isLoading } = useQuery({
    queryKey: ['reports', 'daily', date],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.REPORTS.DAILY, { params: { date } });
      return res.data;
    },
  });

  return (
    <AuthGuard requiredRoles={['ADMIN']}>
      <div>
        <Header title="Laporan Penjualan" />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-700">Pilih Tanggal:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse h-28" />
              ))}
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2.5 rounded-xl"><ShoppingBag className="h-6 w-6 text-blue-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Total Pesanan</span>
                </div>
                <p className="text-4xl font-black text-gray-900">{report.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2.5 rounded-xl"><TrendingUp className="h-6 w-6 text-green-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Pesanan Selesai</span>
                </div>
                <p className="text-4xl font-black text-green-700">{report.completedOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-100 p-2.5 rounded-xl"><XCircle className="h-6 w-6 text-red-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Dibatalkan</span>
                </div>
                <p className="text-4xl font-black text-red-700">{report.cancelledOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-100 p-2.5 rounded-xl"><BarChart3 className="h-6 w-6 text-purple-600" /></div>
                  <span className="text-sm font-medium text-gray-500">Total Pendapatan</span>
                </div>
                <p className="text-2xl font-black text-purple-700">{formatRupiah(report.totalRevenue)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-16">Tidak ada data untuk tanggal ini</p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
