import React, { useState, useEffect } from 'react';
// Import the Rank component - REMOVED: Rank is now rendered by the parent
// import EnhancedLeaderboard from './rank.tsx';

// Define prop types for SidebarLayout
interface SidebarLayoutProps {
  children: React.ReactNode;
  // New prop to expose the toggleSidebar function
  setToggleSidebar?: (toggleFn: () => void) => void;
  // NEW props to handle toggling specific screens in the parent
  onShowStats?: () => void; // Handler for showing Stats
  onShowRank?: () => void;   // Handler for showing Rank
  // Add handlers for other menu items that need parent interaction here
  onShowHome?: () => void;
  onShowTasks?: () => void;
  // onShowPerformance?: () => void; // REMOVED: Handler for showing Performance
  onShowSettings?: () => void;
  onShowHelp?: () => void;
  onShowGoldMine?: () => void; // NEW: Handler for showing Gold Mine
  onShowLuckyGame?: () => void; // NEW: Handler for showing Lucky Game
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

const HomeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SettingsIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
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

// Icon for the original Stats menu item
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

// New component for the Frame icon using the provided image URL
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

// NEW: Inline SVG for a pickaxe icon (for Gold Mine)
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

// NEW: Inline SVG for Dice icon (for Lucky Game)
const DiceIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill={color} stroke="none" />
    <circle cx="15.5" cy="8.5" r="1.5" fill={color} stroke="none" />
    <circle cx="8.5" cy="15.5" r="1.5" fill={color} stroke="none" />
    <circle cx="15.5" cy="15.5" r="1.5" fill={color} stroke="none" />
  </svg>
);


// SidebarLayout component including Sidebar and main content area
// Accept new specific handlers for menu items
function SidebarLayout({ children, setToggleSidebar, onShowStats, onShowRank, onShowHome, onShowTasks, onShowSettings, onShowHelp, onShowGoldMine, onShowLuckyGame }: SidebarLayoutProps) {
  // State to track sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  // Removed activeItem and activeContent states

  // State for new notification count
  const [notificationCount, setNotificationCount] = useState(3);
  // State for user menu dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Expose the toggleSidebar function via the prop
  useEffect(() => {
    if (setToggleSidebar) {
      setToggleSidebar(toggleSidebar);
    }
  }, [setToggleSidebar, toggleSidebar]); // Depend on setToggleSidebar and toggleSidebar

  // Function to toggle user menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // List of sidebar menu items - Using new inline SVG components and the new FrameIcon
  const menuItems = [
    // Added onClick handlers calling the specific props
    { id: 'home', label: 'Trang chủ', icon: HomeIcon, onClick: onShowHome },
    { id: 'stats', label: 'Stats', icon: AwardIcon, onClick: onShowStats },
    { id: 'rank', label: 'Rank', icon: FrameIcon, onClick: onShowRank },
    { id: 'goldMine', label: 'Mỏ vàng', icon: PickaxeIcon, onClick: onShowGoldMine },
    { id: 'luckyGame', label: 'Lucky Game', icon: DiceIcon, onClick: onShowLuckyGame }, // NEW: Lucky Game menu item
    { id: 'tasks', label: 'Công việc', icon: ClipboardIcon, badge: 2, onClick: onShowTasks },
    // { id: 'performance', label: 'Hiệu suất', icon: ActivityIcon, onClick: onShowPerformance }, // REMOVED: Performance menu item
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon, onClick: onShowSettings },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircleIcon, onClick: onShowHelp },
  ];


  return (
    // Added overflow-hidden to the main container to prevent body scroll
    <div className="relative h-screen flex bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {/* Overlay when sidebar is visible on mobile */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar} // Clicking overlay calls toggleSidebar to close
        />
      )}

      {/* Sidebar container with fixed positioning */}
      {/* MODIFIED: Changed positioning to fixed and added z-index */}
      <div
        className={`
          fixed left-0 top-0 z-50 h-screen flex items-center
          transform transition-all duration-300 ease-in-out
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 ${isSidebarVisible ? 'md:block' : 'md:hidden'}
        `}
      >
        {/* Floating sidebar with reduced height */}
        <div
          className={`
            flex flex-col w-72 bg-gray-900 shadow-xl rounded-r-2xl
            transition-all duration-300 ease-in-out
            mx-0 mt-16 mb-32 h-[calc(100vh-12rem)]
          `}
        >
          {/* Menu items list */}
          {isSidebarVisible && (
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-0 px-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  // Determine if the item is currently "active" based on which content is being shown in the parent
                  // This requires knowing the parent's state, which is not ideal here.
                  // A simpler approach is to rely on the parent rendering the correct content.
                  // For now, we'll keep a basic active state logic if needed, but it might not perfectly sync.
                  // Let's remove the activeItem state and just use the onClick handler.
                  return (
                    <li key={item.id} className={`${index !== 0 ? 'border-t border-opacity-20 border-gray-700' : ''}`}>
                      <a
                        href="#"
                        className={`
                          flex items-center px-4 py-3 text-sm font-medium
                          transition-all duration-150 ease-in-out group relative
                          mx-1 my-1 rounded-xl
                          ${false // Placeholder for active state, will be handled by parent rendering
                            ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                          }
                        `}
                        onClick={(e) => {
                          e.preventDefault();
                          // Call the specific handler prop if it exists
                          item.onClick?.();
                           // Optionally close the sidebar after clicking an item on mobile
                           if (window.innerWidth < 768) { // Adjust breakpoint as needed
                              toggleSidebar();
                           }
                        }}
                      >
                        <div className={`
                          w-8 h-8 flex items-center justify-center rounded-lg mr-3
                          transition-colors duration-200
                          ${false // Placeholder for active state
                            ? 'bg-blue-600 bg-opacity-80 text-white shadow-inner'
                            : 'bg-gray-800 text-gray-400 group-hover:text-gray-200'
                          }
                        `}>
                          {/* Render the inline SVG icon component or the image icon component */}
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

          {/* User info at the bottom of the sidebar */}
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
                    {/* Use inline SVG for ChevronDown icon */}
                    <ChevronDownIcon size={14} className="text-gray-400" />
                  </div>
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-10">
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-blue-400 flex items-center justify-center mr-2">
                        {/* Use inline SVG for Users icon */}
                        <UsersIcon size={14} />
                      </div>
                      Hồ sơ
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mr-2">
                         {/* Use inline SVG for Settings icon */}
                        <SettingsIcon size={14} />
                      </div>
                      Cài đặt
                    </a>
                    <div className="my-1 border-t border-gray-700"></div>
                    <a href="#" className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-700 text-red-400 flex items-center justify-center mr-2">
                         {/* Use inline SVG for X icon */}
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

      {/* Main content area - Removed md:ml-72 */}
      {/* MODIFIED: Removed ml-0 and md:ml-72 as the sidebar will now overlay */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto
        w-full
      `}>
        {children} {/* Render the content passed from the parent */}
      </div>
    </div>
  );
}

// Export the SidebarLayout component
export { SidebarLayout };
