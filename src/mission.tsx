import React, { useState } from 'react';

// --- SVG ICONS (Thay thế cho lucide-react) ---
// Các icon được thiết kế riêng để phù hợp với chủ đề fantasy

const StarIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);

const CoinsIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.515 4.545c-.85.345-1.63.8-2.32 1.353 1.25.93 2.682 1.59 4.232 1.936.012-.014.026-.028.038-.042a.75.75 0 011.06 1.06l-2.002 2.003c.53.213 1.1.343 1.693.419 1.134.148 2.292-.265 3.19-.955.942-.728 1.601-1.803 1.79-2.996-.134.02-.268.036-.404.048-1.25.12-2.457-.23-3.486-.885-.18-.11-.35-.227-.512-.35a.75.75 0 01-.2-1.025l1.78-2.135c-.431-.22-.88-.41-1.348-.565a10.45 10.45 0 00-3.328-.27zM6.02 7.646c-.25.32-.48.653-.69.998.05.02.1.04.15.06-.11.13-.21.26-.31.4a.75.75 0 01-1.05-.14 9.68 9.68 0 01-.43-1.018c.41-.21.83-.4 1.26-.554.12.09.24.18.37.26a.75.75 0 01.67-1.3 11.22 11.22 0 00-1.03-.43A9.73 9.73 0 016.02 7.646z" clipRule="evenodd" />
  </svg>
);

const ChestIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M10 4.00098H14C14.5523 4.00098 15 4.44869 15 5.00098V7.00098H9V5.00098C9 4.44869 9.44772 4.00098 10 4.00098Z" />
        <path fillRule="evenodd" d="M5 6.00098C3.89543 6.00098 3 6.89641 3 8.00098V18.001C3 19.1055 3.89543 20.001 5 20.001H19C20.1046 20.001 21 19.1055 21 18.001V8.00098C21 6.89641 20.1046 6.00098 19 6.00098H5ZM5 8.00098H19V18.001H5V8.00098Z" clipRule="evenodd" />
    </svg>
);

const ChevronIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const BookIcon = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.25a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75z" />
        <path d="M3.5 4.5a.75.75 0 0 0-1.5 0v14.25a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V4.5a.75.75 0 0 0-1.5 0v14.25a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V4.5z" />
    </svg>
);


// --- DỮ LIỆU MẪU ---
const initialQuests = [
  { id: 1, title: 'Tiêu Diệt Rồng Lửa', description: 'Bà chúa lửa Ignis đã thức giấc. Hãy tiến vào hang ổ của nó và dập tắt ngọn lửa hung tàn.', status: 'Đang làm', progress: 65, rewards: { xp: 500, gold: 250, items: ['Vảy Rồng Lửa', 'Tim Rồng'] }, type: 'Chính tuyến', level: 'Khó' },
  { id: 2, title: 'Thu Thập Thảo Dược Hiếm', description: 'Tìm 10 đóa Hoa Sương Mai trong Khu Rừng Ánh Trăng để bào chế thuốc giải độc.', status: 'Mới', progress: 0, rewards: { xp: 150, gold: 50, items: ['Thuốc Giải Độc Cấp 1'] }, type: 'Phụ', level: 'Dễ' },
  { id: 3, title: 'Giải Cứu Dân Làng', description: 'Một nhóm cướp đã tấn công làng Woodhaven. Hãy đánh bại chúng và giải cứu các con tin.', status: 'Đang làm', progress: 30, rewards: { xp: 300, gold: 100, items: ['Bùa Hộ Mệnh Của Dân Làng'] }, type: 'Chính tuyến', level: 'Trung bình' },
  { id: 4, title: 'Chế Tạo Thanh Kiếm Bão Tố', description: 'Rèn một vũ khí huyền thoại bằng cách thu thập Lõi Sét và Tinh Thể Gió.', status: 'Hoàn thành', progress: 100, rewards: { xp: 1000, gold: 0, items: ['Kiếm Bão Tố'] }, type: 'Chế tạo', level: 'Sử thi' },
];

// --- COMPONENTS ---

const RewardIcon = ({ type, value, item }) => {
  const icons = {
    xp: <StarIcon className="h-5 w-5 text-yellow-300" />,
    gold: <CoinsIcon className="h-5 w-5 text-amber-400" />,
    item: <ChestIcon className="h-5 w-5 text-sky-300" />,
  };
  return (
    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg text-sm shadow-sm">
      {icons[type]}
      <span className="font-medium text-slate-200">{value}</span>
      {item && <span className="font-bold text-white">{item}</span>}
    </div>
  );
};

