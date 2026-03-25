import { UserRole } from '@/lib/types';

export type Permission =
  | 'catalog.view'
  | 'catalog.manage'
  | 'bookings.viewOwn'
  | 'bookings.manage'
  | 'writeoff.manage'
  | 'users.view'
  | 'users.manage'
  | 'analytics.view'
  | 'logs.view'
  | 'admin.access';

export const rolePermissions: Record<UserRole, Permission[]> = {
  reader: ['catalog.view', 'bookings.viewOwn'],
  librarian: ['catalog.view', 'catalog.manage', 'bookings.manage', 'writeoff.manage', 'users.view', 'admin.access'],
  admin: [
    'catalog.view',
    'catalog.manage',
    'bookings.manage',
    'writeoff.manage',
    'users.view',
    'users.manage',
    'analytics.view',
    'logs.view',
    'admin.access',
  ],
  db_admin: ['users.view', 'analytics.view', 'logs.view', 'admin.access'],
  support: ['users.view', 'bookings.manage', 'logs.view', 'admin.access'],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
