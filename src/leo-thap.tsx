import React, { useState, useEffect, useRef }_from 'react';

// --- Icon URL ---
const closeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png';

// --- Component Props Interface ---
interface TowerExplorerGameProps {
  onClose: () => void;
}

// --- Các hằng số điều chỉnh nhịp độ game ---
const ACTION_DELAY = 1200; // Thời gian chờ giữa các lượt (ms)
const IMPACT_DELAY = 250;  // Thời gian trễ giữa animation và cập nhật sát thương (ms)
const AUTO_ATTACK_DELAY = ACTION_DELAY + IMPACT_DELAY * 2; // Tổng thời gian 1 vòng đánh

// <<<< THAY ĐỔI: Thêm animation cho số sát thương bay lên và các hiệu ứng khác >>>>
const GameStyles = () => (
  <style>{`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.5s ease-in-out; }
    
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }

    @keyframes float-up {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-40px); opacity: 0; }
    }
    .animate-float-up { animation: float-up 1.2s ease-out forwards; }
  `}</style>
);

// --- Helper Components ---

const HealthBar = ({ current, max, colorClass, bgColorClass }) => (
    <div className={`w-full ${bgColorClass} rounded-full h-4 shadow-inner relative`}>
        <div className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`} style={{ width: `${(current / max) * 100}%` }}>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow-md">
            {current} / {max}
        </div>
    </div>
);

// <<<< THAY ĐỔI: Component hiển thị số sát thương bay lên >>>>
const DamageFloater = ({ text, color, id }) => (
  <div key={id} className={`absolute top-1/3 left-1/2 -translate-x-1/2 font-bold text-2xl text-shadow-lg pointer-events-none animate-float-up ${color}`}>
    {text}
  </div>
);

const CombatantView = ({ name, avatar, avatarClass, currentHealth, maxHealth, healthBarColor, isHit }) => (
    // <<<< THAY ĐỔI: Thêm "bệ đỡ" (podium) và tinh chỉnh style >>>>
    <div className={`flex flex-col items-center p-2 space-y-3 w-40 transition-transform duration-300 ${isHit ? 'animate-shake' : ''}`}>
        <div className="relative">
          <div className={`text-6xl ${avatarClass}`}>{avatar}</div>
        </div>
        {/* Podium effect */}
        <div className="w-2/3 h-2 bg-gray-600/50 rounded-full border-b-2 border-gray-500/50"></div>
        <h3 className="text-lg font-bold truncate text-white">{name}</h3>
        <div className="w-full">
            <HealthBar current={currentHealth} max={maxHealth} colorClass={healthBarColor} bgColorClass="bg-gray-700/80"/>
        </div>
    </div>
);


const TowerExplorerGame = ({ onClose }: TowerExplorerGameProps) => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [playerStats, setPlayerStats] = useState({
    health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 0, gems: 0
  });
  const [gameState, setGameState] = useState('playing'); // playing, fighting, victory, defeat
  const [battleState, setBattleState] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [autoAttack, setAutoAttack] = useState(false);
  const [animationState, setAnimationState] = useState({ playerHit: false, monsterHit: false });
  // <<<< THAY ĐỔI: State cho hiệu ứng số sát thương >>>>
  const [damageFloaters, setDamageFloaters] = useState([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  useEffect(() => {
    if (autoAttack && gameState === 'fighting' && battleState?.turn === 'player' && battleState.monsterHealth > 0) {
      const attackTimeout = setTimeout(() => attackMonster(), AUTO_ATTACK_DELAY / 2); 
      return () => clearTimeout(attackTimeout);
    }
  }, [autoAttack, gameState, battleState]);

  // <<<< THAY ĐỔI: Hàm thêm và xóa số sát thương >>>>
  const showDamage = (amount, target) => {
    const id = Date.now() + Math.random();
    const color = target === 'player' ? 'text-red-400' : 'text-yellow-200';
    const text = `-${amount}`;
    setDamageFloaters(prev => [...prev, { id, text, color, target }]);
    setTimeout(() => {
      setDamageFloaters(prev => prev.filter(f => f.id !== id));
    }, 1200);
  };

  const generateMonster = (floor) => {
    const baseHealth = 30 + floor * 15;
    const baseAttack = 8 + floor * 3;
    const monsters = [
      { name: 'Goblin', emoji: '👹', color: 'text-green-400' }, { name: 'Orc', emoji: '👺', color: 'text-red-400' },
      { name: 'Knight', emoji: '🗡️', color: 'text-purple-400' }, { name: 'Demon', emoji: '🔥', color: 'text-orange-400' },
      { name: 'Golem', emoji: '❄️', color: 'text-blue-400' }, { name: 'Shadow', emoji: '👤', color: 'text-gray-400' }
    ];
    return { ...monsters[Math.floor(Math.random() * monsters.length)], health: baseHealth, maxHealth: baseHealth, attack: baseAttack, floor };
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
      showDamage(damage, 'monster'); // <<<< THAY ĐỔI: Hiển thị sát thương
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
          showDamage(monsterDamage, 'player'); // <<<< THAY ĐỔI: Hiển thị sát thương
          let monsterAttackLog = [...newLog, `${battleState.monster.name} dealt ${monsterDamage} damage!`];
          
          if (newPlayerHealth <= 0) {
            setBattleState(prev => ({ ...prev, playerHealth: 0, battleLog: [...monsterAttackLog, "You have been defeated!"] }));
            setGameState('defeat');
          } else {
            setBattleState(prev => ({ ...prev, playerHealth: newPlayerHealth, battleLog: monsterAttackLog, turn: 'player' }));
            setPlayerStats(prev => ({ ...prev, health: newPlayerHealth }));
          }
        }, IMPACT_DELAY);

      }, ACTION_DELAY);
    }, IMPACT_DELAY);
  };
  
  const nextFloor = () => {
    setCurrentFloor(prev => prev + 1);
    setGameState('playing');
    setRewards(null);
    setBattleState(null);
    setPlayerStats(prev => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + Math.ceil(prev.maxHealth * 0.2)) })); // Hồi máu nhiều hơn
  };
  
  const resetGame = () => {
    setCurrentFloor(1);
    setPlayerStats({ health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 0, gems: 0 });
    setGameState('playing');
    setRewards(null);
    setBattleState(null);
  };

  return (
    // <<<< THAY ĐỔI: Container chính của game, tạo cảm giác như một cửa sổ nhìn vào tháp >>>>
    <div className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-gray-100 animate-fade-in">
      <GameStyles />
      {/* The Tower itself */}
      <div className="w-full max-w-md h-full max-h-[720px] bg-gradient-to-b from-gray-800 to-black rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 flex flex-col relative overflow-hidden animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 transition-opacity hover:opacity-80" aria-label="Đóng" title="Đóng Tháp (Esc)">
            <img src={closeIconUrl} alt="Close" className="w-7 h-7" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 text-white p-4 border-b border-purple-500/30 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-wider">Tower of Valor</h1>
              <div className="text-lg font-semibold opacity-80">Floor {currentFloor}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div title="Coins"><span className="text-yellow-400 text-xl">💰</span> <span className="font-semibold">{playerStats.coins}</span></div>
              <div title="Gems"><span className="text-purple-400 text-xl">💎</span> <span className="font-semibold">{playerStats.gems}</span></div>
            </div>
        </div>

        {/* Player Mini Stats */}
        <div className="p-3 bg-black/20 grid grid-cols-3 gap-2 text-center text-sm">
            <div title="Health"><span className="mr-1">❤️</span>{battleState ? battleState.playerHealth : playerStats.health}/{playerStats.maxHealth}</div>
            <div title="Attack"><span className="mr-1">⚔️</span>{playerStats.attack}</div>
            <div title="Defense"><span className="mr-1">🛡️</span>{playerStats.defense}</div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow min-h-0 relative flex flex-col items-center justify-center p-4">
           {gameState === 'playing' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in">
              <div className="text-8xl mb-4 animate-pulse">🚪</div>
              <h2 className="text-3xl font-bold mb-2">The Gate Awaits</h2>
              <p className="text-gray-400 mb-8">A new challenge lies beyond this door.</p>
              <button onClick={startBattle} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">▶️</span><span>Enter Floor {currentFloor}</span>
              </button>
            </div>
          )}

          {gameState === 'fighting' && battleState && (
            <div className="w-full h-full flex flex-col justify-around animate-fade-in">
                {/* <<<< THAY ĐỔI: Container cho các số sát thương bay lên >>>> */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {damageFloaters.map(df => (
                    <DamageFloater key={df.id} {...df} />
                  ))}
                </div>
                {/* <<<< THAY ĐỔI: Bố cục combatant mới với VS ở giữa >>>> */}
                <div className="w-full flex justify-around items-center">
                    <CombatantView name="You" avatar="🦸" currentHealth={battleState.playerHealth} maxHealth={playerStats.maxHealth}
                        healthBarColor="bg-gradient-to-r from-green-500 to-green-400" isHit={animationState.playerHit} />
                    <div className="text-5xl font-black text-gray-500/50 -mt-10">VS</div>
                    <CombatantView name={battleState.monster.name} avatar={battleState.monster.emoji} avatarClass={battleState.monster.color}
                        currentHealth={battleState.monsterHealth} maxHealth={battleState.monster.maxHealth}
                        healthBarColor="bg-gradient-to-r from-red-600 to-red-500" isHit={animationState.monsterHit} />
                </div>
                
                {/* <<<< THAY ĐỔI: Hiển thị battle log trực tiếp >>>> */}
                <div className="text-center h-16 bg-black/20 p-2 rounded-md text-sm text-gray-300 flex flex-col-reverse overflow-hidden">
                  {battleState.battleLog.slice(-3).reverse().map((log, i) => (
                    <div key={i} className={`truncate ${log.includes('dealt') ? 'text-red-400' : ''} ${log.includes('gained') ? 'text-yellow-400' : ''}`}>{log}</div>
                  ))}
                </div>

                <div className="text-center">
                    <button onClick={attackMonster} disabled={battleState.turn !== 'player' || autoAttack} 
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait disabled:scale-100">
                      Attack!
                    </button>
                </div>
            </div>
          )}

          {/* <<<< THAY ĐỔI: Giao diện Victory được làm mới >>>> */}
          {gameState === 'victory' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in-up">
              <div className="text-8xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-4xl font-bold mb-4 text-yellow-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.5)]">VICTORY!</h2>
              <div className="bg-black/40 rounded-lg p-6 mb-8 w-full max-w-xs shadow-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-3 border-b border-yellow-400/30 pb-2">Rewards</h3>
                <div className="flex justify-center space-x-8 text-lg">
                  <div className="flex items-center space-x-2"><span className="text-yellow-400 text-2xl">💰</span><span className='font-bold'>+{rewards.coins}</span></div>
                  <div className="flex items-center space-x-2"><span className="text-purple-400 text-2xl">💎</span><span className='font-bold'>+{rewards.gems}</span></div>
                </div>
              </div>
              <button onClick={nextFloor} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">🔼</span><span>Proceed to Floor {currentFloor + 1}</span>
              </button>
            </div>
          )}
          {gameState === 'defeat' && (
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in-up">
              <div className="text-8xl mb-4">💀</div>
              <h2 className="text-4xl font-bold mb-4 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">DEFEATED</h2>
              <p className="text-gray-400 mb-8">Your journey ended on Floor {currentFloor}.</p>
              <button onClick={resetGame} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all duration-300">
                <span className="mr-2 text-xl">🔄</span><span>Try Again</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900/80 p-3 border-t border-purple-500/30 flex justify-end items-center">
            <label className="flex items-center space-x-3 cursor-pointer">
                <span className="text-sm font-medium text-gray-300">Auto Attack</span>
                <div className="relative">
                    <input type="checkbox" checked={autoAttack} onChange={(e) => setAutoAttack(e.target.checked)} className="sr-only peer"/>
                    <div className="block bg-gray-600 w-12 h-7 rounded-full peer-checked:bg-green-600 transition"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform transform peer-checked:translate-x-full"></div>
                </div>
            </label>
        </div>
      </div>
    </div>
  );
};

export default TowerExplorerGame;
