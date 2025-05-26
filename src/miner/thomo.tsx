--- START OF FILE thomo.tsx (1).txt ---

import React from 'react';

// Define props interface for MinerHiringSection component
interface MinerTypeData {
  id: string;
  name: string;
  description: string;
  baseCost: number; // Cost to hire one
  baseRate: number; // Base gold/sec per miner
  iconName: 'basic' | 'advanced' | 'master'; // To select icon component
  count: number;
  level: number; // Current level of this miner type
  maxLevel: number; // Max upgradeable level
  rateIncreasePerLevel: number; // Additional gold/s per level for THIS miner type
  currentUpgradeCost: number; // Cost for the NEXT upgrade of this miner type
  sellPrice: number; // Gold received when selling one
}

interface MinerHiringSectionProps {
  MINER_TYPES_DATA: Array<MinerTypeData>;
  handleHireMiner: (minerId: string) => Promise<void>;
  handleUpgradeMinerType: (minerId: string) => Promise<void>; // New handler
  handleSellMiner: (minerId: string) => Promise<void>;     // New handler
  currentCoins: number;
  CoinIcon: React.FC<any>; // Pass CoinIcon as a prop
  minerEfficiencyLevel: number; // Global efficiency level from GoldMine
  EFFICIENCY_BONUS_PER_LEVEL: number; // Global bonus per efficiency level from GoldMine
}

// --- SVG ICONS (Moved here for self-containment, but can be imported if preferred) ---
// Miners Icon (User Group)
const MinersIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// New Icon for Advanced Miner (using a gear for now)
const AdvancedMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);

// New Icon for Master Miner (using a crown for now)
const MasterMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m2 16 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2v-2l-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2v2z" /><path d="M12 14v-2" /><path d="M12 10V8" /><path d="M12 6V4" /><path d="M12 2v2" /><path d="M12 22v-2" /><path d="M12 18v-2" /><path d="M12 20v-2" />
  </svg>
);

const LevelStarIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="#D4AF37" strokeWidth="0.5" className={className} {...props}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const ActionUpgradeIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>
  </svg>
);

const SellIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line> {/* Simple minus for sell one */}
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);
// ------------------------------------------------------------------------------------

const MinerHiringSection: React.FC<MinerHiringSectionProps> = ({
  MINER_TYPES_DATA,
  handleHireMiner,
  handleUpgradeMinerType,
  handleSellMiner,
  currentCoins,
  CoinIcon,
  minerEfficiencyLevel,
  EFFICIENCY_BONUS_PER_LEVEL
}) => {

  const getMinerIconComponent = (iconName: 'basic' | 'advanced' | 'master') => {
    switch (iconName) {
      case 'basic': return MinersIcon;
      case 'advanced': return AdvancedMinerIcon;
      case 'master': return MasterMinerIcon;
      default: return MinersIcon; // Fallback
    }
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-slate-700">
      <h3 className="text-2xl font-bold text-blue-300 mb-6 border-b border-slate-600 pb-3">
        Quản Lý Thợ Mỏ
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MINER_TYPES_DATA.map((miner) => {
          const IconComponent = getMinerIconComponent(miner.iconName);
          const ratePerMinerFromTypeLevel = miner.level * miner.rateIncreasePerLevel;
          const ratePerMinerFromGlobalEfficiency = minerEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL;
          const actualRatePerMiner = miner.baseRate + ratePerMinerFromTypeLevel + ratePerMinerFromGlobalEfficiency;
          const totalRateForType = miner.count * actualRatePerMiner;
          const canAffordHire = currentCoins >= miner.baseCost;
          const canAffordUpgrade = currentCoins >= miner.currentUpgradeCost;
          const isMaxLevel = miner.level >= miner.maxLevel;
          const canSell = miner.count > 0;

          return (
            <div key={miner.id} className="flex flex-col bg-slate-700/60 rounded-lg shadow-xl border border-slate-600 overflow-hidden transition-all duration-300 hover:shadow-slate-900/50 hover:border-slate-500">
              {/* Card Header */}
              <div className="p-3 bg-slate-750/50 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent size={28} className="text-sky-300" />
                    <h4 className="text-lg font-semibold text-sky-200">{miner.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-0.5 bg-yellow-500/20 rounded-full border border-yellow-500">
                    <LevelStarIcon size={14} color="#FFD700" />
                    <span className="text-xs font-bold text-yellow-300">Cấp {miner.level}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-3 flex-grow">
                <p className="text-xs text-gray-400 italic h-10">{miner.description}</p>

                {/* Stats */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Số lượng:</span>
                    <span className="font-bold text-yellow-300">{miner.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Năng suất/Thợ:</span>
                    <span className="font-bold text-green-300">
                      {actualRatePerMiner.toFixed(3)} <CoinIcon size={12} className="inline -mt-0.5" color="gold" />/s
                    </span>
                  </div>
                   {miner.count > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Tổng sản lượng:</span>
                        <span className="font-bold text-green-400">
                        {totalRateForType.toFixed(3)} <CoinIcon size={12} className="inline -mt-0.5" color="gold" />/s
                        </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer - Actions */}
              <div className="p-3 bg-slate-750/40 border-t border-slate-600 space-y-2">
                {/* Hire Action */}
                <button
                  onClick={() => handleHireMiner(miner.id)}
                  disabled={!canAffordHire}
                  title={`Giá thuê: ${miner.baseCost.toLocaleString()} vàng`}
                  className={`w-full py-2 px-3 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2
                    ${!canAffordHire
                      ? 'bg-slate-600 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100'
                    }`}
                >
                  <CoinIcon size={16} className="inline" color="gold" />
                  <span>Thuê ({miner.baseCost.toLocaleString()})</span>
                </button>

                {/* Upgrade Action */}
                <div className="pt-1">
                  <button
                    onClick={() => handleUpgradeMinerType(miner.id)}
                    disabled={isMaxLevel || !canAffordUpgrade}
                    title={isMaxLevel ? `Đã đạt cấp tối đa (${miner.maxLevel})` : `Nâng cấp: ${miner.currentUpgradeCost.toLocaleString()} vàng`}
                    className={`w-full py-2 px-3 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2
                      ${isMaxLevel ? 'bg-slate-500 text-gray-400 cursor-not-allowed' : 
                       !canAffordUpgrade ? 'bg-slate-600 text-gray-500 cursor-not-allowed' :
                       'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100'
                      }`}
                  >
                    <ActionUpgradeIcon size={16} className="inline" />
                    <span>
                      {isMaxLevel ? `Tối Đa (Cấp ${miner.level})` : `Nâng Cấp (${miner.currentUpgradeCost.toLocaleString()})`}
                    </span>
                  </button>
                  {!isMaxLevel && (
                    <p className="text-xs text-center text-green-300/80 mt-1">
                      Lên Cấp {miner.level + 1}: +{miner.rateIncreasePerLevel.toFixed(3)} <CoinIcon size={10} className="inline -mt-0.5" color="gold" />/s
                    </p>
                  )}
                </div>

                {/* Sell Action */}
                <div className="pt-1">
                    <button
                    onClick={() => handleSellMiner(miner.id)}
                    disabled={!canSell}
                    title={`Bán nhận: ${miner.sellPrice.toLocaleString()} vàng`}
                    className={`w-full py-2 px-3 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2
                        ${!canSell
                        ? 'bg-slate-600 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100'
                        }`}
                    >
                    <SellIcon size={16} className="inline" />
                    <span>Bán ({miner.sellPrice.toLocaleString()})</span>
                    </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MinerHiringSection;

--- END OF FILE thomo.tsx (1).txt ---
