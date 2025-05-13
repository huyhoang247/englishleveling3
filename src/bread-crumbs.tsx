import React from 'react';
import { ChevronRight, Home, BookOpen, ListChecks, ClipboardList } from 'lucide-react';

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

  // Xác định trạng thái active cho từng breadcrumb
  const isQuizActive = currentView === 'quizTypes';
  const isTypeActive = currentView === 'practices';
  const isPracticeActive = currentView === 'quiz' || currentView === 'fillInBlanks';

  // Helper function để xác định màu sắc cho loại bài tập
  const getTypeColors = () => {
    if (selectedType === 'tracNghiem') {
      return {
        bg: isTypeActive || isPracticeActive ? 'bg-emerald-100' : 'bg-gray-100',
        text: isTypeActive || isPracticeActive ? 'text-emerald-700' : 'text-gray-700',
        hover: 'hover:bg-emerald-200',
        icon: <ListChecks size={16} className="mr-1" />
      };
    } else {
      return {
        bg: isTypeActive || isPracticeActive ? 'bg-amber-100' : 'bg-gray-100',
        text: isTypeActive || isPracticeActive ? 'text-amber-700' : 'text-gray-700',
        hover: 'hover:bg-amber-200',
        icon: <ClipboardList size={16} className="mr-1" />
      };
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-white rounded-lg shadow-sm">
      <ol className="flex items-center flex-wrap gap-1">
        {/* Trang chủ */}
        <li className="flex items-center">
          <button
            onClick={goHome}
            className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <Home size={16} className="mr-1" />
            <span>Trang chủ</span>
          </button>
        </li>

        {/* Quiz */}
        {selectedQuiz && (
          <>
            <li className="flex items-center text-gray-400">
              <ChevronRight size={16} />
            </li>
            <li>
              <button
                onClick={handleQuizBreadcrumbClick}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 
                  ${isQuizActive || isTypeActive || isPracticeActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <BookOpen size={16} className="mr-1" />
                <span>Quiz {selectedQuiz}</span>
              </button>
            </li>
          </>
        )}

        {/* Loại bài tập */}
        {selectedType && (
          <>
            <li className="flex items-center text-gray-400">
              <ChevronRight size={16} />
            </li>
            <li>
              <button 
                onClick={handleQuizBreadcrumbClick}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 
                  ${getTypeColors().bg} ${getTypeColors().text} ${getTypeColors().hover}`}
              >
                {getTypeColors().icon}
                <span>{selectedType === 'tracNghiem' ? 'Trắc nghiệm' : 'Điền từ'}</span>
              </button>
            </li>
          </>
        )}

        {/* Practice */}
        {(currentView === 'practices' || currentView === 'quiz' || currentView === 'fillInBlanks') && selectedPractice && (
          <>
            <li className="flex items-center text-gray-400">
              <ChevronRight size={16} />
            </li>
            <li>
              <button
                onClick={handlePracticeBreadcrumbClick}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 
                  ${isPracticeActive 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span>Practice {selectedPractice}</span>
              </button>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
