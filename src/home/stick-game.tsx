import React, { useRef, useEffect, useState } from 'react';

const StickmanCompact = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); 
  const [winner, setWinner] = useState(null);
  
  const healthP1 = useRef(100);
  const healthP2 = useRef(100);

  // --- CONFIGURATION ---
  const CFG = {
    gravity: 0.8,
    groundY: 100,
    speed: 7,
    jump: -16,
    friction: 0.85,
    attackDist: 70, 
    hitStun: 20,
    camShake: 0,
  };

  const frameRef = useRef(0);
  const shakeRef = useRef(0);
  const hitStopRef = useRef(0);
  const camera = useRef({ x: 0 });

  const input = useRef({ left: false, right: false, jump: false, attack: false });

  // Player 1
  const p1 = useRef({
    x: 0, y: 0, vx: 0, vy: 0,
    maxHp: 100, state: 'IDLE', dir: 1,
    animTimer: 0, attackCooldown: 0,
    color: '#00f2ff', weaponColor: '#ffffff',
  });

  // Player 2 (AI)
  const p2 = useRef({
    x: 0, y: 0, vx: 0, vy: 0,
    maxHp: 100, state: 'IDLE', dir: -1,
    animTimer: 0, attackCooldown: 0, aiTimer: 0,
    color: '#ff2a00', weaponColor: '#ff9900',
  });

  const particles = useRef([]);
  const bgObjects = useRef([]);

  const initGame = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    healthP1.current = 100;
    healthP2.current = 100;
    p1.current = { ...p1.current, x: 0, y: h - CFG.groundY, vx: 0, vy: 0, state: 'IDLE', dir: 1 };
    p2.current = { ...p2.current, x: 400, y: h - CFG.groundY, vx: 0, vy: 0, state: 'IDLE', dir: -1 };
    camera.current.x = -w/2;
    particles.current = [];
    
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

  const rand = (min, max) => Math.random() * (max - min) + min;

  const createBlood = (x, y, color, amount = 10) => {
    for (let i = 0; i < amount; i++) {
      particles.current.push({
        x, y,
        vx: rand(-5, 5),
        vy: rand(-8, -2),
        life: rand(20, 40),
        color: color,
        size: rand(2, 5)
      });
    }
  };

  const drawHealthBar = (ctx, p, currentHp) => {
    const barWidth = 40;
    const barHeight = 4;
    const yOffset = 80; 
    const x = p.x - barWidth / 2;
    const y = p.y - yOffset;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
    const hpPercent = Math.max(0, currentHp / p.maxHp);
    let hpColor = p.color;
    if (currentHp < 30) hpColor = '#ffff00'; 
    ctx.fillStyle = hpColor;
    ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
  };

  const drawStickman = (ctx, p, currentHp) => {
    const { x, y, dir, state, animTimer, color } = p;
    const isRun = state === 'RUN';
    const isAtk = state === 'ATTACK';
    const isJump = state === 'JUMP';
    
    const cycle = animTimer * 0.2; 
    let legL_Angle = 0, legR_Angle = 0, armL_Angle = 0, armR_Angle = 0, bodyY = 0;

    if (isRun) {
        legL_Angle = Math.sin(cycle) * 0.8;
        legR_Angle = Math.sin(cycle + Math.PI) * 0.8;
        armL_Angle = Math.cos(cycle) * 0.8;
        armR_Angle = Math.cos(cycle + Math.PI) * 0.8;
        bodyY = Math.abs(Math.sin(cycle)) * 3;
    } else if (isJump) {
        legL_Angle = -0.5; legR_Angle = 0.5; armL_Angle = -2; armR_Angle = -2;
    } else if (isAtk) {
        const progress = Math.min(1, (15 - p.attackCooldown) / 5);
        armR_Angle = -1.5 + (progress * 3);
        armL_Angle = 0.5; legL_Angle = 0.5; legR_Angle = -0.5;
    } else {
        bodyY = Math.sin(animTimer * 0.1) * 1.5;
        armL_Angle = Math.sin(animTimer * 0.1) * 0.1;
        armR_Angle = -Math.sin(animTimer * 0.1) * 0.1;
    }

    ctx.save();
    ctx.translate(x, y - 25 - bodyY); 
    ctx.scale(dir, 1);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowBlur = 8; ctx.shadowColor = color;

    const hip = { x: 0, y: 0 };
    const head = { x: 0, y: -25 };
    const shoulder = { x: 0, y: -18 };
    const kneeLength = 12;
    const armLength = 12;

    const drawLimb = (startX, startY, angle, len1, len2) => {
        const mx = startX + Math.sin(angle) * len1;
        const my = startY + Math.cos(angle) * len1;
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(mx, my); ctx.stroke();
        const footX = mx + Math.sin(angle * 0.8) * len2;
        const footY = my + Math.cos(angle * 0.8) * len2;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(footX, footY); ctx.stroke();
        return { x: footX, y: footY };
    };

    ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(head.x, head.y); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(head.x, head.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#222'; drawLimb(hip.x, hip.y, legL_Angle, kneeLength, kneeLength);
    drawLimb(shoulder.x, shoulder.y, armL_Angle, armLength, armLength);
    ctx.strokeStyle = '#000'; drawLimb(hip.x, hip.y, legR_Angle, kneeLength, kneeLength);
    const handPos = drawLimb(shoulder.x, shoulder.y, armR_Angle, armLength, armLength);

    if (handPos) {
        ctx.strokeStyle = p.weaponColor; ctx.lineWidth = 2.5; ctx.shadowColor = p.weaponColor; ctx.shadowBlur = 10;
        ctx.beginPath();
        const swordAngle = armR_Angle + 1.5; 
        const swordLen = 35;
        const tipX = handPos.x + Math.sin(swordAngle) * swordLen;
        const tipY = handPos.y + Math.cos(swordAngle) * swordLen;
        ctx.moveTo(handPos.x, handPos.y); ctx.lineTo(tipX, tipY); ctx.stroke();
        if (isAtk && p.attackCooldown > 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.shadowBlur = 0; ctx.beginPath();
            ctx.arc(0, -15, 50, swordAngle - 0.5, swordAngle + 0.5); ctx.fill();
        }
    }
    ctx.restore();
    drawHealthBar(ctx, p, currentHp);
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;
    if (hitStopRef.current > 0) { hitStopRef.current--; return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const targetCamX = p1.current.x - canvas.width / 2;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;

    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;
    const floor = canvas.height - CFG.groundY;

    const usr = p1.current;
    if (input.current.left) { usr.vx = -CFG.speed; usr.dir = -1; if(usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
    else if (input.current.right) { usr.vx = CFG.speed; usr.dir = 1; if(usr.state !== 'JUMP' && usr.state !== 'ATTACK') usr.state = 'RUN'; }
    else { usr.vx *= CFG.friction; if(usr.state === 'RUN') usr.state = 'IDLE'; }

    if (input.current.jump && usr.y >= floor - 1) { usr.vy = CFG.jump; usr.state = 'JUMP'; }
    
    if (input.current.attack && usr.attackCooldown <= 0) { 
        usr.state = 'ATTACK'; usr.attackCooldown = 25; usr.vx = usr.dir * 10; input.current.attack = false; 
    }

    const ai = p2.current;
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
    
    [usr, ai].forEach(p => {
        p.vy += CFG.gravity; p.x += p.vx; p.y += p.vy;
        if (p.y > floor) { p.y = floor; p.vy = 0; if (p.state === 'JUMP') p.state = 'IDLE'; }
        p.animTimer++;
        if (p.attackCooldown > 0) { p.attackCooldown--; if (p.attackCooldown === 0 && p.state === 'ATTACK') p.state = 'IDLE'; }
    });

    for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life--;
        if (p.life <= 0 || p.y > floor) particles.current.splice(i, 1);
    }

    const checkHit = (attacker, defender, defHealthRef) => {
        if (attacker.state === 'ATTACK' && attacker.attackCooldown > 15 && attacker.attackCooldown < 23) {
            const hitDist = Math.abs(attacker.x - defender.x);
            const facing = (attacker.dir === 1 && defender.x > attacker.x) || (attacker.dir === -1 && defender.x < attacker.x);
            const overlapping = hitDist < 20; 

            if ((facing || overlapping) && hitDist < CFG.attackDist && Math.abs(attacker.y - defender.y) < 35) {
                defender.vx = attacker.dir * 12; defender.vy = -5; 
                defHealthRef.current -= 8; defender.state = 'HURT';
                shakeRef.current = 8; hitStopRef.current = 4; 
                createBlood(defender.x, defender.y - 25, defender.color);
                attacker.attackCooldown = 15; 
                return true;
            }
        }
        return false;
    };

    if(checkHit(usr, ai, healthP2)) {}
    if(checkHit(ai, usr, healthP1)) {}

    if (healthP1.current <= 0) { setWinner('THẤT BẠI!'); setGameState('GAMEOVER'); }
    else if (healthP2.current <= 0) { setWinner('CHIẾN THẮNG!'); setGameState('GAMEOVER'); }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const shakeX = (Math.random() - 0.5) * shakeRef.current;
    const shakeY = (Math.random() - 0.5) * shakeRef.current;
    
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.current.x + shakeX, shakeY);

    ctx.fillStyle = '#222'; 
    ctx.beginPath(); 
    ctx.arc(camera.current.x + canvas.width/2, canvas.height/2, 200, 0, Math.PI*2); 
    ctx.fill();

    const floorY = canvas.height - CFG.groundY;
    ctx.fillStyle = '#333';
    bgObjects.current.forEach(obj => {
        if (obj.x > camera.current.x - 200 && obj.x < camera.current.x + canvas.width + 200) {
            ctx.fillRect(obj.x, floorY - obj.height, obj.width, obj.height);
        }
    });

    const grad = ctx.createLinearGradient(0, floorY, 0, canvas.height);
    grad.addColorStop(0, '#000'); grad.addColorStop(1, '#333');
    ctx.fillStyle = grad; 
    ctx.fillRect(camera.current.x - 100, floorY, canvas.width + 200, CFG.groundY);
    ctx.strokeStyle = '#444'; 
    ctx.beginPath(); 
    ctx.moveTo(camera.current.x - 100, floorY); 
    ctx.lineTo(camera.current.x + canvas.width + 100, floorY); 
    ctx.stroke();

    if (gameState !== 'MENU') { 
        for (let i = 0; i < particles.current.length; i++) {
            const p = particles.current[i];
            ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        drawStickman(ctx, p2.current, healthP2.current); 
        drawStickman(ctx, p1.current, healthP1.current); 
    }
    
    ctx.restore();
  };

  const loop = () => { update(); draw(); frameRef.current = requestAnimationFrame(loop); };
  useEffect(() => {
    const canvas = canvasRef.current; canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  const handleTouch = (key, val) => (e) => { 
      if(e.type !== 'touchstart' && e.cancelable) e.preventDefault(); 
      input.current[key] = val; 
  };

  useEffect(() => {
    const down = (e) => {
        if(e.key === 'ArrowLeft') input.current.left = true;
        if(e.key === 'ArrowRight') input.current.right = true;
        if(e.key === 'ArrowUp' || e.key === 'c') input.current.jump = true;
        if(e.key === ' ' || e.key === 'x') input.current.attack = true;
    };
    const up = (e) => {
        if(e.key === 'ArrowLeft') input.current.left = false;
        if(e.key === 'ArrowRight') input.current.right = false;
        if(e.key === 'ArrowUp' || e.key === 'c') input.current.jump = false;
        if(e.key === ' ' || e.key === 'x') input.current.attack = false;
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative touch-none select-none font-sans">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {gameState === 'MENU' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
           <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 italic mb-4 drop-shadow-[0_0_10px_rgba(0,200,255,0.5)]">SHADOW FIGHT</h1>
           <p className="text-gray-400 mb-8 tracking-widest">COMPACT EDITION</p>
           <button onClick={initGame} className="px-10 py-4 bg-white text-black font-black text-2xl skew-x-[-10deg] hover:bg-cyan-400 transition-colors shadow-[5px_5px_0px_#000000] border-2 border-white">FIGHT NOW</button>
        </div>
      )}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 backdrop-blur-sm">
           <h2 className="text-5xl font-bold text-white mb-6 uppercase tracking-wider">{winner}</h2>
           <button onClick={initGame} className="px-8 py-3 bg-red-600 text-white font-bold text-xl rounded hover:bg-red-500 transition-colors">CHƠI LẠI</button>
        </div>
      )}
      {gameState === 'PLAYING' && (
        <>
            {/* COMPACT LEFT CONTROLS */}
            <div className="absolute bottom-6 left-6 flex gap-2 z-40">
                <button className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-full active:bg-cyan-500/50 flex items-center justify-center backdrop-blur"
                    onTouchStart={handleTouch('left', true)} onTouchEnd={handleTouch('left', false)}>
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <button className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-full active:bg-cyan-500/50 flex items-center justify-center backdrop-blur"
                    onTouchStart={handleTouch('right', true)} onTouchEnd={handleTouch('right', false)}>
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
            </div>
            
            {/* COMPACT RIGHT CONTROLS */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-40 items-center">
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

export default StickmanCompact;
