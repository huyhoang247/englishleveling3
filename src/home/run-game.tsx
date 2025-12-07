import React, { useState, useEffect, useRef } from 'react';

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

const IconPalette = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const IconChevronLeft = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
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
  <div className={`rounded-full border-2 border-yellow-300 bg-yellow-500 flex items-center justify-center font-bold text-yellow-900 shadow-lg ${className}`} style={{width: size, height: size, fontSize: size * 0.7}}>
    $
  </div>
);

// --- CIRCULAR PROGRESS BAR COMPONENT ---
const CircularProgress = ({ percentage, size = 40, strokeWidth = 4, icon: Icon }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            </svg>
            {/* Progress Circle */}
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-linear"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Icon Center */}
            {Icon && <Icon size={size * 0.5} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
        </div>
    );
};

const FloatingCoin = ({ startPos, onComplete }) => {
    const [style, setStyle] = useState({ 
        top: startPos.y, 
        left: startPos.x,
        opacity: 1,
        transform: 'scale(1)'
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setStyle({
                top: '90px', 
                left: 'calc(100% - 40px)', 
                opacity: 0.2, 
                transform: 'scale(0.5)' 
            });
        }, 50);

        const removeTimer = setTimeout(onComplete, 800); 

        return () => { clearTimeout(timer); clearTimeout(removeTimer); };
    }, []);

    return (
        <div 
            className="fixed z-50 transition-all duration-700 ease-in-out pointer-events-none"
            style={style}
        >
            <IconCoin size={24} />
        </div>
    );
};

const SKINS = [
  { 
    id: 'cyan', 
    name: 'NEON PRIME', 
    colors: { armor: 0x00ffff, joint: 0x111111, visor: 0xff00ff, light: 0x00ffff } 
  },
  { 
    id: 'red', 
    name: 'INFERNO', 
    colors: { armor: 0xff3300, joint: 0x330000, visor: 0x00ff00, light: 0xff5500 } 
  },
  { 
    id: 'yellow', 
    name: 'BUMBLEBEE', 
    colors: { armor: 0xffd700, joint: 0x222222, visor: 0x00ffff, light: 0xffaa00 } 
  },
  { 
    id: 'purple', 
    name: 'EVA UNIT', 
    colors: { armor: 0x9933ff, joint: 0x00ff00, visor: 0xff0000, light: 0xaa00ff } 
  },
  { 
    id: 'white', 
    name: 'GHOST OPS', 
    colors: { armor: 0xe0e0e0, joint: 0x555555, visor: 0x0000ff, light: 0xffffff } 
  },
];

