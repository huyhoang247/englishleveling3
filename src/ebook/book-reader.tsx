// --- START OF FILE BookReaderView.tsx ---

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Book } from '../books-data.ts';
import FlashcardDetailModal from '../story/flashcard';
import AddToPlaylistModal from '../AddToPlaylistModal';
import PhraseDetailModal from '../PhraseDetailModal';
import { gameImageUrls } from ' ./voca-data/image-url';
import { defaultVocabulary } from './voca-data/list-vocabulary';

// --- Icons ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM9 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm4-5a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const ChevronLeftIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const ChevronRightIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

// --- Interfaces ---
interface Vocabulary {
  word: string; meaning: string; example: string; phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp"; synonyms: string[]; antonyms: string[];
}
interface Flashcard {
  id: number; imageUrl: { default: string; anime?: string; comic?: string; realistic?: string; };
  isFavorite: boolean; vocabulary: Vocabulary;
}
interface Playlist { id: string; name: string; cardIds: number[]; }
interface PhraseSentence {
  parts: { english: string; vietnamese: string; }[]; fullEnglish: string; fullVietnamese: string;
}
interface BookStats {
  totalWords: number; uniqueWordsCount: number; vocabMatchCount: number;
  vocabMismatchCount: number; wordFrequencies: Map<string, number>;
}

