// --- START OF FILE inventory.tsx ---

import { useState, useEffect } from 'react';
import { uiAssets } from './game-assets.ts'; // Giữ lại import uiAssets
import { itemDatabase } from './inventory/item-database.ts'; // Import database item
import { playerInventoryData } from './inventory/player-inventory-data.ts'; // Import dữ liệu túi đồ của người chơi

// Hàm này sẽ "hydrate" dữ liệu túi đồ của người chơi với thông tin đầy đủ từ database
const getHydratedInventory = () => {
  return playerInventoryData.map(playerItem => {
    const baseItem = itemDatabase.get(playerItem.id);
    if (!baseItem) {
      console.warn(`Item with id ${playerItem.id} not found in database.`);
      return null;
    }
    // Kết hợp thông tin gốc và thông tin của người chơi
    // Thuộc tính của playerItem sẽ ghi đè lên thuộc tính của baseItem nếu trùng lặp
    return {
      ...baseItem,
      ...playerItem,
      // Ghi đè stats nếu có, nếu không thì dùng stats gốc
      stats: playerItem.stats ? { ...baseItem.stats, ...playerItem.stats } : baseItem.stats,
    };
  }).filter(item => item !== null); // Lọc bỏ các item không tìm thấy
};

const groupInventoryItems = (items) => {
    const grouped = new Map();
    items.forEach(item => {
        // Sử dụng `id` từ item gốc để nhóm, vì `name` có thể thay đổi (vd: Kiếm gỗ +1)
        // Hoặc tốt hơn là nhóm theo `name` để gộp các biến thể
        const key = item.name.split(' (')[0]; // Nhóm "Kiếm gỗ (+1)" vào chung với "Kiếm gỗ"
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

interface InventoryProps {
  onClose: () => void;
}

export default function Inventory({ onClose }: InventoryProps) {
  // Khởi tạo state bằng cách hydrate và nhóm dữ liệu ngay từ đầu
  const [inventory, setInventory] = useState(() => groupInventoryItems(getHydratedInventory()));
  
  const [selectedItemGroup, setSelectedItemGroup] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [animation, setAnimation] = useState(false);
  const totalInventorySlots = 50;
  
  const occupiedSlots = inventory.length;

  useEffect(() => {
    if (selectedDetailItem) {
      setIsDetailModalOpen(true);
      setAnimation(true);
      const timer = setTimeout(() => setAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedDetailItem]);

  const closeDetailModal = () => {
    setAnimation(true);
    setTimeout(() => {
      setIsDetailModalOpen(false);
      setAnimation(false);
      setSelectedDetailItem(null);
    }, 200);
  };
  
  const closeVariantModal = () => {
      setIsVariantModalOpen(false);
      setSelectedItemGroup(null);
  };

  const handleItemClick = (itemGroup) => {
    if (itemGroup.variants.length === 1) {
      const singleItem = { ...itemGroup, ...itemGroup.variants[0] };
      delete singleItem.variants;
      setSelectedDetailItem(singleItem);
    } else {
      setSelectedItemGroup(itemGroup);
      setIsVariantModalOpen(true);
    }
  };

  const handleSelectVariant = (variant) => {
    const combinedItem = { ...selectedItemGroup, ...variant };
    delete combinedItem.variants;
    setSelectedDetailItem(combinedItem);
    closeVariantModal();
  };

  const handleCloseInventory = () => {
    onClose();
  };
  
  // Các hàm render, modal, style... giữ nguyên như cũ
  // ... (Toàn bộ các hàm getRarityColor, ItemModal, VariantSelectionModal... và phần JSX)
  // ... (Không cần thay đổi phần còn lại của file)
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'border-gray-500';
      case 'uncommon': return 'border-green-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-600';
      case 'legendary': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'from-gray-700/70 to-gray-800/70';
      case 'uncommon': return 'from-green-800/80 to-gray-800/70';
      case 'rare': return 'from-blue-800/80 to-gray-800/70';
      case 'epic': return 'from-purple-800/80 to-gray-800/70';
      case 'legendary': return 'from-red-900 via-orange-800/70 to-red-900';
      default: return 'from-gray-700/70 to-gray-800/70';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'text-gray-300';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-300';
      default: return 'text-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch(rarity) {
      case 'common': return '';
      case 'uncommon': return 'shadow-sm shadow-green-500/40';
      case 'rare': return 'shadow-md shadow-blue-500/40';
      case 'epic': return 'shadow-lg shadow-purple-500/40';
      case 'legendary': return 'shadow-md shadow-orange-400/30 legendary-item-glow';
      default: return '';
    }
  };
  
  const renderItemStats = (item: any) => {
    if (!item.stats) return null;
    return (
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
            <span className={`font-semibold ${getRarityTextColor(item.rarity === 'legendary' ? 'legendary' : 'common')}`}>{stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatStatName = (stat: string) => {
    const translations: { [key: string]: string } = { damage: 'Sát thương', durability: 'Độ bền', healing: 'Hồi máu', defense: 'Phòng thủ', energyRestore: 'Hồi năng lượng', magicBoost: 'Tăng phép', intelligence: 'Trí tuệ', resurrection: 'Hồi sinh', fireDamage: 'Sát thương lửa', strength: 'Sức mạnh', attackSpeed: 'Tốc độ tấn công', manaRegen: 'Hồi mana', range: 'Tầm xa', poisonDamage: 'Sát thương độc', duration: 'Thời gian', magicResist: 'Kháng phép', manaRestore: 'Hồi mana', speed: 'Tốc độ', cleanse: 'Thanh tẩy', strengthBoost: 'Tăng sức mạnh', luck: 'May mắn' };
    return translations[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const ItemTooltip = ({ item }: { item: any }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{item.type} • {item.rarity}</div>
      {item.variants.length > 1 && <div className="text-yellow-400 text-xs mb-1">{item.variants.length} loại khác nhau</div>}
      <div className="text-gray-300 text-xs leading-relaxed">
        { (item.variants[0]?.description || item.description || '').slice(0, 70) }
        { (item.variants[0]?.description || item.description || '').length > 70 ? '...' : '' }
      </div>
    </div>
  );

  const ItemModal = ({ item, isOpen, onClose }: { item: any, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen || !item) return null;
    const isLegendary = item.rarity === 'legendary';
    const isWeapon = item.type === 'weapon';
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animation ? 'opacity-0' : 'opacity-100'} z-40`} onClick={onClose}></div>
        <div className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 ${getRarityGlow(item.rarity)} ${animation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
          {isLegendary && (
            <>
              <div className="absolute inset-0 rounded-xl border-2 border-orange-300/30 animate-pulse [animation-duration:3s] opacity-50"></div>
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-orange-200/20 via-transparent to-transparent opacity-40 rounded-tl-xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-orange-200/20 via-transparent to-transparent opacity-40 rounded-br-xl"></div>
              <div className="absolute -inset-0.5 bg-orange-400/20 opacity-20 blur-lg rounded-xl -z-10 animate-pulse-stronger"></div>
              <div className="absolute inset-0 flex items-center justify-center -z-10"><div className="w-3/4 h-3/4 rounded-full bg-orange-500/5 blur-2xl opacity-0 animate-fade-in-out"></div></div>
            </>
          )}
          <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
            <h3 className={`text-2xl font-bold ${getRarityTextColor(item.rarity)} ${isLegendary ? 'flex items-center gap-x-2' : ''}`}>{isLegendary && <span className="text-orange-100 opacity-80 text-xl">✦</span>}{item.name}{isLegendary && <span className="text-orange-100 opacity-80 text-xl">✦</span>}</h3>
            <button onClick={onClose} className="relative z-50 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl ${isLegendary ? 'bg-gradient-to-br from-gray-900 via-orange-900/80 to-gray-900' : 'bg-black/30'} rounded-lg border-2 ${getRarityColor(item.rarity)} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}>
              {isLegendary && ( <> <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent opacity-10"></div> <div className="absolute inset-1 bg-orange-500/10 opacity-5 animate-pulse [animation-duration:2s]"></div> <div className="absolute -inset-full rotate-45 w-12 h-full bg-gradient-to-t from-transparent via-white/30 to-transparent opacity-20 transform translate-x-0"></div> <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-full rounded-full bg-orange-300/10 blur-md opacity-50 animate-ping-slow"></div></div> </>)}
              {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" /> : <div className="text-2xl sm:text-3xl relative z-0">{item.icon}</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(item.rarity)} ${isLegendary ? 'bg-gradient-to-r from-orange-900 to-gray-800 border border-orange-500/40 shadow-md shadow-orange-500/20' : 'bg-gray-800/70 border border-gray-700'} capitalize`}>{isLegendary ? `✦ ${item.rarity.toUpperCase()} ✦` : item.rarity}</span>
                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                {isWeapon && item.level !== undefined && <span className="bg-blue-800/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 text-xs font-semibold">Level: {item.level}</span>}
                {item.quantity > 1 && <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{item.quantity}</div>}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          {isLegendary ? ( <div className="mt-4 bg-gradient-to-r from-gray-950 via-orange-900/25 to-gray-950 p-3 rounded-lg border border-orange-700/40 shadow-lg"> <h4 className="text-orange-300 text-base font-semibold mb-2 flex items-center gap-1.5"><span className="opacity-80">💎</span> Thuộc tính đặc biệt</h4> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5 text-sm">{Object.entries(item.stats || {}).map(([stat, value]) => <div key={stat} className="flex justify-between items-center py-0.5 border-b border-orange-900/30 last:border-b-0"><span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span><span className="font-semibold text-orange-200 text-base">{stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}</span></div>)}</div> </div> ) : renderItemStats(item)}
          {item.type !== 'currency' && ( <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5"> <button className={`flex-1 px-4 py-2.5 ${isLegendary ? 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 border border-orange-400/50 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm`}>Sử dụng</button> <button className={`flex-1 px-4 py-2.5 ${isLegendary ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-orange-600/30 text-orange-200' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} rounded-lg font-semibold transition-colors duration-200 text-sm`}>Trang bị</button> <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">Bỏ</button> </div> )}
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
             <h3 className="text-xl font-bold text-yellow-400">Chọn biến thể: {itemGroup.name}</h3>
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

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-b-xl shadow-2xl max-w-3xl mx-auto border border-gray-700/50 min-h-screen relative">
      <button onClick={handleCloseInventory} className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl z-10" aria-label="Đóng túi đồ">
        <img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" />
      </button>
      <div className="mb-7 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-5">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center mb-3 sm:mb-0"><span className="mr-2.5 text-4xl">📦</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">Túi Đồ</span></h1>
        <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80"><span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span></div>
      </div>
      
      <style>{`@keyframes pulse-stronger{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:.3;transform:scale(1.02)}}@keyframes fade-in-out{0%,100%{opacity:0;transform:scale(.9)}50%{opacity:.1;transform:scale(1)}}@keyframes ping-slow{0%{transform:scale(.9);opacity:.6}50%{transform:scale(1.1);opacity:.1}100%{transform:scale(.9);opacity:.6}}.animate-pulse-stronger{animation:pulse-stronger 4s infinite ease-in-out}.animate-fade-in-out{animation:fade-in-out 5s infinite ease-in-out}.animate-ping-slow{animation:ping-slow 3s infinite ease-in-out}.legendary-item-glow{box-shadow:0 0 10px rgba(255,165,0,.4),0 0 20px rgba(255,69,0,.2);transition:box-shadow .3s ease-in-out}.legendary-item-glow:hover{box-shadow:0 0 15px rgba(255,165,0,.6),0 0 30px rgba(255,69,0,.4),0 0 45px rgba(255,69,0,.15)}.inventory-grid-scrollbar-hidden::-webkit-scrollbar{display:none}.inventory-grid-scrollbar-hidden{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      
      <ItemModal item={selectedDetailItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} />
      <VariantSelectionModal itemGroup={selectedItemGroup} isOpen={isVariantModalOpen} onClose={closeVariantModal} onSelectVariant={handleSelectVariant}/>
      
      <div className="grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden">
        {inventory.map((itemGroup: any) => {
          const isLegendary = itemGroup.rarity === 'legendary';
          const totalQuantity = itemGroup.variants.reduce((sum, v) => sum + v.quantity, 0);
          return (
            <div key={itemGroup.name} className={`group relative w-full aspect-square ${isLegendary ? 'bg-gradient-to-br from-gray-900 via-orange-900/80 to-gray-900' : `bg-gradient-to-br ${getRarityGradient(itemGroup.rarity)}`} rounded-lg border-2 ${getRarityColor(itemGroup.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(itemGroup.rarity)} overflow-hidden`} onClick={() => handleItemClick(itemGroup)}>
              {isLegendary && ( <> <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div> <div className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-orange-400/50 rounded-tl-md opacity-40 group-hover:opacity-70 transition-opacity"></div> <div className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-orange-400/50 rounded-br-md opacity-40 group-hover:opacity-70 transition-opacity"></div> <div className="absolute inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div> <div className="absolute top-1 right-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div> <div className="absolute bottom-1 left-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div> </>)}
              {totalQuantity > 1 && itemGroup.type !== 'currency' && (<div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{totalQuantity}</div>)}
              {itemGroup.icon.startsWith('http') ? <img src={itemGroup.icon} alt={itemGroup.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" /> : <div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{itemGroup.icon}</div>}
              <ItemTooltip item={itemGroup} />
            </div>
          );
        })}
        
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
