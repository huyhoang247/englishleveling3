// --- START OF FILE pvp-service.ts ---

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
  getDoc // Import getDoc for single document reads
} from 'firebase/firestore';

// --- INTERFACES ---
export interface CombatStats { hp: number; maxHp: number; atk: number; def: number; critRate: number; critDmg: number; healPower: number; reflectDmg: number; }
export interface PvpOpponent { userId: string; name: string; avatarUrl: string; coins: number; powerLevel: number; }
export interface BattleResult { result: 'win' | 'loss'; goldStolen: number; }

export interface BattleHistoryEntry {
  id: string;
  type: 'attack' | 'defense';
  opponentName: string;
  opponentId: string;
  result: 'win' | 'loss';
  goldChange: number;
  timestamp: Date;
}

// --- SERVICE FUNCTIONS ---

// Function remains unchanged
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

// Function remains unchanged
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
        });
    });
    return history;
};

/**
 * [NEW] Fetches an opponent's full, calculated combat stats for a battle simulation.
 * @param defenderId The ID of the user being attacked.
 * @returns An object containing the defender's display info and complete combat stats.
 */
export const getOpponentForBattle = async (defenderId: string): Promise<{
    name: string;
    avatarUrl: string;
    stats: CombatStats;
    coins: number;
}> => {
    const defenderRef = doc(db, 'users', defenderId);
    const defenderDoc = await getDoc(defenderRef);

    if (!defenderDoc.exists()) {
        throw new Error("Defender not found.");
    }

    const defenderData = defenderDoc.data();

    // --- Calculate total stats from base stats + equipment ---
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

/**
 * [NEW] Executes a Firestore transaction to record the outcome of a PvP battle.
 * This function updates coin balances and writes to both players' battle histories.
 * @param attackerId The ID of the attacker.
 * @param defenderId The ID of the defender.
 * @param result The outcome of the battle ('win' or 'loss' for the attacker).
 * @param goldStolen The amount of gold transferred.
 */
export const recordInvasionResult = async (
  attackerId: string,
  defenderId: string,
  result: 'win' | 'loss',
  goldStolen: number
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
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

      // Update coin balances if the attacker won and stole gold
      if (result === 'win' && goldStolen > 0) {
        transaction.update(attackerRef, { coins: increment(goldStolen) });
        transaction.update(defenderRef, { coins: increment(-goldStolen) });
      }

      // --- Write to battle history for both players ---
      const battleTimestamp = new Date();
      const attackerName = attackerData.displayName || attackerData.username || "Anonymous";
      const defenderName = defenderData.displayName || defenderData.username || "Anonymous";

      const attackerHistoryRef = doc(collection(db, 'users', attackerId, 'battleHistory'));
      transaction.set(attackerHistoryRef, {
        type: 'attack', opponentName: defenderName, opponentId: defenderId,
        result: result, goldChange: goldStolen, timestamp: battleTimestamp
      });

      const defenderHistoryRef = doc(collection(db, 'users', defenderId, 'battleHistory'));
      transaction.set(defenderHistoryRef, {
        type: 'defense', opponentName: attackerName, opponentId: attackerId,
        result: result === 'win' ? 'loss' : 'win', // Result is inverted for the defender
        goldChange: -goldStolen, timestamp: battleTimestamp
      });
    });
  } catch (error) {
    console.error("[TRANSACTION FAILED] Lỗi chi tiết:", error);
    // Re-throw the error so the calling function knows the transaction failed
    throw new Error("Không thể ghi lại kết quả trận đấu.");
  }
};
