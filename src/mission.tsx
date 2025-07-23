import React, { useState, useMemo } from 'react';

// --- ICONS TÙY CHỈNH (SVG) ---
// Được thiết kế riêng cho giao diện này để đảm bảo tính nhất quán và độc đáo
const MainQuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-300">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A6.75 6.75 0 0015.75 12c0 1.864-1.12 3.513-2.858 4.662a.75.75 0 10.929 1.234A8.25 8.25 0 0017.25 12c0-2.286-1.42-4.33-3.645-5.382a.75.75 0 00-.642-1.332z" clipRule="evenodd" />
        <path d="M11.75 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" />
        <path d="M3 10.035a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
    </svg>
);
const SideQuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cyan-300">
        <path fillRule="evenodd" d="M10.5 3.75a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.06l-4.72 4.72a.75.75 0 01-1.06-1.06L8.19 5.25H4.5a.75.75 0 010-1.5h6zM13.5 18.75a.75.75 0 00-.75-.75H9.81l4.72-4.72a.75.75 0 10-1.06-1.06L8.75 16.94V13.5a.75.75 0 00-1.5 0v6a.75.75 0 00.75.75h6a.75.75 0 00.75-.75z" clipRule="evenodd" />
    </svg>
);
const CraftingQuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-lime-300">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.623 7.23a.75.75 0 01.635-1.157 11.193 11.193 0 013.978 1.157.75.75 0 01-.635 1.157 9.693 9.693 0 00-2.708-.998.75.75 0 01-.635-1.157zM8.25 12c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v.375c0 .621-.504 1.125-1.125 1.125h-5.25A1.125 1.125 0 018.25 12.375V12zm-2.659 5.03a.75.75 0 10-1.182.872 9.735 9.735 0 002.363 2.362.75.75 0 10.872-1.182 8.235 8.235 0 01-2.053-2.052zM17.47 18.082a.75.75 0 10.872 1.182 9.735 9.735 0 002.363-2.362.75.75 0 10-1.182-.872 8.235 8.235 0 01-2.053 2.052z" clipRule="evenodd" />
    </svg>
);

const LocationPinIcon = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.223.654-.369.64-.37 1.439-.823 2.433-1.48.991-.655 2.22-1.511 3.42-2.734a11.247 11.247 0 002.452-4.132c.162-1.385.116-2.673-.127-3.86a5.002 5.002 0 00-4.04-4.04c-1.187-.243-2.475-.209-3.86.127a11.247 11.247 0 00-4.132 2.452c-1.224 1.223-2.08 2.443-2.734 3.42C2.35 12.44 1.8 13.239 1.43 13.879c-.147.254-.27.468-.37.654a5.741 5.741 0 00-.14.281l-.008.018-.003.006zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
    </svg>
);

// --- DỮ LIỆU MẪU ĐƯỢC MỞ RỘNG ---
const initialQuests = [
  { id: 1, title: 'Tiêu Diệt Rồng Lửa', description: 'Bà chúa lửa Ignis đã thức giấc tại Hẻm Núi Hắc Hỏa. Hãy tiến vào hang ổ của nó và dập tắt ngọn lửa hung tàn.', lore: 'Truyền thuyết kể rằng, máu của Ignis có thể tôi luyện nên những vũ khí bất hoại.', status: 'Đang làm', progress: 65, rewards: { xp: 500, gold: 250, items: ['Vảy Rồng Lửa', 'Tim Rồng'] }, type: 'Chính tuyến', level: 'Khó', location: 'Hẻm Núi Hắc Hỏa', tracked: true },
  { id: 2, title: 'Thu Thập Thảo Dược Hiếm', description: 'Tìm 10 đóa Hoa Sương Mai trong Khu Rừng Ánh Trăng để bào chế thuốc giải độc cho trưởng làng Elara.', lore: 'Loài hoa này chỉ nở dưới ánh trăng tròn, tỏa ra một thứ ánh sáng xanh dịu nhẹ.', status: 'Mới', progress: 0, rewards: { xp: 150, gold: 50, items: ['Thuốc Giải Độc Cấp 1'] }, type: 'Phụ', level: 'Dễ', location: 'Rừng Ánh Trăng', tracked: false },
  { id: 3, title: 'Giải Cứu Dân Làng', description: 'Một nhóm cướp Răng Đen đã tấn công làng Woodhaven. Hãy đánh bại chúng và giải cứu các con tin.', lore: 'Dân làng Woodhaven nổi tiếng với tài làm mộc và lòng hiếu khách.', status: 'Đang làm', progress: 30, rewards: { xp: 300, gold: 100, items: ['Bùa Hộ Mệnh Của Dân Làng'] }, type: 'Chính tuyến', level: 'Trung bình', location: 'Làng Woodhaven', tracked: false },
  { id: 4, title: 'Chế Tạo Thanh Kiếm Bão Tố', description: 'Rèn một vũ khí huyền thoại bằng cách thu thập 3 Lõi Sét từ Đỉnh Gió Hú và 5 Tinh Thể Gió từ Hang Động Vọng Âm.', lore: 'Thanh kiếm được cho là có thể điều khiển sấm sét, là nỗi khiếp sợ của kẻ thù.', status: 'Hoàn thành', progress: 100, rewards: { xp: 1000, gold: 0, items: ['Kiếm Bão Tố'] }, type: 'Chế tạo', level: 'Sử thi', location: 'Lò Rèn Cổ', tracked: false },
  { id: 5, title: 'Bí Mật Cổ Thư', description: 'Giải mã những ký tự cổ trong cuốn sách tìm được tại Thư Viện Cấm.', lore: 'Cuốn sách dường như chỉ ra vị trí của một di vật đã thất lạc từ lâu.', status: 'Mới', progress: 0, rewards: { xp: 400, gold: 50, items: ['Bản Đồ Cổ'] }, type: 'Phụ', level: 'Khó', location: 'Thư Viện Cấm', tracked: false },
];

