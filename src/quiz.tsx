import { useState, useEffect } from 'react';
// Import các module cần thiết từ firebase.js và firestore
import { db, auth } from './firebase'; // Import db và auth từ file firebase của bạn
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import CoinDisplay from './coin-display.tsx'; // Import the CoinDisplay component
import quizData from './quiz-data.ts'; // Import quizData from the new file
// Import GameProgressBar component (assuming its structure is suitable for adaptation)
// We will adapt the visual style, not use the component directly as per the user's request to keep progress-bar.tsx unchanged.
// import GameProgressBar from './progress-bar.tsx';

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

// Function to shuffle an array (Fisher-Yates (Knuth) Shuffle)
const shuffleArray = (array) => {
  const shuffledArray = [...array]; // Create a copy to avoid modifying the original array
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
  const [user, setUser] = useState(null); // State để lưu thông tin người dùng
  // State để lưu các đáp án đã xáo trộn cho câu hỏi hiện tại
  const [shuffledOptions, setShuffledOptions] = useState([]);
  // State để lưu danh sách từ vựng của người dùng
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]);
  // State để lưu danh sách câu hỏi đã lọc dựa trên từ vựng của người dùng
  const [filteredQuizData, setFilteredQuizData] = useState(quizData);
  // State để đếm số câu hỏi khớp với từ vựng của người dùng
  const [matchingQuestionsCount, setMatchingQuestionsCount] = useState(0);


  // Lắng nghe trạng thái xác thực người dùng
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Hủy đăng ký lắng nghe khi component unmount
  }, []);

  // Lấy dữ liệu coins và listVocabulary từ Firestore khi component mount hoặc khi user thay đổi
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          // Nếu tài liệu người dùng tồn tại, lấy số coins và listVocabulary
          const userData = docSnap.data();
          setCoins(userData.coins || 0);
          // Đảm bảo listVocabulary là một mảng, mặc định là mảng rỗng nếu không tồn tại
          setUserVocabulary(userData.listVocabulary || []);
        } else {
          // Nếu không tồn tại, tạo tài liệu mới với 0 coins và listVocabulary rỗng
          await setDoc(userRef, { coins: 0, listVocabulary: [] });
          setCoins(0);
          setUserVocabulary([]);
        }
      } else {
        // Nếu không có người dùng đăng nhập, đặt coins và listVocabulary về trạng thái ban đầu
        setCoins(0);
        setUserVocabulary([]);
      }
    };

    fetchData();
  }, [user]); // Dependency array bao gồm user để fetch lại khi trạng thái user thay đổi

  // Lọc câu hỏi dựa trên từ vựng của người dùng khi userVocabulary hoặc quizData thay đổi
  useEffect(() => {
    if (userVocabulary.length > 0) {
      // Lọc quizData: giữ lại câu hỏi nếu bất kỳ từ vựng nào của người dùng xuất hiện trong câu hỏi
      const filtered = quizData.filter(question =>
        userVocabulary.some(vocabWord =>
          // Sử dụng biểu thức chính quy để tìm từ vựng như một từ hoàn chỉnh
          new RegExp(`\\b${vocabWord}\\b`, 'i').test(question.question)
        )
      );
      setFilteredQuizData(filtered);
      setMatchingQuestionsCount(filtered.length);
    } else {
      // Nếu người dùng không có từ vựng nào, hiển thị tất cả câu hỏi hoặc không hiển thị gì
      // Ở đây tôi sẽ hiển thị tất cả câu hỏi nếu listVocabulary rỗng
      setFilteredQuizData(quizData);
      setMatchingQuestionsCount(0); // Hoặc quizData.length nếu bạn muốn đếm tất cả khi không có từ vựng
    }
  }, [userVocabulary, quizData]); // Dependency array bao gồm userVocabulary và quizData

  // Cập nhật đáp án xáo trộn khi câu hỏi hiện tại hoặc filteredQuizData thay đổi
  useEffect(() => {
    // Sử dụng filteredQuizData để lấy câu hỏi hiện tại
    if (filteredQuizData[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(filteredQuizData[currentQuestion].options));
    }
  }, [currentQuestion, filteredQuizData]); // Dependency array bao gồm currentQuestion và filteredQuizData


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
    // Không cho phép trả lời nếu đã trả lời câu hỏi này rồi hoặc không có câu hỏi nào
    if (answered || filteredQuizData.length === 0) return;

    setSelectedOption(selectedAnswer);
    setAnswered(true);

    // Sử dụng correctAnswer từ filteredQuizData gốc để kiểm tra
    const isCorrect = selectedAnswer === filteredQuizData[currentQuestion].correctAnswer;

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

    // Sử dụng filteredQuizData.length để kiểm tra
    if (nextQuestion < filteredQuizData.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setAnswered(false);
      // Đáp án xáo trộn sẽ được cập nhật bởi useEffect khi currentQuestion thay đổi
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
    // filteredQuizData không cần reset vì nó phụ thuộc vào userVocabulary
  };



  const getStreakText = () => {
    if (streak >= 20) return "Không thể cản phá!";
    if (streak >= 10) return "Tuyệt đỉnh!";
    if (streak >= 5) return "Siêu xuất sắc!";
    if (streak >= 3) return "Xuất sắc!";
    // Removed the condition for streak 2
    return "";
  };

  // Calculate quiz progress percentage
  const quizProgress = filteredQuizData.length > 0 ? (currentQuestion / filteredQuizData.length) * 100 : 0;


  return (
    // Removed min-h-screen to allow content to dictate height
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        {/* Hiển thị thông báo nếu không có câu hỏi nào phù hợp */}
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
                  {/* Using AwardIcon SVG */}
                  <AwardIcon className="w-16 h-16 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Quiz</h2>
                <p className="text-gray-500">Bạn đã hoàn thành bài kiểm tra!</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-700">Điểm số của bạn:</span>
                  {/* Sử dụng filteredQuizData.length cho tổng số câu hỏi */}
                  <span className="text-2xl font-bold text-indigo-600">{score}/{filteredQuizData.length}</span>
                </div>

                <div className="mb-3">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    {/* Sử dụng filteredQuizData.length cho tính toán phần trăm */}
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${(score / filteredQuizData.length) * 100}%` }}
                    ></div>
                  </div>
                  {/* Sử dụng filteredQuizData.length cho tính toán phần trăm */}
                  <p className="text-right mt-1 text-sm text-gray-600 font-medium">
                    {Math.round((score / filteredQuizData.length) * 100)}%
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

                {/* Hiển thị số câu hỏi khớp với từ vựng */}
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
                {/* Using RefreshIcon SVG */}
                <RefreshIcon className="mr-2 h-5 w-5" />
                Làm lại quiz
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
                <div className="flex justify-between items-center mb-4"> {/* Reduced bottom margin */}
                  {/* Removed the old question counter display */}
                  <div className="flex items-center gap-2">
                    {/* Using CoinDisplay component for coins */}
                    {/* Pass coins and showScore state to CoinDisplay */}
                    <CoinDisplay displayedCoins={coins} isStatsFullscreen={showScore} />

                    {/* Using StreakDisplay component */}
                    {/* Pass streak and streakAnimation state to StreakDisplay */}
                    <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
                  </div>
                </div>

                {/* Progress bar under coins and streak */}
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6"> {/* Added margin bottom */}
                    {/* Progress fill with smooth animation */}
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                      style={{ width: `${quizProgress}%` }}
                    >
                      {/* Light reflex effect */}
                      <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                    </div>
                     {/* Compact level counter on the progress bar */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-gray-900 bg-opacity-70 rounded-lg px-2 py-0.5 shadow-inner border border-gray-700">
                            <div className="flex items-center">
                                {/* Current question */}
                                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                    {currentQuestion + 1}
                                </span>

                                {/* Separator */}
                                <span className="mx-0.5 text-gray-400 text-xs">/</span>

                                {/* Total questions */}
                                <span className="text-xs text-gray-300">{filteredQuizData.length}</span>
                            </div>
                        </div>
                     </div>
                </div>

                 {/* Hiển thị số câu hỏi khớp với từ vựng */}
                 <div className="absolute top-4 left-4 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-md">
                   {matchingQuestionsCount} câu hỏi khớp
                 </div>
                <h2 className="text-2xl font-bold mb-2">
                  {/* Sử dụng filteredQuizData để lấy câu hỏi hiện tại */}
                  {filteredQuizData[currentQuestion]?.question}
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
                  {/* Map over shuffledOptions instead of quizData[currentQuestion].options */}
                  {/* Sử dụng filteredQuizData để lấy đáp án đúng */}
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
                        key={option} // Use option as key since it's unique within options
                        onClick={() => !answered && handleAnswer(option)}
                        disabled={answered || filteredQuizData.length === 0} // Disable button if no questions
                        className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} flex items-center transition hover:shadow-sm ${!answered && filteredQuizData.length > 0 ? "hover:border-indigo-300 hover:bg-indigo-50" : ""}`}
                      >
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-sm font-bold ${labelBg}`}>
                          {/* Keep original index for labels A, B, C, D */}
                          {optionLabels[index]}
                        </div>
                        <span className="flex-grow">{option}</span>
                        {answered && isCorrect && <CheckIcon className="h-4 w-4 text-green-600 ml-1" />} {/* Using CheckIcon SVG */}
                        {answered && isSelected && !isCorrect && <XIcon className="h-4 w-4 text-red-600 ml-1" />} {/* Using XIcon SVG */}
                      </button>
                    );
                  })}
                </div>

                {answered && (filteredQuizData.length > 0) && ( // Only show next button if there are questions
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 shadow-md hover:shadow-lg"
                    >
                      {/* Sử dụng filteredQuizData.length để kiểm tra */}
                      {currentQuestion < filteredQuizData.length - 1 ? 'Câu hỏi tiếp theo' : 'Xem kết quả'}
                    </button>
                  </div>
                )}
              </div>

              {/* Removed the old progress bar at the bottom */}
              {/*
              <div className="bg-gray-50 px-8 py-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="text-gray-600">Điểm: <span className="font-bold text-indigo-600">{score}</span></p>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full w-48 overflow-hidden">
                     {/* Sử dụng filteredQuizData.length để tính toán tiến độ *
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${(currentQuestion / (filteredQuizData.length > 1 ? filteredQuizData.length - 1 : 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              */}
            </>
          )
        )}
      </div>
    </div>
  );
}
