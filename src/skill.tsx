// --- START OF FILE skill.tsx (4).txt ---

import React, { useState } from 'react';

// --- ICONS ---
const FireballIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.81 4.62C13.25 3.53 14.65 3.53 15.09 4.62L16.2 7.29C16.34 7.6 16.6 7.86 16.91 8L19.58 9.11C20.67 9.55 20.67 10.95 19.58 11.39L16.91 12.5C16.6 12.64 16.34 12.9 16.2 13.21L15.09 15.88C14.65 16.97 13.25 16.97 12.81 15.88L11.7 13.21C11.56 12.9 11.3 12.64 10.99 12.5L8.32 11.39C7.23 10.95 7.23 9.55 8.32 9.11L10.99 8C11.3 7.86 11.56 7.6 11.7 7.29L12.81 4.62Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.18994 18.3C9.62994 17.21 11.0299 17.21 11.4699 18.3L11.9999 19.52C12.1399 19.83 12.3999 20.09 12.7099 20.23L13.9299 20.76C15.0199 21.2 15.0199 22.6 13.9299 23.04L12.7099 23.57C12.3999 23.71 12.1399 23.97 11.9999 24.28L11.4699 25.5C11.0299 26.59 9.62994 26.59 9.18994 25.5L8.65994 24.28C8.51994 23.97 8.25994 23.71 7.94994 23.57L6.72994 23.04C5.63994 22.6 5.63994 21.2 6.72994 20.76L7.94994 20.23C8.25994 20.09 8.51994 19.83 8.65994 19.52L9.18994 18.3Z" transform="scale(0.7) translate(-2, -12)" fill="#fef08a" stroke="#facc15" /> <path d="M17.19 16.3C17.63 15.21 19.03 15.21 19.47 16.3L19.85 17.17C19.99 17.48 20.25 17.74 20.56 17.88L21.43 18.26C22.52 18.7 22.52 20.1 21.43 20.54L20.56 20.92C20.25 21.06 19.99 21.32 19.85 21.63L19.47 22.5C19.03 23.59 17.63 23.59 17.19 22.5L16.81 21.63C16.67 21.32 16.41 21.06 16.1 20.92L15.23 20.54C14.14 20.1 14.14 18.7 15.23 18.26L16.1 17.88C16.41 17.74 16.67 17.48 16.81 17.17L17.19 16.3Z" transform="scale(0.5) translate(18, -20)" fill="#fed7aa" stroke="#fb923c"/> </svg>);
const IceShardIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2L9.13 8.37L2 10.5L7.87 15.63L6.25 22L12 18.5L17.75 22L16.13 15.63L22 10.5L14.87 8.37L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 2V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M2 10.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M6.25 22L12 11.5L17.75 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.13 8.37L2.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M14.87 8.37L21.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const BookIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const SwitchIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10L4 14L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 14L20 10L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

// --- DỮ LIỆU & CẤU HÌNH ---
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
  color: string;
}

const colorMap = {
  orange: { text: 'text-orange-400', border: 'border-orange-500/50 hover:border-orange-400', icon: 'text-orange-400' },
  cyan:   { text: 'text-cyan-400',   border: 'border-cyan-500/50 hover:border-cyan-400',     icon: 'text-cyan-400' },
  //... (các màu khác có thể thêm vào đây)
};

const ALL_SKILLS: Skill[] = [
  { id: 'fireball',    name: 'Quả Cầu Lửa',      description: 'Tấn công kẻ địch bằng một quả cầu lửa rực cháy.', icon: FireballIcon, color: 'orange' },
  { id: 'ice_shard',   name: 'Mảnh Băng',         description: 'Làm chậm và gây sát thương lên mục tiêu.',         icon: IceShardIcon, color: 'cyan' },
  // ... (Thêm các kỹ năng khác vào đây)
];

const CRAFTING_COST = 50;

// --- CÁC COMPONENT CON ---

