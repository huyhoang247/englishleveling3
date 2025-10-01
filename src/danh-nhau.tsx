import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Cấu hình Game ---
const GRID_SIZE = 10; // Giữ nguyên 10x10
const GAME_SPEED = 100; // ms per tick

// Thiết kế lại đường đi cho bàn 10x10
const PATH = [
  { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },
  { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 7 },
  { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
  { x: 5, y: 6 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 },
  { x: 6, y: 2 }, { x: 7, y: 2 },
  { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 },
  { x: 8, y: 8 }, { x: 9, y: 8 }
];


const TOWER_TYPES = {
  gun: {
    name: 'Tháp Súng',
    cost: 100,
    damage: 10,
    range: 3,
    fireRate: 5, // Ticks per shot
    color: 'bg-cyan-500',
    projectileColor: 'bg-cyan-300',
    projectileSpeed: 0.5,
  },
  laser: {
    name: 'Tháp Laser',
    cost: 250,
    damage: 25,
    range: 4,
    fireRate: 8,
    color: 'bg-red-500',
    projectileColor: 'bg-red-300',
    projectileSpeed: 0.7,
  },
  sniper: {
    name: 'Tháp Bắn Tỉa',
    cost: 400,
    damage: 100,
    range: 5,
    fireRate: 20,
    color: 'bg-purple-500',
    projectileColor: 'bg-purple-300',
    projectileSpeed: 1,
  }
};

const WAVES = [
  { count: 10, health: 100, speed: 0.1, reward: 10 },
  { count: 15, health: 150, speed: 0.1, reward: 12 },
  { count: 20, health: 180, speed: 0.12, reward: 15 },
  { count: 10, health: 500, speed: 0.08, reward: 50 },
  { count: 25, health: 250, speed: 0.15, reward: 20 },
  { count: 30, health: 300, speed: 0.18, reward: 25 },
  { count: 1,  health: 10000, speed: 0.05, reward: 1000, isBoss: true},
];

// --- Biểu tượng SVG ---
const EnemyIcon = ({ isBoss }) => (
  <svg viewBox="0 0 100 100" className={`absolute w-full h-full ${isBoss ? 'text-red-700' : 'text-zinc-400'}`} fill="currentColor">
    <path d="M50,10 C27.9,10 10,27.9 10,50 C10,72.1 27.9,90 50,90 C72.1,90 90,72.1 90,50 C90,27.9 72.1,10 50,10 Z M50,20 C66.6,20 80,33.4 80,50 C80,57.1 77.5,63.6 73.2,68.7 L31.3,26.8 C36.4,22.5 42.9,20 50,20 Z M26.8,31.3 L68.7,73.2 C63.6,77.5 57.1,80 50,80 C33.4,80 20,66.6 20,50 C20,42.9 22.5,36.4 26.8,31.3 Z" />
  </svg>
);

const TowerIcon = ({ type }) => {
  if (type === 'laser') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white p-1">
        <path d="M12 1L9 9h6l-3-8zM4.22 4.22l4.24 4.24L4.22 12l4.24-3.54-4.24-4.24zM19.78 4.22l-4.24 4.24L19.78 12l-4.24-3.54 4.24-4.24zM12 23l3-8H9l3 8zM4.22 19.78l4.24-4.24L4.22 12l4.24 3.54-4.24 4.24zM19.78 19.78l-4.24-4.24L19.78 12l-4.24 3.54 4.24 4.24z"/>
      </svg>
    )
  }
  if (type === 'sniper') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white p-1">
        <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7zm0 3c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 2h2v2H5zm14 0h-2v2h2zM10 5v2h4V5zM10 17v2h4v-2z"/>
      </svg>
    )
  }
  // Default: gun tower
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white p-1">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M11 7h2v6h-2z"/>
      <circle cx="12" cy="16" r="1"/>
    </svg>
  );
};

