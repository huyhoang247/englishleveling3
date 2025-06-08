import React, { useState, useEffect, useRef, useMemo } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Assuming this path is correct
import { defaultVocabulary } from './list-vocabulary.ts'; // Assuming this path is correct
import { defaultImageUrls as gameImageUrls } from './image-url.ts'; // Assuming this path is correct
import { Book, sampleBooks as initialSampleBooks } from './books-data.ts'; // Assuming this path is correct
import { auth, db } from './firebase.js'; 
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AddToPlaylistModal from './AddToPlaylistModal.tsx';

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

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XIcon = () => ( // For closing sidebar
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// Interfaces (Vocabulary, Flashcard)
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

// THÊM INTERFACE PLAYLIST
interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

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

// --- Book Sidebar Component ---
interface BookSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | undefined;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const BookSidebar: React.FC<BookSidebarProps> = ({ isOpen, onClose, book, isDarkMode, toggleDarkMode }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);


  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="sidebar-title" className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {book?.title || "Menu"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Đóng menu"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-grow">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nội dung sách</h3>
            <ul className="space-y-1">
              {['Chương 1: Giới thiệu', 'Chương 2: Phát triển câu chuyện', 'Chương 3: Cao trào', 'Chương 4: Kết luận', 'Phụ lục'].map(item => (
                <li key={item}>
                  <a href="#" className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cài đặt hiển thị</h3>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="text-gray-700 dark:text-gray-300">Chế độ tối</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span className="sr-only">Chuyển đổi chế độ tối</span>
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">© 2024 Ebook Reader</p>
        </div>
      </div>
    </>
  );
};


// --- EbookReader Component ---
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
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // THÊM STATE CHO DỮ LIỆU NGƯỜI DÙNG VÀ MODAL
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isBatchPlaylistModalOpen, setIsBatchPlaylistModalOpen] = useState(false);

  // THÊM EFFECT ĐỂ LẮNG NGHE AUTH VÀ DỮ LIỆU FIRESTORE
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setPlaylists([]);
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setPlaylists(userData.playlists || []);
      } else {
        setPlaylists([]);
      }
    }, (error) => {
      console.error("Lỗi khi lấy dữ liệu playlist:", error);
    });
    return unsubscribeFirestore;
  }, [currentUser]);

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
  
  // DÙNG useMemo ĐỂ TÍNH TOÁN DANH SÁCH ID TỪ VỰNG TRONG SÁCH
  const bookVocabularyCardIds = useMemo(() => {
    if (!currentBook || vocabMap.size === 0) {
      return [];
    }
    const wordsInBook = new Set<string>();
    const allWords = currentBook.content.match(/\b\w+\b/g) || [];
    allWords.forEach(word => {
        const normalizedWord = word.toLowerCase();
        if (vocabMap.has(normalizedWord)) {
            wordsInBook.add(normalizedWord);
        }
    });

    const cardIdMap = new Map(defaultVocabulary.map((word, index) => [word.toLowerCase(), index + 1]));
    
    return Array.from(wordsInBook).map(word => cardIdMap.get(word)).filter((id): id is number => id !== undefined);
  }, [currentBook, vocabMap]);

  useEffect(() => {
    if (selectedBookId) {
      hideNavBar();
      if (audioPlayerRef.current && currentBook?.audioUrl) {
        audioPlayerRef.current.src = currentBook.audioUrl;
        audioPlayerRef.current.playbackRate = playbackSpeed;
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
      setIsSidebarOpen(false); // Close sidebar when returning to library
    }
  }, [selectedBookId, currentBook, hideNavBar, showNavBar, playbackSpeed]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const groupedBooks = groupBooksByCategory(booksData);

  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="text-center p-10 text-gray-500 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
    if (!currentBook) return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;

    const contentLines = currentBook.content.trim().split(/\n+/);

    return (
      <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4 pb-24">
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

  const togglePlaybackSpeed = () => {
    const speeds = [1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    setPlaybackSpeed(newSpeed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = newSpeed;
    }
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

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex-shrink-0 sticky top-0 z-20 transition-all duration-300 ${selectedBookId ? 'py-2 sm:py-3' : 'py-4'}`}>
        {selectedBookId && currentBook ? (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Mở menu"
          >
            <MenuIcon />
          </button>
        ) : (
          <h1 className={`font-bold text-gray-900 dark:text-white transition-all duration-300 text-xl sm:text-2xl`}>
            Thư viện Sách
          </h1>
        )}

        {selectedBookId && (
          <button
            onClick={handleBackToLibrary}
            className="flex items-center h-8 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            aria-label="Quay lại Thư viện"
          >
            <span className="bg-gray-400 dark:bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/arrow.png" alt="Back to Library" className="w-5 h-5" />
            </span>
            <span className="ml-1.5 mr-2.5 font-semibold text-sm">BACK</span>
          </button>
        )}
      </header>

      {/* Sidebar */}
      {currentBook && (
          <BookSidebar
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            book={currentBook}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
      )}


      {/* Main content */}
      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850">
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
          <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10 relative">
            {currentBook && (
              <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">{currentBook.title}</h1>
                {currentBook.author && <p className="text-sm sm:text-md text-center text-gray-500 dark:text-gray-400">Tác giả: {currentBook.author}</p>}
                
                {/* === NÚT LƯU TẤT CẢ TỪ VỰNG === */}
                {currentUser && bookVocabularyCardIds.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => setIsBatchPlaylistModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" />
                                <path d="M9 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" />
                            </svg>
                            Lưu {bookVocabularyCardIds.length} từ vựng vào Playlist
                        </button>
                    </div>
                )}
              </div>
            )}
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
      />

      {selectedBookId && currentBook?.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md shadow-top-lg p-3 z-30">
          <div className="max-w-3xl mx-auto flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isAudioPlaying ? "Tạm dừng" : "Phát"}
            >
              {isAudioPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
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
            <button
              onClick={togglePlaybackSpeed}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 shadow-sm hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out transform hover:scale-105"
              aria-label={`Tốc độ ${playbackSpeed}x`}
            >
              {playbackSpeed}x
            </button>
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

      {/* === MODAL THÊM HÀNG LOẠT VÀO PLAYLIST === */}
      {isBatchPlaylistModalOpen && (
          <AddToPlaylistModal
            isOpen={isBatchPlaylistModalOpen}
            onClose={() => setIsBatchPlaylistModalOpen(false)}
            cardIds={bookVocabularyCardIds}
            currentUser={currentUser}
            existingPlaylists={playlists}
          />
      )}
    </div>
  );
};

export default EbookReader;
