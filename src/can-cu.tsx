import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Gem, Coins, ArrowUp, Warehouse, ChevronRight, Star, X, Hammer, ShieldCheck } from 'lucide-react';

// --- CẤU HÌNH GAME ---
const BASE_NAMES_BY_STAGE = {
  1: [
    "Mud Hut", "Thatched Lean-to", "Wooden Palisade", "Watchman’s Watchtower",
    "Crude Campfire Pit", "Stockaded Outpost", "Timber Barricade", "Beacon Torchstand",
    "Log Guardpost", "Stone Cairn"
  ],
  2: [
    "Stone Foundation", "Reinforced Wall", "Guard Tower", "Small Barracks",
    "Forge", "Mess Hall", "Archery Range", "Stable",
    "Sentry Post", "Fortified Gatehouse"
  ],
};

const MAX_LEVEL_PER_BASE = 3;
const BASES_PER_STAGE = 10;
const INITIAL_CRYSTALS = 500;
const INITIAL_GOLD_STORAGE = 1000;
const CRYSTALS_PER_STAGE_CLEAR = 1000;

// --- CÁC COMPONENT GIAO DIỆN (UI Components) - Phong cách Boss.tsx ---

// Component Thanh tiến trình/máu được nâng cấp
const StyledProgressBar = ({ current, max, colorGradient, shadowColor }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradient}`}
          style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}` }}
        ></div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold font-sans">
          <span>{Math.floor(current).toLocaleString()} / {max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Component hiển thị tài nguyên
const ResourceDisplay = ({ icon, value, colorClass }) => (
    <div className={`flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border ${colorClass}`}>
        {icon}
        <span className="font-bold text-lg text-white tracking-wider">{Math.floor(value).toLocaleString()}</span>
    </div>
);

// Component Header
const GameHeader = ({ gold, crystals }) => (
  <header className="fixed top-0 left-0 w-full z-30 p-3 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-20">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <h1 className="text-3xl font-lilita text-yellow-300 text-shadow tracking-wider">BASE BUILDER</h1>
      <div className="flex items-center gap-4">
        <ResourceDisplay 
            icon={<Coins className="w-6 h-6 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />}
            value={gold}
            colorClass="border-yellow-500/30"
        />
        <ResourceDisplay 
            icon={<Gem className="w-6 h-6 text-cyan-400 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />}
            value={crystals}
            colorClass="border-cyan-500/30"
        />
      </div>
    </div>
  </header>
);

// Component Card cho mỗi Căn cứ
const BaseCard = ({ base, onLevelUp, crystals }) => {
  const isMaxLevel = base.level >= MAX_LEVEL_PER_BASE;
  const canAfford = crystals >= base.upgradeCost;

  const borderClass = isMaxLevel 
    ? 'border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
    : 'border-slate-700 hover:border-cyan-500/70';

  return (
    <div className={`bg-slate-900/70 backdrop-blur-sm p-4 rounded-xl border ${borderClass} transition-all duration-300 flex flex-col justify-between`}>
      <div>
        <h3 className="font-lilita text-xl text-white text-shadow-sm truncate">{base.name}</h3>
        <p className="font-sans text-sm text-slate-400 mb-2">Level {base.level}</p>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: MAX_LEVEL_PER_BASE }).map((_, i) => (
            <Star key={i} className={`w-5 h-5 transition-all duration-300 ${i < base.level ? 'text-yellow-400 fill-yellow-500/80' : 'text-slate-600'}`} />
          ))}
        </div>
        <div className="font-sans text-sm text-green-400">
          +{(base.goldPerSecond * base.level).toFixed(1)} Gold/s
        </div>
      </div>
      {!isMaxLevel && (
        <button
          onClick={() => onLevelUp(base.id)}
          disabled={!canAfford}
          className="btn-shine relative overflow-hidden mt-4 w-full flex items-center justify-center gap-2 bg-slate-800/80 text-cyan-300 font-bold px-3 py-2 rounded-lg border border-cyan-500/40 transition-all duration-200 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_theme(colors.cyan.500/0.5)] active:scale-95 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="font-lilita tracking-wider">UPGRADE</span>
          <div className="flex items-center gap-1 font-sans">
            <span className="font-bold">{base.upgradeCost}</span>
            <Gem className="w-4 h-4" />
          </div>
        </button>
      )}
      {isMaxLevel && (
        <div className="mt-4 text-center font-lilita tracking-widest text-yellow-400 bg-yellow-500/10 py-2 rounded-lg border border-yellow-500/20 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5"/> MAX LEVEL
        </div>
      )}
    </div>
  );
};

