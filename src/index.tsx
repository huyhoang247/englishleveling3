import React, { useState } from 'react';
import { createRoot } from 'react-dom/client'; // Keep createRoot for rendering
import Home from './home.tsx'; // Assuming home.tsx is now Home component
import NavigationBarBottom from './navigation-bar-bottom.tsx'; // Import NavigationBarBottom component
import Profile from './profile.tsx'; 
import Story from './VerticalFlashcardGallery.tsx'; 

// Define the possible tab types
type TabType = 'home' | 'profile' | 'story';

const App: React.FC = () => {
  // Initialize state to keep track of the active tab, default is 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Function to handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      {/* Conditionally render components based on the activeTab state */}
      {activeTab === 'home' && <Home />}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'story' && <Story />}
      

      {/* Render the bottom navigation bar */}
      {/* Pass the active tab and the tab change handler as props */}
      <NavigationBarBottom
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
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
