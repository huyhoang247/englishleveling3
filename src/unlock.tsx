import { useState, useEffect } from 'react';
// Removed lucide-react import

// SVG Icons (replacing lucide-react)

// ChevronRight Icon SVG
const ChevronRightIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucude-chevron-right ${className}`}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// PlayCircle Icon SVG
const PlayCircleIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
  height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-play-circle ${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

// Star Icon SVG
const StarIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-star ${className}`}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Sparkles Icon SVG
const SparklesIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-sparkles ${className}`}
  >
    <path d="M9.9 4.243a2 2 0 0 1 3.98 0" />
    <path d="M10.7 18.757a2 2 0 0 1 2.6 0" />
    <path d="M19.07 4.93a2 2 0 0 1 0 2.828" />
    <path d="M5.657 18.364a2 2 0 0 1 0-2.828" />
    <path d="M16.242 7.757a2 2 0 0 1 0 2.828" />
    <path d="M4.929 19.071a2 2 0 0 1 2.828 0" />
    <path d="M18.364 5.657a2 2 0 0 1 2.828 0" />
    <path d="M7.757 16.242a2 2 0 0 1 2.828 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Trophy Icon SVG
const TrophyIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-trophy ${className}`}
  >
    <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
    <path d="M18 14.66V17c0 .55-.47 1-1 1h-2c-.55 0-1-.45-1-1v-2.34" />
    <path d="M8 10l1.5 1.5L12 8" />
    <path d="M16 10l-1.5 1.5L12 8" />
    <path d="M12 15v-3.5" />
  </svg>
);

