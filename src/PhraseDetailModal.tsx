// --- START OF FILE: PhraseDetailModal.tsx ---

import React, { useEffect } from 'react';
import { PhraseSentence } from './phrase-data.ts'; // Import a interface que definimos

interface PhraseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrase: PhraseSentence;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PhraseDetailModal: React.FC<PhraseDetailModalProps> = ({ isOpen, onClose, phrase }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chi tiết Cụm từ</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Đóng"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Câu đầy đủ */}
          <div className="bg-blue-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-1">{phrase.fullEnglish}</p>
            <p className="text-md text-gray-700 dark:text-gray-300">{phrase.fullVietnamese}</p>
          </div>

          {/* Chi tiết từng phần */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Tách cụm từ</h3>
            <div className="space-y-2">
              {phrase.parts.map((part, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{part.english}</span>
                  <span className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-0">{part.vietnamese}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhraseDetailModal;
// --- END OF FILE: PhraseDetailModal.tsx ---
