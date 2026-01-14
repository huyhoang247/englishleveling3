// --- START OF FILE equipment-ui.tsx ---

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { 
    getItemDefinition, 
    getBlueprintByName,
    type ItemBlueprint,
    type ItemDefinition, 
    type ItemRank, 
    RARITY_ORDER 
} from './item-database.ts';
import { uiAssets, equipmentUiAssets } from '../../game-assets.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx'; 
import RateLimitToast from '../../thong-bao.tsx';
import { 
    EquipmentProvider, 
    useEquipment 
} from './equipment-context.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import EquipmentScreenSkeleton from './equipment-loading.tsx';
import TotalStatsModal from './total-stats-modal.tsx';
import ItemRankBorder from './item-rank-border.tsx';
import CraftingEffectCanvas from './crafting-effect.tsx'; 

// Import các Modal thành phần
import UpgradeModal from './upgrade-modal.tsx';

// --- Định nghĩa dữ liệu và các hàm tiện ích cho trang bị ---

export interface OwnedItem {
    id: string;
    itemId: number;
    level: number;
    stats: { [key: string]: any };
}

export type EquipmentSlotType = 'weapon' | 'armor' | 'Helmet';
export const EQUIPMENT_SLOT_TYPES: EquipmentSlotType[] = ['weapon', 'armor', 'Helmet'];

export type EquippedItems = {
    [key in EquipmentSlotType]: string | null;
};

export interface EquipmentScreenExitData {
    gold: number;
    equipmentPieces: number;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
}

export const getRarityColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'border-red-500';
        case 'SR': return 'border-orange-400';
        case 'S': return 'border-yellow-400';
        case 'A': return 'border-purple-500';
        case 'B': return 'border-blue-500';
        case 'D': return 'border-green-500';
        case 'E': return 'border-gray-500';
        default: return 'border-gray-600';
    }
};

export const getRarityTextColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'text-red-500';
        case 'SR': return 'text-orange-400';
        case 'S': return 'text-yellow-400';
        case 'A': return 'text-purple-400';
        case 'B': return 'text-blue-400';
        case 'D': return 'text-green-400';
        case 'E': return 'text-gray-400';
        default: return 'text-gray-500';
    }
};

export const getRarityGradient = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'from-red-900/80 to-slate-900';
        case 'SR': return 'from-orange-900/80 to-slate-900';
        case 'S': return 'from-yellow-900/80 to-slate-900';
        case 'A': return 'from-purple-900/80 to-slate-900';
        case 'B': return 'from-blue-900/80 to-slate-900';
        case 'D': return 'from-green-900/80 to-slate-900';
        case 'E': return 'from-gray-800/80 to-slate-900';
        default: return 'from-gray-900 to-slate-900';
    }
};

const getNextRank = (rank: ItemRank): ItemRank | null => {
    const currentIndex = RARITY_ORDER.indexOf(rank);
    if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) return null;
    return RARITY_ORDER[currentIndex + 1];
};

// --- Các Icon Giao Diện ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> </svg>);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> );

const HpIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statHpIcon} alt="HP Icon" {...props} />;
const AtkIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statAtkIcon} alt="ATK Icon" {...props} />;
const DefIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statDefIcon} alt="DEF Icon" {...props} />;

const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: any) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

const UPGRADE_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/upgrade-equipment.webp";
const MERGE_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/merge.webp";
const STATS_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/stats.webp";
const EQUIPMENT_BG_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-equipment.webp";

