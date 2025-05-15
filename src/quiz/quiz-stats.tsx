import React from 'react';

// Define the props for the CoinDisplay component (copied and adjusted from coin-display.tsx)
interface CoinDisplayProps {
  displayedCoins: number; // The number of coins to display
  isStatsFullscreen: boolean; // Flag to hide/show the display when stats are fullscreen
}

// Coin Icon Image URL (copied from coin-display.tsx)
const coinIconUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png";
const coinIconPlaceholderUrl = "https://placehold.co/16x16/ffd700/000000?text=$"; // Placeholder

// CoinDisplay component (copied and adjusted from coin-display.tsx)
const CoinDisplay: React.FC<CoinDisplayProps> = ({ displayedCoins, isStatsFullscreen }) => {
  // Render null if stats are in fullscreen mode
  if (isStatsFullscreen) {
    return null;
  }

  return (
    // Coins Container
    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      <style jsx>{`
        @keyframes number-change {
          0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); }
          100% { color: #fff; text-shadow: none; transform: scale(1); }
        }
        .number-changing {
          animation: number-change 0.3s ease-out;
        }
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative mr-0.5 flex items-center justify-center">
        <img
          src={coinIconUrl}
          alt="Dollar Coin Icon"
          className="w-4 h-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = coinIconPlaceholderUrl;
          }}
        />
      </div>
      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">
        {displayedCoins.toLocaleString()}
      </div>
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
        <span className="text-white font-bold text-xs">+</span>
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

// Define streak icon URLs (copied from quiz.tsx)
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png', // Default icon
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png', // 1 correct answer
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png', // 5 consecutive correct answers
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png', // 10 consecutive correct answers
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png', // 20 consecutive correct answers
};

// Function to get the correct streak icon URL based on streak count (copied from quiz.tsx)
const getStreakIconUrl = (streak: number) => {
  if (streak >= 20) return streakIconUrls.streak20;
  if (streak >= 10) return streakIconUrls.streak10;
  if (streak >= 5) return streakIconUrls.streak5;
  if (streak >= 1) return streakIconUrls.streak1;
  return streakIconUrls.default;
};

// StreakDisplay component (copied and adjusted from quiz.tsx)
interface StreakDisplayProps {
  displayedStreak: number; // The number of streak to display
  isAnimating: boolean; // Flag to trigger animation
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => {
  return (
    // Streak Container - Adjusted vertical padding (py-0.5)
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}>
       <style jsx>{`
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

      <div className="relative flex items-center justify-center">
        <img
          src={getStreakIconUrl(displayedStreak)}
          alt="Streak Icon"
          className="w-4 h-4"
        />
      </div>

      <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1">
        {displayedStreak}
      </div>

      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

// Define the props for the new QuizStats component
interface QuizStatsProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    coins: number;
    streak: number;
    streakAnimation: boolean;
    quizProgress: number;
    showScore: boolean;
}

const QuizStats: React.FC<QuizStatsProps> = ({
    currentQuestionIndex,
    totalQuestions,
    coins,
    streak,
    streakAnimation,
    quizProgress,
    showScore
}) => {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
            {/* Header row with question counter on the left and coins/streak on the right */}
            <div className="flex justify-between items-center mb-4">
                {/* Question counter on the left */}
                <div className="relative">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30">
                        <div className="flex items-center">
                            {/* Current question number */}
                            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                                {currentQuestionIndex + 1}
                            </span>

                            {/* Separator */}
                            <span className="mx-0.5 text-white/70 text-xs">/</span>

                            {/* Total questions */}
                            <span className="text-xs text-white/50">{totalQuestions}</span>
                        </div>
                    </div>
                </div>

                {/* Coins and Streak on the right */}
                <div className="flex items-center gap-2">
                    <CoinDisplay displayedCoins={coins} isStatsFullscreen={showScore} />
                    <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
                </div>
            </div>

            {/* Progress bar under the header row */}
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                    style={{ width: `${quizProgress}%` }}
                >
                    <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                </div>
            </div>
        </div>
    );
};

export default QuizStats;