// Gift Icon SVG
const GiftIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-gift ${className}`}
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v9" />
    <path d="M5 12v9" />
    <path d="M2.01 8C2 8 2 4 12 4s10 4 10 4" />
    <path d="M12 8c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2" />
    <path d="M12 8c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2" />
  </svg>
);


export default function GameUnlockModal() {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [shake, setShake] = useState(false);
  const [glowPulse, setGlowPulse] = useState(false);

  // Hiệu ứng tạo sparkle animation
  useEffect(() => {
    if (showSuccess) {
      const interval = setInterval(() => {
        const newSparkle = {
          id: Math.random(),
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 3 + Math.random() * 8,
          duration: 0.5 + Math.random() * 1,
          color: ['yellow', 'blue', 'purple', 'green', 'pink'][Math.floor(Math.random() * 5)]
        };
        setSparkles(prev => [...prev, newSparkle]);
      }, 50);

      return () => clearInterval(interval);
    } else {
      setSparkles([]);
    }
  }, [showSuccess]);

  // Countdown animation
  useEffect(() => {
    if (isUnlocking && unlockMethod === 'ad') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isUnlocking, unlockMethod]);

  // Hiệu ứng glow pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = (method) => {
    setUnlockMethod(method);
    setIsUnlocking(true);

    // Animate unlock
    setTimeout(() => {
      setIsUnlocking(false);
      setShowSuccess(true);

      // Close modal after success
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }, method === 'gold' ? 1500 : 3500);
  };

  const handleButtonHover = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array(20).fill().map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-20"
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`
            }}
          ></div>
        ))}
      </div>

      <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-8 w-96 shadow-2xl ${
        isUnlocking && unlockMethod === 'gold' ? 'border-2 border-yellow-500 animate-pulse' :
        showSuccess ? 'border-2 border-green-500' :
        'border border-blue-700'
      }`}>
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white opacity-5 rounded-2xl"></div>

        {/* Background glow effects */}
        <div className={`absolute -top-20 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-blue-500 rounded-full filter blur-3xl opacity-20 ${glowPulse ? 'animate-pulse' : ''}`}></div>
        <div className="absolute -bottom-20 left-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>

        {/* Corner decorations have been removed */}

        {/* Enhanced edge glow */}
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_15px_rgba(56,189,248,0.3)] pointer-events-none"></div>

        {/* Sparkles for success screen */}
        {showSuccess && sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className={`absolute rounded-full animate-ping z-10 ${
              sparkle.color === 'yellow' ? 'bg-yellow-300' :
              sparkle.color === 'blue' ? 'bg-blue-300' :
              sparkle.color === 'purple' ? 'bg-purple-300' :
              sparkle.color === 'green' ? 'bg-green-300' :
              'bg-pink-300'
            }`}
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDuration: `${sparkle.duration}s`
            }}
          ></div>
        ))}

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center h-80 text-center relative">
            {/* Success animation - trophy with ring effect */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300 opacity-30 animate-ping"></div>
              <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300 opacity-10 animate-pulse"></div>
              {/* Replaced Trophy with emoji */}
              <div className="relative text-6xl animate-bounce">🏆</div>
            </div>

            <div className="relative">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 mb-3 animate-pulse">UNLOCKED!</h2>

              {/* Enhanced star decorations */}
              <div className="absolute -right-8 -top-8">
                <StarIcon className="text-yellow-400 animate-spin" size={20} style={{animationDuration: '3s'}} />
              </div>
              <div className="absolute -left-8 -top-8">
                <StarIcon className="text-yellow-400 animate-spin" size={20} style={{animationDuration: '3s'}} />
              </div>
              <div className="absolute right-12 -top-4">
                <SparklesIcon className="text-yellow-400 animate-pulse" size={16} />
              </div>
              <div className="absolute left-12 -top-4">
                <SparklesIcon className="text-yellow-400 animate-pulse" size={16} />
              </div>
            </div>

            <p className="text-blue-300 font-semibold mb-8 text-lg">Chuẩn bị cho thử thách mới!</p>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg opacity-50 blur-sm"></div>
              <button className="relative px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-bold transform transition hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 group">
                TIẾP TỤC
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                </div>
              </button>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                <ChevronRightIcon className="text-white animate-bounce" />
              </div>
            </div>

            {/* Extra gift animation */}
            <div className="absolute -bottom-2 -right-4">
              <GiftIcon className="text-purple-400 animate-pulse" size={24} />
            </div>
          </div>
        ) : isUnlocking ? (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            {unlockMethod === 'gold' ? (
              <>
                <div className="relative mb-6">
                  {/* Enhanced unlocking animation */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300 bg-opacity-20 flex items-center justify-center animate-pulse">
                    <div className="w-24 h-24 rounded-full bg-yellow-500 bg-opacity-30 flex items-center justify-center animate-ping" style={{animationDuration: '1.5s'}}>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 flex items-center justify-center">
                         {/* Using img tag for dollar icon */}
                         <img
                            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                            alt="Dollar icon"
                            className="w-10 h-10" // Adjust size as needed
                         />
                      </div>
                    </div>
                  </div>
                  {/* Using img tag for dollar icon */}
                  <div className="absolute -right-2 -top-2">
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                        alt="Dollar icon"
                        className="w-7 h-7 animate-bounce" // Adjust size and add animation
                     />
                  </div>
                  <div className="absolute -left-3 -bottom-1">
                    <StarIcon className="text-yellow-400 animate-pulse" size={16} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">ĐANG HỒI SINH...</span> {/* Changed text */}
                </h2>

                {/* Enhanced progress bar */}
                <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 animate-loading-bar relative">
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mt-4 font-medium">Đang sử dụng kho báu của bạn</p>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  {/* Enhanced ad animation */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 bg-opacity-20 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center animate-pulse">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <PlayCircleIcon className="text-blue-100" size={40} />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced countdown */}
                  {countdown !== null && (
                    <div className="absolute -right-2 -top-2">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30"></div>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg">
                          {countdown}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400">ĐANG TẢI QUẢNG CÁO...</span>
                </h2>

                {/* Enhanced progress bar */}
                <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-loading-bar relative">
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mt-4 font-medium">Bạn sẽ được thưởng sau khi xem xong</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Enhanced main lock icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-blue-500 opacity-30 blur-md animate-pulse"></div>
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-800 to-indigo-900 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 flex items-center justify-center shadow-inner">
                    {/* Replaced LockIcon with img tag */}
                    <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/heart.png"
                        alt="Heart icon"
                        className="w-12 h-12" // Adjust size as needed
                    />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-5 h-5 bg-cyan-400 rounded-full opacity-70 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-purple-400 rounded-full opacity-70 animate-pulse"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-3">HỒI SINH</h2> {/* Changed text */}
            <p className="text-center text-slate-300 text-sm mb-8 font-medium">Chọn phương thức hồi sinh</p> {/* Changed text */}

            {/* Enhanced gold unlock button */}
            <div className="relative mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl opacity-70 blur-sm"></div>
              <button
                onMouseEnter={handleButtonHover}
                onClick={() => handleUnlock('gold')}
                className={`relative flex items-center justify-between w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 p-5 rounded-xl transition-all duration-200 group border border-amber-400 ${shake ? 'animate-quick-shake' : ''}`}
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                  <div className="absolute left-0 top-0 w-full h-1/2 bg-white opacity-20 transform -skew-y-12"></div>
                </div>

                <div className="flex items-center relative">
                  <div className="relative mr-4">
                    <div className="absolute -inset-1 rounded-full bg-yellow-300 opacity-30 animate-pulse"></div>
                    {/* Using img tag for dollar icon */}
                    <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                        alt="Dollar icon"
                        className="w-8 h-8" // Adjust size as needed
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-70"></div>
                  </div>
                  <div>
                    <p className="font-bold text-yellow-900 text-lg">DÙNG VÀNG</p>
                    <p className="text-xs text-yellow-800">Hồi sinh ngay lập tức</p> {/* Changed text */}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-yellow-300 to-amber-300 px-4 py-2 rounded-full text-yellow-900 font-bold flex items-center shadow-md">
                    <span>100</span>
                    <ChevronRightIcon className="ml-1 transition-transform group-hover:translate-x-1 text-yellow-900" size={18} />
                  </div>
                </div>
              </button>
            </div>

            {/* Enhanced ad watch button */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-xl opacity-70 blur-sm"></div>
              <button
                onMouseEnter={handleButtonHover}
                onClick={() => handleUnlock('ad')}
                className={`relative flex items-center justify-between w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 p-5 rounded-xl transition-all duration-200 group border border-blue-400 ${shake ? 'animate-quick-shake' : ''}`}
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                  <div className="absolute left-0 top-0 w-full h-1/2 bg-white opacity-20 transform -skew-y-12"></div>
                </div>

                <div className="flex items-center relative">
                  <div className="relative mr-4">
                    <div className="absolute -inset-1 rounded-full bg-blue-300 opacity-30 animate-pulse"></div>
                    <PlayCircleIcon className="text-blue-100" size={32} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full animate-ping opacity-70"></div>
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">XEM QUẢNG CÁO</p>
                    <p className="text-xs text-blue-200">Miễn phí sau khi xem</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-full flex items-center shadow-md group-hover:from-blue-500 group-hover:to-indigo-500">
                  <ChevronRightIcon className="transition-transform group-hover:translate-x-1 text-white" size={20} />
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes quick-shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }

        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(10px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }

        .animate-loading-bar {
          animation: loading-bar 2s linear infinite;
        }

        .animate-quick-shake {
          animation: quick-shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
