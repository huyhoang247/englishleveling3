import React, { useState, useEffect, useRef } from 'react';

// Component Icon cho các nút điều khiển
const PlayIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const PauseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

const ResetIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
);

// Component chính của ứng dụng
const App = () => {
    // Cài đặt thời gian (giây)
    const SETTINGS = {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
    };

    // State quản lý trạng thái ứng dụng
    const [mode, setMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
    const [time, setTime] = useState(SETTINGS.pomodoro);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);

    const audioContextRef = useRef(null);

    // Hàm tạo âm thanh bíp khi hết giờ
    const playSound = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // Tần số A4
        gainNode.gain.setValueAtTime(1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + 1);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 1);
    };

    // useEffect hook để xử lý đếm ngược
    useEffect(() => {
        let interval = null;

        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (time === 0) {
            playSound();
            setIsActive(false);
            // Tự động chuyển chế độ
            if (mode === 'pomodoro') {
                const newPomodoroCount = pomodoroCount + 1;
                setPomodoroCount(newPomodoroCount);
                if (newPomodoroCount % 4 === 0) {
                    switchMode('longBreak');
                } else {
                    switchMode('shortBreak');
                }
            } else {
                switchMode('pomodoro');
            }
        }

        return () => clearInterval(interval);
    }, [isActive, time]);
    
    // useEffect hook để cập nhật tiêu đề trang
    useEffect(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        document.title = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds} - ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    }, [time, mode]);


    // Hàm chuyển đổi chế độ
    const switchMode = (newMode) => {
        setIsActive(false);
        setMode(newMode);
        setTime(SETTINGS[newMode]);
    };

    // Hàm điều khiển bắt đầu/tạm dừng
    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    // Hàm reset thời gian
    const resetTimer = () => {
        setIsActive(false);
        setTime(SETTINGS[mode]);
    };
    
    // Tính toán cho vòng tròn tiến trình
    const totalTime = SETTINGS[mode];
    const progress = ((totalTime - time) / totalTime) * 100;
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Định dạng thời gian để hiển thị
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    };
    
    const modeColors = {
        pomodoro: 'bg-red-500 ring-red-300',
        shortBreak: 'bg-teal-500 ring-teal-300',
        longBreak: 'bg-indigo-500 ring-indigo-300',
    };
    
    const modeTextColors = {
        pomodoro: 'text-red-400',
        shortBreak: 'text-teal-400',
        longBreak: 'text-indigo-400',
    };

    const progressColors = {
        pomodoro: 'stroke-red-400',
        shortBreak: 'stroke-teal-400',
        longBreak: 'stroke-indigo-400',
    };
    
    const buttonBgColors = {
        pomodoro: 'bg-red-500 hover:bg-red-600',
        shortBreak: 'bg-teal-500 hover:bg-teal-600',
        longBreak: 'bg-indigo-500 hover:bg-indigo-600',
    };
    

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-sans transition-colors duration-500`}>
            <div className="w-full max-w-md mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-wider">Pomodoro</h1>
                    <p className="text-gray-400 mt-2">Tập trung vào công việc, nghỉ ngơi đúng lúc.</p>
                </header>

                <main className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-gray-700/50">
                    {/* Các nút chọn chế độ */}
                    <div className="flex justify-center space-x-2 md:space-x-4 mb-8">
                        <button onClick={() => switchMode('pomodoro')} className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ${mode === 'pomodoro' ? `${modeColors.pomodoro} text-white shadow-lg` : 'text-gray-400 hover:bg-gray-700'}`}>Pomodoro</button>
                        <button onClick={() => switchMode('shortBreak')} className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ${mode === 'shortBreak' ? `${modeColors.shortBreak} text-white shadow-lg` : 'text-gray-400 hover:bg-gray-700'}`}>Short Break</button>
                        <button onClick={() => switchMode('longBreak')} className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ${mode === 'longBreak' ? `${modeColors.longBreak} text-white shadow-lg` : 'text-gray-400 hover:bg-gray-700'}`}>Long Break</button>
                    </div>

                    {/* Vòng tròn thời gian */}
                    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto mb-8">
                        <svg className="w-full h-full" viewBox="0 0 300 300">
                            {/* Vòng tròn nền */}
                            <circle cx="150" cy="150" r={radius} fill="none" strokeWidth="12" className="stroke-gray-700" />
                            {/* Vòng tròn tiến trình */}
                            <circle
                                cx="150"
                                cy="150"
                                r={radius}
                                fill="none"
                                strokeWidth="12"
                                className={`transform -rotate-90 origin-center transition-all duration-500 ${progressColors[mode]}`}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                            />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                            <h2 className="text-6xl md:text-7xl font-mono font-bold tracking-tighter">{formatTime(time)}</h2>
                        </div>
                    </div>

                    {/* Các nút điều khiển */}
                    <div className="flex items-center justify-center space-x-6">
                        <button onClick={resetTimer} title="Reset" className="text-gray-400 hover:text-white transition-colors duration-300">
                            <ResetIcon className="w-8 h-8"/>
                        </button>
                        <button onClick={toggleTimer} className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 ${buttonBgColors[mode]} ${modeColors[mode]}`}>
                            {isActive ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10 pl-1"/>}
                        </button>
                        <div title="Pomodoros đã hoàn thành" className={`flex items-center space-x-2 text-lg font-bold ${modeTextColors[mode]}`}>
                             <span>&#10003;</span>
                             <span>{pomodoroCount}</span>
                        </div>
                    </div>
                </main>
            </div>
             <footer className="text-center text-gray-500 text-sm py-4">
                Thiết kế bởi Gemini
            </footer>
        </div>
    );
};

export default App;
