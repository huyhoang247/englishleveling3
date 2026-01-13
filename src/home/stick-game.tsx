import React, { useRef, useEffect, useState } from 'react';
// 1. Import useGame để lấy chỉ số nhân vật và skills
import { useGame } from '../GameContext.tsx';
// 2. Import component hiển thị coin
import CoinDisplay from '../ui/display/coin-display.tsx';

// --- HELPER FUNCTIONS ---

const getActivationChanceLocal = (rarity) => {
    switch (rarity) {
        case 'E': return 5;
        case 'D': return 10;
        case 'B': return 15;
        case 'A': return 20;
        case 'S': return 25;
        case 'SR': return 30;
        default: return 5;
    }
};

const COIN_IMG_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp";
const ATTACK_SKILL_IMG_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/attack-skill.webp";
const RISE_SKILL_IMG_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shadow-extraction.webp";
const SHADOW_ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shadow.webp";

// --- SPRITE CONFIGURATION ---
// Cấu hình thông số cho Sprite Sheet 36 Frames (Lưới 6x6)
const SPRITE_CONFIG = {
    IDLE: {
        url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/stickman/stickman-attack.webp", // Dùng link bạn cung cấp cho Normal
        frameW: 232,
        frameH: 259,
        totalFrames: 36,
        cols: 6, // Giả định lưới 6x6 cho 36 frame
        displayHeight: 130 // Chiều cao hiển thị mong muốn trên màn hình
    },
    RUN: {
        url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/stickman/stickman-run.webp",
        frameW: 287,
        frameH: 262,
        totalFrames: 36,
        cols: 6,
        displayHeight: 130
    },
    ATTACK: {
        url: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/stickman/stickman-attack.webp",
        frameW: 297,
        frameH: 279,
        totalFrames: 36,
        cols: 6,
        displayHeight: 130
    }
};

// --- ICON COMPONENTS ---

const HomeIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
);

