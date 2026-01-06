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
import { uiAssets as assets } from '../../game-assets.ts'; // Hoặc import từ nơi bạn lưu assets

// --- CÁC HÀM TIỆN ÍCH HELPER (Copy từ file gốc để hiển thị đúng màu sắc) ---
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
                    className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/40 text-slate-400 hover:text-white hover:bg-red-500/80 transition-all border border-transparent hover:border-red-400"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>

                {/* Cột trái: Thông tin Item */}
                <div className="w-full md:w-1/3 bg-slate-900/50 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-700 relative">
                    <div className="mt-4"></div> 
                    
                    <div className={`relative w-32 h-32 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-4`}>
                        <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                        <div className="absolute -top-3 -right-3 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-600 shadow-md">
                            Lv.{item.level}
                        </div>
                    </div>
                    
                    <h4 className={`text-lg font-bold ${getRarityTextColor(itemDef.rarity)} mb-1 text-center`}>{itemDef.name}</h4>
                    <span className="text-xs text-slate-400 mb-6">{itemDef.rarity} Rank</span>

                    {/* Stats Preview */}
                    <div className="w-full space-y-2">
                        {Object.entries(item.stats).map(([key, value]) => {
                            if (typeof value !== 'number') return null;
                            const config = STAT_CONFIG[key.toLowerCase()];
                            return (
                                <div key={key} className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        {config && <config.Icon className="w-4 h-4" />}
                                        <span className="text-sm text-slate-300 uppercase">{key}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono">{value}</span>
                                        <span className="text-xs text-green-500">➜ ?</span>
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
                            <h4 className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-4">Select Stone</h4>
                            
                            {/* KHU VỰC CHỌN ĐÁ */}
                            <div className="flex items-center justify-center gap-6">
                                {stones.map((tier) => {
                                    const stone = ENHANCEMENT_STONES[tier];
                                    const isSelected = selectedStone === tier;
                                    
                                    // Xác định màu glow dựa trên loại đá
                                    let glowColor = '';
                                    if(tier === 'low') glowColor = 'group-hover:shadow-green-500/50 shadow-green-500/20';
                                    if(tier === 'medium') glowColor = 'group-hover:shadow-blue-500/50 shadow-blue-500/20';
                                    if(tier === 'high') glowColor = 'group-hover:shadow-orange-500/50 shadow-orange-500/20';

                                    return (
                                        <div key={tier} className="flex flex-col items-center gap-2">
                                            <div 
                                                onClick={() => setSelectedStone(tier)}
                                                className={`
                                                    cursor-pointer group relative w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
                                                    ${isSelected 
                                                        ? `scale-110 border-2 ${stone.color.replace('text-', 'border-')} bg-slate-800 shadow-lg ${glowColor}` 
                                                        : 'bg-slate-900 border border-slate-700 opacity-60 hover:opacity-100 hover:scale-105'
                                                    }
                                                `}
                                            >
                                                {/* Chỉ hiện Icon (Text giả lập icon I, II, III) */}
                                                <span className={`font-black text-xl ${stone.color} font-serif`}>
                                                    {tier === 'low' ? 'I' : tier === 'medium' ? 'II' : 'III'}
                                                </span>
                                            </div>
                                            {/* HIỂN THỊ SỐ LƯỢNG */}
                                            <span className="text-xs font-mono font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-slate-700">
                                                {stoneCounts[tier]}/1
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* HÀNG DƯỚI: TỈ LỆ THÀNH CÔNG VÀ NÚT NÂNG CẤP */}
                    <div className="flex flex-row items-center justify-center gap-8 w-full mt-4">
                        <div className="flex flex-col items-center justify-center animate-fade-in min-w-[120px]">
                             <div className={`text-5xl font-black ${currentStone.color} drop-shadow-md`}>
                                 {Math.round(currentStone.successRate * 100)}%
                             </div>
                             <span className="text-slate-400 text-xs uppercase tracking-wider mt-1">Success Rate</span>
                        </div>

                        <div className="flex-1 max-w-[200px]">
                            <button 
                                onClick={handleEnhance}
                                disabled={isProcessing}
                                className={`
                                    relative overflow-hidden group w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all duration-200 shadow-lg
                                    ${isProcessing ? 'bg-slate-700 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/30 text-white'}
                                `}
                            >
                                <span className="relative z-10">{isProcessing ? 'Processing...' : 'Enhance'}</span>
                                {!isProcessing && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
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
