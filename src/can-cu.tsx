import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- BIỂU TƯỢNG SVG (thay thế cho lucide-react) ---

const GemIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M12 22V9" />
    <path d="m3.5 9h17" />
  </svg>
);

const CoinsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="16" rx="7" ry="2.5" />
    <path d="M5 16V8.5c0-1.38 3.13-2.5 7-2.5s7 1.12 7 2.5V16" />
    <path d="M5 12.5c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5" />
  </svg>
);

const ArrowUpIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const WarehouseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 21V8l9-5 9 5v13h-4V11H7v10H3z"/>
    <path d="M8 21v-8h8v8"/>
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const StarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HammerIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/>
    <path d="M17.64 15 22 10.64"/>
    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.81c0-.98-.91-1.78-2.02-1.78h-1.96c-.67 0-1.31.25-1.79.73L10.2 12l-1.65 1.65c-.59.59-.59 1.54 0 2.12l5.5 5.5c.59.59 1.54.59 2.12 0L19.5 17.5l1.41-1.41z"/>
  </svg>
);

const ShieldCheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);


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
            icon={<CoinsIcon className="w-6 h-6 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />}
            value={gold}
            colorClass="border-yellow-500/30"
        />
        <ResourceDisplay 
            icon={<GemIcon className="w-6 h-6 text-cyan-400 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />}
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
            <StarIcon key={i} className={`w-5 h-5 transition-all duration-300 ${i < base.level ? 'text-yellow-400 fill-yellow-500/80' : 'text-slate-600'}`} />
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
          <ArrowUpIcon className="w-4 h-4" />
          <span className="font-lilita tracking-wider">UPGRADE</span>
          <div className="flex items-center gap-1 font-sans">
            <span className="font-bold">{base.upgradeCost}</span>
            <GemIcon className="w-4 h-4" />
          </div>
        </button>
      )}
      {isMaxLevel && (
        <div className="mt-4 text-center font-lilita tracking-widest text-yellow-400 bg-yellow-500/10 py-2 rounded-lg border border-yellow-500/20 flex items-center justify-center gap-2">
            <ShieldCheckIcon className="w-5 h-5"/> MAX LEVEL
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
              <WarehouseIcon className="w-10 h-10 text-indigo-400 drop-shadow-[0_2px_4px_rgba(129,140,248,0.4)]" />
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
                  <CoinsIcon className="w-6 h-6" />
                  <span>CLAIM</span>
                </button>
                <button
                  onClick={onUpgradeStorage}
                  disabled={!canAffordUpgrade}
                  className="w-full font-lilita tracking-wider text-lg flex items-center justify-center gap-2 bg-sky-600/80 text-white font-semibold px-4 py-3 rounded-lg border border-sky-500/80 hover:bg-sky-600 transition-all duration-200 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed"
                >
                  <HammerIcon className="w-5 h-5" />
                  <span>UPGRADE ({upgradeStorageCost} <GemIcon className="inline-block w-4 h-4 align-[-0.15em]" />)</span>
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
                    <ChevronRightIcon className="w-6 h-6" />
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
          <WarehouseIcon className="w-7 h-7" />
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
