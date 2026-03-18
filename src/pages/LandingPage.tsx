import { Link } from 'react-router-dom';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReaderNav } from '@/components/ReaderNav';
import { BookCard } from '@/components/BookCard';
import { useLibrary } from '@/lib/library-context';

export default function LandingPage() {
  const { books } = useLibrary();
  const featuredBooks = books.filter(b => b.status === 'available').slice(0, 4);

  return (
    <div className="min-h-screen">
      <ReaderNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary))_0%,_hsl(217_91%_45%)_100%)]" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground">
              <BookOpen className="h-4 w-4" />
              Ваша персональна бібліотека
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground md:text-6xl">
              My Library Book
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 md:text-xl">
              Шукайте, бронюйте та читайте книги онлайн. Ваша бібліотека завжди поруч.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/catalog">
                <Button size="lg" variant="secondary" className="gap-2 font-display font-semibold">
                  <Search className="h-4 w-4" />
                  Переглянути каталог
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-display font-semibold">
                  Зареєструватися
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Як це працює</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: '🔍', title: 'Шукайте', desc: 'Знаходьте книги за назвою, автором або жанром у нашому каталозі.' },
              { icon: '📋', title: 'Бронюйте', desc: 'Забронюйте книгу онлайн та заберіть її у бібліотеці.' },
              { icon: '📖', title: 'Читайте', desc: 'Насолоджуйтесь читанням та поверніть книгу у зручний час.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured books */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Популярні книги</h2>
            <Link to="/catalog" className="text-sm font-medium text-primary hover:underline">
              Дивитись всі →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 My Library Book. Усі права захищено.
        </div>
      </footer>
    </div>
  );
}
