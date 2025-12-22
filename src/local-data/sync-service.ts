// --- START OF FILE src/sync-service.ts ---

import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase'; 
import { 
  localDB, 
  IOpenedVocab, 
  IVocabAchievement, 
  ICompletedWord, 
  ICompletedMultiWord 
} from './local-vocab-db.ts';

// ==========================================
// 1. ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU TRÊN CLOUD
// ==========================================

// Document 1: Chứa danh sách từ vựng đã mở (để tránh document quá nặng)
interface IVocabDoc {
  data: IOpenedVocab[];
}

// Document 2: Chứa thông tin cấp độ và EXP của từ
interface IAchieveDoc {
  data: IVocabAchievement[];
}

// Document 3: Chứa lịch sử chơi game (từ đơn và cụm từ)
interface IStatsDoc {
  words: Record<string, ICompletedWord>;       // Dùng Map (Object) để dễ merge
  multi: Record<string, ICompletedMultiWord>;  // Dùng Map (Object) để dễ merge
}

// ==========================================
// 2. HÀM HELPER
// ==========================================

/**
 * Helper để lấy timestamp an toàn từ dữ liệu Firestore hoặc Date object
 * Firestore trả về Timestamp object (seconds, nanoseconds), còn Local trả về Date string/object
 */
const getSafeTime = (dateInput: any): number => {
  if (!dateInput) return 0;
  // Nếu là Firestore Timestamp
  if (typeof dateInput.toMillis === 'function') {
    return dateInput.toMillis();
  }
  // Nếu là Date object hoặc String
  return new Date(dateInput).getTime();
};

// ==========================================
// 3. SERVICE ĐỒNG BỘ CHÍNH
// ==========================================

