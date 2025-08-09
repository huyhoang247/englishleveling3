import React, { useState, useEffect, useCallback } from 'react';
import CoinDisplay from './coin-display.tsx'; // Import the CoinDisplay component
import { uiAssets } from './game-assets.ts'; // IMPORT TÀI NGUYÊN TẬP TRUNG

// --- ICONS ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );

const icons = {
  coin: (
    <img
      src={uiAssets.statCoinIcon} // SỬ DỤNG TỪ ASSETS
      alt="Gold Coin Icon"
    />
  ),
  heart: (
    <img
      src={uiAssets.statHpIcon} // SỬ DỤNG TỪ ASSETS
      alt="HP Icon"
    />
  ),
  sword: (
    <img
      src={uiAssets.statAtkIcon} // SỬ DỤNG TỪ ASSETS
      alt="ATK Icon"
    />
  ),
  shield: (
    <img
      src={uiAssets.statDefIcon} // SỬ DỤNG TỪ ASSETS
      alt="DEF Icon"
    />
  )
};

// --- CONFIG VÀ LOGIC TÍNH TOÁN ---
export const statConfig = {
  hp: { name: 'HP', icon: icons.heart, baseUpgradeBonus: 50, color: "from-red-600 to-pink-600" },
  atk: { name: 'ATK', icon: icons.sword, baseUpgradeBonus: 5, color: "from-sky-500 to-cyan-500" },
  def: { name: 'DEF', icon: icons.shield, baseUpgradeBonus: 5, color: "from-blue-500 to-indigo-500" },
};

export const calculateUpgradeCost = (level: number) => {
  const baseCost = 100;
  const tier = Math.floor(level / 10);
  return baseCost * Math.pow(2, tier);
};

export const getBonusForLevel = (level: number, baseBonus: number) => {
  if (level === 0) return 0;
  const tier = Math.floor((level - 1) / 10);
  return baseBonus * Math.pow(2, tier);
};

export const calculateTotalStatValue = (currentLevel: number, baseBonus: number) => {
  if (currentLevel === 0) return 0;
  let totalValue = 0;
  const fullTiers = Math.floor(currentLevel / 10);
  const remainingLevelsInCurrentTier = currentLevel % 10;
  for (let i = 0; i < fullTiers; i++) {
    const bonusInTier = baseBonus * Math.pow(2, i);
    totalValue += 10 * bonusInTier;
  }
  const bonusInCurrentTier = baseBonus * Math.pow(2, fullTiers);
  totalValue += remainingLevelsInCurrentTier * bonusInCurrentTier;
  return totalValue;
};

const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) {
      const thousands = num / 1000;
      return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }
  if (num < 1000000000) {
      const millions = num / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  const billions = num / 1000000000;
  return `${billions % 1 === 0 ? billions : billions.toFixed(1)}B`;
};


