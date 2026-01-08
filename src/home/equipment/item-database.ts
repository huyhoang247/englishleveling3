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
    type: 'weapon' | 'potion' | 'armor' | 'accessory' | 'material' | 'currency' | 'misc' | 'quest' | 'piece' | 'Helmet';
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
    type: 'weapon' | 'armor' | 'accessory' | 'Helmet';
    baseDescription: string;
    icon: string;
    baseStats: { [key: string]: number };
    baseMaxLevel: number;
}

const rankModifiers: { [key in ItemRank]: { statMultiplier: number; levelMultiplier: number; desc: string; specialStats?: { [key: string]: any } } } = {
    E:   { statMultiplier: 1.0,  levelMultiplier: 1.0, desc: 'một phiên bản cơ bản' },
    D:   { statMultiplier: 2.0,  levelMultiplier: 1.2, desc: 'một phiên bản được gia cố' },
    B:   { statMultiplier: 4.0,  levelMultiplier: 1.8, desc: 'một tác phẩm đáng tin cậy' },
    A:   { statMultiplier: 8.0,  levelMultiplier: 2.5, desc: 'một kiệt tác của thợ rèn' },
    S:   { statMultiplier: 16.0, levelMultiplier: 3.5, desc: 'một vũ khí huyền thoại' },
    SR:  { statMultiplier: 32.0, levelMultiplier: 4.5, desc: 'một báu vật thần thoại' },
    SSR: { statMultiplier: 64.0, levelMultiplier: 6.0, desc: 'một tạo tác vô song của các vị thần' },
};

