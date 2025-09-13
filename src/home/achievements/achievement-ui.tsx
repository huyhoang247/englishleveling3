import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { AchievementsProvider, useAchievements } from './achievement-context.tsx';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import type { VocabularyItem } from '../../gameDataService.ts';
import AchievementsLoadingSkeleton from './achievement-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import HomeButton from '../../ui/home-button.tsx';

// --- Các component icon (Đã xóa HomeIcon thừa) ---
const XIcon = ({ className = '', ...props }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}> <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" /> </svg> );
const TrophyIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}> <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /> </svg> );
const MasteryCardIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png" alt="Thẻ thông thạo" className={className} {...props} /> );
const GoldIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Vàng" className={className} {...props} /> );
const VocabularyIcon = ({ className = '', ...props }: { className?: string; [key: string]: any }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/voca-achievement.webp" alt="Vocabulary" className={className} {...props} /> );
const ChevronLeftIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg> );
const ChevronRightIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /> </svg> );

// --- Component UI chính, nhưng không được export default nữa ---
function AchievementsScreenUI({ onClose }: { onClose: () => void }) {
  const {
    vocabulary,
    coins,
    masteryCards,
    isInitialLoading,
    isUpdating,
    claimAchievement,
    claimAllAchievements,
    totalClaimableRewards,
  } = useAchievements();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const displayedCoins = useAnimateValue(coins, 500);

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

  if (isInitialLoading) {
    return <AchievementsLoadingSkeleton />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white font-sans flex flex-col items-center">
       <header className="w-full max-w-5xl flex items-center justify-between py-2.5 px-4 sticky top-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <HomeButton onClick={onClose} />
        <div className="flex items-center gap-2">
          <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 pt-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
        <section className="mb-6 flex flex-row justify-center items-center gap-4">
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <VocabularyIcon className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-white">{vocabulary.length}</p>
              <p className="text-sm text-slate-400">Vocabulary</p>
            </div>
          </div>
          <div className="flex flex-1 sm:flex-none sm:w-52 items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <MasteryCardIcon className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-white">{masteryCards}</p>
              <p className="text-sm text-slate-400">Mastery</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex justify-center">
            <button
                onClick={claimAllAchievements}
                disabled={totalClaimableRewards.masteryCards === 0 || isUpdating}
                className={`
                    w-full max-w-md rounded-xl transition-all duration-300
                    ${totalClaimableRewards.masteryCards > 0 && !isUpdating
                        ? 'text-white border border-indigo-700/50 bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 bg-[length:200%_auto] animate-[background-pan_4s_ease-in-out_infinite] shadow-lg shadow-indigo-500/20 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30 hover:border-indigo-600 cursor-pointer'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-500 cursor-not-allowed'
                    }
                `}
            >
                <div className="flex items-center justify-between w-full p-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={totalClaimableRewards.masteryCards > 0 && !isUpdating
                                ? 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/gift-box.webp'
                                : 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/gift-box-grey.webp'}
                            alt="Claim all rewards"
                            className="w-8 h-8" />
                        <span className="font-bold text-lg">
                            {isUpdating ? 'Claiming...' : 'Claim All'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-1.5 shadow-inner">
                        {totalClaimableRewards.masteryCards > 0 && !isUpdating ? (
                            <>
                                <div className="flex items-center gap-1.5" title={`${totalClaimableRewards.masteryCards} Thẻ Thông Thạo`}>
                                    <MasteryCardIcon className="w-7 h-7" />
                                    <span className="text-base font-semibold">{totalClaimableRewards.masteryCards}</span>
                                </div>
                                <div className="h-6 w-px bg-white/20"></div>
                                <div className="flex items-center gap-1.5" title={`${totalClaimableRewards.gold} Vàng`}>
                                    <GoldIcon className="w-6 h-6" />
                                    <span className="text-base font-semibold">{totalClaimableRewards.gold}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5 opacity-40" title="Thẻ Thông Thạo">
                                    <MasteryCardIcon className="w-7 h-7" />
                                    <span className="text-base font-semibold">0</span>
                                </div>
                                <div className="h-6 w-px bg-slate-600"></div>
                                <div className="flex items-center gap-1.5 opacity-40" title="Vàng">
                                    <GoldIcon className="w-6 h-6" />
                                    <span className="text-base font-semibold">0</span>
                                </div>
                            </>
                        )}
                    </div>
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
                onClaim={claimAchievement}
                isAnyClaiming={isUpdating}
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

const VocabularyRow = React.memo(function VocabularyRow({ item, rank, onClaim, isAnyClaiming }: { item: VocabularyItem, rank: number, onClaim: (id: number) => void, isAnyClaiming: boolean }) {
  const { id, word, exp, level, maxExp } = item;
  const progressPercentage = maxExp > 0 ? Math.min((exp / maxExp) * 100, 100) : 0;
  const isClaimable = exp >= maxExp;
  const goldReward = 100 * level;
  const handleClaimClick = useCallback(() => {
    if (!isClaimable || isAnyClaiming) return;
    onClaim(id);
  }, [id, isClaimable, isAnyClaiming, onClaim]);
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-3 items-center p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 hover:bg-slate-700/60 hover:border-cyan-500/50 transition-all duration-300">
      <div className="col-span-2 md:col-span-1 text-center flex items-center justify-center"> <span className="text-xl font-bold text-slate-500">{rank}</span> </div>
      <div className="col-span-10 md:col-span-3">
        <p className="font-bold text-lg text-white">{word.charAt(0).toUpperCase() + word.slice(1)}</p>
        <span className="md:hidden text-xs text-slate-400">{`Level ${level}`}</span>
        <span className="hidden md:block text-xs text-slate-400">{`Level ${level}`}</span>
      </div>
      <div className="col-span-12 md:col-span-3 md:px-2"> <div className="w-full bg-slate-700 rounded-full h-3"> <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div> </div> <p className="text-xs text-slate-400 mt-1.5 text-right font-mono">{exp} / {maxExp} EXP</p> </div>
      <div className="col-span-6 md:col-span-3 flex items-center justify-center"> <div className="flex w-full max-w-[180px] items-center justify-center gap-4 rounded-xl bg-black/20 p-2 shadow-inner border border-slate-700"> <div className="flex items-center gap-1.5" title="1 Mastery"> <MasteryCardIcon className="w-6 h-6 flex-shrink-0" /> <span className="text-sm font-semibold text-slate-200">1</span> </div> <div className="h-6 w-px bg-slate-600"></div> <div className="flex items-center gap-1.5" title={`${goldReward} Vàng`}> <GoldIcon className="w-5 h-5 flex-shrink-0" /> <span className="text-sm font-semibold text-slate-200">{goldReward}</span> </div> </div> </div>
      <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center"> <button onClick={handleClaimClick} disabled={!isClaimable || isAnyClaiming} className={` flex items-center justify-center gap-2 w-auto px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border ${isClaimable && !isAnyClaiming ? 'bg-gradient-to-r from-emerald-400 to-teal-400 border-emerald-500/50 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20 transform hover:scale-105 cursor-pointer' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-70' } `}> <TrophyIcon className="w-4 h-4" /> {isAnyClaiming ? 'Claiming...' : 'Claim'} </button> </div>
    </div>
  );
});
VocabularyRow.displayName = 'VocabularyRow';

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }) => {
    const paginationRange = useMemo(() => {
        const siblingCount = 1; const totalPageNumbers = siblingCount + 5;
        if (totalPageNumbers >= totalPages) { return Array.from({ length: totalPages }, (_, i) => i + 1); }
        const range = (start: number, end: number) => { let length = end - start + 1; return Array.from({ length }, (_, idx) => idx + start); };
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1); const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
        const shouldShowLeftDots = leftSiblingIndex > 2; const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
        const firstPageIndex = 1; const lastPageIndex = totalPages;
        if (!shouldShowLeftDots && shouldShowRightDots) { let leftItemCount = 3 + 2 * siblingCount; let leftRange = range(1, leftItemCount); return [...leftRange, '...', totalPages]; }
        if (shouldShowLeftDots && !shouldShowRightDots) { let rightItemCount = 3 + 2 * siblingCount; let rightRange = range(totalPages - rightItemCount + 1, totalPages); return [firstPageIndex, '...', ...rightRange]; }
        if (shouldShowLeftDots && shouldShowRightDots) { let middleRange = range(leftSiblingIndex, rightSiblingIndex); return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex]; }
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [currentPage, totalPages]);
    if (totalPages <= 1) return null;
    return (
        <nav className="flex items-center justify-center gap-1 sm:gap-2" aria-label="Pagination">
            {paginationRange.map((page, index) => typeof page === 'number' ? ( <button key={index} onClick={() => onPageChange(page)} className={`w-9 h-9 sm:w-10 sm:h-10 text-sm font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center ${ currentPage === page ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700' }`} aria-current={currentPage === page ? 'page' : undefined}> {page} </button> ) : ( <span key={index} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm text-slate-500" aria-hidden="true"> {page} </span> ) )}
        </nav>
    );
};

// --- Component "Lối vào" (Wrapper/Entry Point) ---
interface AchievementsScreenProps {
  user: User | null;
  onClose: () => void;
  onDataUpdate: (updates: { coins?: number, masteryCards?: number }) => void;
}

export default function AchievementsScreen({ user, onClose, onDataUpdate }: AchievementsScreenProps) {
  if (!user) {
    return null;
  }

  return (
    <AchievementsProvider user={user} onDataUpdate={onDataUpdate}>
      <AchievementsScreenUI onClose={onClose} />
    </AchievementsProvider>
  );
}
