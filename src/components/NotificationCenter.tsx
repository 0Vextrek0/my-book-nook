import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useLibrary } from '@/lib/library-context';

export function NotificationCenter() {
  const { user } = useAuth();
  const { getNotificationsForUser, markAllNotificationsRead, markNotificationRead } = useLibrary();

  if (!user) return null;

  const notifications = getNotificationsForUser(user.id, user.role);
  const unread = notifications.filter((item) => !item.readBy.includes(user.id)).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Сповіщення">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Сповіщення</p>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => markAllNotificationsRead(user.id, user.role)}
            >
              Прочитати все
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">Поки що немає сповіщень</p>
          ) : (
            notifications.map((item) => {
              const read = item.readBy.includes(user.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`mb-1 w-full rounded-md border p-2 text-left transition-colors ${read ? 'bg-background' : 'bg-muted/50'}`}
                  onClick={() => markNotificationRead(item.id, user.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    {!read && <Badge className="bg-primary/15 text-primary">new</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
