import { useState, useEffect, memo } from 'react';
// <<< THAY ĐỔI 1: IMPORT THÊM `writeBatch` và `increment` >>> (Đã có sẵn, không đổi)
import { db, auth } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch, increment } from 'firebase/firestore';

import CoinDisplay from '../coin-display.tsx';
import quizData from './quiz-data.ts';
import Confetti from '../fill-word/chuc-mung.tsx';

// Map options to A, B, C, D
const optionLabels = ['A', 'B', 'C', 'D'];

// Define streak icon URLs
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png',
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png',
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png',
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png',
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png',
};

// Function to get the correct streak icon URL based on streak count
const getStreakIconUrl = (streak: number) => {
  if (streak >= 20) return streakIconUrls.streak20;
  if (streak >= 10) return streakIconUrls.streak10;
  if (streak >= 5) return streakIconUrls.streak5;
  if (streak >= 1) return streakIconUrls.streak1;
  return streakIconUrls.default;
};

// StreakDisplay component (Integrated)
interface StreakDisplayProps {
  displayedStreak: number;
  isAnimating: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}>
      <style jsx>{`
         @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 1s infinite; }
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

// <<< THAY ĐỔI 2: THÊM COMPONENT `MasteryDisplay` >>>
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


// Countdown Timer Component
const CountdownTimer: React.FC<{ timeLeft: number; totalTime: number }> = memo(({ timeLeft, totalTime }) => {
  const radius = 20; const circumference = 2 * Math.PI * radius; const progress = Math.max(0, timeLeft / totalTime); const strokeDashoffset = circumference * (1 - progress);
  const getTimeColor = () => { if (timeLeft <= 0) return 'text-gray-400'; if (timeLeft <= 10) return 'text-red-500'; if (timeLeft <= 20) return 'text-yellow-500'; return 'text-indigo-400'; };
  const ringColorClass = getTimeColor();
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        <circle className="text-white/20" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="22" cy="22" />
        <circle className={`${ringColorClass} transition-all duration-500`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="transparent" r={radius} cx="22" cy="22" style={{ strokeDasharray: circumference, strokeDashoffset }} />
      </svg>
      <span className={`font-bold text-xs ${ringColorClass}`}>{Math.max(0, timeLeft)}</span>
    </div>
  );
});

// SVG Icons
const CheckIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"></path></svg> );
const XIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg> );
const AwardIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg> );
const BackIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );

// Function to shuffle an array
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};


export default function QuizApp({ onGoBack }: { onGoBack: () => void; }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  // <<< THAY ĐỔI 3: THÊM STATE CHO `masteryCount` >>>
  const [masteryCount, setMasteryCount] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [user, setUser] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const TOTAL_TIME = 30;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]);
  const [filteredQuizData, setFilteredQuizData] = useState(quizData);
  const [matchingQuestionsCount, setMatchingQuestionsCount] = useState(0);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // <<< THAY ĐỔI 4: CẬP NHẬT `fetchData` ĐỂ LẤY `masteryCount` >>>
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Lấy coins và masteryCount từ document chính của user
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setCoins(docSnap.data().coins || 0);
            setMasteryCount(docSnap.data().masteryCards || 0);
          } else {
            // Nếu user chưa có document, tạo mới với 0 coins và 0 mastery
            await setDoc(userRef, { coins: 0, masteryCards: 0 });
            setCoins(0);
            setMasteryCount(0);
          }

          // Lấy danh sách từ vựng từ subcollection 'openedVocab'
          const vocabColRef = collection(db, 'users', user.uid, 'openedVocab');
          const vocabSnapshot = await getDocs(vocabColRef);
          
          const vocabList: string[] = [];
          vocabSnapshot.forEach((vocabDoc) => {
            const word = vocabDoc.data().word;
            if (word) {
              vocabList.push(word);
            }
          });
          setUserVocabulary(vocabList);

        } catch (error) {
          console.error("Lỗi khi tải dữ liệu người dùng:", error);
          setCoins(0);
          setMasteryCount(0);
          setUserVocabulary([]);
        }
      } else {
        // Nếu không có người dùng, reset state
        setCoins(0);
        setMasteryCount(0);
        setUserVocabulary([]);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (userVocabulary.length > 0) {
      const filtered = quizData.filter(question =>
        userVocabulary.some(vocabWord =>
          new RegExp(`\\b${vocabWord}\\b`, 'i').test(question.question)
        )
      );
      setFilteredQuizData(filtered);
      setMatchingQuestionsCount(filtered.length);
    } else {
      setFilteredQuizData(quizData);
      setMatchingQuestionsCount(0);
    }
  }, [userVocabulary]);

  useEffect(() => {
    if (filteredQuizData[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(filteredQuizData[currentQuestion].options));
    }
  }, [currentQuestion, filteredQuizData]);
  
  const handleTimeUp = () => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(null);
    setStreak(0);
  };

  useEffect(() => {
    if (showScore || answered || filteredQuizData.length === 0) {
      return;
    }
    setTimeLeft(TOTAL_TIME);
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [currentQuestion, answered, showScore, filteredQuizData.length]);
  
  // <<< THAY ĐỔI 5: CẬP NHẬT `handleAnswer` ĐỂ TÍNH COIN VÀ GHI BATCH >>>
  const handleAnswer = async (selectedAnswer) => {
    if (answered || filteredQuizData.length === 0) return;
    setSelectedOption(selectedAnswer);
    setAnswered(true);
    const currentQuizItem = filteredQuizData[currentQuestion];
    const isCorrect = selectedAnswer === currentQuizItem.correctAnswer;

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Công thức tính coin mới: masteryCount * newStreak
      const coinsToAdd = masteryCount * newStreak;

      if (coinsToAdd > 0) {
        const totalCoins = coins + coinsToAdd;
        setCoins(totalCoins);
        setCoinAnimation(true);
        setTimeout(() => setCoinAnimation(false), 1500);
      }

      if (newStreak >= 1) {
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 1500);
      }

      // Tìm từ vựng khớp với câu hỏi để cập nhật vào Firestore
      const matchedWord = userVocabulary.find(vocabWord =>
        new RegExp(`\\b${vocabWord}\\b`, 'i').test(currentQuizItem.question)
      );

      // Nếu có người dùng, có từ vựng khớp và có thưởng coin, tiến hành ghi dữ liệu
      if (user && matchedWord && coinsToAdd > 0) {
        try {
          const batch = writeBatch(db);
          const gameModeId = "quiz-1";
          
          // Thao tác 1: Cập nhật số coin của người dùng
          const userDocRef = doc(db, 'users', user.uid);
          batch.update(userDocRef, { coins: coins + coinsToAdd });

          // Thao tác 2: Cập nhật số lần trả lời đúng cho từ vựng này
          const completedWordRef = doc(db, 'users', user.uid, 'completedWords', matchedWord);
          batch.set(completedWordRef, {
            lastCompletedAt: new Date(),
            gameModes: {
              [gameModeId]: {
                correctCount: increment(1)
              }
            }
          }, { merge: true }); // Dùng merge để không ghi đè các game mode khác

          await batch.commit();
          console.log(`Batch write thành công cho từ '${matchedWord}' và cập nhật coins.`);
        } catch (error) {
          console.error("Lỗi khi thực hiện batch write:", error);
        }
      }
    } else {
      setStreak(0);
    }
  };


  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < filteredQuizData.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
    setAnswered(false);
    setStreak(0);
    setTimeLeft(TOTAL_TIME);
  };

  const getStreakText = () => {
    if (streak >= 20) return "Không thể cản phá!";
    if (streak >= 10) return "Tuyệt đỉnh!";
    if (streak >= 5) return "Siêu xuất sắc!";
    if (streak >= 3) return "Xuất sắc!";
    return "";
  };

  const quizProgress = filteredQuizData.length > 0 ? (currentQuestion / filteredQuizData.length) * 100 : 0;


  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {showConfetti && <Confetti />}
      
      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <button
          onClick={onGoBack}
          className="group w-7 h-7 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 active:bg-white/30 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100"
          aria-label="Quay lại"
        >
          <BackIcon className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
        </button>

        {/* <<< THAY ĐỔI 6: THÊM `MasteryDisplay` VÀO HEADER >>> */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
          <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
          <MasteryDisplay masteryCount={masteryCount} />
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto flex justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
          {filteredQuizData.length === 0 && !showScore ? (
            <div className="p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy câu hỏi nào phù hợp</h2>
              <p className="text-gray-600">Dựa trên danh sách từ vựng của bạn, hiện không có câu hỏi nào trong bộ dữ liệu khớp. Hãy thêm từ vựng mới hoặc thử lại sau.</p>
            </div>
          ) : (
            showScore ? (
              <div className="p-10 text-center">
                <div className="mb-8">
                  <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AwardIcon className="w-16 h-16 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Quiz</h2>
                  <p className="text-gray-500">Bạn đã hoàn thành bài kiểm tra!</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-700">Điểm số của bạn:</span>
                    <span className="text-2xl font-bold text-indigo-600">{score}/{filteredQuizData.length}</span>
                  </div>

                  <div className="mb-3">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${(score / filteredQuizData.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right mt-1 text-sm text-gray-600 font-medium">
                      {Math.round((score / filteredQuizData.length) * 100)}%
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <img src={getStreakIconUrl(streak)} alt="Streak Icon" className="h-5 w-5 text-orange-500 mr-1" />
                      <span className="font-medium text-gray-700">Coins kiếm được trong lần này:</span>
                    </div>
                    <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
                  </div>

                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={getStreakIconUrl(streak)} alt="Streak Icon" className="h-6 w-6 text-orange-500 mr-2" />
                        <span className="font-medium text-gray-700">Chuỗi đúng dài nhất:</span>
                      </div>
                      <StreakDisplay displayedStreak={streak} isAnimating={false} />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Câu hỏi khớp với từ vựng của bạn:</span>
                      <span className="font-bold text-blue-600">{matchingQuestionsCount}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm italic mt-4">
                    {score === filteredQuizData.length ?
                      "Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi." :
                      score > filteredQuizData.length / 2 ?
                        "Kết quả tốt! Bạn có thể cải thiện thêm." :
                        "Hãy thử lại để cải thiện điểm số của bạn."
                    }
                  </p>
                </div>

                <button
                  onClick={resetQuiz}
                  className="flex items-center justify-center mx-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <RefreshIcon className="mr-2 h-5 w-5" />
                  Làm lại quiz
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30">
                        <div className="flex items-center">
                          <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                            {currentQuestion + 1}
                          </span>
                          <span className="mx-0.5 text-white/70 text-xs">/</span>
                          <span className="text-xs text-white/50">{filteredQuizData.length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CountdownTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} />
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                        style={{ width: `${quizProgress}%` }}
                      >
                        <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                      </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mb-1">
                    <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white/20"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-white/20"></div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-500/30 p-1.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <h3 className="text-xs uppercase tracking-wider text-white/70 font-medium">Câu hỏi</h3>
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {filteredQuizData[currentQuestion]?.question}
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {shuffledOptions.map((option, index) => {
                      const isCorrect = option === filteredQuizData[currentQuestion]?.correctAnswer;
                      const isSelected = option === selectedOption;

                      let bgColor = "bg-white";
                      let borderColor = "border-gray-200";
                      let textColor = "text-gray-700";
                      let labelBg = "bg-gray-100";

                      if (answered) {
                        if (isCorrect) {
                          bgColor = "bg-green-50";
                          borderColor = "border-green-500";
textColor = "text-green-800";
                          labelBg = "bg-green-500 text-white";
                        } else if (isSelected) {
                          bgColor = "bg-red-50";
                          borderColor = "border-red-500";
                          textColor = "text-red-800";
                          labelBg = "bg-red-500 text-white";
                        }
                      }
                      return (
                        <button
                          key={option}
                          onClick={() => !answered && handleAnswer(option)}
                          disabled={answered || filteredQuizData.length === 0}
                          className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} flex items-center transition hover:shadow-sm ${!answered && filteredQuizData.length > 0 ? "hover:border-indigo-300 hover:bg-indigo-50" : ""}`}
                        >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-sm font-bold ${labelBg}`}>
                            {optionLabels[index]}
                          </div>
                          <span className="flex-grow">{option}</span>
                          {answered && isCorrect && <CheckIcon className="h-4 w-4 text-green-600 ml-1" />}
                          {answered && isSelected && !isCorrect && <XIcon className="h-4 w-4 text-red-600 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </main>

      {answered && (filteredQuizData.length > 0) && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleNextQuestion}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100 shadow-lg hover:shadow-xl"
          >
            {currentQuestion < filteredQuizData.length - 1 ? 'Câu hỏi tiếp theo' : 'Xem kết quả'}
          </button>
        </div>
      )}

    </div>
  );
}
