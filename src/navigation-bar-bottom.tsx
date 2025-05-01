import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon: React.FC;
  gradient: string;
}

export default function BottomNavigationBar() {
  const [activeTab, setActiveTab] = useState("home");
  const [isVisible, setIsVisible] = useState(true);

  const tabs: Tab[] = [
    { id: "home", label: "Trang chủ", icon: HomeIcon, gradient: "from-purple-500 to-blue-500" },
    { id: "quiz", label: "Trắc nghiệm", icon: QuizIcon, gradient: "from-green-500 to-teal-400" },
    { id: "story", label: "Truyện", icon: StoryIcon, gradient: "from-amber-500 to-yellow-300" },
    { id: "game", label: "Mini Game", icon: GameIcon, gradient: "from-red-500 to-orange-400" },
    { id: "profile", label: "Hồ sơ", icon: ProfileIcon, gradient: "from-indigo-500 to-purple-400" },
  ];

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Toggle button example */}
      <button onClick={toggleVisibility} className="fixed bottom-16 right-4 p-2 rounded-full bg-gray-200">
        {isVisible ? 'Hide' : 'Show'}
      </button>

      {isVisible && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t py-2 px-4 flex justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const baseClasses = "flex-1 flex flex-col items-center justify-center rounded-lg py-1";
            const activeClasses = isActive ? `bg-gradient-to-tr text-white ${tab.gradient}` : "text-gray-600";
            const classNames = [baseClasses, activeClasses].join(' ');

            return (
              <button
                key={tab.id}
                className={classNames}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}

// Example placeholder icons
const HomeIcon: React.FC = () => <div className="w-6 h-6 bg-gray-300 rounded" />;
const QuizIcon: React.FC = () => <div className="w-6 h-6 bg-gray-300 rounded" />;
const StoryIcon: React.FC = () => <div className="w-6 h-6 bg-gray-300 rounded" />;
const GameIcon: React.FC = () => <div className="w-6 h-6 bg-gray-300 rounded" />;
const ProfileIcon: React.FC = () => <div className="w-6 h-6 bg-gray-300 rounded" />;