export const itemBlueprints: ItemBlueprint[] = [
    { baseId: 1000, name: 'Nomad Sword', type: 'weapon', baseDescription: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', icon: itemAssets.nomadSword, baseStats: { hp: 1000, atk: 100, def: 50 }, baseMaxLevel: 10 },
    { baseId: 2000, name: 'Tunic', type: 'armor', baseDescription: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', icon: itemAssets.tunic, baseStats: { hp: 600, atk: 5, def: 80 }, baseMaxLevel: 10 },
    { baseId: 3000, name: 'Warrior\'s Sword', type: 'weapon', baseDescription: 'Thanh kiếm được rèn cho những chiến binh dũng cảm.', icon: itemAssets.warriorsSword, baseStats: { hp: 1800, atk: 180, def: 90 }, baseMaxLevel: 15 },
    { baseId: 4000, name: 'Frostbite Spear', type: 'weapon', baseDescription: 'Ngọn giáo phủ băng.', icon: itemAssets.frostbiteSpear, baseStats: { hp: 1500, atk: 140, def: 120 }, baseMaxLevel: 15 },
    { baseId: 5000, name: 'Giant\'s Hammer', type: 'weapon', baseDescription: 'Cây búa khổng lồ, sức mạnh vô song.', icon: itemAssets.giantsHammer, baseStats: { hp: 2500, atk: 250, def: 100 }, baseMaxLevel: 20 },
    { baseId: 6000, name: 'Forest Staff', type: 'weapon', baseDescription: 'Cây trượng làm từ gỗ rừng cổ thụ.', icon: itemAssets.forestStaff, baseStats: { hp: 1200, atk: 200, def: 60 }, baseMaxLevel: 15 },
    { baseId: 7000, name: 'Hawkeye Bow', type: 'weapon', baseDescription: 'Cung của xạ thủ đại bàng, tầm bắn xa và độ chính xác cao.', icon: itemAssets.hawkeyeBow, baseStats: { hp: 1400, atk: 160, def: 70 }, baseMaxLevel: 15 },
    { baseId: 8000, name: 'Assassin\'s Dagger', type: 'weapon', baseDescription: 'Con dao găm của sát thủ, nhanh và chí mạng.', icon: itemAssets.assassinsDagger, baseStats: { hp: 1100, atk: 190, def: 55 }, baseMaxLevel: 15 },
    { baseId: 9000, name: 'Nomad Staff', type: 'weapon', baseDescription: 'Cây trượng của dân du mục, chứa đựng ma thuật cơ bản.', icon: itemAssets.nomadStaff, baseStats: { hp: 900, atk: 120, def: 40 }, baseMaxLevel: 10 },
    { baseId: 10000, name: 'Nomad Bow', type: 'weapon', baseDescription: 'Cây cung của dân du mục, đáng tin cậy trên đường đi.', icon: itemAssets.nomadBow, baseStats: { hp: 1100, atk: 110, def: 45 }, baseMaxLevel: 10 },
    { baseId: 11000, name: 'Mystic Staff', type: 'weapon', baseDescription: 'Cây trượng ẩn chứa những bí thuật cổ xưa, khuếch đại sức mạnh phép thuật.', icon: itemAssets.mysticStaff, baseStats: { hp: 1300, atk: 220, def: 65 }, baseMaxLevel: 15 },
    { baseId: 12000, name: 'Sacrificial Sword', type: 'weapon', baseDescription: 'Thanh kiếm hiến tế, đánh đổi sinh mệnh để lấy sức mạnh vô song.', icon: itemAssets.sacrificialSword, baseStats: { hp: 800, atk: 260, def: 50 }, baseMaxLevel: 20 },
    { baseId: 13000, name: 'Leviathan Axe', type: 'weapon', baseDescription: 'Chiếc rìu được chế tác từ vảy của thủy quái Leviathan, mang sức nặng của đại dương.', icon: itemAssets.leviathanAxe, baseStats: { hp: 2800, atk: 270, def: 120 }, baseMaxLevel: 20 },
    { baseId: 14000, name: 'Angel Bow', type: 'weapon', baseDescription: 'Cây cung được ban phước bởi các thiên thần, bắn ra những mũi tên ánh sáng.', icon: itemAssets.angelBow, baseStats: { hp: 1600, atk: 240, def: 80 }, baseMaxLevel: 20 },
    { baseId: 15000, name: 'Shadow Scythe', type: 'weapon', baseDescription: 'Lưỡi hái của bóng tối, gặt hái linh hồn kẻ địch với mỗi nhát chém.', icon: itemAssets.shadowScythe, baseStats: { hp: 1500, atk: 280, def: 70 }, baseMaxLevel: 20 },
    { baseId: 16000, name: 'Demon Knight\'s Spear', type: 'weapon', baseDescription: 'Ngọn giáo của kỵ sĩ quỷ, có khả năng xuyên thủng mọi lớp giáp.', icon: itemAssets.demonKnightsSpear, baseStats: { hp: 2200, atk: 250, def: 180 }, baseMaxLevel: 20 },
    { baseId: 17000, name: 'Divine Quarterstaff', type: 'weapon', baseDescription: 'Cây trường côn thần thánh, tỏa ra năng lượng thuần khiết có thể thanh tẩy mọi thứ.', icon: itemAssets.divineQuarterstaff, baseStats: { hp: 2000, atk: 300, def: 120 }, baseMaxLevel: 25 },
    { baseId: 18000, name: 'Meteor Staff', type: 'weapon', baseDescription: 'Cây trượng có khả năng triệu hồi những cơn mưa thiên thạch hủy diệt.', icon: itemAssets.meteorStaff, baseStats: { hp: 1800, atk: 330, def: 90 }, baseMaxLevel: 25 },
    { baseId: 19000, name: 'Chaos Staff', type: 'weapon', baseDescription: 'Cây trượng chứa đựng sức mạnh hỗn mang, không thể kiểm soát và không thể đoán trước.', icon: itemAssets.chaosStaff, baseStats: { hp: 2200, atk: 380, def: 100 }, baseMaxLevel: 25 },
    { baseId: 20000, name: 'Demon King\'s Daggers', type: 'weapon', baseDescription: 'Cặp dao găm của Quỷ Vương, mỗi nhát chém đều mang theo sự hủy diệt.', icon: itemAssets.demonKingsDaggers, baseStats: { hp: 1300, atk: 320, def: 60 }, baseMaxLevel: 25 },
    { baseId: 21000, name: 'Demon King\'s Longsword', type: 'weapon', baseDescription: 'Thanh trường kiếm của Quỷ Vương, thấm đẫm quyền năng hắc ám.', icon: itemAssets.demonKingsLongsword, baseStats: { hp: 3000, atk: 350, def: 150 }, baseMaxLevel: 25 },
    { baseId: 22000, name: 'Dragon\'s Breath Armor', type: 'armor', baseDescription: 'Bộ giáp được rèn từ vảy rồng, mang trong mình hơi thở của lửa.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/dragon\'s-breath-armor.webp', baseStats: { hp: 3500, atk: 50, def: 200 }, baseMaxLevel: 30 },
    { baseId: 23000, name: 'Revival Cape', type: 'armor', baseDescription: 'Chiếc áo choàng chứa đựng sức mạnh phục sinh, có khả năng bảo vệ người mặc khỏi cái chết.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/revival-cape.webp', baseStats: { hp: 4000, atk: 0, def: 250 }, baseMaxLevel: 30 },
    { baseId: 24000, name: 'Hard Armor', type: 'armor', baseDescription: 'Áo giáp cứng cáp, cung cấp khả năng phòng thủ vượt trội.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/hard-armor.webp', baseStats: { hp: 1500, atk: 10, def: 150 }, baseMaxLevel: 20 },
    { baseId: 25000, name: 'Warden\'s Mail', type: 'armor', baseDescription: 'Giáp của người cai ngục, nổi tiếng với khả năng chống chịu bền bỉ.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/warden-mail.webp', baseStats: { hp: 2500, atk: 5, def: 220 }, baseMaxLevel: 25 },
    { 
        baseId: 26000, 
        name: 'Excalibur', 
        type: 'weapon', 
        baseDescription: 'Thanh thánh kiếm huyền thoại trong truyền thuyết, tỏa ra ánh sáng rực rỡ và sức mạnh áp đảo mọi kẻ thù.', 
        icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/excalibur.webp', 
        baseStats: { hp: 3500, atk: 450, def: 200 }, 
        baseMaxLevel: 30 
    },
    { 
        baseId: 27000, 
        name: 'Masamune', 
        type: 'weapon', 
        baseDescription: 'Thanh katana huyền thoại được rèn bởi thợ rèn Masamune, nổi tiếng với độ sắc bén cực hạn và sự thanh tao trong từng đường kiếm.', 
        icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/masamune.webp', 
        baseStats: { hp: 3200, atk: 480, def: 180 }, 
        baseMaxLevel: 30 
    },
    { 
        baseId: 28000, 
        name: 'Muramasa', 
        type: 'weapon', 
        baseDescription: 'Thanh quỷ kiếm khát máu được rèn bởi Muramasa.', 
        icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/equipment/muramasa.webp', 
        baseStats: { hp: 2800, atk: 550, def: 120 }, 
        baseMaxLevel: 30 
    },
];

const blueprintByBaseId = new Map<number, ItemBlueprint>(itemBlueprints.map(bp => [bp.baseId, bp]));
const blueprintByName = new Map<string, ItemBlueprint>(itemBlueprints.map(bp => [bp.name, bp]));


// --- NÂNG CẤP HỆ THỐNG RANDOM ---

const archetypes = [
    { name: 'Balanced',   weights: { hp: {min: 0.8, max: 1.2}, atk: {min: 0.8, max: 1.2}, def: {min: 0.8, max: 1.2} } }, 
    { name: 'Sturdy',     weights: { hp: {min: 1.5, max: 2.0}, atk: {min: 0.5, max: 0.8}, def: {min: 1.3, max: 1.8} } }, 
    { name: 'GlassCannon',weights: { hp: {min: 0.5, max: 0.8}, atk: {min: 1.6, max: 2.2}, def: {min: 0.4, max: 0.7} } }, 
    { name: 'Bruiser',    weights: { hp: {min: 1.2, max: 1.6}, atk: {min: 1.1, max: 1.5}, def: {min: 0.6, max: 0.9} } }, 
];

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

export function generateItemDefinition(blueprint: ItemBlueprint, rank: ItemRank, isRandomizedCraft: boolean = false): ItemDefinition {
    const modifier = rankModifiers[rank];
    const rankIndex = RARITY_ORDER.indexOf(rank);

    let workingStats: { [key: string]: number };

    if (blueprint.type === 'weapon' && isRandomizedCraft) {
        const selectedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        const base = blueprint.baseStats;

        workingStats = {
            hp:  Math.round((base.hp || 0)  * randomInRange(selectedArchetype.weights.hp.min,  selectedArchetype.weights.hp.max)),
            atk: Math.round((base.atk || 0) * randomInRange(selectedArchetype.weights.atk.min, selectedArchetype.weights.atk.max)),
            def: Math.round((base.def || 0) * randomInRange(selectedArchetype.weights.def.min, selectedArchetype.weights.def.max)),
        };

    } else {
        workingStats = { ...blueprint.baseStats };
    }

    const finalStats: { [key: string]: any } = {};
    for (const key in workingStats) {
        finalStats[key] = Math.round(workingStats[key] * modifier.statMultiplier);
    }
    
    if (blueprint.type !== 'weapon' && modifier.specialStats) {
        Object.assign(finalStats, modifier.specialStats);
    }

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


// --- DATABASE TRUNG TÂM VÀ HÀM TRUY CẬP ---

export const itemDatabase = new Map<number, ItemDefinition>([
    [26, { id: 26, name: 'Lá cây hiếm', type: 'material', rarity: 'D', description: 'Lá cây dùng để chế thuốc.', icon: '🍃' }],
    [43, { id: 43, name: 'Sắt', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để rèn trang bị.', icon: 'placeholder' }],
    [44, { id: 44, name: 'Gỗ', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để chế tạo vật phẩm.', icon: 'placeholder' }],
    [45, { id: 45, name: 'Da', type: 'material', rarity: 'E', description: 'Da động vật, nguyên liệu cơ bản để chế tạo giáp nhẹ.', icon: 'placeholder' }],
    [46, { id: 46, name: 'Vải', type: 'material', rarity: 'E', description: 'Vải thô, dùng để chế tạo quần áo và túi.', icon: 'placeholder' }],
    [47, { id: 47, name: 'Mảnh ghép vũ khí', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một vũ khí ngẫu nhiên.', icon: 'placeholder' }],
    [48, { id: 48, name: 'Mảnh ghép áo giáp', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một áo giáp ngẫu nhiên.', icon: 'placeholder' }],
    [49, { id: 49, name: 'Thạch anh', type: 'material', rarity: 'E', description: 'Thạch anh, một loại nguyên liệu phổ biến.', icon: 'placeholder' }],
    [50, { id: 50, name: 'Ngọc lục bảo', type: 'material', rarity: 'D', description: 'Ngọc lục bảo, nguyên liệu dùng trong chế tác.', icon: 'placeholder' }],
    [51, { id: 51, name: 'Mảnh ghép helmet', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một chiếc mũ ngẫu nhiên.', icon: 'placeholder' }],
    [52, { id: 52, name: 'Mảnh ghép găng tay', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi găng tay ngẫu nhiên.', icon: 'placeholder' }],
    [53, { id: 53, name: 'Mảnh ghép giày', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi giày ngẫu nhiên.', icon: 'placeholder' }],
    [54, { id: 54, name: 'Mảnh ghép trang sức', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một món trang sức ngẫu nhiên.', icon: 'placeholder' }],
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
