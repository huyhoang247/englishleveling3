// --- START OF FILE: multiple-context.tsx ---

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuizApp } from '../course-context.tsx';
import quizData from './multiple-data.ts';
import detailedMeaningsText from '../../voca-data/vocabulary-definitions.ts';
import { exampleData } from '../../voca-data/example-data.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
import { generateAudioQuizQuestions, generateAudioUrlsForExamSentence } from '../../voca-data/audio-quiz-generator.ts';

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
  currentAudioUrl: string | null;
  selectedVoice: string;
  
  // Actions / Handlers
  handleAnswer: (selectedAnswer: string) => void;
  handleHintClick: () => void;
  handleNextQuestion: () => void;
  resetQuiz: () => void;
  handleDetailClick: () => void;
  handleVoiceChange: (voice: string) => void;
  handleChangeVoiceDirection: (direction: 'next' | 'previous') => void;

  // Detail Popup State
  showDetailPopup: boolean;
  detailData: Definition | null;
  onCloseDetailPopup: () => void;
}

// --- TẠO CONTEXT ---
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// --- TẠO PROVIDER COMPONENT ---
export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    selectedPractice,
    userCoins,
    masteryCount: globalMasteryCount,
    getOpenedVocab, 
    getCompletedWords, 
    recordGameSuccess,
    updateUserCoins,
    fetchOrCreateUser
  } = useQuizApp();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const TOTAL_TIME = 30;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]);
  const [filteredQuizData, setFilteredQuizData] = useState<any[]>([]);
  const [playableQuestions, setPlayableQuestions] = useState<any[]>([]);
  const HINT_COST = 200;
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailData, setDetailData] = useState<Definition | null>(null);
  const [currentQuestionWord, setCurrentQuestionWord] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Matilda');

  // Sync local UI state with the global state from context
  useEffect(() => { setCoins(userCoins); }, [userCoins]);
  useEffect(() => { setMasteryCount(globalMasteryCount); }, [globalMasteryCount]);

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
  };

  const handleChangeVoiceDirection = useCallback((direction: 'next' | 'previous') => {
    const question = playableQuestions[currentQuestion];
    if (!question?.audioUrls) return;
    const availableVoices = Object.keys(question.audioUrls);
    if (availableVoices.length <= 1) return;
    const currentIndex = availableVoices.indexOf(selectedVoice);
    if (currentIndex === -1) return;
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % availableVoices.length;
    } else {
      nextIndex = (currentIndex - 1 + availableVoices.length) % availableVoices.length;
    }
    setSelectedVoice(availableVoices[nextIndex]);
  }, [currentQuestion, playableQuestions, selectedVoice]);

  const currentAudioUrl = useMemo(() => {
    const question = playableQuestions[currentQuestion];
    if (question?.audioUrls) {
      return question.audioUrls[selectedVoice];
    }
    return null;
  }, [currentQuestion, playableQuestions, selectedVoice]);

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
    const loadQuizData = async () => {
      if (user && selectedPractice !== null) {
        setLoading(true);
        try {
          await fetchOrCreateUser(); // Ensure user doc exists
          const gameModeId = `quiz-${selectedPractice}`;
          const [vocabList, completedSet] = await Promise.all([
            getOpenedVocab(),
            getCompletedWords(gameModeId)
          ]);
          setUserVocabulary(vocabList);
          
          const practiceBaseId = selectedPractice % 100;
          let allPossibleQuestions: any[] = [];
          let remainingQuestions: any[] = [];
    
          if (practiceBaseId === 2 || practiceBaseId === 3) {
              allPossibleQuestions = vocabList.flatMap(word => {
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
              remainingQuestions = allPossibleQuestions.filter(q => !completedSet.has(q.word.toLowerCase()));
          } else if (practiceBaseId === 4) {
              allPossibleQuestions = generateAudioQuizQuestions(vocabList);
              remainingQuestions = allPossibleQuestions.filter(q => !completedSet.has(q.word.toLowerCase()));
          } else if (practiceBaseId === 5) {
              allPossibleQuestions = vocabList.flatMap(word => {
                  const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                  const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                  if (matchingSentences.length > 0) {
                      const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                      const sentenceIndex = exampleData.findIndex(ex => ex.english === randomSentence.english && ex.vietnamese === randomSentence.vietnamese);
                      if (sentenceIndex === -1) return [];
                      const audioUrls = generateAudioUrlsForExamSentence(sentenceIndex);
                      if (!audioUrls) return [];
                      const incorrectOptions: string[] = [];
                      const lowerCaseCorrectWord = word.toLowerCase();
                      while (incorrectOptions.length < 3) {
                          const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)];
                          if (randomWord.toLowerCase() !== lowerCaseCorrectWord && !incorrectOptions.some(opt => opt.toLowerCase() === randomWord.toLowerCase())) {
                              incorrectOptions.push(randomWord);
                          }
                      }
                      const questionText = randomSentence.english.replace(wordRegex, '___');
                      return [{ question: questionText, vietnamese: null, audioUrls: audioUrls, options: [word.toLowerCase(), ...incorrectOptions.map(opt => opt.toLowerCase())], correctAnswer: word.toLowerCase(), word: word }];
                  }
                  return [];
              });
              remainingQuestions = allPossibleQuestions.filter(q => !completedSet.has(q.word.toLowerCase()));
          } else { // practiceBaseId === 1
              allPossibleQuestions = quizData.filter(question =>
                  vocabList.some(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(question.question))
              );
              remainingQuestions = allPossibleQuestions.filter(q => {
                  const matchedWord = vocabList.find(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(q.question));
                  return !(matchedWord && completedSet.has(matchedWord.toLowerCase()));
              });
          }
    
          setFilteredQuizData(allPossibleQuestions);
          setPlayableQuestions(shuffleArray(remainingQuestions));
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu quiz:", error);
          setUserVocabulary([]); setFilteredQuizData([]); setPlayableQuestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setUserVocabulary([]); setFilteredQuizData([]); setPlayableQuestions([]);
      }
    };
    loadQuizData();
  }, [user, selectedPractice, fetchOrCreateUser, getOpenedVocab, getCompletedWords]);

  const resetQuiz = useCallback(() => {
    const completedWordsForSession = new Set(
      playableQuestions.slice(0, currentQuestion).map(q => q.word || userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question))).filter(Boolean).map(word => word.toLowerCase())
    );
    const newRemainingQuestions = filteredQuizData.filter(q => {
        const word = q.word || userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question));
        return word && !completedWordsForSession.has(word.toLowerCase());
    });
    setPlayableQuestions(shuffleArray(newRemainingQuestions));
    setCurrentQuestion(0); setScore(0); setShowScore(false); setSelectedOption(null); setAnswered(false); setStreak(0); setTimeLeft(TOTAL_TIME); setShowNextButton(false); setHintUsed(false); setHiddenOptions([]);
    setSelectedVoice('Matilda');
  }, [playableQuestions, currentQuestion, filteredQuizData, userVocabulary]);

  useEffect(() => {
    if (playableQuestions[currentQuestion]?.options) {
      setShuffledOptions(shuffleArray(playableQuestions[currentQuestion].options));
    }
  }, [currentQuestion, playableQuestions]);

  useEffect(() => {
    if (playableQuestions.length > 0 && currentQuestion < playableQuestions.length) {
      const currentQuizItem = playableQuestions[currentQuestion];
      const isSpecialType = [2, 3, 4, 5].includes(selectedPractice % 100);
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
    if (showScore || answered || playableQuestions.length === 0 || loading) return;
    setTimeLeft(TOTAL_TIME);
    const timerId = setInterval(() => { setTimeLeft(prevTime => { if (prevTime <= 1) { clearInterval(timerId); handleTimeUp(); return 0; } return prevTime - 1; }); }, 1000);
    return () => clearInterval(timerId);
  }, [currentQuestion, answered, showScore, playableQuestions.length, loading]);

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
          await recordGameSuccess(gameModeId, currentQuestionWord, false, coinsToAdd);
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
        await updateUserCoins(-HINT_COST);
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
      setSelectedVoice('Matilda');
    } else { setShowScore(true); }
  };

  const handleDetailClick = () => {
    if (currentQuestionWord) {
      const definition = definitionsMap[currentQuestionWord.toLowerCase()];
      if (definition) { setDetailData(definition); setShowDetailPopup(true); }
    }
  };

  const onCloseDetailPopup = () => setShowDetailPopup(false);

  const value = {
    loading, showScore, currentQuestion, score, coins, streak, masteryCount, streakAnimation,
    timeLeft, playableQuestions, filteredQuizData, shuffledOptions, selectedOption,
    answered, showNextButton, hintUsed, hiddenOptions, currentQuestionWord,
    handleAnswer, handleHintClick, handleNextQuestion, resetQuiz, handleDetailClick,
    showDetailPopup, detailData, onCloseDetailPopup, showConfetti,
    currentAudioUrl,
    selectedVoice,
    handleVoiceChange,
    handleChangeVoiceDirection,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType & { showConfetti: boolean } => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context as QuizContextType & { showConfetti: boolean };
};
// --- END OF FILE: multiple-context.tsx ---
