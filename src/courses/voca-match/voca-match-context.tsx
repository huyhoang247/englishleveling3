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
import { auth } from '../../firebase.js';
import { fetchOrCreateUser, getOpenedVocab, getCompletedWordsForGameMode, recordGameSuccess } from '../course-data-service.ts';
import { allWordPairs, shuffleArray } from './voca-match-data.ts';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import detailedMeaningsText from '../../voca-data/vocabulary-definitions.ts';

// --- Interfaces ---
interface Definition {
  vietnamese: string;
  english: string;
  explanation: string;
}

interface VocaMatchContextType {
  loading: boolean;
  showEndScreen: boolean;
  showConfetti: boolean;
  score: number;
  gameProgress: number;
  pairsCompletedInSession: number;
  totalPairsInSession: number;
  leftColumn: string[];
  rightColumn: string[];
  selectedLeft: string | null;
  correctPairs: string[];
  incorrectPair: { left: string; right: string } | null;
  lastCorrectDefinition: Definition | null;
  displayedCoins: number;
  masteryCount: number;
  streak: number;
  streakAnimation: boolean;
  isAudioMode: boolean; // <<< THAY ĐỔI 1: Thêm isAudioMode vào interface
  handleLeftSelect: (englishWord: string) => void;
  handleRightSelect: (selectedValue: string) => Promise<void>; // Thay đổi tên param cho rõ nghĩa
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
  // All state and logic from the original component are moved here
  const [user] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [playablePairs, setPlayablePairs] = useState<any[]>([]);
  const [totalEligiblePairs, setTotalEligiblePairs] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  const [coins, setCoins] = useState(0);
  const displayedCoins = useAnimateValue(coins, 500);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  const [leftColumn, setLeftColumn] = useState<string[]>([]);
  const [rightColumn, setRightColumn] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [correctPairs, setCorrectPairs] = useState<string[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<{ left: string, right: string } | null>(null);
  const [lastCorrectDefinition, setLastCorrectDefinition] = useState<Definition | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);

  const gameModeId = useMemo(() => `match-${selectedPractice}`, [selectedPractice]);
  // <<< THAY ĐỔI 2: Xác định chế độ chơi dựa trên selectedPractice
  const isAudioMode = useMemo(() => selectedPractice === 2, [selectedPractice]);

  const definitionsMap = useMemo(() => {
    const definitions: { [key: string]: Definition } = {};
    const lines = detailedMeaningsText.trim().split('\n');
    lines.forEach(line => {
      if (line.trim() === '') return;
      const match = line.match(/^(.+?)\s+\((.+?)\)\s+là\s+(.*)/);
      if (match) {
        const [, vietnameseWord, englishWord, explanation] = match;
        definitions[englishWord.trim().toLowerCase()] = {
          vietnamese: vietnameseWord.trim(),
          english: englishWord.trim(),
          explanation: explanation.trim(),
        };
      }
    });
    return definitions;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [userData, vocabList, completedSet] = await Promise.all([
            fetchOrCreateUser(user.uid),
            getOpenedVocab(user.uid),
            getCompletedWordsForGameMode(user.uid, gameModeId)
          ]);
          setCoins(userData.coins || 0);
          setMasteryCount(userData.masteryCards || 0);
          const userVocabSet = new Set(vocabList.map(v => v.toLowerCase()));
          const allEligiblePairs = allWordPairs.filter(pair => userVocabSet.has(pair.english.toLowerCase()));
          const remainingPairs = allEligiblePairs.filter(pair => !completedSet.has(pair.english.toLowerCase()));
          setPlayablePairs(shuffleArray(remainingPairs));
          setTotalEligiblePairs(allEligiblePairs);
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
  }, [user, gameModeId]);

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
    setLeftColumn(roundPairs.map(p => p.english));
    
    // <<< THAY ĐỔI 3: Tạo dữ liệu cho cột phải tùy theo chế độ chơi
    const rightColumnData = isAudioMode
      ? roundPairs.map(p => p.english) // Chế độ audio, cột phải là từ tiếng Anh (để UI tạo audio)
      : roundPairs.map(p => p.vietnamese); // Chế độ thường, cột phải là tiếng Việt

    setRightColumn(shuffleArray(rightColumnData));
    setCorrectPairs([]);
    setSelectedLeft(null);
    setIncorrectPair(null);
    setLastCorrectDefinition(null);
  }, [currentRound, playablePairs, loading, isAudioMode]); // Thêm isAudioMode vào dependency

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

  const handleRightSelect = async (selectedValue: string) => {
    if (!selectedLeft) return;

    // <<< THAY ĐỔI 4: Logic kiểm tra câu trả lời linh hoạt
    const originalPair = allWordPairs.find(p => p.english === selectedLeft);
    const isMatch = isAudioMode
      ? selectedLeft === selectedValue // Chế độ audio: từ tiếng Anh ở cột trái phải khớp với từ tiếng Anh đại diện cho audio ở cột phải
      : originalPair?.vietnamese === selectedValue; // Chế độ thường: nghĩa tiếng Việt phải khớp

    if (isMatch) {
      setCorrectPairs(prev => [...prev, selectedLeft]);
      setSelectedLeft(null);
      setScore(prev => prev + 1);
      setLastCorrectDefinition(definitionsMap[selectedLeft.toLowerCase()] || null);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true);
      setTimeout(() => setStreakAnimation(false), 1500);

      const coinsToAdd = masteryCount * newStreak;
      setCoins(prevCoins => prevCoins + coinsToAdd);

      if (user) {
        try {
          await recordGameSuccess(user.uid, gameModeId, selectedLeft, false, coinsToAdd);
        } catch (error) {
          console.error("Failed to record match success:", error);
          setCoins(prevCoins => prevCoins - coinsToAdd);
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
      setIncorrectPair({ left: selectedLeft, right: selectedValue });
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
    isAudioMode, // <<< THAY ĐỔI 5: Cung cấp isAudioMode cho UI
    handleLeftSelect,
    handleRightSelect,
    resetGame,
    onGoBack,
    allWordPairs,
  };

  return <VocaMatchContext.Provider value={value}>{children}</VocaMatchContext.Provider>;
};
