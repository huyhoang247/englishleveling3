import React from 'react';

// --- START: CÁC ICON CHO KỸ NĂNG ---
// Lưu ý: Các component Icon này được export để có thể truy cập từ bên ngoài nếu cần, 
// nhưng chúng chủ yếu được sử dụng trực tiếp trong mảng ALL_SKILLS bên dưới.

export const LifeStealIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_2212_Gi%E1%BB%8Dt%20M%C3%A1u%20Ho%E1%BA%A1t%20H%C3%ACnh_remix_01k0m678x3ez18zw0gk2f1e0we.png" alt="Life Steal" className={className} /> );
export const ThornsIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_2221_Icon%20Ph%E1%BA%A3n%20Damage_simple_compose_01k0m6s5jjfka88wjk06ef9v2d.png" alt="Damage Reflection" className={className} /> );
export const DamageBoostIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_2231_Ki%E1%BA%BFm%20L%E1%BB%ADa%20v%C3%A0%20M%C5%A9i%20T%C3%AAn_remix_01k0m79rbbf2v806gsc8aqw0z4.png" alt="Damage Boost" className={className} /> );
export const ArmorPenetrationIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_2241_Icon%20Xuy%C3%AAn%20Gi%C3%A1p%20Anime_simple_compose_01k0m7x70ae8z851pvvjptrs7f.png" alt="Armor Penetration" className={className} /> );
// --- END: CÁC ICON CHO KỸ NĂNG ---


// --- START: CÁC HÀM HELPER VỀ ĐỘ HIẾM VÀ KỸ NĂNG ---
export type Rarity = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR';
export const RARITY_ORDER: Rarity[] = ['E', 'D', 'B', 'A', 'S', 'SR'];

export const getRarityColor = (rarity: Rarity) => { switch(rarity) { case 'E': return 'border-gray-600'; case 'D': return 'border-green-700'; case 'B': return 'border-blue-500'; case 'A': return 'border-purple-500'; case 'S': return 'border-yellow-400'; case 'SR': return 'border-red-500'; default: return 'border-gray-600'; } };
export const getRarityGradient = (rarity: Rarity) => { switch(rarity) { case 'E': return 'from-gray-800/95 to-gray-900/95'; case 'D': return 'from-green-900/70 to-gray-900'; case 'B': return 'from-blue-800/80 to-gray-900'; case 'A': return 'from-purple-800/80 via-black/30 to-gray-900'; case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900'; case 'SR': return 'from-red-800/80 via-orange-900/30 to-black'; default: return 'from-gray-800/95 to-gray-900/95'; } };
export const getRarityTextColor = (rarity: Rarity) => { switch(rarity) { case 'E': return 'text-gray-400'; case 'D': return 'text-green-400'; case 'B': return 'text-blue-400'; case 'A': return 'text-purple-400'; case 'S': return 'text-yellow-300'; case 'SR': return 'text-red-400'; default: return 'text-gray-400'; } };
export const getRarityDisplayName = (rarity: Rarity) => { if (!rarity) return 'Unknown Rank'; return `${rarity.toUpperCase()} Rank`; };

export const getActivationChance = (rarity: Rarity) => {
    switch (rarity) {
        case 'E': return 5; case 'D': return 10; case 'B': return 15; case 'A': return 20; case 'S': return 25; case 'SR': return 30; default: return 0;
    }
};

export const getNextRarity = (currentRarity: Rarity): Rarity | null => {
    const currentIndex = RARITY_ORDER.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex >= RARITY_ORDER.length - 1) {
        return null;
    }
    return RARITY_ORDER[currentIndex + 1];
};

export const getRandomRarity = (): Rarity => {
    const rarities = [ { rarity: 'E', weight: 50 }, { rarity: 'D', weight: 30 }, { rarity: 'B', weight: 10 }, { rarity: 'A', weight: 5 }, { rarity: 'S', weight: 3 }, { rarity: 'SR', weight: 1 }, ] as const;
    const totalWeight = rarities.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const r of rarities) { if (random < r.weight) { return r.rarity; } random -= r.weight; }
    return 'E';
};

export const getUpgradeCost = (baseCost: number, currentLevel: number): number => {
    return Math.floor(baseCost * Math.pow(1.2, currentLevel - 1));
};

// Tính tổng chi phí để nâng từ level 1 lên toLevel
export const getTotalUpgradeCost = (blueprint: SkillBlueprint, toLevel: number): number => {
    if (toLevel <= 1 || !blueprint.upgradeCost) {
        return 0;
    }
    let totalCost = 0;
    for (let i = 1; i < toLevel; i++) {
        totalCost += getUpgradeCost(blueprint.upgradeCost, i);
    }
    return totalCost;
};
// --- END: CÁC HÀM HELPER VỀ ĐỘ HIẾM VÀ KỸ NĂNG ---


// --- START: CẤU TRÚC DỮ LIỆU VÀ HẰNG SỐ ---
export interface SkillBlueprint {
  id: string;
  name: string;
  description: (level: number, rarity: string) => string;
  icon: (props: { className?: string }) => React.ReactElement;
  baseEffectValue?: number;
  effectValuePerLevel?: number;
  upgradeCost?: number; // Chi phí CƠ BẢN (từ level 1 -> 2)
}

export interface OwnedSkill {
  id: string;
  skillId: string;
  level: number;
  rarity: Rarity;
}

export const CRAFTING_COST = 10;
// --- END: CẤU TRÚC DỮ LIỆU VÀ HẰNG SỐ ---


// --- START: DANH SÁCH TẤT CẢ KỸ NĂNG TRONG GAME ---
export const ALL_SKILLS: SkillBlueprint[] = [
  { 
    id: 'life_steal',    
    name: 'Life Steal',      
    description: (level) => `Hút ${5 + (level - 1) * 1}% Máu dựa trên Sát thương gây ra.`,
    icon: LifeStealIcon, 
    baseEffectValue: 5,
    effectValuePerLevel: 1,
    upgradeCost: 200,
  },
  {
    id: 'thorns',
    name: 'Damage Reflection',
    description: (level) => `Phản lại ${5 + (level - 1) * 1}% Sát thương nhận được khi bị tấn công.`,
    icon: ThornsIcon,
    baseEffectValue: 5,
    effectValuePerLevel: 1,
    upgradeCost: 200,
  },
  {
    id: 'damage_boost',
    name: 'Damage Boost',
    description: (level) => `Tăng ${5 + (level - 1) * 1}% Sát thương lên kẻ địch.`,
    icon: DamageBoostIcon,
    baseEffectValue: 5,
    effectValuePerLevel: 1,
    upgradeCost: 200,
  },
  {
    id: 'armor_penetration',
    name: 'Armor Penetration',
    description: (level) => `Bỏ qua ${5 + (level - 1) * 1}% giáp của đối phương khi tấn công.`,
    icon: ArmorPenetrationIcon,
    baseEffectValue: 5,
    effectValuePerLevel: 1,
    upgradeCost: 200,
  },
];
// --- END: DANH SÁCH TẤT CẢ KỸ NĂNG TRONG GAME ---
