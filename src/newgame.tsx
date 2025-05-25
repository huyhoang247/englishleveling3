import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const BOARD_SIZE = 9;
const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#FACC15', '#A855F7', '#EC4899']; // Red, Blue, Green, Yellow, Purple, Pink
const BALLS_TO_ADD = 3;
const LINE_LENGTH_TO_CLEAR = 5;

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const initialBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

function App() {
  const [board, setBoard] = useState(initialBoard());
  const [score, setScore] = useState(0);
  const [selectedBall, setSelectedBall] = useState(null); // { r, c, color }
  const [nextBalls, setNextBalls] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Chọn một quả bóng để di chuyển.');

  const generateNextBallsPreview = useCallback(() => {
    const newNextBalls = [];
    for (let i = 0; i < BALLS_TO_ADD; i++) {
      newNextBalls.push(getRandomColor());
    }
    setNextBalls(newNextBalls);
  }, []);

  const getEmptyCells = useCallback((currentBoard) => {
    const empty = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!currentBoard[r][c]) {
          empty.push({ r, c });
        }
      }
    }
    return empty;
  }, []);

  const addBallsToBoard = useCallback((currentBoard, ballsArray) => {
    let newBoard = currentBoard.map(row => [...row]);
    const emptyCells = getEmptyCells(newBoard);
    let ballsPlacedCount = 0;
    const placedPositions = [];

    if (emptyCells.length === 0) {
      // Không còn ô trống để thêm bóng, có thể là game over
      return { updatedBoard: newBoard, ballsPlacedCount, allBallsPlaced: false, placedPositions };
    }

    for (let i = 0; i < ballsArray.length; i++) {
      if (emptyCells.length === 0) break; // Đảm bảo không cố thêm bóng nếu hết ô trống
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { r, c } = emptyCells.splice(randomIndex, 1)[0];
      newBoard[r][c] = ballsArray[i];
      placedPositions.push({r, c, color: ballsArray[i]});
      ballsPlacedCount++;
    }
    return { updatedBoard: newBoard, ballsPlacedCount, allBallsPlaced: ballsPlacedCount === ballsArray.length, placedPositions };
  }, [getEmptyCells]);


  const checkAndClearLines = useCallback((currentBoard, r_check, c_check, color_check) => {
    // Nếu không có màu tại vị trí kiểm tra (ví dụ: bóng vừa được thêm vào ô trống)
    // hoặc nếu màu không được cung cấp, thì không làm gì cả.
    const colorToMatch = color_check || currentBoard[r_check][c_check];
    if (!colorToMatch) return { newBoard: currentBoard, clearedCount: 0, linesFound: false };

    const directions = [
      { dr: 0, dc: 1 }, // Ngang
      { dr: 1, dc: 0 }, // Dọc
      { dr: 1, dc: 1 }, // Chéo \
      { dr: 1, dc: -1 }, // Chéo /
    ];
    let ballsToClear = new Set();
    let linesFoundThisCheck = false;

    // Luôn thêm bóng gốc (nếu có) vào danh sách kiểm tra hàng
    // Điều này quan trọng khi kiểm tra các bóng mới được thêm vào
    ballsToClear.add(`${r_check}-${c_check}`);


    directions.forEach(({ dr, dc }) => {
      let count = 1; // Bắt đầu với bóng tại (r_check, c_check)
      const currentLineBalls = [{ r: r_check, c: c_check }];

      // Kiểm tra theo một hướng
      for (let i = 1; i < BOARD_SIZE; i++) { // Tăng giới hạn để có thể tìm hàng dài hơn LINE_LENGTH_TO_CLEAR
        const nr = r_check + dr * i;
        const nc = c_check + dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] === colorToMatch) {
          count++;
          currentLineBalls.push({ r: nr, c: nc });
        } else {
          break;
        }
      }

      // Kiểm tra theo hướng ngược lại
      for (let i = 1; i < BOARD_SIZE; i++) {
        const nr = r_check - dr * i;
        const nc = c_check - dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] === colorToMatch) {
          count++;
          currentLineBalls.push({ r: nr, c: nc });
        } else {
          break;
        }
      }
      
      if (count >= LINE_LENGTH_TO_CLEAR) {
        linesFoundThisCheck = true;
        currentLineBalls.forEach(ball => ballsToClear.add(`${ball.r}-${ball.c}`));
      }
    });
    
    // Nếu không tìm thấy hàng nào chứa bóng (r_check, c_check) VÀ bóng đó thực sự tồn tại
    // thì xóa nó khỏi set ballsToClear (vì ban đầu ta đã thêm nó vào)
    // Điều này tránh xóa một bóng đơn lẻ nếu nó không thuộc về hàng nào.
    if (!linesFoundThisCheck && currentBoard[r_check][c_check]) {
        ballsToClear.delete(`${r_check}-${c_check}`);
    }


    if (ballsToClear.size >= LINE_LENGTH_TO_CLEAR) { // Chỉ xóa nếu tổng số bóng trong các hàng tìm được >= LINE_LENGTH_TO_CLEAR
      let newBoard = currentBoard.map(row => [...row]);
      let actualClearedCount = 0;
      ballsToClear.forEach(key => {
        const [row, col] = key.split('-').map(Number);
        if (newBoard[row][col] === colorToMatch) { // Chỉ xóa nếu màu khớp (quan trọng)
             newBoard[row][col] = null;
             actualClearedCount++;
        } else if (newBoard[row][col] === null && linesFoundThisCheck) {
            // Trường hợp này có thể xảy ra nếu một bóng là giao điểm của nhiều hàng
            // và đã được xóa bởi một hàng khác. Ta vẫn tính nó nếu linesFoundThisCheck là true.
            // Tuy nhiên, để đơn giản, ta chỉ đếm những bóng thực sự được đổi từ màu sang null.
        }
      });
      // Đảm bảo rằng chúng ta thực sự đã xóa ít nhất LINE_LENGTH_TO_CLEAR bóng CÙNG MÀU
      if (actualClearedCount >= LINE_LENGTH_TO_CLEAR) {
        return { newBoard, clearedCount: actualClearedCount, linesFound: true };
      } else {
        // Nếu không đủ số bóng cùng màu bị xóa (ví dụ: do lỗi logic hoặc giao điểm phức tạp)
        // thì coi như không có hàng nào được tạo thành từ vị trí này.
        return { newBoard: currentBoard, clearedCount: 0, linesFound: false };
      }
    }

    return { newBoard: currentBoard, clearedCount: 0, linesFound: false };
  }, []);
  
  const isPathPossible = useCallback((currentBoard, start, end) => {
    if (!currentBoard[start.r][start.c] || currentBoard[end.r][end.c]) return false; // Ô bắt đầu phải có bóng, ô kết thúc phải trống

    const queue = [{ ...start, path: [] }];
    const visited = new Set([`${start.r}-${start.c}`]);
    const directions = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }]; // Lên, Xuống, Trái, Phải

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.r === end.r && current.c === end.c) return true;

      for (const dir of directions) {
        const nr = current.r + dir.dr;
        const nc = current.c + dir.dc;
        const key = `${nr}-${nc}`;

        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited.has(key) && !currentBoard[nr][nc]) {
          visited.add(key);
          queue.push({ r: nr, c: nc, path: [...current.path, {r: nr, c: nc}] });
        }
      }
    }
    return false;
  }, []);

  const resetGame = useCallback(() => {
    const newBoardEmpty = initialBoard();
    // Thêm bóng ban đầu vào bảng
    const { updatedBoard: boardWithInitialBalls } = addBallsToBoard(newBoardEmpty, Array(BALLS_TO_ADD).fill(null).map(getRandomColor));
    
    setBoard(boardWithInitialBalls);
    setScore(0);
    setSelectedBall(null);
    generateNextBallsPreview();
    setGameOver(false);
    setMessage('Chọn một quả bóng để di chuyển.');
  }, [addBallsToBoard, generateNextBallsPreview]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);


  const handleCellClick = (r, c) => {
    if (gameOver) return;

    if (selectedBall) { // Đã chọn bóng
      if (r === selectedBall.r && c === selectedBall.c) { // Nhấn lại vào bóng đã chọn
        setSelectedBall(null);
        setMessage('Đã bỏ chọn. Hãy chọn một quả bóng.');
        return;
      }

      if (board[r][c]) { // Nhấn vào một ô đã có bóng khác
        setSelectedBall({ r, c, color: board[r][c] });
        setMessage('Đã chọn bóng mới. Chọn ô trống để di chuyển.');
        return;
      }

      // Nhấn vào ô trống -> thử di chuyển bóng
      if (isPathPossible(board, selectedBall, { r, c })) {
        let newBoard = board.map(row => [...row]);
        newBoard[r][c] = selectedBall.color; // Di chuyển bóng đến vị trí mới
        newBoard[selectedBall.r][selectedBall.c] = null; // Xóa bóng ở vị trí cũ
        
        const { newBoard: boardAfterPlayerMoveClear, clearedCount, linesFound } = checkAndClearLines(newBoard, r, c, selectedBall.color);
        
        if (linesFound) { // Nếu người chơi tạo được hàng
          setBoard(boardAfterPlayerMoveClear);
          setScore(prevScore => prevScore + clearedCount * 10);
          setSelectedBall(null);
          generateNextBallsPreview(); // Tạo bóng mới cho lượt sau
          setMessage(`Tuyệt vời! +${clearedCount * 10} điểm.`);
        } else { // Người chơi không tạo được hàng -> thêm bóng mới
          const { updatedBoard: boardWithNewBalls, allBallsPlaced, placedPositions } = addBallsToBoard(boardAfterPlayerMoveClear, nextBalls);
          let currentBoardState = boardWithNewBalls;
          let totalScoreFromNewBalls = 0;
          
          // Kiểm tra xem các bóng mới thêm vào có tạo thành hàng không
          let anyLinesFromNewBalls = false;
          for (const placed of placedPositions) {
            const {newBoard: boardAfterNewBallClear, clearedCount: newClearedCount, linesFound: newLinesFound} = checkAndClearLines(currentBoardState, placed.r, placed.c, placed.color);
            if (newLinesFound) {
              anyLinesFromNewBalls = true;
              currentBoardState = boardAfterNewBallClear;
              totalScoreFromNewBalls += newClearedCount * 10;
            }
          }
          
          setBoard(currentBoardState);
          if (anyLinesFromNewBalls) {
             setScore(prevScore => prevScore + totalScoreFromNewBalls);
             setMessage(`Bóng mới tạo thành hàng! +${totalScoreFromNewBalls} điểm.`);
          } else {
             setMessage('Di chuyển thành công. Đến lượt bóng mới.');
          }

          setSelectedBall(null);
          generateNextBallsPreview(); // Tạo bóng mới cho lượt sau (sau khi đã thêm bóng của lượt này)

          // Kiểm tra game over sau khi thêm bóng
          if (!allBallsPlaced || getEmptyCells(currentBoardState).length === 0) {
            // Kiểm tra lại một lần nữa xem có đường đi nào không
            const emptyCellsFinal = getEmptyCells(currentBoardState);
            const ballsOnBoardFinal = [];
            for(let i=0; i<BOARD_SIZE; i++){
                for(let j=0; j<BOARD_SIZE; j++){
                    if(currentBoardState[i][j]) ballsOnBoardFinal.push({r:i, c:j, color: currentBoardState[i][j]});
                }
            }
            let canMove = false;
            if(emptyCellsFinal.length > 0){
                for(const ball of ballsOnBoardFinal){
                    for(const empty of emptyCellsFinal){
                        if(isPathPossible(currentBoardState, ball, empty)){
                            canMove = true;
                            break;
                        }
                    }
                    if(canMove) break;
                }
            }

            if (!canMove && emptyCellsFinal.length < BALLS_TO_ADD && !allBallsPlaced) { // Điều kiện game over chặt chẽ hơn
                 setGameOver(true);
                 setMessage('Trò chơi kết thúc! Bảng đã đầy hoặc không còn nước đi.');
            } else if(emptyCellsFinal.length === 0) {
                setGameOver(true);
                setMessage('Trò chơi kết thúc! Bảng đã đầy.');
            }
          }
        }
      } else {
        setMessage('Không có đường đi! Chọn ô khác hoặc bóng khác.');
      }
    } else { // Chưa chọn bóng nào
      if (board[r][c]) { // Nhấn vào ô có bóng
        setSelectedBall({ r, c, color: board[r][c] });
        setMessage('Đã chọn bóng. Chọn ô trống để di chuyển.');
      } else { // Nhấn vào ô trống
        setMessage('Ô trống. Hãy chọn một quả bóng.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 text-white p-2 sm:p-4 font-sans">
      <div className="bg-slate-700 p-3 sm:p-6 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md">
        <header className="mb-4 sm:mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">Line 98 React</h1>
        </header>

        <div className="flex justify-between items-center mb-3 sm:mb-4 px-1 sm:px-2">
          <div>
            <span className="text-base sm:text-lg font-semibold text-gray-300">Điểm: </span>
            <span className="text-xl sm:text-2xl font-bold text-yellow-400">{score}</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 bg-pink-500 hover:bg-pink-600 rounded-lg shadow-md transition-colors duration-150 flex items-center text-sm sm:text-base"
            aria-label="Chơi lại"
          >
            <RefreshCw size={20} className="mr-1" /> Chơi lại
          </button>
        </div>

        <div className="mb-3 sm:mb-4 flex justify-center items-center space-x-1 sm:space-x-2 bg-slate-600 p-2 sm:p-3 rounded-lg">
          <span className="text-xs sm:text-sm text-gray-300">Sắp tới:</span>
          {nextBalls.map((color, index) => (
            <div
              key={index}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-inner"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        {gameOver && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-red-500/90 text-white text-center rounded-lg shadow-lg flex items-center justify-center">
            <AlertTriangle size={24} className="mr-2"/>
            <span className="text-lg sm:text-xl font-semibold">{message}</span>
          </div>
        )}
        {!gameOver && message && (
           <div className="my-2 sm:my-3 p-2 sm:p-3 bg-sky-600/90 text-white text-xs sm:text-sm text-center rounded-lg shadow">
            {message}
          </div>
        )}

        {/* Bảng game */}
        <main className="grid grid-cols-9 gap-[2px] sm:gap-1 bg-slate-900 p-1 sm:p-2 rounded-lg shadow-inner w-full">
          {board.map((row, rIndex) =>
            row.map((cellColor, cIndex) => (
              <div
                key={`${rIndex}-${cIndex}`}
                className={`aspect-square flex items-center justify-center rounded-sm sm:rounded-md cursor-pointer transition-all duration-150
                           ${selectedBall && selectedBall.r === rIndex && selectedBall.c === cIndex ? 'bg-slate-500 scale-105 ring-2 ring-cyan-400' : 'bg-slate-800 hover:bg-slate-700'}`}
                onClick={() => handleCellClick(rIndex, cIndex)}
              >
                {cellColor && (
                  <div
                    className="w-[70%] h-[70%] sm:w-[75%] sm:h-[75%] rounded-full shadow-md sm:shadow-lg transition-transform duration-200 ease-out"
                    style={{ backgroundColor: cellColor, transform: selectedBall && selectedBall.r === rIndex && selectedBall.c === cIndex ? 'scale(0.9)' : 'scale(1)' }}
                  />
                )}
              </div>
            ))
          )}
        </main>
        <footer className="mt-4 sm:mt-6 text-center text-xs text-gray-400">
          <p>Một phiên bản Line 98 được tạo bằng React và Tailwind CSS.</p>
          <p>Cải thiện cho di động.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
