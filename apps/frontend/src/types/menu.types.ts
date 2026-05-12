export type MenuCategory = 'NASI_PEDAS' | 'GORENGAN' | 'MINUMAN' | 'PAKET';
export type MenuStatus = 'TERSEDIA' | 'HABIS';

export interface Menu {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  status: MenuStatus;
  imageUrl?: string;
  stock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
