import React, { useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import vocabulary list
// Import defaultImageUrls from image-url.ts, similar to VerticalFlashcardGallery
import { defaultImageUrls as gameImageUrls } from './image-url.ts'; // Adjust path if necessary
import { Book, sampleBooks } from './books-data.ts'; // Import Book interface and sampleBooks from the new file

// Define the structure for a flashcard and its vocabulary
interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

interface Flashcard {
  id: number;
  imageUrl: {
    default: string;
    anime?: string;
    comic?: string;
    realistic?: string;
  };
  isFavorite: boolean;
  vocabulary: Vocabulary;
}

// Props interface for EbookReader to accept hideNavBar and showNavBar
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
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

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => { // Destructure props
  const [booksData, setBooksData] = useState<Book[]>(sampleBooks); // Renamed from 'books' to avoid conflict
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null); // Start with no book selected

  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);

  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Meaning of "${word}" (example).`,
        example: `This is an example sentence using "${word}".`,
        phrases: [`Phrase with ${word} A`, `Phrase with ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Synonym for ${word} 1`, `Synonym for ${word} 2`],
        antonyms: [`Antonym for ${word} 1`, `Antonym for ${word} 2`],
      });
    });
    setVocabMap(tempMap);
    setIsLoadingVocab(false);
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []);

  // Effect to hide/show nav bar based on selectedBookId
  useEffect(() => {
    if (selectedBookId) {
      hideNavBar(); // Hide nav bar when a book is selected
    } else {
      showNavBar(); // Show nav bar when back to library
    }
  }, [selectedBookId, hideNavBar, showNavBar]);

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord);

    if (foundVocab) {
      let cardImageUrl = `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`; // Default placeholder

      // Find the index of the word in the original defaultVocabulary array
      // This index will be used to pick an image from gameImageUrls
      const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === normalizedWord);

      if (vocabIndex !== -1 && vocabIndex < gameImageUrls.length) {
        cardImageUrl = gameImageUrls[vocabIndex];
        console.log(`Using image from gameImageUrls for "${foundVocab.word}" at index ${vocabIndex}: ${cardImageUrl}`);
      } else {
        console.log(`Image for "${foundVocab.word}" (index ${vocabIndex}) not found in gameImageUrls or index out of bounds. Using placeholder.`);
      }

      const tempFlashcard: Flashcard = {
        id: vocabIndex !== -1 ? vocabIndex + 1 : Date.now(), // Use vocabIndex for a more stable ID if found
        imageUrl: {
          default: cardImageUrl,
          // anime, comic, realistic can be left undefined or also sourced if you have corresponding styled image arrays
        },
        isFavorite: false, // Or fetch from a persistent store if favorites are managed for these words
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      console.log(`Word "${word}" not found in vocabulary list.`);
    }
  };

  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleBackToLibrary = () => {
    setSelectedBookId(null);
  };

  const currentBook = booksData.find(book => book.id === selectedBookId);
  const groupedBooks = groupBooksByCategory(booksData);

  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-8">Loading vocabulary...</div>;
    }
    if (!currentBook) {
      // This case should ideally not be reached if renderBookContent is only called when a book is selected
      return <div className="text-center p-8 text-gray-500">No book selected.</div>;
    }

    const parts = currentBook.content.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          if (!part || part.trim() === '') {
            return <span key={index}>{part}</span>;
          }
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart);

          if (isVocabWord) {
            return (
              <span
                key={index}
                className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                onClick={() => handleWordClick(part)}
              >
                {part}
              </span>
            );
          } else {
            return <span key={index}>{part}</span>;
          }
        })}
      </div>
    );
  };

  const renderLibrary = () => (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <section key={category}>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">
              See all →
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
            {/* The negative margins and padding are to allow box shadows on cards to not be clipped by overflow hidden on parent if it existed, and to extend scroll area to edge */}
            {booksInCategory.map(book => (
              <div
                key={book.id}
                className="flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200"
                onClick={() => handleSelectBook(book.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSelectBook(book.id)}
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-2 transition-shadow group-hover:shadow-xl">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-2 text-center">
                      {book.title}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {book.title}
                </h3>
                {book.author && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
        {selectedBookId && (
          <button
            onClick={handleBackToLibrary}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-2 transition-colors"
          >
            ← Back to Library
          </button>
        )}
      </header>

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-white dark:bg-gray-850"> {/* Slightly different bg for library */}
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md my-4 w-full">
          {currentBook && (
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {currentBook.title}
              </h2>
              {currentBook.author && (
                <p className="text-md text-center text-gray-600 dark:text-gray-400">
                  by {currentBook.author}
                </p>
              )}
            </div>
          )}
          {renderBookContent()}
        </main>
      )}

      {selectedVocabCard && showVocabDetail && (
        <FlashcardDetailModal
          selectedCard={selectedVocabCard}
          showVocabDetail={showVocabDetail}
          exampleImages={[]} // exampleImages are not relevant for this specific vocabulary detail view from the ebook
          onClose={closeVocabDetail}
          currentVisualStyle="default" // Ensure 'default' style is used to pick up selectedVocabCard.imageUrl.default
        />
      )}
    </div>
  );
};

export default EbookReader;
