// --- START OF FILE workout.tsx ---

import React, { useState, useMemo } from 'react';

// --- SVG Icons (No lucide-react) ---
const DumbbellIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6M18 6l-6 6M6 18l6-6"/><path d="M12 22a7 7 0 0 0 7-7"/><path d="M12 2a7 7 0 0 0-7 7"/></svg>
);
const PlusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Trash2Icon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const TrendingUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const HistoryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
const BookOpenIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const CheckSquareIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- SVG Icons for Exercises ---
const SquatIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="20" r="10" fill="currentColor"/><rect x="45" y="30" width="10" height="30" rx="5" fill="currentColor"/><path d="M 40 55 L 30 90 L 40 90 L 45 65 Z" fill="currentColor"/><path d="M 60 55 L 70 90 L 60 90 L 55 65 Z" fill="currentColor"/><rect x="20" y="45" width="60" height="8" rx="4" fill="currentColor"/></svg>
);
const BenchPressIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="20" y="70" width="60" height="10" rx="5" fill="currentColor"/><circle cx="50" cy="35" r="10" fill="currentColor"/><path d="M 50 45 L 30 60 L 70 60 Z" fill="currentColor"/><rect x="10" y="28" width="80" height="8" rx="4" fill="currentColor"/><rect x="5" y="24" width="5" height="16" fill="currentColor"/><rect x="90" y="24" width="5" height="16" fill="currentColor"/></svg>
);
const WristCurlIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M 20 50 L 70 50 C 80 50, 80 65, 70 65 L 20 65 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /><rect x="70" y="40" width="10" height="30" rx="5" fill="currentColor" /><rect x="85" y="46" width="5" height="18" fill="currentColor" /></svg>
);
const DeadliftIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="35" r="8" fill="currentColor"/><path d="M 50 43 L 50 60 L 40 75 L 35 73 L 45 58" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><path d="M 50 43 L 50 60 L 60 75 L 65 73 L 55 58" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><path d="M 45 80 L 40 90" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><path d="M 55 80 L 60 90" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><rect x="10" y="88" width="80" height="7" rx="3" fill="currentColor"/><rect x="5" y="80" width="5" height="15" fill="currentColor"/><rect x="90" y="80" width="5" height="15" fill="currentColor"/></svg>
);


// --- Initial Data ---
const initialExercises = [
    { id: 1, name: 'Bench Press', category: 'Chest', icon: <BenchPressIcon /> },
    { id: 2, name: 'Squat', category: 'Legs', icon: <SquatIcon /> },
    { id: 3, name: 'Deadlift', category: 'Back', icon: <DeadliftIcon /> },
    { id: 4, name: 'Wrist Curl', category: 'Arms', icon: <WristCurlIcon /> },
];

const initialWorkoutHistory = [];

// --- Helper Functions ---
const calculateVolume = (sets) => sets.reduce((total, set) => total + (set.reps * set.weight), 0);

