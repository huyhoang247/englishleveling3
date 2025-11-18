import React, { useState, useMemo, useEffect, useRef } from 'react';
// Import service DB local và các interfaces
import { localWorkoutDB, IWorkoutPlanItem, IWorkoutHistoryEntry, ICompletedSet } from '../local-data/local-workout-db.ts'; 
// Import danh sách bài tập
import { initialExercises } from './workout-exercises.tsx';

// --- NEW: Import Recharts ---
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import các component UI
import BackButton from '../ui/back-button.tsx'; 
import CoinDisplay from '../ui/display/coin-display.tsx';

// --- SVG Icons (No lucide-react) ---
const ExpandIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V3h4M21 7V3h-4M3 17v4h4M21 17v4h-4"/></svg>
);
const DumbbellIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6M18 6l-6 6M6 18l6-6"/><path d="M12 22a7 7 0 0 0 7-7"/><path d="M12 2a7 7 0 0 0-7 7"/></svg>
);
const PlusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const MinusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Trash2Icon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const TrendingUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const HistoryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
const BookOpenIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const CheckSquareIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const TargetIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);
const CheckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const PlayIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
// --- ICONS for Stats ---
const CalendarIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
const RepeatIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.182m-3.182-4.319a8.25 8.25 0 00-11.664 0l-3.18 3.182" /></svg>;
const FlameIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-6.867 8.268 8.268 0 013 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18Z" /></svg>;


// --- Helper Functions ---
const calculateVolume = (sets: ICompletedSet[], weight: number) => sets.reduce((total, set) => total + (set.reps * weight), 0);
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

