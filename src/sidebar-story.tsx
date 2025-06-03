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

// --- SVG Icon Components (Đã được bọc trong React.memo) ---
const XIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
));

const HomeIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
));

const SettingsIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
  </svg>
));

// UsersIcon không được sử dụng trong menuItems, nhưng vẫn giữ lại nếu cần
// const UsersIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
//     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//     <circle cx="9" cy="7" r="4"></circle>
//     <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//     <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//   </svg>
// ));

const HelpCircleIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
));

// ChevronDownIcon không được sử dụng trong menuItems, nhưng vẫn giữ lại nếu cần
// const ChevronDownIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
//     <polyline points="6 9 12 15 18 9"></polyline>
//   </svg>
// ));

const ActivityIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
));

const ClipboardIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
));

const AwardIcon = React.memo(({ size = 24, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
    alt="Award Icon"
    width={size}
    height={size}
    className={className}
    {...props}
    loading="lazy"
  />
));

const FrameIcon = React.memo(({ size = 24, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/frame.png"
    alt="Frame Icon"
    width={size}
    height={size}
    className={className}
    {...props}
    loading="lazy"
  />
));

const PickaxeIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
        <path d="M14.5 6.5l-8 8" />
        <path d="M11.5 3.5L5 10l-2-2 6.5-6.5z" />
        <path d="M14 11l3 3-2 2-3-3z" />
        <path d="M5.5 11.5L2 15l6 6 3.5-3.5L10 16l-4.5-4.5z" />
    </svg>
));
// --- Hết SVG Icon Components ---

const SIDEBAR_WIDTH_CLASS = 'w-72'; // Giữ nguyên chiều rộng sidebar

// Bọc SidebarLayout trong React.memo
const SidebarLayout = React.memo(({
  children,
  setToggleSidebar,
  onShowStats,
  onShowRank,
  onShowHome,
  onShowTasks,
  onShowPerformance,
  onShowSettings,
  onShowHelp,
  onShowGoldMine,
  activeScreen
}: SidebarLayoutProps) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  useEffect(() => {
    if (setToggleSidebar) {
      setToggleSidebar(() => toggleSidebar);
    }
  }, [setToggleSidebar, toggleSidebar]);

  // Sử dụng useMemo cho menuItems nếu các hàm onClick có thể thay đổi,
  // nhưng vì chúng là props, React.memo của SidebarLayout sẽ xử lý.
  // Để đơn giản, định nghĩa trực tiếp nếu không có sự phụ thuộc phức tạp.
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
    <div className="relative h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full h-full">
        {children}
      </main>

      {/* Overlay làm mờ nội dung chính */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 z-40 ${SIDEBAR_WIDTH_CLASS}
          top-0 bottom-0 my-auto 
          max-h-[96vh]  /* Chiều cao tối đa, cách top/bottom một chút */
          overflow-y-auto rounded-r-2xl /* Bo tròn góc phải */
          bg-slate-800/80 backdrop-blur-lg /* Nền mờ hiện đại */
          border-r border-slate-700/50 /* Đường viền phải tinh tế */
          shadow-2xl /* Đổ bóng rõ hơn */
          flex flex-col
          transform transition-transform duration-300 ease-out /* Thay đổi ease-in-out thành ease-out */
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ willChange: 'transform' }}
        role="navigation"
        aria-label="Main sidebar"
      >
        {/* Optional: Sidebar Header (Logo, Title) */}
        <div className="p-6 mb-2 text-center">
          <h2 className="text-xl font-semibold text-white">MENU</h2>
          {/* Bạn có thể thay thế bằng logo: <img src="/logo.svg" alt="Logo" className="h-8 mx-auto" /> */}
        </div>

        {/* Inner Sidebar Content Wrapper */}
        <nav className="flex-grow px-3 pb-4 overflow-y-auto"> {/* Thêm flex-grow và padding */}
          <ul className="space-y-1.5"> {/* Giảm space-y một chút */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <li key={item.id}>
                  <a
                    href="#"
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium
                      rounded-lg group relative
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-sky-600 text-white shadow-md scale-[1.02]' // Nền và chữ cho mục active, hơi phóng to
                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white' // Chữ và nền khi hover
                      }
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      item.onClick?.();
                      toggleSidebar(); 
                    }}
                  >
                    {/* Visual indicator for active item (optional) */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-sky-400 rounded-r-full"></span>
                    )}
                    <div className={`
                      w-9 h-9 flex items-center justify-center rounded-md mr-3
                      transition-all duration-200
                      ${isActive
                        ? 'bg-sky-500/80 text-white' // Nền icon cho mục active
                        : 'bg-slate-700/70 text-slate-400 group-hover:bg-slate-600/80 group-hover:text-slate-200' // Nền icon mặc định và khi hover
                      }
                    `}>
                      <Icon size={18} />
                    </div>
                    <span className="flex-grow">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full
                        ${isActive ? 'bg-white/20 text-white' : 'bg-sky-500/80 text-white'}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Optional: Sidebar Footer (User Profile, Logout) */}
        {/* <div className="mt-auto p-4 border-t border-slate-700/50">
            <div className="flex items-center">
                <img src="https://placehold.co/40x40/E2E8F0/slate-700?text=User" alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <p className="text-sm font-medium text-white">Tên Người Dùng</p>
                    <a href="#" className="text-xs text-slate-400 hover:text-sky-400">Xem hồ sơ</a>
                </div>
            </div>
        </div> */}
      </aside>
    </div>
  );
});

SidebarLayout.displayName = 'SidebarLayout';
XIcon.displayName = 'XIcon';
HomeIcon.displayName = 'HomeIcon';
SettingsIcon.displayName = 'SettingsIcon';
HelpCircleIcon.displayName = 'HelpCircleIcon';
ActivityIcon.displayName = 'ActivityIcon';
ClipboardIcon.displayName = 'ClipboardIcon';
AwardIcon.displayName = 'AwardIcon';
FrameIcon.displayName = 'FrameIcon';
PickaxeIcon.displayName = 'PickaxeIcon';

export { SidebarLayout };
