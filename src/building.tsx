// --- START OF FILE building.tsx (6).txt ---

// --- START OF FILE building.tsx (7).txt ---

// --- START OF FILE building.tsx (6).txt ---
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';
import { uiAssets } from './game-assets.ts'; 

// --- TIỆN ÍCH ---
// THAY ĐỔI: Sử dụng bộ định dạng số nhỏ gọn hơn để hiển thị chi phí
const formatNumber = (num: number) => {
  const n = Math.floor(num);
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString('en-US');
};

// --- CÁC COMPONENT ICON SVG ---

const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface GemIconProps { size?: number; className?: string; [key: string]: any; }
const GemIcon: React.FC<GemIconProps> = ({ size = 24, className = '', ...props }) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
        <img src={uiAssets.gemIcon} alt="Tourmaline Gem Icon" className="w-full h-full object-contain" />
    </div>
);

// THÊM MỚI: Component CoinIcon sử dụng tài nguyên từ game-assets
const CoinIcon = ({ size = 24, className = '' }) => (
    <img src={uiAssets.goldIcon} alt="Coin Icon" className={className} style={{ width: size, height: size, objectFit: 'contain' }} />
);

// THÊM MỚI: Icon Khóa được thiết kế riêng
const LockIcon = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const StarIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

// --- THÀNH PHẦN GIAO DIỆN (UI Components) ---

const GameHeader = ({ coins, gems, onClose }: { coins: number, gems: number, onClose: () => void }) => (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900/80 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between p-2 border-b border-slate-700/50">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700/70 transition-colors" aria-label="Đóng"><XIcon size={24} className="text-slate-300" /></button>
            <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                    <div className="relative mr-0.5 flex items-center justify-center"><GemIcon size={16} className="relative z-20" /></div>
                    <div className="font-bold text-purple-200 text-xs tracking-wide">{formatNumber(gems)}</div>
                    <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                    <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                </div>
                <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
            </div>
        </div>
    </header>
);

const UnlockedHamsterCard = ({ hamster, onUpgrade, userCoins }: { hamster: any, onUpgrade: (id: number) => void, userCoins: number }) => {
    const canUpgrade = userCoins >= hamster.upgradeCost && hamster.level < hamster.maxLevel;

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-700 flex gap-3 transition-all hover:bg-slate-700/70">
            {/* Icon - Centered vertically */}
            <div className="text-5xl flex-shrink-0 self-center">🐹</div>
            
            {/* Info (Name, Level, Earnings) - Centered vertically */}
            <div className="flex-grow min-w-0 space-y-2.5 self-center">
                <h3 className="font-bold text-white truncate">{hamster.name}</h3>
                
                <div className="flex items-center gap-3">
                     <span className="text-xs font-bold text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-full border border-slate-600">
                        Level {hamster.level}
                    </span>
                    <div className="text-xs font-bold text-green-400 flex items-center gap-1">
                        <CoinIcon size={14} />
                        <span>{formatNumber(hamster.earnings)}/h</span>
                    </div>
                </div>
            </div>

            {/* Actions (Progress and Upgrade Button) */}
            <div className="flex-shrink-0 flex flex-col justify-end items-end gap-2">
                {/* Simplified Progress Display */}
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="font-bold text-white">{hamster.progress}</span>
                    <span>/</span>
                    <span>{hamster.progressToLevelUp}</span>
                </div>

                <button 
                    onClick={() => onUpgrade(hamster.id)}
                    disabled={!canUpgrade}
                    title="Nâng cấp"
                    className={`flex items-center justify-center gap-1.5 h-7 px-3 rounded-lg text-xs font-bold transition-all duration-300 transform 
                    ${!canUpgrade
                        ? 'bg-slate-700 border border-slate-600 text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-800 border border-slate-600 text-yellow-300 hover:scale-105 active:scale-100'}`}
                >
                    <span>{formatNumber(hamster.upgradeCost)}</span>
                    <CoinIcon size={16} />
                </button>
            </div>
        </div>
    );
};

