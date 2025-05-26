import React, { useState } from 'react'; // Added useState for loading states

// --- INTERFACES ---
interface MinerTypeConfig {
  id: 'basic' | 'advanced' | 'master';
  name: string;
  description: string;
  baseCost: number;
  baseRate: number;
  icon: React.FC<any>;
}

interface MinerInstance {
  instanceId: string;
  typeId: 'basic' | 'advanced' | 'master';
  level: number;
}

interface MinerManagementSectionProps {
  minerConfigs: MinerTypeConfig[];
  ownedMiners: MinerInstance[];
  onHireMiner: (typeId: 'basic' | 'advanced' | 'master') => Promise<void>;
  onLevelUpMiner: (instanceId: string) => Promise<void>;
  onSellMiner: (instanceId: string) => Promise<void>;
  currentCoins: number;
  CoinIcon: React.FC<any>;
  calculateLevelUpCost: (miner: MinerInstance) => number;
  calculateSellValue: (miner: MinerInstance) => number;
  calculateMinerRate: (miner: MinerInstance) => number;
  MAX_MINER_LEVEL: number;
}

// --- SVG ICONS ---
const LevelUpArrowIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SellIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const SpinnerIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4"></circle>
      <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const MinerManagementSection: React.FC<MinerManagementSectionProps> = ({
  minerConfigs,
  ownedMiners,
  onHireMiner,
  onLevelUpMiner,
  onSellMiner,
  currentCoins,
  CoinIcon,
  calculateLevelUpCost,
  calculateSellValue,
  calculateMinerRate,
  MAX_MINER_LEVEL,
}) => {
  // State to track processing actions: key is minerId or typeId, value is boolean
  const [processingActions, setProcessingActions] = useState<Record<string, boolean>>({});

  const handleAction = async (actionId: string, actionFn: () => Promise<void>) => {
    setProcessingActions(prev => ({ ...prev, [actionId]: true }));
    try {
      await actionFn();
    } catch (error) {
      console.error(`Error performing action ${actionId}:`, error);
      // Optionally show an error message to the user here
    } finally {
      setProcessingActions(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const getRarityStyles = (typeId: 'basic' | 'advanced' | 'master') => {
    // ... (same as previous version)
     switch (typeId) {
      case 'basic': return { bgGradient: 'from-slate-700 to-slate-800', borderColor: 'border-slate-500', textColor: 'text-slate-300', accentColor: 'text-sky-400', iconBg: 'bg-slate-600'};
      case 'advanced': return { bgGradient: 'from-blue-700 to-blue-800', borderColor: 'border-blue-500', textColor: 'text-blue-200', accentColor: 'text-cyan-300', iconBg: 'bg-blue-600'};
      case 'master': return { bgGradient: 'from-purple-700 to-purple-800', borderColor: 'border-purple-500', textColor: 'text-purple-200', accentColor: 'text-fuchsia-400', iconBg: 'bg-purple-600'};
      default: return {bgGradient: 'from-gray-700 to-gray-800', borderColor: 'border-gray-500', textColor: 'text-gray-300', accentColor: 'text-white', iconBg: 'bg-gray-600'};
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-gray-200">
      {/* Section: Hire New Miners */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-3 sm:mb-4 border-b border-slate-700 pb-2">Tuyển Thợ Mỏ Mới</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {minerConfigs.map((config) => {
            const rarity = getRarityStyles(config.id);
            const canAffordHire = currentCoins >= config.baseCost;
            const isProcessing = processingActions[config.id];
            return (
            <div key={config.id} className={`rounded-lg shadow-lg p-3 sm:p-4 border ${rarity.borderColor} bg-gradient-to-br ${rarity.bgGradient} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-md mr-3 ${rarity.iconBg} shadow-sm`}><config.icon size={24} className={rarity.accentColor} /></div>
                  <h4 className={`text-md sm:text-lg font-bold ${rarity.textColor}`}>{config.name}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mb-1 h-10 sm:h-12 overflow-hidden">{config.description}</p>
                <div className="text-xs sm:text-sm space-y-0.5 mb-2 text-slate-300">
                  <p>Giá thuê: <span className="font-semibold text-yellow-400">{config.baseCost.toLocaleString()}</span> <CoinIcon size={12} className="inline -mt-px" color="gold" /></p>
                  <p>Tốc độ (Lv.1): <span className="font-semibold text-green-400">{config.baseRate.toFixed(2)}/s</span></p>
                </div>
              </div>
              <button
                onClick={() => handleAction(config.id, () => onHireMiner(config.id))}
                disabled={!canAffordHire || isProcessing}
                className={`w-full mt-2 py-2 px-3 rounded-md font-semibold text-sm transition-colors duration-150 flex items-center justify-center gap-1.5
                  ${isProcessing ? 'bg-slate-500 cursor-wait' : (canAffordHire ? `bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg` : 'bg-slate-600 text-slate-400 cursor-not-allowed')}`}
              >
                {isProcessing ? <SpinnerIcon size={16} /> : <config.icon size={16} />}
                {isProcessing ? 'Đang thuê...' : 'Thuê'}
              </button>
            </div>
          )})}
        </div>
      </div>

      {/* Section: Your Miners */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-3 sm:mb-4 border-b border-slate-700 pb-2">Thợ Mỏ Của Tôi ({ownedMiners.length})</h3>
        {ownedMiners.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Bạn chưa có thợ mỏ nào. Hãy thuê một vài người!</p>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-[45vh] sm:max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
            {ownedMiners.map((miner) => {
              const config = minerConfigs.find(c => c.id === miner.typeId);
              if (!config) return null;

              const rarity = getRarityStyles(miner.typeId);
              const currentRate = calculateMinerRate(miner);
              const levelUpCost = calculateLevelUpCost(miner);
              const sellValue = calculateSellValue(miner);
              const isMaxLevel = miner.level >= MAX_MINER_LEVEL;
              const canAffordLevelUp = currentCoins >= levelUpCost && !isMaxLevel;
              
              const isProcessingLevelUp = processingActions[`levelup-${miner.instanceId}`];
              const isProcessingSell = processingActions[`sell-${miner.instanceId}`];

              return (
                <div key={miner.instanceId} className={`rounded-lg shadow-md p-3 sm:p-4 border ${rarity.borderColor} bg-gradient-to-br ${rarity.bgGradient}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className={`p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 ${rarity.iconBg} shadow-sm`}><config.icon size={20} className={`sm:size-6 ${rarity.accentColor}`} /></div>
                      <div>
                        <h5 className={`text-sm sm:text-md font-semibold ${rarity.textColor}`}>{config.name} <span className="text-xs text-slate-500">#{miner.instanceId.substring(0, 4)}</span></h5>
                        <p className={`text-xs sm:text-sm ${rarity.accentColor} font-medium`}>Cấp: {miner.level}/{MAX_MINER_LEVEL}</p>
                        <p className="text-xs text-green-400">{currentRate.toFixed(2)} vàng/s</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleAction(`levelup-${miner.instanceId}`, () => onLevelUpMiner(miner.instanceId))}
                        disabled={!canAffordLevelUp || isMaxLevel || isProcessingLevelUp || isProcessingSell}
                        title={isMaxLevel ? "Đã đạt cấp tối đa" : `Chi phí: ${levelUpCost.toLocaleString()}`}
                        className={`w-full sm:w-auto py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1
                          ${(isProcessingLevelUp) ? 'bg-slate-500 cursor-wait' : ((canAffordLevelUp && !isMaxLevel) ? `bg-sky-500 hover:bg-sky-400 text-white shadow` : 'bg-slate-600 text-slate-400 cursor-not-allowed')}
                          ${isMaxLevel ? 'opacity-70' : ''}`}
                      >
                        {isProcessingLevelUp ? <SpinnerIcon size={14}/> : <LevelUpArrowIcon size={14} />}
                        {isProcessingLevelUp ? 'Đang Cấp...' : (isMaxLevel ? 'Max Cấp' : `Lên Cấp (${levelUpCost.toLocaleString()})`)}
                      </button>
                      <button
                        onClick={() => handleAction(`sell-${miner.instanceId}`, () => onSellMiner(miner.instanceId))}
                        disabled={isProcessingSell || isProcessingLevelUp}
                        title={`Bán: ${sellValue.toLocaleString()}`}
                        className={`w-full sm:w-auto py-1.5 px-2.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-500 text-white shadow transition-colors duration-150 flex items-center justify-center gap-1 ${isProcessingSell ? 'bg-slate-500 cursor-wait' : ''}`}
                      >
                        {isProcessingSell ? <SpinnerIcon size={14}/> : <SellIcon size={14} />}
                        {isProcessingSell ? 'Đang Bán...' : `Bán (${sellValue.toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                  { MAX_MINER_LEVEL > 1 &&
                    <div className="mt-2">
                        <div className="w-full bg-slate-700 rounded-full h-1.5 sm:h-2"><div className={`h-full rounded-full ${rarity.accentColor.replace('text-', 'bg-')}`} style={{ width: `${(miner.level / MAX_MINER_LEVEL) * 100}%` }}></div></div>
                    </div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
       {/* CSS for custom scrollbar - Optional */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }
      `}</style>
    </div>
  );
};

export default MinerManagementSection;
