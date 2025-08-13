// VocaMatchGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auth } from '../firebase.js';
import { fetchOrCreateUser, getOpenedVocab, getCompletedWordsForGameMode, recordGameSuccess } from '../userDataService.ts';
import { allWordPairs, shuffleArray } from './voca-match-data.ts';
import Confetti from '../fill-word/chuc-mung.tsx';

// --- Icons (can be moved to a shared file) ---
const BackIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const TrophyIcon = ({ className }: { className: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V22h4v-7.34"/><path d="M12 14.66L15.45 8.3A3 3 0 0 0 12.95 4h-1.9a3 3 0 0 0-2.5 4.3Z"/></svg> 
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

  // Game state for the current round
  const [leftColumn, setLeftColumn] = useState<string[]>([]);
  const [rightColumn, setRightColumn] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [correctPairs, setCorrectPairs] = useState<string[]>([]); // Stores matched English words
  const [incorrectPair, setIncorrectPair] = useState<{ left: string, right: string } | null>(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  
  const gameModeId = useMemo(() => `match-${selectedPractice}`, [selectedPractice]);
  
  // Fetch user data and filter questions
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [vocabList, completedSet] = await Promise.all([
            getOpenedVocab(user.uid),
            getCompletedWordsForGameMode(user.uid, gameModeId)
          ]);
          
          const userVocabSet = new Set(vocabList.map(v => v.toLowerCase()));

          // Filter all pairs to only include those where the English word is in the user's opened vocab
          const relevantPairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));

          // Filter out pairs that have already been completed in this game mode
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
  useEffect(() => {
    if (playablePairs.length > 0) {
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
    } else if (!loading) {
        // If there are no playable pairs left and not loading, it's the end.
        setShowEndScreen(true);
    }
  }, [currentRound, playablePairs, loading]);

  const handleLeftSelect = (englishWord: string) => {
    if (correctPairs.includes(englishWord)) return;
    setSelectedLeft(englishWord);
    setIncorrectPair(null);
  };
  
  const handleRightSelect = async (vietnameseWord: string) => {
    if (!selectedLeft) return;

    const originalPair = allWordPairs.find(p => p.english === selectedLeft);
    if (originalPair && originalPair.vietnamese === vietnameseWord) {
      // Correct Match
      setCorrectPairs(prev => [...prev, selectedLeft]);
      setSelectedLeft(null);
      
      // Save progress to Firestore
      if (user) {
        try {
          await recordGameSuccess(user.uid, gameModeId, selectedLeft, false, 10); // 10 coins per correct match
        } catch(error) {
            console.error("Failed to record match success:", error);
            // Optional: add UI feedback for the user about the error
        }
      }

      if (correctPairs.length + 1 === GAME_SIZE) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setCurrentRound(prev => prev + 1);
        }, 2000);
      }
      
    } else {
      // Incorrect Match
      setIncorrectPair({ left: selectedLeft, right: vietnameseWord });
      setSelectedLeft(null);
      setTimeout(() => setIncorrectPair(null), 800);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-xl font-semibold text-indigo-700">Đang tải dữ liệu...</div>;
  }
  
  if (showEndScreen) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <TrophyIcon className="w-20 h-20 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoàn thành!</h2>
            <p className="text-gray-600 mb-6">Bạn đã hoàn thành tất cả các từ có sẵn trong bài luyện tập này.</p>
            <button onClick={onGoBack} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                <BackIcon className="w-5 h-5"/>
                Quay về
            </button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      {showConfetti && <Confetti />}
      <header className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
            <button onClick={onGoBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800 rounded-full">
                <BackIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Voca Match</h1>
            <div className="w-10"></div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(correctPairs.length / GAME_SIZE) * 100}%` }}></div>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column (English) */}
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
                  ${isCorrect ? 'bg-gray-200 text-gray-400 line-through' : 'bg-white text-gray-800'}
                  ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                  ${isIncorrect ? 'bg-red-200 ring-2 ring-red-500 animate-shake' : ''}
                `}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Right Column (Vietnamese) */}
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
                className={`w-full p-3 text-center text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50
                  ${isCorrect ? 'bg-gray-200 text-gray-400 line-through' : 'bg-white text-gray-800'}
                  ${isIncorrect ? 'bg-red-200 ring-2 ring-red-500 animate-shake' : ''}
                  ${!isCorrect && selectedLeft ? 'hover:bg-blue-50' : ''}
                `}
              >
                {word}
              </button>
            );
          })}
        </div>
      </main>
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
