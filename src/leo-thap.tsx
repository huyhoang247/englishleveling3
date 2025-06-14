import React, { useState, useEffect, useRef } from 'react';

// Style cho animation vẫn được giữ nguyên
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
    
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out;
    }
  `}</style>
);

const TowerExplorerGame = () => {
  // ... (các state khác giữ nguyên)
  const [currentFloor, setCurrentFloor] = useState(1);
  const [playerStats, setPlayerStats] = useState({
    health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 0, gems: 0
  });
  const [gameState, setGameState] = useState('playing');
  const [battleState, setBattleState] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [autoNext, setAutoNext] = useState(false);
  const [animationState, setAnimationState] = useState({ playerHit: false, monsterHit: false });
  
  // State mới để quản lý popup log
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const battleLogRef = useRef(null);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleState?.battleLog]);

  // Hook để đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLogModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ... (các hàm logic game giữ nguyên: generateMonster, generateRewards, startBattle, etc.)
  const generateMonster = (floor) => {
    const baseHealth = 30 + floor * 15;
    const baseAttack = 8 + floor * 3;
    const monsters = [
      { name: 'Goblin Warrior', emoji: '👹', color: 'text-green-400' },
      { name: 'Orc Berserker', emoji: '👺', color: 'text-red-400' },
      { name: 'Dark Knight', emoji: '🗡️', color: 'text-purple-400' },
      { name: 'Fire Demon', emoji: '🔥', color: 'text-orange-400' },
      { name: 'Ice Golem', emoji: '❄️', color: 'text-blue-400' },
      { name: 'Shadow Beast', emoji: '👤', color: 'text-gray-400' }
    ];
    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    return {
      ...monster,
      health: baseHealth, maxHealth: baseHealth, attack: baseAttack, floor: floor
    };
  };

  const generateRewards = (floor) => {
    const baseCoins = 50 + floor * 25;
    const baseGems = Math.floor(floor / 3) + 1;
    return {
      coins: baseCoins + Math.floor(Math.random() * 50),
      gems: baseGems + (Math.random() < 0.3 ? 1 : 0)
    };
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

    const damage = Math.max(1, playerStats.attack - Math.floor(Math.random() * 5));
    const newMonsterHealth = Math.max(0, battleState.monsterHealth - damage);
    
    setAnimationState({ ...animationState, monsterHit: true });
    setTimeout(() => setAnimationState(prev => ({ ...prev, monsterHit: false })), 500);

    let newLog = [...battleState.battleLog, `You dealt ${damage} damage!`];
    
    if (newMonsterHealth <= 0) {
      const floorRewards = generateRewards(currentFloor);
      setRewards(floorRewards);
      setPlayerStats(prev => ({
        ...prev,
        coins: prev.coins + floorRewards.coins,
        gems: prev.gems + floorRewards.gems
      }));
      newLog.push(`${battleState.monster.name} defeated!`);
      newLog.push(`You gained ${floorRewards.coins} coins and ${floorRewards.gems} gems.`);
      
      setBattleState(prev => ({ ...prev, monsterHealth: 0, battleLog: newLog }));
      
      setTimeout(() => {
        setGameState('victory');
        if (autoNext) {
          setTimeout(() => nextFloor(), 2000);
        }
      }, 1000);
      return;
    }

    setBattleState(prev => ({ ...prev, monsterHealth: newMonsterHealth, battleLog: newLog, turn: 'monster' }));

    setTimeout(() => {
      const monsterDamage = Math.max(1, battleState.monster.attack - playerStats.defense + Math.floor(Math.random() * 3));
      const newPlayerHealth = Math.max(0, battleState.playerHealth - monsterDamage);
      
      setAnimationState(prev => ({ ...prev, playerHit: true }));
      setTimeout(() => setAnimationState(prev => ({ ...prev, playerHit: false })), 500);

      newLog.push(`${battleState.monster.name} dealt ${monsterDamage} damage!`);
      
      if (newPlayerHealth <= 0) {
        setBattleState(prev => ({ ...prev, playerHealth: 0, monsterHealth: newMonsterHealth, battleLog: [...newLog, "You have been defeated!"] }));
        setGameState('defeat');
      } else {
        setBattleState(prev => ({ ...prev, playerHealth: newPlayerHealth, monsterHealth: newMonsterHealth, battleLog: newLog, turn: 'player' }));
      }
    }, 1000);
  };
  
  const nextFloor = () => {
    setCurrentFloor(prev => prev + 1);
    setGameState('playing');
    setBattleState(null);
    setRewards([]);
    setPlayerStats(prev => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + Math.ceil(prev.maxHealth * 0.1)) }));
  };
  
  const resetGame = () => {
    setCurrentFloor(1);
    setPlayerStats({ health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 0, gems: 0 });
    setGameState('playing');
    setBattleState(null);
    setRewards([]);
  };

  const HealthBar = ({ current, max, colorClass, bgColorClass }) => (
    <div className={`w-full ${bgColorClass} rounded-full h-4 shadow-inner`}>
      <div className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-center`} style={{ width: `${(current / max) * 100}%` }}>
        <span className="text-xs font-bold text-white text-shadow-sm">{current} / {max}</span>
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

  // --- COMPONENT MỚI: Battle Log Modal ---
  const BattleLogModal = () => (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={() => setIsLogModalOpen(false)} // Đóng khi click ra ngoài
    >
      <div
        className="bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up"
        onClick={e => e.stopPropagation()} // Ngăn việc click vào modal làm nó đóng lại
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-200">Battle Log</h3>
          <button 
            onClick={() => setIsLogModalOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div ref={battleLogRef} className="text-sm space-y-2 h-80 overflow-y-auto pr-2 bg-black/20 p-4 rounded-md">
          {battleState?.battleLog.length > 0 ? (
            battleState.battleLog.map((log, index) => (
              <LogMessage key={index} log={log} />
            ))
          ) : (
            <p className="text-gray-400">No battle has occurred yet.</p>
          )}
        </div>
        <button 
            onClick={() => setIsLogModalOpen(false)}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
            Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 font-sans p-4 flex items-center justify-center">
      <GameStyles />
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden border border-purple-500/30">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-4 border-b border-purple-500/30">
          <h1 className="text-2xl font-bold text-center tracking-wider">Tower of Valor</h1>
          <div className="text-center text-lg font-semibold mt-1 opacity-80">
            Floor {currentFloor}
          </div>
        </div>

        {/* Player Stats */}
        <div className="p-4 bg-black/20">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Your Stats</h3>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1" title="Coins">
                    <span className="text-yellow-400">💰</span>
                    <span className="font-semibold">{playerStats.coins}</span>
                </div>
                <div className="flex items-center space-x-1" title="Gems">
                    <span className="text-purple-400">💎</span>
                    <span className="font-semibold">{playerStats.gems}</span>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center justify-center" title="Health">
                  <span className="text-2xl mb-1">❤️</span>
                  <span className="font-semibold">{battleState ? battleState.playerHealth : playerStats.health}/{playerStats.maxHealth}</span>
              </div>
              <div className="flex flex-col items-center justify-center" title="Attack">
                  <span className="text-2xl mb-1">⚔️</span>
                  <span className="font-semibold">{playerStats.attack}</span>
              </div>
              <div className="flex flex-col items-center justify-center" title="Defense">
                  <span className="text-2xl mb-1">🛡️</span>
                  <span className="font-semibold">{playerStats.defense}</span>
              </div>
          </div>
        </div>

        {/* Game Area - Giao diện chính không thay đổi nhiều */}
        <div className="h-96 relative flex flex-col items-center justify-between p-6 bg-gradient-to-b from-gray-800 to-gray-900">
           {/* ... (render các state playing, fighting, victory, defeat như cũ) ... */}
           {gameState === 'playing' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full">
              <div className="text-7xl mb-4 animate-pulse">🚪</div>
              <h2 className="text-2xl font-bold mb-2">The Gate Awaits</h2>
              <p className="text-gray-400 mb-8">A new challenge lies beyond this door.</p>
              <button onClick={startBattle} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">▶️</span>
                <span>Enter Floor {currentFloor}</span>
              </button>
            </div>
          )}
          {gameState === 'fighting' && battleState && (
            <>
              <div className={`w-full text-center ${animationState.monsterHit ? 'animate-shake' : ''}`}>
                <div className={`text-6xl mb-2 ${battleState.monster.color}`}>{battleState.monster.emoji}</div>
                <h3 className="text-xl font-bold">{battleState.monster.name}</h3>
                <p className="text-sm text-gray-400">ATK: {battleState.monster.attack}</p>
                <div className="mt-2 px-4">
                  <HealthBar current={battleState.monsterHealth} max={battleState.monster.maxHealth} colorClass="bg-gradient-to-r from-red-600 to-red-400" bgColorClass="bg-red-900/50" />
                </div>
              </div>
              <div className="text-4xl text-gray-500 my-4">⚔️</div>
              <div className={`w-full text-center ${animationState.playerHit ? 'animate-shake' : ''}`}>
                <div className="w-20 h-20 bg-blue-900/50 rounded-full mx-auto mb-2 flex items-center justify-center border-2 border-blue-400">
                    <div className="text-4xl">🦸</div>
                </div>
                <h3 className="text-xl font-bold">You</h3>
                <div className="mt-2 px-4">
                  <HealthBar current={battleState.playerHealth} max={playerStats.maxHealth} colorClass="bg-gradient-to-r from-green-600 to-green-400" bgColorClass="bg-green-900/50" />
                </div>
                 {battleState.turn === 'player' && battleState.monsterHealth > 0 && (
                    <button onClick={attackMonster} className="mt-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300">
                      Attack!
                    </button>
                  )}
                  {battleState.turn === 'monster' && ( <div className="mt-6 text-yellow-400 font-semibold italic">Monster is attacking...</div> )}
              </div>
            </>
          )}
          {gameState === 'victory' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-4 text-yellow-300">VICTORY!</h2>
              <div className="bg-black/30 rounded-lg p-4 mb-6 w-full max-w-xs">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 border-b border-yellow-400/20 pb-2">Floor Cleared! Rewards:</h3>
                <div className="flex justify-center space-x-6 text-lg">
                  <div className="flex items-center space-x-2"> <span className="text-yellow-400">💰</span> <span>+{rewards.coins}</span> </div>
                  <div className="flex items-center space-x-2"> <span className="text-purple-400">💎</span> <span>+{rewards.gems}</span> </div>
                </div>
              </div>
              <button onClick={nextFloor} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">🔼</span> <span>Proceed to Floor {currentFloor + 1}</span>
              </button>
            </div>
          )}
          {gameState === 'defeat' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full">
              <div className="text-7xl mb-4">💀</div>
              <h2 className="text-3xl font-bold mb-4 text-red-500">DEFEATED</h2>
              <p className="text-gray-400 mb-8">Your journey ended on Floor {currentFloor}.</p>
              <button onClick={resetGame} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">🔄</span> <span>Try Again</span>
              </button>
            </div>
          )}
        </div>

        {/* --- KHU VỰC BATTLE LOG ĐÃ BỊ XÓA --- */}
        
        {/* Footer & Settings đã được cập nhật */}
        <div className="bg-gray-900 p-4 border-t border-purple-500/30 flex justify-between items-center">
            {/* Nút mới để mở log */}
            <button 
                onClick={() => setIsLogModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!battleState} // Vô hiệu hóa nút khi chưa có trận đấu
            >
                📜 View Log
            </button>
            
            <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-sm font-medium">Auto Next</span>
                <div className="relative">
                    <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} className="sr-only"/>
                    <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoNext ? 'transform translate-x-full bg-green-400' : ''}`}></div>
                </div>
            </label>
        </div>
      </div>
      
      {/* Render Modal nếu isLogModalOpen là true */}
      {isLogModalOpen && <BattleLogModal />}
    </div>
  );
};

export default TowerExplorerGame;