// --- COMPONENT: VIRTUAL JOYSTICK ---
const VirtualJoystick = ({ onStickMove }) => {
    const wrapperRef = useRef(null);
    const stickRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const radius = 35;

    const handleStart = (clientX, clientY) => {
        setIsDragging(true);
        updateStick(clientX, clientY);
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;
        updateStick(clientX, clientY);
    };

    const handleEnd = () => {
        setIsDragging(false);
        setPosition({ x: 0, y: 0 });
        if (onStickMove) {
            onStickMove({ x: 0, y: 0, active: false });
        }
    };

    const updateStick = (clientX, clientY) => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * radius;
            dy = Math.sin(angle) * radius;
        }

        setPosition({ x: dx, y: dy });

        if (onStickMove) {
            onStickMove({
                x: dx / radius,
                y: dy / radius,
                active: true
            });
        }
    };

    const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();
    const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e) => { if (isDragging) handleMove(e.clientX, e.clientY); };
    const onMouseUp = () => handleEnd();

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={wrapperRef}
            className="relative w-24 h-24 rounded-full backdrop-blur-sm bg-slate-900/40 border-2 border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)] touch-none select-none z-50 flex items-center justify-center opacity-50 active:opacity-80 transition-opacity duration-200"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
        >
            <div className="absolute w-full h-full rounded-full border border-white/10 opacity-50 pointer-events-none"></div>
            <div className="absolute w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none"></div>
            <div
                ref={stickRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.6)] border border-blue-200/50 pointer-events-none`}
            >
                <div className="absolute top-1 left-2 w-3 h-1.5 bg-white/40 rounded-full blur-[1px]"></div>
            </div>
        </div>
    );
};

// --- COMPONENT HEADER UI ---
const GameHeader = ({ onHome, shadowCount, maxShadows, coins }) => {
    return (
        <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/90 border-b border-white/10 z-[60]">
            <button
                onClick={onHome}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Lưu & Thoát"
            >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">Trang Chính</span>
            </button>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-purple-500/30">
                    <img src={SHADOW_ICON_URL} alt="Shadows" className="w-5 h-5 object-contain" />
                    <span className="text-purple-100 font-bold text-sm">{shadowCount || 0}/{maxShadows || 3}</span>
                </div>
                <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
            </div>
        </header>
    );
};

// --- MAIN GAME COMPONENT ---
const StickmanShadowFinal = ({ onClose }) => {
    const canvasRef = useRef(null);
    const { totalPlayerStats, getEquippedSkillsDetails, coins: initialServerCoins, updateCoins } = useGame();

    const [visualCoins, setVisualCoins] = useState(initialServerCoins);
    const sessionEarningsRef = useRef(0);
    const [gameState, setGameState] = useState('INIT');
    const [winner, setWinner] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [shadowCount, setShadowCount] = useState(0);
    const [isAttackPressed, setIsAttackPressed] = useState(false);
    const [isRisePressed, setIsRisePressed] = useState(false);
    const [isAuto, setIsAuto] = useState(false);
    const isAutoRef = useRef(false);
    const [canRise, setCanRise] = useState(false);
    const canRiseRef = useRef(false);

    const CFG = {
        gravity: 0.8,
        speed: 7,
        jump: -16,
        friction: 0.85,
        attackDist: 70,
        hitStun: 20,
        camShake: 0,
        respawnTime: 120,
        maxShadows: 3,
        headerHeight: 53,
        riseRange: 150,
    };

    const frameRef = useRef(0);
    const shakeRef = useRef(0);
    const hitStopRef = useRef(0);
    const camera = useRef({ x: 0 });
    const dprRef = useRef(1);
    const floorTransitioning = useRef(false);

    const playerSkillsRef = useRef({
        lifeSteal: { val: 0, chance: 0 },
        thorns: { val: 0, chance: 0 },
        damageBoost: { val: 0, chance: 0 },
        armorPenetration: { val: 0, chance: 0 }
    });

    const floorRef = useRef(1);
    const floorWavesRef = useRef({ current: 0, total: 0 });
    const waveQueue = useRef(0);
    const waveSpawnTimer = useRef(0);

    // Assets Refs
    const soulImageRef = useRef(null);
    const expImageRef = useRef(null);
    const levelUpImageRef = useRef(null);
    const coinImageRef = useRef(null);
    
    // PLAYER SPRITE REFS
    const playerSpritesRef = useRef({
        idle: null,
        run: null,
        attack: null
    });

    const input = useRef({ left: false, right: false, jump: false, attack: false, skill: false });

    const p1 = useRef({
        x: 0, y: 0, vx: 0, vy: 0,
        maxHp: 100, hp: 100,
        level: 1, currentExp: 0, maxExp: 100,
        damage: 12, defense: 0, coins: 0,
        state: 'IDLE', dir: 1,
        animTimer: 0, attackCooldown: 0,
        color: '#00f2ff', weaponColor: '#ffffff',
        name: 'MONARCH', isDead: false, type: 'PLAYER'
    });

    const enemies = useRef([]);
    const shadows = useRef([]);
    const souls = useRef([]);
    const particles = useRef([]);
    const bgObjects = useRef([]);
    const floatingTexts = useRef([]);
    const lootCoins = useRef([]);

    // --- INIT & SETUP ---
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        dprRef.current = dpr;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
        return { w, h };
    };

    useEffect(() => {
        // Load Misc Images
        const sImg = new Image(); sImg.src = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/soul.webp"; soulImageRef.current = sImg;
        const eImg = new Image(); eImg.src = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/exp.webp"; expImageRef.current = eImg;
        const luImg = new Image(); luImg.src = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/level-up.webp"; levelUpImageRef.current = luImg;
        const cImg = new Image(); cImg.src = COIN_IMG_URL; coinImageRef.current = cImg;

        // Load Player Sprites
        const idleS = new Image(); idleS.src = SPRITE_CONFIG.IDLE.url; playerSpritesRef.current.idle = idleS;
        const runS = new Image(); runS.src = SPRITE_CONFIG.RUN.url; playerSpritesRef.current.run = runS;
        const atkS = new Image(); atkS.src = SPRITE_CONFIG.ATTACK.url; playerSpritesRef.current.attack = atkS;
    }, []);

    const rand = (min, max) => Math.random() * (max - min) + min;

    const calculatePlayerSkills = () => {
        const equipped = getEquippedSkillsDetails();
        const stats = {
            lifeSteal: { val: 0, chance: 0 },
            thorns: { val: 0, chance: 0 },
            damageBoost: { val: 0, chance: 0 },
            armorPenetration: { val: 0, chance: 0 }
        };
        equipped.forEach(skill => {
            const val = (skill.baseEffectValue || 5) + ((skill.level - 1) * (skill.effectValuePerLevel || 1));
            const chance = getActivationChanceLocal(skill.rarity);
            if (skill.id === 'life_steal') { stats.lifeSteal.val += val; stats.lifeSteal.chance = chance; }
            if (skill.id === 'thorns') { stats.thorns.val += val; stats.thorns.chance = chance; }
            if (skill.id === 'damage_boost') { stats.damageBoost.val += val; stats.damageBoost.chance = chance; }
            if (skill.id === 'armor_penetration') { stats.armorPenetration.val += val; stats.armorPenetration.chance = chance; }
        });
        playerSkillsRef.current = stats;
    };

    const initFloor = (floorNumber) => {
        floorRef.current = floorNumber;
        const totalWaves = Math.floor(rand(3, 16));
        floorWavesRef.current = { current: 1, total: totalWaves };
    };

    const initGame = () => {
        const { w, h } = handleResize();
        const floorY = h * 0.66;
        const startHp = totalPlayerStats.hp > 0 ? totalPlayerStats.hp : 100;
        const startAtk = totalPlayerStats.atk > 0 ? totalPlayerStats.atk : 12;
        const startDef = totalPlayerStats.def || 0;

        calculatePlayerSkills();

        p1.current = {
            ...p1.current,
            x: 0, y: floorY, vx: 0, vy: 0,
            hp: startHp, maxHp: startHp,
            damage: startAtk, defense: startDef,
            level: 1, currentExp: 0, maxExp: 100,
            coins: 0, state: 'IDLE', dir: 1, isDead: false
        };

        enemies.current = [];
        shadows.current = [];
        setShadowCount(0);
        souls.current = [];
        particles.current = [];
        floatingTexts.current = [];
        lootCoins.current = [];

        initFloor(1);
        spawnWave();

        camera.current.x = -w / 2;
        setCanRise(false);
        canRiseRef.current = false;
        setShowStats(false);
        setIsAuto(false);
        isAutoRef.current = false;
        floorTransitioning.current = false;

        bgObjects.current = [];
        for (let i = -15; i < 15; i++) {
            bgObjects.current.push({
                x: i * 800 + Math.random() * 200,
                height: 100 + Math.random() * 200,
                width: 40 + Math.random() * 40
            });
        }
        setGameState('PLAYING');
    };

    useEffect(() => {
        setTimeout(() => {
            initGame();
        }, 100);
    }, []);

    const handleSafeExit = () => {
        if (sessionEarningsRef.current > 0) {
            updateCoins(sessionEarningsRef.current);
        }
        onClose();
    };

    const nextFloor = () => {
        floorTransitioning.current = false;
        const nextF = floorRef.current + 1;
        initFloor(nextF);
        const healAmount = Math.floor(p1.current.maxHp * (Math.floor(rand(10, 101)) / 100));
        p1.current.hp = Math.min(p1.current.maxHp, p1.current.hp + healAmount);
        addFloatingText(p1.current.x, p1.current.y - 100, `+${healAmount}`, '#4ade80', 20, 'TEXT');
        enemies.current = [];
        souls.current = [];
        spawnWave();
    };

    const createEnemy = (x, y, level) => {
        const hp = 100 + (level * 30);
        const def = Math.floor(level * 2);
        const newEnemy = {
            x: x, y: y, vx: 0, vy: 0,
            maxHp: hp, hp: hp, level: level,
            damage: 5 + (level * 4), defense: def,
            state: 'IDLE', dir: -1,
            animTimer: Math.random() * 100, attackCooldown: 0, aiTimer: Math.random() * 100,
            color: '#ff2a00', weaponColor: '#ff9900', name: 'QUÁI VẬT', isDead: false, type: 'ENEMY'
        };
        enemies.current.push(newEnemy);
        createExplosion(x, y - 50, '#ff2a00');
    };

    const spawnWave = () => {
        const count = Math.floor(rand(2, 7));
        waveQueue.current = count;
        waveSpawnTimer.current = 0;
    };

    const getEnemyLevelForCurrentFloor = () => {
        const floor = floorRef.current;
        const tier = Math.floor((floor - 1) / 5);
        return Math.floor(rand(tier * 15 + 1, (tier + 1) * 15 + 1));
    };

    const spawnSoul = (x, y, level, damage) => {
        souls.current.push({ x, y, level, damage, life: 600, anim: 0 });
    };

    const extractShadow = () => {
        const p = p1.current;
        let closestIndex = -1;
        let minDst = CFG.riseRange;

        souls.current.forEach((s, i) => {
            const dst = Math.abs(p.x - s.x);
            if (dst <= minDst) { minDst = dst; closestIndex = i; }
        });

        if (closestIndex === -1 && isAutoRef.current && souls.current.length > 0) closestIndex = 0;

        if (closestIndex !== -1) {
            if (shadows.current.length >= CFG.maxShadows) return;
            const s = souls.current[closestIndex];
            const shadowHp = 80 + (s.level * 20);
            shadows.current.push({
                x: s.x, y: s.y, vx: 0, vy: 0,
                maxHp: shadowHp, hp: shadowHp, level: s.level,
                damage: s.damage, defense: Math.floor(s.level * 1.5),
                currentExp: 0, maxExp: 50 + (s.level * 10),
                state: 'IDLE', dir: p.dir, animTimer: 0, attackCooldown: 0,
                color: '#000000', weaponColor: '#3b82f6', name: 'SHADOW', isDead: false, type: 'ALLY'
            });
            setShadowCount(shadows.current.length);
            createExplosion(s.x, s.y - 50, '#9333ea');
            addFloatingText(s.x, s.y - 120, "ARISE!", '#9333ea', 32);
            souls.current.splice(closestIndex, 1);
        }
    };

    const updateShadows = (floorY) => {
        let shadowDied = false;
        for (let i = shadows.current.length - 1; i >= 0; i--) {
            if (shadows.current[i].isDead) {
                createExplosion(shadows.current[i].x, shadows.current[i].y, '#555');
                shadows.current.splice(i, 1);
                shadowDied = true;
            }
        }
        if (shadowDied) setShadowCount(shadows.current.length);

        shadows.current.forEach(s => {
            let target = null;
            let minDst = 10000;
            enemies.current.forEach(e => {
                if (!e.isDead) {
                    const d = Math.abs(s.x - e.x);
                    if (d < minDst) { minDst = d; target = e; }
                }
            });
            if (!target) target = p1.current;

            const dist = target.x - s.x;
            const stopDist = (target.type === 'PLAYER') ? 100 + (Math.random() * 50) : 60;

            if (Math.abs(dist) > stopDist) {
                s.vx = (dist > 0 ? 1 : -1) * (CFG.speed * 0.85);
                s.dir = dist > 0 ? 1 : -1;
                if (s.state !== 'JUMP' && s.state !== 'ATTACK') s.state = 'RUN';
            } else {
                s.vx *= CFG.friction;
                if (s.state === 'RUN') s.state = 'IDLE';
                if (target.type === 'ENEMY' && s.attackCooldown <= 0) {
                    s.state = 'ATTACK';
                    s.attackCooldown = 30;
                    s.vx = s.dir * 15;
                }
            }
            s.vy += CFG.gravity; s.x += s.vx; s.y += s.vy;
            if (s.y > floorY) { s.y = floorY; s.vy = 0; if (s.state === 'JUMP') s.state = 'IDLE'; }
            s.animTimer++;
            if (s.attackCooldown > 0) {
                s.attackCooldown--;
                if (s.attackCooldown === 0 && s.state === 'ATTACK') s.state = 'IDLE';
            }
        });
    };

    // --- VISUAL EFFECTS ---
    const createBlood = (x, y, color, amount = 10) => {
        if (particles.current.length > 100) return;
        for (let i = 0; i < amount; i++) {
            particles.current.push({
                x, y, vx: rand(-5, 5), vy: rand(-8, -2),
                life: rand(20, 40), color: color, size: rand(2, 5), type: 'blood'
            });
        }
    };

    const createExplosion = (x, y, color) => {
        if (particles.current.length > 100) return;
        for (let i = 0; i < 15; i++) {
            particles.current.push({
                x, y, vx: rand(-8, 8), vy: rand(-8, 8),
                life: rand(30, 50), color: color, size: rand(4, 8), type: 'spark'
            });
        }
    };

    const addFloatingText = (x, y, text, color, size = 20, type = 'TEXT') => {
        const isHeal = typeof text === 'string' && text.startsWith('+');
        const isDamage = typeof text === 'string' && text.startsWith('-');
        
        let finalX = isHeal ? x + (Math.random() * 10 - 5) : (isDamage ? x + (Math.random() * 50 - 25) : x + (Math.random() * 20 - 10));
        let finalY = isHeal ? y - 40 : y;
        let velocityY = isDamage ? -2 - (Math.random() * 1.5) : (isHeal ? -1.2 : -2);

        floatingTexts.current.push({
            x: finalX, y: finalY, text, color, size, life: 60, vy: velocityY, type
        });
    };

    // --- LOOT SYSTEM ---
    const spawnLoot = (x, y, totalGold) => {
        const numCoins = 3 + Math.floor(Math.random() * 2);
        const baseValue = Math.floor(totalGold / numCoins);
        const remainder = totalGold % numCoins;
        for (let i = 0; i < numCoins; i++) {
            let coinValue = baseValue;
            if (i === 0) coinValue += remainder;
            lootCoins.current.push({
                x: x, y: y - 40, vx: rand(-6, 6), vy: rand(-12, -6),
                val: coinValue, state: 'DROP', timer: 80 + rand(0, 30),
            });
        }
    };

    const updateLoot = (floorY, camX, viewWidth) => {
        let coinsInFrame = 0;
        for (let i = lootCoins.current.length - 1; i >= 0; i--) {
            const c = lootCoins.current[i];
            if (c.state === 'DROP') {
                c.vy += CFG.gravity; c.x += c.vx; c.y += c.vy;
                if (c.y > floorY - 12) { c.y = floorY - 12; c.vy *= -0.5; c.vx *= 0.9; }
                c.timer--; if (c.timer <= 0) c.state = 'FLY';
            } else if (c.state === 'FLY') {
                const destX = camX + viewWidth - 120;
                const destY = 28;
                c.x += (destX - c.x) * 0.08;
                c.y += (destY - c.y) * 0.08;
                if (Math.abs(destX - c.x) < 20 && Math.abs(destY - c.y) < 20) {
                    coinsInFrame += c.val;
                    p1.current.coins += c.val;
                    lootCoins.current.splice(i, 1);
                }
            }
        }
        if (coinsInFrame > 0) {
            setVisualCoins(prev => prev + coinsInFrame);
            sessionEarningsRef.current += coinsInFrame;
        }
    };

    const drawCoins = (ctx) => {
        lootCoins.current.forEach(c => {
            ctx.save(); ctx.translate(c.x, c.y);
            if (coinImageRef.current && coinImageRef.current.complete) {
                const size = 20; ctx.drawImage(coinImageRef.current, -size / 2, -size / 2, size, size);
            } else {
                ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });
    };

    // --- LEVELING SYSTEM ---
    const checkLevelUp = (entity, isPlayer) => {
        if (entity.currentExp >= entity.maxExp) {
            entity.level++;
            entity.currentExp -= entity.maxExp;
            entity.maxExp = Math.floor(entity.maxExp * 1.2);
            entity.damage += 5; entity.hp = entity.maxHp;
            const color = isPlayer ? '#00ff00' : '#3b82f6';
            addFloatingText(entity.x, entity.y - 190, "", null, 0, 'LEVEL_UP');
            createExplosion(entity.x, entity.y - 50, color);
        }
    };

    const distributeExp = (killer, deadEnemy) => {
        const totalExp = 50 + (deadEnemy.level * 10);
        if (killer.type === 'PLAYER') {
            p1.current.currentExp += totalExp;
            addFloatingText(p1.current.x, p1.current.y - 110, `${totalExp}`, '#fff', 16, 'EXP');
            checkLevelUp(p1.current, true);
        } else if (killer.type === 'ALLY') {
            killer.currentExp += totalExp;
            addFloatingText(killer.x, killer.y - 110, `${totalExp}`, '#fff', 14, 'EXP');
            checkLevelUp(killer, false);
            const shareExp = Math.floor(totalExp * 0.5);
            p1.current.currentExp += shareExp;
            addFloatingText(p1.current.x, p1.current.y - 110, `${shareExp}`, '#fff', 16, 'EXP');
            checkLevelUp(p1.current, true);
        }
    };

    // --- DRAWING FUNCTIONS ---

    // === NEW: PLAYER SPRITE DRAWING LOGIC ===
    const drawPlayerSprite = (ctx, p) => {
        if (p.isDead) return;

        // 1. Xác định cấu hình Sprite dựa trên State
        let spriteData = SPRITE_CONFIG.IDLE;
        let img = playerSpritesRef.current.idle;

        // Mapping State game sang Sprite Image
        // Game state: IDLE, RUN, JUMP, ATTACK, HURT
        if (p.state === 'RUN' || p.state === 'JUMP') {
            spriteData = SPRITE_CONFIG.RUN;
            img = playerSpritesRef.current.run;
        } else if (p.state === 'ATTACK') {
            spriteData = SPRITE_CONFIG.ATTACK;
            img = playerSpritesRef.current.attack;
        } else {
            // Default to IDLE for 'IDLE', 'HURT', etc.
            spriteData = SPRITE_CONFIG.IDLE;
            img = playerSpritesRef.current.idle;
        }

        if (!img || !img.complete) {
            // Fallback nếu ảnh chưa tải xong: vẽ hình vuông tạm
            ctx.fillStyle = '#00f2ff';
            ctx.fillRect(p.x - 20, p.y - 100, 40, 100);
            return;
        }

        // 2. Tính toán Frame Index
        // AnimTimer tăng mỗi frame (60fps). Chia chậm lại để animation vừa mắt.
        // Tốc độ 0.5 ~ 30fps cho animation.
        const speed = 0.5; 
        const frameIndex = Math.floor(p.animTimer * speed) % spriteData.totalFrames;

        // 3. Tính toán vị trí cắt trên lưới (Grid Calculation)
        const col = frameIndex % spriteData.cols;
        const row = Math.floor(frameIndex / spriteData.cols);

        const sx = col * spriteData.frameW;
        const sy = row * spriteData.frameH;

        // 4. Tính toán tỉ lệ vẽ (Scaling) để giữ chiều cao hiển thị đồng nhất
        // Mục tiêu: Nhân vật luôn cao khoảng `spriteData.displayHeight` pixels trên màn hình
        const scaleRatio = spriteData.displayHeight / spriteData.frameH;
        
        const destW = spriteData.frameW * scaleRatio;
        const destH = spriteData.frameH * scaleRatio;

        // 5. Vẽ Sprite
        ctx.save();
        ctx.translate(p.x, p.y); // Di chuyển gốc tọa độ đến vị trí chân nhân vật
        ctx.scale(p.dir, 1);     // Lật hình theo hướng di chuyển (1 hoặc -1)

        // Vẽ ảnh: căn giữa theo trục X, căn đáy theo trục Y (để chân chạm đất)
        // dx = -destW / 2 (lùi lại một nửa chiều rộng)
        // dy = -destH (lùi lại toàn bộ chiều cao để vẽ từ dưới lên)
        ctx.drawImage(
            img, 
            sx, sy, spriteData.frameW, spriteData.frameH, 
            -destW / 2, -destH, destW, destH
        );

        ctx.restore();

        // Vẽ thanh máu/UI
        drawUnitUI(ctx, p, 'PLAYER');
    };

    // Cũ: Vẽ Stickman (Dùng cho Enemy và Shadow vì chưa có Sprite riêng)
    const drawStickman = (ctx, p) => {
        if (p.isDead) return;
        const { x, y, dir, state, animTimer } = p;
        const cycle = animTimer * 0.2;
        let lLeg = 0, rLeg = 0, lArm = 0, rArm = 0, bY = 0;

        if (state === 'RUN') {
            lLeg = Math.sin(cycle) * 0.8; rLeg = Math.sin(cycle + Math.PI) * 0.8;
            lArm = Math.cos(cycle) * 0.8; rArm = Math.cos(cycle + Math.PI) * 0.8;
            bY = Math.abs(Math.sin(cycle)) * 3;
        } else if (state === 'JUMP') {
            lLeg = -0.5; rLeg = 0.5; lArm = -2; rArm = -2;
        } else if (state === 'ATTACK') {
            const pr = Math.min(1, (15 - p.attackCooldown) / 5);
            rArm = -1.5 + (pr * 3); lArm = 0.5; lLeg = 0.5; rLeg = -0.5;
        } else {
            bY = Math.sin(animTimer * 0.1) * 1.5;
            lArm = Math.sin(animTimer * 0.1) * 0.1; rArm = -Math.sin(animTimer * 0.1) * 0.1;
        }

        ctx.save();
        ctx.translate(x | 0, (y - 25 - bY) | 0); ctx.scale(dir, 1);

        let outline = 'transparent';
        if (p.type === 'ENEMY') outline = '#ff2a00';
        if (p.type === 'ALLY') outline = '#a855f7';

        const drawBody = (col, wid, out) => {
            ctx.strokeStyle = col; ctx.lineWidth = wid; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            const hip = { x: 0, y: 0 }; const head = { x: 0, y: -25 }; const shoulder = { x: 0, y: -18 };
            ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(head.x, head.y); ctx.stroke();

            if (out) {
                ctx.fillStyle = col; ctx.beginPath(); ctx.arc(head.x, head.y, 7.5, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(head.x, head.y, 6, 0, Math.PI * 2); ctx.fill();
            }

            const limb = (sx, sy, ang) => {
                const mx = sx + Math.sin(ang) * 12, my = sy + Math.cos(ang) * 12;
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.stroke();
                const fx = mx + Math.sin(ang * 0.8) * 12, fy = my + Math.cos(ang * 0.8) * 12;
                ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(fx, fy); ctx.stroke();
                return { x: fx, y: fy };
            };

            ctx.strokeStyle = out ? col : '#222'; limb(hip.x, hip.y, lLeg);
            ctx.strokeStyle = out ? col : '#000'; limb(hip.x, hip.y, rLeg);

            ctx.strokeStyle = out ? col : '#222'; limb(shoulder.x, shoulder.y, lArm);
            ctx.strokeStyle = out ? col : '#000'; return limb(shoulder.x, shoulder.y, rArm);
        };

        if (outline !== 'transparent') {
            ctx.save(); ctx.globalAlpha = 0.5; drawBody(outline, 6, true); ctx.restore();
        }
        const hand = drawBody('#000', 3, false);
        if (hand) {
            ctx.strokeStyle = p.type === 'ALLY' ? '#a855f7' : p.weaponColor;
            ctx.lineWidth = 2.5; ctx.beginPath();
            const swAng = rArm + 1.5;
            ctx.moveTo(hand.x, hand.y); ctx.lineTo(hand.x + Math.sin(swAng) * 35, hand.y + Math.cos(swAng) * 35); ctx.stroke();
            if (state === 'ATTACK' && p.attackCooldown > 5) {
                ctx.fillStyle = p.type === 'ALLY' ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.4)';
                ctx.beginPath(); ctx.arc(0, -15, 50, swAng - 0.5, swAng + 0.5); ctx.fill();
            }
        }
        if (p.type === 'ALLY') {
            ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(0, -26, 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        drawUnitUI(ctx, p, p.type);
    };

    const drawHUD = (ctx) => {
        const centerX = (canvasRef.current.width / dprRef.current) / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath(); ctx.roundRect(centerX - 80, 60, 160, 50, 8); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18px "Lilita One", cursive'; ctx.textAlign = 'center';
        ctx.fillText(`FLOOR ${floorRef.current}`, centerX, 82);
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
        ctx.fillText(`WAVE: ${floorWavesRef.current.current} / ${floorWavesRef.current.total}`, centerX, 102);
    };

    const drawUnitUI = (ctx, p, type) => {
        if (p.isDead) return;
        const barW = 60; const barH = 6;
        const barX = (p.x - barW / 2) | 0;
        const barY = (p.y - 125) | 0; // Đẩy lên cao hơn chút vì Sprite cao hơn Stickman cũ

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(barX, barY, barW, barH);
        const hpPercent = Math.max(0, p.hp / p.maxHp);
        if (type === 'ENEMY') ctx.fillStyle = '#ef4444';
        else if (type === 'ALLY') ctx.fillStyle = '#a855f7';
        else ctx.fillStyle = '#22c55e';
        ctx.fillRect(barX, barY, barW * hpPercent, barH);

        if (type !== 'ENEMY') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(barX, barY + barH + 2, barW, 3);
            const expPercent = Math.min(1, p.currentExp / p.maxExp);
            ctx.fillStyle = type === 'ALLY' ? '#d8b4fe' : '#eab308';
            ctx.fillRect(barX, barY + barH + 2, barW * expPercent, 3);
        }

        ctx.beginPath(); ctx.arc(barX - 14, barY + 3, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#1f2937'; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = type === 'ALLY' ? '#a855f7' : '#eab308'; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.level, barX - 14, barY + 4);
    };

    const checkHit = (attacker, defender) => {
        if (defender.isDead || attacker.isDead) return false;

        if (attacker.state === 'ATTACK' && attacker.attackCooldown > 15 && attacker.attackCooldown < 23) {
            const hitDist = Math.abs(attacker.x - defender.x);
            const requiredDist = attacker.type === 'ALLY' ? CFG.attackDist + 20 : CFG.attackDist;
            const facing = (attacker.dir === 1 && defender.x > attacker.x) || (attacker.dir === -1 && defender.x < attacker.x);
            const overlapping = hitDist < 30;

            if ((facing || overlapping) && hitDist < requiredDist && Math.abs(attacker.y - defender.y) < 50) {
                defender.vx = attacker.dir * 10; defender.vy = -4;
                let rawDmg = attacker.damage;
                let defDef = defender.defense || 0;
                const pSkills = playerSkillsRef.current;

                if (attacker.type === 'PLAYER') {
                    if (pSkills.damageBoost.val > 0 && Math.random() * 100 < pSkills.damageBoost.chance) {
                        rawDmg *= (1 + pSkills.damageBoost.val / 100);
                        addFloatingText(defender.x, defender.y - 60, "CRIT!", '#ffcc00', 14, 'TEXT');
                    }
                    if (pSkills.armorPenetration.val > 0 && Math.random() * 100 < pSkills.armorPenetration.chance) {
                        defDef *= (1 - Math.min(1, pSkills.armorPenetration.val / 100));
                        addFloatingText(defender.x, defender.y - 60, "PIERCE!", '#3b82f6', 14, 'TEXT');
                    }
                }

                let finalDmg = Math.max(1, rawDmg - defDef);
                defender.hp -= finalDmg;
                addFloatingText(defender.x, defender.y - 80, `-${Math.round(finalDmg)}`, '#ff0000');

                if (attacker.type === 'PLAYER' && pSkills.lifeSteal.val > 0 && Math.random() * 100 < pSkills.lifeSteal.chance) {
                    const heal = finalDmg * (pSkills.lifeSteal.val / 100);
                    if (heal >= 1) {
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
                        addFloatingText(attacker.x, attacker.y - 80, `+${Math.round(heal)}`, '#4ade80', 20, 'TEXT');
                    }
                }

                defender.state = 'HURT';
                shakeRef.current = 4;
                if (attacker.type === 'PLAYER') { hitStopRef.current = 4; shakeRef.current = 8; }
                createBlood(defender.x, defender.y - 25, defender.color);
                attacker.attackCooldown = 15;

                if (defender.hp <= 0) {
                    defender.hp = 0; defender.isDead = true;
                    createExplosion(defender.x, defender.y, defender.color);
                    distributeExp(attacker, defender);
                    if (attacker.type === 'PLAYER' || attacker.type === 'ALLY') spawnLoot(defender.x, defender.y, 20 + (defender.level * 10));
                    if (defender.type === 'ENEMY') spawnSoul(defender.x, defender.y, defender.level, defender.damage);
                    if (defender.type === 'PLAYER') { setWinner('BẠN ĐÃ TỬ TRẬN!'); setGameState('GAMEOVER'); }
                }
                return true;
            }
        }
        return false;
    };

    // --- GAME LOOP ---
    const update = () => {
        if (gameState !== 'PLAYING' || showStats) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const floorY = canvas.height / dprRef.current * 0.66;
        const viewWidth = canvas.width / dprRef.current;

        const targetCamX = p1.current.x - viewWidth / 2;
        camera.current.x += (targetCamX - camera.current.x) * 0.1;

        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life--;
            if (p.life <= 0 || p.y > floorY) particles.current.splice(i, 1);
        }
        
        updateLoot(floorY, camera.current.x, viewWidth);
        
        for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
            const t = floatingTexts.current[i];
            t.y += t.vy; t.life--; if (t.life <= 0) floatingTexts.current.splice(i, 1);
        }

        if (floorTransitioning.current) return;
        if (hitStopRef.current > 0) { hitStopRef.current--; return; }
        if (shakeRef.current > 0) shakeRef.current *= 0.9;
        if (shakeRef.current < 0.5) shakeRef.current = 0;

        const usr = p1.current;
        if (isAutoRef.current) {
            if (canRiseRef.current || (souls.current.length > 0 && shadows.current.length < CFG.maxShadows)) extractShadow();
            let target = null; let minDst = 10000;
            enemies.current.forEach(e => { if (!e.isDead) { const d = Math.abs(e.x - usr.x); if (d < minDst) { minDst = d; target = e; } } });

            if (target) {
                const dist = target.x - usr.x;
                const attackRange = CFG.attackDist - 10;
                if (usr.state !== 'ATTACK') usr.dir = dist > 0 ? 1 : -1;
                if (Math.abs(dist) > attackRange) {
                    usr.vx = usr.dir * CFG.speed;
                    if (usr.state !== 'JUMP' && usr.state !== 'ATTACK' && usr.state !== 'HURT') usr.state = 'RUN';
                } else {
                    usr.vx = 0;
                    if (usr.attackCooldown <= 0) { usr.state = 'ATTACK'; usr.attackCooldown = 25; usr.vx = usr.dir * 10; }
                    else { if (usr.state === 'RUN') usr.state = 'IDLE'; }
                }
            } else { usr.vx *= CFG.friction; if (usr.state === 'RUN') usr.state = 'IDLE'; }
        } else {
            if (input.current.left) { usr.vx = -CFG.speed; usr.dir = -1; if (usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
            else if (input.current.right) { usr.vx = CFG.speed; usr.dir = 1; if (usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
            else { usr.vx *= CFG.friction; if (usr.state === 'RUN') usr.state = 'IDLE'; }
            if (input.current.jump && usr.y >= floorY - 1) { usr.vy = CFG.jump; usr.state = 'JUMP'; }
            if (input.current.attack && usr.attackCooldown <= 0) { usr.state = 'ATTACK'; usr.attackCooldown = 25; usr.vx = usr.dir * 10; input.current.attack = false; }
            if (input.current.skill) { extractShadow(); input.current.skill = false; }
        }

        usr.vy += CFG.gravity; usr.x += usr.vx; usr.y += usr.vy;
        if (usr.y > floorY) { usr.y = floorY; usr.vy = 0; if (usr.state === 'JUMP') usr.state = 'IDLE'; }
        usr.animTimer++;
        if (usr.attackCooldown > 0) { usr.attackCooldown--; if (usr.attackCooldown === 0 && usr.state === 'ATTACK') usr.state = 'IDLE'; }

        if (waveQueue.current > 0) {
            waveSpawnTimer.current--;
            if (waveSpawnTimer.current <= 0) {
                const side = Math.random() > 0.5 ? 1 : -1;
                const dist = 300 + Math.random() * 500;
                const spawnX = p1.current.x + (side * dist);
                const lvl = getEnemyLevelForCurrentFloor();
                createEnemy(spawnX, floorY, lvl);
                waveQueue.current--;
                waveSpawnTimer.current = 120 + Math.floor(Math.random() * 120);
            }
        }

        for (let i = enemies.current.length - 1; i >= 0; i--) if (enemies.current[i].isDead) enemies.current.splice(i, 1);

        if (enemies.current.length === 0 && waveQueue.current === 0) {
            if (floorWavesRef.current.current < floorWavesRef.current.total) { floorWavesRef.current.current++; spawnWave(); }
            else {
                if (!floorTransitioning.current) {
                    floorTransitioning.current = true;
                    addFloatingText(p1.current.x, p1.current.y - 190, "FLOOR CLEARED", '#4ade80', 20, 'TEXT');
                    setTimeout(() => { nextFloor(); }, 3000);
                }
            }
        }

        enemies.current.forEach(ai => {
            let target = usr; let minDist = Math.abs(usr.x - ai.x);
            shadows.current.forEach(s => { if (!s.isDead) { const d = Math.abs(s.x - ai.x); if (d < minDist) { minDist = d; target = s; } } });
            const dist = target.x - ai.x; ai.aiTimer++;
            if (Math.abs(dist) > 50) {
                ai.vx = (dist > 0 ? 1 : -1) * (CFG.speed * 0.45);
                ai.dir = dist > 0 ? 1 : -1;
                if (ai.state !== 'JUMP' && ai.state !== 'ATTACK') ai.state = 'RUN';
            } else {
                ai.vx *= CFG.friction; if (ai.state === 'RUN') ai.state = 'IDLE';
                if (ai.state !== 'ATTACK') ai.dir = dist > 0 ? 1 : -1;
                if (ai.attackCooldown <= 0 && Math.random() < 0.03) { ai.state = 'ATTACK'; ai.attackCooldown = 30; ai.vx = ai.dir * 8; }
            }
            ai.vy += CFG.gravity; ai.x += ai.vx; ai.y += ai.vy;
            if (ai.y > floorY) { ai.y = floorY; ai.vy = 0; if (ai.state === 'JUMP') ai.state = 'IDLE'; }
            ai.animTimer++;
            if (ai.attackCooldown > 0) { ai.attackCooldown--; if (ai.attackCooldown === 0 && ai.state === 'ATTACK') ai.state = 'IDLE'; }
        });

        updateShadows(floorY);
        let hasSoulInRange = false;
        for (let i = souls.current.length - 1; i >= 0; i--) {
            const s = souls.current[i]; s.life--; s.anim++;
            if (s.life <= 0) souls.current.splice(i, 1);
            else { if (Math.abs(usr.x - s.x) <= CFG.riseRange) hasSoulInRange = true; }
        }

        const isFull = shadows.current.length >= CFG.maxShadows;
        const showRise = hasSoulInRange && !isFull;
        if (showRise !== canRiseRef.current) { canRiseRef.current = showRise; setCanRise(showRise); }

        if (!p1.current.isDead) enemies.current.forEach(e => checkHit(e, p1.current));
        enemies.current.forEach(e => { if (!e.isDead) { checkHit(p1.current, e); shadows.current.forEach(s => checkHit(s, e)); } });
        shadows.current.forEach(s => { enemies.current.forEach(e => checkHit(e, s)); });
        if (p1.current.hp <= 0 && !p1.current.isDead) { p1.current.isDead = true; setWinner('BẠN ĐÃ TỬ TRẬN!'); setGameState('GAMEOVER'); }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const shakeX = (Math.random() - 0.5) * shakeRef.current;
        const shakeY = (Math.random() - 0.5) * shakeRef.current;
        const floorY = canvas.height / dprRef.current * 0.66;

        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, canvas.width / dprRef.current, canvas.height / dprRef.current);
        ctx.save();
        ctx.translate((-camera.current.x + shakeX) | 0, shakeY | 0);

        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(camera.current.x + (canvas.width / dprRef.current) / 2, (canvas.height / dprRef.current) / 3, 150, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333';
        bgObjects.current.forEach(obj => {
            if (obj.x > camera.current.x - 200 && obj.x < camera.current.x + (canvas.width / dprRef.current) + 200) {
                ctx.fillRect(obj.x | 0, (floorY - obj.height) | 0, obj.width, obj.height);
            }
        });

        const grad = ctx.createLinearGradient(0, floorY, 0, canvas.height / dprRef.current);
        grad.addColorStop(0, '#000'); grad.addColorStop(1, '#333');
        ctx.fillStyle = grad; ctx.fillRect(camera.current.x - 100, floorY, (canvas.width / dprRef.current) + 200, (canvas.height / dprRef.current) - floorY);
        ctx.strokeStyle = '#444'; ctx.beginPath(); ctx.moveTo(camera.current.x - 100, floorY); ctx.lineTo(camera.current.x + (canvas.width / dprRef.current) + 100, floorY); ctx.stroke();

        if (gameState !== 'INIT') {
            souls.current.forEach(s => {
                const bob = Math.sin(s.anim * 0.1) * 5;
                if (soulImageRef.current && soulImageRef.current.complete) {
                    ctx.drawImage(soulImageRef.current, s.x - 16, s.y - 45 + bob, 32, 32);
                } else {
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.5)'; ctx.beginPath(); ctx.arc(s.x, s.y - 30 + bob, 15, 0, Math.PI * 2); ctx.fill();
                }
            });

            particles.current.forEach(p => { ctx.fillStyle = p.color; ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size); });
            drawCoins(ctx);
            shadows.current.forEach(s => drawStickman(ctx, s));
            enemies.current.forEach(e => drawStickman(ctx, e));
            
            // --- DRAW PLAYER WITH SPRITES ---
            drawPlayerSprite(ctx, p1.current);

            floatingTexts.current.forEach(t => {
                ctx.save(); ctx.globalAlpha = Math.max(0, t.life / 60); ctx.textAlign = 'center';
                if (t.type === 'LEVEL_UP' && levelUpImageRef.current?.complete) {
                    const sc = t.life > 50 ? 1 + (t.life - 50) * 0.05 : 1;
                    ctx.translate(t.x, t.y); ctx.scale(sc, sc);
                    const ratio = levelUpImageRef.current.height / levelUpImageRef.current.width;
                    ctx.drawImage(levelUpImageRef.current, -30, -30 * ratio, 60, 60 * ratio);
                } else if (t.type === 'EXP' && expImageRef.current?.complete) {
                    ctx.drawImage(expImageRef.current, t.x - 22, t.y - 10, 20, 20);
                    ctx.font = '15px "Lilita One", cursive'; ctx.textAlign = 'left';
                    const g = ctx.createLinearGradient(t.x, t.y - 10, t.x, t.y + 5);
                    g.addColorStop(0, '#FFF'); g.addColorStop(1, '#0369A1'); ctx.fillStyle = g;
                    ctx.fillText(t.text, t.x, t.y);
                } else {
                    ctx.font = `${t.size}px "Lilita One", cursive`; ctx.fillStyle = t.color;
                    if (t.text === "FLOOR CLEARED") { ctx.shadowColor = 'rgba(74, 222, 128, 0.6)'; ctx.shadowBlur = 10; }
                    ctx.fillText(t.text, t.x | 0, t.y | 0);
                }
                ctx.restore();
            });
            ctx.globalAlpha = 1;
        }
        ctx.restore();

        if ((gameState === 'PLAYING') && !showStats) drawHUD(ctx);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        const fps = 60; const interval = 1000 / fps;
        let then = performance.now(); let delta = 0;
        const loop = (now) => {
            frameRef.current = requestAnimationFrame(loop);
            delta = now - then;
            if (delta > interval) { then = now - (delta % interval); update(); draw(); }
        };
        frameRef.current = requestAnimationFrame(loop);
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(frameRef.current); };
    }, [gameState, showStats]);

    const handleJoystickMove = (data) => {
        const { x, y, active } = data;
        input.current.left = false; input.current.right = false; input.current.jump = false;
        if (!active) return;
        if (x > 0.2) input.current.right = true; else if (x < -0.2) input.current.left = true;
        if (y < -0.5) input.current.jump = true;
    };

    const handleTouch = (key, val) => (e) => { if (e.type !== 'touchstart' && e.cancelable) e.preventDefault(); input.current[key] = val; };
    const handleAttackStart = (e) => { handleTouch('attack', true)(e); setIsAttackPressed(true); };
    const handleAttackEnd = (e) => { handleTouch('attack', false)(e); setTimeout(() => { setIsAttackPressed(false); }, 150); };
    const handleRiseStart = (e) => { if (!canRise) return; handleTouch('skill', true)(e); setIsRisePressed(true); };
    const handleRiseEnd = (e) => { if (!canRise) return; handleTouch('skill', false)(e); setTimeout(() => { setIsRisePressed(false); }, 150); };

    useEffect(() => {
        const keyMap = { 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'jump', ' ': 'attack', 'c': 'jump', 'x': 'attack', 'z': 'skill' };
        const down = (e) => { if (keyMap[e.key]) input.current[keyMap[e.key]] = true; };
        const up = (e) => { if (keyMap[e.key]) input.current[keyMap[e.key]] = false; };
        window.addEventListener('keydown', down); window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    const getEnemyWaveStats = () => {
        const activeEnemies = enemies.current.filter(e => !e.isDead);
        if (activeEnemies.length === 0 && waveQueue.current > 0) return { count: waveQueue.current, avgHp: "???", avgDmg: "???", avgLevel: "???" };
        if (activeEnemies.length === 0) return null;
        const total = activeEnemies.reduce((acc, curr) => ({ hp: acc.hp + curr.hp, dmg: acc.dmg + curr.damage, level: acc.level + curr.level }), { hp: 0, dmg: 0, level: 0 });
        return {
            count: activeEnemies.length + waveQueue.current,
            avgHp: Math.round(total.hp / activeEnemies.length),
            avgDmg: Math.round(total.dmg / activeEnemies.length),
            avgLevel: Math.round(total.level / activeEnemies.length)
        };
    };
    const enemyStats = showStats ? getEnemyWaveStats() : null;
    const toggleAuto = () => { const newVal = !isAuto; setIsAuto(newVal); isAutoRef.current = newVal; };

    return (
        <div className="w-full h-screen bg-black overflow-hidden relative touch-none select-none font-sans">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');`}</style>

            <GameHeader onHome={handleSafeExit} shadowCount={shadowCount} maxShadows={CFG.maxShadows} coins={visualCoins} />
            <canvas ref={canvasRef} className="block w-full h-full absolute top-0 left-0" />

            {showStats && (
                <div className="absolute inset-x-4 top-20 bottom-24 bg-zinc-900 border-2 border-white/30 rounded-lg p-4 z-50 flex flex-col items-center justify-center shadow-2xl">
                    <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-[0.2em] border-b border-white/20 pb-2">Battle Statistics</h2>
                    <div className="flex w-full justify-between gap-4">
                        <div className="flex-1 bg-blue-900/20 p-4 rounded border border-blue-500/30 flex flex-col gap-2">
                            <h3 className="text-blue-400 font-bold text-lg mb-2 text-center">PLAYER</h3>
                            <div className="flex justify-between text-gray-300 text-sm"><span>LEVEL</span><span className="text-white font-bold">{p1.current.level}</span></div>
                            <div className="flex justify-between text-gray-300 text-sm"><span>HP</span><span className="text-green-400 font-bold">{Math.round(p1.current.hp)} / {p1.current.maxHp}</span></div>
                            <div className="flex justify-between text-gray-300 text-sm"><span>ATK</span><span className="text-red-400 font-bold">{p1.current.damage}</span></div>
                            <div className="flex justify-between text-gray-300 text-sm"><span>DEF</span><span className="text-yellow-400 font-bold">{p1.current.defense}</span></div>
                            <div className="flex justify-between text-gray-300 text-sm"><span>EXP</span><span className="text-purple-400 font-bold">{p1.current.currentExp} / {p1.current.maxExp}</span></div>
                        </div>

                        <div className="flex-1 bg-red-900/20 p-4 rounded border border-red-500/30 flex flex-col gap-2">
                            <h3 className="text-red-500 font-bold text-lg mb-2 text-center">WAVE INFO</h3>
                            {enemyStats ? (
                                <>
                                    <div className="flex justify-between text-gray-300 text-sm"><span>ALIVE</span><span className="text-white font-bold">{enemyStats.count}</span></div>
                                    <div className="flex justify-between text-gray-300 text-sm"><span>AVG LVL</span><span className="text-white font-bold">{enemyStats.avgLevel}</span></div>
                                    <div className="flex justify-between text-gray-300 text-sm"><span>AVG HP</span><span className="text-green-400 font-bold">{enemyStats.avgHp}</span></div>
                                    <div className="flex justify-between text-gray-300 text-sm"><span>AVG DMG</span><span className="text-red-400 font-bold">{enemyStats.avgDmg}</span></div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 italic text-sm text-center">No Enemies Alive<br />Waiting for Wave...</div>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setShowStats(false)} className="mt-8 px-8 py-3 bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors">RESUME</button>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[100]">
                    <h2 className="text-5xl font-bold text-red-500 mb-2 uppercase tracking-wider animate-pulse">{winner}</h2>
                    <p className="text-gray-300 mb-2 text-xl">Floor Reached: <span className="text-yellow-400">{floorRef.current}</span></p>
                    <p className="text-gray-300 mb-2 text-xl">Level: <span className="text-yellow-400">{p1.current.level}</span></p>
                    <div className='flex gap-4 mt-4'>
                        <button onClick={initGame} className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,69,0,0.6)] border-4 border-white/10">HỒI SINH</button>
                        <button onClick={handleSafeExit} className="px-8 py-3 bg-gray-700 text-white font-bold text-xl rounded-full hover:bg-gray-600 border-4 border-white/10">THOÁT</button>
                    </div>
                </div>
            )}

            {(gameState === 'PLAYING') && !showStats && (
                <>
                    {!isAuto && !floorTransitioning.current && (
                        <div className="absolute bottom-28 left-8 z-40">
                            <VirtualJoystick onStickMove={handleJoystickMove} />
                        </div>
                    )}

                    <div className="absolute bottom-24 right-8 flex flex-col gap-4 z-40 items-center">
                        <div className="flex gap-4 mb-2">
                            <button onClick={toggleAuto} className={`w-10 h-10 border border-gray-500 rounded-full flex items-center justify-center active:scale-95 shadow-lg ${isAuto ? 'bg-green-600 animate-pulse border-green-400' : 'bg-gray-800/80'}`}>
                                {isAuto ? <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> : <span className="font-bold text-white text-[10px]">AUTO</span>}
                            </button>
                            <button onClick={() => setShowStats(true)} className="w-10 h-10 bg-gray-800/80 border border-gray-500 rounded-full flex items-center justify-center active:scale-95 shadow-lg">
                                <span className="font-bold text-white text-[10px]">INFO</span>
                            </button>
                        </div>

                        {!isAuto && !floorTransitioning.current && (
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="flex justify-end items-end">
                                    <button disabled={!canRise} className={`group relative w-16 h-16 rounded-full flex items-center justify-center touch-none select-none transition-all duration-150 ease-out ${!canRise ? 'opacity-50 grayscale cursor-not-allowed bg-slate-900/40 border-[2px] border-gray-700' : isRisePressed ? 'opacity-100 scale-90 bg-slate-800 border-[2px] border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]' : 'opacity-100 scale-100 bg-slate-900/60 border-[2px] border-gray-500/30 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'}`} onTouchStart={handleRiseStart} onTouchEnd={handleRiseEnd} onMouseDown={handleRiseStart} onMouseUp={handleRiseEnd}>
                                        <div className={`absolute inset-1 rounded-full border pointer-events-none transition-colors duration-150 ${canRise && isRisePressed ? 'border-purple-300/40' : 'border-gray-500/20'}`}></div>
                                        <img src={RISE_SKILL_IMG_URL} alt="Rise" className={`w-9 h-9 object-contain transition-all duration-150 pointer-events-none ${canRise && isRisePressed ? 'scale-110 brightness-150' : ''}`} />
                                    </button>
                                </div>
                                <button className={`group relative w-20 h-20 rounded-full flex items-center justify-center touch-none select-none transition-all duration-100 ease-out ${isAttackPressed ? 'scale-90 bg-slate-800 border-[3px] border-white/80 shadow-[0_0_25px_rgba(255,255,255,0.4)]' : 'scale-100 bg-slate-900/60 border-[3px] border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'}`} onTouchStart={handleAttackStart} onTouchEnd={handleAttackEnd} onMouseDown={handleAttackStart} onMouseUp={handleAttackEnd}>
                                    <div className={`absolute inset-1.5 rounded-full border pointer-events-none transition-colors duration-100 ${isAttackPressed ? 'border-white/30' : 'border-white/10'}`}></div>
                                    <img src={ATTACK_SKILL_IMG_URL} alt="Attack" className={`w-11 h-11 object-contain transition-all duration-100 pointer-events-none ${isAttackPressed ? 'opacity-100 scale-110 brightness-150' : 'opacity-50'}`} />
                                </button>
                            </div>
                        )}
                    </div>

                    {isAuto && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-900/50 border border-green-500/50 px-4 py-1 rounded-full pointer-events-none z-40">
                            <span className="text-green-400 text-xs font-bold tracking-widest animate-pulse">AUTO BATTLE ENGAGED</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StickmanShadowFinal;
