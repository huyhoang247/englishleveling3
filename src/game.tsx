import React, { useState, useEffect, useRef } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import danh sách từ vựng

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

const GameBrowser: React.FC = () => {
  // Suggested URLs list
  const suggestedUrls = [
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Facebook', url: 'https://www.facebook.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'Twitch', url: 'https://www.twitch.tv' },
    { name: 'Reddit', url: 'https://www.reddit.com' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Amazon', url: 'https://www.amazon.com' },
    { name: 'Netflix', url: 'https://www.netflix.com' },
    { name: 'X (Twitter)', url: 'https://twitter.com' },
    { name: 'Instagram', url: 'https://www.instagram.com' },
  ];

  // State for current iframe/simulated content URL
  const [url, setUrl] = useState('');
  // State for input field
  const [inputUrl, setInputUrl] = useState('');
  // State to control suggestion display
  const [showSuggestions, setShowSuggestions] = useState(true);

  // State to manage selected vocabulary for the popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State to control vocabulary popup visibility
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  // NEW: State for offline mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Vocabulary list converted to a Map for faster lookup
  const vocabMap = useRef(new Map<string, Vocabulary>());

  useEffect(() => {
    // Initialize vocabMap when component mounts
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      // Create dummy data for other Vocabulary fields
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Nghĩa của từ "${word}" (ví dụ).`,
        example: `Đây là một câu ví dụ sử dụng từ "${word}".`,
        phrases: [`Cụm từ với ${word} A`, `Cụm từ với ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Đồng nghĩa ${word} 1`, `Đồng nghĩa ${word} 2`],
        antonyms: [`Trái nghĩa ${word} 1`, `Trái nghĩa ${word} 2`],
      });
    });
    vocabMap.current = tempMap;
    console.log("Vocab Map initialized:", vocabMap.current);
  }, []);

  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Handle "Go" button click or Enter key press
  const handleGoClick = () => {
    if (inputUrl.trim() === '') {
      return;
    }

    let formattedUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    setUrl(formattedUrl);
    setShowSuggestions(false);
    setIsOfflineMode(false); // Go online when actively navigating
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestedUrl: string) => {
    setInputUrl(suggestedUrl);
    setUrl(suggestedUrl);
    setShowSuggestions(false);
    setIsOfflineMode(false); // Go online when selecting a suggestion
  };

  // Update browser title dynamically
  useEffect(() => {
    if (url) {
      document.title = `GameBrowser - ${new URL(url).hostname}`;
    } else {
      document.title = "GameBrowser - Trang chủ";
    }
  }, [url]);

  // Check if search button should be disabled
  const isSearchButtonDisabled = inputUrl.trim() === '';

  // Handle word click in simulated content
  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.current.get(normalizedWord);

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      const tempFlashcard: Flashcard = {
        id: 0, // Dummy ID
        imageUrl: {
          default: `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`,
        },
        isFavorite: false,
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      console.log(`Word "${word}" not found in vocabulary list.`);
    }
  };

  // Close vocabulary modal
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // Function to render simulated content with clickable words
  const renderSimulatedContent = () => {
    const simulatedText = `
      Đây là một ví dụ về nội dung trang web. Bạn có thể click vào các từ như "Source", "Insurance", "Argument", "Influence" để xem chi tiết từ vựng.
      Chúng ta cũng có các từ khác như "Technology", "Computer", "Internet", "Software", "Hardware".
      Hãy thử tìm từ "Happiness" hoặc "Freedom".
      Một số từ không có trong danh sách từ vựng của bạn, ví dụ như "Lorem" hay "Ipsum".
      Thử tìm kiếm từ "Water" và "Earth".
      Các từ như "Apple", "Banana", "Orange" cũng có thể được tra cứu.
      "Elephant" và "Tiger" là những từ khác trong danh sách.
      "Music" và "Art" là những từ phổ biến.
      "Science" và "History" cũng có mặt.
    `;

    // Split text into words and punctuation/spaces
    const parts = simulatedText.split(/(\b\w+\b|[.,!?;:()"\s])/g);

    return (
      <p className="p-4 text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.current.has(normalizedPart);

          if (isVocabWord) {
            return (
              <span
                key={index}
                className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                onClick={() => handleWordClick(part)}
              >
                {part}
              </span>
            );
          } else {
            return <span key={index}>{part}</span>;
          }
        })}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Browser Bar */}
      <div className="flex items-center p-3 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <input
          type="text"
          value={inputUrl}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Nhập URL hoặc tìm kiếm..."
          className="flex-grow p-2 mr-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all duration-200 ease-in-out"
          disabled={isOfflineMode} // Disable input when in offline mode
        />
        <button
          onClick={handleGoClick}
          disabled={isSearchButtonDisabled || isOfflineMode} // Disable button when in offline mode or input is empty
          className={`px-4 py-2 rounded-lg shadow-md flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                     transition-all duration-200 ease-in-out transform
                     ${isSearchButtonDisabled || isOfflineMode
                       ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                       : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'
                     }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-search"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {/* NEW: Toggle Offline Mode Button */}
        <button
          onClick={() => setIsOfflineMode(prevMode => !prevMode)}
          className={`ml-2 px-4 py-2 rounded-lg shadow-md flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                     transition-all duration-200 ease-in-out transform
                     ${isOfflineMode
                       ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg active:scale-95'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                     }`}
        >
          {isOfflineMode ? 'Trực tuyến' : 'Ngoại tuyến'}
        </button>
      </div>

      {/* Display Suggestions, Simulated Content, or Iframe */}
      <div className="flex-grow relative overflow-y-auto">
        {showSuggestions && url === '' && !isOfflineMode ? ( // Show suggestions ONLY if not in offline mode and no URL
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto h-full">
            {suggestedUrls.map((site, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(site.url)}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md
                           hover:shadow-xl hover:scale-[1.02] transform
                           transition-all duration-200 ease-in-out cursor-pointer"
              >
                <div className="mb-2">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}
                    alt={`${site.name} favicon`}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      const parentDiv = e.currentTarget.parentElement;
                      if (parentDiv) {
                        const fallbackSpan = document.createElement('span');
                        fallbackSpan.className = 'text-4xl text-gray-500 dark:text-gray-400';
                        fallbackSpan.textContent = site.name.charAt(0);
                        parentDiv.appendChild(fallbackSpan);
                      }
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-center">{site.name}</span>
              </button>
            ))}
          </div>
        ) : isOfflineMode ? ( // If in offline mode, always show simulated content
          <div className="p-4 bg-white dark:bg-gray-800 h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nội dung mô phỏng (Chế độ Ngoại tuyến)</h2>
            {renderSimulatedContent()}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Bạn đang ở chế độ ngoại tuyến. Click vào các từ được tô sáng để tra cứu từ vựng.
            </p>
          </div>
        ) : ( // Otherwise, if online and a URL is set, show iframe
          <iframe
            src={url}
            title="Web Browser"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups-to-escape-sandbox"
          >
            Trình duyệt của bạn không hỗ trợ iframe.
          </iframe>
        )}
      </div>

      {/* Render FlashcardDetailModal */}
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]} // No example images needed for lookup
        onClose={closeVocabDetail}
        currentVisualStyle="default" // Can be customized if desired
      />
    </div>
  );
};

export default GameBrowser;
