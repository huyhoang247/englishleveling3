import React, { useState, useEffect, useRef } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import { defaultVocabulary } from './list-vocabulary.ts';
import { defaultImageUrls as gameImageUrls } from './image-url.ts';
// Import Book interface và sampleBooks từ file books-data.ts
import { Book, sampleBooks as initialSampleBooks } from './books-data.ts';

// --- Icons ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM5.006 10.232a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 0 0 1.061-1.06l-1.591-1.59ZM18.894 17.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.591 1.59ZM3.205 5.006a.75.75 0 0 0-1.06 1.06l1.591 1.59a.75.75 0 1 0 1.06-1.061L3.205 5.006ZM6.002 18.894a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 0 0-1.06-1.061l-1.591 1.59Z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .758-.757l.002.001-.002-.001A3.349 3.349 0 0 1 12 2.25c.BD.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM5.006 10.232a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 0 0 1.061-1.06l-1.591-1.59ZM18.894 17.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.591 1.59ZM3.205 5.006a.75.75 0 0 0-1.06 1.06l1.591 1.59a.75.75 0 1 0 1.06-1.061L3.205 5.006ZM6.002 18.894a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 0 0-1.06-1.061l-1.591 1.59Z" clipRule="evenodd" />
  </svg>
);


// Định nghĩa cấu trúc cho một flashcard và từ vựng của nó
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

// Props interface cho EbookReader để chấp nhận hideNavBar và showNavBar
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

