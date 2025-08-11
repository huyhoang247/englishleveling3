import React, { useState, useCallback, useEffect, useMemo } from 'react';
import CoinDisplay from './coin-display.tsx';
// TÁI CẤU TRÚC: Import các hàm và đối tượng cần thiết từ Firebase và service
import { db } from './firebase.js';
import { doc, runTransaction } from 'firebase/firestore';
import { fetchOrCreateUserGameData } from './gameDataService.ts';

// --- Định nghĩa Type cho dữ liệu ---
export type VocabularyItem = {
  id: number;
  word: string;
  exp: number;
  level: number;
  maxExp: number;
};

// --- Dữ liệu mẫu ---
export const initialVocabularyData: VocabularyItem[] = [
  { id: 1, word: 'Ephemeral', exp: 75, level: 3, maxExp: 100 },
  { id: 2, word: 'Serendipity', exp: 100, level: 5, maxExp: 100 },
  { id: 3, word: 'Luminous', exp: 30, level: 2, maxExp: 100 },
  { id: 4, word: 'Ubiquitous', exp: 95, level: 8, maxExp: 100 },
  { id: 5, word: 'Mellifluous', exp: 100, level: 1, maxExp: 100 },
  { id: 6, word: 'Petrichor', exp: 15, level: 4, maxExp: 100 },
  { id: 7, word: 'Ineffable', exp: 60, level: 7, maxExp: 100 },
  ...Array.from({ length: 40 }, (_, i) => ({ id: i + 8, word: `Word ${i + 1}`, exp: Math.floor(Math.random() * 200), level: Math.floor(Math.random() * 5) + 1, maxExp: (Math.floor(Math.random() * 5) + 1) * 100 })),
];

// --- Cập nhật Signature của Props ---
interface AchievementsScreenProps {
  onClose: () => void;
  userId: string;
  initialData: VocabularyItem[];
  onDataUpdated: (updates: { coins: number; masteryCards: number; vocabulary: VocabularyItem[] }) => void;
  masteryCardsCount: number;
}

// --- Các component icon (Không thay đổi) ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const XIcon = ({ className = '', ...props }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}> <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" /> </svg> );
const TrophyIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}> <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /> </svg> );
const MasteryCardIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png" alt="Thẻ thông thạo" className={className} {...props} /> );
const GoldIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Vàng" className={className} {...props} /> );
const BookOpenIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A9.735 9.735 0 006 21a9.707 9.707 0 005.25-1.533" /> <path d="M12.75 4.533A9.707 9.707 0 0118 3a9.735 9.735 0 013.25.555.75.75 0 01.5.707v14.25a.75.75 0 01-1 .707A9.735 9.735 0 0118 21a9.707 9.707 0 01-5.25-1.533" /> </svg> );
const GiftIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}> <polyline points="20 12 20 22 4 22 4 12" /> <rect x="2" y="7" width="20" height="5" /> <line x1="12" y1="22" x2="12" y2="7" /> <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /> <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /> </svg> );
const ChevronLeftIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg> );
const ChevronRightIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /> </svg> );

