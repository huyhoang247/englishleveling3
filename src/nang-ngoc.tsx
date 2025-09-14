import React, { useState, useMemo, useEffect } from 'react';

// --- BẮT ĐẦU: SAO CHÉP TỪ EQUIPMENT-UI.TSX ---
// Các định nghĩa về Rarity để đồng bộ với hệ thống trang bị
export type ItemRank = 'E' | 'D' | 'B' | 'A' | 'S' | 'SR' | 'SSR';
export const RARITY_ORDER: ItemRank[] = ['E', 'D', 'B', 'A', 'S', 'SR', 'SSR'];

const getRarityColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'border-red-500';
        case 'SR': return 'border-orange-400';
        case 'S': return 'border-yellow-400';
        case 'A': return 'border-purple-500';
        case 'B': return 'border-blue-500';
        case 'D': return 'border-green-500';
        case 'E': return 'border-gray-500';
        default: return 'border-gray-600';
    }
};

const getRarityTextColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'text-red-500';
        case 'SR': return 'text-orange-400';
        case 'S': return 'text-yellow-400';
        case 'A': return 'text-purple-400';
        case 'B': return 'text-blue-400';
        case 'D': return 'text-green-400';
        case 'E': return 'text-gray-400';
        default: return 'text-gray-500';
    }
};

const getRarityGradient = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'from-red-900/80 to-slate-900';
        case 'SR': return 'from-orange-900/80 to-slate-900';
        case 'S': return 'from-yellow-900/80 to-slate-900';
        case 'A': return 'from-purple-900/80 to-slate-900';
        case 'B': return 'from-blue-900/80 to-slate-900';
        case 'D': return 'from-green-900/80 to-slate-900';
        case 'E': return 'from-gray-800/80 to-slate-900';
        default: return 'from-gray-900 to-slate-900';
    }
};

const getNextRank = (rank: ItemRank): ItemRank | null => {
    const currentIndex = RARITY_ORDER.indexOf(rank);
    if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) return null;
    return RARITY_ORDER[currentIndex + 1];
};
// --- KẾT THÚC: SAO CHÉP TỪ EQUIPMENT-UI.TSX ---


// --- DỮ LIỆU CẤU HÌNH CÂY KỸ NĂNG (Layout 1-2-1-2-1) ---
// THAY ĐỔI: Thêm thuộc tính 'rank' cho mỗi ngọc
const INITIAL_SKILL_DATA = {
  'root': { id: 'root', name: 'Khởi Nguyên', description: 'Nguồn gốc của mọi sức mạnh.', icon: '✨', cost: 0, dependencies: [], position: { x: '50%', y: '100px' }, status: 'activated', rank: 'S' as ItemRank },
  
  // Hàng 2: Nhánh cơ bản
  'str1': { id: 'str1', name: 'Sức Mạnh Sơ Cấp', description: '+5 Sức mạnh.', icon: '⚔️', cost: 1, dependencies: ['root'], position: { x: 'calc(50% - 120px)', y: '230px' }, status: 'available', rank: 'E' as ItemRank },
  'int1': { id: 'int1', name: 'Trí Tuệ Sơ Cấp', description: '+5 Trí tuệ.', icon: '🔮', cost: 1, dependencies: ['root'], position: { x: 'calc(50% + 120px)', y: '230px' }, status: 'available', rank: 'E' as ItemRank },
  
  // Hàng 3: Nút thắt trung tâm
  'fortitude': { id: 'fortitude', name: 'Kiên Cố', description: '+10 Giáp & +10 Kháng phép.', icon: '🧱', cost: 2, dependencies: ['str1', 'int1'], position: { x: '50%', y: '360px' }, status: 'locked', rank: 'E' as ItemRank },
  
  // Hàng 4: Nhánh nâng cao
  'berserker': { id: 'berserker', name: 'Chiến Binh Điên Cuồng', description: '+20 Sức mạnh, +10% Tốc độ đánh.', icon: '🔥', cost: 3, dependencies: ['fortitude'], position: { x: 'calc(50% - 120px)', y: '490px' }, status: 'locked', rank: 'E' as ItemRank },
  'archmage': { id: 'archmage', name: 'Đại Pháp Sư', description: '+20 Trí tuệ, -10% Năng lượng tiêu hao.', icon: '⚡', cost: 3, dependencies: ['fortitude'], position: { x: 'calc(50% + 120px)', y: '490px' }, status: 'locked', rank: 'E' as ItemRank },
  
  // Hàng 5: Ngọc cuối cùng
  'ult1': { id: 'ult1', name: 'Thần Lực', description: '+25 tất cả chỉ số.', icon: '🌟', cost: 5, dependencies: ['berserker', 'archmage'], position: { x: '50%', y: '620px' }, status: 'locked', rank: 'E' as ItemRank },
};

