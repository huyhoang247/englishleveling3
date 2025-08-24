// --- START OF FILE item-database.ts (UPGRADED RANDOMNESS & NEW WEAPONS) ---

import { itemAssets } from '../../game-assets.ts';

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
    // --- Các vật phẩm đã có ---
    { baseId: 1000, name: 'Nomad Sword', type: 'weapon', baseDescription: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', icon: itemAssets.nomadSword, baseStats: { HP: 1000, ATK: 100, DEF: 50 }, baseMaxLevel: 10 },
    { baseId: 2000, name: 'Tunic', type: 'armor', baseDescription: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', icon: itemAssets.tunic, baseStats: { defense: 8, magicResist: 2 }, baseMaxLevel: 10 },
    { baseId: 3000, name: 'Warrior\'s Sword', type: 'weapon', baseDescription: 'Thanh kiếm được rèn cho những chiến binh dũng cảm.', icon: itemAssets.warriorsSword, baseStats: { HP: 1800, ATK: 180, DEF: 90 }, baseMaxLevel: 15 },
    { baseId: 4000, name: 'Frostbite Spear', type: 'weapon', baseDescription: 'Ngọn giáo phủ băng.', icon: itemAssets.frostbiteSpear, baseStats: { HP: 1500, ATK: 140, DEF: 120 }, baseMaxLevel: 15 },
    { baseId: 5000, name: 'Giant\'s Hammer', type: 'weapon', baseDescription: 'Cây búa khổng lồ, sức mạnh vô song.', icon: itemAssets.giantsHammer, baseStats: { HP: 2500, ATK: 250, DEF: 100 }, baseMaxLevel: 20 },
    { baseId: 6000, name: 'Forest Staff', type: 'weapon', baseDescription: 'Cây trượng làm từ gỗ rừng cổ thụ.', icon: itemAssets.forestStaff, baseStats: { HP: 1200, ATK: 200, DEF: 60 }, baseMaxLevel: 15 },
    { baseId: 7000, name: 'Hawkeye Bow', type: 'weapon', baseDescription: 'Cung của xạ thủ đại bàng, tầm bắn xa và độ chính xác cao.', icon: itemAssets.hawkeyeBow, baseStats: { HP: 1400, ATK: 160, DEF: 70 }, baseMaxLevel: 15 },
    { baseId: 8000, name: 'Assassin\'s Dagger', type: 'weapon', baseDescription: 'Con dao găm của sát thủ, nhanh và chí mạng.', icon: itemAssets.assassinsDagger, baseStats: { HP: 1100, ATK: 190, DEF: 55 }, baseMaxLevel: 15 },
    
    // --- CÁC VŨ KHÍ MỚI ĐƯỢC THÊM TỪ GAME-ASSETS.TS ---
    
    // Tier cơ bản (Tương tự Nomad)
    { baseId: 9000, name: 'Nomad Staff', type: 'weapon', baseDescription: 'Cây trượng của dân du mục, chứa đựng ma thuật cơ bản.', icon: itemAssets.nomadStaff, baseStats: { HP: 900, ATK: 120, DEF: 40 }, baseMaxLevel: 10 },
    { baseId: 10000, name: 'Nomad Bow', type: 'weapon', baseDescription: 'Cây cung của dân du mục, đáng tin cậy trên đường đi.', icon: itemAssets.nomadBow, baseStats: { HP: 1100, ATK: 110, DEF: 45 }, baseMaxLevel: 10 },

    // Tier trung cấp (Tương tự Warrior's / Hawkeye)
    { baseId: 11000, name: 'Mystic Staff', type: 'weapon', baseDescription: 'Cây trượng ẩn chứa những bí thuật cổ xưa, khuếch đại sức mạnh phép thuật.', icon: itemAssets.mysticStaff, baseStats: { HP: 1300, ATK: 220, DEF: 65 }, baseMaxLevel: 15 },
    { baseId: 12000, name: 'Sacrificial Sword', type: 'weapon', baseDescription: 'Thanh kiếm hiến tế, đánh đổi sinh mệnh để lấy sức mạnh vô song.', icon: itemAssets.sacrificialSword, baseStats: { HP: 800, ATK: 260, DEF: 50 }, baseMaxLevel: 20 },

    // Tier cao cấp (Mạnh mẽ, tương đương hoặc hơn Giant's Hammer)
    { baseId: 13000, name: 'Leviathan Axe', type: 'weapon', baseDescription: 'Chiếc rìu được chế tác từ vảy của thủy quái Leviathan, mang sức nặng của đại dương.', icon: itemAssets.leviathanAxe, baseStats: { HP: 2800, ATK: 270, DEF: 120 }, baseMaxLevel: 20 },
    { baseId: 14000, name: 'Angel Bow', type: 'weapon', baseDescription: 'Cây cung được ban phước bởi các thiên thần, bắn ra những mũi tên ánh sáng.', icon: itemAssets.angelBow, baseStats: { HP: 1600, ATK: 240, DEF: 80 }, baseMaxLevel: 20 },
    { baseId: 15000, name: 'Shadow Scythe', type: 'weapon', baseDescription: 'Lưỡi hái của bóng tối, gặt hái linh hồn kẻ địch với mỗi nhát chém.', icon: itemAssets.shadowScythe, baseStats: { HP: 1500, ATK: 280, DEF: 70 }, baseMaxLevel: 20 },
    { baseId: 16000, name: 'Demon Knight\'s Spear', type: 'weapon', baseDescription: 'Ngọn giáo của kỵ sĩ quỷ, có khả năng xuyên thủng mọi lớp giáp.', icon: itemAssets.demonKnightsSpear, baseStats: { HP: 2200, ATK: 250, DEF: 180 }, baseMaxLevel: 20 },

    // Tier thần thoại (Vũ khí cuối game, cực kỳ mạnh)
    { baseId: 17000, name: 'Divine Quarterstaff', type: 'weapon', baseDescription: 'Cây trường côn thần thánh, tỏa ra năng lượng thuần khiết có thể thanh tẩy mọi thứ.', icon: itemAssets.divineQuarterstaff, baseStats: { HP: 2000, ATK: 300, DEF: 120 }, baseMaxLevel: 25 },
    { baseId: 18000, name: 'Meteor Staff', type: 'weapon', baseDescription: 'Cây trượng có khả năng triệu hồi những cơn mưa thiên thạch hủy diệt.', icon: itemAssets.meteorStaff, baseStats: { HP: 1800, ATK: 330, DEF: 90 }, baseMaxLevel: 25 },
    { baseId: 19000, name: 'Chaos Staff', type: 'weapon', baseDescription: 'Cây trượng chứa đựng sức mạnh hỗn mang, không thể kiểm soát và không thể đoán trước.', icon: itemAssets.chaosStaff, baseStats: { HP: 2200, ATK: 380, DEF: 100 }, baseMaxLevel: 25 },
    { baseId: 20000, name: 'Demon King\'s Daggers', type: 'weapon', baseDescription: 'Cặp dao găm của Quỷ Vương, mỗi nhát chém đều mang theo sự hủy diệt.', icon: itemAssets.demonKingsDaggers, baseStats: { HP: 1300, ATK: 320, DEF: 60 }, baseMaxLevel: 25 },
    { baseId: 21000, name: 'Demon King\'s Longsword', type: 'weapon', baseDescription: 'Thanh trường kiếm của Quỷ Vương, thấm đẫm quyền năng hắc ám.', icon: itemAssets.demonKingsLongsword, baseStats: { HP: 3000, ATK: 350, DEF: 150 }, baseMaxLevel: 25 },
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
    // Lưu ý: Các asset như sat, go, da... không tồn tại trong file game-assets.ts. 
    // Giữ nguyên để không phá vỡ logic cũ nhưng cần được cập nhật sau.
    [43, { id: 43, name: 'Sắt', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để rèn trang bị.', icon: 'placeholder' /* itemAssets.sat */ }],
    [44, { id: 44, name: 'Gỗ', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để chế tạo vật phẩm.', icon: 'placeholder' /* itemAssets.go */ }],
    [45, { id: 45, name: 'Da', type: 'material', rarity: 'E', description: 'Da động vật, nguyên liệu cơ bản để chế tạo giáp nhẹ.', icon: 'placeholder' /* itemAssets.da */ }],
    [46, { id: 46, name: 'Vải', type: 'material', rarity: 'E', description: 'Vải thô, dùng để chế tạo quần áo và túi.', icon: 'placeholder' /* itemAssets.vai */ }],
    [47, { id: 47, name: 'Mảnh ghép vũ khí', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một vũ khí ngẫu nhiên.', icon: 'placeholder' /* itemAssets.manhGhepVuKhi */ }],
    [48, { id: 48, name: 'Mảnh ghép áo giáp', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một áo giáp ngẫu nhiên.', icon: 'placeholder' /* itemAssets.manhGhepAoGiap */ }],
    [49, { id: 49, name: 'Thạch anh', type: 'material', rarity: 'E', description: 'Thạch anh, một loại nguyên liệu phổ biến.', icon: 'placeholder' /* itemAssets.thachAnh */ }],
    [50, { id: 50, name: 'Ngọc lục bảo', type: 'material', rarity: 'D', description: 'Ngọc lục bảo, nguyên liệu dùng trong chế tác.', icon: 'placeholder' /* itemAssets.ngocLucBao */ }],
    [51, { id: 51, name: 'Mảnh ghép helmet', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một chiếc mũ ngẫu nhiên.', icon: 'placeholder' /* itemAssets.manhGhepHelmet */ }],
    [52, { id: 52, name: 'Mảnh ghép găng tay', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi găng tay ngẫu nhiên.', icon: 'placeholder' /* itemAssets.manhGhepGangTay */ }],
    [53, { id: 53, name: 'Mảnh ghép giày', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi giày ngẫu nhiên.', icon: 'placeholder' /* itemAssets.manhGhepGiay */ }],
    [54, { id: 54, name: 'Mảnh ghép trang sức', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một món trang sức ngẫu nhiên.', icon: 'placeholder' /* itemAssets.manhGhepTrangSuc */ }],
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
        // Khi lấy item theo ID, ta không dùng randomized craft mà dùng chỉ số gốc
        const newItemDef = generateItemDefinition(blueprint, rank, false); 
        
        itemDatabase.set(newItemDef.id, newItemDef);
        
        return newItemDef;
    }

    console.warn(`Không thể tìm hoặc tạo ItemDefinition cho ID: ${id}`);
    return undefined;
}

export function getBlueprintByName(name: string): ItemBlueprint | undefined {
    return blueprintByName.get(name);
}

// --- END OF FILE item-database.ts (UPGRADED RANDOMNESS & NEW WEAPONS) ---
