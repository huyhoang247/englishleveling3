import React, { useState, useEffect } from 'react';

// --- ICON COMPONENTS (Inline SVG replacement for Lucide - Đầy đủ không rút gọn) ---
const Icon = ({ children, size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

const WalletIcon = (props) => (
  <Icon {...props}>
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </Icon>
);

const ActivityIcon = (props) => (
  <Icon {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Icon>
);

const TrendingDownIcon = (props) => (
  <Icon {...props}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </Icon>
);

const ZapIcon = (props) => (
  <Icon {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Icon>
);

const PickaxeIcon = (props) => (
  <Icon {...props}>
    <path d="M14.5 5.5l-4 4" />
    <path d="M3 21l6-6" />
    <path d="M13 11l6-6" />
    <path d="M21 3l-6 6" />
    <path d="M9 13l-4 4" />
    <path d="M11 5l3-3" />
    <path d="M5 11l-3 3" />
  </Icon>
);

const ClockIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const UsersIcon = (props) => (
  <Icon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

const CheckIcon = (props) => (
  <Icon {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

const LockIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

// --- MAIN COMPONENT ---
const App = () => {
  const [balance, setBalance] = useState(124.5938);
  const [miningEndTime, setMiningEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isMining, setIsMining] = useState(false);
  const [totalUsers, setTotalUsers] = useState(1); 
  const [userMastery, setUserMastery] = useState(46); 

  const halvingMilestones = [
    { threshold: 0, rate: 1.6, label: "Phase 1", chainStatus: "Off-Chain" },
    { threshold: 50000, rate: 0.8, label: "Phase 2", chainStatus: "Off-Chain" },
    { threshold: 100000, rate: 0.4, label: "Phase 3", chainStatus: "Off-Chain" },
    { threshold: 200000, rate: 0.2, label: "Phase 4", chainStatus: "Off-Chain" },
    { threshold: 500000, rate: 0.1, label: "Phrase 5", chainStatus: "On-Chain" },
  ];

  const getCurrentPhaseIndex = () => {
    for (let i = halvingMilestones.length - 1; i >= 0; i--) {
      if (totalUsers >= halvingMilestones[i].threshold) return i;
    }
    return 0;
  };

  const currentPhaseIndex = getCurrentPhaseIndex();
  const currentBaseRate = halvingMilestones[currentPhaseIndex].rate;
  const masteryBoost = (userMastery / 100) * 0.2; 
  const totalMiningRate = currentBaseRate + masteryBoost;
  const ratePerSecond = totalMiningRate / 3600;

  const startMiningSession = () => {
    if (userMastery < 100) return;
    const endTime = Date.now() + 24 * 60 * 60 * 1000;
    setMiningEndTime(endTime);
    setIsMining(true);
  };

  useEffect(() => {
    if (!isMining || !miningEndTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const distance = miningEndTime - now;
      setBalance(prev => prev + (ratePerSecond / 10));
      if (distance < 0) {
        setIsMining(false);
        setMiningEndTime(null);
        setTimeLeft("00:00:00");
        clearInterval(interval);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours < 10 ? '0'+hours : hours}:${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isMining, miningEndTime, ratePerSecond]);

  return (
    // THÊM CLASS 'scrollbar-hide' ĐỂ ẨN THANH CUỘN
    <div className="scrollbar-hide h-full min-h-screen w-full bg-[#0B0C15] text-white font-sans selection:bg-cyan-500 selection:text-black relative overflow-y-auto flex flex-col pb-32">
      
      {/* --- OPTIMIZED BACKGROUND EFFECTS (Không dùng Blur nặng) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_15%,rgba(88,28,135,0.15),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_85%,rgba(22,78,99,0.15),transparent_40%)]"></div>
      </div>

      <nav className="relative z-10 w-full px-6 py-6 flex justify-end items-center bg-transparent">
        <button disabled className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 cursor-not-allowed opacity-80 group">
          <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><WalletIcon size={20} /></div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-slate-300 leading-none mb-0.5">Connect Wallet</span>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Coming Soon</span>
          </div>
        </button>
      </nav>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Mining Dashboard */}
        <div className="w-full lg:w-7/12 space-y-6">
          {/* Badge Airdrop: Bỏ backdrop-blur để mượt hơn */}
          <div className="inline-flex items-center gap-3 px-1 py-1 pr-4 rounded-full bg-slate-900 border border-slate-700/60 mb-2">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-black text-green-400 tracking-widest uppercase">LIVE</span>
            </div>
            <span className="text-slate-200 text-sm font-lilita tracking-wide uppercase">AIRDROP</span>
          </div>

          <div className="relative bg-[#13141F] rounded-3xl p-6 md:p-7 border border-white/10 overflow-hidden group shadow-2xl">
            {/* OPTIMIZED GLOW: Dùng Radial Gradient thay cho Blur */}
            <div 
                className={`absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_60%)] transition-opacity duration-1000 pointer-events-none ${isMining ? 'opacity-100' : 'opacity-0'}`}
            ></div>

            <div className="relative z-10">
              {/* BALANCE SECTION */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`p-2 rounded-xl transition-all duration-500 ${isMining ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  <ActivityIcon size={18} className={isMining ? "animate-pulse" : ""} />
                </div>
                <div>
                  <div className="text-slate-400 text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5 opacity-60">Mining Balance</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-4xl font-lilita text-white">{balance.toFixed(4)}</span>
                    <span className="text-cyan-400 font-lilita text-xs md:text-sm tracking-widest opacity-80">ENGO</span>
                  </div>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1"><TrendingDownIcon size={12} /> Base Rate</div>
                  <div className="text-lg text-white font-lilita">+{currentBaseRate.toFixed(2)} <span className="text-[10px] text-slate-500 font-sans">/h</span></div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-slate-800/40 p-3.5 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-300 text-[10px] font-bold uppercase mb-1"><ZapIcon size={12} /> Boost</div>
                  <div className="text-lg text-purple-400 font-lilita">+{masteryBoost.toFixed(4)} <span className="text-[10px] text-purple-300/50 font-sans">/h</span></div>
                </div>
              </div>

              {/* PRODUCTION & ACTION SECTION */}
              <div className="flex flex-col gap-5 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Production</div>
                   <div className="text-lg text-green-400 flex items-center gap-1.5 font-lilita">
                      <PickaxeIcon size={16} className={isMining ? "animate-bounce" : ""} /> 
                      {totalMiningRate.toFixed(4)} <span className="text-xs text-green-400/60 font-sans">/h</span>
                   </div>
                </div>

                {/* --- START MINING UI --- */}
                <div className="flex flex-col items-center gap-5">
                  {isMining ? (
                      <div className="w-full py-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between px-6 transition-all duration-300">
                         <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                               <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping absolute"></div>
                               <div className="w-2 h-2 bg-cyan-500 rounded-full relative"></div>
                            </div>
                            <span className="text-xs font-lilita text-cyan-400 tracking-wider uppercase">MINING...</span>
                         </div>
                         {/* --- ĐỒNG HỒ ĐẾM NGƯỢC --- */}
                         <div className="font-lilita text-lg text-cyan-400 tracking-widest">{timeLeft}</div>
                      </div>
                  ) : (
                      <div className="w-full flex flex-col items-center gap-5">
                        {/* --- NÚT START MINING --- */}
                        <button 
                          onClick={startMiningSession}
                          disabled={userMastery < 100}
                          className={`
                            relative px-12 py-3.5 rounded-2xl font-lilita text-lg tracking-[0.1em] transition-all duration-300 flex items-center justify-center overflow-hidden w-full max-w-[320px]
                            ${userMastery >= 100 
                              ? "bg-slate-900 border border-slate-700 text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-black hover:border-cyan-500/50 hover:text-white hover:shadow-cyan-500/10 active:scale-95 cursor-pointer" 
                              : "bg-slate-900/40 border border-slate-800/50 text-slate-600 cursor-not-allowed"}
                          `}
                        >
                          {userMastery >= 100 ? "START MINING" : "LOCKED"}
                        </button>

                        {/* --- MASTERY PROGRESS UI --- */}
                        {userMastery < 100 && (
                          <div className="w-full max-w-[280px] flex flex-col items-center">
                             <div className="w-full flex justify-between items-center mb-2 px-1">
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(249,115,22,1)]"></div>
                                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Mastery</span>
                                </div>
                                
                                <div className="bg-[#0B0C15] border border-white/10 px-3 py-1 rounded-lg shadow-xl flex items-center justify-center">
                                   <span className="text-white font-mono text-[11px] font-bold tracking-tight">
                                      {userMastery}<span className="text-white/30 mx-0.5">/</span>100
                                   </span>
                                </div>
                             </div>

                             <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden border border-white/5 p-[0.5px]">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all duration-1000 ease-out"
                                  style={{ width: `${Math.min(userMastery, 100)}%` }}
                                />
                             </div>
                          </div>
                        )}

                        {userMastery >= 100 && (
                           <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2 font-bold uppercase tracking-widest opacity-60">
                              <ClockIcon size={12} /> 24 HOURS SESSIONS READY
                           </div>
                        )}
                      </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mastery Simulator */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-700/50">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mastery Simulator</span>
                    <span className={`text-xs font-bold ${userMastery >= 100 ? 'text-green-400' : 'text-purple-400'}`}>
                      {userMastery} PTS {userMastery >= 100 && "✓"}
                    </span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={userMastery}
                    onChange={(e) => setUserMastery(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Roadmap */}
        <div className="w-full lg:w-5/12">
          <div className="bg-[#13141F] rounded-3xl p-6 md:p-8 border border-white/10 h-full relative overflow-hidden">
             
             <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-2">
                   <MapPinIcon size={18} className="text-cyan-400" />
                   <h3 className="text-sm font-bold text-white tracking-widest uppercase opacity-90">
                      Roadmap
                   </h3>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 min-w-[140px]">
                   <div className="flex items-center justify-between gap-3">
                       <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Users</span>
                       <span className="font-mono text-sm font-bold text-white leading-none">
                          {totalUsers.toLocaleString()}
                       </span>
                   </div>
                </div>
             </div>

             <div className="relative space-y-0 z-10">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800/50"></div>
                {halvingMilestones.map((milestone, index) => {
                   let status = 'locked'; 
                   if (currentPhaseIndex > index) status = 'completed';
                   if (currentPhaseIndex === index) status = 'active';
                   return (
                      <div key={index} className="relative flex gap-6 pb-8 last:pb-0 group">
                         <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shrink-0
                            ${status === 'completed' ? 'bg-[#0B0C15] border-green-500 text-green-500' : 
                              status === 'active' ? 'bg-[#0B0C15] border-cyan-400 text-cyan-400 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 
                              'bg-[#0B0C15] border-slate-700 text-slate-600'}`}>
                            {status === 'completed' && <CheckIcon size={18} strokeWidth={3} />}
                            {status === 'active' && <ZapIcon size={16} fill="currentColor" />}
                            {status === 'locked' && <LockIcon size={16} />}
                         </div>
                         <div className={`flex-1 rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden flex flex-col gap-2 justify-center
                            ${status === 'active' 
                               ? 'bg-gradient-to-r from-cyan-900/10 to-transparent border-cyan-500/30' 
                               : 'bg-transparent border-transparent opacity-40'
                            }`}>
                            <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider
                               ${milestone.chainStatus === 'On-Chain' 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-slate-700/50 text-slate-400'}`}>
                               {milestone.chainStatus}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${status === 'active' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                {milestone.label}
                            </span>
                            <div className="flex items-center gap-3 mt-1 text-[10px]">
                               <div className="flex items-center gap-1.5 bg-slate-950/40 rounded px-2 py-1">
                                  <UsersIcon size={12} className="text-slate-500" />
                                  <span className="text-slate-400">{milestone.threshold.toLocaleString()}</span>
                               </div>
                               <span className="text-slate-500 font-medium">{milestone.rate} Engo/h</span>
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>

             <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 text-[10px] text-slate-500 uppercase font-bold tracking-wider justify-center">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>DONE</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>ACTIVE</div>
             </div>

          </div>
        </div>
      </main>
      
      {/* Styles & Custom Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');

        .font-lilita {
          font-family: 'Lilita One', cursive;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; background: #a855f7;
          cursor: pointer; border-radius: 50%; border: 2px solid white;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        /* ẨN SCROLLBAR NHƯNG VẪN CUỘN ĐƯỢC */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default App;
