import React, { useState, memo, useCallback } from 'react';
import CoinDisplay from './coin-display.tsx';

// --- Các component Icon SVG & IMG ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
// --- ICON HOME MỚI ---
const HomeIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
);
const BombIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000441c61f7962f3b928212f891.png" alt="Bomb" className={className} /> );
const CircleDollarSignIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin" className={className} /> );
const FlagIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg> );
const RefreshCwIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg> );
const StairsIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000212461f7b2e51a8e75dcdb7e.png" alt="Exit" className={className} /> );

// --- MasteryDisplay Component (Copied from quiz.tsx) ---
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

// --- CSS TÙY CHỈNH CHO HIỆU ỨNG NẢY NHẸ ---
const CustomAnimationStyles = () => (
  <style>{`
    @keyframes gentle-bounce-inline {
      0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
      50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    }
    .animate-gentle-bounce-inline { animation: gentle-bounce-inline 1s infinite; }
  `}</style>
);

// --- COMPONENT CELL ĐÃ ĐƯỢC CẬP NHẬT LOGIC HIỂN THỊ COIN ---
const Cell = memo(({ cellData, onCellClick, onRightClick }) => {
    const { isRevealed, isMineRandom, isCoin, isFlagged, isExit, isCollected } = cellData;
    
    // Kiểm tra xem ô này có phải là một đồng xu có thể thu thập được không
    const isCollectableCoin = isRevealed && isCoin && !isCollected;

    const cellStyle = { 
        base: 'w-full h-full rounded-lg transition-all duration-200 relative', 
        hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md border border-transparent', 
        revealed: 'bg-slate-800/80 cursor-default border border-slate-700', 
        exitRevealed: 'bg-green-800/50 hover:bg-green-700/60 cursor-pointer border border-green-600',
        collectableCoin: 'hover:bg-yellow-500/20 cursor-pointer' // Style mới cho coin có thể click
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
        } else if (isCollectableCoin) { // CHỈ HIỂN THỊ COIN KHI CHƯA THU THẬP
            finalWrapperClass = "w-[60%] h-[60%]";
            iconContent = <CircleDollarSignIcon className={`${imageIconClass} animate-gentle-bounce-inline`} />;
        }
        
        content = ( <div className={finalWrapperClass}> {iconContent} </div> );
    }
    
    return ( 
      <div 
        className={`${cellStyle.base} ${isRevealed ? specificCellStyle : cellStyle.hidden}`} 
        onClick={() => onCellClick(cellData.x, cellData.y)} 
        onContextMenu={(e) => onRightClick(e, cellData.x, cellData.y)}
      >
        <div className="absolute inset-0 flex items-center justify-center"> {content} </div>
      </div> 
    );
});

interface MinerChallengeProps {
  onClose: () => void;
  displayedCoins: number;
  masteryCards: number;
}

