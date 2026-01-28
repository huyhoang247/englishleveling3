// --- START OF FILE check-in-ui.tsx ---

import React, { memo, useState, useEffect } from 'react';
import { CheckInProvider, useCheckIn, dailyRewardsUI } from './check-in-context.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx'; 
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import HomeButton from '../../ui/home-button.tsx'; 

// --- PROPS ---
interface DailyCheckInProps {
  onClose: () => void;
}

// --- HELPER: FORMAT SỐ (1K, 1M, 1B) ---
const formatCompactNumber = (amount: string | number): string => {
    const num = typeof amount === 'string' 
        ? parseFloat(amount.replace(/,/g, '')) 
        : amount;

    if (isNaN(num)) return amount.toString();

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

// --- COMPONENT: CHECK-IN TIMER ---
// Đếm ngược đến 00:00 Giờ Việt Nam (UTC+7)
const CheckInTimer = memo(() => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            
            // 1. Chuyển thời gian hiện tại sang giả lập giờ VN (Cộng thêm offset vào timestamp)
            const vnOffsetMs = 7 * 60 * 60 * 1000; // +7 giờ
            const vnTime = new Date(now.getTime() + vnOffsetMs);

            // 2. Lấy thông tin ngày hiện tại theo giờ VN
            const vnYear = vnTime.getUTCFullYear();
            const vnMonth = vnTime.getUTCMonth();
            const vnDay = vnTime.getUTCDate();

            // 3. Tạo mốc thời gian Reset tiếp theo: 00:00:00 ngày hôm sau (theo giờ VN)
            const nextReset = new Date(Date.UTC(vnYear, vnMonth, vnDay + 1, 0, 0, 0) - vnOffsetMs);

            const diff = nextReset.getTime() - now.getTime();

            // Nếu đã qua giờ (trường hợp hiếm gặp do lag), hiển thị 00:00:00
            if (diff <= 0) return "00:00:00";

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // Chạy ngay lần đầu
        setTimeLeft(calculateTimeLeft());
        
        // Cập nhật mỗi giây
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <div className="flex justify-center w-full mb-4 mt-2">
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-600 px-5 py-2 rounded-full shadow-lg backdrop-blur-sm select-none animate-fadeIn">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </div>
                <div className="text-sm uppercase tracking-widest text-slate-400 font-lilita">Daily Reset</div>
                <div className="font-lilita text-2xl text-purple-200 tabular-nums tracking-widest min-w-[100px] text-center">
                    {timeLeft}
                </div>
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

// 2. MiniCalendar
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

// 3. RewardItem: Hiển thị danh sách vật phẩm đồng nhất
const RewardItem = memo(({ 
    rewardData, canClaimToday, claimableDay, loginStreak, isClaiming, isSyncingData, onClaim, className 
}: any) => {
    let isClaimed;
    if (canClaimToday) {
        isClaimed = rewardData.day < claimableDay;
    } else {
        const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
        isClaimed = rewardData.day <= completedDaysInCycle;
    }
    const isClaimable = canClaimToday && rewardData.day === claimableDay;
    // Trạng thái Locked: Không phải đã nhận, cũng không phải đang chờ nhận hôm nay
    const isLocked = !isClaimed && !isClaimable;
    
    const handleClaim = () => {
        if (isClaimable && !isClaiming && !isSyncingData) {
            onClaim(rewardData.day);
        }
    };

    return (
        <button 
            onClick={handleClaim} 
            disabled={!isClaimable || isClaiming || isSyncingData} 
            className={`group relative rounded-xl overflow-hidden transition-all duration-300 transform-gpu 
                ${className} 
                ${isClaimable ? 'hover:scale-[1.02] active:scale-95 cursor-pointer ring-1 ring-purple-500/50' : 'cursor-default border-transparent'}
            `}
        >
            {/* Background Effect for Claimable */}
            {isClaimable && (
                <div className="absolute inset-0 rounded-xl animate-pulse-slow pointer-events-none" style={{ background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.15), transparent)`, backgroundSize: '200% 200%'}}></div>
            )}
            
            <div className={`relative flex flex-col items-center w-full h-full rounded-xl border shadow-lg overflow-hidden
                ${isClaimable ? 'bg-slate-800/90 border-purple-500/30' : 'bg-slate-800/85 border-slate-700/30'}
            `}>
                
                {/* --- LỚP PHỦ NỀN ĐEN --- */}
                
                {/* 1. Lớp phủ cho ngày chưa check-in (Locked - Tương lai) */}
                {/* Đã chỉnh: bg-black/40 (Rõ hơn) */}
                {isLocked && (
                    <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none"></div>
                )}

                {/* 2. Lớp phủ cho ngày ĐÃ check-in (Claimed - Quá khứ) */}
                {/* Đã chỉnh: bg-black/70 (Đậm hơn) */}
                {isClaimed && (
                    <div className="absolute inset-0 bg-black/70 z-20 pointer-events-none"></div>
                )}

                {/* --- HEADER NGÀY --- */}
                <div className={`w-full text-center py-1.5 text-xs font-lilita uppercase tracking-wide border-b z-10
                    ${isClaimable ? 'bg-gradient-to-r from-slate-800 via-purple-900/30 to-slate-800 text-purple-200 border-purple-500/20' : 'bg-black/20 text-slate-400 border-white/5'}
                `}>
                    Day {rewardData.day}
                </div>
                
                {/* --- NỘI DUNG CHÍNH (Loop qua items) --- */}
                <div className={`flex-1 flex items-center justify-center w-full py-2 gap-2 transition-opacity ${isClaimed ? 'opacity-50' : 'opacity-100'}`}> 
                    
                    {rewardData.items.map((item: any, index: number) => (
                        <div key={index} className="relative">
                            {/* 
                                KHỐI CHỨA ICON (Container)
                                Thiết kế giống hệt nhau cho tất cả items (Main & Energy)
                                - isClaimable: Tím/Than gradient (Giống Main)
                                - Default: Xám/Đen gradient
                            */}
                            <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 
                                ${isClaimable 
                                    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900' 
                                    : 'bg-gradient-to-br from-slate-700 to-slate-900'
                                } shadow-lg p-1`}
                            >
                                {/* Wrapper Icon */}
                                <div className={`w-full h-full rounded-lg flex items-center justify-center 
                                    ${isClaimable ? 'bg-slate-800/80' : 'bg-slate-800'}`}
                                >
                                    <div className="w-7 h-7">{item.icon}</div>
                                </div>

                                {/* Badge Số Lượng: Luôn dùng x5 */}
                                <div className={`absolute -bottom-1.5 -right-1.5 px-1.5 h-[16px] flex items-center justify-center rounded-md 
                                    ${isClaimable ? 'bg-slate-900/60' : 'bg-slate-950/60'} shadow-sm`}
                                >
                                    <span className={`text-[10px] font-lilita leading-none pt-[2px] 
                                        ${isClaimable ? 'text-white/90' : 'text-slate-400'}`}
                                    >
                                        x{formatCompactNumber(item.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

                {/* --- INDICATOR: CHẤM XANH NHÁY (Khi có thể claim) --- */}
                {isClaimable && (
                    <div className="absolute top-2 right-2 z-30">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        </span>
                    </div>
                )}
                
                {/* --- LOADING SPINNER --- */}
                {isClaiming && isClaimable && (
                     <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-40 rounded-xl">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {/* --- CLAIMED ICON: GÓC PHẢI TRÊN (Nằm trên lớp phủ đen z-30) --- */}
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

// 4. CheckInMainContent
const CheckInMainContent = memo(({ 
    dailyRewardsUI, canClaimToday, claimableDay, loginStreak, isClaiming, isSyncingData, onClaim 
}: any) => {
    return (
        <div className="px-4 pt-2 pb-24">
            
            {/* --- 1. MINICALENDAR (DÃY SỐ NGÀY 1,2,3...) --- */}
            <MiniCalendar 
                dailyRewardsUI={dailyRewardsUI}
                canClaimToday={canClaimToday}
                claimableDay={claimableDay}
                loginStreak={loginStreak}
            />

            {/* --- 2. TIMER ĐẾM NGƯỢC --- */}
            <CheckInTimer />

            {/* --- 3. LƯỚI DANH SÁCH QUÀ --- */}
            <div className="pb-6">
                <div className="grid grid-cols-2 gap-3">
                    {dailyRewardsUI.map((reward: any) => (
                        <RewardItem 
                            key={reward.day}
                            rewardData={reward}
                            /* Ngày 7 -> col-span-2 (Full width), Chiều cao 110px bằng các ngày khác */
                            className={reward.day === 7 ? "col-span-2 h-[110px]" : "col-span-1 h-[110px]"}
                            canClaimToday={canClaimToday}
                            claimableDay={claimableDay}
                            loginStreak={loginStreak}
                            isClaiming={isClaiming}
                            isSyncingData={isSyncingData}
                            onClaim={onClaim}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

// 5. RewardAnimationOverlay
const RewardAnimationOverlay = memo(({ showRewardAnimation, animatingReward, particles }: any) => {
    if (!showRewardAnimation || !animatingReward) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50">
            <div className="relative max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl animate-float">
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/50">
                        <div className="w-full h-full rounded-full bg-slate-900/60 flex items-center justify-center">
                            <div className="w-12 h-12 animate-pulse">{animatingReward.daily?.icon}</div>
                        </div>
                    </div>
                </div>
                <div className="mt-14 text-center">
                    <div className="text-indigo-400 text-lg font-bold mb-1">Nhận Thưởng Thành Công!</div>
                    <div className="text-white text-xl font-bold mb-1 font-lilita tracking-wide uppercase">{animatingReward.daily?.name}</div>
                    <div className="text-indigo-200 text-3xl font-bold mb-4 font-lilita">x{animatingReward.daily?.amount}</div>
                    
                    <div className="text-sm text-yellow-400 mt-1 font-bold animate-pulse">
                        +5 Energy
                    </div>
                    
                    <div className="mt-4 text-sm text-slate-400">Phần thưởng đã được thêm vào kho đồ</div>
                </div>
            </div>
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle: any) => (<div key={particle.id} className={particle.className} style={particle.style} />))}
            </div>
        </div>
    );
});

// --- COMPONENT GIAO DIỆN CHÍNH (VIEW) ---
const DailyCheckInView = () => {
  const {
    loginStreak, isSyncingData, canClaimToday, claimableDay, 
    isClaiming, showRewardAnimation, animatingReward, particles, 
    claimReward, handleClose,
    masteryCards 
  } = useCheckIn();

  return (
    <div className="shadow-2xl overflow-hidden relative flex flex-col h-screen">
      
      {/* 1. LỚP NỀN HÌNH ẢNH */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-check-in.webp" 
            alt="Check In Background" 
            className="w-full h-full object-cover"
        />
      </div>

      {/* 2. LỚP PHỦ MÀU ĐEN OPACITY 85% */}
      <div className="absolute inset-0 z-0 bg-black/85"></div>

      {/* 3. NỘI DUNG CHÍNH */}
      <header className="relative z-10 flex-shrink-0 w-full box-border flex items-center justify-between bg-slate-900 border-b border-white/10 pt-2 pb-2 px-4 shadow-md">
        <HomeButton onClick={handleClose} />
        <div className="flex items-center gap-3">
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
            onClaim={claimReward}
         />
      </div>

      <RewardAnimationOverlay 
         showRewardAnimation={showRewardAnimation}
         animatingReward={animatingReward}
         particles={particles}
      />

      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .animate-float { animation: float 3s ease-in-out infinite; }

        @keyframes float-particle-1 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-100px, -100px) scale(0); opacity: 0; } }
        .animate-float-particle-1 { animation: float-particle-1 2s ease-out forwards; }
        .animate-float-particle-2 { animation: float-particle-1 2.5s ease-out forwards; }
        .animate-float-particle-3 { animation: float-particle-1 3s ease-out forwards; }
        .animate-float-particle-4 { animation: float-particle-1 1.5s ease-out forwards; }
        .animate-float-particle-5 { animation: float-particle-1 2.2s ease-out forwards; }
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
