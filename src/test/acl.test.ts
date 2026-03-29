import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/lib/acl';

describe('ACL', () => {
  it('allows readers to view catalog only', () => {
    expect(hasPermission('reader', 'catalog.view')).toBe(true);
    expect(hasPermission('reader', 'admin.access')).toBe(false);
  });

  it('allows catalog and write-off management only for privileged roles', () => {
    expect(hasPermission('reader', 'catalog.manage')).toBe(false);
    expect(hasPermission('reader', 'writeoff.manage')).toBe(false);
    expect(hasPermission('admin', 'catalog.manage')).toBe(true);
    expect(hasPermission('admin', 'writeoff.manage')).toBe(true);
  });

  it('allows admins to manage users and analytics', () => {
    expect(hasPermission('admin', 'users.manage')).toBe(true);
    expect(hasPermission('admin', 'analytics.view')).toBe(true);
  });
});
