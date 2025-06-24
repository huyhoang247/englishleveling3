import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- UTILITY FUNCTIONS ---

// Helper function to create a frequency map of characters
const getFrequencyMap = (arrOrStr) => {
    const map = new Map();
    for (const char of arrOrStr) {
        map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
}

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


// --- START: LOGIC TẠO Ô CHỮ THÔNG MINH ---

/**
 * [MỚI] Chấm điểm một vị trí đặt từ tiềm năng.
 * Điểm cao hơn cho các vị trí tạo ra nhiều kết nối.
 */
const calculatePlacementScore = (grid, word, start, dir) => {
    let score = 0;
    const [y, x] = start;

    for (let i = 0; i < word.length; i++) {
        const currentY = dir === 'v' ? y + i : y;
        const currentX = dir === 'h' ? x + i : x;

        // Điểm cho việc giao cắt với một từ khác
        if (grid.has(`${currentY},${currentX}`)) {
            score += 2; // Giao điểm luôn được đánh giá cao
        }

        // Điểm cho việc nằm cạnh một từ khác (tăng độ đặc)
        const neighbors = dir === 'h' 
            ? [`${currentY - 1},${currentX}`, `${currentY + 1},${currentX}`] 
            : [`${currentY},${currentX - 1}`, `${currentY},${currentX + 1}`];
        
        if (neighbors.some(nKey => grid.has(nKey))) {
            score += 1;
        }
    }
    return score;
};

/**
 * [ĐÃ NÂNG CẤP] Tạo layout ô chữ bằng cách chọn vị trí tốt nhất.
 * Thuật toán này ưu tiên các ô chữ dày đặc và có tính kết nối cao.
 */
const generateCrosswordLayout = (words) => {
  if (!words || words.length === 0) return [];
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const placedWords = [];
  const grid = new Map();

  // Đặt từ đầu tiên
  const firstWord = sortedWords.shift();
  if (!firstWord) return [];
  const firstWordStart = [0, 0];
  placedWords.push({ word: firstWord, start: firstWordStart, dir: 'h' });
  for (let i = 0; i < firstWord.length; i++) {
    grid.set(`${firstWordStart[0]},${firstWordStart[1] + i}`, firstWord[i]);
  }

  const remainingWords = new Set(sortedWords);
  let attempts = 0;
  // Vòng lặp sẽ cố gắng đặt các từ cho đến khi không thể đặt thêm
  while (remainingWords.size > 0 && attempts < remainingWords.size) {
    let bestFit = null;
    let bestScore = -1;
    let wordToPlace = null;

    // Tìm vị trí TỐT NHẤT trong tất cả các khả năng
    for (const currentWord of remainingWords) {
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
                // Chấm điểm vị trí thay vì chọn ngay
                const score = calculatePlacementScore(grid, currentWord, newStart, newDir);
                if (score > bestScore) {
                  bestScore = score;
                  bestFit = { word: currentWord, start: newStart, dir: newDir };
                  wordToPlace = currentWord;
                }
              }
            }
          }
        }
      }
    }

    if (bestFit && wordToPlace) {
      // Thực hiện việc đặt từ sau khi đã tìm được vị trí tốt nhất
      placedWords.push(bestFit);
      for (let l = 0; l < bestFit.word.length; l++) {
        const key = bestFit.dir === 'h' 
            ? `${bestFit.start[0]},${bestFit.start[1] + l}` 
            : `${bestFit.start[0] + l},${bestFit.start[1]}`;
        grid.set(key, bestFit.word[l]);
      }
      remainingWords.delete(wordToPlace);
      attempts = 0; // Reset attempts vì đã đặt thành công
    } else {
      attempts++; // Nếu không có từ nào có thể được đặt, tăng attempts để tránh lặp vô hạn
    }
  }

  if(remainingWords.size > 0){
      console.warn("Could not place all words. Remaining:", [...remainingWords]);
  }

  return normalizeCoords(placedWords);
};

// --- END: LOGIC TẠO Ô CHỮ THÔNG MINH ---


// --- LOGIC TỰ ĐỘNG TẠO LEVEL TỪ DANH SÁCH TỪ ---

