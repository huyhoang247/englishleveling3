// --- START OF FILE blacksmith.tsx ---

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Thêm useRef

// --- START: DATA IMPORTS ---
import { uiAssets, itemAssets } from './game-assets.ts';
import { itemDatabase, ItemDefinition, ItemRank } from './inventory/item-database.ts';
import { playerInventoryData, PlayerItem } from './inventory/player-inventory-data.ts';
// --- END: DATA IMPORTS ---


// A combined type for easier handling in the UI
type EnrichedPlayerItem = ItemDefinition & PlayerItem;

// --- START: DATA DEFINITIONS (UPDATED WITH NEW RANK SYSTEM) ---

const CRAFTING_RECIPES_DEFINITION = [
  {
    type: 'piece_based',
    pieceId: 47, // Mảnh ghép vũ khí
    materialsRequired: [{ id: 44, quantity: 20 }, { id: 43, quantity: 10 }], // Gỗ, Sắt
    outputPool: [1, 13], // Kiếm gỗ (E), Cung gỗ (E)
    description: 'Rèn một vũ khí Cấp E ngẫu nhiên từ mảnh ghép và nguyên liệu.'
  },
  {
    type: 'piece_based',
    pieceId: 48, // Mảnh ghép áo giáp
    materialsRequired: [{ id: 45, quantity: 15 }, { id: 46, quantity: 10 }], // Da, Vải
    outputPool: [3, 11], // Áo giáp da (E), Găng tay chiến binh (D)
    description: 'Rèn một áo giáp Cấp E/D ngẫu nhiên từ mảnh ghép và nguyên liệu.'
  },
  // We keep specific recipes for potential future use, but the new UI focuses on piece-based crafting.
  {
    type: 'specific',
    outputItemId: 4, // Kiếm sắt (D)
    materialsRequired: [{ id: 43, quantity: 15 }, { id: 44, quantity: 5 }], // Sắt, Gỗ
    description: 'Rèn một thanh Kiếm Sắt Cấp D.'
  }
];

const SKILL_POOLS_BY_RANK = {
  E: [{ name: 'Đấm Thường', icon: '🤜', rarity: 'E' as ItemRank, description: 'Gây sát thương vật lý cơ bản.' }],
  D: [{ name: 'Cú Đấm Mạnh', icon: '💥', rarity: 'D' as ItemRank, description: 'Gây sát thương vật lý đáng kể.' }],
  B: [{ name: 'Chém Xoáy', icon: '🌪️', rarity: 'B' as ItemRank, description: 'Xoay tròn chém kẻ địch xung quanh.' }],
  A: [{ name: 'Sấm Sét', icon: '⚡', rarity: 'A' as ItemRank, description: 'Triệu hồi sấm sét tấn công một mục tiêu.' }],
  S: [{ name: 'Phán Quyết Thần Thánh', icon: '🌟', rarity: 'S' as ItemRank, description: 'Gây sát thương lớn và hồi HP.' }],
  SR: [{ name: 'Thiên Thạch Giáng', icon: '☄️', rarity: 'SR' as ItemRank, description: 'Triệu hồi thiên thạch hủy diệt.' }],
};

const SKILL_BOOKS = [
    { id: 9001, name: 'Sách Kỹ Năng E', type: 'skill_book', icon: '📖', rarity: 'E' as ItemRank, quantity: 1, instanceId: 9001 },
    { id: 9002, name: 'Sách Kỹ Năng D', type: 'skill_book', icon: '📘', rarity: 'D' as ItemRank, quantity: 1, instanceId: 9002 },
    { id: 9003, name: 'Sách Kỹ Năng B', type: 'skill_book', icon: '📙', rarity: 'B' as ItemRank, quantity: 1, instanceId: 9003 },
];

const RANK_ORDER: ItemRank[] = ['E', 'D', 'B', 'A', 'S', 'SR'];

const getNextRank = (currentRank: ItemRank): ItemRank => {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex < RANK_ORDER.length - 1) {
    return RANK_ORDER[currentIndex + 1];
  }
  return currentRank;
};

// --- END: DATA DEFINITIONS ---


// --- START: VISUAL HELPER FUNCTIONS FOR NEW RANK SYSTEM ---