// --- Component Chính ---
export default function App() {
  const [gameState, setGameState] = useState({
    gold: 300,
    lives: 20,
    wave: 0,
    gameStatus: 'idle', // idle, playing, wave-cleared, game-over, victory
  });
  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [tileSize, setTileSize] = useState(40);

  const gameTickRef = useRef(0);
  const gameLoopStateRef = useRef({ gameState, enemies, towers, projectiles, tileSize });

  useEffect(() => {
    gameLoopStateRef.current = { gameState, enemies, towers, projectiles, tileSize };
  }, [gameState, enemies, towers, projectiles, tileSize]);

  // Effect để tính toán kích thước ô linh hoạt, lớn hơn cho điện thoại
  useEffect(() => {
      const calculateSize = () => {
        const screenWidth = window.innerWidth;
        // Cho phép bàn chơi chiếm 95% chiều rộng màn hình, giới hạn tối đa 500px trên màn hình lớn
        const boardSize = Math.min(screenWidth * 0.95, 500);
        const newTileSize = Math.floor(boardSize / GRID_SIZE);
        setTileSize(newTileSize);
      };

      calculateSize();
      window.addEventListener('resize', calculateSize);
      return () => window.removeEventListener('resize', calculateSize);
  }, []);
  
  const isPath = (x, y) => PATH.some(p => p.x === x && p.y === y);
  const isOccupied = (x, y) => towers.some(t => t.x === x && t.y === y);

  const handleTileClick = (x, y) => {
    if (!selectedTower || isPath(x, y) || isOccupied(x, y)) return;

    const towerInfo = TOWER_TYPES[selectedTower];
    if (gameState.gold >= towerInfo.cost) {
      setGameState(prev => ({ ...prev, gold: prev.gold - towerInfo.cost }));
      setTowers(prev => [...prev, {
        id: Date.now(),
        type: selectedTower,
        x, y,
        ...towerInfo,
        fireCooldown: 0,
        target: null,
      }]);
      setSelectedTower(null);
    }
  };

  const startNextWave = useCallback(() => {
    const { gameState, tileSize } = gameLoopStateRef.current;
    const nextWaveIndex = gameState.wave;
    if (nextWaveIndex >= WAVES.length) {
      setGameState(prev => ({ ...prev, gameStatus: 'victory' }));
      return;
    }
    const waveData = WAVES[nextWaveIndex];
    const newEnemies = Array.from({ length: waveData.count }, (_, i) => ({
      id: `${nextWaveIndex}-${i}`,
      ...waveData,
      maxHealth: waveData.health,
      pathIndex: 0,
      x: PATH[0].x * tileSize + tileSize / 2,
      y: PATH[0].y * tileSize + tileSize / 2,
      spawnDelay: i * (waveData.isBoss ? 0 : 20), // Ticks
    }));
    
    setEnemies(newEnemies);
    setGameState(prev => ({ ...prev, gameStatus: 'playing', wave: prev.wave + 1 }));
  }, []);

  const gameLoop = useCallback(() => {
    const { gameState, enemies, towers, projectiles, tileSize } = gameLoopStateRef.current;
    if (gameState.gameStatus !== 'playing') return;

    gameTickRef.current++;

    // --- Logic Kẻ địch ---
    const newEnemies = [];
    let livesLost = 0;
    let goldEarned = 0;
    
    enemies.forEach(enemy => {
      if (enemy.spawnDelay > 0) { newEnemies.push({ ...enemy, spawnDelay: enemy.spawnDelay - 1 }); return; }
      if (enemy.health <= 0) { goldEarned += enemy.reward; return; }
      if (enemy.pathIndex >= PATH.length - 1) { livesLost++; return; }
      
      let currentPathIndex = enemy.pathIndex;
      const targetPos = PATH[currentPathIndex + 1];
      const targetX = targetPos.x * tileSize + tileSize / 2;
      const targetY = targetPos.y * tileSize + tileSize / 2;
      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let newX = enemy.x, newY = enemy.y;
      if (distance < enemy.speed * tileSize) {
        newX = targetX; newY = targetY; currentPathIndex++;
      } else {
        newX += (dx / distance) * enemy.speed * tileSize * (GAME_SPEED / 100);
        newY += (dy / distance) * enemy.speed * tileSize * (GAME_SPEED / 100);
      }
      newEnemies.push({ ...enemy, x: newX, y: newY, pathIndex: currentPathIndex });
    });

    // --- Logic Tháp & Đạn ---
    const newProjectiles = [...projectiles];
    const updatedTowers = towers.map(tower => {
      let newCooldown = Math.max(0, tower.fireCooldown - 1);
      if (newCooldown === 0) {
        const enemiesInRange = newEnemies.filter(e => Math.sqrt(Math.pow(e.x - (tower.x * tileSize + tileSize / 2), 2) + Math.pow(e.y - (tower.y * tileSize + tileSize / 2), 2)) <= tower.range * tileSize);
        if (enemiesInRange.length > 0) {
          const target = enemiesInRange[0];
          newProjectiles.push({ id: Math.random(), targetId: target.id, damage: tower.damage, speed: tower.projectileSpeed, color: tower.projectileColor, x: tower.x * tileSize + tileSize / 2, y: tower.y * tileSize + tileSize / 2 });
          return { ...tower, fireCooldown: tower.fireRate };
        }
      }
      return { ...tower, fireCooldown: newCooldown };
    });

    const finalProjectiles = [];
    newProjectiles.forEach(p => {
        const target = newEnemies.find(e => e.id === p.targetId);
        if (!target) return;
        const dx = target.x - p.x; const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < p.speed * tileSize * 0.5) {
            const enemyIndex = newEnemies.findIndex(e => e.id === p.targetId);
            if (enemyIndex !== -1) newEnemies[enemyIndex].health -= p.damage;
        } else {
            p.x += (dx / dist) * p.speed * tileSize * (GAME_SPEED / 100);
            p.y += (dy / dist) * p.speed * tileSize * (GAME_SPEED / 100);
            finalProjectiles.push(p);
        }
    });

    // --- Cập nhật State ---
    setEnemies(newEnemies.filter(e => e.health > 0));
    setTowers(updatedTowers);
    setProjectiles(finalProjectiles);

    if (livesLost > 0 || goldEarned > 0) {
      setGameState(prev => {
        const newLives = prev.lives - livesLost;
        if (newLives <= 0) return { ...prev, lives: 0, gameStatus: 'game-over' };
        return { ...prev, lives: newLives, gold: prev.gold + goldEarned };
      });
    }

    if (newEnemies.length === 0 && enemies.length > 0) {
        setGameState(prev => ({...prev, gameStatus: 'wave-cleared'}));
    }
  }, []);

  useEffect(() => {
    const handle = setInterval(gameLoop, GAME_SPEED);
    return () => clearInterval(handle);
  }, [gameLoop]);
  
  const resetGame = () => {
     setGameState({ gold: 300, lives: 20, wave: 0, gameStatus: 'idle' });
     setTowers([]); setEnemies([]); setProjectiles([]); setSelectedTower(null);
     gameTickRef.current = 0;
  }

  return (
    <div className="bg-zinc-800 text-white min-h-screen w-full flex flex-col items-center justify-center font-sans p-2 select-none">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 tracking-wider">React Tower Defense</h1>
      
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl items-center lg:items-start justify-center">
        {/* Bàn chơi */}
        <div 
          className="relative bg-zinc-700 grid border-2 border-zinc-600 shadow-lg shrink-0"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            width: GRID_SIZE * tileSize,
            height: GRID_SIZE * tileSize,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE; const y = Math.floor(i / GRID_SIZE);
            return (<div key={i} onClick={() => handleTileClick(x, y)} className={`w-full h-full border-zinc-900/20 border-t border-l ${isPath(x, y) ? 'bg-zinc-600' : 'bg-green-800/50'} ${!isPath(x, y) && !isOccupied(x,y) && selectedTower ? 'hover:bg-green-500/50 cursor-pointer' : ''} ${selectedTower && isOccupied(x,y) ? 'cursor-not-allowed' : ''}`}/>);
          })}
          {towers.map(tower => (<div key={tower.id} className={`absolute flex items-center justify-center rounded-full ${tower.color} shadow-lg`} style={{ left: tower.x * tileSize, top: tower.y * tileSize, width: tileSize, height: tileSize, }}><TowerIcon type={tower.type} /><div className="absolute rounded-full border border-dashed border-white/30 pointer-events-none" style={{ width: tower.range * 2 * tileSize, height: tower.range * 2 * tileSize, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', }}/></div>))}
          {enemies.map(enemy => (enemy.spawnDelay <= 0 && <div key={enemy.id} className="absolute" style={{ left: enemy.x - tileSize / 2, top: enemy.y - tileSize / 2, width: tileSize * (enemy.isBoss ? 1.5 : 1), height: tileSize * (enemy.isBoss ? 1.5 : 1), transform: `translate(-${(tileSize * (enemy.isBoss ? 1.5 : 1) - tileSize)/2}px, -${(tileSize * (enemy.isBoss ? 1.5 : 1) - tileSize)/2}px)`}}><EnemyIcon isBoss={enemy.isBoss} /><div className="absolute -top-1.5 left-0 w-full h-1 bg-red-500 rounded-full"><div className="bg-green-500 h-full rounded-full" style={{width: `${(enemy.health/enemy.maxHealth) * 100}%`}}></div></div></div>))}
          {projectiles.map(p => (<div key={p.id} className={`absolute rounded-full ${p.color}`} style={{ left: p.x - (tileSize * 0.075), top: p.y - (tileSize * 0.075), width: tileSize * 0.15, height: tileSize * 0.15, }}/>))}
          {(gameState.gameStatus !== 'playing') && (<div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4"><h2 className={`text-3xl md:text-5xl font-bold mb-4 ${gameState.gameStatus === 'game-over' ? 'text-red-500' : 'text-yellow-400'}`}>{gameState.gameStatus === 'game-over' ? 'THUA CUỘC' : gameState.gameStatus === 'victory' ? 'CHIẾN THẮNG!' : gameState.gameStatus === 'idle' ? 'Sẵn sàng?' : 'ĐÃ SẠCH WAVE!'}</h2> {(gameState.gameStatus === 'idle' || gameState.gameStatus === 'wave-cleared') && (<button onClick={startNextWave} className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-2 px-5 md:py-3 md:px-6 rounded-lg text-lg md:text-xl shadow-lg transition-transform transform hover:scale-105">Bắt đầu Wave {gameState.wave + 1}</button>)} {(gameState.gameStatus === 'game-over' || gameState.gameStatus === 'victory') && (<button onClick={resetGame} className="bg-gray-200 hover:bg-white text-zinc-900 font-bold py-2 px-5 md:py-3 md:px-6 rounded-lg text-lg md:text-xl shadow-lg transition-transform transform hover:scale-105 mt-4">Chơi lại</button>)}</div>)}
        </div>
        {/* Bảng điều khiển */}
        <div className="flex flex-col gap-4 w-full max-w-sm lg:w-64">
          <div className="bg-zinc-700/50 p-3 md:p-4 rounded-lg shadow-lg border border-zinc-600">
            <h3 className="text-lg md:text-xl font-bold mb-2 text-yellow-400">Trạng thái</h3>
            <div className="grid grid-cols-3 gap-2 text-center"><div>Vàng<br/><span className="font-bold">{gameState.gold} G</span></div><div>Mạng<br/><span className="font-bold">{gameState.lives} ❤️</span></div><div>Wave<br/><span className="font-bold">{gameState.wave}/{WAVES.length}</span></div></div>
          </div>
          <div className="bg-zinc-700/50 p-3 md:p-4 rounded-lg shadow-lg border border-zinc-600">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-cyan-400">Mua Tháp</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TOWER_TYPES).map(([type, info]) => (<button key={type} onClick={() => setSelectedTower(type)} disabled={gameState.gold < info.cost} className={`p-2 rounded-lg text-left border-2 transition-all text-sm ${selectedTower === type ? 'border-yellow-400 bg-zinc-600' : 'border-zinc-500 bg-zinc-700'} ${gameState.gold < info.cost ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-400 hover:bg-zinc-600'}`}><div className="font-bold">{info.name}</div><div>Giá: <span className="text-yellow-400">{info.cost}G</span></div><div className='text-xs'>DMG: <span className="text-red-400">{info.damage}</span></div></button>))}
            </div>
            {selectedTower && (<button onClick={() => setSelectedTower(null)} className="w-full mt-3 p-2 bg-red-600 hover:bg-red-500 rounded-lg">Hủy chọn</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