const SkillSlot = ({ skill, onClick }: { skill: Skill | null, onClick: () => void }) => {
  const baseClasses = "relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group";
  const borderStyle = skill ? colorMap[skill.color]?.border : 'border-dashed border-slate-600 hover:border-slate-400';
  const backgroundStyle = skill ? 'bg-slate-900/80' : 'bg-slate-900/50';
  const IconComponent = skill?.icon;

  return (
    <div className={`${baseClasses} ${borderStyle} ${backgroundStyle}`} onClick={onClick}>
      {skill && IconComponent ? (
        <div className="text-center p-2 flex flex-col items-center gap-2">
          <div className="transition-all duration-300 group-hover:scale-110">
             <IconComponent className={`w-10 h-10 ${colorMap[skill.color]?.icon}`} />
          </div>
          <p className="text-sm font-bold tracking-wider text-white">{skill.name}</p>
        </div>
      ) : (
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </div>
      )}
    </div>
  );
};

// *** NEW *** Component cho ô chế tạo ngẫu nhiên
const TrainSlot = ({ onCraft, canAfford, cost, hasSkillsToCraft }: { onCraft: () => void; canAfford: boolean; cost: number; hasSkillsToCraft: boolean }) => {
  const isDisabled = !canAfford || !hasSkillsToCraft;

  return (
    <div className="w-full max-w-lg mx-auto h-full flex flex-col items-center justify-center p-4 bg-slate-900/50 border-2 border-slate-700 rounded-xl">
        <BookIcon className="w-16 h-16 text-yellow-300/80 mb-4" />
        <h3 className="text-xl font-bold text-white mb-1">Chế Tạo Kỹ Năng</h3>
        <p className="text-slate-400 mb-4 text-center">Sử dụng Sách Cổ để khám phá một kỹ năng ngẫu nhiên.</p>
        <button
            onClick={onCraft}
            disabled={isDisabled}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none"
        >
            <span className="text-lg">Chế Tạo ({cost})</span>
        </button>
        {!hasSkillsToCraft && <p className="text-yellow-400 text-xs mt-2">Bạn đã học tất cả kỹ năng!</p>}
    </div>
  );
};


