import React, { memo, useState } from 'react';
import { uiAssets, equipmentUiAssets } from '../../game-assets.ts'; // Giả định bạn có assets, nếu không sẽ dùng placeholder

// Định nghĩa kiểu dữ liệu cho tài nguyên
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth';

// Định nghĩa thông tin gói đổi
export interface TradeOption {
    id: string;
    resourceType: ResourceType;
    resourceName: string;
    resourceCost: number;
    receiveType: 'equipmentPiece'; // Sau này có thể thêm các loại khác
    receiveAmount: number;
    iconColor: string; // Màu đại diện cho tài nguyên
}

// Cấu hình các gói đổi (Hardcode theo yêu cầu)
const TRADE_OPTIONS: TradeOption[] = [
    { id: 'trade_wood', resourceType: 'wood', resourceName: 'Gỗ', resourceCost: 10, receiveType: 'equipmentPiece', receiveAmount: 1, iconColor: 'bg-amber-700' },
    { id: 'trade_leather', resourceType: 'leather', resourceName: 'Da', resourceCost: 10, receiveType: 'equipmentPiece', receiveAmount: 1, iconColor: 'bg-orange-600' },
    { id: 'trade_ore', resourceType: 'ore', resourceName: 'Quặng', resourceCost: 10, receiveType: 'equipmentPiece', receiveAmount: 1, iconColor: 'bg-slate-500' },
    { id: 'trade_cloth', resourceType: 'cloth', resourceName: 'Vải', resourceCost: 10, receiveType: 'equipmentPiece', receiveAmount: 1, iconColor: 'bg-indigo-300' },
];

interface TradeAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Record<ResourceType, number>; // Số lượng tài nguyên hiện có
    onExchange: (option: TradeOption) => Promise<void>; // Hàm xử lý đổi
    isProcessing: boolean;
}

// Icon Mảnh trang bị (Lấy từ component cũ hoặc dùng ảnh)
const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => (
    <img src={equipmentUiAssets.equipmentPieceIcon} alt="Piece" className={className} />
);

// Icon đóng
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
                        {/* Icon Thương Hội giả lập */}
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
                    "Quy đổi tài nguyên dư thừa lấy Mảnh Trang Bị quý giá."
                </p>

                {/* List Options */}
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pr-1">
                    {TRADE_OPTIONS.map((option) => {
                        const currentAmount = resources[option.resourceType] || 0;
                        const canAfford = currentAmount >= option.resourceCost;

                        return (
                            <div key={option.id} className="bg-[#2a201c]/80 border border-[#5c4033] rounded-xl p-3 flex items-center justify-between shadow-inner group transition-all hover:bg-[#382b26]">
                                {/* Left: Cost */}
                                <div className="flex items-center gap-3 w-1/3">
                                    <div className={`w-10 h-10 rounded-lg ${option.iconColor} border border-white/20 shadow-md flex items-center justify-center text-xs font-bold text-white`}>
                                        {/* Placeholder Icon cho Resource */}
                                        {option.resourceName[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#e6cfa3] font-bold text-sm">{option.resourceName}</span>
                                        <span className={`text-xs ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                            {currentAmount}/{option.resourceCost}
                                        </span>
                                    </div>
                                </div>

                                {/* Center: Arrow */}
                                <div className="text-[#8b5a2b]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>

                                {/* Right: Receive & Action */}
                                <div className="flex items-center justify-end gap-3 w-5/12">
                                    <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md border border-[#5c4033]">
                                        <span className="text-white font-bold">{option.receiveAmount}</span>
                                        <EquipmentPieceIcon className="w-6 h-6" />
                                    </div>
                                    
                                    <button
                                        onClick={() => onExchange(option)}
                                        disabled={!canAfford || isProcessing}
                                        className={`
                                            px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide shadow-md transition-all
                                            ${canAfford 
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
