import React, { useState, useEffect, useRef } from 'react';

// --- Icon URL ---
const closeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png';
// === THÊM MỚI: URL hình nền cho hiệu ứng kính ===
const backgroundImageUrl = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80';


// --- Component Props Interface ---
interface TowerExplorerGameProps {
  onClose: () => void;
}

// --- Các hằng số điều chỉnh game ---
const ACTION_DELAY = 1400;
const IMPACT_DELAY = 300;
const AUTO_ATTACK_DELAY = ACTION_DELAY + IMPACT_DELAY * 2;
const TOTAL_FLOORS = 100; // Tổng số tầng trong tháp
const FLOORS_TO_SHOW = 9;  // Số tầng hiển thị trong khung nhìn

// --- Component chứa các style cho animation ---
const GameStyles = () => (
  <style>{`
    @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
    .animate-shake { animation: shake 0.5s ease-in-out; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }

    /* CSS để ẩn thanh cuộn */
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Dành cho Chrome, Safari, and Opera */
    }
    .hide-scrollbar {
      -ms-overflow-style: none;  /* Dành cho IE and Edge */
      scrollbar-width: none;  /* Dành cho Firefox */
    }
  `}</style>
);

// --- Các Helper Components ---

const HealthBar = ({ current, max, colorClass, bgColorClass }) => (
    <div className={`w-full ${bgColorClass} rounded-full h-3 shadow-inner`}>
      <div className={`${colorClass} h-3 rounded-full transition-all duration-500 ease-out`} style={{ width: `${(current / max) * 100}%` }}></div>
      <div className="text-xs font-bold text-white text-shadow-sm text-center -mt-3.5">{current} / {max}</div>
    </div>
);

const LogMessage = ({ log }) => {
    const getColor = () => {
      if (log.includes('dealt')) return 'text-red-400';
      if (log.includes('gained')) return 'text-yellow-400';
      if (log.includes('defeated!')) return 'text-green-400';
      return 'text-gray-300';
    };
    return <div className={`animate-fade-in-up ${getColor()}`}>{log}</div>;
};

const CombatantView = ({ name, avatar, avatarClass, currentHealth, maxHealth, healthBarColor, isHit }) => (
    <div className={`flex flex-col items-center p-4 space-y-3 w-36 transition-transform duration-300 ${isHit ? 'animate-shake' : ''}`}>
        <h3 className="text-lg font-bold truncate">{name}</h3>
        <div className={`text-6xl ${avatarClass}`}>{avatar}</div>
        <div className="w-full"><HealthBar current={currentHealth} max={maxHealth} colorClass={healthBarColor} bgColorClass="bg-gray-700/50"/></div>
    </div>
);

// === THAY ĐỔI: Cập nhật component FloorSelectionScreen để có hiệu ứng kính ===
const FloorSelectionScreen = ({ highestFloorCleared, onSelectFloor }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const centerOffset = Math.floor(FLOORS_TO_SHOW / 2);
  const currentChallengeFloor = highestFloorCleared + 1;

  let startFloor = Math.max(1, currentChallengeFloor - centerOffset);
  let endFloor = startFloor + FLOORS_TO_SHOW - 1;

  if (endFloor > TOTAL_FLOORS) {
    endFloor = TOTAL_FLOORS;
    startFloor = Math.max(1, endFloor - FLOORS_TO_SHOW + 1);
  }
  
  const floorsToDisplay = Array.from({ length: endFloor - startFloor + 1 }, (_, i) => startFloor + i);
  
  useEffect(() => {
    const currentFloorElement = scrollRef.current?.querySelector(`#floor-${currentChallengeFloor}`);
    if (currentFloorElement) {
      currentFloorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentChallengeFloor]);

  const getFloorStatus = (floor) => {
    if (floor <= highestFloorCleared) return 'completed';
    if (floor === currentChallengeFloor) return 'current';
    return 'locked';
  };
  
  // Cập nhật style cho hiệu ứng kính
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed': return { 
        icon: '✅', label: 'Farm', 
        classes: 'bg-green-500/10 hover:bg-green-500/20 border-green-400/20 hover:border-green-400/30', 
        textColor: 'text-green-300' 
      };
      case 'current': return { 
        icon: '⚔️', label: 'Challenge', 
        classes: 'bg-yellow-400/20 hover:bg-yellow-400/30 border-yellow-300/30 animate-pulse shadow-lg shadow-yellow-500/10', 
        textColor: 'text-yellow-200' 
      };
      default: return { 
        icon: '🔒', label: 'Locked', 
        classes: 'bg-black/20 border-white/10 cursor-not-allowed', 
        textColor: 'text-gray-500' 
      };
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center animate-fade-in">
        <div ref={scrollRef} className="w-full max-w-md space-y-3 overflow-y-auto p-4 flex-grow hide-scrollbar">
            {floorsToDisplay.map(floor => {
                const status = getFloorStatus(floor);
                const { icon, label, classes, textColor } = getStatusInfo(status);
                const isLocked = status === 'locked';
                return (
                    <button
                        key={floor} id={`floor-${floor}`} onClick={() => !isLocked && onSelectFloor(floor)} disabled={isLocked}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${classes}`}
                    >
                        <div className="flex items-center">
                            {status !== 'completed' && (
                                <span className={`text-2xl mr-4 ${isLocked ? 'opacity-50' : ''}`}>{icon}</span>
                            )}
                            <div>
                                <h3 className={`font-bold text-lg text-left ${textColor}`}>{`Floor ${floor}`}</h3>
                                {status === 'completed' && (
                                    <div className="flex items-center mt-1 text-xs text-green-400/80">
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Cleared</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${textColor}`}>{label}</span>
                    </button>
                );
            })}
        </div>
    </div>
  );
};


