import React, { useState, useEffect, useCallback } from 'react';

// Constants for the game board and rules
const BOARD_SIZE = 9;
const COLORS = ['#EF4444', '#3B82F6', '#22C5E0', '#FACC15', '#A855F7', '#EC4899']; // Red, Blue, Green, Yellow, Purple, Pink
const BALLS_TO_ADD = 3;
const LINE_LENGTH_TO_CLEAR = 5;

/**
 * Generates a random color from the predefined COLORS array.
 * @returns {string} A hex color string.
 */
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

/**
 * Initializes an empty game board as a 2D array filled with nulls.
 * @returns {Array<Array<null>>} An empty 9x9 board.
 */
const initialBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

function App() {
  // State variables for the game
  const [board, setBoard] = useState(initialBoard()); // The game board
  const [score, setScore] = useState(0); // Player's score
  const [selectedBall, setSelectedBall] = useState(null); // Stores the { r, c, color } of the currently selected ball
  const [nextBalls, setNextBalls] = useState([]); // Colors of the balls to be added next
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [message, setMessage] = useState('Chọn một quả bóng để di chuyển.'); // Game messages for the player

  /**
   * Generates the colors for the next set of balls to be added to the board.
   * This is typically called after a move or at the start of the game.
   */
  const generateNextBallsPreview = useCallback(() => {
    const newNextBalls = [];
    for (let i = 0; i < BALLS_TO_ADD; i++) {
      newNextBalls.push(getRandomColor());
    }
    setNextBalls(newNextBalls);
  }, []);

  /**
   * Finds all empty cells on the current board.
   * @param {Array<Array<string|null>>} currentBoard - The current state of the game board.
   * @returns {Array<{r: number, c: number}>} An array of coordinates for empty cells.
   */
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

  /**
   * Adds a given array of balls to random empty positions on the board.
   * @param {Array<Array<string|null>>} currentBoard - The board to add balls to.
   * @param {Array<string>} ballsArray - An array of colors for the balls to add.
   * @returns {{updatedBoard: Array<Array<string|null>>, ballsPlacedCount: number, allBallsPlaced: boolean, placedPositions: Array<{r: number, c: number, color: string}>}}
   * An object containing the updated board, count of balls placed, whether all balls were placed, and their positions.
   */
  const addBallsToBoard = useCallback((currentBoard, ballsArray) => {
    let newBoard = currentBoard.map(row => [...row]);
    const emptyCells = getEmptyCells(newBoard);
    let ballsPlacedCount = 0;
    const placedPositions = [];

    if (emptyCells.length === 0) {
      // No empty cells to add balls, might be game over
      return { updatedBoard: newBoard, ballsPlacedCount, allBallsPlaced: false, placedPositions };
    }

    for (let i = 0; i < ballsArray.length; i++) {
      if (emptyCells.length === 0) break; // Ensure we don't try to add balls if no empty cells are left
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { r, c } = emptyCells.splice(randomIndex, 1)[0];
      newBoard[r][c] = ballsArray[i];
      placedPositions.push({r, c, color: ballsArray[i]});
      ballsPlacedCount++;
    }
    return { updatedBoard: newBoard, ballsPlacedCount, allBallsPlaced: ballsPlacedCount === ballsArray.length, placedPositions };
  }, [getEmptyCells]);

  /**
   * Checks for and clears lines of 5 or more same-colored balls starting from a given position.
   * @param {Array<Array<string|null>>} currentBoard - The current state of the game board.
   * @param {number} r_check - Row index of the ball to check from.
   * @param {number} c_check - Column index of the ball to check from.
   * @param {string} [color_check] - Optional: The color to match. If not provided, uses the color at (r_check, c_check).
   * @returns {{newBoard: Array<Array<string|null>>, clearedCount: number, linesFound: boolean}}
   * An object containing the updated board after clearing, count of balls cleared, and whether any lines were found.
   */
  const checkAndClearLines = useCallback((currentBoard, r_check, c_check, color_check) => {
    const colorToMatch = color_check || currentBoard[r_check][c_check];
    if (!colorToMatch) return { newBoard: currentBoard, clearedCount: 0, linesFound: false };

    const directions = [
      { dr: 0, dc: 1 }, // Horizontal
      { dr: 1, dc: 0 }, // Vertical
      { dr: 1, dc: 1 }, // Diagonal \
      { dr: 1, dc: -1 }, // Diagonal /
    ];
    let ballsToClear = new Set();
    let linesFoundThisCheck = false;

    directions.forEach(({ dr, dc }) => {
      let count = 0;
      const currentLineBalls = [];

      // Check in one direction (positive)
      let tempR = r_check;
      let tempC = c_check;
      while (tempR >= 0 && tempR < BOARD_SIZE && tempC >= 0 && tempC < BOARD_SIZE && currentBoard[tempR][tempC] === colorToMatch) {
        count++;
        currentLineBalls.push({ r: tempR, c: tempC });
        tempR += dr;
        tempC += dc;
      }

      // Check in the opposite direction (negative), excluding the starting ball if it was already counted
      tempR = r_check - dr;
      tempC = c_check - dc;
      while (tempR >= 0 && tempR < BOARD_SIZE && tempC >= 0 && tempC < BOARD_SIZE && currentBoard[tempR][tempC] === colorToMatch) {
        count++;
        currentLineBalls.push({ r: tempR, c: tempC });
        tempR -= dr;
        tempC -= dc;
      }
      
      if (count >= LINE_LENGTH_TO_CLEAR) {
        linesFoundThisCheck = true;
        currentLineBalls.forEach(ball => ballsToClear.add(`${ball.r}-${ball.c}`));
      }
    });
    
    if (linesFoundThisCheck) { // Only proceed to clear if lines were actually found
      let newBoard = currentBoard.map(row => [...row]);
      let actualClearedCount = 0;
      ballsToClear.forEach(key => {
        const [row, col] = key.split('-').map(Number);
        if (newBoard[row][col] === colorToMatch) { // Ensure we only clear balls of the matching color
          newBoard[row][col] = null;
          actualClearedCount++;
        }
      });
      return { newBoard, clearedCount: actualClearedCount, linesFound: true };
    }

    return { newBoard: currentBoard, clearedCount: 0, linesFound: false };
  }, []);
  
  /**
   * Performs a Breadth-First Search (BFS) to determine if a path exists between two cells.
   * The path must only go through empty cells.
   * @param {Array<Array<string|null>>} currentBoard - The current state of the game board.
   * @param {{r: number, c: number}} start - The starting coordinates.
   * @param {{r: number, c: number}} end - The ending coordinates.
   * @returns {boolean} True if a path exists, false otherwise.
   */
  const isPathPossible = useCallback((currentBoard, start, end) => {
    // Start cell must have a ball, end cell must be empty
    if (!currentBoard[start.r][start.c] || currentBoard[end.r][end.c]) return false; 

    const queue = [{ r: start.r, c: start.c }];
    const visited = new Set([`${start.r}-${start.c}`]);
    const directions = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }]; // Up, Down, Left, Right

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.r === end.r && current.c === end.c) return true;

      for (const dir of directions) {
        const nr = current.r + dir.dr;
        const nc = current.c + dir.dc;
        const key = `${nr}-${nc}`;

        // Check bounds, if not visited, and if the cell is empty (or the target cell)
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited.has(key) && (!currentBoard[nr][nc] || (nr === end.r && nc === end.c))) {
          visited.add(key);
          queue.push({ r: nr, c: nc });
        }
      }
    }
    return false;
  }, []);

  /**
   * Resets the game to its initial state.
   * Clears the board, resets score, generates initial balls, and sets game state.
   */
  const resetGame = useCallback(() => {
    const newBoardEmpty = initialBoard();
    // Add initial balls to the board
    const { updatedBoard: boardWithInitialBalls } = addBallsToBoard(newBoardEmpty, Array(BALLS_TO_ADD).fill(null).map(getRandomColor));
    
    setBoard(boardWithInitialBalls);
    setScore(0);
    setSelectedBall(null);
    generateNextBallsPreview();
    setGameOver(false);
    setMessage('Chọn một quả bóng để di chuyển.');
  }, [addBallsToBoard, generateNextBallsPreview]);

  // Effect hook to reset the game when the component mounts
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  /**
   * Handles a click event on a cell of the game board.
   * Manages ball selection, movement, line clearing, and game over conditions.
   * @param {number} r - Row index of the clicked cell.
   * @param {number} c - Column index of the clicked cell.
   */
  const handleCellClick = (r, c) => {
    if (gameOver) return; // Do nothing if game is over

    if (selectedBall) { // A ball is currently selected
      if (r === selectedBall.r && c === selectedBall.c) { // Clicked the selected ball again
        setSelectedBall(null); // Deselect the ball
        setMessage('Đã bỏ chọn. Hãy chọn một quả bóng.');
        return;
      }

      if (board[r][c]) { // Clicked on another ball (not an empty cell)
        setSelectedBall({ r, c, color: board[r][c] }); // Select the new ball
        setMessage('Đã chọn bóng mới. Chọn ô trống để di chuyển.');
        return;
      }

      // Clicked on an empty cell -> try to move the selected ball
      if (isPathPossible(board, selectedBall, { r, c })) {
        let newBoard = board.map(row => [...row]);
        newBoard[r][c] = selectedBall.color; // Move ball to new position
        newBoard[selectedBall.r][selectedBall.c] = null; // Clear old position
        
        const { newBoard: boardAfterPlayerMoveClear, clearedCount, linesFound } = checkAndClearLines(newBoard, r, c, selectedBall.color);
        
        if (linesFound) { // If player created a line
          setBoard(boardAfterPlayerMoveClear);
          setScore(prevScore => prevScore + clearedCount * 10);
          setSelectedBall(null);
          generateNextBallsPreview(); // Generate new balls for next turn
          setMessage(`Tuyệt vời! +${clearedCount * 10} điểm.`);
        } else { // Player did not create a line -> add new balls
          const { updatedBoard: boardWithNewBalls, allBallsPlaced, placedPositions } = addBallsToBoard(boardAfterPlayerMoveClear, nextBalls);
          let currentBoardState = boardWithNewBalls;
          let totalScoreFromNewBalls = 0;
          
          // Check if newly added balls form lines
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
          generateNextBallsPreview(); // Generate new balls for next turn (after current turn's balls are added)

          // Check for game over after adding new balls
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

          // Game over conditions: no empty cells left OR no possible moves
          if (!canMove && emptyCellsFinal.length < BALLS_TO_ADD && !allBallsPlaced) {
            setGameOver(true);
            setMessage('Trò chơi kết thúc! Bảng đã đầy hoặc không còn nước đi.');
          } else if(emptyCellsFinal.length === 0) {
            setGameOver(true);
            setMessage('Trò chơi kết thúc! Bảng đã đầy.');
          }
        }
      } else {
        setMessage('Không có đường đi! Chọn ô khác hoặc bóng khác.');
      }
    } else { // No ball is currently selected
      if (board[r][c]) { // Clicked on a cell with a ball
        setSelectedBall({ r, c, color: board[r][c] });
        setMessage('Đã chọn bóng. Chọn ô trống để di chuyển.');
      } else { // Clicked on an empty cell
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
            {/* RefreshCw Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.76 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.76-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            Chơi lại
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
            {/* AlertTriangle Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-lg sm:text-xl font-semibold">{message}</span>
          </div>
        )}
        {!gameOver && message && (
           <div className="my-2 sm:my-3 p-2 sm:p-3 bg-sky-600/90 text-white text-xs sm:text-sm text-center rounded-lg shadow">
            {message}
          </div>
        )}

        {/* Game Board */}
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
