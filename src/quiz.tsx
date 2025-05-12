import { useState, useEffect } from 'react';
// Import các module cần thiết từ firebase.js và firestore
import { db, auth } from './firebase'; // Import db và auth từ file firebase của bạn
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import CoinDisplay from './coin-display.tsx'; // Import the CoinDisplay component

const quizData = [
  {
    "question": "Từ \"Source\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Lửa", "B. Nước", "C. Nguồn", "D. Hơi nước"],
    "correctAnswer": "C. Nguồn"
  },
  {
    "question": "Từ \"Insurance\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Bảo vệ", "B. Bảo hiểm", "C. Đầu tư", "D. Rủi ro"],
    "correctAnswer": "B. Bảo hiểm"
  },
  {
    "question": "Từ \"Argument\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Thỏa thuận", "B. Tranh luận", "C. Cuộc chiến", "D. Im lặng"],
    "correctAnswer": "B. Tranh luận"
  },
  {
    "question": "Từ \"Influence\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Ảnh hưởng", "B. Thờ ơ", "C. Kháng cự", "D. Lờ đi"],
    "correctAnswer": "A. Ảnh hưởng"
  },
  {
    "question": "Từ \"Release\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Bắt giữ", "B. Giải phóng", "C. Giữ lại", "D. Giam giữ"],
    "correctAnswer": "B. Giải phóng"
  },
  {
    "question": "Từ \"Capacity\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Khả năng", "B. Giới hạn", "C. Công suất", "D. Khoảng trống"],
    "correctAnswer": "C. Công suất"
  },
  {
    "question": "Từ \"Senate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Chính phủ", "B. Hội đồng", "C. Thượng nghị viện", "D. Tòa án"],
    "correctAnswer": "C. Thượng nghị viện"
  },
  {
    "question": "Từ \"Massive\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Nhỏ", "B. Lớn", "C. Nhẹ", "D. Nặng"],
    "correctAnswer": "B. Lớn"
  },
  {
    "question": "Từ \"Stick\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Cành cây", "B. Keo dán", "C. Cây gậy", "D. Lá"],
    "correctAnswer": "C. Cây gậy"
  },
  {
    "question": "Từ \"District\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Quốc gia", "B. Thành phố", "C. Quận", "D. Làng"],
    "correctAnswer": "C. Quận"
  },
  {
    "question": "Từ \"Budget\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Chi phí", "B. Ngân sách", "C. Nợ", "D. Kế hoạch"],
    "correctAnswer": "B. Ngân sách"
  },
  {
    "question": "Từ \"Measure\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Tính toán", "B. Đo lường", "C. Đoán", "D. Lờ đi"],
    "correctAnswer": "B. Đo lường"
  },
  {
    "question": "Từ \"Cross\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Theo dõi", "B. Băng qua", "C. Gặp gỡ", "D. Tránh"],
    "correctAnswer": "B. Băng qua"
  },
  {
    "question": "Từ \"Central\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Trung tâm", "B. Rìa", "C. Đỉnh", "D. Đáy"],
    "correctAnswer": "A. Trung tâm"
  },
  {
    "question": "Từ \"Proud\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Xấu hổ", "B. Tự hào", "C. Hạnh phúc", "D. Buồn"],
    "correctAnswer": "B. Tự hào"
  },
  {
    "question": "Từ \"Core\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Trung tâm", "B. Bề mặt", "C. Bên ngoài", "D. Lớp"],
    "correctAnswer": "A. Trung tâm"
  },
  {
    "question": "Từ \"County\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Thành phố", "B. Hạt", "C. Thị trấn", "D. Quận"],
    "correctAnswer": "B. Hạt"
  },
  {
    "question": "Từ \"Species\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Loài", "B. Giống", "C. Cá thể", "D. Nhóm"],
    "correctAnswer": "A. Loài"
  },
  {
    "question": "Từ \"Conditions\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Điều kiện", "B. Kết quả", "C. Nguyên nhân", "D. Vấn đề"],
    "correctAnswer": "A. Điều kiện"
  },
  {
    "question": "Từ \"Touch\" trong tiếng Anh có nghĩa là gì?",
    "options": ["A. Nhìn", "B. Chạm", "C. Nghe", "D. Nếm"],
    "correctAnswer": "B. Chạm"
  }

];

// Map các đáp án thành A, B, C, D
const optionLabels = ['A', 'B', 'C', 'D'];

