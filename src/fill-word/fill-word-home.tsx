import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
import { db } from '../firebase.js'; // Import the Firestore database instance
import { collection, getDocs } from 'firebase/firestore'; // Import necessary Firestore functions

// Define the structure of a vocabulary item (without hint)
interface VocabularyItem {
  word: string;
  // Removed: hint: string;
}

export default function VocabularyGame() {
  // Initialize vocabularyList as an empty array, it will be populated from Firestore
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true); // State to track loading status

  // Fetch vocabulary list from Firestore on component mount
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        setLoading(true); // Start loading
        const querySnapshot = await getDocs(collection(db, 'listVocabulary'));
        const data: VocabularyItem[] = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          // Ensure the data structure matches VocabularyItem (only word)
          return {
            word: docData.word,
            // Removed: hint: docData.hint // No hint field
          };
        });
        setVocabularyList(data);
        setLoading(false); // End loading
      } catch (error) {
        console.error("Error fetching vocabulary from Firestore:", error);
        setLoading(false); // End loading even if there's an error
        // Optionally, display an error message to the user
      }
    };

    fetchVocabulary();
  }, []); // Empty dependency array means this effect runs once on mount

  // Initialize the game or select a new word when vocabularyList is loaded or changes
  useEffect(() => {
    if (vocabularyList.length > 0 && !gameOver) {
      selectRandomWord();
    } else if (vocabularyList.length === 0 && !loading) {
        // Handle case where no vocabulary is fetched
        console.log("No vocabulary found in Firestore.");
        setGameOver(true); // Or display a specific message
    }
  }, [vocabularyList, gameOver, loading]); // Depend on vocabularyList, gameOver, and loading state

  // Select a random word that hasn't been used yet
  const selectRandomWord = () => {
    const unusedWords = vocabularyList.filter(item => !usedWords.includes(item.word));

    if (unusedWords.length === 0) {
      setGameOver(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    setCurrentWord(unusedWords[randomIndex]);
    setUserInput('');
    setFeedback('');
    setIsCorrect(null);
  };

  // Check the user's answer
  const checkAnswer = () => {
    if (!currentWord || !userInput.trim()) return;

    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback('Chính xác!');
      setIsCorrect(true);
      setScore(score + 1);
      setUsedWords([...usedWords, currentWord.word]);
      setShowConfetti(true);

      // Hide confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Wait a bit before moving to the next word
      setTimeout(() => {
        selectRandomWord();
      }, 1500);
    } else {
      // Removed hint from feedback message
      setFeedback(`Không đúng, hãy thử lại!`);
      setIsCorrect(false);
    }
  };

  // Generate a placeholder image based on the word
  const generateImageUrl = (word: string) => {
    // Using placehold.co for placeholder images
    return `https://placehold.co/400x320/E0E7FF/4338CA?text=${encodeURIComponent(word)}`;
  };


  // Reset the game
  const resetGame = () => {
    setUsedWords([]);
    setScore(0);
    setGameOver(false);
    // Re-select a word from the potentially updated vocabularyList
    if (vocabularyList.length > 0) {
        selectRandomWord();
    } else {
        // If vocabulary list is empty after reset (shouldn't happen if fetch was successful)
        setLoading(true); // Maybe try fetching again or show an error
    }
  };

  // Submit form on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  // Confetti component (remains the same)
  const Confetti = () => {
    const confettiPieces = Array(50).fill(0);

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {confettiPieces.map((_, index) => {
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${Math.random() * 3 + 2}s`;
          const size = `${Math.random() * 10 + 5}px`;
          const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
          const color = colors[Math.floor(Math.random() * colors.length)];

          return (
            <div
              key={index}
              className={`absolute ${color} opacity-80 rounded-full`}
              style={{
                left,
                top: '-10px',
                width: size,
                height: size,
                animation: `fall ${animationDuration} linear forwards`,
              }}
            />
          );
        })}

        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans rounded-2xl"> {/* Added rounded-2xl back */}
      {showConfetti && <Confetti />}

      <div className="w-full flex flex-col items-center">
        {loading ? (
            <div className="text-center py-8 text-indigo-800 font-bold">Đang tải từ vựng...</div>
        ) : gameOver ? (
          <div className="text-center py-8 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2>
              <p className="text-xl mb-4">Điểm của bạn: <span className="font-bold text-indigo-600">{score}/{vocabularyList.length}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full"
                  style={{ width: `${(score / vocabularyList.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <span className="mr-2">🔄</span>
              Chơi lại
            </button>
          </div>
        ) : (
          <>
            <div className="w-full flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl mr-2">⭐</span>
                <span className="font-bold text-gray-800">{score}/{vocabularyList.length}</span>
              </div>
              <div className="h-2 w-1/2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${(usedWords.length / vocabularyList.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-800 font-medium">{vocabularyList.length - usedWords.length}</span>
                <span className="ml-1 text-gray-500">còn lại</span>
              </div>
            </div>

            {currentWord && (
              <div className="w-full space-y-6">
                {/* Image card */}
                <div
                  className="relative w-full h-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-102 group"
                  onClick={() => setShowImagePopup(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 flex flex-col items-center justify-center">
                    <span className="text-white text-8xl font-bold mb-2">?</span>
                    <span className="text-white text-lg opacity-80">Chạm để xem</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-center">Đoán từ này là gì?</p>
                  </div>
                </div>

                {/* Word Squares Input Component */}
                <WordSquaresInput
                  word={currentWord.word}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  checkAnswer={checkAnswer}
                  handleKeyPress={handleKeyPress}
                  feedback={feedback}
                  isCorrect={isCorrect}
                  disabled={isCorrect === true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Image popup */}
      {showImagePopup && currentWord && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 max-w-3xl max-h-full overflow-auto shadow-2xl">
            <button
              onClick={() => setShowImagePopup(false)}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
            <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">{currentWord.word}</h3>
            <img
              src={generateImageUrl(currentWord.word)}
              alt={currentWord.word}
              className="rounded-lg shadow-md max-w-full max-h-full"
            />
            {/* Removed hint display section */}
            {/*
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="font-medium text-gray-700 mb-1">Định nghĩa:</p>
              <p className="text-gray-800">{currentWord.hint}</p>
            </div>
            */}
          </div>
        </div>
      )}
    </div>
  );
}
