// --- START OF FILE: src/flashcard.tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BackButton from '../footer-back.tsx';
import { ExampleSentence, Flashcard as CoreFlashcard } from './flashcard-data.ts';
import { generateAudioUrlsForWord } from './audio-quiz-generator.ts';

// Đổi tên interface để tránh xung đột với tên component, mặc dù vẫn dùng chung cấu trúc từ file data
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

// --- START: CÁC COMPONENT & ICON LẤY TỪ MULTIPLE-UI.TSX ---
const PauseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> );
const VolumeUpIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg> );
const ChevronLeftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );
const ChevronRightIcon = ({ className }: { className:string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg> );

const VoiceStepper: React.FC<{
  currentVoice: string;
  onNavigate: (direction: 'next' | 'previous') => void;
  availableVoiceCount: number;
}> = ({ currentVoice, onNavigate, availableVoiceCount }) => {
  if (availableVoiceCount <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm p-1 rounded-full border border-white/25">
      <button onClick={() => onNavigate('previous')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors duration-200" aria-label="Giọng đọc trước"><ChevronLeftIcon className="w-3 h-3 text-white/80" /></button>
      <div className="text-center w-20 overflow-hidden"><span key={currentVoice} className="text-xs font-semibold text-white animate-fade-in-short">{currentVoice}</span></div>
      <button onClick={() => onNavigate('next')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors duration-200" aria-label="Giọng đọc tiếp theo"><ChevronRightIcon className="w-3 h-3 text-white/80" /></button>
      <style jsx>{` @keyframes fade-in-short { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-short { animation: fade-in-short 0.25s ease-out forwards; } `}</style>
    </div>
  );
};
// --- END: CÁC COMPONENT & ICON ---

// Animation styles - Clean and minimal
const animations = `
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes modalBackdropIn {
    0% { opacity: 0; }
    100% { opacity: 0.4; }
  }
  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .content-transition {
    animation: slideUp 0.3s ease-out;
  }
`;

const FlashcardDetailModal: React.FC<FlashcardDetailModalProps> = ({
  selectedCard,
  showVocabDetail,
  exampleSentencesData,
  onClose,
  currentVisualStyle,
  zIndex = 50,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'example' | 'vocabulary'>('basic');
  
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Matilda');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (showVocabDetail && selectedCard) {
      setActiveTab('basic');
      const urls = generateAudioUrlsForWord(selectedCard.vocabulary.word);
      setAudioUrls(urls);
      setSelectedVoice('Matilda');
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, []);

  if (!showVocabDetail || !selectedCard) {
    return null;
  }

  const getImageUrlForStyle = (card: FlashcardData, style: string): string => {
    const url = (() => {
        switch (style) {
            case 'anime': return card.imageUrl.anime || card.imageUrl.default;
            case 'comic': return card.imageUrl.comic || card.imageUrl.default;
            case 'realistic': return card.imageUrl.realistic || card.imageUrl.default;
            default: return card.imageUrl.default;
        }
    })();
    return url;
  };

  const tabs = [
    { key: 'basic' as const, label: 'Ảnh Gốc' },
    { key: 'example' as const, label: 'Ví Dụ' },
    { key: 'vocabulary' as const, label: 'Từ Vựng' },
  ];

  const renderModalContent = () => {
    const wordToFind = selectedCard.vocabulary.word;

    const filteredSentences = exampleSentencesData.filter(sentence =>
        new RegExp(`\\b${wordToFind}\\b`, 'i').test(sentence.english)
    );

    const highlightWord = (sentence: string, word: string) => {
        const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === word.toLowerCase() ? (
                        <strong key={index} className="text-blue-500 dark:text-blue-400 font-semibold">
                            {part}
                        </strong>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };
    
    switch (activeTab) {
      case 'basic':
        return (
          <div className="flex justify-center items-start flex-grow px-4 pt-2 pb-4 overflow-hidden content-transition">
            <img
              src={getImageUrlForStyle(selectedCard, currentVisualStyle)}
              alt="Ảnh Gốc"
              className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/1024x1536/E0E0E0/333333?text=Lỗi+Ảnh+Gốc`;
              }}
            />
          </div>
        );
      case 'example':
        return (
          <div className="flex-grow overflow-y-auto bg-white dark:bg-black p-6 md:p-8 content-transition">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-sans text-base font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  {wordToFind}
                </span>
              </div>
              
              {filteredSentences.length > 0 ? (
                <div className="space-y-4">
                  {filteredSentences.map((sentence, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900/70 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed font-medium">
                        {highlightWord(sentence.english, wordToFind)}
                      </p>
                      <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm italic">
                        {sentence.vietnamese}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h4 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Không tìm thấy ví dụ</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Chưa có câu ví dụ nào cho từ này trong danh sách.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'vocabulary':
        return (
          <div className="flex-grow overflow-y-auto bg-white dark:bg-black p-6 md:p-8 content-transition">
            <audio ref={audioRef} src={currentAudioUrl || ''} key={currentAudioUrl} preload="auto" className="hidden" />
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* --- START: KHÔI PHỤC GIAO DIỆN CŨ CHO WORD & MEANING --- */}
                {/* Box 1: Word & Meaning (Theo style của file 6) */}
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl md:col-span-2">
                  <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4 dark:bg-blue-900/50 dark:text-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{selectedCard.vocabulary.word}</span>
                  </div>
                  <p className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedCard.vocabulary.meaning}
                  </p>
                </div>
                {/* --- END: KHÔI PHỤC GIAO DIỆN --- */}

                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl md:col-span-2">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Ví dụ</h5>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{selectedCard.vocabulary.example}"
                  </p>
                </div>

                {/* Box 3: Pronunciation (Half Width) */}
                {audioUrls && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Phát âm (Pronunciation)</h5>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <VolumeUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedVoice}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-full border border-gray-700">
                        <button onClick={togglePlay} className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/10 transition-transform duration-200 hover:scale-110 active:scale-100 ${isPlaying ? 'animate-pulse' : ''}`} aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
                          { isPlaying ? <PauseIcon className="w-5 h-5 text-white" /> : <VolumeUpIcon className="w-5 h-5 text-white/80" /> }
                        </button>
                        <VoiceStepper
                          currentVoice={selectedVoice}
                          onNavigate={handleChangeVoiceDirection}
                          availableVoiceCount={Object.keys(audioUrls).length}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Box 4: Popularity (Half Width) */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Mức độ phổ biến</h5>
                  <div className="flex items-center gap-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-bold
                      ${selectedCard.vocabulary.popularity === "Cao" ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200" :
                        selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" :
                        "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200"}
                    `}>
                      {selectedCard.vocabulary.popularity}
                    </span>
                    <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          selectedCard.vocabulary.popularity === "Cao" ? "bg-green-500 w-4/5" :
                          selectedCard.vocabulary.popularity === "Trung bình" ? "bg-amber-500 w-1/2" :
                          "bg-red-500 w-1/5"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl md:col-span-2">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Cụm từ phổ biến</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.phrases.map((phrase, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 px-2.5 py-1 rounded-full text-sm font-medium">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Từ đồng nghĩa</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.synonyms.map((word, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-1 rounded-full text-sm font-medium">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Từ trái nghĩa</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.vocabulary.antonyms.map((word, index) => (
                      <span key={index} className="bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300 px-2.5 py-1 rounded-full text-sm font-medium">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{animations}</style>

      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        style={{
            animation: 'modalBackdropIn 0.3s ease-out forwards',
            zIndex: zIndex - 1
        }}
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 flex flex-col bg-white dark:bg-black"
           style={{
               animation: 'fadeIn 0.3s ease-out forwards',
               zIndex: zIndex
           }}
      >
          <div className="flex justify-center bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex-shrink-0 px-4 py-3">
            <div className="inline-flex bg-gray-900 dark:bg-black rounded-xl p-1 space-x-1 border border-transparent dark:border-gray-800">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className={`
                      px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }
                      dark:focus:outline-none 
                      ${isActive
                        ? 'dark:bg-gray-800 dark:text-gray-100'
                        : 'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                      }
                    `}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {renderModalContent()}
          
          <BackButton onClick={onClose} />
      </div>
    </>
  );
};

export default FlashcardDetailModal;
