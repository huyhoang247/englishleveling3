// --- START OF FILE fill-blank-context.tsx ---

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
// <<< START: THAY ĐỔI IMPORT
// Gỡ bỏ import trực tiếp, thay bằng import hook `useQuizApp`
import { useQuizApp } from '../course-context.tsx'; // Giả sử đường dẫn này là đúng
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
// <<< END: THAY ĐỔI IMPORT


// --- HELPER FUNCTION (Giả sử bạn đã chuyển nó sang một file utils) ---
const shuffleArray = <T extends any[]>(array: T): T => { 
  const shuffledArray = [...array]; 
  for (let i = shuffledArray.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; 
  } 
  return shuffledArray as T; 
};

// --- INTERFACES ---
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
  question?: string;
  vietnameseHint?: string;
  audioUrls?: { [voiceName: string]: string }; 
}

// --- CONTEXT TYPE DEFINITION ---
interface FillWordContextType {
  // Game State
  loading: boolean;
  error: string | null;
  gameOver: boolean;
  currentWord: VocabularyItem | null;
  vocabularyList: VocabularyItem[];
  isMultiWordGame: boolean;

  // User Progress & Stats
  coins: number;
  displayedCoins: number;
  streak: number;
  masteryCount: number;
  timeLeft: number;
  TOTAL_TIME: number;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  
  // UI Interaction State
  userInput: string;
  isCorrect: boolean | null;
  filledWords: string[];
  activeBlankIndex: number | null;
  shake: boolean;
  streakAnimation: boolean;
  showConfetti: boolean;
  showImagePopup: boolean;
  showPhrasePopup: boolean;
  showExamPopup: boolean;
  
  // Actions & Setters
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  setActiveBlankIndex: React.Dispatch<React.SetStateAction<number | null>>;
  checkAnswer: () => Promise<void>;
  handleMultiWordCheck: () => void;
  resetGame: () => void;
  setShowImagePopup: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPhrasePopup: React.Dispatch<React.SetStateAction<boolean>>;
  setShowExamPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

const FillWordContext = createContext<FillWordContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface FillWordProviderProps {
  children: ReactNode;
  selectedPractice: number;
  // user: User | null; // <<< DÒNG CŨ: Gỡ bỏ prop `user`
}

export const FillWordProvider: React.FC<FillWordProviderProps> = ({ children, selectedPractice }) => {
  // <<< START: SỬ DỤNG HOOK TỪ CONTEXT TRUNG TÂM
  const { 
    user, 
    fetchGameInitialData, 
    recordGameSuccess, 
    exampleData, 
    generateAudioUrlsForWord 
  } = useQuizApp();
  // <<< END: SỬ DỤNG HOOK TỪ CONTEXT TRUNG TÂM

  // --- STATE MANAGEMENT ---
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffledUnusedWords, setShuffledUnusedWords] = useState<VocabularyItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [filledWords, setFilledWords] = useState<string[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showPhrasePopup, setShowPhrasePopup] = useState(false);
  const [showExamPopup, setShowExamPopup] = useState(false);

  const isInitialLoadComplete = useRef(false);
  const TOTAL_TIME = 60;
  const displayedCoins = useAnimateValue(coins, 500);
  
  // --- DERIVED STATE & MEMOS ---
  const isMultiWordGame = useMemo(() => [3, 4, 5, 6, 7].includes(selectedPractice % 100), [selectedPractice]);
  const completedCount = useMemo(() => usedWords.size, [usedWords]);
  const totalCount = useMemo(() => vocabularyList.length, [vocabularyList]);
  const displayCount = useMemo(() => (gameOver || !currentWord ? completedCount : Math.min(completedCount + 1, totalCount)), [gameOver, currentWord, completedCount, totalCount]);
  const progressPercentage = useMemo(() => (totalCount > 0 ? (displayCount / totalCount) * 100 : 0), [displayCount, totalCount]);
  
  // --- CORE LOGIC & CALLBACKS ---
  const resetMultiWordState = useCallback((wordItem: VocabularyItem | null) => {
    if (isMultiWordGame && wordItem) {
      const wordCount = wordItem.word.split(' ').length;
      setFilledWords(Array(wordCount).fill(''));
      setActiveBlankIndex(0);
    } else {
      setFilledWords([]);
      setActiveBlankIndex(null);
    }
    setUserInput('');
  }, [isMultiWordGame]);

