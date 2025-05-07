import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx';
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx'; // Import VerticalFlashcardGallery
import Profile from './profile.tsx';
import Quiz from './stats/reset-points.tsx';

// Define the possible tab types
type TabType = 'home' | 'profile' | 'story' | 'quiz';

const App: React.FC = () => {
  // Initialize state to keep track of the active tab, default is 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // State to control the visibility of the navigation bar
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);

  // Function to handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Ensure nav bar is visible when changing tabs, unless it's the story tab
    // (The story tab will handle hiding/showing based on modal state)
    if (tab !== 'story') {
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
      {activeTab === 'home' && <Home />}
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
