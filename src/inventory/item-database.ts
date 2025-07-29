// --- START OF FILE item-database.ts (UPGRADED RANDOMNESS) ---

import { itemAssets } from '../game-assets.ts';

// --- CÁC ĐỊNH NGHĨA CỐT LÕI (Không đổi) ---
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

export interface ItemBlueprint {
    baseId: number;
    name: string;
    type: 'weapon' | 'armor' | 'accessory';
    baseDescription: string;
    icon: string;
    baseStats: { [key: string]: number };
    baseMaxLevel: number;
}

const rankModifiers: { [key in ItemRank]: { statMultiplier: number; levelMultiplier: number; desc: string; specialStats?: { [key: string]: any } } } = {
    E:   { statMultiplier: 1.0,  levelMultiplier: 1.0, desc: 'một phiên bản cơ bản' },
    D:   { statMultiplier: 2.0,  levelMultiplier: 1.2, desc: 'một phiên bản được gia cố' },
    B:   { statMultiplier: 4.0,  levelMultiplier: 1.8, desc: 'một tác phẩm đáng tin cậy', specialStats: { agility: 5 } },
    A:   { statMultiplier: 8.0,  levelMultiplier: 2.5, desc: 'một kiệt tác của thợ rèn', specialStats: { agility: 10, critChance: 0.05 } },
    S:   { statMultiplier: 16.0, levelMultiplier: 3.5, desc: 'một vũ khí huyền thoại', specialStats: { strength: 15, critChance: 0.10, lifeSteal: 0.03 } },
    SR:  { statMultiplier: 32.0, levelMultiplier: 4.5, desc: 'một báu vật thần thoại', specialStats: { strength: 25, critChance: 0.15, lifeSteal: 0.07 } },
    SSR: { statMultiplier: 64.0, levelMultiplier: 6.0, desc: 'một tạo tác vô song của các vị thần', specialStats: { strength: 40, critChance: 0.20, lifeSteal: 0.12, divinePower: 100 } },
};

