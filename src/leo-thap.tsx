// Các component khác (GameStyles, HealthBar, LogMessage, CombatantView, FloorSelectionScreen) giữ nguyên...

const TowerExplorerGame = ({ onClose }: TowerExplorerGameProps) => {
  // ... (toàn bộ state và các hàm logic như cũ) ...
  const [highestFloorCleared, setHighestFloorCleared] = useState(4); 
  const [battleFloor, setBattleFloor] = useState(1);
  const [playerStats, setPlayerStats] = useState({
    health: 100, maxHealth: 100, attack: 25, defense: 10, coins: 1500, gems: 20
  });
  const [gameState, setGameState] = useState<'floor_selection' | 'fighting' | 'victory' | 'defeat'>('floor_selection');
  const [battleState, setBattleState] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [autoAttack, setAutoAttack] = useState(false);
  const [animationState, setAnimationState] = useState({ playerHit: false, monsterHit: false });
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const battleLogRef = useRef(null);
  // ... (toàn bộ useEffect và các hàm xử lý logic khác giữ nguyên) ...
  // ... (generateMonster, generateRewards, handleSelectFloor, startBattle, attackMonster, etc.) ...
  
  // ...
  // Dán phần JSX được cập nhật dưới đây vào hàm return của component TowerExplorerGame
  // ...

  return (
    <div className="fixed inset-0 z-40 bg-gray-800/50 backdrop-blur-sm text-gray-100 font-sans animate-fade-in">
      <GameStyles />
      <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg flex flex-col relative animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 transition-opacity hover:opacity-80" aria-label="Đóng" title="Đóng Tháp (Esc)">
            <img src={closeIconUrl} alt="Close" className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-4 border-b border-purple-500/30">
            <h1 className="text-2xl font-bold text-center tracking-wider">Tower of Valor</h1>
            {/* <<<< THAY ĐỔI 1: Tiêu đề phụ thay đổi theo ngữ cảnh >>>> */}
            <div className="text-center text-lg font-semibold mt-1 opacity-80">
              {gameState === 'floor_selection' 
                ? 'Choose Your Challenge' 
                : `Floor ${battleFloor}`}
            </div>
        </div>
        
        {/* <<<< THAY ĐỔI 2: Chỉ hiển thị thanh chỉ số khi không ở màn hình chọn tầng >>>> */}
        {gameState !== 'floor_selection' && (
            <div className="p-4 bg-black/20 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2" title="Health"><span className="text-xl">❤️</span><span className="font-semibold">{playerStats.health}/{playerStats.maxHealth}</span></div>
                    <div className="flex items-center space-x-2" title="Attack"><span className="text-xl">⚔️</span><span className="font-semibold">{playerStats.attack}</span></div>
                    <div className="flex items-center space-x-2" title="Defense"><span className="text-xl">🛡️</span><span className="font-semibold">{playerStats.defense}</span></div>
                    <div className="flex items-center space-x-2" title="Coins"><span className="text-yellow-400">💰</span><span className="font-semibold">{playerStats.coins}</span></div>
                    <div className="flex items-center space-x-2" title="Gems"><span className="text-purple-400">💎</span><span className="font-semibold">{playerStats.gems}</span></div>
                </div>
            </div>
        )}
        
        <div className="flex-grow min-h-0 relative flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
           {gameState === 'floor_selection' && (
             <FloorSelectionScreen highestFloorCleared={highestFloorCleared} onSelectFloor={handleSelectFloor} />
           )}

          {/* ... (Phần logic render cho 'fighting', 'victory', 'defeat' giữ nguyên) ... */}
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
            <div className="text-center text-white flex flex-col justify-center items-center h-full animate-fade-in p-4">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-4 text-yellow-300">VICTORY!</h2>
              {rewards && (
                  <div className="bg-black/30 rounded-lg p-4 mb-6 w-full max-w-xs">
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
        
        {/* <<<< THAY ĐỔI 3: Chỉ hiển thị footer khi không ở màn hình chọn tầng >>>> */}
        {gameState !== 'floor_selection' && (
            <div className="bg-gray-900 p-4 border-t border-purple-500/30 flex justify-between items-center animate-fade-in">
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
        )}
      </div>
      
      {isLogModalOpen && <BattleLogModal />}
    </div>
  );
};

export default TowerExplorerGame;
