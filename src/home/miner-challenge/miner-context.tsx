import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import { processMinerChallengeResult } from './miner-service.ts';
import { auth } from '../../firebase.js';

// --- Cấu hình game ---
const BOARD_SIZE = 6;
const NUM_RANDOM_BOMBS = 4;
const NUM_COINS = 6;
const TOTAL_BOMBS = NUM_RANDOM_BOMBS;
const MAX_PICKAXES = 50;
const OPEN_CELL_DELAY = 400;

// --- Định nghĩa Types ---
type CellData = {
  x: number;
  y: number;
  isMineRandom: boolean;
  isCoin: boolean;
  isExit: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isCollected: boolean;
};

type BoardData = CellData[][];

interface BombContextType {
  board: BoardData;
  currentFloor: number;
  pickaxes: number;
  flagsPlaced: number;
  animatedDisplayedCoins: number;
  masteryCards: number;
  exitConfirmationPos: { x: number, y: number } | null;
  isOpening: { x: number, y: number } | null;
  rewardPerCoin: number;
  handleCellClick: (x: number, y: number) => void;
  handleRightClick: (e: React.MouseEvent, x: number, y: number) => void;
  goToNextFloor: () => void;
  setExitConfirmationPos: React.Dispatch<React.SetStateAction<{ x: number, y: number } | null>>;
  handleClose: () => void;
  resetGame: () => void;
}

interface BombProviderProps {
  children: ReactNode;
  onClose: () => void;
  initialDisplayedCoins: number;
  masteryCards: number;
  initialPickaxes: number;
  initialHighestFloor: number;
  onGameEnd: (result: {
    finalPickaxes: number;
    coinsEarned: number;
    highestFloorCompleted: number;
  }) => void;
}

// --- Tạo Context ---
const BombContext = createContext<BombContextType | null>(null);

