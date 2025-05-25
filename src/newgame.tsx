import React, { useReducer } from 'react';

// Constants
const BOARD_SIZE = 9;
const COLORS = ['#EF4444', '#3B82F6', '#22C5E0', '#FACC15', '#A855F7', '#EC4899']; // Red, Blue, Cyan, Yellow, Purple, Pink
const BALLS_TO_ADD = 3;
const LINE_LENGTH_TO_CLEAR = 5;

// --- Type Definitions ---
interface CellPosition {
  r: number;
  c: number;
}

interface Ball extends CellPosition {
  color: string;
}

type Board = (string | null)[][];

interface GameState {
  board: Board;
  score: number;
  selectedBall: Ball | null;
  nextBalls: string[];
  gameOver: boolean;
  message: string;
  isPlayerTurn: boolean;
}

type GameAction =
  | { type: 'CELL_CLICK'; payload: CellPosition }
  | { type: 'RESET_GAME' };

// --- Utility Functions ---
const getRandomColor = (): string => COLORS[Math.floor(Math.random() * COLORS.length)];

const createInitialBoard = (): Board => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

const getEmptyCells = (board: Board): CellPosition[] => {
  const empty: CellPosition[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c]) {
        empty.push({ r, c });
      }
    }
  }
  return empty;
};

// --- Game Logic Functions ---

const isPathPossible = (board: Board, start: CellPosition, end: CellPosition): boolean => {
  // Ensure start has a ball and end is empty for a valid move path check.
  // The actual placement logic will handle if end already has a ball (re-selection).
  if (!board[start.r][start.c] || board[end.r][end.c]) return false;


  const queue: CellPosition[] = [{ r: start.r, c: start.c }];
  const visited = new Set<string>([`${start.r}-${start.c}`]);
  const directions = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    // Path found if current reaches end. The end cell itself is allowed to be the destination.
    if (current.r === end.r && current.c === end.c) return true;

    for (const dir of directions) {
      const nr = current.r + dir.dr;
      const nc = current.c + dir.dc;
      const key = `${nr}-${nc}`;

      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited.has(key)) {
        // Path can go through an empty cell OR the destination cell itself
        if (!board[nr][nc] || (nr === end.r && nc === end.c)) {
          visited.add(key);
          queue.push({ r: nr, c: nc });
        }
      }
    }
  }
  return false;
};

const checkAndClearLinesForPoints = (
  board: Board,
  checkPositions: CellPosition[],
): { newBoard: Board; clearedCount: number; linesFound: boolean } => {
  let newBoard = board.map(row => [...row]);
  let totalClearedCount = 0;
  let anyLinesFound = false;
  const ballsToClearGlobal = new Set<string>();

  const directions = [
    { dr: 0, dc: 1 }, { dr: 1, dc: 0 },
    { dr: 1, dc: 1 }, { dr: 1, dc: -1 }
  ];

  for (const { r: r_check, c: c_check } of checkPositions) {
    const colorToMatch = newBoard[r_check]?.[c_check];
    if (!colorToMatch) continue;

    directions.forEach(({ dr, dc }) => {
      let lineInDirection = 0;
      const tempLine: CellPosition[] = [];
      // Positive pass
      for(let i = 0; i < BOARD_SIZE; i++){
        const r = r_check + dr * i;
        const c = c_check + dc * i;
        if(r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newBoard[r][c] === colorToMatch){
          tempLine.push({r,c});
          lineInDirection++;
        } else break;
      }
      // Negative pass (excluding start point)
      for(let i = 1; i < BOARD_SIZE; i++){
        const r = r_check - dr * i;
        const c = c_check - dc * i;
        if(r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newBoard[r][c] === colorToMatch){
          tempLine.push({r,c});
          lineInDirection++;
        } else break;
      }

      if (lineInDirection >= LINE_LENGTH_TO_CLEAR) {
        anyLinesFound = true;
        tempLine.forEach(ball => ballsToClearGlobal.add(`${ball.r}-${ball.c}`));
      }
    });
  }
  
  if (anyLinesFound) {
    ballsToClearGlobal.forEach(key => {
      const [row, col] = key.split('-').map(Number);
      if (newBoard[row][col]) {
          newBoard[row][col] = null;
          totalClearedCount++;
      }
    });
    return { newBoard, clearedCount: totalClearedCount, linesFound: true };
  }

  return { newBoard: board, clearedCount: 0, linesFound: false };
};


