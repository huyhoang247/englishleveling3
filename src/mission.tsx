import React, { useState, useMemo, useCallback } from 'react';

// --- Dữ liệu mẫu cho các nhiệm vụ (Mở rộng) ---
const initialQuests = [
  {
    id: 1,
    title: 'Diệt Rồng Cổ Đại',
    description: 'Tiêu diệt con rồng lửa hung hãn đang tàn phá làng phía đông.',
    type: 'combat',
    level: 15,
    progress: 0,
    total: 1,
    rewards: { xp: 500, gold: 1000, items: ['Vảy Rồng Lửa', 'Kiếm Rồng'] },
    status: 'available', // 'available', 'in_progress', 'completed'
  },
  {
    id: 2,
    title: 'Thu Thập Thảo Dược Hiếm',
    description: 'Tìm 10 cây Nấm Linh Quang trong Khu Rừng Ánh Trăng.',
    type: 'gathering',
    level: 5,
    progress: 3,
    total: 10,
    rewards: { xp: 150, gold: 200, items: ['Bình Máu Lớn'] },
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
    rewards: { xp: 200, gold: 500, items: ['Ngọc May Mắn'] },
    status: 'completed',
  },
  {
    id: 4,
    title: 'Giải Cứu Dân Làng',
    description: 'Đánh bại 15 quái vật đang bao vây một ngôi làng nhỏ.',
    type: 'combat',
    level: 10,
    progress: 8,
    total: 15,
    rewards: { xp: 350, gold: 400, items: ['Khiên Vệ Binh'] },
    status: 'in_progress',
  },
  {
    id: 5,
    title: 'Bí Mật Hầm Mộ',
    description: 'Khám phá những bí ẩn được chôn giấu trong hầm mộ cổ.',
    type: 'exploration',
    level: 12,
    progress: 0,
    total: 1,
    rewards: { xp: 400, gold: 600, items: ['Bản Đồ Cổ'] },
    status: 'available',
  },
  {
    id: 6,
    title: 'Chế Tạo Trang Bị',
    description: 'Rèn một chiếc giáp từ các nguyên liệu thu thập được.',
    type: 'crafting',
    level: 7,
    progress: 1,
    total: 1,
    rewards: { xp: 180, gold: 150, items: ['Giáp Thép Tinh Xảo'] },
    status: 'completed',
  },
];

// --- Icon Components (SVG) ---
const SwordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M14.5 17.5 3 6l3-3 11.5 11.5"/><path d="m21 21-9-9"/><path d="m15 12-3.5 3.5"/><path d="m3 21 3-3"/></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M11 20A7 7 0 0 1 4 13H2a9 9 0 0 0 9 9z"/><path d="M13 4a7 7 0 0 1 7 7v1h2a9 9 0 0 0-9-9z"/><path d="M2 12h1.1a2.9 2.9 0 0 1 2.8 2.4L7 22"/><path d="M22 12h-1.1a2.9 2.9 0 0 0-2.8-2.4L17 2"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CompassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>;
const HammerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="m15 12-8.373 8.373a1 1 0 1 1-1.414-1.414L12.586 12l-2.829-2.828a1 1 0 0 1 0-1.414l4.243-4.243a1 1 0 0 1 1.414 0l2.828 2.828a1 1 0 0 1 0 1.414L15 12z"></path></svg>;
const GoldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-7h2v4h-2v-4zm0-2h2v2h-2V9z"/></svg>;
const XPIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const ItemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400"><path d="M20.57 14.86L12 20.11 3.43 14.86a2 2 0 0 1-1.43-1.86V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-1.43 1.86zM12 4L4 8v6l8 4 8-4V8l-8-4z"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>;

const QuestIcon = ({ type }: { type: string }) => {
  const icons = {
    combat: <SwordIcon />,
    gathering: <LeafIcon />,
    escort: <ShieldIcon />,
    exploration: <CompassIcon />,
    crafting: <HammerIcon />,
  };
  return icons[type] || <ShieldIcon />;
};