const BattleLogModal = ({ logs, isOpen, onClose, logRef }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up backdrop-blur-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-200">Battle Log</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><span className="text-2xl">×</span></button>
        </div>
        <div ref={logRef} className="text-sm space-y-2 h-80 overflow-y-auto pr-2 bg-black/20 p-4 rounded-md">
          {logs && logs.length > 0 ? logs.map((log, index) => <LogMessage key={index} log={log} />) : <p className="text-gray-400">No battle has occurred yet.</p>}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
      </div>
    </div>
  );
};

// --- Component Chính Của Game ---
const TowerExplorerGame = ({ onClose }: TowerExplorerGameProps) => {
  const [highestFloorCleared, setHighestFloorCleared] = useState(5);
  const [battleFloor, setBattleFloor] = useState(1);
  const [playerStats, setPlayerStats] = useState({ health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 1500, gems: 20 });
  const [gameState, setGameState] = useState<'floor_selection' | 'fighting' | 'victory' | 'defeat'>('floor_selection');
  const [battleState, setBattleState] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [autoAttack, setAutoAttack] = useState(false);
  const [animationState, setAnimationState] = useState({ playerHit: false, monsterHit: false });
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const battleLogRef = useRef(null);
  
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleState?.battleLog, isLogModalOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isLogModalOpen) setIsLogModalOpen(false);
        else if (gameState !== 'floor_selection') setGameState('floor_selection');
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogModalOpen, onClose, gameState]);
  
  useEffect(() => {
    if (autoAttack && gameState === 'fighting' && battleState?.turn === 'player' && battleState.monsterHealth > 0) {
      const attackTimeout = setTimeout(() => attackMonster(), AUTO_ATTACK_DELAY / 2); 
      return () => clearTimeout(attackTimeout);
    }
  }, [autoAttack, gameState, battleState]);

  const generateMonster = (floor) => {
    const baseHealth = 30 + floor * 15;
    const baseAttack = 8 + floor * 3;
    const monsters = [
      { name: 'Goblin', emoji: '👹', color: 'text-green-400' }, { name: 'Orc', emoji: '👺', color: 'text-red-400' },
      { name: 'Knight', emoji: '🗡️', color: 'text-purple-400' }, { name: 'Demon', emoji: '🔥', color: 'text-orange-400' },
      { name: 'Golem', emoji: '❄️', color: 'text-blue-400' }, { name: 'Shadow', emoji: '👤', color: 'text-gray-400' }
    ];
    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    return { ...monster, health: baseHealth, maxHealth: baseHealth, attack: baseAttack, floor: floor };
  };

  const generateRewards = (floor) => {
    const rewardModifier = floor > highestFloorCleared ? 1.0 : 0.4;
    const baseCoins = (50 + floor * 25) * rewardModifier;
    const baseGems = Math.floor(floor / 3) + 1;
    const gemChance = floor > highestFloorCleared ? 0.3 : 0.1;
    return { 
        coins: Math.ceil(baseCoins + Math.floor(Math.random() * 50 * rewardModifier)), 
        gems: (Math.random() < gemChance ? baseGems : 0)
    };
  };

  const handleSelectFloor = (floor) => {
    setBattleFloor(floor);
    startBattle(floor);
  };
  
  const startBattle = (floor) => {
    const monster = generateMonster(floor);
    setBattleState({
      monster, playerHealth: playerStats.health, monsterHealth: monster.health,
      turn: 'player', battleLog: [`Entering Floor ${floor}... A ${monster.name} ${monster.emoji} appears!`]
    });
    setGameState('fighting');
  };

  const attackMonster = () => {
    if (!battleState || battleState.turn !== 'player') return;

    setBattleState(p => ({ ...p, turn: 'attacking' }));
    const damage = Math.max(1, playerStats.attack - Math.floor(Math.random() * 5));
    const newMonsterHealth = Math.max(0, battleState.monsterHealth - damage);
    
    setAnimationState({ playerHit: false, monsterHit: true });
    setTimeout(() => setAnimationState(p => ({ ...p, monsterHit: false })), 500);

    setTimeout(() => {
      let newLog = [...battleState.battleLog, `You dealt ${damage} damage!`];
      setBattleState(p => ({ ...p, monsterHealth: newMonsterHealth, battleLog: newLog }));

      if (newMonsterHealth <= 0) {
        const floorRewards = generateRewards(battleFloor);
        setRewards(floorRewards);
        setPlayerStats(p => ({ ...p, coins: p.coins + floorRewards.coins, gems: p.gems + floorRewards.gems }));
        newLog.push(`${battleState.monster.name} defeated!`, `You gained ${floorRewards.coins} coins and ${floorRewards.gems} gems.`);
        setBattleState(p => ({ ...p, monsterHealth: 0, battleLog: newLog }));
        setTimeout(() => setGameState('victory'), 1000);
        return;
      }
      
      setBattleState(p => ({ ...p, turn: 'monster' }));

      setTimeout(() => {
        const monsterDamage = Math.max(1, battleState.monster.attack - playerStats.defense + Math.floor(Math.random() * 3));
        const newPlayerHealth = Math.max(0, battleState.playerHealth - monsterDamage);

        setAnimationState({ playerHit: true, monsterHit: false });
        setTimeout(() => setAnimationState(p => ({ ...p, playerHit: false })), 500);
        
        setTimeout(() => {
          let monsterAttackLog = [...newLog, `${battleState.monster.name} dealt ${monsterDamage} damage!`];
          if (newPlayerHealth <= 0) {
            setBattleState(p => ({ ...p, playerHealth: 0, battleLog: [...monsterAttackLog, "You have been defeated!"] }));
            setGameState('defeat');
          } else {
            setBattleState(p => ({ ...p, playerHealth: newPlayerHealth, battleLog: monsterAttackLog, turn: 'player' }));
          }
        }, IMPACT_DELAY);
      }, ACTION_DELAY);
    }, IMPACT_DELAY);
  };
  
  const returnToMap = () => {
    if (battleFloor > highestFloorCleared) {
      setHighestFloorCleared(battleFloor);
    }
    setPlayerStats(p => ({ ...p, health: Math.min(p.maxHealth, p.health + Math.ceil(p.maxHealth * 0.1)) }));
    setGameState('floor_selection');
    setRewards(null);
    setBattleState(null);
  };
  
  const handleDefeat = () => {
    setGameState('floor_selection');
    setBattleState(null);
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800/50 backdrop-blur-sm text-gray-100 font-sans animate-fade-in">
      <GameStyles />
      <div className="w-full h-full bg-gray-900/80 flex flex-col relative animate-fade-in-up">
        {/* Header */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 transition-opacity hover:opacity-80" aria-label="Đóng" title="Đóng Tháp (Esc)">
            <img src={closeIconUrl} alt="Close" className="w-6 h-6" />
        </button>
        <div className="bg-gradient-to-r from-purple-800/80 to-indigo-800/80 text-white p-4 border-b border-purple-500/30 text-center backdrop-blur-sm">
            <h1 className="text-2xl font-bold tracking-wider">Tower of Valor</h1>
            {gameState !== 'floor_selection' && (
                <div className="text-lg font-semibold mt-1 opacity-80">Floor {battleFloor}</div>
            )}
        </div>
        
        {/* Thanh chỉ số (Chỉ hiện khi chiến đấu) */}
        {gameState !== 'floor_selection' && (
            <div className="p-4 bg-black/30 animate-fade-in backdrop-blur-sm">
                <div className="flex justify-around items-center text-sm md:text-base">
                    <div className="flex items-center space-x-2" title="Health"><span className="text-lg">❤️</span><span className="font-semibold">{battleState?.playerHealth ?? playerStats.health}/{playerStats.maxHealth}</span></div>
                    <div className="flex items-center space-x-2" title="Attack"><span className="text-lg">⚔️</span><span className="font-semibold">{playerStats.attack}</span></div>
                    <div className="flex items-center space-x-2" title="Defense"><span className="text-lg">🛡️</span><span className="font-semibold">{playerStats.defense}</span></div>
                    <div className="flex items-center space-x-2" title="Coins"><span className="text-yellow-400 text-lg">💰</span><span className="font-semibold">{playerStats.coins}</span></div>
                    <div className="flex items-center space-x-2" title="Gems"><span className="text-purple-400 text-lg">💎</span><span className="font-semibold">{playerStats.gems}</span></div>
                </div>
            </div>
        )}
        
        {/* === THAY ĐỔI: Thêm hình nền vào đây === */}
        <div 
          className="flex-grow min-h-0 relative flex flex-col items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
           {/* Thêm một lớp phủ tối để chữ dễ đọc hơn */}
           <div className="absolute inset-0 bg-black/40"></div>
           <div className="relative w-full h-full z-10">
              {gameState === 'floor_selection' && (
                <FloorSelectionScreen 
                    highestFloorCleared={highestFloorCleared} 
                    onSelectFloor={handleSelectFloor}
                />
              )}
              {/* Các màn hình fighting, victory, defeat sẽ hiển thị trên một lớp phủ khác để rõ ràng hơn */}
              {(gameState === 'fighting' || gameState === 'victory' || gameState === 'defeat') && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center">
                  {gameState === 'fighting' && battleState && (
                    <div className="w-full h-full flex flex-col justify-between animate-fade-in p-4">
                        <div className="text-center mb-2 animate-fade-in h-[28px] flex items-center justify-center">
                            {battleState.monsterHealth > 0 ? (
                                <h4 className={`text-xl font-bold transition-colors duration-300 ${battleState.turn === 'monster' ? 'text-red-400' : 'text-green-400'}`}>
                                    {battleState.turn === 'monster' ? `${battleState.monster.name}'s Turn` : "Your Turn"}
                                </h4>
                            ) : (
                                <h4 className="text-xl font-bold text-yellow-400">Battle Over!</h4>
                            )}
                        </div>
                        <div className="w-full flex justify-around items-start px-4 md:px-16">
                            <CombatantView name="You" avatar="🦸" currentHealth={battleState.playerHealth} maxHealth={playerStats.maxHealth} healthBarColor="bg-gradient-to-r from-green-500 to-green-400" isHit={animationState.playerHit} />
                            <div className="text-4xl text-gray-500 pt-12">⚔️</div>
                            <CombatantView name={battleState.monster.name} avatar={battleState.monster.emoji} avatarClass={battleState.monster.color} currentHealth={battleState.monsterHealth} maxHealth={battleState.monster.maxHealth} healthBarColor="bg-gradient-to-r from-red-500 to-red-400" isHit={animationState.monsterHit} />
                        </div>
                        <div className="text-center">
                            <button onClick={attackMonster} disabled={battleState.turn !== 'player' || autoAttack} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait">
                              Attack!
                            </button>
                        </div>
                    </div>
                  )}
                  {gameState === 'victory' && (
                    <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in p-4">
                        <div className="text-7xl mb-4">🏆</div>
                        <h2 className="text-3xl font-bold mb-4 text-yellow-300">VICTORY!</h2>
                        {rewards && (
                          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6 w-full max-w-xs">
                            <h3 className="text-lg font-bold text-yellow-400 mb-3 border-b border-yellow-400/20 pb-2">Floor Cleared! Rewards:</h3>
                            <div className="flex justify-center space-x-6 text-lg">
                              <div className="flex items-center space-x-2"><span className="text-yellow-400">💰</span><span>+{rewards.coins}</span></div>
                              <div className="flex items-center space-x-2"><span className="text-purple-400">💎</span><span>+{rewards.gems}</span></div>
                            </div>
                          </div>
                        )}
                        <button onClick={returnToMap} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300">
                            <span className="mr-2 text-xl">🗺️</span><span>Return to Map</span>
                        </button>
                    </div>
                  )}
                  {gameState === 'defeat' && (
                    <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in p-4">
                        <div className="text-7xl mb-4">💀</div>
                        <h2 className="text-3xl font-bold mb-4 text-red-500">DEFEATED</h2>
                        <p className="text-gray-400 mb-8">Your journey paused on Floor {battleFloor}.</p>
                        <button onClick={handleDefeat} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all duration-300">
                            <span className="mr-2 text-xl">🗺️</span><span>Return to Map</span>
                        </button>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
        
        {/* Footer (Chỉ hiện khi chiến đấu) */}
        {gameState !== 'floor_selection' && (
            <div className="bg-gray-900/80 p-4 border-t border-purple-500/30 flex justify-between items-center animate-fade-in backdrop-blur-sm">
                <button onClick={() => setIsLogModalOpen(true)} className="bg-gray-700/50 hover:bg-gray-600/70 border border-white/10 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50" disabled={!battleState}>
                    📜 View Log
                </button>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-sm font-medium">Auto Attack</span>
                    <div className="relative">
                        <input type="checkbox" checked={autoAttack} onChange={(e) => setAutoAttack(e.target.checked)} className="sr-only"/>
                        <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoAttack ? 'transform translate-x-full bg-green-400' : ''}`}></div>
                    </div>
                </label>
            </div>
        )}
      </div>
      
      <BattleLogModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)}
        logs={battleState?.battleLog}
        logRef={battleLogRef}
      />
    </div>
  );
};

export default TowerExplorerGame;
