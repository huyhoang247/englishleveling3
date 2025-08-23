import { create } from 'zustand';
import { auth } from '../../firebase.js';
import { fetchOrCreateUser, updateUserCoins, getOpenedVocab, getCompletedWordsForGameMode, recordGameSuccess } from '../course-data-service.ts';
import quizData from './multiple-data.ts';
import detailedMeaningsText from '../../voca-data/vocabulary-definitions.ts';
import { exampleData } from '../../voca-data/example-data.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
import { generateAudioQuizQuestions } from '../../voca-data/audio-quiz-generator.ts';

// --- CÁC HÀM TIỆN ÍCH VÀ INTERFACE (Giữ nguyên) ---
const shuffleArray = (array: any[]) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

interface Definition { vietnamese: string; english: string; explanation: string; }

// --- ĐỊNH NGHĨA TYPE CHO ZUSTAND STORE ---
interface QuizState {
  // State hiển thị trên UI
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
  showDetailPopup: boolean;
  detailData: Definition | null;
  showConfetti: boolean;
  // State quản lý nội bộ
  user: any; // Firebase user object
  userVocabulary: string[];
  timerId: NodeJS.Timeout | null;
  definitionsMap: { [key: string]: Definition };
  selectedPractice: number | null;
}

interface QuizActions {
  init: () => void;
  loadQuizData: (user: any, selectedPractice: number) => Promise<void>;
  handleAnswer: (selectedAnswer: string) => Promise<void>;
  handleHintClick: () => Promise<void>;
  handleNextQuestion: () => void;
  resetQuiz: () => void;
  handleDetailClick: () => void;
  onCloseDetailPopup: () => void;
  cleanup: () => void;
}

// --- KHỞI TẠO STORE ---
const TOTAL_TIME = 30;
const HINT_COST = 200;

const initialState: QuizState = {
  loading: true,
  showScore: false,
  currentQuestion: 0,
  score: 0,
  coins: 0,
  streak: 0,
  masteryCount: 0,
  streakAnimation: false,
  timeLeft: TOTAL_TIME,
  playableQuestions: [],
  filteredQuizData: [],
  shuffledOptions: [],
  selectedOption: null,
  answered: false,
  showNextButton: false,
  hintUsed: false,
  hiddenOptions: [],
  currentQuestionWord: null,
  showDetailPopup: false,
  detailData: null,
  showConfetti: false,
  user: null,
  userVocabulary: [],
  timerId: null,
  definitionsMap: {},
  selectedPractice: null,
};

const stopTimer = (get: () => QuizState & QuizActions) => {
    if (get().timerId) {
      clearInterval(get().timerId);
      set({ timerId: null });
    }
};

