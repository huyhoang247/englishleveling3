// --- START OF FILE PetCollection.tsx ---

import { useState, useMemo, memo } from 'react';
import { uiAssets } from './game-assets.ts';
import { petDatabase, PetData } from './pet-database.ts';
import { playerPetsData, PlayerPet } from './player-pets-data.ts';

// --- START: CÁC HÀM HELPER & STYLING (TÁI SỬ DỤNG TỪ INVENTORY.TSX) ---
// Note: Để giữ file này độc lập, chúng ta sao chép các hàm cần thiết.
// Trong một dự án thực tế, bạn có thể đưa chúng vào một file utils chung.

const getRarityDisplayName = (rarity: string) => {
    if (!rarity) return 'Unknown Rank';
    return `${rarity.toUpperCase()} Rank`;
}
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
const formatStatName = (stat: string) => {
    const translations: { [key: string]: string } = { damage: 'Sát thương', health: 'Máu', defense: 'Phòng thủ', strength: 'Sức mạnh', attackSpeed: 'Tốc độ tấn công', manaRegen: 'Hồi mana', luck: 'May mắn', fireDamage: 'ST Lửa', magicBoost: 'Tăng Phép', intelligence: 'Trí tuệ' };
    return translations[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};
// --- END: CÁC HÀM HELPER & STYLING ---

type CombinedPetData = PetData & Partial<PlayerPet> & { isOwned: boolean };

// --- START: CÁC COMPONENT CON CHUYÊN BIỆT CHO LINH THÚ ---

const PetCard = memo(({ pet, onSelect, isSelected, isActive }: { pet: CombinedPetData, onSelect: (pet: CombinedPetData) => void, isSelected: boolean, isActive: boolean }) => {
    const glowClass = pet.isOwned ? getRarityGlowClass(pet.rarity) : '';
    const cardStateClasses = pet.isOwned 
        ? 'cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95'
        : 'filter grayscale opacity-60 cursor-not-allowed';

    return (
        <div 
            className={`group relative aspect-[4/5] bg-gradient-to-br ${getRarityGradient(pet.rarity)} rounded-xl border-2 ${getRarityColor(pet.rarity)} flex flex-col items-center justify-between p-2 transition-all duration-200 shadow-lg overflow-hidden will-change-transform ${cardStateClasses} ${glowClass} ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
            onClick={() => onSelect(pet)}
        >
            {/* Overlay for locked pets */}
            {!pet.isOwned && (
                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                    <span className="text-5xl opacity-70">🔒</span>
                </div>
            )}
            {isActive && (
                 <div className="absolute top-2 right-2 z-20 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">Active</div>
            )}
            <div className="relative z-0 flex-grow w-full flex items-center justify-center">
                <img src={pet.icon} alt={pet.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className={`w-full text-center py-1.5 px-1 bg-black/40 rounded-b-lg`}>
                <p className={`font-bold text-sm truncate ${getRarityTextColor(pet.rarity)}`}>{pet.name}</p>
                {pet.isOwned && <p className="text-xs text-gray-400">Lv. {pet.level}</p>}
            </div>
        </div>
    );
});

const PetDetailPanel = memo(({ pet, onSetActive, isActive }: { pet: CombinedPetData | null, onSetActive: (id: string) => void, isActive: boolean }) => {
    if (!pet) {
        return (
            <div className="w-full lg:w-2/5 xl:w-1/3 h-full flex flex-col items-center justify-center bg-black/30 rounded-2xl p-6 text-gray-500">
                <span className="text-6xl mb-4">🐾</span>
                <h3 className="text-xl font-bold">Bộ Sưu Tập Linh Thú</h3>
                <p>Chọn một linh thú để xem chi tiết.</p>
            </div>
        );
    }

    const expPercent = pet.isOwned ? (pet.currentExp! / pet.requiredExp!) * 100 : 0;

    return (
        <div className={`w-full lg:w-2/5 xl:w-1/3 h-full flex flex-col bg-gradient-to-b ${getRarityGradient(pet.rarity)} from-20% border-2 ${getRarityColor(pet.rarity)} rounded-2xl p-4 sm:p-6 shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className={`text-3xl font-bold ${getRarityTextColor(pet.rarity)}`}>{pet.name}</h2>
                <p className="text-sm text-gray-400">{getRarityDisplayName(pet.rarity)} • {pet.type}</p>
            </div>

            {/* Image */}
            <div className={`relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-4 p-2 bg-black/30 rounded-full border-2 ${getRarityColor(pet.rarity)} ${getRarityGlowClass(pet.rarity)}`}>
                 <img src={pet.icon} alt={pet.name} className="w-full h-full object-contain" />
            </div>

            {/* Level & Exp */}
            {pet.isOwned && (
                <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-1 text-sm">
                        <span className="font-bold text-gray-200">Level {pet.level}</span>
                        <span className="text-gray-400">{pet.currentExp} / {pet.requiredExp} EXP</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5 border border-gray-700">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${expPercent}%` }}></div>
                    </div>
                </div>
            )}

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed text-center mb-5 bg-black/20 p-3 rounded-lg border border-gray-700/50">{pet.description}</p>
            
            {/* Stats */}
            <div className="mb-5">
                <h4 className="font-bold text-lg text-yellow-300 mb-2">Chỉ Số Cơ Bản</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm">
                    {Object.entries(pet.baseStats).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between">
                            <span className="text-gray-400">{formatStatName(stat)}:</span>
                            <span className="font-semibold text-gray-200">+{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
                <h4 className="font-bold text-lg text-yellow-300 mb-2">Kỹ Năng</h4>
                <ul className="space-y-3">
                    {pet.skills.map(skill => (
                        <li key={skill.name} className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-gray-700/50">
                            <div className="text-2xl mt-0.5">{skill.icon}</div>
                            <div>
                                <h5 className="font-semibold text-white">{skill.name}</h5>
                                <p className="text-xs text-gray-400">{skill.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Action Buttons */}
            {pet.isOwned && (
                <div className="mt-auto pt-4 border-t border-gray-700/50 flex gap-3">
                     <button 
                        onClick={() => onSetActive(pet.id)}
                        disabled={isActive}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {isActive ? 'Đang làm bạn đồng hành' : 'Chọn làm bạn đồng hành'}
                    </button>
                    <button className="px-4 py-2.5 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors duration-200">Nâng Cấp</button>
                </div>
            )}
        </div>
    );
});


// --- END: CÁC COMPONENT CON ---


interface PetCollectionProps {
  onClose: () => void;
}

export default function PetCollection({ onClose }: PetCollectionProps) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(playerPetsData[0]?.id || null);
  const [activePetId, setActivePetId] = useState<string>(playerPetsData[0]?.id);

  // Combine database with player data
  const allPets = useMemo((): CombinedPetData[] => {
    return Array.from(petDatabase.values()).map(basePet => {
      const playerData = playerPetsData.find(p => p.id === basePet.id);
      return {
        ...basePet,
        ...(playerData || {}),
        isOwned: !!playerData,
      };
    }).sort((a, b) => (b.isOwned ? 1 : -1) - (a.isOwned ? 1 : -1) || b.rarity.localeCompare(a.rarity)); // Owned pets first, then by rarity
  }, []);

  const selectedPet = useMemo(() => {
    return allPets.find(p => p.id === selectedPetId) || null;
  }, [selectedPetId, allPets]);

  const handleSelectPet = (pet: CombinedPetData) => {
    setSelectedPetId(pet.id);
  };

  const handleSetActive = (id: string) => {
      setActivePetId(id);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-950 to-black text-white p-4 sm:p-5 flex flex-col z-40">
        <style>{`
            @keyframes subtle-glow-pulse { 50% { opacity: 0.7; transform: scale(1.05); } }
            .glow-B::before, .glow-A::before, .glow-S::before, .glow-SR::before { content: ''; position: absolute; inset: 0; z-index: -1; background: var(--glow-gradient); filter: blur(12px); transition: opacity 0.3s ease-in-out; }
            .glow-B::before { --glow-gradient: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.35) 0%, transparent 75%); }
            .glow-A::before { --glow-gradient: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.45) 0%, transparent 75%); }
            .glow-S::before { --glow-gradient: radial-gradient(ellipse at center, rgba(250, 204, 21, 0.45) 0%, transparent 70%); }
            .glow-SR::before { --glow-gradient: radial-gradient(ellipse at center, rgba(239, 68, 68, 0.55) 0%, transparent 70%); }
            .glow-pulse::before { animation: subtle-glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        `}</style>
      
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700/60 pb-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-yellow-300">🐾 Bộ Sưu Tập Linh Thú</h1>
            <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl flex-shrink-0" aria-label="Đóng">
                <img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" />
            </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            {/* Pet Grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {allPets.map(pet => (
                    <PetCard 
                        key={pet.id} 
                        pet={pet} 
                        onSelect={handleSelectPet}
                        isSelected={selectedPetId === pet.id}
                        isActive={activePetId === pet.id}
                    />
                ))}
            </div>

            {/* Pet Detail Panel */}
            <PetDetailPanel 
                pet={selectedPet} 
                onSetActive={handleSetActive}
                isActive={activePetId === selectedPet?.id}
            />
        </main>
    </div>
  );
}

// --- END OF FILE PetCollection.tsx ---
