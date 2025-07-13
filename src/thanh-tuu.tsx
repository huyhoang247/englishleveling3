// src/thanh-tuu.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// --- Định nghĩa Type cho dữ liệu (Không thay đổi) ---
export type VocabularyItem = {
  id: number;
  word: string;
  exp: number;
  level: number;
  maxExp: number;
};

// --- Dữ liệu mẫu (Export để component cha có thể sử dụng cho người dùng mới) ---
export const initialVocabularyData: VocabularyItem[] = [
  { id: 1, word: 'Ephemeral', exp: 75, level: 3, maxExp: 100 },
  { id: 2, word: 'Serendipity', exp: 100, level: 5, maxExp: 100 },
  { id: 3, word: 'Luminous', exp: 30, level: 2, maxExp: 100 },
  { id: 4, word: 'Ubiquitous', exp: 95, level: 8, maxExp: 100 },
  { id: 5, word: 'Mellifluous', exp: 100, level: 1, maxExp: 100 },
  { id: 6, word: 'Petrichor', exp: 15, level: 4, maxExp: 100 },
  { id: 7, word: 'Ineffable', exp: 60, level: 7, maxExp: 100 },
];

// --- CẬP NHẬT Prop để nhận dữ liệu từ cha và gửi tín hiệu nhận thưởng ---
interface AchievementsScreenProps {
  onClose: () => void;
  userId: string;
  initialData: VocabularyItem[];
  onClaimReward: (reward: { gold: number; masteryCards: number }) => void;
  onDataUpdate: (updatedData: VocabularyItem[]) => void;
  masteryCardsCount: number;
}

// --- Biểu tượng (Icon) ---
const XIcon = ({ className = '', ...props }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
const TrophyIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const MasteryCardIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => (
    <img
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png"
        alt="Thẻ thông thạo"
        className={className}
        {...props}
    />
);
const GoldIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => (
    <img
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
        alt="Vàng"
        className={className}
        {...props}
    />
);
const BookOpenIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A9.735 9.735 0 006 21a9.707 9.707 0 005.25-1.533" />
        <path d="M12.75 4.533A9.707 9.707 0 0118 3a9.735 9.735 0 013.25.555.75.75 0 01.5.707v14.25a.75.75 0 01-1 .707A9.735 9.735 0 0118 21a9.707 9.707 0 01-5.25-1.533" />
    </svg>
);
const GiftIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);


