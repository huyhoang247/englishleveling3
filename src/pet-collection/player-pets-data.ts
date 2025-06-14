// --- START OF FILE player-pets-data.ts ---

export interface PlayerPet {
    id: string; // ID tương ứng với petDatabase
    level: number;
    currentExp: number;
    requiredExp: number;
}

// Giả sử người chơi đã sở hữu 3 linh thú
export const playerPetsData: PlayerPet[] = [
    {
        id: 'pet_001',
        level: 15,
        currentExp: 1200,
        requiredExp: 2500,
    },
    {
        id: 'pet_002',
        level: 8,
        currentExp: 300,
        requiredExp: 1000,
    },
    {
        id: 'pet_004',
        level: 5,
        currentExp: 850,
        requiredExp: 5000,
    },
];

// --- END OF FILE player-pets-data.ts ---
