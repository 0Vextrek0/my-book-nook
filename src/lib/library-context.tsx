import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Book, Booking } from '@/lib/types';
import { mockBooks, mockBookings } from '@/lib/mock-data';

interface LibraryContextType {
  books: Book[];
  bookings: Booking[];
  addBook: (book: Omit<Book, 'id' | 'status' | 'coverColor'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  writeOffBook: (id: string, reason: string, notes: string) => boolean;
  createBooking: (userId: string, bookId: string) => boolean;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

const COLORS = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-teal-600'];

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  const addBook = (book: Omit<Book, 'id' | 'status' | 'coverColor'>) => {
    const newBook: Book = {
      ...book,
      id: 'b-' + Date.now(),
      status: 'available',
      coverColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setBooks(prev => [...prev, newBook]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const writeOffBook = (id: string, reason: string, notes: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return false;
    const activeBooking = bookings.find(b => b.bookId === id && b.status === 'active');
    if (activeBooking) return false;
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status: 'written-off' as const } : b));
    return true;
  };

  const createBooking = (userId: string, bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.status !== 'available') return false;
    const userActiveBookings = bookings.filter(b => b.userId === userId && b.status === 'active');
    if (userActiveBookings.length >= 3) return false;
    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      userId,
      bookId,
      dateReserved: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setBookings(prev => [...prev, newBooking]);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'reserved' as const } : b));
    return true;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
      setBooks(prev => prev.map(b => b.id === booking.bookId ? { ...b, status: 'available' as const } : b));
    }
  };

  const completeBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completed' as const } : b));
      setBooks(prev => prev.map(b => b.id === booking.bookId ? { ...b, status: 'available' as const } : b));
    }
  };

  return (
    <LibraryContext.Provider value={{ books, bookings, addBook, updateBook, writeOffBook, createBooking, cancelBooking, completeBooking }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
