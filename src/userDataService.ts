// --- START OF FILE: src/firebase/userDataService.ts ---

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, writeBatch } from 'firebase/firestore';

/**
 * Lấy dữ liệu người dùng. Nếu người dùng chưa tồn tại trong Firestore, tạo mới với giá trị mặc định.
 * @param userId - ID của người dùng.
 * @returns {Promise<any>} Dữ liệu của người dùng.
 */
export const fetchOrCreateUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Người dùng không tồn tại, tạo mới document
    const newUser = {
      coins: 0,
      masteryCards: 0,
      createdAt: new Date(),
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }
};

/**
 * Cập nhật số coin của người dùng trên Firestore.
 * @param userId - ID của người dùng.
 * @param amount - Số coin cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<void>}
 */
export const updateUserCoins = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount === 0) {
    return; // Không thực hiện nếu không có userId hoặc số lượng thay đổi là 0
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      coins: increment(amount)
    });
  } catch (error) {
    console.error(`Failed to update coins for user ${userId}:`, error);
    throw error; // Ném lỗi ra để component gốc có thể xử lý
  }
};

/**
 * Cập nhật số mastery card của người dùng trên Firestore.
 * @param userId - ID của người dùng.
 * @param amount - Số lượng mastery card cần thay đổi. Dùng số dương để cộng, số âm để trừ.
 * @returns {Promise<void>}
 */
export const updateUserMastery = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount === 0) {
    return; // Không thực hiện nếu không có userId hoặc số lượng thay đổi là 0
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      masteryCards: increment(amount)
    });
  } catch (error) {
    console.error(`Failed to update mastery cards for user ${userId}:`, error);
    throw error; // Ném lỗi ra để component gốc có thể xử lý
  }
};

/**
 * Lấy danh sách từ vựng đã mở của người dùng.
 * @param userId - ID của người dùng.
 * @returns {Promise<string[]>} Mảng các từ vựng đã mở.
 */
export const getOpenedVocab = async (userId: string): Promise<string[]> => {
    const vocabSnapshot = await getDocs(collection(db, 'users', userId, 'openedVocab'));
    return vocabSnapshot.docs.map(doc => doc.data().word).filter(Boolean);
};

/**
 * Lấy danh sách các từ đã hoàn thành trong một game mode cụ thể.
 * @param userId - ID của người dùng.
 * @param gameModeId - ID của chế độ chơi (ví dụ: 'quiz-1').
 * @returns {Promise<Set<string>>} Một Set chứa các từ đã hoàn thành (viết thường).
 */
export const getCompletedWordsForGameMode = async (userId: string, gameModeId: string): Promise<Set<string>> => {
    const completedSnapshot = await getDocs(collection(db, 'users', userId, 'completedWords'));
    const completedSet = new Set<string>();
    completedSnapshot.forEach((doc) => {
        if (doc.data()?.gameModes?.[gameModeId]) {
            completedSet.add(doc.id.toLowerCase());
        }
    });
    return completedSet;
};

// --- CÁC HÀM MỚI ĐƯỢC THÊM VÀO ---

/**
 * Interface cho dữ liệu khởi tạo game.
 */
interface GameInitialData {
  coins: number;
  masteryCards: number;
  openedVocabWords: { id: string, word: string }[];
  completedWords: Set<string>;
}

/**
 * Lấy tất cả dữ liệu cần thiết để bắt đầu một màn chơi.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi (ví dụ: 'fill-word-1').
 * @param isMultiWordGame Cờ xác định đây là game điền 1 từ hay nhiều từ.
 * @returns {Promise<GameInitialData>} Dữ liệu khởi tạo game.
 */
export const fetchGameInitialData = async (userId: string, gameModeId: string, isMultiWordGame: boolean): Promise<GameInitialData> => {
  if (!userId) throw new Error("User ID is required.");

  const userDocRef = doc(db, 'users', userId);
  const openedVocabRef = collection(db, 'users', userId, 'openedVocab');
  const completedCollectionName = isMultiWordGame ? 'completedMultiWord' : 'completedWords';
  const completedWordsRef = collection(db, 'users', userId, completedCollectionName);

  const [userDocSnap, openedVocabSnap, completedWordsSnap] = await Promise.all([
    getDoc(userDocRef),
    getDocs(openedVocabRef),
    getDocs(completedWordsRef)
  ]);

  const userData = userDocSnap.exists() ? userDocSnap.data() : { coins: 0, masteryCards: 0 };

  const openedVocabWords = openedVocabSnap.docs.map(d => ({ id: d.id, word: d.data().word })).filter(item => item.word);
  
  const completedWords = new Set<string>();
  completedWordsSnap.forEach(docSnap => {
    const data = docSnap.data();
    const targetKey = isMultiWordGame ? 'completedIn' : 'gameModes';
    if (data?.[targetKey]?.[gameModeId]) {
      completedWords.add(docSnap.id.toLowerCase());
    }
  });

  return {
    coins: userData.coins || 0,
    masteryCards: userData.masteryCards || 0,
    openedVocabWords,
    completedWords
  };
};

/**
 * Ghi lại kết quả khi người dùng trả lời đúng một từ/câu.
 * @param userId ID người dùng.
 * @param gameModeId ID của chế độ chơi.
 * @param completedWord Từ hoặc cụm từ đã hoàn thành.
 * @param isMultiWordGame Cờ xác định game điền 1 từ hay nhiều từ.
 * @param coinReward Số coin thưởng.
 */
export const recordGameSuccess = async (
  userId: string,
  gameModeId: string,
  completedWord: string,
  isMultiWordGame: boolean,
  coinReward: number
): Promise<void> => {
  if (!userId || !completedWord) return;

  const batch = writeBatch(db);
  const userDocRef = doc(db, 'users', userId);

  if (isMultiWordGame) {
    // Ghi lại việc hoàn thành câu hỏi nhiều từ
    const multiWordId = completedWord.toLowerCase();
    const completedMultiWordRef = doc(db, 'users', userId, 'completedMultiWord', multiWordId);
    batch.set(completedMultiWordRef, {
      completedIn: { [gameModeId]: true },
      lastCompletedAt: new Date()
    }, { merge: true });

    // Ghi lại việc hoàn thành từng từ đơn lẻ trong câu
    const individualWords = completedWord.split(' ');
    individualWords.forEach(word => {
      const individualWordRef = doc(db, 'users', userId, 'completedWords', word.toLowerCase());
      batch.set(individualWordRef, { 
        lastCompletedAt: new Date(), 
        gameModes: { [gameModeId]: { correctCount: increment(1) } } 
      }, { merge: true });
    });

  } else {
    // Ghi lại việc hoàn thành từ đơn
    const wordId = completedWord.toLowerCase();
    const completedWordRef = doc(db, 'users', userId, 'completedWords', wordId);
    batch.set(completedWordRef, { 
      lastCompletedAt: new Date(), 
      gameModes: { [gameModeId]: { correctCount: increment(1) } } 
    }, { merge: true });
  }

  // Cập nhật coin thưởng nếu có
  if (coinReward > 0) {
    batch.update(userDocRef, { coins: increment(coinReward) });
  }

  await batch.commit();
};
