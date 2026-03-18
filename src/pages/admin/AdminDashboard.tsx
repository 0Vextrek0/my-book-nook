import { BookOpen, Users, ClipboardList, AlertTriangle } from 'lucide-react';
import { useLibrary } from '@/lib/library-context';
import { mockUsers } from '@/lib/mock-data';

export default function AdminDashboard() {
  const { books, bookings } = useLibrary();

  const stats = [
    { label: 'Усього книг', value: books.length, icon: BookOpen, color: 'text-primary' },
    { label: 'В наявності', value: books.filter(b => b.status === 'available').length, icon: BookOpen, color: 'text-success' },
    { label: 'Активних бронювань', value: bookings.filter(b => b.status === 'active').length, icon: ClipboardList, color: 'text-accent' },
    { label: 'Читачів', value: mockUsers.filter(u => u.role === 'reader').length, icon: Users, color: 'text-primary' },
    { label: 'Списано', value: books.filter(b => b.status === 'written-off').length, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Дашборд</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold font-display">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
