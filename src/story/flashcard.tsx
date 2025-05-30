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
    animation: slideUp 0.2s ease-out;
  }
`;

const FlashcardDetailModal: React.FC<FlashcardDetailModalProps> = ({
  selectedCard,
  showVocabDetail,
  exampleImages,
  onClose,
  currentVisualStyle,
}) => {
  // State to manage the active tab within the modal
  const [activeTab, setActiveTab] = useState<'basic' | 'example' | 'vocabulary'>('basic');

  // Reset activeTab to 'basic' whenever a new card is selected or modal opens
  useEffect(() => {
    if (showVocabDetail && selectedCard) {
      setActiveTab('basic');
    }
  }, [showVocabDetail, selectedCard]);

  // If modal is not visible or no card is selected, return null
  if (!showVocabDetail || !selectedCard) {
    return null;
  }

  // Function to get the correct image URL based on visual style
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

  // Clean tab configuration
  const tabs = [
    { key: 'basic' as const, label: 'Ảnh Gốc' },
    { key: 'example' as const, label: 'Ví Dụ' },
    { key: 'vocabulary' as const, label: 'Từ Vựng' },
  ];

  // Function to render modal content based on activeTab
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
          <div className="p-5 overflow-y-auto flex-grow content-transition">{/* Rest of vocabulary content remains the same */}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{selectedCard.vocabulary.word}</h3>
            
            {/* Nghĩa */}
            <div className="mb-5">
              <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs font-semibold text-blue-600 mb-2">
                Nghĩa
              </div>
              <p className="text-gray-800 dark:text-gray-200">{selectedCard.vocabulary.meaning}</p>
            </div>

            {/* Ví dụ */}
            <div className="mb-5">
              <div className="inline-block bg-green-50 rounded-full px-3 py-1 text-xs font-semibold text-green-600 mb-2">
                Ví dụ
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic bg-green-50 dark:bg-green-900 p-3 rounded-lg border-l-4 border-green-300 dark:border-green-700">
                "{selectedCard.vocabulary.example}"
              </p>
            </div>

            {/* Cụm từ */}
            <div className="mb-5">
              <div className="inline-block bg-purple-50 rounded-full px-3 py-1 text-xs font-semibold text-purple-600 mb-2">
                Cụm từ phổ biến
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCard.vocabulary.phrases.map((phrase, index) => (
                  <span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>

            {/* Phổ biến */}
            <div className="mb-5">
              <div className="inline-block bg-amber-50 rounded-full px-3 py-1 text-xs font-semibold text-amber-600 mb-2">
                Mức độ phổ biến
              </div>
              <div className="flex items-center">
                <span className={`
                  px-2 py-1 rounded-lg text-sm font-medium
                  ${selectedCard.vocabulary.popularity === "Cao" ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200" :
                    selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200" :
                    "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"}
                `}>
                  {selectedCard.vocabulary.popularity}
                </span>

                <div className="ml-3 flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedCard.vocabulary.popularity === "Cao" ? "bg-green-500 w-4/5" :
                      selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-500 w-1/2" :
                      selectedCard.vocabulary.popularity === "Thấp" ? "bg-red-500 w-1/5" : ""
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="inline-block bg-indigo-50 rounded-full px-3 py-1 text-xs font-semibold text-indigo-600 mb-2">
                  Từ đồng nghĩa
                </div>
                <div className="flex flex-col gap-1">
                  {selectedCard.vocabulary.synonyms.map((word, index) => (
                    <span key={index} className="text-gray-700 dark:text-gray-300 text-sm bg-indigo-50 dark:bg-indigo-900 px-2 py-1 rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block bg-pink-50 rounded-full px-3 py-1 text-xs font-semibold text-pink-600 mb-2">
                  Từ trái nghĩa
                </div>
                <div className="flex flex-col gap-1">
                  {selectedCard.vocabulary.antonyms.map((word, index) => (
                    <span key={index} className="text-gray-700 dark:text-gray-300 text-sm bg-pink-50 dark:bg-pink-900 px-2 py-1 rounded">
                      {word}
                    </span>
                  ))}
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
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
        style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }}
      ></div>

      {/* Fullscreen Modal Content */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900"
           style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
      >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                 {selectedCard.vocabulary?.word}
              </h3>
            </div>
          </div>

          {/* Modern Minimalist Tab Navigation */}
          <div className="flex justify-center bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 px-6 py-4">
            <div className="inline-flex bg-gray-50 dark:bg-gray-800 rounded-xl p-1 space-x-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className={`
                      px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out
                      ${isActive 
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
