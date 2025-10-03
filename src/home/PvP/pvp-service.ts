// --- START OF FILE pvp-service.ts (FULL CODE WITH CLAIM REWARD LOGIC) ---

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
  increment,
  getDoc
} from 'firebase/firestore';

// --- INTERFACES ---
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

export interface BattleHistoryEntry {
  id: string;
  type: 'attack' | 'defense';
  opponentName: string;
  opponentId: string;
  result: 'win' | 'loss';
  goldChange: number;
  timestamp: Date;
  status?: 'claimed' | 'unclaimed'; // Field to track rewards
}

// --- SERVICE FUNCTIONS ---

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
            timestamp: data.timestamp.toDate(),
            status: data.status, // Fetch the status field
        });
    });
    return history;
};

export const getOpponentForBattle = async (defenderId: string): Promise<{
    name: string;
    avatarUrl: string;
    stats: CombatStats;
    coins: number;
}> => {
    const defenderRef = doc(db, 'users', defenderId);
    const defenderDoc = await getDoc(defenderRef);
    if (!defenderDoc.exists()) { throw new Error("Defender not found."); }
    const defenderData = defenderDoc.data();
    const defenderBaseStats = defenderData.stats_value || { hp: 100, atk: 10, def: 10 };
    const defenderOwnedItems: any[] = defenderData.equipment?.owned || [];
    const defenderEquippedIds = defenderData.equipment?.equipped || {};
    const defenderEquipmentStats = { hp: 0, atk: 0, def: 0 };
    Object.values(defenderEquippedIds).forEach(itemId => {
        if (itemId) {
            const item = defenderOwnedItems.find(i => i.id === itemId);
            if (item && item.stats) {
                defenderEquipmentStats.hp += item.stats.hp || 0;
                defenderEquipmentStats.atk += item.stats.atk || 0;
                defenderEquipmentStats.def += item.stats.def || 0;
            }
        }
    });
    const totalDefenderStats: CombatStats = {
        maxHp: (defenderBaseStats.hp || 100) + defenderEquipmentStats.hp,
        hp: (defenderBaseStats.hp || 100) + defenderEquipmentStats.hp,
        atk: (defenderBaseStats.atk || 10) + defenderEquipmentStats.atk,
        def: (defenderBaseStats.def || 10) + defenderEquipmentStats.def,
        critRate: defenderBaseStats.critRate || 0.05,
        critDmg: defenderBaseStats.critDmg || 1.5,
        healPower: defenderBaseStats.healPower || 0,
        reflectDmg: defenderBaseStats.reflectDmg || 0,
    };
    return {
        name: defenderData.displayName || defenderData.username || "Anonymous",
        avatarUrl: defenderData.avatarUrl || `https://api.dicebear.com/8.x/adventurer/svg?seed=${defenderId}`,
        stats: totalDefenderStats,
        coins: defenderData.coins || 0,
    };
};

export const recordInvasionResult = async (
  attackerId: string,
  defenderId: string,
  result: 'win' | 'loss',
  goldTransferAmount: number
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const attackerRef = doc(db, 'users', attackerId);
      const defenderRef = doc(db, 'users', defenderId);
      const [attackerDoc, defenderDoc] = await Promise.all([transaction.get(attackerRef), transaction.get(defenderRef)]);
      if (!attackerDoc.exists() || !defenderDoc.exists()) throw new Error("Không tìm thấy người chơi.");
      
      const attackerData = attackerDoc.data();
      const defenderData = defenderDoc.data();
      const battleTimestamp = new Date();
      const attackerName = attackerData.displayName || "Anonymous";
      const defenderName = defenderData.displayName || "Anonymous";

      if (result === 'win') {
        // Attacker wins: Transfer gold as usual
        transaction.update(attackerRef, { coins: increment(goldTransferAmount) });
        transaction.update(defenderRef, { coins: increment(-goldTransferAmount) });
        
        const attackerHistoryRef = doc(collection(db, 'users', attackerId, 'battleHistory'));
        transaction.set(attackerHistoryRef, { type: 'attack', opponentName: defenderName, opponentId: defenderId, result: 'win', goldChange: goldTransferAmount, timestamp: battleTimestamp });
        const defenderHistoryRef = doc(collection(db, 'users', defenderId, 'battleHistory'));
        transaction.set(defenderHistoryRef, { type: 'defense', opponentName: attackerName, opponentId: attackerId, result: 'loss', goldChange: -goldTransferAmount, timestamp: battleTimestamp });

      } else { 
        // Attacker loses: Attacker loses gold, but defender must claim it.
        transaction.update(attackerRef, { coins: increment(-goldTransferAmount) });
        // NOTE: DEFENDER'S COINS ARE NOT CHANGED HERE

        const attackerHistoryRef = doc(collection(db, 'users', attackerId, 'battleHistory'));
        transaction.set(attackerHistoryRef, { type: 'attack', opponentName: defenderName, opponentId: defenderId, result: 'loss', goldChange: -goldTransferAmount, timestamp: battleTimestamp });
        
        const defenderHistoryRef = doc(collection(db, 'users', defenderId, 'battleHistory'));
        transaction.set(defenderHistoryRef, {
            type: 'defense', opponentName: attackerName, opponentId: attackerId, result: 'win',
            goldChange: goldTransferAmount, // The potential reward
            timestamp: battleTimestamp,
            status: 'unclaimed' // Mark as needing to be claimed
        });
      }
    });
  } catch (error) {
    console.error("[TRANSACTION FAILED] Lỗi chi tiết:", error);
    throw new Error("Không thể ghi lại kết quả trận đấu.");
  }
};

export const claimDefenseReward = async (userId: string, historyId: string): Promise<number> => {
  const userRef = doc(db, 'users', userId);
  const historyRef = doc(db, 'users', userId, 'battleHistory', historyId);

  try {
    const claimedAmount = await runTransaction(db, async (transaction) => {
      const historyDoc = await transaction.get(historyRef);
      if (!historyDoc.exists()) throw new Error("Lịch sử trận đấu không tồn tại.");

      const data = historyDoc.data();
      if (data.status !== 'unclaimed' || data.type !== 'defense' || data.result !== 'win' || !data.goldChange || data.goldChange <= 0) {
        throw new Error("Phần thưởng không hợp lệ hoặc đã được nhận.");
      }

      const rewardAmount = data.goldChange;

      // Update user's coins and mark the history entry as claimed
      transaction.update(userRef, { coins: increment(rewardAmount) });
      transaction.update(historyRef, { status: 'claimed' });

      return rewardAmount;
    });
    return claimedAmount;
  } catch (error) {
     console.error("[CLAIM FAILED] Lỗi chi tiết:", error);
     throw new Error("Không thể nhận thưởng. Vui lòng thử lại.");
  }
};
