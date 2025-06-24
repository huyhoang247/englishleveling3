import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- UTILITY FUNCTIONS ---
const getFrequencyMap = (arrOrStr) => {
    const map = new Map();
    for (const char of arrOrStr) {
        map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
}

const canPlaceWord = (grid, word, start, dir) => {
  const [y, x] = start;
  // Kiểm tra xem từ có vừa vặn và có xung đột không
  for (let i = 0; i < word.length; i++) {
    const currentY = dir === 'v' ? y + i : y;
    const currentX = dir === 'h' ? x + i : x;
    const key = `${currentY},${currentX}`;
    const gridChar = grid.get(key);

    // Nếu có một ký tự ở đó, nó phải khớp (điểm giao)
    if (gridChar && gridChar !== word[i]) {
        return false;
    }
    // Nếu không có ký tự (ô trống), kiểm tra các ô liền kề không thuộc hướng đặt từ
    if (!gridChar) {
        const perpNeighbors = dir === 'h' 
            ? [`${currentY - 1},${currentX}`, `${currentY + 1},${currentX}`] 
            : [`${currentY},${currentX - 1}`, `${currentY},${currentX + 1}`];
        if (perpNeighbors.some(nKey => grid.has(nKey))) {
            return false;
        }
    }
  }
  // Kiểm tra ký tự ngay trước và ngay sau từ để đảm bảo chúng không nối liền với từ khác
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


// --- START: LOGIC TẠO Ô CHỮ THÔNG MINH V6 (Tối ưu hóa Mật độ) ---

/**
 * Tính toán kích thước (bounding box) của một layout đã cho.
 * @param {Array} placedWords - Mảng các từ đã được đặt.
 * @returns {Object} - { width, height, area }
 */
const getLayoutDimensions = (placedWords) => {
    if (placedWords.length === 0) return { width: 0, height: 0, area: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    placedWords.forEach(({ word, start, dir }) => {
        const [y, x] = start;
        minY = Math.min(minY, y);
        minX = Math.min(minX, x);
        if (dir === 'h') {
            maxY = Math.max(maxY, y);
            maxX = Math.max(maxX, x + word.length - 1);
        } else { // 'v'
            maxY = Math.max(maxY, y + word.length - 1);
            maxX = Math.max(maxX, x);
        }
    });

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    return { width, height, area: width * height };
};


/**
 * [NÂNG CẤP V6] Hàm tính điểm tối ưu hóa mật độ.
 * Ưu tiên:
 * 1. Nhiều giao điểm (quan trọng nhất).
 * 2. Mật độ ô chữ cao (giúp ô chữ nhỏ gọn).
 * 3. Kết dính (một chút điểm thưởng nếu đặt cạnh từ khác).
 */
const calculatePlacementScoreV3 = (grid, currentLayout, newWordPlacement) => {
    const { word, start, dir } = newWordPlacement;

    // 1. Điểm cho giao điểm (Intersection Score) - Ưu tiên tuyệt đối
    let intersectionCount = 0;
    for (let i = 0; i < word.length; i++) {
        const currentY = dir === 'v' ? start[0] + i : start[0];
        const currentX = dir === 'h' ? start[1] + i : start[1];
        if (grid.has(`${currentY},${currentX}`)) {
            intersectionCount++;
        }
    }
    // Không có giao điểm thì đây là một nước đi rất tệ (trừ khi là từ đầu tiên)
    if (intersectionCount === 0) return -1000;

    // 2. Điểm cho mật độ (Density Score) - Yếu tố quyết định sự nhỏ gọn
    const newLayout = [...currentLayout, newWordPlacement];
    const { area: newArea } = getLayoutDimensions(newLayout);
    
    // Đếm tổng số ô có chữ độc nhất trong layout mới
    const uniqueCells = new Set();
    newLayout.forEach(pWord => {
        for(let i=0; i < pWord.word.length; i++) {
            const y = pWord.dir === 'v' ? pWord.start[0] + i : pWord.start[0];
            const x = pWord.dir === 'h' ? pWord.start[1] + i : pWord.start[1];
            uniqueCells.add(`${y},${x}`);
        }
    });
    const letterCount = uniqueCells.size;
    const density = letterCount / newArea;

    // 3. Điểm cho sự kết dính (Adjacency Score) - Tie-breaker
    let adjacencyScore = 0;
    for (let i = 0; i < word.length; i++) {
        const currentY = dir === 'v' ? start[0] + i : start[0];
        const currentX = dir === 'h' ? start[1] + i : start[1];
        const neighbors = [
            `${currentY - 1},${currentX}`, `${currentY + 1},${currentX}`,
            `${currentY},${currentX - 1}`, `${currentY},${currentX + 1}`
        ];
        if (neighbors.some(nKey => grid.has(nKey) && !grid.has(`${currentY},${currentX}`))) {
            adjacencyScore += 0.1; // Điểm nhỏ để phá vỡ thế cân bằng
        }
    }

    // Công thức điểm cuối cùng
    // Trọng số cao cho giao điểm và mật độ
    return (intersectionCount * 10) + (density * 5) + adjacencyScore;
};


/**
 * [NÂNG CẤP LỚN V6] Tạo layout bằng thuật toán "Smarter Greedy" với điểm mật độ.
 */
const generateCrosswordLayout = (words) => {
  if (!words || words.length === 0) return [];
  if (words.length === 1) {
      return [{ word: words[0], start: [0, 0], dir: 'h' }];
  }

  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  let bestInitialLayout = null;
  let maxDensity = 0; // Thay vì minArea, ta tìm cặp có mật độ cao nhất

  // Bước 1: Tìm "cặp hạt nhân" tốt nhất dựa trên mật độ
  for (let i = 0; i < sortedWords.length; i++) {
    for (let j = i + 1; j < sortedWords.length; j++) {
      const wordA = sortedWords[i];
      const wordB = sortedWords[j];
      for (let charA_idx = 0; charA_idx < wordA.length; charA_idx++) {
        for (let charB_idx = 0; charB_idx < wordB.length; charB_idx++) {
          if (wordA[charA_idx] === wordB[charB_idx]) {
            const placedA = { word: wordA, start: [0, -charA_idx], dir: 'h' };
            const placedB = { word: wordB, start: [-charB_idx, 0], dir: 'v' };
            const { area } = getLayoutDimensions([placedA, placedB]);
            const density = (wordA.length + wordB.length - 1) / area; // -1 vì có 1 ô chung
            
            if (density > maxDensity) {
              maxDensity = density;
              bestInitialLayout = {
                placed: [placedA, placedB],
                remaining: new Set(sortedWords.filter(w => w !== wordA && w !== wordB))
              };
            }
          }
        }
      }
    }
  }

  if (!bestInitialLayout) {
      const firstWord = sortedWords[0];
      bestInitialLayout = {
          placed: [{ word: firstWord, start: [0, 0], dir: 'h' }],
          remaining: new Set(sortedWords.slice(1))
      };
  }

  const placedWords = bestInitialLayout.placed;
  const remainingWords = bestInitialLayout.remaining;
  const grid = new Map();
  placedWords.forEach(pWord => {
      for (let i = 0; i < pWord.word.length; i++) {
          const key = pWord.dir === 'h' ? `${pWord.start[0]},${pWord.start[1] + i}` : `${pWord.start[0] + i},${pWord.start[1]}`;
          grid.set(key, pWord.word[i]);
      }
  });

  // Bước 2: Thêm các từ còn lại bằng cách đánh giá tất cả các khả năng
  let placedThisRound = true;
  while (remainingWords.size > 0 && placedThisRound) {
    placedThisRound = false;
    let possiblePlacements = [];

    const sortedRemaining = [...remainingWords].sort((a,b) => b.length - a.length);
    
    for (const currentWord of sortedRemaining) {
      for (const pWord of placedWords) {
        for (let j = 0; j < currentWord.length; j++) {
          for (let k = 0; k < pWord.word.length; k++) {
            if (currentWord[j] === pWord.word[k]) {
              const newDir = pWord.dir === 'h' ? 'v' : 'h';
              const newStart = newDir === 'v'
                ? [pWord.start[0] - j, pWord.start[1] + k]
                : [pWord.start[0] + k, pWord.start[1] - j];

              if (canPlaceWord(grid, currentWord, newStart, newDir)) {
                const placement = { word: currentWord, start: newStart, dir: newDir };
                const score = calculatePlacementScoreV3(grid, placedWords, placement);
                possiblePlacements.push({ ...placement, score });
              }
            }
          }
        }
      }
    }

    if (possiblePlacements.length > 0) {
      possiblePlacements.sort((a, b) => b.score - a.score);
      const bestFit = possiblePlacements[0];

      placedWords.push({ word: bestFit.word, start: bestFit.start, dir: bestFit.dir });
      for (let l = 0; l < bestFit.word.length; l++) {
        const key = bestFit.dir === 'h' ? `${bestFit.start[0]},${bestFit.start[1] + l}` : `${bestFit.start[0] + l},${bestFit.start[1]}`;
        grid.set(key, bestFit.word[l]);
      }
      remainingWords.delete(bestFit.word);
      placedThisRound = true;
    }
  }

  if(remainingWords.size > 0){
      console.warn("V6 - Could not place all words. Remaining:", [...remainingWords]);
  }

  return normalizeCoords(placedWords);
};
// --- END: LOGIC TẠO Ô CHỮ THÔNG MINH V6 ---


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
  const MIN_WORDS_IN_LEVEL_GROUP = 7; 
  const NUM_CANDIDATES_FOR_GRID = 20; 
  const MIN_PLACED_GRID_WORDS = 7; // Tăng yêu cầu lên vì thuật toán đã tốt hơn

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
      console.log(`Tạo thành công Level ${newLevel.id} từ từ gốc "${seedWord}". Bao gồm ${possibleWords.length} từ. Đã đặt ${gridWords.length} từ vào lưới.`);
      possibleWords.forEach(word => usedWords.add(word));
    }
  }

  if (levels.length === 0) {
      console.warn("Không thể tạo level, trả về level mặc định.");
      return [{
        id: 1,
        letters: ["S", "T", "R", "O", "N", "G", "E"],
        gridWords: ["STRONG", "STORE", "GONE", "REST", "SONG", "RENT"],
        allWords: ["STRONG", "STORE", "GONE", "REST", "SONG", "RENT", "TONGS", "ROSE"],
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

    // Tự động điều chỉnh kích thước ô chữ cho vừa màn hình nhỏ
    const scale = useMemo(() => {
        if (typeof window === 'undefined') return 1;
        const maxDim = Math.max(gridDimensions.width, gridDimensions.height);
        const containerWidth = Math.min(window.innerWidth * 0.9, 400); // 90% viewport or 400px
        const cellSize = 44; // w-10+gap1 = 40+4 = 44px
        if (maxDim * cellSize > containerWidth) {
            return containerWidth / (maxDim * cellSize);
        }
        return 1;
    }, [gridDimensions]);

    return (
        <div className="flex justify-center items-center py-4">
            <div className="grid gap-1" style={{ transform: `scale(${scale})` }}>
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

  const handleLetterClick = (letter) => {
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
          </>
        ) : (
          <span className="text-gray-400 text-xl">...</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 w-full flex-wrap">
        {letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
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
    const baseClasses = "fixed bottom-5 right-5 px-6 py-3 rounded-lg text-white shadow-xl transition-all duration-300 z-50";
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
    return { ...currentRawLevel, words: generateCrosswordLayout(currentRawLevel.gridWords) };
  }, [currentLevelIndex, rawLevels]);
  
  const keyboardLetters = useMemo(() => {
    if (!level) return [];
    return [...new Set(level.letters)];
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
        const isGridWord = level.gridWords.includes(submittedWordUpper);
        showToast(isGridWord ? "Chính xác!" : `"${submittedWordUpper}" là từ hợp lệ!`, "success");
    } else {
      triggerShake();
    }
    
    clearInputCallback();
  }, [level, foundWords, levelLetterFreq]);

  const allGridWordsFound = useMemo(() => {
    if (!level || !level.gridWords) return false;
    return level.gridWords.every(w => foundWords.includes(w));
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
      <div className="min-h-screen bg-gray-800 flex items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-white">Đang tạo các màn chơi...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 font-sans text-gray-800 flex flex-col items-center justify-start p-4 pt-8">
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
              <div className="text-center my-3 animate-pulse">
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
