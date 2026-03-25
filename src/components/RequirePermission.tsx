import { Permission } from '@/lib/acl';
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface Props {
  permission: Permission;
  children: ReactNode;
}

export function RequirePermission({ permission, children }: Props) {
  const { user, hasUserPermission } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!hasUserPermission(permission)) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}
