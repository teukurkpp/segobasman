'use client';
import { useState } from 'react';
import { useMenuAdmin, useUpdateMenuAvailability, useDeleteMenu, useCreateMenu, useUpdateMenu } from '@/hooks/useMenu';
import { Menu, MenuCategory, MenuStatus } from '@/types/menu.types';
import { formatRupiah, MENU_CATEGORY_LABELS, cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import AuthGuard from '@/components/layout/AuthGuard';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardMenuPage() {
  const { data: menus = [], isLoading } = useMenuAdmin();
  const updateAvailability = useUpdateMenuAvailability();
  const deleteMenu = useDeleteMenu();
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'NASI_PEDAS' as MenuCategory,
  });

  const handleToggleAvailability = (menu: Menu) => {
    const newStatus: MenuStatus = menu.status === 'TERSEDIA' ? 'HABIS' : 'TERSEDIA';
    updateAvailability.mutate({ id: menu.id, status: newStatus });
  };

  const handleDelete = (menu: Menu) => {
    if (confirm(`Hapus menu "${menu.name}"?`)) {
      deleteMenu.mutate(menu.id);
    }
  };

  const handleSubmitForm = async () => {
    if (!form.name || !form.price) {
      toast.error('Nama dan harga wajib diisi');
      return;
    }
    const data = { ...form, price: parseInt(form.price) };
    if (editingMenu) {
      await updateMenu.mutateAsync({ id: editingMenu.id, data });
    } else {
      await createMenu.mutateAsync(data);
    }
    setShowForm(false);
    setEditingMenu(null);
    setForm({ name: '', description: '', price: '', category: 'NASI_PEDAS' });
  };

  const openEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setForm({ name: menu.name, description: menu.description || '', price: String(menu.price), category: menu.category });
    setShowForm(true);
  };

  return (
    <AuthGuard requiredRoles={['ADMIN']}>
      <div>
        <Header title="Manajemen Menu" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">{menus.length} menu terdaftar</p>
            <button
              onClick={() => { setShowForm(true); setEditingMenu(null); setForm({ name: '', description: '', price: '', category: 'NASI_PEDAS' }); }}
              className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors min-h-[44px]"
            >
              <Plus className="h-5 w-5" />
              Tambah Menu
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nama menu" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="15000" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as MenuCategory }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {Object.entries(MENU_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Deskripsi menu" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSubmitForm} disabled={createMenu.isPending || updateMenu.isPending}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 min-h-[44px]">
                  {editingMenu ? 'Simpan Perubahan' : 'Tambah Menu'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 min-h-[44px]">
                  Batal
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nama Menu</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Kategori</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Harga</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menus.map(menu => (
                    <tr key={menu.id} className={cn(!menu.isActive && 'opacity-50')}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{menu.name}</p>
                        {menu.description && <p className="text-xs text-gray-500 mt-0.5">{menu.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{MENU_CATEGORY_LABELS[menu.category]}</td>
                      <td className="px-6 py-4 font-medium text-red-700">{formatRupiah(menu.price)}</td>
                      <td className="px-6 py-4">
                        <span className={cn('text-xs px-3 py-1 rounded-full font-medium',
                          menu.status === 'TERSEDIA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {menu.status === 'TERSEDIA' ? 'Tersedia' : 'Habis'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleAvailability(menu)} title="Toggle ketersediaan"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            {menu.status === 'TERSEDIA'
                              ? <ToggleRight className="h-5 w-5 text-green-600" />
                              : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                          </button>
                          <button onClick={() => openEdit(menu)} title="Edit" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(menu)} title="Hapus" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
