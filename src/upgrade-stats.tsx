// src/components/upgrade-stats.tsx

import React, { useState, useEffect, useCallback } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import { uiAssets } from './game-assets.ts';
import { auth } from './firebase.js'; 
import { fetchOrCreateUserGameData, upgradeUserStats } from './gameDataService.ts';
import UpgradeStatsSkeleton from './upgrade-stats-loading.tsx';
import StatUpgradeToast from './StatUpgradeToast.tsx';

// --- ICONS ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="http://www.w3.org/2000/svg" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const icons = {
  coin: ( <img src={uiAssets.statCoinIcon} alt="Gold Coin Icon" /> ),
  heart: ( <img src={uiAssets.statHpIcon} alt="HP Icon" /> ),
  sword: ( <img src={uiAssets.statAtkIcon} alt="ATK Icon" /> ),
  shield: ( <img src={uiAssets.statDefIcon} alt="DEF Icon" /> )
};

// --- CONFIG VÀ LOGIC TÍNH TOÁN ---
export const statConfig = {
  hp: { name: 'HP', icon: icons.heart, baseUpgradeBonus: 50, color: "from-red-600 to-pink-600", toastColors: { border: 'border-pink-500', text: 'text-pink-400' } },
  atk: { name: 'ATK', icon: icons.sword, baseUpgradeBonus: 5, color: "from-sky-500 to-cyan-500", toastColors: { border: 'border-cyan-400', text: 'text-cyan-300' } },
  def: { name: 'DEF', icon: icons.shield, baseUpgradeBonus: 5, color: "from-blue-500 to-indigo-500", toastColors: { border: 'border-blue-400', text: 'text-blue-300' } },
};
export const calculateUpgradeCost = (level: number) => { const baseCost = 100; const tier = Math.floor(level / 10); return baseCost * Math.pow(2, tier); };
export const getBonusForLevel = (level: number, baseBonus: number) => { if (level === 0) return 0; const tier = Math.floor((level - 1) / 10); return baseBonus * Math.pow(2, tier); };
export const calculateTotalStatValue = (currentLevel: number, baseBonus: number) => { if (currentLevel === 0) return 0; let totalValue = 0; const fullTiers = Math.floor(currentLevel / 10); const remainingLevelsInCurrentTier = currentLevel % 10; for (let i = 0; i < fullTiers; i++) { const bonusInTier = baseBonus * Math.pow(2, i); totalValue += 10 * bonusInTier; } const bonusInCurrentTier = baseBonus * Math.pow(2, fullTiers); totalValue += remainingLevelsInCurrentTier * bonusInCurrentTier; return totalValue; };
const formatNumber = (num: number) => { if (num < 1000) return num.toString(); if (num < 1000000) { const thousands = num / 1000; return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`; } if (num < 1000000000) { const millions = num / 1000000; return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`; } const billions = num / 1000000000; return `${billions % 1 === 0 ? billions : billions.toFixed(1)}B`; };

