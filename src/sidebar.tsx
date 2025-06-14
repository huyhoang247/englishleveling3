// --- START OF FILE sidebar.tsx ---

import React from 'react';

// Define prop types for SidebarLayout
interface SidebarLayoutProps {
  children: React.ReactNode;
  // New prop to expose the toggleSidebar function
  setToggleSidebar?: (toggleFn: () => void) => void;
  // NEW props to handle toggling specific screens in the parent
  onShowStats?: () => void;     // Handler for showing Stats
  onShowRank?: () => void;      // Handler for showing Rank
  onShowGoldMine?: () => void;  // NEW: Handler for showing Gold Mine
  onShowLuckyGame?: () => void; // NEW: Handler for showing Lucky Game
  onShowTowerGame?: () => void; // NEW: Handler for showing Tower Game
  onShowSettings?: () => void;  // FIXED: Added missing prop
  onShowHelp?: () => void;      // FIXED: Added missing prop
}

// SVG Icon Components (Replacement for lucide-react)
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props} >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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

// Icon for Stats
const AwardIcon = ({ size = 24, className = '', ...props }) => (
  <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png" alt="Award Icon" width={size} height={size} className={className} {...props} />
);

// Icon for Rank
const FrameIcon = ({ size = 24, className = '', ...props }) => (
  <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/frame.png" alt="Frame Icon" width={size} height={size} className={className} {...props} />
);

// *** FIXED: Correct and simplified SVG for PickaxeIcon ***
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <path d="M10 12l-2 2 6 6 2-2-6-6z"></path>
      <path d="M12 10V4H8v2h2v4"></path>
  </svg>
);

// Icon for Lucky Game
const LuckyGameIcon = ({ size = 24, className = '', ...props }) => (
  <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/fortune-wheel.png" alt="Lucky Game Icon" width={size} height={size} className={className} {...props} />
);

// *** NEW: Icon for Tower Game ***
const TowerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M22 22H2"></path>
        <path d="M12 2l-2 3h4l-2-3z"></path>
        <path d="M12 15l-2 3h4l-2-3z"></path>
        <path d="M18 10h-5V7h5v3z"></path>
        <path d="M11 10H6V7h5v3z"></path>
        <path d="M18 17h-5v-3h5v3z"></path>
        <path d="M11 17H6v-3h5v3z"></path>
        <path d="M18 22v-2h-5v2h5z"></path>
        <path d="M11 22v-2H6v2h5z"></path>
    </svg>
);


function SidebarLayout({ children, setToggleSidebar, onShowStats, onShowRank, onShowGoldMine, onShowLuckyGame, onShowTowerGame, onShowSettings, onShowHelp }: SidebarLayoutProps) {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  React.useEffect(() => {
    if (setToggleSidebar) {
      setToggleSidebar(() => toggleSidebar);
    }
  }, [setToggleSidebar]);

  // *** FIXED: Added 'Leo Tháp' to the menu and connected all onClick handlers ***
  const menuItems = [
    { id: 'stats', label: 'Stats', icon: AwardIcon, onClick: onShowStats },
    { id: 'rank', label: 'Rank', icon: FrameIcon, onClick: onShowRank },
    { id: 'towerGame', label: 'Leo tháp', icon: TowerIcon, onClick: onShowTowerGame }, // NEW
    { id: 'goldMine', label: 'Mỏ vàng', icon: PickaxeIcon, onClick: onShowGoldMine },
    { id: 'luckyGame', label: 'Lucky Game', icon: LuckyGameIcon, onClick: onShowLuckyGame },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon, onClick: onShowSettings },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircleIcon, onClick: onShowHelp },
  ];

  return (
    <div className="relative h-screen flex bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`fixed left-0 top-0 z-50 h-screen flex items-center transform transition-all duration-300 ease-in-out ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col w-72 bg-gray-900 shadow-xl rounded-r-2xl transition-all duration-300 ease-in-out mx-0 mt-16 mb-32 h-[calc(100vh-12rem)]">
          {isSidebarVisible && (
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-0 px-2">
                {menuItems.map((item, index) => (
                  <li key={item.id} className={`${index !== 0 ? 'border-t border-opacity-20 border-gray-700' : ''}`}>
                    <a
                      href="#"
                      className="flex items-center px-4 py-3 text-sm font-medium transition-all duration-150 ease-in-out group relative mx-1 my-1 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick?.();
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg mr-3 transition-colors duration-200 bg-gray-800 text-gray-400 group-hover:text-gray-200">
                        <item.icon size={18} />
                      </div>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
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
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-blue-400 flex items-center justify-center mr-2"><UsersIcon size={14} /></div>Hồ sơ
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mr-2"><SettingsIcon size={14} /></div>Cài đặt
                    </a>
                    <div className="my-1 border-t border-gray-700"></div>
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-red-400 flex items-center justify-center mr-2"><XIcon size={14} /></div>Đăng xuất
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto w-full">
        {children}
      </div>
    </div>
  );
}

export { SidebarLayout };
// --- END OF FILE sidebar.tsx ---
