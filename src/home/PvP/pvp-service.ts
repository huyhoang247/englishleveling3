// --- START OF FILE src/pvp-service.ts ---

// *** TÓM TẮT THAY ĐỔI ***
// 1. Cập nhật hàm `resolveInvasionBattleClientSide` để nhận thêm tham số `goldAmountToSteal`.
// 2. Thay thế logic tính toán vàng cướp được bằng tham số này.
// 3. Thêm bước kiểm tra để đảm bảo không cướp nhiều hơn số vàng đối thủ có.

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
  increment 
} from 'firebase/firestore';

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

export interface PvpOpponent {
  userId: string;
  name: string;
  avatarUrl: string;
  coins: number;
  powerLevel: number;
}

export interface BattleResult {
  result: 'win' | 'loss';
  goldStolen: number;
}

/**
 * Tìm kiếm đối thủ có tổng số vàng lớn hơn hoặc bằng số vàng mục tiêu.
 * @param currentUserId - ID của người chơi hiện tại để loại trừ.
 * @param minCoins - Số vàng tối thiểu mà mục tiêu phải có (chính là số vàng muốn cướp).
 * @returns {Promise<PvpOpponent[]>} Một danh sách đối thủ.
 */
export const findInvasionOpponents = async (currentUserId: string, minCoins: number): Promise<PvpOpponent[]> => {
  if (!currentUserId) return [];

  const profilesRef = collection(db, 'users');

  console.log(`Searching for opponents with at least ${minCoins} coins in 'users' collection.`);

  const q = query(
    profilesRef,
    where('coins', '>=', minCoins),
    limit(20)
  );

  const querySnapshot = await getDocs(q);
  const potentialOpponents: PvpOpponent[] = [];
  querySnapshot.forEach((doc) => {
    if (doc.id !== currentUserId) {
        const data = doc.data();
        potentialOpponents.push({
            userId: doc.id,
            name: data.displayName || data.username || 'Unnamed Player',
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
 * Xử lý kết quả trận đấu, cướp một lượng vàng cụ thể.
 * @param attackerId - ID người tấn công.
 * @param defenderId - ID người phòng thủ.
 * @param attackerStats - Chỉ số của người tấn công.
 * @param goldAmountToSteal - Số vàng mục tiêu mà người tấn công muốn cướp.
 * @returns {Promise<BattleResult>} Kết quả cuối cùng của trận đấu.
 */
export const resolveInvasionBattleClientSide = async (
  attackerId: string,
  defenderId: string,
  attackerStats: CombatStats,
  goldAmountToSteal: number 
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

      const defenderStats = defenderData.stats_value || { atk: 10, def: 10 };

      const attackerPower = attackerStats.atk * 1.5 + attackerStats.def;
      const defenderPower = defenderStats.atk * 1.5 + defenderStats.def;
      const playerWins = attackerPower > defenderPower * (0.8 + Math.random() * 0.4);

      const battleResult: BattleResult = {
        result: 'loss',
        goldStolen: 0,
      };

      if (playerWins) {
        const defenderTotalCoins = defenderData.coins || 0;
        
        // Đảm bảo chỉ cướp số vàng mà đối thủ có, không vượt quá mục tiêu
        const actualGoldStolen = Math.min(defenderTotalCoins, goldAmountToSteal);
        
        if (actualGoldStolen > 0) {
          transaction.update(attackerRef, { coins: increment(actualGoldStolen) });
          transaction.update(defenderRef, { coins: increment(-actualGoldStolen) });
          
          battleResult.result = 'win';
          battleResult.goldStolen = actualGoldStolen;
        }
      }

      const defenseLogEntry = {
        opponent: attackerData.displayName || attackerData.username || "Một người chơi",
        result: battleResult.result === 'win' ? 'loss' : 'win',
        resources: -battleResult.goldStolen,
        timestamp: serverTimestamp(),
      };
      
      const existingLog = defenderData.invasionLog || [];
      const updatedLog = [defenseLogEntry, ...existingLog].slice(0, 20);
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
