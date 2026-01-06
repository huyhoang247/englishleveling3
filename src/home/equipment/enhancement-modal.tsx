import React, { useState, useMemo, useEffect } from 'react';
import { getItemDefinition } from './item-database.ts';
import ItemRankBorder from './item-rank-border.tsx';
import { calculateSuccessRate } from './equipment-context.tsx';

interface Props {
    ownedItem: OwnedItem;
    onClose: () => void;
    onEnhance: (item: OwnedItem, stoneType: 'basic' | 'intermediate' | 'advanced') => Promise<{ success: boolean }>;
    stones: { basic: number; intermediate: number; advanced: number };
    isProcessing: boolean;
}

const StoneIcon = ({ type }: { type: string }) => {
    const styles: Record<string, string> = {
        basic: "from-green-400 to-green-700",
        intermediate: "from-blue-400 to-blue-700",
        advanced: "from-purple-400 to-purple-700"
    };
    return (
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${styles[type]} shadow-lg border-2 border-white/20 flex items-center justify-center text-white text-2xl font-black`}>
            {type[0].toUpperCase()}
        </div>
    );
};

const EnhancementModal: React.FC<Props> = ({ ownedItem, onClose, onEnhance, stones, isProcessing }) => {
    const [selectedStone, setSelectedStone] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
    const [status, setStatus] = useState<'idle' | 'animating' | 'success' | 'fail'>('idle');
    const [shake, setShake] = useState(false);

    const itemDef = getItemDefinition(ownedItem.itemId)!;
    const rate = useMemo(() => calculateSuccessRate(selectedStone, ownedItem.level, itemDef.rarity), [selectedStone, ownedItem.level]);

    const handleEnhance = async () => {
        if (stones[selectedStone] <= 0 || status === 'animating') return;

        setStatus('animating');
        // Delay 1.5s tạo hiệu ứng rèn đồ
        setTimeout(async () => {
            const result = await onEnhance(ownedItem, selectedStone);
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('fail');
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
            // Quay lại trạng thái chờ sau 2s
            setTimeout(() => setStatus('idle'), 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop phủ đen toàn bộ */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={status === 'idle' ? onClose : undefined} />

            <div className={`relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] transition-transform duration-300 ${shake ? 'animate-bounce' : ''}`}>
                
                {/* Header */}
                <div className="pt-8 px-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Rèn Trang Bị</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Lò rèn ma thuật</p>
                    </div>
                    <button onClick={onClose} disabled={status === 'animating'} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-8 space-y-10">
                    {/* Khu vực so sánh */}
                    <div className="flex items-center justify-between bg-black/40 p-6 rounded-[2rem] border border-white/5 relative">
                        {/* Item Hiện Tại */}
                        <div className="flex flex-col items-center gap-2">
                            <ItemRankBorder rank={itemDef.rarity} className="w-20 h-20">
                                <img src={itemDef.icon} className="w-12 h-12 object-contain" />
                            </ItemRankBorder>
                            <span className="text-slate-500 font-bold text-xs">LV.{ownedItem.level}</span>
                        </div>

                        {/* Mũi tên và Tỉ lệ */}
                        <div className="flex flex-col items-center">
                            <div className={`text-2xl font-black transition-all duration-300 ${
                                status === 'success' ? 'text-green-400 scale-125' : 
                                status === 'fail' ? 'text-red-500' : 'text-cyan-400'
                            }`}>
                                {status === 'animating' ? 'ĐANG RÈN...' : status === 'success' ? 'THÀNH CÔNG' : status === 'fail' ? 'THẤT BẠI' : `${rate}%`}
                            </div>
                            <svg className={`w-8 h-8 text-slate-700 ${status === 'animating' ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {/* Preview Item Tiếp Theo */}
                        <div className="flex flex-col items-center gap-2">
                            <ItemRankBorder rank={itemDef.rarity} className={`w-20 h-20 transition-all ${status === 'animating' ? 'animate-pulse brightness-150' : 'opacity-40 grayscale'}`}>
                                <img src={itemDef.icon} className="w-12 h-12 object-contain" />
                            </ItemRankBorder>
                            <span className="text-cyan-500 font-bold text-xs text-glow">LV.{ownedItem.level + 1}</span>
                        </div>
                    </div>

                    {/* Lựa chọn Đá */}
                    <div className="grid grid-cols-3 gap-4">
                        {(['basic', 'intermediate', 'advanced'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => status === 'idle' && setSelectedStone(type)}
                                disabled={status !== 'idle'}
                                className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    selectedStone === type 
                                    ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-[0_0_20px_rgba(249,115,22,0.2)]' 
                                    : 'border-slate-800 bg-slate-950/50 opacity-60'
                                }`}
                            >
                                <StoneIcon type={type} />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">{type}</p>
                                    <p className={`text-lg font-black ${stones[type] > 0 ? 'text-white' : 'text-red-500'}`}>{stones[type]}</p>
                                </div>
                                {selectedStone === type && <div className="absolute -top-2 bg-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full">CHỌN</div>}
                            </button>
                        ))}
                    </div>

                    {/* Nút bấm */}
                    <button
                        onClick={handleEnhance}
                        disabled={status !== 'idle' || stones[selectedStone] <= 0}
                        className={`group relative w-full py-6 rounded-3xl overflow-hidden transition-all duration-300 ${
                            status === 'animating' 
                            ? 'bg-slate-800 cursor-wait' 
                            : 'bg-gradient-to-r from-orange-600 via-red-600 to-purple-700 hover:scale-[1.02] active:scale-95'
                        } disabled:opacity-50 disabled:grayscale`}
                    >
                        <span className="relative z-10 text-2xl font-black text-white uppercase tracking-tighter">
                            {status === 'animating' ? 'Đang tôi luyện...' : 'Bắt đầu nâng cấp'}
                        </span>
                        {/* Hiệu ứng quét sáng khi idle */}
                        {status === 'idle' && stones[selectedStone] > 0 && (
                            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-20deg] animate-slide-reflect" />
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slide-reflect {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(250%); }
                }
                .animate-slide-reflect { animation: slide-reflect 2s infinite; }
                .text-glow { text-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
            `}</style>
        </div>
    );
};
