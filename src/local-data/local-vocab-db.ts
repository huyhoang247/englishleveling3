// --- START OF FILE: local-vocab-db.ts ---

import Dexie, { Table } from 'dexie';

// Interface cho dữ liệu từ vựng đã MỞ KHÓA
export interface IOpenedVocab {
  id: number;       // ID của từ (1-based), primary key
  word: string;
  collectedAt: Date;
  chestType: string;
}

// --- START: DÒNG MỚI ---
// Interface cho dữ liệu THÀNH TÍCH từ vựng
export interface IVocabAchievement {
  id: number;       // ID từ API (có thể không tuần tự)
  word: string;     // Dùng 'word' làm primary key vì nó là duy nhất
  exp: number;
  level: number;
  maxExp: number;
}
// --- END: DÒNG MỚI ---

class LocalVocabDatabase extends Dexie {
  openedVocab!: Table<IOpenedVocab>; 
  // --- START: DÒNG MỚI ---
  vocabAchievements!: Table<IVocabAchievement>;
  // --- END: DÒNG MỚI ---

  constructor() {
    super('VocabularyChestDB');
    // --- START: THAY ĐỔI ---
    // Tăng phiên bản DB để áp dụng schema mới
    this.version(2).stores({
      openedVocab: 'id, word, collectedAt',
      // Định nghĩa bảng mới: 'word' là primary key, 'level' là index để sau này có thể query
      vocabAchievements: 'word, level' 
    });
    // --- END: THAY ĐỔI ---
  }

  // === Các hàm cho 'openedVocab' (Giữ nguyên) ===

  async getAllOpenedIds(): Promise<Set<number>> {
    const ids = await this.openedVocab.toCollection().primaryKeys();
    return new Set(ids as number[]);
  }
  
  async getAllOpenedVocab(): Promise<IOpenedVocab[]> {
    return this.openedVocab.toArray();
  }

  async addBulkWords(newWords: IOpenedVocab[]): Promise<void> {
    if (newWords.length === 0) return;
    try {
      await this.openedVocab.bulkAdd(newWords);
    } catch (error) {
      console.error("Failed to bulk add words to Dexie:", error);
    }
  }

  // --- START: CÁC HÀM MỚI CHO 'vocabAchievements' ---

  /**
   * Lấy tất cả dữ liệu thành tích từ vựng từ cache.
   * @returns {Promise<IVocabAchievement[]>}
   */
  async getVocabAchievements(): Promise<IVocabAchievement[]> {
    return this.vocabAchievements.toArray();
  }

  /**
   * Lưu (ghi đè) toàn bộ dữ liệu thành tích vào cache.
   * Dùng bulkPut để thêm mới hoặc cập nhật hiệu quả.
   * @param {IVocabAchievement[]} achievements - Mảng dữ liệu thành tích mới.
   */
  async saveVocabAchievements(achievements: IVocabAchievement[]): Promise<void> {
    if (achievements.length === 0) {
        // Nếu mảng rỗng, có thể ta muốn xóa sạch cache
        await this.vocabAchievements.clear();
        return;
    }
    try {
      // Xóa dữ liệu cũ và thêm dữ liệu mới để đảm bảo cache luôn là bản mới nhất
      await this.vocabAchievements.clear();
      await this.vocabAchievements.bulkAdd(achievements);
    } catch (error) {
      console.error("Failed to save vocab achievements to Dexie:", error);
    }
  }
  // --- END: CÁC HÀM MỚI CHO 'vocabAchievements' ---


  /**
   * Xóa toàn bộ dữ liệu trong CẢ HAI bảng khi người dùng đăng xuất.
   */
  async clearAllData(): Promise<void> {
    // --- START: THAY ĐỔI ---
    // Xóa cả hai bảng
    await Promise.all([
        this.openedVocab.clear(),
        this.vocabAchievements.clear()
    ]);
    // --- END: THAY ĐỔI ---
  }
}

export const localDB = new LocalVocabDatabase();

// **QUAN TRỌNG**: Bạn nên gọi `localDB.clearAllData()`
// trong logic đăng xuất người dùng để đảm bảo dữ liệu
// của người dùng này không bị lẫn với người dùng khác đăng nhập trên cùng trình duyệt.
