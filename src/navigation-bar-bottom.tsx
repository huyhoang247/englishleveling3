import React, { useState } from "react"; // Import React and useState
import { uiAssets } from "./game-assets.ts";

// Define the props interface for the component
interface NavigationBarBottomProps {
  // activeTab prop to receive the currently active tab ID from the parent component
  activeTab: 'home' | 'quiz' | 'story' | 'game' | 'profile'; // Updated possible values based on the tabs array
  // onTabChange prop to receive a function to call when a tab is clicked
  onTabChange: (tab: 'home' | 'quiz' | 'story' | 'game' | 'profile') => void; // Updated possible values
}

// Define the NavigationBarBottom functional component, receiving the defined props
const NavigationBarBottom: React.FC<NavigationBarBottomProps> = ({
  activeTab, // Destructure activeTab from props
  onTabChange // Destructure onTabChange from props
}) => {
  // Keep the isVisible state and toggle logic if needed for the story tab feature
  const [isVisible, setIsVisible] = useState(true);

  // Define the tabs data
  const tabs = [
    {
      id: "home",
      label: "Trang chủ",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <img
          src={uiAssets.homeIcon}
          alt="Home Icon"
          width={props.size}
          height={props.size}
          // Simulate inactive state by graying out the image
          className={props.color === '#ffffff' ? '' : 'grayscale opacity-70'}
        />
      ),
      gradient: "from-purple-500 to-blue-500"
    },
    {
      id: "quiz",
      label: "Trắc nghiệm",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/course-icon.webp"
          alt="Quiz Icon"
          width={props.size}
          height={props.size}
          // Simulate inactive state by graying out the image
          className={props.color === '#ffffff' ? '' : 'grayscale opacity-70'}
        />
      ),
      gradient: "from-green-500 to-teal-400"
    },
    {
      id: "story",
      label: "Truyện",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <img
          src={uiAssets.storyIcon}
          alt="Story Icon"
          width={props.size}
          height={props.size}
          // Simulate inactive state by graying out the image
          className={props.color === '#ffffff' ? '' : 'grayscale opacity-70'}
        />
      ),
      gradient: "from-amber-500 to-yellow-300"
    },
    {
      id: "game",
      label: "Mini Game",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size}
          height={props.size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={props.color}
          strokeWidth={props.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <line x1="15" y1="13" x2="15" y2="13" />
          <line x1="18" y1="11" x2="18" y2="11" />
          <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
      ),
      gradient: "from-red-500 to-orange-400"
    },
    {
      id: "profile",
      label: "Hồ sơ",
      icon: (props: { size: number; color: string; strokeWidth: number }) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={props.size}
          height={props.size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={props.color}
          strokeWidth={props.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-400"
    },
  ];

  // Hàm xử lý ẩn/hiện thanh điều hướng (kept from original file)
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    // Added z-50 to ensure the navigation bar is on top
    <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center z-50">
      {/* Nút bật tắt thanh điều hướng chỉ hiển thị khi activeTab là 'story' */}
      {activeTab === 'story' && (
        <div
          className="relative flex justify-center"
          onClick={toggleVisibility} // Use toggleVisibility to hide/show the bar
        >
          <div className="absolute -top-3 w-12 h-6 bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-full flex justify-center items-center cursor-pointer shadow-lg border border-gray-800 transform transition-transform duration-300 hover:scale-105">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 glow-sm"></div>
            <div className={`absolute w-6 h-1 bg-white bg-opacity-60 rounded-full transform transition-all duration-300 ${isVisible ? 'rotate-0' : 'rotate-90'}`}></div>
          </div>
        </div>
      )}

      {/* Thanh tab với hiệu ứng ẩn hiện */}
      <div
        className={`bg-black bg-opacity-85 backdrop-blur-md shadow-2xl rounded-t-2xl border-t border-gray-800 w-full
          transition-all duration-300 ease-in-out overflow-hidden
          ${isVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="mx-2 my-2 flex justify-between items-center">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            // Determine if the current tab is active based on the activeTab prop
            const isActive = activeTab === tab.id;

            return (
              <div key={tab.id} className="flex-1 relative flex justify-center items-center">
                <button
                  className="w-full flex flex-col items-center relative group justify-center"
                  // Call the onTabChange prop function when the button is clicked
                  onClick={() => {
                    onTabChange(tab.id); // Notify the parent component of the tab change
                    // When changing tab, if not 'story', ensure the navigation bar is visible
                    if (tab.id !== 'story') {
                      setIsVisible(true);
                    }
                  }}
                >
                  {/* Background glow effect, visible only when active */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl blur-sm
                      transition-opacity duration-300 ease-in-out ${isActive ? 'opacity-15' : 'opacity-0'}`}
                  />

                  {/* Icon container with smooth transition */}
                  <div
                    className={`p-2 rounded-full transition-all duration-300 ease-in-out transform
                      ${isActive ? `bg-gray-500 bg-opacity-30 shadow-lg` : 'bg-transparent'}`} // Apply gray, semi-transparent circular background if active
                  >
                    <Icon
                      size={20}
                      color={isActive ? "#ffffff" : "#9ca3af"} // White color for active icon, gray for inactive
                      strokeWidth={isActive ? 2.5 : 2} // Thicker stroke for active icon
                    />
                  </div>
                  {/* Tab label - optional, uncomment if you want labels */}
                  {/* <span className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {tab.label}
                  </span> */}
                </button>

                {/* Separator line between tabs */}
                {index < tabs.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-800"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom border */}
        <div className="h-1 w-full bg-gray-900"></div>
      </div>

      {/* Custom CSS for the glow effect */}
      <style jsx>{`
        .glow-sm {
          box-shadow: 0 0 8px 1px rgba(59, 130, 246, 0.5); /* Example blue glow */
        }
      `}</style>
    </div>
  );
}

// Export the component
export default NavigationBarBottom;