const startTimer = (set: (updater: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void, get: () => QuizState & QuizActions) => {
    stopTimer(get);
    set({ timeLeft: TOTAL_TIME });
    const timerId = setInterval(() => {
      set(state => {
        if (state.timeLeft <= 1) {
          stopTimer(get);
          if (!get().answered) {
            set({ answered: true, selectedOption: null, streak: 0, showNextButton: true });
          }
          return { timeLeft: 0 };
        }
        return { timeLeft: state.timeLeft - 1 };
      });
    }, 1000);
    set({ timerId });
};

export const useQuizStore = create<QuizState & QuizActions>((set, get) => ({
  ...initialState,

  init: () => {
    const definitions: { [key: string]: Definition } = {};
    const lines = detailedMeaningsText.trim().split('\n');
    lines.forEach(line => {
      if (line.trim() === '') return;
      const match = line.match(/^(.+?)\s+\((.+?)\)\s+là\s+(.*)/);
      if (match) {
        const [, vietnameseWord, englishWord, explanation] = match;
        definitions[englishWord.trim().toLowerCase()] = { vietnamese: vietnameseWord.trim(), english: englishWord.trim(), explanation: explanation.trim() };
      }
    });
    set({ definitionsMap: definitions });
  },

  loadQuizData: async (user, selectedPractice) => {
    stopTimer(get);
    set({ ...initialState, loading: true, user: user, selectedPractice: selectedPractice, definitionsMap: get().definitionsMap });

    if (!user) {
      set({ loading: false });
      return;
    }

    try {
      const gameModeId = `quiz-${selectedPractice}`;
      const [userData, vocabList, completedSet] = await Promise.all([
        fetchOrCreateUser(user.uid), getOpenedVocab(user.uid), getCompletedWordsForGameMode(user.uid, gameModeId)
      ]);

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
      } else {
          allPossibleQuestions = quizData.filter(question => vocabList.some(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(question.question)));
          remainingQuestions = allPossibleQuestions.filter(q => {
              const matchedWord = vocabList.find(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(q.question));
              return !(matchedWord && completedSet.has(matchedWord.toLowerCase()));
          });
      }
      
      const playable = shuffleArray(remainingQuestions);
      set({ coins: userData.coins || 0, masteryCount: userData.masteryCards || 0, userVocabulary: vocabList, filteredQuizData: allPossibleQuestions, playableQuestions: playable });

      if (playable.length > 0) {
        const currentQuizItem = playable[0];
        const isSpecialType = [2, 3, 4].includes(selectedPractice % 100);
        const matchedWord = isSpecialType ? currentQuizItem.word : (vocabList.find(v => new RegExp(`\\b${v}\\b`, 'i').test(currentQuizItem.question)) || null);
        set({ shuffledOptions: shuffleArray(currentQuizItem.options), currentQuestionWord: matchedWord });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu quiz:", error);
      set({ coins: 0, masteryCount: 0, userVocabulary: [], filteredQuizData: [], playableQuestions: [] });
    } finally {
      set({ loading: false });
      if (get().playableQuestions.length > 0) {
        startTimer(set, get);
      }
    }
  },

  handleAnswer: async (selectedAnswer) => {
    const { answered, playableQuestions, currentQuestion, streak, masteryCount, user, currentQuestionWord, selectedPractice } = get();
    if (answered || playableQuestions.length === 0) return;
    stopTimer(get);
    set({ selectedOption: selectedAnswer, answered: true });
    const isCorrect = selectedAnswer === playableQuestions[currentQuestion].correctAnswer;
    if (isCorrect) {
      const newStreak = streak + 1;
      const coinsToAdd = masteryCount * newStreak;
      set(state => ({ showConfetti: true, score: state.score + 1, streak: newStreak, coins: state.coins + coinsToAdd }));
      if (newStreak >= 1) {
        set({ streakAnimation: true });
        setTimeout(() => set({ streakAnimation: false }), 1500);
      }
      if (user && currentQuestionWord && selectedPractice) {
        try {
          await recordGameSuccess(user.uid, `quiz-${selectedPractice}`, currentQuestionWord, false, coinsToAdd);
        } catch (error) {
          console.error("Lỗi khi ghi lại kết quả game Quiz:", error);
          if (coinsToAdd > 0) set(state => ({ coins: state.coins - coinsToAdd }));
        }
      }
      setTimeout(() => set({ showConfetti: false, showNextButton: true }), 4000);
    } else {
      set({ streak: 0, showNextButton: true });
    }
  },

  handleHintClick: async () => {
    const { hintUsed, answered, coins, playableQuestions, currentQuestion, user, shuffledOptions } = get();
    if (hintUsed || answered || coins < HINT_COST || playableQuestions.length === 0) return;
    set({ hintUsed: true, coins: coins - HINT_COST });
    if (user) {
      try { await updateUserCoins(user.uid, -HINT_COST); } catch (error) {
        console.error("Lỗi khi cập nhật vàng cho gợi ý:", error);
        set(state => ({ coins: state.coins + HINT_COST, hintUsed: false }));
        return;
      }
    }
    const correctAnswer = playableQuestions[currentQuestion].correctAnswer;
    const incorrectOptions = shuffledOptions.filter(opt => opt !== correctAnswer);
    set({ hiddenOptions: shuffleArray(incorrectOptions).slice(0, 2) });
  },

  handleNextQuestion: () => {
    const { currentQuestion, playableQuestions, userVocabulary, selectedPractice } = get();
    const nextQuestionIndex = currentQuestion + 1;
    if (nextQuestionIndex < playableQuestions.length) {
      const nextQuizItem = playableQuestions[nextQuestionIndex];
      const isSpecialType = selectedPractice ? [2, 3, 4].includes(selectedPractice % 100) : false;
      const matchedWord = isSpecialType ? nextQuizItem.word : (userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(nextQuizItem.question)) || null);
      set({ currentQuestion: nextQuestionIndex, selectedOption: null, answered: false, showNextButton: false, hintUsed: false, hiddenOptions: [], shuffledOptions: shuffleArray(nextQuizItem.options), currentQuestionWord: matchedWord });
      startTimer(set, get);
    } else {
      stopTimer(get);
      set({ showScore: true });
    }
  },

  resetQuiz: () => {
    const { filteredQuizData, userVocabulary, selectedPractice } = get();
    const newPlayableQuestions = shuffleArray(filteredQuizData);
    set({ showScore: false, currentQuestion: 0, score: 0, selectedOption: null, answered: false, streak: 0, showNextButton: false, hintUsed: false, hiddenOptions: [], playableQuestions: newPlayableQuestions });
    if (newPlayableQuestions.length > 0) {
      const newCurrentQuizItem = newPlayableQuestions[0];
      const isSpecialType = selectedPractice ? [2, 3, 4].includes(selectedPractice % 100) : false;
      const matchedWord = isSpecialType ? newCurrentQuizItem.word : (userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(newCurrentQuizItem.question)) || null);
      set({ shuffledOptions: shuffleArray(newCurrentQuizItem.options), currentQuestionWord: matchedWord });
      startTimer(set, get);
    }
  },

  handleDetailClick: () => {
    const { currentQuestionWord, definitionsMap } = get();
    if (currentQuestionWord) {
      const definition = definitionsMap[currentQuestionWord.toLowerCase()];
      if (definition) set({ detailData: definition, showDetailPopup: true });
    }
  },

  onCloseDetailPopup: () => set({ showDetailPopup: false }),

  cleanup: () => {
    stopTimer(get);
    set(initialState);
  },
}));