export const SyncService = {
  /**
   * Hàm đồng bộ dữ liệu hai chiều (Local <-> Cloud)
   * Chiến thuật: Merge thông minh (Union IDs, Max EXP, Latest Timestamp)
   */
  syncUserData: async (userId: string) => {
    if (!userId) {
      console.error("SyncService: No user ID provided.");
      return;
    }

    console.log("🔄 Starting Smart Sync (Multi-document Strategy)...");

    try {
      // ---------------------------------------------------------
      // BƯỚC 1: LẤY DỮ LIỆU TỪ LOCAL (DEXIE)
      // ---------------------------------------------------------
      const [localVocab, localAchievs, localCompletedWords, localMulti] = await Promise.all([
        localDB.getAllOpenedVocab(),
        localDB.getVocabAchievements(),
        localDB.getCompletedWords(),
        localDB.getCompletedMultiWords()
      ]);

      // ---------------------------------------------------------
      // BƯỚC 2: THIẾT LẬP REFERENCE TỚI FIRESTORE
      // Chia nhỏ thành 3 documents trong sub-collection 'progress'
      // ---------------------------------------------------------
      const vocabRef = doc(db, 'users', userId, 'progress', 'vocab_list');
      const achievRef = doc(db, 'users', userId, 'progress', 'achievements');
      const statsRef = doc(db, 'users', userId, 'progress', 'game_stats');

      // ---------------------------------------------------------
      // BƯỚC 3: LẤY DỮ LIỆU TỪ CLOUD (3 READS)
      // ---------------------------------------------------------
      const [vocabSnap, achievSnap, statsSnap] = await Promise.all([
        getDoc(vocabRef),
        getDoc(achievRef),
        getDoc(statsRef)
      ]);

      // Parse dữ liệu từ snapshot (xử lý trường hợp chưa có dữ liệu)
      const cloudVocab = vocabSnap.exists() ? (vocabSnap.data() as IVocabDoc).data : [];
      const cloudAchiev = achievSnap.exists() ? (achievSnap.data() as IAchieveDoc).data : [];
      const cloudStatsRaw = statsSnap.exists() ? (statsSnap.data() as IStatsDoc) : { words: {}, multi: {} };
      
      const cloudWordStats = cloudStatsRaw.words || {};
      const cloudMultiStats = cloudStatsRaw.multi || {};

      // ---------------------------------------------------------
      // BƯỚC 4: THỰC HIỆN MERGE (HỢP NHẤT DỮ LIỆU)
      // ---------------------------------------------------------

      // --- A. Merge Opened Vocab (Hợp nhất danh sách ID) ---
      // Logic: Nếu từ vựng có ở Cloud hoặc Local thì giữ lại.
      const mergedVocabMap = new Map<number, IOpenedVocab>();
      
      // Ưu tiên load từ Cloud trước
      cloudVocab.forEach(v => mergedVocabMap.set(v.id, v));
      // Thêm từ Local nếu chưa có
      localVocab.forEach(v => {
        if (!mergedVocabMap.has(v.id)) {
          mergedVocabMap.set(v.id, v);
        }
      });
      const finalVocab = Array.from(mergedVocabMap.values());


      // --- B. Merge Achievements (Lấy EXP cao nhất) ---
      // Logic: Dù chơi ở đâu, giữ lại level/exp cao nhất của từ đó.
      const mergedAchievMap = new Map<string, IVocabAchievement>();

      // Đưa Cloud vào Map
      cloudAchiev.forEach(a => mergedAchievMap.set(a.word, a));

      // So sánh với Local
      localAchievs.forEach(localA => {
        const cloudA = mergedAchievMap.get(localA.word);
        if (cloudA) {
          // Nếu Cloud có, so sánh EXP. Giữ cái nào lớn hơn.
          if (localA.exp > cloudA.exp) {
            mergedAchievMap.set(localA.word, localA);
          }
        } else {
          // Nếu Cloud chưa có, thêm Local vào
          mergedAchievMap.set(localA.word, localA);
        }
      });
      const finalAchievements = Array.from(mergedAchievMap.values());


      // --- C. Merge Game Stats (Lấy lần chơi mới nhất) ---
      // Logic: So sánh `lastCompletedAt`. Cái nào mới hơn thì lấy.
      
      // 1. Stats Words
      const finalWordStats: Record<string, ICompletedWord> = { ...cloudWordStats };
      
      localCompletedWords.forEach(localW => {
        const cloudW = finalWordStats[localW.word];
        if (cloudW) {
          const localTime = getSafeTime(localW.lastCompletedAt);
          const cloudTime = getSafeTime(cloudW.lastCompletedAt);
          
          if (localTime > cloudTime) {
            finalWordStats[localW.word] = localW;
          }
        } else {
          finalWordStats[localW.word] = localW;
        }
      });

      // 2. Stats Multi-words
      const finalMultiStats: Record<string, ICompletedMultiWord> = { ...cloudMultiStats };

      localMulti.forEach(localM => {
        const cloudM = finalMultiStats[localM.phrase];
        if (cloudM) {
          const localTime = getSafeTime(localM.lastCompletedAt);
          const cloudTime = getSafeTime(cloudM.lastCompletedAt);

          if (localTime > cloudTime) {
            finalMultiStats[localM.phrase] = localM;
          }
        } else {
          finalMultiStats[localM.phrase] = localM;
        }
      });

      // ---------------------------------------------------------
      // BƯỚC 5: CẬP NHẬT LÊN CLOUD (BATCH WRITE - 3 WRITES)
      // ---------------------------------------------------------
      const batch = writeBatch(db);

      // Set vocab list
      batch.set(vocabRef, { data: finalVocab });
      
      // Set achievements
      batch.set(achievRef, { data: finalAchievements });
      
      // Set stats (gộp 2 object stats vào 1 doc để tiết kiệm 1 write)
      batch.set(statsRef, { 
        words: finalWordStats, 
        multi: finalMultiStats 
      });

      await batch.commit();
      console.log(`✅ Cloud Sync Success: ${finalVocab.length} words, ${finalAchievements.length} achievements.`);

      // ---------------------------------------------------------
      // BƯỚC 6: CẬP NHẬT NGƯỢC LẠI LOCAL DB
      // Để thiết bị hiện tại có dữ liệu mới nhất từ các thiết bị khác
      // ---------------------------------------------------------
      
      // Update Vocab
      await localDB.addBulkWords(finalVocab);
      
      // Update Achievements
      await localDB.saveVocabAchievements(finalAchievements);
      
      // Update Stats (Words)
      const wordStatsArray = Object.values(finalWordStats);
      if (wordStatsArray.length > 0) {
        await localDB.completedWords.bulkPut(wordStatsArray);
      }

      // Update Stats (Multi)
      const multiStatsArray = Object.values(finalMultiStats);
      if (multiStatsArray.length > 0) {
        await localDB.completedMultiWord.bulkPut(multiStatsArray);
      }

      console.log("✅ Local Sync Success: Dexie updated with merged data.");

    } catch (error) {
      console.error("❌ Critical Error during SyncService:", error);
      // Không throw error để app vẫn chạy bình thường dù sync lỗi
    }
  }
};
