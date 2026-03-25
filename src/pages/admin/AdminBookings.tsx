import { useLibrary } from '@/lib/library-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminBookings() {
  const { bookings, books, completeBooking, cancelBooking, waitlist } = useLibrary();
  const { users } = useAuth();

  const enriched = bookings.map((booking) => ({
    ...booking,
    book: books.find((book) => book.id === booking.bookId),
    user: users.find((user) => user.id === booking.userId),
    queue: waitlist.filter((entry) => entry.bookId === booking.bookId && entry.status === 'waiting').length,
  }));

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
    <div>
      <h1 className="text-2xl font-bold">Бронювання</h1>
      <p className="mt-2 text-sm text-muted-foreground">Підтвердження, скасування та контроль черги очікування.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Читач</th>
              <th className="pb-3 font-medium">Книга</th>
              <th className="hidden pb-3 font-medium md:table-cell">Дата</th>
              <th className="hidden pb-3 font-medium lg:table-cell">Черга</th>
              <th className="pb-3 font-medium">Статус</th>
              <th className="pb-3 font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((booking) => (
              <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="py-3">{booking.user?.name || 'Невідомий'}</td>
                <td className="py-3 font-medium">{booking.book?.title || 'Невідома'}</td>
                <td className="hidden py-3 text-muted-foreground md:table-cell">{booking.dateReserved}</td>
                <td className="hidden py-3 text-muted-foreground lg:table-cell">{booking.queue}</td>
                <td className="py-3">
                  <Badge className={`${statusColor[booking.status]} text-xs`}>{statusLabel[booking.status]}</Badge>
                </td>
                <td className="py-3">
                  {booking.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          completeBooking(booking.id);
                          toast.success('Бронювання завершено');
                        }}
                      >
                        Видано
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          cancelBooking(booking.id);
                          toast.success('Бронювання скасовано');
                        }}
                      >
                        Скасувати
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {enriched.length === 0 && <p className="py-8 text-center text-muted-foreground">Немає бронювань</p>}
      </div>
    </div>
  );
}