export const itemBlueprints: ItemBlueprint[] = [
    { baseId: 1000, name: 'Nomad Sword', type: 'weapon', baseDescription: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', icon: itemAssets.nomadSword, baseStats: { HP: 1000, ATK: 100, DEF: 50 }, baseMaxLevel: 10 },
    { baseId: 2000, name: 'Tunic', type: 'armor', baseDescription: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', icon: itemAssets.tunic, baseStats: { defense: 8, magicResist: 2 }, baseMaxLevel: 10 },
    { baseId: 3000, name: 'Warrior\'s Sword', type: 'weapon', baseDescription: 'Thanh kiếm được rèn cho những chiến binh dũng cảm.', icon: itemAssets.warriorsSword, baseStats: { HP: 1800, ATK: 180, DEF: 90 }, baseMaxLevel: 15 },
    { baseId: 4000, name: 'Frostbite Spear', type: 'weapon', baseDescription: 'Ngọn giáo phủ băng.', icon: itemAssets.frostbiteSpear, baseStats: { HP: 1500, ATK: 140, DEF: 120 }, baseMaxLevel: 15 },
    { baseId: 5000, name: 'Giant\'s Hammer', type: 'weapon', baseDescription: 'Cây búa khổng lồ, sức mạnh vô song.', icon: itemAssets.giantsHammer, baseStats: { HP: 2500, ATK: 250, DEF: 100 }, baseMaxLevel: 20 },
    { baseId: 6000, name: 'Forest Staff', type: 'weapon', baseDescription: 'Cây trượng làm từ gỗ rừng cổ thụ.', icon: itemAssets.forestStaff, baseStats: { HP: 1200, ATK: 200, DEF: 60 }, baseMaxLevel: 15 },
    { baseId: 7000, name: 'Hawkeye Bow', type: 'weapon', baseDescription: 'Cung của xạ thủ đại bàng, tầm bắn xa và độ chính xác cao.', icon: itemAssets.hawkeyeBow, baseStats: { HP: 1400, ATK: 160, DEF: 70 }, baseMaxLevel: 15 },
    { baseId: 8000, name: 'Assassin\'s Dagger', type: 'weapon', baseDescription: 'Con dao găm của sát thủ, nhanh và chí mạng.', icon: itemAssets.assassinsDagger, baseStats: { HP: 1100, ATK: 190, DEF: 55 }, baseMaxLevel: 15 },
];

const blueprintByBaseId = new Map<number, ItemBlueprint>(itemBlueprints.map(bp => [bp.baseId, bp]));
const blueprintByName = new Map<string, ItemBlueprint>(itemBlueprints.map(bp => [bp.name, bp]));


// --- NÂNG CẤP HỆ THỐNG RANDOM ---

// 1. Định nghĩa các Phân loại (Archetypes)
const archetypes = [
    { name: 'Balanced',   weights: { HP: {min: 0.8, max: 1.2}, ATK: {min: 0.8, max: 1.2}, DEF: {min: 0.8, max: 1.2} } }, // Cân bằng
    { name: 'Sturdy',     weights: { HP: {min: 1.5, max: 2.0}, ATK: {min: 0.5, max: 0.8}, DEF: {min: 1.3, max: 1.8} } }, // Trâu bò, phòng thủ
    { name: 'GlassCannon',weights: { HP: {min: 0.5, max: 0.8}, ATK: {min: 1.6, max: 2.2}, DEF: {min: 0.4, max: 0.7} } }, // Sát thương cao, máu giấy
    { name: 'Bruiser',    weights: { HP: {min: 1.2, max: 1.6}, ATK: {min: 1.1, max: 1.5}, DEF: {min: 0.6, max: 0.9} } }, // Đấu sĩ, công và máu cao
];

// Hàm tiện ích để lấy số ngẫu nhiên trong khoảng
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;


/**
 * THAY ĐỔI LỚN: Sử dụng hệ thống Archetype để tạo chỉ số ngẫu nhiên có "cá tính" hơn.
 */
export function generateItemDefinition(blueprint: ItemBlueprint, rank: ItemRank, isRandomizedCraft: boolean = false): ItemDefinition {
    const modifier = rankModifiers[rank];
    const rankIndex = RARITY_ORDER.indexOf(rank);

    let workingStats: { [key: string]: number };

    // BƯỚC 1: Xác định bộ chỉ số "gốc" sẽ được sử dụng.
    if (blueprint.type === 'weapon' && isRandomizedCraft) {
        // A. Chọn ngẫu nhiên một archetype
        const selectedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];

        // B. Lấy chỉ số cơ bản của blueprint làm nền
        const base = blueprint.baseStats;

        // C. Tạo chỉ số mới dựa trên archetype đã chọn
        workingStats = {
            HP:  Math.round(base.HP  * randomInRange(selectedArchetype.weights.HP.min,  selectedArchetype.weights.HP.max)),
            ATK: Math.round(base.ATK * randomInRange(selectedArchetype.weights.ATK.min, selectedArchetype.weights.ATK.max)),
            DEF: Math.round(base.DEF * randomInRange(selectedArchetype.weights.DEF.min, selectedArchetype.weights.DEF.max)),
        };

    } else {
        // Nếu không phải chế tạo ngẫu nhiên, dùng chỉ số cơ bản
        workingStats = { ...blueprint.baseStats };
    }

    // BƯỚC 2: Áp dụng hệ số nhân của Rank vào bộ chỉ số đã chọn.
    const finalStats: { [key: string]: any } = {};
    for (const key in workingStats) {
        finalStats[key] = Math.round(workingStats[key] * modifier.statMultiplier);
    }
    
    if (blueprint.type !== 'weapon' && modifier.specialStats) {
        Object.assign(finalStats, modifier.specialStats);
    }

    // BƯỚC 3: Trả về ItemDefinition hoàn chỉnh.
    return {
        id: blueprint.baseId + rankIndex,
        baseId: blueprint.baseId,
        name: blueprint.name,
        type: blueprint.type,
        rarity: rank,
        description: `${blueprint.baseDescription} Đây là ${modifier.desc}.`,
        icon: blueprint.icon,
        stats: finalStats,
        maxLevel: Math.round(blueprint.baseMaxLevel * modifier.levelMultiplier),
        skills: [],
    };
}


// --- DATABASE TRUNG TÂM VÀ HÀM TRUY CẬP (Không đổi) ---

export const itemDatabase = new Map<number, ItemDefinition>([
    [2, { id: 2, name: 'Hard Armor', type: 'armor', rarity: 'B', description: 'Áo giáp cứng cáp, cung cấp khả năng phòng thủ vượt trội.', stats: { defense: 25, durability: 120 }, icon: itemAssets.hardArmor, maxLevel: 25 }],
    [26, { id: 26, name: 'Lá cây hiếm', type: 'material', rarity: 'D', description: 'Lá cây dùng để chế thuốc.', icon: '🍃' }],
    [43, { id: 43, name: 'Sắt', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để rèn trang bị.', icon: itemAssets.sat }],
    [44, { id: 44, name: 'Gỗ', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để chế tạo vật phẩm.', icon: itemAssets.go }],
    [45, { id: 45, name: 'Da', type: 'material', rarity: 'E', description: 'Da động vật, nguyên liệu cơ bản để chế tạo giáp nhẹ.', icon: itemAssets.da }],
    [46, { id: 46, name: 'Vải', type: 'material', rarity: 'E', description: 'Vải thô, dùng để chế tạo quần áo và túi.', icon: itemAssets.vai }],
    [47, { id: 47, name: 'Mảnh ghép vũ khí', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một vũ khí ngẫu nhiên.', icon: itemAssets.manhGhepVuKhi }],
    [48, { id: 48, name: 'Mảnh ghép áo giáp', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một áo giáp ngẫu nhiên.', icon: itemAssets.manhGhepAoGiap }],
    [49, { id: 49, name: 'Thạch anh', type: 'material', rarity: 'E', description: 'Thạch anh, một loại nguyên liệu phổ biến.', icon: itemAssets.thachAnh }],
    [50, { id: 50, name: 'Ngọc lục bảo', type: 'material', rarity: 'D', description: 'Ngọc lục bảo, nguyên liệu dùng trong chế tác.', icon: itemAssets.ngocLucBao }],
    [51, { id: 51, name: 'Mảnh ghép helmet', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một chiếc mũ ngẫu nhiên.', icon: itemAssets.manhGhepHelmet }],
    [52, { id: 52, name: 'Mảnh ghép găng tay', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi găng tay ngẫu nhiên.', icon: itemAssets.manhGhepGangTay }],
    [53, { id: 53, name: 'Mảnh ghép giày', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi giày ngẫu nhiên.', icon: itemAssets.manhGhepGiay }],
    [54, { id: 54, name: 'Mảnh ghép trang sức', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một món trang sức ngẫu nhiên.', icon: itemAssets.manhGhepTrangSuc }],
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
        const newItemDef = generateItemDefinition(blueprint, rank, true); // Vẫn gọi với true để cache lần đầu
        
        itemDatabase.set(newItemDef.id, newItemDef);
        
        return newItemDef;
    }

    console.warn(`Không thể tìm hoặc tạo ItemDefinition cho ID: ${id}`);
    return undefined;
}

export function getBlueprintByName(name: string): ItemBlueprint | undefined {
    return blueprintByName.get(name);
}

// --- END OF FILE item-database.ts (UPGRADED RANDOMNESS) ---
