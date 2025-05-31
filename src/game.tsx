import React, { useState, useEffect, useRef } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import danh sách từ vựng

// Định nghĩa cấu trúc từ vựng (tương tự như trong flashcard.tsx)
interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

// Định nghĩa cấu trúc Flashcard (tương tự như trong flashcard.tsx)
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
  // Danh sách các URL gợi ý
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

  // State cho URL hiện tại của iframe hoặc nội dung mô phỏng
  const [url, setUrl] = useState('');
  // State cho trường nhập liệu
  const [inputUrl, setInputUrl] = useState('');
  // State để kiểm soát việc hiển thị các gợi ý
  const [showSuggestions, setShowSuggestions] = useState(true);

  // State để quản lý từ vựng được chọn cho popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State để kiểm soát hiển thị popup từ vựng
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  // Danh sách từ vựng đã chuyển đổi để dễ dàng tìm kiếm
  // Chuyển đổi defaultVocabulary thành một Map để tra cứu nhanh hơn
  const vocabMap = useRef(new Map<string, Vocabulary>());

  useEffect(() => {
    // Khởi tạo vocabMap khi component mount
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      // Tạo dữ liệu giả định cho các trường còn lại của Vocabulary
      // Bạn có thể mở rộng logic này để tải dữ liệu chi tiết hơn từ một nguồn khác
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

  // Xử lý thay đổi trong trường nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Xử lý khi nhấp vào nút "Đi" hoặc nhấn Enter
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
  };

  // Xử lý khi nhấn phím Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  // Xử lý khi nhấp vào một gợi ý
  const handleSuggestionClick = (suggestedUrl: string) => {
    setInputUrl(suggestedUrl);
    setUrl(suggestedUrl);
    setShowSuggestions(false);
  };

  // Cập nhật tiêu đề trình duyệt động
  useEffect(() => {
    if (url) {
      document.title = `GameBrowser - ${new URL(url).hostname}`;
    } else {
      document.title = "GameBrowser - Trang chủ";
    }
  }, [url]);

  // Kiểm tra xem nút có nên bị vô hiệu hóa hay không
  const isSearchButtonDisabled = inputUrl.trim() === '';

  // --- NEW: Xử lý click vào từ trong nội dung mô phỏng ---
  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.current.get(normalizedWord);

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      // Tạo một đối tượng Flashcard tạm thời để truyền vào modal
      const tempFlashcard: Flashcard = {
        id: 0, // ID tạm thời
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
      // Tùy chọn: Hiển thị thông báo "Không tìm thấy từ"
      // alert(`Không tìm thấy từ "${word}" trong danh sách từ vựng.`);
    }
  };

  // Đóng modal từ vựng
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // --- NEW: Hàm để render nội dung mô phỏng với các từ có thể click ---
  const renderSimulatedContent = () => {
    // Đây là nội dung giả định của một trang web.
    // Trong ứng dụng thực tế, bạn sẽ cần một cách để lấy nội dung này từ URL.
    const simulatedText = `
      Đây là một ví dụ về nội dung trang web. Bạn có thể click vào các từ như "Source", "Insurance", "Argument", "Influence" để xem chi tiết từ vựng.
      Chúng ta cũng có các từ khác như "Technology", "Computer", "Internet", "Software", "Hardware".
      Hãy thử tìm từ "Happiness" hoặc "Freedom".
      Một số từ không có trong danh sách từ vựng của bạn, ví dụ như "Lorem" hay "Ipsum".
      Thử tìm kiếm từ "Water" và "Earth".
    `;

    // Tách văn bản thành các từ và dấu câu
    // Regex này sẽ tách các từ và giữ lại dấu câu riêng biệt
    const parts = simulatedText.split(/(\b\w+\b|[.,!?;:()"\s])/g);

    return (
      <p className="p-4 text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          // Kiểm tra nếu phần tử là một từ (chỉ chứa chữ cái và số)
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
      {/* Thanh trình duyệt */}
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
        />
        <button
          onClick={handleGoClick}
          disabled={isSearchButtonDisabled}
          className={`px-4 py-2 rounded-lg shadow-md flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                     transition-all duration-200 ease-in-out transform
                     ${isSearchButtonDisabled
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
      </div>

      {/* Hiển thị gợi ý hoặc nội dung mô phỏng/iframe */}
      <div className="flex-grow relative overflow-y-auto"> {/* Thêm overflow-y-auto để nội dung có thể cuộn */}
        {showSuggestions && url === '' ? (
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
        ) : (
          // Hiển thị nội dung mô phỏng hoặc iframe
          // Sử dụng iframe cho các URL thực tế, nhưng cảnh báo về hạn chế
          // Đối với mục đích demo tra từ, chúng ta sẽ hiển thị nội dung mô phỏng
          url.includes('googleusercontent.com') || url.includes('wikipedia.org') || url.includes('placehold.co') ? (
            <iframe
              src={url}
              title="Web Browser"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups-to-escape-sandbox"
            >
              Trình duyệt của bạn không hỗ trợ iframe.
            </iframe>
          ) : (
            // Đây là nơi chúng ta hiển thị nội dung mô phỏng có thể tương tác
            <div className="p-4 bg-white dark:bg-gray-800 h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nội dung mô phỏng từ {url || 'trang web'}</h2>
              {renderSimulatedContent()}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Lưu ý: Để tương tác với nội dung của các trang web thực tế trong iframe, bạn cần một máy chủ proxy do các hạn chế bảo mật trình duyệt.
                Nội dung trên chỉ là mô phỏng để minh họa chức năng tra từ.
              </p>
            </div>
          )
        )}
      </div>

      {/* Render FlashcardDetailModal */}
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]} // Không cần ảnh ví dụ cho từ vựng tra cứu
        onClose={closeVocabDetail}
        currentVisualStyle="default" // Có thể tùy chỉnh style nếu muốn
      />
    </div>
  );
};

export default GameBrowser;