// --- Thành phần chính của ứng dụng ---
export default function AchievementsScreen({ onClose, userId, initialData, onDataUpdated, masteryCardsCount }: AchievementsScreenProps) {
  const [vocabulary, setVocabulary] = useState(initialData);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // TÁI CẤU TRÚC: Quản lý coin state cục bộ trong component này
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);

  // TÁI CẤU TRÚC: Lấy dữ liệu coin ban đầu khi component được mount
  useEffect(() => {
    if (!userId) return;
    const fetchInitialCoins = async () => {
      try {
        const gameData = await fetchOrCreateUserGameData(userId);
        setCoins(gameData.coins);
        setDisplayedCoins(gameData.coins);
      } catch (error) {
        console.error("Failed to fetch initial coins for Achievements screen:", error);
      }
    };
    fetchInitialCoins();
  }, [userId]);

  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) return;
    const isCountingUp = endValue > startValue;
    const step = Math.ceil(Math.abs(endValue - startValue) / 30) || 1;
    let current = startValue;
    const interval = setInterval(() => {
      if (isCountingUp) { current += step; } else { current -= step; }
      if ((isCountingUp && current >= endValue) || (!isCountingUp && current <= endValue)) {
        setDisplayedCoins(endValue);
        clearInterval(interval);
      } else {
        setDisplayedCoins(current);
      }
    }, 30);
  }, []);

  useEffect(() => {
      setVocabulary(initialData);
  }, [initialData]);

  const sortedVocabulary = useMemo(() => [...vocabulary].sort((a, b) => {
    const aIsClaimable = a.exp >= a.maxExp;
    const bIsClaimable = b.exp >= b.maxExp;
    if (aIsClaimable !== bIsClaimable) return bIsClaimable ? 1 : -1;
    if (b.level !== a.level) return b.level - a.level;
    return b.exp - a.exp;
  }), [vocabulary]);

  const totalPages = Math.ceil(sortedVocabulary.length / ITEMS_PER_PAGE);
  
  const paginatedVocabulary = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return sortedVocabulary.slice(startIndex, endIndex);
  }, [sortedVocabulary, currentPage]);

  useEffect(() => {
    if(currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0 && sortedVocabulary.length > 0) setCurrentPage(1);
  }, [currentPage, totalPages, sortedVocabulary.length]);

  const handleClaim = useCallback(async (id: number) => {
    if (isClaiming || isClaimingAll || !userId) return;

    const originalItem = vocabulary.find(item => item.id === id);
    if (!originalItem || originalItem.exp < originalItem.maxExp) return;

    setIsClaiming(true);
    setClaimingId(id);

    const goldReward = originalItem.level * 100;
    const masteryCardReward = 1;
    const initialCoinCount = displayedCoins;

    startCoinCountAnimation(initialCoinCount, initialCoinCount + goldReward);

    const updatedList = vocabulary.map(item => {
      if (item.id === id) {
        const expRemaining = item.exp - item.maxExp;
        const newLevel = item.level + 1;
        const newMaxExp = newLevel * 100;
        return { ...item, level: newLevel, exp: expRemaining, maxExp: newMaxExp };
      }
      return item;
    });

    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 500));

    try {
      const userDocRef = doc(db, 'users', userId);
      const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');
      
      let newTotalCoins: number | undefined;
      let newTotalMasteryCards: number | undefined;

      await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userDocRef);
          if (!userDoc.exists()) throw new Error("User document does not exist!");
          
          const currentCoins = userDoc.data().coins || 0;
          const currentCards = userDoc.data().masteryCards || 0;

          newTotalCoins = currentCoins + goldReward;
          newTotalMasteryCards = currentCards + masteryCardReward;

          transaction.update(userDocRef, { coins: newTotalCoins, masteryCards: newTotalMasteryCards });
          transaction.set(achievementDocRef, { vocabulary: updatedList }, { merge: true });
      });

      await minDelayPromise;

      if (newTotalCoins === undefined || newTotalMasteryCards === undefined) {
          throw new Error("Transaction completed but new values are missing.");
      }
      
      setVocabulary(updatedList);
      setCoins(newTotalCoins);
      onDataUpdated({ coins: newTotalCoins, masteryCards: newTotalMasteryCards, vocabulary: updatedList });

    } catch (error) {
      console.error("Claiming failed, reverting UI:", error);
      startCoinCountAnimation(displayedCoins, initialCoinCount);
    } finally {
      setIsClaiming(false);
      setClaimingId(null);
    }
  }, [vocabulary, userId, isClaiming, isClaimingAll, displayedCoins, startCoinCountAnimation, onDataUpdated]);

  const handleClaimAll = useCallback(async () => {
    if (isClaiming || isClaimingAll || !userId) return;

    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    if (claimableItems.length === 0) return;
    
    setIsClaimingAll(true);

    let totalGoldReward = 0;
    let totalMasteryCardReward = 0;
    const claimableIds = new Set(claimableItems.map(item => item.id));
    const initialCoinCount = displayedCoins;

    const updatedList = vocabulary.map(item => {
      if (claimableIds.has(item.id)) {
        totalGoldReward += item.level * 100;
        totalMasteryCardReward += 1;
        const expRemaining = item.exp - item.maxExp;
        const newLevel = item.level + 1;
        const newMaxExp = newLevel * 100;
        return { ...item, level: newLevel, exp: expRemaining, maxExp: newMaxExp };
      }
      return item;
    });
    
    startCoinCountAnimation(initialCoinCount, initialCoinCount + totalGoldReward);
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 500));
    
    try {
        const userDocRef = doc(db, 'users', userId);
        const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');

        let newTotalCoins: number | undefined;
        let newTotalMasteryCards: number | undefined;

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) throw new Error("User document does not exist!");

            const currentCoins = userDoc.data().coins || 0;
            const currentCards = userDoc.data().masteryCards || 0;

            newTotalCoins = currentCoins + totalGoldReward;
            newTotalMasteryCards = currentCards + totalMasteryCardReward;

            transaction.update(userDocRef, { coins: newTotalCoins, masteryCards: newTotalMasteryCards });
            transaction.set(achievementDocRef, { vocabulary: updatedList }, { merge: true });
        });

        await minDelayPromise;

        if (newTotalCoins === undefined || newTotalMasteryCards === undefined) {
            throw new Error("Transaction completed but new values are missing.");
        }

        setVocabulary(updatedList);
        setCoins(newTotalCoins);
        onDataUpdated({ coins: newTotalCoins, masteryCards: newTotalMasteryCards, vocabulary: updatedList });

    } catch (error) {
       console.error("Claiming all failed, reverting UI:", error);
       startCoinCountAnimation(displayedCoins, initialCoinCount);
    } finally {
      setIsClaimingAll(false);
    }
  }, [vocabulary, userId, isClaiming, isClaimingAll, displayedCoins, startCoinCountAnimation, onDataUpdated]);
  
  const totalWords = vocabulary.length;
  
  const totalClaimableRewards = useMemo(() => {
    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    const gold = claimableItems.reduce((sum, item) => sum + (item.level * 100), 0);
    const masteryCards = claimableItems.length;
    return { gold, masteryCards };
  }, [vocabulary]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white font-sans flex flex-col items-center">
      <header className="w-full max-w-5xl flex items-center justify-between py-2.5 px-4 sticky top-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
          aria-label="Quay lại Trang Chính"
          title="Quay lại Trang Chính"
        >
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
        </button>
        <div className="flex items-center gap-2">
          <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 pt-6 overflow-y-auto">
        <section className="mb-6 flex flex-row justify-center items-center gap-4">
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <BookOpenIcon className="w-7 h-7 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-white">{totalWords}</p>
              <p className="text-sm text-slate-400">Vocabulary</p>
            </div>
          </div>
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <MasteryCardIcon className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-white">{masteryCardsCount}</p>
              <p className="text-sm text-slate-400">Mastery</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex justify-center">
            <button
                onClick={handleClaimAll}
                disabled={totalClaimableRewards.masteryCards === 0 || isClaimingAll || isClaiming}
                className={`
                    w-full max-w-md rounded-xl transition-all duration-300
                    ${totalClaimableRewards.masteryCards > 0 && !isClaimingAll && !isClaiming
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border border-purple-500/60 shadow-lg shadow-purple-600/30 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/40 cursor-pointer'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-500 cursor-not-allowed'
                    }
                `}
            >
                <div className="flex items-center justify-between w-full p-3">
                    <div className="flex items-center gap-3">
                        <GiftIcon className={`w-8 h-8 transition-colors duration-300 ${totalClaimableRewards.masteryCards > 0 && !isClaimingAll && !isClaiming ? 'text-purple-300' : 'text-slate-600'}`} />
                        <span className="font-bold text-lg">
                            {isClaimingAll ? 'Đang xử lý...' : 'Nhận Tất Cả'}
                        </span>
                    </div>

                    {totalClaimableRewards.masteryCards > 0 && !isClaimingAll ? (
                        <div className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-1.5 shadow-inner">
                            <div className="flex items-center gap-1.5" title={`${totalClaimableRewards.masteryCards} Thẻ Thông Thạo`}>
                                <MasteryCardIcon className="w-7 h-7" />
                                <span className="text-base font-semibold">x{totalClaimableRewards.masteryCards}</span>
                            </div>
                            <div className="h-6 w-px bg-white/20"></div>
                            <div className="flex items-center gap-1.5" title={`${totalClaimableRewards.gold} Vàng`}>
                                <GoldIcon className="w-6 h-6" />
                                <span className="text-base font-semibold">{totalClaimableRewards.gold}</span>
                            </div>
                        </div>
                    ) : (
                        !isClaimingAll && (
                          <span className="text-sm font-medium text-slate-500 pr-2">Chưa có thưởng</span>
                        )
                    )}
                </div>
            </button>
        </div>

        <main className="bg-slate-900/40 p-2 sm:p-3 rounded-2xl shadow-2xl shadow-cyan-500/20 border border-slate-700">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-slate-400 hidden md:grid">
            <div className="col-span-1 text-center">HẠNG</div>
            <div className="col-span-3">TỪ VỰNG</div>
            <div className="col-span-3">TIẾN TRÌNH</div>
            <div className="col-span-3 text-center">THƯỞNG CẤP</div>
            <div className="col-span-2 text-center">HÀNH ĐỘNG</div>
          </div>

          <div className="flex flex-col gap-2">
            {paginatedVocabulary.map((item, index) => (
              <VocabularyRow
                key={`${item.id}-${item.level}`}
                item={item}
                rank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                onClaim={handleClaim}
                isBeingClaimed={claimingId === item.id}
                isAnyClaiming={isClaiming}
                isClaimingAll={isClaimingAll}
              />
            ))}
            {paginatedVocabulary.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <p>Không có từ vựng nào để hiển thị.</p>
                </div>
            )}
          </div>
        </main>
        
        <div className="mt-6 mb-4">
             <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
             />
        </div>
        
      </div>
    </div>
  );
}

