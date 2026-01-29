import React, { useMemo, useEffect, memo } from 'react';
import { 
    getItemDefinition, 
    getBlueprintByName,
    type ItemBlueprint,
    type ItemDefinition, 
    type ItemRank 
} from './item-database.ts';
import { uiAssets } from '../../game-assets.ts';
import { 
    type OwnedItem, 
    getRarityColor, 
    getRarityTextColor, 
    getRarityGradient, 
    getNextRank 
} from './equipment-ui.tsx';

// --- Assets & Icons Definitions ---

const UPGRADE_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/upgrade-equipment.webp";

const CloseIcon = ({ className = '' }: { className?: string }) => ( 
    <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> 
);

const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> 
        <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v4h1.5c1.93 0 3.5 1.57 3.5 3.5S5.43 20 3.5 20H2v-4c0-1.1.9-2 2-2h4v1.5a2.5 2.5 0 0 0 5 0V13h4c1.1 0 2-.9 2 2v4h-1.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5H22v-4c0-1.1-.9-2-2-2z"/> 
    </svg>
);

const HpIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statHpIcon} alt="HP Icon" {...props} />;
const AtkIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statAtkIcon} alt="ATK Icon" {...props} />;
const DefIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statDefIcon} alt="DEF Icon" {...props} />;

const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: any) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

// --- Helper Functions Logic ---

interface ForgeResult { 
    level: number; 
    refundGold: number; 
}

export interface ForgeGroup { 
    blueprint: ItemBlueprint;
    rarity: ItemRank; 
    items: OwnedItem[]; 
    nextRank: ItemRank | null; 
    estimatedResult: ForgeResult; 
}

const calculateForgeResult = (itemsToForge: OwnedItem[], definition: ItemDefinition): ForgeResult => {
    // Helper function tính toán chi phí (Logic giống trong equipment-context)
    const getBaseUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
        const rarityMultiplier: Record<string, number> = { E: 1, D: 1.5, B: 2.5, A: 4, S: 7, SR: 12, SSR: 20 };
        return Math.floor(50 * Math.pow(level, 1.2) * (rarityMultiplier[itemDef.rarity] || 1));
    };

    const getTotalUpgradeCost = (itemDef: ItemDefinition, level: number): number => {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += getBaseUpgradeCost(itemDef, i);
        }
        return total;
    };
    
    if (itemsToForge.length < 3) return { level: 1, refundGold: 0 };
    
    // Tổng vàng đã đầu tư vào các item nguyên liệu
    const totalInvestedGold = itemsToForge.reduce((total, item) => total + getTotalUpgradeCost(definition, item.level), 0);
    
    // Tính level mới dựa trên tổng vàng
    let finalLevel = 1;
    let remainingGold = totalInvestedGold;
    
    while (true) {
        const costForNextLevel = getBaseUpgradeCost(definition, finalLevel);
        if (remainingGold >= costForNextLevel) { 
            remainingGold -= costForNextLevel; 
            finalLevel++; 
        } else { 
            break; 
        }
    }
    
    return { level: finalLevel, refundGold: remainingGold };
};

// --- Components ---

