import React, { useState, useEffect, useCallback } from 'react';

// Define E-rank weapons that can be randomly crafted
const E_RANK_WEAPONS = [
  { name: 'Kiếm Gỗ Cụt', type: 'weapon', icon: '🗡️', rarity: 'common', level: 0 },
  { name: 'Cung Ngắn', type: 'weapon', icon: '🏹', rarity: 'common', level: 0 },
  { name: 'Dao Găm Cũ', type: 'weapon', icon: '🔪', rarity: 'common', level: 0 },
];

// Define D-rank weapons that can be randomly crafted
const D_RANK_WEAPONS = [
  { name: 'Kiếm Thép D', type: 'weapon', icon: '⚔️', rarity: 'uncommon', level: 0 },
  { name: 'Giáp Da Cứng D', type: 'armor', icon: '🛡️', rarity: 'uncommon', level: 0 },
  { name: 'Cung Thép D', type: 'weapon', icon: '🏹', rarity: 'uncommon', level: 0 },
];

// Define B-rank weapons that can be randomly crafted
const B_RANK_WEAPONS = [
  { name: 'Kiếm Hắc Ám', type: 'weapon', icon: '🗡️', rarity: 'rare', level: 0 },
  { name: 'Khiên Rồng', type: 'armor', icon: '🛡️', rarity: 'rare', level: 0 },
  { name: 'Cung Vô Tận', type: 'weapon', icon: '🏹', rarity: 'epic', level: 0 },
];

// Define A-rank weapons that can be randomly crafted
const A_RANK_WEAPONS = [
  { name: 'Đại Kiếm Thần', type: 'weapon', icon: '✨', rarity: 'epic', level: 0 },
  { name: 'Áo Giáp Thần Long', type: 'armor', icon: '🐉', rarity: 'epic', level: 0 },
  { name: 'Trượng Ma Thuật', type: 'weapon', icon: '🪄', rarity: 'epic', level: 0 },
];

// Define S-rank weapons that can be randomly crafted
const S_RANK_WEAPONS = [
  { name: 'Thiên Thần Kiếm', type: 'weapon', icon: '😇', rarity: 'legendary', level: 0 },
  { name: 'Vương Miện Vô Hạn', type: 'armor', icon: '👑', rarity: 'legendary', level: 0 },
];

// Define all crafting recipes
const CRAFTING_RECIPES_DEFINITION = [
  // Material-based recipes (no shard required) - These are still defined but not directly usable with the new shard-only UI flow for crafting tab.
  // They could be used for other game mechanics or a different UI in the future.
  {
    type: 'material_based',
    rank: 'E',
    materialsRequired: [
      { name: 'Gỗ E', quantity: 20 },
      { name: 'Sắt E', quantity: 20 }
    ],
    outputPool: E_RANK_WEAPONS,
    description: 'Rèn ngẫu nhiên một vũ khí E-rank từ nguyên liệu thô.'
  },
  {
    type: 'material_based',
    rank: 'D',
    materialsRequired: [
      { name: 'Đá D', quantity: 15 },
      { name: 'Da Dày', quantity: 15 }
    ],
    outputPool: D_RANK_WEAPONS,
    description: 'Rèn ngẫu nhiên một vũ khí D-rank từ nguyên liệu thô.'
  },
  {
    type: 'material_based',
    rank: 'B',
    materialsRequired: [
      { name: 'Tinh Thể Năng Lượng', quantity: 10 },
      { name: 'Hợp Kim Huyền Bí', quantity: 10 }
    ],
    outputPool: B_RANK_WEAPONS,
    description: 'Rèn ngẫu nhiên một vũ khí B-rank mạnh mẽ từ nguyên liệu thô.'
  },
  {
    type: 'material_based',
    rank: 'A',
    materialsRequired: [
      { name: 'Ngọc Rồng', quantity: 5 },
      { name: 'Lõi Pha Lê', quantity: 5 }
    ],
    outputPool: A_RANK_WEAPONS,
    description: 'Rèn ngẫu nhiên một vũ khí A-rank cực hiếm từ nguyên liệu thô.'
  },
  {
    type: 'material_based',
    rank: 'S',
    materialsRequired: [
      { name: 'Trái Tim Ánh Sáng', quantity: 1 },
      { name: 'Linh Hồn Hắc Ám', quantity: 1 }
    ],
    outputPool: S_RANK_WEAPONS,
    description: 'Rèn ngẫu nhiên một vũ khí S-rank huyền thoại từ nguyên liệu thô.'
  },
  // Shard-based recipes
  {
    type: 'shard_based',
    rank: 'E',
    shardRequired: { name: 'Mảnh Vũ khí E', quantity: 1 },
    materialsRequired: [
      { name: 'Gỗ E', quantity: 5 },
      { name: 'Sắt E', quantity: 5 }
    ],
    outputPool: E_RANK_WEAPONS,
    description: 'Rèn vũ khí E-rank từ mảnh và nguyên liệu phụ trợ lấy từ túi đồ.'
  },
  {
    type: 'shard_based',
    rank: 'D',
    shardRequired: { name: 'Mảnh Vũ khí D', quantity: 1 },
    materialsRequired: [
      { name: 'Đá D', quantity: 4 },
      { name: 'Da Dày', quantity: 4 }
    ],
    outputPool: D_RANK_WEAPONS.filter(w => w.type === 'weapon'), // Example: Mảnh Vũ khí D only yields weapons
    description: 'Rèn vũ khí D-rank từ mảnh và nguyên liệu phụ trợ lấy từ túi đồ.'
  },
  {
    type: 'shard_based',
    rank: 'D',
    shardRequired: { name: 'Mảnh Giáp D', quantity: 1 },
    materialsRequired: [
      { name: 'Đá D', quantity: 4 }, // Assuming same materials for D-rank armor shard
      { name: 'Da Dày', quantity: 4 }
    ],
    outputPool: [{ name: 'Giáp Da Cứng D', type: 'armor', icon: '🛡️', rarity: 'uncommon', level: 0 }], // Specific armor for this shard
    description: 'Rèn giáp D-rank từ mảnh và nguyên liệu phụ trợ lấy từ túi đồ.'
  },
  {
    type: 'shard_based',
    rank: 'B',
    shardRequired: { name: 'Mảnh Vũ khí B', quantity: 1 },
    materialsRequired: [
      { name: 'Tinh Thể Năng Lượng', quantity: 3 },
      { name: 'Hợp Kim Huyền Bí', quantity: 3 }
    ],
    outputPool: B_RANK_WEAPONS,
    description: 'Rèn vũ khí B-rank từ mảnh và nguyên liệu phụ trợ lấy từ túi đồ.'
  },
  {
    type: 'shard_based',
    rank: 'A',
    shardRequired: { name: 'Mảnh Vũ khí A', quantity: 1 },
    materialsRequired: [
      { name: 'Ngọc Rồng', quantity: 2 }, // Using existing A-rank materials
      { name: 'Lõi Pha Lê', quantity: 2 }
    ],
    outputPool: A_RANK_WEAPONS,
    description: 'Rèn vũ khí A-rank từ mảnh và nguyên liệu phụ trợ lấy từ túi đồ.'
  },
  {
    type: 'shard_based',
    rank: 'S',
    shardRequired: { name: 'Mảnh Vũ khí S', quantity: 1 },
    materialsRequired: [
      { name: 'Trái Tim Ánh Sáng', quantity: 1 }, // Using existing S-rank materials
      { name: 'Linh Hồn Hắc Ám', quantity: 1 }
    ],
    outputPool: S_RANK_WEAPONS,
    description: 'Rèn vũ khí S-rank từ mảnh và nguyên liệu phụ trợ lấy từ túi đồ.'
  },
];