  const selectNextWord = useCallback(() => {
    if (currentWordIndex < shuffledUnusedWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      const nextWord = shuffledUnusedWords[nextIndex];
      setCurrentWordIndex(nextIndex);
      setCurrentWord(nextWord);
      setIsCorrect(null);
      resetMultiWordState(nextWord);
    } else {
      setGameOver(true);
      setCurrentWord(null);
    }
  }, [currentWordIndex, shuffledUnusedWords, resetMultiWordState]);
  
  const triggerSuccessSequence = useCallback(async () => {
    if (!currentWord || !user) return;

    setIsCorrect(true);
    const newStreak = streak + 1;
    setStreak(newStreak);
    setStreakAnimation(true);
    setTimeout(() => setStreakAnimation(false), 1500);
    setShowConfetti(true);
    setUsedWords(prev => new Set(prev).add(currentWord.word.toLowerCase()));

    const coinReward = (masteryCount * newStreak) * (isMultiWordGame ? 2 : 1);
    setCoins(prevCoins => prevCoins + coinReward);

    try {
      const gameModeId = `fill-word-${selectedPractice}`;
      // <<< DÒNG MỚI: Gọi hàm từ context, không cần uid
      await recordGameSuccess(gameModeId, currentWord.word, isMultiWordGame, coinReward);
    } catch (e) {
      console.error("Lỗi khi ghi lại kết quả game:", e);
      // Optional: Rollback coins on failure
      // setCoins(prevCoins => prevCoins - coinReward); 
    }

    setTimeout(() => setShowConfetti(false), 2000);
    setTimeout(selectNextWord, 1500);
  }, [user, currentWord, streak, masteryCount, isMultiWordGame, selectedPractice, selectNextWord, recordGameSuccess]); // Thêm recordGameSuccess vào dependencies

