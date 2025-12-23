// --- START OF FILE profile.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import { 
    updateProfileInfo, 
    updateAvatar, 
    performPremiumUpgrade,
} from './profileService.ts'; 
import { auth } from '../firebase'; 
import { useGame } from '../GameContext.tsx'; 
import WorkoutApp from '../workout/workout.tsx'; 

// --- CÁC ĐỊNH NGHĨA GÓI VIP ---
const VIP_PACKAGES = [
  { id: 'vip_7', days: 7, cost: 200, label: 'Starter', color: 'from-blue-500 to-cyan-500' },
  { id: 'vip_14', days: 14, cost: 350, label: 'Pro', color: 'from-purple-500 to-pink-500', popular: true },
  { id: 'vip_30', days: 30, cost: 600, label: 'Legend', color: 'from-yellow-500 to-orange-600', discount: 'Save 200!' }
];

type DisplayMode = 'fullscreen' | 'normal';

// --- HÀM HELPER VÀ ICON ---
const enterFullScreen = async () => {
  const element = document.documentElement;
  try {
    if (element.requestFullscreen) { await element.requestFullscreen(); }
    else if ((element as any).mozRequestFullScreen) { await (element as any).mozRequestFullScreen(); }
    else if ((element as any).webkitRequestFullscreen) { await (element as any).webkitRequestFullscreen(); }
    else if ((element as any).msRequestFullscreen) { await (element as any).msRequestFullscreen(); }
  } catch (error) { console.warn("Failed to enter full-screen mode:", error); }
};

const exitFullScreen = async () => {
  try {
    if (document.exitFullscreen) { await document.exitFullscreen(); }
    else if ((document as any).mozCancelFullScreen) { await (document as any).mozCancelFullScreen(); }
    else if ((document as any).webkitExitFullscreen) { await (document as any).webkitExitFullscreen(); }
    else if ((document as any).msExitFullscreen) { await (document as any).msExitFullscreen(); }
  } catch (error) { console.warn("Failed to exit full-screen mode:", error); }
};

