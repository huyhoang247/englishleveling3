import React, { useState } from 'react';
import { ChevronDown, X, Star, Coins, ShieldCheck, Zap } from 'lucide-react';

// Dữ liệu mẫu cho các nhiệm vụ
const initialQuests = [
  {
    id: 1,
    title: 'Tiêu Diệt Rồng Lửa',
    description: 'Bà chúa lửa Ignis đã thức giấc. Hãy tiến vào hang ổ của nó và dập tắt ngọn lửa hung tàn.',
    status: 'Đang làm',
    progress: 65,
    rewards: {
      xp: 500,
      gold: 250,
      items: ['Vảy Rồng Lửa', 'Tim Rồng'],
    },
    type: 'Chính tuyến',
    level: 'Khó',
  },
  {
    id: 2,
    title: 'Thu Thập Thảo Dược Hiếm',
    description: 'Tìm 10 đóa Hoa Sương Mai trong Khu Rừng Ánh Trăng để bào chế thuốc giải độc.',
    status: 'Đang làm',
    progress: 30,
    rewards: {
      xp: 150,
      gold: 50,
      items: ['Thuốc Giải Độc Cấp 1'],
    },
    type: 'Phụ',
    level: 'Dễ',
  },
  {
    id: 3,
    title: 'Giải Cứu Dân Làng',
    description: 'Một nhóm cướp đã tấn công làng Woodhaven. Hãy đánh bại chúng và giải cứu các con tin.',
    status: 'Mới',
    progress: 0,
    rewards: {
      xp: 300,
      gold: 100,
      items: ['Bùa Hộ Mệnh Của Dân Làng'],
    },
    type: 'Chính tuyến',
    level: 'Trung bình',
  },
  {
    id: 4,
    title: 'Chế Tạo Thanh Kiếm Bão Tố',
    description: 'Rèn một vũ khí huyền thoại bằng cách thu thập Lõi Sét và Tinh Thể Gió.',
    status: 'Hoàn thành',
    progress: 100,
    rewards: {
      xp: 1000,
      gold: 0,
      items: ['Kiếm Bão Tố'],
    },
    type: 'Chế tạo',
    level: 'Sử thi',
  },
];

// Component hiển thị icon phần thưởng
const RewardIcon = ({ type, value }) => {
  const icons = {
    xp: <Star className="h-4 w-4 text-yellow-400" />,
    gold: <Coins className="h-4 w-4 text-amber-500" />,
    item: <ShieldCheck className="h-4 w-4 text-sky-400" />,
  };
  return (
    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-sm">
      {icons[type]}
      <span className="font-medium">{value}</span>
    </div>
  );
};

// Component thẻ nhiệm vụ
const QuestCard = ({ quest, onSelect, isSelected }) => {
  const statusColors = {
    'Đang làm': 'border-blue-500/50',
    'Hoàn thành': 'border-green-500/50',
    'Mới': 'border-yellow-500/50',
  };

  const levelColors = {
    'Dễ': 'text-green-400',
    'Trung bình': 'text-yellow-400',
    'Khó': 'text-orange-500',
    'Sử thi': 'text-purple-400',
  }

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/80 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-slate-800/80 hover:border-slate-600 ${isSelected ? 'max-h-[500px]' : 'max-h-[100px] md:max-h-[88px]'} overflow-hidden cursor-pointer ${statusColors[quest.status]}`}
      onClick={() => onSelect(quest.id)}
    >
      {/* Header của thẻ */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-grow">
          <div className="flex items-center gap-3">
             <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${quest.status === 'Hoàn thành' ? 'bg-green-500/20 text-green-400' : quest.status === 'Đang làm' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {quest.status}
            </span>
            <h3 className="text-lg font-bold text-teal-300">{quest.title}</h3>
          </div>
          <p className={`text-sm font-semibold ${levelColors[quest.level]}`}>{quest.type} - {quest.level}</p>
        </div>
        <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
      </div>

      {/* Nội dung chi tiết (khi được chọn) */}
      <div className="px-4 pb-4 space-y-4">
        <p className="text-slate-300 text-sm">{quest.description}</p>
        
        {/* Thanh tiến độ */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-400">Tiến độ</span>
            <span className="text-sm font-bold text-cyan-400">{quest.progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${quest.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Phần thưởng */}
        <div>
          <h4 className="text-base font-semibold text-slate-300 mb-2">Phần thưởng</h4>
          <div className="flex flex-wrap gap-2">
            <RewardIcon type="xp" value={`${quest.rewards.xp} XP`} />
            {quest.rewards.gold > 0 && <RewardIcon type="gold" value={quest.rewards.gold} />}
            {quest.rewards.items.map((item, index) => (
              <RewardIcon key={index} type="item" value={item} />
            ))}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-2">
          {quest.status === 'Hoàn thành' ? (
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
              Nhận Thưởng
            </button>
          ) : (
            <button className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-sky-600 hover:to-indigo-700 transition-all duration-300">
              Theo Dõi Nhiệm Vụ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Component chính của giao diện
export default function App() {
  const [quests, setQuests] = useState(initialQuests);
  const [selectedQuestId, setSelectedQuestId] = useState(quests[0]?.id || null);

  const handleSelectQuest = (id) => {
    setSelectedQuestId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white p-4 md:p-8 flex items-center justify-center" style={{backgroundImage: 'radial-gradient(circle at top right, rgba(29, 78, 216, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(134, 25, 143, 0.15), transparent 40%)'}}>
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-400">
            Sổ Nhiệm Vụ
          </h1>
          <p className="text-slate-400 mt-2">Những cuộc phiêu lưu đang chờ đợi bạn.</p>
        </header>

        <main className="space-y-4">
          {quests.length > 0 ? (
            quests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onSelect={handleSelectQuest}
                isSelected={selectedQuestId === quest.id}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400">Không có nhiệm vụ nào.</p>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Giao diện được thiết kế bởi Gemini.</p>
        </footer>
      </div>
    </div>
  );
}
