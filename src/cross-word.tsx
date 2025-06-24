import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- UTILITY FUNCTIONS (No changes from previous version) ---

const generateCrosswordLayout = (words) => {
  if (!words || words.length === 0) return [];
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const placedWords = [];
  const grid = new Map();

  const firstWord = sortedWords.shift();
  if (!firstWord) return [];
  const firstWordStart = [0, 0];
  placedWords.push({ word: firstWord, start: firstWordStart, dir: 'h' });
  for (let i = 0; i < firstWord.length; i++) {
    grid.set(`${firstWordStart[0]},${firstWordStart[1] + i}`, firstWord[i]);
  }

  while (sortedWords.length > 0) {
    let wordPlaced = false;
    for (let i = 0; i < sortedWords.length; i++) {
      const currentWord = sortedWords[i];
      let bestFit = null;
      for (const pWord of placedWords) {
        for (let j = 0; j < currentWord.length; j++) {
          for (let k = 0; k < pWord.word.length; k++) {
            if (currentWord[j] === pWord.word[k]) {
              const newDir = pWord.dir === 'h' ? 'v' : 'h';
              let newStart;
              if (newDir === 'v') {
                newStart = [pWord.start[0] - j, pWord.start[1] + k];
              } else {
                newStart = [pWord.start[0] + k, pWord.start[1] - j];
              }
              if (canPlaceWord(grid, currentWord, newStart, newDir)) {
                  bestFit = { word: currentWord, start: newStart, dir: newDir };
                  break;
              }
            }
          }
          if (bestFit) break;
        }
        if (bestFit) break;
      }
      if (bestFit) {
        placedWords.push(bestFit);
        for (let l = 0; l < bestFit.word.length; l++) {
          const key = bestFit.dir === 'h' ? `${bestFit.start[0]},${bestFit.start[1] + l}` : `${bestFit.start[0] + l},${bestFit.start[1]}`;
          grid.set(key, bestFit.word[l]);
        }
        sortedWords.splice(i, 1);
        wordPlaced = true;
        break; 
      }
    }
    if (!wordPlaced) {
      console.warn("Could not place remaining words:", sortedWords);
      break;
    }
  }
  return normalizeCoords(placedWords);
};

const canPlaceWord = (grid, word, start, dir) => {
  const [y, x] = start;
  for (let i = 0; i < word.length; i++) {
    const currentY = dir === 'v' ? y + i : y;
    const currentX = dir === 'h' ? x + i : x;
    const key = `${currentY},${currentX}`;
    const isIntersection = grid.has(key) && grid.get(key) === word[i];
    if (grid.has(key) && !isIntersection) return false;
    if (!isIntersection) {
      const neighbors = dir === 'h' ? [`${currentY - 1},${currentX}`, `${currentY + 1},${currentX}`] : [`${currentY},${currentX - 1}`, `${currentY},${currentX + 1}`];
      if (neighbors.some(nKey => grid.has(nKey))) return false;
    }
  }
  const beforeY = dir === 'v' ? y - 1 : y;
  const beforeX = dir === 'h' ? x - 1 : x;
  if(grid.has(`${beforeY},${beforeX}`)) return false;
  const afterY = dir === 'v' ? y + word.length : y;
  const afterX = dir === 'h' ? x + word.length : x;
  if(grid.has(`${afterY},${afterX}`)) return false;
  return true;
};

const normalizeCoords = (placedWords) => {
    if (placedWords.length === 0) return [];
    let minX = Infinity, minY = Infinity;
    placedWords.forEach(({ start }) => {
        minY = Math.min(minY, start[0]);
        minX = Math.min(minX, start[1]);
    });
    return placedWords.map(pWord => ({ ...pWord, start: [pWord.start[0] - minY, pWord.start[1] - minX] }));
};

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// --- LEVEL DATA (No changes) ---
const rawLevels = [
  {
    id: 1,
    letters: ["R", "A", "R", "E"],
    gridWords: ["RARE", "AREA", "EAR"],
    allWords: ["RARE", "AREA", "REAR", "EAR", "ERA", "ARE"],
  },
  {
    id: 2,
    letters: ["S", "T", "A", "E"],
    gridWords: ["SEAT", "EAST", "ATE", "TEA"],
    allWords: ["SEAT", "EAST", "SET", "SEA", "EAT", "TEA", "SAT", "ATE"],
  },
  {
    id: 3,
    letters: ["L", "O", "P", "E", "S"],
    gridWords: ["SLOPE", "POLES", "LOSE"],
    allWords: ["SLOPE", "POLES", "LOSE", "OPES", "POSE", "SOLE", "SLOP"],
  }
];

