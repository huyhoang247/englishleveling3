import React from 'react';

// Định nghĩa icon cho breadcrumb separator
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
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

  // Hàm xử lý khi click vào breadcrumb Loại bài tập
  const handleTypeBreadcrumbClick = () => {
      // Quay lại màn hình chọn loại bài tập (quizTypes)
      setCurrentView('quizTypes');
  };


  // Xác định trạng thái active cho các breadcrumb
  const isQuizActive = currentView === 'quizTypes';
  // Loại bài tập active khi đang ở practices, fillInBlanks, hoặc quiz
  const isTypeActive = currentView === 'practices' || currentView === 'fillInBlanks' || currentView === 'quiz';
  // Practice active khi đang ở màn hình quiz
  const isPracticeActive = currentView === 'quiz';

  return (
    <nav className="flex items-center py-2 px-3 bg-white rounded-lg shadow-sm mb-3 text-sm">
      <div className="flex items-center flex-wrap gap-1">
        {/* Trang chủ */}
        <button
          onClick={goHome}
          className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
        >
          Trang chủ
        </button>

        {/* Quiz */}
        {selectedQuiz && (
          <>
            <div className="flex items-center mx-1 text-gray-400">
              <ChevronRightIcon />
            </div>
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

        {/* Loại bài tập */}
        {selectedType && (
          <>
            <div className="flex items-center mx-1 text-gray-400">
              <ChevronRightIcon />
            </div>
            {/* Thay đổi span thành button và thêm onClick */}
            <button
              onClick={handleTypeBreadcrumbClick} // Thêm sự kiện click
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
