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
    count: number; // Số lượng hiện tại của loại thợ mỏ này
    sellReturnFactor: number;
  }>;
  handleHireMiner: (minerId: string) => Promise<void>;
  handleSellMiner: (minerId: string) => Promise<void>;
  currentCoins: number;
  CoinIcon: React.FC<any>;
  minerEfficiencyLevel: number;
  efficiencyBonusPerLevel: number;
}

// --- BIỂU TƯỢNG SVG NÂNG CAO ---
// (Giữ nguyên các biểu tượng SVG đã có trong tệp thomo.tsx của bạn)
// Biểu tượng Thợ Mỏ (Nhóm người dùng)
const MinersIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// Biểu tượng Thợ Mỏ Cao Cấp (Bánh răng)
const AdvancedMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);

// Biểu tượng Thợ Mỏ Bậc Thầy (Vương miện - sử dụng từ gold-miner.tsx để đồng bộ)
const MasterMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M2 13.17A2 2 0 0 0 3.17 12H0V9h3.17A2 2 0 0 0 2 7.83L4.93 2 12 6l7.07-4L22 7.83A2 2 0 0 0 20.83 9H24v3h-3.17A2 2 0 0 0 22 13.17L19.07 19H4.93Z"></path><path d="M12 6v12"></path>
    </svg>
  );

// Biểu tượng Bán (Đô la)
const SellIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

