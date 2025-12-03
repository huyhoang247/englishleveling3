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

// --- GAME CONFIGURATION ---
const FREE_PAGES = 5;
const BASE_UNLOCK_COST = 100;
const PAGES_PER_BLOCK = 5;
const PRICE_INCREASE_RATE = 0.2; // 20%

// --- HELPER: Tính giá mở khóa trang ---
const getUnlockCost = (page: number): number => {
    if (page <= FREE_PAGES) return 0;
    
    // Page 6-10 (Block 0): 100
    // Page 11-15 (Block 1): 120
    const paidBlockIndex = Math.floor((page - (FREE_PAGES + 1)) / PAGES_PER_BLOCK);
    
    let cost = BASE_UNLOCK_COST;
    for (let i = 0; i < paidBlockIndex; i++) {
        cost = cost * (1 + PRICE_INCREASE_RATE);
    }
    
    return Math.floor(cost);
};

// --- STYLES & ANIMATIONS ---
const styles = `
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes popup-enter {
    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
    50% { opacity: 1; transform: scale(1.05) translateY(-5px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-popup-enter {
    animation: popup-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .game-btn {
    transition: all 0.2s;
    border-bottom-width: 4px;
  }
  .game-btn:active {
    transform: translateY(2px);
    border-bottom-width: 1px;
    margin-top: 3px;
  }
`;

// --- ICONS (SVG) ---
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

const CoinIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <img 
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp" 
        alt="Coin" 
        className={`object-contain ${className} drop-shadow-sm`}
    />
);

// --- HELPER FUNCTIONS ---
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

const TopicSkeleton = () => (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="w-full h-72 sm:h-96 bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>
        </div>
    </div>
);

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
          loading="lazy" 
          className="w-full h-auto block"
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};