// --- Tạo Provider Component ---
export const BombProvider: React.FC<BombProviderProps> = ({
  children,
  onClose,
  initialDisplayedCoins,
  masteryCards,
  initialPickaxes,
  initialHighestFloor,
  onGameEnd,
}) => {
  const createBoard = (): BoardData => {
    const newBoard: BoardData = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({ x: colIndex, y: rowIndex, isMineRandom: false, isCoin: false, isExit: false, isRevealed: false, isFlagged: false, isCollected: false })));
    const placeItem = (itemType: 'isMineRandom' | 'isCoin' | 'isExit') => {
      let placed = false;
      while (!placed) {
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
  };

  const [board, setBoard] = useState<BoardData>(() => createBoard());
  const [currentFloor, setCurrentFloor] = useState(initialHighestFloor > 0 ? initialHighestFloor + 1 : 1);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [exitConfirmationPos, setExitConfirmationPos] = useState<{ x: number, y: number } | null>(null);
  const [pickaxes, setPickaxes] = useState(initialPickaxes);
  const [coinsEarnedThisSession, setCoinsEarnedThisSession] = useState(0);
  const [animatedDisplayedCoins, setAnimatedDisplayedCoins] = useState(initialDisplayedCoins);
  const [highestFloorCompletedThisSession, setHighestFloorCompletedThisSession] = useState(initialHighestFloor);
  const [isOpening, setIsOpening] = useState<{ x: number, y: number } | null>(null);

  const rewardPerCoin = Math.max(1, masteryCards) * currentFloor;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      let uncollectedReward = 0;
      board.flat().forEach(cell => {
        if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
          uncollectedReward += rewardPerCoin;
        }
      });
      const totalCoinsEarned = coinsEarnedThisSession + uncollectedReward;
      const finalHighestFloor = Math.max(highestFloorCompletedThisSession, currentFloor > 1 ? currentFloor - 1 : 0);

      // Chỉ hiển thị cảnh báo nếu người dùng đã có tiến trình chơi
      const hasUnsavedChanges = 
        pickaxes !== initialPickaxes || 
        totalCoinsEarned > 0 || 
        finalHighestFloor > initialHighestFloor;

      if (hasUnsavedChanges) {
        // Các trình duyệt hiện đại sẽ hiển thị thông báo mặc định
        event.preventDefault();
        event.returnValue = 'Bạn có tiến trình chưa lưu. Bạn có chắc muốn rời đi?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Dọn dẹp listener khi component bị unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    board,
    pickaxes,
    coinsEarnedThisSession,
    currentFloor,
    highestFloorCompletedThisSession,
    initialPickaxes,
    initialHighestFloor,
    rewardPerCoin
  ]);

  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) return;
    const isCountingUp = endValue > startValue;
    const step = Math.ceil(Math.abs(endValue - startValue) / 30) || 1;
    let current = startValue;
    const interval = setInterval(() => {
      if (isCountingUp) { current += step; } else { current -= step; }
      if ((isCountingUp && current >= endValue) || (!isCountingUp && current <= endValue)) {
        setAnimatedDisplayedCoins(endValue);
        clearInterval(interval);
      } else {
        setAnimatedDisplayedCoins(current);
      }
    }, 30);
  }, []);

  const updateCell = (x: number, y: number, newProps: Partial<CellData>) => {
    setBoard(prevBoard => prevBoard.map((row, rowIndex) => rowIndex !== y ? row : row.map((cell, colIndex) => colIndex !== x ? cell : { ...cell, ...newProps })));
  };

  const collectAllVisibleCoins = useCallback(() => {
    let totalReward = 0;
    const newBoard = board.map(row =>
      row.map(cell => {
        if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
          totalReward += rewardPerCoin;
          return { ...cell, isCollected: true };
        }
        return cell;
      })
    );
    if (totalReward > 0) {
      const newTotalCoinsEarned = coinsEarnedThisSession + totalReward;
      setBoard(newBoard);
      setCoinsEarnedThisSession(newTotalCoinsEarned);
      startCoinCountAnimation(animatedDisplayedCoins, initialDisplayedCoins + newTotalCoinsEarned);
    }
  }, [board, rewardPerCoin, coinsEarnedThisSession, animatedDisplayedCoins, initialDisplayedCoins, startCoinCountAnimation]);

  const processCellOpening = (x: number, y: number) => {
    const cell = board[y][x];
    if (cell.isFlagged || (cell.isRevealed && !cell.isExit)) return;

    if (!cell.isRevealed) {
      if (pickaxes <= 0) return;
      setPickaxes(prev => prev - 1);
    }
    
    if (cell.isMineRandom) {
      const newBoard = JSON.parse(JSON.stringify(board));
      const explosionsQueue = [{ x, y }];
      while (explosionsQueue.length > 0) {
        const currentBombPos = explosionsQueue.shift()!;
        const bombCell = newBoard[currentBombPos.y][currentBombPos.x];
        if (bombCell.isRevealed) continue;
        bombCell.isRevealed = true;
        const unrevealedCells = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (!newBoard[r][c].isRevealed) unrevealedCells.push(newBoard[r][c]);
          }
        }
        const cellsToExplode = unrevealedCells.sort(() => 0.5 - Math.random()).slice(0, 4);
        cellsToExplode.forEach(targetCell => {
          if (!targetCell.isRevealed) {
            targetCell.isRevealed = true;
            if (targetCell.isMineRandom) explosionsQueue.push({ x: targetCell.x, y: targetCell.y });
          }
        });
      }
      setBoard(newBoard);
    } else {
      updateCell(x, y, { isRevealed: true });
    }
  };

  const handleCellClick = useCallback((x: number, y: number) => {
    if (isOpening) return;
    const cell = board[y][x];
    if (cell.isRevealed && cell.isExit) {
      setExitConfirmationPos({ x, y });
      return;
    }
    if ((cell.isRevealed && !cell.isCoin) || cell.isFlagged) return;
    if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
      collectAllVisibleCoins();
      return;
    }
    if (pickaxes <= 0) {
      console.log("Hết cuốc!");
      return;
    }
    setIsOpening({ x, y });
    setTimeout(() => {
      processCellOpening(x, y);
      setIsOpening(null);
    }, OPEN_CELL_DELAY);
  }, [board, collectAllVisibleCoins, pickaxes, isOpening]);

  const handleRightClick = useCallback((e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (isOpening) return;
    const cell = board[y][x];
    if (cell.isRevealed) return;
    if (!cell.isFlagged && flagsPlaced < TOTAL_BOMBS) {
      updateCell(x, y, { isFlagged: true });
      setFlagsPlaced(prev => prev + 1);
    } else if (cell.isFlagged) {
      updateCell(x, y, { isFlagged: false });
      setFlagsPlaced(prev => prev - 1);
    }
  }, [board, flagsPlaced, isOpening]);
  
  const goToNextFloor = () => {
    setHighestFloorCompletedThisSession(prev => Math.max(prev, currentFloor));
    setCurrentFloor(prev => prev + 1);
    setBoard(createBoard());
    setFlagsPlaced(0);
    setExitConfirmationPos(null);
  };
  
  const handleClose = async () => {
    let uncollectedReward = 0;
    board.flat().forEach(cell => {
      if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
        uncollectedReward += rewardPerCoin;
      }
    });
    const totalCoinsEarned = coinsEarnedThisSession + uncollectedReward;
    
    const finalHighestFloor = Math.max(highestFloorCompletedThisSession, currentFloor > 1 ? currentFloor - 1 : 0);

    const result = {
      finalPickaxes: pickaxes,
      coinsEarned: totalCoinsEarned,
      highestFloorCompleted: finalHighestFloor
    };

    if (result.finalPickaxes === initialPickaxes && result.coinsEarned === 0 && result.highestFloorCompleted <= initialHighestFloor) {
        onClose();
        return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Cannot save game data: User not authenticated.");
      alert("Lỗi: Không thể lưu tiến trình. Vui lòng đăng nhập lại và thử.");
      return;
    }

    try {
      await processMinerChallengeResult(userId, result);
      onGameEnd(result);
      onClose();
    } catch (error) {
      console.error("Failed to save miner challenge results:", error);
      alert("Đã xảy ra lỗi khi lưu kết quả. Vui lòng thử lại.");
    }
  };

  const resetGame = () => {
    setCurrentFloor(1);
    setFlagsPlaced(0);
    setBoard(createBoard());
    setExitConfirmationPos(null);
    setPickaxes(MAX_PICKAXES);
    setCoinsEarnedThisSession(0);
    setAnimatedDisplayedCoins(initialDisplayedCoins);
  };

  const value: BombContextType = {
    board,
    currentFloor,
    pickaxes,
    flagsPlaced,
    animatedDisplayedCoins,
    masteryCards,
    exitConfirmationPos,
    isOpening,
    rewardPerCoin,
    handleCellClick,
    handleRightClick,
    goToNextFloor,
    setExitConfirmationPos,
    handleClose,
    resetGame,
  };

  return <BombContext.Provider value={value}>{children}</BombContext.Provider>;
};

// --- Tạo Custom Hook ---
export const useBomb = (): BombContextType => {
  const context = useContext(BombContext);
  if (!context) {
    throw new Error('useBomb must be used within a BombProvider');
  }
  return context;
};
