// --- START OF FILE AdminPanel.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import { fetchTransactionsByStatus, approveGemTransaction, rejectGemTransaction } from './shop-service';
import { uiAssets } from '../../game-assets.ts';

const AdminPanel = ({ onClose }: { onClose: () => void }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filter, setFilter] = useState('user_confirmed');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadTransactions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchTransactionsByStatus(filter);
            setTransactions(data);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
            setError("Không thể tải danh sách giao dịch.");
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const handleApprove = async (tx: any) => {
        if (!window.confirm(`Bạn có chắc muốn duyệt giao dịch ${tx.transactionId} và cộng ${tx.gems} Gems cho người dùng ${tx.userEmail}?`)) return;
        setProcessingId(tx.firestoreId);
        try {
            await approveGemTransaction(tx);
            alert("Duyệt thành công!");
            loadTransactions(); // Tải lại danh sách
        } catch (err) {
            console.error("Approval failed:", err);
            alert(`Duyệt thất bại: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (tx: any) => {
        if (!window.confirm(`Bạn có chắc muốn TỪ CHỐI giao dịch ${tx.transactionId}?`)) return;
        setProcessingId(tx.firestoreId);
        try {
            await rejectGemTransaction(tx.firestoreId);
            alert("Từ chối thành công!");
            loadTransactions();
        } catch (err) {
            console.error("Rejection failed:", err);
            alert(`Từ chối thất bại: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setProcessingId(null);
        }
    };

    const filters = [
        { key: 'user_confirmed', label: 'Chờ duyệt' },
        { key: 'completed', label: 'Thành công' },
        { key: 'failed', label: 'Thất bại' },
        { key: 'pending', label: 'Đang chờ' },
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-yellow-500 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-yellow-300">Admin - Quản lý Giao dịch</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><img src={uiAssets.closeIcon} alt="Close" className="w-6 h-6" /></button>
                </header>

                <div className="p-4 flex items-center gap-2 border-b border-slate-700 bg-slate-800/50">
                    {filters.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === f.key ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? <p className="text-center text-slate-400">Đang tải...</p> :
                     error ? <p className="text-center text-red-400">{error}</p> :
                     transactions.length === 0 ? <p className="text-center text-slate-500">Không có giao dịch nào.</p> : (
                        <div className="space-y-3">
                            {transactions.map(tx => (
                                <div key={tx.firestoreId} className="bg-slate-800 p-3 rounded-lg border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                    <div className="md:col-span-3 space-y-1">
                                        <p className="font-mono text-sm text-yellow-300 break-all">{tx.transactionId}</p>
                                        <p className="text-xs text-slate-400">User: <span className="font-semibold text-slate-200">{tx.userEmail}</span> (ID: {tx.userId})</p>
                                        <p className="text-xs text-slate-400">Thời gian tạo: {tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-1 text-center">
                                        <p className="font-bold text-lg text-white">{tx.amount.toLocaleString('vi-VN')} VNĐ</p>
                                        <p className="text-sm text-purple-400">→ {tx.gems.toLocaleString()} Gems</p>
                                    </div>
                                    {filter === 'user_confirmed' && (
                                        <div className="md:col-span-1 flex flex-col gap-2">
                                            <button onClick={() => handleApprove(tx)} disabled={processingId === tx.firestoreId}
                                                className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm py-1.5 px-3 rounded-md transition disabled:bg-gray-500">
                                                {processingId === tx.firestoreId ? '...' : 'Duyệt'}
                                            </button>
                                            <button onClick={() => handleReject(tx)} disabled={processingId === tx.firestoreId}
                                                className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm py-1.5 px-3 rounded-md transition disabled:bg-gray-500">
                                                {processingId === tx.firestoreId ? '...' : 'Từ chối'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
// --- END OF FILE AdminPanel.tsx ---
