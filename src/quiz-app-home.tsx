import { useState } from 'react';

export default function QuizApp() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(0); // Cần thêm logic để quản lý timer

  // Hàm xử lý khi chọn Quiz
  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setCurrentQuestion(1); // Reset câu hỏi khi chọn quiz mới
    setSelectedAnswer(null); // Reset đáp án khi chọn quiz mới
  };

  // Hàm xử lý khi chọn loại (Trắc nghiệm hoặc Điền từ)
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentQuestion(1); // Reset câu hỏi khi chọn loại mới
    setSelectedAnswer(null); // Reset đáp án khi chọn loại mới
    if (type === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      setCurrentView('fillInBlanks');
    }
  };

  // Hàm xử lý khi chọn Practice
  const handlePracticeSelect = (practice) => {
    setCurrentView(`practice${practice}`);
    setCurrentQuestion(1); // Reset câu hỏi khi chọn practice mới
    setSelectedAnswer(null); // Reset đáp án khi chọn practice mới
    // Cần thêm logic để tải dữ liệu câu hỏi cho practice đã chọn
  };

  // Hàm quay lại màn hình trước
  const goBack = () => {
    if (currentView === 'quizTypes') {
      setCurrentView('main');
      setSelectedQuiz(null);
    } else if (currentView === 'practices' || currentView === 'fillInBlanks') {
      setCurrentView('quizTypes');
      setSelectedType(null);
    } else if (currentView.startsWith('practice')) {
      setCurrentView('practices');
    }
    setCurrentQuestion(1); // Reset câu hỏi khi quay lại
    setSelectedAnswer(null); // Reset đáp án khi quay lại
  };

  // Hàm quay về màn hình chính
  const goHome = () => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setCurrentQuestion(1); // Reset câu hỏi khi về trang chủ
    setSelectedAnswer(null); // Reset đáp án khi về trang chủ
  };

  // Thêm các hàm này sau các hàm hiện có
  const handleNextQuestion = () => {
    // Logic để chuyển sang câu hỏi tiếp theo
    // Cần thêm kiểm tra xem còn câu hỏi nào nữa không
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    // Cần thêm logic để tải câu hỏi tiếp theo
  };

  const handlePrevQuestion = () => {
    // Logic để quay lại câu hỏi trước
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      // Cần thêm logic để tải câu hỏi trước đó
    }
  };

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
    // Cần thêm logic để kiểm tra đáp án và xử lý kết quả
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* Breadcrumbs */}
              <button onClick={() => setCurrentView('quizTypes')} className="text-blue-600 hover:underline text-xs">Quiz {selectedQuiz}</button>
              <span className="text-gray-400 text-xs">/</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Điền Từ</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full">Câu {currentQuestion}/5</span> {/* Sử dụng state currentQuestion */}
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
                  onClick={handlePrevQuestion} // Sử dụng hàm xử lý câu trước
                  className="text-gray-500 flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={currentQuestion === 1} // Disable nút "Câu trước" ở câu đầu tiên
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Câu trước
                </button>
                <button
                   onClick={handleNextQuestion} // Sử dụng hàm xử lý câu tiếp
                   className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
                   // Cần thêm logic để kiểm tra xem đã hết câu hỏi chưa để hiển thị nút "Hoàn thành"
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

      case 'practice1':
        return (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* Breadcrumbs */}
              <button onClick={() => setCurrentView('quizTypes')} className="text-blue-600 hover:underline text-xs">Quiz {selectedQuiz}</button>
              <span className="text-gray-400 text-xs">/</span>
              <button onClick={() => setCurrentView('practices')} className="text-green-600 hover:underline text-xs">Trắc Nghiệm</button>
               <span className="text-gray-400 text-xs">/</span>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Practice 1</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">Câu {currentQuestion}/5</span> {/* Sử dụng state currentQuestion */}
                </div>
                <span className="text-gray-500 text-sm">Thời gian: 01:25</span> {/* Cần thêm logic timer */}
              </div>

              <div className="mb-6 text-left">
                 {/* Nội dung câu hỏi trắc nghiệm - Cần thay thế bằng dữ liệu thực tế */}
                <p className="text-xl font-semibold mb-4 text-gray-800">What is the capital of France?</p>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswer === 'London' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'}`}> {/* Sử dụng state selectedAnswer */}
                    <input
                      type="radio"
                      name="q1"
                      className="form-radio text-indigo-600 h-5 w-5"
                      checked={selectedAnswer === 'London'}
                      onChange={() => handleSelectAnswer('London')} // Sử dụng hàm xử lý chọn đáp án
                    />
                    <span className="ml-3 text-gray-700">London</span>
                  </label>
                  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswer === 'Paris' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'}`}> {/* Sử dụng state selectedAnswer */}
                    <input
                      type="radio"
                      name="q1"
                      className="form-radio text-indigo-600 h-5 w-5"
                      checked={selectedAnswer === 'Paris'}
                      onChange={() => handleSelectAnswer('Paris')} // Sử dụng hàm xử lý chọn đáp án
                    />
                    <span className="ml-3 text-gray-700">Paris</span>
                  </label>
                  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswer === 'Berlin' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'}`}> {/* Sử dụng state selectedAnswer */}
                    <input
                      type="radio"
                      name="q1"
                      className="form-radio text-indigo-600 h-5 w-5"
                      checked={selectedAnswer === 'Berlin'}
                      onChange={() => handleSelectAnswer('Berlin')} // Sử dụng hàm xử lý chọn đáp án
                    />
                    <span className="ml-3 text-gray-700">Berlin</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevQuestion} // Sử dụng hàm xử lý câu trước
                  className="text-gray-500 flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={currentQuestion === 1} // Disable nút "Câu trước" ở câu đầu tiên
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Câu trước
                </button>
                <button
                  onClick={handleNextQuestion} // Sử dụng hàm xử lý câu tiếp
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
                  // Cần thêm logic để kiểm tra xem đã hết câu hỏi chưa để hiển thị nút "Hoàn thành"
                >
                  Câu tiếp
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              {/* Hiển thị tiến trình câu hỏi - Cần thêm logic dựa trên tổng số câu hỏi */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full ${index < currentQuestion ? 'bg-indigo-500' : 'bg-gray-300'}`}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'practice2':
        return (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* Breadcrumbs */}
              <button onClick={() => setCurrentView('quizTypes')} className="text-blue-600 hover:underline text-xs">Quiz {selectedQuiz}</button>
              <span className="text-gray-400 text-xs">/</span>
              <button onClick={() => setCurrentView('practices')} className="text-green-600 hover:underline text-xs">Trắc Nghiệm</button>
               <span className="text-gray-400 text-xs">/</span>
              <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">Practice 2</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="bg-pink-50 text-pink-700 text-xs px-3 py-1 rounded-full">Câu {currentQuestion}/7</span> {/* Sử dụng state currentQuestion */}
                </div>
                <span className="text-gray-500 text-sm">Thời gian: 01:25</span> {/* Cần thêm logic timer */}
              </div>

              <div className="mb-6 text-left">
                 {/* Nội dung câu hỏi trắc nghiệm - Cần thay thế bằng dữ liệu thực tế */}
                <p className="text-xl font-semibold mb-4 text-gray-800">Which planet is known as the Red Planet?</p>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswer === 'Venus' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50'}`}> {/* Sử dụng state selectedAnswer */}
                    <input
                      type="radio"
                      name="q1"
                      className="form-radio text-pink-600 h-5 w-5"
                      checked={selectedAnswer === 'Venus'}
                      onChange={() => handleSelectAnswer('Venus')} // Sử dụng hàm xử lý chọn đáp án
                    />
                    <span className="ml-3 text-gray-700">Venus</span>
                  </label>
                  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswer === 'Mars' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50'}`}> {/* Sử dụng state selectedAnswer */}
                    <input
                      type="radio"
                      name="q1"
                      className="form-radio text-pink-600 h-5 w-5"
                      checked={selectedAnswer === 'Mars'}
                      onChange={() => handleSelectAnswer('Mars')} // Sử dụng hàm xử lý chọn đáp án
                    />
                    <span className="ml-3 text-gray-700">Mars</span>
                  </label>
                  <label className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${selectedAnswer === 'Jupiter' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50'}`}> {/* Sử dụng state selectedAnswer */}
                    <input
                      type="radio"
                      name="q1"
                      className="form-radio text-pink-600 h-5 w-5"
                      checked={selectedAnswer === 'Jupiter'}
                      onChange={() => handleSelectAnswer('Jupiter')} // Sử dụng hàm xử lý chọn đáp án
                    />
                    <span className="ml-3 text-gray-700">Jupiter</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevQuestion} // Sử dụng hàm xử lý câu trước
                  className="text-gray-500 flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={currentQuestion === 1} // Disable nút "Câu trước" ở câu đầu tiên
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Câu trước
                </button>
                <button
                  onClick={handleNextQuestion} // Sử dụng hàm xử lý câu tiếp
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
                  // Cần thêm logic để kiểm tra xem đã hết câu hỏi chưa để hiển thị nút "Hoàn thành"
                >
                  Câu tiếp
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              {/* Hiển thị tiến trình câu hỏi - Cần thêm logic dựa trên tổng số câu hỏi */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full ${index < currentQuestion ? 'bg-pink-500' : 'bg-gray-300'}`}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  // Thay đổi phần return cuối cùng để có background và container đẹp hơn
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full h-full flex items-center justify-center"> {/* Thêm flexbox để căn giữa nội dung */}
        <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl"> {/* Giữ lại max-w-lg cho nội dung bên trong để không quá rộng trên màn hình lớn */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

          <div className="p-6">
            {/* Navigation bar */}
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

            {/* Main content với animation */}
            <div className="py-4 transition-all duration-500 ease-in-out">
              {renderContent()}
            </div>
          </div>

          {/* Footer đã được xóa */}
          {/* <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
            <p className="text-center text-gray-600 text-sm">© 2025 Ứng dụng Quiz | Học mọi lúc, mọi nơi</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
