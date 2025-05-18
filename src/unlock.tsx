import { useState, useEffect } from 'react';

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

export default function GameUnlockModal() {
  // Removed state variables for unlocking, success, sparkles, countdown, shake, glowPulse

  // Removed useEffect hooks

  // Removed handleUnlock and handleButtonHover functions

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

      <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-8 w-96 shadow-2xl border border-blue-700`}> {/* Simplified border */}
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white opacity-5 rounded-2xl"></div>

        {/* Background glow effects */}
        {/* Kept some glow effects for visual style */}
        <div className={`absolute -top-20 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse`}></div>
        <div className="absolute -bottom-20 left-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>


        {/* Enhanced edge glow */}
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_15px_rgba(56,189,248,0.3)] pointer-events-none"></div>

        {/* Only render the initial state */}
        <>
          {/* Enhanced main heart icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-blue-500 opacity-30 blur-md animate-pulse"></div>
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-800 to-indigo-900 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 flex items-center justify-center shadow-inner">
                  {/* Using img tag for heart icon */}
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
              // Removed onMouseEnter and onClick handlers
              className={`relative flex items-center justify-between w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 p-5 rounded-xl transition-all duration-200 group border border-amber-400`} // Removed shake class
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
              // Removed onMouseEnter and onClick handlers
              className={`relative flex items-center justify-between w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 p-5 rounded-xl transition-all duration-200 group border border-blue-400`} // Removed shake class
            >
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10"></div>
                <div className="absolute left-0 top-0 w-full h-1/2 bg-white opacity-20 transform -skew-y-12"></div>
              </div>

              <div className="flex items-center relative">
                <div className="relative mr-4">
                  <div className="absolute -inset-1 rounded-full bg-blue-300 opacity-30 animate-pulse"></div>
                  {/* Updated img tag for play icon */}
                  <img
                      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/play.png"
                      alt="Play icon"
                      className="w-8 h-8" // Adjust size as needed
                  />
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
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(10px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }

        .animate-float {
           animation: float 20s linear infinite; /* Apply float animation */
        }
      `}</style>
    </div>
  );
}
