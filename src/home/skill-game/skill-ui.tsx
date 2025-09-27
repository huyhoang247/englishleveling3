// --- START OF FILE src/home/skill-game/skill-ui.tsx ---

import React, { memo, useState, useEffect, useRef } from 'react';
import { SkillProvider, useSkillContext, MergeGroup, SkillScreenExitData } from './skill-context.tsx';
import {
    ALL_SKILLS,
    CRAFTING_COST,
    getActivationChance,
    getUpgradeCost,
    getRarityColor,
    getRarityGradient,
    getRarityTextColor,
    getRarityDisplayName,
    type OwnedSkill,
} from './skill-data.tsx';
import { uiAssets } from '../../game-assets.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import RateLimitToast from '../../thong-bao.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import SkillScreenSkeleton from './skill-loading.tsx';
import UpgradeEffectToast from './upgrade-effect-toast.tsx';

// --- CÁC ICON GIAO DIỆN CHUNG (SVG GIỮ NGUYÊN) ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}> <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l-2.72-2.72a1 1 0 010-1.414l4.243-4.243a1 1 0 011.414 0l2.72 2.72a4 4 0 011.343 2.863l3.155-1.262a1 1 0 011.23 1.23l-1.262 3.155a4 4 0 01-1.343 2.863l2.72 2.72a1 1 0 010 1.414l-4.243 4.243a1 1 0 01-1.414 0l-2.72-2.72a4 4 0 01-2.863-1.343L6.663 15.147a1 1 0 01-1.23-1.23z" /> <path d="M11.379 4.424a1 1 0 01-1.414 0L4.424 9.965a1 1 0 010 1.414l2.121 2.121a1 1 0 011.414 0l5.54-5.54a1 1 0 010-1.414l-2.121-2.121z" /> </svg>);

