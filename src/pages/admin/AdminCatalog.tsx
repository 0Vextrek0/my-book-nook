import { useState } from 'react';
import { useLibrary } from '@/lib/library-context';
import { genres, getStatusLabel, getStatusColor } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCatalog() {
  const { books, bookings, addBook, writeOffBook } = useLibrary();
  const [showAdd, setShowAdd] = useState(false);
  const [showWriteOff, setShowWriteOff] = useState<string | null>(null);

  // Add book form
  const [form, setForm] = useState({ isbn: '', title: '', author: '', year: '', genre: '', inventoryNumber: '' });
  const [writeOffReason, setWriteOffReason] = useState('');
  const [writeOffNotes, setWriteOffNotes] = useState('');

  const handleAdd = () => {
    if (!form.title || !form.author) {
      toast.error('Назва та автор є обов\'язковими');
      return;
    }
    addBook({
      isbn: form.isbn,
      title: form.title,
      author: form.author,
      year: parseInt(form.year) || new Date().getFullYear(),
      genre: form.genre || 'Інше',
      inventoryNumber: form.inventoryNumber || 'INV-' + Date.now(),
    });
    toast.success('Книгу успішно додано до каталогу');
    setForm({ isbn: '', title: '', author: '', year: '', genre: '', inventoryNumber: '' });
    setShowAdd(false);
  };

  const handleWriteOff = () => {
    if (!showWriteOff || !writeOffReason) {
      toast.error('Вкажіть причину списання');
      return;
    }
    const activeBooking = bookings.find(b => b.bookId === showWriteOff && b.status === 'active');
    if (activeBooking) {
      toast.error('Неможливо списати книгу — вона зараз заброньована');
      setShowWriteOff(null);
      return;
    }
    const success = writeOffBook(showWriteOff, writeOffReason, writeOffNotes);
    if (success) {
      toast.success('Книгу списано');
    }
    setShowWriteOff(null);
    setWriteOffReason('');
    setWriteOffNotes('');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Управління каталогом</h1>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Додати книгу
        </Button>
      </div>

      {/* Books table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Назва</th>
              <th className="pb-3 font-medium">Автор</th>
              <th className="pb-3 font-medium hidden md:table-cell">ISBN</th>
              <th className="pb-3 font-medium hidden lg:table-cell">Жанр</th>
              <th className="pb-3 font-medium">Статус</th>
              <th className="pb-3 font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id} className="border-b hover:bg-muted/50 transition-colors group">
                <td className="py-3 font-medium">{book.title}</td>
                <td className="py-3 text-muted-foreground">{book.author}</td>
                <td className="py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{book.isbn}</td>
                <td className="py-3 text-muted-foreground hidden lg:table-cell">{book.genre}</td>
                <td className="py-3">
                  <Badge className={`${getStatusColor(book.status)} text-xs`}>{getStatusLabel(book.status)}</Badge>
                </td>
                <td className="py-3">
                  {book.status !== 'written-off' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity gap-1"
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
      </div>

      {/* Add book dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="dark">
          <DialogHeader>
            <DialogTitle>Додати нову книгу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Назва *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Автор *</Label>
              <Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ISBN</Label>
                <Input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div>
                <Label>Інвентарний №</Label>
                <Input value={form.inventoryNumber} onChange={e => setForm({ ...form, inventoryNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Рік</Label>
                <Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
              </div>
              <div>
                <Label>Жанр</Label>
                <Select value={form.genre} onValueChange={v => setForm({ ...form, genre: v })}>
                  <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                  <SelectContent>
                    {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button onClick={handleAdd}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write-off dialog */}
      <Dialog open={!!showWriteOff} onOpenChange={() => setShowWriteOff(null)}>
        <DialogContent className="dark">
          <DialogHeader>
            <DialogTitle>Списання книги</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Причина списання *</Label>
              <Select value={writeOffReason} onValueChange={setWriteOffReason}>
                <SelectTrigger><SelectValue placeholder="Оберіть причину" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="зношеність">Зношеність</SelectItem>
                  <SelectItem value="втрата">Втрата</SelectItem>
                  <SelectItem value="застарілість">Застарілість</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Додаткові примітки</Label>
              <Textarea value={writeOffNotes} onChange={e => setWriteOffNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWriteOff(null)}>Скасувати</Button>
            <Button variant="destructive" onClick={handleWriteOff}>Списати</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