// Define rarity order for upgrades
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// Function to get the next rarity level
const getNextRarity = (currentRarity) => {
  const currentIndex = RARITY_ORDER.indexOf(currentRarity);
  if (currentIndex < RARITY_ORDER.length - 1) {
    return RARITY_ORDER[currentIndex + 1];
  }
  return currentRarity; // Stays legendary if already legendary
};

// --- New Skill and Skill Book Definitions ---

const E_RANK_SKILLS = [
  { name: 'Đấm Thường', icon: '🤜', rarity: 'common', description: 'Gây sát thương vật lý cơ bản.' },
  { name: 'Tăng Tốc Nhỏ', icon: '💨', rarity: 'common', description: 'Tăng tốc độ di chuyển trong thời gian ngắn.' },
  { name: 'Chữa Trị Nhẹ', icon: '🩹', rarity: 'common', description: 'Hồi một lượng nhỏ HP.' },
];

const D_RANK_SKILLS = [
  { name: 'Cú Đấm Mạnh', icon: '💥', rarity: 'uncommon', description: 'Gây sát thương vật lý đáng kể.' },
  { name: 'Khiên Bảo Vệ', icon: '🛡️', rarity: 'uncommon', description: 'Tạo một lá chắn hấp thụ sát thương.' },
  { name: 'Tia Sáng', icon: '☀️', rarity: 'uncommon', description: 'Bắn ra tia sáng gây sát thương phép.' },
];

const B_RANK_SKILLS = [
  { name: 'Chém Xoáy', icon: '🌪️', rarity: 'rare', description: 'Xoay tròn chém kẻ địch xung quanh.' },
  { name: 'Tường Lửa', icon: '🔥', rarity: 'rare', description: 'Triệu hồi tường lửa gây sát thương liên tục.' },
  { name: 'Băng Giá', icon: '❄️', rarity: 'rare', description: 'Đóng băng kẻ địch, giảm tốc độ di chuyển.' },
];

const A_RANK_SKILLS = [
  { name: 'Sấm Sét', icon: '⚡', rarity: 'epic', description: 'Triệu hồi sấm sét tấn công một mục tiêu.' },
  { name: 'Hấp Huyết', icon: '🩸', rarity: 'epic', description: 'Hút máu kẻ địch, hồi HP cho bản thân.' },
  { name: 'Vũ Điệu Kiếm', icon: '🗡️✨', rarity: 'epic', description: 'Thực hiện chuỗi tấn công kiếm nhanh.' },
];

const S_RANK_SKILLS = [
  { name: 'Phán Quyết Thần Thánh', icon: '🌟', rarity: 'legendary', description: 'Gây sát thương lớn lên kẻ địch và hồi HP.' },
  { name: 'Thiên Thạch Giáng', icon: '☄️', rarity: 'legendary', description: 'Triệu hồi thiên thạch hủy diệt xuống khu vực.' },
  { name: 'Nguyên Tố Tối Thượng', icon: '🌀', rarity: 'legendary', description: 'Giải phóng sức mạnh nguyên tố tổng hợp.' },
];

// Map rarity to skill pools for easy lookup
const SKILL_POOLS_BY_RARITY = {
  common: E_RANK_SKILLS,
  uncommon: D_RANK_SKILLS,
  rare: B_RANK_SKILLS,
  epic: A_RANK_SKILLS,
  legendary: S_RANK_SKILLS,
};

const SKILL_BOOKS = [
  { name: 'Sách Kỹ Năng E', type: 'skill_book', icon: '📖', rarity: 'common' },
  { name: 'Sách Kỹ Năng D', type: 'skill_book', icon: '📘', rarity: 'uncommon' },
  { name: 'Sách Kỹ Năng B', type: 'skill_book', icon: '📗', rarity: 'rare' },
  { name: 'Sách Kỹ Năng A', type: 'skill_book', icon: '📙', rarity: 'epic' },
  { name: 'Sách Kỹ Năng S', type: 'skill_book', icon: '📕', rarity: 'legendary' },
];

// --- START: UI Helper functions and components inspired by inventory.tsx ---

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
      case 'legendary': return 'from-gray-900 via-orange-900/80 to-gray-900';
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

const ItemTooltip = ({ item }: { item: any }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name} {item.level > 0 ? `+${item.level}` : ''}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{item.type} • {item.rarity}</div>
    </div>
);


// --- END: UI Helper functions and components ---


// Custom alert component
const CustomAlert = ({ isVisible, message, onClose, type = 'info' }) => {
  if (!isVisible) return null;

  const typeStyles = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`p-6 rounded-lg shadow-xl max-w-sm w-full border-2 ${typeStyles[type]} transform animate-scale-up`}>
        <p className="text-center mb-4 text-lg font-medium">{message}</p>
        <button
          className="w-full py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors duration-200"
          onClick={onClose}
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
};

