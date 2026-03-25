import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { hasPermission } from '@/lib/acl';
import { NotificationCenter } from '@/components/NotificationCenter';

export function ReaderNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Головна' },
    { to: '/catalog', label: 'Каталог' },
    ...(user ? [{ to: '/my-bookings', label: 'Мої бронювання' }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;
  const canOpenAdmin = !!user && hasPermission(user.role, 'admin.access');

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <BookOpen className="h-5 w-5" />
          My Library Book
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${isActive(l.to) ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationCenter />
              {canOpenAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Адмін-панель</Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>Вийти</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Увійти</Button></Link>
              <Link to="/register"><Button size="sm">Реєстрація</Button></Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium ${isActive(l.to) ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {canOpenAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Адмін-панель</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false); }}>Вийти ({user.name})</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" size="sm" className="w-full">Увійти</Button></Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}><Button size="sm" className="w-full">Реєстрація</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
