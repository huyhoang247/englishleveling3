import React, { useState, useEffect, useCallback } from 'react';
import { uiAssets, equipmentUiAssets } from './game-assets.ts'; 
import { adminUpdateUserData, fetchOrCreateUserGameData, UserGameData, updateJackpotPool, fetchAllUsers, SimpleUser } from './gameDataService.ts';

type ImageSourcePropType = any;

interface AdminPanelProps {
    onClose: () => void;
}

// --- START: CÁC COMPONENT GIAO DIỆN CHUNG ---

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

const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Icon {...props}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></Icon>
);

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Icon {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></Icon>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Icon {...props}><polyline points="20 6 9 17 4 12"></polyline></Icon>
);

const AdminHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-[53px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-cyan-400">Admin Panel</h2>
            <button onClick={onClose} className="text-4xl text-slate-400 hover:text-white transition-colors">&times;</button>
        </div>
    </header>
);

const AdminTabs: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: 'user', label: 'User Management', icon: UserIcon },
        { name: 'userlist', label: 'User List', icon: ListIcon },
        { name: 'system', label: 'System', icon: SettingsIcon },
    ];
    return (
        <nav className="max-w-[1600px] mx-auto flex items-center gap-2 px-4 sm:px-6 lg:px-8 overflow-x-auto">
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

const UserListTab: React.FC<{ setActiveTab: (tab: string) => void; setTargetUserId: (id: string) => void; showFeedback: (type: 'success' | 'error', message: string) => void; }> = ({ setActiveTab, setTargetUserId, showFeedback }) => {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userList = await fetchAllUsers();
        setUsers(userList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleCopy = (uid: string) => {
    navigator.clipboard.writeText(uid)
      .then(() => {
        setCopiedUid(uid);
        showFeedback('success', `Copied UID: ${uid}`);
        setTimeout(() => setCopiedUid(null), 2000);
      })
      .catch(err => {
        showFeedback('error', 'Failed to copy.');
        console.error('Failed to copy: ', err);
      });
  };

  const handleSelectUser = (uid: string) => {
      setTargetUserId(uid);
      setActiveTab('user');
  };

  if (isLoading) return <div className="flex justify-center items-center h-32"><Spinner /></div>;
  if (error) return <div className="text-red-500 text-center p-4 bg-red-900/50 rounded-lg">{error}</div>;

  const searchTerm = filter.toLowerCase();
  const filteredUsers = users.filter(u => 
      u.uid.toLowerCase().includes(searchTerm) ||
      u.username?.toLowerCase().includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold text-cyan-300 pb-2 mb-3">User List ({users.length})</h3>
        <input 
            type="text" 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            placeholder="Search UID, Username, Email..." 
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
        <div className="bg-slate-800/50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1.5fr_2fr_3fr_auto] gap-4 px-4 py-2 border-b border-slate-700 bg-slate-900/50 font-semibold text-sm text-slate-300">
                <div>UID</div>
                <div>Username</div>
                <div>Email</div>
                <div className="text-right">Actions</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <div key={user.uid} className="grid grid-cols-[1.5fr_2fr_3fr_auto] gap-4 px-4 py-3 items-center border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-150 text-sm">
                        <span 
                            className="font-mono text-slate-300 cursor-pointer hover:text-cyan-400 truncate"
                            onClick={() => handleSelectUser(user.uid)}
                            title={`Click to manage\n${user.uid}`}
                        >
                            {user.uid.substring(0, 5)}...
                        </span>
                        <span className="text-slate-200 truncate" title={user.username}>{user.username || <span className="text-slate-500">N/A</span>}</span>
                        <span className="text-slate-400 truncate" title={user.email}>{user.email || <span className="text-slate-500">N/A</span>}</span>
                        <div className="flex justify-end">
                            <button 
                                onClick={() => handleCopy(user.uid)}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copy UID"
                            >
                                {copiedUid === user.uid ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-4 text-center text-slate-400">No users found.</div>
                )}
            </div>
        </div>
    </div>
  );
};

const initialUpdateValues = { coins: 0, gems: 0, ancientBooks: 0, equipmentPieces: 0, pickaxes: 0, hp: 0, atk: 0, def: 0, jackpot: 0 };
type UpdateValuesType = typeof initialUpdateValues;

interface IconWithTooltipProps {
    iconSrc: ImageSourcePropType | string;
    label: string;
}
const IconWithTooltip: React.FC<IconWithTooltipProps> = ({ iconSrc, label }) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    return (
        <div className="relative flex items-center justify-center">
            <button
                onClick={() => setTooltipVisible(!tooltipVisible)}
                onBlur={() => setTooltipVisible(false)}
                className="p-1 rounded-full hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <img src={iconSrc as string} alt={label} className="w-8 h-8 object-contain" />
            </button>
            {tooltipVisible && (
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 border border-slate-600 text-white text-xs font-semibold rounded-md shadow-lg z-10 whitespace-nowrap">
                    {label}
                </div>
            )}
        </div>
    );
};

