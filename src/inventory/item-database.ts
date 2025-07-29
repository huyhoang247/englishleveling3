// --- START OF FILE item-database.ts (REFACTORED) ---

import { itemAssets } from '../game-assets.ts';

// --- CÁC ĐỊNH NGHĨA CỐT LÕI ---

// Giữ nguyên: Định nghĩa ItemRank và các cấu trúc cơ bản
export type ItemRank = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';
export const RARITY_ORDER: ItemRank[] = ['E', 'D', 'B', 'A', 'S', 'SR', 'SSR'];

export interface SkillDefinition {
    name: string;
    description: string;
    icon: string;
}

export interface ItemDefinition {
    id: number;
    name: string;
    type: 'weapon' | 'potion' | 'armor' | 'accessory' | 'material' | 'currency' | 'misc' | 'quest' | 'piece';
    rarity: ItemRank;
    description: string;
    icon: string;
    stats?: { [key: string]: any };
    skills?: SkillDefinition[];
    maxLevel?: number;
    // THAY ĐỔI: Thêm baseId để biết vật phẩm này thuộc blueprint nào
    baseId?: number; 
}

// --- HỆ THỐNG BLUEPRINT MỚI ---

// THAY ĐỔI: Định nghĩa cấu trúc cho một "Bản thiết kế" vật phẩm
export interface ItemBlueprint {
    baseId: number; // ID cơ sở, phải là duy nhất cho mỗi blueprint
    name: string;
    type: 'weapon' | 'armor' | 'accessory';
    baseDescription: string;
    icon: string;
    // Chỉ số và level ở Rank E (cấp thấp nhất)
    baseStats: { [key: string]: number };
    baseMaxLevel: number;
}

// THAY ĐỔI: Hệ số nhân chỉ số và các thuộc tính khác dựa trên Rank
const rankModifiers: { [key in ItemRank]: { statMultiplier: number; levelMultiplier: number; desc: string; specialStats?: { [key: string]: any } } } = {
    E:   { statMultiplier: 1.0, levelMultiplier: 1.0, desc: 'một phiên bản cơ bản' },
    D:   { statMultiplier: 1.5, levelMultiplier: 1.2, desc: 'một phiên bản được gia cố' },
    B:   { statMultiplier: 2.5, levelMultiplier: 1.8, desc: 'một tác phẩm đáng tin cậy', specialStats: { agility: 5 } },
    A:   { statMultiplier: 4.0, levelMultiplier: 2.5, desc: 'một kiệt tác của thợ rèn', specialStats: { agility: 10, critChance: 0.05 } },
    S:   { statMultiplier: 6.5, levelMultiplier: 3.5, desc: 'một vũ khí huyền thoại', specialStats: { strength: 15, critChance: 0.10, lifeSteal: 0.03 } },
    SR:  { statMultiplier: 10.0, levelMultiplier: 4.5, desc: 'một báu vật thần thoại', specialStats: { strength: 25, critChance: 0.15, lifeSteal: 0.07 } },
    SSR: { statMultiplier: 15.0, levelMultiplier: 6.0, desc: 'một tạo tác vô song của các vị thần', specialStats: { strength: 40, critChance: 0.20, lifeSteal: 0.12, divinePower: 100 } },
};

