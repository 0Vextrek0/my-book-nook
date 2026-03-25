import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { hasPermission, Permission } from '@/lib/acl';
import { isStrongPassword, isValidEmail, isValidPhone, normalizeEmail } from '@/lib/auth-utils';
import { mockUsers } from '@/lib/mock-data';
import { RegisterResult, User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, phone: string, password: string) => RegisterResult;
  setUserRole: (userId: string, role: UserRole) => boolean;
  getUsersByRole: (role: UserRole | 'all') => User[];
  hasUserPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_STORAGE_KEY = 'my-book-nook-users-v1';
const SESSION_STORAGE_KEY = 'my-book-nook-user-id-v1';

function loadUsers(): User[] {
  if (typeof window === 'undefined') return mockUsers;
  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return mockUsers;
  try {
    const parsed = JSON.parse(raw) as User[];
    return parsed.length > 0 ? parsed : mockUsers;
  } catch {
    return mockUsers;
  }
}

function loadSessionUser(users: User[]): User | null {
  if (typeof window === 'undefined') return null;
  const sessionUserId = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionUserId) return null;
  return users.find((candidate) => candidate.id === sessionUserId) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [user, setUser] = useState<User | null>(() => loadSessionUser(loadUsers()));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, user.id);
  }, [user]);

  const login = (email: string, _password: string) => {
    const found = users.find((candidate) => normalizeEmail(candidate.email) === normalizeEmail(email));
    if (!found) return false;
    setUser(found);
    return true;
  };

  const logout = () => setUser(null);

  const register = (name: string, email: string, phone: string, password: string): RegisterResult => {
    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = phone.trim();

    if (!normalizedName || !isValidEmail(normalizedEmail) || !isValidPhone(normalizedPhone)) {
      return { success: false, reason: 'invalid_data' };
    }
    if (!isStrongPassword(password)) {
      return { success: false, reason: 'weak_password' };
    }
    const duplicate = users.some((candidate) => normalizeEmail(candidate.email) === normalizedEmail);
    if (duplicate) {
      return { success: false, reason: 'duplicate' };
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      role: 'reader',
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const setUserRole = (userId: string, role: UserRole) => {
    let updated = false;
    setUsers((prev) =>
      prev.map((candidate) => {
        if (candidate.id !== userId) return candidate;
        updated = true;
        return { ...candidate, role };
      }),
    );
    setUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      return { ...prev, role };
    });
    return updated;
  };

  const getUsersByRole = (role: UserRole | 'all') => {
    if (role === 'all') return users;
    return users.filter((candidate) => candidate.role === role);
  };

  const hasUserPermission = (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const value = {
    user,
    users,
    login,
    logout,
    register,
    setUserRole,
    getUsersByRole,
    hasUserPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
