import React, { useState, useEffect, useRef } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import vocabulary list

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

// Define book content
const book1Content = `
  Chương 1: Một Khởi Đầu Mới

  Trong một thế giới thay đổi không ngừng, nơi công nghệ và con người hòa quyện, một kỷ nguyên mới đã bắt đầu. Mọi thứ dường như đang phát triển nhanh chóng, từ cách chúng ta giao tiếp đến cách chúng ta học hỏi.

  "Thật khó tin chúng ta đã đạt được những tiến bộ đáng kinh ngạc như vậy," Sarah nói, mắt cô nhìn ra ngoài cửa sổ. "Mọi thứ là một sự phát triển liên tục."

  Cuộc sống hàng ngày đã trở nên phức tạp hơn, nhưng cũng đầy hứa hẹn. Các khái niệm như "trí tuệ nhân tạo" và "thực tế ảo" không còn là khoa học viễn tưởng mà đã trở thành một phần không thể thiếu của thực tại.

  Một trong những thách thức lớn nhất là làm thế nào để thích nghi với những thay đổi này. "Chúng ta cần học hỏi liên tục," David, một nhà khoa học nổi tiếng, đã phát biểu tại một hội nghị gần đây. "Kiến thức là chìa khóa để tồn tại trong kỷ nguyên này."

  Ông nhấn mạnh tầm quan trọng của "tư duy phản biện" và khả năng "giải quyết vấn đề." "Đừng chỉ chấp nhận những gì bạn nghe," ông khuyên. "Luôn tìm kiếm 'nguồn' thông tin 'đáng tin cậy' và 'phân tích' nó cẩn thận."

  Trong khi đó, ở một góc khác của thành phố, một nhóm các nhà phát triển trẻ đang làm việc trên một "ứng dụng" mới. Mục tiêu của họ là tạo ra một công cụ giúp mọi người dễ dàng "truy cập" thông tin và "kết nối" với nhau.

  "Chúng tôi tin rằng 'giáo dục' là quyền của mọi người," một thành viên trong nhóm nói. "Và công nghệ có thể là 'cầu nối' để biến điều đó thành hiện thực."

  Họ đang đối mặt với nhiều "thách thức," nhưng tinh thần của họ vẫn không suy giảm. "Mỗi 'vấn đề' là một 'cơ hội' để học hỏi và phát triển," họ thường nhắc nhở nhau.

  Và thế là, trong bối cảnh một thế giới không ngừng "tiến hóa," câu chuyện về học hỏi và thích nghi tiếp tục được viết.
`;

const book2Content = `
  Chương 2: Cuộc Phiêu Lưu Bất Tận

  Cuộc hành trình khám phá không bao giờ kết thúc. Mỗi ngày là một cơ hội để học hỏi điều gì đó mới, để vượt qua giới hạn của bản thân và để vươn tới những chân trời mới.

  "Thế giới này rộng lớn hơn chúng ta tưởng rất nhiều," Mark, một nhà thám hiểm dày dạn kinh nghiệm, chia sẻ. "Mỗi chuyến đi là một bài học."

  Từ những khu rừng rậm nhiệt đới đến những đỉnh núi phủ tuyết, từ những thành phố cổ kính đến những đô thị hiện đại, mỗi nơi đều ẩn chứa những câu chuyện và kiến thức độc đáo.

  "Điều quan trọng không phải là bạn đi được bao xa, mà là bạn đã học được gì trên đường đi," anh nói. "Sự tò mò là động lực lớn nhất."

  Những thử thách trên đường đi không làm nản lòng những người yêu thích phiêu lưu. Ngược lại, chúng tiếp thêm sức mạnh và quyết tâm cho họ.

  "Hãy luôn mở lòng để đón nhận những điều mới mẻ," anh khuyên. "Đừng ngại bước ra khỏi vùng an toàn của mình."

  Và cứ như thế, cuộc phiêu lưu của tri thức và khám phá tiếp tục, không có điểm dừng.
`;

const EbookReader: React.FC = () => {
  // State to manage the current view: 'bookList' or 'bookContent'
  const [currentView, setCurrentView] = useState<'bookList' | 'bookContent'>('bookList');
  // State to store the content of the currently selected book
  const [currentBookContent, setCurrentBookContent] = useState<string>('');

  // Use state for vocabMap to trigger re-render
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true); // State to track vocabulary loading

  // State to manage selected vocabulary for the popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State to control vocabulary popup visibility
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Meaning of "${word}" (example).`,
        example: `This is an example sentence using "${word}".`,
        phrases: [`Phrase with ${word} A`, `Phrase with ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Synonym for ${word} 1`, `Synonym for ${word} 2`],
        antonyms: [`Antonym for ${word} 1`, `Antonym for ${word} 2`],
      });
    });
    setVocabMap(tempMap); // Update state, will trigger re-render
    setIsLoadingVocab(false); // Mark as loaded
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []); // Empty array ensures useEffect runs only once after component mounts

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord); // Get from vocabMap state

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      const tempFlashcard: Flashcard = {
        id: Date.now(), // Use a unique ID, e.g., timestamp
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

  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // Function to handle book selection
  const handleBookSelect = (bookNumber: number) => {
    if (bookNumber === 1) {
      setCurrentBookContent(book1Content);
    } else if (bookNumber === 2) {
      setCurrentBookContent(book2Content);
    }
    setCurrentView('bookContent'); // Switch to book content view
  };

  // Function to go back to the book list
  const handleBackToBookList = () => {
    setCurrentView('bookList');
    setCurrentBookContent(''); // Clear current book content
  };

  // Render book content with clickable words
  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-8">Đang tải từ vựng...</div>; // Or a spinner
    }

    // Split content by words and punctuation, including various quotation marks
    const parts = currentBookContent.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          if (!part || part.trim() === '') { // Skip empty or whitespace-only strings from split
            return <span key={index}>{part}</span>;
          }
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart); // Check against vocabMap state

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
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
      </div>

      {/* Main content area */}
      <div className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto w-full">
        {currentView === 'bookList' ? (
          // Book list view
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Chọn sách của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Book 1 Card */}
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 cursor-pointer transform hover:scale-105 transition-transform duration-300 flex flex-col items-center"
                onClick={() => handleBookSelect(1)}
              >
                <img
                  src="https://placehold.co/150x200/A78BFA/FFFFFF?text=Book+1"
                  alt="Book 1 Cover"
                  className="rounded-md mb-4 shadow-md"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book 1: Khởi Đầu Mới</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Khám phá những thay đổi trong thế giới công nghệ và con người.
                </p>
              </div>

              {/* Book 2 Card */}
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 cursor-pointer transform hover:scale-105 transition-transform duration-300 flex flex-col items-center"
                onClick={() => handleBookSelect(2)}
              >
                <img
                  src="https://placehold.co/150x200/60A5FA/FFFFFF?text=Book+2"
                  alt="Book 2 Cover"
                  className="rounded-md mb-4 shadow-md"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book 2: Cuộc Phiêu Lưu</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Hành trình bất tận của tri thức và khám phá.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Book content view
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md my-4 p-6 relative">
            <button
              onClick={handleBackToBookList}
              className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Quay lại
            </button>
            <div className="mt-12"> {/* Add margin top to prevent content from being hidden by the back button */}
              {renderBookContent()}
            </div>
          </div>
        )}
      </div>

      {/* Flashcard Detail Modal */}
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]} // Assuming exampleImages are not directly used here or passed from parent
        onClose={closeVocabDetail}
        currentVisualStyle="default"
      />
    </div>
  );
};

export default EbookReader;
