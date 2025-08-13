// --- START OF FILE Cryptogram.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auth } from '../firebase.js';
import { getOpenedVocab } from '../userDataService.ts';

// Helper function to generate a new cipher map
const generateCipher = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // Shuffle the alphabet to create a random cipher
    for (let i = alphabet.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
    }
    const newCipher = {};
    alphabet.forEach((letter, index) => {
        // Map each letter to a number from 1 to 26
        newCipher[letter] = index + 1;
    });
    return newCipher;
};

// Interface for props - Simplified
interface CryptogramGameProps {
    onGoBack: () => void;
}

// Main Component
export default function CryptogramGame({ onGoBack }: CryptogramGameProps) {
    // --- START: NEW STATE MANAGEMENT ---
    const [puzzleWord, setPuzzleWord] = useState<string | null>(null);
    const [userVocab, setUserVocab] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState(auth.currentUser);
    // --- END: NEW STATE MANAGEMENT ---

    const [quote, setQuote] = useState('');
    const [cipher, setCipher] = useState({});
    const [guesses, setGuesses] = useState({}); // Stores mappings from number -> guessed letter
    const [activeInput, setActiveInput] = useState(null); // Tracks the currently focused input
    const [incorrectInputs, setIncorrectInputs] = useState(new Set()); // Tracks inputs that are currently incorrect and shaking

    // Auth listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
          setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Function to select a new suitable word from a list
    const selectNewWord = useCallback((vocabList: string[]) => {
        if (vocabList.length > 0) {
            // Filter for words with at least 3 letters and only alphabetic characters
            const suitableWords = vocabList.filter(word => word.length >= 3 && /^[A-Z]+$/i.test(word));
            if (suitableWords.length > 0) {
                const randomWord = suitableWords[Math.floor(Math.random() * suitableWords.length)];
                setPuzzleWord(randomWord); // Set the internal state
                return true;
            }
        }
        return false;
    }, []);

    // Fetch vocabulary and initialize the first game
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            setError(null);
            getOpenedVocab(user.uid)
                .then(vocab => {
                    setUserVocab(vocab);
                    if (!selectNewWord(vocab)) {
                        setError("Bạn cần học thêm từ vựng (từ 3 chữ cái, không ký tự đặc biệt) để chơi chế độ này.");
                    }
                })
                .catch(err => {
                    console.error("Lỗi khi tải từ vựng cho Cryptogram:", err);
                    setError("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setError("Vui lòng đăng nhập để chơi.");
            setIsLoading(false);
        }
    }, [user, selectNewWord]);

    // Function to start a new game based on a given word
    const startNewGame = useCallback((newWord: string) => {
        const preparedWord = newWord.toUpperCase().replace(/[^A-Z\s]/g, '');
        const newCipher = generateCipher();
        setQuote(preparedWord);
        setCipher(newCipher);
        setGuesses({});
        setActiveInput(null);
        setIncorrectInputs(new Set());
    }, []);
    
    // Initialize or update the game when the internal puzzleWord state changes
    useEffect(() => {
        if (puzzleWord) {
            startNewGame(puzzleWord);
        }
    }, [puzzleWord, startNewGame]);
    
    // Create a reverse map from number to the correct letter for easy validation
    const numberToLetterMap = useMemo(() => {
        const map = {};
        for (const letter in cipher) {
            map[cipher[letter]] = letter;
        }
        return map;
    }, [cipher]);

    // Memoize the processed puzzle data to avoid recalculating on every render
    const puzzle = useMemo(() => {
        if (!quote || !cipher) return [];
        return quote.split(' ').map(word => 
            word.split('').map(char => {
                const isLetter = /[A-Z]/.test(char);
                return {
                    char: isLetter ? char : null,
                    display: isLetter ? null : char,
                    number: isLetter ? cipher[char] : null,
                };
            })
        );
    }, [quote, cipher]);

    // Handle user input changes
    const handleInputChange = (number, value, uniqueKey) => {
        const upperValue = value.toUpperCase();
        if (/^[A-Z]$/.test(upperValue) || value === '') {
            setGuesses(prevGuesses => ({ ...prevGuesses, [number]: upperValue }));

            // If the guess is incorrect, trigger the shake and clear effect
            if (upperValue && upperValue !== numberToLetterMap[number]) {
                setIncorrectInputs(prev => new Set(prev.add(uniqueKey)));

                setTimeout(() => {
                    setGuesses(prev => {
                        const newGuesses = { ...prev };
                        // Only clear if the incorrect value is still there
                        if (newGuesses[number] === upperValue) {
                           delete newGuesses[number];
                        }
                        return newGuesses;
                    });
                    setIncorrectInputs(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(uniqueKey);
                        return newSet;
                    });
                }, 820); // Duration matches the CSS animation
            }
        }
    };

    // Check if the puzzle is solved correctly
    const isSolved = useMemo(() => {
        if (!quote || Object.keys(cipher).length === 0) return false;
        const uniqueLetters = [...new Set(quote.replace(/\s/g, ''))];
        if (uniqueLetters.length === 0) return false;
        if (Object.keys(guesses).length < uniqueLetters.length) return false;
        
        return uniqueLetters.every(letter => {
            const number = cipher[letter];
            return guesses[number] === letter;
        });
    }, [guesses, cipher, quote]);

    // Internal handler for the "New Game" button
    const handleNewGameRequest = () => {
        if (!selectNewWord(userVocab)) {
            alert('Không còn từ mới nào phù hợp để chơi!');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#F8F5F2] min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-[#6A5A5A]">Đang tải câu đố...</h1>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="bg-[#F8F5F2] min-h-screen flex flex-col items-center justify-center p-4 text-center">
                 <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                    <button onClick={onGoBack} className="px-4 py-2 bg-white/50 rounded-lg shadow-sm hover:bg-white transition-colors duration-200 text-gray-700 font-semibold">
                        &larr; Quay lại
                    </button>
                </header>
                <h1 className="text-xl font-bold text-red-600 mb-4">Lỗi</h1>
                <p className="text-lg text-[#6A5A5A]">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F5F2] min-h-screen flex flex-col items-center justify-center font-serif p-4 text-[#4A4A4A]">
            <style>{`
                @keyframes shake {
                  10%, 90% { transform: translate3d(-1px, 0, 0); }
                  20%, 80% { transform: translate3d(2px, 0, 0); }
                  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                  40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .shake {
                  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>

            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                <button onClick={onGoBack} className="px-4 py-2 bg-white/50 rounded-lg shadow-sm hover:bg-white transition-colors duration-200 text-gray-700 font-semibold">
                    &larr; Quay lại
                </button>
            </header>

            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-[#6A5A5A] mb-2">Cryptogram</h1>
                <p className="text-lg text-[#8B7E7E]">Giải mã từ vựng bằng cách thay thế các con số bằng chữ cái.</p>
            </div>

            <div className="max-w-4xl w-full flex flex-col items-center gap-y-4 md:gap-y-6 mb-8">
                {puzzle.map((word, wordIndex) => (
                    <div key={wordIndex} className="flex flex-wrap justify-center items-end gap-x-2 md:gap-x-3">
                        {word.map((item, letterIndex) => {
                            const uniqueKey = `${wordIndex}-${letterIndex}`;
                            if (item.display) {
                                return <span key={uniqueKey} className="text-3xl md:text-4xl font-bold leading-none mb-4">{item.display}</span>;
                            }
                            const number = item.number;
                            const guessedLetter = guesses[number];
                            const isActive = activeInput === uniqueKey;
                            const isIncorrect = incorrectInputs.has(uniqueKey);

                            let bgColor = 'bg-transparent';
                            if (isActive) bgColor = 'bg-yellow-200';
                            else if (isIncorrect) bgColor = 'bg-red-300';
                            
                            return (
                                <div key={uniqueKey} className="flex flex-col items-center">
                                    <input
                                        type="text"
                                        maxLength="1"
                                        value={guesses[number] || ''}
                                        onChange={(e) => handleInputChange(number, e.target.value, uniqueKey)}
                                        onFocus={() => setActiveInput(uniqueKey)}
                                        onBlur={() => setActiveInput(null)}
                                        className={`w-10 h-12 md:w-12 md:h-14 text-center text-3xl md:text-4xl font-bold uppercase border-b-2 border-[#6A5A5A] focus:outline-none transition-colors duration-300 rounded-t-md ${bgColor} ${isIncorrect ? 'shake' : ''}`}
                                        aria-label={`Letter for number ${number}`}
                                        disabled={isSolved}
                                    />
                                    <span className="text-sm md:text-base text-[#8B7E7E] mt-1">{number}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {isSolved && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg mb-6 animate-pulse" role="alert">
                    <p className="font-bold">Chính xác!</p>
                    <p>Đáp án đúng là: <span className="font-mono">{quote}</span></p>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={handleNewGameRequest}
                    className="px-6 py-3 bg-[#6A5A5A] text-white font-bold rounded-lg shadow-md hover:bg-[#524646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A5A5A] transition-all duration-200"
                >
                    Từ mới
                </button>
                 <button
                    onClick={() => setGuesses({})}
                    className="px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200"
                >
                    Làm lại
                </button>
            </div>
        </div>
    );
}

// --- END OF FILE Cryptogram.tsx ---
