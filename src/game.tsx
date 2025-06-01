import React, { useState, useEffect, useRef } from 'react';
// Assuming these imports are correctly set up in your project structure
import FlashcardDetailModal from './story/flashcard.tsx'; // Adjust path if necessary
import { defaultVocabulary } from './list-vocabulary.ts'; // Adjust path if necessary
import { defaultImageUrls as gameImageUrls } from './image-url.ts'; // Adjust path if necessary
import { Book, sampleBooks as initialSampleBooks } from './books-data.ts'; // Adjust path if necessary

// --- Icons ---
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

const CogIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.096.573.394 1.086.786 1.414l.908.752c.498.412.732 1.023.628 1.621a4.158 4.158 0 01-.423 1.43l-.205.328c-.149.237-.234.509-.234.787v.608c0 .278.085.55.234.787l.205.328c.164.263.31.549.423 1.43.104.598-.13 1.209-.628 1.621l-.908.752c-.392.328-.69.841-.786 1.414l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.096-.573-.394-1.086-.786-1.414l-.908-.752c-.498-.412-.732-1.023-.628-1.621a4.158 4.158 0 01.423-1.43l.205-.328c.149-.237-.234.509-.234.787v-.608c0-.278.085-.55.234-.787l-.205-.328a4.158 4.158 0 01-.423-1.43c-.104-.598.13-1.209.628-1.621l.908-.752c.392.328.69.841.786 1.414l.213-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 ml-1.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
    const category = book.category || 'Chưa phân loại'; // Sách không có thể loại sẽ được nhóm vào 'Chưa phân loại'
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
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

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

  useEffect(() => {
    if (selectedBookId) {
      hideNavBar();
      if (audioPlayerRef.current && currentBook?.audioUrl) {
        audioPlayerRef.current.src = currentBook.audioUrl;
        audioPlayerRef.current.volume = isAudioMuted ? 0 : audioVolume;
        setIsAudioPlaying(false); // Reset play state for new book
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
      setShowVolumeSlider(false);
    }
  }, [selectedBookId, currentBook, hideNavBar, showNavBar, audioVolume, isAudioMuted]);

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
        isFavorite: false, // Default favorite state
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

  const handleSelectBook = (bookId: string) => setSelectedBookId(bookId);
  const handleBackToLibrary = () => setSelectedBookId(null);

  const groupedBooks = groupBooksByCategory(booksData);

  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div><p className="ml-3 text-gray-500 dark:text-gray-400">Đang tải nội dung...</p></div>;
    if (!currentBook) return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Không tìm thấy nội dung sách. Vui lòng thử lại.</div>;

    const contentLines = currentBook.content.trim().split(/\n+/);

    return (
      <article className="font-serif text-gray-800 dark:text-gray-200 px-1 sm:px-2 pb-32"> {/* Increased pb for audio player, font-serif for classic book feel */}
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-5 sm:h-6"></div>;
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
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700/50 underline underline-offset-2 decoration-sky-500/70 decoration-dotted cursor-pointer transition-all duration-150 ease-in-out px-1 py-0.5 rounded-md"
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

          const isChapterOrPrologue = (line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('prologue') || line.toLowerCase().startsWith('chương')) && line.length < 80;
          const isLikelyMainTitle = index === 0 && line.length < 70 && !line.includes('.') && !isChapterOrPrologue;
          const isLikelySectionTitle = (line.length < 80 && (line.endsWith(':') || line.split(' ').length < 8) && !line.includes('.') && index > 0 && index < 7) || isChapterOrPrologue;

          if (isLikelyMainTitle) return <h2 key={`line-${index}`} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-10 text-center font-sans tracking-tight">{renderableParts}</h2>;
          if (isLikelySectionTitle) return <h3 key={`line-${index}`} className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mt-12 mb-6 font-sans tracking-tight">{renderableParts}</h3>;
          return <p key={`line-${index}`} className="text-lg sm:text-xl leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-6 text-justify indent-8 first-line:indent-0">{renderableParts}</p>;
        })}
      </article>
    );
  };

  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (isAudioPlaying) audioPlayerRef.current.pause();
    else audioPlayerRef.current.play().catch(error => console.error("Lỗi khi phát audio:", error));
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
    audioPlayerRef.current.volume = newMutedState ? 0 : audioVolume > 0 ? audioVolume : 0.1;
    if (newMutedState && audioVolume === 0) setAudioVolume(0.1);
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

  const renderLibrary = () => (
    <div className="p-5 md:p-8 lg:p-10 space-y-12">
      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <section key={category} className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{category}</h2>
            <button className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-lg px-3 py-1.5 transition-colors duration-200 group">
              Xem tất cả
              <ArrowRightIcon className="w-4 h-4 ml-1.5 transform transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
            {booksInCategory.map(book => (
              <div
                key={book.id}
                className="relative cursor-pointer group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900"
                onClick={() => handleSelectBook(book.id)}
                role="button" tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSelectBook(book.id)}
                aria-label={`Đọc sách ${book.title}`}
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                  {book.coverImageUrl ? 
                    <img 
                        src={book.coverImageUrl} 
                        alt={`Bìa sách ${book.title}`} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = `https://placehold.co/400x600/D1D5DB/4B5563?text=${encodeURIComponent(book.title.substring(0,20))}`;
                            target.alt = `Không có hình ảnh cho ${book.title}`;
                        }}
                    /> 
                    : <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-3 text-center text-sm font-medium">{book.title}</div>
                  }
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2 leading-tight">{book.title}</h3>
                  {book.author && <p className="text-xs md:text-sm text-gray-200 line-clamp-1 mt-0.5">{book.author}</p>}
                </div>
                 {/* Static info below image if no hover */}
                <div className="p-3 bg-white dark:bg-gray-800 group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight">{book.title}</h3>
                    {book.author && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{book.author}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans selection:bg-blue-500 selection:text-white">
      <header className={`flex items-center justify-between p-3.5 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm flex-shrink-0 sticky top-0 z-20 transition-all duration-300 ease-in-out border-b border-gray-200/80 dark:border-gray-700/80`}>
        <div className="flex items-center">
          {selectedBookId && (
            <button
              onClick={handleBackToLibrary}
              className="mr-2 sm:mr-3 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 transition-all duration-200"
              aria-label="Quay lại Thư viện"
            >
              <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <h1 className={`font-bold text-gray-800 dark:text-gray-100 transition-all duration-300 ease-in-out ${selectedBookId ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} tracking-tight`}>
            {selectedBookId && currentBook ? currentBook.title : "Thư viện Sách"}
          </h1>
        </div>
        {selectedBookId && currentBook?.author && (
           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:block truncate max-w-xs" title={currentBook.author}>
             Tác giả: {currentBook.author}
           </p>
        )}
         {!selectedBookId && (
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 transition-colors" aria-label="Tùy chọn">
                <CogIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        )}
      </header>

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-gray-100 dark:bg-gray-850 scroll-smooth">
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-100 dark:bg-gray-900 py-6 sm:py-8 scroll-smooth">
          <div className="max-w-3xl lg:max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10">
            {renderBookContent()}
          </div>
        </main>
      )}

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

      {selectedBookId && currentBook?.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50/90 dark:bg-gray-850/90 backdrop-blur-md shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.2)] p-3.5 sm:p-4 z-30 border-t border-gray-200/70 dark:border-gray-700/70">
          <div className="max-w-3xl mx-auto flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={togglePlayPause}
              className="p-2.5 sm:p-3 rounded-full text-gray-700 dark:text-gray-200 bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300/90 dark:hover:bg-gray-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 transition-all duration-200"
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
                className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800"
                aria-label="Tua audio"
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-10 text-center tabular-nums">{formatTime(audioDuration)}</span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={toggleVolumeSlider}
                className="p-1.5 sm:p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all duration-200"
                aria-label={isAudioMuted ? "Bật tiếng" : "Tắt tiếng"}
              >
                {isAudioMuted || audioVolume === 0 ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
              </button>
              <div className={`transition-all duration-300 ease-in-out flex items-center ${showVolumeSlider ? 'w-20 sm:w-24 opacity-100 ml-1' : 'w-0 opacity-0 overflow-hidden'}`}>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isAudioMuted ? 0 : audioVolume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    aria-label="Âm lượng"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
