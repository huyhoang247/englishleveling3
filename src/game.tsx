
import React, { useState, useEffect, useRef } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import vocabulary list

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
  const [bookContent, setBookContent] = useState<string>(`
    Chapter 1: A New Beginning

    In a world of constant change, where technology and humanity intertwine, a new era has begun. Everything seems to be evolving rapidly, from how we communicate to how we learn.

    "It's hard to believe we've made such incredible progress," Sarah said, her eyes gazing out the window. "Everything is a continuous development."

    Daily life has become more complex, yet full of promise. Concepts like "artificial intelligence" and "virtual reality" are no longer science fiction but have become an integral part of reality.

    One of the biggest challenges is how to adapt to these changes. "We need to learn continuously," David, a renowned scientist, stated at a recent conference. "Knowledge is the key to survival in this era."

    He emphasized the importance of "critical thinking" and the ability to "solve problems." "Don't just accept what you hear," he advised. "Always seek 'reliable' information 'sources' and 'analyze' it carefully."

    Meanwhile, in another corner of the city, a group of young developers are working on a new "application." Their goal is to create a tool that helps people easily "access" information and "connect" with each other.

    "We believe that 'education' is everyone's right," a team member said. "And technology can be the 'bridge' to make that a reality."

    They are facing many "challenges," but their spirit remains undiminished. "Every 'problem' is an 'opportunity' to learn and grow," they often remind each other.

    And so, against the backdrop of a world that is constantly "evolving," the story of learning and adaptation continues to be written.
  `);

  // Use state for vocabMap to trigger re-render
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true); // State để theo dõi tải từ vựng

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
    setVocabMap(tempMap); // Cập nhật state, sẽ kích hoạt re-render
    setIsLoadingVocab(false); // Đánh dấu đã tải xong
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần sau khi component mount

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord); // Lấy từ vocabMap state

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      const tempFlashcard: Flashcard = {
        id: Date.now(), // Sử dụng một ID duy nhất, ví dụ timestamp
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

  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-8">Loading vocabulary...</div>; // Hoặc một spinner
    }

    const parts = bookContent.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g); // Thêm các loại dấu ngoặc kép vào regex

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          if (!part || part.trim() === '') { // Bỏ qua các chuỗi rỗng hoặc chỉ chứa khoảng trắng do split tạo ra
            return <span key={index}>{part}</span>;
          }
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart); // Kiểm tra trên vocabMap state

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
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
      </div>
      <div className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md my-4">
        {renderBookContent()}
      </div>
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]}
        onClose={closeVocabDetail}
        currentVisualStyle="default"
      />
    </div>
  );
};

export default EbookReader;