// ==================================================================
// =========== START OF REDESIGNED LockedHamsterCard COMPONENT ======
// ==================================================================
const LockedHamsterCard = ({ hamster, onUnlock, userCoins }: { hamster: any, onUnlock: (id: number) => void, userCoins: number }) => {
    const canUnlock = userCoins >= hamster.unlockCost;
    return (
        <div className="bg-slate-900/70 backdrop-blur-sm p-3 rounded-xl border border-slate-800 flex gap-3 transition-all opacity-90">
            {/* THAY ĐỔI: Icon container được thiết kế lại, thay thế emoji khóa */}
            <div className="w-16 h-16 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0 self-center border border-slate-700 shadow-inner">
                <LockIcon size={32} className="text-slate-500" />
            </div>
            
            {/* THAY ĐỔI: Sắp xếp lại thông tin cho nhất quán */}
            <div className="flex-grow min-w-0 self-center space-y-1.5">
                <h3 className="font-bold text-slate-500 truncate">{hamster.name}</h3>
                <div className="text-xs text-amber-500 flex items-center gap-1.5">
                    <CoinIcon size={14} />
                    <span>{formatNumber(hamster.earnings)}/h (khi mở khóa)</span>
                </div>
            </div>

            {/* THAY ĐỔI: Nút Mở khóa được thiết kế lại cho nhỏ gọn và hiện đại hơn */}
            <div className="flex-shrink-0 flex flex-col justify-center items-end">
                <button 
                    onClick={() => onUnlock(hamster.id)} 
                    disabled={!canUnlock} 
                    className={`flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-bold transition-all duration-300 transform 
                    ${!canUnlock
                        ? 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 active:scale-100 shadow-lg hover:shadow-amber-500/20'}`}
                >
                    <span>{formatNumber(hamster.unlockCost)}</span>
                    <CoinIcon size={18} />
                </button>
            </div>
        </div>
    );
};
// ==================================================================
// ============ END OF REDESIGNED LockedHamsterCard COMPONENT =======
// ==================================================================


const IncomeStorageBar = ({ current, max, profitPerHour, onClaim, onUpgradeClick }: { current: number, max: number, profitPerHour: number, onClaim: () => void, onUpgradeClick: () => void }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const isFull = current >= max;
    return (
        <section className={`bg-slate-800/60 p-4 rounded-2xl border ${isFull ? 'border-red-500/50' : 'border-slate-700'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 font-medium">Storage Lv. {Math.round(Math.log(max / 1000) / Math.log(1.5)) + 1}</span>
                <div className="flex items-center gap-2 text-green-400"><StarIcon size={16} /><span className="font-bold text-sm">{formatNumber(profitPerHour)}/h</span></div>
            </div>
            <div className={`relative w-full bg-slate-900/50 rounded-full h-6 p-1 mb-3 shadow-inner ${isFull ? 'animate-pulse' : ''}`}>
                <div className={`h-full rounded-full bg-gradient-to-r ${isFull ? 'from-red-500 to-orange-600' : 'from-amber-400 to-orange-500'} transition-all duration-1000 ease-linear`} style={{ width: `${percentage}%` }} />
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white drop-shadow-md">{formatNumber(current)} / {formatNumber(max)}</span></div>
            </div>
            <div className="flex items-center gap-3 mt-3">
                <button onClick={onUpgradeClick} className="flex-1 bg-transparent border-2 border-indigo-500 text-indigo-300 font-bold py-2 rounded-lg text-base transition-all duration-200 hover:bg-indigo-500/20 hover:text-white">Upgrade</button>
                <button onClick={onClaim} disabled={current === 0} className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold py-2 rounded-lg text-base transition-all duration-300 hover:scale-105 active:scale-100 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-cyan-500/30">Claim</button>
            </div>
        </section>
    );
};

const StorageUpgradeModal = ({ isOpen, onClose, onUpgrade, currentMax, nextMax, upgradeCost, userCoins, isProcessing }: { isOpen: boolean, onClose: () => void, onUpgrade: () => void, currentMax: number, nextMax: number, upgradeCost: number, userCoins: number, isProcessing: boolean }) => {
    if (!isOpen) return null;
    const canAfford = userCoins >= upgradeCost;
    const currentLevel = Math.round(Math.log(currentMax / 1000) / Math.log(1.5)) + 1;
    const nextLevel = currentLevel + 1;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-xl border-2 border-indigo-600 shadow-2xl w-full max-w-sm z-50 flex flex-col">
                <div className="flex-shrink-0 border-b border-indigo-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-indigo-300">Upgrade Storage</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"><XIcon className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="flex-grow my-4 space-y-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3 border border-slate-700/50">
                        <span className="font-semibold text-slate-300 text-sm">Capacity</span>
                        <div className="flex flex-1 items-center justify-end gap-2 font-mono text-sm">
                            <span className="text-slate-400">{formatNumber(currentMax)}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                            <span className="font-bold text-green-400">{formatNumber(nextMax)}</span>
                            <span className="text-green-500 text-xs font-sans">(+{formatNumber(nextMax - currentMax)})</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 font-bold text-sm">
                            <span className="text-slate-300">Lv. {currentLevel}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            <span className="text-green-400">Lv. {nextLevel}</span>
                        </div>
                        <button
                            onClick={onUpgrade}
                            disabled={!canAfford || isProcessing}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform 
                            ${!canAfford || isProcessing 
                                ? 'bg-slate-700 border border-slate-600 text-slate-500 cursor-not-allowed' 
                                : 'bg-slate-800 border border-slate-600 text-yellow-300 hover:scale-105 hover:shadow-md hover:shadow-yellow-500/10 active:scale-100'}`}
                        >
                            <span>{formatNumber(upgradeCost)}</span>
                            <CoinIcon size={16} />
                        </button>
                    </div>
                    {!canAfford && !isProcessing && <p className="text-right text-xs text-red-400 mt-2">Không đủ vàng</p>}
                </div>
            </div>
        </div>
    );
};


