// --- START OF FILE phrase-game.tsx ---

import React, { useState, useMemo, useCallback } from 'react';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
// Import a VirtualKeyboard component from the keyboard.tsx file
import VirtualKeyboard from '../../ui/keyboard.tsx';

// --- Icons used in this component ---
const XMarkIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );

// --- Type Definitions for the Game ---
export interface GameSentenceData {
  english: string;
  vietnamese: string;
  originalIndex: number;
}

// --- Game Setup Popup Component (Unchanged) ---
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
      { label: 'All', value: 'all' as const },
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
           <p>A random set of <span className="font-bold text-white">10 example sentences</span> will be selected.</p>
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

// --- Main Game Mode Component (Updated) ---

type AnswerState = {
  value: string;
  status: 'pending' | 'correct' | 'incorrect';
};

interface ActiveInput {
  sentenceIndex: number;
  blankIndex: number;
  correctAnswer: string;
}

interface GameModeProps {
  sentences: GameSentenceData[];
  difficulty: number | 'all';
  onExit: () => void;
}
export const GameMode: React.FC<GameModeProps> = ({ sentences, difficulty, onExit }) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, Record<number, AnswerState>>>({});
    const [activeInput, setActiveInput] = useState<ActiveInput | null>(null);
    
    const vocabularySetForGame = useMemo(() => new Set(defaultVocabulary.map(v => v.toLowerCase().trim())), []);

    const processedSentences = useMemo(() => {
        return sentences.map(original => {
            const parts = original.english.split(/(\s+|[.,?!;:"'])/g);
            const wordIndices: number[] = [];

            parts.forEach((part, index) => {
                if (/[a-zA-Z']/.test(part) && part.length > 0) {
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

    const { totalBlanks, correctAnswers } = useMemo(() => {
        let blanks = 0;
        let correct = 0;
        processedSentences.forEach((sentence, sIdx) => {
            let blankCounter = 0;
            sentence.parts.forEach(part => {
                if (typeof part === 'object' && part.answer) {
                    blanks++;
                    if (userAnswers[sIdx]?.[blankCounter]?.status === 'correct') {
                        correct++;
                    }
                    blankCounter++;
                }
            });
        });
        return { totalBlanks: blanks, correctAnswers: correct };
    }, [processedSentences, userAnswers]);

    const handleFocus = useCallback((sentenceIndex: number, blankIndex: number, correctAnswer: string) => {
        if (userAnswers[sentenceIndex]?.[blankIndex]?.status === 'correct') {
            return;
        }
        setActiveInput({ sentenceIndex, blankIndex, correctAnswer });
    }, [userAnswers]);

    const handleKeyboardInput = useCallback((newValue: string) => {
        if (!activeInput) return;

        const { sentenceIndex, blankIndex, correctAnswer } = activeInput;
        let newStatus: AnswerState['status'] = 'pending';

        if (newValue.length === correctAnswer.length) {
            newStatus = newValue.trim().toLowerCase() === correctAnswer.trim().toLowerCase() ? 'correct' : 'incorrect';
            if (newStatus === 'correct') {
                setActiveInput(null);
            }
        }

        setUserAnswers(prev => ({
            ...prev,
            [sentenceIndex]: {
                ...prev[sentenceIndex],
                [blankIndex]: { value: newValue, status: newStatus },
            },
        }));
    }, [activeInput]);
    
    return (
        <div className="h-full w-full bg-black flex flex-col text-white">
            {/* --- Overlay (MODIFIED) --- */}
            {/* Removed 'backdrop-blur-sm' and changed bg-opacity to 50% for a lighter effect */}
            <div
              onClick={() => setActiveInput(null)}
              className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out
                ${activeInput ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
              }
            />

            <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm shadow-md flex-shrink-0">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        <button onClick={onExit} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                            Exit Game
                        </button>
                        <div className="text-lg font-bold">
                            Score: <span className="text-green-400">{correctAnswers}</span> / <span className="text-white">{totalBlanks}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 sm:p-6" >
                <div className="max-w-4xl mx-auto space-y-6 pb-4">
                    {processedSentences.map((sentence, sIdx) => {
                        let blankCounter = 0;
                        return (
                            <div key={sentence.original.originalIndex} className="bg-gray-900/70 p-4 rounded-xl border border-gray-800">
                                <p className="text-gray-200 text-lg leading-relaxed font-medium pb-4">
                                    {sentence.parts.map((part, pIdx) => {
                                        if (typeof part === 'string') {
                                            return <span key={pIdx}>{part}</span>;
                                        } else if (part.answer) {
                                            const currentBlankIndex = blankCounter++;
                                            const answerState = userAnswers[sIdx]?.[currentBlankIndex] || { value: '', status: 'pending' };

                                            let borderColor = 'border-slate-600';
                                            if (answerState.status === 'correct') borderColor = 'border-green-500';
                                            if (answerState.status === 'incorrect') borderColor = 'border-red-500';
                                            
                                            // --- START: REDESIGNED INPUT BOX ---
                                            return (
                                                <span key={pIdx} className="inline-block relative mx-1 my-1 align-baseline">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFocus(sIdx, currentBlankIndex, part.answer);
                                                        }}
                                                        disabled={answerState.status === 'correct'}
                                                        className={`relative min-w-[4ch] bg-slate-800 text-white rounded-md border-2 ${borderColor} outline-none transition-all duration-200 disabled:opacity-70 disabled:cursor-default`}
                                                    >
                                                        {/* Sizer: Invisible text that defines the button's width. Added px-2 for padding. */}
                                                        <span className="block opacity-0 font-medium whitespace-nowrap px-2 py-0.5">
                                                            {part.answer}
                                                        </span>
                                                        
                                                        {/* Display: The user's actual input, absolutely positioned to overlay the sizer. */}
                                                        <span className="absolute inset-0 flex items-center justify-center font-medium whitespace-nowrap">
                                                            {answerState.value}
                                                        </span>
                                                    </button>

                                                    {answerState.status === 'incorrect' && (
                                                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-400 font-mono bg-slate-900 px-1 rounded">{part.answer}</span>
                                                    )}
                                                </span>
                                            );
                                            // --- END: REDESIGNED INPUT BOX ---
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

            <footer
              className={`sticky bottom-0 z-50 bg-slate-900 border-t border-slate-700/50 flex-shrink-0 transition-transform duration-300 ease-in-out
                ${activeInput ? 'translate-y-0' : 'translate-y-full'}`
              }
            >
                {activeInput && (
                    <VirtualKeyboard
                        userInput={userAnswers[activeInput.sentenceIndex]?.[activeInput.blankIndex]?.value || ''}
                        setUserInput={handleKeyboardInput}
                        wordLength={activeInput.correctAnswer.length}
                        disabled={userAnswers[activeInput.sentenceIndex]?.[activeInput.blankIndex]?.status === 'correct'}
                    />
                )}
            </footer>
        </div>
    );
};
