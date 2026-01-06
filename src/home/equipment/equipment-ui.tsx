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
import CraftingEffectCanvas from './crafting-effect.tsx'; 

// THÊM DÒNG IMPORT NÀY:
import EnhancementModal from './enhancement-modal.tsx';

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

// --- CÁC ICON GIAO DIỆN ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> </svg>);
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className={className} /> );
const StatsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/> </svg>);

// --- COMPONENT CON TRONG TRANG ---

const Header = memo(({ gold, onClose }: { gold: number; onClose: () => void; }) => {
    const animatedGold = useAnimateValue(gold);
    return (
        <header className="flex-shrink-0 w-full bg-slate-900/90 border-b-2 border-slate-800/50">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
                </button>
                <div className="flex items-center gap-4">
                    <CoinDisplay displayedCoins={animatedGold} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
});

const EquipmentSlot = memo(({ slotType, ownedItem, onClick, isProcessing }: { slotType: EquipmentSlotType, ownedItem: OwnedItem | null, onClick: () => void, isProcessing: boolean }) => {
    const itemDef = ownedItem ? getItemDefinition(ownedItem.itemId) : null;
    const sizeClasses = "w-24 h-24 sm:w-28 sm:h-28";

    return (
        <div 
            className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${itemDef ? '' : 'border-2 border-dashed border-slate-700 bg-slate-900/20'}`}
            onClick={!isProcessing ? onClick : undefined}
        >
            {ownedItem && itemDef ? (
                <ItemRankBorder rank={itemDef.rarity} className="w-full h-full shadow-lg">
                    <img src={itemDef.icon} className="w-14 h-14 object-contain z-10 drop-shadow-md" alt={itemDef.name} />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-black bg-black/80 text-white rounded-md border border-slate-600 z-20">Lv.{ownedItem.level}</span>
                </ItemRankBorder>
            ) : (
                <div className="flex flex-col items-center opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-widest">{slotType}</span>
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
            className={`relative aspect-square rounded-xl border-2 ${getRarityColor(itemDef.rarity)} bg-slate-900/80 flex items-center justify-center group cursor-pointer hover:scale-105 transition-all active:scale-95`}
            onClick={() => !isProcessing && onClick(ownedItem)}
        >
            <img src={itemDef.icon} className="w-3/4 h-3/4 object-contain" alt={itemDef.name} />
            <span className="absolute top-1 right-1 px-1 text-[9px] font-black bg-black/70 text-white rounded border border-slate-600">Lv.{ownedItem.level}</span>
        </div>
    );
});

// --- CHI TIẾT VẬT PHẨM (DETAIL MODAL) ---

const ItemDetailModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
    const { 
        handleEquipItem, 
        handleUnequipItem, 
        handleDismantleItem, 
        handleOpenEnhance, // Dùng hàm này để mở lò rèn
        equippedItems, 
        isProcessing 
    } = useEquipment();

    const itemDef = getItemDefinition(ownedItem.itemId)!;
    const isEquipped = Object.values(equippedItems).includes(ownedItem.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-7 rounded-[2.5rem] border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-sm flex flex-col gap-6`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className={`text-2xl font-black ${getRarityTextColor(itemDef.rarity)} uppercase italic`}>{itemDef.name}</h3>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full text-white uppercase">{itemDef.rarity} RANK</span>
                            <span className="text-[10px] font-black bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300 uppercase">LEVEL {ownedItem.level}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="w-36 h-36 bg-black/40 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-t ${getRarityGradient(itemDef.rarity)} opacity-20`} />
                        <img src={itemDef.icon} className="w-24 h-24 object-contain relative z-10" alt={itemDef.name} />
                    </div>
                    
                    <div className="w-full space-y-2">
                        {Object.entries(ownedItem.stats).map(([key, val]) => (
                            <div key={key} className="flex justify-between items-center bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{key}</span>
                                <span className="text-sm font-black text-white">{val.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* NÚT CƯỜNG HOÁ MỚI */}
                    <button 
                        onClick={() => { handleOpenEnhance(ownedItem); onClose(); }}
                        disabled={isProcessing}
                        className="py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black uppercase text-sm tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                        Cường Hoá
                    </button>
                    
                    <button 
                        onClick={() => isEquipped ? handleUnequipItem(ownedItem) : handleEquipItem(ownedItem)}
                        disabled={isProcessing}
                        className={`py-4 rounded-2xl font-black uppercase text-sm tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
                            isEquipped ? 'bg-slate-800 text-slate-400' : 'bg-cyan-600 text-white shadow-cyan-500/20'
                        }`}
                    >
                        {isEquipped ? 'Tháo ra' : 'Trang bị'}
                    </button>
                    
                    <button 
                        onClick={() => handleDismantleItem(ownedItem)}
                        disabled={isEquipped || isProcessing}
                        className="col-span-2 py-3 rounded-2xl bg-red-950/30 text-red-400/60 font-black uppercase text-[10px] tracking-[0.2em] border border-red-900/20 disabled:opacity-20"
                    >
                        Phân rã vật phẩm
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- MÀN HÌNH CHÍNH (CONTENT) ---

function EquipmentScreenContent({ onClose }: { onClose: (data: EquipmentScreenExitData) => void }) {
    const {
        gold, equipmentPieces, ownedItems, equippedItems, selectedItem,
        isForgeModalOpen, isStatsModalOpen, isProcessing,
        equippedItemsMap, unequippedItemsSorted, totalEquippedStats, userStatsValue,
        isLoading, handleCraftItem, handleSelectItem, handleSelectSlot,
        handleCloseDetailModal, handleOpenForgeModal, handleOpenStatsModal, handleCloseStatsModal,
        MAX_ITEMS_IN_STORAGE, CRAFTING_COST, 
        isEnhanceModalOpen // State từ context
    } = useEquipment();

    const [isCraftingAnimation, setIsCraftingAnimation] = useState(false);

    const onCraftClick = useCallback(() => {
        setIsCraftingAnimation(true);
        handleCraftItem().finally(() => {
            // Giữ hiệu ứng canvas trong 3 giây
            setTimeout(() => setIsCraftingAnimation(false), 3000);
        });
    }, [handleCraftItem]);

    if (isLoading) return <EquipmentScreenSkeleton />;

    return (
        <div className="relative w-full h-screen bg-[#020617] text-white flex flex-col overflow-hidden font-sans">
            {/* Hiệu ứng Canvas khi Craft */}
            <CraftingEffectCanvas isActive={isCraftingAnimation} />

            <Header gold={gold} onClose={() => onClose({ gold, equipmentPieces, ownedItems, equippedItems })} />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
                {/* Trang bị đang mặc */}
                <section className="flex justify-center items-center gap-4 sm:gap-8 py-4">
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

                {/* Khu vực Chế tạo */}
                <section className="bg-slate-900/40 border border-slate-800 p-5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                            <EquipmentPieceIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mảnh trang bị</p>
                            <p className="text-2xl font-black text-white">{equipmentPieces} <span className="text-slate-600 text-sm font-bold">/ {CRAFTING_COST}</span></p>
                        </div>
                    </div>
                    <button 
                        onClick={onCraftClick}
                        disabled={equipmentPieces < CRAFTING_COST || isProcessing}
                        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-cyan-900/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        Chế Tạo Mới
                    </button>
                </section>

                {/* Túi đồ */}
                <section className="bg-slate-900/20 rounded-[2.5rem] p-6 sm:p-8 border border-slate-800/50 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Kho Lưu Trữ</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unequippedItemsSorted.length} / {MAX_ITEMS_IN_STORAGE} VẬT PHẨM</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleOpenStatsModal} className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                                <StatsIcon className="w-5 h-5 text-cyan-400" />
                            </button>
                            <button onClick={handleOpenForgeModal} className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                                <MergeIcon className="w-5 h-5 text-purple-400" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {unequippedItemsSorted.length > 0 ? (
                            unequippedItemsSorted.map(item => (
                                <InventorySlot key={item.id} ownedItem={item} onClick={handleSelectItem} isProcessing={isProcessing} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Kho đồ đang trống</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* CÁC POPUP VÀ MODAL */}
            
            {/* 1. Modal Chi tiết vật phẩm */}
            {selectedItem && <ItemDetailModal ownedItem={selectedItem} onClose={handleCloseDetailModal} />}
            
            {/* 2. Popup Cường hoá (Lò rèn) - ĐÃ IMPORT TỪ FILE RIÊNG */}
            {isEnhanceModalOpen && <EnhancementModal />}
            
            {/* 3. Modal Tổng chỉ số */}
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

// --- COMPONENT WRAPPER ---

export default function EquipmentScreen({ onClose, userId }: { onClose: any, userId: string }) {
    return (
        <EquipmentProvider>
            <EquipmentScreenContent onClose={onClose} />
        </EquipmentProvider>
    );
}
