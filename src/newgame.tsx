import React, { useReducer } from 'react';

// Constants
const BOARD_SIZE = 9;
const COLORS = ['#EF4444', '#3B82F6', '#22C5E0', '#FACC15', '#A855F7', '#EC4899']; // Red, Blue, Cyan, Yellow, Purple, Pink
const BALLS_TO_ADD = 3; // Number of balls to add/preview each turn
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
  board: Board; // Stores actual (matured) balls
  score: number;
  selectedBall: Ball | null;
  previewBalls: Ball[]; // Stores upcoming balls with their r, c, color
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
  // Ensure start has a ball. End cell must be empty for a move.
  if (!board[start.r][start.c] || board[end.r][end.c]) return false;

  const queue: CellPosition[] = [{ r: start.r, c: start.c }];
  const visited = new Set<string>([`${start.r}-${start.c}`]);
  const directions = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
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
  checkPositions: CellPosition[], // Positions of newly placed/moved balls
): { newBoard: Board; clearedCount: number; linesFound: boolean } => {
  let newBoard = board.map(row => [...row]);
  let totalClearedCount = 0;
  let anyLinesFound = false;
  const ballsToClearGlobal = new Set<string>();

  const directions = [
    { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, // Horizontal, Vertical
    { dr: 1, dc: 1 }, { dr: 1, dc: -1 }  // Diagonal
  ];

  for (const { r: r_check, c: c_check } of checkPositions) {
    const colorToMatch = newBoard[r_check]?.[c_check];
    if (!colorToMatch) continue;

    directions.forEach(({ dr, dc }) => {
      const line: CellPosition[] = [{r: r_check, c: c_check}];
      // Positive direction
      for (let i = 1; i < BOARD_SIZE; i++) {
        const r = r_check + dr * i;
        const c = c_check + dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newBoard[r][c] === colorToMatch) {
          line.push({ r, c });
        } else break;
      }
      // Negative direction
      for (let i = 1; i < BOARD_SIZE; i++) {
        const r = r_check - dr * i;
        const c = c_check - dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newBoard[r][c] === colorToMatch) {
          line.push({ r, c });
        } else break;
      }

      if (line.length >= LINE_LENGTH_TO_CLEAR) {
        anyLinesFound = true;
        line.forEach(ball => ballsToClearGlobal.add(`${ball.r}-${ball.c}`));
      }
    });
  }
  
  if (anyLinesFound) {
    ballsToClearGlobal.forEach(key => {
      const [row, col] = key.split('-').map(Number);
      if (newBoard[row][col]) { // Check if not already cleared by another line
          newBoard[row][col] = null;
          totalClearedCount++;
      }
    });
    return { newBoard, clearedCount: totalClearedCount, linesFound: true };
  }

  return { newBoard: board, clearedCount: 0, linesFound: false };
};


// Places regular balls, used for initial setup.
const addRegularBallsToBoard = (
  currentBoard: Board,
  colors: string[]
): { updatedBoard: Board; allBallsPlaced: boolean; placedPositions: CellPosition[] } => {
  let newBoard = currentBoard.map(row => [...row]);
  const emptyCells = getEmptyCells(newBoard);
  const placedPositions: CellPosition[] = [];

  if (emptyCells.length < colors.length) {
      // Not enough space for all balls, place what we can
      for (let i = 0; i < emptyCells.length; i++) {
        const { r, c } = emptyCells[i]; // Simplistic placement for this scenario
        newBoard[r][c] = colors[i];
        placedPositions.push({ r, c });
    }
    return { updatedBoard: newBoard, allBallsPlaced: false, placedPositions };
  }

  for (const color of colors) {
    if (emptyCells.length === 0) break; // Should not happen if previous check passed
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { r, c } = emptyCells.splice(randomIndex, 1)[0];
    newBoard[r][c] = color;
    placedPositions.push({ r, c });
  }
  return { updatedBoard: newBoard, allBallsPlaced: true, placedPositions };
};

// Generates colors for new balls (regular or preview)
const generateBallColors = (count: number): string[] => {
  return Array(count).fill(null).map(getRandomColor);
};

