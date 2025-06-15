// --- START OF FILE inventory.tsx (22).txt ---

// --- START OF FILE inventory.tsx ---

import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { uiAssets } from './game-assets.ts'; 
import { itemDatabase } from './inventory/item-database.ts'; 
import { playerInventoryData } from './inventory/player-inventory-data.ts'; 

// --- START: DỮ LIỆU VÀ CÁC LOẠI TRANG BỊ MỚI ---
const basePlayerStats = {
    // Added base health for display purposes
    health: 5000,
    damage: 10,
    defense: 5,
    strength: 15,
    attackSpeed: 1.1,
    manaRegen: 5,
    luck: 2,
};

// The image shows 6 slots. This list from the original code has 6 types, which is a perfect match.
const equipmentSlotTypes = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'skin'];

const getSlotPlaceholderIcon = (slotType: string) => {
    // Using more thematic icons for placeholders
    const icons: { [key: string]: string } = {
        weapon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2009_52_21%20PM.png', helmet: '👑', armor: '🛡️',
        gloves: '🧤', boots: '👢', skin: '💎' // skin can be a relic/amulet
    };
    return icons[slotType] || '?';
};
// --- END: DỮ LIỆU VÀ CÁC LOẠI TRANG BỊ MỚI ---


// --- CÁC HÀM HELPER (BẮT ĐẦU PHẦN NÂNG CẤP GIAO DIỆN) ---
const getHydratedInventory = () => {
  return playerInventoryData.map(playerItem => {
    const baseItem = itemDatabase.get(playerItem.id);
    if (!baseItem) {
      console.warn(`Item with id ${playerItem.id} not found in database.`);
      return null;
    }
    // Logic gỡ trang bị, nếu có 5 vũ khí cùng loại lv1 thì cứ để 5 ô riêng
    const isEquipment = equipmentSlotTypes.includes(baseItem.type);
    if (isEquipment && playerItem.quantity > 1) {
        const items = [];
        for (let i = 0; i < playerItem.quantity; i++) {
            items.push({
                ...baseItem,
                ...playerItem,
                quantity: 1, // Mỗi trang bị là một vật phẩm riêng lẻ
                instanceId: `${playerItem.instanceId}_${i}`, // Tạo instanceId duy nhất
                stats: playerItem.stats ? { ...baseItem.stats, ...playerItem.stats } : baseItem.stats,
            });
        }
        return items;
    }
    
    return {
      ...baseItem,
      ...playerItem,
      stats: playerItem.stats ? { ...baseItem.stats, ...playerItem.stats } : baseItem.stats,
    };
  }).flat().filter(item => item !== null); 
};