const addBallsToBoard = (
  currentBoard: Board,
  ballsArray: string[]
): { updatedBoard: Board; ballsPlacedCount: number; allBallsPlaced: boolean; placedPositions: Ball[] } => {
  let newBoard = currentBoard.map(row => [...row]);
  const emptyCells = getEmptyCells(newBoard);
  let ballsPlacedCount = 0;
  const placedPositions: Ball[] = [];

  if (emptyCells.length === 0) {
    return { updatedBoard: newBoard, ballsPlacedCount, allBallsPlaced: false, placedPositions };
  }

  for (let i = 0; i < ballsArray.length; i++) {
    if (emptyCells.length === 0) break;
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { r, c } = emptyCells.splice(randomIndex, 1)[0];
    newBoard[r][c] = ballsArray[i];
    placedPositions.push({ r, c, color: ballsArray[i] });
    ballsPlacedCount++;
  }
  return { updatedBoard: newBoard, ballsPlacedCount, allBallsPlaced: ballsPlacedCount === ballsArray.length, placedPositions };
};

const generateNextBalls = (): string[] => {
  return Array(BALLS_TO_ADD).fill(null).map(getRandomColor);
};

// --- Reducer ---
const initialStateFactory = (): GameState => {
  const initialEmptyBoard = createInitialBoard();
  const firstBalls = generateNextBalls(); // Generate first set of balls to add
  const { updatedBoard: boardWithInitialBalls } = addBallsToBoard(initialEmptyBoard, firstBalls);
  
  return {
    board: boardWithInitialBalls,
    score: 0,
    selectedBall: null,
    nextBalls: generateNextBalls(), // Preview for the *next* turn
    gameOver: false,
    message: 'Chọn một quả bóng để di chuyển.',
    isPlayerTurn: true,
  };
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET_GAME':
      return initialStateFactory();

    case 'CELL_CLICK': {
      if (state.gameOver || !state.isPlayerTurn) return state;
      const { r, c } = action.payload;

      if (state.selectedBall) {
        if (state.selectedBall.r === r && state.selectedBall.c === c) {
          return { ...state, selectedBall: null, message: 'Đã bỏ chọn. Chọn một quả bóng.' };
        }
        if (state.board[r][c]) {
          return { ...state, selectedBall: { r, c, color: state.board[r][c]! }, message: 'Đã chọn bóng mới. Chọn ô trống để di chuyển.' };
        }

        if (isPathPossible(state.board, state.selectedBall, { r, c })) {
          let newBoard = state.board.map(row => [...row]);
          newBoard[r][c] = state.selectedBall.color;
          newBoard[state.selectedBall.r][state.selectedBall.c] = null;

          const { newBoard: boardAfterPlayerMoveClear, clearedCount, linesFound } = 
            checkAndClearLinesForPoints(newBoard, [{r, c, color: state.selectedBall.color}]);

          if (linesFound) {
            return {
              ...state,
              board: boardAfterPlayerMoveClear,
              score: state.score + clearedCount * 10,
              selectedBall: null,
              nextBalls: generateNextBalls(),
              message: `Tuyệt vời! +${clearedCount * 10} điểm.`,
              isPlayerTurn: true, 
            };
          } else {
            const { updatedBoard: boardWithNewBalls, allBallsPlaced, placedPositions } = 
              addBallsToBoard(boardAfterPlayerMoveClear, state.nextBalls);
            
            const { newBoard: boardAfterNewBallsClear, clearedCount: newBallsClearedCount, linesFound: newBallsLinesFound } =
              checkAndClearLinesForPoints(boardWithNewBalls, placedPositions);

            let currentScore = state.score;
            let currentMessage = 'Di chuyển thành công. Đến lượt bóng mới.';
            if (newBallsLinesFound) {
                currentScore += newBallsClearedCount * 10;
                currentMessage = `Bóng mới tạo thành hàng! +${newBallsClearedCount * 10} điểm.`;
            }
            
            const nextGeneratedBalls = generateNextBalls();
            const finalBoardState = boardAfterNewBallsClear;
            const finalEmptyCells = getEmptyCells(finalBoardState);
            let isGameOver = false;
            let gameOverMessage = '';

            if (!allBallsPlaced && finalEmptyCells.length < BALLS_TO_ADD - (BALLS_TO_ADD - placedPositions.length)) {
                // This condition means not all balls from nextBalls could be placed
                // and the remaining empty cells are fewer than what was needed.
                isGameOver = true;
                gameOverMessage = 'Trò chơi kết thúc! Bảng gần đầy, không thể thêm bóng.';
            } else if (finalEmptyCells.length === 0) {
                isGameOver = true;
                gameOverMessage = 'Trò chơi kết thúc! Bảng đã đầy.';
            }
            
            if (!isGameOver) {
                let canMove = false;
                const ballsOnBoard: Ball[] = [];
                for(let i=0; i<BOARD_SIZE; i++){
                    for(let j=0; j<BOARD_SIZE; j++){
                        if(finalBoardState[i][j]) ballsOnBoard.push({r:i, c:j, color: finalBoardState[i][j]!});
                    }
                }
                if(finalEmptyCells.length > 0 && ballsOnBoard.length > 0){
                    for(const ball of ballsOnBoard){
                        for(const empty of finalEmptyCells){
                            // Check path from ball to empty cell (target for move)
                            if(isPathPossible(finalBoardState, ball, empty)){
                                canMove = true;
                                break;
                            }
                        }
                        if(canMove) break;
                    }
                } else if (ballsOnBoard.length === 0 && finalEmptyCells.length > 0) {
                    // Board is not full but has no balls to move (edge case after massive clear)
                    canMove = true; // Game continues, new balls will be added.
                } else if (finalEmptyCells.length === 0) {
                    // No empty cells already covered by isGameOver = true
                }


                if (!canMove && ballsOnBoard.length > 0) { // Only game over if there are balls but none can move
                    isGameOver = true;
                    gameOverMessage = 'Trò chơi kết thúc! Không còn nước đi nào.';
                }
            }

            return {
              ...state,
              board: finalBoardState,
              score: currentScore,
              selectedBall: null,
              nextBalls: nextGeneratedBalls,
              message: isGameOver ? gameOverMessage : currentMessage,
              gameOver: isGameOver,
              isPlayerTurn: !isGameOver,
            };
          }
        } else {
          return { ...state, message: 'Không có đường đi! Chọn ô khác hoặc bóng khác.' };
        }
      } else {
        if (state.board[r][c]) {
          return { ...state, selectedBall: { r, c, color: state.board[r][c]! }, message: 'Đã chọn bóng. Chọn ô trống để di chuyển.' };
        } else {
          return { ...state, message: 'Ô trống. Hãy chọn một quả bóng.' };
        }
      }
    }
    default:
      // https://github.com/microsoft/TypeScript/issues/13499
      const exhaustiveCheck: never = action;
      return state;
  }
}

