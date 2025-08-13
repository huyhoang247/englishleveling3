// VocaMatchGame.tsx (Final Version with all features)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auth } from '../firebase.js';
import { fetchOrCreateUser, getOpenedVocab, getCompletedWordsForGameMode, recordGameSuccess } from '../userDataService.ts';
import { allWordPairs, shuffleArray } from './voca-match-data.ts';
import Confetti from '../fill-word/chuc-mung.tsx';

// --- UI components and hooks ---
import { useAnimateValue } from '../useAnimateValue.ts';
import CoinDisplay from '../coin-display.tsx';
import MasteryDisplay from '../mastery-display.tsx';
import StreakDisplay from '../streak-display.tsx';

// --- Definition data ---
import detailedMeaningsText from '../vocabulary-definitions.ts';

// --- Icons ---
const BackIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const TrophyIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V22h4v-7.34" /><path d="M12 14.66L15.45 8.3A3 3 0 0 0 12.95 4h-1.9a3 3 0 0 0-2.5 4.3Z" /></svg>
);
const RefreshIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg>
);
const BookmarkIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
);

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

const GAME_SIZE = 5; // Number of pairs per round

// --- Definition Display Component ---
const DefinitionDisplay: React.FC<{ definition: Definition | null }> = ({ definition }) => {
  if (!definition) return null;

  return (
    <div className="flex-shrink-0 p-4 pt-0">
      <div
        key={definition.english} // Key to re-trigger animation on change
        className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-4 shadow-md animate-fade-in-up"
      >
        <div className="flex items-center mb-2">
          <BookmarkIcon className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" />
          <h3 className="text-lg font-bold text-gray-800">{definition.english}</h3>
          <span className="text-gray-500 font-medium ml-2">/ {definition.vietnamese}</span>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
          {definition.explanation}
        </p>
      </div>
    </div>
  );
};


