// --- START OF FILE: course-context.tsx ---

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { auth } from '../firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  listenToUserData,
  getOpenedVocab as getOpenedVocabService,
  getCompletedWordsForGameMode as getCompletedWordsService,
  recordGameSuccess as recordGameSuccessService,
  fetchOrCreateUser as fetchOrCreateUserService,
  updateUserCoins as updateUserCoinsService,
  fetchGameInitialData as fetchGameInitialDataService,
  updateAchievementData as updateAchievementDataService,
  fetchAndSyncVocabularyData as fetchAndSyncVocabularyDataService,
  VocabularyItem,
} from './course-data-service.ts';
// Import data and generators
import { generateAudioUrlsForWord, generateAudioQuizQuestions, generateAudioUrlsForExamSentence } from '../voca-data/audio-quiz-generator.ts';
import detailedMeaningsText from '../voca-data/vocabulary-definitions.ts';
import { exampleData } from '../voca-data/example-data.ts';
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';


// --- Định nghĩa các "hình dạng" (interface) dùng chung ---
export interface Definition {
  vietnamese: string;
  english: string;
  explanation: string;
}

interface QuizAppContextType {
  currentView: string;
  selectedQuiz: any; 
  selectedType: string | null;
  selectedPractice: number | null;
  user: User | null;
  userCoins: number;
  masteryCount: number;
  
  goBack: () => void;
  goHome: () => void;
  setCurrentView: (view: string) => void;
  handleQuizSelect: (quiz: any) => void;
  handleTypeSelect: (type: string) => void;
  handlePracticeSelect: (practice: number) => void;

  // --- Data service functions ---
  getOpenedVocab: () => Promise<string[]>;
  getCompletedWords: (gameModeId: string) => Promise<Set<string>>;
  recordGameSuccess: (gameModeId: string, word: string, isMastered: boolean, coinsToAdd: number) => Promise<void>;
  updateUserCoins: (amount: number) => Promise<void>;
  fetchOrCreateUser: () => Promise<any>;
  fetchGameInitialData: (gameModeId: string, isMultiWordGame: boolean) => Promise<any>;
  
  updateAchievementData: (updates: {
    coinsToAdd: number;
    cardsToAdd: number;
    newVocabularyData: VocabularyItem[];
  }) => Promise<{ newCoins: number; newMasteryCards: number }>;
  
  // --- Dữ liệu và trạng thái từ vựng được cache ---
  vocabularyData: VocabularyItem[] | null; // null: chưa tải, []: đã tải nhưng rỗng
  isVocabularyLoading: boolean;

  // --- Hàm cập nhật state tức thì ---
  addExpToWords: (wordExpPairs: { word: string; expToAdd: number }[]) => void;

  // --- Vocabulary data and utilities ---
  definitionsMap: { [key: string]: Definition };
  generateAudioUrlsForWord: (word: string) => { [key: string]: string } | null;
  exampleData: any[];
  defaultVocabulary: string[];
  generateAudioQuizQuestions: (vocabList: string[]) => any[];
  generateAudioUrlsForExamSentence: (sentenceIndex: number) => { [key: string]: string } | null;
}

// --- Tạo Context ---
const QuizAppContext = createContext<QuizAppContextType | null>(null);

// --- Custom Hook để sử dụng Context một cách an toàn và tiện lợi ---
export const useQuizApp = () => {
  const context = useContext(QuizAppContext);
  if (!context) {
    throw new Error('useQuizApp must be used within a QuizAppProvider');
  }
  return context;
};

// --- Props cho Provider ---
interface QuizAppProviderProps {
  children: ReactNode;
}