const NeonRunner = () => {
  // Game State
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100); 
  const [coinCount, setCoinCount] = useState(0); 
  const [floatingCoins, setFloatingCoins] = useState([]); 
  const [flightFuel, setFlightFuel] = useState(0); 
  const [loaded, setLoaded] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);

  // Refs for Game Engine
  const mountRef = useRef(null);
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerContainer: null, 
    playerParts: {}, 
    materials: {}, 
    lanes: [-2, 0, 2],
    currentLane: 1,
    targetX: 0,
    speed: 0.15,
    obstacles: [],
    coins: [],
    rockets: [],
    speedLines: [], // New speed lines array
    shards: [],
    frameId: null,
    frameCount: 0, 
    isJumping: false,
    isDead: false,
    healthInternal: 100,
    isInvincible: false,
    invincibleTimer: 0,
    jumpVelocity: 0,
    gravity: 0.025, 
    jumpPower: 0.42, 
    flightTimer: 0, 
    maxFlightTime: 600, 
    scoreInternal: 0,
    time: 0,
    geometries: {},
    cachedMaterials: {},
    cameraShake: 0
  });

  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Skin Logic
  useEffect(() => {
      if (!loaded || !gameRef.current.materials.armor) return;
      const skin = SKINS[currentSkinIndex];
      const mats = gameRef.current.materials;
      mats.armor.color.setHex(skin.colors.armor);
      mats.armor.emissive.setHex(skin.colors.armor);
      mats.joint.color.setHex(skin.colors.joint);
      mats.visor.color.setHex(skin.colors.visor);
      mats.visor.emissive.setHex(skin.colors.visor);
      if (gameRef.current.playerLight) {
          gameRef.current.playerLight.color.setHex(skin.colors.light);
      }
  }, [currentSkinIndex, loaded]);

  useEffect(() => {
    if (!loaded || !mountRef.current) return;

    const THREE = window.THREE;
    const game = gameRef.current;
    
    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a103c); 
    scene.fog = new THREE.FogExp2(0x1a103c, 0.025); 

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, 0, -4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff00ff, 0.9);
    dirLight.position.set(-10, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    
    const gridHelper = new THREE.GridHelper(200, 50, 0x00d5ff, 0x2d004d);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // --- MATERIALS FOR THRUSTER ---
    const thrusterMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending 
    });

    // Character
    const createCharacter = () => {
        const container = new THREE.Group(); 
        const group = new THREE.Group();
        container.add(group);
        const initialSkin = SKINS[0];
        const armorMat = new THREE.MeshStandardMaterial({ color: initialSkin.colors.armor, emissive: initialSkin.colors.armor, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.8 });
        const jointMat = new THREE.MeshStandardMaterial({ color: initialSkin.colors.joint, roughness: 0.8 });
        const visorMat = new THREE.MeshStandardMaterial({ color: initialSkin.colors.visor, emissive: initialSkin.colors.visor, emissiveIntensity: 2.0 });
        game.materials = { armor: armorMat, joint: jointMat, visor: visorMat };

        const bodyGeo = new THREE.BoxGeometry(0.4, 0.5, 0.25);
        const body = new THREE.Mesh(bodyGeo, armorMat);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.85, 0);
        const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.3);
        const head = new THREE.Mesh(headGeo, armorMat);
        head.castShadow = true;
        const visorGeo = new THREE.BoxGeometry(0.2, 0.1, 0.05);
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0, -0.14);
        headGroup.add(head);
        headGroup.add(visor);
        group.add(headGroup);

        const createLimb = (w, h, d, x, y, z, isLeg = false) => {
            const limbGroup = new THREE.Group();
            limbGroup.position.set(x, y, z);
            const geo = new THREE.BoxGeometry(w, h, d);
            geo.translate(0, -h/2, 0); 
            const mesh = new THREE.Mesh(geo, armorMat);
            mesh.castShadow = true;
            limbGroup.add(mesh);

            // --- ADD THRUSTER TO LEGS ---
            let thruster = null;
            if (isLeg) {
                const tGeo = new THREE.ConeGeometry(0.08, 0.6, 8, 1, true); // Open ended cone
                tGeo.translate(0, -0.3, 0); // Pivot at top
                tGeo.rotateX(Math.PI); // Point down
                thruster = new THREE.Mesh(tGeo, thrusterMat);
                thruster.position.set(0, -0.45, 0); // Bottom of foot
                thruster.visible = false; // Hidden by default
                limbGroup.add(thruster);
            }

            return { group: limbGroup, thruster };
        };

        const leftArm = createLimb(0.12, 0.4, 0.12, -0.3, 0.7, 0).group;
        const rightArm = createLimb(0.12, 0.4, 0.12, 0.3, 0.7, 0).group;
        group.add(leftArm);
        group.add(rightArm);

        const lLegData = createLimb(0.14, 0.5, 0.14, -0.12, 0.25, 0, true);
        const rLegData = createLimb(0.14, 0.5, 0.14, 0.12, 0.25, 0, true);
        group.add(lLegData.group);
        group.add(rLegData.group);

        const light = new THREE.PointLight(initialSkin.colors.light, 0.8, 3);
        light.position.set(0, 0.5, 0);
        group.add(light);
        game.playerLight = light;
        
        // Extra light for flight mode
        const flightLight = new THREE.PointLight(0x00ffff, 0, 4);
        flightLight.position.set(0, -0.5, 0);
        container.add(flightLight);
        game.flightLight = flightLight;

        return { 
            container, 
            mesh: group, 
            parts: { 
                body, head: headGroup, leftArm, rightArm, 
                leftLeg: lLegData.group, rightLeg: rLegData.group,
                leftThruster: lLegData.thruster, rightThruster: rLegData.thruster 
            } 
        };
    };

    const charData = createCharacter();
    game.player = charData.mesh;
    game.playerContainer = charData.container;
    game.playerParts = charData.parts;
    charData.container.position.y = 0;
    scene.add(charData.container);

    game.geometries = {
      cube: new THREE.BoxGeometry(0.7, 0.7, 0.7),
      core: new THREE.BoxGeometry(0.35, 0.35, 0.35),
      coin: new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32), 
      shard: new THREE.BoxGeometry(0.2, 0.2, 0.2), 
      smallShard: new THREE.BoxGeometry(0.1, 0.1, 0.1),
      rocketBody: new THREE.CylinderGeometry(0.15, 0.15, 0.6, 16),
      rocketNose: new THREE.ConeGeometry(0.15, 0.2, 16),
      rocketFin: new THREE.BoxGeometry(0.1, 0.2, 0.4),
      speedLine: new THREE.BoxGeometry(0.05, 0.05, 4) // Long thin line
    };
    
    game.cachedMaterials.explosion = new THREE.MeshBasicMaterial({ color: 0xff0066, transparent: true });
    game.cachedMaterials.dust = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
    game.cachedMaterials.rocketBody = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    game.cachedMaterials.rocketNose = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 });
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

    const triggerExplosion = (pos, colorHex = 0xffffff, isDust = false) => {
        let shardMat = isDust ? game.cachedMaterials.dust.clone() : game.cachedMaterials.explosion.clone();
        if (!isDust) shardMat.color.setHex(colorHex);
        
        const count = isDust ? 8 : 15; 
        for (let i = 0; i < count; i++) {
            const geom = isDust ? game.geometries.smallShard : (Math.random() > 0.5 ? game.geometries.shard : game.geometries.smallShard);
            const mesh = new THREE.Mesh(geom, shardMat);
            mesh.position.copy(pos);
            mesh.position.x += (Math.random() - 0.5) * 0.5;
            mesh.position.y += (Math.random() - 0.5) * 0.5;
            mesh.position.z += (Math.random() - 0.5) * 0.5;
            const forceY = isDust ? Math.random() * 0.2 : Math.random() * 0.5 + 0.3;
            const forceZ = isDust ? 0 : game.speed * 2 + Math.random() * 0.5;
            mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * (isDust ? 0.5 : 1.0), forceY, forceZ);
            mesh.userData.rotVel = { x: (Math.random() - 0.5) * 0.8, y: (Math.random() - 0.5) * 0.8, z: (Math.random() - 0.5) * 0.8 };
            game.scene.add(mesh);
            game.shards.push(mesh);
        }
    }

    // --- NEW: SPEED LINES SPAWNER ---
    const spawnSpeedLine = () => {
        const mesh = new THREE.Mesh(game.geometries.speedLine, game.cachedMaterials.speedLine);
        // Random position around player
        const range = 10;
        mesh.position.set(
            (Math.random() - 0.5) * range,
            Math.random() * range,
            game.camera.position.z - 5 - Math.random() * 10 // Start in front
        );
        game.scene.add(mesh);
        game.speedLines.push(mesh);
    }

    const spawnRocket = (zPos) => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(game.geometries.rocketBody, game.cachedMaterials.rocketBody);
        const nose = new THREE.Mesh(game.geometries.rocketNose, game.cachedMaterials.rocketNose);
        nose.position.y = 0.4;
        const fin1 = new THREE.Mesh(game.geometries.rocketFin, game.cachedMaterials.rocketNose);
        fin1.position.y = -0.2;
        group.add(body, nose, fin1);
        const light = new THREE.PointLight(0xff0000, 1, 3);
        light.position.y = 0;
        group.add(light);
        
        const laneIndex = Math.floor(Math.random() * 3);
        group.position.x = game.lanes[laneIndex];
        group.position.z = zPos;
        group.position.y = 1.0; 
        group.userData = { type: 'rocket', isRotator: true };
        game.scene.add(group);
        game.rockets.push(group);
    };

    const spawnObstacle = (zPos) => {
      const neonPink = 0xff0066;
      const mesh = new THREE.Group();
      const shellMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.4, transmission: 0.3 });
      const shell = new THREE.Mesh(game.geometries.cube, shellMat);
      mesh.add(shell);
      const edges = new THREE.EdgesGeometry(game.geometries.cube);
      const cageMat = new THREE.LineBasicMaterial({ color: neonPink });
      const cage = new THREE.LineSegments(edges, cageMat);
      mesh.add(cage);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000, roughness: 0.0, metalness: 1.0 }); 
      const core = new THREE.Mesh(game.geometries.core, coreMat);
      core.userData = { isRotator: true }; 
      mesh.add(core);
      mesh.position.y = 0.35;
      const laneIndex = Math.floor(Math.random() * 3);
      mesh.position.x = game.lanes[laneIndex];
      mesh.position.z = zPos;
      mesh.userData = { type: 'obstacle', shape: 'CUBE', height: 0.7 };
      game.scene.add(mesh);
      game.obstacles.push(mesh);
    };

    const spawnCoin = (zPos) => {
      if (Math.random() < 0.05) {
          spawnRocket(zPos);
          return;
      }
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.8, metalness: 0.8, roughness: 0.1 });
      const coinMesh = new THREE.Mesh(game.geometries.coin, goldMat);
      coinMesh.rotation.x = Math.PI / 2; 
      const coinGroup = new THREE.Group();
      coinGroup.add(coinMesh);
      coinGroup.userData = { isCoin: true, mesh: coinMesh };
      const laneIndex = Math.floor(Math.random() * 3);
      coinGroup.position.x = game.lanes[laneIndex];
      coinGroup.position.z = zPos;
      const isAirCoin = Math.random() > 0.6;
      coinGroup.position.y = isAirCoin ? 2.5 : 0.6; 
      coinGroup.userData = { ...coinGroup.userData, type: 'coin', isAir: isAirCoin };
      game.scene.add(coinGroup);
      game.coins.push(coinGroup);
    }

    const animate = () => {
      const parts = game.playerParts;
      game.frameCount++;

      // Update Speed Lines
      for (let i = game.speedLines.length - 1; i >= 0; i--) {
          const line = game.speedLines[i];
          line.position.z += game.speed * 3; // Move faster than world
          if (line.position.z > game.camera.position.z + 5) {
              game.scene.remove(line);
              game.speedLines.splice(i, 1);
          }
      }

      for (let i = game.shards.length - 1; i >= 0; i--) {
        const shard = game.shards[i];
        shard.position.add(shard.userData.velocity);
        shard.rotation.x += shard.userData.rotVel.x;
        shard.rotation.y += shard.userData.rotVel.y;
        shard.userData.velocity.y -= 0.03; 
        if (shard.position.y < -5 || Math.abs(shard.position.z - game.playerContainer.position.z) > 25) {
            game.scene.remove(shard);
            game.shards.splice(i, 1);
        }
      }

      let targetCamX = game.playerContainer.position.x * 0.4;
      game.camera.position.x += (targetCamX - game.camera.position.x) * 0.1;
      
      const targetCamY = game.flightTimer > 0 ? 8 : 5;
      const targetLookAtY = game.flightTimer > 0 ? 2 : 0;
      
      if (game.cameraShake > 0) {
          game.camera.position.y = targetCamY + (Math.random() - 0.5) * game.cameraShake;
          game.cameraShake *= 0.9;
          if (game.cameraShake < 0.05) game.cameraShake = 0;
      } else {
          game.camera.position.y += (targetCamY - game.camera.position.y) * 0.05;
      }
      game.camera.lookAt(0, targetLookAtY, -4 + game.playerContainer.position.z * 0.1); 

      if (gameState === 'PLAYING') {
          if (game.isDead) {
              game.renderer.render(game.scene, game.camera);
              game.frameId = requestAnimationFrame(animate);
              return;
          }

          const isFlying = game.flightTimer > 0;

          // --- UPDATE THRUSTER VISIBILITY ---
          if (parts.leftThruster && parts.rightThruster) {
              if (isFlying) {
                  parts.leftThruster.visible = true;
                  parts.rightThruster.visible = true;
                  // Flicker effect
                  const scale = 1 + Math.random() * 0.4;
                  parts.leftThruster.scale.set(1, scale, 1);
                  parts.rightThruster.scale.set(1, scale * 0.9, 1); // Slight sync offset
                  
                  // Pulse flight light
                  game.flightLight.intensity = 1.0 + Math.random();
                  
                  // Spawn speed lines occasionally
                  if (game.frameCount % 5 === 0) spawnSpeedLine();

              } else {
                  parts.leftThruster.visible = false;
                  parts.rightThruster.visible = false;
                  game.flightLight.intensity = 0;
              }
          }

          if (game.isInvincible) {
              game.invincibleTimer--;
              game.playerContainer.visible = Math.floor(Date.now() / 50) % 2 === 0;
              if (game.invincibleTimer <= 0) {
                  game.isInvincible = false;
                  game.playerContainer.visible = true;
              }
          } else {
              game.playerContainer.visible = true;
          }

          const runCycle = game.time * 20;
          game.time += 0.01;
          game.scoreInternal += game.speed;
          
          if (game.frameCount % 10 === 0) {
             setScore(Math.floor(game.scoreInternal * 10));
             if (game.flightTimer > 0) {
                 setFlightFuel((game.flightTimer / game.maxFlightTime) * 100);
             } else {
                 setFlightFuel(0);
             }
          }

          if (game.speed < 0.6) game.speed += 0.00003;
          game.grid.position.z = (game.grid.position.z + game.speed) % 10;
          game.playerContainer.position.x += (game.targetX - game.playerContainer.position.x) * 0.15;
          const tilt = (game.playerContainer.position.x - game.targetX) * 0.1;
          game.player.rotation.z = tilt;

          if (isFlying) {
              game.flightTimer--;
              game.playerContainer.position.y += (4.0 - game.playerContainer.position.y) * 0.05;
              
              // Smooth flight pose
              game.player.rotation.x = Math.PI / 4; 
              parts.leftArm.rotation.x = Math.PI; parts.rightArm.rotation.x = Math.PI;
              parts.leftLeg.rotation.x = 0.2; parts.rightLeg.rotation.x = 0.2;
              
              // NO MORE EXPLOSION PARTICLES HERE, CLEAN FLIGHT

              if (game.flightTimer <= 0) {
                  game.isJumping = true; 
                  game.jumpVelocity = 0; 
                  game.isInvincible = true; 
                  game.invincibleTimer = 60;
              }
          } else if (game.isJumping) {
            game.playerContainer.position.y += game.jumpVelocity;
            game.jumpVelocity -= game.gravity; 
            game.player.rotation.x -= 0.15; 
            parts.leftArm.rotation.x = -Math.PI / 2; parts.rightArm.rotation.x = -Math.PI / 2;
            parts.leftLeg.rotation.x = -1.5; parts.rightLeg.rotation.x = -1.5;
            if (game.playerContainer.position.y <= 0) {
              game.playerContainer.position.y = 0;
              game.isJumping = false;
              game.jumpVelocity = 0;
              game.player.rotation.x = 0; 
              game.player.rotation.z = 0;
              triggerExplosion(game.playerContainer.position, 0xaaaaaa, true);
              game.cameraShake = 0.2; 
            }
          } else {
            game.playerContainer.position.y = 0;
            game.player.rotation.x = 0; 
            const limbSpeed = runCycle * (1 + game.speed);
            parts.leftLeg.rotation.x = Math.sin(limbSpeed) * 0.8;
            parts.rightLeg.rotation.x = Math.sin(limbSpeed + Math.PI) * 0.8;
            parts.leftArm.rotation.x = Math.sin(limbSpeed + Math.PI) * 0.6;
            parts.rightArm.rotation.x = Math.sin(limbSpeed) * 0.6;
          }

          for (let i = game.obstacles.length - 1; i >= 0; i--) {
            const obj = game.obstacles[i];
            obj.position.z += game.speed;
            if (obj.children[2]) {
                obj.children[2].rotation.x += 0.05;
                obj.children[2].rotation.y += 0.08;
            }
            const dx = Math.abs(obj.position.x - game.playerContainer.position.x);
            const dz = Math.abs(obj.position.z - game.playerContainer.position.z);
            if (dx < 0.6 && dz < 0.6) {
                if (game.playerContainer.position.y < 0.8) {
                    if (!game.isInvincible && !game.isDead) {
                        triggerExplosion(obj.position, 0xff0066); 
                        game.scene.remove(obj);
                        game.obstacles.splice(i, 1);
                        game.healthInternal -= 34;
                        setHealth(Math.max(0, game.healthInternal));
                        game.cameraShake = 0.5; 
                        if (game.healthInternal <= 0) {
                            game.isDead = true; 
                            game.playerContainer.visible = false; 
                            triggerExplosion(game.playerContainer.position, SKINS[currentSkinIndex].colors.armor);
                            setTimeout(() => handleGameOver(), 1200);
                        } else {
                            game.isInvincible = true;
                            game.invincibleTimer = 90; 
                        }
                        continue; 
                    }
                }
            }
            if (obj.position.z > 5) {
              game.scene.remove(obj);
              game.obstacles.splice(i, 1);
              spawnObstacle(-80 - Math.random() * 30); 
            }
          }

          for (let i = game.rockets.length - 1; i >= 0; i--) {
            const rocket = game.rockets[i];
            rocket.position.z += game.speed;
            rocket.rotation.y += 0.05;
            const dx = Math.abs(rocket.position.x - game.playerContainer.position.x);
            const dz = Math.abs(rocket.position.z - game.playerContainer.position.z);
            if (dx < 0.8 && dz < 0.8) {
                game.flightTimer = game.maxFlightTime; 
                game.scene.remove(rocket);
                game.rockets.splice(i, 1);
                triggerExplosion(game.playerContainer.position, 0xffff00, false);
                game.cameraShake = 0.3;
                continue;
            }
             if (rocket.position.z > 5) {
              game.scene.remove(rocket);
              game.rockets.splice(i, 1);
            }
          }

          for (let i = game.coins.length - 1; i >= 0; i--) {
            const coinGroup = game.coins[i];
            coinGroup.position.z += game.speed;
            coinGroup.rotation.y += 0.05; 
            const dx = Math.abs(coinGroup.position.x - game.playerContainer.position.x);
            const dz = Math.abs(coinGroup.position.z - game.playerContainer.position.z);
            let canCollect = false;
            if (isFlying && dx < 1.0 && dz < 1.0) canCollect = true;
            else if (dx < 0.6 && dz < 0.6) {
                 const pY = game.playerContainer.position.y;
                 const cY = coinGroup.position.y;
                 if (Math.abs(pY + 0.5 - cY) < 0.8) canCollect = true;
            }
            if (canCollect) {
              const vector = coinGroup.position.clone();
              vector.project(game.camera); 
              const x = (vector.x * .5 + .5) * window.innerWidth;
              const y = (-(vector.y * .5) + .5) * window.innerHeight;
              setFloatingCoins(prev => [...prev, { id: Date.now(), x, y }]);
              setCoinCount(prev => prev + 1);
              game.scene.remove(coinGroup);
              game.coins.splice(i, 1);
              game.scoreInternal += 50; 
              spawnCoin(-80 - Math.random() * 30);
            } 
            else if (coinGroup.position.z > 5) {
              game.scene.remove(coinGroup);
              game.coins.splice(i, 1);
              spawnCoin(-80 - Math.random() * 30);
            }
          }

      } else if (gameState === 'MENU') {
          game.time += 0.005;
          game.playerContainer.position.y = Math.sin(game.time * 5) * 0.05;
          parts.leftArm.rotation.x = Math.sin(game.time * 5) * 0.1;
          parts.rightArm.rotation.x = Math.cos(game.time * 5) * 0.1;
          game.player.rotation.y = Math.sin(game.time * 2) * 0.1;
          game.grid.position.z = (game.grid.position.z + 0.02) % 10;
      }
      game.renderer.render(game.scene, game.camera);
      game.frameId = requestAnimationFrame(animate);
    };

    if (game.obstacles.length === 0) {
        for(let i = 0; i < 8; i++) { 
            spawnObstacle(-40 - (i * 25)); 
            spawnCoin(-40 - (i * 25) - 10); 
        }
    }
    animate();
    return () => cancelAnimationFrame(game.frameId);
  }, [gameState, loaded]);

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    setHighScore(prev => Math.max(prev, Math.floor(gameRef.current.scoreInternal * 10)));
  };

  const resetGame = () => {
      const game = gameRef.current;
      game.obstacles.forEach(o => game.scene.remove(o));
      game.coins.forEach(c => game.scene.remove(c));
      game.rockets.forEach(r => game.scene.remove(r));
      game.shards.forEach(s => game.scene.remove(s)); 
      game.speedLines.forEach(l => game.scene.remove(l)); // Clear lines
      game.obstacles = [];
      game.coins = [];
      game.rockets = [];
      game.shards = [];
      game.speedLines = [];
      game.currentLane = 1;
      game.playerContainer.position.set(0, 0, 0);
      game.player.rotation.set(0, 0, 0); 
      game.playerContainer.visible = true; 
      game.isDead = false; 
      game.isInvincible = false;
      game.invincibleTimer = 0;
      game.flightTimer = 0; 
      setFlightFuel(0);
      game.healthInternal = 100; 
      game.targetX = 0;
      game.speed = 0.15; 
      game.scoreInternal = 0;
      game.time = 0;
      game.isJumping = false;
      game.jumpVelocity = 0;
      setHealth(100); 
      setScore(0);
      setCoinCount(0); 
      setGameState('PLAYING');
  }

  const handleSwipe = (direction) => {
    if (gameState !== 'PLAYING' || gameRef.current.isDead) return;
    const game = gameRef.current;
    if (direction === 'LEFT' && game.currentLane > 0) game.currentLane--;
    else if (direction === 'RIGHT' && game.currentLane < 2) game.currentLane++;
    else if (direction === 'UP' && !game.isJumping && gameRef.current.flightTimer <= 0) {
      game.isJumping = true;
      game.jumpVelocity = game.jumpPower; 
    }
    game.targetX = game.lanes[game.currentLane];
  };

  const onTouchStart = (e) => touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const diffX = touchStart.current.x - e.changedTouches[0].clientX;
    const diffY = touchStart.current.y - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 30) handleSwipe(diffX > 0 ? 'LEFT' : 'RIGHT');
    } else {
      if (Math.abs(diffY) > 30 && diffY > 0) handleSwipe('UP');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handleSwipe('LEFT');
      if (e.key === 'ArrowRight') handleSwipe('RIGHT');
      if (e.key === 'ArrowUp' || e.code === 'Space') handleSwipe('UP');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const nextSkin = () => setCurrentSkinIndex((prev) => (prev + 1) % SKINS.length);
  const prevSkin = () => setCurrentSkinIndex((prev) => (prev - 1 + SKINS.length) % SKINS.length);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a103c] select-none touch-none font-sans text-white">
      <div ref={mountRef} className="absolute inset-0 z-0" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />

      {/* RENDER FLOATING COINS */}
      {floatingCoins.map(coin => (
          <FloatingCoin 
            key={coin.id} 
            startPos={coin} 
            onComplete={() => setFloatingCoins(prev => prev.filter(c => c.id !== coin.id))} 
          />
      ))}

      {/* HUD CONTAINER */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-10 pointer-events-none">
        
        {/* LEFT: HEALTH */}
        <div className="bg-black/40 backdrop-blur border border-red-500/30 p-2 pr-4 rounded-xl flex items-center gap-3 h-fit">
            <div className={`bg-red-500/20 p-2 rounded-lg ${health < 40 ? 'animate-pulse' : ''}`}>
                <IconHeart size={20} className={health < 40 ? "text-red-500" : "text-red-400"} fill="currentColor" />
            </div>
            <div className="flex flex-col gap-1">
                <div className="text-[10px] text-red-300 uppercase tracking-widest font-bold leading-none">Armor</div>
                <div className="w-24 md:w-32 h-3 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative">
                    <div className={`h-full transition-all duration-300 ease-out ${health > 60 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : health > 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`} style={{ width: `${health}%` }} />
                </div>
            </div>
        </div>

        {/* RIGHT: SCORE, COINS, JETPACK STACKED */}
        <div className="flex flex-col items-end gap-2">
            
            {/* SCORE */}
            <div className="bg-black/40 backdrop-blur border border-cyan-500/30 p-3 rounded-xl min-w-[100px] text-right">
                <div className="text-xs text-cyan-400 uppercase tracking-widest opacity-80 leading-none mb-1">Score</div>
                <div className="text-2xl font-mono font-bold text-cyan-50 shadow-cyan-500/50 drop-shadow-md leading-none">{score}</div>
            </div>

            {/* COIN COUNTER */}
            <div className="bg-black/40 backdrop-blur border border-yellow-500/30 p-2 pl-3 pr-3 rounded-xl flex items-center gap-3">
                 <div className="flex flex-col items-end">
                    <div className="text-[10px] text-yellow-400 uppercase tracking-widest opacity-80 leading-none mb-1">Credits</div>
                    <div className="text-xl font-mono font-bold text-yellow-50 leading-none">{coinCount}</div>
                 </div>
                 <IconCoin size={28} />
            </div>

            {/* JETPACK CIRCULAR INDICATOR (Only visible when has fuel) */}
            <div className={`transition-all duration-500 transform ${flightFuel > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} mt-1`}>
                 <CircularProgress percentage={flightFuel} size={48} icon={IconRocket} strokeWidth={4} />
            </div>

        </div>
      </div>

      {/* MENU */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 w-full max-w-sm animate-in zoom-in duration-300">
            <div className="text-center mb-2">
              <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-white to-purple-400 transform -skew-x-6">
                NEON<br/>RUNNER
              </h1>
              <div className="text-xs text-cyan-500 tracking-[0.5em] font-bold mt-2">JETPACK UPDATE</div>
            </div>

            <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-2xl w-full flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <div className="text-xs text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                    <IconPalette size={14} /> Character Skin
                </div>
                
                <div className="flex items-center justify-between w-full">
                    <button onClick={prevSkin} className="p-2 hover:bg-white/10 rounded-full transition"><IconChevronLeft /></button>
                    
                    <div className="text-center">
                        <div className="text-xl font-bold text-white font-mono" style={{ color: '#' + SKINS[currentSkinIndex].colors.armor.toString(16) }}>
                            {SKINS[currentSkinIndex].name}
                        </div>
                    </div>
                    
                    <button onClick={nextSkin} className="p-2 hover:bg-white/10 rounded-full transition"><IconChevronRight /></button>
                </div>
            </div>

            <button 
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform p-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 mt-2"
            >
              <IconPlay fill="currentColor" size={20}/> START MISSION
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-950/60 backdrop-blur-md">
           <div className="text-center p-8 bg-black/60 border border-red-500/30 rounded-3xl shadow-2xl max-w-xs w-full">
              <IconSkull size={64} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-red-100">CRITICAL FAILURE</h2>
              <div className="flex justify-center gap-4 my-4">
                  <div className="text-center">
                      <div className="text-xs text-cyan-400 uppercase">Score</div>
                      <div className="text-3xl font-black text-white">{score}</div>
                  </div>
                  <div className="text-center border-l border-white/20 pl-4">
                      <div className="text-xs text-yellow-400 uppercase">Credits</div>
                      <div className="text-3xl font-black text-white">{coinCount}</div>
                  </div>
              </div>
              <button 
                onClick={resetGame}
                className="w-full bg-red-600 hover:bg-red-500 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition"
              >
                <IconRotateCcw size={20}/> REBOOT SYSTEM
              </button>
              <button 
                onClick={() => setGameState('MENU')}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition text-sm"
              >
                ABORT MISSION
              </button>
           </div>
        </div>
      )}

      {!loaded && <div className="absolute inset-0 z-50 bg-black flex items-center justify-center text-cyan-500 font-mono text-sm tracking-widest">LOADING ASSETS...</div>}
    </div>
  );
};

export default NeonRunner;
