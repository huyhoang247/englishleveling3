// --- START OF FILE inventory.tsx ---

import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react'; // Thêm useMemo
import { uiAssets } from './game-assets.ts'; 
import { itemDatabase } from './inventory/item-database.ts'; 
import { playerInventoryData } from './inventory/player-inventory-data.ts'; 
import { playerEquipmentData } from './inventory/player-equipment-data.ts'; // THAY ĐỔI: Import dữ liệu trang bị

// --- CÁC HÀM HELPER (Không thay đổi) ---
const getHydratedInventory = () => {
  return playerInventoryData.map(playerItem => {
    const baseItem = itemDatabase.get(playerItem.id);
    if (!baseItem) return null;
    return { ...baseItem, ...playerItem, stats: playerItem.stats ? { ...baseItem.stats, ...playerItem.stats } : baseItem.stats };
  }).filter(item => item !== null); 
};
const groupInventoryItems = (items) => { /* ... không thay đổi ... */ };
const getRarityDisplayName = (rarity: string) => { /* ... không thay đổi ... */ };
const getRarityColor = (rarity: string) => { /* ... không thay đổi ... */ };
const getRarityGradient = (rarity: string) => { /* ... không thay đổi ... */ };
const getRarityTextColor = (rarity: string) => { /* ... không thay đổi ... */ };
const getRarityGlow = (rarity: string) => { /* ... không thay đổi ... */ };
const formatStatName = (stat: string) => { /* ... không thay đổi ... */ };
const renderItemStats = (item: any) => { /* ... không thay đổi ... */ };

// --- START: CÁC COMPONENT CON ---

const ItemTooltip = memo(({ item }: { item: any }) => ( /* ... không thay đổi ... */ ));

// THAY ĐỔI: Cập nhật ItemModal để xử lý việc trang bị/tháo đồ
const ItemModal = ({ item, isOpen, onClose, onEquip, onUnequip, context, animation }) => {
    if (!isOpen || !item) return null;
    const isEquippable = item.type !== 'currency' && item.type !== 'material' && item.type !== 'potion';

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
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          {renderItemStats(item)}
           <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5">
              {context === 'inventory' && (
                <>
                  <button className={'flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm'}>Sử dụng</button>
                  {isEquippable && <button onClick={() => onEquip(item)} className={'flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-semibold transition-colors duration-200 text-sm'}>Trang bị</button>}
                </>
              )}
              {context === 'profile' && <button onClick={() => onUnequip(item)} className={'flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors duration-200 text-sm'}>Tháo ra</button>}
              <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">Bỏ</button>
           </div>
        </div>
      </div>
    );
};

const VariantSelectionModal = ({ itemGroup, isOpen, onClose, onSelectVariant }) => { /* ... không thay đổi ... */ };
const InventoryItem = memo(({ itemGroup, onItemClick }: { itemGroup: any, onItemClick: (item: any) => void }) => { /* ... không thay đổi ... */ });

// --- START: COMPONENT MỚI CHO TAB TÚI ĐỒ ---
const InventoryGrid = memo(({ inventory, onItemClick, totalSlots }) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<number | null>(null);
    const [scrollingClass, setScrollingClass] = useState('');
  
    // Logic tối ưu scroll (giữ nguyên)
    useEffect(() => {
        const gridElement = gridRef.current;
        if (!gridElement) return;
        const handleScroll = () => {
            if (!scrollingClass) setScrollingClass('is-scrolling');
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = window.setTimeout(() => {
                setScrollingClass('');
                scrollTimeout.current = null;
            }, 150);
        };
        gridElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            gridElement.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [scrollingClass]);

    return (
        <div ref={gridRef} className={`grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden ${scrollingClass}`}>
            {groupInventoryItems(inventory).map((itemGroup: any) => (
                <InventoryItem key={itemGroup.name} itemGroup={itemGroup} onItemClick={onItemClick} />
            ))}
            {Array.from({ length: totalSlots - groupInventoryItems(inventory).length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl">
                    <span className="opacity-40">＋</span>
                </div>
            ))}
        </div>
    );
});

