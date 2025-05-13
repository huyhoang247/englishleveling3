import React from 'react';

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
    // Quay về màn hình chọn loại bài tập (quizTypes)
    setCurrentView('quizTypes');
  };

  // Hàm xử lý khi click vào breadcrumb Loại bài tập (hiện tại không có link, chỉ là text)
  // Có thể thêm logic nếu muốn click vào đây để quay lại màn hình chọn loại bài tập
  // const handleTypeBreadcrumbClick = () => {
  //   setCurrentView('quizTypes');
  // };

  // Hàm xử lý khi click vào breadcrumb Practice
  const handlePracticeBreadcrumbClick = () => {
     // Quay về màn hình chọn practice
    setCurrentView('practices');
  };


  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Breadcrumb Trang chủ */}
      <button
        onClick={goHome}
        className="text-blue-600 hover:underline"
      >
        Trang chủ
      </button>

      {/* Hiển thị Quiz đã chọn nếu có */}
      {selectedQuiz && (
        <>
          <span className="text-gray-400">/</span>
          {/* Breadcrumb Quiz - có thể click để quay lại màn hình chọn loại */}
          <button
            onClick={handleQuizBreadcrumbClick}
            className={`text-blue-600 hover:underline ${currentView === 'quizTypes' || currentView === 'practices' || currentView === 'fillInBlanks' || currentView === 'quiz' ? 'bg-blue-100 px-2 py-1 rounded-full' : ''}`}
          >
            Quiz {selectedQuiz}
          </button>
        </>
      )}

      {/* Hiển thị Loại bài tập đã chọn nếu có */}
      {selectedType && (
        <>
          <span className="text-gray-400">/</span>
          {/* Breadcrumb Loại bài tập - hiện tại chỉ hiển thị text */}
          {/* Có thể thêm onClick={handleTypeBreadcrumbClick} nếu muốn click vào đây */}
          <span className={`${currentView === 'practices' || currentView === 'fillInBlanks' || currentView === 'quiz' ? (selectedType === 'tracNghiem' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') + ' px-2 py-1 rounded-full' : ''}`}>
            {selectedType === 'tracNghiem' ? 'Trắc nghiệm' : 'Điền từ'}
          </span>

          {/* Chỉ hiển thị dấu '/' và Practice khi ở màn hình practices hoặc quiz VÀ đã chọn practice */}
          {(currentView === 'practices' || currentView === 'quiz') && selectedPractice && (
            <>
              <span className="text-gray-400">/</span>
              {/* Breadcrumb Practice - có thể click để quay lại màn hình chọn practice */}
              <button
                 onClick={handlePracticeBreadcrumbClick}
                 className={`${currentView === 'quiz' ? 'bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full' : ''} text-blue-600 hover:underline`}
              >
                Practice {selectedPractice}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Breadcrumbs;
