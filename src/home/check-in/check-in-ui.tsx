// Filename: check-in-ui.tsx

import React, { memo, useMemo } from 'react';
import { CheckInProvider, useCheckIn, dailyRewards } from './check-in-context.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import HomeButton from '../../ui/home-button.tsx'; 

// --- PROPS ---
interface DailyCheckInProps {
  onClose: () => void;
}

// 1. CoinWrapper: Tách ra để Coin nhảy số không render lại cả trang
const CoinWrapper = memo(() => {
    const { coins } = useCheckIn();
    const animatedCoins = useAnimateValue(coins, 500);
    return <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />;
});

// 2. CountdownDisplay: Chỉ text này re-render mỗi giây
const CountdownDisplay = () => {
    const { countdown } = useCheckIn();
    return (
        <span className="text-[11px] font-mono font-semibold text-slate-400">
            {countdown}
        </span>
    );
};

// 3. StreakWidget: Widget hình tròn nước (Tách ra để tránh render lại khi scroll)
const StreakWidget = memo(({ loginStreak, streakGoal }: { loginStreak: number, streakGoal: number }) => {
    // Tính toán style transform
    const fillStyle = useMemo(() => ({
        transform: `translateY(${(1 - (loginStreak / (streakGoal || 7))) * 100}%)`, 
        transition: 'transform 1s ease-out'
    }), [loginStreak, streakGoal]);

    return (
        <div className="flex justify-center mt-2 mb-6">
            <div className="bg-slate-900/95 rounded-xl px-4 py-4 w-full max-w-sm flex items-center gap-4 border border-slate-700 shadow-lg relative">
                <div className="flex-shrink-0">
                    <div className="relative w-16 h-16">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-20 blur-md"></div>
                        <div className="w-16 h-16 relative overflow-hidden rounded-full border-2 border-slate-700 bg-slate-900 transform-gpu">
                            <div 
                                className="water-fill absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-cyan-400 to-blue-600 opacity-80" 
                                style={fillStyle}
                            >
                                <div className="water-wave1"></div>
                                <div className="water-wave2"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <span className="text-2xl font-bold text-white drop-shadow-lg">{loginStreak}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-600">
                            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/streak-icon.webp" alt="Streak Icon" className="w-5 h-5 mr-2" />
                            {loginStreak} Day Streak
                        </span>
                        {/* Countdown nằm ở đây, nó tự quản lý render của nó */}
                        <CountdownDisplay />
                    </div>
                </div>
            </div>
        </div>
    );
});