// --- Reusable Component: NumberStepper ---
const NumberStepper = ({ label, value, onChange, min = 0, max = Infinity, step = 1, unit = '', compact = false }) => {
    const handleDecrement = () => onChange(Math.max(min, value - step));
    const handleIncrement = () => onChange(Math.min(max, value + step));
    if (compact) {
        return (
            <div className="flex items-center gap-1 bg-gray-700 rounded-md p-0.5 border border-gray-600">
                <button type="button" onClick={handleDecrement} disabled={value <= min} className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 text-emerald-400 disabled:opacity-40 flex items-center justify-center">
                    <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg text-white">{value}</span>
                <button type="button" onClick={handleIncrement} disabled={value >= max} className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 text-emerald-400 disabled:opacity-40 flex items-center justify-center">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-between">
            {label && <span className="font-semibold text-gray-200">{label}</span>}
            <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1 border border-gray-600">
                <button type="button" onClick={handleDecrement} disabled={value <= min} className="w-10 h-10 rounded-md bg-gray-700 hover:bg-gray-600 text-emerald-400 disabled:opacity-40 flex items-center justify-center">
                    <MinusIcon className="w-5 h-5" />
                </button>
                <span className="w-20 text-center font-bold text-xl text-white">{value}{unit}</span>
                <button type="button" onClick={handleIncrement} disabled={value >= max} className="w-10 h-10 rounded-md bg-gray-700 hover:bg-gray-600 text-emerald-400 disabled:opacity-40 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// --- Main Application Component ---
export default function WorkoutApp({ onClose }) {
    const [exercises] = useState(initialExercises);
    const [workoutHistory, setWorkoutHistory] = useState<IWorkoutHistoryEntry[]>([]);
    const [myWorkoutPlan, setMyWorkoutPlan] = useState<IWorkoutPlanItem[]>([]);
    const [currentView, setCurrentView] = useState('dailyTracking');
    const [configuringExercise, setConfiguringExercise] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [plan, history] = await Promise.all([
                    localWorkoutDB.getWorkoutPlan(),
                    localWorkoutDB.getWorkoutHistory()
                ]);
                setMyWorkoutPlan(plan);
                setWorkoutHistory(history);
            } catch (error) {
                console.error("Failed to load workout data from DB:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);
    
    const myWorkoutList = useMemo(() => 
        myWorkoutPlan.map(plan => {
            const exerciseDetails = exercises.find(ex => ex.id === plan.exerciseId);
            return { ...exerciseDetails, ...plan };
        }),
        [myWorkoutPlan, exercises]
    );

    const handleAddExerciseToPlan = async (settings: IWorkoutPlanItem) => {
        if (!myWorkoutPlan.some(p => p.exerciseId === settings.exerciseId)) {
            const newPlan = [...myWorkoutPlan, settings];
            setMyWorkoutPlan(newPlan);
            await localWorkoutDB.saveWorkoutPlan(newPlan);
        }
        setConfiguringExercise(null);
    };
    
    const handleRemoveFromMyWorkout = async (exerciseId: number) => {
        const newPlan = myWorkoutPlan.filter(p => p.exerciseId !== exerciseId);
        setMyWorkoutPlan(newPlan);
        await localWorkoutDB.saveWorkoutPlan(newPlan);
    };
    
    const handleSaveWorkoutLog = async (logData: IWorkoutHistoryEntry): Promise<number> => {
        const savedId = await localWorkoutDB.saveWorkoutHistoryEntry(logData);
        const newLogData = { ...logData, id: savedId };

        setWorkoutHistory(prev => {
            const existingIndex = prev.findIndex(item => item.id === savedId);
            if (existingIndex > -1) {
                const updatedHistory = [...prev];
                updatedHistory[existingIndex] = newLogData;
                return updatedHistory;
            } else {
                return [...prev, newLogData];
            }
        });
        return savedId;
    };
    
    const handleDeleteWorkout = async (id: number) => {
        await localWorkoutDB.deleteWorkoutHistoryEntry(id);
        setWorkoutHistory(prev => prev.filter(workout => workout.id !== id));
    };

    const renderView = () => {
        const myWorkoutIds = myWorkoutPlan.map(p => p.exerciseId);
        const viewProps = {
            'library': { exercises, myWorkoutIds, onConfigure: setConfiguringExercise },
            'myWorkout': { workoutList: myWorkoutList, onRemove: handleRemoveFromMyWorkout },
            'history': { history: workoutHistory, exercises, onDelete: handleDeleteWorkout },
            'progress': { history: workoutHistory },
            'dailyTracking': { myWorkoutList, onSaveLog: handleSaveWorkoutLog, onNavigateToLibrary: () => setCurrentView('library'), workoutHistory, onRemove: handleRemoveFromMyWorkout }
        };

        switch (currentView) {
            case 'library': return <LibraryWorkout {...viewProps.library} />;
            case 'myWorkout': return <MyWorkout {...viewProps.myWorkout} />;
            case 'history': return <WorkoutHistoryView {...viewProps.history} />;
            case 'progress': return <ProgressDashboard {...viewProps.progress} exercises={exercises} />;
            case 'dailyTracking': default: return <DailyTracking {...viewProps.dailyTracking} />;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-900 text-white flex items-center justify-center h-full">
                <div className="text-center">
                    <DumbbellIcon className="w-12 h-12 text-emerald-400 animate-bounce mx-auto" />
                    <p className="mt-4 text-lg font-semibold">Đang tải dữ liệu tập luyện...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white font-sans flex flex-col h-full max-w-4xl mx-auto overflow-hidden">
            <Header onClose={onClose} />
            <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4 space-y-6">
                {renderView()}
            </main>
            <NavBar currentView={currentView} setCurrentView={setCurrentView} />
            {configuringExercise && (
                <ExerciseSettingsModal exercise={configuringExercise} onClose={() => setConfiguringExercise(null)} onSubmit={handleAddExerciseToPlan} />
            )}
        </div>
    );
}

// --- Sub-components ---

const Header = ({ onClose }) => {
    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex-shrink-0">
                 <BackButton onClick={onClose} label="Thoát" title="Đóng trình theo dõi" />
            </div>
            <CoinDisplay displayedCoins={12345} isStatsFullscreen={false} />
        </header>
    );
};

const NavBar = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'dailyTracking', label: 'Hôm nay', icon: CheckSquareIcon },
        { id: 'progress', label: 'Tiến độ', icon: TrendingUpIcon },
        { id: 'history', label: 'Lịch sử', icon: HistoryIcon },
        { id: 'myWorkout', label: 'Bài tập', icon: UserIcon },
        { id: 'library', label: 'Thư viện', icon: BookOpenIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
            <div className="flex justify-around items-center px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                {navItems.map(item => {
                    const isActive = currentView === item.id;
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => setCurrentView(item.id)} 
                            className="group relative flex-1 flex flex-col items-center justify-center text-center h-14 transition-colors duration-300"
                        >
                            <div className={`absolute top-0 h-1 w-8 bg-emerald-400 rounded-full transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
                            <item.icon 
                                className={`w-6 h-6 mb-0.5 transition-colors duration-300 
                                    ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`
                                } 
                            />
                            <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 
                                ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`
                            }>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};


// --- NEW COMPONENT: StatCard ---
const StatCard = ({ icon, label, value, unit, color }) => (
    <div className="bg-gray-800 p-4 rounded-xl flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">
                {value} <span className="text-lg font-medium text-gray-300">{unit}</span>
            </p>
        </div>
    </div>
);

// --- NEW COMPONENT: ActivityCalendar (Inspired by analysis-ui.tsx) ---
const ActivityCalendar = ({ history }) => {
    const activityData = useMemo(() => new Set(history.map(h => h.date)), [history]);

    const calendarDays = useMemo(() => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 34); // ~5 weeks
        
        const dayOfWeek = startDate.getDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - offset);
        
        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateString = formatDate(date);
            const hasActivity = activityData.has(dateString);
            const isToday = formatDate(today) === dateString;
            
            days.push({
                date,
                dateString,
                dayOfMonth: date.getDate(),
                hasActivity,
                isToday,
                isFuture: date > today
            });
        }
        return days;
    }, [activityData]);

    const weekDayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <div className="bg-gray-800 p-4 sm:p-5 rounded-xl">
            <h3 className="card-title mb-4"><CalendarIcon className="w-6 h-6 mr-2 text-emerald-400"/>Lịch hoạt động</h3>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {weekDayHeaders.map(day => <div key={day} className="text-xs font-semibold text-gray-400 mb-1">{day}</div>)}
                {calendarDays.map((day, index) => {
                    let dayClass = "w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors duration-200 ";
                    if (day.isFuture) {
                        dayClass += "bg-gray-700/50 text-gray-600";
                    } else if (day.hasActivity) {
                        dayClass += "bg-emerald-500 text-white";
                    } else {
                        dayClass += "bg-gray-700 text-gray-400";
                    }
                    if (day.isToday) {
                        dayClass += " ring-2 ring-offset-2 ring-offset-gray-800 ring-emerald-400";
                    }
                    return (
                        <div key={index} title={day.date.toLocaleDateString('vi-VN')} className={dayClass}>
                            {day.dayOfMonth}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- UPDATED: ProgressChart now more generic ---
const ProgressChart = ({ data, title, charts, yAxisFormatter = (value) => value }) => (
    <div className="mt-4 bg-gray-800 p-4 rounded-xl">
        <h4 className="text-center font-semibold text-gray-200 mb-4">{title}</h4>
        <div className="w-full h-64">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tickFormatter={(tick) => new Date(tick).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}/>
                    <YAxis yAxisId="left" stroke="#A0AEC0" fontSize={12} tickFormatter={yAxisFormatter} />
                    {charts.some(c => c.yAxisId === 'right') && <YAxis yAxisId="right" orientation="right" stroke="#A0AEC0" fontSize={12} />}
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4A5568' }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                        formatter={(value, name, props) => props.payload.yAxisId === 'left' && yAxisFormatter ? [yAxisFormatter(value), name] : [value, name] }
                    />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    {charts.map(chart => (
                        <Line key={chart.key} yAxisId={chart.yAxisId} type="monotone" dataKey={chart.key} name={chart.name} stroke={chart.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


// --- REVAMPED: ProgressDashboard with new stats ---
const ProgressDashboard = ({ history, exercises }) => {
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

    const dashboardStats = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0,0,0,0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const workoutsThisWeek = history.filter(h => new Date(h.date) >= startOfWeek);
        const workoutsThisMonth = history.filter(h => new Date(h.date) >= startOfMonth);

        const totalRepsThisMonth = workoutsThisMonth.reduce((sum, workout) => sum + workout.sets.reduce((repSum, set) => repSum + set.reps, 0), 0);
        
        // Calculate workout streak
        const uniqueDates = [...new Set(history.map(h => h.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let currentStreak = 0;
        if (uniqueDates.length > 0) {
            const todayDate = new Date(); todayDate.setHours(0,0,0,0);
            const mostRecentDate = new Date(uniqueDates[0]); mostRecentDate.setHours(0,0,0,0);

            // Streak is valid if last workout was today or yesterday
            if (todayDate.getTime() - mostRecentDate.getTime() <= 24 * 60 * 60 * 1000) {
                currentStreak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const current = new Date(uniqueDates[i]);
                    const previous = new Date(uniqueDates[i+1]);
                    const diffDays = (current.getTime() - previous.getTime()) / (1000 * 3600 * 24);
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break; // Streak is broken
                    }
                }
            }
        }

        return {
            totalRepsThisMonth,
            workoutsThisWeekCount: new Set(workoutsThisWeek.map(w => w.date)).size,
            currentStreak
        };
    }, [history]);

    const workoutableExercises = useMemo(() => {
        const exercisedIds = new Set(history.map(h => h.exerciseId));
        return exercises.filter(e => exercisedIds.has(e.id));
    }, [history, exercises]);

    const chartData = useMemo(() => {
        if (!selectedExerciseId) return [];
        return history
            .filter(workout => workout.exerciseId === selectedExerciseId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(workout => ({
                date: workout.date,
                totalReps: workout.sets.reduce((sum, set) => sum + set.reps, 0),
                totalSets: workout.sets.length,
                totalTime: workout.sets.reduce((sum, set) => sum + (set.duration || 0) + (set.rest || 0), 0)
            }));
    }, [history, selectedExerciseId]);

    const selectedExercise = exercises.find(e => e.id === selectedExerciseId);

    return (
        <div className="space-y-6">
            <h2 className="card-title"><TrendingUpIcon className="mr-2"/>Bảng điều khiển Tiến độ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<RepeatIcon className="w-6 h-6"/>} label="Reps tháng này" value={dashboardStats.totalRepsThisMonth.toLocaleString()} unit="reps" color="bg-indigo-500" />
                <StatCard icon={<DumbbellIcon className="w-6 h-6"/>} label="Buổi tập/tuần" value={dashboardStats.workoutsThisWeekCount} unit="" color="bg-emerald-500" />
                <StatCard icon={<FlameIcon className="w-6 h-6"/>} label="Chuỗi luyện tập" value={dashboardStats.currentStreak} unit="ngày" color="bg-rose-500" />
            </div>

            <ActivityCalendar history={history} />
            
            <div className="bg-gray-800 p-4 sm:p-5 rounded-xl">
                 <h3 className="card-title mb-4">Tiến độ theo bài tập</h3>
                 <p className="text-sm text-gray-400 mb-4">Chọn một bài tập bên dưới để xem biểu đồ chi tiết.</p>
                 <div className="flex flex-wrap gap-2">
                     {workoutableExercises.map(ex => (
                         <button 
                            key={ex.id}
                            onClick={() => setSelectedExerciseId(ex.id)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${selectedExerciseId === ex.id ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                         >
                            {ex.name}
                         </button>
                     ))}
                 </div>

                 {selectedExerciseId && (
                    chartData.length > 1 
                    ? (
                        <>
                            <ProgressChart 
                                data={chartData} 
                                title={`Hiệu suất: ${selectedExercise?.name}`}
                                charts={[
                                    { key: 'totalReps', name: 'Tổng Reps', color: '#34D399', yAxisId: 'left' },
                                    { key: 'totalSets', name: 'Tổng Sets', color: '#818CF8', yAxisId: 'right' }
                                ]}
                            />
                            <ProgressChart 
                                data={chartData} 
                                title={`Thời gian: ${selectedExercise?.name}`}
                                charts={[
                                    { key: 'totalTime', name: 'Tổng Thời Gian', color: '#F472B6', yAxisId: 'left' }
                                ]}
                                yAxisFormatter={(seconds) => formatTime(seconds)}
                            />
                        </>
                    )
                    : <p className="text-gray-400 text-center py-8 mt-4">Cần ít nhất 2 bản ghi để hiển thị biểu đồ cho bài tập này.</p>
                 )}
            </div>
        </div>
    );
};

// ... (Rest of the components: ImageDetailModal, ExerciseSettingsModal, etc. remain unchanged) ...
const ImageDetailModal = ({ exercise, onClose }) => {
    if (!exercise) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="relative bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white z-10" aria-label="Close image viewer">
                    <XIcon className="w-8 h-8"/>
                </button>
                <h3 className="text-2xl font-bold text-center mb-4 text-white">{exercise.name}</h3>
                <div className="w-full aspect-square text-white">
                    {exercise.icon}
                </div>
            </div>
        </div>
    );
};

const ExerciseSettingsModal = ({ exercise, onClose, onSubmit }) => {
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [weight, setWeight] = useState(20);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ exerciseId: exercise.id, sets, reps, weight });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Cài đặt: {exercise.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <NumberStepper label="Số set" value={sets} onChange={setSets} min={1} />
                        <NumberStepper label="Số rep mỗi set" value={reps} onChange={setReps} min={1} step={5}/>
                        <NumberStepper label="Mức tạ mục tiêu" value={weight} onChange={setWeight} min={0} step={2.5} unit="kg" />
                    </div>
                    <div className="bg-gray-700/50 p-4 text-right">
                         <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Thêm vào bài tập của tôi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LibraryWorkout = ({ exercises, myWorkoutIds, onConfigure }) => {
    const [viewingExercise, setViewingExercise] = useState(null);
    return (
        <>
            <Card>
                <h2 className="card-title"><BookOpenIcon className="mr-2"/>Thư viện bài tập</h2>
                <p className="text-gray-400 mt-1">Thêm các bài tập vào danh sách của bạn để bắt đầu theo dõi.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {exercises.map(ex => (
                        <div key={ex.id} className="relative bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-between text-center">
                            <button onClick={() => setViewingExercise(ex)} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white transition-colors z-10" aria-label={`View details for ${ex.name}`}>
                                <ExpandIcon className="w-5 h-5" />
                            </button>
                            <div className="text-emerald-400 w-16 h-16 mb-2">{ex.icon}</div>
                            <h3 className="font-semibold text-sm h-10 flex items-center justify-center">{ex.name}</h3>
                            <button onClick={() => onConfigure(ex)} disabled={myWorkoutIds.includes(ex.id)} className="w-full mt-2 py-1 px-2 text-xs font-bold rounded transition-colors disabled:bg-emerald-700 disabled:text-emerald-300 bg-emerald-500 hover:bg-emerald-600 text-white">
                                {myWorkoutIds.includes(ex.id) ? 'Đã thêm' : 'Thêm'}
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
            <ImageDetailModal exercise={viewingExercise} onClose={() => setViewingExercise(null)} />
        </>
    );
};

const MyWorkout = ({ workoutList, onRemove }) => (
     <Card>
        <h2 className="card-title"><UserIcon className="mr-2"/>Các bài tập của tôi</h2>
        <p className="text-gray-400 mt-1">Đây là những bài tập bạn đã chọn để theo dõi và kế hoạch của bạn.</p>
        <div className="space-y-3 mt-6">
            {workoutList.length > 0 ? workoutList.map(ex => (
                <div key={ex.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                       <div className="text-emerald-400 w-10 h-10 mr-4">{ex.icon}</div>
                       <div>
                            <span className="font-semibold">{ex.name}</span>
                            <p className="text-xs text-gray-400">{ex.sets} sets x {ex.reps} reps @ {ex.weight}kg</p>
                       </div>
                    </div>
                    <button onClick={() => onRemove(ex.exerciseId)} className="p-2 text-gray-500 hover:text-red-500">
                        <Trash2Icon />
                    </button>
                </div>
            )) : (
                 <p className="text-center text-gray-400 py-8">Danh sách bài tập của bạn trống.</p>
            )}
        </div>
    </Card>
);

const DailyTracking = ({ myWorkoutList, onSaveLog, onNavigateToLibrary, workoutHistory, onRemove }) => {
    const [loggingExercise, setLoggingExercise] = useState(null);
    const [viewingExercise, setViewingExercise] = useState(null);

    const findLastWorkout = (exerciseId) => {
        return workoutHistory.filter(w => w.exerciseId === exerciseId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    };
    
    const findTodaysWorkout = (exerciseId) => {
        const todayStr = formatDate(new Date());
        return workoutHistory.find(w => w.exerciseId === exerciseId && w.date === todayStr);
    };

    if (myWorkoutList.length === 0) { 
        return ( 
            <Card>
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold mb-2">Chào mừng bạn!</h2>
                    <p className="text-gray-400 mb-6">Bạn chưa có bài tập nào. Hãy bắt đầu bằng cách thêm một vài bài tập từ thư viện.</p>
                    <button onClick={onNavigateToLibrary} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center transition duration-300 mx-auto">
                        Đến thư viện
                    </button>
                </div>
            </Card> 
        ); 
    }
    
    return (
        <>
            <Card>
                <h2 className="card-title"><CheckSquareIcon className="mr-2"/>Theo dõi hàng ngày</h2>
                <p className="text-gray-400 mt-1">Chọn một bài tập để ghi lại buổi tập hôm nay và xem tiến độ.</p>
                <div className="space-y-4 mt-6">
                    {myWorkoutList.map(ex => {
                        const lastWorkout = findLastWorkout(ex.exerciseId);
                        const lastVolume = lastWorkout ? calculateVolume(lastWorkout.sets, lastWorkout.weight) : 0;
                        const lastWeight = lastWorkout ? lastWorkout.weight : 0;
                        const todaysWorkout = findTodaysWorkout(ex.exerciseId);
                        
                        let sessionStatus: 'start' | 'continue' | 'completed' = 'start';
                        if (todaysWorkout) {
                            if (todaysWorkout.sets.length >= ex.sets) {
                                sessionStatus = 'completed';
                            } else {
                                sessionStatus = 'continue';
                            }
                        }

                        return (
                            <div key={ex.exerciseId} className="bg-gray-700 rounded-lg p-6 relative hover:bg-gray-600 transition-colors">
                                <button onClick={() => setViewingExercise(ex)} className="absolute top-2 left-2 p-1 text-gray-400 hover:text-white transition-colors z-10" aria-label={`Xem chi tiết ${ex.name}`}>
                                    <ExpandIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onRemove(ex.exerciseId)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 transition-colors z-10" aria-label={`Xóa ${ex.name} khỏi kế hoạch`}>
                                    <Trash2Icon className="w-5 h-5" />
                                </button>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                       <div className="text-emerald-400 w-12 h-12 mr-4 flex-shrink-0">{ex.icon}</div>
                                       <div>
                                            <p className="font-bold text-lg">{ex.name}</p>
                                            <div className="flex flex-col items-start gap-y-1 text-xs text-gray-300 mt-1">
                                                <span className="flex items-center"><TargetIcon className="w-3 h-3 mr-1.5"/>{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                                            </div>
                                       </div>
                                    </div>
                                    
                                    {sessionStatus === 'completed' ? (
                                        <div className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg text-sm ml-2 flex items-center">
                                            <CheckIcon className="w-4 h-4 mr-2"/>
                                            Hoàn thành
                                        </div>
                                    ) : (
                                        <button onClick={() => setLoggingExercise({ ...ex, todaysWorkout })} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg text-sm ml-2 flex-shrink-0">
                                            {sessionStatus === 'continue' ? 'Tiếp tục' : 'Bắt đầu'}
                                        </button>
                                    )}
                                </div>
                                {lastWorkout && (
                                    <div className="mt-4 pt-3 border-t border-gray-600 text-xs text-gray-400 flex flex-wrap justify-around gap-x-4 gap-y-1">
                                        <p><strong className="text-gray-200">Lần trước:</strong> {new Date(lastWorkout.date).toLocaleDateString()}</p>
                                        <p><strong className="text-gray-200">Tổng KL:</strong> {lastVolume} kg</p>
                                        <p><strong className="text-gray-200">Mức tạ:</strong> {lastWeight} kg</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
            <ImageDetailModal exercise={viewingExercise} onClose={() => setViewingExercise(null)} />
            {loggingExercise && (
                <LoggingModal 
                    exercise={loggingExercise} 
                    existingLog={loggingExercise.todaysWorkout} 
                    onClose={() => setLoggingExercise(null)} 
                    onSave={onSaveLog} 
                />
            )}
        </>
    );
};

const REST_TIME_SECONDS = 90; // Thời gian nghỉ mục tiêu

// --- NEW: Post-Workout Summary component ---
const WorkoutSummary = ({ summary }) => (
    <div className="text-center p-6">
        <CheckIcon className="w-16 h-16 text-emerald-400 mx-auto" />
        <h3 className="text-2xl font-bold mt-4">Tổng kết buổi tập</h3>
        <p className="text-gray-400 mb-6">Làm tốt lắm!</p>
        <div className="grid grid-cols-2 gap-4 text-left bg-gray-700/50 p-4 rounded-lg">
            <div className="font-semibold text-gray-300">Tổng Khối Lượng:</div>
            <div className="font-bold text-white text-right">{summary.totalVolume.toLocaleString()} kg</div>
            
            <div className="font-semibold text-gray-300">Tổng Số Reps:</div>
            <div className="font-bold text-white text-right">{summary.totalReps}</div>
            
            <div className="font-semibold text-gray-300">Số Sets:</div>
            <div className="font-bold text-white text-right">{summary.totalSets}</div>
            
            <div className="font-semibold text-gray-300">Thời Gian Tập:</div>
            <div className="font-bold text-white text-right">{formatTime(summary.totalDuration)}</div>

            <div className="font-semibold text-gray-300">Thời Gian Nghỉ:</div>
            <div className="font-bold text-white text-right">{formatTime(summary.totalRest)}</div>
            
            <div className="font-semibold text-gray-300">Tổng Thời Gian:</div>
            <div className="font-bold text-white text-right">{formatTime(summary.totalDuration + summary.totalRest)}</div>
        </div>
    </div>
);

const LoggingModal = ({ exercise, existingLog, onClose, onSave }) => {
    const [sessionState, setSessionState] = useState<'setup' | 'training' | 'resting' | 'finished'>('setup');
    const [sessionConfig, setSessionConfig] = useState({
        sets: existingLog?.sets?.length || exercise.sets,
        reps: exercise.reps,
        weight: existingLog?.weight || exercise.weight,
    });
    const [loggedSets, setLoggedSets] = useState<ICompletedSet[]>(existingLog?.sets || []);
    const [currentSetReps, setCurrentSetReps] = useState(exercise.reps);
    
    const [trainingTimer, setTrainingTimer] = useState(0);
    const [elapsedRestTime, setElapsedRestTime] = useState(0);
    const [workoutSummary, setWorkoutSummary] = useState(null); // State for summary
    const intervalRef = useRef<number | null>(null);

    const currentSetIndex = loggedSets.length;
    const isLastSet = currentSetIndex === sessionConfig.sets - 1;

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const startTrainingTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTrainingTimer(0);
        intervalRef.current = window.setInterval(() => setTrainingTimer(prev => prev + 1), 1000);
    };

    const startRestTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setElapsedRestTime(0);
        intervalRef.current = window.setInterval(() => setElapsedRestTime(prev => prev + 1), 1000);
    };
    
    const stopTimers = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const handleStartWorkout = () => {
        if (loggedSets.length > 0 && loggedSets.length < sessionConfig.sets) {
             setSessionState('resting');
             startRestTimer();
        } else {
             setSessionState('training');
             startTrainingTimer();
        }
    };

    const handleCompleteSet = async () => {
        stopTimers();
        const newSet: ICompletedSet = { reps: currentSetReps, duration: trainingTimer, rest: 0 };
        const updatedLoggedSets = [...loggedSets, newSet];
        setLoggedSets(updatedLoggedSets);
        
        await autoSave(updatedLoggedSets);

        if (isLastSet) {
            // --- NEW: Calculate summary on finish ---
            const finalSets = updatedLoggedSets;
            const summary = {
                totalVolume: calculateVolume(finalSets, sessionConfig.weight),
                totalReps: finalSets.reduce((sum, set) => sum + set.reps, 0),
                totalSets: finalSets.length,
                totalDuration: finalSets.reduce((sum, set) => sum + set.duration, 0),
                totalRest: finalSets.reduce((sum, set) => sum + set.rest, 0),
            };
            setWorkoutSummary(summary);
            setSessionState('finished');
        } else {
            setSessionState('resting');
            startRestTimer();
        }
    };
    
    const handleNextSet = async () => {
        stopTimers();
        const restDuration = elapsedRestTime;
        const updatedLoggedSets = [...loggedSets];
        if (updatedLoggedSets.length > 0) {
            updatedLoggedSets[updatedLoggedSets.length - 1].rest = restDuration;
        }
        setLoggedSets(updatedLoggedSets);

        await autoSave(updatedLoggedSets);
        
        setCurrentSetReps(sessionConfig.reps);
        setSessionState('training');
        startTrainingTimer();
    };

    const autoSave = async (currentSets: ICompletedSet[]) => {
        const logData: IWorkoutHistoryEntry = {
            id: existingLog?.id,
            exerciseId: exercise.id,
            date: formatDate(new Date()),
            weight: sessionConfig.weight,
            sets: currentSets
        };
        try {
            await onSave(logData);
        } catch (error) {
            console.error("Auto-save failed:", error);
        }
    };
    
    const renderContent = () => {
        if (sessionState === 'finished') {
            return (
                <div>
                    {workoutSummary && <WorkoutSummary summary={workoutSummary} />}
                    <div className="p-4 bg-gray-700/50">
                        <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            Đóng
                        </button>
                    </div>
                </div>
            );
        }

        if (sessionState === 'training' || sessionState === 'resting') {
            const isResting = sessionState === 'resting';
            const restProgress = Math.min(1, elapsedRestTime / REST_TIME_SECONDS);

            return (
                 <div className="p-6 flex flex-col items-center">
                    <div className="w-full text-center mb-4">
                        <p className="text-lg text-gray-400">Set {currentSetIndex + 1} / {sessionConfig.sets}</p>
                        <p className="font-bold text-2xl text-white">{sessionConfig.weight} kg</p>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center my-4">
                        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            {isResting && (
                                <circle className="text-emerald-400" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"
                                    strokeDasharray={2 * Math.PI * 45}
                                    strokeDashoffset={2 * Math.PI * 45 * (1 - restProgress)}
                                    style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                                    transform="rotate(-90 50 50)"
                                />
                            )}
                        </svg>
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                                {isResting ? 'NGHỈ' : 'TẬP'}
                            </p>
                            <p className="text-5xl font-mono font-bold text-white">
                                {isResting ? formatTime(elapsedRestTime) : formatTime(trainingTimer)}
                            </p>
                            {isResting && (
                                <p className="text-base text-gray-400 mt-1">
                                    Mục tiêu: {formatTime(REST_TIME_SECONDS)}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {!isResting && (
                        <div className="w-full my-4">
                            <NumberStepper label="Reps đã thực hiện" value={currentSetReps} onChange={setCurrentSetReps} min={0} />
                        </div>
                    )}

                    <div className="w-full mt-6">
                        {sessionState === 'training' && (
                           <button onClick={handleCompleteSet} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg">
                               {isLastSet ? 'Hoàn thành Buổi tập' : 'Hoàn thành Set'}
                           </button>
                        )}
                        {sessionState === 'resting' && (
                           <button onClick={handleNextSet} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg">
                               Bắt đầu Set tiếp theo
                           </button>
                        )}
                    </div>
                </div>
            );
        }

        // Setup State
        return (
            <div>
                <div className="p-6 space-y-6">
                    <p className="text-gray-400 text-sm">Chỉnh sửa thông số cho buổi tập hôm nay trước khi bắt đầu.</p>
                    <NumberStepper label="Số set" value={sessionConfig.sets} onChange={(v) => setSessionConfig(c => ({...c, sets:v}))} min={1} />
                    <NumberStepper label="Số rep mục tiêu" value={sessionConfig.reps} onChange={(v) => setSessionConfig(c => ({...c, reps:v}))} min={1} />
                    <NumberStepper label="Mức tạ" value={sessionConfig.weight} onChange={(v) => setSessionConfig(c => ({...c, weight:v}))} min={0} step={2.5} unit="kg" />
                </div>
                <div className="p-4 bg-gray-700/50">
                    <button onClick={handleStartWorkout} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-lg">
                        <PlayIcon className="w-5 h-5 mr-2" />
                        {loggedSets.length > 0 ? 'Tiếp tục Luyện tập' : 'Bắt đầu Luyện tập'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                     <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon/></button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};


const WorkoutHistoryView = ({ history, exercises, onDelete }) => {
    const getExercise = (id) => exercises.find(ex => ex.id === id);
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
        <Card>
            <h2 className="card-title"><HistoryIcon className="mr-2"/>Lịch sử tập luyện</h2>
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                {sortedHistory.length > 0 ? sortedHistory.map(workout => {
                    const exercise = getExercise(workout.exerciseId);
                    return (
                        <div key={workout.id} className="bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                               <div className="flex items-center">
                                {exercise && <div className="text-emerald-400 w-12 h-12 mr-4 flex-shrink-0">{exercise.icon}</div>}
                                <div>
                                    <p className="font-bold text-white text-lg">{exercise?.name || 'Unknown'} @ {workout.weight}kg</p>
                                    <p className="text-sm text-gray-400">{new Date(workout.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-sm text-emerald-400 font-semibold mt-1">Tổng khối lượng: {calculateVolume(workout.sets, workout.weight).toLocaleString()} kg</p>
                                </div>
                               </div>
                               <button onClick={() => onDelete(workout.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2Icon /></button>
                            </div>
                        </div>
                    );
                }) : <p className="text-gray-400 text-center py-8">Chưa có lịch sử tập luyện.</p>}
            </div>
        </Card>
    );
};

const Card = ({ children }) => (<div className="bg-gray-800 p-6 rounded-xl shadow-md">{children}</div>);

if (!document.getElementById('workout-styles')) {
    const style = document.createElement('style');
    style.id = 'workout-styles';
    style.textContent = `
        .card-title { @apply text-xl font-bold text-gray-100 flex items-center; }
        .form-input { @apply w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition; }
    `;
    document.head.append(style);
}
