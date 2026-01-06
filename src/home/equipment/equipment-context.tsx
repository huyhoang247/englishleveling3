import React, { createContext, useState, useMemo, useCallback, useContext, type ReactNode, type FC } from 'react';
import { 
    getItemDefinition, 
    itemBlueprints, 
    generateItemDefinition,
    getBlueprintByName,
    type ItemBlueprint,
    type ItemDefinition, 
    type ItemRank, 
    RARITY_ORDER 
} from './item-database.ts';
import { updateUserInventory } from './equipment-service.ts';
import type { OwnedItem, EquippedItems, EquipmentSlotType } from './equipment-ui.tsx';
// Import useGame để truy cập state toàn cục và auth để lấy userId
import { useGame } from '../../GameContext.tsx'; 
import { auth } from '../../firebase.js';

// --- ĐỊNH NGHĨA CÁC HẰNG SỐ LOGIC ---
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const MAX_ITEMS_IN_STORAGE = 50;

/**
 * Cấu hình cho hệ thống cường hóa mới
 */
export type EnhancementStoneType = 'basic' | 'medium' | 'advanced';

export const ENHANCEMENT_CONFIG = {
    basic: { 
        name: 'Đá Sơ Cấp', 
        chance: 0.5, // 50% thành công
        goldCost: 200, 
        icon: '🪨',
        color: 'text-gray-400',
        borderColor: 'border-gray-500'
    },
    medium: { 
        name: 'Đá Trung Cấp', 
        chance: 0.8, // 80% thành công
        goldCost: 600, 
        icon: '💎',
        color: 'text-blue-400',
        borderColor: 'border-blue-500'
    },
    advanced: { 
        name: 'Đá Cao Cấp', 
        chance: 1.0, // 100% thành công
        goldCost: 2000, 
        icon: '✨',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500'
    },
};

// --- CÁC HÀM TRỢ GIÚP (HELPER FUNCTIONS) ---

const getUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
    const baseCost = 50;
    return Math.floor(baseCost * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]);
};

const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += getUpgradeCost(itemDef, i);
    }
    return total;
};

const getRandomRank = (): ItemRank => {
    const rand = Math.random() * 100;
    if (rand < 0.1) return 'SSR';
    if (rand < 1) return 'SR';
    if (rand < 5) return 'S';
    if (rand < 20) return 'A';
    if (rand < 50) return 'B';
    if (rand < 80) return 'D';
    return 'E';
};

const calculateForgeResult = (itemsToForge: OwnedItem[], definition: ItemDefinition): { level: number, refundGold: number } => {
    if (itemsToForge.length < 3) return { level: 1, refundGold: 0 };
    const totalInvestedGold = itemsToForge.reduce((total, item) => total + getTotalUpgradeCost(definition, item.level), 0);
    let finalLevel = 1, remainingGold = totalInvestedGold;
    while (true) {
        const costForNextLevel = getUpgradeCost(definition, finalLevel);
        if (remainingGold >= costForNextLevel) { 
            remainingGold -= costForNextLevel; 
            finalLevel++; 
        } else { 
            break; 
        }
    }
    return { level: finalLevel, refundGold: remainingGold };
};

// --- INTERFACES ---

interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: { level: number; refundGold: number; }; 
}

interface EquipmentContextType {
    // State dữ liệu
    isLoading: boolean;
    gold: number;
    equipmentPieces: number;
    enhancementStones: { [key in EnhancementStoneType]: number };
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    selectedItem: OwnedItem | null;
    newlyCraftedItem: OwnedItem | null;
    
    // State UI/Modal
    isForgeModalOpen: boolean;
    isStatsModalOpen: boolean;
    isEnhanceModalOpen: boolean; 
    isProcessing: boolean;
    dismantleSuccessToast: { show: boolean; message: string };
    
    // State tính toán (Derived State)
    equippedItemsMap: { [key in EquipmentSlotType]: OwnedItem | null };
    unequippedItemsSorted: OwnedItem[];
    totalEquippedStats: { hp: number; atk: number; def: number; };
    userStatsValue: { hp: number; atk: number; def: number; };

    // Các hàm xử lý logic (Handlers)
    handleEquipItem: (item: OwnedItem) => Promise<void>;
    handleUnequipItem: (item: OwnedItem) => Promise<void>;
    handleCraftItem: () => Promise<void>;
    handleDismantleItem: (item: OwnedItem) => Promise<void>;
    handleForgeItems: (group: ForgeGroup) => Promise<void>;
    handleEnhanceItem: (item: OwnedItem, stoneType: EnhancementStoneType) => Promise<{ success: boolean }>;
    
