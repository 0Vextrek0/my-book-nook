import { Book, Booking, User } from './types';

const COVER_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600',
  'bg-violet-600', 'bg-teal-600', 'bg-orange-600', 'bg-indigo-600',
];

export const mockBooks: Book[] = [
  { id: '1', isbn: '978-966-14-1234-5', inventoryNumber: 'INV-001', title: 'Тіні забутих предків', author: 'Михайло Коцюбинський', genre: 'Класика', year: 1911, status: 'available', coverColor: COVER_COLORS[0] },
  { id: '2', isbn: '978-966-14-2345-6', inventoryNumber: 'INV-002', title: 'Кайдашева сім\'я', author: 'Іван Нечуй-Левицький', genre: 'Класика', year: 1879, status: 'reserved', coverColor: COVER_COLORS[1] },
  { id: '3', isbn: '978-966-14-3456-7', inventoryNumber: 'INV-003', title: 'Місто', author: 'Валер\'ян Підмогильний', genre: 'Роман', year: 1928, status: 'available', coverColor: COVER_COLORS[2] },
  { id: '4', isbn: '978-966-14-4567-8', inventoryNumber: 'INV-004', title: 'Лісова пісня', author: 'Леся Українка', genre: 'Драма', year: 1911, status: 'available', coverColor: COVER_COLORS[3] },
  { id: '5', isbn: '978-966-14-5678-9', inventoryNumber: 'INV-005', title: 'Захар Беркут', author: 'Іван Франко', genre: 'Історичний', year: 1883, status: 'reserved', coverColor: COVER_COLORS[4] },
  { id: '6', isbn: '978-966-14-6789-0', inventoryNumber: 'INV-006', title: 'Маруся Чурай', author: 'Ліна Костенко', genre: 'Поезія', year: 1979, status: 'available', coverColor: COVER_COLORS[5] },
  { id: '7', isbn: '978-966-14-7890-1', inventoryNumber: 'INV-007', title: 'Енеїда', author: 'Іван Котляревський', genre: 'Поема', year: 1798, status: 'available', coverColor: COVER_COLORS[6] },
  { id: '8', isbn: '978-966-14-8901-2', inventoryNumber: 'INV-008', title: 'Чорна рада', author: 'Пантелеймон Куліш', genre: 'Історичний', year: 1857, status: 'written-off', coverColor: COVER_COLORS[7] },
  { id: '9', isbn: '978-966-14-9012-3', inventoryNumber: 'INV-009', title: 'Кобзар', author: 'Тарас Шевченко', genre: 'Поезія', year: 1840, status: 'available', coverColor: COVER_COLORS[0] },
  { id: '10', isbn: '978-966-14-0123-4', inventoryNumber: 'INV-010', title: 'Тигролови', author: 'Іван Багряний', genre: 'Пригодницький', year: 1944, status: 'available', coverColor: COVER_COLORS[1] },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Олена Петренко', email: 'olena@example.com', phone: '+380501234567', role: 'reader' },
  { id: 'u2', name: 'Іван Шевченко', email: 'ivan@example.com', phone: '+380671234567', role: 'reader' },
  { id: 'admin', name: 'Бібліотекар', email: 'admin@library.com', phone: '+380991234567', role: 'librarian' },
];

export const mockBookings: Booking[] = [
  { id: 'b1', userId: 'u1', bookId: '2', dateReserved: '2026-03-15', status: 'active' },
  { id: 'b2', userId: 'u2', bookId: '5', dateReserved: '2026-03-16', status: 'active' },
];

export const genres = ['Класика', 'Роман', 'Драма', 'Історичний', 'Поезія', 'Поема', 'Пригодницький', 'Фантастика', 'Детектив'];

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'available': return 'В наявності';
    case 'reserved': return 'Заброньовано';
    case 'written-off': return 'Списано';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'bg-success text-success-foreground';
    case 'reserved': return 'bg-accent text-accent-foreground';
    case 'written-off': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}
