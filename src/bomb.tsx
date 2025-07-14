import React, { useState, useEffect } from 'react';

// --- Các component Icon SVG & IMG (Không thay đổi) ---
const BombIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="13" r="9" /><path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.4 2.4 0 0 0-3.4 0l-1.8 1.8" /><path d="m22 2-1.5 1.5" /><path d="M13 13h-2" /><path d="M13 13v-2" /><path d="m13 13 2.1-2.1" /></svg> );
const CircleDollarSignIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin" className={className} /> );
const HorizontalBombIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000441c61f7962f3b928212f891.png" alt="Horizontal Bomb" className={className} /> );
const FlagIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg> );
const RefreshCwIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg> );
const StairsIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000212461f7b2e51a8e75dcdb7e.png" alt="Exit" className={className} /> );
const TrophyIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.87 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.13 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> );
const ArrowVerticalIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 21V3"/><path d="m5 12 7-7 7 7"/></svg> );
const CheckIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg> );
const XIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> );


// --- Cấu hình game ---
const BOARD_SIZE = 6;
// --- THAY ĐỔI: Quay lại cấu hình bom riêng biệt ---
const NUM_HORIZONTAL_BOMBS = 2;
const NUM_VERTICAL_BOMBS = 2;
const NUM_COINS = 4;
const TOTAL_BOMBS = NUM_HORIZONTAL_BOMBS + NUM_VERTICAL_BOMBS;

