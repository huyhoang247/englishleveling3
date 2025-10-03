// --- START OF FILE src/pvp-service.ts ---

import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  runTransaction, 
  doc, 
  orderBy,
  increment 
} from 'firebase/firestore';

// ... (Các interface CombatStats, PvpOpponent, BattleResult giữ nguyên)
export interface CombatStats { hp: number; maxHp: number; atk: number; def: number; critRate: number; critDmg: number; healPower: number; reflectDmg: number; }
export interface PvpOpponent { userId: string; name: string; avatarUrl: string; coins: number; powerLevel: number; }
export interface BattleResult { result: 'win' | 'loss'; goldStolen: number; }


// Interface mới cho lịch sử chiến đấu
export interface BattleHistoryEntry {
  id: string;
  type: 'attack' | 'defense';
  opponentName: string;
  opponentId: string;
  result: 'win' | 'loss';
  goldChange: number;
  timestamp: Date;
}

// Hàm tìm đối thủ không đổi
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
 * [MỚI] Lấy lịch sử chiến đấu của người chơi
 * @param userId - ID của người chơi cần lấy lịch sử
 * @returns {Promise<BattleHistoryEntry[]>} Mảng lịch sử
 */
export const getBattleHistory = async (userId: string): Promise<BattleHistoryEntry[]> => {
    const historyRef = collection(db, 'users', userId, 'battleHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);

    const history: BattleHistoryEntry[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
            id: doc.id,
            type: data.type,
            opponentName: data.opponentName,
            opponentId: data.opponentId,
            result: data.result,
            goldChange: data.goldChange,
            timestamp: data.timestamp.toDate(), // Chuyển Firestore Timestamp về Date
        });
    });
    return history;
};

/**
 * [ĐÃ VIẾT LẠI] Xử lý trận đấu và ghi lịch sử cho cả hai người chơi.
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

      const defenderCoins = (typeof defenderData.coins === 'number') ? defenderData.coins : 0;
      const baseStats = { atk: 10, def: 10 };
      const defenderStats = { ...baseStats, ...(defenderData.stats_value || {}) };

      const attackerPower = (attackerStats.atk || 10) * 1.5 + (attackerStats.def || 10);
      const defenderPower = (defenderStats.atk || 10) * 1.5 + (defenderStats.def || 10);
      const playerWins = attackerPower > defenderPower * (0.8 + Math.random() * 0.4);

      const battleResult: BattleResult = { result: 'loss', goldStolen: 0 };

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

      // --- LOGIC GHI LỊCH SỬ MỚI ---
      const battleTimestamp = new Date();
      const attackerName = attackerData.displayName || attackerData.username || "Anonymous";
      const defenderName = defenderData.displayName || defenderData.username || "Anonymous";

      // 1. Tạo bản ghi cho người tấn công
      const attackerHistoryRef = doc(collection(db, 'users', attackerId, 'battleHistory'));
      transaction.set(attackerHistoryRef, {
        type: 'attack',
        opponentName: defenderName,
        opponentId: defenderId,
        result: battleResult.result,
        goldChange: battleResult.goldStolen,
        timestamp: battleTimestamp
      });

      // 2. Tạo bản ghi cho người phòng thủ
      const defenderHistoryRef = doc(collection(db, 'users', defenderId, 'battleHistory'));
      transaction.set(defenderHistoryRef, {
        type: 'defense',
        opponentName: attackerName,
        opponentId: attackerId,
        result: battleResult.result === 'win' ? 'loss' : 'win', // Kết quả đảo ngược
        goldChange: -battleResult.goldStolen, // Vàng bị trừ
        timestamp: battleTimestamp
      });
      
      // Xóa logic cập nhật invasionLog cũ
      // transaction.update(defenderRef, { invasionLog: ... }); // <-- Dòng này được xóa

      return battleResult;
    });
    
    return result;
  } catch (error) {
    console.error("[TRANSACTION FAILED] Lỗi chi tiết:", error);
    alert("Trận đấu không thể hoàn thành do có lỗi xảy ra. Vui lòng thử lại.");
    return { result: 'loss', goldStolen: 0 };
  }
};