// --- COMPONENT STAT CARD (TÍCH HỢP TOAST) ---
const StatCard = ({ stat, onUpgrade, isProcessing, isDisabled }: { stat: any, onUpgrade: (id: string) => void, isProcessing: boolean, isDisabled: boolean }) => {
  const { name, level, icon, baseUpgradeBonus, color, toastColors } = stat;
  const [showToast, setShowToast] = useState(false);
  const upgradeCost = calculateUpgradeCost(level);
  const bonusForNextLevel = getBonusForLevel(level + 1, baseUpgradeBonus);

  // Kích hoạt toast khi component này đang được xử lý (isProcessing = true)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessing) {
      setShowToast(true);
      // Toast sẽ tự động ẩn sau khi animation kết thúc
      timer = setTimeout(() => {
        setShowToast(false);
      }, 1500); // Thời gian animation là 1.5s
    }
    return () => clearTimeout(timer);
  }, [isProcessing]);

  return (
    // Thẻ bọc ngoài không cần `relative` nữa, vì `div` nội dung bên trong đã có rồi
    <div className={`group rounded-xl bg-gradient-to-r ${color} p-px transition-all duration-300 ${isDisabled && !isProcessing ? 'opacity-60' : 'hover:shadow-lg hover:shadow-cyan-500/10'}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-flow"></div>
      
      {/* Div này đã có `relative`, sẽ là "gốc tọa độ" cho Toast */}
      <div className="relative bg-slate-900/95 rounded-[11px] h-full flex flex-col items-center justify-between text-center text-white 
                   w-28 sm:w-36 p-3 sm:p-4 gap-2 sm:gap-3">

        {/* >>> TOAST ĐÃ ĐƯỢC CHUYỂN VÀO ĐÂY ĐỂ ĐỊNH VỊ CHÍNH XÁC <<< */}
        <StatUpgradeToast 
          isVisible={showToast}
          icon={icon}
          bonus={getBonusForLevel(level, baseUpgradeBonus)} // Lấy bonus của level hiện tại (vừa nâng cấp xong)
          colorClasses={toastColors}
        />

        <div className="w-8 h-8 sm:w-10 sm:h-10">{icon}</div>
        <div className="flex-grow flex flex-col items-center gap-1">
          <p className="text-base sm:text-lg uppercase font-bold tracking-wider">{name}</p>
          <p className="text-lg sm:text-xl font-black text-shadow-cyan">+{formatNumber(bonusForNextLevel)}</p>
          <p className="text-xs text-slate-400">Level {level}</p>
        </div>
        
        <button 
          onClick={() => onUpgrade(stat.id)} 
          disabled={isDisabled || isProcessing} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 sm:py-2 px-2 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all duration-200 active:scale-95 hover:enabled:bg-slate-800 hover:enabled:border-yellow-500 hover:enabled:shadow-lg hover:enabled:shadow-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="w-5 h-5 flex-shrink-0">{icons.coin}</div>
          <span className="text-sm sm:text-base font-bold text-yellow-400 transition-colors duration-200">{formatNumber(upgradeCost)}</span>
        </button>
      </div>
    </div>
  );
};


// INTERFACE ĐỊNH NGHĨA CÁC PROPS
interface UpgradeStatsScreenProps {
  onClose: () => void;
  onDataUpdated: (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => void;
}

// --- COMPONENT CHÍNH ---
export default function UpgradeStatsScreen({ onClose, onDataUpdated }: UpgradeStatsScreenProps) {
  const [initialGold, setInitialGold] = useState(0);
  const [displayedGold, setDisplayedGold] = useState(0);
  const [stats, setStats] = useState([
    { id: 'hp', level: 0, ...statConfig.hp },
    { id: 'atk', level: 0, ...statConfig.atk },
    { id: 'def', level: 0, ...statConfig.def },
  ]);
  const [message, setMessage] = useState('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Lỗi: Người dùng chưa đăng nhập.");
        setIsLoading(false);
        return;
      }
      try {
        const gameData = await fetchOrCreateUserGameData(user.uid);
        setInitialGold(gameData.coins);
        setDisplayedGold(gameData.coins);
        setStats([
          { id: 'hp', level: gameData.stats.hp || 0, ...statConfig.hp },
          { id: 'atk', level: gameData.stats.atk || 0, ...statConfig.atk },
          { id: 'def', level: gameData.stats.def || 0, ...statConfig.def },
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
        setMessage("Không thể tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) return;
    const isCountingUp = endValue > startValue;
    const step = Math.ceil(Math.abs(endValue - startValue) / 30) || 1;
    let current = startValue;
    const interval = setInterval(() => {
      if (isCountingUp) { current += step; } else { current -= step; }
      if ((isCountingUp && current >= endValue) || (!isCountingUp && current <= endValue)) {
        setDisplayedGold(endValue);
        clearInterval(interval);
      } else {
        setDisplayedGold(current);
      }
    }, 30);
  }, []);

  const handleUpgrade = useCallback(async (statId: string) => {
    const user = auth.currentUser;
    if (upgradingId || !user) return;

    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (displayedGold < upgradeCost) {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setUpgradingId(statId);
    setMessage('');

    const oldGold = displayedGold;
    const oldStats = JSON.parse(JSON.stringify(stats));

    const newGoldValue = oldGold - upgradeCost;
    startCoinCountAnimation(oldGold, newGoldValue);
    
    const newStatsArray = stats.map(s =>
      s.id === statId ? { ...s, level: s.level + 1 } : s
    );
    setStats(newStatsArray);

    const newStatsForFirestore = {
      hp: newStatsArray.find(s => s.id === 'hp')!.level,
      atk: newStatsArray.find(s => s.id === 'atk')!.level,
      def: newStatsArray.find(s => s.id === 'def')!.level,
    };

    try {
      const { newCoins } = await upgradeUserStats(user.uid, upgradeCost, newStatsForFirestore);
      setInitialGold(newCoins);
      setDisplayedGold(newCoins);
      onDataUpdated(newCoins, newStatsForFirestore);
      console.log('Nâng cấp đã được xác nhận và lưu trên server.');
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      startCoinCountAnimation(newGoldValue, oldGold);
      setStats(oldStats);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTimeout(() => {
        setUpgradingId(null);
      }, 300); 
    }
  }, [upgradingId, stats, displayedGold, startCoinCountAnimation, onDataUpdated]);

  const totalHp = calculateTotalStatValue(stats.find(s => s.id === 'hp')!.level, statConfig.hp.baseUpgradeBonus);
  const totalAtk = calculateTotalStatValue(stats.find(s => s.id === 'atk')!.level, statConfig.atk.baseUpgradeBonus);
  const totalDef = calculateTotalStatValue(stats.find(s => s.id === 'def')!.level, statConfig.def.baseUpgradeBonus);
  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;

  if (isLoading) {
    return <UpgradeStatsSkeleton />;
  }

  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      <style>{`@keyframes breathing-stone { 0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 10px 15px rgba(0, 246, 255, 0.1)); } 50% { transform: scale(1.03) translateY(-6px); filter: drop-shadow(0 20px 25px rgba(0, 246, 255, 0.18)); } } .animate-breathing { animation: breathing-stone 4s ease-in-out infinite; }`}</style>
      
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại Trang Chính" title="Quay lại Trang Chính">
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
        </button>
        <div className="font-sans">
            <CoinDisplay displayedCoins={displayedGold} isStatsFullscreen={false} />
        </div>
      </header>

      {message && (<div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600/90 border border-red-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita animate-bounce">{message}</div>)}

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-8">
          <div className="mb-4 w-40 h-40 flex items-center justify-center animate-breathing">
            <img src={uiAssets.statHeroStoneIcon} alt="Hero Stone Icon" className="w-full h-full object-contain" />
          </div>
          <div className="w-full max-w-xs bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 mb-6 flex justify-around items-center">
            <div className="flex items-center gap-2"> <div className="w-6 h-6">{icons.heart}</div> <span className="text-lg font-bold">{formatNumber(totalHp)}</span> </div>
            <div className="flex items-center gap-2"> <div className="w-6 h-6">{icons.sword}</div> <span className="text-lg font-bold">{formatNumber(totalAtk)}</span> </div>
            <div className="flex items-center gap-2"> <div className="w-6 h-6">{icons.shield}</div> <span className="text-lg font-bold">{formatNumber(totalDef)}</span> </div>
          </div>
          <div className="w-full px-2 mb-8">
            <div className="flex justify-between items-baseline mb-2 px-1">
              <span className="text-md font-bold text-slate-400 tracking-wide text-shadow-sm">Stage {prestigeLevel + 1}</span>
              <span className="text-sm font-semibold text-slate-400">Lv. {totalLevels}</span>
            </div>
            <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_8px_rgba(0,246,255,0.45)] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                <div className="absolute inset-0 flex justify-end items-center px-4 text-sm text-white text-shadow-sm font-bold">
                    <span>{currentProgress}<span className="text-slate-300">/ {maxProgress}</span></span>
                </div>
            </div>
          </div>
          <div className="flex flex-row justify-center items-stretch gap-2 sm:gap-4">
            {stats.map(stat => (
              <StatCard key={stat.id} stat={stat} onUpgrade={handleUpgrade} isProcessing={upgradingId === stat.id} isDisabled={upgradingId !== null && upgradingId !== stat.id} />
            ))}
          </div>
        </div>
    </div>
  );
}
