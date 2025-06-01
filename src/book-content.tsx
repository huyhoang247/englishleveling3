import React from 'react';
import { Book } from './books-data.ts'; // Import Book interface
import { Vocabulary } from './game.tsx'; // Import Vocabulary interface từ game.tsx (hoặc định nghĩa lại ở đây nếu muốn độc lập hoàn toàn)

// Props interface cho BookContentDisplay
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
  if (isLoadingVocab) {
    return <div className="text-center p-10 text-gray-500 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
  }
  if (!currentBook) {
    return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;
  }

  const contentLines = currentBook.content.trim().split(/\n+/);

  return (
    <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4 pb-24"> {/* Thêm padding-bottom cho không gian của audio player */}
      {contentLines.map((line, index) => {
        if (line.trim() === '') return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
        const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);
        const renderableParts = parts.map((part, partIndex) => {
          if (!part) return null;
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart);
          if (isVocabWord) {
            return (
              <span
                key={`${index}-${partIndex}`}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 decoration-1 decoration-blue-500/70 dark:decoration-blue-400/70 cursor-pointer transition-all duration-150 ease-in-out hover:text-blue-700 dark:hover:text-blue-300"
                onClick={() => handleWordClick(part)}
                role="button" tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(part); }}
              >
                {part}
              </span>
            );
          }
          return <span key={`${index}-${partIndex}`}>{part}</span>;
        }).filter(Boolean);

        const isLikelyChapterTitle = index === 0 && line.length < 60 && !line.includes('.') && !line.includes('Chapter') && !line.includes('Prologue');
        const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index < 5 && index > 0) || ((line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70);

        if (isLikelyChapterTitle) return <h2 key={`line-${index}`} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-6 text-center">{renderableParts}</h2>;
        if (isLikelySectionTitle) return <h3 key={`line-${index}`} className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{renderableParts}</h3>;
        return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">{renderableParts}</p>;
      })}
    </div>
  );
};

export default BookContentDisplay;
