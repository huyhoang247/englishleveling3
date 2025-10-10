// --- START OF FILE game.tsx (FIXED & UPDATED) ---

import React, { useMemo, useState, useEffect } from 'react';
import { EbookProvider, useEbook, Book, Vocabulary, HiddenWordState, ExampleSentence } from './ebook-context.tsx';
import VirtualKeyboard from '../ui/keyboard.tsx'; 

// --- COMPONENT & MODAL IMPORTS ---
import FlashcardDetailModal from '../story/flashcard.tsx';
import AddToPlaylistModal from '../AddToPlaylistModal.tsx';
import BackButton from './back-button.tsx';
// PhraseDetailModal has been removed as it's no longer used.

// --- ICONS (Copied from original file for self-containment) ---
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const StatsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM9 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm4-5a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const ChevronLeftIcon = ({ className }: { className: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);
const ChevronRightIcon = ({ className }: { className: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);
const TranslateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4 13-4-4-4 4M19 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2z" /></svg>);


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
    isAudioPlaying, audioCurrentTime, audioDuration, playbackSpeed,
    selectedVocabCard, showVocabDetail, isBatchPlaylistModalOpen, bookVocabularyCardIds,
    currentUser, playlists, isStatsModalOpen, bookStats, vocabMap,
    availableVoices, selectedVoiceKey, isLoadingVocab,
    subtitleLanguage, isViSubAvailable, displayedContent,
    exampleSentences, // THÊM MỚI: Lấy dữ liệu câu ví dụ từ context

    // Functions
    handleBackToLibrary, toggleSidebar, setIsDarkMode, handleSelectBook, setIsBatchPlaylistModalOpen,
    setIsStatsModalOpen, handleWordClick, closeVocabDetail,
    togglePlayPause, handleSeek, togglePlaybackSpeed, handleVoiceChange,
    toggleSubtitleLanguage,

    // NEW CLOZE TEST VALUES
    isClozeTestActive,
    hiddenWordCount,
    hiddenWords,
    activeHiddenWordIndex,
    correctlyGuessedCount,
    setHiddenWordCount,
    startClozeTest,
    stopClozeTest,
    handleHiddenWordClick,
    handleClozeTestInput,
    dismissKeyboard,
  } = useEbook();

  const groupedBooks = useMemo(() => groupBooksByCategory(booksData), [booksData]);

  const pairedSentences = useMemo(() => {
    if (subtitleLanguage !== 'bilingual' || !currentBook?.content || !currentBook.contentVi) {
      return [];
    }
    const splitIntoSentences = (text: string) => text.match(/[^.!?]+[.!?]*/g) || [text];
    const enParagraphs = currentBook.content.trim().split(/\n+/).filter(p => p.trim());
    const viParagraphs = currentBook.contentVi.trim().split(/\n+/).filter(p => p.trim());
    const pairedContent: { en: string; vi: string; isHeader: boolean }[] = [];
    const minParagraphs = Math.min(enParagraphs.length, viParagraphs.length);

    for (let i = 0; i < minParagraphs; i++) {
      const enPara = enParagraphs[i].trim();
      const viPara = viParagraphs[i].trim();
      const isHeader = enPara.length < 80 && !enPara.includes('.') && !enPara.includes('?');
      if (isHeader) {
        pairedContent.push({ en: enPara, vi: viPara, isHeader: true });
      } else {
        const enSentences = splitIntoSentences(enPara).map(s => s.trim());
        const viSentences = splitIntoSentences(viPara).map(s => s.trim());
        const minSentences = Math.min(enSentences.length, viSentences.length);
        for (let j = 0; j < minSentences; j++) {
            if (enSentences[j] && viSentences[j]) {
                 pairedContent.push({ en: enSentences[j], vi: viSentences[j], isHeader: false });
            }
        }
      }
      if (i < minParagraphs - 1) {
          pairedContent.push({ en: '', vi: '', isHeader: false });
      }
    }
    return pairedContent;
  }, [currentBook, subtitleLanguage]);


  const renderHighlightedText = (line: string) => {
    const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);
    const renderableParts = parts.map((part, partIndex) => {
      if (!part) return null;
      if (/^\w+$/.test(part) && vocabMap.has(part.toLowerCase())) return <span key={partIndex} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => handleWordClick(part)}>{part}</span>;
      return <span key={partIndex}>{part}</span>;
    }).filter(Boolean) as JSX.Element[];
    return renderableParts;
  }

  const HiddenWordInput: React.FC<{
    wordState: HiddenWordState;
    index: number;
    onClick: () => void;
    isActive: boolean;
  }> = ({ wordState, index, onClick, isActive }) => {
      const { originalWord, userInput, status } = wordState;
      if (status === 'correct') {
          return (
              <span 
                  className="font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-1 py-0.5 rounded-md transition-all duration-300"
              >
                  {originalWord}
              </span>
          );
      }
      let containerClasses = `
          inline-block align-baseline
          min-w-14
          mx-1 px-1.5 pb-px
          cursor-pointer rounded-t-sm
          bg-gray-100/50 dark:bg-gray-700/40
          border-b-2 border-gray-300 dark:border-gray-600
          hover:border-blue-500
          transition-all duration-200
          text-left
      `;
      let textClasses = "font-bold text-gray-800 dark:text-gray-200";
      if (isActive) {
          containerClasses += " border-blue-500 ring-1 ring-blue-300/70";
      }
      if (status === 'incorrect') {
          containerClasses += " animate-shake border-red-500";
          textClasses = "font-bold text-red-500";
      }
      return (
          <span className={containerClasses} onClick={onClick}>
              <span className={textClasses}>
                  {userInput || <>&nbsp;</>}
              </span>
          </span>
      );
  };
  
  const ClozeTestControls = () => (
    <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <h4 className="font-semibold text-sm mr-4 dark:text-gray-200">Luyện tập điền từ</h4>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setHiddenWordCount(hiddenWordCount - 5)} disabled={hiddenWordCount <= 5} className="w-7 h-7 bg-white dark:bg-gray-600 rounded-md shadow-sm disabled:opacity-50">-</button>
                    <span className="font-bold w-10 text-center">{hiddenWordCount}</span>
                    <button onClick={() => setHiddenWordCount(hiddenWordCount + 5)} disabled={hiddenWordCount >= 100} className="w-7 h-7 bg-white dark:bg-gray-600 rounded-md shadow-sm disabled:opacity-50">+</button>
                </div>
            </div>
            <button
                onClick={isClozeTestActive ? stopClozeTest : startClozeTest}
                className={`px-4 py-2 text-sm font-bold rounded-md shadow transition-colors ${
                    isClozeTestActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
                {isClozeTestActive ? 'Dừng' : 'Bắt đầu'}
            </button>
        </div>
        {isClozeTestActive && (
             <div className="text-center mt-3 text-sm text-gray-600 dark:text-gray-300">
                Đã đoán đúng: <span className="font-bold">{correctlyGuessedCount} / {hiddenWords.size}</span>
            </div>
        )}
    </div>
  );

  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="text-center p-10 dark:text-gray-400 animate-pulse">Đang tải nội dung sách...</div>;
    if (!currentBook) return <div className="text-center p-10 dark:text-gray-400">Không tìm thấy nội dung sách.</div>;
    
    if (isClozeTestActive) {
        const paragraphs = currentBook.content.trim().split(/\n+/);
        let globalWordCounter = -1;

        return (
            <div className="font-['Inter',_sans_serif] dark:text-gray-200 px-2 sm:px-4 pb-24">
                {paragraphs.map((paragraph, pIndex) => {
                    if (paragraph.trim() === '') return <div key={`blank-${pIndex}`} className="h-3 sm:h-4"></div>;

                    const parts = paragraph.split(/(\b[a-zA-Z']+\b)/g);
                    
                    return (
                        <p key={`p-${pIndex}`} className="text-base sm:text-lg leading-loose sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">
                            {parts.map((part, partIndex) => {
                                if (/\b[a-zA-Z']+\b/.test(part)) {
                                    globalWordCounter++;
                                    const currentWordIndex = globalWordCounter;
                                    const hiddenWordState = hiddenWords.get(currentWordIndex);

                                    if (hiddenWordState) {
                                        return (
                                            <HiddenWordInput
                                                key={`hidden-${currentWordIndex}`}
                                                wordState={hiddenWordState}
                                                index={currentWordIndex}
                                                onClick={() => handleHiddenWordClick(currentWordIndex)}
                                                isActive={activeHiddenWordIndex === currentWordIndex}
                                            />
                                        );
                                    }
                                }
                                return <span key={`part-${partIndex}`}>{part}</span>;
                            })}
                        </p>
                    );
                })}
            </div>
        );
    }
    
    if (subtitleLanguage === 'bilingual') {
      return (
        <div className="font-['Inter',_sans_serif] dark:text-gray-200 px-2 sm:px-4 pb-24">
          {pairedSentences.map((pair, index) => {
            if (!pair.en && !pair.vi) {
                return <div key={`spacer-${index}`} className="h-4"></div>;
            }
            if (pair.isHeader) {
                return (
                    <div key={`pair-${index}`} className="my-6">
                        <h3 className="text-xl font-bold dark:text-white text-center">{renderHighlightedText(pair.en)}</h3>
                        <p className="text-lg text-center text-gray-600 dark:text-gray-400 italic mt-1">{pair.vi}</p>
                    </div>
                );
            }
            return (
              <div key={`pair-${index}`} className="mb-5">
                <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-800 dark:text-gray-200 text-left">
                  {renderHighlightedText(pair.en)}
                </p>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-600 dark:text-gray-400 italic text-left">
                  {pair.vi}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    const contentLines = displayedContent.trim().split(/\n+/);
    return (
      <div className="font-['Inter',_sans_serif] dark:text-gray-200 px-2 sm:px-4 pb-24">
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
          
          const isHeader = line.length < 80 && !line.includes('.') && !line.includes('?');

          if (subtitleLanguage === 'vi') {
             if (isHeader) return <h3 key={`line-${index}`} className="text-xl font-bold dark:text-white mt-6 mb-4 text-center">{line}</h3>;
            return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">{line}</p>;
          }
          
          const renderableParts = renderHighlightedText(line);
          if (isHeader) return <h3 key={`line-${index}`} className="text-xl font-bold dark:text-white mt-6 mb-4 text-center">{renderableParts}</h3>;
          return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 dark:text-gray-300 mb-4 text-left">{renderableParts}</p>;
        })}
      </div>
    );
  };
  
  const activeHiddenWordState = useMemo(() => {
      if (activeHiddenWordIndex === null) return null;
      return hiddenWords.get(activeHiddenWordIndex);
  }, [activeHiddenWordIndex, hiddenWords]);
  
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
  
  const getTranslateButtonText = () => {
    if (subtitleLanguage === 'en') return 'Xem bản dịch';
    if (subtitleLanguage === 'vi') return 'Xem song ngữ';
    return 'Xem bản gốc';
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {selectedBookId && (
        <header className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-20 py-2 sm:py-3">
            <BackButton onClick={handleBackToLibrary} />
            <button onClick={toggleSidebar} className="p-2 rounded-full dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Mở menu"><MenuIcon /></button>
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
                <div className="text-center mb-2">
                  <h1 className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1.5 text-xl font-semibold text-gray-800 dark:text-gray-200 shadow-sm">
                    {currentBook.title}
                  </h1>
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">Tác giả: {currentBook.author}</p>
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                  {currentUser && bookVocabularyCardIds.length > 0 && (<button onClick={() => setIsBatchPlaylistModalOpen(true)} className="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" /><path d="M9 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" /></svg>Lưu {bookVocabularyCardIds.length} từ vựng</button>)}
                  <button onClick={() => setIsStatsModalOpen(true)} className="inline-flex items-center px-4 py-2 border dark:border-gray-600 text-sm font-medium rounded-md shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><StatsIcon />Thống kê Sách</button>
                  {isViSubAvailable && (
                    <button onClick={toggleSubtitleLanguage} className="inline-flex items-center px-4 py-2 border dark:border-gray-600 text-sm font-medium rounded-md shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <TranslateIcon />
                      {getTranslateButtonText()}
                    </button>
                  )}
                </div>
                {/* Highlight mode toggle has been removed */}
                {subtitleLanguage === 'en' && <ClozeTestControls />}
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

      {/* --- UPDATED: Truyền exampleSentences vào modal --- */}
      {selectedVocabCard && showVocabDetail && <FlashcardDetailModal selectedCard={selectedVocabCard} showVocabDetail={showVocabDetail} exampleSentencesData={exampleSentences} onClose={closeVocabDetail} currentVisualStyle="default" />}
      
      {isBatchPlaylistModalOpen && <AddToPlaylistModal isOpen={isBatchPlaylistModalOpen} onClose={() => setIsBatchPlaylistModalOpen(false)} cardIds={bookVocabularyCardIds} currentUser={currentUser} existingPlaylists={playlists} />}
      {/* PhraseDetailModal has been removed */}
      <BookStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={bookStats} bookTitle={currentBook?.title || ''} vocabMap={vocabMap} />

      {activeHiddenWordState && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={dismissKeyboard} aria-hidden="true" />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-200 dark:bg-gray-800 p-2 shadow-2xl rounded-t-xl animate-slide-up">
                 <VirtualKeyboard
                    userInput={activeHiddenWordState.userInput}
                    setUserInput={handleClozeTestInput}
                    wordLength={activeHiddenWordState.originalWord.length}
                    disabled={false}
                 />
            </div>
          </>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
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

// --- END OF FILE game.tsx (FIXED & UPDATED) ---
