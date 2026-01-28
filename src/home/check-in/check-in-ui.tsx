// --- START OF FILE check-in-ui.tsx ---

import React, { memo, useState, useEffect } from 'react';
import { CheckInProvider, useCheckIn, dailyRewardsUI, getCheckInMultiplier } from './check-in-context.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx'; 
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import HomeButton from '../../ui/home-button.tsx'; 
import EnergyDisplay from '../../ui/display/energy-display.tsx'; // Import EnergyDisplay

// Import Ads Reward Component
import { AdsRewardUI, FormattedRewardItem } from '../../ui/ads-reward-ui.tsx';

// --- PROPS ---
interface DailyCheckInProps {
  onClose: () => void;
}

// --- HELPER: FORMAT SỐ ---
const formatCompactNumber = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return amount.toString();
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

// --- HELPER: ADS COOLDOWN HOOK (Dùng chung logic với Lucky Game) ---
const useAdsCooldown = (adsData: any) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            if (!adsData.nextAvailableAt) {
                setTimeRemaining(0);
                setIsAvailable(true);
                return;
            }
            const now = new Date().getTime();
            let availableAt = 0;
            if (adsData.nextAvailableAt && typeof adsData.nextAvailableAt.toDate === 'function') {
                availableAt = adsData.nextAvailableAt.toDate().getTime();
            } else {
                availableAt = new Date(adsData.nextAvailableAt).getTime();
            }
            const diff = Math.ceil((availableAt - now) / 1000);
            if (diff > 0) {
                setTimeRemaining(diff);
                setIsAvailable(false);
            } else {
                setTimeRemaining(0);
                setIsAvailable(true);
            }
        };
        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [adsData.nextAvailableAt]);

    return { timeRemaining, isAvailable };
};

// --- COMPONENT: CHECK IN ADS POPUP WRAPPER ---
// Component này kết nối dữ liệu từ Context vào UI AdsRewardUI
const CheckInAdsPopup = () => {
    const { 
        pendingReward, showAdsPopup, adsData, 
        finalizeClaim, handleRegisterAdWatch, masteryCards 
    } = useCheckIn();

    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const { timeRemaining, isAvailable } = useAdsCooldown(adsData);

    if (!showAdsPopup || !pendingReward) return null;

    // Tính toán hiển thị phần thưởng trong Popup
    // Cần áp dụng Mastery Multiplier vào số lượng BASE để người dùng thấy đúng số họ sẽ nhận (x1)
    const masteryMultiplier = getCheckInMultiplier(masteryCards);
    
    const formattedRewards: FormattedRewardItem[] = pendingReward.items.map((item: any) => {
        let amount = parseFloat(item.amount);
        
        // Logic: Energy không nhân theo Mastery, các loại khác thì có
        if (item.type !== 'energy') {
            amount = amount * masteryMultiplier;
        }

        return {
            icon: item.icon, // Context cung cấp string URL
            label: item.name,
            amount: amount
        };
    });

    const handleClaimX1 = () => {
        finalizeClaim(false);
    };

    const handleClaimX2 = async () => {
        if (!isAvailable || adsData.watchedToday >= 30) return;
        
        setIsWatchingAd(true);
        // Gọi hàm xem quảng cáo từ GameContext
        const success = await handleRegisterAdWatch();
        setIsWatchingAd(false);
        
        if (success) {
            finalizeClaim(true);
        }
    };

    return (
        <AdsRewardUI 
            rewards={formattedRewards}
            adsStatus={{
                watchedToday: adsData.watchedToday,
                dailyLimit: 30,
                isAvailable: isAvailable,
                isWatching: isWatchingAd,
                timeRemaining: timeRemaining
            }}
            onClaimX1={handleClaimX1}
            onWatchAdX2={handleClaimX2}
        />
    );
};

// --- COMPONENT: CHECK-IN TIMER ---
const CheckInTimer = memo(() => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            // Offset giả lập giờ VN (UTC+7)
            const vnOffsetMs = 7 * 60 * 60 * 1000;
            const vnTime = new Date(now.getTime() + vnOffsetMs);
            const vnYear = vnTime.getUTCFullYear();
            const vnMonth = vnTime.getUTCMonth();
            const vnDay = vnTime.getUTCDate();
            
            // Tính thời điểm 00:00 ngày hôm sau theo giờ VN
            const nextReset = new Date(Date.UTC(vnYear, vnMonth, vnDay + 1, 0, 0, 0) - vnOffsetMs);
            const diff = nextReset.getTime() - now.getTime();
            
            if (diff <= 0) return "00:00:00";
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => { setTimeLeft(calculateTimeLeft()); }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    if (!timeLeft) return null;
    
    return (
        <div className="flex flex-col items-center w-full mb-4 mt-2">
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-600 px-5 py-2 rounded-full shadow-lg backdrop-blur-sm select-none animate-fadeIn">
                <div className="text-sm uppercase tracking-widest text-slate-400 font-lilita">Daily Reset</div>
                <div className="font-lilita text-xl text-purple-200 tabular-nums tracking-widest min-w-[90px] text-center">{timeLeft}</div>
            </div>
        </div>
    );
});

