import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- UTILITY FUNCTIONS FOR AUTO-GENERATING GRID LAYOUT ---

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


// --- LEVEL DATA (SIMPLIFIED FOR AUTO-GENERATION) ---
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


// --- COMPONENTS ---

// 1. Grid Cell Component
const Cell = ({ char, revealed, isTarget }) => {
  const baseClasses = "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-2xl rounded-lg transition-all duration-500";
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

// 2. Game Board Component
const GameBoard = ({ level, foundWords }) => {
    const gridDimensions = useMemo(() => {
        let maxX = 0, maxY = 0;
        if (!level || !level.words) return { width: 0, height: 0 };
        level.words.forEach(({ word, start, dir }) => {
            const [y, x] = start;
            if (dir === 'h') {
                maxY = Math.max(maxY, y + 1);
                maxX = Math.max(maxX, x + word.length);
            } else {
                maxY = Math.max(maxY, y + word.length);
                maxX = Math.max(maxX, x + 1);
            }
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
                if (existingCell) {
                    existingCell.words.push(word);
                } else {
                    map.set(key, { char: word[i], words: [word] });
                }
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
        <div className="p-4 flex justify-center items-center">
            <div className="grid gap-1.5">
                {grid.map((row, y) => (
                    <div key={y} className="flex gap-1.5">
                        {row.map((cell) => <Cell key={cell.key} {...cell} />)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Word Input Control Component (Replaces LetterGrid)
const WordInputControl = ({ letters, onWordSubmit, onShuffle }) => {
  const [selection, setSelection] = useState<{ letter: string; originalIndex: number }[]>([]);

  const currentWord = useMemo(() => selection.map(s => s.letter).join(''), [selection]);
  const selectedIndices = useMemo(() => new Set(selection.map(s => s.originalIndex)), [selection]);

  const handleLetterClick = (letter, index) => {
    if (selectedIndices.has(index)) return;
    setSelection(prev => [...prev, { letter, originalIndex: index }]);
  };

  const handleBackspace = () => {
    setSelection(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (currentWord.length > 0) {
      onWordSubmit(currentWord);
    }
    setSelection([]);
  };

  const handleShuffleClick = () => {
    onShuffle();
    setSelection([]);
  };

  const gridCols = letters.length <= 4 ? 2 : (letters.length <= 6 ? 3 : 4);
  const gridClass = `grid-cols-${gridCols}`;

  return (
    <div className="flex flex-col items-center mt-6 select-none space-y-5">
      {/* Answer Display Bar */}
      <div className="w-full h-16 bg-white rounded-xl shadow-inner flex items-center justify-center px-4">
        <span className="text-3xl sm:text-4xl font-bold tracking-[0.2em] text-gray-800 uppercase">{currentWord}</span>
      </div>

      {/* Letter Tiles Grid */}
      <div className={`grid ${gridClass} gap-3 w-full max-w-xs mx-auto`}>
        {letters.map((letter, index) => {
          const isSelected = selectedIndices.has(index);
          return (
            <div key={index} className="aspect-square">
              <button
                onClick={() => handleLetterClick(letter, index)}
                className={`w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-blue-500 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 ${isSelected ? 'invisible' : 'visible'}`}
              >
                {letter}
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center w-full space-x-3 pt-2">
        <button
          onClick={handleShuffleClick}
          className="flex items-center justify-center px-4 py-3 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-shuffle text-gray-700" viewBox="0 0 16 16"><path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3h.5a.5.5 0 0 1 0 1H13c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.318 1.918C9.828 10.99 11.202 12 13 12h.5a.5.5 0 0 1 0 1H13c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 11H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.318-1.918C4.172 5.01 2.798 4 1 4H.5a.5.5 0 0 1-.5-.5z"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/></svg>
          <span className="ml-2 font-semibold text-gray-700">Trộn chữ</span>
        </button>
         <button
            onClick={handleBackspace}
            className="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full shadow-md hover:bg-yellow-600 transition-colors text-white"
            aria-label="Xoá ký tự cuối"
        >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-backspace-fill" viewBox="0 0 16 16"><path d="M15.683 3a2 2 0 0 0-2-2h-7.08a2 2 0 0 0-1.519.698L.241 7.35a1 1 0 0 0 0 1.302l4.843 5.65A2 2 0 0 0 6.603 15h7.08a2 2 0 0 0 2-2V3zM5.829 5.854a.5.5 0 1 1 .707-.708l2.147 2.147 2.146-2.147a.5.5 0 1 1 .707.708L9.39 8l2.146 2.146a.5.5 0 0 1-.707.708L8.683 8.707l-2.147 2.147a.5.5 0 0 1-.707-.708L7.976 8 5.829 5.854z"/></svg>
        </button>
        <button
            onClick={handleSubmit}
            className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-md hover:bg-green-600 transition-colors text-white"
            aria-label="Kiểm tra từ"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/></svg>
        </button>
      </div>
    </div>
  );
};


// 4. Toast Notification
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


// Main App Component
export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundWords, setFoundWords] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Memoize level data including the generated crossword layout
  const level = useMemo(() => {
    const currentRawLevel = rawLevels[currentLevelIndex];
    if (!currentRawLevel) return null;
    const generatedGrid = generateCrosswordLayout(currentRawLevel.gridWords);
    return { ...currentRawLevel, words: generatedGrid };
  }, [currentLevelIndex]);
  
  // State for shuffled letters, initialized with current level's letters
  const [shuffledLetters, setShuffledLetters] = useState(level ? shuffleArray([...level.letters]) : []);

  // Effect to reset game state when level changes
  useEffect(() => {
    if (level) {
      setFoundWords([]);
      setShuffledLetters(shuffleArray([...level.letters]));
    }
  }, [level]);

  // Function to show toast notifications
  const showToast = (message, type = 'info', duration = 2000) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), duration);
  };
  
  // Callback for when a word is submitted
  const handleWordSubmit = useCallback((word) => {
    if (!word || !level) return;
    const submittedWordUpper = word.toUpperCase();

    if (foundWords.includes(submittedWordUpper)) {
      showToast("Đã tìm thấy từ này rồi!", "info");
    } else if (level.words.some(w => w.word === submittedWordUpper)) {
      setFoundWords(prev => [...prev, submittedWordUpper]);
      showToast("Chính xác!", "success");
    } else if (level.allWords.includes(submittedWordUpper)) {
        setFoundWords(prev => [...prev, submittedWordUpper]);
        showToast(`"${submittedWordUpper}" là một từ đúng!`, "success");
    } else {
      showToast("Sai rồi, thử lại nhé!", "error");
    }
  }, [level, foundWords]);

  // Callback to shuffle the letters
  const handleShuffle = () => {
    setShuffledLetters(shuffleArray([...shuffledLetters]));
  };
  
  // Check if all grid words have been found
  const allWordsFound = useMemo(() => {
    if (!level || !level.words) return false;
    return level.words.every(w => foundWords.includes(w.word));
  }, [level, foundWords]);

  // Go to the next level
  const goToNextLevel = () => {
    if (currentLevelIndex < rawLevels.length - 1) {
        setCurrentLevelIndex(prev => prev + 1);
    } else {
      showToast("Bạn đã hoàn thành tất cả các màn!", "success");
    }
  };
  
  // Reset the current level
  const resetLevel = () => {
    setFoundWords([]);
    showToast("Đã làm mới màn chơi!", "info");
  }
  
  // Loading state if level data is not ready
  if (!level) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Loading Levels...</h1>
      </div>
    );
  }

  // Main game rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-400 to-indigo-500 font-sans text-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white/30 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6">
        <main>
          <GameBoard level={level} foundWords={foundWords} />
          {allWordsFound && (
              <div className="text-center my-4 animate-pulse">
                <p className="text-xl sm:text-2xl font-bold text-yellow-300">🎉 Chúc mừng, bạn đã giải được ô chữ! 🎉</p>
              </div>
          )}
          <WordInputControl 
            letters={shuffledLetters} 
            onWordSubmit={handleWordSubmit}
            onShuffle={handleShuffle}
          />
        </main>
        <footer className="mt-6 flex justify-center items-center space-x-4">
            <button onClick={resetLevel} className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors">Làm mới</button>
            <button 
                onClick={goToNextLevel} 
                disabled={!allWordsFound}
                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Màn tiếp
            </button>
        </footer>
      </div>
        <Toast {...toast} />
    </div>
  );
}
