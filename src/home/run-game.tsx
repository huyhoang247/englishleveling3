import React, { useState, useEffect, useRef } from 'react';

// --- HELPER: BEZIER CURVE MATH ---
const getBezierPoint = (t, p0, p1, p2) => {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
};

// --- ICON COMPONENTS ---
const IconTrophy = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const IconPlay = ({ size = 24, className = "", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconRotateCcw = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconSkull = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 12v.01" />
    <path d="M16 12v.01" />
    <path d="M8 12v.01" />
    <path d="M5.5 12a6.5 6.5 0 1 1 13 0" />
    <path d="M8 20v2h8v-2" />
    <path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
  </svg>
);

const IconHeart = ({ size = 24, className = "", fill="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const IconRocket = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 14a5 5 0 0 1 7 7" />
    <path d="M20 9.5a5 5 0 0 0-7-7" />
    <path d="M8.5 2.5a11 11 0 0 0 12.9 13.05" />
    <path d="M2.5 8.5a11 11 0 0 0 13.05 12.9" />
    <path d="M12 12l9 9" />
  </svg>
);

const IconCoin = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] ${className}`}>
     <circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2.5" />
     <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.4" />
     <path d="M12 5L16.5 12L12 19L7.5 12L12 5Z" fill="#06b6d4" stroke="#cffafe" strokeWidth="1" />
  </svg>
);

// --- ANIMATION COMPONENTS ---
const CinematicFloatingCoin = ({ startPos, targetPos, onComplete }) => {
    const [pos, setPos] = useState(startPos);
    const [scale, setScale] = useState(1);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const startTime = Date.now();
        const duration = 700;

        const midX = (startPos.x + targetPos.x) / 2;
        const midY = (startPos.y + targetPos.y) / 2;
        const controlPoint = { 
            x: midX - 100 + Math.random() * 50, 
            y: midY + 100 
        };

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

            if (progress >= 1) {
                onComplete();
                return;
            }

            const nextPos = getBezierPoint(ease, startPos, controlPoint, targetPos);
            setPos(nextPos);

            if (progress < 0.3) {
                setScale(1 + progress * 2); 
            } else {
                setScale(1.6 - (progress - 0.3) * 1.5);
            }

            if (progress > 0.8) setOpacity(1 - (progress - 0.8) * 5);

            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }, []);

    return (
        <div 
            className="fixed z-50 pointer-events-none will-change-transform flex items-center justify-center"
            style={{ 
                left: 0, top: 0,
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                opacity: opacity
            }}
        >
            <div className="relative">
                <IconCoin size={32} />
                <div className="absolute inset-0 bg-yellow-400 blur-md opacity-40 rounded-full animate-pulse" />
            </div>
        </div>
    );
};

const HUDCoinCounter = ({ count, bumpTrigger }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (bumpTrigger > 0) {
            setAnimate(true);
            const t = setTimeout(() => setAnimate(false), 200);
            return () => clearTimeout(t);
        }
    }, [bumpTrigger]);

    return (
        <div className={`bg-black/40 backdrop-blur border border-yellow-500/30 p-2 px-3 rounded-xl flex items-center gap-3 transition-transform duration-100 ${animate ? 'scale-125 bg-yellow-500/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'scale-100'}`}>
             <div className={`text-xl font-mono font-bold transition-colors ${animate ? 'text-white' : 'text-yellow-400'}`}>{count}</div>
             <IconCoin size={24} />
        </div>
    );
};

const CircularProgress = ({ percentage, size = 40, strokeWidth = 4, icon: Icon }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
            </svg>
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#gradient)" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-300 ease-linear" />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
            {Icon && <Icon size={size * 0.5} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
        </div>
    );
};

