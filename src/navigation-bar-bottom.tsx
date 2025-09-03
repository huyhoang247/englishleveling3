import React, { useState } from "react"; // Import React and useState

// Define the props interface for the component
interface NavigationBarBottomProps {
  // activeTab prop to receive the currently active tab ID from the parent component
  activeTab: 'home' | 'quiz' | 'story' | 'game' | 'profile'; // Updated possible values based on the tabs array
  // onTabChange prop to receive a function to call when a tab is clicked
  onTabChange: (tab: 'home' | 'quiz' | 'story' | 'game' | 'profile') => void; // Updated possible values
}

// Define the type for an icon, which can be a React component or an image URL string
type IconType = ((props: { size: number; color: string; strokeWidth: number }) => JSX.Element) | string;

// Define the NavigationBarBottom functional component, receiving the defined props
const NavigationBarBottom: React.FC<NavigationBarBottomProps> = ({
  activeTab, // Destructure activeTab from props
  onTabChange // Destructure onTabChange from props
}) => {
  // Keep the isVisible state and toggle logic if needed for the story tab feature
  const [isVisible, setIsVisible] = useState(true);

  // Define the tabs data
  const tabs: { id: 'home' | 'quiz' | 'story' | 'game' | 'profile'; label: string; icon: IconType }[] = [
    {
      id: "home",
      label: "Trang chủ",
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
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "quiz",
      label: "Trắc nghiệm",
      // Use the provided image URL for the quiz icon
      icon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/course-icon.webp",
    },
    {
      id: "story",
      label: "Truyện",
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
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
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
            // Determine if the current tab is active based on the activeTab prop
            const isActive = activeTab === tab.id;

            return (
              <div key={tab.id} className="flex-1 relative flex justify-center items-center">
                <button
                  className="w-full flex flex-col items-center relative group justify-center py-1"
                  // Call the onTabChange prop function when the button is clicked
                  onClick={() => {
                    onTabChange(tab.id); // Notify the parent component of the tab change
                    // When changing tab, if not 'story', ensure the navigation bar is visible
                    if (tab.id !== 'story') {
                      setIsVisible(true);
                    }
                  }}
                >
                  {/* Redesigned uniform background glow effect, visible only when active */}
                  <div
                    className={`absolute inset-0 bg-sky-400 rounded-xl blur-lg
                      transition-opacity duration-300 ease-in-out ${isActive ? 'opacity-20' : 'opacity-0'}`}
                  />

                  {/* Icon container with a new, subtle, and uniform active state */}
                  <div
                    className={`p-2 rounded-full transition-all duration-300 ease-in-out transform
                      ${isActive ? 'bg-sky-500 bg-opacity-20' : 'bg-transparent'}`}
                  >
                    {typeof tab.icon === 'string' ? (
                      // Render an <img> tag if the icon is a URL
                      <img
                        src={tab.icon}
                        alt={tab.label}
                        className={`w-5 h-5 object-contain transition-filter duration-300 ${isActive ? '' : 'filter grayscale'}`}
                      />
                    ) : (
                      // Render the icon as a component if it's a function
                      <tab.icon
                        size={20}
                        color={isActive ? "#0ea5e9" : "#9ca3af"} // A vibrant sky-blue for active, gray for inactive
                        strokeWidth={isActive ? 2.5 : 2} // Thicker stroke for active icon
                      />
                    )}
                  </div>
                  
                  {/* Subtle label that appears only when active */}
                  <span className={`text-xs mt-1 font-medium text-white transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>
                    {tab.label}
                  </span>
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
