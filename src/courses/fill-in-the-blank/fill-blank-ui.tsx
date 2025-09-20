// --- START OF FILE: fill-word-home.tsx ---

import React, { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react'; // <<< THÊM useRef
import { auth } from '../../firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- NEW: Import Context Provider and Hook ---
import { FillWordProvider, useFillWord } from './fill-blank-context.tsx';
import FillWordLoadingSkeleton from './fill-blank-loading.tsx'; // <<<--- DÒNG IMPORT MỚI
import BackButton from '../../ui/back-button.tsx';

import { defaultImageUrls } from '../../voca-data/image-url.ts';
import { exampleData } from '../../voca-data/example-data.ts';
import { phraseData } from '../../phrase-data.ts';

import WordSquaresInput from '../../ui/vocabulary-input.tsx';
import Confetti from '../../ui/fireworks-effect.tsx';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import ImageCarousel3D from '../../ui/image-carousel-3d.tsx';
import VirtualKeyboard from '../../ui/keyboard.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx';
import StreakDisplay from '../../ui/display/streak-display.tsx';


// --- INTERFACES & STATIC COMPONENTS (KHÔNG THAY ĐỔI) ---
interface VocabularyGameProps {
  onGoBack: () => void;
  selectedPractice: number;
}
const CountdownTimer: React.FC<{ timeLeft: number; totalTime: number }> = memo(({ timeLeft, totalTime }) => { const radius = 20; const circumference = 2 * Math.PI * radius; const progress = Math.max(0, timeLeft / totalTime); const strokeDashoffset = circumference * (1 - progress); const getTimeColor = () => { if (timeLeft <= 0) return 'text-gray-400'; if (timeLeft <= 10) return 'text-red-500'; if (timeLeft <= 20) return 'text-yellow-500'; return 'text-indigo-400'; }; const ringColorClass = getTimeColor(); return ( <div className="relative flex items-center justify-center w-8 h-8"> <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 44 44"> <circle className="text-gray-200" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="22" cy="22" /> <circle className={`${ringColorClass} transition-all duration-500`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="transparent" r={radius} cx="22" cy="22" style={{ strokeDasharray: circumference, strokeDashoffset }} /> </svg> <span className={`font-bold text-xs ${ringColorClass}`}>{Math.max(0, timeLeft)}</span> </div> ); });
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg>);
const PhraseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg> );
const ExamIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> </svg> );
// <<< START: THÊM CÁC ICON CHO AUDIO PLAYER
const VolumeUpIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg> );
const PauseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> );
const ChevronLeftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /> </svg> );
const ChevronRightIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /> </svg> );
// <<< END: THÊM CÁC ICON CHO AUDIO PLAYER
const generateImageUrl = (imageIndex?: number) => { if (imageIndex !== undefined && typeof imageIndex === 'number') { const adjustedIndex = imageIndex - 1; if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) { return defaultImageUrls[adjustedIndex]; } } return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`; };
const capitalizeFirstLetter = (str: string) => { if (!str) return ''; return str.charAt(0).toUpperCase() + str.slice(1); };
const highlightText = (text: string, regex: RegExp) => { if (!text) return <span>{text}</span>; const parts = text.split(regex); return (<span>{parts.map((part, i) => regex.test(part) ? (<strong key={i} className="text-blue-500 font-semibold">{part}</strong>) : (part))}</span>); };
const HeaderTag: React.FC<{ word: string }> = ({ word }) => ( <div className="flex items-center gap-2 mb-6"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> <span className="font-sans text-base font-bold uppercase tracking-widest text-blue-600">{word}</span> </div> );
const BasePopup: React.FC<{ isOpen: boolean; onClose: () => void; currentWord: string; title: string; dataSource: { english: string; vietnamese: string }[]; noResultsMessage: string; isPhrase?: boolean; }> = ({ isOpen, onClose, currentWord, title, dataSource, noResultsMessage, isPhrase = false }) => { const wordsToSearch = useMemo(() => currentWord.split(' '), [currentWord]); const [activeTab, setActiveTab] = useState(0); useEffect(() => { setActiveTab(0); }, [currentWord]); const searchWord = wordsToSearch[activeTab]; const searchRegexForHighlight = useMemo(() => { if (!searchWord || !searchWord.trim()) return null; const escapedWord = searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); return new RegExp(`(\\b${escapedWord}\\b)`, 'ig'); }, [searchWord]); const searchResults = useMemo(() => { if (!searchWord) return []; const searchRegex = new RegExp(`\\b${searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i'); return dataSource.filter(item => searchRegex.test(item.english)); }, [searchWord, dataSource]); if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}> <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}> <div className="p-4 border-b border-gray-200 flex-shrink-0"> <div className="flex items-center justify-between"> <h3 className="text-lg font-bold text-gray-800">{title}</h3> <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors z-10"> <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/close-icon.webp" alt="Close" className="w-5 h-5" /> </button> </div> {wordsToSearch.length > 1 && ( <nav className="mt-3 -mb-4 -mx-4"> <div className="flex space-x-4 px-4"> {wordsToSearch.map((word, index) => (<button key={index} onClick={() => setActiveTab(index)} className={`${activeTab === index ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all`}>{capitalizeFirstLetter(word)}</button>))} </div> </nav> )} </div> <div className="flex-grow overflow-y-auto bg-white p-6"> <div className="max-w-4xl mx-auto"> <HeaderTag word={searchWord.toUpperCase()} /> {searchResults.length > 0 && searchRegexForHighlight ? ( <div className="space-y-4"> {searchResults.map((result, index) => ( <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100"> <p className={`text-gray-800 text-base leading-relaxed ${isPhrase ? 'font-semibold' : 'font-medium'}`}> {highlightText(result.english, searchRegexForHighlight)} </p> <p className="mt-2 text-gray-500 text-sm italic">{result.vietnamese}</p> </div> ))} </div> ) : ( <div className="text-center py-12 px-6 bg-gray-50 rounded-xl"> <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> <h4 className="mt-4 text-lg font-semibold text-gray-700">{noResultsMessage}</h4> <p className="mt-1 text-sm text-gray-500">Chưa có dữ liệu cho từ này.</p> </div> )} </div> </div> </div> </div> ); };
const allPhraseParts = Array.from( new Map( phraseData.flatMap(sentence => sentence.parts).map(p => { const english = capitalizeFirstLetter(p.english); const vietnamese = capitalizeFirstLetter(p.vietnamese); return [english.toLowerCase(), { english, vietnamese }]; }) ).values() );
const PhrasePopup: React.FC<{ isOpen: boolean; onClose: () => void; currentWord: string; }> = ({ isOpen, onClose, currentWord }) => ( <BasePopup isOpen={isOpen} onClose={onClose} currentWord={currentWord} title="Phrases" dataSource={allPhraseParts} noResultsMessage="Không tìm thấy cụm từ" isPhrase={true} /> );
const ExamPopup: React.FC<{ isOpen: boolean; onClose: () => void; currentWord: string; }> = ({ isOpen, onClose, currentWord }) => ( <BasePopup isOpen={isOpen} onClose={onClose} currentWord={currentWord} title="Exams" dataSource={exampleData} noResultsMessage="Không tìm thấy ví dụ" /> );

// <<< START: CẬP NHẬT AUDIO PLAYER COMPONENT
const AudioPlayerUI: React.FC<{
  audioUrls: { [voiceName: string]: string };
  currentWord: string;
}> = ({ audioUrls, currentWord }) => {
  const [selectedVoice, setSelectedVoice] = useState('Matilda');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const availableVoices = useMemo(() => Object.keys(audioUrls), [audioUrls]);
  const currentAudioUrl = audioUrls[selectedVoice];

  const handleNavigateVoice = useCallback((direction: 'next' | 'previous') => {
    if (availableVoices.length <= 1) return;
    const currentIndex = availableVoices.indexOf(selectedVoice);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % availableVoices.length;
    } else {
      nextIndex = (currentIndex - 1 + availableVoices.length) % availableVoices.length;
    }
    setSelectedVoice(availableVoices[nextIndex]);
  }, [availableVoices, selectedVoice]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPauseOrEnd = () => setIsPlaying(false);
    
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPauseOrEnd);
    audio.addEventListener('ended', onPauseOrEnd);

    if (currentAudioUrl) {
      audio.play().catch(e => console.log("Autoplay prevented by browser"));
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPauseOrEnd);
      audio.removeEventListener('ended', onPauseOrEnd);
    };
  }, [currentAudioUrl]);

  return (
    <div className="w-full h-[320px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
        <audio ref={audioRef} src={currentAudioUrl} key={currentAudioUrl} preload="auto" className="hidden"/>
        
        {/* --- KHỐI ĐIỀU KHIỂN AUDIO --- */}
        <div className="absolute top-0 left-0 right-0 w-full p-3 flex justify-between items-center z-10">
            {/* Nút Play/Pause (bên trái) */}
            <button 
              onClick={togglePlay} 
              className={`flex items-center justify-center w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/25 transition-transform duration-200 hover:scale-110 active:scale-100 ${isPlaying ? 'animate-pulse' : ''}`} 
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
              {isPlaying ? <PauseIcon className="w-4 h-4 text-white" /> : <VolumeUpIcon className="w-4 h-4 text-white/80" />}
            </button>
            
            {/* Bộ chọn giọng đọc (bên phải) */}
            <div className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm p-1 rounded-full border border-white/25">
                <button onClick={() => handleNavigateVoice('previous')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors" aria-label="Giọng đọc trước">
                    <ChevronLeftIcon className="w-3 h-3 text-white/80" />
                </button>
                <div className="text-center w-20 overflow-hidden"><span key={selectedVoice} className="text-xs font-semibold text-white animate-fade-in-short">{selectedVoice}</span></div>
                <button onClick={() => handleNavigateVoice('next')} className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors" aria-label="Giọng đọc tiếp theo">
                    <ChevronRightIcon className="w-3 h-3 text-white/80" />
                </button>
            </div>
        </div>
        
        {/* --- TÊN TỪ VỰNG (Ở GIỮA) --- */}
        <div className="flex-grow flex items-center justify-center">
            <p className="text-4xl sm:text-5xl font-bold tracking-wider">{currentWord.toUpperCase()}</p>
        </div>

        <style jsx>{` @keyframes fade-in-short { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-short { animation: fade-in-short 0.25s ease-out forwards; }`}</style>
    </div>
  );
};
// <<< END: CẬP NHẬT AUDIO PLAYER COMPONENT

