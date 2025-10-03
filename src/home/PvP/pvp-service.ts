// --- START OF FILE: src/pvp-service.ts ---

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
  powerLevel: number;
}

// Interface cho kết quả trận đấu
export interface BattleResult {
  result: 'win' | 'loss';
  goldStolen: number;
}

/**
 * Tìm kiếm các đối thủ thực từ Firestore.
 * @param currentUserId - ID của người chơi hiện tại để loại trừ.
 * @param currentUserPower - Sức mạnh của người chơi hiện tại để tìm đối thủ tương xứng.
 * @returns {Promise<PvpOpponent[]>} Một danh sách đối thủ thực.
 */
export const findInvasionOpponents = async (currentUserId: string, currentUserPower: number): Promise<PvpOpponent[]> => {
  if (!currentUserId) return [];

  const profilesRef = collection(db, 'pvp_profiles');
  const powerMargin = currentUserPower * 0.3; // Tìm đối thủ mạnh/yếu hơn 30%
  const minPower = Math.max(0, currentUserPower - powerMargin);
  const maxPower = currentUserPower + powerMargin;

  console.log(`Searching for opponents with power between ${minPower} and ${maxPower}`);

  const q = query(
    profilesRef,
    where('powerLevel', '>=', minPower),
    where('powerLevel', '<=', maxPower),
    limit(20) // Lấy 20 người để chọn ngẫu nhiên
  );

  const querySnapshot = await getDocs(q);
  const potentialOpponents: PvpOpponent[] = [];
  querySnapshot.forEach((doc) => {
    // Loại trừ chính mình ra khỏi danh sách
    if (doc.id !== currentUserId) {
        const data = doc.data();
        potentialOpponents.push({
            userId: doc.id,
            name: data.displayName || 'Unnamed Player',
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

      const defenderStats = defenderData.stats_value || { atk: 0, def: 0 };

      const attackerPower = attackerStats.atk * 1.5 + attackerStats.def;
      const defenderPower = defenderStats.atk * 1.5 + defenderStats.def;
      const playerWins = attackerPower > defenderPower * (0.8 + Math.random() * 0.4);

      const battleResult: BattleResult = {
        result: 'loss',
        goldStolen: 0,
      };

      if (playerWins) {
        const potentialGold = (defenderData.coins || 0);
        // Cướp 10-15% số vàng, nhưng không được cướp nhiều hơn số vàng hiện có
        const goldToSteal = Math.min(potentialGold, Math.floor(potentialGold * (0.1 + Math.random() * 0.05)));
        
        if (goldToSteal > 0) {
          transaction.update(attackerRef, { coins: increment(goldToSteal) });
          transaction.update(defenderRef, { coins: increment(-goldToSteal) });
          
          battleResult.result = 'win';
          battleResult.goldStolen = goldToSteal;
        }
      }

      const defenseLogEntry = {
        opponent: attackerData.username || "Một người chơi",
        result: battleResult.result === 'win' ? 'loss' : 'win',
        resources: -battleResult.goldStolen,
        timestamp: serverTimestamp(),
      };
      // Giới hạn nhật ký ở 20 mục gần nhất
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

// --- END OF FILE: src/pvp-service.ts ---
