// --- START OF FILE fill-word-home.tsx (FULL & OPTIMIZED) ---

// Các import cơ bản từ React và các thư viện khác
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { db, auth } from '../firebase.js';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { defaultImageUrls } from '../image-url.ts';

// Các component con được tách ra các file riêng (đây là lý do file này ngắn lại)
import WordSquaresInput from './vocabulary-input.tsx';
import Confetti from './chuc-mung.tsx';
import CoinDisplay from '../coin-display.tsx';
import ImageCarousel3D from './image-carousel-3d.tsx';

// Định nghĩa kiểu dữ liệu
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
}

// Các component phụ vẫn giữ lại trong file này
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png',
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png',
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png',
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png',
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png',
};
const getStreakIconUrl = (streak: number) => {
  if (streak >= 20) return streakIconUrls.streak20; if (streak >= 10) return streakIconUrls.streak10; if (streak >= 5) return streakIconUrls.streak5; if (streak >= 1) return streakIconUrls.streak1; return streakIconUrls.default;
};
const StreakDisplay: React.FC<{ displayedStreak: number; isAnimating: boolean; }> = memo(({ displayedStreak, isAnimating }) => (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}>
       <style jsx>{`@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .animate-pulse-fast { animation: pulse-fast 1s infinite; }`}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative flex items-center justify-center"><img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" /></div>
      <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1">{displayedStreak}</div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
));
const CountdownTimer: React.FC<{ timeLeft: number; totalTime: number }> = memo(({ timeLeft, totalTime }) => {
  const radius = 20; const circumference = 2 * Math.PI * radius; const progress = Math.max(0, timeLeft / totalTime); const strokeDashoffset = circumference * (1 - progress);
  const getTimeColor = () => { if (timeLeft <= 0) return 'text-gray-400'; if (timeLeft <= 10) return 'text-red-500'; if (timeLeft <= 20) return 'text-yellow-500'; return 'text-indigo-400'; };
  const ringColorClass = getTimeColor();
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        <circle className="text-gray-200" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="22" cy="22" />
        <circle className={`${ringColorClass} transition-all duration-500`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="transparent" r={radius} cx="22" cy="22" style={{ strokeDasharray: circumference, strokeDashoffset }} />
      </svg>
      <span className={`font-bold text-xs ${ringColorClass}`}>{Math.max(0, timeLeft)}</span>
    </div>
  );
});
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg>);
const getStreakText = (streak: number) => { return ""; };

