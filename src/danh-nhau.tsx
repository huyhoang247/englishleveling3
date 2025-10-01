import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- Cấu hình Game ---
const TILE_SIZE = 40;
const WORLD_WIDTH = 40;
const WORLD_HEIGHT = 30;
const PLAYER_SPEED = 3; 
const BULLET_SPEED = 5;
const ENEMY_SHOOT_INTERVAL = 1800;
const PLAYER_INVINCIBILITY_DURATION = 1500;
const MAX_ENEMIES = 7;
// Kích thước hộp va chạm của nhân vật, nhỏ hơn TILE_SIZE để có khoảng trống
const PLAYER_HITBOX_SIZE = TILE_SIZE * 0.7; 

// --- Các loại khối ---
const TILE_TYPES = {
  GRASS: 'GRASS', DIRT: 'DIRT', STONE: 'STONE',
  WATER: 'WATER', LAVA: 'LAVA',
};

// --- Components (Không thay đổi) ---
const Tile = React.memo(({ type }) => {
  const getTileStyle = () => {
    switch (type) {
      case TILE_TYPES.GRASS: return 'bg-green-500 border-green-700';
      case TILE_TYPES.DIRT: return 'bg-yellow-800 border-yellow-900';
      case TILE_TYPES.STONE: return 'bg-gray-500 border-gray-700';
      case TILE_TYPES.WATER: return 'bg-blue-500 border-blue-700 animate-pulse';
      case TILE_TYPES.LAVA: return 'bg-orange-500 border-red-700 animate-pulse';
      default: return 'bg-gray-200';
    }
  };
  return <div className={`w-full h-full border-b-4 border-r-2 ${getTileStyle()}`} style={{ width: TILE_SIZE, height: TILE_SIZE }}><div className="w-full h-full opacity-10 noise-pattern"></div></div>;
});

const Player = ({ position, isInvincible }) => (
  <div className="absolute" style={{ width: PLAYER_HITBOX_SIZE, height: PLAYER_HITBOX_SIZE, transform: `translate(${position.x}px, ${position.y}px)`, zIndex: 10, willChange: 'transform' }}>
    <div className={`w-full h-full bg-red-500 rounded-md shadow-lg border-2 border-red-700 flex items-center justify-center transition-opacity ${isInvincible ? 'opacity-50 animate-pulse' : 'opacity-100'}`}><div className="w-4 h-4 bg-white rounded-sm"></div></div>
  </div>
);

const Enemy = ({ position }) => (
    <div className="absolute" style={{ width: TILE_SIZE * 0.9, height: TILE_SIZE * 0.9, transform: `translate(${position.x}px, ${position.y}px)`, zIndex: 9 }}>
        <div className="w-full h-full bg-purple-600 rounded-lg shadow-lg border-2 border-purple-800 flex items-center justify-center"><div className="w-3 h-3 bg-yellow-300 rounded-full"></div></div>
    </div>
);

const Bullet = ({ position }) => (
    <div className="absolute rounded-full bg-yellow-400 shadow-md" style={{ width: 10, height: 10, transform: `translate(${position.x}px, ${position.y}px)`, zIndex: 15 }} />
);

const Joystick = ({ onMove, onStop }) => {
    const baseRef = useRef(null);
    const handleRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const animationFrameRef = useRef(null);
    const movementRef = useRef({ angle: 0, active: false });

    const handleInteraction = (clientX, clientY, isStarting) => {
        if (!baseRef.current) return;
        if(isStarting) setIsDragging(true);

        const rect = baseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const distance = Math.min(50, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);

        if(handleRef.current) {
            handleRef.current.style.transform = `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle)}px)`;
        }
        movementRef.current = { angle, active: true };
    };

    const handleInteractionEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        if(handleRef.current) handleRef.current.style.transform = `translate(0px, 0px)`;
        movementRef.current = { angle: 0, active: false };
        onStop();
    }, [isDragging, onStop]);

    useEffect(() => {
        const loop = () => {
            if (movementRef.current.active) onMove(movementRef.current.angle);
            animationFrameRef.current = requestAnimationFrame(loop);
        };
        if(isDragging) animationFrameRef.current = requestAnimationFrame(loop);
        return () => { if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [isDragging, onMove]);

    const onMouseMove = (e) => isDragging && handleInteraction(e.clientX, e.clientY, false);
    const onTouchMove = (e) => isDragging && handleInteraction(e.touches[0].clientX, e.touches[0].clientY, false);
    
    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', handleInteractionEnd);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', handleInteractionEnd);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', handleInteractionEnd);
        };
    }, [isDragging, handleInteractionEnd]);

    const onMouseDown = (e) => handleInteraction(e.clientX, e.clientY, true);
    const onTouchStart = (e) => { e.preventDefault(); handleInteraction(e.touches[0].clientX, e.touches[0].clientY, true); };
    
    return (
        <div ref={baseRef} onMouseDown={onMouseDown} onTouchStart={onTouchStart} className="fixed bottom-10 left-10 w-32 h-32 bg-gray-500 bg-opacity-30 rounded-full flex items-center justify-center select-none touch-none" style={{ zIndex: 20 }}>
            <div ref={handleRef} className="w-16 h-16 bg-gray-200 bg-opacity-60 rounded-full shadow-lg transition-transform"></div>
        </div>
    );
};

