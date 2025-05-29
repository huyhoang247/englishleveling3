import React, { useState, useEffect, useCallback } from 'react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  setToggleSidebar?: (toggleFn: () => void) => void;
  onShowStats?: () => void;
  onShowRank?: () => void;
  onShowHome?: () => void;
  onShowTasks?: () => void;
  onShowPerformance?: () => void;
  onShowSettings?: () => void;
  onShowHelp?: () => void;
  onShowGoldMine?: () => void;
  activeScreen: string;
}

// SVG Icon Components (Giữ nguyên như bạn cung cấp)
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
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
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

const ActivityIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const ClipboardIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
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
    {/* Using a simpler pickaxe icon for brevity and clarity */}
    <path d="M14.5 6.5l-8 8"></path>
    <path d="M11.5 3.5L5 10l-2-2 6.5-6.5z"></path>
    <path d="M14 11l3 3-2 2-3-3z"></path>
    <path d="M5.5 11.5L2 15l6 6 3.5-3.5L10 16l-4.5-4.5z"></path>
  </svg>
);


function SidebarLayout({ children, setToggleSidebar, onShowStats, onShowRank, onShowHome, onShowTasks, onShowPerformance, onShowSettings, onShowHelp, onShowGoldMine, activeScreen }: SidebarLayoutProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  useEffect(() => {
    if (setToggleSidebar) {
      setToggleSidebar(toggleSidebar);
    }
  }, [setToggleSidebar]); // Giữ nguyên dependency array này là tốt nhất

  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
  };

  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: HomeIcon, onClick: onShowHome },
    { id: 'stats', label: 'Stats', icon: AwardIcon, onClick: onShowStats },
    { id: 'rank', label: 'Rank', icon: FrameIcon, onClick: onShowRank },
    { id: 'goldMine', label: 'Mỏ vàng', icon: PickaxeIcon, onClick: onShowGoldMine },
    { id: 'tasks', label: 'Công việc', icon: ClipboardIcon, badge: 2, onClick: onShowTasks },
    { id: 'performance', label: 'Hiệu suất', icon: ActivityIcon, onClick: onShowPerformance },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon, onClick: onShowSettings },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircleIcon, onClick: onShowHelp },
  ];

  return (
    <div className="relative h-screen flex bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {/* Overlay for mobile when sidebar is open (hoặc mọi kích thước màn hình nếu isSidebarVisible) */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 transition-opacity duration-300 md:hidden" // md:hidden giữ overlay chỉ cho mobile nếu muốn, hoặc bỏ đi nếu muốn overlay cả trên desktop
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container - Đã cập nhật class */}
      {/*
        - Sidebar giờ đây sẽ là 'fixed' trên mọi kích thước màn hình.
        - Vị trí của nó (trong/ngoài màn hình) được kiểm soát hoàn toàn bởi 'isSidebarVisible'.
        - Class 'w-72' được áp dụng trực tiếp để sidebar luôn có chiều rộng này khi hiển thị.
      */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-screen w-72 
          transform transition-transform duration-300 ease-in-out
          bg-gray-900 shadow-xl rounded-r-2xl 
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Inner Sidebar Content Wrapper - không cần 'w-72' ở đây nữa nếu đã đặt ở trên, nhưng giữ lại cũng không sao */}
        <div
          className={`
            flex flex-col w-full h-full 
            overflow-y-auto 
            rounded-r-2xl 
          `}
        >
          {/* Menu items list */}
          <nav className="flex-1 py-4">
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
                        ${activeScreen === item.id
                          ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick?.();
                        // Luôn đóng sidebar sau khi click item, bất kể kích thước màn hình
                        // vì giờ đây sidebar có thể đóng/mở trên mọi kích thước.
                        toggleSidebar();
                      }}
                    >
                      <div className={`
                        w-8 h-8 flex items-center justify-center rounded-lg mr-3
                        transition-colors duration-200
                        ${activeScreen === item.id
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

          {/* User info at the bottom of the sidebar */}
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

              {/* User dropdown menu */}
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
        </div>
      </div>

      {/* Main content area - Đã cập nhật class */}
      {/*
        - Margin bên trái của nội dung chính giờ đây sẽ thay đổi dựa trên 'isSidebarVisible'
          cho TẤT CẢ các kích thước màn hình.
        - Sử dụng 'transition-margin-left' để có hiệu ứng mượt mà hơn cho margin.
      */}
      <div className={`
        flex-1 flex flex-col overflow-y-auto
        transition-all duration-300 ease-in-out 
        ${isSidebarVisible ? 'ml-0 sm:ml-72' : 'ml-0'} 
        // Nếu muốn sidebar KHÔNG đẩy nội dung trên mobile (mà đè lên), thì chỉ cần ml-72 cho sm trở lên.
        // Nếu muốn sidebar LUÔN đẩy nội dung khi mở: ${isSidebarVisible ? 'ml-72' : 'ml-0'}
        // Hiện tại: trên mobile (<sm) sidebar sẽ đè lên nội dung, từ sm trở lên sẽ đẩy nội dung.
      `}>
        {children}
      </div>
    </div>
  );
}

export { SidebarLayout };