const INITIAL_POINTS = 15;

const playSfx = (type) => console.log(`Playing sound: ${type}`);

// --- COMPONENT CON ---
const Tooltip = ({ skill, position }) => {
  if (!skill) return null;
  return (
    <div
      className={`absolute bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg z-30 border ${getRarityColor(skill.rank)} max-w-xs text-center transform -translate-x-1/2 -translate-y-full mt-[-15px]`}
      style={{ left: position.x, top: position.y }}
    >
      <h3 className={`text-lg font-bold ${getRarityTextColor(skill.rank)} flex items-center justify-center gap-2`}><span className="text-2xl">{skill.icon}</span> {skill.name}</h3>
      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block my-1.5 ${getRarityTextColor(skill.rank)} bg-black/30 border ${getRarityColor(skill.rank)}`}>Hạng {skill.rank}</div>
      <p className="text-sm text-gray-200 my-1">{skill.description}</p>
      {skill.cost > 0 && <p className="text-base font-semibold text-cyan-300">Yêu cầu: {skill.cost} điểm</p>}
    </div>
  );
};

const Toast = ({ message, onDone }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDone(), 2000);
        return () => clearTimeout(timer);
    }, [onDone]);
    return <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white font-semibold shadow-2xl z-50 animate-fade-in-down ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message.text}</div>
}

const ConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-yellow-500 rounded-lg p-6 m-4 shadow-xl text-center">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">Bạn chắc chắn chứ?</h2>
            <p className="text-gray-300 mb-6">Mọi tiến trình sẽ được làm mới.</p>
            <div className="flex justify-center gap-4"><button onClick={onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-md font-bold transition-colors">Xác Nhận</button><button onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-colors">Hủy Bỏ</button></div>
        </div>
    </div>
);

// --- COMPONENT CHÍNH ---
export default function App() {
  const [skills, setSkills] = useState(JSON.parse(JSON.stringify(INITIAL_SKILL_DATA)));
  const [skillPoints, setSkillPoints] = useState(INITIAL_POINTS);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [shakingSkillId, setShakingSkillId] = useState(null);
  const [activatedParticles, setActivatedParticles] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSkillClick = (skillId) => {
    const clickedSkill = skills[skillId];
    if (!clickedSkill) return;
    if (clickedSkill.status === 'locked') { setToastMessage({ text: 'Ngọc này đã bị khóa!', type: 'error' }); triggerShake(skillId); playSfx('error'); return; }
    if (clickedSkill.status === 'activated') return;
    if (skillPoints < clickedSkill.cost) { setToastMessage({ text: 'Không đủ điểm kỹ năng!', type: 'error' }); triggerShake(skillId); playSfx('error'); return; }
    
    playSfx('activate');
    setSkillPoints((prev) => prev - clickedSkill.cost);
    triggerActivationFx(skillId);

    setSkills((prevSkills) => {
      const newSkills = { ...prevSkills };
      const currentRank = newSkills[skillId].rank;
      const nextRank = getNextRank(currentRank) || currentRank; // Nâng hạng
      
      // Cập nhật ngọc vừa được nhấn: chuyển status và nâng rank
      newSkills[skillId] = { ...newSkills[skillId], status: 'activated', rank: nextRank };
      
      // Mở khóa các ngọc phụ thuộc
      Object.values(newSkills).forEach((skill) => {
        if (skill.status === 'locked' && skill.dependencies.every((depId) => newSkills[depId]?.status === 'activated')) {
          // Ngọc mới mở khóa sẽ có hạng 'E'
          newSkills[skill.id] = { ...skill, status: 'available', rank: 'E' };
        }
      });
      return newSkills;
    });
  };

  const handleReset = () => {
      setSkills(JSON.parse(JSON.stringify(INITIAL_SKILL_DATA)));
      setSkillPoints(INITIAL_POINTS);
      setIsResetModalOpen(false);
      setToastMessage({text: 'Bảng ngọc đã được làm mới!', type: 'success'});
  }

  const triggerShake = (skillId) => { setShakingSkillId(skillId); setTimeout(() => setShakingSkillId(null), 500); };
  
  const triggerActivationFx = (skillId) => {
      const newParticles = Array.from({length: 10}).map(() => ({
          id: Math.random(), skillId, style: { '--x': `${(Math.random() - 0.5) * 200}%`, '--y': `${(Math.random() - 0.5) * 200}%`, '--duration': `${0.5 + Math.random() * 0.5}s`, '--delay': `${Math.random() * 0.2}s` }
      }));
      setActivatedParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => setActivatedParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id))), 1000);
  }

  // THAY ĐỔI: Hàm tạo class cho ngọc dựa trên status và rank
  const getNodeClasses = (skill) => {
    const baseClasses = 'absolute w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300 border-4 transform -translate-x-1/2 -translate-y-1/2 group';
    
    switch (skill.status) {
        case 'locked':
            return `${baseClasses} border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed`;
        case 'available':
            // Ngọc có thể nâng cấp sẽ có màu hạng 'E' và hiệu ứng pulse
            return `${baseClasses} ${getRarityColor('E')} bg-slate-900 text-white cursor-pointer animate-pulse hover:scale-110`;
        case 'activated':
            const rarityColor = getRarityColor(skill.rank).replace('border-', '');
            const shadowStyle = { boxShadow: `0 0 15px -2px var(--tw-color-${rarityColor}), 0 0 8px -4px var(--tw-color-${rarityColor})` };
            // Ngọc đã nâng cấp sẽ có màu theo hạng đã đạt được
            return {
                className: `${baseClasses} ${getRarityColor(skill.rank)} text-white cursor-default`,
                style: { ...shadowStyle }
            };
        default:
            return baseClasses;
    }
  };

  const totalStats = useMemo(() => {
    let stats = { str: 0, int: 0, def: 0, res: 0 };
    const activatedSkills = Object.values(skills).filter(s => s.status === 'activated');
    for (const s of activatedSkills) {
        if(s.id === 'root') continue; // Bỏ qua ngọc gốc vì không cộng chỉ số
        switch(s.id) {
            case 'str1': stats.str += 5; break;
            case 'int1': stats.int += 5; break;
            case 'fortitude': stats.def += 10; stats.res += 10; break;
            case 'berserker': stats.str += 20; break;
            case 'archmage': stats.int += 20; break;
            case 'ult1': stats.str += 25; stats.int += 25; stats.def += 25; stats.res += 25; break;
        }
    }
    return stats;
  }, [skills]);

  return (
    <>
      <style>{`
        @keyframes nebula { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .bg-nebula { background: linear-gradient(270deg, #0f0c29, #302b63, #24243e, #0f0c29); background-size: 600% 600%; animation: nebula 30s ease infinite; }
        @keyframes shake { 0%, 100% { transform: translate(-50%, -50%) translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-5px); } 20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(5px); } }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes activate-particle { 0% { transform: scale(1) translate(0, 0); opacity: 1; } 100% { transform: scale(0) translate(var(--x), var(--y)); opacity: 0; } }
        .particle { animation: activate-particle var(--duration) var(--delay) forwards; }
        @keyframes fade-in-down { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(253, 224, 71, 0.5); border-radius: 10px; }
      `}</style>
      <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center bg-nebula h-screen max-h-screen overflow-hidden">
        <script src="https://cdn.tailwindcss.com"></script>

        {isResetModalOpen && <ConfirmationModal onConfirm={handleReset} onCancel={() => setIsResetModalOpen(false)}/>}
        {toastMessage && <Toast message={toastMessage} onDone={() => setToastMessage(null)}/>}

        <header className="w-full text-center p-4 bg-black bg-opacity-20 backdrop-blur-sm z-20 shrink-0">
          <h1 className="text-3xl font-bold text-yellow-300 tracking-wider [text-shadow:0_0_15px_rgba(253,224,71,0.5)]">BẢNG NGỌC</h1>
          <div className="flex items-center justify-center gap-6 mt-2">
              <p className="text-md text-cyan-300">Điểm: <span className="font-bold text-xl">{skillPoints}</span></p>
              <button onClick={() => setIsResetModalOpen(true)} className="bg-gray-700 text-xs px-3 py-1 rounded-md hover:bg-red-600 transition-colors">Làm Mới</button>
          </div>
        </header>

        <main className="w-full flex-grow relative overflow-y-auto custom-scrollbar">
            <div className="relative w-full h-[780px] p-4 box-border">
                {hoveredSkill && <Tooltip skill={hoveredSkill.skill} position={hoveredSkill.pos} />}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" z-index="1">
                {Object.values(skills).map(skill => skill.dependencies.map(depId => {
                    const parent = skills[depId];
                    if (!parent) return null;
                    const isActivated = skill.status !== 'locked' && parent.status === 'activated';
                    const lineColor = parent.status === 'activated' && skill.status === 'activated' ? getRarityColor(skill.rank).replace('border-','stroke-') : 'stroke-gray-600';
                    const filterColor = parent.status === 'activated' && skill.status === 'activated' ? getRarityColor(skill.rank).replace('border-','') : '';
                    return <line key={`${depId}-${skill.id}`} x1={parent.position.x} y1={parent.position.y} x2={skill.position.x} y2={skill.position.y} className={`transition-all duration-500 ${isActivated ? `stroke-yellow-400 [filter:drop-shadow(0_0_3px_var(--tw-color-${filterColor}))]` : 'stroke-gray-600'}`} strokeWidth="3" />;
                }))}
                </svg>

                {Object.values(skills).map((skill) => {
                    const nodeStyle = getNodeClasses(skill);
                    const classes = typeof nodeStyle === 'string' ? nodeStyle : nodeStyle.className;
                    const inlineStyle = typeof nodeStyle === 'string' ? {} : nodeStyle.style;

                    return (
                        <div key={skill.id}
                            className={`${classes} ${shakingSkillId === skill.id ? 'shake' : ''}`}
                            style={{ left: skill.position.x, top: skill.position.y, zIndex: 10, ...inlineStyle }}
                            onClick={() => handleSkillClick(skill.id)}
                            onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const containerRect = e.currentTarget.parentElement.getBoundingClientRect(); setHoveredSkill({ skill, pos: { x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top } }); }}
                            onMouseLeave={() => setHoveredSkill(null)}>
                            
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${skill.status === 'activated' ? getRarityGradient(skill.rank) : 'from-white/10 to-transparent'}`}></div>

                            <span className="z-10">{skill.icon}</span>

                            {skill.status === 'available' && <div className="absolute -top-1 -right-1 bg-cyan-400 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900">{skill.cost}</div>}
                            
                            {activatedParticles.filter(p => p.skillId === skill.id).map(p => <div key={p.id} className="absolute w-2 h-2 bg-yellow-300 rounded-full particle" style={p.style}></div>)}
                        </div>
                    );
                })}
            </div>
        </main>

        <footer className="w-full p-3 bg-black bg-opacity-20 backdrop-blur-sm z-20 shrink-0">
            <h2 className="text-sm font-bold text-center text-yellow-300 mb-2">Chỉ Số Cộng Thêm</h2>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-red-900/50 p-2 rounded-lg"><p className="text-red-200">S.Mạnh</p><p className="text-lg font-bold">+{totalStats.str}</p></div>
                <div className="bg-blue-900/50 p-2 rounded-lg"><p className="text-blue-200">T.Tuệ</p><p className="text-lg font-bold">+{totalStats.int}</p></div>
                <div className="bg-green-900/50 p-2 rounded-lg"><p className="text-green-200">Giáp</p><p className="text-lg font-bold">+{totalStats.def}</p></div>
                <div className="bg-purple-900/50 p-2 rounded-lg"><p className="text-purple-200">K.Phép</p><p className="text-lg font-bold">+{totalStats.res}</p></div>
            </div>
        </footer>
      </div>
    </>
  );
}
