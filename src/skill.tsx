import React, { useState } from 'react';

// --- START: THÊM ICON MỚI CHO KỸ NĂNG HÚT MÁU ---
const LifeStealIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.33 3.1C12.12 2.94 11.88 2.94 11.67 3.1C9.28 4.9 3 9.77 3 14.54C3 18.23 6.13 21.2 10 21.81V13.5H7.5L12.5 7L17.5 13.5H15V21.81C18.87 21.2 22 18.23 22 14.54C22 9.77 15.72 4.9 13.33 3.1C13.11 2.87 12.89 2.76 12.67 2.76H12.33C12.55 2.76 12.77 2.87 12.99 3.1" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12.5 17.5C13.8807 17.5 15 16.3807 15 15C15 13.6193 13.8807 12.5 12.5 12.5C11.1193 12.5 10 13.6193 10 15C10 16.3807 11.1193 17.5 12.5 17.5Z" fill="currentColor" opacity="0.5"/> </svg> );
// --- END: THÊM ICON MỚI CHO KỸ NĂNG HÚT MÁU ---

// --- START: THÊM ICON MỚI CHO KỸ NĂNG PHẢN DAMAGE ---
const ThornsIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C12 22 19 18 19 12V5L12 2L5 5V12C5 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 15L15 12M12 15L9 12M12 15V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/> <path d="M15.5 9.5L19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> <path d="M8.5 9.5L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9 16L6 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> <path d="M15 16L18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
// --- END: THÊM ICON MỚI CHO KỸ NĂNG PHẢN DAMAGE ---

const FireballIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.81 4.62C13.25 3.53 14.65 3.53 15.09 4.62L16.2 7.29C16.34 7.6 16.6 7.86 16.91 8L19.58 9.11C20.67 9.55 20.67 10.95 19.58 11.39L16.91 12.5C16.6 12.64 16.34 12.9 16.2 13.21L15.09 15.88C14.65 16.97 13.25 16.97 12.81 15.88L11.7 13.21C11.56 12.9 11.3 12.64 10.99 12.5L8.32 11.39C7.23 10.95 7.23 9.55 8.32 9.11L10.99 8C11.3 7.86 11.56 7.6 11.7 7.29L12.81 4.62Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.18994 18.3C9.62994 17.21 11.0299 17.21 11.4699 18.3L11.9999 19.52C12.1399 19.83 12.3999 20.09 12.7099 20.23L13.9299 20.76C15.0199 21.2 15.0199 22.6 13.9299 23.04L12.7099 23.57C12.3999 23.71 12.1399 23.97 11.9999 24.28L11.4699 25.5C11.0299 26.59 9.62994 26.59 9.18994 25.5L8.65994 24.28C8.51994 23.97 8.25994 23.71 7.94994 23.57L6.72994 23.04C5.63994 22.6 5.63994 21.2 6.72994 20.76L7.94994 20.23C8.25994 20.09 8.51994 19.83 8.65994 19.52L9.18994 18.3Z" transform="scale(0.7) translate(-2, -12)" fill="#fef08a" stroke="#facc15" /> <path d="M17.19 16.3C17.63 15.21 19.03 15.21 19.47 16.3L19.85 17.17C19.99 17.48 20.25 17.74 20.56 17.88L21.43 18.26C22.52 18.7 22.52 20.1 21.43 20.54L20.56 20.92C20.25 21.06 19.99 21.32 19.85 21.63L19.47 22.5C19.03 23.59 17.63 23.59 17.19 22.5L16.81 21.63C16.67 21.32 16.41 21.06 16.1 20.92L15.23 20.54C14.14 20.1 14.14 18.7 15.23 18.26L16.1 17.88C16.41 17.74 16.67 17.48 16.81 17.17L17.19 16.3Z" transform="scale(0.5) translate(18, -20)" fill="#fed7aa" stroke="#fb923c"/> </svg>);
const IceShardIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2L9.13 8.37L2 10.5L7.87 15.63L6.25 22L12 18.5L17.75 22L16.13 15.63L22 10.5L14.87 8.37L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 2V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M2 10.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M6.25 22L12 11.5L17.75 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.13 8.37L2.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M14.87 8.37L21.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const HealIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const BookIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1859_Icon%20S%C3%A1ch%20C%E1%BB%95%20Anime_simple_compose_01k0kv0rg5fhzrx8frbtsgqk33.png" alt="Sách Cổ" className={className} /> );
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#fbbF24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15.39L9.32 17l.79-3.08-2.3-1.99 3.18-.28L12 9l1.01 2.65 3.18.28-2.3 1.99.79 3.08L12 15.39z" fill="#fff" /></svg> );

