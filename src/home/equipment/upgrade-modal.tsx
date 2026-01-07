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

// --- ĐỊNH NGHĨA ĐÁ CƯỜNG HOÁ ---
export type StoneTier = 'low' | 'medium' | 'high';

export interface EnhancementStone {
    id: StoneTier;
    name: string;
    successRate: number; // 0.0 - 1.0
    color: string;
    description: string;
}

export const ENHANCEMENT_STONES: Record<StoneTier, EnhancementStone> = {
    low: { 
        id: 'low', 
        name: 'Đá Sơ Cấp', 
        successRate: 0.30, 
        color: 'text-green-400', 
        description: '' 
    },
    medium: { 
        id: 'medium', 
        name: 'Đá Trung Cấp', 
        successRate: 0.60, 
        color: 'text-blue-400', 
        description: '' 
    },
    high: { 
        id: 'high', 
        name: 'Đá Cao Cấp', 
        successRate: 0.90, 
        color: 'text-orange-400', 
        description: '' 
    },
};

const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const MAX_ITEMS_IN_STORAGE = 50;

const getBaseUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
    const baseCost = 50;
    return Math.floor(baseCost * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]);
};

const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += getBaseUpgradeCost(itemDef, i);
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
        const costForNextLevel = getBaseUpgradeCost(definition, finalLevel);
        if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; }
    }
    return { level: finalLevel, refundGold: remainingGold };
};

interface EquipmentProviderProps {
    children: ReactNode;
}

interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: { level: number; refundGold: number; }; 
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
    
    itemToUpgrade: OwnedItem | null;
    isUpgradeModalOpen: boolean;
    stoneCounts: Record<StoneTier, number>;

    equippedItemsMap: { [key in EquipmentSlotType]: OwnedItem | null };
    unequippedItemsSorted: OwnedItem[];
    totalEquippedStats: { hp: number; atk: number; def: number; };
    userStatsValue: { hp: number; atk: number; def: number; };

    handleEquipItem: (item: OwnedItem) => Promise<void>;
    handleUnequipItem: (item: OwnedItem) => Promise<void>;
    handleCraftItem: () => Promise<void>;
    handleDismantleItem: (item: OwnedItem) => Promise<void>;
    handleUpgradeItem: (item: OwnedItem, stoneTier: StoneTier) => Promise<boolean>;
    handleForgeItems: (group: ForgeGroup) => Promise<void>;
    
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

