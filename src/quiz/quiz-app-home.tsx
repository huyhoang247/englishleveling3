// --- START OF FILE: quiz-app-home.tsx ---

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import QuizApp from './quiz.tsx';
import VocabularyGame from '../fill-word/fill-word-home.tsx';
import AnalysisDashboard from '../AnalysisDashboard.tsx';
import WordChainGame from '../word-chain-game.tsx';

// Imports for progress calculation
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import quizData from './quiz-data.ts';
import { exampleData } from '../example-data.ts';


// --- START: UNIFIED HEADER COMPONENT (NO BREADCRUMBS) ---

// Props Interface for AppHeader
interface AppHeaderProps {
  currentView: string;
  selectedType: string | null;
  goBack: () => void;
  goHome: () => void;
  setCurrentView: (view: string) => void;
}

// Icon Components for Header
const HomeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const BackIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const AnalysisIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

// The Header Component Function
function AppHeader({
  currentView,
  selectedType,
  goBack,
  goHome,
  setCurrentView,
}: AppHeaderProps) {
  
  const headerTitle = useMemo(() => {
    switch (currentView) {
      case 'quizTypes':
        return 'Luyện tập';
      case 'practices':
        return selectedType === 'tracNghiem' ? 'Trắc nghiệm' : 'Điền từ';
      default:
        return null; // No title for main screen
    }
  }, [currentView, selectedType]);

  // This header is not rendered for fullscreen views, as they have their own.
  if (['quiz', 'vocabularyGame', 'wordChainGame', 'analysis'].includes(currentView)) {
      return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex-1">
            {currentView === 'main' ? (
              <a className="flex items-center gap-2 text-gray-800" href="#" onClick={(e) => { e.preventDefault(); goHome(); }}>
                 <span className="text-2xl">📚</span>
                 <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Quiz App</span>
              </a>
            ) : (
              <button onClick={goBack} className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors" aria-label="Quay lại">
                <BackIcon />
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-center">
            {headerTitle && (
              <h2 className="text-lg font-bold text-gray-800">{headerTitle}</h2>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-4">
              {currentView === 'main' ? (
                <button 
                  onClick={() => setCurrentView('analysis')}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                  aria-label="Xem phân tích"
                >
                    <AnalysisIcon />
                </button>
              ) : (
                 <button onClick={goHome} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors" aria-label="Về trang chủ">
                    <HomeIcon />
                 </button>
              )}
          </div>
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
    </header>
  );
}
// --- END: UNIFIED HEADER COMPONENT ---


export default function QuizAppHome() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);

  const handleQuizSelect = useCallback((quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quizTypes');
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType(type);
    setCurrentView('practices');
    setSelectedPractice(null);
  }, []);

  const handlePracticeSelect = useCallback((practice: number) => {
    setSelectedPractice(practice);
    if (selectedType === 'tracNghiem') {
      setCurrentView('quiz');
    } else if (selectedType === 'dienTu') {
      setCurrentView('vocabularyGame');
    }
  }, [selectedType]);

  const goBack = useCallback(() => {
    if (currentView === 'vocabularyGame' || currentView === 'quiz') {
       setCurrentView('practices');
       setSelectedPractice(null);
    } else if (currentView === 'wordChainGame' || currentView === 'analysis') {
       setCurrentView('main');
    } else if (currentView === 'practices') {
      setCurrentView('quizTypes');
      setSelectedType(null);
    } else if (currentView === 'quizTypes') {
      setCurrentView('main');
    }
  }, [currentView]);

  const goHome = useCallback(() => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

  // --- Fullscreen Views Logic ---
  if (['quiz', 'vocabularyGame', 'wordChainGame', 'analysis'].includes(currentView)) {
      let title = '';
      let ViewComponent = null;

      switch(currentView) {
          case 'quiz':
              title = `Trắc nghiệm - Practice ${selectedPractice % 100}`;
              ViewComponent = <QuizApp onGoBack={goBack} selectedPractice={selectedPractice} />;
              break;
          case 'vocabularyGame':
              title = `Điền từ - Practice ${selectedPractice % 100}`;
              ViewComponent = <VocabularyGame onGoBack={goBack} selectedPractice={selectedPractice} />;
              break;
          case 'wordChainGame':
              title = 'Nối Từ';
              ViewComponent = <WordChainGame onGoBack={goBack} />;
              break;
          case 'analysis':
              title = 'Phân Tích Tiến Trình';
              ViewComponent = <AnalysisDashboard />;
              break;
      }

      // QuizApp and VocabularyGame might have their own headers. 
      // For a 100% consistent UI, you would refactor them to use a common header component.
      // Here, we provide a unified structure for all.
      // If the inner component (e.g., QuizApp) has its own header, you might see two.
      // It's recommended to remove the header from the child components and let this parent manage it.
      
      // Let's assume for now that child components like QuizApp DO NOT have their own header.
      return (
        <div className="fixed inset-0 z-[51] bg-white flex flex-col">
            <header className="flex-shrink-0 sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b flex items-center justify-between">
                <button onClick={goBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                    <BackIcon className="h-5 w-5"/>
                    <span>Quay lại</span>
                </button>
                <h2 className="text-lg font-bold text-gray-800 truncate px-2">{title}</h2>
                <div className="w-28 text-right">
                   {/* Optional: Add a Home button here for quick exit */}
                   <button onClick={goHome} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors" aria-label="Về trang chủ">
                      <HomeIcon className="h-5 w-5"/>
                   </button>
                </div>
            </header>
            <div className="flex-grow overflow-y-auto">
                {ViewComponent}
            </div>
        </div>
      );
  }
  
  const renderContent = () => {
    switch(currentView) {
      case 'main':
        return (
          <div className="flex flex-col items-center gap-8 w-full pt-8">
            <div className="w-full max-w-md space-y-5">
              <button
                onClick={() => handleQuizSelect(1)}
                className="w-full flex items-center p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-300 group"
              >
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                  <span className="text-4xl">💪</span>
                </div>
                <div className="ml-5 text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-800">Luyện tập</h3>
                  <p className="text-gray-500 text-sm mt-1">Luyện tập các câu hỏi trắc nghiệm & điền từ</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                  onClick={() => setCurrentView('wordChainGame')}
                  className="w-full flex items-center p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-purple-300 group"
              >
                  <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="ml-5 text-left flex-grow">
                      <h3 className="text-xl font-bold text-gray-800">Nối Từ</h3>
                      <p className="text-gray-500 text-sm mt-1">Thử thách nối từ với kho từ vựng của bạn</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
              </button>

              <div className="relative w-full flex items-center p-5 bg-gray-50 rounded-2xl shadow-md border border-gray-200 cursor-not-allowed opacity-80">
                <div className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">Sắp ra mắt</div>
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm"><span className="text-4xl">📄</span></div>
                <div className="ml-5 text-left flex-grow"><h3 className="text-xl font-bold text-gray-500">Đề Thi</h3><p className="text-gray-400 text-sm mt-1">Kiểm tra kiến thức với các đề thi thử</p></div>
              </div>
              <div className="relative w-full flex items-center p-5 bg-gray-50 rounded-2xl shadow-md border border-gray-200 cursor-not-allowed opacity-80">
                <div className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">Sắp ra mắt</div>
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm"><span className="text-4xl">📖</span></div>
                <div className="ml-5 text-left flex-grow"><h3 className="text-xl font-bold text-gray-500">Ngữ Pháp</h3><p className="text-gray-400 text-sm mt-1">Luyện tập các chủ điểm ngữ pháp</p></div>
              </div>
            </div>
          </div>
        );
      case 'quizTypes':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div className="text-center"><h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Chọn hình thức</h2><p className="mt-2 text-md text-gray-500">Bạn muốn luyện tập theo cách nào?</p></div>
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

  return (
    <div className="h-svh overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full h-full bg-white flex flex-col">
        <AppHeader 
          currentView={currentView}
          selectedType={selectedType}
          goBack={goBack}
          goHome={goHome}
          setCurrentView={setCurrentView}
        />
        <main className="flex-grow overflow-y-auto">
          <div className="p-6 pb-32 max-w-screen-xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
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

const colorClasses = {
    indigo: { border: 'hover:border-indigo-300', bg: 'bg-indigo-100', text: 'text-indigo-600', hoverBg: 'group-hover:bg-indigo-200', arrow: 'group-hover:text-indigo-500' },
    pink:   { border: 'hover:border-pink-300',   bg: 'bg-pink-100',   text: 'text-pink-600',   hoverBg: 'group-hover:bg-pink-200',   arrow: 'group-hover:text-pink-500' },
    teal:   { border: 'hover:border-teal-300',   bg: 'bg-teal-100',   text: 'text-teal-600',   hoverBg: 'group-hover:bg-teal-200',   arrow: 'group-hover:text-teal-500' },
    orange: { border: 'hover:border-orange-300', bg: 'bg-orange-100', text: 'text-orange-600', hoverBg: 'group-hover:bg-orange-200', arrow: 'group-hover:text-orange-500' },
    purple: { border: 'hover:border-purple-300', bg: 'bg-purple-100', text: 'text-purple-600', hoverBg: 'group-hover:bg-purple-200', arrow: 'group-hover:text-purple-500' },
    red:    { border: 'hover:border-red-300',    bg: 'bg-red-100',    text: 'text-red-600',    hoverBg: 'group-hover:bg-red-200',    arrow: 'group-hover:text-red-500' },
    green:  { border: 'hover:border-green-300',  bg: 'bg-green-100',  text: 'text-green-600',  hoverBg: 'group-hover:bg-green-200',  arrow: 'group-hover:text-green-500' },
    yellow: { border: 'hover:border-yellow-300', bg: 'bg-yellow-100', text: 'text-yellow-600', hoverBg: 'group-hover:bg-yellow-200', arrow: 'group-hover:text-yellow-500' },
    gray:   { border: 'border-gray-300', bg: 'bg-gray-200', text: 'text-gray-500', hoverBg: 'group-hover:bg-gray-200', arrow: 'group-hover:text-gray-400' },
};

const PracticeCard = memo(({ practiceNumber, details, progress, onPracticeSelect, onRewardsClick, onReviewClick }) => {
    const colors = colorClasses[details.color] || colorClasses.gray;
    const isCompleted = progress && progress.total > 0 && progress.completed >= progress.total;

    return (
        <div
            onClick={() => onPracticeSelect(practiceNumber)}
            className={`w-full bg-white border border-gray-200 ${colors.border} p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer`}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center flex-grow">
                    <div className={`${colors.bg} ${colors.text} rounded-full w-10 h-10 flex items-center justify-center mr-4 ${colors.hoverBg} transition-colors`}>
                       <span className="font-bold">{practiceNumber}</span>
                    </div>
                    <div className="text-left flex-grow">
                        <h3 className="font-medium text-gray-800">{details.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{details.desc}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 sm:gap-4 pl-2">
                    {isCompleted ? (
                        <CompletedIcon className="w-6 h-6 text-green-500" />
                    ) : (
                        progress && progress.total > 0 && (
                            <div className="text-right text-sm font-medium bg-gray-100 rounded-md px-2 py-0.5">
                                <span className="font-bold text-gray-800">{progress.completed}</span>
                                <span className="text-gray-400">/{progress.total}</span>
                            </div>
                        )
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${colors.arrow} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                <button 
                    onClick={(e) => { e.stopPropagation(); onRewardsClick(practiceNumber, details.title); }}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <GiftIcon className="w-4 h-4" />
                    <span>Rewards</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onReviewClick(practiceNumber); }}
                    disabled={!isCompleted}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshIcon className="w-4 h-4" />
                    <span>Ôn tập</span>
                    {!isCompleted && <LockIcon className="w-4 h-4 ml-1 text-gray-400"/>}
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

  // --- REFACTORED AND OPTIMIZED `useEffect` ---
  useEffect(() => {
    if (!user || !selectedType) {
      setLoading(false);
      return;
    }

    const calculateProgress = async () => {
      setLoading(true);
      try {
        // 1. DATA FETCHING
        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'openedVocab')),
          getDocs(collection(db, 'users', user.uid, 'completedWords')),
          getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);

        // 2. PREPARE FAST LOOKUP STRUCTURES
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

        // 3. EFFICIENT PRE-COMPUTATION
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
        
        // 4. CALCULATE PROGRESS
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
                    newProgressData[num] = { completed: (completedWordsByGameMode[modeId] || new Set()).size, total: totals.p1 };
                } else if (baseNum === 2) {
                    let completedCount = 0;
                    const completedSet = completedWordsByGameMode[modeId] || new Set();
                    for (const word of wordToRelevantExampleSentences.keys()) {
                        if (completedSet.has(word)) completedCount++;
                    }
                    newProgressData[num] = { completed: completedCount, total: totals.p2 };
                } else if (baseNum >= 3 && baseNum <= 7) {
                    newProgressData[num] = { completed: (completedMultiWordByGameMode[modeId] || new Set()).size, total: totals[`p${baseNum}`] };
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
    return <div className="text-center text-gray-500">Đang tải tiến độ...</div>;
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
          return ( <div className="text-center text-red-500"><p>Lỗi: Không tìm thấy chi tiết bài tập.</p><button onClick={() => setView('main')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Quay lại</button></div> );
      }
      const previewColors = ['purple', 'green', 'yellow', 'orange', 'pink'];
      return (
         <div className="w-full max-w-md mx-auto">
            <div className="sticky top-[-1.5rem] bg-white w-full text-center relative py-4 z-10">
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
                    const unlockText = isLocked ? `Hoàn thành tất cả câu ở ${prerequisiteName} để mở` : `Luyện tập lại các câu hỏi`;
                    if (previewLevel > 1) {
                         const oneLevelBeforeId = ((previewLevel - 2) === 0) ? selectedPracticeForReview : ((previewLevel - 2) * 100) + selectedPracticeForReview;
                         const oneLevelBeforeProgress = progressData[oneLevelBeforeId];
                         if (!oneLevelBeforeProgress || oneLevelBeforeProgress.total === 0 || oneLevelBeforeProgress.completed < oneLevelBeforeProgress.total) { return null; }
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
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4 w-full pt-2">
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

// --- Rewards Popup Component ---
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
            const levelTiers = [];
            const maxPossibleMilestone = Math.floor(levelProgress.total / MILESTONE_STEP) * MILESTONE_STEP;
            for (let i = 1; i <= MAX_MILESTONES_TO_DISPLAY; i++) {
                const milestone = i * MILESTONE_STEP;
                if (milestone > maxPossibleMilestone + MILESTONE_STEP) break;
                const rewardId = `${selectedType}-${levelNumber}-${milestone}`;
                if (claimedRewards[rewardId]) continue;
                const isCompleted = levelProgress.completed >= milestone;
                const isLockedDueToNoProgress = levelProgress.completed === 0 && milestone > 0;
                const rewardAmount = i * BASE_REWARD_PER_100_Q * multiplier;
                const capacityRewardAmount = 10;
                const progressPercentage = Math.min((levelProgress.completed / milestone) * 100, 100);
                levelTiers.push(
                    <div key={rewardId} className="relative bg-white p-4 rounded-lg shadow-sm overflow-hidden">
                        <div className="absolute top-0 left-0 bg-gray-800/70 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-20">Stage {i}</div>
                        <div className="pt-5 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div>
                                <div className="flex-shrink-0 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1">
                                    {!isCompleted && (levelProgress.completed > 0 ? <CompletedIcon className="w-4 h-4 text-gray-400" /> : <LockIcon className="w-3.5 h-3.5 text-gray-400"/>)}
                                    <span>{`${levelProgress.completed}/${milestone}`}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className={`${isLockedDueToNoProgress ? 'bg-gray-200' : 'bg-orange-100'} rounded-full px-3 py-1 inline-flex items-center gap-1.5 transition-colors`}>
                                            <GoldCoinIcon className={`w-4 h-4 transition-all ${isLockedDueToNoProgress ? 'grayscale' : ''}`} />
                                            <span className={`text-sm font-bold ${isLockedDueToNoProgress ? 'text-gray-500' : 'text-orange-700'} transition-colors`}>{rewardAmount.toLocaleString()}</span>
                                        </div>
                                        <div className={`${isLockedDueToNoProgress ? 'bg-gray-200' : 'bg-blue-100'} rounded-full px-3 py-1 inline-flex items-center gap-1.5 transition-colors`}>
                                            <CardCapacityIcon className={`w-4 h-4 transition-all ${isLockedDueToNoProgress ? 'grayscale' : ''}`} />
                                            <span className={`text-sm font-bold ${isLockedDueToNoProgress ? 'text-gray-500' : 'text-blue-700'} transition-colors`}>{capacityRewardAmount}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                        <button onClick={() => handleClaim(rewardId, rewardAmount, capacityRewardAmount)} disabled={!isCompleted || isClaiming === rewardId} className={`px-3 py-1.5 text-xs font-bold rounded-full transition w-[60px] text-center ${isCompleted ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                                            {isClaiming === rewardId ? '...' : 'Nhận'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            if (levelTiers.length > 0) {
              return (
                <div key={levelNumber} className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-700">{levelTitle}</h4>
                        {multiplier > 1 && (<div className={`text-sm font-bold px-2.5 py-1 rounded-full shadow transition-colors ${isInactivePreview ? 'bg-gray-300 text-gray-500' : 'text-white bg-gradient-to-r from-amber-500 to-orange-600'}`}>x{multiplier} Thưởng</div>)}
                    </div>
                    <div className="space-y-3">{levelTiers}</div>
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
            const multiplier = Math.pow(2, i);
            const previewTiers = generateTiersForLevel(previewProgress, previewNumber, `Preview ${i}`, multiplier);
            if (previewTiers) tiers.push(previewTiers);
        }
        if (tiers.length === 0) {
             const hasQuestions = mainProgress && mainProgress.total > 0;
             return (<div className="text-center py-8 text-gray-500"><GiftIcon className="w-12 h-12 mx-auto text-green-500 mb-4" /><h4 className="font-bold text-lg text-gray-700">{hasQuestions ? "Hoàn thành!" : "Chưa có phần thưởng"}</h4><p className="mt-1">{hasQuestions ? "Bạn đã nhận tất cả phần thưởng có sẵn." : "Phần luyện tập này chưa có câu hỏi."}</p></div>);
        }
        return tiers;
    }, [progressData, practiceNumber, selectedType, claimedRewards, MAX_PREVIEWS, isClaiming, handleClaim]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden transform transition-all animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><GiftIcon className="w-6 h-6 text-yellow-500"/>Rewards: {practiceTitle}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>
                <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4 bg-gray-50 hide-scrollbar">{renderedTiers}</div>
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
