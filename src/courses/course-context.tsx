// --- START OF FILE course-context.tsx ---

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

// Interface cho toàn bộ tiến trình của người dùng
export interface UserProgress {
    coins: number;
    masteryCount: number;
    claimedDailyGoals: { [date: string]: number[] };
    claimedVocabMilestones: number[];
}

interface QuizAppContextType {
  currentView: string;
  selectedQuiz: any; 
  selectedType: string | null;
  selectedPractice: number | null;
  user: User | null;
  // Gộp các state riêng lẻ thành một object userProgress
  userProgress: UserProgress;
  
  goBack: () => void;
  goHome: () => void;
  setCurrentView: (view: string) => void;
  handleQuizSelect: (quiz: any) => void;
  handleTypeSelect: (type: string) => void;
  handlePracticeSelect: (practice: number) => void;

  getOpenedVocab: () => Promise<string[]>;
  getCompletedWords: (gameModeId: string) => Promise<Set<string>>;
  recordGameSuccess: (gameModeId: string, word: string, isMastered: boolean, coinsToAdd: number) => Promise<void>;
  updateUserCoins: (amount: number) => Promise<void>;
  fetchOrCreateUser: () => Promise<any>;
  fetchGameInitialData: (gameModeId: string, isMultiWordGame: boolean) => Promise<any>;

  definitionsMap: { [key: string]: Definition };
  generateAudioUrlsForWord: (word: string) => { [key: string]: string } | null;
  exampleData: any[];
  defaultVocabulary: string[];
  generateAudioQuizQuestions: (vocabList: string[]) => any[];
  generateAudioUrlsForExamSentence: (sentenceIndex: number) => { [key: string]: string } | null;
}

const QuizAppContext = createContext<QuizAppContextType | null>(null);

export const useQuizApp = () => {
  const context = useContext(QuizAppContext);
  if (!context) {
    throw new Error('useQuizApp must be used within a QuizAppProvider');
  }
  return context;
};

interface QuizAppProviderProps {
  children: ReactNode;
  hideNavBar?: () => void;
  showNavBar?: () => void;
}

export const QuizAppProvider: React.FC<QuizAppProviderProps> = ({ children, hideNavBar, showNavBar }) => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  
  // State userProgress là nguồn sự thật duy nhất cho dữ liệu người dùng
  const [userProgress, setUserProgress] = useState<UserProgress>({
    coins: 0,
    masteryCount: 0,
    claimedDailyGoals: {},
    claimedVocabMilestones: [],
  });
  
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Effect lắng nghe toàn bộ dữ liệu người dùng real-time
  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserData(user.uid, (data) => {
        if (data) {
          setUserProgress({
            coins: data.coins || 0,
            masteryCount: data.masteryCards || 0,
            claimedDailyGoals: data.claimedDailyGoals || {},
            claimedVocabMilestones: data.claimedVocabMilestones || [],
          });
        } else {
          setUserProgress({ coins: 0, masteryCount: 0, claimedDailyGoals: {}, claimedVocabMilestones: [] });
        }
      });
      return () => unsubscribe();
    } else {
      setUserProgress({ coins: 0, masteryCount: 0, claimedDailyGoals: {}, claimedVocabMilestones: [] });
    }
  }, [user]);

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

  // --- Các hàm xử lý và điều hướng (không thay đổi) ---
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
  
  // --- Các hàm wrapper cho service (không thay đổi) ---
  const getOpenedVocab = useCallback(async (): Promise<string[]> => {
    if (!user) { console.warn("getOpenedVocab called without a user."); return []; }
    return getOpenedVocabService(user.uid);
  }, [user]);

  const getCompletedWords = useCallback(async (gameModeId: string): Promise<Set<string>> => {
    if (!user) { console.warn("getCompletedWords called without a user."); return new Set(); }
    return getCompletedWordsService(user.uid, gameModeId);
  }, [user]);

  const recordGameSuccess = useCallback(async (gameModeId: string, word: string, isMastered: boolean, coinsToAdd: number): Promise<void> => {
    if (!user) { console.warn("recordGameSuccess called without a user."); return; }
    await recordGameSuccessService(user.uid, gameModeId, word, isMastered, coinsToAdd);
  }, [user]);
  
  const fetchGameInitialData = useCallback(async (gameModeId: string, isMultiWordGame: boolean): Promise<any> => {
    if (!user) { console.warn("fetchGameInitialData called without a user."); throw new Error("Người dùng chưa đăng nhập"); }
    return fetchGameInitialDataService(user.uid, gameModeId, isMultiWordGame);
  }, [user]);

  const fetchOrCreateUser = useCallback(async (): Promise<any> => {
    if (!user) { console.warn("fetchOrCreateUser called without a user."); return null; }
    return fetchOrCreateUserService(user.uid);
  }, [user]);

  const updateUserCoins = useCallback(async (amount: number): Promise<void> => {
    if (!user) { console.warn("updateUserCoins called without a user."); return; }
    await updateUserCoinsService(user.uid, amount);
  }, [user]);


  const value = {
    currentView,
    selectedQuiz,
    selectedType,
    selectedPractice,
    user,
    userProgress, // Cung cấp toàn bộ object userProgress
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
    definitionsMap,
    generateAudioUrlsForWord,
    exampleData,
    defaultVocabulary,
    generateAudioQuizQuestions,
    generateAudioUrlsForExamSentence,
  };

  return <QuizAppContext.Provider value={value}>{children}</QuizAppContext.Provider>;
};
