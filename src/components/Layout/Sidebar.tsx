import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Columns,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '接待首页', icon: LayoutDashboard },
  { path: '/customers', label: '顾客档案', icon: Users },
  { path: '/questionnaire', label: '初诊问卷', icon: ClipboardList },
  { path: '/triage', label: '分诊看板', icon: Columns },
  { path: '/doctors', label: '医生排班', icon: CalendarDays },
  { path: '/review', label: '到诊复盘', icon: BarChart3 },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-card flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-cream-200">
        <h1 className="font-serif text-xl font-bold text-rose-600 flex items-center gap-2">
          <span className="w-10 h-10 bg-rose-gradient rounded-xl flex items-center justify-center text-white text-lg">美</span>
          医美分诊工作台
        </h1>
        <p className="text-sm text-rose-400 mt-1">Aesthetic Triage System</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-cream-200">
        <div className="bg-rose-50 rounded-xl p-4">
          <p className="text-sm text-rose-600 font-medium">今日到诊</p>
          <p className="text-2xl font-bold text-rose-500 font-serif mt-1">28 人</p>
          <p className="text-xs text-rose-400 mt-1">较昨日 ↑ 12%</p>
        </div>
      </div>
    </aside>
  );
};
