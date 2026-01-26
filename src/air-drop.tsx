import React, { useState, useEffect } from 'react';
import { Wallet, Users, Zap, Pickaxe, TrendingDown, ArrowUpCircle, Info, Activity, ChevronRight, Check, Lock, MapPin, Clock, Timer, Link2, Database } from 'lucide-react';

const App = () => {
  // --- STATE QUẢN LÝ ---
  const [balance, setBalance] = useState(124.5938);
  
  // Mining State
  const [miningEndTime, setMiningEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isMining, setIsMining] = useState(false);

  // Dữ liệu User thực tế (Cố định demo)
  const [totalUsers, setTotalUsers] = useState(1); 
  const [userMastery, setUserMastery] = useState(250); 

  // --- CẤU HÌNH HALVING ROADMAP ---
  const halvingMilestones = [
    { threshold: 0, rate: 1.6, label: "Phrase 1", chainStatus: "Off-Chain" },
    { threshold: 50000, rate: 0.8, label: "Phrase 2", chainStatus: "Off-Chain" },
    { threshold: 100000, rate: 0.4, label: "Phrase 3", chainStatus: "Off-Chain" },
    { threshold: 200000, rate: 0.2, label: "Phrase 4", chainStatus: "Off-Chain" },
    { threshold: 500000, rate: 0.1, label: "Phrase 5", chainStatus: "On-Chain" },
  ];

  // --- LOGIC TÍNH TOÁN ---
  const getCurrentPhaseIndex = () => {
    for (let i = halvingMilestones.length - 1; i >= 0; i--) {
      if (totalUsers >= halvingMilestones[i].threshold) {
        return i;
      }
    }
    return 0;
  };

  const currentPhaseIndex = getCurrentPhaseIndex();
  const currentBaseRate = halvingMilestones[currentPhaseIndex].rate;
  const masteryBoost = (userMastery / 100) * 0.1;
  const totalMiningRate = currentBaseRate + masteryBoost;
  const ratePerSecond = totalMiningRate / 3600;

  // --- LOGIC ĐÀO 24H ---
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

  return (
    <div className="min-h-screen bg-[#0B0C15] text-white font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden flex flex-col">
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-6 flex justify-start items-center border-b border-white/5 bg-[#0B0C15]/80 backdrop-blur-md sticky top-0">
        
        {/* Wallet Button */}
        <button 
          disabled
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity group"
        >
          <div className="text-slate-500 group-hover:text-cyan-400 transition-colors">
            <Wallet size={20} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-slate-300 leading-none mb-0.5">Connect Wallet</span>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Coming Soon</span>
          </div>
        </button>

      </nav>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start pt-8">
        
        {/* LEFT COLUMN: Mining Dashboard */}
        <div className="w-full lg:w-7/12 space-y-6">
          
          {/* Tag AIRDROP */}
          <div className="inline-flex items-center gap-3 px-1 py-1 pr-4 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md hover:border-cyan-500/50 transition-colors cursor-default group mb-4">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-black text-green-400 tracking-widest uppercase">LIVE</span>
            </div>
            <span className="text-slate-200 text-sm font-semibold tracking-wide flex items-center gap-2 group-hover:text-cyan-400 transition-colors uppercase">
                AIRDROP
            </span>
          </div>

          {/* Mining Card */}
          <div className="relative bg-[#13141F] rounded-3xl p-6 md:p-8 border border-white/10 overflow-hidden group shadow-2xl">
            {/* Glow BG */}
            <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] transition-opacity duration-1000 ${isMining ? 'opacity-100' : 'opacity-20'}`}></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl transition-all duration-500 ${isMining ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                  <Activity size={24} className={isMining ? "animate-pulse" : ""} />
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Số dư khai thác</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-6xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">
                      {balance.toFixed(4)}
                    </span>
                    <span className="text-cyan-400 font-bold text-lg">ENGO</span>
                  </div>
                </div>
              </div>

              {/* Rate Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <TrendingDown size={14} /> Tốc độ cơ bản
                  </div>
                  <div className="text-xl font-bold text-white">
                    +{currentBaseRate.toFixed(4)} <span className="text-xs text-slate-500 font-normal">/h</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-800/40 p-4 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center gap-2 text-purple-300 text-xs mb-1">
                    <Zap size={14} /> Mastery Boost
                  </div>
                  <div className="text-xl font-bold text-purple-400">
                    +{masteryBoost.toFixed(4)} <span className="text-xs text-purple-300/50 font-normal">/h</span>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                   <div className="text-xs text-slate-500">Tổng tốc độ</div>
                   <div className="text-xl font-bold text-green-400 flex items-center gap-1">
                      <Pickaxe size={18} className={isMining ? "animate-bounce" : ""} /> 
                      {totalMiningRate.toFixed(4)} <span className="text-sm">/h</span>
                   </div>
                </div>

                {/* Mining Buttons */}
                {isMining ? (
                    <button disabled className="w-full py-4 rounded-2xl font-bold flex items-center justify-between px-6 transition-all bg-slate-800/80 border border-slate-700 text-cyan-400 cursor-default">
                       <div className="flex items-center gap-3">
                          <div className="relative">
                             <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping absolute"></div>
                             <div className="w-3 h-3 bg-cyan-500 rounded-full relative"></div>
                          </div>
                          <span>Đang khai thác...</span>
                       </div>
                       <div className="font-mono text-xl tracking-widest">{timeLeft}</div>
                    </button>
                ) : (
                    <button 
                      onClick={startMiningSession}
                      className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Zap size={24} fill="currentColor" />
                      Bắt đầu phiên khai thác
                    </button>
                )}
                
                {!isMining && (
                   <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Clock size={14} /> Phiên khai thác sẽ tự động dừng sau 24 giờ.
                   </div>
                )}
              </div>
            </div>
            
            {/* Quick Edit Mastery */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-700/50">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Giả lập Mastery</span>
                    <span className="text-xs text-purple-400 font-bold">{userMastery} Điểm</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    value={userMastery}
                    onChange={(e) => setUserMastery(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Halving Roadmap */}
        <div className="w-full lg:w-5/12">
          <div className="bg-[#13141F] rounded-3xl p-6 md:p-8 border border-white/10 h-full relative overflow-hidden">
             
             {/* Header */}
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin size={24} className="text-cyan-400" />
                      HALVING ROADMAP
                   </h3>
                   <p className="text-slate-400 text-xs mt-1">Lộ trình giảm tốc độ toàn cầu</p>
                </div>
                <div className="text-right">
                   <div className="text-xs text-slate-500 uppercase tracking-widest">Total Users</div>
                   <div className="text-xl font-mono font-bold text-white">{totalUsers.toLocaleString()}</div>
                </div>
             </div>

             {/* Roadmap Vertical Timeline */}
             {/* Đã xóa padding-left để căn chỉnh đường kẻ dọc */}
             <div className="relative space-y-0 z-10">
                {/* Vertical Line Connector - Căn chỉnh chính xác 100% (Left 19px cho circle 40px) */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800/50"></div>

                {halvingMilestones.map((milestone, index) => {
                   // Determine Status
                   let status = 'locked'; // locked, active, completed
                   if (currentPhaseIndex > index) status = 'completed';
                   if (currentPhaseIndex === index) status = 'active';

                   return (
                      <div key={index} className="relative flex gap-6 pb-8 last:pb-0 group">
                         {/* Dot / Icon */}
                         <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shrink-0
                            ${status === 'completed' ? 'bg-[#0B0C15] border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 
                              status === 'active' ? 'bg-[#0B0C15] border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110' : 
                              'bg-[#0B0C15] border-slate-700 text-slate-600'}`}>
                            {status === 'completed' && <Check size={18} strokeWidth={3} />}
                            {status === 'active' && <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />}
                            {status === 'active' && <div className="absolute w-3 h-3 bg-cyan-400 rounded-full" />}
                            {status === 'locked' && <Lock size={16} />}
                         </div>

                         {/* Content Card */}
                         <div className={`flex-1 rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden flex flex-col gap-2 justify-center
                            ${status === 'active' 
                               ? 'bg-gradient-to-r from-cyan-900/20 to-transparent border-cyan-500/30 translate-x-1' 
                               : status === 'completed' 
                                  ? 'bg-slate-800/20 border-white/5 opacity-60 hover:opacity-100' 
                                  : 'bg-transparent border-transparent opacity-40'
                            }`}>
                            
                            {/* Chain Type Tag */}
                            <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider
                               ${milestone.chainStatus === 'On-Chain' 
                                  ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
                                  : 'bg-slate-700/50 text-slate-400'}`}>
                               {milestone.chainStatus === 'On-Chain' && <Link2 size={10} className="inline mr-1 -mt-0.5" />}
                               {milestone.chainStatus}
                            </div>

                            <div className="flex justify-between items-center pr-12">
                               <span className={`text-xs font-bold uppercase tracking-wider ${status === 'active' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                  {milestone.label}
                               </span>
                            </div>
                            
                            {/* New Redesigned Info Row (Minimalist) */}
                            <div className="flex items-center gap-3 mt-1">
                               {/* Users Badge (Clean) */}
                               <div className="flex items-center gap-1.5 bg-slate-950/40 rounded-md px-2 py-1 border border-white/5">
                                  <Users size={12} className="text-slate-500" />
                                  <span className="text-[10px] text-slate-400 font-mono font-medium">
                                    {milestone.threshold.toLocaleString()} Users
                                  </span>
                               </div>

                               {/* Divider */}
                               <div className="w-px h-3 bg-slate-700/50"></div>

                               {/* Rate Display (Subtle) */}
                               <div className={`flex items-center gap-1.5 text-[10px] font-medium ${status === 'active' || status === 'completed' ? 'text-slate-200' : 'text-slate-600'}`}>
                                  <Zap size={10} className={status === 'active' ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-600'} />
                                  <span>{milestone.rate} <span className="opacity-50 text-[9px]">Engo/h</span></span>
                               </div>
                            </div>

                         </div>
                      </div>
                   );
                })}
             </div>

             {/* Legend */}
             <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 text-[10px] text-slate-500 uppercase font-bold tracking-wider justify-center">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Completed</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>Active Phase</div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;


