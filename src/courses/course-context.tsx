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

// <<< THÊM: Định nghĩa UserProgress để quản lý tập trung
export interface UserProgress {
    coins: number;
    masteryCount: number;
    claimedDailyGoals: number[];
    claimedVocabMilestones: number[];
}

interface QuizAppContextType {
  currentView: string;
  selectedQuiz: any; 
  selectedType: string | null;
  selectedPractice: number | null;
  user: User | null;
  userCoins: number;
  userProgress: UserProgress; // <<< THAY ĐỔI: Thay thế masteryCount bằng object userProgress
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
  hideNavBar?: () => void;
  showNavBar?: () => void;
}

// --- Provider Component: Nơi chứa tất cả State và Logic ---
export const QuizAppProvider: React.FC<QuizAppProviderProps> = ({ children, hideNavBar, showNavBar }) => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  
  // <<< THAY ĐỔI: Quản lý toàn bộ tiến trình người dùng trong một state duy nhất
  const [userProgress, setUserProgress] = useState<UserProgress>({
    coins: 0,
    masteryCount: 0,
    claimedDailyGoals: [],
    claimedVocabMilestones: [],
  });
  
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
      if (!currentUser) {
        // Reset state khi người dùng đăng xuất
        setUserProgress({ coins: 0, masteryCount: 0, claimedDailyGoals: [], claimedVocabMilestones: [] });
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect lắng nghe dữ liệu người dùng (coins, mastery, etc.) real-time
  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserData(user.uid, (data) => {
        // <<< THAY ĐỔI: Cập nhật state userProgress mới từ listener
        if (data) {
          const todayString = new Date().toISOString().slice(0, 10);
          setUserProgress({
              coins: data.coins || 0,
              masteryCount: data.masteryCards || 0,
              // Lấy đúng mảng claimed cho ngày hôm nay
              claimedDailyGoals: data.claimedDailyGoals?.[todayString] || [], 
              claimedVocabMilestones: data.claimedVocabMilestones || [],
          });
        } else {
          // Reset nếu không có data (ví dụ: tài liệu người dùng bị xóa)
          setUserProgress({ coins: 0, masteryCount: 0, claimedDailyGoals: [], claimedVocabMilestones: [] });
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Effect điều khiển NavBar của component cha
  useEffect(() => {
    if (currentView !== 'main') {
      hideNavBar?.();
    } else {
      showNavBar?.();
    }
    return () => {
      showNavBar?.();
    };
  }, [currentView, hideNavBar, showNavBar]);

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


  // --- Giá trị được cung cấp bởi Context ---
  const value = {
    currentView,
    selectedQuiz,
    selectedType,
    selectedPractice,
    user,
    userCoins: userProgress.coins, // Vẫn cung cấp để tương thích ngược nếu cần
    userProgress, // <<< THÊM: Cung cấp object userProgress mới
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
