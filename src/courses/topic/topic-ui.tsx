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
  toggleTopicFavoriteTransaction, 
  saveTopicCurrentPage, 
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

// --- STYLES & ANIMATIONS ---
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

  /* Hiệu ứng nhịp tim khi active */
  @keyframes heart-beat {
    0% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-spin-custom {
    animation: spin 1s linear infinite;
  }
  
  .animate-heart-beat {
    animation: heart-beat 0.3s ease-in-out;
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
  
  .btn-game-green {
    background: linear-gradient(to bottom, #4ade80, #22c55e);
    border-bottom: 4px solid #15803d;
    transition: all 0.1s;
  }
  .btn-game-green:active {
    transform: translateY(4px);
    border-bottom: 0px solid transparent;
  }
  
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

  .btn-nav {
    transition: all 0.1s;
    box-shadow: 0px 3px 0px 0px rgba(0,0,0,0.1);
  }
  .btn-nav:active {
    transform: translateY(3px);
    box-shadow: none;
  }

  .btn-select-3d {
    transition: all 0.1s;
    box-shadow: 0px 4px 0px 0px #0f172a; 
  }
  .btn-select-3d:active {
    transform: translateY(4px);
    box-shadow: none;
  }

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

// FavoriteButton giống hệt VerticalFlashcardGallery
const FavoriteButton = ({ 
  isFavorite, 
  onToggle, 
  isToggling 
}: { 
  isFavorite: boolean; 
  onToggle: () => void;
  isToggling: boolean;
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!isToggling) onToggle();
      }}
      disabled={isToggling}
      className={`absolute top-3 right-3 z-10 flex items-center justify-center p-2 rounded-full shadow-md transition-all duration-300 
        ${isToggling ? 'cursor-wait bg-gray-100' : 'bg-white/90 hover:bg-white'} 
        ${isFavorite ? 'scale-110' : 'scale-100'}
      `}
    >
      {isToggling ? (
         <svg className="animate-spin-custom h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
      ) : (
        <img 
          src={isFavorite 
            ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" 
            : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"
          }
          alt={isFavorite ? "Favorited" : "Add to favorites"}
          className={`w-5 h-5 transition-all duration-300 ${
            isFavorite 
                ? 'opacity-100 animate-heart-beat' 
                : 'opacity-50 hover:opacity-100'
          }`}
        />
      )}
    </button>
  );
};

const TopicImageCard = React.memo(({ 
    index, 
    isFavorite, 
    onToggleFavorite, 
    isTogglingFavorite 
}: { 
    index: number, 
    isFavorite: boolean, 
    onToggleFavorite: (id: number) => void,
    isTogglingFavorite: boolean
}) => {
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
        
        <FavoriteButton 
            isFavorite={isFavorite} 
            onToggle={() => onToggleFavorite(index)} 
            isToggling={isTogglingFavorite}
        />

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
});

// --- UPDATED LEVEL MAP MODAL ---
interface LevelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParentPage: number;
  currentParentViewMode: 'all' | 'favorites';
  maxUnlockedPage: number;
  favoritesCount: number;
  onConfirmSelection: (page: number, mode: 'all' | 'favorites') => void;
}

