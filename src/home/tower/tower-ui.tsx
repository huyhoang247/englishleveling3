// --- START OF FILE tower-ui.tsx ---

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
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete: (newFloor: number) => void;
}

// --- UI HELPER COMPONENTS ---

const HomeIcon = memo(({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> ));

const WarriorIcon = memo(({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0112.28 0C16.43 19.18 14.03 20 12 20z" /> </svg> ));

const PlayerInfoDisplay = memo(({ stats, floor, onAvatarClick }: { stats: CombatStats, floor: string, onAvatarClick: () => void }) => {
    const percentage = Math.max(0, (stats.hp / stats.maxHp) * 100);
  
    return (
      <div className="w-64 bg-slate-900/50 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50 shadow-lg flex items-center gap-3">
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
            <div className="relative w-full h-5 bg-black/40 rounded-full border border-slate-700/80 p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-lime-400" 
                style={{ 
                  width: `${percentage}%`, 
                  boxShadow: `0 0 6px rgba(132, 204, 22, 0.5), 0 0 8px rgba(132, 204, 22, 0.5)` 
                }}
              ></div>
              <div className="absolute inset-0 flex justify-center items-center text-xs text-white text-shadow-sm font-bold">
                <span>{Math.ceil(stats.hp)} / {stats.maxHp}</span>
              </div>
            </div>
          </div>
      </div>
    );
});

const HealthBar = memo(({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor:string }) => {
  const scale = Math.max(0, current / max); // Giá trị từ 0 đến 1
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
        <div 
            className={`h-full rounded-full transition-transform duration-500 ease-out origin-left ${colorGradient}`} 
            style={{ 
                transform: `scaleX(${scale})`, 
                boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}` 
            }}>
        </div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
          <span>{Math.ceil(current)} / {max}</span>
        </div>
      </div>
    </div>
  );
});

const FloatingText = ({ text, id, colorClass }: { text: string, id: number, colorClass: string }) => {
  return (
    <div key={id} className={`absolute top-1/3 font-lilita text-2xl animate-float-up pointer-events-none ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}>{text}</div>
  );
};

const CharacterStatsModal = memo(({ character, characterType, onClose }: { character: CombatStats, characterType: 'player' | 'boss', onClose: () => void }) => {
  const isPlayer = characterType === 'player';
  const title = isPlayer ? 'YOUR STATS' : 'BOSS STATS';
  const titleColor = isPlayer ? 'text-blue-300' : 'text-red-400';
  const StatItem = ({ label, icon, current, max }: { label: string, icon: string, current: number, max?: number }) => {
    const valueText = max ? `${Math.ceil(current)} / ${max}` : String(current);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
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

const LogModal = memo(({ log, onClose }: { log: string[], onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 max-w-md bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
          <div className="p-4 border-b border-slate-700"><h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide">BATTLE HISTORY</h3></div>
          <div className="h-80 overflow-y-auto p-4 flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
            {log.length > 0 ? log.map((entry, index) => (<p key={index} className="text-slate-300 mb-2 border-b border-slate-800/50 pb-2" dangerouslySetInnerHTML={{__html: entry}}></p>)) : (<p className="text-slate-400 text-center italic">Chưa có lịch sử trận đấu.</p>)}
          </div>
        </div>
      </div>
    )
});

const RewardsModal = memo(({ onClose, rewards }: { onClose: () => void, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Rewards</h3>
          <div className="flex flex-row flex-wrap justify-center gap-3">
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
              <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
              <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const VictoryModal = memo(({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src={bossBattleAssets.victoryIcon} alt="Victory" className="w-16 h-16 object-contain mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow" style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>VICTORY</h2>
          <div className="w-full flex flex-col items-center gap-3">
              <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
              <div className="flex flex-row flex-wrap justify-center gap-3">
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" />
                      <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
                      <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
                  </div>
              </div>
          </div>
          <hr className="w-full border-t border-yellow-500/20 my-5" />
          {!isLastBoss ? (
            <button onClick={onNextFloor} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Next Floor</button>
          ) : (
            <button onClick={onRestart} className="w-full px-8 py-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg font-bold text-base text-yellow-50 tracking-wider uppercase border border-yellow-500 hover:border-yellow-400 transition-all duration-200 active:scale-95">Play Again</button>
          )}
      </div>
    </div>
  );
});

const DefeatModal = memo(({ onRestart }: { onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl shadow-black/30 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <img src={bossBattleAssets.defeatIcon} alt="Defeat" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you. Rise again and reclaim your honor.</p>
          <hr className="w-full border-t border-slate-700/50 my-5" />
          <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">Try Again</button>
      </div>
    </div>
  );
});

const SweepRewardsModal = memo(({ isSuccess, rewards, onClose }: { isSuccess: boolean; rewards: { coins: number; energy: number }; onClose: () => void; }) => {
  const title = isSuccess ? 'SWEEP SUCCESS' : 'SWEEP FAILED';
  const titleColor = isSuccess ? 'text-yellow-300' : 'text-slate-300';
  const iconSrc = isSuccess 
    ? bossBattleAssets.victoryIcon
    : bossBattleAssets.defeatIcon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
        <img src={iconSrc} alt={title} className="w-16 h-16 object-contain mb-2" />
        <h2 className={`text-3xl font-bold ${titleColor} tracking-widest uppercase mb-4 text-shadow`}>{title}</h2>

        {isSuccess ? (
          <div className="w-full flex flex-col items-center gap-3">
            <p className="font-sans text-slate-300/80 text-sm tracking-wide uppercase">Rewards Received</p>
            <div className="flex flex-row flex-wrap justify-center gap-3">
              <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-6 h-6" />
                <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">You were defeated and received no rewards. Try upgrading your stats.</p>
        )}

        <hr className="w-full border-t border-slate-700/50 my-5" />
        <button onClick={onClose} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">
          Close
        </button>
      </div>
    </div>
  );
});


// --- MAIN VIEW COMPONENT ---
const BossBattleView = ({ onClose }: { onClose: () => void }) => {
    // --- LẤY STATE VÀ ACTIONS TỪ CONTEXT ---
    const {
        isLoading, error, playerStats, bossStats, combatLog, previousCombatLog, gameOver,
        battleState, currentFloor, displayedCoins, currentBossData, lastTurnEvents,
        startGame, skipBattle, retryCurrentFloor, handleNextFloor, handleSweep
    } = useBossBattle();

    // --- STATE UI CỤC BỘ ---
    const [damages, setDamages] = useState<{ id: number, text: string, colorClass: string }[]>([]);
    const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [sweepResult, setSweepResult] = useState<{ result: 'win' | 'lose'; rewards: { coins: number; energy: number } } | null>(null);
    const [isSweeping, setIsSweeping] = useState(false);
    
    // --- LOGIC ANIMATION CHO COIN VÀ ENERGY ---
    const displayableCoins = isLoading ? 0 : displayedCoins;
    const animatedCoins = useAnimateValue(displayableCoins);

    const displayableEnergy = isLoading || !playerStats ? 0 : playerStats.energy ?? 0;
    const animatedEnergy = useAnimateValue(displayableEnergy);

    // --- LOGIC UI CỤC BỘ ---
    const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));

    const showFloatingText = useCallback((text: string, colorClass: string, isPlayerSide: boolean) => {
        const id = Date.now() + Math.random();
        // Vị trí hiển thị: left-[25%] cho người chơi (bên trái), right-[25%] cho boss (bên phải)
        const position = isPlayerSide ? 'left-[5%]' : 'right-[5%]';
        setDamages(prev => [...prev, { id, text, colorClass: `${position} ${colorClass}` }]);
        setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
    }, []);

    useEffect(() => {
        if (!lastTurnEvents) return;

        const { playerDmg, playerHeal, bossDmg, bossReflectDmg } = lastTurnEvents;

        // Sát thương người chơi gây ra cho boss (hiển thị bên boss - phải)
        if (playerDmg > 0) showFloatingText(`-${formatDamageText(playerDmg)}`, 'text-red-500', false);
        // Hồi máu cho người chơi (hiển thị bên người chơi - trái)
        if (playerHeal > 0) showFloatingText(`+${formatDamageText(playerHeal)}`, 'text-green-400', true);
        
        // Tạo độ trễ nhỏ để hiệu ứng của boss xuất hiện sau
        setTimeout(() => {
          // Sát thương boss gây ra cho người chơi (hiển thị bên người chơi - trái)
          if (bossDmg > 0) showFloatingText(`-${formatDamageText(bossDmg)}`, 'text-red-500', true);
          // Sát thương phản đòn lên boss (hiển thị bên boss - phải)
          if (bossReflectDmg > 0) showFloatingText(`-${formatDamageText(bossReflectDmg)}`, 'text-orange-400', false);
        }, 500);

    }, [lastTurnEvents, showFloatingText]);

    const handleSweepClick = async () => {
        setIsSweeping(true);
        const result = await handleSweep();
        setSweepResult(result);
        setIsSweeping(false);
    };

    // --- LOGIC CHỌN HỆ THUỘC TÍNH (ELEMENT) CHO BOSS ---
    const bossElement = useMemo(() => {
        const keys = Object.keys(ELEMENTS) as ElementKey[];
        // Thuật toán: Dựa trên số tầng để chọn hệ một cách cố định (không random mỗi lần re-render) nhưng xáo trộn thứ tự
        const index = (currentFloor * 7 + 3) % keys.length;
        return keys[index];
    }, [currentFloor]);

    // Lấy Icon tương ứng để hiển thị cạnh tên Boss
    const BossIconSVG = ELEMENTS[bossElement].Icon;

    // --- RENDER LOGIC CHO LỖI ---
    if (error) return <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white font-lilita"><p>Error: {error}</p><button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 rounded">Close</button></div>;
    
    // --- RENDER ---
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
                .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
                @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } 
                .animate-pulse-fast { animation: pulse-fast 1s infinite; }
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
                    <div className="w-full h-full flex flex-col">
                        {(!playerStats || !bossStats || !currentBossData) ? (
                            <div className="flex-grow flex items-center justify-center">
                                <p>Missing required data.</p>
                            </div>
                        ) : (
                            <>
                                <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14">
                                    <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                                        <div className="flex items-center gap-3">
                                            <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Go Home" title="Go Home">
                                                <HomeIcon className="w-5 h-5 text-slate-300" />
                                                <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 font-sans">
                                            {playerStats?.maxEnergy !== undefined && (
                                                <EnergyDisplay 
                                                    currentEnergy={animatedEnergy} 
                                                    maxEnergy={playerStats.maxEnergy} 
                                                    isStatsFullscreen={false}
                                                />
                                            )}
                                            <CoinDisplay 
                                                displayedCoins={animatedCoins} 
                                                isStatsFullscreen={false} 
                                            />
                                        </div>
                                    </div>
                                </header>
    
                                <div className="fixed top-16 left-4 z-20 flex flex-col items-start gap-2">
                                    <PlayerInfoDisplay stats={playerStats} floor={currentBossData.floor} onAvatarClick={() => setStatsModalTarget('player')} />
                                    {battleState === 'idle' && currentFloor > 0 && (
                                        <button onClick={handleSweepClick} disabled={(playerStats.energy || 0) < 10 || isSweeping} title="Instantly clear the previous floor for rewards" className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-purple-400 active:scale-95 shadow-md text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-700">
                                            {isSweeping ? 'Sweeping...' : 'Sweep Previous'}
                                        </button>
                                    )}
                                    {battleState === 'fighting' && !gameOver && (<button onClick={skipBattle} className="font-sans px-4 py-1.5 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-xs transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300">Skip Battle</button> )}
                                </div>
    
                                <main className="w-full h-full flex flex-col justify-start items-center pt-[72px] p-4">
                                    <div className="w-full max-w-2xl mx-auto mb-4 flex justify-between items-start min-h-[5rem]">
                                        <div></div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="w-full flex justify-center gap-2">
                                                <button onClick={() => setShowLogModal(true)} disabled={!previousCombatLog.length || battleState !== 'idle'} className="w-10 h-10 p-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-full transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" title="View Last Battle Log">
                                                    <img src={bossBattleAssets.historyIcon} alt="Log" className="w-full h-full object-contain" />
                                                </button>
                                                <button onClick={() => setShowRewardsModal(true)} disabled={battleState !== 'idle'} className="w-10 h-10 p-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-full transition-all duration-200 border border-slate-600 hover:border-yellow-400 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" title="View Potential Rewards">
                                                    <img src={bossBattleAssets.rewardsIcon} alt="Rewards" className="w-full h-full object-contain" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                            
                                    {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} colorClass={d.colorClass} />))}
    
                                    {/* --- BOSS DISPLAY AREA --- */}
                                    <div className="w-full max-w-4xl flex justify-center items-center my-8">
                                        <div 
                                            className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer group overflow-hidden" 
                                            onClick={() => setStatsModalTarget('boss')} 
                                            title="View Boss Stats"
                                        >
                                            {/* MAGIC CIRCLE LAYER (Z-INDEX 0) */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] z-0 opacity-80 pointer-events-none">
                                                <MagicCircle elementKey={bossElement} />
                                            </div>

                                            {/* BOSS CONTENT LAYER (Z-INDEX 10) */}
                                            <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                                                <div className="relative group flex flex-col items-center justify-center">
                                                    <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">BOSS</h2>
                                                    
                                                    {/* Element Badge */}
                                                    <div className="flex items-center gap-1 mt-1 bg-black/60 px-2 py-0.5 rounded text-xs border border-slate-700/50 backdrop-blur-md">
                                                        <div className="w-3 h-3">
                                                            <BossIconSVG color={ELEMENTS[bossElement].primary} />
                                                        </div>
                                                        <span style={{ color: ELEMENTS[bossElement].primary, textShadow: `0 0 5px ${ELEMENTS[bossElement].glow}` }}>
                                                            {ELEMENTS[bossElement].name}
                                                        </span>
                                                    </div>

                                                    <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-900 text-sm text-center text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                        {currentBossData.name.toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="w-40 h-40 md:w-56 md:h-56 relative">
                                                    <img 
                                                        src={`/images/boss/${String(currentBossData.id).padStart(2, '0')}.webp`} 
                                                        alt={currentBossData.name} 
                                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-2xl relative z-10" 
                                                    />
                                                </div>
                                                
                                                <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                                            </div>
                                        </div>
                                    </div>
    
                                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                                        {battleState === 'idle' && (
                                        <button onClick={startGame} disabled={(playerStats.energy || 0) < 10} className="btn-shine relative overflow-hidden px-10 py-2 bg-slate-900/80 rounded-lg text-teal-300 border border-teal-500/40 transition-all duration-300 hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)] active:scale-95 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="font-bold text-lg tracking-widest uppercase">Fight</span>
                                                <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400/80"><span>10</span><img src={bossBattleAssets.energyIcon} alt="" className="w-3 h-3"/></div>
                                            </div>
                                        </button>
                                        )}
                                        {battleState !== 'idle' && (
                                        <div className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                                            {combatLog.map((entry, index) => (<p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse-fast' : 'text-slate-300'}`} dangerouslySetInnerHTML={{__html: entry}}></p>))}
                                        </div>
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
        <BossBattleProvider
            userId={props.userId}
            onBattleEnd={props.onBattleEnd}
            onFloorComplete={props.onFloorComplete}
        >
            <BossBattleView onClose={props.onClose} />
        </BossBattleProvider>
    );
}
