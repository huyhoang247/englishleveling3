import React, { memo } from 'react';
import { equipmentUiAssets } from '../../game-assets.ts';

// --- ĐỊNH NGHĨA TYPES ---
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth';

export interface TradeIngredient {
    type: ResourceType;
    name: string;
    amount: number;
    // Icon SVG hoặc Image URL riêng cho từng loại
}

export interface TradeOption {
    id: string;
    title: string; // Tên gói đổi (VD: Gói Thợ Săn, Gói Thợ Mỏ)
    ingredients: TradeIngredient[];
    receiveType: 'equipmentPiece';
    receiveAmount: number;
    description?: string;
}

// --- CẤU HÌNH CÔNG THỨC ĐỔI ---
const TRADE_OPTIONS: TradeOption[] = [
    { 
        id: 'combine_wood_leather', 
        title: 'Tiếp Tế Thợ Săn',
        description: 'Chế tác từ nguyên liệu tự nhiên',
        ingredients: [
            { type: 'wood', name: 'Gỗ', amount: 10 },
            { type: 'leather', name: 'Da', amount: 10 }
        ],
        receiveType: 'equipmentPiece', 
        receiveAmount: 1
    },
    { 
        id: 'combine_ore_cloth', 
        title: 'Tiếp Tế Chiến Binh',
        description: 'Chế tác từ khoáng sản và vải vóc',
        ingredients: [
            { type: 'ore', name: 'Quặng', amount: 10 },
            { type: 'cloth', name: 'Vải', amount: 10 }
        ],
        receiveType: 'equipmentPiece', 
        receiveAmount: 1
    },
];

// --- CÁC ICON SVG CHO NGUYÊN LIỆU (Placeholder đẹp) ---
const ResourceIcon = ({ type, className = "w-6 h-6" }: { type: ResourceType, className?: string }) => {
    switch (type) {
        case 'wood': // Icon khúc gỗ
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-amber-600`}>
                    <path d="M19.5 12c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm-15 0c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zM12 3c-4.97 0-9 4.03-9 9H.75C.34 12 0 12.34 0 12.75V15h24v-2.25c0-.41-.34-.75-.75-.75H21c0-4.97-4.03-9-9-9z"/>
                    <path d="M12 5c-3.87 0-7 3.13-7 7h14c0-3.87-3.13-7-7-7z" opacity="0.5"/>
                </svg>
            );
        case 'leather': // Icon tấm da
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-orange-700`}>
                    <path d="M12 2L4 5v14l8 3 8-3V5l-8-3zm0 2.18l6 2.25v11.14l-6 2.25-6-2.25V6.43l6-2.25z"/>
                </svg>
            );
        case 'ore': // Icon cục đá/quặng
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-slate-400`}>
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 22 16.29l-1.43-1.43z"/>
                </svg>
            );
        case 'cloth': // Icon cuộn vải
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-indigo-400`}>
                    <path d="M16 5l-1-3-3 1.5L9 2 8 5H2v16h20V5h-6zm-4-1.5L13.5 5h-3L12 3.5zM20 19H4V7h16v12z"/>
                    <path d="M6 9h12v2H6zm0 4h12v2H6z" opacity="0.6"/>
                </svg>
            );
        default: return null;
    }
};

const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => (
    <img src={equipmentUiAssets.equipmentPieceIcon} alt="Piece" className={className} />
);

const CloseIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- COMPONENT CON: HIỂN THỊ VÍ TIỀN (USER RESOURCE) ---
const ResourceWallet = ({ resources }: { resources: Record<ResourceType, number> }) => {
    const items: { type: ResourceType; label: string }[] = [
        { type: 'wood', label: 'Gỗ' },
        { type: 'leather', label: 'Da' },
        { type: 'ore', label: 'Quặng' },
        { type: 'cloth', label: 'Vải' },
    ];

    return (
        <div className="grid grid-cols-4 gap-2 mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-700/50 shadow-inner">
            {items.map((item) => (
                <div key={item.type} className="flex flex-col items-center justify-center">
                    <div className="bg-slate-800/80 p-1.5 rounded-full mb-1 border border-slate-600 shadow-md">
                        <ResourceIcon type={item.type} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</span>
                    <span className="text-sm font-bold text-white">{resources[item.type]?.toLocaleString() || 0}</span>
                </div>
            ))}
        </div>
    );
};

// --- PROPS ---
interface TradeAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Record<ResourceType, number>;
    onExchange: (option: TradeOption) => Promise<void>;
    isProcessing: boolean;
}