// --- COMPONENT: UNLOCK MODAL (Game Style) ---
const UnlockModal = ({ 
    cost, 
    currentPage, 
    userCoins, 
    onConfirm, 
    onCancel 
}: { 
    cost: number, 
    currentPage: number, 
    userCoins: number, 
    onConfirm: () => void, 
    onCancel: () => void 
}) => {
    const canAfford = userCoins >= cost;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-popup-enter relative">
                {/* Header Decoration */}
                <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="animate-float p-3 bg-white/20 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
                        <LockIcon />
                    </div>
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                        Unlock Page {currentPage}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Expand your knowledge library by unlocking this page.
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-right">
                            <div className="text-xs text-slate-400 font-bold uppercase">Cost</div>
                            <div className="flex items-center justify-end gap-1 text-red-500 font-black text-xl">
                                -{cost} <CoinIcon className="w-5 h-5"/>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-slate-300"></div>
                        <div className="text-left">
                            <div className="text-xs text-slate-400 font-bold uppercase">You Have</div>
                            <div className={`flex items-center gap-1 font-black text-xl ${canAfford ? 'text-green-600' : 'text-slate-400'}`}>
                                {userCoins} <CoinIcon className="w-5 h-5"/>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={!canAfford}
                            className={`flex-1 game-btn py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg
                                ${canAfford 
                                    ? 'bg-green-500 border-green-700 hover:bg-green-400' 
                                    : 'bg-gray-400 border-gray-500 cursor-not-allowed opacity-70'
                                }`}
                        >
                            {canAfford ? 'Unlock Now' : 'Not Enough'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: LOCKED OVERLAY ---
const LockedOverlay = ({ 
    cost, 
    onUnlockClick 
}: { 
    cost: number, 
    onUnlockClick: () => void 
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 space-y-6">
            <div className="relative">
                <div className="w-24 h-24 bg-slate-200 rounded-3xl flex items-center justify-center shadow-inner transform rotate-3">
                    <div className="w-20 h-20 bg-slate-300 rounded-2xl flex items-center justify-center shadow-sm">
                        <LockIcon />
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white">
                    LOCKED
                </div>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-700">Content Locked</h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                    You need to unlock this page to view the flashcards.
                </p>
            </div>

            <button 
                onClick={onUnlockClick}
                className="game-btn group relative px-8 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-full shadow-orange-200 shadow-xl border-orange-600 hover:scale-105 transition-transform"
            >
                <span className="flex items-center gap-2">
                    Unlock for {cost} <CoinIcon className="w-6 h-6 brightness-200"/>
                </span>
            </button>
        </div>
    );
};

// --- COMPONENT: STUDY TIMER (Revised Popup) ---
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
    const [hasRewardedThisPage, setHasRewardedThisPage] = useState(false); 
    
    // SVG Config
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((seconds / REWARD_DURATION_SECONDS) * 100, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `topic_rewards_${today}`;
        const stored = localStorage.getItem(key);
        setDailyCount(stored ? parseInt(stored, 10) : 0);
    }, []);

    useEffect(() => {
        setSeconds(0);
        setHasRewardedThisPage(false); 
    }, [currentPage]);

    useEffect(() => {
        if (dailyCount >= MAX_DAILY_REWARDS) return;
        const interval = setInterval(() => {
            setSeconds(prev => (prev >= REWARD_DURATION_SECONDS ? prev : prev + 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [dailyCount, hasRewardedThisPage]); 

    useEffect(() => {
        if (seconds >= REWARD_DURATION_SECONDS && dailyCount < MAX_DAILY_REWARDS && !hasRewardedThisPage) {
            const rewardAmount = BASE_GOLD_REWARD * (masteryCount > 0 ? masteryCount : 1);
            onReward(rewardAmount);
            setJustRewarded({ amount: rewardAmount });
            setTimeout(() => setJustRewarded(null), 4000);
            
            const newCount = dailyCount + 1;
            setDailyCount(newCount);
            setHasRewardedThisPage(true);
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`topic_rewards_${today}`, newCount.toString());
        }
    }, [seconds, dailyCount, hasRewardedThisPage, masteryCount, onReward]);

    const shouldHideTimer = dailyCount >= MAX_DAILY_REWARDS || hasRewardedThisPage;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* REWARD POPUP */}
            {justRewarded && (
                <div className="animate-popup-enter mb-4 pointer-events-auto">
                    <div className="relative bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 px-6 py-3 rounded-2xl shadow-xl shadow-yellow-200/50 flex items-center gap-3">
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                            BONUS!
                        </div>
                        <CoinIcon className="w-10 h-10 animate-spin-slow" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Reward</span>
                            <span className="text-2xl font-black text-yellow-600 leading-none">+{justRewarded.amount}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TIMER CIRCLE */}
            {!shouldHideTimer && (
                <div className="relative w-16 h-16 rounded-full shadow-lg border-4 border-white/80 bg-white/90 transition-all duration-300 pointer-events-auto hover:scale-110">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" className="opacity-50" />
                        <circle
                            cx="30" cy="30" r={radius} fill="none"
                            stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"
                            style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-[10px] font-bold text-gray-500/80">{dailyCount}/5</span>
                        <span className="text-[10px] text-orange-500 font-mono font-semibold">
                            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function TopicViewer({ onGoBack }: TopicViewerProps) {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [maxUnlockedPage, setMaxUnlockedPage] = useState(FREE_PAGES);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // Hooks
  const { userCoins, masteryCount, updateUserCoins } = useQuizApp();
  const totalPages = Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE);

  // Load Unlocked Progress
  useEffect(() => {
    const saved = localStorage.getItem('topic_max_unlocked_page');
    if (saved) {
        setMaxUnlockedPage(parseInt(saved, 10));
    } else {
        localStorage.setItem('topic_max_unlocked_page', FREE_PAGES.toString());
    }
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [currentPage]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
  }, [currentPage]);

  // Logic Mở khóa
  const isPageLocked = currentPage > maxUnlockedPage;
  const currentUnlockCost = useMemo(() => getUnlockCost(currentPage), [currentPage]);

  const handleUnlockConfirm = async () => {
    if (userCoins >= currentUnlockCost) {
        try {
            // Trừ tiền
            await updateUserCoins(-currentUnlockCost);
            
            // Cập nhật trang đã mở khóa (nếu mua trang 7 thì trang 6 cũng coi như mở nếu chưa mở)
            // Logic ở đây là: Mở khóa trang X thì maxUnlockedPage = X
            const newMax = Math.max(maxUnlockedPage, currentPage);
            setMaxUnlockedPage(newMax);
            localStorage.setItem('topic_max_unlocked_page', newMax.toString());
            
            setShowUnlockModal(false);
        } catch (error) {
            console.error("Failed to unlock:", error);
            alert("Something went wrong with the transaction.");
        }
    }
  };

  const handleTimeReward = useCallback((amount: number) => {
      if (updateUserCoins) updateUserCoins(amount);
  }, [updateUserCoins]);

  // Navigation Handlers
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  return (
    <div className="flex flex-col h-full bg-slate-100 relative font-sans">
      <style>{styles}</style>
      
      {/* --- POPUPS & MODALS --- */}
      <StudyTimer 
         currentPage={currentPage}
         masteryCount={masteryCount}
         onReward={handleTimeReward}
      />

      {showUnlockModal && (
        <UnlockModal 
            cost={currentUnlockCost}
            currentPage={currentPage}
            userCoins={userCoins}
            onConfirm={handleUnlockConfirm}
            onCancel={() => setShowUnlockModal(false)}
        />
      )}
      
      {/* --- HEADER --- */}
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-md z-30 shadow-lg border-b border-slate-700">
        <div className="flex h-16 items-center justify-between px-4 w-full">
            <div className="flex justify-start">
               <HomeButton onClick={onGoBack} label="Back" />
            </div>
            
            <div className="hidden md:flex flex-col items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Topic Viewer</span>
                <span className="text-white font-bold text-lg">
                    Page {currentPage} <span className="text-slate-500">/ {totalPages}</span>
                </span>
            </div>

            <div className="flex items-center gap-3">
                <CoinDisplay displayedCoins={userCoins} isStatsFullscreen={false} />
                <MasteryDisplay masteryCount={masteryCount} />
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div id="topic-scroll-container" className="flex-grow overflow-y-auto p-4 bg-slate-100">
        <div className="max-w-2xl mx-auto pb-10">
          
          {/* Mobile Page Indicator */}
          <div className="md:hidden flex justify-center pb-4 sticky top-0 z-20 pt-2">
             <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
                Page {currentPage} of {totalPages}
             </span>
          </div>

          {/* Content Area */}
          <div className="min-h-[60vh]">
              {isPageLocked ? (
                  <LockedOverlay 
                    cost={currentUnlockCost} 
                    onUnlockClick={() => setShowUnlockModal(true)} 
                  />
              ) : (
                  <div className="flex flex-col gap-6 animate-popup-enter">
                    {currentItems.map((itemIndex) => (
                      <TopicImageCard key={itemIndex} index={itemIndex} />
                    ))}
                  </div>
              )}
          </div>

          {/* Controls Footer */}
          <div className="flex justify-center items-center gap-4 py-8 mt-4 border-t border-slate-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                currentPage === 1
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-orange-500 hover:text-white hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              Previous
            </button>

            <div className="relative group">
               <select 
                 value={currentPage} 
                 onChange={(e) => setCurrentPage(Number(e.target.value))}
                 className="appearance-none bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 pl-6 pr-12 rounded-xl shadow-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 cursor-pointer hover:border-orange-400 transition-colors"
               >
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                   <option key={pageNum} value={pageNum}>
                       Page {pageNum} {pageNum > maxUnlockedPage ? '🔒' : ''}
                   </option>
                 ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   ▼
               </div>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                currentPage === totalPages
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-orange-500 hover:text-white hover:shadow-orange-200 hover:shadow-lg hover:-translate-y-1'
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