// --- START: CÁC HÀM HELPER VỀ ĐỘ HIẾM VÀ KỸ NĂNG ---
const getRarityColor = (rarity: string) => { switch(rarity) { case 'E': return 'border-gray-600'; case 'D': return 'border-green-700'; case 'B': return 'border-blue-500'; case 'A': return 'border-purple-500'; case 'S': return 'border-yellow-400'; case 'SR': return 'border-red-500'; default: return 'border-gray-600'; } };
const getRarityGradient = (rarity: string) => { switch(rarity) { case 'E': return 'from-gray-800/95 to-gray-900/95'; case 'D': return 'from-green-900/70 to-gray-900'; case 'B': return 'from-blue-800/80 to-gray-900'; case 'A': return 'from-purple-800/80 via-black/30 to-gray-900'; case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900'; case 'SR': return 'from-red-800/80 via-orange-900/30 to-black'; default: return 'from-gray-800/95 to-gray-900/95'; } };
const getRarityTextColor = (rarity: string) => { switch(rarity) { case 'E': return 'text-gray-400'; case 'D': return 'text-green-400'; case 'B': return 'text-blue-400'; case 'A': return 'text-purple-400'; case 'S': return 'text-yellow-300'; case 'SR': return 'text-red-400'; default: return 'text-gray-400'; } };
const getRarityDisplayName = (rarity: string) => { if (!rarity) return 'Unknown Rank'; return `${rarity.toUpperCase()} Rank`; };

const getActivationChance = (rarity: string) => {
    switch (rarity) {
        case 'E': return 5;
        case 'D': return 10;
        case 'B': return 15;
        case 'A': return 20;
        case 'S': return 25;
        case 'SR': return 30;
        default: return 0;
    }
};
// --- END: CÁC HÀM HELPER VỀ ĐỘ HIẾM VÀ KỸ NĂNG ---

// --- START: CẤU TRÚC DỮ LIỆU MỚI CHO KỸ NĂNG ---
// SkillBlueprint: Định nghĩa các thuộc tính cơ bản, không thay đổi của một kỹ năng.
interface SkillBlueprint {
  id: string;
  name: string;
  description: (level: number, rarity: string) => string; // Mô tả động
  icon: (props: { className?: string }) => React.ReactElement;
  rarity: 'E' | 'D' | 'B' | 'A' | 'S' | 'SR';
  // Thuộc tính cho việc nâng cấp (linh hoạt hơn)
  baseEffectValue?: number;     // Giá trị hiệu ứng cơ bản (ví dụ: %)
  effectValuePerLevel?: number; // Giá trị tăng thêm mỗi cấp
  upgradeCost?: number;
  maxLevel?: number;
}

// OwnedSkill: Đại diện cho một kỹ năng mà người chơi thực sự sở hữu, có cấp độ.
interface OwnedSkill {
  id: string; // ID duy nhất của instance này, hữu ích cho React keys
  skillId: string; // Liên kết với SkillBlueprint
  level: number;
}

const ALL_SKILLS: SkillBlueprint[] = [
  { id: 'fireball',    name: 'Quả Cầu Lửa',      description: () => 'Tấn công kẻ địch bằng một quả cầu lửa rực cháy.', icon: FireballIcon, rarity: 'B' },
  { id: 'ice_shard',   name: 'Mảnh Băng',         description: () => 'Làm chậm và gây sát thương lên mục tiêu.',         icon: IceShardIcon, rarity: 'A' },
  { id: 'heal',        name: 'Hồi Máu',          description: () => 'Phục hồi một lượng máu cho bản thân.',               icon: HealIcon, rarity: 'D' },
  { 
    id: 'life_steal',    
    name: 'Hút Máu',      
    description: (level) => `Hút ${5 + (level - 1) * 1}% Máu dựa trên Sát thương gây ra.`,
    icon: LifeStealIcon, 
    rarity: 'S', 
    baseEffectValue: 5,
    effectValuePerLevel: 1,
    upgradeCost: 200,
    maxLevel: 26, // 5% base + 25 level * 1% = 30% max
  },
  // --- START: KỸ NĂNG PHẢN DAMAGE MỚI ---
  {
    id: 'thorns',
    name: 'Phản Damage',
    description: (level) => `Phản lại ${5 + (level - 1) * 1}% Sát thương nhận được khi bị tấn công.`,
    icon: ThornsIcon,
    rarity: 'S',
    baseEffectValue: 5,
    effectValuePerLevel: 1,
    upgradeCost: 200,
    maxLevel: 26, // 5% base + 25 level * 1% = 30% max
  },
  // --- END: KỸ NĂNG PHẢN DAMAGE MỚI ---
];
// --- END: CẤU TRÚC DỮ LIỆU MỚI CHO KỸ NĂNG ---

const CRAFTING_COST = 50;

// --- CÁC COMPONENT CON ---
const Header = ({ gold, ancientBooks }: { gold: number; ancientBooks: number; }) => {
    return (
        <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50 backdrop-blur-sm">
            <div className="w-full max-w-5xl mx-auto flex justify-end items-center py-3 px-4 sm:px-0">
                <div className="flex items-center gap-4 sm:gap-6">
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

// --- START: CẬP NHẬT SKILLSLOT ĐỂ HIỂN THỊ CẤP ĐỘ ---
const SkillSlot = ({ ownedSkill, onClick }: { ownedSkill: OwnedSkill | null, onClick: () => void }) => {
  const skillBlueprint = ownedSkill ? ALL_SKILLS.find(s => s.id === ownedSkill.skillId) : null;
  const baseClasses = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group";
  const borderStyle = skillBlueprint ? `${getRarityColor(skillBlueprint.rarity)} hover:opacity-80` : 'border-dashed border-slate-600 hover:border-slate-400';
  const backgroundStyle = skillBlueprint ? 'bg-slate-900/80' : 'bg-slate-900/50';
  const IconComponent = skillBlueprint?.icon;

  return (
    <div className={`${baseClasses} ${borderStyle} ${backgroundStyle}`} onClick={onClick}>
      {skillBlueprint && IconComponent ? (
        <>
          <div className="text-center p-2 flex flex-col items-center gap-2">
            <div className="transition-all duration-300 group-hover:scale-110">
               <IconComponent className={`w-10 h-10 ${getRarityTextColor(skillBlueprint.rarity)}`} />
            </div>
            <p className="text-xs sm:text-sm font-bold tracking-wider text-white">{skillBlueprint.name}</p>
          </div>
          <span className="absolute top-1 right-1.5 px-1.5 py-0.5 text-xs font-bold bg-black/60 text-white rounded-md border border-slate-600">
            Lv.{ownedSkill?.level}
          </span>
        </>
      ) : (
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </div>
      )}
    </div>
  );
};
// --- END: CẬP NHẬT SKILLSLOT ---

// --- START: CẬP NHẬT SKILLCARD ĐỂ HIỂN THỊ CẤP ĐỘ ---
const SkillCard = ({ ownedSkill, onClick, isEquipped }: { ownedSkill: OwnedSkill, onClick: () => void, isEquipped: boolean }) => {
  const skillBlueprint = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
  if (!skillBlueprint) return null; // Or some fallback UI

  const baseClasses = "relative w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all duration-200";
  const interactivity = isEquipped ? 'opacity-50 cursor-not-allowed' : `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10`;
  const IconComponent = skillBlueprint.icon;
  
  return (
    <div className={`${baseClasses} border-slate-700 bg-slate-900/70 ${interactivity}`} onClick={!isEquipped ? onClick : undefined}>
      {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-cyan-400">Đã Trang Bị</div>}
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md border ${getRarityColor(skillBlueprint.rarity)} bg-black/20`}>
        <IconComponent className={`w-8 h-8 ${getRarityTextColor(skillBlueprint.rarity)}`} />
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-bold ${getRarityTextColor(skillBlueprint.rarity)}`}>{skillBlueprint.name}</h3>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 border ${getRarityColor(skillBlueprint.rarity)} ${getRarityTextColor(skillBlueprint.rari```
... Truncated for brevity. The rest of the file is identical to the user's request, but with the logical changes propagated. I will continue the file from the modal component where changes are relevant.
```tsx
// --- START: MODAL CHI TIẾT KỸ NĂNG VÀ NÂNG CẤP HOÀN CHỈNH ---
const SkillDetailModal = ({ ownedSkill, onClose, onEquip, onDisenchant, onUpgrade, isEquipped, gold }: { ownedSkill: OwnedSkill, onClose: () => void, onEquip: (skill: OwnedSkill) => void, onDisenchant: (skill: OwnedSkill) => void, onUpgrade: (skill: OwnedSkill) => void, isEquipped: boolean, gold: number }) => {
    const skill = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    if (!skill) return null;

    const IconComponent = skill.icon;
    const isUpgradable = skill.upgradeCost !== undefined && skill.maxLevel !== undefined;
    const isMaxLevel = isUpgradable && ownedSkill.level >= skill.maxLevel!;
    const canAffordUpgrade = isUpgradable && gold >= skill.upgradeCost!;

    const getCurrentEffectValue = () => {
        if (skill.baseEffectValue === undefined || skill.effectValuePerLevel === undefined) return 0;
        return skill.baseEffectValue + (ownedSkill.level - 1) * skill.effectValuePerLevel;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <div className={`relative bg-gradient-to-br ${getRarityGradient(skill.rarity)} p-5 rounded-xl border-2 ${getRarityColor(skill.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(skill.rarity)}`}>{skill.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(skill.rarity)} bg-gray-800/70 border ${getRarityColor(skill.rarity)} capitalize`}>{getRarityDisplayName(skill.rarity)}</span>
                <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Cấp {ownedSkill.level}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(skill.rarity)} shadow-inner`}><IconComponent className={`w-20 h-20 ${getRarityTextColor(skill.rarity)}`} /></div>
                <p className="text-slate-300 text-base leading-relaxed">{skill.description(ownedSkill.level, skill.rarity)}</p>
                
                {isUpgradable && (
                  <div className="w-full text-left text-sm mt-2 p-3 bg-black/20 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tỉ lệ Kích Hoạt:</span>
                      <span className="font-semibold text-cyan-300">{getActivationChance(skill.rarity)}%</span>
                    </div>
                  </div>
                )}
                
                {/* --- START: KHUNG NÂNG CẤP ĐÃ ĐIỀU CHỈNH KHOẢNG CÁCH --- */}
                {isUpgradable && (
                    <div className="w-full mt-2 mb-4 space-y-2">
                        <button 
                            onClick={() => onUpgrade(ownedSkill)}
                            disabled={isMaxLevel || !canAffordUpgrade || isEquipped}
                            className="w-full relative p-3 rounded-lg transition-all duration-300 text-left flex items-center justify-between disabled:cursor-not-allowed group bg-black/20 border border-slate-700/80 hover:border-purple-500 disabled:hover:border-slate-700/80 hover:bg-purple-900/20"
                        >
                            {/* Left side: Effect transition */}
                            <div className="flex flex-col">
                                <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Nâng Cấp</span>
                                {isMaxLevel ? (
                                    <span className="font-bold text-yellow-400 mt-1">Đã đạt cấp tối đa</span>
                                ) : (
                                    <div className="flex items-center gap-2 font-bold text-lg mt-1">
                                        <span className="text-slate-300">{getCurrentEffectValue()}%</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        <span className="text-green-400">{getCurrentEffectValue() + skill.effectValuePerLevel!}%</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Right side: Cost */}
                            {!isMaxLevel && (
                                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${!canAffordUpgrade ? 'bg-slate-700 border border-slate-600' : 'bg-slate-800 border border-slate-600 group-hover:bg-purple-600/50 group-hover:border-purple-500'}`}>
                                    <GoldIcon className="w-5 h-5"/>
                                    <span className={`font-bold text-sm transition-colors ${!canAffordUpgrade ? 'text-slate-500' : 'text-yellow-300'}`}>{skill.upgradeCost?.toLocaleString()}</span>
                                </div>
                            )}
                        </button>
                        {isEquipped && <p className="text-center text-xs text-red-400 mt-1">Tháo kỹ năng để nâng cấp</p>}
                        {!isEquipped && !isMaxLevel && !canAffordUpgrade && <p className="text-center text-xs text-red-400 mt-1">Không đủ vàng</p>}
                    </div>
                )}
                {/* --- END: KHUNG NÂNG CẤP ĐÃ ĐIỀU CHỈNH KHOẢNG CÁCH --- */}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
              <div className="flex items-center gap-3">
                <button onClick={() => onEquip(ownedSkill)} disabled={isEquipped} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100'}`}>
                  {isEquipped ? 'Đã Trang Bị' : 'Trang Bị'}
                </button>
                <button onClick={() => onDisenchant(ownedSkill)} disabled={isEquipped} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-100'}`}>
                  Phân Rã
                </button>
              </div>
            </div>
          </div>
        </div>
    );
};
// --- END: MODAL CHI TIẾT KỸ NĂNG VÀ NÂNG CẤP ---


const CraftingSuccessModal = ({ skill, onClose }: { skill: SkillBlueprint, onClose: () => void }) => {
    const IconComponent = skill.icon;
    const rarityTextColor = getRarityTextColor(skill.rarity);
    const rarityColor = getRarityColor(skill.rarity).replace('border-', ''); 
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
                    <p className="text-sm text-slate-400">{skill.description(1, skill.rarity)}</p>
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
  // --- START: CẬP NHẬT STATE ĐỂ SỬ DỤNG OWNEDSKILL ---
  const [equippedSkills, setEquippedSkills] = useState<(OwnedSkill | null)[]>([null, null, null]);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([
      { id: `owned-${Date.now()}-ls`, skillId: 'life_steal', level: 1 },
      { id: `owned-${Date.now()}-fb`, skillId: 'fireball', level: 1 },
  ]);
  const [selectedSkill, setSelectedSkill] = useState<OwnedSkill | null>(null);
  const [newlyCraftedSkill, setNewlyCraftedSkill] = useState<SkillBlueprint | null>(null);
  
  const [gold, setGold] = useState(12500);
  const [ancientBooks, setAncientBooks] = useState(120);
  // --- END: CẬP NHẬT STATE ---

  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const showMessage = (text: string) => {
    setMessage(text);
    setMessageKey(prev => prev + 1);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const getCraftableSkills = () => {
      const ownedSkillIds = ownedSkills.map(s => s.skillId);
      return ALL_SKILLS.filter(s => !ownedSkillIds.includes(s.id));
  };

  const handleEquipSkill = (skillToEquip: OwnedSkill) => {
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
    const craftableSkills = getCraftableSkills();
    if (craftableSkills.length === 0) { showMessage("Bạn đã học tất cả kỹ năng!"); return; }
    if (ancientBooks < CRAFTING_COST) { showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`); return; }
    
    const randomIndex = Math.floor(Math.random() * craftableSkills.length);
    const newSkillBlueprint = craftableSkills[randomIndex];
    const newOwnedSkill: OwnedSkill = {
        id: `owned-${Date.now()}-${newSkillBlueprint.id}`,
        skillId: newSkillBlueprint.id,
        level: 1,
    };

    setAncientBooks(prev => prev - CRAFTING_COST);
    setOwnedSkills(prev => [...prev, newOwnedSkill]);
    setNewlyCraftedSkill(newSkillBlueprint);
  };

  const handleDisenchantSkill = (skillToDisenchant: OwnedSkill) => {
    if (equippedSkills.some(s => s?.id === skillToDisenchant.id)) {
      showMessage("Không thể phân rã kỹ năng đang trang bị.");
      return;
    }
    const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToDisenchant.skillId);
    if (!skillBlueprint) return;

    const booksToReturn = Math.floor(CRAFTING_COST / 2);
    setOwnedSkills(prev => prev.filter(s => s.id !== skillToDisenchant.id));
    setAncientBooks(prev => prev + booksToReturn);

    setSelectedSkill(null);
    showMessage(`Đã phân rã ${skillBlueprint.name}, nhận lại ${booksToReturn} Sách Cổ.`);
  };

  // --- START: HÀM NÂNG CẤP KỸ NĂNG MỚI ---
  const handleUpgradeSkill = (skillToUpgrade: OwnedSkill) => {
      const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId);
      if (!skillBlueprint || skillBlueprint.upgradeCost === undefined || skillBlueprint.maxLevel === undefined) {
          showMessage("Kỹ năng này không thể nâng cấp.");
          return;
      }
      if (equippedSkills.some(s => s?.id === skillToUpgrade.id)) {
          showMessage("Vui lòng tháo kỹ năng trước khi nâng cấp.");
          return;
      }
      if (skillToUpgrade.level >= skillBlueprint.maxLevel) {
          showMessage("Kỹ năng đã đạt cấp tối đa.");
          return;
      }
      if (gold < skillBlueprint.upgradeCost) {
          showMessage(`Không đủ vàng. Cần ${skillBlueprint.upgradeCost}.`);
          return;
      }

      setGold(prev => prev - skillBlueprint.upgradeCost!);
      
      const updatedSkill = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };

      setOwnedSkills(prev => prev.map(s => s.id === skillToUpgrade.id ? updatedSkill : s));
      setSelectedSkill(updatedSkill);
      showMessage(`Nâng cấp ${skillBlueprint.name} lên Cấp ${updatedSkill.level} thành công!`);
  }
  // --- END: HÀM NÂNG CẤP KỸ NĂNG MỚI ---

  return (
    <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
       <style>{`
        .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); }
        .animate-spin-slow-360 { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; }
        @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
      `}</style>
      
      {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-50">{message}</div>}
      
      {/* --- START: CẬP NHẬT CÁCH GỌI MODAL VỚI LOGIC MỚI --- */}
      {selectedSkill && <SkillDetailModal 
          ownedSkill={selectedSkill} 
          onClose={() => setSelectedSkill(null)} 
          onEquip={handleEquipSkill} 
          onDisenchant={handleDisenchantSkill}
          onUpgrade={handleUpgradeSkill}
          isEquipped={equippedSkills.some(s => s?.id === selectedSkill.id)} 
          gold={gold}
      />}
      {/* --- END: CẬP NHẬT CÁCH GỌI MODAL --- */}

      {newlyCraftedSkill && <CraftingSuccessModal skill={newlyCraftedSkill} onClose={() => setNewlyCraftedSkill(null)} />}

      <div className="relative z-10 flex flex-col w-full h-screen">
        <Header gold={gold} ancientBooks={ancientBooks} />
        <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 p-4 sm:p-6 md:p-8">
            <section className="flex-shrink-0 py-4">
                <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                    {equippedSkills.map((skill, index) => (<SkillSlot key={`equipped-${index}`} ownedSkill={skill} onClick={() => handleUnequipSkill(index)} />))}
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
                    disabled={ancientBooks < CRAFTING_COST || getCraftableSkills().length === 0}
                >
                  Train
                </button>
            </section>
            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 text-center uppercase tracking-widest flex-shrink-0 title-glow">Kho Kỹ Năng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2">
                    {/* --- START: RENDER DANH SÁCH KỸ NĂNG ĐÃ SỞ HỮU --- */}
                    {ownedSkills.length > 0 ? (
                        ownedSkills
                            .slice() // Tạo bản sao để không thay đổi state gốc
                            .sort((a, b) => {
                                const skillA = ALL_SKILLS.find(s => s.id === a.skillId)!;
                                const skillB = ALL_SKILLS.find(s => s.id === b.skillId)!;
                                // Sắp xếp theo độ hiếm, rồi theo tên
                                const rarityOrder = ['E', 'D', 'B', 'A', 'S', 'SR'];
                                if (rarityOrder.indexOf(skillB.rarity) !== rarityOrder.indexOf(skillA.rarity)) {
                                    return rarityOrder.indexOf(skillB.rarity) - rarityOrder.indexOf(skillA.rarity);
                                }
                                return skillA.name.localeCompare(skillB.name);
                            })
                            .map(ownedSkill => (
                                <SkillCard key={ownedSkill.id} ownedSkill={ownedSkill} onClick={() => setSelectedSkill(ownedSkill)} isEquipped={equippedSkills.some(s => s?.id === ownedSkill.id)} />
                            ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center h-full text-slate-500"><p>Chưa có kỹ năng. Hãy dùng Sách Cổ để Train!</p></div>
                    )}
                    {/* --- END: RENDER DANH SÁCH KỸ NĂNG ĐÃ SỞ HỮU --- */}
                </div>
            </section>
        </main>
      </div>
    </div>
  );
}
