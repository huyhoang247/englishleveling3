import React, { useState, useEffect } from 'react';
// Đã loại bỏ import từ 'lucide-react'

// Định nghĩa các biểu tượng SVG nội tuyến thay thế
const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SettingsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.01-.99 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-.99-1.01 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.01-.99 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82 1.65 1.65 0 0 0 .99 1.01z"></path>
    <line x1="12" y1="2v-2"></line>
    <line x1="12" y1="22v2"></line>
    <line x1="2" y1="12h2"></line>
    <line x1="20" y1="12h2"></line>
    <line x1="17.66" y1="6.34l-1.41 1.41"></line>
    <line x1="6.34" y1="17.66l-1.41 1.41"></line>
    <line x1="17.66" y1="17.66l-1.41-1.41"></line>
    <line x1="6.34" y1="6.34l-1.41-1.41"></line>
  </svg>
);

const MailIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const CalendarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const UsersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const HelpCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const BellIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const SearchIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ZapIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const BarChart2Icon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const FileTextIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const PieChartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
);

const AwardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

const ClipboardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

const ActivityIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);


// Main component
export default function App() {
  return (
    <React.StrictMode>
      <SidebarLayout />
    </React.StrictMode>
  );
}

// SidebarLayout component including Sidebar and main content area
function SidebarLayout() {
  // State to track sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  // State to track the active menu item
  const [activeItem, setActiveItem] = useState('home');
  // State for new notification count
  const [notificationCount, setNotificationCount] = useState(3);
  // State for user menu dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // List of sidebar menu items
  // Sử dụng các component SVG nội tuyến thay vì các biểu tượng từ lucide-react
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: HomeIcon },
    { id: 'analytics', label: 'Phân tích', icon: BarChart2Icon },
    { id: 'mail', label: 'Tin nhắn', icon: MailIcon, badge: 5 },
    { id: 'tasks', label: 'Công việc', icon: ClipboardIcon, badge: 2 },
    { id: 'calendar', label: 'Lịch', icon: CalendarIcon },
    { id: 'reports', label: 'Báo cáo', icon: FileTextIcon },
    { id: 'users', label: 'Người dùng', icon: UsersIcon },
    { id: 'performance', label: 'Hiệu suất', icon: ActivityIcon },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircleIcon },
  ];

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Function to toggle user menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <div className="relative min-h-screen flex bg-gray-100 text-gray-800 font-sans">
      {/* Overlay when sidebar is visible on mobile */}
      {/* Keep overlay so clicking outside can close the sidebar */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar} // Clicking overlay calls toggleSidebar to close
        />
      )}

      {/* Toggle Sidebar Button - Only visible when sidebar is NOT visible */}
      {!isSidebarVisible && (
        <button
          onClick={toggleSidebar} // This button is used to open the sidebar
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-800 shadow-lg text-gray-200 hover:bg-gray-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Hiện sidebar"
          title="Hiện sidebar"
        >
          {/* Always show Menu icon */}
          {/* Sử dụng SVG nội tuyến */}
          <MenuIcon size={20} />
        </button>
      )}


      {/* Sidebar - Dark Theme Style */}
      <div
        className={`
          flex flex-col w-72 h-screen bg-gray-900 shadow-xl
          fixed top-0 left-0 z-40
          transform transition-all duration-300 ease-in-out
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex ${isSidebarVisible ? 'md:w-72' : 'md:w-0 md:hidden'}
        `}
      >
        {/* Search bar in sidebar - REMOVED */}
        {/* "Điều hướng" text - REMOVED */}

        {/* Menu items list */}
        {isSidebarVisible && (
          <nav className="flex-1 py-4 overflow-y-auto">
            {/* Removed "Điều hướng" text */}
            <ul className="space-y-0 px-2">
              {menuItems.map((item, index) => {
                // Sử dụng component SVG được định nghĩa ở trên
                const Icon = item.icon;
                return (
                  <li key={item.id} className={`${index !== 0 ? 'border-t border-opacity-20 border-gray-700' : ''}`}>
                    <a
                      href="#"
                      className={`
                        flex items-center px-4 py-3 text-sm font-medium
                        transition-all duration-150 ease-in-out group relative
                        mx-1 my-1 rounded-xl
                        ${activeItem === item.id
                          ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveItem(item.id);
                      }}
                    >
                      <div className={`
                        w-8 h-8 flex items-center justify-center rounded-lg mr-3
                        transition-colors duration-200
                        ${activeItem === item.id
                          ? 'bg-blue-600 bg-opacity-80 text-white shadow-inner'
                          : 'bg-gray-800 text-gray-400 group-hover:text-gray-200'
                        }
                      `}>
                        {/* Render component SVG */}
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
                  {/* Sử dụng SVG nội tuyến */}
                  <ChevronDownIcon size={14} className="text-gray-400" />
                </div>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-10">
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-blue-400 flex items-center justify-center mr-2">
                      {/* Sử dụng SVG nội tuyến */}
                      <UsersIcon size={14} />
                    </div>
                    Hồ sơ
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mr-2">
                       {/* Sử dụng SVG nội tuyến */}
                      <SettingsIcon size={14} />
                    </div>
                    Cài đặt
                  </a>
                  <div className="my-1 border-t border-gray-700"></div>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-red-400 flex items-center justify-center mr-2">
                       {/* Sử dụng SVG nội tuyến */}
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

      {/* Main content area */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarVisible ? 'md:ml-72' : 'ml-0'} {/* Maintain spacing based on sidebar visibility */}
      `}>
        {/* Top Header Bar */}
        <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-800">
              {menuItems.find(item => item.id === activeItem)?.label || 'Trang chủ'}
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Beta</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search bar in header - hidden on mobile */}
            <div className="hidden md:flex relative">
              {/* Sử dụng SVG nội tuyến */}
              <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg text-sm bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Notification button */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              {/* Sử dụng SVG nội tuyến */}
              <BellIcon size={20} className="text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main content - Kept empty */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Main content removed */}
        </main>

        {/* Footer - Kept footer */}
        <footer className="bg-white border-t border-gray-100 py-4 px-6">
          <div className="text-center text-sm text-gray-500">
            © 2025 DASHPRO. Tất cả các quyền được bảo lưu.
          </div>
        </footer>
      </div>
    </div>
  );
}
