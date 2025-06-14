import React, { useState, useEffect, useRef } from 'react';

// --- Icon URL ---
const closeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png';

// --- Component Props Interface ---
interface TowerExplorerGameProps {
  onClose: () => void;
}

// --- Các hằng số điều chỉnh nhịp độ game ---
const ACTION_DELAY = 1400; // Thời gian chờ giữa các lượt (ms)
const IMPACT_DELAY = 300;  // Thời gian trễ giữa animation và cập nhật sát thương (ms)
const AUTO_ATTACK_DELAY = ACTION_DELAY + IMPACT_DELAY * 2; // Tổng thời gian 1 vòng đánh

// Component chứa các style cho animation
const GameStyles = () => (
  <style>{`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .animate-fade-in { animation: fade-in 0.2s ease-out; }
    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
  `}</style>
);

// --- Helper Components ---

const HealthBar = ({ current, max, colorClass, bgColorClass }) => (
  <div className={`w-full ${bgColorClass} rounded-full h-3 shadow-inner`}>
    <div className={`${colorClass} h-3 rounded-full transition-all duration-500 ease-out flex items-center justify-center`} style={{ width: `${(current / max) * 100}%` }}>
    </div>
    <div className="text-xs font-bold text-white text-shadow-sm text-center -mt-3.5">
        {current} / {max}
    </div>
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
        <div className="w-full">
            <HealthBar current={currentHealth} max={maxHealth} colorClass={healthBarColor} bgColorClass="bg-gray-700/50"/>
        </div>
    </div>
);


