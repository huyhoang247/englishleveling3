import { useState } from "react"; import VerticalFlashcardGallery from "./VerticalFlashcardGallery"; import Profile from "./profile";

export default function BottomNavigationBar() { const [activeTab, setActiveTab] = useState<string>("home"); const [isVisible, setIsVisible] = useState<boolean>(true);

// Định nghĩa các tab của thanh điều hướng const tabs = [ { id: "home", label: "Trang chủ", icon: (props) => ( <svg
xmlns="http://www.w3.org/2000/svg"
width={props.size}
height={props.size}
viewBox="0 0 24 24"
fill="none"
stroke={props.color}
strokeWidth={props.strokeWidth}
strokeLinecap="round"
strokeLinejoin="round"
> <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> <polyline points="9 22 9 12 15 12 15 22" /> </svg> ), gradient: "from-purple-500 to-blue-500" }, { id: "quiz", label: "Trắc nghiệm", icon: (props) => ( <svg
xmlns="http://www.w3.org/2000/svg"
width={props.size}
height={props.size}
viewBox="0 0 24 24"
fill="none"
stroke={props.color}
strokeWidth={props.strokeWidth}
strokeLinecap="round"
strokeLinejoin="round"
> <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /> <circle cx="12" cy="12" r="6" /> </svg> ), gradient: "from-green-500 to-teal-400" }, { id: "story", label: "Truyện", icon: (props) => ( <svg
xmlns="http://www.w3.org/2000/svg"
width={props.size}
height={props.size}
viewBox="0 0 24 24"
fill="none"
stroke={props.color}
strokeWidth={props.strokeWidth}
strokeLinecap="round"
strokeLinejoin="round"
> <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /> <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /> </svg> ), gradient: "from-amber-500 to-yellow-300" }, { id: "game", label: "Mini Game", icon: (props) => ( <svg
xmlns="http://www.w3.org/2000/svg"
width={props.size}
height={props.size}
viewBox="0 0 24 24"
fill="none"
stroke={props.color}
strokeWidth={props.strokeWidth}
strokeLinecap="round"
strokeLinejoin="round"
> <line x1="6" y1="12" x2="10" y2="12" /> <line x1="8" y1="10" x2="8" y2="14" /> <line x1="15" y1="13" x2="15" y2="13" /> <line x1="18" y1="11" x2="18" y2="11" /> <rect x="2" y="6" width="20" height="12" rx="2" /> </svg> ), gradient: "from-red-500 to-orange-400" }, { id: "profile", label: "Hồ sơ", icon: (props) => ( <svg
xmlns="http://www.w3.org/2000/svg"
width={props.size}
height={props.size}
viewBox="0 0 24 24"
fill="none"
stroke={props.color}
strokeWidth={props.strokeWidth}
strokeLinecap="round"
strokeLinejoin="round"
> <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" /> </svg> ), gradient: "from-indigo-500 to-purple-400" }, ];

// Hàm xử lý ẩn/hiện thanh điều hướng const toggleVisibility = () => { setIsVisible(!isVisible); };

return ( <> {/* Render content theo tab */} <div className="flex-1"> {activeTab === "profile" && <Profile />} {activeTab === "story" && <VerticalFlashcardGallery />} </div>

<div className="fixed bottom-0 left-0 right-0 flex flex-col items-center">
    {/* Nút bật tắt thanh điều hướng chỉ hiển thị khi tab 'story' */}
    {activeTab === 'story' && (
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
          const isActive = activeTab === tab.id;

          return (
            <div key={tab.id} className="flex-1 relative flex justify-center items-center">
              <button
                className="w-full flex flex-col items-center relative group justify-center"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'story') {
                    setIsVisible(true);
                  }
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl blur-sm
                    transition-opacity duration-300 ease-in-out ${isActive ? 'opacity-15' : 'opacity-0'}`}
                />

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
              </button>

              {index < tabs.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-800"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-1 w-full bg-gray-900"></div>
    </div>

    <style jsx>{`
      .glow-sm {
        box-shadow: 0 0 8px 1px rgba(59, 130, 246, 0.5);
      }
    `}</style>
  </div>
</>

); }

