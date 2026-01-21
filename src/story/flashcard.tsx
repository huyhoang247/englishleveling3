// --- START OF FILE: src/flashcard.tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BackButton from '../ui/back-button.tsx';
import { ExampleSentence, Flashcard as CoreFlashcard } from './flashcard-data.ts';
import { generateAudioUrlsForWord, generateAudioUrlsForExamSentence } from '../voca-data/audio-quiz-generator.ts';
import { partOfSpeechData } from '../voca-data/loai-tu.ts'; // IMPORT DỮ LIỆU LOẠI TỪ

// Đổi tên interface để tránh xung đột với tên component
interface FlashcardData extends CoreFlashcard {}

// Define the props for the FlashcardDetailModal component
interface FlashcardDetailModalProps {
  selectedCard: FlashcardData | null;
  showVocabDetail: boolean;
  exampleSentencesData: ExampleSentence[];
  onClose: () => void;
  currentVisualStyle: string;
  zIndex?: number;
}

// --- START: ICONS ---
const PauseIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
  </svg>
);

const VolumeUpIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
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

const SoundWaveIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 11h2v2H3v-2zm4 2h2v-6H7v6zm4-9h2V5h-2v9zm4 3h2V8h-2v6zm4-4h2V7h-2v4z"></path>
  </svg>
);

const CheckIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
// --- END: ICONS ---


// --- START: POPUP CHỌN GIỌNG ĐỌC ---
interface VoiceSelectionPopupProps {
  availableVoices: string[];
  currentVoice: string;
  onSelectVoice: (voice: string) => void;
  onClose: () => void;
}

