// --- START OF FILE check-in.tsx (OPTIMIZED) ---

import React, { useState, useEffect, useCallback } from 'react';

// --- TỐI ƯU HÓA 1: ĐỊNH NGHĨA SVG COMPONENTS BÊN NGOÀI ---
// Việc này ngăn chúng bị tái định nghĩa lại mỗi khi component cha re-render,
// giúp React tối ưu hóa và tránh unmount/mount lại DOM không cần thiết.

const StarIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const SparklesIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17.8l-2.6-1.5L6.8 18l1.5-2.6-1.5-2.6 2.6-1.5 2.6-1.5 2.6 1.5 2.6 1.5-1.5 2.6 1.5 2.6-2.6 1.5-2.6 1.5z"></path>
      <path d="M12 2v2"></path><path d="M4.2 4.2l1.4 1.4"></path><path d="M2 12h2"></path><path d="M4.2 19.8l1.4-1.4"></path>
      <path d="M12 22v-2"></path><path d="M19.8 19.8l-1.4-1.4"></path><path d="M22 12h-2"></path><path d="M19.8 4.2l-1.4 1.4"></path>
    </svg>
);

const ZapIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const ShieldIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);

const GiftIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
);

const FlameIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.27 16.78A9.61 9.61 0 0 0 12 15c-3.6 0-6.73 1.08-9.27 3.22C1.96 18.85 2 22 2 22c0 0 3.22-.04 7.82-2.73C12.43 21.03 15 22 15 22c2.22 0 4.2-.8 5.73-2.11C22.72 18.39 21.27 16.78 21.27 16.78z"></path>
      <path d="M12 15c1.66 0 3-1.34 3-3 0-1.33-.5-2-1-3 0 0-2 2-3 3l-3 3c.5 1 1.66 3 3 3z"></path>
    </svg>
);

const CrownIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6l-2 3H5l2-3-2-3h5l2-3 2 3h5l-2 3 2 3h-5l-2-3z"></path>
      <path d="M2 15l.9 1.8a6 6 0 0 0 8.2 8.2l1.8.9 1.8-.9a6 6 0 0 0 8.2-8.2L22 15"></path>
    </svg>
);

// Định nghĩa props
interface DailyCheckInProps {
  onClose: () => void;
}

// Danh sách phần thưởng, cũng có thể đặt bên ngoài vì nó là hằng số
const dailyRewards = [
    { day: 1, name: "Kim Cương", amount: "100", icon: <StarIcon className="text-blue-400" /> },
    { day: 2, name: "Vàng", amount: "5000", icon: <SparklesIcon className="text-yellow-400" /> },
    { day: 3, name: "Thẻ Ma Thuật", amount: "3", icon: <ZapIcon className="text-purple-400" /> },
    { day: 4, name: "Đá Linh Hồn", amount: "10", icon: <ShieldIcon className="text-emerald-400" /> },
    { day: 5, name: "Rương Huyền Thoại", amount: "1", icon: <GiftIcon className="text-amber-400" /> },
    { day: 6, name: "Vé Triệu Hồi", amount: "5", icon: <FlameIcon className="text-red-400" /> },
    { day: 7, name: "Vũ Khí Thần Thánh", amount: "1", icon: <CrownIcon className="text-yellow-400" /> },
];

