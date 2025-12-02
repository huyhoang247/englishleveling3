// --- START OF FILE: topic.tsx ---

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// --- Imports từ các file khác ---
import { useQuizApp } from '../course-context.tsx'; // Import Context
import HomeButton from '../../ui/home-button.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx'; 
import MasteryDisplay from '../../ui/display/mastery-display.tsx'; 

interface TopicViewerProps {
  onGoBack: () => void;
}

const ITEMS_PER_PAGE = 20;
const MAX_TOTAL_ITEMS = 2000; 
const REWARD_DURATION_SECONDS = 300; // 5 phút = 300 giây
const MAX_DAILY_REWARDS = 5;
const BASE_GOLD_REWARD = 5;

// --- STYLES & ANIMATIONS ---
const shimmerStyle = `
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes progress-spin {
    from { stroke-dashoffset: 251; }
    to { stroke-dashoffset: 0; }
  }

  @keyframes popup-fade-up {
    0% { opacity: 0; transform: translateY(10px) scale(0.9); }
    20% { opacity: 1; transform: translateY(0) scale(1); }
    80% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
  }
  
  .animate-popup {
    animation: popup-fade-up 2.5s ease-out forwards;
  }
`;

// Hàm tạo URL
const getTopicImageUrl = (index: number): string => {
  const baseUrl1 = 'https://raw.githubusercontent.com/englishleveling46/Flashcard/main/topic/image/';
  const baseUrl2 = 'https://raw.githubusercontent.com/englishleveling46/Flashcard/main/topic/image2/';

  if (index <= 1000) {
    const paddedNumber = index.toString().padStart(3, '0');
    return `${baseUrl1}${paddedNumber}.webp`;
  } else {
    return `${baseUrl2}${index}.webp`;
  }
};

// --- COMPONENT: SKELETON LOADING ---
const TopicSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="w-full h-72 sm:h-96 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-50">
          <div className="h-4 bg-gray-200 rounded w-2/3 relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
      </div>
    </div>
  );
};