// --- Main Application Component ---
export default function WorkoutApp({ onClose }) {
    const [exercises, setExercises] = useState(initialExercises);
    const [workoutHistory, setWorkoutHistory] = useState(initialWorkoutHistory);
    const [myWorkoutIds, setMyWorkoutIds] = useState([2, 1]);
    const [currentView, setCurrentView] = useState('dailyTracking'); 
    
    const myWorkoutList = useMemo(() => 
        exercises.filter(ex => myWorkoutIds.includes(ex.id)),
        [myWorkoutIds, exercises]
    );

    const handleAddToMyWorkout = (exerciseId) => {
        if (!myWorkoutIds.includes(exerciseId)) {
            setMyWorkoutIds(prev => [...prev, exerciseId]);
        }
    };
    
    const handleRemoveFromMyWorkout = (exerciseId) => {
        setMyWorkoutIds(prev => prev.filter(id => id !== exerciseId));
    };

    const handleLogWorkout = (newWorkout) => {
        setWorkoutHistory(prev => [...prev, { ...newWorkout, id: Date.now() }]);
    };
    
    const handleDeleteWorkout = (id) => {
        setWorkoutHistory(prev => prev.filter(workout => workout.id !== id));
    };

    const renderView = () => {
        switch (currentView) {
            case 'library':
                return <LibraryWorkout exercises={exercises} myWorkoutIds={myWorkoutIds} onAdd={handleAddToMyWorkout} />;
            case 'myWorkout':
                return <MyWorkout workoutList={myWorkoutList} onRemove={handleRemoveFromMyWorkout} />;
            case 'history':
                return <WorkoutHistoryView history={workoutHistory} exercises={exercises} onDelete={handleDeleteWorkout} />;
            case 'progress':
                return <ProgressTracker history={workoutHistory} exercises={exercises} />;
            case 'dailyTracking':
            default:
                return <DailyTracking myWorkoutList={myWorkoutList} onLogWorkout={handleLogWorkout} onNavigateToLibrary={() => setCurrentView('library')} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto p-4 max-w-4xl">
                <Header onClose={onClose} />
                <main className="mt-8">
                    {renderView()}
                </main>
                <NavBar currentView={currentView} setCurrentView={setCurrentView} />
            </div>
        </div>
    );
}


// --- Sub-components ---
const Header = ({ onClose }) => (
    <header className="relative flex items-center justify-center text-center">
        <div className="flex items-center">
            <DumbbellIcon className="text-emerald-400 w-8 h-8 mr-3" />
            <div>
                <h1 className="text-3xl font-bold text-white">Workout Tracker Pro</h1>
                <p className="text-gray-400">Xây dựng. Theo dõi. Chinh phục.</p>
            </div>
        </div>
        <button 
            onClick={onClose}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close Workout Tracker"
        >
            <XIcon className="w-6 h-6" />
        </button>
    </header>
);

const NavBar = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'dailyTracking', label: 'Hôm nay', icon: CheckSquareIcon },
        { id: 'library', label: 'Thư viện', icon: BookOpenIcon },
        { id: 'myWorkout', label: 'Bài tập', icon: UserIcon },
        { id: 'history', label: 'Lịch sử', icon: HistoryIcon },
        { id: 'progress', label: 'Tiến độ', icon: TrendingUpIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-50">
            <div className="flex justify-around">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex flex-col items-center justify-center p-2 w-full text-xs ${currentView === item.id ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

// --- Custom SVG Line Chart (recharts replacement) ---
const SimpleSVGChart = ({ data, yKey, strokeColor, title }) => {
    if (data.length < 2) return null;
    const width = 300;
    const height = 150;
    const padding = 20;

    const yValues = data.map(d => d[yKey]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

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
                volume: calculateVolume(workout.sets),
                maxWeight: Math.max(...workout.sets.map(s => s.weight)),
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
                  <SimpleSVGChart data={progressData} yKey="maxWeight" strokeColor="#818CF8" title="Mức tạ nặng nhất (kg)" />
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 mt-4">Cần ít nhất 2 bản ghi để hiển thị biểu đồ tiến độ cho bài tập này.</p>
            )}
        </Card>
    );
};


// --- Other components (largely unchanged) ---
const LibraryWorkout = ({ exercises, myWorkoutIds, onAdd }) => (
    <Card>
        <h2 className="card-title"><BookOpenIcon className="mr-2"/>Thư viện bài tập</h2>
        <p className="text-gray-400 mt-1">Thêm các bài tập vào danh sách của bạn để bắt đầu theo dõi.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {exercises.map(ex => (
                <div key={ex.id} className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-between text-center">
                    <div className="text-emerald-400 w-16 h-16 mb-2">{ex.icon}</div>
                    <h3 className="font-semibold text-sm h-10 flex items-center">{ex.name}</h3>
                    <button 
                        onClick={() => onAdd(ex.id)}
                        disabled={myWorkoutIds.includes(ex.id)}
                        className="w-full mt-2 py-1 px-2 text-xs font-bold rounded transition-colors disabled:bg-emerald-700 disabled:text-emerald-300 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        {myWorkoutIds.includes(ex.id) ? 'Đã thêm' : 'Thêm'}
                    </button>
                </div>
            ))}
        </div>
    </Card>
);

