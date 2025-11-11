// --- START OF FILE phrase-game.tsx ---

import React, { useState, useMemo, useCallback } from 'react';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';

// --- Icons used in this component ---
const XMarkIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );

// --- Type Definitions for the Game ---
export interface GameSentenceData {
  english: string;
  vietnamese: string;
  originalIndex: number;
}

// --- Game Setup Popup Component ---
interface GameSetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (difficulty: number | 'all') => void;
  sentenceCount: number;
}

export const GameSetupPopup: React.FC<GameSetupPopupProps> = ({ isOpen, onClose, onStartGame, sentenceCount }) => {
  const [difficulty, setDifficulty] = useState<number | 'all'>(1);

  if (!isOpen) return null;

  const handleStart = () => {
    if (sentenceCount < 10) {
      alert("Not enough sentences to start the game. Please clear filters or select a different one.");
      return;
    }
    onStartGame(difficulty);
  }

  const difficultyOptions = [
      { label: '1 Word', value: 1 as const },
      { label: '2 Words', value: 2 as const },
      { label: '3 Words', value: 3 as const },
      { label: '4 Words', value: 4 as const },
      { label: '5 Words', value: 5 as const },
      { label: 'All Vocabulary', value: 'all' as const },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Game Mode Setup</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 space-y-6 text-slate-300">
           <p>A random set of <span className="font-bold text-white">10 example sentences</span> will be selected from the current list ({sentenceCount} available).</p>
           <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Choose difficulty (words to hide):</label>
              <div className="grid grid-cols-3 gap-2">
                 {difficultyOptions.map(opt => (
                     <button 
                       key={opt.value} 
                       onClick={() => setDifficulty(opt.value)} 
                       className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${difficulty === opt.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                     >
                       {opt.label}
                     </button>
                 ))}
              </div>
           </div>
        </div>
        <footer className="p-4 border-t border-slate-700">
          <button 
            onClick={handleStart}
            disabled={sentenceCount < 10}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
          {sentenceCount < 10 && <p className="text-xs text-amber-400 text-center mt-2">Need at least 10 sentences. Try clearing filters.</p>}
        </footer>
      </div>
    </div>
  );
};

// --- Main Game Mode Component ---
interface GameModeProps {
  sentences: GameSentenceData[];
  difficulty: number | 'all';
  onExit: () => void;
}
export const GameMode: React.FC<GameModeProps> = ({ sentences, difficulty, onExit }) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, Record<number, string>>>({});
    const [isChecking, setIsChecking] = useState(false);
    
    const vocabularySetForGame = useMemo(() => new Set(defaultVocabulary.map(v => v.toLowerCase().trim())), []);

    const processedSentences = useMemo(() => {
        return sentences.map(original => {
            const parts = original.english.split(/(\s+|[.,?!;:"'])/g);
            const wordIndices: number[] = [];

            parts.forEach((part, index) => {
                if (/[a-zA-Z]/.test(part)) { // Check if the part is a word
                    wordIndices.push(index);
                }
            });

            let indicesToHide: Set<number>;

            if (difficulty === 'all') {
                indicesToHide = new Set(wordIndices.filter(index => vocabularySetForGame.has(parts[index].toLowerCase())));
            } else {
                const shuffledIndices = [...wordIndices].sort(() => 0.5 - Math.random());
                indicesToHide = new Set(shuffledIndices.slice(0, Math.min(difficulty, wordIndices.length)));
            }

            if (indicesToHide.size === 0 && wordIndices.length > 0) {
                indicesToHide.add(wordIndices[Math.floor(Math.random() * wordIndices.length)]);
            }
            
            const processedParts = parts.map((part, index) => {
                if (indicesToHide.has(index)) {
                    return { answer: part };
                }
                return part;
            });

            return { original, parts: processedParts };
        });
    }, [sentences, difficulty, vocabularySetForGame]);

    const handleInputChange = useCallback((sentenceIndex: number, blankIndex: number, value: string) => {
        if (isChecking) return;
        setUserAnswers(prev => ({
            ...prev,
            [sentenceIndex]: { ...prev[sentenceIndex], [blankIndex]: value }
        }));
    }, [isChecking]);

    const handleCheckAnswers = useCallback(() => setIsChecking(true), []);
    const handleTryAgain = useCallback(() => {
        setIsChecking(false);
        setUserAnswers({});
    }, []);

    let totalBlanks = 0;
    let correctAnswers = 0;

    if (isChecking) {
        processedSentences.forEach((sentence, sIdx) => {
            let blankCounter = 0;
            sentence.parts.forEach(part => {
                if (typeof part === 'object' && part.answer) {
                    totalBlanks++;
                    const userAnswer = userAnswers[sIdx]?.[blankCounter]?.trim().toLowerCase();
                    const correctAnswer = part.answer.trim().toLowerCase();
                    if (userAnswer === correctAnswer) {
                        correctAnswers++;
                    }
                    blankCounter++;
                }
            });
        });
    }

    return (
        <div className="h-full w-full bg-black flex flex-col text-white">
            <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm shadow-md flex-shrink-0">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        <h1 className="text-xl font-bold text-white">Fill in the Blanks</h1>
                        <button onClick={onExit} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                            Exit Game
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {processedSentences.map((sentence, sIdx) => {
                        let blankCounter = 0;
                        return (
                            <div key={sentence.original.originalIndex} className="bg-gray-900/70 p-4 rounded-xl border border-gray-800">
                                <p className="text-gray-200 text-lg leading-relaxed font-medium pb-4">
                                    {sentence.parts.map((part, pIdx) => {
                                        if (typeof part === 'string') {
                                            return <span key={pIdx}>{part}</span>;
                                        } else if (part.answer) {
                                            const currentBlankIndex = blankCounter;
                                            blankCounter++;
                                            const userAnswer = userAnswers[sIdx]?.[currentBlankIndex] || '';
                                            const isCorrect = isChecking && userAnswer.trim().toLowerCase() === part.answer.trim().toLowerCase();

                                            let borderColor = 'border-slate-600 focus-within:border-blue-500';
                                            if (isChecking) borderColor = isCorrect ? 'border-green-500' : 'border-red-500';

                                            return (
                                                <span key={pIdx} className="inline-block relative mx-1 align-bottom">
                                                    <input
                                                        type="text"
                                                        value={userAnswer}
                                                        onChange={(e) => handleInputChange(sIdx, currentBlankIndex, e.target.value)}
                                                        disabled={isChecking}
                                                        className={`bg-slate-800 text-center text-white p-1 rounded-md border-2 w-32 ${borderColor} outline-none transition-colors`}
                                                        style={{ width: `${Math.max(part.answer.length, 5)}ch` }}
                                                        autoCapitalize="none" autoComplete="off" spellCheck="false"
                                                    />
                                                    {isChecking && !isCorrect && (
                                                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-400 font-mono bg-slate-900 px-1 rounded">{part.answer}</span>
                                                    )}
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </p>
                                <p className="mt-2 text-gray-400 text-sm italic">{sentence.original.vietnamese}</p>
                            </div>
                        );
                    })}
                </div>
            </main>

            <footer className="sticky bottom-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 flex-shrink-0">
                <div className="max-w-4xl mx-auto p-3 flex justify-center items-center gap-4 h-20">
                    {isChecking ? (
                        <div className='text-center'>
                            <div className="text-lg font-bold">
                                Score: <span className="text-green-400">{correctAnswers}</span> / <span className="text-white">{totalBlanks}</span>
                            </div>
                            <button onClick={handleTryAgain} className="mt-1 px-5 py-1 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors">
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleCheckAnswers} className="px-8 py-3 text-lg font-bold rounded-lg bg-green-600 hover:bg-green-500 transition-colors">
                            Check Answers
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

// --- END OF FILE phrase-game.tsx ---
