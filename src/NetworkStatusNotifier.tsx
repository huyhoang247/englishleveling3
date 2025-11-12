// --- START OF FILE src/NetworkStatusNotifier.tsx ---

import React, { useState, useEffect } from 'react';

// === Icon Components (nhúng trực tiếp để không cần file riêng) ===
const WifiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.562A2.25 2.25 0 0112 15a2.25 2.25 0 013.889 1.562l-3.89 1.562a.375.375 0 01-.446 0l-3.89-1.562zM12 12.75a5.25 5.25 0 015.25 5.25v.008l-10.5 0v-.008A5.25 5.25 0 0112 12.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 01-8.25-8.25v-.008l16.5 0v.008A8.25 8.25 0 0112 21z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V4.5A.75.75 0 0112 3.75z" />
  </svg>
);

const NoWifiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 8.288c-.342.342-.647.72-.92 1.122a3.75 3.75 0 000 4.536c.273.402.578.78.92 1.122m7.424-7.424c.342-.342.647-.72.92-1.122a3.75 3.75 0 000-4.536c-.273-.402-.578-.78-.92-1.122m0 0A23.09 23.09 0 0012 5.25c-3.352 0-6.53 1.023-9.212 2.828M12 15.75a3 3 0 01-3-3m0 0c0-1.298.71-2.423 1.788-2.95m1.424 6.138a3 3 0 00-4.212-4.212" />
  </svg>
);


// === Props Interface ===
interface NetworkStatusNotifierProps {
  isOnline: boolean;
  wasOffline: boolean; // Cần biết trạng thái trước đó để chỉ hiện "Back Online" khi cần
}

const NetworkStatusNotifier: React.FC<NetworkStatusNotifierProps> = ({ isOnline, wasOffline }) => {
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị banner "Back Online" nếu trước đó đã offline và bây giờ đã online
    if (isOnline && wasOffline) {
      setShowOnlineBanner(true);
      const timer = setTimeout(() => {
        setShowOnlineBanner(false);
      }, 4000); // Tự động ẩn sau 4 giây

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const isVisible = !isOnline || showOnlineBanner;
  const isOfflineMode = !isOnline;

  const bannerBg = isOfflineMode 
    ? 'bg-gradient-to-b from-gray-900 via-red-950 to-gray-900 border-red-700' 
    : 'bg-gradient-to-b from-gray-800 via-green-950 to-gray-800 border-green-600';
  
  const textAndIconColor = isOfflineMode ? 'text-red-300' : 'text-green-300';

  const message = isOfflineMode 
    ? "No Internet Connection" 
    : "Connection Restored";

  const Icon = isOfflineMode ? NoWifiIcon : WifiIcon;

  return (
    <div
      role="alert"
      className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} text-white font-semibold`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className={`flex items-center justify-center w-full px-4 py-3 border-b ${bannerBg} shadow-lg shadow-black/30`}>
        <Icon className={`w-6 h-6 mr-3 ${textAndIconColor}`} />
        <span className={`${textAndIconColor} tracking-wide text-sm`} style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatusNotifier;
