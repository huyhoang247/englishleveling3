import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- TIỆN ÍCH ---
const formatNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

// --- CÁC COMPONENT ICON SVG (Thay thế cho Lucide-React) ---

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

const SettingsIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.82l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.82l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
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


// --- THÀNH PHẦN GIAO DIỆN (UI Components) ---

const StatDisplay = ({ icon, value, label, iconBgColor, valueColor }) => (
  <div className="flex items-center gap-2">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor}`}>
      {icon}
    </div>
    <div>
      <span className={`font-bold text-lg ${valueColor}`}>{value}</span>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  </div>
);

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


// --- THÀNH PHẦN CHÍNH CỦA GAME ---

const HamsterKombatClone = () => {
  const [coins, setCoins] = useState(10000);
  const [energy, setEnergy] = useState(500);
  const [maxEnergy, setMaxEnergy] = useState(500);
  const [tapPower, setTapPower] = useState(1);
  const [energyRegenRate, setEnergyRegenRate] = useState(2);

  const [tapUpgradeCost, setTapUpgradeCost] = useState(100);
  const [energyUpgradeCost, setEnergyUpgradeCost] = useState(150);
  const [isTapping, setIsTapping] = useState(false);

  const [hamsters, setHamsters] = useState([
    { id: 1, name: 'Michelangelo', level: 1, maxLevel: 25, earnings: 10, upgradeCost: 50, unlocked: true },
    { id: 2, name: 'Beethoven', level: 1, maxLevel: 25, earnings: 50, upgradeCost: 300, unlocked: true },
    { id: 3, name: 'Shakespeare', level: 0, maxLevel: 25, earnings: 250, unlockCost: 1200, unlocked: false },
    { id: 4, name: 'Leonardo', level: 0, maxLevel: 25, earnings: 1000, unlockCost: 5000, unlocked: false },
    { id: 5, name: 'Einstein', level: 0, maxLevel: 30, earnings: 8000, unlockCost: 25000, unlocked: false },
    { id: 6, name: 'Tesla', level: 0, maxLevel: 30, earnings: 50000, unlockCost: 150000, unlocked: false },
  ]);

  const totalProfitPerHour = useMemo(() => {
    return hamsters.reduce((total, hamster) => {
      if (hamster.unlocked) return total + hamster.earnings;
      return total;
    }, 0);
  }, [hamsters]);

  useEffect(() => {
    const gameTick = setInterval(() => {
      setCoins(prevCoins => prevCoins + totalProfitPerHour / 3600);
      setEnergy(prevEnergy => Math.min(prevEnergy + energyRegenRate, maxEnergy));
    }, 1000);
    return () => clearInterval(gameTick);
  }, [totalProfitPerHour, energyRegenRate, maxEnergy]);

  const handleTap = useCallback(() => {
    if (energy >= tapPower) {
      setEnergy(e => e - tapPower);
      setCoins(c => c + tapPower);
      setIsTapping(true);
      setTimeout(() => setIsTapping(false), 100);
    }
  }, [energy, tapPower]);

  const upgradeHamster = useCallback((id) => {
    setHamsters(prevHamsters =>
      prevHamsters.map(h => {
        if (h.id === id && h.unlocked && coins >= h.upgradeCost && h.level < h.maxLevel) {
          setCoins(c => c - h.upgradeCost);
          return { ...h, level: h.level + 1, earnings: Math.floor(h.earnings * 1.15), upgradeCost: Math.floor(h.upgradeCost * 1.18) };
        }
        return h;
      })
    );
  }, [coins]);

  const unlockHamster = useCallback((id) => {
    setHamsters(prevHamsters =>
      prevHamsters.map(h => {
        if (h.id === id && !h.unlocked && coins >= h.unlockCost) {
          setCoins(c => c - h.unlockCost);
          return { ...h, unlocked: true, level: 1 };
        }
        return h;
      })
    );
  }, [coins]);
  
  const upgradeTapPower = useCallback(() => {
    if (coins >= tapUpgradeCost) {
      setCoins(c => c - tapUpgradeCost);
      setTapPower(p => p + 1);
      setTapUpgradeCost(cost => Math.floor(cost * 1.5));
    }
  }, [coins, tapUpgradeCost]);

  const upgradeEnergyLimit = useCallback(() => {
    if (coins >= energyUpgradeCost) {
      setCoins(c => c - energyUpgradeCost);
      setMaxEnergy(e => e + 250);
      setEnergyUpgradeCost(cost => Math.floor(cost * 1.7));
    }
  }, [coins, energyUpgradeCost]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <div className="container mx-auto max-w-lg p-4">
        <header className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <StatDisplay
              icon={<DollarSignIcon size={20} className="text-amber-300" />}
              value={formatNumber(coins)}
              label="Coins"
              iconBgColor="bg-amber-500/20"
              valueColor="text-amber-400"
            />
             <StatDisplay
              icon={<StarIcon size={20} className="text-green-300" />}
              value={formatNumber(totalProfitPerHour) + '/h'}
              label="Profit"
              iconBgColor="bg-green-500/20"
              valueColor="text-green-400"
            />
            <button className="p-2 text-slate-400 hover:text-white transition">
              <SettingsIcon size={24} />
            </button>
          </div>
          <EnergyBar energy={energy} maxEnergy={maxEnergy} />
        </header>

        <main className="text-center mb-6">
          <div
            onClick={handleTap}
            className={`relative inline-block cursor-pointer select-none transition-transform duration-100 ${isTapping ? 'scale-95' : 'scale-100'}`}
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)]">
               <span className="text-8xl animate-bounce" style={{animationDuration: '2s'}}>🐹</span>
            </div>
          </div>
        </main>

        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-300">Nâng Cấp</h2>
          <div className="grid grid-cols-2 gap-4">
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
              <p className="text-xs text-slate-400">Lv. {maxEnergy / 250 - 1}</p>
              <p className="text-sm font-semibold text-white mt-1">{formatNumber(energyUpgradeCost)}💰</p>
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

export default HamsterKombatClone;
