// --- START OF FILE skill.tsx (7).txt ---

import React, { useState, useMemo } from 'react';
import {
    ALL_SKILLS,
    CRAFTING_COST,
    getRandomRarity,
    getActivationChance,
    getUpgradeCost,
    getRarityColor,
    getRarityGradient,
    getRarityTextColor,
    getRarityDisplayName,
    // --- MỚI ---
    getNextRarity, 
    RARITY_ORDER,
    // ---
    type OwnedSkill,
    type Rarity, // Import type Rarity
} from './skill-data.tsx';
import CoinDisplay from './coin-display.tsx';

// --- CÁC ICON GIAO DIỆN CHUNG ---
const BookIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1859_Icon%20S%C3%A1ch%20C%E1%BB%95%20Anime_simple_compose_01k0kv0rg5fhzrx8frbtsgqk33.png" alt="Sách Cổ" className={className} /> );
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Vàng" className={className} /> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
// --- MỚI ---
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}> <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /> </svg> );
const QuestionIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );

// --- CÁC COMPONENT CON ---
const Header = ({ gold, onClose }: { gold: number; onClose: () => void; }) => {
    return (
        <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50 backdrop-blur-sm">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                 <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại Trang Chính" title="Quay lại Trang Chính">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
                </button>
                <div className="flex items-center gap-4 sm:gap-6">
                    <CoinDisplay displayedCoins={gold} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
};

const SkillSlot = ({ ownedSkill, onClick, isProcessing, isPlaceholder, isResult }: { ownedSkill: OwnedSkill | null, onClick?: () => void, isProcessing?: boolean, isPlaceholder?: boolean, isResult?: boolean }) => {
  const skillBlueprint = ownedSkill ? ALL_SKILLS.find(s => s.id === ownedSkill.skillId) : null;
  const baseClasses = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 transition-all duration-300 flex items-center justify-center group";
  const interactivity = !isProcessing && onClick ? 'cursor-pointer' : 'cursor-default';
  
  let borderStyle = 'border-dashed border-slate-600';
  if(ownedSkill && skillBlueprint) borderStyle = getRarityColor(ownedSkill.rarity);
  if(isPlaceholder) borderStyle = 'border-dashed border-slate-700';

  const backgroundStyle = skillBlueprint ? 'bg-slate-900/80' : 'bg-slate-900/50';
  const IconComponent = skillBlueprint?.icon;

  if (isResult) {
     const nextRarity = getNextRarity(ownedSkill!.rarity)!;
     return (
        <div className={`${baseClasses} ${getRarityColor(nextRarity)} ${backgroundStyle}`}>
           <div className="flex flex-col items-center gap-1 text-center">
            <QuestionIcon className={`w-10 h-10 ${getRarityTextColor(nextRarity)}`} />
            <span className={`text-xs font-bold ${getRarityTextColor(nextRarity)}`}>{getRarityDisplayName(nextRarity)}</span>
           </div>
        </div>
     )
  }

  return (
    <div className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} onClick={!isProcessing ? onClick : undefined} title={skillBlueprint ? `${skillBlueprint.name} - Lv.${ownedSkill?.level}` : (isPlaceholder ? 'Ô trống' : 'Chọn kỹ năng')}>
      {ownedSkill && skillBlueprint && IconComponent ? (
        <>
          <div className="transition-all duration-300 group-hover:scale-110">
             <IconComponent className={`w-12 h-12 sm:w-14 sm:h-14 ${getRarityTextColor(ownedSkill.rarity)}`} />
          </div>
          <span className="absolute top-1 right-1.5 px-1.5 py-0.5 text-xs font-bold bg-black/60 text-white rounded-md border border-slate-600">
            Lv.{ownedSkill?.level}
          </span>
           {onClick && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><CloseIcon className="w-6 h-6 text-red-400"/></div>}
        </>
      ) : (
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </div>
      )}
    </div>
  );
};

