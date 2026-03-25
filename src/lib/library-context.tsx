import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { appendSnapshot, nextAnalyticsSnapshot } from '@/lib/analytics-utils';
import {
  mockAnalytics,
  mockAuditLogs,
  mockBookings,
  mockBooks,
  mockNotifications,
  mockWaitlist,
  mockWriteOffRecords,
} from '@/lib/mock-data';
import {
  AddBookResult,
  AnalyticsPeriod,
  AnalyticsSnapshot,
  AuditLog,
  Book,
  Booking,
  BookingResult,
  Notification,
  NotificationType,
  UserRole,
  WaitlistEntry,
  WriteOffRecord,
  WriteOffResult,
} from '@/lib/types';

interface LibraryContextType {
  books: Book[];
  bookings: Booking[];
  writeOffRecords: WriteOffRecord[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  waitlist: WaitlistEntry[];
  addBook: (book: Omit<Book, 'id' | 'status' | 'coverColor'>, actor?: { id?: string; name?: string }) => AddBookResult;
  updateBook: (id: string, updates: Partial<Book>) => void;
  writeOffBook: (id: string, reason: string, notes: string, actor?: { id?: string; name?: string }) => WriteOffResult;
  createBooking: (userId: string, bookId: string) => BookingResult;
  enqueueWaitlist: (userId: string, bookId: string) => BookingResult;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  pushNotification: (payload: {
    title: string;
    message: string;
    type?: NotificationType;
    userId?: string;
    role?: UserRole;
  }) => void;
  getNotificationsForUser: (userId: string, role: UserRole) => Notification[];
  markNotificationRead: (notificationId: string, userId: string) => void;
  markAllNotificationsRead: (userId: string, role: UserRole) => void;
  addAuditLog: (payload: Omit<AuditLog, 'id' | 'createdAt'>) => void;
  getAnalyticsSnapshot: (period: AnalyticsPeriod) => AnalyticsSnapshot[];
}

interface LibraryState {
  books: Book[];
  bookings: Booking[];
  writeOffRecords: WriteOffRecord[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  waitlist: WaitlistEntry[];
  analytics: Record<AnalyticsPeriod, AnalyticsSnapshot[]>;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

const COLORS = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-teal-600'];
const LIBRARY_STORAGE_KEY = 'my-book-nook-library-v1';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function withNewestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function loadInitialState(): LibraryState {
  if (typeof window === 'undefined') {
    return {
      books: mockBooks,
      bookings: mockBookings,
      writeOffRecords: mockWriteOffRecords,
      notifications: mockNotifications,
      auditLogs: mockAuditLogs,
      waitlist: mockWaitlist,
      analytics: mockAnalytics,
    };
  }

  const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
  if (!raw) {
    return {
      books: mockBooks,
      bookings: mockBookings,
      writeOffRecords: mockWriteOffRecords,
      notifications: mockNotifications,
      auditLogs: mockAuditLogs,
      waitlist: mockWaitlist,
      analytics: mockAnalytics,
    };
  }

  try {
    const parsed = JSON.parse(raw) as LibraryState;
    return {
      books: parsed.books ?? mockBooks,
      bookings: parsed.bookings ?? mockBookings,
      writeOffRecords: parsed.writeOffRecords ?? mockWriteOffRecords,
      notifications: parsed.notifications ?? mockNotifications,
      auditLogs: parsed.auditLogs ?? mockAuditLogs,
      waitlist: parsed.waitlist ?? mockWaitlist,
      analytics: parsed.analytics ?? mockAnalytics,
    };
  } catch {
    return {
      books: mockBooks,
      bookings: mockBookings,
      writeOffRecords: mockWriteOffRecords,
      notifications: mockNotifications,
      auditLogs: mockAuditLogs,
      waitlist: mockWaitlist,
      analytics: mockAnalytics,
    };
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(() => loadInitialState());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => {
        const readers = new Set(prev.bookings.map((booking) => booking.userId)).size;
        const updatePeriod = (period: AnalyticsPeriod) => {
          const periodData = prev.analytics[period];
          const last = periodData[periodData.length - 1];
          const next = nextAnalyticsSnapshot(last);
          next.activeReaders = Math.max(readers, next.activeReaders);
          return appendSnapshot(periodData, period, next);
        };
        return {
          ...prev,
          analytics: {
            today: updatePeriod('today'),
            week: updatePeriod('week'),
            month: updatePeriod('month'),
          },
        };
      });
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  const pushNotification: LibraryContextType['pushNotification'] = ({ title, message, type = 'info', userId, role }) => {
    const notification: Notification = {
      id: createId('ntf'),
      title,
      message,
      type,
      userId,
      role,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
    setState((prev) => ({ ...prev, notifications: [notification, ...prev.notifications] }));
  };

  const addAuditLog: LibraryContextType['addAuditLog'] = (payload) => {
    const log: AuditLog = {
      ...payload,
      id: createId('log'),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, auditLogs: [log, ...prev.auditLogs].slice(0, 500) }));
  };

  const addBook: LibraryContextType['addBook'] = (book, actor) => {
    if (!book.title.trim() || !book.author.trim() || !book.isbn.trim() || !book.inventoryNumber.trim()) {
      return { success: false, reason: 'missing_fields' };
    }

    if (!Number.isFinite(book.year) || book.year < 1000 || book.year > 2100) {
      return { success: false, reason: 'invalid_year' };
    }

    const duplicate = state.books.some((existing) => existing.isbn.trim().toLowerCase() === book.isbn.trim().toLowerCase());
    if (duplicate) {
      return { success: false, reason: 'duplicate_isbn' };
    }

    const newBook: Book = {
      ...book,
      id: createId('book'),
      status: 'available',
      coverColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setState((prev) => ({ ...prev, books: [...prev.books, newBook] }));
    addAuditLog({
      action: 'book.add',
      entityType: 'book',
      entityId: newBook.id,
      details: `Додано нову книгу «${newBook.title}» (${newBook.isbn}).`,
      actorId: actor?.id,
      actorName: actor?.name,
    });
    pushNotification({
      title: 'Каталог оновлено',
      message: `Додано нову книгу: ${newBook.title}.`,
      type: 'success',
      role: 'librarian',
    });
    return { success: true, book: newBook };
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setState((prev) => ({
      ...prev,
      books: prev.books.map((book) => (book.id === id ? { ...book, ...updates } : book)),
    }));
  };

  const createBooking: LibraryContextType['createBooking'] = (userId, bookId) => {
    const book = state.books.find((candidate) => candidate.id === bookId);
    if (!book || book.status !== 'available') return { success: false, reason: 'book_unavailable' };

    const activeCount = state.bookings.filter((booking) => booking.userId === userId && booking.status === 'active').length;
    if (activeCount >= 3) return { success: false, reason: 'limit_reached' };

    const booking: Booking = {
      id: createId('bk'),
      userId,
      bookId,
      dateReserved: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setState((prev) => ({
      ...prev,
      bookings: [...prev.bookings, booking],
      books: prev.books.map((candidate) => (candidate.id === bookId ? { ...candidate, status: 'reserved' } : candidate)),
    }));

    pushNotification({
      title: 'Бронювання створено',
      message: `Ви успішно забронювали книгу «${book.title}».`,
      type: 'success',
      userId,
    });
    pushNotification({
      title: 'Нове бронювання',
      message: `Книгу «${book.title}» потрібно підготувати до видачі.`,
      role: 'librarian',
      type: 'info',
    });
    addAuditLog({
      action: 'booking.create',
      entityType: 'booking',
      entityId: booking.id,
      details: `Створено бронювання для книги «${book.title}».`,
      actorId: userId,
    });
    return { success: true };
  };

  const enqueueWaitlist: LibraryContextType['enqueueWaitlist'] = (userId, bookId) => {
    const book = state.books.find((candidate) => candidate.id === bookId);
    if (!book || book.status === 'available') return { success: false, reason: 'book_unavailable' };

    const alreadyWaiting = state.waitlist.some(
      (entry) => entry.userId === userId && entry.bookId === bookId && entry.status === 'waiting',
    );
    if (alreadyWaiting) return { success: false, reason: 'already_waiting' };

    const entry: WaitlistEntry = {
      id: createId('wl'),
      userId,
      bookId,
      createdAt: new Date().toISOString(),
      status: 'waiting',
    };

    setState((prev) => ({ ...prev, waitlist: [...prev.waitlist, entry] }));
    pushNotification({
      title: 'Черга очікування',
      message: 'Вас додано до черги на обрану книгу.',
      userId,
      type: 'info',
    });
    addAuditLog({
      action: 'waitlist.enqueue',
      entityType: 'booking',
      entityId: entry.id,
      details: 'Користувача додано в чергу очікування.',
      actorId: userId,
    });
    return { success: true };
  };

  const releaseBookToWaitlist = (bookId: string, prevState: LibraryState): LibraryState => {
    const nextInQueue = prevState.waitlist
      .filter((entry) => entry.bookId === bookId && entry.status === 'waiting')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (!nextInQueue) return prevState;

    const notifications = [
      {
        id: createId('ntf'),
        title: 'Книга стала доступною',
        message: 'Книга, яку ви очікували, доступна для бронювання.',
        type: 'success' as const,
        createdAt: new Date().toISOString(),
        userId: nextInQueue.userId,
        readBy: [],
      },
      ...prevState.notifications,
    ];

    return {
      ...prevState,
      waitlist: prevState.waitlist.map((entry) =>
        entry.id === nextInQueue.id ? { ...entry, status: 'notified' } : entry,
      ),
      notifications,
    };
  };

  const cancelBooking = (bookingId: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((candidate) => candidate.id === bookingId);
      if (!booking) return prev;

      const updated: LibraryState = {
        ...prev,
        bookings: prev.bookings.map((candidate) =>
          candidate.id === bookingId ? { ...candidate, status: 'cancelled' } : candidate,
        ),
        books: prev.books.map((candidate) =>
          candidate.id === booking.bookId ? { ...candidate, status: 'available' } : candidate,
        ),
      };
      return releaseBookToWaitlist(booking.bookId, updated);
    });
  };

  const completeBooking = (bookingId: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((candidate) => candidate.id === bookingId);
      if (!booking) return prev;

      const updated: LibraryState = {
        ...prev,
        bookings: prev.bookings.map((candidate) =>
          candidate.id === bookingId ? { ...candidate, status: 'completed' } : candidate,
        ),
        books: prev.books.map((candidate) =>
          candidate.id === booking.bookId ? { ...candidate, status: 'available' } : candidate,
        ),
      };
      return releaseBookToWaitlist(booking.bookId, updated);
    });
  };

