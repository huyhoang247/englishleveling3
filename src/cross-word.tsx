import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- DICTIONARY: THE ONLY THING YOU NEED TO PROVIDE ---
const MASTER_WORD_LIST = [
  "react", "action", "cat", "ratio", "ion", "tan", "rat", "car", "cart", "arc", "art", "act",
  "reaction", "note", "net", "ton", "ten", "eat", "tea", "ate", "neat", "east", "seat",
  "planet", "plane", "lane", "plan", "ant", "let", "lap", "pan", "pat",
  "silent", "listen", "inlet", "tile", "line", "lens", "tie", "sin", "set", "sit",
  "stable", "table", "bales", "ables", "beat", "bets", "labs", "sale", "belt",
  "heart", "earth", "hat", "her", "the", "tar", "hate", "heat", "tear",
  "creative", "react", "cater", "trace", "active", "cart", "care", "rate", "rice",
  "vector", "cover", "vote", "rove", "core", "veto"
];


// --- LEVEL GENERATION LOGIC (Now lives inside the app) ---

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
              if (newDir === 'v') newStart = [pWord.start[0] - j, pWord.start[1] + k];
              else newStart = [pWord.start[0] + k, pWord.start[1] - j];
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
    if (!wordPlaced) break;
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
    if (grid.has(`${beforeY},${beforeX}`)) return false;
    const afterY = dir === 'v' ? y + word.length : y;
    const afterX = dir === 'h' ? x + word.length : x;
    if (grid.has(`${afterY},${afterX}`)) return false;
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
const getFrequencyMap = (arrOrStr) => {
    const map = new Map();
    for (const char of arrOrStr) {
        map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
};

function generateLevels(wordList, count) {
  const levels = [];
  const usedBaseWords = new Set();
  const potentialBaseWords = wordList.filter(w => w.length >= 6 && w.length <= 8);

  while (levels.length < count && potentialBaseWords.length > 0) {
    const baseWordIndex = Math.floor(Math.random() * potentialBaseWords.length);
    const baseWord = potentialBaseWords.splice(baseWordIndex, 1)[0];
    if (usedBaseWords.has(baseWord)) continue;
    usedBaseWords.add(baseWord);

    const levelLetters = baseWord.toUpperCase().split('');
    const levelLetterFreq = getFrequencyMap(levelLetters);
    
    const allPossibleWords = new Set();
    for (const word of wordList) {
        if (word.length < 3) continue;
        const upperWord = word.toUpperCase();
        const wordFreq = getFrequencyMap(upperWord);
        let canBeFormed = true;
        for (const [char, charCount] of wordFreq.entries()) {
            if (!levelLetterFreq.has(char) || levelLetterFreq.get(char) < charCount) {
                canBeFormed = false;
                break;
            }
        }
        if (canBeFormed) allPossibleWords.add(upperWord);
    }
    const allWordsArray = Array.from(allPossibleWords);

    if (allWordsArray.length < 8) continue;

    const sortedWords = [...allWordsArray].sort((a, b) => b.length - a.length);
    const gridWordsToTry = sortedWords.slice(0, 5);
    const layout = generateCrosswordLayout(gridWordsToTry);
    
    const hasIntersection = layout.some(wordData => {
        for(let i = 0; i < wordData.word.length; i++) {
            const y = wordData.dir === 'v' ? wordData.start[0] + i : wordData.start[0];
            const x = wordData.dir === 'h' ? wordData.start[1] + i : wordData.start[1];
            const isShared = layout.filter(w => w.word !== wordData.word).some(otherWord => {
                for (let j = 0; j < otherWord.word.length; j++) {
                    const otherY = otherWord.dir === 'v' ? otherWord.start[0] + j : otherWord.start[0];
                    const otherX = otherWord.dir === 'h' ? otherWord.start[1] + j : otherWord.start[1];
                    if (y === otherY && x === otherX) return true;
                }
                return false;
            });
            if (isShared) return true;
        }
        return false;
    });

    if (layout.length > 2 && hasIntersection) {
      const finalGridWords = layout.map(item => item.word);
      levels.push({
        id: levels.length + 1,
        letters: levelLetters,
        gridWords: finalGridWords,
        allWords: allWordsArray
      });
    }
  }
  return levels;
}

// --- UI COMPONENTS ---

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 flex flex-col items-center justify-center text-white font-sans">
    <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <h1 className="text-2xl font-bold tracking-wider">Đang tạo màn chơi...</h1>
  </div>
);

const Cell = ({ char, revealed, isTarget }) => {
  const baseClasses = "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-2xl rounded-lg transition-all duration-500";
  const revealedClasses = "bg-white text-gray-800 transform scale-105 shadow-lg";
  const hiddenClasses = "bg-blue-400 bg-opacity-50 shadow-inner";
  const notTargetClasses = "bg-transparent border-0";
  if (!isTarget) return <div className={`${baseClasses} ${notTargetClasses}`}></div>;
  return (<div className={`${baseClasses} ${revealed ? revealedClasses : hiddenClasses}`}>{revealed ? char : ''}</div>);
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
        <div className="flex justify-center items-center"><div className="grid gap-1">{grid.map((row, y) => (<div key={y} className="flex gap-1">{row.map((cell) => <Cell key={cell.key} {...cell} />)}</div>))}</div></div>
    );
};