// --- Sub-components (VoiceStepper, BookSidebar, BookStatsModal) ---
const VoiceStepper: React.FC<{
  currentVoice: string; onNavigate: (direction: 'next' | 'previous') => void; availableVoiceCount: number;
}> = ({ currentVoice, onNavigate, availableVoiceCount }) => {
  if (availableVoiceCount <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm p-1 rounded-full border border-white/25">
      <button onClick={() => onNavigate('previous')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors duration-200" aria-label="Giọng đọc trước"><ChevronLeftIcon className="w-3 h-3 text-white/80" /></button>
      <div className="text-center w-24 overflow-hidden"><span key={currentVoice} className="text-xs font-semibold text-white animate-fade-in-short">{currentVoice}</span></div>
      <button onClick={() => onNavigate('next')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors duration-200" aria-label="Giọng đọc tiếp theo"><ChevronRightIcon className="w-3 h-3 text-white/80" /></button>
      <style jsx>{`@keyframes fade-in-short { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-short { animation: fade-in-short 0.25s ease-out forwards; }`}</style>
    </div>
  );
};

interface BookSidebarProps {
  isOpen: boolean; onClose: () => void; book: Book;
  isDarkMode: boolean; toggleDarkMode: () => void;
}
const BookSidebar: React.FC<BookSidebarProps> = ({ isOpen, onClose, book, isDarkMode, toggleDarkMode }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'; else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" />
            <div className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} role="dialog" aria-modal="true" aria-labelledby="sidebar-title">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="sidebar-title" className="text-lg font-semibold text-gray-800 dark:text-white truncate">{book?.title || "Menu"}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Đóng menu"><XIcon /></button>
                </div>
                <div className="p-4 space-y-6 overflow-y-auto flex-grow">
                     <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nội dung sách</h3>
                        <ul className="space-y-1">{['Chương 1: Giới thiệu', 'Chương 2: Phát triển câu chuyện', 'Chương 3: Cao trào', 'Chương 4: Kết luận', 'Phụ lục'].map(item => (<li key={item}><a href="#" className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{item}</a></li>))}</ul>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cài đặt hiển thị</h3>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <span className="text-gray-700 dark:text-gray-300">Chế độ tối</span>
                            <button onClick={toggleDarkMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`} role="switch" aria-checked={isDarkMode}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"><p className="text-xs text-gray-500 dark:text-gray-400 text-center">© 2024 Ebook Reader</p></div>
            </div>
        </>
    );
};

interface BookStatsModalProps {
    isOpen: boolean; onClose: () => void; stats: BookStats | null; bookTitle: string; vocabMap: Map<string, Vocabulary>;
}
const BookStatsModal: React.FC<BookStatsModalProps> = ({ isOpen, onClose, stats, bookTitle, vocabMap }) => {
    const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
    const { inDictionaryWords, outOfDictionaryWords } = useMemo(() => {
        const inDict: [string, number][] = [], outDict: [string, number][] = [];
        if (stats) {
            for (const [word, count] of stats.wordFrequencies.entries()) {
                if (vocabMap.has(word)) inDict.push([word, count]); else outDict.push([word, count]);
            }
        }
        return { inDictionaryWords: inDict, outOfDictionaryWords: outDict };
    }, [stats, vocabMap]);

    useEffect(() => { if(isOpen) setActiveTab('in'); }, [isOpen]);
    if (!isOpen || !stats) return null;

    const StatCard = ({ label, value }: { label: string, value: string | number }) => (<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center shadow"><p className="text-sm text-gray-600 dark:text-gray-300">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p></div>);
    const TabButton = ({ isActive, onClick, label, count }: { isActive: boolean, onClick: () => void, label: string, count: number }) => (<button onClick={onClick} className={`flex-1 text-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70'}`}><>{label}<span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>{count}</span></></button>);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Thống kê</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Đóng" className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Tổng số từ" value={stats.totalWords} /><StatCard label="Từ vựng duy nhất" value={stats.uniqueWordsCount} /><StatCard label="Có sẵn" value={stats.vocabMatchCount} /><StatCard label="Chưa có" value={stats.vocabMismatchCount} />
                    </div>
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Tần suất từ vựng</h3>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1 mb-4">
                            <TabButton isActive={activeTab === 'in'} onClick={() => setActiveTab('in')} label="Có sẵn" count={inDictionaryWords.length} /><TabButton isActive={activeTab === 'out'} onClick={() => setActiveTab('out')} label="Chưa có" count={outOfDictionaryWords.length} />
                        </div>
                        <div className="p-1 max-h-64 overflow-y-auto min-h-[10rem]">
                            <ul className="space-y-1">
                                {activeTab === 'in' && inDictionaryWords.map(([word, count]) => (<li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60"><span className="font-medium text-blue-600 dark:text-blue-400">{word}</span><span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-full">{count} lần</span></li>))}
                                {activeTab === 'out' && outOfDictionaryWords.map(([word, count]) => (<li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60"><span className="font-medium text-gray-700 dark:text-gray-300">{word}</span><span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-full">{count} lần</span></li>))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component Props ---
interface BookReaderViewProps {
  book: Book; onBackToLibrary: () => void; vocabMap: Map<string, Vocabulary>;
  phraseMap: Map<string, PhraseSentence>; phraseRegex: RegExp | null;
  currentUser: User | null; playlists: Playlist[];
  isDarkMode: boolean; toggleDarkMode: () => void;
}

const BookReaderView: React.FC<BookReaderViewProps> = ({
  book, onBackToLibrary, vocabMap, phraseMap, phraseRegex,
  currentUser, playlists, isDarkMode, toggleDarkMode,
}) => {
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBatchPlaylistModalOpen, setIsBatchPlaylistModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [highlightMode, setHighlightMode] = useState<'word' | 'phrase'>('word');
  const [selectedPhrase, setSelectedPhrase] = useState<PhraseSentence | null>(null);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string | null>(null);

  const availableVoices = useMemo(() => book?.audioUrls ? Object.keys(book.audioUrls) : [], [book]);
  const currentAudioUrl = selectedVoiceKey ? book?.audioUrls?.[selectedVoiceKey] : null;

  useEffect(() => {
    if (availableVoices.length > 0) setSelectedVoiceKey(availableVoices[0]);
    else setSelectedVoiceKey(null);
  }, [availableVoices]);

  const bookVocabularyCardIds = useMemo(() => {
    if (!book || vocabMap.size === 0) return [];
    const wordsInBook = new Set<string>();
    (book.content.match(/\b\w+\b/g) || []).forEach(word => {
        if (vocabMap.has(word.toLowerCase())) wordsInBook.add(word.toLowerCase());
    });
    const cardIdMap = new Map(defaultVocabulary.map((word, index) => [word.toLowerCase(), index + 1]));
    return Array.from(wordsInBook).map(word => cardIdMap.get(word)).filter((id): id is number => id !== undefined);
  }, [book, vocabMap]);
  
  const bookStats = useMemo<BookStats | null>(() => {
    if (!book || vocabMap.size === 0) return null;
    const words = book.content.match(/\b\w+\b/g) || [];
    const wordFrequencies = new Map<string, number>();
    const uniqueWords = new Set<string>();
    words.forEach(word => {
      const normalizedWord = word.toLowerCase();
      wordFrequencies.set(normalizedWord, (wordFrequencies.get(normalizedWord) || 0) + 1);
      uniqueWords.add(normalizedWord);
    });
    let vocabMatchCount = 0;
    uniqueWords.forEach(word => { if (vocabMap.has(word)) vocabMatchCount++; });
    const sortedFrequencies = new Map([...wordFrequencies.entries()].sort((a, b) => b[1] - a[1]));
    return {
      totalWords: words.length, uniqueWordsCount: uniqueWords.size,
      vocabMatchCount, vocabMismatchCount: uniqueWords.size - vocabMatchCount,
      wordFrequencies: sortedFrequencies
    };
  }, [book, vocabMap]);

  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (currentAudioUrl && audio) {
        if (audio.src !== currentAudioUrl) {
            audio.src = currentAudioUrl;
            audio.load();
        }
        setIsAudioPlaying(false); setAudioCurrentTime(0); setAudioDuration(0);
    } else if (audio && !currentAudioUrl) {
        audio.pause(); audio.removeAttribute('src'); audio.load();
        setIsAudioPlaying(false); setAudioCurrentTime(0); setAudioDuration(0);
    }
  }, [currentAudioUrl]);

  useEffect(() => {
    if (audioPlayerRef.current) audioPlayerRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord);
    if (foundVocab) {
      const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === normalizedWord);
      const cardImageUrl = (vocabIndex !== -1 && vocabIndex < gameImageUrls.length) ? gameImageUrls[vocabIndex] : `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`;
      setSelectedVocabCard({
        id: vocabIndex !== -1 ? vocabIndex + 1 : Date.now(),
        imageUrl: { default: cardImageUrl }, isFavorite: false, vocabulary: foundVocab,
      });
      setShowVocabDetail(true);
    }
  };
  
  const closeVocabDetail = () => { setShowVocabDetail(false); setSelectedVocabCard(null); };
  const handlePhraseClick = (phrase: PhraseSentence) => setSelectedPhrase(phrase);
  const closePhraseDetail = () => setSelectedPhrase(null);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (isAudioPlaying) audioPlayerRef.current.pause();
    else audioPlayerRef.current.play().catch(console.error);
    setIsAudioPlaying(!isAudioPlaying);
  };
  const handleTimeUpdate = () => { if (audioPlayerRef.current) setAudioCurrentTime(audioPlayerRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (audioPlayerRef.current) setAudioDuration(audioPlayerRef.current.duration); };
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPlayerRef.current) audioPlayerRef.current.currentTime = Number(event.target.value);
  };
  const togglePlaybackSpeed = () => {
    const speeds = [1.0, 1.25, 1.5];
    setPlaybackSpeed(speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length]);
  };
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const mins = Math.floor(time / 60); const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleVoiceChange = (direction: 'next' | 'previous') => {
      if (availableVoices.length <= 1 || !selectedVoiceKey) return;
      const currentIndex = availableVoices.indexOf(selectedVoiceKey);
      let nextIndex = (direction === 'next') ? (currentIndex + 1) % availableVoices.length : (currentIndex - 1 + availableVoices.length) % availableVoices.length;
      setSelectedVoiceKey(availableVoices[nextIndex]);
  };

  const renderBookContent = () => {
    const contentLines = book.content.trim().split(/\n+/);
    return (
      <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4 pb-24">
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
          let renderableParts: (JSX.Element | string)[];
          if (highlightMode === 'phrase' && phraseRegex) {
              renderableParts = line.split(phraseRegex).map((part, partIndex) => {
                  const foundPhrase = phraseMap.get(part.toLowerCase());
                  if (foundPhrase) return <span key={`${index}-${partIndex}`} className="font-semibold text-green-600 dark:text-green-400 hover:underline cursor-pointer bg-green-50 dark:bg-green-500/10 rounded px-1" onClick={() => handlePhraseClick(foundPhrase)}>{part}</span>;
                  return part;
              });
          } else {
              renderableParts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g).map((part, partIndex) => {
                if (!part) return null;
                if (/^\w+$/.test(part) && vocabMap.has(part.toLowerCase())) {
                  return <span key={`${index}-${partIndex}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => handleWordClick(part)}>{part}</span>;
                }
                return <span key={`${index}-${partIndex}`}>{part}</span>;
              }).filter(Boolean) as JSX.Element[];
          }
          const isChapter = (index === 0 && line.length < 60) || line.toLowerCase().startsWith('chapter');
          if (isChapter) return <h2 key={`line-${index}`} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-6 text-center">{renderableParts}</h2>;
          return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">{renderableParts}</p>;
        })}
      </div>
    );
  };
  
  return (
    <>
      <header className={`flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex-shrink-0 sticky top-0 z-20 transition-all duration-300 py-2 sm:py-3`}>
        <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none" aria-label="Mở menu"><MenuIcon /></button>
        <button onClick={onBackToLibrary} className="flex items-center h-8 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Quay lại Thư viện">
            <span className="bg-gray-400 dark:bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/arrow.png" alt="Back" className="w-5 h-5" /></span>
            <span className="ml-1.5 mr-2.5 font-semibold text-sm">BACK</span>
        </button>
      </header>

      <BookSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} book={book} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
        <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10 relative">
          <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">{book.title}</h1>
            {book.author && <p className="text-sm sm:text-md text-center text-gray-500 dark:text-gray-400">Tác giả: {book.author}</p>}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
              {currentUser && bookVocabularyCardIds.length > 0 && (<button onClick={() => setIsBatchPlaylistModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Lưu {bookVocabularyCardIds.length} từ vựng</button>)}
              <button onClick={() => setIsStatsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><StatsIcon />Thống kê Sách</button>
            </div>
            <div className="mt-6 flex justify-center"><div className="inline-flex rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 p-1">
                <button onClick={() => setHighlightMode('word')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${highlightMode === 'word' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>In đậm từ đơn</button>
                <button onClick={() => setHighlightMode('phrase')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${highlightMode === 'phrase' ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>In đậm cụm từ</button>
            </div></div>
          </div>
          {renderBookContent()}
        </div>
      </main>

      <audio ref={audioPlayerRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsAudioPlaying(true)} onPause={() => setIsAudioPlaying(false)} onEnded={() => { setIsAudioPlaying(false); setAudioCurrentTime(0);}} />
      
      {book?.audioUrls && Object.keys(book.audioUrls).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md shadow-top-lg p-3 z-30">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-2">
            {availableVoices.length > 1 && (<div className="flex justify-center w-full"><VoiceStepper currentVoice={selectedVoiceKey || '...'} onNavigate={handleVoiceChange} availableVoiceCount={availableVoices.length}/></div>)}
            <div className="flex items-center w-full space-x-3 sm:space-x-4">
              <button onClick={togglePlayPause} className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700" aria-label={isAudioPlaying ? "Tạm dừng" : "Phát"}>{isAudioPlaying ? <PauseIcon /> : <PlayIcon />}</button>
              <div className="flex-grow flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-center">{formatTime(audioCurrentTime)}</span>
                <input type="range" min="0" max={audioDuration || 0} value={audioCurrentTime} onChange={handleSeek} className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600" aria-label="Tua audio"/>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-center">{formatTime(audioDuration)}</span>
              </div>
              <button onClick={togglePlaybackSpeed} className="px-4 py-2 text-sm font-semibold rounded-full border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" aria-label={`Tốc độ ${playbackSpeed}x`}>{playbackSpeed}x</button>
            </div>
          </div>
        </div>
      )}

      {selectedVocabCard && showVocabDetail && <FlashcardDetailModal selectedCard={selectedVocabCard} showVocabDetail={showVocabDetail} exampleSentencesData={[]} onClose={closeVocabDetail} currentVisualStyle="default"/>}
      {isBatchPlaylistModalOpen && <AddToPlaylistModal isOpen={isBatchPlaylistModalOpen} onClose={() => setIsBatchPlaylistModalOpen(false)} cardIds={bookVocabularyCardIds} currentUser={currentUser} existingPlaylists={playlists}/>}
      <PhraseDetailModal isOpen={!!selectedPhrase} onClose={closePhraseDetail} phrase={selectedPhrase}/>
      <BookStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={bookStats} bookTitle={book?.title || ''} vocabMap={vocabMap}/>
    </>
  );
};

export default BookReaderView;
// --- END OF FILE BookReaderView.tsx ---
