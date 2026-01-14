// --- START OF FILE equipment-context.tsx ---

import React, { createContext, useState, useMemo, useCallback, useContext, type ReactNode, type FC } from 'react';
import { 
    getItemDefinition, 
    itemBlueprints, 
    generateItemDefinition,
    type ItemBlueprint,
    type ItemDefinition, 
    type ItemRank, 
    RARITY_ORDER 
} from './item-database.ts';
import { updateUserInventory } from './equipment-service.ts';
import type { OwnedItem, EquippedItems, EquipmentSlotType } from './equipment-ui.tsx';
import { useGame } from '../../GameContext.tsx'; 
import { auth } from '../../firebase.js';

// --- ĐỊNH NGHĨA ĐÁ CƯỜNG HOÁ ---
export type StoneTier = 'low' | 'medium' | 'high';

export interface EnhancementStone {
    id: StoneTier;
    name: string;
    successRate: number; // 0.0 - 1.0
    color: string;
}

export const ENHANCEMENT_STONES: Record<StoneTier, EnhancementStone> = {
    low: { id: 'low', name: 'Đá Sơ Cấp', successRate: 0.30, color: 'text-green-400' },
    medium: { id: 'medium', name: 'Đá Trung Cấp', successRate: 0.60, color: 'text-blue-400' },
    high: { id: 'high', name: 'Đá Cao Cấp', successRate: 0.90, color: 'text-orange-400' },
};

// --- HẰNG SỐ LOGIC ---
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const MAX_ITEMS_IN_STORAGE = 50;

// --- HÀM TIỆN ÍCH ---
const getBaseUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
    return Math.floor(50 * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]);
};

const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) total += getBaseUpgradeCost(itemDef, i);
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
        const costForNextLevel = getBaseUpgradeCost(definition, finalLevel);
        if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else break;
    }
    return { level: finalLevel, refundGold: remainingGold };
};

// --- INTERFACES ---
interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
}

interface EquipmentContextType {
    isLoading: boolean;
    gold: number;
    equipmentPieces: number;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    selectedItem: OwnedItem | null;
    newlyCraftedItem: OwnedItem | null;
    isForgeModalOpen: boolean;
    isStatsModalOpen: boolean;
    isProcessing: boolean;
    dismantleSuccessToast: { show: boolean; message: string };
    
    // Upgrade State
    itemToUpgrade: OwnedItem | null;
    isUpgradeModalOpen: boolean;
    stoneCounts: Record<StoneTier, number>;

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
    handleUpgradeItem: (item: OwnedItem, stoneTier: StoneTier) => Promise<boolean>;
    handleForgeItems: (group: ForgeGroup) => Promise<void>;
    
    // UI Handlers
    handleSelectItem: (item: OwnedItem) => void;
    handleSelectSlot: (slot: EquipmentSlotType) => void;
    handleCloseDetailModal: () => void;
    handleCloseCraftSuccessModal: () => void;
    handleOpenForgeModal: () => void;
    handleCloseForgeModal: () => void;
    handleOpenStatsModal: () => void;
    handleCloseStatsModal: () => void;
    handleOpenUpgradeModal: (item: OwnedItem) => void;
    handleCloseUpgradeModal: () => void;

    MAX_ITEMS_IN_STORAGE: number;
    CRAFTING_COST: number;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const {
        coins: gold,
        equipmentPieces,
        ownedItems: rawOwnedItems,
        equippedItems,
        isLoading: isGameDataLoading,
        userStatsValue,
        stones, // Lấy từ GameContext
    } = useGame();

    const ownedItems = useMemo(() => {
        return (rawOwnedItems || []).map(item => ({ ...item, stats: item.stats || {} }));
    }, [rawOwnedItems]);

