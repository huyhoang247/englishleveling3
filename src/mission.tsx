import React, { useState, useMemo, useCallback } from 'react';

// --- Dữ liệu mẫu (ĐÃ CẬP NHẬT cấu trúc subQuests) ---
const initialQuests = [
  // --- Nhiệm vụ Trắc nghiệm ---
  {
    id: 7,
    title: 'Hoàn thành Practice 1 (100 Câu)',
    description: 'Chinh phục toàn bộ các bài thực hành trong chương 1 để nhận phần thưởng lớn.',
    type: 'practice',
    level: 6,
    rewards: { xp: 1000, gold: 500 },
    status: 'in_progress',
    subQuests: [
      { id: 'p1_1', title: 'Practice 1 Preview 1', progress: 100, total: 100 },
      { id: 'p1_2', title: 'Practice 1 Preview 2', progress: 75, total: 100 },
      { id: 'p1_3', title: 'Practice 1 Preview 3', progress: 0, total: 100 },
      { id: 'p1_4', title: 'Practice 1 Preview 4', progress: 0, total: 100 },
      { id: 'p1_5', title: 'Practice 1 Preview 5', progress: 0, total: 100 },
    ]
  },
  {
    id: 8,
    title: 'Hoàn thành Practice 2 (200 Câu)',
    description: 'Vượt qua thử thách với các câu hỏi nâng cao của chương 2.',
    type: 'practice',
    level: 10,
    rewards: { xp: 2500, gold: 1200 },
    status: 'available',
    subQuests: [
      { id: 'p2_1', title: 'Practice 2 Preview 1', progress: 0, total: 100 },
      { id: 'p2_2', title: 'Practice 2 Preview 2', progress: 0, total: 100 },
      { id: 'p2_3', title: 'Practice 2 Preview 3', progress: 0, total: 100 },
      { id: 'p2_4', title: 'Practice 2 Preview 4', progress: 0, total: 100 },
      { id: 'p2_5', title: 'Practice 2 Preview 5', progress: 0, total: 100 },
    ]
  },
  {
    id: 9,
    title: 'Hoàn thành Practice 3 (300 Câu)',
    description: 'Bài kiểm tra cuối cùng để chứng tỏ đẳng cấp chuyên gia.',
    type: 'practice',
    level: 15,
    rewards: { xp: 5000, gold: 3000 },
    status: 'in_progress',
    subQuests: [
      { id: 'p3_1', title: 'Practice 3 Preview 1', progress: 100, total: 100 },
      { id: 'p3_2', title: 'Practice 3 Preview 2', progress: 100, total: 100 },
      { id: 'p3_3', title: 'Practice 3 Preview 3', progress: 100, total: 100 },
      { id: 'p3_4', title: 'Practice 3 Preview 4', progress: 100, total: 100 },
      { id: 'p3_5', title: 'Practice 3 Preview 5', progress: 100, total: 100 },
    ]
  },
  // --- Nhiệm vụ cũ (giữ nguyên) ---
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

// --- Icon Components (SVG) - Không thay đổi ---
const SwordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M14.5 17.5 3 6l3-3 11.5 11.5"/><path d="m21 21-9-9"/><path d="m15 12-3.5 3.5"/><path d="m3 21 3-3"/></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M11 20A7 7 0 0 1 4 13H2a9 9 0 0 0 9 9z"/><path d="M13 4a7 7 0 0 1 7 7v1h2a9 9 0 0 0-9-9z"/><path d="M2 12h1.1a2.9 2.9 0 0 1 2.8 2.4L7 22"/><path d="M22 12h-1.1a2.9 2.9 0 0 0-2.8-2.4L17 2"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const XPIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;


const QuestIcon = ({ type }: { type: string }) => {
  const icons = {
    combat: <SwordIcon />,
    gathering: <LeafIcon />,
    escort: <ShieldIcon />,
    practice: <PencilIcon />,
  };
  return icons[type] || <ShieldIcon />;
};

// --- Component Thẻ Nhiệm Vụ (Thiết kế lại hoàn toàn) ---
const QuestCard = ({ quest, onAction, style }) => {
  const isPracticeQuest = quest.type === 'practice';
  const isCompleted = quest.status === 'completed';
  
  // --- LOGIC MỚI: Tính toán tiến độ tổng và xác định mục tiêu con hiện tại ---
  const { overallProgress, activeSubQuest } = useMemo(() => {
    if (isPracticeQuest && quest.subQuests) {
      const completedCount = quest.subQuests.filter(sq => sq.progress >= sq.total).length;
      const firstActive = quest.subQuests.find(sq => sq.progress < sq.total);
      return {
        overallProgress: {
          progress: completedCount,
          total: quest.subQuests.length,
        },
        activeSubQuest: firstActive || null, // Nếu không có, nghĩa là đã hoàn thành tất cả
      };
    }
    // Đối với nhiệm vụ thường
    return {
      overallProgress: { progress: quest.progress, total: quest.total },
      activeSubQuest: null,
    };
  }, [quest, isPracticeQuest]);

  const overallPercentage = overallProgress.total > 0 ? (overallProgress.progress / overallProgress.total) * 100 : 0;
  const canBeClaimed = overallProgress.progress >= overallProgress.total;

  return (
    <div
      style={style}
      className={`bg-gray-800/70 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 group quest-card ${isCompleted ? 'opacity-70' : ''}`}
    >
      <div className={`relative p-5 border-b-2 ${isCompleted ? 'border-green-500/30' : 'border-cyan-500/30'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 bg-gray-900/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 border border-yellow-500/50">
          Lv. {quest.level}
        </div>
        <div className="flex items-start">
          <div className="bg-gray-900 p-3 rounded-full border-2 border-gray-700 group-hover:border-cyan-500 transition-colors duration-300 mr-4">
            <QuestIcon type={quest.type} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-400' : 'text-cyan-300'}`}>{quest.title}</h3>
            <p className="text-sm text-gray-400 max-w-md">{quest.description}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* --- Thanh tiến độ TỔNG THỂ --- */}
        {!isCompleted && (
          <div>
            <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
              <span>Tiến độ tổng thể</span>
              <span>{overallProgress.progress} / {overallProgress.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* --- Thanh tiến độ MỤC TIÊU CON (chỉ cho practice quest) --- */}
        {isPracticeQuest && !isCompleted && (
          <div className="pt-4 border-t border-gray-700/50">
            {activeSubQuest ? (
              <div>
                <h4 className="font-semibold text-sm text-gray-400 mb-2">Mục tiêu hiện tại: <span className="text-cyan-300 font-bold">{activeSubQuest.title}</span></h4>
                <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                  <span>Tiến độ câu hỏi</span>
                  <span>{activeSubQuest.progress} / {activeSubQuest.total}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(activeSubQuest.progress / activeSubQuest.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              // Trường hợp đã hoàn thành tất cả mục tiêu con
              <div className="flex items-center justify-center space-x-3 text-center py-2">
                <CheckCircleIcon />
                <p className="font-semibold text-green-300">Tất cả mục tiêu đã hoàn thành!</p>
              </div>
            )}
          </div>
        )}

        {/* --- Phần thưởng --- */}
        <div>
          <h4 className="font-semibold text-sm text-gray-400 mb-2">Phần thưởng:</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center space-x-2 bg-gradient-to-br from-gray-800 to-gray-900/50 px-3 py-1.5 rounded-lg border border-yellow-500/30 shadow-sm">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Gold" className="w-4 h-4" /> 
              <span className="text-yellow-300 font-bold">{quest.rewards.gold}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-br from-gray-800 to-gray-900/50 px-3 py-1.5 rounded-lg border border-purple-500/30 shadow-sm">
              <XPIcon /> 
              <span className="text-purple-300 font-bold">{quest.rewards.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer với các nút hành động --- */}
      <div className="bg-gray-900/50 px-5 py-3 flex items-center justify-end space-x-3">
        {quest.status === 'available' && (
          <button onClick={() => onAction(quest.id, 'accept')} className="px-5 py-2 rounded-md text-white font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-cyan-500/50 transform hover:scale-105">
            Nhận NV
          </button>
        )}
        {quest.status === 'in_progress' && (
          <button 
            onClick={() => onAction(quest.id, 'claim')} 
            disabled={!canBeClaimed}
            className={`px-5 py-2 rounded-md font-semibold text-sm transition-all duration-300 transform ${
              canBeClaimed
              ? 'text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-emerald-500/50 hover:scale-105'
              : 'text-gray-400 bg-gray-600 cursor-not-allowed'
            }`}
          >
            Nhận thưởng
          </button>
        )}
        {isCompleted && (
          <button onClick={() => onAction(quest.id, 'claim')} className="px-5 py-2 rounded-md text-white font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-emerald-500/50 transform hover:scale-105">
            Nhận thưởng
          </button>
        )}
      </div>
    </div>
  );
};


// --- Component Chính (Không thay đổi) ---
export default function App() {
  const [quests, setQuests] = useState(initialQuests);
  const [activeTab, setActiveTab] = useState('active');

  const handleQuestAction = useCallback((questId: number, action: 'accept' | 'claim') => {
    setQuests(currentQuests => {
      if (action === 'claim') {
        return currentQuests.filter(q => q.id !== questId);
      }
      
      if (action === 'accept') {
        return currentQuests.map(q => 
          q.id === questId ? { ...q, status: 'in_progress' } : q
        );
      }
      return currentQuests;
    });
  }, []);

  const filteredQuests = useMemo(() => {
    const sortedQuests = [...quests].sort((a, b) => {
      const statusOrder = { 'in_progress': 1, 'available': 2, 'completed': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    if (activeTab === 'active') {
      return sortedQuests.filter(q => q.status === 'available' || q.status === 'in_progress');
    }
    return sortedQuests.filter(q => q.status === 'completed');
  }, [quests, activeTab]);

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-6 py-2 rounded-t-lg font-semibold transition-all duration-300 relative ${
        activeTab === tabName
          ? 'bg-gray-800/70 text-cyan-300'
          : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      {label}
      {activeTab === tabName && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
    </button>
  );

  return (
    <>
      <style>{`
        .gradient-background {
          background-color: #020617;
          background-image: radial-gradient(at top, #1e293b, #020617 50%);
        }
        .quest-card {
          border: 1px solid transparent;
          animation: fadeIn 0.5s ease-out forwards;
        }
        .quest-card:hover {
          border-color: #0891b2;
          box-shadow: 0 0 25px rgba(14, 165, 233, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="min-h-screen text-white font-sans p-4 sm:p-8 gradient-background">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wider" style={{ textShadow: '0 0 20px rgba(14, 165, 233, 0.8)' }}>
              Bảng Nhiệm Vụ
            </h1>
            <p className="text-gray-300 mt-2">Vận mệnh đang chờ đợi, hỡi nhà thám hiểm!</p>
          </header>

          <div className="flex border-b border-gray-700 mb-6">
            <TabButton tabName="active" label="Đang Hoạt Động" />
            <TabButton tabName="completed" label="Đã Hoàn Thành" />
          </div>

          <main className="space-y-6">
            {filteredQuests.length > 0 ? (
              filteredQuests.map((quest, index) => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  onAction={handleQuestAction}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))
            ) : (
              <div className="text-center py-16 px-6 bg-gray-800/50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-300">Không có nhiệm vụ nào</h3>
                <p className="text-gray-500 mt-2">Hãy quay lại sau để nhận các thử thách mới!</p>
              </div>
            )}
          </main>
          
          <footer className="text-center mt-12 text-gray-500 text-sm">
              <p>Giao diện được nâng cấp bởi Gemini.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
