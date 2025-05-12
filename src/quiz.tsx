import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Award } from 'lucide-react'; // Removed Coins as it's in CoinDisplay
import CoinDisplay from './coin-display.tsx'; // Import the CoinDisplay component

const quizData = [
  {
    question: 'Thủ đô của Việt Nam là gì?',
    options: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Huế'],
    correctAnswer: 'Hà Nội'
  },
  {
    question: 'Ngôn ngữ lập trình nào không phải là ngôn ngữ hướng đối tượng?',
    options: ['Java', 'C++', 'HTML', 'Python'],
    correctAnswer: 'HTML'
  },
  {
    question: 'Năm bao nhiêu Việt Nam giành độc lập?',
    options: ['1945', '1954', '1975', '1986'],
    correctAnswer: '1945'
  },
  {
    question: 'Sông nào dài nhất Việt Nam?',
    options: ['Sông Hồng', 'Sông Mê Kông', 'Sông Đà', 'Sông Đồng Nai'],
    correctAnswer: 'Sông Mê Kông'
  },
  {
    question: 'Việt Nam có bao nhiêu tỉnh thành?',
    options: ['58', '63', '54', '68'],
    correctAnswer: '63'
  }
];

// Map các đáp án thành A, B, C, D
const optionLabels = ['A', 'B', 'C', 'D'];