const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const ASSET_CACHE_PREFIX = 'english-leveling-assets';

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const ICONS = {
  sword: "M12.984 2.016l4.5 4.5c0.188 0.188 0.352 0.516 0.352 0.844v3.422l-9.047 9.047c-0.234 0.234-0.516 0.352-0.844 0.352h-2.25c-0.328 0-0.609-0.117-0.844-0.352l-2.016-2.016c-0.234-0.234-0.352-0.516-0.352-0.844v-2.25c0-0.328 0.117-0.609 0.352-0.844l9.047-9.047h3.422c0.328 0 0.656 0.164 0.844 0.352zM14.25 4.688l-9.141 9.141v1.594h1.594l9.141-9.141v-1.594h-1.594zM16.5 3l3.75 3.75-6.188 6.188-3.75-3.75z",
  shield: "M12 1.09375l-9 4.5v6.09375c0 4.57812 3.82812 8.42188 9 9.28125c5.17188-0.85937 9-4.70313 9-9.28125v-6.09375l-9-4.5zM12 3.92188l6.75 3.375v4.40624c0 3.23438-2.67187 5.90625-6.75 6.64063c-4.07812-0.73438-6.75-3.40625-6.75-6.64063v-4.40624z",
  potion: "M15 3c-0.828 0-1.5 0.672-1.5 1.5v1.5h-3v-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5v1.5h-1.5c-0.828 0-1.5 0.672-1.5 1.5s0.672 1.5 1.5 1.5h1.5v10.5c0 0.828 0.672 1.5 1.5 1.5h6c0.828 0 1.5-0.672 1.5-1.5v-10.5h1.5c0.828 0 1.5-0.672 1.5-1.5s-0.672-1.5-1.5-1.5h-1.5v-1.5c0-0.828-0.672-1.5-1.5-1.5zM9 19.5v-10.5h6v10.5z",
  chest: "M5.25 5.25c-0.828 0-1.5 0.672-1.5 1.5v1.5h15v-1.5c0-0.828-0.672-1.5-1.5-1.5zM3.75 9.75v7.5c0 0.828 0.672 1.5 1.5 1.5h13.5c0.828 0 1.5-0.672 1.5-1.5v-7.5h-16.5zM11.25 12.75h1.5v3h-1.5z",
  cog: "M12 8.25c-2.078 0-3.75 1.672-3.75 3.75s1.672 3.75 3.75 3.75 3.75-1.672 3.75-3.75-1.672-3.75-3.75-3.75zM12 14.25c-1.25 0-2.25-1-2.25-2.25s1-2.25 2.25-2.25 2.25 1 2.25 2.25-1 2.25-2.25 2.25zM22.5 12.75h-1.781c-0.141 0.703-0.375 1.359-0.656 1.969l1.266 1.266c0.234 0.234 0.352 0.516 0.352 0.844s-0.117 0.609-0.352 0.844l-1.063 1.063c-0.234 0.234-0.516 0.352-0.844 0.352s-0.609-0.117-0.844-0.352l-1.266-1.266c-0.609 0.281-1.266 0.516-1.969 0.656v1.781c0 0.828-0.672 1.5-1.5 1.5h-1.5c-0.828 0-1.5-0.672-1.5-1.5v-1.781c-0.703-0.141-1.359-0.375-1.969-0.656l-1.266 1.266c-0.234 0.234-0.516 0.352-0.844 0.352s-0.609-0.117-0.844-0.352l-1.063-1.063c-0.234 0.234-0.352-0.516-0.352-0.844s0.117-0.609 0.352-0.844l1.266-1.266c-0.281-0.609-0.516-1.266-0.656-1.969h-1.781c-0.828 0-1.5-0.672-1.5-1.5v-1.5c0-0.828 0.672-1.5 1.5-1.5h1.781c0.141-0.703 0.375-1.359 0.656-1.969l-1.266-1.266c-0.234-0.234-0.352-0.516-0.352-0.844s0.117-0.609 0.352-0.844l1.063-1.063c0.234 0.234 0.516 0.352 0.844 0.352s0.609 0.117 0.844 0.352l1.266 1.266c0.609-0.281 1.266-0.516 1.969-0.656v-1.781c0-0.828 0.672-1.5 1.5-1.5h1.5c0.828 0 1.5 0.672 1.5 1.5v1.781c0.703 0.141 1.359 0.375 1.969 0.656l1.266-1.266c0.234-0.234 0.516-0.352 0.844-0.352s0.609 0.117 0.844 0.352l1.063 1.063c0.234 0.234 0.352 0.516 0.352 0.844s-0.117 0.609-0.352-0.844l-1.266 1.266c0.281 0.609 0.516 1.266 0.656 1.969h1.781c0.828 0 1.5 0.672 1.5 1.5v1.5c0 0.828-0.672 1.5-1.5 1.5z",
  map: "M12 0c-4.148 0-7.5 3.352-7.5 7.5c0 4.148 7.5 16.5 7.5 16.5s7.5-12.352 7.5-16.5c0-4.148-3.352-7.5-7.5-7.5zM12 11.25c-2.078 0-3.75-1.672-3.75-3.75s1.672-3.75 3.75-3.75 3.75 1.672 3.75 3.75-1.672 3.75-3.75 3.75z",
  camera: "M6 6c-1.657 0-3 1.343-3 3v9c0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3v-9c0-1.657-1.343-3-3-3h-2.25l-1.5-1.5h-4.5l-1.5 1.5h-2.25zm6 12c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z",
  close: "M6.46875 4.96875l-1.5 1.5 5.53125 5.53125-5.53125 5.53125 1.5 1.5 5.53125-5.53125 5.53125 5.53125 1.5-1.5-5.53125-5.53125 5.53125-5.53125-1.5-1.5-5.53125 5.53125z",
  gem: "M12 0.75l-4.5 4.5h9zM12 23.25l4.5-4.5h-9zM6 6l-5.25 5.25v1.5l5.25 5.25h12l5.25-5.25v-1.5l-5.25-5.25z",
  star: "M12 17.25l-6.1875 3.25 1.1875-6.875-5-4.875h6.1875l2.8125-6.25 2.8125 6.25h6.1875l-5 4.875 1.1875 6.875z",
  trendingUp: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  users: "M9 8.25c-2.07 0-3.75-1.68-3.75-3.75S6.93.75 9 .75s3.75 1.68 3.75 3.75S11.07 8.25 9 8.25zm5.18 2.53c-1.28-1-2.9-1.53-4.68-1.53H9c-1.78 0-3.4.53-4.68 1.53C2.43 12.06 1.5 14.16 1.5 16.5v1.5c0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5v-1.5c0-2.34-.93-4.44-2.82-5.72zM22.5 16.5c0-1.23-.42-2.34-1.13-3.25.34-.11.68-.24 1.02-.38 1.13-.48 1.86-1.63 1.86-2.99 0-1.77-1.43-3.2-3.2-3.2-1.3 0-2.4.77-2.92 1.84-.6-.2-1.26-.34-1.97-.34-1.2 0-2.31.33-3.28.89.29.3.56.63.79 1 .53-.25 1.12-.4 1.74-.4.18 0 .36 0 .53.02 1.77.18 3.16 1.63 3.16 3.48z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  checkCircle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  dumbbell: "M4 9h3v6H4V9zM1 10v4a1 1 0 0 0 1 1h2v-6H2a1 1 0 0 0-1 1zm15-5v14a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm8-1a1 1 0 0 0-1-1h-2v14h2a1 1 0 0 0 1-1V5zM9 4v16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z",
  crown: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
};

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
const DisplayModeSelector: React.FC<{
    currentMode: DisplayMode;
    onModeChange: (mode: DisplayMode) => void;
}> = ({ currentMode, onModeChange }) => {
    const isFullscreen = currentMode === 'fullscreen';
    const handleToggle = () => onModeChange(isFullscreen ? 'normal' : 'fullscreen');

    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border-2 border-slate-700 shadow-lg">
            <div className="flex items-center space-x-4">
                <div>
                    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/fullscreen.webp" alt="Fullscreen Icon" className="w-6 h-6" />
                </div>
                <span className="text-slate-200 font-semibold">Full Screen Mode</span>
            </div>
            <div onClick={handleToggle} className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isFullscreen ? 'bg-green-500' : 'bg-slate-600'}`}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isFullscreen ? 'translate-x-7' : ''}`}></div>
            </div>
        </div>
    );
};
const CacheInfoItem: React.FC<{
    usage: number;
    quota: number;
    onClearCache: () => void;
    isLoading: boolean;
}> = ({ usage, quota, onClearCache, isLoading }) => {
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;
    
    return (
        <div className="p-4 bg-slate-800/50 rounded-lg border-2 border-slate-700 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/cache.webp" alt="Cache Icon" className="w-6 h-6" />
                    <span className="text-slate-200 font-semibold">Cache</span>
                </div>
                <button 
                    onClick={onClearCache}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-md hover:bg-red-500/20 transition-colors"
                >
                    <Icon path={ICONS.trash} className="w-4 h-4" />
                    <span>Delete</span>
                </button>
            </div>
            {isLoading ? (
                <div className="text-sm text-slate-400 animate-pulse">Checking storage capacity...</div>
            ) : (
                <>
                    <div className="h-2.5 bg-gray-900/50 rounded-full overflow-hidden w-full">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage.toFixed(2)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>{formatBytes(usage)} used</span>
                        <span>Total: {formatBytes(quota)}</span>
                    </div>
                </>
            )}
        </div>
    );
};
const AvatarModal = ({ isOpen, onClose, onSelectAvatar, avatars, currentAvatar }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-roboto font-bold text-slate-100">Select Avatar</h2>
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
          <h2 className="text-xl font-roboto font-bold text-slate-100">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon path={ICONS.close} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-400 mb-1">Player Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-purple-400 mb-1">Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          <button type="submit" className="w-full bg-green-500 text-slate-900 font-bold py-2 rounded-lg hover:bg-green-400 transition-colors">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

// --- UPDATED UPGRADE MODAL ---
const UpgradeModal = ({ isOpen, onClose, onConfirm, currentGems }) => {
    const [status, setStatus] = useState('idle'); // 'idle', 'error', 'success'
    const [selectedPkg, setSelectedPkg] = useState(VIP_PACKAGES[1]); // Mặc định chọn gói giữa

    const handleConfirm = async () => {
        if (currentGems >= selectedPkg.cost) {
            try {
                // Pass số ngày và cost của gói đã chọn
                await onConfirm(selectedPkg.days, selectedPkg.cost);
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                }, 1500);
            } catch (error) {
                console.error("Upgrade failed:", error);
                setStatus('error');
                setTimeout(() => setStatus('idle'), 2000);
            }
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] w-full max-w-md p-6 text-center overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-70"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>

                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border-2 border-yellow-500 shadow-lg mb-2">
                         <Icon path={ICONS.crown} className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">
                        VIP MEMBERSHIP
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Boost XP, Exclusive Badge & More!</p>
                </div>

                {/* Grid Packages */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {VIP_PACKAGES.map((pkg) => (
                        <div 
                            key={pkg.id} 
                            onClick={() => setSelectedPkg(pkg)}
                            className={`relative rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center p-2 
                                ${selectedPkg.id === pkg.id 
                                    ? 'bg-slate-800 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] scale-105 z-10' 
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'}`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-20">
                                    MOST POPULAR
                                </div>
                            )}
                            {pkg.discount && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-20">
                                    {pkg.discount}
                                </div>
                            )}
                            
                            <div className={`w-full h-1.5 rounded-full mb-2 bg-gradient-to-r ${pkg.color}`}></div>
                            <span className="text-slate-300 text-xs font-bold uppercase mb-1">{pkg.label}</span>
                            <span className="text-white font-bold text-xl font-orbitron">{pkg.days}<span className="text-xs text-slate-400 font-sans">D</span></span>
                            
                            <div className="mt-2 flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
                                <Icon path={ICONS.gem} className="w-3 h-3 text-cyan-400" />
                                <span className={`text-sm font-bold ${selectedPkg.id === pkg.id ? 'text-yellow-400' : 'text-slate-400'}`}>{pkg.cost}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center text-sm mb-4 px-2 bg-slate-800/50 py-2 rounded-lg">
                    <span className="text-slate-400">Your Gems:</span>
                    <div className="flex items-center space-x-1 font-mono text-slate-200"> 
                        <Icon path={ICONS.gem} className="w-4 h-4 text-cyan-400" /> 
                        <span className={currentGems < selectedPkg.cost ? "text-red-400" : "text-white"}>{currentGems}</span> 
                    </div>
                </div>

                {status === 'idle' && (
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-1/3 bg-slate-800 text-slate-400 font-bold py-3 rounded-xl hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">
                            Cancel
                        </button>
                        <button onClick={handleConfirm} className="w-2/3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2">
                             <span>Purchase</span>
                             <Icon path={ICONS.checkCircle} className="w-5 h-5 opacity-50"/>
                        </button>
                    </div>
                )}
                {status === 'error' && (<div className="bg-red-500/10 border border-red-500 text-red-400 font-bold py-3 rounded-xl animate-pulse">Not enough Gems!</div>)}
                {status === 'success' && (<div className="bg-green-500/10 border border-green-500 text-green-400 font-bold py-3 rounded-xl">Purchase Successful!</div>)}
            </div>
        </div>
    );
};
const SystemModal = ({ isOpen, onClose, icon, iconColor, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {icon && (
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center -mt-14 mb-4 bg-slate-800 border-4 border-slate-900 ${iconColor}`}>
            <Icon path={icon} className="w-8 h-8" />
          </div>
        )}
        <h2 className="text-2xl font-roboto font-bold text-slate-100">{title}</h2>
        <div className="text-slate-400 mt-2 mb-6">{children}</div>
        <div className="flex justify-center gap-4">
          {actions && actions.map((action, index) => (
            <button key={index} onClick={action.onClick} className={action.className}>
              {action.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---
export default function GameProfile() {
  const game = useGame();
  const user = auth.currentUser;

  const avatarOptions = [ 'https://robohash.org/Cyber.png?set=set2&bgset=bg1', 'https://robohash.org/Warrior.png?set=set4&bgset=bg2', 'https://robohash.org/Glitch.png?set=set3&bgset=bg1', 'https://robohash.org/Sentinel.png?set=set1&bgset=bg2', 'https://robohash.org/Phantom.png?set=set4&bgset=bg1', 'https://robohash.org/Jester.png?set=set2&bgset=bg2' ];

  const [modals, setModals] = useState({ avatar: false, edit: false, upgrade: false });
  const [systemModal, setSystemModal] = useState({ isOpen: false, title: '', icon: null, iconColor: '', message: '', actions: [] });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal');
  const [cacheInfo, setCacheInfo] = useState({ usage: 0, quota: 0 });
  const [isCacheLoading, setIsCacheLoading] = useState(true);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false);
  
  // --- UI HANDLERS ---
  const handleModal = (modal, state) => setModals(prev => ({ ...prev, [modal]: state }));

  const handleSelectAvatar = async (avatarUrl: string) => {
    if (!user) return;
    try {
        await updateAvatar(user.uid, avatarUrl);
        await game.refreshUserData(); 
        handleModal('avatar', false);
    } catch (error) {
        console.error("Failed to update avatar:", error);
    }
  };

  const handleSaveProfile = async (newInfo: { name: string; title: string }) => {
    if (!user) return;
    try {
        await updateProfileInfo(user.uid, newInfo);
        await game.refreshUserData(); 
    } catch (error) {
        console.error("Failed to save profile:", error);
    }
  };

  // Cập nhật hàm xử lý nâng cấp để nhận thêm tham số
  const handleUpgrade = async (days: number, cost: number) => {
    if (!user) return;
    try {
        await performPremiumUpgrade(user.uid, cost, days);
        await game.refreshUserData(); 
    } catch (error) {
        console.error("Upgrade failed:", error);
        throw error;
    }
  };

  const handleModeChange = (newMode: DisplayMode) => {
      setDisplayMode(newMode);
      localStorage.setItem('displayMode', newMode);
      if (newMode === 'fullscreen') { enterFullScreen(); } else { exitFullScreen(); }
  };
  const closeSystemModal = () => setSystemModal(prev => ({ ...prev, isOpen: false }));
  const clearAppCache = async () => {
    if (!('caches' in window)) {
      console.warn("Cache API is not supported.");
      throw new Error("Your browser does not support automatic cache clearing.");
    }
    try {
      const cacheKeys = await caches.keys();
      const cachesToDelete = cacheKeys.filter(key => key.startsWith(ASSET_CACHE_PREFIX));
      await Promise.all(cachesToDelete.map(key => caches.delete(key)));
      console.log("All application caches have been deleted:", cachesToDelete);
    } catch (error) {
      console.error("Error while clearing cache:", error);
      throw new Error("An error occurred while trying to clear the cache.");
    }
  };
  const fetchCacheData = useCallback(async () => {
    setIsCacheLoading(true);
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setCacheInfo({ usage: estimate.usage || 0, quota: estimate.quota || 0 });
      } catch (error) {
        console.error("Could not retrieve storage estimate:", error);
        setCacheInfo({ usage: 0, quota: 0 });
      }
    } else {
      console.warn("StorageManager API is not supported in this browser.");
    }
    setIsCacheLoading(false);
  }, []);
  useEffect(() => { fetchCacheData(); }, [fetchCacheData]);
  const executeCacheClear = async () => {
    setSystemModal({
      isOpen: true,
      title: 'Deleting Cache',
      icon: ICONS.trash,
      iconColor: 'text-blue-400 animate-pulse',
      message: 'Please wait a moment while the system cleans up downloaded data...',
      actions: []
    });
    
    try {
      await clearAppCache();
      await fetchCacheData();
      
      setSystemModal({
        isOpen: true,
        title: 'Success!',
        icon: ICONS.checkCircle,
        iconColor: 'text-green-400',
        message: 'All application cache has been cleared successfully.',
        actions: [{
          text: 'Close',
          onClick: closeSystemModal,
          className: 'bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors w-full'
        }]
      });

    } catch (error) {
      setSystemModal({
        isOpen: true,
        title: 'An Error Occurred',
        icon: ICONS.warning,
        iconColor: 'text-red-400',
        message: 'Could not complete the cache clearing process. Please try again later.',
        actions: [{
          text: 'Close',
          onClick: closeSystemModal,
          className: 'bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-500 transition-colors w-full'
        }]
      });
    }
  };
  const handleClearCache = () => {
    setSystemModal({
      isOpen: true,
      title: 'Confirm Cache Deletion',
      icon: ICONS.warning,
      iconColor: 'text-yellow-400',
      message: 'Bạn có chắc chắn muốn xóa tất cả dữ liệu trò chơi đã lưu trong bộ nhớ đệm không? Hành động này không thể hoàn tác và sẽ yêu cầu tải lại toàn bộ vào lần truy cập tiếp theo.',
      actions: [
        {
          text: 'Cancel',
          onClick: closeSystemModal,
          className: 'bg-slate-700 text-slate-200 font-bold py-2 px-6 rounded-lg hover:bg-slate-600 transition-colors'
        },
        {
          text: 'Confirm',
          onClick: executeCacheClear,
          className: 'bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-500 transition-colors'
        }
      ]
    });
  };
  useEffect(() => {
      const savedMode = localStorage.getItem('displayMode') as DisplayMode;
      if (savedMode) setDisplayMode(savedMode);
  }, []);

  if (game.isLoadingUserData) {
      return <div className="bg-slate-900 w-full h-full flex items-center justify-center text-white">Loading Profile...</div>;
  }
  
  if (!user) {
      return <div className="bg-slate-900 w-full h-full flex items-center justify-center text-white p-8 text-center">Please log in to view your profile.</div>;
  }
  
  const playerInfo = {
    name: (game as any).username || user.displayName || 'CyberWarrior',
    title: (game as any).title || `Lv. ${game.bossBattleHighestFloor + 1} - Rookie`,
    avatarUrl: (game as any).avatarUrl || user.photoURL || 'https://robohash.org/Player.png?set=set4&bgset=bg1',
    accountType: (game as any).accountType || 'Normal',
    vipExpiration: (game as any).vipExpiration, // Cần đảm bảo context có trả về trường này (Timestamp hoặc Date)
    gems: game.gems,
    masteryPoints: game.masteryCards,
    maxMasteryPoints: 1000, 
  };

  const isVip = playerInfo.accountType === 'VIP' || playerInfo.accountType === 'Premium';
  
  // Format Date VIP Expiration
  let vipDateString = '';
  if (playerInfo.vipExpiration) {
      const date = playerInfo.vipExpiration.seconds ? new Date(playerInfo.vipExpiration.seconds * 1000) : new Date(playerInfo.vipExpiration);
      vipDateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  return (
    <div className="bg-slate-900 w-full h-full font-sans text-white p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@400;500;700&display=swap'); 
        .font-orbitron { font-family: 'Orbitron', sans-serif; } 
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes scale-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
      
      <main className="w-full max-w-md mx-auto h-full bg-slate-800/30 rounded-2xl shadow-2xl shadow-purple-900/20 flex flex-col">
        <div className="p-6 bg-gradient-to-br from-gray-900 to-slate-900 relative flex-shrink-0">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="relative">
              <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                  <div className={`rounded-full p-1 ${isVip ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 shadow-orange-500/50 shadow-lg' : 'bg-transparent'}`}>
                    <img src={playerInfo.avatarUrl} alt="Player Avatar" className="w-20 h-20 rounded-full border-4 border-slate-800 object-cover"/>
                  </div>
                  <button onClick={() => handleModal('avatar', true)} className="absolute -bottom-1 -right-1 bg-slate-700 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-300 hover:bg-purple-600 transition-all">
                     <Icon path={ICONS.camera} className="w-5 h-5"/>
                  </button>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-1">
                      <h1 className={`text-xl font-bold font-roboto tracking-wider ${isVip ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500' : 'text-slate-100'}`}>{playerInfo.name}</h1>
                      <button onClick={() => handleModal('edit', true)} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full hover:bg-purple-600 hover:text-white transition-colors">
                        Edit
                      </button>
                  </div>
                  <p className="text-purple-400 font-semibold text-sm">{playerInfo.title}</p>
                   <div className="flex items-center space-x-2 mt-2">
                        {/* --- Logic hiển thị VIP --- */}
                        {isVip ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-xs bg-gradient-to-r from-yellow-600 to-yellow-800 text-yellow-100 px-2 py-0.5 rounded-sm border border-yellow-500 flex items-center space-x-1 shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                                    <Icon path={ICONS.crown} className="w-3 h-3 text-yellow-200"/>
                                    <span className="font-orbitron font-bold tracking-widest">VIP</span>
                                </span>
                                {vipDateString && <span className="text-xs text-slate-400">Exp: {vipDateString}</span>}
                            </div>
                        ) : (
                           <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-500">Normal</span>
                        )}

                        <button 
                            onClick={() => handleModal('upgrade', true)} 
                            className={`flex items-center space-x-1.5 font-bold text-xs pl-2 pr-3 py-1 rounded-full shadow-md transform transition-all duration-300 ease-in-out hover:scale-105 ${isVip ? 'bg-slate-700 text-yellow-400 border border-yellow-600/50 hover:bg-slate-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30 hover:shadow-pink-500/50'}`}
                        >
                            <img 
                                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/upgrade-premium.webp" 
                                alt="Premium" 
                                className="w-4 h-4"
                            />
                            <span>{isVip ? 'Extend' : 'Upgrade'}</span>
                        </button>
                   </div>
                </div>
              </div>
              <div className="mt-6">
                <StatBar label="Mastery" value={playerInfo.masteryPoints} maxValue={playerInfo.maxMasteryPoints} icon={ICONS.trendingUp} />
              </div>
           </div>
        </div>

        <div className="p-4 pb-24 space-y-3 overflow-y-auto flex-grow no-scrollbar">
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2">Inventory</h2>
            <MenuItem icon={ICONS.sword} label="Equipment & Items" />
            <MenuItem icon={ICONS.shield} label="Achievements" />
            <MenuItem icon={ICONS.potion} label="Store" />

            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">Habit</h2>
            <div onClick={() => setIsWorkoutOpen(true)}>
                <MenuItem icon={ICONS.dumbbell} label="Workout" />
            </div>
            
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">Guild & Friends</h2>
            <MenuItem icon={ICONS.users} label="Friends List" />
            <MenuItem icon={ICONS.shield} label="My Guild" />
            
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">System</h2>
            
            <CacheInfoItem 
              usage={cacheInfo.usage} 
              quota={cacheInfo.quota}
              onClearCache={handleClearCache}
              isLoading={isCacheLoading}
            />
            
            <DisplayModeSelector currentMode={displayMode} onModeChange={handleModeChange} />
            <MenuItem icon={ICONS.map} label="Adventure Log" />
            <MenuItem icon={ICONS.cog} label="Sound" hasToggle={true} />
            <MenuItem icon={ICONS.map} label="Logout" />
        </div>
      </main>

      <AvatarModal isOpen={modals.avatar} onClose={() => handleModal('avatar', false)} onSelectAvatar={handleSelectAvatar} avatars={avatarOptions} currentAvatar={playerInfo.avatarUrl}/>
      <EditProfileModal isOpen={modals.edit} onClose={() => handleModal('edit', false)} onSave={handleSaveProfile} currentPlayerInfo={playerInfo}/>
      
      {/* Nối state gem và handle confirm vào Modal mới */}
      <UpgradeModal isOpen={modals.upgrade} onClose={() => handleModal('upgrade', false)} onConfirm={handleUpgrade} currentGems={playerInfo.gems} />
      
      <SystemModal
        isOpen={systemModal.isOpen}
        onClose={closeSystemModal}
        icon={systemModal.icon}
        iconColor={systemModal.iconColor}
        title={systemModal.title}
        actions={systemModal.actions}
      >
        <p>{systemModal.message}</p>
      </SystemModal>
      
      {isWorkoutOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900 overflow-y-auto no-scrollbar">
          <WorkoutApp onClose={() => setIsWorkoutOpen(false)} />
        </div>
      )}
    </div>
  );
}

// --- END OF FILE profile.tsx ---
