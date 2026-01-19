// --- START OF FILE trade-service.ts ---
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../firebase.js';

// --- TYPES ---
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth' | 'feather' | 'coal';

export interface TradeIngredient {
    type: ResourceType;
    name: string;
    amount: number;
}

export interface TradeOption {
    id: string;
    title: string;
    ingredients: TradeIngredient[];
    receiveType: 'equipmentPiece' | 'ancientBook' | 'stone';
    receiveSubType?: 'low' | 'medium' | 'high';
    receiveAmount: number;
    description?: string;
}

// --- RNG & UTILS ---
const getVnDateString = () => {
    return new Date().toLocaleDateString("en-US", { 
        timeZone: "Asia/Ho_Chi_Minh",
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
};

const pseudoRandom = (seed: string): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return Math.abs(hash);
};

const getSeededRange = (seed: string, min: number, max: number): number => {
    return (pseudoRandom(seed) % (max - min + 1)) + min;
};

const getDailyPrice = (resourceType: string): number => {
    // Seed kết hợp ngày + tên tài nguyên nên giá mỗi loại sẽ khác nhau
    return getSeededRange(getVnDateString() + resourceType, 5, 20);
};

// --- TRADE GENERATION LOGIC ---

// Tạo công thức đổi đá hàng ngày
const getDailyStoneTrade = (): TradeOption => {
    const dateStr = getVnDateString();
    
    // 1. Xác định loại đá (Low/Medium/High)
    const tiers: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const tierIndex = pseudoRandom(dateStr + 'stoneTier') % 3;
    const selectedTier = tiers[tierIndex];

    // 2. Xác định khoảng số lượng (Min/Max) dựa trên độ hiếm
    let minQ = 5, maxQ = 15;
    let title = "Basic Upgrade Cache";
    
    if (selectedTier === 'medium') {
        minQ = 10; maxQ = 25;
        title = "Rare Upgrade Cache";
    } else if (selectedTier === 'high') {
        minQ = 20; maxQ = 35;
        title = "Legendary Upgrade Cache";
    }

    // --- SỬA ĐỔI: Tính 2 số lượng riêng biệt bằng seed khác nhau ---
    // Seed 'stoneQty1' cho nguyên liệu đầu, 'stoneQty2' cho nguyên liệu sau
    const quantity1 = getSeededRange(dateStr + 'stoneQty1', minQ, maxQ);
    const quantity2 = getSeededRange(dateStr + 'stoneQty2', minQ, maxQ);

    // 3. Chọn nguyên liệu ngẫu nhiên từ pool
    const commonPool: {type: ResourceType, name: string}[] = [
        { type: 'wood', name: 'Wood' },
        { type: 'leather', name: 'Leather' },
        { type: 'ore', name: 'Ore' },
        { type: 'cloth', name: 'Cloth' }
    ];
    const commonIng = commonPool[pseudoRandom(dateStr + 'commonIng') % commonPool.length];

    const rarePool: {type: ResourceType, name: string}[] = [
        { type: 'feather', name: 'Feather' },
        { type: 'coal', name: 'Coal' }
    ];
    const rareIng = rarePool[pseudoRandom(dateStr + 'rareIng') % rarePool.length];

    return {
        id: 'daily_stone_exchange',
        title: title,
        description: `Daily Special: ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Stone`,
        ingredients: [
            { type: commonIng.type, name: commonIng.name, amount: quantity1 },
            { type: rareIng.type, name: rareIng.name, amount: quantity2 }
        ],
        receiveType: 'stone',
        receiveSubType: selectedTier,
        receiveAmount: 1
    };
};

// Lấy danh sách tất cả các gói giao dịch hiện có
export const getTradeOptions = (): TradeOption[] => {
    const standardOptions: TradeOption[] = [
        { 
            id: 'combine_wood_leather', 
            title: "Hunter's Supply",
            description: 'Market fluctuation applied',
            ingredients: [
                { type: 'wood', name: 'Wood', amount: getDailyPrice('wood') },
                { type: 'leather', name: 'Leather', amount: getDailyPrice('leather') }
            ],
            receiveType: 'equipmentPiece', 
            receiveAmount: 1
        },
        { 
            id: 'combine_ore_cloth', 
            title: "Warrior's Supply",
            description: 'Market fluctuation applied',
            ingredients: [
                { type: 'ore', name: 'Ore', amount: getDailyPrice('ore') },
                { type: 'cloth', name: 'Cloth', amount: getDailyPrice('cloth') }
            ],
            receiveType: 'equipmentPiece', 
            receiveAmount: 1
        },
        { 
            id: 'combine_feather_coal', 
            title: "Scholar's Supply",
            description: 'Market fluctuation applied',
            ingredients: [
                { type: 'feather', name: 'Feather', amount: getDailyPrice('feather') },
                { type: 'coal', name: 'Coal', amount: getDailyPrice('coal') }
            ],
            receiveType: 'ancientBook', 
            receiveAmount: 1
        },
    ];

    return [...standardOptions, getDailyStoneTrade()];
};

// --- FIREBASE TRANSACTION ---
export const executeTradeTransaction = async (
    userId: string, 
    option: TradeOption, 
    quantity: number
): Promise<void> => {
    if (!userId) throw new Error("User ID is missing");

    await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const userData = userDoc.data();

        const updates: any = {};
        
        // 1. Trừ Nguyên Liệu
        for (const ing of option.ingredients) {
            const currentVal = userData[ing.type] || 0;
            const totalRequired = ing.amount * quantity;
            if (currentVal < totalRequired) {
                throw new Error(`Server: Not enough ${ing.name}`);
            }
            updates[ing.type] = currentVal - totalRequired;
        }

        // 2. Cộng vật phẩm nhận được
        const totalReceive = option.receiveAmount * quantity;

        if (option.receiveType === 'equipmentPiece') {
            const currentPieces = userData.equipment?.pieces || 0;
            updates['equipment.pieces'] = currentPieces + totalReceive;
        } else if (option.receiveType === 'ancientBook') {
            const currentBooks = userData.ancientBooks || 0;
            updates['ancientBooks'] = currentBooks + totalReceive;
        } else if (option.receiveType === 'stone' && option.receiveSubType) {
            const stonePath = `equipment.stones.${option.receiveSubType}`;
            const currentStones = userData.equipment?.stones?.[option.receiveSubType] || 0;
            updates[stonePath] = currentStones + totalReceive;
        }

        transaction.update(userRef, updates);
    });
};
