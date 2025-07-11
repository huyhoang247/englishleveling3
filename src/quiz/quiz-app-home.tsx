import { useState } from 'react';
// Import component QuizApp từ file quiz.tsx
import QuizApp from './quiz.tsx';
// Import component Breadcrumbs mới tạo
import Breadcrumbs from '../bread-crumbs.tsx';
// Import component VocabularyGame từ fill-word-home.tsx
import VocabularyGame from '../fill-word/fill-word-home.tsx'; // Import VocabularyGame

export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  // Thêm state mới để lưu practice đã chọn
  const [selectedPractice, setSelectedPractice] = useState(null);

  // Hàm xử lý khi chọn Quiz
  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setSelectedType(null); 
    setSelectedPractice(null);
  };

  // Hàm xử lý khi chọn loại (Trắc nghiệm hoặc Điền từ)
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      // Sửa lại để trỏ đúng view cho game điền từ
      setCurrentView('fillInBlanks');
    }
    setSelectedPractice(null);
  };

  // Hàm xử lý khi chọn Practice
  const handlePracticeSelect = (practice) => {
    setCurrentView('quiz');
    setSelectedPractice(practice);
  };

  // Hàm quay lại màn hình trước
  const goBack = () => {
    if (currentView === 'quizTypes') {
      setCurrentView('main');
      setSelectedQuiz(null);
      setSelectedType(null);
      setSelectedPractice(null);
    } else if (currentView === 'practices' || currentView === 'fillInBlanks') {
      setCurrentView('quizTypes');
      setSelectedType(null);
      setSelectedPractice(null);
    } else if (currentView === 'quiz') {
       setCurrentView('practices');
    }
  };

  // Hàm quay về màn hình chính
  const goHome = () => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  };

  // Render nội dung tùy thuộc vào view hiện tại
  const renderContent = () => {
    switch(currentView) {
      case 'main':
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Quiz App</h1>
              <p className="text-gray-600 mt-2">Chọn bộ quiz để bắt đầu học tập</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleQuizSelect(1)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white py-6 px-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium flex flex-col items-center"
              >
                <span className="text-3xl mb-2">📚</span>
                <span className="text-lg">Quiz 1</span>
                <span className="text-xs text-blue-100 mt-1">10 câu hỏi</span>
              </button>
              <button
                onClick={() => handleQuizSelect(2)}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white py-6 px-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium flex flex-col items-center"
              >
                <span className="text-3xl mb-2">🧠</span>
                <span className="text-lg">Quiz 2</span>
                <span className="text-xs text-purple-100 mt-1">8 câu hỏi</span>
              </button>
            </div>
          </div>
        );

      // --- PHẦN GIAO DIỆN HÌNH THỨC LUYỆN TẬP ĐƯỢC NÂNG CẤP ---
      case 'quizTypes':
        return (
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Chọn Hình Thức Luyện Tập</h2>
              <p className="mt-2 text-md text-gray-600">Thử thách kiến thức của bạn theo cách bạn muốn.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              {/* Lựa chọn 1: Trắc nghiệm */}
              <button
                onClick={() => handleTypeSelect('tracNghiem')}
                className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="mb-5 bg-blue-100 p-4 rounded-full transition-all duration-300 group-hover:bg-blue-500 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 transition-colors duration-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Trắc Nghiệm</h3>
                <p className="text-gray-500 text-sm px-2">Chọn đáp án đúng từ các lựa chọn có sẵn.</p>
              </button>

              {/* Lựa chọn 2: Điền từ */}
              <button
                onClick={() => handleTypeSelect('dienTu')}
                className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="mb-5 bg-purple-100 p-4 rounded-full transition-all duration-300 group-hover:bg-purple-500 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500 transition-colors duration-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Điền Từ</h3>
                <p className="text-gray-500 text-sm px-2">Hoàn thành câu bằng cách điền từ còn thiếu.</p>
              </button>
            </div>
          </div>
        );

      case 'practices':
        return (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Chọn bài tập</h1>

            <div className="space-y-4 w-full">
              <button
                onClick={() => handlePracticeSelect(1)}
                className="w-full bg-white border border-gray-200 hover:border-indigo-300 py-4 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group"
              >
                <div className="flex items-center">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 group-hover:bg-indigo-200">
                    <span>1</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Practice 1</h3>
                    <p className="text-xs text-gray-500">5 câu hỏi • Thời gian: 5 phút</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => handlePracticeSelect(2)}
                className="w-full bg-white border border-gray-200 hover:border-pink-300 py-4 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group"
              >
                <div className="flex items-center">
                  <div className="bg-pink-100 text-pink-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 group-hover:bg-pink-200">
                    <span>2</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Practice 2</h3>
                    <p className="text-xs text-gray-500">7 câu hỏi • Thời gian: 7 phút</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        );

      case 'fillInBlanks':
        return (
          <VocabularyGame onGoBack={goBack} />
        );

      case 'quiz':
        return (
          <QuizApp />
        );

      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-0">
      <div className="w-full h-full bg-white rounded-none shadow-xl overflow-hidden">
        
        {currentView !== 'fillInBlanks' && (
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        )}

        <div className={currentView === 'fillInBlanks' ? 'h-full' : 'h-[calc(100%-8px)]'}>
          {currentView !== 'main' && currentView !== 'fillInBlanks' && (
            <div className="p-6">
              <div className="flex justify-start mb-2">
                 <Breadcrumbs
                    currentView={currentView}
                    selectedQuiz={selectedQuiz}
                    selectedType={selectedType}
                    selectedPractice={selectedPractice}
                    goHome={goHome}
                    setCurrentView={setCurrentView}
                 />
              </div>
            </div>
          )}
           <div className={`overflow-y-auto ${currentView === 'quiz' || currentView === 'fillInBlanks' ? 'p-0' : 'p-6'} ${currentView !== 'main' ? 'z-[51] relative' : ''}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