// Define streak icon URLs (assuming these are available or passed down)
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png', // Default icon
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png', // 1 correct answer
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png', // 5 consecutive correct answers
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png', // 10 consecutive correct answers
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png', // 20 consecutive correct answers
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
  displayedStreak: number; // The number of streak to display
  isAnimating: boolean; // Flag to trigger animation
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => {
  return (
    // Streak Container - Adjusted vertical padding (py-0.5)
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}>
       {/* Add necessary styles for animations used here */}
      <style jsx>{`
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      {/* Background highlight effect - adjusted for grey scale */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

      {/* Streak Icon */}
      <div className="relative flex items-center justify-center">
        <img
          src={getStreakIconUrl(displayedStreak)}
          alt="Streak Icon"
          className="w-4 h-4" // Icon size is w-4 h-4
          // Add onerror if needed, similar to CoinDisplay
        />
      </div>

      {/* Streak Count - adjusted text color for contrast on grey background */}
      <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1"> {/* Added ml-1 for spacing */}
        {displayedStreak}
      </div>

       {/* Optional: Add a small decorative element like the plus button in CoinDisplay */}
       {/* <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center cursor-pointer border border-red-300 shadow-inner hover:shadow-red-300/50 hover:scale-110 transition-all duration-200">
         <span className="text-white font-bold text-xs">🔥</span>
       </div> */}

       {/* Small pulsing dots - kept white/yellow as they contrast well */}
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};


// SVG Icons (Replaced lucide-react icons)
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
  const [user, setUser] = useState(null); // State để lưu thông tin người dùng

  // Lắng nghe trạng thái xác thực người dùng
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Hủy đăng ký lắng nghe khi component unmount
  }, []);

  // Lấy dữ liệu coins từ Firestore khi component mount hoặc khi user thay đổi
  useEffect(() => {
    const fetchCoins = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          // Nếu tài liệu người dùng tồn tại, lấy số coins
          setCoins(docSnap.data().coins || 0);
        } else {
          // Nếu không tồn tại, tạo tài liệu mới với 0 coins
          await setDoc(userRef, { coins: 0 });
          setCoins(0);
        }
      } else {
        // Nếu không có người dùng đăng nhập, đặt coins về 0
        setCoins(0);
      }
    };

    fetchCoins();
  }, [user]); // Dependency array bao gồm user để fetch lại khi trạng thái user thay đổi

  // Hàm cập nhật coins lên Firestore
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
    // Không cho phép trả lời nếu đã trả lời câu hỏi này rồi
    if (answered) return;

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
        const totalCoins = coins + coinsToAdd;
        setCoins(totalCoins);
        updateCoinsInFirestore(totalCoins); // Cập nhật coins lên Firestore
        setCoinAnimation(true);
        setTimeout(() => setCoinAnimation(false), 1500);
      }

      if (newStreak >= 1) { // Trigger animation for streak 1 and above
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 1500);
      }
    } else {
      // Reset streak on wrong answer
      setStreak(0);
      // Không reset coins khi trả lời sai
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
    // Giữ lại coins khi làm lại quiz, coins đã được lưu trên Firestore
  };



  const getStreakText = () => {
    if (streak >= 20) return "Không thể cản phá!";
    if (streak >= 10) return "Tuyệt đỉnh!";
    if (streak >= 5) return "Siêu xuất sắc!";
    if (streak >= 3) return "Xuất sắc!";
    // Removed the condition for streak 2
    return "";
  };


  return (
    // Removed min-h-screen to allow content to dictate height
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        {showScore ? (
          <div className="p-10 text-center">
            <div className="mb-8">
              <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* Using AwardIcon SVG */}
                <AwardIcon className="w-16 h-16 text-indigo-600" />
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
                   {/* Display streak icon in results - Using img tag directly */}
                   <img
                     src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                     alt="Streak Icon"
                     className="h-5 w-5 text-orange-500 mr-1" // Adjust size as needed
                   />
                  <span className="font-medium text-gray-700">Coins kiếm được trong lần này:</span> {/* Đã sửa text */}
                </div>
                 {/* Pass coins to CoinDisplay */}
                {/* Hiển thị tổng số coins của người dùng từ state */}
                <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} /> {/* Luôn hiển thị coins ở đây */}
              </div>

              {/* Using StreakDisplay component for streak in results */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Display streak icon in results - Using img tag directly */}
                     <img
                      src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                      alt="Streak Icon"
                      className="h-6 w-6 text-orange-500 mr-2" // Adjust size as needed
                    />
                    <span className="font-medium text-gray-700">Chuỗi đúng dài nhất:</span>
                  </div>
                   {/* Pass streak to StreakDisplay, no animation in results */}
                  <StreakDisplay displayedStreak={streak} isAnimating={false} />
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
              {/* Using RefreshIcon SVG */}
              <RefreshIcon className="mr-2 h-5 w-5" />
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

                  {/* Using StreakDisplay component */}
                  {/* Pass streak and streakAnimation state to StreakDisplay */}
                  <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {quizData[currentQuestion].question}
              </h2>


            </div>

            <div className="p-6">
              {/* Streak text message */}
              {streak >= 1 && getStreakText() !== "" && ( // Show streak text for streak 1 and above, and if getStreakText is not empty
                <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                  <div className="flex items-center justify-center">
                     <img
                       src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                       alt="Streak Icon"
                       className="h-5 w-5 mr-2 text-white" // Adjust size as needed
                     />
                    <span className="text-white font-medium">{getStreakText()}</span>
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
                      {answered && isCorrect && <CheckIcon className="h-4 w-4 text-green-600 ml-1" />} {/* Using CheckIcon SVG */}
                      {answered && isSelected && !isCorrect && <XIcon className="h-4 w-4 text-red-600 ml-1" />} {/* Using XIcon SVG */}
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
