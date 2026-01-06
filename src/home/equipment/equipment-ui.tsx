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
import { EquipmentProvider, useEquipment, calculateSuccessRate } from './equipment-context.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import EquipmentScreenSkeleton from './equipment-loading.tsx';
import TotalStatsModal from './total-stats-modal.tsx';
import ItemRankBorder from './item-rank-border.tsx';
import CraftingEffectCanvas from './crafting-effect.tsx'; 

// --- ĐỊNH NGHĨA TYPES ---

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

// --- CÁC HÀM TIỆN ÍCH HIỂN THỊ ---

const getRarityColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        case 'SR': return 'border-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]';
        case 'S': return 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
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
        case 'SSR': return 'from-red-900/80 to-slate-950';
        case 'SR': return 'from-orange-900/80 to-slate-950';
        case 'S': return 'from-yellow-900/80 to-slate-950';
        case 'A': return 'from-purple-900/80 to-slate-950';
        case 'B': return 'from-blue-900/80 to-slate-950';
        case 'D': return 'from-green-900/80 to-slate-950';
        case 'E': return 'from-gray-800/80 to-slate-950';
        default: return 'from-gray-900 to-slate-950';
    }
};

const getNextRank = (rank: ItemRank): ItemRank | null => {
    const currentIndex = RARITY_ORDER.indexOf(rank);
    if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) return null;
    return RARITY_ORDER[currentIndex + 1];
};

// --- CÁC ICON GIAO DIỆN ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> </svg>);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> );
const StatsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/> </svg>);
const StoneIcon = ({ type, className = '' }: { type: string, className?: string }) => {
    const colors = { basic: 'bg-green-500', intermediate: 'bg-blue-500', advanced: 'bg-purple-600' };
    return <div className={`${colors[type as keyof typeof colors]} ${className} rounded-lg flex items-center justify-center text-white font-black shadow-lg border border-white/20`}>{type[0].toUpperCase()}</div>;
};

// --- COMPONENT LÒ RÈN (ENHANCEMENT MODAL) ---

