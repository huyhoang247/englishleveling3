import React, { useState, useMemo, useCallback } from 'react';

// --- Dữ liệu mẫu (Không thay đổi) ---
const initialQuests = [
  {
    id: 7,
    title: 'Practice 1',
    description: 'Chinh phục toàn bộ các bài thực hành trong chương 1 để nhận phần thưởng lớn.',
    type: 'practice',
    level: 6,
    rewards: { xp: 1000, gold: 500 },
    status: 'in_progress',
    mainProgress: 6,
    mainTotal: 100,
    subQuests: [
      { id: 'p1_1', title: 'Preview 1', progress: 0, total: 100 },
      { id: 'p1_2', title: 'Preview 2', progress: 0, total: 100 },
      { id: 'p1_3', title: 'Preview 3', progress: 0, total: 100 },
    ]
  },
  {
    id: 8,
    title: 'Practice 2',
    description: 'Vượt qua thử thách với các câu hỏi nâng cao của chương 2.',
    type: 'practice',
    level: 10,
    rewards: { xp: 2500, gold: 1200 },
    status: 'in_progress',
    mainProgress: 100,
    mainTotal: 100,
    subQuests: [
      { id: 'p2_1', title: 'Preview 1', progress: 100, total: 100 },
      { id: 'p2_2', title: 'Preview 2', progress: 15, total: 100 },
      { id: 'p2_3', title: 'Preview 3', progress: 0, total: 100 },
    ]
  },
  {
    id: 9,
    title: 'Practice 3',
    description: 'Bài kiểm tra cuối cùng để chứng tỏ đẳng cấp chuyên gia.',
    type: 'practice',
    level: 15,
    rewards: { xp: 5000, gold: 3000 },
    status: 'available',
    mainProgress: 0,
    mainTotal: 100,
    subQuests: [ { id: 'p3_1', title: 'Preview 1', progress: 0, total: 100 }, { id: 'p3_2', title: 'Preview 2', progress: 0, total: 100 } ]
  },
  {
    id: 2,
    title: 'Thu Thập Thảo Dược Hiếm',
    description: 'Tìm 10 cây Nấm Linh Quang trong Khu Rừng Ánh Trăng.',
    type: 'gathering',
    level: 5,
    progress: 3,
    total: 10,
    rewards: { xp: 150, gold: 200 },
    status: 'in_progress',
  },
  {
    id: 3,
    title: 'Hộ Tống Thương Nhân',
    description: 'Bảo vệ đoàn xe của thương nhân Elara đến thành phố an toàn.',
    type: 'escort',
    level: 8,
    progress: 1,
    total: 1,
    rewards: { xp: 200, gold: 500 },
    status: 'completed',
  },
];

