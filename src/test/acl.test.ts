import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/lib/acl';

describe('ACL', () => {
  it('allows readers to view catalog only', () => {
    expect(hasPermission('reader', 'catalog.view')).toBe(true);
    expect(hasPermission('reader', 'admin.access')).toBe(false);
  });

  it('allows admins to manage users and analytics', () => {
    expect(hasPermission('admin', 'users.manage')).toBe(true);
    expect(hasPermission('admin', 'analytics.view')).toBe(true);
  });
});
