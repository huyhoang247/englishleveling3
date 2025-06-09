// --- START OF FILE inventory.tsx ---

import { useState, useEffect } from 'react';
import { uiAssets } from './game-assets.ts'; 
import { itemDatabase } from './inventory/item-database.ts'; 
import { playerInventoryData } from './inventory/player-inventory-data.ts'; 

// Hàm này sẽ "hydrate" dữ liệu túi đồ của người chơi với thông tin đầy đủ từ database
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
            // THAY ĐỔI: Chuyển đổi rarity cũ sang rank mới nếu cần
            // Ví dụ: 'common' -> 'E', 'uncommon' -> 'D', etc.
            // Để đơn giản, giả sử itemDatabase đã dùng rank mới: E, D, B, A, S, SR, SSR
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
  
  // --- START: THAY ĐỔI TOÀN BỘ HỆ THỐNG VISUAL CỦA RANK ---

  const getRarityDisplayName = (rarity: string) => {
    if (!rarity) return 'Unknown Rank';
    return `${rarity.toUpperCase()} Rank`;
  }
  
  // Cập nhật màu viền theo Rank mới
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'E': return 'border-gray-500';
      case 'D': return 'border-green-500';
      case 'B': return 'border-blue-500';
      case 'A': return 'border-purple-600';
      case 'S': return 'border-yellow-400';
      case 'SR': return 'border-red-500';
      case 'SSR': return 'border-cyan-400 ssr-border-anim'; // Thêm class animation cho SSR
      default: return 'border-gray-500';
    }
  };

  // Cập nhật màu nền gradient theo Rank mới
  const getRarityGradient = (rarity: string) => {
    switch(rarity) {
      case 'E': return 'from-gray-700/70 to-gray-800/70';
      case 'D': return 'from-green-800/80 to-gray-800/70';
      case 'B': return 'from-blue-800/80 to-gray-800/70';
      case 'A': return 'from-purple-800/80 to-gray-800/70';
      case 'S': return 'from-yellow-900/80 via-gray-800/70 to-gray-800/70';
      case 'SR': return 'from-red-800/80 to-gray-800/70';
      case 'SSR': return 'from-cyan-900/80 via-purple-900/70 to-fuchsia-900/80'; // Gradient 3 màu cho SSR
      default: return 'from-gray-700/70 to-gray-800/70';
    }
  };

  // Cập nhật màu chữ theo Rank mới
  const getRarityTextColor = (rarity: string) => {
    switch(rarity) {
      case 'E': return 'text-gray-300';
      case 'D': return 'text-green-400';
      case 'B': return 'text-blue-400';
      case 'A': return 'text-purple-400';
      case 'S': return 'text-yellow-300';
      case 'SR': return 'text-red-400';
      case 'SSR': return 'text-cyan-200 ssr-text-anim'; // Thêm class animation cho SSR
      default: return 'text-gray-300';
    }
  };

  // Cập nhật hiệu ứng phát sáng theo Rank mới
  const getRarityGlow = (rarity: string) => {
    switch(rarity) {
      case 'E': return '';
      case 'D': return '';
      case 'B': return 'shadow-sm shadow-blue-500/30';
      case 'A': return 'shadow-md shadow-purple-500/40';
      case 'S': return 'shadow-lg shadow-yellow-400/50';
      case 'SR': return 'shadow-xl shadow-red-500/50';
      case 'SSR': return 'shadow-xl ssr-item-glow'; // Dùng class animation glow
      default: return '';
    }
  };
  
  // --- END: THAY ĐỔI HỆ THỐNG VISUAL ---

  const renderItemStats = (item: any) => {
    if (!item.stats) return null;
    return (
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
            {/* THAY ĐỔI: Sử dụng màu chữ của rank S thay vì legendary */}
            <span className={`font-semibold ${getRarityTextColor(item.rarity === 'SSR' ? 'S' : 'E')}`}>{stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}</span>
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
      {/* THAY ĐỔI: Hiển thị Rank và Type */}
      <div className="text-gray-500 capitalize text-xs mb-1">{getRarityDisplayName(item.rarity)} • {item.type}</div>
      {item.variants.length > 1 && <div className="text-yellow-400 text-xs mb-1">{item.variants.length} loại khác nhau</div>}
      <div className="text-gray-300 text-xs leading-relaxed">
        { (item.variants[0]?.description || item.description || '').slice(0, 70) }
        { (item.variants[0]?.description || item.description || '').length > 70 ? '...' : '' }
      </div>
    </div>
  );

  const ItemModal = ({ item, isOpen, onClose }: { item: any, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen || !item) return null;
    // THAY ĐỔI: Kiểm tra rank cao nhất là SSR
    const isSSRRarity = item.rarity === 'SSR';
    const isWeapon = item.type === 'weapon';
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animation ? 'opacity-0' : 'opacity-100'} z-40`} onClick={onClose}></div>
        <div className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 ${getRarityGlow(item.rarity)} ${animation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
          {/* THAY ĐỔI: Hiệu ứng đặc biệt cho SSR */}
          {isSSRRarity && (
            <>
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-300/30 animate-pulse [animation-duration:3s] opacity-50"></div>
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-fuchsia-300/20 via-transparent to-transparent opacity-40 rounded-tl-xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-cyan-300/20 via-transparent to-transparent opacity-40 rounded-br-xl"></div>
              <div className="absolute -inset-0.5 bg-purple-400/20 opacity-20 blur-lg rounded-xl -z-10 animate-pulse-stronger"></div>
              <div className="absolute inset-0 flex items-center justify-center -z-10"><div className="w-3/4 h-3/4 rounded-full bg-fuchsia-500/10 blur-2xl opacity-0 animate-fade-in-out"></div></div>
            </>
          )}
          <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
            <h3 className={`text-2xl font-bold ${getRarityTextColor(item.rarity)} ${isSSRRarity ? 'flex items-center gap-x-2' : ''}`}>{isSSRRarity && <span className="text-cyan-100 opacity-80 text-xl">✨</span>}{item.name}{isSSRRarity && <span className="text-cyan-100 opacity-80 text-xl">✨</span>}</h3>
            <button onClick={onClose} className="relative z-50 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl ${isSSRRarity ? 'bg-gradient-to-br from-gray-900 via-purple-900/80 to-gray-900' : 'bg-black/30'} rounded-lg border-2 ${getRarityColor(item.rarity)} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}>
              {isSSRRarity && ( <> <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent opacity-10"></div> <div className="absolute inset-1 bg-fuchsia-500/10 opacity-5 animate-pulse [animation-duration:2s]"></div> <div className="absolute -inset-full rotate-45 w-12 h-full bg-gradient-to-t from-transparent via-white/30 to-transparent opacity-20 transform translate-x-0"></div> <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-full rounded-full bg-cyan-300/10 blur-md opacity-50 animate-ping-slow"></div></div> </>)}
              {item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" /> : <div className="text-2xl sm:text-3xl relative z-0">{item.icon}</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                {/* THAY ĐỔI: Hiển thị Rank và style cho tag */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(item.rarity)} ${isSSRRarity ? 'bg-gradient-to-r from-cyan-800 to-gray-800 border border-cyan-500/40 shadow-md shadow-cyan-500/20' : 'bg-gray-800/70 border border-gray-700'} capitalize`}>{isSSRRarity ? `✨ ${getRarityDisplayName(item.rarity)} ✨` : getRarityDisplayName(item.rarity)}</span>
                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                {isWeapon && item.level !== undefined && <span className="bg-blue-800/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 text-xs font-semibold">Level: {item.level}</span>}
                {item.quantity > 1 && <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{item.quantity}</div>}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          {/* THAY ĐỔI: Stats đặc biệt cho SSR */}
          {isSSRRarity ? ( <div className="mt-4 bg-gradient-to-r from-gray-950 via-purple-900/25 to-gray-950 p-3 rounded-lg border border-cyan-700/40 shadow-lg"> <h4 className={`${getRarityTextColor(item.rarity)} text-base font-semibold mb-2 flex items-center gap-1.5`}><span className="opacity-80">💎</span> Thuộc tính Thần thoại</h4> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5 text-sm">{Object.entries(item.stats || {}).map(([stat, value]) => <div key={stat} className="flex justify-between items-center py-0.5 border-b border-cyan-900/30 last:border-b-0"><span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span><span className={`font-semibold ${getRarityTextColor(item.rarity)} text-base`}>{stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}</span></div>)}</div> </div> ) : renderItemStats(item)}
          {item.type !== 'currency' && ( <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5"> <button className={`flex-1 px-4 py-2.5 ${isSSRRarity ? 'bg-gradient-to-r from-cyan-600 to-fuchsia-800 hover:from-cyan-500 hover:to-fuchsia-700 border border-cyan-400/50 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm`}>Sử dụng</button> <button className={`flex-1 px-4 py-2.5 ${isSSRRarity ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-cyan-600/30 text-cyan-200' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} rounded-lg font-semibold transition-colors duration-200 text-sm`}>Trang bị</button> <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">Bỏ</button> </div> )}
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

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-b-xl shadow-2xl max-w-3xl mx-auto border border-gray-700/50 min-h-screen relative">
      <button onClick={handleCloseInventory} className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl z-10" aria-label="Đóng túi đồ">
        <img src={uiAssets.closeIcon} alt="Close Icon" className="w-5 h-5" />
      </button>
      <div className="mb-7 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-5">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center mb-3 sm:mb-0"><span className="mr-2.5 text-4xl">📦</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">Túi Đồ</span></h1>
        <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80"><span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span></div>
      </div>
      
      {/* THAY ĐỔI: Thêm các keyframes cho hiệu ứng của SSR */}
      <style>{`
        @keyframes pulse-stronger { 0%,100% {opacity:.2;transform:scale(1)} 50% {opacity:.3;transform:scale(1.02)} }
        @keyframes fade-in-out { 0%,100% {opacity:0;transform:scale(.9)} 50% {opacity:.1;transform:scale(1)} }
        @keyframes ping-slow { 0% {transform:scale(.9);opacity:.6} 50% {transform:scale(1.1);opacity:.1} 100% {transform:scale(.9);opacity:.6} }
        .animate-pulse-stronger { animation:pulse-stronger 4s infinite ease-in-out }
        .animate-fade-in-out { animation:fade-in-out 5s infinite ease-in-out }
        .animate-ping-slow { animation:ping-slow 3s infinite ease-in-out }
        
        @keyframes ssr-glow-anim {
          0% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.5), 0 0 25px rgba(255, 0, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.7), 0 0 30px rgba(255, 0, 255, 0.5); }
          100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.5), 0 0 25px rgba(255, 0, 255, 0.3); }
        }
        .ssr-item-glow { animation: ssr-glow-anim 3s infinite ease-in-out; }
        
        @keyframes ssr-border-anim {
          0% { border-color: #06b6d4; } /* cyan-500 */
          33% { border-color: #d946ef; } /* fuchsia-500 */
          66% { border-color: #a855f7; } /* purple-500 */
          100% { border-color: #06b6d4; }
        }
        .ssr-border-anim { animation: ssr-border-anim 4s infinite linear; }

        @keyframes ssr-text-anim {
          0% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.8); color: #a5f3fc; }
          50% { text-shadow: 0 0 8px rgba(217, 70, 239, 0.8); color: #f0abfc; }
          100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.8); color: #a5f3fc; }
        }
        .ssr-text-anim { animation: ssr-text-anim 4s infinite linear; }
        
        .inventory-grid-scrollbar-hidden::-webkit-scrollbar{display:none}
        .inventory-grid-scrollbar-hidden{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      
      <ItemModal item={selectedDetailItem} isOpen={isDetailModalOpen} onClose={closeDetailModal} />
      <VariantSelectionModal itemGroup={selectedItemGroup} isOpen={isVariantModalOpen} onClose={closeVariantModal} onSelectVariant={handleSelectVariant}/>
      
      <div className="grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden">
        {inventory.map((itemGroup: any) => {
          // THAY ĐỔI: Kiểm tra rank SSR và áp dụng hiệu ứng
          const isSSRRarity = itemGroup.rarity === 'SSR';
          const totalQuantity = itemGroup.variants.reduce((sum, v) => sum + v.quantity, 0);
          return (
            <div key={itemGroup.name} className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(itemGroup.rarity)} rounded-lg border-2 ${getRarityColor(itemGroup.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(itemGroup.rarity)} overflow-hidden`} onClick={() => handleItemClick(itemGroup)}>
              {isSSRRarity && ( <> <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div> <div className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-md opacity-40 group-hover:opacity-70 transition-opacity"></div> <div className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-fuchsia-400/50 rounded-br-md opacity-40 group-hover:opacity-70 transition-opacity"></div> <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div> <div className="absolute top-1 right-1 text-cyan-300 text-xs opacity-60 group-hover:text-cyan-100 transition-colors">✨</div> <div className="absolute bottom-1 left-1 text-fuchsia-300 text-xs opacity-60 group-hover:text-fuchsia-100 transition-colors">✨</div> </>)}
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
