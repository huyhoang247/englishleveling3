import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- BIỂU TƯỢNG SVG ---
const GemIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M12 22V9" /><path d="m3.5 9h17" /></svg> );
const CoinsIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="16" rx="7" ry="2.5" /><path d="M5 16V8.5c0-1.38 3.13-2.5 7-2.5s7 1.12 7 2.5V16" /><path d="M5 12.5c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5" /></svg> );
const ArrowUpIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg> );
const WarehouseIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 21V8l9-5 9 5v13h-4V11H7v10H3z"/><path d="M8 21v-8h8v8"/></svg> );
const ChevronRightIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6" /></svg> );
const StarIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> );
const HammerIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.81c0-.98-.91-1.78-2.02-1.78h-1.96c-.67 0-1.31.25-1.79.73L10.2 12l-1.65 1.65c-.59.59-.59 1.54 0 2.12l5.5 5.5c.59.59 1.54.59 2.12 0L19.5 17.5l1.41-1.41z"/></svg> );
const ShieldCheckIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg> );

// --- CẤU HÌNH GAME ---
const MAX_LEVEL_PER_BASE = 5;
const INITIAL_CRYSTALS = 500;
const INITIAL_GOLD_STORAGE = 1000;

const ALL_BASES = [
  { id: 0, name: "Mud Hut", stage: 1, goldPerSecond: 0.2, baseUpgradeCost: 25, unlockCost: 0, imageUrl: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250719_1127_Bi%E1%BB%83u%20T%C6%B0%E1%BB%A3ng%20Ng%C3%B4i%20Nh%C3%A0%20B%C3%B9n_simple_compose_01k0geyxbzezdvpkr11t976685.png' },
  { id: 1, name: "Thatched Lean-to", stage: 1, goldPerSecond: 0.5, baseUpgradeCost: 60, unlockCost: 250, imageUrl: 'https://placehold.co/400x300/a16207/ffffff?text=Lean-to' },
  { id: 2, name: "Wooden Palisade", stage: 1, goldPerSecond: 1.1, baseUpgradeCost: 150, unlockCost: 700, imageUrl: 'https://placehold.co/400x300/78350f/ffffff?text=Palisade' },
  { id: 3, name: "Watchtower", stage: 1, goldPerSecond: 2.5, baseUpgradeCost: 400, unlockCost: 1800, imageUrl: 'https://placehold.co/400x300/654321/ffffff?text=Watchtower' },
  { id: 4, name: "Stone Foundation", stage: 2, goldPerSecond: 5, baseUpgradeCost: 1000, unlockCost: 5000, imageUrl: 'https://placehold.co/400x300/6b7280/ffffff?text=Foundation' },
  { id: 5, name: "Reinforced Wall", stage: 2, goldPerSecond: 10, baseUpgradeCost: 2200, unlockCost: 12000, imageUrl: 'https://placehold.co/400x300/4b5563/ffffff?text=Wall' },
  { id: 6, name: "Guard Tower", stage: 2, goldPerSecond: 18, baseUpgradeCost: 5000, unlockCost: 30000, imageUrl: 'https://placehold.co/400x300/374151/ffffff?text=Guard+Tower' },
];

// --- CÁC COMPONENT GIAO DIỆN PHỤ ---
// THAY ĐỔI: Giảm shadow để thanh progress rõ hơn
const StyledProgressBar = ({ current, max, colorGradient, shadowColor, label }) => { const percentage = Math.max(0, (current / max) * 100); return ( <div className="w-full"><div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm"><div className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradient}`} style={{ width: `${percentage}%`, boxShadow: `0 0 10px ${shadowColor}` }}></div><div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold font-sans">{label ? label : <span>{Math.floor(current).toLocaleString()} / {max.toLocaleString()}</span>}</div></div></div> ); };
const ResourceDisplay = ({ icon, value, colorClass }) => ( <div className={`flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border ${colorClass}`}>{icon}<span className="font-bold text-lg text-white tracking-wider">{Math.floor(value).toLocaleString()}</span></div> );

const GameHeader = ({ gold, crystals }) => (
  <header className="fixed top-0 left-0 w-full z-30 p-3 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-20">
    <div className="max-w-6xl mx-auto flex justify-end items-center h-full">
      <div className="flex items-center gap-3">
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

const PortModal = ({ isOpen, onClose, goldInPort, goldStorage, goldPerSecond, onClaim, onUpgradeStorage, upgradeStorageCost, crystals }) => { if (!isOpen) return null; const canAffordUpgrade = crystals >= upgradeStorageCost; return ( <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}><div className="relative w-full max-w-md bg-slate-900/80 border border-slate-600 rounded-2xl shadow-2xl shadow-black/40 animate-fade-in-scale-fast text-white font-lilita m-4" onClick={(e) => e.stopPropagation()}><button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button><div className="p-6"><div className="flex items-center gap-3 mb-6"><WarehouseIcon className="w-10 h-10 text-indigo-400 drop-shadow-[0_2px_4px_rgba(129,140,248,0.4)]" /><h2 className="text-4xl text-white text-shadow tracking-wider">PORT</h2></div><div className="space-y-5 font-sans"><p className="text-slate-300 mb-1 text-sm">Mining Rate: <span className="text-xl font-bold text-green-400 text-shadow-sm">{goldPerSecond.toFixed(1)} Gold/s</span></p><div><p className="text-slate-300 mb-2 text-sm">Gold Storage</p><StyledProgressBar current={goldInPort} max={goldStorage} colorGradient="bg-gradient-to-r from-yellow-500 to-amber-400" shadowColor="rgba(234, 179, 8, 0.5)" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"><button onClick={onClaim} disabled={goldInPort < 1} className="w-full font-lilita tracking-wider text-lg flex items-center justify-center gap-2 bg-green-600/80 text-white font-semibold px-4 py-3 rounded-lg border border-green-500/80 hover:bg-green-600 transition-all duration-200 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed"><CoinsIcon className="w-6 h-6" /><span>CLAIM</span></button><button onClick={onUpgradeStorage} disabled={!canAffordUpgrade} className="w-full font-lilita tracking-wider text-lg flex items-center justify-center gap-2 bg-sky-600/80 text-white font-semibold px-4 py-3 rounded-lg border border-sky-500/80 hover:bg-sky-600 transition-all duration-200 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed"><HammerIcon className="w-5 h-5" /><span>UPGRADE ({upgradeStorageCost} <GemIcon className="inline-block w-4 h-4 align-[-0.15em]" />)</span></button></div></div></div></div></div> ); };

// --- COMPONENT THẺ CĂN CỨ ---
const FocusBaseCard = ({ baseData, playerState, onLevelUp, onUnlockNext, nextBaseData, crystals, gold }) => {
  if (!baseData || !playerState) return null;

  const { name, goldPerSecond, imageUrl } = baseData;
  const { level, upgradeCost } = playerState;
  
  const isMaxLevel = level >= MAX_LEVEL_PER_BASE;
  const canAffordUpgrade = crystals >= upgradeCost;
  const canAffordUnlock = nextBaseData ? gold >= nextBaseData.unlockCost : false;

  const renderActionButton = () => {
    if (isMaxLevel) {
      if (nextBaseData) {
        return (
          <button
            onClick={onUnlockNext}
            disabled={!canAffordUnlock}
            className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold px-4 py-4 rounded-lg border border-green-500/80 transition-all duration-200 hover:bg-green-600 hover:shadow-[0_0_20px_theme(colors.green.500/0.5)] active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed"
          >
            <span className="font-lilita text-xl tracking-wider">UNLOCK NEXT</span>
            <div className="flex items-center gap-1 font-sans">
              <span className="font-bold">{nextBaseData.unlockCost.toLocaleString()}</span>
              <CoinsIcon className="w-5 h-5" />
            </div>
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        );
      } else {
        return (
          <div className="text-center font-lilita tracking-widest text-yellow-400 bg-yellow-500/10 py-3 rounded-lg border border-yellow-500/20 flex items-center justify-center gap-2 text-xl">
            <ShieldCheckIcon className="w-6 h-6"/> ALL BASES COMPLETED
          </div>
        );
      }
    } else {
      return (
        <button
          onClick={onLevelUp}
          disabled={!canAffordUpgrade}
          className="btn-shine relative overflow-hidden w-full flex items-center justify-center gap-2 bg-slate-800/80 text-cyan-300 font-bold px-4 py-4 rounded-lg border border-cyan-500/40 transition-all duration-200 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_20px_theme(colors.cyan.500/0.5)] active:scale-95 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <ArrowUpIcon className="w-5 h-5" />
          <span className="font-lilita text-xl tracking-wider">UPGRADE</span>
          <div className="flex items-center gap-1 font-sans">
            <span className="font-bold">{upgradeCost.toLocaleString()}</span>
            <GemIcon className="w-5 h-5" />
          </div>
        </button>
      );
    }
  };

  return (
    <div className="group w-full max-w-sm bg-slate-900/70 backdrop-blur-md rounded-2xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden animate-fade-in-scale-fast">
      <div className="relative w-full h-40 overflow-hidden bg-black/20 p-2">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      </div>
      <div className="p-6 pt-4 flex flex-col flex-grow">
        <div className="text-center mb-6">
          <h2 className="font-lilita text-4xl text-white text-shadow-sm truncate">{name}</h2>
        </div>
        <div className="flex-grow">
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: MAX_LEVEL_PER_BASE }).map((_, i) => (
                <StarIcon key={i} className={`w-7 h-7 transition-all duration-300 ${i < level ? 'text-yellow-400 fill-yellow-500/80' : 'text-slate-600'}`} />
              ))}
            </div>
            {/* THAY ĐỔI: Ẩn dòng level, chỉ giữ lại gold/s */}
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <p className="font-sans text-sm text-green-400">+{(goldPerSecond * level).toFixed(1)} Gold/s from this base</p>
            </div>
        </div>
        <div className="mt-6">
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH CỦA GAME ---
interface BaseBuildingProps {
  onClose: () => void;
}

// RENAME: from App to BaseBuildingScreen, and add onClose prop
export default function BaseBuildingScreen({ onClose }: BaseBuildingProps) {
  const [gold, setGold] = useState(0);
  const [crystals, setCrystals] = useState(INITIAL_CRYSTALS);
  const [currentBaseIndex, setCurrentBaseIndex] = useState(0);
  const [playerBases, setPlayerBases] = useState([{ id: 0, level: 0, upgradeCost: ALL_BASES[0].baseUpgradeCost }]);
  const [goldInPort, setGoldInPort] = useState(0);
  const [goldStorage, setGoldStorage] = useState(INITIAL_GOLD_STORAGE);
  const [isPortOpen, setIsPortOpen] = useState(false);

  const currentBaseData = useMemo(() => ALL_BASES[currentBaseIndex], [currentBaseIndex]);
  const nextBaseData = useMemo(() => ALL_BASES[currentBaseIndex + 1], [currentBaseIndex]);
  const currentBaseState = useMemo(() => playerBases.find(b => b.id === currentBaseIndex), [playerBases, currentBaseIndex]);
  
  const currentStage = currentBaseData?.stage || 1;

  const basesInCurrentStage = useMemo(() => ALL_BASES.filter(b => b.stage === currentStage), [currentStage]);
  const totalBasesInStage = basesInCurrentStage.length;
  const currentBaseStageIndex = useMemo(() => basesInCurrentStage.findIndex(b => b.id === currentBaseIndex), [basesInCurrentStage, currentBaseIndex]);
  const progressInStage = currentBaseStageIndex + 1;

  const goldPerSecond = useMemo(() => {
    return playerBases.reduce((total, pBase) => {
      const baseData = ALL_BASES.find(b => b.id === pBase.id);
      if (!baseData) return total;
      return total + (baseData.goldPerSecond * pBase.level);
    }, 0);
  }, [playerBases]);

  useEffect(() => {
    const gameTick = setInterval(() => {
      setGoldInPort(prev => Math.min(goldStorage, prev + goldPerSecond / 10));
    }, 100);
    return () => clearInterval(gameTick);
  }, [goldPerSecond, goldStorage]);

  const upgradeStorageCost = useMemo(() => Math.floor(goldStorage / 5), [goldStorage]);

  const handleLevelUp = useCallback(() => {
    if (!currentBaseState || !currentBaseData || currentBaseState.level >= MAX_LEVEL_PER_BASE) return;
    if (crystals >= currentBaseState.upgradeCost) {
      setCrystals(prev => prev - currentBaseState.upgradeCost);
      setPlayerBases(prevPlayerBases =>
        prevPlayerBases.map(b =>
          b.id === currentBaseIndex
            ? { ...b, level: b.level + 1, upgradeCost: Math.floor(b.upgradeCost * 1.8 + currentBaseData.baseUpgradeCost * 0.5) }
            : b
        )
      );
    }
  }, [crystals, currentBaseIndex, currentBaseState, currentBaseData]);

  const handleUnlockNextBase = useCallback(() => {
    if (!nextBaseData || !currentBaseData || gold < nextBaseData.unlockCost) return;
    
    setGold(prev => prev - nextBaseData.unlockCost);
    setCurrentBaseIndex(prev => prev + 1);
    setPlayerBases(prev => [...prev, { id: nextBaseData.id, level: 0, upgradeCost: nextBaseData.baseUpgradeCost }]);

    if (nextBaseData.stage > currentBaseData.stage) {
      const bonus = 500 * currentBaseData.stage;
      setCrystals(prev => prev + bonus);
      alert(`Congratulations! You've reached Stage ${nextBaseData.stage} and earned ${bonus} Crystals!`);
    }
  }, [gold, nextBaseData, currentBaseData]);

  const handleClaimGold = useCallback(() => { setGold(prev => prev + goldInPort); setGoldInPort(0); }, [goldInPort]);
  const handleUpgradeStorage = useCallback(() => { if (crystals >= upgradeStorageCost) { setCrystals(prev => prev - upgradeStorageCost); setGoldStorage(prev => Math.floor(prev * 1.5)); } }, [crystals, upgradeStorageCost]);

  return (
    <div className="main-bg relative min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] text-white overflow-hidden flex flex-col">
       {/* NEW: Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.6); }
        .text-shadow-sm { text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: 0; pointer-events: none; }
        .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); }
        .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); }
        .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.7s ease; }
        .btn-shine:hover:not(:disabled)::before { left: 125%; }
      `}</style>
      
      <GameHeader gold={gold} crystals={crystals} />

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 md:p-6 pt-20">
        
        <div className="w-full max-w-sm mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-lilita text-white text-shadow">Stage {currentStage}</h2>
            <button
              onClick={() => setIsPortOpen(true)}
              className="btn-shine relative overflow-hidden bg-slate-800/90 backdrop-blur-md text-white font-lilita tracking-wider px-6 py-2 rounded-lg shadow-lg shadow-black/20 hover:bg-slate-700 transition-all duration-300 border border-slate-600/80 hover:scale-105 active:scale-100"
            >
              Port
            </button>
          </div>
          <StyledProgressBar
            current={progressInStage}
            max={totalBasesInStage}
            colorGradient="bg-gradient-to-r from-purple-500 to-indigo-600"
            shadowColor="rgba(167, 139, 250, 0.5)"
            label={
              // THAY ĐỔI: Chuyển sang font-lilita và giảm kích thước
              <span className="font-lilita text-sm tracking-wider !font-normal">
                Base <span className="font-black">{progressInStage}</span> / {totalBasesInStage}
              </span>
            }
          />
        </div>

        <div className="w-full flex items-center justify-center">
            <FocusBaseCard
                baseData={currentBaseData}
                playerState={currentBaseState}
                onLevelUp={handleLevelUp}
                onUnlockNext={handleUnlockNextBase}
                nextBaseData={nextBaseData}
                crystals={crystals}
                gold={gold}
            />
        </div>
      </main>
      
      <PortModal isOpen={isPortOpen} onClose={() => setIsPortOpen(false)} goldInPort={goldInPort} goldStorage={goldStorage} goldPerSecond={goldPerSecond} onClaim={handleClaimGold} onUpgradeStorage={handleUpgradeStorage} upgradeStorageCost={upgradeStorageCost} crystals={crystals} />
    </div>
  );
}