  const writeOffBook: LibraryContextType['writeOffBook'] = (id, reason, notes, actor) => {
    const book = state.books.find((candidate) => candidate.id === id);
    if (!book) return { success: false, reason: 'book_not_found' };

    const activeBooking = state.bookings.find((booking) => booking.bookId === id && booking.status === 'active');
    if (activeBooking) {
      return { success: false, reason: 'active_booking', activeBookingUserId: activeBooking.userId };
    }

    const record: WriteOffRecord = {
      id: createId('wo'),
      bookId: id,
      bookTitle: book.title,
      reason,
      date: new Date().toISOString().split('T')[0],
      notes,
      writtenOffBy: actor?.name ?? 'Невідомий',
    };

    setState((prev) => ({
      ...prev,
      books: prev.books.map((candidate) => (candidate.id === id ? { ...candidate, status: 'written-off' } : candidate)),
      writeOffRecords: [record, ...prev.writeOffRecords],
    }));
    addAuditLog({
      action: 'book.writeoff',
      entityType: 'writeoff',
      entityId: record.id,
      details: `Книгу «${book.title}» списано. Причина: ${reason}.`,
      actorId: actor?.id,
      actorName: actor?.name,
    });
    pushNotification({
      title: 'Списання книги',
      message: `Книга «${book.title}» переведена в архів списань.`,
      role: 'admin',
      type: 'warning',
    });
    return { success: true };
  };

