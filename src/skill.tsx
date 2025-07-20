// --- START OF FILE skill.tsx (9).txt ---

import React, { useState } from 'react';
// --- START: IMPORT DỮ LIỆU TỪ FILE MỚI ---
// Giả sử file skills.data.ts nằm cùng thư mục, nếu khác, bạn hãy điều chỉnh đường dẫn.
import { ALL_SKILLS, Skill, FireballIcon, IceShardIcon, HealIcon } from './skill/skills-data.ts';
// --- END: IMPORT DỮ LIỆU TỪ FILE MỚI ---


// --- ICONS ---
// FireballIcon, IceShardIcon, HealIcon đã được chuyển sang skills.data.ts và import ở trên.
// Các icon giao diện chung vẫn được giữ lại tại đây.
const BookIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1859_Icon%20S%C3%A1ch%20C%E1%BB%95%20Anime_simple_compose_01k0kv0rg5fhzrx8frbtsgqk33.png" alt="Sách Cổ" className={className} /> );
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#fbbF24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15.39L9.32 17l.79-3.08-2.3-1.99 3.18-.28L12 9l1.01 2.65 3.18.28-2.3 1.99.79 3.08L12 15.39z" fill="#fff" /></svg> );

// --- START: CÁC HÀM HELPER VỀ ĐỘ HIẾM (TỪ SHOP.TSX) ---
const getRarityColor = (rarity: string) => { switch(rarity) { case 'E': return 'border-gray-600'; case 'D': return 'border-green-700'; case 'B': return 'border-blue-500'; case 'A': return 'border-purple-500'; case 'S': return 'border-yellow-400'; case 'SR': return 'border-red-500'; default: return 'border-gray-600'; } };
const getRarityGradient = (rarity: string) => { switch(rarity) { case 'E': return 'from-gray-800/95 to-gray-900/95'; case 'D': return 'from-green-900/70 to-gray-900'; case 'B': return 'from-blue-800/80 to-gray-900'; case 'A': return 'from-purple-800/80 via-black/30 to-gray-900'; case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900'; case 'SR': return 'from-red-800/80 via-orange-900/30 to-black'; default: return 'from-gray-800/95 to-gray-900/95'; } };
const getRarityTextColor = (rarity: string) => { switch(rarity) { case 'E': return 'text-gray-400'; case 'D': return 'text-green-400'; case 'B': return 'text-blue-400'; case 'A': return 'text-purple-400'; case 'S': return 'text-yellow-300'; case 'SR': return 'text-red-400'; default: return 'text-gray-400'; } };
const getRarityDisplayName = (rarity: string) => { if (!rarity) return 'Unknown Rank'; return `${rarity.toUpperCase()} Rank`; }
// --- END: CÁC HÀM HELPER VỀ ĐỘ HIẾM ---


// --- DỮ LIỆU & CẤU HÌNH ---
// Toàn bộ dữ liệu (interface Skill, const ALL_SKILLS) đã được chuyển sang file skills.data.ts

const CRAFTING_COST = 50;

// --- CÁC COMPONENT CON ---

const Header = ({ gold, ancientBooks }: { gold: number; ancientBooks: number; }) => {
    return (
        <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50 backdrop-blur-sm">
            <div className="w-full max-w-5xl mx-auto flex justify-end items-center py-3 px-4 sm:px-0">
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Resources */}
                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-md border border-slate-700/50">
                        <GoldIcon className="w-6 h-6" />
                        <span className="font-bold text-yellow-300 text-sm">{gold.toLocaleString()}</span>
                    </div>
                     <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-md border border-slate-700/50">
                        <BookIcon className="w-6 h-6" />
                        <span className="font-bold text-white text-sm">{ancientBooks}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

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
  const interactivity = isEquipped ? 'opacity-50 cursor-not-allowed' : `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10`;
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

const SkillDetailModal = ({ skill, onClose, onEquip, onDisenchant, isEquipped }: { skill: Skill, onClose: () => void, onEquip: (skill: Skill) => void, onDisenchant: (skill: Skill) => void, isEquipped: boolean }) => {
    const IconComponent = skill.icon;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <div className={`relative bg-gradient-to-br ${getRarityGradient(skill.rarity)} p-5 rounded-xl border-2 ${getRarityColor(skill.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col`}>
            <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(skill.rarity)}`}>{skill.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(skill.rarity)} bg-gray-800/70 border ${getRarityColor(skill.rarity)} capitalize`}>{getRarityDisplayName(skill.rarity)}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(skill.rarity)} shadow-inner`}><IconComponent className={`w-20 h-20 ${getRarityTextColor(skill.rarity)}`} /></div>
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
            <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
              <div className="flex items-center gap-3">
                <button onClick={() => onEquip(skill)} disabled={isEquipped} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100'}`}>
                  {isEquipped ? 'Đã Trang Bị' : 'Trang Bị'}
                </button>
                <button onClick={() => onDisenchant(skill)} disabled={isEquipped} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-100'}`}>
                  Phân Rã
                </button>
              </div>
            </div>
          </div>
        </div>
    );
};

