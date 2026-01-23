// --- START OF FILE tower-ui.tsx ---

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BossBattleProvider, useBossBattle } from './tower-context.tsx';
import BOSS_DATA from './tower-data.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import EnergyDisplay from '../../ui/display/energy-display.tsx'; 
import { bossBattleAssets } from '../../game-assets.ts';
import BossBattleLoader from './tower-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';

// --- IMPORT BOSS & ELEMENTS ---
import { ELEMENTS, ElementKey } from './thuoc-tinh.tsx';
import BossDisplay, { HeroDisplay, ActionState } from './boss-display.tsx'; 

// --- IMPORT SKILL ---
import { SkillStyles, SkillProps } from './skill-effect.tsx';

// --- IMPORT UI COMPONENTS ---
import { 
    MainBattleStyles, 
    HomeIcon, 
    BattleEffectsLayer, 
    DamageTextData, 
    LootItemData, 
    CharacterStatsModal, 
    RewardsModal, 
    VictoryModal, 
    DefeatModal 
} from './tower-ui-components.tsx';

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

// --- MAIN VIEW COMPONENT ---
const BossBattleView = ({ onClose }: { onClose: () => void }) => {
    const {
        isLoading, error, playerStats, bossStats, gameOver,
        battleState, currentFloor, displayedCoins, currentBossData, lastTurnEvents,
        startGame, skipBattle, retryCurrentFloor, handleNextFloor, handleSweep
    } = useBossBattle();

    const [damages, setDamages] = useState<DamageTextData[]>([]);
    
    // Skill Effects State
    const [orbEffects, setOrbEffects] = useState<SkillProps[]>([]);
    
    // Visual HP States
    const [visualBossHp, setVisualBossHp] = useState(0);
    const [visualPlayerHp, setVisualPlayerHp] = useState(0);

    // --- ANIMATION & SEQUENCE STATES ---
    const [heroState, setHeroState] = useState<ActionState>('idle');
    const [bossState, setBossState] = useState<ActionState>('idle');
    
    // States quản lý sequence chiến thắng
    const [sequenceState, setSequenceState] = useState<'none' | 'victory_sequence'>('none'); 
    
    const [lootItems, setLootItems] = useState<LootItemData[]>([]);
    const [statsModalTarget, setStatsModalTarget] = useState<null | 'player' | 'boss'>(null);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    
    const [isSweeping, setIsSweeping] = useState(false);
    
    const [bossImgSrc, setBossImgSrc] = useState<string>('');

    // --- LOGIC HIỂN THỊ DAMAGE / COLLECTED / VICTORY ---
    const addDamageText = useCallback((text: string, color: string, target: 'player' | 'boss' | 'custom', fontSize: number = 18, customX?: number, customY?: number, duration: number = 1200, className: string = '') => { 
        const id = Date.now() + Math.random();
        
        let finalX = 50;
        let finalY = 50;

        if (target === 'player') {
            finalX = 15 + (Math.random() * 12 - 6);
            finalY = 55 + (Math.random() * 10 - 5);
        } else if (target === 'boss') {
            finalX = 75 + (Math.random() * 12 - 6);
            finalY = 55 + (Math.random() * 10 - 5);
        } else if (target === 'custom' && customX !== undefined && customY !== undefined) {
            finalX = customX;
            finalY = customY;
        }

        const isHeal = text.startsWith('+');
        if (isHeal && target !== 'custom') finalY -= 8;

        const newText: DamageTextData = { id, text, color, x: finalX, y: finalY, fontSize, duration, className };
        
        setDamages(prev => [...prev, newText]);
        
        setTimeout(() => {
            setDamages(prev => prev.filter(d => d.id !== id));
        }, duration);
    }, []);

    // --- HELPER: ANIMATE LOOT DROP ---
    // Hàm này dùng chung cho cả khi Chiến thắng Battle và khi Sweep
    const animateLootDrop = useCallback((rewards: { coins: number, energy: number }, onComplete?: () => void) => {
        const newLootItems: LootItemData[] = [];
        let itemCount = 0;
        if(rewards.coins > 0) itemCount++;
        if(rewards.energy > 0) itemCount++;

        // LOGIC VỊ TRÍ LOOT: Rải đều ở dưới cùng màn hình (Y: 82%-92%)
        if (rewards.coins > 0) {
            const minX = itemCount > 1 ? 20 : 40;
            const maxX = itemCount > 1 ? 45 : 60;
            
            newLootItems.push({
                id: Date.now() + 1,
                image: bossBattleAssets.coinIcon,
                amount: rewards.coins,
                x: minX + Math.random() * (maxX - minX), 
                y: 82 + Math.random() * 10,
                isVisible: true
            });
        }
        
        if (rewards.energy > 0) {
            const minX = 55;
            const maxX = 80;

            newLootItems.push({
                id: Date.now() + 2,
                image: bossBattleAssets.energyIcon,
                amount: rewards.energy,
                x: minX + Math.random() * (maxX - minX),
                y: 82 + Math.random() * 10,
                isVisible: true
            });
        }

        setLootItems(newLootItems);

        // Sequence Collect: Đợi Loot hiện ra rồi bay đi
        setTimeout(() => {
            newLootItems.forEach((item, index) => {
                setTimeout(() => {
                    // Hiện chữ COLLECTED
                    addDamageText("COLLECTED", "#FFFFFF", "custom", 14, item.x - 8, item.y - 3, 1000, "uppercase tracking-wide");
                    
                    // Ẩn item sau khi text hiện lên
                    setTimeout(() => {
                         setLootItems(prev => prev.map(i => i.id === item.id ? { ...i, isVisible: false } : i));
                    }, 300);

                }, index * 400); 
            });

            // Kết thúc sequence
            const totalDelay = newLootItems.length * 400 + 800; 
            setTimeout(() => {
                setLootItems([]); 
                if (onComplete) onComplete();
            }, totalDelay);

        }, 1000); // Đợi Loot Pop lên (1s)
    }, [addDamageText]);


    // --- EFFECT: HANDLE VICTORY SEQUENCE ---
    useEffect(() => {
        // Trigger chỉ khi thắng và chưa bắt đầu sequence
        if (gameOver === 'win' && sequenceState === 'none') {
            const isLastBoss = currentFloor === BOSS_DATA.length - 1;

            if (!isLastBoss) {
                setSequenceState('victory_sequence');
                
                // 1. Boss chết (1.5s)
                setBossState('dying');

                // 2. Sau khi boss chết xong -> Generate Loot & Show Victory
                setTimeout(() => {
                    // SHOW VICTORY TEXT
                    addDamageText("VICTORY", "#FFFFFF", "custom", 24, 50, 15, 3000, "tracking-widest");

                    // 3. Đợi 2s (cho chữ VICTORY bay lên một chút) rồi bung loot
                    setTimeout(() => {
                        const rewards = currentBossData.rewards;
                        
                        // Gọi hàm rơi vật phẩm
                        animateLootDrop(rewards, () => {
                            // Sau khi loot xong thì chuyển tầng
                            handleNextFloor();
                            setBossState('appearing');
                            setTimeout(() => {
                                setBossState('idle');
                                setSequenceState('none');
                            }, 1200);
                        });

                    }, 2000); 

                }, 1200); // Thời gian animation 'dying' của Boss
            }
        }
    }, [gameOver, currentFloor, handleNextFloor, sequenceState, addDamageText, currentBossData, animateLootDrop]);

    // --- SYNC VISUAL HP ---
    useEffect(() => {
        if (bossStats && (battleState === 'idle' || visualBossHp === 0)) {
             if (sequenceState !== 'victory_sequence') {
                setVisualBossHp(bossStats.hp);
             }
        }
        if (playerStats && (battleState === 'idle' || visualPlayerHp === 0)) {
            setVisualPlayerHp(playerStats.hp);
        }
    }, [bossStats, playerStats, battleState, currentFloor, sequenceState]);

    // --- IMAGE HANDLING ---
    useEffect(() => {
        if (currentBossData) {
            const idStr = String(currentBossData.id).padStart(2, '0');
            setBossImgSrc(`/images/boss/${idStr}.webp`);

            // PRELOAD NEXT BOSS IMAGE
            const nextBoss = BOSS_DATA[currentFloor + 1];
            if (nextBoss) {
                const nextIdStr = String(nextBoss.id).padStart(2, '0');
                const img = new Image();
                img.src = `/images/boss/${nextIdStr}.webp`;
            }
        }
    }, [currentBossData, currentFloor]);

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

    // --- TURN SEQUENCE LOGIC ---
    useEffect(() => {
        if (!lastTurnEvents) return;
        
        const { playerDmg, playerDmgHit1, playerDmgHit2, playerDmgHit3, playerHeal, bossDmg, bossReflectDmg } = lastTurnEvents;

        // Player Turn
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

            setTimeout(() => {
                addDamageText(`-${formatDamageText(dmg1)}`, '#ef4444', 'boss', 30); 
                setVisualBossHp(prev => Math.max(0, prev - dmg1));
                setBossState('hit'); 
            }, hit1Time);
            setTimeout(() => setBossState('idle'), hit1Time + 400);

            setTimeout(() => {
                addDamageText(`-${formatDamageText(dmg2)}`, '#ef4444', 'boss', 32); 
                setVisualBossHp(prev => Math.max(0, prev - dmg2));
                setBossState('hit');
            }, hit2Time);
            setTimeout(() => setBossState('idle'), hit2Time + 400);

             setTimeout(() => {
                addDamageText(`-${formatDamageText(dmg3)}`, '#ef4444', 'boss', 40); 
                setVisualBossHp(prev => Math.max(0, prev - dmg3));
                setBossState('hit');
            }, hit3Time);
            
            setTimeout(() => {
                setOrbEffects(prev => prev.filter(e => e.id !== orb1.id && e.id !== orb2.id && e.id !== orb3.id));
                setBossState(prev => prev === 'hit' ? 'idle' : prev); 
            }, hit3Time + 500);
        }
        
        if (playerHeal > 0) {
             addDamageText(`+${formatDamageText(playerHeal)}`, '#4ade80', 'player', 20); 
             setVisualPlayerHp(prev => prev + playerHeal);
        }
        
        // Boss Turn
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

    // --- HANDLE SWEEP CLICK ---
    const handleSweepClick = async () => {
        if (!playerStats) return;
        setIsSweeping(true);
        const { result, rewards } = await handleSweep();
        
        if (result === 'win') {
             // 1. Hiển thị text Sweep thành công
            addDamageText("SWEEP SUCCESS", "#FFFFFF", "custom", 18, 50, 15, 2500, "tracking-widest");
            
            // 2. Chạy animation rơi vật phẩm trực tiếp
            animateLootDrop(rewards, () => {
                setIsSweeping(false);
            });
        } else {
             // Thất bại
             addDamageText("SWEEP FAILED", "#ef4444", "custom", 30, 50, 20, 2000);
             setIsSweeping(false);
        }
    };

    const bossElement = useMemo(() => {
        const keys = Object.keys(ELEMENTS) as ElementKey[];
        const index = (currentFloor * 7 + 3) % keys.length;
        return keys[index];
    }, [currentFloor]);

    if (error) return <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-50 text-white font-lilita"><p>Error: {error}</p><button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 rounded">Close</button></div>;
    
    return (
        <>
            <MainBattleStyles />
            <SkillStyles />
      
            {statsModalTarget && playerStats && bossStats && <CharacterStatsModal character={statsModalTarget === 'player' ? playerStats : bossStats} characterType={statsModalTarget} onClose={() => setStatsModalTarget(null)}/>}
            {showRewardsModal && currentBossData && <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards}/>}

            <div className="relative w-full min-h-screen flex flex-col items-center font-lilita text-white overflow-hidden">
                
                {/* --- BACKGROUND LAYER --- */}
                <div className="absolute inset-0 z-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-no-repeat bg-slate-900"
                        style={{ 
                            backgroundImage: `url(${bossBattleAssets.towerBackground})`,
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
    
                                {/* --- CENTER FLOOR INDICATOR --- */}
                                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                                    <h3 className="text-xl font-bold tracking-widest uppercase text-white opacity-40 select-none shadow-black drop-shadow-sm">
                                        {currentBossData.floor}
                                    </h3>
                                </div>

                                {/* --- LEFT SIDE UTILITIES (SWEEP BUTTON) --- */}
                                <div className="absolute top-16 left-4 z-20 flex flex-col gap-3 items-start">
                                    <button 
                                        onClick={handleSweepClick} 
                                        disabled={currentFloor <= 0 || (playerStats.energy || 0) < 10 || isSweeping || battleState !== 'idle'} 
                                        className="transition-all active:scale-95 hover:scale-105 disabled:hover:scale-100 disabled:opacity-60 disabled:grayscale disabled:cursor-not-allowed relative group rounded-full"
                                        title="Sweep"
                                    >
                                        <img src={bossBattleAssets.sweepBattleIcon} alt="Sweep" className="w-16 h-auto object-contain drop-shadow-md" />
                                    </button>
                                </div>

                                {/* --- RIGHT UTILITY BUTTONS --- */}
                                <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2">
                                     <div className="flex gap-2">
                                        <button onClick={() => setShowRewardsModal(true)} disabled={battleState !== 'idle'} className="w-12 h-12 transition-all active:scale-95 hover:scale-105 disabled:opacity-50" title="Rewards">
                                            <img src={bossBattleAssets.bossRewardsIcon} alt="Rewards" className="w-full h-full object-contain drop-shadow-md" />
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
                                        <BattleEffectsLayer 
                                            orbEffects={orbEffects} 
                                            damages={damages} 
                                            lootItems={lootItems}
                                        />

                                    </div>

                                    {/* --- ACTION BAR --- */}
                                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mt-24 z-50">
                                        {/* Chỉ hiện nút Fight khi Battle Idle VÀ không đang trong chuỗi animation thắng */}
                                        {battleState === 'idle' && sequenceState === 'none' ? (
                                            <div className="flex gap-4 items-center">
                                                <button onClick={startGame} disabled={(playerStats.energy || 0) < 10} className="transition-all active:scale-95 hover:scale-105 rounded-full relative group">
                                                    <img src={bossBattleAssets.fightButtonIcon} alt="Fight" className="w-36 h-auto object-contain" />
                                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full border border-slate-600/50">
                                                        <span>10</span>
                                                        <img src={bossBattleAssets.energyIcon} alt="" className="w-3 h-3"/>
                                                    </div>
                                                </button>
                                            </div>
                                        ) : (
                                            // Ẩn nút Skip khi đã thắng/thua
                                            !gameOver && battleState === 'fighting' && (
                                                <button onClick={skipBattle} className="transition-all active:scale-95 hover:scale-105 rounded-full" title="Skip Battle">
                                                    <img src={bossBattleAssets.skipBattleIcon} alt="Skip" className="w-36 h-auto object-contain" />
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