// --- COMPONENTS (GameBoard and Cell are unchanged) ---

const Cell = ({ char, revealed, isTarget }) => {
  const baseClasses = "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-2xl rounded-lg transition-all duration-500";
  const revealedClasses = "bg-white text-gray-800 transform scale-105 shadow-lg";
  const hiddenClasses = "bg-blue-400 bg-opacity-50 shadow-inner";
  const notTargetClasses = "bg-transparent border-0";
  if (!isTarget) return <div className={`${baseClasses} ${notTargetClasses}`}></div>;
  return (
    <div className={`${baseClasses} ${revealed ? revealedClasses : hiddenClasses}`}>
      {revealed ? char : ''}
    </div>
  );
};

const GameBoard = ({ level, foundWords }) => {
    const gridDimensions = useMemo(() => {
        let maxX = 0, maxY = 0;
        if (!level || !level.words) return { width: 0, height: 0 };
        level.words.forEach(({ word, start, dir }) => {
            const [y, x] = start;
            if (dir === 'h') { maxY = Math.max(maxY, y + 1); maxX = Math.max(maxX, x + word.length); } 
            else { maxY = Math.max(maxY, y + word.length); maxX = Math.max(maxX, x + 1); }
        });
        return { width: maxX, height: maxY };
    }, [level]);

    const gridMap = useMemo(() => {
        const map = new Map();
        if (!level || !level.words) return map;
        level.words.forEach(({ word, start, dir }) => {
            let [y, x] = start;
            for (let i = 0; i < word.length; i++) {
                const key = `${y},${x}`;
                const existingCell = map.get(key);
                if (existingCell) { existingCell.words.push(word); } 
                else { map.set(key, { char: word[i], words: [word] }); }
                if (dir === 'h') x++; else y++;
            }
        });
        return map;
    }, [level]);

    const grid = [];
    for (let y = 0; y < gridDimensions.height; y++) {
        const row = [];
        for (let x = 0; x < gridDimensions.width; x++) {
            const key = `${y},${x}`;
            const cellData = gridMap.get(key);
            if (cellData) {
                const isRevealed = cellData.words.some(w => foundWords.includes(w));
                row.push({ char: cellData.char, isTarget: true, revealed: isRevealed, key: key });
            } else {
                row.push({ char: null, isTarget: false, revealed: false, key: key });
            }
        }
        grid.push(row);
    }

    return (
        <div className="flex justify-center items-center">
            <div className="grid gap-1">
                {grid.map((row, y) => (
                    <div key={y} className="flex gap-1">
                        {row.map((cell) => <Cell key={cell.key} {...cell} />)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- NEW AND IMPROVED WordInputControl Component ---
const WordInputControl = ({ letters, onWordSubmit, onShuffle }) => {
  const [selection, setSelection] = useState<{ letter: string; originalIndex: number }[]>([]);

  const currentWord = useMemo(() => selection.map(s => s.letter).join(''), [selection]);
  const selectedIndices = useMemo(() => new Set(selection.map(s => s.originalIndex)), [selection]);

  const handleLetterClick = (letter: string, index: number) => {
    if (selectedIndices.has(index)) return;
    setSelection(prev => [...prev, { letter, originalIndex: index }]);
  };

  const handleSubmit = () => {
    if (currentWord.length > 1) { // Only submit if word has 2+ letters
      onWordSubmit(currentWord);
    }
    setSelection([]); // Clear selection after submit
  };
  
  const handleClear = () => {
    setSelection([]);
  }

  const handleShuffleClick = () => {
    onShuffle();
    setSelection([]);
  };

  const gridCols = letters.length <= 4 ? 2 : (letters.length <= 6 ? 3 : 4);
  const gridClass = `grid-cols-${gridCols}`;

  return (
    <div className="flex flex-col items-center mt-4 select-none space-y-4">
      {/* Answer Bar - Click to Submit */}
      <div 
        onClick={handleSubmit}
        className="w-full h-14 bg-white rounded-lg shadow-inner flex items-center justify-center px-4 cursor-pointer hover:bg-gray-100 transition"
      >
        <span className="text-3xl font-bold tracking-[0.2em] text-gray-700 uppercase">
          {currentWord || <span className="text-gray-400 text-xl tracking-normal">Chọn chữ...</span>}
        </span>
      </div>

      {/* Letter Tiles Grid */}
      <div className={`grid ${gridClass} gap-2 w-full max-w-[200px] mx-auto`}>
        {letters.map((letter, index) => {
          const isSelected = selectedIndices.has(index);
          return (
            <button
              key={index}
              onClick={() => handleLetterClick(letter, index)}
              disabled={isSelected}
              className={`
                w-full aspect-square flex items-center justify-center text-3xl font-bold text-white rounded-lg shadow-md transition-all duration-200 ease-in-out
                ${isSelected 
                  ? 'bg-yellow-500 scale-95 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                }`
              }
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center w-full space-x-4 pt-2">
        <button
          onClick={handleShuffleClick}
          className="flex items-center justify-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-gray-600" viewBox="0 0 16 16"><path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3h.5a.5.5 0 0 1 0 1H13c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.318 1.918C9.828 10.99 11.202 12 13 12h.5a.5.5 0 0 1 0 1H13c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 11H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.318-1.918C4.172 5.01 2.798 4 1 4H.5a.5.5 0 0 1-.5-.5z"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/></svg>
          <span className="ml-2 font-semibold text-gray-700 text-sm">Trộn chữ</span>
        </button>
        <button
            onClick={handleClear}
            className="px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors font-semibold text-red-500 text-sm"
        >
            Xóa
        </button>
      </div>
    </div>
  );
};

// --- Toast Notification (No changes) ---
const Toast = ({ message, show, type }) => {
    const baseClasses = "fixed bottom-5 right-5 px-6 py-3 rounded-lg text-white shadow-xl transition-transform duration-300 z-50";
    const typeClasses = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
    const showClasses = "transform translate-y-0 opacity-100";
    const hideClasses = "transform translate-y-10 opacity-0 pointer-events-none";
    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${show ? showClasses : hideClasses}`}>
            {message}
        </div>
    );
};

// --- Main App Component (Logic is mostly the same, simplified layout) ---
export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundWords, setFoundWords] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const level = useMemo(() => {
    const currentRawLevel = rawLevels[currentLevelIndex];
    if (!currentRawLevel) return null;
    const generatedGrid = generateCrosswordLayout(currentRawLevel.gridWords);
    return { ...currentRawLevel, words: generatedGrid };
  }, [currentLevelIndex]);
  
  const [shuffledLetters, setShuffledLetters] = useState(level ? shuffleArray([...level.letters]) : []);

  useEffect(() => {
    if (level) {
      setFoundWords([]);
      setShuffledLetters(shuffleArray([...level.letters]));
    }
  }, [level]);

  const showToast = (message, type = 'info', duration = 2000) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), duration);
  };
  
  const handleWordSubmit = useCallback((word) => {
    if (!word || !level) return;
    const submittedWordUpper = word.toUpperCase();

    if (foundWords.includes(submittedWordUpper)) {
      showToast("Đã tìm thấy từ này rồi!", "info");
    } else if (level.allWords.includes(submittedWordUpper)) {
        setFoundWords(prev => [...prev, submittedWordUpper]);
        const isGridWord = level.words.some(w => w.word === submittedWordUpper);
        showToast(isGridWord ? "Chính xác!" : `"${submittedWordUpper}" là từ hợp lệ!`, "success");
    } else {
      showToast("Sai rồi, thử lại nhé!", "error");
    }
  }, [level, foundWords]);

  const handleShuffle = () => {
    setShuffledLetters(shuffleArray([...shuffledLetters]));
  };
  
  const allGridWordsFound = useMemo(() => {
    if (!level || !level.words) return false;
    return level.words.every(w => foundWords.includes(w.word));
  }, [level, foundWords]);

  const goToNextLevel = () => {
    if (currentLevelIndex < rawLevels.length - 1) {
        setCurrentLevelIndex(prev => prev + 1);
    } else {
      showToast("Bạn đã hoàn thành tất cả các màn!", "success");
    }
  };
  
  const resetLevel = () => {
    setFoundWords([]);
    showToast("Đã làm mới màn chơi!", "info");
  }
  
  if (!level) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Loading Levels...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 font-sans text-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-5">
        <main>
          {allGridWordsFound && (
              <div className="text-center mb-3 animate-pulse">
                <p className="text-lg font-bold text-yellow-300">🎉 Chúc mừng, bạn đã giải xong ô chữ! 🎉</p>
              </div>
          )}
          <GameBoard level={level} foundWords={foundWords} />
          <WordInputControl 
            letters={shuffledLetters} 
            onWordSubmit={handleWordSubmit}
            onShuffle={handleShuffle}
          />
        </main>
        <footer className="mt-4 flex justify-center items-center space-x-4">
            <button onClick={resetLevel} className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors text-sm">Làm mới</button>
            <button 
                onClick={goToNextLevel} 
                disabled={!allGridWordsFound}
                className="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
                Màn tiếp
            </button>
        </footer>
      </div>
        <Toast {...toast} />
    </div>
  );
}
