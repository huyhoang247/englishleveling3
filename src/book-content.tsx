import React from 'react';
import { Book } from './books-data'; // Import Book interface
import { Vocabulary } from './game'; // Import Vocabulary interface từ game.tsx

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải nội dung sách...</p>
        <div className="mt-3 flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Không tìm thấy nội dung sách</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Vui lòng chọn một cuốn sách khác</p>
      </div>
    );
  }

  const contentLines = currentBook.content.trim().split(/\n+/);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Book header với gradient background */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent mb-2">
          {currentBook.title}
        </h1>
        {currentBook.author && (
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            bởi <span className="text-gray-800 dark:text-gray-300">{currentBook.author}</span>
          </p>
        )}
      </div>

      {/* Main content với typography được cải thiện */}
      <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-8 prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-6 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-gray-700 dark:prose-p:text-gray-300">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20 p-6 sm:p-8 lg:p-10">
          {contentLines.map((line, index) => {
            if (line.trim() === '') {
              return <div key={`blank-${index}`} className="h-4 sm:h-6"></div>;
            }

            const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`''""])/g);
            const renderableParts = parts.map((part, partIndex) => {
              if (!part) return null;
              
              const isWord = /^\w+$/.test(part);
              const normalizedPart = part.toLowerCase();
              const isVocabWord = isWord && vocabMap.has(normalizedPart);
              
              if (isVocabWord) {
                return (
                  <span
                    key={`${index}-${partIndex}`}
                    className="relative inline-block font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-all duration-200 ease-out group"
                    onClick={() => handleWordClick(part)}
                    role="button" 
                    tabIndex={0}
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') handleWordClick(part); 
                    }}
                  >
                    {part}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-200 group-hover:w-full"></span>
                    <span className="absolute -top-1 -left-1 w-0 h-0 bg-blue-100/80 dark:bg-blue-900/80 rounded transition-all duration-200 group-hover:w-[calc(100%+8px)] group-hover:h-[calc(100%+8px)] -z-10"></span>
                  </span>
                );
              }
              
              return <span key={`${index}-${partIndex}`}>{part}</span>;
            }).filter(Boolean);

            // Improved title detection logic
            const isLikelyChapterTitle = index === 0 && line.length < 60 && !line.includes('.') && !line.includes('Chapter') && !line.includes('Prologue');
            const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index < 5 && index > 0) || ((line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70);

            if (isLikelyChapterTitle) {
              return (
                <div key={`line-${index}`} className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent leading-tight">
                    {renderableParts}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
                </div>
              );
            }
            
            if (isLikelySectionTitle) {
              return (
                <h3 key={`line-${index}`} className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-10 mb-6 border-l-4 border-gradient-to-b from-blue-500 to-purple-500 pl-4 border-blue-500">
                  {renderableParts}
                </h3>
              );
            }
            
            return (
              <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-6 text-justify indent-4 first-letter:text-2xl first-letter:font-bold first-letter:text-gray-800 dark:first-letter:text-gray-200 first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                {renderableParts}
              </p>
            );
          })}
        </div>
      </article>

      {/* Bottom spacing for audio player */}
      <div className="h-24"></div>
    </div>
  );
};

export default BookContentDisplay;
