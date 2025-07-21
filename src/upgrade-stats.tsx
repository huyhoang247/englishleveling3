// --- START OF FILE upgrade-stats.tsx ---

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CoinDisplay from './coin-display.tsx';

// --- ICONS & SPINNER ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const Spinner = () => ( <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );
const icons = { coin: ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Gold Coin Icon" /> ), heart: ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000384c61f89f8572bc1cce6ca4.png" alt="HP Icon" /> ), sword: ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000002e7061f7aa3134f2cd28f2f5.png" alt="ATK Icon" /> ), shield: ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000255061f7915533f0d00520b8.png" alt="DEF Icon" /> ) };

// --- CONFIG & LOGIC (Không đổi) ---
export const statConfig = { hp: { name: 'HP', icon: icons.heart, baseUpgradeBonus: 50, color: "from-red-600 to-pink-600" }, atk: { name: 'ATK', icon: icons.sword, baseUpgradeBonus: 5, color: "from-sky-500 to-cyan-500" }, def: { name: 'DEF', icon: icons.shield, baseUpgradeBonus: 5, color: "from-blue-500 to-indigo-500" }, };
export const calculateUpgradeCost = (level: number) => { const baseCost = 100; const tier = Math.floor(level / 10); return baseCost * Math.pow(2, tier); };
export const calculateTotalStatValue = (currentLevel: number, baseBonus: number) => { if (currentLevel === 0) return 0; let totalValue = 0; const fullTiers = Math.floor(currentLevel / 10); const remainingLevelsInCurrentTier = currentLevel % 10; for (let i = 0; i < fullTiers; i++) { const bonusInTier = baseBonus * Math.pow(2, i); totalValue += 10 * bonusInTier; } const bonusInCurrentTier = baseBonus * Math.pow(2, fullTiers); totalValue += remainingLevelsInCurrentTier * bonusInCurrentTier; return totalValue; };
const formatNumber = (num: number) => { if (num < 1000) return num.toString(); if (num < 1000000) { const thousands = num / 1000; return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`; } if (num < 1000000000) { const millions = num / 1000000; return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`; } const billions = num / 1000000000; return `${billions % 1 === 0 ? billions : billions.toFixed(1)}B`; };

