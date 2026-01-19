// --- START OF FILE src/home/skill-game/skill-ui.tsx ---

import React, { memo, useState, useEffect, useCallback } from 'react';
import { SkillProvider, useSkillContext, MergeGroup, SkillScreenExitData } from './skill-context.tsx';
import {
    ALL_SKILLS,
    CRAFTING_COST,
    getActivationChanceFallback, // Hàm fallback cho skill cũ
    calculateTotalActivationChance, // Hàm tính tổng tỉ lệ
    getUpgradeCost,
    getRarityColor,
    getRarityGradient,
    getRarityTextColor,
    getRarityDisplayName,
    type OwnedSkill,
} from './skill-data.tsx';
import { uiAssets } from '../../game-assets.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import RateLimitToast from '../../ui/notification.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import SkillScreenSkeleton from './skill-loading.tsx';
import UpgradeEffectToast from './upgrade-effect-toast.tsx';

// --- IMPORT MỚI: Component hiệu ứng Rank & Crafting Effect ---
import ItemRankBorder from '../equipment/item-rank-border.tsx'; 
import CraftingEffectCanvas from '../equipment/crafting-effect.tsx';

// --- URL BACKGROUND ---
const SKILL_BG_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-skill.webp";

// --- CÁC ICON GIAO DIỆN CHUNG ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> 
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> 
    </svg> 
);

const MergeIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}> 
        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l-2.72-2.72a1 1 0 010-1.414l4.243-4.243a1 1 0 011.414 0l2.72 2.72a4 4 0 011.343 2.863l3.155-1.262a1 1 0 011.23 1.23l-1.262 3.155a4 4 0 01-1.343 2.863l2.72 2.72a1 1 0 010 1.414l-4.243 4.243a1 1 0 01-1.414 0l-2.72-2.72a4 4 0 01-2.863-1.343L6.663 15.147a1 1 0 01-1.23-1.23z" /> 
        <path d="M11.379 4.424a1 1 0 01-1.414 0L4.424 9.965a1 1 0 010 1.414l2.121 2.121a1 1 0 011.414 0l5.54-5.54a1 1 0 010-1.414l-2.121-2.121z" /> 
    </svg>
);

