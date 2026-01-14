import React, { useState, useEffect, useCallback } from 'react';
import { 
    updateProfileInfo, 
    updateAvatar, 
    performVipUpgrade, 
    submitReferralCode 
} from './profileService.ts'; 
import { auth } from '../firebase'; 
import { useGame } from '../GameContext.tsx'; 
import WorkoutApp from '../workout/workout.tsx'; 

// --- TYPES & DEFINITIONS ---
type DisplayMode = 'fullscreen' | 'normal';

// --- HELPER FUNCTIONS ---
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

// --- ICONS COMPONENT ---
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

// --- SVG PATHS COLLECTION ---
const ICONS = {
  sword: "M12.984 2.016l4.5 4.5c0.188 0.188 0.352 0.516 0.352 0.844v3.422l-9.047 9.047c-0.234 0.234-0.516 0.352-0.844 0.352h-2.25c-0.328 0-0.609-0.117-0.844-0.352l-2.016-2.016c-0.234-0.234-0.352-0.516-0.352-0.844v-2.25c0-0.328 0.117-0.609 0.352-0.844l9.047-9.047h3.422c0.328 0 0.656 0.164 0.844 0.352zM14.25 4.688l-9.141 9.141v1.594h1.594l9.141-9.141v-1.594h-1.594zM16.5 3l3.75 3.75-6.188 6.188-3.75-3.75z",
  shield: "M12 1.09375l-9 4.5v6.09375c0 4.57812 3.82812 8.42188 9 9.28125c5.17188-0.85937 9-4.70313 9-9.28125v-6.09375l-9-4.5zM12 3.92188l6.75 3.375v4.40624c0 3.23438-2.67187 5.90625-6.75 6.64063c-4.07812-0.73438-6.75-3.40625-6.75-6.64063v-4.40624z",
  potion: "M15 3c-0.828 0-1.5 0.672-1.5 1.5v1.5h-3v-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5v1.5h-1.5c-0.828 0-1.5 0.672-1.5 1.5s0.672 1.5 1.5 1.5h1.5v10.5c0 0.828 0.672 1.5 1.5 1.5h6c0.828 0 1.5-0.672 1.5-1.5v-10.5h1.5c0.828 0 1.5-0.672 1.5-1.5v-10.5h1.5c0.828 0 1.5-0.672 1.5-1.5v-10.5h1.5c0.828 0 1.5-0.672 1.5-1.5s-0.672-1.5-1.5-1.5h-1.5v-1.5c0-0.828-0.672-1.5-1.5-1.5zM9 19.5v-10.5h6v10.5z",
  chest: "M5.25 5.25c-0.828 0-1.5 0.672-1.5 1.5v1.5h15v-1.5c0-0.828-0.672-1.5-1.5-1.5zM3.75 9.75v7.5c0 0.828 0.672 1.5 1.5 1.5h13.5c0.828 0 1.5-0.672 1.5-1.5v-7.5h-16.5zM11.25 12.75h1.5v3h-1.5z",
  cog: "M12 8.25c-2.078 0-3.75 1.672-3.75 3.75s1.672 3.75 3.75 3.75 3.75-1.672 3.75-3.75-1.672-3.75-3.75-3.75zM12 14.25c-1.25 0-2.25-1-2.25-2.25s1-2.25 2.25-2.25 2.25 1 2.25 2.25-1 2.25-2.25 2.25zM22.5 12.75h-1.781c-0.141 0.703-0.375 1.359-0.656 1.969l1.266 1.266c0.234 0.234 0.352 0.516 0.352 0.844s-0.117 0.609-0.352 0.844l-1.063 1.063c-0.234 0.234-0.516 0.352-0.844 0.352s-0.609-0.117-0.844-0.352l-1.266-1.266c-0.609 0.281-1.266 0.516-1.969 0.656v1.781c0 0.828-0.672 1.5-1.5 1.5h-1.5c-0.828 0-1.5-0.672-1.5-1.5v-1.781c-0.703-0.141-1.359-0.375-1.969-0.656l-1.266 1.266c-0.234 0.234-0.516-0.352-0.844-0.352s-0.609-0.117-0.844-0.352l-1.063-1.063c-0.234 0.234-0.352-0.516-0.352-0.844s0.117-0.609 0.352-0.844l1.266-1.266c-0.281-0.609-0.516-1.266-0.656-1.969h-1.781c-0.828 0 1.5 0.672 1.5 1.5v1.5c0 0.828-0.672 1.5-1.5 1.5z",
  map: "M12 0c-4.148 0-7.5 3.352-7.5 7.5c0 4.148 7.5 16.5 7.5 16.5s7.5-12.352 7.5-16.5c0-4.148-3.352-7.5-7.5-7.5zM12 11.25c-2.078 0-3.75-1.672-3.75-3.75s1.672-3.75 3.75-3.75 3.75 1.672 3.75 3.75-1.672 3.75-3.75 3.75z",
  camera: "M6 6c-1.657 0-3 1.343-3 3v9c0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3v-9c0-1.657-1.343-3-3-3h-2.25l-1.5-1.5h-4.5l-1.5 1.5h-2.25zm6 12c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z",
  close: "M6.46875 4.96875l-1.5 1.5 5.53125 5.53125-5.53125 5.53125 1.5 1.5 5.53125-5.53125 5.53125 5.53125 1.5-1.5-5.53125-5.53125 5.53125-5.53125-1.5-1.5-5.53125 5.53125z",
  gem: "M12 0.75l-4.5 4.5h9zM12 23.25l4.5-4.5h-9zM6 6l-5.25 5.25v1.5l5.25 5.25h12l5.25-5.25v-1.5l-5.25-5.25z",
  coin: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.25 13.5h-2.5v-1.25H9.5v-2h1.25V9.5H9.5v-2h2.5V6.25h2.5v1.25h1.25v2h-1.25v2.75h1.25v2h-2.5v1.25z", 
  star: "M12 17.25l-6.1875 3.25 1.1875-6.875-5-4.875h6.1875l2.8125-6.25 2.8125 6.25h6.1875l-5 4.875 1.1875 6.875z",
  trendingUp: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  users: "M9 8.25c-2.07 0-3.75-1.68-3.75-3.75S6.93.75 9 .75s3.75 1.68 3.75 3.75S11.07 8.25 9 8.25zm5.18 2.53c-1.28-1-2.9-1.53-4.68-1.53H9c-1.78 0-3.4.53-4.68 1.53C2.43 12.06 1.5 14.16 1.5 16.5v1.5c0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5v-1.5c0-2.34-.93-4.44-2.82-5.72zM22.5 16.5c0-1.23-.42-2.34-1.13-3.25.34-.11.68-.24 1.02-.38 1.13-.48 1.86-1.63 1.86-2.99 0-1.77-1.43-3.2-3.2-3.2-1.3 0-2.4.77-2.92 1.84-.6-.2-1.26-.34-1.97-.34-1.2 0-2.31.33-3.28.89.29.3.56.63.79 1 .53-.25 1.12-.4 1.74-.4.18 0 .36 0 .53.02 1.77.18 3.16 1.63 3.16 3.48z",
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  checkCircle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  dumbbell: "M4 9h3v6H4V9zM1 10v4a1 1 0 0 0 1 1h2v-6H2a1 1 0 0 0-1 1zm15-5v14a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm8-1a1 1 0 0 0-1-1h-2v14h2a1 1 0 0 0 1-1V5zM9 4v16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z",
  share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.66 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z",
  copy: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  gift: "M20 12h-2V7.79A2.998 2.998 0 0 0 19.5 2c-1.25 0-2.33.8-2.82 1.95L12 11.97l-4.68-8.02A2.997 2.997 0 0 0 2.5 2C.56 2-1 3.56-1 5.5c0 1.37.93 2.52 2.18 2.89L2 12H0v10h22V12h-2zm-9.33-4.03L12 10.3l1.33-2.33c.78-1.37 2.07-3.79 3.67-3.79C17.84 4.18 18.5 4.84 18.5 5.5c0 .66-.66 1.32-1.5 1.32-.97 0-2.26-.95-3.33-2.85zM4.5 5.5c0-.66.66-1.32 1.5-1.32 1.6 0 2.89 2.42 3.67 3.79l1.33 2.33-1.33-2.33c-1.07-1.9-2.36-2.85-3.33-2.85-.84 0-1.5.66-1.5 1.32zM2 14h8v6H2v-6zm10 0h8v6h-8v-6z",
  download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
};

