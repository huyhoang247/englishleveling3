// --- START OF FILE: src/PhraseDetailModal.tsx ---

import React from 'react';

// Định nghĩa cấu trúc dữ liệu cho một phần của cụm từ
interface PhrasePart {
  english: string;
  vietnamese: string;
}

// Định nghĩa cấu trúc dữ liệu cho một câu cụm từ hoàn chỉnh
interface PhraseSentence {
  parts: PhrasePart[];
  fullEnglish: string;
  fullVietnamese: string;
}

// Props cho component
interface PhraseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrase: PhraseSentence | null;
}

const PhraseDetailModal: React.FC<PhraseDetailModalProps> = ({ isOpen, onClose, phrase }) => {
  if (!isOpen || !phrase) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Chi tiết cụm từ
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Câu đầy đủ */}
          <div className="bg-blue-50 dark:bg-gray-900/50 p-5 rounded-xl border border-blue-100 dark:border-gray-700">
            <p className="text-xl font-semibold text-blue-800 dark:text-blue-300 leading-relaxed">
              {phrase.fullEnglish}
            </p>
            <p className="mt-2 text-md italic text-blue-600 dark:text-gray-400">
              {phrase.fullVietnamese}
            </p>
          </div>

          {/* Phân tích cụm từ */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Phân tích</h3>
            <div className="space-y-2">
              {phrase.parts.map((part, index) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-semibold text-gray-800 dark:text-gray-100 flex-1">{part.english}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-right flex-1">{part.vietnamese}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhraseDetailModal;
// --- END OF FILE: src/PhraseDetailModal.tsx ---
