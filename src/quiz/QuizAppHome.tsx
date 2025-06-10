import { useState } from 'react';
import QuizApp from './QuizApp';
import FillWordHome from './FillWordHome';

export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'quizTypes', 'practices', 'quiz', 'fillInBlanks'
  
  const handleTypeSelect = (type: 'practices' | 'fillInBlanks') => {
    setCurrentView(type);
  };
  
  const handlePracticeSelect = () => {
      setCurrentView('quiz');
  }

  const goBack = () => {
    if (currentView === 'quiz') setCurrentView('practices');
    else if (currentView === 'practices' || currentView === 'fillInBlanks') setCurrentView('main');
  };

  const renderContent = () => {
    switch(currentView) {
      case 'main':
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Luyện Tập</h1>
            <p className="text-gray-600 mt-2 mb-6">Chọn một chế độ để bắt đầu</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => handleTypeSelect('practices')} className="bg-white border-2 border-green-400 hover:bg-green-50 text-green-600 p-5 rounded-lg shadow-sm transition-all"><span className="text-3xl mb-2 block">🔍</span> Trắc Nghiệm</button>
              <button onClick={() => handleTypeSelect('fillInBlanks')} className="bg-white border-2 border-yellow-400 hover:bg-yellow-50 text-yellow-600 p-5 rounded-lg shadow-sm transition-all"><span className="text-3xl mb-2 block">✏️</span> Điền Từ</button>
            </div>
          </div>
        );
      case 'practices':
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Chọn Bài Tập Trắc Nghiệm</h1>
            <div className="space-y-4">
              <button onClick={handlePracticeSelect} className="w-full bg-white border hover:border-indigo-300 p-4 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center group">
                <div className="flex items-center"><div className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div><div className="text-left"><h3 className="font-medium">Practice 1</h3><p className="text-xs text-gray-500">5 câu hỏi</p></div></div>
                <span className="text-gray-400 group-hover:text-indigo-500">></span>
              </button>
              <button onClick={handlePracticeSelect} className="w-full bg-white border hover:border-pink-300 p-4 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center group">
                <div className="flex items-center"><div className="bg-pink-100 text-pink-600 rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div><div className="text-left"><h3 className="font-medium">Practice 2</h3><p className="text-xs text-gray-500">7 câu hỏi</p></div></div>
                <span className="text-gray-400 group-hover:text-pink-500">></span>
              </button>
            </div>
          </div>
        );
      case 'fillInBlanks': return <FillWordHome />;
      case 'quiz': return <QuizApp />;
      default: return <div>Không có nội dung</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto">
        {currentView !== 'main' && (
          <div className="p-4">
            <button onClick={goBack} className="text-blue-600 hover:underline font-medium">< Quay lại</button>
          </div>
        )}
        <div className={currentView === 'quiz' || currentView === 'fillInBlanks' ? 'p-0' : 'p-6'}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