  const getNotificationsForUser = (userId: string, role: UserRole) => {
    const eligible = state.notifications.filter((item) => item.userId === userId || item.role === role || (!item.userId && !item.role));
    return withNewestFirst(eligible);
  };

  const markNotificationRead = (notificationId: string, userId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => {
        if (item.id !== notificationId || item.readBy.includes(userId)) return item;
        return { ...item, readBy: [...item.readBy, userId] };
      }),
    }));
  };

  const markAllNotificationsRead = (userId: string, role: UserRole) => {
    const userNotifications = getNotificationsForUser(userId, role).map((item) => item.id);
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => {
        if (!userNotifications.includes(item.id) || item.readBy.includes(userId)) return item;
        return { ...item, readBy: [...item.readBy, userId] };
      }),
    }));
  };

  const getAnalyticsSnapshot = (period: AnalyticsPeriod) => state.analytics[period];

  const value = {
    books: state.books,
    bookings: state.bookings,
    writeOffRecords: state.writeOffRecords,
    notifications: state.notifications,
    auditLogs: state.auditLogs,
    waitlist: state.waitlist,
    addBook,
    updateBook,
    writeOffBook,
    createBooking,
    enqueueWaitlist,
    cancelBooking,
    completeBooking,
    pushNotification,
    getNotificationsForUser,
    markNotificationRead,
    markAllNotificationsRead,
    addAuditLog,
    getAnalyticsSnapshot,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
