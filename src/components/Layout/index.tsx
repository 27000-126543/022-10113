import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const titleMap: Record<string, string> = {
  '/': '接待首页',
  '/customers': '顾客档案',
  '/customers/new': '新增顾客',
  '/questionnaire': '初诊问卷',
  '/triage': '分诊看板',
  '/doctors': '医生排班',
  '/review': '到诊复盘',
};

export const Layout = () => {
  const location = useLocation();

  const getTitle = () => {
    for (const [path, title] of Object.entries(titleMap)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        return title;
      }
    }
    return titleMap['/'] || '接待首页';
  };

  return (
    <div className="min-h-screen bg-rose-50">
      <Sidebar />
      <div className="ml-64">
        <Header title={getTitle()} />
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
