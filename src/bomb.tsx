import React, { useState, useEffect } from 'react';
import { Bomb, CircleDollarSign, Flag, RefreshCw, Award, XCircle } from 'lucide-react';

// --- Cấu hình game (phiên bản 6x6) ---
const BOARD_SIZE = 6;
const NUM_MINES = 5;
const NUM_COINS = 4;

// --- Component chính của ứng dụng ---
export default function App() {
  // --- State quản lý trạng thái game ---
  const [board, setBoard] = useState(() => createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [coinsFound, setCoinsFound] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);

  // --- Hàm khởi tạo bàn chơi ---
  function createBoard() {
    // 1. Tạo một bàn chơi trống
    const newBoard = Array(BOARD_SIZE).fill(null).map((_, rowIndex) =>
      Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
        x: colIndex,
        y: rowIndex,
        isMine: false,
        isCoin: false,
        isRevealed: false,
        isFlagged: false,
        neighboringMines: 0,
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

    // 3. Đặt Vàng ngẫu nhiên (ở những ô không có mìn)
    let coinsPlaced = 0;
    while (coinsPlaced < NUM_COINS) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[y][x].isMine && !newBoard[y][x].isCoin) {
        newBoard[y][x].isCoin = true;
        coinsPlaced++;
      }
    }

    // 4. Tính số mìn lân cận cho mỗi ô
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (newBoard[y][x].isMine) continue;
        let mineCount = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const newY = y + dy;
            const newX = x + dx;
            if (newY >= 0 && newY < BOARD_SIZE && newX >= 0 && newX < BOARD_SIZE && newBoard[newY][newX].isMine) {
              mineCount++;
            }
          }
        }
        newBoard[y][x].neighboringMines = mineCount;
      }
    }
    return newBoard;
  }

  // --- Xử lý khi người dùng click chuột trái vào một ô ---
  function handleCellClick(x, y) {
    if (gameOver || board[y][x].isRevealed || board[y][x].isFlagged) {
      return;
    }

    const newBoard = JSON.parse(JSON.stringify(board)); // Tạo bản sao sâu
    revealCell(newBoard, x, y);
    setBoard(newBoard);
  }

  // --- Hàm đệ quy để mở các ô (quan trọng) ---
  function revealCell(currentBoard, x, y) {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    const cell = currentBoard[y][x];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
      setGameOver(true);
      setGameWon(false);
      currentBoard.forEach(row => row.forEach(c => {
        if (c.isMine) c.isRevealed = true;
      }));
      return;
    }

    if (cell.isCoin) {
      setCoinsFound(prev => prev + 1);
    }
    
    if (cell.neighboringMines === 0 && !cell.isMine) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          revealCell(currentBoard, x + dx, y + dy);
        }
      }
    }
  }

  // --- Xử lý khi người dùng click chuột phải (đặt cờ) ---
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
  
  // --- Hàm chơi lại từ đầu ---
  function resetGame() {
    setBoard(createBoard());
    setGameOver(false);
    setGameWon(false);
    setCoinsFound(0);
    setFlagsPlaced(0);
  }

  // --- useEffect để kiểm tra điều kiện thắng ---
  useEffect(() => {
    if (gameOver) return;

    const revealedNonMineCells = board.flat().filter(cell => cell.isRevealed && !cell.isMine).length;
    const totalNonMineCells = (BOARD_SIZE * BOARD_SIZE) - NUM_MINES;

    if (revealedNonMineCells === totalNonMineCells) {
      setGameWon(true);
      setGameOver(true);
    }
  }, [board, gameOver]);

  // --- Component Cell (mỗi ô trên bàn chơi) ---
  const Cell = ({ cellData }) => {
    const { x, y, isRevealed, isMine, isCoin, isFlagged, neighboringMines } = cellData;

    const cellStyle = {
      base: 'w-full h-full flex items-center justify-center font-bold text-2xl rounded-lg transition-all duration-200',
      hidden: 'bg-slate-700 hover:bg-slate-600 cursor-pointer shadow-md',
      revealed: 'bg-slate-800/80 cursor-default border border-slate-700',
    };

    const numberColors = [
      '', 'text-blue-400', 'text-green-400', 'text-red-400',
      'text-purple-400', 'text-yellow-400', 'text-cyan-400',
      'text-orange-400', 'text-pink-400'
    ];

    let content = null;
    if (isFlagged) {
      content = <Flag className="w-2/3 h-2/3 text-red-500" />;
    } else if (isRevealed) {
      if (isMine) {
        content = <Bomb className="w-3/4 h-3/4 text-white animate-pulse" />;
      } else if (isCoin) {
        content = <CircleDollarSign className="w-3/4 h-3/4 text-yellow-400" />;
      } else if (neighboringMines > 0) {
        content = <span className={numberColors[neighboringMines]}>{neighboringMines}</span>;
      }
    }

    return (
      <div
        className={`${cellStyle.base} ${isRevealed ? cellStyle.revealed : cellStyle.hidden}`}
        onClick={() => handleCellClick(x, y)}
        onContextMenu={(e) => handleRightClick(e, x, y)}
      >
        {content}
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
          <p className="text-slate-400 mt-2">Tránh mìn và thu thập vàng!</p>
        </div>

        {/* Bảng điều khiển */}
        <div className="bg-slate-800/50 p-4 rounded-xl mb-6 shadow-lg border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3 text-2xl">
                <Bomb className="w-7 h-7 text-slate-400" />
                <span className="font-mono w-8 text-left">{NUM_MINES - flagsPlaced}</span>
            </div>
             <div className="flex items-center gap-3 text-2xl">
                <CircleDollarSign className="w-7 h-7 text-yellow-400" />
                <span className="font-mono w-8 text-left">{coinsFound}</span>
            </div>
            <button onClick={resetGame} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
                <RefreshCw className="w-6 h-6" />
            </button>
        </div>

        {/* Bàn chơi */}
        <div className="relative">
          {/* Vùng chứa này sẽ đảm bảo bàn cờ luôn là hình vuông */}
          <div className="w-full aspect-square">
            <div 
              className="grid h-full w-full p-1.5 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700" 
              style={{ 
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  gap: '6px', // Tăng khoảng cách để ô tách biệt
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell key={`${rowIndex}-${colIndex}`} cellData={cell} />
                ))
              )}
            </div>
          </div>
          
          {/* Lớp phủ khi game kết thúc */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
                {gameWon ? (
                  <>
                    <Award className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-green-400 mb-2">BẠN ĐÃ THẮNG!</h2>
                    <p className="text-slate-300">Bạn đã tìm thấy tất cả các ô an toàn.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
                    <p className="text-slate-300">Rất tiếc, bạn đã nhấn phải mìn.</p>
                  </>
                )}
                <p className="mt-4 text-lg">Số vàng thu được: <span className="font-bold text-yellow-400">{coinsFound}</span></p>
                <button 
                  onClick={resetGame}
                  className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Chơi lại
                </button>
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
