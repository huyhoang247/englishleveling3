// --- START OF FILE EbookContext.tsx ---

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction
} from 'react';
import { auth, db } from '../firebase.js'; 
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// --- DATA IMPORTS ---
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';
import { defaultImageUrls as gameImageUrls } from '../voca-data/image-url.ts';
import { Book, sampleBooks as initialSampleBooks } from '../books-data.ts';
import { phraseData } from '../phrase-data-2.ts';

// --- TYPE DEFINITIONS ---
export interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

export interface Flashcard {
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

export interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

export interface PhraseSentence {
  parts: { english: string; vietnamese: string; }[];
  fullEnglish: string;
  fullVietnamese: string;
}

export interface BookStats {
  totalWords: number;
  uniqueWordsCount: number;
  vocabMatchCount: number;
  vocabMismatchCount: number;
  wordFrequencies: Map<string, number>;
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
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  currentUser: User | null;
  playlists: Playlist[];
  isBatchPlaylistModalOpen: boolean;
  isStatsModalOpen: boolean;
  highlightMode: 'word' | 'phrase';
  selectedPhrase: PhraseSentence | null;
  selectedVoiceKey: string | null;

  // Refs
  audioPlayerRef: React.RefObject<HTMLAudioElement>;

  // Derived State
  currentBook: Book | undefined;
  availableVoices: string[];
  currentAudioUrl: string | null | undefined;
  bookVocabularyCardIds: number[];
  bookStats: BookStats | null;
  phraseMap: Map<string, PhraseSentence>;
  phraseRegex: RegExp | null;

  // Functions & State Setters
  handleSelectBook: (bookId: string) => void;
  handleBackToLibrary: () => void;
  handleWordClick: (word: string) => void;
  closeVocabDetail: () => void;
  handlePhraseClick: (phrase: PhraseSentence) => void;
  closePhraseDetail: () => void;
  togglePlayPause: () => void;
  handleSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  togglePlaybackSpeed: () => void;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  toggleSidebar: () => void;
  setIsBatchPlaylistModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsStatsModalOpen: Dispatch<SetStateAction<boolean>>;
  setHighlightMode: Dispatch<SetStateAction<'word' | 'phrase'>>;
  handleVoiceChange: (direction: 'next' | 'previous') => void;
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
  const [highlightMode, setHighlightMode] = useState<'word' | 'phrase'>('word');
  const [selectedPhrase, setSelectedPhrase] = useState<PhraseSentence | null>(null);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string | null>(null);

  // --- HOOKS & LOGIC ---
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

  const { phraseMap, phraseRegex } = useMemo(() => {
    if (phraseData.length === 0) return { phraseMap: new Map(), phraseRegex: null };
    const sortedPhrases = [...phraseData].sort((a, b) => b.fullEnglish.length - a.fullEnglish.length);
    const tempMap = new Map<string, PhraseSentence>();
    const phraseStrings = sortedPhrases.map(phrase => {
      const lowerCasePhrase = phrase.fullEnglish.toLowerCase();
      tempMap.set(lowerCasePhrase, phrase);
      return lowerCasePhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    const regex = new RegExp(`(${phraseStrings.join('|')})`, 'gi');
    return { phraseMap: tempMap, phraseRegex: regex };
  }, []);

  const currentBook = useMemo(() => booksData.find(book => book.id === selectedBookId), [booksData, selectedBookId]);
  
  const availableVoices = useMemo(() => currentBook?.audioUrls ? Object.keys(currentBook.audioUrls) : [], [currentBook]);
  const currentAudioUrl = useMemo(() => selectedVoiceKey ? currentBook?.audioUrls?.[selectedVoiceKey] : null, [selectedVoiceKey, currentBook]);

  useEffect(() => {
    setSelectedVoiceKey(availableVoices.length > 0 ? availableVoices[0] : null);
  }, [availableVoices]);

  const bookVocabularyCardIds = useMemo(() => {
    if (!currentBook || vocabMap.size === 0) return [];
    const wordsInBook = new Set<string>();
    const allWords = currentBook.content.match(/\b\w+\b/g) || [];
    allWords.forEach(word => {
        if (vocabMap.has(word.toLowerCase())) wordsInBook.add(word.toLowerCase());
    });
    const cardIdMap = new Map(defaultVocabulary.map((word, index) => [word.toLowerCase(), index + 1]));
    return Array.from(wordsInBook).map(word => cardIdMap.get(word)).filter((id): id is number => id !== undefined);
  }, [currentBook, vocabMap]);

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


  // --- HANDLERS ---
  const handleSelectBook = (bookId: string) => setSelectedBookId(bookId);
  const handleBackToLibrary = () => setSelectedBookId(null);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord);
    if (foundVocab) {
      const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === normalizedWord);
      const cardImageUrl = (vocabIndex !== -1 && vocabIndex < gameImageUrls.length)
        ? gameImageUrls[vocabIndex]
        : `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`;
      
      setSelectedVocabCard({
        id: vocabIndex !== -1 ? vocabIndex + 1 : Date.now(),
        imageUrl: { default: cardImageUrl },
        isFavorite: false,
        vocabulary: foundVocab,
      });
      setShowVocabDetail(true);
    }
  };
  const closeVocabDetail = () => { setSelectedVocabCard(null); setShowVocabDetail(false); };

  const handlePhraseClick = (phrase: PhraseSentence) => setSelectedPhrase(phrase);
  const closePhraseDetail = () => setSelectedPhrase(null);

  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    isAudioPlaying ? audioPlayerRef.current.pause() : audioPlayerRef.current.play().catch(console.error);
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
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const handleVoiceChange = (direction: 'next' | 'previous') => {
      if (availableVoices.length <= 1 || !selectedVoiceKey) return;
      const currentIndex = availableVoices.indexOf(selectedVoiceKey);
      if (currentIndex === -1) return;
      const nextIndex = direction === 'next'
          ? (currentIndex + 1) % availableVoices.length
          : (currentIndex - 1 + availableVoices.length) % availableVoices.length;
      setSelectedVoiceKey(availableVoices[nextIndex]);
  };
  
  const value: EbookContextType = {
    booksData, selectedBookId, vocabMap, isLoadingVocab, selectedVocabCard, showVocabDetail,
    isAudioPlaying, audioCurrentTime, audioDuration, playbackSpeed, isDarkMode, isSidebarOpen,
    currentUser, playlists, isBatchPlaylistModalOpen, isStatsModalOpen, highlightMode,
    selectedPhrase, selectedVoiceKey, audioPlayerRef, currentBook, availableVoices, currentAudioUrl,
    bookVocabularyCardIds, bookStats, phraseMap, phraseRegex, handleSelectBook, handleBackToLibrary,
    handleWordClick, closeVocabDetail, handlePhraseClick, closePhraseDetail, togglePlayPause, handleSeek,
    togglePlaybackSpeed, setIsDarkMode, toggleSidebar, setIsBatchPlaylistModalOpen,
    setIsStatsModalOpen, setHighlightMode, handleVoiceChange,
  };

  return <EbookContext.Provider value={value}>{children}</EbookContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useEbook = (): EbookContextType => {
  const context = useContext(EbookContext);
  if (context === undefined) {
    throw new Error('useEbook must be used within an EbookProvider');
  }
  return context;
};

// --- END OF FILE EbookContext.tsx ---
