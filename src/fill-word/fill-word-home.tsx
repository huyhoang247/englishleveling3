import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase.js'; // Import db instance

export default function VocabularyGame() {
  // State để lưu danh sách từ vựng từ Firestore
  const [vocabularyList, setVocabularyList] = useState([]);
  // State để theo dõi trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để lưu lỗi nếu có
  const [error, setError] = useState(null);

  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [usedWords, setUsedWords] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Effect để tải dữ liệu từ Firestore khi component mount
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        // Lấy dữ liệu từ collection 'listVocabulary'
        const querySnapshot = await getDocs(collection(db, 'listVocabulary'));
        const vocabData = querySnapshot.docs.map(doc => ({
          id: doc.id, // Có thể cần id cho một số mục đích sau này
          ...doc.data()
        }));
        setVocabularyList(vocabData);
        setLoading(false); // Kết thúc trạng thái tải
        // Sau khi tải xong, chọn từ đầu tiên để bắt đầu trò chơi
        if (vocabData.length > 0) {
            selectRandomWord(vocabData, []); // Truyền danh sách từ vựng đã tải và danh sách từ đã dùng
        } else {
            setError("Không tìm thấy từ vựng nào trong Firestore.");
        }
      } catch (err) {
        console.error("Lỗi khi tải từ vựng từ Firestore:", err);
        setError("Không thể tải từ vựng. Vui lòng thử lại sau.");
        setLoading(false); // Kết thúc trạng thái tải ngay cả khi có lỗi
      }
    };

    fetchVocabulary();
  }, []); // Chạy một lần khi component mount

  // Select a random word that hasn't been used yet
  // Cập nhật hàm này để nhận vocabularyList và usedWords làm tham số
  const selectRandomWord = (vocabList, currentUsedWords) => {
    const unusedWords = vocabList.filter(item => !currentUsedWords.includes(item.word));

    if (unusedWords.length === 0) {
      setGameOver(true);
      setCurrentWord(null); // Đảm bảo currentWord là null khi game over
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
      const newUsedWords = [...usedWords, currentWord.word];
      setUsedWords(newUsedWords);
      setShowConfetti(true);

      // Hide confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Wait a bit before moving to the next word
      setTimeout(() => {
        selectRandomWord(vocabularyList, newUsedWords); // Truyền danh sách từ vựng và danh sách đã dùng mới
      }, 1500);
    } else {
      setFeedback(`Không đúng, hãy thử lại! Từ đúng là: ${currentWord.word}`);
      setIsCorrect(false);
    }
  };

  // Generate a placeholder image based on the word
  const generateImageUrl = (word) => {
    // Sử dụng API placeholder hoặc tạo URL hình ảnh từ nguồn khác nếu có
    return `https://placehold.co/400x320/e0e7ff/4338ca?text=${encodeURIComponent(word)}`;
  };

  // Reset the game
  const resetGame = () => {
    setUsedWords([]);
    setScore(0);
    setGameOver(false);
    selectRandomWord(vocabularyList, []); // Reset game, chọn từ mới từ danh sách đầy đủ
  };

  // Submit form on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentWord && userInput.trim() && isCorrect !== true) {
      checkAnswer();
    }
  };

  // Confetti component (unchanged)
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

  // Hiển thị trạng thái tải hoặc lỗi
  if (loading) {
    return <div className="text-center text-indigo-700 text-xl font-semibold mt-8">Đang tải từ vựng...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 text-xl font-semibold mt-8">Lỗi: {error}</div>;
  }

  // Hiển thị trò chơi khi dữ liệu đã sẵn sàng
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans">
      {showConfetti && <Confetti />}

      <div className="w-full flex flex-col items-center">
        {gameOver ? (
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
            {/* Đảm bảo vocabularyList.length > 0 trước khi hiển thị */}
            {vocabularyList.length > 0 && (
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
            )}


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
      {showImagePopup && currentWord && ( // Đảm bảo currentWord tồn tại trước khi hiển thị popup
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
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="font-medium text-gray-700 mb-1">Định nghĩa:</p>
              <p className="text-gray-800">{currentWord.hint}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
