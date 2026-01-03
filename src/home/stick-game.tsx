import React, { useRef, useEffect, useState } from 'react';
// 1. Import useGame để lấy chỉ số nhân vật và skills
import { useGame } from '../GameContext.tsx';

// Helper để lấy tỉ lệ kích hoạt (Copy từ skill-data)
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

// --- ICON COMPONENTS (Inline để đảm bảo hoạt động độc lập) ---
const HomeIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
);

const CoinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
         <circle cx="12" cy="12" r="10" fill="#EAB308" stroke="#A16207" strokeWidth="2"/>
         <path d="M12 6V18M8 12H16" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const GemIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 9L12 22L21 9L12 2Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 2L12 22M3 9L21 9" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round"/>
    </svg>
);

// --- COMPONENT HEADER UI ---
// [UPDATE] Đã loại bỏ backdrop-blur-sm, tăng opacity nền lên slate-900/90 để dễ đọc hơn
const GameHeader = ({ onHome, stats }) => {
    return (
        <header className="absolute top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/90 border-b border-white/10 z-[60]">
            {/* Nút Home */}
            <button 
                onClick={onHome} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Quay lại Menu"
            >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">Trang Chính</span>
            </button>

            {/* Thông tin tài nguyên Global */}
            <div className="flex items-center gap-3">
                {/* Gems Display */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-blue-500/30">
                    <GemIcon />
                    <span className="text-blue-100 font-bold text-sm">{stats.gems || 0}</span>
                </div>

                {/* Coins Display */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-yellow-500/30">
                    <CoinIcon />
                    <span className="text-yellow-100 font-bold text-sm">{stats.atk ? (stats.atk * 100) : 0}</span> {/* Giả lập hiển thị coin từ stats hoặc prop */}
                </div>
            </div>
        </header>
    );
};

const StickmanShadowFinal = () => {
  const canvasRef = useRef(null);
  
  // 2. Lấy stats và function lấy skill từ Context
  const { totalPlayerStats, getEquippedSkillsDetails } = useGame(); 

  // --- STATE QUẢN LÝ GAME ---
  const [gameState, setGameState] = useState('MENU'); 
  const [winner, setWinner] = useState(null);
  const [showStats, setShowStats] = useState(false); 
  
  // --- AUTO MODE STATE ---
  const [isAuto, setIsAuto] = useState(false);
  const isAutoRef = useRef(false); 
  
  // State UI hiển thị nút kỹ năng
  const [canRise, setCanRise] = useState(false);
  const canRiseRef = useRef(false);

  // --- CẤU HÌNH GAME (CONFIG) ---
  const CFG = {
    gravity: 0.8,       // Trọng lực
    speed: 7,           // Tốc độ di chuyển
    jump: -16,          // Lực nhảy
    friction: 0.85,     // Ma sát
    attackDist: 70,     // Tầm đánh
    hitStun: 20,        // Khựng khi trúng đòn
    camShake: 0,        // Rung camera
    respawnTime: 120,   
    maxShadows: 3,      // Số lượng lính tối đa
    headerHeight: 53,   // Chiều cao header để tính offset HUD
  };

  // --- REFS QUẢN LÝ LOGIC ---
  const frameRef = useRef(0);
  const shakeRef = useRef(0);
  const hitStopRef = useRef(0);
  const camera = useRef({ x: 0 });
  const dprRef = useRef(1); 
  const floorTransitioning = useRef(false);

  // Ref lưu chỉ số Skill thụ động (Value + Chance)
  const playerSkillsRef = useRef({
      lifeSteal: { val: 0, chance: 0 },       
      thorns: { val: 0, chance: 0 },          
      damageBoost: { val: 0, chance: 0 },     
      armorPenetration: { val: 0, chance: 0 } 
  });

  // --- REFS QUẢN LÝ FLOOR & WAVE ---
  const floorRef = useRef(1);           // Tầng hiện tại
  const floorWavesRef = useRef({        // Quản lý số wave trong tầng
      current: 0, 
      total: 0 
  });
  
  const waveQueue = useRef(0);      
  const waveSpawnTimer = useRef(0); 
  
  // Ref hình ảnh (Assets)
  const soulImageRef = useRef(null);
  const expImageRef = useRef(null);
  const levelUpImageRef = useRef(null);

  // Input controller
  const input = useRef({ left: false, right: false, jump: false, attack: false, skill: false });

  // --- ENTITIES ---
  // Player 1
  const p1 = useRef({
    x: 0, y: 0, vx: 0, vy: 0,
    maxHp: 100, hp: 100,
    level: 1, currentExp: 0, maxExp: 100, 
    damage: 12, 
    defense: 0, 
    coins: 0, 
    state: 'IDLE', dir: 1,
    animTimer: 0, attackCooldown: 0,
    color: '#00f2ff', 
    weaponColor: '#ffffff',
    name: 'MONARCH',
    isDead: false,
    type: 'PLAYER'
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
    const sImg = new Image();
    sImg.src = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/soul.webp";
    soulImageRef.current = sImg;

    const eImg = new Image();
    eImg.src = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/exp.webp";
    expImageRef.current = eImg;

    const luImg = new Image();
    luImg.src = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/level-up.webp";
    levelUpImageRef.current = luImg;
  }, []);

  const rand = (min, max) => Math.random() * (max - min) + min;

  // --- SKILL CALCULATION ---
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

  // --- LOGIC FLOOR SYSTEM ---
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
        damage: startAtk,
        defense: startDef,
        level: 1, currentExp: 0, maxExp: 100,
        coins: 0, 
        state: 'IDLE', dir: 1,
        isDead: false 
    };
    
    enemies.current = [];
    shadows.current = [];
    souls.current = [];
    particles.current = [];
    floatingTexts.current = [];
    lootCoins.current = []; 
    
    initFloor(1);
    spawnWave(); 
    
    camera.current.x = -w/2;
    setCanRise(false);
    canRiseRef.current = false;
    setShowStats(false);
    
    setIsAuto(false);
    isAutoRef.current = false;
    floorTransitioning.current = false;
    
    bgObjects.current = [];
    for(let i = -15; i < 15; i++) {
        bgObjects.current.push({
            x: i * 800 + Math.random() * 200,
            height: 100 + Math.random() * 200,
            width: 40 + Math.random() * 40
        });
    }
    setGameState('PLAYING');
  };

  const nextFloor = () => {
      floorTransitioning.current = false; 
      const nextF = floorRef.current + 1;
      initFloor(nextF);
      
      const healPercent = Math.floor(rand(10, 101)); 
      const healAmount = Math.floor(p1.current.maxHp * (healPercent / 100));
      p1.current.hp = Math.min(p1.current.maxHp, p1.current.hp + healAmount);
      
      addFloatingText(p1.current.x, p1.current.y - 150, `+${healAmount}`, '#4ade80', 20, 'TEXT');
      
      enemies.current = [];
      souls.current = [];
      
      spawnWave(); 
  };

  const createEnemy = (x, y, level) => {
      const hp = 100 + (level * 30); 
      const def = Math.floor(level * 2); 

      const newEnemy = {
          x: x, y: y, vx: 0, vy: 0,
          maxHp: hp, hp: hp,
          level: level,
          damage: 5 + (level * 4),
          defense: def,
          state: 'IDLE', dir: -1, 
          animTimer: Math.random() * 100, 
          attackCooldown: 0, 
          aiTimer: Math.random() * 100,
          color: '#ff2a00', 
          weaponColor: '#ff9900',
          name: 'QUÁI VẬT',
          isDead: false,
          type: 'ENEMY'
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
      const minLv = tier * 15 + 1;
      const maxLv = (tier + 1) * 15;
      return Math.floor(rand(minLv, maxLv + 1));
  };
  
  const spawnSoul = (x, y, level, damage) => {
      souls.current.push({
          x, y, level, damage,
          life: 600, 
          anim: 0
      });
  };

  const extractShadow = () => {
      const p = p1.current;
      let closestIndex = -1;
      let minDst = 150;

      souls.current.forEach((s, i) => {
          const dst = Math.abs(p.x - s.x);
          if (dst < minDst) {
              minDst = dst;
              closestIndex = i;
          }
      });
      
      if (closestIndex === -1 && isAutoRef.current && souls.current.length > 0) {
          closestIndex = 0; 
      }

      if (closestIndex !== -1) {
          if (shadows.current.length >= CFG.maxShadows) return;

          const s = souls.current[closestIndex];
          const shadowHp = 80 + (s.level * 20);
          
          shadows.current.push({
              x: s.x, y: s.y, vx: 0, vy: 0,
              maxHp: shadowHp, hp: shadowHp,
              level: s.level, 
              damage: s.damage, 
              defense: Math.floor(s.level * 1.5),
              currentExp: 0, maxExp: 50 + (s.level * 10),
              state: 'IDLE', dir: p.dir,
              animTimer: 0, attackCooldown: 0,
              color: '#000000', 
              weaponColor: '#3b82f6', 
              name: 'SHADOW', isDead: false, type: 'ALLY'
          });
          
          createExplosion(s.x, s.y - 50, '#9333ea');
          addFloatingText(s.x, s.y - 120, "ARISE!", '#9333ea', 32);
          
          souls.current.splice(closestIndex, 1);
      }
  };

  const updateShadows = (floorY) => {
      for (let i = shadows.current.length - 1; i >= 0; i--) {
          if (shadows.current[i].isDead) {
              createExplosion(shadows.current[i].x, shadows.current[i].y, '#555');
              shadows.current.splice(i, 1);
          }
      }
      shadows.current.forEach(s => {
          let target = null;
          let minDst = 10000;
          
          enemies.current.forEach(e => {
              if(!e.isDead) {
                  const d = Math.abs(s.x - e.x);
                  if (d < minDst) { minDst = d; target = e; }
              }
          });
          
          if (!target) {
              target = p1.current;
          }
          
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
      floatingTexts.current.push({
          x, y, text, color, size, life: 60, vy: -2, type
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
              x: x, y: y - 40, 
              vx: rand(-6, 6), vy: rand(-12, -6), 
              val: coinValue,
              state: 'DROP', timer: 80 + rand(0, 30), 
          });
      }
  };

  const updateLoot = (floorY, camX) => {
      for (let i = lootCoins.current.length - 1; i >= 0; i--) {
          const c = lootCoins.current[i];
          if (c.state === 'DROP') {
              c.vy += CFG.gravity; c.x += c.vx; c.y += c.vy;
              if (c.y > floorY - 12) { c.y = floorY - 12; c.vy *= -0.5; c.vx *= 0.9; }
              c.timer--; if (c.timer <= 0) c.state = 'FLY';
          } else if (c.state === 'FLY') {
              // Bay về phía góc trái nơi hiển thị session coins
              const destX = camX + 80; const destY = 90; // Y = 90 để khớp với HUD mới (dưới Header)      
              c.x += (destX - c.x) * 0.08; c.y += (destY - c.y) * 0.08; 
              if (Math.abs(destX - c.x) < 15 && Math.abs(destY - c.y) < 15) {
                  p1.current.coins += c.val; lootCoins.current.splice(i, 1);
              }
          }
      }
  };
  
  const drawCoins = (ctx) => {
      lootCoins.current.forEach(c => {
          ctx.save(); ctx.translate(c.x, c.y);
          const r = 10;
          ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#B8860B'; ctx.font = 'bold 12px Arial'; 
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1);
          ctx.restore();
      });
  };

  // --- LEVELING SYSTEM ---
  const checkLevelUp = (entity, isPlayer) => {
      if (entity.currentExp >= entity.maxExp) {
          entity.level++;
          entity.currentExp -= entity.maxExp;
          entity.maxExp = Math.floor(entity.maxExp * 1.2);
          
          entity.damage += 5; 
          entity.hp = entity.maxHp;
          
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
  const drawHUD = (ctx) => {
      const p = p1.current;
      // OFFSET Y để tránh Header (53px + padding)
      const topOffset = 70; 
      
      const hudX = 20; const hudY = topOffset; const hudW = 120; const hudH = 36;  
      
      ctx.save();
      // Vẽ hiển thị Coins kiếm được trong Session (Canvas UI)
      ctx.fillStyle = 'rgba(20, 20, 20, 0.6)'; ctx.beginPath(); ctx.roundRect(hudX, hudY, hudW, hudH, 18); ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = '#FFD700'; ctx.stroke();
      const iconX = hudX + 20; const iconY = hudY + 18; const r = 12;
      ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(iconX, iconY, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'left'; ctx.fillText(`${p.coins}`, hudX + 45, hudY + 25);
      
      // Vẽ Shadow UI (Bên phải)
      const sHudW = 150;
      const sHudX = (canvasRef.current.width / dprRef.current) - sHudW - 20;
      
      const grad = ctx.createLinearGradient(sHudX, hudY, sHudX + sHudW, hudY + hudH);
      grad.addColorStop(0, '#3b0764'); 
      grad.addColorStop(1, '#6b21a8'); 
      
      ctx.fillStyle = grad; 
      ctx.beginPath(); ctx.roundRect(sHudX, hudY, sHudW, hudH, 18); ctx.fill();
      
      ctx.strokeStyle = '#d8b4fe'; ctx.lineWidth = 1.5; ctx.stroke();
      const sIconX = sHudX + 25; const sIconY = hudY + 18;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sIconX, sIconY - 2, 6, 0, Math.PI * 2); ctx.fill(); 
      ctx.beginPath(); ctx.arc(sIconX, sIconY + 8, 8, Math.PI, 0); ctx.fill(); 
      ctx.fillStyle = '#e9d5ff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'left'; ctx.fillText('SHADOW', sIconX + 15, sIconY + 5);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'right';
      if (shadows.current.length >= CFG.maxShadows) ctx.fillStyle = '#f87171';
      ctx.fillText(`${shadows.current.length} / ${CFG.maxShadows}`, sHudX + sHudW - 15, sIconY + 5);

      // Vẽ Floor / Wave info (Ở giữa, dưới Header)
      const centerX = (canvasRef.current.width / dprRef.current) / 2;
      const floorInfoY = topOffset - 10; 
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath(); ctx.roundRect(centerX - 80, floorInfoY, 160, 50, 8); ctx.fill();
      
      ctx.fillStyle = '#fbbf24'; 
      ctx.font = 'bold 18px "Lilita One", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(`FLOOR ${floorRef.current}`, centerX, floorInfoY + 22);
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText(`WAVE: ${floorWavesRef.current.current} / ${floorWavesRef.current.total}`, centerX, floorInfoY + 42);

      ctx.restore();
  };

  const drawUnitUI = (ctx, p, type) => {
    if (p.isDead) return;
    const barWidth = 60; const barHeight = 6; const yOffset = 100;
    const barX = (p.x - barWidth / 2) | 0; 
    const barY = (p.y - yOffset) | 0;
    const badgeX = barX - 14; const badgeY = barY + barHeight / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(barX, barY, barWidth, barHeight);
    const hpPercent = Math.max(0, p.hp / p.maxHp);
    
    if (type === 'ENEMY') ctx.fillStyle = '#ef4444';
    else if (type === 'ALLY') ctx.fillStyle = '#a855f7'; 
    else ctx.fillStyle = '#22c55e'; 
    
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    if (type !== 'ENEMY') {
        const expHeight = 3; const expY = barY + barHeight + 2;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(barX, expY, barWidth, expHeight);
        const expPercent = Math.min(1, p.currentExp / p.maxExp);
        ctx.fillStyle = type === 'ALLY' ? '#d8b4fe' : '#eab308'; 
        ctx.fillRect(barX, expY, barWidth * expPercent, expHeight);
    }

    ctx.beginPath(); ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = type === 'ALLY' ? '#a855f7' : '#eab308'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.level, badgeX, badgeY + 1);
  };

  const drawStickman = (ctx, p) => {
    if (p.isDead) return;
    const { x, y, dir, state, animTimer, color } = p;
    const cycle = animTimer * 0.2; 
    let legL_Angle = 0, legR_Angle = 0, armL_Angle = 0, armR_Angle = 0, bodyY = 0;

    if (state === 'RUN') {
        legL_Angle = Math.sin(cycle) * 0.8; legR_Angle = Math.sin(cycle + Math.PI) * 0.8;
        armL_Angle = Math.cos(cycle) * 0.8; armR_Angle = Math.cos(cycle + Math.PI) * 0.8;
        bodyY = Math.abs(Math.sin(cycle)) * 3;
    } else if (state === 'JUMP') {
        legL_Angle = -0.5; legR_Angle = 0.5; armL_Angle = -2; armR_Angle = -2;
    } else if (state === 'ATTACK') {
        const progress = Math.min(1, (15 - p.attackCooldown) / 5);
        armR_Angle = -1.5 + (progress * 3); armL_Angle = 0.5; legL_Angle = 0.5; legR_Angle = -0.5;
    } else {
        bodyY = Math.sin(animTimer * 0.1) * 1.5;
        armL_Angle = Math.sin(animTimer * 0.1) * 0.1; armR_Angle = -Math.sin(animTimer * 0.1) * 0.1;
    }

    ctx.save();
    ctx.translate(x | 0, (y - 25 - bodyY) | 0); ctx.scale(dir, 1);
    
    let outlineColor = 'transparent';
    if (p.type === 'PLAYER') outlineColor = '#00f2ff';
    if (p.type === 'ENEMY') outlineColor = '#ff2a00'; 
    if (p.type === 'ALLY') outlineColor = '#a855f7';   

    const renderBody = (strokeColor, lineWidth, isOutline) => {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const hip = { x: 0, y: 0 }; const head = { x: 0, y: -25 }; const shoulder = { x: 0, y: -18 };
        ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(head.x, head.y); ctx.stroke();
        
        if (isOutline) {
            ctx.fillStyle = strokeColor; 
            ctx.beginPath(); ctx.arc(head.x, head.y, 7.5, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#000'; 
            ctx.beginPath(); ctx.arc(head.x, head.y, 6, 0, Math.PI * 2); ctx.fill(); 
        }

        const drawLimb = (startX, startY, angle, len) => {
            const mx = startX + Math.sin(angle) * len; const my = startY + Math.cos(angle) * len;
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(mx, my); ctx.stroke();
            const fx = mx + Math.sin(angle * 0.8) * len; const fy = my + Math.cos(angle * 0.8) * len;
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(fx, fy); ctx.stroke();
            return { x: fx, y: fy };
        };

        if (!isOutline) ctx.strokeStyle = '#222'; else ctx.strokeStyle = strokeColor;
        drawLimb(hip.x, hip.y, legL_Angle, 12); 

        if (!isOutline) ctx.strokeStyle = '#000'; else ctx.strokeStyle = strokeColor;
        drawLimb(hip.x, hip.y, legR_Angle, 12);

        if (!isOutline) ctx.strokeStyle = '#222'; else ctx.strokeStyle = strokeColor;
        drawLimb(shoulder.x, shoulder.y, armL_Angle, 12);

        if (!isOutline) ctx.strokeStyle = '#000'; else ctx.strokeStyle = strokeColor;
        return drawLimb(shoulder.x, shoulder.y, armR_Angle, 12);
    };

    if (outlineColor !== 'transparent') {
        ctx.save(); ctx.globalAlpha = 0.5;
        renderBody(outlineColor, 6, true);
        ctx.restore();
    }
    const handPos = renderBody('#000', 3, false);
    if (handPos) {
        ctx.strokeStyle = p.type === 'ALLY' ? '#a855f7' : p.weaponColor; 
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const swordAngle = armR_Angle + 1.5; 
        const tipX = handPos.x + Math.sin(swordAngle) * 35; const tipY = handPos.y + Math.cos(swordAngle) * 35;
        ctx.moveTo(handPos.x, handPos.y); ctx.lineTo(tipX, tipY); ctx.stroke();
        if (state === 'ATTACK' && p.attackCooldown > 5) {
            ctx.fillStyle = p.type === 'ALLY' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.4)'; 
            ctx.beginPath(); ctx.arc(0, -15, 50, swordAngle - 0.5, swordAngle + 0.5); ctx.fill();
        }
    }
    if (p.type === 'ALLY') {
         ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(0, -26, 2, 0, Math.PI * 2); ctx.fill(); 
    }
    ctx.restore();
    drawUnitUI(ctx, p, p.type);
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
                
                // --- DAMAGE CALCULATION START ---
                let rawDamage = attacker.damage;
                let defenderDef = defender.defense || 0;
                const pSkills = playerSkillsRef.current;

                if (attacker.type === 'PLAYER') {
                    if (pSkills.damageBoost.val > 0) {
                        if (Math.random() * 100 < pSkills.damageBoost.chance) {
                            rawDamage *= (1 + pSkills.damageBoost.val / 100);
                            addFloatingText(defender.x, defender.y - 60, "CRIT!", '#ffcc00', 14, 'TEXT');
                        }
                    }
                    if (pSkills.armorPenetration.val > 0) {
                        if (Math.random() * 100 < pSkills.armorPenetration.chance) {
                             const pen = Math.min(1, pSkills.armorPenetration.val / 100);
                             defenderDef *= (1 - pen);
                             addFloatingText(defender.x, defender.y - 60, "PIERCE!", '#3b82f6', 14, 'TEXT');
                        }
                    }
                }

                let finalDamage = Math.max(1, rawDamage - defenderDef);
                
                defender.hp -= finalDamage;
                
                addFloatingText(defender.x, defender.y - 80, `-${Math.round(finalDamage)}`, '#ff0000'); 
                
                if (attacker.type === 'PLAYER' && pSkills.lifeSteal.val > 0) {
                    if (Math.random() * 100 < pSkills.lifeSteal.chance) {
                        const healAmt = finalDamage * (pSkills.lifeSteal.val / 100);
                        if (healAmt >= 1) {
                             attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
                             addFloatingText(attacker.x, attacker.y - 150, `+${Math.round(healAmt)}`, '#4ade80', 20, 'TEXT');
                        }
                    }
                }

                if (defender.type === 'PLAYER' && pSkills.thorns.val > 0) {
                    if (Math.random() * 100 < pSkills.thorns.chance) {
                        const thornDmg = finalDamage * (pSkills.thorns.val / 100);
                        if (thornDmg >= 1) {
                            attacker.hp -= thornDmg;
                             addFloatingText(attacker.x, attacker.y - 60, `-${Math.round(thornDmg)}`, '#a855f7', 16, 'TEXT'); 
                            createBlood(attacker.x, attacker.y - 25, '#a855f7', 5);
                        }
                    }
                }
                // --- DAMAGE CALCULATION END ---

                defender.state = 'HURT';
                shakeRef.current = 4; 
                if(attacker.type === 'PLAYER') { hitStopRef.current = 4; shakeRef.current = 8; } 

                createBlood(defender.x, defender.y - 25, defender.color);
                attacker.attackCooldown = 15; 
                
                if (defender.hp <= 0) {
                    defender.hp = 0;
                    defender.isDead = true;
                    createExplosion(defender.x, defender.y, defender.color);
                    
                    distributeExp(attacker, defender);
                    
                    if (attacker.type === 'PLAYER' || attacker.type === 'ALLY') {
                        spawnLoot(defender.x, defender.y, 20 + (defender.level * 10));
                    }

                    if (defender.type === 'ENEMY') {
                        spawnSoul(defender.x, defender.y, defender.level, defender.damage);
                    }
                    
                    if (defender.type === 'PLAYER') {
                        setWinner('BẠN ĐÃ TỬ TRẬN!');
                        setGameState('GAMEOVER');
                    }
                }
                return true;
            }
        }
        return false;
    };

  // --- GAME LOOP ---
  const update = () => {
    // Chỉ update khi đang PLAYING và không xem stats
    if (gameState !== 'PLAYING' || showStats) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const floorY = canvas.height / dprRef.current * 0.66; 

    // --- ALWAYS UPDATE VISUALS (Even during transition) ---
    // Camera follow player (smoothly)
    const targetCamX = p1.current.x - (canvas.width / dprRef.current) / 2;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;
    
    // Particles, Texts, Loot updates
    for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life--;
        if (p.life <= 0 || p.y > floorY) particles.current.splice(i, 1);
    }
    updateLoot(floorY, camera.current.x);
    for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
        const t = floatingTexts.current[i];
        t.y += t.vy; t.life--; if (t.life <= 0) floatingTexts.current.splice(i, 1);
    }
    
    // --- IF TRANSITIONING, SKIP GAME LOGIC ---
    if (floorTransitioning.current) {
        return;
    }

    // Hit Stop Effect
    if (hitStopRef.current > 0) { hitStopRef.current--; return; }

    // Shake dampening
    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;

    const usr = p1.current;
    
    // ============================================
    // LOGIC ĐIỀU KHIỂN: AUTO MODE vs MANUAL MODE
    // ============================================
    if (isAutoRef.current) {
        // --- AUTO MODE ---
        const canUseSkill = canRiseRef.current || (souls.current.length > 0 && shadows.current.length < CFG.maxShadows);
        if (canUseSkill) {
            extractShadow();
        }

        let target = null;
        let minDst = 10000;
        enemies.current.forEach(e => {
            if (!e.isDead) {
                const d = Math.abs(e.x - usr.x);
                if (d < minDst) { minDst = d; target = e; }
            }
        });

        if (target) {
            const dist = target.x - usr.x;
            const attackRange = CFG.attackDist - 10; 

            if (usr.state !== 'ATTACK') {
                usr.dir = dist > 0 ? 1 : -1;
            }

            if (Math.abs(dist) > attackRange) {
                usr.vx = usr.dir * CFG.speed;
                if (usr.state !== 'JUMP' && usr.state !== 'ATTACK' && usr.state !== 'HURT') usr.state = 'RUN';
            } else {
                usr.vx = 0;
                if (usr.attackCooldown <= 0) {
                    usr.state = 'ATTACK';
                    usr.attackCooldown = 25;
                    usr.vx = usr.dir * 10; 
                } else {
                    if (usr.state === 'RUN') usr.state = 'IDLE';
                }
            }
        } else {
            usr.vx *= CFG.friction;
            if (usr.state === 'RUN') usr.state = 'IDLE';
        }

    } else {
        // --- MANUAL MODE ---
        if (input.current.left) { usr.vx = -CFG.speed; usr.dir = -1; if(usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
        else if (input.current.right) { usr.vx = CFG.speed; usr.dir = 1; if(usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
        else { usr.vx *= CFG.friction; if(usr.state === 'RUN') usr.state = 'IDLE'; }
        if (input.current.jump && usr.y >= floorY - 1) { usr.vy = CFG.jump; usr.state = 'JUMP'; }
        if (input.current.attack && usr.attackCooldown <= 0) { 
            usr.state = 'ATTACK'; usr.attackCooldown = 25; usr.vx = usr.dir * 10; input.current.attack = false; 
        }
        if (input.current.skill) {
            extractShadow();
            input.current.skill = false;
        }
    }
    
    // Physics Player
    usr.vy += CFG.gravity; usr.x += usr.vx; usr.y += usr.vy;
    if (usr.y > floorY) { usr.y = floorY; usr.vy = 0; if (usr.state === 'JUMP') usr.state = 'IDLE'; }
    usr.animTimer++;
    if (usr.attackCooldown > 0) { usr.attackCooldown--; if (usr.attackCooldown === 0 && usr.state === 'ATTACK') usr.state = 'IDLE'; }

    // --- ENEMY SPAWN QUEUE LOGIC ---
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

    // Dọn dẹp xác chết
    for (let i = enemies.current.length - 1; i >= 0; i--) {
        if (enemies.current[i].isDead) {
            enemies.current.splice(i, 1);
        }
    }

    // --- LOGIC KẾT THÚC WAVE / FLOOR ---
    if (enemies.current.length === 0 && waveQueue.current === 0) {
        if (floorWavesRef.current.current < floorWavesRef.current.total) {
             floorWavesRef.current.current++;
             spawnWave();
        } else {
             if (!floorTransitioning.current) {
                 floorTransitioning.current = true;
                 addFloatingText(p1.current.x, p1.current.y - 190, "FLOOR CLEARED", '#4ade80', 20, 'TEXT');
                 setTimeout(() => {
                     nextFloor();
                 }, 3000);
             }
        }
    }

    // AI Control
    enemies.current.forEach(ai => {
        let target = usr;
        let minDist = Math.abs(usr.x - ai.x);
        shadows.current.forEach(s => {
            if(!s.isDead) {
                const d = Math.abs(s.x - ai.x);
                if (d < minDist) { minDist = d; target = s; }
            }
        });

        const dist = target.x - ai.x; 
        ai.aiTimer++;
        
        if (Math.abs(dist) > 50) {
            ai.vx = (dist > 0 ? 1 : -1) * (CFG.speed * 0.45);
            ai.dir = dist > 0 ? 1 : -1;
            if (ai.state !== 'JUMP' && ai.state !== 'ATTACK') ai.state = 'RUN';
        } else {
            ai.vx *= CFG.friction;
            if (ai.state === 'RUN') ai.state = 'IDLE';
            if (ai.state !== 'ATTACK') ai.dir = dist > 0 ? 1 : -1;
            if (ai.attackCooldown <= 0 && Math.random() < 0.03) {
                ai.state = 'ATTACK'; ai.attackCooldown = 30; ai.vx = ai.dir * 8;
            }
        }
        
        ai.vy += CFG.gravity; ai.x += ai.vx; ai.y += ai.vy;
        if (ai.y > floorY) { ai.y = floorY; ai.vy = 0; if (ai.state === 'JUMP') ai.state = 'IDLE'; }
        ai.animTimer++;
        if (ai.attackCooldown > 0) { ai.attackCooldown--; if (ai.attackCooldown === 0 && ai.state === 'ATTACK') ai.state = 'IDLE'; }
    });

    updateShadows(floorY);

    let hasSoul = false;
    for (let i = souls.current.length - 1; i >= 0; i--) {
        const s = souls.current[i];
        s.life--; s.anim++;
        if (s.life <= 0) souls.current.splice(i, 1);
        else hasSoul = true;
    }
    
    const isFull = shadows.current.length >= CFG.maxShadows;
    const showRise = hasSoul && !isFull; 
    if (showRise !== canRiseRef.current) {
        canRiseRef.current = showRise;
        setCanRise(showRise);
    }

    if(!p1.current.isDead) {
        enemies.current.forEach(e => checkHit(e, p1.current));
    }
    enemies.current.forEach(e => {
        if(!e.isDead) {
            checkHit(p1.current, e);
            shadows.current.forEach(s => checkHit(s, e));
        }
    });
    shadows.current.forEach(s => {
        enemies.current.forEach(e => checkHit(e, s));
    });

    if (p1.current.hp <= 0 && !p1.current.isDead) { 
        p1.current.isDead = true;
        setWinner('BẠN ĐÃ TỬ TRẬN!'); 
        setGameState('GAMEOVER'); 
    }
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

    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(camera.current.x + (canvas.width/dprRef.current)/2, (canvas.height/dprRef.current)/3, 150, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#333';
    bgObjects.current.forEach(obj => {
        if (obj.x > camera.current.x - 200 && obj.x < camera.current.x + (canvas.width/dprRef.current) + 200) {
            ctx.fillRect(obj.x | 0, (floorY - obj.height) | 0, obj.width, obj.height);
        }
    });

    const grad = ctx.createLinearGradient(0, floorY, 0, canvas.height / dprRef.current);
    grad.addColorStop(0, '#000'); grad.addColorStop(1, '#333');
    ctx.fillStyle = grad; ctx.fillRect(camera.current.x - 100, floorY, (canvas.width/dprRef.current) + 200, (canvas.height/dprRef.current) - floorY);
    ctx.strokeStyle = '#444'; ctx.beginPath(); ctx.moveTo(camera.current.x - 100, floorY); ctx.lineTo(camera.current.x + (canvas.width/dprRef.current) + 100, floorY); ctx.stroke();

    if (gameState !== 'MENU') { 
        // --- DRAW SOUL ---
        souls.current.forEach(s => {
            const bob = Math.sin(s.anim * 0.1) * 5;
            if (soulImageRef.current && soulImageRef.current.complete) {
                const size = 32; 
                ctx.drawImage(soulImageRef.current, s.x - size/2, s.y - 45 + bob, size, size);
            } else {
                ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
                ctx.beginPath(); ctx.arc(s.x, s.y - 30 + bob, 15, 0, Math.PI * 2); ctx.fill();
            }
        });

        particles.current.forEach(p => {
            ctx.fillStyle = p.color; ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
        });
        
        drawCoins(ctx); 
        shadows.current.forEach(s => drawStickman(ctx, s));
        enemies.current.forEach(e => drawStickman(ctx, e));
        drawStickman(ctx, p1.current);

        // --- DRAW FLOATING TEXT ---
        ctx.textAlign = 'center'; 
        
        floatingTexts.current.forEach(t => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, t.life / 60);

            if (t.type === 'LEVEL_UP') {
                const img = levelUpImageRef.current;
                
                if (img && img.complete && img.naturalWidth > 0) {
                    const originalW = img.naturalWidth;
                    const originalH = img.naturalHeight;
                    const ratio = originalH / originalW;
                    const targetW = 60; 
                    const targetH = targetW * ratio;
                    const scale = t.life > 50 ? 1 + (t.life - 50) * 0.05 : 1;
                    
                    ctx.translate(t.x, t.y);
                    ctx.scale(scale, scale);
                    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
                }
            } 
            else if (t.type === 'EXP') {
                 if (expImageRef.current && expImageRef.current.complete) {
                    const iconSize = 20; 
                    ctx.font = '15px "Lilita One", cursive'; 
                    ctx.textBaseline = 'middle'; 
                    ctx.textAlign = 'left';      
                    
                    ctx.drawImage(expImageRef.current, t.x - 22, t.y - 10, iconSize, iconSize);
                    
                    const gradient = ctx.createLinearGradient(t.x, t.y - 10, t.x, t.y + 5);
                    gradient.addColorStop(0, '#FFFFFF');      
                    gradient.addColorStop(0.4, '#38BDF8');    
                    gradient.addColorStop(1, '#0369A1');      

                    ctx.fillStyle = gradient;
                    ctx.fillText(t.text, t.x, t.y);
                 } else {
                     ctx.fillStyle = '#38BDF8';
                     ctx.font = 'bold 14px Arial';
                     ctx.fillText(t.text + " XP", t.x, t.y);
                 }
            } 
            else {
                ctx.textAlign = 'center'; 
                ctx.font = `${t.size}px "Lilita One", cursive`;
                ctx.fillStyle = t.color;
                
                if (t.text === "FLOOR CLEARED") {
                     ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
                     ctx.shadowBlur = 10;
                }
                
                ctx.fillText(t.text, t.x | 0, t.y | 0);
            }
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }
    ctx.restore();

    if ((gameState === 'PLAYING') && !showStats) { 
        drawHUD(ctx);
    }
  };

  // --- LOOP SETUP (60 FPS) ---
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    const fps = 60;
    const interval = 1000 / fps;
    let then = performance.now();
    let delta = 0;

    const loop = (now) => {
        frameRef.current = requestAnimationFrame(loop);

        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);
            update();
            draw();
        }
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameRef.current);
    };
  }, [gameState, showStats]); 

  // --- INPUT LISTENERS ---
  const handleTouch = (key, val) => (e) => { if(e.type !== 'touchstart' && e.cancelable) e.preventDefault(); input.current[key] = val; };
  useEffect(() => {
    const keyMap = { 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'jump', ' ': 'attack', 'c': 'jump', 'x': 'attack', 'z': 'skill' };
    const down = (e) => { if(keyMap[e.key]) input.current[keyMap[e.key]] = true; };
    const up = (e) => { if(keyMap[e.key]) input.current[keyMap[e.key]] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // --- STATS HELPER ---
  const getEnemyWaveStats = () => {
    const activeEnemies = enemies.current.filter(e => !e.isDead);
    if (activeEnemies.length === 0 && waveQueue.current > 0) {
         return {
             count: waveQueue.current,
             avgHp: "???",
             avgDmg: "???",
             avgLevel: "???"
         }
    }
    if (activeEnemies.length === 0) return null;
    
    const total = activeEnemies.reduce((acc, curr) => ({
        hp: acc.hp + curr.hp,
        dmg: acc.dmg + curr.damage,
        level: acc.level + curr.level
    }), { hp: 0, dmg: 0, level: 0 });

    return {
        count: activeEnemies.length + waveQueue.current,
        avgHp: Math.round(total.hp / activeEnemies.length),
        avgDmg: Math.round(total.dmg / activeEnemies.length),
        avgLevel: Math.round(total.level / activeEnemies.length)
    };
  };
  const enemyStats = showStats ? getEnemyWaveStats() : null;

  // Toggle Auto Mode
  const toggleAuto = () => {
      const newVal = !isAuto;
      setIsAuto(newVal);
      isAutoRef.current = newVal;
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative touch-none select-none font-sans">
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
      `}</style>
      
      {/* --- ADDED HEADER --- */}
      <GameHeader onHome={() => setGameState('MENU')} stats={totalPlayerStats} />
      
      {/* Game Canvas */}
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
                         <div className="h-full flex items-center justify-center text-gray-500 italic text-sm text-center">
                             No Enemies Alive<br/>Waiting for Wave...
                         </div>
                     )}
                </div>
            </div>
            
            <button onClick={() => setShowStats(false)} className="mt-8 px-8 py-3 bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors">
                RESUME
            </button>
        </div>
      )}

      {/* --- MENU MODAL --- */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
           <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 italic mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">SHADOW FIGHT</h1>
           <p className="text-gray-400 mb-8 tracking-widest">MONARCH LEGENDS</p>
           <div className='flex gap-4 mb-4 text-sm text-gray-500'>
               <span>HP: {totalPlayerStats.hp || 100}</span>
               <span>ATK: {totalPlayerStats.atk || 12}</span>
               <span>DEF: {totalPlayerStats.def || 0}</span>
           </div>
           <button onClick={initGame} className="px-10 py-4 bg-white text-black font-black text-2xl skew-x-[-10deg] hover:bg-purple-400 transition-colors shadow-[5px_5px_0px_#000000] border-2 border-white">FIGHT NOW</button>
        </div>
      )}

      {/* --- GAMEOVER MODAL --- */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[100]">
           <h2 className="text-5xl font-bold text-red-500 mb-2 uppercase tracking-wider animate-pulse">{winner}</h2>
           <p className="text-gray-300 mb-2 text-xl">Floor Reached: <span className="text-yellow-400">{floorRef.current}</span></p>
           <p className="text-gray-300 mb-2 text-xl">Level: <span className="text-yellow-400">{p1.current.level}</span></p>
           <button onClick={initGame} className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-2xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,69,0,0.6)] border-4 border-white/10">HỒI SINH</button>
        </div>
      )}

      {/* --- IN-GAME CONTROLS --- */}
      {(gameState === 'PLAYING') && !showStats && (
        <>
            {/* [UPDATE] Loại bỏ backdrop-blur */}
            {!isAuto && !floorTransitioning.current && (
                <div className="absolute bottom-24 left-8 flex gap-2 z-40">
                    <button className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-full active:bg-cyan-500/50 flex items-center justify-center" onTouchStart={handleTouch('left', true)} onTouchEnd={handleTouch('left', false)}><svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                    <button className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-full active:bg-cyan-500/50 flex items-center justify-center" onTouchStart={handleTouch('right', true)} onTouchEnd={handleTouch('right', false)}><svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                </div>
            )}
            
            <div className="absolute bottom-24 right-8 flex flex-col gap-4 z-40 items-center">
                
                {/* AUTO BUTTON */}
                <button onClick={toggleAuto} className={`w-10 h-10 border border-gray-500 rounded-full flex items-center justify-center active:scale-95 shadow-lg ${isAuto ? 'bg-green-600 animate-pulse border-green-400' : 'bg-gray-800/80'}`}>
                     {isAuto ? 
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> 
                        : 
                        <span className="font-bold text-white text-[10px]">AUTO</span>
                     }
                </button>
                
                {/* INFO BUTTON */}
                <button onClick={() => setShowStats(true)} className="w-10 h-10 bg-gray-800/80 border border-gray-500 rounded-full flex items-center justify-center active:scale-95 shadow-lg">
                     <span className="font-bold text-white text-[10px]">INFO</span>
                </button>

                {/* Các nút hành động: Chỉ hiển thị khi NOT Auto */}
                {!isAuto && !floorTransitioning.current && (
                    <>
                        {canRise && (
                            <button className="w-16 h-16 bg-purple-600/90 border-2 border-purple-400 rounded-full active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.8)] flex items-center justify-center animate-bounce"
                                onTouchStart={handleTouch('skill', true)} onTouchEnd={handleTouch('skill', false)}>
                                <span className="font-black text-white text-xs">RISE</span>
                            </button>
                        )}
                        <button className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full active:bg-red-500 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,0,0,0.3)] flex items-center justify-center" onTouchStart={handleTouch('attack', true)} onTouchEnd={handleTouch('attack', false)}><span className="font-black text-red-500 text-base tracking-tighter">ATK</span></button>
                        <button className="w-14 h-14 bg-blue-500/20 border-2 border-blue-500 rounded-full active:bg-blue-500 active:scale-95 transition-all flex items-center justify-center" onTouchStart={handleTouch('jump', true)} onTouchEnd={handleTouch('jump', false)}><span className="font-bold text-blue-400 text-xs">JUMP</span></button>
                    </>
                )}
            </div>
            
            {/* Hiển thị thông báo khi đang Auto cho rõ ràng */}
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