// --- COMPONENT HEADER ---
const Header = memo(({ goldValue }: { goldValue: number }) => {
    const { handleClose } = useSkillContext();
    const animatedGold = useAnimateValue(goldValue);
    return (
        <header className="flex-shrink-0 w-full bg-slate-900/90 border-b-2 border-slate-800/50">
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

// --- SKILL SLOT (EQUIPPED) ---
const SkillSlot = memo(({ ownedSkill, onClick }: { ownedSkill: OwnedSkill | null, onClick: () => void }) => {
  const { isProcessing } = useSkillContext();
  const skillBlueprint = ownedSkill ? ALL_SKILLS.find(s => s.id === ownedSkill.skillId) : null;
  
  const sizeClasses = "w-24 h-24 sm:w-28 sm:h-28";
  const interactivity = isProcessing ? 'cursor-wait' : 'cursor-pointer';

  const renderContent = () => (
    <>
        {ownedSkill && skillBlueprint && skillBlueprint.icon ? (
            <>
                <div className="transition-all duration-300 group-hover:scale-110 relative z-10 drop-shadow-md">
                    <skillBlueprint.icon className={`w-12 h-12 sm:w-14 sm:h-14 ${getRarityTextColor(ownedSkill.rarity)}`} />
                </div>
                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold bg-black/80 text-white rounded-md border border-slate-600 z-20 shadow-sm">
                    Lv.{ownedSkill.level}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl pointer-events-none z-0" />
            </>
        ) : (
            <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-slate-400 transition-colors text-center relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-40 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-semibold uppercase mt-1 opacity-70">Empty</span>
            </div>
        )}
    </>
  );

  if (ownedSkill && skillBlueprint) {
      return (
          <div 
            className={`relative ${sizeClasses} rounded-xl transition-all duration-300 group ${interactivity} active:scale-95`}
            onClick={!isProcessing ? onClick : undefined}
            title={`${skillBlueprint.name} - Lv.${ownedSkill.level}`}
          >
              <ItemRankBorder rank={ownedSkill.rarity} className="w-full h-full shadow-lg shadow-black/50">
                  {renderContent()}
              </ItemRankBorder>
          </div>
      );
  }

  return (
    <div 
        className={`relative ${sizeClasses} rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center group ${interactivity}`} 
        onClick={!isProcessing ? onClick : undefined} 
        title='Ô Kỹ Năng Trống'
    >
      {renderContent()}
    </div>
  );
});

// --- SKILL INVENTORY SLOT (STORAGE) ---
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

// --- COMPONENT MODAL CHI TIẾT KỸ NĂNG ---
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

    // --- TÍNH TOÁN VÀ HIỂN THỊ TỈ LỆ KÍCH HOẠT ---
    // Sử dụng baseActivationChance nếu có, nếu không thì fallback về logic cũ
    const baseChance = ownedSkill.baseActivationChance ?? getActivationChanceFallback(ownedSkill.rarity);
    const totalChance = calculateTotalActivationChance(baseChance, ownedSkill.level);
    const bonusChance = totalChance - baseChance;
    
    const mainActionText = isEquipped ? 'Unequip' : 'Equip';
    const mainActionHandler = () => isEquipped ? handleUnequipSkill(ownedSkill) : handleEquipSkill(ownedSkill);

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

    const commonBtnClasses = "flex-1 py-2.5 rounded-xl font-lilita text-base tracking-wide shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none uppercase";
    
    const mainActionStyle = isEquipped 
        ? 'bg-gradient-to-r from-rose-800 to-red-950 text-slate-200 hover:from-rose-700 hover:to-red-900 hover:text-white hover:shadow-rose-900/40' 
        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/30'; 
    
    const recycleActionStyle = 'bg-gradient-to-r from-slate-600 to-slate-800 text-slate-200 hover:from-slate-500 hover:to-slate-700 hover:text-white hover:shadow-black/50';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/80" onClick={handleCloseDetailModal} />
          <div className={`relative bg-gradient-to-br ${getRarityGradient(ownedSkill.rarity)} p-5 rounded-xl border-2 ${getRarityColor(ownedSkill.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
            {/* Header Modal */}
            <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(ownedSkill.rarity)}`}>{skill.name}</h3>
                <button onClick={handleCloseDetailModal} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1">
                    <img src={uiAssets.closeIcon} alt="Đóng" className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(ownedSkill.rarity)} bg-gray-800/70 border ${getRarityColor(ownedSkill.rarity)} capitalize`}>
                    {getRarityDisplayName(ownedSkill.rarity)}
                </span>
                <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">
                    Level {ownedSkill.level}
                </span>
              </div>
            </div>

            {/* Body Modal */}
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pr-2">
              <div className="flex flex-col items-center text-center gap-4">
                {/* Icon */}
                <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(ownedSkill.rarity)} shadow-inner`}>
                    <IconComponent className={`w-20 h-20 ${getRarityTextColor(ownedSkill.rarity)}`} />
                </div>
                
                {/* Description */}
                <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-700/50 text-left">
                    <p className="text-slate-300 text-sm leading-relaxed">{skill.description(ownedSkill.level, ownedSkill.rarity)}</p>
                </div>
                
                {/* --- DISPLAY ACTIVATION CHANCE (Giao diện mới) --- */}
                {skill.baseEffectValue !== undefined && ( 
                    <div className="w-full text-left text-sm p-3 bg-black/20 rounded-lg border border-slate-700/50 flex flex-col gap-2"> 
                        <div className="flex justify-between items-center border-b border-white/10 pb-2"> 
                            <span className="text-slate-400 font-semibold">Tỉ lệ Kích Hoạt:</span> 
                            <span className="font-bold text-cyan-300 text-xl drop-shadow-sm">{totalChance}%</span>
                        </div> 
                        
                        <div className="flex justify-between items-center text-[11px] sm:text-xs">
                             <div className="flex flex-col sm:flex-row sm:gap-2 text-slate-500 italic">
                                <span>Base: <span className="text-white font-medium">{baseChance}%</span></span>
                                <span className="hidden sm:inline">|</span>
                                <span>Bonus: <span className="text-green-400 font-medium">+{bonusChance}%</span></span>
                             </div>
                             
                             {/* --- MILESTONE NOTE --- */}
                             <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-900/20 px-2 py-0.5 rounded border border-amber-500/30 whitespace-nowrap">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span>+5% / 20 Lv</span>
                             </div>
                        </div>
                    </div> 
                )}
                
                {/* Upgrade Logic */}
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

            {/* Footer Buttons */}
            <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4">
              <div className="flex items-center gap-3">
                <button 
                    onClick={mainActionHandler} 
                    disabled={actionDisabled} 
                    className={`${commonBtnClasses} ${actionDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : mainActionStyle}`}
                >
                  {mainActionText}
                </button>
                <button 
                    onClick={() => handleDisenchantSkill(ownedSkill)} 
                    disabled={isEquipped || actionDisabled} 
                    className={`${commonBtnClasses} ${isEquipped || actionDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : recycleActionStyle}`}
                >
                  Recycle
                </button>
              </div>
            </div>
          </div>
        </div>
    );
});