// --- START: COMPONENT MỚI CHO TAB TRANG BỊ (PROFILE) ---
const EquipmentSlot = memo(({ slotType, item, onClick }) => {
    const slotIcons = { weapon: '⚔️', helmet: '👑', armor: '🛡️', gloves: '🧤', boots: '👢', ring: '💍' };
    const slotName = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp', gloves: 'Găng tay', boots: 'Giày', ring: 'Nhẫn' };
    
    return (
        <div onClick={() => item && onClick(item)} className={`group relative w-20 h-20 sm:w-24 sm:h-24 bg-black/30 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${item ? `${getRarityColor(item.rarity)} ${getRarityGlow(item.rarity)} shadow-inner cursor-pointer hover:brightness-125 hover:scale-105` : 'border-gray-700/50 border-dashed'}`}>
            {item ? (
                <>
                    {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2 relative z-0" /> : <div className="text-3xl sm:text-4xl relative z-0">{item.icon}</div>}
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
                        <p className="text-gray-400 text-xs">{item.description.slice(0, 70)}...</p>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500">
                    <div className="text-3xl opacity-50">{slotIcons[slotType]}</div>
                    <div className="text-[10px] font-semibold mt-1">{slotName[slotType]}</div>
                </div>
            )}
        </div>
    );
});

const ProfileView = memo(({ equipment, onUnequipClick, totalStats }) => (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-h-[60vh] p-4">
        {/* Left Side: Character & Equipment */}
        <div className="grid grid-cols-3 grid-rows-3 gap-4 items-center justify-center [grid-template-areas:'helmet_helmet_helmet' 'gloves_character_weapon' 'boots_character_ring']">
             <div className="[grid-area:character] row-span-2 flex items-center justify-center">
                <div className="w-32 h-48 sm:w-40 sm:h-64 bg-gradient-to-b from-gray-900 to-gray-800/50 rounded-xl flex items-center justify-center border-2 border-gray-700 shadow-xl">
                    <img src={uiAssets.characterPlaceholder} alt="Character" className="w-full h-full object-cover opacity-80" />
                </div>
            </div>
            <div className="[grid-area:helmet] flex justify-center"><EquipmentSlot slotType="helmet" item={equipment.helmet} onClick={onUnequipClick} /></div>
            <div className="[grid-area:weapon] flex justify-center"><EquipmentSlot slotType="weapon" item={equipment.weapon} onClick={onUnequipClick} /></div>
            <div className="[grid-area:gloves] flex justify-center"><EquipmentSlot slotType="gloves" item={equipment.gloves} onClick={onUnequipClick} /></div>
            <div className="[grid-area:boots] flex justify-center"><EquipmentSlot slotType="boots" item={equipment.boots} onClick={onUnequipClick} /></div>
            <div className="[grid-area:ring] flex justify-center"><EquipmentSlot slotType="ring" item={equipment.ring} onClick={onUnequipClick} /></div>
            {/* Armor slot can be placed differently or as part of the character panel */}
        </div>

        {/* Right Side: Stats Panel */}
        <div className="w-full lg:w-64 bg-gray-900/50 border border-gray-700/70 rounded-xl p-4 self-stretch flex flex-col">
            <h3 className="text-lg font-bold text-yellow-300 border-b border-gray-700 pb-2 mb-3">Tổng Chỉ Số</h3>
            <div className="space-y-2 text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1">
                {Object.entries(totalStats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between items-center text-gray-300">
                        <span className="text-gray-400 capitalize">{formatStatName(stat)}:</span>
                        <span className="font-bold">{stat.includes('Percent') ? `+${value}%` : value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
));


// --- END: CÁC COMPONENT CON ---


interface InventoryProps {
  onClose: () => void;
}

export default function Inventory({ onClose }: InventoryProps) {
  // --- START: QUẢN LÝ STATE MỚI ---
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'profile'
  const [inventory, setInventory] = useState([]);
  const [equipment, setEquipment] = useState({}); // { weapon: item, helmet: item, ... }
  
  // State cho Modal
  const [selectedItemGroup, setSelectedItemGroup] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [detailModalContext, setDetailModalContext] = useState('inventory'); // 'inventory' or 'profile'
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [animation, setAnimation] = useState(false);

  // Khởi tạo dữ liệu khi component được mount
  useEffect(() => {
    const allItems = getHydratedInventory();
    const equippedMap = new Map();
    const equippedItems = {};

    Object.entries(playerEquipmentData).forEach(([slot, instanceId]) => {
      if(instanceId){
        const item = allItems.find(i => i.instanceId === instanceId);
        if (item) {
          equippedItems[slot] = item;
          equippedMap.set(instanceId, true);
        }
      }
    });

    const unequippedItems = allItems.filter(item => !equippedMap.has(item.instanceId));
    
    setEquipment(equippedItems);
    setInventory(unequippedItems);
  }, []);
  // --- END: QUẢN LÝ STATE MỚI ---

  const occupiedSlots = groupInventoryItems(inventory).length;

  // Logic tự động mở rộng túi đồ (giữ nguyên)
  let totalInventorySlots = 50; if (occupiedSlots >= 81) totalInventorySlots = 100; else if (occupiedSlots >= 71) totalInventorySlots = 90; else if (occupiedSlots >= 61) totalInventorySlots = 80; else if (occupiedSlots >= 51) totalInventorySlots = 70; else if (occupiedSlots >= 41) totalInventorySlots = 60;
  
  // Tính toán tổng chỉ số từ trang bị
  const totalStats = useMemo(() => {
      const baseStats = { damage: 10, defense: 5, health: 100, strength: 5, intelligence: 5 }; // Ví dụ chỉ số cơ bản
      const stats = { ...baseStats };
      Object.values(equipment).forEach(item => {
          if (item && item.stats) {
              Object.entries(item.stats).forEach(([stat, value]) => {
                  stats[stat] = (stats[stat] || 0) + value;
              });
          }
      });
      return stats;
  }, [equipment]);

  // --- START: LOGIC MODAL & TRANG BỊ/THÁO ĐỒ ---
  const openDetailModal = useCallback((item, context) => {
    setSelectedDetailItem(item);
    setDetailModalContext(context);
    setIsDetailModalOpen(true);
    setAnimation(true);
    const timer = setTimeout(() => setAnimation(false), 10);
    return () => clearTimeout(timer);
  }, []);

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
      openDetailModal(singleItem, 'inventory');
    } else {
      setSelectedItemGroup(itemGroup);
      setIsVariantModalOpen(true);
    }
  }, [openDetailModal]);
  
  const handleProfileItemClick = useCallback((item) => {
    openDetailModal(item, 'profile');
  }, [openDetailModal]);

  const handleSelectVariant = useCallback((variant) => {
    if (selectedItemGroup) {
        const combinedItem = { ...selectedItemGroup, ...variant };
        delete combinedItem.variants;
        openDetailModal(combinedItem, 'inventory');
        closeVariantModal();
    }
  }, [selectedItemGroup, closeVariantModal, openDetailModal]);

  const handleEquipItem = useCallback((itemToEquip) => {
    const slot = itemToEquip.type; // 'weapon', 'helmet', etc.
    if (!slot) return;

    setInventory(prevInventory => prevInventory.filter(i => i.instanceId !== itemToEquip.instanceId));
    
    setEquipment(prevEquipment => {
        const currentItemInSlot = prevEquipment[slot];
        const newEquipment = { ...prevEquipment, [slot]: itemToEquip };
        
        // Nếu có vật phẩm đang trang bị ở vị trí đó, chuyển nó về túi đồ
        if (currentItemInSlot) {
            setInventory(prevInventory => [...prevInventory, currentItemInSlot]);
        }
        
        return newEquipment;
    });

    closeDetailModal();
  }, [closeDetailModal]);

  const handleUnequipItem = useCallback((itemToUnequip) => {
      const slot = itemToUnequip.type;
      if(!slot) return;

      // Xóa khỏi trang bị
      setEquipment(prevEquipment => {
          const newEquipment = {...prevEquipment};
          delete newEquipment[slot];
          return newEquipment;
      });

      // Thêm lại vào túi đồ
      setInventory(prevInventory => [...prevInventory, itemToUnequip]);

      closeDetailModal();
  }, [closeDetailModal]);
  // --- END: LOGIC MODAL & TRANG BỊ/THÁO ĐỒ ---

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-b-xl shadow-2xl max-w-4xl mx-auto border border-gray-700/50 min-h-screen relative">
      <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl z-20" aria-label="Đóng túi đồ">
        <img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" />
      </button>

      {/* --- START: TAB UI --- */}
      <div className="flex justify-center mb-5 border-b border-gray-700/60">
          <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'inventory' ? 'text-yellow-400 border-yellow-400' : 'text-gray-400 border-transparent hover:text-white'}`}>Túi Đồ</button>
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'profile' ? 'text-yellow-400 border-yellow-400' : 'text-gray-400 border-transparent hover:text-white'}`}>Trang Bị</button>
      </div>
      {/* --- END: TAB UI --- */}
      
      <div className="mb-7 flex flex-col sm:flex-row justify-between items-center pb-5">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center mb-3 sm:mb-0">
            <span className="mr-2.5 text-4xl">{activeTab === 'inventory' ? '📦' : '👤'}</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">{activeTab === 'inventory' ? 'Túi Đồ' : 'Hồ Sơ Nhân Vật'}</span>
        </h1>
        {activeTab === 'inventory' && (
            <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80"><span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span></div>
        )}
      </div>
      
      <style>{`
        .is-scrolling .group:hover { transform: none !important; filter: none !important; }
        .is-scrolling .group .group-hover\:opacity-100 { opacity: 0 !important; }
        .is-scrolling .group .group-hover\:scale-110 { transform: none !important; }
        .inventory-grid-scrollbar-hidden::-webkit-scrollbar{display:none}
        .inventory-grid-scrollbar-hidden{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      
      {/* --- START: RENDER TAB CONTENT --- */}
      <div className="min-h-[60vh]">
        {activeTab === 'inventory' ? (
            <InventoryGrid inventory={inventory} onItemClick={handleItemClick} totalSlots={totalInventorySlots} />
        ) : (
            <ProfileView equipment={equipment} onUnequipClick={handleProfileItemClick} totalStats={totalStats} />
        )}
      </div>
      {/* --- END: RENDER TAB CONTENT --- */}

      <ItemModal 
        item={selectedDetailItem} 
        isOpen={isDetailModalOpen} 
        onClose={closeDetailModal} 
        animation={animation}
        context={detailModalContext}
        onEquip={handleEquipItem}
        onUnequip={handleUnequipItem}
      />
      <VariantSelectionModal 
        itemGroup={selectedItemGroup} 
        isOpen={isVariantModalOpen} 
        onClose={closeVariantModal} 
        onSelectVariant={handleSelectVariant}
      />
    </div>
  );
}
// --- END OF FILE inventory.tsx ---
