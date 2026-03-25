import { useMemo, useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReaderNav } from '@/components/ReaderNav';
import { BookCard } from '@/components/BookCard';
import { useLibrary } from '@/lib/library-context';
import { genres } from '@/lib/mock-data';

const PAGE_SIZE = 8;

export default function CatalogPage() {
  const { books } = useLibrary();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [titleQuery, setTitleQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [isbn, setIsbn] = useState('');
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [genre, setGenre] = useState('all');
  const [status, setStatus] = useState('all');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const yearError = useMemo(() => {
    const fromOk = !yearFrom || /^\d{4}$/.test(yearFrom);
    const toOk = !yearTo || /^\d{4}$/.test(yearTo);
    if (!fromOk || !toOk) return 'Рік має містити 4 цифри.';
    if (yearFrom && yearTo && Number(yearFrom) > Number(yearTo)) return 'Початковий рік не може бути більшим за кінцевий.';
    return '';
  }, [yearFrom, yearTo]);

  const visibleBooks = useMemo(() => {
    if (yearError) return [];
    return books.filter((book) => {
      if (book.status === 'written-off') return false;
      if (status !== 'all' && book.status !== status) return false;
      if (genre !== 'all' && book.genre !== genre) return false;
      if (titleQuery.trim() && !book.title.toLowerCase().includes(titleQuery.trim().toLowerCase())) return false;
      if (authorQuery.trim() && !book.author.toLowerCase().includes(authorQuery.trim().toLowerCase())) return false;
      if (isbn.trim() && !book.isbn.toLowerCase().includes(isbn.trim().toLowerCase())) return false;
      if (inventoryNumber.trim() && !book.inventoryNumber.toLowerCase().includes(inventoryNumber.trim().toLowerCase())) return false;
      if (yearFrom && book.year < Number(yearFrom)) return false;
      if (yearTo && book.year > Number(yearTo)) return false;
      return true;
    });
  }, [books, yearError, status, genre, titleQuery, authorQuery, isbn, inventoryNumber, yearFrom, yearTo]);

  const pageCount = Math.max(1, Math.ceil(visibleBooks.length / PAGE_SIZE));
  const paginatedBooks = visibleBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setTitleQuery('');
    setAuthorQuery('');
    setIsbn('');
    setInventoryNumber('');
    setGenre('all');
    setStatus('all');
    setYearFrom('');
    setYearTo('');
    setPage(1);
  };

  const hasFilters =
    !!titleQuery || !!authorQuery || !!isbn || !!inventoryNumber || !!yearFrom || !!yearTo || genre !== 'all' || status !== 'all';

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container py-6 md:py-10">
        <h1 className="text-2xl font-bold md:text-3xl">Каталог книг</h1>

        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук за назвою..."
              value={titleQuery}
              onChange={(e) => {
                setTitleQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} aria-label="Фільтри">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Input
                placeholder="Автор"
                value={authorQuery}
                onChange={(e) => {
                  setAuthorQuery(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="ISBN"
                value={isbn}
                onChange={(e) => {
                  setIsbn(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="Інвентарний №"
                value={inventoryNumber}
                onChange={(e) => {
                  setInventoryNumber(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                value={genre}
                onValueChange={(value) => {
                  setGenre(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Жанр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі жанри</SelectItem>
                  {genres.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі статуси</SelectItem>
                  <SelectItem value="available">В наявності</SelectItem>
                  <SelectItem value="reserved">Заброньовано</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Рік від (YYYY)"
                value={yearFrom}
                onChange={(e) => {
                  setYearFrom(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="Рік до (YYYY)"
                value={yearTo}
                onChange={(e) => {
                  setYearTo(e.target.value);
                  setPage(1);
                }}
              />
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="justify-start gap-1">
                  <X className="h-3 w-3" /> Скинути фільтри
                </Button>
              )}
            </div>

            {yearError && <p className="text-sm text-destructive">{yearError}</p>}
          </div>
        )}

        {visibleBooks.length > 0 ? (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {pageCount > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Сторінка {page} з {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pageCount}
                  onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
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
