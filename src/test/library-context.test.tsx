import { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LibraryProvider, useLibrary } from '@/lib/library-context';
import { mockAnalytics } from '@/lib/mock-data';

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

  it('creates booking for an available book and marks it as reserved', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.createBooking('u1', '1');
    });

    expect(response?.success).toBe(true);
    const createdBooking = result.current.bookings.find((booking) => booking.userId === 'u1' && booking.bookId === '1');
    expect(createdBooking?.status).toBe('active');
    expect(result.current.books.find((book) => book.id === '1')?.status).toBe('reserved');
  });

  it('rejects booking when a book is unavailable', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.createBooking('u1', '2');
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('book_unavailable');
  });

  it('rejects booking when user has reached active booking limit', () => {
    window.localStorage.setItem(
      'my-book-nook-library-v1',
      JSON.stringify({
        books: [
          {
            id: 'book-limit',
            isbn: '978-0-00-000000-1',
            inventoryNumber: 'INV-LIMIT',
            title: 'Limit Test',
            author: 'QA',
            genre: 'Test',
            year: 2020,
            status: 'available',
            coverColor: 'bg-blue-600',
          },
        ],
        bookings: [
          { id: 'b-1', userId: 'reader-limit', bookId: 'old-1', dateReserved: '2026-03-01', status: 'active' },
          { id: 'b-2', userId: 'reader-limit', bookId: 'old-2', dateReserved: '2026-03-02', status: 'active' },
          { id: 'b-3', userId: 'reader-limit', bookId: 'old-3', dateReserved: '2026-03-03', status: 'active' },
        ],
        writeOffRecords: [],
        notifications: [],
        auditLogs: [],
        waitlist: [],
        analytics: mockAnalytics,
      }),
    );

    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.createBooking('reader-limit', 'book-limit');
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('limit_reached');
  });

  it('writes off an existing book without active bookings', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.writeOffBook('1', 'obsolete', 'test note', { id: 'adm1', name: 'Admin' });
    });

    expect(response?.success).toBe(true);
    expect(result.current.books.find((book) => book.id === '1')?.status).toBe('written-off');
    expect(result.current.writeOffRecords[0]?.bookId).toBe('1');
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

  it('returns not found when writing off an unknown book', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper: Wrapper });
    let response;

    act(() => {
      response = result.current.writeOffBook('missing-book', 'obsolete', 'test');
    });

    expect(response?.success).toBe(false);
    expect(response?.reason).toBe('book_not_found');
  });
});
