// --- START OF FILE TransactionHistoryModal.tsx ---

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { fetchUserTransactions } from './shop-service.ts';
import { uiAssets } from '../../game-assets.ts';

// Component nhỏ để hiển thị trạng thái giao dịch với màu sắc
const StatusBadge = ({ status }: { status: string }) => {
    let text = 'Không rõ';
    let colorClasses = 'bg-gray-700 text-gray-300';

    switch (status) {
        case 'pending':
            text = 'Chờ xác nhận';
            colorClasses = 'bg-blue-900/50 text-blue-300 border border-blue-700/50';
            break;
        case 'user_confirmed':
            text = 'Chờ Admin duyệt';
            colorClasses = 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50';
            break;
        case 'completed':
            text = 'Thành công';
            colorClasses = 'bg-green-900/50 text-green-300 border border-green-700/50';
            break;
        case 'failed':
            text = 'Thất bại';
            colorClasses = 'bg-red-900/50 text-red-300 border border-red-700/50';
            break;
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${colorClasses}`}>
            {text}
        </span>
    );
};


const TransactionHistoryModal = ({ onClose }: { onClose: () => void }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            const user = auth.currentUser;
            if (!user) {
                setError("Vui lòng đăng nhập để xem lịch sử.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await fetchUserTransactions(user.uid);
                setTransactions(data);
            } catch (err) {
                console.error("Failed to fetch user transactions:", err);
                setError("Không thể tải lịch sử giao dịch.");
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-cyan-300">Lịch sử Giao dịch</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><img src={uiAssets.closeIcon} alt="Close" className="w-6 h-6" /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? <p className="text-center text-slate-400">Đang tải...</p> :
                     error ? <p className="text-center text-red-400">{error}</p> :
                     transactions.length === 0 ? <p className="text-center text-slate-500">Bạn chưa có giao dịch nào.</p> : (
                        <div className="space-y-3">
                            {transactions.map(tx => (
                                <div key={tx.firestoreId} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div className="flex-1">
                                        <p className="font-mono text-xs text-slate-400 break-all">{tx.transactionId}</p>
                                        <p className="text-sm text-slate-300 mt-1">
                                            Gói <span className="font-bold text-purple-400">{tx.gems.toLocaleString()} Gems</span> - 
                                            <span className="font-semibold text-white"> {tx.amount.toLocaleString('vi-VN')} VNĐ</span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 mt-2 sm:mt-0">
                                        <StatusBadge status={tx.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryModal;
// --- END OF FILE TransactionHistoryModal.tsx ---
