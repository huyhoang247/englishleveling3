import React, { useState, useEffect, useCallback } from 'react';

// Constants
const GOLD_ICON = '💰';
const ENHANCEMENT_STONE_ICON = '🪨';
const ENHANCEMENT_STONE_NAME = 'Đá cường hóa';

// Helper function to get rarity styles
const getRarityStyles = (rarity: string) => {
    switch(rarity) {
      case 'common': return {
        borderColor: 'border-gray-500',
        gradient: 'from-gray-700/70 to-gray-800/70',
        textColor: 'text-gray-300',
        glow: ''
      };
      case 'uncommon': return {
        borderColor: 'border-green-500',
        gradient: 'from-green-800/80 to-gray-800/70',
        textColor: 'text-green-400',
        glow: 'shadow-sm shadow-green-500/40'
      };
      case 'rare': return {
        borderColor: 'border-blue-500',
        gradient: 'from-blue-800/80 to-gray-800/70',
        textColor: 'text-blue-400',
        glow: 'shadow-md shadow-blue-500/40'
      };
      case 'epic': return {
        borderColor: 'border-purple-600',
        gradient: 'from-purple-800/80 to-gray-800/70',
        textColor: 'text-purple-400',
        glow: 'shadow-lg shadow-purple-500/40'
      };
      case 'legendary': return {
        borderColor: 'border-orange-500',
        gradient: 'from-red-900 via-orange-800/70 to-red-900',
        textColor: 'text-orange-300',
        glow: 'shadow-md shadow-orange-400/30 legendary-item-glow'
      };
      default: return {
        borderColor: 'border-gray-500',
        gradient: 'from-gray-700/70 to-gray-800/70',
        textColor: 'text-gray-300',
        glow: ''
      };
    }
};

