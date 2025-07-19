// --- START OF FILE skill.tsx (2).txt ---

// --- START OF FILE skill.tsx (5).txt ---

import React, { useState } from 'react';

// --- ICONS ---
const FireballIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.81 4.62C13.25 3.53 14.65 3.53 15.09 4.62L16.2 7.29C16.34 7.6 16.6 7.86 16.91 8L19.58 9.11C20.67 9.55 20.67 10.95 19.58 11.39L16.91 12.5C16.6 12.64 16.34 12.9 16.2 13.21L15.09 15.88C14.65 16.97 13.25 16.97 12.81 15.88L11.7 13.21C11.56 12.9 11.3 12.64 10.99 12.5L8.32 11.39C7.23 10.95 7.23 9.55 8.32 9.11L10.99 8C11.3 7.86 11.56 7.6 11.7 7.29L12.81 4.62Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.18994 18.3C9.62994 17.21 11.0299 17.21 11.4699 18.3L11.9999 19.52C12.1399 19.83 12.3999 20.09 12.7099 20.23L13.9299 20.76C15.0199 21.2 15.0199 22.6 13.9299 23.04L12.7099 23.57C12.3999 23.71 12.1399 23.97 11.9999 24.28L11.4699 25.5C11.0299 26.59 9.62994 26.59 9.18994 25.5L8.65994 24.28C8.51994 23.97 8.25994 23.71 7.94994 23.57L6.72994 23.04C5.63994 22.6 5.63994 21.2 6.72994 20.76L7.94994 20.23C8.25994 20.09 8.51994 19.83 8.65994 19.52L9.18994 18.3Z" transform="scale(0.7) translate(-2, -12)" fill="#fef08a" stroke="#facc15" /> <path d="M17.19 16.3C17.63 15.21 19.03 15.21 19.47 16.3L19.85 17.17C19.99 17.48 20.25 17.74 20.56 17.88L21.43 18.26C22.52 18.7 22.52 20.1 21.43 20.54L20.56 20.92C20.25 21.06 19.99 21.32 19.85 21.63L19.47 22.5C19.03 23.59 17.63 23.59 17.19 22.5L16.81 21.63C16.67 21.32 16.41 21.06 16.1 20.92L15.23 20.54C14.14 20.1 14.14 18.7 15.23 18.26L16.1 17.88C16.41 17.74 16.67 17.48 16.81 17.17L17.19 16.3Z" transform="scale(0.5) translate(18, -20)" fill="#fed7aa" stroke="#fb923c"/> </svg>);
const IceShardIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2L9.13 8.37L2 10.5L7.87 15.63L6.25 22L12 18.5L17.75 22L16.13 15.63L22 10.5L14.87 8.37L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 2V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M2 10.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M6.25 22L12 11.5L17.75 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.13 8.37L2.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M14.87 8.37L21.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const HealIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const BookIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );

