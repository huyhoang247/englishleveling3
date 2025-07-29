// --- START OF FILE item-database.ts (REFACTORED & MODIFIED) ---

// Giả định bạn có file này để quản lý đường dẫn đến ảnh
import { itemAssets } from '../game-assets.ts'; 


// --- CÁC ĐỊNH NGHĨA CỐT LÕI ---

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
    baseId?: number; 
}

// --- HỆ THỐNG BLUEPRINT MỚI ---

export interface ItemBlueprint {
    baseId: number;
    name: string;
    type: 'weapon' | 'armor' | 'accessory';
    baseDescription: string;
    icon: string;
}

const rankModifiers: { [key in ItemRank]: { statMultiplier: number; levelMultiplier: number; desc: string; } } = {
    E:   { statMultiplier: 1.0,  levelMultiplier: 1.0, desc: 'một phiên bản cơ bản' },
    D:   { statMultiplier: 2.0,  levelMultiplier: 1.2, desc: 'một phiên bản được gia cố' },
    B:   { statMultiplier: 4.0,  levelMultiplier: 1.8, desc: 'một tác phẩm đáng tin cậy' },
    A:   { statMultiplier: 8.0,  levelMultiplier: 2.5, desc: 'một kiệt tác của thợ rèn' },
    S:   { statMultiplier: 16.0, levelMultiplier: 3.5, desc: 'một vũ khí huyền thoại' },
    SR:  { statMultiplier: 32.0, levelMultiplier: 4.5, desc: 'một báu vật thần thoại' },
    SSR: { statMultiplier: 64.0, levelMultiplier: 6.0, desc: 'một tạo tác vô song của các vị thần' },
};

export const itemBlueprints: ItemBlueprint[] = [
    { baseId: 1000, name: 'Nomad Sword', type: 'weapon', baseDescription: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', icon: itemAssets.nomadSword },
    { baseId: 2000, name: 'Tunic', type: 'armor', baseDescription: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', icon: itemAssets.tunic },
    { baseId: 3000, name: 'Warrior\'s Sword', type: 'weapon', baseDescription: 'Thanh kiếm được rèn cho những chiến binh dũng cảm.', icon: itemAssets.warriorsSword },
    { baseId: 4000, name: 'Frostbite Spear', type: 'weapon', baseDescription: 'Ngọn giáo phủ băng, gây sát thương kèm hiệu ứng làm chậm.', icon: itemAssets.frostbiteSpear },
    { baseId: 5000, name: 'Giant\'s Hammer', type: 'weapon', baseDescription: 'Cây búa khổng lồ, gây sát thương vật lý cực lớn.', icon: itemAssets.giantsHammer },
    { baseId: 6000, name: 'Forest Staff', type: 'weapon', baseDescription: 'Cây trượng làm từ gỗ rừng cổ thụ, tăng cường sức mạnh phép thuật tự nhiên.', icon: itemAssets.forestStaff },
    { baseId: 7000, name: 'Hawkeye Bow', type: 'weapon', baseDescription: 'Cung của xạ thủ đại bàng, tầm bắn xa và độ chính xác cao.', icon: itemAssets.hawkeyeBow },
    { baseId: 8000, name: 'Assassin\'s Dagger', type: 'weapon', baseDescription: 'Con dao găm của sát thủ, sắc bén và dễ dàng ẩn mình.', icon: itemAssets.assassinsDagger },
];

const blueprintByBaseId = new Map<number, ItemBlueprint>(itemBlueprints.map(bp => [bp.baseId, bp]));
const blueprintByName = new Map<string, ItemBlueprint>(itemBlueprints.map(bp => [bp.name, bp]));


// --- HÀM TẠO VẬT PHẨM ĐỘNG ---

const generateRandomBaseStats = (): { HP: number, ATK: number, DEF: number } => {
    return {
        HP: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
        ATK: Math.floor(Math.random() * (500 - 100 + 1)) + 100,
        DEF: Math.floor(Math.random() * (250 - 50 + 1)) + 50,
    };
};

export function generateItemDefinition(blueprint: ItemBlueprint, rank: ItemRank): ItemDefinition {
    const modifier = rankModifiers[rank];
    const rankIndex = RARITY_ORDER.indexOf(rank);
    const baseStats = generateRandomBaseStats();

    const finalStats: { [key: string]: any } = {};
    for (const key in baseStats) {
        finalStats[key] = Math.round(baseStats[key as keyof typeof baseStats] * modifier.statMultiplier);
    }

    const baseMaxLevel = 10;
    const finalMaxLevel = Math.round(baseMaxLevel * modifier.levelMultiplier);

    return {
        id: blueprint.baseId + rankIndex,
        baseId: blueprint.baseId,
        name: blueprint.name,
        type: blueprint.type,
        rarity: rank,
        description: `${blueprint.baseDescription} Đây là ${modifier.desc}.`,
        icon: blueprint.icon,
        stats: finalStats,
        maxLevel: finalMaxLevel,
        skills: [],
    };
}


// --- DATABASE TRUNG TÂM VÀ HÀM TRUY CẬP ---

export const itemDatabase = new Map<number, ItemDefinition>([
    [2, { id: 2, name: 'Hard Armor', type: 'armor', rarity: 'B', description: 'Áo giáp cứng cáp, cung cấp khả năng phòng thủ vượt trội.', stats: { defense: 25, durability: 120 }, icon: itemAssets.hardArmor, maxLevel: 25 }],
    [26, { id: 26, name: 'Lá cây hiếm', type: 'material', rarity: 'D', description: 'Lá cây dùng để chế thuốc.', icon: '🍃' }],
    // ... các vật phẩm tĩnh khác
]);

export function getItemDefinition(id: number): ItemDefinition | undefined {
    if (itemDatabase.has(id)) {
        return itemDatabase.get(id);
    }

    const baseId = Math.floor(id / 1000) * 1000;
    const rankIndex = id - baseId;
    
    const blueprint = blueprintByBaseId.get(baseId);
    if (blueprint && rankIndex >= 0 && rankIndex < RARITY_ORDER.length) {
        const rank = RARITY_ORDER[rankIndex];
        const newItemDef = generateItemDefinition(blueprint, rank);
        
        itemDatabase.set(newItemDef.id, newItemDef);
        
        return newItemDef;
    }

    console.warn(`Không thể tìm hoặc tạo ItemDefinition cho ID: ${id}`);
    return undefined;
}

export function getBlueprintByName(name: string): ItemBlueprint | undefined {
    return blueprintByName.get(name);
}

// --- END OF FILE item-database.ts (REFACTORED & MODIFIED) ---
