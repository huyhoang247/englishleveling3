import React, { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { db, auth } from './firebase.js'; // Điều chỉnh đường dẫn đến file firebase của bạn
import { collection, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { defaultVocabulary } from './list-vocabulary.ts'; // Điều chỉnh đường dẫn

// --- Icons (Sử dụng các icon SVG đơn giản để không phụ thuộc vào file ngoài) ---
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SortIcon = ({ direction }: { direction?: 'asc' | 'desc' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'asc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
        {direction === 'desc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
        {!direction && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />}
    </svg>
);

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

// --- Component Card tái sử dụng cho mỗi biểu đồ ---
const ChartCard: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 sm:h-72 w-full">{children}</div>
    </div>
);


// --- COMPONENT CỘT MỐC MỤC TIÊU HÀNG NGÀY (THIẾT KẾ MỚI) ---
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.25 2.25a.75.75 0 00-1.5 0v1.165a.75.75 0 001.5 0V2.25zM11.25 18.75a.75.75 0 00-1.5 0v-1.165a.75.75 0 001.5 0v1.165zM5.25 10.5a.75.75 0 01.75-.75h1.165a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM18.75 10.5a.75.75 0 01-.75.75h-1.165a.75.75 0 010-1.5h1.165a.75.75 0 01.75.75zM6.31 6.31a.75.75 0 00-1.06-1.06L3.93 6.57A.75.75 0 005 7.63l1.31-1.32zM14.75 14.75a.75.75 0 00-1.06-1.06L12.37 15a.75.75 0 001.06 1.06l1.32-1.31zM6.31 14.75a.75.75 0 001.06-1.06L6.05 12.37A.75.75 0 005 13.43l1.31 1.32zM14.75 6.31a.75.75 0 00-1.06 1.06L15 8.69A.75.75 0 1016.06 7.63l-1.31-1.32zM10 5.25a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zM8.25 10a1.75 1.75 0 113.5 0 1.75 1.75 0 01-3.5 0z" clipRule="evenodd" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a2 2 0 00-2 2v1a2 2 0 00-2 2v1a2 2 0 00-2 2v2h16v-2a2 2 0 00-2-2V7a2 2 0 00-2-2V4a2 2 0 00-2-2h-4zM5 14v1a1 1 0 001 1h8a1 1 0 001-1v-1H5z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

const GOAL_MILESTONES = [5, 10, 20, 50, 100, 200];

interface DailyGoalMilestonesProps {
  wordsLearnedToday: number;
  onClaimReward: (goalValue: number) => void;
  claimedGoals: number[];
}

const DailyGoalMilestones: FC<DailyGoalMilestonesProps> = ({ wordsLearnedToday, onClaimReward, claimedGoals }) => {
  const progressInfo = useMemo(() => {
    // Tìm mốc có thể nhận thưởng (đã đạt nhưng chưa nhận)
    const claimableGoal = GOAL_MILESTONES.find(g => wordsLearnedToday >= g && !claimedGoals.includes(g));

    // Tìm mục tiêu kế tiếp (mốc đầu tiên chưa đạt)
    const nextTargetGoal = GOAL_MILESTONES.find(g => wordsLearnedToday < g) || GOAL_MILESTONES[GOAL_MILESTONES.length - 1];
    
    // Tìm mốc trước đó để tính % cho đoạn hiện tại
    const previousMilestone = [...GOAL_MILESTONES].reverse().find(g => g < nextTargetGoal) || 0;

    const wordsInCurrentSegment = Math.max(0, wordsLearnedToday - previousMilestone);
    const totalWordsForSegment = nextTargetGoal - previousMilestone;
    const progressPercentage = totalWordsForSegment > 0 ? (wordsInCurrentSegment / totalWordsForSegment) * 100 : 0;

    return {
      claimableGoal,
      nextTargetGoal,
      progressPercentage,
      wordsInCurrentSegment,
      totalWordsForSegment,
      previousMilestone,
    };
  }, [wordsLearnedToday, claimedGoals]);

  const handleClaim = () => {
    if (progressInfo.claimableGoal) {
      onClaimReward(progressInfo.claimableGoal);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg"><TrophyIcon /></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Mục tiêu hôm nay</h3>
            <p className="text-sm text-gray-500">Hoàn thành các cột mốc để nhận thưởng!</p>
          </div>
        </div>
        <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{wordsLearnedToday}</p>
            <p className="text-xs text-gray-500">từ đã học</p>
        </div>
      </div>
      
      {/* Thanh tiến trình cột mốc */}
      <div className="mt-6 mb-8">
        <div className="relative w-full h-8 flex items-center">
            {/* Thanh nền */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 bg-gray-200 rounded-full"></div>
            {/* Thanh tiến độ */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500 ease-out" 
                 style={{ width: `${Math.min(100, (wordsLearnedToday / GOAL_MILESTONES[GOAL_MILESTONES.length - 1]) * 100)}%` }}>
            </div>

            {/* Các cột mốc */}
            <div className="relative w-full flex justify-between items-center">
                {GOAL_MILESTONES.map(goal => {
                    const isCompleted = wordsLearnedToday >= goal;
                    const isClaimed = claimedGoals.includes(goal);
                    const isClaimable = isCompleted && !isClaimed;

                    let circleClass = 'bg-gray-300 border-gray-400';
                    if (isCompleted) circleClass = 'bg-green-500 border-green-600';
                    if (isClaimable) circleClass = 'bg-yellow-400 border-yellow-500 animate-pulse';
                    
                    return (
                        <div key={goal} className="flex flex-col items-center z-10">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow transition-all duration-300 ${circleClass}`}>
                                {(isCompleted || isClaimed) && <CheckIcon />}
                            </div>
                            <span className={`mt-2 text-xs font-bold ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>{goal}</span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Nút nhận thưởng và thông báo */}
      <div className="mt-4 h-12 flex items-center justify-center">
        {progressInfo.claimableGoal ? (
            <button onClick={handleClaim} className="flex items-center justify-center px-8 py-3 w-full sm:w-auto font-bold text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
              <GiftIcon /> Nhận thưởng mốc {progressInfo.claimableGoal} từ
            </button>
        ) : wordsLearnedToday >= GOAL_MILESTONES[GOAL_MILESTONES.length - 1] && claimedGoals.length === GOAL_MILESTONES.length ? (
            <div className="text-center p-3 bg-green-100 text-green-700 rounded-lg w-full">
                <p className="font-bold">Tuyệt vời! Bạn đã hoàn thành tất cả mục tiêu hôm nay!</p>
            </div>
        ) : (
            <div className="text-center text-gray-500 w-full">
              <p className="font-semibold">Cố gắng đạt mốc tiếp theo: {progressInfo.nextTargetGoal} từ!</p>
              <p className="text-sm">Bạn cần học thêm {Math.max(0, progressInfo.nextTargetGoal - wordsLearnedToday)} từ nữa.</p>
            </div>
        )}
      </div>
    </div>
  );
};


// --- Component Lịch hoạt động (Activity Calendar) ---
const ActivityCalendar: FC<{ activityData: DailyActivityMap }> = ({ activityData }) => {
    const calendarData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay(); 
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const startDate = new Date(startOfWeek);
        startDate.setDate(startOfWeek.getDate() - (4 * 7));
        const days = [];
        const activityDates = new Set(Object.keys(activityData));
        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDateToLocalYYYYMMDD(date);
            const hasActivity = activityDates.has(dateString);
            const activityDetail = activityData[dateString] || { new: 0, review: 0 };
            days.push({
                date, dateString, dayOfMonth: date.getDate(), hasActivity,
                isToday: date.getTime() === today.getTime(),
                isFuture: date.getTime() > today.getTime(),
                tooltip: hasActivity ? `${date.toLocaleDateString('vi-VN')}: Học ${activityDetail.new} từ mới, ôn ${activityDetail.review} từ.` : date.toLocaleDateString('vi-VN'),
            });
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
};


// --- Component chính ---
export default function AnalysisDashboard() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof WordMastery, direction: 'asc' | 'desc' }>({ key: 'mastery', direction: 'desc' });
  const [visibleMasteryRows, setVisibleMasteryRows] = useState(10);
  
  // State cho component mục tiêu hàng ngày (thiết kế mới)
  const [claimedGoalsToday, setClaimedGoalsToday] = useState<number[]>([]); // Trong thực tế, giá trị này nên lấy từ DB theo ngày

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); setError("Vui lòng đăng nhập để xem phân tích."); return; }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
            getDocs(collection(db, 'users', user.uid, 'completedWords')),
            getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);
        const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0 };
        const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
        const dailyActivity: DailyActivityMap = {};
        const allCompletionsForRecent: { word: string; date: Date }[] = [];
        
        completedWordsSnapshot.forEach(doc => {
            const data = doc.data();
            const lastCompletedAt = data.lastCompletedAt?.toDate();
            if (!lastCompletedAt) return;
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
        
        completedMultiWordSnapshot.forEach(doc => {
            const data = doc.data();
            const lastCompletedAt = data.lastCompletedAt?.toDate();
            if (!lastCompletedAt) return;
            allCompletionsForRecent.push({word: doc.id, date: lastCompletedAt});
            const dateString = formatDateToLocalYYYYMMDD(lastCompletedAt);
            if (!dailyActivity[dateString]) dailyActivity[dateString] = { new: 0, review: 0 };
            dailyActivity[dateString].review++;
            if (data.completedIn) Object.keys(data.completedIn).forEach(mode => { if (mode.startsWith('fill-word-')) masteryByGame['Điền từ']++; });
        });
        
        setDailyActivityData(dailyActivity);
        const learningActivityData: LearningActivity[] = Object.entries(dailyActivity).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let cumulative = 0;
        const vocabularyGrowthData = learningActivityData.map(item => { cumulative += item.new; return { date: new Date(item.date).toLocaleDateString('vi-VN'), cumulative }; });
        const masteryData = Object.entries(masteryByGame).map(([game, completed]) => ({ game, completed })).filter(item => item.completed > 0);
        const recentCompletions = [...allCompletionsForRecent].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5).map(c => ({ word: c.word, date: c.date.toLocaleString('vi-VN') }));
        const totalWordsLearned = new Set([...completedWordsSnapshot.docs.map(d => d.id), ...completedMultiWordSnapshot.docs.map(d => d.id)]).size;
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

  const handleClaimReward = (goalValue: number) => {
      console.log(`Phần thưởng cho mốc ${goalValue} từ đã được nhận!`);
      // Logic thực tế: cập nhật điểm thưởng cho user trong Firestore, hiển thị pháo hoa, v.v.
      alert(`Chúc mừng bạn đã hoàn thành mục tiêu ${goalValue} từ và nhận được phần thưởng!`);
      setClaimedGoalsToday(prev => [...prev, goalValue]);
  };

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
  };

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
  if (!analysisData || analysisData.totalWordsLearned === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center text-gray-500">
            <h2 className="text-2xl font-bold mb-2">Chưa có dữ liệu</h2>
            <p>Hãy bắt đầu học để xem tiến trình của bạn được phân tích tại đây!</p>
        </div>
      );
  }

  const { totalWordsLearned, totalWordsAvailable, learningActivity, masteryByGame, vocabularyGrowth } = analysisData;
  const completionPercentage = totalWordsAvailable > 0 ? (totalWordsLearned / totalWordsAvailable * 100).toFixed(1) : 0;
  const barColors = ["#8884d8", "#82ca9d"];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">Bảng phân tích</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100"><div className="bg-blue-100 text-blue-600 p-3 rounded-full"><BookOpenIcon /></div><div><p className="text-sm text-gray-500">Tổng từ đã học</p><p className="text-3xl font-bold text-gray-900">{totalWordsLearned}</p></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100"><div className="bg-green-100 text-green-600 p-3 rounded-full"><CheckCircleIcon /></div><div><p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p><p className="text-3xl font-bold text-gray-900">{completionPercentage}%</p></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100"><div className="bg-purple-100 text-purple-600 p-3 rounded-full"><ChartBarIcon /></div><div><p className="text-sm text-gray-500">Từ vựng còn lại</p><p className="text-3xl font-bold text-gray-900">{totalWordsAvailable - totalWordsLearned}</p></div></div>
        </div>

        {/* --- TÍCH HỢP CỘT MỐC MỤC TIÊU (THIẾT KẾ MỚI) --- */}
        <div className="mb-6">
            <DailyGoalMilestones 
                wordsLearnedToday={wordsLearnedToday}
                onClaimReward={handleClaimReward}
                claimedGoals={claimedGoalsToday}
            />
        </div>

        <div className="mb-6"><ActivityCalendar activityData={dailyActivityData} /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard title="Tăng trưởng từ vựng">
                <ResponsiveContainer><AreaChart data={vocabularyGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="cumulative" name="Tổng số từ" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" /></AreaChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Hoạt động học tập (30 ngày qua)">
                <ResponsiveContainer><BarChart data={learningActivity} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12}/><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(136, 132, 216, 0.1)'}}/><Legend verticalAlign="top" wrapperStyle={{top: 0, left: 25}}/><Bar dataKey="new" name="Từ mới" stackId="a" fill="#82ca9d" /><Bar dataKey="review" name="Ôn tập" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Tổng điểm theo Game">
                <ResponsiveContainer><BarChart data={masteryByGame} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis type="number" hide /><YAxis dataKey="game" type="category" width={80} tick={{ fontSize: 14 }} /><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 128, 66, 0.1)'}} /><Bar dataKey="completed" name="Tổng điểm" barSize={35}>{masteryByGame.map((entry, index) => (<Cell key={`cell-${index}`} fill={barColors[index % 2]} />))}</Bar></BarChart></ResponsiveContainer>
            </ChartCard>
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Phân tích độ thành thạo Từ vựng</h3>
                {sortedWordMastery.length > 0 ? (<>
                    <div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-600"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Từ vựng</th><th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('mastery')}>Điểm thành thạo<SortIcon direction={sortConfig.key === 'mastery' ? sortConfig.direction : undefined} /></th><th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('lastPracticed')}>Lần cuối luyện tập<SortIcon direction={sortConfig.key === 'lastPracticed' ? sortConfig.direction : undefined} /></th></tr></thead>
                        <tbody>{sortedWordMastery.slice(0, visibleMasteryRows).map(({ word, mastery, lastPracticed }) => (
                            <tr key={word} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900 capitalize whitespace-nowrap">{word}</td>
                                <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-bold w-4 text-center">{mastery}</span><div className="w-20 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(mastery / 10, 1) * 100}%` }}></div></div></div></td>
                                <td className="px-4 py-3">{lastPracticed.toLocaleDateString('vi-VN')}</td>
                            </tr>
                        ))}</tbody></table></div>
                    {visibleMasteryRows < sortedWordMastery.length && (<div className="text-center mt-4"><button onClick={() => setVisibleMasteryRows(prev => prev + 10)} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors">Hiển thị thêm</button></div>)}
                </>) : (<p className="text-center text-gray-500 py-4">Không có dữ liệu về độ thành thạo.</p>)}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
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
