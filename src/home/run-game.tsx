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

// --- HUD COMPONENTS ---
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

const FloatingCoin = ({ startPos, onComplete }) => {
    const [style, setStyle] = useState({ top: startPos.y, left: startPos.x, opacity: 1, transform: 'scale(1)' });
    useEffect(() => {
        const timer = setTimeout(() => {
            setStyle({ top: '90px', left: 'calc(100% - 40px)', opacity: 0.2, transform: 'scale(0.5)' });
        }, 50);
        const removeTimer = setTimeout(onComplete, 800); 
        return () => { clearTimeout(timer); clearTimeout(removeTimer); };
    }, []);
    return (
        <div className="fixed z-50 transition-all duration-700 ease-in-out pointer-events-none" style={style}>
            <IconCoin size={24} />
        </div>
    );
};

const NeonRunner = () => {
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100); 
  const [coinCount, setCoinCount] = useState(0); 
  const [floatingCoins, setFloatingCoins] = useState([]); 
  const [flightFuel, setFlightFuel] = useState(0); 
  const [loaded, setLoaded] = useState(false);
  
  const mountRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0 });

  const gameRef = useRef({
    scene: null, camera: null, renderer: null,
    player: null, playerContainer: null, playerParts: {}, materials: {}, 
    lanes: [-2, 0, 2], currentLane: 1, targetX: 0,
    speed: 0.20,
    obstacles: [], coins: [], rockets: [], speedLines: [], shards: [],
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
    
    // Setup Scene - BRIGHTER
    const scene = new THREE.Scene();
    const bgColor = 0x2b2146; // Twilight Purple - much lighter than before
    scene.background = new THREE.Color(bgColor); 
    scene.fog = new THREE.FogExp2(bgColor, 0.02); // Less dense fog

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 9);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Standard encoding for brighter colors, not sRGB encoded output which can sometimes look dark without proper HDR setup
    renderer.outputEncoding = THREE.LinearEncoding; 
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING SETUP (MAJOR UPGRADE) ---
    
    // 1. Hemisphere Light (Sky + Ground bounce) - Fills shadows
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 2. Ambient Light - General brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);

    // 3. Directional Light - The Sun/Moon
    const dirLight = new THREE.DirectionalLight(0xffddaa, 1.2); // Warm sunlight
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 4. Back Light - Rim lighting for character
    const backLight = new THREE.DirectionalLight(0x0088ff, 0.8); // Blue rim light
    backLight.position.set(-5, 10, -10);
    scene.add(backLight);

    // Infinite Grid - BRIGHTER LINES
    const gridHelper = new THREE.GridHelper(300, 60, 0x88ccff, 0x443366);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // --- CHARACTER DESIGN (MATTE FINISH) ---
    const createCharacter = () => {
        const container = new THREE.Group(); 
        const group = new THREE.Group();
        container.add(group);

        // Materials - Matte / Non-shiny
        const armorMat = new THREE.MeshStandardMaterial({ 
            color: 0x333333, // Slightly lighter grey
            roughness: 0.6, 
            metalness: 0.1 
        });
        
        const glowMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff // Neon Cyan
        });
        
        const jointMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        });

        game.materials = { armor: armorMat, glow: glowMat, joint: jointMat };

        // 1. Torso
        const torsoGeo = new THREE.CylinderGeometry(0.32, 0.18, 0.55, 6);
        const torso = new THREE.Mesh(torsoGeo, armorMat);
        torso.position.y = 0.6;
        torso.castShadow = true;
        group.add(torso);

        // Core (Chest light)
        const coreGeo = new THREE.BoxGeometry(0.15, 0.15, 0.1);
        const core = new THREE.Mesh(coreGeo, glowMat);
        core.position.set(0, 0.65, -0.22); // Front
        group.add(core);

        // 2. Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.0, 0);
        
        const headGeo = new THREE.BoxGeometry(0.24, 0.28, 0.3);
        const head = new THREE.Mesh(headGeo, armorMat);
        head.castShadow = true;
        
        // Visor
        const visorGeo = new THREE.BoxGeometry(0.2, 0.08, 0.05);
        const visor = new THREE.Mesh(visorGeo, glowMat);
        visor.position.set(0, 0.02, -0.16); 
        
        headGroup.add(head);
        headGroup.add(visor);
        group.add(headGroup);

        // 3. Jetpack
        const packGroup = new THREE.Group();
        packGroup.position.set(0, 0.7, 0.18);
        const packGeo = new THREE.BoxGeometry(0.25, 0.35, 0.15);
        const pack = new THREE.Mesh(packGeo, armorMat);
        packGroup.add(pack);

        const flameGeo = new THREE.ConeGeometry(0.06, 0.5, 8);
        flameGeo.rotateX(Math.PI);
        const f1 = new THREE.Mesh(flameGeo, glowMat); f1.position.set(-0.08, -0.3, 0);
        const f2 = new THREE.Mesh(flameGeo, glowMat); f2.position.set(0.08, -0.3, 0);
        f1.visible = false; f2.visible = false;
        packGroup.add(f1); packGroup.add(f2);
        group.add(packGroup);

        // 4. Limbs
        const createLimb = (w, h, x, y, z) => {
            const g = new THREE.Group();
            g.position.set(x, y, z);
            
            const jGeo = new THREE.SphereGeometry(w*1.2, 8, 8);
            const j = new THREE.Mesh(jGeo, jointMat);
            g.add(j);
            
            const lGeo = new THREE.BoxGeometry(w, h, w);
            lGeo.translate(0, -h/2, 0);
            const l = new THREE.Mesh(lGeo, armorMat);
            l.castShadow = true;
            g.add(l);
            return g;
        };

        const leftArm = createLimb(0.09, 0.38, -0.32, 0.85, 0);
        const rightArm = createLimb(0.09, 0.38, 0.32, 0.85, 0);
        const leftLeg = createLimb(0.11, 0.48, -0.12, 0.3, 0);
        const rightLeg = createLimb(0.11, 0.48, 0.12, 0.3, 0);

        group.add(leftArm); group.add(rightArm); group.add(leftLeg); group.add(rightLeg);

        return { 
            container, mesh: group, 
            parts: { 
                head: headGroup, leftArm, rightArm, leftLeg, rightLeg, 
                flame1: f1, flame2: f2 
            } 
        };
    };

    const charData = createCharacter();
    game.player = charData.mesh;
    game.playerContainer = charData.container;
    game.playerParts = charData.parts;
    charData.container.position.y = 0;
    scene.add(charData.container);

    // Geometries
    game.geometries = {
      cube: new THREE.BoxGeometry(0.7, 0.7, 0.7),
      coin: new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
      rocket: new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8),
      shard: new THREE.TetrahedronGeometry(0.1),
      speedLine: new THREE.BoxGeometry(0.04, 0.04, 5) 
    };
    
    // Brighter materials for obstacles
    game.cachedMaterials.obstacle = new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.4 });
    game.cachedMaterials.obstacleWire = new THREE.LineBasicMaterial({ color: 0xff88aa });
    game.cachedMaterials.coin = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    game.cachedMaterials.rocket = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    game.cachedMaterials.speedLine = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }); // More visible lines

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
      const edges = new THREE.EdgesGeometry(game.geometries.cube);
      const line = new THREE.LineSegments(edges, game.cachedMaterials.obstacleWire);
      group.add(line);
      group.position.set(game.lanes[Math.floor(Math.random() * 3)], 0.35, zPos);
      game.scene.add(group);
      game.obstacles.push(group);
    };

    const spawnCoin = (zPos) => {
      if (Math.random() < 0.05) {
          const rocket = new THREE.Mesh(game.geometries.rocket, game.cachedMaterials.rocket);
          rocket.rotation.x = Math.PI / 2;
          rocket.position.set(game.lanes[Math.floor(Math.random() * 3)], 1.0, zPos);
          game.scene.add(rocket);
          game.rockets.push(rocket);
          return;
      }
      const coin = new THREE.Mesh(game.geometries.coin, game.cachedMaterials.coin);
      coin.rotation.z = Math.PI / 2;
      const isAir = Math.random() > 0.6;
      coin.position.set(game.lanes[Math.floor(Math.random() * 3)], isAir ? 2.5 : 0.6, zPos);
      
      const group = new THREE.Group();
      group.add(coin);
      group.position.copy(coin.position);
      coin.position.set(0,0,0);
      
      game.scene.add(group);
      game.coins.push(group);
    }

    const triggerExplosion = (pos, color) => {
        for(let i=0; i<8; i++) {
            const m = new THREE.Mesh(game.geometries.shard, new THREE.MeshBasicMaterial({ color: color }));
            m.position.copy(pos);
            m.userData.vel = new THREE.Vector3((Math.random()-.5), Math.random(), (Math.random()-.5));
            game.scene.add(m);
            game.shards.push(m);
        }
    }

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

      for (let i = game.shards.length - 1; i >= 0; i--) {
          game.shards[i].position.add(game.shards[i].userData.vel);
          game.shards[i].userData.vel.y -= 0.03;
          if(game.shards[i].position.y < -5) {
              game.scene.remove(game.shards[i]);
              game.shards.splice(i, 1);
          }
      }

      // Camera Follow
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

          // Player Movement - Balanced
          game.playerContainer.position.x += (game.targetX - game.playerContainer.position.x) * 0.15;
          const turnTilt = (game.playerContainer.position.x - game.targetX) * -0.08;
          game.player.rotation.z = turnTilt; 
          const runLean = -0.05;
          game.player.rotation.x = runLean;

          const isFlying = game.flightTimer > 0;

          if (isFlying) {
              game.flightTimer--;
              game.playerContainer.position.y += (4.0 - game.playerContainer.position.y) * 0.05;
              
              game.player.rotation.x = 0.5; // Fly up pose
              parts.leftArm.rotation.x = 3.0; parts.rightArm.rotation.x = 3.0; 
              parts.leftLeg.rotation.x = 0.5; parts.rightLeg.rotation.x = 0.5;
              
              parts.flame1.visible = true; parts.flame2.visible = true;
              parts.flame1.scale.y = 1 + Math.random(); parts.flame2.scale.y = 1 + Math.random();

              if (game.flightTimer <= 0) {
                  game.isJumping = true; game.jumpVelocity = 0; game.isInvincible = true; game.invincibleTimer = 60;
              }
          } else {
              parts.flame1.visible = false; parts.flame2.visible = false;
              
              if (game.isJumping) {
                  game.playerContainer.position.y += game.jumpVelocity;
                  game.jumpVelocity -= game.gravity;
                  game.player.rotation.x = 0;
                  parts.leftLeg.rotation.x = -0.5; parts.rightLeg.rotation.x = -1.0;
                  parts.leftArm.rotation.x = -2.0; parts.rightArm.rotation.x = -2.0;

                  if (game.playerContainer.position.y <= 0) {
                      game.playerContainer.position.y = 0;
                      game.isJumping = false;
                      game.jumpVelocity = 0;
                      triggerExplosion(game.playerContainer.position, 0xaaaaaa);
                  }
              } else {
                  // Run Animation
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
                  if (idx > 0) obj.rotation.y += 0.08; 

                  if (checkCollision(obj, 0.6)) {
                      if (idx === 0) { // Obstacle
                          if (game.playerContainer.position.y < 0.8 && !game.isInvincible && !isFlying) {
                              game.healthInternal -= 34;
                              setHealth(Math.max(0, game.healthInternal));
                              game.cameraShake = 0.5;
                              triggerExplosion(obj.position, 0xff3366);
                              game.scene.remove(obj); arr.splice(i, 1);
                              if (game.healthInternal <= 0) {
                                  game.isDead = true;
                                  game.playerContainer.visible = false;
                                  setTimeout(() => setGameState('GAMEOVER'), 1000);
                              } else {
                                  game.isInvincible = true; game.invincibleTimer = 60;
                              }
                          }
                      } else if (idx === 1) { // Coin
                          const dy = Math.abs(obj.position.y - (game.playerContainer.position.y + 0.5));
                          if (dy < 1.2) {
                              const vec = obj.position.clone().project(game.camera);
                              const x = (vec.x * .5 + .5) * window.innerWidth;
                              const y = (-(vec.y * .5) + .5) * window.innerHeight;
                              setFloatingCoins(p => [...p, { id: Date.now(), x, y }]);
                              setCoinCount(p => p + 1);
                              setScore(p => p + 100);
                              game.scene.remove(obj); arr.splice(i, 1);
                          }
                      } else if (idx === 2) { // Rocket
                          game.flightTimer = game.maxFlightTime;
                          triggerExplosion(game.playerContainer.position, 0x00ffff);
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
      [game.obstacles, game.coins, game.rockets, game.shards, game.speedLines].forEach(arr => arr.forEach(o => game.scene.remove(o)));
      game.obstacles = []; game.coins = []; game.rockets = []; game.shards = []; game.speedLines = [];
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

      {floatingCoins.map(c => <FloatingCoin key={c.id} startPos={c} onComplete={() => setFloatingCoins(p => p.filter(i => i.id !== c.id))} />)}

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
            <div className="bg-black/40 backdrop-blur border border-yellow-500/30 p-2 px-3 rounded-xl flex items-center gap-3">
                 <div className="text-xl font-mono font-bold text-yellow-400">{coinCount}</div>
                 <IconCoin size={24} />
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
