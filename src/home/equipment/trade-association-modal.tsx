import React, { memo } from 'react';
import { equipmentUiAssets } from '../../game-assets.ts'; 

// Định nghĩa các loại tài nguyên
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth';

// Định nghĩa 1 thành phần nguyên liệu
export interface TradeIngredient {
    type: ResourceType;
    name: string;
    amount: number;
    color: string; // class màu background cho icon
}

// Định nghĩa gói đổi (cập nhật để hỗ trợ nhiều nguyên liệu)
export interface TradeOption {
    id: string;
    ingredients: TradeIngredient[]; // Mảng các nguyên liệu cần
    receiveType: 'equipmentPiece';
    receiveAmount: number;
}

// --- CẤU HÌNH CÔNG THỨC ĐỔI THEO YÊU CẦU ---
const TRADE_OPTIONS: TradeOption[] = [
    { 
        id: 'combine_wood_leather', 
        ingredients: [
            { type: 'wood', name: 'Gỗ', amount: 10, color: 'bg-amber-700' },
            { type: 'leather', name: 'Da', amount: 10, color: 'bg-orange-600' }
        ],
        receiveType: 'equipmentPiece', 
        receiveAmount: 1
    },
    { 
        id: 'combine_ore_cloth', 
        ingredients: [
            { type: 'ore', name: 'Quặng', amount: 10, color: 'bg-slate-500' },
            { type: 'cloth', name: 'Vải', amount: 10, color: 'bg-indigo-400' }
        ],
        receiveType: 'equipmentPiece', 
        receiveAmount: 1
    },
];

interface TradeAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Record<ResourceType, number>; // Số lượng tài nguyên hiện có
    onExchange: (option: TradeOption) => Promise<void>; 
    isProcessing: boolean;
}

const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => (
    <img src={equipmentUiAssets.equipmentPieceIcon} alt="Piece" className={className} />
);

const CloseIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TradeAssociationModal = memo(({ isOpen, onClose, resources, onExchange, isProcessing }: TradeAssociationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            
            <div className="relative bg-gradient-to-b from-[#2c1f18] to-[#1a120f] p-5 rounded-2xl border-2 border-[#8b5a2b] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-50">
                
                {/* Header */}
                <div className="flex-shrink-0 border-b border-[#8b5a2b]/50 pb-4 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 border-2 border-yellow-200 shadow-lg flex items-center justify-center">
                            <span className="text-2xl">⚖️</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-wider text-[#e6cfa3] drop-shadow-md">
                            Thương Hội
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-[#8b5a2b] hover:text-[#e6cfa3] bg-[#463022] hover:bg-[#5e402d] rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Subtitle */}
                <p className="text-sm text-[#bca388] mb-4 text-center italic">
                    "Thu thập đủ nguyên liệu để đổi lấy Mảnh Trang Bị."
                </p>

                {/* List Options */}
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pr-1">
                    {TRADE_OPTIONS.map((option) => {
                        // Kiểm tra xem user có đủ TẤT CẢ nguyên liệu trong công thức không
                        let canAffordAll = true;
                        
                        return (
                            <div key={option.id} className="bg-[#2a201c]/80 border border-[#5c4033] rounded-xl p-3 flex items-center justify-between shadow-inner group transition-all hover:bg-[#382b26]">
                                
                                {/* Left: Ingredients List */}
                                <div className="flex flex-col gap-2 w-3/5">
                                    {option.ingredients.map((ing, index) => {
                                        const userHas = resources[ing.type] || 0;
                                        const isEnough = userHas >= ing.amount;
                                        if (!isEnough) canAffordAll = false;

                                        return (
                                            <div key={ing.type} className="flex items-center gap-2">
                                                {/* Dấu cộng nếu không phải dòng đầu */}
                                                {index > 0 && <span className="text-[#8b5a2b] text-xs font-bold">+</span>}
                                                
                                                <div className={`w-6 h-6 rounded ${ing.color} border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                                    {ing.name[0]}
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-[#e6cfa3] text-sm font-semibold">{ing.name}</span>
                                                    <span className={`text-xs ${isEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                        ({userHas}/{ing.amount})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Center: Arrow */}
                                <div className="text-[#8b5a2b]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>

                                {/* Right: Result & Button */}
                                <div className="flex flex-col items-end gap-2 w-1/4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-white font-bold text-lg">{option.receiveAmount}</span>
                                        <EquipmentPieceIcon className="w-8 h-8 drop-shadow-md" />
                                    </div>
                                    
                                    <button
                                        onClick={() => onExchange(option)}
                                        disabled={!canAffordAll || isProcessing}
                                        className={`
                                            w-full py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide shadow-md transition-all
                                            ${canAffordAll 
                                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:scale-105 active:scale-95' 
                                                : 'bg-gray-700 text-gray-400 cursor-not-allowed grayscale'
                                            }
                                        `}
                                    >
                                        Đổi
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Tip */}
                <div className="mt-4 pt-3 border-t border-[#8b5a2b]/30 text-center">
                    <span className="text-[10px] text-[#8b5a2b]/70 uppercase font-semibold">Tỷ lệ quy đổi được niêm yết bởi Thương Hội</span>
                </div>
            </div>
        </div>
    );
});

export default TradeAssociationModal;
