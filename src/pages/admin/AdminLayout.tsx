import { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, BookPlus, ClipboardList, ArrowLeft, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/admin/catalog', label: 'Управління каталогом', icon: BookPlus },
  { to: '/admin/bookings', label: 'Бронювання', icon: ClipboardList },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'librarian') {
    return <Navigate to="/login" />;
  }

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Top bar mobile */}
      <div className="flex items-center justify-between border-b bg-card p-3 md:hidden">
        <span className="font-display font-bold text-primary">Панель бібліотекаря</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r bg-card p-4 transition-transform md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="mb-8 hidden md:block">
            <h2 className="font-display text-lg font-bold text-primary">Панель бібліотекаря</h2>
            <p className="text-xs text-muted-foreground mt-1">{user.name}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
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

          <div className="mt-8 pt-4 border-t">
            <Link to="/" onClick={() => setSidebarOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                До сайту
              </Button>
            </Link>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-background/80 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
