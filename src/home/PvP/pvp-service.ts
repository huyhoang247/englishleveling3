// --- START OF FILE src/pvp-service.ts ---

// *** TÓM TẮT THAY ĐỔI ***
// - Sửa collection từ 'pvp_profiles' thành 'users' trong hàm findInvasionOpponents để tìm đúng dữ liệu người chơi.
// - Thêm trường 'displayName' vào query để lấy tên người chơi chính xác từ collection 'users'.

import { db } from '../../firebase'; // Đảm bảo đường dẫn chính xác
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  runTransaction, 
  doc, 
  serverTimestamp, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';

// Lấy interface CombatStats từ component pvp-home
// Bạn có thể chuyển interface này ra file riêng (vd: types.ts) để dễ quản lý
export interface CombatStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  critRate: number;
  critDmg: number;
  healPower: number;
  reflectDmg: number;
}

// Interface cho đối thủ tìm thấy
export interface PvpOpponent {
  userId: string;
  name: string;
  avatarUrl: string;
  coins: number;
  powerLevel: number; // Vẫn giữ lại để có thể hiển thị nếu muốn
}

// Interface cho kết quả trận đấu
export interface BattleResult {
  result: 'win' | 'loss';
  goldStolen: number;
}

/**
 * [ĐÃ CẬP NHẬT] Tìm kiếm đối thủ dựa trên số vàng tối thiểu.
 * @param currentUserId - ID của người chơi hiện tại để loại trừ.
 * @param minCoins - Số vàng tối thiểu mà mục tiêu phải có.
 * @returns {Promise<PvpOpponent[]>} Một danh sách đối thủ thực.
 */
export const findInvasionOpponents = async (currentUserId: string, minCoins: number): Promise<PvpOpponent[]> => {
  if (!currentUserId) return [];

  const profilesRef = collection(db, 'users'); // <--- THAY ĐỔI CHÍNH Ở ĐÂY

  console.log(`Searching for opponents with at least ${minCoins} coins in 'users' collection.`);

  // Thay đổi query: Bỏ `powerLevel`, thay bằng `coins`
  const q = query(
    profilesRef,
    where('coins', '>=', minCoins), // Tìm người có số vàng LỚN HƠN HOẶC BẰNG mức nhập
    limit(20) // Vẫn lấy 20 người để chọn ngẫu nhiên
  );

  const querySnapshot = await getDocs(q);
  const potentialOpponents: PvpOpponent[] = [];
  querySnapshot.forEach((doc) => {
    // Loại trừ chính mình ra khỏi danh sách
    if (doc.id !== currentUserId) {
        const data = doc.data();
        potentialOpponents.push({
            userId: doc.id,
            name: data.displayName || data.username || 'Unnamed Player', // Ưu tiên displayName
            avatarUrl: data.avatarUrl || `https://api.dicebear.com/8.x/adventurer/svg?seed=${doc.id}`,
            coins: data.coins || 0,
            powerLevel: data.powerLevel || 0,
        });
    }
  });

  if (potentialOpponents.length <= 3) {
    return potentialOpponents;
  }

  const shuffled = potentialOpponents.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};


/**
 * [CLIENT-SIDE - KHÔNG BẢO MẬT] Xử lý kết quả trận đấu.
 * Cập nhật tiền của cả hai người chơi và ghi nhật ký phòng thủ.
 * @param attackerId - ID người tấn công.
 * @param defenderId - ID người phòng thủ.
 * @param attackerStats - Chỉ số của người tấn công để mô phỏng lại trận đấu.
 * @returns {Promise<BattleResult>} Kết quả cuối cùng của trận đấu.
 */
export const resolveInvasionBattleClientSide = async (
  attackerId: string,
  defenderId: string,
  attackerStats: CombatStats
): Promise<BattleResult> => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const attackerRef = doc(db, 'users', attackerId);
      const defenderRef = doc(db, 'users', defenderId);

      const [attackerDoc, defenderDoc] = await Promise.all([
        transaction.get(attackerRef),
        transaction.get(defenderRef)
      ]);

      if (!attackerDoc.exists() || !defenderDoc.exists()) {
        throw new Error("Không tìm thấy người chơi.");
      }

      const attackerData = attackerDoc.data();
      const defenderData = defenderDoc.data();

      // Giả định defender cũng có stats_value, nếu không thì dùng giá trị mặc định
      const defenderStats = defenderData.stats_value || { atk: 10, def: 10 };

      const attackerPower = attackerStats.atk * 1.5 + attackerStats.def;
      const defenderPower = defenderStats.atk * 1.5 + defenderStats.def;
      const playerWins = attackerPower > defenderPower * (0.8 + Math.random() * 0.4);

      const battleResult: BattleResult = {
        result: 'loss',
        goldStolen: 0,
      };

      if (playerWins) {
        const potentialGold = (defenderData.coins || 0);
        // Cướp từ 10% đến 15% số vàng của đối thủ
        const goldToSteal = Math.floor(potentialGold * (0.1 + Math.random() * 0.05));
        
        if (goldToSteal > 0) {
          transaction.update(attackerRef, { coins: increment(goldToSteal) });
          transaction.update(defenderRef, { coins: increment(-goldToSteal) });
          
          battleResult.result = 'win';
          battleResult.goldStolen = goldToSteal;
        }
      }

      // Ghi nhật ký cho người phòng thủ
      const defenseLogEntry = {
        opponent: attackerData.displayName || attackerData.username || "Một người chơi",
        result: battleResult.result === 'win' ? 'loss' : 'win',
        resources: -battleResult.goldStolen,
        timestamp: serverTimestamp(),
      };
      
      const existingLog = defenderData.invasionLog || [];
      const updatedLog = [defenseLogEntry, ...existingLog].slice(0, 20); // Giữ 20 log gần nhất
      transaction.update(defenderRef, { invasionLog: updatedLog });

      return battleResult;
    });
    
    return result;
  } catch (error) {
    console.error("Lỗi transaction khi xử lý trận đấu:", error);
    alert("Trận đấu không thể hoàn thành do có lỗi xảy ra. Vui lòng thử lại.");
    return { result: 'loss', goldStolen: 0 };
  }
};

// --- END OF FILE src/pvp-service.ts ---
