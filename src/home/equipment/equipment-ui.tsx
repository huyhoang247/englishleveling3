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

// IMPORT COMPONENT MỚI TÁCH RA
import UpgradeModal from './upgrade-modal.tsx';

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

// 5. Các hàm tiện ích cho Rarity (Export để dùng lại nếu cần)
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
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.goldIcon} alt="Vàng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> </svg>);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> );
const StatsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/> </svg>);

const HpIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statHpIcon} alt="HP Icon" {...props} />;
const AtkIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statAtkIcon} alt="ATK Icon" {...props} />;
const DefIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statDefIcon} alt="DEF Icon" {...props} />;

const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: any) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

// URL ICON
const UPGRADE_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/upgrade-equipment.webp";
const MERGE_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/merge.webp";

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

// --- ITEM DETAIL MODAL (ĐÃ CẬP NHẬT: ICON DỊCH TRÁI, NẢY 4PX) ---
const ItemDetailModal = memo(({ ownedItem, onClose, onEquip, onUnequip, onDismantle, onOpenUpgrade, isEquipped, isProcessing }: { 
    ownedItem: OwnedItem, 
    onClose: () => void, 
    onEquip: (item: OwnedItem) => void, 
    onUnequip: (item: OwnedItem) => void, 
    onDismantle: (item: OwnedItem) => void, 
    onOpenUpgrade: (item: OwnedItem) => void,
    isEquipped: boolean, 
    isProcessing: boolean 
}) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    useEffect(() => {
        if (!itemDef) {
            console.error(`Không thể mở modal chi tiết cho vật phẩm không tồn tại với ID: ${ownedItem.itemId}`);
            onClose();
        }
    }, [itemDef, ownedItem.itemId, onClose]);

    if (!itemDef) {
        return null;
    }
    
    const sortedStats = useMemo(() => {
        const order = ['hp', 'atk', 'def'];
        const stats = ownedItem.stats || {};
        const orderedEntries: [string, any][] = [];
        const remainingEntries = { ...stats };
        for (const key of order) {
            if (stats.hasOwnProperty(key)) {
                orderedEntries.push([key, stats[key]]);
                delete remainingEntries[key];
            }
        }
        orderedEntries.push(...Object.entries(remainingEntries));
        return orderedEntries;
    }, [ownedItem.stats]);
    
    // Kiểm tra xem item có nâng cấp được không
    const isUpgradable = !!itemDef.stats && sortedStats.some(([_, value]) => typeof value === 'number');
    const hasStats = sortedStats.length > 0;
    const actionDisabled = isProcessing;
    
    // Nút Style Compact & Tinh tế
    const commonBtnClasses = "flex-1 py-2.5 rounded-xl font-lilita text-base tracking-wide shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none uppercase";
    
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
                <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(itemDef.rarity)} bg-gray-800/70 border ${getRarityColor(itemDef.rarity)}`}>{`${itemDef.rarity} Rank`}</span>
                        <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {ownedItem.level}</span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2 pb-2">
                    <div className="flex flex-col items-center text-center gap-4">
                        {/* Wrapper chứa Icon trang bị và Nút nâng cấp (icon búa) */}
                        <div className="relative">
                            <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                                 <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                            </div>
                            
                            {/* Nút mở Popup Cường Hoá (Dạng Icon bên phải, không glow, nảy nhẹ) */}
                            {isUpgradable && (
                                <button 
                                    onClick={() => onOpenUpgrade(ownedItem)}
                                    disabled={actionDisabled}
                                    title="Enhance Equipment"
                                    // Điều chỉnh từ -right-20 thành -right-16 để dịch trái 1 tí
                                    className="absolute top-1/2 -right-16 -translate-y-1/2 w-12 h-12 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                >
                                    <img 
                                        src={UPGRADE_ICON_URL} 
                                        alt="Enhance" 
                                        // Animate bounce
                                        className="w-full h-full object-contain animate-subtle-bounce" 
                                    />
                                </button>
                            )}
                        </div>

                        <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-700/50 text-left">
                            <p className="text-slate-300 text-sm leading-relaxed">{itemDef.description}</p>
                        </div>
                        
                        {hasStats && (
                            <div className="w-full bg-black/20 rounded-lg overflow-hidden p-3 space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1 text-left">Stats</h4>
                                {sortedStats.map(([key, value]) => { 
                                    const config = STAT_CONFIG[key.toLowerCase()]; 
                                    const baseStat = itemDef.stats?.[key]; 
                                    let bonus = 0; 
                                    if (typeof value === 'number' && typeof baseStat === 'number' && itemDef.level === 1) { bonus = value - baseStat; } 
                                    return (
                                        <div key={key} className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg">
                                            {config?.Icon && (<div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-black/30 ${config.color}`}><config.Icon className="w-4 h-4" /></div>)}
                                            <div className="flex flex-1 items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-300 capitalize">{config?.name || key}</span>
                                                <span className="font-bold text-sm text-white">{typeof value === 'number' ? value.toLocaleString() : value}{bonus > 0 && (<span className="text-green-400 ml-2 font-normal text-xs">(+{bonus.toLocaleString()})</span>)}</span>
                                            </div>
                                        </div>
                                    ); 
                                })}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => isEquipped ? onUnequip(ownedItem) : onEquip(ownedItem)} 
                            disabled={actionDisabled} 
                            className={`${commonBtnClasses} ${isEquipped ? 'bg-gradient-to-r from-rose-800 to-red-900 text-slate-200' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'}`}
                        >
                            {isEquipped ? 'Unequip' : 'Equip'}
                        </button>
                        <button 
                            onClick={() => onDismantle(ownedItem)} 
                            disabled={isEquipped || actionDisabled} 
                            className={`${commonBtnClasses} bg-slate-700 text-slate-300 hover:bg-slate-600`}
                        >
                            Recycle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;
    
    const rarityTextColor = getRarityTextColor(itemDef.rarity);
    const rarityColor = getRarityColor(itemDef.rarity).replace('border-', ''); 
    const shadowStyle = { boxShadow: `0 0 25px -5px var(--tw-color-${rarityColor}), 0 0 15px -10px var(--tw-color-${rarityColor})` };

    return ( 
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> 
            <div className="fixed inset-0 bg-black/80" onClick={onClose}></div> 
            <div className="relative w-full max-w-sm"> 
                <div className="absolute inset-0.5 animate-spin-slow-360"> 
                    <div className={`absolute -inset-2 bg-gradient-to-r ${getRarityGradient(itemDef.rarity)} opacity-50 rounded-full blur-2xl`}></div> 
                </div> 
                <div 
                    className={`relative bg-gradient-to-b ${getRarityGradient(itemDef.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(itemDef.rarity)} text-center flex flex-col items-center gap-4`} 
                    style={shadowStyle}
                > 
                    <h2 className="text-lg font-semibold tracking-wider uppercase text-white title-glow">Chế Tạo Thành Công</h2> 
                    
                    <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                        <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                    </div>
                    
                    <div className="w-full p-4 bg-black/25 rounded-lg border border-slate-700/50 text-center flex flex-col gap-2">
                        <div>
                            <h3 className={`text-xl font-bold ${rarityTextColor}`}>{itemDef.name}</h3>
                            <p className={`font-semibold ${rarityTextColor} opacity-80 capitalize text-sm`}>{itemDef.rarity} Rank</p>
                        </div>
                        <hr className="border-slate-700/50 my-1" />
                        <p className="text-sm text-slate-300 leading-relaxed">{itemDef.description}</p>
                    </div>

                </div> 
            </div> 
        </div> 
    );
});

