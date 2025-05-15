import { useState, useEffect } from 'react';
// Import necessary modules from firebase.js and firestore
import { db, auth } from '../firebase.js'; // Import db and auth from your firebase file
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Import the new QuizStats component
import QuizStats from './quiz-stats.tsx';
import CoinDisplay from '../coin-display.tsx'; // Keep CoinDisplay import if used elsewhere, e.g., results screen
import quizData from './quiz-data.ts'; // Import quizData from the new file

// Map options to A, B, C, D
const optionLabels = ['A', 'B', 'C', 'D'];

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
    <path d="M21 12a9 9 0 0 1-9 9c2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path>
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
  const [coinAnimation, setCoinAnimation] = useState(false); // Kept for potential future use or removed if not needed
  const [user, setUser] = useState(null); // State to store user information
  // State to store shuffled options for the current question
  const [shuffledOptions, setShuffledOptions] = useState([]);
  // State to store the user's vocabulary list
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]);
  // State to store the filtered question list based on user vocabulary
  const [filteredQuizData, setFilteredQuizData] = useState(quizData);
  // State to count the number of questions matching user vocabulary
  const [matchingQuestionsCount, setMatchingQuestionsCount] = useState(0);


  // Listen for user authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  // Fetch coins and listVocabulary data from Firestore when component mounts or user changes
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          // If user document exists, get coins and listVocabulary
          const userData = docSnap.data();
          setCoins(userData.coins || 0);
          // Ensure listVocabulary is an array, default to empty array if it doesn't exist
          setUserVocabulary(userData.listVocabulary || []);
        } else {
          // If it doesn't exist, create a new document with 0 coins and empty listVocabulary
          await setDoc(userRef, { coins: 0, listVocabulary: [] });
          setCoins(0);
          setUserVocabulary([]);
        }
      } else {
        // If no user is logged in, reset coins and listVocabulary to initial state
        setCoins(0);
        setUserVocabulary([]);
      }
    };

    fetchData();
  }, [user]); // Dependency array includes user to refetch when user state changes

  // Filter questions based on user vocabulary when userVocabulary or quizData changes
  useEffect(() => {
    if (userVocabulary.length > 0) {
      // Filter quizData: keep questions if any of the user's vocabulary words appear in the question
      const filtered = quizData.filter(question =>
        userVocabulary.some(vocabWord =>
          // Use regex to find the vocabulary word as a whole word
          new RegExp(`\\b${vocabWord}\\b`, 'i').test(question.question)
        )
      );
      setFilteredQuizData(filtered);
      setMatchingQuestionsCount(filtered.length);
    } else {
      // If the user has no vocabulary words, display all questions or none
      // Here I will display all questions if listVocabulary is empty
      setFilteredQuizData(quizData);
      setMatchingQuestionsCount(0); // Or quizData.length if you want to count all when there's no vocabulary
    }
  }, [userVocabulary, quizData]); // Dependency array includes userVocabulary and quizData

  // Update shuffled options when the current question or filteredQuizData changes
  useEffect(() => {
    // Use filteredQuizData to get the current question
    if (filteredQuizData[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(filteredQuizData[currentQuestion].options));
    }
  }, [currentQuestion, filteredQuizData]); // Dependency array includes currentQuestion and filteredQuizData


  // Function to update coins in Firestore
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
    // Do not allow answering if already answered or no questions available
    if (answered || filteredQuizData.length === 0) return;

    setSelectedOption(selectedAnswer);
    setAnswered(true);

    // Use correctAnswer from the original filteredQuizData to check
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
        updateCoinsInFirestore(totalCoins); // Update coins in Firestore
        // setCoinAnimation(true); // Removed as coin animation is handled within CoinDisplay
        // setTimeout(() => setCoinAnimation(false), 1500);
      }

      if (newStreak >= 1) { // Trigger animation for streak 1 and above
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 1500);
      }
    } else {
      // Reset streak on wrong answer
      setStreak(0);
      // Do not reset coins on wrong answer
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;

    // Use filteredQuizData.length to check
    if (nextQuestion < filteredQuizData.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setAnswered(false);
      // Shuffled options will be updated by useEffect when currentQuestion changes
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
    // Keep coins when retaking the quiz, coins are already saved in Firestore
    // filteredQuizData does not need to be reset as it depends on userVocabulary
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
        {/* Display message if no matching questions */}
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
                  {/* Use filteredQuizData.length for total questions */}
                  <span className="text-2xl font-bold text-indigo-600">{score}/{filteredQuizData.length}</span>
                </div>

                <div className="mb-3">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    {/* Use filteredQuizData.length for percentage calculation */}
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${(score / filteredQuizData.length) * 100}%` }}
                    ></div>
                  </div>
                  {/* Use filteredQuizData.length for percentage calculation */}
                  <p className="text-right mt-1 text-sm text-gray-600 font-medium">
                    {Math.round((score / filteredQuizData.length) * 100)}%
                  </p>
                </div>

                {/* Using CoinDisplay component for coins in results */}
                <div className="flex items-center justify-between mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                     {/* Display streak icon in results - Using img tag directly */}
                     {/* Moved streak icon display logic to QuizStats */}
                    <span className="font-medium text-gray-700">Coins kiếm được trong lần này:</span> {/* Corrected text */}
                  </div>
                   {/* Pass coins to CoinDisplay */}
                  {/* Display total user coins from state */}
                  {/* Use CoinDisplay directly here as it's the results screen */}
                  <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} /> {/* Always display coins here */}
                </div>

                {/* Using StreakDisplay component for streak in results */}
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Moved streak icon display logic to QuizStats */}
                      <span className="font-medium text-gray-700">Chuỗi đúng dài nhất:</span>
                    </div>
                     {/* Display streak directly here as it's the results screen */}
                     <div className="font-bold text-orange-600">{streak}</div> {/* Display streak number */}
                  </div>
                </div>

                {/* Display number of matching questions */}
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
              {/* Use the new QuizStats component */}
              <QuizStats
                currentQuestion={currentQuestion}
                totalQuestions={filteredQuizData.length}
                coins={coins}
                streak={streak}
                streakAnimation={streakAnimation}
                quizProgress={quizProgress}
                showScore={showScore} // Pass showScore to QuizStats
              />

               {/* Removed the old header content */}
               {/*
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
                     <CoinDisplay displayedCoins={coins} isStatsFullscreen={showScore} />
                     <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
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
               </div>
               */}


                {/* START: Updated question display block */}
                {/* This block remains in quiz.tsx as it's specific to the question content */}
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mb-1">
                  {/* Hiệu ứng đồ họa - ánh sáng góc */}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>

                  {/* Hiệu ứng đồ họa - đường trang trí */}
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white/20"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-white/20"></div>

                  {/* Icon câu hỏi */}
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

                  {/* Nội dung câu hỏi */}
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {filteredQuizData[currentQuestion]?.question}
                  </h2>
                </div>
                {/* END: Updated question display block */}


              </div>

              <div className="p-6">
                {/* Streak text message */}
                {streak >= 1 && getStreakText() !== "" && ( // Show streak text for streak 1 and above, and if getStreakText is not empty
                  <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                    <div className="flex items-center justify-center">
                       {/* Moved streak icon display logic to QuizStats */}
                      <span className="text-white font-medium">{getStreakText()}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {/* Map over shuffledOptions instead of quizData[currentQuestion].options */}
                  {/* Use filteredQuizData to get the correct answer */}
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
                      {/* Use filteredQuizData.length to check */}
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
                     {/* Use filteredQuizData.length for progress calculation *
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
