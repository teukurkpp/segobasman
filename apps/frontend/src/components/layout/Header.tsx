'use client';
import { useAuthStore } from '@/stores/authStore';
import { Bell } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  const { user } = useAuthStore();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
