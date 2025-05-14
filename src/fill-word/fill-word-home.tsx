import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
// Import db và auth (để lấy user info) từ file firebase của bạn
import { db, auth } from '../firebase.js';
// Import các hàm cần thiết từ Firestore để làm việc với document người dùng
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth'; // Import kiểu dữ liệu User

// Định nghĩa kiểu dữ liệu cho một mục từ vựng
interface VocabularyItem {
  word: string;
  hint: string;
}

// Định nghĩa props cho component VocabularyGame
interface VocabularyGameProps {
  currentUser: User | null; // Nhận thông tin người dùng từ component cha
}

// Chú ý: Component nhận currentUser làm prop
export default function VocabularyGame({ currentUser }: VocabularyGameProps) {
  // State để lưu trữ danh sách từ vựng từ Firestore (của người dùng)
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  // State để theo dõi trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để theo dõi lỗi (nếu có)
  const [error, setError] = useState<string | null>(null);

  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Effect để tải dữ liệu từ vựng của người dùng từ Firestore khi component mount hoặc currentUser thay đổi
  useEffect(() => {
    const fetchUserVocabulary = async () => {
      if (currentUser) {
        setLoading(true); // Bắt đầu tải dữ liệu
        setError(null); // Reset lỗi

        // Lấy tham chiếu đến tài liệu người dùng trong collection 'users'
        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
          // Lấy snapshot của tài liệu
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Lấy danh sách từ vựng từ trường 'listVocabulary'
            // Đảm bảo rằng listVocabulary tồn tại và là một mảng
            const userVocabArray = Array.isArray(userData?.listVocabulary) ? userData.listVocabulary : [];

            // Chuyển đổi mảng string thành mảng VocabularyItem (giả định cấu trúc)
            // Nếu listVocabulary trong Firestore chỉ là mảng string, bạn cần điều chỉnh logic này
            // Giả định listVocabulary trong user doc là mảng các object { word: string, hint: string }
             const formattedVocabulary: VocabularyItem[] = userVocabArray
                .filter(item => item && typeof item.word === 'string' && typeof item.hint === 'string') // Lọc các mục không hợp lệ
                .map(item => ({ word: item.word, hint: item.hint })); // Map sang đúng kiểu VocabularyItem


            setVocabularyList(formattedVocabulary); // Cập nhật state với dữ liệu đã fetch
             console.log(`Fetched ${formattedVocabulary.length} vocabulary items for user ${currentUser.uid}`);

          } else {
            // Nếu tài liệu người dùng không tồn tại (trường hợp hiếm nếu index.tsx đã xử lý)
            console.warn(`User document for ${currentUser.uid} not found when fetching vocabulary.`);
            setVocabularyList([]); // Đặt danh sách từ vựng rỗng
          }
          setLoading(false); // Đã tải xong
        } catch (err: any) {
          console.error("Error fetching user vocabulary:", err);
          setError("Không thể tải từ vựng của bạn. Vui lòng thử lại sau."); // Cập nhật state lỗi
          setLoading(false); // Đã tải xong (với lỗi)
        }
      } else {
        // Nếu không có người dùng đăng nhập, đặt danh sách từ vựng rỗng
        setVocabularyList([]);
        setLoading(false);
        setError("Vui lòng đăng nhập để chơi game từ vựng.");
      }
    };

    fetchUserVocabulary();
  }, [currentUser, db]); // Dependency array bao gồm currentUser và db

  // Effect để khởi tạo game sau khi từ vựng được tải
  useEffect(() => {
    if (vocabularyList.length > 0) {
      selectRandomWord();
    } else if (!loading && !error && !currentUser) {
       // If not loading, no error, and no user, display message handled below
    } else if (!loading && !error && currentUser && vocabularyList.length === 0) {
       // If not loading, no error, user logged in, but vocabularyList is empty
       setError("Bạn chưa có từ vựng nào. Hãy thêm từ vựng để bắt đầu game!");
    }
  }, [vocabularyList, loading, error, currentUser]); // Chạy lại khi vocabularyList, loading, error hoặc currentUser thay đổi


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
      setFeedback(`Không đúng, hãy thử lại! Từ đúng là: ${currentWord.word}`);
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
    selectRandomWord(); // Chọn lại từ đầu sau khi reset
  };

  // Submit form on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  // Confetti component (Giữ nguyên)
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

        {/* CSS cho animation confetti */}
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

  // Hiển thị trạng thái loading, lỗi hoặc thông báo khi không có người dùng/từ vựng
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Đang tải từ vựng của bạn...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-xl text-red-600 text-center p-4">{error}</div>;
  }

   // Nếu không có người dùng và không loading/error
  if (!currentUser && !loading && !error) {
     return <div className="flex items-center justify-center h-screen text-xl text-blue-600 text-center p-4">Vui lòng đăng nhập để chơi game từ vựng.</div>;
  }

  // Nếu có người dùng, không loading/error, nhưng danh sách từ vựng rỗng
   if (currentUser && vocabularyList.length === 0 && !loading && !error) {
       return <div className="flex items-center justify-center h-screen text-xl text-yellow-600 text-center p-4">Bạn chưa có từ vựng nào. Hãy thêm từ vựng để bắt đầu game!</div>;
  }


  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans rounded-2xl">
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
                   {/* Sử dụng placeholder image URL */}
                   <img
                     src={generateImageUrl(currentWord.word)}
                     alt={`Image related to ${currentWord.word}`}
                     className="absolute inset-0 w-full h-full object-cover"
                     // Optional: Add an onerror handler for fallback
                     onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.onerror = null; // Prevent infinite loop
                         target.src = `https://placehold.co/400x320/E0E7FF/4338CA?text=Image+Not+Available`; // Fallback image
                     }}
                   />
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
                  disabled={answered || !currentWord} // Disable input if answered or no current word
                />
                 {/* Thêm nút kiểm tra đáp án */}
                 <button
                     onClick={checkAnswer}
                     disabled={answered || !currentWord || !userInput.trim()} // Disable if answered, no word, or empty input
                     className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-sm transition-colors flex items-center justify-center
                       ${answered || !currentWord || !userInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'}
                     `}
                   >
                     Kiểm Tra Đáp Án
                   </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image popup */}
      {showImagePopup && currentWord && ( // Ensure currentWord exists before showing popup
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
              onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = `https://placehold.co/400x320/E0E7FF/4338CA?text=Image+Not+Available`; // Fallback image
              }}
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
