// --- START OF FILE: pvp-service.ts ---

import { CombatStats } from './pvp-home.tsx'; // Path assumes service is in src/

// --- INTERFACES ---

export interface PvpOpponent {
  name: string;
  avatarUrl: string;
  coins: number;
  stats: CombatStats; // Re-using CombatStats for opponent's stats
}

export interface BattleResult {
  result: 'win' | 'loss';
  goldStolen: number;
}

// --- MOCK DATA & UTILITY FUNCTIONS ---

const mockNames = ["Shadow Blade", "Iron Golem", "Mystic Archer", "Sunfire Mage", "Void Walker", "Storm Giant"];

const getMockOpponent = (): PvpOpponent => {
  const name = mockNames[Math.floor(Math.random() * mockNames.length)];
  return {
    name,
    avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${name}`,
    coins: Math.floor(Math.random() * 50000) + 10000,
    stats: {
      hp: Math.floor(Math.random() * 2000) + 8000,
      maxHp: 10000,
      atk: Math.floor(Math.random() * 300) + 700,
      def: Math.floor(Math.random() * 200) + 400,
      critRate: 0.15,
      critDmg: 1.5,
      healPower: Math.floor(Math.random() * 50) + 50,
      reflectDmg: Math.floor(Math.random() * 20),
    },
  };
};


// --- SERVICE FUNCTIONS ---

/**
 * Finds a list of potential opponents for an invasion.
 * Currently returns mock data.
 * @returns {Promise<PvpOpponent[]>} A list of opponents.
 */
export const findInvasionOpponents = async (): Promise<PvpOpponent[]> => {
  // Simulate network delay for a more realistic feel
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real application, this would query the backend with player's rank/power
  return [getMockOpponent(), getMockOpponent(), getMockOpponent()];
};

/**
 * Simulates the outcome of an invasion battle.
 * @param playerStats - The combat stats of the attacking player.
 * @param opponent - The full data of the opponent being attacked.
 * @returns {BattleResult} The outcome of the battle.
 */
export const simulateInvasionBattle = (playerStats: CombatStats, opponent: PvpOpponent): BattleResult => {
  // Simple power calculation for simulation
  const playerPower = playerStats.atk * 1.5 + playerStats.def;
  const targetPower = opponent.stats.atk * 1.5 + opponent.stats.def;

  // Add some randomness to the battle outcome
  const playerWins = playerPower > targetPower * (0.8 + Math.random() * 0.4);
  
  if (playerWins) {
    // Player steals 10-15% of the opponent's gold
    const goldStolen = Math.floor(opponent.coins * (0.1 + Math.random() * 0.05));
    return { result: 'win', goldStolen };
  } else {
    return { result: 'loss', goldStolen: 0 };
  }
};

// --- END OF FILE: pvp-service.ts ---
