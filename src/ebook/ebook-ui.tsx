// --- START OF FILE ebook-ui.tsx (18).txt ---

// --- START OF FILE game.tsx (FIXED & UPDATED) ---

import React, { useMemo, useState, useEffect } from 'react';
import { EbookProvider, useEbook, Book, Vocabulary, HiddenWordState, ExampleSentence } from './ebook-context.tsx';
import VirtualKeyboard from '../ui/keyboard.tsx';

// --- COMPONENT & MODAL IMPORTS ---
import FlashcardDetailModal from '../story/flashcard.tsx';
import AddToPlaylistModal from '../AddToPlaylistModal.tsx';
import BackButton from '../ui/back-button.tsx';
// PhraseDetailModal has been removed as it's no longer used.

// --- ICONS (Copied from original file for self-containment) ---
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 pl-0.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>);
const Rewind10Icon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const StatsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM9 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm4-5a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const ChevronLeftIcon = ({ className }: { className: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);
const ChevronRightIcon = ({ className }: { className: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);
const PracticeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" /><path d="M9 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" /></svg>);
const SpeakerWaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>);


// --- HELPER FUNCTION ---
const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const category = book.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};

// --- UI COMPONENTS ---

const BookSidebar: React.FC<{ isOpen: boolean; onClose: () => void; book: Book | undefined; }> = ({ isOpen, onClose, book }) => {
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
    <><div className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" /><div className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white shadow-xl z-40 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between p-4 border-b border-gray-200"><h2 className="text-lg font-semibold truncate">{book?.title || "Menu"}</h2><button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Đóng menu"><XIcon /></button></div><div className="p-4 space-y-6 overflow-y-auto flex-grow"><div><h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Nội dung sách</h3><ul className="space-y-1">{['Chương 1: Giới thiệu', 'Chương 2: Phát triển câu chuyện', 'Chương 3: Cao trào', 'Chương 4: Kết luận', 'Phụ lục'].map(item => (<li key={item}><a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">{item}</a></li>))}</ul></div><hr className="border-gray-200" /></div><div className="p-4 border-t border-gray-200"><p className="text-xs text-center text-gray-500">© 2024 Ebook Reader</p></div></div></>
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
    const StatCard = ({ label, value }: { label: string, value: any }) => (<div className="bg-gray-100 p-4 rounded-lg text-center shadow"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p></div>);
    const TabButton = ({ isActive, onClick, label, count }: { isActive: boolean, onClick: any, label: string, count: number }) => (<button onClick={onClick} className={`flex-1 text-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200/70'}`} aria-current={isActive ? 'page' : undefined}>{label}<span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200'}`}>{count}</span></button>);
    return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-gray-200"><h2 className="text-lg font-semibold">Thống kê</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Đóng"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Đóng" className="w-6 h-6" /></button></div><div className="p-6 overflow-y-auto space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><StatCard label="Tổng số từ" value={stats.totalWords} /><StatCard label="Từ vựng duy nhất" value={stats.uniqueWordsCount} /><StatCard label="Có sẵn" value={stats.vocabMatchCount} /><StatCard label="Chưa có" value={stats.vocabMismatchCount} /></div><div><h3 className="text-md font-semibold text-gray-700 mb-3">Tần suất từ vựng</h3><div className="bg-gray-100 rounded-lg p-1 flex space-x-1 mb-4"><TabButton isActive={activeTab === 'in'} onClick={() => setActiveTab('in')} label="Có sẵn" count={inDictionaryWords.length} /><TabButton isActive={activeTab === 'out'} onClick={() => setActiveTab('out')} label="Chưa có" count={outOfDictionaryWords.length} /></div><div className="p-1 max-h-64 overflow-y-auto min-h-[10rem]"><ul className="space-y-1">{activeTab === 'in' && inDictionaryWords.map(([word, count]) => (<li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100"><span className="font-medium text-blue-600">{word}</span><span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{count} lần</span></li>))}{activeTab === 'out' && outOfDictionaryWords.map(([word, count]) => (<li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100"><span className="font-medium text-gray-700">{word}</span><span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{count} lần</span></li>))}{activeTab === 'in' && inDictionaryWords.length === 0 && <div className="flex items-center justify-center h-full min-h-[8rem]"><p className="text-center text-gray-500">Không có từ nào có sẵn.</p></div>}{activeTab === 'out' && outOfDictionaryWords.length === 0 && <div className="flex items-center justify-center h-full min-h-[8rem]"><p className="text-center text-gray-500">Tất cả từ đã có sẵn.</p></div>}</ul></div></div></div></div></div>);
};

