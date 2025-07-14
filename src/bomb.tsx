import React, { useState, useEffect } from 'react';

// --- Các component Icon SVG (Không thay đổi) ---
const BombIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="13" r="9" /><path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.4 2.4 0 0 0-3.4 0l-1.8 1.8" /><path d="m22 2-1.5 1.5" /><path d="M13 13h-2" /><path d="M13 13v-2" /><path d="m13 13 2.1-2.1" /></svg> );
const CircleDollarSignIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg> );
const FlagIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg> );
const RefreshCwIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg> );
const StairsIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 2H12l-2.5 2.5L5 9l-3 3v10h10v-5l4-4 4-4-2-2z"/><path d="m16 14-4 4v-5"/><path d="m6 14 4-4H5"/></svg> );
const TrophyIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.87 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.13 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> );
const ArrowHorizontalIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12H3"/><path d="m12 5-7 7 7 7"/></svg> );
const ArrowVerticalIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 21V3"/><path d="m5 12 7-7 7 7"/></svg> );
const CheckIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg> );
const XIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> );


// --- Cấu hình game ---
const BOARD_SIZE = 6;
const NUM_HORIZONTAL_BOMBS = 2;
const NUM_VERTICAL_BOMBS = 2;
const NUM_COINS = 4;
const TOTAL_BOMBS = NUM_HORIZONTAL_BOMBS + NUM_VERTICAL_BOMBS;

