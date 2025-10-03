// --- START OF FILE src/pvp-service.ts (VERSION CUỐI CÙNG ĐÃ SỬA LỖI) ---

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

// Hàm này đã ổn, không cần thay đổi
export const findInvasionOpponents = async (currentUserId: string, minCoins: number): Promise<PvpOpponent[]> => {
  if (!currentUserId) return [];
  const profilesRef = collection(db, 'users');
  const q = query(profilesRef, where('coins', '>=', minCoins), limit(20));
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
  if (potentialOpponents.length <= 3) return potentialOpponents;
  const shuffled = potentialOpponents.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};


/**
 * [PHIÊN BẢN HOÀN CHỈNH] Xử lý kết quả trận đấu.
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

      // === Vô hiệu hóa các log không cần thiết nữa ===
      // console.log("Attacker Data:", JSON.stringify(attackerData));
      // console.log("Defender Data:", JSON.stringify(defenderData));

      const attackerCoins = (typeof attackerData.coins === 'number') ? attackerData.coins : 0;
      const defenderCoins = (typeof defenderData.coins === 'number') ? defenderData.coins : 0;
      
      const baseStats = { atk: 10, def: 10 };
      const defenderStats = { ...baseStats, ...(defenderData.stats_value || {}) };

      const attackerPower = (attackerStats.atk || 10) * 1.5 + (attackerStats.def || 10);
      const defenderPower = (defenderStats.atk || 10) * 1.5 + (defenderStats.def || 10);
      const playerWins = attackerPower > defenderPower * (0.8 + Math.random() * 0.4);

      const battleResult: BattleResult = {
        result: 'loss',
        goldStolen: 0,
      };

      if (playerWins) {
        const actualGoldStolen = Math.min(defenderCoins, goldAmountToSteal);
        
        if (actualGoldStolen > 0) {
          transaction.update(attackerRef, { coins: increment(actualGoldStolen) });
          transaction.update(defenderRef, { coins: increment(-actualGoldStolen) });
          
          battleResult.result = 'win';
          battleResult.goldStolen = actualGoldStolen;
        } else {
            battleResult.result = 'win';
            battleResult.goldStolen = 0;
        }
      }

      const defenseLogEntry = {
        opponent: attackerData.displayName || attackerData.username || "Một người chơi",
        result: battleResult.result === 'win' ? 'loss' : 'win',
        resources: -battleResult.goldStolen,
        // =======================================================
        // <<< SỬA LỖI Ở ĐÂY >>>
        // Thay serverTimestamp() bằng new Date() để tránh lỗi
        timestamp: new Date(),
        // =======================================================
      };
      
      const existingLog = Array.isArray(defenderData.invasionLog) ? defenderData.invasionLog : [];
      const updatedLog = [defenseLogEntry, ...existingLog].slice(0, 20);
      transaction.update(defenderRef, { invasionLog: updatedLog });

      return battleResult;
    });
    
    return result;
  } catch (error) {
    console.error("[TRANSACTION FAILED] Lỗi chi tiết:", error);
    alert("Trận đấu không thể hoàn thành do có lỗi xảy ra. Vui lòng thử lại.");
    return { result: 'loss', goldStolen: 0 };
  }
};