// --- NEW VOICE SELECTION MODAL ---
const VoiceSelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  availableVoices: { key: string; name: string }[];
  selectedVoiceKey: string | null;
  onSelectVoice: (key: string) => void;
}> = ({ isOpen, onClose, availableVoices, selectedVoiceKey, onSelectVoice }) => {
  if (!isOpen) return null;

  const handleSelect = (key: string) => {
    onSelectVoice(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-short" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Chọn Giọng Đọc AI</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100" aria-label="Đóng">
            <XIcon />
          </button>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          <ul className="space-y-1">
            {availableVoices.map(({ key, name }) => (
              <li key={key}>
                <button
                  onClick={() => handleSelect(key)}
                  className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    selectedVoiceKey === key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`font-medium ${selectedVoiceKey === key ? 'font-bold' : ''}`}>{name}</span>
                  {selectedVoiceKey === key && <CheckIcon />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style jsx>{`
          @keyframes fade-in-short { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fade-in-short { animation: fade-in-short 0.2s ease-out forwards; }
          .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};


// --- UPDATED CLOZE TEST MODAL ---
const ClozeTestSetupModal = () => {
    const {
        isClozeTestModalOpen, closeClozeTestModal, startClozeTest,
        hiddenWordCount, setHiddenWordCount
    } = useEbook();

    if (!isClozeTestModalOpen) return null;

    const min = 5;
    const max = 50;

    const bubblePosition = useMemo(() => {
        const percent = (hiddenWordCount - min) / (max - min);
        return `calc(${percent * 100}% - ${percent * 12}px)`;
    }, [hiddenWordCount, min, max]);

    const handleStart = () => {
        startClozeTest();
    };

    const presets = [10, 20, 30, 50];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-short" onClick={closeClozeTestModal}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="relative pt-8 px-8 text-center">
                    <button onClick={closeClozeTestModal} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100" aria-label="Đóng">
                        <XIcon />
                    </button>
                    <h3 className="text-2xl font-bold mt-5 mb-2 text-gray-900 uppercase tracking-wider">PRACTICE</h3>
                    <p className="text-sm text-gray-500">Điều chỉnh số lượng từ bị ẩn để bắt đầu thử thách.</p>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <div className="flex justify-center gap-2 mb-6">
                            {presets.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setHiddenWordCount(p)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        hiddenWordCount === p
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <div className="relative pt-4">
                            <div style={{ left: bubblePosition }} className="absolute -top-3 w-10 text-center">
                                <div className="relative bg-gray-800 text-white rounded-md px-2 py-1 text-xs font-bold">
                                    {hiddenWordCount}
                                    <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                                </div>
                            </div>
                            <input
                                id="wordCount"
                                type="range"
                                min={min}
                                max={max}
                                step="5"
                                value={hiddenWordCount}
                                onChange={(e) => setHiddenWordCount(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{min}</span>
                                <span>{max}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={handleStart}
                        className="w-full px-8 py-3 text-base font-bold rounded-lg shadow-lg transition-all text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-[1.02]"
                    >
                        Bắt đầu Luyện tập
                    </button>
                </div>
                <style jsx>{`
                    @keyframes fade-in-short { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .animate-fade-in-short { animation: fade-in-short 0.2s ease-out forwards; }
                    .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};


// --- EbookReaderContent Component (The UI) ---
const EbookReaderContent: React.FC = () => {
  const {
    // State & Derived State
    selectedBookId, booksData, currentBook, isSidebarOpen, audioPlayerRef,
    isAudioPlaying, audioCurrentTime, audioDuration, playbackSpeed,
    selectedVocabCard, showVocabDetail, isBatchPlaylistModalOpen, bookVocabularyCardIds,
    currentUser, playlists, isStatsModalOpen, bookStats, vocabMap,
    availableVoices, selectedVoiceKey, isLoadingVocab, isVoiceSelectionModalOpen,
    subtitleLanguage, isViSubAvailable, displayedContent,
    exampleSentences,

    // Functions
    handleBackToLibrary, toggleSidebar, handleSelectBook, setIsBatchPlaylistModalOpen,
    setIsStatsModalOpen, setIsVoiceSelectionModalOpen, handleWordClick, closeVocabDetail,
    togglePlayPause, handleSeek, togglePlaybackSpeed, handleSelectVoice,
    handleSetSubtitleLanguage,

    // CLOZE TEST VALUES
    isClozeTestActive, stopClozeTest, hiddenWords, hiddenWordCount, correctlyGuessedCount,
    activeHiddenWordIndex, handleHiddenWordClick, handleClozeTestInput,
    dismissKeyboard, setIsClozeTestModalOpen,
  } = useEbook();

  const [activeTag, setActiveTag] = useState('All');

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
      if (/^\w+$/.test(part) && vocabMap.has(part.toLowerCase())) return <span key={partIndex} className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => handleWordClick(part)}>{part}</span>;
      return <span key={partIndex}>{part}</span>;
    }).filter(Boolean) as JSX.Element[];
    return renderableParts;
  }

  // RE-INTEGRATED from previous versions
  const HiddenWordInput: React.FC<{ wordState: HiddenWordState; index: number; onClick: () => void; isActive: boolean; }> = ({ wordState, index, onClick, isActive }) => {
      const { originalWord, userInput, status } = wordState;
      if (status === 'correct') {
          return <span className="font-semibold text-green-700 bg-green-100 px-1 py-0.5 rounded-md transition-all duration-300">{originalWord}</span>;
      }
      let containerClasses = `inline-block align-baseline min-w-14 mx-1 px-1.5 pb-px cursor-pointer rounded-t-sm bg-gray-100/50 border-b-2 border-gray-300 hover:border-blue-500 transition-all duration-200 text-left`;
      let textClasses = "font-bold text-gray-800";
      if (isActive) containerClasses += " border-blue-500 ring-1 ring-blue-300/70";
      if (status === 'incorrect') {
          containerClasses += " animate-shake border-red-500";
          textClasses = "font-bold text-red-500";
      }
      return <span className={containerClasses} onClick={onClick}><span className={textClasses}>{userInput || <>&nbsp;</>}</span></span>;
  };

  // NEW Component for progress bar in main view
  const ClozeTestProgress = () => {
    const progressPercent = hiddenWords.size > 0 ? (correctlyGuessedCount / hiddenWords.size) * 100 : 0;
    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-medium text-gray-600">Tiến độ luyện tập</span>
              <span className="font-bold">{correctlyGuessedCount} / {hiddenWords.size}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
      </div>
    );
  };


  const renderBookContent = () => {
    if (isLoadingVocab) return <div className="text-center p-10 text-gray-500 animate-pulse">Đang tải nội dung sách...</div>;
    if (!currentBook) return <div className="text-center p-10 text-gray-500">Không tìm thấy nội dung sách.</div>;

    if (isClozeTestActive) {
        let globalWordCounter = -1;

        const renderClozeEnabledLine = (line: string) => {
            const parts = line.split(/(\b[a-zA-Z']+\b)/g);
            return parts.map((part, partIndex) => {
                if (/\b[a-zA-Z']+\b/.test(part)) {
                    globalWordCounter++;
                    const currentWordIndex = globalWordCounter;
                    const hiddenWordState = hiddenWords.get(currentWordIndex);
                    if (hiddenWordState) {
                        return <HiddenWordInput key={`hidden-${currentWordIndex}`} wordState={hiddenWordState} index={currentWordIndex} onClick={() => handleHiddenWordClick(currentWordIndex)} isActive={activeHiddenWordIndex === currentWordIndex} />;
                    }
                }
                return <span key={`part-${partIndex}`}>{part}</span>;
            });
        };

        if (subtitleLanguage === 'bilingual') {
             return (
                <div className="font-['Inter',_sans_serif] text-gray-800 px-2 sm:px-4 pb-24">
                    {pairedSentences.map((pair, index) => {
                        if (!pair.en && !pair.vi) return <div key={`spacer-${index}`} className="h-4"></div>;
                        const renderedEnContent = renderClozeEnabledLine(pair.en);
                        if (pair.isHeader) {
                            return (
                                <div key={`pair-${index}`} className="my-6">
                                    <h3 className="text-xl font-bold text-gray-900 text-center">{renderedEnContent}</h3>
                                    <p className="text-lg text-center text-gray-600 italic mt-1">{pair.vi}</p>
                                </div>
                            );
                        }
                        return (
                            <div key={`pair-${index}`} className="mb-5">
                                <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-800 text-left">{renderedEnContent}</p>
                                <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-600 italic text-left">{pair.vi}</p>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Fallback to English-only cloze test
        const paragraphs = currentBook.content.trim().split(/\n+/);
        return (
            <div className="font-['Inter',_sans_serif] text-gray-800 px-2 sm:px-4 pb-24">
                {paragraphs.map((paragraph, pIndex) => {
                    if (paragraph.trim() === '') return <div key={`blank-${pIndex}`} className="h-3 sm:h-4"></div>;
                    return (
                        <p key={`p-${pIndex}`} className="text-base sm:text-lg leading-loose sm:leading-loose text-gray-700 mb-4 text-left">
                           {renderClozeEnabledLine(paragraph)}
                        </p>
                    );
                })}
            </div>
        );
    }

    if (subtitleLanguage === 'bilingual') {
      return (
        <div className="font-['Inter',_sans_serif] text-gray-800 px-2 sm:px-4 pb-24">
          {pairedSentences.map((pair, index) => {
            if (!pair.en && !pair.vi) return <div key={`spacer-${index}`} className="h-4"></div>;
            if (pair.isHeader) return <div key={`pair-${index}`} className="my-6"><h3 className="text-xl font-bold text-gray-900 text-center">{renderHighlightedText(pair.en)}</h3><p className="text-lg text-center text-gray-600 italic mt-1">{pair.vi}</p></div>;
            return <div key={`pair-${index}`} className="mb-5"><p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-800 text-left">{renderHighlightedText(pair.en)}</p><p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-600 italic text-left">{pair.vi}</p></div>;
          })}
        </div>
      );
    }

    // Đây là chế độ 'en' (bản gốc)
    const contentLines = displayedContent.trim().split(/\n+/);
    return (
      <div className="font-['Inter',_sans_serif] text-gray-800 px-2 sm:px-4 pb-24">
        {contentLines.map((line, index) => {
          if (line.trim() === '') return <div key={`blank-${index}`} className="h-3 sm:h-4"></div>;
          const isHeader = line.length < 80 && !line.includes('.') && !line.includes('?');
          const renderableParts = renderHighlightedText(line);
          if (isHeader) return <h3 key={`line-${index}`} className="text-xl font-bold text-gray-900 mt-6 mb-4 text-center">{renderableParts}</h3>;
          return <p key={`line-${index}`} className="text-base sm:text-lg leading-relaxed sm:leading-loose text-gray-700 mb-4 text-left">{renderableParts}</p>;
        })}
      </div>
    );
  };

  const activeHiddenWordState = useMemo(() => {
      if (activeHiddenWordIndex === null) return null;
      return hiddenWords.get(activeHiddenWordIndex);
  }, [activeHiddenWordIndex, hiddenWords]);

  const renderLibrary = () => {
    // --- MODIFIED: The tags array is now generated dynamically ---
    const tags = ['All', ...Object.keys(groupedBooks)];

    return (
      <div className="flex flex-col">
        {/* --- Tag Bar --- */}
        <div className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar p-3 px-4">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200
                  ${activeTag === tag
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* --- Books Grid --- */}
        <div className="p-4 md:p-6 lg:p-8 pb-24">
          {Object.entries(groupedBooks)
            .filter(([category]) => activeTag === 'All' || activeTag === category)
            .map(([category, booksInCategory]) => (
            <section key={category} className="mb-10">
              {/* Conditionally render header only if NOT on the 'All' tab */}
              {activeTag !== 'All' && (
                <div className="flex justify-between items-center mb-4">
                   {category === 'Technology & Future' ? (
                    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/youtube-logo.png" alt="YouTube" className="h-8" />
                  ) : (
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{category}</h2>
                  )}
                  {/* "See All" button is removed */}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {booksInCategory.map(book => (
                  <div key={book.id} className="cursor-pointer group" onClick={() => handleSelectBook(book.id)}>
                    {/* Thumbnail with 16:9 aspect ratio, now relative for positioning the tag */}
                    <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-3 group-hover:shadow-xl transition-shadow duration-300">
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {book.audioUrls && Object.keys(book.audioUrls).length >= 2 && (
                        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md text-white text-xs font-bold backdrop-blur-sm">
                          Voice AI
                        </div>
                      )}
                    </div>
                    {/* Book Info */}
                    <div className="flex items-start space-x-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-600 line-clamp-2">{book.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleRewind = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = Math.max(0, audioPlayerRef.current.currentTime - 10);
    }
  };

  // --- UPDATED: Action Toolbar Component ---
  const ActionToolbar = () => (
    <div className="bg-gray-200 border-b border-gray-300">
        <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {currentUser && bookVocabularyCardIds.length > 0 && (
                    <button onClick={() => setIsBatchPlaylistModalOpen(true)} className="flex-shrink-0 flex items-center text-sm font-medium bg-white text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md border border-gray-300 shadow-sm transition-colors">
                        <SaveIcon />
                        <span>Lưu</span>
                    </button>
                )}
                <button onClick={() => setIsStatsModalOpen(true)} className="flex-shrink-0 flex items-center text-sm font-medium bg-white text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md border border-gray-300 shadow-sm transition-colors">
                    <StatsIcon />
                    <span>Thống kê</span>
                </button>
                {currentBook && (
                    <button onClick={() => setIsClozeTestModalOpen(true)} className="flex-shrink-0 flex items-center text-sm font-medium bg-white text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md border border-gray-300 shadow-sm transition-colors">
                        <PracticeIcon />
                        <span>Luyện tập</span>
                    </button>
                )}
                {availableVoices.length > 1 && (
                    <button onClick={() => setIsVoiceSelectionModalOpen(true)} className="flex-shrink-0 flex items-center text-sm font-medium bg-white text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md border border-gray-300 shadow-sm transition-colors">
                        <SpeakerWaveIcon />
                        <span>{selectedVoiceKey || 'Giọng đọc'}</span>
                    </button>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen bg-gray-100 text-gray-900`}>
      {selectedBookId && (
        <div className="sticky top-0 z-20">
          <header className="flex items-center justify-between p-3 bg-gray-950 shadow-md py-2 sm:py-3">
              <BackButton onClick={isClozeTestActive ? stopClozeTest : handleBackToLibrary} />

              <div className="flex-grow flex justify-end items-center gap-4">
                {isViSubAvailable && (
                  <div className="bg-gray-800 p-1 rounded-full flex items-center text-xs">
                    <button onClick={() => handleSetSubtitleLanguage('en')} className={`px-3 py-1 font-bold text-white rounded-full transition-colors duration-200 ${ subtitleLanguage === 'en' ? 'bg-blue-600' : 'hover:bg-white/10' }`}>
                      EN
                    </button>
                    <button onClick={() => handleSetSubtitleLanguage('bilingual')} className={`px-3 py-1 font-bold text-white rounded-full transition-colors duration-200 ${ subtitleLanguage === 'bilingual' ? 'bg-blue-600' : 'hover:bg-white/10' }`}>
                      EN/VI
                    </button>
                  </div>
                )}
              </div>
          </header>
          {!isClozeTestActive && <ActionToolbar />}
        </div>
      )}

      {currentBook && <BookSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} book={currentBook} />}

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50">{renderLibrary()}</main>
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 py-6 sm:py-8">
          <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10">
            {!isClozeTestActive && currentBook && (
              <div className="mb-8 text-center">
                  <h1 className="inline-block bg-gray-100 rounded-full px-4 py-1.5 text-xl font-semibold text-gray-800 shadow-sm">
                    {currentBook.title}
                  </h1>
                  <p className="text-sm text-center text-gray-500 mt-2">Tác giả: {currentBook.author}</p>
              </div>
            )}
            {isClozeTestActive && <ClozeTestProgress />}
            {renderBookContent()}
          </div>
        </main>
      )}

      <audio ref={audioPlayerRef} />

      {selectedBookId && currentBook?.audioUrls && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md z-30 border-t border-gray-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={isAudioPlaying ? "Tạm dừng" : "Phát"}
            >
              {isAudioPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="flex-grow flex items-center gap-3">
              <span className="text-xs font-mono text-gray-600 w-12 text-center">{formatTime(audioCurrentTime)}</span>
              <input
                  type="range"
                  min="0"
                  max={audioDuration || 0}
                  value={audioCurrentTime}
                  onChange={handleSeek}
                  className="w-full audio-slider"
                  aria-label="Tua audio"
              />
              <span className="text-xs font-mono text-gray-600 w-12 text-center">{formatTime(audioDuration)}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
               <button onClick={handleRewind} className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Lùi 10 giây">
                  <Rewind10Icon />
               </button>
               <button onClick={togglePlaybackSpeed} className="w-9 h-9 flex items-center justify-center text-sm font-bold rounded-full bg-gray-100 text-blue-600 hover:bg-gray-200 transition-colors">
                  {playbackSpeed}x
               </button>
            </div>

          </div>
        </div>
      )}

      <ClozeTestSetupModal />
      {selectedVocabCard && showVocabDetail && <FlashcardDetailModal selectedCard={selectedVocabCard} showVocabDetail={showVocabDetail} exampleSentencesData={exampleSentences} onClose={closeVocabDetail} currentVisualStyle="default" />}
      {isBatchPlaylistModalOpen && <AddToPlaylistModal isOpen={isBatchPlaylistModalOpen} onClose={() => setIsBatchPlaylistModalOpen(false)} cardIds={bookVocabularyCardIds} currentUser={currentUser} existingPlaylists={playlists} />}
      <BookStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={bookStats} bookTitle={currentBook?.title || ''} vocabMap={vocabMap} />
      <VoiceSelectionModal
        isOpen={isVoiceSelectionModalOpen}
        onClose={() => setIsVoiceSelectionModalOpen(false)}
        availableVoices={availableVoices}
        selectedVoiceKey={selectedVoiceKey}
        onSelectVoice={handleSelectVoice}
      />
      {activeHiddenWordState && (
          <>
            <div className="fixed inset-0 bg-black/20 z-[60]" onClick={dismissKeyboard} aria-hidden="true" />
            <div className="fixed bottom-0 left-0 right-0 z-[70] bg-gray-200 p-2 shadow-2xl rounded-t-xl animate-slide-up">
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
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }

        /* Custom Audio Player Slider Styles */
        .audio-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: #e5e7eb; /* gray-200 */
          border-radius: 9999px;
          outline: none;
          transition: opacity .2s;
        }

        .audio-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #2563eb; /* blue-600 */
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .audio-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #2563eb; /* blue-600 */
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