const SkillCard = ({ ownedSkill, onClick, isEquipped, isProcessing, isSelected, isSelectable }: { ownedSkill: OwnedSkill, onClick: () => void, isEquipped: boolean, isProcessing: boolean, isSelected?: boolean, isSelectable?: boolean }) => {
  const skillBlueprint = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
  if (!skillBlueprint) return null;

  let interactivity = '';
  if (isEquipped) {
      interactivity = 'opacity-50 cursor-not-allowed';
  } else if (isProcessing) {
      interactivity = 'cursor-wait';
  } else if (isSelectable === false) { // --- CẬP NHẬT ---
      interactivity = 'opacity-40 cursor-not-allowed';
  } else {
      interactivity = `cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10`;
  }
  
  const borderStyle = isSelected ? `border-cyan-400 shadow-lg shadow-cyan-500/20` : 'border-slate-700';

  const IconComponent = skillBlueprint.icon;
  
  return (
    <div className={`relative w-full p-3 rounded-lg border-2 flex items-center gap-4 transition-all duration-200 ${borderStyle} bg-slate-900/70 ${interactivity}`} onClick={isSelectable !== false && !isEquipped && !isProcessing ? onClick : undefined}>
      {isEquipped && <div className="absolute inset-0 bg-black/40 rounded-lg z-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-cyan-400">Equipped</div>}
      <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-md border ${getRarityColor(ownedSkill.rarity)} bg-black/20`}>
        <IconComponent className={`w-9 h-9 ${getRarityTextColor(ownedSkill.rarity)}`} />
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <h3 className={`text-base font-bold ${getRarityTextColor(ownedSkill.rarity)}`}>{skillBlueprint.name}</h3>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 border ${getRarityColor(ownedSkill.rarity)} ${getRarityTextColor(ownedSkill.rarity)}`}>{ownedSkill.rarity}</span>
        </div>
        <div className="mt-1">
          <span className="text-xs font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded-full border border-slate-600">Level {ownedSkill.level}</span>
        </div>
      </div>
    </div>
  );
};


