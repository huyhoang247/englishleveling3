// --- START OF FILE: src/components/analysis/AnalysisDashboard.tsx ---

import React, { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { db, auth } from '../firebase.js'; // Điều chỉnh đường dẫn đến file firebase của bạn
import { collection, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
    AreaChart, Area, BarChart, Bar, Radar, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { defaultVocabulary } from './list-vocabulary.ts'; // Điều chỉnh đường dẫn

// --- Icons (Sử dụng các icon SVG đơn giản để không phụ thuộc vào file ngoài) ---
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Định nghĩa kiểu dữ liệu cho phân tích ---
interface LearningActivity {
  date: string;
  count: number;
}
interface MasteryByGame {
  game: string;
  completed: number;
}
interface VocabularyGrowth {
    date: string;
    cumulative: number;
}
interface AnalysisData {
  totalWordsLearned: number;
  totalWordsAvailable: number;
  learningActivity: LearningActivity[];
  masteryByGame: MasteryByGame[];
  vocabularyGrowth: VocabularyGrowth[];
  recentCompletions: { word: string; date: string }[];
}

// --- Component Card tái sử dụng cho mỗi biểu đồ ---
const ChartCard: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 sm:h-72 w-full">{children}</div>
    </div>
);

// --- Component chính ---
export default function AnalysisDashboard() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

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

        const dailyCounts: { [key: string]: number } = {};
        const masteryByGame: { [key: string]: number } = { 'Trắc nghiệm': 0, 'Điền từ': 0 };
        const allCompletions: { word: string; date: Date }[] = [];

        const processSnapshot = (snapshot: QuerySnapshot<DocumentData>, type: 'single' | 'multi') => {
          snapshot.forEach(doc => {
            const data = doc.data();
            const lastCompletedAt = data.lastCompletedAt?.toDate();

            if (lastCompletedAt) {
              const dateString = lastCompletedAt.toISOString().split('T')[0]; // YYYY-MM-DD
              dailyCounts[dateString] = (dailyCounts[dateString] || 0) + 1;
              allCompletions.push({ word: doc.id, date: lastCompletedAt });
            }
            
            const gameModes = type === 'single' ? data.gameModes : data.completedIn;
            if (gameModes) {
                Object.keys(gameModes).forEach(mode => {
                    if (mode.startsWith('quiz-')) {
                        masteryByGame['Trắc nghiệm']++;
                    } else if (mode.startsWith('fill-word-')) {
                        masteryByGame['Điền từ']++;
                    }
                });
            }
          });
        };
        
        processSnapshot(completedWordsSnapshot, 'single');
        processSnapshot(completedMultiWordSnapshot, 'multi');

        const sortedDailyCounts = Object.entries(dailyCounts)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let cumulative = 0;
        const vocabularyGrowthData = sortedDailyCounts.map(item => {
            cumulative += item.count;
            return { date: new Date(item.date).toLocaleDateString('vi-VN'), cumulative };
        });

        const masteryData = Object.entries(masteryByGame).map(([game, completed]) => ({ game, completed }));
        
        const recentCompletions = allCompletions
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5)
            .map(c => ({
                word: c.word,
                date: c.date.toLocaleString('vi-VN')
            }));
        
        const totalWordsLearned = new Set([...completedWordsSnapshot.docs.map(d => d.id), ...completedMultiWordSnapshot.docs.map(d => d.id)]).size;

        setAnalysisData({
          totalWordsLearned: totalWordsLearned,
          totalWordsAvailable: defaultVocabulary.length,
          learningActivity: sortedDailyCounts.slice(-30).map(d => ({...d, date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})),
          masteryByGame: masteryData,
          vocabularyGrowth: vocabularyGrowthData,
          recentCompletions: recentCompletions,
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-gray-800 text-white rounded-md shadow-lg text-sm border border-gray-700">
          <p className="font-bold">{`Ngày: ${label}`}</p>
          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
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

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">Bảng phân tích học tập</h1>

        {/* --- Thẻ KPI --- */}
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

        {/* --- Lưới Biểu Đồ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard title="Tăng trưởng từ vựng">
                <ResponsiveContainer>
                    <AreaChart data={vocabularyGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis allowDecimals={false} fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="cumulative" name="Tổng số từ" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Hoạt động 30 ngày qua">
                <ResponsiveContainer>
                    <BarChart data={learningActivity} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis allowDecimals={false} fontSize={12}/>
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(136, 132, 216, 0.1)'}}/>
                        <Bar dataKey="count" name="Từ đã học" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Độ thành thạo theo Game">
                <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={masteryByGame}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="game" />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} />
                        <Radar name="Hoàn thành" dataKey="completed" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                        <Tooltip />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </ChartCard>
            
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

// --- END OF FILE: src/components/analysis/AnalysisDashboard.tsx ---