export const ItemDetailModal = memo(({ 
    ownedItem, 
    onClose, 
    onEquip, 
    onUnequip, 
    onDismantle, 
    onOpenUpgrade, 
    isEquipped, 
    isProcessing 
}: { 
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
    
    // Logic sắp xếp Stats: HP -> ATK -> DEF
    const sortedStats = useMemo(() => {
        const entries = Object.entries(ownedItem.stats || {});
        const priority = ['hp', 'atk', 'def'];

        return entries.sort(([keyA], [keyB]) => {
            const indexA = priority.indexOf(keyA.toLowerCase());
            const indexB = priority.indexOf(keyB.toLowerCase());
            
            const rankA = indexA === -1 ? 99 : indexA;
            const rankB = indexB === -1 ? 99 : indexB;
            
            return rankA - rankB;
        });
    }, [ownedItem.stats]);
    
    const isUpgradable = !!itemDef.stats && sortedStats.some(([_, value]) => typeof value === 'number');
    const hasStats = sortedStats.length > 0;
    const actionDisabled = isProcessing;
    
    const commonBtnClasses = "flex-1 py-2.5 rounded-xl font-lilita text-base tracking-wide shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none uppercase";
    
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
                <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(itemDef.rarity)} bg-gray-800/70 border ${getRarityColor(itemDef.rarity)}`}>
                            {`${itemDef.rarity} Rank`}
                        </span>
                        <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">
                            Level {ownedItem.level}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2 pb-2">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div className={`w-32 h-32 flex items-center justify-center bg-[#0f111a]/85 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                                 <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                            </div>
                            
                            {isUpgradable && (
                                <button 
                                    onClick={() => onOpenUpgrade(ownedItem)}
                                    disabled={actionDisabled}
                                    title="Enhance Equipment"
                                    className="absolute top-1/2 -right-16 -translate-y-1/2 w-12 h-12 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                >
                                    <img 
                                        src={UPGRADE_ICON_URL} 
                                        alt="Enhance" 
                                        className="w-full h-full object-contain animate-subtle-bounce" 
                                    />
                                </button>
                            )}
                        </div>
                        
                        {/* Đã xóa phần mô tả trang bị (description) ở đây */}
                        
                        {hasStats && (
                            <div className="w-full space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1 text-left px-1">Stats</h4>
                                
                                {sortedStats.map(([key, value]) => { 
                                    const config = STAT_CONFIG[key.toLowerCase()]; 
                                    const baseStat = itemDef.stats?.[key]; 
                                    let bonus = 0; 
                                    if (typeof value === 'number' && typeof baseStat === 'number' && itemDef.level === 1) { bonus = value - baseStat; } 
                                    
                                    return (
                                        <div key={key} className="flex justify-between items-center bg-[#0f111a]/60 px-4 py-3 rounded-lg border border-slate-700/50 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                {config?.Icon && <config.Icon className="w-6 h-6 drop-shadow-md" />}
                                                <span className="text-base text-slate-300 uppercase font-lilita tracking-wider">{config?.name || key}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-lg font-lilita drop-shadow-sm">
                                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                                </span>
                                                {bonus > 0 && (
                                                    <span className="text-green-400 text-sm font-lilita ml-1">
                                                        (+{bonus.toLocaleString()})
                                                    </span>
                                                )}
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

export const CraftingSuccessModal = memo(({ ownedItem, onClose }: { ownedItem: OwnedItem, onClose: () => void }) => {
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
                        {/* Đã xóa thẻ <hr> và thẻ <p> chứa description ở đây */}
                    </div>

                </div> 
            </div> 
        </div> 
    );
});

export const ForgeModal = memo(({ 
    isOpen, 
    onClose, 
    ownedItems, 
    onForge, 
    isProcessing, 
    equippedItemIds 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    ownedItems: OwnedItem[]; 
    onForge: (group: ForgeGroup) => void; 
    isProcessing: boolean; 
    equippedItemIds: (string | null)[] 
}) => {
    const forgeableGroups = useMemo<ForgeGroup[]>(() => {
        if (!isOpen) return [];
        // Lọc ra các item chưa trang bị
        const unequippedItems = ownedItems.filter(s => !equippedItemIds.includes(s.id));
        
        // Nhóm theo baseId và rarity
        const groups: Record<string, OwnedItem[]> = {};
        for (const item of unequippedItems) {
            const definition = getItemDefinition(item.itemId);
            if (!definition || !definition.baseId) continue;

            const key = `${definition.baseId}-${definition.rarity}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        }

        // Tạo danh sách các nhóm có thể merge (>= 3 items)
        return Object.values(groups)
            .filter(group => group.length >= 3)
            .map(group => {
                const firstItemDef = getItemDefinition(group[0].itemId)!;
                const blueprint = getBlueprintByName(firstItemDef.name)!;
                const nextRank = getNextRank(firstItemDef.rarity);
                // Sắp xếp level giảm dần để lấy 3 cái cao nhất
                const sortedItems = [...group].sort((a, b) => b.level - a.level);
                const top3Items = sortedItems.slice(0, 3);
                // Tính toán kết quả dự kiến
                const estimatedResult = calculateForgeResult(top3Items, firstItemDef);
                
                return { blueprint, rarity: firstItemDef.rarity, items: sortedItems, nextRank, estimatedResult };
            })
            .filter(group => group.nextRank !== null) // Chỉ lấy nếu có Rank tiếp theo
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
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Hợp nhất 3 trang bị <span className="font-bold text-white">cùng loại, cùng hạng</span> để tạo 1 trang bị hạng cao hơn. Hệ thống sẽ ưu tiên các trang bị cấp cao nhất.</p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2 space-y-4">
                    {forgeableGroups.length > 0 ? (
                        forgeableGroups.map(group => (
                            <div key={`${group.blueprint.baseId}-${group.rarity}`} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4">
                                <div className="flex flex-1 items-center justify-center gap-4 sm:gap-6">
                                    {/* Cột 1: 3 Items đầu vào */}
                                    <div className={`relative w-16 h-16 flex items-center justify-center rounded-md border-2 ${getRarityColor(group.rarity)} bg-black/30`}>
                                        <img src={group.blueprint.icon} className="w-12 h-12 object-contain" alt={group.blueprint.name} />
                                        <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-slate-700">
                                            3/{group.items.length}
                                        </span>
                                    </div>
                                    
                                    {/* Mũi tên */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                    
                                    {/* Cột 2: Item kết quả */}
                                    <div className={`relative w-16 h-16 flex items-center justify-center rounded-md border-2 ${getRarityColor(group.nextRank!)} bg-black/30`}>
                                        <img src={group.blueprint.icon} className="w-12 h-12 object-contain" alt={group.blueprint.name} />
                                        <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-slate-700">
                                            Lv.{group.estimatedResult.level}
                                        </span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => onForge(group)} 
                                    disabled={isProcessing} 
                                    title="Merge" 
                                    className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm h-8 px-4 rounded-md shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
                                >
                                    Merge
                                </button>
                            </div>
                        ))
                    ) : ( 
                        <div className="flex items-center justify-center h-full text-slate-500 text-center py-10">
                            <p>Không có trang bị nào có thể hợp nhất.</p>
                        </div> 
                    )}
                </div>
            </div>
        </div>
    );
});
