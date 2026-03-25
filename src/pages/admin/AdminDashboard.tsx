import { BookOpen, Users, ClipboardList, AlertTriangle, Bell, Clock4 } from 'lucide-react';
import { useLibrary } from '@/lib/library-context';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboard() {
  const { books, bookings, writeOffRecords, notifications, waitlist } = useLibrary();
  const { users } = useAuth();

  const stats = [
    { label: 'Усього книг', value: books.length, icon: BookOpen, color: 'text-primary' },
    { label: 'В наявності', value: books.filter((book) => book.status === 'available').length, icon: BookOpen, color: 'text-success' },
    {
      label: 'Активних бронювань',
      value: bookings.filter((booking) => booking.status === 'active').length,
      icon: ClipboardList,
      color: 'text-accent',
    },
    { label: 'Користувачів', value: users.length, icon: Users, color: 'text-primary' },
    { label: 'Черга очікування', value: waitlist.filter((entry) => entry.status === 'waiting').length, icon: Clock4, color: 'text-accent' },
    { label: 'Списано', value: writeOffRecords.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Сповіщень', value: notifications.length, icon: Bell, color: 'text-primary' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Дашборд</h1>
      <p className="mt-2 text-sm text-muted-foreground">Огляд стану каталогу, бронювань і взаємодії користувачів.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
