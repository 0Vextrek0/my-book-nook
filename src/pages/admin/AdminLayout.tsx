import { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookPlus,
  ClipboardList,
  ArrowLeft,
  Menu,
  X,
  Users,
  ChartColumn,
  Archive,
  ScrollText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Permission } from '@/lib/acl';
import { ComponentType } from 'react';

const navItems: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
  permission: Permission;
}[] = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true, permission: 'admin.access' },
  { to: '/admin/catalog', label: 'Каталог', icon: BookPlus, permission: 'catalog.manage' },
  { to: '/admin/bookings', label: 'Бронювання', icon: ClipboardList, permission: 'bookings.manage' },
  { to: '/admin/users', label: 'Користувачі', icon: Users, permission: 'users.view' },
  { to: '/admin/analytics', label: 'Аналітика', icon: ChartColumn, permission: 'analytics.view' },
  { to: '/admin/writeoffs', label: 'Архів списань', icon: Archive, permission: 'users.view' },
  { to: '/admin/logs', label: 'Логи', icon: ScrollText, permission: 'logs.view' },
];

export default function AdminLayout() {
  const { user, hasUserPermission } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (!hasUserPermission('admin.access')) return <Navigate to="/" replace />;

  const visibleNavItems = navItems.filter((item) => hasUserPermission(item.permission));
  const isActive = (path: string, end?: boolean) => (end ? location.pathname === path : location.pathname.startsWith(path));

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-between border-b bg-card p-3 md:hidden">
        <span className="font-display font-bold text-primary">Адмін-панель</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Відкрити меню">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        <aside
          className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r bg-card p-4 transition-transform md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <div className="mb-8 hidden md:block">
            <h2 className="font-display text-lg font-bold text-primary">Адмін-панель</h2>
            <p className="mt-1 text-xs text-muted-foreground">{user.name}</p>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.to, item.end)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t pt-4">
            <Link to="/" onClick={() => setSidebarOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                До сайту
              </Button>
            </Link>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/80 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="min-h-screen flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