const CraftingSuccessModal = ({ skill, onClose }: { skill: Skill, onClose: () => void }) => {
    const IconComponent = skill.icon;
    const rarityTextColor = getRarityTextColor(skill.rarity);
    const rarityColor = getRarityColor(skill.rarity).replace('border-', ''); // Lấy màu hex hoặc tên màu tailwind
    const shadowStyle = { boxShadow: `0 0 25px -5px ${rarityColor}, 0 0 15px -10px ${rarityColor}` };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm">
                <div className="absolute inset-0.5 animate-spin-slow-360">
                    <div className={`absolute -inset-2 bg-gradient-to-r ${getRarityGradient(skill.rarity)} opacity-50 rounded-full blur-2xl`}></div>
                </div>
                <div className={`relative bg-gradient-to-b ${getRarityGradient(skill.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(skill.rarity)} text-center flex flex-col items-center gap-4`} style={shadowStyle}>
                    <h2 className="text-2xl font-black tracking-widest uppercase text-white title-glow">Chế Tạo Thành Công</h2>
                    <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(skill.rarity)} shadow-inner`}>
                        <IconComponent className={`w-20 h-20 ${rarityTextColor}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-2xl font-bold ${rarityTextColor}`}>{skill.name}</span>
                        <span className="font-semibold text-slate-300">{getRarityDisplayName(skill.rarity)}</span>
                    </div>
                    <p className="text-sm text-slate-400">{skill.description}</p>
                    <button onClick={onClose} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                        Tuyệt vời!
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
export default function SkillScreen() {
  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>([null, null, null]);
  const [ancientBooks, setAncientBooks] = useState(120);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [newlyCraftedSkill, setNewlyCraftedSkill] = useState<Skill | null>(null);
  
  const [ownedSkills, setOwnedSkills] = useState<Skill[]>([ALL_SKILLS[0]]);
  const [craftableSkills, setCraftableSkills] = useState<Skill[]>(ALL_SKILLS.slice(1));
  
  const [gold, setGold] = useState(12500);

  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const showMessage = (text: string) => {
    setMessage(text);
    setMessageKey(prev => prev + 1);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleEquipSkill = (skillToEquip: Skill) => {
    if (equippedSkills.some(s => s?.id === skillToEquip.id)) { showMessage("Kỹ năng đã được trang bị."); return; }
    const firstEmptySlotIndex = equippedSkills.findIndex(slot => slot === null);
    if (firstEmptySlotIndex === -1) { showMessage("Các ô kỹ năng đã đầy."); return; }
    const newEquipped = [...equippedSkills];
    newEquipped[firstEmptySlotIndex] = skillToEquip;
    setEquippedSkills(newEquipped);
    setSelectedSkill(null);
  };

  const handleUnequipSkill = (slotIndex: number) => {
    if (!equippedSkills[slotIndex]) return;
    const newEquipped = [...equippedSkills];
    newEquipped[slotIndex] = null;
    setEquippedSkills(newEquipped);
  };
  
  const handleTrainAndCraft = () => {
    if (craftableSkills.length === 0) { showMessage("Bạn đã học tất cả kỹ năng!"); return; }
    if (ancientBooks < CRAFTING_COST) { showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`); return; }
    
    const randomIndex = Math.floor(Math.random() * craftableSkills.length);
    const newSkill = craftableSkills[randomIndex];

    setAncientBooks(prev => prev - CRAFTING_COST);
    setOwnedSkills(prev => [...prev, newSkill].sort((a, b) => a.rarity.localeCompare(b.rarity) || a.id.localeCompare(b.id)));
    setCraftableSkills(prev => prev.filter(s => s.id !== newSkill.id));
    
    setNewlyCraftedSkill(newSkill); // Kích hoạt popup thành công
  };

  const handleDisenchantSkill = (skillToDisenchant: Skill) => {
    if (equippedSkills.some(s => s?.id === skillToDisenchant.id)) {
      showMessage("Không thể phân rã kỹ năng đang trang bị.");
      return;
    }
    const booksToReturn = Math.floor(CRAFTING_COST / 2);
    setOwnedSkills(prev => prev.filter(s => s.id !== skillToDisenchant.id));
    setCraftableSkills(prev => [...prev, skillToDisenchant].sort((a, b) => a.id.localeCompare(b.id)));
    setAncientBooks(prev => prev + booksToReturn);

    setSelectedSkill(null);
    showMessage(`Đã phân rã ${skillToDisenchant.name}, nhận lại ${booksToReturn} Sách Cổ.`);
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
        @keyframes fadeInDown { from { opacity: 0; transform: translate(-50%, -100%); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-spin-slow-360 { animation: spin-slow-360 20s linear infinite; }
        @keyframes spin-slow-360 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-50">{message}</div>}
      
      {selectedSkill && <SkillDetailModal 
          skill={selectedSkill} 
          onClose={() => setSelectedSkill(null)} 
          onEquip={handleEquipSkill} 
          onDisenchant={handleDisenchantSkill}
          isEquipped={equippedSkills.some(s => s?.id === selectedSkill.id)} 
      />}
      
      {newlyCraftedSkill && <CraftingSuccessModal skill={newlyCraftedSkill} onClose={() => setNewlyCraftedSkill(null)} />}

      <div className="relative z-10 flex flex-col w-full h-screen">
        <Header gold={gold} ancientBooks={ancientBooks} />
        <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 p-4 sm:p-6 md:p-8">
            <section className="flex-shrink-0 py-4">
                <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                    {equippedSkills.map((skill, index) => (<SkillSlot key={`equipped-${index}`} skill={skill} onClick={() => handleUnequipSkill(index)} />))}
                </div>
            </section>
            <section className="flex-shrink-0 p-3 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookIcon className="w-10 h-10" />
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{ancientBooks}</span>
                        <span className="text-base text-slate-400">/ {CRAFTING_COST}</span>
                    </div>
                </div>
                <button 
                    onClick={handleTrainAndCraft} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    disabled={ancientBooks < CRAFTING_COST}
                >
                  Train
                </button>
            </section>
            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 text-center uppercase tracking-widest flex-shrink-0 title-glow">Kho Kỹ Năng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2">
                    {ownedSkills.length > 0 ? (
                        ownedSkills.map(skill => (<SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} isEquipped={equippedSkills.some(s => s?.id === skill.id)} />))
                    ) : (
                        <div className="col-span-full flex items-center justify-center h-full text-slate-500"><p>Chưa có kỹ năng. Hãy dùng Sách Cổ để Train!</p></div>
                    )}
                </div>
            </section>
        </main>
      </div>
    </div>
  );
}

// --- END OF FILE skill.tsx (9).txt ---