const wordList = [
  "Insurance", "Argument", "Influence", "Release", "Capacity", "Senate", "Massive",
  "Stick", "District", "Budget", "Measure", "Cross", "Central", "Proud", "Core",
  "County", "Species", "Conditions", "Touch", "Mass", "Platform", "Straight",
  "Serious", "Encourage", "Due", "Memory", "Secretary", "Cold", "Instance",
  "Foundation", "Separate", "Map", "Ice", "Statement", "Rich", "Previous",
  "Necessary", "Engineering", "Heat", "Collection", "Labor", "Flow", "Floor",
  "Variety", "Math", "Session", "Nuclear", "Roll", "Museum", "Limited",
  "Constant", "Temperature", "Description", "Transition", "Chair", "Pattern",
  "Demand", "Hate", "Classroom", "Army", "Spring", "Senior", "Wind", "Award",
  "Clinical", "Trouble", "Grade", "Station", "Moments", "Wave", "Block",
  "Compared", "Strength", "Phase", "Secret", "Highest", "Leaving", "Obvious",
  "Terrible", "Motion", "Window", "Assume", "Cycle", "Suddenly", "Western",
  "Broken", "Define", "Spiritual", "Concerns", "Random", "Moon", "Dangerous",
  "Trees", "Trip", "Curious", "Heavy", "Fly", "Noticed", "March"
].map(w => w.toUpperCase());

const findPossibleWords = (seedWord, fullWordList) => {
  const seedFreq = getFrequencyMap(seedWord);
  const possibleWords = [];
  for (const candidateWord of fullWordList) {
    if (candidateWord.length < 3) continue;
    const candidateFreq = getFrequencyMap(candidateWord);
    let canBeFormed = true;
    for (const [char, count] of candidateFreq.entries()) {
      if (!seedFreq.has(char) || seedFreq.get(char) < count) {
        canBeFormed = false;
        break;
      }
    }
    if (canBeFormed) {
      possibleWords.push(candidateWord);
    }
  }
  return possibleWords;
};

export const generateLevelsFromWordList = (sourceWords) => {
  const levels = [];
  const usedWords = new Set();

  const MIN_SEED_WORD_LENGTH = 7;
  const MIN_WORDS_IN_LEVEL_GROUP = 5;
  const NUM_CANDIDATES_FOR_GRID = 8;
  const MIN_PLACED_GRID_WORDS = 3;

  const sortedSourceWords = [...sourceWords].sort((a, b) => b.length - a.length);

  for (const seedWord of sortedSourceWords) {
    if (usedWords.has(seedWord) || seedWord.length < MIN_SEED_WORD_LENGTH) continue;

    const possibleWords = findPossibleWords(seedWord, sourceWords);
    if (possibleWords.length < MIN_WORDS_IN_LEVEL_GROUP) continue;

    const gridWordCandidates = [...possibleWords]
      .sort((a, b) => b.length - a.length)
      .slice(0, NUM_CANDIDATES_FOR_GRID);
      
    const placedWordsLayout = generateCrosswordLayout(gridWordCandidates);

    if (placedWordsLayout.length >= MIN_PLACED_GRID_WORDS) {
      const gridWords = placedWordsLayout.map(p => p.word);
      const newLevel = {
        id: levels.length + 1,
        letters: seedWord.split(''),
        gridWords: gridWords,
        allWords: [...new Set(possibleWords)],
      };
      levels.push(newLevel);
      console.log(`Tạo thành công Level ${newLevel.id} từ từ gốc "${seedWord}". Bao gồm ${possibleWords.length} từ.`);
      possibleWords.forEach(word => usedWords.add(word));
    }
  }

  if (levels.length === 0) {
      console.warn("Không thể tạo level, trả về level mặc định.");
      return [{
        id: 1,
        letters: ["E", "X", "A", "M", "P", "L", "E"],
        gridWords: ["EXAMPLE", "MAPLE", "LAME"],
        allWords: ["EXAMPLE", "MAPLE", "LAME", "MEAL", "MALE", "PALM", "LAMP"],
      }];
  }

  return levels;
};


// --- COMPONENTS (Không thay đổi) ---
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
        <div className="flex justify-center items-center py-4">
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