// --- Component con ---
function VocabularyRow({ item, rank, onClaim, isBeingClaimed, isAnyClaiming, isClaimingAll }: { item: VocabularyItem, rank: number, onClaim: (id: number) => void, isBeingClaimed: boolean, isAnyClaiming: boolean, isClaimingAll: boolean }) {
  const { id, word, exp, level, maxExp } = item;
  const progressPercentage = maxExp > 0 ? Math.min((exp / maxExp) * 100, 100) : 0;
  const isClaimable = exp >= maxExp;
  const goldReward = 100 * level;

  const handleClaimClick = () => {
    if (!isClaimable || isAnyClaiming || isClaimingAll) return;
    onClaim(id);
  };
  
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-3 items-center p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 hover:bg-slate-700/60 hover:border-cyan-500/50 transition-all duration-300">
      <div className="col-span-2 md:col-span-1 text-center flex items-center justify-center"> <span className="text-xl font-bold text-slate-500">{rank}</span> </div>
      <div className="col-span-10 md:col-span-3">
        {/* [ĐÃ CẬP NHẬT] Tự động viết hoa chữ cái đầu */}
        <p className="font-bold text-lg text-white">{word.charAt(0).toUpperCase() + word.slice(1)}</p>
        <span className="md:hidden text-xs text-slate-400">{`Cấp ${level}`}</span>
        <span className="hidden md:block text-xs text-slate-400">{`Cấp ${level}`}</span>
      </div>
      <div className="col-span-12 md:col-span-3 md:px-2"> <div className="w-full bg-slate-700 rounded-full h-3"> <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div> </div> <p className="text-xs text-slate-400 mt-1.5 text-right font-mono">{exp} / {maxExp} EXP</p> </div>
      <div className="col-span-6 md:col-span-3 flex items-center justify-center"> <div className="flex w-full max-w-[180px] items-center justify-center gap-4 rounded-xl bg-black/20 p-2 shadow-inner border border-slate-700"> <div className="flex items-center gap-1.5" title="1 Mastery"> <MasteryCardIcon className="w-6 h-6 flex-shrink-0" /> <span className="text-sm font-semibold text-slate-200">x1</span> </div> <div className="h-6 w-px bg-slate-600"></div> <div className="flex items-center gap-1.5" title={`${goldReward} Vàng`}> <GoldIcon className="w-5 h-5 flex-shrink-0" /> <span className="text-sm font-semibold text-slate-200">{goldReward}</span> </div> </div> </div>
      <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center"> <button onClick={handleClaimClick} disabled={!isClaimable || isAnyClaiming || isClaimingAll} className={` flex items-center justify-center gap-2 w-auto px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border ${isClaimable && !isAnyClaiming && !isClaimingAll ? 'bg-gradient-to-r from-emerald-400 to-teal-400 border-emerald-500/50 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20 transform hover:scale-105 cursor-pointer' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-70' } `}> <TrophyIcon className="w-4 h-4" /> {isBeingClaimed ? 'Đang nhận...' : isClaimable ? 'Nhận' : 'Chưa Đạt'} </button> </div>
    </div>
  );
}

