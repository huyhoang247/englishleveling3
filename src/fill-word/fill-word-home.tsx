// --- START OF FILE fill-word-home.tsx ---

// Các import cơ bản từ React và các thư viện khác
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { db, auth } from '../firebase.js';
import { doc, getDoc, getDocs, updateDoc, collection, writeBatch, setDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { defaultImageUrls } from '../image-url.ts';
import { exampleData } from '../example-data.ts';

// Các component con được tách ra các file riêng
import WordSquaresInput from './vocabulary-input.tsx';
import Confetti from './chuc-mung.tsx';
import CoinDisplay from '../coin-display.tsx';
import ImageCarousel3D from './image-carousel-3d.tsx';

// Định nghĩa kiểu dữ liệu
interface VocabularyItem {
  word: string; // "word" cho p1, "word" cho p2, "wordOne wordTwo" cho p3
  hint: string;
  imageIndex?: number;
  question?: string;
  vietnameseHint?: string;
}
interface VocabularyGameProps {
  onGoBack: () => void;
  selectedPractice: number;
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
const masteryIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png';
const MasteryDisplay: React.FC<{ masteryCount: number; }> = memo(({ masteryCount }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
       <style jsx>{`@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .animate-pulse-fast { animation: pulse-fast 1s infinite; }`}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative flex items-center justify-center"><img src={masteryIconUrl} alt="Mastery Icon" className="w-4 h-4" /></div>
      <div className="font-bold text-gray-800 text-xs tracking-wide ml-1">{masteryCount}</div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div>
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

const BackIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg>);

// Các hàm helper
const shuffleArray = <T extends any[]>(array: T): T => { const shuffledArray = [...array]; for (let i = shuffledArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; } return shuffledArray as T; };
const generateImageUrl = (imageIndex?: number) => { if (imageIndex !== undefined && typeof imageIndex === 'number') { const adjustedIndex = imageIndex - 1; if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) { return defaultImageUrls[adjustedIndex]; } } return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`; };

// Component chính của Game
export default function VocabularyGame({ onGoBack, selectedPractice }: VocabularyGameProps) {
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
  const [masteryCount, setMasteryCount] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const TOTAL_TIME = 60;
  const isInitialLoadComplete = useRef(false);

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser)); return () => unsubscribe(); }, []);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false); setVocabularyList([]); setCoins(0); setUsedWords(new Set()); setCurrentWord(null); setMasteryCount(0); setError("Vui lòng đăng nhập để chơi.");
        return;
      }
      try {
        setLoading(true); setError(null);

        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'openedVocab')),
          getDocs(collection(db, 'users', user.uid, 'completedWords'))
        ]);

        const fetchedCoins = userDocSnap.exists() ? (userDocSnap.data().coins || 0) : 0;
        const fetchedMasteryCount = userDocSnap.exists() ? (userDocSnap.data().masteryCards || 0) : 0;
        
        const gameModeId = `fill-word-${selectedPractice}`;
        const fetchedCompletedWords = new Set<string>();
        completedWordsSnapshot.forEach((completedDoc) => {
            if (completedDoc.data()?.gameModes?.[gameModeId]) {
              fetchedCompletedWords.add(completedDoc.id);
            }
        });

        let gameVocabulary: VocabularyItem[] = [];
        const userVocabularyWords: string[] = [];
        openedVocabSnapshot.forEach((vocabDoc) => {
            const data = vocabDoc.data();
            if (data.word) userVocabularyWords.push(data.word);
        });

        if (selectedPractice === 1) {
            // Practice 1: Đoán từ qua ảnh
            openedVocabSnapshot.forEach((vocabDoc) => {
                const data = vocabDoc.data();
                const imageIndex = Number(vocabDoc.id);
                if (data.word && !isNaN(imageIndex)) {
                    gameVocabulary.push({ word: data.word, hint: `Nghĩa của từ "${data.word}"`, imageIndex: imageIndex });
                }
            });
        } else if (selectedPractice === 2) {
            // Practice 2: Điền 1 từ
            userVocabularyWords.forEach(word => {
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                if (matchingSentences.length > 0) {
                    const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                    gameVocabulary.push({
                        word: word,
                        question: randomSentence.english.replace(wordRegex, '___'),
                        vietnameseHint: randomSentence.vietnamese,
                        hint: `Điền từ còn thiếu. Gợi ý: ${randomSentence.vietnamese}`
                    });
                }
            });
        } else if (selectedPractice === 3) {
            // Practice 3: Điền 2 từ
            exampleData.forEach(sentence => {
                const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                
                if (wordsInSentence.length >= 2) {
                    const wordsToHide = shuffleArray(wordsInSentence).slice(0, 2);
                    const word1 = wordsToHide[0];
                    const word2 = wordsToHide[1];

                    let questionText = sentence.english;
                    // Important: Replace words case-insensitively
                    questionText = questionText.replace(new RegExp(`\\b${word1}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word2}\\b`, 'i'), '___');

                    gameVocabulary.push({
                        word: `${word1} ${word2}`, // Đáp án là hai từ cách nhau bởi dấu cách
                        question: questionText,
                        vietnameseHint: sentence.vietnamese,
                        hint: `Điền 2 từ còn thiếu. Gợi ý: ${sentence.vietnamese}`
                    });
                }
            });
        }

        setVocabularyList(gameVocabulary);
        setCoins(fetchedCoins);
        setMasteryCount(fetchedMasteryCount);
        setDisplayedCoins(fetchedCoins);
        setUsedWords(fetchedCompletedWords);

      } catch (err: any) {
        setError(`Không thể tải dữ liệu người dùng: ${err.message}`);
        setVocabularyList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, selectedPractice]);

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
    const timerId = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { setStreak(0); clearInterval(timerId); return 0; } return prev - 1; }), 1000);
    return () => clearInterval(timerId);
  }, [currentWord, gameOver, isCorrect]);

  const selectNextWord = useCallback(() => {
    if (currentWordIndex < shuffledUnusedWords.length - 1) { const nextIndex = currentWordIndex + 1; setCurrentWordIndex(nextIndex); setCurrentWord(shuffledUnusedWords[nextIndex]); setUserInput(''); setFeedback(''); setIsCorrect(null); } else { setGameOver(true); setCurrentWord(null); }
  }, [currentWordIndex, shuffledUnusedWords]);
  
  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => { if (startValue === endValue) return; let step = Math.ceil((endValue - startValue) / 30) || 1; let current = startValue; const interval = setInterval(() => { current += step; if (current >= endValue) { setDisplayedCoins(endValue); clearInterval(interval); } else { setDisplayedCoins(current); } }, 30); }, []);
  
  const checkAnswer = useCallback(async () => {
    if (!currentWord || !userInput.trim() || isCorrect) return;
    // So sánh chuẩn hóa, hoạt động cho cả 1 và 2 từ
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setIsCorrect(true); setFeedback(''); const newStreak = streak + 1; setStreak(newStreak); setStreakAnimation(true); setTimeout(() => setStreakAnimation(false), 1500);
      setUsedWords(prev => new Set(prev).add(currentWord.word)); setShowConfetti(true);
      
      if (user) {
        // Tăng thưởng cho bài tập khó hơn
        const coinReward = (masteryCount * newStreak) * (selectedPractice === 3 ? 2 : 1);
        const updatedCoins = coins + coinReward; 
        setCoins(updatedCoins); 
        startCoinCountAnimation(coins, updatedCoins);
        
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const completedWordRef = doc(db, 'users', user.uid, 'completedWords', currentWord.word);
            const batch = writeBatch(db);
            const gameModeId = `fill-word-${selectedPractice}`;
            batch.set(completedWordRef, {
                lastCompletedAt: new Date(),
                gameModes: { [gameModeId]: { correctCount: increment(1) } }
            }, { merge: true });
            batch.update(userDocRef, { 'coins': updatedCoins });
            
            await batch.commit();

        } catch (e) { 
            console.error("Lỗi khi cập nhật dữ liệu với batch:", e); 
        }
      }
      setTimeout(() => setShowConfetti(false), 2000); 
      setTimeout(selectNextWord, 1500);
    } else { 
      setFeedback(''); 
      setIsCorrect(false); 
      setStreak(0); 
    }
  }, [currentWord, userInput, isCorrect, streak, user, coins, selectNextWord, startCoinCountAnimation, masteryCount, selectedPractice]);
  
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
  if (vocabularyList.length === 0 && !loading && !error) return (
    <div className="flex flex-col items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
        Bạn không có đủ từ vựng cho bài tập này.
        <br/>
        {selectedPractice === 3 ? "Cần có câu chứa ít nhất 2 từ bạn đã học." : "Hãy vào màn hình 'Lật thẻ' để học thêm!"}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl font-sans">
      {/* <<< THAY ĐỔI 1: THÊM STYLE CHO ANIMATION >>> */}
      <style jsx global>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <button onClick={onGoBack} className="group w-7 h-7 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 active:bg-white/30 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Quay lại">
          <BackIcon className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
          <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
          <MasteryDisplay masteryCount={masteryCount} />
        </div>
      </header>
      
      <main className="flex-grow px-8 pt-8 pb-8 w-full flex flex-col items-center">
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
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30">
                      <div className="flex items-center">
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">{usedWords.size}</span>
                        <span className="mx-0.5 text-white/70 text-xs">/</span><span className="text-xs text-white/50">{vocabularyList.length}</span>
                      </div>
                  </div>
                  <CountdownTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} />
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0}%` }}><div className="absolute top-0 h-1 w-full bg-white opacity-30"></div></div>
                </div>
                {(selectedPractice === 2 || selectedPractice === 3) && currentWord && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mt-4">
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {currentWord.question}
                    </h2>
                    {currentWord.vietnameseHint && (
                      <p className="text-white/80 text-sm mt-2 italic">
                        {currentWord.vietnameseHint}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {currentWord ? (
                <div className="w-full mt-6 space-y-6">
                  {selectedPractice === 1 && (
                    <ImageCarousel3D imageUrls={carouselImageUrls} onImageClick={handleImageClick} word={currentWord.word} />
                  )}

                  {/* <<< THAY ĐỔI 2: SỬ DỤNG INPUT KHÁC NHAU CHO CÁC PRACTICE >>> */}
                  {selectedPractice === 3 ? (
                    // Input mới dành riêng cho Practice 3 (điền 2 từ)
                    <div className="flex flex-col items-center gap-4">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isCorrect && checkAnswer()}
                        placeholder="Gõ 2 từ còn thiếu vào đây..."
                        disabled={!!isCorrect}
                        className={`w-full px-4 py-3 text-center text-lg font-semibold text-gray-800 bg-white border-2 rounded-lg shadow-inner focus:outline-none focus:ring-2 transition-all duration-200
                          ${isCorrect === true ? 'border-green-500 ring-green-300' : ''}
                          ${isCorrect === false ? 'border-red-500 ring-red-300 animate-shake' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-300'}
                          ${!!isCorrect ? 'cursor-not-allowed bg-gray-100' : ''}
                        `}
                      />
                      <button
                        onClick={checkAnswer}
                        disabled={!!isCorrect || !userInput.trim()}
                        className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Kiểm tra
                      </button>
                    </div>
                  ) : (
                    // Input cũ dùng cho Practice 1 và 2
                    <WordSquaresInput word={currentWord.word} userInput={userInput} setUserInput={setUserInput} checkAnswer={checkAnswer} feedback={feedback} isCorrect={isCorrect} disabled={!!isCorrect} />
                  )}

                </div>
              ) : <div className='pt-10 font-bold text-gray-500'>Đang tải từ...</div>}
            </>
          )}
        </div>
        {showImagePopup && currentWord && selectedPractice === 1 && (
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
// --- END OF FILE fill-word-home.tsx ---