// --- COMPONENT STAT CARD ---
const StatCard = ({ stat, onUpgrade, currentGold }: { stat: any, onUpgrade: (id: string) => void, currentGold: number }) => {
  const { name, level, icon, baseUpgradeBonus, color } = stat;
  const upgradeCost = calculateUpgradeCost(level);
  const canAfford = currentGold >= upgradeCost;

  return (
    <div className={`relative group rounded-xl bg-gradient-to-r ${color} p-px transition-all duration-300 ${!canAfford ? 'opacity-60' : 'hover:shadow-lg hover:shadow-cyan-500/10'}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-flow"></div>
      <div className="relative bg-slate-900/95 rounded-[11px] p-4 h-full flex flex-col items-center justify-between gap-3 text-center text-white w-28 sm:w-32 md:w-36">
        <div className="w-10 h-10">{icon}</div>
        <div className="flex-grow flex flex-col items-center gap-1">
          <p className="text-lg uppercase font-bold tracking-wider">{name}</p>
          <p className="text-2xl font-black text-shadow-cyan">+{formatNumber(calculateTotalStatValue(level, baseUpgradeBonus))}</p>
          <p className="text-xs text-slate-400">Level {level}</p>
        </div>
        <button
          onClick={() => onUpgrade(stat.id)}
          disabled={!canAfford}
          className="w-full bg-slate-800 border-2 border-cyan-400/50 rounded-lg py-2 px-1 flex items-center justify-center gap-1 shadow-lg transition-all duration-200 active:scale-95 hover:enabled:bg-slate-700 hover:enabled:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <>
            <div className="w-5 h-5 flex-shrink-0">{icons.coin}</div>
            <span className="text-base font-bold text-yellow-300">{formatNumber(upgradeCost)}</span>
          </>
        </button>
      </div>
    </div>
  );
};

// --- INTERFACE ---
interface UpgradeStatsScreenProps {
  onClose: () => void;
  initialGold: number;
  initialStats: { hp: number; atk: number; def: number; };
  onConfirmUpgrade: (cost: number, newStats: { hp: number; atk: number; def: number; }) => Promise<void>;
}

// --- COMPONENT CHÍNH ---
export default function UpgradeStatsScreen({ onClose, initialGold, initialStats, onConfirmUpgrade }: UpgradeStatsScreenProps) {
  const initialSessionState = useRef({ gold: initialGold, stats: initialStats }).current;
  
  // Tách ra 2 state: một cho logic, một cho hiển thị animation
  const [currentGold, setCurrentGold] = useState(initialGold); // Dùng cho logic
  const [animatedGold, setAnimatedGold] = useState(initialGold); // Dùng cho UI
  
  const [currentStats, setCurrentStats] = useState([
    { id: 'hp', level: initialStats.hp || 0, ...statConfig.hp },
    { id: 'atk', level: initialStats.atk || 0, ...statConfig.atk },
    { id: 'def', level: initialStats.def || 0, ...statConfig.def },
  ]);
  
  const [message, setMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Mang hàm animation trở lại
  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) return;

    const duration = 300; // ms
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = Math.floor(startValue + (endValue - startValue) * progress);
      
      setAnimatedGold(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedGold(endValue);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  const handleLocalUpgrade = (statId: string) => {
    const statToUpgrade = currentStats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);
    if (currentGold < upgradeCost) {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const newGoldValue = currentGold - upgradeCost;
    // Cập nhật state logic ngay lập tức
    setCurrentGold(newGoldValue);
    // Bắt đầu animation cho state hiển thị
    startCoinCountAnimation(currentGold, newGoldValue);

    setCurrentStats(prevStats =>
      prevStats.map(s =>
        s.id === statId ? { ...s, level: s.level + 1 } : s
      )
    );
  };

  const handleConfirmAndClose = async () => {
    if (isSyncing) return;
    const totalCost = initialSessionState.gold - currentGold;
    if (totalCost <= 0) {
      onClose();
      return;
    }

    setIsSyncing(true);
    setMessage('');

    const finalStats = {
      hp: currentStats.find(s => s.id === 'hp')!.level,
      atk: currentStats.find(s => s.id === 'atk')!.level,
      def: currentStats.find(s => s.id === 'def')!.level,
    };

    try {
      await onConfirmUpgrade(totalCost, finalStats);
      onClose();
    } catch (error) {
      console.error("Lỗi khi đồng bộ phiên nâng cấp:", error);
      setMessage('Lỗi! Không thể lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const totalHp = calculateTotalStatValue(currentStats.find(s => s.id === 'hp')!.level, statConfig.hp.baseUpgradeBonus);
  const totalAtk = calculateTotalStatValue(currentStats.find(s => s.id === 'atk')!.level, statConfig.atk.baseUpgradeBonus);
  const totalDef = calculateTotalStatValue(currentStats.find(s => s.id === 'def')!.level, statConfig.def.baseUpgradeBonus);
  const totalLevels = currentStats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;

  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap'); .font-lilita { font-family: 'Lilita One', cursive; } .text-shadow-cyan { text-shadow: 0 0 8px rgba(0, 246, 255, 0.7); } .animate-border-flow { background-size: 400% 400%; animation: animate-gradient-border 3s linear infinite; } @keyframes animate-gradient-border { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .animate-breathing { animation: breathing 5s ease-in-out infinite; } @keyframes breathing { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }`}</style>

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        <button onClick={handleConfirmAndClose} disabled={isSyncing} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors disabled:cursor-wait disabled:opacity-70">
          {isSyncing ? ( <> <Spinner /> <span className="hidden sm:inline text-sm font-semibold text-slate-300">Đang lưu...</span> </> ) : ( <> <HomeIcon className="w-5 h-5 text-slate-300" /> <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span> </> )}
        </button>
        <div className="font-sans">
            {/* Truyền state dành cho UI vào CoinDisplay */}
            <CoinDisplay displayedCoins={animatedGold} />
        </div>
      </header>

      {message && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600/90 border border-red-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita animate-bounce">{message}</div>}

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-8">
          <div className="mb-4 w-48 h-48 flex items-center justify-center animate-breathing">
            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-16_15-55-32-819.png" alt="Hero Stone Icon" className="w-full h-full object-contain" />
          </div>

          <div className="w-full max-w-xs bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 mb-6 flex justify-around items-center">
            <div className="flex items-center gap-2"> <div className="w-6 h-6">{icons.heart}</div> <span className="text-lg font-bold">{formatNumber(totalHp)}</span> </div>
            <div className="flex items-center gap-2"> <div className="w-6 h-6">{icons.sword}</div> <span className="text-lg font-bold">{formatNumber(totalAtk)}</span> </div>
            <div className="flex items-center gap-2"> <div className="w-6 h-6">{icons.shield}</div> <span className="text-lg font-bold">{formatNumber(totalDef)}</span> </div>
          </div>

          <div className="w-full px-2 mb-8">
            <div className="flex justify-between items-baseline mb-2 px-1">
              <span className="text-md font-bold text-slate-400 tracking-wide">Stage {prestigeLevel + 1}</span>
              <span className="text-sm font-semibold text-slate-400">Lv. {totalLevels}</span>
            </div>
            <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_8px_rgba(0,246,255,0.45)] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                <div className="absolute inset-0 flex justify-end items-center px-4 text-sm text-white font-bold">
                    <span>{currentProgress}<span className="text-slate-300">/{maxProgress}</span></span>
                </div>
            </div>
          </div>

          <div className="flex flex-row justify-center items-stretch gap-3 sm:gap-4">
            {currentStats.map(stat => (
              <StatCard 
                key={stat.id} 
                stat={stat} 
                onUpgrade={handleLocalUpgrade} 
                // Nút bấm phải kiểm tra với số vàng thực tế
                currentGold={currentGold} 
              />
            ))}
          </div>
        </div>
    </div>
  );
}
