// --- START OF FILE: quiz-app-home.tsx ---

import { useState, useEffect } from 'react';
import QuizApp from './quiz.tsx';
import Breadcrumbs from '../bread-crumbs.tsx';
import VocabularyGame from '../fill-word/fill-word-home.tsx';

// Imports for progress calculation
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import quizData from './quiz-data.ts';
import { exampleData } from '../example-data.ts';

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
    setCurrentView('practices');
    setSelectedPractice(null);
  };

  const handlePracticeSelect = (practice) => {
    setSelectedPractice(practice);
    if (selectedType === 'tracNghiem') {
      setCurrentView('quiz');
    } else if (selectedType === 'dienTu') {
      setCurrentView('vocabularyGame');
    }
  };

  const goBack = () => {
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
  };

  const goHome = () => {
    setCurrentView('main');
    setSelectedQuiz(null);
    setSelectedType(null);
    setSelectedPractice(null);
  };

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
        <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-0">
          <div className="w-full h-full bg-white rounded-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
            <div className={'h-[calc(100%-8px)] flex flex-col'}>
              <div className="p-6">
                <div className="flex justify-start mb-2">
                   <Breadcrumbs currentView={currentView} selectedQuiz={selectedQuiz} selectedType={selectedType} selectedPractice={selectedPractice} goHome={goHome} setCurrentView={setCurrentView} />
                </div>
              </div>
              <div className="overflow-y-auto p-6">{renderContent()}</div>
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

// SVG Icons (LockIcon, RefreshIcon)
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

