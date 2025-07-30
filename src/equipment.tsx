// --- START OF FILE equipment.tsx (FIXED) ---

import React, { useState, useMemo, useCallback, memo } from 'react';
// THAY ĐỔI: Import các hàm và cấu trúc mới từ item-database
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

// --- Bắt đầu: Định nghĩa dữ liệu và các hàm tiện ích cho trang bị ---

// THAY ĐỔI: Thêm thuộc tính `stats` để mỗi vật phẩm có chỉ số riêng
export interface OwnedItem {
    id: string;
    itemId: number;
    level: number;
    stats: { [key: string]: any }; // <-- THAY ĐỔI QUAN TRỌNG
}

export type EquipmentSlotType = 'weapon' | 'armor' | 'accessory';
export const EQUIPMENT_SLOT_TYPES: EquipmentSlotType[] = ['weapon', 'armor', 'accessory'];

export type EquippedItems = {
    [key in EquipmentSlotType]: string | null;
};

// 5. Các hàm tiện ích cho Rarity (ItemRank)
const getRarityColor = (rank: ItemRank): string => {
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

const getRarityTextColor = (rank: ItemRank): string => {
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

const getRarityGradient = (rank: ItemRank): string => {
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

const getRandomRank = (): ItemRank => {
    const rand = Math.random() * 100;
    if (rand < 0.1) return 'SR';
    if (rand < 1) return 'S';
    if (rand < 5) return 'A';
    if (rand < 20) return 'B';
    if (rand < 50) return 'D';
    return 'E';
};

// 6. Logic chi phí
const CRAFTING_COST = 50;
const DISMANTLE_RETURN_BOOKS = 25;

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

// --- Các Icon Giao Diện ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/close.png" alt="Đóng" className={className} /> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Vàng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const ForgeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M21.707 13.293l-4-4a1 1 0 00-1.414 1.414L17.586 12H13V4a1 1 0 00-2 0v8H6.414l1.293-1.293a1 1 0 00-1.414-1.414l-4 4a1 1 0 000 1.414l4 4a1 1 0 001.414-1.414L6.414 14H11v8a1 1 0 002 0v-8h4.586l-1.293 1.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414z"/> </svg>);
const AncientBookIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/sach-co.png" alt="Sách Cổ" className={className} /> );

// --- CoinDisplay Component ---
const CoinDisplay = ({ displayedCoins }: { displayedCoins: number; }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full border border-slate-700">
        <GoldIcon className="w-6 h-6" />
        <span className="text-base font-bold text-yellow-300 tracking-wider">{displayedCoins.toLocaleString()}</span>
    </div>
);

// --- CÁC COMPONENT CON ---

const Header = memo(({ gold, onClose }: { gold: number; onClose: () => void; }) => {
    return (
        <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50 backdrop-blur-sm">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại" title="Quay lại">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
                </button>
                <div className="flex items-center gap-4 sm:gap-6">
                    <CoinDisplay displayedCoins={gold} />
                </div>
            </div>
        </header>
    );
});

const EquipmentSlot = memo(({ slotType, ownedItem, onClick, isProcessing }: { slotType: EquipmentSlotType, ownedItem: OwnedItem | null, onClick: () => void, isProcessing: boolean }) => {
    const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null;
    const baseClasses = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center group";
    const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer';
    const borderStyle = itemDef ? `${getRarityColor(itemDef.rarity)} hover:opacity-80` : 'border-dashed border-slate-600 hover:border-slate-400';
    const backgroundStyle = itemDef ? 'bg-slate-900/80' : 'bg-slate-900/50';

    const getPlaceholderIcon = () => {
        if (slotType === 'weapon') return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v11.494m-5.747-6.248h11.494" /></svg>;
        if (slotType === 'armor') return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
    };

    return (
        <div className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} onClick={!isProcessing ? onClick : undefined} title={itemDef ? `${itemDef.name} - Lv.${ownedItem?.level}` : `Ô ${slotType}`}>
            {ownedItem && itemDef ? (
                <>
                    <div className="transition-all duration-300 group-hover:scale-110">
                        <img src={itemDef.icon} alt={itemDef.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                    </div>
                    <span className="absolute top-1 right-1.5 px-1.5 py-0.5 text-xs font-bold bg-black/60 text-white rounded-md border border-slate-600">
                        Lv.{ownedItem.level}
                    </span>
                </>
            ) : (
                <div className="text-slate-600 group-hover:text-slate-400 transition-colors text-center">
                    {getPlaceholderIcon()}
                    <span className="text-xs font-semibold uppercase mt-1">{slotType}</span>
                </div>
            )}
        </div>
    );
});

const ItemCard = memo(({ ownedItem, onClick, isEquipped, isProcessing }: { ownedItem: OwnedItem, onClick: (item: OwnedItem) => void, isEquipped: boolean, isProcessing: boolean }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;

    const baseClasses = "relative w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all duration-200";
    const interactivity = isEquipped ? 'opacity-50 cursor-not-allowed' : (isProcessing ? 'cursor-wait' : `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10`);

    return (
        <div className={`${baseClasses} border-slate-700 bg-slate-900/70 ${interactivity}`} onClick={!isEquipped && !isProcessing ? () => onClick(ownedItem) : undefined}>
            {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-cyan-400">Đang Trang Bị</div>}
            <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-md border ${getRarityColor(itemDef.rarity)} bg-black/20`}>
                <img src={itemDef.icon} alt={itemDef.name} className="w-10 h-10 object-contain" />
            </div>
            <div className="flex-grow flex flex-col justify-center">
                <div className="flex justify-between items-center">
                    <h3 className={`text-base font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 border ${getRarityColor(itemDef.rarity)} ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.rarity}</span>
                </div>
                <div className="mt-1">
                    <span className="text-xs font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded-full border border-slate-600">Level {ownedItem.level}</span>
                </div>
            </div>
        </div>
    );
});

// --- Icons và Cấu hình Chỉ số ---
const HpIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/> </svg> );
const AtkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M17.46,3.26a1.5,1.5,0,0,0-2.12,0L3.25,15.35a1.5,1.5,0,0,0,0,2.12l2.83,2.83a1.5,1.5,0,0,0,2.12,0L20.29,8.21a1.5,1.5,0,0,0,0-2.12Zm-11,14.31L4.6,15.71,15,5.34l1.83,1.83ZM18,7.5,16.5,6l1.41-1.41a.5.5,0,0,1,.71.71Z"/> </svg> );
const DefIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z"/> </svg> );
const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

// ==================================================================
// ============ START OF UPDATED ItemDetailModal COMPONENT ==========
// ==================================================================

const ItemDetailModal = memo(({ ownedItem, onClose, onEquip, onUnequip, onDismantle, onUpgrade, isEquipped, gold, isProcessing }: { ownedItem: OwnedItem, onClose: () => void, onEquip: (item: OwnedItem) => void, onUnequip: (item: OwnedItem) => void, onDismantle: (item: OwnedItem) => void, onUpgrade: (item: OwnedItem) => void, isEquipped: boolean, gold: number, isProcessing: boolean }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    const [activeTab, setActiveTab] = useState<'stats' | 'upgrade'>('stats');

    // === START: FIX BUG LOGIC ===
    // Lấy thông tin của blueprint gốc để tạo ra một item definition "sạch", không có random stat.
    // Điều này đảm bảo chúng ta luôn so sánh chỉ số hiện tại với chỉ số gốc thực sự.
    const nonRandomBaseItemDef = useMemo(() => {
        if (!itemDef || !itemDef.baseId) return null;
        const blueprint = itemBlueprints.find(bp => bp.baseId === itemDef.baseId);
        if (!blueprint) return null;
        // Gọi generateItemDefinition với isRandomizedCraft = false để có chỉ số gốc, không ngẫu nhiên.
        return generateItemDefinition(blueprint, itemDef.rarity, false);
    }, [itemDef]);
    // === END: FIX BUG LOGIC ===

    if (!itemDef) return null;

    const isUpgradable = !!nonRandomBaseItemDef?.stats;
    const currentUpgradeCost = isUpgradable ? getUpgradeCost(itemDef, ownedItem.level) : 0;
    const canAffordUpgrade = isUpgradable && gold >= currentUpgradeCost;
    const hasStats = ownedItem.stats && Object.keys(ownedItem.stats).length > 0;

    const actionDisabled = isProcessing;
    const mainActionText = isEquipped ? 'Tháo Ra' : 'Trang Bị';
    const mainActionHandler = () => isEquipped ? onUnequip(ownedItem) : onEquip(ownedItem);
    const mainActionStyle = isEquipped 
        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 active:scale-100'
        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100';
    const mainActionDisabledStyle = 'bg-slate-700 text-slate-500 cursor-not-allowed';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(itemDef.rarity)} bg-gray-800/70 border ${getRarityColor(itemDef.rarity)} capitalize`}>{itemDef.rarity}</span>
                        <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {ownedItem.level}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                             <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                        </div>
                        <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-700/50 text-left">
                            <p className="text-slate-300 text-sm leading-relaxed">{itemDef.description}</p>
                        </div>
                        
                        {(hasStats || isUpgradable) && (
                            <div className="w-full bg-black/20 rounded-lg">
                                {/* Tab Buttons */}
                                <div className="flex border-b border-slate-700/50">
                                    <button 
                                        onClick={() => setActiveTab('stats')}
                                        className={`relative px-4 py-2 text-sm font-bold transition-colors ${
                                            activeTab === 'stats' ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                        Chỉ Số
                                        {activeTab === 'stats' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-cyan-400"></div>}
                                    </button>
                                    {isUpgradable && (
                                        <button 
                                            onClick={() => setActiveTab('upgrade')}
                                            className={`relative px-4 py-2 text-sm font-bold transition-colors ${
                                                activeTab === 'upgrade' ? 'text-purple-300' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            Nâng Cấp
                                            {activeTab === 'upgrade' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-purple-400"></div>}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="p-4">
                                    {activeTab === 'stats' && (
                                        <div className="space-y-1">
                                            {hasStats ? Object.entries(ownedItem.stats).map(([key, currentStatValue]) => {
                                                const config = STAT_CONFIG[key.toLowerCase()];
                                                // Lấy chỉ số gốc từ item definition "sạch" đã tạo ở trên
                                                const baseStatValue = nonRandomBaseItemDef?.stats?.[key];
                                                let bonus = 0;

                                                // Tính bonus = chỉ số hiện tại - chỉ số gốc
                                                if (typeof currentStatValue === 'number' && typeof baseStatValue === 'number') {
                                                    bonus = currentStatValue - baseStatValue;
                                                }

                                                // Chỉ số gốc để hiển thị bên trái (là chỉ số thực tế của vật phẩm trừ đi bonus)
                                                const displayBase = typeof currentStatValue === 'number' ? currentStatValue - bonus : currentStatValue;

                                                return (
                                                    <div key={key} className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg">
                                                        {config?.Icon && (
                                                            <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-black/30 ${config.color}`}>
                                                                <config.Icon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-1 items-center justify-between">
                                                            <span className="text-xs font-semibold text-slate-300 capitalize">{config?.name || key}</span>
                                                            <span className="font-bold text-sm text-white">
                                                                {typeof displayBase === 'number' ? displayBase.toLocaleString() : displayBase}
                                                                
                                                                {bonus > 0 && (
                                                                    <span className="text-green-400 ml-2 font-normal text-xs">
                                                                        (+{bonus.toLocaleString()})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <p className="text-sm text-slate-500 text-center py-4">Vật phẩm này không có chỉ số.</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'upgrade' && isUpgradable && (
                                        <div className="w-full">
                                            <div className="space-y-2 mb-4">
                                                {Object.entries(ownedItem.stats).map(([key, value]) => {
                                                    if (typeof value !== 'number') return null;
                                                    const config = STAT_CONFIG[key.toLowerCase()];
                                                    // Tính toán mức tăng dựa trên chỉ số hiện tại
                                                    const increase = Math.max(1, Math.round(value * 0.05) + Math.floor(ownedItem.level / 10)); // Ví dụ công thức nâng cấp phức tạp hơn
                                                    const nextValue = value + increase;
                                                    
                                                    return (
                                                        <div key={key} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-md">
                                                            {config?.Icon && <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-black/30 ${config.color}`}><config.Icon className="w-3.5 h-3.5" /></div>}
                                                            <span className="w-10 font-semibold text-slate-300 text-xs">{config?.name || key}</span>
                                                            <div className="flex flex-1 items-center justify-end gap-2 font-mono text-sm">
                                                                <span className="text-slate-400">{value.toLocaleString()}</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                                                                <span className="font-bold text-green-400 w-12 text-left">{nextValue.toLocaleString()}</span>
                                                                <span className="text-green-500 text-xs font-sans">(+{increase})</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="font-bold text-lg">
                                                    <span className="text-slate-300">Lv. {ownedItem.level}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 inline mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                                    <span className="text-green-400">Lv. {ownedItem.level + 1}</span>
                                                </div>

                                                <button 
                                                    onClick={() => onUpgrade(ownedItem)} 
                                                    disabled={!canAffordUpgrade || actionDisabled} 
                                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform 
                                                    ${!canAffordUpgrade || actionDisabled 
                                                        ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed' 
                                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10 hover:scale-[1.02] active:scale-100 border border-purple-500'}`}
                                                >
                                                    <GoldIcon className="w-5 h-5"/> 
                                                    <span>{currentUpgradeCost.toLocaleString()}</span>
                                                </button>
                                            </div>
                                            {!canAffordUpgrade && !actionDisabled && <p className="text-right text-xs text-red-400 mt-2">Không đủ vàng</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
                    <div className="flex items-center gap-3">
                        <button onClick={mainActionHandler} disabled={actionDisabled} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${actionDisabled ? mainActionDisabledStyle : mainActionStyle}`}>{mainActionText}</button>
                        <button onClick={() => onDismantle(ownedItem)} disabled={isEquipped || actionDisabled} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped || actionDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-100'}`}>Phân Rã</button>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ================================================================
// ============ END OF UPDATED ItemDetailModal COMPONENT ==========
// ================================================================

const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;
    
    const rarityTextColor = getRarityTextColor(itemDef.rarity);
    const rarityColorVal = getRarityColor(itemDef.rarity).replace('border-', ''); 
    const shadowStyle = { boxShadow: `0 0 25px -5px ${rarityColorVal}, 0 0 15px -10px ${rarityColorVal}` };

    return ( <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div> <div className="relative w-full max-w-sm"> <div className="absolute inset-0.5 animate-spin-slow-360"> <div className={`absolute -inset-2 bg-gradient-to-r ${getRarityGradient(itemDef.rarity)} opacity-50 rounded-full blur-2xl`}></div> </div> <div className={`relative bg-gradient-to-b ${getRarityGradient(itemDef.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(itemDef.rarity)} text-center flex flex-col items-center gap-4`} style={shadowStyle}> <h2 className="text-2xl font-black tracking-widest uppercase text-white title-glow">Chế Tạo Thành Công</h2> <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}> <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" /> </div> <div className="flex flex-col"> <span className={`text-2xl font-bold ${rarityTextColor}`}>{itemDef.name}</span> <span className="font-semibold text-slate-300">{itemDef.rarity}</span> </div> <p className="text-sm text-slate-400">{itemDef.description}</p> <button onClick={onClose} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"> Tuyệt vời! </button> </div> </div> </div> );
});

// --- FORGE MODAL (Hợp nhất/Rèn) ---
interface ForgeResult { level: number; refundGold: number; }
interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: ForgeResult; 
}

const calculateForgeResult = (itemsToForge: OwnedItem[], definition: ItemDefinition): ForgeResult => {
    if (itemsToForge.length < 3) return { level: 1, refundGold: 0 };
    const totalInvestedGold = itemsToForge.reduce((total, item) => total + getTotalUpgradeCost(definition, item.level), 0);
    let finalLevel = 1, remainingGold = totalInvestedGold;
    while (true) {
        const costForNextLevel = getUpgradeCost(definition, finalLevel);
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gradient-to-br from-gray-900 to-slate-900 p-5 rounded-xl border-2 border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col">
                <div className="flex-shrink-0 border-b border-slate-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <ForgeIcon className="w-7 h-7 text-purple-400" />
                            <h3 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Rèn Trang Bị</h3>
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
                                <button onClick={() => onForge(group)} disabled={isProcessing} title="Rèn" className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm h-8 px-4 rounded-md shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">Rèn</button>
                            </div>
                        ))
                    ) : ( <div className="flex items-center justify-center h-full text-slate-500 text-center py-10"><p>Không có trang bị nào có thể rèn.</p></div> )}
                </div>
            </div>
        </div>
    );
});


// --- COMPONENT CHÍNH ---
interface EquipmentScreenProps {
    onClose: () => void;
    gold: number;
    ancientBooks: number;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    onInventoryUpdate: (updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; booksChange: number; }) => Promise<void>;
}

export default function EquipmentScreen({ onClose, gold, ancientBooks, ownedItems, equippedItems, onInventoryUpdate }: EquipmentScreenProps) {
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [newlyCraftedItem, setNewlyCraftedItem] = useState<OwnedItem | null>(null);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const MAX_ITEMS_IN_STORAGE = 50;

    const equippedItemsMap = useMemo(() => {
        const map: { [key in EquipmentSlotType]: OwnedItem | null } = { weapon: null, armor: null, accessory: null };
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

                if (!itemDefA) return 1;
                if (!itemDefB) return -1;

                const rarityIndexA = RARITY_ORDER.indexOf(itemDefA.rarity);
                const rarityIndexB = RARITY_ORDER.indexOf(itemDefB.rarity);
                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                if (a.level !== b.level) return b.level - a.level;
                return itemDefA.name.localeCompare(itemDefB.name);
            });
    }, [ownedItems, equippedItems]);

    const showMessage = useCallback((text: string) => {
        setMessage(text); setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);
    
    const handleEquipItem = useCallback(async (itemToEquip: OwnedItem) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToEquip.itemId);
        if (!itemDef || !EQUIPMENT_SLOT_TYPES.includes(itemDef.type as any)) {
            showMessage("Vật phẩm này không thể trang bị."); return;
        }
        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] === itemToEquip.id) { showMessage("Trang bị đã được mặc."); return; }
        
        setIsProcessing(true);
        const newEquipped = { ...equippedItems, [slotType]: itemToEquip.id };
        try {
            await onInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, booksChange: 0 });
            setSelectedItem(null);
        } catch (error: any) { showMessage(`Lỗi: ${error.message || 'Không thể trang bị'}`); } finally { setIsProcessing(false); }
    }, [isProcessing, equippedItems, ownedItems, onInventoryUpdate, showMessage]);

    const handleUnequipItem = useCallback(async (itemToUnequip: OwnedItem) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToUnequip.itemId);
        if (!itemDef) return;

        const slotType = itemDef.type as EquipmentSlotType;
        if (equippedItems[slotType] !== itemToUnequip.id) { showMessage("Lỗi: Không tìm thấy trang bị."); return; }
        
        setIsProcessing(true);
        const newEquipped = { ...equippedItems, [slotType]: null };
        try {
            await onInventoryUpdate({ newOwned: ownedItems, newEquipped, goldChange: 0, booksChange: 0 });
            setSelectedItem(null);
        } catch (error: any) { showMessage(`Lỗi: ${error.message || 'Không thể tháo'}`); } finally { setIsProcessing(false); }
    }, [isProcessing, equippedItems, ownedItems, onInventoryUpdate, showMessage]);
  
    const handleCraftItem = useCallback(async () => {
        if (isProcessing) return;
        if (ancientBooks < CRAFTING_COST) { 
            showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`); 
            return; 
        }
        if (ownedItems.length >= MAX_ITEMS_IN_STORAGE) { 
            showMessage(`Kho chứa đã đầy.`); 
            return; 
        }
        
        setIsProcessing(true);

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
            
            await onInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: 0, booksChange: -CRAFTING_COST });
            setNewlyCraftedItem(newOwnedItem);

        } catch(error: any) { 
            showMessage(`Lỗi: ${error.message || 'Chế tạo thất bại'}`); 
        } finally { 
            setIsProcessing(false); 
        }
    }, [isProcessing, ancientBooks, ownedItems, equippedItems, onInventoryUpdate, showMessage]);

    const handleDismantleItem = useCallback(async (itemToDismantle: OwnedItem) => {
        if (isProcessing) return;
        if (Object.values(equippedItems).includes(itemToDismantle.id)) { showMessage("Không thể phân rã trang bị đang mặc."); return; }
        
        setIsProcessing(true);
        const itemDef = getItemDefinition(itemToDismantle.itemId)!;
        const goldToReturn = getTotalUpgradeCost(itemDef, itemToDismantle.level);
        const newOwnedList = ownedItems.filter(s => s.id !== itemToDismantle.id);
        
        try {
            await onInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: goldToReturn, booksChange: DISMANTLE_RETURN_BOOKS });
            setSelectedItem(null);
            let dismantleMsg = `Đã phân rã ${itemDef.name}, nhận lại ${DISMANTLE_RETURN_BOOKS} Sách Cổ.`;
            if (goldToReturn > 0) dismantleMsg += ` Hoàn lại ${goldToReturn.toLocaleString()} vàng.`;
            showMessage(dismantleMsg);
        } catch(error: any) { showMessage(`Lỗi: ${error.message || 'Phân rã thất bại'}`); } finally { setIsProcessing(false); }
    }, [isProcessing, equippedItems, ownedItems, onInventoryUpdate, showMessage]);

    const handleUpgradeItem = useCallback(async (itemToUpgrade: OwnedItem) => {
        if (isProcessing) return;
        const itemDef = getItemDefinition(itemToUpgrade.itemId)!;
        
        const cost = getUpgradeCost(itemDef, itemToUpgrade.level);
        if (gold < cost) { showMessage(`Không đủ vàng. Cần ${cost.toLocaleString()}.`); return; }
        
        setIsProcessing(true);
        const newStats = { ...itemToUpgrade.stats };
        for (const key in newStats) {
            if (typeof newStats[key] === 'number') {
                const increase = Math.max(1, Math.round(newStats[key] * 0.05) + Math.floor(itemToUpgrade.level / 10));
                newStats[key] = newStats[key] + increase;
            }
        }
        const updatedItem = { 
            ...itemToUpgrade, 
            level: itemToUpgrade.level + 1,
            stats: newStats
        };

        const newOwnedList = ownedItems.map(s => s.id === itemToUpgrade.id ? updatedItem : s);
        try {
            await onInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: -cost, booksChange: 0 });
            setSelectedItem(updatedItem);
        } catch(error: any) { showMessage(`Lỗi: ${error.message || 'Nâng cấp thất bại'}`); } finally { setIsProcessing(false); }
    }, [isProcessing, gold, ownedItems, equippedItems, onInventoryUpdate, showMessage]);

    const handleForgeItems = useCallback(async (group: ForgeGroup) => {
        if (isProcessing || group.items.length < 3 || !group.nextRank) { showMessage("Không đủ điều kiện để rèn."); return; }
        
        setIsProcessing(true);
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
            
            await onInventoryUpdate({ newOwned: newOwnedList, newEquipped: equippedItems, goldChange: refundGold, booksChange: 0 });
            
            let successMsg = `Rèn thành công ${upgradedItemDef.name} [${group.nextRank}] - Đạt Lv. ${finalLevel}!`;
            if (refundGold > 0) successMsg += ` Hoàn lại ${refundGold.toLocaleString()} vàng.`;
            showMessage(successMsg);
            setIsForgeModalOpen(false);
        } catch (error: any) { 
            showMessage(`Lỗi: ${error.message || 'Rèn thất bại'}`); 
        } finally { 
            setIsProcessing(false); 
        }
    }, [isProcessing, ownedItems, equippedItems, onInventoryUpdate, showMessage]);

    const handleSelectSlot = useCallback((slotType: EquipmentSlotType) => {
        const item = equippedItemsMap[slotType];
        if (item) setSelectedItem(item);
    }, [equippedItemsMap]);
    
    const handleSelectItem = useCallback((item: OwnedItem) => setSelectedItem(item), []);
    const handleCloseDetailModal = useCallback(() => setSelectedItem(null), []);
    const handleCloseCraftSuccessModal = useCallback(() => setNewlyCraftedItem(null), []);
    const handleCloseForgeModal = useCallback(() => setIsForgeModalOpen(false), []);
    const handleOpenForgeModal = useCallback(() => setIsForgeModalOpen(true), []);

    return (
        <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
            <style>{`.title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
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
                            <AncientBookIcon className="w-10 h-10" />
                            <div className="flex items-baseline gap-1"><span className="text-xl font-bold text-white">{ancientBooks}</span><span className="text-base text-slate-400">/ {CRAFTING_COST}</span></div>
                        </div>
                        <button onClick={handleCraftItem} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" disabled={ancientBooks < CRAFTING_COST || isProcessing}>Chế Tạo</button>
                    </section>
                    <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Kho Chứa</h2>
                                <span className="text-sm font-semibold text-slate-300">{ownedItems.length}<span className="text-xs text-slate-500"> / {MAX_ITEMS_IN_STORAGE}</span></span>
                            </div>
                            <button onClick={handleOpenForgeModal} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}><ForgeIcon className="w-4 h-4" />Rèn</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto hide-scrollbar">
                            {unequippedItemsSorted.length > 0 ? (
                                unequippedItemsSorted.map(ownedItem => (
                                    <ItemCard key={ownedItem.id} ownedItem={ownedItem} onClick={handleSelectItem} isEquipped={false} isProcessing={isProcessing} />
                                ))
                            ) : ( <div className="col-span-full flex items-center justify-center h-full text-slate-500"><p>Kho chứa trống.</p></div> )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

// --- END OF FILE equipment.tsx (FIXED) ---
