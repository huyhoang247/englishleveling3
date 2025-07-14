import React, { useState, useEffect } from 'react';

// --- Các component Icon SVG (không thay đổi) ---
const BombIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="13" r="9" /><path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.4 2.4 0 0 0-3.4 0l-1.8 1.8" /><path d="m22 2-1.5 1.5" /><path d="M13 13h-2" /><path d="M13 13v-2" /><path d="m13 13 2.1-2.1" /></svg>);
const HorizontalBombIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 9h16"/><path d="M10 4l6 14"/><path d="M14 4l-6 14"/></svg>);
const VerticalBombIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 4v16"/><path d="M4 10l14 6"/><path d="M4 14l14-6"/></svg>);
const CircleDollarSignIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>);
const FlagIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>);
const RefreshCwIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>);
const AwardIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>);

// --- Cấu hình game ---
const BOARD_SIZE = 7;
const NUM_HORIZONTAL_BOMBS = 2;
const NUM_VERTICAL_BOMBS = 2;
const TOTAL_BOMBS = NUM_HORIZONTAL_BOMBS + NUM_VERTICAL_BOMBS;

const getLevelConfig = (level) => {
    const coinsRequired = Math.floor(3 + level * 1.2);
    return {
        coinsRequired,
        totalCoinsOnBoard: coinsRequired + Math.min(4, 1 + Math.floor(level / 2)),
        penalty: Math.max(1, Math.floor(level / 2)),
    };
};

