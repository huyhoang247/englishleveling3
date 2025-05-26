import React, { useState, useEffect, useRef, useCallback } from 'react';

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
}

// --- BIỂU TƯỢNG SVG COMPACT ---
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

const TrendingUpIcon = ({ size = 14, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

// New Dollar Icon component
const DollarIcon = ({ size = 12, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
    alt="Dollar Icon"
    style={{ width: size, height: size }}
    className={className}
    onError={(e) => {
      // Fallback for image loading errors
      e.currentTarget.onerror = null; // prevents infinite loop
      e.currentTarget.src = "https://placehold.co/12x12/cccccc/000000?text=$"; // Placeholder image
    }}
    {...props}
  />
);


const MinerHiringSection: React.FC<MinerHiringSectionProps> = ({
  MINER_TYPES,
  handleHireMiner,
  handleSellMiner,
  currentCoins,
}) => {
  const [displayedMinerCount, setDisplayedMinerCount] = useState(6);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleActionWithAnimation = async (action: () => Promise<void>, minerId: string, actionType: 'hire' | 'sell') => {
    const loadingKey = `${minerId}-${actionType}`;
    setLoadingActions(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      await action();
    } finally {
      setTimeout(() => {
        setLoadingActions(prev => ({ ...prev, [loadingKey]: false }));
      }, 300);
    }
  };

  const getRarityStyle = (minerId: string) => {
    switch (minerId) {
      case 'basic':
        return {
          border: 'border-slate-300/40',
          bg: 'bg-slate-800/60',
          accent: 'text-slate-200',
          icon: 'text-slate-300',
          glow: 'shadow-sm shadow-slate-500/20',
        };
      case 'advanced':
        return {
          border: 'border-blue-400/50',
          bg: 'bg-blue-900/40',
          accent: 'text-blue-200',
          icon: 'text-blue-300',
          glow: 'shadow-sm shadow-blue-500/30',
        };
      case 'master':
        return {
          border: 'border-purple-400/50',
          bg: 'bg-purple-900/40',
          accent: 'text-purple-200',
          icon: 'text-purple-300',
          glow: 'shadow-sm shadow-purple-500/30',
        };
      default:
        return {
          border: 'border-slate-300/40',
          bg: 'bg-slate-800/60',
          accent: 'text-slate-200',
          icon: 'text-slate-300',
          glow: 'shadow-sm shadow-slate-500/20',
        };
    }
  };

  // Helper function to format coin values
  const formatCoinValue = (value: number) => {
    if (value < 1000) {
      return value.toFixed(0); // Display exact number if less than 1k
    }
    return `${(value / 1000).toFixed(0)}k`; // Display in 'k' format otherwise
  };

  const minerTypesWithData = MINER_TYPES.map(miner => {
    const IconComponent = miner.icon;
    const currentRate = miner.baseRate;
    const totalOutput = currentRate * miner.count;
    const sellValue = Math.floor(miner.baseCost * miner.sellReturnFactor);
    const style = getRarityStyle(miner.id);
    const canAffordHire = currentCoins >= miner.baseCost;
    const canSell = miner.count > 0;

    return {
      ...miner,
      iconComponent: IconComponent,
      currentRate,
      totalOutput,
      sellValue,
      style,
      canAffordHire,
      canSell,
    };
  });

  const loadMoreMiners = useCallback(() => {
    setDisplayedMinerCount(prevCount =>
      Math.min(prevCount + 6, minerTypesWithData.length)
    );
  }, [minerTypesWithData.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedMinerCount < minerTypesWithData.length) {
          loadMoreMiners();
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [displayedMinerCount, minerTypesWithData.length, loadMoreMiners]);

  const totalMiners = minerTypesWithData.reduce((sum, miner) => sum + miner.count, 0);
  const totalIncome = minerTypesWithData.reduce((sum, miner) => sum + miner.totalOutput, 0);

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg">
      {/* Removed Compact Header */}
      {/* Removed border-b border-slate-700/50 */}

      {/* Compact Grid */}
      <div className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {minerTypesWithData.slice(0, displayedMinerCount).map((miner) => (
            <div
              key={miner.id}
              className={`relative ${miner.style.bg} ${miner.style.border} ${miner.style.glow} border rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]`}
            >
              {/* Compact Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-700/50 rounded-md">
                  <miner.iconComponent size={18} className={miner.style.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold ${miner.style.accent} truncate`}>
                    {miner.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">{miner.description}</p>
                </div>
              </div>

              {/* Compact Stats */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="text-center">
                  <div className="text-slate-400">Số lượng</div>
                  <div className={`font-bold ${miner.count > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {miner.count}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">Hiệu suất</div>
                  <div className="font-bold text-green-400">{miner.currentRate.toFixed(1)}/s</div>
                </div>
                {miner.count > 0 && (
                  <div className="text-center">
                    <div className="text-slate-400">Tổng</div>
                    <div className="font-bold text-green-400">{miner.totalOutput.toFixed(1)}/s</div>
                  </div>
                )}
              </div>

              {/* Compact Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleActionWithAnimation(
                    () => handleHireMiner(miner.id), 
                    miner.id, 
                    'hire'
                  )}
                  disabled={!miner.canAffordHire || loadingActions[`${miner.id}-hire`]}
                  className={`flex-1 h-8 px-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1
                    ${miner.canAffordHire && !loadingActions[`${miner.id}-hire`]
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  {loadingActions[`${miner.id}-hire`] ? (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Buy</span>
                      <DollarIcon size={12} /> 
                      <span>{formatCoinValue(miner.baseCost)}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleActionWithAnimation(
                    () => handleSellMiner(miner.id), 
                    miner.id, 
                    'sell'
                  )}
                  disabled={!miner.canSell || loadingActions[`${miner.id}-sell`]}
                  className={`flex-1 h-8 px-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1
                    ${miner.canSell && !loadingActions[`${miner.id}-sell`]
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  {loadingActions[`${miner.id}-sell`] ? (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sell</span>
                      <DollarIcon size={12} />
                      <span>{formatCoinValue(miner.sellValue)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {displayedMinerCount < minerTypesWithData.length && (
          <div ref={loadingRef} className="text-center py-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md text-xs text-slate-300">
              <div className="w-3 h-3 border border-slate-400 border-t-sky-400 rounded-full animate-spin" />
              <span>Đang tải...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinerHiringSection;
