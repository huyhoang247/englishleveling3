// src/lib/local-vocab-db.ts

import Dexie, { Table } from 'dexie';

// Định nghĩa interface cho dữ liệu từ vựng sẽ lưu
export interface IOpenedVocab {
  id: number; // ID của từ (1-based), sẽ là primary key
  word: string;
  collectedAt: Date;
  chestType: string;
}

class LocalVocabDatabase extends Dexie {
  // 'openedVocab' là tên của "bảng" (object store) trong IndexedDB
  openedVocab!: Table<IOpenedVocab>; 

  constructor() {
    // 'VocabularyChestDB' là tên của database
    super('VocabularyChestDB');
    this.version(1).stores({
      // Định nghĩa schema: 'id' là primary key
      openedVocab: 'id, word, collectedAt' // <<< THAY ĐỔI: Thêm collectedAt vào index để có thể sort hiệu quả hơn sau này
    });
  }

  /**
   * Lấy tất cả các ID của từ vựng đã mở.
   * Rất hiệu quả vì chỉ lấy primary key.
   * @returns {Promise<Set<number>>} Một Set chứa các ID (1-based).
   */
  async getAllOpenedIds(): Promise<Set<number>> {
    const ids = await this.openedVocab.toCollection().primaryKeys();
    // Dexie trả về mảng các key, chúng ta chuyển nó thành Set để tra cứu nhanh hơn
    return new Set(ids as number[]);
  }
  
  // <<< THAY ĐỔI: THÊM HÀM MỚI ĐỂ LẤY TOÀN BỘ DỮ LIỆU >>>
  /**
   * Lấy tất cả các object từ vựng đã mở.
   * @returns {Promise<IOpenedVocab[]>} Một mảng chứa các object IOpenedVocab.
   */
  async getAllOpenedVocab(): Promise<IOpenedVocab[]> {
    return this.openedVocab.toArray();
  }


  /**
   * Thêm nhiều từ vựng mới vào database.
   * @param {IOpenedVocab[]} newWords - Mảng các object từ vựng mới.
   */
  async addBulkWords(newWords: IOpenedVocab[]): Promise<void> {
    if (newWords.length === 0) return;
    try {
      // bulkAdd là phương thức hiệu quả để thêm nhiều bản ghi cùng lúc
      await this.openedVocab.bulkAdd(newWords);
    } catch (error) {
      console.error("Failed to bulk add words to Dexie:", error);
      // Bạn có thể xử lý lỗi ở đây, ví dụ như thử thêm từng cái một
    }
  }

  /**
   * Xóa toàn bộ dữ liệu trong bảng.
   * Rất hữu ích khi người dùng đăng xuất.
   */
  async clearAllData(): Promise<void> {
    await this.openedVocab.clear();
  }
}

// Xuất ra một instance duy nhất (singleton) để dùng trong toàn bộ ứng dụng
export const localDB = new LocalVocabDatabase();

// **QUAN TRỌNG**: Bạn nên gọi `localDB.clearAllData()`
// trong logic đăng xuất người dùng để đảm bảo dữ liệu
// của người dùng này không bị lẫn với người dùng khác đăng nhập trên cùng trình duyệt.
