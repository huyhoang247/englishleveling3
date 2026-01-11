// --- START OF FILE tower-ui.tsx ---

import React, { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { BossBattleProvider, useBossBattle, CombatStats, HitEvent } from './tower-context.tsx';
import BOSS_DATA from './tower-data.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import EnergyDisplay from '../../ui/display/energy-display.tsx'; 
import { uiAssets, bossBattleAssets } from '../../game-assets.ts';
import BossBattleLoader from './tower-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import { ELEMENTS, ElementKey } from './thuoc-tinh.tsx';
import BossDisplay, { HeroDisplay } from './boss-display.tsx'; 

interface BossBattleWrapperProps {
  userId: string;
  onClose: () => void;
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
  onFloorComplete: (newFloor: number) => void;
}

// --- ICONS & VISUAL COMPONENTS ---

const HomeIcon = memo(({ className = '' }: { className?: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> 
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> 
    </svg> 
));

const FloatingText = memo(({ text, colorClass, side }: { text: string, colorClass: string, side: 'left' | 'right' }) => {
  // side='left': Text hiện bên trái (phía Player)
  // side='right': Text hiện bên phải (phía Boss)
  const positionClass = side === 'left' ? 'left-[25%] md:left-[30%]' : 'right-[25%] md:right-[30%]';
  return (
    <div className={`absolute top-1/2 ${positionClass} font-lilita text-4xl animate-float-up pointer-events-none z-[60] ${colorClass}`} style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}>
        {text}
    </div>
  );
});

// --- ENERGY ORB COMPONENT ---
// Component quản lý vòng đời của 1 quả cầu: Spawn -> Hover -> Shoot -> Hit
interface OrbProps {
    id: number;
    delaySpawn: number;   // Thời gian chờ để bắt đầu xuất hiện
    delayShoot: number;   // Thời gian chờ để bắt đầu bắn (tính từ lúc render component)
    targetSide: 'left' | 'right'; // left: Bắn về phía Player, right: Bắn về phía Boss
    positionOffset: { x: number, y: number }; // Vị trí lệch ngẫu nhiên để không chồng lên nhau
    onHit: () => void;    // Callback khi chạm đích
}

const EnergyOrb = memo(({ id, delaySpawn, delayShoot, targetSide, positionOffset, onHit }: OrbProps) => {
    // Sprite Sheet: 498x456, Frame: 83x76 (6x6 grid)
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/skill-1.webp";
    
    // State quản lý giai đoạn animation
    const [phase, setPhase] = useState<'hidden' | 'spawning' | 'hovering' | 'shooting'>('hidden');

    useEffect(() => {
        // 1. Giai đoạn Spawn (Zoom 0 -> 0.8)
        const spawnTimer = setTimeout(() => {
            setPhase('spawning');
        }, delaySpawn);

        // 2. Giai đoạn Hover (Giữ trên không - sau khi spawn 1s)
        const hoverTimer = setTimeout(() => {
            setPhase('hovering');
        }, delaySpawn + 1000);

        // 3. Giai đoạn Shoot (Bắn đi)
        const shootTimer = setTimeout(() => {
            setPhase('shooting');
        }, delayShoot);

        // 4. Giai đoạn Hit (Kết thúc - Shoot bay mất 2s)
        const hitTimer = setTimeout(() => {
            onHit();
        }, delayShoot + 2000);

        return () => {
            clearTimeout(spawnTimer);
            clearTimeout(hoverTimer);
            clearTimeout(shootTimer);
            clearTimeout(hitTimer);
        };
    }, [delaySpawn, delayShoot, onHit]);

    if (phase === 'hidden') return null;

    // Tính toán vị trí xuất phát
    const isShootingAtBoss = targetSide === 'right'; // Orb của Player bắn sang phải
    // Player đứng bên trái (~25%), Boss đứng bên phải (~75%)
    const baseLeft = isShootingAtBoss ? '25%' : '75%';
    const baseTop = '40%'; // Cao hơn đầu nhân vật một chút

    const style: React.CSSProperties = {
        position: 'absolute',
        width: '83px',
        height: '76px',
        backgroundImage: `url(${spriteUrl})`,
        backgroundSize: '498px 456px',
        zIndex: 50,
        left: `calc(${baseLeft} + ${positionOffset.x}px)`,
        top: `calc(${baseTop} + ${positionOffset.y}px)`,
        transformOrigin: 'center',
    };

    // Áp dụng Animation CSS dựa trên Phase
    let animationClass = '';
    if (phase === 'spawning') {
        // Zoom từ 0 lên 0.8 trong 1s
        animationClass = 'animate-orb-spawn animate-orb-spin';
    } else if (phase === 'hovering') {
        // Giữ nguyên vị trí (có thể nhấp nhô nhẹ)
        animationClass = 'animate-orb-hover animate-orb-spin';
    } else if (phase === 'shooting') {
        // Bay tới mục tiêu trong 2s
        animationClass = isShootingAtBoss 
            ? 'animate-orb-shoot-right animate-orb-spin' 
            : 'animate-orb-shoot-left animate-orb-spin';
    }

    return <div style={style} className={`pointer-events-none ${animationClass}`} />;
});


// --- MODALS ---

const CharacterStatsModal = memo(({ character, characterType, onClose }: { character: CombatStats, characterType: 'player' | 'boss', onClose: () => void }) => {
  const isPlayer = characterType === 'player';
  const title = isPlayer ? 'YOUR STATS' : 'BOSS STATS';
  const titleColor = isPlayer ? 'text-blue-300' : 'text-red-400';
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/90 border border-slate-600 rounded-xl shadow-2xl p-6 text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500 flex items-center justify-center text-white">✕</button>
        <h3 className={`text-2xl font-bold text-center ${titleColor} mb-6 tracking-widest`}>{title}</h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                <span className="text-slate-400">HP</span>
                <span className="text-xl text-green-400">{character.hp} <span className="text-sm text-slate-500">/ {character.maxHp}</span></span>
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                <span className="text-slate-400">ATK</span>
                <span className="text-xl text-red-400">{character.atk}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                <span className="text-slate-400">DEF</span>
                <span className="text-xl text-blue-400">{character.def}</span>
            </div>
        </div>
      </div>
    </div>
  )
});

