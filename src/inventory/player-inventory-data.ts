// --- START OF FILE src/data/player-inventory-data.ts ---

// Cấu trúc một item trong túi đồ của người chơi
export interface PlayerItem {
    instanceId: number; // ID duy nhất cho item này trong túi đồ
    id: number;           // ID của item gốc trong database
    quantity: number;
    // Các thuộc tính có thể thay đổi khác
    level?: number;
    currentExp?: number;
    requiredExp?: number;
    stats?: { [key: string]: any }; // Ghi đè chỉ số gốc nếu cần (ví dụ: item được cường hóa)
}

// Dữ liệu túi đồ của người chơi, chỉ chứa ID và các thông tin thay đổi
export const playerInventoryData: PlayerItem[] = [
    { instanceId: 1001, id: 1, quantity: 5, level: 1, currentExp: 50, requiredExp: 100 },
    { instanceId: 1002, id: 42, quantity: 1, level: 2, currentExp: 10, requiredExp: 200 }, // Kiếm gỗ +1
    { instanceId: 1003, id: 2, quantity: 5 },
    { instanceId: 1004, id: 3, quantity: 1 },
    { instanceId: 1005, id: 4, quantity: 1, level: 5, currentExp: 300, requiredExp: 500 },
    { instanceId: 1006, id: 5, quantity: 3 },
    { instanceId: 1007, id: 6, quantity: 1 },
    { instanceId: 1008, id: 7, quantity: 1 },
    { instanceId: 1009, id: 8, quantity: 1, level: 10, currentExp: 1200, requiredExp: 2000 },
    { instanceId: 1010, id: 9, quantity: 1450 },
    { instanceId: 1011, id: 10, quantity: 1 },
    { instanceId: 1012, id: 11, quantity: 1 },
    { instanceId: 1013, id: 12, quantity: 1 },
    { instanceId: 1014, id: 13, quantity: 1, level: 2, currentExp: 80, requiredExp: 200 },
    { instanceId: 1015, id: 14, quantity: 1, level: 7, currentExp: 700, requiredExp: 1000 },
    { instanceId: 1016, id: 17, quantity: 10 },
    { instanceId: 1017, id: 20, quantity: 1 },
    { instanceId: 1018, id: 24, quantity: 2 },
    { instanceId: 1019, id: 26, quantity: 5 },
    { instanceId: 1020, id: 27, quantity: 1 },
    { instanceId: 1021, id: 28, quantity: 10 },
    { instanceId: 1022, id: 29, quantity: 1 },
    { instanceId: 1023, id: 30, quantity: 1 },
    { instanceId: 1024, id: 34, quantity: 2 },
    { instanceId: 1025, id: 35, quantity: 1 },
    { instanceId: 1026, id: 36, quantity: 1 },
    { instanceId: 1027, id: 37, quantity: 1 },
    { instanceId: 1028, id: 38, quantity: 3 },
    { instanceId: 1029, id: 39, quantity: 1 },
    { instanceId: 1030, id: 40, quantity: 1 },
    { instanceId: 1031, id: 41, quantity: 1, level: 8, currentExp: 800, requiredExp: 1500 },
    { instanceId: 1032, id: 43, quantity: 20 },
    { instanceId: 1033, id: 44, quantity: 35 },
    { instanceId: 1034, id: 45, quantity: 15 },
    { instanceId: 1035, id: 46, quantity: 25 },
    { instanceId: 1036, id: 47, quantity: 10 },
    { instanceId: 1037, id: 48, quantity: 8 },
    { instanceId: 1038, id: 49, quantity: 15 },
    { instanceId: 1039, id: 50, quantity: 12 },
    { instanceId: 1040, id: 51, quantity: 7 },
    { instanceId: 1041, id: 52, quantity: 5 },
    { instanceId: 1042, id: 53, quantity: 9 },
    { instanceId: 1043, id: 54, quantity: 3 },
    { instanceId: 1044, id: 55, quantity: 1 },
    { instanceId: 1045, id: 56, quantity: 1 },
    { instanceId: 1046, id: 57, quantity: 1 },
    { instanceId: 1047, id: 58, quantity: 1 },
    { instanceId: 1048, id: 59, quantity: 1 },
    { instanceId: 1049, id: 61, quantity: 1 },
    { instanceId: 1050, id: 60, quantity: 1 },
    { instanceId: 1051, id: 62, quantity: 1 },
    { instanceId: 1052, id: 63, quantity: 1 },
    { instanceId: 1053, id: 64, quantity: 1 },
    { instanceId: 1054, id: 65, quantity: 1 },
    { instanceId: 1055, id: 66, quantity: 1 },
    { instanceId: 1056, id: 67, quantity: 1 },
    { instanceId: 1057, id: 68, quantity: 1 },
    { instanceId: 1058, id: 69, quantity: 1 },
    { instanceId: 1059, id: 70, quantity: 1 },
    { instanceId: 1060, id: 71, quantity: 1 },
    { instanceId: 1061, id: 72, quantity: 1 },
    { instanceId: 1062, id: 73, quantity: 1 },
    { instanceId: 1063, id: 74, quantity: 1 },
    
    
    
    
    
    


    
    
];

// --- END OF FILE src/data/player-inventory-data.ts ---
