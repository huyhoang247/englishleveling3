// --- START OF FILE src/data/item-database.ts ---

import { itemAssets } from '../game-assets.ts';

// Định nghĩa cấu trúc của một item trong database
export interface ItemDefinition {
    id: number;
    name: string;
    type: 'weapon' | 'potion' | 'armor' | 'accessory' | 'material' | 'currency' | 'misc' | 'quest' | 'piece';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    description: string;
    icon: string;
    stats?: { [key: string]: any }; // Chỉ số cơ bản nếu có
    maxLevel?: number; // Cấp độ tối đa nếu có thể nâng cấp
}

// Sử dụng Map để truy cập item bằng ID hiệu quả hơn (O(1))
export const itemDatabase = new Map<number, ItemDefinition>([
    [1, { id: 1, name: 'Kiếm gỗ', type: 'weapon', rarity: 'common', description: 'Một thanh kiếm gỗ cơ bản, thích hợp cho người mới bắt đầu.', stats: { damage: 5, durability: 20 }, icon: itemAssets.kiemGo, maxLevel: 10 }],
    [2, { id: 2, name: 'Thuốc hồi máu', type: 'potion', rarity: 'common', description: 'Hồi phục 50 điểm máu khi sử dụng.', stats: { healing: 50 }, icon: '🧪' }],
    [3, { id: 3, name: 'Áo giáp da', type: 'armor', rarity: 'common', description: 'Áo giáp cơ bản, cung cấp một chút bảo vệ.', stats: { defense: 10 }, icon: '🥋' }],
    [4, { id: 4, name: 'Kiếm sắt', type: 'weapon', rarity: 'uncommon', description: 'Thanh kiếm sắt sắc bén, gây sát thương vật lý cao.', stats: { damage: 15, durability: 50 }, icon: itemAssets.kiemSat, maxLevel: 20 }],
    [5, { id: 5, name: 'Thuốc hồi năng lượng', type: 'potion', rarity: 'uncommon', description: 'Hồi phục 75 điểm năng lượng khi sử dụng.', stats: { energyRestore: 75 }, icon: '⚡' }],
    [6, { id: 6, name: 'Nhẫn ma thuật', type: 'accessory', rarity: 'rare', description: 'Tăng 15% sức mạnh phép thuật cho người sử dụng.', stats: { magicBoost: 15, intelligence: 5 }, icon: '💍' }],
    [7, { id: 7, name: 'Bùa hộ mệnh', type: 'accessory', rarity: 'rare', description: 'Tự động hồi sinh một lần khi HP về 0.', stats: { resurrection: 1 }, icon: '🔮' }],
    [8, { id: 8, name: 'Kiếm rồng', type: 'weapon', rarity: 'epic', description: 'Vũ khí huyền thoại được rèn từ xương rồng, gây thêm sát thương hỏa.', stats: { damage: 45, fireDamage: 20, durability: 100 }, icon: '🔥', maxLevel: 50 }],
    [9, { id: 9, name: 'Vàng', type: 'currency', rarity: 'common', description: 'Tiền tệ trong game.', icon: '💰' }],
    [10, { id: 10, name: 'Giáp huyền thoại', type: 'armor', rarity: 'legendary', description: 'Giáp được chế tác từ vảy của rồng cổ đại.', stats: { defense: 50, magicResist: 30 }, icon: '🛡️' }],
    [11, { id: 11, name: 'Găng tay chiến binh', type: 'armor', rarity: 'uncommon', description: 'Tăng sức mạnh tấn công cận chiến.', stats: { strength: 5, attackSpeed: 10 }, icon: '🧤' }],
    [12, { id: 12, name: 'Mũ phù thủy', type: 'armor', rarity: 'rare', description: 'Mũ ma thuật tăng cường khả năng phép thuật.', stats: { intelligence: 15, manaRegen: 5 }, icon: '🎩' }],
    [13, { id: 13, name: 'Cung gỗ', type: 'weapon', rarity: 'common', description: 'Cung gỗ cơ bản cho người mới.', stats: { damage: 7, range: 20 }, icon: '🏹', maxLevel: 15 }],
    [14, { id: 14, name: 'Rìu chiến', type: 'weapon', rarity: 'uncommon', description: 'Rìu chiến nặng, gây sát thương cao.', stats: { damage: 20 }, icon: '🪓', maxLevel: 25 }],
    [17, { id: 17, name: 'Đá cường hóa', type: 'material', rarity: 'common', description: 'Dùng để nâng cấp vũ khí và giáp.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000002bd461f7946aae1d61399a56.png' }],
    [20, { id: 20, name: 'Sách cổ', type: 'misc', rarity: 'common', description: 'Một cuốn sách cũ chứa đựng kiến thức cổ xưa.', icon: '📚' }],
    [24, { id: 24, name: 'Bình mana lớn', type: 'potion', rarity: 'common', description: 'Hồi phục 100 điểm mana.', stats: { manaRestore: 100 }, icon: '💧' }],
    [26, { id: 26, name: 'Lá cây hiếm', type: 'material', rarity: 'uncommon', description: 'Lá cây dùng để chế thuốc.', icon: '🍃' }],
    [27, { id: 27, name: 'Cánh thiên thần', type: 'material', rarity: 'legendary', description: 'Nguyên liệu cực hiếm từ thiên thần.', icon: '🕊️' }],
    [28, { id: 28, name: 'Mảnh vỡ cổ', type: 'misc', rarity: 'common', description: 'Mảnh vỡ từ một di tích cổ.', icon: '🏺' }],
    [29, { id: 29, name: 'Nước thánh', type: 'potion', rarity: 'rare', description: 'Thanh tẩy các hiệu ứng tiêu cực.', stats: { cleanse: true }, icon: '✨' }],
    [30, { id: 30, name: 'Giày tốc độ', type: 'armor', rarity: 'uncommon', description: 'Tăng tốc độ di chuyển.', stats: { speed: 10 }, icon: '👟' }],
    [34, { id: 34, name: 'Dây thừng', type: 'misc', rarity: 'common', description: 'Dụng cụ hữu ích.', icon: '🔗' }],
    [35, { id: 35, name: 'Hộp nhạc', type: 'misc', rarity: 'rare', description: 'Phát ra giai điệu êm dịu.', icon: '🎶' }],
    [36, { id: 36, name: 'Kính lúp', type: 'misc', rarity: 'uncommon', description: 'Giúp nhìn rõ hơn.', icon: '🔎' }],
    [37, { id: 37, name: 'Bản đồ kho báu', type: 'quest', rarity: 'epic', description: 'Dẫn đến kho báu lớn.', icon: '🧭' }],
    [38, { id: 38, name: 'Nước tăng lực', type: 'potion', rarity: 'uncommon', description: 'Tăng sức mạnh tạm thời.', stats: { strengthBoost: 10, duration: 30 }, icon: '⚡' }],
    [39, { id: 39, name: 'Vòng cổ may mắn', type: 'accessory', rarity: 'rare', description: 'Tăng cơ hội tìm thấy vật phẩm hiếm.', stats: { luck: 5 }, icon: '🍀' }],
    [40, { id: 40, name: 'Đá dịch chuyển', type: 'misc', rarity: 'epic', description: 'Dịch chuyển đến địa điểm đã đánh dấu.', icon: '🪨' }],
    [41, { id: 41, name: 'Song Kiếm', type: 'weapon', rarity: 'epic', description: 'Cặp kiếm đôi sắc bén, cho phép tấn công nhanh và liên tục.', stats: { damage: 30, attackSpeed: 15, durability: 80 }, icon: itemAssets.songKiem, maxLevel: 30 }],
    [43, { id: 43, name: 'Sắt', type: 'material', rarity: 'common', description: 'Nguyên liệu cơ bản để rèn trang bị.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000f5ac61f79336c38977abbfa5.png' }],
    [44, { id: 44, name: 'Gỗ', type: 'material', rarity: 'common', description: 'Nguyên liệu cơ bản để chế tạo vật phẩm.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000004f0461f793d26e238db690f7.png' }],
    [45, { id: 45, name: 'Da', type: 'material', rarity: 'common', description: 'Da động vật, nguyên liệu cơ bản để chế tạo giáp nhẹ.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_000000006f30623086e0c4e366dface0.png' }],
    [46, { id: 46, name: 'Vải', type: 'material', rarity: 'common', description: 'Vải thô, dùng để chế tạo quần áo và túi.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000863c6230a96cb9487701c9c8.png' }],
    [47, { id: 47, name: 'Mảnh ghép vũ khí', type: 'piece', rarity: 'common', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một vũ khí ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%207%2C%202025%2C%2001_37_49%20PM.png' }],
    [48, { id: 48, name: 'Mảnh ghép áo giáp', type: 'piece', rarity: 'common', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một áo giáp ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_19_04%20PM.png' }],
    [49, { id: 49, name: 'Thạch anh', type: 'material', rarity: 'common', description: 'Thạch anh, một loại nguyên liệu phổ biến.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_51_03%20PM.png' }],
    [50, { id: 50, name: 'Ngọc lục bảo', type: 'material', rarity: 'common', description: 'Ngọc lục bảo, nguyên liệu dùng trong chế tác.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_53_08%20PM.png' }],
    [51, { id: 51, name: 'Mảnh ghép helmet', type: 'piece', rarity: 'common', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một chiếc mũ ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_00_18%20PM.png' }],
    [52, { id: 52, name: 'Mảnh ghép găng tay', type: 'piece', rarity: 'common', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi găng tay ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_02_27%20PM.png' }],
    [53, { id: 53, name: 'Mảnh ghép giày', type: 'piece', rarity: 'common', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một đôi giày ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_08_08%20PM.png' }],
    [54, { id: 54, name: 'Mảnh ghép trang sức', type: 'piece', rarity: 'common', description: 'Tập hợp đủ mảnh ghép có thể tạo ra một món trang sức ngẫu nhiên.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_10_49%20PM.png' }],
    // Lưu ý: Kiếm gỗ có 2 phiên bản khác nhau trong data gốc (id 1 và 42)
    // Để giữ nguyên logic, ta có thể tạo một item mới hoặc xử lý nâng cấp riêng.
    // Ở đây, tôi sẽ tạo một item mới với id 42 để đơn giản hóa.
    [42, { id: 42, name: 'Kiếm gỗ (+1)', type: 'weapon', rarity: 'common', description: 'Một thanh kiếm gỗ đã được nâng cấp nhẹ.', stats: { damage: 7, durability: 25 }, icon: itemAssets.kiemGo, maxLevel: 10 }],

]);

// --- END OF FILE src/data/item-database.ts ---
