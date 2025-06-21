// --- START OF FULL, SELF-CONTAINED ProfileTab.tsx ---
import { memo, FC, CSSProperties } from 'react';

// --- SECTION 1: STYLES ---
// CSS được nhúng trực tiếp để component hoàn toàn độc lập.
// Bạn không cần thêm những style này vào file CSS chung.
const ComponentStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @layer utilities {
      .text-glow {
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.3), 0 0 20px rgba(251, 191, 36, 0.4);
      }
    }

    .glow-B {
      box-shadow: 0 0 12px 2px rgba(59, 130, 246, 0.4);
    }
    .glow-A {
      box-shadow: 0 0 15px 3px rgba(168, 85, 247, 0.5);
    }
    .glow-S {
      box-shadow: 0 0 20px 4px rgba(250, 204, 21, 0.6);
    }
    .glow-SR {
      box-shadow: 0 0 25px 6px rgba(248, 113, 113, 0.6);
    }

    .glow-pulse {
      animation: glow-pulse-animation 2.5s infinite ease-in-out;
    }

    @keyframes glow-pulse-animation {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.02);
        opacity: 0.85;
      }
    }

    .fade-in-stagger {
        animation: fade-in 0.5s ease-out forwards;
        opacity: 0;
    }
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `}} />
);


// --- SECTION 2: HELPERS AND DEPENDENCIES ---

const getSlotPlaceholderIcon = (slotType: string) => {
    const icons: { [key: string]: string } = {
        weapon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2009_52_21%20PM.png',
        helmet: '👑', armor: '🛡️', gloves: '🧤', boots: '👢', skin: '💎'
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

// --- SECTION 3: CHILD COMPONENTS ---

const ItemTooltip: FC<{ item: any, isEquipped?: boolean }> = memo(({ item, isEquipped }) => (
    <div className="absolute z-30 -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full mb-2 w-52 p-2.5 bg-gray-950/80 backdrop-blur-sm rounded-lg border border-gray-600 shadow-2xl text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
      <div className={`font-bold text-base mb-1 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-400 capitalize text-xs mb-2">{getRarityDisplayName(item.rarity)} • {item.type} {isEquipped && <span className="text-green-400 font-semibold">(Equipped)</span>}</div>
      <div className="text-gray-300 text-xs leading-relaxed border-t border-gray-700 pt-2">
        { (item.description || 'No description available.').slice(0, 100) }
        { (item.description || '').length > 100 ? '...' : '' }
      </div>
    </div>
));
ItemTooltip.displayName = 'ItemTooltip';