// --- COMPONENT CHẾ TẠO THÀNH CÔNG ---
const CraftingSuccessModal = memo(({ ownedSkill }: { ownedSkill: OwnedSkill }) => {
    const { handleCloseCraftSuccessModal } = useSkillContext();
    const skill = ALL_SKILLS.find(s => s.id === ownedSkill.skillId);
    if (!skill) return null;
    const IconComponent = skill.icon;
    const rarityTextColor = getRarityTextColor(ownedSkill.rarity);
    const rarityColor = getRarityColor(ownedSkill.rarity).replace('border-', ''); 
    const shadowStyle = { boxShadow: `0 0 25px -5px var(--tw-color-${rarityColor}), 0 0 15px -10px var(--tw-color-${rarityColor})` };
    
    // Lấy tỉ lệ base để hiển thị kết quả random
    const baseChance = ownedSkill.baseActivationChance ?? getActivationChanceFallback(ownedSkill.rarity);

    return ( 
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> 
            <div className="fixed inset-0 bg-black/80" onClick={handleCloseCraftSuccessModal}></div> 
            <div className="relative w-full max-w-sm"> 
                <div className="absolute inset-0.5 animate-spin-slow-360"> 
                    <div className={`absolute -inset-2 bg-gradient-to-r ${getRarityGradient(ownedSkill.rarity)} opacity-50 rounded-full blur-2xl`}></div> 
                </div> 
                <div 
                    className={`relative bg-gradient-to-b ${getRarityGradient(ownedSkill.rarity)} p-6 rounded-2xl border-2 ${getRarityColor(ownedSkill.rarity)} text-center flex flex-col items-center gap-4`} 
                    style={shadowStyle}
                > 
                    <h2 className="text-lg font-semibold tracking-wider uppercase text-white title-glow">Chế Tạo Thành Công</h2> 
                    
                    <div className={`w-28 h-28 flex items-center justify-center bg-black/40 rounded-xl border-2 ${getRarityColor(ownedSkill.rarity)} shadow-inner`}>
                        <IconComponent className={`w-20 h-20 ${rarityTextColor}`} />
                    </div>
                    
                    <div className="w-full p-4 bg-black/25 rounded-lg border border-slate-700/50 text-center flex flex-col gap-2">
                        <div>
                            <h3 className={`text-xl font-bold ${rarityTextColor}`}>{skill.name}</h3>
                            <p className={`font-semibold ${getRarityTextColor(ownedSkill.rarity)} opacity-80 capitalize text-sm`}>{getRarityDisplayName(ownedSkill.rarity)}</p>
                        </div>
                        <hr className="border-slate-700/50 my-1" />
                        <p className="text-sm text-slate-300 leading-relaxed">{skill.description(1, ownedSkill.rarity)}</p>
                        {/* Show Chance Info */}
                        <div className="mt-2 bg-black/40 rounded px-3 py-1.5 border border-slate-700/50 inline-block mx-auto">
                            <span className="text-xs text-slate-400 mr-2">Tỉ lệ kích hoạt (Base): </span>
                            <span className="text-sm font-bold text-cyan-300">{baseChance}%</span>
                        </div>
                    </div>

                </div> 
            </div> 
        </div> 
    );
});

// --- COMPONENT MERGE MODAL ---
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
      <div className="fixed inset-0 bg-black/80" onClick={handleCloseMergeModal} />
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