// Define streak icon URLs
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png', // Default icon
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png', // 1 correct answer
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png', // 5 consecutive correct answers
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png', // 10 consecutive correct answers
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png', // 20 consecutive correct answers
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



  const handleAnswer = (selectedAnswer) => {
    setSelectedOption(selectedAnswer);
    setAnswered(true);

    const isCorrect = selectedAnswer === quizData[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);

      // Increase streak and award coins for correct answers
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Calculate coins based on streak
      let coinsToAdd = 0;
      if (newStreak >= 20) { // Award 20 coins for 20+ streak
        coinsToAdd = 20;
      } else if (newStreak >= 10) { // Award 15 coins for 10-19 streak
        coinsToAdd = 15;
      } else if (newStreak >= 5) { // Award 10 coins for 5-9 streak
        coinsToAdd = 10;
      } else if (newStreak >= 3) { // Award 5 coins for 3-4 streak
        coinsToAdd = 5;
      } else if (newStreak >= 1) { // Award 1 coin for 1-2 streak
        coinsToAdd = 1;
      }


      if (coinsToAdd > 0) {
        setCoins(coins + coinsToAdd);
        setCoinAnimation(true);
        setTimeout(() => setCoinAnimation(false), 1500);
      }

      if (newStreak >= 3) { // Trigger animation for streak 3 and above
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 1500);
      }
    } else {
      // Reset streak on wrong answer
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;

    if (nextQuestion < quizData.length) {
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
    // Keep the coins when restarting the quiz
  };



  const getStreakText = () => {
    if (streak >= 20) return "Không thể cản phá!";
    if (streak >= 10) return "Tuyệt đỉnh!";
    if (streak >= 5) return "Siêu xuất sắc!";
    if (streak >= 3) return "Xuất sắc!";
    if (streak >= 2) return "Tiếp tục nào!";
    return "";
  };

  // Function to get the correct streak icon URL based on streak count
  const getStreakIconUrl = () => {
    if (streak >= 20) return streakIconUrls.streak20;
    if (streak >= 10) return streakIconUrls.streak10;
    if (streak >= 5) return streakIconUrls.streak5;
    if (streak >= 1) return streakIconUrls.streak1;
    return streakIconUrls.default;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        {showScore ? (
          <div className="p-10 text-center">
            <div className="mb-8">
              <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-16 h-16 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Quiz</h2>
              <p className="text-gray-500">Bạn đã hoàn thành bài kiểm tra!</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">Điểm số của bạn:</span>
                <span className="text-2xl font-bold text-indigo-600">{score}/{quizData.length}</span>
              </div>

              <div className="mb-3">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${(score / quizData.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1 text-sm text-gray-600 font-medium">
                  {Math.round((score / quizData.length) * 100)}%
                </p>
              </div>

              {/* Using CoinDisplay component for coins in results */}
              <div className="flex items-center justify-between mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                   {/* Display streak icon in results */}
                   <img
                     src={getStreakIconUrl()}
                     alt="Streak Icon"
                     className="h-5 w-5 text-orange-500 mr-1" // Adjust size as needed
                   />
                  <span className="font-medium text-gray-700">Coins kiếm được:</span>
                </div>
                 {/* Pass coins to CoinDisplay */}
                <CoinDisplay displayedCoins={coins} isStatsFullscreen={showScore} />
              </div>

              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Display streak icon in results */}
                    <img
                      src={getStreakIconUrl()}
                      alt="Streak Icon"
                      className="h-6 w-6 text-orange-500 mr-2" // Adjust size as needed
                    />
                    <span className="font-medium text-gray-700">Chuỗi đúng dài nhất:</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{streak}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm italic mt-4">
                {score === quizData.length ?
                  "Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi." :
                  score > quizData.length / 2 ?
                    "Kết quả tốt! Bạn có thể cải thiện thêm." :
                    "Hãy thử lại để cải thiện điểm số của bạn."
                }
              </p>
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center justify-center mx-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Làm lại quiz
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                  <span className="font-medium">Câu hỏi {currentQuestion + 1}/{quizData.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Using CoinDisplay component for coins */}
                  {/* Pass coins and showScore state to CoinDisplay */}
                  <CoinDisplay displayedCoins={coins} isStatsFullscreen={showScore} />

                  {/* Streak display with image icons - removed background classes */}
                  <div className={`flex items-center text-white px-2 py-1 rounded-lg transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                    <img
                      src={getStreakIconUrl()}
                      alt="Streak Icon"
                      className="h-4 w-4 mr-1" // Adjust size as needed
                    />
                    <span className="font-bold">{streak}</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {quizData[currentQuestion].question}
              </h2>


            </div>

            <div className="p-6">
              {/* Streak text message */}
              {streak >= 3 && (
                <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                  <div className="flex items-center justify-center">
                     <img
                       src={getStreakIconUrl()}
                       alt="Streak Icon"
                       className="h-5 w-5 mr-2 text-white" // Adjust size as needed
                     />
                    <span className="text-white font-medium">{getStreakText()}</span>
                  </div>
                </div>
              )}

              {/* Coin animation - This might be handled within CoinDisplay now,
                  or you might keep this if it's a separate animation effect.
                  Keeping it for now, but consider if CoinDisplay handles this.
              */}
              {coinAnimation && streak >= 1 && (
                <div className="mb-4 p-2 rounded-lg bg-yellow-100 border border-yellow-300 text-center animate-pulse">
                  <div className="flex items-center justify-center text-yellow-700">
                    {/* Using a simple coin icon here, not the full CoinDisplay */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold">+{streak >= 20 ? 20 : streak >= 10 ? 15 : streak >= 5 ? 10 : streak >= 3 ? 5 : 1} coins</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {quizData[currentQuestion].options.map((option, index) => {
                  const isCorrect = option === quizData[currentQuestion].correctAnswer;
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
                      key={index}
                      onClick={() => !answered && handleAnswer(option)}
                      disabled={answered}
                      className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} flex items-center transition hover:shadow-sm ${!answered ? "hover:border-indigo-300 hover:bg-indigo-50" : ""}`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-sm font-bold ${labelBg}`}>
                        {optionLabels[index]}
                      </div>
                      <span className="flex-grow">{option}</span>
                      {answered && isCorrect && <CheckCircle className="h-4 w-4 text-green-600 ml-1" />}
                      {answered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 shadow-md hover:shadow-lg"
                  >
                    {currentQuestion < quizData.length - 1 ? 'Câu hỏi tiếp theo' : 'Xem kết quả'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <p className="text-gray-600">Điểm: <span className="font-bold text-indigo-600">{score}</span></p>
                </div>

                <div className="h-2 bg-gray-200 rounded-full w-48 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${(currentQuestion / (quizData.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
