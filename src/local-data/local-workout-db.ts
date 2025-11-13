// --- START OF FILE: local-workout-db.ts ---

import Dexie, { Table } from 'dexie';

// Interface cho một mục trong kế hoạch tập luyện của người dùng
export interface IWorkoutPlanItem {
  exerciseId: number; // ID của bài tập, dùng làm primary key
  sets: number;       // Số set mục tiêu
  reps: number;       // Số rep mục tiêu mỗi set
  rest: number;       // Thời gian nghỉ (giây)
  weight: number;     // Mức tạ mục tiêu (kg)
}

// Interface cho một mục trong lịch sử tập luyện
export interface IWorkoutHistoryEntry {
  id?: number;         // Primary key, tự động tăng
  exerciseId: number; // ID của bài tập đã thực hiện
  date: string;       // Ngày thực hiện (ví dụ: '2023-10-27')
  weight: number;     // Mức tạ đã sử dụng (kg)
  sets: {            // Mảng các set đã hoàn thành
    reps: number;
  }[];
}

class LocalWorkoutDatabase extends Dexie {
  // Định nghĩa các bảng (collections)
  workoutPlan!: Table<IWorkoutPlanItem, number>;      // Key là number (exerciseId)
  workoutHistory!: Table<IWorkoutHistoryEntry, number>; // Key là number (id)

  constructor() {
    super('WorkoutDB'); // Tên của database
    this.version(1).stores({
      // Schema cho phiên bản 1
      workoutPlan: 'exerciseId', // 'exerciseId' là primary key
      workoutHistory: '++id, exerciseId, date' // 'id' là primary key tự tăng, 'exerciseId' và 'date' là các index để truy vấn nhanh
    });
  }

  // === Các hàm cho 'workoutPlan' ===

  /**
   * Lấy toàn bộ kế hoạch tập luyện của người dùng.
   * @returns {Promise<IWorkoutPlanItem[]>} Mảng các bài tập trong kế hoạch.
   */
  async getWorkoutPlan(): Promise<IWorkoutPlanItem[]> {
    return this.workoutPlan.toArray();
  }

  /**
   * Lưu (ghi đè) toàn bộ kế hoạch tập luyện của người dùng.
   * Hàm này sẽ xóa kế hoạch cũ và lưu kế hoạch mới.
   * @param {IWorkoutPlanItem[]} planItems - Mảng các bài tập mới cho kế hoạch.
   */
  async saveWorkoutPlan(planItems: IWorkoutPlanItem[]): Promise<void> {
    try {
      // Dùng transaction để đảm bảo cả hai hành động thành công hoặc không gì cả
      await this.transaction('rw', this.workoutPlan, async () => {
        await this.workoutPlan.clear();
        if (planItems.length > 0) {
          await this.workoutPlan.bulkAdd(planItems);
        }
      });
    } catch (error) {
      console.error("Failed to save workout plan to Dexie:", error);
    }
  }

  // === Các hàm cho 'workoutHistory' ===

  /**
   * Lấy toàn bộ lịch sử tập luyện.
   * @returns {Promise<IWorkoutHistoryEntry[]>}
   */
  async getWorkoutHistory(): Promise<IWorkoutHistoryEntry[]> {
    return this.workoutHistory.toArray();
  }

  /**
   * Thêm một buổi tập mới vào lịch sử.
   * @param {IWorkoutHistoryEntry} newEntry - Dữ liệu buổi tập mới.
   * @returns {Promise<number | undefined>} ID của bản ghi mới được tạo.
   */
  async addWorkoutHistoryEntry(newEntry: IWorkoutHistoryEntry): Promise<number | undefined> {
    try {
      // Dexie sẽ tự động gán 'id' nếu nó là '++id'
      const id = await this.workoutHistory.add(newEntry);
      return id;
    } catch (error) {
      console.error("Failed to add workout history entry to Dexie:", error);
      return undefined;
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

  // === Quản lý chung ===

  /**
   * Xóa toàn bộ dữ liệu trong TẤT CẢ các bảng của DB này.
   * Hữu ích khi người dùng đăng xuất.
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.workoutPlan.clear(),
      this.workoutHistory.clear()
    ]);
  }
}

// Xuất một instance duy nhất của database để sử dụng trong toàn bộ ứng dụng
export const localWorkoutDB = new LocalWorkoutDatabase();

// **QUAN TRỌNG**: Tương tự như localDB cho từ vựng, bạn nên gọi `localWorkoutDB.clearAllData()`
// trong logic đăng xuất người dùng để đảm bảo dữ liệu của người dùng này không bị
// lẫn với người dùng khác đăng nhập trên cùng trình duyệt.
