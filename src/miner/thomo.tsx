import React from 'react';

// Định nghĩa props interface cho MinerHiringSection component
interface MinerHiringSectionProps {
  MINER_TYPES: Array<{
    id: string;
    name: string;
    description: string;
    baseCost: number;
    baseRate: number;
    icon: React.FC<any>;
    count: number;
    sellReturnFactor: number;
  }>;
  handleHireMiner: (minerId: string) => Promise<void>;
  handleSellMiner: (minerId: string) => Promise<void>;
  currentCoins: number;
  CoinIcon: React.FC<any>;
  minerEfficiencyLevel: number;
  efficiencyBonusPerLevel: number;
}

// --- BIỂU TƯỢNG SVG NÂNG CAP ---
const MinersIcon = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const AdvancedMinerIcon = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);

const MasterMinerIcon = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2 13.17A2 2 0 0 0 3.17 12H0V9h3.17A2 2 0 0 0 2 7.83L4.93 2 12 6l7.07-4L22 7.83A2 2 0 0 0 20.83 9H24v3h-3.17A2 2 0 0 0 22 13.17L19.07 19H4.93Z"></path>
    <path d="M12 6v12"></path>
  </svg>
);

const SellIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TrendingUpIcon = ({ size = 14, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinerHiringSection: React.FC<MinerHiringSectionProps> = ({
  MINER_TYPES,
  handleHireMiner,
  handleSellMiner,
  currentCoins,
  CoinIcon,
  minerEfficiencyLevel,
  efficiencyBonusPerLevel,
}) => {
  const getRarityTheme = (minerId: string) => {
    const themes = {
      basic: {
        primary: 'text-slate-300',
        accent: 'text-slate-400',
        border: 'border-slate-500/40',
        bg: 'from-slate-800/60 to-slate-900/80',
        glow: 'shadow-slate-500/20',
        iconBg: 'bg-slate-700/60',
        hoverGlow: 'hover:shadow-slate-400/30',
      },
      advanced: {
        primary: 'text-blue-300',
        accent: 'text-blue-400',
        border: 'border-blue-500/40',
        bg: 'from-blue-900/40 to-slate-900/80',
        glow: 'shadow-blue-500/25',
        iconBg: 'bg-blue-800/50',
        hoverGlow: 'hover:shadow-blue-400/40',
      },
      master: {
        primary: 'text-purple-300',
        accent: 'text-purple-400',
        border: 'border-purple-500/40',
        bg: 'from-purple-900/40 to-slate-900/80',
        glow: 'shadow-purple-500/25',
        iconBg: 'bg-purple-800/50',
        hoverGlow: 'hover:shadow-purple-400/40',
      }
    };
    return themes[minerId] || themes.basic;
  };

  const processedMiners = MINER_TYPES.map(miner => {
    const currentRate = miner.baseRate + minerEfficiencyLevel * efficiencyBonusPerLevel;
    const totalOutput = currentRate * miner.count;
    const sellValue = Math.floor(miner.baseCost * miner.sellReturnFactor);
    const theme = getRarityTheme(miner.id);

    return {
      ...miner,
      currentRate,
      totalOutput,
      sellValue,
      theme,
      canAfford: currentCoins >= miner.baseCost,
      canSell: miner.count > 0,
    };
  });

  const totalMiners = processedMiners.reduce((sum, m) => sum + m.count, 0);
  const totalIncome = processedMiners.reduce((sum, m) => sum + m.totalOutput, 0);

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/95 to-slate-900/90 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
      {/* Header - Compact */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800/70 to-slate-700/70 border-b border-slate-600/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <MinersIcon size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quản Lý Thợ Mỏ</h3>
              <p className="text-xs text-slate-400">Tối ưu hóa sản lượng vàng</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="text-center">
              <div className="text-slate-400">Tổng</div>
              <div className="font-bold text-white">{totalMiners}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Thu nhập/s</div>
              <div className="font-bold text-green-400">{totalIncome.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Hiệu suất</div>
              <div className="font-bold text-yellow-400">Lv.{minerEfficiencyLevel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Miners Grid - Compact Cards */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {processedMiners.map((miner) => (
            <div
              key={miner.id}
              className={`group relative overflow-hidden rounded-lg border ${miner.theme.border} ${miner.theme.glow} ${miner.theme.hoverGlow} bg-gradient-to-br ${miner.theme.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-opacity-60`}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative p-3">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${miner.theme.iconBg} border ${miner.theme.border}`}>
                    <miner.icon size={24} className={miner.theme.primary} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold ${miner.theme.primary} truncate`}>{miner.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{miner.description}</p>
                  </div>
                  {miner.count > 0 && (
                    <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                      <span className="text-xs font-bold text-yellow-400">{miner.count}</span>
                    </div>
                  )}
                </div>

                {/* Stats Compact */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-400">Năng suất</div>
                    <div className="text-sm font-bold text-green-400">{miner.currentRate.toFixed(1)}/s</div>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-400">Chi phí</div>
                    <div className="text-sm font-bold text-yellow-400">{(miner.baseCost / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                {/* Total Output Badge */}
                {miner.count > 0 && (
                  <div className="flex items-center justify-center gap-1 p-2 mb-3 bg-gradient-to-r from-emerald-800/30 to-green-800/30 rounded-lg border border-emerald-700/30">
                    <TrendingUpIcon className="text-emerald-400" />
                    <span className="text-xs text-emerald-300">Tổng:</span>
                    <span className="text-sm font-bold text-emerald-400">{miner.totalOutput.toFixed(1)}/s</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleHireMiner(miner.id)}
                    disabled={!miner.canAfford}
                    className={`w-full py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn ${
                      miner.canAfford
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/30'
                    }`}
                  >
                    <PlusIcon size={14} className="group-hover/btn:rotate-90 transition-transform duration-200" />
                    <CoinIcon size={14} className={miner.canAfford ? "text-yellow-400" : "text-current"} />
                    <span>{(miner.baseCost / 1000).toFixed(0)}K</span>
                  </button>

                  {miner.canSell && (
                    <button
                      onClick={() => handleSellMiner(miner.id)}
                      className="w-full py-2 px-3 rounded-lg font-medium text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-rose-500/25"
                    >
                      <SellIcon size={12} />
                      <span>+{(miner.sellValue / 1000).toFixed(1)}K</span>
                    </button>
                  )}
                </div>

                {/* Efficiency Indicator */}
                {minerEfficiencyLevel > 0 && (
                  <div className="mt-2 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      <span className="text-xs text-yellow-400">⚡ +{((minerEfficiencyLevel * efficiencyBonusPerLevel) / miner.baseRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats - Mobile Friendly */}
        <div className="mt-4 p-3 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-lg border border-slate-600/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">Tổng Thợ Mỏ</div>
              <div className="text-lg font-bold text-white">{totalMiners}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Thu Nhập/Giây</div>
              <div className="text-lg font-bold text-green-400">{totalIncome.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Cấp Hiệu Suất</div>
              <div className="text-lg font-bold text-yellow-400">{minerEfficiencyLevel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerHiringSection;
