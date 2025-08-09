// --- START OF FILE: src/firebase/userDataService.ts ---

import { db } from './firebase'; // Đảm bảo đường dẫn này đúng tới file config firebase của bạn
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs } from 'firebase/firestore';

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
