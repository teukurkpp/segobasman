'use client';
import { Menu } from '@/types/menu.types';
import MenuCard from './MenuCard';

interface MenuGridProps {
  menus: Menu[];
  onSelect?: (menu: Menu) => void;
  selectedIds?: string[];
}

export default function MenuGrid({ menus, onSelect, selectedIds = [] }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onSelect={onSelect}
          selected={selectedIds.includes(menu.id)}
        />
      ))}
    </div>
  );
}
