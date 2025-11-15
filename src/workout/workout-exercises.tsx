import React from 'react';

// --- SVG Icons & Images for Exercises ---
const SquatIcon = () => ( <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="20" r="10" fill="currentColor"/><rect x="45" y="30" width="10" height="30" rx="5" fill="currentColor"/><path d="M 40 55 L 30 90 L 40 90 L 45 65 Z" fill="currentColor"/><path d="M 60 55 L 70 90 L 60 90 L 55 65 Z" fill="currentColor"/><rect x="20" y="45" width="60" height="8" rx="4" fill="currentColor"/></svg> );
const BenchPressIcon = () => ( <svg viewBox="0 0 100 100" className="w-full h-full"><rect x="20" y="70" width="60" height="10" rx="5" fill="currentColor"/><circle cx="50" cy="35" r="10" fill="currentColor"/><path d="M 50 45 L 30 60 L 70 60 Z" fill="currentColor"/><rect x="10" y="28" width="80" height="8" rx="4" fill="currentColor"/><rect x="5" y="24" width="5" height="16" fill="currentColor"/><rect x="90" y="24" width="5" height="16" fill="currentColor"/></svg> );
const WristCurlIcon = () => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/workout/wrist-curl.png" alt="Wrist Curl" className="w-full h-full object-contain" /> );
const DeadliftIcon = () => ( <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="35" r="8" fill="currentColor"/><path d="M 50 43 L 50 60 L 40 75 L 35 73 L 45 58" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><path d="M 50 43 L 50 60 L 60 75 L 65 73 L 55 58" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><path d="M 45 80 L 40 90" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><path d="M 55 80 L 60 90" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><rect x="10" y="88" width="80" height="7" rx="3" fill="currentColor"/><rect x="5" y="80" width="5" height="15" fill="currentColor"/><rect x="90" y="80" width="5" height="15" fill="currentColor"/></svg> );
const KneePushUpIcon = () => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/workout/knee-push-up.gif" alt="Knee Push up" className="w-full h-full object-contain" /> );

// --- Initial Data ---
export const initialExercises = [
    { id: 1, name: 'Bench Press', category: 'Chest', icon: <BenchPressIcon /> },
    { id: 2, name: 'Squat', category: 'Legs', icon: <SquatIcon /> },
    { id: 3, name: 'Deadlift', category: 'Back', icon: <DeadliftIcon /> },
    { id: 4, name: 'Wrist Curl', category: 'Arms', icon: <WristCurlIcon /> },
    { id: 5, name: 'Knee Push up', category: 'Chest', icon: <KneePushUpIcon /> },
];
