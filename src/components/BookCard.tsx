import { Book } from '@/lib/types';
import { getStatusLabel, getStatusColor } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function BookCard({ book }: { book: Book }) {
  return (
    <Link to={`/book/${book.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
        {/* Cover */}
        <div className="relative h-48 overflow-hidden">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className={`${book.coverColor} h-full flex items-center justify-center p-4`}>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-primary-foreground leading-tight">{book.title}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">{book.author}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-sm font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{book.author}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{book.genre}</span>
            <Badge className={`${getStatusColor(book.status)} text-xs`}>
              {getStatusLabel(book.status)}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
