// --- START OF FILE: quiz-app-home.tsx ---

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import QuizApp from './quiz.tsx';
import Breadcrumbs from '../bread-crumbs.tsx';
import VocabularyGame from '../fill-word/fill-word-home.tsx';
import AnalysisDashboard from '../AnalysisDashboard.tsx';
import WordChainGame from '../word-chain-game.tsx'; // --- ĐÃ THÊM: Import game mới

// Imports for progress calculation
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import quizData from './quiz-data.ts';
import { exampleData } from '../example-data.ts';

// --- NEW, MODERNIZED ICONS ---
const Icons = {
    Practice: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
    WordChain: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>,
    Analysis: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>,
    Exams: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    Grammar: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c1.354 0 2.665-.278 3.868-.802M12 21c-1.354 0-2.665-.278-3.868-.802M12 21l-1.46-3.894M12 21l1.46-3.894m0 0A4.505 4.505 0 0 0 15 12.502a4.505 4.505 0 0 0-3-4.002m-1.46 3.894a4.505 4.505 0 0 1-3-4.002 4.505 4.505 0 0 1 3-4.002m1.088 12.062a4.5 4.5 0 1 1 2.176 0m-2.176 0c.208.06.42.11.64.153m-1.088 4.453a4.5 4.5 0 1 0-2.176 0m2.176 0a4.5 4.5 0 0 0 .64-.153" /></svg>,
};


