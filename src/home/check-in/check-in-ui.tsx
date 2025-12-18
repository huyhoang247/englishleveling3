// Filename: check-in-ui.tsx

import React from 'react';
import { CheckInProvider, useCheckIn, dailyRewards } from './check-in-context.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import HomeButton from '../../ui/home-button.tsx'; 

// --- PROPS CHO COMPONENT CHÍNH ---
interface DailyCheckInProps {
  onClose: () => void;
}

// --- COMPONENT GIAO DIỆN (VIEW) ---
const DailyCheckInView = () => {
  const {
    loginStreak, isSyncingData, canClaimToday, claimableDay, coins,
    isClaiming, showRewardAnimation, animatingReward, particles, countdown,
    nextStreakGoal, 
    claimReward, handleClose,
  } = useCheckIn();

  const animatedCoins = useAnimateValue(coins, 500);

  return (
    <div className="bg-black/90 shadow-2xl overflow-hidden relative flex flex-col h-screen">
      <header className="flex-shrink-0 w-full box-border flex items-center justify-between bg-slate-900/70 backdrop-blur-sm border-b border-white/10 z-20 pt-2 pb-2 px-4">
        <HomeButton onClick={handleClose} />
        <div className="flex items-center gap-3">
          <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
        </div>
      </header>
      
      {/* --- CONTAINER NỘI DUNG CUỘN --- */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="px-4 pt-4 pb-16">
          
          {/* --- STREAK HEADER --- */}
          <div className="flex justify-center mt-2 mb-6">
            <div className="bg-slate-900/80 rounded-xl px-4 py-4 w-full max-w-sm flex items-center gap-4 border border-slate-700 shadow-lg relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none"></div>
               
              <div className="flex-shrink-0 z-10">
                <div className="relative w-16 h-16">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-20 blur-md"></div>
                  <div className="w-16 h-16 relative overflow-hidden rounded-full border-2 border-slate-700 bg-slate-900">
                    <div 
                      className="water-fill absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-cyan-400 to-blue-600 opacity-80" 
                      style={{ 
                        transform: `translateY(${(1 - (loginStreak / (nextStreakGoal?.streakGoal || 7))) * 100}%)`, 
                        transition: 'transform 1s ease-out' 
                      }}
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
              <div className="flex-1 min-w-0 z-10">
                  <div className="flex flex-col items-start gap-1.5">
                      <span className="inline-flex items-center bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-sm font-medium border border-slate-600 shadow-sm">
                          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/streak-icon.webp" alt="Streak" className="w-4 h-4 mr-2" />
                          {loginStreak} Day Streak
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-400 pl-1">
                          Reset in: {countdown}
                      </span>
                  </div>
              </div>
            </div>
          </div>

          {/* --- TOP CIRCLE PROGRESS --- */}
          <div className="mb-8">
            <div className="flex justify-between px-1">
              {dailyRewards.map(reward => {
                let isClaimed;
                if (canClaimToday) {
                    isClaimed = reward.day < claimableDay;
                } else {
                    const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
                    isClaimed = reward.day <= completedDaysInCycle;
                }
                
                const isClaimable = canClaimToday && reward.day === claimableDay;
                let dayClasses = "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 relative border-2";
                
                if (isClaimed) dayClasses += " bg-slate-800 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                else if (isClaimable) dayClasses += " bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110";
                else dayClasses += " bg-slate-800 border-slate-700 text-slate-500";
                
                return (
                  <div key={reward.day} className="relative group">
                    <div className={dayClasses}>
                      <span className="font-lilita text-sm z-10">{reward.day}</span>
                      {isClaimable && (
                        <div className="absolute -inset-1 rounded-full bg-indigo-500/30 animate-pulse"></div>
                      )}
                      {isClaimed && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border border-slate-900 flex items-center justify-center z-20">
                           <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>
                    {/* Tooltip keeps name for context if needed, but list is clean */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                      <div className="bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap font-lilita tracking-wide uppercase">{reward.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        
          {/* --- MAIN REWARD LIST --- */}
          <div className="pb-6 space-y-4">
            
            {/* Next Streak Goal Banner */}
            {nextStreakGoal && (
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg p-1">
                      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
                      <div className="flex items-center gap-4 p-3 relative z-10">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700 shadow-inner">
                                <div className="w-9 h-9">{nextStreakGoal.icon}</div>
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider text-[10px]">Streak Goal</span>
                                <span className="text-indigo-300 font-lilita text-lg">x{nextStreakGoal.amount}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                  <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                                      style={{ width: `${(loginStreak / nextStreakGoal.streakGoal) * 100}%` }}
                                  ></div>
                              </div>
                              <div className="mt-1 text-right text-[10px] text-slate-500 font-mono">
                                  {loginStreak} / {nextStreakGoal.streakGoal}
                              </div>
                          </div>
                      </div>
                  </div>
            )}

            {/* Daily Rewards Items */}
            <div className="grid grid-cols-1 gap-3">
              {dailyRewards.map(reward => {
                let isClaimed;
                if (canClaimToday) {
                    isClaimed = reward.day < claimableDay;
                } else {
                    const completedDaysInCycle = loginStreak > 0 ? ((loginStreak - 1) % 7) + 1 : 0;
                    isClaimed = reward.day <= completedDaysInCycle;
                }
                const isClaimable = canClaimToday && reward.day === claimableDay;
                
                return (
                <div key={reward.day} className={`group relative rounded-2xl transition-all duration-300 ${isClaimed ? 'opacity-50 grayscale-[0.3]' : 'hover:scale-[1.01]'}`}>
                  {/* Active Glow Background */}
                  {isClaimable && (<div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-sm animate-pulse-slow"></div>)}
                  
                  <div className={`relative flex items-center justify-between p-3 pr-4 rounded-2xl border ${ 
                    isClaimable 
                      ? 'bg-gradient-to-r from-slate-800 to-indigo-900/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-800 border-slate-700/50'
                  }`}>
                    
                    {/* Day Tag - Subtle top left */}
                    <div className="absolute top-0 left-0">
                         <div className={`px-2 py-0.5 rounded-br-lg text-[10px] font-bold uppercase tracking-wider ${isClaimable ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            Day {reward.day}
                         </div>
                    </div>

                    {/* Center Content: Icon & Amount */}
                    <div className="flex-1 flex items-center justify-center gap-3 pl-2">
                        {/* Icon Box */}
                        <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${isClaimable ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>
                            {isClaimable && <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full"></div>}
                            <div className="w-10 h-10 relative z-10">{reward.icon}</div>
                        </div>
                        
                        {/* Amount - Large & Stylized */}
                        <div className={`font-lilita text-2xl tracking-wide ${isClaimable ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200 drop-shadow-sm' : 'text-slate-400'}`}>
                            x{reward.amount}
                        </div>
                    </div>

                    {/* Button - Right Aligned */}
                    <div className="flex-shrink-0 ml-2">
                        <button 
                        onClick={() => claimReward(reward.day)} 
                        disabled={!isClaimable || isClaiming || isSyncingData} 
                        className={`h-9 px-4 rounded-lg font-lilita tracking-wide text-xs uppercase shadow-md transition-all active:scale-95 ${ 
                            isClaimed ? 'bg-slate-700 text-green-400 border border-slate-600 cursor-default' : 
                            isClaimable ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110 shadow-indigo-500/30' : 
                            'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        }`}
                        >
                        { isClaimed ? (
                            <div className="flex items-center gap-1">
                                <span>Received</span>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        ) : 
                            isClaiming && isClaimable ? (
                            <svg className="animate-spin h-4 w-4 text-white mx-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            ) : 'Claim' 
                        }
                        </button>
                    </div>

                    {/* Overlay for Claimed items (Checkmark ribbon) */}
                    {isClaimed && (
                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
                          <div className="absolute -right-8 -top-8 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>

      {/* --- REWARD MODAL (Giữ nguyên tên để user biết nhận được gì) --- */}
      {showRewardAnimation && animatingReward && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-xs w-full bg-slate-900 rounded-3xl p-1 shadow-2xl animate-float border border-slate-700">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[20px] p-6 text-center overflow-hidden relative">
                
                {/* Background Rays */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(99,102,241,0.1)_360deg)] animate-[spin_10s_linear_infinite]"></div>

                <div className="relative z-10">
                    <div className="mx-auto w-24 h-24 mb-4 relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 rounded-full animate-pulse"></div>
                        <div className="relative w-full h-full flex items-center justify-center drop-shadow-2xl scale-125">
                            {animatingReward.daily?.icon}
                        </div>
                    </div>
                    
                    <div className="text-indigo-400 text-sm font-bold tracking-wider uppercase mb-2">Reward Claimed</div>
                    <div className="text-white text-2xl font-bold font-lilita tracking-wide uppercase drop-shadow-md mb-1">{animatingReward.daily?.name}</div>
                    <div className="text-4xl font-black font-lilita text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-300">x{animatingReward.daily?.amount}</div>
                    
                    {animatingReward.streak && (
                        <div className="bg-slate-800/80 rounded-xl p-3 mt-6 border border-slate-700 backdrop-blur-sm">
                            <div className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1">Streak Bonus</div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-white text-sm font-bold uppercase">{animatingReward.streak?.name}</span>
                                <span className="text-green-300 text-lg font-lilita">+ {animatingReward.streak?.amount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Close hint */}
            <div className="text-center mt-6 text-slate-500 text-xs animate-pulse">Tap anywhere to close</div>
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
