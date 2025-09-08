--- START OF FILE ebook-ui.tsx (1).txt ---

// --- START OF FILE game.tsx (FIXED) ---

import React, { useMemo, useState, useEffect } from 'react'; // <-- LỖI ĐÃ ĐƯỢỢC SỬA Ở ĐÂY
import { EbookProvider, useEbook, Book, Vocabulary, PhraseSentence } from './ebook-context.tsx';

// --- COMPONENT & MODAL IMPORTS ---
import FlashcardDetailModal from '../story/flashcard.tsx';
import AddToPlaylistModal from '../AddToPlaylistModal.tsx';
import PhraseDetailModal from '../PhraseDetailModal.tsx';

// --- ICONS (Copied from original file for self-containment) ---
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const StatsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM9 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm4-5a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const ChevronLeftIcon = ({ className }: { className: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);
const ChevronRightIcon = ({ className }: { className: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);

// --- HELPER FUNCTION ---
const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const category = book.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};

// --- UI COMPONENTS (Copied from original file) ---
const VoiceStepper: React.FC<{ currentVoice: string; onNavigate: (direction: 'next' | 'previous') => void; availableVoiceCount: number; }> = ({ currentVoice, onNavigate, availableVoiceCount }) => {
  if (availableVoiceCount <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm p-1 rounded-full border border-white/25">
      <button onClick={() => onNavigate('previous')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors duration-200" aria-label="Giọng đọc trước"><ChevronLeftIcon className="w-3 h-3 text-white/80" /></button>
      <div className="text-center w-24 overflow-hidden"><span key={currentVoice} className="text-xs font-semibold text-white animate-fade-in-short">{currentVoice}</span></div>
      <button onClick={() => onNavigate('next')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors duration-200" aria-label="Giọng đọc tiếp theo"><ChevronRightIcon className="w-3 h-3 text-white/80" /></button>
      <style jsx>{` @keyframes fade-in-short { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-short { animation: fade-in-short 0.25s ease-out forwards; } `}</style>
    </div>
  );
};

const BookSidebar: React.FC<{ isOpen: boolean; onClose: () => void; book: Book | undefined; isDarkMode: boolean; toggleDarkMode: () => void; }> = ({ isOpen, onClose, book, isDarkMode, toggleDarkMode }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  return (
    <><div className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" /><div className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between p-4 border-b dark:border-gray-700"><h2 className="text-lg font-semibold dark:text-white truncate">{book?.title || "Menu"}</h2><button onClick={onClose} className="p-1.5 rounded-full dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Đóng menu"><XIcon /></button></div><div className="p-4 space-y-6 overflow-y-auto flex-grow"><div><h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nội dung sách</h3><ul className="space-y-1">{['Chương 1: Giới thiệu', 'Chương 2: Phát triển câu chuyện', 'Chương 3: Cao trào', 'Chương 4: Kết luận', 'Phụ lục'].map(item => (<li key={item}><a href="#" className="block px-3 py-2 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{item}</a></li>))}</ul></div><hr className="dark:border-gray-700" /><div><h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cài đặt hiển thị</h3><div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><span className="dark:text-gray-300">Chế độ tối</span><button onClick={toggleDarkMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} role="switch" aria-checked={isDarkMode}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} /></button></div></div></div><div className="p-4 border-t dark:border-gray-700"><p className="text-xs text-center text-gray-500 dark:text-gray-400">© 2024 Ebook Reader</p></div></div></>
  );
};

const BookStatsModal: React.FC<{ isOpen: boolean; onClose: () => void; stats: any; bookTitle: string; vocabMap: Map<string, Vocabulary>; }> = ({ isOpen, onClose, stats, bookTitle, vocabMap }) => {
    const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
    const { inDictionaryWords, outOfDictionaryWords } = useMemo(() => {
        const inDict: [string, number][] = [], outDict: [string, number][] = [];
        if (stats) {
            for (const [word, count] of stats.wordFrequencies.entries()) {
                if (vocabMap.has(word)) inDict.push([word, count]);
                else outDict.push([word, count]);
            }
        }
        return { inDictionaryWords: inDict, outOfDictionaryWords: outDict };
    }, [stats, vocabMap]);
    useEffect(() => { if(isOpen) setActiveTab('in'); }, [isOpen]);
    if (!isOpen || !stats) return null;
    const StatCard = ({ label, value }: { label: string, value: any }) => (<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center shadow"><p className="text-sm text-gray-600 dark:text-gray-300">{label}</p><p className="text-2xl font-bold dark:text-white">{value.toLocaleString()}</p></div>);
    const TabButton = ({ isActive, onClick, label, count }: { isActive: boolean, onClick: any, label: string, count: number }) => (<button onClick={onClick} className={`flex-1 text-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/50'}`} aria-current={isActive ? 'page' : undefined}>{label}<span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600'}`}>{count}</span></button>);
    return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}><div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b dark:border-gray-700"><h2 className="text-lg font-semibold dark:text-white">Thống kê</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Đóng"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Đóng" className="w-6 h-6" /></button></div><div className="p-6 overflow-y-auto space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><StatCard label="Tổng số từ" value={stats.totalWords} /><StatCard label="Từ vựng duy nhất" value={stats.uniqueWordsCount} /><StatCard label="Có sẵn" value={stats.vocabMatchCount} /><StatCard label="Chưa có" value={stats.vocabMismatchCount} /></div><div><h3 className="text-md font-semibold dark:text-gray-300 mb-3">Tần suất từ vựng</h3><div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1 mb-4"><TabButton isActive={activeTab === 'in'} onClick={() => setActiveTab('in')} label="Có sẵn" count={inDictionaryWords.length} /><TabButton isActive={activeTab === 'out'} onClick={() => setActiveTab('out')} label="Chưa có" count={outOfDictionaryWords.length} /></div><div className="p-1 max-h-64 overflow-y-auto min-h-[10rem]"><ul className="space-y-1">{activeTab === 'in' && inDictionaryWords.map(([word, count]) => (<li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60"><span className="font-medium text-blue-600 dark:text-blue-400">{word}</span><span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{count} lần</span></li>))}{activeTab === 'out' && outOfDictionaryWords.map(([word, count]) => (<li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60"><span className="font-medium dark:text-gray-300">{word}</span><span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{count} lần</span></li>))}{activeTab === 'in' && inDictionaryWords.length === 0 && <div className="flex items-center justify-center h-full min-h-[8rem]"><p className="text-center text-gray-500">Không có từ nào có sẵn.</p></div>}{activeTab === 'out' && outOfDictionaryWords.length === 0 && <div className="flex items-center justify-center h-full min-h-[8rem]"><p className="text-center text-gray-500">Tất cả từ đã có sẵn.</p></div>}</ul></div></div></div></div></div>);
};

// --- EbookReaderContent Component (The UI) ---
const EbookReaderContent: React.FC = () => {
  const {
    // State & Derived State
    selectedBookId, isDarkMode, booksData, currentBook, isSidebarOpen, audioPlayerRef,
    isAudioPlaying, audioCurrentTime, audioDuration, playbackSpeed, highlightMode,
    selectedVocabCard, showVocabDetail, isBatchPlaylistModalOpen, bookVocabularyCardIds,
    currentUser, playlists, selectedPhrase, isStatsModalOpen, bookStats, vocabMap,
    availableVoices, selectedVoiceKey, isLoadingVocab, phraseRegex, phraseMap,

    // Functions
    handleBackToLibrary, toggleSidebar, setIsDarkMode, handleSelectBook, setIsBatchPlaylistModalOpen,
    setIsStatsModalOpen, setHighlightMode, handleWordClick, closeVocabDetail, handlePhraseClick,
    closePhraseDetail, togglePlayPause, handleSeek, togglePlaybackSpeed, handleVoiceChange
  } = useEbook();

  const [showTranslation, setShowTranslation] = useState(false);
  // Reset to English view whenever the book changes to ensure it's the default.
  useEffect(() => {
    setShowTranslation(false);
  }, [selectedBookId]);

  const groupedBooks = useMemo(() => groupBooksByCategory(booksData), [booksData]);

  const processedBookContent = useMemo(() => {
    if (!currentBook) return '';
    // If the book content doesn't have our translate tag, return it directly.
    if (!currentBook.content.includes('<translate>')) return currentBook.content;

    const contentParts = currentBook.content.split(/(<translate>[\s\S]*?<\/translate>)/g).filter(Boolean);
    let combinedContent = '';
    contentParts.forEach(part => {
        if (part.startsWith('<translate>')) {
            const enMatch = part.match(/<en>([\s\S]*?)<\/en>/);
            const viMatch = part.match(/<vi>([\s\S]*?)<\/vi>/);
            const enContent = enMatch ? enMatch[1] : '';
            const viContent = viMatch ? viMatch[1] : '';
            combinedContent += showTranslation ? viContent : enContent;
        } else {
            combinedContent += part;
        }
    });
    return combinedContent;
  }, [currentBook, showTranslation]);

  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="text-center p-10 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
    if (!currentBook) return <div className="text-center p-10 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;
    const contentLines = processedBookContent.trim().split(/\n+/);
    return (
      <div className="font-['Inter',_sans-serif] dark:text-gray-200 px-2 sm:px-4 pb-24">
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
          let renderableParts: (JSX.Element | string)[];
          if (highlightMode === 'phrase' && phraseRegex) {
              const parts = line.split(phraseRegex);
              renderableParts = parts.map((part, partIndex) => {
                  const foundPhrase = phraseMap.get(part.toLowerCase());
                  if (foundPhrase) return <span key={`${index}-${partIndex}`} className="font-semibold text-green-600 dark:text-green-400 hover:underline cursor-pointer bg-green-50 dark:bg-green-500/10 rounded px-1" onClick={() => handlePhraseClick(foundPhrase)}>{part}</span>;
                  return part;
              });
          } else {
              const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);
              renderableParts = parts.map((part, partIndex) => {
                if (!part) return null;
                if (/^\w+$/.test(part) && vocabMap.has(part.toLowerCase())) return <span key={`${index}-${partIndex}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => handleWordClick(part)}>{part}</span>;
                return <span key={`${index}-${partIndex}`}>{part}</span>;
              }).filter(Boolean) as JSX.Element[];
          }
          const isChapterTitle = index === 0 && line.length < 60;
          if (isChapterTitle) return <h2 key={`line-${index}`} className="text-2xl sm:text-3xl font-bold dark:text-white mt-2 mb-6 text-center">{renderableParts}</h2>;
          return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">{renderableParts}</p>;
        })}
      </div>
    );
  };
  
  const renderLibrary = () => (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <section key={category}>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            {category === 'Technology & Future' ? (
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/youtube-logo.png" alt="YouTube" className="h-8" />
            ) : (
              <h2 className="text-xl md:text-2xl font-bold dark:text-white">{category}</h2>
            )}
            {/* --- NÚT ĐÃ ĐƯỢC THIẾT KẾ LẠI --- */}
            <button className="text-sm font-medium px-3 py-1 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700/50 transition-colors dark:bg-gray-700/50 dark:hover:bg-gray-600/50">
              See All
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
            {booksInCategory.map(book => (
              <div key={book.id} className="flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer group transform hover:-translate-y-1.5 transition-duration-200" onClick={() => handleSelectBook(book.id)}>
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-2 group-hover:shadow-xl">
                  <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-semibold dark:text-gray-200 truncate group-hover:text-blue-600">{book.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {selectedBookId && (
        <header className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-20 py-2 sm:py-3">
            <button onClick={toggleSidebar} className="p-2 rounded-full dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Mở menu"><MenuIcon /></button>
            <button onClick={handleBackToLibrary} className="flex items-center h-8 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600" aria-label="Quay lại Thư viện">
                <span className="bg-gray-400 dark:bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/arrow.png" alt="Back" className="w-5 h-5" /></span>
                <span className="ml-1.5 mr-2.5 font-semibold text-sm">BACK</span>
            </button>
        </header>
      )}

      {currentBook && <BookSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} book={currentBook} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850">{renderLibrary()}</main>
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
          <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10">
            {currentBook && (
              <div className="mb-8 pb-4 border-b dark:border-gray-700">
                <h1 className="text-3xl font-bold dark:text-white text-center mb-2">{currentBook.title}</h1>
                <p className="text-md text-center text-gray-500 dark:text-gray-400">Tác giả: {currentBook.author}</p>
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                  {currentUser && bookVocabularyCardIds.length > 0 && (<button onClick={() => setIsBatchPlaylistModalOpen(true)} className="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" /><path d="M9 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" /></svg>Lưu {bookVocabularyCardIds.length} từ vựng</button>)}
                  <button onClick={() => setIsStatsModalOpen(true)} className="inline-flex items-center px-4 py-2 border dark:border-gray-600 text-sm font-medium rounded-md shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><StatsIcon />Thống kê Sách</button>
                </div>
                <div className="mt-6 flex flex-col items-center gap-4">
                  <div className="inline-flex rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 p-1">
                    <button onClick={() => setHighlightMode('word')} className={`px-4 py-2 text-sm font-medium rounded-md ${highlightMode === 'word' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200'}`}>In đậm từ đơn</button>
                    <button onClick={() => setHighlightMode('phrase')} className={`px-4 py-2 text-sm font-medium rounded-md ${highlightMode === 'phrase' ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200'}`}>In đậm cụm từ</button>
                  </div>
                  {currentBook && currentBook.content.includes('<translate>') && (
                    <div className="inline-flex rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 p-1">
                        <button onClick={() => setShowTranslation(false)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!showTranslation ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>English</button>
                        <button onClick={() => setShowTranslation(true)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${showTranslation ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Tiếng Việt</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {renderBookContent()}
          </div>
        </main>
      )}

      <audio ref={audioPlayerRef} />
      
      {selectedBookId && currentBook?.audioUrls && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md p-3 z-30">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-2">
            {availableVoices.length > 1 && <VoiceStepper currentVoice={selectedVoiceKey || '...'} onNavigate={handleVoiceChange} availableVoiceCount={availableVoices.length} />}
            <div className="flex items-center w-full space-x-3 sm:space-x-4">
              <button onClick={togglePlayPause} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700" aria-label={isAudioPlaying ? "Tạm dừng" : "Phát"}>{isAudioPlaying ? <PauseIcon /> : <PlayIcon />}</button>
              <div className="flex-grow flex items-center space-x-2">
                <span className="text-xs dark:text-gray-400 w-10 text-center">{formatTime(audioCurrentTime)}</span>
                <input type="range" min="0" max={audioDuration || 0} value={audioCurrentTime} onChange={handleSeek} className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg cursor-pointer accent-blue-600" aria-label="Tua audio" />
                <span className="text-xs dark:text-gray-400 w-10 text-center">{formatTime(audioDuration)}</span>
              </div>
              <button onClick={togglePlaybackSpeed} className="px-4 py-2 text-sm font-semibold rounded-full border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700">{playbackSpeed}x</button>
            </div>
          </div>
        </div>
      )}

      {selectedVocabCard && showVocabDetail && <FlashcardDetailModal selectedCard={selectedVocabCard} showVocabDetail={showVocabDetail} exampleSentencesData={[]} onClose={closeVocabDetail} currentVisualStyle="default" />}
      {isBatchPlaylistModalOpen && <AddToPlaylistModal isOpen={isBatchPlaylistModalOpen} onClose={() => setIsBatchPlaylistModalOpen(false)} cardIds={bookVocabularyCardIds} currentUser={currentUser} existingPlaylists={playlists} />}
      <PhraseDetailModal isOpen={!!selectedPhrase} onClose={closePhraseDetail} phrase={selectedPhrase} />
      <BookStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={bookStats} bookTitle={currentBook?.title || ''} vocabMap={vocabMap} />
    </div>
  );
};

// --- The Main Exported Component (Wrapper) ---
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  return (
    <EbookProvider hideNavBar={hideNavBar} showNavBar={showNavBar}>
      <EbookReaderContent />
    </EbookProvider>
  );
};

export default EbookReader;

// --- END OF FILE game.tsx (FIXED) ---
