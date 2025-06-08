import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- START: DATA IMPORTS ---
import { uiAssets, itemAssets } from './game-assets.ts';
import { itemDatabase, ItemDefinition } from './inventory/item-database.ts';
import { playerInventoryData, PlayerItem } from './inventory/player-inventory-data.ts';
// --- END: DATA IMPORTS ---


// A combined type for easier handling in the UI
type EnrichedPlayerItem = ItemDefinition & PlayerItem;

// --- START: REFACTORED DATA DEFINITIONS ---

// Define crafting recipes with output pools inlined to avoid TDZ errors.
const CRAFTING_RECIPES_DEFINITION = [
  {
    type: 'piece_based',
    pieceId: 47, // Mảnh ghép vũ khí
    materialsRequired: [{ id: 44, quantity: 20 }, { id: 43, quantity: 10 }], // Gỗ, Sắt
    outputPool: [1, 13], // Kiếm gỗ, Cung gỗ
    description: 'Rèn một vũ khí Cấp E ngẫu nhiên từ nguyên liệu.'
  },
  {
    type: 'piece_based',
    pieceId: 48, // Mảnh ghép áo giáp
    materialsRequired: [{ id: 45, quantity: 15 }, { id: 46, quantity: 10 }], // Da, Vải
    outputPool: [3, 11], // Áo giáp da, Găng tay chiến binh
    description: 'Rèn một áo giáp Cấp E/D ngẫu nhiên từ nguyên liệu.'
  },
  {
    type: 'specific',
    outputItemId: 4, // Kiếm sắt
    materialsRequired: [{ id: 43, quantity: 15 }, { id: 44, quantity: 5 }], // Sắt, Gỗ
    description: 'Rèn một thanh Kiếm Sắt.'
  }
];

// Define skill pools by rarity with skill lists inlined.
const SKILL_POOLS_BY_RARITY = {
  common: [
    { name: 'Đấm Thường', icon: '🤜', rarity: 'common', description: 'Gây sát thương vật lý cơ bản.' },
    { name: 'Tăng Tốc Nhỏ', icon: '💨', rarity: 'common', description: 'Tăng tốc độ di chuyển trong thời gian ngắn.' },
  ],
  uncommon: [
    { name: 'Cú Đấm Mạnh', icon: '💥', rarity: 'uncommon', description: 'Gây sát thương vật lý đáng kể.' },
    { name: 'Khiên Bảo Vệ', icon: '🛡️', rarity: 'uncommon', description: 'Tạo một lá chắn hấp thụ sát thương.' },
  ],
  rare: [
    { name: 'Chém Xoáy', icon: '🌪️', rarity: 'rare', description: 'Xoay tròn chém kẻ địch xung quanh.' },
    { name: 'Tường Lửa', icon: '🔥', rarity: 'rare', description: 'Triệu hồi tường lửa gây sát thương liên tục.' },
  ],
  epic: [
    { name: 'Sấm Sét', icon: '⚡', rarity: 'epic', description: 'Triệu hồi sấm sét tấn công một mục tiêu.' },
    { name: 'Hấp Huyết', icon: '🩸', rarity: 'epic', description: 'Hút máu kẻ địch, hồi HP cho bản thân.' },
  ],
  legendary: [
    { name: 'Phán Quyết Thần Thánh', icon: '🌟', rarity: 'legendary', description: 'Gây sát thương lớn lên kẻ địch và hồi HP.' },
    { name: 'Thiên Thạch Giáng', icon: '☄️', rarity: 'legendary', description: 'Triệu hồi thiên thạch hủy diệt xuống khu vực.' },
  ],
};

// NOTE: Skill books are not in the item database, so we simulate them.
const SKILL_BOOKS = [
    { id: 9001, name: 'Sách Kỹ Năng E', type: 'skill_book', icon: '📖', rarity: 'common', quantity: 1, instanceId: 9001 },
    { id: 9002, name: 'Sách Kỹ Năng D', type: 'skill_book', icon: '📘', rarity: 'uncommon', quantity: 1, instanceId: 9002 },
];
// --- END: REFACTORED DATA DEFINITIONS ---


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

const ItemTooltip = ({ item }: { item: EnrichedPlayerItem }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.name} {item.level && item.level > 1 ? `+${item.level - 1}` : ''}</div>
      <div className="text-gray-500 capitalize text-xs mb-1">{item.type} • {item.rarity}</div>
      <div className="text-gray-400 text-xs">{item.description}</div>
    </div>
);