const getRarityDisplayName = (rarity: ItemRank) => `${rarity.toUpperCase()} Rank`;

const getRarityColor = (rarity: ItemRank) => {
    switch(rarity) {
      case 'E': return 'border-gray-500';
      case 'D': return 'border-green-500';
      case 'B': return 'border-blue-500';
      case 'A': return 'border-purple-600';
      case 'S': return 'border-yellow-400';
      case 'SR': return 'border-red-500';
      default: return 'border-gray-500';
    }
};

const getRarityGradient = (rarity: ItemRank) => {
    switch(rarity) {
      case 'E': return 'from-gray-700/70 to-gray-800/70';
      case 'D': return 'from-green-800/80 to-gray-800/70';
      case 'B': return 'from-blue-800/80 to-gray-800/70';
      case 'A': return 'from-purple-800/80 to-gray-800/70';
      case 'S': return 'from-yellow-900/80 via-gray-800/70 to-gray-800/70';
      case 'SR': return 'from-red-800/80 to-gray-800/70';
      default: return 'from-gray-700/70 to-gray-800/70';
    }
};

const getRarityTextColor = (rarity: ItemRank) => {
    switch(rarity) {
      case 'E': return 'text-gray-300';
      case 'D': return 'text-green-400';
      case 'B': return 'text-blue-400';
      case 'A': return 'text-purple-400';
      case 'S': return 'text-yellow-300';
      case 'SR': return 'text-red-400';
      default: return 'text-gray-300';
    }
};

const getRarityGlow = (rarity: ItemRank) => {
    switch(rarity) {
      case 'B': return 'shadow-sm shadow-blue-500/30';
      case 'A': return 'shadow-md shadow-purple-500/40';
      case 'S': return 'shadow-lg shadow-yellow-400/50';
      case 'SR': return 'shadow-xl shadow-red-500/50';
      default: return '';
    }
};

const ItemTooltip = ({ item }: { item: EnrichedPlayerItem }) => (
    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-950 rounded-md border border-gray-700 shadow-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className={`font-bold text-sm mb-0.5 ${getRarityTextColor(item.rarity)}`}>
        {item.name} {item.level ? ` Lv.${item.level}` : ''}
      </div>
      <div className="text-gray-500 capitalize text-xs mb-1">{getRarityDisplayName(item.rarity)} • {item.type}</div>
      <div className="text-gray-400 text-xs">{item.description}</div>
    </div>
);
// --- END: VISUAL HELPER FUNCTIONS ---


