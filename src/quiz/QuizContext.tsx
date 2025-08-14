// --- START OF FILE src/quiz/QuizContext.tsx ---

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { db, auth } from '../firebase.js';
import { fetchOrCreateUser, updateUserCoins, getOpenedVocab, getCompletedWordsForGameMode, recordGameSuccess } from '../userDataService.ts';
import quizData from './quiz-data.ts';
import detailedMeaningsText from '../vocabulary-definitions.ts';
import { exampleData } from '../example-data.ts';
import { defaultVocabulary } from '../list-vocabulary.ts';
import { generateAudioQuizQuestions } from '../audio-quiz-generator.ts';

// --- CÁC HÀM TIỆN ÍCH VÀ INTERFACE ---
const shuffleArray = (array: any[]) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

interface Definition { vietnamese: string; english: string; explanation: string; }

// --- ĐỊNH NGHĨA TYPE CHO CONTEXT ---
interface QuizContextType {
  // State
  loading: boolean;
  showScore: boolean;
  currentQuestion: number;
  score: number;
  coins: number;
  streak: number;
  masteryCount: number;
  streakAnimation: boolean;
  timeLeft: number;
  playableQuestions: any[];
  filteredQuizData: any[];
  shuffledOptions: string[];
  selectedOption: string | null;
  answered: boolean;
  showNextButton: boolean;
  hintUsed: boolean;
  hiddenOptions: string[];
  currentQuestionWord: string | null;
  
  // Actions / Handlers
  handleAnswer: (selectedAnswer: string) => void;
  handleHintClick: () => void;
  handleNextQuestion: () => void;
  resetQuiz: () => void;
  handleDetailClick: () => void;

  // Detail Popup State
  showDetailPopup: boolean;
  detailData: Definition | null;
  onCloseDetailPopup: () => void;
}