const SkillDetailModal = ({ ownedSkill, onClose, onEquip, onUnequip, onDisenchant, onUpgrade, isEquipped, gold, isProcessing }: { ownedSkill: OwnedSkill, onClose: () => void, onEquip: (skill: OwnedSkill) => void, onUnequip: (skill: OwnedSkill) => void, onDisenchant: (skill: OwnedSkill) => void, onUpgrade: (skill: OwnedSkill) => void, isEquipped: boolean, gold: number, isProcessing: boolean }) => {
    // ... (Không thay đổi component này)
    const skill = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    if (!skill) return null;

    const IconComponent = skill.icon;
    const isUpgradable = skill.upgradeCost !== undefined;
    const currentUpgradeCost = isUpgradable ? getUpgradeCost(skill.upgradeCost!, ownedSkill.level) : 0;
    const canAffordUpgrade = isUpgradable && gold >= currentUpgradeCost;

    const getCurrentEffectValue = () => {
        if (skill.baseEffectValue === undefined || skill.effectValuePerLevel === undefined) return 0;
        return skill.baseEffectValue + (ownedSkill.level - 1) * skill.effectValuePerLevel;
    };

    const actionDisabled = isProcessing;

    const mainActionText = isEquipped ? 'Remove' : 'Equip';
    const mainActionHandler = () => isEquipped ? onUnequip(ownedSkill) : onEquip(ownedSkill);
    const mainActionStyle = isEquipped 
        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 active:scale-100'
        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100';
    const mainActionDisabledStyle = 'bg-slate-700 text-slate-500 cursor-not-allowed';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <div className={`relative bg-gradient-to-br ${getRarityGradient(ownedSkill.rarity)} p-5 rounded-xl border-2 ${getRarityColor(ownedSkill.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(ownedSkill.rarity)}`}>{skill.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(ownedSkill.rarity)} bg-gray-800/70 border ${getRarityColor(ownedSkill.rarity)} capitalize`}>{getRarityDisplayName(ownedSkill.rarity)}</span>
                <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {ownedSkill.level}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2">
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(ownedSkill.rarity)} shadow-inner`}><IconComponent className={`w-20 h-20 ${getRarityTextColor(ownedSkill.rarity)}`} /></div>
                <p className="text-slate-300 text-base leading-relaxed">{skill.description(ownedSkill.level, ownedSkill.rarity)}</p>
                {isUpgradable && ( <div className="w-full text-left text-sm mt-2 p-3 bg-black/20 rounded-lg border border-slate-700/50"> <div className="flex justify-between"> <span className="text-slate-400">Tỉ lệ Kích Hoạt:</span> <span className="font-semibold text-cyan-300">{getActivationChance(ownedSkill.rarity)}%</span> </div> </div> )}
                {isUpgradable && (
                    <div className="w-full mt-2 mb-4 space-y-2">
                        <button onClick={() => onUpgrade(ownedSkill)} disabled={!canAffordUpgrade || actionDisabled} className="w-full relative p-3 rounded-lg transition-all duration-300 text-left flex items-center justify-between disabled:cursor-not-allowed group bg-black/20 border border-slate-700/80 hover:border-purple-500 disabled:hover:border-slate-700/80 hover:bg-purple-900/20">
                            <div className="flex flex-col">
                                <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Nâng Cấp</span>
                                <div className="flex items-center gap-2 font-bold text-lg mt-1">
                                    <span className="text-slate-300">{getCurrentEffectValue()}%</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    <span className="text-green-400">{getCurrentEffectValue() + skill.effectValuePerLevel!}%</span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${!canAffordUpgrade ? 'bg-slate-700 border border-slate-600' : 'bg-slate-800 border border-slate-600 group-hover:bg-purple-600/50 group-hover:border-purple-500'}`}> <GoldIcon className="w-5 h-5"/> <span className={`font-bold text-sm transition-colors ${!canAffordUpgrade ? 'text-slate-500' : 'text-yellow-300'}`}>{currentUpgradeCost.toLocaleString()}</span> </div>
                        </button>
                        {!canAffordUpgrade && <p className="text-center text-xs text-red-400 mt-1">Không đủ vàng</p>}
                    </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
              <div className="flex items-center gap-3">
                <button onClick={mainActionHandler} disabled={actionDisabled} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${actionDisabled ? mainActionDisabledStyle : mainActionStyle}`}>
                  {mainActionText}
                </button>
                <button onClick={() => onDisenchant(ownedSkill)} disabled={isEquipped || actionDisabled} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped || actionDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-100'}`}>
                  Phân Rã
                </button>
              </div>
            </div>
          </div>
        </div>
    );
};

