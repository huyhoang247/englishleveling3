import React, { useState, useMemo } from 'react';

// --- ICONS (Giữ nguyên) ---
const FireballIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.81 4.62C13.25 3.53 14.65 3.53 15.09 4.62L16.2 7.29C16.34 7.6 16.6 7.86 16.91 8L19.58 9.11C20.67 9.55 20.67 10.95 19.58 11.39L16.91 12.5C16.6 12.64 16.34 12.9 16.2 13.21L15.09 15.88C14.65 16.97 13.25 16.97 12.81 15.88L11.7 13.21C11.56 12.9 11.3 12.64 10.99 12.5L8.32 11.39C7.23 10.95 7.23 9.55 8.32 9.11L10.99 8C11.3 7.86 11.56 7.6 11.7 7.29L12.81 4.62Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.18994 18.3C9.62994 17.21 11.0299 17.21 11.4699 18.3L11.9999 19.52C12.1399 19.83 12.3999 20.09 12.7099 20.23L13.9299 20.76C15.0199 21.2 15.0199 22.6 13.9299 23.04L12.7099 23.57C12.3999 23.71 12.1399 23.97 11.9999 24.28L11.4699 25.5C11.0299 26.59 9.62994 26.59 9.18994 25.5L8.65994 24.28C8.51994 23.97 8.25994 23.71 7.94994 23.57L6.72994 23.04C5.63994 22.6 5.63994 21.2 6.72994 20.76L7.94994 20.23C8.25994 20.09 8.51994 19.83 8.65994 19.52L9.18994 18.3Z" transform="scale(0.7) translate(-2, -12)" fill="#fef08a" stroke="#facc15" /> <path d="M17.19 16.3C17.63 15.21 19.03 15.21 19.47 16.3L19.85 17.17C19.99 17.48 20.25 17.74 20.56 17.88L21.43 18.26C22.52 18.7 22.52 20.1 21.43 20.54L20.56 20.92C20.25 21.06 19.99 21.32 19.85 21.63L19.47 22.5C19.03 23.59 17.63 23.59 17.19 22.5L16.81 21.63C16.67 21.32 16.41 21.06 16.1 20.92L15.23 20.54C14.14 20.1 14.14 18.7 15.23 18.26L16.1 17.88C16.41 17.74 16.67 17.48 16.81 17.17L17.19 16.3Z" transform="scale(0.5) translate(18, -20)" fill="#fed7aa" stroke="#fb923c"/> </svg> );
const IceShardIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2L9.13 8.37L2 10.5L7.87 15.63L6.25 22L12 18.5L17.75 22L16.13 15.63L22 10.5L14.87 8.37L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 2V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M2 10.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M6.25 22L12 11.5L17.75 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.13 8.37L2.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M14.87 8.37L21.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const HealIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const ThunderIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const ShieldIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22S18 18 18 12V5L12 2L6 5V12C6 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const TomeIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);


// --- DỮ LIỆU & CẤU HÌNH ---
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
  color: string;
}

