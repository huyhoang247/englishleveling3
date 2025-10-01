import React, { useState, useEffect } from 'react';

// --- Icon Component ---
// Using inline SVG to avoid external libraries
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="http://www.w3.org/24/24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

// --- Specific Icons ---
const ICONS = {
  sword: "M12.984 2.016l4.5 4.5c0.188 0.188 0.352 0.516 0.352 0.844v3.422l-9.047 9.047c-0.234 0.234-0.516 0.352-0.844 0.352h-2.25c-0.328 0-0.609-0.117-0.844-0.352l-2.016-2.016c-0.234-0.234-0.352-0.516-0.352-0.844v-2.25c0-0.328 0.117-0.609 0.352-0.844l9.047-9.047h3.422c0.328 0 0.656 0.164 0.844 0.352zM14.25 4.688l-9.141 9.141v1.594h1.594l9.141-9.141v-1.594h-1.594zM16.5 3l3.75 3.75-6.188 6.188-3.75-3.75z",
  shield: "M12 1.09375l-9 4.5v6.09375c0 4.57812 3.82812 8.42188 9 9.28125c5.17188-0.85937 9-4.70313 9-9.28125v-6.09375l-9-4.5zM12 3.92188l6.75 3.375v4.40624c0 3.23438-2.67187 5.90625-6.75 6.64063c-4.07812-0.73438-6.75-3.40625-6.75-6.64063v-4.40624z",
  potion: "M15 3c-0.828 0-1.5 0.672-1.5 1.5v1.5h-3v-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5v1.5h-1.5c-0.828 0-1.5 0.672-1.5 1.5s0.672 1.5 1.5 1.5h1.5v10.5c0 0.828 0.672 1.5 1.5 1.5h6c0.828 0 1.5-0.672 1.5-1.5v-10.5h1.5c0.828 0 1.5-0.672 1.5-1.5s-0.672-1.5-1.5-1.5h-1.5v-1.5c0-0.828-0.672-1.5-1.5-1.5zM9 19.5v-10.5h6v10.5z",
  chest: "M5.25 5.25c-0.828 0-1.5 0.672-1.5 1.5v1.5h15v-1.5c0-0.828-0.672-1.5-1.5-1.5zM3.75 9.75v7.5c0 0.828 0.672 1.5 1.5 1.5h13.5c0.828 0 1.5-0.672 1.5-1.5v-7.5h-16.5zM11.25 12.75h1.5v3h-1.5z",
  cog: "M12 8.25c-2.078 0-3.75 1.672-3.75 3.75s1.672 3.75 3.75 3.75 3.75-1.672 3.75-3.75-1.672-3.75-3.75-3.75zM12 14.25c-1.25 0-2.25-1-2.25-2.25s1-2.25 2.25-2.25 2.25 1 2.25 2.25-1 2.25-2.25 2.25zM22.5 12.75h-1.781c-0.141 0.703-0.375 1.359-0.656 1.969l1.266 1.266c0.234 0.234 0.352 0.516 0.352 0.844s-0.117 0.609-0.352 0.844l-1.063 1.063c-0.234 0.234-0.516 0.352-0.844 0.352s-0.609-0.117-0.844-0.352l-1.266-1.266c-0.609 0.281-1.266 0.516-1.969 0.656v1.781c0 0.828-0.672 1.5-1.5 1.5h-1.5c-0.828 0-1.5-0.672-1.5-1.5v-1.781c-0.703-0.141-1.359-0.375-1.969-0.656l-1.266 1.266c-0.234 0.234-0.516 0.352-0.844 0.352s-0.609-0.117-0.844-0.352l-1.063-1.063c-0.234-0.234-0.352-0.516-0.352-0.844s0.117-0.609 0.352-0.844l1.266-1.266c-0.281-0.609-0.516-1.266-0.656-1.969h-1.781c-0.828 0-1.5-0.672-1.5-1.5v-1.5c0-0.828 0.672-1.5 1.5-1.5h1.781c0.141-0.703 0.375-1.359 0.656-1.969l-1.266-1.266c-0.234-0.234-0.352-0.516-0.352-0.844s0.117-0.609 0.352-0.844l1.063-1.063c0.234-0.234 0.516 0.352 0.844 0.352s0.609 0.117 0.844 0.352l1.266 1.266c0.609-0.281 1.266-0.516 1.969-0.656v-1.781c0-0.828 0.672-1.5 1.5-1.5h1.5c0.828 0 1.5 0.672 1.5 1.5v1.781c0.703 0.141 1.359 0.375 1.969 0.656l1.266-1.266c0.234-0.234 0.516-0.352 0.844-0.352s0.609 0.117 0.844 0.352l1.063 1.063c0.234 0.234 0.352 0.516 0.352 0.844s-0.117 0.609-0.352-0.844l-1.266 1.266c0.281 0.609 0.516 1.266 0.656 1.969h1.781c0.828 0 1.5 0.672 1.5 1.5v1.5c0 0.828-0.672 1.5-1.5 1.5z",
  map: "M12 0c-4.148 0-7.5 3.352-7.5 7.5c0 4.148 7.5 16.5 7.5 16.5s7.5-12.352 7.5-16.5c0-4.148-3.352-7.5-7.5-7.5zM12 11.25c-2.078 0-3.75-1.672-3.75-3.75s1.672-3.75 3.75-3.75 3.75 1.672 3.75 3.75-1.672 3.75-3.75 3.75z",
  camera: "M6 6c-1.657 0-3 1.343-3 3v9c0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3v-9c0-1.657-1.343-3-3-3h-2.25l-1.5-1.5h-4.5l-1.5 1.5h-2.25zm6 12c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z",
  close: "M6.46875 4.96875l-1.5 1.5 5.53125 5.53125-5.53125 5.53125 1.5 1.5 5.53125-5.53125 5.53125 5.53125 1.5-1.5-5.53125-5.53125 5.53125-5.53125-1.5-1.5-5.53125 5.53125z",
  gem: "M12 0.75l-4.5 4.5h9zM12 23.25l4.5-4.5h-9zM6 6l-5.25 5.25v1.5l5.25 5.25h12l5.25-5.25v-1.5l-5.25-5.25z",
  star: "M12 17.25l-6.1875 3.25 1.1875-6.875-5-4.875h6.1875l2.8125-6.25 2.8125 6.25h6.1875l-5 4.875 1.1875 6.875z",
  trendingUp: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  users: "M9 8.25c-2.07 0-3.75-1.68-3.75-3.75S6.93.75 9 .75s3.75 1.68 3.75 3.75S11.07 8.25 9 8.25zm5.18 2.53c-1.28-1-2.9-1.53-4.68-1.53H9c-1.78 0-3.4.53-4.68 1.53C2.43 12.06 1.5 14.16 1.5 16.5v1.5c0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5v-1.5c0-2.34-.93-4.44-2.82-5.72zM22.5 16.5c0-1.23-.42-2.34-1.13-3.25.34-.11.68-.24 1.02-.38 1.13-.48 1.86-1.63 1.86-2.99 0-1.77-1.43-3.2-3.2-3.2-1.3 0-2.4.77-2.92 1.84-.6-.2-1.26-.34-1.97-.34-1.2 0-2.31.33-3.28.89.29.3.56.63.79 1 .53-.25 1.12-.4 1.74-.4.18 0 .36 0 .53.02 1.77.18 3.16 1.63 3.16 3.48z"
};

