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
        weapon: '⚔️', helmet: '👑', armor: '🛡️',
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
    return {
      ...baseItem,
      ...playerItem,
      stats: playerItem.stats ? { ...baseItem.stats, ...playerItem.stats } : baseItem.stats,
    };
  }).filter(item => item !== null); 
};

const groupInventoryItems = (items: any[]) => {
    const grouped = new Map();
    items.forEach(item => {
        if (!item) return;
        const key = item.name.split(' (')[0]; 
        const { instanceId, quantity, stats, level, currentExp, requiredExp, description } = item;
        const variant = { id: instanceId, quantity, stats, level, currentExp, requiredExp, description };
        if (!grouped.has(key)) {
            const { name, ...baseProps } = item;
            grouped.set(key, { ...baseProps, name: key, variants: [variant] });
        } else {
            grouped.get(key).variants.push(variant);
        }
    });
    return Array.from(grouped.values());
};

const getRarityDisplayName = (rarity: string) => {
    if (!rarity) return 'Unknown Rank';
    return `${rarity.toUpperCase()} Rank`;
}
// --- START: NÂNG CẤP GIAO DIỆN CÁC BẬC HIẾM ---
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
const getRarityGlow = (rarity: string) => { // Dùng cho hiệu ứng tỏa sáng và animation
    switch(rarity) { 
        case 'E': return ''; 
        case 'D': return ''; 
        case 'B': return 'shadow-lg shadow-blue-500/40'; 
        case 'A': return 'shadow-xl shadow-purple-500/50'; 
        case 'S': return 'shadow-2xl shadow-yellow-400/60 animate-subtle-pulse';
        case 'SR': return 'shadow-2xl shadow-red-500/70 ring-2 ring-orange-500/30 animate-subtle-pulse'; 
        default: return ''; 
    }
};
// --- END: NÂNG CẤP GIAO DIỆN CÁC BẬC HIẾM ---

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
// --- CÁC HÀM HELPER (KẾT THÚC PHẦN NÂNG CẤP GIAO DIỆN) ---


// --- START: CÁC COMPONENT CON ĐƯỢC TÁCH RA NGOÀI VÀ TỐI ƯU ---