    // Local UI State
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [itemToUpgrade, setItemToUpgrade] = useState<OwnedItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dismantleSuccessToast, setDismantleSuccessToast] = useState({ show: false, message: '' });
    const [message, setMessage] = useState('');

    const stoneCounts = useMemo(() => ({
        low: stones?.low || 0,
        medium: stones?.medium || 0,
        high: stones?.high || 0
    }), [stones]);

    const showMessage = useCallback((text: string) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 3000);
    }, []);

    const performInventoryUpdate = useCallback(async (updates: any) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return Promise.reject("Unauthorized");
        setIsProcessing(true);
        try {
            await updateUserInventory(userId, updates);
        } catch (error: any) {
            showMessage(error.message || "Cập nhật thất bại");
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [showMessage]);

    const unequippedItemsSorted = useMemo(() => {
        const equippedIds = Object.values(equippedItems);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const defA = getItemDefinition(a.itemId);
                const defB = getItemDefinition(b.itemId);
                if (!defA || !defB) return 0;
                const rA = RARITY_ORDER.indexOf(defA.rarity);
                const rB = RARITY_ORDER.indexOf(defB.rarity);
                return rB !== rA ? rB - rA : b.level - a.level;
            });
    }, [ownedItems, equippedItems]);

    // Handlers logic
    const handleEquipItem = useCallback(async (item: OwnedItem) => {
        const def = getItemDefinition(item.itemId);
        if (!def) return;
        const newEquipped = { ...equippedItems, [def.type]: item.id };
        await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
        setSelectedItem(null);
    }, [equippedItems, ownedItems, performInventoryUpdate]);

    const handleUnequipItem = useCallback(async (item: OwnedItem) => {
        const def = getItemDefinition(item.itemId);
        if (!def) return;
        const newEquipped = { ...equippedItems, [def.type]: null };
        await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
        setSelectedItem(null);
    }, [equippedItems, ownedItems, performInventoryUpdate]);

    const handleCraftItem = useCallback(async () => {
        if (equipmentPieces < CRAFTING_COST) return showMessage("Không đủ mảnh trang bị");
        const blueprint = itemBlueprints[Math.floor(Math.random() * itemBlueprints.length)];
        const def = generateItemDefinition(blueprint, getRandomRank(), true);
        const newItem: OwnedItem = { id: `item-${Date.now()}`, itemId: def.id, level: 1, stats: def.stats || {} };
        await performInventoryUpdate({ newOwned: [...ownedItems, newItem], newEquipped: equippedItems, goldChange: 0, piecesChange: -CRAFTING_COST });
        setNewlyCraftedItem(newItem);
    }, [equipmentPieces, ownedItems, equippedItems, performInventoryUpdate, showMessage]);

    const handleDismantleItem = useCallback(async (item: OwnedItem) => {
        const def = getItemDefinition(item.itemId)!;
        const goldRefund = getTotalUpgradeCost(def, item.level);
        const newOwned = ownedItems.filter(i => i.id !== item.id);
        await performInventoryUpdate({ newOwned, newEquipped: equippedItems, goldChange: goldRefund, piecesChange: DISMANTLE_RETURN_PIECES });
        setSelectedItem(null);
        setDismantleSuccessToast({ show: true, message: 'Đã phân rã trang bị' });
        setTimeout(() => setDismantleSuccessToast({ show: false, message: '' }), 3000);
    }, [ownedItems, equippedItems, performInventoryUpdate]);

    const handleUpgradeItem = useCallback(async (item: OwnedItem, stoneTier: StoneTier) => {
        if (stoneCounts[stoneTier] < 1) return false;
        const isSuccess = Math.random() < ENHANCEMENT_STONES[stoneTier].successRate;
        const stoneCost = { [stoneTier]: -1 };

        if (!isSuccess) {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped: equippedItems, goldChange: 0, piecesChange: 0, stoneChanges: stoneCost });
            return false;
        }

        const newStats = { ...item.stats };
        Object.keys(newStats).forEach(k => {
            if (typeof newStats[k] === 'number') newStats[k] += Math.max(1, Math.round(newStats[k] * 0.01));
        });

        const upgraded = { ...item, level: item.level + 1, stats: newStats };
        const newOwned = ownedItems.map(i => i.id === item.id ? upgraded : i);
        await performInventoryUpdate({ newOwned, newEquipped: equippedItems, goldChange: 0, piecesChange: 0, stoneChanges: stoneCost });
        setItemToUpgrade(upgraded);
        return true;
    }, [ownedItems, equippedItems, stoneCounts, performInventoryUpdate]);

    const handleForgeItems = useCallback(async (group: ForgeGroup) => {
        const consumed = group.items.slice(0, 3);
        const ids = consumed.map(c => c.id);
        const baseDef = getItemDefinition(consumed[0].itemId)!;
        const { level, refundGold } = calculateForgeResult(consumed, baseDef);
        const nextDef = generateItemDefinition(group.blueprint, group.nextRank!, true);
        const forged: OwnedItem = { id: `forge-${Date.now()}`, itemId: nextDef.id, level, stats: nextDef.stats || {} };
        const newOwned = ownedItems.filter(i => !ids.includes(i.id)).concat(forged);
        await performInventoryUpdate({ newOwned, newEquipped: equippedItems, goldChange: refundGold, piecesChange: 0 });
        setIsForgeModalOpen(false);
    }, [ownedItems, equippedItems, performInventoryUpdate]);

    const equippedItemsMap = useMemo(() => {
        const map: any = { weapon: null, armor: null, Helmet: null };
        Object.entries(equippedItems).forEach(([slot, id]) => {
            if (id) map[slot] = ownedItems.find(i => i.id === id) || null;
        });
        return map;
    }, [equippedItems, ownedItems]);

    const totalEquippedStats = useMemo(() => {
        const t = { hp: 0, atk: 0, def: 0 };
        Object.values(equippedItemsMap).forEach((i: any) => {
            if (i?.stats) { t.hp += i.stats.hp || 0; t.atk += i.stats.atk || 0; t.def += i.stats.def || 0; }
        });
        return t;
    }, [equippedItemsMap]);

    // UI Toggle Handlers
    const handleSelectItem = (item: OwnedItem) => setSelectedItem(item);
    const handleSelectSlot = (slot: EquipmentSlotType) => { if (equippedItemsMap[slot]) setSelectedItem(equippedItemsMap[slot]); };
    const handleCloseDetailModal = () => setSelectedItem(null);
    const handleCloseCraftSuccessModal = () => setNewlyCraftedItem(null);
    const handleOpenForgeModal = () => setIsForgeModalOpen(true);
    const handleCloseForgeModal = () => setIsForgeModalOpen(false);
    const handleOpenStatsModal = () => setIsStatsModalOpen(true);
    const handleCloseStatsModal = () => setIsStatsModalOpen(false);
    const handleOpenUpgradeModal = (item: OwnedItem) => { setSelectedItem(null); setItemToUpgrade(item); setIsUpgradeModalOpen(true); };
    const handleCloseUpgradeModal = () => setIsUpgradeModalOpen(false);

    const value = {
        isLoading: isGameDataLoading, gold, equipmentPieces, ownedItems, equippedItems, selectedItem, newlyCraftedItem, isForgeModalOpen, isStatsModalOpen, isProcessing, dismantleSuccessToast,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue, itemToUpgrade, isUpgradeModalOpen, stoneCounts,
        handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem, handleUpgradeItem, handleForgeItems,
        handleSelectItem, handleSelectSlot, handleCloseDetailModal, handleCloseCraftSuccessModal, handleOpenForgeModal, handleCloseForgeModal, handleOpenStatsModal, handleCloseStatsModal, handleOpenUpgradeModal, handleCloseUpgradeModal,
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST
    };

    return (
        <EquipmentContext.Provider value={value}>
            {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-2 rounded-full font-bold z-[200] animate-bounce">{message}</div>}
            {children}
        </EquipmentContext.Provider>
    );
};

export const useEquipment = () => {
    const context = useContext(EquipmentContext);
    if (!context) throw new Error('useEquipment must be used within an EquipmentProvider');
    return context;
};

// --- END OF FILE equipment-context.tsx ---