// --- Component ---
function App() {
  const [gameState, dispatch] = useReducer(gameReducer, undefined, initialStateFactory);
  const { board, score, selectedBall, nextBalls, gameOver, message } = gameState;

  const handleCellClick = (r: number, c: number) => {
    dispatch({ type: 'CELL_CLICK', payload: { r, c } });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-2 sm:p-4 font-sans antialiased">
      <div className="bg-slate-800 p-3 sm:p-6 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md">
        <header className="mb-4 sm:mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-tight">Line 98 Deluxe</h1>
        </header>

        <div className="flex justify-between items-center mb-3 sm:mb-4 px-1 sm:px-2">
          <div>
            <span className="text-base sm:text-lg font-semibold text-gray-300">Điểm: </span>
            <span className="text-xl sm:text-2xl font-bold text-yellow-400 transition-all duration-300">{score}</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 rounded-lg shadow-md transition-colors duration-150 flex items-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75"
            aria-label="Chơi lại"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.76 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.76-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            Chơi lại
          </button>
        </div>

        <div className="mb-3 sm:mb-4 flex justify-center items-center space-x-1.5 sm:space-x-2 bg-slate-700 p-2 sm:p-3 rounded-lg">
          <span className="text-xs sm:text-sm text-gray-300 mr-1">Sắp tới:</span>
          {nextBalls.map((color, index) => (
            <div
              key={index}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-inner border-2 border-slate-600"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        <div aria-live="polite" aria-atomic="true" className="min-h-[60px] sm:min-h-[76px] flex items-center justify-center">
            {gameOver && (
            <div className="my-3 sm:my-4 p-3 sm:p-4 bg-red-600/90 text-white text-center rounded-lg shadow-lg flex items-center justify-center w-full animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-base sm:text-lg font-semibold">{message}</span>
            </div>
            )}
            {!gameOver && message && (
            <div className="my-2 sm:my-3 p-2 sm:p-3 bg-sky-700/90 text-white text-xs sm:text-sm text-center rounded-lg shadow w-full animate-fadeIn">
                {message}
            </div>
            )}
        </div>

        <main className="grid grid-cols-9 gap-[3px] sm:gap-1 bg-slate-900/80 p-1.5 sm:p-2 rounded-lg shadow-inner w-full">
          {board.map((row, rIndex) =>
            row.map((cellColor, cIndex) => (
              <div
                key={`${rIndex}-${cIndex}`}
                className={`aspect-square flex items-center justify-center rounded-sm sm:rounded-md cursor-pointer transition-all duration-200 ease-out
                                  ${selectedBall && selectedBall.r === rIndex && selectedBall.c === cIndex 
                                    ? 'bg-slate-600 scale-105 ring-1 ring-inset ring-cyan-400'
                                    : 'bg-slate-700/80 hover:bg-slate-600/90'}`}
                onClick={() => handleCellClick(rIndex, cIndex)}
                role="button"
                aria-label={`Cell ${rIndex}-${cIndex} ${cellColor ? 'contains a ' + cellColor + ' ball' : 'is empty'}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCellClick(rIndex,cIndex)}}
              >
                {cellColor && (
                  <div
                    className="w-[70%] h-[70%] sm:w-[75%] sm:h-[75%] rounded-full shadow-lg transition-transform duration-200 ease-out"
                    style={{ 
                        backgroundColor: cellColor, 
                        transform: selectedBall && selectedBall.r === rIndex && selectedBall.c === cIndex ? 'scale(0.85)' : 'scale(1)' ,
                        animation: selectedBall && selectedBall.r === rIndex && selectedBall.c === cIndex ? 'pulse-ball 1.5s infinite' : 'none'
                    }}
                  />
                )}
                  {/* Ball appearance animation placeholder - can be tricky without dedicated state for "newly added" */}
                  {/* One way is to have a temporary "newly_added_at_r_c" state that useEffect clears */}
              </div>
            ))
          )}
        </main>
        <footer className="mt-4 sm:mt-6 text-center text-xs text-gray-400/80">
          <p>Line 98 Deluxe: Phiên bản nâng cấp bởi AI.</p>
          <p>React, TypeScript & Tailwind CSS.</p>
        </footer>
      </div>
      <style jsx global>{`
        @keyframes pulse-ball {
          0%, 100% { transform: scale(0.85); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.5); }
          50% { transform: scale(0.95); box-shadow: 0 0 0 6px rgba(56, 189, 248, 0); }
        }
        @keyframes newBallPop { /* Example, not fully implemented in logic */
          0% { transform: scale(0.3); opacity: 0.5; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        /* .animate-newBallPop { animation: newBallPop 0.3s ease-out forwards; } */
      `}</style>
    </div>
  );
}

export default App;
