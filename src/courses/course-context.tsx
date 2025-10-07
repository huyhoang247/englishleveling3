import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { auth } from '../firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  listenToUserData,
  getOpenedVocab as getOpenedVocabService,
  getCompletedWordsForGameMode as getCompletedWordsService,
  recordGameSuccess as recordGameSuccessService,
  fetchOrCreateUser as fetchOrCreateUserService, // NEW: Import
  updateUserCoins as updateUserCoinsService,   // NEW: Import
} from './course-data-service.ts';

// --- Định nghĩa "hình dạng" của Context ---
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
  updateUserCoins: (amount: number) => Promise<void>; // NEW
  fetchOrCreateUser: () => Promise<any>; // NEW
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
  const [userCoins, setUserCoins] = useState(0);
  const [masteryCount, setMasteryCount] = useState(0);

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
  };

  return <QuizAppContext.Provider value={value}>{children}</QuizAppContext.Provider>;
};