// --- Child Components ---

const StatBar = ({ label, value, maxValue, icon }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <Icon path={icon} className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-semibold text-slate-200">{label}</span>
                </div>
                <div className="flex items-center">
                    <div className="text-sm font-mono bg-black/30 px-2 py-0.5 rounded-l-md text-blue-400">
                        {value}
                    </div>
                    <div className="text-sm font-mono bg-blue-900/40 px-2 py-0.5 rounded-r-md text-blue-300">
                        {maxValue}
                    </div>
                </div>
            </div>
            
            <div className="h-4 bg-gray-900/50 rounded-full overflow-hidden shadow-inner p-0.5">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ icon, label, hasToggle }) => {
  const [toggle, setToggle] = useState(false);
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border-2 border-slate-700 hover:bg-slate-700/70 hover:border-purple-500 transition-all duration-300 cursor-pointer shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="text-purple-400">
          <Icon path={icon} />
        </div>
        <span className="text-slate-200 font-semibold">{label}</span>
      </div>
      {hasToggle ? (
        <div onClick={() => setToggle(!toggle)} className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${toggle ? 'bg-green-500' : 'bg-slate-600'}`}>
          <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${toggle ? 'translate-x-7' : ''}`}></div>
        </div>
      ) : (
        <Icon path="M8.25 4.5l7.5 7.5-7.5 7.5" className="w-5 h-5 text-slate-500" />
      )}
    </div>
  );
};

// --- Modal Components ---