const WordInputControl = ({ letters, onWordSubmit, isShaking }) => {
  const [currentWord, setCurrentWord] = useState('');

  const handleLetterClick = (letter: string) => {
    if (currentWord.length > 10) return;
    setCurrentWord(prev => prev + letter);
  };

  const handleSubmit = () => {
    if (isShaking) return;
    if (currentWord.length > 1) {
      onWordSubmit(currentWord, () => setCurrentWord(''));
    }
  };
  
  const handleBackspace = () => {
    setCurrentWord(prev => prev.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center mt-6 select-none space-y-4 w-full">
      <div 
        className={`w-full h-20 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center px-4 transition-colors
        ${isShaking ? 'animate-shake bg-red-100' : ''}`}
      >
        {currentWord ? (
          <>
            <span className="text-3xl font-bold tracking-[0.2em] text-gray-800 uppercase">
              {currentWord}
            </span>
            <span className="text-base font-semibold tracking-wider text-gray-500">
              {currentWord.toLowerCase()}
            </span>
          </>
        ) : (
          <span className="text-gray-400 text-xl">...</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 w-full">
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 active:scale-95 transition-all"
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 w-full pt-2">
         <button
          onClick={handleBackspace}
          aria-label="Xóa ký tự cuối"
          className="w-16 h-12 flex items-center justify-center bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-gray-700" viewBox="0 0 16 16"><path d="M5.828 3a1 1 0 0 0-1.06-1.06L.293 6.44a1 1 0 0 0 0 1.414l4.475 4.474A1 1 0 0 0 5.828 11H13a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H5.828zm5.342 5.342a.5.5 0 1 1-.707.707L8.793 8.5l-1.667 1.667a.5.5 0 1 1-.707-.707L8.086 7.793 6.419 6.126a.5.5 0 1 1 .707-.707L8.793 7.086l1.667-1.667a.5.5 0 1 1 .707.707L9.5 7.793l1.67 1.67z"/></svg>
        </button>
        <button
          onClick={handleSubmit}
          aria-label="Gửi từ"
          className="w-24 h-12 flex items-center justify-center bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="text-white" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/></svg>
        </button>
      </div>
    </div>
  );
};

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


// --- Main App Component ---
export default function App() {
  const rawLevels = useMemo(() => generateLevelsFromWordList(wordList), []);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundWords, setFoundWords] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isShaking, setIsShaking] = useState(false);

  const level = useMemo(() => {
    const currentRawLevel = rawLevels[currentLevelIndex];
    if (!currentRawLevel) return null;
    const generatedGrid = generateCrosswordLayout(currentRawLevel.gridWords);
    return { ...currentRawLevel, words: generatedGrid };
  }, [currentLevelIndex, rawLevels]);
  
  const keyboardLetters = useMemo(() => {
    if (!level) return [];
    return [...new Set(level.letters)].sort();
  }, [level]);

  const levelLetterFreq = useMemo(() => {
    if (!level) return new Map();
    return getFrequencyMap(level.letters);
  }, [level]);

  useEffect(() => {
    if (level) {
      setFoundWords([]);
    }
  }, [level]);

  const showToast = (message, type = 'info', duration = 2000) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), duration);
  };
  
  const handleWordSubmit = useCallback((word, clearInputCallback) => {
    if (!word || !level) return;
    const submittedWordUpper = word.toUpperCase();

    const submittedWordFreq = getFrequencyMap(submittedWordUpper);
    let canBeFormed = true;
    for (const [char, count] of submittedWordFreq.entries()) {
        if (!levelLetterFreq.has(char) || levelLetterFreq.get(char) < count) {
            canBeFormed = false;
            break;
        }
    }

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
    };

    if (!canBeFormed) {
        triggerShake();
        clearInputCallback();
        return;
    }
    
    if (foundWords.includes(submittedWordUpper)) {
      showToast("Đã tìm thấy từ này rồi!", "info");
    } else if (level.allWords.includes(submittedWordUpper)) {
        setFoundWords(prev => [...prev, submittedWordUpper]);
        const isGridWord = level.words.some(w => w.word === submittedWordUpper);
        showToast(isGridWord ? "Chính xác!" : `"${submittedWordUpper}" là từ hợp lệ!`, "success");
    } else {
      triggerShake();
    }
    
    clearInputCallback();
  }, [level, foundWords, levelLetterFreq]);

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
        <h1 className="text-4xl font-bold text-white">Đang tạo các màn chơi...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 font-sans text-gray-800 flex flex-col items-center justify-center p-4">
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      <div className="w-full max-w-sm mx-auto bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-5">
        <header className='text-center mb-2'>
            <h1 className='text-2xl font-bold text-white'>Ô Chữ Vui Vẻ</h1>
            <p className='text-sm text-white/80'>Màn {level.id} / {rawLevels.length}</p>
        </header>
        <main>
          {allGridWordsFound && (
              <div className="text-center mb-3 animate-pulse">
                <p className="text-lg font-bold text-yellow-300">🎉 Chúc mừng, bạn đã giải xong ô chữ! 🎉</p>
              </div>
          )}
          <GameBoard level={level} foundWords={foundWords} />
          <WordInputControl 
            letters={keyboardLetters} 
            onWordSubmit={handleWordSubmit}
            isShaking={isShaking}
          />
        </main>
        <footer className="mt-6 flex justify-center items-center space-x-4">
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
