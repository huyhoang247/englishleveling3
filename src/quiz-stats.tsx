import React from 'react';

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

// CoinDisplay component (Integrated) - Moved from original quiz.tsx
interface CoinDisplayProps {
  displayedCoins: number; // The number of coins to display
  isStatsFullscreen: boolean; // Flag to indicate if stats are in fullscreen mode (e.g., results screen)
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ displayedCoins, isStatsFullscreen }) => {
  return (
    // Coin Container - Adjusted vertical padding (py-0.5) and removed fixed width
    <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-yellow-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isStatsFullscreen ? 'scale-100' : ''}`}>
      {/* Background highlight effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

      {/* Coin Icon */}
      <div className="relative flex items-center justify-center">
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/coin.png" // Your coin icon URL
          alt="Coin Icon"
          className="w-4 h-4" // Icon size is w-4 h-4
          onError={(e) => {
            // Optional: Handle image loading errors, e.g., replace with a fallback icon or text
            // console.error("Error loading coin icon:", e);
            // e.currentTarget.src = 'fallback-coin-icon.png'; // Replace with a local fallback if available
          }}
        />
      </div>

      {/* Coin Count - adjusted text color for contrast on yellow background */}
      <div className="font-bold text-yellow-800 text-xs tracking-wide coin-counter ml-1"> {/* Added ml-1 for spacing */}
        {displayedCoins}
      </div>

      {/* Optional: Add a small decorative element */}
      {/* <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center cursor-pointer border border-orange-300 shadow-inner hover:shadow-orange-300/50 hover:scale-110 transition-all duration-200">
        <span className="text-white font-bold text-xs">+</span>
      </div> */}

      {/* Small pulsing dots */}
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-orange-200 rounded-full animate-pulse-fast"></div>

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
    </div>
  );
};

// StreakDisplay component (Integrated) - Moved from original quiz.tsx
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


interface QuizStatsProps {
  currentQuestion: number;
  totalQuestions: number;
  coins: number;
  streak: number;
  streakAnimation: boolean;
  coinAnimation: boolean; // Add coinAnimation prop
}

const QuizStats: React.FC<QuizStatsProps> = ({
  currentQuestion,
  totalQuestions,
  coins,
  streak,
  streakAnimation,
  coinAnimation // Destructure coinAnimation
}) => {
  // Calculate quiz progress percentage
  const quizProgress = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
      {/* Header row with question counter on the left and coins/streak on the right */}
      <div className="flex justify-between items-center mb-4"> {/* Reduced bottom margin */}
        {/* Question counter on the left - Styled like progress-bar.tsx counter */}
        <div className="relative">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30"> {/* Adjusted background and border */}
            <div className="flex items-center">
              {/* Current question number */}
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"> {/* Adjusted gradient for white text */}
                {currentQuestion + 1}
              </span>

              {/* Separator */}
              <span className="mx-0.5 text-white/70 text-xs">/</span> {/* Adjusted color */}

              {/* Total questions */}
              <span className="text-xs text-white/50">{totalQuestions}</span> {/* Adjusted color */}
            </div>
          </div>
        </div>
        {/* Coins and Streak on the right */}
        <div className="flex items-center gap-2">
          {/* Using CoinDisplay component for coins */}
          {/* Pass coins and coinAnimation state to CoinDisplay */}
          <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />

          {/* Using StreakDisplay component */}
          {/* Pass streak and streakAnimation state to StreakDisplay */}
          <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
        </div>
      </div>

      {/* Progress bar under the header row */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6"> {/* Added margin bottom */}
        {/* Progress fill with smooth animation */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${quizProgress}%` }}
        >
          {/* Light reflex effect */}
          <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default QuizStats;
