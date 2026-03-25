import { useMemo, useState } from 'react';
import { useLibrary } from '@/lib/library-context';
import { genres, getStatusColor, getStatusLabel } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function AdminCatalog() {
  const { books, writeOffBook, addBook } = useLibrary();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [showWriteOff, setShowWriteOff] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ isbn: '', title: '', author: '', year: '', genre: '', inventoryNumber: '' });
  const [writeOffReason, setWriteOffReason] = useState('');
  const [writeOffNotes, setWriteOffNotes] = useState('');

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.inventoryNumber.toLowerCase().includes(q),
    );
  }, [books, search]);

  const handleAdd = () => {
    const result = addBook(
      {
        isbn: form.isbn.trim(),
        title: form.title.trim(),
        author: form.author.trim(),
        year: Number(form.year),
        genre: form.genre || 'Інше',
        inventoryNumber: form.inventoryNumber.trim(),
      },
      { id: user?.id, name: user?.name },
    );
    if (!result.success) {
      if (result.reason === 'missing_fields') toast.error('Заповніть усі обовʼязкові поля: назва, автор, ISBN, інвентарний №.');
      if (result.reason === 'invalid_year') toast.error('Рік має бути в межах 1000–2100.');
      if (result.reason === 'duplicate_isbn') toast.error('Книга з таким ISBN вже існує.');
      return;
    }

    toast.success('Книгу успішно додано до каталогу.');
    setForm({ isbn: '', title: '', author: '', year: '', genre: '', inventoryNumber: '' });
    setShowAdd(false);
  };

  const handleWriteOff = () => {
    if (!showWriteOff || !writeOffReason) {
      toast.error('Вкажіть причину списання.');
      return;
    }
    const result = writeOffBook(showWriteOff, writeOffReason, writeOffNotes, { id: user?.id, name: user?.name });
    if (!result.success) {
      if (result.reason === 'active_booking') {
        toast.error('Неможливо списати книгу, бо вона має активне бронювання.');
      } else {
        toast.error('Не вдалося списати книгу.');
      }
      return;
    }

    toast.success('Книгу списано.');
    setShowWriteOff(null);
    setWriteOffReason('');
    setWriteOffNotes('');
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управління каталогом</h1>
          <p className="mt-1 text-sm text-muted-foreground">Додавайте нові книги, контролюйте статуси та списання.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Додати книгу
        </Button>
      </div>

      <div className="mt-5 max-w-md">
        <Input placeholder="Пошук за назвою, автором, ISBN, інвентарним №..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Назва</th>
              <th className="pb-3 font-medium">Автор</th>
              <th className="hidden pb-3 font-medium md:table-cell">ISBN</th>
              <th className="hidden pb-3 font-medium lg:table-cell">Інв. №</th>
              <th className="pb-3 font-medium">Статус</th>
              <th className="pb-3 font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book.id} className="group border-b transition-colors hover:bg-muted/50">
                <td className="py-3 font-medium">{book.title}</td>
                <td className="py-3 text-muted-foreground">{book.author}</td>
                <td className="hidden py-3 font-mono text-xs text-muted-foreground md:table-cell">{book.isbn}</td>
                <td className="hidden py-3 text-muted-foreground lg:table-cell">{book.inventoryNumber}</td>
                <td className="py-3">
                  <Badge className={`${getStatusColor(book.status)} text-xs`}>{getStatusLabel(book.status)}</Badge>
                </td>
                <td className="py-3">
                  {book.status !== 'written-off' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => setShowWriteOff(book.id)}
                    >
                      <Trash2 className="h-3 w-3" /> Списати
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBooks.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Нічого не знайдено за вашим запитом.</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="dark">
          <DialogHeader>
            <DialogTitle>Додати нову книгу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Назва *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Автор *</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ISBN *</Label>
                <Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div>
                <Label>Інвентарний № *</Label>
                <Input value={form.inventoryNumber} onChange={(e) => setForm({ ...form, inventoryNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Рік *</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div>
                <Label>Жанр</Label>
                <Select value={form.genre} onValueChange={(value) => setForm({ ...form, genre: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Скасувати
            </Button>
            <Button onClick={handleAdd}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showWriteOff} onOpenChange={() => setShowWriteOff(null)}>
        <DialogContent className="dark">
          <DialogHeader>
            <DialogTitle>Списання книги</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Причина списання *</Label>
              <Select value={writeOffReason} onValueChange={setWriteOffReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть причину" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="зношеність">Зношеність</SelectItem>
                  <SelectItem value="втрата">Втрата</SelectItem>
                  <SelectItem value="застарілість">Застарілість</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Примітки</Label>
              <Textarea value={writeOffNotes} onChange={(e) => setWriteOffNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWriteOff(null)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleWriteOff}>
              Списати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
