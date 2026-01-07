
import React, { useState, useEffect, memo } from 'react';
import { 
    getItemDefinition 
} from './item-database.ts';
import { 
    ENHANCEMENT_STONES, 
    type StoneTier 
} from './equipment-context.tsx';
import { uiAssets } from '../../game-assets.ts';
import type { OwnedItem } from './equipment-ui.tsx';

// --- CÁC HÀM TIỆN ÍCH HELPER ---
const getRarityColor = (rank: string): string => {
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

const getRarityTextColor = (rank: string): string => {
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

// --- ICON ĐÁ CƯỜNG HOÁ ---
const STONE_ICONS: Record<StoneTier, string> = {
    low: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/basic-stone.webp',
    medium: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/intermediate-stone.webp',
    high: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/advanced-stone.webp',
};

// --- CÁC ICON CỤC BỘ ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const HpIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statHpIcon} alt="HP Icon" {...props} />;
const AtkIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statAtkIcon} alt="ATK Icon" {...props} />;
const DefIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statDefIcon} alt="DEF Icon" {...props} />;

const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: any) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

// --- PROPS INTERFACE ---
interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: OwnedItem | null;
    onUpgrade: (item: OwnedItem, stone: StoneTier) => Promise<boolean>;
    isProcessing: boolean;
    stoneCounts: Record<StoneTier, number>;
}