// --- CÁC COMPONENT CON ---
const Header = memo(({ gold, onClose }: { gold: number; onClose: () => void; }) => {
    const animatedGold = useAnimateValue(gold);
    return (
        <header className="flex-shrink-0 w-full bg-slate-900/90 border-b-2 border-slate-800/50">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
                </button>
                <div className="flex items-center gap-4 sm:gap-6">
                    <CoinDisplay displayedCoins={animatedGold} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
});

const EquipmentSlot = memo(({ slotType, ownedItem, onClick, isProcessing }: { slotType: EquipmentSlotType, ownedItem: OwnedItem | null, onClick: () => void, isProcessing: boolean }) => {
    const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null;
    const sizeClasses = "w-24 h-24 sm:w-28 sm:h-28";
    const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer';

    const renderContent = () => (
        <>
            {ownedItem && itemDef ? (
                <>
                    <img src={itemDef.icon} alt={itemDef.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain relative z-10 drop-shadow-md" />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold bg-black/80 text-white rounded-md border border-slate-600 z-20">Lv.{ownedItem.level}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl pointer-events-none z-0" />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-slate-400 transition-colors text-center relative z-10">
                    {slotType === 'weapon' && <img src={equipmentUiAssets.weaponIcon} className="h-10 w-10 opacity-40" />}
                    {slotType === 'armor' && <img src={equipmentUiAssets.armorIcon} className="h-10 w-10 opacity-40" />}
                    {slotType === 'Helmet' && <img src={equipmentUiAssets.helmetIcon} className="h-10 w-10 opacity-40" />}
                    <span className="text-xs font-semibold uppercase mt-1 opacity-70">{slotType}</span>
                </div>
            )}
        </>
    );

    return (
        <div className={`relative ${sizeClasses} rounded-xl ${ownedItem ? '' : 'border-2 border-dashed border-slate-700 bg-slate-900/40'} flex items-center justify-center group ${interactivity}`} onClick={!isProcessing ? onClick : undefined}>
            {ownedItem && itemDef ? (
                <ItemRankBorder rank={itemDef.rarity} className="w-full h-full shadow-lg">{renderContent()}</ItemRankBorder>
            ) : renderContent()}
        </div>
    );
});

const InventorySlot = memo(({ ownedItem, onClick, isProcessing }: { ownedItem: OwnedItem | undefined; onClick: (item: OwnedItem) => void; isProcessing: boolean; }) => {
    const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null;
    if (!ownedItem || !itemDef) return <div className="relative aspect-square rounded-lg border-2 border-slate-800 border-dashed bg-slate-900/30" />;
    
    return (
        <div className={`relative aspect-square rounded-lg border-2 ${getRarityColor(itemDef.rarity)} bg-slate-900/80 transition-all duration-200 flex items-center justify-center group ${isProcessing ? 'cursor-wait' : 'cursor-pointer hover:scale-105'}`} onClick={!isProcessing ? () => onClick(ownedItem) : undefined}>
            <img src={itemDef.icon} alt={itemDef.name} className="w-3/4 h-3/4 object-contain" />
            <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">Lv.{ownedItem.level}</span>
        </div>
    );
});

const ItemDetailModal = memo(({ ownedItem, onClose, onEquip, onUnequip, onDismantle, onOpenUpgrade, isEquipped, isProcessing }: { 
    ownedItem: OwnedItem, onClose: () => void, onEquip: (item: OwnedItem) => void, onUnequip: (item: OwnedItem) => void, onDismantle: (item: OwnedItem) => void, onOpenUpgrade: (item: OwnedItem) => void, isEquipped: boolean, isProcessing: boolean 
}) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;
    const sortedStats = Object.entries(ownedItem.stats || {}).sort((a, b) => {
        const order = ['hp', 'atk', 'def'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
    
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
                <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
                    <div>
                        <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <div className="flex gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(itemDef.rarity)} bg-gray-800/70 border ${getRarityColor(itemDef.rarity)}`}>{itemDef.rarity} Rank</span>
                            <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full">Level {ownedItem.level}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar text-center flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className={`w-32 h-32 flex items-center justify-center bg-black/40 rounded-lg border-2 ${getRarityColor(itemDef.rarity)}`}>
                             <img src={itemDef.icon} className="w-24 h-24 object-contain" />
                        </div>
                        <button onClick={() => onOpenUpgrade(ownedItem)} disabled={isProcessing} className="absolute top-1/2 -right-16 -translate-y-1/2 w-12 h-12 hover:scale-110 active:scale-95 disabled:opacity-50 transition-transform">
                            <img src={UPGRADE_ICON_URL} className="w-full h-full object-contain animate-subtle-bounce" />
                        </button>
                    </div>

                    <div className="w-full p-4 bg-black/30 rounded-lg border border-slate-700 text-left text-slate-300 text-sm">{itemDef.description}</div>
                    
                    <div className="w-full space-y-2">
                        {sortedStats.map(([key, value]) => { 
                            const config = STAT_CONFIG[key.toLowerCase()]; 
                            return (
                                <div key={key} className="flex justify-between items-center bg-black/40 px-4 py-3 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        {config?.Icon && <config.Icon className="w-6 h-6" />}
                                        <span className="text-slate-300 font-lilita uppercase">{config?.name || key}</span>
                                    </div>
                                    <span className="text-white text-lg font-lilita">{value.toLocaleString()}</span>
                                </div>
                            ); 
                        })}
                    </div>
                </div>
                
                <div className="mt-6 flex gap-3 border-t border-gray-700/50 pt-4">
                    <button onClick={() => isEquipped ? onUnequip(ownedItem) : onEquip(ownedItem)} disabled={isProcessing} className={`flex-1 py-3 rounded-xl font-lilita uppercase ${isEquipped ? 'bg-rose-900 text-slate-200' : 'bg-blue-600 text-white shadow-lg'}`}>
                        {isEquipped ? 'Unequip' : 'Equip'}
                    </button>
                    <button onClick={() => onDismantle(ownedItem)} disabled={isEquipped || isProcessing} className="flex-1 py-3 rounded-xl font-lilita uppercase bg-slate-700 text-slate-300">Recycle</button>
                </div>
            </div>
        </div>
    );
});

const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;
    return ( 
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> 
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className={`relative bg-gradient-to-b ${getRarityGradient(itemDef.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(itemDef.rarity)} text-center flex flex-col items-center gap-4`}> 
                <h2 className="text-lg font-semibold tracking-wider uppercase text-white title-glow">Chế Tạo Thành Công</h2> 
                <div className="w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 border-white/20"><img src={itemDef.icon} className="w-24 h-24 object-contain" /></div>
                <div className="text-center">
                    <h3 className={`text-xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                    <p className="text-sm text-slate-300 mt-2">{itemDef.description}</p>
                </div>
            </div> 
        </div> 
    );
});

const ForgeModal = memo(({ isOpen, onClose, ownedItems, onForge, isProcessing, equippedItemIds }: { isOpen: boolean; onClose: () => void; ownedItems: OwnedItem[]; onForge: (group: any) => void; isProcessing: boolean; equippedItemIds: (string | null)[] }) => {
    const forgeableGroups = useMemo(() => {
        if (!isOpen) return [];
        const groups: Record<string, OwnedItem[]> = {};
        ownedItems.filter(s => !equippedItemIds.includes(s.id)).forEach(item => {
            const def = getItemDefinition(item.itemId);
            if (!def || !def.baseId) return;
            const key = `${def.baseId}-${def.rarity}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return Object.values(groups).filter(g => g.length >= 3).map(group => {
            const first = getItemDefinition(group[0].itemId)!;
            const blueprint = getBlueprintByName(first.name)!;
            const nextRank = getNextRank(first.rarity);
            return { blueprint, rarity: first.rarity, items: group.sort((a,b) => b.level - a.level), nextRank };
        }).filter(g => g.nextRank !== null);
    }, [isOpen, ownedItems, equippedItemIds]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className="relative bg-slate-900 p-5 rounded-xl border-2 border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-4">
                    <h3 className="text-xl font-black uppercase text-purple-400">Hợp nhất trang bị</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {forgeableGroups.length > 0 ? forgeableGroups.map(group => (
                        <div key={group.rarity + group.blueprint.name} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`relative w-14 h-14 rounded-md border-2 ${getRarityColor(group.rarity)} bg-black/30 flex items-center justify-center`}>
                                    <img src={group.blueprint.icon} className="w-10 h-10 object-contain" />
                                    <span className="absolute -top-2 -right-2 bg-cyan-600 text-[10px] px-1.5 rounded-full">3/{group.items.length}</span>
                                </div>
                                <span className="text-slate-500">→</span>
                                <div className={`w-14 h-14 rounded-md border-2 ${getRarityColor(group.nextRank!)} bg-black/30 flex items-center justify-center`}>
                                    <img src={group.blueprint.icon} className="w-10 h-10 object-contain" />
                                </div>
                            </div>
                            <button onClick={() => onForge(group)} disabled={isProcessing} className="bg-purple-600 px-4 py-2 rounded-lg font-bold text-xs">MERGE</button>
                        </div>
                    )) : <div className="text-slate-500 text-center py-10">Không có trang bị có thể hợp nhất.</div>}
                </div>
            </div>
        </div>
    );
});

