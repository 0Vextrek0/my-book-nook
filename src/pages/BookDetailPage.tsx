import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReaderNav } from '@/components/ReaderNav';
import { useLibrary } from '@/lib/library-context';
import { useAuth } from '@/lib/auth-context';
import { getStatusColor, getStatusLabel } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { books, bookings, createBooking, enqueueWaitlist } = useLibrary();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const book = books.find((candidate) => candidate.id === id);
  if (!book) {
    return (
      <div className="min-h-screen">
        <ReaderNav />
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Книгу не знайдено</p>
          <Link to="/catalog">
            <Button variant="outline" className="mt-4">
              До каталогу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const userActiveBookings = user ? bookings.filter((booking) => booking.userId === user.id && booking.status === 'active').length : 0;

  const openBookingConfirm = () => {
    if (!user) {
      toast.error('Увійдіть, щоб забронювати книгу');
      navigate('/login');
      return;
    }
    if (userActiveBookings >= 3) {
      toast.error('Ви досягли ліміту бронювань (3 книги).');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmBooking = () => {
    if (!user) return;
    const result = createBooking(user.id, book.id);
    if (!result.success) {
      if (result.reason === 'book_unavailable') toast.error('На жаль, книгу щойно забронювали.');
      if (result.reason === 'limit_reached') toast.error('Ліміт активних бронювань вичерпано.');
      setConfirmOpen(false);
      return;
    }
    toast.success('Книгу успішно заброньовано.');
    setConfirmOpen(false);
  };

  const handleJoinWaitlist = () => {
    if (!user) {
      toast.error('Увійдіть, щоб стати в чергу очікування.');
      navigate('/login');
      return;
    }
    const result = enqueueWaitlist(user.id, book.id);
    if (!result.success) {
      if (result.reason === 'already_waiting') toast.error('Ви вже в черзі на цю книгу.');
      if (result.reason === 'book_unavailable') toast.error('Ця книга вже доступна, її можна забронювати без черги.');
      return;
    }
    toast.success('Вас додано до черги очікування.');
  };

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container py-6 md:py-10">
        <Link to="/catalog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад до каталогу
        </Link>

        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div className={`${book.coverColor} flex h-80 items-center justify-center rounded-xl p-6 md:h-[420px]`}>
            <div className="text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-primary-foreground/60" />
              <p className="font-display text-xl font-bold text-primary-foreground">{book.title}</p>
              <p className="mt-2 text-primary-foreground/80">{book.author}</p>
            </div>
          </div>

          <div>
            <Badge className={`${getStatusColor(book.status)} mb-3`}>{getStatusLabel(book.status)}</Badge>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{book.author}</p>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Жанр</span>
                <span className="font-medium">{book.genre}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Рік видання</span>
                <span className="font-medium">{book.year}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">ISBN</span>
                <span className="font-medium">{book.isbn}</span>
              </div>
            </div>

            <div className="mt-8">
              {book.status === 'available' ? (
                <Button size="lg" className="gap-2 font-display font-semibold" onClick={openBookingConfirm}>
                  <BookOpen className="h-4 w-4" />
                  Забронювати
                </Button>
              ) : book.status === 'reserved' ? (
                <div className="space-y-3">
                  <Button size="lg" variant="outline" disabled>
                    Заброньовано
                  </Button>
                  <p className="text-sm text-muted-foreground">Ця книга вже зайнята. Ви можете стати в чергу очікування.</p>
                  <Button variant="secondary" className="gap-2" onClick={handleJoinWaitlist}>
                    <Clock3 className="h-4 w-4" />
                    Додати в чергу очікування
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердити бронювання</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Ви бронюєте книгу <span className="font-medium text-foreground">«{book.title}»</span>. Ліміт одночасних бронювань: 3 книги.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={confirmBooking}>Підтвердити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