// Hàm nhóm các cuốn sách theo thể loại
const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const category = book.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  // State cho dữ liệu sách, sử dụng initialSampleBooks từ file data
  const [booksData, setBooksData] = useState<Book[]>(initialSampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // State cho map từ vựng và trạng thái tải
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);

  // State cho flashcard từ vựng được chọn và modal chi tiết
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  // State và Ref cho trình phát Audio
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // Thêm state cho tốc độ phát lại

  // State cho Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Khởi tạo map từ vựng khi component được mount
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
  }, []);

  // Lấy thông tin sách hiện tại đang được chọn
  const currentBook = booksData.find(book => book.id === selectedBookId);

  // Effect để quản lý thanh điều hướng và trình phát audio khi sách được chọn thay đổi
  useEffect(() => {
    if (selectedBookId) {
      hideNavBar(); // Ẩn thanh điều hướng chính
      // Thiết lập audio khi một cuốn sách được chọn
      if (audioPlayerRef.current && currentBook?.audioUrl) {
        audioPlayerRef.current.src = currentBook.audioUrl;
        audioPlayerRef.current.playbackRate = playbackSpeed; // Áp dụng tốc độ phát lại
        // Reset trạng thái cho audio mới
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
        setAudioDuration(0);
        // Tự động phát nếu muốn: audioPlayerRef.current.play();
      } else if (audioPlayerRef.current) {
        // Nếu không có audioUrl, tạm dừng và xóa src
        audioPlayerRef.current.pause();
        audioPlayerRef.current.removeAttribute('src');
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
        setAudioDuration(0);
      }
    } else {
      showNavBar(); // Hiện thanh điều hướng chính
      // Tạm dừng audio khi quay lại thư viện
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsAudioPlaying(false);
    }
  }, [selectedBookId, currentBook, hideNavBar, showNavBar, playbackSpeed]); // Thêm playbackSpeed vào dependencies

  // Effect để áp dụng Dark Mode cho thẻ <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Xử lý khi một từ trong sách được nhấp vào
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
    }
  };

  // Đóng modal chi tiết từ vựng
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // Xử lý khi một cuốn sách được chọn từ thư viện
  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  // Xử lý khi quay lại thư viện từ màn hình đọc sách
  const handleBackToLibrary = () => {
    setSelectedBookId(null);
  };

  // Nhóm các cuốn sách theo thể loại để hiển thị trong thư viện
  const groupedBooks = groupBooksByCategory(booksData);

  // Render nội dung sách
  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="text-center p-10 text-gray-500 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
    if (!currentBook) return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;

    const contentLines = currentBook.content.trim().split(/\n+/);

    return (
      <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4 pb-24"> {/* Thêm padding-bottom cho không gian của audio player */}
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
          const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);
          const renderableParts = parts.map((part, partIndex) => {
            if (!part) return null;
            const isWord = /^\w+$/.test(part);
            const normalizedPart = part.toLowerCase();
            const isVocabWord = isWord && vocabMap.has(normalizedPart);
            if (isVocabWord) {
              return (
                <span
                  key={`${index}-${partIndex}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 decoration-1 decoration-blue-500/70 dark:decoration-blue-400/70 cursor-pointer transition-all duration-150 ease-in-out hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => handleWordClick(part)}
                  role="button" tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(part); }}
                >
                  {part}
                </span>
              );
            }
            return <span key={`${index}-${partIndex}`}>{part}</span>;
          }).filter(Boolean);

          const isLikelyChapterTitle = index === 0 && line.length < 60 && !line.includes('.') && !line.includes('Chapter') && !line.includes('Prologue');
          const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index < 5 && index > 0) || ((line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70);

          if (isLikelyChapterTitle) return <h2 key={`line-${index}`} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-6 text-center">{renderableParts}</h2>;
          if (isLikelySectionTitle) return <h3 key={`line-${index}`} className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{renderableParts}</h3>;
          return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">{renderableParts}</p>;
        })}
      </div>
    );
  };

  // --- Logic cho Trình phát Audio ---
  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (isAudioPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play().catch(error => console.error("Lỗi khi phát audio:", error));
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setAudioCurrentTime(audioPlayerRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioPlayerRef.current) {
      setAudioDuration(audioPlayerRef.current.duration);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPlayerRef.current) {
      const newTime = Number(event.target.value);
      audioPlayerRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };
  
  // Effect để dọn dẹp audio khi component unmount hoặc sách thay đổi
  useEffect(() => {
    const audioElem = audioPlayerRef.current;
    return () => {
        if (audioElem) {
            audioElem.pause();
            audioElem.removeAttribute('src'); 
            audioElem.load(); 
        }
    };
  }, [selectedBookId]); // Chỉ chạy khi selectedBookId thay đổi để dọn dẹp audio của sách cũ

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render giao diện thư viện sách
  const renderLibrary = () => (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <section key={category}>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">Xem tất cả →</button>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
            {booksInCategory.map(book => (
              <div
                key={book.id}
                className="flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer group transform hover:-translate-y-1.5 transition-transform duration-200"
                onClick={() => handleSelectBook(book.id)}
                role="button" tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSelectBook(book.id)}
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-2 transition-shadow group-hover:shadow-xl">
                  {book.coverImageUrl ? <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-2 text-center">{book.title}</div>}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{book.title}</h3>
                {book.author && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  // Render component chính
  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {/* Header */}
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
        {/* Nút chuyển đổi Dark Mode */}
        {selectedBookId && (
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        )}
      </header>

      {/* Main content: Thư viện hoặc màn hình đọc sách */}
      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850">
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
          <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10 relative">
            {currentBook && (
              <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                {currentBook.author && <p className="text-sm sm:text-md text-center text-gray-500 dark:text-gray-400">Tác giả: {currentBook.author}</p>}
              </div>
            )}
            {renderBookContent()}
          </div>
        </main>
      )}

      {/* Thẻ Audio (ẩn, điều khiển qua ref) */}
      <audio
        ref={audioPlayerRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        onEnded={() => { setIsAudioPlaying(false); setAudioCurrentTime(0);}}
      />

      {/* Giao diện Trình phát Audio (thanh cố định ở cuối) */}
      {selectedBookId && currentBook?.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md shadow-top-lg p-3 z-30">
          <div className="max-w-3xl mx-auto flex items-center space-x-3 sm:space-x-4">
            {/* Nút Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isAudioPlaying ? "Tạm dừng" : "Phát"}
            >
              {isAudioPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* Hiển thị thời gian & Thanh trượt tiến độ */}
            <div className="flex-grow flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-center">{formatTime(audioCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={audioDuration || 0}
                value={audioCurrentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                aria-label="Tua audio"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-center">{formatTime(audioDuration)}</span>
            </div>
            
            {/* Điều khiển tốc độ phát lại */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {[1.0, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handlePlaybackSpeedChange(speed)}
                  className={`px-2 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`Tốc độ ${speed}x`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
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
