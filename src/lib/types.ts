export type UserRole = 'reader' | 'librarian';

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
  bookId: string;
  reason: string;
  date: string;
  notes: string;
}
