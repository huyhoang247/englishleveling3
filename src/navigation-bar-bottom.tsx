import React, { useState, useMemo } from "react";
import { uiAssets } from "./game-assets.ts";

interface NavigationBarBottomProps {
  activeTab: 'home' | 'quiz' | 'story' | 'game' | 'profile';
  onTabChange: (tab: 'home' | 'quiz' | 'story' | 'game' | 'profile') => void;
}

const NavigationBarBottom: React.FC<NavigationBarBottomProps> = ({
  activeTab,
  onTabChange
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Định nghĩa tabs (Sử dụng useMemo để tránh tạo lại array mỗi lần render nếu cần, hoặc giữ nguyên như cũ cũng được)
  const tabs = useMemo(() => [
    {
      id: "home",
      label: "Trang chủ",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <img
          src={uiAssets.homeIcon}
          alt="Home Icon"
          width={props.size}
          height={props.size}
          className={`transition-all duration-300 ${props.color === '#ffffff' ? '' : 'grayscale opacity-60 group-hover:opacity-100'}`}
        />
      ),
      gradient: "from-purple-500 to-blue-500",
      shadow: "shadow-blue-500/50"
    },
    {
      id: "quiz",
      label: "Trắc nghiệm",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/course-icon.webp"
          alt="Quiz Icon"
          width={props.size}
          height={props.size}
          className={`transition-all duration-300 ${props.color === '#ffffff' ? '' : 'grayscale opacity-60 group-hover:opacity-100'}`}
        />
      ),
      gradient: "from-green-500 to-teal-400",
      shadow: "shadow-green-500/50"
    },
    {
      id: "story",
      label: "Truyện",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <img
          src={uiAssets.storyIcon}
          alt="Story Icon"
          width={props.size}
          height={props.size}
          className={`transition-all duration-300 ${props.color === '#ffffff' ? '' : 'grayscale opacity-60 group-hover:opacity-100'}`}
        />
      ),
      gradient: "from-amber-500 to-yellow-300",
      shadow: "shadow-amber-500/50"
    },
    {
      id: "game",
      label: "Mini Game",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size}
          height={props.size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={props.color}
          strokeWidth={props.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <line x1="15" y1="13" x2="15" y2="13" />
          <line x1="18" y1="11" x2="18" y2="11" />
          <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
      ),
      gradient: "from-red-500 to-orange-400",
      shadow: "shadow-red-500/50"
    },
    {
      id: "profile",
      label: "Hồ sơ",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size}
          height={props.size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={props.color}
          strokeWidth={props.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-400",
      shadow: "shadow-indigo-500/50"
    },
  ], []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Tính toán vị trí của tab đang active để di chuyển background
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const activeTabConfig = tabs[activeIndex] || tabs[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center z-50 pointer-events-none">
      {/* Nút toggle (chỉ hiển thị khi ở tab story) - Thêm pointer-events-auto */}
      <div className={`transition-opacity duration-300 ${activeTab === 'story' ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
        {activeTab === 'story' && (
          <div
            className="relative flex justify-center mb-1"
            onClick={toggleVisibility}
          >
            <div className="w-12 h-6 bg-gray-900/90 backdrop-blur-xl rounded-full flex justify-center items-center cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-gray-700/50 transform transition-transform duration-300 hover:scale-110 active:scale-95">
              <div className={`absolute w-6 h-1 bg-gray-400 rounded-full transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? 'rotate-0' : 'rotate-180'}`}></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Bar Container - Thêm pointer-events-auto */}
      <div
        className={`pointer-events-auto w-full max-w-lg mx-auto bg-black/80 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          ${isVisible ? 'rounded-t-3xl' : 'rounded-t-none'}
        `}
      >
        <div className="relative flex justify-between items-center h-20 px-2">
          
          {/* --- Sliding Background Indicator --- */}
          {/* Đây là phần tử di chuyển phía sau các icon */}
          <div
            className="absolute top-0 bottom-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              width: `${100 / tabs.length}%`, // Chiều rộng bằng 1 tab
              left: `${activeIndex * (100 / tabs.length)}%` // Vị trí dựa trên index
            }}
          >
            <div className="relative w-full h-full flex justify-center items-center">
              {/* Vùng sáng (Glow) */}
              <div className={`absolute w-12 h-12 rounded-full opacity-20 blur-xl bg-gradient-to-tr ${activeTabConfig.gradient} transition-colors duration-500`} />
              
              {/* Vòng tròn nền (Background Circle) */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeTabConfig.gradient} opacity-10 blur-sm transform scale-90 transition-all duration-500`} />
            </div>
          </div>

          {/* --- Tabs --- */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className="group flex-1 relative flex flex-col justify-center items-center h-full focus:outline-none"
                onClick={() => {
                  onTabChange(tab.id as any);
                  if (tab.id !== 'story') setIsVisible(true);
                }}
              >
                {/* Icon Container with Floating Animation */}
                <div
                  className={`
                    relative p-3 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${isActive ? '-translate-y-3 scale-110' : 'translate-y-0 scale-100 group-hover:-translate-y-1'}
                    ${isActive ? `bg-gradient-to-br ${tab.gradient} shadow-lg ${tab.shadow}` : 'bg-transparent'}
                  `}
                >
                  <Icon
                    size={22}
                    color={isActive ? "#ffffff" : "#9ca3af"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label (Optional: only visible when active or hovering, sliding up) */}
                {/* <span
                  className={`
                    absolute bottom-2 text-[10px] font-medium tracking-wide transition-all duration-300
                    ${isActive ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 translate-y-2 text-gray-500'}
                  `}
                >
                  {tab.label}
                </span> */}

                {/* Active Dot Indicator (dấu chấm nhỏ dưới icon khi active) */}
                <span 
                    className={`
                        absolute bottom-3 w-1 h-1 rounded-full bg-white transition-all duration-500 delay-100
                        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                    `}
                />
              </button>
            );
          })}
        </div>
        
        {/* Safe area for iPhone home bar */}
        <div className="h-safe-bottom w-full bg-transparent"></div>
      </div>
      
      <style jsx>{`
        .h-safe-bottom {
            height: env(safe-area-inset-bottom, 20px);
        }
        /* Custom Easing for smoother feels */
        .cubic-bezier {
            transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

export default NavigationBarBottom;
