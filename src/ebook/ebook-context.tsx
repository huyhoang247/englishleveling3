// --- START OF FILE ebook-context.tsx (6).txt ---

// --- START OF FILE ebook-context.tsx (2).txt ---

// --- START OF FILE EbookContext.tsx (FIXED & UPDATED) ---

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback
} from 'react';
import { auth, db } from '../firebase.js'; 
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// --- DATA IMPORTS (UPDATED) ---
// Thay thế các import cũ bằng import từ flashcard-data làm nguồn dữ liệu duy nhất
import { 
  Flashcard, 
  VocabularyData as Vocabulary, // Dùng alias để nhất quán với code cũ
  ExampleSentence, 
  WORD_TO_CARD_MAP, 
  exampleData 
} from '../story/flashcard-data.ts'; // Giả sử đây là đường dẫn đúng
import { Book, sampleBooks as initialSampleBooks } from '../books-data.ts';
// phraseData import has been removed

// --- TYPE DEFINITIONS ---
// Các interface Vocabulary và Flashcard cục bộ đã được xóa vì giờ chúng ta import chúng

export interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

// PhraseSentence interface has been removed

export interface BookStats {
  totalWords: number;
  uniqueWordsCount: number;
  vocabMatchCount: number;
  vocabMismatchCount: number;
  wordFrequencies: Map<string, number>;
}

export interface HiddenWordState {
  originalWord: string;
  userInput: string;
  status: 'hidden' | 'correct' | 'incorrect';
}


// --- TYPE FOR THE CONTEXT VALUE (UPDATED) ---
interface EbookContextType {
  // State
  booksData: Book[];
  selectedBookId: string | null;
  vocabMap: Map<string, Vocabulary>;
  isLoadingVocab: boolean;
  selectedVocabCard: Flashcard | null;
  showVocabDetail: boolean;
  isAudioPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  playbackSpeed: number;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  currentUser: User | null;
  playlists: Playlist[];
  isBatchPlaylistModalOpen: boolean;
  isStatsModalOpen: boolean;
  selectedVoiceKey: string | null;
  subtitleLanguage: 'en' | 'bilingual';

  // --- NEW STATES FOR CLOZE TEST ---
  isClozeTestActive: boolean;
  hiddenWordCount: number;
  hiddenWords: Map<number, HiddenWordState>;
  activeHiddenWordIndex: number | null;
  correctlyGuessedCount: number;
  isClozeTestModalOpen: boolean;

  // --- NEW: Expose example sentences ---
  exampleSentences: ExampleSentence[];

  // Refs
  audioPlayerRef: React.RefObject<HTMLAudioElement>;

  // Derived State
  currentBook: Book | undefined;
  availableVoices: string[];
  currentAudioUrl: string | null | undefined;
  bookVocabularyCardIds: number[];
  bookStats: BookStats | null;
  isViSubAvailable: boolean;
  displayedContent: string;

  // Functions & State Setters
  handleSelectBook: (bookId: string) => void;
  handleBackToLibrary: () => void;
  handleWordClick: (word: string) => void;
  closeVocabDetail: () => void;
  togglePlayPause: () => void;
  handleSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  togglePlaybackSpeed: () => void;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  toggleSidebar: () => void;
  setIsBatchPlaylistModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsStatsModalOpen: Dispatch<SetStateAction<boolean>>;
  handleVoiceChange: (direction: 'next' | 'previous') => void;
  handleSetSubtitleLanguage: (lang: 'en' | 'bilingual') => void;

  // --- NEW FUNCTIONS FOR CLOZE TEST ---
  setHiddenWordCount: (count: number) => void;
  startClozeTest: () => void;
  stopClozeTest: () => void;
  handleHiddenWordClick: (wordIndex: number) => void;
  handleClozeTestInput: (value: string) => void;
  dismissKeyboard: () => void;
  setIsClozeTestModalOpen: Dispatch<SetStateAction<boolean>>;
  closeClozeTestModal: () => void; 

}

// --- CREATE CONTEXT ---
const EbookContext = createContext<EbookContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface EbookProviderProps {
  children: ReactNode;
  hideNavBar: () => void;
  showNavBar: () => void;
}