// --- MAIN COMPONENT ---
const TradeAssociationModal = memo(({ isOpen, onClose, resources, onExchange, isProcessing }: TradeAssociationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            {/* Backdrop làm mờ + tối */}
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-[#13151b] rounded-2xl border-2 border-[#8b7355] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-zoom-in">
                
                {/* Header trang trí */}
                <div className="relative bg-gradient-to-r from-[#2c241b] via-[#3e3226] to-[#2c241b] p-4 border-b-2 border-[#8b7355] flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-lg border-2 border-yellow-400/50 shadow-lg flex items-center justify-center">
                            {/* Icon Shop/Trade SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-yellow-100">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-amber-400 drop-shadow-md font-serif">
                                Thương Hội
                            </h3>
                            <p className="text-[11px] text-amber-200/60 uppercase tracking-wider">Exchange & Supply</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="group bg-black/20 hover:bg-red-900/50 p-2 rounded-full border border-transparent hover:border-red-500/50 transition-all"
                    >
                        <CloseIcon className="w-6 h-6 text-slate-400 group-hover:text-red-200" />
                    </button>
                </div>

                {/* Nội dung chính */}
                <div className="p-5 bg-[url('https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/texture-noise.png')] bg-repeat overflow-y-auto max-h-[70vh] hide-scrollbar">
                    
                    {/* Ví Tài Nguyên */}
                    <ResourceWallet resources={resources} />

                    <div className="space-y-4">
                        {TRADE_OPTIONS.map((option) => {
                            // Logic check đủ nguyên liệu
                            let canAffordAll = true;
                            
                            return (
                                <div key={option.id} className="relative group bg-[#1c1e26] rounded-xl border border-slate-700 shadow-lg overflow-hidden transition-transform hover:scale-[1.01] hover:border-amber-700/50">
                                    {/* Background Glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                    {/* Header của Card */}
                                    <div className="px-4 py-2 bg-[#252833] border-b border-slate-700/50 flex justify-between items-center">
                                        <span className="text-sm font-bold text-amber-500/90 uppercase tracking-wide">{option.title}</span>
                                        <span className="text-[10px] text-slate-500 italic">{option.description}</span>
                                    </div>

                                    {/* Body của Card */}
                                    <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                                        
                                        {/* Cột Trái: Nguyên liệu cần (Inputs) */}
                                        <div className="flex-1 w-full space-y-2">
                                            {option.ingredients.map((ing) => {
                                                const userHas = resources[ing.type] || 0;
                                                const isEnough = userHas >= ing.amount;
                                                if (!isEnough) canAffordAll = false;

                                                return (
                                                    <div key={ing.type} className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-slate-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-slate-800 p-1.5 rounded-md shadow-inner">
                                                                <ResourceIcon type={ing.type} className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-slate-300 font-medium text-sm">{ing.name}</span>
                                                        </div>
                                                        <div className="text-xs font-mono">
                                                            <span className={isEnough ? "text-slate-400" : "text-red-400 font-bold"}>
                                                                {userHas}
                                                            </span>
                                                            <span className="text-slate-600 mx-1">/</span>
                                                            <span className="text-amber-400 font-bold">{ing.amount}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Giữa: Mũi tên */}
                                        <div className="shrink-0 text-slate-600 rotate-90 sm:rotate-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 animate-pulse">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>

                                        {/* Cột Phải: Kết quả & Nút bấm */}
                                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-3 bg-black/20 p-3 rounded-xl border border-dashed border-slate-700/50">
                                            
                                            {/* Icon Kết quả */}
                                            <div className="relative">
                                                <div className={`absolute inset-0 bg-amber-500 rounded-full blur-xl opacity-20 ${canAffordAll ? 'animate-pulse' : 'hidden'}`}></div>
                                                <EquipmentPieceIcon className="w-14 h-14 drop-shadow-2xl relative z-10" />
                                                <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 rounded border border-amber-400 shadow-md">
                                                    x{option.receiveAmount}
                                                </span>
                                            </div>

                                            {/* Nút Đổi */}
                                            <button
                                                onClick={() => onExchange(option)}
                                                disabled={!canAffordAll || isProcessing}
                                                className={`
                                                    w-full py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1
                                                    ${canAffordAll 
                                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-800' 
                                                        : 'bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed grayscale'
                                                    }
                                                `}
                                            >
                                                {isProcessing ? 'Processing...' : 'Trao Đổi'}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#1a1d26] p-3 text-center border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 font-mono">
                        *Tỷ lệ quy đổi có thể thay đổi tùy theo tình hình thị trường.
                    </p>
                </div>
            </div>

            {/* CSS Animation cho Modal */}
            <style>{`
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-zoom-in {
                    animation: zoomIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
});

export default TradeAssociationModal;
