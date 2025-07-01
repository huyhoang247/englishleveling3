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
          // --- START: NEW REFINED VOCABULARY UI ---
          <div className="p-6 overflow-y-auto flex-grow content-transition bg-white dark:bg-gray-900/95">
            <div className="max-w-3xl mx-auto">
              {/* Main Word and Meaning */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 tracking-tight">
                  {selectedCard.vocabulary.word}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {selectedCard.vocabulary.meaning}
                </p>
              </div>

              <div className="space-y-8">
                {/* Example Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Ví dụ
                  </h3>
                  <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-600 pl-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
                    <p className="text-gray-800 dark:text-gray-200 italic">
                      "{selectedCard.vocabulary.example}"
                    </p>
                  </blockquote>
                </div>
                
                {/* Phrases Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Cụm từ phổ biến
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.phrases.map((phrase, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Synonyms & Antonyms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Từ đồng nghĩa
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.vocabulary.synonyms.map((word, index) => (
                        <span key={index} className="text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-900/50 px-3 py-1.5 rounded-lg text-sm font-medium">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Từ trái nghĩa
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.vocabulary.antonyms.map((word, index) => (
                        <span key={index} className="text-red-800 bg-red-100 dark:text-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-lg text-sm font-medium">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popularity Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Mức độ phổ biến
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold w-28 text-center
                        ${selectedCard.vocabulary.popularity === "Cao" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
                          selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200" :
                          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                        }`}
                    >
                      {selectedCard.vocabulary.popularity}
                    </span>
                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                          selectedCard.vocabulary.popularity === "Cao" ? "bg-green-500 w-[90%]" :
                          selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-500 w-[55%]" :
                          "bg-red-500 w-[20%]"
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          // --- END: NEW REFINED VOCABULARY UI ---
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