// Main Component
const Blacksmith = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('craft');
  const [playerInventory, setPlayerInventory] = useState<PlayerItem[]>(playerInventoryData);
  const [upgradeWeaponSlot, setUpgradeWeaponSlot] = useState<PlayerItem | null>(null);
  const [upgradeMaterialSlot, setUpgradeMaterialSlot] = useState<PlayerItem | null>(null);
  const [skillWeaponSlot, setSkillWeaponSlot] = useState<PlayerItem | null>(null);
  const [skillBookSlot, setSkillBookSlot] = useState<any | null>(null);
  const [craftingPieceSlot, setCraftingPieceSlot] = useState<PlayerItem | null>(null); // New state for crafting
  const [alert, setAlert] = useState({ isVisible: false, message: '', type: 'info' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeChance, setUpgradeChance] = useState(0);

  // --- START: TỐI ƯU SCROLL (GIẢM LAG KHI CUỘN) ---
  const inventoryGridRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const gridElement = inventoryGridRef.current;
    if (!gridElement) return;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    gridElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      gridElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling]);
  // --- END: TỐI ƯU SCROLL ---

  const enrichPlayerItem = useCallback((playerItem: PlayerItem | null): EnrichedPlayerItem | null => {
    if (!playerItem) return null;
    const definition = itemDatabase.get(playerItem.id);
    if (!definition) return null;
    return { ...definition, ...playerItem };
  }, []);

  const fullInventory = useMemo(() => {
    const enriched = playerInventory.map(pItem => enrichPlayerItem(pItem));
    const enrichedBooks = SKILL_BOOKS.map(book => ({ ...book, description: `Sách để học kỹ năng ${getRarityDisplayName(book.rarity)}` }));
    return [...enriched, ...enrichedBooks].filter(Boolean) as (EnrichedPlayerItem | typeof enrichedBooks[0])[];
  }, [playerInventory, enrichPlayerItem]);

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
            instanceId: newInstanceId, id: itemId, quantity, ...overrides
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
          return currentItem.quantity <= 0 ? newInventory.filter(i => i.instanceId !== instanceId) : newInventory;
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
    setUpgradeChance(upgradeWeaponSlot && upgradeMaterialSlot ? 50 : 0);
  }, [upgradeWeaponSlot, upgradeMaterialSlot]);

  const showAlert = (message, type = 'info') => setAlert({ isVisible: true, message, type });
  const hideAlert = () => setAlert({ isVisible: false, message: '', type: 'info' });

  const handleItemClick = (itemToMove: EnrichedPlayerItem) => {
    if (isProcessing) return;
    const playerItem: PlayerItem = { id: itemToMove.id, instanceId: itemToMove.instanceId, quantity: itemToMove.quantity, level: itemToMove.level, currentExp: itemToMove.currentExp, requiredExp: itemToMove.requiredExp, stats: itemToMove.stats };

    if (activeTab === 'upgrade') {
      if (['weapon', 'armor', 'accessory'].includes(itemToMove.type)) {
        if (!upgradeWeaponSlot) { setUpgradeWeaponSlot(playerItem); updateItemInInventory(playerItem.instanceId, -playerItem.quantity); } else showAlert('Đã có trang bị trong ô nâng cấp!', 'warning');
      } else if (itemToMove.id === 17) { if (!upgradeMaterialSlot) { const materialStack = { ...playerItem, quantity: 1 }; setUpgradeMaterialSlot(materialStack); updateItemInInventory(playerItem.instanceId, -1); } else showAlert('Đã có Đá Cường Hoá trong ô!', 'warning');
      } else showAlert('Vật phẩm này không thể dùng để nâng cấp.', 'warning');
    } else if (activeTab === 'craft') {
        if (itemToMove.type === 'piece') {
            if (!craftingPieceSlot) {
                const pieceItem = { ...playerItem, quantity: 1 };
                setCraftingPieceSlot(pieceItem);
                updateItemInInventory(playerItem.instanceId, -1);
            } else {
                showAlert('Đã có mảnh ghép trong ô rèn!', 'warning');
            }
        } else {
            showAlert('Chỉ có thể đặt Mảnh Ghép vào ô này.', 'warning');
        }
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
  const handleCraftingPieceSlotClick = () => { if (isProcessing || !craftingPieceSlot) return; returnItemToInventory(craftingPieceSlot); setCraftingPieceSlot(null); };


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
      showAlert(`Nâng cấp thành công! ${upgradedItemDef?.name} đã lên Lv.${newLevel}!`, 'success');
    } else { returnItemToInventory(originalItem); showAlert('Nâng cấp thất bại! Đá Cường Hoá đã bị mất, nhưng trang bị được bảo toàn.', 'error'); }
    setIsProcessing(false);
  };
  
  // --- START: NEW CRAFTING LOGIC ---
  const activeCraftingRecipe = useMemo(() => {
    if (!craftingPieceSlot) return null;
    return CRAFTING_RECIPES_DEFINITION.find(r => r.type === 'piece_based' && r.pieceId === craftingPieceSlot.id);
  }, [craftingPieceSlot]);

  const craftingMaterialReqs = useMemo(() => {
    if (!activeCraftingRecipe) return [];
    return activeCraftingRecipe.materialsRequired.map(mat => {
        const definition = enrichPlayerItem({ id: mat.id, instanceId: 0, quantity: mat.quantity });
        if (!definition) return null;
        const playerHas = playerInventory.filter(pItem => pItem.id === mat.id).reduce((sum, current) => sum + current.quantity, 0);
        return { ...definition, required: mat.quantity, has: playerHas };
    }).filter(Boolean);
  }, [activeCraftingRecipe, playerInventory, enrichPlayerItem]);
  
  const craftOutputPreview = useMemo(() => {
      if (!activeCraftingRecipe) return null;
      // Show the first item in the pool as a representative example
      const previewItemId = activeCraftingRecipe.outputPool[0];
      const itemDef = itemDatabase.get(previewItemId);
      if (!itemDef) return null;
      return { ...itemDef, instanceId: -1, quantity: 1, isRandom: activeCraftingRecipe.outputPool.length > 1 };
  }, [activeCraftingRecipe]);

  const canCraft = useMemo(() => {
    if (!activeCraftingRecipe || craftingMaterialReqs.some(m => !m)) return false;
    return craftingMaterialReqs.every(mat => mat.has >= mat.required);
  }, [activeCraftingRecipe, craftingMaterialReqs]);

  const handleCraft = async () => {
    if (!canCraft || !activeCraftingRecipe) {
        showAlert('Không đủ nguyên liệu hoặc chưa chọn mảnh ghép!', 'error');
        return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Consume materials
    let inventoryCopy = [...playerInventory];
    for (const mat of activeCraftingRecipe.materialsRequired) {
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

    // Get output
    const outputId = activeCraftingRecipe.outputPool[Math.floor(Math.random() * activeCraftingRecipe.outputPool.length)];
    addNewItemToInventory(outputId, 1);
    const craftedItemDef = itemDatabase.get(outputId);
    
    setCraftingPieceSlot(null);
    showAlert(`Rèn thành công! Bạn đã tạo ra ${craftedItemDef?.name}!`, 'success');
    setIsProcessing(false);
  };
  // --- END: NEW CRAFTING LOGIC ---


  const handleLearnSkill = async () => { if (!skillWeaponSlot || !skillBookSlot) return; showAlert('Học kỹ năng thành công!', 'success'); /* Logic chi tiết ở đây */ };
  const handleClearSlots = () => { if (isProcessing) return; handleUpgradeWeaponSlotClick(); handleUpgradeMaterialSlotClick(); handleSkillWeaponSlotClick(); handleSkillBookSlotClick(); handleCraftingPieceSlotClick(); };

  // --- Sub-Components defined inside Blacksmith ---

  const ForgingSlot = ({ item, slotType, onClick, isEmpty, labelOverride, isPreview = false }) => {
    const enrichedItem = item && item.id >= 9001 ? item : enrichPlayerItem(item);
    const style = {
        weapon: { border: 'border-red-500/50', bg: 'bg-gradient-to-br from-red-900/40 to-red-800/40', hoverBg: 'hover:bg-red-700/30', hoverBorder: 'hover:border-red-400', icon: '⚔️', label: 'Trang Bị'},
        material: { border: 'border-green-500/50', bg: 'bg-gradient-to-br from-green-900/40 to-green-800/40', hoverBg: 'hover:bg-green-700/30', hoverBorder: 'hover:border-green-400', icon: '💎', label: 'Nguyên Liệu'},
        skill_book: { border: 'border-cyan-500/50', bg: 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/40', hoverBg: 'hover:bg-cyan-700/30', hoverBorder: 'hover:border-cyan-400', icon: '📖', label: 'Sách Kỹ Năng' },
        output: { border: 'border-yellow-500/50', bg: 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/40', hoverBg: '', hoverBorder: '', icon: '❔', label: 'Thành Phẩm' },
    }[slotType];
    
    const clickHandler = isPreview ? undefined : onClick;

    return (
      <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all h-32 ${clickHandler ? 'cursor-pointer' : 'cursor-default'} ${style.border} ${style.bg} ${clickHandler ? style.hoverBg : ''} ${clickHandler ? style.hoverBorder : ''} ${enrichedItem && !isEmpty ? 'shadow-lg transform hover:scale-105' : 'border-dashed'} ${isEmpty ? 'animate-pulse' : ''}`} onClick={clickHandler} >
        {enrichedItem && !isEmpty ? (
          <>
            <div className="w-16 h-16 flex items-center justify-center mb-2">{typeof enrichedItem.icon === 'string' && enrichedItem.icon.startsWith('http') ? <img src={enrichedItem.icon} alt={enrichedItem.name} className="max-w-full max-h-full" /> : <div className="text-5xl">{enrichedItem.icon}</div>}</div>
            <span className="font-medium text-center text-white text-sm">{enrichedItem.name.replace(/\s*\(\+\d+\)/, '')} {enrichedItem.level && <span className="font-bold text-yellow-400 ml-1">Lv.{enrichedItem.level}</span>}</span>
            {enrichedItem.quantity > 1 && <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-full">{`x${enrichedItem.quantity}`}</span>}
            <div className={`absolute top-1.5 left-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${getRarityTextColor(enrichedItem.rarity)} ${getRarityColor(enrichedItem.rarity).replace('border-','bg-')}/30`}>{enrichedItem.rarity}</div>
            {enrichedItem.isRandom && <div className="absolute -bottom-2.5 text-xs text-yellow-300 bg-black/50 px-2 py-0.5 rounded-md">Ngẫu nhiên</div>}
          </>
        ) : (
          <div className="text-center"><div className="mb-1 opacity-50 text-5xl">{style.icon}</div><span className="text-gray-400 text-xs font-medium">{labelOverride || style.label}</span></div>
        )}
      </div>
    );
  };
  
  const MaterialRequirementIndicator = ({ material }) => {
    const hasEnough = material.has >= material.required;
    return (
        <div className={`relative flex items-center gap-2 rounded-lg p-2 transition-all w-full text-left bg-black/30 border ${hasEnough ? 'border-gray-700' : 'border-red-600/70'}`}>
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-2xl">{material.icon}</div>
            <div className="flex-grow">
                <div className="text-white text-xs font-semibold -mb-0.5">{material.name}</div>
                <div className={`font-bold text-xs ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>{material.has} / {material.required}</div>
            </div>
        </div>
    );
  };


  const CustomAlert = ({ isVisible, message, onClose, type = 'info' }) => { 
    if (!isVisible) return null; 
    const typeStyles = { 
        success: 'border-green-500 bg-green-900/50 text-green-200', 
        error: 'border-red-500 bg-red-900/50 text-red-200', 
        info: 'border-blue-500 bg-blue-900/50 text-blue-200', 
        warning: 'border-yellow-500 bg-yellow-900/50 text-yellow-200' 
    }; 
    return ( 
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fade-in"> 
            <div className={`p-6 rounded-lg shadow-xl max-w-sm w-full border-2 backdrop-blur-sm ${typeStyles[type]} transform animate-scale-up`}> 
                <p className="text-center mb-4 text-lg font-medium">{message}</p> 
                <button className="w-full py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors" onClick={onClose}>Đồng ý</button> 
            </div> 
        </div> 
    ); 
  };
  
  const ForgingAnimation = ({ isProcessing }) => { 
    if (!isProcessing) return null; 
    return ( 
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99]"> 
            <div className="text-center"> 
                <div className="text-8xl animate-bounce mb-4">🔨</div> 
                <div className="text-white text-2xl font-bold animate-pulse">Đang xử lý...</div> 
            </div> 
        </div> 
    ); 
  };

  const canLearnSkillButtonBeEnabled = skillWeaponSlot !== null && skillBookSlot !== null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 font-sans z-40">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex justify-center gap-1 p-1 bg-gray-800/50 rounded-full shadow-lg border border-gray-700 max-w-fit">
              <button className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${activeTab === 'craft' ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`} onClick={() => setActiveTab('craft')}>Rèn</button>
              <button className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${activeTab === 'upgrade' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`} onClick={() => setActiveTab('upgrade')}>Nâng Cấp</button>
              <button className={`flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 transform ${activeTab === 'skills' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`} onClick={() => setActiveTab('skills')}>Kỹ Năng</button>
          </div>
          <button onClick={onClose} className="text-white shadow-lg z-50 transition-transform transform hover:scale-110" aria-label="Đóng lò rèn" title="Đóng lò rèn">
            <img src={uiAssets.closeIcon} alt="Close" className="w-6 h-6" />
          </button>
        </div>
        <div className="grid lg:grid-cols-2 gap-y-4 gap-x-8 flex-grow overflow-y-auto hide-scrollbar mt-4 min-h-0 content-start">
          {activeTab === 'upgrade' && (
            <div className="flex flex-col"> 
                <div className="mb-4 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-yellow-500/30 backdrop-blur-sm">
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
            <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-green-500/30 backdrop-blur-sm flex flex-col justify-center">
                <div className="flex items-center justify-around gap-2">
                    {/* INPUT SECTION */}
                    <div className="flex flex-col items-center gap-3 w-[160px]">
                        <ForgingSlot item={craftingPieceSlot} slotType="material" onClick={handleCraftingPieceSlotClick} isEmpty={!craftingPieceSlot} labelOverride="Mảnh Ghép"/>
                        <div className="w-full space-y-1.5">
                            {craftingPieceSlot && craftingMaterialReqs.map((mat, i) => mat ? <MaterialRequirementIndicator key={i} material={mat} /> : null)}
                        </div>
                    </div>

                    {/* ACTION/CONNECTOR SECTION */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                       <div className="text-4xl text-gray-500 px-4">➡️</div>
                       <button onClick={handleCraft} disabled={!canCraft || isProcessing} className="px-5 py-2 rounded-lg font-bold shadow-lg transition-all duration-300 transform bg-gradient-to-r from-green-500 to-teal-500 text-white hover:brightness-110 hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:brightness-100 text-sm">
                           {isProcessing ? 'Đang Rèn...' : 'Rèn'}
                       </button>
                    </div>

                    {/* OUTPUT SECTION */}
                    <div className="flex flex-col items-center gap-3 w-[160px]">
                        <ForgingSlot item={craftOutputPreview} slotType="output" isEmpty={!craftOutputPreview} isPreview={true} />
                    </div>
                </div>
                 {!craftingPieceSlot && (<p className="text-center text-sm text-gray-400 mt-4">Đặt một mảnh ghép vào ô bên trái để bắt đầu.</p>)}
            </div>
          )}
          {activeTab === 'skills' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-cyan-500/30 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-2"><span>📚</span> Lò Học Kỹ Năng</h2>
                    <button onClick={handleClearSlots} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors" disabled={isProcessing || (skillWeaponSlot === null && skillBookSlot === null)}>Xóa</button>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-32"><ForgingSlot item={skillWeaponSlot} slotType="weapon" onClick={handleSkillWeaponSlotClick} isEmpty={!skillWeaponSlot} /></div>
                    <div className="w-32"><ForgingSlot item={skillBookSlot} slotType="skill_book" onClick={handleSkillBookSlotClick} isEmpty={!skillBookSlot} /></div>
                  </div>
                </div>
                <button className={`w-full py-3 px-6 font-bold text-lg rounded-xl shadow-xl transition-all duration-300 transform mt-4 ${canLearnSkillButtonBeEnabled && !isProcessing ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:brightness-110 hover:scale-105' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`} onClick={handleLearnSkill} disabled={isProcessing || !canLearnSkillButtonBeEnabled}>
                  {canLearnSkillButtonBeEnabled ? '✨ Học Kỹ Năng' : '⚠️ Cần đủ vật phẩm'}
                </button>
            </div>
          )}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl shadow-2xl border border-blue-500/30">
            <div ref={inventoryGridRef} className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[20rem] sm:max-h-full overflow-y-auto hide-scrollbar pr-2 ${isScrolling ? 'is-scrolling' : ''}`}>
              {fullInventory.map((item) => {
                  if (!item) return null;
                  return (
                    <div key={item.instanceId} className={`group relative w-full aspect-square bg-gradient-to-br ${getRarityGradient(item.rarity)} rounded-lg border-2 ${getRarityColor(item.rarity)} flex items-center justify-center cursor-pointer hover:brightness-125 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ${getRarityGlow(item.rarity)} overflow-hidden will-change-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => !isProcessing && handleItemClick(item)}>
                      {item.quantity > 1 && (<div className="absolute bottom-0.5 right-0.5 bg-black/70 text-gray-100 text-[9px] font-semibold px-1 py-0.5 rounded shadow-md z-10 border border-white/10">x{item.quantity}</div>)}
                      {typeof item.icon === 'string' && item.icon.startsWith('http') ? (<img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2 relative z-0 group-hover:scale-110 transition-transform duration-200" />) : (<div className="text-2xl sm:text-3xl relative z-0 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>)}
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
        .is-scrolling .group:hover {
            transform: none !important;
            filter: none !important;
            --tw-brightness: 1 !important;
        }
        .is-scrolling .group .group-hover\:opacity-100 {
            opacity: 0 !important;
        }
        .is-scrolling .group .group-hover\:scale-110 {
            transform: none !important;
        }

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
