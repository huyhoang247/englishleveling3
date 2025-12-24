// --- START OF FILE: analysis-ui.tsx ---

import React, { useState, useMemo, FC, ReactNode, useCallback, memo } from 'react';
import { User } from 'firebase/auth';
import { AnalysisDashboardProvider, useAnalysisDashboard, WordMastery } from './analysis-context.tsx';
import AnalysisDashboardSkeleton from './analysis-loading.tsx'; 

import { 
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import { uiAssets, dashboardAssets } from '../../game-assets.ts'; 
import MasteryDisplay from '../../ui/display/mastery-display.tsx'; 
import { useAnimateValue } from '../../ui/useAnimateValue.ts'; 
import HomeButton from '../../ui/home-button.tsx'; 

// --- ICONS (Grouped for better organization) ---
const ActivityCompletedIcon = ({ className = "h-6 w-6" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"><defs><linearGradient id="activityGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2DD4BF" /><stop offset="100%" stopColor="#06B6D4" /></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#activityGradient)" /><path d="M8 12.5l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 015.252-2.121l.738.64.738-.64A3 3 0 0115 5v2.212a3 3 0 01-.679 1.943l-4.261 4.26a1.5 1.5 0 01-2.121 0l-4.26-4.26A3 3 0 015 7.212V5zm10 0a1 1 0 10-2 0v.788a1 1 0 01-.321.707l-4.26 4.26a.5.5 0 01-.707 0l-4.26-4.26A1 1 0 014 5.788V5a1 1 0 10-2 0v2.212a5 5 0 001.127 3.238l4.26 4.26a3.5 3.5 0 004.95 0l4.26-4.26A5 5 0 0015 7.212V5z" clipRule="evenodd" /></svg>;
const CheckCircleIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- TYPE DEFINITIONS ---
interface AnalysisDashboardProps { onGoBack: () => void; }

// --- HELPER COMPONENT: Styled Section Title ---
// Đã loại bỏ icon, giảm size và thêm opacity 30%
const StyledSectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-base font-lilita uppercase tracking-wider text-slate-900 opacity-30 select-none">
        {title}
    </h3>
);

// --- REUSABLE COMPONENTS ---
const ChartCard: FC<{ title: string; children: ReactNode; extra?: ReactNode }> = ({ title, children, extra }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
            {/* Sử dụng component tiêu đề mới */}
            <StyledSectionTitle title={title} />
            {extra && <div>{extra}</div>}
        </div>
        <div className="h-64 sm:h-72 w-full">{children}</div>
    </div>
);

const GOAL_MILESTONES = [5, 10, 20, 50, 100, 200];
const VOCAB_MILESTONES = [100, 200, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500];

interface MilestoneProgressProps {
  title: string; iconSrc: string; milestones: number[]; currentProgress: number; masteryCount: number;
  claimedMilestones: number[]; onClaim: (milestone: number, rewardAmount: number) => Promise<void>;
  user: User | null; progressColorClass?: string; completedText?: string;
}

const MilestoneProgress: FC<MilestoneProgressProps> = memo(({
    title, iconSrc, milestones, currentProgress, masteryCount, 
    claimedMilestones, onClaim, user,
    progressColorClass = "from-green-400 to-blue-500",
    completedText = "All missions completed!"
}) => {
    const [isClaiming, setIsClaiming] = useState(false);

    const { currentGoal, progressPercentage, isGoalMet, areAllGoalsMet } = useMemo(() => {
        const nextGoalIndex = milestones.findIndex(g => !claimedMilestones.includes(g));
        if (nextGoalIndex === -1) return { areAllGoalsMet: true, progressPercentage: 100, isGoalMet: true, currentGoal: milestones[milestones.length - 1] };
        const currentGoal = milestones[nextGoalIndex];
        const previousGoal = nextGoalIndex > 0 ? milestones[nextGoalIndex - 1] : 0;
        const progressInMilestone = Math.max(0, currentProgress - previousGoal);
        const milestoneSize = currentGoal - previousGoal;
        const progressPercentage = milestoneSize > 0 ? Math.min((progressInMilestone / milestoneSize) * 100, 100) : 100;
        const isGoalMet = currentProgress >= currentGoal;
        return { currentGoal, progressPercentage, isGoalMet, areAllGoalsMet: false };
    }, [currentProgress, claimedMilestones, milestones]);

    const handleClaim = useCallback(async () => {
        if (!isGoalMet || areAllGoalsMet || !user || isClaiming || !currentGoal) return;
        setIsClaiming(true);
        try {
            const rewardAmount = currentGoal * Math.max(1, masteryCount);
            await onClaim(currentGoal, rewardAmount);
        } catch (error) {
            console.error(`Lỗi khi nhận thưởng cho "${title}":`, error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally { setIsClaiming(false); }
    }, [isGoalMet, areAllGoalsMet, user, isClaiming, currentGoal, masteryCount, onClaim, title]);

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <img src={iconSrc} alt={title} className="w-11 h-11" />
                    <div>
                        {/* Cập nhật style title cho đồng bộ: size nhỏ, opacity 30% */}
                        <h3 className="text-base font-lilita uppercase tracking-wider text-gray-900 opacity-30">{title}</h3>
                        {areAllGoalsMet ? ( <p className="text-xs sm:text-sm text-green-600 font-semibold">{completedText}</p> ) : (
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1" title={`Reward = Milestone (${currentGoal}) × Max(1, Mastery Cards: ${masteryCount})`}>
                            <span className="flex items-center font-bold text-amber-600">
                                <img src={uiAssets.goldIcon} alt="Reward Coin" className="h-5 w-5 mr-1.5"/>
                                <span className="text-sm">{currentGoal * Math.max(1, masteryCount)}</span>
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
                            <span className="flex items-baseline"><span className="text-base font-extrabold text-gray-700">{currentProgress}</span><span className="text-sm font-medium text-gray-500">/{currentGoal}</span></span>
                        </div>
                    )}
                </div>
                <div className="w-full mt-3">
                    {areAllGoalsMet ? ( <div className="h-2.5 w-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full" title="All milestones completed!"></div>
                    ) : ( <div className={`w-full bg-gray-200 rounded-full h-2.5`}><div className={`bg-gradient-to-r ${progressColorClass} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${progressPercentage}%` }}></div></div> )}
                </div>
            </div>
        </div>
    );
});

const ActivityCalendar: FC<{ activityData: any }> = memo(({ activityData }) => {
    const formatDateForCalendar = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calendarData = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0); const dayOfWeek = today.getDay(); 
        const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const startDate = new Date(startOfWeek); startDate.setDate(startOfWeek.getDate() - (4 * 7));
        const days = []; const activityDates = new Set(Object.keys(activityData));
        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate); date.setDate(startDate.getDate() + i);
            const dateString = formatDateForCalendar(date); const hasActivity = activityDates.has(dateString);
            const activityDetail = activityData[dateString] || { new: 0, review: 0 };
            days.push({ date, dateString, dayOfMonth: date.getDate(), hasActivity, isToday: date.getTime() === today.getTime(), isFuture: date.getTime() > today.getTime(), tooltip: hasActivity ? `${date.toLocaleDateString('vi-VN')}: Học ${activityDetail.new} từ mới, ôn ${activityDetail.review} từ.` : date.toLocaleDateString('vi-VN'), });
        }
        return days;
    }, [activityData]);

    const weekDayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                    <CalendarIcon />
                </div>
                {/* Sử dụng component tiêu đề mới */}
                <StyledSectionTitle title="Activity" />
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {weekDayHeaders.map(day => <div key={day} className="text-xs font-semibold text-gray-500 mb-2">{day}</div>)}
                {calendarData.map((day, index) => {
                    const baseClass = "w-full aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ease-in-out";
                    let dayClass = "";
                    if (day.isFuture) {
                        dayClass = "bg-gray-100 text-gray-400 cursor-not-allowed";
                    } else {
                        dayClass = "bg-gray-200 text-gray-600 hover:bg-gray-300";
                    }
                    if (day.isToday) {
                        dayClass += " ring-2 ring-offset-2 ring-indigo-500";
                    }
                    return (
                        <div key={index} title={day.tooltip} className={`${baseClass} ${dayClass}`}>
                            {(day.hasActivity && !day.isFuture) 
                                ? <ActivityCompletedIcon /> 
                                : <span>{day.dayOfMonth}</span>
                            }
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-md bg-gray-200"></div><span>Chưa học</span></div>
                <div className="flex items-center gap-2">
                    <ActivityCompletedIcon className="h-4 w-4" />
                    <span>Đã học</span>
                </div>
                <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-md ring-2 ring-offset-1 ring-indigo-500"></div><span>Hôm nay</span></div>
            </div>
        </div>
    );
});

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

// [TỐI ƯU] Định nghĩa các hằng số cho props của biểu đồ để chúng không bị tạo lại trên mỗi lần render.
const chartMargin = { top: 5, right: 20, left: -10, bottom: 5 };
const barChartMargin = { top: 20, right: 20, left: -20, bottom: 5 };
const legendWrapperStyle = { top: 0, left: 25 };
const barChartCursorStyle = { fill: 'rgba(136, 132, 216, 0.1)' };

// [TỐI ƯU] Tách biểu đồ thành các component riêng và memoize để ngăn re-render không cần thiết.
const VocabularyGrowthChart = memo(({ data }: { data: any[] }) => {
    return (
        <ChartCard title="Vocabulary Growth">
            <ResponsiveContainer>
                <AreaChart data={data} margin={chartMargin}>
                    <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="cumulative" name="Tổng số từ" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

const StudyActivityChart = memo(({ data }: { data: any[] }) => {
    return (
        <ChartCard title="Study Activity" extra={<span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Last 30 Days</span>}>
            <ResponsiveContainer>
                <BarChart data={data} margin={barChartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12}/><Tooltip content={<CustomTooltip />} cursor={barChartCursorStyle}/><Legend verticalAlign="top" wrapperStyle={legendWrapperStyle}/><Bar dataKey="new" name="Từ mới" stackId="a" fill="#82ca9d" /><Bar dataKey="review" name="Ôn tập" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});


// --- MAIN DISPLAY COMPONENT ---
const ITEMS_PER_PAGE = 10;

function DashboardContent({ onGoBack }: AnalysisDashboardProps) {
  const { user, loading, error, analysisData, dailyActivityData, userProgress, wordsLearnedToday, claimDailyReward, claimVocabReward } = useAnalysisDashboard();
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof WordMastery, direction: 'asc' | 'desc' }>({ key: 'mastery', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const animatedCoins = useAnimateValue(userProgress.coins, 500);

  const sortedWordMastery = useMemo(() => {
    if (!analysisData?.wordMastery) return [];
    return [...analysisData.wordMastery].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [analysisData?.wordMastery, sortConfig]);

  const handleSort = useCallback((key: keyof WordMastery) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  }, [sortConfig]);
  
  if (loading) return <AnalysisDashboardSkeleton />;
  if (error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 p-4">{error}</div>;
  
  return (
    <div className="bg-white flex flex-col h-full">
        <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-md">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center">
                <HomeButton onClick={onGoBack} title="Về trang chủ" />
            </div>
            <div className="flex items-center justify-end gap-3">
               <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
               <MasteryDisplay masteryCount={userProgress.masteryCount} />
            </div>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
            {(!analysisData || analysisData.totalWordsLearned === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <h2 className="text-2xl font-bold mb-2">Chưa có dữ liệu</h2>
                    <p>Hãy bắt đầu học để xem tiến trình của bạn được phân tích tại đây!</p>
                </div>
            ) : (() => {
                const { totalWordsLearned, learningActivity, vocabularyGrowth } = analysisData;
                const totalPages = Math.ceil(sortedWordMastery.length / ITEMS_PER_PAGE);
                const paginatedMasteryData = sortedWordMastery.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                const handlePageChange = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };
                
                return (
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-full">
                        <div className="max-w-7xl mx-auto">
                            <div className="space-y-6 my-6">
                                <MilestoneProgress title="Voca Journey" iconSrc={dashboardAssets.vocaJourneyIcon} milestones={VOCAB_MILESTONES} currentProgress={totalWordsLearned} masteryCount={userProgress.masteryCount} claimedMilestones={userProgress.claimedVocabMilestones} onClaim={claimVocabReward} user={user} progressColorClass="from-blue-400 to-purple-500" completedText="Max level reached!" />
                                <MilestoneProgress title="Daily Missions" iconSrc={dashboardAssets.dailyMissionsIcon} milestones={GOAL_MILESTONES} currentProgress={wordsLearnedToday} masteryCount={userProgress.masteryCount} claimedMilestones={userProgress.claimedDailyGoals} onClaim={claimDailyReward} user={user} progressColorClass="from-green-400 to-blue-500" completedText="All missions completed!" />
                            </div>
                            <div className="mb-6"><ActivityCalendar activityData={dailyActivityData} /></div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                
                                <VocabularyGrowthChart data={vocabularyGrowth} />
                                <StudyActivityChart data={learningActivity} />

                                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                                    <div className="mb-4">
                                        {/* Sử dụng component tiêu đề mới */}
                                        <StyledSectionTitle title="Vocabulary Mastery Analysis" />
                                    </div>
                                    {sortedWordMastery.length > 0 ? (<>
                                        <div className="overflow-x-auto"><table className="w-full text-sm text-gray-600 table-fixed"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3 text-center">Vocabulary</th><th scope="col" className="px-4 py-3 cursor-pointer w-28 text-center" onClick={() => handleSort('mastery')}>Score</th><th scope="col" className="px-4 py-3 cursor-pointer w-28 text-center" onClick={() => handleSort('lastPracticed')}>Latest</th></tr></thead>
                                            <tbody>{paginatedMasteryData.map(({ word, mastery, lastPracticed }) => (
                                                <tr key={word} className="bg-white border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900 capitalize whitespace-nowrap">{word}</td><td className="px-4 py-3 text-center"><div className="inline-flex items-center gap-2"><span className="font-bold w-4 text-center">{mastery}</span><div className="w-12 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(mastery / 10, 1) * 100}%` }}></div></div></div></td><td className="px-4 py-3 text-right">{lastPracticed.toLocaleDateString('vi-VN')}</td></tr>
                                            ))}</tbody></table></div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon /><span className="ml-1">Previous</span></button>
                                                <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><span className="mr-1">Next</span><ChevronRightIcon /></button>
                                            </div>
                                        )}
                                    </>) : (<p className="text-center text-gray-500 py-4">No mastery data available.</p>)}
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2 xl:col-span-3">
                                     <div className="mb-4">
                                        {/* Sử dụng component tiêu đề mới */}
                                        <StyledSectionTitle title="Recent Activity" />
                                     </div>
                                     {analysisData.recentCompletions.length > 0 ? (<ul className="space-y-3">{analysisData.recentCompletions.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><span className="font-medium text-gray-700 capitalize">{item.word}</span><span className="text-sm text-gray-500">{item.date}</span></li>
                                     ))}</ul>) : (<p className="text-center text-gray-500 py-4">Không có hoạt động nào gần đây.</p>)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    </div>
  );
}

export default function AnalysisDashboard({ onGoBack }: AnalysisDashboardProps) {
  return (
    <AnalysisDashboardProvider>
      <DashboardContent onGoBack={onGoBack} />
      <style jsx>{`
        .font-lilita { font-family: 'Lilita One', cursive; }
      `}</style>
    </AnalysisDashboardProvider>
  );
}