// --- CÁC COMPONENT CON (ĐÃ BỌC TRONG React.memo) ---
const Header = memo(({ goldValue }: { goldValue: number }) => {
    const { handleClose } = useSkillContext();
    const animatedGold = useAnimateValue(goldValue);
    return (
        <header className="flex-shrink-0 w-full bg-black/20 border-b-2 border-slate-800/50 backdrop-blur-sm">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-0">
                 <button onClick={handleClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Quay lại Trang Chính" title="Quay lại Trang Chính">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
                </button>
                <div className="flex items-center gap-4 sm:gap-6">
                    <CoinDisplay displayedCoins={animatedGold} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
});

const SkillSlot = memo(({ ownedSkill, onClick }: { ownedSkill: OwnedSkill | null, onClick: () => void }) => {
  const { isProcessing } = useSkillContext();
  const skillBlueprint = ownedSkill ? ALL_SKILLS.find(s => s.id === ownedSkill.skillId) : null;
  const baseClasses = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 transition-all duration-300 flex items-center justify-center group";
  const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer';
  const borderStyle = ownedSkill && skillBlueprint ? `${getRarityColor(ownedSkill.rarity)} hover:opacity-80` : 'border-dashed border-slate-600 hover:border-slate-400';
  const backgroundStyle = skillBlueprint ? 'bg-slate-900/80' : 'bg-slate-900/50';
  const IconComponent = skillBlueprint?.icon;

  return (
    <div className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} onClick={!isProcessing ? onClick : undefined} title={skillBlueprint ? `${skillBlueprint.name} - Lv.${ownedSkill?.level}` : 'Ô trống'}>
      {ownedSkill && skillBlueprint && IconComponent ? (
        <>
          <div className="transition-all duration-300 group-hover:scale-110">
             <IconComponent className={`w-12 h-12 sm:w-14 sm:h-14 ${getRarityTextColor(ownedSkill.rarity)}`} />
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
});

const SkillInventorySlot = memo(({ ownedSkill, onClick, isProcessing }: { ownedSkill: OwnedSkill; onClick: (skill: OwnedSkill) => void; isProcessing: boolean; }) => {
    const skillBlueprint = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    if (!skillBlueprint) return null;
    const IconComponent = skillBlueprint.icon;
    const baseClasses = "relative aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center group";
    const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer hover:scale-105 hover:shadow-lg';
    const borderStyle = getRarityColor(ownedSkill.rarity);
    const backgroundStyle = 'bg-slate-900/80';
    const shadowRarity = getRarityColor(ownedSkill.rarity).replace('border-', '');
    const shadowColorStyle = { '--tw-shadow-color': `var(--tw-color-${shadowRarity})` } as React.CSSProperties;
    
    return (
        <div 
            className={`${baseClasses} ${borderStyle} ${backgroundStyle} ${interactivity}`} 
            onClick={!isProcessing ? () => onClick(ownedSkill) : undefined}
            style={shadowColorStyle}
            title={`${skillBlueprint.name} - Lv.${ownedSkill.level}`}
        >
            <>
                <IconComponent 
                    className={`w-3/4 h-3/4 object-contain transition-transform duration-200 group-hover:scale-110 ${getRarityTextColor(ownedSkill.rarity)}`}
                />
                <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">
                    Lv.{ownedSkill.level}
                </span>
            </>
        </div>
    );
});

const SkillDetailModal = memo(({ ownedSkill }: { ownedSkill: OwnedSkill }) => {
    const { handleCloseDetailModal, handleEquipSkill, handleUnequipSkill, handleDisenchantSkill, handleUpgradeSkill, equippedSkills, gold, isProcessing } = useSkillContext();
    const skill = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    
    const [upgradeToast, setUpgradeToast] = useState({ show: false, oldValue: 0, newValue: 0 });

    const calculateEffectValue = (level: number) => {
        if (!skill || skill.baseEffectValue === undefined || skill.effectValuePerLevel === undefined) return 0;
        return skill.baseEffectValue + (level - 1) * skill.effectValuePerLevel;
    };

    if (!skill) return null;

    const isEquipped = equippedSkills.some(s => s?.id === ownedSkill.id);
    const IconComponent = skill.icon;
    const isUpgradable = skill.upgradeCost !== undefined;
    const currentUpgradeCost = isUpgradable ? getUpgradeCost(skill.upgradeCost!, ownedSkill.level) : 0;
    const canAffordUpgrade = isUpgradable && gold >= currentUpgradeCost;
    const currentEffectValue = calculateEffectValue(ownedSkill.level);
    const actionDisabled = isProcessing;
    const mainActionText = isEquipped ? 'Remove' : 'Equip';
    const mainActionHandler = () => isEquipped ? handleUnequipSkill(ownedSkill) : handleEquipSkill(ownedSkill);
    const mainActionStyle = isEquipped 
        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 active:scale-100'
        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100';
    const mainActionDisabledStyle = 'bg-slate-700 text-slate-500 cursor-not-allowed';

    const handleLocalUpgradeClick = () => {
        if (!canAffordUpgrade || actionDisabled) return;
        const oldValue = currentEffectValue;
        const newValue = currentEffectValue + skill.effectValuePerLevel!;
        setUpgradeToast({ show: true, oldValue, newValue });
        setTimeout(() => {
            setUpgradeToast({ show: false, oldValue: 0, newValue: 0 });
        }, 1600);
        handleUpgradeSkill(ownedSkill);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseDetailModal} />
          <div className={`relative bg-gradient-to-br ${getRarityGradient(ownedSkill.rarity)} p-5 rounded-xl border-2 ${getRarityColor(ownedSkill.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
            <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(ownedSkill.rarity)}`}>{skill.name}</h3>
                <button onClick={handleCloseDetailModal} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Đóng" className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(ownedSkill.rarity)} bg-gray-800/70 border ${getRarityColor(ownedSkill.rarity)} capitalize`}>{getRarityDisplayName(ownedSkill.rarity)}</span>
                <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {ownedSkill.level}</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2">
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(ownedSkill.rarity)} shadow-inner`}><IconComponent className={`w-20 h-20 ${getRarityTextColor(ownedSkill.rarity)}`} /></div>
                <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-700/50 text-left">
                    <p className="text-slate-300 text-sm leading-relaxed">{skill.description(ownedSkill.level, ownedSkill.rarity)}</p>
                </div>
                {skill.baseEffectValue !== undefined && ( <div className="w-full text-left text-sm p-3 bg-black/20 rounded-lg border border-slate-700/50"> <div className="flex justify-between"> <span className="text-slate-400">Tỉ lệ Kích Hoạt:</span> <span className="font-semibold text-cyan-300">{getActivationChance(ownedSkill.rarity)}%</span> </div> </div> )}
                {isUpgradable && (
                    <div className="w-full mb-4 space-y-2">
                        <div className="relative w-full p-3 rounded-lg transition-colors duration-300 text-left flex items-center justify-between bg-black/20 border border-slate-700/80">
                            <UpgradeEffectToast isVisible={upgradeToast.show} oldValue={upgradeToast.oldValue} newValue={upgradeToast.newValue} />
                            <div className="flex flex-col">
                                <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Nâng Cấp</span>
                                <div className="flex items-center gap-2 font-bold text-lg mt-1">
                                    <span className="text-slate-300">{currentEffectValue}%</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    <span className="text-green-400">{currentEffectValue + skill.effectValuePerLevel!}%</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleLocalUpgradeClick} 
                                disabled={!canAffordUpgrade || actionDisabled} 
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 transform
                                ${!canAffordUpgrade || actionDisabled ? 'bg-slate-700 border border-slate-600 text-slate-500 cursor-not-allowed' : 'bg-slate-800 border border-slate-600 text-yellow-300 hover:scale-105 active:scale-100'}`} >
                                <img src={uiAssets.goldIcon} alt="Vàng" className="w-5 h-5"/> 
                                <span className={`font-bold text-sm`}>{currentUpgradeCost.toLocaleString()}</span>
                            </button>
                        </div>
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
                <button onClick={() => handleDisenchantSkill(ownedSkill)} disabled={isEquipped || actionDisabled} className={`flex-1 font-bold text-sm uppercase py-3 rounded-lg transition-all duration-300 transform ${isEquipped || actionDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-100'}`}>
                  Recycle
                </button>
              </div>
            </div>
          </div>
        </div>
    );
});

const CraftingSuccessModal = memo(({ ownedSkill }: { ownedSkill: OwnedSkill }) => {
    const { handleCloseCraftSuccessModal } = useSkillContext();
    const skill = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    if (!skill) return null;
    const IconComponent = skill.icon;
    const rarityTextColor = getRarityTextColor(ownedSkill.rarity);
    const rarityColor = getRarityColor(ownedSkill.rarity).replace('border-', ''); 
    const shadowStyle = { boxShadow: `0 0 25px -5px ${rarityColor}, 0 0 15px -10px ${rarityColor}` };
    return ( 
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> 
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseCraftSuccessModal}></div> 
            <div className="relative w-full max-w-sm"> 
                <div className="absolute inset-0.5 animate-spin-slow-360"> 
                    <div className={`absolute -inset-2 bg-gradient-to-r ${getRarityGradient(ownedSkill.rarity)} opacity-50 rounded-full blur-2xl`}></div> 
                </div> 
                <div 
                    className={`relative bg-gradient-to-b ${getRarityGradient(ownedSkill.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(ownedSkill.rarity)} text-center flex flex-col items-center gap-3`} 
                    style={shadowStyle}
                > 
                    <h2 className="text-lg font-semibold tracking-wider uppercase text-white title-glow">Chế Tạo Thành Công</h2> 
                    
                    <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(ownedSkill.rarity)} shadow-inner`}>
                        <IconComponent className={`w-20 h-20 ${rarityTextColor}`} />
                    </div>

                    <div className="flex flex-col items-center">
                        <span className={`text-2xl font-bold ${rarityTextColor}`}>{skill.name}</span>
                        <span className="font-semibold text-slate-300 mt-1 capitalize">{getRarityDisplayName(ownedSkill.rarity)}</span>
                    </div>

                    <p className="text-sm text-slate-400 mt-1">{skill.description(1, ownedSkill.rarity)}</p>
                </div> 
            </div> 
        </div> 
    );
});

const MergeModal = memo(() => {
    const { 
        isMergeModalOpen, 
        handleCloseMergeModal, 
        handleMergeSkills, 
        isProcessing, 
        mergeableGroups 
    } = useSkillContext();

    if (!isMergeModalOpen) return null;

    return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseMergeModal} />
      <div className="relative bg-gradient-to-br from-gray-900 to-slate-900 p-5 rounded-xl border-2 border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col">
        <div className="flex-shrink-0 border-b border-slate-700/50 pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <MergeIcon className="w-7 h-7 text-purple-400" />
              <h3 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Hợp Nhất Kỹ Năng</h3>
            </div>
            <button onClick={handleCloseMergeModal} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Đóng" className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-slate-400 mt-2">Hợp nhất 3 kỹ năng <span className="font-bold text-white">cùng loại, cùng hạng</span> để tạo 1 kỹ năng hạng cao hơn. Hệ thống sẽ ưu tiên các kỹ năng cấp cao nhất.</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2 space-y-4">
          {mergeableGroups.length > 0 ? (
            mergeableGroups.map(group => (
              <div key={`${group.skillId}-${group.rarity}`} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center justify-center gap-4 sm:gap-6">
                  <div className={`relative w-16 h-16 flex items-center justify-center rounded-md border-2 ${getRarityColor(group.rarity)} bg-black/30`}>
                    <group.blueprint.icon className={`w-10 h-10 ${getRarityTextColor(group.rarity)}`} />
                    <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-slate-700">3/{group.skills.length}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  <div className={`relative w-16 h-16 flex items-center justify-center rounded-md border-2 ${getRarityColor(group.nextRarity!)} bg-black/30`}>
                    <group.blueprint.icon className={`w-10 h-10 ${getRarityTextColor(group.nextRarity!)}`} />
                  </div>
                </div>
                <button onClick={() => handleMergeSkills(group)} disabled={isProcessing} title="Hợp Nhất" className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm h-8 px-4 rounded-md shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">Merge</button>
              </div>
            ))
          ) : ( <div className="flex items-center justify-center h-full text-slate-500 text-center py-10"><p>Không có kỹ năng nào có thể hợp nhất.</p></div> )}
        </div>
      </div>
    </div>
    );
});


function SkillScreenContent() {
    const {
        isLoading, gold, isProcessing, ancientBooks, ownedSkills,
        equippedSkills, unequippedSkillsSorted, selectedSkill, newlyCraftedSkill,
        message, messageKey, mergeToast, craftErrorToast, equipErrorToast, disenchantSuccessToast,
        handleCraftSkill, handleSelectSkill, handleOpenMergeModal, MAX_SKILLS_IN_STORAGE
    } = useSkillContext();
    
    const displayGold = isLoading ? 0 : gold;

    return (
        <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] font-sans text-white overflow-hidden">
            <style>{` .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>

            <RateLimitToast show={mergeToast.show} message={mergeToast.message} showIcon={false} />
            <RateLimitToast show={craftErrorToast.show} message={craftErrorToast.message} showIcon={false} />
            <RateLimitToast show={equipErrorToast.show} message={equipErrorToast.message} showIcon={false} />
            <RateLimitToast show={disenchantSuccessToast.show} message={disenchantSuccessToast.message} showIcon={false} />
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
            {selectedSkill && <SkillDetailModal ownedSkill={selectedSkill} />}
            {newlyCraftedSkill && <CraftingSuccessModal ownedSkill={newlyCraftedSkill} />}
            <MergeModal />
            
            <div className={`absolute inset-0 z-20 ${isLoading ? '' : 'hidden'}`}>
                <SkillScreenSkeleton />
            </div>
            
            <div className={`relative z-10 flex flex-col w-full h-screen ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Header goldValue={displayGold} />
                <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8">
                    <section className="flex-shrink-0 py-4">
                        <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                            {equippedSkills.map((skill, index) => (<SkillSlot key={`equipped-${index}`} ownedSkill={skill} onClick={() => skill && handleSelectSkill(skill)} />))}
                        </div>
                    </section>
                    <section className="flex-shrink-0 p-3 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={uiAssets.bookIcon} alt="Sách Cổ" className="w-10 h-10" />
                            <div className="flex items-baseline gap-1"><span className="text-xl font-bold text-white">{ancientBooks}</span><span className="text-base text-slate-400">/ {CRAFTING_COST}</span></div>
                        </div>
                        <button onClick={handleCraftSkill} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" disabled={ancientBooks < CRAFTING_COST || isProcessing || ownedSkills.length >= MAX_SKILLS_IN_STORAGE}>Craft</button>
                    </section>
                    <section className="w-full p-4 bg-black/20 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col flex-grow min-h-0">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Storage</h2>
                                <span className="text-sm font-semibold text-slate-300">{unequippedSkillsSorted.length}<span className="text-xs text-slate-500"> / {MAX_SKILLS_IN_STORAGE}</span></span>
                            </div>
                            <button onClick={handleOpenMergeModal} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}><MergeIcon className="w-4 h-4" />Merge</button>
                        </div>
                        <div className="flex-grow min-h-0 overflow-y-auto hide-scrollbar -m-1 p-1">
                            {unequippedSkillsSorted.length > 0 ? (
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {unequippedSkillsSorted.map((ownedSkill) => (
                                        <SkillInventorySlot
                                            key={ownedSkill.id}
                                            ownedSkill={ownedSkill}
                                            onClick={handleSelectSkill}
                                            isProcessing={isProcessing}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <p>Kho chứa trống.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

interface SkillScreenProps {
  onClose: (dataUpdated: boolean, data?: SkillScreenExitData) => void;
  userId: string;
}

export default function SkillScreen({ onClose, userId }: SkillScreenProps) {
    return (
        <SkillProvider userId={userId} onClose={onClose}>
            <SkillScreenContent />
        </SkillProvider>
    );
}
// --- END OF FILE src/home/skill-game/skill-ui.tsx ---
