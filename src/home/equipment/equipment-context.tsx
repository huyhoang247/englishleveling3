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

// Import Types từ Modal Thương Hội
import type { ResourceType, TradeOption } from './trade-association-modal.tsx';

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

// Định nghĩa các hằng số logic
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const MAX_ITEMS_IN_STORAGE = 50;

// Hàm tính giá trị nâng cấp
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


// Interface cho các props của Provider
interface EquipmentProviderProps {
    children: ReactNode;
}

// Interface định nghĩa ForgeGroup
interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: { level: number; refundGold: number; }; 
}

// Interface Context
interface EquipmentContextType {
    // State cơ bản
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
    
    // State cho Modal Nâng cấp
    itemToUpgrade: OwnedItem | null;
    isUpgradeModalOpen: boolean;
    stoneCounts: Record<StoneTier, number>;

    // State cho Thương Hội
    isTradeModalOpen: boolean;
    userResources: Record<ResourceType, number>; 

    // Derived State
    equippedItemsMap: { [key in EquipmentSlotType]: OwnedItem | null };
    unequippedItemsSorted: OwnedItem[];
    totalEquippedStats: { hp: number; atk: number; def: number; };
    userStatsValue: { hp: number; atk: number; def: number; };

    // Handlers logic
    handleEquipItem: (item: OwnedItem) => Promise<void>;
    handleUnequipItem: (item: OwnedItem) => Promise<void>;
    handleCraftItem: () => Promise<void>;
    handleDismantleItem: (item: OwnedItem) => Promise<void>;
    handleUpgradeItem: (item: OwnedItem, stoneTier: StoneTier) => Promise<boolean>;
    handleForgeItems: (group: ForgeGroup) => Promise<void>;
    
    // Handler Thương Hội
    handleExchangeResources: (option: TradeOption) => Promise<void>;
    handleOpenTradeModal: () => void;
    handleCloseTradeModal: () => void;

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

