import { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('Auth context', () => {
  beforeEach(() => {
    window.localStorage.removeItem('my-book-nook-users-v1');
    window.localStorage.removeItem('my-book-nook-user-id-v1');
  });

  it('rejects duplicate email during registration', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.register('Test User', 'olena@example.com', '+380501111111', 'abc12345');
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('duplicate');
  });

  it('rejects weak password', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.register('Test User', 'new@example.com', '+380501111111', 'weak');
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('weak_password');
  });
});