// Component Popup "Port"
const PortModal = ({ isOpen, onClose, goldInPort, goldStorage, goldPerSecond, onClaim, onUpgradeStorage, upgradeStorageCost, crystals }) => {
  if (!isOpen) return null;
  const canAffordUpgrade = crystals >= upgradeStorageCost;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-md bg-slate-900/80 border border-slate-600 rounded-2xl shadow-2xl shadow-black/40 animate-fade-in-scale-fast text-white font-lilita m-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Warehouse className="w-10 h-10 text-indigo-400 drop-shadow-[0_2px_4px_rgba(129,140,248,0.4)]" />
              <h2 className="text-4xl text-white text-shadow tracking-wider">PORT</h2>
            </div>

            <div className="space-y-5 font-sans">
              <div>
                <p className="text-slate-300 mb-1 text-sm">Mining Rate</p>
                <p className="text-3xl font-bold text-green-400 text-shadow-sm">{goldPerSecond.toFixed(1)} Gold/s</p>
              </div>

              <div>
                <p className="text-slate-300 mb-2 text-sm">Gold Storage</p>
                <StyledProgressBar 
                  current={goldInPort} 
                  max={goldStorage} 
                  colorGradient="bg-gradient-to-r from-yellow-500 to-amber-400" 
                  shadowColor="rgba(234, 179, 8, 0.5)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={onClaim}
                  disabled={goldInPort < 1}
                  className="w-full font-lilita tracking-wider text-lg flex items-center justify-center gap-2 bg-green-600/80 text-white font-semibold px-4 py-3 rounded-lg border border-green-500/80 hover:bg-green-600 transition-all duration-200 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed"
                >
                  <Coins className="w-6 h-6" />
                  <span>CLAIM</span>
                </button>
                <button
                  onClick={onUpgradeStorage}
                  disabled={!canAffordUpgrade}
                  className="w-full font-lilita tracking-wider text-lg flex items-center justify-center gap-2 bg-sky-600/80 text-white font-semibold px-4 py-3 rounded-lg border border-sky-500/80 hover:bg-sky-600 transition-all duration-200 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed"
                >
                  <Hammer className="w-5 h-5" />
                  <span>UPGRADE ({upgradeStorageCost} <Gem className="inline w-4 h-4" />)</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENT CHÍNH CỦA GAME ---
export default function App() {
  const [gold, setGold] = useState(0);
  const [crystals, setCrystals] = useState(INITIAL_CRYSTALS);
  const [currentStage, setCurrentStage] = useState(1);
  const [bases, setBases] = useState([]);
  const [goldInPort, setGoldInPort] = useState(0);
  const [goldStorage, setGoldStorage] = useState(INITIAL_GOLD_STORAGE);
  const [isPortOpen, setIsPortOpen] = useState(false);

  useEffect(() => {
    const stageBases = (BASE_NAMES_BY_STAGE[currentStage] || []).map((name, index) => {
      const baseId = (currentStage - 1) * BASES_PER_STAGE + index;
      return {
        id: baseId,
        name: name,
        level: 0,
        upgradeCost: 25 * (baseId + 1),
        goldPerSecond: 0.2 * (baseId + 1) + 0.1,
      };
    });
    setBases(stageBases);
  }, [currentStage]);

  const goldPerSecond = useMemo(() => {
    return bases.reduce((total, base) => total + base.goldPerSecond * base.level, 0);
  }, [bases]);

  useEffect(() => {
    const gameTick = setInterval(() => {
      setGoldInPort(prev => Math.min(goldStorage, prev + goldPerSecond / 10));
    }, 100);
    return () => clearInterval(gameTick);
  }, [goldPerSecond, goldStorage]);

  const upgradeStorageCost = useMemo(() => Math.floor(goldStorage / 5), [goldStorage]);

  const handleLevelUp = useCallback((baseId) => {
    setBases(prevBases =>
      prevBases.map(b => {
        if (b.id === baseId && b.level < MAX_LEVEL_PER_BASE && crystals >= b.upgradeCost) {
          setCrystals(prev => prev - b.upgradeCost);
          return { ...b, level: b.level + 1, upgradeCost: Math.floor(b.upgradeCost * 2.8) };
        }
        return b;
      })
    );
  }, [crystals]);

  const handleClaimGold = useCallback(() => {
    setGold(prev => prev + goldInPort);
    setGoldInPort(0);
  }, [goldInPort]);

  const handleUpgradeStorage = useCallback(() => {
    if (crystals >= upgradeStorageCost) {
      setCrystals(prev => prev - upgradeStorageCost);
      setGoldStorage(prev => Math.floor(prev * 1.5));
    }
  }, [crystals, upgradeStorageCost]);

  const handleNextStage = useCallback(() => {
    if (currentStage < Object.keys(BASE_NAMES_BY_STAGE).length) {
      setCurrentStage(prev => prev + 1);
      setCrystals(prev => prev + CRYSTALS_PER_STAGE_CLEAR);
      // In a real app, use a styled modal for notifications
      alert(`Congratulations! Unlocked Stage ${currentStage + 1} & earned ${CRYSTALS_PER_STAGE_CLEAR} Crystals!`);
    } else {
      alert("You've completed all available stages!");
    }
  }, [currentStage]);

  const allBasesMaxed = useMemo(() => {
    if (bases.length === 0) return false;
    return bases.every(b => b.level >= MAX_LEVEL_PER_BASE);
  }, [bases]);


  return (
    <div className="main-bg relative min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.6); }
        .text-shadow-sm { text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.3s ease-out forwards; }
        .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: 0; pointer-events: none; }
        .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); }
        .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); }
        .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.7s ease; }
        .btn-shine:hover:not(:disabled)::before { left: 125%; }
      `}</style>

      <GameHeader gold={gold} crystals={crystals} />

      <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-lilita text-white text-shadow">Stage {currentStage}</h2>
            {allBasesMaxed && (
                <button 
                    onClick={handleNextStage}
                    className="flex items-center gap-2 bg-green-600/80 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-100 animate-fade-in border border-green-500/80 shadow-lg shadow-green-500/20"
                >
                    <span className="font-lilita text-lg tracking-wider">NEXT STAGE</span>
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {bases.map(base => (
            <BaseCard key={base.id} base={base} onLevelUp={handleLevelUp} crystals={crystals} />
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-20">
        <button
          onClick={() => setIsPortOpen(true)}
          className="btn-shine relative overflow-hidden bg-indigo-700/90 backdrop-blur-md text-white font-lilita tracking-widest text-xl px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all duration-300 flex items-center gap-3 border border-indigo-500 hover:scale-105 active:scale-100"
        >
          <Warehouse className="w-7 h-7" />
          <span>PORT</span>
        </button>
      </footer>

      <PortModal
        isOpen={isPortOpen}
        onClose={() => setIsPortOpen(false)}
        goldInPort={goldInPort}
        goldStorage={goldStorage}
        goldPerSecond={goldPerSecond}
        onClaim={handleClaimGold}
        onUpgradeStorage={handleUpgradeStorage}
        upgradeStorageCost={upgradeStorageCost}
        crystals={crystals}
      />
    </div>
  );
}
