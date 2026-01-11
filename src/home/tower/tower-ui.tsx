// --- START OF FILE tower-ui.tsx ---

import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { BossBattleProvider, useBossBattle, CombatStats } from './tower-context.tsx';
import BOSS_DATA from './tower-data.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import EnergyDisplay from '../../ui/display/energy-display.tsx'; 
import { uiAssets, bossBattleAssets } from '../../game-assets.ts';
import BossBattleLoader from './tower-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';

// --- IMPORT BOSS & ELEMENTS ---
import { ELEMENTS, ElementKey } from './thuoc-tinh.tsx';
// Update Import: Lấy cả BossDisplay và HeroDisplay từ file chung
import BossDisplay, { HeroDisplay } from './boss-display.tsx'; 

interface BossBattleWrapperProps {
  userId: string;
  onClose: () => void;
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete: (newFloor: number) => void;
}

// --- UI ICONS ---
const HomeIcon = memo(({ className = '' }: { className?: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> 
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> 
    </svg> 
));

// --- FLOATING TEXT COMPONENT ---
const FloatingText = ({ text, id, colorClass, side }: { text: string, id: number, colorClass: string, side: 'left' | 'right' }) => {
  const positionClass = side === 'left' ? 'left-[20%] md:left-[25%]' : 'right-[20%] md:right-[25%]';
  return (
    <div key={id} className={`absolute top-1/2 ${positionClass} font-lilita text-2xl animate-float-up pointer-events-none z-50 ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
  );
};

// --- SLASH EFFECT COMPONENT ---
const SlashEffect = ({ id }: { id: number }) => {
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/slashing-effect.webp";
    return (
        <div key={id} className="absolute top-[35%] right-[15%] md:right-[20%] z-40 pointer-events-none animate-slash-fly">
             <div 
                className="animate-slash-play"
                style={{
                    width: '247.17px',
                    height: '242.33px',
                    backgroundImage: `url(${spriteUrl})`,
                    backgroundSize: '1483px 1454px',
                    backgroundRepeat: 'no-repeat',
                    transformOrigin: 'center center',
                    transform: 'scale(0.8)',
                }}
             />
        </div>
    );
};

// --- MODALS ---

const CharacterStatsModal = memo(({ character, characterType, onClose }: { character: CombatStats, characterType: 'player' | 'boss', onClose: () => void }) => {
  const isPlayer = characterType === 'player';
  const title = isPlayer ? 'YOUR STATS' : 'BOSS STATS';
  const titleColor = isPlayer ? 'text-blue-300' : 'text-red-400';
  
  const StatItem = ({ label, icon, current, max }: { label: string, icon: string, current: number, max?: number }) => {
    const valueText = max ? String(max) : String(current);
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0 w-24 h-10 bg-slate-800 rounded-lg flex items-center justify-center gap-2 border border-slate-700 p-2">
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm text-slate-300 tracking-wider">{label}</span>
        </div>
        <div className="flex-grow h-10 bg-black/40 rounded-lg flex items-center justify-center border border-slate-700/80">
          <span className="font-bold text-sm text-white text-shadow-sm tracking-wider">{valueText}</span>
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-4 border-b border-slate-700"><h3 className={`text-xl font-bold text-center ${titleColor} text-shadow-sm tracking-widest`}>{title}</h3></div>
        <div className="p-5 flex flex-col gap-4">
          <StatItem label="HP" icon={uiAssets.statHpIcon} current={character.hp} max={character.maxHp} />
          <StatItem label="ATK" icon={uiAssets.statAtkIcon} current={character.atk} />
          <StatItem label="DEF" icon={uiAssets.statDefIcon} current={character.def} />
        </div>
      </div>
    </div>
  )
});

const LogModal = memo(({ log, onClose }: { log: string[], onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 max-w-md bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans">✕</button>
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide">BATTLE HISTORY</h3>
            </div>
            <div className="h-80 overflow-y-auto p-4 flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                {log.length > 0 ? log.map((entry, index) => (
                    <p key={index} className="text-slate-300 mb-2 border-b border-slate-800/50 pb-2" dangerouslySetInnerHTML={{ __html: entry }}></p>
                )) : (
                    <p className="text-slate-400 text-center italic">Chưa có lịch sử trận đấu.</p>
                )}
            </div>
        </div>
    </div>
));

const RewardsModal = memo(({ onClose, rewards }: { onClose: () => void, rewards: { coins: number, energy: number } }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans">✕</button>
            <div className="p-5 pt-8">
                <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Rewards</h3>
                <div className="flex flex-row flex-wrap justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
                        <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                        <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
                        <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6" />
                        <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

const VictoryModal = memo(({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 animate-fade-in">
        <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
            <img src={bossBattleAssets.victoryIcon} alt="Victory" className="w-16 h-16 object-contain mb-2" />
            <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow">VICTORY</h2>
            <div className="w-full flex flex-col items-center gap-3">
                <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
                <div className="flex flex-row flex-wrap justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                        <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                        <span className="text-xl font-bold text-yellow-300">{rewards.coins}</span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                        <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6" />
                        <span className="text-xl font-bold text-cyan-300">{rewards.energy}</span>
                    </div>
                </div>
            </div>
            <hr className="w-full border-t border-yellow-500/20 my-5" />
            {!isLastBoss ? (
                <button onClick={onNextFloor} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500">Next Floor</button>
            ) : (
                <button onClick={onRestart} className="w-full px-8 py-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg font-bold text-base text-yellow-50 tracking-wider uppercase border border-yellow-500">Play Again</button>
            )}
        </div>
    </div>
));

const DefeatModal = memo(({ onRestart }: { onRestart: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 animate-fade-in">
        <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
            <img src={bossBattleAssets.defeatIcon} alt="Defeat" className="w-16 h-16 object-contain mb-2" />
            <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
            <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you.</p>
            <hr className="w-full border-t border-slate-700/50 my-5" />
            <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600">Try Again</button>
        </div>
    </div>
));

const SweepRewardsModal = memo(({ isSuccess, rewards, onClose }: { isSuccess: boolean; rewards: { coins: number; energy: number }; onClose: () => void; }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
        <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
            <img src={isSuccess ? bossBattleAssets.victoryIcon : bossBattleAssets.defeatIcon} alt="" className="w-16 h-16 object-contain mb-2" />
            <h2 className={`text-3xl font-bold ${isSuccess ? 'text-yellow-300' : 'text-slate-300'} tracking-widest uppercase mb-4 text-shadow`}>{isSuccess ? 'SWEEP SUCCESS' : 'SWEEP FAILED'}</h2>
            {isSuccess ? (
                <div className="w-full flex flex-col items-center gap-3">
                    <p className="font-sans text-slate-300/80 text-sm tracking-wide uppercase">Rewards Received</p>
                    <div className="flex flex-row flex-wrap justify-center gap-3">
                        <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                            <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                            <span className="text-xl font-bold text-yellow-300">{rewards.coins}</span>
                        </div>
                        <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                            <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6" />
                            <span className="text-xl font-bold text-cyan-300">{rewards.energy}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">Failed.</p>
            )}
            <hr className="w-full border-t border-slate-700/50 my-5" />
            <button onClick={onClose} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600">Close</button>
        </div>
    </div>
));

// --- MAIN VIEW COMPONENT ---
const BossBattleView = ({ onClose }: { onClose: () => void }) => {
    const {
        isLoading, error, playerStats, bossStats, previousCombatLog, gameOver,
        battleState, currentFloor, displayedCoins, currentBossData, lastTurnEvents,
        startGame, skipBattle, retryCurrentFloor, handleNextFloor, handleSweep
    } = useBossBattle();

    const [damages, setDamages] = useState<{ id: number, text: string, colorClass: string, side: 'left'|'right' }[]>([]);
    const [slashEffects, setSlashEffects] = useState<{ id: number }[]>([]);
    
    const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [sweepResult, setSweepResult] = useState<{ result: 'win' | 'lose'; rewards: { coins: number; energy: number } } | null>(null);
    const [isSweeping, setIsSweeping] = useState(false);
    
    const [bossImgSrc, setBossImgSrc] = useState<string>('');

    useEffect(() => {
        if (currentBossData) {
            const idStr = String(currentBossData.id).padStart(2, '0');
            setBossImgSrc(`/images/boss/${idStr}.webp`);
        }
    }, [currentBossData?.id]);

    const handleBossImgError = useCallback(() => {
        if (currentBossData) {
            const idStr = String(currentBossData.id).padStart(2, '0');
            const gifPath = `/images/boss/${idStr}.gif`;
            if (!bossImgSrc.endsWith('.gif')) {
                setBossImgSrc(gifPath);
            }
        }
    }, [currentBossData, bossImgSrc]);

    const displayableCoins = isLoading ? 0 : displayedCoins;
    const animatedCoins = useAnimateValue(displayableCoins);
    const displayableEnergy = isLoading || !playerStats ? 0 : playerStats.energy ?? 0;
    const animatedEnergy = useAnimateValue(displayableEnergy);

    const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));

    const showFloatingText = useCallback((text: string, colorClass: string, side: 'left' | 'right') => {
        const id = Date.now() + Math.random();
        setDamages(prev => [...prev, { id, text, colorClass, side }]);
        setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
    }, []);

    // --- TRIGGER BATTLE EFFECTS ---
    useEffect(() => {
        if (!lastTurnEvents) return;
        const { playerDmg, playerHeal, bossDmg, bossReflectDmg } = lastTurnEvents;

        // Player attacks Boss (Right side takes damage)
        if (playerDmg > 0) {
            showFloatingText(`-${formatDamageText(playerDmg)}`, 'text-red-500', 'right');
            const slashId = Date.now() + Math.random();
            setSlashEffects(prev => [...prev, { id: slashId }]);
            setTimeout(() => setSlashEffects(prev => prev.filter(e => e.id !== slashId)), 500);
        }
        
        // Player Heals (Left side shows green text)
        if (playerHeal > 0) showFloatingText(`+${formatDamageText(playerHeal)}`, 'text-green-400', 'left');
        
        // Boss attacks Player (Left side takes damage)
        setTimeout(() => {
          if (bossDmg > 0) showFloatingText(`-${formatDamageText(bossDmg)}`, 'text-red-500', 'left');
          if (bossReflectDmg > 0) showFloatingText(`-${formatDamageText(bossReflectDmg)}`, 'text-orange-400', 'left');
        }, 500);

    }, [lastTurnEvents, showFloatingText]);

    const handleSweepClick = async () => {
        setIsSweeping(true);
        const result = await handleSweep();
        setSweepResult(result);
        setIsSweeping(false);
    };

    const bossElement = useMemo(() => {
        const keys = Object.keys(ELEMENTS) as ElementKey[];
        const index = (currentFloor * 7 + 3) % keys.length;
        return keys[index];
    }, [currentFloor]);

    if (error) return <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-50 text-white font-lilita"><p>Error: {error}</p><button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 rounded">Close</button></div>;
    
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
                .font-lilita { font-family: 'Lilita One', cursive; } 
                .font-sans { font-family: sans-serif; } 
                .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
                .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
                @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } 
                .animate-float-up { animation: float-up 1.5s ease-out forwards; } 
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } 
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } 
                @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } 
                .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } 
                .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } 
                .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } 
                .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } 
                .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } 
                .scrollbar-thin::-webkit-scrollbar { width: 8px; } 
                .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } 
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } 
                .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } 
                .btn-shine:hover:not(:disabled)::before { left: 125%; }
                @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } 
                .animate-pulse-fast { animation: pulse-fast 1s infinite; }
                
                /* Effect Animations */
                @keyframes slash-x { from { background-position-x: 0; } to { background-position-x: -1483px; } }
                @keyframes slash-y { from { background-position-y: 0; } to { background-position-y: -1454px; } }
                .animate-slash-play { animation: slash-x 0.08333s steps(6) infinite, slash-y 0.5s steps(6) forwards; }
                .animate-slash-fly { animation: slash-fly-path 0.5s ease-in forwards; width: 250px; height: 250px; }
                /* Modified Slash Path to land on the Boss (Right Side) */
                @keyframes slash-fly-path {
                     0% { transform: scale(0.8) rotate(-20deg); opacity: 0; right: 50%; }
                     10% { opacity: 1; }
                     100% { transform: scale(1.2) rotate(10deg); opacity: 0; right: 20%; }
                }
            `}</style>
      
            {sweepResult && ( <SweepRewardsModal isSuccess={sweepResult.result === 'win'} rewards={sweepResult.rewards} onClose={() => setSweepResult(null)} /> )}
            {statsModalTarget && playerStats && bossStats && <CharacterStatsModal character={statsModalTarget === 'player' ? playerStats : bossStats} characterType={statsModalTarget} onClose={() => setStatsModalTarget(null)}/>}
            {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}
            {showRewardsModal && currentBossData && <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards}/>}

            <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
                
                {isLoading ? (
                    <div className="absolute inset-0 z-50">
                        <BossBattleLoader />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col relative">
                        {(!playerStats || !bossStats || !currentBossData) ? (
                            <div className="flex-grow flex items-center justify-center">
                                <p>Missing required data.</p>
                            </div>
                        ) : (
                            <>
                                {/* --- HEADER (Coins & Energy) --- */}
                                <header className="fixed top-0 left-0 w-full z-30 p-2 bg-slate-900/90 border-b border-slate-700/50 shadow-lg h-14">
                                    <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                                        <div className="flex items-center gap-3">
                                            <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Go Home">
                                                <HomeIcon className="w-5 h-5 text-slate-300" />
                                                <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                                            </button>
                                            
                                            {/* Floor Badge Moved to Header */}
                                            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-md border border-slate-700/80 ml-2">
                                                <img src={bossBattleAssets.floorIcon} alt="Floor" className="w-4 h-4" />
                                                <h3 className="font-bold text-xs tracking-widest uppercase text-slate-300 select-none">
                                                    {currentBossData.floor}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 font-sans">
                                            <EnergyDisplay currentEnergy={animatedEnergy} maxEnergy={playerStats.maxEnergy} isStatsFullscreen={false} />
                                            <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                                        </div>
                                    </div>
                                </header>
    
                                {/* --- UTILITY BUTTONS (Log, Rewards, Sweep) --- */}
                                <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2">
                                     <div className="flex gap-2">
                                        <button onClick={() => setShowLogModal(true)} disabled={!previousCombatLog.length || battleState !== 'idle'} className="w-9 h-9 p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-full border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md disabled:opacity-50" title="History">
                                            <img src={bossBattleAssets.historyIcon} alt="Log" className="w-full h-full object-contain" />
                                        </button>
                                        <button onClick={() => setShowRewardsModal(true)} disabled={battleState !== 'idle'} className="w-9 h-9 p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-full border border-slate-600 hover:border-yellow-400 active:scale-95 shadow-md disabled:opacity-50" title="Rewards">
                                            <img src={bossBattleAssets.rewardsIcon} alt="Rewards" className="w-full h-full object-contain" />
                                        </button>
                                     </div>
                                </div>
    
                                <main className="w-full h-full flex flex-col justify-end items-center pt-[72px] pb-12 relative overflow-hidden">
                                    
                                    {/* --- BATTLE STAGE --- */}
                                    <div className="w-full max-w-6xl mx-auto flex flex-row justify-between items-end px-4 md:px-12 h-[60vh] md:h-[70vh] relative">
                                        
                                        {/* LEFT: HERO (Đã import từ boss-display.tsx) */}
                                        <div className="w-[45%] md:w-[40%] h-full flex flex-col justify-end items-center relative z-10">
                                            <HeroDisplay stats={playerStats} onStatsClick={() => setStatsModalTarget('player')} />
                                        </div>

                                        {/* RIGHT: BOSS */}
                                        <div className="w-[45%] md:w-[40%] h-full flex flex-col justify-end items-center relative z-10">
                                            <BossDisplay 
                                                bossId={currentBossData.id}
                                                name={currentBossData.name}
                                                element={bossElement}
                                                hp={bossStats.hp}
                                                maxHp={bossStats.maxHp}
                                                imgSrc={bossImgSrc}
                                                onImgError={handleBossImgError}
                                                onStatsClick={() => setStatsModalTarget('boss')}
                                            />
                                        </div>

                                        {/* EFFECTS LAYER */}
                                        <div className="absolute inset-0 pointer-events-none z-40">
                                            {slashEffects.map(effect => (
                                                <SlashEffect key={effect.id} id={effect.id} />
                                            ))}
                                            {damages.map(d => (
                                                <FloatingText key={d.id} text={d.text} id={d.id} colorClass={d.colorClass} side={d.side} />
                                            ))}
                                        </div>

                                    </div>

                                    {/* --- ACTION BAR (Bottom) --- */}
                                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mt-4 z-50">
                                        {battleState === 'idle' ? (
                                            <div className="flex gap-4 items-center">
                                                {currentFloor > 0 && (
                                                    <button onClick={handleSweepClick} disabled={(playerStats.energy || 0) < 10 || isSweeping} className="font-sans px-4 py-2 bg-purple-900/80 hover:bg-purple-800 rounded-lg font-bold text-sm text-purple-200 border border-purple-500 disabled:opacity-50 disabled:grayscale transition-all">
                                                        {isSweeping ? 'Sweeping...' : 'Sweep'}
                                                    </button>
                                                )}
                                                <button onClick={startGame} disabled={(playerStats.energy || 0) < 10} className="btn-shine relative overflow-hidden px-12 py-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg text-teal-300 border border-teal-500/50 shadow-lg shadow-teal-900/20 transition-all duration-300 hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.4)] active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:shadow-none">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="font-bold text-xl tracking-widest uppercase text-shadow-sm">FIGHT</span>
                                                        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400/80"><span>10</span><img src={bossBattleAssets.energyIcon} alt="" className="w-3 h-3"/></div>
                                                    </div>
                                                </button>
                                            </div>
                                        ) : (
                                            !gameOver && (
                                                <button onClick={skipBattle} className="font-sans px-8 py-2 bg-orange-900/80 hover:bg-orange-800 rounded-lg font-bold text-orange-200 border border-orange-500 transition-all active:scale-95 shadow-lg">
                                                    SKIP BATTLE
                                                </button>
                                            )
                                        )}
                                    </div>
    
                                    {gameOver === 'win' && (<VictoryModal onRestart={retryCurrentFloor} onNextFloor={handleNextFloor} isLastBoss={currentFloor === BOSS_DATA.length - 1} rewards={currentBossData.rewards} />)}
                                    {gameOver === 'lose' && (<DefeatModal onRestart={retryCurrentFloor} />)}
                                </main>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

// --- WRAPPER COMPONENT ---
export default function BossBattle(props: BossBattleWrapperProps) {
    return (
        <BossBattleProvider userId={props.userId}>
            <BossBattleView onClose={props.onClose} />
        </BossBattleProvider>
    );
}
// --- END OF FILE tower-ui.tsx ---
