// --- START OF FILE: src/hooks/useOptimizedQuizData.ts ---

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

// Import data sources
import quizData from '../quiz/quiz-data.ts';
import { exampleData } from '../example-data.ts';
import { defaultVocabulary } from '../list-vocabulary.ts';

// --- TYPE DEFINITIONS for our optimized data structure ---

export interface Progress {
  completed: number;
  total: number;
}

export interface PlayableQuestion {
  // Generic structure for all question types
  question: string;
  vietnamese?: string;
  options?: string[];
  correctAnswer?: string;
  word: string; // The core word(s) being tested. For multi-word, it's a space-separated string.
  imageIndex?: number;
}

interface UserVocabItem {
  word: string;
  id: string; // Document ID, which is the image index for P1
}

interface OptimizedData {
  loading: boolean;
  error: string | null;
  user: User | null;
  userStats: {
    coins: number;
    masteryCount: number;
  };
  progressData: Map<number, Progress>; // Use Map for O(1) lookups
  playableQuestions: Map<number, PlayableQuestion[]>;
  claimedRewards: { [key: string]: boolean };
  allUserVocabulary: string[]; // Pass this down for other potential uses
}

const MAX_PREVIEWS = 5;

// --- THE CUSTOM HOOK ---

export const useOptimizedQuizData = (): OptimizedData => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for RAW data from Firestore
  const [rawUserDoc, setRawUserDoc] = useState<any>(null);
  const [rawUserVocab, setRawUserVocab] = useState<UserVocabItem[]>([]);
  const [rawCompletedWords, setRawCompletedWords] = useState<Map<string, any>>(new Map());
  const [rawCompletedMultiWord, setRawCompletedMultiWord] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'openedVocab')),
          getDocs(collection(db, 'users', user.uid, 'completedWords')),
          getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);
        
        setRawUserDoc(userDocSnap.exists() ? userDocSnap.data() : { coins: 0, masteryCards: 0, claimedQuizRewards: {} });
        
        const vocabList: UserVocabItem[] = openedVocabSnapshot.docs
            .map(d => ({ word: d.data().word, id: d.id }))
            .filter(v => v.word);
        setRawUserVocab(vocabList);

        const completedMap = new Map<string, any>();
        completedWordsSnapshot.forEach(d => completedMap.set(d.id.toLowerCase(), d.data()));
        setRawCompletedWords(completedMap);

        const completedMultiMap = new Map<string, any>();
        completedMultiWordSnapshot.forEach(d => completedMultiMap.set(d.id.toLowerCase(), d.data()));
        setRawCompletedMultiWord(completedMultiMap);

      } catch (e: any) {
        console.error("Lỗi khi tải dữ liệu thô:", e);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // The MAGIC happens here! All heavy computation is memoized.
  const optimizedData = useMemo<OptimizedData>(() => {
    if (loading || !rawUserDoc) {
      return {
        loading: true, error: null, user, userStats: { coins: 0, masteryCount: 0 },
        progressData: new Map(), playableQuestions: new Map(), claimedRewards: {}, allUserVocabulary: []
      };
    }

    const userVocabList = rawUserVocab.map(v => v.word);

    const newProgressData = new Map<number, Progress>();
    const newPlayableQuestions = new Map<number, PlayableQuestion[]>();

    const allPracticeTypes = ['tracNghiem', 'dienTu'];
    allPracticeTypes.forEach(type => {
        const basePracticeIds = type === 'tracNghiem' ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7];
        let allPossibleIds = [...basePracticeIds];
        for (let i = 1; i <= MAX_PREVIEWS; i++) {
            basePracticeIds.forEach(baseId => allPossibleIds.push(i * 100 + baseId));
        }

        allPossibleIds.forEach(practiceId => {
            let allQuestions: PlayableQuestion[] = [];
            const gameModeId = `${type === 'tracNghiem' ? 'quiz' : 'fill-word'}-${practiceId}`;
            const practiceBaseId = practiceId % 100;

            // --- 'tracNghiem' Question Generation ---
            if (type === 'tracNghiem') {
                if (practiceBaseId === 1) {
                    allQuestions = quizData
                        .filter(q => userVocabList.some(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question)))
                        .map(q => {
                           const foundWord = userVocabList.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question));
                           return { ...q, question: q.question, word: foundWord || '' };
                        });
                } else if (practiceBaseId === 2 || practiceBaseId === 3) {
                    userVocabList.forEach(word => {
                        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                        const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                        if (matchingSentences.length > 0) {
                            const s = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                            const incorrectOptions = [];
                            while (incorrectOptions.length < 3) {
                                const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)];
                                if (randomWord.toLowerCase() !== word.toLowerCase() && !incorrectOptions.includes(randomWord)) {
                                    incorrectOptions.push(randomWord);
                                }
                            }
                            allQuestions.push({
                                question: s.english.replace(wordRegex, '___'),
                                vietnamese: s.vietnamese,
                                options: [word, ...incorrectOptions],
                                correctAnswer: word,
                                word: word,
                            });
                        }
                    });
                }
            }

            // --- 'dienTu' Question Generation ---
            if (type === 'dienTu') {
                if (practiceBaseId === 1) {
                    allQuestions = rawUserVocab.map(v => ({
                        word: v.word,
                        question: `Đoán từ qua hình ảnh`,
                        vietnamese: `Nghĩa của từ "${v.word}"`,
                        imageIndex: Number(v.id)
                    }));
                } else if (practiceBaseId === 2) {
                    userVocabList.forEach(word => {
                        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                        const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                        if (matchingSentences.length > 0) {
                            const s = matchingSentences[0];
                            allQuestions.push({
                                question: s.english.replace(wordRegex, '___'),
                                vietnamese: s.vietnamese,
                                word: word
                            });
                        }
                    });
                } else if (practiceBaseId >= 3 && practiceBaseId <= 7) {
                    const requiredWords = practiceBaseId === 7 ? 1 : practiceBaseId - 1; // P3=2, P4=3, P5=4, P6=5, P7=1
                     exampleData.forEach(sentence => {
                        const wordsInSentence = userVocabList.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(sentence.english));
                        if (wordsInSentence.length >= requiredWords) {
                            const wordsToHide = (practiceBaseId === 7)
                                ? wordsInSentence
                                : [...wordsInSentence].sort(() => 0.5 - Math.random()).slice(0, requiredWords);
                            
                            const orderedWordsToHide = wordsToHide.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()));
                            
                            let questionText = sentence.english;
                            const regexToHide = new RegExp(`\\b(${orderedWordsToHide.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
                            questionText = questionText.replace(regexToHide, '___');

                            allQuestions.push({
                                question: questionText,
                                vietnamese: sentence.vietnamese,
                                word: orderedWordsToHide.join(' ')
                            });
                        }
                    });
                }
            }

            // --- Progress Calculation & Filtering Playable Questions ---
            let completedCount = 0;
            const playable = allQuestions.filter(q => {
                const isMulti = q.word.includes(' ');
                const docId = q.word.toLowerCase();
                
                if (isMulti) {
                    const doc = rawCompletedMultiWord.get(docId);
                    if (doc?.completedIn?.[gameModeId]) {
                        completedCount++;
                        return false;
                    }
                } else {
                    const doc = rawCompletedWords.get(docId);
                    if (doc?.gameModes?.[gameModeId]) {
                        completedCount++;
                        return false;
                    }
                }
                return true;
            });

            newPlayableQuestions.set(practiceId, playable);
            newProgressData.set(practiceId, { completed: completedCount, total: allQuestions.length });
        });
    });

    return {
      loading: false,
      error: null,
      user,
      userStats: {
        coins: rawUserDoc.coins || 0,
        masteryCount: rawUserDoc.masteryCards || 0,
      },
      progressData: newProgressData,
      playableQuestions: newPlayableQuestions,
      claimedRewards: rawUserDoc.claimedQuizRewards || {},
      allUserVocabulary: userVocabList,
    };
  }, [loading, user, rawUserDoc, rawUserVocab, rawCompletedWords, rawCompletedMultiWord]);

  return optimizedData;
};
