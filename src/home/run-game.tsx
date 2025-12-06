import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Play, RotateCcw, Zap, Skull, Box, Hexagon, Triangle, Palette, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * NEON RUNNER - SKIN SHOP EDITION
 * New Features:
 * - Skin Selector in Menu
 * - Real-time Character Preview
 * - 5 Unique Robot Skins
 */

// --- DỮ LIỆU SKIN ---
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
  const [loaded, setLoaded] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0); // State cho Skin

  // Refs for Game Engine
  const mountRef = useRef(null);
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerParts: {}, 
    materials: {}, // Lưu trữ materials để đổi màu
    lanes: [-2, 0, 2],
    currentLane: 1,
    targetX: 0,
    speed: 0.15,
    obstacles: [],
    coins: [],
    particles: [], 
    frameId: null,
    isJumping: false,
    jumpVelocity: 0,
    gravity: 0.018,
    scoreInternal: 0,
    time: 0,
    geometries: {}
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
  // Mỗi khi đổi skin ở menu, cập nhật màu cho Robot ngay lập tức
  useEffect(() => {
      if (!loaded || !gameRef.current.materials.armor) return;
      
      const skin = SKINS[currentSkinIndex];
      const mats = gameRef.current.materials;

      // Update Armor Color
      mats.armor.color.setHex(skin.colors.armor);
      mats.armor.emissive.setHex(skin.colors.armor);
      
      // Update Joint Color
      mats.joint.color.setHex(skin.colors.joint);

      // Update Visor Color
      mats.visor.color.setHex(skin.colors.visor);
      mats.visor.emissive.setHex(skin.colors.visor);

      // Update Internal Light
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

    // --- 6. CHARACTER CREATION WITH SKINS ---
    const createCharacter = () => {
        const group = new THREE.Group();
        
        // Init Materials (Lưu vào ref để đổi màu sau này)
        const initialSkin = SKINS[0];
        
        const armorMat = new THREE.MeshStandardMaterial({ 
            color: initialSkin.colors.armor, 
            emissive: initialSkin.colors.armor, 
            emissiveIntensity: 0.5, 
            roughness: 0.3, 
            metalness: 0.8 
        });
        const jointMat = new THREE.MeshStandardMaterial({ 
            color: initialSkin.colors.joint, 
            roughness: 0.8 
        });
        const visorMat = new THREE.MeshStandardMaterial({ 
            color: initialSkin.colors.visor, 
            emissive: initialSkin.colors.visor, 
            emissiveIntensity: 2.0 
        });

        // Store materials globally
        game.materials = { armor: armorMat, joint: jointMat, visor: visorMat };

        // A. Body
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.5, 0.25);
        const body = new THREE.Mesh(bodyGeo, armorMat);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);

        // B. Head
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

        // Helper Limb
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

        // Internal Light
        const light = new THREE.PointLight(initialSkin.colors.light, 0.8, 3);
        light.position.set(0, 0.5, 0);
        group.add(light);
        game.playerLight = light; // Store ref

        return { 
            mesh: group, 
            parts: { body, head: headGroup, leftArm, rightArm, leftLeg, rightLeg } 
        };
    };

    const charData = createCharacter();
    const player = charData.mesh;
    game.playerParts = charData.parts;
    
    player.position.y = 0;
    scene.add(player);


    // Cache Geometries
    game.geometries = {
      cube: new THREE.BoxGeometry(0.7, 0.7, 0.7),
      spike: new THREE.ConeGeometry(0.3, 0.5, 4),
      pillar: new THREE.CylinderGeometry(0.25, 0.25, 1.0, 8),
      coin: new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16) 
    };

    // Particle System
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

    // --- OBSTACLE SPAWNER ---
    const spawnObstacle = (zPos) => {
      const type = Math.floor(Math.random() * 3);
      let mesh, mat, shapeType, height;

      const neonPink = 0xff0066;
      const neonOrange = 0xff5500;
      const neonPurple = 0x9900ff;

      switch(type) {
        case 0: // CUBE 
          shapeType = 'CUBE';
          height = 0.7;
          mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, emissive: neonPink, emissiveIntensity: 1.0 
          });
          mesh = new THREE.Mesh(game.geometries.cube, mat);
          mesh.position.y = -0.15; 
          const edges = new THREE.EdgesGeometry(game.geometries.cube);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
          mesh.add(line);
          break;
        case 1: // SPIKE
          shapeType = 'SPIKE';
          height = 0.5;
          mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, emissive: neonOrange, emissiveIntensity: 1.5, metalness: 0.8
          });
          mesh = new THREE.Mesh(game.geometries.spike, mat);
          mesh.position.y = -0.25; 
          break;
        case 2: // PILLAR
          shapeType = 'PILLAR';
          height = 1.0; 
          mat = new THREE.MeshStandardMaterial({ 
             color: 0xaa00ff, emissive: neonPurple, emissiveIntensity: 1.0
          });
          mesh = new THREE.Mesh(game.geometries.pillar, mat);
          mesh.position.y = 0.0;
          break;
        default: break;
      }
      
      const laneIndex = Math.floor(Math.random() * 3);
      mesh.position.x = game.lanes[laneIndex];
      mesh.position.z = zPos;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { type: 'obstacle', shape: shapeType, height: height };
      game.scene.add(mesh);
      game.obstacles.push(mesh);
    };

    // --- COIN SPAWNER ---
    const spawnCoin = (zPos) => {
      const mat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, emissive: 0xffcc00, emissiveIntensity: 0.5, metalness: 1, roughness: 0.3
      });
      const coin = new THREE.Mesh(game.geometries.coin, mat);
      
      const laneIndex = Math.floor(Math.random() * 3);
      coin.position.x = game.lanes[laneIndex];
      coin.position.z = zPos;

      const isAirCoin = Math.random() > 0.6;
      coin.position.y = isAirCoin ? 2.2 : 0; 

      coin.rotation.x = Math.PI / 2; 
      coin.userData = { type: 'coin', isAir: isAirCoin };
      
      game.scene.add(coin);
      game.coins.push(coin);
    }

    // --- GAME LOOP ---
    const animate = () => {
      // Logic chung (chạy cả khi ở Menu để thấy animation)
      const parts = game.playerParts;
      const runCycle = game.time * 20;

      if (gameState === 'PLAYING') {
          // *** LOGIC KHI ĐANG CHƠI ***
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
            // Jump Pose
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
            // Run Anim
            parts.leftLeg.rotation.x = Math.sin(runCycle) * 0.8;
            parts.rightLeg.rotation.x = Math.sin(runCycle + Math.PI) * 0.8;
            parts.leftArm.rotation.x = Math.sin(runCycle + Math.PI) * 0.6;
            parts.rightArm.rotation.x = Math.sin(runCycle) * 0.6;
          }

          // Move Entities
          // ... (Giữ nguyên logic Obstacle & Coin như cũ nhưng rút gọn cho gọn code hiển thị)
          // Obstacles
          for (let i = game.obstacles.length - 1; i >= 0; i--) {
            const obj = game.obstacles[i];
            obj.position.z += game.speed;
            if (obj.userData.shape === 'SPIKE') obj.rotation.y += 0.05;
            if (obj.userData.shape === 'PILLAR') obj.rotation.y -= 0.02;
            // Collision check
            const dx = Math.abs(obj.position.x - game.player.position.x);
            const dz = Math.abs(obj.position.z - game.player.position.z);
            if (dx < 0.5 && dz < 0.5) {
                const obstacleTopY = (obj.userData.height / 2) + obj.position.y;
                if (game.player.position.y + 0.1 < obstacleTopY) handleGameOver();
            }
            if (obj.position.z > 5) {
              game.scene.remove(obj);
              game.obstacles.splice(i, 1);
              spawnObstacle(-80 - Math.random() * 30); 
            }
          }
          // Coins
          for (let i = game.coins.length - 1; i >= 0; i--) {
            const coin = game.coins[i];
            coin.position.z += game.speed;
            coin.rotation.z += 0.05;
            const dx = Math.abs(coin.position.x - game.player.position.x);
            const dz = Math.abs(coin.position.z - game.player.position.z);
            let canCollect = false;
            if (dx < 0.6 && dz < 0.6) {
                 if (coin.userData.isAir) {
                     if (game.player.position.y > 1.2) canCollect = true;
                 } else {
                     if (game.player.position.y < 1.0) canCollect = true;
                 }
            }
            if (canCollect) {
              game.scene.remove(coin);
              game.coins.splice(i, 1);
              game.scoreInternal += 50; 
              spawnCoin(-80 - Math.random() * 30);
            } 
            else if (coin.position.z > 5) {
              game.scene.remove(coin);
              game.coins.splice(i, 1);
              spawnCoin(-80 - Math.random() * 30);
            }
          }

      } else if (gameState === 'MENU') {
          // *** LOGIC KHI Ở MENU (IDLE) ***
          game.time += 0.005; // Slow mo
          // Idle Animation (Breathing + slight arm sway)
          game.player.position.y = Math.sin(game.time * 5) * 0.05;
          parts.leftArm.rotation.x = Math.sin(game.time * 5) * 0.1;
          parts.rightArm.rotation.x = Math.cos(game.time * 5) * 0.1;
          parts.leftLeg.rotation.x = 0;
          parts.rightLeg.rotation.x = 0;
          game.player.rotation.z = 0;
          game.player.rotation.y = Math.sin(game.time * 2) * 0.1; // Look around
          
          // Move grid slowly
          game.grid.position.z = (game.grid.position.z + 0.02) % 10;
      }
      
      // Particle System Always Updates
      const pPositions = game.particleSystem.geometry.attributes.position.array;
      for (let i = game.particles.length - 1; i >= 0; i--) {
          const p = game.particles[i];
          pPositions[p.index * 3 + 2] += (gameState === 'PLAYING' ? game.speed : 0.05) * 0.8; 
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

    // INIT SPAWN
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
      game.obstacles = [];
      game.coins = [];
      game.currentLane = 1;
      game.player.position.set(0, 0, 0);
      game.player.rotation.set(0, 0, 0);
      game.targetX = 0;
      game.speed = 0.15; 
      game.scoreInternal = 0;
      game.time = 0;
      game.isJumping = false;
      game.jumpVelocity = 0;
      setScore(0);
      
      for(let i = 0; i < 8; i++) { 
        // Re-use spawn logic manually or extract it. 
        // For simplicity, just clearing and letting loop handle logic or simple manual spawn:
        // (Copied spawn logic logic briefly for reset)
        // Note: In real app, define spawn functions outside useEffect or useRefs
      }
      // Trigger re-render to restart loop logic correctly
      setGameState('PLAYING');
  }

  const handleSwipe = (direction) => {
    if (gameState !== 'PLAYING') return;
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

  // Skin Select Handlers
  const nextSkin = () => setCurrentSkinIndex((prev) => (prev + 1) % SKINS.length);
  const prevSkin = () => setCurrentSkinIndex((prev) => (prev - 1 + SKINS.length) % SKINS.length);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a103c] select-none touch-none font-sans text-white">
      <div ref={mountRef} className="absolute inset-0 z-0" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur border border-cyan-500/30 p-3 rounded-xl">
          <div className="text-xs text-cyan-400 uppercase tracking-widest opacity-80">Score</div>
          <div className="text-3xl font-mono font-bold text-cyan-50 shadow-cyan-500/50 drop-shadow-md">{score}</div>
        </div>
        {highScore > 0 && (
          <div className="bg-black/40 backdrop-blur border border-yellow-500/30 p-3 rounded-xl flex items-center gap-3">
             <Trophy size={18} className="text-yellow-400" />
             <div>
                <div className="text-xs text-yellow-400 uppercase tracking-widest opacity-80">Best</div>
                <div className="text-xl font-mono font-bold text-yellow-50">{highScore}</div>
             </div>
          </div>
        )}
      </div>

      {/* MENU & SKIN SELECTOR */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 w-full max-w-sm animate-in zoom-in duration-300">
            {/* Title */}
            <div className="text-center mb-2">
              <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-white to-purple-400 transform -skew-x-6">
                NEON<br/>RUNNER
              </h1>
            </div>

            {/* SKIN CARD */}
            <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-2xl w-full flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <div className="text-xs text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Palette size={14} /> Character Skin
                </div>
                
                <div className="flex items-center justify-between w-full">
                    <button onClick={prevSkin} className="p-2 hover:bg-white/10 rounded-full transition"><ChevronLeft /></button>
                    
                    <div className="text-center">
                        <div className="text-xl font-bold text-white font-mono" style={{ color: '#' + SKINS[currentSkinIndex].colors.armor.toString(16) }}>
                            {SKINS[currentSkinIndex].name}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">Robot Model T-{currentSkinIndex + 1}00</div>
                    </div>
                    
                    <button onClick={nextSkin} className="p-2 hover:bg-white/10 rounded-full transition"><ChevronRight /></button>
                </div>

                {/* Color Indicators */}
                <div className="flex gap-2 mt-1">
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: '#' + SKINS[currentSkinIndex].colors.armor.toString(16)}}></div>
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: '#' + SKINS[currentSkinIndex].colors.visor.toString(16)}}></div>
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: '#' + SKINS[currentSkinIndex].colors.joint.toString(16)}}></div>
                </div>
            </div>

            {/* Start Button */}
            <button 
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform p-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 mt-2"
            >
              <Play fill="currentColor" size={20}/> START MISSION
            </button>
            
            {/* Tutorial Icons */}
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
              <Skull size={64} className="mx-auto text-red-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-red-100">CRASHED!</h2>
              <div className="text-5xl font-black text-white my-4">{score}</div>
              <button 
                onClick={resetGame}
                className="w-full bg-red-600 hover:bg-red-500 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition"
              >
                <RotateCcw size={20}/> RETRY
              </button>
              <button 
                onClick={() => setGameState('MENU')}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition text-sm"
              >
                BACK TO MENU
              </button>
           </div>
        </div>
      )}

      {!loaded && <div className="absolute inset-0 z-50 bg-black flex items-center justify-center text-cyan-500 font-mono text-sm tracking-widest">LOADING ASSETS...</div>}
    </div>
  );
};

export default NeonRunner;
