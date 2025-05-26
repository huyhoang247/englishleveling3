import React from 'react';

// --- INTERFACES (should match those in gold-miner.tsx or be imported) ---
interface MinerTypeConfig {
  id: 'basic' | 'advanced' | 'master';
  name: string;
  description: string;
  baseCost: number;
  baseRate: number;
  icon: React.FC<any>;
  // Add other fields if needed by this component, e.g., for display
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
  CoinIcon: React.FC<any>; // Pass CoinIcon component
  calculateLevelUpCost: (miner: MinerInstance) => number;
  calculateSellValue: (miner: MinerInstance) => number;
  calculateMinerRate: (miner: MinerInstance) => number;
  MAX_MINER_LEVEL: number;
}

// --- SVG ICONS (can be imported or defined here if specific to this module) ---
const UpgradeIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 6v12m-6-6h12"/> {/* Simple Plus for level up */}
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
  </svg>
);

const SellIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const LevelUpArrowIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  const getRarityStyles = (typeId: 'basic' | 'advanced' | 'master') => {
    switch (typeId) {
      case 'basic': return {
        bgGradient: 'from-slate-700 to-slate-800',
        borderColor: 'border-slate-500',
        textColor: 'text-slate-300',
        accentColor: 'text-sky-400',
        iconBg: 'bg-slate-600'
      };
      case 'advanced': return {
        bgGradient: 'from-blue-700 to-blue-800',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-200',
        accentColor: 'text-cyan-300',
        iconBg: 'bg-blue-600'
      };
      case 'master': return {
        bgGradient: 'from-purple-700 to-purple-800',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-200',
        accentColor: 'text-fuchsia-400',
        iconBg: 'bg-purple-600'
      };
      default: return { // Fallback, though typeId is constrained
        bgGradient: 'from-gray-700 to-gray-800',
        borderColor: 'border-gray-500',
        textColor: 'text-gray-300',
        accentColor: 'text-white',
        iconBg: 'bg-gray-600'
      };
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
            return (
            <div key={config.id} className={`rounded-lg shadow-lg p-3 sm:p-4 border ${rarity.borderColor} bg-gradient-to-br ${rarity.bgGradient} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-md mr-3 ${rarity.iconBg} shadow-sm`}>
                    <config.icon size={24} className={rarity.accentColor} />
                  </div>
                  <h4 className={`text-md sm:text-lg font-bold ${rarity.textColor}`}>{config.name}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mb-1 h-10 sm:h-12 overflow-hidden">{config.description}</p>
                <div className="text-xs sm:text-sm space-y-0.5 mb-2 text-slate-300">
                  <p>Giá thuê: <span className="font-semibold text-yellow-400">{config.baseCost.toLocaleString()}</span> <CoinIcon size={12} className="inline -mt-px" color="gold" /></p>
                  <p>Tốc độ (Lv.1): <span className="font-semibold text-green-400">{config.baseRate.toFixed(2)}/s</span></p>
                </div>
              </div>
              <button
                onClick={() => onHireMiner(config.id)}
                disabled={!canAffordHire}
                className={`w-full mt-2 py-2 px-3 rounded-md font-semibold text-sm transition-colors duration-150 flex items-center justify-center gap-1.5
                  ${canAffordHire
                    ? `bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg`
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <config.icon size={16} />
                Thuê
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
          <div className="space-y-3 sm:space-y-4 max-h-[45vh] sm:max-h-[40vh] overflow-y-auto pr-1">
            {ownedMiners.map((miner) => {
              const config = minerConfigs.find(c => c.id === miner.typeId);
              if (!config) return null;

              const rarity = getRarityStyles(miner.typeId);
              const currentRate = calculateMinerRate(miner);
              const levelUpCost = calculateLevelUpCost(miner);
              const sellValue = calculateSellValue(miner);
              const canAffordLevelUp = currentCoins >= levelUpCost && miner.level < MAX_MINER_LEVEL;
              const isMaxLevel = miner.level >= MAX_MINER_LEVEL;

              return (
                <div key={miner.instanceId} className={`rounded-lg shadow-md p-3 sm:p-4 border ${rarity.borderColor} bg-gradient-to-br ${rarity.bgGradient}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    {/* Left/Top Part: Info */}
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className={`p-1.5 sm:p-2 rounded-md mr-2 sm:mr-3 ${rarity.iconBg} shadow-sm`}>
                        <config.icon size={20} smSize={24} className={rarity.accentColor} />
                      </div>
                      <div>
                        <h5 className={`text-sm sm:text-md font-semibold ${rarity.textColor}`}>{config.name} <span className="text-xs text-slate-500">#{miner.instanceId.substring(0, 4)}</span></h5>
                        <p className={`text-xs sm:text-sm ${rarity.accentColor} font-medium`}>Cấp: {miner.level}/{MAX_MINER_LEVEL}</p>
                        <p className="text-xs text-green-400">{currentRate.toFixed(2)} vàng/s</p>
                      </div>
                    </div>

                    {/* Right/Bottom Part: Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                      <button
                        onClick={() => onLevelUpMiner(miner.instanceId)}
                        disabled={!canAffordLevelUp || isMaxLevel}
                        title={isMaxLevel ? "Đã đạt cấp tối đa" : `Chi phí: ${levelUpCost.toLocaleString()}`}
                        className={`w-full sm:w-auto py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1
                          ${(canAffordLevelUp && !isMaxLevel)
                            ? `bg-sky-500 hover:bg-sky-400 text-white shadow`
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          } ${isMaxLevel ? 'opacity-70' : ''}`}
                      >
                        <LevelUpArrowIcon size={14} />
                        {isMaxLevel ? 'Max Cấp' : `Lên Cấp (${levelUpCost.toLocaleString()})`}
                      </button>
                      <button
                        onClick={() => onSellMiner(miner.instanceId)}
                        title={`Bán: ${sellValue.toLocaleString()}`}
                        className="w-full sm:w-auto py-1.5 px-2.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-500 text-white shadow transition-colors duration-150 flex items-center justify-center gap-1"
                      >
                        <SellIcon size={14} />
                        Bán ({sellValue.toLocaleString()})
                      </button>
                    </div>
                  </div>
                   {/* Level Progress Bar */}
                  { MAX_MINER_LEVEL > 1 &&
                    <div className="mt-2">
                        <div className="w-full bg-slate-700 rounded-full h-1.5 sm:h-2">
                            <div 
                                className={`h-full rounded-full ${rarity.accentColor.replace('text-', 'bg-')}`}
                                style={{ width: `${(miner.level / MAX_MINER_LEVEL) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                  }
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinerManagementSection;