// --- MAIN CONTENT COMPONENT ---
function SkillScreenContent() {
    const {
        isLoading, gold, isProcessing, ancientBooks, ownedSkills,
        equippedSkills, unequippedSkillsSorted, selectedSkill, newlyCraftedSkill,
        message, messageKey, mergeToast, craftErrorToast, equipErrorToast, disenchantSuccessToast,
        handleCraftSkill, handleSelectSkill, handleOpenMergeModal, MAX_SKILLS_IN_STORAGE
    } = useSkillContext();
    
    // State cho hiệu ứng Crafting
    const [isCraftingAnimation, setIsCraftingAnimation] = useState(false);
    const [minTimeElapsed, setMinTimeElapsed] = useState(true);
    const CRAFT_DURATION = 3000; 

    const onCraftClick = useCallback(() => {
        setIsCraftingAnimation(true);
        setMinTimeElapsed(false);
        handleCraftSkill();
        setTimeout(() => setMinTimeElapsed(true), CRAFT_DURATION);
    }, [handleCraftSkill]);

    useEffect(() => {
        if (!isProcessing && minTimeElapsed) {
            const timer = setTimeout(() => setIsCraftingAnimation(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isProcessing, minTimeElapsed]);

    const displayGold = isLoading ? 0 : gold;
    const showEffect = isCraftingAnimation;

    return (
        <div 
            className="main-bg relative w-full min-h-screen font-sans text-white overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${SKILL_BG_URL})` }}
        >
            <div className="absolute inset-0 bg-black/85 pointer-events-none z-0" />
            <style>{` .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); } .animate-spin-slow-360 { animation: spin 20s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .fade-in-down { animation: fadeInDown 0.5s ease-out forwards; transform: translate(-50%, -100%); left: 50%; opacity: 0; } @keyframes fadeInDown { to { opacity: 1; transform: translate(-50%, 0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>

            {/* Effect Canvas */}
            <CraftingEffectCanvas isActive={showEffect} />

            {/* Toasts */}
            <RateLimitToast show={mergeToast.show} message={mergeToast.message} showIcon={false} />
            <RateLimitToast show={craftErrorToast.show} message={craftErrorToast.message} showIcon={false} />
            <RateLimitToast show={equipErrorToast.show} message={equipErrorToast.message} showIcon={false} />
            <RateLimitToast show={disenchantSuccessToast.show} message={disenchantSuccessToast.message} showIcon={false} />
            
            {message && <div key={messageKey} className="fade-in-down fixed top-5 left-1/2 bg-yellow-500/90 border border-yellow-400 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{message}</div>}
            
            {/* Modals */}
            {!isCraftingAnimation && selectedSkill && <SkillDetailModal ownedSkill={selectedSkill} />}
            {!isCraftingAnimation && newlyCraftedSkill && <CraftingSuccessModal ownedSkill={newlyCraftedSkill} />}
            <MergeModal />
            
            <div className={`absolute inset-0 z-20 ${isLoading ? '' : 'hidden'}`}>
                <SkillScreenSkeleton />
            </div>
            
            {/* Main Content Layout */}
            <div className={`relative z-10 flex flex-col w-full h-screen ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Header goldValue={displayGold} />
                <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 gap-4 px-4 pt-4 pb-16 sm:p-6 md:p-8">
                    {/* Equipped Skills */}
                    <section className="flex-shrink-0 py-4">
                        <div className="flex flex-row justify-center items-center gap-3 sm:gap-5">
                            {equippedSkills.map((skill, index) => (<SkillSlot key={`equipped-${index}`} ownedSkill={skill} onClick={() => skill && handleSelectSkill(skill)} />))}
                        </div>
                    </section>
                    
                    {/* Crafting Action */}
                    <section className="flex-shrink-0 p-3 bg-black/40 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={uiAssets.bookIcon} alt="Sách Cổ" className="w-10 h-10" />
                            <div className="flex items-baseline gap-1"><span className="text-xl font-bold text-white">{ancientBooks}</span><span className="text-base text-slate-400">/ {CRAFTING_COST}</span></div>
                        </div>
                        <button 
                            onClick={onCraftClick} 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-lilita uppercase text-lg tracking-wider py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" 
                            disabled={ancientBooks < CRAFTING_COST || isProcessing || ownedSkills.length >= MAX_SKILLS_IN_STORAGE}
                        >
                            Craft
                        </button>
                    </section>
                    
                    {/* Storage Inventory */}
                    <section className="w-full p-4 bg-black/40 rounded-xl border border-slate-800 flex flex-col flex-grow min-h-0">
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

// --- MAIN WRAPPER COMPONENT ---
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