// --- NEW: The UI Component, free of logic ---
const FillWordGameUI: React.FC<{ onGoBack: () => void; selectedPractice: number; }> = ({ onGoBack, selectedPractice }) => {
  // --- Get everything from context ---
  const {
    loading, error, gameOver, currentWord, vocabularyList, isMultiWordGame,
    displayedCoins, streak, masteryCount, timeLeft, TOTAL_TIME,
    completedCount, totalCount, progressPercentage, userInput, isCorrect,
    filledWords, activeBlankIndex, shake, streakAnimation, showConfetti,
    showImagePopup, showPhrasePopup, showExamPopup,
    setUserInput, setActiveBlankIndex, checkAnswer, handleMultiWordCheck,
    resetGame, setShowImagePopup, setShowPhrasePopup, setShowExamPopup,
  } = useFillWord();

  const handleImageClick = useCallback(() => setShowImagePopup(true), [setShowImagePopup]);
  
  const carouselImageUrls = useMemo(() => {
    if (!currentWord) return [`https://placehold.co/400x320/E0E7FF/4338CA?text=Loading...`];
    if (currentWord.imageIndex !== undefined) {
      const imageUrl = generateImageUrl(currentWord.imageIndex);
      return [imageUrl, imageUrl, imageUrl];
    }
    return [`https://placehold.co/400x320/93c5fd/1e3a8a?text=?`, `https://placehold.co/400x320/a5b4fc/1e3a8a?text=Guess`, `https://placehold.co/400x320/c4b5fd/1e3a8a?text=The+Word`];
  }, [currentWord]);
  
  const multiWordCurrentBlankLength = useMemo(() => {
    if (!isMultiWordGame || !currentWord || activeBlankIndex === null) return Infinity;
    const correctWords = currentWord.word.split(' ');
    return correctWords[activeBlankIndex]?.length ?? Infinity;
  }, [currentWord, activeBlankIndex, isMultiWordGame]);

  // --- Render logic based on context state ---
  if (loading) return <FillWordLoadingSkeleton />; // <<<--- THAY ĐỔI Ở ĐÂY
  if (error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 text-center p-4">{error}</div>;
  if (vocabularyList.length === 0 && !loading && !error) return (
    <div className="flex flex-col items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
        Bạn không có đủ từ vựng cho bài tập này.
        <br/> 
        {(selectedPractice % 100 === 7) ? "Cần có câu chứa ít nhất 1 từ bạn đã học." : (selectedPractice % 100 === 6) ? "Cần có câu chứa ít nhất 5 từ bạn đã học." : (selectedPractice % 100 === 5) ? "Cần có câu chứa ít nhất 4 từ bạn đã học." : (selectedPractice % 100 === 4) ? "Cần có câu chứa ít nhất 3 từ bạn đã học." : (selectedPractice % 100 === 3) ? "Cần có câu chứa ít nhất 2 từ bạn đã học." : "Hãy vào màn hình 'Lật thẻ' để học thêm!"}
    </div>
  );
  
  const displayCount = gameOver || !currentWord ? completedCount : Math.min(completedCount + 1, totalCount);

  // --- JSX is identical, but now uses values from context ---
  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl font-sans">
      <style jsx global>{` @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } } .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; } `}</style>

      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <div className="transform scale-90 origin-left">
          <BackButton onClick={onGoBack} label="" title="Quay lại" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3"><CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} /><MasteryDisplay masteryCount={masteryCount} /><StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} /></div>
      </header>
      
      <main className="flex-grow px-4 sm:px-8 pt-8 pb-8 w-full flex flex-col items-center">
        {showConfetti && <Confetti />}
        <div className="w-full flex flex-col items-center">
          {gameOver ? (
            <div className="text-center py-8 w-full">
              <div className="bg-white p-8 rounded-2xl shadow-lg mb-6"><h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2><p className="text-xl mb-4">Bạn đã hoàn thành tất cả các từ trong bài tập này.</p><div className="w-full bg-gray-200 rounded-full h-4 mb-6"><div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `100%` }}></div></div></div>
              <button onClick={resetGame} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"><RefreshIcon className="mr-2 h-5 w-5" /> Chơi lại</button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30"><div className="flex items-center"><span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">{displayCount}</span><span className="mx-0.5 text-white/70 text-xs">/</span><span className="text-xs text-white/50">{totalCount}</span></div></div>
                  <div className="flex items-center gap-2">
                    {currentWord && (
                      <>
                        <button onClick={() => setShowPhrasePopup(true)} className="group w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner border border-white/30 hover:bg-white/35 active:bg-white/40 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Xem cụm từ"><PhraseIcon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" /></button>
                        <button onClick={() => setShowExamPopup(true)} className="group w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner border border-white/30 hover:bg-white/35 active:bg-white/40 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Xem ví dụ"><ExamIcon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" /></button>
                      </>
                    )}
                    <CountdownTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} />
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative"><div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}><div className="absolute top-0 h-1 w-full bg-white opacity-30"></div></div></div>
                { (selectedPractice % 100 !== 1 && selectedPractice % 100 !== 8) && currentWord && ( // <<< SỬA ĐỔI: Không hiển thị question cho practice 1 và 8
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mt-4">
                    <p className="text-lg sm:text-xl font-semibold text-white leading-tight">{currentWord.question?.split('___').map((part, i, arr) => ( <React.Fragment key={i}> {part} {i < arr.length - 1 && <span className="font-bold text-indigo-300">___</span>} </React.Fragment> ))}</p>
                    {currentWord.vietnameseHint && (<p className="text-white/80 text-sm mt-2 italic">{currentWord.vietnameseHint}</p>)}
                  </div>
                )}
              </div>
              
              {currentWord ? (
                <div className="w-full mt-6 space-y-6">
                  {(selectedPractice % 100 === 1) && <ImageCarousel3D imageUrls={carouselImageUrls} onImageClick={handleImageClick} word={currentWord.word} />}
                  {/* <<< START: THÊM HIỂN THỊ AUDIO PLAYER CHO PRACTICE 8 */}
                  {(selectedPractice % 100 === 8) && currentWord.audioUrls && (
                    <AudioPlayerUI audioUrls={currentWord.audioUrls} currentWord={currentWord.word}/>
                  )}
                  {/* <<< END: THÊM HIỂN THỊ AUDIO PLAYER CHO PRACTICE 8 */}
                  
                  {isMultiWordGame ? (
                    <div className="w-full flex flex-col items-center gap-4">
                      <div className={`p-4 bg-white rounded-lg shadow-md w-full transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
                        <div className="text-lg sm:text-xl font-medium text-gray-700 leading-relaxed">
                           {currentWord.question?.split('___').map((part, index, arr) => (
                            <React.Fragment key={index}>
                              <span>{part}</span>
                              {index < arr.length - 1 && (
                                <button
                                  onClick={() => !isCorrect && setActiveBlankIndex(index)}
                                  disabled={!!isCorrect}
                                  className={`inline-block align-middle mx-1 my-0.5 px-3 py-0.5 rounded-md font-medium transition-all duration-200 ${filledWords[index] ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gray-200 text-gray-500'} ${activeBlankIndex === index && !isCorrect ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50 text-indigo-700' : ''} ${isCorrect ? 'cursor-not-allowed' : 'hover:bg-indigo-100'}`}
                                >
                                  {filledWords[index] ? filledWords[index].toLowerCase() : (activeBlankIndex === index && !isCorrect) ? (userInput.toLowerCase() || '...') : '...'}
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {activeBlankIndex !== null && !isCorrect && (
                        <div className="w-full flex flex-col items-center gap-4 transition-all duration-300">
                          <div className="w-full">
                            <VirtualKeyboard userInput={userInput} setUserInput={setUserInput} wordLength={multiWordCurrentBlankLength} disabled={!!isCorrect}/>
                            <div className="flex justify-center mt-2">
                              <button onClick={handleMultiWordCheck} disabled={!userInput.trim()} className="px-8 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Kiểm tra
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <WordSquaresInput word={currentWord.word} userInput={userInput} setUserInput={setUserInput} checkAnswer={checkAnswer} isCorrect={isCorrect} disabled={!!isCorrect} />
                  )}
                </div>
              ) : <div className='pt-10 font-bold text-gray-500'>Đang tải từ...</div>}
            </>
          )}
        </div>
        {showImagePopup && currentWord && (selectedPractice % 100 === 1) && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-2xl p-6 max-w-3xl max-h-full overflow-auto shadow-xl">
                <button onClick={() => setShowImagePopup(false)} className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors z-10">
                    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/close-icon.webp" alt="Close" className="w-6 h-6" />
                </button>
              <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">{currentWord.word}</h3>
              <img src={generateImageUrl(currentWord.imageIndex)} alt={currentWord.word} className="rounded-lg shadow-md max-w-full max-h-full object-contain" />
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100"><p className="font-medium text-gray-700 mb-1">Định nghĩa:</p><p className="text-gray-800">{currentWord.hint}</p></div>
            </div>
          </div>
        )}
        {showPhrasePopup && currentWord && ( <PhrasePopup isOpen={showPhrasePopup} onClose={() => setShowPhrasePopup(false)} currentWord={currentWord.word} /> )}
        {showExamPopup && currentWord && ( <ExamPopup isOpen={showExamPopup} onClose={() => setShowExamPopup(false)} currentWord={currentWord.word} /> )}
      </main>
    </div>
  );
}

// --- NEW: The main exported component that wraps the UI in the Provider ---
export default function VocabularyGame({ onGoBack, selectedPractice }: VocabularyGameProps) {
  const [user, setUser] = useState<User | null>(null);

  // This effect now only manages the user object needed by the provider
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <FillWordProvider user={user} selectedPractice={selectedPractice}>
      <FillWordGameUI onGoBack={onGoBack} selectedPractice={selectedPractice} />
    </FillWordProvider>
  );
}
