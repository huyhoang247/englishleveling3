import React, { useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import component hiển thị chi tiết flashcard
import { defaultVocabulary } from './list-vocabulary.ts'; // Import danh sách từ vựng

// Định nghĩa cấu trúc cho từ vựng (tương tự như trong flashcard.tsx)
interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

// Định nghĩa cấu trúc cho URL ảnh theo phong cách (tương tự như trong flashcard.tsx)
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
}

// Định nghĩa cấu trúc cho một flashcard (tương tự như trong flashcard.tsx)
interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  isFavorite: boolean;
  vocabulary: Vocabulary;
}

const GameBrowser: React.FC = () => {
  // State để lưu trữ flashcard được chọn để hiển thị chi tiết
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  // State để kiểm soát việc hiển thị modal chi tiết từ vựng
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  // State để lưu trữ danh sách các flashcard từ vựng được tạo ra
  const [vocabularyFlashcards, setVocabularyFlashcards] = useState<Flashcard[]>([]);

  // Dữ liệu ảnh ví dụ giả định cho modal (có thể được tùy chỉnh)
  const exampleImages = [
    "https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1",
    "https://placehold.co/1024x1536/33FF57/FFFFFF?text=Example+2",
    "https://placehold.co/1024x1536/3357FF/FFFFFF?text=Example+3",
  ];

  // Phong cách hiển thị mặc định cho modal (có thể được thay đổi)
  const currentVisualStyle = 'default';

  // useEffect để tạo dữ liệu flashcard từ danh sách từ vựng khi component được mount
  useEffect(() => {
    const generatedFlashcards: Flashcard[] = defaultVocabulary.map((word, index) => ({
      id: index + 1, // ID dựa trên vị trí trong mảng
      imageUrl: {
        // Sử dụng placeholder image với chữ cái đầu tiên của từ
        default: `https://placehold.co/300x450/A0A0A0/FFFFFF?text=${word.charAt(0)}`,
        anime: `https://placehold.co/300x450/FF99CC/FFFFFF?text=${word.charAt(0)}`,
        comic: `https://placehold.co/300x450/66B2FF/FFFFFF?text=${word.charAt(0)}`,
        realistic: `https://placehold.co/300x450/A0A0A0/FFFFFF?text=${word.charAt(0)}`,
      },
      isFavorite: false, // Mặc định không phải là yêu thích
      vocabulary: {
        word: word,
        meaning: `Nghĩa của từ "${word}"`, // Dữ liệu giả định
        example: `Đây là một câu ví dụ cho từ "${word}".`, // Dữ liệu giả định
        phrases: [`Cụm từ với ${word}`, `Cách dùng ${word}`], // Dữ liệu giả định
        popularity: (index % 3 === 0 ? "Cao" : index % 2 === 0 ? "Trung bình" : "Thấp"), // Dữ liệu giả định
        synonyms: [`Đồng nghĩa ${word} 1`, `Đồng nghĩa ${word} 2`], // Dữ liệu giả định
        antonyms: [`Trái nghĩa ${word} 1`, `Trái nghĩa ${word} 2`], // Dữ liệu giả định
      },
    }));
    setVocabularyFlashcards(generatedFlashcards);
  }, []); // Chỉ chạy một lần khi component mount

  // Hàm để mở modal chi tiết từ vựng
  const openVocabDetail = (card: Flashcard) => {
    setSelectedCard(card); // Đặt flashcard được chọn
    setShowVocabDetail(true); // Hiển thị modal
    // Có thể thêm logic ẩn thanh điều hướng nếu cần, tương tự VerticalFlashcardGallery
  };

  // Hàm để đóng modal chi tiết từ vựng
  const closeVocabDetail = () => {
    setShowVocabDetail(false); // Ẩn modal
    setSelectedCard(null); // Xóa flashcard đã chọn
    // Có thể thêm logic hiển thị lại thanh điều hướng nếu cần
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans p-4">
      {/* Tiêu đề ứng dụng */}
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700 dark:text-indigo-300">
        Từ Vựng Tiếng Anh
      </h1>

      {/* Vùng hiển thị danh sách từ vựng */}
      <div className="flex-grow overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 rounded-lg shadow-inner bg-gray-50 dark:bg-gray-800">
        {vocabularyFlashcards.map((card) => (
          // Nút (hoặc div) cho mỗi từ vựng, có thể nhấp để mở chi tiết
          <button
            key={card.id}
            onClick={() => openVocabDetail(card)} // Gán sự kiện click để mở modal
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md
                       hover:shadow-xl hover:scale-[1.02] transform
                       transition-all duration-200 ease-in-out cursor-pointer group" // Hiệu ứng hover và chuyển đổi
          >
            {/* Hiển thị từ vựng */}
            <div className="text-xl font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {card.vocabulary.word}
            </div>
            {/* Hiển thị nghĩa của từ vựng */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {card.vocabulary.meaning}
            </p>
          </button>
        ))}
      </div>

      {/* Render component FlashcardDetailModal */}
      <FlashcardDetailModal
        selectedCard={selectedCard} // Truyền dữ liệu flashcard được chọn
        showVocabDetail={showVocabDetail} // Truyền trạng thái hiển thị modal
        exampleImages={exampleImages} // Truyền ảnh ví dụ
        onClose={closeVocabDetail} // Truyền hàm đóng modal
        currentVisualStyle={currentVisualStyle} // Truyền phong cách hiển thị
      />
    </div>
  );
};

export default GameBrowser;
