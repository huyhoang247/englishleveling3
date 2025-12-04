// --- START OF FILE: topic.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Imports từ các file khác ---
import { useQuizApp } from '../course-context.tsx'; 
import HomeButton from '../../ui/home-button.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx'; 
import MasteryDisplay from '../../ui/display/mastery-display.tsx'; 

// --- NEW IMPORTS: Direct from Topic Service ---
import { 
  listenToTopicData, 
  unlockTopicPageTransaction, 
  claimTopicRewardTransaction, 
  TopicProgressData 
} from './topic-service.ts';

interface TopicViewerProps {
  onGoBack: () => void;
}

const ITEMS_PER_PAGE = 20;
const MAX_TOTAL_ITEMS = 2000; 
const REWARD_DURATION_SECONDS = 300; 
const MAX_DAILY_REWARDS = 5;
const BASE_GOLD_REWARD = 5;

// --- GAME LOGIC CONSTANTS ---
const FREE_PAGES = 5;          
const PAGES_PER_TIER = 5;      
const BASE_COST = 100;         
const COST_MULTIPLIER = 1.2;
const LEVELS_PER_MAP_PAGE = 25; 

// --- STYLES & ANIMATIONS (Giữ nguyên) ---
const styles = `
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes popup-zoom {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes popup-slide-up {
    0% { transform: translateY(100%); }
    100% { transform: translateY(0); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes popup-fade-up {
    0% { opacity: 0; transform: translateY(10px) scale(0.9); }
    20% { opacity: 1; transform: translateY(0) scale(1); }
    80% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
  }

  .animate-popup-zoom {
    animation: popup-zoom 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .animate-popup-slide-up {
    animation: popup-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .animate-shake {
    animation: shake 0.3s ease-in-out;
  }
  
  .animate-popup {
    animation: popup-fade-up 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  /* Game Button 3D Effect - Green */
  .btn-game-green {
    background: linear-gradient(to bottom, #4ade80, #22c55e);
    border-bottom: 4px solid #15803d;
    transition: all 0.1s;
  }
  .btn-game-green:active {
    transform: translateY(4px);
    border-bottom: 0px solid transparent;
  }
  
  /* Game Button 3D Effect - Gray */
  .btn-game-gray {
    background: #f1f5f9;
    color: #64748b;
    border-bottom: 4px solid #cbd5e1;
    transition: all 0.1s;
  }
  .btn-game-gray:active {
    transform: translateY(4px);
    border-bottom: 0px solid transparent;
  }

  /* Navigation Arrow Button 3D */
  .btn-nav {
    transition: all 0.1s;
    box-shadow: 0px 3px 0px 0px rgba(0,0,0,0.1);
  }
  .btn-nav:active {
    transform: translateY(3px);
    box-shadow: none;
  }

  /* Select Button 3D (Dark) */
  .btn-select-3d {
    transition: all 0.1s;
    box-shadow: 0px 4px 0px 0px #0f172a; 
  }
  .btn-select-3d:active {
    transform: translateY(4px);
    box-shadow: none;
  }

  /* Level Node Button */
  .level-node {
    transition: transform 0.1s, filter 0.2s;
    box-shadow: 0px 3px 0px 0px rgba(0,0,0,0.3);
  }
  .level-node:active {
    transform: translateY(3px);
    box-shadow: none;
  }
`;

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

const calculatePageCost = (page: number): number => {
  if (page <= FREE_PAGES) return 0;
  const tierIndex = Math.floor((page - 1 - FREE_PAGES) / PAGES_PER_TIER);
  const cost = BASE_COST * Math.pow(COST_MULTIPLIER, tierIndex);
  return Math.floor(cost);
};

// --- SUB-COMPONENTS ---
const TopicSkeleton = () => (
  <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
    <div className="w-full h-72 sm:h-96 bg-gray-200 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>
    </div>
  </div>
);

