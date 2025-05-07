import React from 'react';
import BackIcon from '../icon/back-icon.tsx'; // Import the BackIcon component

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
  imageUrl: string;
  isFavorite: boolean;
  vocabulary: Vocabulary;
}

// Define the props for the FlashcardDetailModal component
interface FlashcardDetailModalProps {
  selectedCard: Flashcard | null; // The flashcard data to display
  showVocabDetail: boolean; // State to control modal visibility
  imageDetail: 'basic' | 'phrase' | 'example'; // Determines which content to show
  exampleImages: string[]; // Array of example image URLs
  onClose: () => void; // Function to close the modal
}

// Animation styles (can be moved to a shared CSS file or kept here)
const animations = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  @keyframes slideIn {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes scaleIn {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* Animation for backdrop */
  @keyframes modalBackdropIn {
    0% { opacity: 0; }
    100% { opacity: 0.4; } /* Use 0.4 opacity as requested */
  }
`;

const FlashcardDetailModal: React.FC<FlashcardDetailModalProps> = ({
  selectedCard,
  showVocabDetail,
  imageDetail,
  exampleImages,
  onClose,
}) => {
  // If modal is not visible or no card is selected, return null
  if (!showVocabDetail || !selectedCard) {
    return null;
  }

  // Function to render modal content based on detailType
  const renderModalContent = () => {
    // Find the original index of the selected card in the flashcards array (assuming exampleImages index relates to card index)
    // This might need adjustment if exampleImages mapping logic is different
    // For now, we'll just use the card's ID as a simple way to get an example image
    const exampleIndex = (selectedCard.id - 1) % exampleImages.length;
    const exampleImageUrl = exampleImages[exampleIndex];


    if (imageDetail === 'basic' && selectedCard.imageUrl) {
      return (
        // Content for Basic Image
        <div className="flex justify-center items-center flex-grow p-4 overflow-hidden"> {/* Added flex-grow, overflow-hidden */}
          <img
            src={selectedCard.imageUrl}
            alt="Card"
            className="max-h-full max-w-full object-contain rounded-lg shadow-md" // Added rounded corners and shadow
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://placehold.co/1024x1536/E0E0E0/333333?text=Image+Error`;
            }}
          />
        </div>
      );
    } else if (imageDetail === 'example') {
      return (
        // Content for Example Image
        <div className="flex justify-center items-center flex-grow p-4 overflow-hidden"> {/* Added flex-grow, overflow-hidden */}
          <img
            src={exampleImageUrl}
            alt="Example"
            className="max-h-full max-w-full object-contain rounded-lg shadow-md" // Added rounded corners and shadow
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://placehold.co/1024x1536/E0E0E0/333333?text=Example+Image+Error`;
            }}
          />
        </div>
      );
    } else if (imageDetail === 'phrase' && selectedCard.vocabulary?.phrases) {
       return (
         // Content for Phrase/Basic Vocabulary Info
        <div className="p-5 overflow-y-auto flex-grow"> {/* Added flex-grow */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{selectedCard.vocabulary.word}</h3> {/* Added dark mode text color */}
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
            {/* You could add more vocabulary details here if needed */}
            <div className="mb-5">
              <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs font-semibold text-blue-600 mb-2">
                Nghĩa
              </div>
              <p className="text-gray-800 dark:text-gray-200">{selectedCard.vocabulary.meaning}</p> {/* Added dark mode text color */}
            </div>
            <div className="mb-5">
              <div className="inline-block bg-green-50 rounded-full px-3 py-1 text-xs font-semibold text-green-600 mb-2">
                Ví dụ
              </div>
               <p className="text-gray-700 dark:text-gray-300 italic bg-green-50 dark:bg-green-900 p-3 rounded-lg border-l-4 border-green-300 dark:border-green-700"> {/* Added dark mode styles */}
                "{selectedCard.vocabulary.example}"
              </p>
            </div>
        </div>
       );
    }
    else {
      // Default to Text Detail (full vocabulary info) if image or example not available or basic/example not selected
      return (
         // Content for Full Vocabulary Info
        <div className="p-5 overflow-y-auto flex-grow"> {/* Added flex-grow */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{selectedCard.vocabulary.word}</h3> {/* Added dark mode text color */}
          {/* Nghĩa */}
          <div className="mb-5">
            <div className="inline-block bg-blue-50 rounded-full px-3 py-1 text-xs font-semibold text-blue-600 mb-2">
              Nghĩa
            </div>
            <p className="text-gray-800 dark:text-gray-200">{selectedCard.vocabulary.meaning}</p> {/* Added dark mode text color */}
          </div>

          {/* Ví dụ */}
          <div className="mb-5">
            <div className="inline-block bg-green-50 rounded-full px-3 py-1 text-xs font-semibold text-green-600 mb-2">
              Ví dụ
            </div>
            <p className="text-gray-700 dark:text-gray-300 italic bg-green-50 dark:bg-green-900 p-3 rounded-lg border-l-4 border-green-300 dark:border-green-700"> {/* Added dark mode styles */}
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
                 ${selectedCard.vocabulary.popularity === "Cao" ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200" : // Added dark mode styles
                   selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200" : // Added dark mode styles
                   "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"} // Added condition and dark mode styles for "Thấp"
               `}>
                 {selectedCard.vocabulary.popularity}
               </span>

               {/* Hiển thị biểu đồ mức độ phổ biến */}
               <div className="ml-3 flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"> {/* Added dark mode styles */}
                 <div
                   className={`h-full rounded-full ${
                     selectedCard.vocabulary.popularity === "Cao" ? "bg-green-500 w-4/5" :
                     selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-500 w-1/2" :
                     selectedCard.vocabulary.popularity === "Thấp" ? "bg-red-500 w-1/5" : "" // Added condition for "Thấp"
                   }`}
                 ></div>
               </div>
             </div>
           </div>

           {/* Synonyms & Antonyms */}
           <div className="grid grid-cols-2 gap-4">
             {/* Từ đồng nghĩa */}
             <div>
               <div className="inline-block bg-indigo-50 rounded-full px-3 py-1 text-xs font-semibold text-indigo-600 mb-2">
                 Từ đồng nghĩa
               </div>
               <div className="flex flex-col gap-1">
                 {selectedCard.vocabulary.synonyms.map((word, index) => (
                   <span key={index} className="text-gray-700 dark:text-gray-300 text-sm bg-indigo-50 dark:bg-indigo-900 px-2 py-1 rounded"> {/* Added dark mode styles */}
                     {word}
                   </span>
                 ))}
               </div>
             </div>

             {/* Từ trái nghĩa */}
             <div>
               <div className="inline-block bg-pink-50 rounded-full px-3 py-1 text-xs font-semibold text-pink-600 mb-2">
                 Từ trái nghĩa
               </div>
               <div className="flex flex-col gap-1">
                 {selectedCard.vocabulary.antonyms.map((word, index) => (
                   <span key={index} className="text-gray-700 dark:text-gray-300 text-sm bg-pink-50 dark:bg-pink-900 px-2 py-1 rounded"> {/* Added dark mode styles */}
                     {word}
                   </span>
                 ))}
               </div>
             </div>
           </div>
        </div>
      );
    }
  };


  return (
    <>
      {/* Inject CSS animations */}
      <style>{animations}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
        style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }}
      ></div>

      {/* Fullscreen Modal Content */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900" // Changed to fullscreen classes
           style={{ animation: 'fadeIn 0.3s ease-out forwards' }} // Simple fade in for fullscreen
      >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                 {/* Render header based on imageDetail */}
                 {imageDetail === 'basic' && 'Ảnh Gốc'}
                 {imageDetail === 'example' && 'Hình Ảnh Ví Dụ'}
                 {imageDetail === 'phrase' && selectedCard.vocabulary?.word} {/* Show word for phrase detail */}
                 {imageDetail !== 'basic' && imageDetail !== 'example' && imageDetail !== 'phrase' && selectedCard.vocabulary?.word} {/* Default to word */}
              </h3>
            </div>
          </div>

          {/* Body - Render content based on renderModalContent function */}
          {renderModalContent()}

          {/* Full-width Glassmorphism Footer with Back Icon on the left */}
           {/* Adjusted py-4 to py-2 to reduce vertical padding */}
           <div className="fixed bottom-0 left-0 right-0 z-50 px-6 py-2 flex justify-start items-center bg-gray-200 dark:bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg"> {/* Added horizontal padding, justify-start */}
               {/* The BackIcon is now aligned to the left */}
               <BackIcon onClick={onClose} className="text-gray-800 dark:text-gray-200" /> {/* Adjusted icon color for gray background */}
           </div>

      </div>
    </>
  );
};

export default FlashcardDetailModal;
