import React, { useState, useMemo, useEffect } from 'react';

// --- DỮ LIỆU CẤU HÌNH CÂY KỸ NĂNG ---
const INITIAL_SKILL_DATA = {
  'root': { id: 'root', name: 'Khởi Nguyên', description: 'Nguồn gốc của mọi sức mạnh.', icon: '✨', cost: 0, dependencies: [], position: { x: '50%', y: '80px' }, status: 'activated' },
  'str1': { id: 'str1', name: 'Sức Mạnh Cơ Bản', description: '+5 Sức mạnh. Tăng sát thương vật lý.', icon: '⚔️', cost: 1, dependencies: ['root'], position: { x: 'calc(50% - 150px)', y: '180px' }, status: 'available' },
  'str2': { id: 'str2', name: 'Đấu Sĩ', description: '+10 Sức mạnh. Tăng thêm 5% tốc độ đánh.', icon: '💪', cost: 2, dependencies: ['str1'], position: { x: 'calc(50% - 250px)', y: '280px' }, status: 'locked' },
  'str3': { id: 'str3', name: 'Cuồng Nộ', description: '+15 Sức mạnh. Đòn đánh có 10% cơ hội gây choáng.', icon: '🔥', cost: 3, dependencies: ['str2'], position: { x: 'calc(50% - 350px)', y: '380px' }, status: 'locked' },
  'int1': { id: 'int1', name: 'Trí Tuệ Sơ Cấp', description: '+5 Trí tuệ. Tăng sát thương phép thuật.', icon: '🔮', cost: 1, dependencies: ['root'], position: { x: 'calc(50% + 150px)', y: '180px' }, status: 'available' },
  'int2': { id: 'int2', name: 'Pháp Sư', description: '+10 Trí tuệ. Tăng thêm 5% năng lượng tối đa.', icon: '📜', cost: 2, dependencies: ['int1'], position: { x: 'calc(50% + 250px)', y: '280px' }, status: 'locked' },
  'int3': { id: 'int3', name: 'Bão Điện Từ', description: '+15 Trí tuệ. Kỹ năng có 10% cơ hội giảm hồi chiêu.', icon: '⚡', cost: 3, dependencies: ['int2'], position: { x: 'calc(50% + 350px)', y: '380px' }, status: 'locked' },
  'def1': { id: 'def1', name: 'Phòng Ngự Vững Chắc', description: '+10 Giáp và +10 Kháng phép.', icon: '🛡️', cost: 2, dependencies: ['str2', 'int2'], position: { x: '50%', y: '380px' }, status: 'locked' },
  'ult1': { id: 'ult1', name: 'Thần Lực', description: '+20 tất cả chỉ số. Mở khóa sức mạnh tối thượng.', icon: '🌟', cost: 5, dependencies: ['def1', 'str3', 'int3'], position: { x: '50%', y: '520px' }, status: 'locked' },
};

const INITIAL_POINTS = 10;

// --- MÔ PHỎNG ÂM THANH ---
// Trong thực tế, bạn sẽ dùng thư viện như Howler.js
const playSfx = (type) => {
  console.log(`Playing sound: ${type}`);
  // VD: const sound = new Audio(`/sounds/${type}.mp3`); sound.play();
};


// --- COMPONENT CON ---

// Tooltip hiển thị thông tin
const Tooltip = ({ skill, position }) => {
  if (!skill) return null;
  return (
    <div
      className="absolute bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg z-30 border border-yellow-500 max-w-xs text-center transform -translate-x-1/2 -translate-y-full mt-[-15px]"
      style={{ left: position.x, top: position.y }}
    >
      <h3 className="text-lg font-bold text-yellow-300 flex items-center justify-center gap-2">
        <span className="text-2xl">{skill.icon}</span> {skill.name}
      </h3>
      <p className="text-sm text-gray-200 my-1">{skill.description}</p>
      {skill.cost > 0 && <p className="text-base font-semibold text-cyan-300">Yêu cầu: {skill.cost} điểm</p>}
    </div>
  );
};

