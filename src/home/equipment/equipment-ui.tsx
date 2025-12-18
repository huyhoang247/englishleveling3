// --- FILE: ui/equipment-ui.tsx ---

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
import { EquipmentProvider, useEquipment } from './equipment-context.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import EquipmentScreenSkeleton from './equipment-loading.tsx';
import TotalStatsModal from './total-stats-modal.tsx';
import ItemRankBorder from './item-rank-border.tsx';
// --- IMPORT COMPONENT HIỆU ỨNG MỚI ---
import CraftingEffectCanvas from './crafting-effect.tsx'; 

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

const getUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
    const rarityMultiplier = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
    const baseCost = 50;
    return Math.floor(baseCost * Math.pow(level, 1.2) * rarityMultiplier[itemDef.rarity]);
};

// --- Các Icon Giao Diện ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.goldIcon} alt="Vàng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> </svg>);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> );
const StatsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/> </svg>);

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

    // Nội dung bên trong ô
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
                    {/* Hiệu ứng nền nhẹ cho item - Không dùng blur */}
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

    // TRƯỜNG HỢP 1: Đã có trang bị -> Sử dụng hiệu ứng Rank mới
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

    // TRƯỜNG HỢP 2: Ô trống -> Sử dụng giao diện cũ (nét đứt)
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

const HpIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statHpIcon} alt="HP Icon" {...props} />;
const AtkIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statAtkIcon} alt="ATK Icon" {...props} />;
const DefIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statDefIcon} alt="DEF Icon" {...props} />;

const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: any) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

const formatStatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
    return `${(num / 1000000000).toFixed(1).replace('.0', '')}B`;
};

const animationStyle = `
  @keyframes float-up-fade-out {
    0% { opacity: 0; transform: translateY(0) scale(0.7); }
    20% { opacity: 1; transform: translateY(-25px) scale(1.1); }
    85% { opacity: 1; transform: translateY(-65px) scale(1); }
    100% { opacity: 0; transform: translateY(-80px) scale(0.8); }
  }
  .animate-float-up { animation: float-up-fade-out 1.5s ease-out forwards; }
`;

interface UpgradeStatToastProps {
  isVisible: boolean;
  icon: JSX.Element;
  bonus: number;
  colorClasses: { border: string; text: string; };
}

