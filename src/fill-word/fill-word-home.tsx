import { useState, useEffect, useRef } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
import VirtualKeyboard from './keyboard.tsx';
import WordArrangementInput from './word-arrangement-input.tsx';
import { db, auth } from '../firebase.js';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { defaultImageUrls } from '../image-url.ts';
import Confetti from './chuc-mung.tsx';
import CoinDisplay from '../coin-display.tsx';

// Định nghĩa kiểu dữ liệu cho một từ vựng
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
}

// --- Components phụ ---

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
        <img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" />
      </div>
      <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1">{displayedStreak}</div>
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
  if (streak >= 20) return "Không thể cản phá!";
  if (streak >= 10) return "Tuyệt đỉnh!";
  if (streak >= 5) return "Siêu xuất sắc!";
  if (streak >= 3) return "Xuất sắc!";
  return "";
};

const shuffleArray = <T extends any[]>(array: T): T => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray as T;
};

// --- Component Chính ---
export default function VocabularyGame() {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [gameMode, setGameMode] = useState<'selecting' | 'typing' | 'arranging'>('selecting');
  
  const [shuffledUnusedWords, setShuffledUnusedWords] = useState<VocabularyItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  const isInitialLoadComplete = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        setError("Vui lòng đăng nhập để chơi.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const fetchedVocabulary: VocabularyItem[] = (userData.listVocabulary || []).map((word: string) => ({
            word: word,
            hint: `Nghĩa của từ "${word}"`,
          }));
          const fetchedImageIds: number[] = userData.openedImageIds || [];
          const fetchedCompletedWords: string[] = userData['fill-word-1'] || [];
          const fetchedCoins: number = userData.coins || 0;

          const vocabularyWithImages = fetchedVocabulary.map((item, index) => {
            const imageIndex = fetchedImageIds[index];
            const adjustedIndex = imageIndex !== undefined ? imageIndex - 1 : undefined;
            const isValidImageIndex = adjustedIndex !== undefined && adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length;
            return { ...item, imageIndex: isValidImageIndex ? imageIndex : undefined };
          });

          setVocabularyList(vocabularyWithImages);
          setCoins(fetchedCoins);
          setUsedWords(new Set(fetchedCompletedWords));
        } else {
          setError("Không tìm thấy dữ liệu người dùng.");
        }
        setLoading(false);
      } catch (err: any) {
        setError(`Không thể tải dữ liệu người dùng: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!loading && !error && vocabularyList.length > 0 && !isInitialLoadComplete.current) {
      const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word));
      if (unusedWords.length === 0) {
        setGameOver(true);
        setCurrentWord(null);
      } else {
        const shuffled = shuffleArray(unusedWords);
        setShuffledUnusedWords(shuffled);
        setCurrentWord(shuffled[0]);
        setCurrentWordIndex(0);
        setGameOver(false);
      }
      isInitialLoadComplete.current = true;
    }
  }, [vocabularyList, loading, error, usedWords]);

  const selectNextWord = () => {
    if (currentWordIndex < shuffledUnusedWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setCurrentWord(shuffledUnusedWords[nextIndex]);
      setUserInput('');
      setFeedback('');
      setIsCorrect(null);
    } else {
      setGameOver(true);
      setCurrentWord(null);
    }
  };

  const checkAnswer = async () => {
    if (!currentWord || !userInput.trim()) return;

    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback('Chính xác!');
      setIsCorrect(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1500);
      setUsedWords(prev => new Set(prev).add(currentWord.word));
      setShowConfetti(true);

      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { 'fill-word-1': arrayUnion(currentWord.word) });
        } catch (e) { console.error("Error saving word:", e); }
      }
      setTimeout(() => setShowConfetti(false), 2000);
      setTimeout(selectNextWord, 1500);
    } else {
      setFeedback('Không đúng, hãy thử lại!');
      setIsCorrect(false);
      setStreak(0);
    }
  };

  const generateImageUrl = (imageIndex?: number) => {
    if (imageIndex !== undefined) {
      const adjustedIndex = imageIndex - 1;
      if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) {
        return defaultImageUrls[adjustedIndex];
      }
    }
    return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`;
  };

  const resetGame = () => {
    setGameOver(false);
    setStreak(0);
    setUserInput('');
    setFeedback('');
    setIsCorrect(null);
    setGameMode('selecting');

    const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word));
    if (unusedWords.length > 0) {
      const shuffled = shuffleArray(unusedWords);
      setShuffledUnusedWords(shuffled);
      setCurrentWord(shuffled[0]);
      setCurrentWordIndex(0);
    } else {
      setGameOver(true);
      setCurrentWord(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">Đang tải dữ liệu...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 text-center p-4">{error}</div>;
  if (vocabularyList.length === 0 && !loading) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">Không có từ vựng nào.</div>;
  
  const gameProgress = vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0;
  
  if (gameMode === 'selecting' && !gameOver) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans min-h-[500px] rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Chọn chế độ chơi</h2>
          <p className="text-gray-600 mt-2">Thử thách bản thân theo cách bạn muốn!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <button onClick={() => setGameMode('arranging')} className="p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-teal-400 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="text-5xl mb-4 text-center">🎨</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-teal-600">Sắp xếp chữ cái</h3>
            <p className="text-sm text-gray-500">Sắp xếp các chữ cái bị xáo trộn để tạo thành từ đúng.</p>
          </button>
          <button onClick={() => setGameMode('typing')} className="p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-sky-400 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="text-5xl mb-4 text-center">⌨️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-sky-600">Nhập từ bàn phím</h3>
            <p className="text-sm text-gray-500">Sử dụng bàn phím ảo để nhập câu trả lời của bạn.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 shadow-xl font-sans">
      {showConfetti && <Confetti />}
      <div className="w-full flex flex-col items-center">
        {gameOver ? (
          <div className="text-center py-8 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2>
              <p className="text-xl mb-4">Số từ đã hoàn thành: <span className="font-bold text-indigo-600">{usedWords.size}/{vocabularyList.length}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${gameProgress}%` }}></div>
              </div>
            </div>
            <button onClick={resetGame} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
              <RefreshIcon className="mr-2 h-5 w-5" /> Chơi lại
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-xl mb-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setGameMode('selecting')} className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 text-xs transition-all z-10" title="Đổi chế độ chơi">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="relative ml-12">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30">
                    <div className="flex items-center">
                      <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">{usedWords.size}</span>
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
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-2">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${gameProgress}%` }}>
                  <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                </div>
              </div>
            </div>

            {currentWord && (
              <div className="w-full space-y-4">
                {streak >= 3 && getStreakText(streak) && (
                  <div className={`p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                    <div className="flex items-center justify-center">
                      <img src={getStreakIconUrl(streak)} alt="Streak Icon" className="h-5 w-5 mr-2" />
                      <span className="font-medium">{getStreakText(streak)}</span>
                    </div>
                  </div>
                )}
                <div className="relative w-full h-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-102 group" onClick={() => setShowImagePopup(true)}>
                  <img src={generateImageUrl(currentWord.imageIndex)} alt={currentWord.word} className="w-full h-full object-contain" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-center">Đoán từ này là gì?</p>
                  </div>
                </div>
                
                {gameMode === 'typing' && <WordSquaresInput word={currentWord.word} userInput={userInput} setUserInput={setUserInput} feedback={feedback} isCorrect={isCorrect} disabled={isCorrect === true} />}
                {gameMode === 'arranging' && <WordArrangementInput word={currentWord.word} onAnswerChange={setUserInput} isCorrect={isCorrect} disabled={isCorrect === true} />}
                
                <div className="flex justify-center">
                  <button onClick={checkAnswer} className={`px-8 py-3 w-full max-w-xs rounded-lg font-semibold text-base transition-all duration-200 shadow-md flex items-center justify-center ${userInput.length === (currentWord?.word?.length || 0) && isCorrect === null ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} disabled={userInput.length !== (currentWord?.word?.length || 0) || isCorrect !== null}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Kiểm tra
                  </button>
                </div>
                
                {gameMode === 'typing' && <VirtualKeyboard userInput={userInput} setUserInput={setUserInput} wordLength={currentWord.word.length} disabled={isCorrect === true} />}
                
                {feedback && (
                  <div className={`flex items-center justify-center p-3 rounded-lg shadow-sm text-sm transition-all duration-200 ${isCorrect ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {isCorrect ? 
                      <div className="flex items-center"><span className="flex items-center justify-center bg-green-100 text-green-500 rounded-full w-6 h-6 mr-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span><span className="font-medium">{feedback}</span></div> :
                      <div className="flex items-center"><span className="flex items-center justify-center bg-red-100 text-red-500 rounded-full w-6 h-6 mr-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span><span>{feedback}</span></div>
                    }
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showImagePopup && currentWord && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 max-w-3xl max-h-full overflow-auto shadow-2xl">
            <button onClick={() => setShowImagePopup(false)} className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white/80 rounded-full p-2 shadow-md hover:shadow-lg transition-all z-20">
              <span className="text-xl font-bold">✕</span>
            </button>
            <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">{currentWord.word}</h3>
            <img src={generateImageUrl(currentWord.imageIndex)} alt={currentWord.word} className="rounded-lg shadow-md max-w-full max-h-[70vh] object-contain mx-auto" />
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="font-medium text-gray-700 mb-1">Gợi ý:</p>
              <p className="text-gray-800">{currentWord.hint}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
