// VocaMatchContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useQuizApp, Definition } from '../course-context.tsx'; 
import { allWordPairs, shuffleArray } from './voca-match-data.ts';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';

interface LeftColumnItem {
  word: string;
  audioUrls: { [key: string]: string } | null;
}

interface VocaMatchContextType {
  loading: boolean;
  showEndScreen: boolean;
  showConfetti: boolean;
  score: number;
  gameProgress: number;
  pairsCompletedInSession: number;
  totalPairsInSession: number;
  leftColumn: LeftColumnItem[];
  rightColumn: string[];
  selectedLeft: string | null;
  correctPairs: string[];
  incorrectPair: { left: string; right: string } | null;
  lastCorrectDefinition: Definition | null;
  displayedCoins: number;
  masteryCount: number;
  streak: number;
  streakAnimation: boolean;
  isAudioMatch: boolean;
  availableVoices: string[];
  selectedVoice: string; 
  setSelectedVoice: (voice: string) => void;
  handleLeftSelect: (englishWord: string) => void;
  handleRightSelect: (selectedWord: string) => Promise<void>;
  resetGame: () => void;
  onGoBack: () => void;
  allWordPairs: { english: string; vietnamese: string }[];
}

const GAME_SIZE = 5;

// --- Context Creation ---
const VocaMatchContext = createContext<VocaMatchContextType | undefined>(undefined);

export const useVocaMatch = () => {
  const context = useContext(VocaMatchContext);
  if (!context) {
    throw new Error('useVocaMatch must be used within a VocaMatchProvider');
  }
  return context;
};

// --- Provider Component ---
interface VocaMatchProviderProps {
  children: ReactNode;
  onGoBack: () => void;
  selectedPractice: number;
}