const getRarityDisplayName = (rarity: string) => {
    if (!rarity) return 'Unknown Rank';
    return `${rarity.toUpperCase()} Rank`;
}
// --- START: NÂNG CẤP GIAO DIỆN CÁC BẬC HIẾM V2 (HÀO QUANG BÊN TRONG) ---
const getRarityColor = (rarity: string) => { // Dùng cho viền (border)
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
const getRarityGradient = (rarity: string) => { // Dùng cho nền (background)
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
const getRarityTextColor = (rarity: string) => { // Dùng cho màu chữ
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
const getRarityGlowClass = (rarity: string) => { // Trả về class cho hiệu ứng hào quang bên trong
    switch(rarity) {
        // Không có glow cho E, D
        case 'B': return 'glow-B';
        case 'A': return 'glow-A';
        case 'S': return 'glow-S glow-pulse'; // Thêm pulse cho S
        case 'SR': return 'glow-SR glow-pulse'; // Thêm pulse cho SR
        default: return '';
    }
};
// --- END: NÂNG CẤP GIAO DIỆN ---

const formatStatName = (stat: string) => {
    const translations: { [key: string]: string } = { damage: 'Sát thương', health: 'Máu', durability: 'Độ bền', healing: 'Hồi máu', defense: 'Phòng thủ', energyRestore: 'Hồi năng lượng', magicBoost: 'Tăng phép', intelligence: 'Trí tuệ', resurrection: 'Hồi sinh', fireDamage: 'Sát thương lửa', strength: 'Sức mạnh', attackSpeed: 'Tốc độ tấn công', manaRegen: 'Hồi mana', range: 'Tầm xa', poisonDamage: 'Sát thương độc', duration: 'Thời gian', magicResist: 'Kháng phép', manaRestore: 'Hồi mana', speed: 'Tốc độ', cleanse: 'Thanh tẩy', strengthBoost: 'Tăng sức mạnh', luck: 'May mắn' };
    return translations[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const renderItemStats = (item: any) => {
    if (!item.stats) return null;
    return (
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
            <span className={'font-semibold text-gray-300'}>{stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}</span>
          </div>
        ))}
      </div>
    );
};


// --- START: CÁC COMPONENT CON ĐƯỢC TÁCH RA NGOÀI VÀ TỐI ƯU ---

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

const ItemModal = ({ item, isOpen, onClose, animation, onEquip, onUnequip, context }: { item: any, isOpen: boolean, onClose: () => void, animation: boolean, onEquip: (item: any) => void, onUnequip: (item: any) => void, context: 'inventory' | 'profile' | null }) => {
    if (!isOpen || !item) return null;
    
    const isEquippable = equipmentSlotTypes.includes(item.type);
    const isEquipped = context === 'profile';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animation ? 'opacity-0' : 'opacity-100'} z-40`} onClick={onClose}></div>
        <div className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 ${animation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
          <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
            <h3 className={`text-2xl font-bold ${getRarityTextColor(item.rarity)}`}>{item.name}</h3>
            <button onClick={onClose} className="relative z-50 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl bg-black/30 rounded-lg border-2 ${getRarityColor(item.rarity)} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}>
              {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" /> : <div className="text-2xl sm:text-3xl relative z-0">{item.icon}</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(item.rarity)} bg-gray-800/70 border border-gray-700 capitalize`}>{getRarityDisplayName(item.rarity)}</span>
                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                {item.level !== undefined && <span className="bg-blue-800/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 text-xs font-semibold">Level: {item.level}</span>}
                {item.quantity > 1 && <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{item.quantity}</div>}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          {renderItemStats(item)}
           {item.type !== 'currency' && (
            <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5">
              {isEquippable && (
                isEquipped ? 
                <button onClick={() => onUnequip(item)} className={'flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm'}>Gỡ bỏ</button>
                :
                <button onClick={() => onEquip(item)} className={'flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm'}>Trang bị</button>
              )}
              <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">Bỏ</button>
            </div>
          )}
        </div>
      </div>
    );
};