// --- Icon Components (SVG) - Thêm icon Settings ---
const SwordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M14.5 17.5 3 6l3-3 11.5 11.5"/><path d="m21 21-9-9"/><path d="m15 12-3.5 3.5"/><path d="m3 21 3-3"/></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M11 20A7 7 0 0 1 4 13H2a9 9 0 0 0 9 9z"/><path d="M13 4a7 7 0 0 1 7 7v1h2a9 9 0 0 0-9-9z"/><path d="M2 12h1.1a2.9 2.9 0 0 1 2.8 2.4L7 22"/><path d="M22 12h-1.1a2.9 2.9 0 0 0-2.8-2.4L17 2"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const XPIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const CheckCircleIcon = ({className = "text-green-400"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

const QuestIcon = ({ type }) => ({
  combat: <SwordIcon />, gathering: <LeafIcon />, escort: <ShieldIcon />, practice: <PencilIcon />,
}[type] || <ShieldIcon />);

// --- Component Popup Bảng Điều Khiển ---
const ControlPanel = ({ quests, setQuests, onClose }) => {
  const inProgressQuests = quests.filter(q => q.status === 'in_progress');

  const handleProgressUpdate = (questId, type, amount) => {
    setQuests(currentQuests => currentQuests.map(q => {
      if (q.id !== questId) return q;

      const updatedQuest = { ...q };

      if (type === 'main') {
        updatedQuest.mainProgress = Math.min(q.mainTotal, q.mainProgress + amount);
      } else if (type === 'simple') {
        updatedQuest.progress = Math.min(q.total, q.progress + amount);
      } else if (type === 'sub') {
        let isActiveFound = false;
        updatedQuest.subQuests = q.subQuests.map(sq => {
          if (sq.progress < sq.total && !isActiveFound) {
            isActiveFound = true;
            return { ...sq, progress: Math.min(sq.total, sq.progress + amount) };
          }
          return sq;
        });
      }
      return updatedQuest;
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4" onClick={onClose}>
      <div className="relative bg-gray-900/80 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-lg mx-auto mt-16" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-300">Bảng Điều Khiển Test</h2>
          <p className="text-sm text-gray-400">Thay đổi tiến trình của các nhiệm vụ đang hoạt động.</p>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-6">
          {inProgressQuests.length > 0 ? inProgressQuests.map(quest => (
            <div key={quest.id} className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-white">{quest.title}</h3>
              <div className="mt-3 space-y-2">
                {quest.type === 'practice' ? (
                  <>
                    <button onClick={() => handleProgressUpdate(quest.id, 'main', 10)} className="w-full text-left px-3 py-2 text-sm bg-blue-600/50 hover:bg-blue-600/80 rounded-md transition-colors">Tăng 10 Progress chính</button>
                    <button onClick={() => handleProgressUpdate(quest.id, 'sub', 25)} className="w-full text-left px-3 py-2 text-sm bg-teal-600/50 hover:bg-teal-600/80 rounded-md transition-colors">Tăng 25 Lộ trình ôn tập</button>
                  </>
                ) : (
                  <button onClick={() => handleProgressUpdate(quest.id, 'simple', 1)} className="w-full text-left px-3 py-2 text-sm bg-indigo-600/50 hover:bg-indigo-600/80 rounded-md transition-colors">Tăng 1 Tiến độ</button>
                )}
              </div>
            </div>
          )) : <p className="text-gray-500 text-center py-8">Không có nhiệm vụ nào đang hoạt động.</p>}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">×</button>
      </div>
    </div>
  );
};


// --- Các Component con cho Thẻ Nhiệm vụ ---
const SubQuestCompleted = ({ subQuest }) => <div className="flex items-center space-x-3 p-3 bg-gray-900/30 rounded-lg"><CheckCircleIcon className="text-green-500 flex-shrink-0" /><span className="text-gray-400 line-through">{subQuest.title}</span></div>;
const SubQuestActive = ({ subQuest }) => { const p = (subQuest.progress / subQuest.total) * 100; return (<div className="p-4 bg-cyan-900/30 rounded-lg border border-cyan-500/50 shadow-lg shadow-cyan-500/10"><h4 className="font-bold text-cyan-200 mb-2">{subQuest.title}</h4><div className="flex justify-between items-center text-xs text-cyan-100 mb-1"><span>Tiến độ câu hỏi</span><span>{subQuest.progress} / {subQuest.total}</span></div><div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-gradient-to-r from-teal-400 to-green-400 h-2 rounded-full transition-all duration-500" style={{ width: `${p}%` }}></div></div></div>); };
const SubQuestLocked = ({ subQuest }) => <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg opacity-60"><LockIcon /><span className="text-gray-500">{subQuest.title}</span></div>;
const ReviewPathLocked = () => <div className="pt-4 border-t border-gray-700/50"><h4 className="font-semibold text-sm text-gray-500 mb-3">Lộ trình ôn tập</h4><div className="p-4 bg-gray-800/50 rounded-lg text-center opacity-70 flex flex-col items-center"><LockIcon /><p className="mt-2 text-sm text-gray-400">Hoàn thành Progress để mở khóa.</p></div></div>;

// --- Component Thẻ Nhiệm Vụ chính ---
const QuestCard = ({ quest, onAction, style }) => {
  const isPracticeQuest = quest.type === 'practice';
  const isCompleted = quest.status === 'completed';

  const { overallProgress, categorizedSubQuests, isReviewUnlocked, canBeClaimed } = useMemo(() => {
    if (!isPracticeQuest) return { overallProgress: { progress: quest.progress, total: quest.total }, categorizedSubQuests: [], isReviewUnlocked: false, canBeClaimed: quest.progress >= quest.total };
    const reviewUnlocked = quest.mainProgress >= quest.mainTotal;
    const subQuestsCompleted = quest.subQuests.filter(sq => sq.progress >= sq.total).length;
    let isActiveFound = false;
    const categorized = quest.subQuests.map(sq => {
      if (sq.progress >= sq.total) return { ...sq, status: 'completed' };
      if (!isActiveFound) { isActiveFound = true; return { ...sq, status: 'active' }; }
      return { ...sq, status: 'locked' };
    });
    return { overallProgress: { progress: quest.mainProgress, total: quest.mainTotal }, categorizedSubQuests: categorized, isReviewUnlocked: reviewUnlocked, canBeClaimed: reviewUnlocked && subQuestsCompleted === quest.subQuests.length };
  }, [quest]);

  const overallPercentage = overallProgress.total > 0 ? (overallProgress.progress / overallProgress.total) * 100 : 0;

  return ( <div style={style} className={`bg-gray-800/70 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 group quest-card ${isCompleted ? 'opacity-70' : ''}`}><div className={`relative p-5 border-b-2 ${isCompleted ? 'border-green-500/30' : 'border-cyan-500/30'}`}><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div><div className="absolute top-4 right-4 bg-gray-900/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 border border-yellow-500/50">Lv. {quest.level}</div><div className="flex items-start"><div className="bg-gray-900 p-3 rounded-full border-2 border-gray-700 group-hover:border-cyan-500 transition-colors duration-300 mr-4"><QuestIcon type={quest.type} /></div><div>{isPracticeQuest && <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">Trắc nghiệm</p>}<h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-400' : 'text-cyan-300'}`}>{quest.title}</h3><p className="text-sm text-gray-400 max-w-md">{quest.description}</p></div></div></div><div className="p-5 space-y-4">{!isCompleted && (<div><div className="flex justify-between items-center text-xs text-gray-300 mb-1"><span>Progress</span><span>{overallProgress.progress} / {overallProgress.total}</span></div><div className="w-full bg-gray-700 rounded-full h-2.5"><div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${overallPercentage}%` }}></div></div></div>)}{isPracticeQuest && quest.status !== 'completed' && (isReviewUnlocked ? (<div className="pt-4 border-t border-gray-700/50"><h4 className="font-semibold text-sm text-gray-400 mb-3">Lộ trình ôn tập:</h4><div className="space-y-2">{categorizedSubQuests.map(sq => { switch(sq.status) { case 'completed': return <SubQuestCompleted key={sq.id} subQuest={sq} />; case 'active': return <SubQuestActive key={sq.id} subQuest={sq} />; case 'locked': return <SubQuestLocked key={sq.id} subQuest={sq} />; default: return null; }})}</div></div>) : (<ReviewPathLocked />))}{isPracticeQuest && canBeClaimed && quest.status !== 'completed' && (<div className="flex items-center justify-center space-x-3 text-center py-2"><CheckCircleIcon className="text-green-400" /><p className="font-semibold text-green-300">Xuất sắc! Đã hoàn thành tất cả mục tiêu.</p></div>)}<div><h4 className="font-semibold text-sm text-gray-400 mb-2">Phần thưởng:</h4><div className="flex flex-wrap gap-3 text-sm"><div className="flex items-center space-x-2 bg-gradient-to-br from-gray-800 to-gray-900/50 px-3 py-1.5 rounded-lg border border-yellow-500/30 shadow-sm"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Gold" className="w-4 h-4" /> <span className="text-yellow-300 font-bold">{quest.rewards.gold}</span></div><div className="flex items-center space-x-2 bg-gradient-to-br from-gray-800 to-gray-900/50 px-3 py-1.5 rounded-lg border border-purple-500/30 shadow-sm"><XPIcon /> <span className="text-purple-300 font-bold">{quest.rewards.xp}</span></div></div></div></div><div className="bg-gray-900/50 px-5 py-3 flex items-center justify-end space-x-3">{quest.status === 'available' && <button onClick={() => onAction(quest.id, 'accept')} className="px-5 py-2 rounded-md text-white font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-cyan-500/50 transform hover:scale-105">Nhận NV</button>}{quest.status === 'in_progress' && <button onClick={() => onAction(quest.id, 'claim')} disabled={!canBeClaimed} className={`px-5 py-2 rounded-md font-semibold text-sm transition-all duration-300 transform ${canBeClaimed ? 'text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-emerald-500/50 hover:scale-105' : 'text-gray-400 bg-gray-600 cursor-not-allowed'}`}>Nhận thưởng</button>}{isCompleted && <button onClick={() => onAction(quest.id, 'claim')} className="px-5 py-2 rounded-md text-white font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-emerald-500/50 transform hover:scale-105">Nhận thưởng</button>}</div></div>);
};

// --- Component Chính (Đã cập nhật để quản lý Popup) ---
export default function App() {
  const [quests, setQuests] = useState(initialQuests);
  const [activeTab, setActiveTab] = useState('active');
  const [isControlPanelOpen, setControlPanelOpen] = useState(false); // State cho popup

  const handleQuestAction = useCallback((questId, action) => {
    setQuests(currentQuests => {
      if (action === 'claim') return currentQuests.filter(q => q.id !== questId);
      if (action === 'accept') return currentQuests.map(q => q.id === questId ? { ...q, status: 'in_progress' } : q);
      return currentQuests;
    });
  }, []);

  const filteredQuests = useMemo(() => {
    const sortedQuests = [...quests].sort((a, b) => {
      const statusOrder = { 'in_progress': 1, 'available': 2, 'completed': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    if (activeTab === 'active') return sortedQuests.filter(q => q.status === 'available' || q.status === 'in_progress');
    return sortedQuests.filter(q => q.status === 'completed');
  }, [quests, activeTab]);

  const TabButton = ({ tabName, label }) => (<button onClick={() => setActiveTab(tabName)} className={`px-6 py-2 rounded-t-lg font-semibold transition-all duration-300 relative ${activeTab === tabName ? 'bg-gray-800/70 text-cyan-300' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>{label}{activeTab === tabName && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}</button>);

  return (
    <>
      <style>{`
        .gradient-background { background-color: #020617; background-image: radial-gradient(at top, #1e293b, #020617 50%); }
        .quest-card { border: 1px solid transparent; animation: fadeIn 0.5s ease-out forwards; }
        .quest-card:hover { border-color: #0891b2; box-shadow: 0 0 25px rgba(14, 165, 233, 0.3); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {/* Nút mở Bảng điều khiển */}
      <button 
        onClick={() => setControlPanelOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-cyan-600/80 hover:bg-cyan-500 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
        aria-label="Mở bảng điều khiển test"
      >
        <SettingsIcon />
      </button>

      {/* Render có điều kiện Bảng điều khiển */}
      {isControlPanelOpen && (
        <ControlPanel 
          quests={quests} 
          setQuests={setQuests}
          onClose={() => setControlPanelOpen(false)}
        />
      )}

      <div className="min-h-screen text-white font-sans p-4 sm:p-8 gradient-background">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8"><h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wider" style={{ textShadow: '0 0 20px rgba(14, 165, 233, 0.8)' }}>Bảng Nhiệm Vụ</h1><p className="text-gray-300 mt-2">Vận mệnh đang chờ đợi, hỡi nhà thám hiểm!</p></header>
          <div className="flex border-b border-gray-700 mb-6"><TabButton tabName="active" label="Đang Hoạt Động" /><TabButton tabName="completed" label="Đã Hoàn Thành" /></div>
          <main className="space-y-6">{filteredQuests.length > 0 ? (filteredQuests.map((quest, index) => (<QuestCard key={quest.id} quest={quest} onAction={handleQuestAction} style={{ animationDelay: `${index * 100}ms` }} />))) : (<div className="text-center py-16 px-6 bg-gray-800/50 rounded-lg"><h3 className="text-xl font-semibold text-gray-300">Không có nhiệm vụ nào</h3><p className="text-gray-500 mt-2">Hãy quay lại sau để nhận các thử thách mới!</p></div>)}</main>
          <footer className="text-center mt-12 text-gray-500 text-sm"><p>Giao diện được nâng cấp bởi Gemini.</p></footer>
        </div>
      </div>
    </>
  );
}
