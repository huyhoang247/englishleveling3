import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase.js'; // Đảm bảo đường dẫn đúng
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import quizData from './quiz-data.ts'; // Đảm bảo bạn có file này

// --- UTILITY FUNCTIONS ---
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

// --- CUSTOM HOOK ---
function useUserData() {
    const [user, setUser] = useState<User | null>(null);
    const [coins, setCoins] = useState(0);
    const [userVocabulary, setUserVocabulary] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => { const unsub = onAuthStateChanged(auth, u => setUser(u)); return () => unsub(); }, []);
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                const userRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setCoins(data.coins || 0);
                        setUserVocabulary(data.listVocabulary || []);
                    } else { await setDoc(userRef, { coins: 0, listVocabulary: [] }); setCoins(0); setUserVocabulary([]); }
                } catch (e) { setError("Lỗi tải dữ liệu."); console.error(e); } 
                finally { setLoading(false); }
            } else { setCoins(0); setUserVocabulary([]); setLoading(false); }
        };
        fetchData();
    }, [user]);
    const updateUserCoins = async (newCoins: number) => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: newCoins }).catch(e => console.error(e));
            setCoins(newCoins);
        }
    };
    return { coins, userVocabulary, loading, error, updateUserCoins };
}

// --- HELPER COMPONENTS ---
const CoinDisplay: React.FC<{ displayedCoins: number, isStatsFullscreen?: boolean }> = ({ displayedCoins, isStatsFullscreen = false }) => {
  if (isStatsFullscreen) return null;
  return (<div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg"><div className="relative mr-0.5"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="C" className="w-4 h-4"/></div><div className="font-bold text-amber-100 text-xs">{displayedCoins.toLocaleString()}</div></div>);
};
const StreakDisplay: React.FC<{ displayedStreak: number, isAnimating: boolean }> = ({ displayedStreak, isAnimating }) => {
  const getIcon = (s: number) => { if (s >= 20) return 'fire%20(4).png'; if (s >= 10) return 'fire%20(3).png'; if (s >= 5) return 'fire%20(1).png'; if (s >= 1) return 'fire%20(2).png'; return 'fire.png'; };
  const iconUrl = `https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/${getIcon(displayedStreak)}`;
  return (<div className={`bg-gray-100 rounded-lg px-3 py-0.5 flex items-center shadow-md border border-orange-400 transition-transform ${isAnimating ? 'scale-110' : ''}`}><img src={iconUrl} alt="S" className="w-4 h-4"/><div className="font-bold text-gray-800 text-xs ml-1">{displayedStreak}</div></div>);
};
const getStreakText = (s: number) => { if (s >= 20) return "Không thể cản phá!"; if (s >= 10) return "Tuyệt đỉnh!"; if (s >= 5) return "Siêu xuất sắc!"; if (s >= 3) return "Xuất sắc!"; return ""; };

const QuizStats: React.FC<{currentQuestionIndex: number, totalQuestions: number, coins: number, streak: number, streakAnimation: boolean, quizProgress: number, showScore: boolean}> = (props) => (
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
    <div className="flex justify-between items-center mb-4"><div className="bg-white/20 rounded-lg px-2 py-1"><span className="font-bold text-blue-200">{props.currentQuestionIndex + 1}</span><span className="mx-0.5 text-white/70">/</span><span className="text-xs text-white/50">{props.totalQuestions}</span></div><div className="flex items-center gap-2"><CoinDisplay displayedCoins={props.coins} isStatsFullscreen={props.showScore} /><StreakDisplay displayedStreak={props.streak} isAnimating={props.streakAnimation} /></div></div>
    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-pink-500" style={{ width: `${props.quizProgress}%` }}></div></div>
  </div>
);

const Icon: React.FC<{ type: 'check' | 'x' | 'refresh' | 'award', className?: string }> = ({ type, className }) => {
    const paths = {
        check: <path d="M20 6L9 17L4 12" />,
        x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        refresh: <><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21" /><path d="M3 12a9 9 0 0 1 9-9c2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3" /></>,
        award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>
    };
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
};


// --- MAIN QUIZ COMPONENT ---
export default function QuizApp() {
  const { coins, userVocabulary, loading, error, updateUserCoins } = useUserData();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [filteredQuizData, setFilteredQuizData] = useState(quizData);

  useEffect(() => {
    const filtered = userVocabulary.length > 0 ? quizData.filter(q => userVocabulary.some(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question))) : quizData;
    setFilteredQuizData(filtered);
    // Reset quiz state when filter changes
    setCurrentQuestion(0); setScore(0); setShowScore(false); setSelectedOption(null); setAnswered(false); setStreak(0);
  }, [userVocabulary]);

  useEffect(() => {
    if (filteredQuizData[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(filteredQuizData[currentQuestion].options));
    }
  }, [currentQuestion, filteredQuizData]);

  const handleAnswer = (selectedAnswer: string) => {
    if (answered) return;
    setAnswered(true); setSelectedOption(selectedAnswer);
    if (selectedAnswer === filteredQuizData[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      let coinsToAdd = 0;
      if (newStreak >= 20) coinsToAdd = 20; else if (newStreak >= 10) coinsToAdd = 15; else if (newStreak >= 5) coinsToAdd = 10; else if (newStreak >= 3) coinsToAdd = 5; else if (newStreak >= 1) coinsToAdd = 1;
      if (coinsToAdd > 0) updateUserCoins(coins + coinsToAdd);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < filteredQuizData.length - 1) {
      setCurrentQuestion(q => q + 1); setSelectedOption(null); setAnswered(false);
    } else { setShowScore(true); }
  };
  
  const resetQuiz = () => {
      // Re-filter data on reset in case vocabulary changed
      const filtered = userVocabulary.length > 0 ? quizData.filter(q => userVocabulary.some(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question))) : quizData;
      setFilteredQuizData(filtered);
      setCurrentQuestion(0); setScore(0); setShowScore(false); setSelectedOption(null); setAnswered(false); setStreak(0);
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  
  return (
    <div className="bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {filteredQuizData.length === 0 && !showScore ? (
           <div className="p-10 text-center"><h2 className="text-2xl font-bold text-gray-800 mb-4">Không có câu hỏi phù hợp</h2></div>
        ) : showScore ? (
            <div className="p-10 text-center">
              <div className="mb-8"><div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"><Icon type="award" className="w-16 h-16 text-indigo-600" /></div><h2 className="text-3xl font-bold text-gray-800">Kết Quả</h2></div>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4"><span>Điểm số:</span><span className="font-bold text-indigo-600">{score}/{filteredQuizData.length}</span></div>
                <div className="h-4 bg-gray-200 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(score / filteredQuizData.length) * 100}%` }}></div></div>
                <div className="flex justify-between items-center mt-6 p-3 bg-yellow-50 rounded-lg"><span>Tổng coins:</span><CoinDisplay displayedCoins={coins} /></div>
              </div>
              <button onClick={resetQuiz} className="flex items-center justify-center mx-auto px-8 py-3 bg-indigo-600 text-white rounded-lg"><Icon type="refresh" className="mr-2 h-5 w-5" />Làm lại</button>
            </div>
          ) : (
            <>
              <QuizStats currentQuestionIndex={currentQuestion} totalQuestions={filteredQuizData.length} coins={coins} streak={streak} streakAnimation={streak > 0 && answered} quizProgress={(currentQuestion / filteredQuizData.length) * 100} showScore={showScore} />
              <div className="p-6">
                <div className="bg-gray-100 p-4 rounded-lg mb-4 -mt-14 relative shadow"><h2 className="text-xl font-bold text-gray-800">{filteredQuizData[currentQuestion]?.question}</h2></div>
                {answered && getStreakText(streak) && <div className="mb-4 p-2 rounded-lg bg-yellow-400 text-white text-center font-medium animate-pulse">{getStreakText(streak)}</div>}
                <div className="space-y-3">
                  {shuffledOptions.map((option) => {
                    const isSelected = option === selectedOption;
                    const isCorrect = option === filteredQuizData[currentQuestion]?.correctAnswer;
                    let classes = "border-gray-200 bg-white hover:border-indigo-400";
                    if (answered) {
                      if (isCorrect) classes = "border-green-500 bg-green-100 text-green-800";
                      else if (isSelected) classes = "border-red-500 bg-red-100 text-red-800";
                      else classes = "opacity-50";
                    }
                    return (
                      <button key={option} onClick={() => handleAnswer(option)} disabled={answered} className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition ${classes}`}>
                        <span>{option}</span>
                        {answered && isCorrect && <Icon type="check" className="h-5 w-5 text-green-600" />}
                        {answered && isSelected && !isCorrect && <Icon type="x" className="h-5 w-5 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
                {answered && <div className="mt-8 flex justify-end"><button onClick={handleNextQuestion} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium">Tiếp theo</button></div>}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
