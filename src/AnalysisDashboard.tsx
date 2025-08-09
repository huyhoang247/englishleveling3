
import React, { useState, useEffect, useMemo, FC, ReactNode, useCallback, memo } from 'react';
import { db, auth } from './firebase.js'; // Điều chỉnh đường dẫn đến file firebase của bạn
import { collection, getDocs, doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { defaultVocabulary } from './list-vocabulary.ts'; // Điều chỉnh đường dẫn
import CoinDisplay from './coin-display.tsx'; // [ADDED] Import for header

// --- [ADDED] Icons and Components for Header ---
const HomeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const masteryIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png';
const MasteryDisplay: React.FC<{ masteryCount: number; }> = memo(({ masteryCount }) => ( <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"> <style jsx>{`@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .animate-pulse-fast { animation: pulse-fast 1s infinite; }`}</style> <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> <div className="relative flex items-center justify-center"><img src={masteryIconUrl} alt="Mastery Icon" className="w-4 h-4" /></div> <div className="font-bold text-gray-800 text-xs tracking-wide ml-1">{masteryCount}</div> <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div> <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div> </div> ));


// --- Icons (Sử dụng các icon SVG đơn giản để không phụ thuộc vào file ngoài) ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const CalendarCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;


// [SỬA LỖI MÚI GIỜ] Hàm trợ giúp để định dạng ngày theo giờ địa phương (YYYY-MM-DD)
const formatDateToLocalYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Định nghĩa kiểu dữ liệu cho phân tích ---
interface LearningActivity { date: string; new: number; review: number; }
interface MasteryByGame { game: string; completed: number; }
interface VocabularyGrowth { date: string; cumulative: number; }
interface WordMastery { word: string; mastery: number; lastPracticed: Date; }
interface AnalysisData {
  totalWordsLearned: number;
  totalWordsAvailable: number;
  learningActivity: LearningActivity[];
  masteryByGame: MasteryByGame[];
  vocabularyGrowth: VocabularyGrowth[];
  recentCompletions: { word: string; date: string }[];
  wordMastery: WordMastery[];
}
type DailyActivityMap = { [date: string]: { new: number; review: number } };

// --- [ADDED] Props for the component ---
interface AnalysisDashboardProps {
  onGoBack: () => void;
  userCoins: number;
  masteryCount: number;
}


// --- Component Card tái sử dụng cho mỗi biểu đồ ---
const ChartCard: FC<{ title: string; children: ReactNode; extra?: ReactNode }> = ({ title, children, extra }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            {extra && <div>{extra}</div>}
        </div>
        <div className="h-64 sm:h-72 w-full">{children}</div>
    </div>
);


// --- [NEW COMPONENT] MỤC TIÊU TỪ VỰNG (TIẾN TRÌNH CỘT MỐC TRỌN ĐỜI) ---
const VOCAB_MILESTONES = [100, 200, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500];

interface VocabularyMilestonesProps {
  totalWordsLearned: number;
  masteryCount: number;
  user: User | null;
  claimedVocabMilestones: number[];
  onClaimSuccess: (milestone: number, rewardAmount: number) => void;
}

// [ĐÃ SỬA] Bọc component bằng React.memo để ngăn re-render không cần thiết
const VocabularyMilestones: FC<VocabularyMilestonesProps> = memo(({ totalWordsLearned, masteryCount, user, claimedVocabMilestones, onClaimSuccess }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    currentGoal,
    progressPercentage,
    isGoalMet,
    areAllGoalsMet,
  } = useMemo(() => {
    const nextGoalIndex = VOCAB_MILESTONES.findIndex(g => !claimedVocabMilestones.includes(g));
    if (nextGoalIndex === -1) {
      return { areAllGoalsMet: true, progressPercentage: 100, isGoalMet: true, currentGoal: VOCAB_MILESTONES[VOCAB_MILESTONES.length - 1], previousGoal: 0 };
    }
    const currentGoal = VOCAB_MILESTONES[nextGoalIndex];
    const previousGoal = nextGoalIndex > 0 ? VOCAB_MILESTONES[nextGoalIndex - 1] : 0;
    const progressInMilestone = Math.max(0, totalWordsLearned - previousGoal);
    const milestoneSize = currentGoal - previousGoal;
    const progressPercentage = milestoneSize > 0 ? Math.min((progressInMilestone / milestoneSize) * 100, 100) : 100;
    const isGoalMet = totalWordsLearned >= currentGoal;
    return { currentGoal, previousGoal, progressPercentage, isGoalMet, areAllGoalsMet: false };
  }, [totalWordsLearned, claimedVocabMilestones]);

  const handleClaim = useCallback(async () => {
    if (!isGoalMet || areAllGoalsMet || !user || isClaiming) return;
    setIsClaiming(true);
    try {
        const rewardAmount = currentGoal * Math.max(1, masteryCount);
        const userDocRef = doc(db, 'users', user.uid);
        
        await updateDoc(userDocRef, {
            coins: increment(rewardAmount),
            claimedVocabMilestones: arrayUnion(currentGoal)
        });
        
        onClaimSuccess(currentGoal, rewardAmount);
    } catch (error) {
        console.error("Lỗi khi nhận thưởng từ vựng:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
        setIsClaiming(false);
    }
  }, [isGoalMet, areAllGoalsMet, user, isClaiming, currentGoal, masteryCount, onClaimSuccess]);

  // Icons used inside this component
  const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 015.252-2.121l.738.64.738-.64A3 3 0 0115 5v2.212a3 3 0 01-.679 1.943l-4.261 4.26a1.5 1.5 0 01-2.121 0l-4.26-4.26A3 3 0 015 7.212V5zm10 0a1 1 0 10-2 0v.788a1 1 0 01-.321.707l-4.26 4.26a.5.5 0 01-.707 0l-4.26-4.26A1 1 0 014 5.788V5a1 1 0 10-2 0v2.212a5 5 0 001.127 3.238l4.26 4.26a3.5 3.5 0 004.95 0l4.26-4.26A5 5 0 0015 7.212V5z" clipRule="evenodd" /></svg>;
  const CheckCircleIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/voca-journey.webp" alt="Voca Journey" className="w-11 h-11" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Voca Journey</h3>
            {areAllGoalsMet ? ( <p className="text-xs sm:text-sm text-green-600 font-semibold">Max level reached!</p> ) : (
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1" title={`Reward = Milestone (${currentGoal}) × Max(1, Mastery Cards: ${masteryCount})`}>
                  <span className="flex items-center font-bold text-amber-600">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp" alt="Reward Coin" className="h-5 w-5 mr-1.5"/>
                      <span className="text-sm">{currentGoal * (masteryCount > 0 ? masteryCount : 1)}</span>
                  </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {areAllGoalsMet ? ( <div className="text-center p-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2"><CheckCircleIconSmall /> <span className="font-bold text-sm">Awesome!</span></div>
          ) : isGoalMet ? (
            <button onClick={handleClaim} disabled={isClaiming} className="flex items-center justify-center px-4 py-2 font-bold text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg shadow-md hover:scale-105 transform transition-transform duration-200 disabled:opacity-70 disabled:cursor-wait">
              {isClaiming ? <SpinnerIcon /> : <GiftIcon />}
              <span className="ml-1.5 text-sm">{isClaiming ? 'Wait' : 'Claim'}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-2 font-bold bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
              <GiftIcon />
              <span className="flex items-baseline"><span className="text-base font-extrabold text-gray-700">{totalWordsLearned}</span><span className="text-sm font-medium text-gray-500">/{currentGoal}</span></span>
            </div>
          )}
        </div>
        <div className="w-full mt-3">
          {areAllGoalsMet ? ( <div className="h-2.5 w-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full" title="All milestones completed!"></div>
          ) : ( <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div></div> )}
        </div>
      </div>
    </div>
  );
});


// --- COMPONENT MỤC TIÊU HÀNG NGÀY (TIẾN TRÌNH CỘT MỐC) ---
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 015.252-2.121l.738.64.738-.64A3 3 0 0115 5v2.212a3 3 0 01-.679 1.943l-4.261 4.26a1.5 1.5 0 01-2.121 0l-4.26-4.26A3 3 0 015 7.212V5zm10 0a1 1 0 10-2 0v.788a1 1 0 01-.321.707l-4.26 4.26a.5.5 0 01-.707 0l-4.26-4.26A1 1 0 014 5.788V5a1 1 0 10-2 0v2.212a5 5 0 001.127 3.238l4.26 4.26a3.5 3.5 0 004.95 0l4.26-4.26A5 5 0 0015 7.212V5z" clipRule="evenodd" /></svg>;
const CheckCircleIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const GOAL_MILESTONES = [5, 10, 20, 50, 100, 200];

interface DailyGoalMilestonesProps {
  wordsLearnedToday: number;
  masteryCount: number;
  user: User | null;
  claimedDailyGoals: number[];
  onClaimSuccess: (milestone: number, rewardAmount: number) => void;
}

// [ĐÃ SỬA] Bọc component bằng React.memo để ngăn re-render không cần thiết
const DailyGoalMilestones: FC<DailyGoalMilestonesProps> = memo(({ wordsLearnedToday, masteryCount, user, claimedDailyGoals, onClaimSuccess }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    currentGoal,
    progressPercentage,
    isGoalMet,
    areAllGoalsMet,
  } = useMemo(() => {
    const nextGoalIndex = GOAL_MILESTONES.findIndex(g => !claimedDailyGoals.includes(g));
    if (nextGoalIndex === -1) {
      return { areAllGoalsMet: true, progressPercentage: 100, isGoalMet: true, currentGoal: GOAL_MILESTONES[GOAL_MILESTONES.length - 1], previousGoal: 0 };
    }
    const currentGoal = GOAL_MILESTONES[nextGoalIndex];
    const previousGoal = nextGoalIndex > 0 ? GOAL_MILESTONES[nextGoalIndex - 1] : 0;
    const progressInMilestone = Math.max(0, wordsLearnedToday - previousGoal);
    const milestoneSize = currentGoal - previousGoal;
    const progressPercentage = Math.min((progressInMilestone / milestoneSize) * 100, 100);
    const isGoalMet = wordsLearnedToday >= currentGoal;
    return { currentGoal, previousGoal, progressPercentage, isGoalMet, areAllGoalsMet: false };
  }, [wordsLearnedToday, claimedDailyGoals]);

  const handleClaim = useCallback(async () => {
    if (!isGoalMet || areAllGoalsMet || !user || isClaiming) return;
    setIsClaiming(true);
    try {
        const rewardAmount = currentGoal * Math.max(1, masteryCount);
        const userDocRef = doc(db, 'users', user.uid);
        const todayString = formatDateToLocalYYYYMMDD(new Date());
        const fieldKey = `claimedDailyGoals.${todayString}`;
        
        await updateDoc(userDocRef, {
            coins: increment(rewardAmount),
            [fieldKey]: arrayUnion(currentGoal)
        });
        
        onClaimSuccess(currentGoal, rewardAmount);
    } catch (error) {
        console.error("Lỗi khi nhận thưởng:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
        setIsClaiming(false);
    }
  }, [isGoalMet, areAllGoalsMet, user, isClaiming, currentGoal, masteryCount, onClaimSuccess]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/daily-missions.webp" alt="Daily Missions" className="w-11 h-11" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Daily Missions</h3>
            {areAllGoalsMet ? ( <p className="text-xs sm:text-sm text-green-600 font-semibold">All missions completed!</p> ) : (
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1" title={`Reward = Milestone (${currentGoal}) × Max(1, Mastery Cards: ${masteryCount})`}>
                  <span className="flex items-center font-bold text-amber-600">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp" alt="Reward Coin" className="h-5 w-5 mr-1.5"/>
                      <span className="text-sm">{currentGoal * (masteryCount > 0 ? masteryCount : 1)}</span>
                  </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {areAllGoalsMet ? ( <div className="text-center p-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2"><CheckCircleIconSmall /> <span className="font-bold text-sm">Awesome!</span></div>
          ) : isGoalMet ? (
            <button onClick={handleClaim} disabled={isClaiming} className="flex items-center justify-center px-4 py-2 font-bold text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg shadow-md hover:scale-105 transform transition-transform duration-200 disabled:opacity-70 disabled:cursor-wait">
              {isClaiming ? <SpinnerIcon /> : <GiftIcon />}
              <span className="ml-1.5 text-sm">{isClaiming ? 'Wait' : 'Claim'}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-2 font-bold bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
              <GiftIcon />
              <span className="flex items-baseline"><span className="text-base font-extrabold text-gray-700">{wordsLearnedToday}</span><span className="text-sm font-medium text-gray-500">/{currentGoal}</span></span>
            </div>
          )}
        </div>
        <div className="w-full mt-3">
          {areAllGoalsMet ? ( <div className="h-2.5 w-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full" title="All missions completed!"></div>
          ) : ( <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div></div> )}
        </div>
      </div>
    </div>
  );
});


// --- Component Lịch hoạt động (Activity Calendar) ---
// [ĐÃ SỬA] Bọc component bằng React.memo để ngăn re-render không cần thiết
const ActivityCalendar: FC<{ activityData: DailyActivityMap }> = memo(({ activityData }) => {
    const calendarData = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0); const dayOfWeek = today.getDay(); 
        const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const startDate = new Date(startOfWeek); startDate.setDate(startOfWeek.getDate() - (4 * 7));
        const days = []; const activityDates = new Set(Object.keys(activityData));
        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate); date.setDate(startDate.getDate() + i);
            const dateString = formatDateToLocalYYYYMMDD(date); const hasActivity = activityDates.has(dateString);
            const activityDetail = activityData[dateString] || { new: 0, review: 0 };
            days.push({ date, dateString, dayOfMonth: date.getDate(), hasActivity, isToday: date.getTime() === today.getTime(), isFuture: date.getTime() > today.getTime(), tooltip: hasActivity ? `${date.toLocaleDateString('vi-VN')}: Học ${activityDetail.new} từ mới, ôn ${activityDetail.review} từ.` : date.toLocaleDateString('vi-VN'), });
        }
        return days;
    }, [activityData]);
    const weekDayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4"><div className="bg-indigo-500 p-2 rounded-lg shadow-md"><CalendarIcon /></div><h3 className="text-lg font-bold text-gray-800">Activity</h3></div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {weekDayHeaders.map(day => <div key={day} className="text-xs font-semibold text-gray-500 mb-2">{day}</div>)}
                {calendarData.map((day, index) => {
                    const baseClass = "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-transform duration-150 ease-in-out hover:scale-110";
                    let dayClass = "";
                    if (day.isFuture) dayClass = "bg-gray-100 text-gray-300 cursor-not-allowed";
                    else if (day.hasActivity) dayClass = "bg-green-500 text-white";
                    else dayClass = "bg-gray-200 text-gray-400";
                    if (day.isToday) dayClass += " ring-2 ring-offset-2 ring-indigo-500";
                    return <div key={index} title={day.tooltip} className={`${baseClass} ${dayClass}`}>{(day.hasActivity && !day.isFuture) ? <CalendarCheckIcon /> : <span>{day.dayOfMonth}</span>}</div>;
                })}
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-lg bg-gray-200"></div><span>Chưa học</span></div>
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-lg bg-green-500"></div><span>Đã học</span></div>
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-lg ring-2 ring-offset-1 ring-indigo-500"></div><span>Hôm nay</span></div>
            </div>
        </div>
    );
});

