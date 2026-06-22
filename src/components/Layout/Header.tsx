import { Bell, Search, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const Header = ({ title }: { title: string }) => {
  const { currentUser } = useAppStore();

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-serif font-semibold text-rose-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-5 h-5 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索顾客、医生..."
            className="w-64 pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-full text-sm
                     focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300
                     transition-all duration-200"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-rose-50 transition-colors">
          <Bell className="w-5 h-5 text-rose-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-coral-500 rounded-full"></span>
        </button>

        <button className="p-2 rounded-full hover:bg-rose-50 transition-colors">
          <Settings className="w-5 h-5 text-rose-500" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-cream-200">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-9 h-9 rounded-full bg-rose-100"
          />
          <div className="text-right">
            <p className="text-sm font-medium text-rose-700">{currentUser?.name}</p>
            <p className="text-xs text-rose-400">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