const QuestCard = ({ quest, onSelect, isSelected }) => {
  const statusConfig = {
    'Đang làm': { border: 'from-blue-500 to-cyan-400', tagBg: 'bg-blue-500/20', tagText: 'text-blue-300' },
    'Hoàn thành': { border: 'from-green-500 to-emerald-400', tagBg: 'bg-green-500/20', tagText: 'text-green-300' },
    'Mới': { border: 'from-yellow-500 to-amber-400', tagBg: 'bg-yellow-500/20', tagText: 'text-yellow-300' },
  };

  const levelColors = {
    'Dễ': 'text-green-400',
    'Trung bình': 'text-yellow-400',
    'Khó': 'text-orange-400',
    'Sử thi': 'text-purple-400',
  }

  return (
    <div
      className={`group relative p-px rounded-xl bg-gradient-to-br ${statusConfig[quest.status].border} transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10`}
      onClick={() => onSelect(quest.id)}
    >
      <div className="bg-slate-900/80 backdrop-blur-lg rounded-[11px] transition-all duration-300 group-hover:bg-slate-800/80 cursor-pointer">
        {/* Header của thẻ */}
        <div className="p-4 flex items-start justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusConfig[quest.status].tagBg} ${statusConfig[quest.status].tagText} border border-current/30`}>
                {quest.status}
              </span>
              <h3 className="text-lg font-bold text-cyan-200 tracking-wide">{quest.title}</h3>
            </div>
            <p className={`text-sm font-semibold ${levelColors[quest.level]}`}>{quest.type} - {quest.level}</p>
          </div>
          <ChevronIcon className={`h-6 w-6 text-slate-400 transition-transform duration-500 ease-in-out ${isSelected ? 'rotate-180' : ''} flex-shrink-0 mt-1`} />
        </div>

        {/* Nội dung chi tiết - Sử dụng grid transition để animation mượt hơn */}
        <div className={`grid transition-all duration-500 ease-in-out ${isSelected ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-5 pt-1 space-y-5">
              <p className="text-slate-300 text-sm leading-relaxed">{quest.description}</p>
              
              {/* Thanh tiến độ */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-400">Tiến độ</span>
                  <span className="text-sm font-bold text-cyan-300">{quest.progress}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 relative"
                        style={{ width: `${quest.progress}%` }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 h-full w-full bg-white/20 animate-[shimmer_2s_infinite] opacity-50"></div>
                    </div>
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
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-green-500/20 hover:scale-[1.02] hover:shadow-green-500/40 transition-all duration-300">
                    Lĩnh Thưởng
                  </button>
                ) : (
                  <button className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-cyan-500/20 hover:scale-[1.02] hover:shadow-cyan-500/40 transition-all duration-300">
                    {quest.status === 'Mới' ? 'Bắt Đầu Theo Dõi' : 'Tiếp Tục'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [quests, setQuests] = useState(initialQuests);
  const [selectedQuestId, setSelectedQuestId] = useState(quests[0]?.id || null);

  const handleSelectQuest = (id) => {
    setSelectedQuestId(prevId => (prevId === id ? null : id));
  };

  return (
    <>
      {/* CSS cho hiệu ứng shimmer của thanh progress và background aurora */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(100%) skewX(-15deg); }
        }
        @keyframes aurora {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1.5); }
          100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.5); }
        }
        .aurora-bg::before, .aurora-bg::after {
          content: '';
          position: absolute;
          filter: blur(80px);
          opacity: 0.15;
          z-index: -1;
        }
        .aurora-bg::before {
          width: 400px;
          height: 400px;
          top: 20%;
          left: 10%;
          background: radial-gradient(circle, #38bdf8, transparent 60%);
          animation: aurora 20s linear infinite;
        }
        .aurora-bg::after {
          width: 400px;
          height: 400px;
          bottom: 10%;
          right: 5%;
          background: radial-gradient(circle, #a855f7, transparent 60%);
          animation: aurora 25s linear infinite reverse;
        }
      `}</style>
      <div className="relative min-h-screen bg-slate-900 font-sans text-white p-4 md:p-8 flex items-center justify-center overflow-hidden aurora-bg">
        <div className="w-full max-w-2xl mx-auto z-10">
          <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4">
              <BookIcon className="h-8 w-8 text-cyan-300" />
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-300 to-sky-400 pb-2">
                Sổ Nhiệm Vụ
              </h1>
            </div>
            <p className="text-slate-400 mt-2 text-lg">Những cuộc phiêu lưu đang chờ đợi bạn.</p>
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
              <div className="text-center py-16 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-lg">Không có nhiệm vụ nào.</p>
                <p className="text-slate-500 mt-2">Hãy quay lại sau để nhận thử thách mới!</p>
              </div>
            )}
          </main>
          
          <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Giao diện được nâng cấp bởi AI.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