// Places new preview balls on the board
const placeNewPreviewBalls = (
  currentBoard: Board, // Board with only regular balls
  colorsToPlace: string[]
): { newPreviewBalls: Ball[]; allPlaced: boolean } => {
  const emptyCells = getEmptyCells(currentBoard);
  const newPreviewBalls: Ball[] = [];
  let availableEmptyCells = [...emptyCells];

  if (availableEmptyCells.length === 0 && colorsToPlace.length > 0) {
    return { newPreviewBalls, allPlaced: false };
  }

  for (const color of colorsToPlace) {
    if (availableEmptyCells.length === 0) break;  
    const randomIndex = Math.floor(Math.random() * availableEmptyCells.length);
    const { r, c } = availableEmptyCells.splice(randomIndex, 1)[0];
    newPreviewBalls.push({ r, c, color });
  }
  
  return {  
    newPreviewBalls,  
    allPlaced: newPreviewBalls.length === colorsToPlace.length  
  };
};


// --- Reducer ---
const initialStateFactory = (): GameState => {
  let board = createInitialBoard();
  let score = 0;
  let selectedBall = null;
  let previewBalls: Ball[] = [];
  let gameOver = false;
  let message = 'Chọn một quả bóng để di chuyển.';
  let isPlayerTurn = true;

  // 1. Add initial regular balls
  const initialRegularBallColors = generateBallColors(BALLS_TO_ADD);
  const { updatedBoard: boardAfterInitialRegular, allBallsPlaced: regularPlaced } =
    addRegularBallsToBoard(board, initialRegularBallColors);
  
  board = boardAfterInitialRegular;

  if (!regularPlaced && initialRegularBallColors.length > 0) {
    gameOver = true;
    message = 'Lỗi khởi tạo: không đủ chỗ cho bóng ban đầu.';
  }

  // 2. If not game over, add initial preview balls
  if (!gameOver) {
    const initialPreviewColors = generateBallColors(BALLS_TO_ADD);
    const { newPreviewBalls, allPlaced: previewsPlaced } =  
      placeNewPreviewBalls(board, initialPreviewColors);
    previewBalls = newPreviewBalls;

    if (!previewsPlaced && initialPreviewColors.length > 0) {
      gameOver = true;
      message = 'Trò chơi kết thúc! Không đủ chỗ cho bóng xem trước ban đầu.';
      previewBalls = [];  
    }
  }
  
  // More robust game over check at start, e.g., if board is tiny
  if(!gameOver && getEmptyCells(board).length - previewBalls.length === 0) { // All cells filled by balls or previews
    let canMove = false;
    const ballsOnBoard: CellPosition[] = [];
    for(let r_idx=0; r_idx<BOARD_SIZE; r_idx++) for(let c_idx=0; c_idx<BOARD_SIZE; c_idx++) if(board[r_idx][c_idx]) ballsOnBoard.push({r:r_idx, c:c_idx});
    const emptyCellsForMove = getEmptyCells(board); // For pathfinding, previews are not obstacles

    if (ballsOnBoard.length > 0 && emptyCellsForMove.length > 0) {
        for (const ball of ballsOnBoard) {
            for (const empty of emptyCellsForMove) {
                if (isPathPossible(board, ball, empty)) {
                    canMove = true; break;
                }
            }
            if (canMove) break;
        }
    } else if (ballsOnBoard.length === 0 && emptyCellsForMove.length > 0) {
        canMove = true; // Empty board, game continues
    }


    if (!canMove && ballsOnBoard.length > 0) {
        gameOver = true;
        message = "Trò chơi kết thúc! Không có nước đi nào ngay từ đầu.";
    }
  }


  return {
    board,
    score,
    selectedBall,
    previewBalls,
    gameOver,
    message: gameOver ? message : 'Chọn một quả bóng để di chuyển.',
    isPlayerTurn: !gameOver,
  };
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET_GAME':
      return initialStateFactory();

    case 'CELL_CLICK': {
      if (state.gameOver || !state.isPlayerTurn) return state;
      const { r, c } = action.payload;

      if (state.selectedBall) { // A ball is already selected
        if (state.selectedBall.r === r && state.selectedBall.c === c) { // Clicked selected ball again
          return { ...state, selectedBall: null, message: 'Đã bỏ chọn. Chọn một quả bóng.' };
        }
        if (state.board[r][c]) { // Clicked another ball
          return { ...state, selectedBall: { r, c, color: state.board[r][c]! }, message: 'Đã chọn bóng mới. Chọn ô trống để di chuyển.' };
        }

        // Clicked an empty cell to move
        if (isPathPossible(state.board, state.selectedBall, { r, c })) {
          let boardAfterPlayerMove = state.board.map(row => [...row]);
          boardAfterPlayerMove[r][c] = state.selectedBall.color;
          boardAfterPlayerMove[state.selectedBall.r][state.selectedBall.c] = null;

          const {  
              newBoard: boardAfterPlayerClear,  
              clearedCount: playerClearedCount,  
              linesFound: playerLinesFound  
          } = checkAndClearLinesForPoints(boardAfterPlayerMove, [{r, c}]);

          let currentScore = state.score;
          let currentBoard = boardAfterPlayerClear;
          let currentMessage = '';
          let nextPreviewBalls: Ball[] = [];
          let allNewPreviewsWerePlaced = true;

          if (playerLinesFound) {
            currentScore += playerClearedCount * 10;
            currentMessage = `Tuyệt vời! +${playerClearedCount * 10} điểm.`;
            // Discard old previews, generate new ones
            const previewColors = generateBallColors(BALLS_TO_ADD);
            const { newPreviewBalls: placed, allPlaced } = placeNewPreviewBalls(currentBoard, previewColors);
            nextPreviewBalls = placed;
            allNewPreviewsWerePlaced = allPlaced;
          } else {
            currentMessage = 'Di chuyển thành công.';
            // Mature preview balls
            let boardWithMaturedBalls = currentBoard.map(row => [...row]);
            const maturedBallCheckPositions: CellPosition[] = [];

            for (const pBall of state.previewBalls) {
              if (boardWithMaturedBalls[pBall.r][pBall.c] === null) { // If cell is still empty
                boardWithMaturedBalls[pBall.r][pBall.c] = pBall.color;
                maturedBallCheckPositions.push({ r: pBall.r, c: pBall.c });
              }
            }
            
            currentBoard = boardWithMaturedBalls; // Update currentBoard before checking lines from matured balls

            if (maturedBallCheckPositions.length > 0) {
                const {  
                    newBoard: boardAfterMatureClear,  
                    clearedCount: maturedClearedCount,  
                    linesFound: maturedLinesFound  
                } = checkAndClearLinesForPoints(currentBoard, maturedBallCheckPositions);
                
                currentBoard = boardAfterMatureClear; // Update currentBoard again after potential clear
                if (maturedLinesFound) {
                    currentScore += maturedClearedCount * 10;
                    currentMessage = `Bóng mới tạo thành hàng! +${maturedClearedCount * 10} điểm.`;
                }
            }

            // Generate and place new preview balls
            const previewColors = generateBallColors(BALLS_TO_ADD);
            const { newPreviewBalls: placed, allPlaced } = placeNewPreviewBalls(currentBoard, previewColors);
            nextPreviewBalls = placed;
            allNewPreviewsWerePlaced = allPlaced;
          }

          // --- Game Over Checks ---
          let gameIsOver = false;
          let finalMessage = currentMessage;

          if (!allNewPreviewsWerePlaced && generateBallColors(BALLS_TO_ADD).length > 0) {
            gameIsOver = true;
            finalMessage = 'Trò chơi kết thúc! Không đủ chỗ cho bóng xem trước.';
          }
          
          if (!gameIsOver) { // Check for no moves only if not already game over by board full/preview placement fail
            const emptyCellsOnBoard = getEmptyCells(currentBoard);
            // If board is full of regular balls (no empty cells) AND no previews could be placed (covered by !allNewPreviewsWerePlaced)
            // OR if board is full and no previews are even needed (BALLS_TO_ADD = 0, not our case)
            if (emptyCellsOnBoard.length === 0 && nextPreviewBalls.length < BALLS_TO_ADD && BALLS_TO_ADD > 0) {
                // This means board is full and we failed to place all required previews
                gameIsOver = true;
                finalMessage = 'Trò chơi kết thúc! Bảng đã đầy, không thể thêm bóng xem trước.';
            } else if (emptyCellsOnBoard.length === 0 && BALLS_TO_ADD === 0) { // Edge case: board full, no previews needed
                // This means board is full, game might still be playable if moves exist
                // but if no moves, then game over. This specific condition is "board full".
                // If BALLS_TO_ADD > 0, this is covered by the first check in this block.
            }


            if (!gameIsOver) { // Check for no moves only if not already game over by board full/preview placement fail
                let canMove = false;
                const ballsOnBoard: CellPosition[] = [];
                for(let r_idx=0; r_idx<BOARD_SIZE; r_idx++) for(let c_idx=0; c_idx<BOARD_SIZE; c_idx++) if(currentBoard[r_idx][c_idx]) ballsOnBoard.push({r:r_idx,c:c_idx});
                
                // Empty cells for pathfinding are actual empty cells on currentBoard
                const emptyCellsForPathfinding = getEmptyCells(currentBoard);

                if (ballsOnBoard.length > 0 && emptyCellsForPathfinding.length > 0) {
                    for(const ball of ballsOnBoard){
                        for(const empty of emptyCellsForPathfinding){
                            if(isPathPossible(currentBoard, ball, empty)){
                                canMove = true; break;
                            }
                        }
                        if(canMove) break;
                    }
                } else if (ballsOnBoard.length === 0 && emptyCellsForPathfinding.length > 0) {
                    // Board became empty after clears, game continues, new previews will fill.
                    canMove = true;
                } else if (emptyCellsForPathfinding.length === 0 && ballsOnBoard.length > 0) {
                    // Board is full of balls, no empty cells to move to.
                    canMove = false;
                }


                if (!canMove && ballsOnBoard.length > 0) {  
                    gameIsOver = true;
                    finalMessage = 'Trò chơi kết thúc! Không còn nước đi nào.';
                }
            }
          }


          return {
            ...state,
            board: currentBoard,
            score: currentScore,
            selectedBall: null,
            previewBalls: gameIsOver ? [] : nextPreviewBalls,
            gameOver: gameIsOver,
            message: gameIsOver ? finalMessage : currentMessage,
            isPlayerTurn: !gameIsOver,
          };

        } else { // Path not possible
          return { ...state, message: 'Không có đường đi! Chọn ô khác hoặc bóng khác.' };
        }
      } else { // No ball selected, try to select one
        if (state.board[r][c]) {
          return { ...state, selectedBall: { r, c, color: state.board[r][c]! }, message: 'Đã chọn bóng. Chọn ô trống để di chuyển.' };
        } else {
          return { ...state, message: 'Ô trống. Hãy chọn một quả bóng.' };
        }
      }
    }
    default:
      // https://github.com/microsoft/TypeScript/issues/13499
      // const exhaustiveCheck: never = action; // Removed as it causes issues with some TS setups
      return state;
  }
}