const TopicImageCard = React.memo(({ index }: { index: number }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageUrl = useMemo(() => getTopicImageUrl(index), [index]);

  if (hasError) return null;

  return (
    <div className="relative group w-full">
      {isLoading && <TopicSkeleton />}
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-500 ${
        isLoading 
          ? 'absolute top-0 left-0 w-full opacity-0 pointer-events-none -z-10' 
          : 'relative opacity-100 z-0'
      }`}>
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
});

// --- LEVEL MAP MODAL ---
interface LevelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  maxUnlockedPage: number;
  onSelectPage: (page: number) => void;
}

const LevelMapModal = ({ isOpen, onClose, currentPage, totalPages, maxUnlockedPage, onSelectPage }: LevelMapModalProps) => {
  const [currentMapPage, setCurrentMapPage] = useState(1);
  const totalMapPages = Math.ceil(totalPages / LEVELS_PER_MAP_PAGE);

  useEffect(() => {
    if (isOpen) {
      const mapPageForCurrentLevel = Math.ceil(currentPage / LEVELS_PER_MAP_PAGE);
      setCurrentMapPage(mapPageForCurrentLevel);
    }
  }, [isOpen, currentPage]);

  if (!isOpen) return null;

  const startLevel = (currentMapPage - 1) * LEVELS_PER_MAP_PAGE + 1;
  const endLevel = Math.min(currentMapPage * LEVELS_PER_MAP_PAGE, totalPages);
  const levelsToShow = Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/80 transition-opacity animate-[fade-in_0.2s]" onClick={onClose} />
      
      <div className="relative bg-slate-900 w-full sm:w-[420px] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-popup-slide-up sm:animate-popup-zoom border-t border-slate-700 sm:border">
        
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shrink-0">
           <h3 className="text-white font-black text-lg flex items-center gap-2">
             <span className="text-orange-500 text-2xl">🗺️</span> Level Map
           </h3>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <div className="flex-1 p-5 min-h-[300px]">
           <div className="grid grid-cols-5 gap-3">
              {levelsToShow.map(pageNum => {
                 const isLocked = pageNum > maxUnlockedPage;
                 const isCurrent = pageNum === currentPage;
                 const isUnlocked = !isLocked;
                 const isDeepLocked = pageNum > maxUnlockedPage + 1;

                 let bgClass = "";
                 if (isCurrent) {
                    bgClass = "bg-yellow-400 border-yellow-600 text-yellow-900 ring-2 ring-yellow-200 ring-offset-2 ring-offset-slate-900 z-10 scale-110";
                 } else if (isUnlocked) {
                    bgClass = "bg-blue-500 border-blue-700 text-white hover:bg-blue-400";
                 } else if (isDeepLocked) {
                    bgClass = "bg-slate-800 border-slate-950 text-slate-600 opacity-50 cursor-not-allowed";
                 } else {
                    bgClass = "bg-slate-700 border-slate-900 text-slate-500 hover:bg-slate-600";
                 }

                 return (
                   <button
                     key={pageNum}
                     disabled={isDeepLocked}
                     onClick={() => {
                        if (!isDeepLocked) {
                            onSelectPage(pageNum);
                            onClose();
                        }
                     }}
                     className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm relative level-node ${bgClass}`}
                   >
                     {isLocked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-50">
                           <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                     ) : (
                        pageNum
                     )}
                   </button>
                 );
              })}
           </div>
        </div>
        
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between shrink-0">
            <button 
                onClick={() => setCurrentMapPage(prev => Math.max(1, prev - 1))}
                disabled={currentMapPage === 1}
                className={`p-2 rounded-lg font-bold text-sm flex items-center gap-1 ${currentMapPage === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Prev
            </button>

            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full">
                Map {currentMapPage} / {totalMapPages}
            </span>

            <button 
                onClick={() => setCurrentMapPage(prev => Math.min(totalMapPages, prev + 1))}
                disabled={currentMapPage === totalMapPages}
                className={`p-2 rounded-lg font-bold text-sm flex items-center gap-1 ${currentMapPage === totalMapPages ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

// --- UNLOCK MODAL ---
interface UnlockModalProps {
  targetPage: number;
  cost: number;
  currentCoins: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnlockModal = ({ targetPage, cost, currentCoins, onConfirm, onCancel }: UnlockModalProps) => {
  const canAfford = currentCoins >= cost;
  const [isShaking, setIsShaking] = useState(false);

  const handleAttemptUnlock = () => {
    if (canAfford) {
      onConfirm();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity animate-[fade-in_0.2s]" 
        onClick={onCancel}
      />
      <div className={`relative bg-white w-full max-w-xs sm:max-w-sm rounded-2xl p-5 shadow-2xl animate-popup-zoom overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3">
             <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-orange-500">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
             </div>
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-1">Unlock Page {targetPage}</h3>
          
          <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg mb-4 mt-2">
              <span className="text-slate-500 text-sm font-medium">Cost:</span>
              <span className={`text-lg font-black ${canAfford ? 'text-slate-800' : 'text-red-500'}`}>{cost}</span>
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp" alt="Coin" className="w-5 h-5 object-contain" />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleAttemptUnlock}
              className={`py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 ${canAfford ? 'btn-game-green' : 'bg-gray-400 border-b-4 border-gray-500 cursor-not-allowed'}`}
            >
              {canAfford ? 'Unlock' : 'No Coin'}
            </button>
            <button onClick={onCancel} className="btn-game-gray py-3 rounded-xl font-bold text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STUDY TIMER ---
const StudyTimer = React.memo(({ 
    currentPage, 
    masteryCount, 
    dailyCountFromServer,
    lastDateFromServer,
    onReward,
    forceHide
}: { 
    currentPage: number, 
    masteryCount: number,
    dailyCountFromServer: number,
    lastDateFromServer: string,
    onReward: (amount: number) => void,
    forceHide: boolean
}) => {
    const [seconds, setSeconds] = useState(0);
    const [justRewarded, setJustRewarded] = useState<{amount: number} | null>(null);
    const [hasRewardedThisPage, setHasRewardedThisPage] = useState(false); 

    const effectiveDailyCount = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        if (lastDateFromServer !== today) return 0;
        return dailyCountFromServer;
    }, [dailyCountFromServer, lastDateFromServer]);
    
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((seconds / REWARD_DURATION_SECONDS) * 100, 100);

    useEffect(() => {
        setSeconds(0);
        setHasRewardedThisPage(false); 
    }, [currentPage]);

    useEffect(() => {
        if (effectiveDailyCount >= MAX_DAILY_REWARDS) return;
        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev >= REWARD_DURATION_SECONDS) return prev; 
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [effectiveDailyCount, hasRewardedThisPage]); 

    useEffect(() => {
        if (seconds >= REWARD_DURATION_SECONDS && effectiveDailyCount < MAX_DAILY_REWARDS && !hasRewardedThisPage) {
            const rewardAmount = BASE_GOLD_REWARD * (masteryCount > 0 ? masteryCount : 1);
            onReward(rewardAmount);
            setJustRewarded({ amount: rewardAmount });
            setTimeout(() => setJustRewarded(null), 3000);
            setHasRewardedThisPage(true);
        }
    }, [seconds, effectiveDailyCount, hasRewardedThisPage, masteryCount, onReward]);

    const isDailyLimitReached = effectiveDailyCount >= MAX_DAILY_REWARDS;
    const isCompleted = hasRewardedThisPage;

    const containerClasses = `fixed bottom-6 right-6 z-40 flex flex-col items-end transition-all duration-300 transform ${
        forceHide ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
    }`;

    return (
        <div className={containerClasses}>
            {justRewarded && (
                <div className="animate-popup bg-white border-2 border-yellow-400 px-5 py-2.5 rounded-full shadow-xl mb-4 flex items-center gap-2 pointer-events-auto origin-bottom-right">
                    <span className="text-xl font-black text-yellow-500 drop-shadow-sm">+{justRewarded.amount}</span>
                    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp" alt="Gold" className="w-7 h-7 object-contain filter drop-shadow-sm"/>
                </div>
            )}
            {(!isDailyLimitReached && !isCompleted) && (
                <div className="relative w-16 h-16 rounded-full shadow-lg border-4 border-white/50 bg-white/80 pointer-events-auto group transition-transform hover:scale-105">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" className="opacity-50" />
                        <circle cx="30" cy="30" r={radius} fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (progress / 100) * circumference, transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-[10px] font-bold text-gray-500/80">{effectiveDailyCount}/{MAX_DAILY_REWARDS}</span>
                        <span className="text-[10px] text-orange-500 font-mono font-semibold">{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
            )}
        </div>
    );
});

// --- MAIN COMPONENT ---
export default function TopicViewer({ onGoBack }: TopicViewerProps) {
  // Lấy User data từ Context
  const { user, userCoins, masteryCount } = useQuizApp();
  
  // --- STATE 1: Trạng thái dữ liệu Topic ---
  // Biến isDataLoaded rất quan trọng: Nó chặn việc Reset Page sai khi dữ liệu chưa về
  const [topicData, setTopicData] = useState<TopicProgressData>({
    maxUnlockedPage: FREE_PAGES,
    dailyReward: { date: '', count: 0 }
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- EFFECT: Lắng nghe dữ liệu Topic ---
  useEffect(() => {
    if (user) {
      const unsubscribe = listenToTopicData(user.uid, (data) => {
        setTopicData(data);
        setIsDataLoaded(true); // Đánh dấu là đã có dữ liệu thật
      });
      return () => unsubscribe();
    } else {
        setTopicData({ maxUnlockedPage: FREE_PAGES, dailyReward: { date: '', count: 0 } });
        setIsDataLoaded(false);
    }
  }, [user]);

  const maxUnlockedPage = topicData.maxUnlockedPage;

  // --- STATE 2: Trang hiện tại ---
  // Logic khởi tạo: Luôn tin tưởng LocalStorage trước (dù có thể là page 7)
  const [currentPage, setCurrentPage] = useState(() => {
     const saved = localStorage.getItem('topic_current_page');
     // Chỉ lấy giá trị, KHÔNG kiểm tra maxUnlockedPage ở đây để tránh race condition
     return saved ? parseInt(saved, 10) : 1;
  });

  // --- EFFECT QUAN TRỌNG: Sync dữ liệu ---
  // Chỉ chạy khi đã có dữ liệu thật (isDataLoaded = true)
  useEffect(() => {
      if (!isDataLoaded) return; // Nếu chưa tải xong DB thì đừng làm gì cả!

      // Nếu dữ liệu thật về (VD: maxPage=7) và currentPage đang 7 -> OK
      // Nếu dữ liệu thật về (VD: maxPage=5) mà currentPage đang 7 -> Reset về 5
      if (currentPage > maxUnlockedPage) {
          setCurrentPage(maxUnlockedPage);
      }
      
      // Nếu currentPage nhỏ hơn 1 -> Reset về 1
      if (currentPage < 1) {
          setCurrentPage(1);
      }

  }, [maxUnlockedPage, isDataLoaded]); // Bỏ currentPage ra khỏi deps để tránh loop không cần thiết

  const [unlockModalData, setUnlockModalData] = useState<{ targetPage: number, cost: number } | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false); 

  const totalPages = Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE);

  useEffect(() => {
    localStorage.setItem('topic_current_page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
        setIsAtBottom(false);
    }
  }, [currentPage]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottomThreshold = 150; 
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
        setIsAtBottom(true);
    } else {
        setIsAtBottom(false);
    }
  };

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
  }, [currentPage]);

  const tryNavigateToPage = (page: number) => {
    if (page > totalPages || page < 1) return;
    
    // Logic điều hướng
    if (page <= maxUnlockedPage) {
      setCurrentPage(page);
    } else if (page === maxUnlockedPage + 1) {
      const cost = calculatePageCost(page);
      setUnlockModalData({ targetPage: page, cost });
    }
  };

  const handleConfirmUnlock = () => {
    if (!unlockModalData || !user) return;
    const { cost, targetPage } = unlockModalData;

    unlockTopicPageTransaction(user.uid, targetPage, cost)
        .then(() => {
            setCurrentPage(targetPage);
            setUnlockModalData(null);
        })
        .catch(err => {
            console.error("Unlock failed", err);
            alert("Unlock failed: " + err.message);
        });
  };

  const handleReward = useCallback((amount: number) => {
      if (!user) return;
      claimTopicRewardTransaction(user.uid, amount, MAX_DAILY_REWARDS)
        .catch(err => console.error("Reward claim failed", err));
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-gray-100 relative overflow-hidden">
      <style>{styles}</style>
      
      {unlockModalData && (
        <UnlockModal 
          targetPage={unlockModalData.targetPage}
          cost={unlockModalData.cost}
          currentCoins={userCoins}
          onConfirm={handleConfirmUnlock}
          onCancel={() => setUnlockModalData(null)}
        />
      )}

      {/* Map Modal */}
      <LevelMapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        currentPage={currentPage}
        totalPages={totalPages}
        maxUnlockedPage={maxUnlockedPage}
        onSelectPage={tryNavigateToPage}
      />

      <StudyTimer 
         currentPage={currentPage}
         masteryCount={masteryCount}
         dailyCountFromServer={topicData.dailyReward.count}
         lastDateFromServer={topicData.dailyReward.date}
         onReward={handleReward}
         forceHide={isAtBottom} 
      />
      
      {/* Header */}
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-30 shadow-md border-b border-slate-700">
        <div className="flex h-14 items-center justify-between px-4 w-full">
            <div className="flex justify-start">
               <HomeButton onClick={onGoBack} label="Back" />
            </div>
            
            <div className="hidden md:flex flex-col items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Topic Browser</span>
                <span className="text-white font-bold text-sm">Page {currentPage} <span className="text-slate-500">/ {totalPages}</span></span>
            </div>

            <div className="flex items-center gap-3">
                <CoinDisplay displayedCoins={userCoins} isStatsFullscreen={false} />
                <MasteryDisplay masteryCount={masteryCount} />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div 
        id="topic-scroll-container" 
        className="flex-grow overflow-y-auto p-4 scroll-smooth"
        onScroll={handleScroll} 
      >
        <div className="max-w-2xl mx-auto space-y-4 pb-2">

          <div className="flex flex-col gap-6">
            {currentItems.map((itemIndex) => (
              <TopicImageCard key={itemIndex} index={itemIndex} />
            ))}
          </div>

          {/* Controls Navigation */}
          <div className="flex justify-center items-center gap-3 py-2 mt-2 w-full">
            <div className="bg-white p-1.5 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 transform transition-transform hover:scale-105">
                
                <button
                onClick={() => tryNavigateToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center rounded-full btn-nav ${
                    currentPage === 1
                    ? 'bg-gray-100 text-gray-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-500 hover:text-white'
                }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                </button>

                {/* 3D MAP TRIGGER BUTTON */}
                <button
                    onClick={() => setIsMapOpen(true)}
                    className="relative group bg-slate-800/70 hover:bg-slate-800 text-white font-bold py-2 pl-4 pr-3 rounded-full shadow-sm min-w-[140px] text-center text-sm btn-select-3d backdrop-blur-sm flex items-center justify-between gap-2"
                >
                    <span>Page {currentPage} / {totalPages}</span>
                    {currentPage > maxUnlockedPage ? (
                        <span className="text-sm">🔒</span>
                    ) : (
                         <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                </button>

                <button
                onClick={() => tryNavigateToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center rounded-full btn-nav ${
                    currentPage === totalPages
                    ? 'bg-gray-100 text-gray-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-500 hover:text-white'
                }`}
                >
                    {currentPage + 1 > maxUnlockedPage ? (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-500">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                         </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    )}
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
