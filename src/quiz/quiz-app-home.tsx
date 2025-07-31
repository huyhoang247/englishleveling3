// --- START OF FILE: quiz-app-home.tsx ---

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import QuizApp from './quiz.tsx';
import Breadcrumbs from '../bread-crumbs.tsx';
import VocabularyGame from '../fill-word/fill-word-home.tsx';
import AnalysisDashboard from '../AnalysisDashboard.tsx';

// Import the new hook
import { useOptimizedQuizData } from '../hooks/useOptimizedQuizData.ts';

// Imports for rewards logic
import { db } from '../firebase.js';
import { doc, updateDoc, increment } from 'firebase/firestore';


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
    if (currentView === 'vocabularyGame' || currentView === 'quiz') {
      setCurrentView('practices');
      setSelectedPractice(null);
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
  }, [currentView]);

  const goHome = useCallback(() => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  }, []);

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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                  onClick={() => setCurrentView('analysis')}
                  className="w-full flex items-center p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-teal-300 group"
              >
                  <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                  </div>
                  <div className="ml-5 text-left flex-grow">
                      <h3 className="text-xl font-bold text-gray-800">Phân Tích</h3>
                      <p className="text-gray-500 text-sm mt-1">Xem tiến trình học tập của bạn</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="text-center"><h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Quiz {selectedQuiz}</h2><p className="mt-2 text-md text-gray-500">Chọn hình thức luyện tập bạn muốn.</p></div>
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
        <div className="min-h-svh h-svh bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-0">
          <div className="w-full h-full bg-white rounded-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
            <div className={'h-[calc(100%-8px)] flex flex-col'}>
              <div className="p-6">
                <div className="flex justify-start mb-2">
                   <Breadcrumbs currentView={currentView} selectedQuiz={selectedQuiz} selectedType={selectedType} selectedPractice={selectedPractice} goHome={goHome} setCurrentView={setCurrentView} />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-6 hide-scrollbar">{renderContent()}</div>
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
    <div className="h-svh overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full h-full bg-white flex flex-col">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 flex-shrink-0"></div>
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
      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// --- Icons (no changes needed) ---
const CompletedIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);
const LockIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>);
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.001 10a1 1 0 011-1h5a1 1 0 110 2H5a1 1 0 01-1-1zM15 13a1 1 0 011-1h.01a5.002 5.002 0 00-11.588-2.512 1 1 0 11-1.885-.666A7.002 7.002 0 0119 8.899V7a1 1 0 112 0v5a1 1 0 01-1 1h-5a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);
const GiftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 013-3h4a3 3 0 013 3v1h-2.155a3.003 3.003 0 00-2.845.879l-.15.225-.15-.225A3.003 3.003 0 007.155 6H5V5zm-2 3a2 2 0 00-2 2v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H3zm12 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>);
const GoldCoinIcon = ({ className }: { className: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin icon" className={className} />);
const CardCapacityIcon = ({ className }: { className: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000006160622f8a01c95a4a8eb982.png" alt="Card Capacity Icon" className={className} />);


// --- START: MEMOIZED CHILD COMPONENTS (no changes needed) ---
const colorClasses = { indigo: { border: 'hover:border-indigo-300', bg: 'bg-indigo-100', text: 'text-indigo-600', hoverBg: 'group-hover:bg-indigo-200', arrow: 'group-hover:text-indigo-500' }, pink: { border: 'hover:border-pink-300', bg: 'bg-pink-100', text: 'text-pink-600', hoverBg: 'group-hover:bg-pink-200', arrow: 'group-hover:text-pink-500' }, teal: { border: 'hover:border-teal-300', bg: 'bg-teal-100', text: 'text-teal-600', hoverBg: 'group-hover:bg-teal-200', arrow: 'group-hover:text-teal-500' }, orange: { border: 'hover:border-orange-300', bg: 'bg-orange-100', text: 'text-orange-600', hoverBg: 'group-hover:bg-orange-200', arrow: 'group-hover:text-orange-500' }, purple: { border: 'hover:border-purple-300', bg: 'bg-purple-100', text: 'text-purple-600', hoverBg: 'group-hover:bg-purple-200', arrow: 'group-hover:text-purple-500' }, red: { border: 'hover:border-red-300', bg: 'bg-red-100', text: 'text-red-600', hoverBg: 'group-hover:bg-red-200', arrow: 'group-hover:text-red-500' }, green: { border: 'hover:border-green-300', bg: 'bg-green-100', text: 'text-green-600', hoverBg: 'group-hover:bg-green-200', arrow: 'group-hover:text-green-500' }, yellow: { border: 'hover:border-yellow-300', bg: 'bg-yellow-100', text: 'text-yellow-600', hoverBg: 'group-hover:bg-yellow-200', arrow: 'group-hover:text-yellow-500' }, gray: { border: 'border-gray-300', bg: 'bg-gray-200', text: 'text-gray-500', hoverBg: 'group-hover:bg-gray-200', arrow: 'group-hover:text-gray-400' }, };
const PracticeCard = memo(({ practiceNumber, details, progress, onPracticeSelect, onRewardsClick, onReviewClick }) => { /* ... NO CHANGE ... */ });
const ReviewItem = memo(({ practiceNumber, previewLevel, isLocked, isCompleted, progress, colors, unlockText, onPracticeSelect }) => { /* ... NO CHANGE ... */ });
// --- END: MEMOIZED CHILD COMPONENTS ---


// THIS COMPONENT IS NOW MUCH SIMPLER AND FASTER
function PracticeList({ selectedType, onPracticeSelect }) {
  // Get all pre-computed data from our central hook
  const { loading, progressData, user, error, claimedRewards: initialClaimed } = useOptimizedQuizData();

  // Local UI state remains the same
  const [view, setView] = useState<'main' | 'reviews'>('main');
  const [selectedPracticeForReview, setSelectedPracticeForReview] = useState<number | null>(null);
  const [isRewardsPopupOpen, setIsRewardsPopupOpen] = useState(false);
  const [selectedPracticeForRewards, setSelectedPracticeForRewards] = useState<{ number: number | null, title: string }>({ number: null, title: '' });
  const [claimedRewards, setClaimedRewards] = useState(initialClaimed);

  const MAX_PREVIEWS = 5;

  useEffect(() => {
    setClaimedRewards(initialClaimed);
  }, [initialClaimed]);

  const practiceDetails = useMemo(() => ({
    tracNghiem: { '1': { title: 'Practice 1', desc: 'Luyện tập từ vựng qua câu hỏi', color: 'indigo' }, '2': { title: 'Practice 2', desc: 'Điền 1 từ vào câu', color: 'pink' }, '3': { title: 'Practice 3', desc: 'Điền 1 từ vào câu (không gợi ý nghĩa)', color: 'teal' }, },
    dienTu: { '1': { title: 'Practice 1', desc: 'Đoán từ qua hình ảnh', color: 'indigo' }, '2': { title: 'Practice 2', desc: 'Điền 1 từ vào câu', color: 'pink' }, '3': { title: 'Practice 3', desc: 'Điền 2 từ vào câu (Khó)', color: 'teal' }, '4': { title: 'Practice 4', desc: 'Điền 3 từ vào câu (Rất Khó)', color: 'orange' }, '5': { title: 'Practice 5', desc: 'Điền 4 từ vào câu (Siêu Khó)', color: 'purple' }, '6': { title: 'Practice 6', desc: 'Điền 5 từ vào câu (Địa Ngục)', color: 'yellow' }, '7': { title: 'Practice 7', desc: 'Điền tất cả từ đã học trong câu (Cực Đại)', color: 'red' }, },
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
  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }
  
  if (isRewardsPopupOpen) {
    return <RewardsPopup 
              isOpen={isRewardsPopupOpen}
              onClose={() => setIsRewardsPopupOpen(false)}
              practiceNumber={selectedPracticeForRewards.number}
              practiceTitle={selectedPracticeForRewards.title}
              progressData={progressData} // Pass the map directly
              claimedRewards={claimedRewards}
              setClaimedRewards={setClaimedRewards}
              user={user}
              selectedType={selectedType}
              MAX_PREVIEWS={MAX_PREVIEWS}
            />;
  }

  if (view === 'reviews' && selectedPracticeForReview) {
      const basePracticeDetails = practiceDetails[selectedType]?.[String(selectedPracticeForReview)];
      if (!basePracticeDetails) { return <div>Lỗi: Không tìm thấy bài tập.</div> }

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
                    const prerequisiteProgress = progressData.get(prerequisiteId);
                    const isLocked = !prerequisiteProgress || prerequisiteProgress.total === 0 || prerequisiteProgress.completed < prerequisiteProgress.total;
                    const progress = progressData.get(practiceNumber);
                    const isCompleted = !isLocked && progress && progress.total > 0 && progress.completed >= progress.total;
                    const colors = isLocked ? colorClasses.gray : colorClasses[previewColors[(previewLevel - 1) % previewColors.length]];
                    const prerequisiteName = previewLevel === 1 ? `Practice ${selectedPracticeForReview}` : `Preview ${previewLevel - 1}`;
                    const unlockText = isLocked ? `Hoàn thành tất cả câu ở ${prerequisiteName} để mở` : `Luyện tập lại các câu hỏi`;
                    if (previewLevel > 1) {
                         const oneLevelBeforeId = ((previewLevel - 2) === 0) ? selectedPracticeForReview : ((previewLevel - 2) * 100) + selectedPracticeForReview;
                         const oneLevelBeforeProgress = progressData.get(oneLevelBeforeId);
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
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4 w-full pt-2">
          {practicesToShow.map(pNumStr => {
            const practiceNumber = parseInt(pNumStr, 10);
            const details = practiceDetails[selectedType][practiceNumber];
            const progress = progressData.get(practiceNumber);
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

        const generateTiersForLevel = (levelNumber, levelTitle, multiplier) => {
            const levelProgress = progressData.get(levelNumber);
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
                        {/* ... The rest of the tier rendering logic is identical ... */}
                    </div>
                );
            }
            if (levelTiers.length > 0) {
              return ( <div key={levelNumber} className="bg-gray-100 p-4 rounded-lg"> {/*... Tier wrapper ... */} </div> );
            }
            return null;
        };

        const mainProgress = progressData.get(practiceNumber);
        const mainTiers = generateTiersForLevel(practiceNumber, "Luyện tập chính", 1);
        if (mainTiers) tiers.push(mainTiers);

        for (let i = 1; i <= MAX_PREVIEWS; i++) {
            const previewNumber = (i * 100) + practiceNumber;
            const multiplier = Math.pow(2, i);
            const previewTiers = generateTiersForLevel(previewNumber, `Preview ${i}`, multiplier);
            if (previewTiers) tiers.push(previewTiers);
        }
        
        if (tiers.length === 0) {
             const hasQuestions = mainProgress && mainProgress.total > 0;
             return ( <div className="text-center py-8 text-gray-500">{/* ... No rewards message ... */}</div> );
        }
        return tiers;
    }, [progressData, practiceNumber, selectedType, claimedRewards, MAX_PREVIEWS, isClaiming, handleClaim]);


    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}> {/*... Popup JSX ...*/} </div> );
};
