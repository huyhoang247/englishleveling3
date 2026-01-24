// --- START OF FILE tower-ui-components.tsx ---

import React, { memo } from 'react';
import { CombatStats } from './tower-context.tsx';
import { uiAssets, bossBattleAssets } from '../../game-assets.ts';
import SkillEffect, { SkillProps } from './skill-effect.tsx';
import { ALL_SKILLS, getRarityColor, getRarityGradient } from '../skill-game/skill-data.tsx';

// --- HELPER: FORMAT NUMBER (k, m, b) ---
const formatLootAmount = (num: number): string => {
    if (num >= 1_000_000_000) {
        return parseFloat((num / 1_000_000_000).toFixed(1)) + 'b';
    }
    if (num >= 1_000_000) {
        return parseFloat((num / 1_000_000).toFixed(1)) + 'm';
    }
    if (num >= 1_000) {
        return parseFloat((num / 1_000).toFixed(1)) + 'k';
    }
    return num.toString();
};

// --- STYLES COMPONENT (OPTIMIZED FOR PERFORMANCE) ---
export const MainBattleStyles = memo(() => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } 
        .font-sans { font-family: sans-serif; } 
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } 
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
        .font-outline { -webkit-text-stroke: 1px #854d0e; text-shadow: 0 4px 6px rgba(0,0,0,0.3); } 

        @keyframes float-up { 
            0% { transform: translateY(0) scale(1); opacity: 1; } 
            20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-80px) scale(1); opacity: 0; } 
        } 
        .animate-float-up { animation: float-up 1.2s ease-out forwards; } 
        
        @keyframes victory-pulse {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -60%) scale(1.1); opacity: 0; }
        }
        .animate-victory-pulse { animation: victory-pulse 3s ease-in-out forwards; }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } 
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } 
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } 
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } 
        
        /* Background overlays */
        .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } 
        .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } 
        .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } 
        
        /* Loot Animations */
        @keyframes loot-pop {
            0% { opacity: 0; transform: scale(0) translateY(50px) rotate(-45deg); }
            40% { opacity: 1; transform: scale(1.2) translateY(-30px) rotate(10deg); }
            60% { transform: scale(0.95) translateY(0) rotate(-5deg); }
            80% { transform: scale(1.05) translateY(-10px) rotate(3deg); }
            100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes fade-in-badge {
            0%, 50% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-loot-pop { animation: loot-pop 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .animate-fade-in-badge { animation: fade-in-badge 0.8s ease-out forwards; }

        /* SKILL NOTIFICATION ANIMATIONS (OPTIMIZED) */
        @keyframes slide-in-left {
            0% { opacity: 0; transform: translateX(-30px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        /* Thêm will-change để tối ưu GPU */
        .animate-slide-in-left { 
            will-change: transform, opacity;
            animation: slide-in-left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }

        @keyframes slide-in-right {
            0% { opacity: 0; transform: translateX(30px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        /* Thêm will-change để tối ưu GPU */
        .animate-slide-in-right { 
            will-change: transform, opacity;
            animation: slide-in-right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }
    `}</style>
));

// --- UI ICONS ---
export const HomeIcon = memo(({ className = '' }: { className?: string }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> 
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> 
    </svg> 
));

// --- FLOATING TEXT COMPONENT ---
export interface DamageTextData {
    id: number;
    text: string;
    color: string;
    x: number; // Percent
    y: number; // Percent
    fontSize: number;
    className?: string; 
    duration?: number; 
}

export const FloatingText = memo(({ data }: { data: DamageTextData }) => {
  const animClass = data.duration && data.duration > 2000 
      ? "animate-victory-pulse" 
      : "animate-float-up";

  return (
    <div 
        key={data.id} 
        className={`absolute font-lilita pointer-events-none z-50 whitespace-nowrap ${animClass} ${data.className || ''}`}
        style={{ 
            left: `${data.x}%`, 
            top: `${data.y}%`,
            color: data.color,
            fontSize: `${data.fontSize}px`,
            transform: data.duration && data.duration > 2000 ? 'translate(-50%, -50%)' : undefined,
            fontWeight: 'bold',
            textShadow: 'none'
        }}
    >
        {data.text}
    </div>
  );
});

// --- LOOT ITEM DEFINITION ---
export interface LootItemData {
    id: number;
    image: string;
    amount: number;
    x: number;
    y: number;
    isVisible: boolean;
}

// --- LOOT ITEM COMPONENT (UPDATED FORMATTING) ---
export const LootItem = memo(({ item }: { item: LootItemData }) => {
    const formattedAmount = formatLootAmount(item.amount);
    
    // Luôn sử dụng text-[10px] và leading-tight cho mọi trường hợp để đồng bộ
    const fontSizeClass = "text-[10px] leading-tight";

    return (
        <div 
            className={`absolute transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2 z-40 ${item.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            style={{ 
                left: `${item.x}%`, 
                top: `${item.y}%`,
            }}
        >
            <div className="animate-loot-pop relative">
                <img src={item.image} alt="Loot" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                <div className={`absolute -bottom-1 -right-1 bg-black/50 text-white font-lilita px-2 py-0.5 rounded-md border border-white/20 shadow-sm min-w-[24px] text-center animate-fade-in-badge tracking-wide z-10 ${fontSizeClass}`}>
                    {formattedAmount}
                </div>
            </div>
        </div>
    );
});

// --- ACTIVE SKILL NOTIFICATION COMPONENT ---
export interface ActiveSkillToastProps {
    id: string; // Skill ID (e.g., 'life_steal')
    name: string;
    rarity: string;
    side: 'left' | 'right'; // left = Player, right = Boss
}

export const ActiveSkillToast = memo(({ skill }: { skill: ActiveSkillToastProps }) => {
    // Tìm blueprint để lấy Icon
    const blueprint = ALL_SKILLS.find(s => s.id === skill.id);
    const Icon = blueprint ? blueprint.icon : () => <div className="w-6 h-6 bg-gray-500 rounded-full"/>;
    
    // Config style dựa trên side
    const alignClass = skill.side === 'left' ? 'flex-row text-left animate-slide-in-left' : 'flex-row-reverse text-right animate-slide-in-right';
    const bgGradient = getRarityGradient(skill.rarity as any);
    const borderColor = getRarityColor(skill.rarity as any);

    return (
        // LƯU Ý: Đã xóa 'backdrop-blur-md'. Thêm 'bg-slate-900' để làm nền cứng tối màu + 'shadow-xl'
        <div className={`flex items-center gap-3 p-2 pr-4 rounded-xl border ${borderColor} bg-gradient-to-r ${bgGradient} bg-slate-900 shadow-xl mb-2 min-w-[180px] max-w-[220px] ${alignClass}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10 shrink-0 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                <Icon className="w-7 h-7 object-contain relative z-10" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-sans text-white/60 tracking-wider uppercase font-bold leading-none mb-0.5">Activated</span>
                <span className={`text-sm font-lilita text-white tracking-wide text-shadow-sm leading-tight`}>{skill.name}</span>
            </div>
        </div>
    );
});

// --- BATTLE EFFECTS LAYER ---
export const BattleEffectsLayer = memo(({ 
    orbEffects, 
    damages, 
    lootItems 
}: { 
    orbEffects: SkillProps[], 
    damages: DamageTextData[],
    lootItems: LootItemData[]
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            {/* Render all skills */}
            {orbEffects.map(effect => (
                <SkillEffect 
                    key={effect.id} 
                    id={effect.id}
                    type={effect.type}
                    delay={effect.delay}
                    startPos={effect.startPos}
                />
            ))}
            
            {/* Render Damages & Text */}
            {damages.map(d => (
                <FloatingText key={d.id} data={d} />
            ))}

            {/* Render Loot */}
            {lootItems.map(item => (
                <LootItem key={item.id} item={item} />
            ))}
        </div>
    );
});

// --- MODALS ---
export const CharacterStatsModal = memo(({ character, characterType, onClose }: { character: CombatStats, characterType: 'player' | 'boss', onClose: () => void }) => {
  const isPlayer = characterType === 'player';
  const title = isPlayer ? 'YOUR STATS' : 'BOSS STATS';
  const titleColor = isPlayer ? 'text-blue-300' : 'text-red-400';
  
  const StatItem = ({ label, icon, current, max }: { label: string, icon: string, current: number, max?: number }) => {
    const valueText = max ? String(max) : String(current);
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0 w-24 h-10 bg-slate-800 rounded-lg flex items-center justify-center gap-2 border border-slate-700 p-2">
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm text-slate-300 tracking-wider">{label}</span>
        </div>
        <div className="flex-grow h-10 bg-black/40 rounded-lg flex items-center justify-center border border-slate-700/80">
          <span className="font-bold text-sm text-white text-shadow-sm tracking-wider">{valueText}</span>
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-4 border-b border-slate-700"><h3 className={`text-xl font-bold text-center ${titleColor} text-shadow-sm tracking-widest`}>{title}</h3></div>
        <div className="p-5 flex flex-col gap-4">
          <StatItem label="HP" icon={uiAssets.statHpIcon} current={character.hp} max={character.maxHp} />
          <StatItem label="ATK" icon={uiAssets.statAtkIcon} current={character.atk} />
          <StatItem label="DEF" icon={uiAssets.statDefIcon} current={character.def} />
        </div>
      </div>
    </div>
  )
});

// --- REWARDS MODAL (UPDATED: REMOVED ENERGY DISPLAY) ---
export const RewardsModal = memo(({ onClose, rewards }: { onClose: () => void, rewards: { coins: number } }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans">✕</button>
            <div className="p-5 pt-8">
                <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Rewards</h3>
                <div className="flex flex-row flex-wrap justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
                        <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                        <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{formatLootAmount(rewards.coins)}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

// --- VICTORY MODAL (UPDATED: REMOVED ENERGY DISPLAY) ---
export const VictoryModal = memo(({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number } }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 animate-fade-in">
        <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
            <img src={bossBattleAssets.victoryIcon} alt="Victory" className="w-16 h-16 object-contain mb-2" />
            <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow">VICTORY</h2>
            <div className="w-full flex flex-col items-center gap-3">
                <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
                <div className="flex flex-row flex-wrap justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                        <img src={bossBattleAssets.coinIcon} alt="Coins" className="w-6 h-6" />
                        <span className="text-xl font-bold text-yellow-300">{formatLootAmount(rewards.coins)}</span>
                    </div>
                </div>
            </div>
            <hr className="w-full border-t border-yellow-500/20 my-5" />
            {!isLastBoss ? (
                <button onClick={onNextFloor} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500">Next Floor</button>
            ) : (
                <button onClick={onRestart} className="w-full px-8 py-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg font-bold text-base text-yellow-50 tracking-wider uppercase border border-yellow-500">Play Again</button>
            )}
        </div>
    </div>
));

export const DefeatModal = memo(({ onRestart }: { onRestart: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 animate-fade-in">
        <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
            <img src={bossBattleAssets.defeatIcon} alt="Defeat" className="w-16 h-16 object-contain mb-2" />
            <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
            <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you.</p>
            <hr className="w-full border-t border-slate-700/50 my-5" />
            <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600">Try Again</button>
        </div>
    </div>
));

// --- END OF FILE tower-ui-components.tsx ---
