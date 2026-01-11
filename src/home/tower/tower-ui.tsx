--- START OF FILE tower-ui.tsx (16).txt ---

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

// --- HELPER: Generate Random Position above Hero ---
// Tạo vị trí ngẫu nhiên trong vùng trên đầu Hero để không bị chồng chéo quá nhiều
const getOrbPosition = (index: number, total: number) => {
    // Hero Head Area roughly: left 15%->35%, top 20%->40%
    // Chia lưới hoặc random có kiểm soát
    const baseTop = 30; // %
    const baseLeft = 25; // %
    
    // Spread orbs out based on index
    // Ví dụ: Xếp thành hình vòng cung hoặc đám mây
    const spreadX = (Math.random() - 0.5) * 20; // +/- 10%
    const spreadY = (Math.random() - 0.5) * 15; // +/- 7.5%

    return {
        top: `${baseTop + spreadY}%`,
        left: `${baseLeft + spreadX}%`
    };
};

// --- ENERGY ORB EFFECT COMPONENT (ADVANCED) ---
interface OrbProps {
    id: number;
    index: number;
    totalOrbs: number;
    startPos: { top: string, left: string };
    targetPos: { top: string, left: string };
}

const EnergyOrbEffect = ({ id, index, totalOrbs, startPos, targetPos }: OrbProps) => {
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/skill-1.webp";
    
    // --- TIMING CONFIGURATION ---
    const spawnDuration = 1000; // 1s để zoom từ 0->1
    const shootInterval = 500;  // 0.5s khoảng cách giữa các lần bắn
    const flyDuration = 2000;   // 2s bay từ hero -> boss
    
    // Thời điểm bắt đầu spawn của quả này
    const mySpawnStartTime = index * 1000; 
    
    // Thời điểm tất cả quả cầu đã spawn xong (Ready to shoot phase)
    const allSpawnedTime = totalOrbs * 1000;
    
    // Thời điểm quả này bắt đầu bắn (sau khi tất cả đã spawn)
    // Cộng thêm 0.5s * thứ tự của quả này
    const myShootStartTime = allSpawnedTime + (index * shootInterval);

    // State điều khiển animation class
    const [phase, setPhase] = useState<'hidden' | 'appearing' | 'hovering' | 'shooting'>('hidden');

    useEffect(() => {
        // 1. Start Appearance
        const t1 = setTimeout(() => {
            setPhase('appearing');
        }, mySpawnStartTime);

        // 2. Switch to Hovering (sau khi appear xong 1s)
        const t2 = setTimeout(() => {
            setPhase('hovering');
        }, mySpawnStartTime + spawnDuration);

        // 3. Start Shooting
        const t3 = setTimeout(() => {
            setPhase('shooting');
        }, myShootStartTime);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [mySpawnStartTime, myShootStartTime, spawnDuration]);

    // Tính toán style động cho keyframes
    const style = {
        top: phase === 'shooting' ? targetPos.top : startPos.top,
        left: phase === 'shooting' ? targetPos.left : startPos.left,
        width: '83px',
        height: '76px',
        backgroundImage: `url(${spriteUrl})`,
        backgroundSize: '498px 456px',
        backgroundRepeat: 'no-repeat',
        opacity: phase === 'hidden' ? 0 : 1,
        transform: phase === 'hidden' ? 'scale(0)' : 'scale(1)',
        transition: phase === 'shooting' 
            ? `top ${flyDuration}ms ease-in, left ${flyDuration}ms ease-in, transform ${flyDuration}ms ease-in` // Khi bắn: di chuyển chậm
            : `transform ${spawnDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.27), opacity 0.5s ease-out` // Khi xuất hiện: zoom nảy
    };

    // Khi shooting, ta muốn nó nhỏ lại chút khi bay xa hoặc biến mất khi trúng
    if (phase === 'shooting') {
        // Có thể thêm logic biến mất ở cuối, nhưng cha sẽ unmount nó
    }

    return (
        <div 
            className={`absolute z-50 pointer-events-none origin-center ${phase === 'hovering' ? 'animate-orb-hover' : ''}`}
            style={style}
        >
             <div className="animate-orb-spin w-full h-full" />
        </div>
    );
};

// --- MODALS (Giữ nguyên) ---
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
        startGame, skipBattle, retryCurrentFloor, handleNextFloor, handleSweep, triggerNextTurn
    } = useBossBattle();

    const [damages, setDamages] = useState<{ id: number, text: string, colorClass: string, side: 'left'|'right' }[]>([]);
    
    // Quản lý danh sách các quả cầu
    interface ActiveOrb {
        id: number;
        index: number;
        total: number;
        startPos: { top: string, left: string };
        targetPos: { top: string, left: string };
    }
    const [activeOrbs, setActiveOrbs] = useState<ActiveOrb[]>([]);
    
    // Timer refs to clean up
    const timersRef = useRef<NodeJS.Timeout[]>([]);

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

    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [battleState]);

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

    // --- LOGIC ĐIỀU PHỐI BATTLE SEQUENCE ---
    useEffect(() => {
        if (!lastTurnEvents) return;
        const { playerDmg, playerHeal, bossDmg, bossReflectDmg } = lastTurnEvents;

        // --- CẤU HÌNH SỐ LƯỢNG QUẢ CẦU ---
        // Ví dụ: Mặc định 10 quả như yêu cầu
        const ORB_COUNT = 10; 
        const SPAWN_SPEED = 1000; // 1s
        const SHOOT_INTERVAL = 500; // 0.5s
        const FLY_TIME = 2000; // 2s

        // Tính tổng thời gian animation của Player:
        // T = (Số lượng * 1s spawn) + (Số lượng * 0.5s bắn) + 2s bay
        // Với 10 quả: 10s spawn + 5s bắn + 2s bay = 17s (Lượt đấu khá dài)
        // Lưu ý: Quả cuối cùng xuất hiện lúc 9s. Quả cuối cùng bắn lúc 10s + 4.5s = 14.5s. Chạm lúc 16.5s.
        const LAST_ORB_IMPACT_TIME = (ORB_COUNT * SPAWN_SPEED) + ((ORB_COUNT - 1) * SHOOT_INTERVAL) + FLY_TIME;

        if (playerDmg > 0) {
            const newOrbs: ActiveOrb[] = [];
            for (let i = 0; i < ORB_COUNT; i++) {
                newOrbs.push({
                    id: Date.now() + i,
                    index: i,
                    total: ORB_COUNT,
                    startPos: getOrbPosition(i, ORB_COUNT),
                    targetPos: { top: '55%', left: '68%' } // Vị trí giữa Boss
                });
            }
            setActiveOrbs(prev => [...prev, ...newOrbs]);

            // 1. Xóa Orb sau khi quả cuối cùng bay xong
            const tCleanup = setTimeout(() => {
                setActiveOrbs([]); // Xóa sạch
            }, LAST_ORB_IMPACT_TIME + 500); // Thêm chút buffer
            timersRef.current.push(tCleanup);

            // 2. Hiện Damage lên Boss (Ngay khi quả cuối cùng chạm - hoặc chia nhỏ damage nếu muốn)
            // Hiện tại ta hiện tổng damage 1 lần khi quả cuối cùng chạm cho gọn
            const tDamage = setTimeout(() => {
                showFloatingText(`-${formatDamageText(playerDmg)}`, 'text-red-500', 'right');
            }, LAST_ORB_IMPACT_TIME);
            timersRef.current.push(tDamage);
        }
        
        // Player Heal (Hiện sớm hơn chút)
        if (playerHeal > 0) {
            const tHeal = setTimeout(() => {
                showFloatingText(`+${formatDamageText(playerHeal)}`, 'text-green-400', 'left');
            }, 2000); 
            timersRef.current.push(tHeal);
        }
        
        // Boss attacks Player (Sau khi Boss nhận damage xong 0.5s)
        const tBossAttack = setTimeout(() => {
            if (bossDmg > 0) showFloatingText(`-${formatDamageText(bossDmg)}`, 'text-red-500', 'left');
            if (bossReflectDmg > 0) showFloatingText(`-${formatDamageText(bossReflectDmg)}`, 'text-orange-400', 'left');
        }, LAST_ORB_IMPACT_TIME + 500);
        timersRef.current.push(tBossAttack);

        // TRIGGER NEXT TURN (Sau Boss đánh 1.5s)
        const tNextTurn = setTimeout(() => {
             triggerNextTurn();
        }, LAST_ORB_IMPACT_TIME + 2000);
        timersRef.current.push(tNextTurn);

    }, [lastTurnEvents, showFloatingText, triggerNextTurn]);

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
                
                /* --- ENERGY ORB ANIMATIONS --- */
                /* 1. Xoay tròn Sprite (Grid 6x6) */
                @keyframes orb-spin-x { from { background-position-x: 0; } to { background-position-x: -498px; } }
                @keyframes orb-spin-y { from { background-position-y: 0; } to { background-position-y: -456px; } }
                .animate-orb-spin { 
                    animation: orb-spin-x 0.4s steps(6) infinite, orb-spin-y 2.4s steps(6) infinite; 
                }

                /* 2. Hiệu ứng Hover nhè nhẹ khi đang chờ bắn */
                @keyframes orb-hover-anim {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-10px) scale(1.05); }
                }
                .animate-orb-hover { animation: orb-hover-anim 2s ease-in-out infinite; }
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
                                {/* --- HEADER --- */}
                                <header className="fixed top-0 left-0 w-full z-30 p-2 bg-slate-900/90 border-b border-slate-700/50 shadow-lg h-14">
                                    <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                                        <div className="flex items-center gap-3">
                                            <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Go Home">
                                                <HomeIcon className="w-5 h-5 text-slate-300" />
                                                <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                                            </button>
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
    
                                {/* --- UTILITY BUTTONS --- */}
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
                                        
                                        <div className="w-[45%] md:w-[40%] h-full flex flex-col justify-end items-center relative z-10">
                                            <HeroDisplay stats={playerStats} onStatsClick={() => setStatsModalTarget('player')} />
                                        </div>

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
                                            {/* Render Active Orbs */}
                                            {activeOrbs.map(orb => (
                                                <EnergyOrbEffect 
                                                    key={orb.id} 
                                                    id={orb.id}
                                                    index={orb.index}
                                                    totalOrbs={orb.total}
                                                    startPos={orb.startPos}
                                                    targetPos={orb.targetPos}
                                                />
                                            ))}
                                            {damages.map(d => (
                                                <FloatingText key={d.id} text={d.text} id={d.id} colorClass={d.colorClass} side={d.side} />
                                            ))}
                                        </div>

                                    </div>

                                    {/* --- ACTION BAR --- */}
                                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mt-14 z-50">
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
