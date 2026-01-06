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
import { EquipmentProvider, useEquipment, ENHANCEMENT_CONFIG, type EnhancementStoneType } from './equipment-context.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import EquipmentScreenSkeleton from './equipment-loading.tsx';
import TotalStatsModal from './total-stats-modal.tsx';
import ItemRankBorder from './item-rank-border.tsx';
import CraftingEffectCanvas from './crafting-effect.tsx'; 

// --- ĐỊNH NGHĨA INTERFACES ---

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

// --- UTILITY FUNCTIONS (MÀU SẮC & PHÂN CẤP) ---

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

// --- ICONS GIAO DIỆN ---

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

// --- COMPONENT HIỆU ỨNG NÂNG CẤP BAY SỐ (UPGRADE STAT TOAST) ---

const UpgradeStatToast = ({ isVisible, icon, bonus, colorClasses }: { isVisible: boolean, icon: JSX.Element, bonus: number, colorClasses: { border: string, text: string } }) => {
    if (!isVisible) return null;
    return (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[120] pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full shadow-2xl bg-slate-900/95 border-2 ${colorClasses.border} animate-float-up`}>
            <div className="w-5 h-5">{icon}</div>
            <span className={`text-base font-black ${colorClasses.text}`}>+{bonus.toLocaleString()}</span>
        </div>
    );
};

// --- COMPONENT CON TRONG MÀN HÌNH ---

const Header = memo(({ gold, onClose }: { gold: number; onClose: () => void; }) => {
    const animatedGold = useAnimateValue(gold);
    return (
        <header className="flex-shrink-0 w-full bg-slate-900/90 border-b-2 border-slate-800/50 z-30">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300 uppercase tracking-tighter">Trang Chính</span>
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

    return (
        <div 
            className={`relative ${sizeClasses} rounded-xl transition-all duration-300 group ${interactivity} active:scale-95`}
            onClick={!isProcessing ? onClick : undefined}
        >
            {ownedItem && itemDef ? (
                <ItemRankBorder rank={itemDef.rarity} className="w-full h-full shadow-lg shadow-black/50">
                    <img src={itemDef.icon} alt={itemDef.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-all duration-300 group-hover:scale-110 relative z-10 drop-shadow-md" />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold bg-black/80 text-white rounded-md border border-slate-600 z-20 shadow-sm">Lv.{ownedItem.level}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl pointer-events-none z-0" />
                </ItemRankBorder>
            ) : (
                <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center text-slate-600 hover:border-slate-500 transition-colors">
                     <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">{slotType}</span>
                </div>
            )}
        </div>
    );
});

const InventorySlot = memo(({ ownedItem, onClick, isProcessing }: { ownedItem: OwnedItem; onClick: (item: OwnedItem) => void; isProcessing: boolean; }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;
    
    return (
        <div 
            className={`relative aspect-square rounded-lg border-2 bg-slate-900/80 ${getRarityColor(itemDef.rarity)} flex items-center justify-center group transition-all duration-200 ${isProcessing ? 'cursor-wait' : 'cursor-pointer hover:scale-105 hover:shadow-xl'}`} 
            onClick={!isProcessing ? () => onClick(ownedItem) : undefined}
        >
            <img src={itemDef.icon} alt={itemDef.name} className="w-3/4 h-3/4 object-contain transition-transform group-hover:rotate-6" />
            <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">Lv.{ownedItem.level}</span>
        </div>
    );
});

// --- PHÒNG CƯỜNG HÓA CHUYÊN NGHIỆP (ENHANCEMENT MODAL) ---

const EnhancementModal = memo(() => {
    const { 
        selectedItem: item, 
        isEnhanceModalOpen, 
        handleCloseEnhanceModal, 
        handleEnhanceItem,
        gold,
        enhancementStones,
        isProcessing
    } = useEquipment();

    const [localProcessing, setLocalProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
    const [toastInfo, setToastInfo] = useState<{isVisible: boolean, icon: JSX.Element, bonus: number, colorClasses: any} | null>(null);

    if (!isEnhanceModalOpen || !item) return null;
    const itemDef = getItemDefinition(item.itemId)!;

    const onAttemptEnhance = async (type: EnhancementStoneType) => {
        if (localProcessing || isProcessing) return;
        setLocalProcessing(true);
        setStatus('idle');
        
        // Lưu lại stats trước khi nâng để so sánh
        const oldStats = { ...item.stats };
        
        const result = await handleEnhanceItem(item, type);
        
        if (result.success) {
            setStatus('success');
            // Tìm xem chỉ số nào vừa được tăng
            const newStats = item.stats; 
            for (const key in newStats) {
                if (newStats[key] > (oldStats[key] || 0)) {
                    const config = STAT_CONFIG[key.toLowerCase()];
                    setToastInfo({
                        isVisible: true,
                        icon: config.Icon({ className: "w-full h-full" }),
                        bonus: newStats[key] - (oldStats[key] || 0),
                        colorClasses: { border: config.color.replace('text-', 'border-'), text: config.color }
                    });
                    break;
                }
            }
        } else {
            setStatus('fail');
        }
        
        setLocalProcessing(false);
        setTimeout(() => {
            setStatus('idle');
            setToastInfo(null);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={handleCloseEnhanceModal} />
            
            <div className={`relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row transition-all duration-300 ${status === 'fail' ? 'animate-shake' : ''}`}>
                
                {/* HIỆU ỨNG THÀNH CÔNG LỚN */}
                {status === 'success' && (
                    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                        <div className="absolute inset-0 animate-pulse bg-cyan-500/10" />
                        <div className="text-center animate-bounce">
                            <h2 className="text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(34,211,238,1)]">SUCCESS</h2>
                            <p className="text-cyan-400 font-bold tracking-[0.5em] uppercase mt-2">Level Upgraded</p>
                        </div>
                    </div>
                )}

                {/* CỘT TRÁI: HIỂN THỊ TRANG BỊ & CHỈ SỐ */}
                <div className={`w-full md:w-5/12 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-b ${getRarityGradient(itemDef.rarity)} relative`}>
                    
                    {/* Toast bay số nằm đè lên trang bị */}
                    {toastInfo && <UpgradeStatToast {...toastInfo} />}

                    <div className="relative mb-8">
                         <div className={`absolute inset-0 blur-3xl rounded-full opacity-30 ${getRarityColor(itemDef.rarity).replace('border-', 'bg-')}`} />
                         <ItemRankBorder rank={itemDef.rarity} className="w-44 h-44 scale-110 relative z-10">
                            <img src={itemDef.icon} className="w-32 h-32 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" alt="" />
                        </ItemRankBorder>
                    </div>
                    
                    <h3 className={`text-3xl font-black mb-2 italic ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-black/50 px-4 py-1.5 rounded-xl text-slate-400 font-bold border border-white/5 shadow-inner italic">Lv.{item.level}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M13 5l7 7-7 7" /></svg>
                        <div className="bg-cyan-500/20 px-4 py-1.5 rounded-xl text-cyan-400 font-black border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] italic">Lv.{item.level + 1}</div>
                    </div>

                    <div className="w-full space-y-2.5">
                        {Object.entries(item.stats).map(([key, val]) => {
                            const config = STAT_CONFIG[key.toLowerCase()];
                            return (
                                <div key={key} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center ${config?.color || 'text-white'}`}>
                                            {config?.Icon ? <config.Icon className="w-5 h-5" /> : '•'}
                                        </div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{config?.name || key}</span>
                                    </div>
                                    <span className="text-white font-mono font-black text-xl italic">{val.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CỘT PHẢI: CHỌN ĐÁ NÂNG CẤP */}
                <div className="w-full md:w-7/12 p-10 bg-slate-900 flex flex-col relative">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Forge Chamber</h2>
                            <div className="h-1 w-20 bg-cyan-500 mt-2 rounded-full" />
                        </div>
                        <button onClick={handleCloseEnhanceModal} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-lg">✕</button>
                    </div>

                    <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {(['basic', 'medium', 'advanced'] as const).map((type) => {
                            const config = ENHANCEMENT_CONFIG[type];
                            const stoneCount = enhancementStones[type] || 0;
                            const canAfford = gold >= config.goldCost && stoneCount > 0;

                            return (
                                <button
                                    key={type}
                                    onClick={() => onAttemptEnhance(type)}
                                    disabled={localProcessing || !canAfford || status !== 'idle'}
                                    className={`w-full group relative flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                                        canAfford 
                                        ? 'bg-slate-800/40 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:-translate-y-1' 
                                        : 'bg-slate-900 border-slate-800 opacity-40 grayscale cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-black/50 border-2 ${config.borderColor} text-4xl shadow-inner group-hover:scale-110 transition-transform`}>
                                            {config.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className={`text-xl font-black italic ${config.color} leading-none mb-1`}>{config.name}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Chance</span>
                                                <div className="h-4 w-24 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                                                    <div className={`h-full bg-gradient-to-r from-cyan-600 to-blue-400`} style={{ width: `${config.chance * 100}%` }} />
                                                </div>
                                                <span className="text-xs font-black text-white italic">{(config.chance * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="flex items-center gap-2 text-yellow-400 font-black text-xl italic drop-shadow-md">
                                            <span>{config.goldCost.toLocaleString()}</span>
                                            <GoldIcon className="w-6 h-6" />
                                        </div>
                                        <div className={`text-xs font-bold px-3 py-1 rounded-lg border ${stoneCount > 0 ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-red-900/20 text-red-500 border-red-900/50'}`}>
                                            Owned: {stoneCount}
                                        </div>
                                    </div>

                                    {localProcessing && (
                                        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center rounded-[1.5rem] z-20">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Forging...</span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-500 italic opacity-60">High-level gear requires Advanced Stones for guaranteed results.</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- MODAL CHI TIẾT TRANG BỊ (ITEM DETAIL) ---

const ItemDetailModal = memo(({ ownedItem, onClose, onEquip, onUnequip, onDismantle, isEquipped, isProcessing }: { ownedItem: OwnedItem, onClose: () => void, onEquip: (item: OwnedItem) => void, onUnequip: (item: OwnedItem) => void, onDismantle: (item: OwnedItem) => void, isEquipped: boolean, isProcessing: boolean }) => {
    const { handleOpenEnhanceModal } = useEquipment();
    const itemDef = getItemDefinition(ownedItem.itemId);

    if (!itemDef) return null;
    
    const commonBtnClasses = "flex-1 py-3.5 rounded-2xl font-black text-sm tracking-tighter uppercase transition-all duration-200 disabled:opacity-50 shadow-lg active:scale-95";

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-8 rounded-[2rem] border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md z-50`}>
                
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className={`text-3xl font-black italic tracking-tighter ${getRarityTextColor(itemDef.rarity)} uppercase leading-none mb-2`}>{itemDef.name}</h3>
                        <div className="flex gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-black/40 border ${getRarityColor(itemDef.rarity)} ${getRarityTextColor(itemDef.rarity)} italic`}>{itemDef.rarity} RANK</span>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white/10 text-white italic">LV.{ownedItem.level}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="flex flex-col items-center gap-8 mb-10">
                    <div className="relative group">
                        <div className={`absolute inset-0 blur-2xl opacity-20 ${getRarityColor(itemDef.rarity).replace('border-', 'bg-')}`} />
                        <div className="w-36 h-36 bg-black/40 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner relative z-10">
                            <img src={itemDef.icon} className="w-28 h-28 object-contain" alt="" />
                        </div>
                    </div>
                    
                    <div className="w-full space-y-3">
                        {Object.entries(ownedItem.stats).map(([key, value]) => {
                            const config = STAT_CONFIG[key.toLowerCase()];
                            return (
                                <div key={key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:bg-black/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 flex items-center justify-center opacity-70 ${config?.color || ''}`}>
                                            {config?.Icon && <config.Icon className="w-full h-full" />}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{config?.name || key}</span>
                                    </div>
                                    <span className="text-white font-mono font-black text-xl italic">{value.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    <p className="text-slate-400 text-xs text-center italic opacity-60 px-4">"{itemDef.description}"</p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => isEquipped ? onUnequip(ownedItem) : onEquip(ownedItem)} 
                            disabled={isProcessing}
                            className={`${commonBtnClasses} ${isEquipped ? 'bg-slate-700 text-slate-300' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-900/20'}`}
                        >
                            {isEquipped ? 'Unequip' : 'Equip Item'}
                        </button>
                        
                        <button 
                            onClick={() => { onClose(); handleOpenEnhanceModal(ownedItem); }} 
                            disabled={isProcessing}
                            className={`${commonBtnClasses} bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-900/20`}
                        >
                            Enhance
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => onDismantle(ownedItem)} 
                        disabled={isEquipped || isProcessing}
                        className={`${commonBtnClasses} bg-slate-900/50 text-slate-500 hover:text-red-400 hover:bg-red-950/20 border border-slate-800 transition-all`}
                    >
                        Recycle into Pieces
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- MODAL CHẾ TẠO THÀNH CÔNG (CRAFT SUCCESS) ---

const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;

    return ( 
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> 
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} /> 
            <div className="relative w-full max-w-sm animate-in zoom-in duration-300"> 
                <div className={`relative bg-gradient-to-b ${getRarityGradient(itemDef.rarity)} p-10 rounded-[2.5rem] border-2 ${getRarityColor(itemDef.rarity)} text-center flex flex-col items-center gap-8 shadow-2xl`}> 
                    <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400 animate-pulse">New Gear Discovered</h2> 
                    
                    <div className="relative">
                        <div className={`absolute inset-0 blur-3xl rounded-full opacity-40 scale-150 ${getRarityColor(itemDef.rarity).replace('border-', 'bg-')}`} />
                        <div className={`w-40 h-40 flex items-center justify-center bg-black/40 rounded-[2rem] border-2 ${getRarityColor(itemDef.rarity)} relative z-10 shadow-2xl`}>
                            <img src={itemDef.icon} className="w-28 h-28 object-contain animate-float" alt="" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{itemDef.rarity} Grade • Level 1</p>
                    </div>

                    <button onClick={onClose} className="w-full py-4 bg-white text-black font-black uppercase tracking-tighter rounded-2xl hover:bg-cyan-400 transition-colors shadow-lg active:scale-95">Collect Item</button>
                </div> 
            </div> 
        </div> 
    );
});

// --- MODAL HỢP NHẤT (FORGE / FUSION) ---

const ForgeModal = memo(({ isOpen, onClose, ownedItems, onForge, isProcessing, equippedItemIds }: { isOpen: boolean; onClose: () => void; ownedItems: OwnedItem[]; onForge: (group: any) => void; isProcessing: boolean; equippedItemIds: (string | null)[] }) => {
    const forgeableGroups = useMemo(() => {
        if (!isOpen) return [];
        const unequippedItems = ownedItems.filter(s => !equippedItemIds.includes(s.id));
        const groups: Record<string, OwnedItem[]> = {};
        for (const item of unequippedItems) {
            const def = getItemDefinition(item.itemId);
            if (!def || !def.baseId) continue;
            const key = `${def.baseId}-${def.rarity}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        }

        return Object.values(groups)
            .filter(g => g.length >= 3)
            .map(g => {
                const def = getItemDefinition(g[0].itemId)!;
                return { 
                    blueprint: getBlueprintByName(def.name)!, 
                    rarity: def.rarity, 
                    items: [...g].sort((a, b) => b.level - a.level), 
                    nextRank: getNextRank(def.rarity) 
                };
            })
            .filter(g => g.nextRank !== null);
    }, [isOpen, ownedItems, equippedItemIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black uppercase text-purple-400 italic tracking-tighter flex items-center gap-3">
                        <MergeIcon className="w-7 h-7" /> Fusion Core
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {forgeableGroups.length > 0 ? forgeableGroups.map(group => (
                        <div key={`${group.blueprint.baseId}-${group.rarity}`} className="bg-slate-800/30 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 bg-black/40 rounded-xl border-2 ${getRarityColor(group.rarity)} flex items-center justify-center relative shadow-inner`}>
                                    <img src={group.blueprint.icon} className="w-12 h-12 object-contain" />
                                    <span className="absolute -top-2 -right-2 bg-purple-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-purple-400 shadow-lg">3/{group.items.length}</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M13 5l7 7-7 7" /></svg>
                                <div className={`w-16 h-16 bg-black/40 rounded-xl border-2 ${getRarityColor(group.nextRank!)} flex items-center justify-center shadow-lg`}>
                                    <img src={group.blueprint.icon} className="w-12 h-12 object-contain" />
                                </div>
                            </div>
                            <button 
                                onClick={() => onForge(group)} 
                                disabled={isProcessing}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2.5 px-5 rounded-xl text-xs uppercase italic transition-all active:scale-95 disabled:opacity-30"
                            >
                                Merge
                            </button>
                        </div>
                    )) : (
                        <div className="h-60 flex flex-col items-center justify-center text-slate-600 opacity-40">
                             <div className="w-12 h-12 border-4 border-dashed border-slate-600 rounded-full mb-4" />
                             <p className="text-xs font-bold uppercase tracking-widest italic">No Items to Fuse</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// --- MÀN HÌNH CHÍNH (MAIN SCREEN CONTENT) ---

function EquipmentScreenContent({ onClose }: { onClose: (data: EquipmentScreenExitData) => void }) {
    const {
        gold, equipmentPieces, ownedItems, equippedItems, selectedItem, newlyCraftedItem,
        isForgeModalOpen, isStatsModalOpen, isProcessing, dismantleSuccessToast,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue, isLoading,
        handleEquipItem, handleUnequipItem, handleCraftItem, handleDismantleItem, handleForgeItems,
        handleSelectItem, handleSelectSlot, handleCloseDetailModal, handleCloseCraftSuccessModal,
        handleOpenForgeModal, handleCloseForgeModal, handleOpenStatsModal, handleCloseStatsModal,
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
        <div className="main-bg relative w-full h-screen bg-[#020617] font-sans text-white overflow-hidden flex flex-col">
            
            {/* CANVAS HIỆU ỨNG CRAFT */}
            <CraftingEffectCanvas isActive={isCraftingAnimation} />
            
            {/* THÔNG BÁO POPUP */}
            <RateLimitToast show={dismantleSuccessToast.show} message={dismantleSuccessToast.message} showIcon={false} />
            
            {/* CÁC MODAL */}
            {!isCraftingAnimation && selectedItem && !useEquipment().isEnhanceModalOpen && (
                <ItemDetailModal 
                    ownedItem={selectedItem} 
                    onClose={handleCloseDetailModal} 
                    onEquip={handleEquipItem} 
                    onUnequip={handleUnequipItem} 
                    onDismantle={handleDismantleItem} 
                    isEquipped={Object.values(equippedItems).includes(selectedItem.id)} 
                    isProcessing={isProcessing}
                />
            )}
            {!isCraftingAnimation && newlyCraftedItem && <CraftingSuccessModal ownedItem={newlyCraftedItem} onClose={handleCloseCraftSuccessModal} />}
            
            <EnhancementModal />
            <ForgeModal isOpen={isForgeModalOpen} onClose={handleCloseForgeModal} ownedItems={ownedItems} onForge={handleForgeItems} isProcessing={isProcessing} equippedItemIds={Object.values(equippedItems)} />
            <TotalStatsModal isOpen={isStatsModalOpen} onClose={handleCloseStatsModal} equipmentStats={totalEquippedStats} upgradeStats={userStatsValue} />

            {/* TRẠNG THÁI LOADING */}
            <div className={`absolute inset-0 z-[100] ${isLoading ? '' : 'hidden'}`}><EquipmentScreenSkeleton /></div>
            
            {/* GIAO DIỆN CHÍNH */}
            <div className={`flex-1 flex flex-col w-full z-10 ${isLoading ? 'hidden' : ''}`}>
                <Header gold={gold} onClose={handleClose} />
                
                <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col p-4 sm:p-6 overflow-hidden">
                    
                    {/* KHU VỰC TRANG BỊ ĐANG MẶC */}
                    <section className="flex flex-row justify-center gap-5 py-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        {EQUIPMENT_SLOT_TYPES.map(slotType => (
                            <EquipmentSlot key={slotType} slotType={slotType} ownedItem={equippedItemsMap[slotType]} onClick={() => handleSelectSlot(slotType)} isProcessing={isProcessing} />
                        ))}
                    </section>

                    {/* THANH CRAFT / CHẾ TẠO */}
                    <section className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/5 p-5 flex justify-between items-center mb-6 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                <EquipmentPieceIcon className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none mb-1">Cores Available</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-white italic leading-none">{equipmentPieces.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-slate-600">/ {CRAFTING_COST}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onCraftClick} 
                            disabled={equipmentPieces < CRAFTING_COST || isProcessing || ownedItems.length >= MAX_ITEMS_IN_STORAGE}
                            className="bg-white text-black font-black uppercase italic tracking-tighter py-4 px-10 rounded-2xl hover:bg-cyan-400 transition-all disabled:opacity-20 active:scale-95 shadow-xl disabled:active:scale-100"
                        >
                            Forge Gear
                        </button>
                    </section>
                    
                    {/* KHO LƯU TRỮ (STORAGE) */}
                    <section className="flex-1 min-h-0 bg-slate-900/30 backdrop-blur-sm rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-inner">
                        <div className="flex justify-between items-center mb-8 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Gear Vault</h2>
                                <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-white/5">{unequippedItemsSorted.length} / {MAX_ITEMS_IN_STORAGE}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleOpenStatsModal} className="flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-700 uppercase italic tracking-tighter"><StatsIcon className="w-4 h-4" /> Attributes</button>
                                <button onClick={handleOpenForgeModal} className="flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all uppercase italic tracking-tighter"><MergeIcon className="w-4 h-4" /> Fusion</button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -m-2 p-2">
                            {unequippedItemsSorted.length > 0 ? (
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                    {unequippedItemsSorted.map((item) => (
                                        <InventorySlot key={item.id} ownedItem={item} onClick={handleSelectItem} isProcessing={isProcessing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                                    <div className="w-20 h-20 border-4 border-dashed border-slate-700 rounded-full mb-6" />
                                    <p className="text-sm font-black uppercase tracking-[0.3em] italic">Vault Empty</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
            
            {/* CSS ANIMATIONS & SCROLLBAR */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
                
                @keyframes float { 
                    0%, 100% { transform: translateY(0px) rotate(0deg); } 
                    50% { transform: translateY(-12px) rotate(2deg); } 
                }
                .animate-float { animation: float 4s ease-in-out infinite; }

                @keyframes float-up-fade {
                    0% { transform: translate(-50%, 0); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translate(-50%, -60px); opacity: 0; }
                }
                .animate-float-up { animation: float-up-fade 1.5s ease-out forwards; }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
                    20%, 40%, 60%, 80% { transform: translateX(8px); }
                }
                .animate-shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
            `}</style>
        </div>
    );
}

// --- WRAPPER COMPONENT ---

export default function EquipmentScreen({ onClose, userId }: { onClose: (data: EquipmentScreenExitData) => void; userId: string; }) {
    return (
        <EquipmentProvider>
            <EquipmentScreenContent onClose={onClose} />
        </EquipmentProvider>
    );
}
