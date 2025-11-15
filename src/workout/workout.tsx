import React, { useState, useMemo, useEffect, useRef } from 'react';
// Import service DB local và các interfaces
import { localWorkoutDB, IWorkoutPlanItem, IWorkoutHistoryEntry, ICompletedSet } from './local-data/local-workout-db.ts'; 
// Import danh sách bài tập
import { initialExercises } from './workout-exercises.tsx';

// Import các component UI
import BackButton from './ui/back-button.tsx'; 
import CoinDisplay from './ui/display/coin-display.tsx';

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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

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

// --- Helper Functions ---
const calculateVolume = (sets: ICompletedSet[], weight: number) => sets.reduce((total, set) => total + (set.reps * weight), 0);

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
            'progress': { history: workoutHistory, exercises },
            'dailyTracking': { myWorkoutList, onSaveLog: handleSaveWorkoutLog, onNavigateToLibrary: () => setCurrentView('library'), workoutHistory, onRemove: handleRemoveFromMyWorkout }
        };

        switch (currentView) {
            case 'library': return <LibraryWorkout {...viewProps.library} />;
            case 'myWorkout': return <MyWorkout {...viewProps.myWorkout} />;
            case 'history': return <WorkoutHistoryView {...viewProps.history} />;
            case 'progress': return <ProgressTracker {...viewProps.progress} />;
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
            <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
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
        { id: 'library', label: 'Thư viện', icon: BookOpenIcon },
        { id: 'myWorkout', label: 'Bài tập', icon: UserIcon },
        { id: 'history', label: 'Lịch sử', icon: HistoryIcon },
        { id: 'progress', label: 'Tiến độ', icon: TrendingUpIcon },
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

const SimpleSVGChart = ({ data, yKey, strokeColor, title }) => {
    if (data.length < 2) return null;
    const width = 300; const height = 150; const padding = 20;
    const yValues = data.map(d => d[yKey]);
    const minY = Math.min(...yValues); const maxY = Math.max(...yValues);
    const getCoords = (y, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const yCoord = height - padding - ((y - minY) / (maxY - minY + 1e-9)) * (height - padding * 2);
        return { x, y: yCoord };
    };
    const path = data.map((d, i) => {
        const { x, y } = getCoords(d[yKey], i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return (
        <div className="mt-4">
            <h4 className="text-center font-semibold text-gray-300 mb-2">{title}</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <text x={padding-15} y={padding} dy="0.3em" fill="#9CA3AF" fontSize="10">{maxY.toFixed(0)}</text>
                <text x={padding-15} y={height - padding} dy="0.3em" fill="#9CA3AF" fontSize="10">{minY.toFixed(0)}</text>
                <path d={path} fill="none" stroke={strokeColor} strokeWidth="2" />
                {data.map((d, i) => {
                    const {x, y} = getCoords(d[yKey], i);
                    return <circle key={i} cx={x} cy={y} r="3" fill={strokeColor} />
                })}
            </svg>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-4">
                <span>{data[0]?.date}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    )
};

const ProgressTracker = ({ history, exercises }) => {
    const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id || '');
    const progressData = useMemo(() => {
        if (!selectedExerciseId) return [];
        return history
            .filter(workout => workout.exerciseId === parseInt(selectedExerciseId))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(workout => ({
                date: new Date(workout.date).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'}),
                volume: calculateVolume(workout.sets, workout.weight),
                maxWeight: workout.weight,
            }));
    }, [history, selectedExerciseId]);
    const selectedExerciseName = exercises.find(e => e.id === parseInt(selectedExerciseId))?.name || 'Exercise';

    return (
        <Card>
            <h2 className="card-title"><TrendingUpIcon className="mr-2"/>Theo dõi tiến độ</h2>
            <div className="mt-4">
                <label htmlFor="progress-exercise" className="block text-sm font-medium text-gray-300 mb-1">Chọn bài tập</label>
                <select id="progress-exercise" value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className="form-input">
                    {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
            </div>
            {progressData.length > 1 ? (
              <div className="mt-6">
                  <h3 className="text-lg font-semibold text-center mb-2 text-emerald-400">{selectedExerciseName} - Tiến độ</h3>
                  <SimpleSVGChart data={progressData} yKey="volume" strokeColor="#34D399" title="Tổng khối lượng (kg)" />
                  <SimpleSVGChart data={progressData} yKey="maxWeight" strokeColor="#818CF8" title="Mức tạ (kg)" />
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 mt-4">Cần ít nhất 2 bản ghi để hiển thị biểu đồ tiến độ cho bài tập này.</p>
            )}
        </Card>
    );
};

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
        return workoutHistory.filter(w => w.exerciseId === exerciseId).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    };
    
    const findTodaysWorkout = (exerciseId) => {
        const todayStr = new Date().toISOString().split('T')[0];
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
                    onClose={() => {
                        setLoggingExercise(null);
                        const updatedLog = findTodaysWorkout(loggingExercise.exerciseId);
                        if (updatedLog) {
                           handleSaveWorkoutLog(updatedLog);
                        }
                    }} 
                    onSave={onSaveLog} 
                />
            )}
        </>
    );
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const REST_TIME_SECONDS = 90; // Thời gian nghỉ mục tiêu

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
        intervalRef.current = window.setInterval(() => {
            setTrainingTimer(prev => prev + 1);
        }, 1000);
    };

    const startRestTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setElapsedRestTime(0);
        intervalRef.current = window.setInterval(() => {
            setElapsedRestTime(prev => prev + 1);
        }, 1000);
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
        const newSet: ICompletedSet = {
            reps: currentSetReps,
            duration: trainingTimer,
            rest: 0,
        };
        const updatedLoggedSets = [...loggedSets, newSet];
        setLoggedSets(updatedLoggedSets);
        
        await autoSave(updatedLoggedSets);

        if (isLastSet) {
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
            date: new Date().toISOString().split('T')[0],
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
        if (sessionState === 'training' || sessionState === 'resting' || sessionState === 'finished') {
            const isResting = sessionState === 'resting';
            const restProgress = Math.min(1, elapsedRestTime / REST_TIME_SECONDS);

            return (
                 <div className="p-6 flex flex-col items-center">
                    <div className="w-full text-center mb-4">
                        <p className="text-lg text-gray-400">Set {currentSetIndex + 1} / {sessionConfig.sets}</p>
                        <p className="font-bold text-2xl text-white">{sessionConfig.weight} kg</p>
                    </div>

                    {sessionState === 'finished' ? (
                        <div className="text-center py-10">
                            <CheckIcon className="w-20 h-20 text-emerald-400 mx-auto" />
                            <h3 className="text-3xl font-bold mt-4">Hoàn thành!</h3>
                            <p className="text-gray-300 mt-2">Buổi tập đã được lưu.</p>
                        </div>
                    ) : (
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
                    )}
                    
                    {!isResting && sessionState !== 'finished' && (
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
                         {sessionState === 'finished' && (
                           <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                               Đóng
                           </button>
                        )}
                    </div>
                </div>
            );
        }

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
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
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
                                {exercise && <div className="text-emerald-400 w-12 h-12 mr-4">{exercise.icon}</div>}
                                <div>
                                    <p className="font-bold text-white text-lg">{exercise?.name || 'Unknown'} @ {workout.weight}kg</p>
                                    <p className="text-sm text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-emerald-400 font-semibold mt-1">Tổng khối lượng: {calculateVolume(workout.sets, workout.weight)} kg</p>
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
