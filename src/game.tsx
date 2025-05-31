import React, { useState, useEffect, useRef } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import danh sách từ vựng

// Define the structure for a flashcard and its vocabulary
// These interfaces are copied from flashcard.tsx to ensure consistency
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

const EbookReader: React.FC = () => {
  // State to hold the book content
  const [bookContent, setBookContent] = useState<string>(`
    Chương 1: Khởi đầu mới

    Trong một thế giới đầy biến động, nơi công nghệ và con người hòa quyện, một kỷ nguyên mới đã bắt đầu. Mọi thứ dường như đang thay đổi nhanh chóng, từ cách chúng ta giao tiếp đến cách chúng ta học tập.

    "Thật khó để tin rằng chúng ta đã đạt được những tiến bộ đáng kinh ngạc như vậy," Sarah nói, ánh mắt cô nhìn ra cửa sổ. "Mọi thứ đều là một sự phát triển không ngừng."

    Cuộc sống hàng ngày trở nên phức tạp hơn, nhưng cũng đầy hứa hẹn. Những khái niệm như "trí tuệ nhân tạo" và "thực tế ảo" không còn là khoa học viễn tưởng mà đã trở thành một phần không thể thiếu của hiện thực.

    Một trong những thách thức lớn nhất là làm thế nào để thích nghi với những thay đổi này. "Chúng ta cần phải học hỏi liên tục," David, một nhà khoa học nổi tiếng, phát biểu trong một hội nghị gần đây. "Kiến thức là chìa khóa để tồn tại trong kỷ nguyên này."

    Anh ấy nhấn mạnh tầm quan trọng của việc "tư duy phản biện" và khả năng "giải quyết vấn đề". "Đừng chỉ chấp nhận những gì bạn được nghe," anh ấy khuyên. "Hãy luôn tìm kiếm 'nguồn' thông tin đáng tin cậy và 'phân tích' nó một cách cẩn thận."

    Trong khi đó, ở một góc khác của thành phố, một nhóm các nhà phát triển trẻ đang làm việc trên một "ứng dụng" mới. Mục tiêu của họ là tạo ra một công cụ giúp mọi người dễ dàng "tiếp cận" thông tin và "kết nối" với nhau.

    "Chúng tôi tin rằng 'giáo dục' là quyền của mọi người," một thành viên trong nhóm nói. "Và công nghệ có thể là 'cầu nối' để biến điều đó thành hiện thực."

    Họ đang đối mặt với nhiều "thử thách", nhưng tinh thần của họ không hề suy giảm. "Mỗi 'vấn đề' là một 'cơ hội' để học hỏi và phát triển," họ thường nhắc nhở nhau.

    Và thế là, trong bối cảnh của một thế giới đang không ngừng "tiến hóa", câu chuyện về sự học hỏi và thích nghi tiếp tục được viết.
  `);

  // Vocabulary list converted to a Map for faster lookup
  const vocabMap = useRef(new Map<string, Vocabulary>());

  // State to manage selected vocabulary for the popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State to control vocabulary popup visibility
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    // Initialize vocabMap when component mounts
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      // Create dummy data for other Vocabulary fields
      // In a real application, you would fetch this detailed data from a backend
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
    console.log("Vocab Map initialized with", vocabMap.current.size, "words.");
  }, []);

  // Handle word click in the book content
  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.current.get(normalizedWord);

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      // Create a temporary Flashcard object to pass to the modal
      const tempFlashcard: Flashcard = {
        id: 0, // Dummy ID, not used for actual flashcard logic here
        imageUrl: {
          default: `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`,
        },
        isFavorite: false, // Default to false
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      console.log(`Word "${word}" not found in vocabulary list.`);
      // Optionally, show a "Word not found" message
    }
  };

  // Close vocabulary modal
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // Function to render the book content with clickable words
  const renderBookContent = () => {
    // Split the text by word boundaries and also keep punctuation/spaces
    // This regex matches either a sequence of word characters (\b\w+\b) or any non-word character including spaces
    const parts = bookContent.split(/(\b\w+\b|[.,!?;:()"\s])/g);

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          // Check if the part is a word (contains only word characters)
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
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trang đọc sách</h1>
      </div>

      {/* Book Content Area */}
      <div className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md my-4">
        {renderBookContent()}
      </div>

      {/* Render FlashcardDetailModal */}
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]} // No example images needed for lookup context
        onClose={closeVocabDetail}
        currentVisualStyle="default" // Can be customized if desired
      />
    </div>
  );
};

export default EbookReader;
