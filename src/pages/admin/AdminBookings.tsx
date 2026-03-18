import { useLibrary } from '@/lib/library-context';
import { mockUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminBookings() {
  const { bookings, books, completeBooking, cancelBooking } = useLibrary();

  const enriched = bookings.map(b => ({
    ...b,
    book: books.find(bk => bk.id === b.bookId),
    user: mockUsers.find(u => u.id === b.userId),
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

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Читач</th>
              <th className="pb-3 font-medium">Книга</th>
              <th className="pb-3 font-medium hidden md:table-cell">Дата</th>
              <th className="pb-3 font-medium">Статус</th>
              <th className="pb-3 font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map(b => (
              <tr key={b.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3">{b.user?.name || 'Невідомий'}</td>
                <td className="py-3 font-medium">{b.book?.title || 'Невідома'}</td>
                <td className="py-3 text-muted-foreground hidden md:table-cell">{b.dateReserved}</td>
                <td className="py-3">
                  <Badge className={`${statusColor[b.status]} text-xs`}>{statusLabel[b.status]}</Badge>
                </td>
                <td className="py-3">
                  {b.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { completeBooking(b.id); toast.success('Бронювання завершено'); }}
                      >
                        Видано
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => { cancelBooking(b.id); toast.success('Бронювання скасовано'); }}
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
        {enriched.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">Немає бронювань</p>
        )}
      </div>
    </div>
  );
}
