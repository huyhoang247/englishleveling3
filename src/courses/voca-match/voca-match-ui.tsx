// --- START OF FILE: voca-match-ui.tsx ---

import React, { useMemo, useState } from 'react';
import { VocaMatchProvider, useVocaMatch } from './voca-match-context.tsx'; 
import Confetti from '../../ui/fireworks-effect.tsx';
import VocaMatchLoadingSkeleton from './voca-match-loading.tsx';

// --- UI components and hooks ---
import BackButton from '../../ui/back-button.tsx';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx';
import StreakDisplay from '../../ui/display/streak-display.tsx';

// --- Interfaces ---
interface Definition {
  vietnamese: string;
  english: string;
  explanation: string;
}

interface VocaMatchGameProps {
  onGoBack: () => void;
  selectedPractice: number;
}

// --- Icons ---
const TrophyIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V22h4v-7.34" /><path d="M12 14.66L15.45 8.3A3 3 0 0 0 12.95 4h-1.9a3 3 0 0 0-2.5 4.3Z" /></svg>
);
const RefreshIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg>
);
const BookmarkIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
);
const AudioIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.108 12 5v14c0 .892-1.077 1.337-1.707.707L5.586 15z" /> </svg>
);

// --- COMPONENT: POPUP NHẬN THƯỞNG (Resource Drop) ---
const ResourceRewardPopup: React.FC<{ 
    image: string; 
    amount: number; 
    type: string;
    triggerId: number; 
}> = ({ image, amount, type, triggerId }) => {
    return (
        // Đã sửa class: bottom-32 -> bottom-48 (Dịch lên trên một chút)
        <div key={triggerId} className="fixed bottom-48 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
            <div className="animate-loot-pop relative">
                <img src={image} alt={type} className="w-16 h-16 object-contain drop-shadow-lg" />
                <div className="absolute -bottom-1 -right-1 bg-black/80 text-white text-xs font-lilita px-2 py-0.5 rounded-md border border-white/20 shadow-sm min-w-[28px] text-center animate-fade-in-badge tracking-wide">
                    x{amount}
                </div>
            </div>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
                .font-lilita { font-family: 'Lilita One', cursive; }
                @keyframes loot-pop {
                    0% { opacity: 0; transform: scale(0) translateY(50px) rotate(-45deg); }
                    40% { opacity: 1; transform: scale(1.2) translateY(-30px) rotate(10deg); }
                    60% { transform: scale(0.95) translateY(0) rotate(-5deg); }
                    80% { transform: scale(1.05) translateY(-10px) rotate(3deg); }
                    100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
                }
                @keyframes fade-in-badge {
                    0%, 50% { opacity: 0; transform: scale(0); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-loot-pop { animation: loot-pop 1s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                .animate-fade-in-badge { animation: fade-in-badge 1s ease-out forwards; }
            `}</style>
        </div>
    );
};


// --- UI Sub-components ---
const DefinitionDisplay: React.FC<{ definition: Definition | null }> = ({ definition }) => {
  if (!definition) return null;
  const capitalizedExplanation = definition.explanation
    ? definition.explanation.charAt(0).toUpperCase() + definition.explanation.slice(1)
    : '';

  return (
    <div className="flex-shrink-0 p-4 pt-0">
      <div
        key={definition.english}
        className="bg-white border border-indigo-100 rounded-xl p-4 shadow-md animate-fade-in-up"
      >
        <div className="flex items-center mb-2">
          <BookmarkIcon className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" />
          <h3 className="text-lg font-bold text-gray-800">{definition.english}</h3>
          <span className="text-gray-500 font-medium ml-2">/ {definition.vietnamese}</span>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
          {capitalizedExplanation}
        </p>
      </div>
    </div>
  );
};

const AudioButton: React.FC<{ audioUrl: string | null, onClick: () => void, disabled: boolean, isSelected: boolean, isIncorrect: boolean }> = 
({ audioUrl, onClick, disabled, isSelected, isIncorrect }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = () => {
        if (!audioUrl || isPlaying) return;
        const audio = new Audio(audioUrl);
        setIsPlaying(true);
        audio.play().catch(e => {
            console.error("Error playing audio:", e);
            setIsPlaying(false);
        });
        audio.onended = () => setIsPlaying(false);
    };

    const correctStyle = 'bg-gray-200 text-gray-400 line-through cursor-default';
    const incorrectStyle = 'bg-red-200 ring-2 ring-red-500 animate-shake';

    return (
        <button
            onClick={() => { playAudio(); onClick(); }}
            disabled={disabled || !audioUrl}
            className={`w-full p-3 text-center rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center
                ${disabled ? correctStyle : 'bg-white text-gray-800 hover:bg-indigo-50'}
                ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                ${isIncorrect ? incorrectStyle : ''}
                ${!audioUrl ? 'opacity-50 cursor-not-allowed' : ''}
                ${isPlaying ? 'animate-pulse ring-2 ring-indigo-400' : ''}
            `}
        >
            <AudioIcon className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-indigo-600'}`} />
        </button>
    );
};

// --- Voice Selector with Arrows ---
const VoiceSelector: React.FC = () => {
    const { availableVoices, selectedVoice, setSelectedVoice } = useVocaMatch();

    if (availableVoices.length <= 1) return <div className="w-28 h-6"></div>; // Placeholder to keep layout consistent

    const currentIndex = availableVoices.indexOf(selectedVoice);

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + availableVoices.length) % availableVoices.length;
        setSelectedVoice(availableVoices[newIndex]);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % availableVoices.length;
        setSelectedVoice(availableVoices[newIndex]);
    };

    return (
        <div className="flex items-center justify-center gap-1 bg-black/40 rounded-md border border-white/30 px-1 py-0.5">
            <button onClick={handlePrev} className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center text-white text-xs font-semibold px-1 select-none">
                 <span>{selectedVoice}</span>
            </div>
            <button onClick={handleNext} className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};


// --- Main UI Component that consumes context ---
const VocaMatchUI: React.FC = () => {
  const {
    loading, showEndScreen, showConfetti, score, gameProgress, pairsCompletedInSession, totalPairsInSession,
    leftColumn, rightColumn, selectedLeft, correctPairs, incorrectPair, lastCorrectDefinition, displayedCoins,
    masteryCount, streak, streakAnimation, isAudioMatch, selectedVoice, handleLeftSelect, handleRightSelect,
    resetGame, onGoBack, allWordPairs,
    rewardDrop // Lấy thông tin vật phẩm rơi từ Context
  } = useVocaMatch();

  const matchedVietnameseWords = useMemo(() => {
    if (isAudioMatch) return new Set();
    const matchedSet = new Set<string>();
    correctPairs.forEach(englishWord => {
      const pair = allWordPairs.find(p => p.english === englishWord);
      if (pair) matchedSet.add(pair.vietnamese);
    });
    return matchedSet;
  }, [correctPairs, allWordPairs, isAudioMatch]);


  if (loading) return <VocaMatchLoadingSkeleton />;
  if (showEndScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white">
        <TrophyIcon className="w-20 h-20 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoàn thành!</h2>
        <p className="text-gray-600 mb-2">Bạn đã hoàn thành tất cả các từ có sẵn.</p>
        <p className="text-lg font-medium text-gray-700 mb-6">Tổng điểm: <span className="font-bold text-indigo-600">{score}</span></p>
        <div className="flex gap-4">
          <button onClick={resetGame} className="flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg shadow-sm hover:bg-indigo-200 transition">
            <RefreshIcon className="w-5 h-5" />Chơi lại
          </button>
          <button onClick={onGoBack} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
            Quay về
          </button>
        </div>
      </div>
    );
  }

  const correctStyle = 'bg-gray-200 text-gray-400 line-through cursor-default';
  const incorrectStyle = 'bg-red-200 ring-2 ring-red-500 animate-shake';

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {showConfetti && <Confetti />}

      {/* Hiển thị Popup khi có vật phẩm rơi */}
      {rewardDrop && (
        <ResourceRewardPopup 
            image={rewardDrop.image} 
            amount={rewardDrop.amount} 
            type={rewardDrop.type} 
            triggerId={rewardDrop.id}
        />
      )}

      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <div className="transform scale-90 origin-left">
          <BackButton onClick={onGoBack} label="" title="Quay lại" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
          <MasteryDisplay masteryCount={masteryCount} />
          <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
        </div>
      </header>

      <div className="flex-grow p-4 sm:p-6 flex flex-col min-h-0">
         {/* <<< START: KHỐI HEADER ĐƯỢC THAY ĐỔI */}
        <div className="relative text-white p-4 rounded-xl shadow-lg mb-4 sm:mb-6 flex-shrink-0 overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: "url('https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-quiz.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
            />
            {/* Overlay Black 85% */}
            <div className="absolute inset-0 bg-black/85 z-0" />

            {/* Content Wrapper */}
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                    {/* Dùng bg-black/40 thay vì backdrop-blur */}
                    <div className="bg-black/40 rounded-lg px-2.5 py-1 shadow-inner border border-white/30">
                        <div className="flex items-center">
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                            {Math.min(pairsCompletedInSession + 1, totalPairsInSession)}
                        </span>
                        <span className="mx-0.5 text-white/70 text-xs">/</span>
                        <span className="text-xs text-white/50">{totalPairsInSession}</span>
                        </div>
                    </div>
                    </div>
                    {isAudioMatch && <VoiceSelector />}
                </div>
                <div className="w-full h-3 bg-gray-700/80 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${gameProgress}%` }}>
                    <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                    </div>
                </div>
            </div>
        </div>
        {/* <<< END: KHỐI HEADER ĐƯỢC THAY ĐỔI */}

        <main className="flex-grow grid grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-3">
            {leftColumn.map(item => {
              const isSelected = selectedLeft === item.word;
              const isCorrect = correctPairs.includes(item.word);
              const isIncorrect = incorrectPair?.left === item.word;

              if (isAudioMatch) {
                return (
                  <AudioButton
                    key={item.word}
                    audioUrl={item.audioUrls?.[selectedVoice] ?? null}
                    onClick={() => handleLeftSelect(item.word)}
                    disabled={isCorrect}
                    isSelected={isSelected}
                    isIncorrect={isIncorrect}
                  />
                );
              }

              return (
                <button
                  key={item.word}
                  onClick={() => handleLeftSelect(item.word)}
                  disabled={isCorrect}
                  className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm ${isCorrect ? correctStyle : 'bg-white text-gray-800 hover:bg-indigo-50'} ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''} ${isIncorrect ? incorrectStyle : ''}`}>
                  {item.word}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {rightColumn.map(word => {
              const isCorrect = isAudioMatch ? correctPairs.includes(word) : matchedVietnameseWords.has(word);
              const isIncorrect = incorrectPair?.right === word;
                                            
              return (
                <button
                  key={word}
                  onClick={() => handleRightSelect(word)}
                  disabled={isCorrect || !selectedLeft}
                  className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm ${isCorrect ? correctStyle : 'bg-white text-gray-800'} ${isIncorrect ? incorrectStyle : ''} ${selectedLeft && !isCorrect ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'} ${!isCorrect && 'disabled:opacity-50'}`}>
                  {word}
                </button>
              );
            })}
          </div>
        </main>
        
        <DefinitionDisplay definition={lastCorrectDefinition} />
      </div>

      <style jsx>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.4s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; }
      `}</style>
    </div>
  );
};

// --- Main export: The component that provides the context ---
export default function VocaMatchGame({ onGoBack, selectedPractice }: VocaMatchGameProps) {
  return (
    <VocaMatchProvider onGoBack={onGoBack} selectedPractice={selectedPractice}>
      <VocaMatchUI />
    </VocaMatchProvider>
  );
}
