// --- START OF FILE: local-vocab-db.ts ---

import Dexie, { Table } from 'dexie';

// Interface cho dữ liệu từ vựng đã MỞ KHÓA
export interface IOpenedVocab {
  id: number;       // ID của từ (1-based), primary key
  word: string;
  collectedAt: Date;
  chestType: string;
}

// Interface cho dữ liệu THÀNH TÍCH từ vựng (Level/EXP)
// Đây là interface quan trọng để fix lỗi reset level
export interface IVocabAchievement {
  id: number;       // ID từ API
  word: string;     // Dùng 'word' làm primary key vì nó là duy nhất
  exp: number;
  level: number;
  maxExp: number;
}

// Interface cho dữ liệu từ đơn đã hoàn thành (tiến trình game)
export interface ICompletedWord {
  word: string; // Primary key, lowercase
  lastCompletedAt: Date;
  gameModes: {
    [gameModeId: string]: {
      correctCount: number;
    };
  };
}

// Interface cho dữ liệu cụm từ đã hoàn thành (tiến trình game nhiều từ)
export interface ICompletedMultiWord {
  phrase: string; // Primary key, lowercase
  lastCompletedAt: Date;
  completedIn: {
    [gameModeId: string]: boolean;
  };
}

// Interface export ra ngoài để các file khác dùng chung nếu cần
export type VocabularyItem = IVocabAchievement;

class LocalVocabDatabase extends Dexie {
  openedVocab!: Table<IOpenedVocab>; 
  vocabAchievements!: Table<IVocabAchievement>;
  completedWords!: Table<ICompletedWord>;
  completedMultiWord!: Table<ICompletedMultiWord>;

  constructor() {
    super('VocabularyChestDB');
    
    // **QUAN TRỌNG**: Giữ version(3) để khớp với schema hiện tại của bạn
    this.version(3).stores({
      openedVocab: 'id, word, collectedAt',
      vocabAchievements: 'word, level', // word là khoá chính
      completedWords: 'word',
      completedMultiWord: 'phrase'
    });
  }

  // ==========================================================
  // === Các hàm cho 'openedVocab' (Từ vựng đã mở rương) ===
  // ==========================================================

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

  // ==========================================================
  // === Các hàm cho 'vocabAchievements' (Level/EXP) ===
  // ==========================================================

  /**
   * Lấy tất cả dữ liệu thành tích từ vựng từ cache.
   * @returns {Promise<IVocabAchievement[]>}
   */
  async getVocabAchievements(): Promise<IVocabAchievement[]> {
    return this.vocabAchievements.toArray();
  }

  /**
   * [FIX QUAN TRỌNG] Lưu (ghi đè) toàn bộ dữ liệu thành tích vào cache.
   * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
   * KHÔNG sử dụng try/catch ở đây để lỗi được ném ra ngoài cho caller xử lý.
   * 
   * @param {IVocabAchievement[]} achievements - Mảng dữ liệu thành tích mới.
   */
  async saveVocabAchievements(achievements: IVocabAchievement[]): Promise<void> {
    // Sử dụng transaction: Hoặc là xong cả (xóa cũ + thêm mới), hoặc là không làm gì cả.
    await this.transaction('rw', this.vocabAchievements, async () => {
      // 1. Xóa dữ liệu cũ
      await this.vocabAchievements.clear();
      
      // 2. Thêm dữ liệu mới (nếu có)
      if (achievements.length > 0) {
        await this.vocabAchievements.bulkAdd(achievements);
      }
    });
    // Nếu transaction thất bại, Dexie sẽ tự động throw error.
    // Lỗi này sẽ chặn quá trình cộng tiền bên 'course-data-service.ts'.
  }

  // ==========================================================
  // === Các hàm cho tiến trình game (Completed Words) ===
  // ==========================================================

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

  // ==========================================================
  // === Quản lý chung (Clear Data) ===
  // ==========================================================

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

// Export instance singleton để dùng trong toàn bộ app
export const localDB = new LocalVocabDatabase();
