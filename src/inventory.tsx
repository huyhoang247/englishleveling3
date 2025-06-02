import { useState, useEffect } from 'react';

// Sample data for inventory items
const items = [
  { id: 1, name: 'Kiếm gỗ', type: 'weapon', rarity: 'common', description: 'Một thanh kiếm gỗ cơ bản, thích hợp cho người mới bắt đầu.', stats: { damage: 5, durability: 20 }, quantity: 1, icon: '🗡️' },
  { id: 2, name: 'Thuốc hồi máu', type: 'potion', rarity: 'common', description: 'Hồi phục 50 điểm máu khi sử dụng.', stats: { healing: 50 }, quantity: 5, icon: '🧪' },
  { id: 3, name: 'Áo giáp da', type: 'armor', rarity: 'common', description: 'Áo giáp cơ bản, cung cấp một chút bảo vệ.', stats: { defense: 10, weight: 5 }, quantity: 1, icon: '🥋' },
  { id: 4, name: 'Kiếm sắt', type: 'weapon', rarity: 'uncommon', description: 'Thanh kiếm sắt sắc bén, gây sát thương vật lý cao.', stats: { damage: 15, durability: 50 }, quantity: 1, icon: '⚔️' },
  { id: 5, name: 'Thuốc hồi năng lượng', type: 'potion', rarity: 'uncommon', description: 'Hồi phục 75 điểm năng lượng khi sử dụng.', stats: { energyRestore: 75 }, quantity: 3, icon: '⚡' },
  { id: 6, name: 'Nhẫn ma thuật', type: 'accessory', rarity: 'rare', description: 'Tăng 15% sức mạnh phép thuật cho người sử dụng.', stats: { magicBoost: 15, intelligence: 5 }, quantity: 1, icon: '💍' },
  { id: 7, name: 'Bùa hộ mệnh', type: 'accessory', rarity: 'rare', description: 'Tự động hồi sinh một lần khi HP về 0.', stats: { resurrection: 1 }, quantity: 1, icon: '🔮' },
  { id: 8, name: 'Kiếm rồng', type: 'weapon', rarity: 'epic', description: 'Vũ khí huyền thoại được rèn từ xương rồng, gây thêm sát thương hỏa.', stats: { damage: 45, fireDamage: 20, durability: 100 }, quantity: 1, icon: '🔥' },
  { id: 9, name: 'Vàng', type: 'currency', rarity: 'common', description: 'Tiền tệ trong game.', quantity: 1450, icon: '💰' },
  { id: 10, name: 'Giáp huyền thoại', type: 'armor', rarity: 'legendary', description: 'Giáp được chế tác từ vảy của rồng cổ đại.', stats: { defense: 50, magicResist: 30, weight: 15 }, quantity: 1, icon: '🛡️' },
  { id: 11, name: 'Găng tay chiến binh', type: 'armor', rarity: 'uncommon', description: 'Tăng sức mạnh tấn công cận chiến.', stats: { strength: 5, attackSpeed: 10 }, quantity: 1, icon: '🧤' },
  { id: 12, name: 'Mũ phù thủy', type: 'armor', rarity: 'rare', description: 'Mũ ma thuật tăng cường khả năng phép thuật.', stats: { intelligence: 15, manaRegen: 5 }, quantity: 1, icon: '🎩' },
  { id: 13, name: 'Cung gỗ', type: 'weapon', rarity: 'common', description: 'Cung gỗ cơ bản cho người mới.', stats: { damage: 7, range: 20 }, quantity: 1, icon: '🏹' },
  { id: 14, name: 'Rìu chiến', type: 'weapon', rarity: 'uncommon', description: 'Rìu chiến nặng, gây sát thương cao.', stats: { damage: 20, weight: 15 }, quantity: 1, icon: '🪓' },
  { id: 15, name: 'Thuốc độc', type: 'potion', rarity: 'rare', description: 'Gây sát thương độc trong 10 giây.', stats: { poisonDamage: 10, duration: 10 }, quantity: 2, icon: '☠️' },
  { id: 16, name: 'Lông phượng hoàng', type: 'material', rarity: 'epic', description: 'Nguyên liệu quý hiếm để chế tạo vật phẩm huyền thoại.', quantity: 1, icon: ' feather' },
  { id: 17, name: 'Đá cường hóa', type: 'material', rarity: 'uncommon', description: 'Dùng để nâng cấp vũ khí và giáp.', quantity: 10, icon: '🪨' },
  { id: 18, name: 'Mảnh bản đồ', type: 'quest', rarity: 'rare', description: 'Một mảnh bản đồ dẫn đến kho báu cổ đại.', quantity: 1, icon: '🗺️' },
  { id: 19, name: 'Chìa khóa vàng', type: 'key', rarity: 'epic', description: 'Chìa khóa mở rương kho báu hiếm.', quantity: 1, icon: '🔑' },
  { id: 20, name: 'Sách cổ', type: 'misc', rarity: 'common', description: 'Một cuốn sách cũ chứa đựng kiến thức cổ xưa.', quantity: 1, icon: '📚' },
  { id: 21, name: 'Thức ăn', type: 'consumable', rarity: 'common', description: 'Hồi phục một ít sức chịu đựng.', quantity: 8, icon: '🍖' },
];

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // 5 columns x 5 rows = 25 items per page

  // Calculate items for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // When selecting a new item, show modal
  useEffect(() => {
    if (selectedItem) {
      setIsModalOpen(true);
      setAnimation(true);
      const timer = setTimeout(() => {
        setAnimation(false);
      }, 300); // Corresponds to modal transition duration
      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  // Close modal
  const closeModal = () => {
    setAnimation(true); // Trigger close animation
    setTimeout(() => {
      setIsModalOpen(false);
      setAnimation(false); // Reset animation state
      // Optionally reset selected item here if modal should not retain state
      // setSelectedItem(null);
    }, 200); // Corresponds to modal transition duration
  };

  // Determine color based on rarity
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'border-gray-500'; // Slightly darker common border
      case 'uncommon': return 'border-green-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-600'; // Darker epic
      case 'legendary': return 'border-cyan-400'; // Brighter cyan for legendary
      default: return 'border-gray-500';
    }
  };

  // Background gradient based on rarity
  const getRarityGradient = (rarity) => {
    switch(rarity) {
      case 'common': return 'from-gray-700/70 to-gray-800/70'; // More subtle common
      case 'uncommon': return 'from-green-800/80 to-gray-800/70'; // Adjusted uncommon
      case 'rare': return 'from-blue-800/80 to-gray-800/70';    // Adjusted rare
      case 'epic': return 'from-purple-800/80 to-gray-800/70'; // Adjusted epic
      case 'legendary': return 'from-gray-900 via-cyan-800/70 to-gray-900'; // Refined legendary gradient
      default: return 'from-gray-700/70 to-gray-800/70';
    }
  };

  // Text color based on rarity
  const getRarityTextColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'text-gray-300';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-cyan-300';
      default: return 'text-gray-300';
    }
  };

  // Glow effect based on rarity
  const getRarityGlow = (rarity) => {
    switch(rarity) {
      case 'common': return '';
      case 'uncommon': return 'shadow-sm shadow-green-500/40';
      case 'rare': return 'shadow-md shadow-blue-500/40';
      case 'epic': return 'shadow-lg shadow-purple-500/40';
      case 'legendary': return 'shadow-xl shadow-cyan-400/50 legendary-item-glow'; // Added class for potential animation
      default: return '';
    }
  };
  
  // Format stats based on item type
  const renderItemStats = (item) => {
    if (!item.stats) return null;
    
    return (
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
            <span className={`font-semibold ${getRarityTextColor(item.rarity === 'legendary' ? 'legendary' : 'common')}`}>
              {stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Format stat name
  const formatStatName = (stat) => {
    return stat
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Component to display tooltip on hover
  const ItemTooltip = ({ item }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 
                   bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{item.type} • {item.rarity}</div>
      <div className="text-gray-300 text-xs leading-relaxed">{item.description.slice(0, 70)}{item.description.length > 70 ? '...' : ''}</div>
    </div>
  );

  // Modal for item details
  const ItemModal = ({ item, isOpen, onClose }) => {
    if (!isOpen || !item) return null;

    const isLegendary = item.rarity === 'legendary';

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
        <div 
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animation ? 'opacity-0' : 'opacity-100'}`} 
          onClick={onClose}
        ></div>
        
        <div 
          className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} 
                      shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto 
                      transition-all duration-300 ${getRarityGlow(item.rarity)}
                      ${animation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 
                      scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}
        >
          {isLegendary && (
            <>
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-300/30 animate-pulse [animation-duration:3s]"></div>
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-cyan-200/30 via-transparent to-transparent opacity-50 rounded-tl-xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-cyan-200/30 via-transparent to-transparent opacity-50 rounded-br-xl"></div>
              <div className="absolute -inset-0.5 bg-cyan-400/20 opacity-20 blur-lg rounded-xl -z-10"></div>
            </>
          )}
          
          <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
            <h3 className={`text-2xl font-bold ${getRarityTextColor(item.rarity)} ${isLegendary ? 'flex items-center gap-x-2' : ''}`}>
              {isLegendary && <span className="text-cyan-100 opacity-80 text-xl">✦</span>}
              {item.name}
              {isLegendary && <span className="text-cyan-100 opacity-80 text-xl">✦</span>}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1"
            >
              ✕
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl 
                            ${isLegendary 
                              ? 'bg-gradient-to-br from-gray-900 via-cyan-900/80 to-gray-900' 
                              : 'bg-black/30'} 
                            rounded-lg border-2 ${getRarityColor(item.rarity)} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}
            >
              {isLegendary && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-transparent opacity-20"></div>
                  <div className="absolute inset-1 bg-cyan-500/20 opacity-10 animate-pulse [animation-duration:2s]"></div>
                  <div className="absolute -inset-full rotate-45 w-12 h-full bg-gradient-to-t from-transparent via-white/30 to-transparent opacity-20 transform translate-x-0"></div>
                </>
              )}
              {item.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(item.rarity)} 
                                  ${isLegendary ? 'bg-gradient-to-r from-cyan-900 to-gray-800 border border-cyan-500/40 shadow-md shadow-cyan-500/20' : 'bg-gray-800/70 border border-gray-700'} capitalize`}>
                  {isLegendary ? `✦ ${item.rarity.toUpperCase()} ✦` : item.rarity}
                </span>
                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                {item.quantity > 1 && (
                  <span className="ml-auto text-xs bg-gray-900/80 px-3 py-1 rounded-full border border-gray-700 font-medium text-gray-300">
                    x{item.quantity}
                  </span>
                )}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          
          {isLegendary ? (
            <div className="mt-4 bg-gradient-to-r from-gray-950 via-cyan-900/25 to-gray-950 p-3 rounded-lg border border-cyan-700/40 shadow-lg">
              <h4 className="text-cyan-300 text-base font-semibold mb-2 flex items-center gap-1.5">
                <span className="opacity-80">💎</span> Thuộc tính đặc biệt
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                {Object.entries(item.stats || {}).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between items-center py-0.5 border-b border-cyan-900/30 last:border-b-0">
                    <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
                    <span className="font-semibold text-cyan-200 text-base">
                      {stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            renderItemStats(item)
          )}
          
          {item.type !== 'currency' && (
            <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-700/50 pt-5">
              <button className={`flex-1 px-4 py-2.5 ${isLegendary 
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 border border-cyan-400/50 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm`}>
                Sử dụng
              </button>
              <button className={`flex-1 px-4 py-2.5 ${isLegendary
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-cyan-600/30 text-cyan-200'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} rounded-lg font-semibold transition-all duration-200 text-sm`}>
                Trang bị
              </button>
              <button className="px-4 py-2.5 bg-red-700/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-200 text-sm">
                Bỏ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-xl shadow-2xl max-w-3xl mx-auto border border-gray-700/50 min-h-screen">
      <div className="mb-7 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-5">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center mb-3 sm:mb-0">
          <span className="mr-2.5 text-4xl">📦</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            Túi Đồ
          </span>
        </h1>
        <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80">
          <span className="text-gray-400">Trọng lượng:</span> <span className="font-semibold text-gray-200">24/100</span>
        </div>
      </div>
      
      <ItemModal 
        item={selectedItem} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
      
      <div className="grid grid-cols-5 gap-3"> {/* Changed to 5 columns */}
        {currentItems.map(item => {
          const isLegendary = item.rarity === 'legendary';
          
          return (
            <div 
              key={item.id}
              className={`group relative w-full aspect-square 
                          ${isLegendary 
                            ? 'bg-gradient-to-br from-gray-900 via-cyan-900/80 to-gray-900' 
                            : `bg-gradient-to-br ${getRarityGradient(item.rarity)}`} 
                          rounded-lg border-2 ${getRarityColor(item.rarity)} 
                          flex items-center justify-center cursor-pointer 
                          hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 
                          shadow-lg ${getRarityGlow(item.rarity)} overflow-hidden`}
              onClick={() => setSelectedItem(item)}
            >
              {/* Animated shine effect for legendary items on hover */}
              {isLegendary && (
                <>
                  <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 rounded-br-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-1 right-1 text-cyan-300 text-xs opacity-70 group-hover:text-cyan-100 transition-colors">✦</div>
                  <div className="absolute bottom-1 left-1 text-cyan-300 text-xs opacity-70 group-hover:text-cyan-100 transition-colors">✦</div>
                </>
              )}
              
              {item.quantity > 1 && item.type !== 'currency' && (
                <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">
                  x{item.quantity}
                </div>
              )}
              
              <div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{item.icon}</div> {/* Adjusted icon size */}
              
              <ItemTooltip item={item} />
            </div>
          );
        })}
        
        {/* Empty slots for visual consistency */}
        {Array.from({ length: itemsPerPage - currentItems.length }).map((_, i) => (
          <div 
            key={`empty-${currentPage}-${i}`} 
            className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl"
          >
            <span className="opacity-40">＋</span> {/* Simple placeholder for empty slot */}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
              ${currentPage === page ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
          >
            {page}
          </button>
        ))}
      </div>
      
      {/* Removed the currency and shop section */}
    </div>
  );
}
