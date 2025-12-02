// --- START OF FILE: topic.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import BackButton from '../../ui/back-button.tsx';

interface TopicViewerProps {
  onGoBack: () => void;
}

const ITEMS_PER_PAGE = 20;
// Giả định tổng số lượng ảnh tối đa để tính toán phân trang (2000 như yêu cầu)
const MAX_TOTAL_ITEMS = 2000; 

// Hàm tạo URL dựa trên index (logic 1-1000 và 1001-2000)
const getTopicImageUrl = (index: number): string => {
  const baseUrl1 = 'https://raw.githubusercontent.com/englishleveling46/Flashcard/main/topic/image/';
  const baseUrl2 = 'https://raw.githubusercontent.com/englishleveling46/Flashcard/main/topic/image2/';

  if (index <= 1000) {
    // Format: 001.webp, 010.webp, 100.webp
    const paddedNumber = index.toString().padStart(3, '0');
    return `${baseUrl1}${paddedNumber}.webp`;
  } else {
    // Format: 1001.webp (Giả định folder image2 không cần padding 0 nếu > 1000)
    return `${baseUrl2}${index}.webp`;
  }
};

// Component hiển thị từng ảnh đơn lẻ
const TopicImageCard = ({ index }: { index: number }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = useMemo(() => getTopicImageUrl(index), [index]);

  if (hasError) return null; // Ẩn hoàn toàn nếu ảnh lỗi

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* 
         - aspect-video (16/9) hoặc aspect-[4/3]: Giữ khung hình cố định để layout không bị nhảy.
         - object-contain: Đảm bảo nhìn thấy toàn bộ nội dung ảnh.
      */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={`Topic ${index}`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
      {/* Đã xóa phần hiển thị text #index ở đây */}
    </div>
  );
};

export default function TopicViewer({ onGoBack }: TopicViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Tính toán tổng số trang
  const totalPages = Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE);

  // Scroll lên đầu khi chuyển trang
  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentPage]);

  // Tạo danh sách ID cho trang hiện tại
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    // Tạo mảng [start, start+1, ..., start+19]
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white shadow-sm z-10 px-4 py-3 border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={onGoBack} />
            <h2 className="text-lg font-bold text-gray-800">Vocabulary Topics</h2>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Page <span className="text-orange-600 font-bold">{currentPage}</span> / {totalPages}
          </div>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <div id="topic-scroll-container" className="flex-grow overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* 
            GRID CONFIGURATION:
            - grid-cols-1: Mobile (Hiển thị 1 ảnh full chiều ngang)
            - sm:grid-cols-2: Tablet nhỏ (2 cột)
            - md:grid-cols-3: Tablet lớn (3 cột)
            - lg:grid-cols-4: Desktop (4 cột)
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentItems.map((itemIndex) => (
              <TopicImageCard key={itemIndex} index={itemIndex} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center items-center gap-4 pb-8 flex-wrap">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300 hover:border-orange-300 shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            {/* Page Jump Input */}
            <div className="flex items-center gap-2">
               <span className="text-gray-500 text-sm hidden sm:inline">Go to:</span>
               <select 
                 value={currentPage} 
                 onChange={(e) => setCurrentPage(Number(e.target.value))}
                 className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 outline-none"
               >
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                   <option key={pageNum} value={pageNum}>Page {pageNum}</option>
                 ))}
               </select>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300 hover:border-orange-300 shadow-sm'
              }`}
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
