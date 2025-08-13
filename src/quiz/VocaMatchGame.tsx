// VocaMatchGame.tsx (Upgraded Version)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auth } from '../firebase.js';
import { fetchOrCreateUser, recordGameSuccess } from '../userDataService.ts';
import { allWordPairs, shuffleArray } from './voca-match-data.ts';
import Confetti from '../fill-word/chuc-mung.tsx';

// --- ADDED: Import UI components and hooks ---
import { useAnimateValue } from '../useAnimateValue.ts'; 
import CoinDisplay from '../coin-display.tsx';
import MasteryDisplay from '../mastery-display.tsx'; 
import StreakDisplay from '../streak-display.tsx';

// --- Icons (can be moved to a shared file) ---
const BackIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const TrophyIcon = ({ className }: { className: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V22h4v-7.34"/><path d="M12 14.66L15.45 8.3A3 3 0 0 0 12.95 4h-1.9a3 3 0 0 0-2.5 4.3Z"/></svg> 
);
const RefreshIcon = ({ className }: { className: string }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg> 
);

interface VocaMatchGameProps {
  onGoBack: () => void;
  selectedPractice: number;
}

const GAME_SIZE = 5; // Number of pairs per round

export default function VocaMatchGame({ onGoBack, selectedPractice }: VocaMatchGameProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [playablePairs, setPlayablePairs] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  // --- ADDED: State for UI and game logic ---
  const [coins, setCoins] = useState(0);
  const displayedCoins = useAnimateValue(coins, 500);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  // Game state for the current round
  const [leftColumn, setLeftColumn] = useState<string[]>([]);
  const [rightColumn, setRightColumn] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [correctPairs, setCorrectPairs] = useState<string[]>([]); // Stores matched English words
  const [incorrectPair, setIncorrectPair] = useState<{ left: string, right: string } | null>(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  
  const gameModeId = useMemo(() => `match-${selectedPractice}`, [selectedPractice]);
  
  // MODIFIED: Fetch full user data and filter questions
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Fetch user data, vocab, and completed words in parallel
          const [userData, vocabList, completedSet] = await Promise.all([
            fetchOrCreateUser(user.uid),
            getOpenedVocab(user.uid),
            getCompletedWordsForGameMode(user.uid, gameModeId)
          ]);
          
          setCoins(userData.coins || 0);
          setMasteryCount(userData.masteryCards || 0);
          const userVocabSet = new Set(vocabList.map(v => v.toLowerCase()));
          const relevantPairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));
          const remainingPairs = relevantPairs.filter(pair => !completedSet.has(pair.english.toLowerCase()));

          setPlayablePairs(shuffleArray(remainingPairs));
        } catch (error) {
          console.error("Error fetching data for Voca Match:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, gameModeId]);

  // Setup a new round
  const setupNewRound = useCallback(() => {
    const roundStart = currentRound * GAME_SIZE;
    if (roundStart >= playablePairs.length) {
      setShowEndScreen(true);
      return;
    }
    const roundPairs = playablePairs.slice(roundStart, roundStart + GAME_SIZE);
    
    setLeftColumn(roundPairs.map(p => p.english));
    setRightColumn(shuffleArray(roundPairs.map(p => p.vietnamese)));
    setCorrectPairs([]);
    setSelectedLeft(null);
    setIncorrectPair(null);
  }, [currentRound, playablePairs]);

  useEffect(() => {
    if (!loading) {
      setupNewRound();
    }
  }, [currentRound, loading, setupNewRound]);

  const handleLeftSelect = (englishWord: string) => {
    if (correctPairs.includes(englishWord)) return;
    setSelectedLeft(englishWord);
    setIncorrectPair(null);
  };
  
  const handleRightSelect = async (vietnameseWord: string) => {
    if (!selectedLeft) return;

    const originalPair = allWordPairs.find(p => p.english === selectedLeft);
    if (originalPair && originalPair.vietnamese === vietnameseWord) {
      // --- CORRECT MATCH LOGIC ---
      setCorrectPairs(prev => [...prev, selectedLeft]);
      setSelectedLeft(null);
      setScore(prev => prev + 1);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1500);

      const coinsToAdd = masteryCount * newStreak;
      setCoins(prevCoins => prevCoins + coinsToAdd);
      
      if (user) {
        try {
          await recordGameSuccess(user.uid, gameModeId, selectedLeft, false, coinsToAdd);
        } catch(error) {
            console.error("Failed to record match success:", error);
            setCoins(prevCoins => prevCoins - coinsToAdd); // Rollback coins on error
        }
      }

      if (correctPairs.length + 1 === GAME_SIZE) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setCurrentRound(prev => prev + 1);
        }, 2500);
      }
      
    } else {
      // --- INCORRECT MATCH LOGIC ---
      setIncorrectPair({ left: selectedLeft, right: vietnameseWord });
      setSelectedLeft(null);
      setStreak(0); // Reset streak
      setTimeout(() => setIncorrectPair(null), 800);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setShowEndScreen(false);
    // The useEffect for `currentRound` will handle resetting the board
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-xl font-semibold text-indigo-700">Đang tải dữ liệu...</div>;
  }
  
  if (showEndScreen) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white">
            <TrophyIcon className="w-20 h-20 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoàn thành!</h2>
            <p className="text-gray-600 mb-2">Bạn đã hoàn thành tất cả các từ có sẵn.</p>
            <p className="text-lg font-medium text-gray-700 mb-6">Tổng điểm: <span className="font-bold text-indigo-600">{score}</span></p>
            <div className="flex gap-4">
                <button onClick={resetGame} className="flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg shadow-sm hover:bg-indigo-200 transition">
                    <RefreshIcon className="w-5 h-5"/>
                    Chơi lại
                </button>
                <button onClick={onGoBack} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                    Quay về
                </button>
            </div>
        </div>
    );
  }

  const totalPairsInSession = playablePairs.length;
  const pairsCompletedInSession = currentRound * GAME_SIZE + correctPairs.length;
  const gameProgress = totalPairsInSession > 0 ? (pairsCompletedInSession / totalPairsInSession) * 100 : 0;


  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {showConfetti && <Confetti />}
      
      {/* --- ADDED: HEADER --- */}
      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <button onClick={onGoBack} className="group w-7 h-7 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 active:bg-white/30 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Quay lại">
          <BackIcon className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
          <MasteryDisplay masteryCount={masteryCount} />
          <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
        </div>
      </header>

      <div className="flex-grow p-4 sm:p-6 flex flex-col">
        {/* --- ADDED: PROGRESS BAR AND COUNTER --- */}
        <div className="flex-shrink-0 mb-4">
            <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-600">
                <span>Tiến trình</span>
                <span>{pairsCompletedInSession} / {totalPairsInSession}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${gameProgress}%` }}></div>
            </div>
        </div>

        {/* --- MODIFIED: Main game area --- */}
        <main className="flex-grow grid grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-3">
            {leftColumn.map(word => {
              const isSelected = selectedLeft === word;
              const isCorrect = correctPairs.includes(word);
              const isIncorrect = incorrectPair?.left === word;
              
              return (
                <button
                  key={word}
                  onClick={() => handleLeftSelect(word)}
                  disabled={isCorrect}
                  className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm
                    ${isCorrect ? 'bg-gray-200 text-gray-400 line-through' : 'bg-white text-gray-800 hover:bg-indigo-50'}
                    ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                    ${isIncorrect ? 'bg-red-200 ring-2 ring-red-500 animate-shake' : ''}
                  `}
                >
                  {word}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {rightColumn.map(word => {
              const originalPair = allWordPairs.find(p => p.vietnamese === word);
              const isCorrect = originalPair && correctPairs.includes(originalPair.english);
              const isIncorrect = incorrectPair?.right === word;
              
              return (
                 <button
                  key={word}
                  onClick={() => handleRightSelect(word)}
                  disabled={isCorrect || !selectedLeft}
                  className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm
                    ${isCorrect ? 'bg-gray-200 text-gray-400 line-through' : 'bg-white text-gray-800'}
                    ${isIncorrect ? 'bg-red-200 ring-2 ring-red-500 animate-shake' : ''}
                    ${!isCorrect && selectedLeft ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}
                    ${isCorrect ? 'opacity-100' : 'disabled:opacity-50'}
                  `}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </main>
      </div>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