const VoiceSelectionPopup: React.FC<VoiceSelectionPopupProps> = ({
  availableVoices,
  currentVoice,
  onSelectVoice,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[98] flex items-center justify-center bg-black/50 animate-popup-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={popupRef}
        className="z-[99] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-64 animate-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200">Chọn Giọng Đọc</h3>
        </div>
        <div className="p-2 max-h-60 overflow-y-auto">
          <ul className="space-y-1">
            {availableVoices.map((voice) => (
              <li key={voice}>
                <button
                  onClick={() => onSelectVoice(voice)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                    currentVoice === voice
                      ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <SoundWaveIcon className="w-5 h-5 opacity-70" />
                     <span className="font-medium text-sm">{voice}</span>
                  </div>
                  {currentVoice === voice && <CheckIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
// --- END: POPUP CHỌN GIỌNG ĐỌC ---


// --- VoiceStepper component ---
type VoiceStepperProps = {
  currentVoice: string;
  onNavigate: (direction: 'next' | 'previous') => void;
  availableVoiceCount: number;
  onClick?: () => void;
};

const VoiceStepper: React.FC<VoiceStepperProps> = ({ currentVoice, onNavigate, availableVoiceCount, onClick }) => {
    if (availableVoiceCount <= 1) {
      return null;
    }

    return (
      <div className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-full">
        <button
          onClick={() => onNavigate('previous')}
          className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Giọng đọc trước"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </button>

        <button
          onClick={onClick}
          className="text-center w-20 overflow-hidden px-1 h-7 flex items-center justify-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Chọn giọng đọc"
        >
           <span
              key={currentVoice}
              className="text-xs font-semibold text-gray-600 dark:text-gray-300 animate-fade-in-short"
           >
              {currentVoice}
          </span>
        </button>

        <button
          onClick={() => onNavigate('next')}
          className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Giọng đọc tiếp theo"
        >
          <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    );
};

// Animation styles
const animations = `
  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes modalBackdropIn { 0% { opacity: 0; } 100% { opacity: 0.4; } }
  @keyframes slideUp { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes fade-in-short { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  
  @keyframes popup-overlay-in { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes popup-content-in { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
  
  .content-transition { animation: slideUp 0.3s ease-out; }
  .animate-fade-in-short { animation: fade-in-short 0.25s ease-out forwards; }
  .animate-popup-overlay { animation: popup-overlay-in 0.2s ease-out forwards; }
  .animate-popup-content { animation: popup-content-in 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
`;

// --- HELPER FUNCTIONS ---
const capitalizeWordInDefinition = (definition: string): string => {
  if (!definition) return '';
  const capitalizeFirst = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  return definition.replace(/\(([^)]+)\)/, (match, word) => {
    return `(${capitalizeFirst(word)})`;
  });
};

const FlashcardDetailModal: React.FC<FlashcardDetailModalProps> = ({
  selectedCard,
  showVocabDetail,
  exampleSentencesData,
  onClose,
  currentVisualStyle,
  zIndex = 50,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'example' | 'vocabulary'>('basic');
  
  // Audio state
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Matilda');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Exam Audio state
  const examAudioRef = useRef<HTMLAudioElement>(null);
  const [examAudioState, setExamAudioState] = useState<{ index: number | null; isPlaying: boolean }>({
    index: null,
    isPlaying: false,
  });

  // Pagination state
  const [examPage, setExamPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const examTabContentRef = useRef<HTMLDivElement>(null);

  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);

  useEffect(() => {
    if (showVocabDetail && selectedCard) {
      setActiveTab('basic');
      setIsVoicePopupOpen(false);
      setExamPage(1);
      
      const urls = generateAudioUrlsForWord(selectedCard.vocabulary.word);
      setAudioUrls(urls);
      setSelectedVoice('Matilda');
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (examAudioRef.current) examAudioRef.current.pause();
      setExamAudioState({ index: null, isPlaying: false });
    }
  }, [showVocabDetail, selectedCard]);

  const currentAudioUrl = useMemo(() => audioUrls?.[selectedVoice] ?? null, [audioUrls, selectedVoice]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audio.pause();
    }
  }, []);

  const handleChangeVoiceDirection = useCallback((direction: 'next' | 'previous') => {
    if (!audioUrls) return;
    const availableVoices = Object.keys(audioUrls);
    if (availableVoices.length <= 1) return;
    const currentIndex = availableVoices.indexOf(selectedVoice);
    if (currentIndex === -1) return;
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % availableVoices.length;
    } else {
      nextIndex = (currentIndex - 1 + availableVoices.length) % availableVoices.length;
    }
    setSelectedVoice(availableVoices[nextIndex]);
  }, [audioUrls, selectedVoice]);
  
  const handleSelectVoice = useCallback((voice: string) => {
    setSelectedVoice(voice);
    setIsVoicePopupOpen(false);
  }, []);

  const handleToggleExampleAudio = useCallback((sentenceIndex: number) => {
    const audio = examAudioRef.current;
    if (!audio) return;
    
    if (examAudioState.index === sentenceIndex) {
      if (audio.paused) {
        audio.play().catch(e => console.error("Error playing example audio:", e));
      } else {
        audio.pause();
      }
    } else {
      const urls = generateAudioUrlsForExamSentence(sentenceIndex);
      if (urls && urls['Matilda']) {
        audio.src = urls['Matilda'];
        audio.play().catch(e => console.error("Error playing example audio:", e));
        setExamAudioState({ index: sentenceIndex, isPlaying: true });
      } else {
        console.warn(`No audio found for sentence index: ${sentenceIndex}`);
        setExamAudioState({ index: null, isPlaying: false });
      }
    }
  }, [examAudioState.index]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => handlePause();
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = examAudioRef.current;
    if (!audio) return;
    const handlePlay = () => setExamAudioState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setExamAudioState(prev => ({ ...prev, isPlaying: false }));
    const handleEnded = () => setExamAudioState({ index: null, isPlaying: false });

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);


  if (!showVocabDetail || !selectedCard) {
    return null;
  }

  const tabs = [
    { key: 'basic' as const, label: 'Image' },
    { key: 'example' as const, label: 'Exam' },
    { key: 'vocabulary' as const, label: 'Vocabulary' },
  ];

  const renderModalContent = () => {
    const wordToFind = selectedCard.vocabulary.word;

    const highlightWord = (sentence: string, word: string) => {
        const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === word.toLowerCase() ? (
                        <strong key={index} className="text-blue-500 dark:text-blue-400 font-semibold">{part}</strong>
                    ) : (part)
                )}
            </>
        );
    };

    switch (activeTab) {
      case 'basic':
        const stylesToShow = ['default', 'photography', 'illustration', 'realistic'];
        const availableImages = Object.entries(selectedCard.imageUrl).filter(
            ([styleKey, url]) => stylesToShow.includes(styleKey) && url && typeof url === 'string'
        );
        return (
          <div className="flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6 content-transition">
            <div className="max-w-xl mx-auto space-y-8">
              {availableImages.length > 0 ? (
                availableImages.map(([styleKey, imageUrl]) => (
                  <img
                    key={styleKey}
                    src={imageUrl}
                    alt={`${selectedCard.vocabulary.word} - ${styleKey}`}
                    className="w-full h-auto rounded-lg shadow-lg object-contain bg-black/10 dark:bg-white/5"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://placehold.co/1024x1536/E0E0E0/333333?text=Lỗi+Ảnh`;
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Không có ảnh nào cho từ này.
                </div>
              )}
            </div>
          </div>
        );
      case 'example':
        const filteredSentencesWithIndex = exampleSentencesData
            .map((sentence, index) => ({ ...sentence, originalIndex: index }))
            .filter(sentence => new RegExp(`\\b${wordToFind}\\b`, 'i').test(sentence.english));
        
        const totalPages = Math.ceil(filteredSentencesWithIndex.length / ITEMS_PER_PAGE);
        const startIndex = (examPage - 1) * ITEMS_PER_PAGE;
        const currentSentences = filteredSentencesWithIndex.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        const handlePageChange = (newPage: number) => {
            if (newPage >= 1 && newPage <= totalPages) {
                setExamPage(newPage);
                if (examTabContentRef.current) {
                    examTabContentRef.current.scrollTop = 0;
                }
            }
        };

        return (
          <div ref={examTabContentRef} className="flex-grow overflow-y-auto bg-white dark:bg-black p-6 md:p-8 content-transition scroll-smooth">
            <div className="max-w-4xl mx-auto min-h-[50vh] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-sans text-base font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      {wordToFind}
                    </span>
                  </div>

                  {audioUrls && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={togglePlay}
                          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${isPlaying ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                          aria-label={isPlaying ? 'Dừng phát từ' : 'Phát âm từ'}
                        >
                          { isPlaying ? <PauseIcon className="w-4 h-4" /> : <VolumeUpIcon className="w-4 h-4" /> }
                        </button>
                        <VoiceStepper
                            onClick={() => setIsVoicePopupOpen(true)}
                            currentVoice={selectedVoice}
                            onNavigate={handleChangeVoiceDirection}
                            availableVoiceCount={Object.keys(audioUrls).length}
                        />
                    </div>
                  )}
                </div>

                {filteredSentencesWithIndex.length > 0 ? (
                  <div className="space-y-4">
                    {currentSentences.map((sentence, index) => {
                      const isCurrentAudio = examAudioState.index === sentence.originalIndex;
                      const isThisPlaying = isCurrentAudio && examAudioState.isPlaying;
                      return (
                          <div key={index} className="relative bg-gray-50 dark:bg-gray-900/70 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <button
                              onClick={() => handleToggleExampleAudio(sentence.originalIndex)}
                              className={`absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${isThisPlaying ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                              aria-label={isThisPlaying ? 'Dừng phát câu' : 'Phát âm câu'}
                            >
                              { isThisPlaying ? <PauseIcon className="w-4 h-4" /> : <VolumeUpIcon className="w-4 h-4" /> }
                            </button>
                            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed font-medium pr-10">{highlightWord(sentence.english, wordToFind)}</p>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm italic">{sentence.vietnamese}</p>
                          </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    <h4 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Không tìm thấy ví dụ</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Chưa có câu ví dụ nào cho từ này trong danh sách.</p>
                  </div>
                )}
              </div>

              {/* --- PAGINATION UI --- */}
              {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-10 pb-2">
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => handlePageChange(examPage - 1)}
                            disabled={examPage === 1}
                            className={`p-2 rounded-full transition-all duration-200 ${
                                examPage === 1 
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:text-blue-500 dark:hover:text-blue-400'
                            }`}
                            aria-label="Trang trước"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[1rem] text-center">{examPage}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{totalPages}</span>
                        </div>

                        <button
                            onClick={() => handlePageChange(examPage + 1)}
                            disabled={examPage === totalPages}
                            className={`p-2 rounded-full transition-all duration-200 ${
                                examPage === totalPages 
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:text-blue-500 dark:hover:text-blue-400'
                            }`}
                            aria-label="Trang sau"
                        >
                             <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        );
      case 'vocabulary':
        // LOGIC LẤY LOẠI TỪ: Tra cứu từ bảng dữ liệu (Bây giờ nó là một mảng string[])
        const partOfSpeechList = partOfSpeechData[wordToFind.toUpperCase()];

        // MAPPING THÔNG TIN CHI TIẾT
        const posMapping: Record<string, { en: string; abbr: string }> = {
            "Danh Từ": { en: "Noun", abbr: "n" },
            "Tính Từ": { en: "Adjective", abbr: "adj" },
            "Động Từ": { en: "Verb", abbr: "v" },
            "Trạng Từ": { en: "Adverb", abbr: "adv" },
            "Đại Từ": { en: "Pronoun", abbr: "pron" },
            "Giới Từ": { en: "Preposition", abbr: "prep" },
            "Liên Từ": { en: "Conjunction", abbr: "conj" },
            "Thán Từ": { en: "Interjection", abbr: "interj" }
        };

        return (
          <div className="flex-grow overflow-y-auto bg-white dark:bg-black p-6 md:p-8 content-transition">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* 1. Ô ĐỊNH NGHĨA */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl md:col-span-2">
                  <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4 dark:bg-blue-900/50 dark:text-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    <span>{selectedCard.vocabulary.word}</span>
                  </div>
                  <p className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed">{capitalizeWordInDefinition(selectedCard.vocabulary.meaning)}</p>
                </div>

                {/* 2. Ô LOẠI TỪ (PART OF SPEECH) - NO BORDER / NO DIVIDER / TIGHT SPACING */}
                {partOfSpeechList && partOfSpeechList.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl md:col-span-2 overflow-hidden">
                    <div className="flex flex-col py-2">
                        {partOfSpeechList.map((posItem, index) => {
                            const posDetail = posMapping[posItem];
                            return (
                                <div key={index} className="px-4 py-1 flex flex-wrap items-center gap-3">
                                    {/* Viên 1: Tiếng Việt (Primary) */}
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                                         {posItem}
                                    </span>

                                    {posDetail && (
                                        <>
                                            {/* Viên 2: Tiếng Anh (Secondary) */}
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50">
                                                {posDetail.en}
                                            </span>

                                            {/* Viên 3: Viết tắt (Technical) */}
                                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gray-200 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                                {posDetail.abbr}
                                            </span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                  </div>
                )}

                {/* 3. Ô PHÁT ÂM */}
                {audioUrls && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl md:col-span-2">
                     <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <button onClick={togglePlay} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${isPlaying ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`} aria-label={isPlaying ? 'Dừng phát' : 'Phát âm'}>
                            { isPlaying ? <PauseIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" /> }
                          </button>
                          <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phát âm</h5>
                       </div>
                       <div className="flex items-center gap-2">
                          <VoiceStepper
                             onClick={() => setIsVoicePopupOpen(true)}
                             currentVoice={selectedVoice}
                             onNavigate={handleChangeVoiceDirection}
                             availableVoiceCount={Object.keys(audioUrls).length}
                          />
                       </div>
                     </div>
                   </div>
                )}

                {/* 4. CÁC THÔNG TIN KHÁC (Popularity) */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl md:col-span-2">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Mức độ phổ biến</h5>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedCard.vocabulary.popularity === "Cao" ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200" : selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200"}`}>{selectedCard.vocabulary.popularity}</span>
                    {(() => {
                      const totalSegments = 40; const popularity = selectedCard.vocabulary.popularity;
                      const config = { "Cao": { filled: Math.round(totalSegments * 0.8), color: 'bg-green-500', wrapper: 'border-green-400/60 dark:border-green-500/70' }, "Trung bình": { filled: Math.round(totalSegments * 0.5), color: 'bg-amber-500', wrapper: 'border-amber-400/60 dark:border-amber-500/70' }, "default": { filled: Math.round(totalSegments * 0.2), color: 'bg-red-500', wrapper: 'border-red-400/60 dark:border-red-500/70' } };
                      const { filled, color, wrapper } = config[popularity as keyof typeof config] || config["default"];
                      return ( <div className={`flex flex-1 items-center gap-px p-1 rounded-lg border bg-gray-200/50 dark:bg-black/20 shadow-inner ${wrapper}`}> {Array.from({ length: totalSegments }).map((_, i) => (<div key={i} className={`h-4 rounded-[2px] flex-1 ${i < filled ? color : 'bg-gray-300/80 dark:bg-gray-700/60'}`} />))} </div> );
                    })()}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <style>{animations}</style>

      <audio ref={audioRef} src={currentAudioUrl || ''} key={currentAudioUrl} preload="auto" className="hidden" />
      <audio ref={examAudioRef} preload="auto" className="hidden" />

      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        style={{ animation: 'modalBackdropIn 0.3s ease-out forwards', zIndex: zIndex - 1 }}
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 flex flex-col bg-white dark:bg-black" style={{ animation: 'fadeIn 0.3s ease-out forwards', zIndex: zIndex }}>
          <div className="flex items-center justify-between bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex-shrink-0 px-4 py-2">
            <BackButton onClick={onClose} />
            <div className="inline-flex bg-gray-900 dark:bg-black rounded-xl p-1 space-x-1 border border-transparent dark:border-gray-800">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:bg-white/10 hover:text-white'} dark:focus:outline-none ${isActive ? 'dark:bg-gray-800 dark:text-gray-100' : 'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          {renderModalContent()}
      </div>

      {isVoicePopupOpen && audioUrls && (
        <VoiceSelectionPopup
          availableVoices={Object.keys(audioUrls)}
          currentVoice={selectedVoice}
          onSelectVoice={handleSelectVoice}
          onClose={() => setIsVoicePopupOpen(false)}
        />
      )}
    </>
  );
};

export default FlashcardDetailModal;
// --- END OF FILE: src/flashcard.tsx ---
