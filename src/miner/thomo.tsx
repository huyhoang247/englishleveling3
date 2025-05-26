import React from 'react';

// Define props interface for MinerHiringSection component
interface MinerHiringSectionProps {
  MINER_TYPES: Array<{
    id: string;
    name: string;
    description: string;
    baseCost: number;
    baseRate: number; // Initial Gold per second
    levelRateBonusPerLevel: number; // Rate bonus per level for this specific miner type
    levelUpCostMultiplier: number; // Cost multiplier for leveling up this specific miner type
    sellReturnFactor: number; // Factor for selling miners
    count: number;
    level: number; // New: Current level of this miner type
    setCount: React.Dispatch<React.SetStateAction<number>>;
    // setLevel: React.Dispatch<React.SetStateAction<number>>; // Not directly used here for updating level
    currentRate: number; // Calculated rate per individual miner (based on its level)
    totalOutput: number; // Total output for this miner type (count * currentRate)
    upgradeCost: number; // Cost to upgrade this miner type to the next level
    sellValue: number; // Value when selling one miner
  }>;
  handleHireMiner: (minerId: string) => Promise<void>;
  handleUpgradeMiner: (minerId: string) => Promise<void>; // This now handles actual level upgrades
  handleSellMiner: (minerId: string) => Promise<void>;
  currentCoins: number;
  CoinIcon: React.FC<any>; // Pass CoinIcon as a prop
  minerEfficiencyLevel: number; // Pass global efficiency level
  efficiencyBonusPerLevel: number; // Pass global efficiency bonus
}

// --- ENHANCED SVG ICONS ---
const MinersIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const AdvancedMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-1 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);

const MasterMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m2 16 20-10-4 12L6 14l-4 2z"/>
    <path d="m6 16 2 2 4-4"/>
  </svg>
);

const UpgradeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2v20m8-8-8-8-8 8"/>
  </svg>
);

const SellIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TrendingUpIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const MinerHiringSection: React.FC<MinerHiringSectionProps> = ({
  MINER_TYPES,
  handleHireMiner,
  handleUpgradeMiner, // This now handles actual level upgrades
  handleSellMiner,
  currentCoins,
  CoinIcon,
  minerEfficiencyLevel,
  efficiencyBonusPerLevel,
}) => {
  // Get rarity colors based on miner type
  const getRarityColor = (minerId: string) => {
    switch (minerId) {
      case 'basic':
        return {
          border: 'border-slate-500',
          glow: 'shadow-slate-500/20',
          accent: 'text-slate-300',
          bg: 'bg-slate-700/60',
          levelBar: 'bg-blue-500'
        };
      case 'advanced':
        return {
          border: 'border-blue-500',
          glow: 'shadow-blue-500/30',
          accent: 'text-blue-300',
          bg: 'bg-blue-900/20',
          levelBar: 'bg-purple-500'
        };
      case 'master':
        return {
          border: 'border-purple-500',
          glow: 'shadow-purple-500/40',
          accent: 'text-purple-300',
          bg: 'bg-purple-900/20',
          levelBar: 'bg-amber-500'
        };
      default:
        return {
          border: 'border-slate-500',
          glow: 'shadow-slate-500/20',
          accent: 'text-slate-300',
          bg: 'bg-slate-700/60',
          levelBar: 'bg-gray-500'
        };
    }
  };

  // Map MINER_TYPES to include the actual icon components and enhanced data for rendering
  const minerTypesWithIcons = MINER_TYPES.map(miner => {
    let IconComponent;
    switch (miner.id) {
      case 'basic':
        IconComponent = MinersIcon;
        break;
      case 'advanced':
        IconComponent = AdvancedMinerIcon;
        break;
      case 'master':
        IconComponent = MasterMinerIcon;
        break;
      default:
        IconComponent = MinersIcon;
    }

    // Calculate current rate per miner including its individual level bonus
    const currentRatePerMiner = miner.baseRate * (1 + (miner.level - 1) * miner.levelRateBonusPerLevel);
    // Calculate total output including global efficiency
    const totalOutputWithGlobalEfficiency = miner.count * (currentRatePerMiner + minerEfficiencyLevel * efficiencyBonusPerLevel);

    const colors = getRarityColor(miner.id);

    const canAffordHire = currentCoins >= miner.baseCost;
    // Can upgrade if current coins are sufficient AND there's at least one miner of this type AND not at max level (e.g., level 20)
    const MAX_MINER_LEVEL = 20; // Needs to match the constant in GoldMine.tsx
    const canAffordUpgrade = currentCoins >= miner.upgradeCost && miner.count > 0 && miner.level < MAX_MINER_LEVEL;
    const canSell = miner.count > 0;

    return {
      ...miner,
      icon: IconComponent,
      currentRatePerMiner, // Rate of a single miner of this type, based on its level
      totalOutputWithGlobalEfficiency, // Total output of all miners of this type, including global efficiency
      colors,
      canAffordHire,
      canAffordUpgrade,
      canSell,
      MAX_MINER_LEVEL // Pass max level for display purposes
    };
  });

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-slate-700/50">
      {/* Header Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <MinersIcon size={24} className="text-white" />
          </div>
          Trung Tâm Tuyển Dụng Thợ Mỏ
        </h3>
        <p className="text-slate-300 text-sm">
          Thuê và quản lý đội ngũ thợ mỏ của bạn để tối ưu hóa thu nhập
        </p>
      </div>

      {/* Miners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {minerTypesWithIcons.map((miner) => (
          <div 
            key={miner.id} 
            className={`relative group overflow-hidden rounded-xl border-2 ${miner.colors.border} ${miner.colors.glow} shadow-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 ${miner.colors.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Content */}
            <div className="relative p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ${miner.colors.border} border shadow-lg`}>
                    <miner.icon size={28} className={miner.colors.accent} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{miner.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{miner.description}</p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="space-y-3 mb-5">
                {/* Count and Rate */}
                <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border border-slate-600/50">
                  <div className="text-center flex-1">
                    <p className="text-xs text-slate-400 uppercase font-medium">Số lượng</p>
                    <p className="text-lg font-bold text-yellow-400">{miner.count}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-600"></div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-slate-400 uppercase font-medium">Tỷ lệ/thợ</p>
                    <p className="text-lg font-bold text-green-400">{miner.currentRatePerMiner.toFixed(2)}/s</p>
                  </div>
                </div>

                {/* Level Display */}
                <div className="p-2 bg-slate-800/60 rounded-lg border border-slate-600/50">
                  <p className="text-xs text-slate-400 uppercase font-medium text-center mb-1">Cấp độ</p>
                  <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${miner.colors.levelBar} transition-all duration-500 ease-out`} 
                      style={{ width: `${(miner.level / miner.MAX_MINER_LEVEL) * 100}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">
                      Lv. {miner.level} / {miner.MAX_MINER_LEVEL}
                    </span>
                  </div>
                </div>

                {/* Total Output */}
                {miner.count > 0 && (
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700/30">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="text-green-400" />
                      <span className="text-sm text-green-300">Tổng sản lượng:</span>
                    </div>
                    <span className="font-bold text-green-400">{totalOutputWithGlobalEfficiency.toFixed(2)} vàng/s</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Hire Button */}
                <button
                  onClick={() => handleHireMiner(miner.id)}
                  disabled={!miner.canAffordHire}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    miner.canAffordHire
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/50'
                  }`}
                >
                  <CoinIcon size={18} color={miner.canAffordHire ? "gold" : "currentColor"} />
                  <span>Thuê - {miner.baseCost.toLocaleString()}</span>
                </button>

                {/* Upgrade and Sell Row */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Upgrade Button */}
                  <button
                    onClick={() => handleUpgradeMiner(miner.id)}
                    disabled={!miner.canAffordUpgrade}
                    className={`py-2.5 px-3 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      miner.canAffordUpgrade
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30'
                    }`}
                  >
                    <UpgradeIcon size={14} />
                    <span>Nâng cấp - {miner.upgradeCost.toLocaleString()}</span>
                  </button>

                  {/* Sell Button */}
                  <button
                    onClick={() => handleSellMiner(miner.id)}
                    disabled={!miner.canSell}
                    className={`py-2.5 px-3 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      miner.canSell
                        ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30'
                    }`}
                  >
                    <SellIcon size={14} />
                    <span>Bán - {miner.sellValue.toLocaleString()}</span>
                  </button>
                </div>
              </div>

              {/* Efficiency Indicator (Global) */}
              {minerEfficiencyLevel > 0 && (
                <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <p className="text-xs text-yellow-300 text-center">
                    ⚡ Hiệu suất tổng thể +{((minerEfficiencyLevel * efficiencyBonusPerLevel) / miner.baseRate * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium mb-1">Tổng thợ mỏ</p>
            <p className="text-xl font-bold text-white">
              {minerTypesWithIcons.reduce((sum, miner) => sum + miner.count, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium mb-1">Thu nhập/giây</p>
            <p className="text-xl font-bold text-green-400">
              {minerTypesWithIcons.reduce((sum, miner) => sum + miner.totalOutputWithGlobalEfficiency, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium mb-1">Hiệu suất tổng thể</p>
            <p className="text-xl font-bold text-yellow-400">
              Cấp {minerEfficiencyLevel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerHiringSection;