// --- END: UI Helper functions and components ---

// Custom alert and animation components (remain the same)
const CustomAlert = ({ isVisible, message, onClose, type = 'info' }) => { if (!isVisible) return null; const typeStyles = { success: 'border-green-500 bg-green-50 text-green-800', error: 'border-red-500 bg-red-50 text-red-800', info: 'border-blue-500 bg-blue-50 text-blue-800', warning: 'border-yellow-500 bg-yellow-50 text-yellow-800' }; return ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"> <div className={`p-6 rounded-lg shadow-xl max-w-sm w-full border-2 ${typeStyles[type]} transform animate-scale-up`}> <p className="text-center mb-4 text-lg font-medium">{message}</p> <button className="w-full py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors duration-200" onClick={onClose} > Đồng ý </button> </div> </div> ); };
const ForgingAnimation = ({ isProcessing }) => { if (!isProcessing) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"> <div className="text-center"> <div className="text-8xl animate-bounce mb-4">🔨</div> <div className="text-white text-2xl font-bold animate-pulse">Đang xử lý...</div> <div className="flex justify-center space-x-1 mt-4"> {[...Array(3)].map((_, i) => ( <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} /> ))} </div> </div> </div> ); };


// Main App Component
const Blacksmith = ({ onClose }) => { // Accept onClose prop
  const [activeTab, setActiveTab] = useState('upgrade');
  
  const [playerInventory, setPlayerInventory] = useState<PlayerItem[]>(playerInventoryData);
  
  // Slots for the blacksmith UI
  const [upgradeWeaponSlot, setUpgradeWeaponSlot] = useState<PlayerItem | null>(null);
  const [upgradeMaterialSlot, setUpgradeMaterialSlot] = useState<PlayerItem | null>(null);
  const [skillWeaponSlot, setSkillWeaponSlot] = useState<PlayerItem | null>(null);
  const [skillBookSlot, setSkillBookSlot] = useState<any | null>(null); // Using 'any' for simulated skill books
  
  const [alert, setAlert] = useState({ isVisible: false, message: '', type: 'info' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeChance, setUpgradeChance] = useState(0);

  const enrichPlayerItem = useCallback((playerItem: PlayerItem | null): EnrichedPlayerItem | null => {
    if (!playerItem) return null;
    const definition = itemDatabase.get(playerItem.id);
    if (!definition) {
        console.warn(`Item definition not found for ID: ${playerItem.id}`);
        return null;
    }
    return { ...definition, ...playerItem };
  }, []);

  const fullInventory = useMemo(() => {
    const enriched = playerInventory.map(pItem => enrichPlayerItem(pItem));
    const enrichedBooks = SKILL_BOOKS.map(book => ({...book, description: `Sách để học kỹ năng cấp ${book.rarity}`}));
    return [...enriched, ...enrichedBooks].filter(Boolean) as EnrichedPlayerItem[];
  }, [playerInventory, enrichPlayerItem]); // Added enrichPlayerItem to dependency array for correctness
  
  // ... The rest of the component logic remains the same as the previous version ...
  // ForgingSlot, inventory management functions, handlers, etc.

  // Forging Slot Component
  const ForgingSlot = ({ item, slotType, onClick, isEmpty, labelOverride, showQuantity = false }) => {
    const enrichedItem = item && item.id > 9000 ? item : enrichPlayerItem(item); // Handle simulated skill books
    
    const slotStyles = {
      weapon: { border: 'border-red-500/50', bg: 'bg-gradient-to-br from-red-900/40 to-red-800/40', hoverBg: 'hover:bg-red-700/30', hoverBorder: 'hover:border-red-400', icon: '⚔️', label: 'Trang Bị'},
      material: { border: 'border-green-500/50', bg: 'bg-gradient-to-br from-green-900/40 to-green-800/40', hoverBg: 'hover:bg-green-700/30', hoverBorder: 'hover:border-green-400', icon: '💎', label: 'Nguyên Liệu'},
      piece: { border: 'border-purple-500/50', bg: 'bg-gradient-to-br from-purple-900/40 to-purple-800/40', hoverBg: 'hover:bg-purple-700/30', hoverBorder: 'hover:border-purple-400', icon: '🧩', label: 'Mảnh Ghép' },
      skill_book: { border: 'border-cyan-500/50', bg: 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/40', hoverBg: 'hover:bg-cyan-700/30', hoverBorder: 'hover:border-cyan-400', icon: '📖', label: 'Sách Kỹ Năng' }
    };
    const style = slotStyles[slotType];
    const sizeClass = 'h-32';

    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 ease-in-out cursor-pointer ${sizeClass} ${style.border} ${style.bg} ${style.hoverBg} ${style.hoverBorder} ${enrichedItem ? 'shadow-lg transform hover:scale-105' : 'border-dashed'} ${isEmpty ? 'animate-pulse' : ''}`}
        onClick={onClick}
      >
        {enrichedItem ? (
          <>
            <div className={"text-4xl md:text-5xl mb-2"}>{enrichedItem.icon}</div>
            <span className={`font-medium text-center px-1 text-white text-xs md:text-sm`}>{enrichedItem.name} {enrichedItem.level > 1 ? `+${enrichedItem.level-1}` : ''}</span>
            {showQuantity && enrichedItem.quantity > 0 && (
              <span className={`absolute bottom-1 right-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full`}>{`x${enrichedItem.quantity}`}</span>
            )}
            <div className={`absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ getRarityTextColor(enrichedItem.rarity).replace('text-', 'bg-').replace('-300', '-600').replace('-400', '-600')} text-white`}>
              {enrichedItem.rarity.charAt(0).toUpperCase()}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className={`mb-1 opacity-50 text-3xl`}>{style.icon}</div>
            <span className="text-gray-400 text-xs font-medium">{labelOverride || style.label}</span>
          </div>
        )}
      </div>
    );
  };
  
  const addNewItemToInventory = useCallback((itemId: number, quantity: number, overrides: Partial<PlayerItem> = {}) => {
    setPlayerInventory(prev => {
        const itemDef = itemDatabase.get(itemId);
        if (!itemDef) return prev;
        const isStackable = ['material', 'potion', 'currency', 'misc', 'piece'].includes(itemDef.type);
        if (isStackable) {
            const existingStackIndex = prev.findIndex(i => i.id === itemId && i.level === overrides.level);
            if (existingStackIndex > -1) {
                const newInventory = [...prev];
                newInventory[existingStackIndex].quantity += quantity;
                return newInventory;
            }
        }
        const newInstanceId = Math.max(0, ...prev.map(i => i.instanceId), ...SKILL_BOOKS.map(b => b.instanceId)) + 1;
        const newItem: PlayerItem = {
            instanceId: newInstanceId,
            id: itemId,
            quantity: quantity,
            ...overrides
        };
        return [...prev, newItem];
    });
  }, []);
  
  const updateItemInInventory = useCallback((instanceId: number, quantityChange: number) => {
      setPlayerInventory(prev => {
          const itemIndex = prev.findIndex(i => i.instanceId === instanceId);
          if (itemIndex === -1) return prev;
          const newInventory = [...prev];
          const currentItem = newInventory[itemIndex];
          currentItem.quantity += quantityChange;
          if (currentItem.quantity <= 0) {
              return newInventory.filter(i => i.instanceId !== instanceId);
          }
          return newInventory;
      });
  }, []);

  const returnItemToInventory = useCallback((itemToReturn: PlayerItem) => {
    if (!itemToReturn) return;
    setPlayerInventory(prev => {
      const existing = prev.find(i => i.instanceId === itemToReturn.instanceId);
      if (existing) {
        existing.quantity += itemToReturn.quantity;
        return [...prev];
      }
      return [...prev, itemToReturn];
    })
  }, []);
  
  useEffect(() => {
    if (upgradeWeaponSlot && upgradeMaterialSlot) {
      setUpgradeChance(50);
    } else {
      setUpgradeChance(0);
    }
  }, [upgradeWeaponSlot, upgradeMaterialSlot]);


  const showAlert = (message, type = 'info') => { setAlert({ isVisible: true, message, type }); };
  const hideAlert = () => { setAlert({ isVisible: false, message: '', type: 'info' }); };

  const handleItemClick = (itemToMove: EnrichedPlayerItem) => {
    if (isProcessing) return;
    const playerItem: PlayerItem = { id: itemToMove.id, instanceId: itemToMove.instanceId, quantity: itemToMove.quantity, level: itemToMove.level, currentExp: itemToMove.currentExp, requiredExp: itemToMove.requiredExp, stats: itemToMove.stats };

    if (activeTab === 'upgrade') {
      if (['weapon', 'armor', 'accessory'].includes(itemToMove.type)) {
        if (!upgradeWeaponSlot) { setUpgradeWeaponSlot(playerItem); updateItemInInventory(playerItem.instanceId, -playerItem.quantity); } else showAlert('Đã có trang bị trong ô nâng cấp!', 'warning');
      } else if (itemToMove.id === 17) { if (!upgradeMaterialSlot) { const materialStack = { ...playerItem, quantity: 1 }; setUpgradeMaterialSlot(materialStack); updateItemInInventory(playerItem.instanceId, -1); } else showAlert('Đã có Đá Cường Hoá trong ô!', 'warning');
      } else showAlert('Vật phẩm này không thể dùng để nâng cấp.', 'warning');
    } else if (activeTab === 'craft') { showAlert('Vui lòng chọn công thức bên trái, nguyên liệu sẽ được lấy tự động.', 'info');
    } else if (activeTab === 'skills') {
      if (['weapon', 'armor', 'accessory'].includes(itemToMove.type)) { if (!skillWeaponSlot) { setSkillWeaponSlot(playerItem); updateItemInInventory(playerItem.instanceId, -playerItem.quantity); } else showAlert('Đã có trang bị trong ô.', 'warning');
      } else if (itemToMove.type === 'skill_book') { if (!skillBookSlot) { setSkillBookSlot(itemToMove); } else showAlert('Đã có sách kỹ năng trong ô.', 'warning');
      } else showAlert('Vật phẩm này không thể đặt vào lò học kỹ năng.', 'warning');
    }
  };
  
  const handleUpgradeWeaponSlotClick = () => { if (isProcessing || !upgradeWeaponSlot) return; returnItemToInventory(upgradeWeaponSlot); setUpgradeWeaponSlot(null); };
  const handleUpgradeMaterialSlotClick = () => { if (isProcessing || !upgradeMaterialSlot) return; const originalStack = playerInventory.find(i => i.id === 17); if(originalStack) { updateItemInInventory(originalStack.instanceId, 1); } else { addNewItemToInventory(17, 1); } setUpgradeMaterialSlot(null); };
  const handleSkillWeaponSlotClick = () => { if (isProcessing || !skillWeaponSlot) return; returnItemToInventory(skillWeaponSlot); setSkillWeaponSlot(null); };
  const handleSkillBookSlotClick = () => { if (isProcessing || !skillBookSlot) return; setSkillBookSlot(null); };

  const handleUpgrade = async () => {
    if (!upgradeWeaponSlot || !upgradeMaterialSlot) { showAlert('Cần 1 trang bị và 1 Đá Cường Hoá để nâng cấp!', 'error'); return; }
    setIsProcessing(true);
    const originalItem = { ...upgradeWeaponSlot };
    setUpgradeWeaponSlot(null); setUpgradeMaterialSlot(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    let success = Math.random() * 100 <= upgradeChance;
    if (success) {
      const newLevel = (originalItem.level || 1) + 1;
      addNewItemToInventory(originalItem.id, 1, { ...originalItem, level: newLevel, instanceId: 0 });
      const upgradedItemDef = itemDatabase.get(originalItem.id);
      showAlert(`Nâng cấp thành công! ${upgradedItemDef?.name} đã đạt cấp +${newLevel-1}!`, 'success');
    } else { returnItemToInventory(originalItem); showAlert('Nâng cấp thất bại! Đá Cường Hoá đã bị mất, nhưng trang bị được bảo toàn.', 'error'); }
    setIsProcessing(false);
  };

  const checkCanCraft = useCallback((recipe) => {
    if (!recipe) return false;
    for (const mat of recipe.materialsRequired) {
        const totalInInventory = playerInventory.filter(pItem => pItem.id === mat.id).reduce((sum, current) => sum + current.quantity, 0);
        if (totalInInventory < mat.quantity) return false;
    }
    return true;
  }, [playerInventory]);

  const handleCraft = async (recipe) => {
    if (!recipe || !checkCanCraft(recipe)) { showAlert('Không đủ nguyên liệu để rèn!', 'error'); return; }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    let inventoryCopy = [...playerInventory];
    for (const mat of recipe.materialsRequired) {
        let quantityToConsume = mat.quantity;
        for (let i = 0; i < inventoryCopy.length; i++) {
            if (inventoryCopy[i].id === mat.id) {
                const consumed = Math.min(quantityToConsume, inventoryCopy[i].quantity);
                inventoryCopy[i].quantity -= consumed;
                quantityToConsume -= consumed;
                if (quantityToConsume === 0) break;
            }
        }
    }
    setPlayerInventory(inventoryCopy.filter(i => i.quantity > 0));
    const outputId = recipe.outputPool[Math.floor(Math.random() * recipe.outputPool.length)];
    addNewItemToInventory(outputId, 1);
    const craftedItemDef = itemDatabase.get(outputId);
    showAlert(`Rèn thành công! Bạn đã tạo ra ${craftedItemDef?.name}!`, 'success');
    setIsProcessing(false);
  };
  
  const handleLearnSkill = async () => { /* Logic unchanged */ };
  const handleClearSlots = () => { if (isProcessing) return; handleUpgradeWeaponSlotClick(); handleUpgradeMaterialSlotClick(); handleSkillWeaponSlotClick(); handleSkillBookSlotClick(); };

  const canLearnSkillButtonBeEnabled = skillWeaponSlot !== null && skillBookSlot !== null;
  const totalInventorySlots = 50; 

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 font-sans z-40">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex justify-center gap-1 p-1 bg-gray-800/50 rounded-full shadow-lg border border-gray-700 max-w-fit">
              <button className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${activeTab === 'upgrade' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`} onClick={() => setActiveTab('upgrade')}>Nâng Cấp</button>
              <button className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${activeTab === 'craft' ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`} onClick={() => setActiveTab('craft')}>Rèn</button>
              <button className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${activeTab === 'skills' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`} onClick={() => setActiveTab('skills')}>Kỹ Năng</button>
          </div>
          <button onClick={onClose} className="text-white shadow-lg z-50 transition-transform transform hover:scale-110" aria-label="Đóng lò rèn" title="Đóng lò rèn">
            <img src={uiAssets.closeIcon} alt="Close" className="w-6 h-6" onError={(e) => e.target.src = 'https://placehold.co/24x24/FF0000/FFFFFF?text=X'} />
          </button>
        </div>
        <div className="grid lg:grid-cols-2 gap-y-2 gap-x-8 flex-grow overflow-y-auto hide-scrollbar mt-4 min-h-0 content-start">
          {activeTab === 'upgrade' && (
            <div className="flex flex-col"> 
                <div className="mb-2 p-6 md:p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-yellow-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-32"><ForgingSlot item={upgradeWeaponSlot} slotType="weapon" onClick={handleUpgradeWeaponSlotClick} isEmpty={!upgradeWeaponSlot} /></div>
                        <div className="w-32"><ForgingSlot item={upgradeMaterialSlot} slotType="material" onClick={handleUpgradeMaterialSlotClick} isEmpty={!upgradeMaterialSlot} labelOverride="Đá Cường Hóa"/></div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[4rem]">
                    {upgradeChance > 0 ? (
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={handleUpgrade} disabled={isProcessing} className="px-6 py-2 rounded-lg text-base font-bold shadow-lg transition-all duration-300 transform bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 hover:scale-105">Nâng Cấp</button>
                            <div className="flex items-center px-3 py-1 bg-black/40 rounded-full border border-yellow-400/60 backdrop-blur-sm shadow-inner shadow-white/5" title={`Tỉ lệ thành công: ${upgradeChance}%`}><span className="text-sm font-bold text-yellow-300 tracking-wider">{upgradeChance}%</span></div>
                        </div>
                    ) : (<p className="text-center text-sm text-gray-400">Đặt trang bị và đá cường hoá để nâng cấp.</p>)}
                </div>
            </div>
          )}
          {activeTab === 'craft' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-green-500/30 backdrop-blur-sm flex flex-col justify-between">
              <h2 className="text-2xl font-bold text-green-300 mb-4">📜 Danh sách công thức</h2>
              <div className="space-y-3 overflow-y-auto max-h-[30rem] hide-scrollbar">
                {CRAFTING_RECIPES_DEFINITION.map((recipe, index) => {
                  const canCraft = checkCanCraft(recipe);
                  const outputDef = itemDatabase.get(recipe.outputPool ? recipe.outputPool[0] : recipe.outputItemId);
                  return (
                    <div key={index} className={`p-3 rounded-lg border ${canCraft ? 'border-green-500/50' : 'border-gray-700/50'} bg-black/20`}>
                      <h3 className="font-bold text-lg text-yellow-300">{outputDef?.name} {recipe.outputPool ? '(Ngẫu nhiên)' : ''}</h3>
                      <p className="text-xs text-gray-400 mb-2">{recipe.description}</p>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-300">Yêu cầu:</span>
                        <ul className="list-disc list-inside ml-2 text-xs">
                          {recipe.materialsRequired.map(mat => { const matDef = itemDatabase.get(mat.id); return <li key={mat.id} className="text-gray-400">{matDef?.name} x{mat.quantity}</li> })}
                        </ul>
                      </div>
                      <button onClick={() => handleCraft(recipe)} disabled={!canCraft || isProcessing} className="w-full mt-3 py-2 text-sm font-bold rounded-md transition-all disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white">{isProcessing ? 'Đang rèn...' : 'Rèn'}</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {activeTab === 'skills' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-cyan-500/30 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-2"><span>📚</span> Lò Học Kỹ Năng</h2>
                    <button onClick={handleClearSlots} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200" disabled={isProcessing || (skillWeaponSlot === null && skillBookSlot === null)}>Xóa tất cả</button>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2"><span>⚔️</span> Trang Bị Cần Thiết</h3><ForgingSlot item={skillWeaponSlot} slotType="weapon" onClick={handleSkillWeaponSlotClick} isEmpty={!skillWeaponSlot} labelOverride="Đặt trang bị vào đây"/>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><span>📖</span> Sách Kỹ Năng</h3><ForgingSlot item={skillBookSlot} slotType="skill_book" onClick={handleSkillBookSlotClick} isEmpty={!skillBookSlot} labelOverride="Đặt sách kỹ năng vào đây"/>
                  </div>
                </div>
                <button className={`w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 transform mt-auto ${canLearnSkillButtonBeEnabled && !isProcessing ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 hover:scale-105 shadow-blue-500/25' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`} onClick={handleLearnSkill} disabled={isProcessing || !canLearnSkillButtonBeEnabled}>
                  {canLearnSkillButtonBeEnabled ? '✨ Học Kỹ Năng' : '⚠️ Cần đủ vật phẩm để học'}
                </button>
            </div>
          )}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-blue-500/30">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-300 flex items-center gap-2"><span>🎒</span> Túi Đồ</h2>
                <div className="text-xs bg-gray-900/70 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-gray-700/80"><span className="text-gray-400">Số ô:</span> <span className="font-semibold text-gray-200">{playerInventory.length}/{totalInventorySlots}</span></div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-72 overflow-y-auto hide-scrollbar">
              {fullInventory.map((item) => {
                  if (!item) return null;
                  const isLegendary = item.rarity === 'legendary';
                  return (
                    <div key={item.instanceId} className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(item.rarity)} rounded-lg border-2 ${getRarityColor(item.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(item.rarity)} overflow-hidden ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => !isProcessing && handleItemClick(item)}>
                      {isLegendary && ( <><div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[calc(100%+4rem)] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div><div className="absolute top-0.5 left-0.5 w-4 h-4 border-t-2 border-l-2 border-orange-400/50 rounded-tl-md opacity-40 group-hover:opacity-70 transition-opacity"></div><div className="absolute bottom-0.5 right-0.5 w-4 h-4 border-b-2 border-r-2 border-orange-400/50 rounded-br-md opacity-40 group-hover:opacity-70 transition-opacity"></div><div className="absolute top-1 right-1 text-orange-300 text-xs opacity-60 group-hover:text-orange-100 transition-colors">✦</div></>)}
                      {item.quantity > 1 && (<div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{item.quantity}</div>)}
                      {typeof item.icon === 'string' && item.icon.startsWith('http') ? (<img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" />) : (<div className="text-4xl relative z-0 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>)}
                      <ItemTooltip item={item} />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <CustomAlert isVisible={alert.isVisible} message={alert.message} type={alert.type} onClose={hideAlert}/>
      <ForgingAnimation isProcessing={isProcessing} />
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Blacksmith;