const EquipmentSlot: FC<{ slotType: string, item: any, onSlotClick: (item: any, slotType: string) => void, style?: CSSProperties }> = memo(({ slotType, item, onSlotClick, style }) => {
    const rarity = item ? item.rarity : 'E';
    const glowClass = item ? getRarityGlowClass(rarity) : '';
    
    return (
        <div
            className={`group relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-2xl fade-in-stagger`}
            style={style}
            onClick={() => onSlotClick(item, slotType)}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${item ? getRarityGradient(rarity) : 'from-gray-900/50 to-black/30'} rounded-lg border-2 ${item ? getRarityColor(rarity) : 'border-gray-700/60 border-dashed'} ${glowClass} transition-all duration-300 group-hover:brightness-125`}></div>
            
            {item ? (
                <>
                    <div className="relative z-10 flex items-center justify-center w-full h-full">
                        {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" /> : <div className="text-4xl">{item.icon}</div>}
                    </div>
                    <ItemTooltip item={item} isEquipped={true} />
                </>
            ) : (
                (() => {
                    const placeholder = getSlotPlaceholderIcon(slotType);
                    if (placeholder.startsWith('http')) {
                        return <img src={placeholder} alt={`${slotType} slot`} className="w-10 h-10 opacity-30 transition-opacity group-hover:opacity-50" />;
                    }
                    return <span className="text-5xl text-gray-600 opacity-40 transition-opacity group-hover:opacity-60">{placeholder}</span>;
                })()
            )}
        </div>
    );
});
EquipmentSlot.displayName = 'EquipmentSlot';

const StatDisplay: FC<{ icon: string, value: string, label: string, colorClass: string, title: string }> = ({ icon, value, label, colorClass, title }) => (
    <div title={title} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/20 w-20 h-20 justify-center">
        <span className={`text-2xl ${colorClass}`}>{icon}</span>
        <span className="text-white font-bold text-sm tracking-wide">{value}</span>
        <span className="text-gray-400 text-xs uppercase">{label}</span>
    </div>
);


// --- SECTION 4: MAIN COMPONENT LOGIC ---

interface ProfileTabProps {
    equippedItems: { [key:string]: any | null };
    totalPlayerStats: any;
    onSlotClick: (item: any, slotType: string) => void;
}

function ProfileTab({ equippedItems, totalPlayerStats, onSlotClick }: ProfileTabProps) {
    const formatStat = (stat: number) => stat > 1000 ? `${(stat/1000).toFixed(1)}K` : stat.toFixed(0);

    return (
        <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/60 via-gray-900 to-black p-4 sm:p-6 rounded-lg shadow-2xl">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 md:gap-x-8">
                
                <div className="flex flex-col items-center justify-center gap-y-4">
                    {['weapon', 'gloves', 'boots'].map((slotType, index) => (
                        <EquipmentSlot key={slotType} slotType={slotType} item={equippedItems[slotType]} onSlotClick={onSlotClick} style={{ animationDelay: `${150 + index * 100}ms` }} />
                    ))}
                </div>

                <div className="flex flex-col items-center gap-y-4 self-start">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black/50 to-black flex items-center justify-center shadow-lg border-2 border-purple-500/30 fade-in-stagger">
                        <span className="text-8xl sm:text-9xl drop-shadow-lg text-white/80" style={{ transform: 'scaleX(-1)' }}>👤</span>
                    </div>
                    
                    <div className="text-center fade-in-stagger" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-bold text-white tracking-wider">Shadow Bear</h2>
                        <p className="text-sm text-yellow-400 font-semibold">The Runic Guardian</p>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 border border-yellow-700/80 rounded-lg px-6 py-2 shadow-lg shadow-black/50 fade-in-stagger" style={{ animationDelay: '200ms' }}>
                        <span className="text-yellow-300 text-2xl">👑</span>
                        <span className="font-bold text-white text-3xl tracking-wider text-glow">30.3K</span>
                    </div>

                    <div className="flex items-center justify-around w-full max-w-xs gap-x-3 mt-2 fade-in-stagger" style={{ animationDelay: '300ms' }}>
                        <StatDisplay 
                            title={`Health: ${totalPlayerStats.health.toFixed(0)}`}
                            icon="❤️" value={formatStat(totalPlayerStats.health)} label="Health" colorClass="text-red-400"
                        />
                        <StatDisplay 
                            title={`Damage: ${totalPlayerStats.damage.toFixed(0)}`}
                            icon="⚔️" value={formatStat(totalPlayerStats.damage)} label="Damage" colorClass="text-orange-400"
                        />
                        <StatDisplay 
                            title={`Defense: ${totalPlayerStats.defense.toFixed(0)}`}
                            icon="🛡️" value={totalPlayerStats.defense.toFixed(0)} label="Defense" colorClass="text-blue-400"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-y-4">
                     {['helmet', 'armor', 'skin'].map((slotType, index) => (
                        <EquipmentSlot key={slotType} slotType={slotType} item={equippedItems[slotType]} onSlotClick={onSlotClick} style={{ animationDelay: `${150 + index * 100}ms` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- SECTION 5: EXPORTED CONTAINER WITH MOCK DATA ---
// Component này bọc mọi thứ lại, cung cấp Style và dữ liệu mẫu.
// Bạn có thể import và sử dụng nó trực tiếp trong ứng dụng của mình.
export default function ProfileTabContainer() {
    // Dữ liệu mẫu để bạn có thể xem trước component
    const mockEquippedItems = {
        weapon: { name: "Dragon's Fang", type: 'weapon', rarity: 'SR', description: 'A blade forged in dragon fire, pulsating with raw power.', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2009_52_21%20PM.png' },
        helmet: { name: 'Aegis Crown', type: 'helmet', rarity: 'S', description: 'Grants the wearer unparalleled focus and protection.', icon: '👑' },
        armor: { name: 'Guardian Plate', type: 'armor', rarity: 'A', description: 'Solid plate mail that has seen countless battles.', icon: '🛡️' },
        gloves: { name: 'Swiftstrike Gauntlets', type: 'gloves', rarity: 'B', description: 'Lightweight gloves that enhance attack speed.', icon: '🧤' },
        boots: null, // Ô trống
        skin: { name: 'Prismatic Aura', type: 'skin', rarity: 'SR', description: 'A cosmetic aura that shifts through the colors of the rainbow.', icon: '💎' },
    };

    const mockTotalPlayerStats = {
        health: 12540,
        damage: 8250,
        defense: 450,
    };

    const handleSlotClick = (item: any, slotType: string) => {
        if (item) {
            console.log(`Clicked on item in ${slotType} slot:`, item.name);
        } else {
            console.log(`Clicked on empty slot: ${slotType}`);
        }
        alert(`You clicked the ${slotType} slot! Check the console for details.`);
    };

    return (
        <>
            <ComponentStyles />
            <ProfileTab 
                equippedItems={mockEquippedItems}
                totalPlayerStats={mockTotalPlayerStats}
                onSlotClick={handleSlotClick}
            />
        </>
    );
}
// --- END OF FULL, SELF-CONTAINED ProfileTab.tsx ---