export const VocaMatchProvider: React.FC<VocaMatchProviderProps> = ({
  children,
  onGoBack,
  selectedPractice,
}) => {
  const { 
    user, 
    userCoins, 
    masteryCount: masteryCountFromCourse, 
    getOpenedVocab, 
    // --- START THAY ĐỔI ---
    // Thay thế getCompletedWords bằng hàm mới đọc từ local
    fetchAllLocalProgress, 
    // --- END THAY ĐỔI ---
    recordGameSuccess,
    definitionsMap,
    generateAudioUrlsForWord
  } = useQuizApp();

  const [loading, setLoading] = useState(true);
  const [playablePairs, setPlayablePairs] = useState<any[]>([]);
  const [totalEligiblePairs, setTotalEligiblePairs] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  const [sessionCoins, setSessionCoins] = useState(0);
  const displayedCoins = useAnimateValue(sessionCoins, 500);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  const [leftColumn, setLeftColumn] = useState<LeftColumnItem[]>([]);
  const [rightColumn, setRightColumn] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [correctPairs, setCorrectPairs] = useState<string[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<{ left: string, right: string } | null>(null);
  const [lastCorrectDefinition, setLastCorrectDefinition] = useState<Definition | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Matilda'); 

  const isAudioMatch = useMemo(() => selectedPractice % 100 === 2, [selectedPractice]);
  const gameModeId = useMemo(() => `match-${selectedPractice % 100}`, [selectedPractice]);

  useEffect(() => {
    setSessionCoins(userCoins);
  }, [userCoins]);

  useEffect(() => {
    setMasteryCount(masteryCountFromCourse);
  }, [masteryCountFromCourse]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          // --- START THAY ĐỔI LỚN ---
          const [vocabList, localProgress] = await Promise.all([
            getOpenedVocab(),
            fetchAllLocalProgress() // Gọi hàm mới
          ]);
          
          // Xử lý dữ liệu local để tạo completedSet
          const completedSet = new Set<string>();
          // VocaMatch là game từ đơn, nên ta chỉ cần `completedWordsData`
          localProgress.completedWordsData.forEach((item: any) => {
              if (item.gameModes?.[gameModeId]) {
                  completedSet.add(item.word.toLowerCase());
              }
          });
          // --- END THAY ĐỔI LỚN ---
          
          const userVocabSet = new Set(vocabList.map(v => v.toLowerCase()));
          const allEligiblePairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));
          const remainingPairs = allEligiblePairs.filter(pair => !completedSet.has(pair.english.toLowerCase()));
          
          setPlayablePairs(shuffleArray(remainingPairs));
          setTotalEligiblePairs(allEligiblePairs);

          if (isAudioMatch && remainingPairs.length > 0) {
            const firstWordUrls = generateAudioUrlsForWord(remainingPairs[0].english);
            if (firstWordUrls) {
              setAvailableVoices(Object.keys(firstWordUrls));
            }
          }

        } catch (error) {
          console.error("Error fetching data for Voca Match:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, gameModeId, isAudioMatch, getOpenedVocab, fetchAllLocalProgress, generateAudioUrlsForWord]); // Cập nhật dependency array

  const setupNewRound = useCallback(() => {
    const roundStart = currentRound * GAME_SIZE;
    if (playablePairs.length > 0 && roundStart >= playablePairs.length) {
      setShowEndScreen(true);
      return;
    }
    const roundPairs = playablePairs.slice(roundStart, roundStart + GAME_SIZE);
    if (roundPairs.length === 0 && !loading) {
      setShowEndScreen(true);
      return;
    }
    
    const englishWords = roundPairs.map(p => p.english);

    if (isAudioMatch) {
      const leftColumnData = englishWords.map(word => ({
        word: word,
        audioUrls: generateAudioUrlsForWord(word)
      }));
      setLeftColumn(leftColumnData);
      setRightColumn(shuffleArray(englishWords));
    } else {
      const leftColumnData = englishWords.map(word => ({
        word: word,
        audioUrls: null
      }));
      setLeftColumn(leftColumnData);
      setRightColumn(shuffleArray(roundPairs.map(p => p.vietnamese)));
    }

    setCorrectPairs([]);
    setSelectedLeft(null);
    setIncorrectPair(null);
    setLastCorrectDefinition(null);
  }, [currentRound, playablePairs, loading, isAudioMatch, generateAudioUrlsForWord]);

  useEffect(() => {
    if (!loading) {
      setupNewRound();
    }
  }, [currentRound, loading, setupNewRound]);

  const handleLeftSelect = (englishWord: string) => {
    if (correctPairs.includes(englishWord)) return;
    setSelectedLeft(englishWord);
    setIncorrectPair(null);
  };

  const handleRightSelect = async (selectedWord: string) => {
    if (!selectedLeft) return;

    let isCorrect = false;
    if (isAudioMatch) {
      isCorrect = selectedLeft === selectedWord;
    } else {
      const originalPair = allWordPairs.find(p => p.english === selectedLeft);
      isCorrect = originalPair?.vietnamese === selectedWord;
    }

    if (isCorrect) {
      setCorrectPairs(prev => [...prev, selectedLeft]);
      setSelectedLeft(null);
      setScore(prev => prev + 1);
      setLastCorrectDefinition(definitionsMap[selectedLeft.toLowerCase()] || null);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1500);

      const coinsToAdd = masteryCount * newStreak;
      setSessionCoins(prevCoins => prevCoins + coinsToAdd);

      if (user) {
        try {
          await recordGameSuccess(gameModeId, selectedLeft, false, coinsToAdd);
        } catch (error) {
          console.error("Failed to record match success:", error);
          setSessionCoins(prevCoins => prevCoins - coinsToAdd);
        }
      }

      if (correctPairs.length + 1 === GAME_SIZE) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setCurrentRound(prev => prev + 1);
        }, 2500);
      }
    } else {
      setIncorrectPair({ left: selectedLeft, right: selectedWord });
      setSelectedLeft(null);
      setStreak(0);
      setLastCorrectDefinition(null);
      setTimeout(() => setIncorrectPair(null), 800);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setShowEndScreen(false);
    // Cần phải shuffle lại playablePairs để khi chơi lại sẽ là một thứ tự mới
    setPlayablePairs(shuffleArray(playablePairs));
  };
  
  const totalPairsInSession = totalEligiblePairs.length;
  const completedWordsBeforeSession = totalPairsInSession - playablePairs.length;
  const pairsCompletedInSession = completedWordsBeforeSession + score;
  const gameProgress = totalPairsInSession > 0 ? (pairsCompletedInSession / totalPairsInSession) * 100 : 0;

  const value = {
    loading,
    showEndScreen,
    showConfetti,
    score,
    gameProgress,
    pairsCompletedInSession,
    totalPairsInSession,
    leftColumn,
    rightColumn,
    selectedLeft,
    correctPairs,
    incorrectPair,
    lastCorrectDefinition,
    displayedCoins,
    masteryCount,
    streak,
    streakAnimation,
    isAudioMatch,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    handleLeftSelect,
    handleRightSelect,
    resetGame,
    onGoBack,
    allWordPairs,
  };

  return <VocaMatchContext.Provider value={value}>{children}</VocaMatchContext.Provider>;
};
