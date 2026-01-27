import React, { useState, useEffect } from 'react';

// --- ICON COMPONENTS (Inline SVG replacement for Lucide) ---
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

const RefreshCwIcon = (props) => (
  <Icon {...props}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
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

const Link2Icon = (props) => (
  <Icon {...props}>
    <path d="M15 7h2a5 5 0 0 1 0 10h-2M9 17H7A5 5 0 0 1 7 7h2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </Icon>
);

// --- MAIN COMPONENT ---
const App = () => {
  const [balance, setBalance] = useState(124.5938);
  const [miningEndTime, setMiningEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isMining, setIsMining] = useState(false);
  const [totalUsers, setTotalUsers] = useState(1); 
  const [userMastery, setUserMastery] = useState(250); 

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
  const masteryBoost = (userMastery / 100) * 0.1;
  const totalMiningRate = currentBaseRate + masteryBoost;
  const ratePerSecond = totalMiningRate / 3600;

  const startMiningSession = () => {
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

  // Tách số dư để hiển thị đẹp hơn
  const balanceInteger = Math.floor(balance);
  const balanceDecimal = (balance % 1).toFixed(4).substring(1);

  return (
    <div className="h-full min-h-screen w-full bg-[#0B0C15] text-white font-sans selection:bg-cyan-500 selection:text-black relative overflow-y-auto flex flex-col pb-20">
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '32px 32px' }}></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ZapIcon size={24} fill="white" stroke="none" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Engo<span className="text-cyan-400">Network</span></span>
        </div>
        <button 
          disabled
          className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md cursor-not-allowed opacity-80 hover:opacity-100 transition-all group"
        >
          <div className="text-slate-500 group-hover:text-cyan-400 transition-colors">
            <WalletIcon size={20} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-slate-300 leading-none">Connect Wallet</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.1em]">Coming Soon</span>
          </div>
        </button>
      </nav>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Mining Dashboard */}
        <div className="w-full lg:w-7/12 space-y-6">
          
          <div className="inline-flex items-center gap-3 px-1 py-1 pr-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:border-cyan-500/50 transition-colors cursor-default group mb-2">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-black text-green-400 tracking-widest uppercase">Live</span>
            </div>
            <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase group-hover:text-cyan-400 transition-colors">
                Mining Mainnet Simulation
            </span>
          </div>

          {/* MAIN BALANCE CARD */}
          <div className="relative bg-[#13141F] rounded-[2.5rem] p-8 md:p-12 border border-white/10 overflow-hidden group shadow-2xl">
            {/* Glows */}
            <div className={`absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] transition-opacity duration-1000 ${isMining ? 'opacity-100' : 'opacity-20'}`}></div>
            <div className={`absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] transition-opacity duration-1000 ${isMining ? 'opacity-100' : 'opacity-20'}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-slate-500 text-[11px] uppercase tracking-[0.4em] font-black mb-6 opacity-80">Current Balance</span>
              
              <div className="flex items-baseline justify-center mb-10">
                <span className="text-7xl md:text-9xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                  {balanceInteger}
                </span>
                <span className="text-3xl md:text-5xl font-mono font-bold text-cyan-500/80 tracking-tighter">
                  {balanceDecimal}
                </span>
              </div>

              {/* Token Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl mb-12">
                 <div className={`w-3 h-3 rounded-full bg-cyan-500 ${isMining ? 'animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'opacity-40'}`}></div>
                 <span className="text-sm font-black text-white tracking-[0.2em] uppercase">Engo Tokens</span>
              </div>

              {/* Rates Grid */}
              <div className="w-full grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-3xl border border-white/5 text-left group/card hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <TrendingDownIcon size={14} className="text-cyan-500" /> Base
                  </div>
                  <div className="text-xl font-black text-white flex items-baseline gap-1">
                    +{currentBaseRate.toFixed(4)}
                    <span className="text-[10px] text-slate-600">/h</span>
                  </div>
                </div>
                <div className="bg-purple-500/5 backdrop-blur-sm p-5 rounded-3xl border border-purple-500/10 text-left group/card hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <ZapIcon size={14} className="text-purple-400" /> Mastery
                  </div>
                  <div className="text-xl font-black text-purple-400 flex items-baseline gap-1">
                    +{masteryBoost.toFixed(4)}
                    <span className="text-[10px] text-purple-900 font-bold">/h</span>
                  </div>
                </div>
              </div>

              {/* Action Button Area */}
              <div className="w-full space-y-6">
                {isMining ? (
                    <div className="relative w-full overflow-hidden rounded-[2rem] p-[1px] bg-gradient-to-r from-cyan-500/30 via-white/10 to-purple-500/30">
                        <div className="bg-[#0B0C15] rounded-[2rem] px-8 py-6 flex justify-between items-center transition-all">
                            <div className="flex items-center gap-4">
                                <div className="flex items-end gap-1 h-5">
                                    <div className="w-1.5 bg-cyan-500 rounded-full animate-[mining-bar_1s_ease-in-out_infinite]"></div>
                                    <div className="w-1.5 bg-cyan-500/60 rounded-full animate-[mining-bar_1s_ease-in-out_0.2s_infinite]"></div>
                                    <div className="w-1.5 bg-cyan-500/30 rounded-full animate-[mining-bar_1s_ease-in-out_0.4s_infinite]"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active session</span>
                            </div>
                            <div className="text-3xl font-mono font-black text-white tabular-nums tracking-widest">
                                {timeLeft}
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                      onClick={startMiningSession}
                      className="group relative w-full py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] text-white transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 transition-all group-hover:scale-105"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <PickaxeIcon size={24} strokeWidth={3} />
                        <span>Start Mining</span>
                      </div>
                    </button>
                )}
                
                {!isMining && (
                   <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      <ClockIcon size={12} /> Session length: 24.00.00
                   </div>
                )}
              </div>
            </div>
            
            {/* Mastery Simulator */}
            <div className="mt-12 pt-8 border-t border-white/5">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Mastery Level Simulator</span>
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-400 font-bold">{userMastery} Points</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    value={userMastery}
                    onChange={(e) => setUserMastery(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Roadmap */}
        <div className="w-full lg:w-5/12">
          <div className="bg-[#13141F] rounded-[2.5rem] p-8 md:p-10 border border-white/10 h-full relative overflow-hidden">
             
             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="space-y-1">
                   <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase opacity-90">Roadmap</h3>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Network Progression</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl min-w-[160px]">
                   <div className="flex items-center justify-between gap-4 mb-2">
                       <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Users</span>
                       <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                           <span className="font-mono text-sm font-black text-white">
                              {totalUsers.toLocaleString()}
                           </span>
                       </div>
                   </div>
                   <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/5 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                      <RefreshCwIcon size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Syncing nodes...</span>
                   </div>
                </div>
             </div>

             <div className="relative space-y-2 z-10">
                <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-500/50 via-slate-800 to-transparent"></div>
                
                {halvingMilestones.map((milestone, index) => {
                   let status = 'locked'; 
                   if (currentPhaseIndex > index) status = 'completed';
                   if (currentPhaseIndex === index) status = 'active';
                   return (
                      <div key={index} className="relative flex gap-8 pb-8 last:pb-0 group">
                         <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shrink-0
                            ${status === 'completed' ? 'bg-green-500/10 border-green-500/40 text-green-500' : 
                              status === 'active' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-110' : 
                              'bg-slate-900 border-slate-800 text-slate-600'}`}>
                            {status === 'completed' && <CheckIcon size={20} strokeWidth={3} />}
                            {status === 'active' && <ZapIcon size={20} fill="currentColor" />}
                            {status === 'locked' && <LockIcon size={18} />}
                         </div>
                         <div className={`flex-1 rounded-3xl p-5 border transition-all duration-500 relative overflow-hidden
                            ${status === 'active' 
                               ? 'bg-gradient-to-r from-white/5 to-transparent border-white/10' 
                               : status === 'completed' 
                                  ? 'bg-slate-800/20 border-white/5 opacity-60' 
                                  : 'bg-transparent border-transparent opacity-30'
                            }`}>
                            
                            <div className="flex justify-between items-center mb-3">
                               <span className={`text-xs font-black uppercase tracking-widest ${status === 'active' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                  {milestone.label}
                               </span>
                               <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest
                                  ${milestone.chainStatus === 'On-Chain' 
                                     ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                                     : 'bg-slate-800 text-slate-500'}`}>
                                  {milestone.chainStatus}
                               </div>
                            </div>

                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 text-slate-400">
                                  <UsersIcon size={12} />
                                  <span className="text-[10px] font-mono font-bold">{milestone.threshold.toLocaleString()}</span>
                               </div>
                               <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                               <div className={`flex items-center gap-1.5 text-[10px] font-bold ${status === 'active' || status === 'completed' ? 'text-slate-200' : 'text-slate-600'}`}>
                                  <ActivityIcon size={12} className={status === 'active' ? 'text-cyan-400' : ''} />
                                  <span>{milestone.rate} ENGO/H</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>

             <div className="mt-12 pt-8 border-t border-white/5 flex gap-6 text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] justify-center">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Passed</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div> Current</div>
             </div>

          </div>
        </div>
      </main>
      
      {/* GLOBAL ANIMATIONS */}
      <style>{`
        @keyframes mining-bar {
          0%, 100% { height: 8px; }
          50% { height: 20px; }
        }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #22d3ee;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
          transition: all 0.2s ease-in-out;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          scale: 1.2;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
        }
      `}</style>
    </div>
  );
};

export default App;