// Component to display practice list with progress
const PracticeList = ({ selectedType, onPracticeSelect }) => {
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [view, setView] = useState<'main' | 'reviews'>('main');
  const [selectedPracticeForReview, setSelectedPracticeForReview] = useState<number | null>(null);

  const MAX_PREVIEWS = 5; // Define max number of preview levels

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !selectedType) {
      setLoading(false);
      return;
    }

    const calculateProgress = async () => {
      setLoading(true);
      try {
        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'openedVocab')),
          getDocs(collection(db, 'users', user.uid, 'completedWords'))
        ]);
        
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const userVocabulary = openedVocabSnapshot.docs.map(doc => doc.data().word).filter(Boolean);

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

        let newProgressData = {};
        
        if (selectedType === 'tracNghiem') {
            const allQuizModes = ['quiz-1', 'quiz-2'];
            for(let i = 1; i <= MAX_PREVIEWS; i++) {
                allQuizModes.push(`quiz-${i*100 + 1}`, `quiz-${i*100 + 2}`);
            }

            allQuizModes.forEach(mode => {
                const practiceNum = parseInt(mode.split('-')[1]);
                if (!practiceNum) return;

                const completedSet = completedWordsByGameMode[mode] || new Set();

                if (practiceNum % 100 === 1) {
                    const totalQs = quizData.filter(q => userVocabulary.some(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question)));
                    const completed = totalQs.filter(q => {
                        const word = userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question));
                        return word && completedSet.has(word.toLowerCase());
                    }).length;
                    newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
                } else if (practiceNum % 100 === 2) {
                    const totalQs = userVocabulary.flatMap(word => exampleData.some(ex => new RegExp(`\\b${word}\\b`, 'i').test(ex.english)) ? [{ word }] : []);
                    const completed = totalQs.filter(q => completedSet.has(q.word.toLowerCase())).length;
                    newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
                }
            });

        } else if (selectedType === 'dienTu') {
            const allFillModes = ['fill-word-1', 'fill-word-2', 'fill-word-3'];
            for(let i = 1; i <= MAX_PREVIEWS; i++) {
                allFillModes.push(`fill-word-${i*100 + 1}`, `fill-word-${i*100 + 2}`, `fill-word-${i*100 + 3}`);
            }

            allFillModes.forEach(mode => {
                const practiceNum = parseInt(mode.split('-')[2]);
                if(!practiceNum) return;

                const completedSet = completedWordsByGameMode[mode] || new Set();
                let progress = {};

                if (practiceNum % 100 === 1) {
                    progress = { completed: completedSet.size, total: userVocabulary.length };
                } else if (practiceNum % 100 === 2) {
                    const totalQs = userVocabulary.filter(word => exampleData.some(ex => new RegExp(`\\b${word}\\b`, 'i').test(ex.english)));
                    const completed = totalQs.filter(word => completedSet.has(word.toLowerCase())).length;
                    progress = { completed: completed, total: totalQs.length };
                } else if (practiceNum % 100 === 3) {
                     let totalP3 = 0;
                     exampleData.forEach(sentence => {
                         const wordsInSentence = userVocabulary.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                         if (wordsInSentence.length >= 2) totalP3++;
                     });
                     const completedP3Map = userData.completedMultiWordQuestions || {};
                     const completedCount = Object.keys(completedP3Map).length;
                     progress = { completed: completedCount, total: totalP3 };
                }
                newProgressData[practiceNum] = progress;
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
  
  const practiceDetails = {
    tracNghiem: {
      '1': { title: 'Practice 1', desc: 'Luyện tập từ vựng qua câu hỏi', color: 'indigo' },
      '2': { title: 'Practice 2', desc: 'Điền 1 từ vào câu', color: 'pink' },
    },
    dienTu: {
      '1': { title: 'Practice 1', desc: 'Đoán từ qua hình ảnh', color: 'indigo' },
      '2': { title: 'Practice 2', desc: 'Điền 1 từ vào câu', color: 'pink' },
      '3': { title: 'Practice 3', desc: 'Điền 2 từ vào câu (Khó)', color: 'teal' },
    },
  };
  
  const colorClasses = {
    indigo: { border: 'hover:border-indigo-300', bg: 'bg-indigo-100', text: 'text-indigo-600', hoverBg: 'group-hover:bg-indigo-200', arrow: 'group-hover:text-indigo-500' },
    pink:   { border: 'hover:border-pink-300',   bg: 'bg-pink-100',   text: 'text-pink-600',   hoverBg: 'group-hover:bg-pink-200',   arrow: 'group-hover:text-pink-500' },
    teal:   { border: 'hover:border-teal-300',   bg: 'bg-teal-100',   text: 'text-teal-600',   hoverBg: 'group-hover:bg-teal-200',   arrow: 'group-hover:text-teal-500' },
    orange: { border: 'hover:border-orange-300', bg: 'bg-orange-100', text: 'text-orange-600', hoverBg: 'group-hover:bg-orange-200', arrow: 'group-hover:text-orange-500' },
    purple: { border: 'hover:border-purple-300', bg: 'bg-purple-100', text: 'text-purple-600', hoverBg: 'group-hover:bg-purple-200', arrow: 'group-hover:text-purple-500' },
    green:  { border: 'hover:border-green-300',  bg: 'bg-green-100',  text: 'text-green-600',  hoverBg: 'group-hover:bg-green-200',  arrow: 'group-hover:text-green-500' },
    yellow: { border: 'hover:border-yellow-300', bg: 'bg-yellow-100', text: 'text-yellow-600', hoverBg: 'group-hover:bg-yellow-200', arrow: 'group-hover:text-yellow-500' },
    gray:   { border: 'border-gray-300', bg: 'bg-gray-200', text: 'text-gray-500', hoverBg: 'group-hover:bg-gray-200', arrow: 'group-hover:text-gray-400' },
  };

  const handleReviewClick = (e, practiceNumber) => {
    e.stopPropagation();
    setSelectedPracticeForReview(practiceNumber);
    setView('reviews');
  };

  if (loading) {
    return <div className="text-center text-gray-500">Đang tải tiến độ...</div>;
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
         <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
            <div className="w-full text-center relative mb-6">
                <button onClick={() => setView('main')} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Ôn tập: {basePracticeDetails.title}</h1>
            </div>
             <div className="space-y-4 w-full">
                {Array.from({ length: MAX_PREVIEWS }, (_, i) => i + 1).map(previewLevel => {
                    // --- [FIX] START OF CORRECTION ---
                    // The logic that hid the component (`return null`) has been removed.
                    // Now, we always render the component and rely solely on `isLocked` to control its state.
                    
                    const prerequisiteId = previewLevel === 1
                        ? selectedPracticeForReview // Prerequisite for Preview 1 is the base practice
                        : ((previewLevel - 1) * 100) + selectedPracticeForReview; // Prerequisite for Preview N is Preview N-1
                    
                    const practiceNumber = (previewLevel * 100) + selectedPracticeForReview;
                    const prerequisiteProgress = progressData[prerequisiteId];
                    
                    // A level is locked if its prerequisite is not yet 100% complete.
                    const isLocked = !prerequisiteProgress || prerequisiteProgress.total === 0 || prerequisiteProgress.completed < prerequisiteProgress.total;
                    
                    const progress = progressData[practiceNumber];
                    const colors = isLocked ? colorClasses.gray : colorClasses[previewColors[(previewLevel - 1) % previewColors.length]];

                    const prerequisiteName = previewLevel === 1 
                        ? `Practice ${selectedPracticeForReview}` 
                        : `Preview ${previewLevel - 1}`;

                    const unlockText = isLocked 
                        ? `Hoàn thành tất cả câu ở ${prerequisiteName} để mở` 
                        : `Luyện tập lại các câu hỏi`;
                        
                    // A level is only *visible* if its prerequisite is *unlocked*.
                    // This prevents showing Preview 3 if Preview 1 isn't even done yet.
                    if (previewLevel > 1) {
                         const oneLevelBeforeId = ((previewLevel - 2) === 0)
                            ? selectedPracticeForReview
                            : ((previewLevel - 2) * 100) + selectedPracticeForReview;
                         const oneLevelBeforeProgress = progressData[oneLevelBeforeId];
                         const isPreviousUnlocked = oneLevelBeforeProgress && oneLevelBeforeProgress.total > 0 && oneLevelBeforeProgress.completed >= oneLevelBeforeProgress.total;
                         if(!isPreviousUnlocked) {
                             return null;
                         }
                    }

                    // --- [FIX] END OF CORRECTION ---

                    return (
                        <button
                            key={practiceNumber}
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
                                <p className="text-xs text-gray-500 mt-1">
                                    {unlockText}
                                </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                                {!isLocked && progress && progress.total > 0 && (
                                <div className="text-right text-sm font-medium bg-gray-100 rounded-md px-2 py-0.5">
                                    <span className="font-bold text-gray-800">{progress.completed}</span>
                                    <span className="text-gray-400">/{progress.total}</span>
                                </div>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${!isLocked ? colors.arrow : ''} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>
                    );
                })}
             </div>
         </div>
      );
  }

  const practicesToShow = selectedType ? Object.keys(practiceDetails[selectedType]) : [];
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chọn bài tập</h1>
      <div className="space-y-4 w-full">
          {practicesToShow.map(pNumStr => {
            const practiceNumber = parseInt(pNumStr, 10);
            const details = practiceDetails[selectedType][practiceNumber];
            const progress = progressData[practiceNumber];
            const colors = colorClasses[details.color];

            const isReviewUnlocked = progress && progress.total > 0 && progress.completed >= progress.total;

            return (
              <div
                key={practiceNumber}
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
                        {progress && progress.total > 0 && (
                            <div className="text-right text-sm font-medium bg-gray-100 rounded-md px-2 py-0.5">
                            <span className="font-bold text-gray-800">{progress.completed}</span>
                            <span className="text-gray-400">/{progress.total}</span>
                            </div>
                        )}
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${colors.arrow} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-end">
                    <button 
                        onClick={(e) => handleReviewClick(e, practiceNumber)} 
                        disabled={!isReviewUnlocked}
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshIcon className="w-4 h-4" />
                        <span>Ôn tập</span>
                        {!isReviewUnlocked && <LockIcon className="w-4 h-4 ml-1 text-gray-400"/>}
                    </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

// --- END OF FILE: quiz-app-home.tsx ---