// Các hàm helper
const shuffleArray = <T extends any[]>(array: T): T => { const shuffledArray = [...array]; for (let i = shuffledArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; } return shuffledArray as T; };
const generateImageUrl = (imageIndex?: number) => { if (imageIndex !== undefined && typeof imageIndex === 'number') { const adjustedIndex = imageIndex - 1; if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) { return defaultImageUrls[adjustedIndex]; } } return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`; };

// Component chính của Game
export default function VocabularyGame() {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const TOTAL_TIME = 60;
  const isInitialLoadComplete = useRef(false);

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser)); return () => unsubscribe(); }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) { setLoading(false); setVocabularyList([]); setCoins(0); setUsedWords(new Set()); setCurrentWord(null); setError("Vui lòng đăng nhập để chơi."); return; }
      try {
        setLoading(true); setError(null);
        const userDocRef = doc(db, 'users', user.uid); const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const fetchedVocabulary = (userData?.listVocabulary && Array.isArray(userData.listVocabulary)) ? userData.listVocabulary.map((word: string) => ({ word, hint: `Nghĩa của từ "${word}"` })) : [];
          const fetchedImageIds = (userData?.openedImageIds && Array.isArray(userData.openedImageIds) && userData.openedImageIds.every((id: any) => typeof id === 'number')) ? userData.openedImageIds : [];
          const fetchedCompletedWords = (userData?.['fill-word-1'] && Array.isArray(userData['fill-word-1'])) ? userData['fill-word-1'] : [];
          const fetchedCoins = (userData?.coins && typeof userData.coins === 'number') ? userData.coins : 0;
          const vocabularyWithImages = fetchedVocabulary.map((item, index) => {
            const imageIndex = fetchedImageIds[index]; const adjustedIndex = imageIndex !== undefined ? imageIndex - 1 : undefined; const isValid = adjustedIndex !== undefined && adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length;
            return { ...item, imageIndex: isValid ? imageIndex : undefined };
          });
          setVocabularyList(vocabularyWithImages); setCoins(fetchedCoins); setDisplayedCoins(fetchedCoins); setUsedWords(new Set(fetchedCompletedWords));
        } else { setError("Không tìm thấy dữ liệu người dùng."); setVocabularyList([]); }
      } catch (err: any) { setError(`Không thể tải dữ liệu người dùng: ${err.message}`); } finally { setLoading(false); }
    };
    fetchUserData();
  }, [user]);
  useEffect(() => {
    if (!loading && !error && vocabularyList.length > 0 && !isInitialLoadComplete.current) {
      const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word));
      if (unusedWords.length === 0) { setGameOver(true); setCurrentWord(null); } else {
        const shuffled = shuffleArray(unusedWords); setShuffledUnusedWords(shuffled); setCurrentWord(shuffled[0]); setCurrentWordIndex(0); setGameOver(false);
      }
      isInitialLoadComplete.current = true;
    }
  }, [vocabularyList, loading, error, usedWords]);
  useEffect(() => {
    if (!currentWord || gameOver || isCorrect) return;
    setTimeLeft(TOTAL_TIME);
    const timerId = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { setStreak(0); setFeedback('Hết giờ! Chuỗi của bạn đã bị reset.'); setTimeout(() => setFeedback(''), 3000); clearInterval(timerId); return 0; } return prev - 1; }), 1000);
    return () => clearInterval(timerId);
  }, [currentWord, gameOver, isCorrect]);

  const selectNextWord = useCallback(() => {
    if (currentWordIndex < shuffledUnusedWords.length - 1) { const nextIndex = currentWordIndex + 1; setCurrentWordIndex(nextIndex); setCurrentWord(shuffledUnusedWords[nextIndex]); setUserInput(''); setFeedback(''); setIsCorrect(null); } else { setGameOver(true); setCurrentWord(null); }
  }, [currentWordIndex, shuffledUnusedWords]);
  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => { if (startValue === endValue) return; let step = Math.ceil((endValue - startValue) / 30) || 1; let current = startValue; const interval = setInterval(() => { current += step; if (current >= endValue) { setDisplayedCoins(endValue); clearInterval(interval); } else { setDisplayedCoins(current); } }, 30); }, []);
  const checkAnswer = useCallback(async () => {
    if (!currentWord || !userInput.trim() || isCorrect) return;
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setIsCorrect(true); setFeedback(''); const newStreak = streak + 1; setStreak(newStreak); setStreakAnimation(true); setTimeout(() => setStreakAnimation(false), 1500);
      setUsedWords(prev => new Set(prev).add(currentWord.word)); setShowConfetti(true);
      if (user) {
        const coinReward = 2 * newStreak; const updatedCoins = coins + coinReward; setCoins(updatedCoins); startCoinCountAnimation(coins, updatedCoins);
        try { await updateDoc(doc(db, 'users', user.uid), { 'fill-word-1': arrayUnion(currentWord.word), 'coins': updatedCoins }); } catch (e) { console.error("Error updating Firestore:", e); }
      }
      setTimeout(() => setShowConfetti(false), 2000); setTimeout(selectNextWord, 1500);
    } else { setFeedback(''); setIsCorrect(false); setStreak(0); }
  }, [currentWord, userInput, isCorrect, streak, user, coins, selectNextWord, startCoinCountAnimation]);
  const resetGame = useCallback(() => {
    setGameOver(false); setStreak(0); setUserInput(''); setFeedback(''); setIsCorrect(null);
    const unused = vocabularyList.filter(item => !usedWords.has(item.word));
    if (unused.length > 0) { const shuffled = shuffleArray(unused); setShuffledUnusedWords(shuffled); setCurrentWord(shuffled[0]); setCurrentWordIndex(0); } else { setGameOver(true); setCurrentWord(null); }
  }, [vocabularyList, usedWords]);

  const carouselImageUrls = useMemo(() => {
    if (!currentWord) return [`https://placehold.co/400x320/E0E7FF/4338CA?text=Loading...`];
    if (currentWord.imageIndex !== undefined) { const imageUrl = generateImageUrl(currentWord.imageIndex); return [imageUrl, imageUrl, imageUrl]; }
    return [`https://placehold.co/400x320/93c5fd/1e3a8a?text=?`, `https://placehold.co/400x320/a5b4fc/1e3a8a?text=Guess`, `https://placehold.co/400x320/c4b5fd/1e3a8a?text=The+Word`];
  }, [currentWord]);
  const handleImageClick = useCallback(() => setShowImagePopup(true), []);
  
  if (loading) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">Đang tải dữ liệu...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 text-center p-4">{error}</div>;
  if (vocabularyList.length === 0 && !loading && !error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">Không có từ vựng nào.</div>;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl font-sans rounded-2xl overflow-hidden">
      {/* Thanh header ngang màu xám */}
      <header className="w-full h-10 bg-gray-200 border-b border-gray-300" />
      
      {/* Nội dung game với padding */}
      <main className="p-8 w-full flex flex-col items-center">
        {showConfetti && <Confetti />}
        <div className="w-full flex flex-col items-center">
          {gameOver ? (
            <div className="text-center py-8 w-full">
              <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2>
                <p className="text-xl mb-4">Hoàn thành: <span className="font-bold text-indigo-600">{usedWords.size}/{vocabularyList.length}</span></p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <button onClick={resetGame} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                <RefreshIcon className="mr-2 h-5 w-5" /> Chơi lại
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-t-xl rounded-b-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30">
                      <div className="flex items-center">
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">{usedWords.size}</span>
                        <span className="mx-0.5 text-white/70 text-xs">/</span><span className="text-xs text-white/50">{vocabularyList.length}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CountdownTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} />
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                    <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0}%` }}><div className="absolute top-0 h-1 w-full bg-white opacity-30"></div></div>
                </div>
              </div>
              {currentWord ? (
                <div className="w-full space-y-6">
                  <ImageCarousel3D imageUrls={carouselImageUrls} onImageClick={handleImageClick} word={currentWord.word} />
                  <WordSquaresInput word={currentWord.word} userInput={userInput} setUserInput={setUserInput} checkAnswer={checkAnswer} feedback={feedback} isCorrect={isCorrect} disabled={!!isCorrect} />
                </div>
              ) : <div className='pt-10 font-bold text-gray-500'>Đang tải từ...</div>}
            </>
          )}
        </div>
        {showImagePopup && currentWord && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl p-6 max-w-3xl max-h-full overflow-auto shadow-2xl">
              <button onClick={() => setShowImagePopup(false)} className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"><span className="text-xl font-bold">✕</span></button>
              <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">{currentWord.word}</h3>
              <img src={generateImageUrl(currentWord.imageIndex)} alt={currentWord.word} className="rounded-lg shadow-md max-w-full max-h-full object-contain" />
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="font-medium text-gray-700 mb-1">Định nghĩa:</p><p className="text-gray-800">{currentWord.hint}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
// --- END OF FILE fill-word-home.tsx (FULL & OPTIMIZED) ---
