import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ROLE_LABELS: Record<UserRole, string> = {
  reader: 'Читач',
  librarian: 'Бібліотекар',
  admin: 'Адміністратор',
  db_admin: 'Адмін БД',
  support: 'Підтримка',
};

export default function AdminUsers() {
  const { users, setUserRole, hasUserPermission, user } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const canManageRoles = hasUserPermission('users.manage');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((candidate) => {
      const matchesRole = roleFilter === 'all' || candidate.role === roleFilter;
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.phone.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const groupedStats = useMemo(() => {
    const result: Record<UserRole, number> = {
      reader: 0,
      librarian: 0,
      admin: 0,
      db_admin: 0,
      support: 0,
    };
    users.forEach((candidate) => {
      result[candidate.role] += 1;
    });
    return result;
  }, [users]);

  const handleRoleChange = (userId: string, role: UserRole) => {
    const ok = setUserRole(userId, role);
    if (!ok) {
      toast.error('Не вдалося оновити роль.');
      return;
    }
    toast.success('Роль оновлено.');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Користувачі та ролі</h1>
      <p className="mt-2 text-sm text-muted-foreground">Перегляд облікових записів, фільтрація та керування ролями.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
          <div key={role} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
            <p className="mt-1 font-display text-2xl font-bold">{groupedStats[role]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Пошук за ПІБ, email або телефоном..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={roleFilter} onValueChange={(value: UserRole | 'all') => setRoleFilter(value)}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Фільтр ролі" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі ролі</SelectItem>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">ПІБ</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="hidden pb-3 font-medium md:table-cell">Телефон</th>
              <th className="pb-3 font-medium">Роль</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((candidate) => (
              <tr key={candidate.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="py-3 font-medium">{candidate.name}</td>
                <td className="py-3">{candidate.email}</td>
                <td className="hidden py-3 text-muted-foreground md:table-cell">{candidate.phone}</td>
                <td className="py-3">
                  {canManageRoles && candidate.id !== user?.id ? (
                    <Select value={candidate.role} onValueChange={(value: UserRole) => handleRoleChange(candidate.id, value)}>
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className="bg-primary/15 text-primary">{ROLE_LABELS[candidate.role]}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">Немає користувачів за поточними фільтрами.</p>}
      </div>
    </div>
  );
}