// --- SUB-COMPONENTS ---

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

const MenuItem = ({ icon, label, onClick }) => {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border-2 border-slate-700 hover:bg-slate-700/70 hover:border-purple-500 transition-all duration-300 cursor-pointer shadow-lg group">
      <div className="flex items-center space-x-4">
        <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
          <Icon path={icon} />
        </div>
        <span className="text-slate-200 font-semibold group-hover:text-white transition-colors">{label}</span>
      </div>
      <Icon path="M8.25 4.5l7.5 7.5-7.5 7.5" className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
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

// --- INSTALL APP COMPONENT (MODIFIED TO ALWAYS SHOW) ---
const InstallAppItem: React.FC<{
    deferredPrompt: any;
    onInstall: () => void;
}> = ({ deferredPrompt, onInstall }) => {
    // ĐÃ XÓA DÒNG CODE ẨN NÚT. BÂY GIỜ NÚT SẼ LUÔN HIỆN ĐỂ BẠN THẤY.
    // if (!deferredPrompt) return null; 

    return (
        <div onClick={onInstall} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-lg border-2 border-indigo-500/50 hover:bg-indigo-800/50 transition-all duration-300 cursor-pointer shadow-lg mt-3 group">
            <div className="flex items-center space-x-4">
                <div className="bg-indigo-500/20 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors">
                    <Icon path={ICONS.download} className="w-6 h-6 text-indigo-300 group-hover:text-white" />
                </div>
                <div>
                    <span className="text-indigo-100 font-semibold block">Install App</span>
                    <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Get better performance</span>
                </div>
            </div>
            <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
                INSTALL
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

// --- MODAL COMPONENTS ---

const AvatarModal = ({ isOpen, onClose, onSelectAvatar, avatars, currentAvatar }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
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
  const [name, setName] = useState(currentPlayerInfo.name);
  
  useEffect(() => { 
      if (isOpen) setName(currentPlayerInfo.name); 
  }, [currentPlayerInfo.name, isOpen]);

  const handleSave = (e) => { 
      e.preventDefault(); 
      onSave({ ...currentPlayerInfo, name: name }); 
      onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-roboto font-bold text-slate-100">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon path={ICONS.close} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-400 mb-2">Player Name</label>
            <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength={20}
            />
          </div>
          <button type="submit" className="w-full bg-green-500 text-slate-900 font-bold py-3 rounded-lg hover:bg-green-400 transition-colors shadow-lg">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

// --- VIP PACKAGES DEFINITION ---
const VIP_PACKAGES = [
    { id: 'vip_7', days: 7, cost: 250, label: 'Starter', bg: 'from-slate-700 to-slate-800', border: 'border-slate-500', text: 'text-slate-200' },
    { id: 'vip_14', days: 14, cost: 450, label: 'Pro', bg: 'from-blue-900 to-indigo-900', border: 'border-blue-400', text: 'text-blue-100', isPopular: true },
    { id: 'vip_30', days: 30, cost: 850, label: 'Master', bg: 'from-yellow-900 to-amber-900', border: 'border-yellow-400', text: 'text-yellow-100' },
];

const UpgradeModal = ({ isOpen, onClose, onConfirm, currentGems }) => {
    const [status, setStatus] = useState('idle'); // 'idle', 'error', 'success'
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleBuy = async (pkg) => {
        if (currentGems >= pkg.cost) {
            setProcessingId(pkg.id);
            try {
                await onConfirm(pkg.cost, pkg.days);
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                    setProcessingId(null);
                }, 1500);
            } catch (error) {
                console.error("Upgrade failed:", error);
                setStatus('error');
                setTimeout(() => {
                   setStatus('idle');
                   setProcessingId(null);
                }, 2000);
            }
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none"></div>

                <div className="p-6 text-center relative z-10">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><Icon path={ICONS.close} /></button>
                    </div>
                    
                    <h2 className="text-4xl font-lilita text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm uppercase tracking-wider mb-1">
                        VIP Store
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 font-roboto">Unlock exclusive perks & maximize your gains!</p>
                    
                    <div className="flex justify-center items-center space-x-2 bg-slate-800/80 rounded-full py-1.5 px-4 mx-auto w-max border border-slate-700 mb-6">
                         <span className="text-slate-400 text-xs uppercase font-bold">Your Gems:</span>
                         <div className="flex items-center space-x-1">
                             <Icon path={ICONS.gem} className="w-4 h-4 text-cyan-400" />
                             <span className={`font-mono font-bold ${currentGems < 250 ? 'text-red-400' : 'text-white'}`}>{currentGems}</span>
                         </div>
                    </div>

                    {status === 'error' && (
                        <div className="absolute inset-x-0 top-20 z-50 animate-bounce">
                             <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg border-2 border-red-400">Not enough Gems!</span>
                        </div>
                    )}
                     {status === 'success' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-3xl">
                             <div className="text-center animate-scale-in">
                                <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                                    <Icon path={ICONS.checkCircle} className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-3xl font-lilita text-white">Upgrade Success!</h3>
                                <p className="text-green-300 font-bold">Welcome to the VIP Club</p>
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        {VIP_PACKAGES.map((pkg) => (
                            <div key={pkg.id} className={`relative flex flex-col bg-gradient-to-b ${pkg.bg} rounded-xl border-2 ${pkg.border} p-3 transition-transform duration-200 hover:scale-105 shadow-xl`}>
                                {pkg.isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-red-300 z-20 whitespace-nowrap">
                                        BEST VALUE
                                    </div>
                                )}
                                <div className="mb-2">
                                    <span className={`font-lilita text-lg ${pkg.text}`}>{pkg.days} DAYS</span>
                                    <div className={`text-[10px] uppercase font-bold opacity-80 ${pkg.text}`}>{pkg.label}</div>
                                </div>
                                <div className="mt-auto">
                                    <button 
                                        onClick={() => handleBuy(pkg)}
                                        disabled={processingId !== null}
                                        className={`w-full group relative overflow-hidden rounded-lg py-1.5 px-1 font-bold text-xs shadow-md transition-all active:scale-95 ${currentGems >= pkg.cost ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center justify-center space-x-1 relative z-10">
                                            {processingId === pkg.id ? (
                                                <span className="animate-pulse">Processing...</span>
                                            ) : (
                                                <>
                                                    <Icon path={ICONS.gem} className="w-3 h-3" />
                                                    <span>{pkg.cost}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 text-[10px] text-slate-500">
                        *VIP benefits include: +20% Gold, Gold Name, Exclusive Icon Frame.
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- REFERRAL MODAL ---
const ReferralModal = ({ isOpen, onClose, referralCode, referralEarnings = 0, referralCount = 0, hasUsedReferral, onRefresh }) => {
    const [friendCode, setFriendCode] = useState('');
    const [status, setStatus] = useState(''); // '', 'copySuccess', 'error', 'submitSuccess'
    const [loading, setLoading] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode).then(() => {
            setStatus('copySuccess');
            setTimeout(() => setStatus(''), 2000);
        });
    };

    const handleSubmitCode = async (e) => {
        e.preventDefault();
        if (!friendCode.trim()) return;
        setLoading(true);
        setStatus('');
        
        try {
            const user = auth.currentUser;
            if(user) {
                await submitReferralCode(user.uid, friendCode.trim());
                setStatus('submitSuccess');
                setFriendCode('');
                // Refresh data to show new gold
                if(onRefresh) onRefresh();
            }
        } catch (error: any) {
            setStatus('error');
            console.error(error);
            alert(error.message || "Invalid Code");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] w-full max-w-md overflow-hidden relative border border-slate-700" onClick={e => e.stopPropagation()}>
                
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-lilita text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wide">
                            REFERRAL PROGRAM
                        </h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full p-1"><Icon path={ICONS.close} /></button>
                    </div>

                    {/* Stats Card */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Total Earned</div>
                            <div className="flex items-center justify-center space-x-1">
                                <Icon path={ICONS.gem} className="w-4 h-4 text-cyan-400" />
                                <span className="text-xl font-mono font-bold text-white">{referralEarnings}</span>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Friends Invited</div>
                            <div className="flex items-center justify-center space-x-1">
                                <Icon path={ICONS.users} className="w-4 h-4 text-purple-400" />
                                <span className="text-xl font-mono font-bold text-white">{referralCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Offer */}
                    <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-xl p-4 mb-4 border border-indigo-500/30 relative overflow-hidden">
                        <div className="flex items-start space-x-3 relative z-10">
                            <div className="bg-indigo-500 p-2 rounded-lg shadow-lg">
                                <Icon path={ICONS.gift} className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-200">Earn 20% Commission!</h3>
                                <p className="text-xs text-indigo-300 mt-1 leading-relaxed">
                                    Invite friends using your unique code. You'll receive <span className="text-yellow-400 font-bold">20% Gems</span> whenever they make a purchase!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Copy Code Section */}
                    <div className="mb-6 space-y-2">
                        <label className="text-xs text-slate-400 font-bold uppercase ml-1">Your Unique Code</label>
                        <div className="flex space-x-2">
                            <div className="flex-grow bg-slate-950 border-2 border-slate-700 rounded-lg flex items-center justify-center py-3 px-4">
                                <span className="font-mono text-xl font-bold tracking-widest text-purple-300">{referralCode}</span>
                            </div>
                            <button 
                                onClick={handleCopy}
                                className={`px-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center ${status === 'copySuccess' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                            >
                                {status === 'copySuccess' ? <Icon path={ICONS.checkCircle} /> : <Icon path={ICONS.copy} />}
                            </button>
                        </div>
                    </div>

                    {/* Enter Code Section */}
                    <div className="border-t border-slate-800 pt-5">
                        <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 rounded-lg p-2.5 mb-3 border border-yellow-500/20 flex items-center space-x-2">
                            <div className="p-1.5 bg-yellow-600 rounded-full animate-pulse">
                                <Icon path={ICONS.coin} className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-yellow-200 font-bold">Newbie Gift: Get 10,000 Gold instantly!</span>
                        </div>

                        {/* CONDITIONAL RENDERING: CHECK IF USER ALREADY CLAIMED */}
                        {hasUsedReferral || status === 'submitSuccess' ? (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center animate-scale-in">
                                <div className="bg-green-500 rounded-full p-2 mb-2 shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                                    <Icon path={ICONS.checkCircle} className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-green-400 font-bold text-lg">Gift Claimed!</h3>
                                <p className="text-xs text-green-200 mt-1">You have successfully linked a code and received your 10,000 Gold.</p>
                            </div>
                        ) : (
                            <>
                                <label className="text-xs text-slate-400 font-bold uppercase ml-1 mb-2 block">Enter Friend's Code</label>
                                <form onSubmit={handleSubmitCode} className="flex space-x-2">
                                    <input 
                                        type="text" 
                                        value={friendCode}
                                        onChange={(e) => setFriendCode(e.target.value)}
                                        placeholder="Enter code here..."
                                        className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={loading || !friendCode}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all ${status === 'submitSuccess' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                    >
                                        {loading ? '...' : 'Submit'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SystemModal = ({ isOpen, onClose, icon, iconColor, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
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


// --- MAIN APP COMPONENT ---
export default function GameProfile() {
  const game = useGame();
  const user = auth.currentUser;

  // Avatar list
  const avatarOptions = [ 'https://robohash.org/Cyber.png?set=set2&bgset=bg1', 'https://robohash.org/Warrior.png?set=set4&bgset=bg2', 'https://robohash.org/Glitch.png?set=set3&bgset=bg1', 'https://robohash.org/Sentinel.png?set=set1&bgset=bg2', 'https://robohash.org/Phantom.png?set=set4&bgset=bg1', 'https://robohash.org/Jester.png?set=set2&bgset=bg2' ];

  // Component-specific UI state
  const [modals, setModals] = useState({ avatar: false, edit: false, upgrade: false, referral: false });
  const [systemModal, setSystemModal] = useState({ isOpen: false, title: '', icon: null, iconColor: '', message: '', actions: [] });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal');
  const [cacheInfo, setCacheInfo] = useState({ usage: 0, quota: 0 });
  const [isCacheLoading, setIsCacheLoading] = useState(true);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false); 
  const [installPrompt, setInstallPrompt] = useState<any>(null);

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

  const handleUpgrade = async (cost: number, days: number) => {
    if (!user) return;
    try {
        await performVipUpgrade(user.uid, cost, days);
        await game.refreshUserData(); // Refresh to update VIP status in Context
    } catch (error)
    {
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
  
  // --- EFFECT: LẮNG NGHE SỰ KIỆN CÀI ĐẶT PWA ---
  useEffect(() => {
    const handler = (e: any) => {
      // Ngăn trình duyệt hiển thị thông báo mặc định
      e.preventDefault();
      // Lưu sự kiện lại để dùng khi bấm nút
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // --- HÀM XỬ LÝ CÀI ĐẶT ---
  const handleInstallApp = async () => {
    // SỬA: Nếu không có prompt, báo lỗi cho người dùng biết (để debug)
    if (!installPrompt) {
        alert("Tính năng cài đặt không khả dụng (Có thể do: iOS, đã cài rồi, hoặc không dùng HTTPS).");
        return;
    }
    
    // Hiển thị prompt của trình duyệt
    installPrompt.prompt();
    
    // Đợi người dùng phản hồi
    const { outcome } = await installPrompt.userChoice;
    
    // Nếu cài đặt thành công hoặc bị từ chối, reset state
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setInstallPrompt(null);
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
  
  // --- LOGIC KIỂM TRA VIP ---
  const now = new Date();
  const isVip = game.accountType === 'VIP' && game.vipExpiresAt && new Date(game.vipExpiresAt) > now;
  
  let vipDaysLeft = 0;
  if (isVip && game.vipExpiresAt) {
      const diffTime = Math.abs(new Date(game.vipExpiresAt).getTime() - now.getTime());
      vipDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }
  
  // --- LOGIC TÍNH LEVEL TỪ MASTERY ---
  const currentLevel = Math.floor((game.masteryCards || 0) / 50) + 1;

  const gameData = game as any;
  const playerInfo = {
    name: gameData.username || user.displayName || 'CyberWarrior',
    title: `Lv. ${currentLevel}`, 
    avatarUrl: gameData.avatarUrl || user.photoURL || 'https://robohash.org/Player.png?set=set4&bgset=bg1',
    accountType: isVip ? 'VIP' : 'Normal',
    gems: game.gems,
    gold: game.gold || 0, // Ensure gold is mapped
    masteryPoints: game.masteryCards,
    maxMasteryPoints: 1000, 
    // Referral Data
    referralCode: gameData.referralCode || user.uid.slice(0, 6).toUpperCase(),
    referralEarnings: gameData.referralEarnings || 0,
    referralCount: gameData.referralCount || 0,
    referredBy: gameData.referredBy || null // Field to check if already used code
  };

  return (
    <div className="bg-slate-900 w-full h-full font-sans text-white p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@400;500;700&family=Lilita+One&display=swap'); 
        .font-orbitron { font-family: 'Orbitron', sans-serif; } 
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
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
                  {/* VIP Avatar: Static Gold Border with Glow */}
                  <div className={`rounded-full ${isVip ? 'p-[3px] bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'p-1 bg-transparent'}`}>
                    <img src={playerInfo.avatarUrl} alt="Player Avatar" className={`w-20 h-20 rounded-full border-4 ${isVip ? 'border-transparent' : 'border-purple-500'} shadow-lg object-cover bg-slate-800`}/>
                  </div>
                  <button onClick={() => handleModal('avatar', true)} className="absolute -bottom-1 -right-1 bg-slate-700 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-300 hover:bg-purple-600 transition-all z-10">
                     <Icon path={ICONS.camera} className="w-5 h-5"/>
                  </button>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-1">
                      {/* Name styling for VIP: Gold Gradient */}
                      <h1 className={`text-xl font-bold font-lilita tracking-wider ${isVip ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600' : 'text-slate-100'}`}>
                          {playerInfo.name}
                      </h1>
                      <button onClick={() => handleModal('edit', true)} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full hover:bg-purple-600 hover:text-white transition-colors">
                        Edit
                      </button>
                  </div>
                  
                  {/* LEVEL BADGE */}
                  <div className="mb-2">
                     <div className="inline-flex items-baseline bg-slate-800/80 border border-slate-700 rounded-md px-2 py-0.5 shadow-sm">
                        <span className="text-sm text-cyan-500 font-lilita mr-1 leading-none">Lv.</span>
                        <span className="text-base text-white font-lilita tracking-wide leading-none">
                            {currentLevel}
                        </span>
                     </div>
                  </div>
                   
                   {/* HEADER STATUS SECTION (VIP/NORMAL) */}
                   <div className="flex items-center space-x-2">
                        {isVip ? (
                            // VIP STATUS DISPLAY
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50"></div>
                                    <div className="relative bg-gradient-to-b from-yellow-300 to-amber-500 px-3 py-0.5 rounded flex items-center justify-center shadow-lg border-t border-yellow-200">
                                        <span className="text-xs font-black font-lilita text-amber-900 tracking-wider drop-shadow-sm">VIP</span>
                                    </div>
                                </div>
                                <span className="text-xs text-yellow-500 font-mono">{vipDaysLeft} days left</span>
                                <button 
                                    onClick={() => handleModal('upgrade', true)} 
                                    className="bg-slate-800 text-yellow-500 p-1 rounded-full hover:bg-slate-700 border border-slate-600"
                                    title="Extend VIP"
                                >
                                    <Icon path={ICONS.trendingUp} className="w-3 h-3"/>
                                </button>
                            </div>
                        ) : (
                            // NORMAL STATUS & UPGRADE BUTTON
                            <div className="flex items-center space-x-2">
                                <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full border border-slate-500 font-bold">Normal</span>
                                <button 
                                    onClick={() => handleModal('upgrade', true)} 
                                    className="group flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs pl-2 pr-3 py-1 rounded-full shadow-lg shadow-purple-500/20 transform transition-all duration-300 ease-in-out hover:scale-105 hover:from-indigo-500 hover:to-purple-500 ring-1 ring-white/20"
                                >
                                    <div className="bg-white/20 rounded-full p-0.5 group-hover:animate-pulse">
                                        <Icon path={ICONS.star} className="w-3 h-3 text-yellow-300" />
                                    </div>
                                    <span className="font-lilita tracking-wide">UPGRADE</span>
                                </button>
                            </div>
                        )}
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
            <MenuItem icon={ICONS.sword} label="Equipment & Items" onClick={() => {}} />
            <MenuItem icon={ICONS.shield} label="Achievements" onClick={() => {}} />
            <MenuItem icon={ICONS.potion} label="Store" onClick={() => {}} />

            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">Habit</h2>
            <MenuItem icon={ICONS.dumbbell} label="Workout" onClick={() => setIsWorkoutOpen(true)} />
            
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">Community</h2>
            <MenuItem icon={ICONS.users} label="Friends List" onClick={() => {}} />
            
            {/* REFERRAL BUTTON */}
            <MenuItem icon={ICONS.share} label="Referral Program" onClick={() => handleModal('referral', true)} />
            
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider px-2 pt-3">System</h2>
            
            <CacheInfoItem 
              usage={cacheInfo.usage} 
              quota={cacheInfo.quota}
              onClearCache={handleClearCache}
              isLoading={isCacheLoading}
            />
            
            <DisplayModeSelector currentMode={displayMode} onModeChange={handleModeChange} />
            
            {/* --- INSTALL APP BUTTON --- */}
            <InstallAppItem deferredPrompt={installPrompt} onInstall={handleInstallApp} />
            
            <MenuItem icon={ICONS.close} label="Logout" onClick={() => {}} />
        </div>
      </main>

      {/* MODALS RENDERED HERE */}
      <AvatarModal isOpen={modals.avatar} onClose={() => handleModal('avatar', false)} onSelectAvatar={handleSelectAvatar} avatars={avatarOptions} currentAvatar={playerInfo.avatarUrl}/>
      <EditProfileModal isOpen={modals.edit} onClose={() => handleModal('edit', false)} onSave={handleSaveProfile} currentPlayerInfo={playerInfo}/>
      <UpgradeModal isOpen={modals.upgrade} onClose={() => handleModal('upgrade', false)} onConfirm={handleUpgrade} currentGems={playerInfo.gems}/>
      
      {/* REFERRAL MODAL */}
      <ReferralModal 
        isOpen={modals.referral} 
        onClose={() => handleModal('referral', false)} 
        referralCode={playerInfo.referralCode}
        referralEarnings={playerInfo.referralEarnings}
        referralCount={playerInfo.referralCount}
        // Check if user already has a referrer
        hasUsedReferral={!!playerInfo.referredBy} 
        onRefresh={() => game.refreshUserData()}
      />
      
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
