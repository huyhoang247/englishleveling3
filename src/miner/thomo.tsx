import React from 'react';

// Define props interface for MinerHiringSection component
interface MinerHiringSectionProps {
  MINER_TYPES: Array<{
    id: string;
    name: string;
    description: string;
    baseCost: number;
    baseRate: number; // Gold per second
    icon: React.FC<any>; // Icon component
    count: number;
    setCount: React.Dispatch<React.SetStateAction<number>>;
    upgradeCostMultiplier: number; // Cost multiplier for upgrades
    sellReturnFactor: number; // Factor for selling miners
  }>;
  handleHireMiner: (minerId: string) => Promise<void>;
  handleUpgradeMiner: (minerId: string) => Promise<void>; // New: handle upgrade
  handleSellMiner: (minerId: string) => Promise<void>; // New: handle sell
  currentCoins: number;
  CoinIcon: React.FC<any>; // Pass CoinIcon as a prop
  minerEfficiencyLevel: number; // Pass efficiency level
  efficiencyBonusPerLevel: number; // Pass efficiency bonus
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

// Upgrade Icon (Arrow Up Circle)
const UpgradeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>
  </svg>
);

// Sell Icon (Dollar Sign)
const SellIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);
// ------------------------------------------------------------------------------------

const MinerHiringSection: React.FC<MinerHiringSectionProps> = ({
  MINER_TYPES,
  handleHireMiner,
  handleUpgradeMiner,
  handleSellMiner,
  currentCoins,
  CoinIcon,
  minerEfficiencyLevel,
  efficiencyBonusPerLevel,
}) => {
  // Map MINER_TYPES to include the actual icon components
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
        IconComponent = MinersIcon; // Fallback
    }

    const currentRate = miner.baseRate + minerEfficiencyLevel * efficiencyBonusPerLevel;
    const upgradeCost = Math.floor(miner.baseCost * miner.upgradeCostMultiplier);
    const sellValue = Math.floor(miner.baseCost * miner.sellReturnFactor);

    return {
      ...miner,
      icon: IconComponent,
      currentRate,
      upgradeCost,
      sellValue,
    };
  });

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700">
      {/* Removed the duplicate h3 title here */}
      <div className="grid sm:grid-cols-2 gap-4">
        {minerTypesWithIcons.map((miner) => (
          <div key={miner.id} className="flex flex-col justify-between p-4 bg-slate-700/50 rounded-lg shadow-md border border-slate-600 hover:border-blue-500 transition-colors duration-200">
            <div className="flex items-center space-x-3 mb-2">
              <miner.icon size={28} className="text-white" />
              <h4 className="text-xl font-bold text-white">{miner.name}</h4>
            </div>
            <p className="text-xs text-gray-400 mb-2">{miner.description}</p>
            <p className="text-sm text-gray-300">
              Số lượng hiện có: <span className="font-bold text-yellow-300">{miner.count}</span>
            </p>
            <p className="text-sm text-gray-300 mb-3">
              Khai thác: <span className="font-bold text-green-400">{miner.currentRate.toFixed(2)} vàng/s</span>
            </p>

            <div className="flex flex-col space-y-2 mt-auto">
              {/* Hire Button */}
              <button
                onClick={() => handleHireMiner(miner.id)}
                disabled={currentCoins < miner.baseCost}
                className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2
                  ${currentCoins < miner.baseCost
                    ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  }`}
              >
                <CoinIcon size={16} className="inline -mt-0.5" color="gold" />
                <span>Thuê ({miner.baseCost.toLocaleString()})</span>
              </button>

              {/* Upgrade Button (if applicable) */}
              {miner.id !== 'master' && ( // Example: Master miners cannot be upgraded further
                <button
                  onClick={() => handleUpgradeMiner(miner.id)}
                  disabled={currentCoins < miner.upgradeCost || miner.count === 0}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2
                    ${currentCoins < miner.upgradeCost || miner.count === 0
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                    }`}
                >
                  <UpgradeIcon size={16} className="inline -mt-0.5" color="white" />
                  <span>Nâng cấp ({miner.upgradeCost.toLocaleString()})</span>
                </button>
              )}

              {/* Sell Button */}
              <button
                onClick={() => handleSellMiner(miner.id)}
                disabled={miner.count === 0}
                className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2
                  ${miner.count === 0
                    ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  }`}
              >
                <SellIcon size={16} className="inline -mt-0.5" color="white" />
                <span>Bán ({miner.sellValue.toLocaleString()})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinerHiringSection;
