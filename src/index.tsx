import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Import Home component (which is background-game.tsx)
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx'; // Import VerticalFlashcardGallery
import Profile from './profile.tsx';
import Quiz from './stats/reset-points.tsx';
import Auth from './auth.js';    // ← import component Auth mới

// Import auth và onAuthStateChanged từ firebase
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';


// Define the possible tab types
type TabType = 'home' | 'profile' | 'story' | 'quiz';

const App: React.FC = () => {
  // Initialize state to keep track of the active tab, default is 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // State to control the visibility of the navigation bar
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  // State để lưu trữ thông tin người dùng đã đăng nhập
  const [user, setUser] = useState<any>(null); // Sử dụng 'any' hoặc định nghĩa type cho user

  // Theo dõi trạng thái đăng nhập của người dùng
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Sau khi có trạng thái user, nếu có user thì chuyển về home, nếu không thì ở lại Auth
      // Bạn có thể tùy chỉnh logic này tùy theo ý muốn
      // if (currentUser) {
      //   setActiveTab('home');
      // } else {
      //   setActiveTab('auth'); // Giả sử bạn có tab 'auth' hoặc giữ nguyên logic hiện tại
      // }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Chạy một lần khi component mount

  // Nếu chưa có người dùng đăng nhập, hiển thị component Auth
  if (!user) {
    return <Auth />;
  }

  // Function to handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Ensure nav bar is visible when changing tabs, unless it's the story or home tab
    // (Story and Home tabs will handle hiding/showing based on their internal state like modals/fullscreen)
    if (tab !== 'story' && tab !== 'home') {
      setIsNavBarVisible(true);
    }
    // For 'home' and 'story', the respective components will manage nav bar visibility
    // based on whether their fullscreen/modal content is active.
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
