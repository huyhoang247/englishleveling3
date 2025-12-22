// --- START OF FILE src/sync-service.ts ---

import { db } from './firebase'; // Đảm bảo đường dẫn đúng
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { 
  localDB, 
  IOpenedVocab, 
  IVocabAchievement, 
  ICompletedWord, 
  ICompletedMultiWord 
} from './local-vocab-db.ts'; // Import từ file DB của bạn

// Định nghĩa cấu trúc dữ liệu trên Firestore (Gom tất cả vào 1 Object lớn)
interface ICloudSyncData {
  lastSyncedAt: any; // Firestore Timestamp
  openedVocab: Record<number, IOpenedVocab>; // Dùng Map (Object) để tránh duplicate ID
  vocabAchievements: Record<string, IVocabAchievement>; // Key là word
  completedWords: Record<string, ICompletedWord>; // Key là word
  completedMultiWords: Record<string, ICompletedMultiWord>; // Key là phrase
}

/**
 * Hàm chuyển đổi mảng sang Object (Map) để dễ merge
 */
const arrayToMap = <T>(arr: T[], keyField: keyof T): Record<string | number, T> => {
  return arr.reduce((acc, item) => {
    // @ts-ignore
    acc[item[keyField]] = item;
    return acc;
  }, {} as Record<string | number, T>);
};

/**
 * Hàm chuyển đổi Firestore Timestamp về JS Date
 */
const convertTimestampsToDates = (obj: any): any => {
  if (!obj) return obj;
  if (obj instanceof Timestamp) return obj.toDate();
  if (Array.isArray(obj)) return obj.map(convertTimestampsToDates);
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
        // Xử lý đặc biệt cho các trường Date cụ thể trong interface của bạn
        if (['collectedAt', 'lastCompletedAt', 'createdAt'].includes(key) && obj[key]?.seconds) {
            newObj[key] = new Timestamp(obj[key].seconds, obj[key].nanoseconds).toDate();
        } else {
            newObj[key] = convertTimestampsToDates(obj[key]);
        }
    }
    return newObj;
  }
  return obj;
};

/**
 * HÀM CHÍNH: Đồng bộ dữ liệu
 * @param userId UID của người dùng
 */
export const syncUserData = async (userId: string) => {
  if (!userId) return;

  console.log("🔄 Starting Sync Process...");

  try {
    const userSyncDocRef = doc(db, 'users', userId, 'sync_data', 'main_progress');

    // 1. Lấy dữ liệu Local
    const [localOpened, localAchieve, localWords, localMulti] = await Promise.all([
      localDB.getAllOpenedVocab(),
      localDB.getVocabAchievements(),
      localDB.getCompletedWords(),
      localDB.getCompletedMultiWords()
    ]);

    // 2. Lấy dữ liệu Cloud
    const cloudSnapshot = await getDoc(userSyncDocRef);
    let cloudData: ICloudSyncData = {
      lastSyncedAt: null,
      openedVocab: {},
      vocabAchievements: {},
      completedWords: {},
      completedMultiWords: {}
    };

    if (cloudSnapshot.exists()) {
      const rawData = cloudSnapshot.data();
      // Chuyển đổi dữ liệu thô từ Firestore thành cấu trúc chuẩn (xử lý Date)
      cloudData = {
        lastSyncedAt: rawData.lastSyncedAt,
        openedVocab: convertTimestampsToDates(rawData.openedVocab) || {},
        vocabAchievements: rawData.vocabAchievements || {},
        completedWords: convertTimestampsToDates(rawData.completedWords) || {},
        completedMultiWords: convertTimestampsToDates(rawData.completedMultiWords) || {}
      };
    }

    // 3. MERGE LOGIC (Hợp nhất dữ liệu)
    
    // a. Merge Opened Vocab (Ưu tiên giữ lại tất cả từ đã mở)
    const mergedOpened = { ...cloudData.openedVocab, ...arrayToMap(localOpened, 'id') };

    // b. Merge Achievements (Lấy level/exp cao nhất)
    const localAchieveMap = arrayToMap(localAchieve, 'word');
    const mergedAchieve: Record<string, IVocabAchievement> = { ...cloudData.vocabAchievements };
    
    Object.values(localAchieveMap).forEach(localItem => {
      const cloudItem = mergedAchieve[localItem.word];
      if (!cloudItem || localItem.exp > cloudItem.exp) {
        mergedAchieve[localItem.word] = localItem;
      }
    });

    // c. Merge Completed Words (Logic phức tạp hơn: gộp gameModes)
    const localWordsMap = arrayToMap(localWords, 'word');
    const mergedWords: Record<string, ICompletedWord> = { ...cloudData.completedWords };

    Object.values(localWordsMap).forEach(localItem => {
        const cloudItem = mergedWords[localItem.word];
        if (!cloudItem) {
            mergedWords[localItem.word] = localItem;
        } else {
            // Nếu cả 2 đều có, merge gameModes và lấy ngày mới nhất
            mergedWords[localItem.word] = {
                word: localItem.word,
                lastCompletedAt: localItem.lastCompletedAt > cloudItem.lastCompletedAt ? localItem.lastCompletedAt : cloudItem.lastCompletedAt,
                gameModes: { ...cloudItem.gameModes, ...localItem.gameModes } // Gộp các mode đã chơi
            };
        }
    });

    // d. Merge Multi Words
    const localMultiMap = arrayToMap(localMulti, 'phrase');
    const mergedMulti: Record<string, ICompletedMultiWord> = { ...cloudData.completedMultiWords };
    
    Object.values(localMultiMap).forEach(localItem => {
        const cloudItem = mergedMulti[localItem.phrase];
        if (!cloudItem) {
            mergedMulti[localItem.phrase] = localItem;
        } else {
             mergedMulti[localItem.phrase] = {
                phrase: localItem.phrase,
                lastCompletedAt: localItem.lastCompletedAt > cloudItem.lastCompletedAt ? localItem.lastCompletedAt : cloudItem.lastCompletedAt,
                completedIn: { ...cloudItem.completedIn, ...localItem.completedIn }
            };
        }
    });

    // 4. Update CLOUD (Chỉ tốn 1 Write)
    const dataToSaveToCloud = {
        lastSyncedAt: new Date(),
        openedVocab: mergedOpened,
        vocabAchievements: mergedAchieve,
        completedWords: mergedWords,
        completedMultiWords: mergedMulti
    };
    
    await setDoc(userSyncDocRef, dataToSaveToCloud);
    console.log("✅ Cloud Sync Complete.");

    // 5. Update LOCAL (Để thiết bị đồng bộ với dữ liệu mới nhất từ cloud)
    // Chuyển lại từ Map sang Array cho Dexie
    await Promise.all([
        localDB.addBulkWords(Object.values(mergedOpened)),
        localDB.saveVocabAchievements(Object.values(mergedAchieve)),
        localDB.completedWords.bulkPut(Object.values(mergedWords)),
        localDB.completedMultiWord.bulkPut(Object.values(mergedMulti))
    ]);
    console.log("✅ Local DB Updated with Merged Data.");

  } catch (error) {
    console.error("❌ Sync Failed:", error);
  }
};