// --- TẠO CONTEXT ---
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// --- TẠO PROVIDER COMPONENT ---
export const QuizProvider: React.FC<{ children: React.ReactNode; selectedPractice: number }> = ({ children, selectedPractice }) => {
  // --- TOÀN BỘ STATE VÀ LOGIC CỦA QUIZ ĐƯỢC CHUYỂN VÀO ĐÂY ---
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const TOTAL_TIME = 30;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]);
  const [completedQuizWords, setCompletedQuizWords] = useState<Set<string>>(new Set());
  const [filteredQuizData, setFilteredQuizData] = useState<any[]>([]);
  const [playableQuestions, setPlayableQuestions] = useState<any[]>([]);
  const HINT_COST = 200;
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailData, setDetailData] = useState<Definition | null>(null);
  const [currentQuestionWord, setCurrentQuestionWord] = useState<string | null>(null);

  const definitionsMap = useMemo(() => {
    const definitions: { [key: string]: Definition } = {};
    const lines = detailedMeaningsText.trim().split('\n');
    lines.forEach(line => {
      if (line.trim() === '') return;
      const match = line.match(/^(.+?)\s+\((.+?)\)\s+là\s+(.*)/);
      if (match) {
        const vietnameseWord = match[1].trim(); const englishWord = match[2].trim(); const explanation = match[3].trim();
        definitions[englishWord.toLowerCase()] = { vietnamese: vietnameseWord, english: englishWord, explanation: explanation };
      }
    });
    return definitions;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const gameModeId = `quiz-${selectedPractice}`;
          const [userData, vocabList, completedSet] = await Promise.all([
            fetchOrCreateUser(user.uid),
            getOpenedVocab(user.uid),
            getCompletedWordsForGameMode(user.uid, gameModeId)
          ]);
          setCoins(userData.coins || 0);
          setMasteryCount(userData.masteryCards || 0);
          setUserVocabulary(vocabList);
          setCompletedQuizWords(completedSet);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu người dùng:", error);
          setCoins(0); setMasteryCount(0); setUserVocabulary([]); setCompletedQuizWords(new Set());
        } finally { setLoading(false); }
      } else {
        setLoading(false);
        setCoins(0); setMasteryCount(0); setUserVocabulary([]); setCompletedQuizWords(new Set());
      }
    };
    fetchData();
  }, [user, selectedPractice]);

  const generatePractice1Questions = useCallback(() => {
      const allMatchingQuestions = quizData.filter(question =>
          userVocabulary.some(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(question.question))
      );
      const remainingQuestions = allMatchingQuestions.filter(q => {
          const matchedWord = userVocabulary.find(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(q.question));
          return !(matchedWord && completedQuizWords.has(matchedWord.toLowerCase()));
      });
      return { allMatchingQuestions, remainingQuestions };
  }, [userVocabulary, completedQuizWords]);

  useEffect(() => {
      if (loading) return;
      const practiceBaseId = selectedPractice % 100;
      let allPossibleQuestions: any[] = [];
      let remainingQuestions: any[] = [];

      if (practiceBaseId === 2 || practiceBaseId === 3) {
          allPossibleQuestions = userVocabulary.flatMap(word => {
              const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
              const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
              if (matchingSentences.length > 0) {
                  const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                  const questionText = randomSentence.english.replace(wordRegex, '___');
                  const incorrectOptions: string[] = []; const lowerCaseCorrectWord = word.toLowerCase();
                  while (incorrectOptions.length < 3) {
                      const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)];
                      if (randomWord.toLowerCase() !== lowerCaseCorrectWord && !incorrectOptions.some(opt => opt.toLowerCase() === randomWord.toLowerCase())) {
                          incorrectOptions.push(randomWord);
                      }
                  }
                  return [{ question: questionText, vietnamese: randomSentence.vietnamese, options: [word.toLowerCase(), ...incorrectOptions.map(opt => opt.toLowerCase())], correctAnswer: word.toLowerCase(), word: word }];
              }
              return [];
          });
          remainingQuestions = allPossibleQuestions.filter(q => !completedQuizWords.has(q.word.toLowerCase()));
      } else if (practiceBaseId === 4) {
          allPossibleQuestions = generateAudioQuizQuestions(userVocabulary);
          remainingQuestions = allPossibleQuestions.filter(q => !completedQuizWords.has(q.word.toLowerCase()));
      } else {
          const { allMatchingQuestions, remainingQuestions: p1Remaining } = generatePractice1Questions();
          allPossibleQuestions = allMatchingQuestions;
          remainingQuestions = p1Remaining;
      }

      setFilteredQuizData(allPossibleQuestions);
      setPlayableQuestions(shuffleArray(remainingQuestions));

  }, [selectedPractice, loading, userVocabulary, completedQuizWords, generatePractice1Questions]);

  useEffect(() => {
    if (playableQuestions[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(playableQuestions[currentQuestion].options));
    }
  }, [currentQuestion, playableQuestions]);

  useEffect(() => {
    if (playableQuestions.length > 0 && currentQuestion < playableQuestions.length) {
      const currentQuizItem = playableQuestions[currentQuestion];
      const isSpecialType = [2, 3, 4].includes(selectedPractice % 100);
      if (isSpecialType) {
        setCurrentQuestionWord(currentQuizItem.word);
      } else {
        const matchedWord = userVocabulary.find(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(currentQuizItem.question));
        setCurrentQuestionWord(matchedWord || null);
      }
    } else { setCurrentQuestionWord(null); }
  }, [currentQuestion, playableQuestions, userVocabulary, selectedPractice]);

  const handleTimeUp = () => { if (answered) return; setAnswered(true); setSelectedOption(null); setStreak(0); setShowNextButton(true); };

  useEffect(() => {
    if (showScore || answered || playableQuestions.length === 0) return;
    setTimeLeft(TOTAL_TIME);
    const timerId = setInterval(() => { setTimeLeft(prevTime => { if (prevTime <= 1) { clearInterval(timerId); handleTimeUp(); return 0; } return prevTime - 1; }); }, 1000);
    return () => clearInterval(timerId);
  }, [currentQuestion, answered, showScore, playableQuestions.length]);

  const handleAnswer = async (selectedAnswer: string) => {
    if (answered || playableQuestions.length === 0) return;
    setSelectedOption(selectedAnswer);
    setAnswered(true);
    const currentQuizItem = playableQuestions[currentQuestion];
    const isCorrect = selectedAnswer === currentQuizItem.correctAnswer;
    if (isCorrect) {
      setShowConfetti(true); setScore(prev => prev + 1); const newStreak = streak + 1; setStreak(newStreak); const coinsToAdd = masteryCount * newStreak;
      if (coinsToAdd > 0) { setCoins(prevCoins => prevCoins + coinsToAdd); }
      if (newStreak >= 1) { setStreakAnimation(true); setTimeout(() => setStreakAnimation(false), 1500); }
      if (user && currentQuestionWord) {
        try {
          const gameModeId = `quiz-${selectedPractice}`;
          await recordGameSuccess(user.uid, gameModeId, currentQuestionWord, false, coinsToAdd);
        } catch (error) {
          console.error("Lỗi khi ghi lại kết quả game Quiz:", error);
          if (coinsToAdd > 0) setCoins(prevCoins => prevCoins - coinsToAdd);
        }
      }
      setTimeout(() => { setShowConfetti(false); setShowNextButton(true); }, 4000);
    } else { setStreak(0); setShowNextButton(true); }
  };

  const handleHintClick = async () => {
    if (hintUsed || answered || coins < HINT_COST || playableQuestions.length === 0) return;
    setHintUsed(true);
    setCoins(prevCoins => prevCoins - HINT_COST);
    if (user) {
      try {
        await updateUserCoins(user.uid, -HINT_COST);
      } catch (error) {
        console.error("Lỗi khi cập nhật vàng cho gợi ý:", error);
        setCoins(prevCoins => prevCoins + HINT_COST);
        setHintUsed(false);
        return;
      }
    }
    const currentQuizItem = playableQuestions[currentQuestion];
    const correctAnswer = currentQuizItem.correctAnswer;
    const incorrectOptions = shuffledOptions.filter(opt => opt !== correctAnswer);
    const optionsToHide = shuffleArray(incorrectOptions).slice(0, 2);
    setHiddenOptions(optionsToHide);
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < playableQuestions.length) {
      setCurrentQuestion(nextQuestion); setSelectedOption(null); setAnswered(false); setShowNextButton(false); setHintUsed(false); setHiddenOptions([]);
    } else { setShowScore(true); }
  };

  const resetQuiz = () => {
    let newPlayableQuestions: any[] = [];
    const practiceBaseId = selectedPractice % 100;

    if ([2, 3, 4].includes(practiceBaseId)) {
        // Tái sử dụng logic đã có để tạo lại câu hỏi
        const { remainingQuestions } = generatePractice1Questions(); // Tái sử dụng logic này nếu phù hợp
        newPlayableQuestions = remainingQuestions;
    } else {
        const { remainingQuestions } = generatePractice1Questions();
        newPlayableQuestions = remainingQuestions;
    }
    setPlayableQuestions(shuffleArray(newPlayableQuestions));
    setCurrentQuestion(0); setScore(0); setShowScore(false); setSelectedOption(null); setAnswered(false); setStreak(0); setTimeLeft(TOTAL_TIME); setShowNextButton(false); setHintUsed(false); setHiddenOptions([]);
  };

  const handleDetailClick = () => {
    if (currentQuestionWord) {
      const definition = definitionsMap[currentQuestionWord.toLowerCase()];
      if (definition) { setDetailData(definition); setShowDetailPopup(true); }
    }
  };

  const onCloseDetailPopup = () => setShowDetailPopup(false);

  // --- TẠO GIÁ TRỊ ĐỂ CUNG CẤP CHO CONTEXT ---
  const value = {
    loading, showScore, currentQuestion, score, coins, streak, masteryCount, streakAnimation,
    timeLeft, playableQuestions, filteredQuizData, shuffledOptions, selectedOption,
    answered, showNextButton, hintUsed, hiddenOptions, currentQuestionWord,
    handleAnswer, handleHintClick, handleNextQuestion, resetQuiz, handleDetailClick,
    showDetailPopup, detailData, onCloseDetailPopup, showConfetti,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

// --- TẠO CUSTOM HOOK ---
export const useQuiz = (): QuizContextType & { showConfetti: boolean } => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context as QuizContextType & { showConfetti: boolean };
};