const questTypeIcons = {
  'Chính tuyến': <MainQuestIcon />,
  'Phụ': <SideQuestIcon />,
  'Chế tạo': <CraftingQuestIcon />,
};

// --- COMPONENTS ---

// Component Bộ Lọc
const FilterControls = ({ filters, setFilters }) => {
  const FilterButton = ({ type, value, children }) => (
    <button
      onClick={() => setFilters(prev => ({ ...prev, [type]: value }))}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${filters[type] === value ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-black/20 rounded-t-xl border-b border-slate-700/50">
      <div>
        <span className="text-sm font-bold text-slate-400 mr-3">Trạng thái:</span>
        <div className="inline-flex gap-2">
          <FilterButton type="status" value="all">Tất cả</FilterButton>
          <FilterButton type="status" value="Đang làm">Đang làm</FilterButton>
          <FilterButton type="status" value="Mới">Mới</FilterButton>
          <FilterButton type="status" value="Hoàn thành">Hoàn thành</FilterButton>
        </div>
      </div>
       <div className="h-6 w-px bg-slate-700/50"></div>
      <div>
        <span className="text-sm font-bold text-slate-400 mr-3">Loại:</span>
        <div className="inline-flex gap-2">
          <FilterButton type="type" value="all">Tất cả</dFilterButton>
          <FilterButton type="type" value="Chính tuyến">Chính tuyến</FilterButton>
          <FilterButton type="type" value="Phụ">Phụ</FilterButton>
          <FilterButton type="type" value="Chế tạo">Chế tạo</FilterButton>
        </div>
      </div>
    </div>
  );
};

// Component Item trong danh sách nhiệm vụ
const QuestListItem = ({ quest, onSelect, isSelected }) => {
  const statusColors = {
    'Hoàn thành': 'bg-green-500',
    'Đang làm': 'bg-blue-500',
    'Mới': 'bg-yellow-500',
  };
  return (
    <div
      onClick={() => onSelect(quest.id)}
      className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 border-l-4 ${isSelected ? 'bg-slate-700/50 border-amber-400' : 'bg-transparent border-transparent hover:bg-slate-800/60'}`}
    >
      <div className="flex-shrink-0">{questTypeIcons[quest.type]}</div>
      <div className="flex-grow">
        <h3 className={`font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>{quest.title}</h3>
        <p className="text-sm text-slate-400">{quest.type}</p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[quest.status]}`}></div>
    </div>
  );
};

// Component Chi tiết nhiệm vụ
const QuestDetail = ({ quest, onTrack, onUntrack }) => {
  if (!quest) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 p-8">
        <p>Chọn một nhiệm vụ để xem chi tiết.</p>
      </div>
    );
  }

  const levelColors = { 'Dễ': 'text-green-400', 'Trung bình': 'text-yellow-400', 'Khó': 'text-orange-400', 'Sử thi': 'text-purple-400' };

  return (
    <div className="p-6 md:p-8 overflow-y-auto h-full bg-black/10">
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-4 mb-6">
        <div className="flex justify-between items-start">
            <div>
                 <p className={`font-bold text-sm mb-1 ${levelColors[quest.level]}`}>{quest.level.toUpperCase()}</p>
                 <h1 className="text-3xl font-bold text-amber-200 font-serif tracking-wider">{quest.title}</h1>
            </div>
            {quest.status === "Hoàn thành" && (
                <div className="text-sm font-bold uppercase px-3 py-1 bg-green-500/20 text-green-300 border border-green-400/50 rounded-md">
                    Đã Hoàn Thành
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
          <LocationPinIcon />
          <span>{quest.location}</span>
        </div>
      </div>

      {/* Description & Lore */}
      <div className="space-y-4 mb-6">
        <p className="text-slate-300 leading-relaxed">{quest.description}</p>
        <p className="italic text-slate-400/80 border-l-2 border-slate-600 pl-4">"{quest.lore}"</p>
      </div>
      
      {/* Progress */}
      {quest.status !== "Mới" && quest.status !== "Hoàn thành" && (
         <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5 text-sm">
                <span className="font-medium text-slate-300">Tiến độ</span>
                <span className="font-bold text-cyan-300">{quest.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full" style={{ width: `${quest.progress}%` }}></div>
            </div>
        </div>
      )}

      {/* Rewards */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-slate-200 mb-3 font-serif">Phần thưởng</h4>
        <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2 rounded-md border border-slate-700">
                <span className="font-bold text-yellow-400">XP</span>
                <span className="text-slate-200">{quest.rewards.xp}</span>
            </div>
             {quest.rewards.gold > 0 && (
                <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2 rounded-md border border-slate-700">
                    <span className="font-bold text-amber-500">Vàng</span>
                    <span className="text-slate-200">{quest.rewards.gold}</span>
                </div>
             )}
             {quest.rewards.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-800/70 px-4 py-2 rounded-md border border-slate-700">
                    <span className="font-bold text-sky-400">Vật phẩm</span>
                    <span className="text-slate-200">{item}</span>
                </div>
             ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-700/50">
        {quest.status === 'Hoàn thành' ? (
          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors">Lĩnh Thưởng</button>
        ) : quest.tracked ? (
          <button onClick={() => onUntrack(quest.id)} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition-colors">Bỏ Theo Dõi</button>
        ) : (
          <button onClick={() => onTrack(quest.id)} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-lg transition-colors">Theo Dõi Nhiệm Vụ</button>
        )}
      </div>
    </div>
  );
};


// --- COMPONENT CHÍNH ---
export default function QuestLog() {
  const [quests, setQuests] = useState(initialQuests);
  const [selectedQuestId, setSelectedQuestId] = useState(initialQuests.find(q => q.tracked)?.id || initialQuests[0]?.id || null);
  const [filters, setFilters] = useState({ status: 'all', type: 'all' });
  
  const handleTrackQuest = (id) => {
    setQuests(quests.map(q => q.id === id ? { ...q, tracked: true, status: q.status === 'Mới' ? 'Đang làm' : q.status } : q));
  };

  const handleUntrackQuest = (id) => {
    setQuests(quests.map(q => q.id === id ? { ...q, tracked: false } : q));
  };
  
  const filteredQuests = useMemo(() => {
    return quests
      .filter(q => filters.status === 'all' || q.status === filters.status)
      .filter(q => filters.type === 'all' || q.type === filters.type)
      .filter(q => !q.tracked); // Không hiển thị quest đã được theo dõi trong danh sách chung
  }, [quests, filters]);

  const trackedQuests = useMemo(() => quests.filter(q => q.tracked), [quests]);
  const selectedQuest = useMemo(() => quests.find(q => q.id === selectedQuestId), [quests, selectedQuestId]);
  
  return (
    <div className="min-h-screen bg-zinc-900 font-sans text-white p-4 md:p-8 flex justify-center items-center" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')" }}>
      <div className="w-full max-w-6xl mx-auto h-[85vh] max-h-[900px] flex flex-col md:flex-row bg-slate-900/70 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/50 border border-slate-700/50 overflow-hidden">
        
        {/* Cột Trái: Danh sách nhiệm vụ */}
        <div className="w-full md:w-1/3 flex flex-col border-r border-slate-700/50">
          <header className="p-4 text-center border-b border-slate-700/50">
            <h1 className="text-2xl font-bold text-amber-200 font-serif">Sổ Nhiệm Vụ</h1>
          </header>
          
          <div className="overflow-y-auto flex-grow">
            {/* Nhiệm vụ đang theo dõi */}
            {trackedQuests.length > 0 && (
                <div className="border-b-2 border-amber-400/30">
                    <h2 className="text-xs uppercase font-bold text-amber-300 p-3 bg-amber-400/10">Đang Theo Dõi</h2>
                    {trackedQuests.map(quest => (
                        <QuestListItem key={quest.id} quest={quest} onSelect={setSelectedQuestId} isSelected={selectedQuestId === quest.id} />
                    ))}
                </div>
            )}
            
            {/* Tất cả nhiệm vụ */}
            <div>
                 <h2 className="text-xs uppercase font-bold text-slate-400 p-3 bg-black/10">Tất Cả Nhiệm Vụ</h2>
                 {filteredQuests.map(quest => (
                    <QuestListItem key={quest.id} quest={quest} onSelect={setSelectedQuestId} isSelected={selectedQuestId === quest.id} />
                 ))}
                 {filteredQuests.length === 0 && (
                    <p className="text-center text-slate-500 p-6">Không có nhiệm vụ nào phù hợp.</p>
                 )}
            </div>
          </div>

          <FilterControls filters={filters} setFilters={setFilters} />
        </div>

        {/* Cột Phải: Chi tiết nhiệm vụ */}
        <div className="w-full md:w-2/3">
          <QuestDetail quest={selectedQuest} onTrack={handleTrackQuest} onUntrack={handleUntrackQuest} />
        </div>
      </div>
    </div>
  );
}
