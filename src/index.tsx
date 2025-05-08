// src/index.tsx
import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx';
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './profile.tsx';
import Quiz from './stats/reset-points.tsx';
import AuthComponent from './auth.js'; // Đổi tên import Auth để tránh trùng lặp
import { auth } from './firebase.js'; // Import đối tượng auth của Firebase
import { onAuthStateChanged, User } from 'firebase/auth'; // Import onAuthStateChanged và kiểu User

// Định nghĩa các loại tab có thể có
type TabType = 'home' | 'profile' | 'story' | 'quiz';

const App: React.FC = () => {
  // State để theo dõi tab đang hoạt động, mặc định là 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // State để kiểm soát hiển thị của thanh điều hướng
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  // State để lưu thông tin người dùng đã đăng nhập
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // State để xử lý quá trình kiểm tra trạng thái đăng nhập ban đầu
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái xác thực từ Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Cập nhật người dùng hiện tại
      setLoadingAuth(false); // Đã kiểm tra xong trạng thái, không còn loading nữa
    });

    // Cleanup subscription khi component unmount
    return () => unsubscribe();
  }, []);

  // Hàm xử lý thay đổi tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Đảm bảo thanh điều hướng hiển thị khi chuyển tab, trừ khi đó là tab story hoặc home
    if (tab !== 'story' && tab !== 'home') {
      setIsNavBarVisible(true);
    }
    if (tab === 'story' || tab === 'home') {
      setIsNavBarVisible(true);
    }
  };

  // Hàm ẩn thanh điều hướng
  const hideNavBar = () => {
    setIsNavBarVisible(false);
  };

  // Hàm hiển thị thanh điều hướng
  const showNavBar = () => {
    setIsNavBarVisible(true);
  };

  // Trong khi đang kiểm tra trạng thái đăng nhập, có thể hiển thị một loader
  if (loadingAuth) {
    return <div>Đang tải...</div>; // Hoặc một component loading đẹp hơn
  }

  // Nếu không có người dùng nào được xác thực (chưa đăng nhập)
  if (!currentUser) {
    // Hiển thị component AuthComponent để người dùng đăng nhập hoặc đăng ký
    // AuthComponent sẽ tự xử lý việc hiển thị form hoặc thông báo chào mừng (nếu có logic đó)
    return <AuthComponent />;
  }

  // Nếu người dùng đã được xác thực (đã đăng nhập)
  // Hiển thị nội dung chính của ứng dụng
  return (
    <div className="app-container">
      {/* Hiển thị component dựa trên activeTab state */}
      {activeTab === 'home' && (
        <Home hideNavBar={hideNavBar} showNavBar={showNavBar} />
      )}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'story' && (
        <Story hideNavBar={hideNavBar} showNavBar={showNavBar} />
      )}
      {activeTab === 'quiz' && <Quiz />}

      {/* Hiển thị thanh điều hướng dưới cùng nếu isNavBarVisible là true */}
      {isNavBarVisible && (
        <NavigationBarBottom
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
};

// Lấy root element từ HTML
const container = document.getElementById('root');
// Báo lỗi nếu không tìm thấy root element
if (!container) {
  throw new Error('Root element with ID "root" not found in the document.');
}

// Tạo root và render App component
const root = createRoot(container);
root.render(<App />);

export default App;
