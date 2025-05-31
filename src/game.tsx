import React, { useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import vocabulary list
import { defaultImageUrls as gameImageUrls } from './image-url.ts'; // Adjust path if necessary
import { Book, sampleBooks } from './books-data.ts'; // Import Book interface and sampleBooks

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

// Props interface for EbookReader to accept hideNavBar and showNavBar
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const category = book.category || 'Uncategorized'; // Sửa lỗi chính tả Uncategorised -> Uncategorized
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  const [booksData, setBooksData] = useState<Book[]>(sampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);

  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Nghĩa của từ "${word}" (ví dụ).`,
        example: `Đây là một câu ví dụ sử dụng từ "${word}".`,
        phrases: [`Cụm từ với ${word} A`, `Cụm từ với ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Từ đồng nghĩa với ${word} 1`, `Từ đồng nghĩa với ${word} 2`],
        antonyms: [`Từ trái nghĩa với ${word} 1`, `Từ trái nghĩa với ${word} 2`],
      });
    });
    setVocabMap(tempMap);
    setIsLoadingVocab(false);
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      hideNavBar();
    } else {
      showNavBar();
    }
  }, [selectedBookId, hideNavBar, showNavBar]);

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord);

    if (foundVocab) {
      let cardImageUrl = `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`;
      const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === normalizedWord);

      if (vocabIndex !== -1 && vocabIndex < gameImageUrls.length) {
        cardImageUrl = gameImageUrls[vocabIndex];
      }

      const tempFlashcard: Flashcard = {
        id: vocabIndex !== -1 ? vocabIndex + 1 : Date.now(),
        imageUrl: { default: cardImageUrl },
        isFavorite: false,
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      console.log(`Từ "${word}" không có trong danh sách từ vựng.`);
    }
  };

  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleBackToLibrary = () => {
    setSelectedBookId(null);
  };

  const currentBook = booksData.find(book => book.id === selectedBookId);
  const groupedBooks = groupBooksByCategory(booksData);

  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-10 text-gray-500 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
    }
    if (!currentBook) {
      return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;
    }

    const contentLines = currentBook.content.trim().split(/\n+/); // Chia nội dung thành các dòng/đoạn dựa trên dấu xuống dòng

    return (
      // Container chính cho nội dung sách với font chữ Inter
      <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4">
        {contentLines.map((line, index) => {
          if (line.trim() === '') {
            // Tạo một khoảng trống nhỏ cho các dòng trống cố ý, giúp duy trì cấu trúc
            return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
          }

          // Xử lý từng phần của dòng (từ, dấu câu, khoảng trắng) để làm nổi bật từ vựng
          const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);
          const renderableParts = parts.map((part, partIndex) => {
            if (!part) return null; // Bỏ qua các phần rỗng
            const isWord = /^\w+$/.test(part); // Kiểm tra xem có phải là một từ không
            const normalizedPart = part.toLowerCase();
            const isVocabWord = isWord && vocabMap.has(normalizedPart); // Kiểm tra từ có trong map từ vựng không

            if (isVocabWord) {
              return (
                <span
                  key={`${index}-${partIndex}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 decoration-1 decoration-blue-500/70 dark:decoration-blue-400/70 cursor-pointer transition-all duration-150 ease-in-out hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => handleWordClick(part)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(part); }} // Cho phép tương tác bằng phím Enter hoặc Space
                >
                  {part}
                </span>
              );
            } else {
              return <span key={`${index}-${partIndex}`}>{part}</span>;
            }
          }).filter(Boolean); // Loại bỏ các phần tử null


          // Heuristic để xác định và tạo kiểu cho tiêu đề/tiêu đề phụ
          // Ví dụ: "Social Health: A Key to Well-being" hoặc "Maya's Story: A Missing Piece"
          const isLikelyChapterTitle = index === 0 && line.length < 60 && !line.includes('.') && !line.includes('Chapter') && !line.includes('Prologue');
          const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index < 5 && index > 0) || ( (line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70 );


          if (isLikelyChapterTitle) {
             return (
              <h2
                key={`line-${index}`}
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-6 text-center" // Tiêu đề chương chính
              >
                {renderableParts}
              </h2>
            );
          }

          if (isLikelySectionTitle) {
            return (
              <h3
                key={`line-${index}`}
                className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4" // Tiêu đề phụ
              >
                {renderableParts}
              </h3>
            );
          }

          // Kiểu mặc định cho đoạn văn
          return (
            <p
              key={`line-${index}`}
              className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left" // Căn lề trái để dễ đọc
            >
              {renderableParts}
            </p>
          );
        })}
      </div>
    );
  };

  const renderLibrary = () => (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <section key={category}>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">
              Xem tất cả →
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
            {booksInCategory.map(book => (
              <div
                key={book.id}
                className="flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer group transform hover:-translate-y-1.5 transition-transform duration-200"
                onClick={() => handleSelectBook(book.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSelectBook(book.id)}
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-2 transition-shadow group-hover:shadow-xl">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-2 text-center">
                      {book.title}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {book.title}
                </h3>
                {book.author && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header được điều chỉnh để ít gây rối hơn khi đọc sách */}
      <header className={`flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex-shrink-0 sticky top-0 z-20 transition-all duration-300 ${selectedBookId ? 'py-2 sm:py-3' : 'py-4'}`}>
        <h1 className={`font-bold text-gray-900 dark:text-white transition-all duration-300 ${selectedBookId ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
          {selectedBookId && currentBook ? currentBook.title : "Thư viện Sách"}
        </h1>
        {selectedBookId && (
          <button
            onClick={handleBackToLibrary}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
          >
            ← Quay lại Thư viện
          </button>
        )}
      </header>

      {!selectedBookId ? (
        // Giao diện thư viện sách
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850">
          {renderLibrary()}
        </main>
      ) : (
        // Giao diện đọc sách
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
          {/* Panel chứa nội dung sách, được làm nổi bật hơn */}
          <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10">
            {currentBook && (
              <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                {/* Tiêu đề sách chính đã được hiển thị ở header, đây có thể là khu vực cho tên tác giả hoặc phụ đề */}
                {currentBook.author && (
                  <p className="text-sm sm:text-md text-center text-gray-500 dark:text-gray-400">
                    Tác giả: {currentBook.author}
                  </p>
                )}
              </div>
            )}
            {renderBookContent()}
          </div>
        </main>
      )}

      {/* Modal chi tiết Flashcard (giữ nguyên) */}
      {selectedVocabCard && showVocabDetail && (
        <FlashcardDetailModal
          selectedCard={selectedVocabCard}
          showVocabDetail={showVocabDetail}
          exampleImages={[]}
          onClose={closeVocabDetail}
          currentVisualStyle="default"
        />
      )}
    </div>
  );
};

export default EbookReader;
