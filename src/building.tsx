// --- START OF FILE building.tsx ---
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CoinDisplay from './coin-display.tsx';
import { uiAssets } from './game-assets.ts'; // ADDED: Import uiAssets

// --- TIỆN ÍCH ---
// Hàm định dạng số, hiển thị dấu phẩy cho các số dưới 1 triệu
const formatNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return Math.floor(num).toLocaleString('en-US');
};


// --- CÁC COMPONENT ICON SVG VÀ COMPONENT ICON TỪ ẢNH ---

const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ADDED: Copied the exact GemIcon component from background-game.tsx
interface GemIconProps {
  size?: number;
  className?: string;
  [key: string]: any;
}
const GemIcon: React.FC<GemIconProps> = ({ size = 24, className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
      <img
        src={uiAssets.gemIcon}
        alt="Tourmaline Gem Icon"
        className="w-full h-full object-contain"
      />
    </div>
  );
};


const DollarSignIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const StarIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ChevronsUpIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="17 11 12 6 7 11"></polyline>
    <polyline points="17 18 12 13 7 18"></polyline>
  </svg>
);

const BatteryChargingIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"></path>
    <line x1="23" y1="13" x2="23" y2="11"></line>
    <polyline points="11 6 7 12 13 12 9 18"></polyline>
  </svg>
);

const WarehouseIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.17 6.5l8-4.5a2 2 0 0 1 1.66 0l8 4.5A2 2 0 0 1 22 8.35Z"></path>
      <path d="M6 18h12"></path>
      <path d="M6 14h12"></path>
      <rect width="12" height="12" x="6" y="10"></rect>
    </svg>
);


// --- THÀNH PHẦN GIAO DIỆN (UI Components) ---