// --- THÀNH PHẦN CHÍNH CỦA GAME ---

interface BaseBuildingScreenProps { onClose: () => void; coins: number; gems: number; onUpdateCoins: (amount: number) => Promise<void>; }

const BaseBuildingScreen: React.FC<BaseBuildingScreenProps> = ({ onClose, coins, gems, onUpdateCoins }) => {
    const [offlineEarnings, setOfflineEarnings] = useState(0);
    const [maxStorage, setMaxStorage] = useState(1000);
    const [storageUpgradeCost, setStorageUpgradeCost] = useState(500);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStorageUpgradeModalOpen, setIsStorageUpgradeModalOpen] = useState(false);

    const [hamsters, setHamsters] = useState([
        { id: 1, name: 'Michelangelo', level: 1, maxLevel: 25, earnings: 10, upgradeCost: 50, unlocked: true, progress: 0, progressToLevelUp: 10 },
        { id: 2, name: 'Beethoven', level: 1, maxLevel: 25, earnings: 50, upgradeCost: 300, unlocked: true, progress: 5, progressToLevelUp: 15 },
        { id: 3, name: 'Shakespeare', level: 0, maxLevel: 25, earnings: 250, unlockCost: 1200, unlocked: false, progress: 0, progressToLevelUp: 20 },
        { id: 4, name: 'Leonardo', level: 0, maxLevel: 25, earnings: 1000, unlockCost: 5000, unlocked: false, progress: 0, progressToLevelUp: 25 },
    ]);

    const totalProfitPerHour = useMemo(() => hamsters.reduce((total, hamster) => hamster.unlocked ? total + hamster.earnings : total, 0), [hamsters]);

    useEffect(() => {
        const gameTick = setInterval(() => {
            setOfflineEarnings(prev => {
                if (prev < maxStorage) {
                    const profitPerSecond = totalProfitPerHour / 3600;
                    return Math.min(prev + profitPerSecond, maxStorage);
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(gameTick);
    }, [totalProfitPerHour, maxStorage]);

    const handleUpdateAndSync = async (cost: number, localUpdateFn: () => void) => {
        if (coins < cost) { alert("Không đủ vàng!"); return; }
        setIsProcessing(true);
        try {
            await onUpdateCoins(-cost);
            localUpdateFn();
        } catch (error) { console.error("Lỗi cập nhật dữ liệu:", error); alert("Có lỗi xảy ra, vui lòng thử lại."); }
        finally { setIsProcessing(false); }
    };
    
    const upgradeHamster = (id: number) => {
        const hamster = hamsters.find(h => h.id === id);
        if (!hamster || !hamster.unlocked || hamster.level >= hamster.maxLevel) return;
        
        handleUpdateAndSync(hamster.upgradeCost, () => {
            setHamsters(prev => prev.map(h => {
                if (h.id !== id) return h;

                const newProgress = h.progress + 1;
                let newEarnings = Math.floor(h.earnings * 1.05) + h.level;
                let newUpgradeCost = Math.floor(h.upgradeCost * 1.08);
                
                if (newProgress >= h.progressToLevelUp) {
                    return {
                        ...h,
                        level: h.level + 1,
                        progress: 0, 
                        progressToLevelUp: Math.floor(h.progressToLevelUp * 1.5),
                        earnings: newEarnings + (h.level * 50), 
                        upgradeCost: Math.floor(newUpgradeCost * 1.2),
                    };
                } else {
                    return {
                        ...h,
                        progress: newProgress,
                        earnings: newEarnings,
                        upgradeCost: newUpgradeCost,
                    };
                }
            }));
        });
    };

    const unlockHamster = (id: number) => {
        const hamster = hamsters.find(h => h.id === id);
        if (!hamster || hamster.unlocked) return;
        handleUpdateAndSync(hamster.unlockCost, () => {
            setHamsters(prev => prev.map(h => h.id === id ? { ...h, unlocked: true, level: 1 } : h));
        });
    };

    const claimOfflineEarnings = useCallback(async () => {
        const earningsToClaim = Math.floor(offlineEarnings);
        if (earningsToClaim > 0) {
            try { await onUpdateCoins(earningsToClaim); setOfflineEarnings(offlineEarnings - earningsToClaim); }
            catch (error) { console.error("Lỗi thu hoạch vàng:", error); }
        }
    }, [offlineEarnings, onUpdateCoins]);

    const upgradeMaxStorage = () => {
        handleUpdateAndSync(storageUpgradeCost, () => {
            setMaxStorage(s => Math.floor(s * 1.5));
            setStorageUpgradeCost(cost => Math.floor(cost * 1.8));
            setIsStorageUpgradeModalOpen(false);
        });
    };

    return (
        <div className="absolute inset-0 bg-slate-900 text-white font-sans overflow-y-auto">
            <GameHeader coins={coins} gems={gems} onClose={onClose} />
            <StorageUpgradeModal
                isOpen={isStorageUpgradeModalOpen}
                onClose={() => setIsStorageUpgradeModalOpen(false)}
                onUpgrade={upgradeMaxStorage}
                currentMax={maxStorage}
                nextMax={Math.floor(maxStorage * 1.5)}
                upgradeCost={storageUpgradeCost}
                userCoins={coins}
                isProcessing={isProcessing}
            />
            <div className="container mx-auto max-w-lg p-4 pt-20 pb-10">
                <IncomeStorageBar
                    current={offlineEarnings}
                    max={maxStorage}
                    profitPerHour={totalProfitPerHour}
                    onClaim={claimOfflineEarnings}
                    onUpgradeClick={() => setIsStorageUpgradeModalOpen(true)}
                />
                <section className="mt-8">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-slate-400 font-medium">Stage 1</div>
                        <button className="flex items-center text-xs font-semibold text-indigo-400 border border-indigo-500/50 rounded-md px-3 py-1 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors">
                            <span>View Stage</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {hamsters.map(hamster =>
                            hamster.unlocked ? (
                                <UnlockedHamsterCard key={hamster.id} hamster={hamster} onUpgrade={upgradeHamster} userCoins={coins} />
                            ) : (
                                <LockedHamsterCard key={hamster.id} hamster={hamster} onUnlock={unlockHamster} userCoins={coins} />
                            )
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BaseBuildingScreen;
