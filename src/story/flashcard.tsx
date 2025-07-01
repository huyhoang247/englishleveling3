import React, { useState, useEffect } from 'react';
import BackButton from '../footer-back.tsx'; // Import the new BackButton component

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

// Define the props for the FlashcardDetailModal component
interface FlashcardDetailModalProps {
  selectedCard: Flashcard | null; // The flashcard data to display
  showVocabDetail: boolean; // State to control modal visibility
  exampleImages: string[]; // Array of example image URLs
  onClose: () => void; // Function to close the modal
  currentVisualStyle: string; // Add currentVisualStyle prop
}

// Animation styles - Clean and minimal
const animations = `
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes modalBackdropIn {
    0% { opacity: 0; }
    100% { opacity: 0.4; }
  }

  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .content-transition {
    animation: slideUp 0.3s ease-out;
  }
`;

const FlashcardDetailModal: React.FC<FlashcardDetailModalProps> = ({
  selectedCard,
  showVocabDetail,
  exampleImages,
  onClose,
  currentVisualStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'example' | 'vocabulary'>('basic');

  useEffect(() => {
    if (showVocabDetail && selectedCard) {
      setActiveTab('basic');
    }
  }, [showVocabDetail, selectedCard]);

  if (!showVocabDetail || !selectedCard) {
    return null;
  }

  const getImageUrlForStyle = (card: Flashcard, style: string): string => {
    const url = (() => {
        switch (style) {
            case 'anime':
                return card.imageUrl.anime || card.imageUrl.default;
            case 'comic':
                return card.imageUrl.comic || card.imageUrl.default;
            case 'realistic':
                return card.imageUrl.realistic || card.imageUrl.default;
            default:
                return card.imageUrl.default;
        }
    })();
    return url;
  };

  const tabs = [
    { key: 'basic' as const, label: 'Ảnh Gốc' },
    { key: 'example' as const, label: 'Ví Dụ' },
    { key: 'vocabulary' as const, label: 'Từ Vựng' },
  ];

  const renderModalContent = () => {
    const exampleIndex = (selectedCard.id - 1) % exampleImages.length;
    const exampleImageUrl = exampleImages[exampleIndex];

    switch (activeTab) {
      case 'basic':
        return (
          <div className="flex justify-center items-start flex-grow px-4 pt-2 pb-4 overflow-hidden content-transition">
            <img
              src={getImageUrlForStyle(selectedCard, currentVisualStyle)}
              alt="Ảnh Gốc"
              className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/1024x1536/E0E0E0/333333?text=Lỗi+Ảnh+Gốc`;
              }}
            />
          </div>
        );
      case 'example':
        return (
          <div className="flex justify-center items-center flex-grow p-4 overflow-hidden content-transition">
            <img
              src={exampleImageUrl}
              alt="Hình Ảnh Ví Dụ"
              className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/1024x1536/E0E0E0/333333?text=Lỗi+Ảnh+Ví+Dụ`;
              }}
            />
          </div>
        );
      case 'vocabulary':
        return (
          // --- NEW CLEAN DESIGN AREA ---
          <div className="flex-grow overflow-y-auto bg-white dark:bg-black p-6 md:p-8 content-transition">
            <div className="max-w-4xl mx-auto">
              {/* Grid for all vocabulary details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Card for Meaning (Full Width) with Styled Word */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl md:col-span-2">
                  <h3 className="inline-block bg-black/50 text-white px-4 py-2 rounded-xl text-sm font-bold mb-4">
                    {selectedCard.vocabulary.word}
                  </h3>
                  <p className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedCard.vocabulary.meaning}
                  </p>
                </div>

                {/* Card for Example (Full Width) */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl md:col-span-2">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Ví dụ</h5>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{selectedCard.vocabulary.example}"
                  </p>
                </div>

                {/* Card for Common Phrases */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Cụm từ phổ biến</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.phrases.map((phrase, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 px-2.5 py-1 rounded-full text-sm font-medium">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card for Popularity */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Mức độ phổ biến</h5>
                  <div className="flex items-center gap-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-bold
                      ${selectedCard.vocabulary.popularity === "Cao" ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200" :
                        selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" :
                        "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200"}
                    `}>
                      {selectedCard.vocabulary.popularity}
                    </span>
                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          selectedCard.vocabulary.popularity === "Cao" ? "bg-green-500 w-4/5" :
                          selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-500 w-1/2" :
                          "bg-red-500 w-1/5"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card for Synonyms */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Từ đồng nghĩa</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.synonyms.map((word, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-1 rounded-full text-sm font-medium">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card for Antonyms */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Từ trái nghĩa</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.antonyms.map((word, index) => (
                      <span key={index} className="bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300 px-2.5 py-1 rounded-full text-sm font-medium">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{animations}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }}
      ></div>

      {/* Fullscreen Modal Content */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-black"
           style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
      >
          {/* High-Contrast "Black" Tab Navigation */}
          <div className="flex justify-center bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex-shrink-0 px-4 py-3">
            <div className="inline-flex bg-gray-900 dark:bg-black rounded-xl p-1 space-x-1 border border-transparent dark:border-gray-800">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className={`
                      px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-white text-gray-900 shadow-sm' // Active in Light Mode
                        : 'text-gray-400 hover:bg-white/10 hover:text-white' // Inactive in Light Mode
                      }
                      dark:focus:outline-none 
                      ${isActive
                        ? 'dark:bg-gray-800 dark:text-gray-100' // Active in Dark Mode
                        : 'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300' // Inactive in Dark Mode
                      }
                    `}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body - Render content based on renderModalContent function */}
          {renderModalContent()}

          {/* Use the new BackButton component */}
          <BackButton onClick={onClose} />
      </div>
    </>
  );
};

export default FlashcardDetailModal;
