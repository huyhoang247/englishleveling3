// --- START OF FILE boss-battle-service.ts ---

import { fetchOrCreateUserGameData } from './gameDataService.ts';

/**
 * Lấy dữ liệu thô cần thiết cho màn hình Đấu Trùm.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu thô cần thiết cho màn hình Đấu Trùm.
 */
export const fetchBossBattlePrerequisites = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    baseStats: gameData.stats,
    equipment: gameData.equipment, // Gồm owned và equipped
    skills: gameData.skills, // Gồm owned và equipped
    bossBattleHighestFloor: gameData.bossBattleHighestFloor,
    coins: gameData.coins,
  };
};

// --- END OF FILE boss-battle-service.ts ---
