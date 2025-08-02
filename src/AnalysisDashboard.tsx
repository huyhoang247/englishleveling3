// --- START OF FILE: src/components/analysis/AnalysisDashboard.tsx ---

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
const SortIcon = ({ direction }: { direction?: 'asc' | 'desc' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'asc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
        {direction === 'desc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
        {!direction && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />}
    </svg>
);

// --- Định nghĩa kiểu dữ liệu cho phân tích ---
interface LearningActivity {
  date: string;
  new: number;
  review: number;
}
interface MasteryByGame {
  game: string;
  completed: number;
}
interface VocabularyGrowth {
    date: string;
    cumulative: number;
}
interface WordMastery {
    word: string;
    mastery: number;
    lastPracticed: Date; 
}
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

// --- [MỚI] Component Lịch hoạt động (Activity Calendar) ---
const ActivityCalendar: FC<{ activityData: DailyActivityMap }> = ({ activityData }) => {
    const calendarData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Bắt đầu từ thứ Hai của tuần hiện tại
        const dayOfWeek = today.getDay(); // 0=CN, 1=T2,...
        const startOfWeek = new Date(today);
        // Điều chỉnh về thứ Hai (nếu là CN, lùi 6 ngày, ngược lại lùi dayOfWeek-1 ngày)
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        // Lùi lại 4 tuần từ đầu tuần này để lấy ngày đầu tiên của lưới 5x7
        const startDate = new Date(startOfWeek);
        startDate.setDate(startOfWeek.getDate() - (4 * 7));

        const days = [];
        const activityDates = new Set(Object.keys(activityData));

        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            const hasActivity = activityDates.has(dateString);
            const activityDetail = activityData[dateString] || { new: 0, review: 0 };
            
            days.push({
                date,
                dateString,
                dayOfMonth: date.getDate(),
                hasActivity,
                isToday: date.getTime() === today.getTime(),
                isFuture: date.getTime() > today.getTime(),
                tooltip: hasActivity 
                    ? `${date.toLocaleDateString('vi-VN')}: Học ${activityDetail.new} từ mới, ôn ${activityDetail.review} từ.`
                    : date.toLocaleDateString('vi-VN'),
            });
        }
        return days;
    }, [activityData]);

    const weekDayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Chuỗi hoạt động</h3>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {weekDayHeaders.map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-500 mb-2">{day}</div>
                ))}
                {calendarData.map((day, index) => {
                    const baseClass = "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-transform duration-150 ease-in-out hover:scale-110";
                    let dayClass = "";
                    
                    if (day.isFuture) {
                        dayClass = "bg-gray-100 text-gray-300 cursor-not-allowed";
                    } else if (day.hasActivity) {
                        dayClass = "bg-green-500 text-white";
                    } else {
                        dayClass = "bg-gray-200 text-gray-400";
                    }

                    if (day.isToday) {
                        dayClass += " ring-2 ring-offset-2 ring-indigo-500";
                    }
                    
                    return (
                        <div key={index} title={day.tooltip} className={`${baseClass} ${dayClass}`}>
                            {day.hasActivity ? <CalendarCheckIcon /> : <span>{day.dayOfMonth}</span>}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-lg bg-gray-200"></div>
                    <span>Chưa học</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-lg bg-green-500"></div>
                    <span>Đã học</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-lg ring-2 ring-offset-1 ring-indigo-500"></div>
                    <span>Hôm nay</span>
                </div>
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
  const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({}); // [MỚI] State cho lịch hoạt động
  const [sortConfig, setSortConfig] = useState<{ key: keyof WordMastery, direction: 'asc' | 'desc' }>({ key: 'mastery', direction: 'desc' });
  const [visibleMasteryRows, setVisibleMasteryRows] = useState(10);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
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
        const [completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
            getDocs(collection(db, 'users', user.uid, 'completedWords')),
            getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);

        const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0 };
        const wordMasteryMap: { [word: string]: { mastery: number; lastPracticed: Date } } = {};
        const dailyActivity: DailyActivityMap = {};
        const allCompletionsForRecent: { word: string; date: Date }[] = [];
        
        // --- CORRECTED LOGIC for Daily Activity (New vs Review) ---
        completedWordsSnapshot.forEach(doc => {
            const data = doc.data();
            const lastCompletedAt = data.lastCompletedAt?.toDate();
            if (!lastCompletedAt) return;

            allCompletionsForRecent.push({word: doc.id, date: lastCompletedAt});

            const dateString = lastCompletedAt.toISOString().split('T')[0];
            if (!dailyActivity[dateString]) {
                dailyActivity[dateString] = { new: 0, review: 0 };
            }

            let totalCompletions = 0;
            let totalCorrectForWord = 0;
            if (data.gameModes) {
                Object.values(data.gameModes).forEach((modeData: any) => {
                    totalCompletions += modeData.correctCount || 0;
                });
                Object.keys(data.gameModes).forEach(mode => {
                    const correctCount = data.gameModes[mode].correctCount || 0;
                    totalCorrectForWord += correctCount;
                     if (mode.startsWith('quiz-')) {
                        masteryByGame['Trắc nghiệm'] += correctCount;
                    } else if (mode.startsWith('fill-word-')) {
                        masteryByGame['Điền từ'] += correctCount;
                    }
                });
            }

            if (totalCompletions > 1) {
                dailyActivity[dateString].review++;
            } else if (totalCompletions === 1) {
                dailyActivity[dateString].new++;
            }

            if (totalCorrectForWord > 0) {
                 wordMasteryMap[doc.id] = {
                    mastery: totalCorrectForWord,
                    lastPracticed: lastCompletedAt
                };
            }
        });
        
        completedMultiWordSnapshot.forEach(doc => {
            const data = doc.data();
            const lastCompletedAt = data.lastCompletedAt?.toDate();
            if (!lastCompletedAt) return;

            allCompletionsForRecent.push({word: doc.id, date: lastCompletedAt});

            const dateString = lastCompletedAt.toISOString().split('T')[0];
            if (!dailyActivity[dateString]) {
                dailyActivity[dateString] = { new: 0, review: 0 };
            }
            // Assume multi-word completions are reviews
            dailyActivity[dateString].review++;

            if (data.completedIn) {
                Object.keys(data.completedIn).forEach(mode => {
                    if (mode.startsWith('fill-word-')) {
                         masteryByGame['Điền từ']++;
                    }
                });
            }
        });
        
        setDailyActivityData(dailyActivity); // [MỚI] Lưu dữ liệu hoạt động hàng ngày

        const learningActivityData: LearningActivity[] = Object.entries(dailyActivity)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let cumulative = 0;
        const vocabularyGrowthData = learningActivityData.map(item => {
            cumulative += item.new;
            return { date: new Date(item.date).toLocaleDateString('vi-VN'), cumulative };
        });

        const masteryData = Object.entries(masteryByGame).map(([game, completed]) => ({ game, completed })).filter(item => item.completed > 0);
        
        const recentCompletions = [...allCompletionsForRecent]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5)
            .map(c => ({
                word: c.word,
                date: c.date.toLocaleString('vi-VN')
            }));
        
        const totalWordsLearned = new Set([...completedWordsSnapshot.docs.map(d => d.id), ...completedMultiWordSnapshot.docs.map(d => d.id)]).size;
        
        const wordMasteryData: WordMastery[] = Object.entries(wordMasteryMap).map(([word, data]) => ({
            word,
            ...data
        }));

        setAnalysisData({
          totalWordsLearned: totalWordsLearned,
          totalWordsAvailable: defaultVocabulary.length,
          learningActivity: learningActivityData.slice(-30).map(d => ({...d, date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})),
          masteryByGame: masteryData,
          vocabularyGrowth: vocabularyGrowthData,
          recentCompletions: recentCompletions,
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

  const sortedWordMastery = useMemo(() => {
    if (!analysisData?.wordMastery) return [];
    return [...analysisData.wordMastery].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
  }, [analysisData?.wordMastery, sortConfig]);

  const handleSort = (key: keyof WordMastery) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const finalLabel = payload[0].payload.game ? payload[0].payload.game : `Ngày: ${label}`;
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);

      return (
        <div className="p-2 bg-gray-800 text-white rounded-md shadow-lg text-sm border border-gray-700">
          <p className="font-bold">{finalLabel}</p>
          {payload.map((pld) => (
            <p key={pld.dataKey} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value}`}</p>
          ))}
          {payload.length > 1 && total > 0 && (
            <>
              <hr className="my-1 border-gray-600" />
              <p className="font-semibold">{`Tổng: ${total}`}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">Đang tải phân tích...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 p-4">{error}</div>;
  }
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">Bảng phân tích học tập</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><BookOpenIcon /></div>
                <div>
                    <p className="text-sm text-gray-500">Tổng từ đã học</p>
                    <p className="text-3xl font-bold text-gray-900">{totalWordsLearned}</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100">
                <div className="bg-green-100 text-green-600 p-3 rounded-full"><CheckCircleIcon /></div>
                <div>
                    <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
                    <p className="text-3xl font-bold text-gray-900">{completionPercentage}%</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-gray-100">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-full"><ChartBarIcon /></div>
                <div>
                    <p className="text-sm text-gray-500">Từ vựng còn lại</p>
                    <p className="text-3xl font-bold text-gray-900">{totalWordsAvailable - totalWordsLearned}</p>
                </div>
            </div>
        </div>

        {/* --- [MỚI] Vị trí của Lịch hoạt động --- */}
        <div className="mb-6">
            <ActivityCalendar activityData={dailyActivityData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard title="Tăng trưởng từ vựng">
                <ResponsiveContainer>
                    <AreaChart data={vocabularyGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis allowDecimals={false} fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="cumulative" name="Tổng số từ" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Hoạt động học tập (30 ngày qua)">
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

            <ChartCard title="Tổng điểm theo Game">
                <ResponsiveContainer>
                    <BarChart data={masteryByGame} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="game" type="category" width={80} tick={{ fontSize: 14 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 128, 66, 0.1)'}} />
                        <Bar dataKey="completed" name="Tổng điểm" barSize={35}>
                            {masteryByGame.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % 2]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Phân tích độ thành thạo Từ vựng</h3>
                {sortedWordMastery.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Từ vựng</th>
                                        <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('mastery')}>
                                            Điểm thành thạo
                                            <SortIcon direction={sortConfig.key === 'mastery' ? sortConfig.direction : undefined} />
                                        </th>
                                        <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort('lastPracticed')}>
                                            Lần cuối luyện tập
                                            <SortIcon direction={sortConfig.key === 'lastPracticed' ? sortConfig.direction : undefined} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedWordMastery.slice(0, visibleMasteryRows).map(({ word, mastery, lastPracticed }) => (
                                        <tr key={word} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900 capitalize whitespace-nowrap">{word}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold w-4 text-center">{mastery}</span>
                                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(mastery / 10, 1) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{lastPracticed.toLocaleDateString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {visibleMasteryRows < sortedWordMastery.length && (
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => setVisibleMasteryRows(prev => prev + 10)}
                                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                                >
                                    Hiển thị thêm
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-4">Không có dữ liệu về độ thành thạo.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
                 {recentCompletions.length > 0 ? (
                    <ul className="space-y-3">
                        {recentCompletions.map((item, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="font-medium text-gray-700 capitalize">{item.word}</span>
                                <span className="text-sm text-gray-500">{item.date}</span>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-center text-gray-500 py-4">Không có hoạt động nào gần đây.</p>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}
