import React, { useState, useEffect } from 'react';

// Improved Chevron Icon with better sizing and styling
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-1"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Enhanced Home Icon
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-1"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// New quiz icon
const QuizIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-1"
  >
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
    <path d="M12 8v4l3 3"></path>
  </svg>
);

// New type icon
const TypeIcon = ({type}) => {
  // Different icon based on type
  if (type === 'tracNghiem') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
      >
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    );
  } else {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
      >
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    );
  }
};

// New practice icon
const PracticeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-1"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

// Define props interface
interface BreadcrumbsProps {
  currentView: string;
  selectedQuiz: number | null;
  selectedType: string | null;
  selectedPractice: number | null;
  goHome: () => void;
  setCurrentView: (view: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentView,
  selectedQuiz,
  selectedType,
  selectedPractice,
  goHome,
  setCurrentView,
}) => {
  // Add animation state
  const [animation, setAnimation] = useState({
    quiz: false,
    type: false,
    practice: false
  });

  // Reset animation after it plays
  useEffect(() => {
    if (animation.quiz || animation.type || animation.practice) {
      const timer = setTimeout(() => {
        setAnimation({ quiz: false, type: false, practice: false });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animation]);

  // Handler for Quiz breadcrumb click
  const handleQuizBreadcrumbClick = () => {
    setAnimation({ ...animation, quiz: true });
    setCurrentView('quizTypes');
  };

  // Handler for Type breadcrumb click
  const handleTypeBreadcrumbClick = () => {
    setAnimation({ ...animation, type: true });

    // Khi quay về danh sách theo loại, cần reset selectedPractice để breadcrumb không hiển thị practice nữa
    if (selectedType === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      setCurrentView('fillInBlanks');
    }
  };

  // Handler for Practice breadcrumb click
  const handlePracticeBreadcrumbClick = () => {
    setAnimation({ ...animation, practice: true });

    // Nếu đang ở màn hình chi tiết practice (quiz), không cần chuyển đi đâu cả
    // vì người dùng đã đang ở practice đúng rồi
    if (currentView === 'quiz') {
      // Không làm gì cả hoặc có thể thêm thông báo nhỏ cho biết đã ở đúng practice
      return;
    }
    // Nếu không phải đang ở quiz, thì chuyển về practices
    else {
      setCurrentView('practices');
    }
  };

  // Determine active states for breadcrumbs
  const isQuizActive = currentView === 'quizTypes';
  const isTypeActive = currentView === 'practices' || currentView === 'fillInBlanks';

  // Get type name for display
  const getTypeName = () => {
    return selectedType === 'tracNghiem' ? 'Trắc nghiệm' : 'Điền từ';
  };

  // Get type color scheme
  const getTypeColorScheme = () => {
    if (selectedType === 'tracNghiem') {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        hover: 'hover:bg-green-200',
        border: 'border-green-300'
      };
    } else {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        hover: 'hover:bg-yellow-200',
        border: 'border-yellow-300'
      };
    }
  };

  // Reusable breadcrumb item component
  const BreadcrumbItem = ({
    active,
    onClick,
    label,
    icon,
    colorScheme = {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      hover: 'hover:bg-blue-200',
      border: 'border-blue-300'
    },
    animationState = false
  }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center transition-all duration-200 border
        ${active
          ? `${colorScheme.bg} ${colorScheme.text} font-medium px-3 py-1 rounded-full border-${colorScheme.border}`
          : 'text-gray-600 hover:text-blue-700 px-2 py-0.5 border-transparent hover:bg-gray-100 rounded'}
        ${animationState ? 'scale-105' : ''}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <nav className="flex items-center py-3 px-4 bg-white rounded-lg shadow-md mb-4 text-sm">
      <div className="flex items-center flex-wrap gap-2">
        {/* Home Button */}
        <button
          onClick={goHome}
          className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-100"
          aria-label="Trang chủ"
        >
          <HomeIcon />
          <span className="font-medium">Trang chủ</span>
        </button>

        {/* Quiz */}
        {selectedQuiz && (
          <>
            <div className="flex items-center text-gray-400">
              <ChevronRightIcon />
            </div>
            <BreadcrumbItem
              active={isQuizActive}
              onClick={handleQuizBreadcrumbClick}
              label={`Quiz ${selectedQuiz}`}
              icon={<QuizIcon />}
              colorScheme={{
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                hover: 'hover:bg-blue-200',
                border: 'border-blue-300'
              }}
              animationState={animation.quiz}
            />
          </>
        )}

        {/* Type - Cập nhật điều kiện hiển thị */}
        {selectedType && currentView !== 'quizTypes' && (
          <>
            <div className="flex items-center text-gray-400">
              <ChevronRightIcon />
            </div>
            <BreadcrumbItem
              active={isTypeActive}
              onClick={handleTypeBreadcrumbClick}
              label={getTypeName()}
              icon={<TypeIcon type={selectedType} />}
              colorScheme={getTypeColorScheme()}
              animationState={animation.type}
            />
          </>
        )}

        {/* Practice - Chỉ hiển thị khi đang ở trang chi tiết (quiz) */}
        {selectedPractice && currentView === 'quiz' && (
          <>
            <div className="flex items-center text-gray-400">
              <ChevronRightIcon />
            </div>
            <BreadcrumbItem
              active={true} // Luôn active vì chỉ hiển thị khi đang ở trang chi tiết
              onClick={handlePracticeBreadcrumbClick}
              label={`Practice ${selectedPractice}`}
              icon={<PracticeIcon />}
              colorScheme={{
                bg: 'bg-indigo-100',
                text: 'text-indigo-800',
                hover: 'hover:bg-indigo-200',
                border: 'border-indigo-300'
              }}
              animationState={animation.practice}
            />
          </>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
