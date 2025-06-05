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
  // Material-based recipes (no shard required)
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
    description: 'Rèn vũ khí E-rank từ mảnh và nguyên liệu phụ trợ.'
  },
  {
    type: 'shard_based',
    rank: 'D',
    shardRequired: { name: 'Mảnh Vũ khí D', quantity: 1 },
    materialsRequired: [
      { name: 'Đá D', quantity: 4 },
      { name: 'Da Dày', quantity: 4 }
    ],
    outputPool: D_RANK_WEAPONS,
    description: 'Rèn vũ khí D-rank từ mảnh và nguyên liệu phụ trợ.'
  },
  {
    type: 'shard_based',
    rank: 'D',
    shardRequired: { name: 'Mảnh Giáp D', quantity: 1 },
    materialsRequired: [
      { name: 'Đá D', quantity: 4 },
      { name: 'Da Dày', quantity: 4 }
    ],
    outputPool: [{ name: 'Giáp Da Cứng D', type: 'armor', icon: '🛡️', rarity: 'uncommon', level: 0 }], // Specific armor for this shard
    description: 'Rèn giáp D-rank từ mảnh và nguyên liệu phụ trợ.'
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
    description: 'Rèn vũ khí B-rank từ mảnh và nguyên liệu phụ trợ.'
  },
  {
    type: 'shard_based',
    rank: 'A',
    shardRequired: { name: 'Mảnh Vũ khí A', quantity: 1 },
    materialsRequired: [
      { name: 'Ngọc Rồng', quantity: 2 },
      { name: 'Lõi Pha Lê', quantity: 2 }
    ],
    outputPool: A_RANK_WEAPONS,
    description: 'Rèn vũ khí A-rank từ mảnh và nguyên liệu phụ trợ.'
  },
  {
    type: 'shard_based',
    rank: 'S',
    shardRequired: { name: 'Mảnh Vũ khí S', quantity: 1 },
    materialsRequired: [
      { name: 'Trái Tim Ánh Sáng', quantity: 1 },
      { name: 'Linh Hồn Hắc Ám', quantity: 1 }
    ],
    outputPool: S_RANK_WEAPONS,
    description: 'Rèn vũ khí S-rank từ mảnh và nguyên liệu phụ trợ.'
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

// Forging Slot Component for Upgrade Tab
const ForgingSlot = ({ item, slotType, slotIndex, onClick, isEmpty, labelOverride, showQuantity = false, requiredForRecipe = 0 }) => {
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
      icon: '🪨',
      label: 'Nguyên Liệu'
    },
    shard: { // New style for shard slot
      border: 'border-purple-500/50',
      bg: item ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40' : 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
      hoverBg: 'hover:bg-purple-700/30',
      hoverBorder: 'hover:border-purple-400',
      icon: '🧩',
      label: 'Mảnh Trang Bị'
    }
  };

  const style = slotStyles[slotType];

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center h-36 md:h-40
        rounded-xl border-2 transition-all duration-300 ease-in-out cursor-pointer
        ${style.border} ${style.bg} ${style.hoverBg} ${style.hoverBorder}
        ${item ? 'shadow-lg transform hover:scale-105' : 'border-dashed'}
        ${isEmpty ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
    >
      {item ? (
        <>
          <div className="text-4xl md:text-5xl mb-2 animate-pulse">
            {item.icon}
          </div>
          <span className="text-xs md:text-sm font-medium text-center px-2 text-white">
            {item.name} {item.level > 0 ? `+${item.level}` : ''}
          </span>
          {showQuantity && item.quantity > 0 && (
            <span className={`absolute bottom-1 right-1 px-2 py-1 ${item.quantity >= requiredForRecipe ? 'bg-blue-500' : 'bg-red-500'} text-white text-xs font-bold rounded-full`}>
              {requiredForRecipe > 0 ? `${item.quantity}/${requiredForRecipe}` : `x${item.quantity}`}
            </span>
          )}
          <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${
            item.rarity === 'legendary' ? 'bg-yellow-600 text-yellow-100' :
            item.rarity === 'epic' ? 'bg-purple-600 text-purple-100' :
            item.rarity === 'rare' ? 'bg-blue-600 text-blue-100' :
            item.rarity === 'uncommon' ? 'bg-green-600 text-green-100' :
            'bg-gray-600 text-gray-100'
          }`}>
            {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-3xl mb-2 opacity-50">{style.icon}</div>
          <span className="text-gray-400 text-xs font-medium">
            {labelOverride || style.label}
          </span>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  // State for current active tab
  const [activeTab, setActiveTab] = useState('upgrade'); // 'upgrade' or 'craft'

  // State for inventory items, now with quantity
  const [inventory, setInventory] = useState([
    { id: 'w1', name: 'Kiếm Sắt', type: 'weapon', icon: '⚔️', rarity: 'common', level: 0, quantity: 1 },
    { id: 'w1_b', name: 'Kiếm Sắt', type: 'weapon', icon: '⚔️', rarity: 'common', level: 0, quantity: 1 },
    { id: 'm1', name: 'Quặng Đồng', type: 'material', icon: '🪨', rarity: 'common', quantity: 1 },
    { id: 'w2', name: 'Cung Gỗ', type: 'weapon', icon: '🏹', rarity: 'common', level: 0, quantity: 1 },
    { id: 'm2', name: 'Đá Lửa', type: 'material', icon: '🔥', rarity: 'uncommon', quantity: 1 },
    { id: 'w3', name: 'Dao Găm', type: 'weapon', icon: '🔪', rarity: 'common', level: 0, quantity: 1 },
    { id: 'm3', name: 'Gỗ Sồi', type: 'material', icon: '🌳', rarity: 'common', quantity: 1 },
    { id: 'm4', name: 'Đá Cường Hoá', type: 'material', icon: '💎', rarity: 'rare', quantity: 5 }, // Combined into one stack
    { id: 'm5', name: 'Gỗ E', type: 'material', icon: '🌲', rarity: 'common', quantity: 30 }, // E-rank wood
    { id: 'm6', name: 'Sắt E', type: 'material', icon: '🔩', rarity: 'common', quantity: 30 }, // E-rank iron
    { id: 'm7', name: 'Đá D', type: 'material', icon: '🪨', rarity: 'uncommon', quantity: 25 }, // D-rank stone
    { id: 'm8', name: 'Da Dày', type: 'material', icon: '🛡️', rarity: 'uncommon', quantity: 25 }, // D-rank leather
    { id: 'm9', name: 'Tinh Thể Năng Lượng', type: 'material', icon: '✨', rarity: 'rare', quantity: 20 },
    { id: 'm10', name: 'Hợp Kim Huyền Bí', type: 'material', icon: '🔗', rarity: 'rare', quantity: 20 },
    { id: 'm11', name: 'Ngọc Rồng', type: 'material', icon: '🐉', rarity: 'epic', quantity: 10 },
    { id: 'm12', name: 'Lõi Pha Lê', type: 'material', icon: '🔮', rarity: 'epic', quantity: 10 },
    { id: 'm13', name: 'Trái Tim Ánh Sáng', type: 'material', icon: '❤️', rarity: 'legendary', quantity: 2 },
    { id: 'm14', name: 'Linh Hồn Hắc Ám', type: 'material', icon: '🖤', rarity: 'legendary', quantity: 2 },
    // New Shard Items
    { id: 's1', name: 'Mảnh Vũ khí E', type: 'shard', icon: '🧩', rarity: 'common', quantity: 3 },
    { id: 's2', name: 'Mảnh Vũ khí D', type: 'shard', icon: '💎', rarity: 'uncommon', quantity: 2 },
    { id: 's3', name: 'Mảnh Giáp D', type: 'shard', icon: '🛡️', rarity: 'uncommon', quantity: 2 },
    { id: 's4', name: 'Mảnh Vũ khí B', type: 'shard', icon: '✨', rarity: 'rare', quantity: 1 },
    { id: 's5', name: 'Mảnh Vũ khí A', type: 'shard', icon: '🌟', rarity: 'epic', quantity: 1 },
    { id: 's6', name: 'Mảnh Vũ khí S', type: 'shard', icon: '🌠', rarity: 'legendary', quantity: 1 },
  ]);

  // State for upgrade slots
  const [upgradeWeaponSlots, setUpgradeWeaponSlots] = useState([null, null]); // Slot 0: Main item, Slot 1: Sacrificial item
  const [upgradeMaterialSlots, setUpgradeMaterialSlots] = useState([null, null, null]); // Up to 3 reinforcement stones

  // State for universal craft slots
  const [craftShardSlot, setCraftShardSlot] = useState(null); // New slot for equipment shards
  const [craftMaterialSlots, setCraftMaterialSlots] = useState([null, null, null, null]); // Up to 4 material types for crafting

  // State for global alert and processing animation
  const [alert, setAlert] = useState({ isVisible: false, message: '', type: 'info' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeChance, setUpgradeChance] = useState(0);
  const [detectedCraftRecipe, setDetectedCraftRecipe] = useState(null);

  // Helper function to update inventory (add/remove/update quantity)
  const updateInventory = useCallback((item, quantityChange) => {
    setInventory(prevInventory => {
      // Find item in inventory based on its unique properties (name, type, rarity, level)
      // For materials and shards, only name, type, rarity are considered for stacking.
      // For weapons, name, type, rarity, and level are considered.
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
        // Remove item if quantity drops to 0 or below
        return newInventory.filter(i => i.quantity > 0).sort((a, b) => a.name.localeCompare(b.name));
      } else if (quantityChange > 0) {
        // Add new item if not found and quantityChange is positive
        const newItem = { ...item, id: `${item.name}_${Date.now()}_${item.type}`, quantity: quantityChange }; // Ensure unique ID
        const newInventory = [...prevInventory, newItem];
        // Sort inventory for consistent display
        return newInventory.sort((a, b) => a.name.localeCompare(b.name));
      }
      return prevInventory; // No change if item not found and not adding
    });
  }, []);

  // Calculate upgrade chance when upgrade slots change
  useEffect(() => {
    const mainWeapon = upgradeWeaponSlots[0];
    const sacrificialWeapon = upgradeWeaponSlots[1];
    const reinforcementStones = upgradeMaterialSlots.filter(slot => slot && slot.name === 'Đá Cường Hoá');

    if (mainWeapon && sacrificialWeapon && mainWeapon.name === sacrificialWeapon.name) {
      const stoneCount = reinforcementStones.length;
      let chance = 0;
      if (stoneCount === 1) chance = 30;
      else if (stoneCount === 2) chance = 50;
      else if (stoneCount === 3) chance = 70;
      
      setUpgradeChance(chance);
    } else {
      setUpgradeChance(0);
    }
  }, [upgradeWeaponSlots, upgradeMaterialSlots]);

  // Detect crafting recipe - now a standalone function
  const detectCraftRecipe = useCallback((currentShardSlot, currentMaterialSlots) => {
    const currentCraftMaterials = currentMaterialSlots.filter(Boolean);
    
    const currentMaterialMap = currentCraftMaterials.reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {});

    let foundRecipe = null;
    let recipesToSearch = [];

    // Prioritize shard-based recipes if a shard is present
    if (currentShardSlot && currentShardSlot.type === 'shard') {
      recipesToSearch = CRAFTING_RECIPES_DEFINITION.filter(r => r.type === 'shard_based' && r.shardRequired.name === currentShardSlot.name);
    } else {
      recipesToSearch = CRAFTING_RECIPES_DEFINITION.filter(r => r.type === 'material_based');
    }

    const rankOrderMap = { 'S': 5, 'A': 4, 'B': 3, 'D': 2, 'E': 1 };
    recipesToSearch.sort((a, b) => rankOrderMap[b.rank] - rankOrderMap[a.rank]);

    for (const recipe of recipesToSearch) {
      let matches = true;

      // Check shard requirement if it's a shard-based recipe
      if (recipe.type === 'shard_based') {
        if (!currentShardSlot || currentShardSlot.name !== recipe.shardRequired.name || currentShardSlot.quantity < recipe.shardRequired.quantity) {
          matches = false;
        }
      } else { // For material_based recipes, ensure no shard is present
        if (currentShardSlot) { // A material-based recipe cannot match if a shard is present
          matches = false;
        }
      }
      
      if (!matches) continue; // If shard requirement not met, skip this recipe

      // Check material requirements
      let totalRequiredQuantity = 0;
      let totalProvidedQuantityInSlots = 0; // Sum of quantities of materials in slots that are required for this recipe

      // Calculate total required quantity from the recipe
      for (const requiredMaterial of recipe.materialsRequired) {
        totalRequiredQuantity += requiredMaterial.quantity;
      }

      // Check if all required materials for this recipe are present in the slots with sufficient quantity
      for (const requiredMaterial of recipe.materialsRequired) {
        if (!currentMaterialMap[requiredMaterial.name] || currentMaterialMap[requiredMaterial.name] < requiredMaterial.quantity) {
          matches = false;
          break;
        }
        totalProvidedQuantityInSlots += currentMaterialMap[requiredMaterial.name];
      }

      if (!matches) continue; // If material requirements not met, skip

      // Check if there are no extra materials in the slots that are not part of this specific recipe
      for (const materialName in currentMaterialMap) {
        const isRequired = recipe.materialsRequired.some(m => m.name === materialName);
        if (!isRequired) {
          matches = false;
          break;
        }
      }

      // Ensure that the total quantity of provided materials in the craft slots exactly matches the total required quantity for this recipe
      if (matches && totalProvidedQuantityInSlots === totalRequiredQuantity) {
          foundRecipe = recipe;
          break; // Found the highest rank and exact match
      }
    }
    return foundRecipe;
  }, []);

  // New auto-fill function
  const autoFillCraftSlots = useCallback((currentShard, currentMaterials, currentInventory) => {
    let tempCraftMaterials = [...currentMaterials];
    let tempInventory = [...currentInventory]; // Work with copies

    const detected = detectCraftRecipe(currentShard, tempCraftMaterials); // Detect based on current (potentially incomplete) state

    if (!detected) return { newCraftMaterials: currentMaterials, newInventory: currentInventory, changesMade: false };

    const materialsInCurrentSlotsMap = tempCraftMaterials.filter(Boolean).reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {});

    let changesMade = false;

    for (const requiredMat of detected.materialsRequired) {
      const currentQuantityInSlot = materialsInCurrentSlotsMap[requiredMat.name] || 0;
      const missingQuantity = requiredMat.quantity - currentQuantityInSlot;

      if (missingQuantity > 0) {
        const itemInInventoryIndex = tempInventory.findIndex(invItem =>
          invItem.name === requiredMat.name && invItem.type === 'material'
        );

        if (itemInInventoryIndex !== -1) {
          const itemInInventory = { ...tempInventory[itemInInventoryIndex] };
          const amountToPull = Math.min(missingQuantity, itemInInventory.quantity);

          // Update working inventory
          itemInInventory.quantity -= amountToPull;
          if (itemInInventory.quantity <= 0) {
            tempInventory.splice(itemInInventoryIndex, 1);
          } else {
            tempInventory[itemInInventoryIndex] = itemInInventory;
          }
          tempInventory.sort((a, b) => a.name.localeCompare(b.name));


          // Update craftMaterialSlots (temp copy)
          const existingSlotIndex = tempCraftMaterials.findIndex(slot => slot && slot.name === requiredMat.name);
          if (existingSlotIndex !== -1) {
            tempCraftMaterials[existingSlotIndex] = {
              ...tempCraftMaterials[existingSlotIndex],
              quantity: (tempCraftMaterials[existingSlotIndex].quantity || 0) + amountToPull
            };
          } else {
            const emptySlotIndex = tempCraftMaterials.findIndex(slot => slot === null);
            if (emptySlotIndex !== -1) {
              tempCraftMaterials[emptySlotIndex] = { ...itemInInventory, quantity: amountToPull, id: `${itemInInventory.name}_${Date.now()}_Auto` };
            }
          }
          changesMade = true;
        }
      }
    }
    return { newCraftMaterials: tempCraftMaterials, newInventory: tempInventory, changesMade };
  }, [detectCraftRecipe, isProcessing]);


  // Effect to re-detect recipe whenever craft slots or shard changes
  useEffect(() => {
    const currentRecipe = detectCraftRecipe(craftShardSlot, craftMaterialSlots);
    setDetectedCraftRecipe(currentRecipe);
  }, [craftShardSlot, craftMaterialSlots, detectCraftRecipe]);


  const showAlert = (message, type = 'info') => {
    setAlert({ isVisible: true, message, type });
  };

  const hideAlert = () => {
    setAlert({ isVisible: false, message: '', type: 'info' });
  };

  // Handles clicking an item in the inventory to place it into slots
  const handleItemClick = (itemToMove) => {
    if (isProcessing) return; // Prevent interaction during processing

    if (activeTab === 'upgrade') {
      if (itemToMove.type === 'weapon') {
        if (upgradeWeaponSlots[0] === null) {
          setUpgradeWeaponSlots([itemToMove, upgradeWeaponSlots[1]]);
          updateInventory(itemToMove, -1); // Consume 1 quantity
        } else if (upgradeWeaponSlots[1] === null && upgradeWeaponSlots[0].name === itemToMove.name) {
          setUpgradeWeaponSlots([upgradeWeaponSlots[0], itemToMove]);
          updateInventory(itemToMove, -1); // Consume 1 quantity
        } else {
          showAlert('Chỉ có thể đặt 2 trang bị giống nhau vào các ô này!', 'warning');
        }
      } else if (itemToMove.type === 'material' && itemToMove.name === 'Đá Cường Hoá') {
        const emptySlotIndex = upgradeMaterialSlots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
          const newMaterialSlots = [...upgradeMaterialSlots];
          newMaterialSlots[emptySlotIndex] = { ...itemToMove, quantity: 1 }; // Place a copy of the item with quantity 1
          setUpgradeMaterialSlots(newMaterialSlots);
          updateInventory(itemToMove, -1); // Consume 1 quantity from the original stack
        } else {
          showAlert('Không còn ô nguyên liệu trống! Tối đa 3 Đá Cường Hoá.', 'warning');
        }
      } else {
        showAlert('Loại vật phẩm này không thể đặt vào lò nâng cấp.', 'warning');
      }
    } else if (activeTab === 'craft') {
      // Logic for placing items into universal crafting slots (entire stack)
      if (itemToMove.type === 'weapon') {
        showAlert('Không thể đặt vũ khí vào các ô rèn vật phẩm. Vui lòng sử dụng vật liệu hoặc mảnh.', 'warning');
        return;
      }

      let newCraftShard = craftShardSlot;
      let newCraftMaterials = [...craftMaterialSlots];
      
      let itemPlaced = false;

      if (itemToMove.type === 'shard') {
        if (newCraftShard === null) {
          newCraftShard = { ...itemToMove }; // Place the entire shard stack
          updateInventory(itemToMove, -itemToMove.quantity); // Remove entire stack from inventory
          itemPlaced = true;
        } else if (newCraftShard.name === itemToMove.name) {
            showAlert('Mảnh trang bị này đã có trong lò rèn. Vui lòng lấy ra trước nếu muốn thay đổi.', 'warning');
            return;
        }
        else {
          showAlert('Chỉ có thể đặt một loại mảnh trang bị vào ô này!', 'warning');
          return;
        }
      } else if (itemToMove.type === 'material') {
        const existingSlotIndex = newCraftMaterials.findIndex(slot => slot && slot.name === itemToMove.name);

        if (existingSlotIndex !== -1) {
          showAlert('Vật phẩm này đã có trong lò rèn. Vui lòng lấy ra trước nếu muốn thay đổi.', 'warning');
          return;
        } else {
          const emptySlotIndex = newCraftMaterials.findIndex(slot => slot === null);
          if (emptySlotIndex !== -1) {
            newCraftMaterials[emptySlotIndex] = { ...itemToMove }; // Place the entire item (with its current quantity)
            updateInventory(itemToMove, -itemToMove.quantity); // Remove entire stack from inventory
            itemPlaced = true;
          } else {
            showAlert('Không còn ô nguyên liệu trống trong lò rèn!', 'warning');
            return;
          }
        }
      } else {
        showAlert('Loại vật phẩm này không thể đặt vào lò. Hãy chắc chắn bạn đang ở tab đúng.', 'warning');
        return;
      }

      // Update states after the initial placement.
      setCraftShardSlot(newCraftShard);
      setCraftMaterialSlots(newCraftMaterials);

      // Immediately attempt to auto-fill
      // We pass the *current state values* that were just updated (newCraftShard, newCraftMaterials, inventory)
      // because autoFillCraftSlots needs the most up-to-date values to make decisions.
      // The `inventory` state will be updated by `updateInventory` and will reflect in the next render.
      const { newCraftMaterials: autoFilledMaterials, newInventory: updatedInventoryAfterAutoFill, changesMade: autoFillChangesMade } = autoFillCraftSlots(
        newCraftShard, newCraftMaterials, inventory
      );
      
      // Only update states if auto-fill actually made changes
      if (autoFillChangesMade) {
        setCraftMaterialSlots(autoFilledMaterials);
        setInventory(updatedInventoryAfterAutoFill);
      }
    }
  };

  // Handles clicking an item in upgrade weapon slot to return to inventory
  const handleUpgradeWeaponSlotClick = (slotIndex) => {
    if (isProcessing) return;
    const itemInSlot = upgradeWeaponSlots[slotIndex];
    if (itemInSlot) {
      updateInventory(itemInSlot, 1); // Return item to inventory
      const newWeaponSlots = [...upgradeWeaponSlots];
      newWeaponSlots[slotIndex] = null;
      setUpgradeWeaponSlots(newWeaponSlots);
    }
  };

  // Handles clicking an item in upgrade material slot to return to inventory
  const handleUpgradeMaterialSlotClick = (slotIndex) => {
    if (isProcessing) return;
    const itemInSlot = upgradeMaterialSlots[slotIndex];
    if (itemInSlot) {
      updateInventory(itemInSlot, 1); // Return item to inventory
      const newMaterialSlots = [...upgradeMaterialSlots];
      newMaterialSlots[slotIndex] = null;
      setUpgradeMaterialSlots(newMaterialSlots);
    }
  };

  // Handles clicking an item in craft shard slot to return to inventory (entire stack)
  const handleCraftShardSlotClick = () => {
    if (isProcessing) return;
    if (craftShardSlot) {
      updateInventory(craftShardSlot, craftShardSlot.quantity); // Return entire stack to inventory
      setCraftShardSlot(null);
    }
  };

  // Handles clicking an item in craft material slot to return to inventory (entire stack)
  const handleCraftMaterialSlotClick = (clickedItem, slotIndex) => {
    if (isProcessing) return;
    if (clickedItem) {
      const newCraftSlots = [...craftMaterialSlots];
      updateInventory(clickedItem, clickedItem.quantity); // Return entire stack to inventory
      newCraftSlots[slotIndex] = null;
      setCraftMaterialSlots(newCraftSlots);
    }
  };

  // Handle upgrade process
  const handleUpgrade = async () => {
    const mainWeapon = upgradeWeaponSlots[0];
    const sacrificialWeapon = upgradeWeaponSlots[1];
    const reinforcementStones = upgradeMaterialSlots.filter(slot => slot && slot.name === 'Đá Cường Hoá');
    const stoneCount = reinforcementStones.length;

    if (!mainWeapon || !sacrificialWeapon || mainWeapon.name !== sacrificialWeapon.name) {
      showAlert('Cần 2 trang bị giống nhau để nâng cấp!', 'error');
      return;
    }
    if (stoneCount === 0 || stoneCount > 3) {
      showAlert('Cần 1 đến 3 Đá Cường Hoá để nâng cấp!', 'error');
      return;
    }

    setIsProcessing(true); // Start animation

    await new Promise(resolve => setTimeout(resolve, 2000));

    let success = false;
    const randomChance = Math.random() * 100;

    if (stoneCount === 1 && randomChance <= 30) success = true;
    else if (stoneCount === 2 && randomChance <= 50) success = true;
    else if (stoneCount === 3 && randomChance <= 70) success = true;

    // Clear all used items from slots (they were consumed from inventory upon placement)
    setUpgradeWeaponSlots([null, null]);
    setUpgradeMaterialSlots([null, null, null]);

    if (success) {
      const newLevel = (mainWeapon.level || 0) + 1;
      const newRarity = getNextRarity(mainWeapon.rarity);
      const upgradedItem = {
        ...mainWeapon,
        id: `${mainWeapon.name}_L${newLevel}_${Date.now()}`, // New unique ID with level
        level: newLevel,
        rarity: newRarity,
        quantity: 1, // Upgraded item is always quantity 1
      };
      updateInventory(upgradedItem, 1); // Add the upgraded item to inventory
      showAlert(`Nâng cấp thành công! Bạn đã tạo ra ${upgradedItem.name} +${upgradedItem.level}!`, 'success');
    } else {
      // Items are lost on failure (they were consumed from inventory upon placement)
      showAlert('Nâng cấp thất bại! Trang bị và nguyên liệu đã bị mất.', 'error');
    }

    setIsProcessing(false); // End animation
  };

  // Handle universal crafting process
  const handleCraft = async () => {
    if (!detectedCraftRecipe) {
      showAlert('Không có công thức rèn được nhận diện hoặc không đủ nguyên liệu!', 'error');
      return;
    }

    // Verify quantities in slots match recipe requirements
    const currentMaterialMapInSlots = craftMaterialSlots.filter(Boolean).reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {});
    const currentShardInSlot = craftShardSlot;

    // Check shard requirement if applicable
    if (detectedCraftRecipe.type === 'shard_based') {
      if (!currentShardInSlot || currentShardInSlot.name !== detectedCraftRecipe.shardRequired.name || currentShardInSlot.quantity < detectedCraftRecipe.shardRequired.quantity) {
        showAlert(`Không đủ ${detectedCraftRecipe.shardRequired.name}! Cần ${detectedCraftRecipe.shardRequired.quantity}.`, 'error');
        return;
      }
    }

    // Check material requirements
    for (const requiredMaterial of detectedCraftRecipe.materialsRequired) {
      if (!currentMaterialMapInSlots[requiredMaterial.name] || currentMaterialMapInSlots[requiredMaterial.name] < requiredMaterial.quantity) {
        showAlert(`Không đủ nguyên liệu ${requiredMaterial.name}! Cần ${requiredMaterial.quantity}.`, 'error');
        return;
      }
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Consume shard if applicable
    if (detectedCraftRecipe.type === 'shard_based' && currentShardInSlot) {
      currentShardInSlot.quantity -= detectedCraftRecipe.shardRequired.quantity;
      if (currentShardInSlot.quantity <= 0) {
        setCraftShardSlot(null);
      } else {
        setCraftShardSlot({ ...currentShardInSlot }); // Update quantity in slot
      }
    }

    // Consume materials from craft slots based on detected recipe
    const materialsToConsume = detectedCraftRecipe.materialsRequired;
    const newCraftMaterialSlots = [...craftMaterialSlots];

    materialsToConsume.forEach(requiredMaterial => {
      const slotIndex = newCraftMaterialSlots.findIndex(slot => slot && slot.name === requiredMaterial.name);
      if (slotIndex !== -1) {
        newCraftMaterialSlots[slotIndex].quantity -= requiredMaterial.quantity;
        // If quantity drops to 0, remove the item from the slot
        if (newCraftMaterialSlots[slotIndex].quantity <= 0) {
          newCraftMaterialSlots[slotIndex] = null;
        }
      }
    });
    setCraftMaterialSlots(newCraftMaterialSlots); // Update slots after consumption

    // Randomly select a weapon from the output pool
    const randomItem = detectedCraftRecipe.outputPool[Math.floor(Math.random() * detectedCraftRecipe.outputPool.length)];
    const newItem = { ...randomItem, id: `${randomItem.name}_${Date.now()}_Crafted`, quantity: 1 };

    updateInventory(newItem, 1); // Add new item to inventory
    showAlert(`Rèn thành công! Bạn đã tạo ra ${newItem.name}!`, 'success');

    setIsProcessing(false);
  };

  // Clear all slots based on active tab
  const handleClearSlots = () => {
    if (isProcessing) return;

    if (activeTab === 'upgrade') {
      handleClearUpgradeSlots();
    } else if (activeTab === 'craft') {
      handleClearCraftSlots();
    }
  };

  // Clear all upgrade slots
  const handleClearUpgradeSlots = useCallback(() => {
    upgradeWeaponSlots.forEach(item => {
      if (item) updateInventory(item, 1);
    });
    setUpgradeWeaponSlots([null, null]);

    upgradeMaterialSlots.forEach(item => {
      if (item) updateInventory(item, 1);
    });
    setUpgradeMaterialSlots([null, null, null]);
  }, [upgradeWeaponSlots, upgradeMaterialSlots, updateInventory]);

  // Clear all craft slots
  const handleClearCraftSlots = useCallback(() => {
    if (craftShardSlot) {
      updateInventory(craftShardSlot, craftShardSlot.quantity);
      setCraftShardSlot(null);
    }
    craftMaterialSlots.forEach(item => {
      if (item) updateInventory(item, item.quantity); // Return full stack to inventory
    });
    setCraftMaterialSlots([null, null, null, null]);
    setDetectedCraftRecipe(null); // Clear detected recipe
  }, [craftShardSlot, craftMaterialSlots, updateInventory]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
              activeTab === 'upgrade'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => {
              setActiveTab('upgrade');
              handleClearCraftSlots(); // Clear craft slots when switching to upgrade
            }}
          >
            🔥 Nâng Cấp
          </button>
          <button
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
              activeTab === 'craft'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => {
              setActiveTab('craft');
              handleClearUpgradeSlots(); // Clear upgrade slots when switching to craft
            }}
          >
            ✨ Rèn Vật Phẩm
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Processing Area (Conditional Rendering based on activeTab) */}
          {activeTab === 'upgrade' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-yellow-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                  <span>✨</span> Lò Nâng Cấp Huyền Thoại
                </h2>
                <button
                  onClick={handleClearSlots}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                  disabled={isProcessing || (upgradeWeaponSlots.every(slot => slot === null) && upgradeMaterialSlots.every(slot => slot === null))}
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Weapon Slots for Upgrade */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                  <span>⚔️</span> Trang bị để nâng cấp (Cần 2 trang bị giống nhau)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <ForgingSlot
                    item={upgradeWeaponSlots[0]}
                    slotType="weapon"
                    slotIndex={0}
                    onClick={() => handleUpgradeWeaponSlotClick(0)}
                    isEmpty={upgradeWeaponSlots[0] === null}
                    labelOverride="Vật phẩm chính"
                  />
                  <ForgingSlot
                    item={upgradeWeaponSlots[1]}
                    slotType="weapon"
                    slotIndex={1}
                    onClick={() => handleUpgradeWeaponSlotClick(1)}
                    isEmpty={upgradeWeaponSlots[1] === null}
                    labelOverride="Vật phẩm hy sinh"
                  />
                </div>
              </div>

              {/* Material Slots for Reinforcement Stones */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                  <span>💎</span> Đá Cường Hoá (Tối đa 3 viên)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {upgradeMaterialSlots.map((slot, index) => (
                    <ForgingSlot
                      key={`material-${index}`}
                      item={slot}
                      slotType="material"
                      slotIndex={index}
                      onClick={() => handleUpgradeMaterialSlotClick(index)}
                      isEmpty={slot === null}
                      labelOverride="Đá Cường Hoá"
                    />
                  ))}
                </div>
              </div>

              {/* Upgrade Chance Preview */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl border border-blue-500/50 shadow-lg text-center">
                  <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center justify-center gap-2">
                      <span>📈</span> Tỷ lệ thành công
                  </h3>
                  <p className="text-4xl font-extrabold text-yellow-400">
                      {upgradeChance}%
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                      {upgradeChance === 0
                      ? 'Hãy đặt 2 trang bị giống nhau và Đá Cường Hoá để xem tỷ lệ.'
                      : 'Chúc may mắn!'}
                  </p>
              </div>

              <button
                className={`w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 transform ${
                  upgradeChance > 0
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 hover:scale-105 shadow-purple-500/25'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                onClick={handleUpgrade}
                disabled={upgradeChance === 0 || isProcessing}
              >
                {upgradeChance > 0 ? `🚀 Nâng cấp ${upgradeChance}%` : '⚠️ Cần đủ vật phẩm để nâng cấp'}
              </button>
            </div>
          )}

          {activeTab === 'craft' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-300 flex items-center gap-2">
                  <span>✨</span> Lò Rèn Vật Phẩm
                </h2>
                <button
                  onClick={handleClearSlots}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                  disabled={isProcessing || (craftShardSlot === null && craftMaterialSlots.every(slot => slot === null))}
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Shard Slot */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                  <span>🧩</span> Mảnh Trang Bị (Chỉ 1 loại mảnh)
                </h3>
                <ForgingSlot
                  item={craftShardSlot}
                  slotType="shard"
                  slotIndex={0}
                  onClick={handleCraftShardSlotClick}
                  isEmpty={craftShardSlot === null}
                  labelOverride="Đặt mảnh trang bị vào đây"
                  showQuantity={true}
                />
              </div>

              {/* Universal Crafting Material Slots */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span>📥</span> Ô Nguyên Liệu Rèn
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {craftMaterialSlots.map((slot, index) => {
                    let requiredQuantity = 0;
                    if (detectedCraftRecipe) {
                        const reqMat = detectedCraftRecipe.materialsRequired.find(m => m.name === slot?.name);
                        if (reqMat) {
                            requiredQuantity = reqMat.quantity;
                        }
                    }
                    return (
                      <ForgingSlot
                        key={`craft-material-${index}`}
                        item={slot}
                        slotType="material"
                        slotIndex={index}
                        onClick={() => handleCraftMaterialSlotClick(slot, index)}
                        isEmpty={slot === null}
                        labelOverride="Đặt nguyên liệu vào đây"
                        showQuantity={true}
                        requiredForRecipe={requiredQuantity} // Pass the required quantity
                      />
                    );
                  })}
                </div>
              </div>

              {/* Detected Crafting Recipe Info */}
              {detectedCraftRecipe && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-teal-900/40 rounded-xl border border-blue-500/50 shadow-lg">
                  <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <span>💡</span> Công thức được nhận diện: <span className="text-yellow-300">{detectedCraftRecipe.rank}-Rank</span>
                  </h3>
                  <div className="text-sm text-gray-300 mb-2">
                    {detectedCraftRecipe.type === 'shard_based' && (
                      <p className="mb-1">Cần mảnh: <span className="font-bold">{detectedCraftRecipe.shardRequired.name}</span></p>
                    )}
                    Yêu cầu nguyên liệu:
                    <ul className="list-disc list-inside ml-2">
                      {detectedCraftRecipe.materialsRequired.map((mat, idx) => (
                        <li key={idx} className="text-gray-200">
                          {mat.name}: {mat.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    Kết quả: <span className="font-bold text-green-300">1 {detectedCraftRecipe.rank}-rank ngẫu nhiên</span>
                  </div>
                  <ul className="text-xs text-gray-400 list-disc list-inside mt-2">
                    Vật phẩm có thể nhận:
                    {detectedCraftRecipe.outputPool.map((item, index) => (
                      <li key={index}>{item.icon} {item.name} ({item.rarity})</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-300 mt-3">{detectedCraftRecipe.description}</p>
                </div>
              )}

              <button
                className={`w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 transform ${
                  detectedCraftRecipe && !isProcessing && canCraft(detectedCraftRecipe, craftShardSlot, craftMaterialSlots) // Check if actually craftable
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-400 hover:to-teal-400 hover:scale-105 shadow-green-500/25'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                onClick={handleCraft}
                disabled={isProcessing || !detectedCraftRecipe || !canCraft(detectedCraftRecipe, craftShardSlot, craftMaterialSlots)}
              >
                {detectedCraftRecipe && canCraft(detectedCraftRecipe, craftShardSlot, craftMaterialSlots) ? `✨ Rèn Vật phẩm ${detectedCraftRecipe.rank}-rank` : '⚠️ Đặt nguyên liệu để nhận diện công thức'}
              </button>
            </div>
          )}

          {/* Inventory Area */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
            <h2 className="text-2xl font-bold mb-6 text-blue-300 flex items-center gap-2">
              <span>🎒</span> Túi Đồ ({inventory.reduce((acc, item) => acc + item.quantity, 0)} vật phẩm)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {inventory.length > 0 ? (
                inventory.map(item => (
                  <div
                    key={item.id} // Use unique ID for key
                    className={`
                      relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                      shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl
                      ${item.type === 'weapon'
                        ? 'bg-gradient-to-br from-red-800/40 to-red-900/40 border border-red-500/40 hover:border-red-400'
                        : item.type === 'material'
                            ? 'bg-gradient-to-br from-green-800/40 to-green-900/40 border border-green-500/40 hover:border-green-400'
                            : 'bg-gradient-to-br from-purple-800/40 to-purple-900/40 border border-purple-500/40 hover:border-purple-400' // Shard style
                      }
                      ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} {/* Dim during processing */}
                    `}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <span className="text-sm font-medium text-gray-100 text-center leading-tight">
                        {item.name} {item.level > 0 ? `+${item.level}` : ''}
                    </span>
                    {item.quantity > 0 && ( // Display quantity if > 0
                      <span className="absolute top-0 right-0 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-bl-lg rounded-tr-lg">
                        x{item.quantity}
                      </span>
                    )}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
                      item.type === 'weapon' ? 'bg-red-600 text-red-100' :
                      item.type === 'material' ? 'bg-green-600 text-green-100' :
                      'bg-purple-600 text-purple-100' // Shard type label
                    }`}>
                      {item.type === 'weapon' ? 'VK' : item.type === 'material' ? 'NL' : 'Mảnh'}
                    </span>
                    <div className={`absolute bottom-1 left-1 w-3 h-3 rounded-full border-2 border-white ${
                      item.rarity === 'legendary' ? 'bg-yellow-400' :
                      item.rarity === 'epic' ? 'bg-purple-400' :
                      item.rarity === 'rare' ? 'bg-blue-400' :
                      item.rarity === 'uncommon' ? 'bg-green-400' :
                      'bg-gray-400'
                    }`} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 italic py-8">
                  <div className="text-6xl mb-4">📦</div>
                  <p>Túi đồ trống rỗng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Components */}
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
      `}</style>
    </div>
  );
};

export default App;
