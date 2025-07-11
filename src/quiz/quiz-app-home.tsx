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

  // Component cho các lựa chọn với style đẹp hơn
  const PracticeTypeButton = ({ icon, title, description, onClick, borderColorClass }) => (
    <button
      onClick={onClick}
      className={`relative w-full p-6 text-left bg-gray-800/50 backdrop-blur-sm border ${borderColorClass} rounded-2xl overflow-hidden group transition-all duration-300 hover:bg-gray-800/80 hover:shadow-2xl hover:shadow-purple-500/20`}
    >
      <div className="flex items-center">
        <div className={`p-3 bg-gray-900/50 rounded-lg border ${borderColorClass}`}>
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <div className="ml-auto text-gray-600 group-hover:text-white transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );

  // Render nội dung tùy thuộc vào view hiện tại
  const renderContent = () => {
    switch(currentView) {
      case 'main':
        // Giao diện màn hình chính có thể giữ nguyên hoặc chỉnh sửa cho hợp dark mode
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Quiz App</h1>
              <p className="text-gray-400 mt-2">Chọn bộ quiz để bắt đầu học tập</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleQuizSelect(1)}
                className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/50 text-white py-6 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:shadow-blue-500/20 font-medium flex flex-col items-center"
              >
                <span className="text-3xl mb-2">📚</span>
                <span className="text-lg">Quiz 1</span>
                <span className="text-xs text-blue-300 mt-1">10 câu hỏi</span>
              </button>
              <button
                onClick={() => handleQuizSelect(2)}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/50 text-white py-6 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:shadow-purple-500/20 font-medium flex flex-col items-center"
              >
                <span className="text-3xl mb-2">🧠</span>
                <span className="text-lg">Quiz 2</span>
                <span className="text-xs text-purple-300 mt-1">8 câu hỏi</span>
              </button>
            </div>
          </div>
        );

      // --- GIAO DIỆN DARK MODE MỚI ---
      case 'quizTypes':
        return (
          <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto py-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                Chọn Hình Thức
              </h2>
              <p className="mt-3 text-lg text-gray-400">
                Mỗi lựa chọn là một thử thách mới. Bạn đã sẵn sàng?
              </p>
            </div>

            <div className="space-y-5 w-full">
              <PracticeTypeButton
                onClick={() => handleTypeSelect('tracNghiem')}
                title="Trắc Nghiệm"
                description="Chọn đáp án đúng từ các lựa chọn."
                borderColorClass="border-cyan-400/50"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <PracticeTypeButton
                onClick={() => handleTypeSelect('dienTu')}
                title="Điền Từ"
                description="Hoàn thành câu bằng từ còn thiếu."
                borderColorClass="border-fuchsia-500/50"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                }
              />
            </div>
          </div>
        );

      case 'practices':
        // Giữ nguyên giao diện chọn bài tập hoặc có thể tuỳ chỉnh sau
        return (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-white mb-6">Chọn bài tập</h1>
            <div className="space-y-4 w-full">
              {/* Nút Practice 1 */}
              <button onClick={() => handlePracticeSelect(1)} className="w-full bg-gray-800/50 border border-gray-700 hover:border-indigo-500 py-4 px-5 rounded-xl shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex justify-between items-center group">
                <div className="flex items-center">
                  <div className="bg-indigo-500/20 text-indigo-300 rounded-full w-10 h-10 flex items-center justify-center mr-4 group-hover:bg-indigo-500/30"><span>1</span></div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-200">Practice 1</h3>
                    <p className="text-xs text-gray-400">5 câu hỏi • Thời gian: 5 phút</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              {/* Nút Practice 2 */}
              <button onClick={() => handlePracticeSelect(2)} className="w-full bg-gray-800/50 border border-gray-700 hover:border-pink-500 py-4 px-5 rounded-xl shadow-sm hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 flex justify-between items-center group">
                <div className="flex items-center">
                  <div className="bg-pink-500/20 text-pink-300 rounded-full w-10 h-10 flex items-center justify-center mr-4 group-hover:bg-pink-500/30"><span>2</span></div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-200">Practice 2</h3>
                    <p className="text-xs text-gray-500">7 câu hỏi • Thời gian: 7 phút</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        );

      case 'fillInBlanks':
        return <VocabularyGame onGoBack={goBack} />;

      case 'quiz':
        return <QuizApp />;

      default:
        return <div className="text-white">Nội dung không tồn tại</div>;
    }
  };

  // --- Thay đổi container chính để có nền dark mode và hiệu ứng Aurora ---
  return (
    <div className="relative min-h-screen h-full bg-gray-900 text-white p-0 overflow-hidden">
      {/* Hiệu ứng Aurora Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-[50vw] h-[50vw] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 opacity-20 blur-[150px]"></div>
          <div className="absolute w-[30vw] h-[30vw] translate-x-1/4 translate-y-1/4 top-0 right-0 bg-gradient-to-tr from-cyan-600 to-teal-600 opacity-10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full h-full bg-transparent rounded-none overflow-hidden">
        <div className={currentView === 'fillInBlanks' ? 'h-full' : 'h-full'}>
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
           <div className={`overflow-y-auto h-full ${currentView === 'quiz' || currentView === 'fillInBlanks' ? 'p-0' : 'p-6'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
