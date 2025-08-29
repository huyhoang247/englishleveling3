
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { db, auth } from '../../firebase.js';
import { fetchOrCreateUser, updateUserCoins, getOpenedVocab, getCompletedWordsForGameMode, recordGameSuccess } from '../course-data-service.ts';
import quizData from './multiple-data.ts';
import detailedMeaningsText from '../../voca-data/vocabulary-definitions.ts';
import { exampleData } from '../../voca-data/example-data.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
import { generateAudioQuizQuestions } from '../../voca-data/audio-quiz-generator.ts';

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
  currentAudioUrl: string | null; // THÊM MỚI: URL audio hiện tại
  selectedVoice: 'matilda' | 'arabella'; // THÊM MỚI: Giọng đọc được chọn
  
  // Actions / Handlers
  handleAnswer: (selectedAnswer: string) => void;
  handleHintClick: () => void;
  handleNextQuestion: () => void;
  resetQuiz: () => void;
  handleDetailClick: () => void;
  handleVoiceChange: (voice: 'matilda' | 'arabella') => void; // THÊM MỚI: Hàm đổi giọng đọc

  // Detail Popup State
  showDetailPopup: boolean;
  detailData: Definition | null;
  onCloseDetailPopup: () => void;
}

// --- TẠO CONTEXT ---
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// --- TẠO PROVIDER COMPONENT ---
export const QuizProvider: React.FC<{ children: React.ReactNode; selectedPractice: number }> = ({ children, selectedPractice }) => {
  // --- TOÀN BỘ STATE VÀ LOGIC CỦA QUIZ ĐƯỢỢC CHUYỂN VÀO ĐÂY ---
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
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]); // Vẫn giữ để các hàm khác có thể dùng
  const [filteredQuizData, setFilteredQuizData] = useState<any[]>([]);
  const [playableQuestions, setPlayableQuestions] = useState<any[]>([]);
  const HINT_COST = 200;
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailData, setDetailData] = useState<Definition | null>(null);
  const [currentQuestionWord, setCurrentQuestionWord] = useState<string | null>(null);

  // THÊM MỚI: State để quản lý giọng đọc được chọn
  const [selectedVoice, setSelectedVoice] = useState<'matilda' | 'arabella'>('matilda');
  const handleVoiceChange = (voice: 'matilda' | 'arabella') => {
    setSelectedVoice(voice);
  };

  // THÊM MỚI: Tính toán URL audio hiện tại dựa trên câu hỏi và giọng đọc được chọn
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
    const unsubscribe = auth.onAuthStateChanged((currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadQuizData = async () => {
      if (user) {
        setLoading(true);
        try {
          const gameModeId = `quiz-${selectedPractice}`;
          const [userData, vocabList, completedSet] = await Promise.all([
            fetchOrCreateUser(user.uid),
            getOpenedVocab(user.uid),
            getCompletedWordsForGameMode(user.uid, gameModeId)
          ]);

          // Cập nhật state người dùng
          setCoins(userData.coins || 0);
          setMasteryCount(userData.masteryCards || 0);
          setUserVocabulary(vocabList); // Cập nhật để các logic khác sử dụng
          
          // --- LOGIC TẠO CÂU HỎI ĐƯỢC CHUYỂN VÀO ĐÂY ---
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
          // --- KẾT THÚC LOGIC TẠO CÂU HỎI ---

        } catch (error) {
          console.error("Lỗi khi tải dữ liệu quiz:", error);
          setCoins(0); setMasteryCount(0); setUserVocabulary([]); 
          setFilteredQuizData([]); setPlayableQuestions([]);
        } finally {
          // Chỉ tắt loading sau khi mọi thứ đã sẵn sàng
          setLoading(false);
        }
      } else {
        // Xử lý khi không có user
        setLoading(false);
        setCoins(0); setMasteryCount(0); setUserVocabulary([]);
        setFilteredQuizData([]); setPlayableQuestions([]);
      }
    };
    loadQuizData();
  }, [user, selectedPractice]); // Chạy lại khi user hoặc bài tập thay đổi

  const resetQuiz = useCallback(() => {
    // Để reset, chúng ta chỉ cần trigger lại useEffect trên bằng cách thay đổi một dependency
    // Nhưng vì không có state nào phù hợp, ta sẽ tái tạo logic tạo câu hỏi một cách đơn giản
    // Lưu ý: Logic này giả định userVocabulary không thay đổi trong phiên.
    // Nếu muốn cập nhật lại toàn bộ, cách tốt nhất là có một state để trigger `loadQuizData`.
    const completedWordsForSession = new Set(
      playableQuestions
        .slice(0, currentQuestion)
        .filter((q, index) => {
            const answer = playableQuestions[index].correctAnswer;
            // logic kiểm tra câu trả lời đúng của người dùng ở đây nếu có
            return true; // Giả định tất cả các câu đã qua là đã hoàn thành
        })
        .map(q => q.word || userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question)))
        .filter(Boolean)
        .map(word => word.toLowerCase())
    );

    const newRemainingQuestions = filteredQuizData.filter(q => {
        const word = q.word || userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question));
        return word && !completedWordsForSession.has(word.toLowerCase());
    });

    setPlayableQuestions(shuffleArray(newRemainingQuestions));
    setCurrentQuestion(0); setScore(0); setShowScore(false); setSelectedOption(null); setAnswered(false); setStreak(0); setTimeLeft(TOTAL_TIME); setShowNextButton(false); setHintUsed(false); setHiddenOptions([]);
    // THÊM MỚI: Reset lại giọng đọc về mặc định khi reset quiz
    setSelectedVoice('matilda');
  }, [playableQuestions, currentQuestion, filteredQuizData, userVocabulary]);


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
    if (showScore || answered || playableQuestions.length === 0 || loading) return; // Thêm check `loading`
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
      // THÊM MỚI: Reset lại giọng đọc về mặc định cho câu hỏi tiếp theo
      setSelectedVoice('matilda');
    } else { setShowScore(true); }
  };
  
  // NOTE: Hàm resetQuiz đã được sửa đổi ở trên.

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
    // THÊM MỚI: Cung cấp state và hàm xử lý giọng đọc
    currentAudioUrl,
    selectedVoice,
    handleVoiceChange,
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