    // Các hàm xử lý giao diện (UI Handlers)
    handleSelectItem: (item: OwnedItem) => void;
    handleSelectSlot: (slot: EquipmentSlotType) => void;
    handleCloseDetailModal: () => void;
    handleCloseCraftSuccessModal: () => void;
    handleOpenForgeModal: () => void;
    handleCloseForgeModal: () => void;
    handleOpenStatsModal: () => void;
    handleCloseStatsModal: () => void;
    handleOpenEnhanceModal: (item: OwnedItem) => void;
    handleCloseEnhanceModal: () => void;

    // Hằng số
    MAX_ITEMS_IN_STORAGE: number;
    CRAFTING_COST: number;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

export const EquipmentProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // Lấy dữ liệu từ GameContext toàn cục
    const {
        coins: gold,
        equipmentPieces,
        // Giả định enhancementStones đã được thêm vào GameContext, nếu chưa có sẽ mặc định là 0
        enhancementStones = { basic: 0, medium: 0, advanced: 0 },
        ownedItems: rawOwnedItems,
        equippedItems,
        isLoading: isGameDataLoading,
        userStatsValue,
    } = useGame();

    // States cục bộ cho UI
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dismantleSuccessToast, setDismantleSuccessToast] = useState({ show: false, message: '' });
    
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);

    // Chuẩn hóa dữ liệu vật phẩm sở hữu
    const ownedItems = useMemo(() => {
        if (!rawOwnedItems) return [];
        return rawOwnedItems.map(item => ({
            ...item,
            stats: item.stats || {}
        }));
    }, [rawOwnedItems]);

    const showMessage = useCallback((text: string) => {
        setMessage(text); 
        setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Hàm trung gian gọi Service để cập nhật Firestore
     */
    const performInventoryUpdate = useCallback(async (updates: { 
        newOwned: OwnedItem[]; 
        newEquipped: EquippedItems; 
        goldChange: number; 
        piecesChange: number;
        stoneType?: EnhancementStoneType;
        stoneChange?: number;
    }) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            showMessage("Lỗi: Người dùng chưa đăng nhập.");
            return Promise.reject("Not authenticated");
        }
        if (isProcessing) {
            showMessage("Thao tác trước đó đang được xử lý...");
            return Promise.reject("Processing");
        }
        setIsProcessing(true);
        try {
            await updateUserInventory(userId, updates);
        } catch (error: any) { 
            showMessage(`Lỗi: ${error.message || 'Cập nhật thất bại'}`); 
            throw error;
        } finally { 
            setIsProcessing(false); 
        }
    }, [isProcessing, showMessage]);

    // --- LOGIC CƯỜNG HÓA (ENHANCEMENT LOGIC) ---

    const handleEnhanceItem = useCallback(async (itemToUpgrade: OwnedItem, stoneType: EnhancementStoneType) => {
        const config = ENHANCEMENT_CONFIG[stoneType];
        
        // Kiểm tra điều kiện
        if (gold < config.goldCost) {
            showMessage(`Không đủ vàng. Cần ${config.goldCost.toLocaleString()}.`);
            return { success: false };
        }
        if (enhancementStones[stoneType] <= 0) {
            showMessage(`Không đủ ${config.name}.`);
            return { success: false };
        }

        // Tính toán tỉ lệ thành công
        const isSuccess = Math.random() < config.chance;
        
        let newOwnedList = [...ownedItems];
        let updatedItem = { ...itemToUpgrade };

        if (isSuccess) {
            // Nếu thành công: Tăng Level và chỉ số
            const statKeys = Object.keys(itemToUpgrade.stats).filter(k => typeof itemToUpgrade.stats[k] === 'number');
            if (statKeys.length > 0) {
                const statToUpgrade = statKeys[Math.floor(Math.random() * statKeys.length)];
                const currentValue = itemToUpgrade.stats[statToUpgrade];
                
                // Tăng ngẫu nhiên từ 1% đến 5% dựa trên giá trị hiện tại
                const randomPercent = 0.01 + Math.random() * 0.04;
                const increase = Math.max(1, Math.round(currentValue * randomPercent));
                
                const newStats = { 
                    ...itemToUpgrade.stats, 
                    [statToUpgrade]: currentValue + increase 
                };

                updatedItem = { 
                    ...itemToUpgrade, 
                    level: itemToUpgrade.level + 1, 
                    stats: newStats 
                };
                
                newOwnedList = ownedItems.map(s => s.id === itemToUpgrade.id ? updatedItem : s);
                // Cập nhật item đang chọn để UI thấy sự thay đổi
                setSelectedItem(updatedItem);
            }
        } else {
            // Nếu thất bại: Không tăng cấp, chỉ mất nguyên liệu (có thể thêm logic giảm cấp nếu muốn hardcore)
            showMessage("Cường hóa thất bại! Nguyên liệu đã biến mất.");
        }

        try {
            await performInventoryUpdate({ 
                newOwned: newOwnedList, 
                newEquipped: equippedItems, 
                goldChange: -config.goldCost, 
                piecesChange: 0,
                stoneType: stoneType,
                stoneChange: -1
            });
            return { success: isSuccess };
        } catch (error) {
            console.error(`Enhance failed:`, error);
            return { success: false };
        }
    }, [gold, enhancementStones, ownedItems, equippedItems, performInventoryUpdate, showMessage]);

    // --- CÁC LOGIC TRANG BỊ KHÁC ---

    const unequippedItemsSorted = useMemo(() => {
        const equippedIds = Object.values(equippedItems).filter(id => id !== null);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const itemDefA = getItemDefinition(a.itemId);
                const itemDefB = getItemDefinition(b.itemId);
                if (!itemDefA || !itemDefB) return 1;
                const rarityIndexA = RARITY_ORDER.indexOf(itemDefA.rarity);
                const rarityIndexB = RARITY_ORDER.indexOf(itemDefB.rarity);
                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                if (a.level !== b.level) return b.level - a.level;
                return itemDefA.name.localeCompare(itemDefB.name);
            });
    }, [ownedItems, equippedItems]);

    const handleEquipItem = useCallback(async (itemToEquip: OwnedItem) => {
        const itemDef = getItemDefinition(itemToEquip.itemId);
        if (!itemDef) return;
        const slotType = itemDef.type as EquipmentSlotType;
        const newEquipped = { ...equippedItems, [slotType]: itemToEquip.id };
        try {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
            setSelectedItem(null);
        } catch (error) { console.error(`Equip failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate]);

    const handleUnequipItem = useCallback(async (itemToUnequip: OwnedItem) => {
        const itemDef = getItemDefinition(itemToUnequip.itemId);
        if (!itemDef) return;
        const slotType = itemDef.type as EquipmentSlotType;
        const newEquipped = { ...equippedItems, [slotType]: null };
        try {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
            setSelectedItem(null);
        } catch (error) { console.error(`Unequip failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate]);
  
    const handleCraftItem = useCallback(async () => {
        if (equipmentPieces < CRAFTING_COST) { showMessage(`Không đủ Mảnh Trang Bị. Cần ${CRAFTING_COST}.`); return; }
        if (unequippedItemsSorted.length >= MAX_ITEMS_IN_STORAGE) { showMessage(`Kho chứa đã đầy.`); return; }
        
        try {
            const randomBlueprint = itemBlueprints[Math.floor(Math.random() * itemBlueprints.length)];
            const targetRank = getRandomRank();
            const finalItemDef = generateItemDefinition(randomBlueprint, targetRank, true);
            
            const newOwnedItem: OwnedItem = { 
                id: `owned-${Date.now()}-${finalItemDef.id}-${Math.random()}`, 
                itemId: finalItemDef.id, 
                level: 1,
                stats: finalItemDef.stats || {}
            };
            const newOwnedList = [...ownedItems, newOwnedItem];
            
            await performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: 0, piecesChange: -CRAFTING_COST });
            setNewlyCraftedItem(newOwnedItem);
        } catch(error) { console.error(`Craft failed:`, error); }
    }, [equipmentPieces, ownedItems, equippedItems, performInventoryUpdate, showMessage, unequippedItemsSorted.length]);

    const handleDismantleItem = useCallback(async (itemToDismantle: OwnedItem) => {
        if (Object.values(equippedItems).includes(itemToDismantle.id)) { showMessage("Không thể phân rã trang bị đang mặc."); return; }
        
        const itemDef = getItemDefinition(itemToDismantle.itemId)!;
        const goldToReturn = getTotalUpgradeCost(itemDef, itemToDismantle.level);
        const newOwnedList = ownedItems.filter(s => s.id !== itemToDismantle.id);
        
        try {
            await performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: goldToReturn, piecesChange: DISMANTLE_RETURN_PIECES });
            setSelectedItem(null);
            setDismantleSuccessToast({ show: true, message: 'Đã tái chế thành công.' });
            setTimeout(() => setDismantleSuccessToast(prev => ({ ...prev, show: false })), 4000);
        } catch(error) { console.error(`Dismantle failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate, showMessage]);

    const handleForgeItems = useCallback(async (group: ForgeGroup) => {
        if (group.items.length < 3 || !group.nextRank) { showMessage("Không đủ điều kiện để hợp nhất."); return; }
        
        const itemsToConsume = group.items.slice(0, 3);
        const itemIdsToConsume = itemsToConsume.map(s => s.id);
        
        try {
            const baseItemDef = getItemDefinition(itemsToConsume[0].itemId)!;
            const { level: finalLevel, refundGold } = calculateForgeResult(itemsToConsume, baseItemDef);
            const upgradedItemDef = generateItemDefinition(group.blueprint, group.nextRank, true);

            const newForgedItem: OwnedItem = { 
                id: `owned-${Date.now()}-${upgradedItemDef.id}`, 
                itemId: upgradedItemDef.id, 
                level: finalLevel,
                stats: upgradedItemDef.stats || {}
            };
            const newOwnedList = ownedItems.filter(s => !itemIdsToConsume.includes(s.id)).concat(newForgedItem);
            
            await performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: refundGold, piecesChange: 0 });
            
            setDismantleSuccessToast({ show: true, message: 'Hợp nhất thành công.' });
            setTimeout(() => setDismantleSuccessToast(prev => ({ ...prev, show: false })), 4000);
            setIsForgeModalOpen(false);
        } catch (error) { console.error(`Forge failed:`, error); }
    }, [ownedItems, equippedItems, performInventoryUpdate, showMessage]);

    // --- DERIVED DATA ---

    const equippedItemsMap = useMemo(() => {
        const map: { [key in EquipmentSlotType]: OwnedItem | null } = { weapon: null, armor: null, Helmet: null };
        for (const slotType of ['weapon', 'armor', 'Helmet'] as EquipmentSlotType[]) {
            const itemId = equippedItems[slotType];
            if (itemId) map[slotType] = ownedItems.find(item => item.id === itemId) || null;
        }
        return map;
    }, [equippedItems, ownedItems]);

    const totalEquippedStats = useMemo(() => {
        const totals = { hp: 0, atk: 0, def: 0 };
        Object.values(equippedItemsMap).forEach(item => {
            if (item && item.stats) {
                totals.hp += item.stats.hp || 0;
                totals.atk += item.stats.atk || 0;
                totals.def += item.stats.def || 0;
            }
        });
        return totals;
    }, [equippedItemsMap]);

    // --- UI ACTION HANDLERS ---

    const handleSelectItem = useCallback((item: OwnedItem) => setSelectedItem(item), []);
    const handleSelectSlot = useCallback((slotType: EquipmentSlotType) => {
        const item = equippedItemsMap[slotType];
        if (item) setSelectedItem(item);
    }, [equippedItemsMap]);

    const handleOpenEnhanceModal = useCallback((item: OwnedItem) => {
        setSelectedItem(item);
        setIsEnhanceModalOpen(true);
    }, []);

    const value: EquipmentContextType = {
        isLoading: isGameDataLoading,
        gold, 
        equipmentPieces, 
        enhancementStones,
        ownedItems, 
        equippedItems, 
        selectedItem, 
        newlyCraftedItem, 
        isForgeModalOpen, 
        isStatsModalOpen, 
        isEnhanceModalOpen,
        isProcessing, 
        dismantleSuccessToast,
        equippedItemsMap, 
        unequippedItemsSorted, 
        totalEquippedStats, 
        userStatsValue,
        handleEquipItem, 
        handleUnequipItem, 
        handleCraftItem, 
        handleDismantleItem, 
        handleForgeItems,
        handleEnhanceItem,
        handleSelectItem, 
        handleSelectSlot, 
        handleCloseDetailModal: () => setSelectedItem(null), 
        handleCloseCraftSuccessModal: () => setNewlyCraftedItem(null), 
        handleOpenForgeModal: () => setIsForgeModalOpen(true), 
        handleCloseForgeModal: () => setIsForgeModalOpen(false), 
        handleOpenStatsModal: () => setIsStatsModalOpen(true), 
        handleCloseStatsModal: () => setIsStatsModalOpen(false),
        handleOpenEnhanceModal,
        handleCloseEnhanceModal: () => setIsEnhanceModalOpen(false),
        MAX_ITEMS_IN_STORAGE, 
        CRAFTING_COST,
    };

    return (
        <EquipmentContext.Provider value={value}>
            {message && (
                <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">
                    {message}
                </div>
            )}
            {children}
        </EquipmentContext.Provider>
    );
 };

export const useEquipment = (): EquipmentContextType => {
    const context = useContext(EquipmentContext);
    if (context === undefined) {
        throw new Error('useEquipment must be used within an EquipmentProvider');
    }
    return context;
};
