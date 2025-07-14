import React, { useState, useEffect } from 'react';

// --- Các component Icon SVG thay thế cho lucide-react ---
const BombIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="13" r="9" /><path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.4 2.4 0 0 0-3.4 0l-1.8 1.8" /><path d="m22 2-1.5 1.5" /><path d="M13 13h-2" /><path d="M13 13v-2" /><path d="m13 13 2.1-2.1" /></svg>
);
const CircleDollarSignIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
);
const FlagIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>
);
const RefreshCwIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
const AwardIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
);
const XCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
);
const StairsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 2H14" /><path d="M20 4v2" /><path d="M18 6v2" /><path d="M16 8v2" /><path d="M14 10v2" /><path d="M12 12v2" /><path d="M10 14v2" /><path d="M8 16v2" /><path d="M6 18v2" /><path d="M4 20v2" /><path d="M2 22h8" /></svg>
);


// --- Cấu hình game ---
const getLevelConfig = (level) => {
    return {
        size: Math.min(10, 5 + level), // Kích thước tối đa là 10x10
        mines: Math.min(20, 4 + level * 2), // Số mìn tối đa là 20
        coins: Math.min(15, 3 + level),    // Số vàng tối đa là 15
    };
};

// --- Component chính của ứng dụng ---
export default function App() {
  const [level, setLevel] = useState(1);
  const [config, setConfig] = useState(() => getLevelConfig(level));
  const [board, setBoard] = useState(() => createBoard(level));
  const [gameOver, setGameOver] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [coinsFound, setCoinsFound] = useState(0); // Vàng được cộng dồn
  const [flagsPlaced, setFlagsPlaced] = useState(0);

  // --- Hàm khởi tạo bàn chơi ---
  function createBoard(currentLevel) {
    const { size, mines, coins } = getLevelConfig(currentLevel);
    
    const newBoard = Array(size).fill(null).map((_, rowIndex) =>
      Array(size).fill(null).map((_, colIndex) => ({
        x: colIndex,
        y: rowIndex,
        isMine: false,
        isCoin: false,
        isStairs: false,
        isRevealed: false,
        isFlagged: false,
      }))
    );

    // Đặt Mìn
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (!newBoard[y][x].isMine) {
        newBoard[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Đặt Vàng
    let coinsPlaced = 0;
    while (coinsPlaced < coins) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (!newBoard[y][x].isMine && !newBoard[y][x].isCoin) {
        newBoard[y][x].isCoin = true;
        coinsPlaced++;
      }
    }

    // Đặt Cầu thang
    let stairsPlaced = false;
    while (!stairsPlaced) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if (!newBoard[y][x].isMine && !newBoard[y][x].isCoin) {
            newBoard[y][x].isStairs = true;
            stairsPlaced = true;
        }
    }

    return newBoard;
  }

  // --- Xử lý click chuột trái ---
  function handleCellClick(x, y) {
    if (gameOver || levelCleared || board[y][x].isRevealed || board[y][x].isFlagged) {
      return;
    }
    const newBoard = JSON.parse(JSON.stringify(board));
    revealCell(newBoard, x, y);
    setBoard(newBoard);
  }
  
  // --- Hàm đệ quy để mở ô ---
  function revealCell(currentBoard, x, y) {
    const { size } = config;
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const cell = currentBoard[y][x];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
        setGameOver(true);
        triggerBombExplosion(currentBoard, x, y);
        return;
    }

    if (cell.isStairs) {
        setLevelCleared(true);
        return;
    }

    if (cell.isCoin) {
        setCoinsFound(prev => prev + 1);
    }
    
    // Mở rộng các ô xung quanh nếu ô hiện tại là ô trống (không phải coin/stairs)
    if(!cell.isCoin) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                // Thêm độ trễ để tạo hiệu ứng lan tỏa
                setTimeout(() => revealCell(currentBoard, x + dx, y + dy), 20);
            }
        }
    }
  }

  // --- Hàm kích hoạt nổ bom ---
  function triggerBombExplosion(currentBoard, x, y) {
    const { size } = config;
    // Tiết lộ tất cả các quả bom khác
    currentBoard.forEach(row => row.forEach(c => {
        if (c.isMine) c.isRevealed = true;
    }));

    // Gây nổ ngẫu nhiên các ô xung quanh
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const newY = y + dy;
            const newX = x + dx;
            if (newY >= 0 && newY < size && newX >= 0 && newX < size) {
                // Tỷ lệ 50% kích nổ ô lân cận
                if (Math.random() < 0.5 && !currentBoard[newY][newX].isRevealed) {
                    revealCell(currentBoard, newX, newY);
                }
            }
        }
    }
  }

  // --- Xử lý click chuột phải (đặt cờ) ---
  function handleRightClick(e, x, y) {
    e.preventDefault();
    if (gameOver || levelCleared || board[y][x].isRevealed) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const cell = newBoard[y][x];
    
    if (!cell.isFlagged && flagsPlaced < config.mines) {
        cell.isFlagged = true;
        setFlagsPlaced(prev => prev + 1);
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        setFlagsPlaced(prev => prev - 1);
    }
    
    setBoard(newBoard);
  }
  
  // --- Hàm chơi lại từ đầu ---
  function resetGame() {
    const initialLevel = 1;
    setLevel(initialLevel);
    setConfig(getLevelConfig(initialLevel));
    setBoard(createBoard(initialLevel));
    setGameOver(false);
    setLevelCleared(false);
    setCoinsFound(0);
    setFlagsPlaced(0);
  }

  // --- Hàm qua tầng mới ---
  function goToNextLevel() {
    const newLevel = level + 1;
    setLevel(newLevel);
    setConfig(getLevelConfig(newLevel));
    setBoard(createBoard(newLevel));
    setGameOver(false);
    setLevelCleared(false);
    setFlagsPlaced(0);
    // Số vàng (coinsFound) được giữ lại
  }

  // --- Component Cell (mỗi ô trên bàn chơi) ---
  const Cell = ({ cellData }) => {
    const { x, y, isRevealed, isMine, isCoin, isFlagged, isStairs } = cellData;

    const cellStyle = {
      base: 'w-full h-full rounded-lg transition-all duration-200',
      hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md',
      revealed: 'bg-slate-800/80 cursor-default border border-slate-700',
    };

    let content = null;
    if (isFlagged) {
      content = <FlagIcon className="w-2/3 h-2/3 text-red-500" />;
    } else if (isRevealed) {
      if (isMine) {
        content = <BombIcon className="w-3/4 h-3/4 text-white animate-pulse" />;
      } else if (isStairs) {
        content = <StairsIcon className="w-3/4 h-3/4 text-green-400" />
      } else if (isCoin) {
        content = <CircleDollarSignIcon className="w-3/4 h-3/4 text-yellow-400" />;
      }
    }

    return (
      <div
        className={`${cellStyle.base} ${isRevealed ? cellStyle.revealed : cellStyle.hidden} relative`}
        onClick={() => handleCellClick(x, y)}
        onContextMenu={(e) => handleRightClick(e, x, y)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
            {content}
        </div>
      </div>
    );
  };

  // --- Giao diện chính ---
  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-md sm:max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
            Mine Adventurer
          </h1>
          <p className="text-slate-400 mt-2">Đào vàng, né mìn và tìm lối thoát!</p>
        </div>

        {/* Bảng điều khiển */}
        <div className="bg-slate-800/50 p-4 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3 text-2xl">
                <BombIcon className="w-7 h-7 text-slate-400" />
                <span className="font-mono w-8 text-left">{config.mines - flagsPlaced}</span>
            </div>
            <div className="flex items-center gap-3 text-2xl justify-center">
                <CircleDollarSignIcon className="w-7 h-7 text-yellow-400" />
                <span className="font-mono w-8 text-left">{coinsFound}</span>
            </div>
            <div className="flex items-center gap-3 text-2xl justify-end">
                <span className="font-mono text-lg text-slate-400">Tầng: {level}</span>
            </div>
        </div>

        {/* Bàn chơi */}
        <div className="relative">
          <div className="w-full aspect-square">
            <div 
              className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" 
              style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)`, gap: '5px' }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell key={`${rowIndex}-${colIndex}`} cellData={cell} />
                ))
              )}
            </div>
          </div>
          
          {/* Lớp phủ khi Game Over */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
                <p className="text-slate-300">Rất tiếc, bạn đã nhấn phải mìn.</p>
                <p className="mt-4 text-lg">Bạn đã đến <span className="font-bold text-blue-400">Tầng {level}</span></p>
                <p className="text-lg">Tổng vàng: <span className="font-bold text-yellow-400">{coinsFound}</span></p>
                <button onClick={resetGame} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                  Chơi lại
                </button>
              </div>
            </div>
          )}

           {/* Lớp phủ khi Qua Tầng */}
           {levelCleared && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
                <AwardIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-400 mb-2">QUA TẦNG!</h2>
                <p className="text-slate-300">Bạn đã tìm thấy lối đi đến tầng tiếp theo.</p>
                <p className="mt-4 text-lg">Tổng vàng hiện tại: <span className="font-bold text-yellow-400">{coinsFound}</span></p>
                <button onClick={goToNextLevel} className="mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                  Tầng Tiếp Theo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
             <button onClick={resetGame} className="flex items-center gap-2 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                <RefreshCwIcon className="w-5 h-5" />
                <span>Chơi Lại Từ Đầu</span>
            </button>
        </div>

        <footer className="mt-8 text-center text-slate-500 text-sm">
          Tạo bởi Gemini với React & Tailwind CSS.
        </footer>
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
  body {
    font-family: 'Poppins', sans-serif;
  }
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
`;
document.head.appendChild(style);