const AvatarModal = ({ isOpen, onClose, onSelectAvatar, avatars, currentAvatar }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-orbitron font-bold text-slate-100">Chọn Avatar</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon path={ICONS.close} /></button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatarUrl) => (
            <div key={avatarUrl} className="relative cursor-pointer group" onClick={() => onSelectAvatar(avatarUrl)}>
              <img src={avatarUrl} alt="Avatar choice" className={`w-full aspect-square rounded-full border-4 object-cover transition-all ${currentAvatar === avatarUrl ? 'border-green-500' : 'border-slate-700 group-hover:border-purple-500'}`}/>
               {currentAvatar === avatarUrl && (<div className="absolute inset-0 bg-green-500/30 rounded-full flex items-center justify-center"><Icon path="M4.5 12.75l6 6 9-13.5" className="w-8 h-8 text-white"/></div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, onSave, currentPlayerInfo }) => {
  const [formData, setFormData] = useState(currentPlayerInfo);
  useEffect(() => { if (isOpen) setFormData(currentPlayerInfo); }, [currentPlayerInfo, isOpen]);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSave = (e) => { e.preventDefault(); onSave(formData); onClose(); };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-roboto font-bold text-slate-100">Chỉnh Sửa Hồ Sơ</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon path={ICONS.close} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-400 mb-1">Tên Người Chơi</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-purple-400 mb-1">Danh Hiệu</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          <button type="submit" className="w-full bg-green-500 text-slate-900 font-bold py-2 rounded-lg hover:bg-green-400 transition-colors">Lưu Thay Đổi</button>
        </form>
      </div>
    </div>
  );
};