const colorMap = {
  orange: { text: 'text-orange-400', border: 'border-orange-500/50 hover:border-orange-400', icon: 'text-orange-400', shadow: 'shadow-orange-500/50' },
  cyan:   { text: 'text-cyan-400',   border: 'border-cyan-500/50 hover:border-cyan-400',     icon: 'text-cyan-400',   shadow: 'shadow-cyan-500/50' },
  green:  { text: 'text-green-400',  border: 'border-green-500/50 hover:border-green-400',   icon: 'text-green-400',  shadow: 'shadow-green-500/50' },
  yellow: { text: 'text-yellow-300', border: 'border-yellow-400/50 hover:border-yellow-300', icon: 'text-yellow-300', shadow: 'shadow-yellow-400/50' },
  blue:   { text: 'text-blue-400',   border: 'border-blue-500/50 hover:border-blue-400',     icon: 'text-blue-400',   shadow: 'shadow-blue-500/50' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/50 hover:border-purple-400', icon: 'text-purple-400', shadow: 'shadow-purple-500/50' },
  pink:   { text: 'text-pink-400',   border: 'border-pink-500/50 hover:border-pink-400',     icon: 'text-pink-400',   shadow: 'shadow-pink-500/50' },
};

const ALL_SKILLS: Skill[] = [
    { id: 'fireball',    name: 'Quả Cầu Lửa',      description: 'Tấn công kẻ địch bằng một quả cầu lửa rực cháy.', icon: FireballIcon, color: 'orange' },
    { id: 'ice_shard',   name: 'Mảnh Băng',         description: 'Làm chậm và gây sát thương lên mục tiêu.',         icon: IceShardIcon, color: 'cyan' },
    { id: 'heal',        name: 'Hồi Máu',          description: 'Phục hồi một lượng máu cho bản thân.',               icon: HealIcon, color: 'green' },
    { id: 'thunder',     name: 'Sấm Sét',          description: 'Gây sát thương lan lên nhiều kẻ địch.',            icon: ThunderIcon, color: 'yellow' },
    { id: 'shield',      name: 'Khiên Năng Lượng',  description: 'Tạo một lớp khiên chặn sát thương.',                icon: ShieldIcon, color: 'blue' },
    { id: 'extra1',      name: 'Tàng Hình',         description: 'Trở nên vô hình trong một khoảng thời gian ngắn.', icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>, color: 'purple' },
    { id: 'extra2',      name: 'Tăng Tốc',         description: 'Tăng tốc độ di chuyển và tấn công.',                icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>, color: 'pink' },
];

const CRAFTING_COST = 50;

// --- COMPONENT CON (TRANG BỊ) ---
const SkillSlot = ({ skill, onClick }: { skill: Skill | null, onClick: () => void }) => {
    const baseClasses = "relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group";
    const borderStyle = skill ? colorMap[skill.color].border : 'border-dashed border-slate-600 hover:border-slate-400';
    const backgroundStyle = skill ? 'bg-slate-900/80' : 'bg-slate-900/50';
    const IconComponent = skill?.icon;

    return (
        <div className={`${baseClasses} ${borderStyle} ${backgroundStyle}`} onClick={onClick}>
        {skill && IconComponent ? (
            <div className="text-center p-2 flex flex-col items-center gap-2">
            <div className="transition-all duration-300 group-hover:scale-110">
                <IconComponent className={`w-10 h-10 ${colorMap[skill.color].icon}`} />
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
    const colors = colorMap[skill.color];
    const interactivity = isEquipped 
        ? 'opacity-50 cursor-not-allowed' 
        : `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg ${colors.shadow}`;
    const IconComponent = skill.icon;
    
    return (
        <div className={`${baseClasses} border-slate-700 bg-slate-900/70 ${interactivity}`} onClick={!isEquipped ? onClick : undefined}>
        {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-cyan-400">Đã Trang Bị</div>}
        <div className="flex-shrink-0">
            <IconComponent className={`w-10 h-10 ${colors.icon}`} />
        </div>
        <div className="flex-grow">
            <h3 className={`text-lg font-bold ${colors.text}`}>{skill.name}</h3>
            <p className="text-xs text-slate-400">{skill.description}</p>
        </div>
        </div>
    );
};

// --- MÀN HÌNH TRANG BỊ ---
function SkillEquipScreen({ equippedSkills, setEquippedSkills, unlockedSkills, showMessage }) {
    const availableSkills = useMemo(() => {
        return ALL_SKILLS.filter(skill => unlockedSkills.includes(skill.id));
    }, [unlockedSkills]);

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

    const handleUnequipSkill = (slotIndex: number) => {
        if (!equippedSkills[slotIndex]) return;
        const newEquipped = [...equippedSkills];
        newEquipped[slotIndex] = null;
        setEquippedSkills(newEquipped);
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-6 animate-fade-in">
             <section className="flex-shrink-0">
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

            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 text-center uppercase tracking-widest flex-shrink-0 title-glow">Kho Kỹ Năng ({availableSkills.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                    {availableSkills.length > 0 ? availableSkills.map(skill => (
                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            onClick={() => handleEquipSkill(skill)}
                            isEquipped={equippedSkills.some(s => s?.id === skill.id)}
                        />
                    )) : (
                        <div className="md:col-span-2 text-center text-slate-500 p-8 flex flex-col items-center gap-2">
                            <TomeIcon className="w-12 h-12"/>
                            <span>Chưa có kỹ năng nào. Hãy đến Xưởng Rèn để chế tạo!</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// --- MÀN HÌNH CHẾ TẠO ---
function SkillForgeScreen({ ancientTomes, setAncientTomes, unlockedSkills, setUnlockedSkills, showMessage }) {
    const [isCrafting, setIsCrafting] = useState(false);
    const [lastCraftedSkill, setLastCraftedSkill] = useState<Skill | null>(null);

    const handleCraft = () => {
        if (ancientTomes < CRAFTING_COST || isCrafting) return;

        setIsCrafting(true);
        setLastCraftedSkill(null);

        setTimeout(() => {
            setAncientTomes(prev => prev - CRAFTING_COST);
            
            const randomSkillIndex = Math.floor(Math.random() * ALL_SKILLS.length);
            const newSkill = ALL_SKILLS[randomSkillIndex];
            
            setLastCraftedSkill(newSkill);
            
            if (!unlockedSkills.includes(newSkill.id)) {
                setUnlockedSkills(prev => [...prev, newSkill.id]);
                showMessage(`Đã mở khóa kỹ năng mới: ${newSkill.name}!`);
            } else {
                 showMessage(`Bạn chế tạo ra một bản sao của: ${newSkill.name}.`);
            }

            setIsCrafting(false);
        }, 2000); // 2 giây hồi hộp
    };
    
    const unlockedSkillObjects = useMemo(() => {
        return ALL_SKILLS.filter(skill => unlockedSkills.includes(skill.id));
    }, [unlockedSkills]);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-6 animate-fade-in">
            {/* Bệ Chế Tạo */}
            <section className="flex-shrink-0 flex flex-col items-center gap-4 p-6 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Vòng xoay animation */}
                    <div className={`absolute inset-0 border-4 border-t-cyan-400 border-l-cyan-400/20 border-r-cyan-400/20 border-b-cyan-400/20 rounded-full ${isCrafting ? 'animate-spin' : ''}`}></div>
                    <div className={`absolute inset-2 border-2 border-dashed border-slate-600 rounded-full`}></div>
                    
                    {/* Kết quả chế tạo */}
                    {lastCraftedSkill && (
                         <div className="animate-pop-in">
                            <div className={`absolute -inset-2 rounded-full blur-xl opacity-70 ${colorMap[lastCraftedSkill.color].icon} ${colorMap[lastCraftedSkill.color].shadow}`}></div>
                             <div className="relative p-2 bg-slate-900 rounded-full">
                                <lastCraftedSkill.icon className={`w-16 h-16 ${colorMap[lastCraftedSkill.color].icon}`}/>
                            </div>
                         </div>
                    )}
                    {isCrafting && !lastCraftedSkill && <FireballIcon className="w-16 h-16 text-slate-500 animate-pulse"/>}
                    {!isCrafting && !lastCraftedSkill && <TomeIcon className="w-16 h-16 text-cyan-400/50"/>}
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xl font-bold">
                        <TomeIcon className="w-6 h-6 text-yellow-300"/>
                        <span className="text-white">Sách Cổ:</span>
                        <span className={ancientTomes >= CRAFTING_COST ? 'text-green-400' : 'text-red-400'}>{ancientTomes}</span>
                    </div>
                    <p className="text-sm text-slate-400">Cần {CRAFTING_COST} để chế tạo một kỹ năng ngẫu nhiên.</p>
                </div>
                
                <button 
                    onClick={handleCraft} 
                    disabled={ancientTomes < CRAFTING_COST || isCrafting}
                    className="w-full max-w-xs px-6 py-3 font-bold text-lg uppercase tracking-wider rounded-lg transition-all duration-300
                               disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                               bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40
                               animate-pulse-slow"
                >
                    {isCrafting ? 'Đang Chế Tạo...' : 'Chế Tạo'}
                </button>
            </section>

             {/* Bộ Sưu Tập Kỹ Năng Đã Mở Khóa */}
            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 text-center uppercase tracking-widest flex-shrink-0 title-glow">Bộ Sưu Tập ({unlockedSkillObjects.length}/{ALL_SKILLS.length})</h2>
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {unlockedSkillObjects.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {unlockedSkillObjects.map(skill => {
                                const Icon = skill.icon;
                                return (
                                    <div key={skill.id} className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg flex flex-col items-center gap-2 text-center">
                                        <Icon className={`w-8 h-8 ${colorMap[skill.color].icon}`}/>
                                        <p className="text-xs font-bold text-white">{skill.name}</p>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                         <div className="text-center text-slate-500 p-8 flex flex-col items-center gap-2">
                            <span>Hãy chế tạo kỹ năng đầu tiên của bạn!</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// --- COMPONENT CHA QUẢN LÝ ---
export default function SkillManagementPage() {
    const [view, setView] = useState<'forge' | 'equip'>('forge');
    
    // Trạng thái chung được quản lý ở đây
    const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>([null, null, null]);
    const [unlockedSkills, setUnlockedSkills] = useState<string[]>(['fireball']); // Bắt đầu với 1 skill
    const [ancientTomes, setAncientTomes] = useState(150); // Cho sẵn 150 sách
    
    // Hệ thống thông báo
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);

    const showMessage = (text: string) => {
        setMessage(text);
        setMessageKey(prev => prev + 1);
        setTimeout(() => setMessage(''), 3000);
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
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(100, 116, 139, 0.8); }
            .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.5), 0 0 20px rgba(45, 212, 191, 0.2); }
            .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
            @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            .animate-pulse-slow { animation: pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulseSlow { 50% { opacity: .8; } }
        `}</style>
        
        {message && (
            <div key={messageKey} className="animate-pop-in fixed top-5 left-1/2 -translate-x-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-50">
            {message}
            </div>
        )}

        <div className="relative z-10 flex flex-col w-full h-screen p-4 sm:p-6 md:p-8">
            <header className="w-full max-w-5xl mx-auto text-center flex-shrink-0 pb-4">
                <div className="mb-4 p-1 bg-black/20 border border-slate-700 rounded-full inline-flex">
                    <button 
                        onClick={() => setView('forge')}
                        className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-bold transition-colors ${view === 'forge' ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700/50'}`}
                    >
                        Xưởng Rèn
                    </button>
                    <button 
                        onClick={() => setView('equip')}
                        className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-bold transition-colors ${view === 'equip' ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700/50'}`}
                    >
                        Trang Bị
                    </button>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase title-glow">
                    {view === 'forge' ? 'Chế Tạo Kỹ Năng' : 'Trang Bị Kỹ Năng'}
                </h1>
                <p className="text-slate-400 mt-1 text-sm md:text-base">
                    {view === 'forge' ? 'Sử dụng Sách Cổ để mở khóa những kỹ năng hùng mạnh.' : 'Chọn kỹ năng đã mở khóa để trang bị cho trận chiến.'}
                </p>
            </header>

            <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0">
                {view === 'equip' && (
                    <SkillEquipScreen 
                        equippedSkills={equippedSkills}
                        setEquippedSkills={setEquippedSkills}
                        unlockedSkills={unlockedSkills}
                        showMessage={showMessage}
                    />
                )}
                {view === 'forge' && (
                    <SkillForgeScreen 
                        ancientTomes={ancientTomes}
                        setAncientTomes={setAncientTomes}
                        unlockedSkills={unlockedSkills}
                        setUnlockedSkills={setUnlockedSkills}
                        showMessage={showMessage}
                    />
                )}
            </main>
        </div>
        </div>
    );
}