// --- Component chính của Game ---
export default function App() {
  const [world, setWorld] = useState([]);
  const [renderPosition, setRenderPosition] = useState({ x: TILE_SIZE * 2, y: TILE_SIZE * 2 });
  const [renderEnemies, setRenderEnemies] = useState([]);
  const [renderBullets, setRenderBullets] = useState([]);
  const [isInvincible, setIsInvincible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const playerPositionRef = useRef({ x: TILE_SIZE * 2, y: TILE_SIZE * 2 });
  const playerMovementRef = useRef({ dx: 0, dy: 0 });
  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const playerInvincibleEndRef = useRef(0);
  
  const solidTiles = useMemo(() => new Set([TILE_TYPES.STONE, TILE_TYPES.WATER, TILE_TYPES.LAVA]), []);

  // --- Khởi tạo thế giới ---
  useEffect(() => {
    // Logic tạo thế giới không đổi
    const newWorld = Array.from({ length: WORLD_HEIGHT }, (_, y) =>
      Array.from({ length: WORLD_WIDTH }, (_, x) => {
        if (x < 1 || x > WORLD_WIDTH - 2 || y < 1 || y > WORLD_HEIGHT - 2) return TILE_TYPES.STONE;
        if (Math.random() < 0.07) return TILE_TYPES.STONE;
        if (x > 20 && x < 25 && y > 18 && y < 22) return TILE_TYPES.LAVA;
        return TILE_TYPES.GRASS;
      })
    );
    setWorld(newWorld);
    
    const newEnemies = [];
    for (let i = 0; i < MAX_ENEMIES; i++) {
        let ex, ey;
        do {
            ex = Math.floor(Math.random() * (WORLD_WIDTH - 2)) + 1;
            ey = Math.floor(Math.random() * (WORLD_HEIGHT - 2)) + 1;
        } while (solidTiles.has(newWorld[ey][ex]) || (Math.hypot(ex - 2, ey - 2) < 6));
        newEnemies.push({
            id: `enemy-${i}`,
            position: { x: ex * TILE_SIZE, y: ey * TILE_SIZE },
            lastShotTime: Date.now() + Math.random() * ENEMY_SHOOT_INTERVAL
        });
    }
    enemiesRef.current = newEnemies;
    setRenderEnemies(newEnemies);
    setIsLoaded(true);
  }, [solidTiles]);
  
  // --- VÒNG LẶP GAME CHÍNH ---
  useEffect(() => {
    if (!isLoaded) return;
    let animationFrameId;

    // Hàm kiểm tra va chạm tại một vị trí cụ thể
    const checkCollision = (x, y) => {
        const corners = [
            {cx: x, cy: y}, // Top-left
            {cx: x + PLAYER_HITBOX_SIZE, cy: y}, // Top-right
            {cx: x, cy: y + PLAYER_HITBOX_SIZE}, // Bottom-left
            {cx: x + PLAYER_HITBOX_SIZE, cy: y + PLAYER_HITBOX_SIZE}, // Bottom-right
        ];
        for (const corner of corners) {
            const tileX = Math.floor(corner.cx / TILE_SIZE);
            const tileY = Math.floor(corner.cy / TILE_SIZE);
            if(world[tileY] && solidTiles.has(world[tileY][tileX])) {
                return true; // Va chạm
            }
        }
        return false; // Không va chạm
    }

    const gameLoop = () => {
      const now = Date.now();
      
      // 1. Cập nhật vị trí người chơi với xử lý va chạm
      const { dx, dy } = playerMovementRef.current;
      if (dx !== 0 || dy !== 0) {
        const currentPos = playerPositionRef.current;
        let nextX = currentPos.x + dx;
        let nextY = currentPos.y + dy;
        
        // Kiểm tra trục X trước
        if (!checkCollision(nextX, currentPos.y)) {
            currentPos.x = nextX;
        }
        
        // Kiểm tra trục Y sau
        if (!checkCollision(currentPos.x, nextY)) {
            currentPos.y = nextY;
        }

        // Giới hạn trong thế giới
        currentPos.x = Math.max(0, Math.min(currentPos.x, WORLD_WIDTH * TILE_SIZE - PLAYER_HITBOX_SIZE));
        currentPos.y = Math.max(0, Math.min(currentPos.y, WORLD_HEIGHT * TILE_SIZE - PLAYER_HITBOX_SIZE));
      }

      // 2. Kẻ thù bắn đạn (logic không đổi)
      enemiesRef.current.forEach(enemy => {
          if (now - enemy.lastShotTime > ENEMY_SHOOT_INTERVAL) {
              enemy.lastShotTime = now;
              const angle = Math.atan2(playerPositionRef.current.y - enemy.position.y, playerPositionRef.current.x - enemy.position.x);
              bulletsRef.current.push({
                  id: `bullet-${now}-${enemy.id}`,
                  position: { ...enemy.position },
                  velocity: { dx: Math.cos(angle) * BULLET_SPEED, dy: Math.sin(angle) * BULLET_SPEED }
              });
          }
      });
      
      // 3. Cập nhật đạn và va chạm (logic không đổi)
      const currentIsInvincible = now < playerInvincibleEndRef.current;
      const nextBullets = [];
      const bulletSize = 10;
      
      for (const bullet of bulletsRef.current) {
          bullet.position.x += bullet.velocity.dx;
          bullet.position.y += bullet.velocity.dy;

          const tileX = Math.floor(bullet.position.x / TILE_SIZE);
          const tileY = Math.floor(bullet.position.y / TILE_SIZE);

          if (world[tileY] && !solidTiles.has(world[tileY][tileX])) {
              if (!currentIsInvincible &&
                  bullet.position.x < playerPositionRef.current.x + PLAYER_HITBOX_SIZE &&
                  bullet.position.x + bulletSize > playerPositionRef.current.x &&
                  bullet.position.y < playerPositionRef.current.y + PLAYER_HITBOX_SIZE &&
                  bullet.position.y + bulletSize > playerPositionRef.current.y) 
              {
                  playerInvincibleEndRef.current = now + PLAYER_INVINCIBILITY_DURATION;
                  continue; 
              }
              nextBullets.push(bullet);
          }
      }
      bulletsRef.current = nextBullets;

      // 4. CẬP NHẬT STATE ĐỂ RENDER LẠI GIAO DIỆN
      setRenderPosition({ ...playerPositionRef.current });
      setRenderBullets([...bulletsRef.current]);
      setIsInvincible(currentIsInvincible);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoaded, world, solidTiles]);

  // --- Xử lý input (Keyboard & Joystick) ---
  const handleJoystickMove = useCallback((angle) => {
    playerMovementRef.current = { dx: Math.cos(angle) * PLAYER_SPEED, dy: Math.sin(angle) * PLAYER_SPEED };
  }, []);
  const handleJoystickStop = useCallback(() => {
    playerMovementRef.current = { dx: 0, dy: 0 };
  }, []);

  useEffect(() => {
    const keyState = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    const updateMovement = () => {
        let dx = 0; let dy = 0;
        if (keyState.ArrowUp) dy -= 1;
        if (keyState.ArrowDown) dy += 1;
        if (keyState.ArrowLeft) dx -= 1;
        if (keyState.ArrowRight) dx += 1;
        
        const length = Math.hypot(dx, dy);
        if (length > 0) {
            playerMovementRef.current = { dx: (dx / length) * PLAYER_SPEED, dy: (dy / length) * PLAYER_SPEED };
        } else {
            playerMovementRef.current = { dx: 0, dy: 0 };
        }
    }
    const handleKey = (e) => { if (e.key in keyState) { keyState[e.key] = e.type === 'keydown'; updateMovement(); }};
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, []);
  
  if (!isLoaded) {
    return <div className="w-screen h-screen flex items-center justify-center bg-gray-800 text-white text-2xl">Đang kiến tạo thế giới...</div>;
  }

  const cameraX = renderPosition.x - window.innerWidth / 2 + PLAYER_HITBOX_SIZE / 2;
  const cameraY = renderPosition.y - window.innerHeight / 2 + PLAYER_HITBOX_SIZE / 2;

  return (
    <div className="w-screen h-screen overflow-hidden bg-blue-300 font-sans relative touch-none select-none">
       <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-20 text-center pointer-events-none">
            <h1 className="text-xl font-bold">Block World Survivor</h1>
            <p className="text-sm">Di chuyển tự do, né tránh kẻ thù!</p>
            {isInvincible && <p className="text-xs text-cyan-300 animate-pulse">BẤT TỬ</p>}
        </div>
      <div style={{ transform: `translate(-${cameraX}px, -${cameraY}px)`, willChange: 'transform' }}>
        <div className="relative" style={{ width: WORLD_WIDTH * TILE_SIZE, height: WORLD_HEIGHT * TILE_SIZE }}>
            <div className="absolute top-0 left-0 flex flex-wrap">
              {world.map((row, y) => row.map((tile, x) => <Tile key={`${x}-${y}`} type={tile} />))}
            </div>
            {renderEnemies.map(enemy => <Enemy key={enemy.id} position={enemy.position} />)}
            {renderBullets.map(bullet => <Bullet key={bullet.id} position={bullet.position} />)}
            <Player position={renderPosition} isInvincible={isInvincible} />
        </div>
      </div>
      <Joystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
    </div>
  );
}