function EquipmentScreenContent({ onClose }: { onClose: (data: EquipmentScreenExitData) => void }) {
    const {
        gold, equipmentPieces, ownedItems, equippedItems, selectedItem, newlyCraftedItem, isForgeModalOpen, isStatsModalOpen, isProcessing, dismantleSuccessToast,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue, isLoading,
        handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem, handleUpgradeItem, handleForgeItems,
        handleSelectItem, handleSelectSlot, handleCloseDetailModal, handleCloseCraftSuccessModal, handleOpenForgeModal, handleCloseForgeModal, handleOpenStatsModal, handleCloseStatsModal,
        itemToUpgrade, isUpgradeModalOpen, handleOpenUpgradeModal, handleCloseUpgradeModal, stoneCounts,
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST
    } = useEquipment();
    
    const [isCraftingAnimation, setIsCraftingAnimation] = useState(false);
    const [minTimeElapsed, setMinTimeElapsed] = useState(true);

    const onCraftClick = useCallback(() => {
        setIsCraftingAnimation(true);
        setMinTimeElapsed(false);
        handleCraftItem();
        setTimeout(() => setMinTimeElapsed(true), 3000);
    }, [handleCraftItem]);

    useEffect(() => {
        if (!isProcessing && minTimeElapsed) {
            setTimeout(() => setIsCraftingAnimation(false), 200);
        }
    }, [isProcessing, minTimeElapsed]);

    const handleClose = useCallback(() => {
        onClose({ gold, equipmentPieces, ownedItems, equippedItems });
    }, [onClose, gold, equipmentPieces, ownedItems, equippedItems]);

    return (
        <div className="main-bg relative w-full h-screen font-sans text-white overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${EQUIPMENT_BG_URL})` }}>
            <div className="absolute inset-0 bg-black/75 z-0" />
            <CraftingEffectCanvas isActive={isCraftingAnimation} />
            <RateLimitToast show={dismantleSuccessToast.show} message={dismantleSuccessToast.message} />
            
            {selectedItem && (
                <ItemDetailModal 
                    ownedItem={selectedItem} onClose={handleCloseDetailModal} onEquip={handleEquipItem} onUnequip={handleUnequipItem} 
                    onDismantle={handleDismantleItem} onOpenUpgrade={handleOpenUpgradeModal} isEquipped={Object.values(equippedItems).includes(selectedItem.id)} isProcessing={isProcessing}
                />
            )}
            
            <UpgradeModal 
                isOpen={isUpgradeModalOpen} onClose={handleCloseUpgradeModal} item={itemToUpgrade} onUpgrade={handleUpgradeItem} isProcessing={isProcessing} stoneCounts={stoneCounts}
            />

            {newlyCraftedItem && <CraftingSuccessModal ownedItem={newlyCraftedItem} onClose={handleCloseCraftSuccessModal} />}
            <ForgeModal isOpen={isForgeModalOpen} onClose={handleCloseForgeModal} ownedItems={ownedItems} onForge={handleForgeItems} isProcessing={isProcessing} equippedItemIds={Object.values(equippedItems)} />
            <TotalStatsModal isOpen={isStatsModalOpen} onClose={handleCloseStatsModal} equipmentStats={totalEquippedStats} upgradeStats={userStatsValue} />

            <div className={`absolute inset-0 z-20 ${isLoading ? '' : 'hidden'}`}><EquipmentScreenSkeleton /></div>
            
            <div className={`relative z-10 flex flex-col w-full h-screen ${isLoading ? 'hidden' : ''} ${isCraftingAnimation ? 'pointer-events-none' : ''}`}>
                <Header gold={gold} onClose={handleClose} />
                <main className="flex-1 max-w-5xl mx-auto flex flex-col w-full p-4 sm:p-8 gap-4 overflow-hidden">
                    <section className="flex justify-center gap-4 py-4">
                        {EQUIPMENT_SLOT_TYPES.map(slot => <EquipmentSlot key={slot} slotType={slot} ownedItem={equippedItemsMap[slot]} onClick={() => handleSelectSlot(slot)} isProcessing={isProcessing} />)}
                    </section>

                    <section className="p-4 bg-black/40 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <EquipmentPieceIcon className="w-10 h-10" />
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold">{equipmentPieces.toLocaleString()}</span>
                                <span className="text-slate-400 text-sm">/ {CRAFTING_COST}</span>
                            </div>
                        </div>
                        <button onClick={onCraftClick} disabled={equipmentPieces < CRAFTING_COST || isProcessing || ownedItems.length >= MAX_ITEMS_IN_STORAGE} className="bg-blue-600 px-8 py-2 rounded-lg font-lilita uppercase text-lg shadow-lg hover:bg-blue-500 disabled:opacity-50">Craft</button>
                    </section>
                    
                    <section className="flex-1 bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-700 text-sm font-mono">
                                <span className="text-white font-bold">{unequippedItemsSorted.length}</span>
                                <span className="text-slate-500"> / {MAX_ITEMS_IN_STORAGE}</span>
                            </div>
                            
                            <div className="flex gap-12 items-center">
                                <button onClick={handleOpenStatsModal} className="group transition-transform hover:scale-110 active:scale-95">
                                    <img src={STATS_ICON_URL} className="w-12 h-12 object-contain" />
                                </button>
                                <button onClick={handleOpenForgeModal} className="group transition-transform hover:scale-110 active:scale-95">
                                    <img src={MERGE_ICON_URL} className="w-12 h-12 object-contain" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto hide-scrollbar">
                            {unequippedItemsSorted.length > 0 ? (
                                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                                    {unequippedItemsSorted.map(item => <InventorySlot key={item.id} ownedItem={item} onClick={handleSelectItem} isProcessing={isProcessing} />)}
                                </div>
                            ) : <div className="h-full flex items-center justify-center text-slate-500">Kho chứa trống.</div>}
                        </div>
                    </section>
                </main>
            </div>
            <style>{`
                .animate-subtle-bounce { animation: bounce 2s infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .title-glow { text-shadow: 0 0 10px rgba(107, 229, 255, 0.7); }
            `}</style>
        </div>
    );
}

export default function EquipmentScreen({ onClose, userId }: { onClose: (data: EquipmentScreenExitData) => void; userId: string }) {
    return <EquipmentProvider><EquipmentScreenContent onClose={onClose} /></EquipmentProvider>;
}

// --- END OF FILE equipment-ui.tsx ---
