import { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth-context';
import { LibraryProvider } from '@/lib/library-context';
import AdminCatalog from '@/pages/admin/AdminCatalog';
import { mockAnalytics, mockUsers } from '@/lib/mock-data';
import { Book } from '@/lib/types';

const LIBRARY_STORAGE_KEY = 'my-book-nook-library-v1';
const USERS_STORAGE_KEY = 'my-book-nook-users-v1';
const SESSION_STORAGE_KEY = 'my-book-nook-user-id-v1';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LibraryProvider>{children}</LibraryProvider>
    </AuthProvider>
  );
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    isbn: '111-1-11-111111-1',
    inventoryNumber: 'INV-100',
    title: 'Alpha Book',
    author: 'Alice Writer',
    genre: 'Novel',
    year: 2020,
    status: 'available',
    coverColor: 'bg-blue-600',
    ...overrides,
  };
}

function seedAuthAsAdmin() {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
  window.localStorage.setItem(SESSION_STORAGE_KEY, 'adm1');
}

function seedLibrary(books: Book[]) {
  window.localStorage.setItem(
    LIBRARY_STORAGE_KEY,
    JSON.stringify({
      books,
      bookings: [],
      writeOffRecords: [],
      notifications: [],
      auditLogs: [],
      waitlist: [],
      analytics: mockAnalytics,
    }),
  );
}

function openAddDialog() {
  fireEvent.click(screen.getByRole('button', { name: /Додати книгу/i }));
  return screen.getByRole('dialog');
}

function submitAddBookForm(payload: {
  title: string;
  author: string;
  isbn: string;
  inventoryNumber: string;
  year: number;
}) {
  const dialog = screen.getByRole('dialog');
  const fields = within(dialog).getAllByRole('textbox');

  fireEvent.change(fields[0], { target: { value: payload.title } });
  fireEvent.change(fields[1], { target: { value: payload.author } });
  fireEvent.change(fields[2], { target: { value: payload.isbn } });
  fireEvent.change(fields[3], { target: { value: payload.inventoryNumber } });
  fireEvent.change(within(dialog).getByRole('spinbutton'), { target: { value: String(payload.year) } });
  fireEvent.click(within(dialog).getByRole('button', { name: /Зберегти/i }));
}

describe('Admin catalog - adding new books', () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedAuthAsAdmin();
  });

  it('adds a new book after clicking add and save with all required fields', () => {
    seedLibrary([makeBook()]);
    render(
      <Wrapper>
        <AdminCatalog />
      </Wrapper>,
    );

    const initialRows = within(screen.getByRole('table')).getAllByRole('row').length;
    openAddDialog();
    submitAddBookForm({
      title: 'Clean Architecture',
      author: 'Robert Martin',
      isbn: '978-0-13-449416-6',
      inventoryNumber: 'INV-777',
      year: 2017,
    });

    expect(screen.getByText('Clean Architecture')).toBeInTheDocument();
    const nextRows = within(screen.getByRole('table')).getAllByRole('row').length;
    expect(nextRows).toBe(initialRows + 1);
  });

  it('does not add a book when required fields are missing', () => {
    seedLibrary([makeBook()]);
    render(
      <Wrapper>
        <AdminCatalog />
      </Wrapper>,
    );

    openAddDialog();
    submitAddBookForm({
      title: 'Incomplete Book',
      author: '',
      isbn: '',
      inventoryNumber: '',
      year: 2022,
    });

    expect(screen.queryByText('Incomplete Book')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('blocks adding a book with duplicate ISBN', () => {
    const existing = makeBook({ title: 'Existing Book', isbn: '978-1-23-456789-0' });
    seedLibrary([existing]);
    render(
      <Wrapper>
        <AdminCatalog />
      </Wrapper>,
    );

    const initialState = JSON.parse(window.localStorage.getItem(LIBRARY_STORAGE_KEY) ?? '{}');
    const initialBookCount = initialState.books?.length ?? 0;
    openAddDialog();
    submitAddBookForm({
      title: 'Duplicate ISBN Book',
      author: 'QA Team',
      isbn: '978-1-23-456789-0',
      inventoryNumber: 'INV-999',
      year: 2021,
    });

    expect(screen.queryByText('Duplicate ISBN Book')).not.toBeInTheDocument();
    const nextState = JSON.parse(window.localStorage.getItem(LIBRARY_STORAGE_KEY) ?? '{}');
    const nextBookCount = nextState.books?.length ?? 0;
    expect(nextBookCount).toBe(initialBookCount);
  });
});

describe('Admin catalog - search across multiple fields', () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedAuthAsAdmin();
    seedLibrary([
      makeBook({
        id: 'alpha',
        title: 'Alpha Book',
        author: 'Alice Writer',
        isbn: '111-1-11-111111-1',
        inventoryNumber: 'INV-ALPHA',
      }),
      makeBook({
        id: 'beta',
        title: 'Beta Stories',
        author: 'Bob Author',
        isbn: '222-2-22-222222-2',
        inventoryNumber: 'INV-BETA',
      }),
      makeBook({
        id: 'gamma',
        title: 'Gamma Notes',
        author: 'Cara Archivist',
        isbn: '333-3-33-333333-3',
        inventoryNumber: 'INV-GAMMA',
      }),
    ]);
  });

  it('finds a book by title', () => {
    render(
      <Wrapper>
        <AdminCatalog />
      </Wrapper>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Gamma' } });

    expect(screen.getByText('Gamma Notes')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Book')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta Stories')).not.toBeInTheDocument();
  });

  it('finds a book by ISBN', () => {
    render(
      <Wrapper>
        <AdminCatalog />
      </Wrapper>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '222-2-22-222222-2' } });

    expect(screen.getByText('Beta Stories')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Book')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma Notes')).not.toBeInTheDocument();
  });

  it('finds a book by inventory number', () => {
    render(
      <Wrapper>
        <AdminCatalog />
      </Wrapper>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'INV-ALPHA' } });

    expect(screen.getByText('Alpha Book')).toBeInTheDocument();
    expect(screen.queryByText('Beta Stories')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma Notes')).not.toBeInTheDocument();
  });
});