// Biểu tượng Tăng trưởng (Mũi tên đi lên)
const TrendingUpIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
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
  const getRarityColor = (minerId: string) => {
    switch (minerId) {
      case 'basic':
        return {
          border: 'border-slate-500 hover:border-slate-400',
          glow: 'shadow-[0_0_12px_0px_rgba(100,116,139,0.3)] hover:shadow-[0_0_18px_0px_rgba(100,116,139,0.5)]',
          accent: 'text-slate-300',
          bgFrom: 'from-slate-700/70',
          bgTo: 'to-slate-800/70',
          iconBg: 'bg-slate-600/50',
        };
      case 'advanced':
        return {
          border: 'border-blue-500 hover:border-blue-400',
          glow: 'shadow-[0_0_12px_0px_rgba(59,130,246,0.4)] hover:shadow-[0_0_18px_0px_rgba(59,130,246,0.6)]',
          accent: 'text-blue-300',
          bgFrom: 'from-blue-800/50',
          bgTo: 'to-blue-900/50',
          iconBg: 'bg-blue-700/40',
        };
      case 'master':
        return {
          border: 'border-purple-500 hover:border-purple-400',
          glow: 'shadow-[0_0_12px_0px_rgba(168,85,247,0.4)] hover:shadow-[0_0_18px_0px_rgba(168,85,247,0.6)]',
          accent: 'text-purple-300',
          bgFrom: 'from-purple-800/50',
          bgTo: 'to-purple-900/50',
          iconBg: 'bg-purple-700/40',
        };
      default:
        return {
          border: 'border-slate-500',
          glow: 'shadow-slate-500/20',
          accent: 'text-slate-300',
          bgFrom: 'from-slate-700/60',
          bgTo: 'to-slate-800/60',
          iconBg: 'bg-slate-600/50',
        };
    }
  };

  const minerTypesWithData = MINER_TYPES.map(miner => {
    const IconComponent = miner.icon;
    const currentRate = miner.baseRate + minerEfficiencyLevel * efficiencyBonusPerLevel;
    const totalOutput = currentRate * miner.count;
    const sellValue = Math.floor(miner.baseCost * miner.sellReturnFactor);
    const colors = getRarityColor(miner.id);

    const canAffordHire = currentCoins >= miner.baseCost;
    const canSell = miner.count > 0;

    return {
      ...miner,
      iconComponent: IconComponent,
      currentRate,
      totalOutput,
      sellValue,
      colors,
      canAffordHire,
      canSell,
    };
  });

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm p-4 sm:p-5 rounded-lg shadow-xl border border-slate-700/50">
      <div className="mb-5 text-center sm:text-left">
        <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-1 flex items-center justify-center sm:justify-start gap-2.5">
          <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-md shadow-sm">
            <MinersIcon size={20} className="text-white" />
          </div>
          Quản Lý Thợ Mỏ
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm">
          Thuê và bán thợ mỏ để tối ưu hóa sản lượng vàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {minerTypesWithData.map((miner) => (
          <div
            key={miner.id}
            className={`relative group overflow-hidden rounded-lg border ${miner.colors.border} ${miner.colors.glow} bg-gradient-to-br ${miner.colors.bgFrom} ${miner.colors.bgTo} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 opacity-30 group-hover:opacity-60"></div>
            
            <div className="relative p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-md ${miner.colors.iconBg} ${miner.colors.border} border shadow-md`}>
                  <miner.iconComponent size={28} className={miner.colors.accent} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-md font-semibold ${miner.colors.accent}`}>{miner.name}</h4>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5">{miner.description}</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex justify-around items-baseline p-2.5 bg-slate-800/60 rounded-md border border-slate-600/50 shadow-inner">
                  <div className="text-center">
                    <p className="text-[0.65rem] sm:text-xs text-slate-400 uppercase font-medium">Số Lượng</p>
                    <p className={`text-lg font-bold ${miner.count > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>{miner.count}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-600/70"></div>
                  <div className="text-center">
                    <p className="text-[0.65rem] sm:text-xs text-slate-400 uppercase font-medium">Năng Suất</p>
                    <p className="text-lg font-bold text-green-400">{miner.currentRate.toFixed(2)}/s</p>
                  </div>
                </div>

                {miner.count > 0 && (
                  <div className="flex items-center justify-between p-2 text-xs bg-gradient-to-r from-green-800/30 to-emerald-900/30 rounded-md border border-green-700/30 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <TrendingUpIcon className="text-green-400" size={16} />
                      <span className="text-green-300">Tổng:</span>
                    </div>
                    <span className="font-semibold text-green-400">{miner.totalOutput.toFixed(2)} vàng/s</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleHireMiner(miner.id)}
                  disabled={!miner.canAffordHire}
                  className={`w-full py-2 px-3 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transform hover:scale-[1.03] active:scale-[1]
                    ${miner.canAffordHire
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed ring-1 ring-slate-600'
                    }`}
                >
                  <CoinIcon size={16} color={miner.canAffordHire ? "gold" : "currentColor"} />
                  <span>Thuê ({miner.baseCost.toLocaleString()})</span>
                </button>

                <button
                  onClick={() => handleSellMiner(miner.id)}
                  disabled={!miner.canSell}
                  className={`w-full py-2 px-3 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transform hover:scale-[1.03] active:scale-[1]
                    ${miner.canSell
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed ring-1 ring-slate-600'
                    }`}
                >
                  <SellIcon size={14} />
                  <span>Bán (+{miner.sellValue.toLocaleString()})</span>
                </button>
              </div>

              {minerEfficiencyLevel > 0 && (
                <div className="mt-3 p-1.5 bg-yellow-900/20 border border-yellow-700/30 rounded-md text-center">
                  <p className="text-[0.7rem] text-yellow-300">
                    ⚡ Hiệu suất: +{((minerEfficiencyLevel * efficiencyBonusPerLevel) / miner.baseRate * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/60 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-medium mb-0.5">Tổng Thợ Mỏ</p>
            <p className="text-xl font-bold text-white">
              {minerTypesWithData.reduce((sum, miner) => sum + miner.count, 0)}
            </p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-600/50 pt-2 sm:pt-0 sm:pl-3">
            <p className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-medium mb-0.5">Tổng Thu Nhập/s</p>
            <p className="text-xl font-bold text-green-400">
              {minerTypesWithData.reduce((sum, miner) => sum + miner.totalOutput, 0).toFixed(2)}
            </p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-600/50 pt-2 sm:pt-0 sm:pl-3">
            <p className="text-[0.7rem] sm:text-xs text-slate-400 uppercase font-medium mb-0.5">Cấp Hiệu Suất</p>
            <p className="text-xl font-bold text-yellow-400">
              {minerEfficiencyLevel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerHiringSection;
