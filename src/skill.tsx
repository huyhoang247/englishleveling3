import React, { useState } from 'react';

// --- ICONS (Sử dụng lại các icon SVG đã tạo) ---
const FireballIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.81 4.62C13.25 3.53 14.65 3.53 15.09 4.62L16.2 7.29C16.34 7.6 16.6 7.86 16.91 8L19.58 9.11C20.67 9.55 20.67 10.95 19.58 11.39L16.91 12.5C16.6 12.64 16.34 12.9 16.2 13.21L15.09 15.88C14.65 16.97 13.25 16.97 12.81 15.88L11.7 13.21C11.56 12.9 11.3 12.64 10.99 12.5L8.32 11.39C7.23 10.95 7.23 9.55 8.32 9.11L10.99 8C11.3 7.86 11.56 7.6 11.7 7.29L12.81 4.62Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.18994 18.3C9.62994 17.21 11.0299 17.21 11.4699 18.3L11.9999 19.52C12.1399 19.83 12.3999 20.09 12.7099 20.23L13.9299 20.76C15.0199 21.2 15.0199 22.6 13.9299 23.04L12.7099 23.57C12.3999 23.71 12.1399 23.97 11.9999 24.28L11.4699 25.5C11.0299 26.59 9.62994 26.59 9.18994 25.5L8.65994 24.28C8.51994 23.97 8.25994 23.71 7.94994 23.57L6.72994 23.04C5.63994 22.6 5.63994 21.2 6.72994 20.76L7.94994 20.23C8.25994 20.09 8.51994 19.83 8.65994 19.52L9.18994 18.3Z" transform="scale(0.7) translate(-2, -12)" fill="#fef08a" stroke="#facc15" />
    <path d="M17.19 16.3C17.63 15.21 19.03 15.21 19.47 16.3L19.85 17.17C19.99 17.48 20.25 17.74 20.56 17.88L21.43 18.26C22.52 18.7 22.52 20.1 21.43 20.54L20.56 20.92C20.25 21.06 19.99 21.32 19.85 21.63L19.47 22.5C19.03 23.59 17.63 23.59 17.19 22.5L16.81 21.63C16.67 21.32 16.41 21.06 16.1 20.92L15.23 20.54C14.14 20.1 14.14 18.7 15.23 18.26L16.1 17.88C16.41 17.74 16.67 17.48 16.81 17.17L17.19 16.3Z" transform="scale(0.5) translate(18, -20)" fill="#fed7aa" stroke="#fb923c"/>
  </svg>
);
const IceShardIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L9.13 8.37L2 10.5L7.87 15.63L6.25 22L12 18.5L17.75 22L16.13 15.63L22 10.5L14.87 8.37L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 22L12 11.5L17.75 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.13 8.37L2.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.87 8.37L21.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const HealIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ThunderIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const ShieldIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22S18 18 18 12V5L12 2L6 5V12C6 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- DỮ LIỆU MẪU ---
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ALL_SKILLS: Skill[] = [
  { id: 'fireball', name: 'Quả Cầu Lửa', description: 'Tấn công kẻ địch bằng một quả cầu lửa rực cháy.', icon: <FireballIcon className="w-10 h-10 text-orange-400"/>, color: 'orange' },
  { id: 'ice_shard', name: 'Mảnh Băng', description: 'Làm chậm và gây sát thương lên mục tiêu.', icon: <IceShardIcon className="w-10 h-10 text-cyan-400"/>, color: 'cyan' },
  { id: 'heal', name: 'Hồi Máu', description: 'Phục hồi một lượng máu cho bản thân.', icon: <HealIcon className="w-10 h-10 text-green-400"/>, color: 'green' },
  { id: 'thunder', name: 'Sấm Sét', description: 'Gây sát thương lan lên nhiều kẻ địch.', icon: <ThunderIcon className="w-10 h-10 text-yellow-300"/>, color: 'yellow' },
  { id: 'shield', name: 'Khiên Năng Lượng', description: 'Tạo một lớp khiên chặn sát thương.', icon: <ShieldIcon className="w-10 h-10 text-blue-400"/>, color: 'blue' },
  { id: 'extra1', name: 'Tàng Hình', description: 'Trở nên vô hình trong một khoảng thời gian ngắn.', icon: <svg className="w-10 h-10 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>, color: 'purple' },
  { id: 'extra2', name: 'Tăng Tốc', description: 'Tăng tốc độ di chuyển và tấn công.', icon: <svg className="w-10 h-10 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>, color: 'pink' },
];

// --- CÁC COMPONENT CON ---

const SkillSlot = ({ skill, onClick }: { skill: Skill | null, onClick: () => void }) => {
  const baseClasses = "relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group";
  const borderStyle = skill ? `border-${skill.color}-500/50 hover:border-${skill.color}-400` : 'border-dashed border-slate-600 hover:border-slate-400';
  const backgroundStyle = skill ? 'bg-slate-900/80' : 'bg-slate-900/50';

  return (
    <div className={`${baseClasses} ${borderStyle} ${backgroundStyle}`} onClick={onClick}>
      {skill ? (
        <div className="text-center p-2 flex flex-col items-center gap-2">
          <div className="transition-all duration-300 group-hover:scale-110">
            {skill.icon}
          </div>
          <p className="text-sm font-bold tracking-wider text-white">{skill.name}</p>
        </div>
      ) : (
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )}
    </div>
  );
};

const SkillCard = ({ skill, onClick, isEquipped }: { skill: Skill, onClick: () => void, isEquipped: boolean }) => {
  const baseClasses = "relative w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all duration-200";
  const interactivity = isEquipped ? 'opacity-50 cursor-not-allowed' : `cursor-pointer hover:border-${skill.color}-500 hover:bg-slate-800/50`;
  
  return (
    <div className={`${baseClasses} border-slate-700 bg-slate-900/70 ${interactivity}`} onClick={onClick}>
      {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10"></div>}
      <div className="flex-shrink-0">
        {skill.icon}
      </div>
      <div className="flex-grow">
        <h3 className={`text-lg font-bold text-${skill.color}-400`}>{skill.name}</h3>
        <p className="text-xs text-slate-400">{skill.description}</p>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function SkillEquipScreen() {
  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>([null, null, null]);
  const [message, setMessage] = useState('');

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  };

  // Xử lý khi click vào một skill trong kho để TRANG BỊ
  const handleEquipSkill = (skillToEquip: Skill) => {
    if (equippedSkills.some(s => s?.id === skillToEquip.id)) {
      showMessage("Kỹ năng đã được trang bị.");
      return;
    }

    const firstEmptySlotIndex = equippedSkills.findIndex(slot => slot === null);

    if (firstEmptySlotIndex === -1) {
      showMessage("Các ô kỹ năng đã đầy.");
      return;
    }

    const newEquipped = [...equippedSkills];
    newEquipped[firstEmptySlotIndex] = skillToEquip;
    setEquippedSkills(newEquipped);
  };

  // Xử lý khi click vào một ô đã trang bị để GỠ BỎ
  const handleUnequipSkill = (slotIndex: number) => {
    if (!equippedSkills[slotIndex]) return; // Không làm gì nếu ô trống

    const newEquipped = [...equippedSkills];
    newEquipped[slotIndex] = null;
    setEquippedSkills(newEquipped);
  };


  return (
    <div className="main-bg w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] p-4 flex flex-col items-center font-sans text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .main-bg::before { content: ''; position: absolute; width: 150%; height: 150%; top: 50%; left: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); z-index: 0; pointer-events: none; }
      `}</style>
      
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-50 animate-bounce">
          {message}
        </div>
      )}

      {/* --- Header --- */}
      <header className="w-full max-w-4xl mx-auto z-10 text-center flex-shrink-0 py-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase">Trang Bị Kỹ Năng</h1>
        <p className="text-slate-400 mt-1">Nhấp vào kỹ năng trong kho để trang bị, nhấp vào ô đã chọn để gỡ bỏ.</p>
      </header>
      
      <div className="w-full max-w-4xl mx-auto z-10 flex flex-col items-center gap-6 flex-grow min-h-0 py-4">
        
        {/* --- KHU VỰC TRANG BỊ (3 Ô) --- */}
        <section className="w-full flex-shrink-0">
            <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                {equippedSkills.map((skill, index) => (
                    <SkillSlot 
                        key={index} 
                        skill={skill}
                        onClick={() => handleUnequipSkill(index)}
                    />
                ))}
            </div>
        </section>

        {/* --- TÚI ĐỒ / KHO KỸ NĂNG (Scrollable) --- */}
        <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-cyan-400 mb-4 text-center uppercase tracking-widest flex-shrink-0">Kho Kỹ Năng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                {ALL_SKILLS.map(skill => (
                    <SkillCard
                        key={skill.id}
                        skill={skill}
                        onClick={() => handleEquipSkill(skill)}
                        isEquipped={equippedSkills.some(s => s?.id === skill.id)}
                    />
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
