import { useState } from 'react';
// Import component QuizApp từ file quiz.tsx
import QuizApp from './quiz';

export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  // Các state liên quan đến câu hỏi và đáp án có thể không cần thiết ở đây nữa
  // nếu logic quiz được xử lý hoàn toàn trong QuizApp từ quiz.tsx
  // const [currentQuestion, setCurrentQuestion] = useState(1);
  // const [selectedAnswer, setSelectedAnswer] = useState(null);
  // const [timer, setTimer] = useState(0); // Cần thêm logic để quản lý timer

  // Hàm xử lý khi chọn Quiz
  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    // Reset states liên quan đến quiz nếu có
  };

  // Hàm xử lý khi chọn loại (Trắc nghiệm hoặc Điền từ)
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    // Chuyển đến màn hình practices nếu chọn trắc nghiệm
    if (type === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      // Giả định điền từ sẽ có màn hình riêng hoặc xử lý khác
      setCurrentView('fillInBlanks');
    }
  };

  // Hàm xử lý khi chọn Practice
  const handlePracticeSelect = (practice) => {
    // Khi chọn practice, chuyển view sang 'quiz' để render component QuizApp
    setCurrentView('quiz');
    // Có thể truyền thêm thông tin về practice đã chọn vào state nếu cần
    // Ví dụ: setSelectedPractice(practice);
  };

  // Hàm quay lại màn hình trước
  const goBack = () => {
    if (currentView === 'quizTypes') {
      setCurrentView('main');
      setSelectedQuiz(null);
    } else if (currentView === 'practices' || currentView === 'fillInBlanks') {
      setCurrentView('quizTypes');
      setSelectedType(null);
    } else if (currentView === 'quiz') { // Nếu đang ở màn hình quiz, quay lại màn hình practices
       setCurrentView('practices');
    }
    // Reset states liên quan khi quay lại
    // setCurrentQuestion(1);
    // setSelectedAnswer(null);
  };

  // Hàm quay về màn hình chính
  const goHome = () => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    // Reset states liên quan khi về trang chủ
    // setCurrentQuestion(1);
    // setSelectedAnswer(null);
  };

  // Các hàm xử lý trong quiz (handleNextQuestion, handlePrevQuestion, handleSelectAnswer)
  // sẽ được xử lý bên trong component QuizApp từ quiz.tsx

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

      case 'quizTypes':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">Quiz {selectedQuiz}</span>
              <h1 className="text-2xl font-bold text-gray-800">Chọn loại bài tập</h1>
              <div className="w-16 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleTypeSelect('tracNghiem')}
                className="bg-white border-2 border-green-400 hover:bg-green-50 text-green-600 py-5 px-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex flex-col items-center"
              >
                <span className="text-3xl mb-2">🔍</span>
                <span className="font-medium">Trắc Nghiệm</span>
                <span className="text-xs text-gray-500 mt-1">Chọn đáp án đúng</span>
              </button>
              <button
                onClick={() => handleTypeSelect('dienTu')}
                className="bg-white border-2 border-yellow-400 hover:bg-yellow-50 text-yellow-600 py-5 px-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex flex-col items-center"
              >
                <span className="text-3xl mb-2">✏️</span>
                <span className="font-medium">Điền Từ</span>
                <span className="text-xs text-gray-500 mt-1">Điền từ còn thiếu</span>
              </button>
            </div>
          </div>
        );

      case 'practices':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 mb-2">
               {/* Breadcrumbs */}
              <button onClick={() => setCurrentView('quizTypes')} className="text-blue-600 hover:underline text-xs">Quiz {selectedQuiz}</button>
              <span className="text-gray-400 text-xs">/</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Trắc Nghiệm</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Chọn bài tập</h1>

            <div className="space-y-4 w-full">
              <button
                onClick={() => handlePracticeSelect(1)} // Khi nhấn Practice 1
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
                onClick={() => handlePracticeSelect(2)} // Khi nhấn Practice 2
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
         // Giữ nguyên phần render cho điền từ nếu có
        return (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* Breadcrumbs */}
              <button onClick={() => setCurrentView('quizTypes')} className="text-blue-600 hover:underline text-xs">Quiz {selectedQuiz}</button>
              <span className="text-gray-400 text-xs">/</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Điền Từ</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full">Câu 1/5</span> {/* Cần cập nhật lại logic câu hỏi */}
                <span className="text-gray-500 text-sm">Thời gian: 00:45</span> {/* Cần thêm logic timer */}
              </div>

              <div className="p-5 bg-gray-50 rounded-lg mb-5">
                <p className="text-lg mb-4 text-gray-700">Hoàn thành câu sau đây:</p>
                {/* Nội dung câu hỏi điền từ - Cần thay thế bằng dữ liệu thực tế */}
                <p className="text-xl font-medium mb-2">The cat <span className="text-yellow-600 border-b-2 border-yellow-400 px-1">___</span> on the mat.</p>
                <div className="mt-5">
                  <input
                    type="text"
                    placeholder="Điền từ vào đây"
                    className="border-2 border-gray-300 focus:border-yellow-400 focus:ring focus:ring-yellow-100 p-3 rounded-lg w-full outline-none transition-all"
                    // Cần thêm state để lưu giá trị input
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {}} // Cần cập nhật lại logic
                  className="text-gray-500 flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Câu trước
                </button>
                <button
                   onClick={() => {}} // Cần cập nhật lại logic
                   className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
                >
                  Câu tiếp
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );

      case 'quiz': // Case mới để render component QuizApp
        return (
          // Render component QuizApp từ quiz.tsx
          // Bạn có thể truyền props vào đây nếu QuizApp cần thông tin về quiz/practice
          <QuizApp />
        );

      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  // Thay đổi phần return cuối cùng để có background và container đẹp hơn
  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-0">
      <div className="w-full h-full bg-white rounded-none shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

        <div className="h-[calc(100%-8px)] p-6"> {/* 8px = height của gradient line trên cùng */}
          {/* Navigation bar giữ nguyên */}
          {currentView !== 'main' && (
            <div className="flex justify-between mb-6">
              <button
                onClick={goBack}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
              </button>

              <button
                onClick={goHome}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Trang chủ
              </button>
            </div>
          )}

          {/* Main content */}
          <div className="h-[calc(100%-48px)] overflow-y-auto"> {/* 48px = chiều cao navigation */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
