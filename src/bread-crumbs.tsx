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
    className="mx-0.5" // Đã thay đổi từ mx-1 thành mx-0.5 để giảm khoảng cách
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
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
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
      <span>{label}</span>
    </button>
  );

  // --- Logic để xác định các mục hiển thị ---
  const breadcrumbItems = [];

  // Thêm Home
  breadcrumbItems.push({
    key: 'home',
    content: (
      <button
        onClick={goHome}
        className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-100"
        aria-label="Trang chủ"
      >
        <HomeIcon />
      </button>
    ),
  });

  // Thêm Quiz nếu có
  if (selectedQuiz) {
    breadcrumbItems.push({
      key: 'quiz',
      content: (
        <BreadcrumbItem
          active={isQuizActive}
          onClick={handleQuizBreadcrumbClick}
          label={`Quiz ${selectedQuiz}`}
          colorScheme={{
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            hover: 'hover:bg-blue-200',
            border: 'border-blue-300'
          }}
          animationState={animation.quiz}
        />
      ),
    });
  }

  // Thêm Type nếu có và đang ở view phù hợp
  if (selectedType && currentView !== 'quizTypes') {
    breadcrumbItems.push({
      key: 'type',
      content: (
        <BreadcrumbItem
          active={isTypeActive}
          onClick={handleTypeBreadcrumbClick}
          label={getTypeName()}
          colorScheme={getTypeColorScheme()}
          animationState={animation.type}
        />
      ),
    });
  }

  // Thêm Practice nếu có và đang ở view chi tiết quiz
  if (selectedPractice && currentView === 'quiz') {
    breadcrumbItems.push({
      key: 'practice',
      content: (
        <BreadcrumbItem
          active={true} // Luôn active vì chỉ hiển thị khi đang ở trang chi tiết
          onClick={handlePracticeBreadcrumbClick}
          label={`Practice ${selectedPractice}`}
          colorScheme={{
            bg: 'bg-indigo-100',
            text: 'text-indigo-800',
            hover: 'hover:bg-indigo-200',
            border: 'border-indigo-300'
          }}
          animationState={animation.practice}
        />
      ),
    });
  }

  // Xác định các mục sẽ hiển thị
  const displayedItems = [];
  const totalItems = breadcrumbItems.length;

  if (totalItems <= 3) {
    // Nếu tổng số mục nhỏ hơn hoặc bằng 3, hiển thị tất cả
    displayedItems.push(...breadcrumbItems);
  } else {
    // Nếu tổng số mục từ 4 trở lên, hiển thị Home, dấu ..., và 2 mục cuối
    displayedItems.push(breadcrumbItems[0]); // Home

    // Thêm dấu "..."
    displayedItems.push({
        key: 'ellipsis',
        content: <span className="text-gray-600 mx-1">...</span>,
    });

    // Thêm 2 mục cuối cùng
    displayedItems.push(breadcrumbItems[totalItems - 2]);
    displayedItems.push(breadcrumbItems[totalItems - 1]);
  }
  // --- Kết thúc logic ---


  return (
    <nav className="flex items-center py-3 px-4 bg-white rounded-lg shadow-md mb-4 text-sm">
      <div className="flex items-center flex-wrap gap-2">
        {displayedItems.map((item, index) => (
          <React.Fragment key={item.key}>
            {/* Chỉ hiển thị Chevron nếu không phải là mục đầu tiên và không phải đứng sau dấu "..." */}
            {index > 0 && item.key !== 'ellipsis' && displayedItems[index -1].key !== 'ellipsis' && (
                 <div className="flex items-center text-gray-400">
                    <ChevronRightIcon />
                 </div>
            )}
             {/* Hiển thị Chevron sau dấu "..." */}
            {item.key === 'ellipsis' && index < displayedItems.length -1 && (
                 <div className="flex items-center text-gray-400">
                    <ChevronRightIcon />
                 </div>
            )}
            {item.content}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