export default function App() {
  const [level, setLevel] = useState(1);
  const [config, setConfig] = useState(() => getLevelConfig(level));
  const [board, setBoard] = useState(() => createBoard(level));
  const [levelCleared, setLevelCleared] = useState(false);
  const [coinsTotal, setCoinsTotal] = useState(0);
  const [coinsOnThisLevel, setCoinsOnThisLevel] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  function createBoard(currentLevel) {
    const { totalCoinsOnBoard } = getLevelConfig(currentLevel);
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, y) =>
      Array(BOARD_SIZE).fill(null).map((_, x) => ({
        x, y, bombType: 'none', isCoin: false, isStairs: false, isRevealed: false, isFlagged: false
      }))
    );
    const placeItem = (conditionCheck, setProperty) => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * BOARD_SIZE);
            const y = Math.floor(Math.random() * BOARD_SIZE);
            if (conditionCheck(newBoard[y][x])) {
                setProperty(newBoard[y][x]);
                placed = true;
            }
        }
    };
    const isCellEmpty = (cell) => cell.bombType === 'none' && !cell.isCoin && !cell.isStairs;
    for (let i = 0; i < NUM_HORIZONTAL_BOMBS; i++) placeItem(isCellEmpty, (cell) => cell.bombType = 'horizontal');
    for (let i = 0; i < NUM_VERTICAL_BOMBS; i++) placeItem(isCellEmpty, (cell) => cell.bombType = 'vertical');
    for (let i = 0; i < totalCoinsOnBoard; i++) placeItem(isCellEmpty, (cell) => cell.isCoin = true);
    placeItem(isCellEmpty, (cell) => cell.isStairs = true);
    return newBoard;
  }

  function handleCellClick(x, y) {
    if (levelCleared || board[y][x].isFlagged) return;

    const cell = board[y][x];
    if (cell.isRevealed && cell.isStairs) {
        if (coinsOnThisLevel >= config.coinsRequired) {
            setLevelCleared(true);
        }
        return;
    }
    if (cell.isRevealed) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    revealCell(newBoard, x, y);
    setBoard(newBoard);
  }
  
  // SỬA LỖI: Hàm này được viết lại hoàn toàn để đơn giản và an toàn hơn
  function revealCell(currentBoard, x, y) {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    const cell = currentBoard[y][x];
    if (cell.isRevealed) return;

    cell.isRevealed = true;

    if (cell.bombType !== 'none') {
        setCoinsOnThisLevel(prev => Math.max(0, prev - config.penalty));
        setCoinsTotal(prev => Math.max(0, prev - config.penalty));
        
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);

        if (cell.bombType === 'horizontal') {
            for (let i = 0; i < BOARD_SIZE; i++) {
                if (i !== x) revealCell(currentBoard, i, y); // Nổ lan các ô khác trên hàng
            }
        } else { // Vertical
            for (let i = 0; i < BOARD_SIZE; i++) {
                if (i !== y) revealCell(currentBoard, x, i); // Nổ lan các ô khác trên cột
            }
        }
        return;
    }

    if (cell.isCoin) {
      setCoinsOnThisLevel(prev => prev + 1);
      setCoinsTotal(prev => prev + 1);
      return;
    }
    
    if (cell.isStairs) {
      return;
    }
    
    // Nếu là ô trống, mở rộng ra các ô xung quanh
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            setTimeout(() => revealCell(currentBoard, x + dx, y + dy), 25);
        }
    }
  }

  function handleRightClick(e, x, y) {
    e.preventDefault();
    if (levelCleared || board[y][x].isRevealed) return;

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
    const initialLevel = 1;
    setLevel(initialLevel);
    setConfig(getLevelConfig(initialLevel));
    setBoard(createBoard(initialLevel));
    setLevelCleared(false);
    setCoinsTotal(0);
    setCoinsOnThisLevel(0);
    setFlagsPlaced(0);
  }

  function goToNextLevel() {
    const newLevel = level + 1;
    setLevel(newLevel);
    setConfig(getLevelConfig(newLevel));
    setBoard(createBoard(newLevel));
    setLevelCleared(false);
    setFlagsPlaced(0);
    setCoinsOnThisLevel(0);
  }

  const Cell = ({ cellData }) => {
    const { x, y, isRevealed, bombType, isCoin, isFlagged, isStairs } = cellData;
    const canPass = coinsOnThisLevel >= config.coinsRequired;
    const cellStyle = {
      base: 'w-full h-full rounded-lg transition-all duration-200',
      hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md',
      revealed: 'bg-slate-800/80 border border-slate-700',
    };
    let content = null;
    if (isFlagged) {
      content = <FlagIcon className="w-2/3 h-2/3 text-red-500" />;
    } else if (isRevealed) {
      if (bombType === 'horizontal') content = <HorizontalBombIcon className="w-3/4 h-3/4 text-orange-400" />;
      else if (bombType === 'vertical') content = <VerticalBombIcon className="w-3/4 h-3/4 text-orange-400" />;
      else if (isStairs) content = <StairsIcon className={`w-3/4 h-3/4 transition-colors duration-500 ${canPass ? 'text-green-400 cursor-pointer hover:scale-110' : 'text-slate-500'}`} />;
      else if (isCoin) content = <CircleDollarSignIcon className="w-3/4 h-3/4 text-yellow-400" />;
    }
    return (
      <div className={`${cellStyle.base} ${isRevealed ? cellStyle.revealed : cellStyle.hidden} relative`} onClick={() => handleCellClick(x, y)} onContextMenu={(e) => handleRightClick(e, x, y)}>
        <div className="absolute inset-0 flex items-center justify-center">{content}</div>
      </div>
    );
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-poppins">
      <div className={`w-full max-w-md sm:max-w-lg mx-auto transition-transform duration-100 ${isShaking ? 'animate-screen-shake' : ''}`}>
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
            Mine Adventurer
          </h1>
          <p className="text-slate-400 mt-2">
            Bom sẽ làm bạn mất <span className="text-orange-400 font-bold">{config.penalty} vàng</span>. Hãy cẩn thận!
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-2 text-xl">
                <BombIcon className="w-6 h-6 text-slate-400" />
                <span className="font-mono text-left">{TOTAL_BOMBS - flagsPlaced}</span>
            </div>
            <div className="flex items-center gap-2 text-xl justify-center">
                <CircleDollarSignIcon className="w-6 h-6 text-yellow-400" />
                <span className="font-mono text-left">{coinsOnThisLevel} / {config.coinsRequired}</span>
            </div>
            <div className="flex items-center gap-3 text-xl justify-end">
                <span className="font-mono text-slate-300">Tầng: {level}</span>
            </div>
        </div>

        <div className="relative">
          <div className="w-full aspect-square">
            <div 
              className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" 
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '5px' }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell) => (
                  <Cell key={`${rowIndex}-${cell.x}`} cellData={cell} />
                ))
              )}
            </div>
          </div>
          
           {levelCleared && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
                <AwardIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-400 mb-2">HOÀN THÀNH TẦNG {level}!</h2>
                <p className="text-slate-300">Bạn đã mở được lối đi đến tầng tiếp theo.</p>
                <p className="mt-4 text-lg">Tổng vàng tích lũy: <span className="font-bold text-yellow-400">{coinsTotal}</span></p>
                <button onClick={goToNextLevel} className="mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg">Đến Tầng {level + 1}</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
             <button onClick={resetGame} className="flex items-center gap-2 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                <RefreshCwIcon className="w-5 h-5" />
                <span>Bắt Đầu Lại</span>
            </button>
        </div>
        <footer className="mt-8 text-center text-slate-500 text-sm">Tạo bởi Gemini với React & Tailwind CSS.</footer>
      </div>
    </main>
  );
}

// --- Thêm Font và Style vào trang ---
const fontLink = document.createElement('link');
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);
const style = document.createElement('style');
style.innerHTML = `
  body { font-family: 'Poppins', sans-serif; }
  @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  @keyframes screen-shake {
    0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
  .animate-screen-shake { animation: screen-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
`;
document.head.appendChild(style);
