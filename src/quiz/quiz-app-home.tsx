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
    setSelectedType(null); // Reset type khi chọn lại quiz
    setSelectedPractice(null); // Reset practice khi chọn lại quiz
  };

  // Hàm xử lý khi chọn loại (Trắc nghiệm hoặc Điền từ)
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    // Chuyển đến màn hình practices nếu chọn trắc nghiệm
    if (type === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      // Nếu chọn điền từ, chuyển view sang 'fillInBlanks' để render VocabularyGame
      setCurrentView('fillInBlanks');
    }
    setSelectedPractice(null); // Reset practice khi chọn loại bài tập
  };

  // Hàm xử lý khi chọn Practice
  const handlePracticeSelect = (practice) => {
    // Khi chọn practice, chuyển view sang 'quiz' để render component QuizApp
    setCurrentView('quiz');
    // Lưu practice đã chọn vào state mới
    setSelectedPractice(practice);
    // Có thể truyền thêm thông tin về practice đã chọn vào state nếu cần
    // Ví dụ: setSelectedPractice(practice);
  };

  // Hàm quay lại màn hình trước
  const goBack = () => {
    if (currentView === 'quizTypes') {
      setCurrentView('main');
      setSelectedQuiz(null);
      setSelectedType(null); // Reset type khi quay lại main
      setSelectedPractice(null); // Reset practice khi quay lại main
    } else if (currentView === 'practices' || currentView === 'fillInBlanks') { // Bao gồm cả fillInBlanks khi quay lại
      setCurrentView('quizTypes');
      setSelectedType(null); // Reset type khi quay lại quizTypes
      setSelectedPractice(null); // Reset practice khi quay lại quizTypes
    } else if (currentView === 'quiz') { // Nếu đang ở màn hình quiz, quay lại màn hình practices
       setCurrentView('practices');
       // selectedPractice sẽ được giữ lại để hiển thị trong breadcrumbs khi quay lại practices
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
    setSelectedPractice(null); // Reset practice khi về trang chủ
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
         // Render component VocabularyGame khi chọn điền từ
        return (
          <VocabularyGame onGoBack={goBack} />
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
        
        {/* THAY ĐỔI 1: Chỉ hiển thị thanh gradient khi không ở màn hình game */}
        {currentView !== 'fillInBlanks' && (
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        )}

        {/* THAY ĐỔI 2: Điều chỉnh chiều cao của container dựa vào việc thanh gradient có hiển thị hay không */}
        <div className={currentView === 'fillInBlanks' ? 'h-full' : 'h-[calc(100%-8px)]'}>
          {/* Navigation bar và Breadcrumbs - Sẽ không hiển thị khi ở 'main' hoặc 'fillInBlanks' */}
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

          {/* Main content - Padding có điều kiện và Z-index */}
          {/* Thêm class z-[51] khi currentView không phải là 'main' */}
           <div className={`overflow-y-auto ${currentView === 'quiz' || currentView === 'fillInBlanks' ? 'p-0' : 'p-6'} ${currentView !== 'main' ? 'z-[51] relative' : ''}`}> {/* Thêm fillInBlanks vào điều kiện không padding */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
