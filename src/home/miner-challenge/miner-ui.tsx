// --- START OF FILE miner-ui.tsx ---

import React, { memo, useCallback } from 'react';
import { BombProvider, useBomb } from './miner-context.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx';
import { useGame } from '../../GameContext.tsx'; // THAY ĐỔI: Import useGame
import { minerAssets } from '../../game-assets.ts'; // THÊM MỚI: Import tài nguyên hình ảnh

// --- Các component Icon SVG ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}> <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" /> </svg> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const FlagIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg> );
const RefreshCwIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg> );

// --- Cấu hình game (Đã chuyển sang Context) ---
const BOARD_SIZE = 6;
const TOTAL_BOMBS = 4; // Chỉ giữ lại để hiển thị
const MAX_PICKAXES = 50; // Chỉ giữ lại để hiển thị
const OPEN_CELL_DELAY = 400;

// --- CSS CHO HIỆU ỨNG RUNG Ô VÀ CÁC HIỆU ỨNG KHÁC (Không thay đổi) ---
const CustomAnimationStyles = () => (
  <style>{`
    @keyframes gentle-bounce-inline {
      0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
      50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    }
    .animate-gentle-bounce-inline { animation: gentle-bounce-inline 1s infinite; }

    @keyframes gentle-shake-animation {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      50% { transform: translateX(3px); }
      75% { transform: translateX(-3px); }
    }
    .cell-shake {
      animation: gentle-shake-animation ${OPEN_CELL_DELAY}ms ease-in-out both;
    }
  `}</style>
);

// --- COMPONENT CELL (Không thay đổi) ---
const Cell = memo(({ cellData, onCellClick, onRightClick, isAnimating }) => {
    const { isRevealed, isMineRandom, isCoin, isFlagged, isExit, isCollected } = cellData;
    const isCollectableCoin = isRevealed && isCoin && !isCollected;
    const cellStyle = { 
        base: 'w-full h-full rounded-lg transition-all duration-200 relative', 
        hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md border border-transparent', 
        revealed: 'bg-slate-800/80 cursor-default border border-slate-700', 
        exitRevealed: 'bg-green-800/50 hover:bg-green-700/60 cursor-pointer border border-green-600',
        collectableCoin: 'hover:bg-yellow-500/20 cursor-pointer'
    };
    let content = null;
    let specificCellStyle = '';
    const wrapperClass = "w-[70%] h-[70%]";
    const iconClass = "w-full h-full";
    const imageIconClass = `${iconClass} object-contain`;

    if (isFlagged) {
        content = <div className={wrapperClass}><FlagIcon className={`${iconClass} text-red-500`} /></div>;
    } 
    else if (isRevealed) {
        specificCellStyle = cellStyle.revealed;
        if(isCollectableCoin) specificCellStyle += ` ${cellStyle.collectableCoin}`;
        let iconContent = null; 
        let finalWrapperClass = wrapperClass;

        if (isMineRandom) {
            iconContent = <img src={minerAssets.bombIcon} alt="Bomb" className={imageIconClass} />;
        } else if (isExit) {
            iconContent = <img src={minerAssets.exitIcon} alt="Exit" className={imageIconClass} />;
            specificCellStyle = cellStyle.exitRevealed; 
        } else if (isCollectableCoin) {
            finalWrapperClass = "w-[60%] h-[60%]";
            iconContent = <img src={minerAssets.coinIcon} alt="Coin" className={`${imageIconClass} animate-gentle-bounce-inline`} />;
        }
        content = ( <div className={finalWrapperClass}> {iconContent} </div> );
    }
    
    return ( 
      <div 
        className={`${cellStyle.base} ${isRevealed ? specificCellStyle : cellStyle.hidden} ${isAnimating ? 'cell-shake' : ''}`} 
        onClick={() => onCellClick(cellData.x, cellData.y)} 
        onContextMenu={(e) => onRightClick(e, cellData.x, cellData.y)}
      >
        <div className="absolute inset-0 flex items-center justify-center"> {content} </div>
      </div> 
    );
});

// Component UI của game, nhận dữ liệu từ Context (Không thay đổi)
function BombGameUI() {
  const {
    board,
    currentFloor,
    pickaxes,
    flagsPlaced,
    animatedDisplayedCoins,
    masteryCards,
    exitConfirmationPos,
    isOpening,
    rewardPerCoin,
    handleCellClick,
    handleRightClick,
    goToNextFloor,
    setExitConfirmationPos,
    handleClose
  } = useBomb();

  return (
    <main className="relative bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 font-poppins">
      <CustomAnimationStyles />
      
      <header className="fixed top-0 left-0 w-full z-10 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/80">
        <div className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-4">
          <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              aria-label="Home"
              title="Home"
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
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Current Floor: ${currentFloor}`}>
                <img src={minerAssets.exitIcon} alt="Floor" className="w-6 h-6 object-contain opacity-70" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Floor</span>
                    <span className="font-mono text-lg font-bold text-white">{currentFloor}</span>
                </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Pickaxes Remaining: ${pickaxes}/${MAX_PICKAXES}`}>
                <img src={minerAssets.pickaxeIcon} alt="Pickaxe" className="w-6 h-6" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Pickaxe</span>
                    <div className="flex items-baseline" style={{ gap: '2px' }}>
                      <span className="font-mono text-lg font-bold text-white">{pickaxes}</span>
                      <span className="font-mono text-sm font-bold text-slate-500">/ {MAX_PICKAXES}</span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title="Bombs Remaining">
                <img src={minerAssets.bombIcon} alt="Bombs" className="w-6 h-6 object-contain" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Bombs</span>
                    <span className="font-mono text-lg font-bold text-white">{TOTAL_BOMBS - flagsPlaced}</span>
                </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Reward per Coin (Mastery Lvl ${masteryCards} x Floor ${currentFloor})`}>
                <img src={minerAssets.coinIcon} alt="Rewards" className="w-6 h-6 object-contain" />
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
              style={{ 
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, 
                gap: '6px',
                pointerEvents: isOpening ? 'none' : 'auto' 
              }}
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
                    <img src={minerAssets.exitIcon} alt="Complete" className="h-9 w-9 object-contain" />
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
}

// --- THAY ĐỔI: Props Interface được cập nhật ---
interface MinerChallengeProps {
  onClose: () => void;
  onGameEnd: (result: {
    finalPickaxes: number;
    coinsEarned: number;
    highestFloorCompleted: number;
  }) => void;
}

// --- THAY ĐỔI: Component chính giờ sẽ lấy dữ liệu từ GameContext ---
export default function MinerChallenge(props: MinerChallengeProps) {
  // Lấy dữ liệu trực tiếp từ GameContext thay vì fetch lại
  const { 
    coins, 
    masteryCards, 
    pickaxes, 
    minerChallengeHighestFloor 
  } = useGame();

  return (
    <BombProvider
      onClose={props.onClose}
      onGameEnd={props.onGameEnd}
      // Truyền dữ liệu từ context vào provider
      initialDisplayedCoins={coins}
      masteryCards={masteryCards}
      initialPickaxes={pickaxes}
      initialHighestFloor={minerChallengeHighestFloor}
    >
      <BombGameUI />
    </BombProvider>
  );
}