// --- Component Thẻ Nhiệm Vụ ---
// Ghi chú: Component này không được bọc trong React.memo, nên việc tối ưu `onAction` ở component cha không có tác động lớn,
// nhưng đây vẫn là một thói quen tốt.
const QuestCard = ({ quest, onAction, style }) => {
  const progressPercentage = (quest.progress / quest.total) * 100;
  const isCompleted = quest.status === 'completed';

  return (
    <div
      style={style}
      className={`bg-gray-800/70 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 group quest-card ${isCompleted ? 'opacity-70' : ''}`}
    >
      <div className={`relative p-5 border-b-2 ${isCompleted ? 'border-green-500/30' : 'border-cyan-500/30'}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 bg-gray-900/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 border border-yellow-500/50">
          Lv. {quest.level}
        </div>

        <div className="flex items-start justify-between relative">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-900 p-3 rounded-full border-2 border-gray-700 group-hover:border-cyan-500 transition-colors duration-300">
              <QuestIcon type={quest.type} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-400' : 'text-cyan-300'}`}>{quest.title}</h3>
              <p className="text-sm text-gray-400 max-w-md">{quest.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Progress Bar */}
        {!isCompleted && (
          <div className="my-2">
            <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
              <span>Tiến độ</span>
              <span>{quest.progress} / {quest.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="mt-4">
          <h4 className="font-semibold text-sm text-gray-200 mb-2">Phần thưởng:</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center space-x-1.5"><GoldIcon /> <span className="text-yellow-300">{quest.rewards.gold} Vàng</span></div>
            <div className="flex items-center space-x-1.5"><XPIcon /> <span className="text-purple-300">{quest.rewards.xp} XP</span></div>
            {quest.rewards.items.length > 0 && (
              <div className="flex items-center space-x-1.5"><ItemIcon /> <span className="text-gray-300">{quest.rewards.items.join(', ')}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="bg-gray-900/50 px-5 py-3 flex items-center justify-end space-x-3">
        {quest.status === 'available' && (
          <button onClick={() => onAction(quest.id, 'accept')} className="px-5 py-2 rounded-md text-white font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-cyan-500/50 transform hover:scale-105">
            Chấp Nhận
          </button>
        )}
        {quest.status === 'in_progress' && (
          <button onClick={() => onAction(quest.id, 'abandon')} className="px-5 py-2 rounded-md text-gray-300 font-semibold text-sm transition-all duration-200 bg-gray-700 hover:bg-red-800 hover:text-white">
            Hủy Bỏ
          </button>
        )}
        {isCompleted && (
          <div className="flex items-center space-x-2 text-green-400 font-semibold">
            <CheckCircleIcon />
            <span>Đã Hoàn Thành</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component Chính ---
export default function App() {
  const [quests, setQuests] = useState(initialQuests);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  // --- THAY ĐỔI: Tối ưu hóa bằng useCallback ---
  // Bọc hàm này trong useCallback để nó không bị tạo lại mỗi lần component render.
  // Điều này giúp ngăn các component con (như QuestCard) render lại một cách không cần thiết
  // nếu chúng được tối ưu hóa bằng React.memo.
  // Ta sử dụng "functional update" (c => c.map(...)) để không cần đưa `quests` vào dependency array.
  const handleQuestAction = useCallback((questId: number, action: string) => {
    setQuests(currentQuests => 
      currentQuests.map(q => {
        if (q.id !== questId) return q;
        if (action === 'accept') return { ...q, status: 'in_progress' };
        if (action === 'abandon') return { ...q, status: 'available', progress: 0 };
        return q;
      })
    );
  }, []); // Dependency array rỗng, hàm này sẽ chỉ được tạo một lần duy nhất.

  // Hoàn toàn chính xác, `useMemo` ở đây rất quan trọng để tránh tính toán lại danh sách mỗi khi render.
  const filteredQuests = useMemo(() => {
    if (activeTab === 'active') {
      return quests.filter(q => q.status === 'available' || q.status === 'in_progress');
    }
    return quests.filter(q => q.status === 'completed');
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
          background-color: #020617; /* Màu nền chính: slate-950 */
          background-image: radial-gradient(at top, #1e293b, #020617 50%); /* Gradient: từ slate-800 ở trên cùng, hòa vào slate-950 */
        }
      
        .quest-card {
          border: 1px solid transparent;
          animation: fadeIn 0.5s ease-out forwards;
        }
        .quest-card:hover {
          border-color: #0891b2; /* cyan-600 */
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

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <TabButton tabName="active" label="Đang Nhận" />
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
