import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReaderNav } from '@/components/ReaderNav';
import { useLibrary } from '@/lib/library-context';
import { useAuth } from '@/lib/auth-context';
import { getStatusLabel, getStatusColor } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { books, bookings, createBooking } = useLibrary();
  const { user } = useAuth();
  const navigate = useNavigate();

  const book = books.find(b => b.id === id);
  if (!book) {
    return (
      <div className="min-h-screen">
        <ReaderNav />
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Книгу не знайдено</p>
          <Link to="/catalog"><Button variant="outline" className="mt-4">До каталогу</Button></Link>
        </div>
      </div>
    );
  }

  const userActiveBookings = user ? bookings.filter(b => b.userId === user.id && b.status === 'active').length : 0;

  const handleBooking = () => {
    if (!user) {
      toast.error('Увійдіть, щоб забронювати книгу');
      navigate('/login');
      return;
    }
    if (userActiveBookings >= 3) {
      toast.error('Ви досягли ліміту бронювань (3 книги)');
      return;
    }
    const success = createBooking(user.id, book.id);
    if (success) {
      toast.success('Книгу успішно заброньовано!');
    } else {
      toast.error('Не вдалося забронювати книгу');
    }
  };

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container py-6 md:py-10">
        <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Назад до каталогу
        </Link>

        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Cover */}
          <div className={`${book.coverColor} rounded-xl h-80 md:h-[420px] flex items-center justify-center p-6`}>
            <div className="text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-primary-foreground/60" />
              <p className="font-display text-xl font-bold text-primary-foreground">{book.title}</p>
              <p className="mt-2 text-primary-foreground/80">{book.author}</p>
            </div>
          </div>

          {/* Details */}
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
            </div>

            <div className="mt-8">
              {book.status === 'available' ? (
                <Button size="lg" className="gap-2 font-display font-semibold" onClick={handleBooking}>
                  <BookOpen className="h-4 w-4" />
                  Забронювати
                </Button>
              ) : book.status === 'reserved' ? (
                <div>
                  <Button size="lg" variant="outline" disabled>
                    Заброньовано
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ця книга вже заброньована. Спробуйте пізніше.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
