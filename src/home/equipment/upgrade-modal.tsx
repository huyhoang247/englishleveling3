
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

// --- COMPONENT VÒNG TRÒN TỈ LỆ ---
const SuccessRateGauge = ({ rate }: { rate: number }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate * circumference);
    const percent = Math.round(rate * 100);

    // Logic màu sắc: 30% xám, 60% xanh, 90% tím
    let colorClass = 'text-gray-400'; 
    if (rate >= 0.8) {
        colorClass = 'text-purple-400';
    } else if (rate >= 0.5) {
        colorClass = 'text-blue-400';
    }

    return (
        <div className="relative w-24 h-24 flex items-center justify-center group">
            {/* Background Ring */}
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                <circle
                    cx="48" cy="48" r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-800"
                />
                {/* Progress Ring */}
                <circle
                    cx="48" cy="48" r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                />
            </svg>
            
            {/* Text Value */}
            <div className="absolute inset-0 flex items-center justify-center pt-1">
                <span className={`text-xl font-lilita ${colorClass} drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>
                    {percent}%
                </span>
            </div>

            {/* Decorative Glow */}
            <div className={`absolute inset-0 rounded-full ${colorClass.replace('text-', 'bg-')} opacity-5 blur-xl`}></div>
        </div>
    );
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
    const canUpgrade = !isProcessing && stoneCounts[selectedStone] >= 1;

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
                <div className="w-full md:w-1/3 p-6 flex flex-col items-center relative border-r border-slate-700/30">
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
                <div className="flex-1 px-8 pb-8 pt-4 flex flex-col relative">
                    
                    {/* KHU VỰC CHỌN ĐÁ (Đã đẩy lên cao) */}
                    <div className="flex flex-col items-center justify-start mt-2">
                        
                        <div className="flex items-center justify-center gap-6 mb-8">
                            {stones.map((tier) => {
                                const stone = ENHANCEMENT_STONES[tier];
                                const isSelected = selectedStone === tier;
                                const count = stoneCounts[tier];
                                const cost = 1; 
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
                                            
                                            {/* SỐ LƯỢNG (Floating Pill) */}
                                            <div className={`
                                                absolute -bottom-3 left-1/2 -translate-x-1/2 z-10
                                                flex items-center justify-center gap-[2px]
                                                px-3 py-0.5 rounded-full shadow-md whitespace-nowrap min-w-[50px]
                                                border transition-colors duration-300
                                                ${hasEnough 
                                                    ? 'bg-[#1a1c2e] border-slate-600' 
                                                    : 'bg-red-950/90 border-red-500/50' 
                                                }
                                            `}>
                                                <span className={`text-xs font-bold ${hasEnough ? 'text-slate-200' : 'text-red-400 animate-pulse'}`}>
                                                    {count}
                                                </span>
                                                <span className="text-[10px] text-slate-500">/</span>
                                                <span className="text-[10px] font-bold text-slate-500">{cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* HÀNG DƯỚI: TỈ LỆ VÀ NÚT BẤM (Đã chỉnh sửa Nút Upgrade) */}
                    <div className="flex-1 flex flex-row items-center justify-center gap-8 w-full">
                        
                        {/* COMPONENT VÒNG TRÒN TỈ LỆ */}
                        <div className="animate-fade-in">
                            <SuccessRateGauge rate={currentStone.successRate} />
                        </div>

                        {/* BUTTON UPGRADE MỚI */}
                        <div className="flex-1 max-w-[180px]">
                            <button 
                                onClick={handleEnhance}
                                disabled={!canUpgrade}
                                className={`
                                    relative w-full py-2 rounded-xl
                                    font-lilita text-2xl tracking-wide uppercase
                                    shadow-lg transition-all duration-150 transform
                                    flex items-center justify-center
                                    ${!canUpgrade
                                        ? 'bg-slate-700 text-slate-500 border-b-4 border-slate-800 cursor-not-allowed opacity-70' 
                                        : 'bg-gradient-to-b from-blue-400 to-blue-600 text-white border-b-4 border-blue-800 hover:brightness-110 active:border-b-0 active:translate-y-1'
                                    }
                                `}
                            >
                                {isProcessing ? (
                                    <span className="animate-pulse text-lg">...</span>
                                ) : (
                                    <span className="drop-shadow-md">Upgrade</span>
                                )}
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
