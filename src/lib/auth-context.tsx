import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, phone: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    const found = mockUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    // Demo: any email logs in as reader
    setUser({ id: 'demo', name: 'Демо Користувач', email, phone: '', role: 'reader' });
    return true;
  };

  const logout = () => setUser(null);

  const register = (name: string, email: string, phone: string, _password: string) => {
    setUser({ id: 'new-' + Date.now(), name, email, phone, role: 'reader' });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
