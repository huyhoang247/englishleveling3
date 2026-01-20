// --- START OF FILE tower-ui.tsx ---

import React, { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { BossBattleProvider, useBossBattle, CombatStats } from './tower-context.tsx';
import BOSS_DATA from './tower-data.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import EnergyDisplay from '../../ui/display/energy-display.tsx'; 
import { uiAssets, bossBattleAssets } from '../../game-assets.ts';
import BossBattleLoader from './tower-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';

// --- IMPORT BOSS & ELEMENTS ---
import { ELEMENTS, ElementKey } from './thuoc-tinh.tsx';
import BossDisplay, { HeroDisplay, ActionState } from './boss-display.tsx'; 

// --- IMPORT SKILL COMPONENT ---
import SkillEffect, { SkillStyles, SkillProps } from './skill-effect.tsx';

interface BossBattleWrapperProps {
  userId: string;
  onClose: () => void;
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete: (newFloor: number) => void;
}

// --- CONSTANTS ---
const ORB_SPAWN_SLOTS = [
    { left: '15%', top: '30%' },
    { left: '25%', top: '20%' },
    { left: '35%', top: '35%' },
    { left: '10%', top: '40%' },
];

const BOSS_ORB_SPAWN_SLOTS = [
    { left: '68%', top: '25%' },
    { left: '76%', top: '10%' },
    { left: '82%', top: '22%' },
    { left: '72%', top: '34%' },
];

const SKIP_BATTLE_ICON = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/skip-battle.webp";
const SWEEP_BATTLE_ICON = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/sweep-battle.webp";
const FIGHT_ICON = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/fight.webp";
const BACKGROUND_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-tower.webp";

// --- UI ICONS ---
const HomeIcon = memo(({ className = '' }: { className?: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> 
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> 
    </svg> 
));

// --- FLOATING TEXT COMPONENT ---
interface DamageText {
    id: number;
    text: string;
    color: string;
    x: number;
    y: number;
    fontSize: number;
}

const FloatingText = memo(({ data }: { data: DamageText }) => {
  return (
    <div 
        key={data.id} 
        className="absolute font-lilita animate-float-up pointer-events-none z-50 whitespace-nowrap" 
        style={{ 
            left: `${data.x}%`, 
            top: `${data.y}%`,
            color: data.color,
            fontSize: `${data.fontSize}px`,
            textShadow: 'none'
        }}
    >
        {data.text}
    </div>
  );
});

// --- NEW COMPONENT: LOOT DISPLAY ---
// Hiển thị vật phẩm rơi ra giữa màn hình khi Boss chết
const LootDisplay = memo(({ rewards }: { rewards: { coins: number; energy: number } }) => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-50 pointer-events-none">
            <style>{`
                @keyframes loot-pop {
                    0% { transform: scale(0) translateY(20px); opacity: 0; }
                    40% { transform: scale(1.2) translateY(-10px); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes loot-float-fade {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
                .animate-loot-pop { animation: loot-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-loot-fade { animation: loot-float-fade 0.8s ease-in forwards 1.2s; }
            `}</style>
            
            <div className="flex gap-6 animate-loot-pop animate-loot-fade">
                {rewards.coins > 0 && (
                    <div className="flex flex-col items-center gap-1">
                        <img src={bossBattleAssets.coinIcon} alt="Coin" className="w-16 h-16 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]" />
                        <span className="text-2xl font-bold text-yellow-300 text-shadow-sm">+{rewards.coins}</span>
                    </div>
                )}
                {rewards.energy > 0 && (
                    <div className="flex flex-col items-center gap-1">
                        <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-16 h-16 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                        <span className="text-2xl font-bold text-cyan-300 text-shadow-sm">+{rewards.energy}</span>
                    </div>
                )}
            </div>
        </div>
    );
});

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

    const [damages, setDamages] = useState<DamageText[]>([]);
    const damagesRef = useRef<DamageText[]>([]);
    
    // Skill Effects State
    const [orbEffects, setOrbEffects] = useState<SkillProps[]>([]);
    
    // Visual HP States
    const [visualBossHp, setVisualBossHp] = useState(0);
    const [visualPlayerHp, setVisualPlayerHp] = useState(0);

    // --- ANIMATION & SEQUENCE STATES ---
    const [heroState, setHeroState] = useState<ActionState>('idle');
    const [bossState, setBossState] = useState<ActionState>('idle');
    
    // State quản lý chuỗi animation thắng trận
    const [sequenceState, setSequenceState] = useState<'none' | 'victory_sequence'>('none'); 

    const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [sweepResult, setSweepResult] = useState<{ result: 'win' | 'lose'; rewards: { coins: number; energy: number } } | null>(null);
    const [isSweeping, setIsSweeping] = useState(false);
    
    const [bossImgSrc, setBossImgSrc] = useState<string>('');

    // --- EFFECT: HANDLE VICTORY SEQUENCE (KEY LOGIC CHANGE) ---
    useEffect(() => {
        // Chỉ kích hoạt khi thắng và chưa bắt đầu chuỗi animation
        if (gameOver === 'win' && sequenceState === 'none') {
            const isLastBoss = currentFloor === BOSS_DATA.length - 1;

            if (!isLastBoss) {
                // Nếu chưa phải boss cuối cùng -> Chạy hiệu ứng chuyển cảnh
                setSequenceState('victory_sequence');
                
                // 1. Boss chết (thu nhỏ, xoay, mờ)
                setBossState('dying');

                // 2. Sau khi animation chết xong (khoảng 1.2s), gọi Next Floor và hiện Loot
                setTimeout(() => {
                    // Cập nhật tầng mới trong Context (reset game state)
                    handleNextFloor(); 
                    
                    // 3. Sau một khoảng thời gian chờ Loot bay lên (pop: 0.5s + delay: 0.8s), Boss mới xuất hiện
                    setTimeout(() => {
                        setBossState('appearing');
                        
                        // 4. Sau khi boss xuất hiện xong (animation appearing ~1.2s) -> Trở về trạng thái chiến đấu
                        setTimeout(() => {
                            setBossState('idle');
                            setSequenceState('none');
                        }, 1200); 

                    }, 1500); // Delay để Loot hiện rõ rồi boss mới hiện

                }, 1200); // Delay khớp với animation 'dying'

            }
            // Nếu là Last Boss -> Không làm gì cả, Modal Victory sẽ được render ở dưới như cũ
        }
    }, [gameOver, currentFloor, handleNextFloor, sequenceState]);

    // --- SYNC VISUAL HP ---
    useEffect(() => {
        // Sync Boss
        if (bossStats && (battleState === 'idle' || visualBossHp === 0)) {
             // Chỉ sync lại khi không đang trong chuỗi chuyển cảnh để tránh glitch HP bar boss mới đè lên boss cũ đang chết
             if (sequenceState !== 'victory_sequence') {
                setVisualBossHp(bossStats.hp);
             }
        }
        // Sync Player
        if (playerStats && (battleState === 'idle' || visualPlayerHp === 0)) {
            setVisualPlayerHp(playerStats.hp);
        }
    }, [bossStats, playerStats, battleState, currentFloor, sequenceState]);

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

    // --- LOGIC HIỂN THỊ DAMAGE ---
    const addDamageText = useCallback((text: string, color: string, target: 'player' | 'boss', fontSize: number = 18) => { 
        const id = Date.now() + Math.random();
        
        let baseX = target === 'player' ? 15 : 75; 
        
        const baseY = 55;
        let finalX = baseX + (Math.random() * 12 - 6);
        let finalY = baseY + (Math.random() * 10 - 5);
        const isHeal = text.startsWith('+');
        if (isHeal) finalY -= 8;

        const checkLimit = 15;
        let count = 0;
        for (let i = damagesRef.current.length - 1; i >= 0; i--) {
            if (count >= checkLimit) break;
            const existing = damagesRef.current[i];
            const dx = Math.abs(existing.x - finalX);
            const dy = Math.abs(existing.y - finalY);
            if (dx < 8 && dy < 8) {
                finalY = existing.y - (6 + Math.random() * 2); 
                if (finalX > existing.x) finalX += (4 + Math.random() * 2); 
                else finalX -= (4 + Math.random() * 2);
            }
            count++;
        }

        const newText: DamageText = { id, text, color, x: finalX, y: finalY, fontSize };
        setDamages(prev => {
            const updated = [...prev, newText];
            damagesRef.current = updated;
            return updated;
        });
        setTimeout(() => {
            setDamages(prev => {
                const updated = prev.filter(d => d.id !== id);
                damagesRef.current = updated;
                return updated;
            });
        }, 1200);
    }, []);

    // --- TURN SEQUENCE LOGIC ---
    useEffect(() => {
        if (!lastTurnEvents) return;
        
        const { playerDmg, playerDmgHit1, playerDmgHit2, playerDmgHit3, playerHeal, bossDmg, bossReflectDmg } = lastTurnEvents;

        // --- 1. PLAYER TURN ---
        if (playerDmg > 0) {
            setHeroState('attack');
            setTimeout(() => setHeroState('idle'), 500); 

            const dmg1 = playerDmgHit1 || Math.ceil(playerDmg / 3);
            const dmg2 = playerDmgHit2 || Math.ceil(playerDmg / 3);
            const dmg3 = playerDmgHit3 || (playerDmg - dmg1 - dmg2);

            const shuffledSlots = [...ORB_SPAWN_SLOTS].sort(() => 0.5 - Math.random());
            const now = Date.now();
            
            const orb1: SkillProps = { id: now, type: 'player-orb', delay: 200, startPos: shuffledSlots[0] };
            const orb2: SkillProps = { id: now + 1, type: 'player-orb', delay: 400, startPos: shuffledSlots[1] };
            const orb3: SkillProps = { id: now + 2, type: 'player-orb', delay: 600, startPos: shuffledSlots[2] };

            setOrbEffects(prev => [...prev, orb1, orb2, orb3]);

            const baseFlightTime = 750;
            const hit1Time = 200 + baseFlightTime;
            const hit2Time = 400 + baseFlightTime;
            const hit3Time = 600 + baseFlightTime;

            // Hit 1
            setTimeout(() => {
                addDamageText(`-${formatDamageText(dmg1)}`, '#ef4444', 'boss', 30); 
                setVisualBossHp(prev => Math.max(0, prev - dmg1));
                setBossState('hit'); 
            }, hit1Time);
            setTimeout(() => setBossState('idle'), hit1Time + 400);

            // Hit 2
            setTimeout(() => {
                addDamageText(`-${formatDamageText(dmg2)}`, '#ef4444', 'boss', 32); 
                setVisualBossHp(prev => Math.max(0, prev - dmg2));
                setBossState('hit');
            }, hit2Time);
            setTimeout(() => setBossState('idle'), hit2Time + 400);

             // Hit 3
             setTimeout(() => {
                addDamageText(`-${formatDamageText(dmg3)}`, '#ef4444', 'boss', 40); 
                setVisualBossHp(prev => Math.max(0, prev - dmg3));
                setBossState('hit');
            }, hit3Time);
            
            // Cleanup Boss HP
            setTimeout(() => {
                setOrbEffects(prev => prev.filter(e => e.id !== orb1.id && e.id !== orb2.id && e.id !== orb3.id));
                // Nếu boss chưa chết sau hit cuối thì trả về idle (nếu boss chết thì context sẽ set gameOver)
                setBossState(prev => prev === 'hit' ? 'idle' : prev); 
            }, hit3Time + 500);
        }
        
        if (playerHeal > 0) {
             addDamageText(`+${formatDamageText(playerHeal)}`, '#4ade80', 'player', 20); 
             setVisualPlayerHp(prev => prev + playerHeal);
        }
        
        // --- 2. BOSS TURN ---
        const bossStartDelay = 2500; 
        
        if (bossDmg > 0) {
            setTimeout(() => {
                setBossState('attack');
                setTimeout(() => setBossState('idle'), 500);
            }, bossStartDelay);

            const shuffledBossSlots = [...BOSS_ORB_SPAWN_SLOTS].sort(() => 0.5 - Math.random());
            const now = Date.now() + 100;

            const bOrb1: SkillProps = { id: now + 10, type: 'boss-orb', delay: 200, startPos: shuffledBossSlots[0] };
            const bOrb2: SkillProps = { id: now + 11, type: 'boss-orb', delay: 400, startPos: shuffledBossSlots[1] };
            const bOrb3: SkillProps = { id: now + 12, type: 'boss-orb', delay: 600, startPos: shuffledBossSlots[2] };

            const bDmg1 = Math.floor(bossDmg * 0.3);
            const bDmg2 = Math.floor(bossDmg * 0.3);
            const bDmg3 = bossDmg - bDmg1 - bDmg2;

            setTimeout(() => {
                setOrbEffects(prev => [...prev, bOrb1, bOrb2, bOrb3]);
            }, bossStartDelay);

            const baseFlightTime = 750;
            const hit1Time = bossStartDelay + 200 + baseFlightTime;
            const hit2Time = bossStartDelay + 400 + baseFlightTime;
            const hit3Time = bossStartDelay + 600 + baseFlightTime;

            setTimeout(() => {
                addDamageText(`-${formatDamageText(bDmg1)}`, '#ef4444', 'player', 30); 
                setHeroState('hit');
                setVisualPlayerHp(prev => Math.max(0, prev - bDmg1));
            }, hit1Time);
            setTimeout(() => setHeroState('idle'), hit1Time + 400);

            setTimeout(() => {
                addDamageText(`-${formatDamageText(bDmg2)}`, '#ef4444', 'player', 32);
                setHeroState('hit');
                setVisualPlayerHp(prev => Math.max(0, prev - bDmg2));
            }, hit2Time);
            setTimeout(() => setHeroState('idle'), hit2Time + 400);

            setTimeout(() => {
                addDamageText(`-${formatDamageText(bDmg3)}`, '#ef4444', 'player', 36);
                setHeroState('hit');
                setVisualPlayerHp(prev => Math.max(0, prev - bDmg3));
            }, hit3Time);
            setTimeout(() => setHeroState('idle'), hit3Time + 400);

            setTimeout(() => {
                 setOrbEffects(prev => prev.filter(e => e.id !== bOrb1.id && e.id !== bOrb2.id && e.id !== bOrb3.id));
                 if(playerStats) {
                     setVisualPlayerHp(current => {
                         if(Math.abs(current - playerStats.hp) < 100) return playerStats.hp;
                         return current;
                     });
                 }
            }, hit3Time + 500);
        }

        if (bossReflectDmg > 0) {
            setTimeout(() => {
                addDamageText(`-${formatDamageText(bossReflectDmg)}`, '#fbbf24', 'player', 18); 
                setVisualPlayerHp(prev => Math.max(0, prev - bossReflectDmg));
            }, 3000); 
        }

    }, [lastTurnEvents, addDamageText]); 

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
            <SkillStyles />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
                .font-lilita { font-family: 'Lilita One', cursive; } 
                .font-sans { font-family: sans-serif; } 
                .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
                .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
                
                @keyframes float-up { 
                    0% { transform: translateY(0) scale(1); opacity: 1; } 
                    20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
                    100% { transform: translateY(-80px) scale(1); opacity: 0; } 
                } 
                .animate-float-up { animation: float-up 1.2s ease-out forwards; } 

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
            `}</style>
      
            {sweepResult && ( <SweepRewardsModal isSuccess={sweepResult.result === 'win'} rewards={sweepResult.rewards} onClose={() => setSweepResult(null)} /> )}
            {statsModalTarget && playerStats && bossStats && <CharacterStatsModal character={statsModalTarget === 'player' ? playerStats : bossStats} characterType={statsModalTarget} onClose={() => setStatsModalTarget(null)}/>}
            {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}
            {showRewardsModal && currentBossData && <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards}/>}

            <div className="relative w-full min-h-screen flex flex-col items-center font-lilita text-white overflow-hidden">
                
                {/* --- BACKGROUND LAYER --- */}
                <div className="absolute inset-0 z-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-no-repeat bg-slate-900"
                        style={{ 
                            backgroundImage: `url(${BACKGROUND_IMAGE})`,
                            backgroundPosition: 'center 30px'
                        }}
                    />
                    <div className="absolute inset-0 bg-black/70" />
                </div>

                {isLoading ? (
                    <div className="absolute inset-0 z-50">
                        <BossBattleLoader />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col relative z-10">
                        {(!playerStats || !bossStats || !currentBossData) ? (
                            <div className="absolute inset-0 z-50">
                                <BossBattleLoader />
                            </div>
                        ) : (
                            <>
                                {/* --- HEADER --- */}
                                <header className="fixed top-0 left-0 w-full z-30 p-2 bg-slate-900/90 border-b border-slate-700/50 shadow-lg h-14">
                                    <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                                        <div className="flex items-center gap-3">
                                            <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Go Home">
                                                <HomeIcon className="w-5 h-5 text-slate-300" />
                                                <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 font-sans">
                                            <EnergyDisplay currentEnergy={animatedEnergy} maxEnergy={playerStats.maxEnergy} isStatsFullscreen={false} />
                                            <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                                        </div>
                                    </div>
                                </header>
    
                                {/* --- LEFT SIDE UTILITIES (Floor + Sweep) --- */}
                                <div className="absolute top-16 left-4 z-20 flex flex-col gap-3 items-start">
                                    {/* Floor Indicator */}
                                    <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-1.5 rounded-full border border-slate-600 shadow-md h-9 opacity-50">
                                        <img src={bossBattleAssets.floorIcon} alt="Floor" className="w-4 h-4 opacity-80" />
                                        <h3 className="font-bold text-sm tracking-widest uppercase text-slate-200 select-none shadow-black drop-shadow-sm">
                                            {currentBossData.floor}
                                        </h3>
                                    </div>

                                    {/* Sweep Button */}
                                    {currentFloor > 0 && battleState === 'idle' && (
                                        <button 
                                            onClick={handleSweepClick} 
                                            disabled={(playerStats.energy || 0) < 10 || isSweeping} 
                                            className="transition-all active:scale-95 hover:scale-105 disabled:opacity-50 disabled:grayscale relative group rounded-full"
                                            title="Sweep"
                                        >
                                            <img src={SWEEP_BATTLE_ICON} alt="Sweep" className="w-24 h-auto object-contain drop-shadow-md" />
                                            {isSweeping && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"><span className="animate-spin text-white">⟳</span></div>}
                                        </button>
                                    )}
                                </div>

                                {/* --- UTILITY BUTTONS (RIGHT) --- */}
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
    
                                <main className="w-full h-full flex flex-col justify-center items-center pt-[72px] relative overflow-hidden">
                                    
                                    {/* --- BATTLE STAGE --- */}
                                    <div className="w-full max-w-6xl mx-auto flex flex-row justify-between items-end px-4 md:px-12 h-[50vh] md:h-[60vh] relative">
                                        
                                        {/* LEFT: HERO */}
                                        <div className="w-[45%] md:w-[40%] h-full flex flex-col justify-end items-center relative z-10">
                                            <HeroDisplay 
                                                stats={playerStats ? { ...playerStats, hp: visualPlayerHp } : playerStats}
                                                onStatsClick={() => setStatsModalTarget('player')} 
                                                actionState={heroState} 
                                            />
                                        </div>

                                        {/* RIGHT: BOSS */}
                                        <div className="w-[45%] md:w-[40%] h-full flex flex-col justify-end items-center relative z-10">
                                            <BossDisplay 
                                                bossId={currentBossData.id}
                                                name={currentBossData.name}
                                                element={bossElement}
                                                hp={visualBossHp} 
                                                maxHp={bossStats.maxHp}
                                                imgSrc={bossImgSrc}
                                                onImgError={handleBossImgError}
                                                onStatsClick={() => setStatsModalTarget('boss')}
                                                actionState={bossState} 
                                            />
                                        </div>

                                        {/* EFFECTS LAYER */}
                                        <div className="absolute inset-0 pointer-events-none z-40">
                                            {/* Render all skills (Player + Boss) via single array */}
                                            {orbEffects.map(effect => (
                                                <SkillEffect 
                                                    key={effect.id} 
                                                    id={effect.id}
                                                    type={effect.type}
                                                    delay={effect.delay}
                                                    startPos={effect.startPos}
                                                />
                                            ))}
                                            
                                            {/* Render Damages Text */}
                                            {damages.map(d => (
                                                <FloatingText key={d.id} data={d} />
                                            ))}

                                            {/* LOOT ANIMATION LAYER - Chỉ hiện khi đang chạy chuỗi Victory Sequence */}
                                            {sequenceState === 'victory_sequence' && currentBossData.rewards && (
                                                <LootDisplay rewards={currentBossData.rewards} />
                                            )}
                                        </div>

                                    </div>

                                    {/* --- ACTION BAR --- */}
                                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mt-24 z-50">
                                        {/* Chỉ hiện nút Fight khi Battle Idle VÀ không đang trong chuỗi animation thắng */}
                                        {battleState === 'idle' && sequenceState === 'none' ? (
                                            <div className="flex gap-4 items-center">
                                                <button onClick={startGame} disabled={(playerStats.energy || 0) < 10} className="transition-all active:scale-95 hover:scale-105 rounded-full relative group">
                                                    <img src={FIGHT_ICON} alt="Fight" className="w-36 h-auto object-contain" />
                                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full border border-slate-600/50">
                                                        <span>10</span>
                                                        <img src={bossBattleAssets.energyIcon} alt="" className="w-3 h-3"/>
                                                    </div>
                                                </button>
                                            </div>
                                        ) : (
                                            // Ẩn nút Skip khi đã thắng/thua để tránh glitch animation
                                            !gameOver && battleState === 'fighting' && (
                                                <button onClick={skipBattle} className="transition-all active:scale-95 hover:scale-105 rounded-full" title="Skip Battle">
                                                    <img src={SKIP_BATTLE_ICON} alt="Skip" className="w-36 h-auto object-contain" />
                                                </button>
                                            )
                                        )}
                                    </div>
    
                                    {/* VICTORY MODAL - Chỉ hiện khi là Boss cuối cùng */}
                                    {gameOver === 'win' && currentFloor === BOSS_DATA.length - 1 && (
                                        <VictoryModal onRestart={retryCurrentFloor} onNextFloor={handleNextFloor} isLastBoss={true} rewards={currentBossData.rewards} />
                                    )}

                                    {/* DEFEAT MODAL */}
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