const LevelMapModal = ({ 
    isOpen, 
    onClose, 
    currentParentPage,
    currentParentViewMode,
    maxUnlockedPage, 
    favoritesCount,
    onConfirmSelection
}: LevelMapModalProps) => {
  
  const [localTab, setLocalTab] = useState<'all' | 'favorites'>('all');
  const [currentMapPage, setCurrentMapPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setLocalTab(currentParentViewMode);
      const mapPageForCurrentLevel = Math.ceil(currentParentPage / LEVELS_PER_MAP_PAGE);
      setCurrentMapPage(mapPageForCurrentLevel || 1);
    }
  }, [isOpen, currentParentPage, currentParentViewMode]);

  if (!isOpen) return null;

  const totalPagesInLocalTab = localTab === 'all' 
     ? Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE)
     : Math.max(1, Math.ceil(favoritesCount / ITEMS_PER_PAGE));

  const totalMapPages = Math.ceil(totalPagesInLocalTab / LEVELS_PER_MAP_PAGE);

  const startLevel = (currentMapPage - 1) * LEVELS_PER_MAP_PAGE + 1;
  
  const gridCells = Array.from({ length: LEVELS_PER_MAP_PAGE }, (_, i) => {
      const levelNum = startLevel + i;
      if (levelNum <= totalPagesInLocalTab) {
          return levelNum;
      }
      return null; 
  });

  const handleTabChange = (tab: 'all' | 'favorites') => {
      setLocalTab(tab);
      setCurrentMapPage(1); 
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/80 transition-opacity animate-[fade-in_0.2s]" onClick={onClose} />
      
      <div className="relative bg-slate-900 w-full sm:w-[420px] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-popup-slide-up sm:animate-popup-zoom border-t border-slate-700 sm:border">
        
        {/* HEADER & TABS */}
        <div className="bg-slate-800 border-b border-slate-700 shrink-0">
            <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                    <span className="text-orange-500 text-2xl">
                        {localTab === 'all' ? '🗺️' : '❤️'}
                    </span> 
                    {localTab === 'all' ? 'Level Map' : 'Favorites'}
                </h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex px-4 pb-0 gap-1">
                <button 
                    onClick={() => handleTabChange('all')}
                    className={`flex-1 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${
                        localTab === 'all' 
                            ? 'bg-slate-700 text-white border-orange-500' 
                            : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                >
                    All Topics
                </button>
                <button 
                    onClick={() => handleTabChange('favorites')}
                    className={`flex-1 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 flex justify-center items-center gap-2 ${
                        localTab === 'favorites' 
                            ? 'bg-slate-700 text-white border-red-500' 
                            : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                >
                    Favorites
                    <span className="bg-slate-900 text-xs px-1.5 py-0.5 rounded-full text-slate-400">{favoritesCount}</span>
                </button>
            </div>
        </div>

        {/* GRID CONTENT */}
        <div className="flex-1 p-5 min-h-[300px]">
           {totalPagesInLocalTab === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="font-medium">No pages found</p>
                </div>
           ) : (
               <div className="grid grid-cols-5 gap-3">
                  {gridCells.map((pageNum, index) => {
                     if (pageNum === null) {
                         return <div key={`empty-${index}`} className="aspect-square"></div>;
                     }

                     const isLocked = localTab === 'all' && pageNum > maxUnlockedPage;
                     const isCurrent = (localTab === currentParentViewMode) && (pageNum === currentParentPage);
                     const isDeepLocked = localTab === 'all' && pageNum > maxUnlockedPage + 1;
                     const isDisabled = localTab === 'all' ? isDeepLocked : false;

                     let bgClass = "";
                     if (isCurrent) {
                        bgClass = "bg-yellow-400 border-yellow-600 text-yellow-900 ring-2 ring-yellow-200 ring-offset-2 ring-offset-slate-900 z-10 scale-110";
                     } else if (!isLocked) {
                        bgClass = localTab === 'favorites' 
                            ? "bg-red-500 border-red-700 text-white hover:bg-red-400"
                            : "bg-blue-500 border-blue-700 text-white hover:bg-blue-400";
                     } else if (isDeepLocked) {
                        bgClass = "bg-slate-800 border-slate-950 text-slate-600 opacity-50 cursor-not-allowed";
                     } else {
                        bgClass = "bg-slate-700 border-slate-900 text-slate-500 hover:bg-slate-600";
                     }

                     return (
                       <button
                         key={pageNum}
                         disabled={isDisabled}
                         onClick={() => {
                            if (!isDisabled) {
                                onConfirmSelection(pageNum, localTab);
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
           )}
        </div>
        
        {/* FOOTER NAVIGATION */}
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
                {totalMapPages > 0 ? `Page ${currentMapPage} / ${totalMapPages}` : 'Empty'}
            </span>

            <button 
                onClick={() => setCurrentMapPage(prev => Math.min(totalMapPages, prev + 1))}
                disabled={currentMapPage === totalMapPages || totalMapPages === 0}
                className={`p-2 rounded-lg font-bold text-sm flex items-center gap-1 ${currentMapPage === totalMapPages || totalMapPages === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
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
  isUnlocking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnlockModal = ({ targetPage, cost, currentCoins, isUnlocking, onConfirm, onCancel }: UnlockModalProps) => {
  const canAfford = currentCoins >= cost;
  const [isShaking, setIsShaking] = useState(false);

  const handleAttemptUnlock = () => {
    if (isUnlocking) return;
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
        onClick={!isUnlocking ? onCancel : undefined}
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
              disabled={(!canAfford && !isUnlocking) || isUnlocking}
              className={`py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                isUnlocking 
                    ? 'bg-green-600 border-b-4 border-green-700 cursor-wait opacity-90' 
                    : canAfford 
                        ? 'btn-game-green' 
                        : 'bg-gray-400 border-b-4 border-gray-500 cursor-not-allowed'
              }`}
            >
              {isUnlocking ? (
                  <svg className="animate-spin-custom h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                canAfford ? 'Unlock' : 'No Coin'
              )}
            </button>
            <button 
                onClick={onCancel} 
                disabled={isUnlocking}
                className={`btn-game-gray py-3 rounded-xl font-bold text-sm ${isUnlocking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Cancel
            </button>
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
  const [topicData, setTopicData] = useState<TopicProgressData>({
    maxUnlockedPage: FREE_PAGES,
    currentPage: 1, 
    dailyReward: { date: '', count: 0 },
    favorites: [] 
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- STATE 2: View Mode (All vs Favorites) ---
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');

  // --- STATE 3: Trang hiện tại (UI State) ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE 4: Loading cho Favorite Button ---
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // --- EFFECT: Lắng nghe dữ liệu Topic ---
  useEffect(() => {
    if (user) {
      const unsubscribe = listenToTopicData(user.uid, (data) => {
        setTopicData(data);
        
        // CHỈ set trang lần đầu tiên khi dữ liệu load xong
        if (!isDataLoaded) {
            setCurrentPage(data.currentPage > 0 ? data.currentPage : 1);
            setIsDataLoaded(true);
        }
      });
      return () => unsubscribe();
    } else {
        setTopicData({ maxUnlockedPage: FREE_PAGES, currentPage: 1, dailyReward: { date: '', count: 0 }, favorites: [] });
        setIsDataLoaded(false);
    }
  }, [user, isDataLoaded]);

  const maxUnlockedPage = topicData.maxUnlockedPage;
  const favorites = topicData.favorites;

  // --- LOGIC LƯU TRANG HIỆN TẠI VÀO FIRESTORE (DEBOUNCE) ---
  useEffect(() => {
    // Chỉ lưu nếu đang ở chế độ 'all'
    if (isDataLoaded && user && viewMode === 'all') {
        const timeoutId = setTimeout(() => {
            saveTopicCurrentPage(user.uid, currentPage);
        }, 1000); 

        return () => clearTimeout(timeoutId);
    }
  }, [currentPage, viewMode, isDataLoaded, user]);

  // --- TÍNH TOÁN SỐ TRANG ---
  const totalPages = useMemo(() => {
    if (viewMode === 'all') {
        return Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE);
    } else {
        return Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));
    }
  }, [viewMode, favorites.length]);

  const [unlockModalData, setUnlockModalData] = useState<{ targetPage: number, cost: number } | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false); 

  // Reset Scroll
  useEffect(() => {
    const scrollContainer = document.getElementById('topic-scroll-container');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
        setIsAtBottom(false);
    }
  }, [currentPage, viewMode]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottomThreshold = 150; 
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
        setIsAtBottom(true);
    } else {
        setIsAtBottom(false);
    }
  };

  // --- TÍNH TOÁN ITEM HIỂN THỊ ---
  const currentItems = useMemo(() => {
    if (viewMode === 'all') {
        const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => start + i);
    } else {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return favorites.slice(start, end);
    }
  }, [currentPage, viewMode, favorites]);

  // --- HANDLE TOGGLE FAVORITE ---
  const handleToggleFavorite = useCallback(async (id: number) => {
      if (!user) return;
      setTogglingIds(prev => new Set(prev).add(id));
      try {
          await toggleTopicFavoriteTransaction(user.uid, id);
      } catch (error) {
          console.error("Error toggling favorite:", error);
          alert("Failed to update favorite");
      } finally {
          setTogglingIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
          });
      }
  }, [user]);

  // --- NAVIGATION ---
  const handleNavigation = (page: number, mode: 'all' | 'favorites' = viewMode) => {
    if (mode !== viewMode) {
        setViewMode(mode);
    }

    const targetTotalPages = mode === 'all' 
        ? Math.ceil(MAX_TOTAL_ITEMS / ITEMS_PER_PAGE)
        : Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));

    if (page > targetTotalPages || page < 1) return;
    
    if (mode === 'favorites') {
        setCurrentPage(page);
    } else {
        if (page <= maxUnlockedPage) {
            setCurrentPage(page);
        } else if (page === maxUnlockedPage + 1) {
            const cost = calculatePageCost(page);
            setUnlockModalData({ targetPage: page, cost });
        }
    }
  };

  const handleConfirmUnlock = () => {
    if (!unlockModalData || !user) return;
    const { cost, targetPage } = unlockModalData;

    setIsUnlocking(true); 

    unlockTopicPageTransaction(user.uid, targetPage, cost)
        .then(() => {
            setCurrentPage(targetPage);
            setUnlockModalData(null);
        })
        .catch(err => {
            console.error("Unlock failed", err);
            alert("Unlock failed: " + err.message);
        })
        .finally(() => {
            setIsUnlocking(false); 
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
          isUnlocking={isUnlocking}
          onConfirm={handleConfirmUnlock}
          onCancel={() => !isUnlocking && setUnlockModalData(null)}
        />
      )}

      {/* Map Modal with Local Tabs Logic */}
      <LevelMapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        currentParentPage={currentPage}
        currentParentViewMode={viewMode}
        maxUnlockedPage={maxUnlockedPage}
        favoritesCount={favorites.length}
        onConfirmSelection={handleNavigation}
      />

      <StudyTimer 
         currentPage={currentPage}
         masteryCount={masteryCount}
         dailyCountFromServer={topicData.dailyReward.count}
         lastDateFromServer={topicData.dailyReward.date}
         onReward={handleReward}
         forceHide={isAtBottom || viewMode === 'favorites'} 
      />
      
      {/* Header */}
      <header className="flex-shrink-0 sticky top-0 backdrop-blur-sm z-30 shadow-md border-b transition-colors duration-300 bg-slate-900/95 border-slate-700">
        <div className="flex h-14 items-center justify-between px-4 w-full">
            <div className="flex justify-start">
               <HomeButton onClick={onGoBack} label="Back" />
            </div>
            
            <div className="hidden md:flex flex-col items-center">
                <span className={`text-xs font-bold uppercase tracking-widest ${
                    viewMode === 'favorites' ? 'text-red-400' : 'text-slate-400'
                }`}>
                    {viewMode === 'favorites' ? '❤️ Favorites Collection' : 'Topic Browser'}
                </span>
                <span className="text-white font-bold text-sm">Page {currentPage} <span className="opacity-60">/ {totalPages}</span></span>
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

          {/* Empty State for Favorites */}
          {viewMode === 'favorites' && favorites.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-popup-zoom">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-600">No Favorites Yet</h2>
                <p className="text-sm">Click the heart icon on any topic to save it here.</p>
                <button 
                    onClick={() => setViewMode('all')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors"
                >
                    Browse All Topics
                </button>
             </div>
          ) : (
            <div className="flex flex-col gap-6">
                {currentItems.map((itemIndex) => (
                <TopicImageCard 
                    key={itemIndex} 
                    index={itemIndex} 
                    isFavorite={favorites.includes(itemIndex)}
                    onToggleFavorite={handleToggleFavorite}
                    isTogglingFavorite={togglingIds.has(itemIndex)}
                />
                ))}
            </div>
          )}

          {/* Controls Navigation */}
          {(viewMode === 'all' || favorites.length > 0) && (
            <div className="flex justify-center items-center gap-3 py-2 mt-2 w-full">
                <div className="bg-white p-1.5 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 transform transition-transform hover:scale-105">
                    
                    <button
                    onClick={() => handleNavigation(currentPage - 1)}
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

                    {/* <<< THAY ĐỔI: Sử dụng justify-center để căn giữa Page X/Y >>> */}
                    <button
                        onClick={() => setIsMapOpen(true)}
                        className="relative group font-bold py-2 px-4 rounded-full shadow-sm min-w-[140px] text-center text-sm btn-select-3d backdrop-blur-sm flex items-center justify-center gap-2 text-white bg-slate-800/70 hover:bg-slate-800"
                    >
                        <span>
                            Page {currentPage} / {totalPages}
                        </span>
                        {viewMode === 'all' && currentPage > maxUnlockedPage ? (
                            <span className="text-sm">🔒</span>
                        ) : (
                             <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        )}
                    </button>

                    <button
                    onClick={() => handleNavigation(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-full btn-nav ${
                        currentPage === totalPages
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-500 hover:text-white'
                    }`}
                    >
                        {viewMode === 'all' && currentPage + 1 > maxUnlockedPage ? (
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
          )}

        </div>
      </div>
    </div>
  );
}
