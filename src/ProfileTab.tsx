// --- START OF FILE ProfileTab.tsx ---
import { memo } from 'react';

// --- START: HELPERS AND DEPENDENCIES (COPIED FOR REUSABILITY) ---
// Các hàm helper và component con được copy vào đây để file này hoàn toàn độc lập và có thể tái sử dụng ở bất cứ đâu.

const getSlotPlaceholderIcon = (slotType: string) => {
    const icons: { [key: string]: string } = {
        weapon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2009_52_21%20PM.png', helmet: '👑', armor: '🛡️',
        gloves: '🧤', boots: '👢', skin: '💎'
    };
    return icons[slotType] || '?';
};

const getRarityColor = (rarity: string) => {
    switch(rarity) {
        case 'E': return 'border-gray-600';
        case 'D': return 'border-green-700';
        case 'B': return 'border-blue-500';
        case 'A': return 'border-purple-500';
        case 'S': return 'border-yellow-400';
        case 'SR': return 'border-red-500';
        default: return 'border-gray-600';
    }
};

const getRarityGradient = (rarity: string) => {
    switch(rarity) {
        case 'E': return 'from-gray-800/95 to-gray-900/95';
        case 'D': return 'from-green-900/70 to-gray-900';
        case 'B': return 'from-blue-800/80 to-gray-900';
        case 'A': return 'from-purple-800/80 via-black/30 to-gray-900';
        case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900';
        case 'SR': return 'from-red-800/80 via-orange-900/30 to-black';
        default: return 'from-gray-800/95 to-gray-900/95';
    }
};

const getRarityTextColor = (rarity: string) => {
    switch(rarity) {
        case 'E': return 'text-gray-400';
        case 'D': return 'text-green-400';
        case 'B': return 'text-blue-400';
        case 'A': return 'text-purple-400';
        case 'S': return 'text-yellow-300';
        case 'SR': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

const getRarityGlowClass = (rarity: string) => {
    switch(rarity) {
        case 'B': return 'glow-B';
        case 'A': return 'glow-A';
        case 'S': return 'glow-S glow-pulse';
        case 'SR': return 'glow-SR glow-pulse';
        default: return '';
    }
};

const getRarityDisplayName = (rarity: string) => {
    if (!rarity) return 'Unknown Rank';
    return `${rarity.toUpperCase()} Rank`;
}

const ItemTooltip = memo(({ item, isEquipped }: { item: any, isEquipped?: boolean }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{getRarityDisplayName(item.rarity)} • {item.type} {isEquipped && <span className="text-green-400">(Đã trang bị)</span>}</div>
      <div className="text-gray-300 text-xs leading-relaxed">
        { (item.description || '').slice(0, 70) }
        { (item.description || '').length > 70 ? '...' : '' }
      </div>
    </div>
));
// --- END: HELPERS AND DEPENDENCIES ---


// --- COMPONENT MOVED FROM inventory.tsx ---
const EquipmentSlot = memo(({ slotType, item, onSlotClick }: { slotType: string, item: any, onSlotClick: (item: any, slotType: string) => void }) => {
    const rarity = item ? item.rarity : 'E';
    const glowClass = item ? getRarityGlowClass(rarity) : '';
    
    return (
        <div
            className={`group relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item ? getRarityGradient(rarity) : 'from-gray-900/60 to-gray-800/40'} rounded-lg border-2 ${item ? getRarityColor(rarity) : 'border-gray-700/60'} flex items-center justify-center cursor-pointer hover:brightness-125 transition-all duration-200 shadow-lg ${item ? '' : 'shadow-inner'} overflow-hidden ${glowClass}`}
            onClick={() => onSlotClick(item, slotType)}
        >
            {item ? (
                <>
                    <div className="relative z-10 flex items-center justify-center w-full h-full">
                        {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-1.5" /> : <div className="text-3xl">{item.icon}</div>}
                    </div>
                    <ItemTooltip item={item} isEquipped={true} />
                </>
            ) : (
                (() => {
                    const placeholder = getSlotPlaceholderIcon(slotType);
                    if (placeholder.startsWith('http')) {
                        return <img src={placeholder} alt={`${slotType} slot`} className="w-10 h-10 opacity-60" />;
                    }
                    return <span className="text-4xl text-gray-600 opacity-60">{placeholder}</span>;
                })()
            )}
        </div>
    );
});


// --- MAIN COMPONENT FOR THIS FILE ---
interface ProfileTabProps {
    equippedItems: { [key: string]: any | null };
    totalPlayerStats: any;
    onSlotClick: (item: any, slotType: string) => void;
}

export default function ProfileTab({ equippedItems, totalPlayerStats, onSlotClick }: ProfileTabProps) {
    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 sm:gap-x-4 md:gap-x-6 py-4">
            <div className="flex flex-col items-center justify-center gap-y-4">
                {['weapon', 'gloves', 'boots'].map(slotType => (
                    <EquipmentSlot key={slotType} slotType={slotType} item={equippedItems[slotType]} onSlotClick={onSlotClick} />
                ))}
            </div>
            <div className="flex flex-col items-center gap-y-5 self-start pt-2">
                <div className="w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
                     <span className="text-8xl sm:text-9xl drop-shadow-lg" style={{ transform: 'scaleX(-1)' }}>🐻</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-900/50 border border-yellow-600/80 rounded-md px-4 py-1.5 shadow-md shadow-black/40">
                    <span className="text-yellow-400 font-bold text-lg relative top-[-1px]">⚜️</span>
                    <span className="font-bold text-white text-xl tracking-wider">30.3K</span>
                </div>
                <div className="flex items-center justify-around w-full max-w-xs gap-x-4 rounded-full bg-black/30 px-4 py-2 border border-gray-700/50 shadow-inner">
                    <div title={`Health: ${totalPlayerStats.health.toFixed(0)}`} className="flex items-center gap-1.5 text-sm font-semibold">
                        <span className="text-red-400">❤️</span>
                        <span className="text-gray-200">{totalPlayerStats.health > 1000 ? `${(totalPlayerStats.health/1000).toFixed(1)}k` : totalPlayerStats.health.toFixed(0)}</span>
                    </div>
                    <div title={`Damage: ${totalPlayerStats.damage.toFixed(0)}`} className="flex items-center gap-1.5 text-sm font-semibold">
                        <span className="text-gray-400">⚔️</span>
                        <span className="text-gray-200">{totalPlayerStats.damage > 1000 ? `${(totalPlayerStats.damage/1000).toFixed(1)}k` : totalPlayerStats.damage.toFixed(0)}</span>
                    </div>
                    <div title={`Defense: ${totalPlayerStats.defense.toFixed(0)}`} className="flex items-center gap-1.5 text-sm font-semibold">
                        <span className="text-blue-400">🛡️</span>
                        <span className="text-gray-200">{totalPlayerStats.defense.toFixed(0)}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-y-4">
                {['helmet', 'armor', 'skin'].map(slotType => (
                    <EquipmentSlot key={slotType} slotType={slotType} item={equippedItems[slotType]} onSlotClick={onSlotClick} />
                ))}
            </div>
        </div>
    );
}
// --- END OF FILE ProfileTab.tsx ---
