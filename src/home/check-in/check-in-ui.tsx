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

// ============================================================================
// CÁC COMPONENT CON ĐƯỢC TỐI ƯU (MEMOIZED)
// ============================================================================

// 1. CoinWrapper: Tách ra để animation nhảy số coin không ảnh hưởng trang chính
const CoinWrapper = memo(() => {
    const { coins } = useCheckIn();
    const animatedCoins = useAnimateValue(coins, 500);
    return <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />;
});

// 2. CountdownDisplay: Tách ra để việc đếm ngược mỗi giây chỉ render component nhỏ xíu này
const CountdownDisplay = memo(() => {
    const { countdown } = useCheckIn();
    return (
        <span className="text-[11px] font-mono font-semibold text-slate-400">
            {countdown}
        </span>
    );
});

// 3. MiniCalendar: Lịch 7 ngày nhỏ
const MiniCalendar = memo(({ dailyRewards, canClaimToday, claimableDay, loginStreak }: any) => {
    return (
        <div className="flex justify-between">
            {dailyRewards.map((reward: any) => {
                let isClaimed;
                if (canClaimToday) {
                    isClaimed = reward.day < claimableDay;
                } else {
                    const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
                    isClaimed = reward.day <= completedDaysInCycle;
                }
                
                const isClaimable = canClaimToday && reward.day === claimableDay;
                
                // Tối ưu CSS: Bỏ gradient phức tạp cho các state không active
                let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 relative";
                if (isClaimed) dayClasses += " bg-green-600 text-white shadow-sm"; 
                else if (isClaimable) dayClasses += " bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-md";
                else dayClasses += " bg-slate-700 text-slate-400";

                return (
                  <div key={reward.day} className="relative group">
                    <div className={dayClasses}>
                      <span className="font-lilita z-10">{reward.day}</span>
                      {isClaimable && (
                        <>
                          <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-indigo-400"></div>
                        </>
                      )}
                      {isClaimed && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-sm z-20">
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

// 4. StreakHeader: Phần hiển thị nước chảy và số ngày
const StreakHeader = memo(({ loginStreak, nextStreakGoal }: any) => {
    // Tính toán style transform và memoize nó để tránh tạo object mới liên tục
    const waterStyle = useMemo(() => ({ 
        transform: `translateY(${(1 - (loginStreak / (nextStreakGoal?.streakGoal || 7))) * 100}%)`, 
        transition: 'transform 1s ease-out' 
    }), [loginStreak, nextStreakGoal]);

    return (
        <div className="flex justify-center mt-2 mb-6">
            <div className="bg-slate-900/80 rounded-xl px-4 py-4 w-full max-w-sm flex items-center gap-4 border border-slate-700 shadow-lg relative">
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16">
                  {/* Giảm blur opacity */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-20 blur-sm"></div>
                  <div className="w-16 h-16 relative overflow-hidden rounded-full border-2 border-slate-700">
                    <div className="absolute inset-0 bg-slate-900"></div>
                    <div 
                      className="water-fill absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-cyan-400 to-blue-600 opacity-80" 
                      style={waterStyle}
                    >
                      <div className="water-wave1"></div>
                      <div className="water-wave2"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="text-2xl font-bold text-white drop-shadow-md">{loginStreak}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex flex-col items-start gap-1.5">
                      <span className="inline-flex items-center bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-600">
                          {/* Nếu có icon ảnh thì dùng, ở đây tạm dùng text hoặc svg đơn giản */}
                          <span className="mr-2">🔥</span> 
                          {loginStreak} Day Streak
                      </span>
                      <CountdownDisplay />
                  </div>
              </div>
            </div>
        </div>
    );
});

// 5. RewardItem: Item phần thưởng đơn lẻ
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

    return (
        <div className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${isClaimed ? 'opacity-60' : 'active:scale-95'}`}>
            {isClaimable && (<div className="absolute inset-0 rounded-xl animate-pulse-slow" style={{ background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.3), transparent)`, backgroundSize: '200% 200%'}}></div>)}
            
            <div className={`relative flex items-center gap-4 p-4 rounded-xl border ${ isClaimable ? 'bg-slate-800 border-purple-500/50' : 'bg-slate-800 border-transparent'}`}>
                <div className="absolute top-0 left-0 p-1 px-2 text-xs bg-slate-700 rounded-br-lg uppercase font-lilita text-slate-300">Day {reward.day}</div>
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${ isClaimable ? 'bg-slate-700 border border-slate-600' : 'bg-slate-900'} shadow-sm p-1`}>
                    <div className={`w-full h-full rounded-lg flex items-center justify-center ${ isClaimable ? 'bg-slate-800/80' : 'bg-slate-800'}`}>
                    <div className="w-10 h-10 flex items-center justify-center text-2xl">{reward.icon}</div>
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md border mb-1.5 backdrop-blur-sm transition-colors ${
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
                    className={`min-w-[90px] h-10 flex items-center justify-center py-2 px-3 rounded-lg font-lilita tracking-wide text-sm transition-all uppercase ${ 
                    isClaimed ? 'bg-green-600 text-white' : 
                    isClaimable ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-lg' : 
                    'bg-slate-700 text-slate-400'
                    }`}
                >
                    { isClaimed ? 'Received' : 
                    isClaiming && isClaimable ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Claim' 
                    }
                </button>
            </div>
        </div>
    );
});

// 6. ScrollableContent: Tách toàn bộ nội dung cuộn ra một component riêng
// QUAN TRỌNG: Component này được Memo, nó sẽ KHÔNG re-render khi countdown hay coins thay đổi
const ScrollableContent = memo(({ 
    loginStreak, nextStreakGoal, canClaimToday, claimableDay, isClaiming, isSyncingData, claimReward 
}: any) => {
    return (
        <div className="px-4 pt-4 pb-16">
            <StreakHeader loginStreak={loginStreak} nextStreakGoal={nextStreakGoal} />
          
            <div className="mb-6">
                <MiniCalendar 
                    dailyRewards={dailyRewards} 
                    canClaimToday={canClaimToday} 
                    claimableDay={claimableDay} 
                    loginStreak={loginStreak} 
                />
            </div>
        
            <div className="pb-6">
                <div className="grid grid-cols-1 gap-4">
                    {/* Goal Card */}
                    {nextStreakGoal && (
                        <div className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-md p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner p-1">
                                    <div className="w-full h-full rounded-lg flex items-center justify-center bg-slate-800/80">
                                        <div className="w-10 h-10 flex items-center justify-center">{nextStreakGoal.icon}</div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="w-full h-3.5 bg-slate-900/50 rounded-full overflow-hidden shadow-inner p-0.5">
                                            <div 
                                                className="relative h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500 ease-out" 
                                                style={{ width: `${(loginStreak / nextStreakGoal.streakGoal) * 100}%` }}
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
                    )}

                    {/* Danh sách phần thưởng */}
                    {dailyRewards.map((reward: any) => (
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
    );
});


// ============================================================================
// COMPONENT GIAO DIỆN CHÍNH (VIEW)
// ============================================================================
const DailyCheckInView = () => {
  const {
    loginStreak, isSyncingData, canClaimToday, claimableDay, 
    isClaiming, showRewardAnimation, animatingReward, particles, 
    nextStreakGoal, 
    claimReward, handleClose,
  } = useCheckIn();

  return (
    <div className="bg-slate-950 shadow-2xl overflow-hidden relative flex flex-col h-screen">
      {/* Header: Dùng màu nền đặc (bg-slate-900) thay vì blur để tối ưu FPS khi cuộn */}
      <header className="flex-shrink-0 w-full box-border flex items-center justify-between bg-slate-900 border-b border-white/10 z-20 pt-2 pb-2 px-4 shadow-md">
        <HomeButton onClick={handleClose} />
        <div className="flex items-center gap-3">
          <CoinWrapper />
        </div>
      </header>
      
      {/* --- CONTAINER NỘI DUNG CUỘN --- */}
      {/* will-change-transform giúp trình duyệt đưa layer này ra riêng để render nhanh hơn */}
      <div className="flex-1 overflow-y-auto hide-scrollbar overscroll-none" style={{ willChange: 'transform' }}>
        <ScrollableContent 
            loginStreak={loginStreak}
            nextStreakGoal={nextStreakGoal}
            canClaimToday={canClaimToday}
            claimableDay={claimableDay}
            isClaiming={isClaiming}
            isSyncingData={isSyncingData}
            claimReward={claimReward}
        />
      </div>

      {/* MODAL REWARD ANIMATION */}
      {showRewardAnimation && animatingReward && (
        <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50">
          <div className="relative max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl animate-float border border-slate-700">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/50">
                <div className="w-full h-full rounded-full bg-slate-900/60 flex items-center justify-center">
                  <div className="w-12 h-12 animate-pulse flex items-center justify-center text-3xl">{animatingReward.daily?.icon}</div>
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
            {particles.map((particle: any) => (<div key={particle.id} className={particle.className} style={particle.style} />))}
          </div>
        </div>
      )}

      {/* --- CSS --- */}
      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float-particle-1 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-100px, -100px) scale(0); opacity: 0; } }
        @keyframes float-particle-2 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(100px, -100px) scale(0); opacity: 0; } }
        @keyframes float-particle-3 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-50px, 100px) scale(0); opacity: 0; } }
        @keyframes float-particle-4 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(50px, 100px) scale(0); opacity: 0; } }
        @keyframes float-particle-5 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0, -120px) scale(0); opacity: 0; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes wave { 0% { transform: translateX(-100%) translateY(5px); } 100% { transform: translateX(100%) translateY(-5px); } }
        .water-wave1, .water-wave2 { position: absolute; top: -15px; left: 0; width: 200%; height: 20px; background: rgba(255, 255, 255, 0.3); border-radius: 50%; animation: wave 3s infinite linear; }
        .water-wave2 { top: -5px; animation-delay: 1s; opacity: 0.6; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-particle-1 { animation: float-particle-1 2s ease-out forwards; }
        .animate-float-particle-2 { animation: float-particle-2 2s ease-out forwards; }
        .animate-float-particle-3 { animation: float-particle-3 2s ease-out forwards; }
        .animate-float-particle-4 { animation: float-particle-4 2s ease-out forwards; }
        .animate-float-particle-5 { animation: float-particle-5 2s ease-out forwards; }
      `}</style>
    </div>
  );
};


// --- COMPONENT CHÍNH ĐỂ EXPORT ---
const DailyCheckIn = ({ onClose }: DailyCheckInProps) => {
  return (
    <CheckInProvider onClose={onClose}>
      <DailyCheckInView />
    </CheckInProvider>
  );
};

export default DailyCheckIn;
