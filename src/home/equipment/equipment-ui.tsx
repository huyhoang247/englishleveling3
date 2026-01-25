import React, { useState, useCallback, memo, useEffect } from 'react';
import { 
    getItemDefinition, 
    type ItemRank, 
    RARITY_ORDER 
} from './item-database.ts';
import { uiAssets, equipmentUiAssets } from '../../game-assets.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx'; 
import RateLimitToast from '../../ui/notification.tsx';
import { 
    EquipmentProvider, 
    useEquipment 
} from './equipment-context.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import EquipmentScreenSkeleton from './equipment-loading.tsx';
import TotalStatsModal from './total-stats-modal.tsx';
import ItemRankBorder from './item-rank-border.tsx';
import CraftingEffectCanvas from './crafting-effect.tsx'; 
import UpgradeModal from './upgrade-modal.tsx';

// IMPORT MODALS TỪ FILE MỚI TÁCH
import { ItemDetailModal, CraftingSuccessModal, ForgeModal } from './equipment-modals.tsx';

// --- Bắt đầu: Định nghĩa dữ liệu và các hàm tiện ích cho trang bị ---

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

// 5. Các hàm tiện ích cho Rarity (Export để dùng lại bên equipment-modals.tsx)
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

export const getNextRank = (rank: ItemRank): ItemRank | null => {
    const currentIndex = RARITY_ORDER.indexOf(rank);
    if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) return null;
    return RARITY_ORDER[currentIndex + 1];
};

// --- Các Icon Giao Diện ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> 
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> 
    </svg> 
);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> 
);

// URL ICON
const MERGE_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/merge.webp";
const STATS_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/stats.webp";
const EQUIPMENT_BG_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-equipment.webp";