interface ActionRowProps {
    label: string;
    iconSrc: ImageSourcePropType | string;
    fieldName: keyof UpdateValuesType;
    dbKey: string;
    value: number;
    isUpdating: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpdate: (fieldName: keyof UpdateValuesType, dbKey: string) => void;
}
const ActionRow: React.FC<ActionRowProps> = ({ label, iconSrc, fieldName, dbKey, value, isUpdating, onChange, onUpdate }) => (
    <div className="flex items-center space-x-4">
        <div className="w-16 flex-shrink-0">
            <IconWithTooltip iconSrc={iconSrc} label={label} />
        </div>
        <input 
            type="number" name={fieldName} value={value} onChange={onChange} 
            className="flex-grow w-full min-w-0 text-right font-mono bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button 
            onClick={() => onUpdate(fieldName, dbKey)} 
            disabled={isUpdating}
            className="w-28 flex-shrink-0 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-500 text-white font-bold py-1 px-3 rounded transition-colors flex items-center justify-center">
            {isUpdating ? <Spinner /> : 'Update'}
        </button>
    </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('user');
    const [targetUserId, setTargetUserId] = useState('');
    const [userData, setUserData] = useState<UserGameData | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [updateValues, setUpdateValues] = useState<UpdateValuesType>(initialUpdateValues);
    
    const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    }, []);

    const handleFetchUser = useCallback(async () => {
        if (!targetUserId) { showFeedback('error', 'Please enter a User ID.'); return; }
        setIsFetching(true); 
        setUserData(null);
        try {
            const data = await fetchOrCreateUserGameData(targetUserId);
            setUserData(data);
            setUpdateValues(prev => ({
                ...prev,
                coins: data.coins,
                gems: data.gems,
                ancientBooks: data.ancientBooks,
                equipmentPieces: data.equipment.pieces,
                pickaxes: data.pickaxes,
                hp: data.stats.hp,
                atk: data.stats.atk,
                def: data.stats.def,
            }));
            showFeedback('success', `Loaded data for user: ${targetUserId}`);
        } catch (error) {
            console.error(error); 
            showFeedback('error', error instanceof Error ? error.message : 'User not found.');
        } finally { 
            setIsFetching(false); 
        }
    }, [targetUserId, showFeedback]);
    
    useEffect(() => {
        if (targetUserId && activeTab === 'user') {
            handleFetchUser();
        }
    }, [targetUserId, activeTab, handleFetchUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateValues(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleUpdate = async (field: keyof UpdateValuesType, dbKey: string) => {
        if (!userData || !targetUserId) { showFeedback('error', 'Please select a user first.'); return; }
        const newValue = updateValues[field];
        let oldValue;
        switch(field) {
            case 'coins':           oldValue = userData.coins; break;
            case 'gems':            oldValue = userData.gems; break;
            case 'ancientBooks':    oldValue = userData.ancientBooks; break;
            case 'equipmentPieces': oldValue = userData.equipment.pieces; break;
            case 'pickaxes':        oldValue = userData.pickaxes; break;
            case 'hp':              oldValue = userData.stats.hp; break;
            case 'atk':             oldValue = userData.stats.atk; break;
            case 'def':             oldValue = userData.stats.def; break;
            default: showFeedback('error', 'Invalid data field.'); return;
        }

        const amountToUpdate = newValue - oldValue;
        if (amountToUpdate === 0) { showFeedback('error', 'New value must be different from the current value.'); return; }
        
        setIsUpdating(field);
        try {
            const updatedData = await adminUpdateUserData(targetUserId, { [dbKey]: amountToUpdate });
            setUserData(updatedData);
            setUpdateValues(prev => ({
                ...prev,
                coins: updatedData.coins,
                gems: updatedData.gems,
                ancientBooks: updatedData.ancientBooks,
                equipmentPieces: updatedData.equipment.pieces,
                pickaxes: updatedData.pickaxes,
                hp: updatedData.stats.hp,
                atk: updatedData.stats.atk,
                def: updatedData.stats.def,
            }));
            showFeedback('success', `${field} updated successfully!`);
        } catch (error) {
            console.error(error); 
            showFeedback('error', `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setUpdateValues(prev => ({ ...prev, [field]: oldValue }));
        } finally { 
            setIsUpdating(null); 
        }
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
                <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-600 pb-2 mb-3">Current Data</h3>
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
    
    return (
        <div className="fixed inset-0 bg-[#0a0a14] text-white z-[100] flex flex-col">
            <AdminHeader onClose={onClose} />
            <div className="flex-shrink-0 bg-[#0a0a14] border-b border-slate-800/70 shadow-md pt-2">
                <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex-1 relative overflow-y-auto [background-image:radial-gradient(circle_at_center,_#16213e,_#0a0a14)]">
                <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'user' && (
                            <div className="animate-fade-in">
                                <div className="mb-6">
                                    <label htmlFor="userIdInput" className="block text-sm font-medium text-slate-300 mb-1">User ID</label>
                                    <div className="flex space-x-2">
                                        <input id="userIdInput" type="text" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="Enter User ID or select from list..." className="flex-grow bg-slate-800 border border-slate-600 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                        <button onClick={handleFetchUser} disabled={isFetching || !targetUserId} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center w-32">
                                            {isFetching ? <Spinner /> : 'Load Data'}
                                        </button>
                                    </div>
                                </div>
                                {renderUserData()}
                                {userData && (
                                    <div className="mt-6 space-y-4 animate-fade-in">
                                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-600 pb-2 mb-3">Edit Resources</h3>
                                        <ActionRow label="Coins" iconSrc={uiAssets.statCoinIcon} fieldName="coins" dbKey="coins" value={updateValues.coins} isUpdating={isUpdating === 'coins'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        <ActionRow label="Gems" iconSrc={uiAssets.gemIcon} fieldName="gems" dbKey="gems" value={updateValues.gems} isUpdating={isUpdating === 'gems'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        <ActionRow label="Ancient Books" iconSrc={uiAssets.bookIcon} fieldName="ancientBooks" dbKey="ancientBooks" value={updateValues.ancientBooks} isUpdating={isUpdating === 'ancientBooks'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        <ActionRow label="Equipment Pieces" iconSrc={equipmentUiAssets.equipmentPieceIcon} fieldName="equipmentPieces" dbKey="equipment.pieces" value={updateValues.equipmentPieces} isUpdating={isUpdating === 'equipmentPieces'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        <ActionRow label="Pickaxes" iconSrc={uiAssets.inventoryIcon} fieldName="pickaxes" dbKey="pickaxes" value={updateValues.pickaxes} isUpdating={isUpdating === 'pickaxes'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        
                                        <h3 className="text-lg font-semibold text-cyan-300 border-b border-slate-600 pb-2 mb-3 pt-4">Edit Stats</h3>
                                        <ActionRow label="HP Level" iconSrc={uiAssets.statHpIcon} fieldName="hp" dbKey="stats.hp" value={updateValues.hp} isUpdating={isUpdating === 'hp'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        <ActionRow label="ATK Level" iconSrc={uiAssets.statAtkIcon} fieldName="atk" dbKey="stats.atk" value={updateValues.atk} isUpdating={isUpdating === 'atk'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                        <ActionRow label="DEF Level" iconSrc={uiAssets.statDefIcon} fieldName="def" dbKey="stats.def" value={updateValues.def} isUpdating={isUpdating === 'def'} onChange={handleInputChange} onUpdate={handleUpdate} />
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'userlist' && <UserListTab setActiveTab={setActiveTab} setTargetUserId={setTargetUserId} showFeedback={showFeedback} />}
                        {activeTab === 'system' && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-semibold text-cyan-300 pb-2 mb-3">General System</h3>
                                <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <p className="w-32 flex-shrink-0 text-slate-300">Jackpot Pool:</p>
                                        <input type="number" name="jackpot" value={updateValues.jackpot} onChange={handleInputChange} className="flex-grow bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="+/-" />
                                        <button onClick={handleUpdateJackpot} disabled={isUpdating !== null} className="w-24 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-500 text-white font-bold py-1 px-3 rounded transition-colors flex items-center justify-center">
                                            {isUpdating === 'jackpot' ? <Spinner /> : 'Update'}
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
