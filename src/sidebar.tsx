import React, { useState, useEffect } from 'react';
import {
  Home, Settings, Mail, Calendar, Users, HelpCircle,
  Menu, X, Bell, Search, ChevronDown, Zap, BarChart2,
  FileText, PieChart, Award, Clipboard, Activity
} from 'lucide-react';

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
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'analytics', label: 'Phân tích', icon: BarChart2 },
    { id: 'mail', label: 'Tin nhắn', icon: Mail, badge: 5 },
    { id: 'tasks', label: 'Công việc', icon: Clipboard, badge: 2 },
    { id: 'calendar', label: 'Lịch', icon: Calendar },
    { id: 'reports', label: 'Báo cáo', icon: FileText },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'performance', label: 'Hiệu suất', icon: Activity },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircle },
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
          <Menu size={20} />
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
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-10">
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-blue-400 flex items-center justify-center mr-2">
                      <Users size={14} />
                    </div>
                    Hồ sơ
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mr-2">
                      <Settings size={14} />
                    </div>
                    Cài đặt
                  </a>
                  <div className="my-1 border-t border-gray-700"></div>
                  <a href="#" className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 text-red-400 flex items-center justify-center mr-2">
                      <X size={14} />
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
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg text-sm bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Notification button */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
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
