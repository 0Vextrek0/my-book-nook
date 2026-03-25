import { useMemo, useState } from 'react';
import { useLibrary } from '@/lib/library-context';
import { Input } from '@/components/ui/input';

export default function AdminLogs() {
  const { auditLogs } = useLibrary();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.actorName ?? '').toLowerCase().includes(q),
    );
  }, [auditLogs, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Системні логи</h1>
      <p className="mt-2 text-sm text-muted-foreground">Аудит дій користувачів і змін у системі.</p>

      <div className="mt-5 max-w-sm">
        <Input placeholder="Пошук по action, типу сутності або опису..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Дата</th>
              <th className="pb-3 font-medium">Дія</th>
              <th className="pb-3 font-medium">Сутність</th>
              <th className="pb-3 font-medium">Виконавець</th>
              <th className="pb-3 font-medium">Деталі</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="py-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString('uk-UA')}</td>
                <td className="py-3 font-medium">{log.action}</td>
                <td className="py-3 text-muted-foreground">{log.entityType}</td>
                <td className="py-3 text-muted-foreground">{log.actorName || log.actorId || 'Система'}</td>
                <td className="max-w-lg py-3 text-muted-foreground">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">Записів не знайдено.</p>}
      </div>
    </div>
  );
}