// --- Main Game Component ---
export default function VocaMatchGame({ onGoBack, selectedPractice }: VocaMatchGameProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [playablePairs, setPlayablePairs] = useState<any[]>([]);
  const [totalEligiblePairs, setTotalEligiblePairs] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  // UI and game logic state
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
  const [correctPairs, setCorrectPairs] = useState<string[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<{ left: string, right: string } | null>(null);
  const [lastCorrectDefinition, setLastCorrectDefinition] = useState<Definition | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);

  const gameModeId = useMemo(() => `match-${selectedPractice}`, [selectedPractice]);

  const definitionsMap = useMemo(() => {
    const definitions: { [key: string]: Definition } = {};
    const lines = detailedMeaningsText.trim().split('\n');
    lines.forEach(line => {
      if (line.trim() === '') return;
      const match = line.match(/^(.+?)\s+\((.+?)\)\s+là\s+(.*)/);
      if (match) {
        const vietnameseWord = match[1].trim();
        const englishWord = match[2].trim();
        const explanation = match[3].trim();
        definitions[englishWord.toLowerCase()] = {
          vietnamese: vietnameseWord,
          english: englishWord,
          explanation: explanation,
        };
      }
    });
    return definitions;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [userData, vocabList, completedSet] = await Promise.all([
            fetchOrCreateUser(user.uid),
            getOpenedVocab(user.uid),
            getCompletedWordsForGameMode(user.uid, gameModeId)
          ]);
          setCoins(userData.coins || 0);
          setMasteryCount(userData.masteryCards || 0);
          const userVocabSet = new Set(vocabList.map(v => v.toLowerCase()));
          const allEligiblePairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));
          const remainingPairs = allEligiblePairs.filter(pair => !completedSet.has(pair.english.toLowerCase()));
          setPlayablePairs(shuffleArray(remainingPairs));
          setTotalEligiblePairs(allEligiblePairs);
        } catch (error) {
          console.error("Error fetching data for Voca Match:", error);
          setPlayablePairs([]);
          setTotalEligiblePairs([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setPlayablePairs([]);
        setTotalEligiblePairs([]);
      }
    };
    fetchData();
  }, [user, gameModeId]);

  const setupNewRound = useCallback(() => {
    const roundStart = currentRound * GAME_SIZE;
    if (playablePairs.length > 0 && roundStart >= playablePairs.length) {
      setShowEndScreen(true);
      return;
    }
    const roundPairs = playablePairs.slice(roundStart, roundStart + GAME_SIZE);
    if (roundPairs.length === 0 && !loading) {
      setShowEndScreen(true);
      return;
    }
    setLeftColumn(roundPairs.map(p => p.english));
    setRightColumn(shuffleArray(roundPairs.map(p => p.vietnamese)));
    setCorrectPairs([]);
    setSelectedLeft(null);
    setIncorrectPair(null);
    setLastCorrectDefinition(null); // Clear definition on new round
  }, [currentRound, playablePairs, loading]);

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
      // Correct match logic
      setCorrectPairs(prev => [...prev, selectedLeft]);
      setSelectedLeft(null);
      setScore(prev => prev + 1);

      const definition = definitionsMap[selectedLeft.toLowerCase()];
      if (definition) {
        setLastCorrectDefinition(definition);
      }

      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1500);

      const coinsToAdd = masteryCount * newStreak;
      setCoins(prevCoins => prevCoins + coinsToAdd);

      if (user) {
        try {
          await recordGameSuccess(user.uid, gameModeId, selectedLeft, false, coinsToAdd);
        } catch (error) {
          console.error("Failed to record match success:", error);
          setCoins(prevCoins => prevCoins - coinsToAdd);
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
      // Incorrect match logic
      setIncorrectPair({ left: selectedLeft, right: vietnameseWord });
      setSelectedLeft(null);
      setStreak(0);
      setLastCorrectDefinition(null); // Hide definition on wrong answer
      setTimeout(() => setIncorrectPair(null), 800);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setShowEndScreen(false);
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
            <RefreshIcon className="w-5 h-5" />Chơi lại
          </button>
          <button onClick={onGoBack} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
            Quay về
          </button>
        </div>
      </div>
    );
  }

  const totalPairsInSession = totalEligiblePairs.length;
  const completedWordsBeforeSession = totalEligiblePairs.length - playablePairs.length;
  const pairsCompletedInSession = completedWordsBeforeSession + score;
  const gameProgress = totalPairsInSession > 0 ? (pairsCompletedInSession / totalPairsInSession) * 100 : 0;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {showConfetti && <Confetti />}

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

      <div className="flex-grow p-4 sm:p-6 flex flex-col min-h-0">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-inner border border-white/30">
                <div className="flex items-center">
                  <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                    {Math.min(pairsCompletedInSession + 1, totalPairsInSession)}
                  </span>
                  <span className="mx-0.5 text-white/70 text-xs">/</span>
                  <span className="text-xs text-white/50">{totalPairsInSession}</span>
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-white/90">Tiến Độ</p>
          </div>
          <div className="w-full h-3 bg-gray-700/80 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${gameProgress}%` }}>
              <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
            </div>
          </div>
        </div>

        <main className="flex-grow grid grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-3">
            {leftColumn.map(word => {
              const isSelected = selectedLeft === word;
              const isCorrect = correctPairs.includes(word);
              const isIncorrect = incorrectPair?.left === word;
              return (
                <button key={word} onClick={() => handleLeftSelect(word)} disabled={isCorrect} className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm ${isCorrect ? 'bg-gray-200 text-gray-400 line-through cursor-default' : 'bg-white text-gray-800 hover:bg-indigo-50'} ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''} ${isIncorrect ? 'bg-red-200 ring-2 ring-red-500 animate-shake' : ''}`}>
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
                <button key={word} onClick={() => handleRightSelect(word)} disabled={isCorrect || !selectedLeft} className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm ${isCorrect ? 'bg-gray-200 text-gray-400 line-through cursor-default' : 'bg-white text-gray-800'} ${isIncorrect ? 'bg-red-200 ring-2 ring-red-500 animate-shake' : ''} ${!isCorrect && selectedLeft ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'} ${isCorrect ? 'opacity-100' : 'disabled:opacity-50'}`}>
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
}