// --- Thành phần chính của ứng dụng ---
export default function AchievementsScreen({ onClose, userId, initialData, onClaimReward, onDataUpdate, masteryCardsCount }: AchievementsScreenProps) {
  const [vocabulary, setVocabulary] = useState(initialData);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  const db = getFirestore();

  useEffect(() => {
      setVocabulary(initialData);
  }, [initialData]);

  const sortedVocabulary = [...vocabulary].sort((a, b) => {
    const aIsClaimable = a.exp >= a.maxExp;
    const bIsClaimable = b.exp >= b.maxExp;
    if (aIsClaimable !== bIsClaimable) {
      return (bIsClaimable ? 1 : 0) - (aIsClaimable ? 1 : 0);
    }
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return b.exp - a.exp;
  });

  const handleClaim = useCallback(async (id: number) => {
    if (isClaiming || isClaimingAll) return;

    const originalItem = vocabulary.find(item => item.id === id);
    if (!originalItem || originalItem.exp < originalItem.maxExp) return;

    setIsClaiming(true);
    setClaimingId(id);

    const goldReward = originalItem.level * 100;
    const masteryCardReward = 1;

    const updatedList = vocabulary.map(item => {
      if (item.id === id) {
        const expRemaining = item.exp - item.maxExp;
        const newLevel = item.level + 1;
        const newMaxExp = newLevel * 100;
        return { ...item, level: newLevel, exp: expRemaining, maxExp: newMaxExp };
      }
      return item;
    });

    onDataUpdate(updatedList);
    onClaimReward({ gold: goldReward, masteryCards: masteryCardReward });

    try {
      const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');
      await setDoc(achievementDocRef, { vocabulary: updatedList }, { merge: true });
      console.log("Vocabulary mastery progress saved to Firestore.");
    } catch (error) {
      console.error("Error saving vocabulary progress:", error);
      onDataUpdate(vocabulary);
    } finally {
      setTimeout(() => {
        setIsClaiming(false);
        setClaimingId(null);
      }, 500);
    }
  }, [vocabulary, userId, db, onClaimReward, onDataUpdate, isClaiming, isClaimingAll]);

  const handleClaimAll = useCallback(async () => {
    if (isClaiming || isClaimingAll) return;

    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    if (claimableItems.length === 0) return;
    
    setIsClaimingAll(true);

    let totalGoldReward = 0;
    let totalMasteryCardReward = 0;
    const claimableIds = new Set(claimableItems.map(item => item.id));

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

    onClaimReward({ gold: totalGoldReward, masteryCards: totalMasteryCardReward });
    onDataUpdate(updatedList);

    try {
      const achievementDocRef = doc(db, 'users', userId, 'gamedata', 'achievements');
      await setDoc(achievementDocRef, { vocabulary: updatedList }, { merge: true });
      console.log("Batch vocabulary mastery progress saved to Firestore.");
    } catch (error) {
      console.error("Error saving batch vocabulary progress:", error);
      onDataUpdate(vocabulary); // Rollback
    } finally {
      setIsClaimingAll(false);
    }
  }, [vocabulary, userId, db, onClaimReward, onDataUpdate, isClaiming, isClaimingAll]);
  
  const totalWords = vocabulary.length;
  
  const totalClaimableRewards = useMemo(() => {
    const claimableItems = vocabulary.filter(item => item.exp >= item.maxExp);
    const gold = claimableItems.reduce((sum, item) => sum + (item.level * 100), 0);
    const masteryCards = claimableItems.length;
    return { gold, masteryCards };
  }, [vocabulary]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white font-sans p-4 sm:p-8 flex justify-center overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto relative">
        <button
          onClick={onClose}
          className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 z-10 w-10 h-10 rounded-full bg-slate-700/80 hover:bg-slate-600 border border-slate-500 flex items-center justify-center transition-all"
          aria-label="Đóng"
        >
          <XIcon className="w-6 h-6 text-slate-300" />
        </button>

        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 pb-2">
            Thành Tựu
          </h1>
        </header>

        {/* <<< CẬP NHẬT: Thay đổi flex-col sm:flex-row thành flex flex-row để luôn nằm trên 1 hàng >>> */}
        <section className="mb-6 flex flex-row justify-center items-center gap-4">
          {/* <<< CẬP NHẬT: Thay w-full thành flex-1 sm:w-52 để co giãn hợp lý >>> */}
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <BookOpenIcon className="w-7 h-7 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-white">{totalWords}</p>
              <p className="text-sm text-slate-400">Vocabulary</p>
            </div>
          </div>
          {/* <<< CẬP NHẬT: Thay w-full thành flex-1 sm:w-52 để co giãn hợp lý >>> */}
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
                    flex items-center justify-between w-full max-w-md px-4 py-3 rounded-xl transition-all duration-300 border-2
                    ${totalClaimableRewards.masteryCards > 0 && !isClaimingAll && !isClaiming
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/20 transform hover:scale-105 cursor-pointer'
                        : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <GiftIcon className={`w-7 h-7 ${totalClaimableRewards.masteryCards > 0 ? 'text-white' : 'text-slate-500'}`} />
                    <span className="font-bold text-lg">
                        {isClaimingAll ? 'Đang xử lý...' : `Nhận Tất Cả`}
                    </span>
                </div>

                {totalClaimableRewards.masteryCards > 0 && !isClaimingAll && (
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="flex items-center gap-1.5" title={`${totalClaimableRewards.masteryCards} Mastery`}>
                            <MasteryCardIcon className="w-7 h-7" />
                            <span className="text-base font-semibold">x{totalClaimableRewards.masteryCards}</span>
                        </div>
                         <div className="flex items-center gap-1.5" title={`${totalClaimableRewards.gold} Vàng`}>
                            <GoldIcon className="w-6 h-6" />
                            <span className="text-base font-semibold">{totalClaimableRewards.gold}</span>
                        </div>
                    </div>
                )}
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
            {sortedVocabulary.map((item, index) => (
              <VocabularyRow
                key={`${item.id}-${item.level}`}
                item={item}
                rank={index + 1}
                onClaim={handleClaim}
                isBeingClaimed={claimingId === item.id}
                isAnyClaiming={isClaiming}
                isClaimingAll={isClaimingAll}
              />
            ))}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Thiết kế bởi Gemini. Chúc bạn học tốt!</p>
        </footer>
      </div>
    </div>
  );
}

// --- Thành phần cho mỗi hàng (card) trong bảng ---
function VocabularyRow({
  item,
  rank,
  onClaim,
  isBeingClaimed,
  isAnyClaiming,
  isClaimingAll
}: { item: VocabularyItem, rank: number, onClaim: (id: number) => void, isBeingClaimed: boolean, isAnyClaiming: boolean, isClaimingAll: boolean }) {
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
      
      <div className="col-span-2 md:col-span-1 text-center flex items-center justify-center">
        <span className="text-xl font-bold text-slate-500">{rank}</span>
      </div>

      <div className="col-span-10 md:col-span-3">
        <p className="font-bold text-lg text-white">{word}</p>
        <span className="md:hidden text-xs text-slate-400">{`Cấp ${level}`}</span>
        <span className="hidden md:block text-xs text-slate-400">{`Cấp ${level}`}</span>
      </div>

      <div className="col-span-12 md:col-span-3 md:px-2">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right font-mono">{exp} / {maxExp} EXP</p>
      </div>

      <div className="col-span-6 md:col-span-3 flex items-center justify-center">
        <div className="flex w-full max-w-[180px] items-center justify-center gap-4 rounded-xl bg-black/20 p-2 shadow-inner border border-slate-700">
            <div className="flex items-center gap-1.5" title="1 Mastery">
                <MasteryCardIcon className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">x1</span>
            </div>
            
            <div className="h-6 w-px bg-slate-600"></div>

            <div className="flex items-center gap-1.5" title={`${goldReward} Vàng`}>
                <GoldIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">{goldReward}</span>
            </div>
        </div>
      </div>

      <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center">
        <button
          onClick={handleClaimClick}
          disabled={!isClaimable || isAnyClaiming || isClaimingAll}
          className={`
            flex items-center justify-center gap-2 w-auto px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border
            ${isClaimable && !isAnyClaiming && !isClaimingAll
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 border-emerald-500/50 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20 transform hover:scale-105 cursor-pointer'
              : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-70'
            }
          `}
        >
          <TrophyIcon className="w-4 h-4" />
          {isBeingClaimed ? 'Đang nhận...' : isClaimable ? 'Nhận' : 'Chưa Đạt'}
        </button>
      </div>
    </div>
  );
}
