// --- START OF FILE sidebar.tsx ---

import React, { useState, useEffect } from 'react';

// Define prop types for SidebarLayout
interface SidebarLayoutProps {
  children: React.ReactNode;
  setToggleSidebar?: (toggleFn: () => void) => void;
  onShowStats?: () => void;
  onShowRank?: () => void;
  onShowSettings?: () => void;
  onShowHelp?: () => void;
  onShowGoldMine?: () => void;
  onShowLuckyGame?: () => void;
  onShowAchievements?: () => void;
  onShowAdmin?: () => void; // NEW: Handler for Admin Panel
}

// --- SVG Icon Components ---
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrophyIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);
const SettingsIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
const UsersIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const HelpCircleIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
const ChevronDownIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
const AwardIcon = ({ size = 24, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
    alt="Award Icon"
    width={size}
    height={size}
    className={className}
    {...props}
  />
);
const FrameIcon = ({ size = 24, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/frame.png"
    alt="Frame Icon"
    width={size}
    height={size}
    className={className}
    {...props}
  />
);
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    className={className}
    {...props}
  >
    <path d="M14 14l-4 4-2-2 4-4 2-2 2-2 2-2 2-2 2-2"></path>
    <path d="M18 6l-2-2"></path>
    <path d="M12 8l-2-2"></path>
    <path d="M8 12l-2-2"></path>
    <path d="M6 18l-2-2"></path>
    <path d="M16 10l-2-2"></path>
    <path d="M20 14l-2-2"></path>
    <path d="M14 18l-2-2"></path>
    <path d="M10 22l-2-2"></path>
    <path d="M2 10l-2-2"></path>
    <path d="M22 2l-2-2"></path>
    <path d="M20 20l-2-2"></path>
    <path d="M18 22l-2-2"></path>
    <path d="M22 18l-2-2"></path>
    <path d="M10 2l-2-2"></path>
    <path d="M6 6l-2-2"></path>
    <path d="M2 2l-2-2"></path>
    <path d="M22 6l-2-2"></path>
    <path d="M12 20l-2-2"></path>
    <path d="M16 22l-2-2"></path>
    <path d="M20 10l-2-2"></path>
    <path d="M14 2l-2-2"></path>
    <path d="M8 2l-2-2"></path>
    <path d="M4 22l-2-2"></path>
  </svg>
);
const LuckyGameIcon = ({ size = 24, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/fortune-wheel.png"
    alt="Lucky Game Icon"
    width={size}
    height={size}
    className={className}
    {...props}
  />
);

// NEW: Icon for Admin Panel
const SlidersHorizontalIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="21" y1="10" x2="3" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="21" y1="18" x2="3" y2="18"></line>
    </svg>
);


function SidebarLayout({ children, setToggleSidebar, onShowStats, onShowRank, onShowSettings, onShowHelp, onShowGoldMine, onShowLuckyGame, onShowAchievements, onShowAdmin }: SidebarLayoutProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    if (setToggleSidebar) {
      setToggleSidebar(toggleSidebar);
    }
  }, [setToggleSidebar, toggleSidebar]);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const menuItems = [
    { id: 'stats', label: 'Stats', icon: AwardIcon, onClick: onShowStats },
    { id: 'rank', label: 'Rank', icon: FrameIcon, onClick: onShowRank },
    { id: 'goldMine', label: 'Mỏ vàng', icon: PickaxeIcon, onClick: onShowGoldMine },
    { id: 'luckyGame', label: 'Lucky Game', icon: LuckyGameIcon, onClick: onShowLuckyGame },
    { id: 'achievements', label: 'Thành Tựu', icon: TrophyIcon, onClick: onShowAchievements },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon, onClick: onShowSettings },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircleIcon, onClick: onShowHelp },
    // NEW: Admin Panel menu item
    { id: 'admin', label: 'Admin Panel', icon: SlidersHorizontalIcon, onClick: onShowAdmin },
  ];


  return (
    <div className="relative h-screen flex bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 z-50 h-screen flex items-center
          transform transition-all duration-300 ease-in-out
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div
          className={`
            flex flex-col w-72 bg-gray-900 shadow-xl rounded-r-2xl
            transition-all duration-300 ease-in-out
            mx-0 mt-16 mb-32 h-[calc(100vh-12rem)]
          `}
        >
          {isSidebarVisible && (
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-0 px-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className={`${index !== 0 ? 'border-t border-opacity-20 border-gray-700' : ''}`}>
                      <a
                        href="#"
                        className={`
                          flex items-center px-4 py-3 text-sm font-medium
                          transition-all duration-150 ease-in-out group relative
                          mx-1 my-1 rounded-xl
                          ${false
                            ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                          }
                        `}
                        onClick={(e) => {
                          e.preventDefault();
                          item.onClick?.();
                           if (window.innerWidth < 768) {
                              toggleSidebar();
                           }
                        }}
                      >
                        <div className={`
                          w-8 h-8 flex items-center justify-center rounded-lg mr-3
                          transition-colors duration-200
                          ${false
                            ? 'bg-blue-600 bg-opacity-80 text-white shadow-inner'
                            : 'bg-gray-800 text-gray-400 group-hover:text-gray-200'
                          }
                        `}>
                          <Icon size={18} />
                        </div>
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {isSidebarVisible && (
            <div className="mt-auto p-3 border-t border-gray-800">
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 p-2 rounded-lg w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 transition-all duration-200"
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm flex items-center justify-center text-white font-semibold text-sm">
                    TD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">Trần Đức</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shadow-sm">
                    <ChevronDownIcon size={14} className="text-gray-400" />
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-10">
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-blue-400 flex items-center justify-center mr-2">
                        <UsersIcon size={14} />
                      </div>
                      Hồ sơ
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mr-2">
                        <SettingsIcon size={14} />
                      </div>
                      Cài đặt
                    </a>
                    <div className="my-1 border-t border-gray-700"></div>
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-red-400 flex items-center justify-center mr-2">
                        <XIcon size={14} />
                      </div>
                      Đăng xuất
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto
        w-full
      `}>
        {children}
      </div>
    </div>
  );
}

export { SidebarLayout };

// --- END OF FILE sidebar.tsx ---
