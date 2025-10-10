// --- START OF FILE course-context.tsx (FULL CODE - MODIFIED) ---

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
// NEW: Import data and generators
import { generateAudioUrlsForWord, generateAudioQuizQuestions, generateAudioUrlsForExamSentence } from '../voca-data/audio-quiz-generator.ts';
import detailedMeaningsText from '../voca-data/vocabulary-definitions.ts';
import { exampleData } from '../voca-data/example-data.ts';
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';


// --- Định nghĩa các "hình dạng" (interface) dùng chung ---
// NEW: Moved Definition interface here
export interface Definition {
  vietnamese: string;
  english: string;
  explanation: string;
}

// <<< THAY ĐỔI: Cập nhật Interface để quản lý state từ vựng toàn cục >>>
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
  fetchAndSyncVocabularyData: () => Promise<VocabularyItem[]>;
  updateAchievementData: (updates: {
    coinsToAdd: number;
    cardsToAdd: number;
    newVocabularyData: VocabularyItem[];
  }) => Promise<{ newCoins: number; newMasteryCards: number }>;

  // <<< START: DÒNG MỚI - Quản lý state từ vựng toàn cục >>>
  vocabulary: VocabularyItem[];
  isVocabularyLoading: boolean;
  setVocabularyState: (newVocabulary: VocabularyItem[]) => void; // Hàm để context con cập nhật state
  // <<< END: DÒNG MỚI >>>

  // --- NEW: Vocabulary data and utilities ---
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
  
  // <<< START: DÒNG MỚI - State cho dữ liệu từ vựng toàn cục >>>
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isVocabularyLoading, setIsVocabularyLoading] = useState(true);
  // <<< END: DÒNG MỚI >>>

  // NEW: Process vocabulary definitions once and provide via context
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
    });
    return () => unsubscribe();
  }, []);

  // <<< THAY ĐỔI: Gộp việc lắng nghe dữ liệu người dùng và tải dữ liệu từ vựng vào chung một effect >>>
  useEffect(() => {
    let unsubscribeUserData: () => void = () => {};

    if (user) {
      // 1. Lắng nghe dữ liệu người dùng (coins, mastery) real-time
      unsubscribeUserData = listenToUserData(user.uid, (data) => {
        if (data) {
          setUserCoins(data.coins);
          setMasteryCount(data.masteryCards);
        } else {
          setUserCoins(0);
          setMasteryCount(0);
        }
      });
      
      // 2. Tải dữ liệu từ vựng một lần duy nhất khi người dùng đăng nhập
      setIsVocabularyLoading(true);
      fetchAndSyncVocabularyDataService(user.uid)
        .then(vocabData => {
          setVocabulary(vocabData);
        })
        .catch(error => {
          console.error("Failed to fetch initial vocabulary in QuizAppProvider:", error);
          setVocabulary([]); // Reset khi có lỗi
        })
        .finally(() => {
          setIsVocabularyLoading(false);
        });

    } else {
      // Reset tất cả state khi người dùng đăng xuất
      setUserCoins(0);
      setMasteryCount(0);
      setVocabulary([]);
      setIsVocabularyLoading(false);
    }
    
    // Cleanup function để hủy listener khi component unmount hoặc user thay đổi
    return () => {
      unsubscribeUserData();
    };
  }, [user]);

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
    } else if (currentView === 'wordChainGame' || currentView === 'analysis') {
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

  // --- START: CÁC HÀM WRAPPER MỚI CHO ACHIEVEMENT ---
  const fetchAndSyncVocabularyData = useCallback(async (): Promise<VocabularyItem[]> => {
    if (!user) {
      console.warn("fetchAndSyncVocabularyData called without a user.");
      return [];
    }
    return fetchAndSyncVocabularyDataService(user.uid);
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
    return updateAchievementDataService(user.uid, updates);
  }, [user]);
  // --- END: CÁC HÀM WRAPPER MỚI CHO ACHIEVEMENT ---

  // <<< START: DÒNG MỚI - Hàm cho phép component con cập nhật state vocabulary toàn cục >>>
  const setVocabularyState = useCallback((newVocabulary: VocabularyItem[]) => {
      setVocabulary(newVocabulary);
  }, []);
  // <<< END: DÒNG MỚI >>>


  // <<< THAY ĐỔI: Thêm các state và hàm mới vào giá trị của Context >>>
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
    fetchAndSyncVocabularyData,
    updateAchievementData,
    // <<< START: DÒNG MỚI >>>
    vocabulary,
    isVocabularyLoading,
    setVocabularyState,
    // <<< END: DÒNG MỚI >>>
    // NEW: Provide data and utilities
    definitionsMap,
    generateAudioUrlsForWord,
    exampleData,
    defaultVocabulary,
    generateAudioQuizQuestions,
    generateAudioUrlsForExamSentence,
  };

  return <QuizAppContext.Provider value={value}>{children}</QuizAppContext.Provider>;
};

// --- END OF FILE course-context.tsx (FULL CODE - MODIFIED) ---
