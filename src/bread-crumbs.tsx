import React from 'react';

// Định nghĩa các SVG icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const FileQuestionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
    <path d="M12 17h.01" />
  </svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

// Định nghĩa kiểu cho props
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
  // Hàm xử lý khi click vào breadcrumb Quiz
  const handleQuizBreadcrumbClick = () => {
    setCurrentView('quizTypes');
  };

  // Hàm xử lý khi click vào breadcrumb Practice
  const handlePracticeBreadcrumbClick = () => {
    setCurrentView('practices');
  };

  // Xác định trạng thái active cho các breadcrumb
  const isQuizActive = currentView === 'quizTypes';
  const isTypeActive = currentView === 'practices' || currentView === 'fillInBlanks' || currentView === 'quiz';
  const isPracticeActive = currentView === 'quiz';

  return (
    <nav className="flex items-center py-3 px-4 bg-white rounded-lg shadow-sm mb-4">
      {/* Trang chủ */}
      <div className="flex items-center">
        <button
          onClick={goHome}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
        >
          <HomeIcon />
          <span className="font-medium">Trang chủ</span>
        </button>
      </div>

      {/* Quiz */}
      {selectedQuiz && (
        <>
          <div className="flex items-center mx-2 text-gray-400">
            <ChevronRightIcon />
          </div>
          <div className="flex items-center">
            <button
              onClick={handleQuizBreadcrumbClick}
              className={`flex items-center transition-all duration-200 ${
                isQuizActive 
                  ? 'bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BookOpenIcon />
              <span>Quiz {selectedQuiz}</span>
            </button>
          </div>
        </>
      )}

      {/* Loại bài tập */}
      {selectedType && (
        <>
          <div className="flex items-center mx-2 text-gray-400">
            <ChevronRightIcon />
          </div>
          <div className="flex items-center">
            <span
              className={`flex items-center ${
                isTypeActive
                  ? selectedType === 'tracNghiem'
                    ? 'bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full'
                    : 'bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded-full'
                  : 'text-gray-600'
              }`}
            >
              <FileQuestionIcon />
              <span>{selectedType === 'tracNghiem' ? 'Trắc nghiệm' : 'Điền từ'}</span>
            </span>
          </div>
        </>
      )}

      {/* Practice */}
      {selectedPractice && (currentView === 'practices' || currentView === 'quiz') && (
        <>
          <div className="flex items-center mx-2 text-gray-400">
            <ChevronRightIcon />
          </div>
          <div className="flex items-center">
            <button
              onClick={handlePracticeBreadcrumbClick}
              className={`flex items-center transition-all duration-200 ${
                isPracticeActive
                  ? 'bg-indigo-100 text-indigo-800 font-medium px-3 py-1 rounded-full'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BookIcon />
              <span>Practice {selectedPractice}</span>
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;
