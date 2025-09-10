// --- START OF FILE bomb.tsx (refactored) ---

import React, { memo } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import { BombProvider, useBombGame } from './BombContext.tsx'; // Import Context và Provider

// --- Các component Icon SVG & IMG (Không thay đổi, giữ nguyên) ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}> <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" /> </svg> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const BombIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000441c61f7962f3b928212f891.png" alt="Bomb" className={className} /> );
const CircleDollarSignIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin" className={className} /> );
const FlagIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg> );
const RefreshCwIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg> );
const StairsIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000212461f7b2e51a8e75dcdb7e.png" alt="Exit" className={className} /> );
const pickaxeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000d394622fa7e3b147c6b84a11.png';

// --- MasteryDisplay Component (Không thay đổi) ---
const masteryIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png';
const MasteryDisplay: React.FC<{ masteryCount: number; }> = memo(({ masteryCount }) => ( /* ... code không đổi ... */ ));

// --- CSS CHO HIỆU ỨNG (Không thay đổi) ---
const CustomAnimationStyles = () => ( /* ... code không đổi ... */ );

// --- COMPONENT CELL (Không thay đổi) ---
const Cell = memo(({ cellData, onCellClick, onRightClick, isAnimating }) => { /* ... code không đổi ... */ });

// --- Giao diện game chính (Component con) ---
// Component này không nhận props, nó lấy mọi thứ từ context
const MinerChallengeUI = ({ masteryCards }) => {
  // Lấy toàn bộ state và actions từ custom hook
  const {
    board,
    currentFloor,
    flagsPlaced,
    pickaxes,
    animatedDisplayedCoins,
    isOpening,
    exitConfirmationPos,
    rewardPerCoin,
    handleCellClick,
    handleRightClick,
    goToNextFloor,
    handleClose,
    setExitConfirmationPos,
  } = useBombGame();

  const BOARD_SIZE = 6; // Hoặc lấy từ context nếu muốn
  const MAX_PICKAXES = 50;
  const TOTAL_BOMBS = 4;

  return (
    <main className="relative bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 font-poppins">
      <CustomAnimationStyles />
      
      <header className="fixed top-0 left-0 w-full z-10 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/80">
        <div className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-4">
          <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              aria-label="Home" title="Home"
          >
              <HomeIcon className="w-5 h-5 text-slate-300" />
              <span className="hidden sm:inline text-sm font-semibold text-slate-300">Home</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <CoinDisplay displayedCoins={animatedDisplayedCoins} isStatsFullscreen={false} />
            <MasteryDisplay masteryCount={masteryCards} />
          </div>
        </div>
      </header>
      
      <div className="w-full max-w-xs sm:max-w-sm mx-auto pt-24">
        <div className="bg-slate-800/50 p-3 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-2 gap-3">
            {/* Floor Display */}
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Current Floor: ${currentFloor}`}>
                <StairsIcon className="w-6 h-6 object-contain opacity-70" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Floor</span>
                    <span className="font-mono text-lg font-bold text-white">{currentFloor}</span>
                </div>
            </div>
            {/* Pickaxe Display */}
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Pickaxes Remaining: ${pickaxes}/${MAX_PICKAXES}`}>
                <img src={pickaxeIconUrl} alt="Pickaxe" className="w-6 h-6" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Pickaxe</span>
                    <div className="flex items-baseline" style={{ gap: '2px' }}>
                      <span className="font-mono text-lg font-bold text-white">{pickaxes}</span>
                      <span className="font-mono text-sm font-bold text-slate-500">/ {MAX_PICKAXES}</span>
                    </div>
                </div>
            </div>
            {/* Bomb Display */}
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title="Bombs Remaining">
                <BombIcon className="w-6 h-6 object-contain" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Bombs</span>
                    <span className="font-mono text-lg font-bold text-white">{TOTAL_BOMBS - flagsPlaced}</span>
                </div>
            </div>
            {/* Reward Display */}
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Reward per Coin (Mastery Lvl ${masteryCards} x Floor ${currentFloor})`}>
                <CircleDollarSignIcon className="w-6 h-6 object-contain" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Rewards</span>
                    <span className="font-mono text-lg font-bold text-white">{rewardPerCoin}</span>
                </div>
            </div>
        </div>

        <div className="relative">
          <div className="w-full aspect-square">
            <div 
              className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" 
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '6px', pointerEvents: isOpening ? 'none' : 'auto' }}
            >
              {board.flat().map((cell) => (
                <Cell 
                  key={`${cell.y}-${cell.x}`} 
                  cellData={cell} 
                  onCellClick={handleCellClick} 
                  onRightClick={handleRightClick}
                  isAnimating={isOpening?.x === cell.x && isOpening?.y === cell.y}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {exitConfirmationPos && (
         <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-xs p-6 sm:p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-5 shadow-lg">
                    <StairsIcon className="h-9 w-9 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-white">Floor Complete!</h3>
                <p className="mt-2 text-slate-400">Go to Floor {currentFloor + 1}?</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button onClick={() => setExitConfirmationPos(null)} className="inline-flex justify-center rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-slate-600">Stay</button>
                    <button onClick={goToNextFloor} className="inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-green-700">Next Floor</button>
                </div>
            </div>
         </div>
      )}
    </main>
  );
};

// --- Component gốc (Wrapper) ---
// Đây là component sẽ được export và sử dụng ở nơi khác.
// Nó nhận props và truyền chúng vào Provider.
interface MinerChallengeProps {
  onClose: () => void;
  initialDisplayedCoins: number;
  masteryCards: number;
  initialPickaxes: number;
  initialHighestFloor: number;
  onGameEnd: (result: {
    finalPickaxes: number;
    coinsEarned: number;
    highestFloorCompleted: number;
  }) => void;
}

export default function App(props: MinerChallengeProps) {
  return (
    <BombProvider {...props}>
      <MinerChallengeUI masteryCards={props.masteryCards} />
    </BombProvider>
  );
}
// --- END OF FILE bomb.tsx (refactored) ---
