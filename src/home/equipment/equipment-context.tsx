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
// THAY ĐỔI: Import useGame để truy cập state toàn cục và auth để lấy userId
import { useGame } from '../../GameContext.tsx'; 
import { auth } from '../../firebase.js';

// Định nghĩa các hằng số logic
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const MAX_ITEMS_IN_STORAGE = 50;

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
        if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; }
    }
    return { level: finalLevel, refundGold: remainingGold };
};


// Interface cho các props của Provider
interface EquipmentProviderProps {
    children: ReactNode;
}

// Interface định nghĩa ForgeGroup để dùng trong hàm handleForgeItems
interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: { level: number; refundGold: number; }; 
}

// Interface định nghĩa những gì Context sẽ cung cấp
interface EquipmentContextType {
    // State
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
    
    // Derived State
    equippedItemsMap: { [key in EquipmentSlotType]: OwnedItem | null };
    unequippedItemsSorted: OwnedItem[];
    totalEquippedStats: { hp: number; atk: number; def: number; };
    // THÊM MỚI: Lấy chỉ số nâng cấp
    userStatsValue: { hp: number; atk: number; def: number; };

    // Handlers
    handleEquipItem: (item: OwnedItem) => Promise<void>;
    handleUnequipItem: (item: OwnedItem) => Promise<void>;
    handleCraftItem: () => Promise<void>;
    handleDismantleItem: (item: OwnedItem) => Promise<void>;
    handleUpgradeItem: (item: OwnedItem, statKey: string, increase: number) => Promise<void>;
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

    // Constants
    MAX_ITEMS_IN_STORAGE: number;
    CRAFTING_COST: number;
}

// Tạo Context
const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

// Tạo Provider Component
export const EquipmentProvider: FC<EquipmentProviderProps> = ({ children }) => {
    // Lấy state trực tiếp từ GameContext
    const {
        coins: gold,
        equipmentPieces,
        ownedItems: rawOwnedItems,
        equippedItems,
        isLoading: isGameDataLoading,
        userStatsValue, // THÊM MỚI
    } = useGame();

    const ownedItems = useMemo(() => {
        if (!rawOwnedItems) return [];
        return rawOwnedItems.map(item => ({
            ...item,
            stats: item.stats || {}
        }));
    }, [rawOwnedItems]);

    // Các state này vẫn là cục bộ vì chúng chỉ liên quan đến UI của màn hình trang bị
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dismantleSuccessToast, setDismantleSuccessToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);

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

    const unequippedItemsSorted = useMemo(() => {
        const equippedIds = Object.values(equippedItems).filter(id => id !== null);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const itemDefA = getItemDefinition(a.itemId);
                const itemDefB = getItemDefinition(b.itemId);
                if (!itemDefA) return 1;
                if (!itemDefB) return -1;
                const rarityIndexA = RARITY_ORDER.indexOf(itemDefA.rarity);
                const rarityIndexB = RARITY_ORDER.indexOf(itemDefB.rarity);
                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                if (a.level !== b.level) return b.level - a.level;
                return itemDefA.name.localeCompare(itemDefB.name);
            });
    }, [ownedItems, equippedItems]);

    const handleEquipItem = useCallback(async (itemToEquip: OwnedItem) => {
        const itemDef = getItemDefinition(itemToEquip.itemId);
        if (!itemDef || !(itemDef.type in { weapon: 1, armor: 1, Helmet: 1 })) { showMessage("Vật phẩm này không thể trang bị."); return; }
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] === itemToEquip.id) { showMessage("Trang bị đã được mặc."); return; }
        
        const newEquipped = { ...equippedItems, [slotType]: itemToEquip.id };
        try {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
            setSelectedItem(null);
        } catch (error) { console.error(`Equip failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate, showMessage]);

    const handleUnequipItem = useCallback(async (itemToUnequip: OwnedItem) => {
        const itemDef = getItemDefinition(itemToUnequip.itemId);
        if (!itemDef) return;
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] !== itemToUnequip.id) { showMessage("Lỗi: Không tìm thấy trang bị."); return; }
        
        const newEquipped = { ...equippedItems, [slotType]: null };
        try {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
            setSelectedItem(null);
        } catch (error) { console.error(`Unequip failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate, showMessage]);
  
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

    const handleUpgradeItem = useCallback(async (itemToUpgrade: OwnedItem, statKey: string, increase: number) => {
        const itemDef = getItemDefinition(itemToUpgrade.itemId)!;
        const cost = getUpgradeCost(itemDef, itemToUpgrade.level);
        if (gold < cost) { showMessage(`Không đủ vàng. Cần ${cost.toLocaleString()}.`); return; }
        
        const newStats = { ...itemToUpgrade.stats };
        if (newStats.hasOwnProperty(statKey) && typeof newStats[statKey] === 'number') {
            newStats[statKey] += increase;
        } else {
            showMessage("Lỗi: Không thể nâng cấp chỉ số không tồn tại.");
            return;
        }

        const updatedItem = { ...itemToUpgrade, level: itemToUpgrade.level + 1, stats: newStats };
        const newOwnedList = ownedItems.map(s => s.id === itemToUpgrade.id ? updatedItem : s);
        try {
            await performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: -cost, piecesChange: 0 });
            setSelectedItem(updatedItem);
        } catch(error) { console.error(`Upgrade failed:`, error); }
    }, [gold, ownedItems, equippedItems, performInventoryUpdate, showMessage]);

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

    const handleSelectItem = useCallback((item: OwnedItem) => setSelectedItem(item), []);
    const handleSelectSlot = useCallback((slotType: EquipmentSlotType) => {
        const item = equippedItemsMap[slotType];
        if (item) setSelectedItem(item);
    }, [equippedItemsMap]);
    const handleCloseDetailModal = useCallback(() => setSelectedItem(null), []);
    const handleCloseCraftSuccessModal = useCallback(() => setNewlyCraftedItem(null), []);
    const handleCloseForgeModal = useCallback(() => setIsForgeModalOpen(false), []);
    const handleOpenForgeModal = useCallback(() => setIsForgeModalOpen(true), []);
    const handleOpenStatsModal = useCallback(() => setIsStatsModalOpen(true), []);
    const handleCloseStatsModal = useCallback(() => setIsStatsModalOpen(false), []);
    
    const value: EquipmentContextType = {
        isLoading: isGameDataLoading,
        gold, equipmentPieces, ownedItems, equippedItems, selectedItem, newlyCraftedItem, isForgeModalOpen, isStatsModalOpen, isProcessing, dismantleSuccessToast,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue,
        handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem, handleUpgradeItem, handleForgeItems,
        handleSelectItem, handleSelectSlot, handleCloseDetailModal, handleCloseCraftSuccessModal, handleOpenForgeModal, handleCloseForgeModal, handleOpenStatsModal, handleCloseStatsModal,
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST,
    };

    return (
        <EquipmentContext.Provider value={value}>
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
            {children}
        </EquipmentContext.Provider>
    );
 };

// Tạo custom hook để sử dụng context
export const useEquipment = (): EquipmentContextType => {
    const context = useContext(EquipmentContext);
    if (context === undefined) {
        throw new Error('useEquipment must be used within an EquipmentProvider');
    }
    return context;
};