// --- Component ---
function App() {
  const [gameState, dispatch] = useReducer(gameReducer, undefined, initialStateFactory);
  const { board, score, selectedBall, previewBalls, gameOver, message } = gameState;

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
        
        {/* Removed "Sắp tới" (Next Balls) display area */}

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
            row.map((cellColor, cIndex) => {
              const isCellSelected = selectedBall && selectedBall.r === rIndex && selectedBall.c === cIndex;
              const previewBallHere = !cellColor ? previewBalls.find(p => p.r === rIndex && p.c === cIndex) : null;

              return (
                <div
                  key={`${rIndex}-${cIndex}`}
                  className={`aspect-square flex items-center justify-center rounded-sm sm:rounded-md cursor-pointer transition-all duration-200 ease-out
                                ${isCellSelected  
                                  ? 'bg-slate-600 scale-105 ring-1 ring-inset ring-cyan-400'
                                  : 'bg-slate-700/80 hover:bg-slate-600/90'}`}
                  onClick={() => handleCellClick(rIndex, cIndex)}
                  role="button"
                  aria-label={`Cell ${rIndex}-${cIndex} ${cellColor ? 'contains a ' + cellColor + ' ball' : (previewBallHere ? 'has a ' + previewBallHere.color + ' preview ball' : 'is empty')}`}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCellClick(rIndex,cIndex)}}
                >
                  {cellColor && ( // Regular ball
                    <div
                      className="w-[70%] h-[70%] sm:w-[75%] sm:h-[75%] rounded-full shadow-lg transition-transform duration-200 ease-out"
                      style={{  
                          backgroundColor: cellColor,  
                          transform: isCellSelected ? 'scale(0.85)' : 'scale(1)' ,
                          animation: isCellSelected ? 'pulse-ball 1.5s infinite' : 'none'
                      }}
                    />
                  )}
                  {!cellColor && previewBallHere && ( // Preview ball
                    <div
                      className="w-[45%] h-[45%] sm:w-[50%] sm:h-[50%] rounded-full border-2 border-dashed flex items-center justify-center"
                      style={{ borderColor: previewBallHere.color, opacity: 0.7 }}
                      title={`Preview: ${previewBallHere.color}`}
                    >
                      <div  
                          className="w-[60%] h-[60%] rounded-full"
                          style={{backgroundColor: previewBallHere.color, opacity: 0.8}}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default App;
