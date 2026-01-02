import React, { useRef, useEffect, useState } from 'react';

const StickmanFinalUpdate = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); 
  const [winner, setWinner] = useState(null);
  
  // --- CẤU HÌNH ---
  const CFG = {
    gravity: 0.8,
    speed: 7,
    jump: -16,
    friction: 0.85,
    attackDist: 70, 
    hitStun: 20,
    camShake: 0,
    respawnTime: 120, 
  };

  const frameRef = useRef(0);
  const shakeRef = useRef(0);
  const hitStopRef = useRef(0);
  const camera = useRef({ x: 0 });
  const respawnTimer = useRef(0);
  const dprRef = useRef(1);

  const input = useRef({ left: false, right: false, jump: false, attack: false });

  // Player 1
  const p1 = useRef({
    x: 0, y: 0, vx: 0, vy: 0,
    maxHp: 100, hp: 100,
    level: 1, currentExp: 0, maxExp: 100, damage: 10,
    coins: 0, 
    state: 'IDLE', dir: 1,
    animTimer: 0, attackCooldown: 0,
    color: '#00f2ff', 
    weaponColor: '#ffffff',
    name: 'KIỆN TƯỚNG',
    isDead: false
  });

  // Player 2
  const p2 = useRef({
    x: 0, y: 0, vx: 0, vy: 0,
    maxHp: 100, hp: 100,
    level: 1, damage: 8,
    state: 'IDLE', dir: -1,
    animTimer: 0, attackCooldown: 0, aiTimer: 0,
    color: '#ff2a00', 
    weaponColor: '#ff9900',
    name: 'QUÁI VẬT',
    isDead: false
  });

  const particles = useRef([]);
  const bgObjects = useRef([]);
  const floatingTexts = useRef([]); 
  const lootCoins = useRef([]); 

  // --- DPI SETUP ---
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { w, h };
  };

  const initGame = () => {
    const { w, h } = handleResize(); 
    const floorY = h * 0.66;

    p1.current = { 
        ...p1.current, 
        x: 0, y: floorY, vx: 0, vy: 0, 
        hp: 100, maxHp: 100, 
        level: 1, currentExp: 0, maxExp: 100, damage: 10,
        coins: 0, 
        state: 'IDLE', dir: 1,
        isDead: false 
    };
    
    spawnEnemy(400, floorY, 1);
    
    camera.current.x = -w/2;
    particles.current = [];
    floatingTexts.current = [];
    lootCoins.current = []; 
    respawnTimer.current = 0;
    
    bgObjects.current = [];
    for(let i = -20; i < 20; i++) {
        bgObjects.current.push({
            x: i * 800 + Math.random() * 200,
            height: 100 + Math.random() * 200,
            width: 40 + Math.random() * 40
        });
    }
    setGameState('PLAYING');
  };

  const spawnEnemy = (x, y, level) => {
      const hp = 100 + (level * 20);
      p2.current = {
          ...p2.current,
          x: x, y: y, vx: 0, vy: 0,
          maxHp: hp, hp: hp,
          level: level,
          damage: 5 + (level * 2),
          state: 'IDLE', dir: -1, 
          isDead: false
      };
      createExplosion(x, y - 50, '#ff2a00');
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const createBlood = (x, y, color, amount = 10) => {
    for (let i = 0; i < amount; i++) {
      particles.current.push({
        x, y, vx: rand(-5, 5), vy: rand(-8, -2),
        life: rand(20, 40), color: color, size: rand(2, 5), type: 'blood'
      });
    }
  };

  const createExplosion = (x, y, color) => {
    for (let i = 0; i < 15; i++) {
        particles.current.push({
          x, y, vx: rand(-8, 8), vy: rand(-8, 8),
          life: rand(30, 50), color: color, size: rand(4, 8), type: 'spark'
        });
      }
  };

  const addFloatingText = (x, y, text, color, size = 20) => {
      floatingTexts.current.push({
          x, y, text, color, size, life: 60, vy: -2
      });
  };

  // --- LOOT SYSTEM (FIXED QUANTITY) ---
  const spawnLoot = (x, y, totalGold) => {
      // Cố định rơi 3 hoặc 4 đồng xu
      const numCoins = 3 + Math.floor(Math.random() * 2); 
      
      // Tính giá trị mỗi đồng xu
      const baseValue = Math.floor(totalGold / numCoins);
      const remainder = totalGold % numCoins;

      for (let i = 0; i < numCoins; i++) {
          // Cộng phần dư vào đồng xu đầu tiên để tổng ko đổi
          let coinValue = baseValue;
          if (i === 0) coinValue += remainder;

          lootCoins.current.push({
              x: x, y: y - 40, 
              vx: rand(-6, 6), // Văng rộng hơn xíu
              vy: rand(-12, -6), 
              val: coinValue,
              state: 'DROP', 
              timer: 80 + rand(0, 30), 
          });
      }
  };

  const updateLoot = (floorY, camX) => {
      for (let i = lootCoins.current.length - 1; i >= 0; i--) {
          const c = lootCoins.current[i];

          if (c.state === 'DROP') {
              c.vy += CFG.gravity; c.x += c.vx; c.y += c.vy;
              if (c.y > floorY - 12) {
                  c.y = floorY - 12; c.vy *= -0.5; c.vx *= 0.9;  
              }
              c.timer--;
              if (c.timer <= 0) c.state = 'FLY';
          } else if (c.state === 'FLY') {
              const destX = camX + 80; 
              const destY = 40;        
              const diffX = destX - c.x;
              const diffY = destY - c.y;
              c.x += diffX * 0.08;
              c.y += diffY * 0.08; 
              if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
                  p1.current.coins += c.val;
                  lootCoins.current.splice(i, 1);
              }
          }
      }
  };

  const drawCoins = (ctx) => {
      lootCoins.current.forEach(c => {
          ctx.save();
          ctx.translate(c.x, c.y);
          
          // FLAT COIN
          const r = 10;
          ctx.fillStyle = '#FFD700'; 
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#DAA520'; 
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#B8860B'; 
          ctx.font = 'bold 12px Arial'; 
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);

          ctx.restore();
      });
  };

  const gainExp = (enemyLevel) => {
      const p = p1.current;
      const expAmount = 50 + (enemyLevel * 10);
      p.currentExp += expAmount;
      addFloatingText(p.x, p.y - 80, `+${expAmount} EXP`, '#3b82f6', 16); 

      if (p.currentExp >= p.maxExp) {
          p.level++;
          p.currentExp -= p.maxExp;
          p.maxExp = Math.floor(p.maxExp * 1.2); 
          p.damage += 5; 
          p.hp = p.maxHp; 
          
          addFloatingText(p.x, p.y - 140, "LEVEL UP!", '#00ff00', 30);
          createExplosion(p.x, p.y - 50, '#00ff00');
      }
  };

  // --- DRAWING HUD ---
  const drawHUD = (ctx) => {
      const p = p1.current;
      const hudX = 20;
      const hudY = 20;
      const hudW = 120; 
      const hudH = 36;  

      ctx.save();

      ctx.fillStyle = 'rgba(20, 20, 20, 0.6)'; 
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 18); 
      ctx.fill();
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#FFD700'; 
      ctx.stroke();

      const iconX = hudX + 20;
      const iconY = hudY + 18;
      const r = 12;

      ctx.fillStyle = '#FFD700'; 
      ctx.beginPath();
      ctx.arc(iconX, iconY, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#B8860B';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', iconX, iconY + 1);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial'; 
      ctx.textAlign = 'left';
      ctx.fillText(`${p.coins}`, hudX + 45, hudY + 19);

      ctx.restore();
  };

  // --- UI CĂN CHỈNH LẠI ---
  const drawUnitUI = (ctx, p, isEnemy = false) => {
    if (p.isDead) return;
    
    // Kích thước UI
    const barWidth = 60; 
    const barHeight = 6; 
    const yOffset = 100; // Khoảng cách từ chân nhân vật lên thanh máu
    
    // Tọa độ gốc của thanh máu (Top-Left của thanh máu)
    const barX = p.x - barWidth / 2; 
    const barY = p.y - yOffset;

    // --- CĂN CHỈNH BADGE LEVEL ---
    const badgeSize = 10; 
    const badgeX = barX - badgeSize - 4; 
    const badgeY = barY + barHeight / 2;

    // 1. Vẽ nền thanh máu
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath(); 
    ctx.roundRect(barX, barY, barWidth, barHeight, 3); 
    ctx.fill();

    // 2. Vẽ máu hiện tại
    const hpPercent = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = isEnemy ? '#ef4444' : '#22c55e'; 
    if (!isEnemy && p.hp < p.maxHp * 0.3) ctx.fillStyle = '#eab308'; 
    ctx.beginPath(); 
    ctx.roundRect(barX, barY, barWidth * hpPercent, barHeight, 3); 
    ctx.fill();

    // 3. Vẽ thanh EXP (chỉ cho người chơi)
    if (!isEnemy) {
        const expHeight = 3; 
        const expY = barY + barHeight + 2; 
        
        // Nền EXP
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
        ctx.fillRect(barX, expY, barWidth, expHeight);
        
        // EXP hiện tại
        const expPercent = Math.min(1, p.currentExp / p.maxExp);
        ctx.fillStyle = '#3b82f6'; 
        ctx.fillRect(barX, expY, barWidth * expPercent, expHeight);
    }

    // 4. Vẽ Badge Level (Hình tròn)
    ctx.beginPath(); 
    ctx.arc(badgeX, badgeY, badgeSize, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937'; 
    ctx.fill();
    
    ctx.lineWidth = 1.5; 
    ctx.strokeStyle = '#eab308'; // Viền vàng
    ctx.stroke();

    // 5. Số Level (Căn giữa Badge)
    ctx.fillStyle = '#fff'; 
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';
    ctx.fillText(p.level, badgeX, badgeY + 1);
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
    ctx.translate(x, y - 25 - bodyY); ctx.scale(dir, 1);
    ctx.shadowBlur = 10; ctx.shadowColor = color; 
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    const hip = { x: 0, y: 0 }; const head = { x: 0, y: -25 }; const shoulder = { x: 0, y: -18 };
    const drawLimb = (startX, startY, angle, len) => {
        const mx = startX + Math.sin(angle) * len; const my = startY + Math.cos(angle) * len;
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(mx, my); ctx.stroke();
        const fx = mx + Math.sin(angle * 0.8) * len; const fy = my + Math.cos(angle * 0.8) * len;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(fx, fy); ctx.stroke();
        return { x: fx, y: fy };
    };

    ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(head.x, head.y); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(head.x, head.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#222'; drawLimb(hip.x, hip.y, legL_Angle, 12); drawLimb(shoulder.x, shoulder.y, armL_Angle, 12);
    ctx.strokeStyle = '#000'; drawLimb(hip.x, hip.y, legR_Angle, 12);
    const handPos = drawLimb(shoulder.x, shoulder.y, armR_Angle, 12);

    if (handPos) {
        ctx.strokeStyle = p.weaponColor; ctx.lineWidth = 2.5;
        ctx.beginPath();
        const swordAngle = armR_Angle + 1.5; 
        const tipX = handPos.x + Math.sin(swordAngle) * 35; const tipY = handPos.y + Math.cos(swordAngle) * 35;
        ctx.moveTo(handPos.x, handPos.y); ctx.lineTo(tipX, tipY); ctx.stroke();
        if (state === 'ATTACK' && p.attackCooldown > 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.shadowBlur = 0; ctx.beginPath();
            ctx.arc(0, -15, 50, swordAngle - 0.5, swordAngle + 0.5); ctx.fill();
        }
    }
    ctx.restore();
    drawUnitUI(ctx, p, p === p2.current);
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;
    if (hitStopRef.current > 0) { hitStopRef.current--; return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const floorY = canvas.height / dprRef.current * 0.66; 

    const targetCamX = p1.current.x - (canvas.width / dprRef.current) / 2;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;

    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;

    const usr = p1.current;
    if (input.current.left) { usr.vx = -CFG.speed; usr.dir = -1; if(usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
    else if (input.current.right) { usr.vx = CFG.speed; usr.dir = 1; if(usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
    else { usr.vx *= CFG.friction; if(usr.state === 'RUN') usr.state = 'IDLE'; }
    if (input.current.jump && usr.y >= floorY - 1) { usr.vy = CFG.jump; usr.state = 'JUMP'; }
    if (input.current.attack && usr.attackCooldown <= 0) { 
        usr.state = 'ATTACK'; usr.attackCooldown = 25; usr.vx = usr.dir * 10; input.current.attack = false; 
    }

    const ai = p2.current;
    if (ai.isDead) {
        respawnTimer.current++;
        if (respawnTimer.current > CFG.respawnTime) {
            const spawnX = usr.x + (Math.random() > 0.5 ? 400 : -400); 
            spawnEnemy(spawnX, floorY, ai.level + 1); 
            respawnTimer.current = 0;
        }
    } else {
        const dist = usr.x - ai.x; 
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
    }
    
    [usr, ai].forEach(p => {
        if (p.isDead) return;
        p.vy += CFG.gravity; p.x += p.vx; p.y += p.vy;
        if (p.y > floorY) { p.y = floorY; p.vy = 0; if (p.state === 'JUMP') p.state = 'IDLE'; }
        p.animTimer++;
        if (p.attackCooldown > 0) { p.attackCooldown--; if (p.attackCooldown === 0 && p.state === 'ATTACK') p.state = 'IDLE'; }
    });

    for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life--;
        if (p.life <= 0 || p.y > floorY) particles.current.splice(i, 1);
    }
    
    updateLoot(floorY, camera.current.x);

    for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
        const t = floatingTexts.current[i];
        t.y += t.vy; t.life--;
        if (t.life <= 0) floatingTexts.current.splice(i, 1);
    }

    const checkHit = (attacker, defender) => {
        if (defender.isDead) return false;
        if (attacker.state === 'ATTACK' && attacker.attackCooldown > 15 && attacker.attackCooldown < 23) {
            const hitDist = Math.abs(attacker.x - defender.x);
            const facing = (attacker.dir === 1 && defender.x > attacker.x) || (attacker.dir === -1 && defender.x < attacker.x);
            const overlapping = hitDist < 20; 

            if ((facing || overlapping) && hitDist < CFG.attackDist && Math.abs(attacker.y - defender.y) < 35) {
                defender.vx = attacker.dir * 12; defender.vy = -5; 
                
                const dmg = attacker.damage;
                defender.hp -= dmg;
                addFloatingText(defender.x, defender.y - 80, `-${dmg}`, '#ff0000'); 
                
                defender.state = 'HURT';
                shakeRef.current = 6; hitStopRef.current = 4; 
                createBlood(defender.x, defender.y - 25, defender.color);
                attacker.attackCooldown = 15; 
                
                if (defender.hp <= 0) {
                    defender.hp = 0;
                    defender.isDead = true;
                    createExplosion(defender.x, defender.y, defender.color);
                    
                    if (attacker === p1.current) {
                        gainExp(defender.level);
                        // Rơi tiền dựa trên level quái
                        spawnLoot(defender.x, defender.y, 20 + (defender.level * 10));
                    }
                    
                    if (defender === p1.current) {
                        setWinner('BẠN ĐÃ TỬ TRẬN!');
                        setGameState('GAMEOVER');
                    }
                }
                return true;
            }
        }
        return false;
    };

    if(!p1.current.isDead) checkHit(p1.current, p2.current);
    if(!p2.current.isDead) checkHit(p2.current, p1.current);

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
    ctx.translate(-camera.current.x + shakeX, shakeY);

    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(camera.current.x + (canvas.width/dprRef.current)/2, (canvas.height/dprRef.current)/3, 150, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#333';
    bgObjects.current.forEach(obj => {
        if (obj.x > camera.current.x - 200 && obj.x < camera.current.x + (canvas.width/dprRef.current) + 200) {
            ctx.fillRect(obj.x, floorY - obj.height, obj.width, obj.height);
        }
    });

    const grad = ctx.createLinearGradient(0, floorY, 0, canvas.height / dprRef.current);
    grad.addColorStop(0, '#000'); grad.addColorStop(1, '#333');
    ctx.fillStyle = grad; ctx.fillRect(camera.current.x - 100, floorY, (canvas.width/dprRef.current) + 200, (canvas.height/dprRef.current) - floorY);
    ctx.strokeStyle = '#444'; ctx.beginPath(); ctx.moveTo(camera.current.x - 100, floorY); ctx.lineTo(camera.current.x + (canvas.width/dprRef.current) + 100, floorY); ctx.stroke();

    if (gameState !== 'MENU') { 
        particles.current.forEach(p => {
            ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        
        drawCoins(ctx); 

        drawStickman(ctx, p2.current); 
        drawStickman(ctx, p1.current);

        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        floatingTexts.current.forEach(t => {
            ctx.fillStyle = t.color;
            ctx.globalAlpha = t.life / 60;
            ctx.fillText(t.text, t.x, t.y);
        });
        ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (gameState === 'PLAYING') {
        drawHUD(ctx);
    }
  };

  const loop = () => { update(); draw(); frameRef.current = requestAnimationFrame(loop); };
  
  useEffect(() => {
    handleResize(); 
    window.addEventListener('resize', handleResize);
    frameRef.current = requestAnimationFrame(loop);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameRef.current);
    };
  }, [gameState]);

  const handleTouch = (key, val) => (e) => { 
      if(e.type !== 'touchstart' && e.cancelable) e.preventDefault(); 
      input.current[key] = val; 
  };
  
  useEffect(() => {
    const keyMap = { 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'jump', ' ': 'attack', 'c': 'jump', 'x': 'attack' };
    const down = (e) => { if(keyMap[e.key]) input.current[keyMap[e.key]] = true; };
    const up = (e) => { if(keyMap[e.key]) input.current[keyMap[e.key]] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative touch-none select-none font-sans">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {gameState === 'MENU' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
           <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 italic mb-4 drop-shadow-[0_0_10px_rgba(0,200,255,0.5)]">SHADOW FIGHT</h1>
           <p className="text-gray-400 mb-8 tracking-widest">FINAL UPDATE</p>
           <button onClick={initGame} className="px-10 py-4 bg-white text-black font-black text-2xl skew-x-[-10deg] hover:bg-cyan-400 transition-colors shadow-[5px_5px_0px_#000000] border-2 border-white">FIGHT NOW</button>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[100]">
           <h2 className="text-5xl font-bold text-red-500 mb-2 uppercase tracking-wider drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] animate-pulse">{winner}</h2>
           <p className="text-gray-300 mb-2 text-xl">Cấp độ: <span className="text-yellow-400 font-bold">{p1.current.level}</span></p>
           <p className="text-gray-300 mb-8 text-xl">Vàng kiếm được: <span className="text-yellow-400 font-bold">{p1.current.coins}</span> $</p>
           
           <button 
             onClick={initGame} 
             className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-2xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,69,0,0.6)] border-4 border-white/10"
           >
             HỒI SINH
           </button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <>
            <div className="absolute bottom-24 left-8 flex gap-2 z-40">
                <button className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-full active:bg-cyan-500/50 flex items-center justify-center backdrop-blur"
                    onTouchStart={handleTouch('left', true)} onTouchEnd={handleTouch('left', false)}>
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <button className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-full active:bg-cyan-500/50 flex items-center justify-center backdrop-blur"
                    onTouchStart={handleTouch('right', true)} onTouchEnd={handleTouch('right', false)}>
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
            </div>
            
            <div className="absolute bottom-24 right-8 flex flex-col gap-3 z-40 items-center">
                <button className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full active:bg-red-500 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,0,0,0.3)] flex items-center justify-center"
                    onTouchStart={handleTouch('attack', true)} onTouchEnd={handleTouch('attack', false)}>
                    <span className="font-black text-red-500 text-base tracking-tighter">ATK</span>
                </button>
                 <button className="w-14 h-14 bg-blue-500/20 border-2 border-blue-500 rounded-full active:bg-blue-500 active:scale-95 transition-all flex items-center justify-center"
                    onTouchStart={handleTouch('jump', true)} onTouchEnd={handleTouch('jump', false)}>
                    <span className="font-bold text-blue-400 text-xs">JUMP</span>
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default StickmanFinalUpdate;
