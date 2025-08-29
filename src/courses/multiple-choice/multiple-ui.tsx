--- START OF FILE multiple-ui.tsx (6).txt ---

import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { QuizProvider, useQuiz } from './multiple-context.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx';
import StreakDisplay from '../../ui/display/streak-display.tsx';
import Confetti from '../../ui/fireworks-effect.tsx';
import QuizLoadingSkeleton from './multiple-loading.tsx'; // <<<--- DÒNG IMPORT QUAN TRỌNG ĐÂY!

// --- PHẦN CODE KHÔNG ĐỔI (Các component con & Icons) ---
const optionLabels = ['A', 'B', 'C', 'D'];
const CountdownTimer: React.FC<{ timeLeft: number; totalTime: number }> = memo(({ timeLeft, totalTime }) => { const radius = 20; const circumference = 2 * Math.PI * radius; const progress = Math.max(0, timeLeft / totalTime); const strokeDashoffset = circumference * (1 - progress); const getTimeColor = () => { if (timeLeft <= 0) return 'text-gray-400'; if (timeLeft <= 10) return 'text-red-500'; if (timeLeft <= 20) return 'text-yellow-500'; return 'text-indigo-400'; }; const ringColorClass = getTimeColor(); return ( <div className="relative flex items-center justify-center w-8 h-8"> <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 44 44"> <circle className="text-white/20" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="22" cy="22" /> <circle className={`${ringColorClass} transition-all duration-500`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="transparent" r={radius} cx="22" cy="22" style={{ strokeDasharray: circumference, strokeDashoffset }} /> </svg> <span className={`font-bold text-xs ${ringColorClass}`}>{Math.max(0, timeLeft)}</span> </div> ); });
const CheckIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"></path></svg> );
const XIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg> );
const AwardIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg> );
const BackIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );
const TrophyIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V22h4v-7.34"/><path d="M12 14.66L15.45 8.3A3 3 0 0 0 12.95 4h-1.9a3 3 0 0 0-2.5 4.3Z"/></svg> );
const BookmarkIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg> );
const ArrowRightIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg> );
const PauseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> );
const VolumeUpIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg> );
interface Definition { vietnamese: string; english: string; explanation: string; }
const DetailPopup: React.FC<{ data: Definition | null; onClose: () => void; }> = ({ data, onClose }) => { if (!data) return null; return ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose} > <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 relative shadow-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-up" onClick={(e) => e.stopPropagation()} > <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-semibold px-3 py-1 rounded-full mb-4"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /> </svg> <span>{data.english}</span> </div> <p className="text-gray-700 dark:text-gray-400 text-base leading-relaxed italic"> {`${data.vietnamese} (${data.english}) là ${data.explanation}`} </p> </div> <style jsx>{` @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; } `}</style> </div> ); };
// --- XÓA COMPONENT AudioQuestionDisplay KHỎI ĐÂY ---