interface ForgeResult { level: number; refundGold: number; }
interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: ForgeResult; 
}

const calculateForgeResult = (itemsToForge: OwnedItem[], definition: ItemDefinition): ForgeResult => {
    // Helper function copy từ context để tính toán display
    const getBaseUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
        const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
        return Math.floor(50 * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]);
    };
    const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += getBaseUpgradeCost(itemDef, i);
        }
        return total;
    };
    
    if (itemsToForge.length < 3) return { level: 1, refundGold: 0 };
    const totalInvestedGold = itemsToForge.reduce((total, item) => total + getTotalUpgradeCost(definition, item.level), 0);
    let finalLevel = 1, remainingGold = totalInvestedGold;
    while (true) {
        const costForNextLevel = getBaseUpgradeCost(definition, finalLevel);
        if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; }
    }
    return { level: finalLevel, refundGold: remainingGold };
};

const ForgeModal = memo(({ isOpen, onClose, ownedItems, onForge, isProcessing, equippedItemIds }: { isOpen: boolean; onClose: () => void; ownedItems: OwnedItem[]; onForge: (group: ForgeGroup) => void; isProcessing: boolean; equippedItemIds: (string | null)[] }) => {
    const forgeableGroups = useMemo<ForgeGroup[]>(() => {
        if (!isOpen) return [];
        const unequippedItems = ownedItems.filter(s => !equippedItemIds.includes(s.id));
        
        const groups: Record<string, OwnedItem[]> = {};
        for (const item of unequippedItems) {
            const definition = getItemDefinition(item.itemId);
            if (!definition || !definition.baseId) continue;

            const key = `${definition.baseId}-${definition.rarity}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        }

        return Object.values(groups)
            .filter(group => group.length >= 3)
            .map(group => {
                const firstItemDef = getItemDefinition(group[0].itemId)!;
                const blueprint = getBlueprintByName(firstItemDef.name)!;
                const nextRank = getNextRank(firstItemDef.rarity);
                const sortedItems = [...group].sort((a, b) => b.level - a.level);
                const top3Items = sortedItems.slice(0, 3);
                const estimatedResult = calculateForgeResult(top3Items, firstItemDef);
                
                return { blueprint, rarity: firstItemDef.rarity, items: sortedItems, nextRank, estimatedResult };
            })
            .filter(group => group.nextRank !== null)
            .sort((a, b) => a.blueprint.name.localeCompare(b.blueprint.name));
    }, [isOpen, ownedItems, equippedItemIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className="relative bg-gradient-to-br from-gray-900 to-slate-900 p-5 rounded-xl border-2 border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col">
                <div className="flex-shrink-0 border-b border-slate-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <MergeIcon className="w-7 h-7 text-purple-400" />
                            <h3 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Hợp nhất trang bị</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Hợp nhất 3 trang bị <span className="font-bold text-white">cùng loại, cùng hạng</span> để tạo 1 trang bị hạng cao hơn. Hệ thống sẽ ưu tiên các trang bị cấp cao nhất.</p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2 space-y-4">
                    {forgeableGroups.length > 0 ? (
                        forgeableGroups.map(group => (
                            <div key={`${group.blueprint.baseId}-${group.rarity}`} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4">
                                <div className="flex flex-1 items-center justify-center gap-4 sm:gap-6">
                                    <div className={`relative w-16 h-16 flex items-center justify-center rounded-md border-2 ${getRarityColor(group.rarity)} bg-black/30`}>
                                        <img src={group.blueprint.icon} className="w-12 h-12 object-contain" />
                                        <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-slate-700">3/{group.items.length}</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    <div className={`relative w-16 h-16 flex items-center justify-center rounded-md border-2 ${getRarityColor(group.nextRank!)} bg-black/30`}>
                                        <img src={group.blueprint.icon} className="w-12 h-12 object-contain" />
                                        <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-slate-700">Lv.{group.estimatedResult.level}</span>
                                    </div>
                                </div>
                                <button onClick={() => onForge(group)} disabled={isProcessing} title="Merge" className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm h-8 px-4 rounded-md shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">Merge</button>
                            </div>
                        ))
                    ) : ( <div className="flex items-center justify-center h-full text-slate-500 text-center py-10"><p>Không có trang bị nào có thể hợp nhất.</p></div> )}
                </div>
            </div>
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
    // Thêm state để kiểm soát thời gian tối thiểu
    const [minTimeElapsed, setMinTimeElapsed] = useState(true);

    // Thời gian hiệu ứng chạy (ms)
    const CRAFT_DURATION = 3000; // 3 giây

    // Kích hoạt hiệu ứng khi nhấn nút Craft
    const onCraftClick = useCallback(() => {
        // 1. Bật màn hình hiệu ứng
        setIsCraftingAnimation(true);
        // 2. Đánh dấu là chưa chạy xong thời gian tối thiểu
        setMinTimeElapsed(false);
        
        // 3. Gọi API xử lý logic game
        handleCraftItem();

        // 4. Đặt timer để đảm bảo hiệu ứng chạy ít nhất 3 giây
        setTimeout(() => {
            setMinTimeElapsed(true);
        }, CRAFT_DURATION);
    }, [handleCraftItem]);

    // Logic tắt hiệu ứng
    useEffect(() => {
        // Chỉ tắt hiệu ứng khi:
        // 1. Server đã xử lý xong (!isProcessing)
        // 2. VÀ Thời gian tối thiểu đã trôi qua (minTimeElapsed)
        if (!isProcessing && minTimeElapsed) {
            // Thêm delay nhỏ 200ms để transition mượt mà
            const timer = setTimeout(() => {
                setIsCraftingAnimation(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isProcessing, minTimeElapsed]);
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

    // Canvas chỉ hiển thị khi isCraftingAnimation = true
    const showEffect = isCraftingAnimation; 

    return (
        <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
            <style>{`.title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 
            
            /* Thêm hiệu ứng nảy nhẹ nhàng (Đã chỉnh xuống 4px) */
            @keyframes subtle-bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            .animate-subtle-bounce {
              animation: subtle-bounce 2s infinite ease-in-out;
            }
            `}</style>
            
            {/* --- COMPONENT HIỆU ỨNG CANVAS --- */}
            {/* Truyền isActive={showEffect} để canvas biết khi nào chạy */}
            <CraftingEffectCanvas isActive={showEffect} />
            {/* ---------------------------------- */}

            <RateLimitToast show={dismantleSuccessToast.show} message={dismantleSuccessToast.message} showIcon={false} />
            
            {/* ITEM DETAIL MODAL (Đã sửa để gọi onOpenUpgrade) */}
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
            
            {/* UPGRADE MODAL (POPUP MỚI) - Import từ file riêng */}
            <UpgradeModal 
                isOpen={isUpgradeModalOpen}
                onClose={handleCloseUpgradeModal}
                item={itemToUpgrade}
                onUpgrade={handleUpgradeItem}
                isProcessing={isProcessing}
                stoneCounts={stoneCounts}
            />

            {/* Modal Craft Success chỉ hiện khi hiệu ứng đã tắt */}
            {!isCraftingAnimation && newlyCraftedItem && <CraftingSuccessModal ownedItem={newlyCraftedItem} onClose={handleCloseCraftSuccessModal} />}
            
            <ForgeModal isOpen={isForgeModalOpen} onClose={handleCloseForgeModal} ownedItems={ownedItems} onForge={handleForgeItems} isProcessing={isProcessing} equippedItemIds={Object.values(equippedItems)} />
            <TotalStatsModal 
                isOpen={isStatsModalOpen} 
                onClose={handleCloseStatsModal} 
                equipmentStats={totalEquippedStats}
                upgradeStats={userStatsValue}
            />

            <div className={`absolute inset-0 z-20 ${isLoading ? '' : 'hidden'}`}>
                <EquipmentScreenSkeleton />
            </div>
            
            <div className={`relative z-10 flex flex-col w-full h-screen ${isLoading ? 'hidden' : ''}`}>
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
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white">{equipmentPieces.toLocaleString()}</span>
                                <span className="text-base text-slate-400">/ {CRAFTING_COST}</span>
                            </div>
                        </div>
                        {/* Nút Craft kích hoạt logic mới */}
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
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Storage</h2>
                                <span className="text-sm font-semibold text-slate-300">{unequippedItemsSorted.length}<span className="text-xs text-slate-500"> / {MAX_ITEMS_IN_STORAGE}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleOpenStatsModal} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}><StatsIcon className="w-4 h-4" />Stats</button>
                                
                                {/* NÚT MERGE ĐÃ ĐƯỢC THAY ĐỔI */}
                                <button 
                                    onClick={handleOpenForgeModal} 
                                    className="group relative flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-lg bg-gradient-to-b from-purple-700 via-purple-800 to-indigo-900 border border-purple-500/50 shadow-lg shadow-purple-900/40 hover:shadow-purple-500/40 hover:scale-105 hover:border-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                                    disabled={isProcessing}
                                    title="Hợp nhất trang bị"
                                >
                                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-md group-hover:drop-shadow-xl transition-all">
                                        <img 
                                            src={MERGE_ICON_URL} 
                                            alt="Merge" 
                                            className="w-full h-full object-contain" 
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-100 tracking-wide uppercase group-hover:text-white text-shadow-sm">Merge</span>
                                    {/* Hiệu ứng bóng lóa nhẹ khi hover */}
                                    <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
