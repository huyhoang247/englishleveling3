import React, { useState, useEffect } from 'react';

// --- Các component Icon SVG thay thế cho lucide-react ---
// (Giữ nguyên các icon cũ)
const BombIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="13" r="9" /><path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.4 2.4 0 0 0-3.4 0l-1.8 1.8" /><path d="m22 2-1.5 1.5" /><path d="M13 13h-2" /><path d="M13 13v-2" /><path d="m13 13 2.1-2.1" />
    </svg>
  );
  
  const CircleDollarSignIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" />
    </svg>
  );
  
  const FlagIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
  
  const RefreshCwIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
    </svg>
  );
  
  const XCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
  );

// --- THAY ĐỔI: Thêm icon mới cho Lối thoát và Tầng ---
const StairsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 2H12l-2.5 2.5L5 9l-3 3v10h10v-5l4-4 4-4-2-2z"/><path d="m16 14-4 4v-5"/><path d="m6 14 4-4H5"/>
    </svg>
);

const TrophyIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.87 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.13 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
);


// --- Cấu hình game (phiên bản 6x6) ---
const BOARD_SIZE = 6;
const NUM_MINES = 5;
const NUM_COINS = 4;

// --- Component chính của ứng dụng ---
export default function App() {
  // --- THAY ĐỔI: Thêm State quản lý tầng và hộp thoại xác nhận ---
  const [currentFloor, setCurrentFloor] = useState(1);
  const [board, setBoard] = useState(() => createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [coinsFound, setCoinsFound] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // --- THAY ĐỔI: Cập nhật hàm khởi tạo bàn chơi để thêm lối thoát ---
  function createBoard() {
    // 1. Tạo một bàn chơi trống với thuộc tính isExit
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) =>
      Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
        x: colIndex,
        y: rowIndex,
        isMine: false,
        isCoin: false,
        isExit: false, // Thêm thuộc tính mới
        isRevealed: false,
        isFlagged: false,
      }))
    );

    // 2. Đặt Mìn ngẫu nhiên
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[y][x].isMine) {
        newBoard[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // 3. Đặt Vàng ngẫu nhiên
    let coinsPlaced = 0;
    while (coinsPlaced < NUM_COINS) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[y][x].isMine && !newBoard[y][x].isCoin) {
        newBoard[y][x].isCoin = true;
        coinsPlaced++;
      }
    }

    // 4. Đặt Lối thoát ngẫu nhiên (ở ô không có mìn và vàng)
    let exitPlaced = false;
    while (!exitPlaced) {
        const x = Math.floor(Math.random() * BOARD_SIZE);
        const y = Math.floor(Math.random() * BOARD_SIZE);
        if (!newBoard[y][x].isMine && !newBoard[y][x].isCoin) {
            newBoard[y][x].isExit = true;
            exitPlaced = true;
        }
    }

    return newBoard;
  }

  // --- THAY ĐỔI: Cập nhật xử lý click để nhận biết ô lối thoát đã mở ---
  function handleCellClick(x, y) {
    const cell = board[y][x];

    if (gameOver || cell.isFlagged) {
      return;
    }

    // Nếu click vào ô lối thoát đã được mở, hiển thị hộp thoại xác nhận
    if (cell.isRevealed && cell.isExit) {
        setShowExitConfirmation(true);
        return;
    }

    // Nếu ô chưa mở, tiến hành mở ô
    if (!cell.isRevealed) {
        const newBoard = JSON.parse(JSON.stringify(board));
        revealCell(newBoard, x, y);
        setBoard(newBoard);
    }
  }

  // Hàm mở ô, không thay đổi logic bên trong
  function revealCell(currentBoard, x, y) {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    const cell = currentBoard[y][x];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
      setGameOver(true);
      currentBoard.forEach(row => row.forEach(c => {
        if (c.isMine) c.isRevealed = true;
      }));
      return;
    }

    if (cell.isCoin) {
      setCoinsFound(prev => prev + 1);
    }
  }

  // Xử lý cắm cờ, không thay đổi
  function handleRightClick(e, x, y) {
    e.preventDefault();
    if (gameOver || board[y][x].isRevealed) {
      return;
    }
    const newBoard = JSON.parse(JSON.stringify(board));
    const cell = newBoard[y][x];
    if (!cell.isFlagged && flagsPlaced < NUM_MINES) {
        cell.isFlagged = true;
        setFlagsPlaced(prev => prev + 1);
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        setFlagsPlaced(prev => prev - 1);
    }
    setBoard(newBoard);
  }
  
  // --- THAY ĐỔI: Các hàm xử lý lên tầng và chơi lại ---
  function goToNextFloor() {
    setCurrentFloor(prev => prev + 1);
    setBoard(createBoard());
    setGameOver(false);
    setFlagsPlaced(0);
    setShowExitConfirmation(false);
  }
  
  function resetGame() {
    setCurrentFloor(1);
    setCoinsFound(0);
    setBoard(createBoard());
    setGameOver(false);
    setFlagsPlaced(0);
    setShowExitConfirmation(false);
  }

  // --- THAY ĐỔI: Loại bỏ useEffect kiểm tra thắng, vì game giờ là vô tận ---
  // useEffect(() => { ... });

  // --- Component Cell (mỗi ô trên bàn chơi) ---
  const Cell = ({ cellData }) => {
    const { x, y, isRevealed, isMine, isCoin, isFlagged, isExit } = cellData;

    // --- THAY ĐỔI: Thêm style cho ô lối thoát
    const cellStyle = {
      base: 'w-full h-full rounded-lg transition-all duration-200',
      hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md',
      revealed: 'bg-slate-800/80 cursor-default border border-slate-700',
      // Thêm style riêng cho ô lối thoát khi đã mở để khuyến khích click
      exitRevealed: 'bg-green-800/50 hover:bg-green-700/60 cursor-pointer border border-green-600'
    };
    
    let content = null;
    let specificCellStyle = '';

    if (isFlagged) {
      content = <FlagIcon className="w-2/3 h-2/3 text-red-500" />;
    } else if (isRevealed) {
      if (isMine) {
        content = <BombIcon className="w-3/4 h-3/4 text-white animate-pulse" />;
      } else if (isExit) {
        content = <StairsIcon className="w-3/4 h-3/4 text-green-400" />;
        specificCellStyle = cellStyle.exitRevealed; // Áp dụng style riêng
      } else if (isCoin) {
        content = <CircleDollarSignIcon className="w-3/4 h-3/4 text-yellow-400" />;
      }
    }

    return (
      <div
        className={`${cellStyle.base} ${isRevealed ? (specificCellStyle || cellStyle.revealed) : cellStyle.hidden} relative`}
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
      <div className="w-full max-w-xs sm:max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
            Minesweeper
          </h1>
          <p className="text-slate-400 mt-2">Lên tầng cao nhất có thể!</p>
        </div>

        {/* --- THAY ĐỔI: Cập nhật Bảng điều khiển để hiển thị tầng --- */}
        <div className="bg-slate-800/50 p-3 sm:p-4 rounded-xl mb-6 shadow-lg border border-slate-700 grid grid-cols-4 items-center gap-2">
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center">
                <BombIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
                <span className="font-mono w-8 text-left">{NUM_MINES - flagsPlaced}</span>
            </div>
             <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center">
                <CircleDollarSignIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                <span className="font-mono w-8 text-left">{coinsFound}</span>
            </div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl justify-center">
                <TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                <span className="font-mono w-8 text-left">{currentFloor}</span>
            </div>
            <div className="flex justify-center">
                <button onClick={resetGame} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
                    <RefreshCwIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Bàn chơi */}
        <div className="relative">
          <div className="w-full aspect-square">
            <div 
              className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" 
              style={{ 
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  gap: '6px',
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell key={`${rowIndex}-${colIndex}`} cellData={cell} />
                ))
              )}
            </div>
          </div>
          
          {/* --- THAY ĐỔI: Lớp phủ GAME OVER chỉ có một trường hợp thua --- */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
                    <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
                    <p className="text-slate-300">Rất tiếc, bạn đã nhấn phải mìn.</p>
                    <p className="mt-4 text-lg">Bạn đã lên tới tầng: <span className="font-bold text-blue-400">{currentFloor}</span></p>
                    <p className="mt-1 text-lg">Số vàng thu được: <span className="font-bold text-yellow-400">{coinsFound}</span></p>
                <button 
                  onClick={resetGame}
                  className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Chơi lại
                </button>
              </div>
            </div>
          )}

          {/* --- THAY ĐỔI: Lớp phủ xác nhận lên tầng --- */}
          {showExitConfirmation && (
             <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
             <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
                   <StairsIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                   <h2 className="text-3xl font-bold text-green-400 mb-2">LÊN TẦNG TIẾP THEO?</h2>
                   <p className="text-slate-300">Bạn có muốn tiến lên tầng {currentFloor + 1} không?</p>
                   <p className="text-slate-400 text-sm mt-1">Bạn vẫn có thể ở lại để tìm thêm vàng.</p>
               <div className="mt-6 flex justify-center gap-4">
                <button 
                    onClick={() => setShowExitConfirmation(false)}
                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                    Ở lại
                </button>
                <button 
                 onClick={goToNextFloor}
                 className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                 Lên tầng
               </button>
               </div>
             </div>
           </div>
          )}
        </div>

        <footer className="mt-8 text-center text-slate-500 text-sm">
          Tạo bởi Gemini với React & Tailwind CSS.
        </footer>
      </div>
    </main>
  );
}

// Thêm Font và Style vào trang (Không đổi)
const fontLink = document.createElement('link');
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);
const style = document.createElement('style');
style.innerHTML = `body{font-family:'Poppins',sans-serif}@keyframes fade-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}.animate-fade-in{animation:fade-in .4s cubic-bezier(.25,.46,.45,.94) forwards}`;
document.head.appendChild(style);
