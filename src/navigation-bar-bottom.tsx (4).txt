import { useState } from "react";
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation

// Import các component cần hiển thị (These imports are likely not needed here anymore
// as content rendering moves to routing, but keeping them for context)
// import Profile from './profile.tsx';
// import VerticalFlashcardGallery from './VerticalFlashcardGallery.tsx';

export default function BottomNavigationBar() {
  // Use useLocation to get the current path
  const location = useLocation();

  // Keep isVisible state for the bar's visibility feature
  const [isVisible, setIsVisible] = useState(true);

  // Định nghĩa các tab của thanh điều hướng
  const tabs = [
    {
      id: "flashcards", // Changed id to match the suggested path
      label: "Flashcards", // Changed label to match the suggested path
      path: "/flashcards", // Add path for routing
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
          {/* Replace with your Flashcards icon SVG */}
          <rect x="3" y="7" width="18" height="14" rx="2" ry="2"></rect>
          <line x1="12" y1="11" x2="12" y2="17"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
      ),
      gradient: "from-purple-500 to-blue-500"
    },
    {
      id: "quiz",
      label: "Trắc nghiệm",
      path: "/quiz", // Add path for routing
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <circle cx="12" cy="12" r="6" />
        </svg>
      ),
      gradient: "from-green-500 to-teal-400"
    },
    {
      id: "story",
      label: "Truyện",
      path: "/story", // Add path for routing
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
      gradient: "from-amber-500 to-yellow-300"
    },
    {
      id: "game",
      label: "Mini Game",
      path: "/game", // Add path for routing
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
      path: "/profile", // Add path for routing
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

  // Hàm xử lý ẩn/hiện thanh điều hướng (giữ nguyên logic cũ)
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Determine if the current path matches a tab's path
  // Special handling for the flashcards/home tab
  const isActiveTab = (path: string) => {
      if (path === "/flashcards") {
          return location.pathname === "/flashcards" || location.pathname === "/";
      }
      return location.pathname === path;
  };


  return (
    // Using a flex container for layout, but content rendering
    // should ideally be handled by routing outside this component.
    // Keeping the flex structure for the bottom bar positioning.
    <div className="flex flex-col h-screen">
      {/*
        Content rendering based on activeTab state is removed.
        Content should be rendered by your router setup.
        Example:
        <div className="flex-grow overflow-y-auto">
           <Routes>
             <Route path="/" element={<VerticalFlashcardGallery />} /> // Assuming / is flashcards/home
             <Route path="/flashcards" element={<VerticalFlashcardGallery />} />
             <Route path="/profile" element={<Profile />} />
             {/* Add other routes here }
           </Routes>
        </div>
      */}
      {/* Placeholder for content area */}
      <div className="flex-grow overflow-y-auto p-4">
          {/* Content will be rendered here by your router */}
          <p>Content area (rendered by router)</p>
      </div>


      {/* Thanh điều hướng cố định ở dưới cùng */}
      <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center">
        {/* Nút bật tắt thanh điều hướng chỉ hiển thị khi activeTab là 'story' */}
        {/* Check if the current path is '/story' to show the toggle button */}
        {location.pathname === '/story' && (
          <div
            className="relative flex justify-center"
            onClick={toggleVisibility}
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
              // Determine active state based on current location
              const isActive = isActiveTab(tab.path);

              return (
                // Use Link component for navigation
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="flex-1 relative flex justify-center items-center group" // Added group class for potential hover effects
                >
                  {/* Hiệu ứng phát sáng nền luôn hiện nhưng chỉ hiển thị khi active */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl blur-sm
                      transition-opacity duration-300 ease-in-out ${isActive ? 'opacity-15' : 'opacity-0'}`}
                  />

                  {/* Container icon với hiệu ứng chuyển động mượt mà */}
                  <div
                    className={`p-2 rounded-full transition-all duration-300 ease-in-out transform
                      ${isActive ? `bg-gradient-to-br ${tab.gradient} shadow-lg` : 'bg-transparent'}`}
                  >
                    <Icon
                      size={20}
                      color={isActive ? "#ffffff" : "#9ca3af"}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>

                   {/* Tab label - optional, can be added below icon */}
                   {/* <div className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                       {tab.label}
                   </div> */}
                </Link>
              );
            })}
          </div>

          <div className="h-1 w-full bg-gray-900"></div>
        </div>

        {/* Thêm CSS tùy chỉnh cho hiệu ứng phát sáng */}
        <style jsx>{`
          .glow-sm {
            box-shadow: 0 0 8px 1px rgba(59, 130, 246, 0.5);
          }
        `}</style>
      </div>
    </div>
  );
}
