// --- START OF FILE: local-vocab-db.ts ---

import Dexie, { Table } from 'dexie';

// Interface cho dữ liệu từ vựng đã MỞ KHÓA
export interface IOpenedVocab {
  id: number;       // ID của từ (1-based), primary key
  word: string;
  collectedAt: Date;
  chestType: string;
}

// Interface cho dữ liệu THÀNH TÍCH từ vựng
export interface IVocabAchievement {
  id: number;       // ID từ API (có thể không tuần tự)
  word: string;     // Dùng 'word' làm primary key vì nó là duy nhất
  exp: number;
  level: number;
  maxExp: number;
}

// Interface cho dữ liệu từ đơn đã hoàn thành
export interface ICompletedWord {
  word: string; // Primary key, lowercase
  lastCompletedAt: Date;
  gameModes: {
    [gameModeId: string]: {
      correctCount: number;
    };
  };
}

// Interface cho dữ liệu cụm từ đã hoàn thành
export interface ICompletedMultiWord {
  phrase: string; // Primary key, lowercase
  lastCompletedAt: Date;
  completedIn: {
    [gameModeId: string]: boolean;
  };
}


class LocalVocabDatabase extends Dexie {
  openedVocab!: Table<IOpenedVocab>; 
  vocabAchievements!: Table<IVocabAchievement>;
  completedWords!: Table<ICompletedWord>;
  completedMultiWord!: Table<ICompletedMultiWord>;

  constructor() {
    super('VocabularyChestDB');
    // **QUAN TRỌNG**: Tăng phiên bản DB lên 3 để áp dụng schema mới
    this.version(3).stores({
      openedVocab: 'id, word, collectedAt',
      vocabAchievements: 'word, level',
      // Định nghĩa 2 bảng mới, với 'word' và 'phrase' làm primary key
      completedWords: 'word',
      completedMultiWord: 'phrase'
    });
  }

  // === Các hàm cho 'openedVocab' ===

  /**
   * Lấy ID của tất cả các từ vựng đã mở khóa.
   * @returns {Promise<Set<number>>}
   */
  async getAllOpenedIds(): Promise<Set<number>> {
    const ids = await this.openedVocab.toCollection().primaryKeys();
    return new Set(ids as number[]);
  }
  
  /**
   * Lấy danh sách đầy đủ của tất cả từ vựng đã mở khóa.
   * @returns {Promise<IOpenedVocab[]>}
   */
  async getAllOpenedVocab(): Promise<IOpenedVocab[]> {
    return this.openedVocab.toArray();
  }

  /**
   * Thêm một loạt từ vựng mới vào DB.
   * @param {IOpenedVocab[]} newWords - Mảng các từ mới.
   */
  async addBulkWords(newWords: IOpenedVocab[]): Promise<void> {
    if (newWords.length === 0) return;
    try {
      await this.openedVocab.bulkAdd(newWords);
    } catch (error) {
      console.error("Failed to bulk add words to Dexie:", error);
    }
  }

  // === Các hàm cho 'vocabAchievements' ===

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

  // === Các hàm mới cho tiến trình game ===

  /**
   * Lấy tất cả các từ đơn đã hoàn thành.
   * @returns {Promise<ICompletedWord[]>}
   */
  async getCompletedWords(): Promise<ICompletedWord[]> {
    return this.completedWords.toArray();
  }

  /**
   * Lấy tất cả các cụm từ đã hoàn thành.
   * @returns {Promise<ICompletedMultiWord[]>}
   */
  async getCompletedMultiWords(): Promise<ICompletedMultiWord[]> {
    return this.completedMultiWord.toArray();
  }

  // === Quản lý chung ===

  /**
   * Xóa toàn bộ dữ liệu trong TẤT CẢ các bảng khi người dùng đăng xuất.
   */
  async clearAllData(): Promise<void> {
    // Xóa tất cả các bảng
    await Promise.all([
        this.openedVocab.clear(),
        this.vocabAchievements.clear(),
        this.completedWords.clear(),
        this.completedMultiWord.clear()
    ]);
  }
}

export const localDB = new LocalVocabDatabase();

// **QUAN TRỌNG**: Bạn nên gọi `localDB.clearAllData()`
// trong logic đăng xuất người dùng để đảm bảo dữ liệu
// của người dùng này không bị lẫn với người dùng khác đăng nhập trên cùng trình duyệt.
