'use client';
import { Menu } from '@/types/menu.types';
import { formatRupiah, MENU_CATEGORY_LABELS, cn } from '@/lib/utils';

interface MenuCardProps {
  menu: Menu;
  onSelect?: (menu: Menu) => void;
  selected?: boolean;
  showActions?: boolean;
}

export default function MenuCard({ menu, onSelect, selected, showActions }: MenuCardProps) {
  const isAvailable = menu.status === 'TERSEDIA';

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        isAvailable ? 'bg-white cursor-pointer hover:shadow-md' : 'bg-gray-50 opacity-60',
        selected ? 'border-red-500 bg-red-50' : 'border-gray-200',
        !isAvailable && 'cursor-not-allowed'
      )}
      onClick={() => isAvailable && onSelect?.(menu)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{menu.name}</h3>
          {menu.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{menu.description}</p>
          )}
        </div>
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full font-medium flex-shrink-0',
            isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}
        >
          {isAvailable ? 'Tersedia' : 'Habis'}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {MENU_CATEGORY_LABELS[menu.category]}
        </span>
        <span className="font-bold text-red-700 text-sm">{formatRupiah(menu.price)}</span>
      </div>
    </div>
  );
}