const EnhancementModal = memo(() => {
    const { 
        itemToEnhance, 
        handleCloseEnhance, 
        handleEnhanceItem, 
        enhancementStones, 
        isProcessing 
    } = useEquipment();

    const [selectedStone, setSelectedStone] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
    const [status, setStatus] = useState<'idle' | 'animating' | 'success' | 'fail'>('idle');
    
    if (!itemToEnhance) return null;
    const itemDef = getItemDefinition(itemToEnhance.itemId)!;
    const rate = calculateSuccessRate(selectedStone, itemToEnhance.level, itemDef.rarity);

    const handleStartEnhance = async () => {
        if (enhancementStones[selectedStone] <= 0 || status === 'animating') return;
        setStatus('animating');
        
        setTimeout(async () => {
            const result = await handleEnhanceItem(itemToEnhance, selectedStone);
            setStatus(result.success ? 'success' : 'fail');
            setTimeout(() => setStatus('idle'), 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={status === 'idle' ? handleCloseEnhance : undefined} />
            
            <div className={`relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all ${status === 'fail' ? 'animate-shake' : ''}`}>
                <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-black text-orange-400 uppercase italic tracking-tighter">Lò Rèn Thần Binh</h2>
                    <button onClick={handleCloseEnhance} disabled={status === 'animating'} className="text-slate-400 hover:text-white text-2xl">✕</button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-around bg-black/40 p-6 rounded-[2rem] border border-white/5 relative">
                        <div className="text-center">
                            <ItemRankBorder rank={itemDef.rarity} className="w-20 h-20 mb-2">
                                <img src={itemDef.icon} className="w-12 h-12 object-contain" />
                            </ItemRankBorder>
                            <div className="text-lg font-black text-white italic">Lv.{itemToEnhance.level}</div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className={`text-2xl font-black transition-all duration-300 ${status === 'success' ? 'text-green-400 scale-125' : status === 'fail' ? 'text-red-500' : 'text-cyan-400'}`}>
                                {status === 'animating' ? 'ĐANG RÈN...' : status === 'success' ? 'THÀNH CÔNG' : status === 'fail' ? 'THẤT BẠI' : `${rate}%`}
                            </div>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full my-3 overflow-hidden border border-slate-700">
                                {status === 'animating' && <div className="h-full bg-cyan-500 animate-progress-fast shadow-[0_0_10px_cyan]" />}
                            </div>
                        </div>

                        <div className="text-center">
                            <ItemRankBorder rank={itemDef.rarity} className={`w-20 h-20 mb-2 ${status === 'animating' ? 'animate-pulse brightness-125' : 'opacity-30 grayscale'}`}>
                                <img src={itemDef.icon} className="w-12 h-12 object-contain" />
                            </ItemRankBorder>
                            <div className="text-lg font-black text-cyan-500 italic">Lv.{itemToEnhance.level + 1}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {(['basic', 'intermediate', 'advanced'] as const).map(type => (
                            <button 
                                key={type} 
                                onClick={() => status === 'idle' && setSelectedStone(type)}
                                disabled={status !== 'idle'}
                                className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-2 ${
                                    selectedStone === type 
                                    ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                                    : 'border-slate-800 opacity-40'
                                }`}
                            >
                                <StoneIcon type={type} className="w-10 h-10" />
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase">{type}</p>
                                    <p className={`text-lg font-black ${enhancementStones[type] > 0 ? 'text-white' : 'text-red-500'}`}>{enhancementStones[type]}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleStartEnhance}
                        disabled={status !== 'idle' || enhancementStones[selectedStone] <= 0}
                        className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-orange-600 via-red-600 to-purple-800 text-white font-black text-xl uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        {status === 'animating' ? 'Đang tôi luyện...' : 'Bắt đầu nâng cấp'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
                .animate-shake { animation: shake 0.1s ease-in-out infinite; }
                @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
                .animate-progress-fast { animation: progress 1.5s linear infinite; }
            `}</style>
        </div>
    );
});

// --- CHI TIẾT VẬT PHẨM ---

const ItemDetailModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const { 
        handleEquipItem, 
        handleUnequipItem, 
        handleDismantleItem, 
        handleOpenEnhance, 
        equippedItems, 
        isProcessing 
    } = useEquipment();

    const itemDef = getItemDefinition(ownedItem.itemId)!;
    const isEquipped = Object.values(equippedItems).includes(ownedItem.id);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-8 rounded-[2.5rem] border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-sm flex flex-col gap-6`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className={`text-2xl font-black ${getRarityTextColor(itemDef.rarity)} uppercase italic tracking-tighter`}>{itemDef.name}</h3>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full text-white uppercase">{itemDef.rarity} RANK</span>
                            <span className="text-[10px] font-black bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300 uppercase italic">LV.{ownedItem.level}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="w-36 h-36 bg-black/40 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner relative">
                        <img src={itemDef.icon} className="w-24 h-24 object-contain relative z-10" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${getRarityGradient(itemDef.rarity)} opacity-10`} />
                    </div>
                    
                    <div className="w-full space-y-2">
                        {Object.entries(ownedItem.stats).map(([key, val]) => (
                            <div key={key} className="flex justify-between items-center bg-black/30 px-4 py-3 rounded-2xl border border-white/5 shadow-sm">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{key}</span>
                                <span className="text-sm font-black text-white">{val.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button 
                        onClick={() => { handleOpenEnhance(ownedItem); onClose(); }}
                        disabled={isProcessing}
                        className="py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                        Nâng Cấp
                    </button>
                    
                    <button 
                        onClick={() => isEquipped ? handleUnequipItem(ownedItem) : handleEquipItem(ownedItem)}
                        disabled={isProcessing}
                        className={`py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all ${
                            isEquipped ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 text-white shadow-cyan-900/40'
                        }`}
                    >
                        {isEquipped ? 'Tháo ra' : 'Trang bị'}
                    </button>
                    
                    <button 
                        onClick={() => handleDismantleItem(ownedItem)}
                        disabled={isEquipped || isProcessing}
                        className="col-span-2 py-3 rounded-2xl bg-red-950/20 text-red-500/40 font-black uppercase text-[9px] tracking-[0.3em] border border-red-900/10 active:bg-red-900/30 transition-colors disabled:opacity-10"
                    >
                        Phân rã trang bị
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- THÔNG BÁO CHẾ TẠO THÀNH CÔNG ---

const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    if (!itemDef) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-lg" onClick={onClose} />
            <div className="relative text-center animate-in zoom-in duration-300">
                <div className="mb-8">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase animate-bounce">Bạn đã nhận được!</h2>
                    <p className="text-cyan-400 font-bold tracking-[0.5em] uppercase text-xs mt-2">Vật phẩm huyền thoại mới</p>
                </div>
                <div className="relative group mb-8">
                   <div className={`absolute -inset-10 bg-gradient-to-r ${getRarityGradient(itemDef.rarity)} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse`} />
                   <ItemRankBorder rank={itemDef.rarity} className="w-48 h-48 mx-auto relative z-10 shadow-2xl">
                        <img src={itemDef.icon} className="w-32 h-32 object-contain" />
                   </ItemRankBorder>
                </div>
                <h3 className={`text-3xl font-black ${getRarityTextColor(itemDef.rarity)} uppercase mb-10`}>{itemDef.name}</h3>
                <button onClick={onClose} className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-110 active:scale-95 transition-all">Xác nhận</button>
            </div>
        </div>
    );
});

// --- POPUP HỢP NHẤT TRANG BỊ (MERGE) ---

const ForgeModal = memo(({ isOpen, onClose, ownedItems, onForge, isProcessing, equippedItemIds }: { isOpen: boolean; onClose: () => void; ownedItems: OwnedItem[]; onForge: any; isProcessing: boolean; equippedItemIds: any[] }) => {
    const forgeableGroups = useMemo(() => {
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
                return { blueprint, rarity: firstItemDef.rarity, items: group, nextRank };
            })
            .filter(g => g.nextRank !== null);
    }, [isOpen, ownedItems, equippedItemIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-black text-purple-400 uppercase italic">Hợp Nhất Trang Bị</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {forgeableGroups.length > 0 ? forgeableGroups.map((group, i) => (
                        <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-3xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <ItemRankBorder rank={group.rarity} className="w-14 h-14">
                                    <img src={group.blueprint.icon} className="w-8 h-8 object-contain" />
                                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">x3</span>
                                </ItemRankBorder>
                                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                                <ItemRankBorder rank={group.nextRank!} className="w-14 h-14">
                                    <img src={group.blueprint.icon} className="w-8 h-8 object-contain" />
                                </ItemRankBorder>
                            </div>
                            <button onClick={() => onForge(group)} disabled={isProcessing} className="px-5 py-2.5 bg-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-30">Merge</button>
                        </div>
                    )) : <p className="text-center text-slate-500 font-bold py-20 uppercase text-[10px] tracking-widest">Không có gì để hợp nhất</p>}
                </div>
            </div>
        </div>
    );
});

// --- MÀN HÌNH CHÍNH (MAIN SCREEN CONTENT) ---

function EquipmentScreenContent({ onClose }: { onClose: (data: EquipmentScreenExitData) => void }) {
    const {
        gold, equipmentPieces, ownedItems, equippedItems, selectedItem, newlyCraftedItem,
        isForgeModalOpen, isStatsModalOpen, isEnhanceModalOpen, isProcessing,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue,
        isLoading, handleCraftItem, handleSelectItem, handleSelectSlot, handleForgeItems,
        handleCloseDetailModal, handleCloseCraftSuccessModal, handleOpenForgeModal, handleCloseForgeModal, handleOpenStatsModal, handleCloseStatsModal,
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST
    } = useEquipment();

    const [isCraftingAnimation, setIsCraftingAnimation] = useState(false);

    const onCraftClick = useCallback(() => {
        setIsCraftingAnimation(true);
        handleCraftItem().finally(() => {
            setTimeout(() => setIsCraftingAnimation(false), 3000);
        });
    }, [handleCraftItem]);

    if (isLoading) return <EquipmentScreenSkeleton />;

    const exitData: EquipmentScreenExitData = { gold, equipmentPieces, ownedItems, equippedItems };

    return (
        <div className="relative w-full h-screen bg-[#020617] text-white flex flex-col overflow-hidden font-sans">
            {/* Canvas hiệu ứng craft */}
            <CraftingEffectCanvas isActive={isCraftingAnimation} />

            <Header gold={gold} onClose={() => onClose(exitData)} />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-10 max-w-5xl mx-auto w-full flex flex-col gap-10 pb-20 scrollbar-hide">
                {/* Trang bị nhân vật */}
                <section className="flex justify-center items-center gap-4 sm:gap-10 py-6">
                    {EQUIPMENT_SLOT_TYPES.map(slot => (
                        <EquipmentSlot 
                            key={slot} 
                            slotType={slot} 
                            ownedItem={equippedItemsMap[slot]} 
                            onClick={() => handleSelectSlot(slot)} 
                            isProcessing={isProcessing} 
                        />
                    ))}
                </section>

                {/* Thanh Chế Tạo & Mảnh vỡ */}
                <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 shadow-inner">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-black/40 rounded-3xl border border-white/5 shadow-xl">
                            <EquipmentPieceIcon className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Resources</p>
                            <p className="text-3xl font-black text-white">{equipmentPieces} <span className="text-slate-600 text-sm font-bold">/ {CRAFTING_COST}</span></p>
                        </div>
                    </div>
                    <button 
                        onClick={onCraftClick}
                        disabled={equipmentPieces < CRAFTING_COST || isProcessing}
                        className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-[0_15px_30px_rgba(8,145,178,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
                    >
                        Chế Tạo
                    </button>
                </section>

                {/* Danh sách vật phẩm */}
                <section className="bg-slate-900/20 rounded-[3rem] p-8 border border-slate-800/50 flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-4">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Inventory</h2>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unequippedItemsSorted.length} / {MAX_ITEMS_IN_STORAGE} SLOTS</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleOpenStatsModal} className="w-14 h-14 bg-slate-800/40 rounded-2xl flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all border border-white/5">
                                <StatsIcon className="w-6 h-6 text-cyan-400" />
                            </button>
                            <button onClick={handleOpenForgeModal} className="w-14 h-14 bg-slate-800/40 rounded-2xl flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all border border-white/5">
                                <MergeIcon className="w-6 h-6 text-purple-400" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                        {unequippedItemsSorted.length > 0 ? (
                            unequippedItemsSorted.map(item => (
                                <InventorySlot key={item.id} ownedItem={item} onClick={handleSelectItem} isProcessing={isProcessing} />
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center opacity-20">
                                <p className="font-black uppercase tracking-[0.5em] text-[10px]">Your storage is empty</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* MODALS & POPUPS */}
            {selectedItem && <ItemDetailModal ownedItem={selectedItem} onClose={handleCloseDetailModal} />}
            {newlyCraftedItem && <CraftingSuccessModal ownedItem={newlyCraftedItem} onClose={handleCloseCraftSuccessModal} />}
            {isEnhanceModalOpen && <EnhancementModal />}
            {isForgeModalOpen && (
                <ForgeModal 
                    isOpen={isForgeModalOpen} 
                    onClose={handleCloseForgeModal} 
                    ownedItems={ownedItems} 
                    onForge={handleForgeItems} 
                    isProcessing={isProcessing} 
                    equippedItemIds={Object.values(equippedItems)} 
                />
            )}
            {isStatsModalOpen && (
                <TotalStatsModal 
                    isOpen={isStatsModalOpen} 
                    onClose={handleCloseStatsModal} 
                    equipmentStats={totalEquippedStats} 
                    upgradeStats={userStatsValue} 
                />
            )}
        </div>
    );
}

// --- MAIN EXPORT COMPONENT ---

export default function EquipmentScreen({ onClose, userId }: { onClose: any, userId: string }) {
    return (
        <EquipmentProvider>
            <EquipmentScreenContent onClose={onClose} />
        </EquipmentProvider>
    );
}
