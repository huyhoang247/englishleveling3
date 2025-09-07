import React, { useState } from 'react';
import { adminUpdateUserData, fetchOrCreateUserGameData, UserGameData, updateJackpotPool } from './gameDataService.ts';

interface AdminPanelProps {
    onClose: () => void;
}

// --- START: CÁC COMPONENT GIAO DIỆN ĐƯỢC CHUẨN HÓA GIỐNG SHOP-UI ---

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const Icon = ({ children, ...props }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Icon {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
);

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Icon {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></Icon>
);

// Header với style chính xác từ shop-ui
const AdminHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-[53px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-cyan-400">Admin Panel</h2>
            <button onClick={onClose} className="text-4xl text-slate-400 hover:text-white transition-colors">&times;</button>
        </div>
    </header>
);

// Tabs với style chính xác từ shop-ui
const AdminTabs: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: 'user', label: 'Quản lý Người dùng', icon: UserIcon },
        { name: 'system', label: 'Hệ thống Chung', icon: SettingsIcon },
    ];
    return (
        <nav className="max-w-[1600px] mx-auto flex items-center gap-2 px-4 sm:px-6 lg:px-8">
            {tabs.map(({ name, label, icon: IconComponent }) => (
                <button
                    key={name}
                    onClick={() => setActiveTab(name)}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-t-lg font-medium text-sm transition-colors duration-200 border-b-2 ${
                        activeTab === name
                            ? 'border-cyan-400 text-white'
                            : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                    <IconComponent className="w-5 h-5" />
                    <span>{label}</span>
                </button>
            ))}
        </nav>
    );
};
// --- END: CÁC COMPONENT GIAO DIỆN ---


const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('user');
    const [targetUserId, setTargetUserId] = useState('');
    const [userData, setUserData] = useState<UserGameData | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [updateValues, setUpdateValues] = useState({
        coins: 0, gems: 0, ancientBooks: 0, equipmentPieces: 0, pickaxes: 0, hp: 0, atk: 0, def: 0, jackpot: 0,
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
        if (!targetUserId) { showFeedback('error', 'Vui lòng nhập User ID.'); return; }
        setIsFetching(true); setUserData(null);
        try {
            const data = await fetchOrCreateUserGameData(targetUserId);
            setUserData(data); showFeedback('success', `Đã tải dữ liệu của user: ${targetUserId}`);
        } catch (error) {
            console.error(error); showFeedback('error', error instanceof Error ? error.message : 'Không tìm thấy người dùng.');
        } finally { setIsFetching(false); }
    };
    
    const handleUpdate = async (field: keyof typeof updateValues, dbKey: string) => {
        if (!userData || !targetUserId) { showFeedback('error', 'Vui lòng chọn người dùng trước.'); return; }
        const amount = updateValues[field];
        if (amount === 0) { showFeedback('error', 'Giá trị phải khác 0.'); return; }
        setIsUpdating(field);
        try {
            const updatedData = await adminUpdateUserData(targetUserId, { [dbKey]: amount });
            setUserData(updatedData); showFeedback('success', `Đã cập nhật ${field} thành công!`);
        } catch (error) {
            console.error(error); showFeedback('error', `Lỗi khi cập nhật: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        } finally { setIsUpdating(null); setUpdateValues(prev => ({ ...prev, [field]: 0 })); }
    };
    
    const handleUpdateJackpot = async () => {
        setIsUpdating('jackpot');
        try {
            const newPool = await updateJackpotPool(updateValues.jackpot);
            showFeedback('success', `Jackpot pool updated to ${newPool.toLocaleString()}`);
        } catch (error) {
            console.error(error); showFeedback('error', `Failed to update jackpot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally { setIsUpdating(null); setUpdateValues(prev => ({ ...prev, jackpot: 0 })); }
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
    
    const ActionRow: React.FC<{ label: string; fieldName: keyof typeof updateValues; dbKey: string; }> = ({ label, fieldName, dbKey }) => (
        <div className="flex items-center space-x-2">
            <p className="w-32 flex-shrink-0 text-slate-300">{label}:</p>
            <input type="number" name={fieldName} value={updateValues[fieldName]} onChange={handleInputChange} className="flex-grow bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="+/-" />
            <button onClick={() => handleUpdate(fieldName, dbKey)} disabled={isUpdating !== null} className="w-24 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-500 text-white font-bold py-1 px-3 rounded transition-colors flex items-center justify-center">
                {isUpdating === fieldName ? <Spinner /> : 'Cập nhật'}
            </button>
        </div>
    );

    return (
        // Cấu trúc layout chính giống Shop: flex-col để chia header, tabs, và content
        <div className="fixed inset-0 bg-[#0a0a14] text-white z-[100] flex flex-col">
            <AdminHeader onClose={onClose} />
            
            {/* Vùng chứa Tabs với style chính xác từ shop-ui */}
            <div className="flex-shrink-0 bg-[#0a0a14] border-b border-slate-800/70 shadow-md pt-2">
                <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            
            {/* Vùng nội dung có thể cuộn với nền radial-gradient */}
            <div className="flex-1 relative overflow-y-auto [background-image:radial-gradient(circle_at_center,_#16213e,_#0a0a14)]">
                <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
                    {/* Giới hạn chiều rộng của nội dung chính để dễ đọc */}
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'user' && (
                            <div className="animate-fade-in">
                                <div className="mb-6">
                                    <label htmlFor="userIdInput" className="block text-sm font-medium text-slate-300 mb-1">User ID</label>
                                    <div className="flex space-x-2">
                                        <input id="userIdInput" type="text" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="Nhập User ID của người chơi..." className="flex-grow bg-slate-800 border border-slate-600 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
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
                            </div>
                        )}
                        {activeTab === 'system' && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-semibold text-cyan-300 pb-2 mb-3">Hệ thống chung</h3>
                                <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <p className="w-32 flex-shrink-0 text-slate-300">Jackpot Pool:</p>
                                        <input type="number" name="jackpot" value={updateValues.jackpot} onChange={handleInputChange} className="flex-grow bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="+/-" />
                                        <button onClick={handleUpdateJackpot} disabled={isUpdating !== null} className="w-24 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-500 text-white font-bold py-1 px-3 rounded transition-colors flex items-center justify-center">
                                            {isUpdating === 'jackpot' ? <Spinner /> : 'Cập nhật'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {feedback && (
                <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white animate-fade-in-up ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