const NeonRunner = () => {
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100); 
  const [coinCount, setCoinCount] = useState(0); 
  const [coinBump, setCoinBump] = useState(0); 
  
  const [floatingCoins, setFloatingCoins] = useState([]); 
  const coinTargetRef = useRef(null); 

  const [flightFuel, setFlightFuel] = useState(0); 
  const [loaded, setLoaded] = useState(false);
  
  const mountRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0 });

  const gameRef = useRef({
    scene: null, camera: null, renderer: null,
    player: null, playerContainer: null, playerParts: {}, materials: {}, 
    lanes: [-2, 0, 2], currentLane: 1, targetX: 0,
    speed: 0.20,
    obstacles: [], coins: [], rockets: [], speedLines: [], 
    particles: [], // New generic particle system
    frameId: null, frameCount: 0, 
    isJumping: false, isDead: false, healthInternal: 100,
    isInvincible: false, invincibleTimer: 0,
    jumpVelocity: 0, gravity: 0.025, jumpPower: 0.42, 
    flightTimer: 0, maxFlightTime: 600, scoreInternal: 0, time: 0,
    geometries: {}, cachedMaterials: {}, cameraShake: 0
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mountRef.current) return;
    const THREE = window.THREE;
    const game = gameRef.current;
    
    // Setup Scene
    const scene = new THREE.Scene();
    const bgColor = 0x2b2146; 
    scene.background = new THREE.Color(bgColor); 
    scene.fog = new THREE.FogExp2(bgColor, 0.02);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 9);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.LinearEncoding; 
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffddaa, 1.2); 
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0x0088ff, 0.8);
    backLight.position.set(-5, 10, -10);
    scene.add(backLight);

    // Infinite Grid
    const gridHelper = new THREE.GridHelper(300, 60, 0x88ccff, 0x443366);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // --- CHARACTER DESIGN ---
    const createCharacter = () => {
        const container = new THREE.Group(); 
        const group = new THREE.Group();
        group.position.y = 0.55; 
        container.add(group);

        const armorMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.4, metalness: 0.5 });
        const darkSuitMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.1 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); 
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x110033, roughness: 0.1, metalness: 0.9, emissive: 0x001133, emissiveIntensity: 0.5 });

        // Body
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.3), armorMat);
        chest.position.y = 0.85; chest.castShadow = true; group.add(chest);
        const abs = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.35, 8), darkSuitMat);
        abs.position.y = 0.55; group.add(abs);
        const core = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), glowMat);
        core.position.set(0, 0.85, 0.16); group.add(core);
        const hips = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.28), armorMat);
        hips.position.y = 0.3; group.add(hips);

        // Head
        const headGroup = new THREE.Group(); headGroup.position.set(0, 1.05, 0); 
        const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.35), armorMat);
        helmet.position.y = 0.18; helmet.castShadow = true;
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.1), visorMat);
        visor.position.set(0, 0.18, 0.14);
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.15), darkSuitMat);
        ear.position.y = 0.18;
        headGroup.add(ear); headGroup.add(helmet); headGroup.add(visor); group.add(headGroup);

        // Jetpack
        const packGroup = new THREE.Group(); packGroup.position.set(0, 0.85, -0.15);
        const mainPack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.15), armorMat); packGroup.add(mainPack);
        const tGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
        const t1 = new THREE.Mesh(tGeo, darkSuitMat); t1.position.set(-0.18, -0.1, 0); packGroup.add(t1);
        const t2 = new THREE.Mesh(tGeo, darkSuitMat); t2.position.set(0.18, -0.1, 0); packGroup.add(t2);
        const fGeo = new THREE.ConeGeometry(0.08, 0.6, 8); fGeo.rotateX(Math.PI);
        const f1 = new THREE.Mesh(fGeo, glowMat); f1.position.set(-0.18, -0.4, 0); f1.visible = false; packGroup.add(f1);
        const f2 = new THREE.Mesh(fGeo, glowMat); f2.position.set(0.18, -0.4, 0); f2.visible = false; packGroup.add(f2);
        group.add(packGroup);

        // Limbs
        const createLimb = (isArm, xPos) => {
            const lg = new THREE.Group(); lg.position.set(xPos, isArm ? 1.0 : 0.3, 0);
            const j = new THREE.Mesh(new THREE.SphereGeometry(isArm?0.12:0.13,8,8), darkSuitMat); lg.add(j);
            const u = new THREE.Mesh(new THREE.BoxGeometry(isArm?0.12:0.15, isArm?0.35:0.45, isArm?0.12:0.15), darkSuitMat);
            u.translateY(isArm?-0.18:-0.22); lg.add(u);
            const p = new THREE.Mesh(new THREE.BoxGeometry(isArm?0.14:0.17, isArm?0.2:0.25, isArm?0.14:0.17), armorMat);
            p.translateY(isArm?-0.15:-0.2); lg.add(p);
            const l = new THREE.Mesh(new THREE.BoxGeometry(isArm?0.1:0.12, isArm?0.3:0.4, isArm?0.1:0.12), armorMat);
            l.translateY(isArm?-0.45:-0.6); lg.add(l);
            if(isArm) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,0.1), darkSuitMat); h.translateY(-0.65); lg.add(h); }
            else { const f = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.1,0.25), darkSuitMat); f.translate(0,-0.8,0.05); lg.add(f); }
            return lg;
        };
        const leftArm = createLimb(true, -0.32); const rightArm = createLimb(true, 0.32);
        const leftLeg = createLimb(false, -0.14); const rightLeg = createLimb(false, 0.14);
        group.add(leftArm); group.add(rightArm); group.add(leftLeg); group.add(rightLeg);

        return { container, mesh: group, parts: { head: headGroup, leftArm, rightArm, leftLeg, rightLeg, flame1: f1, flame2: f2 } };
    };

    const charData = createCharacter();
    game.player = charData.mesh;
    game.playerContainer = charData.container;
    game.playerParts = charData.parts;
    charData.container.position.y = 0;
    scene.add(charData.container);

    // --- CANVAS TEXTURE GENERATION ---
    const createNeonBoxTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#110022'; ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 10;
        ctx.beginPath();
        for (let i = -128; i < 256; i += 28) { ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); }
        ctx.stroke();
        ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 15;
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4; ctx.strokeRect(8, 8, 112, 112);
        ctx.shadowBlur = 0; ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.moveTo(64, 32); ctx.lineTo(96, 64); ctx.lineTo(64, 96); ctx.lineTo(32, 64); ctx.fill();
        ctx.fillStyle = '#ff0055'; ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 64, 64);
        return new THREE.CanvasTexture(canvas);
    };

    const createRocketTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // 1. Dark Metallic Hull
        const grad = ctx.createLinearGradient(0, 0, 128, 0);
        grad.addColorStop(0, '#223344');
        grad.addColorStop(0.5, '#445566');
        grad.addColorStop(1, '#223344');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        // 2. Plasma Core Window (Vertical Strip)
        ctx.fillStyle = '#000';
        ctx.fillRect(40, 10, 48, 108);
        
        // Glowing Core
        const coreGrad = ctx.createLinearGradient(0, 0, 128, 0);
        coreGrad.addColorStop(0.3, '#00ff00');
        coreGrad.addColorStop(0.5, '#ccffcc'); // Hot white center
        coreGrad.addColorStop(0.7, '#00ff00');
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
        ctx.fillRect(48, 15, 32, 98);
        ctx.shadowBlur = 0;

        // 3. Tech Panels / Lines
        ctx.strokeStyle = '#8899aa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 30); ctx.lineTo(128, 30); // Top ring
        ctx.moveTo(0, 100); ctx.lineTo(128, 100); // Bottom ring
        ctx.stroke();

        // 4. Warning Label
        ctx.save();
        ctx.translate(20, 64);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('FUEL-X', 0, 0);
        ctx.restore();

        return new THREE.CanvasTexture(canvas);
    };

    const createShockwaveTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const centerX = 64; const centerY = 64;
        const radius = 50;
        const gradient = ctx.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius + 5);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)'); 
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)'); 
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(centerX, centerY, 64, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = 'cyan'; ctx.stroke();
        return new THREE.CanvasTexture(canvas);
    };

    const createGlowParticleTexture = (color = 'white') => {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, color === 'gold' ? 'rgba(255, 200, 0, 0.5)' : 'rgba(0, 255, 255, 0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvas);
    };

    const neonTexture = createNeonBoxTexture();
    const rocketTexture = createRocketTexture(); // New Texture
    const shockwaveTex = createShockwaveTexture();
    const particleTexCyan = createGlowParticleTexture('cyan');
    const particleTexGold = createGlowParticleTexture('gold');

    // Geometries
    game.geometries = {
      cube: new THREE.BoxGeometry(0.7, 0.7, 0.7),
      cage: new THREE.BoxGeometry(0.85, 0.85, 0.85),
      coinRim: new THREE.TorusGeometry(0.25, 0.05, 8, 16), 
      coinGem: new THREE.OctahedronGeometry(0.12),
      // Rocket Parts
      rocketBody: new THREE.CylinderGeometry(0.12, 0.12, 0.6, 16),
      rocketNose: new THREE.ConeGeometry(0.12, 0.25, 16),
      rocketFin: new THREE.BoxGeometry(0.05, 0.2, 0.2),
      
      speedLine: new THREE.BoxGeometry(0.04, 0.04, 5),
      plane: new THREE.PlaneGeometry(1, 1) 
    };
    
    // Materials
    game.cachedMaterials.obstacle = new THREE.MeshStandardMaterial({ 
        map: neonTexture, color: 0xffffff, roughness: 0.3, metalness: 0.8,
        emissive: 0x220011, emissiveMap: neonTexture, emissiveIntensity: 0.5
    });
    game.cachedMaterials.obstacleCage = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    game.cachedMaterials.shockwave = new THREE.MeshBasicMaterial({ map: shockwaveTex, transparent: true, opacity: 1.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    game.cachedMaterials.particleCyan = new THREE.SpriteMaterial({ map: particleTexCyan, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    game.cachedMaterials.particleGold = new THREE.SpriteMaterial({ map: particleTexGold, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    game.cachedMaterials.coinRim = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1, emissive: 0xffaa00, emissiveIntensity: 0.4 });
    game.cachedMaterials.coinGem = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
    
    // Updated Rocket Material
    game.cachedMaterials.rocketBody = new THREE.MeshStandardMaterial({ 
        map: rocketTexture, 
        metalness: 0.6, roughness: 0.4, 
        emissive: 0x003300, emissiveMap: rocketTexture, emissiveIntensity: 0.8 
    });
    game.cachedMaterials.rocketNose = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.8, roughness: 0.2 });
    game.cachedMaterials.rocketFin = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
    
    game.cachedMaterials.speedLine = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

    game.scene = scene;
    game.camera = camera;
    game.renderer = renderer;
    game.grid = gridHelper;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(game.frameId);
    };
  }, [loaded]);

  // Main Loop
  useEffect(() => {
    if (!loaded) return;
    const THREE = window.THREE;
    const game = gameRef.current;

    const spawnSpeedLine = () => {
        const mesh = new THREE.Mesh(game.geometries.speedLine, game.cachedMaterials.speedLine);
        mesh.position.set((Math.random() - 0.5) * 25, Math.random() * 12, game.camera.position.z - 5 - Math.random() * 15);
        game.scene.add(mesh);
        game.speedLines.push(mesh);
    }

    const spawnObstacle = (zPos) => {
      const group = new THREE.Group();
      
      const mesh = new THREE.Mesh(game.geometries.cube, game.cachedMaterials.obstacle);
      group.add(mesh);
      
      const edges = new THREE.EdgesGeometry(game.geometries.cage);
      const line = new THREE.LineSegments(edges, game.cachedMaterials.obstacleCage);
      line.userData = { isCage: true }; 
      group.add(line);

      group.position.set(game.lanes[Math.floor(Math.random() * 3)], 0.35, zPos);
      game.scene.add(group);
      game.obstacles.push(group);
    };

    const spawnCoin = (zPos) => {
      // 5% Chance for Rocket
      if (Math.random() < 0.05) {
          const group = new THREE.Group();

          // 1. Body
          const body = new THREE.Mesh(game.geometries.rocketBody, game.cachedMaterials.rocketBody);
          // Canvas texture wraps around cylinder.
          // Rotate slightly to show "Core" window best
          body.rotation.y = Math.PI / 4; 
          group.add(body);

          // 2. Nose Cone
          const nose = new THREE.Mesh(game.geometries.rocketNose, game.cachedMaterials.rocketNose);
          nose.position.y = 0.425; // 0.6/2 + 0.25/2
          group.add(nose);

          // 3. Fins (x3)
          for (let i = 0; i < 3; i++) {
              const fin = new THREE.Mesh(game.geometries.rocketFin, game.cachedMaterials.rocketFin);
              const angle = (i / 3) * Math.PI * 2;
              // Position at base, pushed out
              fin.position.x = Math.cos(angle) * 0.15;
              fin.position.z = Math.sin(angle) * 0.15;
              fin.position.y = -0.2;
              fin.rotation.y = -angle; // Rotate to face outward
              group.add(fin);
          }

          // Orient the whole group flat like a missile
          group.rotation.x = Math.PI / 2; // Point forward? Or Up? Let's keep upright floating
          // Wait, missiles usually float upright in these runner games or rotate?
          // Previous code: rocket.rotation.x = Math.PI / 2; (Horizontal)
          // Let's keep it upright for "Floating Powerup" feel, or Horizontal for "Flying Missile"?
          // Let's make it float upright gently spinning.
          
          // Actually, let's tilt it slightly so we see the side
          group.rotation.z = 0.2; 
          group.rotation.x = 0.2;

          group.position.set(game.lanes[Math.floor(Math.random() * 3)], 1.0, zPos);
          game.scene.add(group);
          game.rockets.push(group);
          return;
      }
      
      const group = new THREE.Group();
      const rim = new THREE.Mesh(game.geometries.coinRim, game.cachedMaterials.coinRim); group.add(rim);
      const gem = new THREE.Mesh(game.geometries.coinGem, game.cachedMaterials.coinGem); group.add(gem);

      const isAir = Math.random() > 0.6;
      group.position.set(game.lanes[Math.floor(Math.random() * 3)], isAir ? 2.5 : 0.6, zPos);
      group.userData = { gem: gem }; 

      game.scene.add(group);
      game.coins.push(group);
    }

    const triggerCanvasEffect = (pos, type = 'LANDING') => {
        const spawnPos = pos.clone();
        
        if (type === 'LANDING') {
            const shockwave = new THREE.Mesh(game.geometries.plane, game.cachedMaterials.shockwave);
            shockwave.rotation.x = -Math.PI / 2; 
            shockwave.position.copy(spawnPos);
            shockwave.position.y = 0.02; 
            shockwave.scale.set(0.1, 0.1, 0.1);
            shockwave.userData = { isShockwave: true, growth: 0.15, fade: 0.05, life: 1.0 };
            game.scene.add(shockwave);
            game.particles.push(shockwave);
        }

        const count = type === 'LANDING' ? 8 : 12;
        const mat = type === 'COIN' ? game.cachedMaterials.particleGold : game.cachedMaterials.particleCyan;
        
        for (let i = 0; i < count; i++) {
            const sprite = new THREE.Sprite(mat);
            sprite.position.copy(spawnPos);
            sprite.position.x += (Math.random() - 0.5) * 0.5;
            sprite.position.z += (Math.random() - 0.5) * 0.5;
            
            const speedV = type === 'LANDING' ? 0.02 : 0.05;
            const speedH = type === 'LANDING' ? 0.03 : 0.05;

            sprite.userData = {
                isParticle: true,
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * speedH,
                    Math.random() * speedV + 0.01,
                    (Math.random() - 0.5) * speedH
                ),
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02
            };
            const scale = 0.2 + Math.random() * 0.3;
            sprite.scale.set(scale, scale, 1);
            game.scene.add(sprite);
            game.particles.push(sprite);
        }
    };

    const animate = () => {
      const parts = game.playerParts;
      game.frameCount++;

      if (game.frameCount % 4 === 0) spawnSpeedLine();
      for (let i = game.speedLines.length - 1; i >= 0; i--) {
          game.speedLines[i].position.z += game.speed * 4;
          if (game.speedLines[i].position.z > 10) {
              game.scene.remove(game.speedLines[i]);
              game.speedLines.splice(i, 1);
          }
      }

      for (let i = game.particles.length - 1; i >= 0; i--) {
          const p = game.particles[i];
          if (p.userData.isShockwave) {
              p.scale.addScalar(p.userData.growth);
              p.material.opacity = p.userData.life;
              p.userData.life -= p.userData.fade;
              if (p.userData.life <= 0) { game.scene.remove(p); game.particles.splice(i, 1); }
          } else if (p.userData.isParticle) {
              p.position.add(p.userData.vel);
              p.userData.vel.y *= 0.98; 
              p.material.opacity = p.userData.life;
              p.userData.life -= p.userData.decay;
              p.scale.multiplyScalar(0.98); 
              if (p.userData.life <= 0) { game.scene.remove(p); game.particles.splice(i, 1); }
          }
      }

      const targetCamX = game.playerContainer.position.x * 0.4;
      game.camera.position.x += (targetCamX - game.camera.position.x) * 0.08;
      
      if (game.cameraShake > 0) {
          game.camera.position.y = 5 + (Math.random() - 0.5) * game.cameraShake;
          game.cameraShake *= 0.9;
      } else {
          game.camera.position.y += (5 - game.camera.position.y) * 0.1;
      }
      game.camera.lookAt(0, 1, -5); 

      if (gameState === 'PLAYING') {
          if (game.isDead) {
              game.renderer.render(game.scene, game.camera);
              game.frameId = requestAnimationFrame(animate);
              return;
          }

          game.time += 0.015;
          game.scoreInternal += game.speed;
          if(game.frameCount % 10 === 0) {
              setScore(Math.floor(game.scoreInternal * 10));
              setFlightFuel((game.flightTimer / game.maxFlightTime) * 100);
          }

          game.grid.position.z = (game.grid.position.z + game.speed) % 10;

          if (game.isInvincible) {
              game.invincibleTimer--;
              game.playerContainer.visible = (game.frameCount % 4) !== 0;
              if (game.invincibleTimer <= 0) { game.isInvincible = false; game.playerContainer.visible = true; }
          }

          game.playerContainer.position.x += (game.targetX - game.playerContainer.position.x) * 0.15;
          const turnTilt = (game.playerContainer.position.x - game.targetX) * -0.08;
          game.player.rotation.z = turnTilt; 
          const runLean = -0.05;
          
          const isFlying = game.flightTimer > 0;

          if (isFlying) {
              game.flightTimer--;
              game.playerContainer.position.y += (4.0 - game.playerContainer.position.y) * 0.05;
              game.player.rotation.x = THREE.MathUtils.lerp(game.player.rotation.x, -0.8, 0.1);
              parts.head.rotation.x = THREE.MathUtils.lerp(parts.head.rotation.x, 0.6, 0.1);
              parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, -0.6, 0.1); 
              parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, -0.6, 0.1);
              parts.leftArm.rotation.z = -0.2; parts.rightArm.rotation.z = 0.2;
              parts.leftLeg.rotation.x = THREE.MathUtils.lerp(parts.leftLeg.rotation.x, 0.1, 0.1);
              parts.rightLeg.rotation.x = THREE.MathUtils.lerp(parts.rightLeg.rotation.x, 0.1, 0.1);
              parts.flame1.visible = true; parts.flame2.visible = true;
              parts.flame1.scale.y = 1.5 + Math.random(); parts.flame2.scale.y = 1.5 + Math.random();
              if (game.flightTimer <= 0) {
                  game.isJumping = true; game.jumpVelocity = 0; game.isInvincible = true; game.invincibleTimer = 60;
              }
          } else {
              parts.flame1.visible = false; parts.flame2.visible = false;
              game.player.rotation.x = THREE.MathUtils.lerp(game.player.rotation.x, runLean, 0.1);
              if (parts.head) parts.head.rotation.x = THREE.MathUtils.lerp(parts.head.rotation.x, 0, 0.1);
              parts.leftArm.rotation.z = 0; parts.rightArm.rotation.z = 0;
              if (game.isJumping) {
                  game.playerContainer.position.y += game.jumpVelocity;
                  game.jumpVelocity -= game.gravity;
                  parts.leftLeg.rotation.x = -0.5; parts.rightLeg.rotation.x = -1.0;
                  parts.leftArm.rotation.x = -2.0; parts.rightArm.rotation.x = -2.0;
                  if (game.playerContainer.position.y <= 0) {
                      game.playerContainer.position.y = 0;
                      game.isJumping = false;
                      game.jumpVelocity = 0;
                      triggerCanvasEffect(game.playerContainer.position, 'LANDING');
                  }
              } else {
                  const s = game.time * 25;
                  parts.leftLeg.rotation.x = Math.sin(s) * 0.8;
                  parts.rightLeg.rotation.x = Math.sin(s + Math.PI) * 0.8;
                  parts.leftArm.rotation.x = Math.sin(s + Math.PI) * 0.6;
                  parts.rightArm.rotation.x = Math.sin(s) * 0.6;
              }
          }

          const checkCollision = (obj, radius) => {
             const dx = Math.abs(obj.position.x - game.playerContainer.position.x);
             const dz = Math.abs(obj.position.z - game.playerContainer.position.z);
             return dx < radius && dz < radius;
          }

          [game.obstacles, game.coins, game.rockets].forEach((arr, idx) => {
              for (let i = arr.length - 1; i >= 0; i--) {
                  const obj = arr[i];
                  obj.position.z += game.speed;
                  
                  // OBSTACLE ANIMATION
                  if (idx === 0) { 
                      obj.rotation.x += 0.02; 
                      obj.rotation.y += 0.02; 
                      obj.children.forEach(c => {
                          if (c.userData.isCage) {
                              c.rotation.x -= 0.05;
                              c.rotation.z += 0.05;
                          }
                      });
                  }
                  
                  // COIN ANIMATION
                  if (idx > 0) obj.rotation.y += 0.05; 
                  if (obj.userData.gem) {
                      obj.userData.gem.rotation.x += 0.1;
                      obj.userData.gem.rotation.z += 0.05;
                  }

                  if (checkCollision(obj, 0.6)) {
                      if (idx === 0) { // Obstacle
                          if (game.playerContainer.position.y < 0.8 && !game.isInvincible && !isFlying) {
                              game.healthInternal -= 34;
                              setHealth(Math.max(0, game.healthInternal));
                              game.cameraShake = 0.5;
                              triggerCanvasEffect(obj.position, 'LANDING'); 
                              game.scene.remove(obj); arr.splice(i, 1);
                              if (game.healthInternal <= 0) {
                                  game.isDead = true;
                                  game.playerContainer.visible = false;
                                  setTimeout(() => setGameState('GAMEOVER'), 1000);
                              } else {
                                  game.isInvincible = true; game.invincibleTimer = 60;
                              }
                          }
                      } else if (idx === 1) { // Coin Logic
                          const dy = Math.abs(obj.position.y - (game.playerContainer.position.y + 0.5));
                          if (dy < 1.2) {
                              const vec = obj.position.clone().project(game.camera);
                              const x = (vec.x * .5 + .5) * window.innerWidth;
                              const y = (-(vec.y * .5) + .5) * window.innerHeight;
                              let tx = window.innerWidth - 60; let ty = 60;
                              if (coinTargetRef.current) {
                                  const rect = coinTargetRef.current.getBoundingClientRect();
                                  tx = rect.left + rect.width / 2; ty = rect.top + rect.height / 2;
                              }
                              setFloatingCoins(p => [...p, { id: Date.now() + Math.random(), start: {x, y}, end: {x: tx, y: ty} }]);
                              triggerCanvasEffect(obj.position, 'COIN');
                              setScore(p => p + 100);
                              game.scene.remove(obj); arr.splice(i, 1);
                          }
                      } else if (idx === 2) { // Rocket
                          game.flightTimer = game.maxFlightTime;
                          triggerCanvasEffect(game.playerContainer.position, 'LANDING');
                          game.scene.remove(obj); arr.splice(i, 1);
                      }
                  }
                  if (obj.position.z > 8) { game.scene.remove(obj); arr.splice(i, 1); }
              }
          });

          if (game.obstacles.length < 5 && Math.random() < 0.05) spawnObstacle(-80 - Math.random() * 40);
          if (game.coins.length < 5 && Math.random() < 0.08) spawnCoin(-80 - Math.random() * 40);

      } else if (gameState === 'MENU') {
          game.time += 0.02;
          game.playerContainer.rotation.y = Math.sin(game.time * 0.5) * 0.2; 
          game.playerContainer.position.y = Math.sin(game.time) * 0.1;
          game.player.rotation.x = 0; 
          game.player.rotation.z = 0; 
          game.renderer.render(game.scene, game.camera);
          game.frameId = requestAnimationFrame(animate);
      }
      
      if (gameState === 'PLAYING') {
          game.renderer.render(game.scene, game.camera);
          game.frameId = requestAnimationFrame(animate);
      }
    };

    if (game.obstacles.length === 0) {
        for(let i=0; i<6; i++) { spawnObstacle(-50 - i*30); spawnCoin(-60 - i*30); }
    }
    
    animate();
    return () => cancelAnimationFrame(game.frameId);
  }, [gameState, loaded]);

  const resetGame = () => {
      const game = gameRef.current;
      [game.obstacles, game.coins, game.rockets, game.speedLines, game.particles].forEach(arr => arr.forEach(o => game.scene.remove(o)));
      game.obstacles = []; game.coins = []; game.rockets = []; game.speedLines = []; game.particles = [];
      game.currentLane = 1; 
      game.playerContainer.position.set(0, 0, 0); 
      game.player.rotation.set(0, 0, 0);
      game.playerContainer.visible = true; 
      game.isDead = false; 
      game.isInvincible = false;
      game.flightTimer = 0; 
      setFlightFuel(0); 
      game.healthInternal = 100; 
      setHealth(100); 
      setScore(0); 
      setCoinCount(0); 
      setGameState('PLAYING');
  }

  const handleSwipe = (dir) => {
    if (gameState !== 'PLAYING' || gameRef.current.isDead) return;
    const game = gameRef.current;
    if (dir === 'LEFT' && game.currentLane > 0) game.currentLane--;
    if (dir === 'RIGHT' && game.currentLane < 2) game.currentLane++;
    if (dir === 'UP' && !game.isJumping && gameRef.current.flightTimer <= 0) {
        game.isJumping = true; game.jumpVelocity = game.jumpPower; 
    }
    game.targetX = game.lanes[game.currentLane];
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    const dy = touchStart.current.y - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) handleSwipe(dx > 0 ? 'LEFT' : 'RIGHT');
    } else {
        if (Math.abs(dy) > 30 && dy > 0) handleSwipe('UP');
    }
  };

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowLeft') handleSwipe('LEFT');
      if (e.key === 'ArrowRight') handleSwipe('RIGHT');
      if (e.key === 'ArrowUp' || e.code === 'Space') handleSwipe('UP');
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [gameState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2b2146] select-none touch-none font-sans text-white">
      <div ref={mountRef} className="absolute inset-0 z-0" onTouchStart={(e) => touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }} onTouchEnd={onTouchEnd} />

      {/* Floating Coins Animation Layer */}
      {floatingCoins.map(c => (
          <CinematicFloatingCoin 
            key={c.id} 
            startPos={c.start} 
            targetPos={c.end} 
            onComplete={() => {
                setFloatingCoins(p => p.filter(i => i.id !== c.id));
                setCoinCount(p => p + 1); 
                setCoinBump(prev => prev + 1); 
            }} 
          />
      ))}

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur border border-cyan-500/30 p-2 pr-4 rounded-xl flex items-center gap-3">
            <div className={`bg-cyan-500/20 p-2 rounded-lg`}><IconHeart size={20} className="text-cyan-400" /></div>
            <div className="flex flex-col gap-1">
                <div className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold">GIÁP</div>
                <div className="w-24 h-2 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${health}%` }} /></div>
            </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="bg-black/40 backdrop-blur border border-cyan-500/30 p-2 px-4 rounded-xl text-right">
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest">ĐIỂM</div>
                <div className="text-2xl font-mono font-bold text-white">{score}</div>
            </div>
            
            <div ref={coinTargetRef}>
               <HUDCoinCounter count={coinCount} bumpTrigger={coinBump} />
            </div>

            <div className={`transition-all duration-300 ${flightFuel > 0 ? 'opacity-100' : 'opacity-0'}`}>
                 <CircularProgress percentage={flightFuel} size={40} icon={IconRocket} />
            </div>
        </div>
      </div>

      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 p-8 animate-in zoom-in duration-300">
            <div className="text-center">
                <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-white to-blue-500 transform -skew-x-6 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                    NEON<br/>RUNNER
                </h1>
                <p className="text-cyan-300 tracking-[0.5em] text-sm mt-4 font-bold uppercase">Ánh Sáng Mới</p>
            </div>
            
            <button 
                onClick={resetGame} 
                className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-none transform -skew-x-12 transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
            >
                <div className="transform skew-x-12 flex items-center gap-3 font-black text-xl tracking-widest text-white">
                    <IconPlay fill="currentColor" /> BẮT ĐẦU
                </div>
                <div className="absolute inset-0 border border-white/20 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
            </button>
            <p className="text-gray-300 text-xs mt-8">Sử dụng phím mũi tên hoặc vuốt màn hình để di chuyển</p>
          </div>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-900/80 backdrop-blur-md">
           <div className="text-center p-8 bg-black/60 border border-red-500/50 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.5)] max-w-sm w-full animate-in zoom-in">
              <IconSkull size={64} className="mx-auto text-red-500 mb-6 animate-pulse" />
              <h2 className="text-3xl font-black text-white italic transform -skew-x-6 mb-2">NHIỆM VỤ THẤT BẠI</h2>
              
              <div className="grid grid-cols-2 gap-4 my-6 bg-white/10 p-4 rounded-lg">
                  <div className="text-center">
                      <div className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">Điểm số</div>
                      <div className="text-2xl font-bold text-cyan-400">{score}</div>
                  </div>
                  <div className="text-center border-l border-white/10">
                      <div className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">Vàng</div>
                      <div className="text-2xl font-bold text-yellow-400">{coinCount}</div>
                  </div>
              </div>

              <div className="flex flex-col gap-3">
                  <button onClick={resetGame} className="w-full bg-red-600 hover:bg-red-500 p-4 font-bold flex items-center justify-center gap-2 transition hover:scale-105 shadow-lg uppercase tracking-wider text-sm text-white">
                    <IconRotateCcw size={18}/> Thử lại
                  </button>
                  <button onClick={() => setGameState('MENU')} className="w-full bg-transparent border border-white/20 hover:bg-white/10 p-4 font-bold flex items-center justify-center gap-2 transition uppercase tracking-wider text-sm text-gray-300">
                    Menu Chính
                  </button>
              </div>
           </div>
        </div>
      )}

      {!loaded && <div className="absolute inset-0 z-50 bg-[#2b2146] flex items-center justify-center text-cyan-400 font-mono text-xs tracking-[0.5em] animate-pulse">KHỞI ĐỘNG HỆ THỐNG...</div>}
    </div>
  );
};

export default NeonRunner;
