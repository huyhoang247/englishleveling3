import React, { useState, useEffect } from 'react';
import { Book } from './books-data';
import { Vocabulary } from './game';

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
  const [readingProgress, setReadingProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoadingVocab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Đang tải nội dung sách</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Không tìm thấy nội dung</h3>
            <p className="text-gray-500 dark:text-gray-400">Vui lòng chọn một cuốn sách để bắt đầu đọc.</p>
          </div>
        </div>
      </div>
    );
  }

  const contentLines = currentBook.content.trim().split(/\n+/);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Reading Progress Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Book Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {currentBook.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {currentBook.author || 'Tác giả không xác định'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                {Math.round(readingProgress)}% hoàn thành
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-8 sm:p-12">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {contentLines.map((line, index) => {
                if (line.trim() === '') {
                  return <div key={`blank-${index}`} className="h-6"></div>;
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
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 ease-out"></span>
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Nhấn để xem nghĩa
                        </span>
                      </span>
                    );
                  }
                  return <span key={`${index}-${partIndex}`}>{part}</span>;
                }).filter(Boolean);

                // Enhanced title detection
                const isLikelyChapterTitle = index === 0 && line.length < 60 && !line.includes('.') && !line.includes('Chapter') && !line.includes('Prologue');
                const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index < 5 && index > 0) || 
                  ((line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70);

                if (isLikelyChapterTitle) {
                  return (
                    <div key={`line-${index}`} className="text-center mb-12">
                      <div className="inline-block">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                          {renderableParts}
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                      </div>
                    </div>
                  );
                }

                if (isLikelySectionTitle) {
                  return (
                    <div key={`line-${index}`} className="mt-16 mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></span>
                        {renderableParts}
                      </h2>
                    </div>
                  );
                }

                return (
                  <p key={`line-${index}`} className="text-lg leading-loose text-gray-700 dark:text-gray-300 mb-6 text-justify hyphens-auto">
                    {renderableParts}
                  </p>
                );
              })}
            </article>
          </div>
        </div>

        {/* Reading completion celebration */}
        {readingProgress >= 95 && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-2xl shadow-lg">
              <div className="text-white space-y-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold">Chúc mừng!</h3>
                <p className="text-sm opacity-90">Bạn đã hoàn thành việc đọc cuốn sách này</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing for audio player */}
      <div className="h-32"></div>
    </div>
  );
};

export default BookContentDisplay;