    // Constants
    MAX_ITEMS_IN_STORAGE: number;
    CRAFTING_COST: number;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: FC<EquipmentProviderProps> = ({ children }) => {
    // Lấy state từ GameContext
    const {
        coins: gold,
        equipmentPieces,
        ownedItems: rawOwnedItems,
        equippedItems,
        isLoading: isGameDataLoading,
        userStatsValue,
        // CẬP NHẬT: Lấy stones thực tế từ GameContext
        stones, 
        // Lấy tài nguyên từ GameContext (giả sử GameContext có các trường này, nếu không thì mặc định 0)
        // Lưu ý: Phần này phụ thuộc vào GameContext có export wood/leather/etc hay không.
        // Nếu GameContext chưa có, các giá trị này sẽ là undefined -> 0
    } = useGame();

    // Giả lập tài nguyên nếu GameContext chưa export (Bạn có thể thêm vào GameContext sau)
    // Ở đây tôi dùng biến tạm, bạn cần đảm bảo GameContext export các biến này nếu muốn tính năng Thương Hội hoạt động.
    const wood = (useGame() as any).wood || 0;
    const leather = (useGame() as any).leather || 0;
    const ore = (useGame() as any).ore || 0;
    const cloth = (useGame() as any).cloth || 0;

    const userResources = useMemo<Record<ResourceType, number>>(() => ({
        wood, leather, ore, cloth
    }), [wood, leather, ore, cloth]);

    const ownedItems = useMemo(() => {
        if (!rawOwnedItems) return [];
        return rawOwnedItems.map(item => ({
            ...item,
            stats: item.stats || {}
        }));
    }, [rawOwnedItems]);

    // Các state cục bộ cho UI
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [itemToUpgrade, setItemToUpgrade] = useState<OwnedItem | null>(null);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

    // CẬP NHẬT: Map số lượng đá từ GameContext vào UI
    const stoneCounts = useMemo<Record<StoneTier, number>>(() => ({
        low: stones?.low || 0,
        medium: stones?.medium || 0,
        high: stones?.high || 0
    }), [stones]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [dismantleSuccessToast, setDismantleSuccessToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);

    const showMessage = useCallback((text: string) => {
        setMessage(text); setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Hàm cập nhật xuống Firestore
    const performInventoryUpdate = useCallback(async (updates: { 
        newOwned: OwnedItem[]; 
        newEquipped: EquippedItems; 
        goldChange: number; 
        piecesChange: number;
        resourceChanges?: Record<string, number>; 
        // CẬP NHẬT: Thêm tham số đá cường hoá
        stoneChanges?: { low?: number; medium?: number; high?: number };
    }) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            showMessage("Lỗi: Người dùng chưa đăng nhập.");
            return Promise.reject("Not authenticated");
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
    }, [showMessage]);

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

    // --- HANDLERS ---

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

    // CẬP NHẬT: Logic Upgrade sử dụng đá thực tế và transaction
    const handleUpgradeItem = useCallback(async (item: OwnedItem, stoneTier: StoneTier): Promise<boolean> => {
        if (isProcessing) return false;

        // 1. Kiểm tra số lượng đá (Client-side check)
        if (stoneCounts[stoneTier] < 1) {
            showMessage("Không đủ đá cường hoá.");
            return false;
        }

        const stone = ENHANCEMENT_STONES[stoneTier];
        const isSuccess = Math.random() < stone.successRate;

        // Object đại diện cho việc trừ 1 viên đá
        const stoneCost = { [stoneTier]: -1 };

        if (!isSuccess) {
            // Thất bại: Chỉ trừ đá, giữ nguyên Item
            performInventoryUpdate({ 
                newOwned: ownedItems, 
                newEquipped: equippedItems, 
                goldChange: 0, 
                piecesChange: 0,
                stoneChanges: stoneCost // <-- Trừ đá
            }).catch(err => console.error("Sync failed:", err));
            return false;
        }

        const newStats = { ...item.stats };
        let hasUpgradableStats = false;

        Object.keys(newStats).forEach(key => {
            if (typeof newStats[key] === 'number') {
                const currentValue = newStats[key];
                const increase = Math.max(1, Math.round(currentValue * 0.01));
                newStats[key] = currentValue + increase;
                hasUpgradableStats = true;
            }
        });

        if (!hasUpgradableStats) {
            showMessage("Trang bị không có chỉ số để nâng cấp.");
            return false;
        }
        
        const updatedItem = { ...item, level: item.level + 1, stats: newStats };
        const newOwnedList = ownedItems.map(s => s.id === item.id ? updatedItem : s);

        setItemToUpgrade(updatedItem); 
        if (selectedItem?.id === item.id) setSelectedItem(updatedItem);

        // Thành công: Cập nhật Item và Trừ đá
        performInventoryUpdate({ 
            newOwned: newOwnedList, 
            newEquipped: equippedItems, 
            goldChange: 0, 
            piecesChange: 0,
            stoneChanges: stoneCost // <-- Trừ đá
        }).catch(err => console.error("Sync upgrade failed:", err));

        return true; 

    }, [ownedItems, equippedItems, performInventoryUpdate, selectedItem, showMessage, isProcessing, stoneCounts]);

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

    // --- MỚI: HANDLER THƯƠNG HỘI (LOGIC GỘP NHIỀU TÀI NGUYÊN) ---
    const handleExchangeResources = useCallback(async (option: TradeOption) => {
        if (isProcessing) return;

        // 1. Kiểm tra đủ TẤT CẢ tài nguyên trong công thức
        let missingIngredients: string[] = [];
        for (const ingredient of option.ingredients) {
             const userHas = userResources[ingredient.type];
             if (userHas < ingredient.amount) {
                 missingIngredients.push(ingredient.name);
             }
        }

        if (missingIngredients.length > 0) {
            showMessage(`Thiếu tài nguyên: ${missingIngredients.join(', ')}.`);
            return;
        }

        try {
            // 2. Tạo object changes chứa tất cả nguyên liệu cần trừ
            const resourceChanges: Record<string, number> = {};
            for (const ingredient of option.ingredients) {
                resourceChanges[ingredient.type] = -ingredient.amount;
            }

            // 3. Gọi update DB
            await performInventoryUpdate({ 
                newOwned: ownedItems, 
                newEquipped: equippedItems, 
                goldChange: 0, 
                piecesChange: option.receiveAmount,
                resourceChanges: resourceChanges
            });

            // 4. Thông báo thành công
            setDismantleSuccessToast({ show: true, message: `Đổi thành công ${option.receiveAmount} Mảnh Trang Bị.` });
            setTimeout(() => setDismantleSuccessToast(prev => ({ ...prev, show: false })), 3000);

        } catch (error) {
            console.error("Trade failed:", error);
        }
    }, [isProcessing, userResources, ownedItems, equippedItems, performInventoryUpdate, showMessage]);

    const handleOpenTradeModal = useCallback(() => setIsTradeModalOpen(true), []);
    const handleCloseTradeModal = useCallback(() => setIsTradeModalOpen(false), []);


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

        isTradeModalOpen,
        userResources,
        handleExchangeResources,
        handleOpenTradeModal,
        handleCloseTradeModal,
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
// --- END OF FILE equipment-context.tsx ---
