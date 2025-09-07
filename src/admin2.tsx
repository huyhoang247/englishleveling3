// --- START OF FILE admin.tsx ---

import React, { useState } from 'react';
import { adminUpdateUserData, fetchOrCreateUserGameData, UserGameData, updateJackpotPool } from './gameDataService.ts';

interface AdminPanelProps {
    onClose: () => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [targetUserId, setTargetUserId] = useState('');
    const [userData, setUserData] = useState<UserGameData | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [updateValues, setUpdateValues] = useState({
        coins: 0,
        gems: 0,
        ancientBooks: 0,
        equipmentPieces: 0,
        pickaxes: 0,
        hp: 0,
        atk: 0,
        def: 0,
        jackpot: 0,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateValues(prev => ({ ...prev, [name]: Number(value) }));
    };

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleFetchUser = async () => {
        if (!targetUserId) {
            showFeedback('error', 'Vui lòng nhập User ID.');
            return;
        }
        setIsFetching(true);
        setUserData(null);
        try {
            const data = await fetchOrCreateUserGameData(targetUserId);
            setUserData(data);
            showFeedback('success', `Đã tải dữ liệu của user: ${targetUserId}`);
        } catch (error) {
            console.error(error);
            showFeedback('error', error instanceof Error ? error.message : 'Không tìm thấy người dùng.');
        } finally {
            setIsFetching(false);
        }
    };
    
    const handleUpdate = async (field: keyof typeof updateValues, dbKey: string) => {
        if (!userData || !targetUserId) {
            showFeedback('error', 'Vui lòng chọn người dùng trước.');
            return;
        }
        const amount = updateValues[field];
        if (amount === 0) {
            showFeedback('error', 'Giá trị phải khác 0.');
            return;
        }

        setIsUpdating(field);
        try {
            const updatedData = await adminUpdateUserData(targetUserId, { [dbKey]: amount });
            setUserData(updatedData);
            showFeedback('success', `Đã cập nhật ${field} thành công!`);
        } catch (error) {
            console.error(error);
            showFeedback('error', `Lỗi khi cập nhật: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        } finally {
            setIsUpdating(null);
            setUpdateValues(prev => ({ ...prev, [field]: 0 }));
        }
    };
    
    const handleUpdateJackpot = async () => {
        setIsUpdating('jackpot');
        try {
            const newPool = await updateJackpotPool(updateValues.jackpot);
            showFeedback('success', `Jackpot pool updated to ${newPool.toLocaleString()}`);
        } catch (error) {
            console.error(error);
            showFeedback('error', `Failed to update jackpot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUpdating(null);
            setUpdateValues(prev => ({ ...prev, jackpot: 0 }));
        }
    };

    const renderUserData = () => {
        if (!userData) return null;
        return (
            <div className="bg-slate-800/50 p-4 rounded-lg mt-4 animate-fade-in">
                <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-600 pb-2 mb-3">Dữ liệu hiện tại</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    <p><strong>Coins:</strong> {userData.coins.toLocaleString()}</p>
                    <p><strong>Gems:</strong> {userData.gems.toLocaleString()}</p>
                    <p><strong>Pickaxes:</strong> {userData.pickaxes.toLocaleString()}</p>
                    <p><strong>Ancient Books:</strong> {userData.ancientBooks.toLocaleString()}</p>
                    <p><strong>Equipment Pieces:</strong> {userData.equipment.pieces.toLocaleString()}</p>
                    <p><strong>HP Level:</strong> {userData.stats.hp}</p>
                    <p><strong>ATK Level:</strong> {userData.stats.atk}</p>
                    <p><strong>DEF Level:</strong> {userData.stats.def}</p>
                </div>
            </div>
        );
    };
    
    const ActionRow: React.FC<{
        label: string;
        fieldName: keyof typeof updateValues;
        dbKey: string;
    }> = ({ label, fieldName, dbKey }) => (
        <div className="flex items-center space-x-2">
            <p className="w-32 flex-shrink-0 text-slate-300">{label}:</p>
            <input
                type="number"
                name={fieldName}
                value={updateValues[fieldName]}
                onChange={handleInputChange}
                className="flex-grow bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="+/-"
            />
            <button
                onClick={() => handleUpdate(fieldName, dbKey)}
                disabled={isUpdating !== null}
                className="w-24 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-500 text-white font-bold py-1 px-3 rounded transition-colors flex items-center justify-center"
            >
                {isUpdating === fieldName ? <Spinner /> : 'Cập nhật'}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-white p-6 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-slate-400 hover:text-white">&times;</button>
                <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Admin Panel</h2>

                <div className="mb-6">
                    <label htmlFor="userIdInput" className="block text-sm font-medium text-slate-300 mb-1">User ID</label>
                    <div className="flex space-x-2">
                        <input
                            id="userIdInput"
                            type="text"
                            value={targetUserId}
                            onChange={(e) => setTargetUserId(e.target.value)}
                            placeholder="Nhập User ID của người chơi..."
                            className="flex-grow bg-slate-800 border border-slate-600 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <button onClick={handleFetchUser} disabled={isFetching} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center w-32">
                            {isFetching ? <Spinner /> : 'Tải dữ liệu'}
                        </button>
                    </div>
                </div>

                {renderUserData()}
                
                {userData && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-600 pb-2 mb-3">Chỉnh sửa tài nguyên</h3>
                         <ActionRow label="Coins" fieldName="coins" dbKey="coins" />
                         <ActionRow label="Gems" fieldName="gems" dbKey="gems" />
                         <ActionRow label="Sách Cổ" fieldName="ancientBooks" dbKey="ancientBooks" />
                         <ActionRow label="Mảnh Trang Bị" fieldName="equipmentPieces" dbKey="equipment.pieces" />
                         <ActionRow label="Cuốc" fieldName="pickaxes" dbKey="pickaxes" />
                         
                         <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-600 pb-2 mb-3 pt-4">Chỉnh sửa chỉ số</h3>
                         <ActionRow label="HP Level" fieldName="hp" dbKey="stats.hp" />
                         <ActionRow label="ATK Level" fieldName="atk" dbKey="stats.atk" />
                         <ActionRow label="DEF Level" fieldName="def" dbKey="stats.def" />
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-700">
                     <h3 className="text-lg font-semibold text-cyan-300 pb-2 mb-3">Hệ thống chung</h3>
                     <div className="flex items-center space-x-2">
                        <p className="w-32 flex-shrink-0 text-slate-300">Jackpot Pool:</p>
                        <input
                            type="number"
                            name="jackpot"
                            value={updateValues.jackpot}
                            onChange={handleInputChange}
                            className="flex-grow bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            placeholder="+/-"
                        />
                        <button
                            onClick={handleUpdateJackpot}
                            disabled={isUpdating !== null}
                            className="w-24 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-500 text-white font-bold py-1 px-3 rounded transition-colors flex items-center justify-center"
                        >
                            {isUpdating === 'jackpot' ? <Spinner /> : 'Cập nhật'}
                        </button>
                    </div>
                </div>

                {feedback && (
                    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white animate-fade-in-up ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;

// --- END OF FILE admin.tsx ---