const CraftingSuccessModal = ({ ownedSkill, onClose }: { ownedSkill: OwnedSkill, onClose: () => void }) => {
    // ... (Không thay đổi component này)
    const skill = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    if (!skill) return null;
    const IconComponent = skill.icon;
    const rarityTextColor = getRarityTextColor(ownedSkill.rarity);
    const rarityColor = getRarityColor(ownedSkill.rarity).replace('border-', ''); 
    const shadowStyle = { boxShadow: `0 0 25px -5px ${rarityColor}, 0 0 15px -10px ${rarityColor}` };
    return ( <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div> <div className="relative w-full max-w-sm"> <div className="absolute inset-0.5 animate-spin-slow-360"> <div className={`absolute -inset-2 bg-gradient-to-r ${getRarityGradient(ownedSkill.rarity)} opacity-50 rounded-full blur-2xl`}></div> </div> <div className={`relative bg-gradient-to-b ${getRarityGradient(ownedSkill.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(ownedSkill.rarity)} text-center flex flex-col items-center gap-4`} style={shadowStyle}> <h2 className="text-2xl font-black tracking-widest uppercase text-white title-glow">Chế Tạo Thành Công</h2> <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(ownedSkill.rarity)} shadow-inner`}> <IconComponent className={`w-20 h-20 ${rarityTextColor}`} /> </div> <div className="flex flex-col"> <span className={`text-2xl font-bold ${rarityTextColor}`}>{skill.name}</span> <span className="font-semibold text-slate-300">{getRarityDisplayName(ownedSkill.rarity)}</span> </div> <p className="text-sm text-slate-400">{skill.description(1, ownedSkill.rarity)}</p> <button onClick={onClose} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"> Tuyệt vời! </button> </div> </div> </div> );
};

// --- MỚI: COMPONENT MERGE SKILLS MODAL ---
const MergeSkillsModal = ({ ownedSkills, onClose, onMerge, isProcessing, equippedSkillIds }: { ownedSkills: OwnedSkill[]; onClose: () => void; onMerge: (ids: string[]) => void; isProcessing: boolean; equippedSkillIds: (string | null)[] }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [localMessage, setLocalMessage] = useState('');

    const showLocalMessage = (text: string) => {
        setLocalMessage(text);
        const timer = setTimeout(() => setLocalMessage(''), 2500);
        return () => clearTimeout(timer);
    };

    const selectedSkills = useMemo(() => ownedSkills.filter(s => selectedIds.includes(s.id)), [selectedIds, ownedSkills]);
    const selectedRarity = useMemo(() => selectedSkills.length > 0 ? selectedSkills[0].rarity : null, [selectedSkills]);
    
    const isReadyToMerge = selectedSkills.length === 3;
    const canMergeRarity = selectedRarity ? getNextRarity(selectedRarity) !== null : false;

    const unequippedSkills = useMemo(() => 
        ownedSkills
            .filter(s => !equippedSkillIds.includes(s.id))
            .sort((a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity) || a.level - b.level)
    , [ownedSkills, equippedSkillIds]);

    const handleSelectSkill = (skill: OwnedSkill) => {
        if (isProcessing) return;
        const nextRarity = getNextRarity(skill.rarity);
        if (!nextRarity) {
            showLocalMessage("Không thể hợp nhất kỹ năng có độ hiếm cao nhất.");
            return;
        }

        if (selectedIds.includes(skill.id)) {
            setSelectedIds(ids => ids.filter(id => id !== skill.id));
        } else {
            if (selectedIds.length >= 3) {
                showLocalMessage("Đã chọn đủ 3 kỹ năng.");
                return;
            }
            if (selectedRarity && skill.rarity !== selectedRarity) {
                showLocalMessage("Phải chọn các kỹ năng có cùng độ hiếm.");
                return;
            }
            setSelectedIds(ids => [...ids, skill.id]);
        }
    };

    const handleMergeClick = () => {
        if (!isReadyToMerge || !canMergeRarity || isProcessing) return;
        onMerge(selectedIds);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#1a1731] p-5 rounded-xl border-2 border-purple-800/50 shadow-2xl w-full max-w-2xl max-h-[95vh] z-50 flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 border-b border-purple-700/30 pb-4 mb-4 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-purple-300 title-glow">Hợp Nhất Kỹ Năng</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                </div>

                {/* Merge Area */}
                <div className="flex-shrink-0 py-4 px-2 bg-black/20 rounded-lg border border-slate-800">
                    <div className="flex justify-around items-center">
                        {[0, 1, 2].map(i => (
                            <SkillSlot key={i} ownedSkill={selectedSkills[i] || null} onClick={() => selectedSkills[i] && handleSelectSkill(selectedSkills[i])} />
                        ))}
                        <div className="text-purple-400 mx-2 sm:mx-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                        {isReadyToMerge && canMergeRarity ? 
                            <SkillSlot ownedSkill={selectedSkills[0]} isResult={true} /> : 
                            <SkillSlot ownedSkill={null} isPlaceholder={true} />
                        }
                    </div>
                     <p className={`text-center text-sm mt-4 h-5 transition-opacity ${localMessage ? 'opacity-100 text-yellow-400' : 'opacity-0'}`}>{localMessage || '...'}</p>
                </div>

                {/* Skill List */}
                <div className="flex-1 min-h-0 mt-4">
                    <p className="text-xs text-slate-400 mb-3 px-1">Chọn 3 kỹ năng cùng độ hiếm (trừ SR) để hợp nhất. Kỹ năng trang bị không thể hợp nhất.</p>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto hide-scrollbar h-full pr-2">
                        {unequippedSkills.map(skill => {
                           const isSelected = selectedIds.includes(skill.id);
                           const isSelectable = !selectedRarity || skill.rarity === selectedRarity;
                           const canBeMerged = getNextRarity(skill.rarity) !== null;
                           return (
                                <SkillCard 
                                    key={skill.id} 
                                    ownedSkill={skill} 
                                    onClick={() => handleSelectSkill(skill)} 
                                    isEquipped={false} 
                                    isProcessing={isProcessing} 
                                    isSelected={isSelected}
                                    isSelectable={isSelectable && canBeMerged}
                                />
                           )
                        })}
                        {unequippedSkills.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">Không có kỹ năng nào để hợp nhất.</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 mt-auto border-t border-purple-700/30 pt-4">
                    <button onClick={handleMergeClick} disabled={!isReadyToMerge || !canMergeRarity || isProcessing} className="w-full font-bold text-lg uppercase py-3 rounded-lg transition-all duration-300 transform disabled:cursor-not-allowed disabled:scale-100 disabled:bg-slate-700 disabled:text-slate-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 active:scale-100">
                        Hợp Nhất
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH ---
interface SkillScreenProps {
  onClose: () => void;
  gold: number;
  ancientBooks: number;
  ownedSkills: OwnedSkill[];
  equippedSkillIds: (string | null)[];
  onSkillsUpdate: (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => Promise<void>;
}

export default function SkillScreen({ onClose, gold, ancientBooks, ownedSkills, equippedSkillIds, onSkillsUpdate }: SkillScreenProps) {
  const [selectedSkill, setSelectedSkill] = useState<OwnedSkill | null>(null);
  const [newlyCraftedSkill, setNewlyCraftedSkill] = useState<OwnedSkill | null>(null);
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false); // --- MỚI ---
  const MAX_SKILLS_IN_STORAGE = 20;

  const equippedSkills = useMemo(() => {
    return equippedSkillIds.map(id => ownedSkills.find(s => s.id === id) || null);
  }, [equippedSkillIds, ownedSkills]);

  const showMessage = (text: string) => {
    setMessage(text);
    setMessageKey(prev => prev + 1);
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  };
  
  const handleEquipSkill = async (skillToEquip: OwnedSkill) => {
    if (isProcessing) return;
    if (equippedSkills.some(s => s?.id === skillToEquip.id)) { showMessage("Kỹ năng đã được trang bị."); return; }
    const firstEmptySlotIndex = equippedSkills.findIndex(slot => slot === null);
    if (firstEmptySlotIndex === -1) { showMessage("Các ô kỹ năng đã đầy."); return; }
    setIsProcessing(true);
    const newEquippedIds = [...equippedSkillIds];
    newEquippedIds[firstEmptySlotIndex] = skillToEquip.id;
    try {
      await onSkillsUpdate({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0, });
      setSelectedSkill(null);
    } catch (error: any) { showMessage(`Lỗi: ${error.message || 'Không thể trang bị'}`); } finally { setIsProcessing(false); }
  };

  const handleUnequipSkill = async (skillToUnequip: OwnedSkill) => {
    if (isProcessing) return;
    const slotIndex = equippedSkillIds.findIndex(id => id === skillToUnequip.id);
    if (slotIndex === -1) { showMessage("Lỗi: Không tìm thấy kỹ năng đã trang bị."); return; }
    setIsProcessing(true);
    const newEquippedIds = [...equippedSkillIds];
    newEquippedIds[slotIndex] = null;
    try {
      await onSkillsUpdate({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0, });
      setSelectedSkill(null);
    } catch (error: any) { showMessage(`Lỗi: ${error.message || 'Không thể tháo'}`); } finally { setIsProcessing(false); }
  };
  
  const handleCraftSkill = async () => {
    if (isProcessing) return;
    if (ancientBooks < CRAFTING_COST) { showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`); return; }
    if (ownedSkills.length >= MAX_SKILLS_IN_STORAGE) { showMessage(`Kho chứa đã đầy (${MAX_SKILLS_IN_STORAGE}/${MAX_SKILLS_IN_STORAGE}). Không thể chế tạo thêm.`); return; }
    setIsProcessing(true);
    const newSkillBlueprint = ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)];
    const newRarity = getRandomRarity();
    const newOwnedSkill: OwnedSkill = { id: `owned-${Date.now()}-${newSkillBlueprint.id}-${Math.random()}`, skillId: newSkillBlueprint.id, level: 1, rarity: newRarity, };
    const newOwnedList = [...ownedSkills, newOwnedSkill];
    try {
      await onSkillsUpdate({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: 0, booksChange: -CRAFTING_COST, });
      setNewlyCraftedSkill(newOwnedSkill);
    } catch(error: any) { showMessage(`Lỗi: ${error.message || 'Chế tạo thất bại'}`); } finally { setIsProcessing(false); }
  };

  const handleDisenchantSkill = async (skillToDisenchant: OwnedSkill) => {
    if (isProcessing) return;
    if (equippedSkills.some(s => s?.id === skillToDisenchant.id)) { showMessage("Không thể phân rã kỹ năng đang trang bị."); return; }
    setIsProcessing(true);
    const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToDisenchant.skillId)!;
    const booksToReturn = Math.floor(CRAFTING_COST / 2);
    const newOwnedList = ownedSkills.filter(s => s.id !== skillToDisenchant.id);
    try {
      await onSkillsUpdate({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: 0, booksChange: booksToReturn });
      setSelectedSkill(null);
      showMessage(`Đã phân rã ${skillBlueprint.name}, nhận lại ${booksToReturn} Sách Cổ.`);
    } catch(error: any) { showMessage(`Lỗi: ${error.message || 'Phân rã thất bại'}`); } finally { setIsProcessing(false); }
  };

  const handleUpgradeSkill = async (skillToUpgrade: OwnedSkill) => {
      if (isProcessing) return;
      const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId);
      
      if (!skillBlueprint || skillBlueprint.upgradeCost === undefined) { 
          showMessage("Kỹ năng này không thể nâng cấp."); 
          return; 
      }
      
      const cost = getUpgradeCost(skillBlueprint.upgradeCost, skillToUpgrade.level);

      if (gold < cost) { 
          showMessage(`Không đủ vàng. Cần ${cost.toLocaleString()}.`); 
          return; 
      }

      setIsProcessing(true);
      const updatedSkill = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
      const newOwnedList = ownedSkills.map(s => s.id === skillToUpgrade.id ? updatedSkill : s);
      try {
        await onSkillsUpdate({ 
            newOwned: newOwnedList, 
            newEquippedIds: equippedSkillIds, 
            goldChange: -cost,
            booksChange: 0, 
        });
        setSelectedSkill(updatedSkill);
      } catch(error: any) { 
          showMessage(`Lỗi: ${error.message || 'Nâng cấp thất bại'}`); 
      } finally { 
          setIsProcessing(false); 
      }
  }

  // --- MỚI: HÀM XỬ LÝ MERGE ---
  const handleMergeSkills = async (idsToMerge: string[]) => {
      if(isProcessing) return;
      if(idsToMerge.length !== 3) {
          showMessage("Cần chọn đủ 3 kỹ năng để hợp nhất.");
          return;
      }
      setIsProcessing(true);
      
      const skillsToMerge = ownedSkills.filter(s => idsToMerge.includes(s.id));
      const firstSkill = skillsToMerge[0];
      const newRarity = getNextRarity(firstSkill.rarity);

      if (!newRarity) {
          showMessage("Không thể hợp nhất kỹ năng có độ hiếm cao nhất.");
          setIsProcessing(false);
          return;
      }
      
      // Chọn ngẫu nhiên 1 trong 3 kỹ năng để nâng cấp
      const skillToUpgrade = skillsToMerge[Math.floor(Math.random() * skillsToMerge.length)];
      
      const mergedSkill: OwnedSkill = {
          ...skillToUpgrade,
          id: `owned-${Date.now()}-${skillToUpgrade.skillId}-merged`,
          rarity: newRarity,
          level: 1, // Reset level về 1 sau khi hợp nhất
      };
      
      const newOwnedList = ownedSkills
          .filter(s => !idsToMerge.includes(s.id)) // Xóa 3 kỹ năng cũ
          .concat(mergedSkill); // Thêm kỹ năng mới

      try {
          await onSkillsUpdate({
              newOwned: newOwnedList,
              newEquippedIds: equippedSkillIds,
              goldChange: 0,
              booksChange: 0,
          });
          setIsMergeModalOpen(false);
          const oldSkillName = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId)?.name;
          showMessage(`Hợp nhất thành công! Nhận được ${oldSkillName} [${getRarityDisplayName(newRarity)}].`);
      } catch (error: any) {
          showMessage(`Lỗi: ${error.message || 'Hợp nhất thất bại'}`);
      } finally {
          setIsProcessing(false);
      }
  };


  return (
    <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
       <style>{` .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7), 0 0 12px rgba(196, 181, 253, 0.5); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
      {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-50">{message}</div>}
      {selectedSkill && <SkillDetailModal ownedSkill={selectedSkill} onClose={() => setSelectedSkill(null)} onEquip={handleEquipSkill} onUnequip={handleUnequipSkill} onDisenchant={handleDisenchantSkill} onUpgrade={handleUpgradeSkill} isEquipped={equippedSkills.some(s => s?.id === selectedSkill.id)} gold={gold} isProcessing={isProcessing}/>}
      {newlyCraftedSkill && <CraftingSuccessModal ownedSkill={newlyCraftedSkill} onClose={() => setNewlyCraftedSkill(null)} />}
      {/* --- MỚI --- */}
      {isMergeModalOpen && <MergeSkillsModal ownedSkills={ownedSkills} onClose={() => setIsMergeModalOpen(false)} onMerge={handleMergeSkills} isProcessing={isProcessing} equippedSkillIds={equippedSkillIds} />}
      
      <div className="relative z-10 flex flex-col w-full h-screen">
        <Header gold={gold} onClose={onClose} />
        <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8">
            <section className="flex-shrink-0 py-4">
                <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                    {equippedSkills.map((skill, index) => ( <SkillSlot key={`equipped-${index}`} ownedSkill={skill} onClick={() => skill && setSelectedSkill(skill)} isProcessing={isProcessing} /> ))}
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
                <button onClick={handleCraftSkill} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" disabled={ancientBooks < CRAFTING_COST || isProcessing}>
                  Craft
                </button>
            </section>
            <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                {/* --- CẬP NHẬT --- */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Storage</h2>
                        <span className="text-sm font-semibold text-slate-300">
                            {ownedSkills.length}
                            <span className="text-xs text-slate-500"> / {MAX_SKILLS_IN_STORAGE}</span>
                        </span>
                    </div>
                    {/* --- MỚI: Nút Merge --- */}
                    <button onClick={() => setIsMergeModalOpen(true)} disabled={isProcessing} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-800/60 hover:bg-purple-700/80 border border-purple-700 transition-colors text-purple-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-wait">
                        <MergeIcon className="w-4 h-4" />
                        Merge
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto hide-scrollbar">
                    {ownedSkills.length > 0 ? (
                        ownedSkills
                            .filter(ownedSkill => !equippedSkillIds.includes(ownedSkill.id))
                            .sort((a, b) => {
                                const rarityIndexA = RARITY_ORDER.indexOf(a.rarity);
                                const rarityIndexB = RARITY_ORDER.indexOf(b.rarity);
                                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                                if (a.level !== b.level) return b.level - a.level;
                                const skillA = ALL_SKILLS.find(s => s.id === a.skillId)!;
                                const skillB = ALL_SKILLS.find(s => s.id === b.skillId)!;
                                return skillA.name.localeCompare(skillB.name);
                            })
                            .map(ownedSkill => ( <SkillCard key={ownedSkill.id} ownedSkill={ownedSkill} onClick={() => setSelectedSkill(ownedSkill)} isEquipped={false} isProcessing={isProcessing} /> ))
                    ) : ( <div className="col-span-full flex items-center justify-center h-full text-slate-500"><p>Chưa có kỹ năng. Hãy dùng Sách Cổ để Craft!</p></div> )}
                </div>
            </section>
        </main>
      </div>
    </div>
  );
}
