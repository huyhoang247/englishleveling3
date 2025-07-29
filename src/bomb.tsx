// --- START OF FILE bomb.tsx (5).txt ---

import React, { useState, memo, useCallback } from 'react';
import CoinDisplay from './coin-display.tsx';

// --- Các component Icon SVG & IMG (Không thay đổi) ---
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
const MasteryDisplay: React.FC<{ masteryCount: number; }> = memo(({ masteryCount }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
       <style jsx>{`@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .animate-pulse-fast { animation: pulse-fast 1s infinite; }`}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      <div className="relative flex items-center justify-center"><img src={masteryIconUrl} alt="Mastery Icon" className="w-4 h-4" /></div>
      <div className="font-bold text-gray-800 text-xs tracking-wide ml-1">{masteryCount.toLocaleString()}</div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div>
    </div>
));

// --- Cấu hình game ---
const BOARD_SIZE = 6;
const NUM_RANDOM_BOMBS = 4;
const NUM_COINS = 6;
const TOTAL_BOMBS = NUM_RANDOM_BOMBS;
const MAX_PICKAXES = 50;
const OPEN_CELL_DELAY = 400; // Thời gian delay khi mở ô (ms)

// --- CSS CHO HIỆU ỨNG RUNG Ô VÀ CÁC HIỆU ỨNG KHÁC ---
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
            iconContent = <BombIcon className={imageIconClass} />;
        } else if (isExit) {
            iconContent = <StairsIcon className={imageIconClass} />;
            specificCellStyle = cellStyle.exitRevealed; 
        } else if (isCollectableCoin) {
            finalWrapperClass = "w-[60%] h-[60%]";
            iconContent = <CircleDollarSignIcon className={`${imageIconClass} animate-gentle-bounce-inline`} />;
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

// THAY ĐỔI: Cập nhật props interface
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

export default function App({ onClose, initialDisplayedCoins, masteryCards, initialPickaxes, initialHighestFloor, onGameEnd }: MinerChallengeProps) {
  const createBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({ x: colIndex, y: rowIndex, isMineRandom: false, isCoin: false, isExit: false, isRevealed: false, isFlagged: false, isCollected: false })));
    const placeItem = (itemType) => { 
        let placed = false; 
        while(!placed) { 
            const x = Math.floor(Math.random() * BOARD_SIZE); 
            const y = Math.floor(Math.random() * BOARD_SIZE); 
            const cell = newBoard[y][x]; 
            if (!cell.isMineRandom && !cell.isCoin && !cell.isExit) { cell[itemType] = true; placed = true; } 
        } 
    };
    for (let i = 0; i < NUM_RANDOM_BOMBS; i++) placeItem('isMineRandom');
    for (let i = 0; i < NUM_COINS; i++) placeItem('isCoin');
    placeItem('isExit');
    return newBoard;
  };

  // THAY ĐỔI: Quản lý State cục bộ cho phiên chơi
  const [currentFloor, setCurrentFloor] = useState(initialHighestFloor > 0 ? initialHighestFloor + 1 : 1);
  const [board, setBoard] = useState(() => createBoard());
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [exitConfirmationPos, setExitConfirmationPos] = useState(null);
  
  // State cục bộ, không còn phụ thuộc vào props để cập nhật liên tục
  const [pickaxes, setPickaxes] = useState(initialPickaxes);
  const [coinsEarnedThisSession, setCoinsEarnedThisSession] = useState(0); // Chỉ theo dõi vàng kiếm được trong session này
  const [animatedDisplayedCoins, setAnimatedDisplayedCoins] = useState(initialDisplayedCoins);
  const [highestFloorCompletedThisSession, setHighestFloorCompletedThisSession] = useState(initialHighestFloor);

  const [isOpening, setIsOpening] = useState<{ x: number, y: number } | null>(null);

  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) return;
    const isCountingUp = endValue > startValue;
    const step = Math.ceil(Math.abs(endValue - startValue) / 30) || 1;
    let current = startValue;
    const interval = setInterval(() => {
      if (isCountingUp) { current += step; } else { current -= step; }
      if ((isCountingUp && current >= endValue) || (!isCountingUp && current <= endValue)) {
        setAnimatedDisplayedCoins(endValue);
        clearInterval(interval);
      } else {
        setAnimatedDisplayedCoins(current);
      }
    }, 30);
  }, []);
  
  const updateCell = (x, y, newProps) => {
    setBoard(prevBoard => prevBoard.map((row, rowIndex) => rowIndex !== y ? row : row.map((cell, colIndex) => colIndex !== x ? cell : { ...cell, ...newProps })));
  };
  
  const collectAllVisibleCoins = useCallback(() => {
      const rewardPerCoin = Math.max(1, masteryCards) * currentFloor;
      let totalReward = 0;
      const newBoard = board.map(row => 
          row.map(cell => {
              if(cell.isRevealed && cell.isCoin && !cell.isCollected) {
                  totalReward += rewardPerCoin;
                  return { ...cell, isCollected: true };
              }
              return cell;
          })
      );
      if(totalReward > 0) {
          const newTotalCoinsEarned = coinsEarnedThisSession + totalReward;
          setBoard(newBoard);
          setCoinsEarnedThisSession(newTotalCoinsEarned); // Cập nhật state vàng kiếm được
          // Cập nhật số vàng hiển thị trên màn hình
          startCoinCountAnimation(animatedDisplayedCoins, initialDisplayedCoins + newTotalCoinsEarned);
      }
  }, [board, masteryCards, currentFloor, coinsEarnedThisSession, animatedDisplayedCoins, initialDisplayedCoins, startCoinCountAnimation]);

  const processCellOpening = (x: number, y: number) => {
    const cell = board[y][x];
    if (cell.isFlagged || (cell.isRevealed && !cell.isExit)) return;

    if (!cell.isRevealed) {
      if (pickaxes <= 0) return;
      // THAY ĐỔI: Chỉ cập nhật state cục bộ, không gọi ra ngoài
      setPickaxes(prev => prev - 1);
    }
    
    if (cell.isMineRandom) {
      const newBoard = JSON.parse(JSON.stringify(board));
      const explosionsQueue = [{ x, y }];
      while (explosionsQueue.length > 0) {
        const currentBombPos = explosionsQueue.shift();
        const bombCell = newBoard[currentBombPos.y][currentBombPos.x];
        if (bombCell.isRevealed) continue;
        bombCell.isRevealed = true;
        const unrevealedCells = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (!newBoard[r][c].isRevealed) unrevealedCells.push(newBoard[r][c]);
          }
        }
        const cellsToExplode = unrevealedCells.sort(() => 0.5 - Math.random()).slice(0, 4);
        cellsToExplode.forEach(targetCell => {
          if (!targetCell.isRevealed) {
            targetCell.isRevealed = true;
            if (targetCell.isMineRandom) explosionsQueue.push({ x: targetCell.x, y: targetCell.y });
          }
        });
      }
      setBoard(newBoard);
    } else {
      updateCell(x, y, { isRevealed: true });
    }
  };

  const handleCellClick = useCallback((x: number, y: number) => {
    if (isOpening) return;
    const cell = board[y][x];
    if (cell.isRevealed && cell.isExit) {
        setExitConfirmationPos({ x, y });
        return;
    }
    if ((cell.isRevealed && !cell.isCoin) || cell.isFlagged) return;
    if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
        collectAllVisibleCoins();
        return;
    }
    if (pickaxes <= 0) {
        console.log("Hết cuốc!");
        return;
    }
    setIsOpening({ x, y });
    setTimeout(() => {
        processCellOpening(x, y);
        setIsOpening(null);
    }, OPEN_CELL_DELAY);

  }, [board, collectAllVisibleCoins, pickaxes, isOpening]);

  const handleRightClick = useCallback((e, x, y) => {
    e.preventDefault();
    if (isOpening) return;
    const cell = board[y][x];
    if (cell.isRevealed) return;
    if (!cell.isFlagged && flagsPlaced < TOTAL_BOMBS) {
        updateCell(x, y, { isFlagged: true });
        setFlagsPlaced(prev => prev + 1);
    } else if (cell.isFlagged) {
        updateCell(x, y, { isFlagged: false });
        setFlagsPlaced(prev => prev - 1);
    }
  }, [board, flagsPlaced, isOpening]);
  
  const goToNextFloor = () => {
    // THAY ĐỔI: Cập nhật tầng cao nhất đã hoàn thành CỤC BỘ
    setHighestFloorCompletedThisSession(prev => Math.max(prev, currentFloor));
    setCurrentFloor(prev => prev + 1);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
  };
  
  // THAY ĐỔI: Hàm xử lý khi đóng game, tổng hợp dữ liệu và gọi onGameEnd
  const handleClose = () => {
    let uncollectedReward = 0;
    const rewardPerCoinOnCurrentFloor = Math.max(1, masteryCards) * currentFloor;

    board.flat().forEach(cell => {
      if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
        uncollectedReward += rewardPerCoinOnCurrentFloor;
      }
    });
    
    const totalCoinsEarned = coinsEarnedThisSession + uncollectedReward;

    // Gửi gói dữ liệu cuối cùng về cho component cha
    onGameEnd({
      finalPickaxes: pickaxes,
      coinsEarned: totalCoinsEarned,
      // Tính tầng cao nhất đã hoàn thành trong phiên này
      highestFloorCompleted: highestFloorCompletedThisSession
    });

    onClose(); // Gọi hàm đóng giao diện game
  };

  const resetGame = () => {
    // Logic reset này cần xem xét lại. Hiện tại nó chỉ reset cục bộ.
    // Nếu muốn reset thực sự (ghi về DB), cần gọi onGameEnd với giá trị mặc định.
    setCurrentFloor(1);
    setFlagsPlaced(0);
    setBoard(createBoard());
    setExitConfirmationPos(null);
    setPickaxes(MAX_PICKAXES);
    setCoinsEarnedThisSession(0); // Reset vàng kiếm được
    setAnimatedDisplayedCoins(initialDisplayedCoins); // Reset vàng hiển thị
    // Không gọi onGameEnd ở đây trừ khi bạn muốn lưu trạng thái reset này vào DB
  };

  const rewardPerCoin = Math.max(1, masteryCards) * currentFloor;

  return (
    <main className="relative bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 font-poppins">
      <CustomAnimationStyles />
      
      <header className="fixed top-0 left-0 w-full z-10 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/80">
        <div className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-4">
          <button
              // THAY ĐỔI: Gọi hàm handleClose đã được sửa đổi
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              aria-label="Home"
              title="Home"
          >
              <HomeIcon className="w-5 h-5 text-slate-300" />
              <span className="hidden sm:inline text-sm font-semibold text-slate-300">Home</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* THAY ĐỔI: Hiển thị tổng số vàng động */}
            <CoinDisplay displayedCoins={animatedDisplayedCoins} isStatsFullscreen={false} />
            <MasteryDisplay masteryCount={masteryCards} />
          </div>
        </div>
      </header>
      
      <div className="w-full max-w-xs sm:max-w-sm mx-auto pt-24">
        <div className="bg-slate-800/50 p-3 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title={`Current Floor: ${currentFloor}`}>
                <StairsIcon className="w-6 h-6 object-contain opacity-70" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Floor</span>
                    <span className="font-mono text-lg font-bold text-white">{currentFloor}</span>
                </div>
            </div>
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
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 flex items-center justify-start gap-3" title="Bombs Remaining">
                <BombIcon className="w-6 h-6 object-contain" />
                <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Bombs</span>
                    <span className="font-mono text-lg font-bold text-white">{TOTAL_BOMBS - flagsPlaced}</span>
                </div>
            </div>
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
}
