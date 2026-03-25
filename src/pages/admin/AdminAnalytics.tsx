import { useMemo, useState } from 'react';
import { useLibrary } from '@/lib/library-context';
import { useAuth } from '@/lib/auth-context';
import { AnalyticsPeriod, UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const ROLE_LABELS: Record<UserRole, string> = {
  reader: 'Читач',
  librarian: 'Бібліотекар',
  admin: 'Адміністратор',
  db_admin: 'Адмін БД',
  support: 'Підтримка',
};

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: 'Сьогодні',
  week: 'Тиждень',
  month: 'Місяць',
};

export default function AdminAnalytics() {
  const { getAnalyticsSnapshot } = useLibrary();
  const { users } = useAuth();
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const snapshots = getAnalyticsSnapshot(period);
  const chartData = useMemo(
    () =>
      snapshots.map((item, idx) => ({
        idx: idx + 1,
        views: item.catalogViews,
        searches: item.searches,
        attempts: item.bookingAttempts,
        success: item.successfulBookings,
        activeReaders: item.activeReaders,
      })),
    [snapshots],
  );

  const latest = snapshots[snapshots.length - 1];
  const usersByRole = useMemo(() => {
    const counters: Record<UserRole, number> = {
      reader: 0,
      librarian: 0,
      admin: 0,
      db_admin: 0,
      support: 0,
    };
    users.forEach((user) => {
      counters[user.role] += 1;
    });
    return counters;
  }, [users]);

  const visibleRoles = (Object.keys(usersByRole) as UserRole[]).filter((role) => roleFilter === 'all' || role === roleFilter);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Аналітика</h1>
          <p className="mt-2 text-sm text-muted-foreground">Динамічні мок-метрики автоматично оновлюються кожні 7 секунд.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={period} onValueChange={(value: AnalyticsPeriod) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['today', 'week', 'month'] as AnalyticsPeriod[]).map((item) => (
                <SelectItem key={item} value={item}>
                  {PERIOD_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={(value: UserRole | 'all') => setRoleFilter(value)}>
            <SelectTrigger className="w-44">
              <SelectValue />
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
      </div>

      {latest && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Перегляди каталогу</p>
            <p className="mt-1 font-display text-2xl font-bold">{latest.catalogViews}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Пошукові запити</p>
            <p className="mt-1 font-display text-2xl font-bold">{latest.searches}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Спроби бронювання</p>
            <p className="mt-1 font-display text-2xl font-bold">{latest.bookingAttempts}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Успішні бронювання</p>
            <p className="mt-1 font-display text-2xl font-bold">{latest.successfulBookings}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Трафік і пошук ({PERIOD_LABELS[period]})</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="idx" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="searches" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Бронювання ({PERIOD_LABELS[period]})</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="idx" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attempts" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="success" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-4">
        <h2 className="font-semibold">Користувачі за ролями</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleRoles.map((role) => (
            <div key={role} className="rounded border bg-background p-3">
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
              <p className="mt-1 font-display text-xl font-bold">{usersByRole[role]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