const TowerExplorerGame = ({ onClose }: TowerExplorerGameProps) => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [playerStats, setPlayerStats] = useState({
    health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 0, gems: 0
  });
  const [gameState, setGameState] = useState('playing');
  const [battleState, setBattleState] = useState(null);
  const [rewards, setRewards] = useState([]);
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
        if (isLogModalOpen) {
          setIsLogModalOpen(false);
        } else {
          onClose(); // Close the game on Escape key
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogModalOpen, onClose]);
  
  useEffect(() => {
    if (autoAttack && gameState === 'fighting' && battleState?.turn === 'player' && battleState.monsterHealth > 0) {
      const attackTimeout = setTimeout(() => {
        attackMonster();
      }, AUTO_ATTACK_DELAY / 2); 
      return () => clearTimeout(attackTimeout);
    }
  }, [autoAttack, gameState, battleState]);

  const generateMonster = (floor) => {
    const baseHealth = 30 + floor * 15;
    const baseAttack = 8 + floor * 3;
    const monsters = [
      { name: 'Goblin', emoji: '👹', color: 'text-green-400' },
      { name: 'Orc', emoji: '👺', color: 'text-red-400' },
      { name: 'Knight', emoji: '🗡️', color: 'text-purple-400' },
      { name: 'Demon', emoji: '🔥', color: 'text-orange-400' },
      { name: 'Golem', emoji: '❄️', color: 'text-blue-400' },
      { name: 'Shadow', emoji: '👤', color: 'text-gray-400' }
    ];
    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    return { ...monster, health: baseHealth, maxHealth: baseHealth, attack: baseAttack, floor: floor };
  };

  const generateRewards = (floor) => {
    const baseCoins = 50 + floor * 25;
    const baseGems = Math.floor(floor / 3) + 1;
    return { coins: baseCoins + Math.floor(Math.random() * 50), gems: baseGems + (Math.random() < 0.3 ? 1 : 0) };
  };

  const startBattle = () => {
    const monster = generateMonster(currentFloor);
    setBattleState({
      monster: monster, playerHealth: playerStats.health, monsterHealth: monster.health,
      turn: 'player', battleLog: [`A ${monster.name} ${monster.emoji} appears on Floor ${currentFloor}!`]
    });
    setGameState('fighting');
  };

  const attackMonster = () => {
    if (!battleState || battleState.turn !== 'player') return;

    setBattleState(prev => ({ ...prev, turn: 'attacking' })); 
    const damage = Math.max(1, playerStats.attack - Math.floor(Math.random() * 5));
    const newMonsterHealth = Math.max(0, battleState.monsterHealth - damage);
    
    setAnimationState({ playerHit: false, monsterHit: true });
    setTimeout(() => setAnimationState(prev => ({ ...prev, monsterHit: false })), 500);

    setTimeout(() => {
      let newLog = [...battleState.battleLog, `You dealt ${damage} damage!`];
      setBattleState(prev => ({ ...prev, monsterHealth: newMonsterHealth, battleLog: newLog }));

      if (newMonsterHealth <= 0) {
        const floorRewards = generateRewards(currentFloor);
        setRewards(floorRewards);
        setPlayerStats(prev => ({ ...prev, coins: prev.coins + floorRewards.coins, gems: prev.gems + floorRewards.gems }));
        newLog.push(`${battleState.monster.name} defeated!`);
        newLog.push(`You gained ${floorRewards.coins} coins and ${floorRewards.gems} gems.`);
        setBattleState(prev => ({ ...prev, monsterHealth: 0, battleLog: newLog }));
        setTimeout(() => setGameState('victory'), 1000);
        return;
      }
      
      setBattleState(prev => ({...prev, turn: 'monster'}));

      setTimeout(() => {
        const monsterDamage = Math.max(1, battleState.monster.attack - playerStats.defense + Math.floor(Math.random() * 3));
        const newPlayerHealth = Math.max(0, battleState.playerHealth - monsterDamage);

        setAnimationState({ playerHit: true, monsterHit: false });
        setTimeout(() => setAnimationState(prev => ({ ...prev, playerHit: false })), 500);
        
        setTimeout(() => {
          let monsterAttackLog = [...battleState.battleLog, `You dealt ${damage} damage!`, `${battleState.monster.name} dealt ${monsterDamage} damage!`];
          
          if (newPlayerHealth <= 0) {
            setBattleState(prev => ({ ...prev, playerHealth: 0, battleLog: [...monsterAttackLog, "You have been defeated!"] }));
            setGameState('defeat');
          } else {
            setBattleState(prev => ({ ...prev, playerHealth: newPlayerHealth, battleLog: monsterAttackLog, turn: 'player' }));
          }
        }, IMPACT_DELAY);

      }, ACTION_DELAY);
    }, IMPACT_DELAY);
  };
  
  const nextFloor = () => {
    setCurrentFloor(prev => prev + 1);
    setGameState('playing');
    setRewards([]);
    setPlayerStats(prev => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + Math.ceil(prev.maxHealth * 0.1)) }));
  };
  
  const resetGame = () => {
    setCurrentFloor(1);
    setPlayerStats({ health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 0, gems: 0 });
    setGameState('playing');
    setRewards([]);
  };

  const BattleLogModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsLogModalOpen(false)}>
      <div className="bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-200">Battle Log</h3>
          <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><span className="text-2xl">×</span></button>
        </div>
        <div ref={battleLogRef} className="text-sm space-y-2 h-80 overflow-y-auto pr-2 bg-black/20 p-4 rounded-md">
          {battleState?.battleLog.length > 0 ? battleState.battleLog.map((log, index) => <LogMessage key={index} log={log} />) : <p className="text-gray-400">No battle has occurred yet.</p>}
        </div>
        <button onClick={() => setIsLogModalOpen(false)} className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
      </div>
    </div>
  );

  return (
    // <<<< THAY ĐỔI: Sử dụng `fixed inset-0` để component chiếm toàn bộ vùng an toàn của màn hình >>>>
    <div className="fixed inset-0 z-40 bg-gray-800/50 backdrop-blur-sm text-gray-100 font-sans animate-fade-in">
      <GameStyles />
      <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg flex flex-col relative animate-fade-in-up">
        
        <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 transition-opacity hover:opacity-80"
            aria-label="Đóng"
            title="Đóng Tháp (Esc)"
        >
            <img src={closeIconUrl} alt="Close" className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-4 border-b border-purple-500/30">
            <h1 className="text-2xl font-bold text-center tracking-wider">Tower of Valor</h1>
            <div className="text-center text-lg font-semibold mt-1 opacity-80">Floor {currentFloor}</div>
        </div>
        
        <div className="p-4 bg-black/20">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2" title="Health"><span className="text-xl">❤️</span><span className="font-semibold">{playerStats.health}/{playerStats.maxHealth}</span></div>
                <div className="flex items-center space-x-2" title="Attack"><span className="text-xl">⚔️</span><span className="font-semibold">{playerStats.attack}</span></div>
                <div className="flex items-center space-x-2" title="Defense"><span className="text-xl">🛡️</span><span className="font-semibold">{playerStats.defense}</span></div>
                <div className="flex items-center space-x-2" title="Coins"><span className="text-yellow-400">💰</span><span className="font-semibold">{playerStats.coins}</span></div>
                <div className="flex items-center space-x-2" title="Gems"><span className="text-purple-400">💎</span><span className="font-semibold">{playerStats.gems}</span></div>
            </div>
        </div>
        
        <div className="flex-grow min-h-0 relative flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-800 to-gray-900 overflow-y-auto">
           {gameState === 'playing' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in">
              <div className="text-7xl mb-4 animate-pulse">🚪</div>
              <h2 className="text-2xl font-bold mb-2">The Gate Awaits</h2>
              <p className="text-gray-400 mb-8">A new challenge lies beyond this door.</p>
              <button onClick={startBattle} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">▶️</span><span>Enter Floor {currentFloor}</span>
              </button>
            </div>
          )}

          {gameState === 'fighting' && battleState && (
            <div className="w-full h-full flex flex-col justify-between animate-fade-in">
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
                    <CombatantView 
                        name="You" avatar="🦸" currentHealth={battleState.playerHealth} maxHealth={playerStats.maxHealth}
                        healthBarColor="bg-gradient-to-r from-green-500 to-green-400" isHit={animationState.playerHit}
                    />
                    <div className="text-4xl text-gray-500 pt-12">⚔️</div>
                    <CombatantView 
                        name={battleState.monster.name} avatar={battleState.monster.emoji} avatarClass={battleState.monster.color}
                        currentHealth={battleState.monsterHealth} maxHealth={battleState.monster.maxHealth}
                        healthBarColor="bg-gradient-to-r from-red-500 to-red-400" isHit={animationState.monsterHit}
                    />
                </div>
                <div className="text-center">
                    <button onClick={attackMonster} disabled={battleState.turn !== 'player' || autoAttack} 
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait">
                      Attack!
                    </button>
                </div>
            </div>
          )}

          {gameState === 'victory' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-4 text-yellow-300">VICTORY!</h2>
              <div className="bg-black/30 rounded-lg p-4 mb-6 w-full max-w-xs">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 border-b border-yellow-400/20 pb-2">Floor Cleared! Rewards:</h3>
                <div className="flex justify-center space-x-6 text-lg">
                  <div className="flex items-center space-x-2"><span className="text-yellow-400">💰</span><span>+{rewards.coins}</span></div>
                  <div className="flex items-center space-x-2"><span className="text-purple-400">💎</span><span>+{rewards.gems}</span></div>
                </div>
              </div>
              <button onClick={nextFloor} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">🔼</span><span>Proceed to Floor {currentFloor + 1}</span>
              </button>
            </div>
          )}
          {gameState === 'defeat' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in">
              <div className="text-7xl mb-4">💀</div>
              <h2 className="text-3xl font-bold mb-4 text-red-500">DEFEATED</h2>
              <p className="text-gray-400 mb-8">Your journey ended on Floor {currentFloor}.</p>
              <button onClick={resetGame} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">🔄</span><span>Try Again</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-gray-900 p-4 border-t border-purple-500/30 flex justify-between items-center">
            <button onClick={() => setIsLogModalOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!battleState}>
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
      </div>
      
      {isLogModalOpen && <BattleLogModal />}
    </div>
  );
};

export default TowerExplorerGame;