export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);

  const handleQuizSelect = useCallback((quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

  const handleTypeSelect = useCallback((type) => {
    setSelectedType(type);
    setCurrentView('practices');
    setSelectedPractice(null);
  }, []);

  const handlePracticeSelect = useCallback((practice) => {
    setSelectedPractice(practice);
    if (selectedType === 'tracNghiem') {
      setCurrentView('quiz');
    } else if (selectedType === 'dienTu') {
      setCurrentView('vocabularyGame');
    }
  }, [selectedType]);

  const goBack = useCallback(() => {
    if (currentView === 'vocabularyGame' || currentView === 'quiz' || currentView === 'wordChainGame') {
      if (selectedType) {
         setCurrentView('practices');
         setSelectedPractice(null);
      } else {
         setCurrentView('main');
         setSelectedQuiz(null);
         setSelectedType(null);
         setSelectedPractice(null);
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
  }, [currentView, selectedType]);

  const goHome = useCallback(() => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

  if (currentView === 'wordChainGame') {
    return <WordChainGame onGoBack={goHome} />;
  }
  
  if (currentView === 'analysis') {
    return (
        <div className="fixed inset-0 z-[51] bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b">
                <button onClick={goHome} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Quay lại trang chính
                </button>
            </div>
            <AnalysisDashboard />
        </div>
    );
  }

  if (currentView === 'vocabularyGame') {
    return (
      <div className="fixed inset-0 z-[51] bg-white">
        <VocabularyGame onGoBack={goBack} selectedPractice={selectedPractice} />
      </div>
    );
  }

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
        const menuItems = [
          {
            title: 'Luyện tập',
            description: 'Trắc nghiệm, điền từ & nhiều hơn nữa',
            icon: <Icons.Practice />,
            action: () => handleQuizSelect(1),
            color: 'blue'
          },
          {
            title: 'Nối Từ',
            description: 'Thử thách vốn từ vựng của bạn',
            icon: <Icons.WordChain />,
            action: () => setCurrentView('wordChainGame'),
            color: 'purple'
          },
          {
            title: 'Phân Tích',
            description: 'Xem lại tiến trình học tập',
            icon: <Icons.Analysis />,
            action: () => setCurrentView('analysis'),
            color: 'teal'
          },
          {
            title: 'Đề Thi',
            description: 'Kiểm tra với các đề thi thử',
            icon: <Icons.Exams />,
            action: () => {},
            color: 'gray',
            comingSoon: true
          },
          {
            title: 'Ngữ Pháp',
            description: 'Củng cố các chủ điểm ngữ pháp',
            icon: <Icons.Grammar />,
            action: () => {},
            color: 'gray',
            comingSoon: true
          },
        ];

        const colorVariants = {
          blue: 'from-blue-500 to-sky-500 hover:shadow-blue-500/30',
          purple: 'from-purple-500 to-violet-500 hover:shadow-purple-500/30',
          teal: 'from-teal-500 to-cyan-500 hover:shadow-teal-500/30',
          gray: 'from-gray-400 to-gray-500',
        };

        return (
          <div className="flex flex-col items-center gap-10 w-full pt-8">
            <div className="text-center">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                English Hub
              </h1>
              <p className="text-slate-500 mt-3 text-lg">Chọn một chế độ để bắt đầu hành trình của bạn</p>
            </div>
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  disabled={item.comingSoon}
                  className={`relative group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1.5 transition-all duration-300 border-t-4 ${item.comingSoon ? 'border-gray-300' : `border-${item.color}-500`} ${item.comingSoon ? 'cursor-not-allowed' : ''}`}
                >
                  {item.comingSoon && (
                     <div className="absolute top-3 right-3 bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">Sắp ra mắt</div>
                  )}
                  <div className={`flex items-start gap-5 ${item.comingSoon ? 'opacity-50' : ''}`}>
                    <div className={`flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${colorVariants[item.color]}`}>
                      {item.icon}
                    </div>
                    <div className="text-left flex-grow">
                      <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'quizTypes':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div className="text-center"><h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Luyện tập</h2><p className="mt-2 text-md text-gray-500">Chọn hình thức luyện tập bạn muốn.</p></div>
            <div className="space-y-5 w-full">
              <button onClick={() => handleTypeSelect('tracNghiem')} className="w-full text-left p-6 bg-gradient-to-br from-teal-400 to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-xl"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_2354_Checklist%20Question%20Mark_remix_01k0mc0y2efdmb3gsgzgd6y81s.png" alt="Trắc nghiệm icon" className="h-8 w-8" /></div>
                  <div className="ml-5"><h3 className="text-xl font-bold">Trắc Nghiệm</h3><p className="text-sm text-blue-100 mt-1">Chọn đáp án đúng từ các lựa chọn.</p></div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></div>
                </div>
              </button>
              <button onClick={() => handleTypeSelect('dienTu')} className="w-full text-left p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></div>
                  <div className="ml-5"><h3 className="text-xl font-bold">Điền Từ</h3><p className="text-sm text-pink-100 mt-1">Hoàn thành câu bằng cách điền từ còn thiếu.</p></div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></div>
                </div>
              </button>
            </div>
          </div>
        );
      case 'practices':
        return <PracticeList selectedType={selectedType} onPracticeSelect={handlePracticeSelect} />;
      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  if (currentView === 'quizTypes' || currentView === 'practices') {
    return (
      <div className="fixed inset-0 z-[51] bg-white">
        <div className="min-h-svh h-full bg-slate-50 p-0">
          <div className="w-full h-full bg-slate-50 rounded-none overflow-hidden">
            <div className={'h-full flex flex-col'}>
              <div className="p-6">
                <div className="flex justify-start mb-2">
                   <Breadcrumbs currentView={currentView} selectedQuiz={selectedQuiz} selectedType={selectedType} selectedPractice={selectedPractice} goHome={goHome} setCurrentView={setCurrentView} />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto px-6 pb-6 hide-scrollbar">{renderContent()}</div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="h-svh overflow-hidden bg-slate-50">
      <div className="w-full h-full bg-slate-50 flex flex-col">
        <div className="flex-grow overflow-y-auto">
          {currentView !== 'main' && (
            <div className="p-6 pb-0">
              <div className="flex justify-start mb-2">
                 <Breadcrumbs currentView={currentView} selectedQuiz={selectedQuiz} selectedType={selectedType} selectedPractice={selectedPractice} goHome={goHome} setCurrentView={setCurrentView} />
              </div>
            </div>
          )}
           <div className={`p-6 ${currentView !== 'main' ? 'z-[51] relative' : ''} pb-32`}>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

// --- Icons (moved outside to prevent re-creation) ---
const CompletedIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const LockIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);
const RefreshIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.001 10a1 1 0 011-1h5a1 1 0 110 2H5a1 1 0 01-1-1zM15 13a1 1 0 011-1h.01a5.002 5.002 0 00-11.588-2.512 1 1 0 11-1.885-.666A7.002 7.002 0 0119 8.899V7a1 1 0 112 0v5a1 1 0 01-1 1h-5a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);
const GiftIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 5a3 3 0 013-3h4a3 3 0 013 3v1h-2.155a3.003 3.003 0 00-2.845.879l-.15.225-.15-.225A3.003 3.003 0 007.155 6H5V5zm-2 3a2 2 0 00-2 2v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H3zm12 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
    </svg>
);
const GoldCoinIcon = ({ className }: { className: string }) => (
    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin icon" className={className} />
);
const CardCapacityIcon = ({ className }: { className: string }) => (
    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000006160622f8a01c95a4a8eb982.png" alt="Card Capacity Icon" className={className} />
);


// --- START: MEMOIZED CHILD COMPONENTS ---

// --- REDESIGNED: colorClasses with more specific keys for new design ---
const colorClasses = {
    indigo: { border: 'border-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-600', progress: 'bg-indigo-500', button: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    pink:   { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600', progress: 'bg-pink-500', button: 'bg-pink-500 hover:bg-pink-600 text-white' },
    teal:   { border: 'border-teal-500', bg: 'bg-teal-100', text: 'text-teal-600', progress: 'bg-teal-500', button: 'bg-teal-500 hover:bg-teal-600 text-white' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600', progress: 'bg-orange-500', button: 'bg-orange-500 hover:bg-orange-600 text-white' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', progress: 'bg-purple-500', button: 'bg-purple-500 hover:bg-purple-600 text-white' },
    red:    { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-600', progress: 'bg-red-500', button: 'bg-red-500 hover:bg-red-600 text-white' },
    green:  { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600', progress: 'bg-green-500', button: 'bg-green-500 hover:bg-green-600 text-white' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600', progress: 'bg-yellow-500', button: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
    gray:   { border: 'border-gray-300', bg: 'bg-gray-200', text: 'text-gray-500', progress: 'bg-gray-400', button: 'bg-gray-400 text-white' },
};

// --- REDESIGNED: PracticeCard Component ---
const PracticeCard = memo(({ practiceNumber, details, progress, onPracticeSelect, onRewardsClick, onReviewClick }) => {
    const colors = colorClasses[details.color] || colorClasses.gray;
    const isCompleted = progress && progress.total > 0 && progress.completed >= progress.total;
    const progressPercentage = progress && progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    
    return (
        <div className={`w-full bg-white border-l-4 ${colors.border} p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col group`}>
            {/* Main Content */}
            <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                    <div className={`${colors.bg} ${colors.text} rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg`}>
                       {practiceNumber}
                    </div>
                </div>
                <div className="ml-4 flex-grow">
                    <h3 className="font-bold text-lg text-slate-800">{details.title}</h3>
                    <p className="text-sm text-slate-500">{details.desc}</p>
                </div>
                <button 
                    onClick={() => onPracticeSelect(practiceNumber)}
                    className="ml-4 flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1 text-xs font-medium">
                    <span className="text-slate-500">Tiến độ</span>
                    {progress && progress.total > 0 ? (
                        <span className={`${colors.text}`}>{progress.completed} / {progress.total}</span>
                    ) : (
                        <span className="text-slate-400">Chưa có dữ liệu</span>
                    )}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`${colors.progress} h-2 rounded-full transition-all duration-500`} style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center gap-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); onRewardsClick(practiceNumber, details.title); }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors py-2 rounded-lg"
                >
                    <GiftIcon className="w-4 h-4" />
                    <span>Rewards</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onReviewClick(practiceNumber); }}
                    disabled={!isCompleted}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors py-2 rounded-lg"
                >
                    <RefreshIcon className="w-4 h-4" />
                    <span>Ôn tập</span>
                    {!isCompleted && <LockIcon className="w-4 h-4 ml-1 text-slate-400"/>}
                </button>
            </div>
        </div>
    );
});


const ReviewItem = memo(({ practiceNumber, previewLevel, isLocked, isCompleted, progress, colors, unlockText, onPracticeSelect }) => {
    return (
        <button
            onClick={() => !isLocked && onPracticeSelect(practiceNumber)}
            disabled={isLocked}
            className={`w-full bg-white border ${isLocked ? colors.border : `border-gray-200 ${colors.border}`} py-4 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
        >
            <div className="flex items-center">
                <div className={`${colors.bg} ${colors.text} rounded-full w-10 h-10 flex items-center justify-center mr-4 ${!isLocked ? colors.hoverBg : ''} transition-colors`}>
                    {isLocked ? <LockIcon className="w-5 h-5" /> : <span className="font-bold">P{previewLevel}</span>}
                </div>
                <div className="text-left">
                    <h3 className="font-medium text-gray-800">Preview {previewLevel}</h3>
                    <p className="text-xs text-gray-500 mt-1">{unlockText}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                {isCompleted ? (
                    <CompletedIcon className="w-6 h-6 text-green-500" />
                ) : (
                    !isLocked && progress && progress.total > 0 && (
                        <div className="text-right text-sm font-medium bg-gray-100 rounded-md px-2 py-0.5">
                            <span className="font-bold text-gray-800">{progress.completed}</span>
                            <span className="text-gray-400">/{progress.total}</span>
                        </div>
                    )
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${!isLocked ? colors.arrow : ''} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
        </button>
    );
});

// --- END: MEMOIZED CHILD COMPONENTS ---


// Component to display practice list with progress
function PracticeList({ selectedType, onPracticeSelect }) {
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [view, setView] = useState<'main' | 'reviews'>('main');
  const [selectedPracticeForReview, setSelectedPracticeForReview] = useState<number | null>(null);
  const [isRewardsPopupOpen, setIsRewardsPopupOpen] = useState(false);
  const [selectedPracticeForRewards, setSelectedPracticeForRewards] = useState<{ number: number | null, title: string }>({ number: null, title: '' });
  const [claimedRewards, setClaimedRewards] = useState({});

  const MAX_PREVIEWS = 5; // Define max number of preview levels

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- REFACTORED AND OPTIMIZED `useEffect` (NO CHANGE IN LOGIC) ---
  useEffect(() => {
    if (!user || !selectedType) {
      setLoading(false);
      return;
    }

    const calculateProgress = async () => {
      setLoading(true);
      try {
        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'openedVocab')),
          getDocs(collection(db, 'users', user.uid, 'completedWords')),
          getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);

        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        setClaimedRewards(userData.claimedQuizRewards || {});
        
        const userVocabSet = new Set(openedVocabSnapshot.docs.map(doc => doc.data().word?.toLowerCase()).filter(Boolean));

        const completedWordsByGameMode = {};
        completedWordsSnapshot.forEach(doc => {
          const gameModes = doc.data().gameModes;
          if (gameModes) {
            for (const mode in gameModes) {
              if (!completedWordsByGameMode[mode]) completedWordsByGameMode[mode] = new Set();
              completedWordsByGameMode[mode].add(doc.id.toLowerCase());
            }
          }
        });

        const completedMultiWordByGameMode = {};
        completedMultiWordSnapshot.forEach(docSnap => {
            const completedIn = docSnap.data().completedIn || {};
            for (const mode in completedIn) {
                if (!completedMultiWordByGameMode[mode]) completedMultiWordByGameMode[mode] = new Set();
                completedMultiWordByGameMode[mode].add(docSnap.id.toLowerCase());
            }
        });
        
        const sentenceToUserVocab = new Map();
        const wordToRelevantExampleSentences = new Map();
        const questionToUserVocab = new Map();

        if (userVocabSet.size > 0) {
            const vocabRegex = new RegExp(`\\b(${Array.from(userVocabSet).join('|')})\\b`, 'ig');
            exampleData.forEach(sentence => {
                const matches = sentence.english.match(vocabRegex);
                if (matches) {
                    const uniqueWords = [...new Set(matches.map(w => w.toLowerCase()))];
                    sentenceToUserVocab.set(sentence, uniqueWords);
                    uniqueWords.forEach(word => {
                        if (!wordToRelevantExampleSentences.has(word)) {
                            wordToRelevantExampleSentences.set(word, []);
                        }
                        wordToRelevantExampleSentences.get(word).push(sentence);
                    });
                }
            });

            if (selectedType === 'tracNghiem') {
                quizData.forEach(question => {
                    const matches = question.question.match(vocabRegex);
                    if (matches) {
                         const uniqueWords = [...new Set(matches.map(w => w.toLowerCase()))];
                         questionToUserVocab.set(question, uniqueWords);
                    }
                });
            }
        }
        
        const newProgressData = {};
        
        if (selectedType === 'tracNghiem') {
            const allModes = Array.from({ length: MAX_PREVIEWS + 1 }, (_, i) => i === 0 ? [1, 2, 3, 4] : [i*100+1, i*100+2, i*100+3, i*100+4]).flat();
            const totalP1 = questionToUserVocab.size;
            const totalP2_P3 = wordToRelevantExampleSentences.size;
            const totalP4 = userVocabSet.size;

            allModes.forEach(num => {
                const modeId = `quiz-${num}`;
                const baseNum = num % 100;
                const completedSet = completedWordsByGameMode[modeId] || new Set();

                if (baseNum === 1) {
                    let completedCount = 0;
                    questionToUserVocab.forEach(words => {
                        if (words.some(w => completedSet.has(w))) completedCount++;
                    });
                    newProgressData[num] = { completed: completedCount, total: totalP1 };
                } else if (baseNum === 2 || baseNum === 3) {
                    let completedCount = 0;
                    for (const word of wordToRelevantExampleSentences.keys()) {
                        if (completedSet.has(word)) completedCount++;
                    }
                    newProgressData[num] = { completed: completedCount, total: totalP2_P3 };
                } else if (baseNum === 4) {
                    newProgressData[num] = { completed: completedSet.size, total: totalP4 };
                }
            });

        } else if (selectedType === 'dienTu') {
            const allModes = Array.from({ length: MAX_PREVIEWS + 1 }, (_, i) => i === 0 ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6,7].map(n => i*100+n)).flat();
            
            const totals = { p1: userVocabSet.size, p2: wordToRelevantExampleSentences.size, p3: 0, p4: 0, p5: 0, p6: 0, p7: sentenceToUserVocab.size };
            sentenceToUserVocab.forEach(words => {
                if (words.length >= 2) totals.p3++;
                if (words.length >= 3) totals.p4++;
                if (words.length >= 4) totals.p5++;
                if (words.length >= 5) totals.p6++;
            });

            allModes.forEach(num => {
                const modeId = `fill-word-${num}`;
                const baseNum = num % 100;

                if (baseNum === 1) {
                    const completedSet = completedWordsByGameMode[modeId] || new Set();
                    newProgressData[num] = { completed: completedSet.size, total: totals.p1 };
                } else if (baseNum === 2) {
                    const completedSet = completedWordsByGameMode[modeId] || new Set();
                    let completedCount = 0;
                    for (const word of wordToRelevantExampleSentences.keys()) {
                        if (completedSet.has(word)) completedCount++;
                    }
                    newProgressData[num] = { completed: completedCount, total: totals.p2 };
                } else if (baseNum >= 3 && baseNum <= 7) {
                    const completedSet = completedMultiWordByGameMode[modeId] || new Set();
                    newProgressData[num] = { completed: completedSet.size, total: totals[`p${baseNum}`] };
                }
            });
        }
        
        setProgressData(newProgressData);

      } catch (error) {
        console.error("Lỗi khi tính toán tiến trình:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateProgress();
  }, [user, selectedType]);
  
  const practiceDetails = useMemo(() => ({
    tracNghiem: {
      '1': { title: 'Practice 1', desc: 'Luyện tập từ vựng qua câu hỏi', color: 'indigo' },
      '2': { title: 'Practice 2', desc: 'Điền 1 từ vào câu', color: 'pink' },
      '3': { title: 'Practice 3', desc: 'Điền 1 từ vào câu (không gợi ý nghĩa)', color: 'teal' },
      '4': { title: 'Practice 4', desc: 'Nghe audio và chọn từ đúng', color: 'orange' },
    },
    dienTu: {
      '1': { title: 'Practice 1', desc: 'Đoán từ qua hình ảnh', color: 'indigo' },
      '2': { title: 'Practice 2', desc: 'Điền 1 từ vào câu', color: 'pink' },
      '3': { title: 'Practice 3', desc: 'Điền 2 từ vào câu (Khó)', color: 'teal' },
      '4': { title: 'Practice 4', desc: 'Điền 3 từ vào câu (Rất Khó)', color: 'orange' },
      '5': { title: 'Practice 5', desc: 'Điền 4 từ vào câu (Siêu Khó)', color: 'purple' },
      '6': { title: 'Practice 6', desc: 'Điền 5 từ vào câu (Địa Ngục)', color: 'yellow' },
      '7': { title: 'Practice 7', desc: 'Điền tất cả từ đã học trong câu (Cực Đại)', color: 'red' },
    },
  }), []);
  
  const handleReviewClick = useCallback((practiceNumber) => {
    setSelectedPracticeForReview(practiceNumber);
    setView('reviews');
  }, []);
  
  const handleRewardsClick = useCallback((practiceNumber, practiceTitle) => {
    setSelectedPracticeForRewards({ number: practiceNumber, title: practiceTitle });
    setIsRewardsPopupOpen(true);
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="mt-4">Đang tải tiến độ...</p>
        </div>
    );
  }
  
  if (isRewardsPopupOpen) {
    return <RewardsPopup 
              isOpen={isRewardsPopupOpen}
              onClose={() => setIsRewardsPopupOpen(false)}
              practiceNumber={selectedPracticeForRewards.number}
              practiceTitle={selectedPracticeForRewards.title}
              progressData={progressData}
              claimedRewards={claimedRewards}
              setClaimedRewards={setClaimedRewards}
              user={user}
              selectedType={selectedType}
              MAX_PREVIEWS={MAX_PREVIEWS}
            />;
  }

  if (view === 'reviews' && selectedPracticeForReview) {
      const basePracticeDetails = practiceDetails[selectedType]?.[String(selectedPracticeForReview)];

      if (!basePracticeDetails) {
          return (
              <div className="text-center text-red-500">
                  <p>Lỗi: Không tìm thấy chi tiết bài tập.</p>
                  <button onClick={() => setView('main')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Quay lại</button>
              </div>
          );
      }
      const previewColors = ['purple', 'green', 'yellow', 'orange', 'pink'];
      return (
         <div className="w-full max-w-md mx-auto">
            <div className="sticky top-[-1.5rem] bg-slate-50 w-full text-center relative py-4 z-10">
                <button onClick={() => setView('main')} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Ôn tập: {basePracticeDetails.title}</h1>
            </div>
             <div className="space-y-4 w-full pt-2">
                {Array.from({ length: MAX_PREVIEWS }, (_, i) => i + 1).map(previewLevel => {
                    const prerequisiteId = previewLevel === 1 ? selectedPracticeForReview : ((previewLevel - 1) * 100) + selectedPracticeForReview; 
                    const practiceNumber = (previewLevel * 100) + selectedPracticeForReview;
                    const prerequisiteProgress = progressData[prerequisiteId];
                    const isLocked = !prerequisiteProgress || prerequisiteProgress.total === 0 || prerequisiteProgress.completed < prerequisiteProgress.total;
                    const progress = progressData[practiceNumber];
                    const isCompleted = !isLocked && progress && progress.total > 0 && progress.completed >= progress.total;
                    const colors = isLocked ? colorClasses.gray : colorClasses[previewColors[(previewLevel - 1) % previewColors.length]];
                    const prerequisiteName = previewLevel === 1 ? `Practice ${selectedPracticeForReview}` : `Preview ${previewLevel - 1}`;
                    const unlockText = isLocked ? `Hoàn thành ${prerequisiteName} để mở` : `Luyện tập lại các câu hỏi`;
                    if (previewLevel > 1) {
                         const oneLevelBeforeId = ((previewLevel - 2) === 0) ? selectedPracticeForReview : ((previewLevel - 2) * 100) + selectedPracticeForReview;
                         const oneLevelBeforeProgress = progressData[oneLevelBeforeId];
                         if (!oneLevelBeforeProgress || oneLevelBeforeProgress.total === 0 || oneLevelBeforeProgress.completed < oneLevelBeforeProgress.total) {
                             return null;
                         }
                    }

                    return (
                        <ReviewItem
                            key={practiceNumber}
                            practiceNumber={practiceNumber}
                            previewLevel={previewLevel}
                            isLocked={isLocked}
                            isCompleted={isCompleted}
                            progress={progress}
                            colors={colors}
                            unlockText={unlockText}
                            onPracticeSelect={onPracticeSelect}
                        />
                    );
                })}
             </div>
         </div>
      );
  }

  const practicesToShow = selectedType ? Object.keys(practiceDetails[selectedType]) : [];
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-5 w-full">
          {practicesToShow.map(pNumStr => {
            const practiceNumber = parseInt(pNumStr, 10);
            const details = practiceDetails[selectedType][practiceNumber];
            const progress = progressData[practiceNumber];
            return (
              <PracticeCard
                key={practiceNumber}
                practiceNumber={practiceNumber}
                details={details}
                progress={progress}
                onPracticeSelect={onPracticeSelect}
                onReviewClick={handleReviewClick}
                onRewardsClick={handleRewardsClick}
              />
            );
          })
        }
      </div>
    </div>
  );
};

// --- REDESIGNED --- Rewards Popup Component
const RewardsPopup = ({ isOpen, onClose, practiceNumber, practiceTitle, progressData, claimedRewards, setClaimedRewards, user, selectedType, MAX_PREVIEWS }) => {
    const [isClaiming, setIsClaiming] = useState(null);

    const handleClaim = useCallback(async (rewardId, coinAmount, capacityAmount) => {
        if (isClaiming || !user) return;
        setIsClaiming(rewardId);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                coins: increment(coinAmount),
                cardCapacity: increment(capacityAmount),
                [`claimedQuizRewards.${rewardId}`]: true
            });
            
            setClaimedRewards(prev => ({ ...prev, [rewardId]: true }));
        } catch (error) {
            console.error("Error claiming reward:", error);
            alert("Đã có lỗi xảy ra khi nhận thưởng.");
        } finally {
            setIsClaiming(null);
        }
    }, [isClaiming, user, setClaimedRewards]);

    const renderedTiers = useMemo(() => {
        const tiers = [];
        const BASE_REWARD_PER_100_Q = 1000;
        const MILESTONE_STEP = 100;
        const MAX_MILESTONES_TO_DISPLAY = 5;

        const generateTiersForLevel = (levelProgress, levelNumber, levelTitle, multiplier) => {
            if (!levelProgress || levelProgress.total === 0) return null;

            const isInactivePreview = levelProgress.completed === 0;
            let lastDisplayedMilestone = 0;
            const levelTiers = [];

            // Find the first unclaimed milestone
            for (let m = MILESTONE_STEP; m <= levelProgress.total + MILESTONE_STEP; m += MILESTONE_STEP) {
                 const rewardId = `${selectedType}-${levelNumber}-${m}`;
                 if (!claimedRewards[rewardId]) {
                     lastDisplayedMilestone = m - MILESTONE_STEP;
                     break;
                 }
                 if(m > levelProgress.total) lastDisplayedMilestone = m;
            }
             if (lastDisplayedMilestone > levelProgress.total) { // all claimed for this level
                return null;
            }

            for (let i = 1; i <= MAX_MILESTONES_TO_DISPLAY; i++) {
                const milestone = lastDisplayedMilestone + (i * MILESTONE_STEP);
                if (milestone > levelProgress.total + MILESTONE_STEP) break; // Don't show too far ahead

                const rewardId = `${selectedType}-${levelNumber}-${milestone}`;
                const isCompleted = levelProgress.completed >= milestone;
                const rewardAmount = (milestone / MILESTONE_STEP) * BASE_REWARD_PER_100_Q * multiplier;
                const capacityRewardAmount = 10;
                const progressPercentage = Math.min((levelProgress.completed / milestone) * 100, 100);

                levelTiers.push(
                    <div key={rewardId} className="relative bg-white p-4 rounded-xl shadow-sm border">
                       <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <h5 className="font-bold text-slate-700">Mốc {milestone} câu</h5>
                                <div className="text-right text-xs font-medium bg-slate-100 rounded-full px-2.5 py-1">
                                    <span className="font-bold text-slate-800">{levelProgress.completed}</span>
                                    <span className="text-slate-400">/{milestone}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-4">
                               <div className="flex items-center gap-3 flex-wrap">
                                    <div className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 inline-flex items-center gap-1.5 transition-colors text-sm font-semibold">
                                        <GoldCoinIcon className="w-4 h-4" />
                                        <span>{rewardAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-sky-100 text-sky-800 rounded-full px-3 py-1 inline-flex items-center gap-1.5 transition-colors text-sm font-semibold">
                                        <CardCapacityIcon className="w-4 h-4" />
                                        <span>+{capacityRewardAmount}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleClaim(rewardId, rewardAmount, capacityRewardAmount)}
                                    disabled={!isCompleted || isClaiming === rewardId || claimedRewards[rewardId]}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all w-24 text-center text-white ${
                                        claimedRewards[rewardId] ? 'bg-green-500 cursor-default' : 
                                        isCompleted ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400' : 
                                        'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {claimedRewards[rewardId] ? 'Đã nhận' : isClaiming === rewardId ? '...' : 'Nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            if (levelTiers.length > 0) {
              return (
                <div key={levelNumber} className="bg-slate-100 p-4 rounded-xl border">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg text-slate-800">{levelTitle}</h4>
                        {multiplier > 1 && (
                            <div className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm transition-colors ${
                                isInactivePreview
                                ? 'bg-slate-300 text-slate-600'
                                : 'text-white bg-gradient-to-r from-amber-500 to-orange-600'
                            }`}>
                                x{multiplier} Thưởng
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">{levelTiers}</div>
                </div>
              );
            }
            return null;
        };

        const mainProgress = progressData[practiceNumber];
        const mainTiers = generateTiersForLevel(mainProgress, practiceNumber, "Luyện tập chính", 1);
        if (mainTiers) tiers.push(mainTiers);

        for (let i = 1; i <= MAX_PREVIEWS; i++) {
            const previewNumber = (i * 100) + practiceNumber;
            const previewProgress = progressData[previewNumber];
            if (previewProgress && previewProgress.completed > 0) { // Only show active previews
                const multiplier = Math.pow(2, i);
                const previewTiers = generateTiersForLevel(previewProgress, previewNumber, `Ôn tập ${i}`, multiplier);
                if (previewTiers) tiers.push(previewTiers);
            }
        }
        
        if (tiers.length === 0) {
             const hasQuestions = mainProgress && mainProgress.total > 0;
             return (
                <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GiftIcon className="w-8 h-8"/>
                    </div>
                    <h4 className="font-bold text-lg text-slate-700">{hasQuestions ? "Hoàn thành!" : "Chưa có phần thưởng"}</h4>
                    <p className="mt-1 text-sm">{hasQuestions ? "Bạn đã nhận tất cả phần thưởng có sẵn trong mục này." : "Phần luyện tập này chưa có câu hỏi."}</p>
                </div>
             );
        }
        return tiers;
    }, [progressData, practiceNumber, selectedType, claimedRewards, MAX_PREVIEWS, isClaiming, handleClaim]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-50 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden transform transition-all animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                       <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-full text-amber-500"><GiftIcon className="w-5 h-5"/></div>
                       <span>Phần thưởng: {practiceTitle}</span>
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">×</button>
                </div>
                <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-5 hide-scrollbar">
                    {renderedTiers}
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};
