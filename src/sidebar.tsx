// --- START OF FILE sidebar.tsx ---

// src/sidebar.tsx

import React, { useState, useEffect } from 'react';
import { uiAssets } from './game-assets.ts'; // THÊM MỚI: Import tài nguyên game
// Import the Rank component - REMOVED: Rank is now rendered by the parent
// import EnhancedLeaderboard from './rank.tsx';

// Define prop types for SidebarLayout
interface SidebarLayoutProps {
  children: React.ReactNode;
  // New prop to expose the toggleSidebar function
  setToggleSidebar?: (toggleFn: () => void) => void;
  // Props to handle toggling specific screens in the parent
  onShowRank?: () => void;   // Handler for showing Rank
  onShowMinerChallenge?: () => void; // NEW: Handler for Miner Challenge
  onShowLuckyGame?: () => void; // NEW: Handler for showing Lucky Treasure
  onShowAchievements?: () => void; // NEW: Handler for showing Achievements
  onShowUpgrade?: () => void; // NEW: Handler for showing Upgrade screen
  onShowBaseBuilding?: () => void; // NEW: Handler for Base Building
  onShowSystemCheck?: () => void; // NEW: Handler for System Check screen
  onShowAdmin?: () => void; // NEW: Handler for showing Admin Panel
}

// SVG Icon Components (Replacement for lucide-react) - Keep these here or move to a shared library
// Keeping these here for now, but ideally should be in library/icon.tsx
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    className={`lucide-icon ${className}`}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// THAY ĐỔI: Icon for Achievements, thay thế SVG bằng hình ảnh từ URL
const TrophyIcon = ({ size = 24, className = '', ...props }) => (
    <img
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/achievement-icon.webp"
        alt="Achievements Icon"
        width={size}
        height={size}
        className={className}
        {...props}
    />
);

// THAY ĐỔI: Icon for Upgrade, thay thế SVG bằng hình ảnh từ game-assets
const UpgradeIcon = ({ size = 24, className = '', ...props }) => (
    <img
        src={uiAssets.upgradeIcon}
        alt="Upgrade Icon"
        width={size}
        height={size}
        className={className}
        {...props}
    />
);

// NEW: Icon for Admin Panel
const DatabaseIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);

// NEW: Icon for Base Building
const BuildingIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <path d="M9 22v-3h6v3"></path>
      <path d="M4 10h16"></path>
    </svg>
);

// NEW: Icon for System Check
const ServerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
        <line x1="6" y1="6" x2="6.01" y2="6"></line>
        <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
);

// THAY ĐỔI: Icon for Miner Challenge, thay thế SVG bằng hình ảnh từ URL
const BombIcon = ({ size = 24, className = '', ...props }) => (
    <img
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/miner-icon.webp"
        alt="Miner Challenge Icon"
        width={size}
        height={size}
        className={className}
        {...props}
    />
);

const HomeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SettingsIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CalendarIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
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

const BellIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const SearchIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ChevronDownIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const FileTextIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const ClipboardIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

const ActivityIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

// THAY ĐỔI: Icon được tải từ game-assets.ts
const AwardIcon = ({ size = 24, className = '', ...props }) => (
  <img
    src={uiAssets.awardIcon}
    alt="Award Icon"
    width={size}
    height={size}
    className={className}
    {...props}
  />
);

// THAY ĐỔI: Icon được tải từ game-assets.ts
const FrameIcon = ({ size = 24, className = '', ...props }) => (
  <img
    src={uiAssets.rankFrameIcon}
    alt="Frame Icon"
    width={size}
    height={size}
    className={className}
    {...props}
  />
);

// THAY ĐỔI: Icon được tải từ game-assets.ts
const LuckyGameIcon = ({ size = 24, className = '', ...props }) => (
  <img
    src={uiAssets.luckyGameIcon}
    alt="Lucky Treasure Icon"
    width={size}
    height={size}
    className={className}
    {...props}
  />
);


// SidebarLayout component including Sidebar and main content area
function SidebarLayout({ children, setToggleSidebar, onShowRank, onShowLuckyGame, onShowAchievements, onShowUpgrade, onShowAdmin, onShowMinerChallenge, onShowBaseBuilding, onShowSystemCheck }: SidebarLayoutProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    if (setToggleSidebar) {
      setToggleSidebar(toggleSidebar);
    }
  }, [setToggleSidebar, toggleSidebar]);

  const menuItems = [
    { id: 'rank', label: 'Rank', icon: FrameIcon, onClick: onShowRank },
    { id: 'luckyGame', label: 'Lucky Treasure', icon: LuckyGameIcon, onClick: onShowLuckyGame },
    { id: 'minerChallenge', label: 'Miner Challenge', icon: BombIcon, onClick: onShowMinerChallenge },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon, onClick: onShowAchievements },
    { id: 'upgrade', label: 'Upgrade', icon: UpgradeIcon, onClick: onShowUpgrade }, // THAY ĐỔI: Sử dụng UpgradeIcon mới
    { id: 'baseBuilding', label: 'Base Building', icon: BuildingIcon, onClick: onShowBaseBuilding },
    { id: 'systemCheck', label: 'System Check', icon: ServerIcon, onClick: onShowSystemCheck },
    { id: 'admin', label: 'Admin Panel', icon: DatabaseIcon, onClick: onShowAdmin }, 
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
                  // Only render the Admin item if the onShowAdmin handler is provided
                  if (item.id === 'admin' && !onShowAdmin) {
                    return null;
                  }
                  // Only render the Upgrade item if the handler is provided
                  if (item.id === 'upgrade' && !onShowUpgrade) {
                    return null;
                  }
                  // NEW: Only render the Base Building item if the handler is provided
                  if (item.id === 'baseBuilding' && !onShowBaseBuilding) {
                      return null;
                  }
                  // NEW: Only render the System Check item if the handler is provided
                  if (item.id === 'systemCheck' && !onShowSystemCheck) {
                      return null;
                  }
                  
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