export default function App({ onClose, displayedCoins, masteryCards }: MinerChallengeProps) {
  const createBoard = () => {
    // THÊM `isCollected: false` VÀO TRẠNG THÁI MẶC ĐỊNH CỦA Ô
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({ x: colIndex, y: rowIndex, isMineRandom: false, isCoin: false, isExit: false, isRevealed: false, isFlagged: false, isCollected: false })));
    
    const placeItem = (itemType) => { 
        let placed = false; 
        while(!placed) { 
            const x = Math.floor(Math.random() * BOARD_SIZE); 
            const y = Math.floor(Math.random() * BOARD_SIZE); 
            const cell = newBoard[y][x]; 
            if (!cell.isMineRandom && !cell.isCoin && !cell.isExit) { 
                cell[itemType] = true; 
                placed = true; 
            } 
        } 
    };
    
    for (let i = 0; i < NUM_RANDOM_BOMBS; i++) placeItem('isMineRandom');
    for (let i = 0; i < NUM_COINS; i++) placeItem('isCoin');
    placeItem('isExit');
    
    return newBoard;
  };

  const [currentFloor, setCurrentFloor] = useState(1);
  const [board, setBoard] = useState(() => createBoard());
  const [coinsFound, setCoinsFound] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [exitConfirmationPos, setExitConfirmationPos] = useState(null);

  const updateCell = (x, y, newProps) => {
    setBoard(prevBoard => prevBoard.map((row, rowIndex) => rowIndex !== y ? row : row.map((cell, colIndex) => colIndex !== x ? cell : { ...cell, ...newProps })));
  };

  // HÀM MỚI ĐỂ THU THẬP TẤT CẢ COIN ĐANG HIỆN
  const collectAllVisibleCoins = () => {
    let coinsToCollect = 0;
    const newBoard = board.map(row => 
        row.map(cell => {
            if(cell.isRevealed && cell.isCoin && !cell.isCollected) {
                coinsToCollect++;
                return { ...cell, isCollected: true };
            }
            return cell;
        })
    );
    if(coinsToCollect > 0) {
        setCoinsFound(prev => prev + coinsToCollect);
        setBoard(newBoard);
    }
  };

  const handleCellClick = useCallback((x, y) => {
    const cell = board[y][x];

    // LOGIC MỚI: NẾU CLICK VÀO COIN ĐÃ MỞ, THU THẬP TẤT CẢ
    if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
        collectAllVisibleCoins();
        return;
    }
    
    if (cell.isFlagged || (cell.isRevealed && !cell.isExit)) return;

    if (cell.isExit) {
      if (!cell.isRevealed) {
        updateCell(x, y, { isRevealed: true });
      }
      setExitConfirmationPos({ x, y });
      return;
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
            // Bỏ logic cộng tiền ở đây
            if (targetCell.isMineRandom) explosionsQueue.push({ x: targetCell.x, y: targetCell.y });
          }
        });
      }
      setBoard(newBoard);
    } else {
      // Chỉ mở ô, không cộng tiền nữa
      updateCell(x, y, { isRevealed: true });
    }
  }, [board]);

  const handleRightClick = useCallback((e, x, y) => {
    e.preventDefault();
    const cell = board[y][x];
    if (cell.isRevealed) return;

    if (!cell.isFlagged && flagsPlaced < TOTAL_BOMBS) {
        updateCell(x, y, { isFlagged: true });
        setFlagsPlaced(prev => prev + 1);
    } else if (cell.isFlagged) {
        updateCell(x, y, { isFlagged: false });
        setFlagsPlaced(prev => prev - 1);
    }
  }, [board, flagsPlaced]);

  const goToNextFloor = () => {
    setCurrentFloor(prev => prev + 1);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
  };

  const resetGame = () => {
    setCurrentFloor(1);
    setCoinsFound(0);
    setFlagsPlaced(0);
    setBoard(createBoard());
    setExitConfirmationPos(null);
  };

  return (
    <main className="relative bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 font-poppins">
      <CustomAnimationStyles />
      
      {/* --- HEADER RIÊNG BIỆT VỚI HIỆU ỨNG KÍNH MỜ --- */}
      <header className="fixed top-0 left-0 w-full z-10 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/80">
        <div className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-4">
          <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              aria-label="Về nhà"
              title="Về nhà"
          >
              <HomeIcon className="w-5 h-5 text-slate-300" />
              <span className="hidden sm:inline text-sm font-semibold text-slate-300">Về nhà</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
            <MasteryDisplay masteryCount={masteryCards} />
          </div>
        </div>
      </header>
      
      {/* --- Thêm pt-24 (padding-top) để đẩy nội dung xuống dưới header --- */}
      <div className="w-full max-w-xs sm:max-w-sm mx-auto pt-24">
        {/* Header cũ đã được chuyển lên trên */}

        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">Chain Reaction</h1>
          <p className="text-slate-400 mt-2">Mở các ô và thu thập tiền thưởng!</p>
        </div>

        <div className="bg-slate-800/50 p-3 sm:p-4 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-4 items-center gap-3">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/50 border border-slate-600 h-full">
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Tầng</span>
                <span className="font-mono text-xl font-semibold text-white leading-tight">{currentFloor}</span>
            </div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center">
                <BombIcon className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                <span className="font-mono w-8 text-left">{TOTAL_BOMBS - flagsPlaced}</span>
            </div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center">
                <CircleDollarSignIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                <span className="font-mono w-8 text-left">{coinsFound}</span>
            </div>
            <div className="flex justify-center">
                <button onClick={resetGame} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
                    <RefreshCwIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        <div className="relative">
          <div className="w-full aspect-square">
            <div className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '6px' }}>
              {board.flat().map((cell) => (
                <Cell 
                  key={`${cell.y}-${cell.x}`} 
                  cellData={cell} 
                  onCellClick={handleCellClick} 
                  onRightClick={handleRightClick} 
                />
              ))}
            </div>
          </div>
        </div>
        <footer className="mt-8 text-center text-slate-500 text-sm">Tạo bởi Gemini với React & Tailwind CSS.</footer>
      </div>

      {exitConfirmationPos && (
         <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-xs p-6 sm:p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-5 shadow-lg">
                    <StairsIcon className="h-9 w-9 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-white">Tầng Hoàn Tất!</h3>
                <p className="mt-2 text-slate-400">Bạn muốn lên tầng {currentFloor + 1}?</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button onClick={() => setExitConfirmationPos(null)} className="inline-flex justify-center rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-slate-600">Ở lại</button>
                    <button onClick={goToNextFloor} className="inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-green-700">Lên tầng</button>
                </div>
            </div>
         </div>
      )}
    </main>
  );
}