// --- COMPONENT STAT CARD (Đã sửa logic hiển thị bonus) ---
const StatCard = ({ stat, onUpgrade, isProcessing, isDisabled }: { stat: any, onUpgrade: (id: string) => void, isProcessing: boolean, isDisabled: boolean }) => {
  const { name, level, icon, baseUpgradeBonus, color } = stat;
  const upgradeCost = calculateUpgradeCost(level);
  // SỬA LỖI: Tính toán số điểm sẽ nhận được cho lần nâng cấp TIẾP THEO (level + 1)
  const bonusForNextLevel = getBonusForLevel(level + 1, baseUpgradeBonus);

  return (
    <div className={`relative group rounded-xl bg-gradient-to-r ${color} p-px
                    transition-all duration-300
                    ${isDisabled && !isProcessing ? 'opacity-60' : 'hover:shadow-lg hover:shadow-cyan-500/10'}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-flow"></div>

      <div className="relative bg-slate-900/95 rounded-[11px] p-4 h-full flex flex-col items-center justify-between gap-3 text-center text-white w-28 sm:w-32 md:w-36">
        <div className="w-10 h-10">{icon}</div>
        <div className="flex-grow flex flex-col items-center gap-1">
          <p className="text-lg uppercase font-bold tracking-wider">{name}</p>
          {/* SỬA LỖI: Hiển thị bonus cho lần nâng cấp tiếp theo, không phải tổng chỉ số */}
          <p className="text-xl font-black text-shadow-cyan">+{formatNumber(bonusForNextLevel)}</p>
          <p className="text-xs text-slate-400">Level {level}</p>
        </div>
        <button
          onClick={() => onUpgrade(stat.id)}
          disabled={isDisabled || isProcessing} // Chỉ vô hiệu hóa nút, không hiển thị spinner
          className="w-full bg-slate-800 border-2 border-cyan-400/50 rounded-lg py-2 px-1 flex items-center justify-center gap-1 shadow-lg transition-all duration-200 active:scale-95
                     hover:enabled:bg-slate-700 hover:enabled:border-cyan-400
                     disabled:cursor-not-allowed disabled:opacity-70"
        >
          {/* Luôn hiển thị giá tiền */}
          <>
            <div className="w-5 h-5 flex-shrink-0">{icons.coin}</div>
            <span className="text-base font-bold text-yellow-300">{formatNumber(upgradeCost)}</span>
          </>
        </button>
      </div>
    </div>
  );
};

// INTERFACE ĐỊNH NGHĨA CÁC PROPS
interface UpgradeStatsScreenProps {
  onClose: () => void;
  initialGold: number;
  initialStats: { hp: number; atk: number; def: number; };
  onConfirmUpgrade: (cost: number, newStats: { hp: number; atk: number; def: number; }) => Promise<void>;
}


// --- COMPONENT CHÍNH ---
export default function UpgradeStatsScreen({ onClose, initialGold, initialStats, onConfirmUpgrade }: UpgradeStatsScreenProps) {
  const [displayedGold, setDisplayedGold] = useState(initialGold);
  const [stats, setStats] = useState([
    { id: 'hp', level: initialStats.hp || 0, ...statConfig.hp },
    { id: 'atk', level: initialStats.atk || 0, ...statConfig.atk },
    { id: 'def', level: initialStats.def || 0, ...statConfig.def },
  ]);
  const [message, setMessage] = useState('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);

  // Đồng bộ state cục bộ khi component được mở hoặc props thay đổi
  useEffect(() => {
    setDisplayedGold(initialGold);
    setStats([
        { id: 'hp', level: initialStats.hp || 0, ...statConfig.hp },
        { id: 'atk', level: initialStats.atk || 0, ...statConfig.atk },
        { id: 'def', level: initialStats.def || 0, ...statConfig.def },
    ]);
  }, [initialGold, initialStats]);


  // Hàm tạo hiệu ứng đếm số
  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) return;
    const isCountingUp = endValue > startValue;
    const step = Math.ceil(Math.abs(endValue - startValue) / 30) || 1;
    let current = startValue;

    const interval = setInterval(() => {
      if (isCountingUp) {
        current += step;
      } else {
        current -= step;
      }

      if ((isCountingUp && current >= endValue) || (!isCountingUp && current <= endValue)) {
        setDisplayedGold(endValue);
        clearInterval(interval);
      } else {
        setDisplayedGold(current);
      }
    }, 30);
  }, []);


  // HÀM NÂNG CẤP ĐÃ ĐƯỢC TỐI ƯU VỚI LOGIC OPTIMISTIC UPDATE
  const handleUpgrade = async (statId: string) => {
    if (upgradingId) return; // Nếu đang có 1 nâng cấp khác, không làm gì cả

    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (displayedGold < upgradeCost) {
      setMessage('Không đủ vàng!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // --- Bắt đầu Optimistic Update ---
    setUpgradingId(statId); // Khóa các nút khác
    setMessage('');

    // 1. Lưu lại state cũ để có thể khôi phục nếu lỗi
    const oldGold = displayedGold;
    const oldStats = JSON.parse(JSON.stringify(stats)); // Deep copy để đảm bảo an toàn

    // 2. Cập nhật giao diện ngay lập tức
    const newGoldValue = oldGold - upgradeCost;
    startCoinCountAnimation(oldGold, newGoldValue); // Hiệu ứng trừ tiền
    
    const newStatsArray = stats.map(s =>
      s.id === statId ? { ...s, level: s.level + 1 } : s
    );
    setStats(newStatsArray); // Cập nhật level trên UI

    // 3. Chuẩn bị dữ liệu và gửi lên server
    const newStatsForFirestore = {
      hp: newStatsArray.find(s => s.id === 'hp')!.level,
      atk: newStatsArray.find(s => s.id === 'atk')!.level,
      def: newStatsArray.find(s => s.id === 'def')!.level,
    };

    try {
      // Gọi hàm cập nhật gộp và chờ kết quả
      await onConfirmUpgrade(upgradeCost, newStatsForFirestore);
      // Nếu thành công, không cần làm gì thêm vì UI đã được cập nhật.
      console.log('Nâng cấp đã được xác nhận và lưu trên server.');

    } catch (error) {
      // 4. Nếu có lỗi, KHÔI PHỤC (ROLLBACK) giao diện
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      
      // Khôi phục lại vàng và chỉ số trên UI
      startCoinCountAnimation(newGoldValue, oldGold);
      setStats(oldStats);

      setTimeout(() => setMessage(''), 3000);
    } finally {
      // 5. Dù thành công hay thất bại, cũng kết thúc trạng thái "đang xử lý" để mở khóa các nút
      setTimeout(() => {
        setUpgradingId(null);
      }, 200); // Delay ngắn để tránh spam click
    }
  };

  // Calculations for display
  const totalHp = calculateTotalStatValue(stats.find(s => s.id === 'hp')!.level, statConfig.hp.baseUpgradeBonus);
  const totalAtk = calculateTotalStatValue(stats.find(s => s.id === 'atk')!.level, statConfig.atk.baseUpgradeBonus);
  const totalDef = calculateTotalStatValue(stats.find(s => s.id === 'def')!.level, statConfig.def.baseUpgradeBonus);

  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;

  return (
    <div className="main-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center justify-center font-lilita text-white overflow-hidden">
      {/* START: ĐỊNH NGHĨA ANIMATION CHO VIÊN ĐÁ */}
      <style>{`
        @keyframes breathing-stone {
          0%, 100% {
            transform: scale(1) translateY(0);
            filter: drop-shadow(0 10px 15px rgba(0, 246, 255, 0.1));
          }
          50% {
            transform: scale(1.03) translateY(-6px);
            filter: drop-shadow(0 20px 25px rgba(0, 246, 255, 0.18));
          }
        }
        .animate-breathing {
          animation: breathing-stone 4s ease-in-out infinite;
        }
      `}</style>
      {/* END: ĐỊNH NGHĨA ANIMATION */}
      
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 bg-black/30 backdrop-blur-sm border-b-2 border-slate-700/80">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại Trang Chính" title="Quay lại Trang Chính">
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
        </button>
        <div className="font-sans">
            <CoinDisplay displayedCoins={displayedGold} isStatsFullscreen={false} />
        </div>
      </header>

      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600/90 border border-red-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 font-lilita animate-bounce">
          {message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center pt-8">
          {/* THAY ĐỔI: Kích thước viên đá nhỏ lại và áp dụng animation */}
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

          <div className="flex flex-row justify-center items-stretch gap-3 sm:gap-4">
            {stats.map(stat => (
              <StatCard 
                key={stat.id} 
                stat={stat} 
                onUpgrade={handleUpgrade} 
                isProcessing={upgradingId === stat.id} 
                isDisabled={upgradingId !== null} // Vô hiệu hóa tất cả các nút khi một nút đang được xử lý
              />
            ))}
          </div>
        </div>
    </div>
  );
}
