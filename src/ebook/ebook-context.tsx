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

// --- DATA IMPORTS (UPDATED FOR NEW STRUCTURE) ---
import {
  Flashcard,
  VocabularyData as Vocabulary,
  ExampleSentence,
  WORD_TO_CARD_MAP,
  exampleData
} from '../story/flashcard-data.ts';

// (SỬA ĐỔI) Thay thế import cũ bằng import từ cấu trúc thư mục data mới
import { Book, allBooks } from './ebooks/index.ts'; // <-- THAY ĐỔI QUAN TRỌNG
// Lưu ý: Hãy đảm bảo đường dẫn '../data' là chính xác so với vị trí file context của bạn.

// --- TYPE DEFINITIONS ---
export interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

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


// --- TYPE FOR THE CONTEXT VALUE ---
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
  isSidebarOpen: boolean;
  currentUser: User | null;
  playlists: Playlist[];
  isBatchPlaylistModalOpen: boolean;
  isStatsModalOpen: boolean;
  selectedVoiceKey: string | null;
  subtitleLanguage: 'en' | 'bilingual';
  isVoiceSelectorOpen: boolean; 
  activeBookTab: 'read' | 'vocabulary' | 'practice'; // <-- NEW STATE FOR IN-BOOK TABS

  // --- NEW STATES FOR CLOZE TEST ---
  isClozeTestActive: boolean;
  hiddenWordCount: number;
  hiddenWords: Map<number, HiddenWordState>;
  activeHiddenWordIndex: number | null;
  correctlyGuessedCount: number;

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
  toggleSidebar: () => void;
  setIsBatchPlaylistModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsStatsModalOpen: Dispatch<SetStateAction<boolean>>;
  handleSelectVoice: (voiceKey: string) => void; 
  handleSetSubtitleLanguage: (lang: 'en' | 'bilingual') => void;
  setIsVoiceSelectorOpen: Dispatch<SetStateAction<boolean>>; 
  setActiveBookTab: Dispatch<SetStateAction<'read' | 'vocabulary' | 'practice'>>; // <-- NEW SETTER

  // --- NEW FUNCTIONS FOR CLOZE TEST ---
  setHiddenWordCount: (count: number) => void;
  startClozeTest: () => void;
  stopClozeTest: () => void;
  handleHiddenWordClick: (wordIndex: number) => void;
  handleClozeTestInput: (value: string) => void;
  dismissKeyboard: () => void;
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
  // (SỬA ĐỔI) Khởi tạo state với mảng 'allBooks' đã import
  const [booksData] = useState<Book[]>(allBooks); // <-- THAY ĐỔI QUAN TRỌNG

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isBatchPlaylistModalOpen, setIsBatchPlaylistModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string | null>(null);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'en' | 'bilingual'>('en');
  const [isVoiceSelectorOpen, setIsVoiceSelectorOpen] = useState(false); 
  const [activeBookTab, setActiveBookTab] = useState<'read' | 'vocabulary' | 'practice'>('read'); // <-- NEW STATE

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

  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    WORD_TO_CARD_MAP.forEach(card => {
      tempMap.set(card.vocabulary.word.toLowerCase(), card.vocabulary);
    });
    setVocabMap(tempMap);
    setIsLoadingVocab(false);
  }, []);

  const currentBook = useMemo(() => booksData.find(book => book.id === selectedBookId), [booksData, selectedBookId]);

  const isViSubAvailable = useMemo(() => !!currentBook?.contentVi, [currentBook]);

  const displayedContent = useMemo(() => {
    return currentBook?.content || '';
  }, [currentBook]);

  useEffect(() => {
    setSubtitleLanguage('en');
    stopClozeTest();
    setActiveBookTab('read'); // <-- RESET TAB ON BOOK CHANGE
  }, [selectedBookId]);

  const availableVoices = useMemo(() => currentBook?.audioUrls ? Object.keys(currentBook.audioUrls) : [], [currentBook]);
  const currentAudioUrl = useMemo(() => selectedVoiceKey ? currentBook?.audioUrls?.[selectedVoiceKey] : null, [selectedVoiceKey, currentBook]);

  useEffect(() => {
    setSelectedVoiceKey(availableVoices.length > 0 ? availableVoices[0] : null);
  }, [availableVoices]);

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
  }, [currentBook, hiddenWordCount]);

  const stopClozeTest = () => {
    setIsClozeTestActive(false);
    setHiddenWords(new Map());
    setActiveHiddenWordIndex(null);
  };

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

  const handleWordClick = (word: string) => {
    if (isClozeTestActive) return;
    const normalizedWord = word.toLowerCase();
    const foundCard = WORD_TO_CARD_MAP.get(normalizedWord);
    if (foundCard) {
      setSelectedVocabCard(foundCard);
      setShowVocabDetail(true);
    }
  };

  const closeVocabDetail = () => { setSelectedVocabCard(null); setShowVocabDetail(false); };
  const togglePlayPause = () => { if (!audioPlayerRef.current) return; isAudioPlaying ? audioPlayerRef.current.pause() : audioPlayerRef.current.play().catch(console.error); };
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => { if (audioPlayerRef.current) { const newTime = Number(event.target.value); audioPlayerRef.current.currentTime = newTime; setAudioCurrentTime(newTime); } };
  const togglePlaybackSpeed = () => { const speeds = [1.0, 1.25, 1.5]; const currentIndex = speeds.indexOf(playbackSpeed); setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]); };
  
  const handleSelectVoice = (voiceKey: string) => {
    setSelectedVoiceKey(voiceKey);
    setIsVoiceSelectorOpen(false); // Automatically close popup on selection
  };

  const handleSetSubtitleLanguage = (lang: 'en' | 'bilingual') => {
    if (isViSubAvailable) setSubtitleLanguage(lang);
  };

  const value: EbookContextType = {
    booksData, selectedBookId, vocabMap, isLoadingVocab, selectedVocabCard, showVocabDetail,
    isAudioPlaying, audioCurrentTime, audioDuration, playbackSpeed, isSidebarOpen,
    currentUser, playlists, isBatchPlaylistModalOpen, isStatsModalOpen,
    selectedVoiceKey, audioPlayerRef, currentBook, availableVoices, currentAudioUrl,
    bookVocabularyCardIds, bookStats, handleSelectBook, handleBackToLibrary,
    handleWordClick, closeVocabDetail, togglePlayPause, handleSeek,
    togglePlaybackSpeed, toggleSidebar, setIsBatchPlaylistModalOpen,
    setIsStatsModalOpen, 
    handleSelectVoice, 
    subtitleLanguage, isViSubAvailable, displayedContent, handleSetSubtitleLanguage,
    isVoiceSelectorOpen, setIsVoiceSelectorOpen,
    activeBookTab, setActiveBookTab, // <-- EXPOSE NEW STATE & SETTER
    exampleSentences: exampleData,
    isClozeTestActive, hiddenWordCount, hiddenWords, activeHiddenWordIndex, correctlyGuessedCount,
    setHiddenWordCount, startClozeTest, stopClozeTest, handleHiddenWordClick, handleClozeTestInput, dismissKeyboard,
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
