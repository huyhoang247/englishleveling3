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
  CoinIcon: React.FC<any>;
}

// --- BIỂU TƯỢNG SVG NÂNG CAP ---
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
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);

const MasterMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2 13.17A2 2 0 0 0 3.17 12H0V9h3.17A2 2 0 0 0 2 7.83L4.93 2 12 6l7.07-4L22 7.83A2 2 0 0 0 20.83 9H24v3h-3.17A2 2 0 0 0 22 13.17L19.07 19H4.93Z"></path>
    <path d="M12 6v12"></path>
  </svg>
);

const SellIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TrendingUpIcon = ({ size = 16, color = 'currentColor', className = '', ...props }) => (
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

const LoadingSpinner = ({ size = 20, className = '' }) => (
  <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="60" strokeDashoffset="60" strokeLinecap="round">
      <animate attributeName="stroke-dashoffset" dur="2s" values="60;0" repeatCount="indefinite"/>
    </circle>
  </svg>
);

const MinerHiringSection: React.FC<MinerHiringSectionProps> = ({
  MINER_TYPES,
  handleHireMiner,
  handleSellMiner,
  currentCoins,
  CoinIcon,
}) => {
  const [displayedMinerCount, setDisplayedMinerCount] = useState(3);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [animatingCards, setAnimatingCards] = useState<Record<string, boolean>>({});
  const loadingRef = useRef<HTMLDivElement>(null);

  // Hàm xử lý animation cho các hành động
  const handleActionWithAnimation = async (action: () => Promise<void>, minerId: string, actionType: 'hire' | 'sell') => {
    const loadingKey = `${minerId}-${actionType}`;
    setLoadingActions(prev => ({ ...prev, [loadingKey]: true }));
    setAnimatingCards(prev => ({ ...prev, [minerId]: true }));
    
    try {
      await action();
      // Thêm delay nhỏ để người dùng thấy được feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setLoadingActions(prev => ({ ...prev, [loadingKey]: false }));
      setTimeout(() => {
        setAnimatingCards(prev => ({ ...prev, [minerId]: false }));
      }, 500);
    }
  };

  const getRarityColor = (minerId: string) => {
    switch (minerId) {
      case 'basic':
        return {
          border: 'border-slate-400/70 hover:border-slate-300',
          glow: 'shadow-[0_0_20px_-5px_rgba(148,163,184,0.3)] hover:shadow-[0_0_25px_-3px_rgba(148,163,184,0.5)]',
          accent: 'text-slate-200',
          bgFrom: 'from-slate-800/80',
          bgTo: 'to-slate-900/90',
          iconBg: 'bg-slate-700/60',
          progressBg: 'bg-slate-600',
          buttonGradient: 'from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600',
        };
      case 'advanced':
        return {
          border: 'border-blue-400/70 hover:border-blue-300',
          glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_-3px_rgba(59,130,246,0.6)]',
          accent: 'text-blue-200',
          bgFrom: 'from-blue-900/70',
          bgTo: 'to-blue-950/90',
          iconBg: 'bg-blue-800/50',
          progressBg: 'bg-blue-600',
          buttonGradient: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
        };
      case 'master':
        return {
          border: 'border-purple-400/70 hover:border-purple-300',
          glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_-3px_rgba(168,85,247,0.6)]',
          accent: 'text-purple-200',
          bgFrom: 'from-purple-900/70',
          bgTo: 'to-purple-950/90',
          iconBg: 'bg-purple-800/50',
          progressBg: 'bg-purple-600',
          buttonGradient: 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
        };
      default:
        return {
          border: 'border-slate-400/70',
          glow: 'shadow-slate-500/20',
          accent: 'text-slate-200',
          bgFrom: 'from-slate-800/80',
          bgTo: 'to-slate-900/90',
          iconBg: 'bg-slate-700/60',
          progressBg: 'bg-slate-600',
          buttonGradient: 'from-slate-600 to-slate-700',
        };
    }
  };

  const minerTypesWithData = MINER_TYPES.map(miner => {
    const IconComponent = miner.icon;
    const currentRate = miner.baseRate;
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

  const loadMoreMiners = useCallback(() => {
    setDisplayedMinerCount(prevCount =>
      Math.min(prevCount + 3, minerTypesWithData.length)
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

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl border border-slate-700/60">
      {/* Header với animation */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 mb-2 p-3 bg-gradient-to-r from-sky-500/20 to-indigo-600/20 rounded-xl border border-sky-400/30 backdrop-blur-sm">
          <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg animate-pulse">
            <MinersIcon size={24} className="text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Quản Lý Thợ Mỏ
          </h3>
        </div>
        <p className="text-slate-300 text-sm md:text-base">
          Thuê và bán thợ mỏ để tối ưu hóa sản lượng vàng
        </p>
      </div>

      {/* Grid cards với staggered animation */}
      <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
        {minerTypesWithData.slice(0, displayedMinerCount).map((miner, index) => (
          <div
            key={miner.id}
            className={`relative group overflow-hidden rounded-xl border ${miner.colors.border} ${miner.colors.glow} bg-gradient-to-br ${miner.colors.bgFrom} ${miner.colors.bgTo} backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-fade-in-up ${animatingCards[miner.id] ? 'animate-pulse scale-[1.02]' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            <div className="relative p-4 md:p-5">
              {/* Header section */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-xl ${miner.colors.iconBg} ${miner.colors.border} border shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <miner.iconComponent size={32} className={miner.colors.accent} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-bold ${miner.colors.accent} truncate`}>
                    {miner.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">
                    {miner.description}
                  </p>
                </div>
              </div>

              {/* Stats section với improved mobile layout */}
              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-600/50 text-center backdrop-blur-sm">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Số Lượng</p>
                    <p className={`text-xl font-bold ${miner.count > 0 ? 'text-yellow-400' : 'text-slate-500'} transition-colors duration-300`}>
                      {miner.count}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-600/50 text-center backdrop-blur-sm">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Năng Suất</p>
                    <p className="text-xl font-bold text-green-400">
                      {miner.currentRate.toFixed(1)}/s
                    </p>
                  </div>
                </div>

                {/* Total output với progress bar effect */}
                {miner.count > 0 && (
                  <div className="relative p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/40 rounded-lg border border-green-700/40 overflow-hidden">
                    <div className="absolute inset-0 bg-green-400/5 animate-pulse"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUpIcon className="text-green-400 animate-bounce" size={18} />
                        <span className="text-sm text-green-300 font-medium">Tổng Thu Nhập:</span>
                      </div>
                      <span className="text-lg font-bold text-green-400">
                        {miner.totalOutput.toFixed(1)} vàng/s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons với improved mobile touch targets */}
              <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-2">
                <button
                  onClick={() => handleActionWithAnimation(
                    () => handleHireMiner(miner.id), 
                    miner.id, 
                    'hire'
                  )}
                  disabled={!miner.canAffordHire || loadingActions[`${miner.id}-hire`]}
                  className={`w-full h-12 md:h-10 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none
                    ${miner.canAffordHire && !loadingActions[`${miner.id}-hire`]
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/25'
                      : 'bg-slate-700/80 text-slate-400 cursor-not-allowed border border-slate-600/50'
                    }`}
                >
                  {loadingActions[`${miner.id}-hire`] ? (
                    <LoadingSpinner size={16} className="text-white" />
                  ) : (
                    <>
                      <PlusIcon size={16} />
                      <CoinIcon size={16} color={miner.canAffordHire ? "gold" : "currentColor"} />
                    </>
                  )}
                  <span className="truncate">
                    Thuê ({miner.baseCost.toLocaleString()})
                  </span>
                </button>

                <button
                  onClick={() => handleActionWithAnimation(
                    () => handleSellMiner(miner.id), 
                    miner.id, 
                    'sell'
                  )}
                  disabled={!miner.canSell || loadingActions[`${miner.id}-sell`]}
                  className={`w-full h-12 md:h-10 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none
                    ${miner.canSell && !loadingActions[`${miner.id}-sell`]
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/25'
                      : 'bg-slate-700/80 text-slate-400 cursor-not-allowed border border-slate-600/50'
                    }`}
                >
                  {loadingActions[`${miner.id}-sell`] ? (
                    <LoadingSpinner size={16} className="text-white" />
                  ) : (
                    <SellIcon size={16} />
                  )}
                  <span className="truncate">
                    Bán (+{miner.sellValue.toLocaleString()})
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {displayedMinerCount < minerTypesWithData.length && (
        <div ref={loadingRef} className="text-center py-6">
          <div className="inline-flex items-center gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
            <LoadingSpinner size={24} className="text-sky-400" />
            <p className="text-slate-300 text-sm font-medium">Đang tải thêm thợ mỏ...</p>
          </div>
        </div>
      )}

      {/* Enhanced summary section */}
      <div className="mt-8 p-5 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-xl border border-slate-600/60 shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2 tracking-wider">Tổng Thợ Mỏ</p>
            <p className="text-3xl font-bold text-white">
              {minerTypesWithData.reduce((sum, miner) => sum + miner.count, 0)}
            </p>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2 tracking-wider">Tổng Thu Nhập/s</p>
            <p className="text-3xl font-bold text-green-400">
              {minerTypesWithData.reduce((sum, miner) => sum + miner.totalOutput, 0).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MinerHiringSection;
