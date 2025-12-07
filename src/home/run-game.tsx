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

/**
 * NEON RUNNER - SMOOTH EDITION (NO SHAKE)
 */

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
  const [loaded, setLoaded] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);

  // Refs for Game Engine
  const mountRef = useRef(null);
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerParts: {}, 
    materials: {}, 
    lanes: [-2, 0, 2],
    currentLane: 1,
    targetX: 0,
    speed: 0.15,
    obstacles: [],
    coins: [],
    particles: [],
    shards: [],
    frameId: null,
    isJumping: false,
    isDead: false,
    
    // Health Logic
    healthInternal: 100,
    isInvincible: false,
    invincibleTimer: 0,
    
    jumpVelocity: 0,
    gravity: 0.018,
    scoreInternal: 0,
    time: 0,
    geometries: {},
    // REMOVED cameraShake
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

  // --- SKIN UPDATE EFFECT ---
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
    
    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a103c); 
    scene.fog = new THREE.FogExp2(0x1a103c, 0.02);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, 0, -4);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff00ff, 0.9);
    dirLight.position.set(-10, 25, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    // 5. Grid Floor
    const gridHelper = new THREE.GridHelper(200, 50, 0x00d5ff, 0x2d004d);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // --- 6. CHARACTER CREATION ---
    const createCharacter = () => {
        const group = new THREE.Group();
        const initialSkin = SKINS[0];
        
        const armorMat = new THREE.MeshStandardMaterial({ 
            color: initialSkin.colors.armor, 
            emissive: initialSkin.colors.armor, 
            emissiveIntensity: 0.5, 
            roughness: 0.3, 
            metalness: 0.8 
        });
        const jointMat = new THREE.MeshStandardMaterial({ 
            color: initialSkin.colors.joint, roughness: 0.8 
        });
        const visorMat = new THREE.MeshStandardMaterial({ 
            color: initialSkin.colors.visor, emissive: initialSkin.colors.visor, emissiveIntensity: 2.0 
        });

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

        const createLimb = (w, h, d, x, y, z) => {
            const limbGroup = new THREE.Group();
            limbGroup.position.set(x, y, z);
            const geo = new THREE.BoxGeometry(w, h, d);
            geo.translate(0, -h/2, 0); 
            const mesh = new THREE.Mesh(geo, armorMat);
            mesh.castShadow = true;
            limbGroup.add(mesh);
            return limbGroup;
        };

        const leftArm = createLimb(0.12, 0.4, 0.12, -0.3, 0.7, 0);
        const rightArm = createLimb(0.12, 0.4, 0.12, 0.3, 0.7, 0);
        group.add(leftArm);
        group.add(rightArm);

        const leftLeg = createLimb(0.14, 0.5, 0.14, -0.12, 0.25, 0);
        const rightLeg = createLimb(0.14, 0.5, 0.14, 0.12, 0.25, 0);
        group.add(leftLeg);
        group.add(rightLeg);

        const light = new THREE.PointLight(initialSkin.colors.light, 0.8, 3);
        light.position.set(0, 0.5, 0);
        group.add(light);
        game.playerLight = light;

        return { mesh: group, parts: { body, head: headGroup, leftArm, rightArm, leftLeg, rightLeg } };
    };

    const charData = createCharacter();
    const player = charData.mesh;
    game.playerParts = charData.parts;
    player.position.y = 0;
    scene.add(player);

    // Cache Geometries
    game.geometries = {
      cube: new THREE.BoxGeometry(0.7, 0.7, 0.7),
      core: new THREE.BoxGeometry(0.35, 0.35, 0.35),
      coinDiamond: new THREE.OctahedronGeometry(0.2, 0), 
      coinRing: new THREE.TorusGeometry(0.3, 0.02, 8, 24),
      shard: new THREE.BoxGeometry(0.2, 0.2, 0.2), 
      smallShard: new THREE.BoxGeometry(0.1, 0.1, 0.1)
    };

    // Particle System (Dust)
    const particleGeometry = new THREE.BufferGeometry();
    const particlesCount = 80;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const pMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    for (let i = 0; i < particlesCount * 3; i++) positions[i] = 0;
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleSystem = new THREE.Points(particleGeometry, pMaterial);
    scene.add(particleSystem);
    game.particleSystem = particleSystem;

    game.scene = scene;
    game.camera = camera;
    game.renderer = renderer;
    game.player = player;
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

  // Game Logic
  useEffect(() => {
    if (!loaded) return;
    
    const THREE = window.THREE;
    const game = gameRef.current;

    // --- TRIGGER EXPLOSION ---
    const triggerExplosion = (pos, colorHex = 0xffffff) => {
        const shardMat = new THREE.MeshBasicMaterial({ 
            color: colorHex, 
            transparent: true,
            opacity: 1
        });
        
        // Tăng số lượng mảnh vỡ lên một chút để cảm giác "đã" hơn
        for (let i = 0; i < 20; i++) {
            const geom = Math.random() > 0.5 ? game.geometries.shard : game.geometries.smallShard;
            const mesh = new THREE.Mesh(geom, shardMat);
            
            mesh.position.copy(pos);
            mesh.position.x += (Math.random() - 0.5) * 0.5;
            mesh.position.y += (Math.random() - 0.5) * 0.5;
            mesh.position.z += (Math.random() - 0.5) * 0.5;
            
            // Tinh chỉnh lực nổ để bay về phía trước theo quán tính nhiều hơn
            mesh.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 1.0,  // X spread rộng hơn
                Math.random() * 0.5 + 0.3,    // Bay lên cao
                game.speed * 2 + Math.random() * 0.5 // Bay theo hướng chướng ngại vật (về phía camera)
            );
            
            mesh.userData.rotVel = {
                x: (Math.random() - 0.5) * 0.8,
                y: (Math.random() - 0.5) * 0.8,
                z: (Math.random() - 0.5) * 0.8
            };
            
            game.scene.add(mesh);
            game.shards.push(mesh);
        }
    }

    // --- OBSTACLE SPAWNER ---
    const spawnObstacle = (zPos) => {
      const neonPink = 0xff0066;
      const mesh = new THREE.Group();

      const shellMat = new THREE.MeshPhysicalMaterial({
             color: 0x000000, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.4, transmission: 0.3
      });
      const shell = new THREE.Mesh(game.geometries.cube, shellMat);
      mesh.add(shell);

      const edges = new THREE.EdgesGeometry(game.geometries.cube);
      const cageMat = new THREE.LineBasicMaterial({ color: neonPink });
      const cage = new THREE.LineSegments(edges, cageMat);
      mesh.add(cage);

      const coreMat = new THREE.MeshStandardMaterial({ 
          color: 0x000000, emissive: 0x000000, roughness: 0.0, metalness: 1.0 
      }); 
      const core = new THREE.Mesh(game.geometries.core, coreMat);
      core.userData = { isRotator: true }; 
      mesh.add(core);

      mesh.position.y = 0.35;
      const laneIndex = Math.floor(Math.random() * 3);
      mesh.position.x = game.lanes[laneIndex];
      mesh.position.z = zPos;
      
      mesh.children.forEach(c => {
          if (c.type === 'Mesh') {
              c.castShadow = true;
              c.receiveShadow = true;
          }
      });

      mesh.userData = { type: 'obstacle', shape: 'CUBE', height: 0.7 };
      game.scene.add(mesh);
      game.obstacles.push(mesh);
    };

    // --- COIN SPAWNER ---
    const spawnCoin = (zPos) => {
      const coinGroup = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.8, metalness: 1, roughness: 0.1 
      });

      const diamond = new THREE.Mesh(game.geometries.coinDiamond, goldMat);
      coinGroup.add(diamond);
      const ring = new THREE.Mesh(game.geometries.coinRing, goldMat);
      coinGroup.add(ring);
      
      coinGroup.userData = { isCoinGroup: true, diamond: diamond, ring: ring };

      const laneIndex = Math.floor(Math.random() * 3);
      coinGroup.position.x = game.lanes[laneIndex];
      coinGroup.position.z = zPos;
      const isAirCoin = Math.random() > 0.6;
      coinGroup.position.y = isAirCoin ? 2.2 : 0.5;
      coinGroup.userData = { ...coinGroup.userData, type: 'coin', isAir: isAirCoin };
      
      game.scene.add(coinGroup);
      game.coins.push(coinGroup);
    }

    // --- GAME LOOP ---
    const animate = () => {
      const parts = game.playerParts;
      
      // Update Shards
      for (let i = game.shards.length - 1; i >= 0; i--) {
        const shard = game.shards[i];
        shard.position.add(shard.userData.velocity);
        shard.rotation.x += shard.userData.rotVel.x;
        shard.rotation.y += shard.userData.rotVel.y;
        shard.rotation.z += shard.userData.rotVel.z;
        shard.userData.velocity.y -= 0.03; // Trọng lực nhẹ hơn để bay lâu hơn
        
        if (shard.position.y < 0) {
            shard.position.y = 0;
            shard.userData.velocity.y *= -0.5; 
            shard.userData.velocity.x *= 0.95; // Giảm ma sát để trượt trên sàn
        }

        if (shard.position.y < -5 || Math.abs(shard.position.z - game.player.position.z) > 25) {
            game.scene.remove(shard);
            game.shards.splice(i, 1);
        }
      }

      // Smooth Camera Follow Only (No Shake)
      game.camera.position.x += (game.player.position.x * 0.3 - game.camera.position.x) * 0.1;

      if (gameState === 'PLAYING') {
          if (game.isDead) {
              game.renderer.render(game.scene, game.camera);
              game.frameId = requestAnimationFrame(animate);
              return;
          }

          // --- INVINCIBILITY LOGIC ---
          if (game.isInvincible) {
              game.invincibleTimer--;
              game.player.visible = Math.floor(Date.now() / 50) % 2 === 0;
              
              if (game.invincibleTimer <= 0) {
                  game.isInvincible = false;
                  game.player.visible = true;
              }
          } else {
              game.player.visible = true;
          }

          const runCycle = game.time * 20;
          game.time += 0.01;
          game.scoreInternal += game.speed;
          setScore(Math.floor(game.scoreInternal * 10));

          if (game.speed < 0.6) game.speed += 0.00003;
          game.grid.position.z = (game.grid.position.z + game.speed) % 10;
          game.player.position.x += (game.targetX - game.player.position.x) * 0.2;

          // Physics & Anim
          if (game.isJumping) {
            game.player.position.y += game.jumpVelocity;
            game.jumpVelocity -= game.gravity; 
            parts.leftArm.rotation.x = Math.PI; parts.rightArm.rotation.x = Math.PI;
            parts.leftLeg.rotation.x = -0.5; parts.rightLeg.rotation.x = -0.2;

            if (game.player.position.y <= 0) {
              game.player.position.y = 0;
              game.isJumping = false;
              game.jumpVelocity = 0;
            }
          } else {
            game.player.position.y = 0;
            game.player.rotation.z = (game.player.position.x - game.targetX) * -0.1; 
            parts.leftLeg.rotation.x = Math.sin(runCycle) * 0.8;
            parts.rightLeg.rotation.x = Math.sin(runCycle + Math.PI) * 0.8;
            parts.leftArm.rotation.x = Math.sin(runCycle + Math.PI) * 0.6;
            parts.rightArm.rotation.x = Math.sin(runCycle) * 0.6;
          }

          // Move Obstacles
          for (let i = game.obstacles.length - 1; i >= 0; i--) {
            const obj = game.obstacles[i];
            obj.position.z += game.speed;
            
            obj.children.forEach(child => {
                if (child.userData.isRotator) {
                    child.rotation.x += 0.05;
                    child.rotation.y += 0.08;
                }
            });

            const dx = Math.abs(obj.position.x - game.player.position.x);
            const dz = Math.abs(obj.position.z - game.player.position.z);
            
            // --- COLLISION DETECTION ---
            if (dx < 0.6 && dz < 0.6) {
                if (game.player.position.y + 0.1 < 0.7) {
                    
                    if (!game.isInvincible && !game.isDead) {
                        
                        // 1. NỔ CUBE (MÀU HỒNG ĐẬM)
                        triggerExplosion(obj.position, 0xff0066); 
                        
                        // 2. XÓA CUBE NGAY LẬP TỨC (MƯỢT)
                        game.scene.remove(obj);
                        game.obstacles.splice(i, 1);
                        
                        // 3. TRỪ MÁU
                        game.healthInternal -= 34;
                        setHealth(Math.max(0, game.healthInternal));
                        
                        // 4. KIỂM TRA CHẾT
                        if (game.healthInternal <= 0) {
                            game.isDead = true; 
                            game.player.visible = false; 
                            triggerExplosion(game.player.position, SKINS[currentSkinIndex].colors.armor);
                            // KHÔNG CÒN RUNG
                            setTimeout(() => handleGameOver(), 1200);
                        } else {
                            game.isInvincible = true;
                            game.invincibleTimer = 90; 
                            // KHÔNG CÒN RUNG
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

          // Move Coins
          for (let i = game.coins.length - 1; i >= 0; i--) {
            const coinGroup = game.coins[i];
            coinGroup.position.z += game.speed;
            
            coinGroup.rotation.y += 0.02;
            if (coinGroup.userData.diamond) {
                coinGroup.userData.diamond.rotation.x += 0.04;
                coinGroup.userData.diamond.rotation.z += 0.04;
            }
            if (coinGroup.userData.ring) {
                coinGroup.userData.ring.rotation.x += 0.02;
            }

            const dx = Math.abs(coinGroup.position.x - game.player.position.x);
            const dz = Math.abs(coinGroup.position.z - game.player.position.z);
            let canCollect = false;
            if (dx < 0.6 && dz < 0.6) {
                 if (coinGroup.userData.isAir) {
                     if (game.player.position.y > 1.2) canCollect = true;
                 } else {
                     if (game.player.position.y < 1.0) canCollect = true;
                 }
            }
            if (canCollect) {
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
          game.player.position.y = Math.sin(game.time * 5) * 0.05;
          parts.leftArm.rotation.x = Math.sin(game.time * 5) * 0.1;
          parts.rightArm.rotation.x = Math.cos(game.time * 5) * 0.1;
          parts.leftLeg.rotation.x = 0;
          parts.rightLeg.rotation.x = 0;
          game.player.rotation.z = 0;
          game.player.rotation.y = Math.sin(game.time * 2) * 0.1;
          game.grid.position.z = (game.grid.position.z + 0.02) % 10;
      }
      
      const pPositions = game.particleSystem.geometry.attributes.position.array;
      for (let i = game.particles.length - 1; i >= 0; i--) {
          const p = game.particles[i];
          pPositions[p.index * 3 + 2] += (gameState === 'PLAYING' && !game.isDead ? game.speed : 0.05) * 0.8; 
          p.life -= 0.05;
          if (p.life <= 0) {
             pPositions[p.index * 3 + 1] = -100;
             game.particles.splice(i, 1);
          }
      }
      game.particleSystem.geometry.attributes.position.needsUpdate = true;
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
      game.shards.forEach(s => game.scene.remove(s)); 
      game.obstacles = [];
      game.coins = [];
      game.shards = [];
      game.currentLane = 1;
      game.player.position.set(0, 0, 0);
      game.player.rotation.set(0, 0, 0);
      game.player.visible = true; 
      game.isDead = false; 
      game.isInvincible = false;
      game.invincibleTimer = 0;
      game.healthInternal = 100; 
      game.targetX = 0;
      game.speed = 0.15; 
      game.scoreInternal = 0;
      game.time = 0;
      game.isJumping = false;
      game.jumpVelocity = 0;
      setHealth(100); 
      setScore(0);
      setGameState('PLAYING');
  }

  const handleSwipe = (direction) => {
    if (gameState !== 'PLAYING' || gameRef.current.isDead) return;
    const game = gameRef.current;
    if (direction === 'LEFT' && game.currentLane > 0) game.currentLane--;
    else if (direction === 'RIGHT' && game.currentLane < 2) game.currentLane++;
    else if (direction === 'UP' && !game.isJumping) {
      game.isJumping = true;
      game.jumpVelocity = 0.32; 
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

      {/* HUD - TOP LEFT: HEALTH & SCORE */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-10 pointer-events-none">
        
        {/* PLAYER STATS BLOCK */}
        <div className="flex flex-col gap-2">
            {/* HEALTH BAR */}
            <div className="bg-black/40 backdrop-blur border border-red-500/30 p-2 pr-4 rounded-xl flex items-center gap-3">
                <div className={`bg-red-500/20 p-2 rounded-lg ${health < 40 ? 'animate-pulse' : ''}`}>
                    <IconHeart size={20} className={health < 40 ? "text-red-500" : "text-red-400"} fill="currentColor" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-[10px] text-red-300 uppercase tracking-widest font-bold leading-none">Armor Integrity</div>
                    <div className="w-32 h-3 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative">
                        {/* Background Stripes */}
                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '10px 10px'}}></div>
                        {/* Health Fill */}
                        <div 
                            className={`h-full transition-all duration-300 ease-out ${health > 60 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : health > 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}
                            style={{ width: `${health}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* SCORE BLOCK */}
            <div className="bg-black/40 backdrop-blur border border-cyan-500/30 p-3 rounded-xl w-fit">
                <div className="text-xs text-cyan-400 uppercase tracking-widest opacity-80 leading-none mb-1">Score</div>
                <div className="text-2xl font-mono font-bold text-cyan-50 shadow-cyan-500/50 drop-shadow-md leading-none">{score}</div>
            </div>
        </div>

        {/* HIGH SCORE BLOCK */}
        {highScore > 0 && (
          <div className="bg-black/40 backdrop-blur border border-yellow-500/30 p-3 rounded-xl flex items-center gap-3">
             <IconTrophy size={18} className="text-yellow-400" />
             <div>
                <div className="text-xs text-yellow-400 uppercase tracking-widest opacity-80 leading-none mb-1">Best</div>
                <div className="text-xl font-mono font-bold text-yellow-50 leading-none">{highScore}</div>
             </div>
          </div>
        )}
      </div>

      {/* MENU & SKIN SELECTOR */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 w-full max-w-sm animate-in zoom-in duration-300">
            <div className="text-center mb-2">
              <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-white to-purple-400 transform -skew-x-6">
                NEON<br/>RUNNER
              </h1>
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
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">Robot Model T-{currentSkinIndex + 1}00</div>
                    </div>
                    
                    <button onClick={nextSkin} className="p-2 hover:bg-white/10 rounded-full transition"><IconChevronRight /></button>
                </div>

                <div className="flex gap-2 mt-1">
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: '#' + SKINS[currentSkinIndex].colors.armor.toString(16)}}></div>
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: '#' + SKINS[currentSkinIndex].colors.visor.toString(16)}}></div>
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: '#' + SKINS[currentSkinIndex].colors.joint.toString(16)}}></div>
                </div>
            </div>

            <button 
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform p-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 mt-2"
            >
              <IconPlay fill="currentColor" size={20}/> START MISSION
            </button>
            
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 w-full text-center">
               <span>Jump</span>
               <span>High Jump</span>
               <span>Dodge</span>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-950/60 backdrop-blur-md">
           <div className="text-center p-8 bg-black/60 border border-red-500/30 rounded-3xl shadow-2xl max-w-xs w-full">
              <IconSkull size={64} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-red-100">CRITICAL FAILURE</h2>
              <div className="text-5xl font-black text-white my-4">{score}</div>
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
