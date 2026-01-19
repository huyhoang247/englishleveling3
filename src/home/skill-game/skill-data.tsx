// --- START OF FILE src/home/skill-game/skill-data.tsx ---

import React from 'react';
import { skillAssets } from '../../game-assets.ts'; // Import tài nguyên tập trung

// --- START: CÁC ICON CHO KỸ NĂNG ---
// Các component Icon này sử dụng URL từ skillAssets hoặc URL trực tiếp
export const LifeStealIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={skillAssets.lifeSteal} alt="Life Steal" className={className} /> 
);
export const ThornsIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={skillAssets.thorns} alt="Damage Reflection" className={className} /> 
);
export const DamageBoostIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={skillAssets.damageBoost} alt="Damage Boost" className={className} /> 
);
export const ArmorPenetrationIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={skillAssets.armorPenetration} alt="Armor Penetration" className={className} /> 
);

// Icon cho kỹ năng Healing
const HEALING_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/plus-hp.webp";
export const HealingIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={HEALING_ICON_URL} alt="Healing" className={className} /> 
);
// --- END: CÁC ICON CHO KỸ NĂNG ---


// --- START: CÁC HÀM HELPER VỀ ĐỘ HIẾM VÀ KỸ NĂNG ---
export type Rarity = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR';
export const RARITY_ORDER: Rarity[] = ['E', 'D', 'B', 'A', 'S', 'SR'];

// Helper lấy màu viền dựa trên độ hiếm
export const getRarityColor = (rarity: Rarity) => { 
    switch(rarity) { 
        case 'E': return 'border-gray-600'; 
        case 'D': return 'border-green-700'; 
        case 'B': return 'border-blue-500'; 
        case 'A': return 'border-purple-500'; 
        case 'S': return 'border-yellow-400'; 
        case 'SR': return 'border-red-500'; 
        default: return 'border-gray-600'; 
    } 
};

// Helper lấy gradient nền dựa trên độ hiếm
export const getRarityGradient = (rarity: Rarity) => { 
    switch(rarity) { 
        case 'E': return 'from-gray-800/95 to-gray-900/95'; 
        case 'D': return 'from-green-900/70 to-gray-900'; 
        case 'B': return 'from-blue-800/80 to-gray-900'; 
        case 'A': return 'from-purple-800/80 via-black/30 to-gray-900'; 
        case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900'; 
        case 'SR': return 'from-red-800/80 via-orange-900/30 to-black'; 
        default: return 'from-gray-800/95 to-gray-900/95'; 
    } 
};

// Helper lấy màu chữ dựa trên độ hiếm
export const getRarityTextColor = (rarity: Rarity) => { 
    switch(rarity) { 
        case 'E': return 'text-gray-400'; 
        case 'D': return 'text-green-400'; 
        case 'B': return 'text-blue-400'; 
        case 'A': return 'text-purple-400'; 
        case 'S': return 'text-yellow-300'; 
        case 'SR': return 'text-red-400'; 
        default: return 'text-gray-400'; 
    } 
};

// Helper lấy tên hiển thị của độ hiếm
export const getRarityDisplayName = (rarity: Rarity) => { 
    if (!rarity) return 'Unknown Rank'; 
    return `${rarity.toUpperCase()} Rank`; 
};

// --- START: LOGIC TỈ LỆ KÍCH HOẠT MỚI ---

/**
 * Random tỉ lệ kích hoạt gốc (Base Activation Chance) dựa trên Rank.
 * Rank E: 1% - 20%
 * Rank D: 10% - 30%
 * Rank B: 20% - 40%
 * Rank A: 30% - 50%
 * Rank S: 40% - 60%
 * Rank SR (Tương đương SS/SSR): 60% - 80%
 */
export const getRandomBaseActivationChance = (rarity: Rarity): number => {
    let min = 1, max = 20;
    switch (rarity) {
        case 'E': min = 1; max = 20; break;
        case 'D': min = 10; max = 30; break;
        case 'B': min = 20; max = 40; break;
        case 'A': min = 30; max = 50; break;
        case 'S': min = 40; max = 60; break;
        case 'SR': min = 60; max = 80; break; // SR đại diện cho tier cao nhất hiện tại
        default: min = 1; max = 10;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Tính tổng tỉ lệ kích hoạt thực tế.
 * Công thức: Base Chance + (5% mỗi 20 Level)
 * Ví dụ: Level 20 -> +5%, Level 40 -> +10%
 */
export const calculateTotalActivationChance = (baseChance: number, level: number): number => {
    const bonus = Math.floor(level / 20) * 5;
    return baseChance + bonus;
};

/**
 * Fallback cho các skill cũ chưa có baseActivationChance trong database.
 * Trả về giá trị trung bình cứng.
 */
export const getActivationChanceFallback = (rarity: Rarity) => {
    switch (rarity) {
        case 'E': return 5; 
        case 'D': return 10; 
        case 'B': return 15; 
        case 'A': return 20; 
        case 'S': return 25; 
        case 'SR': return 30; 
        default: return 0;
    }
};
// --- END: LOGIC TỈ LỆ KÍCH HOẠT MỚI ---


// Lấy rank tiếp theo (cho tính năng Merge)
export const getNextRarity = (currentRarity: Rarity): Rarity | null => {
    const currentIndex = RARITY_ORDER.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex >= RARITY_ORDER.length - 1) {
        return null;
    }
    return RARITY_ORDER[currentIndex + 1];
};

// Random độ hiếm khi chế tạo (Weighted Random)
export const getRandomRarity = (): Rarity => {
    const rarities = [ 
        { rarity: 'E', weight: 50 }, 
        { rarity: 'D', weight: 30 }, 
        { rarity: 'B', weight: 10 }, 
        { rarity: 'A', weight: 5 }, 
        { rarity: 'S', weight: 3 }, 
        { rarity: 'SR', weight: 1 }, 
    ] as const;
    const totalWeight = rarities.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const r of rarities) { 
        if (random < r.weight) { return r.rarity; } 
        random -= r.weight; 
    }
    return 'E';
};

// Tính chi phí nâng cấp level tiếp theo
export const getUpgradeCost = (baseCost: number, currentLevel: number): number => {
    return Math.floor(baseCost * Math.pow(1.2, currentLevel - 1));
};

// Tính tổng chi phí để nâng từ level 1 lên toLevel (dùng cho tính năng hoàn trả/tái chế)
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
  baseActivationChance?: number; // Trường mới: Lưu tỉ lệ kích hoạt gốc random được
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
  {
    id: 'healing',
    name: 'Healing',
    description: (level) => `Hồi phục ${0.5 + (level - 1) * 0.5}% Máu tối đa của bản thân.`,
    icon: HealingIcon,
    baseEffectValue: 0.5,
    effectValuePerLevel: 0.5,
    upgradeCost: 200,
  },
];
// --- END: DANH SÁCH TẤT CẢ KỸ NĂNG TRONG GAME ---

// --- END OF FILE skill-data.tsx ---