const WordInputControl = ({ letters, onWordSubmit, isShaking }) => {
  const [currentWord, setCurrentWord] = useState('');
  const handleLetterClick = (letter) => { if (currentWord.length <= 10) setCurrentWord(prev => prev + letter); };
  const handleSubmit = () => { if (!isShaking && currentWord.length > 1) onWordSubmit(currentWord, () => setCurrentWord('')); };
  const handleBackspace = () => setCurrentWord(prev => prev.slice(0, -1));
  return (
    <div className="flex flex-col items-center mt-6 select-none space-y-4 w-full">
      <div className={`w-full h-20 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center px-4 transition-colors ${isShaking ? 'animate-shake bg-red-100' : ''}`}>
        {currentWord ? (
          <>
            <span className="text-3xl font-bold tracking-[0.2em] text-gray-800 uppercase">{currentWord}</span>
            <span className="text-base font-semibold tracking-wider text-gray-500">{currentWord.toLowerCase()}</span>
          </>
        ) : (<span className="text-gray-400 text-xl">...</span>)}
      </div>
      <div className="flex items-center justify-center gap-2 w-full flex-wrap">
        {letters.map((letter) => (<button key={letter} onClick={() => handleLetterClick(letter)} className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 active:scale-95 transition-all">{letter}</button>))}
      </div>
      <div className="flex items-center justify-center gap-3 w-full pt-2">
         <button onClick={handleBackspace} aria-label="Xóa ký tự cuối" className="w-16 h-12 flex items-center justify-center bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-gray-700" viewBox="0 0 16 16"><path d="M5.828 3a1 1 0 0 0-1.06-1.06L.293 6.44a1 1 0 0 0 0 1.414l4.475 4.474A1 1 0 0 0 5.828 11H13a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H5.828zm5.342 5.342a.5.5 0 1 1-.707.707L8.793 8.5l-1.667 1.667a.5.5 0 1 1-.707-.707L8.086 7.793 6.419 6.126a.5.5 0 1 1 .707-.707L8.793 7.086l1.667-1.667a.5.5 0 1 1 .707.707L9.5 7.793l1.67 1.67z"/></svg>
        </button>
        <button onClick={handleSubmit} aria-label="Gửi từ" className="w-24 h-12 flex items-center justify-center bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-colors">
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
    return (<div className={`${baseClasses} ${typeClasses[type]} ${show ? showClasses : hideClasses}`}>{message}</div>);
};

// --- Main App Component ---
export default function App() {
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundWords, setFoundWords] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isShaking, setIsShaking] = useState(false);

  // Effect to generate levels on initial app load
  useEffect(() => {
    // Using setTimeout to prevent blocking the UI thread during initial render.
    // This allows the "Loading..." screen to appear smoothly.
    setTimeout(() => {
      console.log("Generating levels from master word list...");
      const generated = generateLevels(MASTER_WORD_LIST, 5); // Generate 5 levels
      setLevels(generated);
      setIsLoading(false);
      console.log(`${generated.length} levels generated successfully.`);
    }, 100);
  }, []);

  const level = useMemo(() => levels[currentLevelIndex], [levels, currentLevelIndex]);
  
  const keyboardLetters = useMemo(() => {
    if (!level) return [];
    return [...new Set(level.letters)].sort();
  }, [level]);

  const levelLetterFreq = useMemo(() => {
    if (!level) return new Map();
    return getFrequencyMap(level.letters);
  }, [level]);

  useEffect(() => {
    if (level) setFoundWords([]);
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
    const triggerShake = () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 600); };
    if (!canBeFormed) { triggerShake(); clearInputCallback(); return; }
    if (foundWords.includes(submittedWordUpper)) showToast("Đã tìm thấy từ này rồi!", "info");
    else if (level.allWords.includes(submittedWordUpper)) {
        setFoundWords(prev => [...prev, submittedWordUpper]);
        const isGridWord = level.words.some(w => w.word === submittedWordUpper);
        showToast(isGridWord ? "Chính xác!" : `"${submittedWordUpper}" là từ hợp lệ!`, "success");
    } else triggerShake();
    clearInputCallback();
  }, [level, foundWords, levelLetterFreq]);

  const allGridWordsFound = useMemo(() => {
    if (!level || !level.words) return false;
    return level.words.every(w => foundWords.includes(w.word));
  }, [level, foundWords]);

  const goToNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) setCurrentLevelIndex(prev => prev + 1);
    else showToast("Bạn đã hoàn thành tất cả các màn!", "success");
  };
  
  const resetLevel = () => { setFoundWords([]); showToast("Đã làm mới màn chơi!", "info"); }
  
  if (isLoading) return <LoadingScreen />;
  if (!level) return <div className="min-h-screen bg-gray-800 flex items-center justify-center text-white text-center p-4"><h1>Lỗi: Không thể tạo màn chơi. <br/> Vui lòng thử thêm từ vào từ điển.</h1></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 font-sans text-gray-800 flex flex-col items-center justify-center p-4">
      <style>{`@keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } } .animate-shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }`}</style>
      <div className="w-full max-w-sm mx-auto bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-5">
        <main>
          {allGridWordsFound && (<div className="text-center mb-3 animate-pulse"><p className="text-lg font-bold text-yellow-300">🎉 Chúc mừng, bạn đã giải xong ô chữ! 🎉</p></div>)}
          <GameBoard level={level} foundWords={foundWords} />
          <WordInputControl letters={keyboardLetters} onWordSubmit={handleWordSubmit} isShaking={isShaking} />
        </main>
        <footer className="mt-6 flex justify-center items-center space-x-4">
            <button onClick={resetLevel} className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors text-sm">Làm mới</button>
            <button onClick={goToNextLevel} disabled={!allGridWordsFound} className="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">Màn tiếp</button>
        </footer>
      </div>
      <Toast {...toast} />
    </div>
  );
}
