import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Import Home component (which is background-game.tsx)
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx'; // Import VerticalFlashcardGallery
import Profile from './profile.tsx';
import Quiz from './stats/reset-points.tsx';
import Auth from './auth.js';    // Import component Auth
import { auth } from './firebase.js'; // Import auth từ firebase để theo dõi trạng thái đăng nhập
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

// Define the possible tab types
type TabType = 'home' | 'profile' | 'story' | 'quiz';

const App: React.FC = () => {
  // State để theo dõi trạng thái đăng nhập của người dùng
  const [user, setUser] = useState(auth.currentUser); // Khởi tạo với trạng thái hiện tại

  // State để theo dõi tab đang hoạt động, mặc định là 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // State để kiểm soát hiển thị của thanh điều hướng
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);

  // Theo dõi thay đổi trạng thái đăng nhập từ Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Khi người dùng đăng nhập thành công, chuyển về tab 'home' (hoặc tab mặc định bạn muốn)
      if (currentUser) {
        setActiveTab('home');
        setIsNavBarVisible(true); // Đảm bảo nav bar hiển thị khi đăng nhập
      }
      // Nếu người dùng đăng xuất, có thể chuyển về tab 'home' và hiển thị Auth form
      // Logic này đã được xử lý bởi việc render có điều kiện bên dưới
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []); // Dependency rỗng để chỉ chạy một lần khi component mount

  // Function to handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Ensure nav bar is visible when changing tabs, unless it's the story or home tab
    // (Story and Home tabs will handle hiding/showing based on their internal state like modals/fullscreen)
    if (tab !== 'story' && tab !== 'home') {
      setIsNavBarVisible(true);
    }
    // When switching *to* 'home' or 'story', we should initially show the nav bar,
    // then the component itself will hide it if its fullscreen/modal is open.
    if (tab === 'story' || tab === 'home') {
         setIsNavBarVisible(true);
    }
  };

  // Function to hide the navigation bar
  const hideNavBar = () => {
    setIsNavBarVisible(false);
  };

  // Function to show the navigation bar
  const showNavBar = () => {
    setIsNavBarVisible(true);
  };

  // Render Auth component if user is not logged in
  if (!user) {
    // Auth component sẽ tự quản lý form đăng nhập/đăng ký và trạng thái lỗi
    return <Auth />;
  }

  // Render main app content if user is logged in
  return (
    <div className="app-container">
      {/* Conditionally render components based on the activeTab state */}
      {activeTab === 'home' && (
         // Pass hideNavBar and showNavBar functions to Home component
         <Home
           hideNavBar={hideNavBar}
           showNavBar={showNavBar}
         />
      )}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'story' && (
        // Pass hideNavBar and showNavBar functions to VerticalFlashcardGallery
        <Story
          hideNavBar={hideNavBar}
          showNavBar={showNavBar}
        />
      )}
      {activeTab === 'quiz' && <Quiz />}

      {/* Render the bottom navigation bar only if isNavBarVisible is true */}
      {isNavBarVisible && (
        <NavigationBarBottom
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
};

// Get the root element from the HTML
const container = document.getElementById('root');
// Throw an error if the root element is not found
if (!container) {
  throw new Error('Root element with ID "root" not found in the document.');
}

// Create a root and render the App component
const root = createRoot(container);
root.render(<App />);

export default App;
