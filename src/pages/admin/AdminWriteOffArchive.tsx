import { useLibrary } from '@/lib/library-context';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

export default function AdminWriteOffArchive() {
  const { writeOffRecords } = useLibrary();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return writeOffRecords;
    return writeOffRecords.filter(
      (record) =>
        record.bookTitle.toLowerCase().includes(q) ||
        record.reason.toLowerCase().includes(q) ||
        record.writtenOffBy.toLowerCase().includes(q),
    );
  }, [writeOffRecords, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Архів списань</h1>
      <p className="mt-2 text-sm text-muted-foreground">Історія списаних книг з причинами, датами та примітками.</p>

      <div className="mt-5 max-w-sm">
        <Input placeholder="Пошук за книгою, причиною або виконавцем..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Книга</th>
              <th className="pb-3 font-medium">Причина</th>
              <th className="pb-3 font-medium">Дата</th>
              <th className="pb-3 font-medium">Виконавець</th>
              <th className="pb-3 font-medium">Примітка</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="py-3 font-medium">{record.bookTitle}</td>
                <td className="py-3">{record.reason}</td>
                <td className="py-3 text-muted-foreground">{record.date}</td>
                <td className="py-3 text-muted-foreground">{record.writtenOffBy}</td>
                <td className="max-w-xs py-3 text-muted-foreground">{record.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">Записів списання не знайдено.</p>}
      </div>
    </div>
  );
}