// *** HEADER ĐÃ ĐƯỢC TÍCH HỢP ***
const GameHeader = ({ coins, gems, onClose }) => {
    return (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900/80 backdrop-blur-sm z-50">
            <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full hover:bg-slate-700/70 transition-colors"
                    aria-label="Đóng"
                >
                    <XIcon size={24} className="text-slate-300" />
                </button>
                <div className="flex items-center gap-2">
                    {/* CHANGED: Replaced with the exact code from background-game.tsx */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                        <div className="relative mr-0.5 flex items-center justify-center"><GemIcon size={16} className="relative z-20" /></div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">{formatNumber(gems)}</div>
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>
                    <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
};


// Component hiển thị thanh năng lượng
const EnergyBar = ({ energy, maxEnergy }) => {
  const percentage = (energy / maxEnergy) * 100;
  return (
    <div className="w-full bg-slate-700 rounded-full h-4 border-2 border-slate-600 relative">
      <div
        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xs font-bold drop-shadow-md">
          {Math.floor(energy)} / {maxEnergy}
        </span>
      </div>
    </div>
  );
};

// Component thẻ Hamster đã được mở khóa
const UnlockedHamsterCard = ({ hamster, onUpgrade, userCoins }) => {
  const levelProgress = (hamster.level / hamster.maxLevel) * 100;
  const canUpgrade = userCoins >= hamster.upgradeCost && hamster.level < hamster.maxLevel;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-slate-700 flex items-center gap-4 transition-all hover:bg-slate-700/70">
      <div className="text-5xl">🐹</div>
      <div className="flex-grow">
        <h3 className="font-bold text-white">{hamster.name}</h3>
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
          <span>Lv. {hamster.level}</span>
          <div className="w-1/2 bg-slate-600 rounded-full h-2 my-1">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${levelProgress}%` }}></div>
          </div>
        </div>
        <p className="text-xs text-amber-400 flex items-center gap-1">
          <DollarSignIcon size={12} /> {formatNumber(hamster.earnings)}/h
        </p>
      </div>
      <button
        onClick={() => onUpgrade(hamster.id)}
        disabled={!canUpgrade}
        className="bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-all hover:bg-pink-500 hover:scale-105 active:scale-100 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100"
      >
        <div className="text-sm">Nâng cấp</div>
        <div className="text-xs font-normal">{formatNumber(hamster.upgradeCost)}💰</div>
      </button>
    </div>
  );
};

// Component thẻ Hamster bị khóa
const LockedHamsterCard = ({ hamster, onUnlock, userCoins }) => {
  const canUnlock = userCoins >= hamster.unlockCost;
  return (
    <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-center gap-4 opacity-80">
      <div className="text-5xl filter grayscale"><span>🔒</span></div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-400">{hamster.name}</h3>
        <p className="text-xs text-amber-500 flex items-center gap-1">
          <DollarSignIcon size={12} /> {formatNumber(hamster.earnings)}/h
        </p>
      </div>
      <button
        onClick={() => onUnlock(hamster.id)}
        disabled={!canUnlock}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-5 rounded-lg transition-all hover:from-amber-400 hover:to-orange-400 hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100"
      >
        Mở khóa {formatNumber(hamster.unlockCost)}💰
      </button>
    </div>
  );
};

// Component Kho Thu Nhập
const IncomeStorageBar = ({ current, max, profitPerHour, onClaim }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isFull = current >= max;
  const timeToFill = profitPerHour > 0 ? max / profitPerHour : Infinity;
  const formatTimeToFill = (hours) => {
    if (hours === Infinity) return '...';
    if (hours < 1) return `${Math.floor(hours * 60)} phút`;
    if (hours < 24) return `${hours.toFixed(1)} giờ`;
    return `${Math.floor(hours / 24)} ngày`;
  };

  return (
    <section className={`bg-slate-800/60 p-4 rounded-2xl border ${isFull ? 'border-red-500/50' : 'border-slate-700'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${isFull ? 'animate-bounce' : ''}`}>📦</span>
          <h3 className="font-bold text-white">Kho Thu Nhập</h3>
        </div>
        <span className="text-xs text-slate-400">
          {isFull ? 'ĐÃ ĐẦY!' : `Đầy trong ~${formatTimeToFill(timeToFill)}`}
        </span>
      </div>
      
      <div className={`relative w-full bg-slate-900/50 rounded-full h-6 p-1 mb-3 shadow-inner ${isFull ? 'animate-pulse' : ''}`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${isFull ? 'from-red-500 to-orange-600' : 'from-amber-400 to-orange-500'} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%`}} />
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-sm font-bold text-white drop-shadow-md">
             {formatNumber(current)} / {formatNumber(max)}
          </span>
        </div>
      </div>
      
      <button onClick={onClaim} disabled={current === 0}
        className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold py-3 rounded-lg text-lg transition-all duration-300 hover:scale-105 active:scale-100 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-cyan-500/30">
        Thu Hoạch
      </button>
    </section>
  );
};


// --- THÀNH PHẦN CHÍNH CỦA GAME ---

interface BaseBuildingScreenProps {
  onClose: () => void;
  coins: number;
  gems: number;
  onUpdateCoins: (amount: number) => Promise<void>;
}

