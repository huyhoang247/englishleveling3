import React from 'react';

// Define icon for breadcrumb separator
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Define Home icon using SVG
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);


// Define type for props
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
  // Function to handle click on Quiz breadcrumb
  const handleQuizBreadcrumbClick = () => {
    setCurrentView('quizTypes');
  };

  // Function to handle click on Practice breadcrumb
  const handlePracticeBreadcrumbClick = () => {
    // Navigate to 'practices' only if not currently on the practice detail screen ('quiz')
    if (currentView !== 'quiz') {
      setCurrentView('practices');
    } else {
      // If currently on the practice detail screen ('quiz'), clicking the Practice breadcrumb
      // will navigate back to the list of practices.
      setCurrentView('practices');
    }
  };

  // Function to handle click on Exercise Type breadcrumb
  const handleTypeBreadcrumbClick = () => {
      // Navigate to the list screen based on the selected type
      if (selectedType === 'tracNghiem') {
          setCurrentView('practices'); // Assuming 'practices' is the multiple choice list screen
      } else {
          setCurrentView('fillInBlanks'); // Assuming 'fillInBlanks' is the fill-in-the-blanks list screen
      }
  };


  // Determine active state for breadcrumbs
  const isQuizActive = currentView === 'quizTypes';
  // Exercise type is active when in practices or fillInBlanks, NOT active when in quiz
  const isTypeActive = currentView === 'practices' || currentView === 'fillInBlanks'; // Corrected
  // Practice is active when on the quiz screen (practice detail)
  const isPracticeActive = currentView === 'quiz'; // Corrected

  return (
    <nav className="flex items-center py-2 px-3 bg-white rounded-lg shadow-sm mb-3 text-sm">
      <div className="flex items-center flex-wrap gap-1">
        {/* Home Page - Replaced with Home icon */}
        <button
          onClick={goHome}
          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded" // Added padding and slight rounding for click area
          aria-label="Trang chủ" // Added aria-label for screen readers
        >
          <HomeIcon /> {/* Using HomeIcon component */}
        </button>

        {/* Quiz */}
        {selectedQuiz && (
          <>
            <div className="flex items-center mx-1 text-gray-400">
              <ChevronRightIcon />
            </div>
            {/* Button cho Quiz - Sử dụng lớp transition-all duration-200 của Tailwind */}
            <button
              onClick={handleQuizBreadcrumbClick}
              className={`transition-all duration-200 ${
                isQuizActive
                  ? 'bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Quiz {selectedQuiz}
            </button>
          </>
        )}

        {/* Exercise Type */}
        {selectedType && (
          <>
            <div className="flex items-center mx-1 text-gray-400">
              <ChevronRightIcon />
            </div>
            {/* Button cho Loại bài tập - Sử dụng lớp transition-all duration-200 của Tailwind */}
            <button
              onClick={handleTypeBreadcrumbClick} // Added click event
              className={`transition-all duration-200 ${
                isTypeActive
                  ? selectedType === 'tracNghiem'
                    ? 'bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full'
                    : 'bg-yellow-100 text-yellow-800 font-medium px-2 py-0.5 rounded-full'
                  : 'text-gray-600 hover:text-blue-600' // Thêm hover state
              }`}
            >
              {selectedType === 'tracNghiem' ? 'Trắc nghiệm' : 'Điền từ'}
            </button>
          </>
        )}

        {/* Practice */}
        {selectedPractice && (currentView === 'practices' || currentView === 'quiz') && (
          <>
            <div className="flex items-center mx-1 text-gray-400">
              <ChevronRightIcon />
            </div>
            {/* Button cho Practice - Sử dụng lớp transition-all duration-200 của Tailwind */}
            <button
              onClick={handlePracticeBreadcrumbClick}
              className={`transition-all duration-200 ${
                isPracticeActive
                  ? 'bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded-full'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Practice {selectedPractice}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumbs;