// --- MAIN COMPONENT ---
const UpgradeModal = memo(({ isOpen, onClose, item, onUpgrade, isProcessing, stoneCounts }: UpgradeModalProps) => {
    const [selectedStone, setSelectedStone] = useState<StoneTier>('low');
    const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'success' | 'fail'>('idle');

    useEffect(() => {
        if (isOpen) setUpgradeStatus('idle');
    }, [isOpen, item]);

    if (!isOpen || !item) return null;
    const itemDef = getItemDefinition(item.itemId)!;
    
    const handleEnhance = async () => {
        if (isProcessing) return;
        setUpgradeStatus('idle');
        try {
            const success = await onUpgrade(item, selectedStone);
            setUpgradeStatus(success ? 'success' : 'fail');
            setTimeout(() => setUpgradeStatus('idle'), 2000); 
        } catch (e) {
            console.error(e);
        }
    };

    const stones: StoneTier[] = ['low', 'medium', 'high'];
    const currentStone = ENHANCEMENT_STONES[selectedStone];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-gradient-to-br from-[#1a1c2e] to-[#0f111a] p-0 rounded-2xl border border-slate-600 shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                
                {/* NÚT ĐÓNG */}
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 z-50 p-2 text-slate-400 hover:text-white hover:scale-110 transition-all"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                {/* Cột trái: Thông tin Item */}
                <div className="w-full md:w-1/3 p-6 flex flex-col items-center relative">
                    <div className="mt-4"></div> 
                    
                    <div className={`relative w-32 h-32 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-4`}>
                        <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                        <div className="absolute -top-3 -right-3 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-600 shadow-md">
                            Lv.{item.level}
                        </div>
                    </div>
                    
                    {/* Item Name */}
                    <h4 className={`text-lg font-bold ${getRarityTextColor(itemDef.rarity)} mb-6 text-center`}>{itemDef.name}</h4>

                    {/* Stats Preview */}
                    <div className="w-full space-y-2">
                        {Object.entries(item.stats).map(([key, value]) => {
                            if (typeof value !== 'number') return null;
                            const config = STAT_CONFIG[key.toLowerCase()];
                            return (
                                <div key={key} className="flex justify-between items-center bg-black/30 px-3 py-3 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        {config && <config.Icon className="w-6 h-6" />}
                                        <span className="text-base text-slate-300 uppercase font-lilita tracking-wide">{key}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-lg font-lilita">{value}</span>
                                        <span className="text-xs text-green-500 font-lilita">➜ ?</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cột phải: Chọn đá & Action */}
                <div className="flex-1 p-8 flex flex-col justify-center relative">
                    
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="text-center">
                            
                            {/* KHU VỰC CHỌN ĐÁ */}
                            <div className="flex items-center justify-center gap-6 mt-4">
                                {stones.map((tier) => {
                                    const stone = ENHANCEMENT_STONES[tier];
                                    const isSelected = selectedStone === tier;
                                    const count = stoneCounts[tier];
                                    const cost = 1; // Mặc định tốn 1 đá
                                    const hasEnough = count >= cost;
                                    
                                    let glowColor = '';
                                    if(tier === 'low') glowColor = 'group-hover:shadow-green-500/20';
                                    if(tier === 'medium') glowColor = 'group-hover:shadow-blue-500/20';
                                    if(tier === 'high') glowColor = 'group-hover:shadow-orange-500/20';

                                    return (
                                        <div key={tier} className="flex flex-col items-center gap-3 relative pb-3"> 
                                            <div 
                                                onClick={() => setSelectedStone(tier)}
                                                className={`
                                                    cursor-pointer group relative rounded-xl flex items-center justify-center transition-all duration-300
                                                    w-20 h-20
                                                    ${isSelected 
                                                        ? `scale-110 border-2 border-slate-400 bg-slate-800 shadow-lg ${glowColor}` 
                                                        : 'bg-slate-900 border border-slate-600 opacity-60 hover:opacity-100 hover:scale-105'
                                                    }
                                                `}
                                            >
                                                {/* ICON ĐÁ */}
                                                <img 
                                                    src={STONE_ICONS[tier]} 
                                                    alt={stone.name} 
                                                    className="w-16 h-16 object-contain drop-shadow-md transform group-hover:scale-110 transition-transform duration-300"
                                                />
                                                
                                                {/* --- THIẾT KẾ MỚI CHO SỐ LƯỢNG (FLOATING PILL) --- */}
                                                <div className={`
                                                    absolute -bottom-3 left-1/2 -translate-x-1/2 z-10
                                                    flex items-center justify-center gap-[2px]
                                                    px-3 py-0.5 rounded-full shadow-md whitespace-nowrap min-w-[50px]
                                                    border transition-colors duration-300
                                                    ${hasEnough 
                                                        ? 'bg-[#1a1c2e] border-slate-600' // Đủ đá: Nền tối, viền xám
                                                        : 'bg-red-950/90 border-red-500/50' // Thiếu đá: Nền đỏ tối, viền đỏ
                                                    }
                                                `}>
                                                    {/* Số lượng đang có */}
                                                    <span className={`text-xs font-bold ${hasEnough ? 'text-slate-200' : 'text-red-400 animate-pulse'}`}>
                                                        {count}
                                                    </span>
                                                    {/* Dấu gạch chéo */}
                                                    <span className="text-[10px] text-slate-500">/</span>
                                                    {/* Số lượng cần */}
                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        {cost}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* HÀNG DƯỚI: TỈ LỆ THÀNH CÔNG VÀ NÚT NÂNG CẤP */}
                    <div className="flex flex-row items-center justify-center gap-8 w-full mt-6">
                        <div className="flex flex-col items-center justify-center animate-fade-in min-w-[120px]">
                             <div className={`text-5xl font-black ${currentStone.color} drop-shadow-md`}>
                                 {Math.round(currentStone.successRate * 100)}%
                             </div>
                             <span className="text-slate-400 text-xs uppercase tracking-wider mt-1">Success Rate</span>
                        </div>

                        <div className="flex-1 max-w-[200px]">
                            <button 
                                onClick={handleEnhance}
                                disabled={isProcessing || stoneCounts[selectedStone] < 1}
                                className={`
                                    relative overflow-hidden group w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all duration-200 shadow-lg
                                    ${(isProcessing || stoneCounts[selectedStone] < 1)
                                        ? 'bg-slate-700 cursor-not-allowed opacity-70 grayscale' 
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/30 text-white cursor-pointer'
                                    }
                                `}
                            >
                                <span className="relative z-10">{isProcessing ? 'Processing...' : 'Enhance'}</span>
                                {!isProcessing && stoneCounts[selectedStone] >= 1 && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                            </button>
                        </div>
                    </div>

                    {/* Status Overlay */}
                    {upgradeStatus !== 'idle' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-r-2xl">
                            <div className={`transform transition-all duration-500 scale-100 ${upgradeStatus === 'success' ? 'text-green-400' : 'text-red-500'}`}>
                                <h2 className="text-5xl font-black uppercase drop-shadow-2xl animate-bounce text-center">
                                    {upgradeStatus === 'success' ? 'Success!' : 'Failed!'}
                                </h2>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default UpgradeModal;