const InventoryItem = memo(({ item, onItemClick }: { item: any, onItemClick: (item: any) => void }) => {
  const glowClass = getRarityGlowClass(item.rarity);
  const isEquipment = equipmentSlotTypes.includes(item.type);

  return (
    <div 
      className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(item.rarity)} rounded-lg border-2 ${getRarityColor(item.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg overflow-hidden will-change-transform ${glowClass}`} 
      onClick={() => onItemClick(item)}
    >
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {item.icon.startsWith('http') ? 
          <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-200" /> : 
          <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
        }
      </div>
      
      {isEquipment && item.level !== undefined && (
          <div className="absolute top-0.5 right-1 text-white text-xs font-bold z-20 text-outline">
              Lv.{item.level}
          </div>
      )}

      {!isEquipment && item.quantity > 1 && item.type !== 'currency' && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-20 border border-white/10">
              x{item.quantity}
          </div>
      )}

      <ItemTooltip item={item} />
    </div>
  );
});

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

const StatsPanel = memo(({ stats }: { stats: any }) => (
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/70 w-full">
        <h3 className="text-lg font-bold text-yellow-300 mb-4 text-center">Chỉ Số Nhân Vật</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between items-baseline">
                    <span className="text-gray-400 capitalize">{formatStatName(stat)}:</span>
                    <span className="font-semibold text-gray-200">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
            ))}
        </div>
    </div>
));

// --- START: COMPONENT TAB LỌC MỚI ---
type FilterType = 'all' | 'equipment' | 'material' | 'other';

const getItemCategory = (type: string): FilterType => {
  const equipmentTypes = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'skin'];
  if (equipmentTypes.includes(type)) return 'equipment';
  if (type === 'material') return 'material';
  return 'other'; // Bao gồm 'potion', 'currency', v.v.
};

const InventoryFilterTabs = ({ activeFilter, onFilterChange }: { activeFilter: FilterType, onFilterChange: (filter: FilterType) => void }) => {
    const tabs = [
        { id: 'all', label: 'Tất cả', icon: '✨' },
        { id: 'equipment', label: 'Trang Bị', icon: '⚔️' },
        { id: 'material', label: 'Nguyên Liệu', icon: '💎' },
        { id: 'other', label: 'Khác', icon: '🧪' },
    ] as const;

    return (
        <div className="flex-shrink-0 w-full bg-black/40 backdrop-blur-lg border-t border-gray-700/60 p-2 z-30">
            <div className="flex justify-center space-x-1 sm:space-x-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 max-w-lg mx-auto shadow-lg">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onFilterChange(tab.id)}
                        className={`flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                            activeFilter === tab.id
                                ? 'bg-yellow-600/30 text-yellow-200 shadow-inner border border-yellow-500/20'
                                : 'text-gray-400 hover:bg-gray-800/60'
                        }`}
                        aria-label={`Filter by ${tab.label}`}
                    >
                        <span>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
// --- END: COMPONENT TAB LỌC MỚI ---


// --- END: CÁC COMPONENT CON ---


interface InventoryManagerProps {
  onClose: () => void;
}

export default function InventoryManager({ onClose }: InventoryManagerProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'profile'>('profile');
  const [inventory, setInventory] = useState(() => getHydratedInventory());
  const [equippedItems, setEquippedItems] = useState<{[key: string]: any | null}>({
      weapon: null, helmet: null, armor: null, gloves: null, boots: null, skin: null
  });

  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [modalContext, setModalContext] = useState<'inventory' | 'profile' | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const filteredInventory = useMemo(() => {
    if (activeFilter === 'all') return inventory;
    return inventory.filter(item => getItemCategory(item.type) === activeFilter);
  }, [inventory, activeFilter]);
  
  const occupiedSlots = inventory.length;

  let totalInventorySlots = 50; 
  if (occupiedSlots >= 81) totalInventorySlots = 100;
  else if (occupiedSlots >= 71) totalInventorySlots = 90;
  else if (occupiedSlots >= 61) totalInventorySlots = 80;
  else if (occupiedSlots >= 51) totalInventorySlots = 70;
  else if (occupiedSlots >= 41) totalInventorySlots = 60;
  
  const totalPlayerStats = useMemo(() => {
      const finalStats = { ...basePlayerStats };
      Object.values(equippedItems).forEach(item => {
          if (item && item.stats) {
              for (const [stat, value] of Object.entries(item.stats)) {
                  finalStats[stat] = (finalStats[stat] || 0) + (value as number);
              }
          }
      });
      return finalStats;
  }, [equippedItems]);

  const gridRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);
  const [scrollingClass, setScrollingClass] = useState('');

  useEffect(() => {
    const gridElement = gridRef.current; if (!gridElement) return;
    const handleScroll = () => { if (!scrollingClass) { setScrollingClass('is-scrolling'); } if (scrollTimeout.current) { clearTimeout(scrollTimeout.current); } scrollTimeout.current = window.setTimeout(() => { setScrollingClass(''); scrollTimeout.current = null; }, 150); };
    gridElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => { gridElement.removeEventListener('scroll', handleScroll); if (scrollTimeout.current) { clearTimeout(scrollTimeout.current); } };
  }, [scrollingClass, activeTab]); // Re-attach listener when tab changes
  
  useEffect(() => {
    if (selectedDetailItem) {
      setIsDetailModalOpen(true);
      setAnimation(true);
      const timer = setTimeout(() => setAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedDetailItem]);
  
  const closeDetailModal = useCallback(() => {
    setAnimation(true);
    setTimeout(() => {
      setIsDetailModalOpen(false);
      setAnimation(false);
      setSelectedDetailItem(null);
      setModalContext(null);
    }, 200);
  }, []);
  
  const openDetailModal = useCallback((item, context: 'inventory' | 'profile') => {
      setSelectedDetailItem(item);
      setModalContext(context);
  }, []);

  const handleInventoryItemClick = useCallback((item) => {
    openDetailModal(item, 'inventory');
  }, [openDetailModal]);

  const handleProfileSlotClick = useCallback((item, slotType) => {
      if(item) {
          openDetailModal(item, 'profile');
      }
  }, [openDetailModal]);
  
  const handleEquip = useCallback((itemToEquip) => {
      const slot = itemToEquip.type;
      if (!equipmentSlotTypes.includes(slot)) return;
      const currentItemInSlot = equippedItems[slot];
      setEquippedItems(prev => ({...prev, [slot]: itemToEquip }));
      setInventory(prev => {
          const newInventory = prev.filter(i => i.instanceId !== itemToEquip.instanceId);
          if (currentItemInSlot) { newInventory.push(currentItemInSlot); }
          return newInventory;
      });
      closeDetailModal();
  }, [equippedItems, closeDetailModal]);

  const handleUnequip = useCallback((itemToUnequip) => {
      const slot = itemToUnequip.type;
      if (!equipmentSlotTypes.includes(slot)) return;
      setEquippedItems(prev => ({...prev, [slot]: null }));
      setInventory(prev => [...prev, itemToUnequip]);
      closeDetailModal();
  }, [closeDetailModal]);


  return (
    // SỬA LỖI: Dùng fixed inset-0 để chiếm toàn màn hình và flex-col để chia layout
    <div className="fixed inset-0 bg-gradient-to-b from-gray-950 to-black text-white p-4 sm:p-5 flex flex-col z-40">
      
      {/* 1. HEADER - Cố định ở trên cùng */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-700/60 pb-4 flex-shrink-0">
          <div className="flex space-x-2 bg-gray-900/70 p-1 rounded-lg border border-gray-800 w-full sm:w-auto">
              <button onClick={() => setActiveTab('inventory')} className={`flex items-center justify-center gap-2 flex-1 sm:flex-auto px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'inventory' ? 'bg-yellow-500/20 text-yellow-300 shadow-inner' : 'text-gray-400 hover:bg-gray-800/60'}`}>
                <span>📦</span>
                <span>Túi Đồ</span>
              </button>
              <button onClick={() => setActiveTab('profile')} className={`flex items-center justify-center gap-2 flex-1 sm:flex-auto px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'profile' ? 'bg-yellow-500/20 text-yellow-300 shadow-inner' : 'text-gray-400 hover:bg-gray-800/60'}`}>
                <span>👤</span>
                <span>Trang Bị</span>
              </button>
          </div>
          <div className="flex items-center gap-4 pl-4">
              {activeTab === 'inventory' && 
                  <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80 hidden sm:block">
                      <span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span>
                  </div>
              }
              <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl flex-shrink-0" aria-label="Đóng túi đồ">
                <img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" />
              </button>
          </div>
      </div>
      
      <style>{`
        @keyframes subtle-glow-pulse { 50% { opacity: 0.7; transform: scale(1.05); } }
        .glow-B::before, .glow-A::before, .glow-S::before, .glow-SR::before { content: ''; position: absolute; inset: 0; z-index: 1; background: var(--glow-gradient); filter: blur(12px); transition: opacity 0.3s ease-in-out; }
        .glow-B::before { --glow-gradient: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.35) 0%, transparent 75%); }
        .glow-A::before { --glow-gradient: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.45) 0%, transparent 75%); }
        .glow-S::before { --glow-gradient: radial-gradient(ellipse at center, rgba(250, 204, 21, 0.45) 0%, transparent 70%); }
        .glow-SR::before { --glow-gradient: radial-gradient(ellipse at center, rgba(239, 68, 68, 0.55) 0%, transparent 70%); }
        .glow-pulse::before { animation: subtle-glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .is-scrolling .group:hover{transform:none!important;filter:none!important}
        .is-scrolling .group .group-hover\\:opacity-100{opacity:0!important}
        .is-scrolling .group .group-hover\\:scale-110{transform:none!important}
        .inventory-grid-scrollbar-hidden::-webkit-scrollbar{display:none}
        .inventory-grid-scrollbar-hidden{-ms-overflow-style:none;scrollbar-width:none}
        .text-outline { text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
      `}</style>
      
      <ItemModal item={selectedDetailItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} animation={animation} onEquip={handleEquip} onUnequip={handleUnequip} context={modalContext} />
      
      {/* 2. MAIN CONTENT - Tự động co giãn (flex-1) và có thanh cuộn riêng */}
      <main ref={gridRef} className={`flex-1 overflow-y-auto inventory-grid-scrollbar-hidden ${scrollingClass}`}>
        {activeTab === 'inventory' ? (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-3 pr-1 pb-4">
              {filteredInventory.map((item: any) => (
                  <InventoryItem key={item.instanceId} item={item} onItemClick={handleInventoryItemClick} />
              ))}
              
              {Array.from({ length: Math.max(0, totalInventorySlots - filteredInventory.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl">
                  <span className="opacity-40">＋</span>
                </div>
              ))}
            </div>
        ) : (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 sm:gap-x-4 md:gap-x-6 py-4">
                <div className="flex flex-col items-center justify-center gap-y-4">
                    {['weapon', 'gloves', 'boots'].map(slotType => (
                        <EquipmentSlot key={slotType} slotType={slotType} item={equippedItems[slotType]} onSlotClick={handleProfileSlotClick} />
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
                        <EquipmentSlot key={slotType} slotType={slotType} item={equippedItems[slotType]} onSlotClick={handleProfileSlotClick} />
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* 3. FOOTER (FILTER TABS) - Cố định ở dưới cùng */}
      {activeTab === 'inventory' && (
        <InventoryFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      )}
    </div>
  );
}
// --- END OF FILE inventory.tsx ---
