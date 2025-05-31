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

  // State for reading mode
  const [readingMode, setReadingMode] = useState(false);

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
      return <div className="text-center p-8 text-gray-500">No book selected.</div>;
    }

    // Split content into paragraphs
    const paragraphs = currentBook.content.split('\n').filter(p => p.trim());

    return (
      <div className={`space-y-6 ${readingMode ? 'reading-mode' : ''}`}>
        {paragraphs.map((paragraph, paragraphIndex) => {
          // Check if it's a title
          const isTitle = paragraph.includes('Chapter') || paragraph.includes('Prologue') ||
                         paragraph.includes('Introduction') || paragraph.match(/^[A-Z][^.!?]*:/) ||
                         paragraph.includes('Story:');

          if (isTitle) {
            return (
              <h3
                key={paragraphIndex}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 border-b-2 border-blue-200 dark:border-blue-800 pb-2"
              >
                {paragraph.trim()}
              </h3>
            );
          }

          // Handle regular paragraphs
          const parts = paragraph.split(/(\b\w+\b|[.,!?;:()'"\s`''""])/g);

          return (
            <p
              key={paragraphIndex}
              className="text-lg leading-loose text-gray-800 dark:text-gray-200 mb-4 text-justify indent-8 first-letter:text-4xl first-letter:font-bold first-letter:text-blue-600 first-letter:mr-1 first-letter:float-left first-letter:leading-none"
            >
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
                      className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-all duration-200 hover:shadow-sm px-1 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 vocab-highlight"
                      onClick={() => handleWordClick(part)}
                    >
                      {part}
                    </span>
                  );
                } else {
                  return <span key={index}>{part}</span>;
                }
              })}
            </p>
          );
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
        <div className="flex items-center space-x-3">
          {selectedBookId && (
            <button
              onClick={handleBackToLibrary}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-2 transition-colors"
            >
              ← Back to Library
            </button>
          )}
          {selectedBookId && ( // Only show reading mode toggle when a book is selected
            <button
              onClick={() => setReadingMode(!readingMode)}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-2 transition-colors"
            >
              {readingMode ? 'Normal Mode' : 'Reading Mode'}
            </button>
          )}
        </div>
      </header>

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-white dark:bg-gray-850"> {/* Slightly different bg for library */}
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow px-6 py-8 overflow-y-auto max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg my-6 w-full border border-gray-200 dark:border-gray-700">
          {currentBook && (
            <div className="mb-8 pb-6 border-b-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800">
              <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-3 leading-tight">
                {currentBook.title}
              </h2>
              {currentBook.author && (
                <p className="text-lg text-center text-gray-600 dark:text-gray-400 italic font-medium">
                  by {currentBook.author}
                </p>
              )}
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
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
      {/* Custom CSS for reading mode and vocab highlight, if not already in global CSS */}
      <style>
        {`
        .reading-mode {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.8;
        }

        .vocab-highlight {
          background: linear-gradient(120deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          background-repeat: no-repeat;
          background-size: 100% 0.2em;
          background-position: 0 88%;
        }
        `}
      </style>
    </div>
  );
};

export default EbookReader;
