// --- START OF FILE src/data/item-database.ts ---

import { itemAssets } from '../game-assets.ts';

// THAY ĐỔI: Định nghĩa kiểu ItemRank mới để sử dụng trong toàn bộ hệ thống.
export type ItemRank = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';

// THAY ĐỔI: Cập nhật cấu trúc ItemDefinition để sử dụng ItemRank mới.
export interface ItemDefinition {
    id: number;
    name: string;
    type: 'weapon' | 'potion' | 'armor' | 'accessory' | 'material' | 'currency' | 'misc' | 'quest' | 'piece';
    rarity: ItemRank; // Sử dụng hệ thống Rank mới
    description: string;
    icon: string;
    stats?: { [key: string]: any }; 
    maxLevel?: number;
}

// THAY ĐỔI: Cập nhật toàn bộ database với hệ thống Rank mới.
// Logic ánh xạ: common -> E, uncommon -> D, rare -> B, epic -> A/S, legendary -> SR/SSR
export const itemDatabase = new Map<number, ItemDefinition>([
    [1, { id: 1, name: 'Kiếm gỗ', type: 'weapon', rarity: 'E', description: 'Một thanh kiếm gỗ cơ bản, thích hợp cho người mới bắt đầu.', stats: { damage: 5, durability: 20 }, icon: itemAssets.kiemGo, maxLevel: 10 }],
    [2, { id: 2, name: 'Thuốc hồi máu', type: 'potion', rarity: 'E', description: 'Hồi phục 50 điểm máu khi sử dụng.', stats: { healing: 50 }, icon: '🧪' }],
    [3, { id: 3, name: 'Áo giáp da', type: 'armor', rarity: 'E', description: 'Áo giáp cơ bản, cung cấp một chút bảo vệ.', stats: { defense: 10 }, icon: '🥋' }],
    [4, { id: 4, name: 'Kiếm sắt', type: 'weapon', rarity: 'D', description: 'Thanh kiếm sắt sắc bén, gây sát thương vật lý cao.', stats: { damage: 15, durability: 50 }, icon: itemAssets.kiemSat, maxLevel: 20 }],
    [5, { id: 5, name: 'Thuốc hồi năng lượng', type: 'potion', rarity: 'D', description: 'Hồi phục 75 điểm năng lượng khi sử dụng.', stats: { energyRestore: 75 }, icon: '⚡' }],
    [6, { id: 6, name: 'Nhẫn ma thuật', type: 'accessory', rarity: 'B', description: 'Tăng 15% sức mạnh phép thuật cho người sử dụng.', stats: { magicBoost: 15, intelligence: 5 }, icon: '💍' }],
    [7, { id: 7, name: 'Bùa hộ mệnh', type: 'accessory', rarity: 'B', description: 'Tự động hồi sinh một lần khi HP về 0.', stats: { resurrection: 1 }, icon: '🔮' }],
    [8, { id: 8, name: 'Kiếm rồng', type: 'weapon', rarity: 'S', description: 'Vũ khí huyền thoại được rèn từ xương rồng, gây thêm sát thương hỏa.', stats: { damage: 45, fireDamage: 20, durability: 100 }, icon: '🔥', maxLevel: 50 }],
    [9, { id: 9, name: 'Vàng', type: 'currency', rarity: 'E', description: 'Tiền tệ trong game.', icon: '💰' }],
    [10, { id: 10, name: 'Giáp Thần Thoại', type: 'armor', rarity: 'SSR', description: 'Giáp được chế tác từ vảy của rồng cổ đại, tỏa ra hào quang thần thánh.', stats: { defense: 70, magicResist: 45, strength: 10 }, icon: '🛡️' }],
    [11, { id: 11, name: 'Găng tay chiến binh', type: 'armor', rarity: 'D', description: 'Tăng sức mạnh tấn công cận chiến.', stats: { strength: 5, attackSpeed: 10 }, icon: '🧤' }],
    [12, { id: 12, name: 'Mũ phù thủy', type: 'armor', rarity: 'B', description: 'Mũ ma thuật tăng cường khả năng phép thuật.', stats: { intelligence: 15, manaRegen: 5 }, icon: '🎩' }],
    [13, { id: 13, name: 'Cung gỗ', type: 'weapon', rarity: 'E', description: 'Cung gỗ cơ bản cho người mới.', stats: { damage: 7, range: 20 }, icon: '🏹', maxLevel: 15 }],
    [14, { id: 14, name: 'Rìu chiến', type: 'weapon', rarity: 'D', description: 'Rìu chiến nặng, gây sát thương cao.', stats: { damage: 20 }, icon: '🪓', maxLevel: 25 }],
    [17, { id: 17, name: 'Đá cường hóa', type: 'material', rarity: 'E', description: 'Dùng để nâng cấp vũ khí và giáp.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000002bd461f7946aae1d61399a56.png' }],
    [20, { id: 20, name: 'Sách cổ', type: 'misc', rarity: 'E', description: 'Một cuốn sách cũ chứa đựng kiến thức cổ xưa.', icon: '📚' }],
    [24, { id: 24, name: 'Bình mana lớn', type: 'potion', rarity: 'E', description: 'Hồi phục 100 điểm mana.', stats: { manaRestore: 100 }, icon: '💧' }],
    [26, { id: 26, name: 'Lá cây hiếm', type: 'material', rarity: 'D', description: 'Lá cây dùng để chế thuốc.', icon: '🍃' }],
    [27, { id: 27, name: 'Cánh Thiên Thần', type: 'material', rarity: 'SR', description: 'Nguyên liệu cực hiếm rơi ra từ các thực thể thần thánh.', icon: '🕊️' }],
    [28, { id: 28, name: 'Mảnh vỡ cổ', type: 'misc', rarity: 'E', description: 'Mảnh vỡ từ một di tích cổ.', icon: '🏺' }],
    [29, { id: 29, name: 'Nước thánh', type: 'potion', rarity: 'B', description: 'Thanh tẩy các hiệu ứng tiêu cực.', stats: { cleanse: true }, icon: '✨' }],
    [30, { id: 30, name: 'Giày tốc độ', type: 'armor', rarity: 'D', description: 'Tăng tốc độ di chuyển.', stats: { speed: 10 }, icon: '👟' }],
    [34, { id: 34, name: 'Dây thừng', type: 'misc', rarity: 'E', description: 'Dụng cụ hữu ích.', icon: '🔗' }],
    [35, { id: 35, name: 'Hộp nhạc', type: 'misc', rarity: 'B', description: 'Phát ra giai điệu êm dịu.', icon: '🎶' }],
    [36, { id: 36, name: 'Kính lúp', type: 'misc', rarity: 'D', description: 'Giúp nhìn rõ hơn.', icon: '🔎' }],
    [37, { id: 37, name: 'Bản đồ kho báu', type: 'quest', rarity: 'A', description: 'Dẫn đến kho báu lớn.', icon: '🧭' }],
    [38, { id: 38, name: 'Nước tăng lực', type: 'potion', rarity: 'D', description: 'Tăng sức mạnh tạm thời.', stats: { strengthBoost: 10, duration: 30 }, icon: '⚡' }],
    [39, { id: 39, name: 'Vòng cổ may mắn', type: 'accessory', rarity: 'B', description: 'Tăng cơ hội tìm thấy vật phẩm hiếm.', stats: { luck: 5 }, icon: '🍀' }],
    [40, { id: 40, name: 'Đá dịch chuyển', type: 'misc', rarity: 'A', description: 'Dịch chuyển đến địa điểm đã đánh dấu.', icon: '🪨' }],
    [41, { id: 41, name: 'Song Kiếm Bão Táp', type: 'weapon', rarity: 'S', description: 'Cặp kiếm đôi sắc bén, cho phép tấn công nhanh và liên tục như vũ bão.', stats: { damage: 35, attackSpeed: 20, durability: 90 }, icon: itemAssets.songKiem, maxLevel: 40 }],
    [43, { id: 43, name: 'Sắt', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để rèn trang bị.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000f5ac61f79336c38977abbfa5.png' }],
    [44, { id: 44, name: 'Gỗ', type: 'material', rarity: 'E', description: 'Nguyên liệu cơ bản để chế tạo vật phẩm.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000004f0461f793d26e238db690f7.png' }],
    [45, { id: 45, name: 'Da', type: 'material', rarity: 'E', description: 'Da động vật, nguyên liệu cơ bản để chế tạo giáp nhẹ.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000006f30623086e0c4e366dface0.png' }],
    [46, { id: 46, name: 'Vải', type: 'material', rarity: 'E', description: 'Vải thô, dùng để chế tạo quần áo và túi.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000863c6230a96cb9487701c9c8.png' }],
    [47, { id: 47, name: 'Mảnh ghép vũ khí', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một vũ khí ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%207%2C%202025%2C%2001_37_49%20PM.png' }],
    [48, { id: 48, name: 'Mảnh ghép áo giáp', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một áo giáp ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_19_04%20PM.png' }],
    [49, { id: 49, name: 'Thạch anh', type: 'material', rarity: 'E', description: 'Thạch anh, một loại nguyên liệu phổ biến.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_51_03%20PM.png' }],
    [50, { id: 50, name: 'Ngọc lục bảo', type: 'material', rarity: 'D', description: 'Ngọc lục bảo, nguyên liệu dùng trong chế tác.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_53_08%20PM.png' }],
    [51, { id: 51, name: 'Mảnh ghép helmet', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một chiếc mũ ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_00_18%20PM.png' }],
    [52, { id: 52, name: 'Mảnh ghép găng tay', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi găng tay ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_02_27%20PM.png' }],
    [53, { id: 53, name: 'Mảnh ghép giày', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi giày ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_08_08%20PM.png' }],
    [54, { id: 54, name: 'Mảnh ghép trang sức', type: 'piece', rarity: 'E', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một món trang sức ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_10_49%20PM.png' }],
    [55, { id: 55, name: 'Nomad Sword', type: 'weapon', rarity: 'E', description: 'Thanh kiếm của dân du mục, thích hợp cho những chuyến đi dài.', stats: { damage: 8, durability: 30 }, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000004f0c62309cbdcc6fea779fc6.png', maxLevel: 10 }],
    [56, { id: 56, name: 'Frostbite Spear', type: 'weapon', rarity: 'D', description: 'Ngọn giáo phủ băng, gây sát thương kèm hiệu ứng làm chậm.', stats: { damage: 18, durability: 60, coldDamage: 5, slowEffect: 0.15 }, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_0000000062ac62309ccc99e40040f892.png', maxLevel: 20 }],
    [57, { id: 57, name: 'Warrior\'s Blade', type: 'weapon', rarity: 'E', description: 'Lưỡi kiếm tiêu chuẩn của chiến binh, bền bỉ và đáng tin cậy.', stats: { damage: 10, durability: 40 }, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_0000000092d861f895a04893e27da729.png', maxLevel: 15 }],
    [58, { id: 58, name: 'Tunic', type: 'armor', rarity: 'E', description: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', stats: { defense: 8, magicResist: 2 }, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000001ca461f5a50bac51456de65a.png', maxLevel: 10 }],
    [59, { id: 59, name: 'Giant\'s Hammer', type: 'weapon', rarity: 'B', description: 'Cây búa khổng lồ, gây sát thương vật lý cực lớn, yêu cầu sức mạnh khủng khiếp để sử dụng.', stats: { damage: 30, durability: 80, strength: 10 }, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2002_14_23%20PM.png', maxLevel: 30 }],
    [42, { id: 42, name: 'Kiếm gỗ (+1)', type: 'weapon', rarity: 'E', description: 'Một thanh kiếm gỗ đã được nâng cấp nhẹ.', stats: { damage: 7, durability: 25 }, icon: itemAssets.kiemGo, maxLevel: 10 }],
]);

// --- END OF FILE src/data/item-database.ts ---
