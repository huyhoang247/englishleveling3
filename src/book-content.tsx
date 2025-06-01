import React from 'react';
import { Book } from './books-data'; // Import Book interface
import { Vocabulary } from './game'; // Import Vocabulary interface from game.tsx

// Props interface for BookContentDisplay
interface BookContentDisplayProps {
  currentBook: Book | null;
  vocabMap: Map<string, Vocabulary>;
  isLoadingVocab: boolean;
  handleWordClick: (word: string) => void;
}

const BookContentDisplay: React.FC<BookContentDisplayProps> = ({
  currentBook,
  vocabMap,
  isLoadingVocab,
  handleWordClick,
}) => {
  // Loading state
  if (isLoadingVocab) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 sm:p-10 text-gray-600 dark:text-gray-400">
        <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-medium">Đang tải nội dung sách...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Vui lòng đợi trong giây lát.</p>
      </div>
    );
  }

  // Book not found state
  if (!currentBook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 sm:p-10 text-gray-500 dark:text-gray-400">
        {/* Simple book icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-400 dark:text-gray-600">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        <p className="text-xl font-semibold mb-1">Không tìm thấy nội dung sách</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Vui lòng thử chọn một cuốn sách khác.</p>
      </div>
    );
  }

  // Split content into lines
  const contentLines = currentBook.content.trim().split(/\n+/);

  return (
    // Main container with improved padding and font
    <div className="font-serif bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 px-4 sm:px-6 md:px-8 lg:px-12 py-8 pb-28 max-w-4xl mx-auto">
      {contentLines.map((line, index) => {
        // Handle blank lines
        if (line.trim() === '') return <div key={`blank-${index}`} className="h-4 sm:h-5"></div>;

        // Split line into words and punctuation
        const parts = line.split(/(\b\w+[\u00C0-\u017F\u1E00-\u1EFF]*\b|[.,!?;:()'"\s`‘’“”])/gu); // Added Unicode character ranges for Vietnamese
        const renderableParts = parts.map((part, partIndex) => {
          if (!part || part.trim() === '') return null; // Skip empty or whitespace-only parts

          const isWord = /^\w+[\u00C0-\u017F\u1E00-\u1EFF]*$/u.test(part); // Added Unicode character ranges
          const normalizedPartForMap = part.toLowerCase(); // Normalize for map lookup
          const isVocabWord = isWord && vocabMap.has(normalizedPartForMap);

          if (isVocabWord) {
            return (
              <span
                key={`${index}-${partIndex}-${part}`} // More unique key
                className="font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-800/50 px-0.5 py-0.5 rounded-md cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
                onClick={() => handleWordClick(part)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(part); }}
                aria-label={`Từ vựng: ${part}`} // Accessibility improvement
              >
                {part}
              </span>
            );
          }
          // Preserve original casing for display
          return <span key={`${index}-${partIndex}-${part}`}>{part}</span>;
        }).filter(Boolean);

        // Heuristics for identifying chapter and section titles
        // These can be refined based on the actual book content structure
        const isLikelyChapterTitle = (
            (index === 0 && line.length < 80 && !line.includes('.')) ||
            (line.toLowerCase().startsWith('chapter') && line.length < 80) ||
            (line.toLowerCase().startsWith('chương') && line.length < 80) ||
            (line.toLowerCase().startsWith('prologue') && line.length < 80)
        ) && line.split(' ').length < 10;


        const isLikelySectionTitle = (
            (line.length < 90 && (line.endsWith(':') || line.split(' ').length < 10) && !line.includes('.') && index > 0 && index < 10)
        ) && !isLikelyChapterTitle;


        // Render chapter titles
        if (isLikelyChapterTitle) {
          return (
            <h2
              key={`line-${index}`}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-8 mb-8 sm:mt-10 sm:mb-10 text-center tracking-tight leading-tight"
            >
              {renderableParts}
            </h2>
          );
        }

        // Render section titles
        if (isLikelySectionTitle) {
          return (
            <h3
              key={`line-${index}`}
              className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mt-10 mb-5 sm:mt-12 sm:mb-6 tracking-normal"
            >
              {renderableParts}
            </h3>
          );
        }

        // Render paragraph text
        return (
          <p
            key={`line-${index}`}
            className="text-lg sm:text-xl leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-5 text-justify hyphens-auto"
            style={{fontFamily: "'Georgia', 'Times New Roman', Times, serif"}} // Classic serif for readability
          >
            {renderableParts}
          </p>
        );
      })}
    </div>
  );
};

export default BookContentDisplay;
