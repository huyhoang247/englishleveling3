import React from 'react';
import { CheckInProvider, useCheckIn, dailyRewards } from './check-in-context.tsx';
import HomeButton from '../../ui/home-button.tsx';

// --- PROPS CHO COMPONENT CHÍNH ---
interface DailyCheckInProps {
  onClose: () => void;
}

// --- COMPONENT GIAO DIỆN (VIEW) ---
// Component này không có logic, chỉ nhận dữ liệu từ context và hiển thị.
const DailyCheckInView = () => {
  const {
    loginStreak, isSyncingData, canClaimToday, claimableDay,
    isClaiming, showRewardAnimation, animatingReward, particles, countdown,
    nextStreakGoal, // Lấy mốc streak tiếp theo từ context
    claimReward, handleClose,
  } = useCheckIn();

  return (
    <div className="bg-black/90 shadow-2xl overflow-hidden relative flex flex-col h-screen px-4 pt-4">
      {/* --- PHẦN HEADER CỐ ĐỊNH --- */}
      <div>
        <div className="flex justify-center mt-6 mb-6">
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl px-4 py-4 w-full max-w-sm flex items-center gap-4 border border-slate-700 shadow-lg relative">
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-20 blur-md"></div>
                <div className="w-16 h-16 relative overflow-hidden rounded-full border-2 border-slate-700">
                  <div className="absolute inset-0 bg-slate-900"></div>
                  <div className="water-fill absolute w-full bg-gradient-to-b from-cyan-400 to-blue-600 opacity-80" style={{ bottom: 0, height: `${(loginStreak / (nextStreakGoal?.streakGoal || 7)) * 100}%`, transition: 'height 1s ease-out' }}>
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
                <div className="flex flex-col items-start gap-1"> {/* Bỏ mb-2 ở đây để khoảng cách đều hơn */}
                    <span className="inline-flex items-center bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-600">
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/streak-icon.webp" alt="Streak Icon" className="w-5 h-5 mr-2" />
                        {loginStreak} Day Streak
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-400">
                        {countdown}
                    </span>
                </div>
                {/* --- ĐÃ XÓA THANH PROGRESS BAR Ở ĐÂY --- */}
            </div>
            <div className="absolute top-3 right-3">
                <HomeButton onClick={handleClose} /> {/* SỬ DỤNG handleClose TỪ CONTEXT */}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between">
            {dailyRewards.map(reward => {
              const lastCompletedDayInCycle = canClaimToday ? claimableDay - 1 : claimableDay;
              const isClaimed = reward.day <= lastCompletedDayInCycle && loginStreak > 0;
              
              const isClaimable = canClaimToday && reward.day === claimableDay;
              let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 relative";
              if (isClaimed) dayClasses += " bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";
              else if (isClaimable) dayClasses += " bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg";
              else dayClasses += " bg-slate-700 text-slate-400";
              return (
                <div key={reward.day} className="relative group">
                  <div className={dayClasses}>
                    <span className="font-bold z-10">{reward.day}</span>
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                    <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">{reward.name}</div>
                    <div className="w-2 h-2 bg-slate-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-4 hide-scrollbar">
        <div className="pb-6">
          <div className="grid grid-cols-1 gap-4">
            {/* --- Ô PHẦN THƯỞNG MỐC STREAK (Không đổi) --- */}
            {nextStreakGoal && (
                <div className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-lg p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg p-1">
                            <div className="w-full h-full rounded-lg flex items-center justify-center bg-slate-800/80 backdrop-blur-sm">
                                <div className="w-10 h-10">{nextStreakGoal.icon}</div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">{nextStreakGoal.streakGoal} Day Streak Reward</h3>
                            <p className="text-indigo-300 text-sm font-semibold">{nextStreakGoal.name}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${(loginStreak / nextStreakGoal.streakGoal) * 100}%` }}></div>
                                </div>
                                <span className="text-xs font-mono text-slate-400">{loginStreak}/{nextStreakGoal.streakGoal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DANH SÁCH PHẦN THƯỞNG HÀNG NGÀY (Không đổi) --- */}
            {dailyRewards.map(reward => {
              const lastCompletedDayInCycle = canClaimToday ? claimableDay - 1 : claimableDay;
              const isClaimed = reward.day <= lastCompletedDayInCycle && loginStreak > 0;
              const isClaimable = canClaimToday && reward.day === claimableDay;
              
              return (
              <div key={reward.day} className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${isClaimed ? 'opacity-60' : 'hover:transform hover:scale-[1.02]'}`}>
                {isClaimable && (<div className="absolute inset-0 rounded-xl animate-pulse-slow" style={{ background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.6), transparent)`, backgroundSize: '200% 200%'}}></div>)}
                <div className={`relative flex items-center gap-4 p-4 rounded-xl ${ isClaimable ? 'bg-gradient-to-r from-slate-800 to-slate-800/95 border border-purple-500/50' : 'bg-slate-800'}`}>
                  <div className="absolute top-0 left-0 p-1 px-2 text-xs bg-slate-700 rounded-br-lg font-medium text-slate-300">Day {reward.day}</div>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${ isClaimable ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'} shadow-lg p-1`}>
                    <div className={`w-full h-full rounded-lg flex items-center justify-center ${ isClaimable ? 'bg-slate-800/80 backdrop-blur-sm' : 'bg-slate-800'}`}>
                      <div className="w-10 h-10">{reward.icon}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{reward.name}</h3>
                    <p className="text-slate-300 text-sm">x{reward.amount}</p>
                  </div>
                  <button onClick={() => claimReward(reward.day)} disabled={!isClaimable || isClaiming || isSyncingData} className={`min-w-[90px] py-2 px-3 rounded-lg font-semibold text-sm transition-all ${ isClaimed ? 'bg-green-600 text-white' : isClaimable ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-indigo-400/20 hover:shadow-lg' : 'bg-slate-700 text-slate-400'}`}>
                    { isClaimed ? 'Đã Nhận' : isClaiming && isClaimable ? '...' : 'Claim' }
                  </button>
                  {isClaimed && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-green-600 rounded-full p-2 transform rotate-12">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      <div> {/* Footer */} </div>
        
      {/* --- MODAL HIỂN THỊ PHẦN THƯỞNG (Không đổi) --- */}
      {showRewardAnimation && animatingReward && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl animate-float">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/50">
                <div className="w-full h-full rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-12 h-12 animate-pulse">{animatingReward.daily?.icon}</div>
                </div>
              </div>
            </div>
            <div className="mt-14 text-center">
              <div className="text-indigo-400 text-lg font-bold mb-1">Nhận Thưởng Thành Công!</div>
              <div className="text-white text-xl font-bold mb-1">{animatingReward.daily?.name}</div>
              <div className="text-indigo-200 text-3xl font-bold mb-4">x{animatingReward.daily?.amount}</div>
              {animatingReward.streak && (
                  <div className="border-t border-slate-700 pt-4 mt-4">
                      <div className="text-green-400 text-sm font-bold mb-1">Thưởng Chuỗi Đăng Nhập!</div>
                      <div className="text-white text-lg font-bold mb-1">{animatingReward.streak?.name}</div>
                      <div className="text-green-200 text-2xl font-bold">+{animatingReward.streak?.amount}</div>
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

      {/* --- CSS (Không đổi) --- */}
      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
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
// Component này bao bọc View bằng Provider, cung cấp context cho nó.
const DailyCheckIn = ({ onClose }: DailyCheckInProps) => {
  return (
    <CheckInProvider onClose={onClose}>
      <DailyCheckInView />
    </CheckInProvider>
  );
};

export default DailyCheckIn;
