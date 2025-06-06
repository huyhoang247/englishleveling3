import { useState, useEffect } from 'react';

// MODIFIED: Renamed to sampleItems to reflect it's the raw data source.
// ADDED a second "Kiếm gỗ" entry to simulate the user's problem.
const sampleItems = [
  // User's scenario: 4 level 1 swords and 1 level 2 sword.
  { id: 1, name: 'Kiếm gỗ', type: 'weapon', rarity: 'common', description: 'Một thanh kiếm gỗ cơ bản, thích hợp cho người mới bắt đầu.', stats: { damage: 5, durability: 20 }, quantity: 4, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/kiem-go.png', level: 1, maxLevel: 10, currentExp: 50, requiredExp: 100 },
  { id: 42, name: 'Kiếm gỗ', type: 'weapon', rarity: 'common', description: 'Một thanh kiếm gỗ đã được nâng cấp.', stats: { damage: 7, durability: 25 }, quantity: 1, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/kiem-go.png', level: 2, maxLevel: 10, currentExp: 10, requiredExp: 200 }, // The upgraded sword
  
  { id: 2, name: 'Thuốc hồi máu', type: 'potion', rarity: 'common', description: 'Hồi phục 50 điểm máu khi sử dụng.', stats: { healing: 50 }, quantity: 5, icon: '🧪' },
  { id: 3, name: 'Áo giáp da', type: 'armor', rarity: 'common', description: 'Áo giáp cơ bản, cung cấp một chút bảo vệ.', stats: { defense: 10 }, quantity: 1, icon: '🥋' },
  { id: 4, name: 'Kiếm sắt', type: 'weapon', rarity: 'uncommon', description: 'Thanh kiếm sắt sắc bén, gây sát thương vật lý cao.', stats: { damage: 15, durability: 50 }, quantity: 1, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000a42c61f78b535b5ca4f2e8f2.png', level: 5, maxLevel: 20, currentExp: 300, requiredExp: 500 },
  { id: 5, name: 'Thuốc hồi năng lượng', type: 'potion', rarity: 'uncommon', description: 'Hồi phục 75 điểm năng lượng khi sử dụng.', stats: { energyRestore: 75 }, quantity: 3, icon: '⚡' },
  { id: 6, name: 'Nhẫn ma thuật', type: 'accessory', rarity: 'rare', description: 'Tăng 15% sức mạnh phép thuật cho người sử dụng.', stats: { magicBoost: 15, intelligence: 5 }, quantity: 1, icon: '💍' },
  { id: 7, name: 'Bùa hộ mệnh', type: 'accessory', rarity: 'rare', description: 'Tự động hồi sinh một lần khi HP về 0.', stats: { resurrection: 1 }, quantity: 1, icon: '🔮' },
  { id: 8, name: 'Kiếm rồng', type: 'weapon', rarity: 'epic', description: 'Vũ khí huyền thoại được rèn từ xương rồng, gây thêm sát thương hỏa.', stats: { damage: 45, fireDamage: 20, durability: 100 }, quantity: 1, icon: '🔥', level: 10, maxLevel: 50, currentExp: 1200, requiredExp: 2000 },
  { id: 9, name: 'Vàng', type: 'currency', rarity: 'common', description: 'Tiền tệ trong game.', quantity: 1450, icon: '💰' },
  { id: 10, name: 'Giáp huyền thoại', type: 'armor', rarity: 'legendary', description: 'Giáp được chế tác từ vảy của rồng cổ đại.', stats: { defense: 50, magicResist: 30 }, quantity: 1, icon: '🛡️' },
  // ... (rest of the items can stay as they are)
  { id: 11, name: 'Găng tay chiến binh', type: 'armor', rarity: 'uncommon', description: 'Tăng sức mạnh tấn công cận chiến.', stats: { strength: 5, attackSpeed: 10 }, quantity: 1, icon: '🧤' },
  { id: 12, name: 'Mũ phù thủy', type: 'armor', rarity: 'rare', description: 'Mũ ma thuật tăng cường khả năng phép thuật.', stats: { intelligence: 15, manaRegen: 5 }, quantity: 1, icon: '🎩' },
  { id: 13, name: 'Cung gỗ', type: 'weapon', rarity: 'common', description: 'Cung gỗ cơ bản cho người mới.', stats: { damage: 7, range: 20 }, quantity: 1, icon: '🏹', level: 2, maxLevel: 15, currentExp: 80, requiredExp: 200 },
  { id: 14, name: 'Rìu chiến', type: 'weapon', rarity: 'uncommon', description: 'Rìu chiến nặng, gây sát thương cao.', stats: { damage: 20 }, quantity: 1, icon: '🪓', level: 7, maxLevel: 25, currentExp: 700, requiredExp: 1000 },
  { id: 15, name: 'Thuốc độc', type: 'potion', rarity: 'rare', description: 'Gây sát thương độc trong 10 giây.', stats: { poisonDamage: 10, duration: 10 }, quantity: 2, icon: '☠️' },
  { id: 16, name: 'Lông phượng hoàng', type: 'material', rarity: 'epic', description: 'Nguyên liệu quý hiếm để chế tạo vật phẩm huyền thoại.', quantity: 1, icon: ' feather' },
  { id: 17, name: 'Đá cường hóa', type: 'material', rarity: 'uncommon', description: 'Dùng để nâng cấp vũ khí và giáp.', quantity: 10, icon: '🪨' },
  { id: 18, name: 'Mảnh bản đồ', type: 'quest', rarity: 'rare', description: 'Một mảnh bản đồ dẫn đến kho báu cổ đại.', quantity: 1, icon: '🗺️' },
  { id: 19, name: 'Chìa khóa vàng', type: 'key', rarity: 'epic', description: 'Chìa khóa mở rương kho báu hiếm.', quantity: 1, icon: '🔑' },
  { id: 20, name: 'Sách cổ', type: 'misc', rarity: 'common', description: 'Một cuốn sách cũ chứa đựng kiến thức cổ xưa.', quantity: 1, icon: '📚' },
  { id: 21, name: 'Thức ăn', type: 'consumable', rarity: 'common', description: 'Hồi phục một ít sức chịu đựng.', quantity: 8, icon: '🍖' },
  { id: 22, name: 'Ngọc trai', type: 'material', rarity: 'uncommon', description: 'Nguyên liệu quý hiếm.', quantity: 3, icon: '⚪' },
  { id: 23, name: 'Hạt giống phép thuật', type: 'misc', rarity: 'rare', description: 'Hạt giống có thể mọc ra cây phép thuật.', quantity: 1, icon: '🌱' },
  { id: 24, name: 'Bình mana lớn', type: 'potion', rarity: 'common', description: 'Hồi phục 100 điểm mana.', stats: { manaRestore: 100 }, quantity: 2, icon: '💧' },
  { id: 25, 'name': 'Đá quý xanh', type: 'material', rarity: 'epic', description: 'Đá quý hiếm có năng lượng ma thuật.', quantity: 1, icon: '💎' },
  { id: 26, 'name': 'Lá cây hiếm', type: 'material', rarity: 'uncommon', description: 'Lá cây dùng để chế thuốc.', quantity: 5, icon: '🍃' },
  { id: 27, 'name': 'Cánh thiên thần', type: 'material', rarity: 'legendary', description: 'Nguyên liệu cực hiếm từ thiên thần.', quantity: 1, icon: '🕊️' },
  { id: 28, 'name': 'Mảnh vỡ cổ', type: 'misc', rarity: 'common', description: 'Mảnh vỡ từ một di tích cổ.', quantity: 10, icon: '🏺' },
  { id: 29, 'name': 'Nước thánh', type: 'potion', rarity: 'rare', description: 'Thanh tẩy các hiệu ứng tiêu cực.', stats: { cleanse: true }, quantity: 1, icon: '✨' },
  { id: 30, 'name': 'Giày tốc độ', type: 'armor', rarity: 'uncommon', description: 'Tăng tốc độ di chuyển.', stats: { speed: 10 }, quantity: 1, icon: '👟' },
  { id: 31, 'name': 'Bánh mì', type: 'consumable', rarity: 'common', description: 'Hồi phục một ít sức chịu đựng.', quantity: 5, icon: '🍞' },
  { id: 32, 'name': 'Cà rốt', type: 'consumable', rarity: 'common', description: 'Hồi phục một ít sức chịu đựng.', quantity: 7, icon: '🥕' },
  { id: 33, 'name': 'Đèn lồng', type: 'misc', rarity: 'common', description: 'Chiếu sáng đường đi.', quantity: 1, icon: '🏮' },
  { id: 34, 'name': 'Dây thừng', type: 'misc', rarity: 'common', description: 'Dụng cụ hữu ích.', quantity: 2, icon: '🔗' },
  { id: 35, 'name': 'Hộp nhạc', type: 'misc', rarity: 'rare', description: 'Phát ra giai điệu êm dịu.', quantity: 1, icon: '🎶' },
  { id: 36, 'name': 'Kính lúp', type: 'misc', rarity: 'uncommon', description: 'Giúp nhìn rõ hơn.', quantity: 1, icon: '🔎' },
  { id: 37, 'name': 'Bản đồ kho báu', type: 'quest', rarity: 'epic', description: 'Dẫn đến kho báu lớn.', quantity: 1, icon: '🧭' },
  { id: 38, 'name': 'Nước tăng lực', type: 'potion', rarity: 'uncommon', description: 'Tăng sức mạnh tạm thời.', stats: { strengthBoost: 10, duration: 30 }, quantity: 3, icon: '⚡' },
  { id: 39, 'name': 'Vòng cổ may mắn', type: 'accessory', rarity: 'rare', description: 'Tăng cơ hội tìm thấy vật phẩm hiếm.', stats: { luck: 5 }, quantity: 1, icon: '🍀' },
  { id: 40, 'name': 'Đá dịch chuyển', type: 'misc', rarity: 'epic', description: 'Dịch chuyển đến địa điểm đã đánh dấu.', quantity: 1, icon: '🪨' },
  { id: 41, name: 'Song Kiếm', type: 'weapon', rarity: 'epic', description: 'Cặp kiếm đôi sắc bén, cho phép tấn công nhanh và liên tục.', stats: { damage: 30, attackSpeed: 15, durability: 80 }, quantity: 1, icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000c5b061f8a19ee9d3e000e95b.png', level: 8, maxLevel: 30, currentExp: 800, requiredExp: 1500 },
];

// NEW: Function to group items by a unique key (name in this case)
const groupInventoryItems = (items) => {
  const grouped = new Map();

  items.forEach(item => {
    // A unique key to identify the base item type. In a real game, this might be a `baseId`.
    const key = item.name;

    // Extract properties that are unique to this specific variant
    const { id, quantity, stats, level, currentExp, requiredExp, description } = item;
    const variant = { id, quantity, stats, level, currentExp, requiredExp, description };
    
    if (!grouped.has(key)) {
      // If this is the first time we see this item, create a new group
      const { name, ...baseProps } = item;
      grouped.set(key, {
        ...baseProps,
        name: key, // ensure name is set
        // All variants of this item will be stored here
        variants: [variant],
      });
    } else {
      // If the group already exists, just add the new variant to it
      grouped.get(key).variants.push(variant);
    }
  });

  return Array.from(grouped.values());
};

// Define props interface for Inventory component
interface InventoryProps {
  onClose: () => void; // Function to call when the inventory is closed
}

export default function Inventory({ onClose }: InventoryProps) { // Destructure onClose from props
  // NEW: State for the processed, grouped inventory data
  const [inventory, setInventory] = useState([]);

  // MODIFIED: States for the new modal flow
  const [selectedItem, setSelectedItem] = useState(null); // For the final detail modal
  const [selectedItemGroup, setSelectedItemGroup] = useState(null); // For the variant selection modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const [animation, setAnimation] = useState(false);
  const totalInventorySlots = 50;

  // NEW: Process the raw item data into a grouped structure on component mount
  useEffect(() => {
    const groupedData = groupInventoryItems(sampleItems);
    setInventory(groupedData);
  }, []);

  const occupiedSlots = inventory.length; // Now based on the number of groups

  // MODIFIED: This effect now controls the DETAIL modal
  useEffect(() => {
    if (selectedItem) {
      setIsDetailModalOpen(true);
      setAnimation(true);
      const timer = setTimeout(() => {
        setAnimation(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  // MODIFIED: Close the DETAIL modal
  const closeDetailModal = () => {
    setAnimation(true);
    setTimeout(() => {
      setIsDetailModalOpen(false);
      setAnimation(false);
      setSelectedItem(null);
    }, 200);
  };
  
  // NEW: Close the VARIANT modal
  const closeVariantModal = () => {
    setIsVariantModalOpen(false);
    setSelectedItemGroup(null);
  }

  // NEW: Handles clicking an item in the main grid
  const handleItemClick = (itemGroup) => {
    // If there's only one variant, open the detail modal directly
    if (itemGroup.variants.length === 1) {
      const singleItem = { ...itemGroup, ...itemGroup.variants[0] };
      delete singleItem.variants; // Clean up the object
      setSelectedItem(singleItem);
    } else {
      // If there are multiple variants, open the variant selection modal
      setSelectedItemGroup(itemGroup);
      setIsVariantModalOpen(true);
    }
  };

  // NEW: Handles selecting a specific variant from the variant modal
  const handleSelectVariant = (variant) => {
    // Combine the base item group properties with the specific variant properties
    const combinedItem = { ...selectedItemGroup, ...variant };
    delete combinedItem.variants; // Clean up
    
    setSelectedItem(combinedItem); // Now open the detail modal with this item
    closeVariantModal(); // Close the variant selection modal
  };

  const handleCloseInventory = () => {
    console.log("Đóng túi đồ");
    onClose();
  };

  // --- All helper functions (getRarityColor, renderItemStats, etc.) remain the same ---
  // ... (No changes needed for getRarityColor, getRarityGradient, getRarityTextColor, getRarityGlow)
  // ... (No changes needed for renderItemStats, formatStatName)
  // ... (No changes needed for ItemTooltip)
  // ... (No changes needed for ItemModal, it will receive a complete item object as before)
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'border-gray-500'; // Slightly darker common border
      case 'uncommon': return 'border-green-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-600'; // Darker epic
      case 'legendary': return 'border-orange-500'; // Changed to orange for legendary
      default: return 'border-gray-500';
    }
  };

  // Background gradient based on rarity
  const getRarityGradient = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'from-gray-700/70 to-gray-800/70'; // More subtle common
      case 'uncommon': return 'from-green-800/80 to-gray-800/70'; // Adjusted uncommon
      case 'rare': return 'from-blue-800/80 to-gray-800/70';    // Adjusted rare
      case 'epic': return 'from-purple-800/80 to-gray-800/70'; // Adjusted epic
      case 'legendary': return 'from-red-900 via-orange-800/70 to-red-900'; // Changed to red/orange for legendary
      default: return 'from-gray-700/70 to-gray-800/70';
    }
  };

  // Text color based on rarity
  const getRarityTextColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'text-gray-300';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-300'; // Changed to orange for legendary
      default: return 'text-gray-300';
    }
  };

  // Glow effect based on rarity
  const getRarityGlow = (rarity: string) => {
    switch(rarity) {
      case 'common': return '';
      case 'uncommon': return 'shadow-sm shadow-green-500/40';
      case 'rare': return 'shadow-md shadow-blue-500/40';
      case 'epic': return 'shadow-lg shadow-purple-500/40';
      // Reduced glow for legendary items
      case 'legendary': return 'shadow-md shadow-orange-400/30 legendary-item-glow'; // Reduced shadow intensity
      default: return '';
    }
  };
  
  // Format stats based on item type
  const renderItemStats = (item: any) => {
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
  const formatStatName = (stat: string) => {
    // Translate specific stat names to Vietnamese for display
    const translations: { [key: string]: string } = {
      damage: 'Sát thương',
      durability: 'Độ bền',
      healing: 'Hồi máu',
      defense: 'Phòng thủ',
      energyRestore: 'Hồi năng lượng',
      magicBoost: 'Tăng phép',
      intelligence: 'Trí tuệ',
      resurrection: 'Hồi sinh',
      fireDamage: 'Sát thương lửa',
      strength: 'Sức mạnh',
      attackSpeed: 'Tốc độ tấn công',
      manaRegen: 'Hồi mana',
      range: 'Tầm xa',
      poisonDamage: 'Sát thương độc',
      duration: 'Thời gian',
      magicResist: 'Kháng phép',
      manaRestore: 'Hồi mana', // Added for new item
      speed: 'Tốc độ', // Added for new item
      cleanse: 'Thanh tẩy', // Added for new item
      strengthBoost: 'Tăng sức mạnh', // Added for new item
      luck: 'May mắn', // Added for new item
    };
    
    // Return translated name if available, otherwise format original stat name
    return translations[stat] || stat
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Component to display tooltip on hover
  const ItemTooltip = ({ item }: { item: any }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 
                   bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{item.type} • {item.rarity}</div>
      {/* Tooltip now shows a summary */}
      <div className="text-gray-300 text-xs leading-relaxed mt-1">
        {item.variants.length > 1 
            ? `${item.variants.length} loại khác nhau.` 
            : item.description.slice(0, 70) + (item.description.length > 70 ? '...' : '')
        }
      </div>
    </div>
  );

  // Modal for item details
  const ItemModal = ({ item, isOpen, onClose }: { item: any, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen || !item) return null;

    const isLegendary = item.rarity === 'legendary';
    const isWeapon = item.type === 'weapon';

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
        {/* Modal Overlay - Lower z-index than modal content */}
        <div 
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animation ? 'opacity-0' : 'opacity-100'} z-40`} 
          onClick={onClose}
        ></div>
        
        {/* Modal Content - Higher z-index */}
        <div 
          className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} 
                      shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto 
                      transition-all duration-300 ${getRarityGlow(item.rarity)}
                      ${animation ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} z-50 
                      scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}
        >
          {/* Legendary specific visual enhancements */}
          {isLegendary && (
            <>
              {/* Pulsing border effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-orange-300/30 animate-pulse [animation-duration:3s] opacity-50"></div> {/* Reduced opacity */}
              {/* Subtle corner light effects */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-orange-200/20 via-transparent to-transparent opacity-40 rounded-tl-xl"></div> {/* Reduced opacity */}
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-orange-200/20 via-transparent to-transparent opacity-40 rounded-br-xl"></div> {/* Reduced opacity */}
              {/* Stronger, more diffused glow */}
              <div className="absolute -inset-0.5 bg-orange-400/20 opacity-20 blur-lg rounded-xl -z-10 animate-pulse-stronger"></div> {/* Reduced opacity and blur */}
              {/* Radial light burst from center */}
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-3/4 h-3/4 rounded-full bg-orange-500/5 blur-2xl opacity-0 animate-fade-in-out"></div> {/* Reduced opacity and blur */}
              </div>
            </>
          )}
          
          <div className="flex justify-between items-start mb-4 border-b border-gray-700/50 pb-4">
            <h3 className={`text-2xl font-bold ${getRarityTextColor(item.rarity)} ${isLegendary ? 'flex items-center gap-x-2' : ''}`}>
              {isLegendary && <span className="text-orange-100 opacity-80 text-xl">✦</span>} {/* Changed to orange */}
              {item.name}
              {isLegendary && <span className="text-orange-100 opacity-80 text-xl">✦</span>} {/* Changed to orange */}
            </h3>
            {/* Close Button - Ensure it's on top */}
            <button 
              onClick={onClose}
              className="relative z-50 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1"
            >
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close Icon" className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl 
                            ${isLegendary 
                              ? 'bg-gradient-to-br from-gray-900 via-orange-900/80 to-gray-900' // Changed to orange
                              : 'bg-black/30'} 
                            rounded-lg border-2 ${getRarityColor(item.rarity)} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}
            >
              {isLegendary && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent opacity-10"></div> {/* Reduced opacity */}
                  <div className="absolute inset-1 bg-orange-500/10 opacity-5 animate-pulse [animation-duration:2s]"></div> {/* Reduced opacity */}
                  <div className="absolute -inset-full rotate-45 w-12 h-full bg-gradient-to-t from-transparent via-white/30 to-transparent opacity-20 transform translate-x-0"></div>
                  {/* Enhanced icon glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-orange-300/10 blur-md opacity-50 animate-ping-slow"></div> {/* Reduced opacity and blur */}
                  </div>
                </>
              )}
              {/* Conditional rendering for image icon */}
              {item.icon.startsWith('http') ? (
                <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-2xl sm:text-3xl relative z-0">{item.icon}</div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-2 gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(item.rarity)} 
                                  ${isLegendary ? 'bg-gradient-to-r from-orange-900 to-gray-800 border border-orange-500/40 shadow-md shadow-orange-500/20' : 'bg-gray-800/70 border border-gray-700'} capitalize`}> {/* Changed to orange */}
                  {isLegendary ? `✦ ${item.rarity.toUpperCase()} ✦` : item.rarity}
                </span>
                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                
                {/* Weapon Level Section - Placed right of type/rarity tags */}
                {isWeapon && item.level !== undefined && (
                  <span className="bg-blue-800/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 text-xs font-semibold">
                    Level: {item.level}
                  </span>
                )}

                {item.quantity > 1 && (
                  <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">
                    x{item.quantity}
                  </div>
                )}
              </div>
              <p className="text-gray-300 leading-relaxed text-xs">{item.description}</p>
            </div>
          </div>
          
          {/* Removed the previous dedicated Weapon Level Section */}

          {isLegendary ? (
            <div className="mt-4 bg-gradient-to-r from-gray-950 via-orange-900/25 to-gray-950 p-3 rounded-lg border border-orange-700/40 shadow-lg"> {/* Changed to orange */}
              <h4 className="text-orange-300 text-base font-semibold mb-2 flex items-center gap-1.5"> {/* Changed to orange */}
                <span className="opacity-80">💎</span> Thuộc tính đặc biệt
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                {Object.entries(item.stats || {}).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between items-center py-0.5 border-b border-orange-900/30 last:border-b-0"> {/* Changed to orange */}
                    <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
                    <span className="font-semibold text-orange-200 text-base"> {/* Changed to orange */}
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
                ? 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 border border-orange-400/50 text-white' // Changed to orange
                : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm`}>
                Sử dụng
              </button>
              <button className={`flex-1 px-4 py-2.5 ${isLegendary
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-orange-600/30 text-orange-200' // Changed to orange
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} rounded-lg font-semibold transition-colors duration-200 text-sm`}>
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
  
  // NEW: Component for the Variant Selection Modal
  const VariantSelectionModal = ({ itemGroup, isOpen, onClose, onSelectVariant }) => {
    if (!isOpen || !itemGroup) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm p-5">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
             <h3 className="text-xl font-bold text-yellow-400">Chọn biến thể: {itemGroup.name}</h3>
             <button onClick={onClose} className="text-gray-500 hover:text-white">
                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close Icon" className="w-5 h-5" />
             </button>
          </div>
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {itemGroup.variants.map((variant, index) => (
              <li 
                key={variant.id || index}
                onClick={() => onSelectVariant(variant)}
                className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg cursor-pointer hover:bg-gray-700/90 border border-gray-700 hover:border-blue-500 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center text-3xl bg-black/30 rounded-md border ${getRarityColor(itemGroup.rarity)}`}>
                        {itemGroup.icon.startsWith('http') ? <img src={itemGroup.icon} alt={itemGroup.name} className="w-full h-full object-contain p-1" /> : itemGroup.icon}
                    </div>
                    <div>
                        <div className="font-semibold text-white">
                            {variant.level ? `Level ${variant.level}` : itemGroup.name}
                        </div>
                        <div className="text-xs text-gray-400">
                            Damage: {variant.stats.damage || 'N/A'}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-bold text-lg text-gray-200">x{variant.quantity}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black text-white p-5 sm:p-7 rounded-b-xl shadow-2xl max-w-3xl mx-auto border border-gray-700/50 min-h-screen relative">
      <button 
        onClick={handleCloseInventory}
        className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl z-10"
        aria-label="Đóng túi đồ"
      >
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close Icon" className="w-5 h-5" />
      </button>

      <div className="mb-7 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700/60 pb-5">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center mb-3 sm:mb-0">
          <span className="mr-2.5 text-4xl">📦</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            Túi Đồ
          </span>
        </h1>
        <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80">
          <span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{occupiedSlots}/{totalInventorySlots}</span>
        </div>
      </div>
      
      <style>{/* ... CSS remains the same ... */}</style>
      
      {/* MODIFIED: The modals are now controlled by different states */}
      <ItemModal 
        item={selectedItem} 
        isOpen={isDetailModalOpen} 
        onClose={closeDetailModal} 
      />
      <VariantSelectionModal 
        itemGroup={selectedItemGroup}
        isOpen={isVariantModalOpen}
        onClose={closeVariantModal}
        onSelectVariant={handleSelectVariant}
      />
      
      {/* MODIFIED: Inventory Grid now maps over `inventory` (grouped data) */}
      <div className="grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 inventory-grid-scrollbar-hidden">
        {inventory.map((itemGroup: any) => {
          const isLegendary = itemGroup.rarity === 'legendary';
          // Calculate the total quantity of all variants in the group
          const totalQuantity = itemGroup.variants.reduce((sum, v) => sum + v.quantity, 0);
          
          return (
            <div 
              key={itemGroup.name} // Use a unique key for the group
              className={`group relative w-full aspect-square ...`}
              onClick={() => handleItemClick(itemGroup)} // Use the new click handler
            >
              {/* ... All the visual styles for the grid item ... */}
              {isLegendary && (
                 <>
                  <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-orange-400/50 rounded-tl-md opacity-40 group-hover:opacity-70 transition-opacity"></div> {/* Reduced opacity */}
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-orange-400/50 rounded-br-md opacity-40 group-hover:opacity-70 transition-opacity"></div> {/* Reduced opacity */}
                  <div className="absolute inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div> {/* Reduced opacity */}
                  <div className="absolute top-1 right-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div> {/* Reduced opacity */}
                  <div className="absolute bottom-1 left-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div> {/* Reduced opacity */}
                </>
              )}
              
              {/* Show total quantity */}
              {totalQuantity > 1 && itemGroup.type !== 'currency' && (
                <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">
                  x{totalQuantity}
                </div>
              )}
              
              {itemGroup.icon.startsWith('http') ? (
                <img src={itemGroup.icon} alt={itemGroup.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{itemGroup.icon}</div>
              )}
              
              {/* Pass the whole group to the tooltip */}
              <ItemTooltip item={itemGroup} />
            </div>
          );
        })}
        
        {Array.from({ length: totalInventorySlots - inventory.length }).map((_, i) => (
          <div 
            key={`empty-${i}`} 
            className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl"
          >
            <span className="opacity-40">＋</span>
          </div>
        ))}
      </div>
    </div>
  );
}
