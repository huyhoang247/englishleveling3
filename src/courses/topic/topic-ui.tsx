// --- START OF FILE: topic.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import BackButton from '../../ui/back-button.tsx';

interface TopicViewerProps {
  onGoBack: () => void;
}

const ITEMS_PER_PAGE = 20;
const MAX_TOTAL_ITEMS = 2000; 

// Hàm tạo URL
const getTopicImageUrl = (index: number): string => {
  const baseUrl1 = 'https://raw.githubusercontent.com/englishleveling46/Flashcard/main/topic/image/';
  const baseUrl2 = 'https://raw.githubusercontent.com/englishleveling46/Flashcard/main/topic/image2/';

  if (index <= 1000) {
    const paddedNumber = index.toString().padStart(3, '0');
    return `${baseUrl1}${paddedNumber}.webp`;
  } else {
    return `${baseUrl2}${index}.webp`;
  }
};

// Component hiển thị từng ảnh (Style giống Vertical Flashcard)
const TopicImageCard = ({ index }: { index: number }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = useMemo(() => getTopicImageUrl(index), [index]);

  if (hasError) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative group">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 h-64">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Image Full Width */}
      <img
        src={imageUrl}
        alt={`Topic ${index}`}
        className={`w-full h-auto block transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
      
      {/* Optional: Overlay effect on hover (Giống style flashcard) */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
};

export default function TopicViewer({ onGoBack }: TopicViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE);

  // Scroll lên đầu khi chuyển trang
  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentPage]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="flex-none bg-white shadow-sm z-20 px-4 py-3 border-b border-gray-200 sticky top-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={onGoBack} />
            <h2 className="text-lg font-bold text-gray-800">Vocabulary Topics</h2>
          </div>
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Page <span className="text-orange-600 font-bold">{currentPage}</span> / {totalPages}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="topic-scroll-container" className="flex-grow overflow-y-auto p-4">
        {/* Container giới hạn max-w-2xl để giống New Feed/Vertical Gallery */}
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Grid 1 Cột duy nhất */}
          <div className="grid grid-cols-1 gap-6">
            {currentItems.map((itemIndex) => (
              <TopicImageCard key={itemIndex} index={itemIndex} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 py-8 bg-transparent">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:shadow-md'
              }`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            {/* Quick Page Jump */}
            <div className="relative">
               <select 
                 value={currentPage} 
                 onChange={(e) => setCurrentPage(Number(e.target.value))}
                 className="appearance-none bg-white border border-gray-300 text-gray-700 font-bold py-2.5 pl-4 pr-8 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hover:border-orange-400"
               >
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                   <option key={pageNum} value={pageNum}>{pageNum}</option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:shadow-md'
              }`}
            >
              Next
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
