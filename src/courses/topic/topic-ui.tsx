// --- START OF FILE: topic.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Imports từ các file khác ---
import { useQuizApp } from '../course-context.tsx'; 
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

// ... (Giữ nguyên các hàm getTopicImageUrl, TopicSkeleton, TopicImageCard như cũ) ...

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

const TopicSkeleton = () => {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="w-full h-72 sm:h-96 bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>
        </div>
      </div>
    );
};

const TopicImageCard = ({ index }: { index: number }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = useMemo(() => getTopicImageUrl(index), [index]);

  if (hasError) return null;

  return (
    <div className="relative group w-full">
      {isLoading && <TopicSkeleton />}
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${isLoading ? 'hidden' : 'block'}`}>
        <img
          src={imageUrl}
          alt={`Topic ${index}`}
          loading="eager" 
          className="w-full h-auto block"
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};

// --- COMPONENT: STUDY TIMER (ĐÃ FIX LỖI) ---
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
    const [hasRewardedThisPage, setHasRewardedThisPage] = useState(false); // Cờ kiểm tra đã nhận thưởng trang này chưa
    
    // SVG Circle Config
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((seconds / REWARD_DURATION_SECONDS) * 100, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Load daily limit từ LocalStorage
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `topic_rewards_${today}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            setDailyCount(parseInt(stored, 10));
        } else {
            setDailyCount(0);
        }
    }, []);

    // Reset Timer khi đổi trang
    useEffect(() => {
        setSeconds(0);
        setHasRewardedThisPage(false); // Reset cờ để cho phép nhận thưởng ở trang mới
    }, [currentPage]);

    // Timer Logic chạy mỗi giây
    useEffect(() => {
        // Nếu đã hết lượt trong ngày HOẶC đã nhận thưởng trang này rồi -> Không chạy timer nữa (hoặc chạy đến max rồi dừng)
        if (dailyCount >= MAX_DAILY_REWARDS) return;

        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev >= REWARD_DURATION_SECONDS) return prev; // Dừng ở max
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [dailyCount, hasRewardedThisPage]); // Thêm hasRewardedThisPage vào dependencies

    // Logic trả thưởng (FIXED: Thêm điều kiện !hasRewardedThisPage)
    useEffect(() => {
        if (
            seconds >= REWARD_DURATION_SECONDS && 
            dailyCount < MAX_DAILY_REWARDS && 
            !hasRewardedThisPage // Chỉ thưởng nếu CHƯA nhận ở trang này
        ) {
            const rewardAmount = BASE_GOLD_REWARD * (masteryCount > 0 ? masteryCount : 1);
            
            // 1. Gọi hàm cộng tiền
            onReward(rewardAmount);
            
            // 2. Hiệu ứng UI
            setJustRewarded({ amount: rewardAmount });
            setTimeout(() => setJustRewarded(null), 3000);

            // 3. Tăng biến đếm ngày
            const newCount = dailyCount + 1;
            setDailyCount(newCount);
            
            // 4. Đánh dấu đã nhận xong cho trang này (Chặn loop)
            setHasRewardedThisPage(true);
            
            // 5. Lưu vào Storage
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`topic_rewards_${today}`, newCount.toString());
        }
    }, [seconds, dailyCount, hasRewardedThisPage, masteryCount, onReward]);

    const isDailyLimitReached = dailyCount >= MAX_DAILY_REWARDS;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            
            {/* Popup thông báo cộng tiền */}
            {justRewarded && (
                <div className="animate-popup bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold shadow-lg border-2 border-yellow-200 mb-3 flex items-center gap-2 pointer-events-auto">
                    <span>+ {justRewarded.amount} Coins</span>
                </div>
            )}

            {/* Vòng tròn Progress */}
            <div className={`relative w-16 h-16 bg-white rounded-full shadow-xl border-4 transition-colors duration-300 pointer-events-auto group
                ${isDailyLimitReached ? 'border-gray-200 bg-gray-50' : 'border-white'}
            `}>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   {isDailyLimitReached 
                        ? 'Daily limit reached (5/5)' 
                        : hasRewardedThisPage 
                            ? 'Page completed. Change page to earn more.' 
                            : `Stay 5 mins: ${dailyCount}/${MAX_DAILY_REWARDS} today`
                   }
                </div>

                {/* SVG Progress */}
                {!isDailyLimitReached && (
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="4" />
                        <circle
                            cx="30" cy="30" r={radius} fill="none"
                            stroke={hasRewardedThisPage ? "#10B981" : "#F59E0B"} // Xanh lá nếu xong trang, Vàng nếu đang chạy
                            strokeWidth="4" strokeLinecap="round"
                            style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                )}

                {/* Icon ở giữa */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    {isDailyLimitReached ? (
                        <div className="flex flex-col items-center text-gray-400">
                             <span className="text-xs font-bold">5/5</span>
                             <span className="text-[10px]">Done</span>
                        </div>
                    ) : hasRewardedThisPage ? (
                        <div className="flex flex-col items-center text-green-600 animate-bounce">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                             </svg>
                        </div>
                    ) : (
                        <>
                            <span className="text-[10px] font-bold text-gray-500">
                                {dailyCount}/5
                            </span>
                            <span className="text-[10px] text-orange-500 font-mono">
                                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                            </span>
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
  
  // Context
  const { userCoins, masteryCount, setUserCoins } = useQuizApp();

  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [currentPage]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
  }, [currentPage]);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  // Hàm nhận thưởng từ Timer
  const handleTimeReward = useCallback((amount: number) => {
      if (setUserCoins) {
          setUserCoins((prev: number) => prev + amount);
      }
  }, [setUserCoins]);

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      <style>{shimmerStyle}</style>
      
      {/* Timer nằm đè lên nội dung, góc phải dưới */}
      <StudyTimer 
         currentPage={currentPage}
         masteryCount={masteryCount}
         onReward={handleTimeReward}
      />
      
      {/* Header */}
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-30 shadow-md">
        <div className="flex h-14 items-center justify-between px-4 w-full">
            <div className="flex justify-start">
               <HomeButton onClick={onGoBack} label="Home" />
            </div>
            
            <div className="hidden md:block text-slate-300 font-medium text-sm">
                Topic Page <span className="text-white font-bold">{currentPage}</span> / {totalPages}
            </div>

            <div className="flex items-center gap-2">
                <CoinDisplay displayedCoins={userCoins} isStatsFullscreen={false} />
                <MasteryDisplay masteryCount={masteryCount} />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div id="topic-scroll-container" className="flex-grow overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
          
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

          {/* Controls */}
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
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
