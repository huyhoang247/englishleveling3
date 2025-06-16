// --- START OF FILE item-database.ts (UPDATED) ---

import { itemAssets } from '../game-assets';

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
// LOGIC MỚI: Mọi vũ khí từ hạng D trở lên có 5 kỹ năng bị động, được mở khóa dần theo rank.
export const itemDatabase = new Map<number, ItemDefinition>([
    [1, { id: 1, name: 'Kiếm gỗ', type: 'weapon', rarity: 'E', description: 'Một thanh kiếm gỗ cơ bản, thích hợp cho người mới bắt đầu.', stats: { damage: 5, durability: 20 }, icon: itemAssets.kiemGo, maxLevel: 10, skills: [] }],
    [2, { id: 2, name: 'Hard Armor', type: 'armor', rarity: 'B', description: 'Áo giáp cứng cáp, cung cấp khả năng phòng thủ vượt trội.', stats: { defense: 25, durability: 120 }, icon: itemAssets.hardArmor, maxLevel: 25 }],
    [3, { id: 3, name: 'Áo giáp da', type: 'armor', rarity: 'E', description: 'Áo giáp cơ bản, cung cấp một chút bảo vệ.', stats: { defense: 10 }, icon: '🥋' }],
    [4, { 
        id: 4, name: 'Kiếm sắt', type: 'weapon', rarity: 'D', description: 'Thanh kiếm sắt sắc bén, gây sát thương vật lý cao.', 
        stats: { damage: 15, durability: 50 }, icon: itemAssets.kiemSat, maxLevel: 20, 
        skills: [
            { name: "Lưỡi Kiếm Cứng Cáp", description: "Tăng 5% sát thương cơ bản.", icon: "⚔️" },
            { name: "Xung Kích", description: "Đòn đánh có 10% cơ hội gây thêm 20% sát thương.", icon: "💥" },
            { name: "Phá Giáp", description: "Đòn đánh có 5% cơ hội giảm 10 phòng thủ của mục tiêu trong 5 giây.", icon: "🛡️" },
            { name: "Bền Bỉ", description: "Giảm 15% tốc độ mất độ bền của vũ khí.", icon: "⚙️" },
            { name: "Điểm Yếu", description: "Tăng 2% tỉ lệ chí mạng.", icon: "🎯" }
        ]
    }],
    [5, { id: 5, name: 'Thuốc hồi năng lượng', type: 'potion', rarity: 'D', description: 'Hồi phục 75 điểm năng lượng khi sử dụng.', stats: { energyRestore: 75 }, icon: '⚡' }],
    [6, { id: 6, name: 'Nhẫn ma thuật', type: 'accessory', rarity: 'B', description: 'Tăng 15% sức mạnh phép thuật cho người sử dụng.', stats: { magicBoost: 15, intelligence: 5 }, icon: '💍' }],
    [7, { id: 7, name: 'Bùa hộ mệnh', type: 'accessory', rarity: 'B', description: 'Tự động hồi sinh một lần khi HP về 0.', stats: { resurrection: 1 }, icon: '🔮' }],
    [8, { 
        id: 8, name: 'Kiếm rồng', type: 'weapon', rarity: 'S', description: 'Vũ khí huyền thoại được rèn từ xương rồng, gây thêm sát thương hỏa.', 
        stats: { damage: 45, fireDamage: 20, durability: 100 }, icon: '🔥', maxLevel: 50,
        skills: [
            { name: "Nhiệt Hỏa", description: "Các đòn tấn công gây thêm sát thương Hỏa.", icon: "🔥" },
            { name: "Vảy Rồng Hóa Giáp", description: "Tăng 10% chỉ số phòng thủ khi trang bị.", icon: "🛡️" },
            { name: "Lửa Phẫn Nộ", description: "Đòn đánh có 15% cơ hội thiêu đốt kẻ địch, gây sát thương theo thời gian.", icon: "♨️" },
            { name: "Hơi Thở Của Rồng", description: "Mỗi 10 giây, tự động phát ra một sóng nhiệt gây sát thương cho kẻ địch xung quanh.", icon: "🐲" },
            { name: "Uy Quyền Của Rồng", description: "Đòn đánh có 5% cơ hội làm kẻ địch hoảng sợ, giảm 10% sát thương của chúng.", icon: "👑" }
        ]
    }],
    [9, { id: 9, name: 'Vàng', type: 'currency', rarity: 'E', description: 'Tiền tệ trong game.', icon: '💰' }],
    [10, { id: 10, name: 'Giáp Thần Thoại', type: 'armor', rarity: 'SSR', description: 'Giáp được chế tác từ vảy của rồng cổ đại, tỏa ra hào quang thần thánh.', stats: { defense: 70, magicResist: 45, strength: 10 }, icon: '🛡️' }],
    [11, { id: 11, name: 'Găng tay chiến binh', type: 'armor', rarity: 'D', description: 'Tăng sức mạnh tấn công cận chiến.', stats: { strength: 5, attackSpeed: 10 }, icon: '🧤' }],
    [12, { id: 12, name: 'Mũ phù thủy', type: 'armor', rarity: 'B', description: 'Mũ ma thuật tăng cường khả năng phép thuật.', stats: { intelligence: 15, manaRegen: 5 }, icon: '🎩' }],
    [13, { id: 13, name: 'Cung gỗ', type: 'weapon', rarity: 'E', description: 'Cung gỗ cơ bản cho người mới.', stats: { damage: 7, range: 20 }, icon: '🏹', maxLevel: 15, skills: [] }],
    [14, { 
        id: 14, name: 'Rìu chiến', type: 'weapon', rarity: 'D', description: 'Rìu chiến nặng, gây sát thương cao.', 
        stats: { damage: 20 }, icon: '🪓', maxLevel: 25,
        skills: [
            { name: "Bổ Xé", description: "Đòn đánh có 10% cơ hội gây hiệu ứng chảy máu.", icon: "🩸" },
            { name: "Sức Mạnh Bộc Phá", description: "Tăng 5 Sức mạnh.", icon: "💪" },
            { name: "Đòn Chí Mạng", description: "Tăng 10% sát thương chí mạng.", icon: "💥" },
            { name: "Nghiền Nát", description: "Đòn đánh bỏ qua 5% giáp của đối phương.", icon: "🔨" },
            { name: "Cuồng Nộ", description: "Khi máu dưới 30%, tăng 10% sát thương.", icon: "😡" }
        ]
    }],
    [17, { id: 17, name: 'Đá cường hóa', type: 'material', rarity: 'E', description: 'Dùng để nâng cấp vũ khí và giáp.', icon: itemAssets.daCuongHoa }],
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
    [41, { 
        id: 41, name: 'Song Kiếm Bão Táp', type: 'weapon', rarity: 'S', description: 'Cặp kiếm đôi sắc bén, cho phép tấn công nhanh và liên tục như vũ bão.', 
        stats: { damage: 35, attackSpeed: 20, durability: 90 }, icon: itemAssets.songKiem, maxLevel: 40,
        skills: [
            { name: "Song Kiếm Hợp Bích", description: "Đòn đánh thường có 15% cơ hội tấn công 2 lần.", icon: "⚔️" },
            { name: "Gió Lốc", description: "Tăng 5% tốc độ tấn công.", icon: "🌪️" },
            { name: "Né Tránh", description: "Tăng 5% tỉ lệ né đòn.", icon: "💨" },
            { name: "Bão Tố", description: "Khi máu dưới 40%, tốc độ tấn công tăng thêm 15%.", icon: "⚡" },
            { name: "Vũ Điệu Cuồng Phong", description: "Mỗi đòn tấn công thứ 5 sẽ tạo ra một nhát chém gió, gây sát thương lan.", icon: "🌀" }
        ]
    }],
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
        skills: [
            { name: "Giá Lạnh", description: "Đòn đánh có 15% cơ hội làm chậm tốc độ di chuyển của kẻ địch.", icon: "❄️" },
            { name: "Đâm Xuyên", description: "Tăng 5% sát thương chí mạng.", icon: "➡️" },
            { name: "Ngọn Giáo Băng", description: "Tăng thêm sát thương băng.", icon: "🧊" },
            { name: "Tê Cóng", description: "Đòn đánh chí mạng sẽ làm đóng băng mục tiêu trong 0.5 giây.", icon: "🥶" },
            { name: "Bão Tuyết", description: "Mỗi 15 giây, tạo ra một vùng giá rét xung quanh, làm chậm mọi kẻ địch bên trong.", icon: "🌨️" }
        ]
    }],
    [57, { id: 57, name: 'Warrior\'s Blade', type: 'weapon', rarity: 'E', description: 'Lưỡi kiếm tiêu chuẩn của chiến binh, bền bỉ và đáng tin cậy.', stats: { damage: 10, durability: 40 }, icon: itemAssets.warriorsBlade, maxLevel: 15, skills: [] }],
    [58, { id: 58, name: 'Tunic', type: 'armor', rarity: 'E', description: 'Một chiếc áo tunic đơn giản, cung cấp sự bảo vệ cơ bản.', stats: { defense: 8, magicResist: 2 }, icon: itemAssets.tunic, maxLevel: 10 }],
    [59, { 
        id: 59, name: 'Giant\'s Hammer', type: 'weapon', rarity: 'B', description: 'Cây búa khổng lồ, gây sát thương vật lý cực lớn.', 
        stats: { damage: 30, durability: 80, strength: 10 }, icon: itemAssets.giantsHammer, maxLevel: 30,
        skills: [
            { name: "Đập Choáng", description: "Đòn đánh có 10% cơ hội làm choáng mục tiêu trong 1 giây.", icon: "💫" },
            { name: "Chấn Động", description: "Đòn đánh lan ra 10% sát thương cho các kẻ địch bên cạnh.", icon: "🌍" },
            { name: "Sức Mạnh Khổng Lồ", description: "Tăng thêm Sức mạnh.", icon: "🦍" },
            { name: "Nghiền Xương", description: "Tăng 15% sát thương chí mạng.", icon: "🦴" },
            { name: "Thách Thức", description: "Khi máu trên 80%, tăng 10% sát thương.", icon: "🏋️" }
        ]
    }],
    [60, { 
        id: 60, name: 'Forest Staff', type: 'weapon', rarity: 'B', description: 'Cây trượng làm từ gỗ rừng cổ thụ, tăng cường sức mạnh phép thuật tự nhiên.', 
        stats: { magicDamage: 15, manaRegen: 5, intelligence: 5 }, icon: itemAssets.forestStaff, maxLevel: 25,
        skills: [
            { name: "Hồi Phục Tự Nhiên", description: "Tăng 10% hiệu quả của các bình máu và mana.", icon: "💧" },
            { name: "Rễ Cây Bám Chắc", description: "Có 10% cơ hội trói chân kẻ địch trong 1 giây khi bị tấn công.", icon: "🌿" },
            { name: "Tinh Hoa Rừng Xanh", description: "Tăng chỉ số Trí tuệ.", icon: "🧠" },
            { name: "Lá Chắn Gỗ", description: "Khi bắt đầu trận đấu, tạo một lá chắn nhỏ hấp thụ sát thương.", icon: "🌳" },
            { name: "Phấn Hoa Chữa Lành", description: "Mỗi 20 giây, hồi một lượng nhỏ máu.", icon: "🌸" }
        ]
    }],
    [61, { 
        id: 61, name: 'Nomad Staff', type: 'weapon', rarity: 'D', description: 'Cây trượng của pháp sư du mục, tăng cường khả năng phép thuật cơ bản.', 
        stats: { magicDamage: 12, manaRegen: 3 }, icon: itemAssets.nomadStaff, maxLevel: 20,
        skills: [
            { name: "Dòng Chảy Năng Lượng", description: "Tăng 5% hồi phục mana.", icon: "💧" },
            { name: "Tụ Hồn", description: "Tăng 5% sát thương phép.", icon: "✨" },
            { name: "Linh Hồn Lữ Hành", description: "Giảm 5% tiêu hao mana cho các kỹ năng.", icon: "🚶" },
            { name: "Kiến Thức Cổ Xưa", description: "Tăng chỉ số Trí tuệ.", icon: "📚" },
            { name: "Bão Cát", description: "Đòn đánh phép có 5% cơ hội làm giảm độ chính xác của đối phương.", icon: "🏜️" }
        ]
    }],
    [62, { id: 62, name: 'Silverscale Plate', type: 'armor', rarity: 'A', description: 'Tấm giáp vảy bạc, nhẹ nhưng cực kỳ bền bỉ, cung cấp khả năng phòng thủ cao và kháng phép.', stats: { defense: 40, magicResist: 20, durability: 150 }, icon: itemAssets.silverscalePlate, maxLevel: 35 }],
    [63, { 
        id: 63, name: 'Mystic Staff', type: 'weapon', rarity: 'S', description: 'Cây trượng bí ẩn truyền sức mạnh từ các vì sao, tăng cường ma thuật lên một tầm cao mới.', 
        stats: { magicDamage: 35, manaRegen: 10, intelligence: 20, magicCritChance: 0.10 }, icon: itemAssets.mysticStaff, maxLevel: 45,
        skills: [
            { name: "Tinh Tú Hộ Mệnh", description: "Khi bắt đầu trận đấu, tạo lá chắn hấp thụ sát thương bằng 10% mana tối đa.", icon: "✨" },
            { name: "Dòng Chảy Tinh Hà", description: "Tăng 15% hồi phục mana.", icon: "🌌" },
            { name: "Vụ Nổ Năng Lượng", description: "Kỹ năng phép có 10% cơ hội gây thêm 25% sát thương.", icon: "💥" },
            { name: "Sao Rơi", description: "Mỗi 10 giây, triệu hồi một ngôi sao nhỏ tấn công kẻ địch ngẫu nhiên.", icon: "🌟" },
            { name: "Lỗ Đen", description: "Khi kết liễu kẻ địch, có 5% cơ hội tạo một hố đen nhỏ hút kẻ địch gần đó.", icon: "⚫" }
        ]
    }],
    [64, { id: 64, name: 'Hawkeye Bow', type: 'weapon', rarity: 'E', description: 'Cung của xạ thủ đại bàng, tầm bắn xa và độ chính xác cao.', stats: { damage: 10, range: 30, accuracy: 0.85 }, icon: itemAssets.hawkeyeBow, maxLevel: 15, skills: [] }],
    [65, { 
        id: 65, name: 'Nomad Bow', type: 'weapon', rarity: 'B', description: 'Cây cung của dân du mục, cân bằng giữa sức mạnh và tính linh hoạt.', 
        stats: { damage: 22, range: 40, durability: 70, agility: 8 }, icon: itemAssets.nomadBow, maxLevel: 30,
        skills: [
            { name: "Mắt Ưng", description: "Tăng 10% độ chính xác.", icon: "👁️" },
            { name: "Phát Bắn Chuẩn Xác", description: "Tăng 5% tỉ lệ chí mạng.", icon: "🎯" },
            { name: "Nhanh Nhẹn", description: "Tăng chỉ số Nhanh nhẹn.", icon: "🏃" },
            { name: "Tên Độc", description: "Đòn đánh có 5% cơ hội gây độc nhẹ.", icon: "☠️" },
            { name: "Mưa Tên", description: "Mỗi 5 đòn đánh, bắn ra thêm một mũi tên vào mục tiêu ngẫu nhiên.", icon: "🏹" }
        ]
    }],
    [66, { 
        id: 66, name: 'Warrior\'s Sword', type: 'weapon', rarity: 'A', description: 'Thanh kiếm được rèn cho những chiến binh dũng cảm, cực kỳ sắc bén và bền bỉ.', 
        stats: { damage: 38, durability: 120, strength: 15, critChance: 0.05 }, icon: itemAssets.warriorsSword, maxLevel: 40,
        skills: [
            { name: "Ý Chí Bất Khuất", description: "Khi máu dưới 50%, tăng 10% phòng thủ.", icon: "💪" },
            { name: "Tường Kiếm", description: "Tăng 10% khả năng đỡ đòn.", icon: "🛡️" },
            { name: "Dũng Mãnh", description: "Tăng Sức mạnh.", icon: "🔥" },
            { name: "Phản Đòn", description: "Khi đỡ đòn thành công, phản lại 20% sát thương.", icon: "🔄" },
            { name: "Tiếng Hét Xung Trận", description: "Khi bắt đầu trận đấu, tăng 5% sát thương cho toàn đội trong 10 giây.", icon: "🗣️" }
        ]
    }],
    [67, { id: 67, name: 'Dragon\'s Breath Armor', type: 'armor', rarity: 'E', description: 'Bộ giáp được làm từ vảy rồng non, cung cấp sự bảo vệ cơ bản và khả năng chống lửa nhẹ.', stats: { defense: 12, magicResist: 3, fireResist: 0.10 }, icon: itemAssets.dragonsBreathArmor, maxLevel: 10 }],
    [68, { id: 68, name: 'Angel Bow', type: 'weapon', rarity: 'B', description: 'Cung của Thiên thần, bắn ra những mũi tên ánh sáng với độ chính xác và sát thương cao.', stats: { damage: 28, range: 45, accuracy: 0.90, lightDamage: 10 }, icon: itemAssets.angelBow, maxLevel: 30, skills: [] }], // Cần thêm 5 skill
    [69, { id: 69, name: 'Demon King\'s Longsword', type: 'weapon', rarity: 'S', description: 'Thanh trường kiếm được rèn từ trái tim của Quỷ Vương, chứa đựng sức mạnh hắc ám khủng khiếp.', stats: { damage: 55, durability: 180, strength: 25, darkDamage: 25, lifeSteal: 0.05 }, icon: itemAssets.demonKingsLongsword, maxLevel: 50, skills: [] }], // Cần thêm 5 skill
    [70, { 
        id: 70, name: 'Shadow Scythe', type: 'weapon', rarity: 'SR', description: 'Lưỡi hái bóng đêm, vũ khí của Thần Chết, gây sát thương lớn và có khả năng hút linh hồn.', 
        stats: { damage: 65, darkDamage: 30, lifeSteal: 0.10, critChance: 0.15 }, icon: itemAssets.shadowScythe, maxLevel: 60,
        skills: [
            { name: "Hút Hồn", description: "Tăng 10% hiệu quả hút máu.", icon: "🩸" },
            { name: "Bóng Ma Sợ Hãi", description: "Đòn đánh có 10% cơ hội gây hiệu ứng Sợ Hãi.", icon: "😱" },
            { name: "Thu Hoạch Linh Hồn", description: "Kết liễu kẻ địch dưới 10% máu sẽ hồi 5% máu tối đa.", icon: "👻" },
            { name: "Lưỡi Hái Tử Thần", description: "Tăng 10% sát thương lên các mục tiêu dưới 30% máu.", icon: "💀" },
            { name: "Hiệp Ước Với Cái Chết", description: "Khi máu về 0, hồi sinh với 30% máu. Chỉ kích hoạt một lần mỗi trận.", icon: "🔄" }
        ]
    }],
    [71, { id: 71, name: 'Demon Knight\'s Spear', type: 'weapon', rarity: 'E', description: 'Ngọn giáo của Kỵ sĩ Quỷ, cung cấp sát thương cơ bản và độ bền tốt.', stats: { damage: 15, durability: 50, strength: 3 }, icon: itemAssets.demonKnightsSpear, maxLevel: 15, skills: [] }],
    [72, { id: 72, name: 'Demon King\'s Daggers', type: 'weapon', rarity: 'A', description: 'Cặp dao găm của Quỷ Vương, cho phép tấn công nhanh và chí mạng cao, tẩm độc gây sát thương theo thời gian.', stats: { damage: 25, attackSpeed: 30, durability: 80, agility: 10, critChance: 0.15, poisonDamage: 5 }, icon: itemAssets.demonKingsDaggers, maxLevel: 35, skills: [] }], // Cần thêm 5 skill
    [73, { id: 73, name: 'Divine Quarterstaff', type: 'weapon', rarity: 'B', description: 'Cây gậy chiến thần thánh, mang sức mạnh của ánh sáng, tăng cường sát thương phép và hồi phục mana.', stats: { magicDamage: 20, manaRegen: 7, durability: 90, lightDamage: 8, intelligence: 10 }, icon: itemAssets.divineQuarterstaff, maxLevel: 30, skills: [] }], // Cần thêm 5 skill
    [74, { id: 74, name: 'Meteor Staff', type: 'weapon', rarity: 'A', description: 'Cây trượng chứa sức mạnh của thiên thạch, có thể triệu hồi mưa sao băng.', stats: { magicDamage: 30, fireDamage: 15, intelligence: 15, durability: 110 }, icon: itemAssets.meteorStaff, maxLevel: 40, skills: [] }], // Cần thêm 5 skill
    [75, {
        id: 75, name: 'Assassin\'s Dagger', type: 'weapon', rarity: 'D', description: 'Con dao găm của sát thủ, sắc bén và dễ dàng ẩn mình trong bóng tối.',
        stats: { damage: 12, attackSpeed: 10, critChance: 0.05, agility: 5 }, icon: itemAssets.assassinsDagger, maxLevel: 20,
        skills: [
            { name: "Đâm Lén", description: "Tăng 10% sát thương chí mạng.", icon: "🔪" },
            { name: "Nhanh Nhẹn", description: "Tăng 5% tốc độ tấn công.", icon: "💨" },
            { name: "Tẩm Độc", description: "Đòn đánh có 10% cơ hội gây độc nhẹ trong 3 giây.", icon: "☠️" },
            { name: "Tìm Điểm Yếu", description: "Tăng 5% tỉ lệ chí mạng.", icon: "🎯" },
            { name: "Bóng Ma", description: "Tăng 5% tỉ lệ né đòn.", icon: "👻" }
        ]
    }],
    [42, { id: 42, name: 'Kiếm gỗ (+1)', type: 'weapon', rarity: 'E', description: 'Một thanh kiếm gỗ đã được nâng cấp nhẹ.', stats: { damage: 7, durability: 25 }, icon: itemAssets.kiemGo, maxLevel: 10, skills: [] }],
    [76, { id: 76, name: 'Sacrificial Sword', type: 'weapon', rarity: 'B', description: 'Thanh kiếm mang sức mạnh hiến tế, tăng cường sát thương và tỉ lệ chí mạng.', stats: { damage: 28, durability: 90, critChance: 0.10 }, icon: itemAssets.sacrificialSword, maxLevel: 30, skills: [] }], // Cần thêm 5 skill
    [77, { id: 77, name: 'Leviathan Axe', type: 'weapon', rarity: 'A', description: 'Chiếc rìu được rèn từ vảy của Leviathan, mang sức mạnh của băng giá và đại dương sâu thẳm, có thể làm chậm kẻ địch.', stats: { damage: 42, strength: 20, durability: 140, coldDamage: 18, slowEffect: 0.20 }, icon: itemAssets.leviathanAxe, maxLevel: 40, skills: [] }], // Cần thêm 5 skill
    [78, { id: 78, name: 'Chaos Staff', type: 'weapon', rarity: 'D', description: 'Cây trượng hỗn loạn với sức mạnh không thể đoán trước.', stats: { magicDamage: 14, durability: 55 }, icon: itemAssets.chaosStaff, maxLevel: 20, skills: [] }], // Cần thêm 5 skill
]);
// --- END OF FILE item-database.ts ---
