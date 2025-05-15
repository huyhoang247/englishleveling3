import { useState, useEffect } from 'react';
import { db, auth } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import quizData from './quiz-data.ts';
import QuizStats from './quiz-stats.tsx'; // Import the new component

// Map options to A, B, C, D
const optionLabels = ['A', 'B', 'C', 'D'];

// SVG Icons (Replaced lucide-react icons) - Keep these in quiz.tsx as they are used elsewhere
const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17L4 12"></path>
  </svg>
);
const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path>
    <path d="M3 12a9 9 0 0 1 9-9c2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path>
  </svg>
);
const AwardIcon = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinecap="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
</svg>
);

// Function to shuffle an array (Fisher-Yates (Knuth) Shuffle)
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};

export default function QuizApp() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCoins(userData.coins || 0);
          setUserVocabulary(userData.listVocabulary || []);
        } else {
          await setDoc(userRef, { coins: 0, listVocabulary: [] });
          setCoins(0);
          setUserVocabulary([]);
        }
      } else {
        setCoins(0);
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
  }, [userVocabulary, quizData]);

  useEffect(() => {
    if (filteredQuizData[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(filteredQuizData[currentQuestion].options));
    }
  }, [currentQuestion, filteredQuizData]);

  const updateCoinsInFirestore = async (newCoins) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { coins: newCoins });
        console.log("Coins updated successfully in Firestore!");
      } catch (error) {
        console.error("Error updating coins in Firestore:", error);
      }
    }
  };

  const handleAnswer = (selectedAnswer) => {
    if (answered || filteredQuizData.length === 0) return;
    setSelectedOption(selectedAnswer);
    setAnswered(true);

    const isCorrect = selectedAnswer === filteredQuizData[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      let coinsToAdd = 0;
      if (newStreak >= 20) {
        coinsToAdd = 20;
      } else if (newStreak >= 10) {
        coinsToAdd = 15;
      } else if (newStreak >= 5) {
        coinsToAdd = 10;
      } else if (newStreak >= 3) {
        coinsToAdd = 5;
      } else if (newStreak >= 1) {
        coinsToAdd = 1;
      }

      if (coinsToAdd > 0) {
        const totalCoins = coins + coinsToAdd;
        setCoins(totalCoins);
        updateCoinsInFirestore(totalCoins);
        setCoinAnimation(true);
        setTimeout(() => setCoinAnimation(false), 1500);
      }

      if (newStreak >= 1) {
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 1500);
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
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
                     {/* Streak icon in results - Using img tag directly */}
                     {/* Moved getStreakIconUrl function and streakIconUrls object to QuizStats.tsx */}
                     {/* You might need to pass streakIconUrls and getStreakIconUrl as props if you want to keep this here */}
                     {/* For simplicity, let's assume you will define them locally or pass them down */}
                     {/* Or, ideally, move this entire results section to a separate component too */}
                     {/* Keeping it here for now, assuming necessary definitions are available */}
                      <img
                       src={`https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(${streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 1 : streak >= 1 ? 2 : ''}).png`} // Using simplified logic
                       alt="Streak Icon"
                       className="h-5 w-5 text-orange-500 mr-1"
                     />
                    <span className="font-medium text-gray-700">Coins kiếm được trong lần này:</span>
                  </div>
                  {/* Using CoinDisplay component for coins in results - Keep CoinDisplay definition in QuizStats.tsx */}
                  {/* You need to import CoinDisplay here if you keep this results section */}
                  {/* <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} /> */}
                  {/* Display total user coins from state directly */}
                  <span className="font-bold text-yellow-600">{coins}</span> {/* Display coins directly */}
                </div>

                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       {/* Streak icon in results - Using img tag directly */}
                       {/* Moved getStreakIconUrl function and streakIconUrls object to QuizStats.tsx */}
                       {/* You might need to pass streakIconUrls and getStreakIconUrl as props if you want to keep this here */}
                       {/* Or, ideally, move this entire results section to a separate component too */}
                       {/* Keeping it here for now, assuming necessary definitions are available */}
                        <img
                          src={`https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(${streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 1 : streak >= 1 ? 2 : ''}).png`} // Using simplified logic
                          alt="Streak Icon"
                          className="h-6 w-6 text-orange-500 mr-2"
                        />
                      <span className="font-medium text-gray-700">Chuỗi đúng dài nhất:</span>
                    </div>
                    {/* Using StreakDisplay component for streak in results - Keep StreakDisplay definition in QuizStats.tsx */}
                    {/* You need to import StreakDisplay here if you keep this results section */}
                    {/* <StreakDisplay displayedStreak={streak} isAnimating={false} /> */}
                     {/* Display streak directly */}
                     <span className="font-bold text-orange-600">{streak}</span> {/* Display streak directly */}
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
                    "Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi."
                    :
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
              {/* Use the new QuizStats component here */}
              <QuizStats
                currentQuestionIndex={currentQuestion}
                totalQuestions={filteredQuizData.length}
                coins={coins}
                streak={streak}
                streakAnimation={streakAnimation}
                quizProgress={quizProgress}
                showScore={showScore} // Pass showScore to hide stats in fullscreen
              />

              {/* START: Updated question display block (kept in quiz.tsx) */}
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
                {/* END: Updated question display block */}

              <div className="p-6">
                {/* Streak text message (kept in quiz.tsx) */}
                {streak >= 1 && getStreakText() !== "" && (
                  <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                    <div className="flex items-center justify-center">
                       {/* Streak icon in streak text message */}
                       {/* Moved getStreakIconUrl function and streakIconUrls object to QuizStats.tsx */}
                       {/* You might need to pass streakIconUrls and getStreakIconUrl as props if you want to keep this here */}
                       {/* Keeping it here for now, assuming necessary definitions are available */}
                       <img
                         src={`https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(${streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 1 : streak >= 1 ? 2 : ''}).png`} // Using simplified logic
                         alt="Streak Icon"
                         className="h-5 w-5 mr-2 text-white"
                       />
                      <span className="text-white font-medium">{getStreakText()}</span>
                    </div>
                  </div>
                )}

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

                {answered && (filteredQuizData.length > 0) && (
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 shadow-md hover:shadow-lg"
                    >
                      {currentQuestion < filteredQuizData.length - 1 ? 'Câu hỏi tiếp theo' : 'Xem kết quả'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
