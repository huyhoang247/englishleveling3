// --- START OF FILE: local-workout-db.ts ---

import Dexie, { Table } from 'dexie';

// Interface cho một mục trong kế hoạch tập luyện của người dùng
// Đây là nơi lưu các thiết lập mặc định cho mỗi bài tập người dùng đã chọn.
export interface IWorkoutPlanItem {
  exerciseId: number; // ID của bài tập, dùng làm primary key
  sets: number;       // Số set mục tiêu
  reps: number;       // Số rep mục tiêu mỗi set
  rest: number;       // Thời gian nghỉ (giây)
  weight: number;     // Mức tạ mục tiêu (kg)
}

// Interface cho một mục trong lịch sử tập luyện
// Đây là bản ghi của một buổi tập đã thực sự diễn ra.
export interface IWorkoutHistoryEntry {
  id?: number;         // Primary key, tự động tăng (optional vì Dexie sẽ tạo khi add)
  exerciseId: number; // ID của bài tập đã thực hiện
  date: string;       // Ngày thực hiện (định dạng 'YYYY-MM-DD')
  weight: number;     // Mức tạ đã sử dụng trong buổi tập (kg)
  sets: {            // Mảng các set đã hoàn thành
    reps: number;
  }[];
}

class LocalWorkoutDatabase extends Dexie {
  // Định nghĩa các bảng (collections) trong database
  // TypeScript sẽ biết kiểu dữ liệu và kiểu primary key của mỗi bảng
  workoutPlan!: Table<IWorkoutPlanItem, number>;      // Key là number (exerciseId)
  workoutHistory!: Table<IWorkoutHistoryEntry, number>; // Key là number (id)

  constructor() {
    super('WorkoutDB'); // Tên của database trong IndexedDB
    this.version(1).stores({
      // Định nghĩa schema cho phiên bản 1 của database
      // 'exerciseId' là primary key cho bảng workoutPlan
      workoutPlan: 'exerciseId', 
      // '++id' nghĩa là 'id' là primary key tự động tăng
      // 'exerciseId' và 'date' là các index để tăng tốc độ truy vấn
      workoutHistory: '++id, exerciseId, date' 
    });
  }

  // === CÁC HÀM CHO 'workoutPlan' ===

  /**
   * Lấy toàn bộ kế hoạch tập luyện của người dùng.
   * @returns {Promise<IWorkoutPlanItem[]>} Mảng các bài tập trong kế hoạch.
   */
  async getWorkoutPlan(): Promise<IWorkoutPlanItem[]> {
    return this.workoutPlan.toArray();
  }

  /**
   * Lưu (ghi đè) toàn bộ kế hoạch tập luyện của người dùng.
   * Hàm này sẽ xóa kế hoạch cũ và lưu kế hoạch mới để đảm bảo tính nhất quán.
   * @param {IWorkoutPlanItem[]} planItems - Mảng các bài tập mới cho kế hoạch.
   */
  async saveWorkoutPlan(planItems: IWorkoutPlanItem[]): Promise<void> {
    try {
      // Dùng transaction để đảm bảo cả hai hành động (xóa và thêm) đều thành công hoặc không gì cả.
      await this.transaction('rw', this.workoutPlan, async () => {
        await this.workoutPlan.clear(); // Xóa tất cả dữ liệu cũ
        if (planItems.length > 0) {
          await this.workoutPlan.bulkAdd(planItems); // Thêm hàng loạt dữ liệu mới
        }
      });
    } catch (error) {
      console.error("Failed to save workout plan to Dexie:", error);
    }
  }

  // === CÁC HÀM CHO 'workoutHistory' ===

  /**
   * Lấy toàn bộ lịch sử tập luyện.
   * @returns {Promise<IWorkoutHistoryEntry[]>} Mảng các buổi tập đã được ghi lại.
   */
  async getWorkoutHistory(): Promise<IWorkoutHistoryEntry[]> {
    return this.workoutHistory.toArray();
  }

  /**
   * Thêm hoặc Cập nhật một buổi tập trong lịch sử.
   * Dexie's put() sẽ tự động:
   * - THÊM MỚI nếu 'id' của entry không tồn tại trong bảng.
   * - CẬP NHẬT nếu 'id' của entry đã có.
   * Đây là hàm hoàn hảo cho tính năng auto-save.
   * @param {IWorkoutHistoryEntry} entry - Dữ liệu buổi tập.
   * @returns {Promise<number>} ID của bản ghi đã được lưu (mới hoặc cũ).
   */
  async saveWorkoutHistoryEntry(entry: IWorkoutHistoryEntry): Promise<number> {
    try {
      const id = await this.workoutHistory.put(entry);
      return id;
    } catch (error) {
      console.error("Failed to save/update workout history entry in Dexie:", error);
      throw error; // Ném lỗi ra ngoài để component có thể xử lý nếu cần
    }
  }

  /**
   * Xóa một buổi tập khỏi lịch sử dựa vào ID của nó.
   * @param {number} entryId - ID của buổi tập cần xóa.
   */
  async deleteWorkoutHistoryEntry(entryId: number): Promise<void> {
    try {
      await this.workoutHistory.delete(entryId);
    } catch (error) {
      console.error(`Failed to delete workout history entry with ID ${entryId}:`, error);
    }
  }

  // === QUẢN LÝ CHUNG ===

  /**
   * Xóa toàn bộ dữ liệu trong TẤT CẢ các bảng của DB này.
   * Rất quan trọng và cần được gọi khi người dùng đăng xuất.
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.workoutPlan.clear(),
      this.workoutHistory.clear()
    ]);
  }
}

// Xuất một instance duy nhất (singleton) của database để sử dụng trong toàn bộ ứng dụng
export const localWorkoutDB = new LocalWorkoutDatabase();

// **QUAN TRỌNG**: Tương tự như localDB cho từ vựng, bạn nên gọi `localWorkoutDB.clearAllData()`
// trong logic đăng xuất người dùng để đảm bảo dữ liệu của người dùng này không bị
// lẫn với người dùng khác đăng nhập trên cùng trình duyệt.