const DailyCheckIn = ({ onClose }: DailyCheckInProps) => {
  const [currentDay, setCurrentDay] = useState(3);
  const [claimedDays, setClaimedDays] = useState([1, 2]);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [animatingReward, setAnimatingReward] = useState<any>(null);
  const [loginStreak, setLoginStreak] = useState(claimedDays.length);

  // --- TỐI ƯU HÓA 2: SỬ DỤNG useCallback ---
  // Bọc hàm trong useCallback để đảm bảo nó chỉ được tạo lại khi
  // các dependencies (currentDay, claimedDays) thay đổi.
  const claimReward = useCallback((day: number) => {
    // Check if the day is the current day and hasn't been claimed yet
    if (day === currentDay && !claimedDays.includes(day)) {
      setAnimatingReward(dailyRewards.find(reward => reward.day === day));
      setShowRewardAnimation(true);

      setTimeout(() => {
        setShowRewardAnimation(false);
        const newClaimedDays = [...claimedDays, day];
        setClaimedDays(newClaimedDays);
        setLoginStreak(newClaimedDays.length);
      }, 2000);
    }
  }, [currentDay, claimedDays]); // Dependencies của hàm

  // Particle animation classes
  const particleClasses = [
    "animate-float-particle-1", "animate-float-particle-2", "animate-float-particle-3",
    "animate-float-particle-4", "animate-float-particle-5"
  ];

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
                  <div className="water-fill absolute w-full bg-gradient-to-b from-cyan-400 to-blue-600 opacity-80"
                    style={{ bottom: 0, height: `${(loginStreak / 7) * 100}%`, transition: 'height 1s ease-out' }}>
                    <div className="water-wave1"></div><div className="water-wave2"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">{loginStreak}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="mb-3">
                    <span className="inline-flex items-center bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-600">
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/streak-icon.webp" alt="Streak Icon" className="w-5 h-5 mr-2" />
                        {loginStreak} Day Streak
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${(loginStreak / 7) * 100}%` }}></div>
                </div>
            </div>
            <button onClick={onClose} aria-label="Đóng" className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between">
            {dailyRewards.map(reward => {
              const isClaimed = claimedDays.includes(reward.day);
              const isCurrent = reward.day === currentDay;
              let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 relative font-bold z-10";

              if (isClaimed) {
                dayClasses += " bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";
              } else if (isCurrent) {
                dayClasses += " bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg";
              } else {
                dayClasses += " bg-slate-700 text-slate-400";
              }

              return (
                <div key={reward.day} className="relative group">
                  <div className={dayClasses}>
                    {reward.day}
                    {isCurrent && (
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
      
      {/* Vùng chứa nội dung có thể cuộn */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-4">
        <div className="pb-6">
          <div className="grid grid-cols-1 gap-4">
            {dailyRewards.map(reward => (
              <div key={reward.day} className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${ claimedDays.includes(reward.day) ? 'opacity-60' : 'hover:transform hover:scale-[1.02]' }`}>
                {reward.day === currentDay && !claimedDays.includes(reward.day) && (
                  <div className="absolute inset-0 rounded-xl animate-pulse-slow" style={{ background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.6), transparent)`, backgroundSize: '200% 200%' }}></div>
                )}
                <div className={`relative flex items-center gap-4 p-4 rounded-xl ${ reward.day === currentDay && !claimedDays.includes(reward.day) ? 'bg-gradient-to-r from-slate-800 to-slate-800/95 border border-purple-500/50' : 'bg-slate-800' }`}>
                  <div className="absolute top-0 left-0 p-1 px-2 text-xs bg-slate-700 rounded-br-lg font-medium text-slate-300">Day {reward.day}</div>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${ reward.day === 7 ? 'bg-gradient-to-br from-purple-400 to-indigo-600' : reward.day === currentDay && !claimedDays.includes(reward.day) ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600' : 'bg-gradient-to-br from-slate-700 to-slate-900' } shadow-lg p-1`}>
                    <div className={`w-full h-full rounded-lg flex items-center justify-center ${ reward.day === 7 ? 'bg-indigo-500/20' : reward.day === currentDay && !claimedDays.includes(reward.day) ? 'bg-slate-800/80 backdrop-blur-sm' : 'bg-slate-800' }`}>
                      <div className="w-8 h-8">{reward.icon}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{reward.name}</h3>
                    <p className="text-slate-300 text-sm">x{reward.amount}</p>
                  </div>
                  <button onClick={() => claimReward(reward.day)} disabled={reward.day !== currentDay || claimedDays.includes(reward.day)}
                    className={`min-w-[90px] py-2 px-3 rounded-lg font-semibold text-sm transition-all ${ claimedDays.includes(reward.day) ? 'bg-green-600 text-white' : reward.day === currentDay ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-indigo-400/20 hover:shadow-lg' : 'bg-slate-700 text-slate-400' }`}>
                    {claimedDays.includes(reward.day) ? 'Đã Nhận' : 'Claim'}
                  </button>
                  {claimedDays.includes(reward.day) && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-green-600 rounded-full p-2 transform rotate-12">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>{/* Footer content */}</div>

      {/* Reward animation overlay */}
      {showRewardAnimation && animatingReward && (
        // LƯU Ý: backdrop-blur có thể ảnh hưởng hiệu năng. Cân nhắc đổi thành bg-slate-900/80 nếu cần.
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl animate-float">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/50">
                <div className="w-full h-full rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-12 h-12 animate-pulse">{animatingReward?.icon}</div>
                </div>
              </div>
            </div>
            <div className="mt-14 text-center">
              <div className="text-indigo-400 text-lg font-bold mb-1">Nhận Thưởng Thành Công!</div>
              <div className="text-white text-xl font-bold mb-3">{animatingReward?.name}</div>
              <div className="text-indigo-200 text-3xl font-bold">x{animatingReward?.amount}</div>
              <div className="mt-6 text-sm text-slate-400">Phần thưởng đã được thêm vào kho đồ</div>
            </div>
          </div>

          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* --- TỐI ƯU HÓA 3: GIẢM SỐ LƯỢNG HẠT --- */}
            {/* Giảm từ 20 xuống 12 để giảm số lượng node DOM cần render và animate */}
            {[...Array(12)].map((_, i) => {
              const randomAnimClass = particleClasses[i % particleClasses.length];
              return (
                <div key={i} className={`absolute w-2 h-2 rounded-full ${randomAnimClass}`}
                  style={{
                    top: `${50 + (Math.random() * 30 - 15)}%`, left: `${50 + (Math.random() * 30 - 15)}%`,
                    backgroundColor: i % 2 === 0 ? '#8b5cf6' : '#ffffff',
                    boxShadow: `0 0 10px 2px rgba(255, 255, 255, 0.3)`, opacity: Math.random() * 0.7 + 0.3,
                    animationDuration: `${1 + Math.random() * 3}s`, animationDelay: `${Math.random() * 0.5}s`
                  }} />
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float-particle-1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-100px, -100px) scale(0); } }
        @keyframes float-particle-2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, -100px) scale(0); } }
        @keyframes float-particle-3 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-50px, 100px) scale(0); } }
        @keyframes float-particle-4 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 100px) scale(0); } }
        @keyframes float-particle-5 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(0, -120px) scale(0); } }
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

export default DailyCheckIn;
// --- END OF FILE check-in.tsx (OPTIMIZED) ---