const RewardsModal = memo(({ onClose, rewards }: { onClose: () => void, rewards: { coins: number, energy: number } }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
        <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl p-6 text-white font-lilita" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500 flex items-center justify-center text-white">✕</button>
            <h3 className="text-2xl font-bold text-center text-yellow-400 mb-6 uppercase">Rewards</h3>
            <div className="flex justify-center gap-4">
                <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center min-w-[100px]">
                    <img src={bossBattleAssets.coinIcon} className="w-8 h-8 mb-2" />
                    <span className="text-yellow-300 text-xl">{rewards.coins}</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center min-w-[100px]">
                    <img src={bossBattleAssets.energyIcon} className="w-8 h-8 mb-2" />
                    <span className="text-cyan-300 text-xl">{rewards.energy}</span>
                </div>
            </div>
        </div>
    </div>
));

const LogModal = memo(({ log, onClose }: { log: string[], onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
        <div className="relative w-96 max-w-md bg-slate-900/95 border border-slate-600 rounded-xl shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-cyan-300 font-lilita tracking-wide">BATTLE LOG</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500 text-white flex items-center justify-center">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow flex flex-col-reverse gap-2 scrollbar-thin font-sans text-sm text-slate-300">
                {log.length > 0 ? log.map((entry, idx) => (
                    <div key={idx} className="border-b border-slate-800 pb-1" dangerouslySetInnerHTML={{ __html: entry }} />
                )) : <p className="text-center italic text-slate-500">No history yet.</p>}
            </div>
        </div>
    </div>
));

const VictoryModal = memo(({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[90] animate-fade-in">
        <div className="relative w-80 bg-slate-900 border-2 border-yellow-500 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] p-8 flex flex-col items-center text-center font-lilita text-white">
            <img src={bossBattleAssets.victoryIcon} className="w-24 h-24 mb-4 object-contain drop-shadow-lg" />
            <h2 className="text-5xl text-yellow-400 mb-2 drop-shadow-md">VICTORY</h2>
            <div className="w-full bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest">Rewards</p>
                <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2"><img src={bossBattleAssets.coinIcon} className="w-6 h-6"/><span className="text-xl text-yellow-300">{rewards.coins}</span></div>
                    <div className="flex items-center gap-2"><img src={bossBattleAssets.energyIcon} className="w-6 h-6"/><span className="text-xl text-cyan-300">{rewards.energy}</span></div>
                </div>
            </div>
            <div className="w-full space-y-3">
                {!isLastBoss ? (
                    <button onClick={onNextFloor} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl uppercase shadow-lg shadow-blue-900/50 transition-transform hover:scale-105">Next Floor</button>
                ) : (
                    <button onClick={onRestart} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-xl uppercase shadow-lg shadow-yellow-900/50 transition-transform hover:scale-105">Play Again</button>
                )}
            </div>
        </div>
    </div>
));

const DefeatModal = memo(({ onRestart }: { onRestart: () => void }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[90] animate-fade-in">
        <div className="relative w-80 bg-slate-900 border-2 border-red-900 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] p-8 flex flex-col items-center text-center font-lilita text-white">
            <img src={bossBattleAssets.defeatIcon} className="w-24 h-24 mb-4 object-contain opacity-80" />
            <h2 className="text-5xl text-red-500 mb-2">DEFEAT</h2>
            <p className="text-slate-400 mb-8 font-sans">You have fallen. Rise and try again!</p>
            <button onClick={onRestart} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-xl uppercase shadow-lg transition-transform hover:scale-105">Try Again</button>
        </div>
    </div>
));

const SweepModal = memo(({ result, onClose }: { result: { result: 'win'|'lose', rewards: any }, onClose: () => void }) => (
     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
        <div className="relative w-80 bg-slate-900/90 border border-slate-600 rounded-xl shadow-2xl p-6 text-white font-lilita text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-3xl mb-4 ${result.result === 'win' ? 'text-yellow-400' : 'text-red-500'}`}>{result.result === 'win' ? 'SWEEP COMPLETE' : 'SWEEP FAILED'}</h3>
            {result.result === 'win' && (
                <div className="flex justify-center gap-4 mb-6">
                     <div className="flex items-center gap-2"><img src={bossBattleAssets.coinIcon} className="w-6 h-6"/><span className="text-xl text-yellow-300">{result.rewards.coins}</span></div>
                     <div className="flex items-center gap-2"><img src={bossBattleAssets.energyIcon} className="w-6 h-6"/><span className="text-xl text-cyan-300">{result.rewards.energy}</span></div>
                </div>
            )}
            <button onClick={onClose} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-lg">Close</button>
        </div>
    </div>
));


// --- MAIN VIEW COMPONENT ---

const BossBattleView = ({ onClose }: { onClose: () => void }) => {
    // Lấy data và action từ Context
    const {
        isLoading, error, playerStats, bossStats, previousCombatLog, gameOver,
        battleState, currentFloor, displayedCoins, currentBossData, currentTurnData,
        startGame, skipBattle, retryCurrentFloor, handleNextFloor, handleSweep,
        applyHitDamage, completeTurn
    } = useBossBattle();

    // State hiển thị visual
    const [activeOrbs, setActiveOrbs] = useState<OrbProps[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string, color: string, side: 'left'|'right' }[]>([]);
    
    // State Modal
    const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [sweepResult, setSweepResult] = useState<any>(null);
    const [isSweeping, setIsSweeping] = useState(false);

    // Ref để tránh re-render loop khi xử lý turn data
    const processingTurnRef = useRef<number | null>(null);

    // --- ORCHESTRATOR: TÍNH TOÁN ANIMATION CHO LƯỢT ĐẤU ---
    useEffect(() => {
        // Chỉ chạy khi có data lượt mới và đang trong trạng thái chiến đấu
        if (!currentTurnData || battleState !== 'fighting' || gameOver) return;
        
        // Nếu đã xử lý turn này rồi thì bỏ qua
        if (processingTurnRef.current === currentTurnData.turnNumber) return;
        processingTurnRef.current = currentTurnData.turnNumber;

        const { playerHits, bossHits } = currentTurnData;

        // --- TÍNH TOÁN TIMELINE (Mili giây) ---
        // Yêu cầu: 
        // 1. Spawn từng quả cách nhau 1s.
        // 2. Sau khi quả cuối cùng Spawn xong -> Wait 3s (giữ trên không).
        // 3. Sau đó bắn từng quả cách nhau 0.5s.
        // 4. Bay mất 2s.

        // Timeline cho Player
        const playerOrbCount = playerHits.length;
        // Thời điểm quả cầu cuối cùng spawn xong (cộng thêm 1s duration của spawn)
        const playerAllSpawnedTime = (playerOrbCount - 1) * 1000 + 1000;
        // Thời điểm bắt đầu bắn (sau khi spawn xong + 3s wait)
        const playerStartShootTime = playerAllSpawnedTime + 3000;

        const playerOrbs: OrbProps[] = playerHits.map((hit, index) => ({
            id: Date.now() + Math.random(),
            delaySpawn: index * 1000,
            delayShoot: playerStartShootTime + (index * 500), // Bắn lệch nhau 0.5s
            targetSide: 'right', // Bắn sang Boss
            positionOffset: calculateOrbOffset(index),
            onHit: () => {
                applyHitDamage(hit, 'boss');
                showDamageText(hit.damage, 'right', 'text-red-500'); // Hiển thị dmg bên phải (trên đầu Boss)
                if (hit.heal > 0) showDamageText(hit.heal, 'left', 'text-green-400'); // Hồi máu hiển thị bên trái
            }
        }));

        // Timeline cho Boss (Bắt đầu sau khi Player bắn xong)
        // Thời điểm quả cầu cuối của Player chạm đích
        const lastPlayerHitTime = playerStartShootTime + ((playerOrbCount - 1) * 500) + 2000;
        const bossStartTime = lastPlayerHitTime + 1000; // Nghỉ 1s rồi tới lượt Boss

        const bossOrbCount = bossHits.length;
        const bossAllSpawnedTime = bossStartTime + ((bossOrbCount - 1) * 1000) + 1000;
        const bossStartShootTime = bossAllSpawnedTime + 3000;

        const bossOrbs: OrbProps[] = bossHits.map((hit, index) => ({
            id: Date.now() + Math.random(),
            delaySpawn: bossStartTime + (index * 1000),
            delayShoot: bossStartShootTime + (index * 500),
            targetSide: 'left', // Bắn sang Player
            positionOffset: calculateOrbOffset(index),
            onHit: () => {
                applyHitDamage(hit, 'player');
                showDamageText(hit.damage, 'left', 'text-red-500'); // Dmg bên trái (trên đầu Player)
                if (hit.reflect > 0) showDamageText(hit.reflect, 'right', 'text-orange-400'); // Phản dmg
            }
        }));

        // Đẩy toàn bộ Orbs vào mảng active để render
        setActiveOrbs([...playerOrbs, ...bossOrbs]);

        // Lên lịch kết thúc lượt
        const totalDuration = bossStartShootTime + ((bossOrbCount - 1) * 500) + 2500;
        const completeTimer = setTimeout(() => {
            setActiveOrbs([]); // Xóa sạch Orbs
            completeTurn();    // Gọi Context chuyển lượt
        }, totalDuration);

        return () => clearTimeout(completeTimer);

    }, [currentTurnData, battleState, gameOver, applyHitDamage, completeTurn]);


    // --- HELPERS ---
    
    // Tính vị trí lệch ngẫu nhiên cho đẹp đội hình Orb
    const calculateOrbOffset = (index: number) => {
        // Xếp theo lưới 3 cột
        const col = index % 3;
        const row = Math.floor(index / 3);
        return {
            x: (col - 1) * 60 + (Math.random() * 20 - 10), // Lệch X +/- 60px
            y: -(row * 60) - 120 // Xếp chồng lên trên đầu, dòng sau cao hơn dòng trước
        };
    };

    const showDamageText = useCallback((amount: number, side: 'left'|'right', color: string) => {
        // Format số damage (ví dụ 1.2k)
        const text = amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : String(amount);
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, text, side, color }]);
        // Tự xóa sau 1.5s
        setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1500);
    }, []);

    const handleSweepClick = async () => {
        setIsSweeping(true);
        const res = await handleSweep();
        setSweepResult(res);
        setIsSweeping(false);
    };

    // --- DERIVED STATE ---
    
    // Tính thuộc tính Boss dựa trên tầng (để hiển thị icon khắc hệ)
    const bossElement = useMemo(() => {
        const keys = Object.keys(ELEMENTS) as ElementKey[];
        const index = (currentFloor * 7 + 3) % keys.length;
        return keys[index];
    }, [currentFloor]);

    // Xử lý ảnh Boss (fallback sang GIF nếu cần hoặc load tĩnh)
    const [bossImgSrc, setBossImgSrc] = useState('');
    useEffect(() => {
        if (currentBossData) {
            setBossImgSrc(`/images/boss/${String(currentBossData.id).padStart(2, '0')}.webp`);
        }
    }, [currentBossData?.id]);

    const handleBossImgError = useCallback(() => {
        if (currentBossData) {
            const gifPath = `/images/boss/${String(currentBossData.id).padStart(2, '0')}.gif`;
            if (!bossImgSrc.endsWith('.gif')) setBossImgSrc(gifPath);
        }
    }, [currentBossData, bossImgSrc]);

    // Animation số tiền/energy chạy
    const animatedCoins = useAnimateValue(isLoading ? 0 : displayedCoins);
    const animatedEnergy = useAnimateValue(playerStats?.energy ?? 0);


    // --- RENDER ---
    
    if (error) return (
        <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
            <p className="text-red-400 text-xl">Error: {error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded">Close</button>
        </div>
    );

    return (
        <>
            {/* CSS STYLES & KEYFRAMES */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
                .font-lilita { font-family: 'Lilita One', cursive; } 
                .font-sans { font-family: sans-serif; }
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
                
                /* --- Text Floating Animation --- */
                @keyframes float-up { 
                    0% { transform: translateY(0) scale(1); opacity: 1; } 
                    100% { transform: translateY(-100px) scale(1.5); opacity: 0; } 
                } 
                .animate-float-up { animation: float-up 1.5s ease-out forwards; }
                
                /* --- Modal Fade In --- */
                @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }

                /* --- BUTTON SHINE EFFECT --- */
                .btn-shine { position: relative; overflow: hidden; }
                .btn-shine::after {
                    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: 0.5s;
                }
                .btn-shine:hover::after { left: 100%; }

                /* --- ORB ANIMATIONS --- */
                /* 1. Xoay tròn sprite (6 frames) */
                @keyframes orb-spin { from { background-position-x: 0; } to { background-position-x: -498px; } }
                .animate-orb-spin { animation-name: orb-spin; animation-duration: 0.4s; animation-timing-function: steps(6); animation-iteration-count: infinite; }

                /* 2. Spawn: Zoom 0->0.8 */
                @keyframes orb-spawn {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(0.8); opacity: 1; }
                }
                .animate-orb-spawn { animation-name: orb-spawn, orb-spin; animation-duration: 1s, 0.4s; animation-fill-mode: forwards, none; }

                /* 3. Hover: Nhấp nhô nhẹ */
                @keyframes orb-hover {
                    0%, 100% { transform: translateY(0) scale(0.8); }
                    50% { transform: translateY(-10px) scale(0.8); }
                }
                .animate-orb-hover { animation-name: orb-hover, orb-spin; animation-duration: 3s, 0.4s; animation-iteration-count: infinite, infinite; }

                /* 4. Shoot Right (Player -> Boss) */
                @keyframes orb-shoot-right {
                    0% { transform: translate(0, 0) scale(0.8); }
                    20% { transform: translate(-30px, 10px) scale(0.9); } /* Lùi lại lấy đà */
                    100% { transform: translate(50vw, 30vh) scale(0.5); opacity: 0; } /* Bay vút đi */
                }
                .animate-orb-shoot-right { animation-name: orb-shoot-right, orb-spin; animation-duration: 2s, 0.4s; animation-fill-mode: forwards, none; }

                /* 5. Shoot Left (Boss -> Player) */
                @keyframes orb-shoot-left {
                    0% { transform: translate(0, 0) scale(0.8); }
                    20% { transform: translate(30px, 10px) scale(0.9); }
                    100% { transform: translate(-50vw, 30vh) scale(0.5); opacity: 0; }
                }
                .animate-orb-shoot-left { animation-name: orb-shoot-left, orb-spin; animation-duration: 2s, 0.4s; animation-fill-mode: forwards, none; }
            `}</style>
            
            {/* Background & Container */}
            <div className="relative w-full min-h-screen bg-[#110f21] font-lilita text-white overflow-hidden flex flex-col">
                
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#1a1633] to-[#2d1b4e]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,transparent_20%,#110f21_80%)] z-0 opacity-80 pointer-events-none"></div>

                {isLoading ? (
                    <BossBattleLoader />
                ) : (
                    <>
                        {/* --- HEADER --- */}
                        <header className="fixed top-0 left-0 w-full z-40 p-2 bg-slate-900/90 border-b border-slate-700/50 flex justify-between items-center shadow-lg h-16">
                            <div className="flex items-center gap-3 pl-2">
                                <button onClick={onClose} className="bg-slate-800 p-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors">
                                    <HomeIcon className="w-5 h-5 text-slate-300"/>
                                </button>
                                {currentBossData && (
                                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-slate-700">
                                        <img src={bossBattleAssets.floorIcon} className="w-4 h-4 opacity-80"/>
                                        <span className="text-sm tracking-widest text-slate-300">FLOOR {currentBossData.floor}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 pr-2 font-sans">
                                <EnergyDisplay currentEnergy={animatedEnergy} maxEnergy={playerStats?.maxEnergy || 100} isStatsFullscreen={false} />
                                <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                            </div>
                        </header>

                        {/* --- UTILITIES (Right Side) --- */}
                        <div className="absolute top-20 right-4 z-30 flex flex-col gap-3">
                            <button onClick={() => setShowLogModal(true)} disabled={!previousCombatLog.length && battleState === 'idle'} className="w-10 h-10 bg-slate-800 rounded-full border border-slate-600 p-2 hover:border-cyan-400 transition-colors shadow-lg" title="Battle Log">
                                <img src={bossBattleAssets.historyIcon} className="w-full h-full object-contain"/>
                            </button>
                            <button onClick={() => setShowRewardsModal(true)} className="w-10 h-10 bg-slate-800 rounded-full border border-slate-600 p-2 hover:border-yellow-400 transition-colors shadow-lg" title="Rewards">
                                <img src={bossBattleAssets.rewardsIcon} className="w-full h-full object-contain"/>
                            </button>
                        </div>

                        {/* --- BATTLE AREA --- */}
                        <main className="flex-grow flex items-center justify-center relative pt-16 overflow-hidden">
                             
                             {/* Layer Floating Text (Damage) */}
                             <div className="absolute inset-0 z-[60] pointer-events-none">
                                {floatingTexts.map(t => <FloatingText key={t.id} text={t.text} side={t.side} colorClass={t.color} />)}
                            </div>

                            {/* Layer Energy Orbs */}
                            <div className="absolute inset-0 z-50 pointer-events-none">
                                {activeOrbs.map(orb => (
                                    <EnergyOrb key={orb.id} {...orb} />
                                ))}
                            </div>

                            {/* Hero & Boss Container */}
                            <div className="w-full max-w-6xl h-[60vh] md:h-[65vh] flex justify-between items-end px-4 md:px-16 relative">
                                
                                {/* LEFT: HERO */}
                                <div className="w-[40%] h-full flex flex-col justify-end items-center z-10 relative">
                                    {playerStats && (
                                        <HeroDisplay 
                                            stats={playerStats} 
                                            onStatsClick={() => setStatsModalTarget('player')} 
                                        />
                                    )}
                                </div>

                                {/* RIGHT: BOSS */}
                                <div className="w-[40%] h-full flex flex-col justify-end items-center z-10 relative">
                                    {bossStats && currentBossData && (
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
                                    )}
                                </div>
                            </div>
                        </main>

                        {/* --- CONTROLS (Bottom) --- */}
                        <div className="w-full h-24 flex justify-center items-start pt-4 z-40 bg-gradient-to-t from-slate-900/50 to-transparent">
                            {battleState === 'idle' ? (
                                <div className="flex gap-4">
                                    {currentFloor > 0 && (
                                        <button onClick={handleSweepClick} disabled={(playerStats?.energy || 0) < 10 || isSweeping} className="px-6 py-3 bg-purple-900/80 hover:bg-purple-800 rounded-xl border border-purple-500 text-purple-200 font-bold font-sans disabled:opacity-50 transition-all">
                                            {isSweeping ? '...' : 'SWEEP'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={startGame} 
                                        disabled={(playerStats?.energy || 0) < 10}
                                        className="btn-shine group relative px-12 py-3 bg-gradient-to-b from-cyan-900 to-slate-900 rounded-xl border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl tracking-[0.2em] text-cyan-300 group-hover:text-white transition-colors">FIGHT</span>
                                            <div className="flex items-center gap-1 text-xs text-cyan-500 font-sans mt-0.5">
                                                <span>-10</span>
                                                <img src={bossBattleAssets.energyIcon} className="w-3 h-3"/>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                !gameOver && (
                                    <button onClick={skipBattle} className="px-8 py-2 bg-slate-800/80 hover:bg-red-900/80 text-slate-300 hover:text-white rounded-full border border-slate-600 transition-colors font-sans text-sm font-bold tracking-wide backdrop-blur-sm">
                                        SKIP ANIMATION
                                    </button>
                                )
                            )}
                        </div>

                        {/* --- MODALS LAYER --- */}
                        {statsModalTarget && playerStats && bossStats && (
                            <CharacterStatsModal 
                                character={statsModalTarget === 'player' ? playerStats : bossStats} 
                                characterType={statsModalTarget} 
                                onClose={() => setStatsModalTarget(null)} 
                            />
                        )}
                        
                        {showRewardsModal && currentBossData && (
                            <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards} />
                        )}
                        
                        {showLogModal && (
                            <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />
                        )}
                        
                        {sweepResult && (
                            <SweepModal result={sweepResult} onClose={() => setSweepResult(null)} />
                        )}

                        {gameOver === 'win' && currentBossData && (
                            <VictoryModal 
                                onRestart={retryCurrentFloor} 
                                onNextFloor={handleNextFloor} 
                                isLastBoss={currentFloor === BOSS_DATA.length - 1} 
                                rewards={currentBossData.rewards}
                            />
                        )}
                        
                        {gameOver === 'lose' && (
                            <DefeatModal onRestart={retryCurrentFloor} />
                        )}
                    </>
                )}
            </div>
        </>
    );
};

// --- EXPORT WRAPPER ---
export default function BossBattle(props: BossBattleWrapperProps) {
    return (
        <BossBattleProvider>
            <BossBattleView onClose={props.onClose} />
        </BossBattleProvider>
    );
}

// --- END OF FILE tower-ui.tsx ---
