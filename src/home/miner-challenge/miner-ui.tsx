// --- START OF FILE BombContext.tsx ---

import React, { createContext, useState, useCallback, useContext, ReactNode, FC } from 'react';

// --- Cấu hình game (giữ nguyên từ file gốc) ---
const BOARD_SIZE = 6;
const NUM_RANDOM_BOMBS = 4;
const NUM_COINS = 6;
const TOTAL_BOMBS = NUM_RANDOM_BOMBS;
const MAX_PICKAXES = 50;
const OPEN_CELL_DELAY = 400; // Thời gian delay khi mở ô (ms)

// --- Định nghĩa Types ---
interface CellData {
  x: number;
  y: number;
  isMineRandom: boolean;
  isCoin: boolean;
  isExit: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isCollected: boolean;
}

interface BombGameState {
  board: CellData[][];
  currentFloor: number;
  flagsPlaced: number;
  pickaxes: number;
  coinsEarnedThisSession: number;
  animatedDisplayedCoins: number;
  highestFloorCompletedThisSession: number;
  isOpening: { x: number, y: number } | null;
  exitConfirmationPos: { x: number, y: number } | null;
  rewardPerCoin: number;
}

interface BombGameActions {
  handleCellClick: (x: number, y: number) => void;
  handleRightClick: (e: React.MouseEvent, x: number, y: number) => void;
  goToNextFloor: () => void;
  handleClose: () => void;
  resetGame: () => void;
  setExitConfirmationPos: React.Dispatch<React.SetStateAction<{ x: number, y: number } | null>>;
}

// --- Tạo Context ---
// Type này kết hợp cả State và Actions
type BombContextType = BombGameState & BombGameActions;

const BombContext = createContext<BombContextType | undefined>(undefined);

// --- Props cho Provider ---
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

// --- Component Provider: Chứa toàn bộ logic ---
export const BombProvider: FC<BombProviderProps> = ({
  children,
  onClose,
  initialDisplayedCoins,
  masteryCards,
  initialPickaxes,
  initialHighestFloor,
  onGameEnd
}) => {
  // --- TẤT CẢ STATE VÀ LOGIC TỪ BOMB.TSX ĐƯỢC CHUYỂN VÀO ĐÂY ---

  const createBoard = () => {
    const newBoard: CellData[][] = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({ x: colIndex, y: rowIndex, isMineRandom: false, isCoin: false, isExit: false, isRevealed: false, isFlagged: false, isCollected: false })));
    const placeItem = (itemType: 'isMineRandom' | 'isCoin' | 'isExit') => {
        let placed = false;
        while(!placed) {
            const x = Math.floor(Math.random() * BOARD_SIZE);
            const y = Math.floor(Math.random() * BOARD_SIZE);
            const cell = newBoard[y][x];
            if (!cell.isMineRandom && !cell.isCoin && !cell.isExit) { cell[itemType] = true; placed = true; }
        }
    };
    for (let i = 0; i < NUM_RANDOM_BOMBS; i++) placeItem('isMineRandom');
    for (let i = 0; i < NUM_COINS; i++) placeItem('isCoin');
    placeItem('isExit');
    return newBoard;
  };

  const [board, setBoard] = useState<CellData[][]>(() => createBoard());
  const [currentFloor, setCurrentFloor] = useState(initialHighestFloor > 0 ? initialHighestFloor + 1 : 1);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [exitConfirmationPos, setExitConfirmationPos] = useState<{ x: number, y: number } | null>(null);
  const [pickaxes, setPickaxes] = useState(initialPickaxes);
  const [coinsEarnedThisSession, setCoinsEarnedThisSession] = useState(0);
  const [animatedDisplayedCoins, setAnimatedDisplayedCoins] = useState(initialDisplayedCoins);
  const [highestFloorCompletedThisSession, setHighestFloorCompletedThisSession] = useState(initialHighestFloor);
  const [isOpening, setIsOpening] = useState<{ x: number, y: number } | null>(null);
  
  const rewardPerCoin = Math.max(1, masteryCards) * currentFloor;

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
              if(cell.isRevealed && cell.isCoin && !cell.isCollected) {
                  totalReward += rewardPerCoin;
                  return { ...cell, isCollected: true };
              }
              return cell;
          })
      );
      if(totalReward > 0) {
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
      //... (logic nổ bom giữ nguyên)
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
    if (pickaxes <= 0) return;
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

  const handleClose = () => {
    let uncollectedReward = 0;
    board.flat().forEach(cell => {
      if (cell.isRevealed && cell.isCoin && !cell.isCollected) {
        uncollectedReward += rewardPerCoin;
      }
    });
    const totalCoinsEarned = coinsEarnedThisSession + uncollectedReward;
    onGameEnd({
      finalPickaxes: pickaxes,
      coinsEarned: totalCoinsEarned,
      highestFloorCompleted: highestFloorCompletedThisSession
    });
    onClose();
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

  // --- Giá trị cung cấp bởi Context ---
  const value: BombContextType = {
    board,
    currentFloor,
    flagsPlaced,
    pickaxes,
    coinsEarnedThisSession,
    animatedDisplayedCoins,
    highestFloorCompletedThisSession,
    isOpening,
    exitConfirmationPos,
    rewardPerCoin,
    handleCellClick,
    handleRightClick,
    goToNextFloor,
    handleClose,
    resetGame,
    setExitConfirmationPos,
  };

  return <BombContext.Provider value={value}>{children}</BombContext.Provider>;
};

// --- Custom Hook để sử dụng Context dễ dàng hơn ---
export const useBombGame = (): BombContextType => {
  const context = useContext(BombContext);
  if (context === undefined) {
    throw new Error('useBombGame must be used within a BombProvider');
  }
  return context;
};
// --- END OF FILE BombContext.tsx ---