export default function App() {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [board, setBoard] = useState(() => createBoard());
  const [coinsFound, setCoinsFound] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [exitConfirmationPos, setExitConfirmationPos] = useState(null);

  // --- THAY ĐỔI: Khôi phục logic tạo bàn ban đầu ---
  function createBoard() {
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({ x: colIndex, y: rowIndex, isMineHorizontal: false, isMineVertical: false, isCoin: false, isExit: false, isRevealed: false, isFlagged: false, })));
    
    const placeItem = (itemType) => { 
        let placed = false; 
        while(!placed) { 
            const x = Math.floor(Math.random() * BOARD_SIZE); 
            const y = Math.floor(Math.random() * BOARD_SIZE); 
            const cell = newBoard[y][x]; 
            if (!cell.isMineHorizontal && !cell.isMineVertical && !cell.isCoin && !cell.isExit) { 
                cell[itemType] = true; 
                placed = true; 
            } 
        } 
    };
    
    // Đặt 2 bom ngang và 2 bom dọc
    for (let i = 0; i < NUM_HORIZONTAL_BOMBS; i++) placeItem('isMineHorizontal');
    for (let i = 0; i < NUM_VERTICAL_BOMBS; i++) placeItem('isMineVertical');
    for (let i = 0; i < NUM_COINS; i++) placeItem('isCoin');
    placeItem('isExit');
    
    return newBoard;
  }
  
  // Các hàm logic game khác không đổi
  function explode(board, type, index) {
    let newCoins = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        const cell = type === 'row' ? board[index][i] : board[i][index];
        if (cell.isRevealed) continue;
        if (cell.isCoin) newCoins++;
        cell.isRevealed = true;
    }
    setCoinsFound(prev => prev + newCoins);
  }
  function handleCellClick(x, y) {
    const cell = board[y][x];
    if (cell.isFlagged) return;
    if (cell.isRevealed && cell.isExit) {
        setExitConfirmationPos({ x, y });
        return;
    }
    if (!cell.isRevealed) {
        const newBoard = JSON.parse(JSON.stringify(board));
        const clickedCell = newBoard[y][x];
        if (clickedCell.isMineHorizontal || clickedCell.isMineVertical) {
            const explosionsToRun = new Set();
            if (clickedCell.isMineHorizontal) {
                explosionsToRun.add(`row-${y}`);
            }
            if (clickedCell.isMineVertical) {
                explosionsToRun.add(`col-${x}`);
            }
            explosionsToRun.forEach(explosionKey => {
                const [type, indexStr] = explosionKey.split('-');
                const index = parseInt(indexStr, 10);
                explode(newBoard, type, index);
            });
        } else {
            clickedCell.isRevealed = true;
            if (clickedCell.isCoin) {
                setCoinsFound(prev => prev + 1);
            }
        }
        setBoard(newBoard);
    }
  }
  function handleRightClick(e, x, y) {
    e.preventDefault();
    if (board[y][x].isRevealed) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    const cell = newBoard[y][x];
    if (!cell.isFlagged && flagsPlaced < TOTAL_BOMBS) {
        cell.isFlagged = true;
        setFlagsPlaced(prev => prev + 1);
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        setFlagsPlaced(prev => prev - 1);
    }
    setBoard(newBoard);
  }
  function goToNextFloor() {
    setCurrentFloor(prev => prev + 1);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
  }
  function resetGame() {
    setCurrentFloor(1);
    setCoinsFound(0);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
  }

  // Component Cell (không đổi)
  const Cell = ({ cellData }) => {
    const { isRevealed, isMineHorizontal, isMineVertical, isCoin, isFlagged, isExit } = cellData;
    const cellStyle = { 
        base: 'w-full h-full rounded-lg transition-all duration-200 relative', 
        hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md border border-transparent', 
        revealed: 'bg-slate-800/80 cursor-default border border-slate-700', 
        exitRevealed: 'bg-green-800/50 hover:bg-green-700/60 cursor-pointer border border-green-600' 
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
        let iconContent = null; 

        // Nếu một ô vô tình được đặt cả hai loại bom, ưu tiên hiển thị bom dọc
        if (isMineVertical) {
            iconContent = (
              <div className={`${iconClass} relative`}>
                <BombIcon className={`${iconClass} text-white`} />
                <ArrowVerticalIcon className="absolute inset-0 m-auto w-2/3 h-2/3 text-red-500 opacity-80" />
              </div>
            );
        } else if (isMineHorizontal) {
            iconContent = <HorizontalBombIcon className={imageIconClass} />;
        } else if (isExit) {
            iconContent = <StairsIcon className={imageIconClass} />;
            specificCellStyle = cellStyle.exitRevealed; 
        } else if (isCoin) { 
            iconContent = <CircleDollarSignIcon className={imageIconClass} />;
        }
        
        content = (
            <div className={wrapperClass}>
                {iconContent}
            </div>
        );
    }
    
    return ( 
      <div 
        className={`${cellStyle.base} ${isRevealed ? (specificCellStyle || cellStyle.revealed) : cellStyle.hidden}`} 
        onClick={() => handleCellClick(cellData.x, cellData.y)} 
        onContextMenu={(e) => handleRightClick(e, cellData.x, cellData.y)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {content}
        </div>
      </div> 
    );
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto">
        {/* Header và Bảng điều khiển (không đổi) */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">Chain Reaction</h1>
          <p className="text-slate-400 mt-2">Dọn bàn và lên tầng cao nhất!</p>
        </div>
        <div className="bg-slate-800/50 p-3 sm:p-4 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-4 items-center gap-2">
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center"><BombIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" /><span className="font-mono w-8 text-left">{TOTAL_BOMBS - flagsPlaced}</span></div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center"><CircleDollarSignIcon className="w-5 h-5 sm:w-6 sm:h-6 object-contain" /><span className="font-mono w-8 text-left">{coinsFound}</span></div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center"><TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" /><span className="font-mono w-8 text-left">{currentFloor}</span></div>
            <div className="flex justify-center"><button onClick={resetGame} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"><RefreshCwIcon className="w-6 h-6" /></button></div>
        </div>

        {/* Bàn chơi (không đổi) */}
        <div className="relative">
          <div className="w-full aspect-square">
            <div className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '6px' }}>
              {board.flat().map((cell) => <Cell key={`${cell.y}-${cell.x}`} cellData={cell} />)}
            </div>
          </div>
        </div>
        <footer className="mt-8 text-center text-slate-500 text-sm">Tạo bởi Gemini với React & Tailwind CSS.</footer>
      </div>

      {/* Pop-up xác nhận lên tầng (không đổi) */}
      {exitConfirmationPos && (
         <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-xs p-6 sm:p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-5 shadow-lg">
                    <StairsIcon className="h-9 w-9 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-white">Tầng Hoàn Tất!</h3>
                <p className="mt-2 text-slate-400">Bạn muốn lên tầng {currentFloor + 1}?</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button onClick={() => setExitConfirmationPos(null)} className="inline-flex justify-center rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200">Ở lại</button>
                    <button onClick={goToNextFloor} className="inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200">Lên tầng</button>
                </div>
            </div>
         </div>
      )}
    </main>
  );
}

