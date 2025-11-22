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
  fetchAllLocalProgress as fetchAllLocalProgressService, // Thêm import mới
  VocabularyItem,
} from './course-data-service.ts';
// Import data và generators
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
  recordGameSuccess: (gameModeId: string, word: string, isMultiWordGame: boolean, coinsToAdd: number) => Promise<{ coinsToAdd: number; cardsToAdd: number }>;
  updateUserCoins: (amount: number) => Promise<void>;
  fetchOrCreateUser: () => Promise<any>;
  fetchGameInitialData: (gameModeId: string, isMultiWordGame: boolean) => Promise<any>;
  updateAchievementData: (updates: { coinsToAdd: number; cardsToAdd: number; newVocabularyData: VocabularyItem[] }) => Promise<void>;
  fetchAndSyncVocabularyData: () => Promise<VocabularyItem[]>;
  // Thêm hàm mới để lấy tiến trình từ local DB
  fetchAllLocalProgress: () => Promise<{ completedWordsData: any[]; completedMultiWordData: any[] }>;

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
  
  const definitionsMap = useMemo(() => {
    const definitions: { [key: string]: Definition } = {};
    const lines = detailedMeaningsText.trim().split('\n');
    lines.forEach(line => {
      if (line.trim() === '') return;
      
      // CẬP NHẬT LOGIC PARSE:
      // Format cũ: Vietnamese (English) là Explanation
      // Format mới: English (Vietnamese) là Explanation
      // Regex này tìm: [Cụm từ đầu] [khoảng trắng] ([Cụm từ trong ngoặc]) [khoảng trắng] là [phần giải thích]
      const match = line.match(/^(.+?)\s*\((.+?)\)\s+là\s+(.*)/);
      
      if (match) {
        // match[1]: English (Source)
        // match[2]: Vietnamese (Nguồn)
        // match[3]: Explanation (...là điểm xuất phát...)
        const [, englishWord, vietnameseWord, explanation] = match;
        
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

  // --- Các hàm xử lý (Handlers) ---
  const handleQuizSelect = useCallback((quiz: any) => {
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
    } else if (currentView === 'wordChainGame' || currentView === 'analysis' || currentView === 'exampleView') {
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

  const recordGameSuccess = useCallback(async (gameModeId: string, word: string, isMultiWordGame: boolean, coinsToAdd: number): Promise<{ coinsToAdd: number; cardsToAdd: number }> => {
    if (!user) {
        console.warn("recordGameSuccess called without a user.");
        return { coinsToAdd: 0, cardsToAdd: 0 };
    }
    return await recordGameSuccessService(user.uid, gameModeId, word, isMultiWordGame, coinsToAdd);
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

  const updateAchievementData = useCallback(async (updates: { coinsToAdd: number; cardsToAdd: number; newVocabularyData: VocabularyItem[] }): Promise<void> => {
    if (!user) {
        console.warn("updateAchievementData called without a user.");
        return;
    }
    await updateAchievementDataService(user.uid, updates);
  }, [user]);

  const fetchAndSyncVocabularyData = useCallback(async (): Promise<VocabularyItem[]> => {
    if (!user) {
      console.warn("fetchAndSyncVocabularyData called without a user.");
      return [];
    }
    return fetchAndSyncVocabularyDataService(user.uid);
  }, [user]);

  // Wrapper cho hàm mới
  const fetchAllLocalProgress = useCallback(async (): Promise<any> => {
    if (!user) {
        console.warn("fetchAllLocalProgress called without a user.");
        return { completedWordsData: [], completedMultiWordData: [] };
    }
    return fetchAllLocalProgressService();
  }, [user]);

  // --- Giá trị được cung cấp bởi Context ---
  const value: QuizAppContextType = {
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
    fetchAndSyncVocabularyData,
    fetchAllLocalProgress, // Thêm hàm vào context value
    // Provide data and utilities
    definitionsMap,
    generateAudioUrlsForWord,
    exampleData,
    defaultVocabulary,
    generateAudioQuizQuestions,
    generateAudioUrlsForExamSentence,
  };

  return <QuizAppContext.Provider value={value}>{children}</QuizAppContext.Provider>;
};