// --- COMPONENT: TOPIC IMAGE CARD ---
const TopicImageCard = ({ index }: { index: number }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = useMemo(() => getTopicImageUrl(index), [index]);

  if (hasError) return null;

  return (
    <div className="relative group w-full">
      {isLoading && <TopicSkeleton />}
      <div 
        className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 ease-in-out
        ${isLoading 
            ? 'absolute top-0 left-0 w-full h-0 opacity-0 z-[-1]' 
            : 'relative w-full h-auto opacity-100'
        }`}
      >
        <img
          src={imageUrl}
          alt={`Topic ${index}`}
          loading="eager" 
          className="w-full h-auto block"
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

// --- COMPONENT: STUDY TIMER & REWARD (Circular Progress) ---
const StudyTimer = ({ 
    currentPage, 
    masteryCount, 
    onReward 
}: { 
    currentPage: number, 
    masteryCount: number,
    onReward: (amount: number) => void 
}) => {
    const [seconds, setSeconds] = useState(0);
    const [dailyCount, setDailyCount] = useState(0);
    const [justRewarded, setJustRewarded] = useState<{amount: number} | null>(null);
    
    // SVG Circle Config
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((seconds / REWARD_DURATION_SECONDS) * 100, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Check localStorage for daily limit
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `topic_rewards_${today}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            setDailyCount(parseInt(stored, 10));
        } else {
            // New day, reset storage
            setDailyCount(0);
            // Optional: Clean up old keys if needed
        }
    }, []);

    // Timer Logic
    useEffect(() => {
        // Reset timer when page changes
        setSeconds(0);
    }, [currentPage]);

    useEffect(() => {
        if (dailyCount >= MAX_DAILY_REWARDS) return;

        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev >= REWARD_DURATION_SECONDS) {
                    return prev; // Stop at max
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [dailyCount, currentPage]); // Re-run if dailyCount changes or page changes

    // Handle Reward Trigger
    useEffect(() => {
        if (seconds >= REWARD_DURATION_SECONDS && dailyCount < MAX_DAILY_REWARDS) {
            const rewardAmount = BASE_GOLD_REWARD * (masteryCount > 0 ? masteryCount : 1);
            
            // Trigger Context update
            onReward(rewardAmount);
            
            // Show UI Animation
            setJustRewarded({ amount: rewardAmount });
            setTimeout(() => setJustRewarded(null), 3000);

            // Update Daily Count
            const newCount = dailyCount + 1;
            setDailyCount(newCount);
            
            // Save to LocalStorage
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`topic_rewards_${today}`, newCount.toString());
        }
    }, [seconds, dailyCount, masteryCount, onReward]);

    const isComplete = dailyCount >= MAX_DAILY_REWARDS;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            
            {/* Reward Popup Notification */}
            {justRewarded && (
                <div className="animate-popup bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold shadow-lg border-2 border-yellow-200 mb-3 flex items-center gap-2 pointer-events-auto">
                    <span>+ {justRewarded.amount}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11a1 1 0 112 0 1 1 0 01-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z" /></svg>
                    <span className="text-xs opacity-75">Keep going!</span>
                </div>
            )}

            {/* Timer Circle */}
            <div className={`relative w-16 h-16 bg-white rounded-full shadow-xl border-4 transition-colors duration-300 pointer-events-auto group
                ${isComplete ? 'border-gray-200 bg-gray-50' : 'border-white'}
            `}>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   {isComplete ? 'Daily Limit Reached' : `Stay 5m/page: ${dailyCount}/${MAX_DAILY_REWARDS} today`}
                </div>

                {/* SVG Progress */}
                {!isComplete && (
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        {/* Track */}
                        <circle
                            cx="30" cy="30" r={radius}
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="4"
                        />
                        {/* Progress Indicator */}
                        <circle
                            cx="30" cy="30" r={radius}
                            fill="none"
                            stroke={seconds >= REWARD_DURATION_SECONDS ? "#10B981" : "#F59E0B"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                                transition: 'stroke-dashoffset 1s linear'
                            }}
                        />
                    </svg>
                )}

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    {isComplete ? (
                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <>
                            <span className={`text-[10px] font-bold ${seconds >= REWARD_DURATION_SECONDS ? 'text-green-600' : 'text-gray-500'}`}>
                                {dailyCount}/{MAX_DAILY_REWARDS}
                            </span>
                            <svg className={`w-4 h-4 ${seconds >= REWARD_DURATION_SECONDS ? 'text-green-500' : 'text-orange-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function TopicViewer({ onGoBack }: TopicViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE);
  
  // --- KẾT NỐI VỚI CONTEXT ---
  // Lấy userCoins, masteryCount và setUserCoins (để cộng tiền)
  const { userCoins, masteryCount, setUserCoins } = useQuizApp();

  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentPage]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // Handler khi nhận thưởng từ Timer
  const handleTimeReward = useCallback((amount: number) => {
      // Giả sử context có hàm setUserCoins nhận callback (prev => new)
      // Nếu context của bạn chỉ nhận value, hãy đổi thành: setUserCoins(userCoins + amount);
      if (setUserCoins) {
          setUserCoins((prev: number) => prev + amount);
      }
  }, [setUserCoins]);

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      <style>{shimmerStyle}</style>
      
      {/* Floating Timer & Reward Component */}
      <StudyTimer 
         currentPage={currentPage}
         masteryCount={masteryCount}
         onReward={handleTimeReward}
      />
      
      {/* --- HEADER (Style Word Chain + Real Data) --- */}
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-30 shadow-md">
        <div className="flex h-14 items-center justify-between px-4 w-full">
            <div className="flex justify-start">
               <HomeButton onClick={onGoBack} label="Home" />
            </div>
            
            {/* Page Info */}
            <div className="hidden md:block text-slate-300 font-medium text-sm">
                Topic Page <span className="text-white font-bold">{currentPage}</span> / {totalPages}
            </div>

            {/* Hiển thị Coins & Mastery */}
            <div className="flex items-center gap-2">
                <CoinDisplay displayedCoins={userCoins} isStatsFullscreen={false} />
                <MasteryDisplay masteryCount={masteryCount} />
            </div>
        </div>
      </header>
      {/* ------------------------------------------- */}

      {/* Main Content */}
      <div id="topic-scroll-container" className="flex-grow overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
          
          {/* Thông báo trang cho Mobile */}
          <div className="md:hidden flex justify-center pb-2">
             <span className="bg-white/80 backdrop-blur px-4 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-200">
                Page {currentPage} / {totalPages}
             </span>
          </div>

          <div className="flex flex-col gap-8">
            {currentItems.map((itemIndex) => (
              <TopicImageCard key={itemIndex} index={itemIndex} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 py-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:shadow-md'
              }`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            <div className="relative group">
               <select 
                 value={currentPage} 
                 onChange={(e) => setCurrentPage(Number(e.target.value))}
                 className="appearance-none bg-white border border-gray-300 text-gray-700 font-bold py-2.5 pl-4 pr-10 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hover:border-orange-400 transition-colors"
               >
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                   <option key={pageNum} value={pageNum}>{pageNum}</option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-hover:text-orange-500 transition-colors">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:shadow-md'
              }`}
            >
              Next
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
