// --- START OF FILE item-database.ts (UPDATED) ---

import { itemAssets } from '../game-assets.ts';

// THAY ĐỔI: Định nghĩa kiểu ItemRank mới để sử dụng trong toàn bộ hệ thống.
export type ItemRank = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';

// THAY ĐỔI: Cấu trúc Kỹ năng chỉ còn các thuộc tính cần thiết cho kỹ năng bị động.
export interface SkillDefinition {
    name: string;
    description: string;
    icon: string;
}

// THAY ĐỔI: Cập nhật cấu trúc ItemDefinition để sử dụng ItemRank mới.
export interface ItemDefinition {
    id: number;
    name: string;
    type: 'weapon' | 'potion' | 'armor' | 'accessory' | 'material' | 'currency' | 'misc' | 'quest' | 'piece';
    rarity: ItemRank; // Sử dụng hệ thống Rank mới
    description: string;
    icon: string;
    stats?: { [key: string]: any };
    skills?: SkillDefinition[]; // Kỹ năng cho vũ khí
    maxLevel?: number;
}

// THAY ĐỔI: Cập nhật toàn bộ database với hệ thống Rank mới và tham chiếu từ itemAssets.
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
    [55, { id: 55, name: 'Nomad Sword', type: 'weapon', rarity: 'E', description: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', stats: { damage: 8, durability: 30 }, icon: itemAssets.nomadSword, maxLevel: 10, skills: [] }],
    [56, { 
        id: 56, name: 'Frostbite Spear', type: 'weapon', rarity: 'D', description: 'Ngọn giáo phủ băng, gây sát thương kèm hiệu ứng làm chậm.', 
        stats: { damage: 18, durability: 60, coldDamage: 5, slowEffect: 0.15 }, icon: itemAssets.frostbiteSpear, maxLevel: 20,
        skills: []
    }],
    [57, { id: 57, name: 'Warrior\'s Blade', type: 'weapon', rarity: 'E', description: 'Lưỡi kiếm tiêu chuẩn của chiến binh, bền bỉ và đáng tin cậy.', stats: { damage: 10, durability: 40 }, icon: itemAssets.warriorsBlade, maxLevel: 15, skills: [] }],
    [58, { id: 58, name: 'Tunic', type: 'armor', rarity: 'E', description: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', stats: { defense: 8, magicResist: 2 }, icon: itemAssets.tunic, maxLevel: 10 }],
    [59, { 
        id: 59, name: 'Giant\'s Hammer', type: 'weapon', rarity: 'B', description: 'Cây búa khổng lồ, gây sát thương vật lý cực lớn.', 
        stats: { damage: 30, durability: 80, strength: 10 }, icon: itemAssets.giantsHammer, maxLevel: 30,
        skills: []
    }],
    [60, { 
        id: 60, name: 'Forest Staff', type: 'weapon', rarity: 'B', description: 'Cây trượng làm từ gỗ rừng cổ thụ, tăng cường sức mạnh phép thuật tự nhiên.', 
        stats: { magicDamage: 15, manaRegen: 5, intelligence: 5 }, icon: itemAssets.forestStaff, maxLevel: 25,
        skills: []
    }],
    [61, { 
        id: 61, name: 'Nomad Staff', type: 'weapon', rarity: 'D', description: 'Cây trượng của pháp sư du mục, tăng cường khả năng phép thuật cơ bản.', 
        stats: { magicDamage: 12, manaRegen: 3 }, icon: itemAssets.nomadStaff, maxLevel: 20,
        skills: []
    }],
    [62, { id: 62, name: 'Silverscale Plate', type: 'armor', rarity: 'A', description: 'Tấm giáp vảy bạc, nhẹ nhưng cực kỳ bền bỉ, cung cấp khả năng phòng thủ cao và kháng phép.', stats: { defense: 40, magicResist: 20, durability: 150 }, icon: itemAssets.silverscalePlate, maxLevel: 35 }],
    [63, { 
        id: 63, name: 'Mystic Staff', type: 'weapon', rarity: 'S', description: 'Cây trượng bí ẩn truyền sức mạnh từ các vì sao, tăng cường ma thuật lên một tầm cao mới.', 
        stats: { magicDamage: 35, manaRegen: 10, intelligence: 20, magicCritChance: 0.10 }, icon: itemAssets.mysticStaff, maxLevel: 45,
        skills: []
    }],
    [64, { id: 64, name: 'Hawkeye Bow', type: 'weapon', rarity: 'E', description: 'Cung của xạ thủ đại bàng, tầm bắn xa và độ chính xác cao.', stats: { damage: 10, range: 30, accuracy: 0.85 }, icon: itemAssets.hawkeyeBow, maxLevel: 15, skills: [] }],
    [65, { 
        id: 65, name: 'Nomad Bow', type: 'weapon', rarity: 'B', description: 'Cây cung của dân du mục, cân bằng giữa sức mạnh và tính linh hoạt.', 
        stats: { damage: 22, range: 40, durability: 70, agility: 8 }, icon: itemAssets.nomadBow, maxLevel: 30,
        skills: []
    }],
    [66, { 
        id: 66, name: 'Warrior\'s Sword', type: 'weapon', rarity: 'A', description: 'Thanh kiếm được rèn cho những chiến binh dũng cảm, cực kỳ sắc bén và bền bỉ.', 
        stats: { damage: 38, durability: 120, strength: 15, critChance: 0.05 }, icon: itemAssets.warriorsSword, maxLevel: 40,
        skills: []
    }],
    [67, { id: 67, name: 'Dragon\'s Breath Armor', type: 'armor', rarity: 'E', description: 'Bộ giáp được làm từ vảy rồng non, cung cấp sự bảo vệ cơ bản và khả năng chống lửa nhẹ.', stats: { defense: 12, magicResist: 3, fireResist: 0.10 }, icon: itemAssets.dragonsBreathArmor, maxLevel: 10 }],
    [68, { id: 68, name: 'Angel Bow', type: 'weapon', rarity: 'B', description: 'Cung của Thiên thần, bắn ra những mũi tên ánh sáng với độ chính xác và sát thương cao.', stats: { damage: 28, range: 45, accuracy: 0.90, lightDamage: 10 }, icon: itemAssets.angelBow, maxLevel: 30, skills: [] }],
    [69, { id: 69, name: 'Demon King\'s Longsword', type: 'weapon', rarity: 'S', description: 'Thanh trường kiếm được rèn từ trái tim của Quỷ Vương, chứa đựng sức mạnh hắc ám khủng khiếp.', stats: { damage: 55, durability: 180, strength: 25, darkDamage: 25, lifeSteal: 0.05 }, icon: itemAssets.demonKingsLongsword, maxLevel: 50, skills: [] }],
    [70, { 
        id: 70, name: 'Shadow Scythe', type: 'weapon', rarity: 'SR', description: 'Lưỡi hái bóng đêm, vũ khí của Thần Chết, gây sát thương lớn và có khả năng hút linh hồn.', 
        stats: { damage: 65, darkDamage: 30, lifeSteal: 0.10, critChance: 0.15 }, icon: itemAssets.shadowScythe, maxLevel: 60,
        skills: []
    }],
    [71, { id: 71, name: 'Demon Knight\'s Spear', type: 'weapon', rarity: 'E', description: 'Ngọn giáo của Kỵ sĩ Quỷ, cung cấp sát thương cơ bản và độ bền tốt.', stats: { damage: 15, durability: 50, strength: 3 }, icon: itemAssets.demonKnightsSpear, maxLevel: 15, skills: [] }],
    [72, { id: 72, name: 'Demon King\'s Daggers', type: 'weapon', rarity: 'A', description: 'Cặp dao găm của Quỷ Vương, cho phép tấn công nhanh và chí mạng cao, tẩm độc gây sát thương theo thời gian.', stats: { damage: 25, attackSpeed: 30, durability: 80, agility: 10, critChance: 0.15, poisonDamage: 5 }, icon: itemAssets.demonKingsDaggers, maxLevel: 35, skills: [] }],
    [73, { id: 73, name: 'Divine Quarterstaff', type: 'weapon', rarity: 'B', description: 'Cây gậy chiến thần thánh, mang sức mạnh của ánh sáng, tăng cường sát thương phép và hồi phục mana.', stats: { magicDamage: 20, manaRegen: 7, durability: 90, lightDamage: 8, intelligence: 10 }, icon: itemAssets.divineQuarterstaff, maxLevel: 30, skills: [] }],
    [74, { id: 74, name: 'Meteor Staff', type: 'weapon', rarity: 'A', description: 'Cây trượng chứa sức mạnh của thiên thạch, có thể triệu hồi mưa sao băng.', stats: { magicDamage: 30, fireDamage: 15, intelligence: 15, durability: 110 }, icon: itemAssets.meteorStaff, maxLevel: 40, skills: [] }],
    [75, {
        id: 75, name: 'Assassin\'s Dagger', type: 'weapon', rarity: 'D', description: 'Con dao găm của sát thủ, sắc bén và dễ dàng ẩn mình trong bóng tối.',
        stats: { damage: 12, attackSpeed: 10, critChance: 0.05, agility: 5 }, icon: itemAssets.assassinsDagger, maxLevel: 20,
        skills: []
    }],
    [76, { id: 76, name: 'Sacrificial Sword', type: 'weapon', rarity: 'B', description: 'Thanh kiếm mang sức mạnh hiến tế, tăng cường sát thương và tỉ lệ chí mạng.', stats: { damage: 28, durability: 90, critChance: 0.10 }, icon: itemAssets.sacrificialSword, maxLevel: 30, skills: [] }],
    [77, { id: 77, name: 'Leviathan Axe', type: 'weapon', rarity: 'A', description: 'Chiếc rìu được rèn từ vảy của Leviathan, mang sức mạnh của băng giá và đại dương sâu thẳm, có thể làm chậm kẻ địch.', stats: { damage: 42, strength: 20, durability: 140, coldDamage: 18, slowEffect: 0.20 }, icon: itemAssets.leviathanAxe, maxLevel: 40, skills: [] }],
    [78, { id: 78, name: 'Chaos Staff', type: 'weapon', rarity: 'D', description: 'Cây trượng hỗn loạn với sức mạnh không thể đoán trước.', stats: { magicDamage: 14, durability: 55 }, icon: itemAssets.chaosStaff, maxLevel: 20, skills: [] }],
]);
