import { ReaderNav } from '@/components/ReaderNav';
import { useAuth } from '@/lib/auth-context';
import { useLibrary } from '@/lib/library-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, Navigate } from 'react-router-dom';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, books, cancelBooking } = useLibrary();

  if (!user) return <Navigate to="/login" />;

  const userBookings = bookings
    .filter(b => b.userId === user.id)
    .map(b => ({ ...b, book: books.find(bk => bk.id === b.bookId) }));

  const statusLabel: Record<string, string> = {
    active: 'Активне',
    completed: 'Завершено',
    cancelled: 'Скасовано',
  };

  const statusColor: Record<string, string> = {
    active: 'bg-success text-success-foreground',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container py-6 md:py-10">
        <h1 className="text-2xl font-bold md:text-3xl">Мої бронювання</h1>

        {userBookings.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">У вас ще немає бронювань</p>
            <Link to="/catalog">
              <Button className="mt-4">Переглянути каталог</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {userBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-4">
                  {b.book && (
                    <div className={`${b.book.coverColor} h-16 w-12 rounded flex items-center justify-center`}>
                      <span className="text-xs text-primary-foreground font-bold text-center leading-tight px-1">
                        {b.book.title.split(' ')[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{b.book?.title || 'Невідома книга'}</p>
                    <p className="text-sm text-muted-foreground">{b.book?.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">Дата: {b.dateReserved}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColor[b.status]}>{statusLabel[b.status]}</Badge>
                  {b.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id)}>
                      Скасувати
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