// --- Component Phân Trang - Ưu tiên Trải nghiệm người dùng ---
const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) => {
    // Sử dụng useMemo để tính toán danh sách trang chỉ khi các dependency thay đổi
    const paginationRange = useMemo(() => {
        const siblingCount = 1; // Số lượng trang liền kề hiển thị ở mỗi bên của trang hiện tại
        const totalPageNumbers = siblingCount + 5; // Số mục tối đa hiển thị (ví dụ: 1 ... 4 5 6 ... 10)

        // Case 1: Nếu tổng số trang ít hơn số trang ta muốn hiển thị, trả về tất cả các trang
        if (totalPageNumbers >= totalPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const range = (start: number, end: number) => {
            let length = end - start + 1;
            return Array.from({ length }, (_, idx) => idx + start);
        };

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        // Quyết định khi nào hiển thị dấu "..."
        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        // Case 2: Chỉ hiển thị dấu "..." bên phải
        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, '...', totalPages];
        }

        // Case 3: Chỉ hiển thị dấu "..." bên trái
        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [firstPageIndex, '...', ...rightRange];
        }
        
        // Case 4: Hiển thị dấu "..." ở cả hai bên
        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
        }

        // Fallback (thường không xảy ra với logic trên nhưng để an toàn)
        return Array.from({ length: totalPages }, (_, i) => i + 1);

    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-1 sm:gap-2" aria-label="Pagination">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                aria-label="Previous Page"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {paginationRange.map((page, index) => 
                typeof page === 'number' ? ( 
                    <button 
                        key={index} 
                        onClick={() => onPageChange(page)} 
                        className={`w-9 h-9 sm:w-10 sm:h-10 text-sm font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center ${
                            currentPage === page 
                            ? 'bg-cyan-500 text-white border-cyan-400' 
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`} 
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button> 
                ) : ( 
                    <span key={index} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm text-slate-500" aria-hidden="true">
                        {page}
                    </span> 
                )
            )}

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                aria-label="Next Page"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </nav>
    );
};
