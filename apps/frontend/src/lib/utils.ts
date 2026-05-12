import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const MENU_CATEGORY_LABELS: Record<string, string> = {
  NASI_PEDAS: 'Nasi Pedas',
  GORENGAN: 'Gorengan',
  MINUMAN: 'Minuman',
  PAKET: 'Paket Hemat',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Diproses',
  SIAP: 'Siap Diambil',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  MENUNGGU: 'bg-yellow-100 text-yellow-800',
  DIPROSES: 'bg-blue-100 text-blue-800',
  SIAP: 'bg-green-100 text-green-800',
  SELESAI: 'bg-gray-100 text-gray-800',
  DIBATALKAN: 'bg-red-100 text-red-800',
};