// --- Component chính ---
const ITEMS_PER_PAGE = 10; // Số mục trên mỗi trang

export default function AnalysisDashboard({ onGoBack, userCoins, masteryCount }: AnalysisDashboardProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof WordMastery, direction: 'asc' | 'desc' }>({ key: 'mastery', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [claimedDailyGoals, setClaimedDailyGoals] = useState<number[]>([]);
  const [claimedVocabMilestones, setClaimedVocabMilestones] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const [localCoins, setLocalCoins] = useState(userCoins);
  const [displayedCoins, setDisplayedCoins] = useState(userCoins);

  useEffect(() => {
    setLocalCoins(userCoins);
    if (!isAnimating) {
      setDisplayedCoins(userCoins);
    }
  }, [userCoins, isAnimating]);

  // [UPDATED] Hàm animation đồng bộ với quiz.tsx
  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => {
    if (startValue === endValue) {
      setDisplayedCoins(endValue);
      return;
    }
    
    setIsAnimating(true); // BẮT ĐẦU animation

    const isCountingUp = endValue > startValue;
    // Tính toán step giống hệt bên quiz.tsx để có tốc độ tương đồng
    const step = Math.ceil(Math.abs(endValue - startValue) / 30) || 1;
    let current = startValue;

    const interval = setInterval(() => {
      if (isCountingUp) {
        current += step;
      } else {
        current -= step;
      }

      if ((isCountingUp && current >= endValue) || (!isCountingUp && current <= endValue)) {
        setDisplayedCoins(endValue);
        clearInterval(interval);
        setIsAnimating(false); // KẾT THÚC animation
      } else {
        setDisplayedCoins(current);
      }
    }, 30); // Tần suất cập nhật 30ms giống quiz.tsx
  }, []); // Dependencies để trống vì hàm không phụ thuộc vào props/state bên ngoài
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); setError("Vui lòng đăng nhập để xem phân tích."); return; }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userDocSnap, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
            getDoc(doc(db, 'users', user.uid)),
            getDocs(collection(db, 'users', user.uid, 'completedWords')),
            getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);
        
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const todayString = formatDateToLocalYYYYMMDD(new Date());
            setClaimedDailyGoals(userData.claimedDailyGoals?.[todayString] || []);
            setClaimedVocabMilestones(userData.claimedVocabMilestones || []);
        }

        const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0 };
        const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
        const dailyActivity: DailyActivityMap = {};
        const allCompletionsForRecent: { word: string; date: Date }[] = [];
        
        // Chỉ từ đơn (completedWords) mới được tính vào hoạt động hàng ngày (dailyActivity)
        completedWordsSnapshot.forEach(doc => {
            const data = doc.data(); const lastCompletedAt = data.lastCompletedAt?.toDate(); if (!lastCompletedAt) return;
            allCompletionsForRecent.push({word: doc.id, date: lastCompletedAt});
            const dateString = formatDateToLocalYYYYMMDD(lastCompletedAt);
            if (!dailyActivity[dateString]) dailyActivity[dateString] = { new: 0, review: 0 };
            
            let totalCompletions = 0, totalCorrectForWord = 0;
            if (data.gameModes) {
                Object.values(data.gameModes).forEach((modeData: any) => { totalCompletions += modeData.correctCount || 0; });
                Object.keys(data.gameModes).forEach(mode => {
                    const correctCount = data.gameModes[mode].correctCount || 0;
                    totalCorrectForWord += correctCount;
                    if (mode.startsWith('quiz-')) masteryByGame['Trắc nghiệm'] += correctCount;
                    else if (mode.startsWith('fill-word-')) masteryByGame['Điền từ'] += correctCount;
                });
            }
            if (totalCompletions > 1) dailyActivity[dateString].review++; 
            else if (totalCompletions === 1) dailyActivity[dateString].new++;
            
            if (totalCorrectForWord > 0) wordMasteryMap[doc.id] = { mastery: totalCorrectForWord, lastPracticed: lastCompletedAt };
        });
        
        // Cụm từ (completedMultiWord) chỉ tính vào "Hoạt động gần đây" và "Điểm theo Game"
        completedMultiWordSnapshot.forEach(doc => {
            const data = doc.data(); const lastCompletedAt = data.lastCompletedAt?.toDate(); if (!lastCompletedAt) return;
            allCompletionsForRecent.push({word: doc.id, date: lastCompletedAt});
            if (data.completedIn) Object.keys(data.completedIn).forEach(mode => { if (mode.startsWith('fill-word-')) masteryByGame['Điền từ']++; });
        });
        
        setDailyActivityData(dailyActivity);
        const learningActivityData: LearningActivity[] = Object.entries(dailyActivity).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let cumulative = 0;
        const vocabularyGrowthData = learningActivityData.map(item => { cumulative += item.new; return { date: new Date(item.date).toLocaleDateString('vi-VN'), cumulative }; });
        const masteryData = Object.entries(masteryByGame).map(([game, completed]) => ({ game, completed })).filter(item => item.completed > 0);
        const recentCompletions = [...allCompletionsForRecent].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5).map(c => ({ word: c.word, date: c.date.toLocaleString('vi-VN') }));
        
        const totalWordsLearned = completedWordsSnapshot.size;
        
        const wordMasteryData: WordMastery[] = Object.entries(wordMasteryMap).map(([word, data]) => ({ word, ...data }));

        setAnalysisData({
          totalWordsLearned, totalWordsAvailable: defaultVocabulary.length,
          learningActivity: learningActivityData.slice(-30).map(d => ({...d, date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})),
          masteryByGame: masteryData, vocabularyGrowth: vocabularyGrowthData, recentCompletions, wordMastery: wordMasteryData,
        });
      } catch (err: any) { console.error("Lỗi tải dữ liệu phân tích:", err); setError("Không thể tải dữ liệu phân tích."); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const wordsLearnedToday = useMemo(() => {
    const todayString = formatDateToLocalYYYYMMDD(new Date());
    const todayActivity = dailyActivityData[todayString];
    return todayActivity ? todayActivity.new + todayActivity.review : 0;
  }, [dailyActivityData]);

  const sortedWordMastery = useMemo(() => {
    if (!analysisData?.wordMastery) return [];
    return [...analysisData.wordMastery].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [analysisData?.wordMastery, sortConfig]);

  const handleSort = (key: keyof WordMastery) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1); // Quay về trang đầu tiên khi sắp xếp
  };
  
  const handleGoalClaimSuccess = useCallback((milestone: number, rewardAmount: number) => {
      setClaimedDailyGoals(prev => [...prev, milestone]);
      const newTotalCoins = localCoins + rewardAmount;
      startCoinCountAnimation(localCoins, newTotalCoins);
      setLocalCoins(newTotalCoins);
  }, [localCoins, startCoinCountAnimation]);

  const handleVocabClaimSuccess = useCallback((milestone: number, rewardAmount: number) => {
      setClaimedVocabMilestones(prev => [...prev, milestone]);
      const newTotalCoins = localCoins + rewardAmount;
      startCoinCountAnimation(localCoins, newTotalCoins);
      setLocalCoins(newTotalCoins);
  }, [localCoins, startCoinCountAnimation]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const finalLabel = payload[0].payload.game ? payload[0].payload.game : `Ngày: ${label}`;
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="p-2 bg-gray-800 text-white rounded-md shadow-lg text-sm border border-gray-700">
          <p className="font-bold">{finalLabel}</p>
          {payload.map((pld) => <p key={pld.dataKey} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value}`}</p>)}
          {payload.length > 1 && total > 0 && <><hr className="my-1 border-gray-600" /><p className="font-semibold">{`Tổng: ${total}`}</p></>}
        </div>
      );
    }
    return null;
  };
  
  if (loading) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">Đang tải phân tích...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 p-4">{error}</div>;
  
  const mainContent = () => {
    if (!analysisData || analysisData.totalWordsLearned === 0) {
        return ( <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><h2 className="text-2xl font-bold mb-2">Chưa có dữ liệu</h2><p>Hãy bắt đầu học để xem tiến trình của bạn được phân tích tại đây!</p></div> );
    }

    const { totalWordsLearned, learningActivity, masteryByGame, vocabularyGrowth } = analysisData;
    const barColors = ["#8884d8", "#82ca9d"];

    // Logic phân trang
    const totalPages = Math.ceil(sortedWordMastery.length / ITEMS_PER_PAGE);
    const paginatedMasteryData = sortedWordMastery.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    return (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-6 my-6">
                    <VocabularyMilestones 
                        totalWordsLearned={totalWordsLearned} 
                        masteryCount={masteryCount} 
                        user={user} 
                        claimedVocabMilestones={claimedVocabMilestones} 
                        onClaimSuccess={handleVocabClaimSuccess} 
                    />
                    <DailyGoalMilestones 
                        wordsLearnedToday={wordsLearnedToday} 
                        masteryCount={masteryCount} 
                        user={user} 
                        claimedDailyGoals={claimedDailyGoals} 
                        onClaimSuccess={handleGoalClaimSuccess} 
                    />
                </div>
                <div className="mb-6"><ActivityCalendar activityData={dailyActivityData} /></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ChartCard title="Vocabulary Growth"><ResponsiveContainer><AreaChart data={vocabularyGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="cumulative" name="Tổng số từ" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" /></AreaChart></ResponsiveContainer></ChartCard>
                    <ChartCard 
                        title="Study Activity" 
                        extra={<span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Last 30 Days</span>}
                    >
                        <ResponsiveContainer>
                            <BarChart data={learningActivity} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis allowDecimals={false} fontSize={12}/>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(136, 132, 216, 0.1)'}}/>
                                <Legend verticalAlign="top" wrapperStyle={{top: 0, left: 25}}/>
                                <Bar dataKey="new" name="Từ mới" stackId="a" fill="#82ca9d" />
                                <Bar dataKey="review" name="Ôn tập" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    {/* The "Tổng điểm theo Game" chart has been removed */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Vocabulary Mastery Analysis</h3>
                        {sortedWordMastery.length > 0 ? (<>
                            <div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-600"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Vocabulary</th><th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('mastery')}>Score</th><th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('lastPracticed')}>Latest</th></tr></thead>
                                <tbody>{paginatedMasteryData.map(({ word, mastery, lastPracticed }) => (
                                    <tr key={word} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900 capitalize whitespace-nowrap">{word}</td>
                                        <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-bold w-4 text-center">{mastery}</span><div className="w-16 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(mastery / 10, 1) * 100}%` }}></div></div></div></td>
                                        <td className="px-4 py-3">{lastPracticed.toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}</tbody></table></div>
                            
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeftIcon />
                                        <span className="ml-1">Previous</span>
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="mr-1">Next</span>
                                        <ChevronRightIcon />
                                    </button>
                                </div>
                            )}
                        </>) : (<p className="text-center text-gray-500 py-4">No mastery data available.</p>)}
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                         <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                         {analysisData.recentCompletions.length > 0 ? (<ul className="space-y-3">{analysisData.recentCompletions.map((item, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="font-medium text-gray-700 capitalize">{item.word}</span><span className="text-sm text-gray-500">{item.date}</span>
                            </li>
                         ))}</ul>) : (<p className="text-center text-gray-500 py-4">Không có hoạt động nào gần đây.</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full">
        <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-md">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="w-24">
              <button onClick={onGoBack} className="p-2 -ml-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Về trang chủ">
                  <HomeIcon />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3">
               <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
               <MasteryDisplay masteryCount={masteryCount} />
            </div>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
            {mainContent()}
        </div>
    </div>
  );
}
