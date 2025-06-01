import React from 'react';
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
  if (isLoadingVocab) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <p className="mt-6 text-gray-500 dark:text-gray-400 text-center max-w-md">
          Đang tải nội dung sách, vui lòng đợi trong giây lát...
        </p>
      </div>
    );
  }
  
  if (!currentBook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Không tìm thấy nội dung sách</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Vui lòng chọn một cuốn sách khác hoặc thử lại sau.
        </p>
      </div>
    );
  }

  const contentLines = currentBook.content.trim().split(/\n+/);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 font-serif">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 mt-4 transition-all duration-300">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">{currentBook.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">Tác giả: {currentBook.author}</p>
        </div>
        
        <div className="p-6 sm:p-8">
          {contentLines.map((line, index) => {
            if (line.trim() === '') return <div key={`blank-${index}`} className="h-4 sm:h-5"></div>;
            
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
                    className="relative font-medium text-blue-600 dark:text-blue-400 cursor-pointer transition-all duration-200 group"
                    onClick={() => handleWordClick(part)}
                    role="button" tabIndex={0}
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') handleWordClick(part); 
                    }}
                  >
                    <span className="relative z-10">{part}</span>
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-100 dark:bg-blue-900/50 group-hover:h-full transition-all duration-300 ease-out z-0 opacity-30 group-hover:opacity-100"></span>
                  </span>
                );
              }
              return <span key={`${index}-${partIndex}`}>{part}</span>;
            }).filter(Boolean);

            const isLikelyChapterTitle = index === 0 && line.length < 60 && !line.includes('.') && !line.includes('Chapter') && !line.includes('Prologue');
            const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index < 5 && index > 0) || ((line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70);

            if (isLikelyChapterTitle) 
              return (
                <h2 
                  key={`line-${index}`} 
                  className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 text-center relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-blue-400 after:to-transparent dark:after:via-blue-500"
                >
                  {renderableParts}
                </h2>
              );
            
            if (isLikelySectionTitle) 
              return (
                <h3 
                  key={`line-${index}`} 
                  className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-10 mb-6 pl-4 border-l-4 border-blue-400 dark:border-blue-500"
                >
                  {renderableParts}
                </h3>
              );
            
            return (
              <p 
                key={`line-${index}`} 
                className="text-lg sm:text-xl leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-6 text-justify"
              >
                {renderableParts}
              </p>
            );
          })}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 italic">
            Cuốn sách được cung cấp bởi thư viện của chúng tôi
          </p>
          <div className="mt-3 flex justify-center space-x-3">
            <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Độ dài: {contentLines.length} trang
            </span>
            <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Từ vựng: {vocabMap.size} từ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookContentDisplay;