// Forging/Upgrade animation component
const ForgingAnimation = ({ isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-8xl animate-bounce mb-4">🔨</div>
        <div className="text-white text-2xl font-bold animate-pulse">Đang xử lý...</div>
        <div className="flex justify-center space-x-1 mt-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const Blacksmith = ({ onClose }) => { // Accept onClose prop
  const [activeTab, setActiveTab] = useState('upgrade');
  const [inventory, setInventory] = useState([
    { id: 'w1', name: 'Kiếm Sắt', type: 'weapon', icon: '⚔️', rarity: 'common', level: 0, quantity: 1 },
    { id: 'w1_b', name: 'Kiếm Sắt', type: 'weapon', icon: '⚔️', rarity: 'common', level: 0, quantity: 1 },
    { id: 'm1', name: 'Quặng Đồng', type: 'material', icon: '🪨', rarity: 'common', quantity: 1 },
    { id: 'w2', name: 'Cung Gỗ', type: 'weapon', icon: '🏹', rarity: 'common', level: 0, quantity: 1 },
    { id: 'm2', name: 'Đá Lửa', type: 'material', icon: '🔥', rarity: 'uncommon', quantity: 1 },
    { id: 'w3', name: 'Dao Găm', type: 'weapon', icon: '🔪', rarity: 'common', level: 0, quantity: 1 },
    { id: 'm3', name: 'Gỗ Sồi', type: 'material', icon: '🌳', rarity: 'common', quantity: 1 },
    { id: 'm4', name: 'Đá Cường Hoá', type: 'material', icon: '💎', rarity: 'rare', quantity: 5 },
    { id: 'm5', name: 'Gỗ E', type: 'material', icon: '🌲', rarity: 'common', quantity: 30 },
    { id: 'm6', name: 'Sắt E', type: 'material', icon: '🔩', rarity: 'common', quantity: 30 },
    { id: 'm7', name: 'Đá D', type: 'material', icon: '🪨', rarity: 'uncommon', quantity: 25 },
    { id: 'm8', name: 'Da Dày', type: 'material', icon: '🛡️', rarity: 'uncommon', quantity: 25 },
    { id: 'm9', name: 'Tinh Thể Năng Lượng', type: 'material', icon: '✨', rarity: 'rare', quantity: 20 },
    { id: 'm10', name: 'Hợp Kim Huyền Bí', type: 'material', icon: '🔗', rarity: 'rare', quantity: 20 },
    { id: 'm11', name: 'Ngọc Rồng', type: 'material', icon: '🐉', rarity: 'epic', quantity: 10 },
    { id: 'm12', name: 'Lõi Pha Lê', type: 'material', icon: '🔮', rarity: 'epic', quantity: 10 },
    { id: 'm13', name: 'Trái Tim Ánh Sáng', type: 'material', icon: '❤️', rarity: 'legendary', quantity: 2 },
    { id: 'm14', name: 'Linh Hồn Hắc Ám', type: 'material', icon: '🖤', rarity: 'legendary', quantity: 2 },
    { id: 's1', name: 'Mảnh Vũ khí E', type: 'shard', icon: '🧩', rarity: 'common', quantity: 3 },
    { id: 's2', name: 'Mảnh Vũ khí D', type: 'shard', icon: '💎', rarity: 'uncommon', quantity: 2 },
    { id: 's3', name: 'Mảnh Giáp D', type: 'shard', icon: '🛡️', rarity: 'uncommon', quantity: 2 },
    { id: 's4', name: 'Mảnh Vũ khí B', type: 'shard', icon: '✨', rarity: 'rare', quantity: 1 },
    { id: 's5', name: 'Mảnh Vũ khí A', type: 'shard', icon: '🌟', rarity: 'epic', quantity: 1 },
    { id: 's6', name: 'Mảnh Vũ khí S', type: 'shard', icon: '🌠', rarity: 'legendary', quantity: 1 },
    // New skill books for testing
    { id: 'sb_e', name: 'Sách Kỹ Năng E', type: 'skill_book', icon: '📖', rarity: 'common', quantity: 1 },
    { id: 'sb_d', name: 'Sách Kỹ Năng D', type: 'skill_book', icon: '📘', rarity: 'uncommon', quantity: 1 },
    { id: 'sb_b', name: 'Sách Kỹ Năng B', type: 'skill_book', icon: '📗', rarity: 'rare', quantity: 1 },
    { id: 'sb_a', name: 'Sách Kỹ Năng A', type: 'skill_book', icon: '📙', rarity: 'epic', quantity: 1 },
    { id: 'sb_s', name: 'Sách Kỹ Năng S', type: 'skill_book', icon: '📕', rarity: 'legendary', quantity: 1 },
  ]);

  // --- START: SIMPLIFIED UPGRADE STATE ---
  const [upgradeWeaponSlot, setUpgradeWeaponSlot] = useState(null);
  const [upgradeMaterialSlot, setUpgradeMaterialSlot] = useState(null);
  // --- END: SIMPLIFIED UPGRADE STATE ---
  
  const [craftShardSlot, setCraftShardSlot] = useState(null);

  // New states for Skill tab
  const [skillWeaponSlot, setSkillWeaponSlot] = useState(null);
  const [skillBookSlot, setSkillBookSlot] = useState(null);
  const [learnedSkills, setLearnedSkills] = useState([]);

  const [alert, setAlert] = useState({ isVisible: false, message: '', type: 'info' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeChance, setUpgradeChance] = useState(0);
  const [detectedCraftRecipe, setDetectedCraftRecipe] = useState(null);

  // Forging Slot Component - Placed inside to access activeTab
  const ForgingSlot = ({ item, slotType, slotIndex, onClick, isEmpty, labelOverride, showQuantity = false }) => {
    const slotStyles = {
      weapon: {
        border: 'border-red-500/50',
        bg: item ? 'bg-gradient-to-br from-red-900/40 to-red-800/40' : 'bg-gradient-to-br from-red-900/20 to-red-800/20',
        hoverBg: 'hover:bg-red-700/30',
        hoverBorder: 'hover:border-red-400',
        icon: '⚔️',
        label: 'Trang Bị'
      },
      material: {
        border: 'border-green-500/50',
        bg: item ? 'bg-gradient-to-br from-green-900/40 to-green-800/40' : 'bg-gradient-to-br from-green-900/20 to-green-800/20',
        hoverBg: 'hover:bg-green-700/30',
        hoverBorder: 'hover:border-green-400',
        icon: '💎', // Changed icon for clarity
        label: 'Đá Cường Hoá'
      },
      shard: {
        border: 'border-purple-500/50',
        bg: item ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40' : 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
        hoverBg: 'hover:bg-purple-700/30',
        hoverBorder: 'hover:border-purple-400',
        icon: '🧩',
        label: 'Mảnh Trang Bị'
      },
      skill_book: { // New style for skill books
        border: 'border-cyan-500/50',
        bg: item ? 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/40' : 'bg-gradient-to-br from-cyan-900/20 to-cyan-800/20',
        hoverBg: 'hover:bg-cyan-700/30',
        hoverBorder: 'hover:border-cyan-400',
        icon: '📖',
        label: 'Sách Kỹ Năng'
      }
    };

    const style = slotStyles[slotType];

    const isUpgradeSlot = slotType === 'weapon' || slotType === 'material';
    // Use smaller size for upgrade tab, normal size for others
    const sizeClass = activeTab === 'upgrade' && isUpgradeSlot ? 'h-24' : 'h-32';

    return (
      <div
        className={`
          relative flex flex-col items-center justify-center
          rounded-xl border-2 transition-all duration-300 ease-in-out cursor-pointer
          ${sizeClass} 
          ${style.border} ${style.bg} ${style.hoverBg} ${style.hoverBorder}
          ${item ? 'shadow-lg transform hover:scale-105' : 'border-dashed'}
          ${isEmpty ? 'animate-pulse' : ''}
        `}
        onClick={onClick}
      >
        {item ? (
          <>
            <div className={sizeClass === 'h-24' ? "text-3xl mb-1" : "text-4xl md:text-5xl mb-2"}>
              {item.icon}
            </div>
            <span className={`font-medium text-center px-1 text-white ${sizeClass === 'h-24' ? 'text-xs leading-tight' : 'text-xs md:text-sm'}`}>
              {item.name} {item.level > 0 ? `+${item.level}` : ''}
            </span>
            {showQuantity && item.quantity > 0 && (
              <span className={`absolute bottom-1 right-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full`}>
                {`x${item.quantity}`}
              </span>
            )}
            <div className={`absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              item.rarity === 'legendary' ? 'bg-yellow-600 text-yellow-100' :
              item.rarity === 'epic' ? 'bg-purple-600 text-purple-100' :
              item.rarity === 'rare' ? 'bg-blue-600 text-blue-100' :
              item.rarity === 'uncommon' ? 'bg-green-600 text-green-100' :
              'bg-gray-600 text-gray-100'
            }`}>
              {item.rarity.charAt(0).toUpperCase()}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className={`mb-1 opacity-50 ${sizeClass === 'h-24' ? 'text-2xl' : 'text-3xl'}`}>{style.icon}</div>
            <span className="text-gray-400 text-xs font-medium">
              {labelOverride || style.label}
            </span>
          </div>
        )}
      </div>
    );
  };


  const updateInventory = useCallback((item, quantityChange) => {
    setInventory(prevInventory => {
      const existingItemIndex = prevInventory.findIndex(i =>
        i.name === item.name &&
        i.type === item.type &&
        i.rarity === item.rarity &&
        (item.type === 'weapon' ? i.level === (item.level || 0) : true)
      );

      if (existingItemIndex !== -1) {
        const newInventory = [...prevInventory];
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          quantity: newInventory[existingItemIndex].quantity + quantityChange
        };
        return newInventory.filter(i => i.quantity > 0).sort((a, b) => a.name.localeCompare(b.name));
      } else if (quantityChange > 0) {
        const newItem = { ...item, id: `${item.name}_${Date.now()}_${item.type}`, quantity: quantityChange };
        const newInventory = [...prevInventory, newItem];
        return newInventory.sort((a, b) => a.name.localeCompare(b.name));
      }
      return prevInventory;
    });
  }, []);

  // --- START: SIMPLIFIED UPGRADE CHANCE LOGIC ---
  useEffect(() => {
    if (upgradeWeaponSlot && upgradeMaterialSlot) {
      setUpgradeChance(50); // Fixed chance for simplicity, can be adjusted
    } else {
      setUpgradeChance(0);
    }
  }, [upgradeWeaponSlot, upgradeMaterialSlot]);
  // --- END: SIMPLIFIED UPGRADE CHANCE LOGIC ---


  // Detect crafting recipe based only on the shard in the slot
  const detectCraftRecipeLogic = useCallback((currentShardSlot) => {
    if (!currentShardSlot || currentShardSlot.type !== 'shard') {
      return null;
    }
    const foundRecipe = CRAFTING_RECIPES_DEFINITION.find(recipe =>
      recipe.type === 'shard_based' &&
      recipe.shardRequired &&
      recipe.shardRequired.name === currentShardSlot.name
    );
    return foundRecipe || null;
  }, []);

  useEffect(() => {
    if (activeTab === 'craft') {
      const currentRecipe = detectCraftRecipeLogic(craftShardSlot);
      setDetectedCraftRecipe(currentRecipe);
    } else {
      setDetectedCraftRecipe(null); // Clear recipe if not on craft tab
    }
  }, [craftShardSlot, activeTab, detectCraftRecipeLogic]);

  // Helper function to check if crafting is possible
  const checkCanCraft = useCallback((recipe, shardInSlot, currentInventory) => {
    if (!recipe || !shardInSlot) return false;

    // Check shard quantity
    if (shardInSlot.quantity < recipe.shardRequired.quantity) {
      return false;
    }

    // Check material quantities from inventory
    for (const requiredMaterial of recipe.materialsRequired) {
      const inventoryItem = currentInventory.find(
        (item) => item.name === requiredMaterial.name && item.type === 'material'
      );
      if (!inventoryItem || inventoryItem.quantity < requiredMaterial.quantity) {
        return false;
      }
    }
    return true;
  }, []);


  const showAlert = (message, type = 'info') => {
    setAlert({ isVisible: true, message, type });
  };

  const hideAlert = () => {
    setAlert({ isVisible: false, message: '', type: 'info' });
  };

  const handleItemClick = (itemToMove) => {
    if (isProcessing) return;

    if (activeTab === 'upgrade') {
      // --- START: SIMPLIFIED UPGRADE ITEM PLACEMENT LOGIC ---
      if (itemToMove.type === 'weapon' || itemToMove.type === 'armor') {
        if (upgradeWeaponSlot === null) {
          setUpgradeWeaponSlot(itemToMove);
          updateInventory(itemToMove, -1);
        } else {
          showAlert('Đã có trang bị trong ô nâng cấp!', 'warning');
        }
      } else if (itemToMove.type === 'material' && itemToMove.name === 'Đá Cường Hoá') {
        if (upgradeMaterialSlot === null) {
          setUpgradeMaterialSlot({ ...itemToMove, quantity: 1 });
          updateInventory(itemToMove, -1);
        } else {
          showAlert('Đã có Đá Cường Hoá trong ô!', 'warning');
        }
      } else {
        showAlert('Loại vật phẩm này không thể đặt vào lò nâng cấp.', 'warning');
      }
      // --- END: SIMPLIFIED UPGRADE ITEM PLACEMENT LOGIC ---
    } else if (activeTab === 'craft') {
      if (itemToMove.type === 'weapon' || itemToMove.type === 'armor' || itemToMove.type === 'material') {
        showAlert('Chỉ có thể đặt Mảnh Trang Bị vào lò rèn. Nguyên liệu cần thiết sẽ được lấy từ túi đồ.', 'warning');
        return;
      }

      if (itemToMove.type === 'shard') {
        if (craftShardSlot === null) {
          setCraftShardSlot({ ...itemToMove }); // Place the entire shard stack
          updateInventory(itemToMove, -itemToMove.quantity); // Remove entire stack from inventory
        } else if (craftShardSlot.name === itemToMove.name) {
          showAlert('Mảnh trang bị này đã có trong lò rèn. Vui lòng lấy ra trước nếu muốn thay đổi.', 'warning');
        } else {
           showAlert('Đã có một loại mảnh khác trong lò rèn. Vui lòng lấy ra trước.', 'warning');
        }
      } else {
        showAlert('Vật phẩm này không thể đặt vào lò rèn.', 'warning');
      }
    } else if (activeTab === 'skills') { // New logic for Skills tab
        if (itemToMove.type === 'weapon' || itemToMove.type === 'armor') {
            if (skillWeaponSlot === null) {
                setSkillWeaponSlot(itemToMove);
                updateInventory(itemToMove, -1);
            } else {
                showAlert('Đã có trang bị trong ô. Vui lòng lấy ra trước nếu muốn thay đổi.', 'warning');
            }
        } else if (itemToMove.type === 'skill_book') {
            if (skillBookSlot === null) {
                setSkillBookSlot(itemToMove);
                updateInventory(itemToMove, -1);
            } else {
                showAlert('Đã có sách kỹ năng trong ô. Vui lòng lấy ra trước nếu muốn thay đổi.', 'warning');
            }
        } else {
            showAlert('Vật phẩm này không thể đặt vào lò học kỹ năng.', 'warning');
        }
    }
  };

  // --- START: SIMPLIFIED UPGRADE SLOT CLICK HANDLERS ---
  const handleUpgradeWeaponSlotClick = () => {
    if (isProcessing) return;
    if (upgradeWeaponSlot) {
      updateInventory(upgradeWeaponSlot, 1);
      setUpgradeWeaponSlot(null);
    }
  };

  const handleUpgradeMaterialSlotClick = () => {
    if (isProcessing) return;
    if (upgradeMaterialSlot) {
      updateInventory(upgradeMaterialSlot, 1);
      setUpgradeMaterialSlot(null);
    }
  };
  // --- END: SIMPLIFIED UPGRADE SLOT CLICK HANDLERS ---


  const handleCraftShardSlotClick = () => {
    if (isProcessing) return;
    if (craftShardSlot) {
      updateInventory(craftShardSlot, craftShardSlot.quantity);
      setCraftShardSlot(null);
      setDetectedCraftRecipe(null); // Also clear recipe when shard is removed
    }
  };

  // New slot click handlers for Skills tab
  const handleSkillWeaponSlotClick = () => {
    if (isProcessing) return;
    if (skillWeaponSlot) {
      updateInventory(skillWeaponSlot, 1);
      setSkillWeaponSlot(null);
    }
  };

  const handleSkillBookSlotClick = () => {
    if (isProcessing) return;
    if (skillBookSlot) {
      updateInventory(skillBookSlot, 1);
      setSkillBookSlot(null);
    }
  };

  // --- START: SIMPLIFIED UPGRADE LOGIC ---
  const handleUpgrade = async () => {
    if (!upgradeWeaponSlot || !upgradeMaterialSlot) {
      showAlert('Cần 1 trang bị và 1 Đá Cường Hoá để nâng cấp!', 'error');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    let success = false;
    const randomChance = Math.random() * 100;
    
    // Using the fixed 50% chance
    if (randomChance <= upgradeChance) success = true;

    const itemToUpgrade = { ...upgradeWeaponSlot }; // Save item info before clearing slot
    
    setUpgradeWeaponSlot(null);
    setUpgradeMaterialSlot(null);

    if (success) {
      const newLevel = (itemToUpgrade.level || 0) + 1;
      const newRarity = getNextRarity(itemToUpgrade.rarity);
      const upgradedItem = {
        ...itemToUpgrade,
        id: `${itemToUpgrade.name}_L${newLevel}_${Date.now()}`,
        level: newLevel,
        rarity: newRarity,
        quantity: 1,
      };
      updateInventory(upgradedItem, 1);
      showAlert(`Nâng cấp thành công! Bạn đã tạo ra ${upgradedItem.name} +${upgradedItem.level}!`, 'success');
    } else {
       // On failure, only the material is lost. The weapon is returned.
      updateInventory(itemToUpgrade, 1);
      showAlert('Nâng cấp thất bại! Đá Cường Hoá đã bị mất, nhưng trang bị được bảo toàn.', 'error');
    }
    setIsProcessing(false);
  };
  // --- END: SIMPLIFIED UPGRADE LOGIC ---

  const handleCraft = async () => {
    if (!detectedCraftRecipe || !craftShardSlot) {
      showAlert('Không có công thức rèn hợp lệ hoặc không có mảnh nào được đặt!', 'error');
      return;
    }

    if (!checkCanCraft(detectedCraftRecipe, craftShardSlot, inventory)) {
        showAlert('Không đủ mảnh hoặc nguyên liệu trong túi đồ để rèn!', 'error');
        return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Consume shard from craftShardSlot
    const newShardSlotState = { ...craftShardSlot };
    newShardSlotState.quantity -= detectedCraftRecipe.shardRequired.quantity;
    if (newShardSlotState.quantity <= 0) {
      setCraftShardSlot(null);
    } else {
      setCraftShardSlot(newShardSlotState);
    }

    // Consume materials from inventory
    for (const requiredMaterial of detectedCraftRecipe.materialsRequired) {
      const materialToConsume = inventory.find(item => item.name === requiredMaterial.name && item.type === 'material');
      if (materialToConsume) { // Should always be true due to canCraft check
        updateInventory(
          { ...materialToConsume }, // Pass a copy of the item definition
          -requiredMaterial.quantity
        );
      }
    }

    const randomItem = detectedCraftRecipe.outputPool[Math.floor(Math.random() * detectedCraftRecipe.outputPool.length)];
    const newItem = { ...randomItem, id: `${randomItem.name}_${Date.now()}_Crafted`, quantity: 1 };

    updateInventory(newItem, 1);
    showAlert(`Rèn thành công! Bạn đã tạo ra ${newItem.name}!`, 'success');
    setIsProcessing(false);
  };

  const handleLearnSkill = async () => {
    if (!skillWeaponSlot) {
      showAlert('Cần đặt một trang bị vào ô "Trang Bị Cần Thiết" để học kỹ năng!', 'error');
      return;
    }
    if (!skillBookSlot) {
      showAlert('Cần đặt một sách kỹ năng vào ô "Sách Kỹ Năng" để học kỹ năng!', 'error');
      return;
    }

    const bookRarity = skillBookSlot.rarity;
    const skillPool = SKILL_POOLS_BY_RARITY[bookRarity];

    if (!skillPool || skillPool.length === 0) {
      showAlert(`Không tìm thấy kỹ năng nào cho độ hiếm ${bookRarity} của sách.`, 'error');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Consume the weapon and skill book
    updateInventory(skillBookSlot, -1);
    setSkillWeaponSlot(null);
    setSkillBookSlot(null);

    // Learn a random skill from the pool
    const learnedSkill = skillPool[Math.floor(Math.random() * skillPool.length)];
    setLearnedSkills(prevSkills => [...prevSkills, { ...learnedSkill, id: `${learnedSkill.name}_${Date.now()}` }]);
    showAlert(`Bạn đã học được kỹ năng: ${learnedSkill.name} (${learnedSkill.rarity})!`, 'success');

    setIsProcessing(false);
  };
  
  // --- START: SIMPLIFIED CLEAR SLOTS LOGIC ---
  const handleClearUpgradeSlots = useCallback(() => {
    if (upgradeWeaponSlot) {
      updateInventory(upgradeWeaponSlot, 1);
      setUpgradeWeaponSlot(null);
    }
    if (upgradeMaterialSlot) {
      updateInventory(upgradeMaterialSlot, 1);
      setUpgradeMaterialSlot(null);
    }
  }, [upgradeWeaponSlot, upgradeMaterialSlot, updateInventory]);
  // --- END: SIMPLIFIED CLEAR SLOTS LOGIC ---


  const handleClearCraftSlots = useCallback(() => {
    if (craftShardSlot) {
      updateInventory(craftShardSlot, craftShardSlot.quantity);
      setCraftShardSlot(null);
    }
    setDetectedCraftRecipe(null);
  }, [craftShardSlot, updateInventory]);

  const handleClearSkillSlots = useCallback(() => {
    if (skillWeaponSlot) {
      updateInventory(skillWeaponSlot, 1);
      setSkillWeaponSlot(null);
    }
    if (skillBookSlot) {
      updateInventory(skillBookSlot, 1);
      setSkillBookSlot(null);
    }
  }, [skillWeaponSlot, skillBookSlot, updateInventory]);

  const handleClearSlots = () => {
    if (isProcessing) return;
    if (activeTab === 'upgrade') {
      handleClearUpgradeSlots();
    } else if (activeTab === 'craft') {
      handleClearCraftSlots();
    } else if (activeTab === 'skills') {
      handleClearSkillSlots();
    }
  };

  const canCraftButtonBeEnabled = checkCanCraft(detectedCraftRecipe, craftShardSlot, inventory);
  const canLearnSkillButtonBeEnabled = skillWeaponSlot !== null && skillBookSlot !== null;
  const totalInventorySlots = 50; // Match inventory.tsx for visual consistency

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 font-sans z-40"> {/* Fixed to fullscreen */}
      <div className="max-w-7xl mx-auto h-full flex flex-col"> {/* Added flex-col and h-full */}
        
        {/* ----- START: FINALIZED TOP BAR ----- */}
        <div className="flex justify-between items-center shrink-0">
          {/* Left side: Tab Navigation */}
          <div className="flex justify-center gap-1 p-1 bg-gray-800/50 rounded-full shadow-lg border border-gray-700 max-w-fit">
              <button
                className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${
                  activeTab === 'upgrade'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={() => {
                  setActiveTab('upgrade');
                  handleClearCraftSlots(); 
                  handleClearSkillSlots();
                }}
              >
                Nâng Cấp
              </button>
              <button
                className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${
                  activeTab === 'craft'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={() => {
                  setActiveTab('craft');
                  handleClearUpgradeSlots();
                  handleClearSkillSlots();
                }}
              >
                Rèn
              </button>
              <button
                className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${
                  activeTab === 'skills'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={() => {
                  setActiveTab('skills');
                  handleClearUpgradeSlots();
                  handleClearCraftSlots();
                }}
              >
                Kỹ Năng
              </button>
          </div>

          {/* Right side: Close Button */}
          <button
            onClick={onClose}
            className="text-white shadow-lg z-50 transition-transform transform hover:scale-110"
            aria-label="Đóng lò rèn"
            title="Đóng lò rèn"
          >
            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close" className="w-6 h-6" onError={(e) => e.target.src = 'https://placehold.co/24x24/FF0000/FFFFFF?text=X'} />
          </button>
        </div>
        {/* ----- END: FINALIZED TOP BAR ----- */}

        <div className="grid lg:grid-cols-2 gap-8 flex-grow overflow-y-auto hide-scrollbar mt-4"> {/* Added mt-4 for spacing */}
          
          {/* ----- START: SIMPLIFIED UPGRADE TAB ----- */}
          {activeTab === 'upgrade' && (
            <div className="flex flex-col h-full"> 
                <div>
                    {/* Anvil frame with simplified slots */}
                    <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-yellow-500/30 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-24">
                                <ForgingSlot
                                  item={upgradeWeaponSlot}
                                  slotType="weapon"
                                  onClick={handleUpgradeWeaponSlotClick}
                                  isEmpty={upgradeWeaponSlot === null}
                                />
                            </div>
                            <div className="w-24">
                                <ForgingSlot
                                  item={upgradeMaterialSlot}
                                  slotType="material"
                                  onClick={handleUpgradeMaterialSlotClick}
                                  isEmpty={upgradeMaterialSlot === null}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ----- START: NEW CONDITIONAL UI ----- */}
                    <div className="flex flex-col items-center justify-center min-h-[6rem]">
                        {upgradeChance > 0 ? (
                            // Show buttons when ready
                            <div className="flex items-center justify-center gap-2">
                                {/* Upgrade Button */}
                                <button
                                    onClick={handleUpgrade}
                                    disabled={isProcessing}
                                    className="px-6 py-2 rounded-lg text-base font-bold shadow-lg transition-all duration-300 transform bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 hover:scale-105"
                                >
                                    Nâng Cấp
                                </button>

                                {/* Rate Display */}
                                <div className="px-4 py-2 rounded-lg bg-black/50 border border-gray-600 flex items-center justify-center">
                                    <span className="text-xl font-bold text-yellow-400">
                                        {upgradeChance}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Show instructional text when not ready
                            <p className="text-center text-sm text-gray-400">
                                Đặt trang bị và đá cường hoá để nâng cấp.
                            </p>
                        )}
                    </div>
                    {/* ----- END: NEW CONDITIONAL UI ----- */}
                </div>
            </div>
          )}
          {/* ----- END: SIMPLIFIED UPGRADE TAB ----- */}


          {activeTab === 'craft' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-green-500/30 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-green-300 flex items-center gap-2">
                    <span>✨</span> Lò Rèn Vật Phẩm
                  </h2>
                  <button
                    onClick={handleClearSlots}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                    disabled={isProcessing || craftShardSlot === null}
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                    <span>🧩</span> Mảnh Trang Bị (Đặt 1 loại mảnh vào đây)
                  </h3>
                  <ForgingSlot
                    item={craftShardSlot}
                    slotType="shard"
                    slotIndex={0} // Only one shard slot
                    onClick={handleCraftShardSlotClick}
                    isEmpty={craftShardSlot === null}
                    labelOverride="Đặt mảnh vào đây"
                    showQuantity={true}
                  />
                </div>
                
                {/* Display Required Materials & Recipe Info */}
                {detectedCraftRecipe && craftShardSlot && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-teal-900/40 rounded-xl border border-blue-500/50 shadow-lg">
                    <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                      <span>💡</span> Công thức nhận diện: <span className="text-yellow-300">{detectedCraftRecipe.rank}-Rank</span>
                    </h3>
                    <div className="text-sm text-gray-300 mb-2">
                       <h4 className="font-semibold text-purple-200 mb-1">Yêu cầu từ Lò Rèn & Túi Đồ:</h4>
                       <ul className="space-y-1 list-disc list-inside ml-2">
                          {/* Shard requirement display */}
                          <li className="flex justify-between items-center">
                            <span>
                              {craftShardSlot.icon} {detectedCraftRecipe.shardRequired.name}:
                            </span>
                            <span className={`font-bold ${
                              craftShardSlot.quantity >= detectedCraftRecipe.shardRequired.quantity
                                ? 'text-green-300'
                                : 'text-red-300'
                            }`}>
                              {craftShardSlot.quantity} / {detectedCraftRecipe.shardRequired.quantity} (Trong lò)
                            </span>
                          </li>
                          {/* Material requirements display */}
                          {detectedCraftRecipe.materialsRequired.map((mat, idx) => {
                            const invItem = inventory.find(i => i.name === mat.name && i.type === 'material');
                            const currentAmount = invItem ? invItem.quantity : 0;
                            const hasEnough = currentAmount >= mat.quantity;
                            const materialIcon = inventory.find(i => i.name === mat.name)?.icon || '🧱';
                            return (
                              <li key={idx} className="flex justify-between items-center">
                                <span>
                                  {materialIcon} {mat.name}:
                                </span>
                                <span className={`font-bold ${hasEnough ? 'text-green-300' : 'text-red-300'}`}>
                                  {currentAmount} / {mat.quantity} (Trong túi)
                                </span>
                              </li>
                            );
                          })}
                       </ul>
                    </div>
                    <div className="text-sm text-gray-300 mt-3">
                      <span className="font-semibold text-green-200">Kết quả có thể nhận:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-xs text-gray-400">
                        {detectedCraftRecipe.outputPool.map((item, index) => (
                          <li key={index}>{item.icon} {item.name} ({item.rarity})</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">{detectedCraftRecipe.description}</p>
                  </div>
                )}
                {!detectedCraftRecipe && craftShardSlot && (
                   <p className="text-center text-yellow-400 italic my-4">Không tìm thấy công thức cho mảnh này.</p>
                )}
                 {!craftShardSlot && (
                   <p className="text-center text-gray-400 italic my-4">Hãy đặt một mảnh trang bị vào lò để xem công thức.</p>
                )}
              </div>

              <button
                className={`w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 transform mt-auto ${
                  canCraftButtonBeEnabled && !isProcessing
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-400 hover:to-teal-400 hover:scale-105 shadow-green-500/25'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                onClick={handleCraft}
                disabled={isProcessing || !canCraftButtonBeEnabled}
              >
                {canCraftButtonBeEnabled ? `✨ Rèn Vật phẩm ${detectedCraftRecipe?.rank}-rank` : '⚠️ Cần đủ mảnh & nguyên liệu'}
              </button>
            </div>
          )}

          {activeTab === 'skills' && ( // New Skills tab content
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-cyan-500/30 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
                    <span>📚</span> Lò Học Kỹ Năng
                  </h2>
                  <button
                    onClick={handleClearSlots}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                    disabled={isProcessing || (skillWeaponSlot === null && skillBookSlot === null)}
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                    <span>⚔️</span> Trang Bị Cần Thiết (Để học kỹ năng)
                  </h3>
                  <ForgingSlot
                    item={skillWeaponSlot}
                    slotType="weapon"
                    slotIndex={0}
                    onClick={handleSkillWeaponSlotClick}
                    isEmpty={skillWeaponSlot === null}
                    labelOverride="Đặt trang bị vào đây"
                  />
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                    <span>📖</span> Sách Kỹ Năng
                  </h3>
                  <ForgingSlot
                    item={skillBookSlot}
                    slotType="skill_book"
                    slotIndex={0}
                    onClick={handleSkillBookSlotClick}
                    isEmpty={skillBookSlot === null}
                    labelOverride="Đặt sách kỹ năng vào đây"
                  />
                </div>

                {skillBookSlot && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-xl border border-blue-500/50 shadow-lg">
                    <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                      <span>🌟</span> Thông tin Sách Kỹ Năng:
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      Sách kỹ năng: <span className="font-semibold text-white">{skillBookSlot.name}</span>
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      Độ hiếm: <span className={`font-bold ${
                        skillBookSlot.rarity === 'legendary' ? 'text-yellow-400' :
                        skillBookSlot.rarity === 'epic' ? 'text-purple-400' :
                        skillBookSlot.rarity === 'rare' ? 'text-blue-400' :
                        skillBookSlot.rarity === 'uncommon' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {skillBookSlot.rarity.charAt(0).toUpperCase() + skillBookSlot.rarity.slice(1)}
                      </span>
                    </p>
                    <div className="text-sm text-gray-300 mt-3">
                      <span className="font-semibold text-green-200">Kỹ năng có thể học:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-xs text-gray-400">
                        {(SKILL_POOLS_BY_RARITY[skillBookSlot.rarity] || []).map((skill, index) => (
                          <li key={index}>{skill.icon} {skill.name} ({skill.rarity})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {!skillBookSlot && skillWeaponSlot && (
                  <p className="text-center text-gray-400 italic my-4">Hãy đặt một sách kỹ năng vào lò để xem các kỹ năng có thể học.</p>
                )}
                {!skillBookSlot && !skillWeaponSlot && (
                  <p className="text-center text-gray-400 italic my-4">Hãy đặt trang bị và sách kỹ năng vào lò để học kỹ năng.</p>
                )}
              </div>

              <button
                className={`w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 transform mt-auto ${
                  canLearnSkillButtonBeEnabled && !isProcessing
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 hover:scale-105 shadow-blue-500/25'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                onClick={handleLearnSkill}
                disabled={isProcessing || !canLearnSkillButtonBeEnabled}
              >
                {canLearnSkillButtonBeEnabled ? '✨ Học Kỹ Năng' : '⚠️ Cần đủ vật phẩm để học'}
              </button>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
                <span>🎒</span> Túi Đồ
                </h2>
                <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80">
                    <span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{inventory.length}/{totalInventorySlots}</span>
                </div>
            </div>

            {/* --- MODIFIED: Changed grid columns to 4 and added hide-scrollbar --- */}
            <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto hide-scrollbar">
              {inventory.map((item: any) => {
                  const isLegendary = item.rarity === 'legendary';
                  return (
                    <div
                      key={item.id}
                      className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(item.rarity)} rounded-lg border-2 ${getRarityColor(item.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(item.rarity)} overflow-hidden
                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => !isProcessing && handleItemClick(item)}
                    >
                      {isLegendary && (
                        <>
                          <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div>
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-orange-400/50 rounded-tl-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
                          <div className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-orange-400/50 rounded-br-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
                          <div className="absolute top-1 right-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div>
                        </>
                      )}
                      
                      {item.quantity > 1 && (
                        <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">
                          x{item.quantity}
                        </div>
                      )}
                      
                      {typeof item.icon === 'string' && item.icon.startsWith('http') ? (
                        <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" />
                      ) : (
                        <div className="text-4xl relative z-0 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
                      )}
                      
                      <ItemTooltip item={item} />
                    </div>
                  );
                })}
                
                {Array.from({ length: Math.max(0, totalInventorySlots - inventory.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full aspect-square bg-gray-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-600 text-2xl">
                        <span className="opacity-40"></span>
                    </div>
                ))}
            </div>
            {/* --- END: REPLACED INVENTORY UI --- */}

            {/* New Learned Skills Section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-yellow-300 flex items-center gap-2">
                <span>📚</span> Kỹ Năng Đã Học ({learnedSkills.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-48 overflow-y-auto hide-scrollbar">
                {learnedSkills.length > 0 ? (
                  learnedSkills.map(skill => (
                    <div
                      key={skill.id}
                      className={`
                        relative flex flex-col items-center p-4 rounded-xl
                        shadow-md bg-gradient-to-br from-indigo-800/40 to-indigo-900/40 border border-indigo-500/40
                      `}
                    >
                      <div className="text-4xl mb-2">{skill.icon}</div>
                      <span className="text-sm font-medium text-gray-100 text-center leading-tight">
                          {skill.name}
                      </span>
                      <p className="text-xs text-gray-400 text-center mt-1">{skill.description}</p>
                      <div className={`absolute bottom-1 left-1 w-3 h-3 rounded-full border-2 border-white ${
                        skill.rarity === 'legendary' ? 'bg-yellow-400' :
                        skill.rarity === 'epic' ? 'bg-purple-400' :
                        skill.rarity === 'rare' ? 'bg-blue-400' :
                        skill.rarity === 'uncommon' ? 'bg-green-400' :
                        'bg-gray-400'
                      }`} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-400 italic py-8">
                    <div className="text-6xl mb-4">📜</div>
                    <p>Chưa có kỹ năng nào được học</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomAlert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
      <ForgingAnimation isProcessing={isProcessing} />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
        .legendary-item-glow {
          box-shadow: 0 0 10px rgba(255,165,0,.4), 0 0 20px rgba(255,69,0,.2);
          transition: box-shadow .3s ease-in-out;
        }
        .legendary-item-glow:hover {
          box-shadow: 0 0 15px rgba(255,165,0,.6), 0 0 30px rgba(255,69,0,.4);
        }
        /* New class to hide scrollbar */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Blacksmith;