export default function App() {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [board, setBoard] = useState(() => createBoard());
  // --- THAY ĐỔI: Xóa state `gameOver` ---
  // const [gameOver, setGameOver] = useState(false);
  const [coinsFound, setCoinsFound] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [exitConfirmationPos, setExitConfirmationPos] = useState(null);

  // createBoard không đổi
  function createBoard() {
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({ x: colIndex, y: rowIndex, isMineHorizontal: false, isMineVertical: false, isCoin: false, isExit: false, isRevealed: false, isFlagged: false, })));
    const placeItem = (itemType) => { let placed = false; while(!placed) { const x = Math.floor(Math.random() * BOARD_SIZE); const y = Math.floor(Math.random() * BOARD_SIZE); const cell = newBoard[y][x]; if (!cell.isMineHorizontal && !cell.isMineVertical && !cell.isCoin && !cell.isExit) { cell[itemType] = true; placed = true; } } };
    for (let i = 0; i < NUM_HORIZONTAL_BOMBS; i++) placeItem('isMineHorizontal');
    for (let i = 0; i < NUM_VERTICAL_BOMBS; i++) placeItem('isMineVertical');
    for (let i = 0; i < NUM_COINS; i++) placeItem('isCoin');
    placeItem('isExit');
    return newBoard;
  }

  // --- THAY ĐỔI: Đơn giản hóa hàm explode, không cần trả về hay kiểm tra nổ dây chuyền ---
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
    // --- THAY ĐỔI: Xóa điều kiện `gameOver` ---
    if (cell.isFlagged) return;

    if (cell.isRevealed && cell.isExit) {
        setExitConfirmationPos({ x, y });
        return;
    }

    if (!cell.isRevealed) {
        const newBoard = JSON.parse(JSON.stringify(board));
        
        if (cell.isMineHorizontal || cell.isMineVertical) {
            const initialBombs = new Map();
            const explosionsToRun = new Set();
            for(let i=0; i<BOARD_SIZE; i++){
                const rowCell = newBoard[y][i];
                const colCell = newBoard[i][x];
                if(rowCell.isMineHorizontal || rowCell.isMineVertical) initialBombs.set(`${rowCell.y}-${rowCell.x}`, rowCell);
                if(colCell.isMineHorizontal || colCell.isMineVertical) initialBombs.set(`${colCell.y}-${colCell.x}`, colCell);
            }
            initialBombs.forEach((bomb) => {
                if (bomb.isMineHorizontal) explosionsToRun.add(`row-${bomb.y}`);
                if (bomb.isMineVertical) explosionsToRun.add(`col-${bomb.x}`);
            });
            
            // --- THAY ĐỔI: Chỉ cần thực hiện nổ, không cần kiểm tra kết quả ---
            explosionsToRun.forEach(explosionKey => {
                const [type, indexStr] = explosionKey.split('-');
                const index = parseInt(indexStr, 10);
                explode(newBoard, type, index);
            });
            
        } else {
            newBoard[y][x].isRevealed = true;
            if (newBoard[y][x].isCoin) {
                setCoinsFound(prev => prev + 1);
            }
        }
        setBoard(newBoard);
    }
  }

  function handleRightClick(e, x, y) {
    e.preventDefault();
    // --- THAY ĐỔI: Xóa điều kiện `gameOver` ---
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
    // --- THAY ĐỔI: Xóa `setGameOver(false)` ---
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
  }

  // Component Cell không đổi
  const Cell = ({ cellData }) => {
    const { isRevealed, isMineHorizontal, isMineVertical, isCoin, isFlagged, isExit } = cellData;
    const cellStyle = { base: 'w-full h-full rounded-lg transition-all duration-200 relative', hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md', revealed: 'bg-slate-800/80 cursor-default border border-slate-700', exitRevealed: 'bg-green-800/50 hover:bg-green-700/60 cursor-pointer border border-green-600' };
    let content = null;
    let specificCellStyle = '';
    if (isFlagged) { content = <FlagIcon className="w-2/3 h-2/3 text-red-500" />; } 
    else if (isRevealed) {
      if (isMineHorizontal || isMineVertical) { content = (<div className="relative w-full h-full flex items-center justify-center"><BombIcon className="w-3/4 h-3/4 text-white" />{isMineHorizontal && <ArrowHorizontalIcon className="absolute w-1/2 h-1/2 text-red-500 opacity-80" />}{isMineVertical && <ArrowVerticalIcon className="absolute w-1/2 h-1/2 text-red-500 opacity-80" />}</div>); } 
      else if (isExit) { content = <StairsIcon className="w-3/4 h-3/4 text-green-400" />; specificCellStyle = cellStyle.exitRevealed; } 
      else if (isCoin) { content = <CircleDollarSignIcon className="w-3/4 h-3/4 text-yellow-400" />; }
    }
    return ( <div className={`${cellStyle.base} ${isRevealed ? (specificCellStyle || cellStyle.revealed) : cellStyle.hidden}`} onClick={() => handleCellClick(cellData.x, cellData.y)} onContextMenu={(e) => handleRightClick(e, cellData.x, cellData.y)}><div className="absolute inset-0 flex items-center justify-center">{content}</div></div> );
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto">
        {/* Header và Bảng điều khiển không đổi */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">Chain Reaction</h1>
          <p className="text-slate-400 mt-2">Dọn bàn và lên tầng cao nhất!</p>
        </div>
        <div className="bg-slate-800/50 p-3 sm:p-4 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-4 items-center gap-2">
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center"><BombIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" /><span className="font-mono w-8 text-left">{TOTAL_BOMBS - flagsPlaced}</span></div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center"><CircleDollarSignIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" /><span className="font-mono w-8 text-left">{coinsFound}</span></div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center"><TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" /><span className="font-mono w-8 text-left">{currentFloor}</span></div>
            <div className="flex justify-center"><button onClick={resetGame} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"><RefreshCwIcon className="w-6 h-6" /></button></div>
        </div>

        {/* Bàn chơi */}
        <div className="relative">
          <div className="w-full aspect-square">
            <div className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '6px' }}>
              {board.flat().map((cell) => <Cell key={`${cell.y}-${cell.x}`} cellData={cell} />)}
            </div>
          </div>
          
          {/* --- THAY ĐỔI: Xóa toàn bộ lớp phủ Game Over --- */}

          {/* Pop-up xác nhận lên tầng không đổi */}
          {exitConfirmationPos && (
             <div 
                className="absolute z-10 p-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600 flex flex-col items-center gap-3 animate-fade-in"
                style={{
                    left: `${(exitConfirmationPos.x + 0.5) / BOARD_SIZE * 100}%`,
                    top: `${(exitConfirmationPos.y + 0.5) / BOARD_SIZE * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '180px',
                }}
             >
                <p className="text-slate-200 font-semibold text-center">Lên tầng {currentFloor + 1}?</p>
                <div className="flex justify-center gap-4 w-full">
                    <button onClick={() => setExitConfirmationPos(null)} className="flex-1 p-2 bg-red-600/80 hover:bg-red-500 rounded-lg transition-colors flex justify-center items-center" aria-label="Ở lại"><XIcon className="w-6 h-6 text-white"/></button>
                    <button onClick={goToNextFloor} className="flex-1 p-2 bg-green-600/80 hover:bg-green-500 rounded-lg transition-colors flex justify-center items-center" aria-label="Lên tầng"><CheckIcon className="w-6 h-6 text-white"/></button>
                </div>
             </div>
          )}
        </div>
        <footer className="mt-8 text-center text-slate-500 text-sm">Tạo bởi Gemini với React & Tailwind CSS.</footer>
      </div>
    </main>
  );
}

// Font & Style (không đổi)
const fontLink = document.createElement('link'); fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"; fontLink.rel = "stylesheet"; document.head.appendChild(fontLink);
const style = document.createElement('style'); style.innerHTML = `body{font-family:'Poppins',sans-serif}@keyframes fade-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}.animate-fade-in{animation:fade-in .4s cubic-bezier(.25,.46,.45,.94) forwards}`; document.head.appendChild(style);
