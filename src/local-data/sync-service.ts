// --- START OF FILE src/sync-service.ts ---

import { db } from '../firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { 
  localDB, 
  IOpenedVocab, 
  IVocabAchievement, 
  ICompletedWord, 
  ICompletedMultiWord 
} from './local-vocab-db.ts'; 

// ... (Giữ nguyên các interface và hàm helper arrayToMap, convertTimestampsToDates ở trên) ...

interface ICloudSyncData {
  lastSyncedAt: any;
  openedVocab: Record<number, IOpenedVocab>;
  vocabAchievements: Record<string, IVocabAchievement>;
  completedWords: Record<string, ICompletedWord>;
  completedMultiWords: Record<string, ICompletedMultiWord>;
}

const arrayToMap = <T>(arr: T[], keyField: keyof T): Record<string | number, T> => {
  return arr.reduce((acc, item) => {
    // @ts-ignore
    acc[item[keyField]] = item;
    return acc;
  }, {} as Record<string | number, T>);
};

const convertTimestampsToDates = (obj: any): any => {
  if (!obj) return obj;
  if (obj instanceof Timestamp) return obj.toDate();
  if (Array.isArray(obj)) return obj.map(convertTimestampsToDates);
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
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
      cloudData = {
        lastSyncedAt: rawData.lastSyncedAt,
        openedVocab: convertTimestampsToDates(rawData.openedVocab) || {},
        vocabAchievements: rawData.vocabAchievements || {},
        completedWords: convertTimestampsToDates(rawData.completedWords) || {},
        completedMultiWords: convertTimestampsToDates(rawData.completedMultiWords) || {}
      };
    }

    // 3. MERGE LOGIC (Hợp nhất dữ liệu)
    
    // a. Merge Opened Vocab
    const mergedOpened = { ...cloudData.openedVocab, ...arrayToMap(localOpened, 'id') };

    // =================================================================
    // b. Merge Achievements (SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY)
    // =================================================================
    const localAchieveMap = arrayToMap(localAchieve, 'word');
    const mergedAchieve: Record<string, IVocabAchievement> = { ...cloudData.vocabAchievements };
    
    Object.values(localAchieveMap).forEach(localItem => {
      const cloudItem = mergedAchieve[localItem.word];
      
      if (!cloudItem) {
        // Cloud chưa có -> Lấy Local
        mergedAchieve[localItem.word] = localItem;
      } else {
        // Cloud đã có -> So sánh Level trước, sau đó mới tới EXP
        if (localItem.level > cloudItem.level) {
             // Local level cao hơn (đã claim) -> Lấy Local
             mergedAchieve[localItem.word] = localItem;
        } else if (localItem.level === cloudItem.level && localItem.exp > cloudItem.exp) {
             // Cùng level, nhưng Local cày cuốc nhiều hơn -> Lấy Local
             mergedAchieve[localItem.word] = localItem;
        }
        // Trường hợp còn lại (Cloud level cao hơn hoặc bằng level nhưng exp cao hơn) 
        // -> Giữ nguyên Cloud (không làm gì cả vì mergedAchieve đã có cloudItem)
      }
    });
    // =================================================================

    // c. Merge Completed Words
    const localWordsMap = arrayToMap(localWords, 'word');
    const mergedWords: Record<string, ICompletedWord> = { ...cloudData.completedWords };

    Object.values(localWordsMap).forEach(localItem => {
        const cloudItem = mergedWords[localItem.word];
        if (!cloudItem) {
            mergedWords[localItem.word] = localItem;
        } else {
            mergedWords[localItem.word] = {
                word: localItem.word,
                lastCompletedAt: localItem.lastCompletedAt > cloudItem.lastCompletedAt ? localItem.lastCompletedAt : cloudItem.lastCompletedAt,
                gameModes: { ...cloudItem.gameModes, ...localItem.gameModes }
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

    // 4. Update CLOUD
    const dataToSaveToCloud = {
        lastSyncedAt: new Date(),
        openedVocab: mergedOpened,
        vocabAchievements: mergedAchieve,
        completedWords: mergedWords,
        completedMultiWords: mergedMulti
    };
    
    await setDoc(userSyncDocRef, dataToSaveToCloud);
    console.log("✅ Cloud Sync Complete.");

    // 5. Update LOCAL
    await Promise.all([
        localDB.addBulkWords(Object.values(mergedOpened)),
        // Quan trọng: Hàm saveVocabAchievements bên local-vocab-db phải dùng bulkPut (như đã sửa ở câu trước)
        localDB.saveVocabAchievements(Object.values(mergedAchieve)),
        localDB.completedWords.bulkPut(Object.values(mergedWords)),
        localDB.completedMultiWord.bulkPut(Object.values(mergedMulti))
    ]);
    console.log("✅ Local DB Updated with Merged Data.");

  } catch (error) {
    console.error("❌ Sync Failed:", error);
  }
};
