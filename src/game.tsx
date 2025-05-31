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
  const [booksData] = useState<Book[]>(sampleBooks); // Renamed from 'books' to avoid conflict
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
    // console.log("Vocab Map initialized with", tempMap.size, "words.");
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

      const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === normalizedWord);

      if (vocabIndex !== -1 && vocabIndex < gameImageUrls.length) {
        cardImageUrl = gameImageUrls[vocabIndex];
        // console.log(`Using image from gameImageUrls for "${foundVocab.word}" at index ${vocabIndex}: ${cardImageUrl}`);
      } else {
        // console.log(`Image for "${foundVocab.word}" (index ${vocabIndex}) not found in gameImageUrls or index out of bounds. Using placeholder.`);
      }

      const tempFlashcard: Flashcard = {
        id: vocabIndex !== -1 ? vocabIndex + 1 : Date.now(), // Use vocabIndex for a more stable ID if found
        imageUrl: {
          default: cardImageUrl,
        },
        isFavorite: false, 
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      // console.log(`Word "${word}" not found in vocabulary list.`);
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
      return <div className="text-center p-8 font-serif">Loading vocabulary...</div>;
    }
    if (!currentBook) {
      return <div className="text-center p-8 font-serif text-gray-500">No book selected.</div>;
    }

    // Helper function to process a segment of text (a line or part of it) for vocabulary words
    // It now returns an array of React nodes, including <br /> for newlines within a block.
    const processTextSegment = (textSegment: string, baseKey: string) => {
      const lines = textSegment.split('\n');
      return lines.map((line, lineIndex) => (
        <React.Fragment key={`${baseKey}-line-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g).map((part, partIndex) => {
            if (part === undefined || part === null || part === '') return null; // Skip empty parts from split

            const isWord = /^\w+$/.test(part);
            if (isWord) {
              const normalizedPart = part.toLowerCase();
              if (vocabMap.has(normalizedPart)) {
                return (
                  <span
                    key={`${baseKey}-l${lineIndex}-v-${partIndex}`}
                    className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => handleWordClick(part)}
                  >
                    {part}
                  </span>
                );
              }
            }
            // If not a vocab word, or if it's punctuation/whitespace, render as is
            return <span key={`${baseKey}-l${lineIndex}-t-${partIndex}`}>{part}</span>;
          })}
        </React.Fragment>
      ));
    };

    // Split content by one or more blank lines to get "blocks" (paragraphs, headings, list groups)
    const contentBlocks = currentBook.content.trim().split(/\n\s*\n+/g);

    // Known heading phrases and patterns for more robust detection
    const knownHeadings = [
      "Social Health: A Key to Well-being", "Maya's Story: A Missing Piece",
      "The Overlooked Aspect of Health", "The Impact of Disconnection",
      "What Does Social Health Look Like?", "The 5-3-1 Guideline for Social Health",
      "My Own Journey and The Vision for the Future",
    ];
    const headingPatterns = [
      /^Chapter \d+[:\.]?\s?.*/i, /^Prologue[:\.]?\s?.*/i,
      /^Introduction[:\.]?\s?.*/i, /^Epilogue[:\.]?\s?.*/i,
    ];

    return (
      // Apply base text styling here. `font-serif` for readability.
      // `space-y-5` adds margin between direct children (h2, p, ol, ul, div for lists).
      <div className="font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200 space-y-5">
        {contentBlocks.map((block, index) => {
          const trimmedBlock = block.trim();
          if (!trimmedBlock) return null; // Skip empty blocks
          
          const blockKey = `block-${index}`; // Unique key for the block

          // Handle specific known non-content lines like (Applause)
          if (trimmedBlock === "(Applause)") {
            return (
                <p key={blockKey} className="italic text-center text-gray-600 dark:text-gray-400 !mt-6">
                    {processTextSegment(trimmedBlock, blockKey)}
                </p>
            );
          }

          // Heading detection
          let isHeading = knownHeadings.some(h => trimmedBlock.startsWith(h) && trimmedBlock.length < h.length + 15); // Check it's not a long paragraph starting with a known phrase
          if (!isHeading) {
              isHeading = headingPatterns.some(pattern => pattern.test(trimmedBlock) && !trimmedBlock.includes('\n') && trimmedBlock.length < 100); // Pattern match, single line, not too long
          }
          
          if (isHeading) {
            return (
              <h2 key={blockKey} className="text-2xl font-bold !mt-8 !mb-3 text-gray-900 dark:text-white">
                {processTextSegment(trimmedBlock, blockKey)}
              </h2>
            );
          }

          // Handle "Well, it’s about:" list structure
          if (trimmedBlock.startsWith("Well, it’s about:")) {
              const lines = trimmedBlock.split('\n');
              const introLine = lines[0];
              const listItems = lines.slice(1).filter(li => li.trim() !== "");
              return (
                  <div key={blockKey}> {/* Wrapper div for proper spacing by parent's space-y */}
                      <p className="italic mb-1">{processTextSegment(introLine, `${blockKey}-intro`)}</p>
                      <ul className="list-disc list-outside pl-8 mt-1 space-y-1">
                          {listItems.map((item, itemIdx) => (
                              <li key={`${blockKey}-li-${itemIdx}`} className="pl-1">
                                  {processTextSegment(item.trim(), `${blockKey}-li-${itemIdx}-text`)}
                              </li>
                          ))}
                      </ul>
                  </div>
              );
          }
          
          // Handle "5-3-1 guideline from my book. It goes like this:" list structure
          if (trimmedBlock.startsWith("So if you're not sure where to start, try the 5-3-1 guideline from my book. It goes like this:")) {
               const lines = trimmedBlock.split('\n');
               const introLine = lines[0];
               const listItems = lines.slice(1).filter(li => li.trim() !== "");
               return (
                  <div key={blockKey}> {/* Wrapper div */}
                      <p className="mb-1">{processTextSegment(introLine, `${blockKey}-intro`)}</p>
                      <ul className="list-disc list-outside pl-8 mt-1 space-y-1">
                          {listItems.map((item, itemIdx) => (
                              <li key={`${blockKey}-li-${itemIdx}`} className="pl-1">
                                  {processTextSegment(item.trim(), `${blockKey}-li-${itemIdx}-text`)}
                              </li>
                          ))}
                      </ul>
                  </div>
               );
          }

          // Handle blocks that are entirely numbered lists (e.g., "1. Item one \n 2. Item two")
          const linesOfBlock = trimmedBlock.split('\n').filter(l => l.trim() !== "");
          const isEntireBlockNumberedList = linesOfBlock.length > 0 && linesOfBlock.every(line => /^\d+\.\s/.test(line.trim()));

          if (isEntireBlockNumberedList) {
              return (
                  <ol key={blockKey} className="list-decimal list-outside pl-8 space-y-2">
                      {linesOfBlock.map((line, lineIdx) => {
                          // Extract text after "N. "
                          const itemText = line.trim().substring(line.trim().search(/\s/) + 1);
                          return (
                              <li key={`${blockKey}-oli-${lineIdx}`} className="pl-1"> {/* pl-1 for alignment with list-outside */}
                                  {processTextSegment(itemText, `${blockKey}-oli-${lineIdx}-text`)}
                              </li>
                          );
                      })}
                  </ol>
              );
          }

          // Default: render as a paragraph
          return (
            <p key={blockKey} className="text-left"> {/* text-left is often better for readability on screens than text-justify */}
              {processTextSegment(trimmedBlock, blockKey)}
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
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
        {selectedBookId && (
          <button
            onClick={handleBackToLibrary}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            ← Back to Library
          </button>
        )}
      </header>

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-white dark:bg-gray-850 font-sans"> {/* Library specific: font-sans */}
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl my-4 w-full"> {/* Book view main area styling */}
          {currentBook && (
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 font-serif"> {/* Book title/author also serif */}
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {currentBook.title}
              </h1>
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
          exampleImages={[]} 
          onClose={closeVocabDetail}
          currentVisualStyle="default"
        />
      )}
    </div>
  );
};

export default EbookReader;
