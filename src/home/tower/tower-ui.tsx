import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { BossBattleProvider, useBossBattle, CombatStats } from './tower-context.tsx';
import BOSS_DATA from './tower-data.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import EnergyDisplay from '../../ui/display/energy-display.tsx'; 
import { uiAssets, bossBattleAssets } from '../../game-assets.ts';
import BossBattleLoader from './tower-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';

// --- IMPORT MAGIC CIRCLE VÀ LOGIC NGUYÊN TỐ ---
import MagicCircle, { ELEMENTS, ElementKey } from './thuoc-tinh.tsx';

interface BossBattleWrapperProps {
  userId: string;
  onClose: () => void;
  onBattleEnd?: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete?: (newFloor: number) => void;
}

// --- UI HELPER COMPONENTS (Dùng memo để chống re-render thừa) ---

const HomeIcon = memo(({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
  </svg>
));

const WarriorIcon = memo(({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0112.28 0C16.43 19.18 14.03 20 12 20z" />
  </svg>
));

const PlayerInfoDisplay = memo(({ stats, floor, onAvatarClick }: { stats: CombatStats, floor: string, onAvatarClick: () => void }) => {
    const percentage = Math.max(0, (stats.hp / stats.maxHp) * 100);
  
    return (
      <div className="w-64 bg-slate-900/80 rounded-lg p-2.5 border border-slate-700/50 shadow-lg flex items-center gap-3 animate-fade-in">
          <div 
            onClick={onAvatarClick}
            className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:scale-110"
            title="View Your Stats"
          >
              <WarriorIcon className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-grow flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md self-start border border-slate-700/80">
                <img src={bossBattleAssets.floorIcon} alt="Floor" className="w-3 h-3" />
                <h3 className="font-bold text-xs tracking-widest uppercase text-slate-300 select-none">
                    {floor}
                </h3>
            </div>
            <div className="relative w-full h-5 bg-black/40 rounded-full border border-slate-700/80 p-0.5 shadow-inner overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-lime-400" 
                style={{ 
                  width: `${percentage}%`, 
                  boxShadow: `0 0 6px rgba(132, 204, 22, 0.5)` 
                }}
              ></div>
              <div className="absolute inset-0 flex justify-center items-center text-[10px] text-white text-shadow-sm font-bold">
                <span>{Math.ceil(stats.hp)} / {stats.maxHp}</span>
              </div>
            </div>
          </div>
      </div>
    );
});

const HealthBar = memo(({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor:string }) => {
  const scale = Math.max(0, current / max); 
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner overflow-hidden">
        <div 
            className={`h-full rounded-full transition-transform duration-500 ease-out origin-left ${colorGradient}`} 
            style={{ 
                transform: `scaleX(${scale})`, 
                boxShadow: `0 0 12px ${shadowColor}` 
            }}>
        </div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
          <span>{Math.ceil(current)} / {max}</span>
        </div>
      </div>
    </div>
  );
});

// --- BOSS VISUAL COMPONENT (Tối ưu GPU và Decoding) ---
const BossVisuals = memo(({ 
    imgSrc, 
    name, 
    element, 
    hp, 
    maxHp, 
    onImgError, 
    onStatsClick 
}: { 
    imgSrc: string, 
    name: string, 
    element: ElementKey, 
    hp: number, 
    maxHp: number, 
    onImgError: () => void, 
    onStatsClick: () => void 
}) => {
    return (
        <div className="w-full max-w-4xl flex justify-center items-center my-8">
            <div 
                className="relative bg-slate-900/60 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer group transition-transform duration-300 hover:border-red-500/50" 
                onClick={onStatsClick} 
            >
                {/* Magic Circle nằm dưới */}
                <div className="absolute bottom-[0%] left-1/2 -translate-x-1/2 w-[90%] h-[90%] z-0 opacity-80 pointer-events-none">
                    <MagicCircle elementKey={element} />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                    <div className="relative flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-red-400 text-shadow select-none uppercase tracking-tighter">
                            {name}
                        </h2>
                    </div>

                    <div className="w-40 h-40 md:w-56 md:h-56 relative mb-4">
                        <img 
                            src={imgSrc} 
                            alt={name} 
                            onError={onImgError}
                            decoding="async"
                            loading="eager"
                            className="w-full h-full object-contain drop-shadow-2xl boss-render-optimize" 
                        />
                    </div>
                    
                    <HealthBar 
                        current={hp} 
                        max={maxHp} 
                        colorGradient="bg-gradient-to-r from-red-600 to-orange-500" 
                        shadowColor="rgba(220, 38, 38, 0.5)" 
                    />
                </div>
            </div>
        </div>
    );
});

const FloatingText = memo(({ text, id, colorClass }: { text: string, id: number, colorClass: string }) => {
  return (
    <div 
        key={id} 
        className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none z-30 ${colorClass}`} 
        style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
    >
        {text}
    </div>
  );
});

const LogItem = memo(({ text, isNewest }: { text: string; isNewest: boolean }) => (
    <p 
        className={`mb-1 transition-colors duration-300 ${isNewest ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse-fast' : 'text-slate-300'}`} 
        dangerouslySetInnerHTML={{ __html: text }}
    />
));

// --- CÁC MODAL HỆ THỐNG ---

const CharacterStatsModal = memo(({ character, characterType, onClose }: { character: CombatStats, characterType: 'player' | 'boss', onClose: () => void }) => {
  const isPlayer = characterType === 'player';
  const title = isPlayer ? 'YOUR STATS' : 'BOSS STATS';
  const titleColor = isPlayer ? 'text-blue-300' : 'text-red-400';
  
  const StatItem = ({ label, icon, current, max }: { label: string, icon: string, current: number, max?: number }) => (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0 w-24 h-10 bg-slate-800 rounded-lg flex items-center justify-center gap-2 border border-slate-700 p-2">
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm text-slate-300 tracking-wider">{label}</span>
        </div>
        <div className="flex-grow h-10 bg-black/40 rounded-lg flex items-center justify-center border border-slate-700/80">
          <span className="font-bold text-sm text-white text-shadow-sm tracking-wider">{max ? max : current}</span>
        </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 transition-all duration-200 z-10 font-sans">✕</button>
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

const VictoryModal = memo(({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src={bossBattleAssets.victoryIcon} alt="Victory" className="w-16 h-16 object-contain mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow">VICTORY</h2>
          <div className="w-full flex flex-col items-center gap-3">
              <div className="flex flex-row justify-center gap-3">
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
            <button onClick={onNextFloor} className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-base tracking-wider uppercase transition-all duration-200 active:scale-95">Next Floor</button>
          ) : (
            <button onClick={onRestart} className="w-full px-8 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-base tracking-wider uppercase transition-all duration-200 active:scale-95">Play Again</button>
          )}
      </div>
    </div>
  );
});

const DefeatModal = memo(({ onRestart }: { onRestart: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src={bossBattleAssets.defeatIcon} alt="Defeat" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
          <p className="font-sans text-slate-400 text-sm mb-5">Try upgrading your stats or skills!</p>
          <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-base tracking-wider uppercase transition-all duration-200 active:scale-95">Try Again</button>
      </div>
    </div>
));

// --- VIEW CHÍNH ---
const BossBattleView = ({ onClose }: { onClose: () => void }) => {
    const {
        isLoading, error, playerStats, bossStats, combatLog, previousCombatLog, gameOver,
        battleState, currentFloor, displayedCoins, currentBossData, lastTurnEvents,
        startGame, skipBattle, retryCurrentFloor, handleNextFloor, handleSweep
    } = useBossBattle();

    const [damages, setDamages] = useState<{ id: number, text: string, colorClass: string }[]>([]);
    const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [sweepResult, setSweepResult] = useState<any>(null);
    const [isSweeping, setIsSweeping] = useState(false);
    const [bossImgSrc, setBossImgSrc] = useState<string>('');

    // Xử lý ảnh Boss mượt mà
    useEffect(() => {
        if (currentBossData) {
            const idStr = String(currentBossData.id).padStart(2, '0');
            setBossImgSrc(`/images/boss/${idStr}.webp`);
        }
    }, [currentBossData?.id]);

    const handleBossImgError = useCallback(() => {
        if (currentBossData && !bossImgSrc.endsWith('.gif')) {
            const idStr = String(currentBossData.id).padStart(2, '0');
            setBossImgSrc(`/images/boss/${idStr}.gif`);
        }
    }, [currentBossData, bossImgSrc]);

    // Animation cho tiền và năng lượng
    const animatedCoins = useAnimateValue(isLoading ? 0 : displayedCoins);
    const animatedEnergy = useAnimateValue(isLoading || !playerStats ? 0 : playerStats.energy);

    // Logic hiển thị sát thương bay
    const showFloatingText = useCallback((text: string, colorClass: string, isPlayerSide: boolean) => {
        const id = Date.now() + Math.random();
        const position = isPlayerSide ? 'left-[10%]' : 'right-[10%]';
        setDamages(prev => [...prev, { id, text, colorClass: `${position} ${colorClass}` }]);
        setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1200);
    }, []);

    useEffect(() => {
        if (!lastTurnEvents) return;
        const { playerDmg, playerHeal, bossDmg, bossReflectDmg } = lastTurnEvents;
        const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : Math.ceil(n);

        if (playerDmg > 0) showFloatingText(`-${fmt(playerDmg)}`, 'text-red-500', false);
        if (playerHeal > 0) showFloatingText(`+${fmt(playerHeal)}`, 'text-green-400', true);
        
        const timeout = setTimeout(() => {
          if (bossDmg > 0) showFloatingText(`-${fmt(bossDmg)}`, 'text-red-500', true);
          if (bossReflectDmg > 0) showFloatingText(`-${fmt(bossReflectDmg)}`, 'text-orange-400', false);
        }, 400);
        return () => clearTimeout(timeout);
    }, [lastTurnEvents, showFloatingText]);

    const bossElement = useMemo(() => {
        const keys = Object.keys(ELEMENTS) as ElementKey[];
        return keys[(currentFloor * 7 + 3) % keys.length];
    }, [currentFloor]);

    if (error) return (
        <div className="fixed inset-0 bg-red-900/90 flex flex-col items-center justify-center text-white z-50">
            <p className="text-xl font-bold">Error: {error}</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-800 rounded-lg">Close</button>
        </div>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
                .font-lilita { font-family: 'Lilita One', cursive; } 
                .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
                @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-100px); opacity: 0; } } 
                .animate-float-up { animation: float-up 1.2s ease-out forwards; } 
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } 
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } 
                @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } 
                .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } 
                .main-bg { background: radial-gradient(circle at center, #2c0f52 0%, #110f21 100%); }
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .boss-render-optimize { image-rendering: -webkit-optimize-contrast; transform: translateZ(0); backface-visibility: hidden; }
                @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                .animate-pulse-fast { animation: pulse-fast 0.8s infinite; }
                .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent); transform: skewX(-25deg); transition: 0.5s; }
                .btn-shine:hover::before { left: 150%; }
            `}</style>
      
            <div className="main-bg relative w-full h-screen flex flex-col items-center font-lilita text-white overflow-hidden">
                
                {isLoading ? (
                    <BossBattleLoader />
                ) : (
                    <div className="w-full h-full flex flex-col relative">
                        {(!playerStats || !bossStats || !currentBossData) ? (
                            <div className="m-auto">Data Loading Error</div>
                        ) : (
                            <>
                                {/* HEADER */}
                                <header className="w-full z-20 p-2 bg-slate-900/90 border-b border-slate-700/50 flex justify-between items-center h-14">
                                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                                        <HomeIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline text-sm font-sans">Home</span>
                                    </button>
                                    <div className="flex items-center gap-2 font-sans">
                                        <EnergyDisplay currentEnergy={animatedEnergy} maxEnergy={playerStats.maxEnergy} isStatsFullscreen={false} />
                                        <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                                    </div>
                                </header>

                                {/* SIDEBAR INFO */}
                                <div className="absolute top-16 left-4 z-20 flex flex-col items-start gap-2">
                                    <PlayerInfoDisplay stats={playerStats} floor={currentBossData.floor} onAvatarClick={() => setStatsModalTarget('player')} />
                                    {battleState === 'idle' && currentFloor > 0 && (
                                        <button 
                                            onClick={async () => { setIsSweeping(true); const res = await handleSweep(); setSweepResult(res); setIsSweeping(false); }} 
                                            disabled={isSweeping || playerStats.energy < 10}
                                            className="font-sans px-4 py-1.5 bg-slate-800/90 hover:bg-purple-900/50 rounded-lg text-xs border border-slate-600 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isSweeping ? 'Sweeping...' : 'Sweep Previous'}
                                        </button>
                                    )}
                                    {battleState === 'fighting' && !gameOver && (
                                        <button onClick={skipBattle} className="font-sans px-4 py-1.5 bg-slate-800/90 hover:bg-orange-900/50 rounded-lg text-xs border border-slate-600 active:scale-95">Skip Battle</button>
                                    )}
                                </div>

                                {/* MAIN CONTENT */}
                                <main className="flex-grow flex flex-col justify-center items-center p-4">
                                    {/* FLOATING DAMAGE */}
                                    {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} colorClass={d.colorClass} />))}

                                    <BossVisuals 
                                        imgSrc={bossImgSrc}
                                        name={currentBossData.name}
                                        element={bossElement}
                                        hp={bossStats.hp}
                                        maxHp={bossStats.maxHp}
                                        onImgError={handleBossImgError}
                                        onStatsClick={() => setStatsModalTarget('boss')}
                                    />

                                    <div className="w-full max-w-xl flex flex-col items-center gap-4">
                                        {battleState === 'idle' ? (
                                            <button 
                                                onClick={startGame} 
                                                disabled={playerStats.energy < 10}
                                                className="btn-shine relative overflow-hidden px-12 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl border-b-4 border-teal-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:grayscale"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl tracking-widest uppercase">Fight</span>
                                                    <span className="text-xs font-sans opacity-80">10 Energy</span>
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="w-full h-32 bg-black/50 p-3 rounded-lg border border-slate-700/50 overflow-y-auto scrollbar-thin flex flex-col-reverse text-sm font-sans">
                                                {combatLog.map((entry, i) => <LogItem key={i} text={entry} isNewest={i === 0} />)}
                                            </div>
                                        )}
                                    </div>
                                </main>

                                {/* MODALS */}
                                {statsModalTarget && <CharacterStatsModal character={statsModalTarget === 'player' ? playerStats : bossStats} characterType={statsModalTarget} onClose={() => setStatsModalTarget(null)}/>}
                                {gameOver === 'win' && <VictoryModal onRestart={retryCurrentFloor} onNextFloor={handleNextFloor} isLastBoss={currentFloor === BOSS_DATA.length - 1} rewards={currentBossData.rewards} />}
                                {gameOver === 'lose' && <DefeatModal onRestart={retryCurrentFloor} />}
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default function BossBattle(props: BossBattleWrapperProps) {
    return (
        <BossBattleProvider>
            <BossBattleView onClose={props.onClose} />
        </BossBattleProvider>
    );
}