// --- Provider Component: Nơi chứa tất cả State và Logic ---
export const QuizAppProvider: React.FC<QuizAppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [userCoins, setUserCoins] = useState(0);
  const [masteryCount, setMasteryCount] = useState(0);
  
  // State để cache dữ liệu từ vựng và trạng thái loading
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[] | null>(null);
  const [isVocabularyLoading, setIsVocabularyLoading] = useState<boolean>(true);

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


  // Effect lắng nghe thay đổi trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Reset cache khi người dùng đăng xuất
        setVocabularyData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect lắng nghe dữ liệu người dùng (coins, mastery) real-time
  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserData(user.uid, (data) => {
        if (data) {
          setUserCoins(data.coins);
          setMasteryCount(data.masteryCards);
        } else {
          setUserCoins(0);
          setMasteryCount(0);
        }
      });
      return () => unsubscribe();
    } else {
      setUserCoins(0);
      setMasteryCount(0);
    }
  }, [user]);

  // Effect để tự động tải và cache dữ liệu từ vựng KHI CÓ USER
  useEffect(() => {
    // Chỉ fetch khi có user và dữ liệu chưa được tải (còn là null)
    if (user && vocabularyData === null) {
      setIsVocabularyLoading(true);
      fetchAndSyncVocabularyDataService(user.uid)
        .then(data => {
          setVocabularyData(data);
        })
        .catch(error => {
          console.error("Failed to fetch vocabulary data:", error);
          setVocabularyData([]); // Gán mảng rỗng nếu lỗi để không fetch lại
        })
        .finally(() => {
          setIsVocabularyLoading(false);
        });
    } else if (!user) {
        // Nếu không có user (đăng xuất), đảm bảo loading là false
        setIsVocabularyLoading(false);
    }
  }, [user, vocabularyData]);


  // --- Các hàm xử lý (Handlers) ---
  const handleQuizSelect = useCallback((quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType(type);
    setCurrentView('practices');
    setSelectedPractice(null);
  }, []);

  const handlePracticeSelect = useCallback((practice: number) => {
    setSelectedPractice(practice);
    if (selectedType === 'tracNghiem') {
      setCurrentView('quiz');
    } else if (selectedType === 'dienTu') {
      setCurrentView('vocabularyGame');
    } else if (selectedType === 'vocaMatch') {
      setCurrentView('vocaMatchGame');
    }
  }, [selectedType]);

  // --- Các hàm điều hướng (Navigation) ---
  const goBack = useCallback(() => {
    if (['vocabularyGame', 'quiz', 'vocaMatchGame'].includes(currentView)) {
       setCurrentView('practices');
       setSelectedPractice(null);
    } else if (currentView === 'wordChainGame' || currentView === 'analysis' || currentView === 'phraseView') {
       setCurrentView('main');
    } else if (currentView === 'practices') {
      setCurrentView('quizTypes');
      setSelectedType(null);
    } else if (currentView === 'quizTypes') {
      setCurrentView('main');
    }
  }, [currentView]);

  const goHome = useCallback(() => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

  // --- Data service wrapper functions ---
  const getOpenedVocab = useCallback(async (): Promise<string[]> => {
    if (!user) {
      console.warn("getOpenedVocab called without a user.");
      return [];
    }
    return getOpenedVocabService(user.uid);
  }, [user]);

  const getCompletedWords = useCallback(async (gameModeId: string): Promise<Set<string>> => {
    if (!user) {
        console.warn("getCompletedWords called without a user.");
        return new Set();
    }
    return getCompletedWordsService(user.uid, gameModeId);
  }, [user]);

  const recordGameSuccess = useCallback(async (gameModeId: string, word: string, isMastered: boolean, coinsToAdd: number): Promise<void> => {
    if (!user) {
        console.warn("recordGameSuccess called without a user.");
        return;
    }
    await recordGameSuccessService(user.uid, gameModeId, word, isMastered, coinsToAdd);
  }, [user]);
  
  const fetchGameInitialData = useCallback(async (gameModeId: string, isMultiWordGame: boolean): Promise<any> => {
    if (!user) {
      console.warn("fetchGameInitialData called without a user.");
      throw new Error("Người dùng chưa đăng nhập");
    }
    return fetchGameInitialDataService(user.uid, gameModeId, isMultiWordGame);
  }, [user]);

  const fetchOrCreateUser = useCallback(async (): Promise<any> => {
    if (!user) {
      console.warn("fetchOrCreateUser called without a user.");
      return null;
    }
    return fetchOrCreateUserService(user.uid);
  }, [user]);

  const updateUserCoins = useCallback(async (amount: number): Promise<void> => {
    if (!user) {
        console.warn("updateUserCoins called without a user.");
        return;
    }
    await updateUserCoinsService(user.uid, amount);
  }, [user]);

  const updateAchievementData = useCallback(async (updates: {
    coinsToAdd: number;
    cardsToAdd: number;
    newVocabularyData: VocabularyItem[];
  }): Promise<{ newCoins: number; newMasteryCards: number }> => {
    if (!user) {
      console.warn("updateAchievementData called without a user.");
      throw new Error("Người dùng chưa đăng nhập để cập nhật thành tích.");
    }
    const result = await updateAchievementDataService(user.uid, updates);
    
    // Cập nhật state local ngay lập tức để UI phản ánh thay đổi
    setVocabularyData(updates.newVocabularyData);
    
    // Cập nhật coins và mastery count để UI đồng bộ ngay (mặc dù listener cũng làm việc này)
    setUserCoins(prevCoins => prevCoins + updates.coinsToAdd);
    setMasteryCount(prevCount => prevCount + updates.cardsToAdd);
    
    return result;
  }, [user]);

  // --- HÀM MỚI: Cập nhật EXP cho từ vựng trong state để UI phản hồi tức thì ---
  const addExpToWords = useCallback((wordExpPairs: { word: string; expToAdd: number }[]) => {
    // Chỉ cập nhật nếu vocabularyData đã được tải và có nội dung
    if (!vocabularyData) return;

    // Tạo một map để truy cập nhanh các từ cần cập nhật
    const updatesMap = new Map(wordExpPairs.map(p => [p.word.toLowerCase(), p.expToAdd]));

    const newVocabularyData = vocabularyData.map(item => {
      const wordInLowerCase = item.word.toLowerCase();
      if (updatesMap.has(wordInLowerCase)) {
        const expToAdd = updatesMap.get(wordInLowerCase) || 0;
        return {
          ...item,
          exp: item.exp + expToAdd,
        };
      }
      return item;
    });

    // Cập nhật state để UI re-render ngay lập tức
    setVocabularyData(newVocabularyData);
  }, [vocabularyData]); 

  // --- Giá trị được cung cấp bởi Context ---
  const value = {
    currentView,
    selectedQuiz,
    selectedType,
    selectedPractice,
    user,
    userCoins,
    masteryCount,
    goBack,
    goHome,
    setCurrentView,
    handleQuizSelect,
    handleTypeSelect,
    handlePracticeSelect,
    getOpenedVocab,
    getCompletedWords,
    recordGameSuccess,
    fetchOrCreateUser,
    updateUserCoins,
    fetchGameInitialData,
    updateAchievementData,
    
    // Dữ liệu và trạng thái được cache
    vocabularyData,
    isVocabularyLoading,

    // Hàm cập nhật state tức thì
    addExpToWords,

    // Dữ liệu và các hàm tiện ích khác
    definitionsMap,
    generateAudioUrlsForWord,
    exampleData,
    defaultVocabulary,
    generateAudioQuizQuestions,
    generateAudioUrlsForExamSentence,
  };

  return <QuizAppContext.Provider value={value}>{children}</QuizAppContext.Provider>;
};
// --- END OF FILE: course-context.tsx ---
