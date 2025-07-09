import { useState, useEffect, useRef } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
import { db, auth } from '../firebase.js';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { defaultImageUrls } from '../image-url.ts';
import Confetti from './chuc-mung.tsx';
import CoinDisplay from '../coin-display.tsx';

// Định nghĩa kiểu dữ liệu cho một từ vựng, thêm trường imageIndex
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
}

// --- START: Components và Logic được sao chép từ quiz.tsx ---

const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png',
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png',
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png',
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png',
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png',
};

const getStreakIconUrl = (streak: number) => {
  if (streak >= 20) return streakIconUrls.streak20;
  if (streak >= 10) return streakIconUrls.streak10;
  if (streak >= 5) return streakIconUrls.streak5;
  if (streak >= 1) return streakIconUrls.streak1;
  return streakIconUrls.default;
};

interface StreakDisplayProps {
  displayedStreak: number;
  isAnimating: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}>
       <style jsx>{`
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative flex items-center justify-center">
        <img
          src={getStreakIconUrl(displayedStreak)}
          alt="Streak Icon"
          className="w-4 h-4"
        />
      </div>
      <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1">
        {displayedStreak}
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path>
    <path d="M3 12a9 9 0 0 1 9-9c2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path>
  </svg>
);

const getStreakText = (streak: number) => {
  return "";
};

// --- END: Components và Logic được sao chép từ quiz.tsx ---

// Helper function to shuffle an array
const shuffleArray = <T extends any[]>(array: T): T => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray as T;
};


export default function VocabularyGame() {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);

  // State mới để lưu danh sách các từ chưa dùng, đã được xáo trộn
  const [shuffledUnusedWords, setShuffledUnusedWords] = useState<VocabularyItem[]>([]);
  // State để theo dõi chỉ mục của từ hiện tại trong shuffledUnusedWords
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0); // Score can still track correct answers if needed internally
  // Sử dụng Set để quản lý các từ đã dùng hiệu quả hơn (cho mục đích lưu vào Firestore và kiểm tra nhanh)
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  // Ref để theo dõi xem dữ liệu đã được tải và xử lý lần đầu chưa
  const isInitialLoadComplete = useRef(false);


  // Lắng nghe trạng thái xác thực người dùng
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Effect để tải dữ liệu từ Firestore khi user thay đổi
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log("No user logged in, cannot fetch data from user document.");
        setLoading(false);
        setVocabularyList([]);
        setOpenedImageIds([]);
        setCoins(0);
        setUsedWords(new Set());
        setShuffledUnusedWords([]); // Reset shuffled list
        setCurrentWordIndex(0); // Reset index
        setCurrentWord(null); // Reset current word
        setGameOver(false); // Reset game over
        setError("Vui lòng đăng nhập để chơi.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        let fetchedVocabulary: VocabularyItem[] = [];
        let fetchedImageIds: number[] = [];
        let fetchedCompletedWords: string[] = [];
        let fetchedCoins = 0;

        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (userData && Array.isArray(userData.listVocabulary)) {
            fetchedVocabulary = userData.listVocabulary.map((word: string) => ({
              word: word,
              hint: `Nghĩa của từ "${word}"`,
            }));
          } else {
            setError("Không tìm thấy danh sách từ vựng trong tài khoản của bạn hoặc định dạng sai.");
          }

          if (userData && Array.isArray(userData.openedImageIds)) {
             const areAllNumbers = userData.openedImageIds.every((id: any) => typeof id === 'number');
             if(areAllNumbers) {
                fetchedImageIds = userData.openedImageIds as number[];
             } else {
                 setError("Dữ liệu ảnh trong tài khoản của bạn có định dạng sai.");
             }
          } else {
            // Không có openedImageIds là bình thường
          }

          if (userData && Array.isArray(userData['fill-word-1'])) {
              fetchedCompletedWords = userData['fill-word-1'] as string[];
          } else {
              // Nếu không có trường 'fill-word-1' hoặc sai định dạng, khởi tạo rỗng
          }

          if (userData && typeof userData.coins === 'number') {
            fetchedCoins = userData.coins;
          } else {
            // Mặc định là 0 nếu không có hoặc sai định dạng
          }

          // Kết hợp danh sách từ vựng với chỉ mục ảnh tương ứng
          const vocabularyWithImages = fetchedVocabulary.map((item, index) => {
              // Tìm imageIndex tương ứng. Giả định index trong listVocabulary tương ứng với vị trí trong openedImageIds
              // Cần cẩn trọng với giả định này. Nếu openedImageIds không có cùng độ dài hoặc không theo thứ tự, logic này sẽ sai.
              // Một cách an toàn hơn là lưu imageId trực tiếp trong cấu trúc từ vựng nếu có thể.
              // Hiện tại, giữ nguyên logic dựa trên index như code gốc.
              const imageIndex = fetchedImageIds[index];
              const adjustedIndex = imageIndex !== undefined ? imageIndex - 1 : undefined; // Giả định 1-based index từ Firestore
              const isValidImageIndex = adjustedIndex !== undefined && adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length;

              return {
                  ...item,
                  imageIndex: isValidImageIndex ? imageIndex : undefined // Lưu index gốc từ Firestore
              };
          });

          setVocabularyList(vocabularyWithImages);
          setOpenedImageIds(fetchedImageIds);
          setCoins(fetchedCoins);
          setUsedWords(new Set(fetchedCompletedWords));

        } else {
          console.log("User document does not exist.");
          setVocabularyList([]);
          setOpenedImageIds([]);
          setCoins(0);
          setUsedWords(new Set());
          setShuffledUnusedWords([]); // Reset shuffled list
          setCurrentWordIndex(0); // Reset index
          setCurrentWord(null); // Reset current word
          setGameOver(false); // Reset game over
          setError("Không tìm thấy dữ liệu người dùng.");
        }

        setLoading(false);

      } catch (err: any) {
        console.error("Error fetching user data from document:", err);
        setError(`Không thể tải dữ liệu người dùng: ${err.message}`);
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
       setLoading(false);
       setVocabularyList([]);
       setOpenedImageIds([]);
       setCoins(0);
       setUsedWords(new Set());
       setShuffledUnusedWords([]); // Reset shuffled list
       setCurrentWordIndex(0); // Reset index
       setCurrentWord(null); // Reset current word
       setGameOver(false); // Reset game over
       setError("Vui lòng đăng nhập để chơi.");
    }

  }, [user]);

  // Effect để xử lý dữ liệu sau khi tải xong (vocabularyList và usedWords)
  useEffect(() => {
      // Chỉ chạy logic này sau khi tải xong lần đầu và không có lỗi
      if (!loading && !error && vocabularyList.length > 0 && !isInitialLoadComplete.current) {
          // Lọc ra các từ chưa được sử dụng
          const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word));

          if (unusedWords.length === 0) {
              // Nếu không còn từ chưa dùng, game over ngay
              setGameOver(true);
              setCurrentWord(null);
          } else {
              // Xáo trộn danh sách các từ chưa dùng
              const shuffled = shuffleArray(unusedWords);
              setShuffledUnusedWords(shuffled);
              // Bắt đầu với từ đầu tiên trong danh sách đã xáo trộn
              setCurrentWord(shuffled[0]);
              setCurrentWordIndex(0);
              setGameOver(false); // Đảm bảo game không ở trạng thái over
          }

          // Đánh dấu là đã xử lý tải dữ liệu lần đầu
          isInitialLoadComplete.current = true;

      } else if (!loading && !error && vocabularyList.length === 0) {
           // Trường hợp tải xong nhưng danh sách từ vựng rỗng
           setCurrentWord(null);
           setGameOver(false);
           setShuffledUnusedWords([]);
           setCurrentWordIndex(0);
      }

  }, [vocabularyList, loading, error, usedWords]); // Dependencies: vocabularyList, loading, error, usedWords

  // Select the next word from the shuffled list
  const selectNextWord = () => {
    // Kiểm tra xem còn từ nào trong danh sách đã xáo trộn không
    if (currentWordIndex < shuffledUnusedWords.length - 1) {
      // Chuyển sang từ tiếp theo trong danh sách đã xáo trộn
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setCurrentWord(shuffledUnusedWords[nextIndex]);
      setUserInput('');
      setFeedback('');
      setIsCorrect(null);
    } else {
      // Nếu đã hết từ trong danh sách đã xáo trộn, kết thúc trò chơi
      setGameOver(true);
      setCurrentWord(null);
    }
  };

  // Check the user's answer
  const checkAnswer = async () => {
    if (!currentWord || !userInput.trim()) return;

    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback('Chính xác!');
      setIsCorrect(true);
      setScore(score + 1);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1500);

      // Cập nhật Set usedWords (cho mục đích kiểm tra và lưu)
      setUsedWords(prevUsedWords => new Set(prevUsedWords).add(currentWord.word));

      setShowConfetti(true);

      // Lưu từ vựng đã trả lời đúng vào Firestore
      if (user && currentWord.word) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            'fill-word-1': arrayUnion(currentWord.word)
          });
          console.log(`Saved correctly answered word "${currentWord.word}" to Firestore field 'fill-word-1'.`);
        } catch (firestoreError) {
          console.error("Error saving word to Firestore:", firestoreError);
        }
      }

      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Chờ một chút trước khi chuyển sang từ tiếp theo
      setTimeout(() => {
         selectNextWord(); // Gọi hàm chọn từ tiếp theo từ danh sách đã xáo trộn
      }, 1500);

    } else {
      setFeedback(`Không đúng, hãy thử lại!`); // Có thể bỏ hiển thị từ đúng ở đây để tăng thử thách
      setIsCorrect(false);
      setStreak(0);
    }
  };

  // Generate image URL based on the imageIndex from the vocabulary item
  const generateImageUrl = (imageIndex?: number) => {
     if (imageIndex !== undefined && typeof imageIndex === 'number') {
         // Giả định imageIndex từ Firestore là 1-based, cần trừ 1 cho mảng 0-based
         const adjustedIndex = imageIndex - 1;
         if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) {
             return defaultImageUrls[adjustedIndex];
         } else {
             console.warn(`Adjusted image index ${adjustedIndex} (from Firestore ID ${imageIndex}) is out of bounds for defaultImageUrls array.`);
         }
     }
     return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`;
  };

  // Reset the game
  const resetGame = () => {
    // Khi reset game, chúng ta không xóa dữ liệu trên Firestore
    // Chỉ reset trạng thái trong component và tạo lại danh sách xáo trộn từ các từ chưa dùng ban đầu
    setScore(0);
    setGameOver(false);
    setStreak(0);
    setUserInput('');
    setFeedback('');
    setIsCorrect(null);

    // Tạo lại danh sách các từ chưa dùng dựa trên trạng thái usedWords hiện tại
    const unusedWordsAfterReset = vocabularyList.filter(item => !usedWords.has(item.word));

    if (unusedWordsAfterReset.length === 0) {
        // Nếu không còn từ nào để chơi lại (tất cả đã hoàn thành)
        setGameOver(true); // Giữ trạng thái game over
        setCurrentWord(null);
        setShuffledUnusedWords([]);
        setCurrentWordIndex(0);
    } else {
        // Xáo trộn lại danh sách các từ chưa dùng còn lại
        const shuffled = shuffleArray(unusedWordsAfterReset);
        setShuffledUnusedWords(shuffled);
        // Bắt đầu lại với từ đầu tiên trong danh sách mới đã xáo trộn
        setCurrentWord(shuffled[0]);
        setCurrentWordIndex(0);
        setGameOver(false); // Đảm bảo game không ở trạng thái over
    }
  };


  // Hiển thị trạng thái loading hoặc lỗi
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  // Nếu không có từ vựng nào được tải (mảng rỗng)
  if (vocabularyList.length === 0 && !loading && !error) {
      return (
          <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
              Không có từ vựng nào trong danh sách của bạn.
          </div>
      );
  }

  // Calculate game progress percentage based on completed words
  const gameProgress = vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0;


  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans">
      {showConfetti && <Confetti />}

      <div className="w-full flex flex-col items-center">
        {gameOver ? (
          <div className="text-center py-8 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2>
              <p className="text-xl mb-4">Số từ đã hoàn thành: <span className="font-bold text-indigo-600">{usedWords.size}/{vocabularyList.length}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${gameProgress}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <RefreshIcon className="mr-2 h-5 w-5" />
              Chơi lại
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-t-xl rounded-b-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30">
                      <div className="flex items-center">
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                          {usedWords.size}
                        </span>
                        <span className="mx-0.5 text-white/70 text-xs">/</span>
                        <span className="text-xs text-white/50">{vocabularyList.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
                    <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
                  </div>
                </div>

                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                      style={{ width: `${gameProgress}%` }}
                    >
                      <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                    </div>
                </div>
            </div>

            {currentWord && (
              <div className="w-full space-y-6">
                 {streak >= 1 && getStreakText(streak) !== "" && (
                  <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                    <div className="flex items-center justify-center">
                       <img
                         src={getStreakIconUrl(streak)}
                         alt="Streak Icon"
                         className="h-5 w-5 mr-2 text-white"
                       />
                      <span className="text-white font-medium">{getStreakText(streak)}</span>
                    </div>
                  </div>
                )}

                <div
                  className="relative w-full h-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-102 group mt-6"
                  onClick={() => setShowImagePopup(true)}
                >
                  {currentWord.imageIndex !== undefined ? (
                       <img
                           src={generateImageUrl(currentWord.imageIndex)}
                           alt={currentWord.word}
                           className="w-full h-full object-contain"
                       />
                  ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 flex flex-col items-center justify-center">
                        <span className="text-white text-8xl font-bold mb-2">?</span>
                        <span className="text-white text-lg opacity-80">Chạm để xem</span>
                      </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-center">Đoán từ này là gì?</p>
                  </div>
                </div>

                <WordSquaresInput
                  word={currentWord.word}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  checkAnswer={checkAnswer}
                  feedback={feedback}
                  isCorrect={isCorrect}
                  disabled={isCorrect === true}
                />
              </div>
            )}
          </>
        )}
      </div>

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
              src={generateImageUrl(currentWord.imageIndex)}
              alt={currentWord.word}
              className="rounded-lg shadow-md max-w-full max-h-full object-contain"
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