// Initial Player Stats and Items
const initialItems = [
  { id: 1, name: 'Kiếm gỗ', type: 'weapon', rarity: 'common', description: 'Một thanh kiếm gỗ cơ bản.', stats: { damage: 5, durability: 20 }, quantity: 1, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/kiem-go.png', level: 0, maxLevel: 5 },
  { id: 2, name: 'Thuốc hồi máu', type: 'potion', rarity: 'common', description: 'Hồi phục 50 máu.', stats: { healing: 50 }, quantity: 5, icon: '🧪' },
  { id: 3, name: 'Áo giáp da', type: 'armor', rarity: 'common', description: 'Áo giáp cơ bản.', stats: { defense: 10 }, quantity: 1, icon: '🥋', level: 0, maxLevel: 5 },
  { id: 4, name: 'Kiếm sắt', type: 'weapon', rarity: 'uncommon', description: 'Kiếm sắt sắc bén.', stats: { damage: 15, durability: 50 }, quantity: 1, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000a42c61f78b535b5ca4f2e8f2.png', level: 0, maxLevel: 7 },
  { id: 17, name: ENHANCEMENT_STONE_NAME, type: 'material', rarity: 'uncommon', description: 'Dùng để nâng cấp vũ khí và giáp.', quantity: 20, icon: ENHANCEMENT_STONE_ICON },
  { id: 9, name: 'Vàng', type: 'currency', rarity: 'common', description: 'Tiền tệ trong game.', quantity: 1450, icon: GOLD_ICON },
  { id: 8, name: 'Kiếm rồng', type: 'weapon', rarity: 'epic', description: 'Vũ khí huyền thoại.', stats: { damage: 45, fireDamage: 20, durability: 100 }, quantity: 1, icon: '🔥', level: 0, maxLevel: 10 },
  { id: 10, name: 'Giáp huyền thoại', type: 'armor', rarity: 'legendary', description: 'Giáp từ vảy rồng.', stats: { defense: 50, magicResist: 30 }, quantity: 1, icon: '🛡️', level: 0, maxLevel: 15 },
];

// Interface for items
interface Item {
  id: number;
  name: string;
  type: string;
  rarity: string;
  description: string;
  stats?: { [key: string]: number };
  quantity: number;
  icon: string;
  level?: number;
  maxLevel?: number;
}

interface UpgradableItem extends Item {
  level: number;
  maxLevel: number;
  stats: { [key: string]: number };
}

// Format stat name (Vietnamese)
const formatStatName = (stat: string) => {
    const translations: { [key: string]: string } = {
      damage: 'Sát thương', durability: 'Độ bền', healing: 'Hồi máu', defense: 'Phòng thủ',
      energyRestore: 'Hồi năng lượng', magicBoost: 'Tăng phép', intelligence: 'Trí tuệ',
      resurrection: 'Hồi sinh', fireDamage: 'Sát thương lửa', strength: 'Sức mạnh',
      attackSpeed: 'Tốc độ đánh', manaRegen: 'Hồi mana', range: 'Tầm xa',
      poisonDamage: 'Sát thương độc', duration: 'Thời gian', magicResist: 'Kháng phép',
      manaRestore: 'Hồi mana', speed: 'Tốc độ', cleanse: 'Thanh tẩy',
      strengthBoost: 'Tăng sức mạnh', luck: 'May mắn',
    };
    return translations[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};


// --- INVENTORY TAB ---
interface InventoryTabProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  onClose?: () => void; // Optional: if you have a general close for the whole game UI
  onSelectItemForUpgrade: (item: UpgradableItem) => void;
  playerGold: number;
  enhancementStones: number;
}

function InventoryTab({ items, setItems, onClose, onSelectItemForUpgrade, playerGold, enhancementStones }: InventoryTabProps) {
  const [selectedItemModal, setSelectedItemModal] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAnimation, setModalAnimation] = useState(false);
  const totalInventorySlots = 50;
  const occupiedSlots = items.filter(item => item.type !== 'currency').length;


  const handleItemClick = (item: Item) => {
    setSelectedItemModal(item);
    setIsModalOpen(true);
    setModalAnimation(true);
    setTimeout(() => setModalAnimation(false), 300);
  };

  const closeModal = () => {
    setModalAnimation(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setModalAnimation(false);
      setSelectedItemModal(null);
    }, 200);
  };

  const ItemTooltip = ({ item }: { item: Item }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityStyles(item.rarity).textColor}`}>{item.name} {item.level !== undefined && `+${item.level}`}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{item.type} • {item.rarity}</div>
      <div className="text-gray-300 text-xs leading-relaxed">{item.description.slice(0, 70)}{item.description.length > 70 ? '...' : ''}</div>
    </div>
  );

  const ItemModal = ({ item, isOpen, onClose: closeModalFunc }: { item: Item | null, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen || !item) return null;
    const rarityStyles = getRarityStyles(item.rarity);
    const isLegendary = item.rarity === 'legendary';

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${modalAnimation ? 'opacity-0' : 'opacity-100'} z-40`} onClick={closeModalFunc}></div>
        <div className={`relative bg-gradient-to-br ${rarityStyles.gradient} p-5 rounded-xl border-2 ${rarityStyles.borderColor} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 ${rarityStyles.glow} ${modalAnimation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
          {isLegendary && (
            <>
              <div className="absolute inset-0 rounded-xl border-2 border-orange-300/30 animate-pulse [animation-duration:3s] opacity-50"></div>
              <div className="absolute -inset-0.5 bg-orange-400/20 opacity-20 blur-lg rounded-xl -z-10 animate-pulse-stronger"></div>
            </>
          )}
          <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
            <h3 className={`text-2xl font-bold ${rarityStyles.textColor} ${isLegendary ? 'flex items-center gap-x-2' : ''}`}>
              {isLegendary && <span className="text-orange-100 opacity-80 text-xl">✦</span>}
              {item.name} {item.level !== undefined && `+${item.level}`}
              {isLegendary && <span className="text-orange-100 opacity-80 text-xl">✦</span>}
            </h3>
            <button onClick={closeModalFunc} className="relative z-50 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close Icon" className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl ${isLegendary ? 'bg-gradient-to-br from-gray-900 via-orange-900/80 to-gray-900' : 'bg-black/30'} rounded-lg border-2 ${rarityStyles.borderColor} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}>
              {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x64/333333/FFFFFF?text=?')} /> : <div className="text-2xl sm:text-3xl relative z-0">{item.icon}</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rarityStyles.textColor} ${isLegendary ? 'bg-gradient-to-r from-orange-900 to-gray-800 border border-orange-500/40 shadow-md shadow-orange-500/20' : 'bg-gray-800/70 border border-gray-700'} capitalize`}>
                  {isLegendary ? `✦ ${item.rarity.toUpperCase()} ✦` : item.rarity}
                </span>
                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                {item.quantity > 1 && (
                  <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">
                    x{item.quantity}
                  </div>
                )}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          {item.stats && (
            <div className={`mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border ${isLegendary ? 'border-orange-700/40' : 'border-gray-700/50'} text-sm`}>
              {Object.entries(item.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
                  <span className={`font-semibold ${isLegendary ? rarityStyles.textColor : getRarityStyles('common').textColor}`}>
                    {stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5">
            {(item.type === 'weapon' || item.type === 'armor') && item.level !== undefined && item.maxLevel !== undefined && (
              <button 
                onClick={() => {
                  onSelectItemForUpgrade(item as UpgradableItem);
                  closeModalFunc();
                }}
                className={`flex-1 px-4 py-2.5 ${isLegendary 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 border border-yellow-300/50 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm`}>
                Đưa vào lò rèn
              </button>
            )}
            <button className={`flex-1 px-4 py-2.5 ${isLegendary ? 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 border border-orange-400/50 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm`}>Sử dụng</button>
            <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">Bỏ</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-1 sm:p-2">
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-4">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center mb-2 sm:mb-0">
          <span className="mr-2 text-3xl">📦</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            Túi Đồ
          </span>
        </h2>
        <div className="flex items-center space-x-4">
            <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/80">
                <span className="text-gray-400">Số ô: </span>
                <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span>
            </div>
            <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/80 flex items-center">
                <span className="text-yellow-400 mr-1">{GOLD_ICON}</span>
                <span className="font-semibold text-gray-200">{playerGold}</span>
            </div>
            <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/80 flex items-center">
                <span className="text-blue-400 mr-1">{ENHANCEMENT_STONE_ICON}</span>
                <span className="font-semibold text-gray-200">{enhancementStones}</span>
            </div>
        </div>
      </div>

      <ItemModal item={selectedItemModal} isOpen={isModalOpen} onClose={closeModal} />

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden pb-4">
        {items.filter(item => item.type !== 'currency' && item.name !== ENHANCEMENT_STONE_NAME).map((item: Item) => {
          const rarityStyles = getRarityStyles(item.rarity);
          const isLegendary = item.rarity === 'legendary';
          return (
            <div
              key={item.id}
              className={`group relative w-full aspect-square ${isLegendary ? 'bg-gradient-to-br from-gray-900 via-orange-900/80 to-gray-900' : `bg-gradient-to-br ${rarityStyles.gradient}`} rounded-lg border-2 ${rarityStyles.borderColor} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${rarityStyles.glow} overflow-hidden`}
              onClick={() => handleItemClick(item)}
            >
              {isLegendary && (
                <>
                  <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div>
                  <div className="absolute top-1 right-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div>
                </>
              )}
              {item.quantity > 1 && (
                <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">
                  x{item.quantity}
                </div>
              )}
              {item.icon.startsWith('http') ? (
                <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x64/333333/FFFFFF?text=?')} />
              ) : (
                <div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
              )}
              {item.level !== undefined && (
                 <div className="absolute top-0.5 left-0.5 bg-black/70 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-10 border border-yellow-500/50">
                    +{item.level}
                 </div>
              )}
              <ItemTooltip item={item} />
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, totalInventorySlots - occupiedSlots) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl">
            <span className="opacity-40">＋</span>
          </div>
        ))}
      </div>
       <style>{`
        .inventory-grid-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .inventory-grid-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .legendary-item-glow { box-shadow: 0 0 10px rgba(255, 165, 0, 0.4), 0 0 20px rgba(255, 69, 0, 0.2); }
        .legendary-item-glow:hover { box-shadow: 0 0 15px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 69, 0, 0.4); }
        @keyframes pulse-stronger { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.02); } }
        .animate-pulse-stronger { animation: pulse-stronger 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
}


// --- BLACKSMITH TAB ---
interface BlacksmithTabProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  selectedItemForUpgrade: UpgradableItem | null;
  setSelectedItemForUpgrade: React.Dispatch<React.SetStateAction<UpgradableItem | null>>;
  playerGold: number;
  setPlayerGold: React.Dispatch<React.SetStateAction<number>>;
  enhancementStones: number;
  setEnhancementStones: React.Dispatch<React.SetStateAction<number>>;
}

function BlacksmithTab({ items, setItems, selectedItemForUpgrade, setSelectedItemForUpgrade, playerGold, setPlayerGold, enhancementStones, setEnhancementStones }: BlacksmithTabProps) {
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const upgradableItems = items.filter(
    item => (item.type === 'weapon' || item.type === 'armor') && item.level !== undefined && item.maxLevel !== undefined && item.stats !== undefined
  ) as UpgradableItem[];

  const handleSelectItem = (itemId: number) => {
    const item = upgradableItems.find(i => i.id === itemId);
    if (item) {
      setSelectedItemForUpgrade(item);
      setUpgradeMessage(null); // Clear previous messages
    }
  };

  const getUpgradeCost = (item: UpgradableItem | null) => {
    if (!item || item.level === undefined) return { gold: 0, stones: 0 };
    // Example cost: increases with level and rarity
    const rarityMultiplier = { common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5 };
    const baseGold = 50;
    const baseStones = 1;
    
    const goldCost = Math.floor(baseGold * Math.pow(1.8, item.level) * (rarityMultiplier[item.rarity as keyof typeof rarityMultiplier] || 1));
    const stonesCost = Math.floor(baseStones * Math.pow(1.5, item.level) * (rarityMultiplier[item.rarity as keyof typeof rarityMultiplier] || 0.5));
    return { gold: goldCost, stones: stonesCost };
  };

  const handleUpgrade = () => {
    if (!selectedItemForUpgrade || selectedItemForUpgrade.level === undefined || selectedItemForUpgrade.maxLevel === undefined) {
      setUpgradeMessage({type: 'error', text: "Vui lòng chọn một vật phẩm để nâng cấp."});
      return;
    }

    if (selectedItemForUpgrade.level >= selectedItemForUpgrade.maxLevel) {
      setUpgradeMessage({type: 'info', text: "Vật phẩm này đã đạt cấp tối đa."});
      return;
    }

    const cost = getUpgradeCost(selectedItemForUpgrade);
    if (playerGold < cost.gold) {
      setUpgradeMessage({type: 'error', text: "Không đủ vàng!"});
      return;
    }
    if (enhancementStones < cost.stones) {
      setUpgradeMessage({type: 'error', text: `Không đủ ${ENHANCEMENT_STONE_NAME}!`});
      return;
    }

    // Consume resources
    setPlayerGold(prevGold => prevGold - cost.gold);
    setEnhancementStones(prevStones => prevStones - cost.stones);

    // Upgrade logic (simple success for now, can add failure chance)
    // For simplicity, let's assume a 100% success rate for now
    const success = true; // Math.random() < (0.9 - selectedItemForUpgrade.level * 0.05); // Example failure chance

    if (success) {
      const updatedItems = items.map(it => {
        if (it.id === selectedItemForUpgrade.id && it.level !== undefined && it.stats) {
          const newItem = { ...it, level: it.level + 1, stats: { ...it.stats } };
          // Increase stats (example: +10% of base for damage/defense, +5 for others)
          Object.keys(newItem.stats).forEach(statKey => {
            if (statKey === 'damage' || statKey === 'defense') {
              newItem.stats![statKey] = Math.round(newItem.stats![statKey] * 1.05 + 1); // More significant increase
            } else if (statKey !== 'durability' && statKey !== 'healing' && statKey !== 'resurrection') { // Don't upgrade these fixed stats
               newItem.stats![statKey] = Math.round(newItem.stats![statKey] * 1.03 + 1) ;
            }
          });
          setSelectedItemForUpgrade(newItem as UpgradableItem); // Update the selected item view
          return newItem;
        }
        return it;
      });
      setItems(updatedItems);
      setUpgradeMessage({type: 'success', text: `Nâng cấp ${selectedItemForUpgrade.name} lên +${selectedItemForUpgrade.level + 1} thành công!`});
    } else {
      setUpgradeMessage({type: 'error', text: `Nâng cấp ${selectedItemForUpgrade.name} thất bại!`});
      // Optional: add penalty like item degradation or loss
    }
  };
  
  const rarityStyles = selectedItemForUpgrade ? getRarityStyles(selectedItemForUpgrade.rarity) : getRarityStyles('common');
  const cost = getUpgradeCost(selectedItemForUpgrade);
  const canUpgrade = selectedItemForUpgrade && selectedItemForUpgrade.level !== undefined && selectedItemForUpgrade.level < selectedItemForUpgrade.maxLevel;


  return (
    <div className="p-1 sm:p-2">
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-4">
        <h2 className="text-2xl font-bold text-orange-400 flex items-center mb-2 sm:mb-0">
          <span className="mr-2 text-3xl">🛠️</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
            Tiệm Rèn
          </span>
        </h2>
         <div className="flex items-center space-x-4">
            <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/80 flex items-center">
                <span className="text-yellow-400 mr-1">{GOLD_ICON}</span>
                <span className="font-semibold text-gray-200">{playerGold}</span>
            </div>
            <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/80 flex items-center">
                <span className="text-blue-400 mr-1">{ENHANCEMENT_STONE_ICON}</span>
                <span className="font-semibold text-gray-200">{enhancementStones}</span>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Item Selection List */}
        <div className="lg:w-1/3 bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Chọn vật phẩm để nâng cấp:</h3>
          {upgradableItems.length === 0 ? (
            <p className="text-gray-500">Không có vật phẩm nào có thể nâng cấp.</p>
          ) : (
            <ul className="space-y-2">
              {upgradableItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelectItem(item.id)}
                    className={`w-full flex items-center p-2.5 rounded-md transition-all duration-150 ease-in-out border-2
                                ${selectedItemForUpgrade?.id === item.id ? `${getRarityStyles(item.rarity).borderColor} ring-2 ring-offset-2 ring-offset-gray-900 ${getRarityStyles(item.rarity).borderColor.replace('border-','ring-')}` : 'border-gray-700 hover:border-gray-500'}
                                ${selectedItemForUpgrade?.id === item.id ? getRarityStyles(item.rarity).gradient.replace('/70', '/40').replace('/80','/50') : 'bg-gray-800/60 hover:bg-gray-700/80'}`}
                  >
                    <div className={`w-10 h-10 flex-shrink-0 ${getRarityStyles(item.rarity).gradient} rounded border ${getRarityStyles(item.rarity).borderColor} flex items-center justify-center mr-3`}>
                        {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/28x28/333333/FFFFFF?text=?')} /> : <span className="text-xl">{item.icon}</span>}
                    </div>
                    <div className="flex-grow text-left">
                      <p className={`font-semibold ${getRarityStyles(item.rarity).textColor}`}>{item.name} <span className="text-yellow-400">{item.level !== undefined && `+${item.level}`}</span></p>
                      <p className="text-xs text-gray-400 capitalize">{item.type} - {item.rarity}</p>
                    </div>
                     {item.level === item.maxLevel && (
                        <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">MAX</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upgrade Interface */}
        <div className="lg:w-2/3 bg-gray-900/30 p-3 sm:p-6 rounded-lg border border-gray-700/30">
          {!selectedItemForUpgrade ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
              <p className="text-xl">Chọn một vật phẩm từ danh sách bên trái</p>
              <p className="text-sm">để xem chi tiết và tiến hành nâng cấp.</p>
            </div>
          ) : (
            <div className={`border-2 ${rarityStyles.borderColor} rounded-lg shadow-xl overflow-hidden bg-gradient-to-br ${rarityStyles.gradient}`}>
              <div className={`p-4 sm:p-6 ${rarityStyles.glow}`}>
                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-gray-700/50">
                    <div className={`w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg border-2 ${rarityStyles.borderColor} ${rarityStyles.gradient} flex items-center justify-center shadow-inner relative overflow-hidden`}>
                        {selectedItemForUpgrade.icon.startsWith('http') ? <img src={selectedItemForUpgrade.icon} alt={selectedItemForUpgrade.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain" onError={(e) => (e.currentTarget.src = 'https://placehold.co/96x96/333333/FFFFFF?text=?')} /> : <span className="text-5xl sm:text-6xl">{selectedItemForUpgrade.icon}</span>}
                        {selectedItemForUpgrade.rarity === 'legendary' && <div className="absolute inset-0 rounded-lg border-2 border-orange-300/30 animate-pulse [animation-duration:2s] opacity-60"></div>}
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className={`text-2xl sm:text-3xl font-bold ${rarityStyles.textColor} mb-1`}>
                            {selectedItemForUpgrade.name} <span className="text-yellow-300">{selectedItemForUpgrade.level !== undefined && `+${selectedItemForUpgrade.level}`}</span>
                        </h3>
                        <p className="text-sm text-gray-400 capitalize mb-2">{selectedItemForUpgrade.type} - {selectedItemForUpgrade.rarity} (Cấp {selectedItemForUpgrade.level}/{selectedItemForUpgrade.maxLevel})</p>
                        <p className="text-xs text-gray-500 italic">{selectedItemForUpgrade.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-1">Thuộc tính hiện tại:</h4>
                        <div className="bg-black/30 p-3 rounded-md border border-gray-700/50 space-y-1">
                        {selectedItemForUpgrade.stats && Object.entries(selectedItemForUpgrade.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-xs">
                                <span className="text-gray-300">{formatStatName(stat)}:</span>
                                <span className={`font-medium ${rarityStyles.textColor}`}>{value}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                    {canUpgrade && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-1">Sau khi nâng cấp (dự kiến):</h4>
                            <div className="bg-black/30 p-3 rounded-md border border-gray-700/50 space-y-1 opacity-75">
                            {selectedItemForUpgrade.stats && Object.entries(selectedItemForUpgrade.stats).map(([stat, value]) => {
                                let nextValue = value;
                                if (stat === 'damage' || stat === 'defense') {
                                    nextValue = Math.round(value * 1.05 + 1);
                                } else if (stat !== 'durability' && stat !== 'healing' && stat !== 'resurrection') {
                                    nextValue = Math.round(value * 1.03 + 1);
                                }
                                return (
                                <div key={stat} className="flex justify-between text-xs">
                                    <span className="text-gray-300">{formatStatName(stat)}:</span>
                                    <span className={`font-medium text-green-400`}>{nextValue} (+{nextValue - value})</span>
                                </div>
                                );
                            })}
                            </div>
                        </div>
                    )}
                </div>
                
                {upgradeMessage && (
                  <div className={`p-3 mb-4 rounded-md text-sm border ${
                    upgradeMessage.type === 'success' ? 'bg-green-900/50 border-green-700 text-green-300' :
                    upgradeMessage.type === 'error' ? 'bg-red-900/50 border-red-700 text-red-300' :
                    'bg-blue-900/50 border-blue-700 text-blue-300'
                  }`}>
                    {upgradeMessage.text}
                  </div>
                )}

                {canUpgrade ? (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Chi phí nâng cấp:</h4>
                            <div className="flex flex-col sm:flex-row justify-around items-center bg-black/30 p-3 rounded-md border border-gray-700/50 space-y-2 sm:space-y-0">
                                <div className="flex items-center">
                                    <span className="text-xl mr-2 text-yellow-400">{GOLD_ICON}</span>
                                    <span className={`${playerGold < cost.gold ? 'text-red-500' : 'text-gray-200'}`}>{cost.gold}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xl mr-2 text-blue-400">{ENHANCEMENT_STONE_ICON}</span>
                                    <span className={`${enhancementStones < cost.stones ? 'text-red-500' : 'text-gray-200'}`}>{cost.stones} ({ENHANCEMENT_STONE_NAME})</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={playerGold < cost.gold || enhancementStones < cost.stones}
                            className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg
                                        ${(playerGold < cost.gold || enhancementStones < cost.stones) 
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                            : `${rarityStyles.textColor.replace('text-', 'bg-').replace('-300', '-600').replace('-400', '-600').replace('-500', '-600')} hover:${rarityStyles.textColor.replace('text-', 'bg-').replace('-300', '-500').replace('-400', '-500').replace('-500', '-500')} text-white`}
                                        border ${rarityStyles.borderColor}`}
                        >
                            Nâng cấp lên +{selectedItemForUpgrade.level + 1}
                        </button>
                    </>
                ) : (
                     <div className="text-center py-4">
                        <p className={`font-semibold text-lg ${rarityStyles.textColor}`}>
                            {selectedItemForUpgrade.level === selectedItemForUpgrade.maxLevel ? "Đã đạt cấp tối đa!" : "Không thể nâng cấp vật phẩm này."}
                        </p>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// --- MAIN APP COMPONENT ---
export default function GameUI() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'blacksmith'>('inventory');
  const [items, setItems] = useState<Item[]>(initialItems);
  const [selectedItemForUpgrade, setSelectedItemForUpgrade] = useState<UpgradableItem | null>(null);

  // Extract gold and enhancement stones from items list
  const getPlayerGold = useCallback(() => {
    const goldItem = items.find(item => item.name === 'Vàng' && item.type === 'currency');
    return goldItem ? goldItem.quantity : 0;
  }, [items]);

  const getEnhancementStones = useCallback(() => {
    const stoneItem = items.find(item => item.name === ENHANCEMENT_STONE_NAME && item.type === 'material');
    return stoneItem ? stoneItem.quantity : 0;
  }, [items]);

  const [playerGold, setPlayerGoldState] = useState(getPlayerGold());
  const [enhancementStones, setEnhancementStonesState] = useState(getEnhancementStones());
  
  // Update gold and stones state when items array changes
    useEffect(() => {
        setPlayerGoldState(getPlayerGold());
        setEnhancementStonesState(getEnhancementStones());
    }, [items, getPlayerGold, getEnhancementStones]);


  const setPlayerGold = (newGold: number | ((prevGold: number) => number)) => {
    setItems(prevItems => {
        return prevItems.map(item => {
            if (item.name === 'Vàng' && item.type === 'currency') {
                return { ...item, quantity: typeof newGold === 'function' ? newGold(item.quantity) : newGold };
            }
            return item;
        });
    });
  };
  
  const setEnhancementStones = (newStones: number | ((prevStones: number) => number)) => {
    setItems(prevItems => {
        return prevItems.map(item => {
            if (item.name === ENHANCEMENT_STONE_NAME && item.type === 'material') {
                return { ...item, quantity: typeof newStones === 'function' ? newStones(item.quantity) : newStones };
            }
            return item;
        });
    });
  };

  const handleSelectItemForUpgradeAndSwitchTab = (item: UpgradableItem) => {
    setSelectedItemForUpgrade(item);
    setActiveTab('blacksmith');
  };


  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white min-h-screen p-3 sm:p-5 font-sans">
      <div className="max-w-5xl mx-auto bg-gray-900 shadow-2xl rounded-xl border border-gray-700/50 overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 text-sm sm:text-base font-semibold transition-colors duration-200 
                        ${activeTab === 'inventory' ? 'bg-gradient-to-b from-yellow-500/10 to-yellow-600/5 border-b-2 border-yellow-400 text-yellow-300' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            <span className="mr-1.5">📦</span> Túi Đồ
          </button>
          <button
            onClick={() => setActiveTab('blacksmith')}
            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 text-sm sm:text-base font-semibold transition-colors duration-200 
                        ${activeTab === 'blacksmith' ? 'bg-gradient-to-b from-orange-500/10 to-orange-600/5 border-b-2 border-orange-400 text-orange-300' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            <span className="mr-1.5">🛠️</span> Tiệm Rèn
          </button>
          {/* Add more tabs here if needed */}
        </div>

        {/* Tab Content */}
        <div className="p-2 sm:p-4">
          {activeTab === 'inventory' && (
            <InventoryTab 
                items={items} 
                setItems={setItems} 
                onSelectItemForUpgrade={handleSelectItemForUpgradeAndSwitchTab}
                playerGold={playerGold}
                enhancementStones={enhancementStones}
            />
          )}
          {activeTab === 'blacksmith' && (
            <BlacksmithTab
              items={items}
              setItems={setItems}
              selectedItemForUpgrade={selectedItemForUpgrade}
              setSelectedItemForUpgrade={setSelectedItemForUpgrade}
              playerGold={playerGold}
              setPlayerGold={setPlayerGold}
              enhancementStones={enhancementStones}
              setEnhancementStones={setEnhancementStones}
            />
          )}
        </div>
      </div>
        <style>{`
            /* Global styles if needed, or for specific animations not covered by Tailwind */
            body {
                font-family: 'Inter', sans-serif; /* Example font */
            }
            .scrollbar-thin::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
                background: rgba(55, 65, 81, 0.5); /* gray-700 with opacity */
                border-radius: 10px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
                background: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.8); /* gray-400 with opacity */
            }
        `}</style>
    </div>
  );
}

