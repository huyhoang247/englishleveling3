import React, { useState, useEffect, useRef } from 'react';
// Assuming these imports are correctly set up in your project structure
import FlashcardDetailModal from './story/flashcard.tsx'; // Adjust path if necessary
import { defaultVocabulary } from './list-vocabulary.ts'; // Adjust path if necessary
import { defaultImageUrls as gameImageUrls } from './image-url.ts'; // Adjust path if necessary
import { Book, sampleBooks as initialSampleBooks } from './books-data.ts'; // Adjust path if necessary

// --- Icons (Optimized for clarity and consistency) ---
const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const VolumeUpIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
);

const VolumeOffIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 0 0-1.06-1.06L19.5 10.94l-1.72-1.72Z" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
);


// Interfaces
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

interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

// Helper function
const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const category = book.category || 'Uncategorized'; // Sách không có thể loại sẽ được nhóm vào 'Uncategorized'
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  const [booksData, setBooksData] = useState<Book[]>(initialSampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.75);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false); // State to toggle volume slider

  // Initialize vocabulary map
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

  const currentBook = booksData.find(book => book.id === selectedBookId);

  // Manage navbar and audio player based on book selection
  useEffect(() => {
    if (selectedBookId) {
      hideNavBar();
      if (audioPlayerRef.current && currentBook?.audioUrl) {
        audioPlayerRef.current.src = currentBook.audioUrl;
        audioPlayerRef.current.volume = isAudioMuted ? 0 : audioVolume;
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
        setAudioDuration(0);
      } else if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.removeAttribute('src');
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
        setAudioDuration(0);
      }
    } else {
      showNavBar();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsAudioPlaying(false);
      setShowVolumeSlider(false); // Hide volume slider when returning to library
    }
  }, [selectedBookId, currentBook, hideNavBar, showNavBar, audioVolume, isAudioMuted]);

  // Handle word click in book content
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

  const groupedBooks = groupBooksByCategory(booksData);

  // Render book content with improved styling for readability
  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="text-center p-10 text-gray-500 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
    if (!currentBook) return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;

    const contentLines = currentBook.content.trim().split(/\n+/);

    return (
      <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4 pb-28"> {/* Increased pb for audio player */}
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-4 sm:h-5"></div>; // Slightly more space for blank lines
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
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 decoration-2 decoration-blue-500/70 dark:decoration-blue-400/70 cursor-pointer transition-all duration-200 ease-in-out hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-0.5 py-0.5 rounded-sm" // Enhanced hover for vocab
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

          // Improved logic for detecting titles
          const isChapterOrPrologue = (line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue')) && line.length < 70;
          const isLikelyMainTitle = index === 0 && line.length < 60 && !line.includes('.') && !isChapterOrPrologue;
          const isLikelySectionTitle = (line.length < 70 && (line.endsWith(':') || line.split(' ').length < 7) && !line.includes('.') && index > 0 && index < 5) || isChapterOrPrologue;

          if (isLikelyMainTitle) return <h2 key={`line-${index}`} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-8 text-center">{renderableParts}</h2>;
          if (isLikelySectionTitle) return <h3 key={`line-${index}`} className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mt-10 mb-5">{renderableParts}</h3>;
          return <p key={`line-${index}`} className="text-lg sm:text-xl leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-5 text-left indent-8 first-line:indent-0">{renderableParts}</p>; // Added indent for paragraphs
        })}
      </div>
    );
  };

  // --- Audio Player Logic ---
  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (isAudioPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play().catch(error => console.error("Lỗi khi phát audio:", error));
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleTimeUpdate = () => audioPlayerRef.current && setAudioCurrentTime(audioPlayerRef.current.currentTime);
  const handleLoadedMetadata = () => audioPlayerRef.current && setAudioDuration(audioPlayerRef.current.duration);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPlayerRef.current) {
      const newTime = Number(event.target.value);
      audioPlayerRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPlayerRef.current) {
      const newVolume = Number(event.target.value);
      audioPlayerRef.current.volume = newVolume;
      setAudioVolume(newVolume);
      setIsAudioMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!audioPlayerRef.current) return;
    const newMutedState = !isAudioMuted;
    setIsAudioMuted(newMutedState);
    audioPlayerRef.current.volume = newMutedState ? 0 : audioVolume > 0 ? audioVolume : 0.1; // Restore to previous or small volume
    if (newMutedState && audioVolume === 0) setAudioVolume(0.1); // If unmuting and volume was 0, set to small volume
  };
  
  const toggleVolumeSlider = () => setShowVolumeSlider(prev => !prev);


  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    const audioElem = audioPlayerRef.current;
    return () => {
        if (audioElem) {
            audioElem.pause();
            audioElem.removeAttribute('src'); 
            audioElem.load(); 
        }
    };
  }, [selectedBookId]);


  // Render Library View with UI/UX enhancements
  const renderLibrary = () => (
    <div className="p-4 md:p-6 lg:p-8 space-y-10"> {/* Increased space-y */}
      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <section key={category}>
          <div className="flex justify-between items-center mb-4 md:mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{category}</h2>
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-3 py-1 transition-all duration-200">
              Xem tất cả <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
            {booksInCategory.map(book => (
              <div
                key={book.id}
                className="flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer group transform transition-all duration-300 ease-in-out hover:scale-105" // Enhanced hover
                onClick={() => handleSelectBook(book.id)}
                role="button" tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSelectBook(book.id)}
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl mb-2.5 transition-shadow duration-300">
                  {book.coverImageUrl ? 
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x600/E0E0E0/333333?text=No+Image')}/> 
                    : <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-2 text-center text-sm">{book.title}</div>}
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{book.title}</h3>
                {book.author && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-['Inter',_sans-serif]">
      {/* Header */}
      <header className={`flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md flex-shrink-0 sticky top-0 z-20 transition-all duration-300 ease-in-out ${selectedBookId ? 'py-2.5 sm:py-3' : 'py-3 sm:py-4'}`}>
        <div className="flex items-center">
          {selectedBookId && (
            <button
              onClick={handleBackToLibrary}
              className="mr-2 sm:mr-3 p-1.5 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-all duration-200"
              aria-label="Quay lại Thư viện"
            >
              <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <h1 className={`font-bold text-gray-900 dark:text-white transition-all duration-300 ease-in-out ${selectedBookId ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
            {selectedBookId && currentBook ? currentBook.title : "Thư viện Sách"}
          </h1>
        </div>
        {selectedBookId && currentBook?.author && (
           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:block">
             Tác giả: {currentBook.author}
           </p>
        )}
         {!selectedBookId && (
            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors">
                Tùy chọn
            </button>
        )}
      </header>

      {/* Main content area */}
      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850"> {/* Slightly different bg for library */}
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-100 dark:bg-gray-900 py-6 sm:py-8">
          <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 relative">
            {/* Author info moved to header for reader view, can be added back here if preferred */}
            {renderBookContent()}
          </div>
        </main>
      )}

      {/* Audio element (hidden) */}
      <audio
        ref={audioPlayerRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        onEnded={() => { setIsAudioPlaying(false); setAudioCurrentTime(0);}}
        onVolumeChange={() => {
            if(audioPlayerRef.current) {
                setAudioVolume(audioPlayerRef.current.volume);
                setIsAudioMuted(audioPlayerRef.current.muted || audioPlayerRef.current.volume === 0);
            }
        }}
      />

      {/* Audio Player UI (fixed at bottom) */}
      {selectedBookId && currentBook?.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] p-3 z-30 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={togglePlayPause}
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-all duration-200"
              aria-label={isAudioPlaying ? "Tạm dừng" : "Phát"}
            >
              {isAudioPlaying ? <PauseIcon className="w-6 h-6 sm:w-7 sm:h-7" /> : <PlayIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>

            <div className="flex-grow flex items-center space-x-2 sm:space-x-3">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-10 text-center tabular-nums">{formatTime(audioCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={audioDuration || 0}
                value={audioCurrentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                aria-label="Tua audio"
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-10 text-center tabular-nums">{formatTime(audioDuration)}</span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={toggleVolumeSlider} // Click to toggle slider
                className="p-1.5 sm:p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                aria-label={isAudioMuted ? "Bật tiếng" : "Tắt tiếng"}
              >
                {isAudioMuted || audioVolume === 0 ? <VolumeOffIcon className="w-5 h-5 sm:w-5 sm:h-5" /> : <VolumeUpIcon className="w-5 h-5 sm:w-5 sm:h-5" />}
              </button>
              {/* Horizontal Volume Slider - Toggles visibility */}
              <div className={`transition-all duration-300 ease-in-out ${showVolumeSlider ? 'w-20 sm:w-24 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isAudioMuted ? 0 : audioVolume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Âm lượng"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vocabulary Detail Modal */}
      {selectedVocabCard && showVocabDetail && (
        <FlashcardDetailModal
          selectedCard={selectedVocabCard}
          showVocabDetail={showVocabDetail}
          exampleImages={[]} // Provide actual images if available
          onClose={closeVocabDetail}
          currentVisualStyle="default" // Or manage this dynamically
        />
      )}
    </div>
  );
};

export default EbookReader;
