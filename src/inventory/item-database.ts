// --- START OF FILE item-database.ts (REFACTORED - FULL CODE) ---

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
    baseId?: number; 
}

// --- HỆ THỐNG BLUEPRINT MỚI ---

export interface ItemBlueprint {
    baseId: number; // ID cơ sở, phải là duy nhất cho mỗi blueprint
    name: string;
    type: 'weapon' | 'armor' | 'accessory';
    baseDescription: string;
    icon: string;
    // THAY ĐỔI: Chỉ số cơ bản của vũ khí giờ là HP, ATK, DEF
    baseStats: { [key: string]: number };
    baseMaxLevel: number;
}

// THAY ĐỔI: Hệ số nhân chỉ số và các thuộc tính khác dựa trên Rank
const rankModifiers: { [key in ItemRank]: { statMultiplier: number; levelMultiplier: number; desc: string; specialStats?: { [key: string]: any } } } = {
    E:   { statMultiplier: 1.0,  levelMultiplier: 1.0, desc: 'một phiên bản cơ bản' },
    D:   { statMultiplier: 2.0,  levelMultiplier: 1.2, desc: 'một phiên bản được gia cố' },
    B:   { statMultiplier: 4.0,  levelMultiplier: 1.8, desc: 'một tác phẩm đáng tin cậy', specialStats: { agility: 5 } },
    A:   { statMultiplier: 8.0,  levelMultiplier: 2.5, desc: 'một kiệt tác của thợ rèn', specialStats: { agility: 10, critChance: 0.05 } },
    S:   { statMultiplier: 16.0, levelMultiplier: 3.5, desc: 'một vũ khí huyền thoại', specialStats: { strength: 15, critChance: 0.10, lifeSteal: 0.03 } },
    SR:  { statMultiplier: 32.0, levelMultiplier: 4.5, desc: 'một báu vật thần thoại', specialStats: { strength: 25, critChance: 0.15, lifeSteal: 0.07 } },
    SSR: { statMultiplier: 64.0, levelMultiplier: 6.0, desc: 'một tạo tác vô song của các vị thần', specialStats: { strength: 40, critChance: 0.20, lifeSteal: 0.12, divinePower: 100 } },
};

// THAY ĐỔI: Database giờ chứa các blueprint. Vũ khí đã được cập nhật với chỉ số HP, ATK, DEF.
// Các giá trị này đóng vai trò là giá trị "cơ bản" hoặc "mặc định".
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


// --- HÀM TẠO VẬT PHẨM ĐỘNG ---

/**
 * THAY ĐỔI LỚN: Hàm này giờ đây có thể tạo ra một ItemDefinition với chỉ số ngẫu nhiên cho vũ khí.
 * @param blueprint Bản thiết kế của vật phẩm.
 * @param rank Hạng của vật phẩm.
 * @param isRandomizedCraft - NẾU LÀ TRUE, vũ khí sẽ được tạo với chỉ số cơ bản ngẫu nhiên.
 */
export function generateItemDefinition(blueprint: ItemBlueprint, rank: ItemRank, isRandomizedCraft: boolean = false): ItemDefinition {
    const modifier = rankModifiers[rank];
    const rankIndex = RARITY_ORDER.indexOf(rank);

    let baseStatsForCalculation = blueprint.baseStats;

    // THAY ĐỔI: Nếu là chế tạo vũ khí, tạo chỉ số cơ bản ngẫu nhiên
    if (blueprint.type === 'weapon' && isRandomizedCraft) {
        baseStatsForCalculation = {
            HP: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
            ATK: Math.floor(Math.random() * (500 - 100 + 1)) + 100,
            DEF: Math.floor(Math.random() * (250 - 50 + 1)) + 50,
        };
    }

    const newStats: { [key: string]: any } = {};
    for (const key in baseStatsForCalculation) {
        newStats[key] = Math.round(baseStatsForCalculation[key] * modifier.statMultiplier);
    }
    
    // Gộp các chỉ số đặc biệt từ rank modifier, nhưng không áp dụng cho vũ khí
    // để giữ bộ chỉ số HP, ATK, DEF tinh khiết.
    if (blueprint.type !== 'weapon' && modifier.specialStats) {
        Object.assign(newStats, modifier.specialStats);
    }

    return {
        id: blueprint.baseId + rankIndex,
        baseId: blueprint.baseId,
        name: blueprint.name,
        type: blueprint.type,
        rarity: rank,
        description: `${blueprint.baseDescription} Đây là ${modifier.desc}.`,
        icon: blueprint.icon,
        stats: newStats,
        maxLevel: Math.round(blueprint.baseMaxLevel * modifier.levelMultiplier),
        skills: [],
    };
}


// --- DATABASE TRUNG TÂM VÀ HÀM TRUY CẬP ---

export const itemDatabase = new Map<number, ItemDefinition>([
    // Các vật phẩm tĩnh không theo blueprint (nguyên liệu, quest item, etc.)
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

/**
 * THAY ĐỔI: Hàm này sẽ tạo và cache vật phẩm. Vì generateItemDefinition đã thay đổi,
 * mỗi khi một ID vật phẩm chưa có trong cache được gọi, nó sẽ được tạo ra với
 * chỉ số (có thể ngẫu nhiên nếu là vũ khí) và được lưu lại cho các lần gọi sau trong cùng phiên.
 */
export function getItemDefinition(id: number): ItemDefinition | undefined {
    // 1. Kiểm tra cache trước
    if (itemDatabase.has(id)) {
        return itemDatabase.get(id);
    }

    // 2. Nếu không có, thử tạo từ blueprint
    const baseId = Math.floor(id / 1000) * 1000;
    const rankIndex = id - baseId;
    
    const blueprint = blueprintByBaseId.get(baseId);
    if (blueprint && rankIndex >= 0 && rankIndex < RARITY_ORDER.length) {
        const rank = RARITY_ORDER[rankIndex];
        // Gọi hàm generate với isRandomizedCraft = true để đảm bảo lần đầu tạo ra sẽ có chỉ số ngẫu nhiên nếu là vũ khí
        const newItemDef = generateItemDefinition(blueprint, rank, true);
        
        // 3. Lưu vào cache cho lần truy cập sau
        itemDatabase.set(newItemDef.id, newItemDef);
        
        return newItemDef;
    }

    // 4. Nếu không tìm thấy, trả về undefined
    console.warn(`Không thể tìm hoặc tạo ItemDefinition cho ID: ${id}`);
    return undefined;
}


export function getBlueprintByName(name: string): ItemBlueprint | undefined {
    return blueprintByName.get(name);
}

// --- END OF FILE item-database.ts (REFACTORED - FULL CODE) ---
