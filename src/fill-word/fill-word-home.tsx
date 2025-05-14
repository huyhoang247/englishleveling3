import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
// Import các hàm cần thiết từ Firestore
import { collection, getDocs } from 'firebase/firestore';
// Import đối tượng db từ file firebase.js
import { db } from '../firebase.js';

// Định nghĩa kiểu dữ liệu cho một từ vựng
interface VocabularyItem {
  word: string;
  hint: string;
}

export default function VocabularyGame() {
  // State để lưu trữ danh sách từ vựng từ Firestore
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  // State để theo dõi trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để theo dõi lỗi khi tải dữ liệu
  const [error, setError] = useState<string | null>(null);

  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  // Sử dụng Set để quản lý các từ đã dùng hiệu quả hơn
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Effect để tải dữ liệu từ Firestore khi component mount
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        setLoading(true); // Bắt đầu tải, đặt loading là true
        const querySnapshot = await getDocs(collection(db, 'listVocabulary'));
        const fetchedVocabulary: VocabularyItem[] = [];
        querySnapshot.forEach((doc) => {
          // Lấy dữ liệu từ mỗi document và thêm vào mảng
          const data = doc.data();
          // Kiểm tra cấu trúc dữ liệu trước khi thêm
          if (data.word && data.hint) {
             fetchedVocabulary.push({ word: data.word, hint: data.hint });
          } else {
             console.warn("Document with missing 'word' or 'hint' field:", doc.id);
          }
        });
        setVocabularyList(fetchedVocabulary); // Cập nhật state danh sách từ vựng
        setLoading(false); // Tải xong, đặt loading là false
        setError(null); // Xóa lỗi nếu có
        console.log("Vocabulary fetched successfully:", fetchedVocabulary);
      } catch (err: any) {
        console.error("Error fetching vocabulary:", err);
        setError("Không thể tải dữ liệu từ vựng. Vui lòng thử lại sau."); // Cập nhật state lỗi
        setLoading(false); // Tải thất bại, đặt loading là false
      }
    };

    fetchVocabulary();
  }, []); // Chỉ chạy một lần khi component mount

  // Effect để bắt đầu trò chơi sau khi dữ liệu từ vựng đã được tải
  useEffect(() => {
    if (vocabularyList.length > 0 && !loading && !error) {
      selectRandomWord(); // Chọn từ đầu tiên khi danh sách từ vựng có sẵn
    }
  }, [vocabularyList, loading, error]); // Chạy khi vocabularyList, loading hoặc error thay đổi

  // Select a random word that hasn't been used yet
  const selectRandomWord = () => {
    // Lọc ra các từ chưa được sử dụng
    const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word));

    if (unusedWords.length === 0) {
      setGameOver(true); // Nếu không còn từ chưa dùng, kết thúc trò chơi
      return;
    }

    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    setCurrentWord(unusedWords[randomIndex]); // Chọn một từ ngẫu nhiên từ danh sách chưa dùng
    setUserInput(''); // Đặt lại input người dùng
    setFeedback(''); // Đặt lại feedback
    setIsCorrect(null); // Đặt lại trạng thái đúng/sai
  };

  // Check the user's answer
  const checkAnswer = () => {
    if (!currentWord || !userInput.trim()) return; // Kiểm tra từ hiện tại và input không rỗng

    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback('Chính xác!'); // Feedback khi đúng
      setIsCorrect(true); // Đặt trạng thái đúng
      setScore(score + 1); // Tăng điểm
      // Thêm từ đã dùng vào Set
      setUsedWords(prevUsedWords => new Set(prevUsedWords).add(currentWord.word));
      setShowConfetti(true); // Hiển thị hiệu ứng confetti

      // Ẩn confetti sau 2 giây
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Chờ một chút trước khi chuyển sang từ tiếp theo
      setTimeout(() => {
        selectRandomWord();
      }, 1500);
    } else {
      // Feedback khi sai, hiển thị từ đúng
      setFeedback(`Không đúng, hãy thử lại! Từ đúng là: ${currentWord.word}`);
      setIsCorrect(false); // Đặt trạng thái sai
    }
  };

  // Generate a placeholder image based on the word
  const generateImageUrl = (word: string) => {
     // Sử dụng placeholder image service
    return `https://placehold.co/400x320/E0E7FF/4338CA?text=${encodeURIComponent(word)}`;
  };

  // Reset the game
  const resetGame = () => {
    setUsedWords(new Set()); // Đặt lại danh sách từ đã dùng
    setScore(0); // Đặt lại điểm
    setGameOver(false); // Đặt lại trạng thái kết thúc trò chơi
    selectRandomWord(); // Bắt đầu lại với từ ngẫu nhiên
  };

  // Submit form on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer(); // Gọi checkAnswer khi nhấn Enter
    }
  };

  // Confetti component (giữ nguyên như cũ)
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

  // Hiển thị trạng thái loading hoặc lỗi
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">
        Đang tải từ vựng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600">
        {error}
      </div>
    );
  }

  // Nếu không có từ vựng nào được tải
  if (vocabularyList.length === 0) {
      return (
          <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600">
              Không có từ vựng nào trong cơ sở dữ liệu.
          </div>
      );
  }


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
            <div className="w-full flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl mr-2">⭐</span>
                <span className="font-bold text-gray-800">{score}/{vocabularyList.length}</span>
              </div>
              <div className="h-2 w-1/2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${(usedWords.size / vocabularyList.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-800 font-medium">{vocabularyList.length - usedWords.size}</span>
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
      {showImagePopup && currentWord && ( // Thêm kiểm tra currentWord
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
