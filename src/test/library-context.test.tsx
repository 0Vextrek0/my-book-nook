import { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LibraryProvider, useLibrary } from '@/lib/library-context';

function Wrapper({ children }: { children: ReactNode }) {
  return <LibraryProvider>{children}</LibraryProvider>;
}

describe('Library context', () => {
  beforeEach(() => {
    window.localStorage.removeItem('my-book-nook-library-v1');
  });

  it('blocks adding book with duplicate ISBN', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    const duplicate = result.current.books[0].isbn;

    let response;
    act(() => {
      response = result.current.addBook({
        isbn: duplicate,
        title: 'Нова книга',
        author: 'Автор',
        year: 2024,
        genre: 'Роман',
        inventoryNumber: 'INV-999',
      });
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('duplicate_isbn');
  });

  it('prevents write-off for active bookings', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.writeOffBook('2', 'зношеність', 'test');
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('active_booking');
  });
});
