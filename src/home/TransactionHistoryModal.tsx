import React from 'react';
import { useGame } from '../GameContext.tsx'; // Đường dẫn tuỳ chỉnh
import { uiAssets } from '../game-assets.ts'; // Đường dẫn tuỳ chỉnh

interface TransactionHistoryModalProps {
    onClose: () => void;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ onClose }) => {
    const { transactionHistory } = useGame();

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#1a1c29] border-2 border-slate-600 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                        📜 Lịch sử Giao dịch
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Body - List */}
                <div className="overflow-y-auto p-4 flex-1 custom-scrollbar space-y-3">
                    {transactionHistory && transactionHistory.length > 0 ? (
                        transactionHistory.map((record) => (
                            <div key={record.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-sm text-slate-300 font-medium">{record.reason}</span>
                                    <span className="text-xs text-slate-500">{formatDate(record.timestamp)}</span>
                                </div>
                                
                                <div className="text-right">
                                    <div className={`font-bold text-lg flex items-center justify-end gap-1 ${record.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {record.amount > 0 ? '+' : ''}{record.amount.toLocaleString()}
                                        <img 
                                            src={record.type === 'COINS' ? uiAssets.coinIcon : uiAssets.gemIcon} 
                                            className="w-4 h-4 object-contain" 
                                            alt={record.type}
                                        />
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Sau GD: {record.balanceAfter.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-500 py-10 italic">
                            Chưa có giao dịch nào được ghi lại.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl text-center">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryModal;
