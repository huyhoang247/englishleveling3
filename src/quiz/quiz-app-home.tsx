import { useState } from 'react';
// Import component QuizApp từ file quiz.tsx
import QuizApp from './quiz.tsx';
// Import component Breadcrumbs mới tạo
import Breadcrumbs from '../bread-crumbs.tsx';
// Import component VocabularyGame từ fill-word-home.tsx
import VocabularyGame from '../fill-word/fill-word-home.tsx';

export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);

  const handleQuizSelect = (quiz: number) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setSelectedType(null);
    setSelectedPractice(null);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    if (type === 'tracNghiem') {
      setCurrentView('practices');
    } else {
      // Giả sử 'dienTu' sẽ dẫn đến VocabularyGame
      setCurrentView('fillInBlanks');
    }
    setSelectedPractice(null);
  };

  const handlePracticeSelect = (practice: number) => {
    setCurrentView('quiz');
    setSelectedPractice(practice);
  };

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
      setSelectedPractice(null); // Reset practice khi quay lại
    }
  };

  const goHome = () => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  };
  
  // === PHẦN GIAO DIỆN NÂNG CẤP ===
  
  const renderContent = () => {
    switch(currentView) {
      case 'main':
        return (
          <div className="w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Welcome to Quiz App
              </h1>
              <p className="text-gray-500 mt-3 text-lg">Chọn một bộ câu hỏi để bắt đầu hành trình của bạn.</p>
            </div>

            <div className="space-y-4">
              {/* Quiz 1 Card */}
              <button
                onClick={() => handleQuizSelect(1)}
                className="w-full text-left p-5 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 group flex items-center"
              >
                <div className="p-4 bg-blue-100 rounded-xl mr-5">
                  <span className="text-3xl">📚</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-800">Quiz 1: Kiến thức cơ bản</h3>
                  <p className="text-sm text-gray-500 mt-1">10 câu hỏi trắc nghiệm về các chủ đề chung.</p>
                </div>
                <div className="ml-4 transform transition-transform duration-300 group-hover:translate-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
              
              {/* Quiz 2 Card */}
              <button
                onClick={() => handleQuizSelect(2)}
                className="w-full text-left p-5 bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 group flex items-center"
              >
                <div className="p-4 bg-purple-100 rounded-xl mr-5">
                  <span className="text-3xl">🧠</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-800">Quiz 2: Thử thách nâng cao</h3>
                  <p className="text-sm text-gray-500 mt-1">8 câu hỏi logic và suy luận dành cho bạn.</p>
                </div>
                <div className="ml-4 transform transition-transform duration-300 group-hover:translate-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        );

      case 'quizTypes':
        return (
            <div className="w-full">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Hình thức Luyện tập</h2>
                <p className="mt-3 text-lg text-gray-500">Chọn một hình thức để thử thách kiến thức của bạn.</p>
              </div>

              <div className="space-y-5">
                {/* Trắc nghiệm Card */}
                <button
                  onClick={() => handleTypeSelect('tracNghiem')}
                  className="w-full text-left p-6 bg-gradient-to-br from-teal-400 to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-white/25 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="ml-5 flex-grow">
                      <h3 className="text-xl font-bold">Trắc Nghiệm</h3>
                      <p className="text-sm text-blue-100 mt-1">Chọn đáp án đúng từ các lựa chọn.</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </div>
                </button>

                {/* Điền từ Card */}
                <button
                  onClick={() => handleTypeSelect('dienTu')}
                  className="w-full text-left p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-white/25 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                    </div>
                    <div className="ml-5 flex-grow">
                      <h3 className="text-xl font-bold">Điền Từ</h3>
                      <p className="text-sm text-pink-100 mt-1">Hoàn thành câu bằng cách điền từ còn thiếu.</p>
                    </div>
                     <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
        );

      case 'practices':
        return (
          <div className="w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">Chọn Bài Tập</h1>
              <p className="text-gray-500 mt-3 text-lg">Sẵn sàng để kiểm tra kiến thức của bạn?</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePracticeSelect(1)}
                className="w-full bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 py-4 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group"
              >
                <div className="flex items-center">
                  <div className="bg-indigo-100 text-indigo-600 font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center mr-5 group-hover:bg-indigo-200 transition-colors">
                    <span>1</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800">Practice 1</h3>
                    <p className="text-sm text-gray-500">5 câu hỏi • Ước tính 5 phút</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>

              <button
                onClick={() => handlePracticeSelect(2)}
                className="w-full bg-white border border-gray-200 hover:border-pink-400 hover:bg-pink-50 py-4 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group"
              >
                <div className="flex items-center">
                  <div className="bg-pink-100 text-pink-600 font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center mr-5 group-hover:bg-pink-200 transition-colors">
                    <span>2</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800">Practice 2</h3>
                    <p className="text-sm text-gray-500">7 câu hỏi • Ước tính 7 phút</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        );

      case 'fillInBlanks':
        // VocabularyGame sẽ chiếm toàn bộ không gian, không cần padding bọc ngoài
        return <VocabularyGame onGoBack={goBack} />;

      case 'quiz':
        // QuizApp cũng chiếm toàn bộ không gian
        return <QuizApp />;

      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  const isFullScreenView = currentView === 'quiz' || currentView === 'fillInBlanks';

  return (
    <div className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Thanh trang trí gradient */}
        {!isFullScreenView && (
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        )}

        <div className="h-full">
            {/* Breadcrumbs và Nội dung chính */}
            <div className={`transition-all duration-300 ${isFullScreenView ? 'p-0' : 'p-6 sm:p-8'}`}>
              
              {/* Breadcrumbs chỉ hiển thị ở các view con, không phải main */}
              {currentView !== 'main' && !isFullScreenView && (
                <div className="mb-6">
                  <Breadcrumbs
                      currentView={currentView}
                      selectedQuiz={selectedQuiz}
                      selectedType={selectedType}
                      selectedPractice={selectedPractice}
                      goHome={goHome}
                      goBack={goBack} // Pass goBack thay vì setCurrentView
                      setCurrentView={setCurrentView}
                  />
                </div>
              )}
              
              <div className="relative">
                {renderContent()}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