const UpgradeStatToast: React.FC<UpgradeStatToastProps> = ({ isVisible, icon, bonus, colorClasses }) => {
  if (!isVisible) return null;
  const formatBonus = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
    return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  };
  return (
    <>
      <style>{animationStyle}</style>
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 -ml-8 z-50 pointer-events-none flex items-center justify-center gap-1 px-2.5 py-1 rounded-full shadow-lg bg-slate-900/90 border ${colorClasses.border} animate-float-up`}>
        <div className="w-4 h-4">{icon}</div>
        <span className={`text-sm font-bold ${colorClasses.text}`}>+{formatBonus(bonus)}</span>
      </div>
    </>
  );
};

// --- UPDATED ITEM DETAIL MODAL WITH 3D BUTTONS ---
const ItemDetailModal = memo(({ ownedItem, onClose, onEquip, onUnequip, onDismantle, onUpgrade, isEquipped, gold, isProcessing }: { ownedItem: OwnedItem, onClose: () => void, onEquip: (item: OwnedItem) => void, onUnequip: (item: OwnedItem) => void, onDismantle: (item: OwnedItem) => void, onUpgrade: (item: OwnedItem, statKey: string, increase: number) => void, isEquipped: boolean, gold: number, isProcessing: boolean }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    const [activeTab, setActiveTab] = useState<'stats' | 'upgrade'>('stats');
    const [toastInfo, setToastInfo] = useState<{ key: number; isVisible: boolean; icon: JSX.Element; bonus: number; colorClasses: { border: string; text: string; } } | null>(null);

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
    
    const handleUpgradeClick = () => {
        const upgradableStats = sortedStats.filter(([_, value]) => typeof value === 'number').map(([key]) => key);
        if (upgradableStats.length === 0) return;

        const statToUpgrade = upgradableStats[Math.floor(Math.random() * upgradableStats.length)];
        const currentValue = ownedItem.stats[statToUpgrade];
        
        const randomPercent = 0.01 + Math.random() * 0.04;
        const increase = Math.max(1, Math.round(currentValue * randomPercent));
        
        onUpgrade(ownedItem, statToUpgrade, increase);

        const config = STAT_CONFIG[statToUpgrade.toLowerCase()];
        if (config) {
            setToastInfo({
                key: Date.now(),
                isVisible: true,
                icon: <config.Icon className="w-full h-full" />,
                bonus: increase,
                colorClasses: { border: config.color.replace('text-', 'border-'), text: config.color.replace('border-','text-') }
            });
            setTimeout(() => {
                setToastInfo(prev => prev ? { ...prev, isVisible: false } : null);
            }, 1400);
        }
    };

    const isUpgradable = !!itemDef.stats && sortedStats.some(([_, value]) => typeof value === 'number');
    const currentUpgradeCost = isUpgradable ? getUpgradeCost(itemDef, ownedItem.level) : 0;
    const canAffordUpgrade = isUpgradable && gold >= currentUpgradeCost;
    const hasStats = sortedStats.length > 0;
    const actionDisabled = isProcessing;
    
    // --- CẤU HÌNH GIAO DIỆN NÚT BẤM 3D ---
    const mainActionText = isEquipped ? 'Gỡ Bỏ' : 'Trang Bị';
    const mainActionHandler = () => isEquipped ? onUnequip(ownedItem) : onEquip(ownedItem);

    // Style cho nút Equip (Xanh dương/Cyan)
    const equipBtnStyle = `
        bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-700
        border-t-2 border-cyan-300 border-x border-blue-600
        shadow-[0_6px_0_#1e3a8a,0_10px_10px_rgba(0,0,0,0.5)]
        active:shadow-[0_0px_0_#1e3a8a] active:translate-y-[6px] active:border-t-blue-700
        group
    `;

    // Style cho nút Unequip (Vàng/Cam)
    const unequipBtnStyle = `
        bg-gradient-to-b from-yellow-300 via-orange-500 to-orange-700
        border-t-2 border-yellow-200 border-x border-orange-600
        shadow-[0_6px_0_#9a3412,0_10px_10px_rgba(0,0,0,0.5)]
        active:shadow-[0_0px_0_#9a3412] active:translate-y-[6px] active:border-t-orange-700
        group
    `;

    // Style cho nút Recycle (Đỏ)
    const recycleBtnStyle = `
        bg-gradient-to-b from-red-400 via-red-600 to-red-800
        border-t-2 border-red-300 border-x border-red-700
        shadow-[0_6px_0_#7f1d1d,0_10px_10px_rgba(0,0,0,0.5)]
        active:shadow-[0_0px_0_#7f1d1d] active:translate-y-[6px] active:border-t-red-900
        group
    `;

    // Style khi bị Disabled
    const disabledBtnStyle = `
        bg-slate-700 border-slate-600 text-slate-500 
        cursor-not-allowed shadow-none translate-y-1 grayscale
    `;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-1 rounded-2xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col overflow-hidden`}>
                
                {/* Inner Content Container */}
                <div className="bg-slate-900/90 rounded-xl w-full h-full flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex-shrink-0 bg-black/40 border-b border-gray-700/50 p-4 relative">
                        {/* Background glow effect behind header */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getRarityGradient(itemDef.rarity)} opacity-50`}></div>
                        
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`text-2xl font-black uppercase italic tracking-wide ${getRarityTextColor(itemDef.rarity)} drop-shadow-md`}>{itemDef.name}</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRarityTextColor(itemDef.rarity)} bg-black/60 border border-current shadow-sm`}>{`${itemDef.rarity} Rank`}</span>
                            <span className="text-[10px] font-bold text-white bg-blue-900/50 px-2 py-0.5 rounded border border-blue-500/30">Level {ownedItem.level}</span>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-4">
                        <div className="flex flex-col items-center gap-5">
                            {/* Item Icon with 3D Pedestal look */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-${getRarityColor(itemDef.rarity).replace('border-', '')}-500/20 blur-xl rounded-full scale-110`}></div>
                                <div className={`relative w-28 h-28 flex items-center justify-center bg-gradient-to-b from-slate-800 to-black rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]`}>
                                    <img src={itemDef.icon} alt={itemDef.name} className="w-20 h-20 object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] z-10" />
                                    {/* Grid pattern overlay */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 rounded-xl"></div>
                                </div>
                            </div>

                            {/* Description Box */}
                            <div className="w-full p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-left shadow-inner">
                                <p className="text-slate-300 text-sm leading-relaxed italic">"{itemDef.description}"</p>
                            </div>
                            
                            {(hasStats || isUpgradable) && (
                                <div className="w-full bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50">
                                    {/* Tab Header */}
                                    <div className="flex p-1 bg-black/40">
                                        <button 
                                            onClick={() => setActiveTab('stats')} 
                                            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === 'stats' ? 'bg-slate-700 text-cyan-300 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Chỉ Số
                                        </button>
                                        {isUpgradable && (
                                            <button 
                                                onClick={() => setActiveTab('upgrade')} 
                                                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wide rounded-lg transition-all ml-1 ${activeTab === 'upgrade' ? 'bg-slate-700 text-purple-300 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                Nâng Cấp
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="p-4 min-h-[160px]">
                                        {activeTab === 'stats' && (
                                            <div className="space-y-2">
                                                {hasStats ? sortedStats.map(([key, value]) => { 
                                                    const config = STAT_CONFIG[key.toLowerCase()]; 
                                                    const baseStat = itemDef.stats?.[key]; 
                                                    let bonus = 0; 
                                                    if (typeof value === 'number' && typeof baseStat === 'number' && itemDef.level === 1) { bonus = value - baseStat; } 
                                                    return (
                                                        <div key={key} className="flex items-center justify-between bg-slate-900/80 p-2 rounded border border-slate-700/50">
                                                            <div className="flex items-center gap-2">
                                                                {config?.Icon && <div className={`p-1 rounded bg-black/50 ${config.color}`}><config.Icon className="w-4 h-4" /></div>}
                                                                <span className="text-xs font-bold text-slate-400 uppercase">{config?.name || key}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-mono font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                                                                {bonus > 0 && <span className="block text-[10px] text-green-400 font-mono">(+{bonus.toLocaleString()})</span>}
                                                            </div>
                                                        </div>
                                                    ); 
                                                }) : (<p className="text-sm text-slate-500 text-center py-4">Không có chỉ số.</p>)}
                                            </div>
                                        )}

                                        {activeTab === 'upgrade' && isUpgradable && (
                                            <div className="flex flex-col items-center justify-between h-full py-1">
                                                <div className="text-center mb-4">
                                                    <p className="text-xs text-slate-400 mb-1">Tỷ lệ thành công 100%</p>
                                                    <p className="text-sm text-purple-300 font-bold">Tăng ngẫu nhiên 1% - 5%</p>
                                                </div>
                                                
                                                <div className="relative w-full flex flex-col items-center">
                                                    <button 
                                                        onClick={handleUpgradeClick} 
                                                        disabled={!canAffordUpgrade || actionDisabled} 
                                                        className={`relative w-full max-w-[200px] py-2 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${!canAffordUpgrade || actionDisabled ? 'bg-slate-700 border-2 border-slate-600 grayscale opacity-70' : 'bg-gradient-to-r from-yellow-600 to-yellow-500 border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)]'}`}
                                                    >
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-[10px] uppercase font-bold text-yellow-100">Chi phí</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <GoldIcon className="w-4 h-4"/> 
                                                                <span className="font-bold text-white text-lg drop-shadow-md">{currentUpgradeCost.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        {/* Shine effect */}
                                                        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
                                                    </button>
                                                    {toastInfo && <UpgradeStatToast key={toastInfo.key} {...toastInfo} />}
                                                    {!canAffordUpgrade && !actionDisabled && <p className="text-xs text-red-400 mt-2 font-bold animate-pulse">Thiếu Vàng!</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* 3D ACTION BUTTONS FOOTER */}
                    <div className="flex-shrink-0 mt-auto bg-black/60 p-4 border-t border-slate-700/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            {/* NÚT CHÍNH (EQUIP / UNEQUIP) */}
                            <button 
                                onClick={mainActionHandler} 
                                disabled={actionDisabled} 
                                className={`flex-1 relative rounded-xl transition-all duration-100 ease-out transform ${actionDisabled ? disabledBtnStyle : (isEquipped ? unequipBtnStyle : equipBtnStyle)}`}
                            >
                                {/* Inner Shine Highlight */}
                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg pointer-events-none" />
                                
                                <div className="relative z-10 flex flex-col items-center justify-center py-3">
                                    <div className="flex items-center gap-2">
                                        {isEquipped ? (
                                            // Icon Gỡ bỏ
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-100 drop-shadow-md group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        ) : (
                                            // Icon Trang bị
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-100 drop-shadow-md group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        <span className="font-black text-lg text-white uppercase tracking-wider drop-shadow-md">{mainActionText}</span>
                                    </div>
                                </div>
                            </button>

                            {/* NÚT RECYCLE (PHÂN GIẢI) */}
                            <button 
                                onClick={() => onDismantle(ownedItem)} 
                                disabled={isEquipped || actionDisabled} 
                                className={`flex-1 relative rounded-xl transition-all duration-100 ease-out transform ${isEquipped || actionDisabled ? disabledBtnStyle : recycleBtnStyle}`}
                            >
                                {/* Inner Shine Highlight */}
                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg pointer-events-none" />
                                
                                <div className="relative z-10 flex flex-col items-center justify-center py-3">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-100 drop-shadow-md group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="font-black text-lg text-white uppercase tracking-wider drop-shadow-md">Phân Giải</span>
                                    </div>
                                </div>
                            </button>
                        </div>
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
            {/* UPDATED: Increased opacity to 80 (darker) */}
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
    const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += getUpgradeCost(itemDef, i);
        }
        return total;
    };
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
            {/* UPDATED: Increased opacity to 80 (darker) */}
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
            <style>{`.title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            {/* --- COMPONENT HIỆU ỨNG CANVAS --- */}
            {/* Truyền isActive={showEffect} để canvas biết khi nào chạy */}
            <CraftingEffectCanvas isActive={showEffect} />
            {/* ---------------------------------- */}

            <RateLimitToast show={dismantleSuccessToast.show} message={dismantleSuccessToast.message} showIcon={false} />
            
            {/* Chỉ hiện modal kết quả khi hiệu ứng crafting đã tắt hẳn để tránh chồng chéo */}
            {!isCraftingAnimation && selectedItem && <ItemDetailModal ownedItem={selectedItem} onClose={handleCloseDetailModal} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onDismantle={handleDismantleItem} onUpgrade={handleUpgradeItem} isEquipped={Object.values(equippedItems).includes(selectedItem.id)} gold={gold} isProcessing={isProcessing}/>}
            
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
                        <button onClick={onCraftClick} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" disabled={equipmentPieces < CRAFTING_COST || isProcessing || ownedItems.length >= MAX_ITEMS_IN_STORAGE}>Craft</button>
                    </section>
                    
                    <section className="w-full p-4 bg-black/40 rounded-xl border border-slate-800 flex flex-col flex-grow min-h-0">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Storage</h2>
                                <span className="text-sm font-semibold text-slate-300">{unequippedItemsSorted.length}<span className="text-xs text-slate-500"> / {MAX_ITEMS_IN_STORAGE}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleOpenStatsModal} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}><StatsIcon className="w-4 h-4" />Stats</button>
                                <button onClick={handleOpenForgeModal} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}><MergeIcon className="w-4 h-4" />Merge</button>
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