// --- Component UI chính, nhận dữ liệu từ Context ---
function QuizAppUI({ onGoBack }: { onGoBack: () => void }) {
  const {
    loading, showScore, currentQuestion, score, coins, streak, masteryCount, streakAnimation,
    timeLeft, playableQuestions, filteredQuizData, shuffledOptions, selectedOption,
    answered, showNextButton, hintUsed, hiddenOptions, currentQuestionWord,
    handleAnswer, handleHintClick, handleNextQuestion, resetQuiz, handleDetailClick,
    showDetailPopup, detailData, onCloseDetailPopup, showConfetti,
    // THÊM MỚI: Lấy các giá trị liên quan đến giọng đọc từ context
    currentAudioUrl,
    selectedVoice,
    handleVoiceChange,
  } = useQuiz();

  const displayedCoins = useAnimateValue(coins, 500);
  const HINT_COST = 200;
  const TOTAL_TIME = 30;

  const totalCompletedBeforeSession = filteredQuizData.length > 0 ? filteredQuizData.length - playableQuestions.length : 0;
  const quizProgress = filteredQuizData.length > 0 ? ((totalCompletedBeforeSession + currentQuestion) / filteredQuizData.length) * 100 : 0;

  // --- START: LOGIC ÂM THANH SỬ DỤNG currentAudioUrl TỪ CONTEXT ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // THAY ĐỔI: Biến audioUrl cục bộ bị loại bỏ, sử dụng currentAudioUrl từ context

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // THAY ĐỔI: Sử dụng currentAudioUrl
    if (currentAudioUrl) {
        audio.play().catch(e => console.error("Autoplay prevented:", e));
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [currentAudioUrl]); // THAY ĐỔI: Dependency là currentAudioUrl
  // --- END: LOGIC ÂM THANH ---

  if (loading) return <QuizLoadingSkeleton />;
  
  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* THAY ĐỔI: Thẻ audio sử dụng currentAudioUrl từ context */}
      <audio ref={audioRef} src={currentAudioUrl || ''} key={currentAudioUrl} preload="auto" className="hidden" />

      {showConfetti && <Confetti />}
      {showDetailPopup && <DetailPopup data={detailData} onClose={onCloseDetailPopup} />}

      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <button onClick={onGoBack} className="group w-7 h-7 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 active:bg-white/30 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Quay lại">
          <BackIcon className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
          <MasteryDisplay masteryCount={masteryCount} />
          <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto flex justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
          {showScore ? (
              <div className="p-10 text-center">
                <div className="mb-8"><div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"><AwardIcon className="w-16 h-16 text-indigo-600" /></div><h2 className="text-3xl font-bold text-gray-800 mb-2">Kết Thúc Lượt Chơi</h2><p className="text-gray-500">Bạn đã hoàn thành lượt kiểm tra này!</p></div>
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4"><span className="text-lg font-medium text-gray-700">Điểm trong phiên này:</span><span className="text-2xl font-bold text-indigo-600">{score}/{playableQuestions.length}</span></div>
                  <div className="mb-3"><p className="text-left mb-1 text-sm text-gray-600 font-medium">Tiến độ tổng thể: {totalCompletedBeforeSession + score} / {filteredQuizData.length}</p><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(totalCompletedBeforeSession + score) / (filteredQuizData.length || 1) * 100}%` }}></div></div></div>
                </div>
                <button onClick={resetQuiz} className="flex items-center justify-center mx-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><RefreshIcon className="mr-2 h-5 w-5" />Chơi tiếp</button>
              </div>
          ) : filteredQuizData.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full"><h2 className="text-2xl font-bold text-gray-800 mb-4">Không có câu hỏi phù hợp</h2><p className="text-gray-600">Bạn cần mở thêm thẻ từ vựng để có câu hỏi trong mục này.</p></div>
          ) : playableQuestions.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full"><TrophyIcon className="w-20 h-20 text-yellow-500 mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-4">Xin chúc mừng!</h2><p className="text-gray-600">Bạn đã hoàn thành tất cả các câu hỏi có sẵn. Hãy quay lại sau khi học thêm từ vựng mới nhé!</p></div>
          ) : (
              <>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="relative"><div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30"><div className="flex items-center"><span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">{totalCompletedBeforeSession + currentQuestion + 1}</span><span className="mx-0.5 text-white/70 text-xs">/</span><span className="text-xs text-white/50">{filteredQuizData.length}</span></div></div></div>
                    <div className="flex items-center gap-2">
                       <button onClick={handleHintClick} disabled={hintUsed || answered || coins < HINT_COST || playableQuestions.length === 0} className="group relative flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs font-bold text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white/25 active:enabled:bg-white/30" aria-label={`Sử dụng gợi ý (tốn ${HINT_COST} vàng)`}><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000944c623081c4672d72472f68.png" alt="Hint" className="w-4 h-4" /><span className="text-yellow-300">{HINT_COST}</span><div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse-fast group-disabled:hidden"></div></button>
                      <CountdownTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} />
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6"><div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${quizProgress}%` }}><div className="absolute top-0 h-1 w-full bg-white opacity-30"></div></div></div>
                  
                  {/* --- START: KHU VỰC HIỂN THỊ CÂU HỎI ĐƯỢC THIẾT KẾ LẠI --- */}
                  <div className="relative">
                    {/* THAY ĐỔI: Điều kiện hiển thị là currentAudioUrl */}
                    { currentAudioUrl && (
                      <button onClick={togglePlay} className={`absolute top-3 left-3 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-black/20 backdrop-blur-sm border border-white/25 transition-transform duration-200 hover:scale-110 active:scale-100 ${isPlaying ? 'animate-pulse' : ''}`} aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
                        { isPlaying ? <PauseIcon className="w-4 h-4 text-white" /> : <VolumeUpIcon className="w-4 h-4 text-white/80" /> }
                      </button>
                    )}
                    
                    {/* THAY ĐỔI LỚN: Thay thế tag tĩnh bằng bộ chuyển đổi giọng đọc động */}
                    { currentAudioUrl && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/20 backdrop-blur-sm p-1 rounded-full border border-white/25">
                          <button
                              onClick={() => handleVoiceChange('matilda')}
                              className={`px-3 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                                  selectedVoice === 'matilda'
                                  ? 'bg-white text-purple-700 shadow-md'
                                  : 'bg-transparent text-white/70 hover:bg-white/20'
                              }`}
                          >
                              Matilda
                          </button>
                          <button
                              onClick={() => handleVoiceChange('arabella')}
                              className={`px-3 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                                  selectedVoice === 'arabella'
                                  ? 'bg-white text-purple-700 shadow-md'
                                  : 'bg-transparent text-white/70 hover:bg-white/20'
                              }`}
                          >
                              Arabella
                          </button>
                      </div>
                    )}

                    {/* THAY ĐỔI: Điều kiện hiển thị là currentAudioUrl */}
                    { currentAudioUrl ? (
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mb-1 flex items-center justify-center min-h-[140px]">
                            <p className="text-white/80 text-sm font-medium">Nghe và chọn đáp án đúng</p>
                        </div>
                    ) : (
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mb-1 min-h-[140px] flex flex-col justify-center">
                            <h2 className="text-xl font-bold text-white leading-tight">{playableQuestions[currentQuestion]?.question}</h2>
                            {playableQuestions[currentQuestion]?.vietnamese && <p className="text-white/80 text-sm mt-2 italic">{playableQuestions[currentQuestion]?.vietnamese}</p>}
                        </div>
                    )}
                  </div>
                  {/* --- END: KHU VỰC HIỂN THỊ CÂU HỎI --- */}
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {shuffledOptions.map((option, index) => {
                      const isCorrect = option === playableQuestions[currentQuestion]?.correctAnswer; const isSelected = option === selectedOption; const isHiddenByHint = hiddenOptions.includes(option);
                      let bgColor = "bg-white"; let borderColor = "border-gray-200"; let textColor = "text-gray-700"; let labelBg = "bg-gray-100";
                      if (answered) {
                        if (isCorrect) { bgColor = "bg-green-50"; borderColor = "border-green-500"; textColor = "text-green-800"; labelBg = "bg-green-500 text-white"; }
                        else if (isSelected) { bgColor = "bg-red-50"; borderColor = "border-red-500"; textColor = "text-red-800"; labelBg = "bg-red-500 text-white"; }
                      }
                      return (
                        <button key={option} onClick={() => !answered && !isHiddenByHint && handleAnswer(option)} disabled={answered || playableQuestions.length === 0 || isHiddenByHint} className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} flex items-center transition-all duration-300 hover:shadow-sm ${!answered && playableQuestions.length > 0 && !isHiddenByHint ? "hover:border-indigo-300 hover:bg-indigo-50" : ""} ${isHiddenByHint ? 'opacity-40 line-through pointer-events-none' : ''}`} >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-sm font-bold ${labelBg}`}>{optionLabels[index]}</div>
                          <span className="flex-grow">{option}</span>
                          {answered && isCorrect && <CheckIcon className="h-4 w-4 text-green-600 ml-1" />}
                          {answered && isSelected && !isCorrect && <XIcon className="h-4 w-4 text-red-600 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )
          }
        </div>
      </main>
      
      {showNextButton && (playableQuestions.length > 0) && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
          <div className="group relative">
             <button onClick={handleDetailClick} disabled={!currentQuestionWord || !detailData} className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-indigo-200 text-indigo-600 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:border-indigo-400 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" aria-label="Xem chi tiết">
              <BookmarkIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Chi tiết<svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg></div>
          </div>
          <button onClick={handleNextQuestion} className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl active:scale-100" aria-label={currentQuestion < playableQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}>
            <span>{currentQuestion < playableQuestions.length - 1 ? 'Next' : 'Xem kết quả'}</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}


// --- Component Wrapper, cung cấp Context Provider ---
export default function QuizApp({ onGoBack, selectedPractice }: { onGoBack: () => void; selectedPractice: number; }) {
  return (
    <QuizProvider selectedPractice={selectedPractice}>
      <QuizAppUI onGoBack={onGoBack} />
    </QuizProvider>
  );
}
