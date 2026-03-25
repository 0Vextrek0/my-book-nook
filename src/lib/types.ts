export type UserRole = 'reader' | 'librarian' | 'admin' | 'db_admin' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export type BookStatus = 'available' | 'reserved' | 'written-off';

export interface Book {
  id: string;
  isbn: string;
  inventoryNumber: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  status: BookStatus;
  coverColor: string;
  coverUrl?: string;
}

export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  bookId: string;
  dateReserved: string;
  status: BookingStatus;
}

export interface WriteOffRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  reason: string;
  date: string;
  notes: string;
  writtenOffBy: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  userId?: string;
  role?: UserRole;
  readBy: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'book' | 'booking' | 'user' | 'writeoff' | 'system';
  entityId: string;
  details: string;
  createdAt: string;
  actorId?: string;
  actorName?: string;
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  status: 'waiting' | 'notified' | 'cancelled';
}

export type AnalyticsPeriod = 'today' | 'week' | 'month';

export interface AnalyticsSnapshot {
  timestamp: string;
  catalogViews: number;
  searches: number;
  bookingAttempts: number;
  successfulBookings: number;
  activeReaders: number;
}

export interface RegisterResult {
  success: boolean;
  reason?: 'invalid_data' | 'weak_password' | 'duplicate';
  user?: User;
}

export interface AddBookResult {
  success: boolean;
  reason?: 'missing_fields' | 'invalid_year' | 'duplicate_isbn';
  book?: Book;
}

export interface BookingResult {
  success: boolean;
  reason?: 'book_unavailable' | 'limit_reached' | 'already_waiting';
}

export interface WriteOffResult {
  success: boolean;
  reason?: 'book_not_found' | 'active_booking';
  activeBookingUserId?: string;
}
