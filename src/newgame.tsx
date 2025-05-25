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
  // 1. Thêm trạng thái cho đạn của kẻ địch
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);

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
      // 2. Cập nhật cấu trúc enemy để có khả năng bắn
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
  }, []);

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
      }
    });
  }, [towers, enemies]); // Removed towerTypes from here as it's constant

  // 3. Thêm logic bắn của kẻ địch
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
        // Cập nhật lastShot cho enemy
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

  // 4. Thêm logic di chuyển đạn enemy
  const moveEnemyProjectiles = useCallback(() => {
    setEnemyProjectiles(prevProjectiles => prevProjectiles.map(projectile => {
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < projectile.speed) {
        // Tìm tower bị trúng và gây sát thương
        setTowers(prevTowers => prevTowers.map(tower => {
          if (tower.id === projectile.targetTowerId) {
            const newHp = (tower.hp || 100) - projectile.damage; // Use 100 as default if hp is not yet set
            if (newHp <= 0) {
              // Tower bị phá hủy
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

  useEffect(() => {
    if (gameState !== 'playing') {
        clearInterval(gameLoopRef.current);
        return;
    }
    // 6. Cập nhật game loop
    gameLoopRef.current = setInterval(() => {
      moveEnemies();
      towerShooting();
      enemyShooting(); // Thêm dòng này
      moveProjectiles();
      moveEnemyProjectiles(); // Thêm dòng này
    }, 50); 
    // Và cập nhật dependency array
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, moveEnemies, towerShooting, enemyShooting, moveProjectiles, moveEnemyProjectiles]);

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
    
    if (gameState === 'playing') { // Start spawning only if playing
        doSpawn(); 
    }
    
    return () => clearTimeout(enemySpawnRef.current);
  }, [gameState, spawnEnemy, wave]);


  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
      setGameState('gameOver');
    }
  }, [health, gameState]);

  useEffect(() => {
    if (enemies.length === 0 && gameState === 'playing' && wave > 0 ) { // Added wave > 0 to prevent immediate trigger on game start if enemies array is initially empty
        // Check if all enemies for the current wave have been spawned and defeated
        // This condition might need refinement based on how `enemiesToSpawnThisWave` is tracked globally or if wave advancement is purely based on empty enemies array.
        // For now, assuming `enemies.length === 0` after a wave is sufficient.
        const waveClearTimer = setTimeout(() => {
            if (enemies.length === 0 && gameState === 'playing') { 
                 setWave(w => w + 1);
                 setCoins(c => c + 50 + (w + 1) * 10); // Use w+1 for next wave's bonus
                 setScore(s => s + (w + 1) * 100); 
            }
        }, 3000); 
        return () => clearTimeout(waveClearTimer);
    }
  }, [enemies.length, gameState, wave]);


  const handleCellClick = (x, y) => {
    if (!selectedTowerType || gameState !== 'playing') return;
    if (inspectingTowerId) setInspectingTowerId(null); 

    const isOnPath = path.some(p => p.x === x && p.y === y);
    if (isOnPath) {
        // Optionally provide feedback: e.g., set a temporary message "Cannot build on path"
        return;
    }

    const hasTower = towers.some(t => t.x === x && t.y === y);
    if (hasTower) {
        // Optionally provide feedback: "Cell occupied"
        return;
    }

    const towerTypeDefinition = towerTypes[selectedTowerType];
    if (coins < towerTypeDefinition.cost) {
        // Optionally provide feedback: "Not enough coins"
        return;
    }
    
    const initialLevelStats = getTowerStats(selectedTowerType, 1, towerTypes);
    if (!initialLevelStats) return; // Should not happen

    // 5. Thêm HP cho towers
    const newTower = {
      id: Date.now() + Math.random(),
      x, y,
      type: selectedTowerType, 
      level: 1,
      hp: 100,
      maxHp: 100,
      // Stats will be derived from type and level via getTowerStats in rendering/logic,
      // but can store current for direct access if preferred (as done in original shooting logic)
      // For consistency, let's ensure tower objects store their current operational stats
      damage: initialLevelStats.damage,
      range: initialLevelStats.range,
      attackSpeed: initialLevelStats.attackSpeed,
      projectileSize: initialLevelStats.projectileSize,
      projectileColor: initialLevelStats.projectileColor,
      lastShot: 0,
      color: towerTypeDefinition.color, // Base color for the tower visual
      icon: towerTypeDefinition.icon,   // Base icon
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

    const upgradeCost = towerTypeData.upgradeCosts[currentLevel - 1]; // currentLevel is 1-based
    if (coins < upgradeCost) return; 

    setCoins(c => c - upgradeCost);
    setTowers(prevTowers => prevTowers.map(t => {
      if (t.id === towerId) {
        const nextLevel = currentLevel + 1;
        const nextLevelStats = getTowerStats(t.type, nextLevel, towerTypes);
        if (!nextLevelStats) return t; // Should not happen
        return {
          ...t,
          level: nextLevel,
          // Update stats on the tower object
          damage: nextLevelStats.damage,
          range: nextLevelStats.range,
          attackSpeed: nextLevelStats.attackSpeed,
          projectileSize: nextLevelStats.projectileSize,
          projectileColor: nextLevelStats.projectileColor,
          // HP should be restored to max HP on upgrade or scaled
          // For simplicity, let's restore to maxHp
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
    // 9. Reset trạng thái khi restart
    setEnemyProjectiles([]);
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

      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 w-full max-w-3xl shadow-lg">
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
              let cellBgColor = isOnPath ? 'rgba(160, 82, 45, 0.6)' : 'rgba(60, 179, 113, 0.15)'; 
              let hoverEffect = '';
              let cursorClass = 'cursor-default';

              if (isPotentiallyBuildable) {
                const towerCost = towerTypes[selectedTowerType].cost;
                if (coins >= towerCost) {
                  cellBgColor = 'rgba(144, 238, 144, 0.3)'; 
                  hoverEffect = 'hover:bg-lime-400/40';
                  cursorClass = 'cursor-pointer';
                } else {
                  cellBgColor = 'rgba(255, 150, 150, 0.3)'; 
                  hoverEffect = ''; // No hover effect if cannot afford
                  cursorClass = 'cursor-not-allowed';
                }
              } else if (!isOnPath) {
                 // Make non-path cells clickable to open tower inspection if a tower exists, or deselect build mode
                 cursorClass = 'cursor-pointer';
              }
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`absolute border border-green-800/30 transition-colors duration-150 ${hoverEffect} ${cursorClass}`}
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
                        // just deselect if clicked on empty buildable and not in build mode
                        setInspectingTowerId(null);
                        setSelectedTowerType(null);
                    }
                  }}
                />
              );
            })
          )}

          {/* 8. Hiển thị HP của tower */}
          {towers.map(tower => {
            const towerIconDetails = towerTypes[tower.type];
            return (
              <div key={tower.id}>
                <div
                  className={`absolute rounded-full border-2 border-black/70 flex items-center justify-center text-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md ${towerIconDetails?.color || 'bg-gray-500'}`}
                  style={{
                      left: tower.x * CELL_SIZE + (CELL_SIZE * 0.1), 
                      top: tower.y * CELL_SIZE + (CELL_SIZE * 0.1),
                      width: CELL_SIZE * 0.8, 
                      height: CELL_SIZE * 0.8,
                      zIndex: 5
                  }}
                  onClick={() => handleTowerClick(tower)}
                >
                  {towerIconDetails?.icon || '?'}
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-xs font-bold rounded-full px-1.5 py-0.5 leading-none shadow">
                      {tower.level}
                  </span>
                </div>
                {/* Thêm thanh HP */}
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
                <div className="w-full h-1.5 bg-gray-700/80 rounded-sm mb-0.5 shadow-sm">
                    <div
                        className="h-full bg-red-500 rounded-sm transition-all duration-100"
                        style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                    />
                </div>
                <div
                    className="rounded-full bg-purple-600/80 border-2 border-purple-900/70 flex items-center justify-center text-xl shadow"
                    style={{ width: 30, height: 30 }}
                >
                    {enemy.type}
                </div>
            </div>
          ))}

          {projectiles.map(p => (
            <div
              key={p.id}
              className={`absolute ${p.color} rounded-full shadow-md`}
              style={{
                left: p.x - (p.size / 2), top: p.y - (p.size / 2),
                width: p.size, height: p.size,
                zIndex: 15 
              }}
            />
          ))}

          {/* 7. Render đạn của kẻ địch */}
          {enemyProjectiles.map(p => (
            <div
              key={p.id}
              className={`absolute ${p.color} rounded-full shadow-md`}
              style={{
                left: p.x - (p.size / 2), 
                top: p.y - (p.size / 2),
                width: p.size, 
                height: p.size,
                zIndex: 15 
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md p-2 sm:p-3 shadow-top-lg z-30">
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
                      if (canAfford || isSelected) { // Allow selecting if can afford, or deselecting
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
          const currentLevelStats = currentTowerStatsForInspector; // Already fetched

          const isMaxLevel = tower.level >= towerTypeData.levels.length;
          const upgradeCost = !isMaxLevel ? towerTypeData.upgradeCosts[tower.level - 1] : 0; // tower.level is 1-based
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
                    <div className="text-blue-400 font-bold text-2xl">{wave -1 }</div> {/* Show wave reached, not next wave */}
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

      {/* Pause Overlay - Mobile -- MODIFIED SECTION -- */}
      {gameState === 'paused' && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 cursor-pointer" // Added cursor-pointer
          onClick={togglePause} // Added onClick to the overlay itself
        >
          <div 
            className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 text-center shadow-xl"
            // onClick={e => e.stopPropagation()} // Stop propagation if you don't want clicks on the inner box to also trigger the overlay's onClick (though here it's fine)
            >
            <div className="text-4xl sm:text-5xl mb-3">▶️</div> {/* Changed icon to Play */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Game Paused</h2>
            <p className="text-gray-300 text-sm">Tap anywhere to continue</p> {/* Changed message */}
          </div>
        </div>
      )}
      {/* -- END OF MODIFIED SECTION -- */}


      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .shadow-top-lg {
            box-shadow: 0 -4px 15px -3px rgba(0, 0, 0, 0.2), 0 -2px 6px -2px rgba(0, 0, 0, 0.14);
        }
        body {
            overscroll-behavior-y: contain; 
        }
      `}</style>
    </div>
  );
};

export default App;