// 1. CoinWrapper
const CoinWrapper = memo(() => {
    const { coins } = useCheckIn();
    const animatedCoins = useAnimateValue(coins, 500);
    return <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />;
});

// 2. EnergyWrapper (NEW COMPONENT)
const EnergyWrapper = memo(() => {
    const { energy } = useCheckIn();
    // Giả định maxEnergy là 50 (hoặc lấy từ constant nếu có)
    return <EnergyDisplay currentEnergy={energy} maxEnergy={50} isStatsFullscreen={false} />;
});

// 3. MiniCalendar
const MiniCalendar = memo(({ dailyRewardsUI, canClaimToday, claimableDay, loginStreak }: any) => {
    const getStatus = (day: number) => {
        if (canClaimToday && day === claimableDay) return 'claimable';
        let isClaimed;
        if (canClaimToday) {
            isClaimed = day < claimableDay;
        } else {
            const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
            isClaimed = day <= completedDaysInCycle;
        }
        return isClaimed ? 'claimed' : 'locked';
    };

    return (
        <div className="mb-4 mt-4 flex justify-between px-1">
            {dailyRewardsUI.map((reward: any) => {
                const status = getStatus(reward.day);
                let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 relative ";
                if (status === 'claimed') dayClasses += "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";
                else if (status === 'claimable') dayClasses += "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg";
                else dayClasses += "bg-slate-700/85 text-slate-400";

                return (
                    <div key={reward.day} className="relative group">
                        <div className={dayClasses}>
                            <span className="font-lilita z-10">{reward.day}</span>
                            {status === 'claimable' && (
                                <>
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-indigo-400"></div>
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 opacity-30 blur-sm"></div>
                                </>
                            )}
                            {status === 'claimed' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg z-20">
                                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

// 4. RewardItem
const RewardItem = memo(({ 
    rewardData, canClaimToday, claimableDay, loginStreak, isClaiming, isSyncingData, onClaim, className, masteryCards 
}: any) => {
    const currentMultiplier = getCheckInMultiplier(masteryCards);

    let isClaimed;
    if (canClaimToday) {
        isClaimed = rewardData.day < claimableDay;
    } else {
        const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
        isClaimed = rewardData.day <= completedDaysInCycle;
    }
    const isClaimable = canClaimToday && rewardData.day === claimableDay;
    const isLocked = !isClaimed && !isClaimable;
    
    const handleClick = () => {
        // Updated: Gọi initiateClaim (được truyền qua prop onClaim) để mở Popup
        if (isClaimable && !isClaiming && !isSyncingData) {
            onClaim(rewardData.day);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={!isClaimable || isClaiming || isSyncingData} 
            className={`group relative rounded-xl overflow-hidden transition-all duration-300 transform-gpu 
                ${className} 
                ${isClaimable ? 'hover:scale-[1.02] active:scale-95 cursor-pointer ring-1 ring-purple-500/50' : 'cursor-default border-transparent'}
            `}
        >
            {isClaimable && (
                <div className="absolute inset-0 rounded-xl animate-pulse-slow pointer-events-none" style={{ background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.15), transparent)`, backgroundSize: '200% 200%'}}></div>
            )}
            
            <div className={`relative flex flex-col items-center w-full h-full rounded-xl border shadow-lg overflow-hidden
                ${isClaimable ? 'bg-slate-800/90 border-purple-500/30' : 'bg-slate-800/85 border-slate-700/30'}
            `}>
                
                {isLocked && <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none"></div>}
                {isClaimed && <div className="absolute inset-0 bg-black/70 z-20 pointer-events-none"></div>}

                <div className={`w-full text-center py-1.5 px-2 text-xs font-lilita uppercase tracking-wide border-b z-10
                    ${isClaimable ? 'bg-gradient-to-r from-slate-800 via-purple-900/30 to-slate-800 text-purple-200 border-purple-500/20' : 'bg-black/20 text-slate-400 border-white/5'}
                `}>
                    Day {rewardData.day}
                </div>
                
                <div className={`flex-1 flex items-center justify-center w-full py-2 gap-2 transition-opacity ${isClaimed ? 'opacity-50' : 'opacity-100'}`}> 
                    {rewardData.items.map((item: any, index: number) => {
                        let displayAmount = parseFloat(item.amount);
                        
                        // Tính toán hiển thị số lượng (Preview)
                        // Nếu chưa nhận, hiển thị số lượng ĐÃ nhân với Mastery (trừ Energy)
                        // Nếu đã nhận, server đã trả về số lượng thật, nhưng ở đây chúng ta chỉ hiển thị UI config nên vẫn phải tính lại.
                        if (!isClaimed && item.name !== "Energy") {
                            displayAmount = displayAmount * currentMultiplier;
                        }

                        return (
                            <div key={index} className="relative">
                                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 
                                    ${isClaimable ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-700 to-slate-900'} shadow-lg p-1`}
                                >
                                    <div className={`w-full h-full rounded-lg flex items-center justify-center ${isClaimable ? 'bg-slate-800/80' : 'bg-slate-800'}`}>
                                        {/* RENDER ICON TỪ URL STRING */}
                                        <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-0.5" />
                                    </div>
                                    <div className={`absolute -bottom-1.5 -right-1.5 px-1.5 h-[16px] flex items-center justify-center rounded-md ${isClaimable ? 'bg-slate-900/60' : 'bg-slate-950/60'} shadow-sm border border-white/5`}>
                                        <span className={`text-[10px] font-lilita leading-none pt-[2px] ${isClaimable ? 'text-white/90' : 'text-slate-400'}`}>
                                            x{formatCompactNumber(displayAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isClaimable && (
                    <div className="absolute top-2 right-2 z-30">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        </span>
                    </div>
                )}
                
                {isClaiming && isClaimable && (
                     <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-40 rounded-xl">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {isClaimed && (
                    <div className="absolute top-1.5 right-1.5 z-30">
                         <div className="bg-green-500 rounded-full p-0.5 shadow-lg border border-slate-900 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                )}
            </div>
        </button>
    );
});

// 5. CheckInMainContent
const CheckInMainContent = memo(({ 
    dailyRewardsUI, canClaimToday, claimableDay, loginStreak, isClaiming, isSyncingData, initiateClaim, masteryCards 
}: any) => {
    return (
        <div className="px-4 pt-2 pb-24">
            <MiniCalendar 
                dailyRewardsUI={dailyRewardsUI}
                canClaimToday={canClaimToday}
                claimableDay={claimableDay}
                loginStreak={loginStreak}
            />
            <CheckInTimer />
            <div className="pb-6">
                <div className="grid grid-cols-2 gap-3">
                    {dailyRewardsUI.map((reward: any) => (
                        <RewardItem 
                            key={reward.day}
                            rewardData={reward}
                            className={reward.day === 7 ? "col-span-2 h-[110px]" : "col-span-1 h-[110px]"}
                            canClaimToday={canClaimToday}
                            claimableDay={claimableDay}
                            loginStreak={loginStreak}
                            isClaiming={isClaiming}
                            isSyncingData={isSyncingData}
                            onClaim={initiateClaim} // Truyền hàm mở Popup vào đây
                            masteryCards={masteryCards}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

// --- COMPONENT GIAO DIỆN CHÍNH (VIEW) ---
const DailyCheckInView = () => {
  const {
    loginStreak, isSyncingData, canClaimToday, claimableDay, 
    isClaiming, initiateClaim, handleClose,
    masteryCards 
  } = useCheckIn();

  return (
    <div className="shadow-2xl overflow-hidden relative flex flex-col h-screen">
      
      <div className="absolute inset-0 z-0">
        <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-check-in.webp" 
            alt="Check In Background" 
            className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 z-0 bg-black/85"></div>

      <header className="relative z-10 flex-shrink-0 w-full box-border flex items-center justify-between bg-slate-900 border-b border-white/10 pt-2 pb-2 px-4 shadow-md">
        <HomeButton onClick={handleClose} />
        <div className="flex items-center gap-3">
          {/* HIỂN THỊ ENERGY */}
          <EnergyWrapper />
          
          <MasteryDisplay masteryCount={masteryCards} />
          <CoinWrapper />
        </div>
      </header>
      
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar overscroll-none" style={{ willChange: 'scroll-position' }}>
         <CheckInMainContent 
            dailyRewardsUI={dailyRewardsUI}
            canClaimToday={canClaimToday}
            claimableDay={claimableDay}
            loginStreak={loginStreak}
            isClaiming={isClaiming}
            isSyncingData={isSyncingData}
            initiateClaim={initiateClaim}
            masteryCards={masteryCards}
         />
      </div>

      {/* RENDER POPUP QUẢNG CÁO Ở ĐÂY */}
      <CheckInAdsPopup />

      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

const DailyCheckIn = ({ onClose }: DailyCheckInProps) => {
  return (
    <CheckInProvider onClose={onClose}>
      <DailyCheckInView />
    </CheckInProvider>
  );
};

export default DailyCheckIn;