export const EbookProvider: React.FC<EbookProviderProps> = ({ children, hideNavBar, showNavBar }) => {
  const [booksData] = useState<Book[]>(initialSampleBooks);
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
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isBatchPlaylistModalOpen, setIsBatchPlaylistModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string | null>(null);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'en' | 'bilingual'>('en');

  const [isClozeTestModalOpen, setIsClozeTestModalOpen] = useState(false); 
  const [isClozeTestActive, setIsClozeTestActive] = useState(false);
  const [hiddenWordCount, _setHiddenWordCount] = useState(10);
  const [hiddenWords, setHiddenWords] = useState<Map<number, HiddenWordState>>(new Map());
  const [activeHiddenWordIndex, setActiveHiddenWordIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => setCurrentUser(user));
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setPlaylists([]);
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) setPlaylists(docSnap.data().playlists || []);
      else setPlaylists([]);
    });
    return unsubscribeFirestore;
  }, [currentUser]);

  // --- UPDATED: Tạo vocabMap từ WORD_TO_CARD_MAP ---
  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    WORD_TO_CARD_MAP.forEach(card => {
      tempMap.set(card.vocabulary.word.toLowerCase(), card.vocabulary);
    });
    setVocabMap(tempMap);
    setIsLoadingVocab(false);
  }, []);

  // phraseMap and phraseRegex have been removed.

  const currentBook = useMemo(() => booksData.find(book => book.id === selectedBookId), [booksData, selectedBookId]);
  
  const isViSubAvailable = useMemo(() => !!currentBook?.contentVi, [currentBook]);
  
  const displayedContent = useMemo(() => {
    // Chế độ 'vi' đã bị loại bỏ, chỉ còn chế độ 'en' sử dụng state này
    return currentBook?.content || '';
  }, [currentBook]);
  
  useEffect(() => {
    setSubtitleLanguage('en');
    stopClozeTest(); // Ensure test is stopped when changing books
    setIsClozeTestModalOpen(false);
  }, [selectedBookId]);

  const availableVoices = useMemo(() => currentBook?.audioUrls ? Object.keys(currentBook.audioUrls) : [], [currentBook]);
  const currentAudioUrl = useMemo(() => selectedVoiceKey ? currentBook?.audioUrls?.[selectedVoiceKey] : null, [selectedVoiceKey, currentBook]);

  useEffect(() => {
    setSelectedVoiceKey(availableVoices.length > 0 ? availableVoices[0] : null);
  }, [availableVoices]);

  // --- UPDATED: Lấy card ID trực tiếp từ WORD_TO_CARD_MAP ---
  const bookVocabularyCardIds = useMemo(() => {
    if (!currentBook || WORD_TO_CARD_MAP.size === 0) return [];
    const wordsInBook = new Set<string>();
    const allWords = currentBook.content.match(/\b\w+\b/g) || [];
    allWords.forEach(word => {
        if (WORD_TO_CARD_MAP.has(word.toLowerCase())) wordsInBook.add(word.toLowerCase());
    });
    return Array.from(wordsInBook)
      .map(word => WORD_TO_CARD_MAP.get(word)?.id)
      .filter((id): id is number => id !== undefined);
  }, [currentBook]);

  const bookStats = useMemo<BookStats | null>(() => {
    if (!currentBook || vocabMap.size === 0) return null;
    const words = currentBook.content.match(/\b\w+\b/g) || [];
    const wordFrequencies = new Map<string, number>();
    const uniqueWords = new Set<string>();

    words.forEach(word => {
      const normalizedWord = word.toLowerCase();
      wordFrequencies.set(normalizedWord, (wordFrequencies.get(normalizedWord) || 0) + 1);
      uniqueWords.add(normalizedWord);
    });
    
    const vocabMatchCount = Array.from(uniqueWords).filter(word => vocabMap.has(word)).length;
    const sortedFrequencies = new Map([...wordFrequencies.entries()].sort((a, b) => b[1] - a[1]));

    return {
      totalWords: words.length,
      uniqueWordsCount: uniqueWords.size,
      vocabMatchCount,
      vocabMismatchCount: uniqueWords.size - vocabMatchCount,
      wordFrequencies: sortedFrequencies
    };
  }, [currentBook, vocabMap]);
  
  useEffect(() => {
    if (selectedBookId) hideNavBar();
    else showNavBar();
  }, [selectedBookId, hideNavBar, showNavBar]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);
  
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (currentAudioUrl && audio) {
        if (audio.src !== currentAudioUrl) {
            audio.src = currentAudioUrl;
            audio.load();
        }
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
        setAudioDuration(0);
    } else if (audio && !currentAudioUrl) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        setIsAudioPlaying(false);
        setAudioCurrentTime(0);
        setAudioDuration(0);
    }
  }, [currentAudioUrl]);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;
    
    const timeUpdateHandler = () => setAudioCurrentTime(audio.currentTime);
    const loadedMetadataHandler = () => setAudioDuration(audio.duration);
    const playHandler = () => setIsAudioPlaying(true);
    const pauseHandler = () => setIsAudioPlaying(false);
    const endedHandler = () => { setIsAudioPlaying(false); setAudioCurrentTime(0); };
    
    audio.addEventListener('timeupdate', timeUpdateHandler);
    audio.addEventListener('loadedmetadata', loadedMetadataHandler);
    audio.addEventListener('play', playHandler);
    audio.addEventListener('pause', pauseHandler);
    audio.addEventListener('ended', endedHandler);
    
    return () => {
      audio.removeEventListener('timeupdate', timeUpdateHandler);
      audio.removeEventListener('loadedmetadata', loadedMetadataHandler);
      audio.removeEventListener('play', playHandler);
      audio.removeEventListener('pause', pauseHandler);
      audio.removeEventListener('ended', endedHandler);
    };
  }, []);

  const correctlyGuessedCount = useMemo(() => {
    let count = 0;
    hiddenWords.forEach(word => {
        if (word.status === 'correct') {
            count++;
        }
    });
    return count;
  }, [hiddenWords]);


  const setHiddenWordCount = (count: number) => {
    _setHiddenWordCount(Math.max(5, Math.min(100, count)));
  };

  const startClozeTest = useCallback(() => {
    if (!currentBook?.content) return;
    
    const allWords = currentBook.content.match(/\b[a-zA-Z']+\b/g) || [];
    const validWordIndices = allWords
      .map((word, index) => ({ word, index }))
      .filter(item => item.word.length >= 3)
      .map(item => item.index);

    const shuffledIndices = validWordIndices.sort(() => 0.5 - Math.random());
    const indicesToHide = shuffledIndices.slice(0, hiddenWordCount);

    const newHiddenWords = new Map<number, HiddenWordState>();
    indicesToHide.forEach(index => {
      newHiddenWords.set(index, {
        originalWord: allWords[index],
        userInput: '',
        status: 'hidden',
      });
    });

    setHiddenWords(newHiddenWords);
    setIsClozeTestActive(true);
    setActiveHiddenWordIndex(null);
    setIsClozeTestModalOpen(false); // MODIFIED: Close modal on start
  }, [currentBook, hiddenWordCount]);

  const stopClozeTest = () => {
    setIsClozeTestActive(false);
    setHiddenWords(new Map());
    setActiveHiddenWordIndex(null);
  };
  
  const closeClozeTestModal = () => { 
      setIsClozeTestModalOpen(false);
  }

  const handleHiddenWordClick = (wordIndex: number) => {
    if (hiddenWords.get(wordIndex)?.status !== 'correct') {
      setActiveHiddenWordIndex(wordIndex);
    }
  };

  const dismissKeyboard = () => {
    setActiveHiddenWordIndex(null);
  };
  
  const checkAnswer = (wordIndex: number, finalInput: string) => {
    const wordState = hiddenWords.get(wordIndex);
    if (!wordState) return;

    const isCorrect = finalInput.toLowerCase() === wordState.originalWord.toLowerCase();
    const newStatus = isCorrect ? 'correct' : 'incorrect';
    
    const newHiddenWords = new Map(hiddenWords);
    newHiddenWords.set(wordIndex, { ...wordState, status: newStatus });
    setHiddenWords(newHiddenWords);

    if (isCorrect) {
        setTimeout(() => setActiveHiddenWordIndex(null), 300);
    } else {
        setTimeout(() => {
            const currentWord = newHiddenWords.get(wordIndex);
            if(currentWord && currentWord.status === 'incorrect') {
                 newHiddenWords.set(wordIndex, { ...currentWord, userInput: '', status: 'hidden' });
                 setHiddenWords(new Map(newHiddenWords));
            }
        }, 800);
    }
  };

  const handleClozeTestInput = (value: string) => {
    if (activeHiddenWordIndex === null) return;

    const currentWordState = hiddenWords.get(activeHiddenWordIndex);
    if (!currentWordState) return;
    
    const newHiddenWords = new Map(hiddenWords);
    newHiddenWords.set(activeHiddenWordIndex, { ...currentWordState, userInput: value });
    setHiddenWords(newHiddenWords);
    
    if (value.length === currentWordState.originalWord.length) {
        checkAnswer(activeHiddenWordIndex, value);
    }
  };


  const handleSelectBook = (bookId: string) => setSelectedBookId(bookId);
  const handleBackToLibrary = () => setSelectedBookId(null);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- UPDATED: Lấy toàn bộ object Flashcard từ map ---
  const handleWordClick = (word: string) => {
    if (isClozeTestActive) return; // Prevent clicking words during test
    const normalizedWord = word.toLowerCase();
    const foundCard = WORD_TO_CARD_MAP.get(normalizedWord);
    if (foundCard) {
      setSelectedVocabCard(foundCard); // Gán cả object card đầy đủ
      setShowVocabDetail(true);
    }
  };

  const closeVocabDetail = () => { setSelectedVocabCard(null); setShowVocabDetail(false); };
  const togglePlayPause = () => { if (!audioPlayerRef.current) return; isAudioPlaying ? audioPlayerRef.current.pause() : audioPlayerRef.current.play().catch(console.error); };
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => { if (audioPlayerRef.current) { const newTime = Number(event.target.value); audioPlayerRef.current.currentTime = newTime; setAudioCurrentTime(newTime); } };
  const togglePlaybackSpeed = () => { const speeds = [1.0, 1.25, 1.5]; const currentIndex = speeds.indexOf(playbackSpeed); setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]); };
  const handleVoiceChange = (direction: 'next' | 'previous') => {
      if (availableVoices.length <= 1 || !selectedVoiceKey) return;
      const currentIndex = availableVoices.indexOf(selectedVoiceKey);
      if (currentIndex === -1) return;
      const nextIndex = direction === 'next' ? (currentIndex + 1) % availableVoices.length : (currentIndex - 1 + availableVoices.length) % availableVoices.length;
      setSelectedVoiceKey(availableVoices[nextIndex]);
  };
  const handleSetSubtitleLanguage = (lang: 'en' | 'bilingual') => {
    if (isViSubAvailable) setSubtitleLanguage(lang);
  };
  
  const value: EbookContextType = {
    booksData, selectedBookId, vocabMap, isLoadingVocab, selectedVocabCard, showVocabDetail,
    isAudioPlaying, audioCurrentTime, audioDuration, playbackSpeed, isDarkMode, isSidebarOpen,
    currentUser, playlists, isBatchPlaylistModalOpen, isStatsModalOpen,
    selectedVoiceKey, audioPlayerRef, currentBook, availableVoices, currentAudioUrl,
    bookVocabularyCardIds, bookStats, handleSelectBook, handleBackToLibrary,
    handleWordClick, closeVocabDetail, togglePlayPause, handleSeek,
    togglePlaybackSpeed, setIsDarkMode, toggleSidebar, setIsBatchPlaylistModalOpen,
    setIsStatsModalOpen, handleVoiceChange,
    subtitleLanguage, isViSubAvailable, displayedContent, handleSetSubtitleLanguage,
    exampleSentences: exampleData, // Thêm exampleData vào context
    isClozeTestActive, hiddenWordCount, hiddenWords, activeHiddenWordIndex, correctlyGuessedCount,
    setHiddenWordCount, startClozeTest, stopClozeTest, handleHiddenWordClick, handleClozeTestInput, dismissKeyboard,
    isClozeTestModalOpen, setIsClozeTestModalOpen, closeClozeTestModal,
  };

  return <EbookContext.Provider value={value}>{children}</EbookContext.Provider>;
};

export const useEbook = (): EbookContextType => {
  const context = useContext(EbookContext);
  if (context === undefined) {
    throw new Error('useEbook must be used within an EbookProvider');
  }
  return context;
};

// --- END OF FILE EbookContext.tsx (FIXED & UPDATED) ---
