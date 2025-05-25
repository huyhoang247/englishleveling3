import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 8;
const CELL_SIZE = 40; // Smaller for mobile
const ENEMY_HP = 100; // Base HP for wave 1
const KEY_DROP_CHANCE = 0.1; // 10% chance to drop a key

// Helper function to get tower stats for a given level
const getTowerStats = (towerTypeKey, level, towerTypesDefinition) => {
  const towerDef = towerTypesDefinition[towerTypeKey];
  if (!towerDef) return null;
  // Level is 1-based, array is 0-based
  const levelIndex = Math.max(0, Math.min(level - 1, towerDef.levels.length - 1));
  return towerDef.levels[levelIndex];
};


const App = () => {
  const [gameState, setGameState] = useState('playing'); // playing, paused, gameOver
  const [health, setHealth] = useState(750);
  const [maxHealth] = useState(1000);
  const [coins, setCoins] = useState(150);
  const [keys, setKeys] = useState(0);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedTowerType, setSelectedTowerType] = useState(null);
  const [showTowerMenu, setShowTowerMenu] = useState(false);
  const [inspectingTowerId, setInspectingTowerId] = useState(null);

  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);
  // Thêm state mới cho hiệu ứng nổ
  const [explosions, setExplosions] = useState([]);

  const gameLoopRef = useRef();
  const enemySpawnRef = useRef();

  const path = [
    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 },
    { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 },
    { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 },
    { x: 1, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 },
    { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 } 
  ];

  const towerTypes = {
    cannon: {
      name: 'Cannon', icon: '💥', color: 'bg-gray-700',
      cost: 60, 
      levels: [ 
        { damage: 25, range: 60, attackSpeed: 800, projectileSize: 8, projectileColor: 'bg-slate-400' },
        { damage: 40, range: 70, attackSpeed: 750, projectileSize: 9, projectileColor: 'bg-slate-500' },
        { damage: 55, range: 80, attackSpeed: 700, projectileSize: 10, projectileColor: 'bg-slate-600' },
      ],
      upgradeCosts: [40, 70], 
    },
    ice: {
      name: 'Frost Tower', icon: '❄️', color: 'bg-blue-600',
      cost: 90,
      levels: [
        { damage: 20, range: 75, attackSpeed: 1000, projectileSize: 9, projectileColor: 'bg-cyan-300' },
        { damage: 30, range: 85, attackSpeed: 950, projectileSize: 10, projectileColor: 'bg-cyan-400' },
        { damage: 40, range: 95, attackSpeed: 900, projectileSize: 11, projectileColor: 'bg-cyan-500' },
      ],
      upgradeCosts: [60, 90],
    },
    fire: {
      name: 'Inferno Tower', icon: '🔥', color: 'bg-red-600',
      cost: 120,
      levels: [
        { damage: 35, range: 50, attackSpeed: 1200, projectileSize: 10, projectileColor: 'bg-orange-500' },
        { damage: 55, range: 60, attackSpeed: 1100, projectileSize: 11, projectileColor: 'bg-orange-600' },
        { damage: 75, range: 65, attackSpeed: 1000, projectileSize: 12, projectileColor: 'bg-orange-700' },
      ],
      upgradeCosts: [80, 110],
    }
  };

  // Sound Manager
  const playSound = (type) => {
    // Tạo âm thanh đơn giản bằng Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'shoot':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'enemy_death':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  };

  const spawnEnemy = useCallback(() => {
    const enemyVisualTypes = ['👾', '🐉', '👹', '👻', '👽']; 
    const newEnemy = {
      id: Date.now() + Math.random(),
      x: path[0].x * CELL_SIZE + CELL_SIZE / 2,
      y: path[0].y * CELL_SIZE + CELL_SIZE / 2,
      hp: ENEMY_HP + (wave - 1) * 25 + Math.floor(Math.random() * wave * 5), 
      maxHp: ENEMY_HP + (wave - 1) * 25 + Math.floor(Math.random() * wave * 5),
      pathIndex: 0,
      speed: 1 + (wave - 1) * 0.05 + Math.random() * 0.2, 
      reward: 10 + wave * 2 + Math.floor(Math.random() * wave), 
      type: enemyVisualTypes[Math.floor(Math.random() * enemyVisualTypes.length)],
      canShoot: Math.random() < 0.3, // 30% cơ hội có thể bắn
      lastShot: 0,
      shootRange: 80,
      shootDamage: 15 + wave * 3,
      shootSpeed: 2000 + Math.random() * 1000, // Tần suất bắn
    };
    setEnemies(prev => [...prev, newEnemy]);
  }, [wave]);

  const moveEnemies = useCallback(() => {
    setEnemies(prevEnemies => prevEnemies.map(enemy => {
      if (enemy.pathIndex >= path.length - 1) {
        setHealth(h => Math.max(0, h - 30)); 
        return null; 
      }

      const targetNode = path[enemy.pathIndex + 1];
      const targetX = targetNode.x * CELL_SIZE + CELL_SIZE / 2;
      const targetY = targetNode.y * CELL_SIZE + CELL_SIZE / 2;

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.speed) {
        return { ...enemy, x: targetX, y: targetY, pathIndex: enemy.pathIndex + 1 };
      } else {
        return {
          ...enemy,
          x: enemy.x + (dx / distance) * enemy.speed,
          y: enemy.y + (dy / distance) * enemy.speed
        };
      }
    }).filter(Boolean));
  }, [path]); // Thêm path vào dependency array

  const towerShooting = useCallback(() => {
    towers.forEach(tower => {
      let targetEnemy = null;
      let maxPathIndex = -1;

      const towerStats = getTowerStats(tower.type, tower.level, towerTypes);
      if (!towerStats) return; // Should not happen if tower data is correct

      enemies.forEach(enemy => {
        const dx = enemy.x - (tower.x * CELL_SIZE + CELL_SIZE / 2);
        const dy = enemy.y - (tower.y * CELL_SIZE + CELL_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= towerStats.range) {
          if (enemy.pathIndex > maxPathIndex) {
            maxPathIndex = enemy.pathIndex;
            targetEnemy = enemy;
          } else if (enemy.pathIndex === maxPathIndex) {
            targetEnemy = enemy; 
          }
        }
      });
      
      if (targetEnemy && (!tower.lastShot || Date.now() - tower.lastShot > towerStats.attackSpeed)) {
        const projectile = {
          id: Date.now() + Math.random(),
          x: tower.x * CELL_SIZE + CELL_SIZE / 2,
          y: tower.y * CELL_SIZE + CELL_SIZE / 2,
          targetX: targetEnemy.x,
          targetY: targetEnemy.y,
          damage: towerStats.damage,
          speed: 5, 
          size: towerStats.projectileSize,
          color: towerStats.projectileColor,
        };
        setProjectiles(prev => [...prev, projectile]);
        setTowers(prevTowers => prevTowers.map(t =>
          t.id === tower.id ? { ...t, lastShot: Date.now() } : t
        ));
        playSound('shoot'); // Play shoot sound
      }
    });
  }, [towers, enemies, towerTypes]); // Thêm towerTypes vào dependency array

  const enemyShooting = useCallback(() => {
    enemies.forEach(enemy => {
      if (!enemy.canShoot) return;
      
      let targetTower = null;
      let minDistance = Infinity;
      
      towers.forEach(tower => {
        const dx = (tower.x * CELL_SIZE + CELL_SIZE / 2) - enemy.x;
        const dy = (tower.y * CELL_SIZE + CELL_SIZE / 2) - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= enemy.shootRange && distance < minDistance) {
          minDistance = distance;
          targetTower = tower;
        }
      });
      
      if (targetTower && (!enemy.lastShot || Date.now() - enemy.lastShot > enemy.shootSpeed)) {
        const projectile = {
          id: Date.now() + Math.random(),
          x: enemy.x,
          y: enemy.y,
          targetX: targetTower.x * CELL_SIZE + CELL_SIZE / 2,
          targetY: targetTower.y * CELL_SIZE + CELL_SIZE / 2,
          damage: enemy.shootDamage,
          speed: 3,
          size: 6,
          color: 'bg-red-500',
          targetTowerId: targetTower.id
        };
        setEnemyProjectiles(prev => [...prev, projectile]);
        setEnemies(prevEnemies => prevEnemies.map(e => 
          e.id === enemy.id ? { ...e, lastShot: Date.now() } : e
        ));
      }
    });
  }, [enemies, towers]);

  const moveProjectiles = useCallback(() => {
    setProjectiles(prevProjectiles => prevProjectiles.map(projectile => {
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < projectile.speed) { 
        setEnemies(prevEnemies => prevEnemies.map(enemy => {
          const enemyDx = enemy.x - projectile.targetX;
          const enemyDy = enemy.y - projectile.targetY;
          if (Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy) < CELL_SIZE * 0.5) { 
            const newHp = enemy.hp - projectile.damage;
            if (newHp <= 0) {
              setCoins(c => c + enemy.reward);
              setScore(s => s + enemy.reward * 5); 
              if (Math.random() < KEY_DROP_CHANCE) {
                setKeys(k => k + 1);
              }
              playSound('enemy_death'); // Play enemy death sound
              // Thêm hiệu ứng nổ
              setExplosions(prev => [...prev, {
                id: Date.now() + Math.random(),
                x: enemy.x,
                y: enemy.y,
                createdAt: Date.now()
              }]);
              return null; 
            }
            return { ...enemy, hp: newHp };
          }
          return enemy;
        }).filter(Boolean));
        return null; 
      }
      return {
        ...projectile,
        x: projectile.x + (dx / distance) * projectile.speed,
        y: projectile.y + (dy / distance) * projectile.speed
      };
    }).filter(Boolean));
  }, []);

  const moveEnemyProjectiles = useCallback(() => {
    setEnemyProjectiles(prevProjectiles => prevProjectiles.map(projectile => {
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < projectile.speed) {
        setTowers(prevTowers => prevTowers.map(tower => {
          if (tower.id === projectile.targetTowerId) {
            const newHp = (tower.hp || 100) - projectile.damage;
            if (newHp <= 0) {
              return null;
            }
            return { ...tower, hp: newHp };
          }
          return tower;
        }).filter(Boolean));
        return null;
      }
      
      return {
        ...projectile,
        x: projectile.x + (dx / distance) * projectile.speed,
        y: projectile.y + (dy / distance) * projectile.speed
      };
    }).filter(Boolean));
  }, []);

  // Lỗi dependency array trong useEffect đã được sửa
  useEffect(() => {
    if (gameState !== 'playing') {
        clearInterval(gameLoopRef.current);
        return;
    }
    gameLoopRef.current = setInterval(() => {
      moveEnemies();
      towerShooting();
      enemyShooting();
      moveProjectiles();
      moveEnemyProjectiles();
    }, 50); 
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, moveEnemies, towerShooting, enemyShooting, moveProjectiles, moveEnemyProjectiles, towers, enemies]); // Thêm towers và enemies

  useEffect(() => {
    if (gameState !== 'playing') {
        clearTimeout(enemySpawnRef.current);
        return;
    }
    let enemiesToSpawnThisWave = 5 + wave * 2;
    let spawnedCount = 0;
    const initialSpawnInterval = 500; 
    const regularSpawnInterval = Math.max(800, 2000 - (wave - 1) * 100);

    const doSpawn = () => {
        if (spawnedCount < enemiesToSpawnThisWave && gameState === 'playing') { 
            spawnEnemy();
            spawnedCount++;
            const nextInterval = spawnedCount < 3 ? initialSpawnInterval : regularSpawnInterval;
            enemySpawnRef.current = setTimeout(doSpawn, nextInterval);
        } else if (gameState !== 'playing') {
            clearTimeout(enemySpawnRef.current);
        }
    };
    
    if (gameState === 'playing') {
        doSpawn(); 
    }
    
    return () => clearTimeout(enemySpawnRef.current);
  }, [gameState, spawnEnemy, wave]);


  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
      setGameState('gameOver');
    }
  }, [health, gameState]);

  // Lỗi biến w không tồn tại đã được sửa
  useEffect(() => {
    if (enemies.length === 0 && gameState === 'playing' && wave > 0 ) {
        const waveClearTimer = setTimeout(() => {
            if (enemies.length === 0 && gameState === 'playing') { 
                 setWave(prevWave => {
                    setCoins(c => c + 50 + prevWave * 10); // Sử dụng prevWave thay vì w
                    setScore(s => s + prevWave * 100); // Sử dụng prevWave thay vì w
                    return prevWave + 1;
                 });
            }
        }, 3000); 
        return () => clearTimeout(waveClearTimer);
    }
  }, [enemies.length, gameState, wave]);

  // useEffect để xóa explosions
  useEffect(() => {
    const interval = setInterval(() => {
      setExplosions(prev => prev.filter(exp => Date.now() - exp.createdAt < 500));
    }, 100);
    return () => clearInterval(interval);
  }, []);


  const handleCellClick = (x, y) => {
    if (!selectedTowerType || gameState !== 'playing') return;
    if (inspectingTowerId) setInspectingTowerId(null); 

    const isOnPath = path.some(p => p.x === x && p.y === y);
    if (isOnPath) {
        return;
    }

    const hasTower = towers.some(t => t.x === x && t.y === y);
    if (hasTower) {
        return;
    }

    const towerTypeDefinition = towerTypes[selectedTowerType];
    if (coins < towerTypeDefinition.cost) {
        return;
    }
    
    const initialLevelStats = getTowerStats(selectedTowerType, 1, towerTypes);
    if (!initialLevelStats) return;

    const newTower = {
      id: Date.now() + Math.random(),
      x, y,
      type: selectedTowerType, 
      level: 1,
      hp: 100,
      maxHp: 100,
      damage: initialLevelStats.damage,
      range: initialLevelStats.range,
      attackSpeed: initialLevelStats.attackSpeed,
      projectileSize: initialLevelStats.projectileSize,
      projectileColor: initialLevelStats.projectileColor,
      lastShot: 0,
      color: towerTypeDefinition.color,
      icon: towerTypeDefinition.icon,
    };

    setTowers(prev => [...prev, newTower]);
    setCoins(c => c - towerTypeDefinition.cost);
    setSelectedTowerType(null); 
  };

  const handleTowerClick = (tower) => {
    if (selectedTowerType) { 
        setSelectedTowerType(null); 
        return;
    }
    if (gameState === 'playing' || gameState === 'paused') {
        setInspectingTowerId(tower.id);
        setShowTowerMenu(false); 
    }
  };

  const handleUpgradeTower = (towerId) => {
    const towerToUpgrade = towers.find(t => t.id === towerId);
    if (!towerToUpgrade || gameState !== 'playing') return;

    const towerTypeData = towerTypes[towerToUpgrade.type];
    const currentLevel = towerToUpgrade.level;

    if (currentLevel >= towerTypeData.levels.length) return; 

    const upgradeCost = towerTypeData.upgradeCosts[currentLevel - 1];
    if (coins < upgradeCost) return; 

    setCoins(c => c - upgradeCost);
    setTowers(prevTowers => prevTowers.map(t => {
      if (t.id === towerId) {
        const nextLevel = currentLevel + 1;
        const nextLevelStats = getTowerStats(t.type, nextLevel, towerTypes);
        if (!nextLevelStats) return t;
        return {
          ...t,
          level: nextLevel,
          damage: nextLevelStats.damage,
          range: nextLevelStats.range,
          attackSpeed: nextLevelStats.attackSpeed,
          projectileSize: nextLevelStats.projectileSize,
          projectileColor: nextLevelStats.projectileColor,
          hp: t.maxHp, 
        };
      }
      return t;
    }));
  };
  
  const calculateSellValue = (tower) => {
    if (!tower) return 0;
    const towerTypeData = towerTypes[tower.type];
    let refundAmount = Math.floor(towerTypeData.cost * 0.6); 
    for (let i = 0; i < tower.level - 1; i++) {
        if (towerTypeData.upgradeCosts && towerTypeData.upgradeCosts[i]) {
            refundAmount += Math.floor(towerTypeData.upgradeCosts[i] * 0.5); 
        }
    }
    return refundAmount;
  };

  const handleSellTower = (towerId) => {
    const towerToSell = towers.find(t => t.id === towerId);
    if (!towerToSell || gameState !== 'playing') return;
    
    const sellValue = calculateSellValue(towerToSell);
    setCoins(c => c + sellValue);
    setTowers(prevTowers => prevTowers.filter(t => t.id !== towerId));
    setInspectingTowerId(null); 
  };


  const togglePause = () => {
    setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'));
  };

  const restartGame = () => {
    setGameState('playing');
    setHealth(750);
    setCoins(150);
    setKeys(0); 
    setWave(1);
    setScore(0);
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setEnemyProjectiles([]);
    setExplosions([]); // Reset explosions
    setSelectedTowerType(null);
    setShowTowerMenu(false);
    setInspectingTowerId(null);
  };
  
  const inspectedTowerDetails = inspectingTowerId ? towers.find(t => t.id === inspectingTowerId) : null;
  let currentTowerStatsForInspector = null;
  if (inspectedTowerDetails) {
    currentTowerStatsForInspector = getTowerStats(inspectedTowerDetails.type, inspectedTowerDetails.level, towerTypes);
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-gray-900 p-2 sm:p-4 flex flex-col items-center overflow-hidden font-sans">
      <div className="text-center mb-2 sm:mb-4 w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">🏰 Tower Defense Supreme 🏰</h1>
      </div>

      {/* Cải tiến stats panel */}
      <div className="bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-md rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 w-full max-w-3xl shadow-2xl border border-white/10">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-sm"> {/* Adjusted grid for 3 cols on smallest, 5 on sm+ */}
          <div className="flex items-center gap-1 bg-red-700/30 px-2 py-1.5 rounded-lg border border-red-500/50">
            <span className="text-lg">❤️</span>
            <div className="flex-1">
                <span className="text-white font-bold block text-xs sm:text-sm">{health} / {maxHealth}</span>
                <div className="h-1.5 sm:h-2 bg-red-900/70 rounded-full mt-0.5">
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300" style={{ width: `${(health / maxHealth) * 100}%` }} />
                </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-600/30 px-2 py-1.5 rounded-lg border border-yellow-500/50">
            <span className="text-lg">🪙</span> <span className="text-white font-bold text-sm sm:text-base">{coins}</span>
          </div>
           <div className="flex items-center gap-1.5 bg-teal-600/30 px-2 py-1.5 rounded-lg border border-teal-500/50">
            <span className="text-lg">🔑</span> <span className="text-white font-bold text-sm sm:text-base">{keys}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-600/30 px-2 py-1.5 rounded-lg border border-blue-500/50 col-span-1 sm:col-span-1"> {/* Ensure Wave and Score take one column each on small screens if 3 cols */}
            <span className="text-lg">🌊</span> <span className="text-white font-bold text-sm sm:text-base">Wave {wave}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-600/30 px-2 py-1.5 rounded-lg border border-purple-500/50 col-span-1 sm:col-span-1">
            <span className="text-lg">⭐</span> <span className="text-white font-bold text-sm sm:text-base">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-3 sm:mb-4">
        <div
          className="relative bg-green-500/70 border-2 border-green-900/50 rounded-lg shadow-2xl"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
        >
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => {
              const isOnPath = path.some(p => p.x === x && p.y === y);
              const isPotentiallyBuildable = !isOnPath && selectedTowerType;
              // Cải tiến hiệu ứng visual cho path
              let cellBgColor = isOnPath ? 'rgba(160, 82, 45, 0.8)' : 'rgba(60, 179, 113, 0.15)'; 
              let hoverEffect = '';
              let cursorClass = 'cursor-default';
              const pathClasses = isOnPath ? 'animate-pulse border-amber-400/50' : '';

              if (isPotentiallyBuildable) {
                const towerCost = towerTypes[selectedTowerType].cost;
                if (coins >= towerCost) {
                  cellBgColor = 'rgba(144, 238, 144, 0.3)'; 
                  hoverEffect = 'hover:bg-lime-400/40';
                  cursorClass = 'cursor-pointer';
                } else {
                  cellBgColor = 'rgba(255, 150, 150, 0.3)'; 
                  hoverEffect = '';
                  cursorClass = 'cursor-not-allowed';
                }
              } else if (!isOnPath) {
                 cursorClass = 'cursor-pointer';
              }
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`absolute border transition-colors duration-150 ${hoverEffect} ${cursorClass} ${pathClasses} ${isOnPath ? 'border-amber-400/50' : 'border-green-800/30'}`}
                  style={{
                    left: x * CELL_SIZE, top: y * CELL_SIZE,
                    width: CELL_SIZE, height: CELL_SIZE,
                    backgroundColor: cellBgColor
                  }}
                  onClick={() => {
                    if (isOnPath) return;
                    const existingTower = towers.find(t => t.x === x && t.y ===y);
                    if (existingTower) {
                        handleTowerClick(existingTower);
                    } else if (selectedTowerType) {
                        handleCellClick(x, y);
                    } else {
                        setInspectingTowerId(null);
                        setSelectedTowerType(null);
                    }
                  }}
                />
              );
            })
          )}

          {towers.map(tower => {
            const towerIconDetails = towerTypes[tower.type];
            return (
              <div key={tower.id}>
                {/* Cải tiến tower design */}
                <div
                  className={`absolute rounded-full border-2 border-black/40 flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg backdrop-blur-sm ${towerIconDetails?.color || 'bg-gray-500'} hover:shadow-xl`}
                  style={{
                      left: tower.x * CELL_SIZE + (CELL_SIZE * 0.1), 
                      top: tower.y * CELL_SIZE + (CELL_SIZE * 0.1),
                      width: CELL_SIZE * 0.8, 
                      height: CELL_SIZE * 0.8,
                      zIndex: 5,
                      background: `linear-gradient(135deg, ${towerIconDetails?.color?.replace('bg-', '').includes('gray') ? '#6b7280' : towerIconDetails?.color?.includes('red') ? '#dc2626' : towerIconDetails?.color?.includes('blue') ? '#2563eb' : '#374151'}, ${towerIconDetails?.color?.replace('bg-', '').includes('gray') ? '#4b5563' : towerIconDetails?.color?.includes('red') ? '#991b1b' : towerIconDetails?.color?.includes('blue') ? '#1d4ed8' : '#1f2937'})`
                  }}
                  onClick={() => handleTowerClick(tower)}
                >
                  {towerIconDetails?.icon || '?'}
                  {/* Cải tiến level badge */}
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded-full px-1.5 py-0.5 leading-none shadow-lg border border-yellow-300 animate-pulse">
                      {tower.level}
                  </span>
                </div>
                {tower.hp < tower.maxHp && (
                  <div
                    className="absolute w-full h-1 bg-red-900 rounded-sm"
                    style={{
                      left: tower.x * CELL_SIZE + (CELL_SIZE * 0.1),
                      top: tower.y * CELL_SIZE + (CELL_SIZE * 0.05),
                      width: CELL_SIZE * 0.8,
                      zIndex: 6
                    }}
                  >
                    <div
                      className="h-full bg-green-500 rounded-sm transition-all duration-200"
                      style={{ width: `${(tower.hp / tower.maxHp) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {enemies.map(enemy => (
            <div
                key={enemy.id}
                className="absolute"
                style={{
                    left: enemy.x - 15, 
                    top: enemy.y - 15 - 8, 
                    width: 30,
                    zIndex: 10 
                }}
            >
                {/* Cải tiến thanh HP enemy với gradient */}
                <div className="w-full h-2 bg-gray-900/90 rounded-full mb-0.5 shadow-sm border border-gray-600/50">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-200 shadow-inner"
                        style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                    />
                </div>
                {/* Thêm hiệu ứng cho enemies */}
                <div
                    className="rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-purple-900/70 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform duration-200"
                    style={{ width: 30, height: 30 }}
                >
                    {enemy.type}
                </div>
            </div>
          ))}

          {/* Cải tiến projectiles với glow effect */}
          {projectiles.map(p => (
            <div
              key={p.id}
              className={`absolute ${p.color} rounded-full shadow-lg border border-white/30`}
              style={{
                left: p.x - (p.size / 2), top: p.y - (p.size / 2),
                width: p.size, height: p.size,
                zIndex: 15,
                boxShadow: `0 0 ${p.size/2}px ${p.color.includes('orange') ? '#f97316' : p.color.includes('cyan') ? '#06b6d4' : '#64748b'}40`
              }}
            />
          ))}

          {/* Cải tiến enemy projectiles */}
          {enemyProjectiles.map(p => (
            <div
              key={p.id}
              className="absolute bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border border-red-300/50"
              style={{
                left: p.x - (p.size / 2), 
                top: p.y - (p.size / 2),
                width: p.size, 
                height: p.size,
                zIndex: 15,
                boxShadow: '0 0 8px #ef444440, 0 0 16px #ef444420'
              }}
            />
          ))}

          {/* Render explosions */}
          {explosions.map(explosion => (
            <div
              key={explosion.id}
              className="absolute animate-ping"
              style={{
                left: explosion.x - 15,
                top: explosion.y - 15,
                width: 30,
                height: 30,
                zIndex: 20
              }}
            >
              <div className="w-full h-full bg-orange-400 rounded-full opacity-75"></div>
            </div>
          ))}

        </div>
      </div>

      {/* BLOCK NÀY ĐÃ ĐƯỢC DI CHUYỂN */}
      <div className="bg-black/50 backdrop-blur-md p-2 sm:p-3 shadow-lg rounded-xl mt-4 w-full max-w-3xl">
        <div className="flex items-center justify-around sm:justify-center sm:gap-4 max-w-2xl mx-auto">
          <button
            onClick={togglePause}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-bold text-white text-lg sm:text-xl shadow-md transition-transform active:scale-95"
          >
            {gameState === 'playing' ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={() => { setShowTowerMenu(!showTowerMenu); setInspectingTowerId(null); setSelectedTowerType(null); }}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-bold text-white text-base sm:text-lg shadow-md transition-transform active:scale-95 ${
              showTowerMenu ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            }`}
          >
            🏗️ Towers
          </button>
          
          {selectedTowerType && towerTypes[selectedTowerType] && (
            <div className="hidden sm:block text-white text-sm bg-blue-700/50 px-3 py-1.5 rounded-md">
              Selected: {towerTypes[selectedTowerType].name}
            </div>
          )}
        </div>
      </div>

      {showTowerMenu && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-end" onClick={() => setShowTowerMenu(false)}>
          <div
            className="w-full bg-gray-800 rounded-t-2xl p-4 shadow-xl animate-slide-up max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-white text-xl font-bold mb-4 text-center">Choose Tower to Build</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(towerTypes).map(([typeKey, towerDef]) => {
                const canAfford = coins >= towerDef.cost;
                const isSelected = selectedTowerType === typeKey;
                const level1Stats = getTowerStats(typeKey, 1, towerTypes);
                return (
                  <button
                    key={typeKey}
                    onClick={() => {
                      if (canAfford || isSelected) {
                        setSelectedTowerType(isSelected ? null : typeKey);
                      }
                      setShowTowerMenu(false); 
                    }}
                    disabled={!canAfford && !isSelected} 
                    className={`p-3 rounded-lg border-2 transition-all transform active:scale-98
                      ${isSelected ? 'border-blue-400 bg-blue-500/30 ring-2 ring-blue-400'
                        : canAfford ? 'border-gray-600 bg-gray-700/60 hover:bg-gray-700'
                        : 'border-red-600/50 bg-red-700/30 opacity-60 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${towerDef.color} rounded-lg flex items-center justify-center text-2xl shadow-inner`}>
                        {towerDef.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-bold text-lg">{towerDef.name}</div>
                        <div className="text-sm text-gray-300">
                          Cost: <span className="text-yellow-400">{towerDef.cost}🪙</span> | Dmg: {level1Stats?.damage} | Range: {level1Stats?.range}
                        </div>
                      </div>
                      {isSelected && <span className="text-blue-300 text-2xl">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {inspectingTowerId && inspectedTowerDetails && currentTowerStatsForInspector && (() => {
          const tower = inspectedTowerDetails;
          const towerTypeData = towerTypes[tower.type];
          const currentLevelStats = currentTowerStatsForInspector;

          const isMaxLevel = tower.level >= towerTypeData.levels.length;
          const upgradeCost = !isMaxLevel ? towerTypeData.upgradeCosts[tower.level - 1] : 0;
          const canAffordUpgrade = coins >= upgradeCost;
          const sellValue = calculateSellValue(tower);
          let nextLevelStats = null;
          if (!isMaxLevel) {
            nextLevelStats = getTowerStats(tower.type, tower.level + 1, towerTypes);
          }

          return (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setInspectingTowerId(null)}>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-white w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">{towerTypeData.name} - Level {tower.level}</h3>
                          <button onClick={() => setInspectingTowerId(null)} className="text-gray-400 hover:text-white text-2xl leading-none p-1">&times;</button>
                      </div>
                      <div className="mb-3 p-3 bg-gray-700/50 rounded-lg">
                          <p className="text-sm">Damage: <span className="font-semibold text-orange-300">{currentLevelStats.damage}</span></p>
                          <p className="text-sm">Range: <span className="font-semibold text-blue-300">{currentLevelStats.range}</span></p>
                          <p className="text-sm">Attack Speed: <span className="font-semibold text-green-300">{(currentLevelStats.attackSpeed / 1000).toFixed(2)}s</span></p>
                          <p className="text-sm">HP: <span className="font-semibold text-red-300">{tower.hp} / {tower.maxHp}</span></p>
                      </div>

                      {!isMaxLevel && nextLevelStats ? (
                          <div className="border-t border-gray-700 pt-3 mt-3">
                              <h4 className="text-lg font-semibold mb-2">Upgrade to Level {tower.level + 1}</h4>
                              <div className="text-sm mb-2 p-2 bg-gray-700/30 rounded">
                                  <p>Damage: <span className="text-orange-400">{nextLevelStats.damage} (+{nextLevelStats.damage - currentLevelStats.damage})</span></p>
                                  <p>Range: <span className="text-blue-400">{nextLevelStats.range} (+{nextLevelStats.range - currentLevelStats.range})</span></p>
                                  <p>Speed: <span className="text-green-400">{(nextLevelStats.attackSpeed / 1000).toFixed(2)}s</span></p>
                              </div>
                              <button
                                  onClick={() => handleUpgradeTower(tower.id)}
                                  disabled={!canAffordUpgrade || gameState !== 'playing'}
                                  className={`w-full px-4 py-2.5 rounded-lg font-bold text-white transition-all transform active:scale-95
                                      ${!canAffordUpgrade ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}
                                      ${gameState !== 'playing' ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                  Upgrade (Cost: {upgradeCost} 🪙)
                              </button>
                              {!canAffordUpgrade && gameState === 'playing' && <p className="text-red-400 text-xs mt-1 text-center">Not enough coins.</p>}
                          </div>
                      ) : (
                          <p className="text-center text-yellow-400 mt-3 p-2 bg-yellow-500/20 rounded">✨ Max Level Reached ✨</p>
                      )}
                      <button
                          onClick={() => handleSellTower(tower.id)}
                          disabled={gameState !== 'playing'}
                          className={`w-full mt-4 px-4 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-all transform active:scale-95 ${gameState !== 'playing' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                          Sell Tower (+{sellValue} 🪙)
                      </button>
                  </div>
              </div>
          );
      })()}


      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-red-500/70 rounded-2xl p-6 sm:p-8 text-center w-full max-w-md shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">💀</div>
            <h2 className="text-3xl font-bold text-red-400 mb-3">Game Over!</h2>
            <div className="bg-black/50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
                <div>
                    <div className="text-blue-400 font-bold text-2xl">{wave -1 }</div>
                    <div className="text-gray-400 text-sm">Waves Survived</div>
                </div>
                <div>
                    <div className="text-purple-400 font-bold text-2xl">{score}</div>
                    <div className="text-gray-400 text-sm">Final Score</div>
                </div>
            </div>
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg w-full transition-transform active:scale-95 shadow-lg"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {gameState === 'paused' && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 cursor-pointer"
          onClick={togglePause}
        >
          <div 
            className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 text-center shadow-xl"
            >
            <div className="text-4xl sm:text-5xl mb-3">▶️</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Game Paused</h2>
            <p className="text-gray-300 text-sm">Tap anywhere to continue</p>
          </div>
        </div>
      )}


      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        /* Loại bỏ shadow-top-lg nếu không cần thiết nữa */
        /* .shadow-top-lg {
            box-shadow: 0 -4px 15px -3px rgba(0, 0, 0, 0.2), 0 -2px 6px -2px rgba(0, 0, 0, 0.14);
        } */
        body {
            overscroll-behavior-y: contain; 
        }
        @keyframes pulse {
            0%, 100% {
                border-color: rgba(251, 191, 36, 0.5); /* amber-400/50 */
            }
            50% {
                border-color: rgba(251, 191, 36, 0.9); /* amber-400/90 */
            }
        }
        .animate-pulse {
            animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
