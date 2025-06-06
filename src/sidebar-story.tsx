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
// React.memo giúp ngăn chặn việc render lại không cần thiết nếu props không thay đổi.
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

const UsersIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
));

const HelpCircleIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
));

const ChevronDownIcon = React.memo(({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
));

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

// Đối với các icon dạng <img>, React.memo cũng có thể áp dụng nếu chúng được định nghĩa như functional components.
// Tuy nhiên, với cấu trúc hiện tại, chúng là các hàm trả về JSX trực tiếp, nên việc memo hóa component cha (SidebarLayout) là quan trọng hơn.
const AwardIcon = React.memo(({ size = 24, className = '', ...props }) => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png"
    alt="Award Icon"
    width={size}
    height={size}
    className={className}
    {...props}
    loading="lazy" // Thêm lazy loading cho hình ảnh từ network
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
    loading="lazy" // Thêm lazy loading cho hình ảnh từ network
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

const SIDEBAR_WIDTH_CLASS = 'w-72';

// Bọc SidebarLayout trong React.memo
// Điều này sẽ ngăn SidebarLayout render lại nếu các props của nó (children, activeScreen, các hàm onShow...) không thay đổi.
// Quan trọng: Các hàm onShow... truyền từ component cha (VerticalFlashcardGallery) cũng cần được memoized bằng useCallback.
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

  // useCallback để memoize hàm toggleSidebar, tránh tạo lại hàm mới mỗi lần render
  // nếu setToggleSidebar (prop) không thay đổi.
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  useEffect(() => {
    if (setToggleSidebar) {
      // Truyền hàm toggleSidebar đã được memoized lên component cha.
      setToggleSidebar(() => toggleSidebar);
    }
  }, [setToggleSidebar, toggleSidebar]);

  // Dữ liệu menu items có thể được định nghĩa bên ngoài component nếu không phụ thuộc vào props hoặc state
  // hoặc dùng useMemo nếu nó được tính toán dựa trên props/state.
  // Trong trường hợp này, nó là tĩnh, nên không cần useMemo.
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
      <main className="flex-1 flex flex-col overflow-y-auto w-full h-full">
        {children}
      </main>

      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 z-40 ${SIDEBAR_WIDTH_CLASS}
          top-1/2 -translate-y-1/2
          max-h-[95vh] overflow-y-auto rounded-r-2xl 
          bg-gray-900 shadow-xl 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ willChange: 'transform' }} // Gợi ý cho trình duyệt tối ưu hóa transform
        role="navigation"
        aria-label="Main sidebar"
      >
        <nav className="py-4 overflow-y-auto">
          <ul className="space-y-0 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon; // Icon component đã được memoized
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
      </aside>
    </div>
  );
});

// Đặt tên hiển thị cho component đã memoized để dễ debug
SidebarLayout.displayName = 'SidebarLayout';
XIcon.displayName = 'XIcon';
HomeIcon.displayName = 'HomeIcon';
SettingsIcon.displayName = 'SettingsIcon';
UsersIcon.displayName = 'UsersIcon';
HelpCircleIcon.displayName = 'HelpCircleIcon';
ChevronDownIcon.displayName = 'ChevronDownIcon';
ActivityIcon.displayName = 'ActivityIcon';
ClipboardIcon.displayName = 'ClipboardIcon';
AwardIcon.displayName = 'AwardIcon';
FrameIcon.displayName = 'FrameIcon';
PickaxeIcon.displayName = 'PickaxeIcon';


export { SidebarLayout };
