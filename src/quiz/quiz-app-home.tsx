// --- START OF FILE quiz-app-home.tsx ---

import { useState } from 'react';
import QuizApp from './quiz.tsx';
import Breadcrumbs from '../bread-crumbs.tsx';
import VocabularyGame from '../fill-word/fill-word-home.tsx';

export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setSelectedType(null);
    setSelectedPractice(null);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      // Đổi tên view để dễ nhận biết hơn
      setCurrentView('vocabularyGame');
    }
    setSelectedPractice(null);
  };

  const handlePracticeSelect = (practice) => {
    setCurrentView('quiz');
    setSelectedPractice(practice);
  };

  const goBack = () => {
    if (currentView === 'vocabularyGame' || currentView === 'quiz') { // Gộp điều kiện cho cả 2 game
        setCurrentView('practices'); // Quay lại màn hình chọn practice
        if (selectedType === 'dienTu') { // Nếu là game điền từ, quay lại màn hình chọn loại quiz
            setCurrentView('quizTypes');
            setSelectedType(null);
        }
    } else if (currentView === 'quizTypes') {
      setCurrentView('main');
      setSelectedQuiz(null);
      setSelectedType(null);
      setSelectedPractice(null);
    } else if (currentView === 'practices') {
      setCurrentView('quizTypes');
      setSelectedType(null);
      setSelectedPractice(null);
    }
  };

  const goHome = () => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  };

  // Khi ở trong màn hình game điền từ, bọc nó trong một lớp phủ
  if (currentView === 'vocabularyGame') {
    return (
      <div className="fixed inset-0 z-[51] bg-white">
        <VocabularyGame onGoBack={goBack} />
      </div>
    );
  }

  // Nếu là màn hình quiz, cũng bọc nó trong một lớp phủ toàn màn hình
  // để ẩn thanh navbar, tương tự như VocabularyGame.
  if (currentView === 'quiz') {
    return (
      <div className="fixed inset-0 z-[51] bg-white">
        <QuizApp onGoBack={goBack} selectedPractice={selectedPractice} />
      </div>
    );
  }
  
  const renderContent = () => {
    switch(currentView) {
      case 'main':
        return (
          <div className="flex flex-col items-center gap-8 w-full pt-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Quiz App
              </h1>
              <p className="text-gray-500 mt-2 text-lg">Chọn một chế độ để bắt đầu</p>
            </div>

            <div className="w-full max-w-md space-y-5">
              <button
                onClick={() => handleQuizSelect(1)}
                className="w-full flex items-center p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-300 group"
              >
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                  <span className="text-4xl">📚</span>
                </div>
                <div className="ml-5 text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-800">Quiz</h3>
                  <p className="text-gray-500 text-sm mt-1">Luyện tập các câu hỏi trắc nghiệm</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="relative w-full flex items-center p-5 bg-gray-50 rounded-2xl shadow-md border border-gray-200 cursor-not-allowed opacity-80">
                <div className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  Sắp ra mắt
                </div>
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm">
                  <span className="text-4xl">📄</span>
                </div>
                <div className="ml-5 text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-500">Đề Thi</h3>
                  <p className="text-gray-400 text-sm mt-1">Kiểm tra kiến thức với các đề thi thử</p>
                </div>
              </div>

              <div className="relative w-full flex items-center p-5 bg-gray-50 rounded-2xl shadow-md border border-gray-200 cursor-not-allowed opacity-80">
                <div className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  Sắp ra mắt
                </div>
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm">
                  <span className="text-4xl">📖</span>
                </div>
                <div className="ml-5 text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-500">Ngữ Pháp</h3>
                  <p className="text-gray-400 text-sm mt-1">Luyện tập các chủ điểm ngữ pháp</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quizTypes':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                Quiz {selectedQuiz}
              </h2>
              <p className="mt-2 text-md text-gray-500">Chọn hình thức luyện tập bạn muốn.</p>
            </div>

            <div className="space-y-5 w-full">
              <button
                onClick={() => handleTypeSelect('tracNghiem')}
                className="w-full text-left p-6 bg-gradient-to-br from-teal-400 to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-bold">Trắc Nghiệm</h3>
                    <p className="text-sm text-blue-100 mt-1">Chọn đáp án đúng từ các lựa chọn.</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('dienTu')}
                className="w-full text-left p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-bold">Điền Từ</h3>
                    <p className="text-sm text-pink-100 mt-1">Hoàn thành câu bằng cách điền từ còn thiếu.</p>
                  </div>
                   <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'practices':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-3xl font-extrabold text-slate-800">Chọn Bài Tập</h2>
                <p className="text-slate-500 mt-2">Bắt đầu hành trình chinh phục kiến thức của bạn.</p>
            </div>

            <div className="space-y-5 w-full">
              {/* Practice 1 */}
              <button
                onClick={() => handlePracticeSelect(1)}
                className="w-full bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex justify-between items-center group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 bg-indigo-100 rounded-xl flex items-center justify-center mr-5">
                    <span className="font-black text-2xl text-indigo-600">1</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-800">Practice 1</h3>
                    <div className="flex items-center space-x-4 text-slate-500 text-sm mt-1.5">
                      <span className="flex items-center space-x-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>5 câu hỏi</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>5 phút</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Practice 2 */}
              <button
                onClick={() => handlePracticeSelect(2)}
                className="w-full bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 flex justify-between items-center group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 bg-pink-100 rounded-xl flex items-center justify-center mr-5">
                    <span className="font-black text-2xl text-pink-600">2</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-800">Practice 2</h3>
                    <div className="flex items-center space-x-4 text-slate-500 text-sm mt-1.5">
                      <span className="flex items-center space-x-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>7 câu hỏi</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>7 phút</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-pink-400 group-hover:text-pink-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  // If the view is for selecting quiz types or practices, wrap it in a full-screen container to hide the bottom navbar.
  if (currentView === 'quizTypes' || currentView === 'practices') {
    return (
      <div className="fixed inset-0 z-[51] bg-white">
        <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-0">
          <div className="w-full h-full bg-white rounded-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
            <div className={'h-[calc(100%-8px)] flex flex-col'}>
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
              {/* Removed vertical centering to align content to the top */}
              <div className="overflow-y-auto p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full h-full bg-white flex flex-col">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 flex-shrink-0"></div>
        <div className="flex-grow overflow-y-auto">
          {currentView !== 'main' && (
            <div className="p-6 pb-0">
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
           <div className={`p-6 ${currentView !== 'main' ? 'z-[51] relative' : ''} pb-32`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