const MyWorkout = ({ workoutList, onRemove }) => (
     <Card>
        <h2 className="card-title"><UserIcon className="mr-2"/>Các bài tập của tôi</h2>
        <p className="text-gray-400 mt-1">Đây là những bài tập bạn đã chọn để theo dõi.</p>
        <div className="space-y-3 mt-6">
            {workoutList.length > 0 ? workoutList.map(ex => (
                <div key={ex.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                       <div className="text-emerald-400 w-10 h-10 mr-4">{ex.icon}</div>
                       <span className="font-semibold">{ex.name}</span>
                    </div>
                    <button onClick={() => onRemove(ex.id)} className="p-2 text-gray-500 hover:text-red-500">
                        <Trash2Icon />
                    </button>
                </div>
            )) : (
                 <p className="text-center text-gray-400 py-8">Danh sách bài tập của bạn trống.</p>
            )}
        </div>
    </Card>
);

const DailyTracking = ({ myWorkoutList, onLogWorkout, onNavigateToLibrary }) => {
    const [loggingExercise, setLoggingExercise] = useState(null);
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
        <div className="pb-20 md:pb-0">
             <Card>
                <h2 className="card-title"><CheckSquareIcon className="mr-2"/>Theo dõi hàng ngày</h2>
                <p className="text-gray-400 mt-1">Chọn một bài tập bên dưới để ghi lại buổi tập hôm nay.</p>
                <div className="space-y-3 mt-6">
                    {myWorkoutList.map(ex => (
                        <button key={ex.id} onClick={() => setLoggingExercise(ex)} className="w-full bg-gray-700 rounded-lg p-3 flex items-center text-left hover:bg-gray-600 transition-colors">
                           <div className="text-emerald-400 w-10 h-10 mr-4">{ex.icon}</div>
                           <span className="font-semibold">{ex.name}</span>
                        </button>
                    ))}
                </div>
            </Card>
            {loggingExercise && (
                <LoggingModal 
                    exercise={loggingExercise} 
                    onClose={() => setLoggingExercise(null)}
                    onSubmit={(workoutData) => {
                        onLogWorkout(workoutData);
                        setLoggingExercise(null);
                    }}
                />
            )}
        </div>
    );
};

const LoggingModal = ({ exercise, onClose, onSubmit }) => {
    const [sets, setSets] = useState([{ reps: '', weight: '' }]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const handleAddSet = () => setSets([...sets, { reps: '', weight: '' }]);
    const handleRemoveSet = (index) => sets.length > 1 && setSets(sets.filter((_, i) => i !== index));
    const handleSetChange = (index, field, value) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        setSets(newSets);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const validSets = sets.filter(set => set.reps > 0 && set.weight >= 0)
                               .map(set => ({ reps: Number(set.reps), weight: Number(set.weight) }));
        if (validSets.length > 0) onSubmit({ exerciseId: exercise.id, date, sets: validSets });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">{exercise.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Ngày</label>
                        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input"/>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Các set</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {sets.map((set, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="text-gray-400 font-bold">{index + 1}</span>
                                <input type="number" placeholder="Reps" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} className="form-input w-full" min="0"/>
                                <input type="number" placeholder="Weight (kg)" value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} className="form-input w-full" min="0" step="0.5"/>
                                <button type="button" onClick={() => handleRemoveSet(index)} className="p-2 text-red-500 hover:text-red-400 disabled:opacity-50" disabled={sets.length <= 1}><Trash2Icon /></button>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={handleAddSet} className="mt-4 text-emerald-400 hover:text-emerald-300 font-semibold text-sm">+ Thêm set</button>
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Lưu buổi tập</button>
                </form>
            </div>
        </div>
    );
};

const WorkoutHistoryView = ({ history, exercises, onDelete }) => {
    const getExercise = (id) => exercises.find(ex => ex.id === id);
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="pb-20 md:pb-0">
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
                                <p className="font-bold text-white text-lg">{exercise?.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                                <p className="text-sm text-emerald-400 font-semibold mt-1">Tổng khối lượng: {calculateVolume(workout.sets)} kg</p>
                            </div>
                           </div>
                           <button onClick={() => onDelete(workout.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2Icon /></button>
                        </div>
                    </div>
                )}) : <p className="text-gray-400 text-center py-8">Chưa có lịch sử tập luyện.</p>}
            </div>
        </Card>
        </div>
    );
};

const Card = ({ children }) => (<div className="bg-gray-800 p-6 rounded-xl shadow-md">{children}</div>);

// We ensure this runs only once
if (!document.getElementById('workout-styles')) {
    const style = document.createElement('style');
    style.id = 'workout-styles';
    style.textContent = `
        .card-title { @apply text-xl font-bold text-gray-100 flex items-center; }
        .form-input { @apply w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition; }
    `;
    document.head.append(style);
}

// --- END OF FILE workout.tsx ---