  const checkAnswer = useCallback(async () => {
    if (!currentWord || !userInput.trim() || isCorrect) return;
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      await triggerSuccessSequence();
    } else {
      setIsCorrect(false);
      setStreak(0);
    }
  }, [currentWord, userInput, isCorrect, triggerSuccessSequence]);

  const handleMultiWordCheck = useCallback(() => {
    if (!currentWord || activeBlankIndex === null || !userInput.trim() || isCorrect) return;

    const correctWords = currentWord.word.split(' ');
    const expectedWord = correctWords[activeBlankIndex];

    if (userInput.trim().toLowerCase() === expectedWord.toLowerCase()) {
      const newFilledWords = [...filledWords];
      newFilledWords[activeBlankIndex] = expectedWord;
      setFilledWords(newFilledWords);
      setUserInput('');

      const nextBlankIndex = filledWords.findIndex((word, index) => index > activeBlankIndex && word === '');
      if (nextBlankIndex !== -1) {
        setActiveBlankIndex(nextBlankIndex);
      } else {
        const allFilled = newFilledWords.every(word => word !== '');
        if (allFilled) {
          triggerSuccessSequence();
        } else {
          setActiveBlankIndex(newFilledWords.findIndex(w => w === ''));
        }
      }
    } else {
      setShake(true);
      setStreak(0);
      setTimeout(() => setShake(false), 500);
    }
  }, [currentWord, activeBlankIndex, userInput, isCorrect, filledWords, triggerSuccessSequence]);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setStreak(0);
    setIsCorrect(null);
    const unused = vocabularyList.filter(item => !usedWords.has(item.word.toLowerCase()));
    if (unused.length > 0) {
      const shuffled = shuffleArray(unused);
      const firstWord = shuffled[0];
      setShuffledUnusedWords(shuffled);
      setCurrentWord(shuffled[0]);
      setCurrentWordIndex(0);
      resetMultiWordState(firstWord);
    } else {
      setGameOver(true);
      setCurrentWord(null);
    }
  }, [vocabularyList, usedWords, resetMultiWordState]);

  // --- SIDE EFFECTS (useEffect) ---

  // Main data fetching effect
  useEffect(() => {
    isInitialLoadComplete.current = false;
    const fetchAndPrepareGameData = async () => {
        if (!user) {
            setLoading(false); setVocabularyList([]); setCoins(0); setUsedWords(new Set()); setCurrentWord(null); setMasteryCount(0); setError("Vui lòng đăng nhập để chơi.");
            return;
        }
        try {
            setLoading(true); setError(null);
            const gameModeId = `fill-word-${selectedPractice}`;
            // <<< DÒNG MỚI: Gọi hàm từ context, không cần uid
            const initialData = await fetchGameInitialData(gameModeId, isMultiWordGame);
            const { coins: fetchedCoins, masteryCards: fetchedMasteryCount, openedVocabWords, completedWords: fetchedCompletedWords } = initialData;
            const userVocabularyWords = openedVocabWords.map(v => v.word);
            let gameVocabulary: VocabularyItem[] = [];

            // REFACTORED: Logic to build game vocabulary (sử dụng exampleData và generateAudioUrlsForWord từ context)
            const practiceType = selectedPractice % 100;
            if (practiceType === 1) {
                openedVocabWords.forEach((vocabItem) => {
                    const imageIndex = Number(vocabItem.id);
                    if (vocabItem.word && !isNaN(imageIndex)) { gameVocabulary.push({ word: vocabItem.word, hint: `Nghĩa của từ "${vocabItem.word}"`, imageIndex: imageIndex }); }
                });
            } else if (practiceType === 8) {
                openedVocabWords.forEach((vocabItem) => {
                    if (vocabItem.word) {
                        const audioUrls = generateAudioUrlsForWord(vocabItem.word);
                        if (audioUrls) {
                            gameVocabulary.push({
                                word: vocabItem.word,
                                hint: `Nghe và điền từ đúng`,
                                audioUrls: audioUrls
                            });
                        }
                    }
                });
            }
            else if (practiceType >= 2 && practiceType <= 7) {
                const minWords = (practiceType === 7) ? 1 : practiceType -1;
                exampleData.forEach(sentence => {
                    const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                    
                    if (wordsInSentence.length >= minWords) {
                        const wordsToHideShuffled = shuffleArray(wordsInSentence);
                        const wordsToHide = (practiceType === 7) ? wordsToHideShuffled : wordsToHideShuffled.slice(0, minWords);
                        const correctlyOrderedWords = wordsToHide.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()));
                        
                        if (correctlyOrderedWords.length > 0) {
                            const wordsToHideRegex = new RegExp(`\\b(${correctlyOrderedWords.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
                            const questionText = sentence.english.replace(wordsToHideRegex, '___');
                            const answerKey = correctlyOrderedWords.join(' ');
                            
                            gameVocabulary.push({ 
                                word: answerKey, 
                                question: questionText, 
                                vietnameseHint: sentence.vietnamese, 
                                hint: `Điền ${correctlyOrderedWords.length} từ còn thiếu. Gợi ý: ${sentence.vietnamese}` 
                            });
                        }
                    }
                });
            }

            setVocabularyList(gameVocabulary);
            setCoins(fetchedCoins);
            setMasteryCount(fetchedMasteryCount);
            setUsedWords(fetchedCompletedWords);
        } catch (err: any) {
            setError(`Không thể tải dữ liệu: ${err.message}`);
            setVocabularyList([]);
        } finally {
            setLoading(false);
        }
    };
    fetchAndPrepareGameData();
  }, [user, selectedPractice, isMultiWordGame, fetchGameInitialData, exampleData, generateAudioUrlsForWord]); // Thêm dependencies mới

  // Effect to select the first word or end the game
  useEffect(() => {
    if (!loading && !error && vocabularyList.length > 0 && !isInitialLoadComplete.current) {
      const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word.toLowerCase()));
      if (unusedWords.length === 0) {
        setGameOver(true);
        setCurrentWord(null);
      } else {
        const shuffled = shuffleArray(unusedWords);
        const firstWord = shuffled[0];
        setShuffledUnusedWords(shuffled);
        setCurrentWord(firstWord);
        setCurrentWordIndex(0);
        setGameOver(false);
        resetMultiWordState(firstWord);
      }
      isInitialLoadComplete.current = true;
    }
  }, [vocabularyList, loading, error, usedWords, resetMultiWordState]);

  // Timer effect
  useEffect(() => {
    if (!currentWord || gameOver || isCorrect) return;
    setTimeLeft(TOTAL_TIME);
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStreak(0);
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [currentWord, gameOver, isCorrect]);


  // --- CONTEXT VALUE ---
  const value: FillWordContextType = {
    loading, error, gameOver, currentWord, vocabularyList, isMultiWordGame,
    coins, displayedCoins, streak, masteryCount, timeLeft, TOTAL_TIME,
    completedCount, totalCount, progressPercentage, userInput, isCorrect,
    filledWords, activeBlankIndex, shake, streakAnimation, showConfetti,
    showImagePopup, showPhrasePopup, showExamPopup,
    setUserInput, setActiveBlankIndex, checkAnswer, handleMultiWordCheck,
    resetGame, setShowImagePopup, setShowPhrasePopup, setShowExamPopup,
  };

  return (
    <FillWordContext.Provider value={value}>
      {children}
    </FillWordContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useFillWord = (): FillWordContextType => {
  const context = useContext(FillWordContext);
  if (context === undefined) {
    throw new Error('useFillWord must be used within a FillWordProvider');
  }
  return context;
};
