import React from 'react';
import { Book } from '../books-data.ts'; // Đảm bảo đường dẫn đúng

interface BookLibraryProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
}

const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const category = book.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};

const BookLibrary: React.FC<BookLibraryProps> = ({ books, onSelectBook }) => {
  const groupedBooks = groupBooksByCategory(books);

  return (
    <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850">
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
          <section key={category}>
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">Xem tất cả →</button>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
              {booksInCategory.map(book => (
                <div
                  key={book.id}
                  className="flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer group transform hover:-translate-y-1.5 transition-transform duration-200"
                  onClick={() => onSelectBook(book.id)}
                  role="button" tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && onSelectBook(book.id)}
                >
                  <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-2 transition-shadow group-hover:shadow-xl">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-2 text-center">{book.title}</div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{book.title}</h3>
                  {book.author && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default BookLibrary;
