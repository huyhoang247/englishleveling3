// --- START OF FILE equipment.tsx (REFACTORED) ---

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { 
    getItemDefinition, 
    itemBlueprints, 
    generateItemDefinition,
    getBlueprintByName,
    type ItemBlueprint,
    type ItemDefinition, 
    type ItemRank, 
    RARITY_ORDER 
} from './inventory/item-database.ts';
import { uiAssets, equipmentUiAssets } from './game-assets.ts';
import CoinDisplay from './ui/display/coin-display.tsx'; 
import RateLimitToast from './thong-bao.tsx';
// THÊM MỚI: Import service và auth
import { auth } from './firebase.js';
import { fetchEquipmentScreenData, updateUserInventory } from './gameDataService.ts';


// --- Định nghĩa dữ liệu và các hàm tiện ích (KHÔNG THAY ĐỔI) ---
export interface OwnedItem { id: string; itemId: number; level: number; stats: { [key: string]: any }; }
export type EquipmentSlotType = 'weapon' | 'armor' | 'Helmet';
export const EQUIPMENT_SLOT_TYPES: EquipmentSlotType[] = ['weapon', 'armor', 'Helmet'];
export type EquippedItems = { [key in EquipmentSlotType]: string | null; };
const getRarityColor = (rank: ItemRank): string => { switch (rank) { case 'SSR': return 'border-red-500'; case 'SR': return 'border-orange-400'; case 'S': return 'border-yellow-400'; case 'A': return 'border-purple-500'; case 'B': return 'border-blue-500'; case 'D': return 'border-green-500'; case 'E': return 'border-gray-500'; default: return 'border-gray-600'; } };
const getRarityTextColor = (rank: ItemRank): string => { switch (rank) { case 'SSR': return 'text-red-500'; case 'SR': return 'text-orange-400'; case 'S': return 'text-yellow-400'; case 'A': return 'text-purple-400'; case 'B': return 'text-blue-400'; case 'D': return 'text-green-400'; case 'E': return 'text-gray-400'; default: return 'text-gray-500'; } };
const getRarityGradient = (rank: ItemRank): string => { switch (rank) { case 'SSR': return 'from-red-900/80 to-slate-900'; case 'SR': return 'from-orange-900/80 to-slate-900'; case 'S': return 'from-yellow-900/80 to-slate-900'; case 'A': return 'from-purple-900/80 to-slate-900'; case 'B': return 'from-blue-900/80 to-slate-900'; case 'D': return 'from-green-900/80 to-slate-900'; case 'E': return 'from-gray-800/80 to-slate-900'; default: return 'from-gray-900 to-slate-900'; } };
const getNextRank = (rank: ItemRank): ItemRank | null => { const currentIndex = RARITY_ORDER.indexOf(rank); if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) return null; return RARITY_ORDER[currentIndex + 1]; };
const getRandomRank = (): ItemRank => { const rand = Math.random() * 100; if (rand < 0.1) return 'SR'; if (rand < 1) return 'S'; if (rand < 5) return 'A'; if (rand < 20) return 'B'; if (rand < 50) return 'D'; return 'E'; };
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_PIECES = 25;
const getUpgradeCost = (itemDef: ItemDefinition, level: number): number => { const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 }; const baseCost = 50; return Math.floor(baseCost * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]); };
const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => { let total = 0; for (let i = 1; i < level; i++) { total += getUpgradeCost(itemDef, i); } return total; };
// --- Các Icon và Component con (KHÔNG THAY ĐỔI) ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.goldIcon} alt="Vàng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> </svg>);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> );
const Header = memo(({ gold, onClose }: { gold: number; onClose: () => void; }) => { return ( <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50 backdrop-blur-sm"> <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0"> <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại" title="Quay lại"> <HomeIcon className="w-5 h-5 text-slate-300" /> <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span> </button> <div className="flex items-center gap-4 sm:gap-6"> <CoinDisplay displayedCoins={gold} isStatsFullscreen={false} /> </div> </div> </header> ); });
const EquipmentSlot = memo(({ slotType, ownedItem, onClick, isProcessing }: { slotType: EquipmentSlotType, ownedItem: OwnedItem | null, onClick: () => void, isProcessing: boolean }) => { const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null; const baseClasses = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center group"; const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer'; const borderStyle = itemDef ? `${getRarityColor(itemDef.rarity)} hover:opacity-80` : 'border-dashed border-slate-600 hover:border-slate-400'; const backgroundStyle = itemDef ? 'bg-slate-900/80' : 'bg-slate-900/50'; const getPlaceholderIcon = () => { return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" /> </svg>; }; return ( <div className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} onClick={!isProcessing ? onClick : undefined} title={itemDef ? `${itemDef.name} - Lv.${ownedItem?.level}` : `Ô ${slotType}`}> {ownedItem && itemDef ? ( <> <div className="transition-all duration-300 group-hover:scale-110"> <img src={itemDef.icon} alt={itemDef.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" /> </div> <span className="absolute top-1 right-1.5 px-1.5 py-0.5 text-xs font-bold bg-black/60 text-white rounded-md border border-slate-600"> Lv.{ownedItem.level} </span> </> ) : ( <div className="text-slate-600 group-hover:text-slate-400 transition-colors text-center"> {getPlaceholderIcon()} <span className="text-xs font-semibold uppercase mt-1">{slotType}</span> </div> )} </div> ); });
const InventorySlot = memo(({ ownedItem, onClick, isProcessing }: { ownedItem: OwnedItem | undefined; onClick: (item: OwnedItem) => void; isProcessing: boolean; }) => { const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null; const baseClasses = "relative aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center group"; const interactivity = isProcessing ? 'cursor-wait' : (ownedItem ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'); const borderStyle = itemDef ? getRarityColor(itemDef.rarity) : 'border-slate-800 border-dashed'; const backgroundStyle = itemDef ? 'bg-slate-900/80' : 'bg-slate-900/30'; const shadowRarity = itemDef ? getRarityColor(itemDef.rarity).replace('border-', '') : 'transparent'; const shadowColorStyle = itemDef ? { '--tw-shadow-color': `var(--tw-color-${shadowRarity})` } as React.CSSProperties : {}; return ( <div className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} onClick={ownedItem && !isProcessing ? () => onClick(ownedItem) : undefined} style={shadowColorStyle}> {ownedItem && itemDef ? ( <> <img src={itemDef.icon} alt={itemDef.name} className="w-3/4 h-3/4 object-contain transition-transform duration-200 group-hover:scale-110" title={`${itemDef.name} - Lv.${ownedItem.level}`}/> <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600"> Lv.{ownedItem.level} </span> </> ) : ( <div className="w-2 h-2 bg-slate-700 rounded-full" /> )} </div> ); });
const HpIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/> </svg> );
const AtkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M17.46,3.26a1.5,1.5,0,0,0-2.12,0L3.25,15.35a1.5,1.5,0,0,0,0,2.12l2.83,2.83a1.5,1.5,0,0,0,2.12,0L20.29,8.21a1.5,1.5,0,0,0,0-2.12Zm-11,14.31L4.6,15.71,15,5.34l1.83,1.83ZM18,7.5,16.5,6l1.41-1.41a.5.5,0,0,1,.71.71Z"/> </svg> );
const DefIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z"/> </svg> );
const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element; color: string; } } = { hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' }, atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' }, def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' }, };
const ItemDetailModal = memo(({ ownedItem, onClose, onEquip, onUnequip, onDismantle, onUpgrade, isEquipped, gold, isProcessing }: { ownedItem: OwnedItem, onClose: () => void, onEquip: (item: OwnedItem) => void, onUnequip: (item: OwnedItem) => void, onDismantle: (item: OwnedItem) => void, onUpgrade: (item: OwnedItem, statKey: string, increase: number) => void, isEquipped: boolean, gold: number, isProcessing: boolean }) => { /* ... GIỮ NGUYÊN CODE CỦA MODAL NÀY ... */ return ( <div className="fixed inset-0 flex items-center justify-center z-50 p-4">...</div> ); });
const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => { /* ... GIỮ NGUYÊN CODE CỦA MODAL NÀY ... */ return ( <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">...</div> ); });
interface ForgeResult { level: number; refundGold: number; }
interface ForgeGroup { blueprint: ItemBlueprint; rarity: ItemRank; items: OwnedItem[]; nextRank: ItemRank | null; estimatedResult: ForgeResult; }
const calculateForgeResult = (itemsToForge: OwnedItem[], definition: ItemDefinition): ForgeResult => { if (itemsToForge.length < 3) return { level: 1, refundGold: 0 }; const totalInvestedGold = itemsToForge.reduce((total, item) => total + getTotalUpgradeCost(definition, item.level), 0); let finalLevel = 1, remainingGold = totalInvestedGold; while (true) { const costForNextLevel = getUpgradeCost(definition, finalLevel); if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; } } return { level: finalLevel, refundGold: remainingGold }; };
const ForgeModal = memo(({ isOpen, onClose, ownedItems, onForge, isProcessing, equippedItemIds }: { isOpen: boolean; onClose: () => void; ownedItems: OwnedItem[]; onForge: (group: ForgeGroup) => void; isProcessing: boolean; equippedItemIds: (string | null)[] }) => { /* ... GIỮ NGUYÊN CODE CỦA MODAL NÀY ... */ return ( <div className="fixed inset-0 flex items-center justify-center z-50 p-4">...</div> ); });

// --- COMPONENT CHÍNH (ĐÃ TÁI CẤU TRÚC) ---
interface EquipmentScreenProps {
    onClose: () => void;
    onDataUpdated: () => void;
}

export default function EquipmentScreen({ onClose, onDataUpdated }: EquipmentScreenProps) {
    // THÊM MỚI: State để quản lý dữ liệu và trạng thái loading
    const [isLoading, setIsLoading] = useState(true);
    const [gold, setGold] = useState(0);
    const [equipmentPieces, setEquipmentPieces] = useState(0);
    const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
    const [equippedItems, setEquippedItems] = useState<EquippedItems>({ weapon: null, armor: null, Helmet: null });

    // State cục bộ khác
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dismantleSuccessToast, setDismantleSuccessToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const MAX_ITEMS_IN_STORAGE = 50;

    const showMessage = useCallback((text: string) => {
        setMessage(text); setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    // THÊM MỚI: Hàm fetch dữ liệu khi component được mount
    useEffect(() => {
        const loadData = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.error("User not logged in, cannot open equipment screen.");
                onClose();
                return;
            }
            try {
                setIsLoading(true);
                const data = await fetchEquipmentScreenData(userId);
                setGold(data.gold);
                setEquipmentPieces(data.equipmentPieces);
                setOwnedItems(data.ownedItems);
                setEquippedItems(data.equippedItems);
            } catch (error) {
                console.error("Failed to load equipment data:", error);
                showMessage("Lỗi tải dữ liệu trang bị.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [onClose, showMessage]);

    const equippedItemsMap = useMemo(() => {
        const map: { [key in EquipmentSlotType]: OwnedItem | null } = { weapon: null, armor: null, Helmet: null };
        for (const slotType of EQUIPMENT_SLOT_TYPES) {
            const itemId = equippedItems[slotType];
            if (itemId) {
                map[slotType] = ownedItems.find(item => item.id === itemId) || null;
            }
        }
        return map;
    }, [equippedItems, ownedItems]);
    
    const unequippedItemsSorted = useMemo(() => {
        const equippedIds = Object.values(equippedItems).filter(id => id !== null);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const itemDefA = getItemDefinition(a.itemId);
                const itemDefB = getItemDefinition(b.itemId);
                if (!itemDefA) return 1; if (!itemDefB) return -1;
                const rarityIndexA = RARITY_ORDER.indexOf(itemDefA.rarity);
                const rarityIndexB = RARITY_ORDER.indexOf(itemDefB.rarity);
                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                if (a.level !== b.level) return b.level - a.level;
                return itemDefA.name.localeCompare(itemDefB.name);
            });
    }, [ownedItems, equippedItems]);

    // THAY ĐỔI: Hàm cập nhật chung, gọi thẳng service và cập nhật state cục bộ
    const handleInventoryUpdate = useCallback(async (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("Người dùng chưa được xác thực.");
        
        setIsProcessing(true);
        try {
            const { newCoins, newPieces } = await updateUserInventory(userId, updates);
            // Cập nhật state cục bộ
            setGold(newCoins);
            setEquipmentPieces(newPieces);
            setOwnedItems(updates.newOwned);
            setEquippedItems(updates.newEquipped);
            
            // Thông báo cho component cha để cập nhật UI chung (vd: header)
            onDataUpdated(); 
            return { success: true };
        } catch (error: any) {
            showMessage(`Lỗi: ${error.message || 'Cập nhật thất bại'}`);
            return { success: false };
        } finally {
            setIsProcessing(false);
        }
    }, [onDataUpdated, showMessage]);

    // Tái cấu trúc các hàm hành động
    const handleEquipItem = useCallback(async (itemToEquip: OwnedItem) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToEquip.itemId);
        if (!itemDef || !EQUIPMENT_SLOT_TYPES.includes(itemDef.type as any)) { showMessage("Vật phẩm này không thể trang bị."); return; }
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] === itemToEquip.id) { showMessage("Trang bị đã được mặc."); return; }
        
        const newEquipped = { ...equippedItems, [slotType]: itemToEquip.id };
        const result = await handleInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
        if (result.success) setSelectedItem(null);
    }, [isProcessing, equippedItems, ownedItems, handleInventoryUpdate, showMessage]);

    const handleUnequipItem = useCallback(async (itemToUnequip: OwnedItem) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToUnequip.itemId);
        if (!itemDef) return;
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] !== itemToUnequip.id) { showMessage("Lỗi: Không tìm thấy trang bị."); return; }
        
        const newEquipped = { ...equippedItems, [slotType]: null };
        const result = await handleInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, piecesChange: 0 });
        if (result.success) setSelectedItem(null);
    }, [isProcessing, equippedItems, ownedItems, handleInventoryUpdate, showMessage]);
  
    const handleCraftItem = useCallback(async () => {
        if (isProcessing) return;
        if (equipmentPieces < CRAFTING_COST) { showMessage(`Không đủ Mảnh Trang Bị. Cần ${CRAFTING_COST}.`); return; }
        if (unequippedItemsSorted.length >= MAX_ITEMS_IN_STORAGE) { showMessage(`Kho chứa đã đầy.`); return; }
        
        const randomBlueprint = itemBlueprints[Math.floor(Math.random() * itemBlueprints.length)];
        const targetRank = getRandomRank();
        const finalItemDef = generateItemDefinition(randomBlueprint, targetRank, true);
        const newOwnedItem: OwnedItem = { id: `owned-${Date.now()}-${finalItemDef.id}-${Math.random()}`, itemId: finalItemDef.id, level: 1, stats: finalItemDef.stats || {} };
        const newOwnedList = [...ownedItems, newOwnedItem];
            
        const result = await handleInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: 0, piecesChange: -CRAFTING_COST });
        if(result.success) setNewlyCraftedItem(newOwnedItem);
    }, [isProcessing, equipmentPieces, ownedItems, equippedItems, handleInventoryUpdate, showMessage, unequippedItemsSorted.length]);

    const handleDismantleItem = useCallback(async (itemToDismantle: OwnedItem) => {
        if (isProcessing) return;
        if (Object.values(equippedItems).includes(itemToDismantle.id)) { showMessage("Không thể phân rã trang bị đang mặc."); return; }
        
        const itemDef = getItemDefinition(itemToDismantle.itemId)!;
        const goldToReturn = getTotalUpgradeCost(itemDef, itemToDismantle.level);
        const newOwnedList = ownedItems.filter(s => s.id !== itemToDismantle.id);
        
        const result = await handleInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: goldToReturn, piecesChange: DISMANTLE_RETURN_PIECES });
        if(result.success) {
            setSelectedItem(null);
            setDismantleSuccessToast({ show: true, message: 'Đã tái chế thành công.' });
            setTimeout(() => setDismantleSuccessToast(prev => ({ ...prev, show: false })), 4000);
        }
    }, [isProcessing, equippedItems, ownedItems, handleInventoryUpdate, showMessage]);

    const handleUpgradeItem = useCallback(async (itemToUpgrade: OwnedItem, statKey: string, increase: number) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToUpgrade.itemId)!;
        const cost = getUpgradeCost(itemDef, itemToUpgrade.level);
        if (gold < cost) { showMessage(`Không đủ vàng. Cần ${cost.toLocaleString()}.`); return; }
        
        const newStats = { ...itemToUpgrade.stats };
        if (newStats.hasOwnProperty(statKey) && typeof newStats[statKey] === 'number') {
            newStats[statKey] = newStats[statKey] + increase;
        } else {
            showMessage("Lỗi: Không thể nâng cấp chỉ số không tồn tại."); return;
        }

        const updatedItem = { ...itemToUpgrade, level: itemToUpgrade.level + 1, stats: newStats };
        const newOwnedList = ownedItems.map(s => s.id === itemToUpgrade.id ? updatedItem : s);
        
        const result = await handleInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: -cost, piecesChange: 0 });
        if(result.success) setSelectedItem(updatedItem);
    }, [isProcessing, gold, ownedItems, equippedItems, handleInventoryUpdate, showMessage]);

    const handleForgeItems = useCallback(async (group: ForgeGroup) => {
        if (isProcessing || group.items.length < 3 || !group.nextRank) { showMessage("Không đủ điều kiện để hợp nhất."); return; }
        
        const itemsToConsume = group.items.slice(0, 3);
        const itemIdsToConsume = itemsToConsume.map(s => s.id);
        const baseItemDef = getItemDefinition(itemsToConsume[0].itemId)!;
        const { level: finalLevel, refundGold } = calculateForgeResult(itemsToConsume, baseItemDef);
        const upgradedItemDef = generateItemDefinition(group.blueprint, group.nextRank, true);
        const newForgedItem: OwnedItem = { id: `owned-${Date.now()}-${upgradedItemDef.id}`, itemId: upgradedItemDef.id, level: finalLevel, stats: upgradedItemDef.stats || {} };
        const newOwnedList = ownedItems.filter(s => !itemIdsToConsume.includes(s.id)).concat(newForgedItem);
            
        const result = await handleInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: refundGold, piecesChange: 0 });
        if(result.success) {
            let successMsg = `Hợp nhất thành công ${upgradedItemDef.name} [${group.nextRank}] - Đạt Lv. ${finalLevel}!`;
            if (refundGold > 0) successMsg += ` Hoàn lại ${refundGold.toLocaleString()} vàng.`;
            showMessage(successMsg);
            setIsForgeModalOpen(false);
        }
    }, [isProcessing, ownedItems, equippedItems, handleInventoryUpdate, showMessage]);

    const handleSelectSlot = useCallback((slotType: EquipmentSlotType) => { const item = equippedItemsMap[slotType]; if (item) setSelectedItem(item); }, [equippedItemsMap]);
    const handleSelectItem = useCallback((item: OwnedItem) => setSelectedItem(item), []);
    const handleCloseDetailModal = useCallback(() => setSelectedItem(null), []);
    const handleCloseCraftSuccessModal = useCallback(() => setNewlyCraftedItem(null), []);
    const handleCloseForgeModal = useCallback(() => setIsForgeModalOpen(false), []);
    const handleOpenForgeModal = useCallback(() => setIsForgeModalOpen(true), []);

    if (isLoading) {
        return (
            <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex items-center justify-center">
                <p className="text-white text-lg">Đang tải dữ liệu trang bị...</p>
            </div>
        );
    }
    
    return (
        <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
            <style>{`.title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
            <RateLimitToast show={dismantleSuccessToast.show} message={dismantleSuccessToast.message} showIcon={false} />
            {selectedItem && <ItemDetailModal ownedItem={selectedItem} onClose={handleCloseDetailModal} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onDismantle={handleDismantleItem} onUpgrade={handleUpgradeItem} isEquipped={Object.values(equippedItems).includes(selectedItem.id)} gold={gold} isProcessing={isProcessing}/>}
            {newlyCraftedItem && <CraftingSuccessModal ownedItem={newlyCraftedItem} onClose={handleCloseCraftSuccessModal} />}
            <ForgeModal isOpen={isForgeModalOpen} onClose={handleCloseForgeModal} ownedItems={ownedItems} onForge={handleForgeItems} isProcessing={isProcessing} equippedItemIds={Object.values(equippedItems)} />

            <div className="relative z-10 flex flex-col w-full h-screen">
                <Header gold={gold} onClose={onClose} />
                <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8">
                    <section className="flex-shrink-0 py-4">
                        <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                            {EQUIPMENT_SLOT_TYPES.map(slotType => <EquipmentSlot key={slotType} slotType={slotType} ownedItem={equippedItemsMap[slotType]} onClick={() => handleSelectSlot(slotType)} isProcessing={isProcessing} />)}
                        </div>
                    </section>
                    <section className="flex-shrink-0 p-3 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <EquipmentPieceIcon className="w-10 h-10" />
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white">{equipmentPieces.toLocaleString()}</span>
                                <span className="text-base text-slate-400">/ {CRAFTING_COST}</span>
                            </div>
                        </div>
                        <button onClick={handleCraftItem} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" disabled={equipmentPieces < CRAFTING_COST || isProcessing}>Craft</button>
                    </section>
                    
                    <section className="w-full p-4 bg-black/30 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Storage</h2>
                                <span className="text-sm font-semibold text-slate-300">{unequippedItemsSorted.length}<span className="text-xs text-slate-500"> / {MAX_ITEMS_IN_STORAGE}</span></span>
                            </div>
                            <button onClick={handleOpenForgeModal} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}><MergeIcon className="w-4 h-4" />Merge</button>
                        </div>
                        <div className="flex-grow min-h-0 overflow-y-auto hide-scrollbar -m-1 p-1">
                            {unequippedItemsSorted.length > 0 ? (
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {unequippedItemsSorted.map((ownedItem) => (
                                        <InventorySlot key={ownedItem.id} ownedItem={ownedItem} onClick={handleSelectItem} isProcessing={isProcessing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <p>Kho chứa trống.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

// --- END OF FILE equipment.tsx ---