// --- START: CÁC HÀM HELPER VỀ ĐỘ HIẾM (TỪ SHOP.TSX) ---
const getRarityColor = (rarity: string) => { switch(rarity) { case 'E': return 'border-gray-600'; case 'D': return 'border-green-700'; case 'B': return 'border-blue-500'; case 'A': return 'border-purple-500'; case 'S': return 'border-yellow-400'; case 'SR': return 'border-red-500'; default: return 'border-gray-600'; } };
const getRarityGradient = (rarity: string) => { switch(rarity) { case 'E': return 'from-gray-800/95 to-gray-900/95'; case 'D': return 'from-green-900/70 to-gray-900'; case 'B': return 'from-blue-800/80 to-gray-900'; case 'A': return 'from-purple-800/80 via-black/30 to-gray-900'; case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900'; case 'SR': return 'from-red-800/80 via-orange-900/30 to-black'; default: return 'from-gray-800/95 to-gray-900/95'; } };
const getRarityTextColor = (rarity: string) => { switch(rarity) { case 'E': return 'text-gray-400'; case 'D': return 'text-green-400'; case 'B': return 'text-blue-400'; case 'A': return 'text-purple-400'; case 'S': return 'text-yellow-300'; case 'SR': return 'text-red-400'; default: return 'text-gray-400'; } };
const getRarityDisplayName = (rarity: string) => { if (!rarity) return 'Unknown Rank'; return `${rarity.toUpperCase()} Rank`; }
// --- END: CÁC HÀM HELPER VỀ ĐỘ HIẾM ---


// --- DỮ LIỆU & CẤU HÌNH ---
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
  rarity: 'E' | 'D' | 'B' | 'A' | 'S' | 'SR';
}

const ALL_SKILLS: Skill[] = [
  { id: 'fireball',    name: 'Quả Cầu Lửa',      description: 'Tấn công kẻ địch bằng một quả cầu lửa rực cháy.', icon: FireballIcon, rarity: 'B' },
  { id: 'ice_shard',   name: 'Mảnh Băng',         description: 'Làm chậm và gây sát thương lên mục tiêu.',         icon: IceShardIcon, rarity: 'A' },
  { id: 'heal',        name: 'Hồi Máu',          description: 'Phục hồi một lượng máu cho bản thân.',               icon: HealIcon, rarity: 'D' },
  // ... thêm các kỹ năng khác với các cấp độ khác nhau
];

const CRAFTING_COST = 50;

// --- CÁC COMPONENT CON ---

const SkillSlot = ({ skill, onClick }: { skill: Skill | null, onClick: () => void }) => {
  const baseClasses = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group";
  const borderStyle = skill ? `${getRarityColor(skill.rarity)} hover:opacity-80` : 'border-dashed border-slate-600 hover:border-slate-400';
  const backgroundStyle = skill ? 'bg-slate-900/80' : 'bg-slate-900/50';
  const IconComponent = skill?.icon;

  return (
    <div className={`${baseClasses} ${borderStyle} ${backgroundStyle}`} onClick={onClick}>
      {skill && IconComponent ? (
        <div className="text-center p-2 flex flex-col items-center gap-2">
          <div className="transition-all duration-300 group-hover:scale-110">
             <IconComponent className={`w-10 h-10 ${getRarityTextColor(skill.rarity)}`} />
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-wider text-white">{skill.name}</p>
        </div>
      ) : (
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </div>
      )}
    </div>
  );
};

const SkillCard = ({ skill, onClick, isEquipped }: { skill: Skill, onClick: () => void, isEquipped: boolean }) => {
  const baseClasses = "relative w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all duration-200";
  const interactivity = isEquipped 
    ? 'opacity-50 cursor-not-allowed' 
    : `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10`;
  const IconComponent = skill.icon;
  
  return (
    <div className={`${baseClasses} border-slate-700 bg-slate-900/70 ${interactivity}`} onClick={!isEquipped ? onClick : undefined}>
      {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-cyan-400">Đã Trang Bị</div>}
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md border ${getRarityColor(skill.rarity)} bg-black/20`}>
        <IconComponent className={`w-8 h-8 ${getRarityTextColor(skill.rarity)}`} />
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-bold ${getRarityTextColor(skill.rarity)}`}>{skill.name}</h3>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 border ${getRarityColor(skill.rarity)} ${getRarityTextColor(skill.rarity)}`}>{skill.rarity}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
      </div>
    </div>
  );
};

// --- START: MODAL CHI TIẾT KỸ NĂNG MỚI ---
const SkillDetailModal = ({ skill, onClose, onEquip, isEquipped }: { skill: Skill, onClose: () => void, onEquip: (skill: Skill) => void, isEquipped: boolean }) => {
    const IconComponent = skill.icon;
    
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
          
          <div className={`relative bg-gradient-to-br ${getRarityGradient(skill.rarity)} p-5 rounded-xl border-2 ${getRarityColor(skill.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col`}>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(skill.rarity)}`}>{skill.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
               <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(skill.rarity)} bg-gray-800/70 border ${getRarityColor(skill.rarity)} capitalize`}>
                {getRarityDisplayName(skill.rarity)}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(skill.rarity)} shadow-inner`}>
                        <IconComponent className={`w-20 h-20 ${getRarityTextColor(skill.rarity)}`} />
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed">{skill.description}</p>
                    <div className="w-full text-left text-sm mt-4 p-4 bg-black/20 rounded-lg border border-slate-700/50">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">Loại:</span> <span className="font-semibold text-white">Chủ Động</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Năng lượng:</span> <span className="font-semibold text-white">30</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Thời gian hồi:</span> <span className="font-semibold text-white">5s</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Mục tiêu:</span> <span className="font-semibold text-white">Đơn</span></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
                <button 
                  onClick={() => onEquip(skill)} 
                  disabled={isEquipped}
                  className={`w-full font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform 
                    ${isEquipped 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100'}`
                  }>
                  {isEquipped ? 'Đã Trang Bị' : 'Trang Bị'}
                </button>
            </div>
          </div>
        </div>
    );
};
// --- END: MODAL CHI TIẾT KỸ NĂNG MỚI ---


// --- COMPONENT CHÍNH ---
export default function SkillScreen() {
  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>([null, null, null]);
  const [ancientBooks, setAncientBooks] = useState(70);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  // Bắt đầu với các kỹ năng giống trong ảnh để demo
  const [ownedSkills, setOwnedSkills] = useState<Skill[]>([ALL_SKILLS[0], ALL_SKILLS[1]]);
  // Kỹ năng còn lại có thể chế tạo
  const [craftableSkills, setCraftableSkills] = useState<Skill[]>(ALL_SKILLS.slice(2));

  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const showMessage = (text: string) => {
    setMessage(text);
    setMessageKey(prev => prev + 1);
    setTimeout(() => setMessage(''), 3000);
  };
  
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
    setSelectedSkill(null); // Đóng modal sau khi trang bị
  };

  const handleUnequipSkill = (slotIndex: number) => {
    if (!equippedSkills[slotIndex]) return;
    const newEquipped = [...equippedSkills];
    newEquipped[slotIndex] = null;
    setEquippedSkills(newEquipped);
  };
  
  const handleTrainAndCraft = () => {
    if (craftableSkills.length === 0) {
        showMessage("Bạn đã học tất cả kỹ năng!");
        return;
    }
    if (ancientBooks < CRAFTING_COST) {
      showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * craftableSkills.length);
    const newSkill = craftableSkills[randomIndex];

    setAncientBooks(prev => prev - CRAFTING_COST);
    setOwnedSkills(prev => [...prev, newSkill].sort((a, b) => a.id.localeCompare(b.id))); // Sắp xếp lại cho nhất quán
    setCraftableSkills(prev => prev.filter(s => s.id !== newSkill.id));
    
    showMessage(`Chế tạo thành công: ${newSkill.name} (Rank ${newSkill.rarity})!`);
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

      {selectedSkill && (
        <SkillDetailModal 
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onEquip={handleEquipSkill}
          isEquipped={equippedSkills.some(s => s?.id === selectedSkill.id)}
        />
      )}

      <div className="relative z-10 flex flex-col w-full h-screen p-4 sm:p-6 md:p-8">
        
        <header className="w-full max-w-5xl mx-auto text-center flex-shrink-0 pb-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase title-glow">QUẢN LÝ KỸ NĂNG</h1>
        </header>

        <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4">

            {/* KHU VỰC TRANG BỊ */}
            <section className="flex-shrink-0 py-4">
                <p className="text-slate-400 text-center mb-3 text-sm md:text-base">Kỹ năng đang trang bị. Nhấp để gỡ bỏ.</p>
                <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                    {equippedSkills.map((skill, index) => (
                        <SkillSlot 
                            key={`equipped-${index}`} 
                            skill={skill}
                            onClick={() => handleUnequipSkill(index)}
                        />
                    ))}
                </div>
            </section>

            {/* KHU VỰC CHẾ TẠO & TÀI NGUYÊN */}
            <section className="flex-shrink-0 p-3 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookIcon className="w-8 h-8 text-yellow-300" />
                    <div className="text-left">
                        <span className="text-xs text-slate-400">Sách Cổ</span>
                        <p className="text-xl font-bold text-white">{ancientBooks}</p>
                    </div>
                </div>
                <button 
                  onClick={handleTrainAndCraft}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Train ({CRAFTING_COST})
                </button>
            </section>

            {/* KHO KỸ NĂNG CỐ ĐỊNH */}
            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 text-center uppercase tracking-widest flex-shrink-0 title-glow">Kho Kỹ Năng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2">
                    {ownedSkills.length > 0 ? (
                        ownedSkills.map(skill => (
                            <SkillCard
                                key={skill.id}
                                skill={skill}
                                onClick={() => setSelectedSkill(skill)}
                                isEquipped={equippedSkills.some(s => s?.id === skill.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center h-full text-slate-500">
                            <p>Chưa có kỹ năng. Hãy dùng Sách Cổ để Train!</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
      </div>
    </div>
  );
}
// --- END OF FILE skill.tsx (5).txt ---