const UpgradeModal = ({ isOpen, onClose, onConfirm, currentGems, cost }) => {
    const [status, setStatus] = useState('idle'); // 'idle', 'error', 'success'

    const handleConfirm = () => {
        if (currentGems >= cost) {
            setStatus('success');
            onConfirm();
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 1500);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon path={ICONS.close} /></button>
                </div>
                <Icon path={ICONS.star} className="w-16 h-16 text-yellow-400 mx-auto -mt-4 mb-2" />
                <h2 className="text-2xl font-orbitron font-bold text-slate-100">Nâng Cấp Premium</h2>
                <p className="text-slate-400 mt-2 mb-6">Mở khóa các tính năng độc quyền, nhận diện cao cấp và nhiều phần thưởng hơn!</p>
                
                <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-slate-300">Chi phí:</span>
                        <div className="flex items-center space-x-2 font-bold text-yellow-400">
                            <Icon path={ICONS.gem} className="w-5 h-5" />
                            <span>{cost}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-slate-400">Gems của bạn:</span>
                        <div className="flex items-center space-x-2 font-mono text-slate-200">
                            <Icon path={ICONS.gem} className="w-4 h-4 text-cyan-400" />
                            <span>{currentGems}</span>
                        </div>
                    </div>
                </div>

                {status === 'idle' && (
                    <button onClick={handleConfirm} className="w-full bg-yellow-500 text-slate-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg">Xác Nhận Nâng Cấp</button>
                )}
                {status === 'error' && (
                    <p className="text-red-500 font-bold py-3">Không đủ Gems để nâng cấp!</p>
                )}
                {status === 'success' && (
                    <p className="text-green-500 font-bold py-3">Nâng cấp thành công!</p>
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function GameProfile() {
  const [modals, setModals] = useState({ avatar: false, edit: false, upgrade: false });
  const [currentAvatar, setCurrentAvatar] = useState('https://robohash.org/Player.png?set=set4&bgset=bg1');
  const [playerInfo, setPlayerInfo] = useState({
      name: 'CyberWarrior',
      title: 'Lv. 42 - Elite Vanguard',
      accountType: 'Normal', // 'Normal' or 'Premium'
      gems: 250,
      exp: 420,
      maxExp: 1500
  });
  
  const UPGRADE_COST = 500;

  const avatarOptions = [ 'https://robohash.org/Cyber.png?set=set2&bgset=bg1', 'https://robohash.org/Warrior.png?set=set4&bgset=bg2', 'https://robohash.org/Glitch.png?set=set3&bgset=bg1', 'https://robohash.org/Sentinel.png?set=set1&bgset=bg2', 'https://robohash.org/Phantom.png?set=set4&bgset=bg1', 'https://robohash.org/Jester.png?set=set2&bgset=bg2' ];

  const handleModal = (modal, state) => setModals(prev => ({ ...prev, [modal]: state }));

  const handleSelectAvatar = (avatarUrl) => {
      setCurrentAvatar(avatarUrl);
      handleModal('avatar', false);
  };
  
  const handleSaveProfile = (newInfo) => {
      setPlayerInfo(prev => ({ ...prev, ...newInfo }));
  };

  const handleUpgrade = () => {
    setPlayerInfo(prev => ({
        ...prev,
        accountType: 'Premium',
        gems: prev.gems - UPGRADE_COST
    }));
  };

  return (
    <div className="bg-slate-900 min-h-screen font-sans text-white p-4 flex justify-center items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@400;500;700&display=swap'); 
        .font-orbitron { font-family: 'Orbitron', sans-serif; } 
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      
      <main className="w-full max-w-md bg-slate-800/30 rounded-2xl shadow-2xl shadow-purple-900/20 flex flex-col" style={{height: 'calc(100vh - 2rem)', maxHeight: '700px'}}>
        {/* --- Profile Header (Non-scrollable) --- */}
        <div className="p-6 bg-gradient-to-br from-gray-900 to-slate-900 relative flex-shrink-0">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="relative">
              <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                  <img src={currentAvatar} alt="Player Avatar" className="w-20 h-20 rounded-full border-4 border-purple-500 shadow-lg object-cover"/>
                  <button onClick={() => handleModal('avatar', true)} className="absolute -bottom-1 -right-1 bg-slate-700 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-300 hover:bg-purple-600 transition-all">
                     <Icon path={ICONS.camera} className="w-5 h-5"/>
                  </button>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-xl font-bold font-roboto text-slate-100 tracking-wider">{playerInfo.name}</h1>
                      <button onClick={() => handleModal('edit', true)} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full hover:bg-purple-600 hover:text-white transition-colors">
                        Edit
                      </button>
                  </div>
                  <p className="text-purple-400 font-semibold text-sm">{playerInfo.title}</p>
                   <div className="flex items-center space-x-2 mt-2">
                        {playerInfo.accountType === 'Premium' ? (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500 flex items-center space-x-1">
                                <Icon path={ICONS.star} className="w-3 h-3"/>
                                <span>Premium</span>
                            </span>
                        ) : (
                            <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-500">Normal</span>
                        )}
                        {playerInfo.accountType === 'Normal' && (
                            <button onClick={() => handleModal('upgrade', true)} className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full hover:bg-purple-500 transition-colors">Nâng cấp</button>
                        )}
                   </div>
                </div>
              </div>
              <div className="mt-6">
                <StatBar label="EXP" value={playerInfo.exp} maxValue={playerInfo.maxExp} icon={ICONS.trendingUp} />
              </div>
           </div>
        </div>

        {/* --- Content (Scrollable) --- */}
        <div className="p-4 pb-6 space-y-3 overflow-y-auto flex-grow no-scrollbar">
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2">Hành trang</h2>
            <MenuItem icon={ICONS.sword} label="Trang bị & Vật phẩm" />
            <MenuItem icon={ICONS.shield} label="Thành tựu" />
            <MenuItem icon={ICONS.potion} label="Cửa hàng" />
            
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">Bang hội & Bạn bè</h2>
            <MenuItem icon={ICONS.users} label="Danh sách bạn bè" />
            <MenuItem icon={ICONS.shield} label="Bang hội của tôi" />
            
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">Hệ thống</h2>
            <MenuItem icon={ICONS.cog} label="Cài đặt Giao diện" hasToggle={true} />
            <MenuItem icon={ICONS.map} label="Lịch sử Phiêu lưu" />
            <MenuItem icon={ICONS.chest} label="Kho báu" />
            <MenuItem icon={ICONS.cog} label="Âm thanh" hasToggle={true} />
            <MenuItem icon={ICONS.map} label="Đăng xuất" />
        </div>
      </main>

      {/* --- Render Modals --- */}
      <AvatarModal isOpen={modals.avatar} onClose={() => handleModal('avatar', false)} onSelectAvatar={handleSelectAvatar} avatars={avatarOptions} currentAvatar={currentAvatar}/>
      <EditProfileModal isOpen={modals.edit} onClose={() => handleModal('edit', false)} onSave={handleSaveProfile} currentPlayerInfo={playerInfo}/>
      <UpgradeModal isOpen={modals.upgrade} onClose={() => handleModal('upgrade', false)} onConfirm={handleUpgrade} currentGems={playerInfo.gems} cost={UPGRADE_COST}/>
    </div>
  );
}