export const EquipmentProvider: FC<EquipmentProviderProps> = ({ children }) => {
    const {
        coins: gold,
        equipmentPieces,
        ownedItems: rawOwnedItems,
        equippedItems,
        isLoading: isGameDataLoading,
        userStatsValue,
    } = useGame();

    const ownedItems = useMemo(() => {
        if (!rawOwnedItems) return [];
        return rawOwnedItems.map(item => ({
            ...item,
            stats: item.stats || {}
        }));
    }, [rawOwnedItems]);

    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [itemToUpgrade, setItemToUpgrade] = useState<OwnedItem | null>(null);

    const stoneCounts = useMemo<Record<StoneTier, number>>(() => ({
        low: 20,
        medium: 12,
        high: 5
    }), []);

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
        // Lưu ý: isProcessing đã được check ở UI, hàm này chỉ thực thi
        setIsProcessing(true);
        try {
            await updateUserInventory(userId, updates);
        } catch (error: any) { 
            showMessage(`Lỗi: ${error.message || 'Cập nhật thất bại'}`); 
            throw error;
        } finally { 
            setIsProcessing(false); 
        }
    }, [showMessage]); // Bỏ isProcessing ra khỏi dep để tránh stale closure trong flow async

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
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToEquip.itemId);
        if (!itemDef || !(itemDef.type in { weapon: 1, armor: 1, Helmet: 1 })) { showMessage("Vật phẩm này không thể trang bị."); return; }
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] === itemToEquip.id) { showMessage("Trang bị đã được mặc."); return; }
        
        const newEquipped = { ...equippedItems, [slotType]: itemToEquip.id };
        try {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
            setSelectedItem(null);
        } catch (error) { console.error(`Equip failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate, showMessage, isProcessing]);

    const handleUnequipItem = useCallback(async (itemToUnequip: OwnedItem) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToUnequip.itemId);
        if (!itemDef) return;
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] !== itemToUnequip.id) { showMessage("Lỗi: Không tìm thấy trang bị."); return; }
        
        const newEquipped = { ...equippedItems, [slotType]: null };
        try {
            await performInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
            setSelectedItem(null);
        } catch (error) { console.error(`Unequip failed:`, error); }
    }, [equippedItems, ownedItems, performInventoryUpdate, showMessage, isProcessing]);
  
    const handleCraftItem = useCallback(async () => {
        if (isProcessing) return;
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
    }, [equipmentPieces, ownedItems, equippedItems, performInventoryUpdate, showMessage, unequippedItemsSorted.length, isProcessing]);

    const handleDismantleItem = useCallback(async (itemToDismantle: OwnedItem) => {
        if (isProcessing) return;
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
    }, [equippedItems, ownedItems, performInventoryUpdate, showMessage, isProcessing]);

    // --- LOGIC NÂNG CẤP MỚI: OPTIMISTIC UPDATE ---
    const handleUpgradeItem = useCallback(async (item: OwnedItem, stoneTier: StoneTier): Promise<boolean> => {
        // Nếu đang xử lý (spam nút), chặn lại
        if (isProcessing) return false;

        const stone = ENHANCEMENT_STONES[stoneTier];
        const isSuccess = Math.random() < stone.successRate;

        // 1. Nếu thất bại:
        if (!isSuccess) {
            // Vẫn gọi hàm update inventory để trừ đá (logic trừ đá nên nằm trong updateUserInventory hoặc service)
            // Ở đây ta gọi "Fire-and-forget" - không await kết quả để UI phản hồi ngay
            performInventoryUpdate({ newOwned: ownedItems, newEquipped: equippedItems, goldChange: 0, piecesChange: 0 })
                .catch(err => console.error("Sync failed:", err));
            
            // Trả về false NGAY LẬP TỨC để modal hiện ảnh Failed
            return false;
        }

        // 2. Nếu thành công: Tính toán chỉ số ngay tại Client
        const upgradableStats = Object.keys(item.stats).filter(k => typeof item.stats[k] === 'number');
        if (upgradableStats.length === 0) {
            showMessage("Trang bị không có chỉ số để nâng cấp.");
            return false;
        }
        
        const statKey = upgradableStats[Math.floor(Math.random() * upgradableStats.length)];
        const currentValue = item.stats[statKey];
        const increasePercent = 0.02 + Math.random() * 0.04; 
        const increase = Math.max(1, Math.round(currentValue * increasePercent));
        
        const newStats = { ...item.stats, [statKey]: currentValue + increase };
        const updatedItem = { ...item, level: item.level + 1, stats: newStats };
        
        const newOwnedList = ownedItems.map(s => s.id === item.id ? updatedItem : s);

        // 3. Cập nhật state UI NGAY LẬP TỨC (Optimistic UI)
        // Cập nhật modal
        setItemToUpgrade(updatedItem); 
        // Cập nhật detail nếu đang mở
        if (selectedItem?.id === item.id) setSelectedItem(updatedItem);

        // 4. Gọi Firestore chạy ngầm (Không await)
        performInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: 0, piecesChange: 0 })
            .catch(err => {
                console.error("Sync upgrade failed:", err);
                // TODO: Nếu muốn chuẩn xác hơn, ở đây nên có logic Revert state nếu lỗi
            });

        // 5. Trả về true NGAY LẬP TỨC để modal hiện chữ Success
        return true;

    }, [ownedItems, equippedItems, performInventoryUpdate, selectedItem, showMessage, isProcessing]);

    const handleForgeItems = useCallback(async (group: ForgeGroup) => {
        if (isProcessing) return;
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
    }, [ownedItems, equippedItems, performInventoryUpdate, showMessage, isProcessing]);

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

    const handleOpenUpgradeModal = useCallback((item: OwnedItem) => {
        setSelectedItem(null); 
        setItemToUpgrade(item);
        setIsUpgradeModalOpen(true);
    }, []);

    const handleCloseUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(false);
        setItemToUpgrade(null);
    }, []);
    
    const value: EquipmentContextType = {
        isLoading: isGameDataLoading,
        gold, equipmentPieces, ownedItems, equippedItems, selectedItem, newlyCraftedItem, isForgeModalOpen, isStatsModalOpen, isProcessing, dismantleSuccessToast,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue,
        handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem, handleUpgradeItem, handleForgeItems,
        handleSelectItem, handleSelectSlot, handleCloseDetailModal, handleCloseCraftSuccessModal, handleOpenForgeModal, handleCloseForgeModal, handleOpenStatsModal, handleCloseStatsModal,
        itemToUpgrade, isUpgradeModalOpen, handleOpenUpgradeModal, handleCloseUpgradeModal,
        stoneCounts, 
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST,
    };

    return (
        <EquipmentContext.Provider value={value}>
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
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
