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
import { useGame } from '../../GameContext.tsx'; 
import { auth } from '../../firebase.js';

// --- CẤU HÌNH LOGIC ---
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const MAX_ITEMS_IN_STORAGE = 50;

export type EnhancementStoneType = 'basic' | 'medium' | 'advanced';

export const ENHANCEMENT_CONFIG = {
    basic: { 
        name: 'Đá Sơ Cấp', 
        chance: 0.5, // 50%
        goldCost: 100, 
        icon: '🪨',
        color: 'text-gray-400'
    },
    medium: { 
        name: 'Đá Trung Cấp', 
        chance: 0.8, // 80%
        goldCost: 400, 
        icon: '💎',
        color: 'text-blue-400'
    },
    advanced: { 
        name: 'Đá Cao Cấp', 
        chance: 1.0, // 100%
        goldCost: 1500, 
        icon: '✨',
        color: 'text-yellow-400'
    },
};

// --- HELPER FUNCTIONS ---
const getUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
    const baseCost = 50;
    return Math.floor(baseCost * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]);
};

const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) total += getUpgradeCost(itemDef, i);
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
        if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; }
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
    // State
    isLoading: boolean;
    gold: number;
    equipmentPieces: number;
    enhancementStones: { [key in EnhancementStoneType]: number };
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    selectedItem: OwnedItem | null;
    newlyCraftedItem: OwnedItem | null;
    isForgeModalOpen: boolean;
    isStatsModalOpen: boolean;
    isEnhanceModalOpen: boolean; // Mới
    isProcessing: boolean;
    dismantleSuccessToast: { show: boolean; message: string };
    
    // Derived State
    equippedItemsMap: { [key in EquipmentSlotType]: OwnedItem | null };
    unequippedItemsSorted: OwnedItem[];
    totalEquippedStats: { hp: number; atk: number; def: number; };
    userStatsValue: { hp: number; atk: number; def: number; };

    // Handlers
    handleEquipItem: (item: OwnedItem) => Promise<void>;
    handleUnequipItem: (item: OwnedItem) => Promise<void>;
    handleCraftItem: () => Promise<void>;
    handleDismantleItem: (item: OwnedItem) => Promise<void>;
    handleForgeItems: (group: ForgeGroup) => Promise<void>;
    handleEnhanceItem: (item: OwnedItem, stoneType: EnhancementStoneType) => Promise<{ success: boolean }>; // Mới
    
    // UI Handlers
    handleSelectItem: (item: OwnedItem) => void;
    handleSelectSlot: (slot: EquipmentSlotType) => void;
    handleCloseDetailModal: () => void;
    handleCloseCraftSuccessModal: () => void;
    handleOpenForgeModal: () => void;
    handleCloseForgeModal: () => void;
    handleOpenStatsModal: () => void;
    handleCloseStatsModal: () => void;
    handleOpenEnhanceModal: (item: OwnedItem) => void; // Mới
    handleCloseEnhanceModal: () => void; // Mới

    // Constants
    MAX_ITEMS_IN_STORAGE: number;
    CRAFTING_COST: number;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const {
        coins: gold,
        equipmentPieces,
        enhancementStones = { basic: 0, medium: 0, advanced: 0 }, // Giả định có trong GameContext
        ownedItems: rawOwnedItems,
        equippedItems,
        isLoading: isGameDataLoading,
        userStatsValue,
    } = useGame();

    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dismantleSuccessToast, setDismantleSuccessToast] = useState({ show: false, message: '' });
    
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);

    const ownedItems = useMemo(() => {
        if (!rawOwnedItems) return [];
        return rawOwnedItems.map(item => ({ ...item, stats: item.stats || {} }));
    }, [rawOwnedItems]);

    const showMessage = useCallback((text: string) => {
        setMessage(text); setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    const performInventoryUpdate = useCallback(async (updates: { 
        newOwned: OwnedItem[]; 
        newEquipped: EquippedItems; 
        goldChange: number; 
        piecesChange: number;
        stoneType?: EnhancementStoneType;
        stoneChange?: number;
    }) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("Not authenticated");
        if (isProcessing) return Promise.reject("Processing");
        
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

    // --- LOGIC CƯỜNG HÓA MỚI ---
    const handleEnhanceItem = useCallback(async (itemToUpgrade: OwnedItem, stoneType: EnhancementStoneType) => {
        const config = ENHANCEMENT_CONFIG[stoneType];
        
        if (gold < config.goldCost) { showMessage("Không đủ vàng!"); return { success: false }; }
        if (enhancementStones[stoneType] <= 0) { showMessage("Không đủ Đá cường hóa!"); return { success: false }; }

        const isSuccess = Math.random() < config.chance;
        let newOwnedList = [...ownedItems];
        let updatedItem = { ...itemToUpgrade };

        if (isSuccess) {
            // Tăng chỉ số ngẫu nhiên
            const statKeys = Object.keys(itemToUpgrade.stats).filter(k => typeof itemToUpgrade.stats[k] === 'number');
            const statToUpgrade = statKeys[Math.floor(Math.random() * statKeys.length)];
            const currentValue = itemToUpgrade.stats[statToUpgrade];
            
            // Tăng 2% - 6% chỉ số hiện tại
            const increase = Math.max(1, Math.round(currentValue * (0.02 + Math.random() * 0.04)));
            
            updatedItem = {
                ...itemToUpgrade,
                level: itemToUpgrade.level + 1,
                stats: { ...itemToUpgrade.stats, [statToUpgrade]: currentValue + increase }
            };
            newOwnedList = ownedItems.map(s => s.id === itemToUpgrade.id ? updatedItem : s);
            setSelectedItem(updatedItem);
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
            return { success: false };
        }
    }, [gold, enhancementStones, ownedItems, equippedItems, performInventoryUpdate, showMessage]);

    // --- CÁC LOGIC CŨ (EQUIP, CRAFT, FORGE...) ---
    const unequippedItemsSorted = useMemo(() => {
        const equippedIds = Object.values(equippedItems).filter(id => id !== null);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const itemDefA = getItemDefinition(a.itemId);
                const itemDefB = getItemDefinition(b.itemId);
                if (!itemDefA || !itemDefB) return 0;
                const rarityIndexA = RARITY_ORDER.indexOf(itemDefA.rarity);
                const rarityIndexB = RARITY_ORDER.indexOf(itemDefB.rarity);
                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                return b.level - a.level;
            });
    }, [ownedItems, equippedItems]);

    const handleEquipItem = useCallback(async (item: OwnedItem) => {
        const itemDef = getItemDefinition(item.itemId);
        if (!itemDef) return;
        const newEquipped = { ...equippedItems, [itemDef.type]: item.id };
        await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
        setSelectedItem(null);
    }, [equippedItems, ownedItems, performInventoryUpdate]);

    const handleUnequipItem = useCallback(async (item: OwnedItem) => {
        const itemDef = getItemDefinition(item.itemId);
        if (!itemDef) return;
        const newEquipped = { ...equippedItems, [itemDef.type]: null };
        await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
        setSelectedItem(null);
    }, [equippedItems, ownedItems, performInventoryUpdate]);

    const handleCraftItem = useCallback(async () => {
        if (equipmentPieces < CRAFTING_COST) { showMessage("Không đủ mảnh!"); return; }
        const randomBlueprint = itemBlueprints[Math.floor(Math.random() * itemBlueprints.length)];
        const finalItemDef = generateItemDefinition(randomBlueprint, getRandomRank(), true);
        const newOwnedItem = { id: `owned-${Date.now()}`, itemId: finalItemDef.id, level: 1, stats: finalItemDef.stats || {} };
        await performInventoryUpdate({ newOwned: [...ownedItems, newOwnedItem], newEquipped: equippedItems, goldChange: 0, piecesChange: -CRAFTING_COST });
        setNewlyCraftedItem(newOwnedItem);
    }, [equipmentPieces, ownedItems, equippedItems, performInventoryUpdate, showMessage]);

    const handleDismantleItem = useCallback(async (item: OwnedItem) => {
        const itemDef = getItemDefinition(item.itemId)!;
        const goldToReturn = getTotalUpgradeCost(itemDef, item.level);
        const newOwnedList = ownedItems.filter(s => s.id !== item.id);
        await performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: goldToReturn, piecesChange: DISMANTLE_RETURN_PIECES });
        setSelectedItem(null);
        setDismantleSuccessToast({ show: true, message: 'Đã phân rã trang bị.' });
        setTimeout(() => setDismantleSuccessToast(p => ({ ...p, show: false })), 3000);
    }, [ownedItems, equippedItems, performInventoryUpdate]);

    const handleForgeItems = useCallback(async (group: ForgeGroup) => {
        const itemsToConsume = group.items.slice(0, 3);
        const itemIdsToConsume = itemsToConsume.map(s => s.id);
        const baseItemDef = getItemDefinition(itemsToConsume[0].itemId)!;
        const { level: finalLevel, refundGold } = calculateForgeResult(itemsToConsume, baseItemDef);
        const upgradedItemDef = generateItemDefinition(group.blueprint, group.nextRank!, true);

        const newForgedItem = { id: `forged-${Date.now()}`, itemId: upgradedItemDef.id, level: finalLevel, stats: upgradedItemDef.stats || {} };
        const newOwnedList = ownedItems.filter(s => !itemIdsToConsume.includes(s.id)).concat(newForgedItem);
        
        await performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: refundGold, piecesChange: 0 });
        setIsForgeModalOpen(false);
    }, [ownedItems, equippedItems, performInventoryUpdate]);

    // --- UI HANDLERS ---
    const equippedItemsMap = useMemo(() => {
        const map: any = { weapon: null, armor: null, Helmet: null };
        Object.entries(equippedItems).forEach(([slot, id]) => {
            if (id) map[slot] = ownedItems.find(i => i.id === id) || null;
        });
        return map;
    }, [equippedItems, ownedItems]);

    const totalEquippedStats = useMemo(() => {
        const totals = { hp: 0, atk: 0, def: 0 };
        Object.values(equippedItemsMap).forEach((item: any) => {
            if (item?.stats) {
                totals.hp += item.stats.hp || 0;
                totals.atk += item.stats.atk || 0;
                totals.def += item.stats.def || 0;
            }
        });
        return totals;
    }, [equippedItemsMap]);

    const handleSelectItem = useCallback((item: OwnedItem) => setSelectedItem(item), []);
    const handleSelectSlot = useCallback((slot: EquipmentSlotType) => {
        const item = equippedItemsMap[slot];
        if (item) setSelectedItem(item);
    }, [equippedItemsMap]);
    
    const handleOpenEnhanceModal = useCallback((item: OwnedItem) => {
        setSelectedItem(item);
        setIsEnhanceModalOpen(true);
    }, []);

    const value: EquipmentContextType = {
        isLoading: isGameDataLoading,
        gold, equipmentPieces, enhancementStones, ownedItems, equippedItems, selectedItem, newlyCraftedItem,
        isForgeModalOpen, isStatsModalOpen, isEnhanceModalOpen, isProcessing, dismantleSuccessToast,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue,
        handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem, handleForgeItems, handleEnhanceItem,
        handleSelectItem, handleSelectSlot, 
        handleCloseDetailModal: () => setSelectedItem(null),
        handleCloseCraftSuccessModal: () => setNewlyCraftedItem(null),
        handleOpenForgeModal: () => setIsForgeModalOpen(true),
        handleCloseForgeModal: () => setIsForgeModalOpen(false),
        handleOpenStatsModal: () => setIsStatsModalOpen(true),
        handleCloseStatsModal: () => setIsStatsModalOpen(false),
        handleOpenEnhanceModal,
        handleCloseEnhanceModal: () => setIsEnhanceModalOpen(false),
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST,
    };

    return (
        <EquipmentContext.Provider value={value}>
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
            {children}
        </EquipmentContext.Provider>
    );
};

export const useEquipment = () => {
    const context = useContext(EquipmentContext);
    if (!context) throw new Error('useEquipment must be used within EquipmentProvider');
    return context;
};