// --- CÁC COMPONENT CON ---
const Header = memo(({ gold, onClose }: { gold: number; onClose: () => void; }) => {
    const animatedGold = useAnimateValue(gold);
    return (
        <header className="flex-shrink-0 w-full bg-slate-900/90 border-b-2 border-slate-800/50">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại" title="Quay lại">
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

// --- EQUIPMENT SLOT ---
const EquipmentSlot = memo(({ slotType, ownedItem, onClick, isProcessing }: { slotType: EquipmentSlotType, ownedItem: OwnedItem | null, onClick: () => void, isProcessing: boolean }) => {
    const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null;

    if (ownedItem && !itemDef) {
        console.error(`Không tìm thấy định nghĩa cho vật phẩm trang bị với ID: ${ownedItem.itemId}`, ownedItem);
        return (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-red-500 flex items-center justify-center text-center text-red-400 text-xs p-2">
                Lỗi Vật Phẩm (ID: {ownedItem.itemId})
            </div>
        );
    }

    const sizeClasses = "w-24 h-24 sm:w-28 sm:h-28";
    const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer';

    const renderContent = () => (
        <>
            {ownedItem && itemDef ? (
                <>
                    <img 
                        src={itemDef.icon} 
                        alt={itemDef.name} 
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-all duration-300 group-hover:scale-110 relative z-10 drop-shadow-md" 
                    />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold bg-black/80 text-white rounded-md border border-slate-600 z-20 shadow-sm">
                        Lv.{ownedItem.level}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl pointer-events-none z-0" />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-slate-400 transition-colors text-center relative z-10">
                    {(() => {
                        const iconMap = {
                            weapon: equipmentUiAssets.weaponIcon,
                            armor: equipmentUiAssets.armorIcon,
                            Helmet: equipmentUiAssets.helmetIcon,
                        };
                        const iconSrc = iconMap[slotType];
                        if (iconSrc) {
                            return <img src={iconSrc} alt={`${slotType} slot`} className="h-10 w-10 opacity-40 group-hover:opacity-60 transition-opacity" />;
                        }
                        return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
                            </svg>
                        );
                    })()}
                    <span className="text-xs font-semibold uppercase mt-1 opacity-70">{slotType}</span>
                </div>
            )}
        </>
    );

    if (ownedItem && itemDef) {
        return (
            <div 
                className={`relative ${sizeClasses} rounded-xl transition-all duration-300 group ${interactivity} active:scale-95`}
                onClick={!isProcessing ? onClick : undefined}
                title={`${itemDef.name} - Lv.${ownedItem.level}`}
            >
                <ItemRankBorder rank={itemDef.rarity} className="w-full h-full shadow-lg shadow-black/50">
                    {renderContent()}
                </ItemRankBorder>
            </div>
        );
    }

    return (
        <div 
            className={`relative ${sizeClasses} rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center group ${interactivity}`}
            onClick={!isProcessing ? onClick : undefined}
            title={`Ô ${slotType}`}
        >
            {renderContent()}
        </div>
    );
});

const InventorySlot = memo(({ ownedItem, onClick, isProcessing }: { ownedItem: OwnedItem | undefined; onClick: (item: OwnedItem) => void; isProcessing: boolean; }) => {
    const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null;

    if (ownedItem && !itemDef) {
        console.error(`Không tìm thấy định nghĩa cho vật phẩm trong kho với ID: ${ownedItem.itemId}`, ownedItem);
        return (
            <div className="relative aspect-square rounded-lg border-2 border-dashed border-red-500 flex items-center justify-center text-center text-red-400 text-[10px] p-1">
                Lỗi ID: {ownedItem.itemId}
            </div>
        );
    }
    
    const baseClasses = "relative aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center group";
    const interactivity = isProcessing ? 'cursor-wait' : (ownedItem ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default');
    const borderStyle = itemDef ? getRarityColor(itemDef.rarity) : 'border-slate-800 border-dashed';
    const backgroundStyle = itemDef ? 'bg-slate-900/80' : 'bg-slate-900/30';
    const shadowRarity = itemDef ? getRarityColor(itemDef.rarity).replace('border-', '') : 'transparent';
    const shadowColorStyle = itemDef ? { '--tw-shadow-color': `var(--tw-color-${shadowRarity})` } as React.CSSProperties : {};
    
    return (
        <div 
            className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} 
            onClick={ownedItem && !isProcessing ? () => onClick(ownedItem) : undefined}
            style={shadowColorStyle}
        >
            {ownedItem && itemDef ? (
                <>
                    <img 
                        src={itemDef.icon} 
                        alt={itemDef.name} 
                        className="w-3/4 h-3/4 object-contain transition-transform duration-200 group-hover:scale-110"
                        title={`${itemDef.name} - Lv.${ownedItem.level}`}
                    />
                    <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">
                        Lv.{ownedItem.level}
                    </span>
                </>
            ) : (
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
            )}
        </div>
    );
});

// --- COMPONENT HIỂN THỊ CHÍNH ---
function EquipmentScreenContent({ onClose }: { onClose: (data: EquipmentScreenExitData) => void }) {
    const {
        gold,
        equipmentPieces,
        ownedItems,
        equippedItems,
        selectedItem,
        newlyCraftedItem,
        isForgeModalOpen,
        isStatsModalOpen, 
        isProcessing,
        dismantleSuccessToast,
        equippedItemsMap,
        unequippedItemsSorted,
        totalEquippedStats,
        userStatsValue, 
        isLoading,
        handleEquipItem,
        handleUnequipItem,
        handleCraftItem,
        handleDismantleItem,
        handleUpgradeItem,
        handleForgeItems,
        handleSelectItem,
        handleSelectSlot,
        handleCloseDetailModal,
        handleCloseCraftSuccessModal,
        handleOpenForgeModal,
        handleCloseForgeModal,
        handleOpenStatsModal,
        handleCloseStatsModal,
        // --- UPGRADE MODAL HANDLERS & STATE ---
        itemToUpgrade,
        isUpgradeModalOpen,
        handleOpenUpgradeModal,
        handleCloseUpgradeModal,
        stoneCounts,
        
        MAX_ITEMS_IN_STORAGE,
        CRAFTING_COST
    } = useEquipment();
    
    // --- START: STATE VÀ LOGIC CHO HIỆU ỨNG CRAFTING ---
    const [isCraftingAnimation, setIsCraftingAnimation] = useState(false);
    const [minTimeElapsed, setMinTimeElapsed] = useState(true);

    const CRAFT_DURATION = 3000; 

    const onCraftClick = useCallback(() => {
        setIsCraftingAnimation(true);
        setMinTimeElapsed(false);
        handleCraftItem();
        setTimeout(() => {
            setMinTimeElapsed(true);
        }, CRAFT_DURATION);
    }, [handleCraftItem]);

    useEffect(() => {
        if (!isProcessing && minTimeElapsed) {
            const timer = setTimeout(() => {
                setIsCraftingAnimation(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isProcessing, minTimeElapsed]);

    useEffect(() => {
        if (isCraftingAnimation) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none'; 
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        };
    }, [isCraftingAnimation]);
    // --- END: LOGIC HIỆU ỨNG CRAFTING ---

    const handleClose = useCallback(() => {
        onClose({
            gold,
            equipmentPieces,
            ownedItems,
            equippedItems
        });
    }, [onClose, gold, equipmentPieces, ownedItems, equippedItems]);

    const displayGold = isLoading ? 0 : gold;

    const showEffect = isCraftingAnimation; 

    return (
        <div 
            className="main-bg relative w-full min-h-screen font-sans text-white overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${EQUIPMENT_BG_URL})` }}
        >
            <div className="absolute inset-0 bg-black/75 pointer-events-none z-0" />

            <style>{`.title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 
            @keyframes subtle-bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            .animate-subtle-bounce {
              animation: subtle-bounce 2s infinite ease-in-out;
            }
            `}</style>
            
            <CraftingEffectCanvas isActive={showEffect} />

            <RateLimitToast show={dismantleSuccessToast.show} message={dismantleSuccessToast.message} showIcon={false} />
            
            {/* ITEM DETAIL MODAL (Imported) */}
            {!isCraftingAnimation && selectedItem && (
                <ItemDetailModal 
                    ownedItem={selectedItem} 
                    onClose={handleCloseDetailModal} 
                    onEquip={handleEquipItem} 
                    onUnequip={handleUnequipItem} 
                    onDismantle={handleDismantleItem} 
                    onOpenUpgrade={handleOpenUpgradeModal} 
                    isEquipped={Object.values(equippedItems).includes(selectedItem.id)} 
                    isProcessing={isProcessing}
                />
            )}
            
            <UpgradeModal 
                isOpen={isUpgradeModalOpen}
                onClose={handleCloseUpgradeModal}
                item={itemToUpgrade}
                onUpgrade={handleUpgradeItem}
                isProcessing={isProcessing}
                stoneCounts={stoneCounts}
            />

            {/* CRAFTING SUCCESS MODAL (Imported) */}
            {!isCraftingAnimation && newlyCraftedItem && (
                <CraftingSuccessModal ownedItem={newlyCraftedItem} onClose={handleCloseCraftSuccessModal} />
            )}
            
            {/* FORGE MODAL (Imported) */}
            <ForgeModal 
                isOpen={isForgeModalOpen} 
                onClose={handleCloseForgeModal} 
                ownedItems={ownedItems} 
                onForge={handleForgeItems} 
                isProcessing={isProcessing} 
                equippedItemIds={Object.values(equippedItems)} 
            />

            <TotalStatsModal 
                isOpen={isStatsModalOpen} 
                onClose={handleCloseStatsModal} 
                equipmentStats={totalEquippedStats}
                upgradeStats={userStatsValue}
            />

            <div className={`absolute inset-0 z-20 ${isLoading ? '' : 'hidden'}`}>
                <EquipmentScreenSkeleton />
            </div>
            
            <div className={`relative z-10 flex flex-col w-full h-screen ${isLoading ? 'hidden' : ''} ${isCraftingAnimation ? 'pointer-events-none select-none' : ''}`}>
                <Header gold={displayGold} onClose={handleClose} />
                <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8">
                    <section className="flex-shrink-0 py-4">
                        <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                            {EQUIPMENT_SLOT_TYPES.map(slotType => <EquipmentSlot key={slotType} slotType={slotType} ownedItem={equippedItemsMap[slotType]} onClick={() => handleSelectSlot(slotType)} isProcessing={isProcessing} />)}
                        </div>
                    </section>
                    <section className="flex-shrink-0 p-3 bg-black/40 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <EquipmentPieceIcon className="w-10 h-10" />
                            <div className="flex items-baseline gap-1 font-lilita tracking-wide">
                                <span className="text-2xl text-white">{equipmentPieces.toLocaleString()}</span>
                                <span className="text-xl text-slate-400">/ {CRAFTING_COST}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onCraftClick} 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-lilita uppercase text-lg tracking-wider py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" 
                            disabled={equipmentPieces < CRAFTING_COST || isProcessing || ownedItems.length >= MAX_ITEMS_IN_STORAGE}
                        >
                            Craft
                        </button>
                    </section>
                    
                    <section className="w-full p-4 bg-black/40 rounded-xl border border-slate-800 flex flex-col flex-grow min-h-0">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div className="flex items-center justify-center px-4 py-1.5 bg-slate-950/80 rounded-lg border border-slate-700 shadow-sm transition-colors hover:border-slate-500 hover:bg-slate-900">
                                <div className="flex items-baseline text-sm font-mono">
                                    <span className="text-white font-bold">{unequippedItemsSorted.length}</span>
                                    <span className="text-slate-500 mx-0.5">/</span>
                                    <span className="text-slate-400 text-xs font-semibold">{MAX_ITEMS_IN_STORAGE}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-12"> 
                                {/* NÚT STATS (Trái) */}
                                <button 
                                    onClick={handleOpenStatsModal} 
                                    className="relative w-10 h-10 group disabled:opacity-50 disabled:cursor-not-allowed" 
                                    disabled={isProcessing}
                                    title="View Stats"
                                >
                                    <img 
                                        src={STATS_ICON_URL} 
                                        alt="Stats" 
                                        className="absolute top-1/2 left-[10%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 max-w-none object-contain filter drop-shadow-md transition-transform group-hover:scale-110 active:scale-95" 
                                    />
                                </button>

                                {/* NÚT MERGE (Phải) */}
                                <button 
                                    onClick={handleOpenForgeModal} 
                                    className="relative w-10 h-10 group disabled:opacity-50 disabled:cursor-not-allowed" 
                                    disabled={isProcessing}
                                    title="Merge Equipment"
                                >
                                    <img 
                                        src={MERGE_ICON_URL} 
                                        alt="Merge" 
                                        className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 max-w-none object-contain filter drop-shadow-md transition-transform group-hover:scale-110 active:scale-95" 
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow min-h-0 overflow-y-auto hide-scrollbar -m-1 p-1">
                            {unequippedItemsSorted.length > 0 ? (
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {unequippedItemsSorted.map((ownedItem) => (
                                        <InventorySlot
                                            key={ownedItem.id}
                                            ownedItem={ownedItem}
                                            onClick={handleSelectItem}
                                            isProcessing={isProcessing}
                                        />
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

// --- COMPONENT CHA WRAPPER ---
interface EquipmentScreenProps {
    onClose: (data: EquipmentScreenExitData) => void;
    userId: string;
}

export default function EquipmentScreen({ onClose, userId }: EquipmentScreenProps) {
    return (
        <EquipmentProvider>
            <EquipmentScreenContent onClose={onClose} />
        </EquipmentProvider>
    );
}
