import React, { useState, useEffect } from 'react';

// --- Các component Icon SVG & IMG ---
// --- THAY ĐỔI: Dòng này đã được sửa lỗi cú pháp trong viewBox ---
const BombIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="13" r="9" /><path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.4 2.4 0 0 0-3.4 0l-1.8 1.8" /><path d="m22 2-1.5 1.5" /><path d="M13 13h-2" /><path d="M13 13v-2" /><path d="m13 13 2.1-2.1" /></svg> );
const CircleDollarSignIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin" className={className} /> );
const FlagIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg> );
const RefreshCwIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg> );
const StairsIcon = ({ className }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000212461f7b2e51a8e75dcdb7e.png" alt="Exit" className={className} /> );
const TrophyIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.87 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.13 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> );

// --- Cấu hình game ---
const BOARD_SIZE = 6;
const NUM_RANDOM_BOMBS = 4;
const NUM_COINS = 6;
const TOTAL_BOMBS = NUM_RANDOM_BOMBS;
const EXPLOSION_STEP_DELAY = 120; // ms

// --- Hàm tiện ích tạo độ trễ ---
const delay = ms => new Promise(res => setTimeout(res, ms));

export default function App() {
  const [board, setBoard] = useState(() => createBoard());
  const [coinsFound, setCoinsFound] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [exitConfirmationPos, setExitConfirmationPos] = useState(null);
  const [isExploding, setIsExploding] = useState(false);

  function createBoard() {
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
        x: colIndex,
        y: rowIndex,
        isMineRandom: false,
        isCoin: false,
        isExit: false,
        isRevealed: false,
        isFlagged: false,
        explosionStep: 0, // 0: bình thường, 1: đang nổ
    })));
    
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
  }
  
  async function handleCellClick(x, y) {
    if (isExploding || board[y][x].isFlagged || board[y][x].isRevealed) return;

    const initialCell = board[y][x];

    if (initialCell.isExit) {
        if (!initialCell.isRevealed) {
            setBoard(prev => {
                const newBoard = JSON.parse(JSON.stringify(prev));
                newBoard[y][x].isRevealed = true;
                return newBoard;
            });
        }
        setExitConfirmationPos({ x, y });
        return;
    }

    let tempBoard = JSON.parse(JSON.stringify(board));
    const clickedCell = tempBoard[y][x];

    if (clickedCell.isMineRandom) {
        setIsExploding(true);

        const explosionsQueue = [{x, y}];
        const explodedCells = new Set();

        while (explosionsQueue.length > 0) {
            const currentBombPos = explosionsQueue.shift();
            const bombKey = `${currentBombPos.y}-${currentBombPos.x}`;

            if (explodedCells.has(bombKey)) continue;
            explodedCells.add(bombKey);
            
            tempBoard[currentBombPos.y][currentBombPos.x].explosionStep = 1;
            setBoard(JSON.parse(JSON.stringify(tempBoard)));
            await delay(EXPLOSION_STEP_DELAY);

            const unrevealedCells = [];
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    const cellKey = `${r}-${c}`;
                    if (!tempBoard[r][c].isRevealed && !explodedCells.has(cellKey)) {
                        unrevealedCells.push(tempBoard[r][c]);
                    }
                }
            }
            
            const cellsToExplode = unrevealedCells.sort(() => 0.5 - Math.random()).slice(0, 4);

            for (const targetCell of cellsToExplode) {
                const targetKey = `${targetCell.y}-${targetCell.x}`;
                if (explodedCells.has(targetKey)) continue;
                explodedCells.add(targetKey);

                tempBoard[targetCell.y][targetCell.x].explosionStep = 1;
                
                if (targetCell.isCoin) {
                    setCoinsFound(prev => prev + 1);
                }
                if (targetCell.isMineRandom) {
                    explosionsQueue.push({x: targetCell.x, y: targetCell.y});
                }
                
                setBoard(JSON.parse(JSON.stringify(tempBoard)));
                await delay(EXPLOSION_STEP_DELAY);
            }
        }
        
        tempBoard.forEach(row => row.forEach(cell => {
            if (cell.explosionStep === 1) {
                cell.isRevealed = true;
                cell.explosionStep = 0;
            }
        }));
        setBoard(tempBoard);
        setIsExploding(false);

    } else {
        if (clickedCell.isCoin) {
            setCoinsFound(prev => prev + 1);
        }
        clickedCell.isRevealed = true;
        setBoard(tempBoard);
    }
  }

  function handleRightClick(e, x, y) {
    e.preventDefault();
    if (isExploding || board[y][x].isRevealed) return;
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

  function resetGame() {
    setCurrentFloor(1);
    setCoinsFound(0);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
    setIsExploding(false);
  }

  function goToNextFloor() {
    setCurrentFloor(prev => prev + 1);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
    setIsExploding(false);
  }

  const Cell = ({ cellData }) => {
    const { isRevealed, isMineRandom, isCoin, isFlagged, isExit, explosionStep } = cellData;
    const cellStyle = {
        base: 'w-full h-full rounded-lg transition-all duration-200 relative',
        hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md border border-transparent',
        revealed: 'bg-slate-800/80 cursor-default border border-slate-700',
        exitRevealed: 'bg-green-800/50 hover:bg-green-700/60 cursor-pointer border border-green-600',
        exploding: 'bg-orange-500/50 border-orange-400 scale-110 animate-ping'
    };
    
    let content = null;
    let specificCellStyle = '';

    const wrapperClass = "w-[70%] h-[70%]";
    const iconClass = "w-full h-full";
    const imageIconClass = `${iconClass} object-contain`;
    
    if (explosionStep === 1) {
        specificCellStyle = cellStyle.exploding;
        content = <div className={wrapperClass}><BombIcon className={`${iconClass} text-white`} /></div>;
    }
    else if (isFlagged) {
        specificCellStyle = cellStyle.hidden;
        content = <div className={wrapperClass}><FlagIcon className={`${iconClass} text-red-500`} /></div>;
    } 
    else if (isRevealed) {
        specificCellStyle = cellStyle.revealed;
        let iconContent = null; 

        if (isMineRandom) {
            iconContent = <BombIcon className={`${iconClass} text-white`} />;
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
        className={`${cellStyle.base} ${specificCellStyle || (isRevealed ? cellStyle.revealed : cellStyle.hidden)}`}
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

        <div className="relative">
          {isExploding && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
          <div className="w-full aspect-square">
            <div className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '6px' }}>
              {board.flat().map((cell) => <Cell key={`${cell.y}-${cell.x}`} cellData={cell} />)}
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
                    <button onClick={() => setExitConfirmationPos(null)} className="inline-flex justify-center rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200">Ở lại</button>
                    <button onClick={goToNextFloor} className="inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200">Lên tầng</button>
                </div>
            </div>
         </div>
      )}
    </main>
  );
}
