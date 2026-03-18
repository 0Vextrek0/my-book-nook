import { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReaderNav } from '@/components/ReaderNav';
import { BookCard } from '@/components/BookCard';
import { useLibrary } from '@/lib/library-context';
import { genres } from '@/lib/mock-data';

export default function CatalogPage() {
  const { books } = useLibrary();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const visibleBooks = useMemo(() => {
    return books.filter(b => {
      if (b.status === 'written-off') return false;
      const q = search.toLowerCase();
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchesGenre = genre === 'all' || b.genre === genre;
      return matchesSearch && matchesGenre;
    });
  }, [books, search, genre]);

  const clearFilters = () => {
    setSearch('');
    setGenre('all');
  };

  const hasFilters = search || genre !== 'all';

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container py-6 md:py-10">
        <h1 className="text-2xl font-bold md:text-3xl">Каталог книг</h1>

        {/* Search bar */}
        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук за назвою або автором..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-3 animate-fade-in">
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Жанр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі жанри</SelectItem>
                {genres.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" /> Скинути фільтри
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {visibleBooks.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">За вашим запитом нічого не знайдено</p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Скинути фільтри
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