const BaseBuildingScreen: React.FC<BaseBuildingScreenProps> = ({ onClose, coins, gems, onUpdateCoins }) => {
  // State quản lý dữ liệu riêng của màn hình này (sẽ được load từ Firestore trong tương lai)
  const [offlineEarnings, setOfflineEarnings] = useState(0); 
  const [maxStorage, setMaxStorage] = useState(1000); 
  const [energy, setEnergy] = useState(500);
  const [maxEnergy, setMaxEnergy] = useState(500);
  const [tapPower, setTapPower] = useState(1);
  const [energyRegenRate, setEnergyRegenRate] = useState(2); 

  const [tapUpgradeCost, setTapUpgradeCost] = useState(100);
  const [energyUpgradeCost, setEnergyUpgradeCost] = useState(150);
  const [storageUpgradeCost, setStorageUpgradeCost] = useState(500);

  const [isTapping, setIsTapping] = useState(false);

  const [hamsters, setHamsters] = useState([
    { id: 1, name: 'Michelangelo', level: 1, maxLevel: 25, earnings: 10, upgradeCost: 50, unlocked: true },
    { id: 2, name: 'Beethoven', level: 1, maxLevel: 25, earnings: 50, upgradeCost: 300, unlocked: true },
    { id: 3, name: 'Shakespeare', level: 0, maxLevel: 25, earnings: 250, unlockCost: 1200, unlocked: false },
    { id: 4, name: 'Leonardo', level: 0, maxLevel: 25, earnings: 1000, unlockCost: 5000, unlocked: false },
  ]);

  // --- LOGIC GAME (Sử dụng hooks) ---

  const totalProfitPerHour = useMemo(() => {
    return hamsters.reduce((total, hamster) => {
      if (hamster.unlocked) return total + hamster.earnings;
      return total;
    }, 0);
  }, [hamsters]);

  useEffect(() => {
    const gameTick = setInterval(() => {
      setOfflineEarnings(prev => {
        if (prev < maxStorage) {
          const profitPerSecond = totalProfitPerHour / 3600;
          return Math.min(prev + profitPerSecond, maxStorage);
        }
        return prev;
      });
      setEnergy(prev => Math.min(prev + energyRegenRate, maxEnergy));
    }, 1000);
    return () => clearInterval(gameTick);
  }, [totalProfitPerHour, energyRegenRate, maxEnergy, maxStorage]);


  // --- CÁC HÀNH ĐỘNG CỦA NGƯỜI CHƠI (Tích hợp với Firestore) ---

  const handleUpdateAndSync = async (cost: number, localUpdateFn: () => void) => {
    if (coins < cost) {
      alert("Không đủ vàng!");
      return;
    }
    try {
      await onUpdateCoins(-cost);
      localUpdateFn();
    } catch (error) {
      console.error("Lỗi cập nhật dữ liệu:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
      // Optional: Revert local state if needed
    }
  };

  const handleTap = useCallback(async () => {
    if (energy >= tapPower) {
      setEnergy(e => e - tapPower);
      await onUpdateCoins(tapPower); // Thêm coin
      setIsTapping(true);
      setTimeout(() => setIsTapping(false), 100);
    }
  }, [energy, tapPower, onUpdateCoins]);

  const upgradeHamster = (id: number) => {
    const hamster = hamsters.find(h => h.id === id);
    if (!hamster || !hamster.unlocked || hamster.level >= hamster.maxLevel) return;
    
    handleUpdateAndSync(hamster.upgradeCost, () => {
      setHamsters(prev => prev.map(h => h.id === id ? {
        ...h,
        level: h.level + 1,
        earnings: Math.floor(h.earnings * 1.15),
        upgradeCost: Math.floor(h.upgradeCost * 1.18),
      } : h));
    });
  };

  const unlockHamster = (id: number) => {
    const hamster = hamsters.find(h => h.id === id);
    if (!hamster || hamster.unlocked) return;

    handleUpdateAndSync(hamster.unlockCost, () => {
      setHamsters(prev => prev.map(h => h.id === id ? { ...h, unlocked: true, level: 1 } : h));
    });
  };
  
  const upgradeTapPower = () => {
    handleUpdateAndSync(tapUpgradeCost, () => {
      setTapPower(p => p + 1);
      setTapUpgradeCost(cost => Math.floor(cost * 1.5));
    });
  };

  const upgradeEnergyLimit = () => {
    handleUpdateAndSync(energyUpgradeCost, () => {
      setMaxEnergy(e => e + 250);
      setEnergyUpgradeCost(cost => Math.floor(cost * 1.7));
    });
  };
  
  const claimOfflineEarnings = useCallback(async () => {
    const earningsToClaim = Math.floor(offlineEarnings);
    if (earningsToClaim > 0) {
      try {
        await onUpdateCoins(earningsToClaim);
        setOfflineEarnings(offlineEarnings - earningsToClaim);
      } catch (error) {
        console.error("Lỗi thu hoạch vàng:", error);
      }
    }
  }, [offlineEarnings, onUpdateCoins]);

  const upgradeMaxStorage = () => {
    handleUpdateAndSync(storageUpgradeCost, () => {
      setMaxStorage(s => Math.floor(s * 1.5));
      setStorageUpgradeCost(cost => Math.floor(cost * 1.8));
    });
  };


  // --- RENDER GIAO DIỆN ---
  return (
    <div className="absolute inset-0 bg-slate-900 text-white font-sans overflow-y-auto">
      <GameHeader coins={coins} gems={gems} onClose={onClose} />
      
      <div className="container mx-auto max-w-lg p-4 pt-20 pb-10">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mb-6 space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Lợi nhuận mỗi giờ</span>
                <div className="flex items-center gap-2 text-green-400">
                    <StarIcon size={20} />
                    <span className="font-bold text-lg">{formatNumber(totalProfitPerHour)}/h</span>
                </div>
             </div>
          <EnergyBar energy={energy} maxEnergy={maxEnergy} />
        </div>

        <IncomeStorageBar 
          current={offlineEarnings} 
          max={maxStorage} 
          profitPerHour={totalProfitPerHour} 
          onClaim={claimOfflineEarnings} 
        />

        <main className="text-center my-8">
          <div
            onClick={handleTap}
            className={`relative inline-block cursor-pointer select-none transition-transform duration-100 ${isTapping ? 'scale-95' : 'scale-100'}`}
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)]">
               <span className="text-8xl animate-bounce" style={{animationDuration: '2s'}}>🐹</span>
            </div>
          </div>
        </main>

        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-300">Nâng Cấp</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button onClick={upgradeTapPower} disabled={coins < tapUpgradeCost} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-left hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center gap-2 mb-1">
                <ChevronsUpIcon className="text-pink-400" />
                <h4 className="font-bold">Sức mạnh Tap</h4>
              </div>
              <p className="text-xs text-slate-400">Lv. {tapPower}</p>
              <p className="text-sm font-semibold text-white mt-1">{formatNumber(tapUpgradeCost)}💰</p>
            </button>
            <button onClick={upgradeEnergyLimit} disabled={coins < energyUpgradeCost} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-left hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center gap-2 mb-1">
                <BatteryChargingIcon className="text-cyan-400" />
                <h4 className="font-bold">Giới hạn Năng lượng</h4>
              </div>
              <p className="text-xs text-slate-400">Lv. {Math.floor(maxEnergy / 250 - 1)}</p>
              <p className="text-sm font-semibold text-white mt-1">{formatNumber(energyUpgradeCost)}💰</p>
            </button>
            <button onClick={upgradeMaxStorage} disabled={coins < storageUpgradeCost} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-left hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center gap-2 mb-1">
                <WarehouseIcon className="text-amber-400" />
                <h4 className="font-bold">Sức chứa Kho</h4>
              </div>
              <p className="text-xs text-slate-400">Lv. {Math.round(Math.log(maxStorage/1000) / Math.log(1.5)) + 1}</p>
              <p className="text-sm font-semibold text-white mt-1">{formatNumber(storageUpgradeCost)}💰</p>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-300">Hamsters Của Bạn</h2>
          <div className="space-y-3">
            {hamsters.map(hamster =>
              hamster.unlocked ? (
                <UnlockedHamsterCard key={hamster.id} hamster={hamster} onUpgrade={upgradeHamster} userCoins={coins} />
              ) : (
                <LockedHamsterCard key={hamster.id} hamster={hamster} onUnlock={unlockHamster} userCoins={coins} />
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BaseBuildingScreen;
// --- END OF FILE building.tsx ---