const ItemTooltip = memo(({ item, isEquipped }: { item: any, isEquipped?: boolean }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{getRarityDisplayName(item.rarity)} • {item.type} {isEquipped && <span className="text-green-400">(Đã trang bị)</span>}</div>
      {item.variants && item.variants.length > 1 && <div className="text-yellow-400 text-xs mb-1">{item.variants.length} loại khác nhau</div>}
      <div className="text-gray-300 text-xs leading-relaxed">
        { (item.variants?.[0]?.description || item.description || '').slice(0, 70) }
        { (item.variants?.[0]?.description || item.description || '').length > 70 ? '...' : '' }
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
        <div className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 ${getRarityGlow(item.rarity)} ${animation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
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

const VariantSelectionModal = ({ itemGroup, isOpen, onClose, onSelectVariant }) => {
    if (!isOpen || !itemGroup) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm p-5">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
             <h3 className={`text-xl font-bold ${getRarityTextColor(itemGroup.rarity)}`}>Chọn biến thể: {itemGroup.name}</h3>
             <button onClick={onClose} className="text-gray-500 hover:text-white"><img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" /></button>
          </div>
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {itemGroup.variants.map((variant, index) => (
              <li key={variant.id || index} onClick={() => onSelectVariant(variant)} className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg cursor-pointer hover:bg-gray-700/90 border border-gray-700 hover:border-blue-500 transition-all duration-200">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center text-3xl bg-black/30 rounded-md border-2 ${getRarityColor(itemGroup.rarity)}`}>{itemGroup.icon.startsWith('http') ? <img src={itemGroup.icon} alt={itemGroup.name} className="w-full h-full object-contain p-1" /> : itemGroup.icon}</div>
                    <div>
                        <div className="font-semibold text-white">{variant.level ? `Level ${variant.level}` : itemGroup.name}</div>
                        <div className="text-xs text-gray-400">Sát thương: {variant.stats?.damage || 'N/A'}</div>
                    </div>
                </div>
                <div className="text-right"><span className="font-bold text-lg text-gray-200">x{variant.quantity}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
};

const InventoryItem = memo(({ itemGroup, onItemClick }: { itemGroup: any, onItemClick: (item: any) => void }) => {
  const totalQuantity = itemGroup.variants.reduce((sum, v) => sum + v.quantity, 0);

  return (
    <div className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(itemGroup.rarity)} rounded-lg border-2 ${getRarityColor(itemGroup.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(itemGroup.rarity)} overflow-hidden will-change-transform`} onClick={() => onItemClick(itemGroup)}>
      {totalQuantity > 1 && itemGroup.type !== 'currency' && (<div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{totalQuantity}</div>)}
      {itemGroup.icon.startsWith('http') ? <img src={itemGroup.icon} alt={itemGroup.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" /> : <div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{itemGroup.icon}</div>}
      <ItemTooltip item={itemGroup} />
    </div>
  );
});

const EquipmentSlot = memo(({ slotType, item, onSlotClick }: { slotType: string, item: any, onSlotClick: (item: any, slotType: string) => void }) => {
    const rarity = item ? item.rarity : 'E';
    return (
        <div 
            className={`group relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item ? getRarityGradient(rarity) : 'from-gray-900/60 to-gray-800/40'} rounded-lg border-2 ${item ? getRarityColor(rarity) : 'border-gray-700/60'} flex items-center justify-center cursor-pointer hover:brightness-125 transition-all duration-200 shadow-lg ${item ? getRarityGlow(rarity) : 'shadow-inner'} overflow-hidden`}
            onClick={() => onSlotClick(item, slotType)}
        >
            {item ? (
                <>
                    {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-1.5" /> : <div className="text-3xl">{item.icon}</div>}
                    <ItemTooltip item={item} isEquipped={true} />
                </>
            ) : (
                <span className="text-4xl text-gray-600 opacity-60">{getSlotPlaceholderIcon(slotType)}</span>
            )}
        </div>
    );
});

// StatsPanel không còn được dùng trong layout mới, nhưng vẫn giữ lại để có thể tái sử dụng
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


// --- END: CÁC COMPONENT CON ---


interface InventoryManagerProps {
  onClose: () => void;
}

export default function InventoryManager({ onClose }: InventoryManagerProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'profile'>('profile'); // Default to profile for demo
  const [inventory, setInventory] = useState(() => getHydratedInventory());
  const [equippedItems, setEquippedItems] = useState<{[key: string]: any | null}>({
      weapon: null, helmet: null, armor: null, gloves: null, boots: null, skin: null
  });

  const [selectedItemGroup, setSelectedItemGroup] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [modalContext, setModalContext] = useState<'inventory' | 'profile' | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [animation, setAnimation] = useState(false);
  
  const groupedInventory = useMemo(() => groupInventoryItems(inventory), [inventory]);
  const occupiedSlots = groupedInventory.length;

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
  }, [scrollingClass]);
  
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
  
  const closeVariantModal = useCallback(() => {
      setIsVariantModalOpen(false);
      setSelectedItemGroup(null);
  }, []);

  const openDetailModal = useCallback((item, context: 'inventory' | 'profile') => {
      setSelectedDetailItem(item);
      setModalContext(context);
  }, []);

  const handleInventoryItemClick = useCallback((itemGroup) => {
    if (itemGroup.variants.length === 1) {
      const singleItem = { ...itemGroup, ...itemGroup.variants[0] };
      delete singleItem.variants;
      openDetailModal(singleItem, 'inventory');
    } else {
      setSelectedItemGroup(itemGroup);
      setIsVariantModalOpen(true);
    }
  }, [openDetailModal]);

  // --- THAY ĐỔI: Loại bỏ hành vi khi click vào ô trống ---
  const handleProfileSlotClick = useCallback((item, slotType) => {
      // Chỉ thực hiện hành động nếu có item (item không phải null)
      if(item) {
          openDetailModal(item, 'profile');
      }
      // Khi 'item' là null (ô trống), không làm gì cả.
  }, [openDetailModal]);
  
  const handleSelectVariant = useCallback((variant) => {
    if (selectedItemGroup) {
        const combinedItem = { ...selectedItemGroup, ...variant };
        delete combinedItem.variants;
        openDetailModal(combinedItem, 'inventory');
        closeVariantModal();
    }
  }, [selectedItemGroup, closeVariantModal, openDetailModal]);

  const handleEquip = useCallback((itemToEquip) => {
      const slot = itemToEquip.type;
      if (!equipmentSlotTypes.includes(slot)) return;

      const currentItemInSlot = equippedItems[slot];

      setEquippedItems(prev => ({...prev, [slot]: itemToEquip }));
      setInventory(prev => {
          const newInventory = prev.filter(i => i.instanceId !== itemToEquip.instanceId);
          if (currentItemInSlot) {
              newInventory.push(currentItemInSlot);
          }
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
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-b-xl shadow-2xl max-w-4xl mx-auto border border-gray-700/50 min-h-screen">
      
      <div className="flex justify-between items-center mb-6 border-b border-gray-700/60 pb-5">
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
      
      {/* THÊM STYLE CHO ANIMATION CỦA CÁC BẬC HIẾM S VÀ SR */}
      <style>{`
        @keyframes subtle-glow-pulse { 50% { opacity: 0.8; } }
        .animate-subtle-pulse { animation: subtle-glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .is-scrolling .group:hover{transform:none!important;filter:none!important}
        .is-scrolling .group .group-hover\\:opacity-100{opacity:0!important}
        .is-scrolling .group .group-hover\\:scale-110{transform:none!important}
        .inventory-grid-scrollbar-hidden::-webkit-scrollbar{display:none}
        .inventory-grid-scrollbar-hidden{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      
      <ItemModal item={selectedDetailItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} animation={animation} onEquip={handleEquip} onUnequip={handleUnequip} context={modalContext} />
      <VariantSelectionModal itemGroup={selectedItemGroup} isOpen={isVariantModalOpen} onClose={closeVariantModal} onSelectVariant={handleSelectVariant}/>
      
      {activeTab === 'inventory' ? (
          <div ref={gridRef} className={`grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-3 max-h-[60vh] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden ${scrollingClass}`}>
            {groupedInventory.map((itemGroup: any) => (
                <InventoryItem key={itemGroup.name} itemGroup={itemGroup} onItemClick={handleInventoryItemClick} />
            ))}
            
            {Array.from({ length: totalInventorySlots - groupedInventory.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl">
                <span className="opacity-40">＋</span>
              </div>
            ))}
          </div>
      ) : (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 sm:gap-x-4 md:gap-x-6 py-4">
              
              {/* Cột Trái: 3 ô trang bị */}
              <div className="flex flex-col items-center justify-center gap-y-4">
                  {['weapon', 'gloves', 'boots'].map(slotType => (
                      <EquipmentSlot
                          key={slotType}
                          slotType={slotType}
                          item={equippedItems[slotType]}
                          onSlotClick={handleProfileSlotClick}
                      />
                  ))}
              </div>

              {/* Cột Giữa: Nhân vật và Chỉ số */}
              <div className="flex flex-col items-center gap-y-5 self-start pt-2">
                  {/* Placeholder cho ảnh nhân vật */}
                  <div className="w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
                       {/* Thay thế bằng ảnh nhân vật thật. Ví dụ: <img src="/capybara-warrior.png" /> */}
                       <span className="text-8xl sm:text-9xl drop-shadow-lg" style={{ transform: 'scaleX(-1)' }}>🐻</span>
                  </div>
                  
                  {/* Chỉ số sức mạnh */}
                  <div className="flex items-center gap-2 bg-yellow-900/50 border border-yellow-600/80 rounded-md px-4 py-1.5 shadow-md shadow-black/40">
                      {/* Thay thế bằng icon thật. Ví dụ: <img src={uiAssets.powerIcon} /> */}
                      <span className="text-yellow-400 font-bold text-lg relative top-[-1px]">⚜️</span>
                      <span className="font-bold text-white text-xl tracking-wider">30.3K</span>
                  </div>

                  {/* Thanh chỉ số cơ bản */}
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

              {/* Cột Phải: 3 ô trang bị */}
              <div className="flex flex-col items-center justify-center gap-y-4">
                  {['helmet', 'armor', 'skin'].map(slotType => (
                      <EquipmentSlot
                          key={slotType}
                          slotType={slotType}
                          item={equippedItems[slotType]}
                          onSlotClick={handleProfileSlotClick}
                      />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
// --- END OF FILE inventory.tsx ---