// THAY ĐỔI: Database giờ chỉ chứa các blueprint cho vật phẩm có thể chế tạo/rèn
export const itemBlueprints: ItemBlueprint[] = [
    { baseId: 1000, name: 'Nomad Sword', type: 'weapon', baseDescription: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', icon: itemAssets.nomadSword, baseStats: { damage: 8, durability: 30 }, baseMaxLevel: 10 },
    { baseId: 2000, name: 'Tunic', type: 'armor', baseDescription: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', icon: itemAssets.tunic, baseStats: { defense: 8, magicResist: 2 }, baseMaxLevel: 10 },
    { baseId: 3000, name: 'Warrior\'s Sword', type: 'weapon', baseDescription: 'Thanh kiếm được rèn cho những chiến binh dũng cảm.', icon: itemAssets.warriorsSword, baseStats: { damage: 15, durability: 50 }, baseMaxLevel: 15 },
    { baseId: 4000, name: 'Frostbite Spear', type: 'weapon', baseDescription: 'Ngọn giáo phủ băng, gây sát thương kèm hiệu ứng làm chậm.', icon: itemAssets.frostbiteSpear, baseStats: { damage: 12, durability: 40, coldDamage: 3 }, baseMaxLevel: 15 },
    { baseId: 5000, name: 'Giant\'s Hammer', type: 'weapon', baseDescription: 'Cây búa khổng lồ, gây sát thương vật lý cực lớn.', icon: itemAssets.giantsHammer, baseStats: { damage: 20, durability: 60, strength: 5 }, baseMaxLevel: 20 },
    { baseId: 6000, name: 'Forest Staff', type: 'weapon', baseDescription: 'Cây trượng làm từ gỗ rừng cổ thụ, tăng cường sức mạnh phép thuật tự nhiên.', icon: itemAssets.forestStaff, baseStats: { magicDamage: 10, manaRegen: 2 }, baseMaxLevel: 15 },
    //... thêm các blueprint khác tại đây
];

// THAY ĐỔI: Tạo một map để tra cứu blueprint nhanh chóng bằng baseId hoặc name
const blueprintByBaseId = new Map<number, ItemBlueprint>(itemBlueprints.map(bp => [bp.baseId, bp]));
const blueprintByName = new Map<string, ItemBlueprint>(itemBlueprints.map(bp => [bp.name, bp]));


// --- HÀM TẠO VẬT PHẨM ĐỘNG ---

/**
 * THAY ĐỔI: Hàm này tự động tạo ra một ItemDefinition hoàn chỉnh
 * từ một blueprint và một rank chỉ định.
 */
export function generateItemDefinition(blueprint: ItemBlueprint, rank: ItemRank): ItemDefinition {
    const modifier = rankModifiers[rank];
    const rankIndex = RARITY_ORDER.indexOf(rank);

    const newStats: { [key: string]: any } = {};
    for (const key in blueprint.baseStats) {
        newStats[key] = Math.round(blueprint.baseStats[key] * modifier.statMultiplier);
    }
    // Gộp các chỉ số đặc biệt từ rank modifier
    if (modifier.specialStats) {
        Object.assign(newStats, modifier.specialStats);
    }

    return {
        // Tạo ID duy nhất và có thể đảo ngược: baseId + rankIndex
        id: blueprint.baseId + rankIndex,
        baseId: blueprint.baseId,
        name: blueprint.name,
        type: blueprint.type,
        rarity: rank,
        description: `${blueprint.baseDescription} Đây là ${modifier.desc}.`,
        icon: blueprint.icon,
        stats: newStats,
        maxLevel: Math.round(blueprint.baseMaxLevel * modifier.levelMultiplier),
        skills: [], // Có thể thêm logic tạo skill động ở đây
    };
}


// --- DATABASE TRUNG TÂM VÀ HÀM TRUY CẬP ---

// THAY ĐỔI: itemDatabase giờ là một cache. Nó chứa các vật phẩm tĩnh và các vật phẩm được tạo ra trong quá trình chơi.
export const itemDatabase = new Map<number, ItemDefinition>([
    // Các vật phẩm tĩnh không theo blueprint (nguyên liệu, quest item, etc.)
    [2, { id: 2, name: 'Hard Armor', type: 'armor', rarity: 'B', description: 'Áo giáp cứng cáp, cung cấp khả năng phòng thủ vượt trội.', stats: { defense: 25, durability: 120 }, icon: itemAssets.hardArmor, maxLevel: 25 }],
    [26, { id: 26, name: 'Lá cây hiếm', type: 'material', rarity: 'D', description: 'Lá cây dùng để chế thuốc.', icon: '🍃' }],
    [43, { id: 43, name: 'Sắt', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để rèn trang bị.', icon: itemAssets.sat }],
    [44, { id: 44, name: 'Gỗ', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để chế tạo vật phẩm.', icon: itemAssets.go }],
    [45, { id: 45, name: 'Da', type: 'material', rarity: 'E', description: 'Da động vật, nguyên liệu cơ bản để chế tạo giáp nhẹ.', icon: itemAssets.da }],
    // ... thêm các vật phẩm tĩnh khác nếu cần
]);

/**
 * THAY ĐỔI: Đây là hàm truy cập TOÀN CẦU để lấy ItemDefinition.
 * Nó sẽ kiểm tra cache (itemDatabase), nếu không có, nó sẽ tự tạo,
 * lưu vào cache và trả về.
 */
export function getItemDefinition(id: number): ItemDefinition | undefined {
    // 1. Kiểm tra cache trước
    if (itemDatabase.has(id)) {
        return itemDatabase.get(id);
    }

    // 2. Nếu không có, thử tạo từ blueprint
    // Tìm baseId bằng cách loại bỏ phần rank index (luôn nhỏ hơn 100)
    const baseId = Math.floor(id / 100) * 100;
    const rankIndex = id % 100;
    
    const blueprint = blueprintByBaseId.get(baseId);
    if (blueprint && rankIndex >= 0 && rankIndex < RARITY_ORDER.length) {
        const rank = RARITY_ORDER[rankIndex];
        const newItemDef = generateItemDefinition(blueprint, rank);
        
        // 3. Lưu vào cache cho lần truy cập sau
        itemDatabase.set(newItemDef.id, newItemDef);
        
        return newItemDef;
    }

    // 4. Nếu không tìm thấy, trả về undefined
    console.warn(`Không thể tìm hoặc tạo ItemDefinition cho ID: ${id}`);
    return undefined;
}

/**
 * THAY ĐỔI: Hàm tiện ích để lấy blueprint từ tên vật phẩm.
 * Rất hữu ích cho logic Rèn (Forge).
 */
export function getBlueprintByName(name: string): ItemBlueprint | undefined {
    return blueprintByName.get(name);
}

// --- END OF FILE item-database.ts (REFACTORED) ---
