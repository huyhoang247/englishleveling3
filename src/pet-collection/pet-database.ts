// --- START OF FILE pet-database.ts ---

export interface PetSkill {
    name: string;
    description: string;
    icon: string; // Emoji hoặc URL icon
}

export interface PetData {
    id: string;
    name: string;
    rarity: 'E' | 'D' | 'B' | 'A' | 'S' | 'SR';
    icon: string; // URL hình ảnh của linh thú
    description: string;
    type: 'Tấn Công' | 'Phòng Thủ' | 'Hỗ Trợ';
    baseStats: { [key: string]: number };
    skills: PetSkill[];
}

export const petDatabase = new Map<string, PetData>([
    [
        'pet_001',
        {
            id: 'pet_001',
            name: 'Hỏa Tinh Linh',
            rarity: 'B',
            icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/pet/pet1.png',
            description: 'Một tinh linh nghịch ngợm được sinh ra từ ngọn lửa vĩnh cửu, luôn tỏa ra hơi ấm.',
            type: 'Tấn Công',
            baseStats: { fireDamage: 15, attackSpeed: 0.1 },
            skills: [
                { name: 'Cầu Lửa', description: 'Tấn công kẻ địch bằng một quả cầu lửa nhỏ.', icon: '🔥' }
            ]
        }
    ],
    [
        'pet_002',
        {
            id: 'pet_002',
            name: 'Thạch Quy',
            rarity: 'A',
            icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/pet/pet2.png',
            description: 'Một con rùa cổ đại với chiếc mai cứng như đá kim cương, là biểu tượng của sự kiên định.',
            type: 'Phòng Thủ',
            baseStats: { defense: 25, health: 500 },
            skills: [
                { name: 'Khiên Đá', description: 'Tạo một lớp khiên hấp thụ sát thương cho chủ nhân.', icon: '🛡️' },
                { name: 'Địa Chấn', description: 'Làm chậm kẻ địch xung quanh.', icon: '🌍' }
            ]
        }
    ],
    [
        'pet_003',
        {
            id: 'pet_003',
            name: 'Kỳ Lân Nguyệt Quang',
            rarity: 'S',
            icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/pet/pet3.png',
            description: 'Linh thú thần thoại chỉ xuất hiện dưới ánh trăng tròn, có khả năng chữa lành mọi vết thương.',
            type: 'Hỗ Trợ',
            baseStats: { manaRegen: 15, luck: 5 },
            skills: [
                { name: 'Ánh Trăng Chữa Lành', description: 'Hồi một lượng máu đáng kể cho chủ nhân.', icon: '💖' },
                { name: 'Nguyệt Quang Hộ Thể', description: 'Tăng kháng phép cho chủ nhân trong thời gian ngắn.', icon: '🌙' }
            ]
        }
    ],
    [
        'pet_004',
        {
            id: 'pet_004',
            name: 'Thần Hổ Vệ Hồn',
            rarity: 'SR',
            icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/pet/pet4.png',
            description: 'Hóa thân của một vị thần chiến tranh, sức mạnh của nó có thể lay chuyển cả đất trời. Chỉ những chiến binh vĩ đại nhất mới có thể thuần hóa.',
            type: 'Tấn Công',
            baseStats: { damage: 100, strength: 50, attackSpeed: 0.3 },
            skills: [
                { name: 'Hổ Gầm', description: 'Gây sát thương diện rộng và làm choáng kẻ địch.', icon: '💥' },
                { name: 'Vuốt Hổ Thần', description: 'Đòn đánh kế tiếp của chủ nhân được cường hóa, gây thêm sát thương chí mạng.', icon: '⚔️' },
                { name: 'Linh Hồn Bất Diệt', description: 'Khi chủ nhân gần hết máu, tăng mạnh sức tấn công và phòng thủ.', icon: '💫' }
            ]
        }
    ],
    [
        'pet_005',
        {
            id: 'pet_005',
            name: 'Yêu Hồ Lửa Xanh',
            rarity: 'SR',
            icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/pet/pet5.png',
            description: 'Một yêu hồ xảo quyệt với bộ lông và ngọn lửa màu xanh biếc kỳ ảo, có khả năng thôi miên và điều khiển tâm trí.',
            type: 'Hỗ Trợ',
            baseStats: { intelligence: 40, manaRegen: 25, magicBoost: 10 },
            skills: [
                { name: 'Ma Hỏa', description: 'Tạo ra ngọn lửa xanh thiêu đốt mana của đối thủ.', icon: '🌀' },
                { name: 'Thôi Miên', description: 'Vô hiệu hóa một kẻ địch trong thời gian ngắn.', icon: '😵' },
                { name: 'Liên Kết Linh Hồn', description: 'Chia sẻ một phần sát thương mà chủ nhân phải gánh chịu.', icon: '🔗' }
            ]
        }
    ],
]);
// --- END OF FILE pet-database.ts ---
