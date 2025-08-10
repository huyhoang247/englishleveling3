// --- START OF FILE: userDataService.ts ---

import { db } from './firebase.js'; // Adjust path to your firebase config
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, writeBatch } from 'firebase/firestore';
import { exampleData } from './example-data.ts'; // Adjust path
import { phraseData } from './phrase-data.ts'; // Adjust path

// --- INTERFACES (could be in a shared types file) ---
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
  question?: string;
  vietnameseHint?: string;
}

// --- HELPER FUNCTIONS ---
const shuffleArray = <T extends any[]>(array: T): T => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray as T;
};

// --- TEMPLATE FUNCTIONS ---

/**
 * Lấy dữ liệu người dùng. Nếu người dùng chưa tồn tại trong Firestore, tạo mới với giá trị mặc định.
 */
export const fetchOrCreateUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    const newUser = { coins: 0, masteryCards: 0, createdAt: new Date() };
    await setDoc(userDocRef, newUser);
    return newUser;
  }
};

/**
 * Cập nhật số coin của người dùng trên Firestore.
 */
export const updateUserCoins = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount === 0) return;
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, { coins: increment(amount) });
  } catch (error) {
    console.error(`Failed to update coins for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Cập nhật số mastery card của người dùng trên Firestore.
 */
export const updateUserMastery = async (userId: string, amount: number): Promise<void> => {
    if (!userId || amount === 0) return;
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { masteryCards: increment(amount) });
    } catch (error) {
        console.error(`Failed to update mastery cards for user ${userId}:`, error);
        throw error;
    }
};

// --- GAME-SPECIFIC SERVICE FUNCTIONS ---

/**
 * Fetches all necessary data for the Fill-in-the-Word game.
 * @param userId - The ID of the current user.
 * @param selectedPractice - The ID of the practice mode.
 * @returns An object with user stats, completed words, and the generated vocabulary list for the game.
 */
export const fetchFillWordGameData = async (userId: string, selectedPractice: number) => {
    const isMultiWordGame = [3, 4, 5, 6, 7].includes(selectedPractice % 100);
    const gameModeId = `fill-word-${selectedPractice}`;

    const [
        userDocSnap,
        openedVocabSnapshot,
        completedWordsSnapshot,
        completedMultiWordSnapshot
    ] = await Promise.all([
        getDoc(doc(db, 'users', userId)),
        getDocs(collection(db, 'users', userId, 'openedVocab')),
        getDocs(collection(db, 'users', userId, 'completedWords')),
        getDocs(collection(db, 'users', userId, 'completedMultiWord'))
    ]);

    const userData = userDocSnap.exists() ? userDocSnap.data() : { coins: 0, masteryCards: 0 };
    const coins = userData.coins || 0;
    const masteryCards = userData.masteryCards || 0;

    const completedWordsSet = new Set<string>();
    if (isMultiWordGame) {
        completedMultiWordSnapshot.forEach(docSnap => {
            if (docSnap.data()?.completedIn?.[gameModeId]) {
                completedWordsSet.add(docSnap.id.toLowerCase());
            }
        });
    } else {
        completedWordsSnapshot.forEach((docSnap) => {
            if (docSnap.data()?.gameModes?.[gameModeId]) {
                completedWordsSet.add(docSnap.id.toLowerCase());
            }
        });
    }

    const userVocabularyWords: string[] = [];
    openedVocabSnapshot.forEach((docSnap) => {
        if (docSnap.data().word) userVocabularyWords.push(docSnap.data().word);
    });

    let gameVocabulary: VocabularyItem[] = [];
    const practiceType = selectedPractice % 100;

    if (practiceType === 1) { // Single word image hint
        openedVocabSnapshot.forEach((vocabDoc) => {
            const data = vocabDoc.data();
            const imageIndex = Number(vocabDoc.id);
            if (data.word && !isNaN(imageIndex)) {
                gameVocabulary.push({ word: data.word, hint: `Nghĩa của từ "${data.word}"`, imageIndex: imageIndex });
            }
        });
    } else if (practiceType >= 2 && practiceType <= 7) { // Sentence-based practices
        exampleData.forEach(sentence => {
            const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
            const createQuestion = (numWords: number) => {
                if (wordsInSentence.length >= numWords) {
                    const wordsToHideShuffled = shuffleArray(wordsInSentence).slice(0, numWords);
                    const correctlyOrderedWords = wordsToHideShuffled.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()));
                    let questionText = sentence.english;
                    const regex = new RegExp(`\\b(${correctlyOrderedWords.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
                    questionText = questionText.replace(regex, '___');
                    
                    if (questionText.split('___').length - 1 !== correctlyOrderedWords.length) return;

                    gameVocabulary.push({
                        word: correctlyOrderedWords.join(' '),
                        question: questionText,
                        vietnameseHint: sentence.vietnamese,
                        hint: `Điền ${numWords} từ còn thiếu. Gợi ý: ${sentence.vietnamese}`
                    });
                }
            };
            
            if (practiceType === 2 && wordsInSentence.length >= 1) {
                const randomWord = wordsInSentence[Math.floor(Math.random() * wordsInSentence.length)];
                gameVocabulary.push({ 
                    word: randomWord, 
                    question: sentence.english.replace(new RegExp(`\\b${randomWord}\\b`, 'i'), '___'), 
                    vietnameseHint: sentence.vietnamese, 
                    hint: `Điền từ còn thiếu. Gợi ý: ${sentence.vietnamese}` 
                });
            } else if (practiceType === 3) createQuestion(2);
            else if (practiceType === 4) createQuestion(3);
            else if (practiceType === 5) createQuestion(4);
            else if (practiceType === 6) createQuestion(5);
            else if (practiceType === 7 && wordsInSentence.length >= 1) {
                const correctlyOrderedWords = wordsInSentence.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()));
                const wordsToHideRegex = new RegExp(`\\b(${correctlyOrderedWords.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
                const questionText = sentence.english.replace(wordsToHideRegex, '___');
                
                gameVocabulary.push({
                    word: correctlyOrderedWords.join(' '),
                    question: questionText,
                    vietnameseHint: sentence.vietnamese,
                    hint: `Điền ${correctlyOrderedWords.length} từ còn thiếu. Gợi ý: ${sentence.vietnamese}`
                });
            }
        });
    }

    return {
        coins,
        masteryCards,
        completedWordsSet,
        gameVocabulary: Array.from(new Map(gameVocabulary.map(item => [item.word, item])).values()) // Ensure unique questions
    };
};

/**
 * Records a successful answer in Firestore using a batch write.
 * @param userId - The ID of the current user.
 * @param currentWord - The vocabulary item that was answered correctly.
 * @param selectedPractice - The ID of the practice mode.
 * @param coinReward - The number of coins to award.
 * @param isMultiWordGame - A boolean indicating if it's a multi-word game.
 */
export const recordGameSuccess = async (
  userId: string,
  currentWord: VocabularyItem,
  selectedPractice: number,
  coinReward: number,
  isMultiWordGame: boolean
) => {
  if (!userId || !currentWord) return;

  const batch = writeBatch(db);
  const userDocRef = doc(db, 'users', userId);
  const gameModeId = `fill-word-${selectedPractice}`;

  if (isMultiWordGame) {
    const individualWords = currentWord.word.split(' ');
    individualWords.forEach(word => {
      const individualWordRef = doc(db, 'users', userId, 'completedWords', word.toLowerCase());
      batch.set(individualWordRef, { lastCompletedAt: new Date(), gameModes: { [gameModeId]: { correctCount: increment(1) } } }, { merge: true });
    });

    const questionId = currentWord.word.toLowerCase();
    const completedMultiWordRef = doc(db, 'users', userId, 'completedMultiWord', questionId);
    batch.set(completedMultiWordRef, { completedIn: { [gameModeId]: true }, lastCompletedAt: new Date() }, { merge: true });
  } else {
    const wordId = currentWord.word.toLowerCase();
    const completedWordRef = doc(db, 'users', userId, 'completedWords', wordId);
    batch.set(completedWordRef, { lastCompletedAt: new Date(), gameModes: { [gameModeId]: { correctCount: increment(1) } } }, { merge: true });
  }

  if (coinReward > 0) {
    batch.update(userDocRef, { 'coins': increment(coinReward) });
  }
  
  await batch.commit();
};