// Thông báo nhanh (Toast)
const Toast = ({ message, onDone }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDone();
        }, 2000); // Tự động biến mất sau 2 giây
        return () => clearTimeout(timer);
    }, [onDone]);

    const colors = {
        error: 'bg-red-500 border-red-400',
        success: 'bg-green-500 border-green-400'
    }

    return (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white font-semibold shadow-2xl z-50 animate-fade-in-up ${colors[message.type] || 'bg-gray-700'}`}>
            {message.text}
        </div>
    )
}

// Modal xác nhận
const ConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-yellow-500 rounded-lg p-8 shadow-xl text-center">
                <h2 className="text-2xl font-bold text-yellow-300 mb-4">Bạn chắc chắn chứ?</h2>
                <p className="text-gray-300 mb-6">Mọi tiến trình nâng cấp sẽ được làm mới.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-md font-bold transition-colors">Xác Nhận</button>
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-colors">Hủy Bỏ</button>
                </div>
            </div>
        </div>
    );
};


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

    // --- KIỂM TRA ĐIỀU KIỆN & PHẢN HỒI LỖI ---
    if (clickedSkill.status === 'locked') {
        setToastMessage({ text: 'Ngọc này đã bị khóa!', type: 'error' });
        triggerShake(skillId);
        playSfx('error');
        return;
    }
    if (clickedSkill.status === 'activated') {
        return; // Không làm gì nếu đã kích hoạt
    }
    if (skillPoints < clickedSkill.cost) {
        setToastMessage({ text: 'Không đủ điểm kỹ năng!', type: 'error' });
        triggerShake(skillId);
        playSfx('error');
        return;
    }

    // --- NÂNG CẤP THÀNH CÔNG ---
    playSfx('activate');
    setSkillPoints((prev) => prev - clickedSkill.cost);
    triggerActivationFx(skillId);

    setSkills((prevSkills) => {
      const newSkills = { ...prevSkills };
      newSkills[skillId] = { ...newSkills[skillId], status: 'activated' };
      Object.values(newSkills).forEach((skill) => {
        if (skill.status === 'locked') {
          const allDependenciesMet = skill.dependencies.every(
            (depId) => newSkills[depId] && newSkills[depId].status === 'activated'
          );
          if (allDependenciesMet) {
            newSkills[skill.id] = { ...skill, status: 'available' };
          }
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

  // Helper function để tạo hiệu ứng rung
  const triggerShake = (skillId) => {
    setShakingSkillId(skillId);
    setTimeout(() => setShakingSkillId(null), 500);
  };
  
  // Helper function để tạo hiệu ứng kích hoạt
  const triggerActivationFx = (skillId) => {
      const newParticles = Array.from({length: 10}).map(() => ({
          id: Math.random(),
          skillId,
          style: {
              '--x': `${(Math.random() - 0.5) * 200}%`,
              '--y': `${(Math.random() - 0.5) * 200}%`,
              '--duration': `${0.5 + Math.random() * 0.5}s`,
              '--delay': `${Math.random() * 0.2}s`,
          }
      }));
      setActivatedParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
          setActivatedParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
      }, 1000);
  }

  // Tính toán chỉ số
  const totalStats = useMemo(() => {
    let stats = { str: 0, int: 0, def: 0, res: 0 };
    Object.values(skills)
      .filter((s) => s.status === 'activated')
      .forEach((s) => {
        if (s.id.startsWith('str')) stats.str += parseInt(s.description.match(/\+(\d+)\s+Sức mạnh/)?.[1] || 0);
        if (s.id.startsWith('int')) stats.int += parseInt(s.description.match(/\+(\d+)\s+Trí tuệ/)?.[1] || 0);
        if (s.id === 'def1') { stats.def += 10; stats.res += 10; }
        if (s.id === 'ult1') { stats.str += 20; stats.int += 20; stats.def += 20; stats.res += 20; }
      });
    return stats;
  }, [skills]);

  return (
    <>
      <style>{`
        @keyframes nebula {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-nebula {
          background: linear-gradient(270deg, #0f0c29, #302b63, #24243e, #0f0c29);
          background-size: 600% 600%;
          animation: nebula 30s ease infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(5px); }
        }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes activate-particle {
          0% { transform: scale(1) translate(0, 0); opacity: 1; }
          100% { transform: scale(0) translate(var(--x), var(--y)); opacity: 0; }
        }
        .particle { animation: activate-particle var(--duration) var(--delay) forwards; }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
      <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center p-4 md:p-8 bg-nebula">
        <script src="https://cdn.tailwindcss.com"></script>

        {/* --- UI HIỂN THỊ --- */}
        {isResetModalOpen && <ConfirmationModal onConfirm={handleReset} onCancel={() => setIsResetModalOpen(false)}/>}
        {toastMessage && <Toast message={toastMessage} onDone={() => setToastMessage(null)}/>}

        <div className="w-full max-w-5xl">
          {/* TIÊU ĐỀ & ĐIỂM */}
          <div className="text-center mb-6 p-4">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 tracking-wider [text-shadow:0_0_15px_rgba(253,224,71,0.5)]">BẢNG NGỌC SỨC MẠNH</h1>
            <div className="flex items-center justify-center gap-6 mt-4">
                <p className="text-lg text-cyan-300">
                    Điểm kỹ năng: <span className="font-bold text-2xl animate-pulse">{skillPoints}</span>
                </p>
                <button onClick={() => setIsResetModalOpen(true)} className="bg-gray-700 text-xs px-3 py-1 rounded-md hover:bg-red-600 transition-colors">
                    Làm Mới
                </button>
            </div>
          </div>

          {/* BẢNG NGỌC */}
          <div className="relative w-full h-[650px] bg-black bg-opacity-30 rounded-2xl shadow-2xl border border-purple-600 backdrop-blur-sm p-4 box-border">
            {hoveredSkill && <Tooltip skill={hoveredSkill.skill} position={hoveredSkill.pos} />}
            
            {/* ĐƯỜNG NỐI */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" z-index="1">
              {Object.values(skills).map(skill =>
                skill.dependencies.map(depId => {
                  const parent = skills[depId];
                  if (!parent) return null;
                  const isActivated = skill.status === 'activated' && parent.status === 'activated';
                  return (
                    <line
                      key={`${depId}-${skill.id}`}
                      x1={parent.position.x} y1={parent.position.y}
                      x2={skill.position.x} y2={skill.position.y}
                      className={`transition-all duration-500 ${isActivated ? 'stroke-yellow-400 [filter:drop-shadow(0_0_3px_#facc15)]' : 'stroke-gray-600'}`}
                      strokeWidth="3"
                    />
                  );
                })
              )}
            </svg>

            {/* CÁC VIÊN NGỌC */}
            {Object.values(skills).map((skill) => {
              const statusClasses = {
                locked: 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed',
                available: 'border-cyan-400 bg-blue-900 text-white cursor-pointer animate-pulse',
                activated: 'border-yellow-300 bg-yellow-500 text-black shadow-[0_0_20px_rgba(253,224,71,0.8)] cursor-default',
              };
              const isShaking = shakingSkillId === skill.id;

              return (
                <div
                  key={skill.id}
                  className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300 border-4 transform -translate-x-1/2 -translate-y-1/2 group ${statusClasses[skill.status]} ${isShaking ? 'shake' : ''}`}
                  style={{ left: skill.position.x, top: skill.position.y, zIndex: 10 }}
                  onClick={() => handleSkillClick(skill.id)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const containerRect = e.currentTarget.parentElement.getBoundingClientRect();
                    setHoveredSkill({ skill, pos: { x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top } });
                  }}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  {/* Lớp trang trí tạo chiều sâu */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="z-10">{skill.icon}</span>
                  {/* Hiển thị chi phí */}
                  {skill.status === 'available' && (
                    <div className="absolute -top-1 -right-1 bg-cyan-400 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900">
                        {skill.cost}
                    </div>
                  )}
                  {/* Hiệu ứng hạt */}
                  {activatedParticles.filter(p => p.skillId === skill.id).map(p => (
                      <div key={p.id} className="absolute w-2 h-2 bg-yellow-300 rounded-full particle" style={p.style}></div>
                  ))}
                </div>
              );
            })}
          </div>
          
          {/* TỔNG CHỈ SỐ */}
          <div className="mt-6 p-4 bg-black bg-opacity-30 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold text-center text-yellow-300 mb-4">Chỉ Số Cộng Thêm</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-red-900/50 p-3 rounded-lg"><p className="text-sm text-red-200">Sức Mạnh</p><p className="text-2xl font-bold">+{totalStats.str}</p></div>
                <div className="bg-blue-900/50 p-3 rounded-lg"><p className="text-sm text-blue-200">Trí Tuệ</p><p className="text-2xl font-bold">+{totalStats.int}</p></div>
                <div className="bg-green-900/50 p-3 rounded-lg"><p className="text-sm text-green-200">Giáp</p><p className="text-2xl font-bold">+{totalStats.def}</p></div>
                <div className="bg-purple-900/50 p-3 rounded-lg"><p className="text-sm text-purple-200">Kháng Phép</p><p className="text-2xl font-bold">+{totalStats.res}</p></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
