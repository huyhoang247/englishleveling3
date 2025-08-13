import React, { useState, useEffect, useMemo } from 'react';

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

// List of quotes for the game
const quotes = [
    "WHERE THERE IS LOVE THERE IS LIFE",
    "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO",
    "SUCCESS IS NOT FINAL FAILURE IS NOT FATAL IT IS THE COURAGE TO CONTINUE THAT COUNTS",
    "THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF THEIR DREAMS",
    "YOU MUST BE THE CHANGE YOU WISH TO SEE IN THE WORLD"
];

// Main App Component
export default function App() {
    // State for the current quote, cipher, and user guesses
    const [quote, setQuote] = useState('');
    const [cipher, setCipher] = useState({});
    const [guesses, setGuesses] = useState({}); // Stores mappings from number -> guessed letter
    const [activeInput, setActiveInput] = useState(null); // Tracks the currently focused input
    const [incorrectInputs, setIncorrectInputs] = useState(new Set()); // Tracks inputs that are currently incorrect and shaking

    // Function to start a new game
    const startNewGame = () => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const newCipher = generateCipher();
        setQuote(randomQuote);
        setCipher(newCipher);
        setGuesses({});
        setActiveInput(null);
        setIncorrectInputs(new Set());
    };

    // Initialize the game on the first render
    useEffect(() => {
        startNewGame();
    }, []);
    
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
        if (Object.keys(cipher).length === 0 || Object.keys(guesses).length === 0) return false;
        return Object.entries(cipher).every(([letter, number]) => guesses[number] === letter);
    }, [guesses, cipher]);

    return (
        <div className="bg-[#F8F5F2] min-h-screen flex flex-col items-center justify-center font-serif p-4 text-[#4A4A4A]">
            {/* CSS for the shake animation */}
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

            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-[#6A5A5A] mb-2">Cryptogram</h1>
                <p className="text-lg text-[#8B7E7E]">Giải mã câu nói nổi tiếng bằng cách thay thế các con số bằng chữ cái.</p>
            </div>

            {/* Game Board */}
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
                            const isGuessed = guessedLetter && guessedLetter !== '';
                            const isCorrect = isGuessed && guessedLetter === numberToLetterMap[number];
                            const isActive = activeInput === uniqueKey;
                            const isIncorrect = incorrectInputs.has(uniqueKey);

                            let bgColor = 'bg-transparent';
                            if (isActive) bgColor = 'bg-yellow-200';
                            else if (isIncorrect) bgColor = 'bg-red-300'; // Red when shaking
                            else if (isGuessed) bgColor = isCorrect ? 'bg-green-200' : 'bg-transparent';
                            
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
                                    />
                                    <span className="text-sm md:text-base text-[#8B7E7E] mt-1">{number}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Success Message */}
            {isSolved && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg mb-6 animate-pulse" role="alert">
                    <p className="font-bold">Chúc mừng!</p>
                    <p>Bạn đã giải mã thành công câu đố.</p>
                </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={startNewGame}
                    className="px-6 py-3 bg-[#6A5A5A] text-white font-bold rounded-lg shadow-md hover:bg-[#524646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A5A5A] transition-all duration-200"
                >
                    Trò chơi mới
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