const SkillCard = ({ skill, onClick, isEquipped }: { skill: Skill, onClick: () => void, isEquipped: boolean }) => {
  const baseClasses = "relative w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all duration-200";
  const colors = colorMap[skill.color];
  const interactivity = isEquipped 
    ? 'opacity-60 cursor-not-allowed' 
    : `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10`;
  const IconComponent = skill.icon;
  
  return (
    <div className={`${baseClasses} border-slate-700 bg-slate-900/70 ${interactivity}`} onClick={!isEquipped ? onClick : undefined}>
      {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-cyan-400">Đã Trang Bị</div>}
      <div className="flex-shrink-0">
        <IconComponent className={`w-10 h-10 ${colors?.icon}`} />
      </div>
      <div className="flex-grow">
        <h3 className={`text-lg font-bold ${colors?.text}`}>{skill.name}</h3>
        <p className="text-xs text-slate-400">{skill.description}</p>
      </div>
    </div>
  );
};


// --- COMPONENT CHÍNH ---
export default function SkillScreen() {
  // *** NEW STATE *** để chuyển đổi giao diện
  const [viewMode, setViewMode] = useState<'equip' | 'train'>('equip');

  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>([null, null, null]);
  const [ancientBooks, setAncientBooks] = useState(120);
  
  // Giả sử người chơi bắt đầu chưa có kỹ năng nào
  const [ownedSkills, setOwnedSkills] = useState<Skill[]>([]);
  const [craftableSkills, setCraftableSkills] = useState<Skill[]>(ALL_SKILLS);

  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const showMessage = (text: string, type: 'info' | 'success' = 'info') => {
    setMessage(text);
    setMessageKey(prev => prev + 1);
    // Custom style based on type can be added here if needed
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleEquipSkill = (skillToEquip: Skill) => {
    if (equippedSkills.some(s => s?.id === skillToEquip.id)) {
      showMessage("Kỹ năng đã được trang bị.");
      return;
    }
    const firstEmptySlotIndex = equippedSkills.findIndex(slot => slot === null);
    if (firstEmptySlotIndex === -1) {
      showMessage("Các ô kỹ năng đã đầy. Hãy gỡ một kỹ năng trước.");
      return;
    }
    const newEquipped = [...equippedSkills];
    newEquipped[firstEmptySlotIndex] = skillToEquip;
    setEquippedSkills(newEquipped);
  };

  const handleUnequipSkill = (slotIndex: number) => {
    if (!equippedSkills[slotIndex]) return;
    const newEquipped = [...equippedSkills];
    newEquipped[slotIndex] = null;
    setEquippedSkills(newEquipped);
  };
  
  // *** UPDATED LOGIC *** Chế tạo ngẫu nhiên
  const handleCraftRandomSkill = () => {
    if (craftableSkills.length === 0) {
        showMessage("Bạn đã học tất cả kỹ năng!");
        return;
    }
    if (ancientBooks < CRAFTING_COST) {
      showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`);
      return;
    }
    
    // Chọn ngẫu nhiên một kỹ năng từ danh sách chưa sở hữu
    const randomIndex = Math.floor(Math.random() * craftableSkills.length);
    const newSkill = craftableSkills[randomIndex];

    // Cập nhật state
    setAncientBooks(prev => prev - CRAFTING_COST);
    setOwnedSkills(prev => [...prev, newSkill]);
    setCraftableSkills(prev => prev.filter(s => s.id !== newSkill.id));
    
    showMessage(`Bạn nhận được: ${newSkill.name}!`, 'success');
  };

  return (
    <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .main-bg::before { content: ''; position: absolute; width: 150%; height: 150%; top: 50%; left: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); z-index: 0; pointer-events: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(100, 116, 139, 0.5); border-radius: 20px; }
        .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.5), 0 0 20px rgba(45, 212, 191, 0.2); }
        .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -100%); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      
      {message && (
        <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="relative z-10 flex flex-col w-full h-screen p-4 sm:p-6 md:p-8">
        
        <header className="w-full max-w-5xl mx-auto text-center flex-shrink-0 pb-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase title-glow">KỸ NĂNG</h1>
        </header>

        <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4">

            {/* KHU VỰC CHUYỂN ĐỔI: TRANG BỊ & CHẾ TẠO */}
            <section className="relative flex-shrink-0 p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-widest title-glow">
                    {viewMode === 'equip' ? 'Trang Bị' : 'Chế Tạo'}
                  </h2>
                  <button 
                    onClick={() => setViewMode(prev => prev === 'equip' ? 'train' : 'equip')}
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-3 py-1 rounded-md transition-colors"
                  >
                    <SwitchIcon className="w-4 h-4" />
                    <span>{viewMode === 'equip' ? 'Chế Tạo' : 'Trang Bị'}</span>
                  </button>
                </div>

                <div className="min-h-[196px] flex items-center justify-center">
                  {viewMode === 'equip' ? (
                     <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                        {equippedSkills.map((skill, index) => (
                            <SkillSlot 
                                key={index} 
                                skill={skill}
                                onClick={() => handleUnequipSkill(index)}
                            />
                        ))}
                    </div>
                  ) : (
                    <TrainSlot 
                      onCraft={handleCraftRandomSkill}
                      canAfford={ancientBooks >= CRAFTING_COST}
                      cost={CRAFTING_COST}
                      hasSkillsToCraft={craftableSkills.length > 0}
                    />
                  )}
                </div>
            </section>
            
            {/* KHO KỸ NĂNG (CỐ ĐỊNH) */}
            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-widest title-glow">Kho Kỹ Năng</h2>
                    <div className="flex items-center gap-2 text-yellow-300">
                        <BookIcon className="w-5 h-5" />
                        <span className="font-bold">{ancientBooks}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                    {ownedSkills.length > 0 ? ownedSkills.map(skill => (
                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            onClick={() => handleEquipSkill(skill)}
                            isEquipped={equippedSkills.some(s => s?.id === skill.id)}
                        />
                    )) : (
                      <div className="col-span-full flex items-center justify-center h-full text-slate-500">
                        <p>Chưa có kỹ năng. Hãy vào mục Chế Tạo!</p>
                      </div>
                    )}
                </div>
            </section>
        </main>
      </div>
    </div>
  );
}
// --- END OF FILE skill.tsx (4).txt ---