// 4. MiniCalendar: Tách lịch nhỏ ra
const MiniCalendar = memo(({ dailyRewards, canClaimToday, claimableDay, loginStreak }: any) => {
    return (
        <div className="mb-6 flex justify-between px-1">
            {dailyRewards.map((reward: any) => {
                let isClaimed;
                if (canClaimToday) {
                    isClaimed = reward.day < claimableDay;
                } else {
                    const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
                    isClaimed = reward.day <= completedDaysInCycle;
                }
                
                const isClaimable = canClaimToday && reward.day === claimableDay;
                
                // Tối ưu class string
                let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 relative ";
                if (isClaimed) dayClasses += "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";
                else if (isClaimable) dayClasses += "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg";
                else dayClasses += "bg-slate-700 text-slate-400";

                return (
                    <div key={reward.day} className="relative group">
                        <div className={dayClasses}>
                            <span className="font-lilita z-10">{reward.day}</span>
                            {isClaimable && (
                                <>
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-indigo-400"></div>
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 opacity-30 blur-sm"></div>
                                </>
                            )}
                            {isClaimed && (
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

// 5. NextGoalCard: Thẻ mục tiêu tiếp theo
const NextGoalCard = memo(({ nextStreakGoal, loginStreak }: any) => {
    if (!nextStreakGoal) return null;
    
    const progressWidth = useMemo(() => 
        ({ width: `${Math.min((loginStreak / nextStreakGoal.streakGoal) * 100, 100)}%` }), 
    [loginStreak, nextStreakGoal.streakGoal]);

    return (
        <div className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-lg p-4 mb-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg p-1">
                    <div className="w-full h-full rounded-lg flex items-center justify-center bg-slate-800/80">
                        <div className="w-10 h-10">{nextStreakGoal.icon}</div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="w-full h-3.5 bg-slate-900/50 rounded-full overflow-hidden shadow-inner p-0.5">
                            <div 
                                className="relative h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500 ease-out" 
                                style={progressWidth}
                            >
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-700 rounded-md px-2 py-0.5 flex items-baseline">
                            <span className="text-base font-bold text-white">{loginStreak}</span>
                            <span className="text-xs text-slate-400 font-mono">/{nextStreakGoal.streakGoal}</span>
                        </div>
                    </div>
                    <p className="text-indigo-300 text-lg font-bold font-lilita">x{nextStreakGoal.amount}</p>
                </div>
            </div>
        </div>
    );
});

// 6. RewardItem: Giữ nguyên logic cũ nhưng tối ưu render
const RewardItem = memo(({ 
    reward, canClaimToday, claimableDay, loginStreak, isClaiming, isSyncingData, onClaim 
}: any) => {
    let isClaimed;
    if (canClaimToday) {
        isClaimed = reward.day < claimableDay;
    } else {
        const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
        isClaimed = reward.day <= completedDaysInCycle;
    }
    const isClaimable = canClaimToday && reward.day === claimableDay;

    // Tối ưu hóa: Chỉ render hiệu ứng pulse nếu là item nhận được hôm nay
    const pulseEffect = isClaimable ? (
        <div className="absolute inset-0 rounded-xl animate-pulse-slow pointer-events-none" style={{ background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.2), transparent)`, backgroundSize: '200% 200%'}}></div>
    ) : null;

    return (
        <div className={`group relative rounded-xl overflow-hidden transition-transform duration-300 ${isClaimed ? 'opacity-60' : 'hover:scale-[1.01]'} transform-gpu`}>
            {pulseEffect}
            <div className={`relative flex items-center gap-4 p-4 rounded-xl border ${ isClaimable ? 'bg-slate-800 border-purple-500/50' : 'bg-slate-800 border-transparent'}`}>
            <div className="absolute top-0 left-0 p-1 px-2 text-xs bg-slate-700 rounded-br-lg uppercase font-lilita text-slate-300">Day {reward.day}</div>
            
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${ isClaimable ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'} shadow-lg p-1`}>
                <div className={`w-full h-full rounded-lg flex items-center justify-center ${ isClaimable ? 'bg-slate-800/80' : 'bg-slate-800'}`}>
                    <div className="w-10 h-10">{reward.icon}</div>
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-md border mb-1.5 shadow-sm ${
                    isClaimable 
                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100' 
                    : 'bg-slate-900/60 border-white/5 text-slate-400'
                }`}>
                    <span className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[120px]">
                        {reward.name}
                    </span>
                </div>
                
                <p className={`text-base font-lilita leading-none ml-1 ${isClaimable ? 'text-white' : 'text-slate-300'}`}>
                    x{reward.amount}
                </p>
            </div>

            <button 
                onClick={() => onClaim(reward.day)} 
                disabled={!isClaimable || isClaiming || isSyncingData} 
                className={`min-w-[90px] h-10 flex-shrink-0 flex items-center justify-center py-2 px-3 rounded-lg font-lilita tracking-wide text-sm transition-all uppercase ${ 
                isClaimed ? 'bg-green-600 text-white' : 
                isClaimable ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg active:scale-95' : 
                'bg-slate-700 text-slate-400'
                }`}
            >
                { isClaimed ? 'Received' : 
                isClaiming && isClaimable ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Claim' 
                }
            </button>
            
            {isClaimed && (
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
                    <div className="bg-green-600 rounded-full p-2 transform rotate-12 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
});

// --- COMPONENT GIAO DIỆN CHÍNH (VIEW) ---
const DailyCheckInView = () => {
  // Lưu ý: Việc useCheckIn() ở đây sẽ làm DailyCheckInView re-render mỗi khi Context thay đổi (ví dụ countdown)
  // Tuy nhiên, do các component con (StreakWidget, RewardItem...) đã được MEMO, 
  // nên React sẽ không vẽ lại DOM của con trừ khi props của con thay đổi.
  const {
    loginStreak, isSyncingData, canClaimToday, claimableDay, 
    isClaiming, showRewardAnimation, animatingReward, particles, 
    nextStreakGoal, 
    claimReward, handleClose,
  } = useCheckIn();

  return (
    <div className="bg-black/95 shadow-2xl overflow-hidden relative flex flex-col h-screen">
      {/* 
        OPTIMIZATION:
        1. Bỏ backdrop-blur-sm ở header. Thay bằng bg-slate-900 (màu đặc) hoặc opacity cao.
           Backdrop-blur tính toán rất nặng khi scroll.
        2. z-index cao để đè lên nội dung scroll
      */}
      <header className="flex-shrink-0 w-full box-border flex items-center justify-between bg-slate-900 border-b border-white/10 z-20 pt-2 pb-2 px-4 shadow-md">
        <HomeButton onClick={handleClose} />
        <div className="flex items-center gap-3">
          <CoinWrapper />
        </div>
      </header>
      
      {/* 
        OPTIMIZATION:
        1. will-change-scroll: Gợi ý cho trình duyệt tối ưu layer cuộn.
        2. overscroll-none: Ngăn chặn hiệu ứng kéo dãn lò xo (trên iOS) gây nặng.
      */}
      <div className="flex-1 overflow-y-auto hide-scrollbar overscroll-none" style={{ willChange: 'scroll-position' }}>
        <div className="px-4 pt-4 pb-24">
            
          {/* Component đã Memo */}
          <StreakWidget loginStreak={loginStreak} streakGoal={nextStreakGoal?.streakGoal} />
          
          {/* Component đã Memo */}
          <MiniCalendar 
             dailyRewards={dailyRewards}
             canClaimToday={canClaimToday}
             claimableDay={claimableDay}
             loginStreak={loginStreak}
          />
        
          <div className="pb-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Component đã Memo */}
              <NextGoalCard nextStreakGoal={nextStreakGoal} loginStreak={loginStreak} />

              {/* Danh sách phần thưởng */}
              {dailyRewards.map(reward => (
                  <RewardItem 
                    key={reward.day}
                    reward={reward}
                    canClaimToday={canClaimToday}
                    claimableDay={claimableDay}
                    loginStreak={loginStreak}
                    isClaiming={isClaiming}
                    isSyncingData={isSyncingData}
                    onClaim={claimReward}
                  />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REWARD ANIMATION MODAL */}
      {showRewardAnimation && animatingReward && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50">
          <div className="relative max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl animate-float">
             {/* Nội dung modal giữ nguyên, chỉ tối ưu CSS nếu cần */}
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
              {animatingReward.streak && (
                  <div className="border-t border-slate-700 pt-4 mt-4">
                      <div className="text-green-400 text-sm font-bold mb-1">Thưởng Chuỗi Đăng Nhập!</div>
                      <div className="text-white text-lg font-bold mb-1 font-lilita tracking-wide uppercase">{animatingReward.streak?.name}</div>
                      <div className="text-green-200 text-2xl font-bold font-lilita">+{animatingReward.streak?.amount}</div>
                  </div>
              )}
              <div className="mt-6 text-sm text-slate-400">Phần thưởng đã được thêm vào kho đồ</div>
            </div>
          </div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (<div key={particle.id} className={particle.className} style={particle.style} />))}
          </div>
        </div>
      )}

      {/* --- CSS --- */}
      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        
        /* Giảm bớt độ phức tạp của animation */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        /* Chỉ giữ lại animation cần thiết cho wave */
        @keyframes wave { 0% { transform: translateX(-100%) translateY(5px); } 100% { transform: translateX(100%) translateY(-5px); } }
        .water-wave1, .water-wave2 { 
            position: absolute; top: -15px; left: 0; width: 200%; height: 20px; 
            background: rgba(255, 255, 255, 0.3); border-radius: 50%; 
            animation: wave 3s infinite linear; 
            will-change: transform; /* Hint cho trình duyệt */
        }
        .water-wave2 { top: -5px; animation-delay: 1s; opacity: 0.6; }

        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .animate-float { animation: float 3s ease-in-out infinite; }

        /* Particle animations... (Giữ nguyên hoặc xóa nếu không cần thiết quá nhiều) */
        @keyframes float-particle-1 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-100px, -100px) scale(0); opacity: 0; } }
        .animate-float-particle-1 { animation: float-particle-1 2s ease-out forwards; }
        /* ... các particle khác tương tự */
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
