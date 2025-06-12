// --- START OF FILE inventory.tsx ---

import { useState, useEffect, useCallback, memo, useRef } from 'react'; // Thêm useRef
import { uiAssets } from './game-assets.ts'; 
import { itemDatabase } from './inventory/item-database.ts'; 
import { playerInventoryData } from './inventory/player-inventory-data.ts'; 

// --- CÁC HÀM HELPER (Không thay đổi) ---
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

const groupInventoryItems = (items) => {
    const grouped = new Map();
    items.forEach(item => {
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
const getRarityColor = (rarity: string) => {
    switch(rarity) { case 'E': return 'border-gray-500'; case 'D': return 'border-green-500'; case 'B': return 'border-blue-500'; case 'A': return 'border-purple-600'; case 'S': return 'border-yellow-400'; case 'SR': return 'border-red-500'; default: return 'border-gray-500'; }
};
const getRarityGradient = (rarity: string) => {
    switch(rarity) { case 'E': return 'from-gray-700/70 to-gray-800/70'; case 'D': return 'from-green-800/80 to-gray-800/70'; case 'B': return 'from-blue-800/80 to-gray-800/70'; case 'A': return 'from-purple-800/80 to-gray-800/70'; case 'S': return 'from-yellow-900/80 via-gray-800/70 to-gray-800/70'; case 'SR': return 'from-red-800/80 to-gray-800/70'; default: return 'from-gray-700/70 to-gray-800/70'; }
};
const getRarityTextColor = (rarity: string) => {
    switch(rarity) { case 'E': return 'text-gray-300'; case 'D': return 'text-green-400'; case 'B': return 'text-blue-400'; case 'A': return 'text-purple-400'; case 'S': return 'text-yellow-300'; case 'SR': return 'text-red-400'; default: return 'text-gray-300'; }
};
const getRarityGlow = (rarity: string) => {
    switch(rarity) { case 'E': return ''; case 'D': return ''; case 'B': return 'shadow-sm shadow-blue-500/30'; case 'A': return 'shadow-md shadow-purple-500/40'; case 'S': return 'shadow-lg shadow-yellow-400/50'; case 'SR': return 'shadow-xl shadow-red-500/50'; default: return ''; }
};
const formatStatName = (stat: string) => {
    const translations: { [key: string]: string } = { damage: 'Sát thương', durability: 'Độ bền', healing: 'Hồi máu', defense: 'Phòng thủ', energyRestore: 'Hồi năng lượng', magicBoost: 'Tăng phép', intelligence: 'Trí tuệ', resurrection: 'Hồi sinh', fireDamage: 'Sát thương lửa', strength: 'Sức mạnh', attackSpeed: 'Tốc độ tấn công', manaRegen: 'Hồi mana', range: 'Tầm xa', poisonDamage: 'Sát thương độc', duration: 'Thời gian', magicResist: 'Kháng phép', manaRestore: 'Hồi mana', speed: 'Tốc độ', cleanse: 'Thanh tẩy', strengthBoost: 'Tăng sức mạnh', luck: 'May mắn' };
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

const ItemTooltip = memo(({ item }: { item: any }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{getRarityDisplayName(item.rarity)} • {item.type}</div>
      {item.variants.length > 1 && <div className="text-yellow-400 text-xs mb-1">{item.variants.length} loại khác nhau</div>}
      <div className="text-gray-300 text-xs leading-relaxed">
        { (item.variants[0]?.description || item.description || '').slice(0, 70) }
        { (item.variants[0]?.description || item.description || '').length > 70 ? '...' : '' }
      </div>
    </div>
));

const ItemModal = ({ item, isOpen, onClose, animation }: { item: any, isOpen: boolean, onClose: () => void, animation: boolean }) => {
    if (!isOpen || !item) return null;
    const isWeapon = item.type === 'weapon';
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
                {isWeapon && item.level !== undefined && <span className="bg-blue-800/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 text-xs font-semibold">Level: {item.level}</span>}
                {item.quantity > 1 && <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{item.quantity}</div>}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          {renderItemStats(item)}
          {item.type !== 'currency' && ( <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5"> <button className={'flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm'}>Sử dụng</button> <button className={'flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-semibold transition-colors duration-200 text-sm'}>Trang bị</button> <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">Bỏ</button> </div> )}
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
    // TỐI ƯU 2: Thêm `will-change-transform` để báo cho trình duyệt tối ưu hóa animation scale
    <div className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(itemGroup.rarity)} rounded-lg border-2 ${getRarityColor(itemGroup.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(itemGroup.rarity)} overflow-hidden will-change-transform`} onClick={() => onItemClick(itemGroup)}>
      {totalQuantity > 1 && itemGroup.type !== 'currency' && (<div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{totalQuantity}</div>)}
      {itemGroup.icon.startsWith('http') ? <img src={itemGroup.icon} alt={itemGroup.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" /> : <div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{itemGroup.icon}</div>}
      <ItemTooltip item={itemGroup} />
    </div>
  );
});

// --- END: CÁC COMPONENT CON ---


interface InventoryProps {
  onClose: () => void;
}

export default function Inventory({ onClose }: InventoryProps) {
  const [inventory] = useState(() => groupInventoryItems(getHydratedInventory()));
  
  const [selectedItemGroup, setSelectedItemGroup] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [animation, setAnimation] = useState(false);
  
  const totalInventorySlots = 100;
  const occupiedSlots = inventory.length;

  // --- START: TỐI ƯU 1: XỬ LÝ SCROLL ĐỂ GIẢM LAG ---
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);
  const [scrollingClass, setScrollingClass] = useState('');

  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const handleScroll = () => {
      // Khi bắt đầu scroll, thêm class để vô hiệu hóa hover
      if (!scrollingClass) {
          setScrollingClass('is-scrolling');
      }

      // Xóa timeout cũ nếu có
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Đặt timeout mới. Nếu không scroll nữa trong 150ms, xóa class đi
      scrollTimeout.current = window.setTimeout(() => {
        setScrollingClass('');
        scrollTimeout.current = null;
      }, 150);
    };

    gridElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      gridElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [scrollingClass]); // Thêm scrollingClass vào dependency array
  // --- END: TỐI ƯU 1 ---

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
    }, 200);
  }, []);
  
  const closeVariantModal = useCallback(() => {
      setIsVariantModalOpen(false);
      setSelectedItemGroup(null);
  }, []);

  const handleItemClick = useCallback((itemGroup) => {
    if (itemGroup.variants.length === 1) {
      const singleItem = { ...itemGroup, ...itemGroup.variants[0] };
      delete singleItem.variants;
      setSelectedDetailItem(singleItem);
    } else {
      setSelectedItemGroup(itemGroup);
      setIsVariantModalOpen(true);
    }
  }, []);

  const handleSelectVariant = useCallback((variant) => {
    if (selectedItemGroup) {
        const combinedItem = { ...selectedItemGroup, ...variant };
        delete combinedItem.variants;
        setSelectedDetailItem(combinedItem);
        closeVariantModal();
    }
  }, [selectedItemGroup, closeVariantModal]);

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-b-xl shadow-2xl max-w-3xl mx-auto border border-gray-700/50 min-h-screen relative">
      <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl z-10" aria-label="Đóng túi đồ">
        <img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" />
      </button>
      <div className="mb-7 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-5">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center mb-3 sm:mb-0"><span className="mr-2.5 text-4xl">📦</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">Túi Đồ</span></h1>
        <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80"><span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span></div>
      </div>
      
      {/* THÊM STYLE CHO VIỆC TỐI ƯU SCROLL */}
      <style>{`
        /* Vô hiệu hóa các hiệu ứng hover tốn kém khi đang scroll */
        .is-scrolling .group:hover {
            transform: none !important;
            filter: none !important;
        }
        .is-scrolling .group .group-hover\:opacity-100 {
            opacity: 0 !important;
        }
        .is-scrolling .group .group-hover\:scale-110 {
            transform: none !important;
        }
        
        .inventory-grid-scrollbar-hidden::-webkit-scrollbar{display:none}
        .inventory-grid-scrollbar-hidden{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      
      <ItemModal item={selectedDetailItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} animation={animation}/>
      <VariantSelectionModal itemGroup={selectedItemGroup} isOpen={isVariantModalOpen} onClose={closeVariantModal} onSelectVariant={handleSelectVariant}/>
      
      {/* THÊM ref VÀ className VÀO LƯỚI */}
      <div ref={gridRef} className={`grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden ${scrollingClass}`}>
        {inventory.map((itemGroup: any) => (
            <InventoryItem key={itemGroup.name} itemGroup={itemGroup} onItemClick={handleItemClick} />
        ))}
        
        {Array.from({ length: totalInventorySlots - inventory.length }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl">
            <span className="opacity-40">＋</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// --- END OF FILE inventory.tsx ---
