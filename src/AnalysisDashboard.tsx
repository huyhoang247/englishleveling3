import React, { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { db, auth } from './firebase.js'; // Điều chỉnh đường dẫn đến file firebase của bạn
import { collection, getDocs, doc, getDoc, setDoc, QuerySnapshot, DocumentData } from 'firebase/firestore'; // --- CẬP NHẬT ---
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { defaultVocabulary } from './list-vocabulary.ts'; // Điều chỉnh đường dẫn

// --- Icons ---
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

// --- [MỚI] Hàm inject CSS cho hiệu ứng bong bóng ---
const GlobalStyles = () => {
    useEffect(() => {
        const styleTag = document.createElement("style");
        styleTag.innerHTML = `
            @keyframes bubble {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 0.7;
                }
                99% {
                    transform: translateY(-120px) scale(1.2);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 0;
                }
            }
            .animate-bubble {
                animation: bubble 3s linear infinite;
            }
        `;
        document.head.appendChild(styleTag);
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);
    return null;
};

// --- [SỬA LỖI MÚI GIỜ] Hàm trợ giúp để định dạng ngày theo giờ địa phương (YYYY-MM-DD) ---
const formatDateToLocalYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Định nghĩa kiểu dữ liệu ---
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

// --- Component Card tái sử dụng cho biểu đồ ---
const ChartCard: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 sm:h-72 w-full">{children}</div>
    </div>
);

// --- [MỚI] Component Bể học tập hàng ngày ---
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 015.255-2.193.75.75 0 011.49 0A3 3 0 0115 5v2.25a.75.75 0 01-1.5 0V5a1.5 1.5 0 00-1.5-1.5H11a.75.75 0 010-1.5h.5A3 3 0 0115 5v2.25a.75.75 0 01-1.5 0V5a1.5 1.5 0 00-1.5-1.5h-.5a1.5 1.5 0 00-1.5 1.5v2.25a.75.75 0 01-1.5 0V5a1.5 1.5 0 00-1.5-1.5H6.5a1.5 1.5 0 00-1.5 1.5v2.25a.75.75 0 01-1.5 0V5z" clipRule="evenodd" /><path d="M3.25 9.75a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v6.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.25v-6.5zM4.5 11.25a.75.75 0 000 1.5h1.25a.75.75 0 000-1.5H4.5z" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const Bubble: FC<{ delay: number }> = ({ delay }) => <div className="absolute bottom-0 w-2 h-2 bg-white/30 rounded-full animate-bubble" style={{ left: `${Math.random() * 85 + 5}%`, animationDelay: `${delay}s` }} />;

interface DailyGoalTrackerProps { wordsLearnedToday: number; isRewardClaimed: boolean; onClaimReward: () => void; }
const GOAL_OPTIONS = [5, 10, 20, 50, 100, 200];

const DailyGoalTrackerCard: FC<DailyGoalTrackerProps> = ({ wordsLearnedToday, isRewardClaimed, onClaimReward }) => {
    const [currentGoal, setCurrentGoal] = useState<number>(() => {
        const savedGoal = typeof window !== 'undefined' ? localStorage.getItem('dailyLearningGoal') : null;
        return savedGoal ? parseInt(savedGoal, 10) : 10;
    });

    useEffect(() => {
        localStorage.setItem('dailyLearningGoal', currentGoal.toString());
    }, [currentGoal]);

    const progressPercentage = useMemo(() => Math.min((wordsLearnedToday / currentGoal) * 100, 100), [wordsLearnedToday, currentGoal]);
    const isGoalMet = wordsLearnedToday >= currentGoal;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex-grow w-full">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Mục tiêu hàng ngày</h3>
                        <p className="text-sm text-gray-500">Hoàn thành để nhận thưởng!</p>
                    </div>
                    <div className="relative">
                        <select value={currentGoal} onChange={(e) => setCurrentGoal(Number(e.target.value))} className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold" disabled={isRewardClaimed}>
                            {GOAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} từ</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDownIcon /></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-32 bg-gray-200 rounded-t-xl rounded-b-lg border-b-4 border-gray-300 overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-700 ease-out" style={{ height: `${progressPercentage}%` }}>
                            {progressPercentage > 5 && <Bubble delay={0} />}
                            {progressPercentage > 25 && <Bubble delay={1.5} />}
                            {progressPercentage > 50 && <Bubble delay={0.5} />}
                            {progressPercentage > 75 && <Bubble delay={2.5} />}
                        </div>
                        <div className="absolute top-0 left-full w-2 h-full ml-1">
                             <div className="absolute bg-gray-400 h-px w-2" style={{bottom: '25%'}}></div>
                             <div className="absolute bg-gray-400 h-px w-2" style={{bottom: '50%'}}></div>
                             <div className="absolute bg-gray-400 h-px w-2" style={{bottom: '75%'}}></div>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <p className="text-3xl font-bold text-indigo-600">{wordsLearnedToday}<span className="text-xl text-gray-500 font-medium"> / {currentGoal}</span></p>
                        <p className="text-sm font-semibold text-gray-600 mt-1">{isGoalMet ? "🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu." : "Cố gắng lên nào!"}</p>
                    </div>
                </div>
            </div>
            <div className="w-full sm:w-auto flex justify-center">
                {isRewardClaimed ? (
                     <button disabled className="w-full sm:w-40 bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Đã nhận</span>
                    </button>
                ) : (
                    <button onClick={onClaimReward} disabled={!isGoalMet} className={`w-full sm:w-40 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${isGoalMet ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                        <GiftIcon />
                        <span>Nhận thưởng</span>
                    </button>
                )}
            </div>
        </div>
    );
};


// --- Component Lịch hoạt động (Activity Calendar) ---
const ActivityCalendar: FC<{ activityData: DailyActivityMap }> = ({ activityData }) => {
    // ... (Giữ nguyên code của ActivityCalendar, không cần thay đổi)
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
                date,
                dateString,
                dayOfMonth: date.getDate(),
                hasActivity,
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
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500 p-2 rounded-lg shadow-md"><CalendarIcon /></div>
                <h3 className="text-lg font-bold text-gray-800">Activity</h3>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {weekDayHeaders.map(day => <div key={day} className="text-xs font-semibold text-gray-500 mb-2">{day}</div>)}
                {calendarData.map((day, index) => {
                    const baseClass = "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-transform duration-150 ease-in-out hover:scale-110";
                    let dayClass = day.isFuture ? "bg-gray-100 text-gray-300 cursor-not-allowed" : (day.hasActivity ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400");
                    if (day.isToday) dayClass += " ring-2 ring-offset-2 ring-indigo-500";
                    return (<div key={index} title={day.tooltip} className={`${baseClass} ${dayClass}`}>{(day.hasActivity && !day.isFuture) ? <CalendarCheckIcon /> : <span>{day.dayOfMonth}</span>}</div>);
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
  
  // --- [MỚI] State cho bể học tập ---
  const [wordsLearnedToday, setWordsLearnedToday] = useState(0);
  const [isRewardClaimedToday, setIsRewardClaimedToday] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem phân tích.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const todayString = formatDateToLocalYYYYMMDD(new Date());

        // --- CẬP NHẬT: Thêm getDoc để kiểm tra reward ---
        const [completedWordsSnapshot, completedMultiWordSnapshot, rewardDocSnap] = await Promise.all([
            getDocs(collection(db, 'users', user.uid, 'completedWords')),
            getDocs(collection(db, 'users', user.uid, 'completedMultiWord')),
            getDoc(doc(db, 'users', user.uid, 'dailyRewards', todayString))
        ]);

        // --- MỚI: Kiểm tra trạng thái nhận thưởng ---
        setIsRewardClaimedToday(rewardDocSnap.exists());
        
        // --- Phần code xử lý dữ liệu hiện tại ---
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
            let totalCompletions = 0;
            let totalCorrectForWord = 0;
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

        // --- MỚI: Tính toán số từ học hôm nay ---
        const todayActivity = dailyActivity[todayString] || { new: 0, review: 0 };
        setWordsLearnedToday(todayActivity.new + todayActivity.review);

        const learningActivityData = Object.entries(dailyActivity).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let cumulative = 0;
        const vocabularyGrowthData = learningActivityData.map(item => { cumulative += item.new; return { date: new Date(item.date).toLocaleDateString('vi-VN'), cumulative }; });
        const masteryData = Object.entries(masteryByGame).map(([game, completed]) => ({ game, completed })).filter(item => item.completed > 0);
        const recentCompletions = [...allCompletionsForRecent].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5).map(c => ({ word: c.word, date: c.date.toLocaleString('vi-VN') }));
        const totalWordsLearned = new Set([...completedWordsSnapshot.docs.map(d => d.id), ...completedMultiWordSnapshot.docs.map(d => d.id)]).size;
        const wordMasteryData: WordMastery[] = Object.entries(wordMasteryMap).map(([word, data]) => ({ word, ...data }));
        
        setAnalysisData({
          totalWordsLearned,
          totalWordsAvailable: defaultVocabulary.length,
          learningActivity: learningActivityData.slice(-30).map(d => ({...d, date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})),
          masteryByGame: masteryData,
          vocabularyGrowth: vocabularyGrowthData,
          recentCompletions,
          wordMastery: wordMasteryData,
        });

      } catch (err: any) {
        console.error("Lỗi tải dữ liệu phân tích:", err);
        setError("Không thể tải dữ liệu phân tích.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);
  
  // --- MỚI: Hàm xử lý nhận thưởng ---
  const handleClaimReward = async () => {
      if (!user || isRewardClaimedToday) return;
      const todayString = formatDateToLocalYYYYMMDD(new Date());
      const rewardDocRef = doc(db, 'users', user.uid, 'dailyRewards', todayString);
      try {
          await setDoc(rewardDocRef, { claimedAt: new Date() });
          setIsRewardClaimedToday(true);
          alert("Chúc mừng bạn đã hoàn thành mục tiêu và nhận thưởng!");
          // Bạn có thể thêm logic cộng điểm, hiển thị confetti, v.v. ở đây
      } catch (error) {
          console.error("Lỗi khi nhận thưởng:", error);
          alert("Đã có lỗi xảy ra khi nhận thưởng. Vui lòng thử lại.");
      }
  };

  const sortedWordMastery = useMemo(() => {
    // ... (Giữ nguyên, không đổi)
    if (!analysisData?.wordMastery) return [];
    return [...analysisData.wordMastery].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [analysisData?.wordMastery, sortConfig]);

  const handleSort = (key: keyof WordMastery) => {
    // ... (Giữ nguyên, không đổi)
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    // ... (Giữ nguyên, không đổi)
    if (active && payload && payload.length) {
      const finalLabel = payload[0].payload.game ? payload[0].payload.game : `Ngày: ${label}`;
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="p-2 bg-gray-800 text-white rounded-md shadow-lg text-sm border border-gray-700">
          <p className="font-bold">{finalLabel}</p>
          {payload.map((pld) => <p key={pld.dataKey} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value}`}</p>)}
          {payload.length > 1 && total > 0 && (<><hr className="my-1 border-gray-600" /><p className="font-semibold">{`Tổng: ${total}`}</p></>)}
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

  const { totalWordsLearned, totalWordsAvailable, learningActivity, masteryByGame, vocabularyGrowth, recentCompletions } = analysisData;
  const completionPercentage = totalWordsAvailable > 0 ? (totalWordsLearned / totalWordsAvailable * 100).toFixed(1) : 0;
  const barColors = ["#8884d8", "#82ca9d"];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <GlobalStyles /> {/* --- MỚI: Inject CSS tại đây --- */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">Bảng phân tích</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100"><div className="bg-blue-100 text-blue-600 p-3 rounded-full"><BookOpenIcon /></div><div><p className="text-sm text-gray-500">Tổng từ đã học</p><p className="text-3xl font-bold text-gray-900">{totalWordsLearned}</p></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100"><div className="bg-green-100 text-green-600 p-3 rounded-full"><CheckCircleIcon /></div><div><p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p><p className="text-3xl font-bold text-gray-900">{completionPercentage}%</p></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100"><div className="bg-purple-100 text-purple-600 p-3 rounded-full"><ChartBarIcon /></div><div><p className="text-sm text-gray-500">Từ vựng còn lại</p><p className="text-3xl font-bold text-gray-900">{totalWordsAvailable - totalWordsLearned}</p></div></div>
        </div>

        {/* --- CẬP NHẬT: Thêm Bể học tập --- */}
        <div className="mb-6">
            <DailyGoalTrackerCard
                wordsLearnedToday={wordsLearnedToday}
                isRewardClaimed={isRewardClaimedToday}
                onClaimReward={handleClaimReward}
            />
        </div>

        <div className="mb-6">
            <ActivityCalendar activityData={dailyActivityData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard title="Tăng trưởng từ vựng">
                <ResponsiveContainer>
                    <AreaChart data={vocabularyGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="cumulative" name="Tổng số từ" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Hoạt động học tập (30 ngày qua)">
                <ResponsiveContainer>
                    <BarChart data={learningActivity} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12}/><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(136, 132, 216, 0.1)'}}/><Legend verticalAlign="top" wrapperStyle={{top: 0, left: 25}}/><Bar dataKey="new" name="Từ mới" stackId="a" fill="#82ca9d" /><Bar dataKey="review" name="Ôn tập" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Tổng điểm theo Game">
                <ResponsiveContainer>
                    <BarChart data={masteryByGame} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis type="number" hide /><YAxis dataKey="game" type="category" width={80} tick={{ fontSize: 14 }} /><Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 128, 66, 0.1)'}} /><Bar dataKey="completed" name="Tổng điểm" barSize={35}>{masteryByGame.map((entry, index) => (<Cell key={`cell-${index}`} fill={barColors[index % 2]} />))}</Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Phân tích độ thành thạo Từ vựng</h3>
                {sortedWordMastery.length > 0 ? (
                    <><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-600"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Từ vựng</th><th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('mastery')}>Điểm thành thạo<SortIcon direction={sortConfig.key === 'mastery' ? sortConfig.direction : undefined} /></th><th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('lastPracticed')}>Lần cuối luyện tập<SortIcon direction={sortConfig.key === 'lastPracticed' ? sortConfig.direction : undefined} /></th></tr></thead><tbody>{sortedWordMastery.slice(0, visibleMasteryRows).map(({ word, mastery, lastPracticed }) => (<tr key={word} className="bg-white border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900 capitalize whitespace-nowrap">{word}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-bold w-4 text-center">{mastery}</span><div className="w-20 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(mastery / 10, 1) * 100}%` }}></div></div></div></td><td className="px-4 py-3">{lastPracticed.toLocaleDateString('vi-VN')}</td></tr>))}</tbody></table></div>{visibleMasteryRows < sortedWordMastery.length && (<div className="text-center mt-4"><button onClick={() => setVisibleMasteryRows(prev => prev + 10)} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors">Hiển thị thêm</button></div>)}</>
                ) : <p className="text-center text-gray-500 py-4">Không có dữ liệu về độ thành thạo.</p>}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
                 {recentCompletions.length > 0 ? (<ul className="space-y-3">{recentCompletions.map((item, index) => (<li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><span className="font-medium text-gray-700 capitalize">{item.word}</span><span className="text-sm text-gray-500">{item.date}</span></li>))}</ul>) : <p className="text-center text-gray-500 py-4">Không có hoạt động nào gần đây.</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
