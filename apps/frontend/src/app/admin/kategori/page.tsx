'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminKategoriPage() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: kategoriList = [] } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => apiClient.get(API_ENDPOINTS.KATEGORI.BASE).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.KATEGORI.BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kategori'] });
      toast.success('Kategori dihapus');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus'),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Kategori</h1>
        <button
          onClick={() => { setEditData(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {kategoriList.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Belum ada kategori</p>
        ) : (
          kategoriList.map((k: any) => (
            <div key={k.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <p className="font-semibold text-gray-900">{k.nama}</p>
                {k.deskripsi && <p className="text-sm text-gray-500">{k.deskripsi}</p>}
                <p className="text-xs text-gray-400">Urutan: {k.urutan}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditData(k); setShowForm(true); }}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { if (confirm('Hapus kategori ini?')) deleteMutation.mutate(k.id); }}
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <KategoriForm
          editData={editData}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['kategori'] });
          }}
        />
      )}
    </div>
  );
}

function KategoriForm({ editData, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    nama: editData?.nama || '',
    deskripsi: editData?.deskripsi || '',
    urutan: editData?.urutan ?? 0,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => editData
      ? apiClient.patch(API_ENDPOINTS.KATEGORI.BY_ID(editData.id), data)
      : apiClient.post(API_ENDPOINTS.KATEGORI.BASE, data),
    onSuccess: () => {
      toast.success(editData ? 'Kategori diperbarui' : 'Kategori ditambahkan');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menyimpan'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...form, urutan: Number(form.urutan) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{editData ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
            <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
            <input value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Tampil</label>
            <input type="number" value={form.urutan} onChange={e => setForm(p => ({ ...p, urutan: Number(e.target.value) }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" min="0" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50">
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
